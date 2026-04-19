"""
IELTS Speaking Question Bank Content
=====================================
Structured speaking sets following IELTS Part 1-2-3 format.
Two tracks: Academic and General Training (same structure, different content/tone)
"""

from typing import Dict, List, Any

# Speaking Parts Structure
SPEAKING_PARTS = {
    "part1": {
        "name": "Part 1: Introduction & Interview",
        "duration_minutes": 4,
        "questions_count": "4-6",
        "answer_time_target": 15,  # seconds
        "answer_time_max": 25,     # hard cap
        "description": "Familiar topics about home, work, studies, interests"
    },
    "part2": {
        "name": "Part 2: Individual Long Turn",
        "prep_time": 60,           # 1 minute
        "speaking_time_max": 120,  # 2 minutes
        "description": "Speak about a topic on a cue card for 1-2 minutes"
    },
    "part3": {
        "name": "Part 3: Two-way Discussion",
        "duration_minutes": 5,
        "questions_count": "3-5",
        "answer_time_target": 45,  # seconds
        "answer_time_max": 75,     # hard cap
        "description": "Abstract questions related to Part 2 topic"
    }
}

# IELTS Speaking Assessment Criteria (Cambridge)
ASSESSMENT_CRITERIA = {
    "fluency_coherence": {
        "name": "Fluency and Coherence",
        "weight": 0.25,
        "descriptors": {
            9: "Speaks fluently with only rare repetition or self-correction",
            8: "Speaks fluently with occasional repetition or self-correction",
            7: "Speaks at length without noticeable effort or loss of coherence",
            6: "Willing to speak at length but loses coherence sometimes",
            5: "Usually maintains flow but uses repetition and self-correction",
            4: "Cannot respond without noticeable pauses, may speak slowly"
        }
    },
    "lexical_resource": {
        "name": "Lexical Resource",
        "weight": 0.25,
        "descriptors": {
            9: "Uses vocabulary with full flexibility and precision",
            8: "Uses a wide vocabulary resource readily and flexibly",
            7: "Uses vocabulary resource flexibly to discuss a variety of topics",
            6: "Has a wide enough vocabulary to discuss topics at length",
            5: "Manages to talk about familiar and unfamiliar topics",
            4: "Uses basic vocabulary to discuss familiar topics"
        }
    },
    "grammatical_range": {
        "name": "Grammatical Range and Accuracy",
        "weight": 0.25,
        "descriptors": {
            9: "Uses a full range of structures naturally and appropriately",
            8: "Uses a wide range of structures flexibly",
            7: "Uses a range of complex structures with some flexibility",
            6: "Uses a mix of simple and complex structures",
            5: "Produces basic sentence forms with reasonable accuracy",
            4: "Produces basic sentence forms but errors are frequent"
        }
    },
    "pronunciation": {
        "name": "Pronunciation",
        "weight": 0.25,
        "descriptors": {
            9: "Uses a full range of pronunciation features with precision",
            8: "Uses a wide range of pronunciation features",
            7: "Shows all positive features of Band 6 and some of Band 8",
            6: "Uses a range of pronunciation features with mixed control",
            5: "Shows some effective use of features but control is variable",
            4: "Uses a limited range of pronunciation features"
        }
    }
}

# ============ ACADEMIC SPEAKING SETS ============

