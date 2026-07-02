"""
Admin ops dashboard + data operations
=====================================
Single job: admin-only operations surface — ops overview (funnel/costs/
health), legacy user import (learning_mode aware), enriched-GE-content
migration, and test reseed. Paths carry the explicit /api prefix (were @app
routes); mounted with app.include_router. Admin-gated via auth_session.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import asyncio
import logging
import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Body, Depends, HTTPException, Query

import auth_session

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database

logger = logging.getLogger(__name__)


# One endpoint, six panels. Powers /admin/ops in the frontend so Aga can
# eyeball "is everything still alive?" from a single page (service health,
# anon eval queue, LLM cost, revenue, users, Resend email delivery).
#
# Performance: every panel is an aggregate over a small time window so the
# total payload is well under 100 KB even on busy days. We fan out with
# asyncio.gather so the call returns in roughly the time of the slowest
# query (usually the cost rollup).


@router.get("/api/admin/ops/overview")
async def admin_ops_overview(admin_email: str = Query(...), _admin: dict = Depends(auth_session.require_admin)):
    """Single-call dashboard data. See /admin/ops in the frontend."""
    from security_utils import require_admin_email
    from services import cost_telemetry

    require_admin_email(admin_email)

    now = datetime.now(timezone.utc)
    h24 = now - timedelta(hours=24)
    d7 = now - timedelta(days=7)
    d30 = now - timedelta(days=30)

    # --- 1. Services health --------------------------------------------------
    async def _services():
        services = {}
        # Mongo ping
        try:
            await db.command("ping")
            services["mongo"] = {"ok": True, "note": "ping ok"}
        except Exception as exc:
            services["mongo"] = {"ok": False, "note": str(exc)[:120]}
        # Resend API key configured?
        services["resend"] = {
            "ok": bool(os.getenv("RESEND_API_KEY")),
            "from_email": os.getenv("RESEND_FROM_EMAIL") or "onboarding@resend.dev",
            "note": (
                "Using Resend sandbox — emails to addresses other than the "
                "Resend account owner will be blocked with 403. Verify your "
                "domain in Resend to send to real users."
                if (os.getenv("RESEND_FROM_EMAIL") or "onboarding@resend.dev")
                .endswith("resend.dev")
                else "Verified from-address."
            ),
        }
        # LLM provider keys (just presence — we don't ping the upstream APIs
        # from here because each ping costs a token and adds latency).
        services["anthropic"] = {"ok": bool(os.getenv("ANTHROPIC_API_KEY"))}
        services["openai"] = {"ok": bool(os.getenv("OPENAI_API_KEY"))}
        services["azure_speech"] = {"ok": bool(os.getenv("AZURE_SPEECH_KEY"))}
        services["elevenlabs"] = {"ok": bool(os.getenv("ELEVENLABS_API_KEY"))}
        services["paypal"] = {"ok": bool(os.getenv("PAYPAL_CLIENT_ID"))}
        services["sepay"] = {"ok": bool(os.getenv("SEPAY_API_KEY")) and os.getenv("ENVIRONMENT") == "production"}
        services["r2"] = {"ok": bool(os.getenv("R2_ACCOUNT_ID")) and bool(os.getenv("R2_BUCKET"))}
        services["frontend_base_url"] = {
            "ok": bool(os.getenv("FRONTEND_BASE_URL")),
            "value": os.getenv("FRONTEND_BASE_URL") or "(default: https://www.testmaster.pro)",
        }
        return services

    # --- 2. Anonymous eval queue (score-my-essay async pipeline) -------------
    async def _anon_evals():
        coll = db.anonymous_evaluations
        pending = await coll.count_documents({"status": "pending"})
        complete_24h = await coll.count_documents({
            "status": "complete",
            "completed_at": {"$gte": h24},
        })
        failed_24h = await coll.count_documents({
            "status": "failed",
            "failed_at": {"$gte": h24},
        })
        complete_7d = await coll.count_documents({
            "status": "complete",
            "completed_at": {"$gte": d7},
        })
        # Recent 20 — obfuscate email so screenshots are shareable.
        recent_raw = await coll.find(
            {},
            {
                "_id": 0,
                "email": 1,
                "status": 1,
                "task_type": 1,
                "user_language": 1,
                "created_at": 1,
                "completed_at": 1,
                "failed_at": 1,
                "error": 1,
                "email_delivery": 1,
                "marketing_consent": 1,
                "marketing_audience": 1,
                "result.overall_band": 1,
                "token": 1,
            },
        ).sort("created_at", -1).limit(20).to_list(length=20)

        def _obfuscate(addr):
            if not addr or "@" not in addr:
                return addr
            local, dom = addr.split("@", 1)
            head = local[:2] if len(local) > 2 else local[:1]
            return f"{head}***@{dom}"

        recent = []
        for r in recent_raw:
            band = (r.get("result") or {}).get("overall_band")
            delivery = r.get("email_delivery") or {}
            audience = r.get("marketing_audience") or {}
            recent.append({
                "email_masked": _obfuscate(r.get("email")),
                "status": r.get("status"),
                "task_type": r.get("task_type"),
                "language": r.get("user_language"),
                "created_at": r.get("created_at"),
                "completed_at": r.get("completed_at"),
                "failed_at": r.get("failed_at"),
                "error": (r.get("error") or "")[:120],
                "band": round(float(band), 1) if isinstance(band, (int, float)) else None,
                "email_ok": delivery.get("ok"),
                "email_error": (delivery.get("error") or "")[:120],
                "marketing_consent": bool(r.get("marketing_consent")),
                "audience_ok": audience.get("ok"),
                "audience_skipped": bool(audience.get("skipped")),
                "audience_error": (audience.get("reason") or "")[:120],
                "token": r.get("token"),
            })

        # Marketing roll-up: who opted in and whether the audience sync
        # actually landed. Surfaces silent skip when RESEND_AUDIENCE_ID is
        # unset and broken syncs (invalid id, dupe contact) at a glance.
        marketing_opted = await coll.count_documents({"marketing_consent": True})
        marketing_synced = await coll.count_documents({"marketing_audience.ok": True})

        return {
            "pending": pending,
            "complete_24h": complete_24h,
            "failed_24h": failed_24h,
            "complete_7d": complete_7d,
            "marketing_opted_total": marketing_opted,
            "marketing_synced_total": marketing_synced,
            "recent": recent,
        }

    # --- 3. LLM cost summary (reuse existing telemetry) ----------------------
    async def _cost():
        try:
            week = await cost_telemetry.summarize(days=7)
            month = await cost_telemetry.summarize(days=30)
            return {
                "week": {
                    "total_usd": week.get("total_usd"),
                    "threshold_usd": week.get("threshold_usd"),
                    "by_scope": week.get("by_scope", [])[:10],
                    "by_model": week.get("by_model", [])[:10],
                    "daily": week.get("daily", []),
                },
                "month": {
                    "total_usd": month.get("total_usd"),
                    "by_model": month.get("by_model", [])[:10],
                },
                "available": week.get("available", False),
            }
        except Exception as exc:
            return {"available": False, "error": str(exc)[:200]}

    # --- 4. Revenue (PayPal payment_orders + SePay pending_payments) ---------
    async def _revenue():
        revenue = {"paypal": {"week_count": 0, "month_count": 0, "month_usd": 0.0},
                   "sepay":  {"week_count": 0, "month_count": 0, "month_vnd": 0}}
        # PayPal — `payment_orders` collection holds completed orders.
        try:
            paypal_week = await db.payment_orders.count_documents({
                "status": {"$in": ["COMPLETED", "completed", "captured"]},
                "created_at": {"$gte": d7},
            })
            paypal_month_cursor = db.payment_orders.aggregate([
                {"$match": {
                    "status": {"$in": ["COMPLETED", "completed", "captured"]},
                    "created_at": {"$gte": d30},
                }},
                {"$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "total_usd": {"$sum": "$amount_usd"},
                }},
            ])
            paypal_month_doc = await paypal_month_cursor.to_list(length=1)
            paypal_month = paypal_month_doc[0] if paypal_month_doc else {}
            revenue["paypal"] = {
                "week_count": paypal_week,
                "month_count": paypal_month.get("count", 0),
                "month_usd": round(float(paypal_month.get("total_usd") or 0), 2),
            }
        except Exception as exc:
            revenue["paypal"]["error"] = str(exc)[:120]
        # SePay — `pending_payments` with status='paid'.
        try:
            sepay_week = await db.pending_payments.count_documents({
                "status": "paid",
                "paid_at": {"$gte": d7},
            })
            sepay_month_cursor = db.pending_payments.aggregate([
                {"$match": {"status": "paid", "paid_at": {"$gte": d30}}},
                {"$group": {
                    "_id": None,
                    "count": {"$sum": 1},
                    "total_vnd": {"$sum": "$amount_vnd"},
                }},
            ])
            sepay_month_doc = await sepay_month_cursor.to_list(length=1)
            sepay_month = sepay_month_doc[0] if sepay_month_doc else {}
            revenue["sepay"] = {
                "week_count": sepay_week,
                "month_count": sepay_month.get("count", 0),
                "month_vnd": int(sepay_month.get("total_vnd") or 0),
            }
        except Exception as exc:
            revenue["sepay"]["error"] = str(exc)[:120]
        return revenue

    # --- 5. Users (signups + active + plan breakdown) ------------------------
    async def _users():
        coll = db.users
        total = await coll.count_documents({})
        signups_24h = await coll.count_documents({"created_at": {"$gte": h24}})
        signups_7d = await coll.count_documents({"created_at": {"$gte": d7}})
        # Verified ratio — soft signal for spam vs real signups.
        verified = await coll.count_documents({"email_verified": True})
        # Plan breakdown.
        plan_agg = db.users.aggregate([
            {"$group": {"_id": "$plan", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
        ])
        plan_breakdown = [
            {"plan": d["_id"] or "(unset)", "count": d["count"]}
            for d in await plan_agg.to_list(length=20)
        ]
        # Active in last 7d (last_login_at if present).
        active_7d = await coll.count_documents({"last_login_at": {"$gte": d7}})
        return {
            "total": total,
            "signups_24h": signups_24h,
            "signups_7d": signups_7d,
            "verified": verified,
            "active_7d": active_7d,
            "plan_breakdown": plan_breakdown,
        }

    # --- 6. Resend email delivery (last 24h from anon eval log) --------------
    async def _resend():
        coll = db.anonymous_evaluations
        sent_24h = await coll.count_documents({
            "email_delivery.ok": True,
            "email_delivery.sent_at": {"$gte": h24},
        })
        failed_24h = await coll.count_documents({
            "email_delivery.ok": False,
            "email_delivery.sent_at": {"$gte": h24},
        })
        # Recent 10 deliveries — including the error string so 403 sandbox
        # restrictions surface immediately in the dashboard.
        recent_raw = await coll.find(
            {"email_delivery": {"$exists": True}},
            {
                "_id": 0,
                "email": 1,
                "email_delivery": 1,
            },
        ).sort("email_delivery.sent_at", -1).limit(10).to_list(length=10)

        def _obfuscate(addr):
            if not addr or "@" not in addr:
                return addr
            local, dom = addr.split("@", 1)
            return f"{local[:2]}***@{dom}"

        recent = []
        for r in recent_raw:
            d = r.get("email_delivery") or {}
            recent.append({
                "to_masked": _obfuscate(r.get("email")),
                "ok": d.get("ok"),
                "email_id": d.get("email_id"),
                "error": (d.get("error") or "")[:200],
                "sent_at": d.get("sent_at"),
            })
        return {
            "sent_24h": sent_24h,
            "failed_24h": failed_24h,
            "recent": recent,
        }

    # Run all six panels in parallel. Each handler swallows its own
    # exceptions so one slow query can't take down the whole dashboard.
    services, anon_evals, cost, revenue, users, resend_delivery = await asyncio.gather(
        _services(),
        _anon_evals(),
        _cost(),
        _revenue(),
        _users(),
        _resend(),
        return_exceptions=False,
    )

    return {
        "generated_at": now.isoformat(),
        "services": services,
        "anon_evals": anon_evals,
        "cost": cost,
        "revenue": revenue,
        "users": users,
        "resend": resend_delivery,
    }


# ============ ADMIN: IMPORT LEGACY USERS ============
# One-shot tool for re-hydrating users we lost during the Emergent → Atlas
# move. Accepts a list of user docs in the legacy shape (the same JSON the
# Emergent MongoDB viewer dumps). Each doc is upserted by email so re-runs
# are safe — already-present users get their non-null legacy fields merged
# in, never overwritten with blanks.

@router.post("/api/admin/users/import")
async def admin_users_import(
    payload: dict = Body(...),
    admin_email: str = Query(...),
    learning_mode: str = Query("ielts", regex="^(ielts|general_english)$"),
    dry_run: bool = Query(False),
    _admin: dict = Depends(auth_session.require_admin),
):
    """Bulk-import legacy users. Body shape: {"users": [<legacy user doc>, ...]}.

    learning_mode query param tags every user in the batch with the
    correct V1/V2 product split (memory: project_v1_v2_product_split).
    """
    from security_utils import require_admin_email

    require_admin_email(admin_email)

    raw_users = payload.get("users")
    if not isinstance(raw_users, list) or not raw_users:
        raise HTTPException(status_code=400, detail="Body needs a non-empty 'users' array.")

    inserted = 0
    updated = 0
    skipped = 0
    errors = []
    samples = {"inserted": [], "updated": [], "skipped": []}

    for raw in raw_users:
        try:
            email = (raw.get("email") or "").strip().lower()
            if not email:
                errors.append({"index": raw_users.index(raw), "error": "missing email"})
                continue

            # Normalise created_at: Emergent dumps it as an ISO string but
            # the rest of the app stores it as a real BSON datetime so
            # downstream sorts/queries don't break.
            created_at_raw = raw.get("created_at")
            created_at_dt = None
            if isinstance(created_at_raw, str):
                try:
                    created_at_dt = datetime.fromisoformat(created_at_raw.replace("Z", "+00:00"))
                except ValueError:
                    created_at_dt = None
            elif isinstance(created_at_raw, datetime):
                created_at_dt = created_at_raw

            doc = {
                # Carry every legacy field forward so nothing silently
                # vanishes (test_history, examCredits, paypal_subscription_id, etc.)
                **raw,
                "email": email,
                "learning_mode": learning_mode,
                # Legacy users were active before the migration, so flip
                # the onboarding gate so they aren't asked again.
                "onboarding_complete": bool(raw.get("onboarding_complete", True)),
            }
            if created_at_dt is not None:
                doc["created_at"] = created_at_dt
            # imported_from_legacy_at is useful for the dashboard to
            # distinguish freshly-imported users from native signups.
            doc["imported_from_legacy_at"] = datetime.now(timezone.utc)

            existing = await db.users.find_one(
                {"email": email},
                {"_id": 0, "id": 1, "learning_mode": 1},
            )

            # Cross-product check: if this user already exists under a
            # *different* learning_mode, flag them as "both" instead of
            # overwriting. This catches the "Tina was in the GE batch
            # AND the IELTS batch" case Aga warned about — the old
            # platform had a single signup that fed both products.
            prior_mode = (existing or {}).get("learning_mode")
            if existing and prior_mode and prior_mode != "both" and prior_mode != learning_mode:
                doc["learning_mode"] = "both"

            if dry_run:
                if existing:
                    samples["skipped"].append(email)
                    skipped += 1
                else:
                    samples["inserted"].append(email)
                    inserted += 1
                continue

            if existing:
                # Update path: don't blow away the live user.id (used by
                # any persisted progress, payments, etc). Merge legacy
                # fields on top instead.
                doc.pop("id", None)
                await db.users.update_one({"email": email}, {"$set": doc})
                samples["updated"].append(email)
                updated += 1
            else:
                await db.users.insert_one(doc)
                samples["inserted"].append(email)
                inserted += 1
        except Exception as exc:
            errors.append({
                "email": (raw.get("email") if isinstance(raw, dict) else None),
                "error": str(exc)[:200],
            })

    return {
        "ok": True,
        "dry_run": dry_run,
        "learning_mode": learning_mode,
        "inserted": inserted,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
        "samples": {k: v[:5] for k, v in samples.items()},  # cap response size
    }


# ============ ADMIN: MIGRATE ENRICHED GE CONTENT ============
# Re-runs the enriched/*.json → unified_units + unified_lessons import.
# Idempotent (upsert by unit_id/lesson_id). Pre-launch audit allowlist gate.

@router.post("/api/admin/migrate/enriched")
async def admin_migrate_enriched(
    admin_email: str = Query(...),
    dry_run: bool = Query(False),
    _admin: dict = Depends(auth_session.require_admin),
):
    """One-shot migration of backend/content/enriched/*.json into the
    unified_units + unified_lessons collections. Use ?dry_run=true to
    preview without writing.
    """
    from security_utils import require_admin_email
    from scripts.migrate_enriched_to_unified import run_migration

    require_admin_email(admin_email)
    try:
        summary = await run_migration(db, dry_run=dry_run)
        return {"ok": True, "summary": summary}
    except FileNotFoundError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception as exc:
        logger.exception("enriched migration failed: %s", exc)
        raise HTTPException(status_code=500, detail=f"Migration crashed: {exc}")


# ============ ADMIN: RESEED DATABASE ============

@router.post("/api/admin/reseed-tests")
async def reseed_tests(admin_email: str = Query(...), _admin: dict = Depends(auth_session.require_admin)):
    """Reseed tests collection with latest format (admin only).

    Pre-launch audit (2026-05-16) replaced the hardcoded "emergent2025reseed"
    admin_key with the standard email-allowlist gate used elsewhere. The old
    key was committed to git history; rotate via allowlist instead.
    """
    from security_utils import require_admin_email
    require_admin_email(admin_email)
    
    try:
        import uuid
        logger.info("🌱 Admin triggered reseed of tests...")
        
        # Clear existing tests
        await db.tests.delete_many({})
        
        # Reading Test 2 with summary_completion_block
        reading_test_2 = {
            "id": str(uuid.uuid4()),
            "title": "Academic Reading Practice Test 2",
            "test_type": "reading",
            "duration": 60,
            "passages": [
                {"id": 1, "title": "The Industrial Revolution in Britain", "text": "The Industrial Revolution, which took place from the 18th to 19th centuries, was a period during which predominantly agrarian, rural societies in Europe and America became industrial and urban..."},
                {"id": 2, "title": "Athletes and Stress", "text": "Professional athletes face unique psychological challenges that can significantly impact their performance..."},
                {"id": 3, "title": "An inquiry into the existence of the gifted child", "text": "The question of whether some children are born with exceptional intellectual abilities has long fascinated researchers..."}
            ],
            "questions": [
                # Passage 1 - Sentence Completion
                {"id": 1, "passage": 1, "type": "sentence_completion", "question": "The__(1)__ century saw the beginning of the Industrial Revolution."},
                {"id": 2, "passage": 1, "type": "sentence_completion", "question": "Before the revolution, most societies were__(2)__ and__(3)__."},
                {"id": 3, "passage": 1, "type": "sentence_completion", "question": "The revolution began in__(4)__."},
                {"id": 4, "passage": 1, "type": "true_false_notgiven", "question": "The Industrial Revolution only affected Europe."},
                {"id": 5, "passage": 1, "type": "true_false_notgiven", "question": "Rural societies became urban during this period."},
                {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "The revolution lasted for exactly 100 years."},
                {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "Agriculture was the main economic activity before the revolution."},
                {"id": 8, "passage": 1, "type": "multiple_choice", "question": "What was the main change during the Industrial Revolution?", "options": ["A) Agricultural to industrial", "B) Urban to rural", "C) Industrial to digital", "D) None of the above"]},
                {"id": 9, "passage": 1, "type": "multiple_choice", "question": "Where did the revolution primarily occur?", "options": ["A) Asia", "B) Europe and America", "C) Africa", "D) Australia"]},
                {"id": 10, "passage": 1, "type": "sentence_completion", "question": "The revolution transformed__(10)__ societies."},
                {"id": 11, "passage": 1, "type": "sentence_completion", "question": "People moved from__(11)__ to__(12)__ areas."},
                {"id": 12, "passage": 1, "type": "sentence_completion", "question": "New__(13)__ were developed during this time."},
                {"id": 13, "passage": 1, "type": "true_false_notgiven", "question": "The Industrial Revolution had no impact on society."},
                # Passage 2 - Matching Information
                {"id": 14, "passage": 2, "type": "matching_information", "question": "Which paragraph mentions the psychological impact on athletes?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 15, "passage": 2, "type": "matching_information", "question": "Which paragraph discusses coping mechanisms?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 16, "passage": 2, "type": "matching_information", "question": "Which paragraph talks about performance anxiety?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 17, "passage": 2, "type": "matching_information", "question": "Which paragraph mentions professional support?", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D"]},
                {"id": 18, "passage": 2, "type": "true_false_notgiven", "question": "All athletes experience the same level of stress."},
                {"id": 19, "passage": 2, "type": "true_false_notgiven", "question": "Stress can negatively affect athletic performance."},
                {"id": 20, "passage": 2, "type": "true_false_notgiven", "question": "Professional athletes never need psychological help."},
                {"id": 21, "passage": 2, "type": "multiple_choice", "question": "What is the main topic of the passage?", "options": ["A) Physical training", "B) Psychological challenges", "C) Nutrition", "D) Equipment"]},
                {"id": 22, "passage": 2, "type": "multiple_choice", "question": "How do athletes typically cope with stress?", "options": ["A) Ignoring it", "B) Various coping mechanisms", "C) Quitting sports", "D) Medication only"]},
                {"id": 23, "passage": 2, "type": "sentence_completion", "question": "Athletes face__(23)__ challenges."},
                {"id": 24, "passage": 2, "type": "sentence_completion", "question": "Performance can be affected by__(24)__."},
                {"id": 25, "passage": 2, "type": "sentence_completion", "question": "Support from__(25)__ is important."},
                {"id": 26, "passage": 2, "type": "sentence_completion", "question": "Coping__(26)__ vary among athletes."},
                # Passage 3 - Summary Completion Block + Yes/No/NG + Multiple Choice
                {"id": "27-32", "passage": 3, "type": "summary_completion_block", 
                 "title": "Maryam Mirzakhani",
                 "summary_text": "Maryam Mirzakhani is regarded as **27** .................. in the field of mathematics because she was the only female holder of the prestigious Fields Medal – a record that she retained at the time of her death. However, maths held little **28** .................. for her as a child and in fact her performance was below average until she was **29** .................. by a difficult puzzle that one of her siblings showed her.\n\nLater, as a professional mathematician, she had an inquiring mind and proved herself to be **30** .................. when things did not go smoothly. She said she got the greatest **31** .................. from making ground-breaking discoveries and in fact she was responsible for some extremely **32** .................. mathematical studies.",
                 "blanks": [27, 28, 29, 30, 31, 32],
                 "options": ["A) appeal", "B) determined", "C) intrigued", "D) single", "E) achievement", "F) devoted", "G) involved", "H) unique", "I) innovative", "J) satisfaction", "K) intent"]},
                {"id": 33, "passage": 3, "type": "yes_no_notgiven", "question": "Many people who ended up winning prestigious intellectual prizes only reached an average standard when young."},
                {"id": 34, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein's failures as a young man were due to his lack of confidence."},
                {"id": 35, "passage": 3, "type": "yes_no_notgiven", "question": "It is difficult to reach agreement on whether some children are actually born gifted."},
                {"id": 36, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein was upset by the public's view of his life's work."},
                {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein put his success down to the speed at which he dealt with scientific questions."},
                {"id": 38, "passage": 3, "type": "multiple_choice", "question": "What does Eyre believe is needed for children to equal 'gifted' standards?", "options": ["A) Natural talent", "B) Dedicated practice and support", "C) High IQ scores", "D) Early education"]},
                {"id": 39, "passage": 3, "type": "multiple_choice", "question": "What is the result of Ericsson's research?", "options": ["A) Talent is innate", "B) Practice makes perfect", "C) Genetics determine success", "D) Age is the key factor"]},
                {"id": 40, "passage": 3, "type": "multiple_choice", "question": "What is the main conclusion of the passage?", "options": ["A) Gifted children are born, not made", "B) The debate continues", "C) Environment is everything", "D) Testing is unreliable"]}
            ],
            "answer_key": [
                {"question_id": 1, "answer": "18th"},
                {"question_id": 27, "answer": "H"},
                {"question_id": 28, "answer": "A"},
                {"question_id": 29, "answer": "C"},
                {"question_id": 30, "answer": "B"},
                {"question_id": 31, "answer": "J"},
                {"question_id": 32, "answer": "I"}
            ]
        }
        
        await db.tests.insert_one(reading_test_2)
        logger.info("✅ Reading Test 2 with summary_completion_block seeded")
        
        return {"success": True, "message": "Tests reseeded with summary_completion_block format"}
    except Exception as e:
        logger.error(f"Reseed error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
