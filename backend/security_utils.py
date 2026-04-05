import json
import os
import re
from typing import Any, Dict, Iterable, List, Optional

import httpx
from fastapi import HTTPException

DEFAULT_ADMIN_EMAILS = [
    "aga.durdy@gmail.com",
    "ieltsace@testmaster.pro",
    "admin@ieltsace.com",
    "stemhousebenluc@gmail.com",
]
ANTI_INFLATION_INSTRUCTION = (
    "Be conservative and evidence-based. Never inflate scores, never guess missing "
    "evidence, and fail the evaluation instead of inventing a band score."
)
ALLOWED_UPLOAD_EXTENSIONS = {".jpg", ".jpeg", ".png", ".pdf"}
INSTRUCTION_LIKE_PATTERNS = [
    r"ignore\s+all\s+previous\s+instructions",
    r"ignore\s+previous\s+instructions",
    r"follow\s+these\s+instructions",
    r"disregard\s+the\s+prompt",
    r"system\s*:",
    r"assistant\s*:",
    r"developer\s*:",
    r"user\s*:",
    r"return\s+only\s+json",
    r"act\s+as\s+",
    r"you\s+are\s+chatgpt",
    r"you\s+are\s+an?\s+ai",
]


def parse_admin_emails() -> List[str]:
    raw_value = os.getenv("ADMIN_EMAILS", "")
    emails = [email.strip().lower() for email in raw_value.split(",") if email.strip()]
    if emails:
        return emails
    return [email.lower() for email in DEFAULT_ADMIN_EMAILS]


def is_admin_email(email: Optional[str]) -> bool:
    if not email:
        return False
    return email.strip().lower() in set(parse_admin_emails())


def require_admin_email(admin_email: Optional[str]) -> str:
    email = (admin_email or "").strip().lower()
    if not is_admin_email(email):
        raise HTTPException(status_code=403, detail="Admin access required.")
    return email


def validate_upload_filename(filename: Optional[str]) -> str:
    if not filename:
        raise HTTPException(status_code=400, detail="A file name is required.")
    extension = os.path.splitext(filename)[1].lower()
    if extension not in ALLOWED_UPLOAD_EXTENSIONS:
        allowed = ", ".join(sorted(ALLOWED_UPLOAD_EXTENSIONS))
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed types: {allowed}.",
        )
    return extension


def sanitize_ai_input(text: Optional[str]) -> str:
    if not text:
        return ""

    cleaned_lines: List[str] = []
    for raw_line in text.splitlines():
        line = raw_line.strip()
        if not line:
            cleaned_lines.append("")
            continue

        should_drop = any(
            re.search(pattern, line, flags=re.IGNORECASE)
            for pattern in INSTRUCTION_LIKE_PATTERNS
        )
        if should_drop:
            continue
        cleaned_lines.append(raw_line)

    cleaned = "\n".join(cleaned_lines)
    cleaned = re.sub(r"<\|.*?\|>", "", cleaned)
    cleaned = re.sub(r"\s{3,}", " ", cleaned)
    return cleaned.strip()


def count_words(text: Optional[str]) -> int:
    return len(re.findall(r"\b\w+\b", text or ""))


def enforce_min_words(text: Optional[str], minimum: int, field_name: str) -> int:
    word_count = count_words(text)
    if word_count < minimum:
        raise HTTPException(
            status_code=400,
            detail=f"{field_name} must contain at least {minimum} words.",
        )
    return word_count


def clamp_band_value(value: Any) -> Any:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return value
    bounded = min(9.0, max(1.0, numeric))
    return round(bounded * 2) / 2


def clamp_band_scores(payload: Any) -> Any:
    if isinstance(payload, list):
        return [clamp_band_scores(item) for item in payload]
    if isinstance(payload, dict):
        clamped: Dict[str, Any] = {}
        for key, value in payload.items():
            if isinstance(value, (dict, list)):
                clamped[key] = clamp_band_scores(value)
                continue
            lowered = key.lower()
            if "band" in lowered or lowered == "score":
                clamped[key] = clamp_band_value(value)
            else:
                clamped[key] = value
        return clamped
    return payload


async def verify_paypal_webhook_signature(
    *,
    request_body: Dict[str, Any],
    request_headers: Dict[str, str],
    api_base: str,
    access_token: str,
    webhook_id: str,
) -> None:
    required_headers = {
        "paypal-auth-algo": request_headers.get("paypal-auth-algo"),
        "paypal-cert-url": request_headers.get("paypal-cert-url"),
        "paypal-transmission-id": request_headers.get("paypal-transmission-id"),
        "paypal-transmission-sig": request_headers.get("paypal-transmission-sig"),
        "paypal-transmission-time": request_headers.get("paypal-transmission-time"),
    }
    if not webhook_id:
        raise HTTPException(status_code=503, detail="PayPal webhook verification is not configured.")
    if not all(required_headers.values()):
        raise HTTPException(status_code=400, detail="Missing PayPal verification headers.")

    payload = {
        "auth_algo": required_headers["paypal-auth-algo"],
        "cert_url": required_headers["paypal-cert-url"],
        "transmission_id": required_headers["paypal-transmission-id"],
        "transmission_sig": required_headers["paypal-transmission-sig"],
        "transmission_time": required_headers["paypal-transmission-time"],
        "webhook_id": webhook_id,
        "webhook_event": request_body,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{api_base}/v1/notifications/verify-webhook-signature",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            content=json.dumps(payload),
        )

    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail="PayPal webhook verification failed.")

    verification = response.json()
    if verification.get("verification_status") != "SUCCESS":
        raise HTTPException(status_code=401, detail="Invalid PayPal webhook signature.")
