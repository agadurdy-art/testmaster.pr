"""
Enhanced Adaptive Level Test Backend
- Band Range: 2.0 - 9.0
- Detailed feedback with specific errors
- Learning path recommendations
- English only (for now)
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime, timezone
import os
import json
import logging
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Import question banks
from adaptive_level_test_data import (
    READING_QUESTIONS, LISTENING_QUESTIONS, WRITING_PROMPTS,
    SPEAKING_PROMPTS, ADAPTIVE_RULES, BAND_SCORE_RANGES
)

logger = logging.getLogger(__name__)

# ============ REQUEST MODELS ============

class InitialAssessmentRequest(BaseModel):
    user_id: Optional[str] = None
    experience_level: str  # "beginner", "elementary", "intermediate", "advanced"

class AdaptiveTestRequest(BaseModel):
    user_id: Optional[str] = None
    initial_level: str  # Starting CEFR level
    reading_answers: Dict[str, str]
    listening_answers: Optional[Dict[str, str]] = {}
    writing_response: Optional[str] = ""
    speaking_responses: List[Dict[str, Any]] = []
    test_duration_seconds: int

class DetailedFeedbackResponse(BaseModel):
    overall_band: float
    cefr_level: str
    reading_band: float
    listening_band: float
    writing_band: float
    speaking_band: float
    detailed_analysis: Dict[str, Any]
    learning_path: List[Dict[str, Any]]
    next_steps: List[str]
    estimated_time_to_next_band: str

# ============ HELPER FUNCTIONS ============

def determine_starting_level(experience: str) -> str:
    """Map user's self-assessment to starting CEFR level"""
    mapping = {
        "beginner": "A1",
        "elementary": "A2",
        "intermediate": "B1",
        "advanced": "B2"
    }
    return mapping.get(experience, "A2")

def get_adaptive_questions(level: str, skill: str) -> List[Dict]:
    """Get questions for a specific level and skill"""
    if skill == "reading":
        return READING_QUESTIONS.get(level, [])
    elif skill == "listening":
        return LISTENING_QUESTIONS.get(level, [])
    return []

def calculate_reading_band(answers: Dict[str, str], questions_attempted: List[str]) -> tuple:
    """
    Calculate reading band score based on adaptive results
    Returns: (band_score, accuracy, level_reached, errors)
    """
    correct_count = 0
    total_questions = 0
    highest_level = "A1"
    errors = []
    
    for q_id, user_answer in answers.items():
        # Find the question
        for level, questions in READING_QUESTIONS.items():
            for q in questions:
                if q["id"] == q_id:
                    total_questions += 1
                    if user_answer.upper() == q["correct"].upper():
                        correct_count += 1
                        # Track highest level where user got correct answers
                        if level > highest_level:
                            highest_level = level
                    else:
                        errors.append({
                            "question_id": q_id,
                            "question": q["question"],
                            "your_answer": user_answer,
                            "correct_answer": q["correct"],
                            "level": level
                        })
                    break
    
    accuracy = correct_count / total_questions if total_questions > 0 else 0
    
    # Estimate band based on highest level reached and accuracy
    level_bands = {
        "A1": 2.5,
        "A2": 4.0,
        "B1": 5.5,
        "B2": 6.5,
        "C1": 7.5,
        "C2": 8.5
    }
    
    base_band = level_bands.get(highest_level, 4.0)
    
    # Adjust based on accuracy at that level
    if accuracy >= 0.8:
        band_score = base_band + 0.5
    elif accuracy >= 0.6:
        band_score = base_band
    else:
        band_score = max(2.0, base_band - 0.5)
    
    return (round(band_score, 1), accuracy, highest_level, errors)

