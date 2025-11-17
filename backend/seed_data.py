"""Seed script with proper IELTS test structure - ready for your content"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding database with proper IELTS structure...")
    
    await db.tests.delete_many({})
    await db.tips.delete_many({})
    await db.courses.delete_many({})
    
    # READING TEST - Proper IELTS Academic Structure
    reading_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Reading Practice Test",
        "test_type": "reading",
        "duration": 60,
        "passages": [
            {
                "id": 1,
                "title": "Passage 1: How tennis rackets have changed",
                "text": """In 2016, the British professional tennis player Andy Murray was ranked as the world's number one. It was an incredible achievement by any standard - made even more remarkable by the fact that he did this during a period considered to be one of the strongest in the sport's history, competing against the likes of Rafael Nadal, Roger Federer and Novak Djokovic, to name just a few. Yet five years previously, he had been regarded as a talented outsider who entered but never won the major tournaments.

Of the changes that account for this transformation, one was visible and widely publicised: in 2011, Murray invited former number one player Ivan Lendl onto his coaching team - a valuable addition that had a visible impact on the player's playing style. Another change was so subtle as to pass more or less unnoticed. Like many players, Murray has long preferred a racket that consists of two types of string: one for the mains (verticals) and another for the crosses (horizontals). While he continued to use natural string in the crosses, in 2012 he switched to a synthetic string for the mains. A small change, perhaps, but its importance should not be underestimated.

The modification that Murray made is just one of a number of options available to players looking to tweak their rackets in order to improve their games. 'Touring professionals have their rackets customised to their specific needs,' says Colin Triplow, a UK-based professional racket stringer. 'It's a highly important part of performance maximisation.' Consequently, the specific rackets used by the world's elite are not actually readily available to the public; rather, each racket is individually made to suit the player who uses it. Take the US professional tennis players Mike and Bob Bryan, for example: 'We're very particular with our racket specifications,' they say. 'All our rackets are sent from our manufacturer to Tampa, Florida, where our frames go through a thorough customisation process.' They explain how they have adjusted not only racket length, but even experimented with different kinds of paint. The rackets they use now weigh more than the average model and also have a denser string pattern (i.e. more crosses and mains).

The primary reason for these modifications is simple: as the line between winning and losing becomes thinner and thinner, even these slight changes become more and more important. As a result, players and their teams are becoming increasingly creative with the modifications to their rackets as they look to maximise their competitive advantage.

Racket modifications mainly date back to the 1970s, when the amateur German tennis player Werner Fischer started playing with the so-called spaghetti-strung racket. It created a string bed that generated so much topspin that it was quickly banned by the International Tennis Federation.

However, within a decade or two, racket modification became a regularity. Today it is, in many ways, an aspect of the game that is equal in significance to nutrition or training.

Modifications can be divided into two categories: those to the string bed and those to the racket frame. The former is far more common than the latter: the choice of the strings and the tension with which they are installed is something that nearly all professional players experiment with. They will continually change it depending on various factors including the court surface, climatic conditions, and game styles. Some will even change it depending on how they feel at the time.

At one time, all tennis rackets were strung with natural gut made from the outer layer of sheep or cow intestines. This all changed in the early 1990s with the development of synthetic strings that were cheaper and more durable. They are made from three materials: nylon (relatively durable and affordable), Kevlar (too stiff to be used alone) or co-polyester (polyester combined with additives that enhance its performance). Even so, many professional players continue to use a 'hybrid set-up', where a combination of both synthetic and natural strings are used.

Of the synthetics, co-polyester is by far the most widely used. It's a perfect fit for the style of tennis now played, where players tend to battle it out from the back of the court rather than coming to the net. Studies indicate that the average spin from a co-polyester string is 25% greater than that from natural string or other synthetics. In a sense, the development of co-polyester strings has revolutionised the game.

