"""
Track-Specific AI Evaluation System
====================================
Provides differentiated evaluation for Academic vs General Training IELTS tracks.

Key Differentiations:
1. Academic Writing: Formal register, academic vocabulary, data interpretation
2. General Training Writing: Appropriate tone/register, practical communication
3. Reading Evaluation: Inference, intention, condition/exception analysis
"""

import os
import json
import re
from typing import Dict, List, Any, Optional
from enum import Enum


class IELTSTrack(str, Enum):
    ACADEMIC = "academic"
    GENERAL = "general"


class TrackSpecificEvaluator:
    """
    Evaluates IELTS responses with track-specific criteria.
    
    Academic Track focuses on:
    - Formal academic register
    - Data interpretation accuracy
    - Academic vocabulary and hedging language
    - Objective analysis
    
    General Training Track focuses on:
    - Appropriate register (formal/semi-formal/informal)
    - Practical communication effectiveness
    - Purpose achievement (complaint, request, explanation)
    - Real-world document comprehension
    """
    
    # Track-Specific Writing Rubrics
    ACADEMIC_WRITING_RUBRICS = {
        "task1": {
            "name": "Academic Task 1 (Data Description)",
            "key_requirements": [
                "Clear overview of main trends/features",
                "Accurate data interpretation",
                "Appropriate use of comparison language",
                "Academic vocabulary for describing changes",
                "Objective, impersonal tone"
            ],
            "band_9_descriptor": "Fully addresses all parts of the task with a clear overview. Presents, highlights and illustrates key features/trends with precision. Uses sophisticated vocabulary for data description.",
            "band_7_descriptor": "Covers requirements of the task. Presents a clear overview of main trends. Clearly presents key features but could be more fully extended.",
            "band_5_descriptor": "Generally addresses the task but may lack clear overview. Presents some key features but may be mechanical or lack precision."
        },
        "task2": {
            "name": "Academic Task 2 (Essay)",
            "key_requirements": [
                "Clear position throughout",
                "Fully developed arguments",
                "Relevant examples and evidence",
                "Academic hedging language",
                "Formal register maintained"
            ],
            "band_9_descriptor": "Presents a fully developed position with relevant, fully extended and well-supported ideas. Uses academic language naturally.",
            "band_7_descriptor": "Presents a clear position with relevant main ideas. Supports ideas with evidence but may over-generalise.",
            "band_5_descriptor": "Expresses a position but development may be unclear. Ideas may be inadequately developed or irrelevant."
        }
    }
    
    GENERAL_WRITING_RUBRICS = {
        "task1": {
            "name": "General Task 1 (Letter Writing)",
            "key_requirements": [
                "Appropriate tone for purpose (formal/semi-formal/informal)",
                "Clear purpose statement",
                "All bullet points addressed",
                "Appropriate opening and closing",
                "Register consistency"
            ],
            "register_guide": {
                "formal": {
                    "contexts": ["complaint to company", "job application", "official request"],
                    "features": ["Dear Sir/Madam", "I am writing to...", "Yours faithfully", "formal vocabulary"],
                    "avoid": ["contractions", "colloquial expressions", "first name basis"]
                },
                "semi_formal": {
                    "contexts": ["letter to landlord", "letter to manager you know", "request to organisation"],
                    "features": ["Dear Mr/Ms X", "I would like to...", "Yours sincerely", "polite but direct"],
                    "avoid": ["overly casual language", "slang"]
                },
                "informal": {
                    "contexts": ["letter to friend", "invitation", "personal news"],
                    "features": ["Dear [First name]", "I wanted to tell you...", "Take care", "contractions OK"],
                    "avoid": ["overly formal phrases", "business language"]
                }
            },
            "band_9_descriptor": "Fully addresses all parts with exactly the right tone. Purpose is immediately clear. Register is perfectly appropriate throughout.",
            "band_7_descriptor": "Covers all requirements with appropriate tone. Purpose is clear. May have minor inconsistencies in register.",
            "band_5_descriptor": "Addresses task but tone may be inconsistent. Purpose may be unclear. Register issues affect communication."
        },
        "task2": {
            "name": "General Task 2 (Essay)",
            "key_requirements": [
                "Clear position on everyday topic",
                "Personal experience welcome",
                "Accessible vocabulary",
                "Logical argument structure",
                "Reader engagement"
            ],
            "band_9_descriptor": "Presents a clear, well-developed position on a general topic. Uses a range of vocabulary naturally. Arguments are logical and engaging.",
            "band_7_descriptor": "Presents a clear position with relevant ideas. May include personal examples. Some over-generalisation.",
            "band_5_descriptor": "Expresses a basic position. Development may be limited. Arguments may lack clear support."
        }
    }
    
    # Reading Evaluation Categories
    READING_EVALUATION_CRITERIA = {
        "inference": {
            "name": "Inference & Implication",
            "description": "Ability to understand implied meaning not directly stated",
            "skill_indicators": [
                "Identifies what is suggested but not explicitly stated",
                "Understands authorial intent",
                "Draws logical conclusions from evidence"
            ],
            "question_types": ["meaning in context", "writer's purpose", "implied information"]
        },
        "intention": {
            "name": "Writer's Intention & Purpose",
            "description": "Understanding why the text was written and what the writer aims to achieve",
            "skill_indicators": [
                "Identifies primary purpose (inform, persuade, instruct)",
                "Recognises target audience",
                "Understands tone and its effect"
            ],
            "question_types": ["purpose questions", "attitude questions", "opinion identification"]
        },
        "condition_exception": {
            "name": "Conditions & Exceptions",
            "description": "Understanding conditional statements, exceptions, and qualifications",
            "skill_indicators": [
                "Identifies conditions and prerequisites",
                "Recognises exceptions to rules",
                "Understands qualifying language"
            ],
            "question_types": ["True/False/Not Given", "matching features", "sentence completion"]
        },
        "factual_detail": {
            "name": "Factual Detail Retrieval",
            "description": "Locating and understanding specific information",
            "skill_indicators": [
                "Locates specific information quickly",
                "Identifies relevant details",
                "Distinguishes facts from opinions"
            ],
            "question_types": ["multiple choice", "short answer", "table completion"]
        },
        "main_idea": {
            "name": "Main Idea & Global Understanding",
            "description": "Understanding the overall message and structure",
            "skill_indicators": [
                "Identifies main argument or thesis",
                "Understands text organisation",
                "Recognises paragraph functions"
            ],
            "question_types": ["heading matching", "summary completion", "title selection"]
        }
    }
    
    # General Training Document Types with specific evaluation focus
    GT_DOCUMENT_EVALUATION = {
        "policy_document": {
            "focus_areas": ["conditions and exceptions", "rights and obligations", "procedures"],
            "key_skills": ["identifying specific requirements", "understanding conditional language", "locating relevant sections"]
        },
        "contract_agreement": {
            "focus_areas": ["terms and conditions", "penalties and consequences", "timeline and deadlines"],
            "key_skills": ["understanding legal language", "identifying obligations", "recognising exceptions"]
        },
        "official_notice": {
            "focus_areas": ["main announcement", "affected parties", "action required"],
            "key_skills": ["extracting key information", "understanding implications", "identifying deadlines"]
        },
        "instruction_manual": {
            "focus_areas": ["steps and sequence", "warnings and cautions", "requirements"],
            "key_skills": ["following procedures", "identifying prerequisites", "understanding safety information"]
        },
        "information_leaflet": {
            "focus_areas": ["services offered", "eligibility criteria", "contact information"],
            "key_skills": ["locating specific details", "understanding categories", "comparing options"]
        }
    }
    
    async def evaluate_writing(
        self,
        response: str,
        task_type: str,  # "task1" or "task2"
        track: IELTSTrack,
        task_data: Dict[str, Any] = None,
        context: str = None  # For GT: "formal", "semi_formal", "informal"
    ) -> Dict[str, Any]:
        """
        Evaluate writing with track-specific criteria.
        """
        word_count = len(response.split())
        
        # Get appropriate rubric
        if track == IELTSTrack.ACADEMIC:
            rubric = self.ACADEMIC_WRITING_RUBRICS.get(task_type, {})
        else:
            rubric = self.GENERAL_WRITING_RUBRICS.get(task_type, {})
        
        # Base evaluation
        evaluation = {
            "track": track.value,
            "task_type": task_type,
            "rubric_used": rubric.get("name", "Unknown"),
            "word_count": word_count,
            "criteria_scores": {},
            "track_specific_feedback": [],
            "improvement_suggestions": []
        }
        
        # Evaluate Task Achievement/Response
        ta_score, ta_feedback = self._evaluate_task_achievement(response, task_type, track, rubric, context)
        evaluation["criteria_scores"]["task_achievement"] = {
            "score": ta_score,
            "feedback": ta_feedback
        }
        
        # Evaluate Coherence and Cohesion
        cc_score, cc_feedback = self._evaluate_coherence(response)
        evaluation["criteria_scores"]["coherence_cohesion"] = {
            "score": cc_score,
            "feedback": cc_feedback
        }
        
        # Evaluate Lexical Resource (track-specific)
        lr_score, lr_feedback = self._evaluate_lexical_track_specific(response, track, task_type, context)
        evaluation["criteria_scores"]["lexical_resource"] = {
            "score": lr_score,
            "feedback": lr_feedback
        }
        
        # Evaluate Grammar
        gr_score, gr_feedback = self._evaluate_grammar(response)
        evaluation["criteria_scores"]["grammatical_range"] = {
            "score": gr_score,
            "feedback": gr_feedback
        }
        
        # Calculate overall band
        scores = [
            ta_score,
            cc_score,
            lr_score,
            gr_score
        ]
        overall_band = round(sum(scores) / len(scores) * 2) / 2
        evaluation["overall_band"] = overall_band
        
        # Add track-specific feedback
        evaluation["track_specific_feedback"] = self._generate_track_feedback(
            track, task_type, ta_score, lr_score, context
        )
        
        # Add improvement suggestions
        evaluation["improvement_suggestions"] = self._generate_track_suggestions(
            track, task_type, evaluation["criteria_scores"], context
        )
        
        # Add AI-powered detailed feedback if available
        try:
            ai_feedback = await self._get_track_ai_feedback(response, track, task_type, overall_band, context)
            evaluation["ai_detailed_feedback"] = ai_feedback
        except:
            evaluation["ai_detailed_feedback"] = None
        
        return evaluation
    
    def evaluate_reading_response(
        self,
        user_answer: str,
        correct_answer: str,
        question_type: str,
        passage_context: str = None,
        track: IELTSTrack = IELTSTrack.GENERAL
    ) -> Dict[str, Any]:
        """
        Evaluate a reading response with skill-based feedback.
        """
        is_correct = self._check_answer(user_answer, correct_answer, question_type)
        
        # Determine which reading skill this tests
        skill_category = self._identify_reading_skill(question_type)
        skill_info = self.READING_EVALUATION_CRITERIA.get(skill_category, {})
        
        evaluation = {
            "is_correct": is_correct,
            "user_answer": user_answer,
            "correct_answer": correct_answer,
            "question_type": question_type,
            "skill_tested": skill_info.get("name", "Unknown"),
            "skill_description": skill_info.get("description", ""),
            "feedback": ""
        }
        
        if is_correct:
            evaluation["feedback"] = f"Correct! You demonstrated strong {skill_info.get('name', 'reading')} skills."
        else:
            evaluation["feedback"] = self._generate_reading_feedback(
                question_type, skill_category, user_answer, correct_answer
            )
            evaluation["skill_tip"] = self._get_skill_improvement_tip(skill_category)
        
        return evaluation
    
    def evaluate_reading_passage(
        self,
        answers: List[Dict[str, Any]],
        questions: List[Dict[str, Any]],
        track: IELTSTrack = IELTSTrack.GENERAL,
        document_type: str = None
    ) -> Dict[str, Any]:
        """
        Evaluate all answers for a reading passage with comprehensive skill analysis.
        """
        total_correct = 0
        skill_performance = {}
        question_results = []
        
        for i, (answer, question) in enumerate(zip(answers, questions)):
            result = self.evaluate_reading_response(
                user_answer=answer.get("answer", ""),
                correct_answer=question.get("answer", ""),
                question_type=question.get("type", ""),
                track=track
            )
            
            question_results.append(result)
            
            if result["is_correct"]:
                total_correct += 1
            
            # Track skill performance
            skill = result["skill_tested"]
            if skill not in skill_performance:
                skill_performance[skill] = {"correct": 0, "total": 0}
            skill_performance[skill]["total"] += 1
            if result["is_correct"]:
                skill_performance[skill]["correct"] += 1
        
        # Calculate overall score
        total_questions = len(questions)
        percentage = (total_correct / total_questions * 100) if total_questions > 0 else 0
        estimated_band = self._percentage_to_band(percentage)
        
        # Generate skill-based analysis
        skill_analysis = []
        for skill, perf in skill_performance.items():
            accuracy = (perf["correct"] / perf["total"] * 100) if perf["total"] > 0 else 0
            skill_analysis.append({
                "skill": skill,
                "accuracy": round(accuracy, 1),
                "correct": perf["correct"],
                "total": perf["total"],
                "status": "Strong" if accuracy >= 75 else "Needs Practice" if accuracy >= 50 else "Focus Area"
            })
        
        # Sort by accuracy (lowest first = most need improvement)
        skill_analysis.sort(key=lambda x: x["accuracy"])
        
        # Document-type specific feedback for General Training
        document_feedback = None
        if track == IELTSTrack.GENERAL and document_type:
            document_feedback = self._get_document_type_feedback(document_type, skill_analysis)
        
        return {
            "track": track.value,
            "total_correct": total_correct,
            "total_questions": total_questions,
            "percentage": round(percentage, 1),
            "estimated_band": estimated_band,
            "question_results": question_results,
            "skill_analysis": skill_analysis,
            "strengths": [s for s in skill_analysis if s["status"] == "Strong"],
            "improvement_areas": [s for s in skill_analysis if s["status"] == "Focus Area"],
            "document_type_feedback": document_feedback
        }
    
    def _evaluate_task_achievement(
        self,
        response: str,
        task_type: str,
        track: IELTSTrack,
        rubric: Dict,
        context: str = None
    ) -> tuple:
        """Evaluate Task Achievement with track-specific criteria."""
        response_lower = response.lower()
        word_count = len(response.split())
        score = 6.0
        feedback_parts = []
        
        # Word count check
        if task_type == "task1":
            min_words = 150
        else:
            min_words = 250
        
        if word_count >= min_words:
            score += 0.5
            feedback_parts.append("Word count meets requirements")
        else:
            score -= 0.5
            feedback_parts.append(f"Word count ({word_count}) below minimum ({min_words})")
        
        # Track-specific checks
        if track == IELTSTrack.ACADEMIC:
            # Check for academic features
            if task_type == "task1":
                # Data description features
                overview_words = ["overall", "in general", "main trend", "broadly"]
                has_overview = any(w in response_lower for w in overview_words)
                if has_overview:
                    score += 0.5
                    feedback_parts.append("Clear overview provided")
                else:
                    feedback_parts.append("Missing clear overview of main trends")
                
                # Data vocabulary
                data_words = ["increased", "decreased", "rose", "fell", "peaked", "fluctuated", "remained stable"]
                data_vocab_count = sum(1 for w in data_words if w in response_lower)
                if data_vocab_count >= 3:
                    score += 0.5
                    feedback_parts.append("Good use of data description vocabulary")
        
        else:  # General Training
            if task_type == "task1":
                # Letter writing checks
                if context:
                    register_check = self._check_register(response, context)
                    if register_check["appropriate"]:
                        score += 0.5
                        feedback_parts.append(f"Register appropriate for {context} letter")
                    else:
                        score -= 0.5
                        feedback_parts.append(register_check["issue"])
                
                # Check letter structure
                has_opening = any(w in response_lower for w in ["dear", "hi", "hello"])
                has_closing = any(w in response_lower for w in ["yours", "regards", "best", "take care", "sincerely"])
                
                if has_opening and has_closing:
                    score += 0.5
                    feedback_parts.append("Appropriate letter format with opening and closing")
                else:
                    feedback_parts.append("Check letter format (opening/closing)")
        
        score = max(4.0, min(9.0, score))
        return score, "; ".join(feedback_parts)
    
    def _evaluate_coherence(self, response: str) -> tuple:
        """Evaluate Coherence and Cohesion."""
        response_lower = response.lower()
        score = 6.0
        feedback_parts = []
        
        # Paragraphing
        paragraphs = [p for p in response.split('\n\n') if p.strip()]
        if len(paragraphs) >= 3:
            score += 0.5
            feedback_parts.append("Good paragraph structure")
        elif len(paragraphs) == 2:
            feedback_parts.append("Consider using more paragraphs")
        else:
            score -= 0.5
            feedback_parts.append("Improve paragraphing")
        
        # Cohesive devices
        devices = ["however", "moreover", "furthermore", "therefore", "in addition", 
                   "for example", "in contrast", "similarly", "consequently"]
        device_count = sum(1 for d in devices if d in response_lower)
        
        if device_count >= 5:
            score += 0.5
            feedback_parts.append("Excellent use of cohesive devices")
        elif device_count >= 3:
            feedback_parts.append("Good use of linking words")
        else:
            feedback_parts.append("Use more cohesive devices to connect ideas")
        
        score = max(4.0, min(9.0, score))
        return score, "; ".join(feedback_parts)
    
    def _evaluate_lexical_track_specific(
        self,
        response: str,
        track: IELTSTrack,
        task_type: str,
        context: str = None
    ) -> tuple:
        """Evaluate Lexical Resource with track-specific criteria."""
        words = response.lower().split()
        unique_words = set(words)
        score = 6.0
        feedback_parts = []
        
        # Basic vocabulary diversity
        ttr = len(unique_words) / len(words) if words else 0
        if ttr >= 0.55:
            score += 0.5
            feedback_parts.append("Good vocabulary diversity")
        elif ttr < 0.4:
            score -= 0.5
            feedback_parts.append("Consider using more varied vocabulary")
        
        if track == IELTSTrack.ACADEMIC:
            # Academic vocabulary check
            academic_words = [
                "significant", "considerable", "substantial", "demonstrate",
                "indicate", "suggest", "whereas", "nevertheless", "furthermore",
                "consequently", "predominantly", "approximately", "proportion"
            ]
            academic_count = sum(1 for w in academic_words if w in response.lower())
            
            if academic_count >= 5:
                score += 0.5
                feedback_parts.append("Strong academic vocabulary")
            elif academic_count >= 2:
                feedback_parts.append("Some academic vocabulary present")
            else:
                feedback_parts.append("Include more academic vocabulary")
        
        else:  # General Training
            if task_type == "task1" and context:
                # Check register-appropriate vocabulary
                if context == "formal":
                    formal_phrases = ["i am writing to", "i would appreciate", "please find", 
                                     "i look forward to", "at your earliest convenience"]
                    formal_count = sum(1 for p in formal_phrases if p in response.lower())
                    if formal_count >= 2:
                        score += 0.5
                        feedback_parts.append("Appropriate formal expressions used")
                    else:
                        feedback_parts.append("Use more formal expressions")
                
                elif context == "informal":
                    informal_markers = ["'m", "'re", "'ll", "'ve", "can't", "won't", "!"]
                    informal_count = sum(1 for m in informal_markers if m in response)
                    if informal_count >= 2:
                        score += 0.5
                        feedback_parts.append("Natural informal tone")
        
        score = max(4.0, min(9.0, score))
        return score, "; ".join(feedback_parts)
    
    def _evaluate_grammar(self, response: str) -> tuple:
        """Evaluate Grammatical Range and Accuracy."""
        sentences = re.split(r'[.!?]+', response)
        sentences = [s.strip() for s in sentences if s.strip()]
        score = 6.0
        feedback_parts = []
        
        # Sentence variety
        complex_markers = ["which", "that", "who", "although", "because", "while", "if", "when"]
        complex_count = sum(1 for s in sentences if any(m in s.lower() for m in complex_markers))
        complex_ratio = complex_count / len(sentences) if sentences else 0
        
        if complex_ratio >= 0.4:
            score += 0.5
            feedback_parts.append("Good variety of sentence structures")
        elif complex_ratio < 0.2:
            score -= 0.5
            feedback_parts.append("Use more complex sentences")
        
        score = max(4.0, min(9.0, score))
        return score, "; ".join(feedback_parts)
    
    def _check_register(self, response: str, context: str) -> Dict:
        """Check if register matches the required context."""
        response_lower = response.lower()
        
        if context == "formal":
            # Check for inappropriate informal markers
            informal_markers = ["hey", "gonna", "wanna", "stuff", "things", "!!!"]
            has_informal = any(m in response_lower for m in informal_markers)
            
            if has_informal:
                return {"appropriate": False, "issue": "Informal language in formal letter"}
            return {"appropriate": True}
        
        elif context == "informal":
            # Check for overly formal language
            overly_formal = ["hereby", "aforementioned", "per your request", "pursuant to"]
            has_overly_formal = any(f in response_lower for f in overly_formal)
            
            if has_overly_formal:
                return {"appropriate": False, "issue": "Overly formal language for informal letter"}
            return {"appropriate": True}
        
        return {"appropriate": True}
    
    def _generate_track_feedback(
        self,
        track: IELTSTrack,
        task_type: str,
        ta_score: float,
        lr_score: float,
        context: str = None
    ) -> List[str]:
        """Generate track-specific feedback points."""
        feedback = []
        
        if track == IELTSTrack.ACADEMIC:
            if task_type == "task1":
                if ta_score < 7:
                    feedback.append("Academic Task 1 requires a clear overview of main trends/features")
                    feedback.append("Include specific data points to support your descriptions")
                if lr_score < 7:
                    feedback.append("Use academic vocabulary: 'significant increase', 'gradual decline', 'remained stable'")
            else:
                if ta_score < 7:
                    feedback.append("Develop your argument with clear topic sentences and supporting evidence")
                if lr_score < 7:
                    feedback.append("Include hedging language: 'tends to', 'generally', 'may suggest'")
        
        else:  # General Training
            if task_type == "task1":
                if context == "formal":
                    feedback.append("Maintain formal register throughout: 'I am writing to enquire...', 'I would be grateful if...'")
                elif context == "semi_formal":
                    feedback.append("Balance politeness with directness in semi-formal letters")
                elif context == "informal":
                    feedback.append("Informal letters can include contractions and casual expressions")
                
                if ta_score < 7:
                    feedback.append("Address all bullet points clearly and in appropriate detail")
        
        return feedback
    
    def _generate_track_suggestions(
        self,
        track: IELTSTrack,
        task_type: str,
        criteria_scores: Dict,
        context: str = None
    ) -> List[str]:
        """Generate specific improvement suggestions."""
        suggestions = []
        
        if track == IELTSTrack.GENERAL and task_type == "task1":
            suggestions.append("Practice writing letters for different purposes: complaint, request, invitation")
            suggestions.append("Learn the appropriate tone for each register (formal/semi-formal/informal)")
            suggestions.append("Study letter openings and closings for different situations")
        elif track == IELTSTrack.ACADEMIC and task_type == "task1":
            suggestions.append("Practice describing different types of visual data (charts, graphs, tables)")
            suggestions.append("Build vocabulary for trends: 'surge', 'plummet', 'fluctuate', 'plateau'")
            suggestions.append("Always include an overview paragraph highlighting main features")
        
        return suggestions[:5]
    
    def _check_answer(self, user_answer: str, correct_answer: str, question_type: str) -> bool:
        """Check if user's answer is correct."""
        user = user_answer.strip().lower()
        correct = correct_answer.strip().lower()
        
        # Exact match for T/F/NG
        if question_type == "true_false_ng":
            return user == correct
        
        # For short answers, allow some flexibility
        if question_type == "short_answer":
            return user == correct or correct in user or user in correct
        
        # Multiple choice - exact match
        return user == correct
    
    def _identify_reading_skill(self, question_type: str) -> str:
        """Identify which reading skill a question tests."""
        skill_mapping = {
            "true_false_ng": "condition_exception",
            "multiple_choice": "inference",
            "short_answer": "factual_detail",
            "matching": "main_idea",
            "summary": "main_idea",
            "heading": "main_idea"
        }
        return skill_mapping.get(question_type, "factual_detail")
    
    def _generate_reading_feedback(
        self,
        question_type: str,
        skill_category: str,
        user_answer: str,
        correct_answer: str
    ) -> str:
        """Generate helpful feedback for incorrect reading answers."""
        
        if skill_category == "condition_exception":
            return f"Look carefully for conditions, exceptions, or qualifying language in the text. The answer was '{correct_answer}'."
        elif skill_category == "inference":
            return f"Consider what the text implies rather than what it explicitly states. The correct answer was '{correct_answer}'."
        elif skill_category == "factual_detail":
            return f"Scan the passage for specific details mentioned. The answer was '{correct_answer}'."
        elif skill_category == "main_idea":
            return f"Focus on the overall message or purpose of the paragraph/section. The answer was '{correct_answer}'."
        
        return f"The correct answer was '{correct_answer}'."
    
    def _get_skill_improvement_tip(self, skill_category: str) -> str:
        """Get improvement tip for a reading skill."""
        tips = {
            "inference": "Practice identifying implied meanings by asking 'What does the author suggest?' rather than 'What does the text say?'",
            "intention": "When reading, always ask yourself: Why was this written? Who is the intended audience?",
            "condition_exception": "Pay attention to words like 'unless', 'except', 'only if', 'provided that' - they signal conditions and exceptions.",
            "factual_detail": "Practice scanning techniques: look for key words from the question in the text.",
            "main_idea": "Read topic sentences (usually first sentence of paragraphs) to understand main ideas quickly."
        }
        return tips.get(skill_category, "Review the relevant section of the passage carefully.")
    
    def _get_document_type_feedback(
        self,
        document_type: str,
        skill_analysis: List[Dict]
    ) -> str:
        """Generate feedback specific to document type for General Training."""
        doc_info = self.GT_DOCUMENT_EVALUATION.get(document_type, {})
        focus_areas = doc_info.get("focus_areas", [])
        key_skills = doc_info.get("key_skills", [])
        
        weak_skills = [s["skill"] for s in skill_analysis if s["status"] == "Focus Area"]
        
        if document_type == "policy_document":
            return f"When reading policy documents, focus on: {', '.join(focus_areas)}. Practice {', '.join(key_skills[:2])}."
        elif document_type == "contract_agreement":
            return f"Contracts require careful attention to: {', '.join(focus_areas)}. Key skills: {', '.join(key_skills[:2])}."
        
        return f"For {document_type.replace('_', ' ')}s, pay attention to: {', '.join(focus_areas[:2])}."
    
    def _percentage_to_band(self, percentage: float) -> float:
        """Convert percentage to estimated IELTS band."""
        if percentage >= 90:
            return 9.0
        elif percentage >= 80:
            return 8.0
        elif percentage >= 70:
            return 7.0
        elif percentage >= 60:
            return 6.0
        elif percentage >= 50:
            return 5.0
        elif percentage >= 40:
            return 4.0
        else:
            return 3.0
    
    async def _get_track_ai_feedback(
        self,
        response: str,
        track: IELTSTrack,
        task_type: str,
        band: float,
        context: str = None
    ) -> Optional[str]:
        """Get AI-powered track-specific feedback."""
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
            
            llm = LlmChat(
                api_key=os.environ.get("EMERGENT_LLM_KEY"),
                model="gpt-4o"
            )
            
            track_context = ""
            if track == IELTSTrack.ACADEMIC:
                track_context = "This is an ACADEMIC IELTS response. Focus feedback on: academic vocabulary, formal register, data interpretation (Task 1) or argument development (Task 2)."
            else:
                if context:
                    track_context = f"This is a GENERAL TRAINING {context.upper()} letter. Focus feedback on: appropriate register, tone consistency, purpose achievement."
                else:
                    track_context = "This is a GENERAL TRAINING response. Focus feedback on: appropriate register, practical communication, real-world relevance."
            
            prompt = f"""As an IELTS examiner, provide 3 specific, actionable tips to improve this Band {band} {track.value.title()} {task_type} response.

{track_context}

RESPONSE (first 500 characters):
{response[:500]}...

Provide track-specific feedback. Be concise and practical."""
            
            result = await llm.chat([UserMessage(content=prompt)])
            return result.strip()
        except Exception as e:
            print(f"AI feedback error: {e}")
            return None


# Create singleton instance
track_evaluator = TrackSpecificEvaluator()
