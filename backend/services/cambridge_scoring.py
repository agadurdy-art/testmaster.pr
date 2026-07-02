"""
Cambridge scoring engine: answer normalization/comparison, answer-key
extraction, multi-select group scoring, reason-code classification,
evidence extraction and IELTS band calculation.
Extracted from routes/cambridge.py (Faz 1 refactor, 2026-07-02).
"""

import re
from typing import Dict, Any

from services.cambridge_feedback import generate_explanation, get_skill_tip


def extract_answer_keys_from_test(test_data: Dict) -> Dict:
    """Extract answer keys from test questions"""
    answer_keys = {
        "listening": {},
        "reading": {}
    }

    sections = test_data.get("sections", {})

    # Extract listening answers
    listening = sections.get("listening", {})
    for part in listening.get("parts", []):
        for q in part.get("questions", []):
            qnum = str(q.get("number", ""))
            qtype = q.get("type", "")

            # Handle matching questions with separate answers dict
            if qtype == "matching" and "answers" in q:
                for qn, ans in q.get("answers", {}).items():
                    answer_keys["listening"][str(qn)] = ans
            # Handle compound question numbers like "14-15"
            elif "-" in qnum:
                answer = q.get("answer", [])
                answer_keys["listening"][qnum] = answer if isinstance(answer, list) else [answer]
            else:
                if q.get("answer"):
                    answer_keys["listening"][qnum] = q.get("answer")

    # Extract reading answers
    reading = sections.get("reading", {})
    for passage in reading.get("passages", []):
        for q in passage.get("questions", []):
            qtype = q.get("type", "")
            qnum = str(q.get("number", ""))

            # Handle questions with "items" array (sentence_completion, table_completion, matching_*, summary_completion)
            if "items" in q:
                for item in q.get("items", []):
                    inum = str(item.get("number", ""))
                    if item.get("answer"):
                        answer_keys["reading"][inum] = item.get("answer")
            # Handle true_false_not_given with statements
            elif qtype in ["true_false_not_given", "true_false_ng", "yes_no_ng"] and "statements" in q:
                for stmt in q.get("statements", []):
                    stnum = str(stmt.get("number", ""))
                    if stmt.get("answer"):
                        answer_keys["reading"][stnum] = stmt.get("answer")
            # Handle table_completion with rows (legacy format)
            elif qtype == "table_completion" and "rows" in q:
                for row in q.get("rows", []):
                    for cell in row.get("cells", []):
                        if isinstance(cell, dict) and cell.get("number"):
                            cnum = str(cell.get("number"))
                            if cell.get("answer"):
                                answer_keys["reading"][cnum] = cell.get("answer")
            # Handle sentence_completion with sentences (legacy format)
            elif "sentences" in q:
                for sent in q.get("sentences", []):
                    snum = str(sent.get("number", ""))
                    if sent.get("answer"):
                        answer_keys["reading"][snum] = sent.get("answer")
            # Handle compound question numbers
            elif "-" in qnum:
                answer = q.get("answer", [])
                if answer:
                    answer_keys["reading"][qnum] = answer if isinstance(answer, list) else [answer]
            # Standard question with direct answer
            else:
                if q.get("answer"):
                    answer_keys["reading"][qnum] = q.get("answer")

    return answer_keys


def _get_passage_texts(section_data: dict) -> dict:
    """Build mapping from passage_number to passage_text for reading sections"""
    texts = {}
    for passage in section_data.get("passages", []):
        pnum = passage.get("passage_number", 1)
        texts[pnum] = passage.get("passage_text", "") or passage.get("text", "") or ""
    return texts


