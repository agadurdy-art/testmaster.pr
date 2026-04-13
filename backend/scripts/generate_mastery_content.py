#!/usr/bin/env python3
"""
Mastery Course Content Generator
Generates complete IELTS-style content for all 17 modules using GPT-5.1
"""

import asyncio
import os
import json
import sys
from dotenv import load_dotenv

load_dotenv()

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from motor.motor_asyncio import AsyncIOMotorClient
from emergentintegrations.llm.chat import LlmChat, UserMessage

# Configuration
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')
API_KEY = os.environ.get('EMERGENT_LLM_KEY')

# IELTS Content Generation System Prompt
SYSTEM_PROMPT = """You are an expert IELTS instructor and content creator with 15+ years of experience. 
You create high-quality, exam-focused content for Band 4.5-6.5 learners.

Your content must:
1. Be authentic and match real IELTS exam style
2. Use appropriate vocabulary for the target band
3. Include practical examples and tips
4. Follow Cambridge IELTS standards

Always respond with valid JSON only, no markdown formatting."""

async def generate_content_for_module(module_title: str, existing_vocabulary: dict) -> dict:
    """Generate complete content for a module using GPT-5.1"""
    
    chat = LlmChat(
        api_key=API_KEY,
        session_id=f"mastery-content-{module_title.lower().replace(' ', '-')}",
        system_message=SYSTEM_PROMPT
    ).with_model("openai", "gpt-5.1")
    
    # Extract vocab words for context
    vocab_words = []
    if existing_vocabulary:
        for category in ['nouns', 'verbs', 'adjectives', 'adverbs']:
            if category in existing_vocabulary:
                vocab_words.extend([item['word'] for item in existing_vocabulary[category][:3]])
    
    prompt = f"""Generate complete IELTS learning content for the topic: "{module_title}"

Use these vocabulary words naturally in the content: {', '.join(vocab_words) if vocab_words else 'topic-related vocabulary'}

Generate JSON with this EXACT structure:
{{
    "reading": {{
        "title": "A descriptive title for the passage",
        "passage": "An academic passage of 350-400 words about {module_title}. Write in formal academic style suitable for IELTS. Include statistics, examples, and multiple perspectives.",
        "questions": [
            {{
                "id": 1,
                "type": "true_false_ng",
                "question": "Statement about the passage",
                "answer": "TRUE/FALSE/NOT GIVEN",
                "explanation": "Brief explanation"
            }},
            {{
                "id": 2,
                "type": "multiple_choice",
                "question": "Question about the passage?",
                "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
                "answer": "B",
                "explanation": "Why B is correct"
            }},
            {{
                "id": 3,
                "type": "fill_blank",
                "question": "Complete the sentence: The main advantage of ___ is...",
                "answer": "correct word",
                "explanation": "Found in paragraph X"
            }}
        ]
    }},
    "writing": {{
        "task_type": "Task 2 Essay",
        "question": "A thought-provoking IELTS Writing Task 2 question about {module_title}. Use 'Some people think... Others believe...' or 'To what extent do you agree or disagree?' format.",
        "tips": [
            "Specific tip 1 for this topic",
            "Specific tip 2 for structure",
            "Specific tip 3 for vocabulary"
        ],
        "model_essay": "A well-structured Band 6.5 model essay (250-280 words) with clear introduction, 2 body paragraphs, and conclusion.",
        "useful_phrases": [
            "Topic-specific phrase 1",
            "Topic-specific phrase 2",
            "Topic-specific phrase 3"
        ]
    }},
    "speaking": {{
        "part2": {{
            "cue_card": "Describe [something related to {module_title}].\\n\\nYou should say:\\n- what it is\\n- when/where it happened\\n- why it is important\\n\\nand explain how you feel about it.",
            "follow_up_questions": [
                "Follow-up question 1?",
                "Follow-up question 2?"
            ],
            "model_answer": "A 2-minute model response with good vocabulary and structure.",
            "tips": ["Tip 1", "Tip 2"]
        }},
        "part3": {{
            "questions": [
                {{
                    "question": "Discussion question 1 about {module_title}?",
                    "model_answer": "Thoughtful response with examples"
                }},
                {{
                    "question": "Discussion question 2 - deeper analysis?",
                    "model_answer": "Response showing critical thinking"
                }},
                {{
                    "question": "Discussion question 3 - future/society perspective?",
                    "model_answer": "Response with broader perspective"
                }}
            ]
        }}
    }},
    "quiz": {{
        "questions": [
            {{
                "id": 1,
                "question": "Vocabulary question?",
                "options": ["A) option", "B) option", "C) option", "D) option"],
                "correct": "B",
                "explanation": "Why B is correct"
            }}
        ]
    }}
}}

Generate exactly 12 reading questions (mix of types), 10 quiz questions covering vocabulary and grammar.
Make all content specific to {module_title} and appropriate for Band 4.5-6.5 learners.
Return ONLY valid JSON, no other text."""

    try:
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Clean response - remove markdown if present
        clean_response = response.strip()
        if clean_response.startswith('```'):
            clean_response = clean_response.split('\n', 1)[1]
        if clean_response.endswith('```'):
            clean_response = clean_response.rsplit('```', 1)[0]
        if clean_response.startswith('json'):
            clean_response = clean_response[4:].strip()
            
        content = json.loads(clean_response)
        return content
    except json.JSONDecodeError as e:
        print(f"  JSON parse error for {module_title}: {e}")
        print(f"  Response preview: {response[:500] if response else 'No response'}...")
        return None
    except Exception as e:
        print(f"  Error generating content for {module_title}: {e}")
        return None


