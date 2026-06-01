#!/usr/bin/env python3
"""
Regenerate Level Test listening audio with improved voices and dialogue support.
This script:
1. Generates Section 2 as a two-speaker dialogue
2. Uses more natural sounding voice settings
3. Adjusts speed per level
"""

import os
import sys
import io
from pydub import AudioSegment
from elevenlabs import ElevenLabs, VoiceSettings

# SECURITY (audit F07): never hardcode credentials. Read from env. The
# previously committed key MUST be rotated in the ElevenLabs dashboard.
ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
if not ELEVENLABS_API_KEY:
    raise SystemExit("Set ELEVENLABS_API_KEY in the environment before running this script.")
OUTPUT_DIR = os.environ.get(
    "LISTENING_AUDIO_DIR",
    str(__import__("pathlib").Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "audio" / "listening"),
)

# Optimized voice assignments - more natural sounding
VOICE_IDS = {
    # British voices (most natural for IELTS)
    "british_female": "pFZP5JQG7iQjIQuC4Bku",     # Lily - velvety, most feminine
    "british_male": "JBFqnCBsd6RMkjVDRZzb",       # George - warm storyteller
    "british_female_2": "Xb7hH8MSUJpSbSDYk0k2",   # Alice - clear educator
    "british_male_2": "onwK4e9ZLuTAKqWW03F9",     # Daniel - broadcaster
    
    # American voices
    "american_female": "EXAVITQu4vr4xnSDxMaL",    # Sarah - mature, reassuring
    "american_male": "nPczCjzI2devNBz1zQrb",      # Brian - deep, comforting
}

# Speaker role to voice mapping
SPEAKER_VOICE_MAP = {
    "Passenger": "american_female",   # Sarah - natural conversational
    "Staff": "british_male_2",        # Daniel - professional
}

# Level speed settings
LEVEL_SPEEDS = {
    "A1-A2": 0.85,
    "A2": 0.88,
    "B1": 0.92,
    "B2": 0.96,
    "C1-C2": 1.0,
}

# Section definitions
LISTENING_SECTIONS = [
    {
        "id": "listening_1",
        "level": "A1-A2",
        "title": "Daily Schedule",
        "type": "monologue",
        "voice": "british_female",  # Lily - warm, feminine
        "script_text": "Hello. My name is Sarah. I wake up at seven o'clock every morning. First, I have breakfast. I eat toast and drink tea. Then I go to work at eight thirty. I work in an office. I finish work at five o'clock. In the evening, I watch television and read books. I go to bed at ten o'clock.",
    },
    {
        "id": "listening_2",
        "level": "A2",
        "title": "At the Train Station",
        "type": "dialogue",
        "script_text": """Passenger: Excuse me, can you help me? I need to get to London. Which platform should I go to?
Staff: Platform three, sir. The next train to London leaves at two fifteen.
Passenger: Okay. And how long does the journey take?
Staff: It takes about one hour and twenty minutes.
Passenger: I see. How much is a ticket?
Staff: The ticket costs thirty-two pounds for a single journey, or fifty-eight pounds for a return ticket.
Passenger: I'll have a return ticket please.
Staff: Certainly. That's fifty-eight pounds. Here's your ticket.
Passenger: Thank you very much. That's very helpful.""",
    },
    {
        "id": "listening_3",
        "level": "B1",
        "title": "Museum Tour Introduction",
        "type": "monologue",
        "voice": "british_female",  # Lily - natural guide voice
        "script_text": "Welcome to the Natural History Museum. Before we begin our tour, I'd like to give you some important information. The museum has three floors. On the ground floor, you'll find the dinosaur exhibition, which is our most popular attraction. The first floor contains exhibits about ocean life and marine creatures. On the second floor, we have displays about human evolution and ancient civilizations. Photography is permitted in most areas, but please don't use flash as it can damage some of the older specimens. The tour will last approximately ninety minutes, and we'll have a fifteen-minute break at the café on the first floor.",
    },
    {
        "id": "listening_4",
        "level": "B2",
        "title": "Climate Change Lecture",
        "type": "monologue",
        "voice": "british_male",  # George - engaging storyteller
        "script_text": "Today I want to discuss the impact of climate change on global food production. According to recent studies, rising temperatures have already begun to affect crop yields in many parts of the world. In particular, wheat production has decreased by approximately fifteen percent in tropical regions over the past decade. However, interestingly, some northern countries have actually seen an increase in agricultural output due to longer growing seasons. Scientists predict that by twenty fifty, we may need to produce up to sixty percent more food to meet global demand. This presents a significant challenge, as traditional farming methods may no longer be sufficient. One potential solution involves the development of drought-resistant crop varieties through genetic modification.",
    },
    {
        "id": "listening_5",
        "level": "C1-C2",
        "title": "Artificial Intelligence Ethics",
        "type": "monologue",
        "voice": "british_female_2",  # Alice - clear, educational
        "script_text": "The ethical implications of artificial intelligence in decision-making processes have become increasingly pertinent in contemporary discourse. Consider, for instance, the deployment of algorithmic systems in judicial sentencing. While proponents argue that such systems can eliminate human bias and ensure consistency, critics contend that they may perpetuate historical inequalities embedded in the training data. Furthermore, the opacity of many machine learning models raises fundamental questions about accountability. When an algorithm makes a consequential decision that adversely affects an individual, determining responsibility becomes problematic. This phenomenon, often referred to as the 'black box' problem, challenges our traditional frameworks of legal and moral accountability. Some scholars advocate for a principle of algorithmic transparency, requiring that AI systems provide comprehensible explanations for their outputs.",
    },
]