However, many players go beyond these basic adjustments to the strings and make changes to the racket frame itself. For example, much of the serving power of US professional player Pete Sampras was attributed to the addition of four to five lead weights onto his rackets, and today many professionals have the weight adjusted during the manufacturing process.

Other changes to the frame involve the handle. Players have individual preferences for the shape of the handle and some will have the handle of one racket moulded onto the frame of a different racket. Other players make different changes. The professional Portuguese player Gonçalo Oliveira replaced the original grips of his rackets with something thinner because they had previously felt uncomfortable to hold.

Racket customisation and modification have pushed the standards of the game to greater levels that few could have anticipated in the days of natural strings and heavy, wooden frames, and it's exciting to see what further developments there will be in the future."""
            },
            {
                "id": 2,
                "title": "Passage 2: Climate Change and Coral Reefs",
                "text": """Coral reefs, often called the 'rainforests of the sea', support approximately 25% of all marine species despite covering less than 1% of the ocean floor. These diverse ecosystems provide food, income, and protection for millions of people worldwide. However, rising ocean temperatures due to climate change pose an unprecedented threat to their survival.

Coral bleaching occurs when corals expel the symbiotic algae (zooxanthellae) living in their tissues due to stress, primarily caused by elevated water temperatures. These algae provide up to 90% of the coral's energy through photosynthesis. Without them, corals turn white and face starvation. While corals can recover from mild bleaching events, severe or prolonged bleaching often leads to coral death.

The frequency and severity of bleaching events have increased dramatically since the 1980s. The 2016-2017 global bleaching event affected 75% of the world's reefs, with some regions experiencing near-total coral mortality. Scientists predict that even if global warming is limited to 1.5°C above pre-industrial levels, 70-90% of coral reefs will be lost. At 2°C warming, virtually all reefs could disappear.

Conservation efforts include reducing local stressors such as overfishing and pollution, establishing marine protected areas, and developing coral restoration techniques. Some researchers are working on breeding heat-resistant coral strains, while others focus on creating artificial reefs. However, scientists emphasize that these measures alone cannot save coral reefs without significant reductions in greenhouse gas emissions."""
            },
            {
                "id": 3,
                "title": "Passage 3: The Psychology of Decision Making",
                "text": """Human decision-making is far more complex than simple rational calculation. Behavioral economists and psychologists have identified numerous cognitive biases that systematically influence our choices, often leading to irrational decisions. Understanding these biases is crucial for improving decision-making in personal, business, and policy contexts.

One fundamental bias is the availability heuristic, where people judge the probability of events based on how easily examples come to mind rather than actual statistical likelihood. For instance, people often overestimate the risk of plane crashes relative to car accidents because plane crashes receive extensive media coverage. This bias explains why vivid, recent, or emotionally charged events disproportionately influence our risk assessments.

Another pervasive bias is confirmation bias—the tendency to seek, interpret, and recall information that confirms pre-existing beliefs while ignoring contradictory evidence. This bias affects not only everyday reasoning but also scientific research, where investigators might unconsciously design experiments or interpret results in ways that support their hypotheses. The peer review process and replication studies help mitigate this bias in science, but it remains challenging to overcome in personal decision-making.

The anchoring effect demonstrates how initial information disproportionately influences subsequent judgments. In negotiations, for example, the first number mentioned typically serves as an anchor, pulling the final agreement toward that value regardless of its reasonableness. Real estate agents exploit this bias by showing expensive properties first, making subsequent properties seem more affordable by comparison.

Prospect theory, developed by psychologists Daniel Kahneman and Amos Tversky, reveals that people evaluate potential losses and gains asymmetrically. Most individuals are loss-averse, feeling the pain of losing $100 more intensely than the pleasure of gaining $100. This asymmetry explains seemingly irrational behaviors, such as holding onto losing investments too long (to avoid realizing a loss) while selling winning investments too quickly (to lock in gains).

Recognizing these biases doesn't eliminate them, but awareness can help individuals develop strategies to counteract their effects. These include seeking diverse perspectives, using decision-making frameworks, and slowing down to engage analytical rather than intuitive thinking processes."""
            }
        ],
        "questions": [
            # Passage 1 Questions (1-7) - Cambridge IELTS 19
            {"id": 1, "passage": 1, "type": "true_false_notgiven", "question": "People had expected Andy Murray to become the world's top tennis player for at least five years before 2016."},
            {"id": 2, "passage": 1, "type": "true_false_notgiven", "question": "The change that Andy Murray made to his rackets attracted a lot of attention."},
            {"id": 3, "passage": 1, "type": "true_false_notgiven", "question": "Most of the world's top players take a professional racket stringer on tour with them."},
            {"id": 4, "passage": 1, "type": "true_false_notgiven", "question": "Mike and Bob Bryan use rackets that are light in comparison to the majority of rackets."},
            {"id": 5, "passage": 1, "type": "true_false_notgiven", "question": "Werner Fischer played with a spaghetti-strung racket that he designed himself."},
            {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "The weather can affect how professional players adjust the strings on their rackets."},
            {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "It was believed that the change Pete Sampras made to his rackets contributed to his strong serve."},
            
            # Questions 8-13 - Note completion (ONE WORD ONLY)
            {"id": 8, "passage": 1, "type": "sentence_completion", "question": "Mike and Bob Bryan made changes to the types of _______ used on their rackets."},
            {"id": 9, "passage": 1, "type": "sentence_completion", "question": "Players were not allowed to use the spaghetti-strung racket because of the amount of _______ it created."},
            {"id": 10, "passage": 1, "type": "sentence_completion", "question": "Changes to rackets can be regarded as being as important as players' diets or the _______ they do."},
            {"id": 11, "passage": 1, "type": "sentence_completion", "question": "All rackets used to have natural strings made from the _______ of animals."},
            {"id": 12, "passage": 1, "type": "sentence_completion", "question": "Pete Sampras had metal _______ put into the frames of his rackets."},
            {"id": 13, "passage": 1, "type": "sentence_completion", "question": "Gonçalo Oliveira changed the _______ on his racket handles."},
            
            # Passage 2 Questions (14-26)
            {"id": 14, "passage": 2, "type": "true_false_notgiven", "question": "Coral reefs cover more than 1% of the ocean floor."},
            {"id": 15, "passage": 2, "type": "true_false_notgiven", "question": "Zooxanthellae provide most of the coral's energy through photosynthesis."},
            {"id": 16, "passage": 2, "type": "multiple_choice", "question": "What percentage of coral reefs will be lost if global warming reaches 1.5°C?", "options": ["A) 25%", "B) 50%", "C) 70-90%", "D) 100%"]},
            {"id": 17, "passage": 2, "type": "sentence_completion", "question": "Coral bleaching occurs when corals expel _______ from their tissues."},
            {"id": 18, "passage": 2, "type": "yes_no_notgiven", "question": "Scientists believe coral reefs can be saved without reducing greenhouse gas emissions."},
            {"id": 19, "passage": 2, "type": "multiple_choice", "question": "Approximately what percentage of marine species do coral reefs support?", "options": ["A) 10%", "B) 15%", "C) 25%", "D) 50%"]},
            {"id": 20, "passage": 2, "type": "sentence_completion", "question": "Coral reefs are often called the 'rainforests of the _______'."},
            {"id": 21, "passage": 2, "type": "true_false_notgiven", "question": "The 2016-2017 bleaching event affected 75% of the world's reefs."},
            {"id": 22, "passage": 2, "type": "sentence_completion", "question": "Zooxanthellae provide up to _______ percent of the coral's energy."},
            {"id": 23, "passage": 2, "type": "multiple_choice", "question": "Conservation efforts mentioned include all EXCEPT:", "options": ["A) Reducing overfishing", "B) Establishing marine protected areas", "C) Building underwater hotels", "D) Developing coral restoration techniques"]},
            {"id": 24, "passage": 2, "type": "true_false_notgiven", "question": "Corals can always recover from bleaching events."},
            {"id": 25, "passage": 2, "type": "sentence_completion", "question": "Some researchers are working on breeding heat-resistant _______ strains."},
            {"id": 26, "passage": 2, "type": "true_false_notgiven", "question": "The frequency of bleaching events has increased since the 1980s."},
            
            # Passage 3 Questions (27-40)
            {"id": 27, "passage": 3, "type": "multiple_choice", "question": "The availability heuristic causes people to:", "options": ["A) Make rational decisions", "B) Judge probability based on how easily examples come to mind", "C) Ignore all statistics", "D) Only trust recent information"]},
            {"id": 28, "passage": 3, "type": "true_false_notgiven", "question": "Confirmation bias only affects scientific research."},
            {"id": 29, "passage": 3, "type": "sentence_completion", "question": "Prospect theory was developed by Daniel Kahneman and Amos _______."},
            {"id": 30, "passage": 3, "type": "multiple_choice", "question": "According to the text, people overestimate plane crash risks because:", "options": ["A) Planes are more dangerous", "B) Plane crashes receive extensive media coverage", "C) They fly frequently", "D) Statistics are unclear"]},
            {"id": 31, "passage": 3, "type": "true_false_notgiven", "question": "Loss aversion means people feel losses more intensely than equivalent gains."},
            {"id": 32, "passage": 3, "type": "sentence_completion", "question": "The anchoring effect is often exploited in _______ by showing expensive properties first."},
            {"id": 33, "passage": 3, "type": "multiple_choice", "question": "What helps mitigate confirmation bias in scientific research?", "options": ["A) Only peer review", "B) Only replication studies", "C) Both peer review and replication studies", "D) Neither works"]},
            {"id": 34, "passage": 3, "type": "true_false_notgiven", "question": "Recognizing cognitive biases completely eliminates their effects."},
            {"id": 35, "passage": 3, "type": "sentence_completion", "question": "Confirmation bias involves seeking information that confirms _______ beliefs."},
            {"id": 36, "passage": 3, "type": "multiple_choice", "question": "According to prospect theory, most people are:", "options": ["A) Risk-seeking", "B) Loss-averse", "C) Gain-focused", "D) Indifferent"]},
            {"id": 37, "passage": 3, "type": "true_false_notgiven", "question": "The anchoring effect only works with numbers."},
            {"id": 38, "passage": 3, "type": "sentence_completion", "question": "To counteract biases, people should seek _______ perspectives."},
            {"id": 39, "passage": 3, "type": "multiple_choice", "question": "Behavioral economists study:", "options": ["A) Only rational behavior", "B) Cognitive biases affecting decisions", "C) Only economic theories", "D) Only business decisions"]},
            {"id": 40, "passage": 3, "type": "true_false_notgiven", "question": "The text suggests slowing down helps engage analytical thinking."},
        ],
        "answer_key": [
            {"question_id": 1, "answer": "False"},
            {"question_id": 2, "answer": "False"},
            {"question_id": 3, "answer": "Not Given"},
            {"question_id": 4, "answer": "False"},
            {"question_id": 5, "answer": "Not Given"},
            {"question_id": 6, "answer": "True"},
            {"question_id": 7, "answer": "True"},
            {"question_id": 8, "answer": "PLACEHOLDER"},
            {"question_id": 9, "answer": "PLACEHOLDER"},
            {"question_id": 10, "answer": "PLACEHOLDER"},
            {"question_id": 11, "answer": "PLACEHOLDER"},
            {"question_id": 12, "answer": "PLACEHOLDER"},
            {"question_id": 13, "answer": "PLACEHOLDER"},
            {"question_id": 14, "answer": "False"},
            {"question_id": 15, "answer": "True"},
            {"question_id": 16, "answer": "C"},
            {"question_id": 17, "answer": "zooxanthellae"},
            {"question_id": 18, "answer": "No"},
            {"question_id": 19, "answer": "C"},
            {"question_id": 20, "answer": "sea"},
            {"question_id": 21, "answer": "True"},
            {"question_id": 22, "answer": "90"},
            {"question_id": 23, "answer": "C"},
            {"question_id": 24, "answer": "False"},
            {"question_id": 25, "answer": "coral"},
            {"question_id": 26, "answer": "True"},
            {"question_id": 27, "answer": "B"},
            {"question_id": 28, "answer": "False"},
            {"question_id": 29, "answer": "Tversky"},
            {"question_id": 30, "answer": "B"},
            {"question_id": 31, "answer": "True"},
            {"question_id": 32, "answer": "real estate"},
            {"question_id": 33, "answer": "C"},
            {"question_id": 34, "answer": "False"},
            {"question_id": 35, "answer": "pre-existing"},
            {"question_id": 36, "answer": "B"},
            {"question_id": 37, "answer": "Not Given"},
            {"question_id": 38, "answer": "diverse"},
            {"question_id": 39, "answer": "B"},
            {"question_id": 40, "answer": "True"},
        ]
    }
    
    # LISTENING TEST Structure
    listening_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Listening Practice Test",
        "test_type": "listening",
        "duration": 40,
        "sections": [
            {
                "id": 1,
                "title": "Section 1: Conversation between two people in an everyday social context",
                "context": "A student calling about accommodation",
                "audio_url": "/audio/listening-section-1.mp3"
            },
            {
                "id": 2,
                "title": "Section 2: Monologue in an everyday social context",
                "context": "Information about a local library",
                "audio_url": "/audio/listening-section-2.mp3"
            },
            {
                "id": 3,
                "title": "Section 3: Conversation between up to four people in educational context",
                "context": "Students discussing a group project",
                "audio_url": "/audio/listening-section-3.mp3"
            },
            {
                "id": 4,
                "title": "Section 4: Monologue on an academic subject",
                "context": "Lecture on renewable energy",
                "audio_url": "/audio/listening-section-4.mp3"
            }
        ],
        "questions": [
            {"id": 1, "section": 1, "type": "form_completion", "question": "Name: Sarah _______"},
            {"id": 2, "section": 1, "type": "form_completion", "question": "Phone number: _______"},
            {"id": 3, "section": 1, "type": "multiple_choice", "question": "Type of accommodation required:", "options": ["A) Single room", "B) Shared flat", "C) Studio apartment", "D) Family house"]},
            {"id": 4, "section": 2, "type": "map_labeling", "question": "Label the children's section on the library map"},
            {"id": 5, "section": 3, "type": "matching", "question": "Match each person with their project role"},
            {"id": 6, "section": 4, "type": "note_completion", "question": "Solar panels convert _______ into electricity"},
        ],
        "answer_key": [
            {"question_id": 1, "answer": "[Your Content]"},
            {"question_id": 2, "answer": "[Your Content]"},
        ]
    }
    
    # WRITING TEST
    writing_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Writing Practice Test",
        "test_type": "writing",
        "duration": 60,
        "questions": [
            {
                "id": 1,
                "task": "task1",
                "type": "graph_description",
                "question": """The chart below shows the percentage of households in different age groups using the internet in Country X from 2000 to 2020.

Summarize the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.""",
                "word_limit": 150,
                "time_suggestion": 20
            },
            {
                "id": 2,
                "task": "task2",
                "type": "essay",
                "question": """Some people think that universities should provide graduates with the knowledge and skills needed in the workplace. Others think that the true function of a university should be to give access to knowledge for its own sake, regardless of whether the course is useful to an employer.

What, in your opinion, should be the main function of a university?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.""",
                "word_limit": 250,
                "time_suggestion": 40
            }
        ],
        "answer_key": []
    }
    
    # SPEAKING TEST
    speaking_test = {
        "id": str(uuid.uuid4()),
        "title": "Speaking Practice Test",
        "test_type": "speaking",
        "duration": 15,
        "parts": [
            {
                "part": 1,
                "title": "Introduction and interview",
                "duration": "4-5 minutes",
                "topics": ["Home/Accommodation", "Work/Studies", "Hobbies"],
                "questions": [
                    "Let's talk about where you live. Do you live in a house or an apartment?",
                    "What do you like most about your home?",
                    "What kind of home would you like to live in the future?",
                    "Let's move on to talk about your work/studies. What subject are you studying?",
                    "Why did you choose this subject?",
                    "What do you find most interesting about your studies?"
                ]
            },
            {
                "part": 2,
                "title": "Individual long turn",
                "duration": "3-4 minutes",
                "preparation_time": "1 minute",
                "questions": [
                    """Describe a person who has influenced you. You should say: who this person is, how you know this person, what they have done, and explain why this person has influenced you. [You have 1 minute to prepare and should speak for 2 minutes]"""
                ]
            },
            {
                "part": 3,
                "title": "Two-way discussion",
                "duration": "4-5 minutes",
                "questions": [
                    "How do you think people's relationships with their families have changed in recent years?",
                    "What role do you think technology plays in modern relationships?",
                    "Do you think young people today have different role models compared to previous generations?",
                    "How important is it for children to have good role models?"
                ]
            }
        ],
        "questions": [
            {"id": 1, "part": 1, "question": "Let's talk about where you live. Do you live in a house or an apartment?"},
            {"id": 2, "part": 1, "question": "What do you like most about your home?"},
            {"id": 3, "part": 1, "question": "What kind of home would you like to live in the future?"},
            {"id": 4, "part": 1, "question": "Let's move on to talk about your work/studies. What subject are you studying?"},
            {"id": 5, "part": 1, "question": "Why did you choose this subject?"},
            {"id": 6, "part": 1, "question": "What do you find most interesting about your studies?"},
            {"id": 7, "part": 2, "question": "Describe a person who has influenced you. You should say: who this person is, how you know this person, what they have done, and explain why this person has influenced you. [Preparation: 1 minute. Speaking: 2 minutes]"},
            {"id": 8, "part": 3, "question": "How do you think people's relationships with their families have changed in recent years?"},
            {"id": 9, "part": 3, "question": "What role do you think technology plays in modern relationships?"},
            {"id": 10, "part": 3, "question": "Do you think young people today have different role models compared to previous generations?"},
            {"id": 11, "part": 3, "question": "How important is it for children to have good role models?"}
        ],
        "answer_key": []
    }
    
    await db.tests.insert_many([reading_test, listening_test, writing_test, speaking_test])
    print("✅ Tests seeded with proper IELTS structure")
    
    # Tips remain the same
    tips = [
        {
            "id": str(uuid.uuid4()),
            "title": "Reading: Skimming and Scanning",
            "category": "reading",
            "content": """**Master these essential techniques:**

**Skimming** - Read quickly to get the general idea:
• Read the title, headings, and first/last paragraphs
• Look at any images, charts, or highlighted text
• Don't read every word - just get the main points

**Scanning** - Search for specific information:
• Know what you're looking for before you scan
• Move your eyes quickly over the text
• Stop only when you find the keyword or answer

**Time-saving tips:**
• Skim all passages first (2-3 minutes total)
• Read questions before detailed reading
• Use pencil to mark key information"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Writing Task 2: Essay Structure",
            "category": "writing",
            "content": """**Perfect essay structure for Band 7+:**

**Introduction (50 words)**
• Paraphrase the question
• State your thesis/position clearly

**Body Paragraph 1 (100 words)**
• Topic sentence with main idea
• Explanation and development
• Specific example or evidence
• Linking sentence to next paragraph

**Body Paragraph 2 (100 words)**
• Second main point
• Full development with examples
• Counter-argument if relevant

**Conclusion (40 words)**
• Summarize main points
• Restate position clearly
• No new information

**Key tips:**
• Plan for 5 minutes before writing
• Use linking words naturally
• Vary your sentence structures"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Listening: Note-Taking Techniques",
            "category": "listening",
            "content": """**Effective note-taking strategies:**

**Before listening:**
• Read all questions carefully
• Predict possible answers
• Identify keywords

**While listening:**
• Write abbreviated notes
• Focus on keywords, not full sentences
• Listen for signpost words (firstly, however, finally)
• Don't panic if you miss an answer - move on

**After each section:**
• You have 30 seconds to check answers
• Correct any spelling quickly
• Make educated guesses for missed questions

**Common traps to avoid:**
• Distractors - similar sounding words
• Changed answers - speaker corrects themselves
• Plural vs singular forms"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Speaking Part 2: PREP Method",
            "category": "speaking",
            "content": """**Use PREP to organize your 2-minute talk:**

**P - Point**: State your main topic clearly
*"The person who has influenced me most is my grandmother."*

**R - Reason**: Explain why
*"She taught me the importance of education and perseverance."*

**E - Example**: Give specific details
*"When I was struggling with mathematics in school, she would spend hours helping me..."*

**P - Point**: Conclude by restating
*"That's why my grandmother has been such an important influence in my life."*

**Time management:**
• Use full 1 minute to make notes
• Aim for 1.5-2 minutes (don't stop early)
• Speak naturally - don't memorize scripts"""
        }
    ]
    
    await db.tips.insert_many(tips)
    print("✅ Tips seeded")
    
    # Courses remain the same
    courses = [
        {
            "id": str(uuid.uuid4()),
            "title": "IELTS Band 7+ Complete Course",
            "description": "Comprehensive preparation for all four IELTS modules with proven strategies to achieve Band 7 or higher.",
            "modules": [
                {
                    "id": 1,
                    "title": "Reading Mastery",
                    "lessons": [
                        {"id": 1, "title": "Question Types Overview", "duration": "30 min"},
                        {"id": 2, "title": "Skimming & Scanning Techniques", "duration": "45 min"},
                        {"id": 3, "title": "True/False/Not Given Questions", "duration": "40 min"},
                        {"id": 4, "title": "Matching Headings Strategy", "duration": "35 min"},
                        {"id": 5, "title": "Time Management", "duration": "25 min"}
                    ]
                },
                {
                    "id": 2,
                    "title": "Writing Excellence",
                    "lessons": [
                        {"id": 1, "title": "Task 1: Graph Description", "duration": "50 min"},
                        {"id": 2, "title": "Task 2: Essay Planning", "duration": "40 min"},
                        {"id": 3, "title": "Advanced Vocabulary", "duration": "45 min"},
                        {"id": 4, "title": "Grammar for Writing", "duration": "50 min"}
                    ]
                },
                {
                    "id": 3,
                    "title": "Listening Skills",
                    "lessons": [
                        {"id": 1, "title": "Understanding Different Accents", "duration": "35 min"},
                        {"id": 2, "title": "Note-Taking Techniques", "duration": "30 min"},
                        {"id": 3, "title": "Common Traps and Distractors", "duration": "40 min"}
                    ]
                },
                {
                    "id": 4,
                    "title": "Speaking Confidence",
                    "lessons": [
                        {"id": 1, "title": "Part 1: First Impressions", "duration": "30 min"},
                        {"id": 2, "title": "Part 2: The Long Turn", "duration": "40 min"},
                        {"id": 3, "title": "Part 3: Complex Discussion", "duration": "35 min"},
                        {"id": 4, "title": "Fluency and Coherence", "duration": "30 min"}
                    ]
                }
            ]
        }
    ]
    
    await db.courses.insert_many(courses)
    print("✅ Courses seeded")
    
    print("\n🎉 Database seeded with authentic IELTS test structure!")
    print("\n📝 Note: You can now add your Cambridge IELTS content through the admin interface.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
