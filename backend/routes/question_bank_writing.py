"""
Question Bank - Writing endpoints: Task 1 visual generation + model answers
(wrapping the chart/authentic-task/model-answer generator services), retired
AI evaluation stub, Task 2 prompts, and General Training Task 1/Task 2
prompts.

Extracted from routes/question_bank.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import uuid
import random

router = APIRouter()

# ============ WRITING TASK 1 VISUAL ENDPOINTS ============

# Store generated tasks temporarily for model answer retrieval
_task_cache = {}

CURATED_TASK1_PROCESS_VISUALS = [
    {"asset": "curated_process_water_treatment.png", "title": "Water treatment process", "task_description": "The diagram below shows the stages involved in treating water for domestic use.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_honey_production.png", "title": "Honey production process", "task_description": "The diagram below illustrates how honey is produced and prepared for retail sale.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_brick_manufacturing.png", "title": "Brick manufacturing process", "task_description": "The diagram below shows the process of manufacturing bricks for the construction industry.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_online_order_delivery.png", "title": "Online order and delivery process", "task_description": "The diagram below shows how an online order is processed and delivered to the customer.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_salmon_lifecycle.png", "title": "Life cycle of salmon", "task_description": "The diagram below shows the life cycle of a species of salmon.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_orange_juice.png", "title": "Orange juice production", "task_description": "The diagram below shows how orange juice is produced for commercial sale.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_university_enrolment.png", "title": "University enrolment process", "task_description": "The diagram below shows the process of enrolling at a university.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_glass_recycling.png", "title": "Glass recycling process", "task_description": "The diagram below illustrates how glass containers are recycled.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_paper_production.png", "title": "Paper production from wood", "task_description": "The diagram below shows how paper is produced from trees.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_coffee_production.png", "title": "Coffee production process", "task_description": "The diagram below shows the stages involved in producing coffee from planting to packaging.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_solar_energy.png", "title": "Solar energy generation system", "task_description": "The diagram below shows how solar energy is converted into electricity for domestic use.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_milk_production.png", "title": "Milk production and distribution", "task_description": "The diagram below shows how milk is produced, processed and distributed for retail sale.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_bread_baking.png", "title": "Commercial bread production", "task_description": "The diagram below shows how bread is produced in a commercial bakery.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
    {"asset": "curated_process_plastic_recycling_v2.png", "title": "Plastic bottle recycling process", "task_description": "The diagram below illustrates how used plastic bottles are recycled and turned into new products.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words."},
]

CURATED_TASK1_MAP_VISUALS = [
    {"asset": "curated_map_industrial_redevelopment.png", "title": "Industrial area redevelopment", "task_description": "The maps below show an industrial area before and after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before redevelopment", "time_after": "After redevelopment"},
    {"asset": "curated_map_airport_redevelopment.png", "title": "Airport area redevelopment", "task_description": "The maps below compare an airport area before and after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_airport_terminal.png", "title": "Airport terminal expansion", "task_description": "The maps below show an airport terminal before and after expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_village_bypass.png", "title": "Village map with bypass road", "task_description": "The maps below show a village before and after a bypass road was built.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before bypass", "time_after": "After bypass"},
    {"asset": "curated_map_school_expansion.png", "title": "School site development", "task_description": "The maps below show a school site before and after development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_riverfront_development.png", "title": "Riverfront area development", "task_description": "The maps below show a riverfront area before and after development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_solar_farm_expansion.png", "title": "Solar farm expansion", "task_description": "The maps below show a solar farm before and after expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_airport_gates.png", "title": "Airport with expanded gates", "task_description": "The maps below show an airport before and after gate expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_recreation_area.png", "title": "Recreation area development", "task_description": "The maps below show a recreation area before and after development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before development", "time_after": "After development"},
    {"asset": "curated_map_university_dormitory.png", "title": "University dormitory area", "task_description": "The maps below show a university dormitory area before and after redevelopment.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_coastal_tourism.png", "title": "Coastal village tourism development", "task_description": "The maps below show a coastal village before and after tourism development.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_island_tourism.png", "title": "Island tourist facilities", "task_description": "The maps below show an island before and after the construction of tourist facilities.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before construction", "time_after": "After construction"},
    {"asset": "curated_map_university_campus.png", "title": "University campus expansion", "task_description": "The maps below show a university campus before and after expansion.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "Before", "time_after": "After"},
    {"asset": "curated_map_city_park.png", "title": "City park redesign", "task_description": "The maps below show a city park in 2010 and planned changes for 2030.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "2010", "time_after": "2030"},
    {"asset": "curated_map_town_centre.png", "title": "Town centre redevelopment", "task_description": "The maps below show a town centre in 2000 and 2025.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.", "time_before": "2000", "time_after": "2025"},
]


def _build_curated_task1_visual(visual_type: str, topic: str, band_level: str):
    bank = CURATED_TASK1_PROCESS_VISUALS if visual_type == "process" else CURATED_TASK1_MAP_VISUALS
    base = random.choice(bank).copy()
    asset = base.pop("asset")
    task_data = {
        **base,
        "visual_type": visual_type,
        "topic": topic,
        "band_level": band_level,
        "metadata": {"source": "curated_static_bank", "asset": asset},
        "band_calibration": {"target_band": band_level, "complexity": "authentic_curated"},
    }
    return {"task_data": task_data, "image_url": f"/static/visuals/{asset}"}

@router.get("/writing/task1/generate-authentic")
async def generate_task1_authentic(
    visual_type: str = Query(..., description="Type of visual (line_graph, bar_chart, pie_chart, table, process, map)"),
    topic: str = Query("participation", description="Topic category for the task"),
    band_level: str = Query("5.5-6.5", description="Target band level")
):
    """
    Generate ULTRA MASTER PROMPT compliant Writing Task 1.
    
    ALL chart types now use the authentic task generator system.
    
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
        task_data = None
        svg = None
        image_url = None
        
        # ============ LINE GRAPH ============
        if visual_type == "line_graph":
            task_data = authentic_task_generator.generate_line_graph_task(topic, band_level)
            svg = chart_generator.generate_line_graph(
                title=task_data["title"],
                x_label=task_data["x_label"],
                y_label=task_data["y_label"],
                x_values=task_data["x_values"],
                datasets=task_data["datasets"]
            )
        
        # ============ BAR CHART ============
        elif visual_type == "bar_chart":
            task_data = authentic_task_generator.generate_bar_chart_task(topic, band_level)
            svg = chart_generator.generate_bar_chart(
                title=task_data["title"],
                x_label=task_data.get("x_label", "Category"),
                y_label=task_data["y_label"],
                categories=task_data["categories"],
                datasets=task_data["datasets"]
            )
        
        # ============ PIE CHART ============
        elif visual_type == "pie_chart":
            task_data = authentic_task_generator.generate_pie_chart_task(topic, band_level)
            # Convert to the format expected by chart_generator
            pie_data = [
                {"label": seg, "value": task_data["datasets"][0]["values"][idx]}
                for idx, seg in enumerate(task_data["segments"])
            ]
            svg = chart_generator.generate_pie_chart(
                title=task_data["title"],
                data=pie_data
            )
        
        # ============ TABLE ============
        elif visual_type == "table":
            task_data = authentic_task_generator.generate_table_task(topic, band_level)
            # Convert rows to string format
            rows_str = [[str(cell) for cell in row] for row in task_data["rows"]]
            svg = chart_generator.generate_table(
                title=task_data["title"],
                headers=task_data["columns"],
                rows=rows_str
            )
        
        # ============ PROCESS ============
        elif visual_type == "process":
            curated = _build_curated_task1_visual(visual_type, topic, band_level)
            task_data = curated["task_data"]
            image_url = curated["image_url"]
        
        # ============ MAP ============
        elif visual_type == "map":
            curated = _build_curated_task1_visual(visual_type, topic, band_level)
            task_data = curated["task_data"]
            image_url = curated["image_url"]
        
        else:
            raise HTTPException(status_code=400, detail=f"Unknown visual type: {visual_type}")
        
        # Generate task ID for caching
        task_id = str(uuid.uuid4())
        
        # Cache task data and generate model answer for ALL visual types
        model_answer = None
        try:
            model_answer = model_answer_generator.generate_model_answer_structure(task_data)
        except Exception as ma_error:
            print(f"Warning: Could not generate model answer: {ma_error}")
        
        _task_cache[task_id] = {
            "task_data": task_data,
            "model_answer": model_answer
        }
        
        return {
            "success": True,
            "task_id": task_id,
            "visual_type": visual_type,
            "topic": topic,
            "band_level": band_level,
            "svg": svg,
            "image_url": image_url,
            "task_description": task_data["task_description"],
            "band_calibration": task_data.get("band_calibration", {}),
            "metadata": task_data.get("metadata", {})
        }
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/writing/task1/model-answer/{task_id}")
async def get_model_answer(task_id: str):
    """
    Retrieve the three-layer model answer for a generated task.
    
    Returns:
    - Layer A: Examiner-style Band 8 model answer
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

# ============ AI EVALUATION ENDPOINTS ============

from pydantic import BaseModel

class WritingEvaluationRequest(BaseModel):
    response: str
    task_type: str = "task1"  # task1 or task2
    visual_type: Optional[str] = None  # For task1: line_graph, bar_chart, etc.
    topic: Optional[str] = None
    band_level: str = "5.5-6.5"
    task_description: Optional[str] = None  # The original task prompt
    track: str = "academic"  # "academic" or "general" for Dual-Track support

@router.post("/writing/evaluate")
async def evaluate_writing(_: WritingEvaluationRequest):
    """Retired in Faz 4 (2026-05-13).

    Original implementation: GPT-4o via EMERGENT_LLM_KEY, no idempotency,
    no cost-leakage guard, no Anthropic prompt cache. No frontend caller
    referenced this route — confirmed via grep across
    /Users/aga/testmaster-fresh/frontend/src on 2026-05-13.

    All writing evaluation now goes through /api/writing-practice/evaluate/v2
    (Claude Sonnet 4.6 + writing_idempotency + single-shot retry policy).
    Returning 410 Gone instead of 404 so any rogue legacy client gets a
    clear "this is intentionally removed" signal rather than a generic
    "route not found".
    """
    raise HTTPException(
        status_code=410,
        detail={
            "code": "endpoint_retired",
            "message": "Use /api/writing-practice/evaluate/v2 instead.",
            "replacement": "/api/writing-practice/evaluate/v2",
        },
    )

# ============ WRITING TASK 2 ENDPOINTS ============

@router.get("/writing/task2/prompts")
async def get_writing_task2_prompts(
    topic: Optional[str] = Query(None, description="Filter by topic"),
    band_level: Optional[str] = Query(None, description="Filter by band level"),
    essay_type: Optional[str] = Query(None, description="Essay type: opinion, discussion, advantage_disadvantage, problem_solution, two_part")
):
    """Get Writing Task 2 essay prompts with authentic IELTS content."""
    from services.writing_task2_generator import writing_task2_generator
    
    prompts = writing_task2_generator.get_essay_prompts(essay_type, band_level)
    
    # Filter by topic if provided
    if topic:
        prompts = [p for p in prompts if p["topic"] == topic]
    
    return {
        "prompts": prompts,
        "total": len(prompts)
    }

@router.get("/writing/task2/prompt/{prompt_id}")
async def get_writing_task2_prompt(prompt_id: str):
    """Get a specific Writing Task 2 prompt with model answers at Band 6 and Band 8.5."""
    from services.writing_task2_generator import writing_task2_generator
    
    # Get all prompts
    all_prompts = writing_task2_generator.get_essay_prompts()
    
    # Find the specific prompt
    prompt = None
    for p in all_prompts:
        if str(p["id"]) == prompt_id:
            prompt = p
            break
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Get model answers for both bands
    model_band6 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 6.0)
    model_band85 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 8.5)
    
    return {
        **prompt,
        "model_answers": {
            "band_6": model_band6,
            "band_8_5": model_band85
        }
    }

@router.get("/writing/task2/model-answers/{essay_type}")
async def get_task2_model_answers(
    essay_type: str,
    topic: str = Query("education", description="Topic of the essay")
):
    """Get model answers at different band levels for a specific essay type."""
    from services.writing_task2_generator import writing_task2_generator
    
    band6 = writing_task2_generator.get_model_answer(essay_type, topic, 6.0)
    band85 = writing_task2_generator.get_model_answer(essay_type, topic, 8.5)
    
    return {
        "essay_type": essay_type,
        "topic": topic,
        "model_answers": {
            "band_6": band6,
            "band_8_5": band85
        }
    }

# ============ GENERAL TRAINING TASK 1 (LETTER WRITING) ============

@router.get("/writing/general/task1/prompts")
async def get_general_task1_prompts(
    letter_type: Optional[str] = Query(None, description="Letter type: formal, semi_formal, informal")
):
    """Get General Training Writing Task 1 prompts (letter writing)."""
    from services.writing_task2_generator import writing_task2_generator
    
    prompts = writing_task2_generator.get_letter_prompts(letter_type)
    
    return {
        "prompts": prompts,
        "total": len(prompts),
        "letter_types": ["formal", "semi_formal", "informal"]
    }

@router.get("/writing/general/task1/prompt/{prompt_id}")
async def get_general_task1_prompt(prompt_id: str):
    """Get a specific General Training Task 1 prompt with model answers."""
    from services.writing_task2_generator import writing_task2_generator
    
    all_prompts = writing_task2_generator.get_letter_prompts()
    
    prompt = None
    for p in all_prompts:
        if str(p["id"]) == prompt_id:
            prompt = p
            break
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Get model answers for both bands
    model_band6 = writing_task2_generator.get_letter_model_answer(prompt["type"], prompt["topic"], 6.0)
    model_band85 = writing_task2_generator.get_letter_model_answer(prompt["type"], prompt["topic"], 8.5)
    
    return {
        **prompt,
        "model_answers": {
            "band_6": model_band6,
            "band_8_5": model_band85
        }
    }



# ============ GENERAL TRAINING TASK 2 (ESSAY) ============

# General Training Task 2 essay topics (different from Academic)
GENERAL_TASK2_PROMPTS = [
    # Opinion Essays
    {
        "id": "gen_op_1",
        "type": "opinion",
        "topic": "work_life",
        "prompt": "Many people believe that working from home is the best way to achieve work-life balance.\n\nTo what extent do you agree or disagree with this statement?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        "key_points": ["Discuss benefits and drawbacks of remote work", "Consider personal experience", "Give clear opinion"]
    },
    {
        "id": "gen_op_2",
        "type": "opinion",
        "topic": "social_media",
        "prompt": "Some people think social media has made it easier to stay in touch with friends and family.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.",
        "key_points": ["Discuss impact of social media on relationships", "Give personal examples", "Present balanced view"]
    },
    {
        "id": "gen_op_3",
        "type": "opinion",
        "topic": "education",
        "prompt": "Some people believe that children should start learning a foreign language at primary school. Others think they should wait until secondary school.\n\nDiscuss both views and give your opinion.",
        "key_points": ["Arguments for early learning", "Arguments for later start", "Personal opinion"]
    },
    {
        "id": "gen_op_4",
        "type": "opinion",
        "topic": "health",
        "prompt": "Some people think that regular exercise is the most important factor for a healthy lifestyle. Others believe diet is more important.\n\nDiscuss both views and give your opinion.",
        "key_points": ["Importance of exercise", "Importance of diet", "Balanced conclusion"]
    },
    # Discussion Essays
    {
        "id": "gen_disc_1",
        "type": "discussion",
        "topic": "technology",
        "prompt": "Many people prefer to shop online rather than in traditional stores.\n\nWhat are the advantages and disadvantages of online shopping?",
        "key_points": ["Convenience factors", "Drawbacks like delivery issues", "Impact on local businesses"]
    },
    {
        "id": "gen_disc_2",
        "type": "discussion",
        "topic": "travel",
        "prompt": "Some people prefer to travel in a group with a tour guide. Others prefer to travel independently.\n\nDiscuss both approaches and state your preference.",
        "key_points": ["Benefits of guided tours", "Benefits of independent travel", "Personal preference"]
    },
    {
        "id": "gen_disc_3",
        "type": "discussion",
        "topic": "environment",
        "prompt": "Many cities are encouraging people to use bicycles instead of cars.\n\nWhat are the advantages and disadvantages of this trend?",
        "key_points": ["Environmental benefits", "Health benefits", "Practical challenges"]
    },
    {
        "id": "gen_disc_4",
        "type": "discussion",
        "topic": "lifestyle",
        "prompt": "In many countries, people are choosing to live alone rather than with family members.\n\nDo you think this is a positive or negative development?",
        "key_points": ["Personal freedom aspects", "Social implications", "Economic factors"]
    },
    # Problem-Solution Essays
    {
        "id": "gen_prob_1",
        "type": "problem_solution",
        "topic": "community",
        "prompt": "In many cities, there is a shortage of affordable housing.\n\nWhat problems does this cause? What solutions can you suggest?",
        "key_points": ["Impact on families", "Economic effects", "Government solutions"]
    },
    {
        "id": "gen_prob_2",
        "type": "problem_solution",
        "topic": "health",
        "prompt": "Many people today suffer from stress and anxiety in their daily lives.\n\nWhat are the main causes of this problem? What measures can be taken to address it?",
        "key_points": ["Work-related stress", "Lifestyle factors", "Practical solutions"]
    },
    {
        "id": "gen_prob_3",
        "type": "problem_solution",
        "topic": "environment",
        "prompt": "Plastic waste is a growing problem in many countries.\n\nWhat problems does this cause, and how can these problems be solved?",
        "key_points": ["Environmental damage", "Impact on wildlife", "Recycling and alternatives"]
    },
    {
        "id": "gen_prob_4",
        "type": "problem_solution",
        "topic": "traffic",
        "prompt": "Traffic congestion is becoming a serious problem in many cities.\n\nWhat are the causes of this problem? What solutions would you suggest?",
        "key_points": ["Population growth", "Car ownership", "Public transport solutions"]
    },
    # Two-Part Questions
    {
        "id": "gen_two_1",
        "type": "two_part",
        "topic": "success",
        "prompt": "Some people believe that success in life comes from hard work. Others think that luck plays a more important role.\n\nWhat do you think is more important for success? What other factors contribute to a person's success?",
        "key_points": ["Role of hard work", "Role of luck", "Other contributing factors"]
    },
    {
        "id": "gen_two_2",
        "type": "two_part",
        "topic": "learning",
        "prompt": "Learning new skills is important for professional development.\n\nWhat skills are most useful in today's workplace? How can people best develop these skills?",
        "key_points": ["In-demand skills", "Methods of learning", "Practical advice"]
    },
    {
        "id": "gen_two_3",
        "type": "two_part",
        "topic": "food",
        "prompt": "Fast food is becoming increasingly popular in many countries.\n\nWhy is this happening? Do you think this is a positive or negative development?",
        "key_points": ["Reasons for popularity", "Health implications", "Cultural impact"]
    },
    {
        "id": "gen_two_4",
        "type": "two_part",
        "topic": "entertainment",
        "prompt": "More and more people are spending their free time watching TV or using their phones.\n\nWhy is this happening? Is this a positive or negative trend?",
        "key_points": ["Technology accessibility", "Impact on social life", "Effects on health"]
    }
]

@router.get("/writing/general/task2/prompts")
async def get_general_task2_prompts(
    essay_type: Optional[str] = Query(None, description="Essay type: opinion, discussion, problem_solution, two_part")
):
    """Get General Training Writing Task 2 prompts (essays)."""
    prompts = GENERAL_TASK2_PROMPTS
    
    if essay_type:
        prompts = [p for p in prompts if p["type"] == essay_type]
    
    return {
        "prompts": prompts,
        "total": len(prompts),
        "essay_types": ["opinion", "discussion", "problem_solution", "two_part"]
    }

@router.get("/writing/general/task2/prompt/{prompt_id}")
async def get_general_task2_prompt(prompt_id: str):
    """Get a specific General Training Task 2 prompt with model answers."""
    from services.writing_task2_generator import writing_task2_generator
    
    prompt = None
    for p in GENERAL_TASK2_PROMPTS:
        if p["id"] == prompt_id:
            prompt = p
            break
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Generate model answers
    model_band6 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 6.0)
    model_band85 = writing_task2_generator.get_model_answer(prompt["type"], prompt["topic"], 8.5)
    
    return {
        **prompt,
        "model_answers": {
            "band_6": model_band6,
            "band_8_5": model_band85
        }
    }

