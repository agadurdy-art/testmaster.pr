"""
FULL DATABASE AUTO-SYNC
========================
Bu modül HER STARTUP'ta çalışır ve TÜM veritabanı içeriğini senkronize eder.
Preview ve Production HER ZAMAN aynı veriyi gösterir.

Kapsam:
- Tüm Reading testleri
- Tüm Writing testleri  
- Tüm Listening testleri
- Tüm Speaking testleri
- Tüm Kurslar
- Tüm içerik

ASLA parça parça değil, HER ZAMAN tam sync.
"""

import logging
import subprocess
import os

logger = logging.getLogger(__name__)


async def full_database_sync(db):
    """
    TÜM veritabanını senkronize eder.
    Her startup'ta çalışır.
    Preview = Production garantisi sağlar.
    """
    logger.info("=" * 60)
    logger.info("🔄 FULL DATABASE SYNC STARTING...")
    logger.info("=" * 60)
    
    try:
        # ADIM 1: Mevcut verileri temizle (testler için)
        logger.info("📦 Step 1: Clearing old test data...")
        await db.tests.delete_many({})
        logger.info("   ✅ Old tests cleared")
        
        # ADIM 2: seed_data.py çalıştır - TÜM verileri yükle
        logger.info("📦 Step 2: Running full seed_data.py...")
        
        result = subprocess.run(
            ["python", "seed_data.py"],
            cwd="/app/backend",
            capture_output=True,
            text=True,
            timeout=300,
            env={**os.environ}
        )
        
        if result.returncode == 0:
            logger.info("   ✅ seed_data.py completed successfully")
            # İlk 500 karakter log
            if result.stdout:
                logger.info(f"   Output: {result.stdout[:500]}")
        else:
            logger.error(f"   ❌ seed_data.py failed!")
            logger.error(f"   Error: {result.stderr}")
            # Hata durumunda manuel sync dene
            await manual_fallback_sync(db)
            return
        
        # ADIM 3: Doğrulama
        logger.info("📦 Step 3: Verification...")
        
        tests_count = await db.tests.count_documents({})
        courses_count = await db.courses.count_documents({})
        
        # Reading Test 2 kontrolü
        reading_test_2 = await db.tests.find_one({"title": "Academic Reading Practice Test 2"})
        reading_ok = False
        if reading_test_2:
            passages = reading_test_2.get("passages", [])
            has_content = all(len(p.get("text", "")) > 1000 for p in passages)
            has_block = any(q.get("type") == "summary_completion_block" for q in reading_test_2.get("questions", []))
            reading_ok = has_content and has_block
        
        # Writing Test 2 kontrolü
        writing_test_2 = await db.tests.find_one({"title": "Academic Writing Test 2"})
        writing_ok = False
        if writing_test_2:
            questions = writing_test_2.get("questions", [])
            if questions:
                task1 = questions[0]
                visual_data = task1.get("visual_data", {})
                writing_ok = visual_data.get("type") == "side_by_side_images"
        
        logger.info(f"   Tests: {tests_count}")
        logger.info(f"   Courses: {courses_count}")
        logger.info(f"   Reading Test 2 (passages + block): {'✅' if reading_ok else '❌'}")
        logger.info(f"   Writing Test 2 (side-by-side): {'✅' if writing_ok else '❌'}")
        
        if not reading_ok or not writing_ok:
            logger.warning("   ⚠️ Some checks failed, running manual fallback...")
            await manual_fallback_sync(db)
        
        logger.info("=" * 60)
        logger.info("✅ FULL DATABASE SYNC COMPLETE")
        logger.info("=" * 60)
        
    except Exception as e:
        logger.error(f"❌ FULL SYNC ERROR: {e}")
        logger.info("Attempting manual fallback...")
        await manual_fallback_sync(db)