async def evaluate_writing_detailed(writing_text: str, target_level: str) -> Dict:
    """
    Evaluate writing with detailed error analysis
    Returns band score and specific feedback
    """
    if not writing_text or len(writing_text.strip()) < 20:
        return {
            "band": 2.0,
            "feedback": "Response too short or empty",
            "errors": [],
            "strengths": []
        }
    
    try:
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            model="claude-3-7-sonnet-20250219"
        )
        
        prompt = f"""You are an IELTS examiner. Evaluate this writing response and provide detailed feedback.

TARGET LEVEL: {target_level}

WRITING RESPONSE:
{writing_text}

Evaluate based on IELTS Writing criteria:
1. Task Achievement (2.0-9.0 scale)
2. Coherence & Cohesion
3. Lexical Resource (vocabulary)
4. Grammatical Range & Accuracy

Provide feedback in this JSON format:
{{
    "band_score": 5.5,
    "task_achievement": {{
        "score": 5.5,
        "feedback": "..."
    }},
    "coherence_cohesion": {{
        "score": 5.0,
        "feedback": "...",
        "linking_words_used": ["however", "moreover"],
        "paragraphing": "needs improvement"
    }},
    "lexical_resource": {{
        "score": 6.0,
        "feedback": "...",
        "vocabulary_range": "adequate",
        "repetition_issues": ["uses 'very' 5 times"],
        "good_collocations": ["make a decision", "take into account"]
    }},
    "grammar": {{
        "score": 5.5,
        "feedback": "...",
        "error_examples": [
            {{"error": "I am work", "correction": "I work", "rule": "Don't use 'am' with base verb"}},
            {{"error": "peoples", "correction": "people", "rule": "People is already plural"}}
        ],
        "sentence_variety": "mostly simple sentences"
    }},
    "word_count": 156,
    "spelling_errors": 3,
    "strengths": ["Clear main idea", "Good use of examples"],
    "main_weaknesses": ["Limited vocabulary", "Grammar errors"],
    "specific_advice": ["Practice using present perfect tense", "Learn more linking words"]
}}

BE HONEST and SPECIFIC. If the writing is poor, say so. Provide actual examples from the text."""

        response = await chat.send_message(UserMessage(text=prompt))
        result_text = response.text.strip()
        
        # Extract JSON
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(result_text)
        
    except Exception as e:
        logger.error(f"Writing evaluation error: {e}")
        return {
            "band": 4.0,
            "feedback": "Could not evaluate writing",
            "errors": [],
            "strengths": []
        }

async def evaluate_speaking_detailed(transcripts: List[Dict], target_level: str) -> Dict:
    """
    Evaluate speaking with detailed error analysis
    Analyze: fluency, pronunciation, vocabulary, grammar
    """
    if not transcripts:
        return {
            "band": 2.0,
            "feedback": "No speaking responses recorded",
            "errors": []
        }
    
    try:
        # Combine all transcripts
        full_transcript = "\n\n".join([
            f"Q: {t['question']}\nA: {t['transcript']}"
            for t in transcripts
        ])
        
        chat = LlmChat(
            api_key=os.getenv("EMERGENT_LLM_KEY"),
            model="claude-3-7-sonnet-20250219"
        )
        
        prompt = f"""You are an IELTS speaking examiner. Evaluate these speaking responses in detail.

TARGET LEVEL: {target_level}

SPEAKING TRANSCRIPT:
{full_transcript}

Evaluate on 4 criteria (Band 2.0-9.0):
1. Fluency & Coherence
2. Lexical Resource (vocabulary)
3. Grammatical Range & Accuracy
4. Pronunciation (inferred from transcript quality)

Provide feedback in this JSON format:
{{
    "band_score": 5.5,
    "fluency_coherence": {{
        "score": 5.5,
        "feedback": "...",
        "hesitations": "some pauses noted",
        "self_corrections": 2,
        "discourse_markers": ["well", "actually"]
    }},
    "lexical_resource": {{
        "score": 5.0,
        "feedback": "...",
        "vocabulary_range": "limited",
        "word_count": 120,
        "unique_words": 45,
        "repetitions": ["very", "good", "I think"],
        "topic_vocabulary": ["minimal"]
    }},
    "grammar": {{
        "score": 5.5,
        "feedback": "...",
        "error_examples": [
            {{"error": "I go yesterday", "correction": "I went yesterday", "rule": "Use past tense"}},
            {{"error": "She don't like", "correction": "She doesn't like", "rule": "Third person singular"}}
        ],
        "tense_variety": ["present simple only"],
        "complex_sentences": 0
    }},
    "pronunciation": {{
        "score": 5.0,
        "feedback": "...",
        "likely_issues": ["final consonants", "word stress"],
        "intelligibility": "mostly understandable"
    }},
    "strengths": ["Attempts to answer all questions", "Uses some connectors"],
    "main_weaknesses": ["Very limited vocabulary", "Only simple tenses", "Many basic errors"],
    "specific_advice": [
        "Practice using past tense verbs correctly",
        "Learn 10-15 new words daily",
        "Record yourself and listen back",
        "Practice pronunciation of word endings"
    ]
}}

BE SPECIFIC and HONEST."""

        response = await chat.send_message(UserMessage(text=prompt))
        result_text = response.text.strip()
        
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].split("```")[0].strip()
        
        return json.loads(result_text)
        
    except Exception as e:
        logger.error(f"Speaking evaluation error: {e}")
        return {
            "band": 4.0,
            "feedback": "Could not evaluate speaking",
            "errors": []
        }

