"""
IELTS Dual-Track Course System
==============================
Implements Academic and General Training tracks within each course level.

Structure:
- BeginnerCourse: Academic Track + General Track
- MasteryCourse: Academic Track + General Track  
- AdvancedCourse: Academic Track + General Track

Speaking & Listening remain shared across both tracks.
"""

from typing import Dict, List, Any, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase


class DualTrackCourseManager:
    """
    Manages dual-track course structure for IELTS Academic and General Training.
    """
    
    # Track definitions
    TRACKS = {
        "academic": {
            "name": "Academic IELTS",
            "description": "For university admission and professional registration",
            "writing_task1": "Graph, chart, table, diagram description",
            "writing_task2": "Academic essay",
            "reading": "Academic texts from books, journals, newspapers"
        },
        "general": {
            "name": "General Training IELTS",
            "description": "For work experience, training programs, migration",
            "writing_task1": "Letter writing (formal, semi-formal, informal)",
            "writing_task2": "Essay on general topics",
            "reading": "Everyday texts: notices, advertisements, workplace documents"
        }
    }
    
    # ============ BEGINNER GENERAL TRACK LESSONS ============
    BEGINNER_GENERAL_LESSONS = [
        {
            "id": "gt-beginner-1",
            "lesson_number": 101,  # 100+ for General Track
            "track": "general",
            "topic": "Letter Basics",
            "title": "Introduction to Letter Writing",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Understand the three letter types (formal, semi-formal, informal)",
                "Learn basic letter structure",
                "Identify when to use each letter type"
            ],
            "writing": {
                "title": "Letter Purpose & Structure",
                "task_type": "letter",
                "key_concepts": [
                    "Formal: To someone you don't know (Dear Sir/Madam)",
                    "Semi-formal: To someone you know but not well (Dear Mr/Mrs + name)",
                    "Informal: To friends and family (Dear + first name)"
                ],
                "structure": {
                    "opening": "Greeting + reason for writing",
                    "body": "Main points (following bullet points)",
                    "closing": "Polite ending + appropriate sign-off"
                },
                "example_task": "Write a letter to a friend inviting them to visit you.",
                "model_answer": {
                    "band_6": "Dear Tom,\n\nI hope you are well. I am writing to invite you to visit me next month.\n\nI have moved to a new apartment and it has a spare room. You can stay with me for a week. We can visit the city together and try some local food.\n\nPlease let me know if you can come.\n\nBest wishes,\nAli",
                    "band_8": "Dear Tom,\n\nI hope this letter finds you in good health and spirits. I'm delighted to extend an invitation for you to visit me next month, as I've recently settled into a spacious new apartment.\n\nThe timing couldn't be better – there's a spare room waiting for you, and I've been eager to show you around my new neighbourhood. I've discovered some wonderful restaurants serving authentic local cuisine, and there are several attractions I know you'd appreciate.\n\nDo let me know your availability, and I'll make all the necessary arrangements.\n\nWarm regards,\nAli"
                }
            },
            "vocabulary": {
                "title": "Letter Writing Vocabulary",
                "words": [
                    {"word": "sincerely", "meaning": "Formal closing", "example": "Yours sincerely,"},
                    {"word": "faithfully", "meaning": "Very formal closing (unknown recipient)", "example": "Yours faithfully,"},
                    {"word": "regarding", "meaning": "About/concerning", "example": "I am writing regarding your advertisement."},
                    {"word": "enquire", "meaning": "To ask about", "example": "I would like to enquire about..."},
                    {"word": "grateful", "meaning": "Thankful", "example": "I would be grateful if you could..."}
                ]
            },
            "grammar": {
                "title": "Polite Request Forms",
                "explanation": "Use modal verbs for polite requests in letters",
                "examples": [
                    "Could you please send me...?",
                    "Would it be possible to...?",
                    "I would appreciate it if you could..."
                ]
            },
            "exercises": [
                {
                    "type": "matching",
                    "instruction": "Match the situation with the correct letter type",
                    "items": [
                        {"situation": "Writing to a company about a job", "answer": "formal"},
                        {"situation": "Writing to your cousin about a party", "answer": "informal"},
                        {"situation": "Writing to your landlord about repairs", "answer": "semi-formal"}
                    ]
                }
            ]
        },
        {
            "id": "gt-beginner-2",
            "lesson_number": 102,
            "track": "general",
            "topic": "Formal Letters",
            "title": "Writing Formal Letters",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Use appropriate formal greetings and closings",
                "Write clear and polite requests",
                "Maintain formal tone throughout"
            ],
            "writing": {
                "title": "Formal Letter Conventions",
                "task_type": "letter",
                "key_concepts": [
                    "Opening: Dear Sir or Madam, / Dear Mr/Mrs [Name],",
                    "Closing: Yours faithfully (unknown) / Yours sincerely (known name)",
                    "Tone: Polite, professional, no contractions"
                ],
                "formal_phrases": {
                    "opening_reason": [
                        "I am writing to enquire about...",
                        "I am writing regarding...",
                        "I am writing to express my concern about...",
                        "I am writing to apply for..."
                    ],
                    "requests": [
                        "I would be grateful if you could...",
                        "Could you please...",
                        "I would appreciate it if...",
                        "Would it be possible to..."
                    ],
                    "closing": [
                        "I look forward to hearing from you.",
                        "Thank you for your attention to this matter.",
                        "Please do not hesitate to contact me if you require further information."
                    ]
                },
                "example_task": "You bought a product online but it arrived damaged. Write a letter to the company.",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about a product I bought from your website last week.\n\nI ordered a laptop on 15th January. When it arrived, the screen was cracked. I paid £500 for this item and I am very disappointed.\n\nI would like a full refund or a replacement. Please contact me at my email address.\n\nYours faithfully,\nJohn Smith",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my dissatisfaction with a recent purchase from your online store.\n\nOn 15th January, I placed an order for a laptop computer (Order Reference: #12345) at a cost of £500. Unfortunately, when the package arrived on 20th January, I discovered that the screen was severely cracked, rendering the device unusable.\n\nGiven the circumstances, I would appreciate either a full refund or a replacement unit at your earliest convenience. I have retained the original packaging and can return the damaged item immediately.\n\nI look forward to your prompt response regarding this matter.\n\nYours faithfully,\nJohn Smith"
                }
            },
            "vocabulary": {
                "title": "Formal Complaint Vocabulary",
                "words": [
                    {"word": "dissatisfied", "meaning": "Not happy with something", "example": "I am dissatisfied with the service."},
                    {"word": "compensation", "meaning": "Money/action to make up for a problem", "example": "I am seeking compensation for..."},
                    {"word": "refund", "meaning": "Money returned", "example": "I would like a full refund."},
                    {"word": "replacement", "meaning": "New item in place of broken one", "example": "Please send a replacement."},
                    {"word": "inconvenience", "meaning": "Problems caused", "example": "I apologise for any inconvenience."}
                ]
            },
            "common_mistakes": [
                {"wrong": "I want my money back!", "correct": "I would like to request a refund."},
                {"wrong": "Your product is terrible.", "correct": "I am disappointed with the quality of the product."},
                {"wrong": "Fix this now!", "correct": "I would appreciate a prompt resolution."}
            ]
        },
        {
            "id": "gt-beginner-3",
            "lesson_number": 103,
            "track": "general",
            "topic": "Informal Letters",
            "title": "Writing to Friends & Family",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Use appropriate informal greetings and closings",
                "Write in a friendly, conversational tone",
                "Use contractions and casual expressions naturally"
            ],
            "writing": {
                "title": "Informal Letter Style",
                "task_type": "letter",
                "key_concepts": [
                    "Opening: Hi/Hello/Dear + first name",
                    "Closing: Love, / Best wishes, / Take care, / See you soon,",
                    "Tone: Friendly, personal, contractions OK"
                ],
                "informal_phrases": {
                    "opening": [
                        "How are you doing?",
                        "Hope you're well!",
                        "Great to hear from you!",
                        "It's been ages since we last spoke!"
                    ],
                    "body": [
                        "Guess what?",
                        "You won't believe this, but...",
                        "I've got some exciting news!",
                        "I was thinking we could..."
                    ],
                    "closing": [
                        "Can't wait to see you!",
                        "Let me know what you think.",
                        "Write back soon!",
                        "Miss you loads!"
                    ]
                },
                "example_task": "Write a letter to a friend telling them about your new job.",
                "model_answer": {
                    "band_6": "Hi Sarah,\n\nHow are you? I have some exciting news to share with you!\n\nI got a new job last week. I'm working at a marketing company in the city centre. The people are really nice and the office is beautiful. I'm a bit nervous but also very excited.\n\nWe should meet up soon so I can tell you all about it. Are you free next weekend?\n\nTake care,\nEmma",
                    "band_8": "Hey Sarah!\n\nGuess what? I've finally landed that dream job I've been going on about! I started at this amazing marketing company last Monday, and honestly, I'm still pinching myself.\n\nThe office is right in the heart of the city – you'd love it! My colleagues are brilliant, and they've already made me feel like part of the team. I won't lie, I was terrified on my first day, but it's all falling into place now.\n\nI'm dying to tell you everything in person! How about we grab coffee next Saturday? My treat – got to celebrate somehow!\n\nCan't wait to catch up!\nEmma x"
                }
            },
            "vocabulary": {
                "title": "Informal Expressions",
                "words": [
                    {"word": "catch up", "meaning": "Meet and talk", "example": "Let's catch up soon!"},
                    {"word": "loads", "meaning": "A lot", "example": "I miss you loads!"},
                    {"word": "brilliant", "meaning": "Great/wonderful", "example": "The party was brilliant!"},
                    {"word": "grab", "meaning": "Get quickly (informal)", "example": "Let's grab lunch."},
                    {"word": "dying to", "meaning": "Really want to", "example": "I'm dying to see you!"}
                ]
            }
        },
        {
            "id": "gt-beginner-4",
            "lesson_number": 104,
            "track": "general",
            "topic": "Semi-formal Letters",
            "title": "Writing to People You Know (Professionally)",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Identify when semi-formal tone is appropriate",
                "Balance politeness with friendly tone",
                "Write to landlords, neighbours, colleagues appropriately"
            ],
            "writing": {
                "title": "Semi-formal Letter Style",
                "task_type": "letter",
                "key_concepts": [
                    "Opening: Dear Mr/Mrs [Name], or Dear [First name] if appropriate",
                    "Closing: Yours sincerely, / Best regards, / Kind regards,",
                    "Tone: Polite but not stiff, some warmth allowed"
                ],
                "when_to_use": [
                    "Writing to a landlord or letting agent",
                    "Writing to a neighbour you know slightly",
                    "Writing to a work colleague",
                    "Writing to a teacher or course coordinator"
                ],
                "example_task": "Write a letter to your landlord about a problem with the heating in your apartment.",
                "model_answer": {
                    "band_6": "Dear Mr Johnson,\n\nI am writing to inform you about a problem with the heating in my apartment.\n\nFor the past week, the radiators have not been working properly. The apartment is very cold, especially at night. I have tried turning the heating on and off but it does not help.\n\nCould you please arrange for someone to come and fix this problem? I am available most afternoons this week.\n\nThank you for your help.\n\nYours sincerely,\nMaria Garcia\nFlat 4B",
                    "band_8": "Dear Mr Johnson,\n\nI hope this letter finds you well. I am writing to bring to your attention an issue with the central heating system in Flat 4B.\n\nOver the past week, the radiators throughout the apartment have been failing to heat up adequately, despite the thermostat being set correctly. As a result, the indoor temperature has dropped significantly, making the living conditions quite uncomfortable, particularly during the evenings.\n\nI would greatly appreciate it if you could arrange for a qualified technician to inspect and repair the system at your earliest convenience. I am generally available on weekday afternoons and can adjust my schedule to accommodate a visit.\n\nThank you in advance for your prompt attention to this matter.\n\nKind regards,\nMaria Garcia\nFlat 4B"
                }
            }
        },
        {
            "id": "gt-beginner-5",
            "lesson_number": 105,
            "track": "general",
            "topic": "General Reading",
            "title": "Reading Everyday Texts",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Understand notices and signs",
                "Read advertisements and product information",
                "Extract key information from everyday texts"
            ],
            "reading": {
                "title": "Understanding Notices & Signs",
                "text_types": [
                    "Public notices (libraries, hospitals, shops)",
                    "Advertisements (job ads, product ads, services)",
                    "Instructions and directions",
                    "Timetables and schedules"
                ],
                "practice_text": {
                    "type": "notice",
                    "content": "COMMUNITY CENTRE\nSwimming Pool Hours\nMonday - Friday: 6am - 9pm\nSaturday: 8am - 6pm\nSunday: 10am - 4pm\n\nMembership: £35/month (students: £25)\nDay pass: £8 (children under 12: £5)\n\nNote: Pool closed for maintenance every first Monday of the month."
                },
                "questions": [
                    {"question": "When does the pool open on Saturdays?", "answer": "8am"},
                    {"question": "How much is a monthly membership for students?", "answer": "£25"},
                    {"question": "When is the pool closed for maintenance?", "answer": "Every first Monday of the month"}
                ]
            },
            "tips": [
                "Skim the text first to understand the main topic",
                "Look for key words from the questions in the text",
                "Pay attention to numbers, dates, and times",
                "Read instructions carefully - order matters"
            ]
        }
    ]
    
    # ============ MASTERY GENERAL TRACK LESSONS ============
    MASTERY_GENERAL_LESSONS = [
        {
            "id": "gt-mastery-1",
            "module_number": 101,
            "track": "general",
            "topic": "Advanced Formal Letters",
            "title": "Formal Complaints & Explanations",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "learning_goals": [
                "Write sophisticated formal complaints",
                "Explain complex situations clearly",
                "Use advanced formal vocabulary"
            ],
            "writing": {
                "title": "Effective Formal Complaints",
                "key_concepts": [
                    "State the problem clearly and specifically",
                    "Provide relevant details (dates, reference numbers)",
                    "Explain the impact of the problem",
                    "Request specific action",
                    "Set reasonable expectations"
                ],
                "advanced_phrases": {
                    "stating_problem": [
                        "I wish to draw your attention to...",
                        "I am compelled to write regarding...",
                        "It is with regret that I must inform you...",
                        "I feel obliged to express my dissatisfaction with..."
                    ],
                    "explaining_impact": [
                        "This has resulted in considerable inconvenience...",
                        "As a consequence, I have been unable to...",
                        "The situation has had a significant impact on...",
                        "This has caused me considerable distress..."
                    ],
                    "requesting_action": [
                        "I trust you will give this matter your urgent attention.",
                        "I would expect this issue to be resolved within...",
                        "I anticipate receiving your response by...",
                        "I shall have no alternative but to... if this matter is not resolved."
                    ]
                },
                "example_task": "You have had a problem with your internet service for two weeks. Write a formal letter of complaint.",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about the internet service at my address. For the past two weeks, I have had no internet connection.\n\nI have called your customer service three times but the problem is still not fixed. This has caused many problems because I work from home and need internet for my job.\n\nI expect you to fix this problem immediately and give me compensation for the time without service.\n\nI look forward to your response.\n\nYours faithfully,\nDavid Chen",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my profound dissatisfaction with the internet service provided to my residence at 45 Oak Lane (Account: INT-789456).\n\nFor the past fortnight, I have experienced a complete loss of connectivity, despite having reported this issue to your customer service department on three separate occasions (reference numbers: CS-1234, CS-1267, CS-1289). Each time, I was assured the problem would be rectified within 48 hours, yet the situation remains unresolved.\n\nAs someone who relies heavily on a stable internet connection for remote work, this prolonged outage has had serious professional consequences. I have been forced to seek alternative working arrangements at considerable personal expense.\n\nI must insist that this matter receives your immediate attention. Furthermore, I expect appropriate compensation for the service disruption, equivalent to the period without connectivity. Should this issue not be resolved within the next five working days, I shall have no alternative but to terminate my contract and seek compensation through the relevant regulatory bodies.\n\nI await your urgent response.\n\nYours faithfully,\nDavid Chen"
                }
            },
            "vocabulary": {
                "title": "Advanced Formal Vocabulary",
                "words": [
                    {"word": "rectify", "meaning": "To fix/correct", "example": "Please rectify this error immediately."},
                    {"word": "forthwith", "meaning": "Immediately", "example": "I expect action forthwith."},
                    {"word": "aforementioned", "meaning": "Previously mentioned", "example": "The aforementioned issue..."},
                    {"word": "pursuant to", "meaning": "In accordance with", "example": "Pursuant to our agreement..."},
                    {"word": "hereby", "meaning": "By this means/as a result", "example": "I hereby request..."}
                ]
            }
        },
        {
            "id": "gt-mastery-2",
            "module_number": 102,
            "track": "general",
            "topic": "Semi-formal Communication",
            "title": "Neighbour & Community Letters",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "learning_goals": [
                "Handle sensitive topics diplomatically",
                "Balance firmness with politeness",
                "Propose solutions constructively"
            ],
            "writing": {
                "title": "Diplomatic Semi-formal Letters",
                "key_concepts": [
                    "Acknowledge positive aspects before criticism",
                    "Use softening language to reduce tension",
                    "Focus on solutions, not blame",
                    "Offer compromise where appropriate"
                ],
                "softening_techniques": {
                    "hedging": ["I was wondering if perhaps...", "It seems that...", "I may be mistaken, but..."],
                    "indirect_requests": ["Would it be possible to...?", "I was hoping we might...", "Perhaps we could consider..."],
                    "acknowledging": ["I understand that...", "I appreciate that...", "While I recognise that..."]
                },
                "example_task": "Your neighbour has been making noise late at night. Write a letter addressing this issue.",
                "model_answer": {
                    "band_8": "Dear Mr Thompson,\n\nI hope you've been settling in well since moving into the building last month. I've been meaning to introduce myself properly – I'm in Flat 5, just below yours.\n\nI'm writing because I wanted to discuss something that's been affecting me recently. Over the past few weeks, I've noticed quite a bit of noise coming from your flat in the late evening, particularly after 11pm. I completely understand that everyone has different schedules, and I'm certainly not suggesting you should have to tiptoe around your own home.\n\nHowever, as someone who has early starts for work, I've found it difficult to get adequate sleep on several occasions. I was wondering if there might be some way we could reach a compromise? Perhaps keeping louder activities to before 10pm on weeknights would help tremendously.\n\nI'd be more than happy to discuss this over coffee sometime if you'd prefer to chat in person. I'm sure we can find a solution that works for both of us.\n\nWith kind regards,\nSarah Mitchell\nFlat 5"
                }
            }
        },
        {
            "id": "gt-mastery-3",
            "module_number": 103,
            "track": "general",
            "topic": "Politeness Strategies",
            "title": "Softening Language & Diplomacy",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "learning_goals": [
                "Master indirect language for sensitive topics",
                "Use modal verbs for varying degrees of politeness",
                "Apply hedging techniques effectively"
            ],
            "writing": {
                "title": "The Art of Polite Writing",
                "politeness_scale": [
                    {"level": "Direct (less polite)", "example": "Send me the report.", "use": "Close friends, urgent situations"},
                    {"level": "Polite", "example": "Could you send me the report?", "use": "Colleagues, acquaintances"},
                    {"level": "More polite", "example": "Would you mind sending me the report?", "use": "Semi-formal situations"},
                    {"level": "Very polite", "example": "I was wondering if you might be able to send me the report?", "use": "Formal requests, sensitive topics"},
                    {"level": "Extremely polite", "example": "I would be most grateful if you could possibly send me the report at your earliest convenience.", "use": "Very formal, important requests"}
                ],
                "hedging_language": [
                    "It appears that...",
                    "There seems to be...",
                    "I might be wrong, but...",
                    "Correct me if I'm mistaken, however...",
                    "Unless I'm misunderstanding..."
                ]
            }
        },
        {
            "id": "gt-mastery-4",
            "module_number": 104,
            "track": "general",
            "topic": "Request & Apology Letters",
            "title": "Making Requests & Apologising",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "learning_goals": [
                "Write effective request letters",
                "Compose sincere apology letters",
                "Balance explanation with taking responsibility"
            ],
            "writing": {
                "title": "Requests and Apologies",
                "request_structure": [
                    "Background/context",
                    "The specific request",
                    "Reason for the request",
                    "What you can offer in return",
                    "Polite closing"
                ],
                "apology_structure": [
                    "Express regret sincerely",
                    "Acknowledge the impact",
                    "Explain (without making excuses)",
                    "Take responsibility",
                    "Offer to make amends"
                ],
                "example_task": "You borrowed something from a friend and accidentally damaged it. Write a letter apologising.",
                "model_answer": {
                    "band_8": "Dear James,\n\nI hardly know where to begin – I feel absolutely terrible about what happened to your camera last weekend.\n\nAs you know, I borrowed it for my sister's wedding, and I can't thank you enough for trusting me with such an expensive piece of equipment. Unfortunately, during the reception, someone bumped into me while I was changing lenses, and the camera fell onto the stone floor. The lens is cracked and the body has some scratches.\n\nPlease believe me when I say I'm devastated about this. I know how much that camera means to you and how long you saved to buy it. There's no excuse – I should have been more careful.\n\nI want to make this right. I've already contacted the repair shop, and they've quoted £350 for the repairs. I insist on covering the entire cost, and I've set the money aside. Alternatively, if you'd prefer a replacement, I'm happy to contribute towards a new camera.\n\nI completely understand if you're upset with me. Please let me know how you'd like to proceed.\n\nWith sincere apologies,\nMike"
                }
            }
        },
        {
            "id": "gt-mastery-5",
            "module_number": 105,
            "track": "general",
            "topic": "General Reading Advanced",
            "title": "Workplace & Official Documents",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "learning_goals": [
                "Understand workplace policies and procedures",
                "Read and interpret contracts and agreements",
                "Navigate official forms and applications"
            ],
            "reading": {
                "title": "Understanding Workplace Documents",
                "text_types": [
                    "Employee handbooks and policies",
                    "Health and safety guidelines",
                    "Training manuals and procedures",
                    "Contracts and agreements"
                ],
                "skills": [
                    "Identifying key terms and conditions",
                    "Understanding rights and responsibilities",
                    "Following multi-step procedures",
                    "Recognising important deadlines and dates"
                ]
            }
        }
    ]
    
    # ============ ADVANCED GENERAL TRACK LESSONS ============
    ADVANCED_GENERAL_LESSONS = [
        {
            "id": "gt-advanced-1",
            "module_number": 101,
            "track": "general",
            "topic": "High-Band Letter Techniques",
            "title": "Band 8-9 Letter Writing Mastery",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "learning_goals": [
                "Achieve natural, sophisticated tone",
                "Demonstrate lexical flexibility",
                "Master complex sentence structures in letters"
            ],
            "writing": {
                "title": "Excellence in Letter Writing",
                "band_9_characteristics": [
                    "Completely natural use of language",
                    "Wide range of vocabulary used precisely",
                    "Complex structures used accurately throughout",
                    "Cohesion that attracts no attention",
                    "Fully appropriate register maintained"
                ],
                "advanced_techniques": {
                    "varied_openings": [
                        "Further to our recent conversation...",
                        "I trust this letter finds you well.",
                        "Thank you for taking the time to...",
                        "I am delighted to have the opportunity to..."
                    ],
                    "sophisticated_transitions": [
                        "With this in mind,...",
                        "Given the circumstances,...",
                        "In light of the above,...",
                        "That said,...",
                        "Having considered all factors,..."
                    ],
                    "nuanced_closings": [
                        "Should you require any clarification, please do not hesitate to contact me.",
                        "I remain at your disposal for any further assistance.",
                        "I would welcome the opportunity to discuss this further at your convenience."
                    ]
                }
            }
        },
        {
            "id": "gt-advanced-2",
            "module_number": 102,
            "track": "general",
            "topic": "Nuanced Tone Control",
            "title": "Mastering Register & Tone",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "learning_goals": [
                "Adjust tone precisely for different situations",
                "Convey subtle emotions appropriately",
                "Handle complex interpersonal dynamics"
            ],
            "writing": {
                "title": "Tone Mastery",
                "tone_spectrum": {
                    "expressing_concern": {
                        "mild": "I was wondering if everything is alright.",
                        "moderate": "I must admit I'm somewhat concerned about...",
                        "strong": "I am deeply troubled by the situation regarding..."
                    },
                    "expressing_dissatisfaction": {
                        "mild": "I was a little disappointed to find that...",
                        "moderate": "I was rather dismayed to discover...",
                        "strong": "I was appalled to learn that..."
                    },
                    "expressing_gratitude": {
                        "mild": "Thank you for your help.",
                        "moderate": "I am most grateful for your assistance.",
                        "strong": "I cannot express how much your support has meant to me."
                    }
                }
            }
        },
        {
            "id": "gt-advanced-3",
            "module_number": 103,
            "track": "general",
            "topic": "Persuasive Writing",
            "title": "Persuasion & Diplomatic Writing",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "learning_goals": [
                "Construct persuasive arguments in letters",
                "Handle disagreements diplomatically",
                "Negotiate effectively in writing"
            ],
            "writing": {
                "title": "The Art of Persuasion",
                "persuasive_techniques": [
                    "Appeal to shared values or goals",
                    "Present logical evidence",
                    "Acknowledge counterarguments fairly",
                    "Use appropriate emotional appeal",
                    "Offer mutually beneficial solutions"
                ],
                "diplomatic_phrases": [
                    "While I appreciate your position,...",
                    "I understand the challenges you face; however,...",
                    "Might I suggest an alternative approach?",
                    "Perhaps we could find middle ground by...",
                    "I believe we both share the goal of..."
                ]
            }
        },
        {
            "id": "gt-advanced-4",
            "module_number": 104,
            "track": "general",
            "topic": "Complex Reading",
            "title": "Legal & Civic Texts",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "learning_goals": [
                "Navigate complex official documents",
                "Understand legal terminology in context",
                "Interpret civic and governmental texts"
            ],
            "reading": {
                "title": "Understanding Complex Texts",
                "text_types": [
                    "Lease agreements and rental contracts",
                    "Insurance policies",
                    "Government forms and applications",
                    "Consumer rights documentation",
                    "Professional regulations"
                ],
                "key_skills": [
                    "Identifying legally binding language",
                    "Understanding conditions and exceptions",
                    "Recognising rights and obligations",
                    "Following complex procedural instructions"
                ]
            }
        }
    ]
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def get_course_with_tracks(self, course_level: str) -> Dict[str, Any]:
        """
        Get course structure with both Academic and General tracks.
        """
        # Map to collection names
        collections = {
            "beginner": "beginner_english_lessons",
            "mastery": "mastery_course_modules",
            "advanced": "advanced_mastery_modules"
        }
        
        collection_name = collections.get(course_level)
        if not collection_name:
            return {"error": "Invalid course level"}
        
        # Get Academic track lessons (existing)
        academic_lessons = await self.db[collection_name].find(
            {}, {"_id": 0}
        ).to_list(100)
        
        # Add track info to academic lessons
        for lesson in academic_lessons:
            lesson["track"] = "academic"
        
        # Get General track lessons
        general_lessons = self._get_general_lessons(course_level)
        
        return {
            "course_level": course_level,
            "tracks": {
                "academic": {
                    "name": self.TRACKS["academic"]["name"],
                    "description": self.TRACKS["academic"]["description"],
                    "lesson_count": len(academic_lessons),
                    "lessons": academic_lessons
                },
                "general": {
                    "name": self.TRACKS["general"]["name"],
                    "description": self.TRACKS["general"]["description"],
                    "lesson_count": len(general_lessons),
                    "lessons": general_lessons
                }
            },
            "shared_skills": ["speaking", "listening"]
        }
    
    def _get_general_lessons(self, course_level: str) -> List[Dict[str, Any]]:
        """Get General Training lessons for a course level."""
        lessons_map = {
            "beginner": self.BEGINNER_GENERAL_LESSONS,
            "mastery": self.MASTERY_GENERAL_LESSONS,
            "advanced": self.ADVANCED_GENERAL_LESSONS
        }
        return lessons_map.get(course_level, [])
    
    async def get_lessons_by_track(
        self, 
        course_level: str, 
        track: str
    ) -> List[Dict[str, Any]]:
        """Get lessons for a specific track."""
        if track == "general":
            return self._get_general_lessons(course_level)
        
        # Academic track - from database
        collections = {
            "beginner": "beginner_english_lessons",
            "mastery": "mastery_course_modules",
            "advanced": "advanced_mastery_modules"
        }
        
        collection_name = collections.get(course_level)
        if not collection_name:
            return []
        
        lessons = await self.db[collection_name].find({}, {"_id": 0}).to_list(100)
        for lesson in lessons:
            lesson["track"] = "academic"
        
        return lessons
    
    async def get_lesson_by_id(
        self, 
        lesson_id: str
    ) -> Optional[Dict[str, Any]]:
        """Get a specific lesson by ID from any track."""
        # Check General Track lessons first
        for lessons in [
            self.BEGINNER_GENERAL_LESSONS,
            self.MASTERY_GENERAL_LESSONS,
            self.ADVANCED_GENERAL_LESSONS
        ]:
            for lesson in lessons:
                if lesson.get("id") == lesson_id:
                    return lesson
        
        # Check Academic Track in database
        for collection_name in [
            "beginner_english_lessons",
            "mastery_course_modules",
            "advanced_mastery_modules"
        ]:
            lesson = await self.db[collection_name].find_one(
                {"id": lesson_id}, {"_id": 0}
            )
            if lesson:
                lesson["track"] = "academic"
                return lesson
        
        return None
    
    async def get_recommended_lessons_by_track(
        self,
        track: str,
        weaknesses: List[str],
        band_level: str
    ) -> List[Dict[str, Any]]:
        """Get lesson recommendations for a specific track based on weaknesses."""
        recommendations = []
        
        # Determine course levels based on band
        if band_level in ["4.0-5.0"]:
            course_levels = ["beginner"]
        elif band_level in ["5.5-6.5"]:
            course_levels = ["beginner", "mastery"]
        else:
            course_levels = ["beginner", "mastery", "advanced"]
        
        # Get lessons for the track
        for level in course_levels:
            lessons = await self.get_lessons_by_track(level, track)
            
            for lesson in lessons:
                relevance_score = 0
                matched_weaknesses = []
                
                # Check lesson content against weaknesses
                lesson_text = str(lesson).lower()
                
                weakness_keywords = {
                    "letter_format": ["letter", "formal", "informal", "opening", "closing"],
                    "tone": ["tone", "polite", "formal", "register", "softening"],
                    "vocabulary": ["vocabulary", "words", "expressions", "phrases"],
                    "grammar": ["grammar", "structure", "sentence"],
                    "task_achievement": ["task", "bullet", "points", "address"]
                }
                
                for weakness in weaknesses:
                    keywords = weakness_keywords.get(weakness.lower(), [weakness.lower()])
                    for keyword in keywords:
                        if keyword in lesson_text:
                            relevance_score += 1
                            if weakness not in matched_weaknesses:
                                matched_weaknesses.append(weakness)
                            break
                
                if relevance_score > 0:
                    recommendations.append({
                        "lesson_id": lesson.get("id"),
                        "title": lesson.get("topic") or lesson.get("title"),
                        "level": level,
                        "track": track,
                        "band_target": lesson.get("band_target"),
                        "relevance_score": relevance_score,
                        "addresses_weaknesses": matched_weaknesses
                    })
        
        # Sort by relevance
        recommendations.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return recommendations[:5]


# Factory function
def get_dual_track_manager(db: AsyncIOMotorDatabase) -> DualTrackCourseManager:
    return DualTrackCourseManager(db)