def _build_multi_selection_groups(section: str, section_data: Dict, correct_answers: Dict) -> tuple:
    """Pre-scan a section's questions for multi_selection groups (IELTS
    "Choose TWO/THREE" style). Returns (group_for_qnum, multi_groups) where:

      group_for_qnum: maps a question number string → group_id
      multi_groups:   maps group_id → {user_key, correct_set, qnums}

    Why this exists
    ---------------
    The frontend stores ALL selections in a multi_selection group under ONE
    key (the first item's number, e.g. answers["reading_23"] = ["C","D"]).
    Without this pre-pass the per-question loop would:
      - score Q23 against just "C" → False (list vs scalar branch)
      - score Q24 against just "D" → empty (no answers["reading_24"])
    losing both points. The pre-pass lets us treat the whole group as a
    single set-equality check (mirrors task #140 fix in listening_qb /
    reading_qb), so a correct paired selection scores both items correct.
    """
    group_for_qnum: Dict[str, str] = {}
    multi_groups: Dict[str, Dict[str, Any]] = {}

    multi_types = ("multiple_selection", "multi_mcq", "select_two", "select_three")

    def _norm(x: Any) -> str:
        return str(x).strip().lower().replace(".", "").replace(",", "")

    def _add_to_set(target: set, value: Any) -> None:
        if isinstance(value, list):
            for v in value:
                if v:
                    target.add(_norm(v))
        elif value:
            target.add(_norm(value))

    if section == "reading":
        question_iter = (
            q
            for passage in section_data.get("passages", [])
            for q in passage.get("questions", [])
        )
    else:  # listening
        question_iter = (
            q
            for part in section_data.get("parts", [])
            for q in part.get("questions", [])
        )

    for q in question_iter:
        if q.get("type") not in multi_types:
            continue
        items = q.get("items") or []
        qnum = str(q.get("number", ""))
        # Collect this group's question numbers from items[] or expand a
        # compound number like "14-15" used by listening multi-MCQs.
        if items:
            qnums = [str(it.get("number")) for it in items if it.get("number") is not None]
        elif "-" in qnum:
            try:
                start, end = qnum.split("-")
                qnums = [str(n) for n in range(int(start), int(end) + 1)]
            except ValueError:
                qnums = [qnum]
        else:
            qnums = [qnum]
        if len(qnums) < 2:
            continue
        group_id = ",".join(qnums)
        user_key = f"{section}_{qnums[0]}"
        cset: set = set()
        # Pull correct letters from per-item entries AND from a compound key
        # so we cover both reading-style ("23":"C","24":"D") and listening-
        # style ("14-15":["A","B"]) answer-key shapes.
        compound = correct_answers.get(qnum) or correct_answers.get(group_id)
        _add_to_set(cset, compound)
        for qn in qnums:
            _add_to_set(cset, correct_answers.get(qn))
        multi_groups[group_id] = {
            "user_key": user_key,
            "correct_set": cset,
            "qnums": qnums,
        }
        for qn in qnums:
            group_for_qnum[qn] = group_id
        if "-" in qnum:
            group_for_qnum[qnum] = group_id

    return group_for_qnum, multi_groups