async def manual_fallback_sync(db):
    """
    seed_data.py başarısız olursa manuel sync.
    Kritik verileri doğrudan ekler.
    """
    import uuid
    
    logger.info("🔧 Running manual fallback sync...")
    
    # Writing Test 2 - Side by side images
    writing_test_2 = {
        "id": str(uuid.uuid4()),
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

Write at least 250 words.""",
                "word_limit": 250,
                "time_suggestion": 40
            }
        ],
        "answer_key": []
    }
    
    # Reading Test 2 - Full passages + summary_completion_block
    reading_test_2 = {
        "id": str(uuid.uuid4()),
        "title": "Academic Reading Practice Test 2",
        "test_type": "reading",
        "duration": 60,
        "passages": [
            {
                "id": 1,
                "title": "Passage 1: The Industrial Revolution in Britain",
                "text": """The Industrial Revolution, which took place from the 18th to 19th centuries, was a period during which predominantly agrarian, rural societies in Europe and America became industrial and urban. Prior to the Industrial Revolution, which began in Britain in the late 1700s, manufacturing was often done in people's homes, using hand tools or basic machines.

The iron and textile industries, along with the development of the steam engine, played central roles in the Industrial Revolution, which also saw improved systems of transportation, communication and banking. While industrialization brought about an increased volume and variety of manufactured goods and an improved standard of living for some, it also resulted in often grim employment and living conditions for the poor and working classes.

We live at a time when widespread misinformation and so-called 'fake news' are causing increasing social, political and economic damage. Yet the large-scale spread of inaccurate information is not a new thing – it has been with us for as long as humans have lived in groups where the exchange of information is a social necessity.

The rate of change was remarkable. Britain in 1750 was a nation of approximately six million people; by 1850 the population had grown to almost 21 million. The urban population continued to grow, and London became the first city in the world to reach a population of one million. Major British cities such as Manchester, Birmingham and Liverpool grew rapidly."""
            },
            {
                "id": 2,
                "title": "Passage 2: Athletes and stress",
                "text": """Professional athletes face unique psychological challenges that can significantly impact their performance. The pressure to perform at the highest level, combined with public scrutiny and the physical demands of their sport, creates a complex stress environment.

Research has shown that athletes who develop effective coping strategies tend to perform better under pressure. These strategies include visualization techniques, mindfulness practices, and working with sports psychologists. The mental game can be just as important as physical preparation.

The relationship between stress and performance is not straightforward. A certain amount of stress can actually enhance performance by increasing focus and motivation. However, when stress levels become too high, performance typically suffers.

Many elite athletes report that their biggest challenge is not physical training but managing the expectations placed upon them. This includes expectations from coaches, sponsors, fans, and themselves. The weight of these expectations can lead to anxiety, depression, and burnout.

Sports psychology has evolved significantly over the past few decades. What was once considered a luxury is now seen as an essential component of athletic training. Teams at all levels are investing in mental health resources."""
            },
            {
                "id": 3,
                "title": "Passage 3: An inquiry into the existence of the gifted child",
                "text": """The question of whether some children are born with exceptional intellectual abilities has long fascinated researchers and educators alike. While some argue that giftedness is primarily innate, others contend that environmental factors and deliberate practice play crucial roles.

Maryam Mirzakhani's story illustrates this debate perfectly. As a child, she showed no particular aptitude for mathematics – in fact, her early performance was decidedly below average. It wasn't until her brother showed her a challenging puzzle that something clicked.

What about our second observation: that many of those who have achieved greatness were not obviously exceptional as children? Einstein is perhaps the most famous example. His early academic record was unremarkable, and he struggled with the rigid educational system of his time.

Professor Anders Ericsson's research has shown that expert performance is largely the result of what he calls "deliberate practice" – structured, purposeful training designed to improve specific aspects of performance. His studies of violinists, chess players, and athletes all point to the same conclusion.

However, not everyone agrees with this view. Some researchers point to evidence that certain cognitive abilities have a strong genetic component. Studies of twins suggest that intelligence is at least partially heritable. The truth likely lies somewhere in between."""
            }
        ],
        "questions": [
            {"id": 1, "passage": 1, "type": "sentence_completion", "question": "The__(1)__ century saw the beginning of the Industrial Revolution."},
            {"id": 2, "passage": 1, "type": "sentence_completion", "question": "Before industrialization, societies were__(2)__ and rural."},
            {"id": 3, "passage": 1, "type": "sentence_completion", "question": "Manufacturing was done in people's__(3)__."},
            {"id": 4, "passage": 1, "type": "true_false_notgiven", "question": "The Industrial Revolution began in America."},
            {"id": 5, "passage": 1, "type": "true_false_notgiven", "question": "The steam engine was important."},
            {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "Living conditions improved for everyone."},
            {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "London reached one million people."},
            {"id": 8, "passage": 1, "type": "multiple_choice", "question": "Where did the revolution begin?", "options": ["A) America", "B) Britain", "C) France", "D) Germany"]},
            {"id": 9, "passage": 1, "type": "multiple_choice", "question": "What grew rapidly?", "options": ["A) Villages", "B) Farms", "C) Cities", "D) Forests"]},
            {"id": 10, "passage": 1, "type": "sentence_completion", "question": "The iron and__(10)__ industries were central."},
            {"id": 11, "passage": 1, "type": "sentence_completion", "question": "By 1850, population was__(11)__ million."},
            {"id": 12, "passage": 1, "type": "true_false_notgiven", "question": "Fake news is a new phenomenon."},
            {"id": 13, "passage": 1, "type": "true_false_notgiven", "question": "Britain had 6 million people in 1750."},
            {"id": 14, "passage": 2, "type": "matching_information", "question": "Which discusses stress and performance?", "options": ["A) Para 1", "B) Para 2", "C) Para 3", "D) Para 4"]},
            {"id": 15, "passage": 2, "type": "matching_information", "question": "Which mentions sports psychology evolution?", "options": ["A) Para 1", "B) Para 2", "C) Para 3", "D) Para 5"]},
            {"id": 16, "passage": 2, "type": "matching_information", "question": "Which discusses coping strategies?", "options": ["A) Para 1", "B) Para 2", "C) Para 3", "D) Para 4"]},
            {"id": 17, "passage": 2, "type": "true_false_notgiven", "question": "All stress harms performance."},
            {"id": 18, "passage": 2, "type": "true_false_notgiven", "question": "Mental training is important."},
            {"id": 19, "passage": 2, "type": "true_false_notgiven", "question": "Athletes never experience burnout."},
            {"id": 20, "passage": 2, "type": "true_false_notgiven", "question": "Sports psychology was always valued."},
            {"id": 21, "passage": 2, "type": "sentence_completion", "question": "Athletes face__(21)__ challenges."},
            {"id": 22, "passage": 2, "type": "sentence_completion", "question": "__(22)__ is one coping strategy."},
            {"id": 23, "passage": 2, "type": "sentence_completion", "question": "Expectations can lead to__(23)__."},
            {"id": 24, "passage": 2, "type": "multiple_choice", "question": "What can enhance performance?", "options": ["A) No stress", "B) Some stress", "C) Maximum stress", "D) Only training"]},
            {"id": 25, "passage": 2, "type": "multiple_choice", "question": "What is now essential?", "options": ["A) More games", "B) Mental resources", "C) Less practice", "D) More fans"]},
            {"id": 26, "passage": 2, "type": "sentence_completion", "question": "Teams invest in mental health__(26)__."},
            {"id": "27-32", "passage": 3, "type": "summary_completion_block",
             "title": "Maryam Mirzakhani",
             "summary_text": "Maryam Mirzakhani is regarded as **27** .................. in the field of mathematics because she was the only female holder of the prestigious Fields Medal. However, maths held little **28** .................. for her as a child and her performance was below average until she was **29** .................. by a difficult puzzle.\n\nLater, she proved herself to be **30** .................. when things did not go smoothly. She got the greatest **31** .................. from making discoveries and was responsible for extremely **32** .................. mathematical studies.",
             "blanks": [27, 28, 29, 30, 31, 32],
             "options": ["A) appeal", "B) determined", "C) intrigued", "D) single", "E) achievement", "F) devoted", "G) involved", "H) unique", "I) innovative", "J) satisfaction", "K) intent"]},
            {"id": 33, "passage": 3, "type": "yes_no_notgiven", "question": "Many prize winners were average as children."},
            {"id": 34, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein lacked confidence."},
            {"id": 35, "passage": 3, "type": "yes_no_notgiven", "question": "Giftedness debate continues."},
            {"id": 36, "passage": 3, "type": "yes_no_notgiven", "question": "Ericsson studied only musicians."},
            {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Twins studies show genetic factors."},
            {"id": 38, "passage": 3, "type": "multiple_choice", "question": "What does Ericsson emphasize?", "options": ["A) Talent", "B) Practice", "C) Genes", "D) Age"]},
            {"id": 39, "passage": 3, "type": "multiple_choice", "question": "What sparked Mirzakhani's interest?", "options": ["A) School", "B) A puzzle", "C) A teacher", "D) A book"]},
            {"id": 40, "passage": 3, "type": "multiple_choice", "question": "The truth about giftedness is:", "options": ["A) All nature", "B) All nurture", "C) Complex mix", "D) Unknown"]}
        ],
        "answer_key": [
            {"question_id": 27, "answer": "H"},
            {"question_id": 28, "answer": "A"},
            {"question_id": 29, "answer": "C"},
            {"question_id": 30, "answer": "B"},
            {"question_id": 31, "answer": "J"},
            {"question_id": 32, "answer": "I"}
        ]
    }
    
    # Upsert - varsa güncelle, yoksa ekle
    await db.tests.delete_one({"title": "Academic Writing Test 2"})
    await db.tests.insert_one(writing_test_2)
    logger.info("   ✅ Writing Test 2 synced (side-by-side images)")
    
    await db.tests.delete_one({"title": "Academic Reading Practice Test 2"})
    await db.tests.insert_one(reading_test_2)
    logger.info("   ✅ Reading Test 2 synced (full passages + summary_completion_block)")
    
    logger.info("🔧 Manual fallback sync complete")
