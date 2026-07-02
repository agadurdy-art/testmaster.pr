"""
Listening Question Bank Routes (thin shim)
==========================================
Extracted from routes/listening_qb.py (Faz 1 refactor, 2026-07-02).
Single job: keep the historical `routes.listening_qb` import path working.
The actual code now lives in single-responsibility modules:

- routes/listening_qb_common.py — shared router, ElevenLabs key, cache dir
- routes/listening_qb_voices.py — voice-profile config + transcript→turns parsing
- routes/listening_qb_audio.py  — ElevenLabs generation/cache/R2 pipeline + serving
- routes/listening_qb_sets.py   — modules/set serving endpoints
- routes/listening_qb_eval.py   — evaluation + band + root-cause/study-plan builders

Importing the sub-modules below registers every route on the shared router
(same paths + methods as before the split). server.py keeps calling
`from routes.listening_qb import router` unchanged.
"""
# Shared infra (defines the router all sub-modules register on).
from routes import listening_qb_common as _common
from routes import listening_qb_voices as _voices

# Import order mirrors the original file's route declaration order.
from routes import listening_qb_audio as _audio
from routes import listening_qb_sets as _sets
from routes import listening_qb_eval as _eval

# ---- Re-exports: everything the original module exposed publicly ----

from routes.listening_qb_common import (
    router,
    logger,
    ELEVENLABS_API_KEY,
    _BACKEND_DIR,
    AUDIO_CACHE_DIR,
)
from routes.listening_qb_voices import (
    IELTS_VOICE_PROFILES,
    SPEAKER_ROLE_MAPPING,
    get_voice_profile_for_speaker,
    parse_transcript_into_turns,
)
from routes.listening_qb_audio import (
    generate_audio_for_turn,
    create_silence,
    get_cached_audio_path,
    is_audio_cached,
    save_audio_to_cache,
    R2_LISTENING_AUDIO_BASE,
    _r2_audio_url,
    get_cached_audio_url,
    generate_ielts_audio,
    generate_audio_for_transcript,
    serve_cached_audio,
)
from routes.listening_qb_sets import (
    get_listening_question_types,
    get_listening_parts,
    get_listening_band_levels,
    get_listening_topics,
    get_topic_icon,
    get_listening_modules,
    get_listening_set,
    generate_all_audio,
    get_cache_status,
)
from routes.listening_qb_eval import (
    evaluate_listening_answers,
    generate_explanation,
    calculate_listening_band,
    identify_weak_skills,
    build_listening_root_cause_analysis,
    build_listening_study_plan,
    get_listening_lesson_recommendations,
    generate_overall_feedback,
)
