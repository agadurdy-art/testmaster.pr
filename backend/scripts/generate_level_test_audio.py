#!/usr/bin/env python3
"""
Generate Level Test listening audio files using ElevenLabs.
Speed adjusted per level:
- A1-A2 (Band 2.0-3.5): Very slow (0.85)
- A2 (Band 3.5-4.5): Slow (0.88)
- B1 (Band 5.0-5.5): Moderate (0.92)
- B2 (Band 5.5-6.5): Natural (0.96)
- C1-C2 (Band 7.0-9.0): Fast (1.0)
"""

import os
import io
from pydub import AudioSegment
from elevenlabs import ElevenLabs
from elevenlabs import VoiceSettings

ELEVENLABS_API_KEY = os.environ.get("ELEVENLABS_API_KEY")
OUTPUT_DIR = "/app/frontend/public/audio/listening"

# Voice assignments for Level Test
VOICE_IDS = {
    "female": "Xb7hH8MSUJpSbSDYk0k2",   # Alice - British female, clear educator
    "male": "JBFqnCBsd6RMkjVDRZzb",      # George - British male, warm storyteller
}

# Speed settings per level
LEVEL_SPEEDS = {
    "A1-A2": 0.85,   # Very slow for beginners
    "A2": 0.88,      # Slow
    "B1": 0.92,      # Moderate
    "B2": 0.96,      # Near natural
    "C1-C2": 1.0,    # Natural/fast
}

# Listening sections data
LISTENING_SECTIONS = [
    {
        "id": "listening_1",
        "level": "A1-A2",
        "title": "Daily Schedule",
        "voice": "female",
        "script_text": "Hello. My name is Sarah. I wake up at seven o'clock every morning. First, I have breakfast. I eat toast and drink tea. Then I go to work at eight thirty. I work in an office. I finish work at five o'clock. In the evening, I watch television and read books. I go to bed at ten o'clock.",
    },
    {
        "id": "listening_2",
        "level": "A2",
        "title": "At the Train Station",
        "voice": "male",
        "script_text": "Excuse me, can you help me? I need to get to London. Which platform should I go to? Platform three, sir. The next train to London leaves at two fifteen. It takes about one hour and twenty minutes. The ticket costs thirty-two pounds for a single journey, or fifty-eight pounds for a return ticket. Thank you very much. That's very helpful.",
    },
    {
        "id": "listening_3",
        "level": "B1",
        "title": "Museum Tour Introduction",
        "voice": "female",
        "script_text": "Welcome to the Natural History Museum. Before we begin our tour, I'd like to give you some important information. The museum has three floors. On the ground floor, you'll find the dinosaur exhibition, which is our most popular attraction. The first floor contains exhibits about ocean life and marine creatures. On the second floor, we have displays about human evolution and ancient civilizations. Photography is permitted in most areas, but please don't use flash as it can damage some of the older specimens. The tour will last approximately ninety minutes, and we'll have a fifteen-minute break at the café on the first floor.",
    },
    {
        "id": "listening_4",
        "level": "B2",
        "title": "Climate Change Lecture",
        "voice": "male",
        "script_text": "Today I want to discuss the impact of climate change on global food production. According to recent studies, rising temperatures have already begun to affect crop yields in many parts of the world. In particular, wheat production has decreased by approximately fifteen percent in tropical regions over the past decade. However, interestingly, some northern countries have actually seen an increase in agricultural output due to longer growing seasons. Scientists predict that by twenty fifty, we may need to produce up to sixty percent more food to meet global demand. This presents a significant challenge, as traditional farming methods may no longer be sufficient. One potential solution involves the development of drought-resistant crop varieties through genetic modification.",
    },
    {
        "id": "listening_5",
        "level": "C1-C2",
        "title": "Artificial Intelligence Ethics",
        "voice": "female",
        "script_text": "The ethical implications of artificial intelligence in decision-making processes have become increasingly pertinent in contemporary discourse. Consider, for instance, the deployment of algorithmic systems in judicial sentencing. While proponents argue that such systems can eliminate human bias and ensure consistency, critics contend that they may perpetuate historical inequalities embedded in the training data. Furthermore, the opacity of many machine learning models raises fundamental questions about accountability. When an algorithm makes a consequential decision that adversely affects an individual, determining responsibility becomes problematic. This phenomenon, often referred to as the 'black box' problem, challenges our traditional frameworks of legal and moral accountability. Some scholars advocate for a principle of algorithmic transparency, requiring that AI systems provide comprehensible explanations for their outputs.",
    },
]


def generate_audio_with_speed(text: str, voice_id: str, speed: float, output_path: str):
    """Generate audio with specific speed adjustment."""
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    
    # Adjust stability based on speed (slower = more stable)
    stability = 0.6 if speed < 0.9 else 0.5
    
    voice_settings = VoiceSettings(
        stability=stability,
        similarity_boost=0.75,
        style=0.2,  # Less expressive for clarity
        use_speaker_boost=True
    )
    
    print(f"    Generating with speed={speed}, voice={voice_id[:8]}...")
    
    audio_generator = client.text_to_speech.convert(
        text=text,
        voice_id=voice_id,
        model_id="eleven_multilingual_v2",
        voice_settings=voice_settings
    )
    
    # Collect audio data
    audio_data = b""
    for chunk in audio_generator:
        audio_data += chunk
    
    # Apply speed adjustment using pydub
    audio_io = io.BytesIO(audio_data)
    audio = AudioSegment.from_mp3(audio_io)
    
    if speed != 1.0:
        # Speed up or slow down
        # pydub's speedup changes pitch, so we use a different approach
        # For slower speeds, we can use frame_rate adjustment
        if speed < 1.0:
            # Slow down by changing frame rate, then converting back
            new_frame_rate = int(audio.frame_rate * speed)
            slowed = audio._spawn(audio.raw_data, overrides={'frame_rate': new_frame_rate})
            audio = slowed.set_frame_rate(audio.frame_rate)
    
    # Export
    audio.export(output_path, format="mp3", bitrate="128k")
    
    file_size = os.path.getsize(output_path) / 1024
    print(f"    ✅ Saved: {output_path} ({file_size:.1f} KB)")


def main():
    print("Generating Level Test listening audio files with ElevenLabs...")
    print(f"Output directory: {OUTPUT_DIR}\n")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    for section in LISTENING_SECTIONS:
        section_id = section["id"]
        level = section["level"]
        title = section["title"]
        voice = section["voice"]
        text = section["script_text"]
        
        output_file = f"{OUTPUT_DIR}/{section_id}.mp3"
        speed = LEVEL_SPEEDS.get(level, 0.95)
        voice_id = VOICE_IDS.get(voice, VOICE_IDS["female"])
        
        print(f"\n📝 {section_id}: {title}")
        print(f"   Level: {level}, Speed: {speed}")
        
        try:
            generate_audio_with_speed(text, voice_id, speed, output_file)
        except Exception as e:
            print(f"    ❌ Error: {e}")
    
    print("\n" + "="*50)
    print("Done! Level Test audio files generated.")


if __name__ == "__main__":
    main()