def calculate_section_results(section: str, user_answers: Dict, correct_answers: Dict, test_data: Dict) -> Dict:
    """Calculate detailed results for a section"""
    results = {
        "correct": 0,
        "total": 0,
        "percentage": 0,
        "by_type": {},
        "details": []
    }

    if not correct_answers:
        return results

    # Get question metadata from test data
    question_metadata = {}
    section_data = test_data.get("sections", {}).get(section, {})

    # Pre-scan for multi_selection groups so we can score them as a single
    # set-equality unit instead of two independent comparisons (which loses
    # both items when the frontend stores both selections under one key).
    group_for_qnum, multi_groups = _build_multi_selection_groups(
        section, section_data, correct_answers
    )

    # Listening: build {part_num: transcript_text} so per-question evidence
    # excerpts can be located in the right part's audioscript.
    listening_transcripts: Dict[int, str] = {}
    if section == "listening":
        raw_transcripts = section_data.get("transcripts") or {}
        for k, v in raw_transcripts.items():
            try:
                listening_transcripts[int(k)] = str(v or "")
            except (TypeError, ValueError):
                continue

    if section == "listening":
        for part in section_data.get("parts", []):
            part_num = part.get("part_number", 1)
            for q in part.get("questions", []):
                qtype = q.get("type", "unknown")
                qnum = str(q.get("number", ""))

                # Handle grouped questions with items
                if "items" in q:
                    for item in q.get("items", []):
                        inum = str(item.get("number", ""))
                        if inum:
                            question_metadata[inum] = {"type": qtype, "text": item.get("question_text", ""), "part": part_num}
                # Handle matching with answers dict
                elif qtype == "matching" and "answers" in q:
                    for qn in q.get("answers", {}):
                        question_metadata[str(qn)] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                # Handle individual questions
                elif qnum and "-" not in qnum:
                    question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                # Handle range questions like "11-12"
                elif "-" in qnum:
                    try:
                        start, end = qnum.split("-")
                        for n in range(int(start), int(end) + 1):
                            question_metadata[str(n)] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                        # Also store compound key for answer_key matching
                        question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}
                    except ValueError:
                        question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "part": part_num}

    elif section == "reading":
        for passage in section_data.get("passages", []):
            passage_num = passage.get("passage_number", 1)
            for q in passage.get("questions", []):
                qtype = q.get("type", "unknown")
                qnum = str(q.get("number", ""))

                # Handle questions with items array (matching / section_matching).
                # Cambridge JSON stores the prompt under "item"; older content
                # used "question_text"; we keep "text" as a final fallback.
                if "items" in q:
                    for item in q.get("items", []):
                        inum = str(item.get("number", ""))
                        if inum:
                            text = (
                                item.get("item")
                                or item.get("question_text")
                                or item.get("text")
                                or ""
                            )
                            question_metadata[inum] = {"type": qtype, "text": text, "passage": passage_num}
                # Handle TFNG/YNNG with statements (Cambridge uses "statement")
                elif "statements" in q:
                    for stmt in q.get("statements", []):
                        snum = str(stmt.get("number", ""))
                        if snum:
                            text = stmt.get("statement") or stmt.get("text") or ""
                            question_metadata[snum] = {"type": qtype, "text": text, "passage": passage_num}
                # Sentence-completion with per-sentence text
                elif "sentences" in q:
                    for sent in q.get("sentences", []):
                        snum = str(sent.get("number", ""))
                        if snum:
                            text = sent.get("text") or sent.get("sentence") or ""
                            question_metadata[snum] = {"type": qtype, "text": text, "passage": passage_num}
                # Nested questions array (e.g. multiple_choice 36-40)
                elif "questions" in q and isinstance(q.get("questions"), list):
                    for sub in q["questions"]:
                        snum = str(sub.get("number", ""))
                        if snum:
                            text = sub.get("question") or sub.get("question_text") or sub.get("text") or ""
                            question_metadata[snum] = {"type": qtype, "text": text, "passage": passage_num}
                # Handle table_completion with rows
                elif "rows" in q:
                    for row in q.get("rows", []):
                        for cell in row.get("cells", []):
                            if isinstance(cell, dict) and cell.get("number"):
                                question_metadata[str(cell["number"])] = {"type": qtype, "text": "", "passage": passage_num}
                # Handle individual or range questions
                elif qnum and "-" not in qnum:
                    md = {"type": qtype, "text": q.get("question_text", q.get("question", "")), "passage": passage_num}
                    if isinstance(q.get("options"), list) and q.get("options"):
                        md["options"] = [str(o) for o in q["options"]]
                    question_metadata[qnum] = md
                elif "-" in qnum:
                    try:
                        start, end = qnum.split("-")
                        # For summary_completion, surface the summary block so
                        # users see the surrounding context for each gap.
                        parent_text = q.get("question_text") or q.get("question", "")
                        if not parent_text and isinstance(q.get("summary"), dict):
                            parent_text = q["summary"].get("text", "")
                        opts = [str(o) for o in q["options"]] if isinstance(q.get("options"), list) and q.get("options") else None
                        for n in range(int(start), int(end) + 1):
                            md = {"type": qtype, "text": parent_text, "passage": passage_num}
                            if opts:
                                md["options"] = opts
                            question_metadata[str(n)] = md
                        md_compound = {"type": qtype, "text": parent_text, "passage": passage_num}
                        if opts:
                            md_compound["options"] = opts
                        question_metadata[qnum] = md_compound
                    except ValueError:
                        question_metadata[qnum] = {"type": qtype, "text": q.get("question_text", ""), "passage": passage_num}

    # Track which compound multi-MCQ keys we've already expanded so we
    # don't emit duplicate per-sub-id rows when both the compound key
    # AND per-sub keys are present in correct_answers.
    _expanded_groups: set = set()

    # Evaluate each answer
    for qnum, correct_ans in correct_answers.items():
        qnum_str = str(qnum)
        group_id = group_for_qnum.get(qnum_str)
        if group_id is not None:
            # Multi-MCQ group: per-item SET-MEMBERSHIP scoring (Aga
            # 2026-05-02). Each correct option = 1 mark IF user picked
            # that letter — regardless of click order. Replaces the old
            # all-or-nothing rule: clicking [D,E] vs correct [B,E] now
            # yields Q26 ✓ (E matched) + Q25 ✗ (B missed) instead of 0/2.
            grp = multi_groups[group_id]
            raw_user = user_answers.get(grp["user_key"], [])
            if isinstance(raw_user, list):
                user_list = [x for x in raw_user if x not in (None, "")]
            elif raw_user:
                user_list = [raw_user]
            else:
                user_list = []
            user_set = {str(x).strip().lower().replace(".", "").replace(",", "") for x in user_list}

            # Compound key like "25-26" with list answer ["B","E"] — emit
            # ONE row per sub-id, each scored on its own letter.
            if isinstance(correct_ans, list) and ("-" in qnum_str or "," in qnum_str):
                if group_id in _expanded_groups:
                    continue
                _expanded_groups.add(group_id)
                try:
                    sub_ids = [str(n) for n in (
                        range(int(qnum_str.split("-")[0]), int(qnum_str.split("-")[1]) + 1)
                        if "-" in qnum_str else
                        [int(x.strip()) for x in qnum_str.split(",")]
                    )]
                except (ValueError, IndexError):
                    sub_ids = [qnum_str]
                user_display = ", ".join(str(x).upper() for x in user_list) if user_list else "-"
                for idx, sub_id in enumerate(sub_ids):
                    sub_correct_letter = correct_ans[idx] if idx < len(correct_ans) else ""
                    sub_correct_norm = str(sub_correct_letter).strip().lower().replace(".", "").replace(",", "")
                    is_correct_sub = bool(sub_correct_norm) and sub_correct_norm in user_set

                    sub_meta = question_metadata.get(sub_id) or question_metadata.get(qnum_str, {})
                    sub_qtype = sub_meta.get("type", "unknown")

                    results["total"] += 1
                    if is_correct_sub:
                        results["correct"] += 1
                    if sub_qtype not in results["by_type"]:
                        results["by_type"][sub_qtype] = {"correct": 0, "total": 0}
                    results["by_type"][sub_qtype]["total"] += 1
                    if is_correct_sub:
                        results["by_type"][sub_qtype]["correct"] += 1

                    sub_reason = None
                    if not is_correct_sub:
                        sub_reason = classify_reason_code(user_list, sub_correct_letter, sub_qtype)
                    sub_evidence = ""
                    if section == "reading":
                        passage_num = sub_meta.get("passage", 1)
                        passage_texts = _get_passage_texts(section_data)
                        p_text = passage_texts.get(passage_num, "")
                        if p_text:
                            search_input = _resolve_mcq_search_input(
                                sub_correct_letter, sub_meta.get("options"),
                            ) if "multiple" in (sub_qtype or "") else sub_correct_letter
                            sub_evidence = extract_evidence_text(search_input, p_text)

                    results["details"].append({
                        "question_id": int(sub_id) if str(sub_id).isdigit() else sub_id,
                        "question_type": sub_qtype,
                        "question_text": sub_meta.get("text", ""),
                        "user_answer": user_display,
                        "correct_answer": str(sub_correct_letter).upper(),
                        "is_correct": is_correct_sub,
                        "reason_code": sub_reason.get("code") if sub_reason else None,
                        "reason_label": sub_reason.get("label") if sub_reason else None,
                        "evidence_text": sub_evidence if sub_evidence else None,
                        "explanation": generate_explanation(
                            sub_qtype, sub_correct_letter, is_correct_sub,
                            user_answer=user_list,
                            question_text=sub_meta.get("text", ""),
                            reason_code=sub_reason.get("code") if sub_reason else None,
                        ),
                        "skill_tip": get_skill_tip(
                            section, sub_qtype, 1 if is_correct_sub else 0,
                            question_text=sub_meta.get("text", ""),
                            correct_ans=sub_correct_letter,
                            user_answer=user_list,
                            reason_code=sub_reason.get("code") if sub_reason else None,
                        ),
                    })
                continue  # compound-key branch fully emitted its rows

            # Per-qnum entry inside a multi-MCQ group. Two sub-shapes:
            #   (a) Scalar: {"23":"C", "24":"D"} → correct_ans is "C" / "D"
            #   (b) Mirrored list: {"23":["C","D"], "24":["C","D"]} → list
            # For (b), pick THIS qnum's expected letter via position in the
            # group's ordered qnums (Q23 → idx 0 → "C", Q24 → idx 1 → "D").
            qnums_list = grp.get("qnums") or []
            if isinstance(correct_ans, list):
                try:
                    pos = qnums_list.index(qnum_str)
                except ValueError:
                    pos = 0
                this_letter = correct_ans[pos] if 0 <= pos < len(correct_ans) else ""
            else:
                this_letter = correct_ans
            this_correct_norm = str(this_letter).strip().lower().replace(".", "").replace(",", "") if this_letter else ""
            is_correct = bool(this_correct_norm) and this_correct_norm in user_set
            user_ans = list(user_list) if user_list else ""
            # Override iteration var so display_correct shows just THIS row's
            # letter (e.g. "D") not the combined list ("C, D").
            correct_ans = str(this_letter).upper() if this_letter else correct_ans
        else:
            user_key = f"{section}_{qnum}"
            user_ans = user_answers.get(user_key, "")
            is_correct = compare_answers(user_ans, correct_ans)
        results["total"] += 1
        if is_correct:
            results["correct"] += 1

        # Get question type
        meta = question_metadata.get(str(qnum), {})
        qtype = meta.get("type", "unknown")

        # Update by_type stats
        if qtype not in results["by_type"]:
            results["by_type"][qtype] = {"correct": 0, "total": 0}
        results["by_type"][qtype]["total"] += 1
        if is_correct:
            results["by_type"][qtype]["correct"] += 1

        # Add to details
        # Safely get correct answer for display
        if isinstance(correct_ans, list) and len(correct_ans) > 0:
            display_correct = ", ".join(str(a) for a in correct_ans)
        elif isinstance(correct_ans, str):
            display_correct = correct_ans
        else:
            display_correct = str(correct_ans) if correct_ans else "-"

        # Reason code for wrong answers
        reason = None
        if not is_correct:
            reason = classify_reason_code(user_ans, correct_ans, qtype)

        # Evidence: extract passage excerpt for ALL reading questions (not
        # just wrong ones). Aga: "evidence in passage olmali butun sorular
        # icin reading kisminda" — so users can see the textual basis for
        # the correct answer regardless of whether they got it right.
        evidence_text = ""
        if section == "reading":
            passage_num = meta.get("passage", 1)
            passage_texts = _get_passage_texts(section_data)
            p_text = passage_texts.get(passage_num, "")
            if p_text:
                search_input = _resolve_mcq_search_input(
                    correct_ans, meta.get("options"),
                ) if "multiple" in (qtype or "") else correct_ans
                evidence_text = extract_evidence_text(search_input, p_text)
        elif section == "listening":
            part_num = meta.get("part", 1)
            p_text = listening_transcripts.get(part_num, "")
            # Only extract for question types where the answer is a real word
            # in the transcript (note/short/sentence completion). MCQ/matching
            # answers are letter codes that won't appear verbatim.
            if p_text and qtype and not any(
                k in qtype for k in ("multiple", "matching", "multi_select")
            ):
                evidence_text = extract_evidence_text(correct_ans, p_text)


        results["details"].append({
            "question_id": qnum,
            "question_type": qtype,
            "question_text": meta.get("text", ""),
            "user_answer": user_ans if user_ans else "-",
            "correct_answer": display_correct,
            "is_correct": is_correct,
            "reason_code": reason.get("code") if reason else None,
            "reason_label": reason.get("label") if reason else None,
            "evidence_text": evidence_text if evidence_text else None,
            "explanation": generate_explanation(
                qtype, correct_ans, is_correct,
                user_answer=user_ans,
                question_text=meta.get("text", ""),
                reason_code=reason.get("code") if reason else None,
            ),
            "skill_tip": get_skill_tip(
                section, qtype, 1 if is_correct else 0,
                question_text=meta.get("text", ""),
                correct_ans=correct_ans,
                user_answer=user_ans,
                reason_code=reason.get("code") if reason else None,
            ),
        })

    results["percentage"] = (results["correct"] / results["total"] * 100) if results["total"] > 0 else 0
    return results


