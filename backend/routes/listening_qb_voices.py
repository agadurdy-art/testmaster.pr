"""
Listening QB — IELTS voice-profile config + transcript parsing
==============================================================
Single job: voice-profile tables, speaker→voice mapping, and the
transcript→speaker-turns parser used by the audio pipeline.
Extracted from routes/listening_qb.py (Faz 1 refactor, 2026-07-02).
"""

from typing import List, Dict
import re

# ============ IELTS-QUALITY VOICE CONFIGURATION ============
# These voices are selected for neutral, professional, exam-appropriate tone
# NOT friendly/sales/customer-service voices

IELTS_VOICE_PROFILES = {
    # British Voices (Primary for IELTS)
    "british_female_1": {
        "voice_id": "21m00Tcm4TlvDq8ikWAM",  # Rachel - calm, neutral
        "name": "British Female (Receptionist/Staff)",
        "stability": 0.85,  # Higher stability = less expressive = more exam-like
        "similarity_boost": 0.75,
        "style": 0.0,  # Zero style = neutral, not enthusiastic
    },
    "british_female_2": {
        "voice_id": "ThT5KcBeYPX3keUQqHPh",  # Dorothy - mature, professional
        "name": "British Female (Lecturer/Guide)",
        "stability": 0.85,
        "similarity_boost": 0.70,
        "style": 0.0,
    },
    "british_male_1": {
        "voice_id": "ErXwobaYiN019PkySvjV",  # Antoni - calm, measured
        "name": "British Male (Caller/Student)",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    "british_male_2": {
        "voice_id": "VR6AewLTigWG4xSOukaG",  # Arnold - deeper, authoritative
        "name": "British Male (Tutor/Professor)",
        "stability": 0.85,
        "similarity_boost": 0.70,
        "style": 0.0,
    },
    # Australian Voices
    "australian_male": {
        "voice_id": "pNInz6obpgDQGcFmaJgB",  # Adam
        "name": "Australian Male",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    "australian_female": {
        "voice_id": "jBpfuIE2acCO8z3wKNLl",  # Gigi
        "name": "Australian Female",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    # American Voices (less common in IELTS but available)
    "american_female": {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",  # Bella
        "name": "American Female",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
    "american_male": {
        "voice_id": "TxGEqnHWrfWFTfGW9XjX",  # Josh - calm
        "name": "American Male",
        "stability": 0.80,
        "similarity_boost": 0.75,
        "style": 0.0,
    },
}

# Speaker role to voice profile mapping
SPEAKER_ROLE_MAPPING = {
    # Part 1: Social conversations
    "receptionist": "british_female_1",
    "staff": "british_female_1",
    "librarian": "british_female_1",
    "agent": "british_female_1",
    "guest": "british_male_1",
    "caller": "british_male_1",
    "customer": "british_male_1",
    "student": "british_male_1",
    # Part 2: Monologues
    "guide": "british_female_2",
    "manager": "british_male_2",
    "presenter": "british_female_2",
    "announcer": "british_male_2",
    # Part 3: Academic discussions
    "tutor": "british_male_2",
    "supervisor": "british_male_2",
    "professor": "british_male_2",
    "advisor": "british_female_2",
    "student1": "british_female_1",
    "student2": "british_male_1",
    # Part 4: Lectures
    "lecturer": "british_female_2",
}


def get_voice_profile_for_speaker(speaker: Dict[str, str]) -> Dict:
    """
    Get IELTS-appropriate voice profile for a speaker.
    Prioritizes role-based mapping, then gender+accent fallback.
    """
    speaker_id = speaker.get("id", "").lower()
    gender = speaker.get("gender", "female").lower()
    accent = speaker.get("accent", "british").lower()

    # Try role-based mapping first
    if speaker_id in SPEAKER_ROLE_MAPPING:
        profile_key = SPEAKER_ROLE_MAPPING[speaker_id]
        return IELTS_VOICE_PROFILES[profile_key]

    # Fallback to gender+accent combination
    fallback_key = f"{accent}_{gender}_1"
    if fallback_key in IELTS_VOICE_PROFILES:
        return IELTS_VOICE_PROFILES[fallback_key]

    # Ultimate fallback
    return IELTS_VOICE_PROFILES["british_female_1"]


def parse_transcript_into_turns(transcript: str, speakers: List[Dict]) -> List[Dict]:
    """
    Parse a transcript into individual speaker turns.
    Returns list of {speaker_id, text, voice_profile}
    """
    turns = []

    # Build speaker name mapping
    speaker_map = {}
    for s in speakers:
        sid = s.get("id", "speaker")
        # Create variations of the speaker name for matching
        speaker_map[sid.lower()] = s
        speaker_map[sid.capitalize()] = s
        speaker_map[sid.title()] = s

    # Split transcript by speaker labels (e.g., "Speaker: text")
    # Pattern matches "Name:" at start of line or after newline
    lines = transcript.strip().split('\n')
    current_speaker = None
    current_text = []

    for line in lines:
        line = line.strip()
        if not line:
            continue

        # Check if line starts with a speaker label
        match = re.match(r'^([A-Za-z0-9_]+):\s*(.*)$', line)
        if match:
            # Save previous turn if exists
            if current_speaker and current_text:
                speaker_data = speaker_map.get(current_speaker.lower(), speakers[0] if speakers else {"id": "narrator"})
                turns.append({
                    "speaker_id": current_speaker,
                    "text": ' '.join(current_text),
                    "speaker_data": speaker_data,
                    "voice_profile": get_voice_profile_for_speaker(speaker_data)
                })

            current_speaker = match.group(1)
            current_text = [match.group(2)] if match.group(2) else []
        else:
            # Continuation of current speaker's text
            if current_speaker:
                current_text.append(line)
            else:
                # No speaker identified yet, treat as narrator/first speaker
                current_speaker = speakers[0]["id"] if speakers else "narrator"
                current_text.append(line)

    # Don't forget the last turn
    if current_speaker and current_text:
        speaker_data = speaker_map.get(current_speaker.lower(), speakers[0] if speakers else {"id": "narrator"})
        turns.append({
            "speaker_id": current_speaker,
            "text": ' '.join(current_text),
            "speaker_data": speaker_data,
            "voice_profile": get_voice_profile_for_speaker(speaker_data)
        })

    return turns
