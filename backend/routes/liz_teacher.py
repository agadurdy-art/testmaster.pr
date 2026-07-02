"""
Liz AI Teacher — aggregation shim.

Faz 1 refactor (2026-07-02): the original 1,612-line module was split into
single-responsibility modules, ~800-line ceiling:

- routes/liz_access.py          — plan access & quota resolution (+ shared
                                  /api/liz APIRouter)
- routes/liz_context.py         — user-context builders & prompt assembly
- routes/liz_chat.py            — chat + streaming endpoints & session mgmt
- routes/liz_speech_homework.py — TTS/STT + homework endpoints

This shim keeps every historical import path working unchanged:

- `from routes.liz_teacher import router` (server.py mount)
- `liz_teacher.db = db` (server.py DB injection — fanned out to every
  liz_* module via the module-class property at the bottom)
- helper/model imports used by tests and other modules

Route paths and methods are byte-identical to the pre-split module.
"""
import sys as _sys
import types as _types
import logging

# liz_access must import first: it owns the shared router the endpoint
# modules register onto. Endpoint registration order (chat block, then
# tts/stt/homework block) mirrors the original single-file order.
from routes import liz_access as _liz_access
from routes import liz_context as _liz_context
from routes import liz_chat as _liz_chat
from routes import liz_speech_homework as _liz_speech_homework

from routes.liz_access import (
    router,
    LIZ_UPGRADE_TARGETS,
    get_liz_user_access,
    get_liz_usage_stats,
    _liz_quota_402_payload,
    ensure_liz_access,
)
from routes.liz_context import (
    LIZ_ALLOWED_HOMEWORK_TYPES,
    LIZ_HISTORY_TURNS,
    LIZ_CONTEXT_MESSAGE_CHARS,
    LIZ_SUPPORTED_FEEDBACK_LANGUAGES,
    NAVIGATE_PATTERN,
    LIZ_SYSTEM_PROMPT,
    HOMEWORK_PATTERN,
    parse_navigate_links,
    _normalize_feedback_language,
    _language_directive,
    _sanitize_homework_text,
    build_recent_conversation_context,
    parse_homework_from_response,
    get_homework_context,
    _get_minimal_profile,
    _recommended_course_for_band,
    _generate_study_plan_via_llm,
    get_or_create_study_plan,
    build_voice_pronunciation_context,
    get_user_context,
)
from routes.liz_chat import (
    ChatRequest,
    NewSessionRequest,
    get_api_key,
    get_liz_model,
    select_chat_model,
    detect_liz_mode,
    get_or_create_session,
    _prepare_chat_context,
    chat_with_liz,
    chat_with_liz_stream,
    create_new_session,
    get_liz_status,
    greet_student,
    get_chat_history,
    get_user_sessions,
)
from routes.liz_speech_homework import (
    TTSRequest,
    HomeworkSubmitRequest,
    HomeworkAssignRequest,
    liz_speak,
    speech_to_text,
    get_homework,
    assign_homework,
    submit_homework,
    delete_homework,
)

logger = logging.getLogger(__name__)

_DB_MODULES = (_liz_access, _liz_context, _liz_chat, _liz_speech_homework)


class _LizTeacherModule(_types.ModuleType):
    """server.py does `liz_teacher.db = db`. Fan that single injection out
    to every extracted module so their verbatim module-level `db` globals
    stay live (the moved function bodies still read a bare `db`)."""

    @property
    def db(self):
        return _liz_access.db

    @db.setter
    def db(self, value):
        for _mod in _DB_MODULES:
            _mod.db = value


_sys.modules[__name__].__class__ = _LizTeacherModule
