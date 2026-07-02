"""
Speaking Evaluator v2 — compatibility shim
==========================================
The implementation moved to the services/speaking/ package (2026-07-02
single-responsibility refactor, zero behavior change):

  services/speaking/transcode.py  — transcode_to_wav (ffmpeg → pydub fallback)
  services/speaking/azure_stt.py  — run_azure_pronunciation, build_user_audio_from_turns
  services/speaking/fluency.py    — compute_fluency, FILLER_PATTERNS
  services/speaking/prompts.py    — prompt loading / substitution, SpeakingEvaluatorFailure
  services/speaking/llm_eval.py   — evaluate_speaking* entry points, health()

This module re-exports every name other modules import from the old path
(routes/speaking_unified.py, routes/speaking_qb.py, routes/liz_teacher.py via
speaking_qb, services/speaking_practice_structured.py,
scripts/calibrate_speaking_eval.py, scripts/smoke_fulltest_eval.py, tests).
Import from services.speaking.* in new code.
"""
from services.speaking.transcode import (  # noqa: F401
    _resolve_ffmpeg_once,
    transcode_to_wav,
)
from services.speaking.azure_stt import (  # noqa: F401
    build_user_audio_from_turns,
    run_azure_pronunciation,
)
from services.speaking.fluency import (  # noqa: F401
    FILLER_PATTERNS,
    compute_fluency,
)
from services.speaking.prompts import (  # noqa: F401
    PROMPT_FILE,
    SpeakingEvaluatorFailure,
    _FENCE_RE,
    _JSON_BLOCK_RE,
    _extract_json,
    _fulltest_system_prompt,
    _fulltest_user_prompt,
    _load_prompt_blocks,
    _substitute,
)
from services.speaking.llm_eval import (  # noqa: F401
    CALL_TIMEOUT_SECONDS,
    MAX_ATTEMPTS,
    MAX_TOKENS,
    _BASIC_AZURE_BLOCK,
    _BASIC_MODE_INSTRUCTION,
    _EXAM_MODE_INSTRUCTION,
    _build_azure_block,
    _build_deep_feedback_bundle,
    _default_whisper_transcribe,
    _format_problem_words,
    _process_one_part_for_fulltest,
    _run_evaluator_llm,
    _run_fulltest_llm,
    evaluate_exam_from_transcript,
    evaluate_speaking,
    evaluate_speaking_basic,
    evaluate_speaking_from_transcript,
    evaluate_speaking_fulltest,
    health,
)
