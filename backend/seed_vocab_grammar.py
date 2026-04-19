"""
Seed script for Vocabulary & Grammar course content
Run with: python seed_vocab_grammar.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# Sample vocabulary and grammar content organized by band level and units

VOCAB_GRAMMAR_LESSONS = [
    # ========== BAND 4.5 AND BELOW (Beginner) ==========
    {
        "id": "vocab-beginner-unit1",
        "title": "Unit 1: Everyday Vocabulary",
        "band_level": "beginner",
        "type": "vocabulary",
        "description": "Essential words for daily communication",
        "items": [
            {
                "id": "v1",
                "word": "accomplish",
                "type": "vocabulary",
                "definition": "To succeed in doing something",
                "pronunciation": "uh-KOM-plish",
                "examples": [
                    "She accomplished her goal of learning English.",
                    "We accomplished the task before the deadline.",
                    "What do you hope to accomplish today?"
                ]
            },
            {
                "id": "v2",
                "word": "beneficial",
                "type": "vocabulary",
                "definition": "Having a good effect; helpful",
                "pronunciation": "ben-uh-FISH-uhl",
                "examples": [
                    "Exercise is beneficial for your health.",
                    "Learning a new language is beneficial for your career.",
                    "The new policy will be beneficial to students."
                ]
            },
            {
                "id": "v3",
                "word": "consider",
                "type": "vocabulary",
                "definition": "To think carefully about something",
                "pronunciation": "kuhn-SID-er",
                "examples": [
                    "Please consider my suggestion.",
                    "Have you considered studying abroad?",
                    "We need to consider all the options."
                ]
            },
            {
                "id": "v4",
                "word": "develop",
                "type": "vocabulary",
                "definition": "To grow or cause to grow and become more advanced",
                "pronunciation": "dih-VEL-uhp",
                "examples": [
                    "Children develop language skills quickly.",
                    "The company wants to develop new products.",
                    "She developed an interest in music."
                ]
            },
            {
                "id": "v5",
                "word": "essential",
                "type": "vocabulary",
                "definition": "Absolutely necessary; extremely important",
                "pronunciation": "ih-SEN-shuhl",
                "examples": [
                    "Water is essential for life.",
                    "Grammar is essential for good writing.",
                    "It's essential to arrive on time."
                ]
            }
        ]
    },
    {
        "id": "vocab-beginner-unit2",
        "title": "Unit 2: Common Idioms",
        "band_level": "beginner",
        "type": "idioms",
        "description": "Simple idioms used in everyday English",
        "items": [
            {
                "id": "i1",
                "word": "break the ice",
                "type": "idiom",
                "definition": "To make people feel more comfortable in a social situation",
                "pronunciation": "brayk thuh ahys",
                "examples": [
                    "He told a joke to break the ice.",
                    "Let's play a game to break the ice.",
                    "The host tried to break the ice with small talk."
                ]
            },
            {
                "id": "i2",
                "word": "piece of cake",
                "type": "idiom",
                "definition": "Something very easy to do",
                "pronunciation": "pees uhv kayk",
                "examples": [
                    "The test was a piece of cake.",
                    "Cooking pasta is a piece of cake.",
                    "For her, speaking English is a piece of cake."
                ]
            },
            {
                "id": "i3",
                "word": "under the weather",
                "type": "idiom",
                "definition": "Feeling slightly ill or tired",
                "pronunciation": "UHN-der thuh WETH-er",
                "examples": [
                    "I'm feeling under the weather today.",
                    "She's been under the weather all week.",
                    "He looks a bit under the weather."
                ]
            },
            {
                "id": "i4",
                "word": "cost an arm and a leg",
                "type": "idiom",
                "definition": "To be very expensive",
                "pronunciation": "kawst an ahrm and uh leg",
                "examples": [
                    "That car costs an arm and a leg.",
                    "University education costs an arm and a leg.",
                    "The restaurant doesn't cost an arm and a leg."
                ]
            },
            {
                "id": "i5",
                "word": "hit the books",
                "type": "idiom",
                "definition": "To study hard",
                "pronunciation": "hit thuh books",
                "examples": [
                    "I need to hit the books for the exam.",
                    "She's been hitting the books all weekend.",
                    "Time to hit the books!"
                ]
            }
        ]
    },
    {
        "id": "grammar-beginner-unit1",
        "title": "Unit 1: Present Tenses",
        "band_level": "beginner",
        "type": "grammar",
        "description": "Master present simple and present continuous",
        "items": [
            {
                "id": "g1",
                "word": "Present Simple",
                "type": "grammar_rule",
                "definition": "Used for habits, facts, and routines. Form: Subject + base verb (+ s/es for he/she/it)",
                "pronunciation": "PREZ-uhnt SIM-puhl",
                "examples": [
                    "I study English every day.",
                    "She works in a hospital.",
                    "The sun rises in the east."
                ],
                "grammar_note": "Add -s or -es for third person singular (he/she/it). Use 'do/does' for questions and negatives."
            },
            {
                "id": "g2",
                "word": "Present Continuous",
                "type": "grammar_rule",
                "definition": "Used for actions happening now or temporary situations. Form: Subject + am/is/are + verb-ing",
                "pronunciation": "PREZ-uhnt kuhn-TIN-yoo-uhs",
                "examples": [
                    "I am studying English right now.",
                    "She is working from home this week.",
                    "They are learning new vocabulary."
                ],
                "grammar_note": "Use 'am' with I, 'is' with he/she/it, 'are' with you/we/they."
            },
            {
                "id": "g3",
                "word": "State Verbs",
                "type": "grammar_rule",
                "definition": "Verbs that describe states (not actions) usually don't use continuous form",
                "pronunciation": "stayt vurbz",
                "examples": [
                    "I know the answer. (NOT: I am knowing)",
                    "She loves music. (NOT: She is loving)",
                    "This cake tastes delicious. (NOT: is tasting)"
                ],
                "grammar_note": "Common state verbs: know, believe, want, need, love, hate, prefer, understand, remember"
            }
        ]
    },
    
    # ========== BAND 4.5-6.5 (Intermediate) ==========
    {
        "id": "vocab-intermediate-unit1",
        "title": "Unit 1: Academic Vocabulary",
        "band_level": "intermediate",
        "type": "vocabulary",
        "description": "Essential words for academic writing and speaking",
        "items": [
            {
                "id": "av1",
                "word": "furthermore",
                "type": "vocabulary",
                "definition": "In addition; besides (used to add more information)",
                "pronunciation": "FUR-ther-mawr",
                "examples": [
                    "The hotel was expensive. Furthermore, it was far from the city center.",
                    "The research was inconclusive. Furthermore, the sample size was too small.",
                    "She speaks French fluently. Furthermore, she can also speak German."
                ]
            },
            {
                "id": "av2",
                "word": "nevertheless",
                "type": "vocabulary",
                "definition": "In spite of that; however",
                "pronunciation": "nev-er-thuh-LES",
                "examples": [
                    "The weather was bad. Nevertheless, we enjoyed our trip.",
                    "He's not perfect. Nevertheless, I trust him.",
                    "The task was difficult. Nevertheless, she completed it on time."
                ]
            },
            {
                "id": "av3",
                "word": "significant",
                "type": "vocabulary",
                "definition": "Important or large enough to have an effect",
                "pronunciation": "sig-NIF-i-kuhnt",
                "examples": [
                    "There has been a significant improvement in her scores.",
                    "The discovery was significant for medical research.",
                    "A significant number of students passed the exam."
                ]
            },
            {
                "id": "av4",
                "word": "phenomenon",
                "type": "vocabulary",
                "definition": "A fact or situation that can be observed; something remarkable",
                "pronunciation": "fi-NOM-uh-non",
                "examples": [
                    "Global warming is a worrying phenomenon.",
                    "The Northern Lights are a natural phenomenon.",
                    "Social media addiction is a modern phenomenon."
                ]
            },
            {
                "id": "av5",
                "word": "perspective",
                "type": "vocabulary",
                "definition": "A particular way of considering something; point of view",
                "pronunciation": "per-SPEK-tiv",
                "examples": [
                    "From my perspective, the plan is too risky.",
                    "Try to see it from a different perspective.",
                    "The book offers a new perspective on history."
                ]
            }
        ]
    },
    {
        "id": "vocab-intermediate-unit2",
        "title": "Unit 2: Phrasal Verbs",
        "band_level": "intermediate",
        "type": "phrasal_verbs",
        "description": "Common phrasal verbs for IELTS",
        "items": [
            {
                "id": "pv1",
                "word": "bring up",
                "type": "phrasal_verb",
                "definition": "1) To raise a child; 2) To mention a topic",
                "pronunciation": "bring uhp",
                "examples": [
                    "She was brought up in a small village.",
                    "He brought up an interesting point in the meeting.",
                    "Don't bring up that topic again."
                ]
            },
            {
                "id": "pv2",
                "word": "carry out",
                "type": "phrasal_verb",
                "definition": "To do or complete something, especially something planned",
                "pronunciation": "KAR-ee out",
                "examples": [
                    "Scientists carried out experiments on the new drug.",
                    "The government carried out reforms.",
                    "We need to carry out more research."
                ]
            },
            {
                "id": "pv3",
                "word": "come up with",
                "type": "phrasal_verb",
                "definition": "To think of an idea, plan, or solution",
                "pronunciation": "kuhm uhp with",
                "examples": [
                    "She came up with a brilliant idea.",
                    "Can you come up with a better solution?",
                    "They came up with a new marketing strategy."
                ]
            },
            {
                "id": "pv4",
                "word": "look into",
                "type": "phrasal_verb",
                "definition": "To investigate or examine",
                "pronunciation": "look IN-too",
                "examples": [
                    "The police are looking into the matter.",
                    "We should look into cheaper alternatives.",
                    "I'll look into it and get back to you."
                ]
            },
            {
                "id": "pv5",
                "word": "point out",
                "type": "phrasal_verb",
                "definition": "To tell someone about something; to direct attention to",
                "pronunciation": "poynt out",
                "examples": [
                    "She pointed out several errors in my essay.",
                    "I'd like to point out that this is not new.",
                    "He pointed out the benefits of the plan."
                ]
            }
        ]
    },
    {
        "id": "grammar-intermediate-unit1",
        "title": "Unit 1: Conditionals",
        "band_level": "intermediate",
        "type": "grammar",
        "description": "Master all conditional forms for IELTS",
        "items": [
            {
                "id": "gc1",
                "word": "Zero Conditional",
                "type": "grammar_rule",
                "definition": "For general truths and facts. Form: If + present simple, present simple",
                "pronunciation": "ZEER-oh kuhn-DISH-uh-nuhl",
                "examples": [
                    "If you heat water to 100°C, it boils.",
                    "If it rains, the ground gets wet.",
                    "Plants die if they don't get water."
                ],
                "grammar_note": "Both clauses use present simple. 'When' can replace 'if' for more certainty."
            },
            {
                "id": "gc2",
                "word": "First Conditional",
                "type": "grammar_rule",
                "definition": "For real/possible future situations. Form: If + present simple, will + base verb",
                "pronunciation": "furst kuhn-DISH-uh-nuhl",
                "examples": [
                    "If I study hard, I will pass the exam.",
                    "If it rains tomorrow, we will cancel the picnic.",
                    "She will be happy if she gets the job."
                ],
                "grammar_note": "Use for likely future events. Can use 'might/may/can' instead of 'will' for less certainty."
            },
            {
                "id": "gc3",
                "word": "Second Conditional",
                "type": "grammar_rule",
                "definition": "For unreal/hypothetical present situations. Form: If + past simple, would + base verb",
                "pronunciation": "SEK-uhnd kuhn-DISH-uh-nuhl",
                "examples": [
                    "If I had more time, I would learn another language.",
                    "If I were you, I would accept the offer.",
                    "She would travel more if she had money."
                ],
                "grammar_note": "Use 'were' (not 'was') for formal English with I/he/she/it. This is hypothetical, not real."
            },
            {
                "id": "gc4",
                "word": "Third Conditional",
                "type": "grammar_rule",
                "definition": "For unreal past situations (regrets). Form: If + past perfect, would have + past participle",
                "pronunciation": "thurd kuhn-DISH-uh-nuhl",
                "examples": [
                    "If I had studied harder, I would have passed.",
                    "If she had left earlier, she wouldn't have missed the train.",
                    "We would have won if we had practiced more."
                ],
                "grammar_note": "Used for imagining different outcomes in the past. Often expresses regret."
            }
        ]
    },
    
    # ========== BAND 6.5+ (Advanced) ==========
    {
        "id": "vocab-advanced-unit1",
        "title": "Unit 1: Sophisticated Vocabulary",
        "band_level": "advanced",
        "type": "vocabulary",
        "description": "High-level vocabulary for Band 7+",
        "items": [
            {
                "id": "sv1",
                "word": "ubiquitous",
                "type": "vocabulary",
                "definition": "Present, appearing, or found everywhere",
                "pronunciation": "yoo-BIK-wi-tuhs",
                "examples": [
                    "Smartphones have become ubiquitous in modern society.",
                    "Coffee shops are ubiquitous in major cities.",
                    "The ubiquitous influence of social media is undeniable."
                ]
            },
            {
                "id": "sv2",
                "word": "exacerbate",
                "type": "vocabulary",
                "definition": "To make a problem, bad situation, or negative feeling worse",
                "pronunciation": "ig-ZAS-er-bayt",
                "examples": [
                    "The new policy may exacerbate inequality.",
                    "Stress can exacerbate health problems.",
                    "The drought was exacerbated by climate change."
                ]
            },
            {
                "id": "sv3",
                "word": "unprecedented",
                "type": "vocabulary",
                "definition": "Never done or known before; without previous example",
                "pronunciation": "uhn-PRES-i-den-tid",
                "examples": [
                    "The pandemic caused unprecedented disruption.",
                    "We are facing unprecedented challenges.",
                    "The company achieved unprecedented growth."
                ]
            },
            {
                "id": "sv4",
                "word": "paradigm",
                "type": "vocabulary",
                "definition": "A typical example or pattern of something; a model",
                "pronunciation": "PAR-uh-dahym",
                "examples": [
                    "The discovery led to a paradigm shift in physics.",
                    "This company represents the new paradigm of business.",
                    "We need a new paradigm for education."
                ]
            },
            {
                "id": "sv5",
                "word": "dichotomy",
                "type": "vocabulary",
                "definition": "A division or contrast between two things that are opposite",
                "pronunciation": "dahy-KOT-uh-mee",
                "examples": [
                    "The dichotomy between urban and rural life.",
                    "There's a false dichotomy between work and pleasure.",
                    "The East-West dichotomy is oversimplified."
                ]
            }
        ]
    },
    {
        "id": "vocab-advanced-unit2",
        "title": "Unit 2: Advanced Phrases & Collocations",
        "band_level": "advanced",
        "type": "phrases",
        "description": "Sophisticated expressions for high band scores",
        "items": [
            {
                "id": "ap1",
                "word": "a double-edged sword",
                "type": "phrase",
                "definition": "Something that has both advantages and disadvantages",
                "pronunciation": "uh DUH-buhl ejd sord",
                "examples": [
                    "Technology is a double-edged sword.",
                    "Fame can be a double-edged sword.",
                    "Globalization is often described as a double-edged sword."
                ]
            },
            {
                "id": "ap2",
                "word": "the tip of the iceberg",
                "type": "phrase",
                "definition": "A small visible part of a much larger problem",
                "pronunciation": "thuh tip uhv thee AHYS-burg",
                "examples": [
                    "These complaints are just the tip of the iceberg.",
                    "The scandal was only the tip of the iceberg.",
                    "What we see is merely the tip of the iceberg."
                ]
            },
            {
                "id": "ap3",
                "word": "to shed light on",
                "type": "phrase",
                "definition": "To help explain or clarify something",
                "pronunciation": "too shed lahyt on",
                "examples": [
                    "The research sheds light on the causes of the disease.",
                    "Can you shed light on this matter?",
                    "New evidence has shed light on the mystery."
                ]
            },
            {
                "id": "ap4",
                "word": "to a large extent",
                "type": "phrase",
                "definition": "Mostly; to a great degree",
                "pronunciation": "too uh lahrj ik-STENT",
                "examples": [
                    "To a large extent, I agree with you.",
                    "Success depends, to a large extent, on hard work.",
                    "The policy has been, to a large extent, successful."
                ]
            },
            {
                "id": "ap5",
                "word": "in light of",
                "type": "phrase",
                "definition": "Because of; considering",
                "pronunciation": "in lahyt uhv",
                "examples": [
                    "In light of recent events, we must reconsider.",
                    "In light of the evidence, he was found guilty.",
                    "In light of your comments, I've revised my essay."
                ]
            }
        ]
    },
    {
        "id": "grammar-advanced-unit1",
        "title": "Unit 1: Advanced Grammar Structures",
        "band_level": "advanced",
        "type": "grammar",
        "description": "Complex structures for Band 7+",
        "items": [
            {
                "id": "ga1",
                "word": "Inversion for Emphasis",
                "type": "grammar_rule",
                "definition": "Changing normal word order for emphasis. Auxiliary verb comes before subject.",
                "pronunciation": "in-VUR-zhuhn",
                "examples": [
                    "Never have I seen such beauty.",
                    "Not only did she win, but she also broke the record.",
                    "Rarely do we get such opportunities."
                ],
                "grammar_note": "Common triggers: Never, Rarely, Seldom, Not only, No sooner, Little, Only after/when"
            },
            {
                "id": "ga2",
                "word": "Cleft Sentences",
                "type": "grammar_rule",
                "definition": "Sentences that highlight specific information using 'It is/was... that' or 'What... is/was'",
                "pronunciation": "kleft SEN-ten-siz",
                "examples": [
                    "It was the government that made the decision.",
                    "What concerns me is the lack of funding.",
                    "It is education that transforms societies."
                ],
                "grammar_note": "Use to emphasize a particular element. 'It is/was X that...' or 'What X is/was...'"
            },
            {
                "id": "ga3",
                "word": "Reduced Relative Clauses",
                "type": "grammar_rule",
                "definition": "Shortening relative clauses by removing the relative pronoun and/or verb 'be'",
                "pronunciation": "ri-DOOSD REL-uh-tiv klawz-iz",
                "examples": [
                    "The man (who is) standing there is my boss.",
                    "The book (which was) written by Orwell is a classic.",
                    "Anyone (who is) interested can apply."
                ],
                "grammar_note": "Can reduce with present participles (-ing) or past participles (-ed). Makes writing more concise."
            },
            {
                "id": "ga4",
                "word": "Mixed Conditionals",
                "type": "grammar_rule",
                "definition": "Combining different conditional tenses when the time in the if-clause differs from the result clause",
                "pronunciation": "mikst kuhn-DISH-uh-nuhlz",
                "examples": [
                    "If I had studied medicine, I would be a doctor now. (past condition → present result)",
                    "If she were more careful, she wouldn't have made that mistake. (general → past result)",
                    "If they had invested earlier, they would be rich today."
                ],
                "grammar_note": "Mix 2nd and 3rd conditionals when the time frames don't match."
            }
        ]
    }
]

async def seed_vocab_grammar():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Clear existing lessons
    await db.vocab_grammar_lessons.delete_many({})
    
    # Insert all lessons
    for lesson in VOCAB_GRAMMAR_LESSONS:
        await db.vocab_grammar_lessons.insert_one(lesson)
        print(f"Inserted: {lesson['title']}")
    
    print(f"\n✅ Seeded {len(VOCAB_GRAMMAR_LESSONS)} vocabulary and grammar lessons!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_vocab_grammar())