def synthesize_text(client: ElevenLabs, text: str, voice_id: str) -> bytes:
    """Generate audio for text using natural voice settings."""
    voice_settings = VoiceSettings(
        stability=0.35,           # Lower = more natural variation
        similarity_boost=0.85,    # High = closer to natural voice
        style=0.45,               # More expressiveness
        use_speaker_boost=True    # Enhanced clarity
    )
    
    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings
    )
    
    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk
    
    return audio_data


def parse_dialogue(script_text: str):
    """Parse dialogue into turns."""
    turns = []
    for line in script_text.strip().split('\n'):
        line = line.strip()
        if not line or ':' not in line:
            continue
        parts = line.split(':', 1)
        if len(parts) == 2:
            speaker = parts[0].strip()
            text = parts[1].strip()
            if speaker and text:
                turns.append({"speaker": speaker, "text": text})
    return turns


def generate_dialogue_audio(client: ElevenLabs, script_text: str) -> bytes:
    """Generate multi-speaker dialogue audio."""
    turns = parse_dialogue(script_text)
    
    if not turns:
        raise ValueError("No dialogue turns found")
    
    combined = AudioSegment.empty()
    
    for i, turn in enumerate(turns):
        speaker = turn["speaker"]
        text = turn["text"]
        
        # Get voice for speaker
        voice_key = SPEAKER_VOICE_MAP.get(speaker, "british_female")
        voice_id = VOICE_IDS.get(voice_key, VOICE_IDS["british_female"])
        
        print(f"    {speaker}: {text[:40]}... (voice: {voice_key})")
        
        # Generate audio for this turn
        audio_bytes = synthesize_text(client, text, voice_id)
        
        # Convert to AudioSegment
        audio_io = io.BytesIO(audio_bytes)
        segment = AudioSegment.from_mp3(audio_io)
        
        # Add to combined audio with pause
        combined += segment
        
        # Add pause between turns (except last)
        if i < len(turns) - 1:
            pause_ms = 350 if turn["text"].endswith('?') else 250
            combined += AudioSegment.silent(duration=pause_ms)
    
    # Export
    output = io.BytesIO()
    combined.export(output, format="mp3", bitrate="128k")
    return output.getvalue()


def apply_speed(audio_bytes: bytes, speed: float) -> bytes:
    """Apply speed adjustment to audio."""
    if speed == 1.0:
        return audio_bytes
    
    audio_io = io.BytesIO(audio_bytes)
    audio = AudioSegment.from_mp3(audio_io)
    
    if speed < 1.0:
        # Slow down
        new_frame_rate = int(audio.frame_rate * speed)
        slowed = audio._spawn(audio.raw_data, overrides={'frame_rate': new_frame_rate})
        audio = slowed.set_frame_rate(audio.frame_rate)
    
    output = io.BytesIO()
    audio.export(output, format="mp3", bitrate="128k")
    return output.getvalue()


def main():
    print("=" * 60)
    print("Regenerating Level Test Audio with Improved Voices")
    print("=" * 60)
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    
    for section in LISTENING_SECTIONS:
        section_id = section["id"]
        level = section["level"]
        title = section["title"]
        section_type = section["type"]
        speed = LEVEL_SPEEDS.get(level, 0.95)
        
        output_file = f"{OUTPUT_DIR}/{section_id}.mp3"
        
        print(f"\n📝 {section_id}: {title}")
        print(f"   Level: {level}, Type: {section_type}, Speed: {speed}")
        
        try:
            if section_type == "dialogue":
                print("   Generating multi-speaker dialogue...")
                audio_bytes = generate_dialogue_audio(client, section["script_text"])
            else:
                voice_key = section.get("voice", "british_female")
                voice_id = VOICE_IDS.get(voice_key, VOICE_IDS["british_female"])
                print(f"   Generating monologue with voice: {voice_key}")
                audio_bytes = synthesize_text(client, section["script_text"], voice_id)
            
            # Apply speed adjustment
            if speed != 1.0:
                print(f"   Applying speed: {speed}")
                audio_bytes = apply_speed(audio_bytes, speed)
            
            # Save
            with open(output_file, 'wb') as f:
                f.write(audio_bytes)
            
            file_size = os.path.getsize(output_file) / 1024
            print(f"   ✅ Saved: {output_file} ({file_size:.1f} KB)")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
            import traceback
            traceback.print_exc()
    
    print("\n" + "=" * 60)
    print("Done! Level Test audio files regenerated.")
    print("=" * 60)


if __name__ == "__main__":
    main()
