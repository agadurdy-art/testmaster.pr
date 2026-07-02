"""
GE V1 test-taking endpoints
===========================
Single job: the legacy V1 test surface (TestInterface.js) — list/serve
tests, serve listening audio, score submissions (band tables + skill
insights), read attempts, and the admin create-test endpoint.
GENERAL ENGLISH (V1) product surface — IELTS bands kept for the old
frontend rendering. Collections: tests, test_attempts, users.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
import os
import re
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

from fastapi import APIRouter, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel

from services.attempt_store import TestAttempt, persist_attempt

router = APIRouter()

db = None


def set_db(database):
    global db
    db = database


class SubmitAnswers(BaseModel):
    user_id: str
    test_id: str
    test_type: str
    answers: List[Dict[str, Any]]
    time_taken: int
    language: str = "en"  # "en" or "vi" for localized feedback
    writing_feedback: Optional[Dict[str, Any]] = None  # AI feedback for writing tests
    speaking_feedback: Optional[Dict[str, Any]] = None  # AI feedback for speaking tests




def _resolve_listening_transcripts(test: Dict[str, Any]) -> Dict[int, str]:
    """Return a {part_number: transcript_text} map for a listening test.

    Sources, in order:
      1. test["transcripts"] / test["sections"]["listening"]["transcripts"] —
         used when the test data itself carries audioscripts (e.g. Cambridge
         book content modules).
      2. Title-based fallback for tests seeded into db.tests before transcripts
         existed (Cambridge IELTS 19 Test 1 / Test 2 dashboard listening tests).
    """
    direct = test.get("transcripts")
    if not direct:
        try:
            direct = (test.get("sections") or {}).get("listening", {}).get("transcripts")
        except (AttributeError, TypeError):
            direct = None
    if direct:
        out: Dict[int, str] = {}
        for k, v in direct.items():
            try:
                out[int(k)] = str(v or "")
            except (TypeError, ValueError):
                continue
        if out:
            return out

    title = (test.get("title") or "").lower()
    if "cambridge ielts 19" in title or "ielts 19" in title:
        try:
            from content.cambridge_tests.ielts19.audioscripts import IELTS19_AUDIOSCRIPTS
            if "test 1" in title:
                return dict(IELTS19_AUDIOSCRIPTS.get(1, {}))
            if "test 2" in title:
                return dict(IELTS19_AUDIOSCRIPTS.get(2, {}))
        except ImportError:
            pass
    return {}


def calculate_band_score(percentage: float) -> float:
    """Convert percentage to IELTS band score (1-9)"""
    if percentage >= 95:
        return 9.0
    elif percentage >= 90:
        return 8.5
    elif percentage >= 85:
        return 8.0
    elif percentage >= 80:
        return 7.5
    elif percentage >= 75:
        return 7.0
    elif percentage >= 70:
        return 6.5
    elif percentage >= 65:
        return 6.0
    elif percentage >= 60:
        return 5.5
    elif percentage >= 55:
        return 5.0
    elif percentage >= 50:
        return 4.5
    elif percentage >= 45:
        return 4.0
    elif percentage >= 40:
        return 3.5
    elif percentage >= 35:
        return 3.0
    elif percentage >= 30:
        return 2.5
    elif percentage >= 25:
        return 2.0
    elif percentage >= 20:
        return 1.5
    else:
        return 1.0




@router.get("/tests")
async def get_tests(test_type: Optional[str] = None):
    query = {"test_type": test_type} if test_type else {}
    tests = await db.tests.find(query, {"_id": 0}).to_list(100)
    
    # For listening tests, inject audio URLs
    for test in tests:
        if test.get("test_type") == "listening":
            all_listening = [t for t in tests if t.get("test_type") == "listening"]
            all_listening.sort(key=lambda t: t.get("title", ""))
            test_idx = next((i for i, t in enumerate(all_listening) if t["id"] == test["id"]), 0) + 1
            for i, section in enumerate(test.get("sections", [])):
                part_num = i + 1
                audio_path = Path(f"static/audio/listening_tests/test{test_idx}_part{part_num}.mp3")
                if audio_path.exists():
                    section["audio_url"] = f"/api/listening-test-audio/test{test_idx}_part{part_num}"
    
    return tests

@router.get("/tests/{test_id}")
async def get_test(test_id: str):
    test = await db.tests.find_one({"id": test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")
    
    # For listening tests, attach audio URLs from uploaded files
    if test.get("test_type") == "listening":
        for i, section in enumerate(test.get("sections", [])):
            part_num = i + 1
            # Map test to its audio files by checking which test index this is
            all_listening = await db.tests.find(
                {"test_type": "listening"}, {"_id": 0, "id": 1}
            ).sort("title", 1).to_list(20)
            test_idx = next((idx for idx, t in enumerate(all_listening) if t["id"] == test_id), 0) + 1
            audio_path = Path(f"static/audio/listening_tests/test{test_idx}_part{part_num}.mp3")
            if audio_path.exists():
                section["audio_url"] = f"/api/listening-test-audio/test{test_idx}_part{part_num}"
    
    return test

@router.get("/listening-test-audio/{filename}")
async def serve_listening_test_audio(filename: str):
    """Serve uploaded listening test audio files"""
    audio_path = Path(f"static/audio/listening_tests/{filename}.mp3")
    if not audio_path.exists():
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(path=audio_path, media_type="audio/mpeg")


@router.post("/tests/submit")
async def submit_test(submission: SubmitAnswers):
    # Get test
    test = await db.tests.find_one({"id": submission.test_id}, {"_id": 0})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    # Calculate score for objective tests (listening/reading)
    if submission.test_type in ["listening", "reading"]:
        test_type = submission.test_type

        # Map question_id -> question_type from the test definition
        # Keys can be int or str (e.g., "20-21" for combined questions)
        question_type_map: Dict[Union[int, str], str] = {}
        for q in test.get("questions", []):
            qid = q.get("id") or q.get("question_id")
            if qid is None:
                continue
            # Try to convert to int, but keep as string if it contains separators
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Combined question ID like "20-21"
                question_type_map[qid] = str(q.get("type") or "unknown").strip().lower()
            else:
                try:
                    qid_int = int(qid)
                    question_type_map[qid_int] = str(q.get("type") or "unknown").strip().lower()
                except (TypeError, ValueError):
                    continue

        # Build a lookup from question_id -> correct answer for robust matching
        # Keys can be int or str (e.g., "20-21" for combined questions)
        # Values can be str or list (for multiple correct answers)
        answer_key_map: Dict[Union[int, str], Union[str, List]] = {}
        for item in test.get("answer_key", []):
            qid = item.get("question_id")
            if qid is None:
                continue
            answer = item.get("answer", "")
            # Try to convert to int, but keep as string if it contains separators
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Combined question ID like "20-21"
                answer_key_map[qid] = answer  # Can be a list like ['B', 'D']
            else:
                try:
                    qid_int = int(qid)
                    answer_key_map[qid_int] = str(answer) if not isinstance(answer, list) else answer
                except (TypeError, ValueError):
                    continue

        # Prepare per-skill stats (e.g. Reading – True/False/Not Given)
        # Keyed by (test_type, question_type)
        skill_stats: Dict[str, Dict[str, Any]] = {}

        def _make_skill_key(t_type: str, q_type: str) -> str:
            return f"{t_type}:{q_type or 'unknown'}"

        def _skill_label(t_type: str, q_type: str) -> str:
            base = "Reading" if t_type == "reading" else "Listening"
            type_map = {
                # Reading
                "true_false_notgiven": "True / False / Not Given",
                "yes_no_notgiven": "Yes / No / Not Given",
                "sentence_completion": "Sentence / Note Completion",
                "summary_completion": "Summary Completion",
                "matching_information": "Matching Information",
                "multiple_choice": "Multiple Choice",
                # Listening
                "note_completion": "Note / Form Completion",
                "map_labeling": "Map / Diagram Labelling",
                "multiple_choice_two": "Multiple Choice (Two Options)",
                "matching": "Matching Features",
            }
            pretty = type_map.get(q_type, q_type.replace("_", " ").title() or "Mixed Skills")
            return f"{base} – {pretty}"

        # Initialise totals per skill from answer key
        for qid_int, correct_answer in answer_key_map.items():
            q_type = question_type_map.get(qid_int, "unknown")
            skey = _make_skill_key(test_type, q_type)
            if skey not in skill_stats:
                skill_stats[skey] = {
                    "skill_id": skey,
                    "test_type": test_type,
                    "question_type": q_type,
                    "label": _skill_label(test_type, q_type),
                    "correct": 0,
                    "total": 0,
                }
            skill_stats[skey]["total"] += 1

        correct = 0
        # Calculate total questions, accounting for combined questions
        total = 0
        for item in test.get("answer_key", []):
            answer = item.get("answer")
            qid = item.get("question_id")
            # Combined questions (like "20-21") count as 2 questions
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                # Count based on number of answers in the list
                total += len(answer) if isinstance(answer, list) else 1
            else:
                total += 1
        
        # Build question results with correct/incorrect status
        question_results = []
        
        # Create a map of question id to question text
        question_text_map = {}
        question_options_map: Dict[Any, List[str]] = {}
        question_section_map: Dict[Any, int] = {}
        for q in test.get("questions", []):
            q_id = q.get("id")
            if q_id is not None:
                # Store with original ID (can be int or string like "20-21")
                question_text_map[q_id] = q.get("question", "")
                # Track section/part number so listening evidence excerpts can
                # be looked up in the correct part's transcript.
                sec = q.get("section") or q.get("part")
                if sec is not None:
                    try:
                        question_section_map[q_id] = int(sec)
                        if isinstance(q_id, str) and ('-' in q_id or ',' in q_id):
                            for sub_id in [int(x.strip()) for x in q_id.replace(',', '-').split('-')]:
                                question_section_map[sub_id] = int(sec)
                                question_section_map[str(sub_id)] = int(sec)
                    except (TypeError, ValueError):
                        pass
                opts = q.get("options") or []
                if isinstance(opts, list) and opts:
                    question_options_map[q_id] = [str(o) for o in opts]
                    # Mirror onto sub-IDs so combined "20-21" reaches Q20/Q21.
                    if isinstance(q_id, str) and ('-' in q_id or ',' in q_id):
                        try:
                            for sub_id in [int(x.strip()) for x in q_id.replace(',', '-').split('-')]:
                                question_options_map[sub_id] = [str(o) for o in opts]
                                question_options_map[str(sub_id)] = [str(o) for o in opts]
                        except ValueError:
                            pass

        # Create explanation map from answer_key
        explanation_map = {}
        for item in test.get("answer_key", []):
            q_id = item.get("question_id")
            if q_id is not None:
                # Store with original ID (can be int or string like "20-21")
                explanation_map[q_id] = item.get("explanation", "")
        
        # Helper function to check if answers match (handles multiple correct answers)
        def answers_match(user_ans, correct_ans):
            """
            Check if user answer matches correct answer.
            Returns:
            - For single answers: True/False
            - For multiple answers (Choose TWO): number of correct matches
            Handles:
            - Single answers (string comparison)
            - Multiple answers (list comparison for "Choose TWO" questions)
            - Alternative answers separated by "/" or "or"
            """
            # Handle multiple choice multi questions (user_ans and correct_ans are lists)
            if isinstance(user_ans, list) and isinstance(correct_ans, list):
                # Count how many user answers match correct answers
                user_upper = [str(a).strip().upper() for a in user_ans]
                correct_upper = [str(a).strip().upper() for a in correct_ans]
                matches = sum(1 for ans in user_upper if ans in correct_upper)
                return matches  # Return count of matches (0, 1, or 2 for "Choose TWO")
            
            # Single answer comparison
            user_clean = str(user_ans).strip().lower()
            correct_clean = str(correct_ans).strip().lower()
            
            # Exact match
            if user_clean == correct_clean:
                return True
            
            # Handle alternative answers separated by "/" (e.g., "intestines" or "gut")
            if "/" in correct_clean:
                alternatives = [alt.strip() for alt in correct_clean.split("/")]
                if user_clean in alternatives:
                    return True
            
            # Handle "or" separator (e.g., "intestines or gut")
            if " or " in correct_clean:
                alternatives = [alt.strip() for alt in correct_clean.split(" or ")]
                if user_clean in alternatives:
                    return True
            
            return False

        # ───── Multi-MCQ pre-processing ─────────────────────────────────
        # When a "Choose TWO" question is stored in answer_key as a combined
        # ID like "20-21" with answer ["A","B"], the test interface often
        # submits the two picks as separate Q20/Q21 entries (string answers).
        # Without merging them into the combined-key shape the scoring loop
        # below expects, both rows are skipped and 4 questions go missing
        # from question_results — surfacing as "8/36" or "8/38" totals on
        # the results page even though the test always has 40 questions.
        combined_keys = [k for k in answer_key_map.keys()
                          if isinstance(k, str) and ('-' in k or ',' in k)]
        if combined_keys:
            sub_answer_lookup: Dict[str, Any] = {}
            for ans in submission.answers:
                qid = ans.get("question_id") or ans.get("id")
                if qid is not None:
                    sub_answer_lookup[str(qid)] = ans.get("answer", "")
            merged_answers = list(submission.answers)
            for ck in combined_keys:
                # Already submitted as combined list — keep as-is.
                existing = sub_answer_lookup.get(ck)
                if isinstance(existing, list):
                    continue
                try:
                    sub_ids = [int(x.strip()) for x in ck.replace(',', '-').split('-')]
                except ValueError:
                    continue
                gathered: List[str] = []
                for sub_id in sub_ids:
                    v = sub_answer_lookup.get(str(sub_id), "")
                    if isinstance(v, list):
                        gathered.extend(str(x) for x in v if x)
                    elif v:
                        gathered.append(str(v))
                if not gathered:
                    continue
                drop_ids = {str(s) for s in sub_ids} | {ck}
                merged_answers = [a for a in merged_answers
                                   if str(a.get("question_id") or a.get("id")) not in drop_ids]
                merged_answers.append({"question_id": ck, "answer": gathered})
            submission_answers_iter = merged_answers
        else:
            submission_answers_iter = submission.answers

        # Comparison with support for multiple correct answers and explanations
        for ans in submission_answers_iter:
            qid = ans.get("question_id") or ans.get("id")
            if qid is None:
                continue
            
            # Question ID can be int or string (e.g., "20-21")
            # Normalize it to match the keys in our maps
            qid_normalized = qid
            if isinstance(qid, str) and not ('-' in qid or ',' in qid):
                # Single ID as string - convert to int
                try:
                    qid_normalized = int(qid)
                except (TypeError, ValueError):
                    continue
            
            correct_answer = answer_key_map.get(qid_normalized)
            if correct_answer is None:
                continue

            user_answer = ans.get("answer", "")
            match_result = answers_match(user_answer, correct_answer)
            
            q_type = question_type_map.get(qid_normalized, "unknown")
            
            # Handle combined questions (e.g., "21-22") - split into individual results for clarity
            if isinstance(correct_answer, list) and isinstance(user_answer, list):
                # This is a "Choose TWO" type question - split into individual questions
                # Extract individual question numbers from combined ID (e.g., "21-22" -> [21, 22])
                if isinstance(qid_normalized, str) and '-' in qid_normalized:
                    individual_q_ids = [int(x.strip()) for x in qid_normalized.split('-')]
                else:
                    # Fallback if format is unexpected
                    individual_q_ids = [qid_normalized]
                
                # Ensure we have enough question IDs for the answers
                if len(individual_q_ids) < len(correct_answer):
                    # Generate sequential IDs if needed
                    start_id = individual_q_ids[0] if individual_q_ids else 1
                    individual_q_ids = list(range(start_id, start_id + len(correct_answer)))
                
                # Create separate result entries for each answer.
                # IELTS "Choose TWO" scoring is SET-BASED (order doesn't matter):
                # each correct option = 1 mark if user picked that letter,
                # regardless of click order. Positional matching incorrectly
                # marked [B,C] vs [B,E] as 0/2 when user clicked C before B
                # (rotated to [C,B] vs [B,E]).
                user_upper = [str(a).strip().upper() for a in user_answer]
                correct_upper = [str(a).strip().upper() for a in correct_answer]
                user_set = set(user_upper)
                user_display = ", ".join([u for u in user_upper if u]) or ""

                for idx, (q_id, correct_ans) in enumerate(zip(individual_q_ids, correct_upper)):
                    is_correct_individual = correct_ans in user_set

                    if is_correct_individual:
                        correct += 1

                    # Add individual question result. user_answer keeps the
                    # full pick set so the row UI reads "Your: B,C | Correct: B"
                    # (clarifies WHICH option this row represents while still
                    # showing the user's complete submission).
                    question_results.append({
                        "question_id": q_id,
                        "question_text": question_text_map.get(qid_normalized, f"Question {q_id}"),
                        "question_type": q_type,
                        "user_answer": user_display,
                        "correct_answer": correct_ans,
                        "is_correct": is_correct_individual,
                        "explanation": explanation_map.get(qid_normalized, ""),
                    })
                    
                    # Update skill stats
                    skey = _make_skill_key(test_type, q_type)
                    if skey not in skill_stats:
                        skill_stats[skey] = {
                            "skill_id": skey,
                            "test_type": test_type,
                            "question_type": q_type,
                            "label": _skill_label(test_type, q_type),
                            "correct": 0,
                            "total": 0,
                        }
                    if is_correct_individual:
                        skill_stats[skey]["correct"] += 1
            else:
                # Single answer question
                if isinstance(match_result, bool):
                    is_correct_full = match_result
                    if is_correct_full:
                        correct += 1
                else:
                    # Shouldn't happen, but handle gracefully
                    is_correct_full = False
                
                # For display purposes, convert question ID to int if possible
                display_qid = qid_normalized if isinstance(qid_normalized, int) else qid_normalized
                
                # Add to question results
                question_results.append({
                    "question_id": display_qid,
                    "question_text": question_text_map.get(qid_normalized, f"Question {display_qid}"),
                    "question_type": q_type,
                    "user_answer": user_answer,
                    "correct_answer": correct_answer,
                    "is_correct": is_correct_full,
                    "explanation": explanation_map.get(qid_normalized, ""),
                })
                
                skey = _make_skill_key(test_type, q_type)
                if skey not in skill_stats:
                    skill_stats[skey] = {
                        "skill_id": skey,
                        "test_type": test_type,
                        "question_type": q_type,
                        "label": _skill_label(test_type, q_type),
                        "correct": 0,
                        "total": 0,
                    }
                if is_correct_full:
                    skill_stats[skey]["correct"] += 1

        score_percentage = (correct / total * 100) if total > 0 else 0
        band_score = calculate_band_score(score_percentage)

        # Sort question results by question_id for proper display order
        question_results.sort(key=lambda x: x.get("question_id", 0))

        # ───── Guarantee 40-row results + passage attachment ─────────────
        # Every IELTS reading/listening test has 40 questions. If the user
        # skipped some (or the frontend dropped them), still emit a row so
        # the results UI shows "(no answer)" instead of silently dropping
        # to "8/36" totals.
        covered_qids = {str(qr.get("question_id")) for qr in question_results}

        def _expand_combined(qid):
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                try:
                    parts = [int(x.strip()) for x in qid.replace(',', '-').split('-')]
                    return parts
                except ValueError:
                    return [qid]
            return [qid]

        for ak_qid, correct_ans in answer_key_map.items():
            sub_ids = _expand_combined(ak_qid)
            q_type = question_type_map.get(ak_qid, "unknown")
            if isinstance(correct_ans, list):
                # Combined "Choose TWO" — emit one row per sub-id
                for idx, sub_id in enumerate(sub_ids):
                    if str(sub_id) in covered_qids:
                        continue
                    sub_correct = correct_ans[idx] if idx < len(correct_ans) else ""
                    question_results.append({
                        "question_id": sub_id,
                        "question_text": question_text_map.get(ak_qid, f"Question {sub_id}"),
                        "question_type": q_type,
                        "user_answer": "",
                        "correct_answer": sub_correct,
                        "is_correct": False,
                        "explanation": explanation_map.get(ak_qid, ""),
                    })
                    covered_qids.add(str(sub_id))
                    skey = _make_skill_key(test_type, q_type)
                    if skey not in skill_stats:
                        skill_stats[skey] = {
                            "skill_id": skey,
                            "test_type": test_type,
                            "question_type": q_type,
                            "label": _skill_label(test_type, q_type),
                            "correct": 0,
                            "total": 0,
                        }
            else:
                if str(ak_qid) in covered_qids:
                    continue
                question_results.append({
                    "question_id": ak_qid,
                    "question_text": question_text_map.get(ak_qid, f"Question {ak_qid}"),
                    "question_type": q_type,
                    "user_answer": "",
                    "correct_answer": correct_ans,
                    "is_correct": False,
                    "explanation": explanation_map.get(ak_qid, ""),
                })
                covered_qids.add(str(ak_qid))

        # Recalculate skill totals from the authoritative answer_key (each
        # combined "20-21" key contributes len(answer) sub-questions). The
        # earlier init counted combined keys as 1, undercounting totals.
        for sstats in skill_stats.values():
            sstats["total"] = 0
        for ak_qid, correct_ans in answer_key_map.items():
            q_type = question_type_map.get(ak_qid, "unknown")
            skey = _make_skill_key(test_type, q_type)
            if skey not in skill_stats:
                skill_stats[skey] = {
                    "skill_id": skey,
                    "test_type": test_type,
                    "question_type": q_type,
                    "label": _skill_label(test_type, q_type),
                    "correct": 0,
                    "total": 0,
                }
            n_sub = len(correct_ans) if isinstance(correct_ans, list) else 1
            skill_stats[skey]["total"] += n_sub

        # Build passage map: each test question carries a "passage" field
        # (1/2/3). Combined IDs like "20-21" map to both sub-IDs.
        passage_map: Dict[str, Any] = {}
        for q in test.get("questions", []):
            qid = q.get("id") or q.get("question_id")
            passage_val = q.get("passage")
            if qid is None or passage_val is None:
                continue
            if isinstance(qid, str) and ('-' in qid or ',' in qid):
                for sub_id in _expand_combined(qid):
                    passage_map[str(sub_id)] = passage_val
                passage_map[str(qid)] = passage_val
            else:
                passage_map[str(qid)] = passage_val

        for qr in question_results:
            qid_str = str(qr.get("question_id"))
            if qid_str in passage_map:
                qr["passage"] = passage_map[qid_str]

        question_results.sort(
            key=lambda x: int(x["question_id"]) if isinstance(x.get("question_id"), int)
            or (isinstance(x.get("question_id"), str) and x["question_id"].isdigit())
            else 9999
        )

        # Build teacher-style feedback per skill
        skill_breakdown: List[Dict[str, Any]] = []
        strong_skills: List[Dict[str, Any]] = []
        weak_skills: List[Dict[str, Any]] = []

        def _level_from_ratio(ratio: float) -> str:
            if ratio >= 0.8:
                return "strong"
            if ratio >= 0.5:
                return "ok"
            return "needs_practice"

        def _base_tip(t_type: str, q_type: str) -> str:
            # High-level tips per question type
            if t_type == "reading":
                if q_type == "true_false_notgiven" or q_type == "yes_no_notgiven":
                    return "Focus on underlining keywords in the question and scanning the passage to check exactly what is stated. Be careful with 'Not Given' – if the passage doesn’t clearly support or contradict the statement, it’s usually Not Given."
                if q_type == "matching_information":
                    return "Practise skimming paragraphs for topic sentences and key ideas, then matching them to the question prompts."
                if q_type in {"sentence_completion", "summary_completion"}:
                    return "Predict the type of word needed (noun/verb/adjective) and read around the gap so you don’t rely only on single-word matching."
                if q_type == "multiple_choice":
                    return "Train yourself to eliminate clearly wrong options first, then choose between the last two by checking small details and synonyms in the passage."
            if t_type == "listening":
                if q_type in {"note_completion", "sentence_completion"}:
                    return "Use the preparation time to read questions and predict the kind of word you expect to hear. Listen for synonyms and paraphrases, not only the exact words."
                if q_type == "map_labeling":
                    return "Before the recording starts, trace the route with your eyes and note key landmarks (left/right, north/south) so you can follow directions more easily."
                if q_type in {"multiple_choice", "multiple_choice_two"}:
                    return "Listen for signpost words that show when the speaker changes their mind, and be ready for distractors where an option is mentioned but then rejected."
                if q_type == "matching":
                    return "Practise holding several pieces of information in your mind while listening, and draw quick lines/arrows on the question paper to help you keep track."
            # Generic fallback
            return "Review your mistakes in this question type and try to notice patterns: where did you misunderstand, guess, or run out of time? Turn those into small habits to fix next time."

        for skey, stats in skill_stats.items():
            total_q = stats.get("total", 0) or 0
            correct_q = stats.get("correct", 0) or 0
            ratio = (correct_q / total_q) if total_q > 0 else 0.0
            level = _level_from_ratio(ratio)
            stats["level"] = level

            if total_q == 0:
                stats["short_comment"] = "No questions of this type in this test."
            else:
                label = stats.get("label") or "This skill"
                base_tip = _base_tip(test_type, stats.get("question_type", "unknown"))
                if level == "strong":
                    stats["short_comment"] = f"You are strong at {label} ({correct_q}/{total_q} correct). Keep using these questions to boost your overall band score."
                elif level == "ok":
                    stats["short_comment"] = f"You are doing fairly well with {label} ({correct_q}/{total_q} correct), but a bit more practice will make you more consistent."
                else:
                    stats["short_comment"] = f"{label} ({correct_q}/{total_q} correct) is a key area to improve. {base_tip}"

                # Attach a longer tip as well
                stats["tips"] = base_tip

            skill_breakdown.append(stats)

            if level == "strong":
                strong_skills.append(stats)
            elif level == "needs_practice":
                weak_skills.append(stats)

        # Build overall teacher-style feedback (short + detailed)
        def _skill_names(skills: List[Dict[str, Any]], max_count: int = 2) -> str:
            names = [s.get("label", "this skill") for s in skills[:max_count]]
            if not names:
                return ""
            if len(names) == 1:
                return names[0]
            return ", ".join(names[:-1]) + " and " + names[-1]

        test_label = "reading" if test_type == "reading" else "listening"
        
        # Check if Vietnamese language requested
        lang = submission.language if hasattr(submission, 'language') else "en"
        is_vi = lang == "vi"
        
        test_label_vi = "đọc hiểu" if test_type == "reading" else "nghe hiểu"

        short_fb_parts: List[str] = []
        if is_vi:
            short_fb_parts.append(
                f"Trong bài thi {test_label_vi} này, bạn đã trả lời đúng {correct} trên {total} câu hỏi (khoảng {score_percentage:.0f}%)."
            )
        else:
            short_fb_parts.append(
                f"For this {test_label} test, you answered {correct} out of {total} questions correctly (about {score_percentage:.0f}%)."
            )
        strong_names = _skill_names(strong_skills)
        weak_names = _skill_names(weak_skills)
        if strong_names:
            if is_vi:
                short_fb_parts.append(f"Điểm mạnh của bạn là {strong_names}. Hãy tận dụng những câu hỏi này để đạt điểm cao hơn.")
            else:
                short_fb_parts.append(f"Your strongest areas were {strong_names}. Use these questions to secure easy marks.")
        if weak_names:
            if is_vi:
                short_fb_parts.append(f"Bạn nên dành nhiều thời gian luyện tập hơn cho {weak_names} để cải thiện điểm band.")
            else:
                short_fb_parts.append(f"You should focus more practice time on {weak_names} to raise your band.")
        short_teacher_feedback = " ".join(short_fb_parts)

        detailed_parts: List[str] = []
        if is_vi:
            detailed_parts.append(
                f"Nhìn chung, bạn đạt khoảng {score_percentage:.0f}% trong bài thi {test_label_vi} này, tương đương với điểm IELTS khoảng {band_score:.1f}."
            )
            if strong_names:
                detailed_parts.append(
                    f"Bạn thể hiện rõ điểm mạnh ở phần {strong_names}. Hãy luôn làm chắc những câu này trước trong kỳ thi vì chúng phù hợp với kỹ năng hiện tại của bạn."
                )
            if weak_names:
                detailed_parts.append(
                    f"Những phần cần cải thiện là {weak_names}. Sau mỗi bài thi thử, hãy xem lại kỹ những câu hỏi này và so sánh câu trả lời của bạn với đáp án để hiểu rõ mình sai ở đâu."
                )
            detailed_parts.append(
                "Khi luyện tập, hãy bấm giờ nghiêm túc, gạch chân từ khóa trong câu hỏi, và sau khi hoàn thành, dành ít nhất 5-10 phút phân tích lỗi sai thay vì vội chuyển sang bài thi mới. Việc suy ngẫm này mới thực sự giúp cải thiện điểm số."
            )
            detailed_parts.append(
                "Chọn một hoặc hai dạng câu hỏi yếu và tập trung luyện tập chuyên sâu (ví dụ: một trang chỉ toàn câu True/False/Not Given hoặc Note Completion) cho đến khi cảm thấy thoải mái hơn."
            )
        else:
            detailed_parts.append(
                f"Overall, you achieved about {score_percentage:.0f}% on this {test_label} test, which corresponds to an IELTS band of approximately {band_score:.1f}."
            )
            if strong_names:
                detailed_parts.append(
                    f"You showed clear strength in {strong_names}. Try to always secure these marks first in the exam, because they suit your current skills."
                )
            if weak_names:
                detailed_parts.append(
                    f"The main areas to improve are {weak_names}. After each practice test, carefully review these questions and compare your answer with the explanation to see exactly where your understanding differed."
                )
            detailed_parts.append(
                "When practising, time yourself strictly, underline keywords in the questions, and after you finish, spend at least 5–10 minutes analysing your mistakes rather than jumping to a new test. This reflection is what really improves your score."
            )
            detailed_parts.append(
                "Choose one or two weaker question types at a time and drill them using targeted practice (for example, a page of only True/False/Not Given or only Note Completion questions) until they feel more comfortable."
            )
        detailed_teacher_feedback = " ".join(detailed_parts)

        # ───── Insight pipeline (reading + listening) ─────────────────────
        # Tag each wrong question with a reason_code, build reason_summary,
        # root_cause_analysis, fastest_gain (top weak skills) and a lesson
        # recommendation list. The reading results layout reads these keys
        # to populate the 6 insight tiles ("Root Cause", "Fastest Gain"…).
        try:
            from routes.cambridge import (
                classify_reason_code as _classify_reason_code,
                build_root_cause_analysis as _build_root_cause_analysis,
                extract_evidence_text as _extract_evidence_text,
                get_skill_tip as _get_skill_tip,
            )
        except Exception:
            _classify_reason_code = None
            _build_root_cause_analysis = None
            _extract_evidence_text = None
            _get_skill_tip = None

        # Passage text lookup: passage_id (1/2/3) -> full text
        passage_text_map: Dict[Any, str] = {}
        for p in (test.get("passages") or []):
            pid = p.get("id") or p.get("passage_id")
            if pid is not None:
                passage_text_map[pid] = p.get("text", "") or ""
                passage_text_map[str(pid)] = p.get("text", "") or ""

        # Listening evidence pre-pass — attach audioscript excerpts to each
        # listening question (correct AND wrong) so the "Locate in Audioscript"
        # panel works for the dashboard listening tests, mirroring the
        # cambridge.py route behavior.
        listening_transcripts_map: Dict[int, str] = {}
        if test_type == "listening" and _extract_evidence_text is not None:
            listening_transcripts_map = _resolve_listening_transcripts(test)
            if listening_transcripts_map:
                for qr in question_results:
                    qt_lk = (qr.get("question_type") or "").lower()
                    if not qt_lk or any(
                        k in qt_lk for k in ("multiple", "matching", "multi_select")
                    ):
                        continue
                    qid = qr.get("question_id")
                    part_num = (
                        question_section_map.get(qid)
                        or question_section_map.get(str(qid))
                        or 1
                    )
                    p_text = listening_transcripts_map.get(part_num) or ""
                    if not p_text:
                        continue
                    ca = qr.get("correct_answer")
                    try:
                        ev = _extract_evidence_text(ca, p_text)
                        if ev:
                            qr["evidence_text"] = ev
                    except Exception:
                        pass

        reason_summary: Dict[str, int] = {}
        for qr in question_results:
            if qr.get("is_correct"):
                continue
            ua = qr.get("user_answer")
            ca = qr.get("correct_answer")
            qt = qr.get("question_type") or "unknown"
            if _classify_reason_code is not None:
                try:
                    rc = _classify_reason_code(ua, ca, qt)
                    code = rc.get("code", "WRONG_ANSWER")
                    qr["reason_code"] = code
                    qr["reason_label"] = rc.get("label")
                except Exception:
                    code = "UNANSWERED" if not ua else "WRONG_ANSWER"
                    qr["reason_code"] = code
            else:
                code = "UNANSWERED" if not ua else "WRONG_ANSWER"
                qr["reason_code"] = code
            reason_summary[code] = reason_summary.get(code, 0) + 1

            # Evidence text for "Locate in Text" — only meaningful for reading
            if test_type == "reading" and _extract_evidence_text is not None:
                p_text = passage_text_map.get(qr.get("passage")) \
                    or passage_text_map.get(str(qr.get("passage")))
                if p_text:
                    # For MCQ-style questions the answer is just an option
                    # letter (e.g. "B" or ["B","E"]), which can't be located
                    # verbatim in the passage. Substitute the option TEXT for
                    # those letters so the evidence search can find it.
                    search_input = ca
                    is_mcq = isinstance(qt, str) and "multiple_choice" in qt
                    if is_mcq:
                        opts = question_options_map.get(qr.get("question_id")) \
                            or question_options_map.get(str(qr.get("question_id"))) \
                            or question_options_map.get(qid_normalized)
                        if opts:
                            def _opt_text_for(letter: str) -> str:
                                L = str(letter).strip().upper()
                                for o in opts:
                                    s = str(o).strip()
                                    # Match "B: text", "B. text", "B) text" or "B text"
                                    m = re.match(r"^\s*([A-Za-z])\s*[:.\-)]\s*(.+)$", s)
                                    if m and m.group(1).upper() == L:
                                        return m.group(2).strip()
                                    if s[:1].upper() == L and len(s) > 1 and not s[1:2].isalpha():
                                        return s[1:].lstrip(" :.-)").strip()
                                # Fallback: index by alphabetical order if no label prefix
                                idx_alpha = ord(L) - ord('A')
                                if 0 <= idx_alpha < len(opts):
                                    s = str(opts[idx_alpha]).strip()
                                    m = re.match(r"^\s*([A-Za-z])\s*[:.\-)]\s*(.+)$", s)
                                    return (m.group(2).strip() if m else s)
                                return ""
                            if isinstance(ca, list):
                                expanded = [t for t in (_opt_text_for(c) for c in ca) if t]
                                if expanded:
                                    search_input = expanded
                            elif isinstance(ca, str) and len(ca.strip()) == 1 and ca.strip().isalpha():
                                t = _opt_text_for(ca)
                                if t:
                                    search_input = t
                    try:
                        evidence = _extract_evidence_text(search_input, p_text)
                        if evidence:
                            qr["evidence_text"] = evidence
                    except Exception:
                        pass

            # Skill tip — reason-code aware tip for the user's specific mistake
            if _get_skill_tip is not None:
                try:
                    qr["skill_tip"] = _get_skill_tip(
                        section=test_type,
                        qtype=qt,
                        accuracy=0.0,
                        question_text=qr.get("question_text", ""),
                        correct_ans=ca,
                        user_answer=ua,
                        reason_code=code,
                    )
                except Exception:
                    pass

        if _build_root_cause_analysis is not None:
            try:
                root_cause_analysis = _build_root_cause_analysis(
                    reason_summary, {test_type: question_results}
                )
            except Exception:
                root_cause_analysis = []
        else:
            root_cause_analysis = []

        # Fastest gain: top weak skills sorted by wrong_count desc
        fastest_gain = []
        for s in skill_breakdown:
            wrong_count = max(0, (s.get("total", 0) or 0) - (s.get("correct", 0) or 0))
            if wrong_count <= 0:
                continue
            fastest_gain.append({
                "skill_id": s.get("skill_id"),
                "label": s.get("label"),
                "question_type": s.get("question_type"),
                "wrong_count": wrong_count,
                "total": s.get("total", 0),
                "correct": s.get("correct", 0),
                "expected_recovery": max(1, int(round(wrong_count * 0.7))),
            })
        fastest_gain.sort(key=lambda x: x["wrong_count"], reverse=True)
        fastest_gain = fastest_gain[:3]

        # Recommended lessons — local map keyed by question_type (matches
        # the skill_breakdown items rather than cambridge.py's underscore
        # naming convention).
        _LESSON_MAP = {
            "true_false_notgiven": ("tfng-mastery", "True/False/Not Given Mastery",
                                    "/mastery?section=reading&lesson=tfng",
                                    "IELTS Reading Mastery"),
            "yes_no_notgiven": ("ynng-mastery", "Yes/No/Not Given Strategies",
                                "/mastery?section=reading&lesson=ynng",
                                "IELTS Reading Mastery"),
            "matching_headings": ("headings-mastery", "Matching Headings Technique",
                                  "/mastery?section=reading&lesson=headings",
                                  "IELTS Reading Mastery"),
            "matching_information": ("matching-info", "Matching Information Practice",
                                     "/mastery?section=reading&lesson=matching",
                                     "IELTS Reading Mastery"),
            "sentence_completion": ("sentence-comp", "Sentence Completion Skills",
                                    "/mastery?section=reading&lesson=sentence",
                                    "IELTS Reading Mastery"),
            "summary_completion": ("summary-comp", "Summary Completion Strategy",
                                   "/mastery?section=reading&lesson=summary",
                                   "IELTS Reading Mastery"),
            "note_completion": ("note-comp", "Note Completion Listening",
                                "/mastery?section=listening&lesson=notes",
                                "IELTS Listening Mastery"),
            "form_completion": ("form-comp", "Form Completion Skills",
                                "/mastery?section=listening&lesson=forms",
                                "IELTS Listening Mastery"),
            "map_labeling": ("map-labeling", "Map / Diagram Labelling",
                             "/mastery?section=listening&lesson=map",
                             "IELTS Listening Mastery"),
            "multiple_choice": ("mc-strategy", "Multiple Choice Strategy",
                                "/mastery?section=skills&lesson=mc",
                                "IELTS Skills Mastery"),
            "multiple_choice_two": ("mc-two-strategy", "Multiple Choice (Choose Two)",
                                    "/mastery?section=skills&lesson=mc-two",
                                    "IELTS Skills Mastery"),
            "matching": ("matching-features", "Matching Features",
                         "/mastery?section=listening&lesson=matching",
                         "IELTS Listening Mastery"),
        }
        recommended_lessons: List[Dict[str, Any]] = []
        weak_for_recs = [s for s in skill_breakdown
                         if (s.get("total", 0) or 0) > 0
                         and ((s.get("correct", 0) or 0) / s["total"]) < 0.7]
        weak_for_recs.sort(key=lambda s: (s.get("correct", 0) or 0) / max(1, s.get("total", 1)))
        for s in weak_for_recs[:5]:
            qt = s.get("question_type") or ""
            lm = _LESSON_MAP.get(qt)
            if not lm:
                continue
            lesson_id, title, route, course = lm
            tot = s.get("total", 0) or 0
            cor = s.get("correct", 0) or 0
            ratio = (cor / tot) if tot else 0
            recommended_lessons.append({
                "lesson_id": lesson_id,
                "title": title,
                "course": course,
                "route": route,
                "reason": f"Your {s.get('label','this skill')} accuracy is {cor}/{tot} ({int(ratio*100)}%)",
                "priority": "high" if ratio < 0.4 else "medium",
            })

        duration_minutes = round((submission.time_taken or 0) / 60)

        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=score_percentage,
            band_score=band_score,
            feedback={
                "correct": correct,
                "total": total,
                "percentage": score_percentage,
                "message": f"You got {correct} out of {total} correct.",
                "skill_breakdown": skill_breakdown,
                "teacher_feedback": {
                    "short": short_teacher_feedback,
                    "detailed": detailed_teacher_feedback,
                },
                "question_results": question_results,
                "reason_summary": reason_summary,
                "root_cause_analysis": root_cause_analysis,
                "fastest_gain": fastest_gain,
                "recommended_lessons": recommended_lessons,
                "duration_minutes": duration_minutes,
                "passages": [
                    {"id": p.get("id"), "title": p.get("title"), "text": p.get("text", "")}
                    for p in (test.get("passages") or [])
                ],
                "transcript": listening_transcripts_map,
            },
            time_taken=submission.time_taken,
        )
    else:
        # For writing/speaking, include AI evaluation feedback
        feedback_data = {"message": "AI evaluation complete"}
        band_score = 0.0
        
        if submission.test_type == "writing" and submission.writing_feedback:
            # Extract band scores from writing feedback
            task1_fb = submission.writing_feedback.get("task1", {})
            task2_fb = submission.writing_feedback.get("task2", {})
            task1_band = task1_fb.get("band_score", 0) if task1_fb else 0
            task2_band = task2_fb.get("band_score", 0) if task2_fb else 0
            
            # Calculate overall band (Task 2 is weighted more - 2/3)
            if task1_band and task2_band:
                band_score = round((task1_band + task2_band * 2) / 3 * 2) / 2  # Round to nearest 0.5
            elif task2_band:
                band_score = task2_band
            elif task1_band:
                band_score = task1_band
            
            feedback_data = {
                "message": "Writing evaluated by AI",
                "writing_feedback": submission.writing_feedback,
                "task1": task1_fb,
                "task2": task2_fb,
            }
        
        if submission.test_type == "speaking" and submission.speaking_feedback:
            # Calculate average band from speaking feedback
            speaking_bands = [fb.get("band_score", 0) for fb in submission.speaking_feedback.values() if isinstance(fb, dict)]
            if speaking_bands:
                band_score = round(sum(speaking_bands) / len(speaking_bands) * 2) / 2
            
            feedback_data = {
                "message": "Speaking evaluated by AI",
                "speaking_feedback": submission.speaking_feedback,
            }
        
        attempt = TestAttempt(
            user_id=submission.user_id,
            test_id=submission.test_id,
            test_type=submission.test_type,
            answers=submission.answers,
            score=band_score * 10,  # Convert to percentage-like score
            band_score=band_score,
            feedback=feedback_data,
            time_taken=submission.time_taken,
        )

    # Save attempt
    doc = attempt.model_dump()
    doc["completed_at"] = doc["completed_at"].isoformat()
    if submission.test_type in ("listening", "reading"):
        doc["duration_minutes"] = round((submission.time_taken or 0) / 60)
    await db.test_attempts.insert_one(doc)

    # Update user history
    await db.users.update_one(
        {"id": submission.user_id},
        {"$push": {"test_history": attempt.id}},
    )

    # Return attempt so frontend can navigate to results page
    return attempt


# verify-email -> Moved to routes/auth.py




@router.get("/test_attempts/{attempt_id}")
async def get_test_attempt(attempt_id: str):
    attempt = await db.test_attempts.find_one({"id": attempt_id}, {"_id": 0})
    if not attempt:
        raise HTTPException(status_code=404, detail="Test attempt not found")
    
    # Convert completed_at back to datetime for Pydantic model compatibility if needed
    if isinstance(attempt.get("completed_at"), str):
        try:
            attempt["completed_at"] = datetime.fromisoformat(attempt["completed_at"])
        except Exception:
            pass
    
    # Dynamically add explanations from test answer_key if missing
    feedback = attempt.get("feedback", {})
    question_results = feedback.get("question_results", [])
    
    # Check if explanations are missing
    if question_results and not question_results[0].get("explanation"):
        # Fetch the original test to get explanations
        test = await db.tests.find_one({"id": attempt.get("test_id")}, {"_id": 0})
        if test:
            # Build explanation map from answer_key
            explanation_map = {}
            for item in test.get("answer_key", []):
                q_id = item.get("question_id")
                if q_id is not None:
                    explanation_map[int(q_id)] = item.get("explanation", "")
            
            # Add explanations to question_results
            for q in question_results:
                qid = q.get("question_id")
                if qid and not q.get("explanation"):
                    q["explanation"] = explanation_map.get(int(qid), "")
            
            # Update feedback with explanations
            feedback["question_results"] = question_results
            attempt["feedback"] = feedback
    
    return attempt



# Admin endpoint to add new tests
class CreateTestRequest(BaseModel):
    title: str
    test_type: str
    duration: int
    passages: Optional[List[Dict[str, Any]]] = None
    questions: List[Dict[str, Any]]
    answer_key: List[Dict[str, Any]]

@router.post("/tests")
async def create_test(test_data: CreateTestRequest):
    """Admin endpoint to create new test content"""
    test = {
        "id": str(uuid.uuid4()),
        **test_data.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.tests.insert_one(test)
    return {"message": "Test created successfully", "test_id": test["id"]}
