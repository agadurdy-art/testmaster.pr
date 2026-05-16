"""
Async anonymous essay evaluation — Resend email sender.

Sends a hybrid report to the visitor: a concise band summary inline (so they
see it without leaving Gmail/Outlook) plus a tokenized link to the full
interactive report on the website.

Template is intentionally inline-styled and table-free where possible so it
renders cleanly across Gmail, Outlook, Apple Mail, and dark mode. We rely on
Resend's underlying transactional pipeline (already used for verification
and password-reset emails in routes/auth.py), so failures here are logged
and don't roll back the evaluation — the user can still pull the report via
the token URL we persisted on the eval document.
"""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Mapping

import resend

logger = logging.getLogger(__name__)

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev")
FRONTEND_BASE_URL = os.getenv("FRONTEND_BASE_URL", "https://www.testmaster.pro")

# Configure resend module-level so callers don't need to re-initialise.
if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


_CRITERIA_LABELS = [
    ("task_achievement", "Task Achievement"),
    ("coherence_cohesion", "Coherence & Cohesion"),
    ("lexical_resource", "Lexical Resource"),
    ("grammatical_range_accuracy", "Grammar"),
]


def _dot_row(score: float | None) -> str:
    """Render a 0–9 band as a 5-dot progress row (rough quintile)."""
    if score is None:
        return "○○○○○"
    s = max(0.0, min(9.0, float(score)))
    # 0–1.8 → 1 dot, 1.8–3.6 → 2, 3.6–5.4 → 3, 5.4–7.2 → 4, 7.2–9.0 → 5
    filled = max(1, min(5, int(s / 1.8) + 1))
    return "●" * filled + "○" * (5 - filled)


def _top_fixes_html(result: Mapping[str, Any]) -> str:
    """Pull up to 3 highest-priority fixes for the inline summary."""
    fixes = result.get("highest_priority_fixes") or []
    if not fixes:
        # Fallback: use the first 3 major-severity annotations.
        anns = result.get("inline_annotations") or []
        fixes = [
            {"summary": a.get("note") or a.get("evidence_excerpt") or ""}
            for a in anns[:3]
            if a.get("note") or a.get("evidence_excerpt")
        ]
    items = []
    for fix in fixes[:3]:
        if isinstance(fix, str):
            items.append(fix)
        else:
            text = (
                fix.get("summary")
                or fix.get("fix")
                or fix.get("note")
                or fix.get("description")
                or ""
            )
            if text:
                items.append(text)
    if not items:
        return ""
    lis = "".join(
        f'<li style="margin: 6px 0; color: #1f2937; font-size: 14px; line-height: 1.5;">{text}</li>'
        for text in items
    )
    return (
        '<p style="margin: 18px 0 6px; font-size: 13px; font-weight: 600; '
        'color: #047857; letter-spacing: 0.04em; text-transform: uppercase;">Top fixes</p>'
        f'<ul style="margin: 0 0 18px 18px; padding: 0;">{lis}</ul>'
    )


def _band_rows_html(result: Mapping[str, Any]) -> str:
    """Render the 4 IELTS criteria as a vertical list with dot rows."""
    rows = []
    for key, label in _CRITERIA_LABELS:
        score = result.get(key)
        if score is None:
            continue
        rows.append(
            '<tr>'
            f'<td style="padding: 6px 0; color: #374151; font-size: 14px;">{label}</td>'
            f'<td style="padding: 6px 0; color: #111827; font-size: 14px; font-weight: 600; text-align: right; white-space: nowrap;">{float(score):.1f}'
            f'<span style="color: #10b981; margin-left: 10px; letter-spacing: 2px; font-size: 11px;">{_dot_row(score)}</span>'
            '</td>'
            '</tr>'
        )
    if not rows:
        return ""
    return (
        '<table style="width: 100%; border-collapse: collapse; margin: 14px 0;">'
        + "".join(rows)
        + '</table>'
    )


def _summary_html(result: Mapping[str, Any], report_url: str) -> str:
    overall = result.get("overall_band")
    overall_str = f"{float(overall):.1f}" if overall is not None else "—"
    word_count = result.get("word_count") or 0
    return f"""
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111827;">

      <!-- Header -->
      <div style="margin-bottom: 18px;">
        <div style="font-size: 12px; font-weight: 600; color: #047857; letter-spacing: 0.08em; text-transform: uppercase;">Liz · IELTS Ace</div>
        <h1 style="margin: 8px 0 0; font-size: 22px; font-weight: 700; color: #111827; line-height: 1.3;">
          Your essay — estimated <span style="color: #047857;">Band {overall_str}</span>
        </h1>
        <p style="margin: 6px 0 0; font-size: 13px; color: #6b7280;">
          {word_count} words · graded against Cambridge band descriptors.
        </p>
      </div>

      <!-- Band breakdown -->
      <div style="background: #f0fdf4; border: 1px solid #d1fae5; border-radius: 12px; padding: 16px 20px;">
        <p style="margin: 0 0 4px; font-size: 13px; font-weight: 600; color: #047857; letter-spacing: 0.04em; text-transform: uppercase;">Band breakdown</p>
        {_band_rows_html(result)}
      </div>

      <!-- Top fixes -->
      {_top_fixes_html(result)}

      <!-- CTA -->
      <div style="margin: 26px 0 18px;">
        <a href="{report_url}" style="display: inline-block; background: #047857; color: #ffffff; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 15px; font-weight: 600;">
          See full interactive report →
        </a>
        <p style="margin: 10px 0 0; font-size: 12px; color: #6b7280;">
          Every highlight, every rewrite — link valid for 7 days.
        </p>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 26px 0 14px;">
      <p style="font-size: 12px; color: #9ca3af; line-height: 1.5;">
        You received this email because someone (probably you) submitted an essay at testmaster.pro/score-my-essay. One free evaluation per email — keep practising by <a href="{FRONTEND_BASE_URL}/signup" style="color: #047857;">creating an account</a>.
      </p>
    </div>
    """


async def send_essay_evaluation_email(
    to_email: str,
    result: Mapping[str, Any],
    token: str,
) -> dict:
    """Send the hybrid report email. Returns a delivery descriptor:
        { "ok": bool, "email_id": str | None, "error": str | None }

    Failures are logged but do not raise — callers should treat the email
    as a best-effort delivery and rely on the tokenized URL persisting in
    the eval document so the user can still pull the report. The shape
    above lets the admin dashboard surface delivery state (sent / failed
    + Resend message id for tracing).
    """
    if not RESEND_API_KEY:
        logger.warning("Resend not configured; skipping anon eval email send")
        return {"ok": False, "email_id": None, "error": "RESEND_API_KEY not set"}

    overall = result.get("overall_band")
    overall_str = f"{float(overall):.1f}" if overall is not None else "—"
    word_count = result.get("word_count") or 0
    report_url = f"{FRONTEND_BASE_URL}/r/{token}"

    try:
        params = {
            "from": RESEND_FROM_EMAIL,
            "to": [to_email],
            "subject": f"Your IELTS Ace evaluation — Band {overall_str} · {word_count} words",
            "html": _summary_html(result, report_url),
        }
        sent = await asyncio.to_thread(resend.Emails.send, params)
        email_id = sent.get("id") if isinstance(sent, dict) else None
        logger.info(
            "Sent anon eval email to %s, email_id=%s, token=%s",
            to_email,
            email_id or "?",
            token[:8],
        )
        return {"ok": True, "email_id": email_id, "error": None}
    except Exception as exc:
        logger.error("Resend anon eval email exception for %s: %s", to_email, exc)
        return {"ok": False, "email_id": None, "error": str(exc)[:300]}
