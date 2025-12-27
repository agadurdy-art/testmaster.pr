"""
IELTS Question Bank - API Routes
================================
Endpoints for the Question Bank system.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import random

router = APIRouter(prefix="/api/question-bank", tags=["Question Bank"])

# ============ QUESTION BANK ENDPOINTS ============

@router.get("/skills")
async def get_skills():
    """Get all available skills."""
    return {
        "skills": [
            {"id": "reading", "name": "Reading", "icon": "📖", "description": "Academic & General Training passages"},
            {"id": "listening", "name": "Listening", "icon": "🎧", "description": "Multi-speaker audio with native accents"},
            {"id": "writing", "name": "Writing", "icon": "✍️", "description": "Task 1 & Task 2 with AI evaluation"},
            {"id": "speaking", "name": "Speaking", "icon": "🗣️", "description": "Parts 1-3 with dynamic follow-ups"},
            {"id": "grammar_vocab", "name": "Grammar & Vocabulary", "icon": "📚", "description": "Foundation skills practice"},
        ]
    }

@router.get("/topics")
async def get_topics():
    """Get all available topics."""
    return {
        "topics": [
            {"id": "education", "name": "Education", "icon": "🎓"},
            {"id": "health", "name": "Health", "icon": "🏥"},
            {"id": "technology", "name": "Technology", "icon": "💻"},
            {"id": "environment", "name": "Environment", "icon": "🌍"},
            {"id": "work_employment", "name": "Work & Employment", "icon": "💼"},
            {"id": "travel_culture", "name": "Travel & Culture", "icon": "✈️"},
            {"id": "science_research", "name": "Science & Research", "icon": "🔬"},
            {"id": "society_government", "name": "Society & Government", "icon": "🏛️"},
            {"id": "media_entertainment", "name": "Media & Entertainment", "icon": "📺"},
            {"id": "food_nutrition", "name": "Food & Nutrition", "icon": "🍎"},
            {"id": "housing_architecture", "name": "Housing & Architecture", "icon": "🏠"},
            {"id": "crime_law", "name": "Crime & Law", "icon": "⚖️"},
            {"id": "money_finance", "name": "Money & Finance", "icon": "💰"},
            {"id": "sports_fitness", "name": "Sports & Fitness", "icon": "🏆"},
            {"id": "family_relationships", "name": "Family & Relationships", "icon": "👨‍👩‍👧"},
            {"id": "language_communication", "name": "Language & Communication", "icon": "💬"},
            {"id": "art_culture", "name": "Art & Culture", "icon": "🎨"},
            {"id": "shopping_consumerism", "name": "Shopping & Consumerism", "icon": "🛒"},
        ]
    }

@router.get("/band-levels")
async def get_band_levels():
    """Get all band levels."""
    return {
        "band_levels": [
            {"id": "4.0-5.0", "name": "Band 4.0-5.0", "description": "Basic / Elementary", "color": "#f59e0b"},
            {"id": "5.5-6.5", "name": "Band 5.5-6.5", "description": "Intermediate / Competent", "color": "#3b82f6"},
            {"id": "7.0-9.0", "name": "Band 7.0-9.0", "description": "Advanced / Expert", "color": "#10b981"},
        ]
    }

@router.get("/question-types")
async def get_question_types():
    """Get all question types by skill."""
    return {
        "reading": [
            {"id": "multiple_choice", "name": "Multiple Choice"},
            {"id": "true_false_ng", "name": "True / False / Not Given"},
            {"id": "yes_no_ng", "name": "Yes / No / Not Given"},
            {"id": "matching_headings", "name": "Matching Headings"},
            {"id": "matching_information", "name": "Matching Information"},
            {"id": "sentence_completion", "name": "Sentence Completion"},
            {"id": "summary_completion", "name": "Summary Completion"},
            {"id": "diagram_table_completion", "name": "Diagram/Table Completion"},
            {"id": "short_answer", "name": "Short Answer"},
        ],
        "listening": [
            {"id": "multiple_choice", "name": "Multiple Choice"},
            {"id": "form_completion", "name": "Form Completion"},
            {"id": "note_completion", "name": "Note Completion"},
            {"id": "table_completion", "name": "Table Completion"},
            {"id": "sentence_completion", "name": "Sentence Completion"},
            {"id": "matching", "name": "Matching"},
            {"id": "map_labeling", "name": "Map/Plan Labeling"},
            {"id": "diagram_labeling", "name": "Diagram Labeling"},
        ],
        "writing": {
            "task1": [
                {"id": "line_graph", "name": "Line Graph"},
                {"id": "bar_chart", "name": "Bar Chart"},
                {"id": "pie_chart", "name": "Pie Chart"},
                {"id": "table", "name": "Table"},
                {"id": "mixed_chart", "name": "Mixed Chart"},
                {"id": "process_diagram", "name": "Process Diagram"},
                {"id": "map", "name": "Map"},
                {"id": "letter_formal", "name": "Formal Letter"},
                {"id": "letter_semi_formal", "name": "Semi-formal Letter"},
                {"id": "letter_informal", "name": "Informal Letter"},
            ],
            "task2": [
                {"id": "opinion", "name": "Opinion Essay"},
                {"id": "discussion", "name": "Discussion Essay"},
                {"id": "advantage_disadvantage", "name": "Advantage/Disadvantage"},
                {"id": "problem_solution", "name": "Problem/Solution"},
                {"id": "mixed", "name": "Mixed Type"},
            ]
        },
        "speaking": [
            {"id": "part_1", "name": "Part 1 - Personal Questions"},
            {"id": "part_2", "name": "Part 2 - Cue Card"},
            {"id": "part_3", "name": "Part 3 - Discussion"},
        ]
    }

@router.get("/stats")
async def get_question_bank_stats(db=None):
    """Get overall question bank statistics."""
    # TODO: Implement actual DB queries
    return {
        "total_questions": 0,
        "by_skill": {
            "reading": 0,
            "listening": 0,
            "writing": 0,
            "speaking": 0,
            "grammar_vocab": 0
        },
        "by_band": {
            "4.0-5.0": 0,
            "5.5-6.5": 0,
            "7.0-9.0": 0
        },
        "by_topic": {},
        "full_tests": 0,
        "practice_sets": 0
    }

# ============ PRACTICE MODE ENDPOINTS ============

@router.get("/practice/random")
async def get_random_practice(
    skill: str = Query(..., description="Skill to practice"),
    topic: Optional[str] = Query(None, description="Filter by topic"),
    band_level: Optional[str] = Query(None, description="Filter by band level"),
    question_type: Optional[str] = Query(None, description="Filter by question type"),
    count: int = Query(10, ge=1, le=50, description="Number of questions")
):
    """Get random practice questions based on filters."""
    # TODO: Implement actual question retrieval
    return {
        "skill": skill,
        "filters": {
            "topic": topic,
            "band_level": band_level,
            "question_type": question_type
        },
        "count": count,
        "questions": []  # Will be populated from DB
    }

@router.get("/practice/timed")
async def get_timed_practice(
    skill: str = Query(..., description="Skill to practice"),
    duration: int = Query(60, description="Duration in minutes")
):
    """Get a timed practice set."""
    # IELTS standard timings
    timings = {
        "reading": 60,
        "listening": 40,
        "writing": 60,
        "speaking": 15
    }
    
    return {
        "skill": skill,
        "duration": duration,
        "recommended_duration": timings.get(skill, 30),
        "questions": [],  # Will be populated from DB
        "is_timed": True
    }

@router.get("/practice/smart")
async def get_smart_practice(
    user_id: str = Query(..., description="User ID for personalization")
):
    """Get AI-recommended practice based on user's weak areas."""
    # TODO: Implement smart practice logic
    return {
        "user_id": user_id,
        "recommendations": [],
        "weak_areas": [],
        "suggested_focus": None
    }

