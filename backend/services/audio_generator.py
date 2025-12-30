"""
Full Test Mode Audio Generation Service
========================================
Generates IELTS-style audio for Listening and Speaking sections.

Uses ElevenLabs v3 API with strict voice settings for exam realism:
- No call-center sweetness
- No over-politeness
- Natural British/Australian accents
- Different voices for different speakers
- Proper pausing between turns
"""

import os
import asyncio
import logging
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import hashlib
import json
from datetime import datetime, timezone

from elevenlabs import ElevenLabs, VoiceSettings

logger = logging.getLogger(__name__)

# ElevenLabs Voice IDs (Pre-selected for IELTS exam realism)
# Using professional, neutral voices - no overly enthusiastic tones
VOICE_PROFILES = {
    # British voices for Academic tests
    "british_male_professional": {
        "voice_id": "JBFqnCBsd6RMkjVDRZzb",  # George - British, warm storyteller
        "name": "George",
        "accent": "British",
        "settings": VoiceSettings(stability=0.75, similarity_boost=0.75, style=0.0, use_speaker_boost=True)
    },
    "british_female_professional": {
        "voice_id": "Xb7hH8MSUJpSbSDYk0k2",  # Alice - British, clear educator
        "name": "Alice",
        "accent": "British",
        "settings": VoiceSettings(stability=0.75, similarity_boost=0.75, style=0.0, use_speaker_boost=True)
    },
    "british_male_academic": {
        "voice_id": "JBFqnCBsd6RMkjVDRZzb",  # George - British professional
        "name": "George",
        "accent": "British",
        "settings": VoiceSettings(stability=0.80, similarity_boost=0.70, style=0.0, use_speaker_boost=True)
    },
    "british_female_young": {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",  # Sarah - mature, reassuring
        "name": "Sarah",
        "accent": "British",
        "settings": VoiceSettings(stability=0.70, similarity_boost=0.75, style=0.1, use_speaker_boost=True)
    },
    "british_male_young": {
        "voice_id": "IKne3meq5aSn9XLyUdCD",  # Charlie - Australian but young
        "name": "Charlie",
        "accent": "Australian",
        "settings": VoiceSettings(stability=0.70, similarity_boost=0.75, style=0.1, use_speaker_boost=True)
    },
    # Examiner voice for Speaking section
    "examiner": {
        "voice_id": "JBFqnCBsd6RMkjVDRZzb",  # George - British, neutral, professional
        "name": "Examiner",
        "accent": "British",
        "settings": VoiceSettings(stability=0.85, similarity_boost=0.70, style=0.0, use_speaker_boost=True)
    }
}

# Speaker assignments for different listening parts
LISTENING_SPEAKER_MAP = {
    # Academic Set A speakers
    "part_1": {
        "Customer": "british_female_young",
        "Receptionist": "british_female_professional"
    },
    "part_2": {
        "Librarian": "british_female_professional",
        "default": "british_female_professional"
    },
    "part_3": {
        "Dr. Williams": "british_male_academic",
        "Tutor (Dr. Williams)": "british_male_academic",
        "Student 1 (Emma)": "british_female_young",
        "Emma": "british_female_young",
        "Student 2 (James)": "british_male_young",
        "James": "british_male_young"
    },
    "part_4": {
        "Professor": "british_male_academic",
        "default": "british_male_academic"
    }
}

# Speaker assignments for General Training test
GENERAL_LISTENING_SPEAKER_MAP = {
    "part_1": {
        "Staff": "british_female_professional",
        "New Member": "british_male_young",
        "Member": "british_male_young"
    },
    "part_2": {
        "Centre Manager": "british_female_professional",
        "Patricia": "british_female_professional",
        "default": "british_female_professional"
    },
    "part_3": {
        "Sarah": "british_female_young",
        "Michael": "british_male_young"
    },
    "part_4": {
        "Lecturer": "british_male_academic",
        "default": "british_male_academic"
    }
}


