#!/usr/bin/env python3
"""
Batch email sender for testmaster.pro user segments.

Reads an HTML template (with {{first_name}} and {{unsubscribe_url}}
placeholders), pulls a user segment from Mongo (learning_mode filter),
and sends one personalised email per user via Resend.

Safe-by-default:
  - dry-run is the default; you have to pass --confirm-send to actually
    fire the campaign
  - --limit caps the recipient count so you can smoke-test with 1 user
  - --to <email> overrides the segment entirely and sends to just that
    address (useful for "send me a copy first" testing)
  - idempotent: a JSON log under backend/email_campaigns/<campaign>.sent.json
    keeps track of which users have already received this campaign — re-runs
    skip them
  - throttled to 2 emails / second to stay well under Resend free-tier
    rate limits

Usage examples:

  # 1. Preview to one address only (no DB writes, no segment query)
  backend/.venv/bin/python3 backend/scripts/send_email_campaign.py \\
      --template ~/Desktop/testmaster_email_preview.html \\
      --subject "I rebuilt TestMaster. Would you tell me if it's better?" \\
      --campaign v2_announcement_2026_05 \\
      --to aga.durdy@gmail.com \\
      --confirm-send

  # 2. Dry-run the IELTS segment (prints who would receive, no send)
  backend/.venv/bin/python3 backend/scripts/send_email_campaign.py \\
      --template ~/Desktop/testmaster_email_preview.html \\
      --subject "I rebuilt TestMaster. Would you tell me if it's better?" \\
      --campaign v2_announcement_2026_05 \\
      --segment ielts

  # 3. Real send to the first 5 IELTS users (idempotent — re-run skips)
  backend/.venv/bin/python3 backend/scripts/send_email_campaign.py \\
      --template ~/Desktop/testmaster_email_preview.html \\
      --subject "I rebuilt TestMaster. Would you tell me if it's better?" \\
      --campaign v2_announcement_2026_05 \\
      --segment ielts \\
      --limit 5 \\
      --confirm-send

  # 4. Full IELTS segment send
  backend/.venv/bin/python3 backend/scripts/send_email_campaign.py \\
      --template ~/Desktop/testmaster_email_preview.html \\
      --subject "I rebuilt TestMaster. Would you tell me if it's better?" \\
      --campaign v2_announcement_2026_05 \\
      --segment ielts \\
      --confirm-send

Segments:
  ielts            → users with learning_mode in ("ielts", "both")
  general_english  → users with learning_mode in ("general_english", "both")
  both             → only users tagged "both"
  all              → every user (use with care)

Aga's no-paid-API rule allows the Resend production endpoint because
sending email IS the production work — this is the same key the runtime
already uses for verification + password-reset emails. We do NOT call
any LLM API.
"""
from __future__ import annotations
import argparse
import asyncio
import json
import os
import re
import sys
import time
from pathlib import Path
from urllib.parse import quote

REPO = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(REPO / "backend"))

from dotenv import load_dotenv  # noqa: E402
load_dotenv(REPO / "backend" / ".env")

CAMPAIGN_DIR = REPO / "backend" / "email_campaigns"
# Campaign From address. Hardcoded — we deliberately do NOT read
# RESEND_FROM_EMAIL from env because the Railway env is set to
# Liz <liz@testmaster.pro> for verification/password-reset mail, and
# Aga wants campaign mail to come from a separate inbox (ieltsace@) so
# replies don't drown out transactional Liz mail. Override per-run with
# --from if you need a different address.
DEFAULT_FROM = "TestMaster · IELTS Ace <ieltsace@testmaster.pro>"


def render_template(html: str, *, first_name: str, unsubscribe_url: str) -> str:
    out = html.replace("{{first_name}}", first_name)
    out = out.replace("{{unsubscribe_url}}", unsubscribe_url)
    # Leave any LOGO_URL_HERE placeholder alone — Aga swaps it out manually
    return out


def derive_first_name(user: dict) -> str:
    raw = (user.get("name") or user.get("full_name") or user.get("first_name") or "").strip()
    if raw:
        # Take the first whitespace-delimited token, cap at 24 chars
        return raw.split()[0][:24]
    # Fallback to the local part of the email
    email = user.get("email", "")
    if email and "@" in email:
        local = email.split("@")[0]
        # Strip digits / punctuation that would read as "Hi 1234,"
        local = re.sub(r"[^a-zA-Z]", " ", local).strip()
        if local:
            return local.split()[0].capitalize()[:24]
    return "there"


def load_sent_log(campaign: str) -> dict:
    p = CAMPAIGN_DIR / f"{campaign}.sent.json"
    if not p.exists():
        return {}
    try:
        return json.loads(p.read_text())
    except Exception:
        return {}


def save_sent_log(campaign: str, log: dict) -> None:
    CAMPAIGN_DIR.mkdir(parents=True, exist_ok=True)
    (CAMPAIGN_DIR / f"{campaign}.sent.json").write_text(json.dumps(log, indent=2))


def segment_query(segment: str) -> dict:
    if segment == "ielts":
        return {"learning_mode": {"$in": ["ielts", "both"]}}
    if segment == "general_english":
        return {"learning_mode": {"$in": ["general_english", "both"]}}
    if segment == "both":
        return {"learning_mode": "both"}
    if segment == "all":
        return {}
    raise SystemExit(f"unknown segment: {segment}")