# ============ FULL TEST ENDPOINTS ============

@router.get("/tests")
async def get_available_tests(
    band_level: Optional[str] = Query(None, description="Filter by band level")
):
    """Get list of available full IELTS tests."""
    return {
        "tests": [],  # Will be populated from DB
        "total": 0
    }

@router.get("/tests/{test_id}")
async def get_test_details(test_id: str):
    """Get details of a specific test."""
    raise HTTPException(status_code=404, detail="Test not found")

@router.post("/tests/{test_id}/start")
async def start_test(test_id: str, user_id: str):
    """Start a test attempt."""
    return {
        "attempt_id": str(uuid.uuid4()),
        "test_id": test_id,
        "user_id": user_id,
        "started_at": datetime.utcnow().isoformat(),
        "sections": []
    }

@router.post("/tests/{test_id}/submit")
async def submit_test(test_id: str, attempt_id: str, answers: Dict[str, Any]):
    """Submit test answers for evaluation."""
    return {
        "attempt_id": attempt_id,
        "test_id": test_id,
        "submitted_at": datetime.utcnow().isoformat(),
        "status": "evaluating"
    }

# ============ WRITING TASK 1 VISUAL ENDPOINTS ============

# Store generated tasks temporarily for model answer retrieval
_task_cache = {}