def classify_reason_code(user_ans, correct_ans, qtype: str) -> dict:
    """Assign a high-signal reason code for an incorrect answer"""

    REASON_LABELS = {
        "UNANSWERED": "No answer provided",
        "TFNG_CONFUSION": "T/F/NG mix-up",
        "YNNG_CONFUSION": "Y/N/NG mix-up",
        "SPELLING_ERROR": "Spelling mistake",
        "DISTRACTOR_TRAP": "Distractor selected",
        "NEAR_MISS": "Close but incorrect",
        "WRONG_ANSWER": "Incorrect answer",
    }

    def normalize(s):
        return str(s).lower().strip().replace(".", "").replace(",", "")

    # 1. Unanswered
    if not user_ans or (isinstance(user_ans, str) and not user_ans.strip()):
        return {"code": "UNANSWERED", "label": REASON_LABELS["UNANSWERED"]}

    user_norm = normalize(user_ans)

    # 2. TFNG confusion
    if qtype in ("true_false_ng", "true_false_not_given"):
        tfng_set = {"true", "false", "not given"}
        if user_norm in tfng_set:
            return {"code": "TFNG_CONFUSION", "label": REASON_LABELS["TFNG_CONFUSION"]}

    # 3. YNNG confusion
    if qtype in ("yes_no_ng",):
        ynng_set = {"yes", "no", "not given"}
        if user_norm in ynng_set:
            return {"code": "YNNG_CONFUSION", "label": REASON_LABELS["YNNG_CONFUSION"]}

    # 4. Spelling error — check Levenshtein-like similarity
    correct_norms = []
    if isinstance(correct_ans, list):
        correct_norms = [normalize(a) for a in correct_ans]
    elif isinstance(correct_ans, str):
        correct_norms = [normalize(a) for a in correct_ans.split("/")]

    for cn in correct_norms:
        if cn and user_norm and len(user_norm) > 2 and len(cn) > 2:
            # Simple ratio: shared chars / max length
            common = sum(1 for a, b in zip(user_norm, cn) if a == b)
            ratio = common / max(len(user_norm), len(cn))
            if ratio >= 0.7 and ratio < 1.0:
                return {"code": "SPELLING_ERROR", "label": REASON_LABELS["SPELLING_ERROR"]}

    # 5. Distractor trap — for multiple choice
    if qtype in ("multiple_choice", "multiple_selection"):
        return {"code": "DISTRACTOR_TRAP", "label": REASON_LABELS["DISTRACTOR_TRAP"]}

    # 6. Near miss — user wrote something that shares a root with correct answer
    for cn in correct_norms:
        if cn and user_norm and len(cn) > 3 and len(user_norm) > 3:
            if cn[:3] == user_norm[:3] or cn in user_norm or user_norm in cn:
                return {"code": "NEAR_MISS", "label": REASON_LABELS["NEAR_MISS"]}

    return {"code": "WRONG_ANSWER", "label": REASON_LABELS["WRONG_ANSWER"]}


