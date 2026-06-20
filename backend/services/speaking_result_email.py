"""
Speaking result ready — Resend email sender.
===========================================

When a speaking evaluation finishes in the background AFTER the candidate has
already left the page (durable job queue, services side of
routes/speaking_practice_structured.py), we email them a link to the result so
nothing they recorded is silently stranded.

Mirrors services/anon_eval_email.py: module-level Resend init, send on a worker
thread, best-effort (never raises into the caller).
"""
from __future__ import annotations

import asyncio
import logging
import os
from typing import Any, Mapping, Optional

logger = logging.getLogger(__name__)

try:
    import resend  # type: ignore
except Exception:  # pragma: no cover - dependency always present in prod
    resend = None  # noqa: N816

RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL", "Liz at IELTS Ace <liz@testmaster.pro>")
RESEND_REPLY_TO = os.getenv("RESEND_REPLY_TO", "support@testmaster.pro")
FRONTEND_BASE_URL = (os.getenv("FRONTEND_BASE_URL") or "https://testmaster.pro").rstrip("/")

if resend is not None and RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY


def _overall(result: Mapping[str, Any]) -> str:
    try:
        val = (result.get("scores") or {}).get("overall")
        return f"{float(val):.1f}" if val is not None else "—"
    except Exception:
        return "—"


async def send_speaking_result_email(
    *,
    to_email: str,
    name: Optional[str],
    part: str,
    result: Mapping[str, Any],
    job_id: str,
) -> bool:
    """Send the 'your speaking result is ready' email. Returns True if sent."""
    if resend is None or not RESEND_API_KEY or not to_email:
        return False

    overall = _overall(result)
    part_label = {"part1": "Part 1", "part2": "Part 2", "part3": "Part 3"}.get(part, "Speaking")
    report_url = f"{FRONTEND_BASE_URL}/my-results?job={job_id}"
    hello = f"Hi {name}," if name else "Hi,"

    html = f"""
    <div style="font-family:Inter,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0f172a">
      <p style="font-size:15px">{hello}</p>
      <p style="font-size:15px">
        Your IELTS <b>{part_label}</b> speaking answers have been graded — even though you
        stepped away, Liz finished marking them.
      </p>
      <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:14px;padding:18px;text-align:center;margin:18px 0">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#047857;font-weight:700">Overall band</div>
        <div style="font-size:38px;font-weight:800;color:#065f46;line-height:1.1">{overall}</div>
      </div>
      <p style="text-align:center;margin:22px 0">
        <a href="{report_url}" style="background:#059669;color:#fff;text-decoration:none;font-weight:700;padding:12px 26px;border-radius:999px;display:inline-block">
          See your full feedback →
        </a>
      </p>
      <p style="font-size:12px;color:#64748b">
        You can always find every result under “My results” in the app.
      </p>
    </div>
    """

    params = {
        "from": RESEND_FROM_EMAIL,
        "to": [to_email],
        "reply_to": RESEND_REPLY_TO,
        "subject": f"Your IELTS {part_label} result is ready — Band {overall}",
        "html": html,
    }
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        return True
    except Exception as exc:  # noqa: BLE001
        logger.warning("speaking result email failed for %s: %s", to_email, exc)
        return False