def generate_learning_path(overall_band: float, skill_bands: Dict[str, float]) -> List[Dict]:
    """
    Generate personalized learning path based on results
    """
    path = []
    
    # Determine weakest skills
    sorted_skills = sorted(skill_bands.items(), key=lambda x: x[1])
    weakest_skill, weakest_band = sorted_skills[0]
    
    # Phase 1: Foundation (if band < 4.0)
    if overall_band < 4.0:
        path.append({
            "phase": 1,
            "title": "Foundation Building (4-6 weeks)",
            "level": "A1-A2",
            "courses": [
                {
                    "name": "English Basics: From Zero to Hero",
                    "duration": "2 weeks",
                    "content": "Alphabet, pronunciation, 500 basic words, simple grammar",
                    "price": "FREE",
                    "priority": "HIGHEST"
                },
                {
                    "name": "Grammar Fundamentals",
                    "duration": "2 weeks",
                    "content": "Present simple, to be, basic questions",
                    "price": "FREE",
                    "priority": "HIGH"
                },
                {
                    "name": "Daily English Conversations",
                    "duration": "2 weeks",
                    "content": "Greetings, introductions, daily routines",
                    "price": "FREE",
                    "priority": "HIGH"
                }
            ],
            "daily_practice": [
                "Learn 10-15 new words with flashcards (15 min)",
                "Practice pronunciation with AI (10 min)",
                "Watch simple English videos (10 min)",
                "Speak with AI mentor (15 min)"
            ]
        })
    
    # Phase 2: Elementary (if band 4.0-5.0)
    if 3.5 <= overall_band < 5.5:
        path.append({
            "phase": 2,
            "title": "Elementary Development (6-8 weeks)",
            "level": "A2-B1",
            "courses": [
                {
                    "name": "Speaking Practice A2",
                    "duration": "3 weeks",
                    "content": "Introduce yourself, talk about family, hobbies, work",
                    "price": "$29/month",
                    "priority": "HIGH" if weakest_skill == "speaking" else "MEDIUM"
                },
                {
                    "name": "Writing Simple Paragraphs",
                    "duration": "3 weeks",
                    "content": "Sentence structure, punctuation, short paragraphs",
                    "price": "$29/month",
                    "priority": "HIGH" if weakest_skill == "writing" else "MEDIUM"
                },
                {
                    "name": "Reading for Beginners",
                    "duration": "2 weeks",
                    "content": "Simple texts, vocabulary in context",
                    "price": "$29/month",
                    "priority": "HIGH" if weakest_skill == "reading" else "MEDIUM"
                }
            ]
        })
    
    # Phase 3: Pre-IELTS (if band 5.0-6.5)
    if 5.0 <= overall_band < 6.5:
        path.append({
            "phase": 3,
            "title": "Pre-IELTS Preparation (8-10 weeks)",
            "level": "B1-B2",
            "courses": [
                {
                    "name": "Pre-IELTS Foundation",
                    "duration": "4 weeks",
                    "content": "IELTS introduction, question types, strategies",
                    "price": "$49/month",
                    "priority": "HIGHEST"
                },
                {
                    "name": "Academic Vocabulary Builder",
                    "duration": "3 weeks",
                    "content": "1000 academic words, collocations, topic vocabulary",
                    "price": "$29/month",
                    "priority": "HIGH"
                },
                {
                    "name": "Grammar Intermediate",
                    "duration": "3 weeks",
                    "content": "All tenses, conditionals, passive voice, complex sentences",
                    "price": "$29/month",
                    "priority": "HIGH"
                }
            ]
        })
    
    # Phase 4: IELTS Ready (if band 6.5+)
    if overall_band >= 6.5:
        path.append({
            "phase": 4,
            "title": "IELTS Mastery (6-8 weeks)",
            "level": "B2-C1",
            "courses": [
                {
                    "name": "IELTS Band 7+ Strategies",
                    "duration": "4 weeks",
                    "content": "Advanced techniques, time management, band 7-9 answers",
                    "price": "$79/month",
                    "priority": "HIGHEST"
                },
                {
                    "name": "Academic Writing Task 2 Mastery",
                    "duration": "3 weeks",
                    "content": "Essay structures, advanced arguments, band 7-8 models",
                    "price": "$49/month",
                    "priority": "HIGH"
                },
                {
                    "name": "Speaking Fluency & Confidence",
                    "duration": "4 weeks",
                    "content": "Part 2 long turn, Part 3 discussions, pronunciation refinement",
                    "price": "$49/month",
                    "priority": "HIGH"
                }
            ]
        })
    
    return path

