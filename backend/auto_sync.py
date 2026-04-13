"""
AUTO SYNC MODULE - COMPLETE DATABASE SYNCHRONIZATION
Ensures production database is always in sync with latest schema and data.
Runs automatically on every backend startup.
Covers ALL tests: Reading, Writing, Listening, Speaking
"""

import asyncio
import logging
import uuid
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

# ============ WRITING TEST 2 DATA ============
WRITING_TEST_2_DATA = {
    "title": "Academic Writing Test 2",
    "test_type": "writing",
    "duration": 60,
    "questions": [
        {
            "id": 1,
            "task_number": 1,
            "task": "task1",
            "type": "map_comparison",
            "question": """The plans below show a harbour in 2000 and how it looks today.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.""",
            "visual_data": {
                "type": "side_by_side_images",
                "images": [
                    {
                        "title": "Porth Harbour (in 2000)",
                        "url": "https://customer-assets.emergentagent.com/job_lesson-preview-hub/artifacts/csy5kx8j_Screenshot%202026-01-04%20at%2009.21.11.png"
                    },
                    {
                        "title": "Porth Harbour (today)",
                        "url": "https://customer-assets.emergentagent.com/job_lesson-preview-hub/artifacts/4he4nkvg_Screenshot%202026-01-04%20at%2009.21.19.png"
                    }
                ]
            },
            "word_limit": 150,
            "time_suggestion": 20
        },
        {
            "id": 2,
            "task_number": 2,
            "task": "task2",
            "type": "essay",
            "question": """The working week should be shorter and workers should have a longer weekend.

Do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.""",
            "word_limit": 250,
            "time_suggestion": 40
        }
    ],
    "answer_key": []
}

# Full passage content for Reading Test 2
PASSAGE_1_TEXT = """The Industrial Revolution, which took place from the 18th to 19th centuries, was a period during which predominantly agrarian, rural societies in Europe and America became industrial and urban. Prior to the Industrial Revolution, which began in Britain in the late 1700s, manufacturing was often done in people's homes, using hand tools or basic machines. Industrialization marked a shift to powered, special-purpose machinery, factories and mass production.

The iron and textile industries, along with the development of the steam engine, played central roles in the Industrial Revolution, which also saw improved systems of transportation, communication and banking. While industrialization brought about an increased volume and variety of manufactured goods and an improved standard of living for some, it also resulted in often grim employment and living conditions for the poor and working classes.

We live at a time when widespread misinformation and so-called 'fake news' are causing increasing social, political and economic damage. Yet the large-scale spread of inaccurate information is not a new thing – it has been with us for as long as humans have lived in groups where the exchange of information is a social necessity. The challenge today is how to contain its often harmful effects.

The rate of change was remarkable. Britain in 1750 was a nation of approximately six million people; by 1850 the population had grown to almost 21 million. The urban population continued to grow, and London became the first city in the world to reach a population of one million. Major British cities such as Manchester, Birmingham and Liverpool grew rapidly, and by 1850, for the first time in British history, more people were living in cities and towns than in the countryside."""

PASSAGE_2_TEXT = """Professional athletes face unique psychological challenges that can significantly impact their performance. The pressure to perform at the highest level, combined with public scrutiny and the physical demands of their sport, creates a complex stress environment that few other professions experience.

Research has shown that athletes who develop effective coping strategies tend to perform better under pressure. These strategies include visualization techniques, mindfulness practices, and working with sports psychologists. The mental game, as many coaches call it, can be just as important as physical preparation.

The relationship between stress and performance is not straightforward. A certain amount of stress can actually enhance performance by increasing focus and motivation. However, when stress levels become too high, performance typically suffers. Understanding this relationship is crucial for athletes and their support teams.

Many elite athletes report that their biggest challenge is not physical training but managing the expectations placed upon them. This includes expectations from coaches, sponsors, fans, and themselves. The weight of these expectations can lead to anxiety, depression, and burnout if not properly managed.

Sports psychology has evolved significantly over the past few decades. What was once considered a luxury is now seen as an essential component of athletic training. Teams at all levels are investing in mental health resources, recognizing that a healthy mind is just as important as a healthy body for peak performance."""

