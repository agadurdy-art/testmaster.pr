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
        ).with_model("anthropic", "claude-sonnet-4-6")
    
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
- Context: {lesson.get('context', '')}
- Grammar Focus: {unit.get('grammar_focus', [])}

For each word, create:
1. A child-friendly definition (max 8 words, simple vocabulary)
2. A natural example sentence using the word in context (related to lesson topic)
3. An appropriate emoji that VISUALLY REPRESENTS the word's meaning
4. IPA pronunciation

EMOJI SELECTION RULES:
- Choose emojis that a child would immediately associate with the word
- For adjectives: show the QUALITY (old=👴 not 📚, new=✨, big=🐘, small=🐜)
- For verbs: show the ACTION (run=🏃, eat=🍽️, listen=👂)
- For concrete nouns: show the OBJECT (book=📖, cat=🐱, house=🏠)
- For abstract concepts: use the closest visual (name=📛, hello=👋, answer=✋)
- NEVER use 📝 as a generic fallback

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "vocabulary",
    "items": [
        {{
            "word": "word1",
            "ipa": "/phonetic/",
            "definition": "simple child-friendly definition",
            "example": "Natural example sentence related to lesson context.",
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
        """Generate vocab games with rotation per lesson number"""
        
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_items = vocab_step.get('items', [])
        vocab_words = [item.get('word') for item in vocab_items]
        lesson_num = lesson.get('number', lesson.get('lesson_number', 1))
        
        # Rotate game types per lesson
        game_sets = {
            1: ['listen_choose_picture', 'read_choose_picture', 'unscramble', 'flashcard_match'],
            2: ['listen_write', 'look_write', 'fill_gap'],
            3: ['memory_game', 'listen_choose_word', 'read_choose_picture'],
            4: ['crossword', 'word_search', 'board_game'],
        }
        
        selected_games = game_sets.get(lesson_num, game_sets[1])
        
        # For review lessons (4), use different data format
        if lesson_num == 4:
            prompt = f"""Create REVIEW games for young ESL learners. These are consolidation games for a unit review lesson.

VOCABULARY WORDS: {json.dumps([{'word': v.get('word'), 'emoji': v.get('image_emoji', '?'), 'definition': v.get('definition', '')} for v in vocab_items], ensure_ascii=False)}

Create 3 review game activities using ALL vocabulary from the unit.

GAME TYPES:
1. crossword: Items with word, definition (clue), and emoji. 6-8 words.
2. word_search: Items with word, definition, and emoji. 6-8 words.
3. board_game: Multiple choice questions about the vocabulary. 6-8 questions with 4 options each.

Respond with ONLY valid JSON:
{{
    "type": "vocab_games",
    "games": [
        {{
            "game_type": "crossword",
            "items": [{{"word": "hello", "definition": "A greeting", "emoji": "👋"}}, ...]
        }},
        {{
            "game_type": "word_search",
            "items": [{{"word": "hello", "definition": "A greeting", "emoji": "👋"}}, ...]
        }},
        {{
            "game_type": "board_game",
            "items": [{{"question": "What does 'hello' mean?", "answer": "A greeting", "options": ["A greeting", "A color", "A number", "A food"]}}, ...]
        }}
    ]
}}"""
        else:
            game_instructions = {
                'listen_choose_picture': 'listen_choose_picture: Student hears word, selects correct emoji. Items: {word, emoji, distractors: [{word, emoji}, {word, emoji}, {word, emoji}]}',
                'read_choose_picture': 'read_choose_picture: Student reads word, selects correct emoji. Items: {word, emoji, distractors: [{word, emoji}, {word, emoji}, {word, emoji}]}',
                'unscramble': 'unscramble: Student arranges scrambled letters. Items: {word, emoji}',
                'flashcard_match': 'flashcard_match: Match word to emoji/definition. Items: {word, emoji, definition}',
                'listen_write': 'listen_write: Student hears and types word. Items: {word, emoji}',
                'look_write': 'look_write: Student sees emoji, types word. Items: {word, emoji, hint}',
                'fill_gap': 'fill_gap: Complete sentence with correct word. Items: {sentence (with ___), answer, options: [4 choices], emoji}',
                'memory_game': 'memory_game: Match word-emoji pairs. Items: {word, emoji}',
                'listen_choose_word': 'listen_choose_word: Student hears word, picks correct spelling. Items: {word, emoji, distractors: ["wrong1", "wrong2", "wrong3"]}',
            }
            
            game_desc = "\n".join([f"{i+1}. {game_instructions.get(g, g)}" for i, g in enumerate(selected_games)])
            
            prompt = f"""Create vocabulary games for young ESL learners (ages 4-7).

VOCABULARY: {json.dumps([{'word': v.get('word'), 'emoji': v.get('image_emoji', '?')} for v in vocab_items], ensure_ascii=False)}

Create {len(selected_games)} game activities. Each game MUST have 4-8 items.

GAME TYPES TO CREATE:
{game_desc}

IMPORTANT RULES:
- Use ONLY the vocabulary words provided
- Each game has 4-8 items
- For distractor emojis, use common objects NOT in the vocabulary list
- Distractors must be plausible but clearly different from the correct answer

Respond with ONLY valid JSON:
{{
    "type": "vocab_games",
    "games": [
        {{"game_type": "{selected_games[0]}", "items": [...]}},
        {{"game_type": "{selected_games[1]}", "items": [...]}},
        {{"game_type": "{selected_games[2] if len(selected_games) > 2 else selected_games[0]}", "items": [...]}}
    ]
}}"""
        
        try:
            response = await chat.send_message(UserMessage(text=prompt))
            result = extract_json_from_response(response)
            # Ensure step number
            result['step'] = step.get('step')
            return result
        except Exception as e:
            print(f"Vocab game enrichment failed: {e}")
            return step
    
    async def _enrich_reading(
        self, chat: LlmChat, step: Dict, lesson: Dict, unit: Dict
    ) -> Dict[str, Any]:
        """Enrich reading passage and comprehension questions"""
        
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_words = [item.get('word') for item in vocab_step.get('items', [])]
        grammar_pattern = unit.get('grammar_focus', [])
        
        prompt = f"""Create a Cambridge Starters exam-style reading activity for young ESL learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

VOCABULARY TO INCLUDE: {vocab_words}
GRAMMAR PATTERNS: {grammar_pattern}
LESSON TOPIC: {lesson.get('topic')}
LESSON CONTEXT: {lesson.get('context', '')}

CAMBRIDGE STARTERS READING FORMAT:
- Short story or description (4-6 simple sentences, max 40 words)
- Story must use the EXACT vocabulary words naturally
- Story must be realistic and relatable to children's daily life
- 2-3 comprehension questions in these styles:
  * "Read and choose" (multiple choice)
  * "Yes or No" (true/false about the passage)
  * "Who/What/Where" (direct comprehension)
- Each question must have 3-4 clear options
- Questions should test READING COMPREHENSION, not trivia

EMOJI/VISUAL NOTES:
- Include an appropriate scene description for a stock photo search (e.g., "children playing in classroom")

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "micro_reading",
    "title": "Story Title",
    "text": "Short engaging story using vocabulary and grammar patterns. 4-6 sentences.",
    "scene_description": "Description for finding a matching stock photo",
    "questions": [
        {{
            "question": "Clear comprehension question about the story",
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
        """Generate 5 grammar game types with 4-8 items each, diverse error types"""
        
        grammar_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'grammar_focus'), {})
        pattern = grammar_step.get('rule_pattern', step.get('rule_pattern', ''))
        examples = grammar_step.get('examples', [])
        vocab_step = next((s for s in lesson.get('steps', []) if s.get('type') == 'vocabulary'), {})
        vocab_words = [item.get('word') for item in vocab_step.get('items', [])]
        
        prompt = f"""Create 5 grammar game activities for young ESL learners (ages 4-7).

GRAMMAR PATTERN: {pattern}
EXAMPLES: {examples}
VOCABULARY CONTEXT: {vocab_words}
LESSON TOPIC: {lesson.get('topic')}

Create 5 DIFFERENT game types. Each game MUST have 4-8 items.

GAME TYPES:

1. word_order (4-6 items): Arrange scrambled words to make correct sentences.
   Format: {{"words": ["She", "is", "happy"], "correctSentence": "She is happy"}}

2. fill_blank (4-6 items): Choose correct word to complete sentence. 4 options.
   Format: {{"sentence": "She ___ happy.", "answer": "is", "options": ["am", "is", "are", "be"]}}

3. error_hunter (4-6 items): Find the grammar mistake in the sentence.
   CRITICAL: Use DIVERSE error types - NOT just is/are. Mix these error categories:
   - Subject-verb agreement (he go → he goes)
   - Pronoun errors (Him is happy → He is happy)  
   - Article errors (I have cat → I have a cat)
   - Preposition errors (The book is to the table → on the table)
   - Verb form errors (She can swims → She can swim)
   - Plural errors (two dog → two dogs)
   Format: {{"sentence": "Him is happy.", "errorWord": "Him", "correctWord": "He", "explanation": "Use 'He' as subject pronoun"}}

4. true_false (4-6 items): Is this sentence grammatically correct?
   Mix of correct AND incorrect sentences. About 50/50 split.
   Format: {{"sentence": "She are happy.", "is_correct": false, "corrected": "She is happy.", "explanation": "Use 'is' with she"}}

5. multiple_choice_grammar (4-6 items): Choose the right word. 4 options.
   Format: {{"question": "She ___ to school every day.", "answer": "goes", "options": ["go", "goes", "going", "gone"], "explanation": "Use 'goes' with she/he/it"}}

RULES:
- All sentences must be age-appropriate and use simple vocabulary
- Sentences should relate to the lesson topic when possible
- Error Hunter: use AT LEAST 3 different error categories across the items
- True/False: include both correct AND incorrect sentences

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "grammar_games",
    "games": [
        {{"game_type": "word_order", "items": [...]}},
        {{"game_type": "fill_blank", "items": [...]}},
        {{"game_type": "error_hunter", "items": [...]}},
        {{"game_type": "true_false", "items": [...]}},
        {{"game_type": "multiple_choice_grammar", "items": [...]}}
    ]
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
        
        prompt = f"""Create a Cambridge Starters exam-style listening activity for young ESL learners (ages 4-7).

ORIGINAL CONTENT:
{json.dumps(step, indent=2)}

VOCABULARY: {vocab_words}
GRAMMAR PATTERNS: {grammar_pattern}
LESSON TOPIC: {lesson.get('topic')}
LESSON CONTEXT: {lesson.get('context', '')}

CAMBRIDGE STARTERS LISTENING FORMAT:
- Create a natural classroom dialogue or narration (3-4 short sentences)
- The audio text should be something a REAL teacher would say to children
- Use vocabulary words naturally in context
- Questions must DIRECTLY relate to information in the audio

QUESTION RULES:
- 2-3 comprehension questions
- Each question has 3-4 LOGICAL options
- If asking "How many?" → options are NUMBERS
- If asking "What color?" → options are COLORS
- If asking "Who?" → options are NAMES/PEOPLE
- Options should be the same TYPE (all numbers, all names, etc.)

Respond with ONLY valid JSON:
{{
    "step": {step.get('step')},
    "type": "listening",
    "audio_text": "Natural classroom dialogue or teacher narration using vocabulary.",
    "questions": [
        {{
            "question": "Comprehension question about the audio",
            "answer": "correct answer",
            "options": ["option1", "option2", "option3"]
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
