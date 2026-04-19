"""
Batch ElevenLabs TTS Generator
Generates audio for all vocabulary words, example sentences, and listening passages.
"""

import os
import hashlib
import asyncio
from pathlib import Path
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

AUDIO_DIR = Path("/app/backend/static/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def cache_key(text: str) -> str:
    return hashlib.md5(text.lower().strip().encode()).hexdigest()


def cached_path(text: str) -> Path:
    return AUDIO_DIR / f"{cache_key(text)}.mp3"


def generate_audio(text: str, tts_client, voice_id: str) -> str:
    """Generate TTS audio and return relative URL. Uses file cache."""
    cp = cached_path(text)
    if cp.exists() and cp.stat().st_size > 1000:
        return f"/static/audio/{cp.name}"

    try:
        from elevenlabs import VoiceSettings
        audio_gen = tts_client.text_to_speech.convert(
            text=text,
            voice_id=voice_id,
            model_id="eleven_multilingual_v2",
            voice_settings=VoiceSettings(
                stability=0.75,
                similarity_boost=0.75,
                style=0.0,
                use_speaker_boost=True,
            ),
        )
        audio_data = b""
        for chunk in audio_gen:
            audio_data += chunk
        if len(audio_data) < 500:
            return ""
        cp.write_bytes(audio_data)
        return f"/static/audio/{cp.name}"
    except Exception as e:
        print(f"  TTS ERROR for '{text[:30]}...': {str(e)[:60]}")
        return ""


def main():
    from elevenlabs import ElevenLabs
    
    api_key = os.environ.get('ELEVENLABS_API_KEY')
    if not api_key:
        print("ERROR: ELEVENLABS_API_KEY not set")
        return

    client = ElevenLabs(api_key=api_key)
    voice_id = "21m00Tcm4TlvDq8ikWAM"  # Rachel - clear female voice

    mongo = MongoClient('mongodb://localhost:27017')
    db = mongo['ielts_database']

    total_generated = 0
    total_cached = 0
    total_failed = 0

    for stage_id in ['stage_1', 'stage_2_starters']:
        lessons = list(db.unified_lessons.find(
            {'stage_id': stage_id},
            {'_id': 0, 'lesson_id': 1, 'activity_flow': 1}
        ).sort('lesson_id', 1))

        print(f"\n{'='*60}")
        print(f"  {stage_id}: {len(lessons)} lessons")
        print(f"{'='*60}")

        for lesson in lessons:
            lid = lesson['lesson_id']
            changed = False

            for a in lesson['activity_flow']:
                d = a.get('data', {})

                # Vocabulary: generate audio for words and example sentences
                if a['type'] == 'vocabulary':
                    for w in d.get('words', []):
                        word = w.get('word', '').strip()
                        if not word:
                            continue

                        # Word audio
                        if not w.get('audio_url'):
                            cp = cached_path(word)
                            if cp.exists() and cp.stat().st_size > 1000:
                                w['audio_url'] = f"/static/audio/{cp.name}"
                                total_cached += 1
                                changed = True
                            else:
                                url = generate_audio(word, client, voice_id)
                                if url:
                                    w['audio_url'] = url
                                    total_generated += 1
                                    changed = True
                                else:
                                    total_failed += 1

                        # Example sentence audio
                        ex = (w.get('example_sentence') or w.get('example', '')).strip()
                        if ex and not w.get('example_audio_url'):
                            cp = cached_path(ex)
                            if cp.exists() and cp.stat().st_size > 1000:
                                w['example_audio_url'] = f"/static/audio/{cp.name}"
                                total_cached += 1
                                changed = True
                            else:
                                url = generate_audio(ex, client, voice_id)
                                if url:
                                    w['example_audio_url'] = url
                                    total_generated += 1
                                    changed = True
                                else:
                                    total_failed += 1

                # Listening: generate audio for passage
                if a['type'] == 'listening_task':
                    audio_text = (d.get('audio_text') or d.get('transcript', '')).strip()
                    if audio_text and not d.get('audio_url'):
                        cp = cached_path(audio_text)
                        if cp.exists() and cp.stat().st_size > 1000:
                            d['audio_url'] = f"/static/audio/{cp.name}"
                            total_cached += 1
                            changed = True
                        else:
                            url = generate_audio(audio_text, client, voice_id)
                            if url:
                                d['audio_url'] = url
                                total_generated += 1
                                changed = True
                            else:
                                total_failed += 1

            if changed:
                db.unified_lessons.update_one(
                    {'lesson_id': lid},
                    {'$set': {'activity_flow': lesson['activity_flow']}}
                )

            done = total_generated + total_cached
            print(f"  {lid}: done={done} (gen={total_generated}, cache={total_cached}, fail={total_failed})")

    print(f"\n{'='*60}")
    print(f"  COMPLETE")
    print(f"  Generated: {total_generated}")
    print(f"  From cache: {total_cached}")
    print(f"  Failed: {total_failed}")
    print(f"{'='*60}")
    mongo.close()


if __name__ == "__main__":
    main()