async def update_module_content(db, module_id: str, content: dict, module_title: str):
    """Update a module with generated content"""
    
    update_data = {
        "reading": content.get("reading", {}),
        "writing": content.get("writing", {}),
        "speaking": content.get("speaking", {}),
        "quiz": content.get("quiz", {}),
        "content_complete": True
    }
    
    result = await db.mastery_course_modules.update_one(
        {"id": module_id},
        {"$set": update_data}
    )
    
    return result.modified_count > 0


async def main():
    print("=" * 60)
    print("MASTERY COURSE CONTENT GENERATOR")
    print("=" * 60)
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Get all modules
    modules = await db.mastery_course_modules.find({}, {"_id": 0}).to_list(100)
    modules = sorted(modules, key=lambda x: x.get('module_number', 0))
    
    print(f"\nFound {len(modules)} modules to process\n")
    
    success_count = 0
    failed_modules = []
    
    for i, module in enumerate(modules):
        module_id = module.get('id')
        module_title = module.get('title')
        existing_vocab = module.get('vocabulary', {})
        
        print(f"[{i+1}/{len(modules)}] Processing: {module_title}")
        
        # Check if already has content
        if module.get('content_complete'):
            print(f"  ✓ Already complete, skipping")
            success_count += 1
            continue
        
        # Generate content
        print(f"  → Generating content with GPT-5.1...")
        content = await generate_content_for_module(module_title, existing_vocab)
        
        if content:
            # Validate content structure
            if all(key in content for key in ['reading', 'writing', 'speaking', 'quiz']):
                # Update database
                updated = await update_module_content(db, module_id, content, module_title)
                if updated:
                    print(f"  ✓ Content saved successfully")
                    success_count += 1
                else:
                    print(f"  ✗ Failed to save to database")
                    failed_modules.append(module_title)
            else:
                print(f"  ✗ Incomplete content structure")
                failed_modules.append(module_title)
        else:
            print(f"  ✗ Content generation failed")
            failed_modules.append(module_title)
        
        # Small delay to avoid rate limiting
        await asyncio.sleep(1)
    
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total modules: {len(modules)}")
    print(f"Successfully completed: {success_count}")
    print(f"Failed: {len(failed_modules)}")
    
    if failed_modules:
        print(f"\nFailed modules: {', '.join(failed_modules)}")
    
    print("\nDone!")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
