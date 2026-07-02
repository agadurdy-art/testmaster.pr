"""
services.speaking — Speaking Evaluator v2 package
=================================================
Split from the former single-file services/speaking_evaluator.py
(2026-07-02 refactor, zero behavior change):

  transcode.py  — transcode_to_wav (ffmpeg → pydub fallback)
  azure_stt.py  — run_azure_pronunciation, build_user_audio_from_turns
  fluency.py    — compute_fluency, FILLER_PATTERNS
  prompts.py    — prompt loading / template substitution, SpeakingEvaluatorFailure
  llm_eval.py   — the Sonnet evaluation entry points

services/speaking_evaluator.py remains as a thin re-export shim so existing
imports keep working.
"""
from services.speaking.azure_stt import (
    build_user_audio_from_turns,
    run_azure_pronunciation,
)
from services.speaking.fluency import FILLER_PATTERNS, compute_fluency
from services.speaking.llm_eval import (
    CALL_TIMEOUT_SECONDS,
    MAX_ATTEMPTS,
    MAX_TOKENS,
    evaluate_exam_from_transcript,
    evaluate_speaking,
    evaluate_speaking_basic,
    evaluate_speaking_from_transcript,
    evaluate_speaking_fulltest,
    health,
)
from services.speaking.prompts import PROMPT_FILE, SpeakingEvaluatorFailure
from services.speaking.transcode import transcode_to_wav

__all__ = [
    "CALL_TIMEOUT_SECONDS",
    "FILLER_PATTERNS",
    "MAX_ATTEMPTS",
    "MAX_TOKENS",
    "PROMPT_FILE",
    "SpeakingEvaluatorFailure",
    "build_user_audio_from_turns",
    "compute_fluency",
    "evaluate_exam_from_transcript",
    "evaluate_speaking",
    "evaluate_speaking_basic",
    "evaluate_speaking_from_transcript",
    "evaluate_speaking_fulltest",
    "health",
    "run_azure_pronunciation",
    "transcode_to_wav",
]