def _find_letter_paragraph(passage_text: str, letter: str) -> str:
    """Cambridge passages for matching/section_matching use letter-prefixed
    paragraphs ("A: Stadiums...", "B: ..."). Return that paragraph's body
    trimmed to a sensible excerpt length so it fits the evidence card."""
    if not passage_text or not letter:
        return ""
    target = letter.strip().upper()
    if len(target) != 1 or not target.isalpha():
        return ""
    for para in re.split(r"\n\s*\n", passage_text):
        m = re.match(r"^\s*([A-Z])\s*[:.\-)]\s*(.+)$", para, re.DOTALL)
        if m and m.group(1).upper() == target:
            body = m.group(2).strip()
            if len(body) > 320:
                cut = body.rfind(". ", 0, 320)
                if cut > 120:
                    body = body[: cut + 1]
                else:
                    body = body[:320].rstrip() + "…"
            return body
    return ""


def _resolve_mcq_search_input(correct_ans, options):
    """For MCQ questions whose correct answer is just an option LETTER,
    return the option's TEXT so extract_evidence_text can locate it in
    the passage. Returns the original `correct_ans` when options aren't
    available or the answer doesn't look like a single-letter pick.
    """
    if not options or not isinstance(options, list):
        return correct_ans
    label_re = re.compile(r"^\s*([A-Za-z])\s*[:.\-)]\s*(.+)$")

    def _text_for(letter: str) -> str:
        L = str(letter).strip().upper()
        if not L:
            return ""
        # Match "B: text", "B. text", "B) text", etc.
        for o in options:
            s = str(o).strip()
            m = label_re.match(s)
            if m and m.group(1).upper() == L:
                return m.group(2).strip()
        # Fallback: positional (A=index 0, B=1, …)
        idx = ord(L) - ord("A")
        if 0 <= idx < len(options):
            s = str(options[idx]).strip()
            m = label_re.match(s)
            return (m.group(2).strip() if m else s)
        return ""

    if isinstance(correct_ans, list):
        expanded = [t for t in (_text_for(c) for c in correct_ans) if t]
        return expanded if expanded else correct_ans
    if isinstance(correct_ans, str) and len(correct_ans.strip()) == 1 and correct_ans.strip().isalpha():
        t = _text_for(correct_ans)
        return t if t else correct_ans
    return correct_ans