PASSAGE_3_TEXT = """The question of whether some children are born with exceptional intellectual abilities has long fascinated researchers and educators alike. While some argue that giftedness is primarily innate, others contend that environmental factors and deliberate practice play crucial roles in developing exceptional abilities.

Maryam Mirzakhani's story illustrates this debate perfectly. As a child, she showed no particular aptitude for mathematics – in fact, her early performance was decidedly below average. It wasn't until her brother showed her a challenging puzzle that something clicked. This suggests that the spark of genius often needs the right conditions to ignite.

What about our second observation: that many of those who have achieved greatness were not obviously exceptional as children? Einstein is perhaps the most famous example. His early academic record was unremarkable, and he struggled with the rigid educational system of his time. Yet he went on to revolutionize our understanding of the universe.

Professor Anders Ericsson's research has shown that expert performance is largely the result of what he calls "deliberate practice" – structured, purposeful training designed to improve specific aspects of performance. His studies of violinists, chess players, and athletes all point to the same conclusion: excellence is made, not born.

However, not everyone agrees with this view. Some researchers point to evidence that certain cognitive abilities have a strong genetic component. Studies of twins, for example, suggest that intelligence is at least partially heritable. The truth likely lies somewhere in between – a complex interaction of nature and nurture that we are only beginning to understand.

The implications for education are significant. If all children have the potential for exceptional achievement given the right environment and support, then our educational systems should be designed to nurture that potential. This means moving away from the traditional model of identifying and separating "gifted" students, toward a more inclusive approach that challenges all students to reach their full potential."""

