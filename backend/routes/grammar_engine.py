"""
Grammar Practice Engine - Backend Routes (compatibility shim)
5-Stage Grammar Learning System:
  1. Learn (Context Discovery + Rule + Common Mistakes + CCQ)
  2. Controlled Practice (Recognition, Gap-Fill, Transform, Order)
  3. Checkpoint Quiz (Mixed types, mastery scoring, diagnostics)
  4. Guided Production (Scaffolded sentence building + AI eval)
  5. Free Production (Open writing + AI evaluation)

Split into single-responsibility modules (Faz 1 refactor, 2026-07-02):
  - grammar_engine_core.py        router / db / cache / LLM plumbing
  - grammar_engine_validators.py  per-stage payload validators
  - grammar_engine_stages.py      5-stage LLM content generation
  - grammar_engine_production.py  evaluation + translate + smart review
  - grammar_engine_progress.py    progress tracking + quiz submission

This shim re-exports the original public surface so existing import
paths (server.py mount, tests) keep working unchanged.
"""

from routes.grammar_engine_core import (  # noqa: F401
    CACHE_COLLECTION,
    call_llm,
    get_cached,
    get_module_grammar,
    logger,
    router,
    set_cached,
    set_db,
)
from routes.grammar_engine_validators import (  # noqa: F401
    PLACEHOLDER_PATTERNS,
    _is_meaningful_text,
    _payload_is_valid,
    _validate_learn_payload,
    _validate_options,
    _validate_practice_payload,
    _validate_prompt_payload,
    _validate_quiz_payload,
)

# Importing these modules registers their endpoints on the shared router.
from routes.grammar_engine_stages import (  # noqa: F401
    get_grammar_learn,
    get_grammar_practice,
    get_grammar_quiz,
    get_guided_prompts,
    get_free_prompts,
)
from routes.grammar_engine_production import (  # noqa: F401
    LANGUAGE_NAMES,
    EvaluateRequest,
    SmartReviewRequest,
    TranslateRequest,
    evaluate_production,
    generate_smart_review,
    translate_text,
)
from routes.grammar_engine_progress import (  # noqa: F401
    GrammarProgressRequest,
    QuizSubmitRequest,
    get_grammar_progress,
    save_grammar_progress,
    submit_grammar_quiz,
)


def __getattr__(name):
    # Keep `routes.grammar_engine.db` live (it is reassigned by set_db).
    if name == "db":
        from routes import grammar_engine_core
        return grammar_engine_core.db
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")