@router.get("/writing/task1/generate-authentic")
async def generate_task1_authentic(
    visual_type: str = Query(..., description="Type of visual (line_graph, bar_chart, pie_chart, table, process, map)"),
    topic: str = Query("participation", description="Topic category for the task"),
    band_level: str = Query("5.5-6.5", description="Target band level")
):
    """
    Generate ULTRA MASTER PROMPT compliant Writing Task 1.
    
    Returns:
    - Authentic IELTS task description with specific location, time, subject
    - SVG visual generated from structured dataset
    - Analysis hints for model answer generation
    - Band calibration metadata
    """
    from services.chart_generator import chart_generator
    from services.authentic_task_generator import authentic_task_generator
    from services.model_answer_generator import model_answer_generator
    
    try:
        # Generate authentic task using new system (currently Line Graph only)
        if visual_type == "line_graph":
            task_data = authentic_task_generator.generate_line_graph_task(topic, band_level)
            
            # Generate SVG from task data
            svg = chart_generator.generate_line_graph(
                title=task_data["title"],
                x_label=task_data["x_label"],
                y_label=task_data["y_label"],
                x_values=task_data["x_values"],
                datasets=task_data["datasets"]
            )
            
            # Generate task ID for caching
            task_id = str(uuid.uuid4())
            
            # Cache task data for model answer generation
            _task_cache[task_id] = {
                "task_data": task_data,
                "model_answer": model_answer_generator.generate_model_answer_structure(task_data)
            }
            
            return {
                "success": True,
                "task_id": task_id,
                "visual_type": visual_type,
                "topic": topic,
                "band_level": band_level,
                "svg": svg,
                "task_description": task_data["task_description"],
                "analysis_hints": task_data["analysis_hints"],
                "band_calibration": task_data["band_calibration"],
                "metadata": task_data["metadata"]
            }
        else:
            # Fallback to old system for other visual types
            from services.chart_generator import data_generator
            
            if visual_type == "bar_chart":
                data = data_generator.generate_bar_chart_data(topic, band_level)
                svg = chart_generator.generate_bar_chart(**data)
            elif visual_type == "pie_chart":
                data = data_generator.generate_pie_chart_data(topic, band_level)
                svg = chart_generator.generate_pie_chart(**data)
            elif visual_type == "table":
                data = data_generator.generate_table_data(topic, band_level)
                svg = chart_generator.generate_table(**data)
            elif visual_type == "process":
                data = data_generator.generate_process_data(topic, band_level)
                svg = chart_generator.generate_process_diagram(**data)
            elif visual_type == "map":
                data = data_generator.generate_map_data(topic, band_level)
                svg = chart_generator.generate_map_comparison(
                    title=data["title"],
                    before_elements=data["before"],
                    after_elements=data["after"]
                )
            else:
                raise HTTPException(status_code=400, detail=f"Unknown visual type: {visual_type}")
            
            return {
                "success": True,
                "visual_type": visual_type,
                "topic": topic,
                "band_level": band_level,
                "svg": svg,
                "task_description": f"The {visual_type.replace('_', ' ')} above shows information about {topic}. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                "data": data
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/writing/task1/model-answer/{task_id}")
async def get_model_answer(task_id: str):
    """
    Retrieve the three-layer model answer for a generated task.
    
    Returns:
    - Layer A: Examiner-style Band 8.5-9 model answer
    - Layer B: Academic reasoning notes (teaching layer)
    - Layer C: Alternative academic expressions
    """
    if task_id not in _task_cache:
        raise HTTPException(status_code=404, detail="Task not found. Generate a new task.")
    
    cached = _task_cache[task_id]
    
    return {
        "success": True,
        "task_id": task_id,
        "model_answer": cached["model_answer"]
    }

@router.get("/writing/task1/generate-visual")
async def generate_task1_visual(
    visual_type: str = Query(..., description="Type of visual (line_graph, bar_chart, pie_chart, table, process, map)"),
    topic: str = Query("education", description="Topic for the visual"),
    band_level: str = Query("5.5-6.5", description="Difficulty level")
):
    """Generate a Writing Task 1 visual (SVG) with realistic IELTS-authentic data. [LEGACY]"""
    from services.chart_generator import chart_generator, data_generator
    
    try:
        if visual_type == "line_graph":
            data = data_generator.generate_line_graph_data(topic, band_level)
            svg = chart_generator.generate_line_graph(**data)
        elif visual_type == "bar_chart":
            data = data_generator.generate_bar_chart_data(topic, band_level)
            svg = chart_generator.generate_bar_chart(**data)
        elif visual_type == "pie_chart":
            data = data_generator.generate_pie_chart_data(topic, band_level)
            svg = chart_generator.generate_pie_chart(**data)
        elif visual_type == "table":
            data = data_generator.generate_table_data(topic, band_level)
            svg = chart_generator.generate_table(**data)
        elif visual_type == "process":
            data = data_generator.generate_process_data(topic, band_level)
            svg = chart_generator.generate_process_diagram(**data)
        elif visual_type == "map":
            data = data_generator.generate_map_data(topic, band_level)
            svg = chart_generator.generate_map_comparison(
                title=data["title"],
                before_elements=data["before"],
                after_elements=data["after"]
            )
        else:
            raise HTTPException(status_code=400, detail=f"Unknown visual type: {visual_type}")
        
        return {
            "visual_type": visual_type,
            "topic": topic,
            "band_level": band_level,
            "svg": svg,
            "data": data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============ USER PROGRESS ENDPOINTS ============

@router.get("/progress/{user_id}")
async def get_user_progress(user_id: str):
    """Get user's progress and analytics."""
    return {
        "user_id": user_id,
        "overall_stats": {
            "total_questions": 0,
            "correct_answers": 0,
            "accuracy": 0,
            "time_spent": 0
        },
        "skill_breakdown": {},
        "topic_accuracy": {},
        "band_progression": [],
        "weak_areas": [],
        "recommendations": []
    }

@router.post("/progress/{user_id}/record")
async def record_attempt(user_id: str, attempt: Dict[str, Any]):
    """Record a question attempt."""
    return {
        "recorded": True,
        "attempt_id": str(uuid.uuid4()),
        "user_id": user_id
    }

# ============ AI EVALUATION ENDPOINTS ============

from pydantic import BaseModel

class WritingEvaluationRequest(BaseModel):
    response: str
    task_type: str = "task1"  # task1 or task2
    visual_type: Optional[str] = None  # For task1: line_graph, bar_chart, etc.
    topic: Optional[str] = None
    band_level: str = "5.5-6.5"

@router.post("/writing/evaluate")
async def evaluate_writing(request: WritingEvaluationRequest):
    """
    AI evaluation for Writing Task 1 and Task 2.
    Uses IELTS band descriptors for accurate scoring.
    """
    import os
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    
    response_text = request.response.strip()
    word_count = len(response_text.split())
    
    # Minimum word check
    min_words = 150 if request.task_type == "task1" else 250
    if word_count < min_words * 0.6:  # Allow some flexibility
        return {
            "success": False,
            "error": f"Response too short. Minimum {min_words} words required, you wrote {word_count}.",
            "word_count": word_count
        }
    
    # Build evaluation prompt
    if request.task_type == "task1":
        task_description = f"""
IELTS Academic Writing Task 1 Evaluation

Visual Type: {request.visual_type or 'chart/graph'}
Topic: {request.topic or 'general'}
Target Band: {request.band_level}

The candidate was asked to describe a {request.visual_type or 'visual'} showing information about {request.topic or 'a topic'}.
They should summarize the main features and make comparisons where relevant.
Minimum 150 words required.
"""
    else:
        task_description = f"""
IELTS Academic Writing Task 2 Evaluation

Topic: {request.topic or 'general'}
Target Band: {request.band_level}

The candidate was asked to write an essay on a given topic.
They should present a clear position with supporting arguments.
Minimum 250 words required.
"""
    
    evaluation_prompt = f"""You are an official IELTS examiner. Evaluate this Writing {request.task_type.upper()} response using the official IELTS band descriptors.

{task_description}

CANDIDATE'S RESPONSE ({word_count} words):
\"\"\"
{response_text}
\"\"\"

Evaluate using these EXACT criteria:

1. TASK ACHIEVEMENT (Task 1) / TASK RESPONSE (Task 2):
   - Does it address all parts of the task?
   - Is there a clear overview? (Task 1)
   - Are main features/key points covered?
   - Is the position clear throughout? (Task 2)

2. COHERENCE AND COHESION:
   - Logical organization of information
   - Clear progression of ideas
   - Appropriate use of cohesive devices
   - Effective paragraphing

3. LEXICAL RESOURCE:
   - Range of vocabulary
   - Accuracy of word choice
   - Spelling and word formation
   - Less common vocabulary usage

4. GRAMMATICAL RANGE AND ACCURACY:
   - Range of sentence structures
   - Accuracy of grammar
   - Punctuation control
   - Error frequency and impact

IMPORTANT SCORING RULES:
- Be strict and fair - no inflated scores
- Band 6.0 = competent but limited
- Band 7.0 = good with occasional errors
- Band 8.0+ = very good with rare errors
- Penalize off-topic content heavily
- Penalize memorized templates if detected

Return your evaluation in this EXACT JSON format:
{{
    "overall_band": 6.5,
    "task_achievement": {{
        "score": 6,
        "feedback": "Specific feedback here"
    }},
    "coherence_cohesion": {{
        "score": 7,
        "feedback": "Specific feedback here"
    }},
    "lexical_resource": {{
        "score": 6,
        "feedback": "Specific feedback here"
    }},
    "grammatical_range": {{
        "score": 7,
        "feedback": "Specific feedback here"
    }},
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "improvement_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
    "vocabulary_to_use": ["word1", "word2", "word3"],
    "grammar_corrections": [
        {{"original": "error text", "corrected": "correct text", "explanation": "why"}}
    ],
    "examiner_comment": "Overall comment about the response"
}}

Return ONLY the JSON, no other text."""

    try:
        llm = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            model="gpt-4o"
        )
        
        result = await llm.chat([UserMessage(content=evaluation_prompt)])
        
        # Parse the JSON response
        import json
        # Clean the response - remove markdown code blocks if present
        result_text = result.strip()
        if result_text.startswith("```"):
            result_text = result_text.split("```")[1]
            if result_text.startswith("json"):
                result_text = result_text[4:]
        result_text = result_text.strip()
        
        evaluation = json.loads(result_text)
        
        return {
            "success": True,
            "word_count": word_count,
            "evaluation": evaluation
        }
        
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": "Failed to parse evaluation response",
            "raw_response": result_text[:500] if 'result_text' in dir() else None
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# ============ WRITING TASK 2 ENDPOINTS ============

@router.get("/writing/task2/prompts")
async def get_writing_task2_prompts(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    band_level: Optional[str] = Query(None, description="Filter by band level"),
    essay_type: Optional[str] = Query(None, description="Essay type: opinion, discussion, advantage_disadvantage, problem_solution")
):
    """Get Writing Task 2 essay prompts."""
    
    # Sample prompts - in production, these would come from DB
    prompts = [
        {
            "id": "t2-001",
            "type": "opinion",
            "topic": "education",
            "band_level": "5.5-6.5",
            "prompt": "Some people believe that children should be taught to be competitive in school, while others think they should learn to cooperate with each other. Discuss both views and give your own opinion.",
            "key_points": ["Competition benefits", "Cooperation benefits", "Your view with reasons"],
            "useful_vocabulary": ["competitive spirit", "collaborative learning", "teamwork skills", "academic achievement"]
        },
        {
            "id": "t2-002",
            "type": "advantage_disadvantage",
            "topic": "technology",
            "band_level": "5.5-6.5",
            "prompt": "Many people today use the internet and smartphones to do their banking. What are the advantages and disadvantages of this trend?",
            "key_points": ["Advantages of online banking", "Disadvantages/risks", "Balance the discussion"],
            "useful_vocabulary": ["convenience", "cyber security", "digital literacy", "financial transactions"]
        },
        {
            "id": "t2-003",
            "type": "problem_solution",
            "topic": "environment",
            "band_level": "7.0-9.0",
            "prompt": "Global warming is one of the biggest threats to our environment. What causes global warming and what solutions can governments and individuals take to address this problem?",
            "key_points": ["Causes of global warming", "Government solutions", "Individual solutions"],
            "useful_vocabulary": ["greenhouse gases", "carbon footprint", "renewable energy", "sustainable development"]
        },
        {
            "id": "t2-004",
            "type": "discussion",
            "topic": "society_government",
            "band_level": "5.5-6.5",
            "prompt": "Some people think that governments should spend money on public services rather than spending on the arts such as music and painting. To what extent do you agree or disagree?",
            "key_points": ["Arguments for public services", "Arguments for arts funding", "Your balanced view"],
            "useful_vocabulary": ["cultural heritage", "essential services", "quality of life", "budget allocation"]
        },
        {
            "id": "t2-005",
            "type": "opinion",
            "topic": "work_employment",
            "band_level": "7.0-9.0",
            "prompt": "In many countries, people are working longer hours than ever before. What are the reasons for this? Is this a positive or negative development?",
            "key_points": ["Reasons for longer hours", "Positive aspects", "Negative aspects", "Your opinion"],
            "useful_vocabulary": ["work-life balance", "productivity", "job security", "burnout", "career advancement"]
        }
    ]
    
    # Filter prompts
    filtered = prompts
    if topic:
        filtered = [p for p in filtered if p["topic"] == topic]
    if band_level:
        filtered = [p for p in filtered if p["band_level"] == band_level]
    if essay_type:
        filtered = [p for p in filtered if p["type"] == essay_type]
    
    return {
        "prompts": filtered,
        "total": len(filtered)
    }

@router.get("/writing/task2/prompt/{prompt_id}")
async def get_writing_task2_prompt(prompt_id: str):
    """Get a specific Writing Task 2 prompt with model answers."""
    
    # Sample - in production from DB
    if prompt_id == "t2-001":
        return {
            "id": "t2-001",
            "type": "opinion",
            "topic": "education",
            "band_level": "5.5-6.5",
            "prompt": "Some people believe that children should be taught to be competitive in school, while others think they should learn to cooperate with each other. Discuss both views and give your own opinion.",
            "model_answer_band9": """The debate over whether schools should foster competition or cooperation among students has been ongoing for decades. While both approaches have their merits, I believe that a balanced combination of the two is most beneficial for children's development.

On the one hand, proponents of competitive education argue that it prepares children for the real world. In today's job market, individuals must often compete for positions and promotions, and early exposure to competition can develop resilience and ambition. Furthermore, competitive environments can motivate students to excel academically, as the desire to outperform peers drives them to study harder and achieve better results.

On the other hand, advocates of cooperative learning emphasize the importance of teamwork skills. In most professional settings, employees are required to collaborate with colleagues to achieve common goals. Children who learn to cooperate from an early age are better equipped to communicate effectively, share responsibilities, and resolve conflicts peacefully. Additionally, cooperative learning creates a supportive environment where students can learn from each other and build lasting friendships.

In my opinion, the ideal approach combines elements of both competition and cooperation. Schools should provide opportunities for healthy competition through academic contests and sports, while also incorporating group projects and collaborative activities. This balanced approach would help children develop a complete set of skills necessary for success in both their personal and professional lives.

In conclusion, rather than viewing competition and cooperation as mutually exclusive, educational institutions should recognize the value of both and integrate them thoughtfully into the curriculum.""",
            "model_answer_band6": """There are different opinions about whether children should learn to be competitive or cooperative at school. This essay will discuss both views and give my opinion.

Some people think competition is important in schools. When students compete with each other, they work harder to get good grades. This can help them be successful in the future because they will need to compete for jobs. Also, winning competitions can make students feel proud and confident.

However, other people believe cooperation is more important. In the workplace, people usually need to work in teams. If children learn to cooperate at school, they will be better at working with others when they grow up. Cooperative learning also helps students make friends and support each other.

In my opinion, I think both competition and cooperation are important. Schools should have some competitions like sports and quiz contests, but also many group activities. This way, students can learn different skills.

To sum up, competition and cooperation both have benefits for children. I believe schools should teach both of these skills to help students become successful in life.""",
            "examiner_notes": {
                "must_mention": ["Benefits of competition", "Benefits of cooperation", "Clear personal opinion", "Real-world connections"],
                "common_mistakes": ["Not discussing both views equally", "Weak conclusion", "Repetitive vocabulary"],
                "vocabulary_focus": ["competitive spirit", "collaborative learning", "teamwork", "resilience", "academic achievement"]
            }
        }
    
    raise HTTPException(status_code=404, detail="Prompt not found")