async def fetch_recipients(segment: str, limit: int | None) -> list[dict]:
    # Import here so dry-run on a fresh checkout doesn't require Mongo
    from motor.motor_asyncio import AsyncIOMotorClient
    mongo_url = os.environ.get("MONGO_URL") or os.environ.get("DATABASE_URL")
    if not mongo_url:
        raise SystemExit("MONGO_URL / DATABASE_URL not set in backend/.env")
    db_name = os.environ.get("MONGO_DB_NAME", "testmaster")
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    cursor = db.users.find(
        {**segment_query(segment), "email": {"$exists": True, "$ne": ""}},
        {"_id": 0, "id": 1, "email": 1, "name": 1, "full_name": 1, "first_name": 1, "learning_mode": 1, "email_unsubscribed": 1},
    )
    if limit:
        cursor = cursor.limit(limit)
    rows = await cursor.to_list(length=None)
    # Drop unsubscribed (defensive)
    rows = [r for r in rows if not r.get("email_unsubscribed")]
    client.close()
    return rows


def send_one(*, html: str, subject: str, to_email: str, from_email: str, dry_run: bool) -> tuple[bool, str]:
    """Send via Resend. Returns (ok, info)."""
    if dry_run:
        return True, f"[dry-run] would send to {to_email}"
    import resend
    resend.api_key = os.environ.get("RESEND_API_KEY")
    if not resend.api_key:
        return False, "RESEND_API_KEY missing in env"
    try:
        resp = resend.Emails.send({
            "from": from_email,
            "to": to_email,
            "subject": subject,
            "html": html,
        })
        return True, resp.get("id", "(no id)")
    except Exception as e:
        return False, f"resend error: {e}"


async def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--template", type=Path, required=True, help="Path to the HTML email template")
    ap.add_argument("--subject", required=True, help="Email subject line")
    ap.add_argument("--campaign", required=True, help="Campaign slug for the sent-log (e.g. v2_announcement_2026_05)")
    ap.add_argument("--segment", choices=["ielts", "general_english", "both", "all"],
                    help="Audience segment (required unless --to is given)")
    ap.add_argument("--to", help="Single email override — sends only to this address, ignores --segment")
    ap.add_argument("--from", dest="from_email", default=DEFAULT_FROM,
                    help=f"From address (default: {DEFAULT_FROM})")
    ap.add_argument("--limit", type=int, help="Cap the recipient count")
    ap.add_argument("--throttle", type=float, default=0.5, help="Seconds between sends (default 0.5 = 2/sec)")
    ap.add_argument("--confirm-send", action="store_true",
                    help="REQUIRED to actually call Resend. Otherwise dry-run.")
    args = ap.parse_args()

    if not args.template.exists():
        sys.exit(f"template missing: {args.template}")
    template_html = args.template.read_text()

    dry_run = not args.confirm_send

    # Build recipient list
    if args.to:
        recipients = [{"id": "manual", "email": args.to, "name": "", "learning_mode": "manual"}]
    else:
        if not args.segment:
            sys.exit("--segment or --to is required")
        recipients = await fetch_recipients(args.segment, args.limit)

    sent_log = load_sent_log(args.campaign)

    print(f"\nCampaign : {args.campaign}")
    print(f"Template : {args.template}")
    print(f"Subject  : {args.subject}")
    print(f"From     : {args.from_email}")
    print(f"Segment  : {args.segment or 'manual --to'}")
    print(f"Mode     : {'🟢 LIVE SEND' if not dry_run else '🟡 DRY-RUN (use --confirm-send to fire)'}")
    print(f"Recipients found: {len(recipients)}")
    already = sum(1 for r in recipients if r.get("email") in sent_log)
    print(f"Already received this campaign: {already}")
    print(f"Will send to: {len(recipients) - already}\n")

    ok, fail = 0, 0
    for i, user in enumerate(recipients, 1):
        email = user.get("email")
        if not email:
            continue
        if email in sent_log:
            print(f"  [{i}/{len(recipients)}] = {email} (skip, already sent {sent_log[email]})")
            continue
        first_name = derive_first_name(user)
        unsub = f"mailto:support@testmaster.pro?subject={quote('unsubscribe ' + email)}"
        body = render_template(template_html, first_name=first_name, unsubscribe_url=unsub)
        success, info = send_one(
            html=body, subject=args.subject, to_email=email,
            from_email=args.from_email, dry_run=dry_run,
        )
        if success:
            ok += 1
            print(f"  [{i}/{len(recipients)}] ✓ {email}  ({first_name})  {info}")
            if not dry_run:
                sent_log[email] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
                save_sent_log(args.campaign, sent_log)
        else:
            fail += 1
            print(f"  [{i}/{len(recipients)}] ✗ {email}  → {info}")
        time.sleep(args.throttle)

    print(f"\nDone. {ok} ok, {fail} failed. Log: {CAMPAIGN_DIR / (args.campaign + '.sent.json')}")
    if dry_run:
        print("This was a DRY-RUN. Re-run with --confirm-send to actually send.")


if __name__ == "__main__":
    asyncio.run(main())