def extract_evidence_text(correct_ans, passage_text: str) -> str:
    """Return a passage excerpt that justifies `correct_ans`.

    Strategy:
      1. Single-letter answer + letter-prefixed passage paragraphs → return
         that paragraph (matching / section_matching / summary_completion).
      2. Otherwise locate the correct phrase verbatim and return ±80 chars.
    """
    if not passage_text or not correct_ans:
        return ""

    # Build search terms (handling list answers and "/" alternation).
    search_terms = []
    if isinstance(correct_ans, list):
        search_terms = [str(a) for a in correct_ans]
    elif isinstance(correct_ans, str):
        search_terms = [a.strip() for a in correct_ans.split("/")]

    # Letter-paragraph anchor — only meaningful for single-string answers
    # (matching / section_matching / summary_completion). Multi-MCQ answers
    # are letter LISTS but those letters are MCQ option labels, not passage
    # paragraph labels — anchoring on paragraph "C" is misleading there.
    if isinstance(correct_ans, str):
        t = correct_ans.strip()
        candidate = t
        m = _LABEL_PREFIX_RE.match(t)
        if m:
            candidate = m.group(1)
        if len(candidate) == 1 and candidate.isalpha():
            para = _find_letter_paragraph(passage_text, candidate)
            if para:
                return para

    # Verbatim phrase fallback.
    text_lower = passage_text.lower()
    for term in search_terms:
        term_lower = term.lower().strip()
        if not term_lower or len(term_lower) < 2:
            continue
        # Skip pure single letters here — already handled above.
        if len(term_lower) == 1 and term_lower.isalpha():
            continue
        idx = text_lower.find(term_lower)
        if idx >= 0:
            start = max(0, idx - 80)
            end = min(len(passage_text), idx + len(term_lower) + 80)
            excerpt = passage_text[start:end].strip()
            if start > 0:
                space_idx = excerpt.find(" ")
                if space_idx > 0 and space_idx < 15:
                    excerpt = excerpt[space_idx + 1:]
            if end < len(passage_text):
                space_idx = excerpt.rfind(" ")
                if space_idx > len(excerpt) - 15:
                    excerpt = excerpt[:space_idx]
            return excerpt
    return ""


