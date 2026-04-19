#!/usr/bin/env python3
"""
Azure Speech TTS Batch Audio Generation Script
Generates MP3 audio files for listening assessment questions.
Uses UK neural voices: en-GB-SoniaNeural (female) and en-GB-RyanNeural (male)
"""

import os
import sys
import azure.cognitiveservices.speech as speechsdk
from listening_data import LISTENING_SECTIONS

# Azure Speech Configuration
AZURE_SPEECH_KEY = os.getenv("AZURE_SPEECH_KEY", "1hY5f5IAc41MMosSc3hi2sivkeocOOkJgvoCS1qPGzX5kqSgc3fgJQQJ99BLACqBBLyXJ3w3AAAYACOGa5YK")
AZURE_SPEECH_REGION = os.getenv("AZURE_SPEECH_REGION", "southeastasia")

# Voice mapping
VOICES = {
    "female": "en-GB-SoniaNeural",
    "male": "en-GB-RyanNeural"
}

# Output directory
OUTPUT_DIR = "/app/frontend/public/audio/listening"


def generate_audio(section_id: str, script_text: str, voice_type: str) -> bool:
    """
    Generate MP3 audio file using Azure Speech TTS.
    
    Args:
        section_id: Unique identifier for the audio file
        script_text: Text to convert to speech
        voice_type: 'male' or 'female'
    
    Returns:
        True if successful, False otherwise
    """
    try:
        # Configure speech service
        speech_config = speechsdk.SpeechConfig(
            subscription=AZURE_SPEECH_KEY,
            region=AZURE_SPEECH_REGION
        )
        
        # Set voice
        voice_name = VOICES.get(voice_type, VOICES["female"])
        speech_config.speech_synthesis_voice_name = voice_name
        
        # Set output format to MP3
        speech_config.set_speech_synthesis_output_format(
            speechsdk.SpeechSynthesisOutputFormat.Audio16Khz128KBitRateMonoMp3
        )
        
        # Output file path
        output_path = os.path.join(OUTPUT_DIR, f"{section_id}.mp3")
        
        # Configure audio output to file
        audio_config = speechsdk.audio.AudioOutputConfig(filename=output_path)
        
        # Create synthesizer
        synthesizer = speechsdk.SpeechSynthesizer(
            speech_config=speech_config,
            audio_config=audio_config
        )
        
        # Create SSML for better control over speech
        ssml = f"""
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-GB'>
            <voice name='{voice_name}'>
                <prosody rate='0.95' pitch='+0%'>
                    {script_text}
                </prosody>
            </voice>
        </speak>
        """
        
        # Synthesize speech
        print(f"  Generating audio for {section_id} with {voice_name}...")
        result = synthesizer.speak_ssml_async(ssml).get()
        
        # Check result
        if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
            print(f"  ✓ Successfully generated: {output_path}")
            return True
        elif result.reason == speechsdk.ResultReason.Canceled:
            cancellation = result.cancellation_details
            print(f"  ✗ Generation cancelled: {cancellation.reason}")
            if cancellation.reason == speechsdk.CancellationReason.Error:
                print(f"    Error details: {cancellation.error_details}")
            return False
        else:
            print(f"  ✗ Unknown result: {result.reason}")
            return False
            
    except Exception as e:
        print(f"  ✗ Error generating audio for {section_id}: {str(e)}")
        return False


def main():
    """Generate all listening audio files."""
    print("="*60)
    print("Azure Speech TTS - Listening Audio Generation")
    print("="*60)
    print(f"\nOutput directory: {OUTPUT_DIR}")
    print(f"Azure region: {AZURE_SPEECH_REGION}")
    print(f"Total sections: {len(LISTENING_SECTIONS)}")
    print()
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    success_count = 0
    fail_count = 0
    
    for section in LISTENING_SECTIONS:
        section_id = section["id"]
        script_text = section["script_text"]
        voice_type = section.get("voice", "female")
        
        print(f"\n[{section['title']}] ({section['level']})")
        
        if generate_audio(section_id, script_text, voice_type):
            success_count += 1
        else:
            fail_count += 1
    
    print("\n" + "="*60)
    print(f"Generation Complete: {success_count} succeeded, {fail_count} failed")
    print("="*60)
    
    return fail_count == 0


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
