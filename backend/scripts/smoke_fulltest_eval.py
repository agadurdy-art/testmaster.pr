"""Smoke test: evaluate_speaking_fulltest() with synthetic 3-part transcripts.

Uses transcribe_audio injection + use_azure=False to skip the Azure pipeline,
exercising the holistic Sonnet pass end-to-end on synthetic content.
"""
from __future__ import annotations

import asyncio
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dotenv import load_dotenv  # noqa: E402

load_dotenv(ROOT / ".env")

from schemas.speaking_evaluator import (  # noqa: E402
    FullTestPartInput,
    SpeakingFullTestEvaluationRequest,
    SpeakingPart,
)
from services.speaking_evaluator import evaluate_speaking_fulltest  # noqa: E402


PART1_TRANSCRIPT = (
    "I live in a small apartment in the city center with my family. "
    "The thing I like most about it is the location — we're walking distance "
    "from a great market and a few cafes I visit every morning. "
    "If I could change one thing, I'd add more natural light; the place gets "
    "a bit dim in the afternoons. I plan to stay there for at least a few "
    "more years until I save up to move to a bigger place."
)

PART2_TRANSCRIPT = (
    "I'd like to talk about a person who has had a significant influence on "
    "my life — my high school English teacher, Mr. Tanaka. I knew him for "
    "three years during high school, and what struck me about him was his "
    "patience and his curiosity. He never just gave you the answer; he'd "
    "ask three questions back and let you discover it yourself. He taught me "
    "that learning a language is really about learning to listen. Even now, "
    "when I'm writing or speaking, I find myself asking the kind of "
    "questions he used to ask me. He's the reason I went on to study "
    "literature, and the reason I'm still trying to read something difficult "
    "every week."
)

PART3_TRANSCRIPT = (
    "I think influence works in subtle ways — it's rarely a single dramatic "
    "moment. The people who shape us most are the ones we spend time with "
    "regularly, whose habits we end up borrowing without even realizing it. "
    "Social media has changed this picture, of course; now you can be "
    "influenced by someone you've never met. On balance I think that's a "
    "mixed blessing — it democratizes access to ideas, but it also dilutes "
    "the depth of any single relationship. I'd say teachers and parents "
    "still matter more than influencers, simply because they see you over "
    "time."
)


PART_TRANSCRIPTS = {
    SpeakingPart.part1: PART1_TRANSCRIPT,
    SpeakingPart.part2: PART2_TRANSCRIPT,
    SpeakingPart.part3: PART3_TRANSCRIPT,
}


async def fake_transcribe(audio_bytes: bytes) -> str:
    # Audio bytes are tagged with the part name in the smoke test (b"part1", etc.).
    tag = audio_bytes.decode("ascii", errors="ignore").strip()
    return PART_TRANSCRIPTS[SpeakingPart(tag)]


async def main() -> int:
    req = SpeakingFullTestEvaluationRequest(
        user_language="en",
        target_band=7.0,
        parts=[
            FullTestPartInput(
                part=SpeakingPart.part1,
                cue_card_prompt="Home & accommodation",
                cue_card_bullets=[],
                duration_seconds=240.0,
            ),
            FullTestPartInput(
                part=SpeakingPart.part2,
                cue_card_prompt="Describe a person who has influenced you.",
                cue_card_bullets=[
                    "who this person is",
                    "how you know them",
                    "what qualities they have",
                ],
                duration_seconds=120.0,
            ),
            FullTestPartInput(
                part=SpeakingPart.part3,
                cue_card_prompt="Discussion: influence and role models",
                cue_card_bullets=[],
                duration_seconds=300.0,
            ),
        ],
    )
    audios = {
        SpeakingPart.part1: b"part1",
        SpeakingPart.part2: b"part2",
        SpeakingPart.part3: b"part3",
    }

    result = await evaluate_speaking_fulltest(
        req,
        audios,
        use_azure=False,
        transcribe_audio=fake_transcribe,
    )

    s = result.scores
    print(f"overall={s.overall} target={s.target} fc={s.fc} lr={s.lr} gra={s.gra} pr={s.pr}")
    for p in result.parts:
        print(f"  {p.part.value}: indicative={p.indicative_band} "
              f"({p.duration_seconds}s) — {p.observation[:120]}")
    print(f"liz_note: {result.liz_note}")
    print(f"feedback_language: {result.feedback_language}")
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