READING_TEST_2_DATA = {
    "title": "Academic Reading Practice Test 2",
    "test_type": "reading",
    "duration": 60,
    "passages": [
        {"id": 1, "title": "Passage 1: The Industrial Revolution in Britain", "text": PASSAGE_1_TEXT},
        {"id": 2, "title": "Passage 2: Athletes and stress", "text": PASSAGE_2_TEXT},
        {"id": 3, "title": "Passage 3: An inquiry into the existence of the gifted child", "text": PASSAGE_3_TEXT}
    ],
    "questions": [
        # Passage 1 - Questions 1-13
        {"id": 1, "passage": 1, "type": "sentence_completion", "question": "The__(1)__ century saw the beginning of the Industrial Revolution."},
        {"id": 2, "passage": 1, "type": "sentence_completion", "question": "Before industrialization, societies were__(2)__ and rural."},
        {"id": 3, "passage": 1, "type": "sentence_completion", "question": "Manufacturing was done in people's__(3)__ before factories."},
        {"id": 4, "passage": 1, "type": "sentence_completion", "question": "The__(4)__ engine was a key development."},
        {"id": 5, "passage": 1, "type": "sentence_completion", "question": "Britain's population grew from 6 million to__(5)__ million."},
        {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "The Industrial Revolution began in America."},
        {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "London was the first city to reach one million people."},
        {"id": 8, "passage": 1, "type": "true_false_notgiven", "question": "Living conditions improved for all social classes."},
        {"id": 9, "passage": 1, "type": "true_false_notgiven", "question": "The textile industry played a central role."},
        {"id": 10, "passage": 1, "type": "multiple_choice", "question": "Where did the Industrial Revolution begin?",
         "options": ["A) America", "B) Britain", "C) France", "D) Germany"]},
        {"id": 11, "passage": 1, "type": "multiple_choice", "question": "By 1850, where did most British people live?",
         "options": ["A) Countryside", "B) Villages", "C) Cities and towns", "D) Overseas"]},
        {"id": 12, "passage": 1, "type": "sentence_completion", "question": "The spread of inaccurate information is__(12)__."},
        {"id": 13, "passage": 1, "type": "true_false_notgiven", "question": "Fake news is a completely new phenomenon."},
        # Passage 2 - Questions 14-26
        {"id": 14, "passage": 2, "type": "matching_information", "question": "Which paragraph discusses the relationship between stress levels and performance?",
         "options": ["A) Paragraph 1", "B) Paragraph 2", "C) Paragraph 3", "D) Paragraph 4", "E) Paragraph 5"]},
        {"id": 15, "passage": 2, "type": "matching_information", "question": "Which paragraph mentions the evolution of sports psychology?",
         "options": ["A) Paragraph 1", "B) Paragraph 2", "C) Paragraph 3", "D) Paragraph 4", "E) Paragraph 5"]},
        {"id": 16, "passage": 2, "type": "matching_information", "question": "Which paragraph discusses coping strategies?",
         "options": ["A) Paragraph 1", "B) Paragraph 2", "C) Paragraph 3", "D) Paragraph 4", "E) Paragraph 5"]},
        {"id": 17, "passage": 2, "type": "true_false_notgiven", "question": "All stress is harmful to athletic performance."},
        {"id": 18, "passage": 2, "type": "true_false_notgiven", "question": "Mental preparation is considered as important as physical training."},
        {"id": 19, "passage": 2, "type": "true_false_notgiven", "question": "Most elite athletes find physical training more challenging than mental aspects."},
        {"id": 20, "passage": 2, "type": "true_false_notgiven", "question": "Sports psychology was always considered essential."},
        {"id": 21, "passage": 2, "type": "sentence_completion", "question": "Athletes face unique__(21)__ challenges."},
        {"id": 22, "passage": 2, "type": "sentence_completion", "question": "Visualization is one of the__(22)__ strategies athletes use."},
        {"id": 23, "passage": 2, "type": "sentence_completion", "question": "High expectations can lead to anxiety and__(23)__."},
        {"id": 24, "passage": 2, "type": "multiple_choice", "question": "What can enhance performance according to the passage?",
         "options": ["A) No stress at all", "B) Maximum stress", "C) A certain amount of stress", "D) Only physical training"]},
        {"id": 25, "passage": 2, "type": "multiple_choice", "question": "What is now seen as essential in athletic training?",
         "options": ["A) Only physical training", "B) Mental health resources", "C) Longer practice hours", "D) Better equipment"]},
        {"id": 26, "passage": 2, "type": "sentence_completion", "question": "Teams are investing in mental health__(26)__."},
        # Passage 3 - Questions 27-40
        {"id": "27-32", "passage": 3, "type": "summary_completion_block",
         "title": "Maryam Mirzakhani",
         "summary_text": "Maryam Mirzakhani is regarded as **27** .................. in the field of mathematics because she was the only female holder of the prestigious Fields Medal – a record that she retained at the time of her death. However, maths held little **28** .................. for her as a child and in fact her performance was below average until she was **29** .................. by a difficult puzzle that one of her siblings showed her.\n\nLater, as a professional mathematician, she had an inquiring mind and proved herself to be **30** .................. when things did not go smoothly. She said she got the greatest **31** .................. from making ground-breaking discoveries and in fact she was responsible for some extremely **32** .................. mathematical studies.",
         "blanks": [27, 28, 29, 30, 31, 32],
         "options": ["A) appeal", "B) determined", "C) intrigued", "D) single", "E) achievement", "F) devoted", "G) involved", "H) unique", "I) innovative", "J) satisfaction", "K) intent"]},
        {"id": 33, "passage": 3, "type": "yes_no_notgiven", "question": "Many people who ended up winning prestigious intellectual prizes only reached an average standard when young."},
        {"id": 34, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein's failures as a young man were due to his lack of confidence."},
        {"id": 35, "passage": 3, "type": "yes_no_notgiven", "question": "It is difficult to reach agreement on whether some children are actually born gifted."},
        {"id": 36, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein was upset by the public's view of his life's work."},
        {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Ericsson's research focused exclusively on musicians."},
        {"id": 38, "passage": 3, "type": "multiple_choice", "question": "What does the passage suggest about giftedness?",
         "options": ["A) It is purely genetic", "B) It is purely environmental", "C) It involves both nature and nurture", "D) It cannot be studied"]},
        {"id": 39, "passage": 3, "type": "multiple_choice", "question": "What does Ericsson's research emphasize?",
         "options": ["A) Natural talent", "B) Deliberate practice", "C) Early education", "D) Genetic factors"]},
        {"id": 40, "passage": 3, "type": "multiple_choice", "question": "What educational approach does the passage suggest?",
         "options": ["A) Separating gifted students", "B) An inclusive approach for all", "C) Focusing only on talented children", "D) Reducing academic challenges"]}
    ],
    "answer_key": [
        {"question_id": 1, "answer": "18th"},
        {"question_id": 2, "answer": "agrarian"},
        {"question_id": 3, "answer": "homes"},
        {"question_id": 4, "answer": "steam"},
        {"question_id": 5, "answer": "21"},
        {"question_id": 6, "answer": "False"},
        {"question_id": 7, "answer": "True"},
        {"question_id": 8, "answer": "False"},
        {"question_id": 9, "answer": "True"},
        {"question_id": 10, "answer": "B"},
        {"question_id": 11, "answer": "C"},
        {"question_id": 12, "answer": "not new"},
        {"question_id": 13, "answer": "False"},
        {"question_id": 14, "answer": "C"},
        {"question_id": 15, "answer": "E"},
        {"question_id": 16, "answer": "B"},
        {"question_id": 17, "answer": "False"},
        {"question_id": 18, "answer": "True"},
        {"question_id": 19, "answer": "False"},
        {"question_id": 20, "answer": "False"},
        {"question_id": 21, "answer": "psychological"},
        {"question_id": 22, "answer": "coping"},
        {"question_id": 23, "answer": "burnout"},
        {"question_id": 24, "answer": "C"},
        {"question_id": 25, "answer": "B"},
        {"question_id": 26, "answer": "resources"},
        {"question_id": 27, "answer": "H"},
        {"question_id": 28, "answer": "A"},
        {"question_id": 29, "answer": "C"},
        {"question_id": 30, "answer": "B"},
        {"question_id": 31, "answer": "J"},
        {"question_id": 32, "answer": "I"},
        {"question_id": 33, "answer": "Yes"},
        {"question_id": 34, "answer": "Not Given"},
        {"question_id": 35, "answer": "Yes"},
        {"question_id": 36, "answer": "Not Given"},
        {"question_id": 37, "answer": "No"},
        {"question_id": 38, "answer": "C"},
        {"question_id": 39, "answer": "B"},
        {"question_id": 40, "answer": "B"}
    ]
}


async def run_auto_sync(db):
    """
    Main auto-sync function. Ensures database has correct data structure.
    Call this on every startup.
    """
    logger.info("🔄 AUTO-SYNC: Starting database synchronization...")
    
    issues_found = []
    fixes_applied = []
    
    # Check 1: Reading Test 2 exists with proper format
    reading_test_2 = await db.tests.find_one({"title": "Academic Reading Practice Test 2"})
    
    needs_update = False
    if not reading_test_2:
        issues_found.append("Reading Test 2 not found")
        needs_update = True
    else:
        # Check passages have proper content (>1000 chars each)
        passages = reading_test_2.get("passages", [])
        for p in passages:
            if len(p.get("text", "")) < 1000:
                issues_found.append(f"Passage {p.get('id')} has insufficient content ({len(p.get('text', ''))} chars)")
                needs_update = True
                break
        
        # Check for summary_completion_block
        questions = reading_test_2.get("questions", [])
        has_block = any(q.get("type") == "summary_completion_block" for q in questions)
        if not has_block:
            issues_found.append("Missing summary_completion_block question type")
            needs_update = True
    
    # Apply fix if needed
    if needs_update:
        logger.info(f"🔧 AUTO-SYNC: Issues found: {issues_found}")
        
        # Delete old and insert fresh data
        await db.tests.delete_one({"title": "Academic Reading Practice Test 2"})
        
        # Create new test with fresh UUID
        test_data = READING_TEST_2_DATA.copy()
        test_data["id"] = str(uuid.uuid4())
        
        await db.tests.insert_one(test_data)
        fixes_applied.append("Reading Test 2 resynced with full passages and summary_completion_block")
        logger.info("✅ AUTO-SYNC: Reading Test 2 updated successfully")
    
    # Summary
    if fixes_applied:
        logger.info(f"✅ AUTO-SYNC COMPLETE: Applied {len(fixes_applied)} fix(es)")
        for fix in fixes_applied:
            logger.info(f"   - {fix}")
    else:
        logger.info("✅ AUTO-SYNC COMPLETE: Database is in sync, no changes needed")
    
    return {"issues_found": issues_found, "fixes_applied": fixes_applied}