# ============ API ENDPOINTS ============

# This will be added to the main server.py router
def register_adaptive_test_routes(api_router: APIRouter, db):
    
    @api_router.post("/adaptive-level-test/start")
    async def start_adaptive_test(request: InitialAssessmentRequest):
        """Get starting questions based on user's self-assessment"""
        starting_level = determine_starting_level(request.experience_level)
        
        # Get first set of reading questions
        reading_questions = get_adaptive_questions(starting_level, "reading")
        
        return {
            "starting_level": starting_level,
            "reading_questions": reading_questions[:3],  # First 3 questions
            "instructions": {
                "reading": "Answer these questions. We'll adapt the difficulty based on your performance.",
                "time_limit": "No strict time limit, but try to answer within 15 minutes"
            }
        }
    
    @api_router.post("/adaptive-level-test/evaluate")
    async def evaluate_adaptive_test(request: AdaptiveTestRequest):
        """
        Evaluate complete adaptive test with detailed feedback
        Returns band scores (2.0-9.0) and specific error analysis
        """
        try:
            # 1. Calculate Reading Band
            reading_band, reading_accuracy, reading_level, reading_errors = calculate_reading_band(
                request.reading_answers,
                []
            )
            
            # 2. Evaluate Writing (if provided)
            writing_band = 2.0
            writing_analysis = {}
            if request.writing_response and len(request.writing_response) > 20:
                writing_analysis = await evaluate_writing_detailed(
                    request.writing_response,
                    request.initial_level
                )
                writing_band = writing_analysis.get("band_score", 4.0)
            
            # 3. Evaluate Speaking
            speaking_band = 2.0
            speaking_analysis = {}
            if request.speaking_responses:
                speaking_analysis = await evaluate_speaking_detailed(
                    request.speaking_responses,
                    request.initial_level
                )
                speaking_band = speaking_analysis.get("band_score", 4.0)
            
            # 4. Calculate Listening Band (simplified for now)
            listening_band = reading_band  # Placeholder - similar to reading
            
            # 5. Calculate Overall Band (weighted average)
            overall_band = round(
                (reading_band * 0.25 + 
                 listening_band * 0.25 + 
                 writing_band * 0.25 + 
                 speaking_band * 0.25),
                1
            )
            
            # 6. Determine CEFR Level
            cefr_mapping = {
                (2.0, 3.0): "A1",
                (3.5, 4.5): "A2",
                (5.0, 5.5): "B1",
                (6.0, 6.5): "B2",
                (7.0, 8.0): "C1",
                (8.5, 9.0): "C2"
            }
            
            cefr_level = "A2"
            for band_range, level in cefr_mapping.items():
                if band_range[0] <= overall_band <= band_range[1]:
                    cefr_level = level
                    break
            
            # 7. Generate Learning Path
            skill_bands = {
                "reading": reading_band,
                "listening": listening_band,
                "writing": writing_band,
                "speaking": speaking_band
            }
            learning_path = generate_learning_path(overall_band, skill_bands)
            
            # 8. Prepare Detailed Analysis
            detailed_analysis = {
                "reading": {
                    "band": reading_band,
                    "accuracy": f"{reading_accuracy * 100:.0f}%",
                    "level_reached": reading_level,
                    "errors": reading_errors,
                    "strengths": "Basic comprehension" if reading_band >= 4.0 else "Needs foundation",
                    "weaknesses": "Advanced vocabulary" if reading_band < 6.0 else "Minimal"
                },
                "writing": writing_analysis,
                "speaking": speaking_analysis,
                "listening": {
                    "band": listening_band,
                    "note": "Full listening test not completed in this version"
                }
            }
            
            # 9. Next Steps Recommendations
            next_steps = []
            if overall_band < 4.0:
                next_steps = [
                    "Start with Foundation courses (FREE)",
                    "Practice basic vocabulary daily (10-15 words)",
                    "Use AI pronunciation tool (10 min/day)",
                    "Take mini-tests weekly to track progress"
                ]
            elif overall_band < 5.5:
                next_steps = [
                    "Focus on grammar fundamentals",
                    "Build vocabulary to 1500+ words",
                    "Practice speaking daily with AI",
                    "Write short paragraphs (50-100 words)"
                ]
            elif overall_band < 6.5:
                next_steps = [
                    "Start IELTS-specific preparation",
                    "Learn academic vocabulary",
                    "Practice all 4 skills regularly",
                    "Take full practice tests monthly"
                ]
            else:
                next_steps = [
                    "Take full IELTS practice tests",
                    "Focus on Band 7-8 strategies",
                    "Refine weak areas",
                    "Book official IELTS test"
                ]
            
            # 10. Save to database (if user_id provided)
            if request.user_id:
                await db.users.update_one(
                    {"id": request.user_id},
                    {
                        "$set": {
                            "level_test_result": {
                                "overall_band": overall_band,
                                "cefr_level": cefr_level,
                                "skill_bands": skill_bands,
                                "test_date": datetime.now(timezone.utc).isoformat(),
                                "detailed_analysis": detailed_analysis
                            }
                        }
                    }
                )
            
            # 11. Estimate time to next band
            time_estimates = {
                (2.0, 3.0): "8-12 weeks with daily practice",
                (3.0, 4.0): "10-14 weeks with daily practice",
                (4.0, 5.0): "12-16 weeks with daily practice",
                (5.0, 6.0): "16-20 weeks with daily practice",
                (6.0, 7.0): "20-24 weeks with intensive practice",
                (7.0, 8.0): "24-32 weeks with expert guidance",
                (8.0, 9.0): "32+ weeks of mastery-level practice"
            }
            
            estimated_time = "12-16 weeks"
            for band_range, time in time_estimates.items():
                if band_range[0] <= overall_band < band_range[1]:
                    estimated_time = time
                    break
            
            return {
                "overall_band": overall_band,
                "cefr_level": cefr_level,
                "reading_band": reading_band,
                "listening_band": listening_band,
                "writing_band": writing_band,
                "speaking_band": speaking_band,
                "detailed_analysis": detailed_analysis,
                "learning_path": learning_path,
                "next_steps": next_steps,
                "estimated_time_to_next_band": estimated_time,
                "test_completed_at": datetime.now(timezone.utc).isoformat()
            }
            
        except Exception as e:
            logger.error(f"Adaptive test evaluation error: {e}")
            raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