class AudioGeneratorService:
    """Service for generating IELTS exam audio using ElevenLabs."""
    
    def __init__(self):
        self.api_key = os.environ.get("ELEVENLABS_API_KEY")
        if not self.api_key:
            logger.warning("ELEVENLABS_API_KEY not found in environment")
        self.client = ElevenLabs(api_key=self.api_key) if self.api_key else None
        self.audio_dir = Path("/app/backend/static/audio/full_tests")
        self.audio_dir.mkdir(parents=True, exist_ok=True)
        
    def _get_cache_path(self, test_id: str, section: str, part: int, filename: str) -> Path:
        """Get the cache path for an audio file."""
        section_dir = self.audio_dir / test_id / section
        section_dir.mkdir(parents=True, exist_ok=True)
        return section_dir / filename
    
    def _get_content_hash(self, content: str) -> str:
        """Generate hash of content for cache validation."""
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    async def generate_listening_part_audio(
        self,
        test_id: str,
        part_number: int,
        audio_script: str,
        speakers: List[str],
        context: str
    ) -> Dict:
        """
        Generate audio for a listening section part.
        
        For multi-speaker dialogues, parses the script and generates
        separate audio for each speaker, then provides metadata for mixing.
        """
        if not self.client:
            return {"error": "ElevenLabs client not configured", "cached": False}
        
        part_key = f"part_{part_number}"
        speaker_map = LISTENING_SPEAKER_MAP.get(part_key, {})
        
        # Check cache
        content_hash = self._get_content_hash(audio_script)
        cache_filename = f"listening_part{part_number}_{content_hash}.mp3"
        cache_path = self._get_cache_path(test_id, "listening", part_number, cache_filename)
        
        if cache_path.exists():
            logger.info(f"Using cached audio: {cache_path}")
            return {
                "audio_url": f"/static/audio/full_tests/{test_id}/listening/{cache_filename}",
                "cached": True,
                "part_number": part_number,
                "duration_estimate": len(audio_script.split()) * 0.4  # ~0.4s per word estimate
            }
        
        try:
            # Parse script into speaker segments
            segments = self._parse_dialogue_script(audio_script, speakers)
            
            if len(speakers) == 1 or len(segments) <= 1:
                # Single speaker - generate directly
                voice_key = speaker_map.get(speakers[0], speaker_map.get("default", "british_male_professional"))
                voice = VOICE_PROFILES[voice_key]
                
                audio_data = await self._generate_audio(audio_script, voice)
            else:
                # Multi-speaker - generate combined audio with natural pauses
                audio_data = await self._generate_multi_speaker_audio(segments, speaker_map)
            
            # Save to cache
            with open(cache_path, "wb") as f:
                f.write(audio_data)
            
            logger.info(f"Generated and cached audio: {cache_path}")
            
            return {
                "audio_url": f"/static/audio/full_tests/{test_id}/listening/{cache_filename}",
                "cached": False,
                "part_number": part_number,
                "speakers": speakers,
                "duration_estimate": len(audio_script.split()) * 0.4
            }
            
        except Exception as e:
            logger.error(f"Error generating listening audio: {e}")
            return {"error": str(e), "cached": False}
    
    def _parse_dialogue_script(self, script: str, speakers: List[str]) -> List[Dict]:
        """
        Parse a dialogue script into speaker segments.
        
        Expected format:
        SpeakerName: Dialogue text...
        """
        segments = []
        current_speaker = None
        current_text = []
        
        for line in script.strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            
            # Check if line starts with a speaker name
            speaker_found = None
            for speaker in speakers:
                if line.startswith(f"{speaker}:"):
                    speaker_found = speaker
                    break
            
            if speaker_found:
                # Save previous segment
                if current_speaker and current_text:
                    segments.append({
                        "speaker": current_speaker,
                        "text": " ".join(current_text)
                    })
                
                # Start new segment
                current_speaker = speaker_found
                text_after_speaker = line.split(":", 1)[1].strip() if ":" in line else ""
                current_text = [text_after_speaker] if text_after_speaker else []
            else:
                # Continue current segment
                current_text.append(line)
        
        # Don't forget the last segment
        if current_speaker and current_text:
            segments.append({
                "speaker": current_speaker,
                "text": " ".join(current_text)
            })
        
        return segments
    
    async def _generate_audio(self, text: str, voice: Dict) -> bytes:
        """Generate audio for a single text using specified voice."""
        audio_generator = self.client.text_to_speech.convert(
            text=text,
            voice_id=voice["voice_id"],
            model_id="eleven_multilingual_v2",
            voice_settings=voice["settings"]
        )
        
        audio_data = b""
        for chunk in audio_generator:
            audio_data += chunk
        
        return audio_data
    
    async def _generate_multi_speaker_audio(self, segments: List[Dict], speaker_map: Dict) -> bytes:
        """
        Generate audio for multi-speaker dialogue.
        
        Generates audio for each segment and concatenates with natural pauses.
        """
        from pydub import AudioSegment
        import io
        
        combined = AudioSegment.empty()
        
        # Add ~500ms silence between segments for natural conversation flow
        silence_between_turns = AudioSegment.silent(duration=500)
        
        for i, segment in enumerate(segments):
            speaker = segment["speaker"]
            text = segment["text"]
            
            if not text.strip():
                continue
            
            # Get voice for this speaker
            voice_key = speaker_map.get(speaker, speaker_map.get("default", "british_male_professional"))
            voice = VOICE_PROFILES.get(voice_key, VOICE_PROFILES["british_male_professional"])
            
            # Generate audio for this segment
            segment_audio_data = await self._generate_audio(text, voice)
            
            # Convert to AudioSegment
            segment_audio = AudioSegment.from_mp3(io.BytesIO(segment_audio_data))
            
            # Add pause before segment (except first)
            if i > 0:
                combined += silence_between_turns
            
            combined += segment_audio
        
        # Export to bytes
        buffer = io.BytesIO()
        combined.export(buffer, format="mp3", bitrate="128k")
        return buffer.getvalue()
    
    async def generate_speaking_question_audio(
        self,
        test_id: str,
        part_number: int,
        question_id: str,
        question_text: str
    ) -> Dict:
        """
        Generate examiner audio for a speaking question.
        
        Uses a calm, professional examiner voice.
        """
        if not self.client:
            return {"error": "ElevenLabs client not configured", "cached": False}
        
        content_hash = self._get_content_hash(question_text)
        cache_filename = f"speaking_p{part_number}_{question_id}_{content_hash}.mp3"
        cache_path = self._get_cache_path(test_id, "speaking", part_number, cache_filename)
        
        if cache_path.exists():
            return {
                "audio_url": f"/static/audio/full_tests/{test_id}/speaking/{cache_filename}",
                "cached": True,
                "question_id": question_id
            }
        
        try:
            voice = VOICE_PROFILES["examiner"]
            audio_data = await self._generate_audio(question_text, voice)
            
            with open(cache_path, "wb") as f:
                f.write(audio_data)
            
            return {
                "audio_url": f"/static/audio/full_tests/{test_id}/speaking/{cache_filename}",
                "cached": False,
                "question_id": question_id
            }
            
        except Exception as e:
            logger.error(f"Error generating speaking question audio: {e}")
            return {"error": str(e), "cached": False}
    
    async def generate_all_listening_audio(self, test_data: Dict) -> Dict:
        """
        Generate all listening audio for a full test.
        
        Returns status of each part's audio generation.
        """
        test_id = test_data["test_id"]
        listening = test_data.get("sections", {}).get("listening", {})
        
        results = {}
        
        for part in listening.get("parts", []):
            part_num = part["part_number"]
            script = part.get("audio_script", "")
            speakers = part.get("speakers", ["Narrator"])
            context = part.get("context", "")
            
            result = await self.generate_listening_part_audio(
                test_id=test_id,
                part_number=part_num,
                audio_script=script,
                speakers=speakers,
                context=context
            )
            
            results[f"part_{part_num}"] = result
        
        return results
    
    async def generate_all_speaking_audio(self, test_data: Dict) -> Dict:
        """
        Generate all speaking question audio for a full test.
        """
        test_id = test_data["test_id"]
        speaking = test_data.get("sections", {}).get("speaking", {})
        
        results = {}
        
        for part in speaking.get("parts", []):
            part_num = part["part_number"]
            part_results = []
            
            # Part 1 & 3: Generate audio for each question
            if part_num in [1, 3]:
                for q in part.get("questions", []):
                    result = await self.generate_speaking_question_audio(
                        test_id=test_id,
                        part_number=part_num,
                        question_id=q["id"],
                        question_text=q["text"]
                    )
                    part_results.append(result)
            
            # Part 2: Generate cue card reading + follow-up
            elif part_num == 2:
                cue_card = part.get("cue_card", {})
                cue_text = f"{cue_card.get('topic', '')} {'. '.join(cue_card.get('points', []))}"
                
                result = await self.generate_speaking_question_audio(
                    test_id=test_id,
                    part_number=part_num,
                    question_id="cue_card",
                    question_text=cue_text
                )
                part_results.append(result)
                
                if part.get("follow_up"):
                    result = await self.generate_speaking_question_audio(
                        test_id=test_id,
                        part_number=part_num,
                        question_id="follow_up",
                        question_text=part["follow_up"]
                    )
                    part_results.append(result)
            
            results[f"part_{part_num}"] = part_results
        
        return results


# Singleton instance
audio_generator = AudioGeneratorService()
