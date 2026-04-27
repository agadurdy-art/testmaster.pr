"""
IELTS Writing Task 1 - AI-Powered Model Answer Generator
=========================================================
Generates Band 8-9 quality model answers using AI.

Features:
- 3-Layer Model Answer Structure
- Visual-type specific generation
- Band 6 and Band 8.5 variations
- Academic reasoning notes
- Alternative expressions
"""

import os
import json
from typing import Dict, List, Any, Optional


class AIModelAnswerGenerator:
    """
    Generates high-quality IELTS model answers using AI.
    """
    
    # IELTS Band 9 vocabulary for different visual types
    ACADEMIC_VOCABULARY = {
        "line_graph": {
            "increase": ["rose", "climbed", "grew", "increased", "went up", "soared", "surged", "rocketed"],
            "decrease": ["fell", "dropped", "declined", "decreased", "plummeted", "plunged", "slumped"],
            "stable": ["remained stable", "stayed constant", "levelled off", "plateaued", "held steady"],
            "fluctuate": ["fluctuated", "varied", "oscillated", "experienced ups and downs"],
            "peak": ["peaked", "reached a peak", "hit a high", "reached its highest point"],
            "trough": ["bottomed out", "reached its lowest point", "hit a low"],
            "gradual": ["gradually", "steadily", "progressively", "slowly but surely"],
            "sharp": ["sharply", "dramatically", "significantly", "markedly", "considerably"],
            "slight": ["slightly", "marginally", "fractionally", "modestly"]
        },
        "comparison": {
            "more": ["more than", "greater than", "higher than", "exceeded", "surpassed", "outpaced"],
            "less": ["less than", "lower than", "below", "under", "fewer than"],
            "same": ["the same as", "equal to", "identical to", "comparable to", "on par with"],
            "contrast": ["in contrast", "conversely", "on the other hand", "whereas", "while", "however"],
            "similar": ["similarly", "likewise", "in the same way", "correspondingly"]
        },
        "overview": {
            "general": ["Overall", "In general", "It is evident that", "Broadly speaking", "Looking at the bigger picture"],
            "notable": ["The most notable feature is", "What stands out is", "The key observation is", "Significantly"]
        },
        "process": {
            "sequence": ["Initially", "First", "To begin with", "At the outset"],
            "continuation": ["Subsequently", "Following this", "Next", "Then", "After that", "Afterwards"],
            "final": ["Finally", "Ultimately", "In the final stage", "Lastly"],
            "simultaneous": ["Meanwhile", "At the same time", "Concurrently", "Simultaneously"]
        },
        "map": {
            "location": ["in the north", "to the south", "on the eastern side", "in the western part", "in the centre"],
            "change": ["was replaced by", "was converted into", "was transformed into", "gave way to", "made room for"],
            "addition": ["was added", "was constructed", "was built", "was introduced", "was established"],
            "removal": ["was removed", "was demolished", "was cleared", "disappeared", "was eliminated"]
        }
    }
    
    # Band descriptors for self-assessment
    BAND_DESCRIPTORS = {
        "9": {
            "task_achievement": "Fully satisfies all requirements; clearly presents a fully developed response",
            "coherence": "Uses cohesion in such a way that it attracts no attention",
            "lexical": "Uses a wide range of vocabulary with very natural and sophisticated control",
            "grammar": "Uses a wide range of structures with full flexibility and accuracy"
        },
        "8": {
            "task_achievement": "Covers all requirements sufficiently; presents, highlights and illustrates key features",
            "coherence": "Sequences information and ideas logically; manages all aspects of cohesion well",
            "lexical": "Uses a wide range of vocabulary fluently and flexibly",
            "grammar": "Uses a wide range of structures; the majority of sentences are error-free"
        },
        "6": {
            "task_achievement": "Addresses the requirements adequately; presents an overview with some key features",
            "coherence": "Arranges information coherently; uses cohesive devices effectively",
            "lexical": "Uses an adequate range of vocabulary; attempts less common vocabulary with some inaccuracy",
            "grammar": "Uses a mix of simple and complex sentences; makes some errors but they rarely reduce communication"
        }
    }
    
    async def generate_model_answer(
        self,
        task_data: Dict[str, Any],
        target_band: str = "8.5"
    ) -> Dict[str, Any]:
        """
        Generate a complete 3-layer model answer using AI.
        """
        visual_type = task_data.get("visual_type", "line_graph")
        
        # Build the prompt based on visual type
        prompt = self._build_generation_prompt(task_data, visual_type, target_band)
        
        try:
            # Try to use AI for generation
            model_text = await self._generate_with_ai(prompt, task_data)
        except Exception as e:
            print(f"AI generation failed, using template: {e}")
            model_text = self._generate_template_answer(task_data, visual_type, target_band)
        
        # Build the 3-layer structure
        return {
            "layer_a_examiner_model": {
                "band_level": target_band,
                "full_text": model_text,
                "word_count": len(model_text.split()),
                "estimated_band": target_band,
                "structure": self._analyze_structure(model_text)
            },
            "layer_b_reasoning_notes": self._generate_reasoning_notes(task_data, model_text, visual_type),
            "layer_c_alternatives": self._generate_alternatives(visual_type),
            "quality_metrics": {
                "has_overview": "overall" in model_text.lower() or "general" in model_text.lower(),
                "has_specific_data": any(char.isdigit() for char in model_text),
                "has_comparisons": any(word in model_text.lower() for word in ["while", "whereas", "compared", "contrast"]),
                "word_count": len(model_text.split())
            }
        }
    
    async def _generate_with_ai(self, prompt: str, task_data: Dict[str, Any]) -> str:
        """Generate model answer using AI."""
        from services.llm_compat import LlmChat, UserMessage
        
        llm = LlmChat(
            api_key=os.environ.get("EMERGENT_LLM_KEY"),
            model="gpt-4o"
        )
        
        result = await llm.chat([UserMessage(content=prompt)])
        return result.strip()
    
    def _build_generation_prompt(
        self, 
        task_data: Dict[str, Any], 
        visual_type: str,
        target_band: str
    ) -> str:
        """Build the AI prompt for model answer generation."""
        
        task_description = task_data.get("task_description", "")
        
        # Visual-specific data summary
        data_summary = self._summarize_data(task_data, visual_type)
        
        band_instruction = ""
        if target_band == "6.0":
            band_instruction = """
Write at a Band 6 level:
- Include an overview but keep it simple
- Use adequate vocabulary (some repetition is acceptable)
- Mix simple and complex sentences
- Minor grammatical errors are acceptable
- Around 160-180 words"""
        else:
            band_instruction = """
Write at a Band 8.5+ level:
- Start with a clear, insightful overview paragraph
- Use sophisticated vocabulary naturally (avoid template phrases)
- Include specific data with accurate reporting
- Make meaningful comparisons
- Use a variety of complex sentence structures
- Organize logically with clear paragraphing
- Around 180-220 words"""
        
        prompt = f"""You are an IELTS examiner writing a model answer for Writing Task 1.

TASK:
{task_description}

DATA SUMMARY:
{data_summary}

{band_instruction}

CRITICAL RULES:
1. DO NOT use template phrases like "It is clear that" or "The graph illustrates"
2. Write naturally as an academic writer would
3. Include specific numbers from the data
4. Make at least 2-3 meaningful comparisons
5. Use varied vocabulary - no repetition of key verbs

Write ONLY the model answer text, no explanations or labels."""
        
        return prompt
    
    def _summarize_data(self, task_data: Dict[str, Any], visual_type: str) -> str:
        """Create a text summary of the visual data."""
        
        if visual_type == "line_graph":
            datasets = task_data.get("datasets", [])
            years = task_data.get("x_values", [])
            
            summary_parts = []
            for ds in datasets:
                label = ds.get("label", "Category")
                values = ds.get("values", [])
                if values and years:
                    summary_parts.append(
                        f"- {label}: Started at {values[0]} in {years[0]}, ended at {values[-1]} in {years[-1]}. "
                        f"Highest: {max(values)}, Lowest: {min(values)}"
                    )
            return "\n".join(summary_parts)
        
        elif visual_type == "bar_chart":
            categories = task_data.get("categories", [])
            datasets = task_data.get("datasets", [])
            
            if datasets and categories:
                values = datasets[0].get("values", [])
                pairs = list(zip(categories, values))
                pairs.sort(key=lambda x: x[1], reverse=True)
                return "\n".join([f"- {cat}: {val}" for cat, val in pairs])
            return "Data not available"
        
        elif visual_type == "pie_chart":
            segments = task_data.get("segments", [])
            datasets = task_data.get("datasets", [])
            
            if datasets and segments:
                values = datasets[0].get("values", [])
                pairs = list(zip(segments, values))
                pairs.sort(key=lambda x: x[1], reverse=True)
                return "\n".join([f"- {seg}: {val}%" for seg, val in pairs])
            return "Data not available"
        
        elif visual_type == "table":
            rows = task_data.get("rows", [])
            return "\n".join([f"- {row[0]}: {', '.join(map(str, row[1:]))}" for row in rows[:5]])
        
        elif visual_type == "process":
            stages = task_data.get("stages", [])
            return "\n".join([f"{i+1}. {s.get('name', s)}: {s.get('description', '')}" for i, s in enumerate(stages)])
        
        elif visual_type == "map":
            before = task_data.get("features_before", [])
            after = task_data.get("features_after", [])
            return f"BEFORE:\n{chr(10).join(['- ' + f for f in before])}\n\nAFTER:\n{chr(10).join(['- ' + f for f in after])}"
        
        return "See visual for data"
    
    def _generate_template_answer(
        self, 
        task_data: Dict[str, Any], 
        visual_type: str,
        target_band: str
    ) -> str:
        """Generate a template-based answer as fallback."""
        
        if visual_type == "line_graph":
            return self._template_line_graph(task_data, target_band)
        elif visual_type == "bar_chart":
            return self._template_bar_chart(task_data, target_band)
        elif visual_type == "pie_chart":
            return self._template_pie_chart(task_data, target_band)
        elif visual_type == "table":
            return self._template_table(task_data, target_band)
        elif visual_type == "process":
            return self._template_process(task_data, target_band)
        elif visual_type == "map":
            return self._template_map(task_data, target_band)
        
        return "Model answer generation failed."
    
    def _template_line_graph(self, task_data: Dict[str, Any], target_band: str) -> str:
        """Generate line graph model answer from template."""
        datasets = task_data.get("datasets", [])
        years = task_data.get("x_values", [])
        title = task_data.get("title", "The graph")
        
        if not datasets or not years:
            return "Insufficient data for model answer."
        
        # Analyze data
        all_values = []
        trends = []
        for ds in datasets:
            values = ds["values"]
            all_values.extend(values)
            
            if values[-1] > values[0] * 1.1:
                trends.append((ds["label"], "increased", values[0], values[-1]))
            elif values[-1] < values[0] * 0.9:
                trends.append((ds["label"], "decreased", values[0], values[-1]))
            else:
                trends.append((ds["label"], "remained relatively stable", values[0], values[-1]))
        
        # Build paragraphs
        intro = f"{title.replace('.', '')} over the period from {years[0]} to {years[-1]}."
        
        # Overview
        if len(trends) > 0:
            increasing = [t for t in trends if "increased" in t[1]]
            decreasing = [t for t in trends if "decreased" in t[1]]
            
            if len(increasing) > len(decreasing):
                overview = "Overall, the data reveals a predominantly upward trend across most categories, although there were notable variations in the rate of growth."
            elif len(decreasing) > len(increasing):
                overview = "Overall, the figures demonstrate a general downward trajectory, with some categories experiencing more significant declines than others."
            else:
                overview = "Overall, the trends varied considerably between the different categories, with some showing growth while others experienced decline."
        else:
            overview = "Overall, the data shows varied patterns across the categories presented."
        
        # Body paragraphs
        body_parts = []
        for label, trend, start, end in trends[:3]:
            change = abs(end - start)
            if "increased" in trend:
                body_parts.append(
                    f"The figures for {label} {trend} from {start} in {years[0]} to {end} by {years[-1]}, "
                    f"representing a rise of approximately {round(change)}."
                )
            elif "decreased" in trend:
                body_parts.append(
                    f"{label} showed a declining pattern, falling from {start} to {end} over the period, "
                    f"a decrease of around {round(change)}."
                )
            else:
                body_parts.append(
                    f"The data for {label} {trend} throughout the period, hovering around {round((start + end) / 2)}."
                )
        
        # Combine
        full_text = f"{intro}\n\n{overview}\n\n{' '.join(body_parts)}"
        
        return full_text
    
    def _template_bar_chart(self, task_data: Dict[str, Any], target_band: str) -> str:
        """Generate bar chart model answer."""
        categories = task_data.get("categories", [])
        datasets = task_data.get("datasets", [])
        title = task_data.get("title", "The chart")
        
        if not datasets or not categories:
            return "Insufficient data."
        
        values = datasets[0].get("values", [])
        pairs = list(zip(categories, values))
        pairs.sort(key=lambda x: x[1], reverse=True)
        
        intro = f"{title.replace('.', '')}."
        
        overview = f"Overall, {pairs[0][0]} recorded the highest figure at {pairs[0][1]}, while {pairs[-1][0]} had the lowest at {pairs[-1][1]}. The difference between the highest and lowest values was {pairs[0][1] - pairs[-1][1]}."
        
        body = f"Looking at the details, {pairs[0][0]} led with {pairs[0][1]}, followed by {pairs[1][0]} at {pairs[1][1]}. "
        body += f"In contrast, {pairs[-1][0]} and {pairs[-2][0]} were at the lower end with {pairs[-1][1]} and {pairs[-2][1]} respectively."
        
        return f"{intro}\n\n{overview}\n\n{body}"
    
    def _template_pie_chart(self, task_data: Dict[str, Any], target_band: str) -> str:
        """Generate pie chart model answer."""
        segments = task_data.get("segments", [])
        datasets = task_data.get("datasets", [])
        title = task_data.get("title", "The chart")
        
        if not datasets or not segments:
            return "Insufficient data."
        
        values = datasets[0].get("values", [])
        pairs = list(zip(segments, values))
        pairs.sort(key=lambda x: x[1], reverse=True)
        
        intro = f"{title.replace('.', '')}."
        
        overview = f"Overall, {pairs[0][0]} accounted for the largest proportion at {pairs[0][1]}%, while {pairs[-1][0]} represented the smallest share at just {pairs[-1][1]}%."
        
        # Group into large, medium, small
        large = [p for p in pairs if p[1] > 20]
        small = [p for p in pairs if p[1] < 10]
        
        body = f"The largest categories were {', '.join([f'{p[0]} ({p[1]}%)' for p in large[:3]])}. "
        if small:
            body += f"At the other end of the scale, {', '.join([f'{p[0]} ({p[1]}%)' for p in small[:2]])} made up relatively minor portions."
        
        return f"{intro}\n\n{overview}\n\n{body}"
    
    def _template_table(self, task_data: Dict[str, Any], target_band: str) -> str:
        """Generate table model answer."""
        rows = task_data.get("rows", [])
        columns = task_data.get("columns", [])
        title = task_data.get("title", "The table")
        
        if not rows:
            return "Insufficient data."
        
        intro = f"{title.replace('.', '')}."
        
        overview = f"Overall, there are considerable variations in the data across different categories, with some showing notably higher figures than others."
        
        body_parts = []
        for row in rows[:4]:
            if len(row) > 1:
                body_parts.append(f"{row[0]} showed values of {', '.join(map(str, row[1:]))} across the columns.")
        
        return f"{intro}\n\n{overview}\n\n{' '.join(body_parts)}"
    
    def _template_process(self, task_data: Dict[str, Any], target_band: str) -> str:
        """Generate process diagram model answer."""
        stages = task_data.get("stages", [])
        title = task_data.get("title", "The diagram")
        is_cyclical = task_data.get("is_cyclical", False)
        
        if not stages:
            return "Insufficient data."
        
        intro = f"{title.replace('.', '')}. There are {len(stages)} main stages in this process."
        
        if is_cyclical:
            overview = f"Overall, this is a cyclical process that begins and ends at the same point, with {len(stages)} distinct stages."
        else:
            overview = f"Overall, the process consists of {len(stages)} sequential stages, starting with {stages[0].get('name', 'the first stage')} and ending with {stages[-1].get('name', 'the final stage')}."
        
        # Body with sequence words
        sequence_words = ["Initially", "Following this", "Subsequently", "Next", "Then", "After that", "Finally"]
        body_parts = []
        
        for i, stage in enumerate(stages[:7]):
            seq = sequence_words[min(i, len(sequence_words) - 1)]
            name = stage.get("name", f"Stage {i+1}")
            desc = stage.get("description", "")
            body_parts.append(f"{seq}, {desc.lower() if desc else name.lower()}.")
        
        return f"{intro}\n\n{overview}\n\n{' '.join(body_parts)}"
    
    def _template_map(self, task_data: Dict[str, Any], target_band: str) -> str:
        """Generate map comparison model answer."""
        before = task_data.get("features_before", [])
        after = task_data.get("features_after", [])
        place = task_data.get("place_name", "the area")
        time_before = task_data.get("time_before", "the past")
        time_after = task_data.get("time_after", "the present")
        
        intro = f"The two maps compare {place} as it was in {time_before} with the developments that had taken place by {time_after}."
        
        overview = f"Overall, the area has undergone significant transformation, with notable changes in infrastructure and land use. The most striking change is the shift from a more rural/traditional layout to a more developed and modern configuration."
        
        body1 = f"In {time_before}, {', '.join(before[:3])}."
        body2 = f"By {time_after}, substantial changes had occurred. {', '.join(after[:3])}."
        
        return f"{intro}\n\n{overview}\n\n{body1}\n\n{body2}"
    
    def _analyze_structure(self, text: str) -> Dict[str, Any]:
        """Analyze the structure of the model answer."""
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
        
        return {
            "paragraph_count": len(paragraphs),
            "has_introduction": len(paragraphs) > 0,
            "has_overview": any("overall" in p.lower() or "general" in p.lower() for p in paragraphs),
            "has_body": len(paragraphs) >= 2,
            "paragraph_lengths": [len(p.split()) for p in paragraphs]
        }
    
    def _generate_reasoning_notes(
        self, 
        task_data: Dict[str, Any], 
        model_text: str,
        visual_type: str
    ) -> Dict[str, Any]:
        """Generate academic reasoning notes (Layer B)."""
        
        notes = {
            "why_this_overview": {
                "question": "Why is the overview written this way?",
                "explanation": "A Band 9 overview identifies the most significant overall patterns without getting into specific details. It shows the examiner you can identify the 'big picture' before diving into specifics."
            },
            "data_selection": {
                "question": "Why were these specific data points chosen?",
                "explanation": "The model answer selects data that shows the clearest trends and most meaningful comparisons. Not all data needs to be mentioned - selecting key features demonstrates analytical skill."
            },
            "vocabulary_choices": {
                "question": "Why these vocabulary choices?",
                "explanation": "Band 8-9 answers use varied vocabulary for describing trends and making comparisons. Notice how different words are used for similar concepts to avoid repetition."
            },
            "paragraph_structure": {
                "question": "Why is the answer structured this way?",
                "explanation": "The structure follows a logical pattern: introduction → overview → body paragraph(s). This organization helps the reader follow the analysis clearly."
            }
        }
        
        # Add visual-specific notes
        if visual_type == "line_graph":
            notes["trend_analysis"] = {
                "question": "How should trends be described?",
                "explanation": "Describe both the direction (up/down/stable) and the nature of change (gradual/sharp/fluctuating). Include specific data points to support your description."
            }
        elif visual_type == "process":
            notes["sequencing"] = {
                "question": "How should stages be connected?",
                "explanation": "Use varied sequencing language (initially, subsequently, following this) rather than repetitive connectors (then, then, then). Show the relationship between stages."
            }
        elif visual_type == "map":
            notes["spatial_language"] = {
                "question": "How should locations be described?",
                "explanation": "Use precise spatial language (to the north, in the eastern part, adjacent to) and change vocabulary (was replaced by, was converted into, gave way to)."
            }
        
        return notes
    
    def _generate_alternatives(self, visual_type: str) -> Dict[str, List[str]]:
        """Generate alternative expressions (Layer C)."""
        
        vocab = self.ACADEMIC_VOCABULARY
        
        alternatives = {
            "overview_starters": [
                "Overall,", "In general,", "Broadly speaking,", 
                "Looking at the overall picture,", "The most striking feature is that"
            ],
            "increase_verbs": vocab["line_graph"]["increase"],
            "decrease_verbs": vocab["line_graph"]["decrease"],
            "comparison_phrases": vocab["comparison"]["more"] + vocab["comparison"]["less"],
            "contrast_connectors": vocab["comparison"]["contrast"],
            "adverbs_of_degree": vocab["line_graph"]["sharp"] + vocab["line_graph"]["slight"] + vocab["line_graph"]["gradual"]
        }
        
        if visual_type == "process":
            alternatives["sequence_markers"] = vocab["process"]["sequence"] + vocab["process"]["continuation"]
            alternatives["final_stage_markers"] = vocab["process"]["final"]
        
        if visual_type == "map":
            alternatives["location_phrases"] = vocab["map"]["location"]
            alternatives["change_verbs"] = vocab["map"]["change"] + vocab["map"]["addition"]
        
        return alternatives


# Create singleton instance
ai_model_generator = AIModelAnswerGenerator()
