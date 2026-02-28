"""
AI Content Enricher Service
Enhances user-provided curriculum content using GPT-4o
Acts as a Master Primary Native English ESL Teacher
"""

import os
import json
import asyncio
import re
from typing import Dict, List, Any, Optional
from dotenv import load_dotenv

load_dotenv()

from emergentintegrations.llm.chat import LlmChat, UserMessage

# System prompt for the AI teacher
ESL_TEACHER_SYSTEM_PROMPT = """You are Master Emma, a highly experienced Native English ESL Teacher with 20+ years of experience teaching young learners (ages 4-8). You specialize in:

- Cambridge Young Learners methodology
- TPR (Total Physical Response) teaching
- Phonics-based instruction
- Scaffolded learning progressions
- Age-appropriate vocabulary introduction
- Engaging, playful lesson delivery

Your teaching philosophy:
1. Every word and sentence must be meaningful and contextual
2. Questions must be logical and test actual comprehension
3. Audio scripts should be natural, conversational English
4. Grammar patterns should emerge naturally from context
5. All content should be achievable but slightly challenging (i+1)

CRITICAL: You MUST respond with ONLY valid JSON. No explanations, no markdown, just pure JSON."""


def extract_json_from_response(response: str) -> dict:
    """Extract JSON from LLM response, handling markdown code blocks"""
    response = response.strip()
    
    # Try to find JSON in code block
    code_block_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', response)
    if code_block_match:
        response = code_block_match.group(1).strip()
    
    # Try to find JSON object directly
    json_match = re.search(r'\{[\s\S]*\}', response)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    
    # Try direct parsing
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        raise ValueError(f"Could not parse JSON from response: {response[:200]}...")


