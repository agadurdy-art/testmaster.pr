"""
IELTS Writing Task 1 - Model Answer Generator
==============================================
Three-Layer Model Answer System following ULTRA MASTER PROMPT.

LAYER A: Examiner-Style Model Answer (Band 8)
- Natural academic tone
- No visible template
- Logical flow
- Selective data use

LAYER B: Academic Reasoning Notes (Teaching Layer)
- Why this overview was chosen
- Why certain data was highlighted
- Why others were omitted
- Why specific verbs/structures were used

LAYER C: Alternative Academic Expressions
- Multiple overview options
- Varied comparison strategies
- Paraphrase examples
"""

import os
import json
import random
from typing import Dict, List, Any, Optional
from datetime import datetime


class ModelAnswerGenerator:
    """
    Generates three-layer model answers for IELTS Writing Task 1.
    
    NOT ALLOWED:
    - Memorisation-style templates
    - Formulaic structures that sound rehearsed
    - "Band 9 sample" without reasoning
    
    REQUIRED:
    - Natural academic writing
    - Data-driven analysis
    - Teaching component
    """
    
    # ============ TEMPLATE SMELL DETECTOR ============
    TEMPLATE_PHRASES = [
        "overall, it is clear that",
        "the chart illustrates",
        "in conclusion",
        "to sum up",
        "as can be seen",
        "it is evident that",
        "the data reveals",
        "the graph shows that",
        "looking at the data",
        "according to the graph",
        "as the graph shows",
        "from the graph we can see"
    ]
    
    # ============ ACADEMIC VOCABULARY BY FUNCTION ============
    ACADEMIC_VOCABULARY = {
        "overview_starters": [
            "Overall,",
            "In general,",
            "Broadly speaking,",
            "The most striking feature is",
            "What stands out from the data is",
            "The key observation is that"
        ],
        "trend_verbs_increase": [
            "rose", "increased", "grew", "climbed", "surged",
            "soared", "expanded", "advanced", "escalated"
        ],
        "trend_verbs_decrease": [
            "fell", "dropped", "declined", "decreased", "plummeted",
            "dipped", "contracted", "diminished", "reduced"
        ],
        "trend_verbs_stable": [
            "remained stable", "stayed constant", "levelled off",
            "plateaued", "maintained", "held steady"
        ],
        "trend_verbs_fluctuate": [
            "fluctuated", "varied", "oscillated", "wavered"
        ],
        "degree_adverbs": {
            "dramatic": ["dramatically", "sharply", "significantly", "substantially", "considerably"],
            "moderate": ["moderately", "steadily", "gradually", "progressively"],
            "slight": ["slightly", "marginally", "minimally", "fractionally"]
        },
        "comparison_structures": [
            "{A} was significantly higher than {B}",
            "{A} exceeded {B} by a considerable margin",
            "While {A} showed growth, {B} experienced decline",
            "{A} and {B} followed contrasting trends",
            "In contrast to {A}, {B} demonstrated",
            "{A} overtook {B} in {year}"
        ],
        "time_phrases": [
            "over the period shown",
            "throughout the timeframe",
            "during this period",
            "between {start} and {end}",
            "from {start} to {end}",
            "across the years surveyed"
        ]
    }
    
    # ============ BAND-LEVEL CHARACTERISTICS ============
    BAND_CHARACTERISTICS = {
        "9.0": {
            "description": "Expert level",
            "features": [
                "Sophisticated vocabulary with full flexibility",
                "Wide range of complex structures",
                "Very rare minor errors",
                "Fully developed response with clear progression"
            ]
        },
        "8.0": {
            "description": "Very good level",
            "features": [
                "Wide range of vocabulary with flexibility",
                "Variety of complex structures",
                "Occasional minor errors",
                "Well-developed response with clear progression"
            ]
        },
        "7.0": {
            "description": "Good level",
            "features": [
                "Sufficient vocabulary for flexibility",
                "Mix of simple and complex structures",
                "Some errors that do not impede communication",
                "Clear progression with appropriate cohesion"
            ]
        },
        "6.0": {
            "description": "Competent level",
            "features": [
                "Adequate vocabulary for the task",
                "Mix of structures with some errors",
                "Generally clear but some repetition",
                "Basic progression of ideas"
            ]
        }
    }
    
    @classmethod
    def detect_template_smell(cls, text: str) -> Dict[str, Any]:
        """
        Template Smell Detector - identifies overused template phrases.
        
        Returns:
        - is_template_like: bool
        - detected_phrases: list of template phrases found
        - score: 0-10 (0=natural, 10=heavily templated)
        """
        text_lower = text.lower()
        detected = []
        
        for phrase in cls.TEMPLATE_PHRASES:
            if phrase in text_lower:
                detected.append(phrase)
        
        # Calculate template score
        score = min(10, len(detected) * 2.5)
        
        return {
            "is_template_like": score > 5,
            "detected_phrases": detected,
            "score": score,
            "recommendation": "Regenerate with more natural phrasing" if score > 5 else "Acceptable"
        }
    
    @classmethod
    def generate_model_answer_structure(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate the complete three-layer model answer structure.
        
        Input: Task data from AuthenticTaskGenerator
        Output: Three-layer model answer package
        
        Supports: line_graph, bar_chart, pie_chart, table, process, map
        """
        
        # Detect visual type from task_data
        visual_type = task_data.get("visual_type", "line_graph")
        
        # Check for visual-specific fields
        if "stages" in task_data:
            visual_type = "process"
        elif "features_before" in task_data or "features_after" in task_data:
            visual_type = "map"
        elif "segments" in task_data:
            visual_type = "pie_chart"
        elif "columns" in task_data and "rows" in task_data:
            visual_type = "table"
        elif "datasets" in task_data:
            if task_data.get("chart_type") == "bar":
                visual_type = "bar_chart"
            else:
                visual_type = "line_graph"
        
        datasets = task_data.get("datasets", [])
        years = task_data.get("x_values", [])
        analysis_hints = task_data.get("analysis_hints", {})
        metadata = task_data.get("metadata", {})
        band_calibration = task_data.get("band_calibration", {})
        
        # Build Layer A: Examiner-Style Model Answer (Band 8)
        layer_a = cls._generate_examiner_model(task_data, visual_type)
        
        # Build Layer A6: Band 6 Example Answer
        layer_a6 = cls._generate_band6_model(task_data, visual_type)
        
        # Build Layer B: Academic Reasoning Notes
        layer_b = cls._generate_reasoning_notes(task_data, layer_a)
        
        # Build Layer C: Alternative Expressions
        layer_c = cls._generate_alternatives(task_data)
        
        # Check for template smell
        smell_check = cls.detect_template_smell(layer_a["full_text"])
        
        return {
            "layer_a_examiner_model": layer_a,
            "layer_a6_band6_model": layer_a6,
            "layer_b_reasoning_notes": layer_b,
            "layer_c_alternatives": layer_c,
            "quality_check": {
                "template_smell": smell_check,
                "word_count": len(layer_a["full_text"].split()),
                "target_band": band_calibration.get("target_band", "7.0-9.0")
            }
        }
    
    @classmethod
    def _generate_band6_model(cls, task_data: Dict[str, Any], visual_type: str = "line_graph") -> Dict[str, Any]:
        """Generate a realistic Band 6 example answer with typical Band 6 characteristics."""
        title = task_data.get("title", "")
        task_desc = task_data.get("task_description", "")
        time_before = task_data.get("time_before", "")
        time_after = task_data.get("time_after", "")

        if visual_type in ("process", "map"):
            if visual_type == "map":
                context = f"TASK: {task_desc}\nTITLE: {title}\nTIME: {time_before} → {time_after}"
            else:
                context = f"TASK: {task_desc}\nTITLE: {title}"
        else:
            datasets = task_data.get("datasets", [])
            years = task_data.get("x_values", [])
            context = f"TASK: {task_desc}\nTITLE: {title}\nDATA: Categories: {[ds.get('label') for ds in datasets]}, Time: {years}"

        prompt = f"""Write a Band 6 IELTS Writing Task 1 response. This must be a REALISTIC Band 6 — NOT a good answer. It should have the typical weaknesses of a Band 6 candidate.

{context}

BAND 6 CHARACTERISTICS YOU MUST INCLUDE:
1. Overview is present but VAGUE or incomplete (e.g. "There were many changes")
2. Key features are mentioned but NOT all highlighted — some important data missed
3. Use REPETITIVE linking words: "Furthermore", "In addition", "Moreover" — overused
4. Include 3-4 grammar errors: subject-verb agreement, article errors, wrong tense
5. Vocabulary is ADEQUATE but BASIC — overuse "increased", "decreased", "changed", "a lot"
6. Some mechanical description without meaningful comparison
7. Write 155-175 words (barely meeting minimum)
8. Use mostly SIMPLE sentences with only 1-2 complex structures
9. At least one run-on sentence or comma splice

DO NOT write a good answer. This must clearly deserve Band 6, not Band 7.

Write ONLY the essay text, no labels or explanations."""

        try:
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    import concurrent.futures
                    with concurrent.futures.ThreadPoolExecutor() as pool:
                        result = pool.submit(cls._sync_ai_call, prompt).result(timeout=30)
                else:
                    result = loop.run_until_complete(cls._async_ai_call(prompt))
            except RuntimeError:
                loop = asyncio.new_event_loop()
                result = loop.run_until_complete(cls._async_ai_call(prompt))
                loop.close()
        except Exception as e:
            print(f"Band 6 model generation failed: {e}")
            result = f"The {visual_type} shows information about {title.lower()}. Overall, there were some changes. In the first period, there was some basic features. The area had buildings and roads. Furthermore, the layout was simple. In addition, there was not many facilities for people to use. After the changes, the area changed a lot. New buildings was built and the roads become wider. Furthermore, more facilities was added to the area. In addition, the overall appearance of the area improved. In conclusion, the area underwent some development over the time period shown."

        word_count = len(result.split())
        return {
            "full_text": result,
            "estimated_band": "6.0",
            "word_count": word_count,
            "band_characteristics": [
                "Vague or incomplete overview",
                "Repetitive linking devices",
                "Basic vocabulary with limited range",
                "Several grammar errors (articles, tenses, subject-verb)",
                "Mostly simple sentence structures"
            ]
        }

    @classmethod
    def _generate_examiner_model(cls, task_data: Dict[str, Any], visual_type: str = "line_graph") -> Dict[str, Any]:
        """Generate Layer A: Examiner-Style Band 8 Model Answer for all visual types."""
        
        if visual_type == "process":
            return cls._generate_process_model(task_data)
        elif visual_type == "map":
            return cls._generate_map_model(task_data)
        elif visual_type == "pie_chart":
            return cls._generate_pie_model(task_data)
        elif visual_type == "table":
            return cls._generate_table_model(task_data)
        elif visual_type == "bar_chart":
            return cls._generate_bar_model(task_data)
        else:
            # Default: Line graph
            return cls._generate_line_graph_model(task_data)
    
    @classmethod
    def _generate_line_graph_model(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate model answer for line graphs."""
        datasets = task_data.get("datasets", [])
        years = task_data.get("x_values", [])
        title = task_data.get("title", "")
        y_label = task_data.get("y_label", "")
        analysis_hints = task_data.get("analysis_hints", {})
        
        # PARAGRAPH 1: Introduction + Overview
        intro_paragraph = cls._write_introduction(task_data)
        
        # PARAGRAPH 2: Body 1 - Main trends
        body1_paragraph = cls._write_body_paragraph_1(task_data)
        
        # PARAGRAPH 3: Body 2 - Comparisons and details
        body2_paragraph = cls._write_body_paragraph_2(task_data)
        
        full_text = f"{intro_paragraph}\n\n{body1_paragraph}\n\n{body2_paragraph}"
        
        return {
            "full_text": full_text,
            "structure": {
                "introduction_overview": intro_paragraph,
                "body_paragraph_1": body1_paragraph,
                "body_paragraph_2": body2_paragraph
            },
            "estimated_band": "8.0",
            "word_count": len(full_text.split())
        }
    
    @classmethod
    def _write_introduction(cls, task_data: Dict[str, Any]) -> str:
        """Write introduction with paraphrased task + overview."""
        
        years = task_data.get("x_values", [])
        datasets = task_data.get("datasets", [])
        analysis_hints = task_data.get("analysis_hints", {})
        metadata = task_data.get("metadata", {})
        
        # Paraphrase the task description (not copy)
        subject = metadata.get("subject_type", "data")
        data_type = metadata.get("data_type", "values")
        
        # Select varied paraphrase structure
        intro_options = [
            f"The line graph provides data on {subject.replace('_', ' ')} over a {len(years)}-year period from {years[0]} to {years[-1]}.",
            f"This line graph depicts changes in {subject.replace('_', ' ')} between {years[0]} and {years[-1]}.",
            f"The given line graph compares {len(datasets)} different {subject.replace('_', ' ')} categories from {years[0]} to {years[-1]}."
        ]
        
        import random
        intro = random.choice(intro_options)
        
        # Add overview (most important sentence)
        overall_trend = analysis_hints.get("overall_trend", "varied patterns")
        highest = analysis_hints.get("highest_point", {})
        lowest = analysis_hints.get("lowest_point", {})
        
        overview_options = [
            f"Overall, the data reveals {overall_trend} across the categories, with {highest.get('label', 'one category')} recording the highest figures while {lowest.get('label', 'another')} showed the lowest.",
            f"The most notable feature is that the figures show {overall_trend}, with significant variation between the different categories.",
            f"Looking at the overall trend, it is evident that {overall_trend} characterise the data, particularly for {highest.get('label', 'certain categories')}."
        ]
        
        overview = random.choice(overview_options)
        
        return f"{intro} {overview}"
    
    @classmethod
    def _write_body_paragraph_1(cls, task_data: Dict[str, Any]) -> str:
        """Write body paragraph 1 focusing on main trends."""
        
        datasets = task_data.get("datasets", [])
        years = task_data.get("x_values", [])
        analysis_hints = task_data.get("analysis_hints", {})
        
        sentences = []
        
        # Focus on 1-2 most interesting lines
        for i, ds in enumerate(datasets[:2]):
            label = ds.get("label", f"Category {i+1}")
            values = ds.get("values", [])
            trend_type = ds.get("trend_type", "stable")
            
            if not values:
                continue
            
            start_val = values[0]
            end_val = values[-1]
            
            # Select appropriate verb
            if trend_type in ["steady_increase", "fluctuating_increase"]:
                verb = random.choice(cls.ACADEMIC_VOCABULARY["trend_verbs_increase"])
                direction = "growth"
            elif trend_type in ["steady_decrease", "gradual_decline"]:
                verb = random.choice(cls.ACADEMIC_VOCABULARY["trend_verbs_decrease"])
                direction = "decline"
            elif trend_type == "peak_then_decline":
                verb = "peaked"
                direction = "rise followed by a decline"
            else:
                verb = random.choice(cls.ACADEMIC_VOCABULARY["trend_verbs_stable"])
                direction = "stability"
            
            # Calculate magnitude
            if start_val > 0:
                pct_change = abs((end_val - start_val) / start_val) * 100
                if pct_change > 50:
                    adverb = random.choice(cls.ACADEMIC_VOCABULARY["degree_adverbs"]["dramatic"])
                elif pct_change > 20:
                    adverb = random.choice(cls.ACADEMIC_VOCABULARY["degree_adverbs"]["moderate"])
                else:
                    adverb = random.choice(cls.ACADEMIC_VOCABULARY["degree_adverbs"]["slight"])
            else:
                adverb = "notably"
            
            # Build sentence
            if i == 0:
                sentence = f"Turning to the specifics, the figure for {label} {verb} {adverb} from {start_val} in {years[0]} to {end_val} by {years[-1]}."
            else:
                sentence = f"Similarly, {label} demonstrated a {direction}, moving from {start_val} to {end_val} over the same period."
            
            sentences.append(sentence)
        
        return " ".join(sentences)
    
    @classmethod
    def _write_body_paragraph_2(cls, task_data: Dict[str, Any]) -> str:
        """Write body paragraph 2 focusing on comparisons and details."""
        
        datasets = task_data.get("datasets", [])
        years = task_data.get("x_values", [])
        analysis_hints = task_data.get("analysis_hints", {})
        
        sentences = []
        
        # Remaining categories
        for i, ds in enumerate(datasets[2:], start=2):
            label = ds.get("label", f"Category {i+1}")
            values = ds.get("values", [])
            
            if not values:
                continue
            
            # Brief mention of other trends
            start_val = values[0]
            end_val = values[-1]
            
            if end_val > start_val:
                sentence = f"Meanwhile, {label} experienced an increase from {start_val} to {end_val}."
            elif end_val < start_val:
                sentence = f"In contrast, {label} saw a decrease, falling from {start_val} to {end_val}."
            else:
                sentence = f"{label} remained relatively unchanged throughout the period."
            
            sentences.append(sentence)
        
        # Add comparison
        comparisons = analysis_hints.get("comparisons", [])
        if comparisons:
            comp = comparisons[0]
            if comp.get("type") == "final_ranking":
                sentences.append(f"By {years[-1]}, {comp.get('highest', 'one category')} had emerged as the highest, while {comp.get('lowest', 'another')} recorded the lowest figures.")
        
        # Add notable change if exists
        notable_changes = analysis_hints.get("notable_changes", [])
        if notable_changes:
            change = notable_changes[0]
            sentences.append(f"A particularly striking change occurred in {change.get('label', 'one category')}, which showed a {change.get('magnitude', 'significant')} {change.get('direction', 'change')} between {change.get('from_year', '')} and {change.get('to_year', '')}.")
        
        return " ".join(sentences) if sentences else "The remaining categories showed similar patterns of variation."
    
    @classmethod
    def _generate_reasoning_notes(cls, task_data: Dict[str, Any], layer_a: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Layer B: Academic Reasoning Notes (Teaching Layer)."""
        
        analysis_hints = task_data.get("analysis_hints", {})
        
        return {
            "overview_reasoning": {
                "question": "Why was this overview chosen?",
                "explanation": f"The overview highlights the {analysis_hints.get('overall_trend', 'main trend')} because this is the most significant pattern that an examiner would expect to see identified. A good overview should capture the 'big picture' without getting into specific numbers.",
                "alternative_approaches": [
                    "Could have focused on the contrast between highest and lowest categories",
                    "Could have emphasized the time period's start vs. end comparison",
                    "Could have highlighted the most dramatic change"
                ]
            },
            "data_selection_reasoning": {
                "question": "Why were certain data points highlighted?",
                "explanation": "The specific figures mentioned ({highest}, {lowest}) were selected because they represent the extremes and key turning points. Not every data point needs mentioning - selective reporting demonstrates analytical skill.",
                "what_was_omitted": [
                    "Minor fluctuations in middle years",
                    "Categories with stable/unremarkable trends",
                    "Exact figures for every year (would make response too list-like)"
                ]
            },
            "structure_reasoning": {
                "question": "Why this paragraph structure?",
                "explanation": "The response follows a clear logical structure: Introduction + Overview → Main trends (most significant) → Comparisons and details. This allows the examiner to follow the analysis easily.",
                "key_decisions": [
                    "Overview in first paragraph (Band 7+ requirement)",
                    "Most important trends discussed first",
                    "Comparisons provide depth without repeating"
                ]
            },
            "language_reasoning": {
                "question": "Why these specific verbs and structures?",
                "explanation": "Academic vocabulary ('demonstrated', 'experienced', 'emerged') shows lexical range without being unnatural. Varied sentence structures show grammatical range.",
                "vocabulary_choices": {
                    "trend_verbs": "Using 'rose/fell' variations shows vocabulary range",
                    "adverbs": "Degree adverbs (significantly, gradually) add precision",
                    "linking": "Cohesive devices (meanwhile, in contrast) show logical connection"
                }
            }
        }
    
    @classmethod
    def _generate_alternatives(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate Layer C: Alternative Academic Expressions."""
        
        datasets = task_data.get("datasets", [])
        years = task_data.get("x_values", [])
        
        return {
            "overview_alternatives": [
                "Overall, the graph reveals contrasting trends among the categories.",
                "The most notable observation is the divergence in patterns over time.",
                "What immediately stands out is the variation between different categories.",
                "Broadly speaking, the data shows significant shifts across the period."
            ],
            "increase_expressions": [
                "{subject} rose from X to Y",
                "{subject} experienced an upward trend, climbing from X to Y",
                "{subject} saw a steady increase, reaching Y by {end_year}",
                "The figure for {subject} grew significantly over the period",
                "{subject} demonstrated consistent growth throughout"
            ],
            "decrease_expressions": [
                "{subject} fell from X to Y",
                "{subject} witnessed a decline, dropping to Y",
                "There was a notable decrease in {subject}",
                "{subject} experienced a downward trend over the years",
                "The figures for {subject} contracted by X%"
            ],
            "comparison_expressions": [
                "While {A} showed growth, {B} experienced the opposite trend",
                "{A} consistently outperformed {B} throughout the period",
                "In contrast to {A}, {B} demonstrated a declining pattern",
                "The gap between {A} and {B} widened/narrowed over time",
                "{A} started higher than {B} but was overtaken by {year}"
            ],
            "time_reference_alternatives": [
                "over the period shown",
                "throughout the timeframe",
                "across the years surveyed",
                "during this {X}-year period",
                "from {start} onwards",
                "by the end of the period"
            ],
            "paraphrase_examples": {
                "original": "The graph shows information about...",
                "alternatives": [
                    "The line graph depicts changes in...",
                    "The given chart illustrates trends in...",
                    "This graph compares data on...",
                    "The figure provides information regarding..."
                ]
            }
        }
    
    @classmethod
    async def generate_ai_model_answer(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate AI-powered model answer using GPT-4o.
        Only used for generating the academic reasoning feedback.
        """
        from services.llm_compat import LlmChat, UserMessage
        
        try:
            llm = LlmChat(
                api_key=os.environ.get("EMERGENT_LLM_KEY"),
                model="gpt-4o"
            )
            
            prompt = f"""You are an IELTS examiner writing a Band 8 model answer for Writing Task 1.

TASK DESCRIPTION:
{task_data.get('task_description', '')}

DATA SUMMARY:
- Categories: {[ds.get('label') for ds in task_data.get('datasets', [])]}
- Time period: {task_data.get('x_values', [])[0]} to {task_data.get('x_values', [])[-1]}
- Key features: {json.dumps(task_data.get('analysis_hints', {}), indent=2)}

CRITICAL RULES:
1. DO NOT use template phrases like "Overall, it is clear that" or "The chart illustrates"
2. Write naturally as an academic writer would
3. Include a clear overview in the first paragraph
4. Select key data points - don't list everything
5. Make meaningful comparisons
6. Use varied vocabulary and sentence structures
7. Write MINIMUM 170 words and MAXIMUM 210 words — this is essential
8. This is a Band 8 model, not Band 9. It should be excellent but show natural human writing

Write ONLY the model answer text, no explanations."""

            result = await llm.chat([UserMessage(content=prompt)])
            
            # Check for template smell
            smell_check = cls.detect_template_smell(result)
            
            if smell_check["is_template_like"]:
                # Regenerate with stricter instructions
                retry_prompt = f"""REGENERATE the previous response. It contains template phrases.
                
AVOID THESE PHRASES: {smell_check['detected_phrases']}

Write more naturally, as a native academic writer would. Focus on the specific data."""
                
                result = await llm.chat([UserMessage(content=retry_prompt)])
            
            return {
                "ai_generated": True,
                "text": result.strip(),
                "word_count": len(result.split()),
                "quality_check": cls.detect_template_smell(result)
            }
            
        except Exception as e:
            return {
                "ai_generated": False,
                "error": str(e),
                "fallback_used": True
            }
    
    # ============ VISUAL TYPE SPECIFIC MODEL GENERATORS ============
    
    @classmethod
    def _generate_process_model(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate model answer for process diagrams using AI."""
        return cls._generate_ai_model_answer(task_data, "process")

    @classmethod
    def _generate_map_model(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate model answer for map comparisons using AI."""
        return cls._generate_ai_model_answer(task_data, "map")

    @classmethod
    def _generate_ai_model_answer(cls, task_data: Dict[str, Any], visual_type: str) -> Dict[str, Any]:
        """Use AI to generate a proper Band 8 model answer for process/map visuals."""
        import asyncio

        title = task_data.get("title", "")
        task_desc = task_data.get("task_description", "")
        time_before = task_data.get("time_before", "")
        time_after = task_data.get("time_after", "")

        if visual_type == "map":
            context = f"""TASK: {task_desc}
VISUAL TYPE: Map comparison (before/after)
TITLE: {title}
TIME BEFORE: {time_before}
TIME AFTER: {time_after}"""
        else:
            context = f"""TASK: {task_desc}
VISUAL TYPE: Process diagram
TITLE: {title}"""

        prompt = f"""Write a Band 8 IELTS Writing Task 1 model answer.

{context}

STRICT RULES:
1. Write EXACTLY 170-200 words
2. Paragraph 1: Paraphrase the task + clear overview of main changes
3. Paragraph 2: Describe the first period/stage details
4. Paragraph 3: Describe changes/later stages with comparisons
5. Use varied vocabulary: "underwent significant transformation", "was converted into", "was replaced by"
6. Use passive voice and past tense for map changes
7. Use sequencing language for processes
8. Do NOT use template phrases like "Overall, it is clear that"
9. Include specific references to features visible in the visual
10. This must read like a real Band 8 answer, not a generic template

Write ONLY the essay text. No titles, no labels, no word count."""

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                import concurrent.futures
                with concurrent.futures.ThreadPoolExecutor() as pool:
                    result = pool.submit(cls._sync_ai_call, prompt).result(timeout=30)
            else:
                result = loop.run_until_complete(cls._async_ai_call(prompt))
        except Exception as e:
            print(f"AI model answer generation failed: {e}")
            if visual_type == "map":
                result = f"The two maps illustrate the changes that took place in {title.lower()} between {time_before} and {time_after}. Overall, the area underwent considerable development, with several new facilities being added while some original features were retained.\n\nIn the earlier period, the area was relatively undeveloped with basic infrastructure. The layout was simple with limited facilities available to residents or visitors.\n\nBy {time_after}, the area had been significantly transformed. New buildings and infrastructure had been constructed, the road network was expanded, and additional amenities were introduced. Despite these changes, certain features from the original layout remained intact, indicating that the redevelopment aimed to modernise the area while preserving some of its original character."
            else:
                result = f"The diagram illustrates the process of {title.lower()}. Overall, this is a multi-stage procedure that involves several sequential steps from beginning to end.\n\nAt the initial stage, raw materials are collected and prepared for processing. This preparation phase is essential as it ensures the quality of the final product.\n\nSubsequently, the materials undergo several transformation stages. Each step builds upon the previous one, gradually converting the raw input into the finished product. The final stage involves quality checking and packaging before the product is distributed to consumers or end users."

        word_count = len(result.split())
        return {
            "full_text": result,
            "structure": {"full_answer": result},
            "estimated_band": "8.0",
            "word_count": word_count
        }

    @classmethod
    def _sync_ai_call(cls, prompt: str) -> str:
        import os
        from services.llm_compat import LlmChat, UserMessage
        import uuid
        import asyncio
        loop = asyncio.new_event_loop()
        try:
            return loop.run_until_complete(cls._async_ai_call(prompt))
        finally:
            loop.close()

    @classmethod
    async def _async_ai_call(cls, prompt: str) -> str:
        import os, uuid
        from services.llm_compat import LlmChat, UserMessage
        llm = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY", ""),
            session_id=f"model_answer_{uuid.uuid4()}",
            system_message="You are an IELTS examiner writing model answers. Write naturally, avoid templates."
        ).with_model("openai", "gpt-4o-mini")
        return await llm.send_message(UserMessage(text=prompt))
    
    @classmethod
    def _generate_pie_model(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate model answer for pie charts."""
        title = task_data.get("title", "The pie chart")
        segments = task_data.get("segments", [])
        datasets = task_data.get("datasets", [])
        
        values = datasets[0].get("values", []) if datasets else []
        
        intro = f"The pie chart provides information about the distribution of {title.lower().replace('the pie chart shows ', '')}."
        
        if segments and values:
            # Sort by value to find largest and smallest
            combined = list(zip(segments, values))
            combined.sort(key=lambda x: x[1], reverse=True)
            
            overview = f"Overall, {combined[0][0]} accounts for the largest proportion at {combined[0][1]}%, while {combined[-1][0]} represents the smallest share."
            
            body_sentences = []
            for seg, val in combined[:4]:
                body_sentences.append(f"{seg} comprises {val}% of the total.")
        else:
            overview = "The chart reveals notable differences between the categories."
            body_sentences = ["The segments show varying proportions."]
        
        full_text = f"{intro} {overview}\n\n{' '.join(body_sentences)}"
        
        return {
            "full_text": full_text,
            "structure": {"introduction": f"{intro} {overview}", "body": ' '.join(body_sentences)},
            "estimated_band": "8.0",
            "word_count": len(full_text.split())
        }
    
    @classmethod
    def _generate_table_model(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate model answer for tables."""
        title = task_data.get("title", "The table")
        columns = task_data.get("columns", [])
        rows = task_data.get("rows", [])
        
        intro = f"The table presents data regarding {title.lower().replace('table showing ', '')}."
        
        overview = "Overall, there are notable variations across the different categories presented."
        
        body_sentences = []
        if rows:
            body_sentences.append(f"Looking at the data, {rows[0][0] if rows[0] else 'the first category'} shows significant figures.")
            if len(rows) > 1:
                body_sentences.append(f"In comparison, {rows[-1][0] if rows[-1] else 'the last category'} presents different values.")
        
        full_text = f"{intro} {overview}\n\n{' '.join(body_sentences)}"
        
        return {
            "full_text": full_text,
            "structure": {"introduction": f"{intro} {overview}", "body": ' '.join(body_sentences)},
            "estimated_band": "7.5",
            "word_count": len(full_text.split())
        }
    
    @classmethod
    def _generate_bar_model(cls, task_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate model answer for bar charts."""
        title = task_data.get("title", "The bar chart")
        categories = task_data.get("categories", [])
        datasets = task_data.get("datasets", [])
        y_label = task_data.get("y_label", "values")
        
        intro = f"The bar chart illustrates {title.lower().replace('the bar chart shows ', '')}."
        
        # Find highest and lowest
        if datasets and datasets[0].get("values"):
            values = datasets[0]["values"]
            if categories and len(categories) == len(values):
                max_idx = values.index(max(values))
                min_idx = values.index(min(values))
                overview = f"Overall, {categories[max_idx]} recorded the highest {y_label.lower()} at {max(values)}, while {categories[min_idx]} had the lowest at {min(values)}."
            else:
                overview = f"Overall, there is considerable variation in {y_label.lower()} across the categories."
        else:
            overview = "The chart reveals significant differences between the categories."
        
        body_sentences = []
        if datasets:
            for ds in datasets[:2]:
                label = ds.get("label", "Category")
                values = ds.get("values", [])
                if values:
                    body_sentences.append(f"The {label} category shows values ranging from {min(values)} to {max(values)}.")
        
        full_text = f"{intro} {overview}\n\n{' '.join(body_sentences)}"
        
        return {
            "full_text": full_text,
            "structure": {"introduction": f"{intro} {overview}", "body": ' '.join(body_sentences)},
            "estimated_band": "8.0",
            "word_count": len(full_text.split())
        }


# Create singleton instance
model_answer_generator = ModelAnswerGenerator()