ACADEMIC_BAND_4_5_SETS = [
    {
        "set_id": "spk_ac_b45_001",
        "track": "academic",
        "band_range": "4.0-5.0",
        "topic": "education",
        "title": "Studies and Learning",
        "examiner_voice": "british_female_2",
        "show_text": True,  # Band 4-5 shows text
        "part1": {
            "intro": "Let's talk about your studies.",
            "questions": [
                {"id": "p1q1", "text": "What subject are you studying?", "target_time": 15},
                {"id": "p1q2", "text": "Why did you choose this subject?", "target_time": 20},
                {"id": "p1q3", "text": "What do you find most interesting about your studies?", "target_time": 20},
                {"id": "p1q4", "text": "Do you prefer studying alone or with others?", "target_time": 15},
                {"id": "p1q5", "text": "How do you usually prepare for exams?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a teacher who has influenced you",
                "bullets": [
                    "who this teacher was",
                    "what subject they taught",
                    "what was special about them",
                    "and explain how they influenced you"
                ]
            },
            "follow_up": "Do you still keep in contact with this teacher?"
        },
        "part3": {
            "intro": "Let's discuss education more generally.",
            "questions": [
                {"id": "p3q1", "text": "What qualities make a good teacher?", "target_time": 45},
                {"id": "p3q2", "text": "How has education changed in your country?", "target_time": 45},
                {"id": "p3q3", "text": "Do you think online learning is effective?", "target_time": 45},
                {"id": "p3q4", "text": "Should education be free for everyone?", "target_time": 45}
            ]
        }
    },
    {
        "set_id": "spk_ac_b45_002",
        "track": "academic",
        "band_range": "4.0-5.0",
        "topic": "technology",
        "title": "Technology in Daily Life",
        "examiner_voice": "british_male_2",
        "show_text": True,
        "part1": {
            "intro": "Let's talk about technology.",
            "questions": [
                {"id": "p1q1", "text": "How often do you use the internet?", "target_time": 15},
                {"id": "p1q2", "text": "What do you mainly use your phone for?", "target_time": 20},
                {"id": "p1q3", "text": "Do you think you spend too much time on technology?", "target_time": 20},
                {"id": "p1q4", "text": "What technology did you learn to use recently?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a piece of technology you find useful",
                "bullets": [
                    "what technology it is",
                    "how long you have used it",
                    "how often you use it",
                    "and explain why you find it useful"
                ]
            },
            "follow_up": "Would you recommend this to others?"
        },
        "part3": {
            "intro": "Let's discuss technology in society.",
            "questions": [
                {"id": "p3q1", "text": "How has technology changed the way people work?", "target_time": 45},
                {"id": "p3q2", "text": "What are the disadvantages of relying on technology?", "target_time": 45},
                {"id": "p3q3", "text": "Do older people find it harder to use new technology?", "target_time": 45}
            ]
        }
    },
    {
        "set_id": "spk_ac_b45_003",
        "track": "academic",
        "band_range": "4.0-5.0",
        "topic": "environment",
        "title": "Environment and Nature",
        "examiner_voice": "british_female_2",
        "show_text": True,
        "part1": {
            "intro": "Let's talk about the environment.",
            "questions": [
                {"id": "p1q1", "text": "Do you recycle at home?", "target_time": 15},
                {"id": "p1q2", "text": "What environmental problems are there in your area?", "target_time": 20},
                {"id": "p1q3", "text": "Do you think individuals can make a difference to the environment?", "target_time": 20},
                {"id": "p1q4", "text": "Would you like to live in the countryside or a city?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a natural place you have visited",
                "bullets": [
                    "where it was",
                    "when you went there",
                    "what you did there",
                    "and explain why you liked this place"
                ]
            },
            "follow_up": "Would you like to go there again?"
        },
        "part3": {
            "intro": "Let's discuss environmental issues.",
            "questions": [
                {"id": "p3q1", "text": "Why is it important to protect the environment?", "target_time": 45},
                {"id": "p3q2", "text": "What can governments do to reduce pollution?", "target_time": 45},
                {"id": "p3q3", "text": "Do you think people will change their habits to help the environment?", "target_time": 45}
            ]
        }
    }
]

ACADEMIC_BAND_55_65_SETS = [
    {
        "set_id": "spk_ac_b56_001",
        "track": "academic",
        "band_range": "5.5-6.5",
        "topic": "work",
        "title": "Career and Ambitions",
        "examiner_voice": "british_male_2",
        "show_text": False,  # Band 5.5+ audio only by default
        "part1": {
            "intro": "I'd like to ask you some questions about work and careers.",
            "questions": [
                {"id": "p1q1", "text": "What kind of work do you do or hope to do?", "target_time": 15},
                {"id": "p1q2", "text": "What skills are important in your field?", "target_time": 20},
                {"id": "p1q3", "text": "Do you prefer working independently or as part of a team?", "target_time": 20},
                {"id": "p1q4", "text": "How do you think your industry will change in the future?", "target_time": 20},
                {"id": "p1q5", "text": "What motivates you in your work?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a successful person you admire",
                "bullets": [
                    "who this person is",
                    "what they do",
                    "how they became successful",
                    "and explain why you admire them"
                ]
            },
            "follow_up": "Do you think success can be measured?"
        },
        "part3": {
            "intro": "Let's talk more about success and career development.",
            "questions": [
                {"id": "p3q1", "text": "What factors contribute to career success?", "target_time": 50},
                {"id": "p3q2", "text": "Is it better to have a stable job or pursue your passion?", "target_time": 50},
                {"id": "p3q3", "text": "How important is work-life balance in modern society?", "target_time": 50},
                {"id": "p3q4", "text": "Do you think young people today have different career expectations?", "target_time": 50}
            ]
        }
    },
    {
        "set_id": "spk_ac_b56_002",
        "track": "academic",
        "band_range": "5.5-6.5",
        "topic": "culture",
        "title": "Culture and Society",
        "examiner_voice": "british_female_2",
        "show_text": False,
        "part1": {
            "intro": "Let's discuss culture and traditions.",
            "questions": [
                {"id": "p1q1", "text": "What traditional events are important in your culture?", "target_time": 20},
                {"id": "p1q2", "text": "How do people usually celebrate special occasions in your country?", "target_time": 20},
                {"id": "p1q3", "text": "Are traditions changing in your society?", "target_time": 20},
                {"id": "p1q4", "text": "Do you think it's important to preserve traditions?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a cultural event you have attended",
                "bullets": [
                    "what the event was",
                    "where and when it took place",
                    "what happened at the event",
                    "and explain how you felt about the experience"
                ]
            },
            "follow_up": "Would you recommend this event to a foreign visitor?"
        },
        "part3": {
            "intro": "Let's explore cultural topics more broadly.",
            "questions": [
                {"id": "p3q1", "text": "How does globalization affect local cultures?", "target_time": 50},
                {"id": "p3q2", "text": "Should governments fund cultural events and institutions?", "target_time": 50},
                {"id": "p3q3", "text": "What role does art play in society?", "target_time": 50}
            ]
        }
    },
    {
        "set_id": "spk_ac_b56_003",
        "track": "academic",
        "band_range": "5.5-6.5",
        "topic": "health",
        "title": "Health and Wellbeing",
        "examiner_voice": "british_male_2",
        "show_text": False,
        "part1": {
            "intro": "I'd like to ask about health and fitness.",
            "questions": [
                {"id": "p1q1", "text": "What do you do to stay healthy?", "target_time": 20},
                {"id": "p1q2", "text": "Do you think people in your country lead healthy lifestyles?", "target_time": 20},
                {"id": "p1q3", "text": "How has your diet changed over the years?", "target_time": 20},
                {"id": "p1q4", "text": "What role does exercise play in your life?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a time when you had to change a habit for your health",
                "bullets": [
                    "what the habit was",
                    "why you decided to change it",
                    "how you changed it",
                    "and explain how it affected your life"
                ]
            },
            "follow_up": "Was it difficult to maintain this change?"
        },
        "part3": {
            "intro": "Let's discuss public health.",
            "questions": [
                {"id": "p3q1", "text": "What responsibility do governments have for public health?", "target_time": 50},
                {"id": "p3q2", "text": "How has healthcare changed in recent decades?", "target_time": 50},
                {"id": "p3q3", "text": "Do you think mental health receives enough attention?", "target_time": 50}
            ]
        }
    }
]

ACADEMIC_BAND_7_9_SETS = [
    {
        "set_id": "spk_ac_b79_001",
        "track": "academic",
        "band_range": "7.0-9.0",
        "topic": "science",
        "title": "Scientific Progress",
        "examiner_voice": "british_female_2",
        "show_text": False,
        "part1": {
            "intro": "I'd like to ask you about science and research.",
            "questions": [
                {"id": "p1q1", "text": "Are you interested in science? Why or why not?", "target_time": 20},
                {"id": "p1q2", "text": "How did you learn about science at school?", "target_time": 20},
                {"id": "p1q3", "text": "What scientific discovery do you find most fascinating?", "target_time": 25},
                {"id": "p1q4", "text": "Do you follow science news?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a scientific breakthrough that has impacted society",
                "bullets": [
                    "what the breakthrough was",
                    "when it happened",
                    "how it changed people's lives",
                    "and explain your opinion on its impact"
                ]
            },
            "follow_up": "Do you think this breakthrough has any negative effects?"
        },
        "part3": {
            "intro": "Let's discuss science and its role in society.",
            "questions": [
                {"id": "p3q1", "text": "Should scientific research be driven by commercial interests or public benefit?", "target_time": 60},
                {"id": "p3q2", "text": "How can governments encourage scientific literacy among citizens?", "target_time": 60},
                {"id": "p3q3", "text": "What ethical considerations should guide scientific research?", "target_time": 60},
                {"id": "p3q4", "text": "Is there a risk of society becoming too dependent on technology?", "target_time": 60}
            ]
        }
    },
    {
        "set_id": "spk_ac_b79_002",
        "track": "academic",
        "band_range": "7.0-9.0",
        "topic": "business",
        "title": "Economics and Business",
        "examiner_voice": "british_male_2",
        "show_text": False,
        "part1": {
            "intro": "Let's talk about business and economics.",
            "questions": [
                {"id": "p1q1", "text": "Do you follow economic news?", "target_time": 15},
                {"id": "p1q2", "text": "What kind of businesses are popular in your area?", "target_time": 20},
                {"id": "p1q3", "text": "Would you like to start your own business someday?", "target_time": 25},
                {"id": "p1q4", "text": "How important is financial planning to you?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a company or business that you think is successful",
                "bullets": [
                    "what the company does",
                    "why you think it is successful",
                    "how it has grown or developed",
                    "and explain what others could learn from this company"
                ]
            },
            "follow_up": "Do you think this company will remain successful?"
        },
        "part3": {
            "intro": "Let's discuss broader economic issues.",
            "questions": [
                {"id": "p3q1", "text": "What challenges do small businesses face compared to large corporations?", "target_time": 60},
                {"id": "p3q2", "text": "How has globalization affected local businesses in your country?", "target_time": 60},
                {"id": "p3q3", "text": "Should governments regulate large technology companies?", "target_time": 60}
            ]
        }
    },
    {
        "set_id": "spk_ac_b79_003",
        "track": "academic",
        "band_range": "7.0-9.0",
        "topic": "media",
        "title": "Media and Information",
        "examiner_voice": "british_female_2",
        "show_text": False,
        "part1": {
            "intro": "I'd like to discuss media and news.",
            "questions": [
                {"id": "p1q1", "text": "Where do you usually get your news from?", "target_time": 20},
                {"id": "p1q2", "text": "Do you think traditional media is still relevant?", "target_time": 25},
                {"id": "p1q3", "text": "How has social media changed the way people consume information?", "target_time": 25},
                {"id": "p1q4", "text": "Do you trust the news you read online?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a news story that made an impression on you",
                "bullets": [
                    "what the story was about",
                    "when and where you heard about it",
                    "why it was significant",
                    "and explain how it affected your thinking"
                ]
            },
            "follow_up": "Did this story change any of your habits or beliefs?"
        },
        "part3": {
            "intro": "Let's explore media's role in society.",
            "questions": [
                {"id": "p3q1", "text": "How should societies address the spread of misinformation?", "target_time": 60},
                {"id": "p3q2", "text": "What responsibilities do journalists have to the public?", "target_time": 60},
                {"id": "p3q3", "text": "Is it possible to have truly unbiased news reporting?", "target_time": 60}
            ]
        }
    }
]

# ============ GENERAL SPEAKING SETS ============

GENERAL_BAND_4_5_SETS = [
    {
        "set_id": "spk_gt_b45_001",
        "track": "general",
        "band_range": "4.0-5.0",
        "topic": "home",
        "title": "Home and Family",
        "examiner_voice": "british_female_2",
        "show_text": True,
        "part1": {
            "intro": "Let's talk about where you live.",
            "questions": [
                {"id": "p1q1", "text": "Where is your hometown?", "target_time": 15},
                {"id": "p1q2", "text": "Do you live in a house or an apartment?", "target_time": 15},
                {"id": "p1q3", "text": "What do you like about your home?", "target_time": 20},
                {"id": "p1q4", "text": "How long have you lived there?", "target_time": 15},
                {"id": "p1q5", "text": "Would you like to move to a different place?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a family member you are close to",
                "bullets": [
                    "who this person is",
                    "what they are like",
                    "what you do together",
                    "and explain why you are close to them"
                ]
            },
            "follow_up": "Do you see this person often?"
        },
        "part3": {
            "intro": "Let's discuss family and relationships.",
            "questions": [
                {"id": "p3q1", "text": "How have families changed in your country?", "target_time": 45},
                {"id": "p3q2", "text": "Is it important for families to spend time together?", "target_time": 45},
                {"id": "p3q3", "text": "Do children learn more from family or from school?", "target_time": 45}
            ]
        }
    },
    {
        "set_id": "spk_gt_b45_002",
        "track": "general",
        "band_range": "4.0-5.0",
        "topic": "hobbies",
        "title": "Hobbies and Free Time",
        "examiner_voice": "british_male_2",
        "show_text": True,
        "part1": {
            "intro": "Let's talk about your free time.",
            "questions": [
                {"id": "p1q1", "text": "What do you enjoy doing in your free time?", "target_time": 15},
                {"id": "p1q2", "text": "Do you have enough free time?", "target_time": 15},
                {"id": "p1q3", "text": "Did you have different hobbies when you were younger?", "target_time": 20},
                {"id": "p1q4", "text": "Would you like to learn a new hobby?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe an activity you enjoy doing in your free time",
                "bullets": [
                    "what the activity is",
                    "how often you do it",
                    "who you do it with",
                    "and explain why you enjoy it"
                ]
            },
            "follow_up": "Would you recommend this activity to others?"
        },
        "part3": {
            "intro": "Let's discuss leisure activities.",
            "questions": [
                {"id": "p3q1", "text": "Why do people need hobbies?", "target_time": 45},
                {"id": "p3q2", "text": "Are outdoor activities better than indoor ones?", "target_time": 45},
                {"id": "p3q3", "text": "Has technology changed how people spend their free time?", "target_time": 45}
            ]
        }
    },
    {
        "set_id": "spk_gt_b45_003",
        "track": "general",
        "band_range": "4.0-5.0",
        "topic": "food",
        "title": "Food and Cooking",
        "examiner_voice": "british_female_2",
        "show_text": True,
        "part1": {
            "intro": "Let's talk about food.",
            "questions": [
                {"id": "p1q1", "text": "What kind of food do you like?", "target_time": 15},
                {"id": "p1q2", "text": "Do you prefer eating at home or in restaurants?", "target_time": 15},
                {"id": "p1q3", "text": "Can you cook?", "target_time": 15},
                {"id": "p1q4", "text": "What food from your country would you recommend to visitors?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a meal you enjoyed",
                "bullets": [
                    "what you ate",
                    "where you had this meal",
                    "who you were with",
                    "and explain why you enjoyed it"
                ]
            },
            "follow_up": "Would you have this meal again?"
        },
        "part3": {
            "intro": "Let's talk about food in society.",
            "questions": [
                {"id": "p3q1", "text": "Why is home cooking important?", "target_time": 45},
                {"id": "p3q2", "text": "How has food culture changed in your country?", "target_time": 45},
                {"id": "p3q3", "text": "Is fast food becoming more popular?", "target_time": 45}
            ]
        }
    }
]

GENERAL_BAND_55_65_SETS = [
    {
        "set_id": "spk_gt_b56_001",
        "track": "general",
        "band_range": "5.5-6.5",
        "topic": "travel",
        "title": "Travel and Tourism",
        "examiner_voice": "british_male_2",
        "show_text": False,
        "part1": {
            "intro": "I'd like to ask you about travel.",
            "questions": [
                {"id": "p1q1", "text": "Do you enjoy travelling?", "target_time": 15},
                {"id": "p1q2", "text": "What kind of places do you prefer to visit?", "target_time": 20},
                {"id": "p1q3", "text": "Do you prefer travelling alone or with others?", "target_time": 20},
                {"id": "p1q4", "text": "How do you usually plan your trips?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a place you would like to visit in the future",
                "bullets": [
                    "where this place is",
                    "how you learned about it",
                    "what you would do there",
                    "and explain why you want to visit this place"
                ]
            },
            "follow_up": "Do you think you will actually visit this place?"
        },
        "part3": {
            "intro": "Let's discuss travel and tourism.",
            "questions": [
                {"id": "p3q1", "text": "What are the benefits and drawbacks of tourism for local communities?", "target_time": 50},
                {"id": "p3q2", "text": "How has travel changed in recent years?", "target_time": 50},
                {"id": "p3q3", "text": "Should people try to reduce their travel to help the environment?", "target_time": 50}
            ]
        }
    },
    {
        "set_id": "spk_gt_b56_002",
        "track": "general",
        "band_range": "5.5-6.5",
        "topic": "shopping",
        "title": "Shopping and Consumer Habits",
        "examiner_voice": "british_female_2",
        "show_text": False,
        "part1": {
            "intro": "Let's talk about shopping.",
            "questions": [
                {"id": "p1q1", "text": "Do you enjoy shopping?", "target_time": 15},
                {"id": "p1q2", "text": "Do you prefer shopping online or in stores?", "target_time": 20},
                {"id": "p1q3", "text": "What was the last thing you bought?", "target_time": 20},
                {"id": "p1q4", "text": "How do you decide what to buy?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe something you bought that you are happy with",
                "bullets": [
                    "what you bought",
                    "when and where you bought it",
                    "why you chose it",
                    "and explain why you are happy with this purchase"
                ]
            },
            "follow_up": "Would you buy from the same place again?"
        },
        "part3": {
            "intro": "Let's discuss shopping and consumerism.",
            "questions": [
                {"id": "p3q1", "text": "How has online shopping changed consumer behaviour?", "target_time": 50},
                {"id": "p3q2", "text": "Do people buy too many things they don't need?", "target_time": 50},
                {"id": "p3q3", "text": "What is the future of physical stores?", "target_time": 50}
            ]
        }
    },
    {
        "set_id": "spk_gt_b56_003",
        "track": "general",
        "band_range": "5.5-6.5",
        "topic": "community",
        "title": "Community and Neighbours",
        "examiner_voice": "british_male_2",
        "show_text": False,
        "part1": {
            "intro": "Let's talk about your neighbourhood.",
            "questions": [
                {"id": "p1q1", "text": "What is your neighbourhood like?", "target_time": 20},
                {"id": "p1q2", "text": "Do you know your neighbours well?", "target_time": 15},
                {"id": "p1q3", "text": "What facilities are there in your area?", "target_time": 20},
                {"id": "p1q4", "text": "Would you like to change anything about your neighbourhood?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a helpful person in your community",
                "bullets": [
                    "who this person is",
                    "how you know them",
                    "what they do to help others",
                    "and explain why you think they are helpful"
                ]
            },
            "follow_up": "Has this person inspired you to help others?"
        },
        "part3": {
            "intro": "Let's discuss community life.",
            "questions": [
                {"id": "p3q1", "text": "Why is community spirit important?", "target_time": 50},
                {"id": "p3q2", "text": "How can people strengthen their communities?", "target_time": 50},
                {"id": "p3q3", "text": "Do you think people are less connected to their communities now?", "target_time": 50}
            ]
        }
    }
]

GENERAL_BAND_7_9_SETS = [
    {
        "set_id": "spk_gt_b79_001",
        "track": "general",
        "band_range": "7.0-9.0",
        "topic": "lifestyle",
        "title": "Modern Lifestyle",
        "examiner_voice": "british_female_2",
        "show_text": False,
        "part1": {
            "intro": "I'd like to ask about your daily life.",
            "questions": [
                {"id": "p1q1", "text": "How would you describe your typical day?", "target_time": 25},
                {"id": "p1q2", "text": "Has your lifestyle changed much in recent years?", "target_time": 25},
                {"id": "p1q3", "text": "Do you think you have a good work-life balance?", "target_time": 25},
                {"id": "p1q4", "text": "What do you value most in life?", "target_time": 25}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a significant change you have made in your life",
                "bullets": [
                    "what the change was",
                    "when and why you made it",
                    "how it affected you",
                    "and explain whether you think it was the right decision"
                ]
            },
            "follow_up": "Would you make the same decision again?"
        },
        "part3": {
            "intro": "Let's discuss life choices and societal changes.",
            "questions": [
                {"id": "p3q1", "text": "Why do people find it difficult to change their habits?", "target_time": 60},
                {"id": "p3q2", "text": "How does modern society influence people's lifestyle choices?", "target_time": 60},
                {"id": "p3q3", "text": "What trade-offs do people often make between career success and personal happiness?", "target_time": 60}
            ]
        }
    },
    {
        "set_id": "spk_gt_b79_002",
        "track": "general",
        "band_range": "7.0-9.0",
        "topic": "communication",
        "title": "Communication and Relationships",
        "examiner_voice": "british_male_2",
        "show_text": False,
        "part1": {
            "intro": "Let's discuss communication.",
            "questions": [
                {"id": "p1q1", "text": "How do you prefer to communicate with people?", "target_time": 20},
                {"id": "p1q2", "text": "Do you think communication skills are important?", "target_time": 25},
                {"id": "p1q3", "text": "Has technology changed the way you communicate?", "target_time": 25},
                {"id": "p1q4", "text": "Do you find it easy to express your ideas?", "target_time": 20}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a time when you had to communicate something difficult",
                "bullets": [
                    "what the situation was",
                    "who you had to communicate with",
                    "how you handled it",
                    "and explain what you learned from this experience"
                ]
            },
            "follow_up": "Would you handle it differently now?"
        },
        "part3": {
            "intro": "Let's explore communication in society.",
            "questions": [
                {"id": "p3q1", "text": "How has digital communication affected human relationships?", "target_time": 60},
                {"id": "p3q2", "text": "What are the most important communication skills for the workplace?", "target_time": 60},
                {"id": "p3q3", "text": "Is face-to-face communication becoming less common, and does it matter?", "target_time": 60}
            ]
        }
    },
    {
        "set_id": "spk_gt_b79_003",
        "track": "general",
        "band_range": "7.0-9.0",
        "topic": "social_issues",
        "title": "Social Issues and Responsibility",
        "examiner_voice": "british_female_2",
        "show_text": False,
        "part1": {
            "intro": "Let's talk about social issues.",
            "questions": [
                {"id": "p1q1", "text": "What social issues do you care about?", "target_time": 25},
                {"id": "p1q2", "text": "Do you ever volunteer or donate to causes?", "target_time": 20},
                {"id": "p1q3", "text": "How do you stay informed about issues in society?", "target_time": 20},
                {"id": "p1q4", "text": "Do you think individuals can make a difference?", "target_time": 25}
            ]
        },
        "part2": {
            "cue_card": {
                "topic": "Describe a social issue that concerns you",
                "bullets": [
                    "what the issue is",
                    "why it is important",
                    "what is being done about it",
                    "and explain what you think should be done"
                ]
            },
            "follow_up": "Have you personally taken any action on this issue?"
        },
        "part3": {
            "intro": "Let's discuss social responsibility.",
            "questions": [
                {"id": "p3q1", "text": "Whose responsibility is it to address social problems: governments, businesses, or individuals?", "target_time": 60},
                {"id": "p3q2", "text": "How effective is social media in raising awareness about important issues?", "target_time": 60},
                {"id": "p3q3", "text": "What role should education play in teaching social responsibility?", "target_time": 60}
            ]
        }
    }
]


# ============ HELPER FUNCTIONS ============

def get_all_speaking_sets() -> List[Dict[str, Any]]:
    """Get all speaking sets across all tracks and bands."""
    return (
        ACADEMIC_BAND_4_5_SETS + ACADEMIC_BAND_55_65_SETS + ACADEMIC_BAND_7_9_SETS +
        GENERAL_BAND_4_5_SETS + GENERAL_BAND_55_65_SETS + GENERAL_BAND_7_9_SETS
    )


def get_speaking_sets_by_track(track: str) -> List[Dict[str, Any]]:
    """Get speaking sets for a specific track (academic/general)."""
    if track == "academic":
        return ACADEMIC_BAND_4_5_SETS + ACADEMIC_BAND_55_65_SETS + ACADEMIC_BAND_7_9_SETS
    elif track == "general":
        return GENERAL_BAND_4_5_SETS + GENERAL_BAND_55_65_SETS + GENERAL_BAND_7_9_SETS
    return []


def get_speaking_sets_by_band(band_range: str) -> List[Dict[str, Any]]:
    """Get speaking sets for a specific band range."""
    all_sets = get_all_speaking_sets()
    return [s for s in all_sets if s["band_range"] == band_range]


def get_speaking_set_by_id(set_id: str) -> Dict[str, Any]:
    """Get a specific speaking set by ID."""
    all_sets = get_all_speaking_sets()
    for s in all_sets:
        if s["set_id"] == set_id:
            return s
    return None


def get_speaking_sets_filtered(
    track: str = None,
    band_range: str = None,
    topic: str = None
) -> List[Dict[str, Any]]:
    """Get speaking sets with optional filters."""
    sets = get_all_speaking_sets()
    
    if track:
        sets = [s for s in sets if s["track"] == track]
    if band_range:
        sets = [s for s in sets if s["band_range"] == band_range]
    if topic:
        sets = [s for s in sets if s["topic"] == topic]
    
    return sets


def get_speaking_topics(track: str = None) -> List[Dict[str, str]]:
    """Get all available speaking topics."""
    sets = get_speaking_sets_by_track(track) if track else get_all_speaking_sets()
    topics = {}
    
    for s in sets:
        topic = s.get("topic")
        if topic and topic not in topics:
            topics[topic] = {
                "id": topic,
                "name": topic.replace("_", " ").title()
            }
    
    return list(topics.values())


def get_assessment_criteria() -> Dict[str, Any]:
    """Get IELTS speaking assessment criteria."""
    return ASSESSMENT_CRITERIA


def get_speaking_parts_info() -> Dict[str, Any]:
    """Get speaking parts structure information."""
    return SPEAKING_PARTS
