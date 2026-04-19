"""
Enhanced Vocabulary & Grammar Seed Data v2
TESTMASTER.PRO Framework - IELTS-Focused Content

Features:
- IPA pronunciation (Cambridge-style)
- Part of speech
- Stress marking
- IELTS context for grammar
- Band-appropriate content
- 5 units per band (15 total)
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# ============================================================
# BAND 4.5 & BELOW - FOUNDATION (5 Units)
# Focus: Survival → IELTS Basics
# ============================================================

FOUNDATION_UNITS = [
    # Unit 1: Daily Routine & Time
    {
        "id": "foundation-unit1-vocab",
        "title": "Unit 1: Daily Routine & Time",
        "band_level": "beginner",
        "type": "vocabulary",
        "unit_number": 1,
        "description": "Essential vocabulary for describing your daily life - perfect for IELTS Speaking Part 1",
        "ielts_relevance": "Speaking Part 1 often asks about daily routines, habits, and time management.",
        "items": [
            {
                "id": "f1v1",
                "word": "usually",
                "ipa": "/ˈjuː.ʒu.ə.li/",
                "part_of_speech": "adverb",
                "stress_pattern": "U-su-al-ly (stress on first syllable)",
                "definition": "In the way that most often happens",
                "examples": [
                    "I usually wake up at 7 o'clock.",
                    "She usually takes the bus to work.",
                    "We don't usually eat out during the week."
                ],
                "collocations": ["usually go", "usually have", "usually take"],
                "ielts_tip": "Use 'usually' to describe your regular habits in Speaking Part 1."
            },
            {
                "id": "f1v2",
                "word": "schedule",
                "ipa": "/ˈʃed.juːl/ (UK) or /ˈsked.juːl/ (US)",
                "part_of_speech": "noun / verb",
                "stress_pattern": "SCHE-dule (stress on first syllable)",
                "definition": "A plan of activities or events and when they will happen",
                "examples": [
                    "My schedule is very busy this week.",
                    "I need to schedule a meeting with my teacher.",
                    "What's your daily schedule like?"
                ],
                "collocations": ["busy schedule", "work schedule", "daily schedule"],
                "ielts_tip": "Great word to use when describing your routine or plans."
            },
            {
                "id": "f1v3",
                "word": "convenient",
                "ipa": "/kənˈviː.ni.ənt/",
                "part_of_speech": "adjective",
                "stress_pattern": "con-VE-nient (stress on second syllable)",
                "definition": "Easy to use, suitable for your purposes",
                "examples": [
                    "Public transport is very convenient in my city.",
                    "Online shopping is convenient but I prefer going to stores.",
                    "It's convenient to live near my workplace."
                ],
                "collocations": ["very convenient", "more convenient", "convenient location"],
                "ielts_tip": "Use when discussing advantages of something in Speaking or Writing."
            },
            {
                "id": "f1v4",
                "word": "prefer",
                "ipa": "/prɪˈfɜːr/",
                "part_of_speech": "verb",
                "stress_pattern": "pre-FER (stress on second syllable)",
                "definition": "To like something more than another thing",
                "examples": [
                    "I prefer tea to coffee.",
                    "Most students prefer studying at home.",
                    "Do you prefer working alone or in a team?"
                ],
                "collocations": ["prefer to do", "prefer doing", "would prefer"],
                "ielts_tip": "Essential verb for expressing opinions and preferences in IELTS."
            },
            {
                "id": "f1v5",
                "word": "regularly",
                "ipa": "/ˈreɡ.jə.lə.li/",
                "part_of_speech": "adverb",
                "stress_pattern": "RE-gu-lar-ly (stress on first syllable)",
                "definition": "At the same time or in the same way, often",
                "examples": [
                    "I exercise regularly, about three times a week.",
                    "She regularly visits her grandparents.",
                    "Do you regularly check your emails?"
                ],
                "collocations": ["regularly exercise", "regularly check", "regularly visit"],
                "ielts_tip": "Shows frequency - helps you sound more natural in Speaking."
            }
        ]
    },
    {
        "id": "foundation-unit1-grammar",
        "title": "Unit 1: Present Simple for Habits",
        "band_level": "beginner",
        "type": "grammar",
        "unit_number": 1,
        "description": "Master the present simple tense for talking about your daily routine",
        "ielts_relevance": "Essential for Speaking Part 1 (habits, routines) and Writing Task 2 (general statements).",
        "items": [
            {
                "id": "f1g1",
                "word": "Present Simple - Positive",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Subject + base verb (add -s/-es for he/she/it)",
                "examples": [
                    "I work in an office. / She works from home.",
                    "We live in the city center.",
                    "He plays football every weekend."
                ],
                "grammar_formula": "I/You/We/They + verb | He/She/It + verb + s/es",
                "common_mistakes": ["He work (wrong) → He works (correct)", "She go (wrong) → She goes (correct)"],
                "ielts_band_impact": "Correct use of third person -s is essential for Band 5+",
                "practice_prompt": "Describe your typical morning routine using present simple."
            },
            {
                "id": "f1g2",
                "word": "Present Simple - Negative",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Subject + do/does + not + base verb",
                "examples": [
                    "I don't like waking up early.",
                    "She doesn't work on weekends.",
                    "They don't usually eat breakfast."
                ],
                "grammar_formula": "I/You/We/They + don't + verb | He/She/It + doesn't + verb",
                "common_mistakes": ["She doesn't works (wrong) → She doesn't work (correct)"],
                "ielts_band_impact": "Avoiding double negatives shows grammar control.",
                "practice_prompt": "Talk about three things you don't do in the morning."
            },
            {
                "id": "f1g3",
                "word": "Frequency Adverbs",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Words that show how often something happens: always, usually, often, sometimes, rarely, never",
                "examples": [
                    "I always have coffee in the morning.",
                    "She sometimes works from home.",
                    "We never eat fast food."
                ],
                "grammar_formula": "Subject + frequency adverb + verb | Subject + be + frequency adverb",
                "common_mistakes": ["I go always (wrong) → I always go (correct)", "She is usually late (correct position after 'be')"],
                "ielts_band_impact": "Using varied frequency adverbs improves vocabulary score.",
                "practice_prompt": "Describe how often you do different activities."
            }
        ]
    },
    
    # Unit 2: Family & Relationships
    {
        "id": "foundation-unit2-vocab",
        "title": "Unit 2: Family & Relationships",
        "band_level": "beginner",
        "type": "vocabulary",
        "unit_number": 2,
        "description": "Essential vocabulary for talking about family - a common IELTS Speaking topic",
        "ielts_relevance": "Family is frequently tested in Speaking Part 1 and Part 2.",
        "items": [
            {
                "id": "f2v1",
                "word": "close",
                "ipa": "/kləʊs/",
                "part_of_speech": "adjective",
                "stress_pattern": "CLOSE (one syllable)",
                "definition": "Having a strong relationship with someone",
                "examples": [
                    "I'm very close to my sister.",
                    "We have a close family.",
                    "She has a close relationship with her grandmother."
                ],
                "collocations": ["close family", "close friend", "close relationship"],
                "ielts_tip": "Use 'close' instead of 'good' for relationships - shows better vocabulary."
            },
            {
                "id": "f2v2",
                "word": "supportive",
                "ipa": "/səˈpɔː.tɪv/",
                "part_of_speech": "adjective",
                "stress_pattern": "sup-POR-tive (stress on second syllable)",
                "definition": "Giving help and encouragement",
                "examples": [
                    "My parents are very supportive of my career.",
                    "I have a supportive family.",
                    "Good friends should be supportive."
                ],
                "collocations": ["supportive family", "supportive parents", "very supportive"],
                "ielts_tip": "Great adjective to describe positive family relationships."
            },
            {
                "id": "f2v3",
                "word": "relative",
                "ipa": "/ˈrel.ə.tɪv/",
                "part_of_speech": "noun",
                "stress_pattern": "RE-la-tive (stress on first syllable)",
                "definition": "A member of your family",
                "examples": [
                    "I have relatives in different countries.",
                    "We visit our relatives during holidays.",
                    "She's a distant relative of mine."
                ],
                "collocations": ["close relative", "distant relative", "visit relatives"],
                "ielts_tip": "More formal than 'family member' - good for IELTS."
            },
            {
                "id": "f2v4",
                "word": "get along with",
                "ipa": "/ɡet əˈlɒŋ wɪð/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "get aLONG with (stress on 'long')",
                "definition": "To have a good relationship with someone",
                "examples": [
                    "I get along well with my siblings.",
                    "Do you get along with your colleagues?",
                    "They don't get along with each other."
                ],
                "collocations": ["get along well", "get along with someone"],
                "ielts_tip": "Natural phrasal verb - better than 'have good relationship'."
            },
            {
                "id": "f2v5",
                "word": "look after",
                "ipa": "/lʊk ˈɑːf.tər/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "look AF-ter (stress on 'af')",
                "definition": "To take care of someone or something",
                "examples": [
                    "My grandmother looked after me when I was young.",
                    "Who looks after your children?",
                    "I need to look after my health."
                ],
                "collocations": ["look after children", "look after yourself", "look after someone"],
                "ielts_tip": "Common phrasal verb - shows natural English use."
            }
        ]
    },
    {
        "id": "foundation-unit2-grammar",
        "title": "Unit 2: Past Simple for Experiences",
        "band_level": "beginner",
        "type": "grammar",
        "unit_number": 2,
        "description": "Use past simple to talk about completed actions and childhood memories",
        "ielts_relevance": "Essential for Speaking Part 2 (describing past events) and Part 3 (discussing changes).",
        "items": [
            {
                "id": "f2g1",
                "word": "Past Simple - Regular Verbs",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Add -ed to the base verb for regular verbs",
                "examples": [
                    "I lived in a small town when I was young.",
                    "We visited my grandparents every summer.",
                    "She studied English at school."
                ],
                "grammar_formula": "Subject + verb + ed",
                "common_mistakes": ["I am lived (wrong) → I lived (correct)", "She studied-ed (wrong) → She studied (correct)"],
                "ielts_band_impact": "Correct past tense formation is essential for Band 5+.",
                "practice_prompt": "Describe where you lived as a child."
            },
            {
                "id": "f2g2",
                "word": "Past Simple - Irregular Verbs",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Common irregular verbs have special past forms: go→went, have→had, be→was/were",
                "examples": [
                    "I went to school near my home.",
                    "We had a big family dinner every Sunday.",
                    "My father was a teacher."
                ],
                "grammar_formula": "Subject + irregular past form",
                "common_mistakes": ["I goed (wrong) → I went (correct)", "She haved (wrong) → She had (correct)"],
                "ielts_band_impact": "Knowing irregular verbs shows vocabulary range.",
                "practice_prompt": "Tell me about a family celebration you had."
            }
        ]
    },
    
    # Unit 3: Home & Accommodation
    {
        "id": "foundation-unit3-vocab",
        "title": "Unit 3: Home & Accommodation",
        "band_level": "beginner",
        "type": "vocabulary",
        "unit_number": 3,
        "description": "Vocabulary for describing your home and living situation",
        "ielts_relevance": "Speaking Part 1 frequently asks about your home, room, or neighborhood.",
        "items": [
            {
                "id": "f3v1",
                "word": "spacious",
                "ipa": "/ˈspeɪ.ʃəs/",
                "part_of_speech": "adjective",
                "stress_pattern": "SPA-cious (stress on first syllable)",
                "definition": "Having a lot of space; large",
                "examples": [
                    "We have a spacious living room.",
                    "The apartment is small but the bedroom is quite spacious.",
                    "I prefer spacious rooms with lots of natural light."
                ],
                "collocations": ["spacious room", "spacious apartment", "spacious kitchen"],
                "ielts_tip": "Better than 'big' - shows vocabulary range."
            },
            {
                "id": "f3v2",
                "word": "cozy",
                "ipa": "/ˈkəʊ.zi/",
                "part_of_speech": "adjective",
                "stress_pattern": "CO-zy (stress on first syllable)",
                "definition": "Warm, comfortable, and pleasant (especially of a small space)",
                "examples": [
                    "My bedroom is small but cozy.",
                    "We have a cozy living room with a fireplace.",
                    "The café has a cozy atmosphere."
                ],
                "collocations": ["cozy room", "cozy atmosphere", "cozy and comfortable"],
                "ielts_tip": "Perfect for describing small but nice spaces positively."
            },
            {
                "id": "f3v3",
                "word": "neighborhood",
                "ipa": "/ˈneɪ.bə.hʊd/",
                "part_of_speech": "noun",
                "stress_pattern": "NEIGH-bor-hood (stress on first syllable)",
                "definition": "The area where you live and the people who live there",
                "examples": [
                    "I live in a quiet neighborhood.",
                    "The neighborhood has good schools and parks.",
                    "It's a friendly neighborhood."
                ],
                "collocations": ["quiet neighborhood", "safe neighborhood", "live in a neighborhood"],
                "ielts_tip": "Common topic in Speaking Part 1 - prepare examples."
            },
            {
                "id": "f3v4",
                "word": "located",
                "ipa": "/ləʊˈkeɪ.tɪd/",
                "part_of_speech": "adjective",
                "stress_pattern": "lo-CA-ted (stress on second syllable)",
                "definition": "In a particular place or position",
                "examples": [
                    "My apartment is located in the city center.",
                    "The school is located near our house.",
                    "It's conveniently located near public transport."
                ],
                "collocations": ["centrally located", "conveniently located", "located near"],
                "ielts_tip": "Formal way to describe where something is."
            },
            {
                "id": "f3v5",
                "word": "furnish",
                "ipa": "/ˈfɜː.nɪʃ/",
                "part_of_speech": "verb",
                "stress_pattern": "FUR-nish (stress on first syllable)",
                "definition": "To put furniture in a room or building",
                "examples": [
                    "The apartment came fully furnished.",
                    "We need to furnish the new house.",
                    "The room is simply furnished with a bed and desk."
                ],
                "collocations": ["fully furnished", "well-furnished", "simply furnished"],
                "ielts_tip": "Useful for describing rental accommodation."
            }
        ]
    },
    {
        "id": "foundation-unit3-grammar",
        "title": "Unit 3: There is/There are",
        "band_level": "beginner",
        "type": "grammar",
        "unit_number": 3,
        "description": "Use 'there is/are' to describe what exists in a place",
        "ielts_relevance": "Essential for describing your home, room, or any place in Speaking.",
        "items": [
            {
                "id": "f3g1",
                "word": "There is / There are",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use 'there is' for singular nouns, 'there are' for plural nouns",
                "examples": [
                    "There is a big park near my house.",
                    "There are three bedrooms in my apartment.",
                    "There's a nice café on my street."
                ],
                "grammar_formula": "There is + singular noun | There are + plural noun",
                "common_mistakes": ["There are a park (wrong) → There is a park (correct)", "There is many people (wrong) → There are many people (correct)"],
                "ielts_band_impact": "Basic but essential - mistakes here affect Band score.",
                "practice_prompt": "Describe what there is in your neighborhood."
            }
        ]
    },
    
    # Unit 4: Education & Study
    {
        "id": "foundation-unit4-vocab",
        "title": "Unit 4: Education & Study",
        "band_level": "beginner",
        "type": "vocabulary",
        "unit_number": 4,
        "description": "Vocabulary for talking about your education and learning experiences",
        "ielts_relevance": "Education is a major topic in all IELTS sections.",
        "items": [
            {
                "id": "f4v1",
                "word": "attend",
                "ipa": "/əˈtend/",
                "part_of_speech": "verb",
                "stress_pattern": "at-TEND (stress on second syllable)",
                "definition": "To go to an event, class, or school regularly",
                "examples": [
                    "I attend university in the city center.",
                    "Did you attend the lecture yesterday?",
                    "She attends English classes twice a week."
                ],
                "collocations": ["attend school", "attend university", "attend classes"],
                "ielts_tip": "More formal than 'go to' - good for IELTS."
            },
            {
                "id": "f4v2",
                "word": "major",
                "ipa": "/ˈmeɪ.dʒər/",
                "part_of_speech": "noun / verb",
                "stress_pattern": "MA-jor (stress on first syllable)",
                "definition": "The main subject you study at university",
                "examples": [
                    "My major is Computer Science.",
                    "She's majoring in Business Administration.",
                    "What's your major?"
                ],
                "collocations": ["major in", "my major is", "choose a major"],
                "ielts_tip": "Essential for talking about university studies."
            },
            {
                "id": "f4v3",
                "word": "graduate",
                "ipa": "/ˈɡrædʒ.u.eɪt/ (verb) or /ˈɡrædʒ.u.ət/ (noun)",
                "part_of_speech": "verb / noun",
                "stress_pattern": "GRA-du-ate (stress on first syllable)",
                "definition": "To complete your studies and receive a degree",
                "examples": [
                    "I graduated from university in 2020.",
                    "She's a graduate of Oxford University.",
                    "When did you graduate?"
                ],
                "collocations": ["graduate from", "university graduate", "recent graduate"],
                "ielts_tip": "Different pronunciation for verb and noun forms."
            },
            {
                "id": "f4v4",
                "word": "improve",
                "ipa": "/ɪmˈpruːv/",
                "part_of_speech": "verb",
                "stress_pattern": "im-PROVE (stress on second syllable)",
                "definition": "To get better or make something better",
                "examples": [
                    "I want to improve my English skills.",
                    "The weather has improved recently.",
                    "How can I improve my pronunciation?"
                ],
                "collocations": ["improve skills", "improve performance", "improve significantly"],
                "ielts_tip": "Very useful verb for discussing learning and development."
            },
            {
                "id": "f4v5",
                "word": "knowledge",
                "ipa": "/ˈnɒl.ɪdʒ/",
                "part_of_speech": "noun",
                "stress_pattern": "KNOW-ledge (stress on first syllable, 'k' is silent)",
                "definition": "Understanding of facts, information, or skills",
                "examples": [
                    "She has good knowledge of history.",
                    "I want to expand my knowledge of English.",
                    "Practical knowledge is important for this job."
                ],
                "collocations": ["gain knowledge", "have knowledge of", "practical knowledge"],
                "ielts_tip": "Remember: the 'k' is silent! /ˈnɒl.ɪdʒ/"
            }
        ]
    },
    {
        "id": "foundation-unit4-grammar",
        "title": "Unit 4: Present Continuous for Now & Future",
        "band_level": "beginner",
        "type": "grammar",
        "unit_number": 4,
        "description": "Use present continuous for current actions and future plans",
        "ielts_relevance": "Essential for discussing what you're doing now and your plans.",
        "items": [
            {
                "id": "f4g1",
                "word": "Present Continuous - Now",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "am/is/are + verb-ing for actions happening right now",
                "examples": [
                    "I am studying for my IELTS exam.",
                    "She is learning English at the moment.",
                    "We are living in a temporary apartment."
                ],
                "grammar_formula": "Subject + am/is/are + verb-ing",
                "common_mistakes": ["I am study (wrong) → I am studying (correct)"],
                "ielts_band_impact": "Shows you can distinguish between habits (present simple) and current actions.",
                "practice_prompt": "Describe what you are doing this week."
            },
            {
                "id": "f4g2",
                "word": "Present Continuous - Future Plans",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use present continuous for definite future arrangements",
                "examples": [
                    "I am taking the IELTS test next month.",
                    "She is starting a new job on Monday.",
                    "We are moving to a new apartment soon."
                ],
                "grammar_formula": "Subject + am/is/are + verb-ing + future time",
                "common_mistakes": ["I am go tomorrow (wrong) → I am going tomorrow (correct)"],
                "ielts_band_impact": "Shows range - you can use different structures for future.",
                "practice_prompt": "Talk about your plans for the next few months."
            }
        ]
    },
    
    # Unit 5: Work & Jobs
    {
        "id": "foundation-unit5-vocab",
        "title": "Unit 5: Work & Jobs",
        "band_level": "beginner",
        "type": "vocabulary",
        "unit_number": 5,
        "description": "Essential vocabulary for discussing work and careers",
        "ielts_relevance": "Work is a core topic in Speaking Part 1 and Writing Task 2.",
        "items": [
            {
                "id": "f5v1",
                "word": "responsible for",
                "ipa": "/rɪˈspɒn.sə.bəl fɔːr/",
                "part_of_speech": "adjective + preposition",
                "stress_pattern": "re-SPON-si-ble for",
                "definition": "Having the duty to deal with something or control someone",
                "examples": [
                    "I am responsible for managing the team.",
                    "She is responsible for customer service.",
                    "Who is responsible for this project?"
                ],
                "collocations": ["responsible for managing", "responsible for the department"],
                "ielts_tip": "Use this to describe your job duties professionally."
            },
            {
                "id": "f5v2",
                "word": "colleague",
                "ipa": "/ˈkɒl.iːɡ/",
                "part_of_speech": "noun",
                "stress_pattern": "COL-league (stress on first syllable)",
                "definition": "A person you work with",
                "examples": [
                    "I have lunch with my colleagues every day.",
                    "She's a colleague from the marketing department.",
                    "I get along well with my colleagues."
                ],
                "collocations": ["work colleague", "former colleague", "close colleague"],
                "ielts_tip": "More professional than 'coworker' - good for IELTS."
            },
            {
                "id": "f5v3",
                "word": "salary",
                "ipa": "/ˈsæl.ər.i/",
                "part_of_speech": "noun",
                "stress_pattern": "SA-la-ry (stress on first syllable)",
                "definition": "The money you receive regularly for your work",
                "examples": [
                    "The job offers a good salary.",
                    "Salaries have increased this year.",
                    "She earns a high salary."
                ],
                "collocations": ["good salary", "monthly salary", "earn a salary"],
                "ielts_tip": "Use 'salary' for professional jobs, 'wages' for hourly work."
            },
            {
                "id": "f5v4",
                "word": "rewarding",
                "ipa": "/rɪˈwɔː.dɪŋ/",
                "part_of_speech": "adjective",
                "stress_pattern": "re-WAR-ding (stress on second syllable)",
                "definition": "Giving satisfaction; making you feel happy because you're doing something useful",
                "examples": [
                    "Teaching is a very rewarding job.",
                    "I find my work rewarding.",
                    "It's rewarding to help people."
                ],
                "collocations": ["rewarding career", "rewarding job", "very rewarding"],
                "ielts_tip": "Great for describing why you like your job."
            },
            {
                "id": "f5v5",
                "word": "challenging",
                "ipa": "/ˈtʃæl.ən.dʒɪŋ/",
                "part_of_speech": "adjective",
                "stress_pattern": "CHAL-len-ging (stress on first syllable)",
                "definition": "Difficult in a way that tests your ability",
                "examples": [
                    "My job is challenging but interesting.",
                    "Learning English can be challenging.",
                    "She enjoys challenging tasks."
                ],
                "collocations": ["challenging work", "challenging task", "very challenging"],
                "ielts_tip": "Use 'challenging' instead of 'difficult' - sounds more positive."
            }
        ]
    },
    {
        "id": "foundation-unit5-grammar",
        "title": "Unit 5: Comparatives & Superlatives",
        "band_level": "beginner",
        "type": "grammar",
        "unit_number": 5,
        "description": "Compare things and express the highest degree",
        "ielts_relevance": "Essential for Writing Task 1 (comparing data) and Speaking (giving opinions).",
        "items": [
            {
                "id": "f5g1",
                "word": "Comparatives",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Compare two things: adjective + -er OR more + adjective",
                "examples": [
                    "My new job is better than my old one.",
                    "Cities are more expensive than small towns.",
                    "Working from home is easier for me."
                ],
                "grammar_formula": "Short adj + -er + than | more + long adj + than",
                "common_mistakes": ["more better (wrong) → better (correct)", "more easy (wrong) → easier (correct)"],
                "ielts_band_impact": "Correct comparatives show grammar accuracy.",
                "practice_prompt": "Compare your current home to your childhood home."
            },
            {
                "id": "f5g2",
                "word": "Superlatives",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Express the highest degree: the + adjective + -est OR the most + adjective",
                "examples": [
                    "This is the best job I've ever had.",
                    "Shanghai is the most expensive city I've visited.",
                    "She's the hardest-working person in our team."
                ],
                "grammar_formula": "the + short adj + -est | the most + long adj",
                "common_mistakes": ["the most best (wrong) → the best (correct)"],
                "ielts_band_impact": "Using superlatives correctly adds range to your grammar.",
                "practice_prompt": "Describe the best experience you've had at work."
            }
        ]
    }
]

# ============================================================
# BAND 4.5-6.5 - DEVELOPMENT (5 Units)
# Focus: Range + Accuracy
# ============================================================

DEVELOPMENT_UNITS = [
    # Unit 1: Environment & Nature
    {
        "id": "development-unit1-vocab",
        "title": "Unit 1: Environment & Sustainability",
        "band_level": "intermediate",
        "type": "vocabulary",
        "unit_number": 1,
        "description": "Academic vocabulary for environmental topics - common in IELTS Writing Task 2",
        "ielts_relevance": "Environment is one of the most common Writing Task 2 topics.",
        "items": [
            {
                "id": "d1v1",
                "word": "sustainable",
                "ipa": "/səˈsteɪ.nə.bəl/",
                "part_of_speech": "adjective",
                "stress_pattern": "sus-TAI-na-ble (stress on second syllable)",
                "definition": "Able to continue over time without damaging the environment",
                "examples": [
                    "We need to develop sustainable energy sources.",
                    "Sustainable development is essential for future generations.",
                    "The company promotes sustainable business practices."
                ],
                "collocations": ["sustainable development", "sustainable energy", "environmentally sustainable"],
                "ielts_tip": "Key word for environmental essays - shows academic vocabulary."
            },
            {
                "id": "d1v2",
                "word": "emissions",
                "ipa": "/ɪˈmɪʃ.ənz/",
                "part_of_speech": "noun (plural)",
                "stress_pattern": "e-MI-ssions (stress on second syllable)",
                "definition": "Gases or substances sent out into the air",
                "examples": [
                    "Carbon emissions contribute to global warming.",
                    "The government aims to reduce emissions by 50%.",
                    "Vehicle emissions are a major source of pollution."
                ],
                "collocations": ["carbon emissions", "reduce emissions", "greenhouse gas emissions"],
                "ielts_tip": "Essential for discussing climate change topics."
            },
            {
                "id": "d1v3",
                "word": "renewable",
                "ipa": "/rɪˈnjuː.ə.bəl/",
                "part_of_speech": "adjective",
                "stress_pattern": "re-NEW-a-ble (stress on second syllable)",
                "definition": "Can be replaced naturally and is not used up",
                "examples": [
                    "Solar and wind are renewable energy sources.",
                    "Investment in renewable technology is increasing.",
                    "Renewable resources are better for the planet."
                ],
                "collocations": ["renewable energy", "renewable resources", "renewable sources"],
                "ielts_tip": "Contrasts with 'non-renewable' (fossil fuels)."
            },
            {
                "id": "d1v4",
                "word": "conservation",
                "ipa": "/ˌkɒn.səˈveɪ.ʃən/",
                "part_of_speech": "noun",
                "stress_pattern": "con-ser-VA-tion (stress on third syllable)",
                "definition": "The protection of natural resources and wildlife",
                "examples": [
                    "Wildlife conservation is crucial for biodiversity.",
                    "Energy conservation can reduce household bills.",
                    "The organization focuses on forest conservation."
                ],
                "collocations": ["wildlife conservation", "energy conservation", "water conservation"],
                "ielts_tip": "Shows you understand environmental protection vocabulary."
            },
            {
                "id": "d1v5",
                "word": "biodiversity",
                "ipa": "/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/",
                "part_of_speech": "noun",
                "stress_pattern": "bi-o-di-VER-si-ty (stress on fourth syllable)",
                "definition": "The variety of plant and animal life in a particular area",
                "examples": [
                    "Deforestation threatens biodiversity.",
                    "Protecting biodiversity is essential for ecosystem health.",
                    "The region is known for its rich biodiversity."
                ],
                "collocations": ["protect biodiversity", "rich biodiversity", "loss of biodiversity"],
                "ielts_tip": "Academic word that impresses examiners in Writing Task 2."
            }
        ]
    },
    {
        "id": "development-unit1-grammar",
        "title": "Unit 1: Present Perfect for Results",
        "band_level": "intermediate",
        "type": "grammar",
        "unit_number": 1,
        "description": "Use present perfect to connect past actions to present results",
        "ielts_relevance": "Essential for Writing Task 1 (trends) and Speaking Part 3 (discussing changes).",
        "items": [
            {
                "id": "d1g1",
                "word": "Present Perfect for Change",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use present perfect to describe changes that started in the past and continue now",
                "examples": [
                    "Pollution levels have increased significantly.",
                    "The government has introduced new environmental policies.",
                    "Technology has changed the way we communicate."
                ],
                "grammar_formula": "Subject + have/has + past participle",
                "common_mistakes": ["Pollution has increase (wrong) → Pollution has increased (correct)"],
                "ielts_band_impact": "Band 6+ requires accurate use of present perfect.",
                "practice_prompt": "Describe how the environment has changed in your country."
            },
            {
                "id": "d1g2",
                "word": "Present Perfect vs Past Simple",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Present perfect = no specific time | Past simple = specific time",
                "examples": [
                    "I have visited Japan. (experience, no specific time)",
                    "I visited Japan in 2019. (specific time)",
                    "The population has grown. (continuing relevance) | The population grew in 2020. (specific year)"
                ],
                "grammar_formula": "Present Perfect (general/continuing) vs Past Simple (specific time)",
                "common_mistakes": ["I have visited Japan last year (wrong) → I visited Japan last year (correct)"],
                "ielts_band_impact": "Distinguishing these tenses correctly shows grammar control.",
                "practice_prompt": "Compare: What changes have you seen? vs What happened in a specific year?"
            }
        ]
    },
    
    # Unit 2: Technology & Communication
    {
        "id": "development-unit2-vocab",
        "title": "Unit 2: Technology & Innovation",
        "band_level": "intermediate",
        "type": "vocabulary",
        "unit_number": 2,
        "description": "Essential vocabulary for discussing technology and its impact",
        "ielts_relevance": "Technology is a frequent topic in both Writing Task 2 and Speaking.",
        "items": [
            {
                "id": "d2v1",
                "word": "revolutionize",
                "ipa": "/ˌrev.əˈluː.ʃən.aɪz/",
                "part_of_speech": "verb",
                "stress_pattern": "re-vo-LU-tion-ize (stress on third syllable)",
                "definition": "To completely change the way something is done or thought about",
                "examples": [
                    "The internet has revolutionized communication.",
                    "Smartphones revolutionized how we access information.",
                    "AI is revolutionizing many industries."
                ],
                "collocations": ["revolutionize the way", "revolutionize the industry"],
                "ielts_tip": "Strong verb for discussing major changes - better than 'changed'."
            },
            {
                "id": "d2v2",
                "word": "advancement",
                "ipa": "/ədˈvɑːns.mənt/",
                "part_of_speech": "noun",
                "stress_pattern": "ad-VANCE-ment (stress on second syllable)",
                "definition": "Development or progress in technology, science, or knowledge",
                "examples": [
                    "Technological advancements have improved healthcare.",
                    "The advancement of AI raises ethical questions.",
                    "Recent advancements in medicine are remarkable."
                ],
                "collocations": ["technological advancement", "scientific advancement", "recent advancements"],
                "ielts_tip": "Academic noun - great for Writing Task 2 introductions."
            },
            {
                "id": "d2v3",
                "word": "accessible",
                "ipa": "/əkˈses.ə.bəl/",
                "part_of_speech": "adjective",
                "stress_pattern": "ac-CES-si-ble (stress on second syllable)",
                "definition": "Easy to reach, enter, or use",
                "examples": [
                    "The internet has made information more accessible.",
                    "Education should be accessible to everyone.",
                    "The website is accessible on mobile devices."
                ],
                "collocations": ["easily accessible", "accessible to everyone", "make something accessible"],
                "ielts_tip": "Key word for discussing equality and technology benefits."
            },
            {
                "id": "d2v4",
                "word": "dependent on",
                "ipa": "/dɪˈpen.dənt ɒn/",
                "part_of_speech": "adjective + preposition",
                "stress_pattern": "de-PEN-dent on",
                "definition": "Needing something or someone else to exist or succeed",
                "examples": [
                    "Modern society is heavily dependent on technology.",
                    "Young people have become dependent on their phones.",
                    "The economy is dependent on international trade."
                ],
                "collocations": ["heavily dependent", "increasingly dependent", "become dependent on"],
                "ielts_tip": "Useful for discussing negative aspects of technology."
            },
            {
                "id": "d2v5",
                "word": "virtual",
                "ipa": "/ˈvɜː.tʃu.əl/",
                "part_of_speech": "adjective",
                "stress_pattern": "VIR-tu-al (stress on first syllable)",
                "definition": "Created or existing on computers; not physical",
                "examples": [
                    "Virtual meetings have become common.",
                    "Many students prefer virtual learning.",
                    "The company offers virtual tours of their facilities."
                ],
                "collocations": ["virtual meeting", "virtual reality", "virtual learning"],
                "ielts_tip": "Very relevant vocabulary for discussing modern work and education."
            }
        ]
    },
    {
        "id": "development-unit2-grammar",
        "title": "Unit 2: Passive Voice for Formal Writing",
        "band_level": "intermediate",
        "type": "grammar",
        "unit_number": 2,
        "description": "Use passive voice for formal, academic writing",
        "ielts_relevance": "Essential for Writing Task 1 (processes) and Task 2 (formal style).",
        "items": [
            {
                "id": "d2g1",
                "word": "Passive Voice - Present",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Focus on the action, not who does it: is/are + past participle",
                "examples": [
                    "Smartphones are used by billions of people.",
                    "New technologies are developed every year.",
                    "Personal data is collected by many websites."
                ],
                "grammar_formula": "Subject + is/are + past participle (+ by agent)",
                "common_mistakes": ["Smartphones are use (wrong) → Smartphones are used (correct)"],
                "ielts_band_impact": "Passive voice is expected in formal IELTS writing.",
                "practice_prompt": "Describe how technology is used in education."
            },
            {
                "id": "d2g2",
                "word": "Passive Voice - Past",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Describe past actions formally: was/were + past participle",
                "examples": [
                    "The internet was invented in the late 20th century.",
                    "Computers were first developed for military purposes.",
                    "The policy was introduced in 2020."
                ],
                "grammar_formula": "Subject + was/were + past participle",
                "common_mistakes": ["The internet was invent (wrong) → The internet was invented (correct)"],
                "ielts_band_impact": "Using passive correctly in Writing Task 1 improves grammar score.",
                "practice_prompt": "Describe how a technology was developed or introduced."
            }
        ]
    },
    
    # Unit 3: Health & Lifestyle
    {
        "id": "development-unit3-vocab",
        "title": "Unit 3: Health & Lifestyle",
        "band_level": "intermediate",
        "type": "vocabulary",
        "unit_number": 3,
        "description": "Vocabulary for discussing health, fitness, and lifestyle choices",
        "ielts_relevance": "Health is a common topic in Speaking Part 2/3 and Writing Task 2.",
        "items": [
            {
                "id": "d3v1",
                "word": "sedentary",
                "ipa": "/ˈsed.ən.tər.i/",
                "part_of_speech": "adjective",
                "stress_pattern": "SE-den-ta-ry (stress on first syllable)",
                "definition": "Involving a lot of sitting; not physically active",
                "examples": [
                    "Office workers often have sedentary lifestyles.",
                    "Sedentary behavior increases health risks.",
                    "Children are becoming more sedentary due to screen time."
                ],
                "collocations": ["sedentary lifestyle", "sedentary job", "sedentary behavior"],
                "ielts_tip": "Academic word for describing inactive lifestyles - impresses examiners."
            },
            {
                "id": "d3v2",
                "word": "obesity",
                "ipa": "/əʊˈbiː.sə.ti/",
                "part_of_speech": "noun",
                "stress_pattern": "o-BE-si-ty (stress on second syllable)",
                "definition": "The condition of being very overweight in a way that is dangerous for health",
                "examples": [
                    "Childhood obesity is a growing concern.",
                    "Obesity rates have increased dramatically.",
                    "The government is tackling the obesity epidemic."
                ],
                "collocations": ["childhood obesity", "obesity rates", "obesity epidemic"],
                "ielts_tip": "Key term for health-related Writing Task 2 questions."
            },
            {
                "id": "d3v3",
                "word": "well-being",
                "ipa": "/ˌwelˈbiː.ɪŋ/",
                "part_of_speech": "noun",
                "stress_pattern": "well-BE-ing (stress on second syllable)",
                "definition": "The state of feeling healthy and happy",
                "examples": [
                    "Exercise improves mental well-being.",
                    "Companies should prioritize employee well-being.",
                    "Social connections are important for well-being."
                ],
                "collocations": ["mental well-being", "physical well-being", "sense of well-being"],
                "ielts_tip": "Covers both physical AND mental health - versatile word."
            },
            {
                "id": "d3v4",
                "word": "nutritious",
                "ipa": "/njuːˈtrɪʃ.əs/",
                "part_of_speech": "adjective",
                "stress_pattern": "nu-TRI-tious (stress on second syllable)",
                "definition": "Containing substances your body needs to stay healthy",
                "examples": [
                    "Children need nutritious meals for growth.",
                    "Fast food is rarely nutritious.",
                    "A nutritious diet includes fruits and vegetables."
                ],
                "collocations": ["nutritious food", "nutritious diet", "nutritious meals"],
                "ielts_tip": "Better than 'healthy food' - shows vocabulary range."
            },
            {
                "id": "d3v5",
                "word": "detrimental",
                "ipa": "/ˌdet.rɪˈmen.təl/",
                "part_of_speech": "adjective",
                "stress_pattern": "de-tri-MEN-tal (stress on third syllable)",
                "definition": "Causing harm or damage",
                "examples": [
                    "Smoking is detrimental to health.",
                    "Excessive screen time can be detrimental to children.",
                    "Stress has a detrimental effect on the immune system."
                ],
                "collocations": ["detrimental effect", "detrimental to health", "detrimental impact"],
                "ielts_tip": "Academic alternative to 'bad' or 'harmful'."
            }
        ]
    },
    {
        "id": "development-unit3-grammar",
        "title": "Unit 3: Conditionals (Zero & First)",
        "band_level": "intermediate",
        "type": "grammar",
        "unit_number": 3,
        "description": "Use conditionals to discuss cause and effect, and possible futures",
        "ielts_relevance": "Conditionals are essential for Writing Task 2 and Speaking Part 3.",
        "items": [
            {
                "id": "d3g1",
                "word": "Zero Conditional",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "For facts and things that are always true: If + present, present",
                "examples": [
                    "If you don't exercise, you gain weight.",
                    "If people eat too much sugar, they become unhealthy.",
                    "Water boils if you heat it to 100°C."
                ],
                "grammar_formula": "If + present simple, present simple",
                "common_mistakes": ["If you don't exercise, you will gain weight (this changes to 1st conditional - different meaning)"],
                "ielts_band_impact": "Zero conditional shows you can express general truths accurately.",
                "practice_prompt": "Describe what happens if people don't look after their health."
            },
            {
                "id": "d3g2",
                "word": "First Conditional",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "For possible future situations: If + present, will + verb",
                "examples": [
                    "If the government invests in healthcare, people will be healthier.",
                    "If we don't address obesity, healthcare costs will increase.",
                    "People will live longer if they exercise regularly."
                ],
                "grammar_formula": "If + present simple, will + base verb",
                "common_mistakes": ["If the government will invest (wrong) → If the government invests (correct)"],
                "ielts_band_impact": "First conditional is essential for discussing solutions in Writing Task 2.",
                "practice_prompt": "Discuss what will happen if health education improves in schools."
            }
        ]
    },
    
    # Unit 4: Education & Society
    {
        "id": "development-unit4-vocab",
        "title": "Unit 4: Education & Society",
        "band_level": "intermediate",
        "type": "vocabulary",
        "unit_number": 4,
        "description": "Academic vocabulary for discussing education systems and societal issues",
        "ielts_relevance": "Education is a major Writing Task 2 topic category.",
        "items": [
            {
                "id": "d4v1",
                "word": "curriculum",
                "ipa": "/kəˈrɪk.jə.ləm/",
                "part_of_speech": "noun",
                "stress_pattern": "cur-RI-cu-lum (stress on second syllable)",
                "definition": "The subjects and content taught in a school or course",
                "examples": [
                    "The school curriculum includes science and arts.",
                    "Some argue the curriculum should be more practical.",
                    "Changes to the national curriculum were announced."
                ],
                "collocations": ["school curriculum", "national curriculum", "curriculum reform"],
                "ielts_tip": "Essential word for education essays - very academic."
            },
            {
                "id": "d4v2",
                "word": "compulsory",
                "ipa": "/kəmˈpʌl.sər.i/",
                "part_of_speech": "adjective",
                "stress_pattern": "com-PUL-so-ry (stress on second syllable)",
                "definition": "Required by law or rule; obligatory",
                "examples": [
                    "Education is compulsory until age 16 in many countries.",
                    "Should PE be compulsory in schools?",
                    "The course includes both compulsory and optional modules."
                ],
                "collocations": ["compulsory education", "compulsory subject", "make something compulsory"],
                "ielts_tip": "Use instead of 'required' or 'mandatory' for variety."
            },
            {
                "id": "d4v3",
                "word": "inequality",
                "ipa": "/ˌɪn.ɪˈkwɒl.ə.ti/",
                "part_of_speech": "noun",
                "stress_pattern": "in-e-QUA-li-ty (stress on third syllable)",
                "definition": "Unfair differences between groups in society",
                "examples": [
                    "Educational inequality affects social mobility.",
                    "Income inequality has increased in recent decades.",
                    "Gender inequality remains a global issue."
                ],
                "collocations": ["social inequality", "income inequality", "reduce inequality"],
                "ielts_tip": "Key concept for discussing social issues in Writing Task 2."
            },
            {
                "id": "d4v4",
                "word": "attain",
                "ipa": "/əˈteɪn/",
                "part_of_speech": "verb",
                "stress_pattern": "at-TAIN (stress on second syllable)",
                "definition": "To succeed in achieving something, especially after effort",
                "examples": [
                    "Not all students attain high grades.",
                    "She attained her goal of becoming a doctor.",
                    "The country has attained economic stability."
                ],
                "collocations": ["attain a goal", "attain success", "attain a level"],
                "ielts_tip": "More formal than 'achieve' or 'get' - good for academic writing."
            },
            {
                "id": "d4v5",
                "word": "profound",
                "ipa": "/prəˈfaʊnd/",
                "part_of_speech": "adjective",
                "stress_pattern": "pro-FOUND (stress on second syllable)",
                "definition": "Very great or strong; having deep meaning",
                "examples": [
                    "Education has a profound impact on life outcomes.",
                    "The internet has had a profound effect on society.",
                    "There are profound differences between the two systems."
                ],
                "collocations": ["profound impact", "profound effect", "profound change"],
                "ielts_tip": "Impressive alternative to 'big' or 'significant'."
            }
        ]
    },
    {
        "id": "development-unit4-grammar",
        "title": "Unit 4: Relative Clauses",
        "band_level": "intermediate",
        "type": "grammar",
        "unit_number": 4,
        "description": "Use relative clauses to add information and create complex sentences",
        "ielts_relevance": "Complex sentences with relative clauses are required for Band 6+.",
        "items": [
            {
                "id": "d4g1",
                "word": "Defining Relative Clauses",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Essential information - uses who, which, that without commas",
                "examples": [
                    "Students who study regularly get better results.",
                    "Schools that have more resources perform better.",
                    "The teacher who taught me English was excellent."
                ],
                "grammar_formula": "Noun + who/which/that + clause (no commas)",
                "common_mistakes": ["Students, who study regularly, (wrong for essential info) → Students who study regularly (correct)"],
                "ielts_band_impact": "Using relative clauses correctly adds complexity.",
                "practice_prompt": "Describe the type of teacher who is most effective."
            },
            {
                "id": "d4g2",
                "word": "Non-defining Relative Clauses",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Extra information - uses who, which (not 'that') with commas",
                "examples": [
                    "My university, which is in the city center, has excellent facilities.",
                    "My teacher, who has 20 years' experience, is very helpful.",
                    "The exam, which took place in May, was challenging."
                ],
                "grammar_formula": "Noun, + who/which + clause + , (with commas)",
                "common_mistakes": ["My university that is in the city center (wrong for extra info) → My university, which is..., (correct)"],
                "ielts_band_impact": "Shows sophisticated grammar control.",
                "practice_prompt": "Describe your school/university using non-defining relative clauses."
            }
        ]
    },
    
    # Unit 5: Phrasal Verbs & Idiomatic Language
    {
        "id": "development-unit5-vocab",
        "title": "Unit 5: Academic Phrasal Verbs",
        "band_level": "intermediate",
        "type": "phrasal_verbs",
        "unit_number": 5,
        "description": "Common phrasal verbs used in academic and IELTS contexts",
        "ielts_relevance": "Using phrasal verbs naturally shows language proficiency.",
        "items": [
            {
                "id": "d5v1",
                "word": "carry out",
                "ipa": "/ˈkær.i aʊt/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "CAR-ry out",
                "definition": "To do or complete something, especially something planned",
                "examples": [
                    "Scientists carry out experiments to test theories.",
                    "The government carried out a survey.",
                    "Researchers carry out studies on various topics."
                ],
                "collocations": ["carry out research", "carry out a survey", "carry out an experiment"],
                "ielts_tip": "Very common in academic writing - essential for Task 1 and 2."
            },
            {
                "id": "d5v2",
                "word": "bring about",
                "ipa": "/brɪŋ əˈbaʊt/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "bring aBOUT",
                "definition": "To cause something to happen",
                "examples": [
                    "Technology has brought about major changes.",
                    "The new policy brought about improvements in education.",
                    "What factors bring about climate change?"
                ],
                "collocations": ["bring about change", "bring about improvement"],
                "ielts_tip": "Use instead of 'cause' for variety in Writing Task 2."
            },
            {
                "id": "d5v3",
                "word": "point out",
                "ipa": "/pɔɪnt aʊt/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "point OUT",
                "definition": "To tell someone something; to direct attention to something",
                "examples": [
                    "Critics point out that the plan has weaknesses.",
                    "I would like to point out that costs have increased.",
                    "The report points out several key issues."
                ],
                "collocations": ["point out that", "point out a problem", "important to point out"],
                "ielts_tip": "Useful for presenting arguments or highlighting issues."
            },
            {
                "id": "d5v4",
                "word": "come up with",
                "ipa": "/kʌm ʌp wɪð/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "come UP with",
                "definition": "To think of an idea, plan, or solution",
                "examples": [
                    "Scientists came up with a new theory.",
                    "The team needs to come up with creative solutions.",
                    "Can you come up with any alternatives?"
                ],
                "collocations": ["come up with a solution", "come up with an idea"],
                "ielts_tip": "Natural alternative to 'think of' or 'create'."
            },
            {
                "id": "d5v5",
                "word": "deal with",
                "ipa": "/diːl wɪð/",
                "part_of_speech": "phrasal verb",
                "stress_pattern": "DEAL with",
                "definition": "To take action to solve a problem or handle a situation",
                "examples": [
                    "Governments must deal with climate change.",
                    "How should we deal with this issue?",
                    "The essay deals with the topic of education."
                ],
                "collocations": ["deal with a problem", "deal with an issue", "deal with challenges"],
                "ielts_tip": "Essential for discussing problems and solutions."
            }
        ]
    },
    {
        "id": "development-unit5-grammar",
        "title": "Unit 5: Modals for Speculation",
        "band_level": "intermediate",
        "type": "grammar",
        "unit_number": 5,
        "description": "Use modal verbs to express possibility, certainty, and speculation",
        "ielts_relevance": "Modals are essential for Writing Task 2 and Speaking Part 3.",
        "items": [
            {
                "id": "d5g1",
                "word": "Modals of Possibility",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "May, might, could to express possibility",
                "examples": [
                    "Technology may replace some jobs in the future.",
                    "This approach might not work for everyone.",
                    "Online learning could become more popular."
                ],
                "grammar_formula": "Subject + may/might/could + base verb",
                "common_mistakes": ["Technology may to replace (wrong) → Technology may replace (correct)"],
                "ielts_band_impact": "Using modals shows you can express uncertainty appropriately.",
                "practice_prompt": "Discuss what might happen to education in the future."
            },
            {
                "id": "d5g2",
                "word": "Modals of Certainty",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Must, can't for strong conclusions",
                "examples": [
                    "This must be a priority for governments.",
                    "We can't ignore these problems.",
                    "Education must be accessible to all."
                ],
                "grammar_formula": "Subject + must/can't + base verb",
                "common_mistakes": ["This must to be (wrong) → This must be (correct)"],
                "ielts_band_impact": "Shows you can express strong opinions appropriately.",
                "practice_prompt": "Discuss what governments must do to improve education."
            }
        ]
    }
]

# ============================================================
# BAND 6.5+ - ADVANCED (5 Units)
# Focus: Precision, Nuance, Examiner Language
# ============================================================

ADVANCED_UNITS = [
    # Unit 1: Sophisticated Academic Vocabulary
    {
        "id": "advanced-unit1-vocab",
        "title": "Unit 1: High-Level Academic Vocabulary",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 1,
        "description": "Sophisticated vocabulary that demonstrates Band 7+ lexical resource",
        "ielts_relevance": "These words signal advanced language proficiency to examiners.",
        "items": [
            {
                "id": "a1v1",
                "word": "unprecedented",
                "ipa": "/ʌnˈpres.ɪ.den.tɪd/",
                "part_of_speech": "adjective",
                "stress_pattern": "un-PRE-ce-den-ted (stress on second syllable)",
                "definition": "Never having happened or existed before",
                "examples": [
                    "The pandemic caused unprecedented disruption to education.",
                    "We are facing unprecedented challenges.",
                    "The company achieved unprecedented growth."
                ],
                "collocations": ["unprecedented levels", "unprecedented change", "unprecedented challenges"],
                "ielts_tip": "Perfect for discussing major changes or new situations."
            },
            {
                "id": "a1v2",
                "word": "exacerbate",
                "ipa": "/ɪɡˈzæs.ə.beɪt/",
                "part_of_speech": "verb",
                "stress_pattern": "ex-A-cer-bate (stress on second syllable)",
                "definition": "To make a problem or bad situation worse",
                "examples": [
                    "Social media can exacerbate mental health issues.",
                    "The policy may exacerbate inequality.",
                    "Climate change exacerbates natural disasters."
                ],
                "collocations": ["exacerbate the problem", "exacerbate inequality", "exacerbate the situation"],
                "ielts_tip": "Sophisticated alternative to 'make worse' - impresses examiners."
            },
            {
                "id": "a1v3",
                "word": "ubiquitous",
                "ipa": "/juːˈbɪk.wɪ.təs/",
                "part_of_speech": "adjective",
                "stress_pattern": "u-BI-qui-tous (stress on second syllable)",
                "definition": "Present, appearing, or found everywhere",
                "examples": [
                    "Smartphones have become ubiquitous in modern life.",
                    "Social media is now ubiquitous among young people.",
                    "The ubiquitous use of plastic is an environmental concern."
                ],
                "collocations": ["ubiquitous presence", "ubiquitous use", "become ubiquitous"],
                "ielts_tip": "Impressive word for discussing widespread phenomena."
            },
            {
                "id": "a1v4",
                "word": "mitigate",
                "ipa": "/ˈmɪt.ɪ.ɡeɪt/",
                "part_of_speech": "verb",
                "stress_pattern": "MI-ti-gate (stress on first syllable)",
                "definition": "To make something less harmful, serious, or painful",
                "examples": [
                    "Measures to mitigate climate change are essential.",
                    "Education can mitigate the effects of poverty.",
                    "Technology can help mitigate some of these problems."
                ],
                "collocations": ["mitigate the effects", "mitigate risks", "mitigate the impact"],
                "ielts_tip": "Academic verb for discussing solutions - Band 7+ vocabulary."
            },
            {
                "id": "a1v5",
                "word": "paradigm",
                "ipa": "/ˈpær.ə.daɪm/",
                "part_of_speech": "noun",
                "stress_pattern": "PA-ra-digm (stress on first syllable)",
                "definition": "A typical example or pattern; a model or framework for understanding",
                "examples": [
                    "The internet represents a paradigm shift in communication.",
                    "This challenges the traditional paradigm of education.",
                    "A new paradigm for healthcare is emerging."
                ],
                "collocations": ["paradigm shift", "new paradigm", "traditional paradigm"],
                "ielts_tip": "'Paradigm shift' is a powerful phrase for discussing major changes."
            }
        ]
    },
    {
        "id": "advanced-unit1-grammar",
        "title": "Unit 1: Inversion for Emphasis",
        "band_level": "advanced",
        "type": "grammar",
        "unit_number": 1,
        "description": "Use inverted structures for emphasis and formal style",
        "ielts_relevance": "Inversion demonstrates sophisticated grammar control for Band 7+.",
        "items": [
            {
                "id": "a1g1",
                "word": "Negative Adverbial Inversion",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Place negative adverbs at the start with inverted word order for emphasis",
                "examples": [
                    "Never have we faced such challenges.",
                    "Not only does technology improve efficiency, but it also creates jobs.",
                    "Rarely do students achieve Band 9."
                ],
                "grammar_formula": "Negative adverb + auxiliary + subject + main verb",
                "common_mistakes": ["Never we have faced (wrong) → Never have we faced (correct)"],
                "ielts_band_impact": "Inversion is a clear indicator of Band 7+ grammar.",
                "practice_prompt": "Rewrite: 'We have never seen such rapid change' using inversion."
            },
            {
                "id": "a1g2",
                "word": "Only + Inversion",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use 'only' at the start with inversion for emphasis",
                "examples": [
                    "Only by working together can we solve these problems.",
                    "Only when governments take action will change occur.",
                    "Only through education can inequality be reduced."
                ],
                "grammar_formula": "Only + (by/when/through) + inversion in main clause",
                "common_mistakes": ["Only by working together we can solve (wrong) → Only by working together can we solve (correct)"],
                "ielts_band_impact": "Shows sophisticated control of complex structures.",
                "practice_prompt": "Write a sentence using 'Only by...' about solving an environmental problem."
            }
        ]
    },
    
    # Unit 2: Advanced Idiomatic Language
    {
        "id": "advanced-unit2-vocab",
        "title": "Unit 2: Sophisticated Phrases & Collocations",
        "band_level": "advanced",
        "type": "phrases",
        "unit_number": 2,
        "description": "High-level expressions that demonstrate native-like fluency",
        "ielts_relevance": "Natural expressions show lexical sophistication for Band 7+.",
        "items": [
            {
                "id": "a2v1",
                "word": "a double-edged sword",
                "ipa": "/ə ˈdʌb.əl edʒd sɔːd/",
                "part_of_speech": "idiom",
                "stress_pattern": "a DOUBLE-EDGED SWORD",
                "definition": "Something that has both advantages and disadvantages",
                "examples": [
                    "Social media is a double-edged sword for mental health.",
                    "Globalization is often described as a double-edged sword.",
                    "Technology can be a double-edged sword in education."
                ],
                "collocations": ["is a double-edged sword", "proves to be a double-edged sword"],
                "ielts_tip": "Perfect for discussing topics with both positive and negative aspects."
            },
            {
                "id": "a2v2",
                "word": "shed light on",
                "ipa": "/ʃed laɪt ɒn/",
                "part_of_speech": "phrase",
                "stress_pattern": "shed LIGHT on",
                "definition": "To help explain or clarify something",
                "examples": [
                    "The research sheds light on the causes of obesity.",
                    "This study sheds light on changing social attitudes.",
                    "New evidence has shed light on the problem."
                ],
                "collocations": ["shed light on the issue", "shed light on the problem"],
                "ielts_tip": "Academic phrase - great for discussing research or explanations."
            },
            {
                "id": "a2v3",
                "word": "far-reaching consequences",
                "ipa": "/fɑːr ˈriː.tʃɪŋ ˈkɒn.sɪ.kwən.sɪz/",
                "part_of_speech": "phrase",
                "stress_pattern": "far-REACHING CON-se-quen-ces",
                "definition": "Effects that affect many things or will last a long time",
                "examples": [
                    "Climate change will have far-reaching consequences.",
                    "The decision has far-reaching consequences for education.",
                    "This policy could have far-reaching consequences."
                ],
                "collocations": ["have far-reaching consequences", "far-reaching implications"],
                "ielts_tip": "Impressive phrase for discussing major impacts."
            },
            {
                "id": "a2v4",
                "word": "to a large extent",
                "ipa": "/tuː ə lɑːdʒ ɪkˈstent/",
                "part_of_speech": "phrase",
                "stress_pattern": "to a LARGE ex-TENT",
                "definition": "Mostly; to a great degree",
                "examples": [
                    "To a large extent, I agree with this view.",
                    "Success depends, to a large extent, on hard work.",
                    "The policy has been, to a large extent, successful."
                ],
                "collocations": ["to a large extent, ...", "depends to a large extent on"],
                "ielts_tip": "Great for partial agreement in Writing Task 2."
            },
            {
                "id": "a2v5",
                "word": "it is widely acknowledged that",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "it is WIDE-ly ac-KNOW-ledged that",
                "definition": "It is generally accepted/recognized that",
                "examples": [
                    "It is widely acknowledged that education is crucial for development.",
                    "It is widely acknowledged that climate change is a serious threat.",
                    "It is widely acknowledged that technology has transformed society."
                ],
                "collocations": ["it is widely acknowledged that...", "as is widely acknowledged"],
                "ielts_tip": "Formal alternative to 'everyone knows' - excellent for essay introductions."
            }
        ]
    },
    {
        "id": "advanced-unit2-grammar",
        "title": "Unit 2: Cleft Sentences for Emphasis",
        "band_level": "advanced",
        "type": "grammar",
        "unit_number": 2,
        "description": "Use cleft sentences to emphasize specific information",
        "ielts_relevance": "Cleft sentences demonstrate sophisticated grammar for Band 7+.",
        "items": [
            {
                "id": "a2g1",
                "word": "It-Cleft Sentences",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use 'It is/was... that/who' to emphasize specific information",
                "examples": [
                    "It is education that transforms societies.",
                    "It was the government that introduced this policy.",
                    "It is only through cooperation that we can succeed."
                ],
                "grammar_formula": "It + is/was + focused element + that/who + rest of sentence",
                "common_mistakes": ["It is education which transforms (informal) → It is education that transforms (formal)"],
                "ielts_band_impact": "Cleft sentences show sophisticated grammar manipulation.",
                "practice_prompt": "Emphasize 'technology' in: 'Technology has changed communication.'"
            },
            {
                "id": "a2g2",
                "word": "What-Cleft Sentences",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use 'What... is/was' to emphasize actions or ideas",
                "examples": [
                    "What concerns me is the lack of progress.",
                    "What we need is a complete change in approach.",
                    "What the government should do is invest in education."
                ],
                "grammar_formula": "What + clause + is/was + focused element",
                "common_mistakes": ["What concerns me are (wrong with plural) → What concerns me is (correct - 'what' takes singular)"],
                "ielts_band_impact": "Shows ability to manipulate sentence structure for effect.",
                "practice_prompt": "Rewrite: 'We need more investment in healthcare' using a what-cleft."
            }
        ]
    },
    
    # Unit 3: Advanced Argumentation
    {
        "id": "advanced-unit3-vocab",
        "title": "Unit 3: Language for Academic Arguments",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 3,
        "description": "Vocabulary and phrases for constructing sophisticated arguments",
        "ielts_relevance": "Essential for achieving Band 7+ in Writing Task 2.",
        "items": [
            {
                "id": "a3v1",
                "word": "it could be argued that",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "it COULD be AR-gued that",
                "definition": "A way to introduce an argument or viewpoint",
                "examples": [
                    "It could be argued that technology does more harm than good.",
                    "It could be argued that traditional methods are still effective.",
                    "While it could be argued that..., I believe..."
                ],
                "collocations": ["it could be argued that", "one could argue that"],
                "ielts_tip": "Perfect for introducing counterarguments in essays."
            },
            {
                "id": "a3v2",
                "word": "there is a growing consensus that",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "there is a GROW-ing con-SEN-sus that",
                "definition": "More and more people agree that...",
                "examples": [
                    "There is a growing consensus that climate action is urgent.",
                    "There is a growing consensus that education needs reform.",
                    "While there is a growing consensus that..., some disagree."
                ],
                "collocations": ["there is a growing consensus", "the growing consensus is"],
                "ielts_tip": "Strong phrase for stating widely-held views."
            },
            {
                "id": "a3v3",
                "word": "notwithstanding",
                "ipa": "/ˌnɒt.wɪðˈstæn.dɪŋ/",
                "part_of_speech": "preposition/adverb",
                "stress_pattern": "not-with-STAN-ding (stress on third syllable)",
                "definition": "In spite of; despite",
                "examples": [
                    "Notwithstanding these challenges, progress has been made.",
                    "The project succeeded, notwithstanding initial difficulties.",
                    "Notwithstanding the criticism, the policy was implemented."
                ],
                "collocations": ["notwithstanding this", "notwithstanding the fact that"],
                "ielts_tip": "Very formal alternative to 'despite' - shows academic style."
            },
            {
                "id": "a3v4",
                "word": "inherent",
                "ipa": "/ɪnˈher.ənt/",
                "part_of_speech": "adjective",
                "stress_pattern": "in-HE-rent (stress on second syllable)",
                "definition": "Existing as a natural or basic part of something",
                "examples": [
                    "There are inherent risks in this approach.",
                    "The system has inherent flaws.",
                    "Creativity is inherent in human nature."
                ],
                "collocations": ["inherent risk", "inherent flaw", "inherent in"],
                "ielts_tip": "Academic word for discussing natural characteristics."
            },
            {
                "id": "a3v5",
                "word": "paradoxically",
                "ipa": "/ˌpær.əˈdɒk.sɪ.kəl.i/",
                "part_of_speech": "adverb",
                "stress_pattern": "pa-ra-DOX-i-cal-ly (stress on third syllable)",
                "definition": "In a way that seems contradictory but may be true",
                "examples": [
                    "Paradoxically, more choice can lead to less happiness.",
                    "Paradoxically, technology can both connect and isolate people.",
                    "The policy, paradoxically, had the opposite effect."
                ],
                "collocations": ["paradoxically, ...", "somewhat paradoxically"],
                "ielts_tip": "Sophisticated way to introduce surprising contrasts."
            }
        ]
    },
    {
        "id": "advanced-unit3-grammar",
        "title": "Unit 3: Mixed & Third Conditionals",
        "band_level": "advanced",
        "type": "grammar",
        "unit_number": 3,
        "description": "Use complex conditionals to discuss hypothetical situations",
        "ielts_relevance": "Complex conditionals demonstrate grammar sophistication for Band 7+.",
        "items": [
            {
                "id": "a3g1",
                "word": "Third Conditional",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "For unreal past situations: If + past perfect, would have + past participle",
                "examples": [
                    "If governments had acted earlier, climate change would have been less severe.",
                    "If the policy had been implemented, the outcome would have been different.",
                    "The situation would have been worse if no action had been taken."
                ],
                "grammar_formula": "If + had + past participle, would have + past participle",
                "common_mistakes": ["If governments would have acted (wrong) → If governments had acted (correct)"],
                "ielts_band_impact": "Third conditionals show sophisticated grammar control.",
                "practice_prompt": "Discuss what would have happened if technology had not advanced."
            },
            {
                "id": "a3g2",
                "word": "Mixed Conditionals",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Combine different time frames: past condition → present result OR present condition → past result",
                "examples": [
                    "If I had studied harder at school, I would be a doctor now. (past → present)",
                    "If she were more careful, she wouldn't have made that mistake. (general → past)",
                    "If they had invested in renewable energy, we would have cleaner air today."
                ],
                "grammar_formula": "If + past perfect, would + base verb (past → present) OR If + past simple, would have + past participle (present → past)",
                "common_mistakes": ["Mixing the wrong time frames - practice both patterns separately first"],
                "ielts_band_impact": "Mixed conditionals are a clear Band 7+ indicator.",
                "practice_prompt": "Write about how a past decision affects your present situation."
            }
        ]
    },
    
    # Unit 4: Hedging & Cautious Language
    {
        "id": "advanced-unit4-vocab",
        "title": "Unit 4: Hedging & Academic Caution",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 4,
        "description": "Language for expressing caution, uncertainty, and nuance",
        "ielts_relevance": "Hedging shows academic maturity and avoids overgeneralization.",
        "items": [
            {
                "id": "a4v1",
                "word": "tend to",
                "ipa": "/tend tuː/",
                "part_of_speech": "verb phrase",
                "stress_pattern": "TEND to",
                "definition": "Usually do something; be likely to",
                "examples": [
                    "Young people tend to be more adaptable to technology.",
                    "Developed countries tend to have better healthcare.",
                    "Students tend to perform better with personalized learning."
                ],
                "collocations": ["tend to do", "tend to be", "people tend to"],
                "ielts_tip": "Use to avoid overgeneralization - shows academic caution."
            },
            {
                "id": "a4v2",
                "word": "arguably",
                "ipa": "/ˈɑː.ɡju.ə.bli/",
                "part_of_speech": "adverb",
                "stress_pattern": "AR-gu-ab-ly (stress on first syllable)",
                "definition": "It can be argued that; possibly",
                "examples": [
                    "This is arguably the most important issue of our time.",
                    "Smartphones are arguably the most influential invention.",
                    "Education is arguably the key to social mobility."
                ],
                "collocations": ["arguably the most", "arguably one of"],
                "ielts_tip": "Shows you recognize other viewpoints exist."
            },
            {
                "id": "a4v3",
                "word": "to some extent",
                "ipa": "/tuː sʌm ɪkˈstent/",
                "part_of_speech": "phrase",
                "stress_pattern": "to SOME ex-TENT",
                "definition": "Partly; to a degree",
                "examples": [
                    "To some extent, I agree with this argument.",
                    "This is true to some extent.",
                    "The policy has succeeded to some extent."
                ],
                "collocations": ["to some extent, ...", "true to some extent"],
                "ielts_tip": "Use for partial agreement - nuanced thinking."
            },
            {
                "id": "a4v4",
                "word": "it appears that",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "it ap-PEARS that",
                "definition": "It seems that (based on evidence)",
                "examples": [
                    "It appears that younger generations are more environmentally conscious.",
                    "From the data, it appears that the policy is working.",
                    "It appears that technology has both benefits and drawbacks."
                ],
                "collocations": ["it appears that", "it would appear that"],
                "ielts_tip": "Cautious way to present findings or conclusions."
            },
            {
                "id": "a4v5",
                "word": "the extent to which",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "the ex-TENT to WHICH",
                "definition": "How much; the degree to which",
                "examples": [
                    "The extent to which technology helps education is debatable.",
                    "It depends on the extent to which people are willing to change.",
                    "The extent to which this is true varies by country."
                ],
                "collocations": ["the extent to which...", "depends on the extent to which"],
                "ielts_tip": "Academic phrase for discussing degrees or amounts."
            }
        ]
    },
    {
        "id": "advanced-unit4-grammar",
        "title": "Unit 4: Nominalisation",
        "band_level": "advanced",
        "type": "grammar",
        "unit_number": 4,
        "description": "Convert verbs/adjectives to nouns for academic style",
        "ielts_relevance": "Nominalisation creates more formal, academic writing.",
        "items": [
            {
                "id": "a4g1",
                "word": "Verb to Noun Conversion",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Change verbs to noun forms for formal writing",
                "examples": [
                    "develop → development: 'The development of technology has accelerated.'",
                    "improve → improvement: 'Improvement in healthcare is essential.'",
                    "globalise → globalisation: 'Globalisation has changed economies.'"
                ],
                "grammar_formula": "Verb → Noun form (-tion, -ment, -ance, -ness)",
                "common_mistakes": ["Using verbs when nouns are more appropriate in formal writing"],
                "ielts_band_impact": "Nominalisation is a key feature of academic Band 7+ writing.",
                "practice_prompt": "Rewrite: 'When technology develops, society changes' using nominalisation."
            },
            {
                "id": "a4g2",
                "word": "Creating Noun Phrases",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Build complex noun phrases for dense academic writing",
                "examples": [
                    "'People are increasingly using technology' → 'The increasing use of technology'",
                    "'The environment has deteriorated rapidly' → 'The rapid deterioration of the environment'",
                    "'Students are not participating' → 'The lack of student participation'"
                ],
                "grammar_formula": "Article + adjective + noun + of + noun phrase",
                "common_mistakes": ["Over-nominalising makes text hard to read - balance is key"],
                "ielts_band_impact": "Shows sophisticated control of academic style.",
                "practice_prompt": "Nominalise: 'Cities are expanding rapidly and this affects the environment.'"
            }
        ]
    },
    
    # Unit 5: Advanced Linking & Discourse
    {
        "id": "advanced-unit5-vocab",
        "title": "Unit 5: Advanced Cohesive Devices",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 5,
        "description": "Sophisticated linking words and discourse markers",
        "ielts_relevance": "Advanced cohesion is essential for Band 7+ in Coherence & Cohesion.",
        "items": [
            {
                "id": "a5v1",
                "word": "conversely",
                "ipa": "/ˈkɒn.vɜːs.li/",
                "part_of_speech": "adverb",
                "stress_pattern": "CON-verse-ly (stress on first syllable)",
                "definition": "In an opposite way; on the other hand",
                "examples": [
                    "Rich countries tend to have low birth rates. Conversely, poorer nations often have higher birth rates.",
                    "Some argue technology improves lives. Conversely, others believe it creates new problems.",
                    "Urban areas offer more jobs. Conversely, rural areas offer better air quality."
                ],
                "collocations": ["conversely, ...", "and conversely"],
                "ielts_tip": "Use to show contrast between two different situations."
            },
            {
                "id": "a5v2",
                "word": "notwithstanding this",
                "ipa": "/ˌnɒt.wɪðˈstæn.dɪŋ ðɪs/",
                "part_of_speech": "phrase",
                "stress_pattern": "not-with-STAN-ding THIS",
                "definition": "Despite this; nevertheless",
                "examples": [
                    "There are significant costs involved. Notwithstanding this, the benefits outweigh the drawbacks.",
                    "The evidence is limited. Notwithstanding this, preliminary findings are promising.",
                    "Critics have raised concerns. Notwithstanding this, the policy has been implemented."
                ],
                "collocations": ["notwithstanding this, ...", "notwithstanding the above"],
                "ielts_tip": "Very formal concession marker - impressive in essays."
            },
            {
                "id": "a5v3",
                "word": "this notwithstanding",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "THIS not-with-STAN-ding",
                "definition": "Despite this (placed at end for variation)",
                "examples": [
                    "There are challenges ahead, this notwithstanding.",
                    "The evidence is inconclusive, this notwithstanding, action must be taken.",
                    "Costs are high, this notwithstanding, investment is necessary."
                ],
                "collocations": ["..., this notwithstanding", "..., these concerns notwithstanding"],
                "ielts_tip": "Alternative position for sophisticated style variation."
            },
            {
                "id": "a5v4",
                "word": "by the same token",
                "ipa": "/baɪ ðə seɪm ˈtəʊ.kən/",
                "part_of_speech": "phrase",
                "stress_pattern": "by the SAME TO-ken",
                "definition": "For the same reason; similarly",
                "examples": [
                    "Technology creates jobs. By the same token, it eliminates others.",
                    "Education benefits individuals. By the same token, it benefits society.",
                    "Freedom brings responsibility. By the same token, responsibility brings freedom."
                ],
                "collocations": ["by the same token, ...", "and by the same token"],
                "ielts_tip": "Shows logical connection between related points."
            },
            {
                "id": "a5v5",
                "word": "in light of the above",
                "ipa": "N/A",
                "part_of_speech": "phrase",
                "stress_pattern": "in LIGHT of the a-BOVE",
                "definition": "Considering what has been discussed",
                "examples": [
                    "In light of the above, it is clear that action is needed.",
                    "In light of the above discussion, several conclusions can be drawn.",
                    "In light of the above evidence, the policy should be reconsidered."
                ],
                "collocations": ["in light of the above, ...", "in light of these findings"],
                "ielts_tip": "Excellent for beginning conclusion paragraphs."
            }
        ]
    },
    {
        "id": "advanced-unit5-grammar",
        "title": "Unit 5: Reduced Clauses & Participles",
        "band_level": "advanced",
        "type": "grammar",
        "unit_number": 5,
        "description": "Create sophisticated sentences using participle clauses",
        "ielts_relevance": "Reduced clauses show grammatical sophistication for Band 7+.",
        "items": [
            {
                "id": "a5g1",
                "word": "Present Participle Clauses",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use -ing forms to combine sentences and add information",
                "examples": [
                    "Facing increasing pressure, governments must act on climate change.",
                    "Lacking sufficient funding, many schools struggle to provide resources.",
                    "Having considered all options, the best solution is investment in education."
                ],
                "grammar_formula": "-ing clause, main clause OR main clause, -ing clause",
                "common_mistakes": ["The subjects must match: 'Walking to school, the rain started' (wrong - rain wasn't walking)"],
                "ielts_band_impact": "Participle clauses show sophisticated grammar control.",
                "practice_prompt": "Combine: 'The government faces budget constraints. It must prioritise spending.'"
            },
            {
                "id": "a5g2",
                "word": "Past Participle Clauses",
                "ipa": "N/A",
                "part_of_speech": "grammar",
                "stress_pattern": "N/A",
                "definition": "Use -ed forms for passive meaning in reduced clauses",
                "examples": [
                    "Faced with this challenge, many countries have implemented new policies.",
                    "Seen from this perspective, the argument is less convincing.",
                    "Given the current situation, immediate action is required."
                ],
                "grammar_formula": "Past participle clause, main clause",
                "common_mistakes": ["Subject of main clause must be the one 'receiving' the action"],
                "ielts_band_impact": "Shows ability to manipulate grammar for sophisticated style.",
                "practice_prompt": "Rewrite: 'When faced with criticism, the government defended its policy.'"
            }
        ]
    }
]

# Combine all units
ALL_UNITS = FOUNDATION_UNITS + DEVELOPMENT_UNITS + ADVANCED_UNITS

async def seed_vocab_grammar_v2():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Clear existing lessons
    await db.vocab_grammar_lessons.delete_many({})
    
    # Insert all units
    for unit in ALL_UNITS:
        await db.vocab_grammar_lessons.insert_one(unit)
        print(f"✅ Inserted: {unit['band_level'].upper()} - {unit['title']}")
    
    # Summary
    foundation_count = len([u for u in ALL_UNITS if u['band_level'] == 'beginner'])
    development_count = len([u for u in ALL_UNITS if u['band_level'] == 'intermediate'])
    advanced_count = len([u for u in ALL_UNITS if u['band_level'] == 'advanced'])
    
    print(f"\n📊 SEEDING COMPLETE!")
    print(f"   Foundation (Band 4.5-): {foundation_count} units")
    print(f"   Development (Band 4.5-6.5): {development_count} units")
    print(f"   Advanced (Band 6.5+): {advanced_count} units")
    print(f"   TOTAL: {len(ALL_UNITS)} units")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_vocab_grammar_v2())