class AIContentEnricher:
    """Service to enrich lesson content with AI-generated pedagogical content"""
    
    def __init__(self):
        self.api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not self.api_key:
            raise ValueError("EMERGENT_LLM_KEY not found in environment")
    
    def _create_chat(self, session_id: str) -> LlmChat:
        """Create a new LLM chat instance"""
        return LlmChat(
            api_key=self.api_key,
            session_id=session_id,
            system_message=ESL_TEACHER_SYSTEM_PROMPT
        ).with_model("openai", "gpt-4o")
    
    async def enrich_lesson(self, lesson_data: Dict[str, Any], unit_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Enrich a complete lesson with AI-generated pedagogical content
        
        Args:
            lesson_data: The original lesson data from user content
            unit_context: Unit-level context (theme, grammar focus, phonics focus)
        
        Returns:
            Enriched lesson data with improved content
        """
        chat = self._create_chat(f"lesson_{lesson_data.get('lesson_id', 'unknown')}")
        
        enriched_steps = []
        
        for step in lesson_data.get('steps', []):
            enriched_step = await self._enrich_step(chat, step, lesson_data, unit_context)
            enriched_steps.append(enriched_step)
        
        # Create enriched lesson
        enriched_lesson = {
            **lesson_data,
            'steps': enriched_steps,
            'ai_enriched': True,
            'enrichment_version': '1.0'
        }
        
        return enriched_lesson
    
    async def _enrich_step(
        self, 
        chat: LlmChat, 
        step: Dict[str, Any], 
        lesson_data: Dict[str, Any],
        unit_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Enrich a single lesson step based on its type"""
        
        step_type = step.get('type')
        
        if step_type == 'warm_up':
            return await self._enrich_warmup(chat, step, lesson_data, unit_context)
        elif step_type == 'vocabulary':
            return await self._enrich_vocabulary(chat, step, lesson_data, unit_context)
        elif step_type == 'micro_game_vocab':
            return await self._enrich_vocab_game(chat, step, lesson_data, unit_context)
        elif step_type == 'micro_reading':
            return await self._enrich_reading(chat, step, lesson_data, unit_context)
        elif step_type == 'grammar_focus':
            return await self._enrich_grammar(chat, step, lesson_data, unit_context)
        elif step_type == 'grammar_game':
            return await self._enrich_grammar_game(chat, step, lesson_data, unit_context)
        elif step_type == 'listening':
            return await self._enrich_listening(chat, step, lesson_data, unit_context)
        elif step_type == 'production':
            return await self._enrich_production(chat, step, lesson_data, unit_context)
        elif step_type == 'exit_ticket':
            return await self._enrich_exit_ticket(chat, step, lesson_data, unit_context)
        else:
            return step  # Return unchanged if unknown type
    
    async def _enrich_warmup(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich warm-up activity with 3 engaging questions"""
        
        prompt = f"""Enhance this warm-up activity for young learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

LESSON CONTEXT:
- Title: {lesson.get('title')}
- Topic: {lesson.get('topic')}
- Unit Theme: {unit.get('title')}

IMPORTANT: Create 3 warm-up questions to activate prior knowledge and engage the child.

Create questions that:
1. Are related to the video/image topic
2. Have 4 logical answer options each (one correct, three plausible distractors)
3. Include helpful hints
4. Use simple, age-appropriate language

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "warm_up",
    "video_url": "{step.get('video_url', '')}",
    "instruction": "Watch the video and answer these questions!",
    "questions": [
        {{
            "question_text": "First engaging question about the topic",
            "correct_answer": "correct answer",
            "options": ["option1", "option2", "option3", "option4"],
            "image_emoji": "relevant emoji",
            "hint": "helpful hint for question 1"
        }},
        {{
            "question_text": "Second question, slightly different angle",
            "correct_answer": "correct answer",
            "options": ["option1", "option2", "option3", "option4"],
            "image_emoji": "relevant emoji",
            "hint": "helpful hint for question 2"
        }},
        {{
            "question_text": "Third question to check understanding",
            "correct_answer": "correct answer",
            "options": ["option1", "option2", "option3", "option4"],
            "image_emoji": "relevant emoji",
            "hint": "helpful hint for question 3"
        }}
    ]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Warmup enrichment failed: {e}")
            return step
    
    async def _enrich_vocabulary(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich vocabulary activity with better definitions and examples"""
        
        items = step.get('items', [])
        words_info = "\n".join([
            f"- {item.get('word')}: {item.get('definition', '')}" 
            for item in items
        ])
        
        prompt = f"""Enhance these vocabulary words for young ESL learners (ages 4-7).

ORIGINAL WORDS:
{words_info}

LESSON CONTEXT:
- Title: {lesson.get('title')}
- Topic: {lesson.get('topic')}
- Grammar Focus: {unit.get('grammar_focus', [])}

For each word, create:
1. A child-friendly definition (max 6 words, simple vocabulary)
2. A natural example sentence using the target grammar pattern
3. An appropriate emoji
4. IPA pronunciation

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "vocabulary",
    "items": [
        {{
            "word": "word1",
            "ipa": "/phonetic/",
            "definition": "simple child-friendly definition",
            "example": "Natural example sentence.",
            "image_emoji": "emoji"
        }}
    ]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Vocabulary enrichment failed: {e}")
            return step
    
    async def _enrich_vocab_game(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich vocabulary games - generate 3 game types with 10-12 items each"""
        
        # Get vocabulary from the lesson for context
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_items = vocab_step.get('items', [])
        vocab_words = [item.get('word') for item in vocab_items]
        
        prompt = f"""Create vocabulary games for young ESL learners (ages 4-7).

VOCABULARY WORDS: {vocab_words}
VOCABULARY WITH EMOJIS: {json.dumps([{'word': v.get('word'), 'emoji': v.get('image_emoji', '📝')} for v in vocab_items], ensure_ascii=False)}

IMPORTANT: Create 3 different game activities. EACH game must have 10-12 items (use each vocabulary word 2-3 times with variations).

GAME TYPES TO CREATE:
1. listen_choose_picture: Student hears word, selects correct emoji (10-12 items)
2. read_choose_picture: Student reads word, selects correct emoji (10-12 items)
3. unscramble: Student arranges scrambled letters to spell word (10-12 items)

For listen_choose_picture and read_choose_picture, include 3 distractor options per item.
Repeat vocabulary words multiple times to reach 10-12 items per game.

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "vocab_games",
    "games": [
        {{
            "game_type": "listen_choose_picture",
            "items": [
                {{"word": "hello", "emoji": "👋", "distractors": [{{"word": "apple", "emoji": "🍎"}}, {{"word": "teacher", "emoji": "👩‍🏫"}}, {{"word": "student", "emoji": "🙋"}}]}},
                {{"word": "teacher", "emoji": "👩‍🏫", "distractors": [...]}},
                ... (10-12 items total)
            ]
        }},
        {{
            "game_type": "read_choose_picture",
            "items": [...] (10-12 items)
        }},
        {{
            "game_type": "unscramble",
            "items": [
                {{"word": "hello", "emoji": "👋"}},
                ... (10-12 items)
            ]
        }}
    ],
    "total_exercises": 32
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Vocab game enrichment failed: {e}")
            return step
            print(f"Vocab game enrichment failed: {e}")
            return step
    
    async def _enrich_reading(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich reading passage and comprehension questions"""
        
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_words = [item.get('word') for item in vocab_step.get('items', [])]
        grammar_pattern = unit.get('grammar_focus', [])
        
        prompt = f"""Create an engaging micro-reading activity for young ESL learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

VOCABULARY TO INCLUDE: {vocab_words}
GRAMMAR PATTERNS: {grammar_pattern}
LESSON TOPIC: {lesson.get('topic')}

Create:
1. A short, engaging story (3-5 simple sentences)
2. Uses the target vocabulary naturally
3. Includes the grammar pattern
4. 1-2 comprehension questions with logical multiple-choice options

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "micro_reading",
    "title": "Story Title",
    "text": "Short engaging story using vocabulary and grammar patterns.",
    "questions": [
        {{
            "question": "Clear comprehension question",
            "answer": "correct answer",
            "options": ["option1", "option2", "option3"]
        }}
    ]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Reading enrichment failed: {e}")
            return step
    
    async def _enrich_grammar(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich grammar focus with clear explanations"""
        
        prompt = f"""Create a clear grammar explanation for young ESL learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

LESSON CONTEXT:
- Title: {lesson.get('title')}
- Topic: {lesson.get('topic')}

Create:
1. A simple, visual pattern (using blanks like "I like ___s.")
2. A child-friendly explanation (one simple sentence)
3. 2-3 clear examples that children can relate to

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "grammar_focus",
    "rule_pattern": "Pattern with ___",
    "explanation": "Simple one-sentence explanation",
    "examples": ["Example 1.", "Example 2.", "Example 3."]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Grammar enrichment failed: {e}")
            return step
    
    async def _enrich_grammar_game(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich grammar games - generate multiple game types"""
        
        grammar_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'grammar_focus'), {})
        pattern = grammar_step.get('rule_pattern', step.get('rule_pattern', ''))
        examples = grammar_step.get('examples', [])
        
        prompt = f"""Create grammar games for young ESL learners (ages 4-7).

GRAMMAR PATTERN: {pattern}
EXAMPLES: {examples}

IMPORTANT: Create 3 different grammar game activities. EACH game must have 4-5 items for a total of 12-15 exercises.

GAME TYPES TO CREATE:
1. word_order: Arrange scrambled words to make correct sentences (4-5 items)
2. fill_blank: Choose correct word to complete sentence (4-5 items)  
3. error_hunter: Find and identify the grammar mistake in sentence (4-5 items)

Use variations of the grammar pattern to create enough items.

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "grammar_games",
    "games": [
        {{
            "game_type": "word_order",
            "items": [
                {{"words": ["I", "am", "Ben"], "correctSentence": "I am Ben"}},
                {{"words": ["She", "is", "my", "teacher"], "correctSentence": "She is my teacher"}},
                {{"words": ["Hello", "I", "am", "happy"], "correctSentence": "Hello I am happy"}},
                {{"words": ["This", "is", "an", "apple"], "correctSentence": "This is an apple"}},
                {{"words": ["He", "is", "a", "student"], "correctSentence": "He is a student"}}
            ]
        }},
        {{
            "game_type": "fill_blank",
            "items": [
                {{"sentence": "I ___ Ben.", "answer": "am", "options": ["am", "is", "are", "be"]}},
                {{"sentence": "She ___ a teacher.", "answer": "is", "options": ["am", "is", "are", "be"]}},
                ... (4-5 items total)
            ]
        }},
        {{
            "game_type": "error_hunter",
            "items": [
                {{"sentence": "I is Ben.", "errorWord": "is", "correctWord": "am"}},
                {{"sentence": "She am a teacher.", "errorWord": "am", "correctWord": "is"}},
                ... (4-5 items total)
            ]
        }}
    ],
    "total_exercises": 14
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Grammar game enrichment failed: {e}")
            return step
    
    async def _enrich_listening(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich listening activity with natural audio script and logical questions"""
        
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_words = [item.get('word') for item in vocab_step.get('items', [])]
        grammar_pattern = unit.get('grammar_focus', [])
        
        prompt = f"""Create a listening activity for young ESL learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

VOCABULARY: {vocab_words}
GRAMMAR PATTERNS: {grammar_pattern}
LESSON TOPIC: {lesson.get('topic')}

CRITICAL: The questions must be LOGICAL and match the audio content!
- If asking "How many?", options should be NUMBERS
- If asking "What color?", options should be COLORS
- If asking "Does he like...?", options should be "Yes" / "No"

Create:
1. A natural, conversational audio script (2-3 sentences, using vocabulary)
2. 1-2 comprehension questions with LOGICAL multiple-choice options

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "listening",
    "audio_text": "Natural conversational script for TTS.",
    "questions": [
        {{
            "question": "Clear listening comprehension question",
            "answer": "correct answer (must match question type)",
            "options": ["logical option 1", "logical option 2", "logical option 3"]
        }}
    ]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            result = extract_json_from_response(response)
            # Ensure questions have proper options
            for q in result.get('questions', []):
                if not q.get('options') or len(q.get('options', [])) < 2:
                    # Add default options based on answer type
                    answer = q.get('answer', '').lower()
                    if answer in ['yes', 'no']:
                        q['options'] = ['Yes', 'No']
                    elif answer.isdigit():
                        q['options'] = ['one', 'two', 'three', 'four']
            return result
        except Exception as e:
            print(f"Listening enrichment failed: {e}")
            return step
    
    async def _enrich_production(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich production (speaking/writing) activity with 3 prompts"""
        
        grammar_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'grammar_focus'), {})
        pattern = grammar_step.get('rule_pattern', '')
        
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_words = [item.get('word') for item in vocab_step.get('items', [])]
        
        prompt = f"""Create a speaking practice activity for young ESL learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

GRAMMAR PATTERN: {pattern}
LESSON TOPIC: {lesson.get('topic')}
VOCABULARY: {', '.join(vocab_words)}

Create 3 different speaking prompts that:
1. Each uses the target grammar pattern or vocabulary
2. Are achievable for beginners
3. Have clear expected responses
4. Progress from easier to slightly harder

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "production",
    "production_type": "speaking",
    "prompt": "Main instruction for speaking practice",
    "expected_text": "expected response for first prompt",
    "prompts": [
        {{"prompt": "Say: [Simple sentence 1]", "expected_text": "expected response 1"}},
        {{"prompt": "Say: [Simple sentence 2]", "expected_text": "expected response 2"}},
        {{"prompt": "Say: [Simple sentence 3]", "expected_text": "expected response 3"}}
    ]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            result = extract_json_from_response(response)
            # Ensure we have at least the prompts array
            if not result.get('prompts') or len(result.get('prompts', [])) < 2:
                # Build prompts from single prompt for backwards compat
                result['prompts'] = [
                    {"prompt": result.get('prompt', 'Say hello'), "expected_text": result.get('expected_text', 'hello')},
                    {"prompt": f"Now say: I like {vocab_words[0] if vocab_words else 'it'}", "expected_text": f"i like {vocab_words[0] if vocab_words else 'it'}"},
                    {"prompt": f"Tell me: {pattern or 'I am happy'}", "expected_text": (pattern or 'i am happy').lower()},
                ]
            return result
        except Exception as e:
            print(f"Production enrichment failed: {e}")
            return step
    
    async def _enrich_exit_ticket(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich exit ticket with 3-5 comprehensive review questions"""
        
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_words = [item.get('word') for item in vocab_step.get('items', [])]
        
        grammar_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'grammar_focus'), {})
        grammar_pattern = grammar_step.get('rule_pattern', unit.get('grammar_focus', []))
        
        prompt = f"""Create an exit quiz for young ESL learners (ages 4-7) that summarizes the ENTIRE lesson.

LESSON CONTENT COVERED:
- Vocabulary: {vocab_words}
- Grammar Pattern: {grammar_pattern}
- Lesson Topic: {lesson.get('topic')}
- Lesson Title: {lesson.get('title')}

IMPORTANT: Create 3-5 questions that test ALL aspects of the lesson:
1. At least 1 vocabulary question
2. At least 1 grammar question  
3. At least 1 reading comprehension question
4. Mix of question types (fill-blank, multiple choice, true/false)

Each question should:
- Be age-appropriate and clear
- Have 3-4 options
- Test real understanding, not just memory

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "exit_ticket",
    "title": "Lesson Review Quiz",
    "questions": [
        {{
            "question_text": "I ___ Ben. (Grammar question)",
            "question_type": "fill_blank",
            "correct_answer": "am",
            "options": ["am", "is", "are", "be"]
        }},
        {{
            "question_text": "Which emoji shows 'teacher'? (Vocabulary question)",
            "question_type": "multiple_choice",
            "correct_answer": "👩‍🏫",
            "options": ["👩‍🏫", "🍎", "👋", "🙋"]
        }},
        {{
            "question_text": "True or False: 'Hello' is a greeting.",
            "question_type": "true_false",
            "correct_answer": "True",
            "options": ["True", "False"]
        }},
        {{
            "question_text": "Another review question...",
            "question_type": "multiple_choice",
            "correct_answer": "correct",
            "options": ["option1", "option2", "option3", "correct"]
        }}
    ]
}}"""

        try:
            response = await chat.send_message(UserMessage(text=prompt))
            return extract_json_from_response(response)
        except Exception as e:
            print(f"Exit ticket enrichment failed: {e}")
            return step


async def enrich_unit_content(unit_file_path: str, output_path: str) -> Dict[str, Any]:
    """
    Enrich an entire unit's content file
    
    Args:
        unit_file_path: Path to the original JSON content file
        output_path: Path to save the enriched content
    
    Returns:
        Enriched unit data
    """
    enricher = AIContentEnricher()
    
    with open(unit_file_path, 'r') as f:
        unit_data = json.load(f)
    
    stage = unit_data.get('stage')
    stage_title = unit_data.get('stage_title')
    
    enriched_units = []
    
    for unit in unit_data.get('units', []):
        unit_context = {
            'title': unit.get('title'),
            'subtitle': unit.get('subtitle'),
            'grammar_focus': unit.get('grammar_focus', []),
            'phonics_focus': unit.get('phonics_focus', [])
        }
        
        enriched_lessons = []
        
        for lesson in unit.get('lessons', []):
            print(f"  Enriching: {lesson.get('title')}...")
            enriched_lesson = await enricher.enrich_lesson(lesson, unit_context)
            enriched_lessons.append(enriched_lesson)
            # Small delay to avoid rate limiting
            await asyncio.sleep(1)
        
        enriched_unit = {
            **unit,
            'lessons': enriched_lessons
        }
        enriched_units.append(enriched_unit)
    
    enriched_data = {
        'stage': stage,
        'stage_title': stage_title,
        'units': enriched_units,
        'ai_enriched': True
    }
    
    # Save enriched content
    with open(output_path, 'w') as f:
        json.dump(enriched_data, f, indent=2, ensure_ascii=False)
    
    print(f"Enriched content saved to: {output_path}")
    return enriched_data


# CLI for running enrichment
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("Usage: python ai_content_enricher.py <input_file> <output_file>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    asyncio.run(enrich_unit_content(input_file, output_file))
