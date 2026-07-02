"""
routes.speaking_practice — Smart Practice speaking evaluation package
=====================================================================
Split from the former single-file routes/speaking_practice_structured.py
(2026-07-02 refactor, zero behavior change):

  _state.py      — the ONE shared APIRouter + db handle (set_db)
  structured.py  — sync POST /evaluate-structured + form parsing/validation +
                   persistence helpers
  jobs.py        — durable job queue: async submit endpoints, worker/grading,
                   GET /jobs/{id}, /attempts, startup sweep, email-grace logic

Importing structured/jobs below registers their endpoints on the shared
router in the same order as the original file (sync endpoint first, then the
async job endpoints). server.py wiring is unchanged: set_db(db) then
app.include_router(router).
"""
from routes.speaking_practice._state import router, set_db  # noqa: F401

# Endpoint registration (order preserved from the original single file).
from routes.speaking_practice import structured as structured  # noqa: F401,E402
from routes.speaking_practice import jobs as jobs  # noqa: F401,E402

from routes.speaking_practice.jobs import (  # noqa: F401,E402
    ensure_job_indexes,
    process_structured_job,
    sweep_pending_jobs,
)

__all__ = [
    "router",
    "set_db",
    "ensure_job_indexes",
    "process_structured_job",
    "sweep_pending_jobs",
    "structured",
    "jobs",
]
