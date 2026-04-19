"""
Generate audio files for practice listening questions.
Run with: python generate_practice_audio.py
"""
import asyncio
import os
import sys
import base64
from pathlib import Path

sys.path.insert(0, '/app/backend')

AUDIO_DIR = Path("/app/backend/static/audio/practice_listening")

async def generate_audio_for_question(question, tts):
    """Generate and save audio for a single question."""
    qid = question["id"]
    audio_path = AUDIO_DIR / f"{qid}.mp3"
    
    if audio_path.exists():
        print(f"  SKIP {qid} (already exists)")
        return True
    
    try:
        audio_base64 = await tts.generate_speech_base64(
            text=question["audio_transcript"],
            voice="alloy",
            model="tts-1"
        )
        audio_bytes = base64.b64decode(audio_base64)
        audio_path.write_bytes(audio_bytes)
        size_kb = len(audio_bytes) / 1024
        print(f"  OK {qid} ({size_kb:.0f} KB)")
        return True
    except Exception as e:
        print(f"  FAIL {qid}: {e}")
        return False

async def main():
    from content.practice_listening_data import PRACTICE_LISTENING_QUESTIONS
    from emergentintegrations.llm.openai import OpenAITextToSpeech
    
    api_key = os.getenv("EMERGENT_LLM_KEY")
    if not api_key:
        print("ERROR: EMERGENT_LLM_KEY not set")
        sys.exit(1)
    
    tts = OpenAITextToSpeech(api_key=api_key)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    
    total = len(PRACTICE_LISTENING_QUESTIONS)
    success = 0
    
    print(f"Generating audio for {total} questions...")
    
    for i, q in enumerate(PRACTICE_LISTENING_QUESTIONS):
        print(f"[{i+1}/{total}] Set {q['set']}, Q{q['id']}")
        ok = await generate_audio_for_question(q, tts)
        if ok:
            success += 1
        # Small delay to avoid rate limiting
        await asyncio.sleep(0.3)
    
    print(f"\nDone! {success}/{total} audio files generated.")
    print(f"Audio directory: {AUDIO_DIR}")

if __name__ == "__main__":
    asyncio.run(main())
