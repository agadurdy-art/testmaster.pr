"""
Unified speaking evaluation — compatibility shim
================================================
The original 1,301-line module was split into single-responsibility modules
(Faz 1 refactor, 2026-07-02):

    routes/speaking_eval_shared.py    shared helpers + GET /topics
    routes/speaking_eval_authed.py    POST /evaluate, /evaluate-transcript,
                                      /evaluate-liz, /evaluate-exam
    routes/speaking_eval_anon.py      POST /evaluate-anonymous (+ _client_ip)
    routes/speaking_eval_fulltest.py  POST /evaluate-fulltest
    routes/speaking_eval_indexes.py   init_indexes() startup bootstrap

This shim keeps every old import path working (server.py mounts
`router` / `set_db` / `init_indexes` from here; tests and
routes/speaking_misc.py import helpers from here). Importing the endpoint
modules below is what registers their handlers on the shared router — the
import order preserves the original route registration order (topics,
evaluate, evaluate-transcript, evaluate-liz, evaluate-exam,
evaluate-anonymous, evaluate-fulltest).

`set_db()` fans the database handle out to every submodule so the moved
code's module-level `db` globals behave exactly as before.
"""
from __future__ import annotations

from routes import speaking_eval_shared as _shared
from routes import speaking_eval_authed as _authed
from routes import speaking_eval_anon as _anon
from routes import speaking_eval_fulltest as _fulltest
from routes import speaking_eval_indexes as _indexes

# ─── Re-exports (old public + private surface of this module) ────────────────

from routes.speaking_eval_shared import (  # noqa: F401
    _VALID_CONTEXTS,
    _build_eval_request,
    _emit_telemetry,
    _persist_attempt,
    _quota_headers,
    list_speaking_topics,
    router,
)
from routes.speaking_eval_authed import (  # noqa: F401
    evaluate,
    evaluate_exam,
    evaluate_liz,
    evaluate_transcript,
)
from routes.speaking_eval_anon import (  # noqa: F401
    _client_ip,
    evaluate_anonymous,
)
from routes.speaking_eval_fulltest import (  # noqa: F401
    _persist_fulltest_attempt,
    evaluate_fulltest,
)
from routes.speaking_eval_indexes import init_indexes  # noqa: F401

# Names the old module imported at top level (kept importable/patchable from
# the old path, e.g. tests monkeypatch `speaking_unified.evaluate_speaking`).
from services.speaking_evaluator import (  # noqa: F401
    SpeakingEvaluatorFailure,
    build_user_audio_from_turns,
    evaluate_exam_from_transcript,
    evaluate_speaking,
    evaluate_speaking_basic,
    evaluate_speaking_from_transcript,
    evaluate_speaking_fulltest,
)

# Module-level db handle; populated by server.py on startup via set_db().
db = None

_DB_MODULES = (_shared, _authed, _anon, _fulltest, _indexes)


def set_db(database) -> None:
    """Fan the db handle out to every extracted module (each kept its own
    module-level `db` global so the moved code runs verbatim)."""
    global db
    db = database
    for _mod in _DB_MODULES:
        _mod.db = database
