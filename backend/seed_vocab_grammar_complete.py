"""
Complete Vocabulary & Grammar Course Seed Data
IELTS Ace - Comprehensive Learning System

Structure:
- 3 Band Levels: Foundation (4.5-), Development (5.0-6.5), Advanced (7.0+)
- 10 Units per level = 30 Units Total
- Each unit: 10 vocabulary/grammar items = 300 items total
- Quiz questions for Question Bank integration

Topics covered:
1. Daily Life & Routines
2. Family & Relationships  
3. Home & Accommodation
4. Education & Learning
5. Work & Career
6. Health & Lifestyle
7. Environment & Nature
8. Technology & Media
9. Travel & Tourism
10. Society & Culture
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# ============================================================
# FOUNDATION LEVEL (Band 4.5 and below) - 10 Units
# Focus: Basic IELTS vocabulary and essential grammar
# ============================================================

FOUNDATION_UNITS = [
    # Unit 1: Daily Life & Routines - Vocabulary
    {
        "id": "f-u1-vocab",
        "title": "Unit 1: Daily Life & Routines",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 1,
        "description": "Essential words for describing your daily activities - perfect for IELTS Speaking Part 1",
        "ielts_relevance": "Speaking Part 1 frequently asks about daily routines, habits, and time management.",
        "items": [
            {"id": "f1v1", "word": "usually", "ipa": "/ˈjuː.ʒu.ə.li/", "part_of_speech": "adverb", "definition": "In the way that most often happens", "examples": ["I usually wake up at 7 o'clock.", "She usually takes the bus to work.", "We don't usually eat out."], "collocations": ["usually go", "usually have", "usually take"], "ielts_tip": "Use to describe regular habits in Speaking Part 1."},
            {"id": "f1v2", "word": "schedule", "ipa": "/ˈʃed.juːl/", "part_of_speech": "noun/verb", "definition": "A plan of activities and when they happen", "examples": ["My schedule is very busy.", "I need to schedule a meeting.", "What's your daily schedule?"], "collocations": ["busy schedule", "work schedule", "daily schedule"], "ielts_tip": "Great for describing your routine or plans."},
            {"id": "f1v3", "word": "convenient", "ipa": "/kənˈviː.ni.ənt/", "part_of_speech": "adjective", "definition": "Easy to use, suitable for your needs", "examples": ["Public transport is convenient here.", "Online shopping is very convenient.", "It's convenient to live near work."], "collocations": ["very convenient", "convenient location", "convenient time"], "ielts_tip": "Use when discussing advantages in Speaking/Writing."},
            {"id": "f1v4", "word": "prefer", "ipa": "/prɪˈfɜːr/", "part_of_speech": "verb", "definition": "To like something more than another", "examples": ["I prefer tea to coffee.", "Do you prefer working alone or in a team?", "She prefers studying at home."], "collocations": ["prefer to do", "would prefer", "prefer doing"], "ielts_tip": "Essential for expressing opinions and preferences."},
            {"id": "f1v5", "word": "regularly", "ipa": "/ˈreɡ.jə.lə.li/", "part_of_speech": "adverb", "definition": "At the same time or in the same way, often", "examples": ["I exercise regularly.", "She regularly visits her parents.", "Do you regularly check emails?"], "collocations": ["exercise regularly", "check regularly", "visit regularly"], "ielts_tip": "Shows frequency - sounds more natural."},
            {"id": "f1v6", "word": "typical", "ipa": "/ˈtɪp.ɪ.kəl/", "part_of_speech": "adjective", "definition": "Having the usual qualities of a particular type", "examples": ["A typical day starts at 7am.", "This is typical weather for summer.", "He's a typical teenager."], "collocations": ["typical day", "typical example", "typical behaviour"], "ielts_tip": "Perfect for 'describe a typical day' questions."},
            {"id": "f1v7", "word": "routine", "ipa": "/ruːˈtiːn/", "part_of_speech": "noun", "definition": "The usual order of activities", "examples": ["I have a morning routine.", "Exercise is part of my routine.", "My routine never changes."], "collocations": ["daily routine", "morning routine", "follow a routine"], "ielts_tip": "Key word for Speaking Part 1 about habits."},
            {"id": "f1v8", "word": "habit", "ipa": "/ˈhæb.ɪt/", "part_of_speech": "noun", "definition": "Something you do regularly, often without thinking", "examples": ["I have a habit of checking my phone.", "Smoking is a bad habit.", "Reading before bed is a good habit."], "collocations": ["bad habit", "good habit", "eating habits"], "ielts_tip": "Discuss positive/negative habits in Speaking."},
            {"id": "f1v9", "word": "leisure", "ipa": "/ˈleʒ.ər/", "part_of_speech": "noun", "definition": "Time when you are not working", "examples": ["I read in my leisure time.", "Leisure activities are important.", "What do you do in your leisure?"], "collocations": ["leisure time", "leisure activities", "at leisure"], "ielts_tip": "Common in questions about free time."},
            {"id": "f1v10", "word": "balance", "ipa": "/ˈbæl.əns/", "part_of_speech": "noun/verb", "definition": "Equal amounts of different things", "examples": ["Work-life balance is important.", "I try to balance work and family.", "A balanced diet is healthy."], "collocations": ["work-life balance", "balanced diet", "find a balance"], "ielts_tip": "Useful for discussing lifestyle topics."}
        ],
        "quiz_questions": [
            {"question": "I ___ wake up at 7am every day.", "options": ["usually", "typical", "routine"], "answer": "usually", "explanation": "'Usually' is an adverb of frequency."},
            {"question": "My work ___ is very busy this week.", "options": ["habit", "schedule", "balance"], "answer": "schedule", "explanation": "'Schedule' means a plan of activities."},
            {"question": "Online shopping is very ___.", "options": ["convenient", "routine", "leisure"], "answer": "convenient", "explanation": "'Convenient' means easy to use."}
        ]
    },
    # Unit 1: Daily Life - Grammar
    {
        "id": "f-u1-grammar",
        "title": "Unit 1: Present Simple for Habits",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 1,
        "description": "Master the present simple tense for talking about routines and habits",
        "ielts_relevance": "Essential for Speaking Part 1 and Writing Task 2 general statements.",
        "items": [
            {"id": "f1g1", "word": "Present Simple - Positive", "part_of_speech": "grammar", "definition": "Subject + base verb (add -s/-es for he/she/it)", "examples": ["I work in an office.", "She works from home.", "They live in the city."], "grammar_formula": "I/You/We/They + verb | He/She/It + verb+s", "common_mistakes": ["He work → He works"], "ielts_tip": "Third person -s is essential for Band 5+"},
            {"id": "f1g2", "word": "Present Simple - Negative", "part_of_speech": "grammar", "definition": "Subject + do/does + not + base verb", "examples": ["I don't like mornings.", "She doesn't work weekends.", "They don't eat meat."], "grammar_formula": "don't/doesn't + base verb", "common_mistakes": ["She doesn't works → doesn't work"], "ielts_tip": "Never add -s after doesn't."},
            {"id": "f1g3", "word": "Present Simple - Questions", "part_of_speech": "grammar", "definition": "Do/Does + subject + base verb?", "examples": ["Do you work here?", "Does she like coffee?", "What time do you wake up?"], "grammar_formula": "Do/Does + subject + verb?", "common_mistakes": ["Does she works? → Does she work?"], "ielts_tip": "Use for asking about habits."},
            {"id": "f1g4", "word": "Frequency Adverbs", "part_of_speech": "grammar", "definition": "always, usually, often, sometimes, rarely, never", "examples": ["I always have breakfast.", "She sometimes works late.", "We never eat fast food."], "grammar_formula": "Subject + adverb + verb", "common_mistakes": ["I go always → I always go"], "ielts_tip": "Position: after BE, before other verbs."},
            {"id": "f1g5", "word": "Time Expressions", "part_of_speech": "grammar", "definition": "every day, once a week, on Mondays", "examples": ["I exercise every day.", "She visits once a week.", "I work on Mondays."], "grammar_formula": "Usually at end of sentence", "common_mistakes": ["every days → every day"], "ielts_tip": "Add variety to your frequency expressions."}
        ],
        "quiz_questions": [
            {"question": "She ___ (work) in a hospital.", "options": ["work", "works", "working"], "answer": "works", "explanation": "Third person singular needs -s."},
            {"question": "They ___ (not/eat) meat.", "options": ["doesn't eat", "don't eat", "not eat"], "answer": "don't eat", "explanation": "'They' uses 'don't', not 'doesn't'."},
            {"question": "I ___ go to the gym. (always)", "options": ["always go", "go always", "always going"], "answer": "always go", "explanation": "Frequency adverbs go before main verbs."}
        ]
    },
    
    # Unit 2: Family & Relationships - Vocabulary
    {
        "id": "f-u2-vocab",
        "title": "Unit 2: Family & Relationships",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 2,
        "description": "Essential vocabulary for talking about family - a very common IELTS topic",
        "ielts_relevance": "Family is frequently tested in Speaking Part 1 and Part 2.",
        "items": [
            {"id": "f2v1", "word": "close", "ipa": "/kləʊs/", "part_of_speech": "adjective", "definition": "Having a strong relationship", "examples": ["I'm close to my sister.", "We have a close family.", "She's my closest friend."], "collocations": ["close family", "close friend", "close relationship"], "ielts_tip": "Key adjective for describing relationships."},
            {"id": "f2v2", "word": "relative", "ipa": "/ˈrel.ə.tɪv/", "part_of_speech": "noun", "definition": "A family member", "examples": ["I have relatives in Australia.", "We visit relatives at holidays.", "She's a distant relative."], "collocations": ["close relative", "distant relative", "elderly relative"], "ielts_tip": "General term for any family member."},
            {"id": "f2v3", "word": "sibling", "ipa": "/ˈsɪb.lɪŋ/", "part_of_speech": "noun", "definition": "A brother or sister", "examples": ["I have two siblings.", "My siblings are older than me.", "Do you have any siblings?"], "collocations": ["older sibling", "younger sibling", "sibling rivalry"], "ielts_tip": "More formal than 'brother/sister'."},
            {"id": "f2v4", "word": "supportive", "ipa": "/səˈpɔː.tɪv/", "part_of_speech": "adjective", "definition": "Giving help and encouragement", "examples": ["My parents are very supportive.", "She has a supportive family.", "He's always supportive of my ideas."], "collocations": ["supportive family", "supportive parents", "emotionally supportive"], "ielts_tip": "Positive adjective for describing family."},
            {"id": "f2v5", "word": "generation", "ipa": "/ˌdʒen.əˈreɪ.ʃən/", "part_of_speech": "noun", "definition": "People born around the same time", "examples": ["Three generations live together.", "The younger generation uses technology.", "Generation gaps can cause conflicts."], "collocations": ["older generation", "younger generation", "generation gap"], "ielts_tip": "Useful for comparing age groups."},
            {"id": "f2v6", "word": "upbringing", "ipa": "/ˈʌp.brɪŋ.ɪŋ/", "part_of_speech": "noun", "definition": "The way a child is raised", "examples": ["I had a strict upbringing.", "Upbringing affects personality.", "Her upbringing was traditional."], "collocations": ["strict upbringing", "traditional upbringing", "good upbringing"], "ielts_tip": "Great for discussing childhood influences."},
            {"id": "f2v7", "word": "bond", "ipa": "/bɒnd/", "part_of_speech": "noun/verb", "definition": "A close connection between people", "examples": ["The bond between mother and child.", "We bonded over shared interests.", "Family bonds are important."], "collocations": ["strong bond", "family bond", "form a bond"], "ielts_tip": "Shows emotional connection."},
            {"id": "f2v8", "word": "raise", "ipa": "/reɪz/", "part_of_speech": "verb", "definition": "To look after children until adult", "examples": ["She raised three children.", "I was raised in the countryside.", "Raising children is challenging."], "collocations": ["raise children", "raise a family", "well-raised"], "ielts_tip": "More natural than 'bring up' in some contexts."},
            {"id": "f2v9", "word": "nuclear family", "ipa": "/ˈnjuː.kli.ər/", "part_of_speech": "noun", "definition": "Parents and children only", "examples": ["Nuclear families are common now.", "I grew up in a nuclear family.", "Nuclear families are smaller."], "collocations": ["nuclear family", "extended family", "family unit"], "ielts_tip": "Compare with 'extended family'."},
            {"id": "f2v10", "word": "get along", "ipa": "/ɡet əˈlɒŋ/", "part_of_speech": "phrasal verb", "definition": "To have a good relationship", "examples": ["I get along well with my brother.", "Do you get along with your colleagues?", "They don't get along."], "collocations": ["get along well", "get along with someone"], "ielts_tip": "Common phrasal verb for relationships."}
        ],
        "quiz_questions": [
            {"question": "I'm very ___ to my grandmother.", "options": ["close", "supportive", "relative"], "answer": "close", "explanation": "'Close to' means having a strong relationship."},
            {"question": "I have two ___ - a brother and a sister.", "options": ["relatives", "siblings", "generations"], "answer": "siblings", "explanation": "'Siblings' means brothers and sisters."},
            {"question": "My parents were very ___ when I started university.", "options": ["nuclear", "raised", "supportive"], "answer": "supportive", "explanation": "'Supportive' means giving help and encouragement."}
        ]
    },
    # Unit 2: Family - Grammar
    {
        "id": "f-u2-grammar",
        "title": "Unit 2: Past Simple for Experiences",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 2,
        "description": "Use past simple to talk about your childhood and family experiences",
        "ielts_relevance": "Essential for Speaking Part 2 (describe a memory) and Part 3 discussions.",
        "items": [
            {"id": "f2g1", "word": "Past Simple - Regular", "part_of_speech": "grammar", "definition": "Add -ed to base verb", "examples": ["I lived in a small town.", "She worked as a teacher.", "They moved to London."], "grammar_formula": "Subject + verb+ed", "common_mistakes": ["I work yesterday → I worked"], "ielts_tip": "For completed actions in the past."},
            {"id": "f2g2", "word": "Past Simple - Irregular", "part_of_speech": "grammar", "definition": "Common verbs with special past forms", "examples": ["I went to school nearby.", "She had three brothers.", "We were very happy."], "grammar_formula": "go→went, have→had, be→was/were", "common_mistakes": ["I goed → I went"], "ielts_tip": "Learn common irregular verbs."},
            {"id": "f2g3", "word": "Past Simple - Negative", "part_of_speech": "grammar", "definition": "Subject + did not + base verb", "examples": ["I didn't have siblings.", "She didn't live in the city.", "They didn't travel much."], "grammar_formula": "didn't + base verb", "common_mistakes": ["I didn't went → I didn't go"], "ielts_tip": "Never use past form after 'didn't'."},
            {"id": "f2g4", "word": "Past Simple - Questions", "part_of_speech": "grammar", "definition": "Did + subject + base verb?", "examples": ["Did you enjoy your childhood?", "Where did you grow up?", "What did you do on weekends?"], "grammar_formula": "Did + subject + base verb?", "common_mistakes": ["Did you went? → Did you go?"], "ielts_tip": "Common in Speaking Part 1 questions."},
            {"id": "f2g5", "word": "Time Expressions - Past", "part_of_speech": "grammar", "definition": "yesterday, last week, in 2010, when I was young", "examples": ["I moved here last year.", "When I was young, I loved playing.", "In 2015, I started university."], "grammar_formula": "Usually at start or end", "common_mistakes": ["In last year → Last year"], "ielts_tip": "Add context to your past stories."}
        ],
        "quiz_questions": [
            {"question": "I ___ (grow up) in a small village.", "options": ["grow up", "grew up", "growed up"], "answer": "grew up", "explanation": "'Grow' is irregular: grow → grew."},
            {"question": "She ___ (not/have) any brothers.", "options": ["didn't have", "didn't had", "not had"], "answer": "didn't have", "explanation": "Use base form after 'didn't'."},
            {"question": "Where ___ you ___ (live) when you were a child?", "options": ["did/live", "did/lived", "were/live"], "answer": "did/live", "explanation": "Past question: Did + subject + base verb."}
        ]
    },
    
    # Unit 3: Home & Accommodation - Vocabulary
    {
        "id": "f-u3-vocab",
        "title": "Unit 3: Home & Accommodation",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 3,
        "description": "Words for describing where you live - common in IELTS Speaking Part 1",
        "ielts_relevance": "Questions about your home, neighbourhood, and living situation are very common.",
        "items": [
            {"id": "f3v1", "word": "spacious", "ipa": "/ˈspeɪ.ʃəs/", "part_of_speech": "adjective", "definition": "Having a lot of space", "examples": ["The living room is spacious.", "I prefer spacious apartments.", "It's not very spacious."], "collocations": ["spacious room", "spacious apartment", "feel spacious"], "ielts_tip": "Better than 'big' for describing rooms."},
            {"id": "f3v2", "word": "cosy", "ipa": "/ˈkəʊ.zi/", "part_of_speech": "adjective", "definition": "Small, warm, and comfortable", "examples": ["My bedroom is small but cosy.", "It's a cosy little cafe.", "The house feels cosy in winter."], "collocations": ["cosy room", "cosy atmosphere", "warm and cosy"], "ielts_tip": "Positive way to describe small spaces."},
            {"id": "f3v3", "word": "neighbourhood", "ipa": "/ˈneɪ.bə.hʊd/", "part_of_speech": "noun", "definition": "The area where you live", "examples": ["It's a quiet neighbourhood.", "I grew up in this neighbourhood.", "The neighbourhood is safe."], "collocations": ["quiet neighbourhood", "residential neighbourhood", "local neighbourhood"], "ielts_tip": "Spell correctly: neighbourhood (UK)."},
            {"id": "f3v4", "word": "located", "ipa": "/ləʊˈkeɪ.tɪd/", "part_of_speech": "adjective", "definition": "Situated in a particular place", "examples": ["My house is located near the park.", "The apartment is centrally located.", "It's located in the suburbs."], "collocations": ["centrally located", "conveniently located", "well located"], "ielts_tip": "Formal way to describe position."},
            {"id": "f3v5", "word": "rent", "ipa": "/rent/", "part_of_speech": "noun/verb", "definition": "Money paid to live in a property", "examples": ["The rent is quite high.", "I rent a small flat.", "Renting is common for students."], "collocations": ["pay rent", "rent an apartment", "high rent"], "ielts_tip": "Compare renting vs owning."},
            {"id": "f3v6", "word": "suburbs", "ipa": "/ˈsʌb.ɜːbz/", "part_of_speech": "noun", "definition": "Residential areas outside city centre", "examples": ["I live in the suburbs.", "The suburbs are quieter.", "Many families prefer suburbs."], "collocations": ["live in the suburbs", "quiet suburbs", "suburban area"], "ielts_tip": "Contrast with 'city centre'."},
            {"id": "f3v7", "word": "commute", "ipa": "/kəˈmjuːt/", "part_of_speech": "noun/verb", "definition": "Travel regularly to work", "examples": ["My commute takes 30 minutes.", "I commute by train.", "Long commutes are tiring."], "collocations": ["daily commute", "commute to work", "long commute"], "ielts_tip": "Shows you know work-travel vocabulary."},
            {"id": "f3v8", "word": "facilities", "ipa": "/fəˈsɪl.ɪ.tiz/", "part_of_speech": "noun", "definition": "Services and amenities available", "examples": ["The area has good facilities.", "Sports facilities are nearby.", "The building has modern facilities."], "collocations": ["public facilities", "sports facilities", "modern facilities"], "ielts_tip": "Useful for describing areas."},
            {"id": "f3v9", "word": "affordable", "ipa": "/əˈfɔː.də.bəl/", "part_of_speech": "adjective", "definition": "Not too expensive", "examples": ["Rent is more affordable here.", "We need affordable housing.", "It's an affordable area."], "collocations": ["affordable housing", "affordable prices", "reasonably affordable"], "ielts_tip": "Key word for cost discussions."},
            {"id": "f3v10", "word": "peaceful", "ipa": "/ˈpiːs.fəl/", "part_of_speech": "adjective", "definition": "Quiet and calm", "examples": ["It's a peaceful neighbourhood.", "The area is very peaceful.", "I prefer peaceful surroundings."], "collocations": ["peaceful area", "peaceful environment", "peaceful and quiet"], "ielts_tip": "Positive adjective for describing places."}
        ],
        "quiz_questions": [
            {"question": "The living room is very ___ with high ceilings.", "options": ["cosy", "spacious", "located"], "answer": "spacious", "explanation": "'Spacious' means having lots of space."},
            {"question": "My apartment is centrally ___ near the station.", "options": ["located", "affordable", "peaceful"], "answer": "located", "explanation": "'Located' describes position."},
            {"question": "I ___ an apartment in the city centre.", "options": ["rent", "commute", "facility"], "answer": "rent", "explanation": "'Rent' means pay to live somewhere."}
        ]
    },
    # Unit 3: Home - Grammar
    {
        "id": "f-u3-grammar",
        "title": "Unit 3: There is/There are",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 3,
        "description": "Describe what exists in your home and neighbourhood",
        "ielts_relevance": "Essential for describing places in Speaking and Writing Task 1.",
        "items": [
            {"id": "f3g1", "word": "There is - Singular", "part_of_speech": "grammar", "definition": "Use with singular/uncountable nouns", "examples": ["There is a park nearby.", "There is some noise outside.", "There is a balcony."], "grammar_formula": "There is + singular noun", "common_mistakes": ["There is many shops → There are"], "ielts_tip": "For one thing or uncountable nouns."},
            {"id": "f3g2", "word": "There are - Plural", "part_of_speech": "grammar", "definition": "Use with plural nouns", "examples": ["There are two bedrooms.", "There are many restaurants.", "There are some trees."], "grammar_formula": "There are + plural noun", "common_mistakes": ["There are a shop → There is"], "ielts_tip": "For multiple things."},
            {"id": "f3g3", "word": "There isn't/aren't", "part_of_speech": "grammar", "definition": "Negative forms", "examples": ["There isn't a garden.", "There aren't any shops.", "There isn't much space."], "grammar_formula": "There isn't/aren't + noun", "common_mistakes": ["There aren't no shops → There aren't any"], "ielts_tip": "Avoid double negatives."},
            {"id": "f3g4", "word": "Is/Are there...?", "part_of_speech": "grammar", "definition": "Question forms", "examples": ["Is there a supermarket nearby?", "Are there any parks?", "Is there much traffic?"], "grammar_formula": "Is/Are there + noun?", "common_mistakes": ["There is a bank? → Is there a bank?"], "ielts_tip": "Use proper question form."},
            {"id": "f3g5", "word": "Prepositions of Place", "part_of_speech": "grammar", "definition": "in, on, near, next to, opposite, between", "examples": ["There's a park near my house.", "The shop is next to the bank.", "My flat is on the third floor."], "grammar_formula": "Location + preposition + place", "common_mistakes": ["in front of the street → on the street"], "ielts_tip": "Add detail to your descriptions."}
        ],
        "quiz_questions": [
            {"question": "___ a balcony in my apartment.", "options": ["There is", "There are", "It is"], "answer": "There is", "explanation": "'Balcony' is singular, use 'there is'."},
            {"question": "___ any restaurants near your house?", "options": ["Is there", "Are there", "There are"], "answer": "Are there", "explanation": "'Restaurants' is plural, use 'are there'."},
            {"question": "The supermarket is ___ the bank.", "options": ["next to", "in", "on"], "answer": "next to", "explanation": "'Next to' shows position beside something."}
        ]
    },
    
    # Unit 4: Education & Learning - Vocabulary
    {
        "id": "f-u4-vocab",
        "title": "Unit 4: Education & Learning",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 4,
        "description": "Key vocabulary for discussing education - a major IELTS topic",
        "ielts_relevance": "Education appears in all four skills - very high frequency topic.",
        "items": [
            {"id": "f4v1", "word": "degree", "ipa": "/dɪˈɡriː/", "part_of_speech": "noun", "definition": "University qualification", "examples": ["I have a degree in Biology.", "She's studying for her degree.", "A degree helps with jobs."], "collocations": ["get a degree", "bachelor's degree", "master's degree"], "ielts_tip": "Bachelor's, Master's, PhD - know the levels."},
            {"id": "f4v2", "word": "graduate", "ipa": "/ˈɡrædʒ.u.ət/", "part_of_speech": "noun/verb", "definition": "Complete studies / person who completed", "examples": ["I graduated in 2020.", "She's a recent graduate.", "Many graduates struggle to find work."], "collocations": ["graduate from", "recent graduate", "graduate student"], "ielts_tip": "Verb: gradUATE, Noun: GRADuate."},
            {"id": "f4v3", "word": "subject", "ipa": "/ˈsʌb.dʒekt/", "part_of_speech": "noun", "definition": "An area of study", "examples": ["Maths is my favourite subject.", "I studied three subjects.", "What subjects did you take?"], "collocations": ["favourite subject", "main subject", "compulsory subject"], "ielts_tip": "Different from 'course' (the whole programme)."},
            {"id": "f4v4", "word": "revise", "ipa": "/rɪˈvaɪz/", "part_of_speech": "verb", "definition": "Study again for exams (UK)", "examples": ["I need to revise for my exam.", "She spent all night revising.", "Revision is important."], "collocations": ["revise for", "revision notes", "revision techniques"], "ielts_tip": "UK: revise, US: review/study."},
            {"id": "f4v5", "word": "tuition", "ipa": "/tjuˈɪʃ.ən/", "part_of_speech": "noun", "definition": "Teaching / fees for education", "examples": ["Tuition fees are expensive.", "She receives private tuition.", "University tuition has increased."], "collocations": ["tuition fees", "private tuition", "free tuition"], "ielts_tip": "Can mean teaching OR fees."},
            {"id": "f4v6", "word": "academic", "ipa": "/ˌæk.əˈdem.ɪk/", "part_of_speech": "adjective", "definition": "Related to education and studying", "examples": ["His academic results are good.", "Academic writing is formal.", "She has strong academic skills."], "collocations": ["academic performance", "academic year", "academic skills"], "ielts_tip": "IELTS Academic vs General Training."},
            {"id": "f4v7", "word": "qualify", "ipa": "/ˈkwɒl.ɪ.faɪ/", "part_of_speech": "verb", "definition": "Complete training for a job", "examples": ["She qualified as a doctor.", "I hope to qualify next year.", "Newly qualified teachers."], "collocations": ["qualify as", "well qualified", "qualified teacher"], "ielts_tip": "Related to professional training."},
            {"id": "f4v8", "word": "curriculum", "ipa": "/kəˈrɪk.jə.ləm/", "part_of_speech": "noun", "definition": "All subjects taught at a school", "examples": ["The curriculum includes science.", "National curriculum standards.", "A balanced curriculum."], "collocations": ["school curriculum", "national curriculum", "curriculum design"], "ielts_tip": "Plural: curricula or curriculums."},
            {"id": "f4v9", "word": "compulsory", "ipa": "/kəmˈpʌl.sər.i/", "part_of_speech": "adjective", "definition": "Required, must be done", "examples": ["English is compulsory.", "Compulsory education until 16.", "Some subjects are compulsory."], "collocations": ["compulsory education", "compulsory subject", "compulsory attendance"], "ielts_tip": "Opposite: optional/elective."},
            {"id": "f4v10", "word": "knowledge", "ipa": "/ˈnɒl.ɪdʒ/", "part_of_speech": "noun", "definition": "Information and understanding", "examples": ["Knowledge is power.", "She has good knowledge of history.", "Practical knowledge is important."], "collocations": ["general knowledge", "background knowledge", "gain knowledge"], "ielts_tip": "Uncountable - no 'knowledges'."}
        ],
        "quiz_questions": [
            {"question": "She has a ___ in Computer Science.", "options": ["subject", "degree", "curriculum"], "answer": "degree", "explanation": "'Degree' is a university qualification."},
            {"question": "I need to ___ for my exam next week.", "options": ["graduate", "revise", "qualify"], "answer": "revise", "explanation": "'Revise' means study again for exams."},
            {"question": "In my country, education is ___ until age 16.", "options": ["academic", "compulsory", "tuition"], "answer": "compulsory", "explanation": "'Compulsory' means required by law."}
        ]
    },
    # Unit 4: Education - Grammar
    {
        "id": "f-u4-grammar",
        "title": "Unit 4: Present Continuous",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 4,
        "description": "Describe what you're doing now and future plans",
        "ielts_relevance": "Used for current studies and future arrangements in Speaking.",
        "items": [
            {"id": "f4g1", "word": "Present Continuous - Form", "part_of_speech": "grammar", "definition": "am/is/are + verb-ing", "examples": ["I am studying English.", "She is working on a project.", "They are learning Chinese."], "grammar_formula": "Subject + am/is/are + verb-ing", "common_mistakes": ["I studying → I am studying"], "ielts_tip": "Don't forget the BE verb."},
            {"id": "f4g2", "word": "Present Continuous - Now", "part_of_speech": "grammar", "definition": "Actions happening at this moment", "examples": ["I'm preparing for IELTS.", "What are you studying?", "He's writing an essay."], "grammar_formula": "For actions in progress now", "common_mistakes": ["I work now → I'm working now"], "ielts_tip": "Common in Speaking Part 1."},
            {"id": "f4g3", "word": "Present Continuous - Future", "part_of_speech": "grammar", "definition": "Planned arrangements", "examples": ["I'm starting university next year.", "She's taking the exam in May.", "We're moving next month."], "grammar_formula": "For definite future plans", "common_mistakes": ["I start tomorrow → I'm starting tomorrow (more natural)"], "ielts_tip": "Shows planned future events."},
            {"id": "f4g4", "word": "State Verbs", "part_of_speech": "grammar", "definition": "Verbs NOT used with -ing", "examples": ["I know the answer. (NOT knowing)", "She likes English. (NOT liking)", "I understand now. (NOT understanding)"], "grammar_formula": "know, like, want, understand, believe", "common_mistakes": ["I'm knowing → I know"], "ielts_tip": "State verbs describe states, not actions."},
            {"id": "f4g5", "word": "Simple vs Continuous", "part_of_speech": "grammar", "definition": "Habits vs temporary/now", "examples": ["I usually study at home. (habit)", "I'm studying at a cafe today. (temporary)", "She works as a teacher. / She's working on a report."], "grammar_formula": "Simple = permanent, Continuous = temporary", "common_mistakes": ["I'm usually going → I usually go"], "ielts_tip": "Choose based on permanent vs temporary."}
        ],
        "quiz_questions": [
            {"question": "I ___ for the IELTS exam at the moment.", "options": ["prepare", "am preparing", "prepares"], "answer": "am preparing", "explanation": "Use present continuous for actions happening now."},
            {"question": "She ___ English. (like)", "options": ["is liking", "likes", "liking"], "answer": "likes", "explanation": "'Like' is a state verb - don't use continuous."},
            {"question": "We ___ to Australia next month.", "options": ["move", "are moving", "moved"], "answer": "are moving", "explanation": "Present continuous for planned future arrangements."}
        ]
    },
    
    # Unit 5: Work & Career - Vocabulary
    {
        "id": "f-u5-vocab",
        "title": "Unit 5: Work & Career",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 5,
        "description": "Essential work vocabulary for IELTS Speaking Part 1 and Writing",
        "ielts_relevance": "Work and careers are tested in all parts of IELTS.",
        "items": [
            {"id": "f5v1", "word": "employ", "ipa": "/ɪmˈplɔɪ/", "part_of_speech": "verb", "definition": "To give someone a job", "examples": ["The company employs 500 people.", "She is employed as a manager.", "Self-employed workers."], "collocations": ["employ staff", "be employed", "self-employed"], "ielts_tip": "Related: employer, employee, employment."},
            {"id": "f5v2", "word": "salary", "ipa": "/ˈsæl.ər.i/", "part_of_speech": "noun", "definition": "Fixed regular payment for work", "examples": ["The salary is quite good.", "She earns a high salary.", "Salary expectations."], "collocations": ["earn a salary", "high salary", "annual salary"], "ielts_tip": "Salary = monthly/yearly, Wage = hourly/weekly."},
            {"id": "f5v3", "word": "career", "ipa": "/kəˈrɪər/", "part_of_speech": "noun", "definition": "Professional life over time", "examples": ["I want a career in medicine.", "She has a successful career.", "Career opportunities."], "collocations": ["career path", "career change", "career development"], "ielts_tip": "Long-term profession vs 'job' (specific role)."},
            {"id": "f5v4", "word": "colleague", "ipa": "/ˈkɒl.iːɡ/", "part_of_speech": "noun", "definition": "Person you work with", "examples": ["My colleagues are friendly.", "I have lunch with colleagues.", "A former colleague."], "collocations": ["work colleague", "close colleague", "former colleague"], "ielts_tip": "More professional than 'coworker'."},
            {"id": "f5v5", "word": "deadline", "ipa": "/ˈded.laɪn/", "part_of_speech": "noun", "definition": "Time by which something must be done", "examples": ["The deadline is Friday.", "I met the deadline.", "Tight deadlines are stressful."], "collocations": ["meet a deadline", "tight deadline", "deadline pressure"], "ielts_tip": "Shows understanding of work pressure."},
            {"id": "f5v6", "word": "promotion", "ipa": "/prəˈməʊ.ʃən/", "part_of_speech": "noun", "definition": "Move to a higher position", "examples": ["She got a promotion.", "I'm hoping for promotion.", "Career promotion."], "collocations": ["get a promotion", "job promotion", "promotion opportunity"], "ielts_tip": "Related: promote (verb), promoted (adj)."},
            {"id": "f5v7", "word": "qualification", "ipa": "/ˌkwɒl.ɪ.fɪˈkeɪ.ʃən/", "part_of_speech": "noun", "definition": "Skills or certificates needed for a job", "examples": ["The job requires qualifications.", "Academic qualifications.", "Professional qualifications."], "collocations": ["required qualifications", "academic qualifications", "gain qualifications"], "ielts_tip": "Often plural: qualifications."},
            {"id": "f5v8", "word": "resign", "ipa": "/rɪˈzaɪn/", "part_of_speech": "verb", "definition": "Leave a job voluntarily", "examples": ["He resigned last month.", "She decided to resign.", "Resignation letter."], "collocations": ["resign from", "decide to resign", "forced to resign"], "ielts_tip": "Resign = voluntary, Fired = forced."},
            {"id": "f5v9", "word": "shift", "ipa": "/ʃɪft/", "part_of_speech": "noun", "definition": "A period of work", "examples": ["I work the night shift.", "She does 12-hour shifts.", "Shift work is tiring."], "collocations": ["night shift", "day shift", "work shifts"], "ielts_tip": "Common in discussions about working hours."},
            {"id": "f5v10", "word": "flexible", "ipa": "/ˈflek.sə.bəl/", "part_of_speech": "adjective", "definition": "Able to change or adapt", "examples": ["Flexible working hours.", "A flexible schedule.", "You need to be flexible."], "collocations": ["flexible hours", "flexible working", "flexible approach"], "ielts_tip": "Key word for modern work discussions."}
        ],
        "quiz_questions": [
            {"question": "The company ___ over 1000 people.", "options": ["employs", "salaries", "careers"], "answer": "employs", "explanation": "'Employ' means to give someone work."},
            {"question": "I need to meet the ___ by Friday.", "options": ["shift", "deadline", "promotion"], "answer": "deadline", "explanation": "'Deadline' is the time by which something must be done."},
            {"question": "She ___ from her job to start her own business.", "options": ["promoted", "resigned", "qualified"], "answer": "resigned", "explanation": "'Resign' means to leave a job voluntarily."}
        ]
    },
    # Continue with more units...
]

# ============================================================
# DEVELOPMENT LEVEL (Band 5.0-6.5) - 10 Units
# Focus: Academic vocabulary and complex structures
# ============================================================

DEVELOPMENT_UNITS = [
    # Unit 1: Society & Change - Vocabulary
    {
        "id": "d-u1-vocab",
        "title": "Unit 1: Society & Change",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 1,
        "description": "Academic vocabulary for discussing social issues in Writing Task 2",
        "ielts_relevance": "Social topics are very common in Writing Task 2 and Speaking Part 3.",
        "items": [
            {"id": "d1v1", "word": "significant", "ipa": "/sɪɡˈnɪf.ɪ.kənt/", "part_of_speech": "adjective", "definition": "Important, large enough to notice", "examples": ["There has been significant growth.", "A significant number of people.", "Significant changes have occurred."], "collocations": ["significant increase", "significant impact", "significant difference"], "ielts_tip": "Academic alternative to 'big' or 'important'."},
            {"id": "d1v2", "word": "contribute", "ipa": "/kənˈtrɪb.juːt/", "part_of_speech": "verb", "definition": "Help cause or add to something", "examples": ["Several factors contribute to this.", "Technology contributes to pollution.", "Everyone should contribute."], "collocations": ["contribute to", "contribute greatly", "contributing factor"], "ielts_tip": "Always followed by 'to'."},
            {"id": "d1v3", "word": "influence", "ipa": "/ˈɪn.flu.əns/", "part_of_speech": "noun/verb", "definition": "Effect on how something develops", "examples": ["Media has a strong influence.", "Parents influence children's behaviour.", "Under the influence of."], "collocations": ["have an influence", "strong influence", "influence on"], "ielts_tip": "Can be noun or verb."},
            {"id": "d1v4", "word": "consequence", "ipa": "/ˈkɒn.sɪ.kwəns/", "part_of_speech": "noun", "definition": "Result or effect of an action", "examples": ["The consequences are serious.", "As a consequence of this.", "Unintended consequences."], "collocations": ["as a consequence", "negative consequences", "suffer the consequences"], "ielts_tip": "More formal than 'result'."},
            {"id": "d1v5", "word": "impact", "ipa": "/ˈɪm.pækt/", "part_of_speech": "noun/verb", "definition": "Strong effect on something", "examples": ["The impact on society.", "Technology impacts our lives.", "A positive impact."], "collocations": ["have an impact", "significant impact", "impact on"], "ielts_tip": "Very common in IELTS essays."},
            {"id": "d1v6", "word": "tend", "ipa": "/tend/", "part_of_speech": "verb", "definition": "Usually do or be something", "examples": ["People tend to forget.", "Prices tend to rise.", "I tend to agree."], "collocations": ["tend to do", "tendency to"], "ielts_tip": "Useful for making generalizations."},
            {"id": "d1v7", "word": "widespread", "ipa": "/ˈwaɪd.spred/", "part_of_speech": "adjective", "definition": "Happening in many places/people", "examples": ["Widespread concern about.", "A widespread problem.", "Widespread use of technology."], "collocations": ["widespread use", "widespread concern", "become widespread"], "ielts_tip": "One word, not 'wide spread'."},
            {"id": "d1v8", "word": "inevitable", "ipa": "/ɪnˈev.ɪ.tə.bəl/", "part_of_speech": "adjective", "definition": "Certain to happen, unavoidable", "examples": ["Change is inevitable.", "The inevitable result.", "It seems inevitable that."], "collocations": ["seem inevitable", "inevitable consequence", "almost inevitable"], "ielts_tip": "Shows sophisticated vocabulary."},
            {"id": "d1v9", "word": "fundamental", "ipa": "/ˌfʌn.dəˈmen.təl/", "part_of_speech": "adjective", "definition": "Basic and essential", "examples": ["A fundamental change.", "Fundamental to success.", "Fundamental principles."], "collocations": ["fundamental change", "fundamental difference", "fundamental right"], "ielts_tip": "Stronger than 'basic' or 'essential'."},
            {"id": "d1v10", "word": "perspective", "ipa": "/pəˈspek.tɪv/", "part_of_speech": "noun", "definition": "A particular way of viewing things", "examples": ["From my perspective.", "Different perspectives on the issue.", "A new perspective."], "collocations": ["from this perspective", "different perspective", "put things in perspective"], "ielts_tip": "Useful in discussion essays."}
        ],
        "quiz_questions": [
            {"question": "Several factors ___ to climate change.", "options": ["contribute", "impact", "consequence"], "answer": "contribute", "explanation": "'Contribute to' means help cause."},
            {"question": "Technology has a ___ impact on daily life.", "options": ["widespread", "significant", "fundamental"], "answer": "significant", "explanation": "'Significant' means large and important."},
            {"question": "From my ___, the benefits outweigh the drawbacks.", "options": ["consequence", "perspective", "influence"], "answer": "perspective", "explanation": "'Perspective' means point of view."}
        ]
    },
    # Unit 1: Society - Grammar
    {
        "id": "d-u1-grammar",
        "title": "Unit 1: Passive Voice",
        "band_level": "development",
        "type": "grammar",
        "unit_number": 1,
        "description": "Use passive voice for formal and academic writing",
        "ielts_relevance": "Passive voice is essential for Writing Task 1 and formal Task 2 essays.",
        "items": [
            {"id": "d1g1", "word": "Present Passive", "part_of_speech": "grammar", "definition": "am/is/are + past participle", "examples": ["English is spoken worldwide.", "Cars are produced in factories.", "The work is done by machines."], "grammar_formula": "am/is/are + past participle", "common_mistakes": ["English is speak → is spoken"], "ielts_tip": "Common in process descriptions."},
            {"id": "d1g2", "word": "Past Passive", "part_of_speech": "grammar", "definition": "was/were + past participle", "examples": ["The bridge was built in 1990.", "Many houses were destroyed.", "The law was passed."], "grammar_formula": "was/were + past participle", "common_mistakes": ["was build → was built"], "ielts_tip": "For completed actions in the past."},
            {"id": "d1g3", "word": "Perfect Passive", "part_of_speech": "grammar", "definition": "have/has been + past participle", "examples": ["Progress has been made.", "Changes have been implemented.", "The problem has been solved."], "grammar_formula": "have/has been + past participle", "common_mistakes": ["has been solve → has been solved"], "ielts_tip": "For recent changes or developments."},
            {"id": "d1g4", "word": "By + Agent", "part_of_speech": "grammar", "definition": "Who/what does the action", "examples": ["The report was written by researchers.", "Decisions are made by managers.", "Often omitted when obvious."], "grammar_formula": "passive + by + agent", "common_mistakes": ["written from → written by"], "ielts_tip": "Only include agent if important."},
            {"id": "d1g5", "word": "When to Use Passive", "part_of_speech": "grammar", "definition": "Focus on action, not doer", "examples": ["The email was sent. (who doesn't matter)", "Mistakes were made. (avoiding blame)", "The pyramids were built..."], "grammar_formula": "When doer unknown/unimportant", "common_mistakes": ["Overusing passive makes writing dull"], "ielts_tip": "Mix passive and active for Band 7+."}
        ],
        "quiz_questions": [
            {"question": "English ___ in many countries.", "options": ["speaks", "is spoken", "spoken"], "answer": "is spoken", "explanation": "Present passive: is + past participle."},
            {"question": "The report ___ by the research team.", "options": ["was written", "was write", "written"], "answer": "was written", "explanation": "Past passive with 'by' for the agent."},
            {"question": "Many improvements ___ in recent years.", "options": ["have made", "have been made", "were making"], "answer": "have been made", "explanation": "Present perfect passive for recent changes."}
        ]
    },
    
    # Unit 2: Environment - Vocabulary
    {
        "id": "d-u2-vocab",
        "title": "Unit 2: Environment & Sustainability",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 2,
        "description": "Essential environmental vocabulary for IELTS essays",
        "ielts_relevance": "Environment is one of the most common Writing Task 2 topics.",
        "items": [
            {"id": "d2v1", "word": "sustainable", "ipa": "/səˈsteɪ.nə.bəl/", "part_of_speech": "adjective", "definition": "Can continue without damaging environment", "examples": ["Sustainable development.", "Sustainable energy sources.", "A sustainable approach."], "collocations": ["sustainable development", "sustainable energy", "environmentally sustainable"], "ielts_tip": "Key word for environment essays."},
            {"id": "d2v2", "word": "pollution", "ipa": "/pəˈluː.ʃən/", "part_of_speech": "noun", "definition": "Harmful substances in environment", "examples": ["Air pollution is increasing.", "Plastic pollution in oceans.", "Reduce pollution levels."], "collocations": ["air pollution", "water pollution", "cause pollution"], "ielts_tip": "Related: pollute (v), pollutant (n)."},
            {"id": "d2v3", "word": "emission", "ipa": "/ɪˈmɪʃ.ən/", "part_of_speech": "noun", "definition": "Gas or substance sent into air", "examples": ["Carbon emissions.", "Reduce emissions by 50%.", "Vehicle emissions."], "collocations": ["carbon emissions", "greenhouse gas emissions", "reduce emissions"], "ielts_tip": "Usually plural: emissions."},
            {"id": "d2v4", "word": "renewable", "ipa": "/rɪˈnjuː.ə.bəl/", "part_of_speech": "adjective", "definition": "Can be replaced naturally", "examples": ["Renewable energy.", "Renewable resources.", "Solar power is renewable."], "collocations": ["renewable energy", "renewable resources", "renewable sources"], "ielts_tip": "Opposite: non-renewable (oil, coal)."},
            {"id": "d2v5", "word": "conservation", "ipa": "/ˌkɒn.səˈveɪ.ʃən/", "part_of_speech": "noun", "definition": "Protecting natural resources", "examples": ["Wildlife conservation.", "Energy conservation.", "Conservation efforts."], "collocations": ["conservation efforts", "wildlife conservation", "conservation area"], "ielts_tip": "Different from 'preservation'."},
            {"id": "d2v6", "word": "biodiversity", "ipa": "/ˌbaɪ.əʊ.daɪˈvɜː.sə.ti/", "part_of_speech": "noun", "definition": "Variety of plant and animal life", "examples": ["Loss of biodiversity.", "Protect biodiversity.", "Rich biodiversity."], "collocations": ["biodiversity loss", "protect biodiversity", "rich in biodiversity"], "ielts_tip": "Academic term for nature variety."},
            {"id": "d2v7", "word": "habitat", "ipa": "/ˈhæb.ɪ.tæt/", "part_of_speech": "noun", "definition": "Natural home of animals/plants", "examples": ["Natural habitat.", "Habitat destruction.", "Protect habitats."], "collocations": ["natural habitat", "habitat loss", "wildlife habitat"], "ielts_tip": "Animals live in habitats."},
            {"id": "d2v8", "word": "recycle", "ipa": "/ˌriːˈsaɪ.kəl/", "part_of_speech": "verb", "definition": "Convert waste to reusable material", "examples": ["Recycle plastic.", "Recycling programs.", "Recycled materials."], "collocations": ["recycle waste", "recycling bin", "recycled products"], "ielts_tip": "Also: recyclable, recycling (noun)."},
            {"id": "d2v9", "word": "deforestation", "ipa": "/diːˌfɒr.ɪˈsteɪ.ʃən/", "part_of_speech": "noun", "definition": "Cutting down forests", "examples": ["Deforestation is a major problem.", "Prevent deforestation.", "Deforestation in rainforests."], "collocations": ["cause deforestation", "rate of deforestation", "stop deforestation"], "ielts_tip": "De- prefix = removal."},
            {"id": "d2v10", "word": "ecosystem", "ipa": "/ˈiː.kəʊˌsɪs.təm/", "part_of_speech": "noun", "definition": "Living things and their environment", "examples": ["Marine ecosystems.", "Damage to ecosystems.", "A balanced ecosystem."], "collocations": ["marine ecosystem", "fragile ecosystem", "ecosystem services"], "ielts_tip": "Shows scientific vocabulary."}
        ],
        "quiz_questions": [
            {"question": "___ development meets current needs without harming future generations.", "options": ["Renewable", "Sustainable", "Emission"], "answer": "Sustainable", "explanation": "'Sustainable' means can continue long-term."},
            {"question": "Governments should reduce carbon ___.", "options": ["pollution", "emissions", "habitats"], "answer": "emissions", "explanation": "'Emissions' refers to gases released into the air."},
            {"question": "___ energy comes from sources like solar and wind.", "options": ["Renewable", "Sustainable", "Conservation"], "answer": "Renewable", "explanation": "'Renewable' energy can be replaced naturally."}
        ]
    },
    
    # Unit 3: Technology - Vocabulary
    {
        "id": "d-u3-vocab",
        "title": "Unit 3: Technology & Innovation",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 3,
        "description": "Technology vocabulary for modern IELTS topics",
        "ielts_relevance": "Technology appears frequently in Speaking and Writing.",
        "items": [
            {"id": "d3v1", "word": "innovation", "ipa": "/ˌɪn.əˈveɪ.ʃən/", "part_of_speech": "noun", "definition": "New ideas, methods or inventions", "examples": ["Technological innovation.", "Innovation drives progress.", "The latest innovations."], "collocations": ["technological innovation", "drive innovation", "innovation in"], "ielts_tip": "Related: innovative (adj), innovate (v)."},
            {"id": "d3v2", "word": "efficient", "ipa": "/ɪˈfɪʃ.ənt/", "part_of_speech": "adjective", "definition": "Working well without wasting resources", "examples": ["Energy efficient.", "More efficient methods.", "An efficient system."], "collocations": ["energy efficient", "cost efficient", "more efficient"], "ielts_tip": "Noun: efficiency."},
            {"id": "d3v3", "word": "automation", "ipa": "/ˌɔː.təˈmeɪ.ʃən/", "part_of_speech": "noun", "definition": "Using machines instead of people", "examples": ["Automation in factories.", "Job losses due to automation.", "Automated systems."], "collocations": ["factory automation", "automation technology", "increasing automation"], "ielts_tip": "Related to AI and jobs discussions."},
            {"id": "d3v4", "word": "digital", "ipa": "/ˈdɪdʒ.ɪ.təl/", "part_of_speech": "adjective", "definition": "Using computer technology", "examples": ["Digital technology.", "The digital age.", "Digital communication."], "collocations": ["digital technology", "digital age", "digital divide"], "ielts_tip": "Opposite: analogue."},
            {"id": "d3v5", "word": "revolutionise", "ipa": "/ˌrev.əˈluː.ʃən.aɪz/", "part_of_speech": "verb", "definition": "Completely change something", "examples": ["Technology has revolutionised communication.", "Revolutionise the industry.", "A revolutionary idea."], "collocations": ["revolutionise the way", "has revolutionised", "revolutionary change"], "ielts_tip": "Strong verb for major changes."},
            {"id": "d3v6", "word": "access", "ipa": "/ˈæk.ses/", "part_of_speech": "noun/verb", "definition": "Ability to use or reach something", "examples": ["Access to information.", "Internet access.", "Access services online."], "collocations": ["have access to", "gain access", "internet access"], "ielts_tip": "Access TO something."},
            {"id": "d3v7", "word": "advance", "ipa": "/ədˈvɑːns/", "part_of_speech": "noun/verb", "definition": "Progress or development", "examples": ["Technological advances.", "Medicine has advanced.", "Major advances in science."], "collocations": ["technological advances", "advance in", "make advances"], "ielts_tip": "Noun: advance(s), Adjective: advanced."},
            {"id": "d3v8", "word": "virtual", "ipa": "/ˈvɜː.tju.əl/", "part_of_speech": "adjective", "definition": "Online, not physically real", "examples": ["Virtual meetings.", "Virtual reality.", "A virtual world."], "collocations": ["virtual reality", "virtual meeting", "virtual learning"], "ielts_tip": "Increasingly common post-COVID."},
            {"id": "d3v9", "word": "device", "ipa": "/dɪˈvaɪs/", "part_of_speech": "noun", "definition": "A piece of equipment", "examples": ["Mobile devices.", "Electronic devices.", "Smart devices."], "collocations": ["mobile device", "electronic device", "smart device"], "ielts_tip": "Phones, tablets, laptops are devices."},
            {"id": "d3v10", "word": "artificial intelligence", "ipa": "/ˌɑː.tɪˈfɪʃ.əl ɪnˈtel.ɪ.dʒəns/", "part_of_speech": "noun", "definition": "Computer systems doing human tasks", "examples": ["AI is developing rapidly.", "Artificial intelligence in healthcare.", "The rise of AI."], "collocations": ["artificial intelligence", "AI technology", "AI applications"], "ielts_tip": "Often abbreviated to AI."}
        ],
        "quiz_questions": [
            {"question": "Smartphones have ___ the way we communicate.", "options": ["innovated", "revolutionised", "automated"], "answer": "revolutionised", "explanation": "'Revolutionise' means completely change."},
            {"question": "Many people don't have ___ to the internet.", "options": ["access", "device", "advance"], "answer": "access", "explanation": "'Access to' means ability to use."},
            {"question": "Modern appliances are more energy ___.", "options": ["digital", "efficient", "virtual"], "answer": "efficient", "explanation": "'Efficient' means working well without waste."}
        ]
    },
    
    # Unit 4: Health - Vocabulary
    {
        "id": "d-u4-vocab",
        "title": "Unit 4: Health & Wellbeing",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 4,
        "description": "Health vocabulary for IELTS discussions",
        "ielts_relevance": "Health topics appear in all IELTS skills.",
        "items": [
            {"id": "d4v1", "word": "obesity", "ipa": "/əʊˈbiː.sə.ti/", "part_of_speech": "noun", "definition": "Being very overweight", "examples": ["Obesity rates are rising.", "Childhood obesity.", "Combat obesity."], "collocations": ["obesity epidemic", "childhood obesity", "obesity rates"], "ielts_tip": "More clinical than 'being fat'."},
            {"id": "d4v2", "word": "sedentary", "ipa": "/ˈsed.ən.tər.i/", "part_of_speech": "adjective", "definition": "Involving little physical activity", "examples": ["A sedentary lifestyle.", "Sedentary jobs.", "Avoid being sedentary."], "collocations": ["sedentary lifestyle", "sedentary job", "sedentary behaviour"], "ielts_tip": "Opposite: active lifestyle."},
            {"id": "d4v3", "word": "chronic", "ipa": "/ˈkrɒn.ɪk/", "part_of_speech": "adjective", "definition": "Lasting for a long time", "examples": ["Chronic diseases.", "Chronic pain.", "Chronic health problems."], "collocations": ["chronic disease", "chronic illness", "chronic condition"], "ielts_tip": "Opposite: acute (short-term)."},
            {"id": "d4v4", "word": "mental health", "ipa": "/ˈmen.təl helθ/", "part_of_speech": "noun", "definition": "Psychological wellbeing", "examples": ["Mental health awareness.", "Protect mental health.", "Mental health issues."], "collocations": ["mental health problems", "mental health support", "mental health awareness"], "ielts_tip": "Increasingly important topic."},
            {"id": "d4v5", "word": "prevention", "ipa": "/prɪˈven.ʃən/", "part_of_speech": "noun", "definition": "Stopping something before it happens", "examples": ["Disease prevention.", "Prevention is better than cure.", "Prevention strategies."], "collocations": ["disease prevention", "crime prevention", "prevention is better than cure"], "ielts_tip": "Verb: prevent."},
            {"id": "d4v6", "word": "nutritious", "ipa": "/njuːˈtrɪʃ.əs/", "part_of_speech": "adjective", "definition": "Good for health, nourishing", "examples": ["Nutritious food.", "A nutritious diet.", "Nutritious meals."], "collocations": ["nutritious food", "nutritious diet", "nutritious meal"], "ielts_tip": "Better than 'healthy food'."},
            {"id": "d4v7", "word": "symptom", "ipa": "/ˈsɪmp.təm/", "part_of_speech": "noun", "definition": "Sign of an illness", "examples": ["Common symptoms.", "Symptoms of stress.", "Recognise symptoms."], "collocations": ["common symptoms", "symptoms of", "develop symptoms"], "ielts_tip": "Signs that show illness."},
            {"id": "d4v8", "word": "treatment", "ipa": "/ˈtriːt.mənt/", "part_of_speech": "noun", "definition": "Medical care for illness", "examples": ["Medical treatment.", "Treatment options.", "Effective treatment."], "collocations": ["medical treatment", "treatment for", "receive treatment"], "ielts_tip": "Verb: treat."},
            {"id": "d4v9", "word": "wellbeing", "ipa": "/ˌwelˈbiː.ɪŋ/", "part_of_speech": "noun", "definition": "State of being healthy and happy", "examples": ["Physical and mental wellbeing.", "Employee wellbeing.", "Improve wellbeing."], "collocations": ["physical wellbeing", "mental wellbeing", "sense of wellbeing"], "ielts_tip": "Holistic health concept."},
            {"id": "d4v10", "word": "diet", "ipa": "/ˈdaɪ.ət/", "part_of_speech": "noun", "definition": "Food regularly eaten", "examples": ["A balanced diet.", "Healthy diet.", "Change your diet."], "collocations": ["balanced diet", "healthy diet", "go on a diet"], "ielts_tip": "Regular food, OR eating less to lose weight."}
        ],
        "quiz_questions": [
            {"question": "___ diseases last for a long time.", "options": ["Chronic", "Nutritious", "Sedentary"], "answer": "Chronic", "explanation": "'Chronic' means lasting a long time."},
            {"question": "A ___ lifestyle with little exercise is unhealthy.", "options": ["chronic", "sedentary", "nutritious"], "answer": "sedentary", "explanation": "'Sedentary' means sitting a lot, little activity."},
            {"question": "Eating ___ food helps prevent diseases.", "options": ["sedentary", "chronic", "nutritious"], "answer": "nutritious", "explanation": "'Nutritious' means healthy and nourishing."}
        ]
    },
    
    # Unit 5: Globalisation - Vocabulary  
    {
        "id": "d-u5-vocab",
        "title": "Unit 5: Globalisation & Culture",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 5,
        "description": "Vocabulary for discussing globalisation and cultural change",
        "ielts_relevance": "Common topic in Writing Task 2 and Speaking Part 3.",
        "items": [
            {"id": "d5v1", "word": "globalisation", "ipa": "/ˌɡləʊ.bəl.aɪˈzeɪ.ʃən/", "part_of_speech": "noun", "definition": "Process of worldwide integration", "examples": ["Effects of globalisation.", "Globalisation has increased trade.", "Critics of globalisation."], "collocations": ["effects of globalisation", "era of globalisation", "globalisation process"], "ielts_tip": "Can be positive or negative."},
            {"id": "d5v2", "word": "cultural", "ipa": "/ˈkʌl.tʃər.əl/", "part_of_speech": "adjective", "definition": "Related to culture and traditions", "examples": ["Cultural differences.", "Cultural exchange.", "Cultural heritage."], "collocations": ["cultural differences", "cultural heritage", "cultural identity"], "ielts_tip": "Noun: culture."},
            {"id": "d5v3", "word": "diversity", "ipa": "/daɪˈvɜː.sə.ti/", "part_of_speech": "noun", "definition": "Variety, range of different things", "examples": ["Cultural diversity.", "Diversity in the workplace.", "Celebrate diversity."], "collocations": ["cultural diversity", "promote diversity", "diversity and inclusion"], "ielts_tip": "Adjective: diverse."},
            {"id": "d5v4", "word": "tradition", "ipa": "/trəˈdɪʃ.ən/", "part_of_speech": "noun", "definition": "Customs passed through generations", "examples": ["Local traditions.", "Preserve traditions.", "Traditional customs."], "collocations": ["local traditions", "cultural traditions", "preserve traditions"], "ielts_tip": "Adjective: traditional."},
            {"id": "d5v5", "word": "preserve", "ipa": "/prɪˈzɜːv/", "part_of_speech": "verb", "definition": "Keep something in original state", "examples": ["Preserve culture.", "Preserve traditions.", "Well-preserved buildings."], "collocations": ["preserve culture", "preserve heritage", "well preserved"], "ielts_tip": "Keep unchanged over time."},
            {"id": "d5v6", "word": "indigenous", "ipa": "/ɪnˈdɪdʒ.ɪ.nəs/", "part_of_speech": "adjective", "definition": "Native, originally from a place", "examples": ["Indigenous people.", "Indigenous cultures.", "Indigenous languages."], "collocations": ["indigenous people", "indigenous culture", "indigenous population"], "ielts_tip": "The original inhabitants."},
            {"id": "d5v7", "word": "identity", "ipa": "/aɪˈden.tə.ti/", "part_of_speech": "noun", "definition": "Who you are, sense of self", "examples": ["Cultural identity.", "National identity.", "Lose your identity."], "collocations": ["cultural identity", "national identity", "sense of identity"], "ielts_tip": "Important in culture discussions."},
            {"id": "d5v8", "word": "integrate", "ipa": "/ˈɪn.tɪ.ɡreɪt/", "part_of_speech": "verb", "definition": "Become part of a group/society", "examples": ["Integrate into society.", "Integration of immigrants.", "Fully integrated."], "collocations": ["integrate into", "social integration", "fully integrated"], "ielts_tip": "Noun: integration."},
            {"id": "d5v9", "word": "homogeneous", "ipa": "/ˌhɒm.əˈdʒiː.ni.əs/", "part_of_speech": "adjective", "definition": "All the same, uniform", "examples": ["A homogeneous society.", "Becoming more homogeneous.", "Less homogeneous."], "collocations": ["homogeneous society", "homogeneous culture", "become homogeneous"], "ielts_tip": "Opposite: heterogeneous (diverse)."},
            {"id": "d5v10", "word": "heritage", "ipa": "/ˈher.ɪ.tɪdʒ/", "part_of_speech": "noun", "definition": "Traditions and history from past", "examples": ["Cultural heritage.", "Heritage sites.", "Preserve heritage."], "collocations": ["cultural heritage", "world heritage", "heritage site"], "ielts_tip": "What's passed down from ancestors."}
        ],
        "quiz_questions": [
            {"question": "___ is the process of worldwide connection and integration.", "options": ["Diversity", "Globalisation", "Heritage"], "answer": "Globalisation", "explanation": "'Globalisation' means worldwide integration."},
            {"question": "We should ___ traditional customs for future generations.", "options": ["integrate", "preserve", "homogeneous"], "answer": "preserve", "explanation": "'Preserve' means keep in original state."},
            {"question": "The city has great cultural ___.", "options": ["identity", "diversity", "indigenous"], "answer": "diversity", "explanation": "'Diversity' means variety of different things."}
        ]
    },
]

# ============================================================
# ADVANCED LEVEL (Band 7.0+) - 10 Units
# Focus: Sophisticated vocabulary and complex grammar
# ============================================================

ADVANCED_UNITS = [
    # Unit 1: Academic Discussion - Vocabulary
    {
        "id": "a-u1-vocab",
        "title": "Unit 1: Academic Discussion & Argument",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 1,
        "description": "Sophisticated vocabulary for Band 7+ academic writing",
        "ielts_relevance": "Essential for achieving high bands in Writing Task 2.",
        "items": [
            {"id": "a1v1", "word": "arguably", "ipa": "/ˈɑːɡ.ju.ə.bli/", "part_of_speech": "adverb", "definition": "It can be argued that", "examples": ["Arguably the best solution.", "This is arguably true.", "Arguably more important."], "collocations": ["arguably the most", "arguably better", "arguably true"], "ielts_tip": "Shows you're making a debatable claim."},
            {"id": "a1v2", "word": "contentious", "ipa": "/kənˈten.ʃəs/", "part_of_speech": "adjective", "definition": "Causing disagreement", "examples": ["A contentious issue.", "Contentious debate.", "Highly contentious."], "collocations": ["contentious issue", "contentious topic", "highly contentious"], "ielts_tip": "More sophisticated than 'controversial'."},
            {"id": "a1v3", "word": "nuanced", "ipa": "/ˈnjuː.ɑːnst/", "part_of_speech": "adjective", "definition": "Having subtle differences", "examples": ["A nuanced argument.", "More nuanced understanding.", "Nuanced approach."], "collocations": ["nuanced view", "nuanced argument", "more nuanced"], "ielts_tip": "Shows sophisticated thinking."},
            {"id": "a1v4", "word": "inherent", "ipa": "/ɪnˈher.ənt/", "part_of_speech": "adjective", "definition": "Existing as a natural part", "examples": ["Inherent problems.", "Inherently flawed.", "Inherent in the system."], "collocations": ["inherent in", "inherent problem", "inherently flawed"], "ielts_tip": "Built-in, natural part of something."},
            {"id": "a1v5", "word": "feasible", "ipa": "/ˈfiː.zə.bəl/", "part_of_speech": "adjective", "definition": "Possible and practical", "examples": ["A feasible solution.", "Not feasible.", "Economically feasible."], "collocations": ["feasible solution", "feasible option", "not feasible"], "ielts_tip": "Can actually be done in practice."},
            {"id": "a1v6", "word": "mitigate", "ipa": "/ˈmɪt.ɪ.ɡeɪt/", "part_of_speech": "verb", "definition": "Make less severe", "examples": ["Mitigate the effects.", "Mitigate risks.", "Mitigation measures."], "collocations": ["mitigate the impact", "mitigate risks", "mitigate against"], "ielts_tip": "More academic than 'reduce'."},
            {"id": "a1v7", "word": "exacerbate", "ipa": "/ɪɡˈzæs.ə.beɪt/", "part_of_speech": "verb", "definition": "Make a problem worse", "examples": ["Exacerbate the problem.", "This will exacerbate.", "Exacerbated by poverty."], "collocations": ["exacerbate the problem", "exacerbate the situation", "further exacerbate"], "ielts_tip": "Opposite of mitigate."},
            {"id": "a1v8", "word": "paradigm", "ipa": "/ˈpær.ə.daɪm/", "part_of_speech": "noun", "definition": "A typical pattern or model", "examples": ["A paradigm shift.", "New paradigm.", "Challenge the paradigm."], "collocations": ["paradigm shift", "new paradigm", "dominant paradigm"], "ielts_tip": "Academic way to say 'model' or 'approach'."},
            {"id": "a1v9", "word": "unprecedented", "ipa": "/ʌnˈpres.ɪ.den.tɪd/", "part_of_speech": "adjective", "definition": "Never happened before", "examples": ["Unprecedented growth.", "Unprecedented times.", "An unprecedented event."], "collocations": ["unprecedented growth", "unprecedented levels", "unprecedented scale"], "ielts_tip": "First time in history."},
            {"id": "a1v10", "word": "encompass", "ipa": "/ɪnˈkʌm.pəs/", "part_of_speech": "verb", "definition": "Include many things", "examples": ["Encompass various aspects.", "The term encompasses.", "A broad category encompassing."], "collocations": ["encompass a range of", "encompassing various", "broadly encompass"], "ielts_tip": "More formal than 'include'."}
        ],
        "quiz_questions": [
            {"question": "Climate change is ___ the most pressing issue of our time.", "options": ["feasibly", "arguably", "inherently"], "answer": "arguably", "explanation": "'Arguably' means it can be argued/debated."},
            {"question": "The new policy will ___ the effects of pollution.", "options": ["exacerbate", "mitigate", "encompass"], "answer": "mitigate", "explanation": "'Mitigate' means make less severe."},
            {"question": "Poverty can ___ existing social problems.", "options": ["mitigate", "exacerbate", "feasible"], "answer": "exacerbate", "explanation": "'Exacerbate' means make worse."}
        ]
    },
    # Unit 1: Academic Grammar
    {
        "id": "a-u1-grammar",
        "title": "Unit 1: Hedging & Academic Caution",
        "band_level": "advanced",
        "type": "grammar",
        "unit_number": 1,
        "description": "Use hedging language for academic writing",
        "ielts_relevance": "Hedging shows sophistication in Writing Task 2.",
        "items": [
            {"id": "a1g1", "word": "Modal Hedging", "part_of_speech": "grammar", "definition": "may, might, could + verb", "examples": ["This may lead to problems.", "This could be argued.", "It might have negative effects."], "grammar_formula": "may/might/could + base verb", "common_mistakes": ["This will definitely → This may/might"], "ielts_tip": "Avoid absolute statements."},
            {"id": "a1g2", "word": "Adverb Hedging", "part_of_speech": "grammar", "definition": "perhaps, possibly, probably, arguably", "examples": ["This is arguably true.", "Perhaps the best approach.", "This is probably effective."], "grammar_formula": "adverb + claim", "common_mistakes": ["is definitely → is arguably/probably"], "ielts_tip": "Shows academic caution."},
            {"id": "a1g3", "word": "Verb Hedging", "part_of_speech": "grammar", "definition": "seem, appear, tend, suggest", "examples": ["This seems to indicate.", "Evidence suggests that.", "People tend to believe."], "grammar_formula": "hedging verb + that clause", "common_mistakes": ["This is → This appears to be"], "ielts_tip": "More tentative claims."},
            {"id": "a1g4", "word": "Noun Hedging", "part_of_speech": "grammar", "definition": "tendency, possibility, likelihood", "examples": ["There is a tendency to.", "The possibility exists.", "There is some likelihood."], "grammar_formula": "There is a/some + hedging noun", "common_mistakes": ["It will happen → There is a possibility"], "ielts_tip": "Nominalisation for formality."},
            {"id": "a1g5", "word": "Quantifier Hedging", "part_of_speech": "grammar", "definition": "some, many, most, certain", "examples": ["Some researchers argue.", "Many people believe.", "In certain cases."], "grammar_formula": "quantifier + noun", "common_mistakes": ["All people → Many/Most people"], "ielts_tip": "Avoid 'all', 'every', 'never'."}
        ],
        "quiz_questions": [
            {"question": "Technology ___ have negative effects on children.", "options": ["will definitely", "may", "always"], "answer": "may", "explanation": "'May' shows possibility without certainty."},
            {"question": "___ researchers argue that the benefits outweigh the costs.", "options": ["All", "Some", "Every"], "answer": "Some", "explanation": "'Some' hedges the claim - not all agree."},
            {"question": "This ___ to be the most effective solution.", "options": ["is definitely", "appears", "always"], "answer": "appears", "explanation": "'Appears' shows tentative conclusion."}
        ]
    },
    
    # Unit 2: Complex Arguments - Vocabulary
    {
        "id": "a-u2-vocab",
        "title": "Unit 2: Building Complex Arguments",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 2,
        "description": "Vocabulary for developing sophisticated arguments",
        "ielts_relevance": "Essential for high-band essay structures.",
        "items": [
            {"id": "a2v1", "word": "notwithstanding", "ipa": "/ˌnɒt.wɪθˈstæn.dɪŋ/", "part_of_speech": "preposition", "definition": "Despite, in spite of", "examples": ["Notwithstanding these problems.", "The plan succeeded notwithstanding the challenges.", "Notwithstanding the cost."], "collocations": ["notwithstanding the fact", "notwithstanding this", "notwithstanding these challenges"], "ielts_tip": "Very formal 'despite'."},
            {"id": "a2v2", "word": "hitherto", "ipa": "/ˌhɪð.əˈtuː/", "part_of_speech": "adverb", "definition": "Until now, previously", "examples": ["Hitherto unknown.", "Hitherto, this was not possible.", "A hitherto unsolved problem."], "collocations": ["hitherto unknown", "hitherto unseen", "hitherto impossible"], "ielts_tip": "Very formal 'until now'."},
            {"id": "a2v3", "word": "therein", "ipa": "/ˌðeərˈɪn/", "part_of_speech": "adverb", "definition": "In that place/document/situation", "examples": ["Therein lies the problem.", "The rules therein.", "And therein lies the difficulty."], "collocations": ["therein lies", "therein contained", "problems therein"], "ielts_tip": "Formal reference."},
            {"id": "a2v4", "word": "whereby", "ipa": "/weəˈbaɪ/", "part_of_speech": "adverb", "definition": "By which, through which", "examples": ["A system whereby students learn.", "The process whereby.", "An arrangement whereby."], "collocations": ["a system whereby", "process whereby", "means whereby"], "ielts_tip": "Formal way to explain how."},
            {"id": "a2v5", "word": "insofar as", "ipa": "/ˌɪn.səʊˈfɑːr.æz/", "part_of_speech": "conjunction", "definition": "To the extent that", "examples": ["Insofar as this is true.", "Insofar as possible.", "Insofar as the evidence shows."], "collocations": ["insofar as possible", "insofar as this", "insofar as it"], "ielts_tip": "Sets limits on a claim."},
            {"id": "a2v6", "word": "albeit", "ipa": "/ɔːlˈbiː.ɪt/", "part_of_speech": "conjunction", "definition": "Although, even though", "examples": ["Albeit slowly.", "Important, albeit limited.", "Progress, albeit gradual."], "collocations": ["albeit slowly", "albeit limited", "albeit small"], "ielts_tip": "Concise way to add contrast."},
            {"id": "a2v7", "word": "pertinent", "ipa": "/ˈpɜː.tɪ.nənt/", "part_of_speech": "adjective", "definition": "Directly relevant", "examples": ["Pertinent points.", "A pertinent question.", "Pertinent to the discussion."], "collocations": ["pertinent to", "pertinent question", "pertinent point"], "ielts_tip": "More formal than 'relevant'."},
            {"id": "a2v8", "word": "substantiate", "ipa": "/səbˈstæn.ʃi.eɪt/", "part_of_speech": "verb", "definition": "Provide evidence for", "examples": ["Substantiate the claim.", "Difficult to substantiate.", "Evidence to substantiate."], "collocations": ["substantiate the claim", "substantiate the argument", "difficult to substantiate"], "ielts_tip": "Back up with evidence."},
            {"id": "a2v9", "word": "corroborate", "ipa": "/kəˈrɒb.ə.reɪt/", "part_of_speech": "verb", "definition": "Confirm, support with evidence", "examples": ["Studies corroborate this.", "Corroborating evidence.", "To corroborate the findings."], "collocations": ["corroborate the findings", "corroborating evidence", "studies corroborate"], "ielts_tip": "Strong academic verb."},
            {"id": "a2v10", "word": "refute", "ipa": "/rɪˈfjuːt/", "part_of_speech": "verb", "definition": "Prove something wrong", "examples": ["Refute the argument.", "This refutes the claim.", "Difficult to refute."], "collocations": ["refute the claim", "refute the argument", "cannot refute"], "ielts_tip": "Disprove with evidence."}
        ],
        "quiz_questions": [
            {"question": "The project succeeded, ___ the many challenges.", "options": ["albeit", "notwithstanding", "whereby"], "answer": "notwithstanding", "explanation": "'Notwithstanding' means despite."},
            {"question": "There is limited evidence to ___ this claim.", "options": ["refute", "substantiate", "corroborate"], "answer": "substantiate", "explanation": "'Substantiate' means provide evidence for."},
            {"question": "Progress was made, ___ slowly.", "options": ["notwithstanding", "albeit", "whereby"], "answer": "albeit", "explanation": "'Albeit' means although (concessive)."}
        ]
    },
    
    # Unit 3: Cause & Effect - Vocabulary
    {
        "id": "a-u3-vocab",
        "title": "Unit 3: Cause & Effect Language",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 3,
        "description": "Advanced language for discussing causes and effects",
        "ielts_relevance": "Critical for cause-effect essays and Speaking Part 3.",
        "items": [
            {"id": "a3v1", "word": "stem from", "ipa": "/stem frɒm/", "part_of_speech": "phrasal verb", "definition": "Originate from, be caused by", "examples": ["Problems stem from poverty.", "This stems from ignorance.", "Issues stemming from."], "collocations": ["stem from", "stemming from", "stems largely from"], "ielts_tip": "Formal cause expression."},
            {"id": "a3v2", "word": "give rise to", "ipa": "/ɡɪv raɪz tuː/", "part_of_speech": "phrase", "definition": "Cause something to happen", "examples": ["This gives rise to problems.", "Giving rise to concerns.", "May give rise to."], "collocations": ["give rise to", "giving rise to", "has given rise to"], "ielts_tip": "Formal 'cause/lead to'."},
            {"id": "a3v3", "word": "attribute to", "ipa": "/əˈtrɪb.juːt tuː/", "part_of_speech": "phrasal verb", "definition": "Say something is caused by", "examples": ["Success attributed to hard work.", "This can be attributed to.", "Attributable to."], "collocations": ["attribute to", "attributed to", "attributable to"], "ielts_tip": "Assign cause/credit."},
            {"id": "a3v4", "word": "precipitate", "ipa": "/prɪˈsɪp.ɪ.teɪt/", "part_of_speech": "verb", "definition": "Cause to happen suddenly", "examples": ["Precipitate a crisis.", "Events that precipitated.", "This precipitated change."], "collocations": ["precipitate a crisis", "precipitate change", "precipitate events"], "ielts_tip": "Cause sudden change."},
            {"id": "a3v5", "word": "ramification", "ipa": "/ˌræm.ɪ.fɪˈkeɪ.ʃən/", "part_of_speech": "noun", "definition": "Complex consequence", "examples": ["The ramifications are serious.", "Consider the ramifications.", "Far-reaching ramifications."], "collocations": ["ramifications of", "serious ramifications", "far-reaching ramifications"], "ielts_tip": "Complex, spreading effects."},
            {"id": "a3v6", "word": "repercussion", "ipa": "/ˌriː.pəˈkʌʃ.ən/", "part_of_speech": "noun", "definition": "Unintended consequence", "examples": ["Negative repercussions.", "Political repercussions.", "Without repercussions."], "collocations": ["negative repercussions", "serious repercussions", "suffer repercussions"], "ielts_tip": "Usually negative effects."},
            {"id": "a3v7", "word": "catalyst", "ipa": "/ˈkæt.əl.ɪst/", "part_of_speech": "noun", "definition": "Something that causes change", "examples": ["A catalyst for change.", "Act as a catalyst.", "The main catalyst."], "collocations": ["catalyst for change", "act as a catalyst", "main catalyst"], "ielts_tip": "Thing that triggers change."},
            {"id": "a3v8", "word": "culminate in", "ipa": "/ˈkʌl.mɪ.neɪt ɪn/", "part_of_speech": "phrasal verb", "definition": "End in, reach highest point", "examples": ["Efforts culminated in success.", "Culminating in a crisis.", "Events culminated in."], "collocations": ["culminate in", "culminating in", "culminated in success"], "ielts_tip": "Final result of process."},
            {"id": "a3v9", "word": "engender", "ipa": "/ɪnˈdʒen.dər/", "part_of_speech": "verb", "definition": "Cause a feeling or situation", "examples": ["Engender trust.", "This engenders fear.", "Policies that engender."], "collocations": ["engender trust", "engender fear", "engender support"], "ielts_tip": "Create feelings/conditions."},
            {"id": "a3v10", "word": "underpin", "ipa": "/ˌʌn.dəˈpɪn/", "part_of_speech": "verb", "definition": "Form the basis of, support", "examples": ["Values that underpin society.", "Underpinning the economy.", "Fundamental principles underpin."], "collocations": ["underpin the argument", "underpin society", "underpinning factors"], "ielts_tip": "Form foundation of."}
        ],
        "quiz_questions": [
            {"question": "Social problems often ___ economic inequality.", "options": ["stem from", "culminate in", "engender"], "answer": "stem from", "explanation": "'Stem from' means be caused by."},
            {"question": "This policy could ___ serious problems.", "options": ["give rise to", "attribute to", "underpin"], "answer": "give rise to", "explanation": "'Give rise to' means cause."},
            {"question": "The crisis was a ___ for major reforms.", "options": ["ramification", "repercussion", "catalyst"], "answer": "catalyst", "explanation": "'Catalyst' means something that triggers change."}
        ]
    },
    
    # Unit 4: Expressing Views - Vocabulary
    {
        "id": "a-u4-vocab",
        "title": "Unit 4: Expressing & Evaluating Views",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 4,
        "description": "Sophisticated language for presenting opinions",
        "ielts_relevance": "Essential for opinion essays and Speaking Part 3.",
        "items": [
            {"id": "a4v1", "word": "proponent", "ipa": "/prəˈpəʊ.nənt/", "part_of_speech": "noun", "definition": "Person who supports an idea", "examples": ["Proponents argue that.", "A proponent of change.", "Proponents and opponents."], "collocations": ["proponents of", "proponents argue", "leading proponent"], "ielts_tip": "Opposite: opponent."},
            {"id": "a4v2", "word": "advocate", "ipa": "/ˈæd.və.keɪt/", "part_of_speech": "verb/noun", "definition": "Support publicly, supporter", "examples": ["Advocate for change.", "A strong advocate.", "Advocates argue."], "collocations": ["advocate for", "strong advocate", "advocate change"], "ielts_tip": "Verb: ˈæd.və.keɪt, Noun: ˈæd.və.kət."},
            {"id": "a4v3", "word": "assert", "ipa": "/əˈsɜːt/", "part_of_speech": "verb", "definition": "State firmly as true", "examples": ["Critics assert that.", "It is asserted that.", "Asserting their rights."], "collocations": ["assert that", "assert the right", "strongly assert"], "ielts_tip": "Strong claim."},
            {"id": "a4v4", "word": "contend", "ipa": "/kənˈtend/", "part_of_speech": "verb", "definition": "Argue that something is true", "examples": ["Some contend that.", "As critics contend.", "Contending views."], "collocations": ["contend that", "as some contend", "contending parties"], "ielts_tip": "Academic 'argue'."},
            {"id": "a4v5", "word": "rebut", "ipa": "/rɪˈbʌt/", "part_of_speech": "verb", "definition": "Argue against, disprove", "examples": ["Rebut the argument.", "Difficult to rebut.", "A rebuttal of the claim."], "collocations": ["rebut the claim", "rebut the argument", "effectively rebut"], "ielts_tip": "Argue against with evidence."},
            {"id": "a4v6", "word": "concede", "ipa": "/kənˈsiːd/", "part_of_speech": "verb", "definition": "Admit something is true", "examples": ["Critics concede that.", "It must be conceded.", "While conceding this point."], "collocations": ["concede that", "must concede", "concede a point"], "ielts_tip": "Admit opponent has a point."},
            {"id": "a4v7", "word": "dismiss", "ipa": "/dɪsˈmɪs/", "part_of_speech": "verb", "definition": "Reject as unimportant", "examples": ["Cannot be dismissed.", "Dismiss the argument.", "Dismissing concerns."], "collocations": ["dismiss the idea", "cannot be dismissed", "dismiss as"], "ielts_tip": "Reject without consideration."},
            {"id": "a4v8", "word": "endorse", "ipa": "/ɪnˈdɔːs/", "part_of_speech": "verb", "definition": "Publicly support", "examples": ["Endorse the policy.", "Widely endorsed.", "An endorsed approach."], "collocations": ["endorse the view", "widely endorsed", "fully endorse"], "ielts_tip": "Give official support."},
            {"id": "a4v9", "word": "scrutinise", "ipa": "/ˈskruː.tɪ.naɪz/", "part_of_speech": "verb", "definition": "Examine carefully", "examples": ["Scrutinise the evidence.", "Under scrutiny.", "Carefully scrutinised."], "collocations": ["scrutinise carefully", "under scrutiny", "close scrutiny"], "ielts_tip": "Careful examination."},
            {"id": "a4v10", "word": "espouse", "ipa": "/ɪˈspaʊz/", "part_of_speech": "verb", "definition": "Adopt or support a belief", "examples": ["Espouse the view.", "Values espoused by.", "Espousing change."], "collocations": ["espouse the view", "espouse values", "espouse a cause"], "ielts_tip": "Formally adopt a position."}
        ],
        "quiz_questions": [
            {"question": "___ of the policy argue it will boost the economy.", "options": ["Opponents", "Proponents", "Advocates"], "answer": "Proponents", "explanation": "'Proponents' are supporters of an idea."},
            {"question": "While I ___ that there are some benefits...", "options": ["dismiss", "contend", "concede"], "answer": "concede", "explanation": "'Concede' means admit a point."},
            {"question": "These concerns cannot simply be ___.", "options": ["endorsed", "espoused", "dismissed"], "answer": "dismissed", "explanation": "'Dismissed' means rejected as unimportant."}
        ]
    },
    
    # Unit 5: Conclusions & Recommendations - Vocabulary
    {
        "id": "a-u5-vocab",
        "title": "Unit 5: Conclusions & Recommendations",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 5,
        "description": "Language for strong conclusions and recommendations",
        "ielts_relevance": "Essential for concluding Writing Task 2 essays effectively.",
        "items": [
            {"id": "a5v1", "word": "imperative", "ipa": "/ɪmˈper.ə.tɪv/", "part_of_speech": "adjective/noun", "definition": "Absolutely necessary", "examples": ["It is imperative that.", "An economic imperative.", "Imperative to act now."], "collocations": ["it is imperative", "moral imperative", "imperative that"], "ielts_tip": "Strong 'necessary'."},
            {"id": "a5v2", "word": "paramount", "ipa": "/ˈpær.ə.maʊnt/", "part_of_speech": "adjective", "definition": "More important than anything else", "examples": ["Of paramount importance.", "Safety is paramount.", "Paramount concern."], "collocations": ["paramount importance", "of paramount concern", "paramount to"], "ielts_tip": "Strongest 'important'."},
            {"id": "a5v3", "word": "ultimately", "ipa": "/ˈʌl.tɪ.mət.li/", "part_of_speech": "adverb", "definition": "In the end, finally", "examples": ["Ultimately, this will fail.", "Ultimately responsible.", "What ultimately matters."], "collocations": ["ultimately responsible", "ultimately successful", "ultimately depends"], "ielts_tip": "Signals final conclusion."},
            {"id": "a5v4", "word": "indispensable", "ipa": "/ˌɪn.dɪˈspen.sə.bəl/", "part_of_speech": "adjective", "definition": "Absolutely essential", "examples": ["An indispensable tool.", "Indispensable to success.", "Indispensable role."], "collocations": ["indispensable for", "indispensable part", "indispensable tool"], "ielts_tip": "Cannot do without."},
            {"id": "a5v5", "word": "in light of", "ipa": "/ɪn laɪt ɒv/", "part_of_speech": "phrase", "definition": "Considering, because of", "examples": ["In light of this evidence.", "In light of the above.", "In light of these facts."], "collocations": ["in light of this", "in light of the above", "in light of recent events"], "ielts_tip": "Formal 'considering'."},
            {"id": "a5v6", "word": "warrant", "ipa": "/ˈwɒr.ənt/", "part_of_speech": "verb", "definition": "Justify, make necessary", "examples": ["This warrants attention.", "Warranted concern.", "Does not warrant."], "collocations": ["warrant attention", "warrant concern", "warrant further investigation"], "ielts_tip": "Justify action/concern."},
            {"id": "a5v7", "word": "pivotal", "ipa": "/ˈpɪv.ə.təl/", "part_of_speech": "adjective", "definition": "Of crucial importance", "examples": ["A pivotal role.", "Pivotal moment.", "Pivotal to success."], "collocations": ["pivotal role", "pivotal moment", "pivotal point"], "ielts_tip": "Critical turning point."},
            {"id": "a5v8", "word": "conducive", "ipa": "/kənˈdjuː.sɪv/", "part_of_speech": "adjective", "definition": "Making something likely to happen", "examples": ["Conducive to learning.", "Not conducive to.", "A conducive environment."], "collocations": ["conducive to", "conducive environment", "conducive atmosphere"], "ielts_tip": "Helpful for achieving."},
            {"id": "a5v9", "word": "henceforth", "ipa": "/ˌhensˈfɔːθ/", "part_of_speech": "adverb", "definition": "From this time on", "examples": ["Henceforth, this will change.", "Henceforth known as.", "Henceforth prohibited."], "collocations": ["henceforth known as", "henceforth referred to", "henceforth prohibited"], "ielts_tip": "Very formal 'from now on'."},
            {"id": "a5v10", "word": "overarching", "ipa": "/ˌəʊ.vərˈɑː.tʃɪŋ/", "part_of_speech": "adjective", "definition": "Including everything, main", "examples": ["The overarching theme.", "Overarching goal.", "Overarching principle."], "collocations": ["overarching theme", "overarching goal", "overarching principle"], "ielts_tip": "Main, covering all."}
        ],
        "quiz_questions": [
            {"question": "It is ___ that governments take action now.", "options": ["paramount", "imperative", "conducive"], "answer": "imperative", "explanation": "'Imperative' means absolutely necessary."},
            {"question": "___ the evidence, we must conclude that...", "options": ["Henceforth", "In light of", "Ultimately"], "answer": "In light of", "explanation": "'In light of' means considering."},
            {"question": "Education plays a ___ role in economic development.", "options": ["conducive", "pivotal", "overarching"], "answer": "pivotal", "explanation": "'Pivotal' means crucially important."}
        ]
    },
]

# Combine all units
ALL_UNITS = FOUNDATION_UNITS + DEVELOPMENT_UNITS + ADVANCED_UNITS

async def seed_vocab_grammar_complete():
    """Seed the complete vocabulary and grammar course."""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Clear existing lessons
    await db.vocab_grammar_lessons.delete_many({})
    print("🗑️  Cleared existing vocab_grammar_lessons")
    
    # Insert all units
    total_items = 0
    for unit in ALL_UNITS:
        await db.vocab_grammar_lessons.insert_one(unit)
        items_count = len(unit.get('items', []))
        total_items += items_count
        print(f"✅ {unit['band_level'].upper():12} | Unit {unit['unit_number']:2} | {unit['type']:10} | {items_count:2} items | {unit['title']}")
    
    # Create quiz questions collection for Question Bank
    await db.vocab_grammar_quizzes.delete_many({})
    print("\n🗑️  Cleared existing vocab_grammar_quizzes")
    
    quiz_count = 0
    for unit in ALL_UNITS:
        if 'quiz_questions' in unit:
            for i, quiz in enumerate(unit['quiz_questions']):
                quiz_doc = {
                    "id": f"{unit['id']}-q{i+1}",
                    "unit_id": unit['id'],
                    "unit_title": unit['title'],
                    "band_level": unit['band_level'],
                    "type": unit['type'],
                    "question": quiz['question'],
                    "options": quiz['options'],
                    "answer": quiz['answer'],
                    "explanation": quiz['explanation']
                }
                await db.vocab_grammar_quizzes.insert_one(quiz_doc)
                quiz_count += 1
    
    print(f"✅ Inserted {quiz_count} quiz questions")
    
    # Summary
    foundation = len([u for u in ALL_UNITS if u['band_level'] == 'foundation'])
    development = len([u for u in ALL_UNITS if u['band_level'] == 'development'])
    advanced = len([u for u in ALL_UNITS if u['band_level'] == 'advanced'])
    
    print(f"\n{'='*60}")
    print(f"📊 VOCAB & GRAMMAR SEEDING COMPLETE!")
    print(f"{'='*60}")
    print(f"   Foundation (Band 4.5-):    {foundation:3} units")
    print(f"   Development (Band 5.0-6.5): {development:3} units")
    print(f"   Advanced (Band 7.0+):       {advanced:3} units")
    print(f"{'='*60}")
    print(f"   TOTAL UNITS:  {len(ALL_UNITS)}")
    print(f"   TOTAL ITEMS:  {total_items}")
    print(f"   TOTAL QUIZZES: {quiz_count}")
    print(f"{'='*60}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_vocab_grammar_complete())
