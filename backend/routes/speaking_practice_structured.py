"""
Smart Practice structured speaking routes — compatibility shim
==============================================================
The implementation moved to the routes/speaking_practice/ package
(2026-07-02 single-responsibility refactor, zero behavior change):

  routes/speaking_practice/_state.py     — shared APIRouter + db handle
  routes/speaking_practice/structured.py — sync /evaluate-structured endpoint +
                                           form parsing + persistence helpers
  routes/speaking_practice/jobs.py       — durable job queue (async submits,
                                           worker, /jobs/{id}, startup sweep)

This module re-exports everything server.py imports (router, set_db,
ensure_job_indexes, sweep_pending_jobs) plus the rest of the old module
surface. Import from routes.speaking_practice in new code.
"""
from routes.speaking_practice import (  # noqa: F401
    ensure_job_indexes,
    process_structured_job,
    router,
    set_db,
    sweep_pending_jobs,
)
from routes.speaking_practice.structured import (  # noqa: F401
    MAX_QUESTIONS,
    _emit_telemetry,
    _parse_questions_from_form,
    _persist_structured_attempt,
    _quota_headers,
    evaluate_structured,
)
from routes.speaking_practice.jobs import (  # noqa: F401
    EMAIL_GRACE_SECONDS,
    JOB_MAX_AGE_SECONDS,
    JOBS_COLLECTION,
    _grade_cuecard_job,
    _grade_structured_job,
    _job_full,
    _job_summary,
    _maybe_email_result,
    _read_job_audio,
    _result_is_valid,
    _spawn,
    evaluate_cuecard_async,
    evaluate_structured_async,
    get_speaking_job,
    list_speaking_attempts,
)