_LABEL_PREFIX_RE = re.compile(r"^\s*([A-Za-z]{1,3})\s*[:.\-)]\s*(.+)$")


def _normalize_answer(s) -> str:
    return str(s).lower().strip().replace(".", "").replace(",", "")


def _label_variants(s) -> list:
    """Return [original_normalized, label_only_if_present] so a frontend value
    like "H: strategic alliance" matches answer-key entries like "H".
    Used by both compare_answers and classify_reason_code so the two stay in
    sync (otherwise a labelled match still ranked as DISTRACTOR_TRAP)."""
    norm = _normalize_answer(s)
    out = [norm]
    m = _LABEL_PREFIX_RE.match(str(s))
    if m:
        label_only = _normalize_answer(m.group(1))
        if label_only and label_only != norm:
            out.append(label_only)
    return out


def compare_answers(user_ans, correct_ans) -> bool:
    """Compare user answer with correct answer(s).

    Tolerances:
      - case / trailing punctuation (".", ",")
      - "/" alternation in correct answers ("hot/warm")
      - list user_ans vs list correct_ans → set equality (multi-MCQ)
      - label-prefix forms: "H: strategic alliance" matches "H" in either
        direction (frontend dropdowns store the full option string while
        answer keys store only the label letter for matching qtypes).
    """
    if not user_ans or not correct_ans:
        return False

    # Multi-MCQ: list-vs-list set equality.
    if isinstance(user_ans, list):
        if isinstance(correct_ans, list):
            user_set = {_normalize_answer(a) for a in user_ans}
            correct_set = {_normalize_answer(a) for a in correct_ans}
            return user_set == correct_set
        return False

    user_variants = _label_variants(user_ans)

    # Build the candidate correct-answer pool (handles list + "/" alternation).
    if isinstance(correct_ans, list):
        correct_pool = list(correct_ans)
    elif "/" in str(correct_ans):
        correct_pool = str(correct_ans).split("/")
    else:
        correct_pool = [correct_ans]

    correct_variants: list = []
    for c in correct_pool:
        correct_variants.extend(_label_variants(c))

    # Match if any normalized form intersects.
    return any(uv in correct_variants for uv in user_variants)


def calculate_band_from_percentage(percentage: float, section: str = "reading", track: str = "academic") -> float:
    """Backwards-compatible shim. Routes through the official IELTS raw-score
    tables in services.ielts_band_tables instead of equal-width percentage
    buckets — the old buckets were ~one full band off in the 22-29/40 range
    (26/40 Academic Reading was emitting 7.0 instead of the official 6.0).
    Prefer `calculate_band_from_raw(correct, total, section, track)` at new
    call sites."""
    from services.ielts_band_tables import band_for_listening_pct, band_for_reading_pct
    if section == "listening":
        return band_for_listening_pct(percentage)
    return band_for_reading_pct(percentage, track)


def calculate_band_from_raw(correct: int, total: int, section: str = "reading", track: str = "academic") -> float:
    """Preferred entry point for IELTS band conversion. Uses the official
    Cambridge raw-score → band tables. `section` is "reading" or "listening";
    `track` is "academic" or "general" (only consulted for reading)."""
    from services.ielts_band_tables import band_for_listening, band_for_reading
    if section == "listening":
        return band_for_listening(correct, total)
    return band_for_reading(correct, total, track)
