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
            "skill": "reading",
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
                ],
                "practice_texts": [
                    {
                        "id": "workplace-doc-1",
                        "type": "Health & Safety Notice",
                        "content": "FIRE SAFETY PROCEDURES\n\nIn the event of a fire:\n\n1. If you discover a fire, activate the nearest fire alarm\n2. Do NOT attempt to fight the fire unless trained\n3. Leave the building by the nearest exit\n4. Do NOT use lifts/elevators\n5. Proceed to the assembly point (Car Park B)\n6. Report to your Fire Warden\n\nFire Wardens: Floor 1 - Sarah Chen, Floor 2 - Marcus Williams\n\nFire drills are conducted quarterly. All staff must participate.\n\nEmergency Contact: 999 or Internal: 5555",
                        "questions": [
                            {"q": "Where is the assembly point?", "a": "Car Park B", "skill": "locating specific info"},
                            {"q": "Who is the Fire Warden for Floor 2?", "a": "Marcus Williams", "skill": "locating specific info"},
                            {"q": "How often are fire drills conducted?", "a": "Quarterly", "skill": "understanding frequency"},
                            {"q": "What should you NOT use during a fire?", "a": "Lifts/elevators", "skill": "identifying restrictions"}
                        ]
                    }
                ],
                "tips": [
                    "Look for numbered lists - they often show procedures",
                    "Pay attention to words in CAPITALS - they're usually important",
                    "Note contact information and responsible persons",
                    "Identify what you must do vs what you must NOT do"
                ]
            }
        },
        # ============ MASTERY GENERAL READING LESSONS (NEW) ============
        {
            "id": "gt-mastery-reading-1",
            "module_number": 106,
            "track": "general",
            "topic": "Notices & Announcements",
            "title": "Reading Public Notices & Announcements",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "skill": "reading",
            "learning_goals": [
                "Quickly locate specific information in notices",
                "Understand implied meanings and conditions",
                "Identify target audience and purpose",
                "Recognise warning and restriction language"
            ],
            "reading": {
                "title": "Public Notices & Announcements",
                "text_types": ["Community notices", "Library/gym announcements", "Building management notices", "Event announcements"],
                "key_skills": [
                    "Scanning for specific details (times, dates, costs)",
                    "Understanding conditional language (if/unless/provided that)",
                    "Recognising formal notice conventions"
                ],
                "practice_texts": [
                    {
                        "id": "notice-1",
                        "type": "Building Management Notice",
                        "content": "ATTENTION ALL RESIDENTS\n\nWater Supply Interruption\n\nDue to essential maintenance work, the water supply to all apartments will be temporarily interrupted on Saturday, 15th March from 9:00 AM to 3:00 PM.\n\nPlease ensure you store sufficient water for drinking and essential needs before this time.\n\nEmergency water will be available in the lobby from 8:30 AM.\n\nWe apologise for any inconvenience caused.\n\nBuilding Management\nContact: maintenance@residences.co.uk",
                        "questions": [
                            {"q": "How long will the water be off?", "a": "6 hours (9 AM to 3 PM)", "skill": "time calculation"},
                            {"q": "Where can residents get emergency water?", "a": "In the lobby", "skill": "locating specific info"},
                            {"q": "What should residents do before 9 AM?", "a": "Store sufficient water", "skill": "understanding instructions"}
                        ]
                    },
                    {
                        "id": "notice-2",
                        "type": "Library Announcement",
                        "content": "CENTRAL LIBRARY - NEW SERVICES\n\nWe are pleased to announce extended opening hours starting from 1st April:\n\nMonday-Thursday: 8:00 AM - 9:00 PM\nFriday-Saturday: 9:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM\n\nNEW: Study Room Booking\nMembers can now book private study rooms online. Bookings must be made at least 24 hours in advance. Maximum booking: 3 hours per day.\n\nNote: Study rooms are not available on Sundays.\n\nFor bookings, visit: library.gov.uk/bookings",
                        "questions": [
                            {"q": "What is the latest closing time during the week?", "a": "9:00 PM (Monday-Thursday)", "skill": "comparing information"},
                            {"q": "Can you book a study room for Sunday?", "a": "No, not available on Sundays", "skill": "understanding restrictions"},
                            {"q": "How far in advance must you book?", "a": "At least 24 hours", "skill": "identifying conditions"}
                        ]
                    }
                ],
                "tips": [
                    "Read the heading first to understand the main topic",
                    "Look for dates, times, and conditions",
                    "Pay attention to words like 'must', 'should', 'not available'",
                    "Notice contact information for follow-up"
                ],
                "model_answer_approach": {
                    "band_6": "At Band 6, you can locate most specific information but may miss implied meanings or conditions.",
                    "band_7": "At Band 7, you understand both explicit and implicit information, including exceptions and conditions."
                }
            }
        },
        {
            "id": "gt-mastery-reading-2",
            "module_number": 107,
            "track": "general",
            "topic": "Email Communication",
            "title": "Reading Workplace & Official Emails",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "skill": "reading",
            "learning_goals": [
                "Identify the purpose and tone of formal emails",
                "Extract action items and deadlines",
                "Understand professional email conventions",
                "Recognise levels of urgency and politeness"
            ],
            "reading": {
                "title": "Email Communication",
                "text_types": ["Workplace emails", "Official correspondence", "Customer service emails", "Appointment confirmations"],
                "key_skills": [
                    "Identifying main purpose (request, inform, confirm)",
                    "Recognising tone (formal, semi-formal, urgent)",
                    "Finding action required by recipient",
                    "Understanding attached document references"
                ],
                "practice_texts": [
                    {
                        "id": "email-1",
                        "type": "Workplace Email",
                        "content": "Subject: Team Meeting - Agenda Changes\n\nDear Team,\n\nI hope this email finds you well.\n\nI am writing to inform you that the agenda for our weekly meeting on Thursday has been updated. Due to the upcoming project deadline, we will now focus primarily on the client presentation.\n\nPlease ensure you have reviewed the attached draft presentation before the meeting. If you have any slides to add, please send them to me by Wednesday 5 PM.\n\nThe meeting will now start at 2:30 PM instead of 2:00 PM to allow Sarah to join us after her client call.\n\nPlease confirm your attendance by replying to this email.\n\nBest regards,\nMichael Chen\nProject Manager",
                        "questions": [
                            {"q": "What is the main topic of the meeting?", "a": "Client presentation", "skill": "identifying main purpose"},
                            {"q": "What has changed about the meeting time?", "a": "Changed from 2:00 PM to 2:30 PM", "skill": "identifying changes"},
                            {"q": "What do team members need to do before Wednesday 5 PM?", "a": "Send any additional slides", "skill": "identifying deadlines"},
                            {"q": "Why was the meeting time changed?", "a": "To allow Sarah to join after her client call", "skill": "understanding reasons"}
                        ]
                    },
                    {
                        "id": "email-2",
                        "type": "Official Correspondence",
                        "content": "Subject: Your Application Reference: APP-2024-0892\n\nDear Ms Thompson,\n\nThank you for your recent application for a parking permit.\n\nWe have reviewed your application and require additional documentation before we can proceed:\n\n1. Proof of residence (utility bill dated within the last 3 months)\n2. Vehicle registration document\n3. Valid driving licence (both sides)\n\nPlease submit these documents within 14 days of this email. You can upload them through our online portal or bring them to our office during opening hours (Mon-Fri, 9 AM - 5 PM).\n\nFailure to provide the required documents within the specified timeframe may result in your application being cancelled.\n\nIf you have any questions, please contact us at permits@council.gov.uk or call 0800 123 4567.\n\nYours sincerely,\nParking Services Team\nCity Council",
                        "questions": [
                            {"q": "What is the application reference number?", "a": "APP-2024-0892", "skill": "locating specific info"},
                            {"q": "How many documents are required?", "a": "Three", "skill": "counting items"},
                            {"q": "What happens if documents aren't submitted in time?", "a": "Application may be cancelled", "skill": "understanding consequences"},
                            {"q": "How old can the utility bill be?", "a": "Within the last 3 months", "skill": "identifying conditions"}
                        ]
                    }
                ],
                "tips": [
                    "Check the subject line for the main topic",
                    "Look for action verbs: 'please ensure', 'kindly submit', 'you must'",
                    "Note any deadlines mentioned",
                    "Identify what the sender expects you to do"
                ]
            }
        },
        {
            "id": "gt-mastery-reading-3",
            "module_number": 108,
            "track": "general",
            "topic": "Workplace Documents",
            "title": "Reading Policies & Procedures",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "skill": "reading",
            "learning_goals": [
                "Navigate workplace policy documents",
                "Understand employee rights and responsibilities",
                "Follow procedural instructions accurately",
                "Identify key compliance requirements"
            ],
            "reading": {
                "title": "Workplace Policies & Procedures",
                "text_types": ["Employee handbooks", "Health & safety policies", "Leave policies", "Code of conduct"],
                "key_skills": [
                    "Understanding hierarchical document structure",
                    "Identifying mandatory vs optional requirements",
                    "Following step-by-step procedures",
                    "Recognising exceptions and special cases"
                ],
                "practice_texts": [
                    {
                        "id": "policy-1",
                        "type": "Annual Leave Policy",
                        "content": "ANNUAL LEAVE POLICY\n\n1. Entitlement\nAll full-time employees are entitled to 25 days of paid annual leave per year, plus public holidays. Part-time employees receive a pro-rata entitlement.\n\n2. Booking Leave\n- Leave requests must be submitted at least 2 weeks in advance for periods of 1-3 days\n- For leave of 4 days or more, 4 weeks' notice is required\n- Requests are subject to manager approval and operational requirements\n\n3. Restrictions\n- No more than 2 consecutive weeks may be taken without director approval\n- Leave cannot be carried over to the next year, except in exceptional circumstances approved by HR\n- December 15-31 is a restricted period; only essential leave will be approved\n\n4. Emergency Leave\nIn case of family emergency, employees may request immediate leave. This will be deducted from annual allowance or taken as unpaid leave if entitlement is exhausted.",
                        "questions": [
                            {"q": "How many days' notice is needed for a 5-day holiday?", "a": "4 weeks", "skill": "applying rules"},
                            {"q": "Can unused leave be carried to next year?", "a": "Only in exceptional circumstances approved by HR", "skill": "understanding exceptions"},
                            {"q": "What is the restricted period for leave?", "a": "December 15-31", "skill": "locating specific info"},
                            {"q": "How much leave do full-time employees get?", "a": "25 days plus public holidays", "skill": "locating entitlements"}
                        ]
                    }
                ],
                "tips": [
                    "Look for section headings to navigate quickly",
                    "Note words like 'must', 'may', 'cannot', 'except'",
                    "Pay attention to numbers and timeframes",
                    "Identify who approves different types of requests"
                ]
            }
        },
        {
            "id": "gt-mastery-reading-4",
            "module_number": 109,
            "track": "general",
            "topic": "Forms & Applications",
            "title": "Understanding Forms & Instructions",
            "level": "mastery",
            "band_target": "5.5-6.5",
            "skill": "reading",
            "learning_goals": [
                "Read and understand form instructions accurately",
                "Identify required vs optional fields",
                "Understand eligibility criteria",
                "Follow application procedures correctly"
            ],
            "reading": {
                "title": "Forms & Application Documents",
                "text_types": ["Application forms", "Registration documents", "Claim forms", "Booking forms"],
                "key_skills": [
                    "Understanding field labels and requirements",
                    "Recognising mandatory fields (*required)",
                    "Following conditional instructions (if applicable)",
                    "Understanding supporting document requirements"
                ],
                "practice_texts": [
                    {
                        "id": "form-1",
                        "type": "Gym Membership Application",
                        "content": "FITNESS FIRST - MEMBERSHIP APPLICATION\n\nMembership Options:\n□ Standard (£45/month) - Gym access Mon-Fri 6am-5pm\n□ Premium (£65/month) - Full access, all hours, includes classes\n□ Student (£30/month) - Valid student ID required, off-peak only\n\nPersonal Details: (* = required)\n*Full Name: _______________\n*Date of Birth: _______________\n*Email: _______________\nPhone: _______________\n*Emergency Contact: _______________\n\nHealth Declaration:\nDo you have any medical conditions we should be aware of? Y/N\nIf YES, please provide details: _______________\n\nPayment:\n□ Monthly Direct Debit (first month + £20 joining fee)\n□ Annual Payment (10% discount, no joining fee)\n\nTerms:\n- 30-day cancellation notice required\n- Membership is non-transferable\n- Photo ID required on first visit\n\nSignature: _______________ Date: _______________",
                        "questions": [
                            {"q": "Which membership includes fitness classes?", "a": "Premium", "skill": "comparing options"},
                            {"q": "What is required for student membership?", "a": "Valid student ID", "skill": "identifying requirements"},
                            {"q": "Which payment method has no joining fee?", "a": "Annual payment", "skill": "comparing conditions"},
                            {"q": "Is phone number required?", "a": "No, it's optional (no asterisk)", "skill": "understanding form conventions"},
                            {"q": "What must you bring on your first visit?", "a": "Photo ID", "skill": "identifying requirements"}
                        ]
                    }
                ],
                "tips": [
                    "Look for asterisks (*) indicating required fields",
                    "Read ALL options before choosing",
                    "Check eligibility requirements for each option",
                    "Note what documents you need to provide"
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
    
    # ============ MODULE-SPECIFIC LANGUAGE BOOSTERS ============
    # Each module gets its own vocabulary + functional phrases for General Training
    MODULE_LANGUAGE_BOOSTERS = {
        "education": {
            "lesson_id": "G_EDUCATION_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Education",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to education, write clear General Training letters about courses and schools, and understand everyday texts like course brochures and registration forms.",
            "key_vocabulary": [
                {"word": "enrolment", "meaning": "Signing up for a course", "typical_use": "The enrolment deadline is next Friday."},
                {"word": "tuition fees", "meaning": "Money paid for courses", "typical_use": "The tuition fees include all materials."},
                {"word": "syllabus", "meaning": "Course content plan", "typical_use": "Please check the syllabus for assignment dates."},
                {"word": "certificate", "meaning": "Document proving completion", "typical_use": "You will receive a certificate after the course."},
                {"word": "attendance", "meaning": "Being present in class", "typical_use": "Regular attendance is required."},
                {"word": "assessment", "meaning": "Test or evaluation", "typical_use": "There will be continuous assessment throughout."},
                {"word": "deadline", "meaning": "Final date to submit", "typical_use": "The deadline for applications is March 15th."},
                {"word": "registration", "meaning": "Official sign-up process", "typical_use": "Registration opens on Monday."},
                {"word": "semester", "meaning": "Half of academic year", "typical_use": "The course runs for one semester."},
                {"word": "qualification", "meaning": "Degree or certificate earned", "typical_use": "What qualifications do I need?"},
                {"word": "prerequisite", "meaning": "Required before starting", "typical_use": "English B2 is a prerequisite."},
                {"word": "timetable", "meaning": "Schedule of classes", "typical_use": "The timetable will be sent by email."},
                {"word": "coursework", "meaning": "Assignments during course", "typical_use": "Coursework counts for 40% of the grade."},
                {"word": "withdraw", "meaning": "Leave a course", "typical_use": "You may withdraw within 14 days."},
                {"word": "placement test", "meaning": "Test to determine level", "typical_use": "All students take a placement test."}
            ],
            "functional_phrases": {
                "requests": [
                    "I would like to enquire about...",
                    "Could you please send me information about...?",
                    "I am writing to request details of..."
                ],
                "complaints": [
                    "I am writing to express my dissatisfaction with...",
                    "I was disappointed to find that...",
                    "I would like to bring to your attention..."
                ],
                "explanations": [
                    "The reason I am writing is that...",
                    "I am contacting you because...",
                    "Due to circumstances beyond my control..."
                ],
                "closing": [
                    "I look forward to hearing from you.",
                    "Please let me know at your earliest convenience.",
                    "I would appreciate a prompt response."
                ]
            },
            "example_sentences": [
                "I am writing to enquire about the English language courses available at your institution.",
                "Could you please send me details of the tuition fees and the enrolment process?",
                "I was disappointed to find that the course syllabus had changed without prior notice.",
                "Due to illness, I was unable to meet the assignment deadline.",
                "I would like to request an extension for my coursework submission."
            ],
            "common_mistakes": [
                {"wrong": "I want know about courses", "correct": "I would like to know about courses", "explanation": "Use polite forms in formal letters"},
                {"wrong": "Please send me informations", "correct": "Please send me information", "explanation": "'Information' is uncountable"},
                {"wrong": "I am interesting in your course", "correct": "I am interested in your course", "explanation": "Use -ed for feelings about things"},
                {"wrong": "I will grateful if you reply", "correct": "I would be grateful if you could reply", "explanation": "Use conditional for polite requests"}
            ],
            "supports_tasks": ["GT_Writing_Task1_Letter", "GT_Reading_Notice", "GT_Reading_Form"],
            "writing_task": {
                "title": "Letter to Language School",
                "prompt": "You want to study English at a language school abroad. Write a letter to the school. In your letter:\n- explain why you want to study there\n- ask about courses and fees\n- enquire about accommodation options",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to enquire about English courses at your school. I found your website and I am very interested.\n\nI want to study at your school because it has a good reputation. I need to improve my English for my job. I would like to know what courses you have and how much they cost.\n\nAlso, can you tell me about accommodation? I need somewhere to stay during my studies.\n\nPlease send me more information. I look forward to hearing from you.\n\nYours faithfully,\nMaria Garcia",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to enquire about the intensive English programmes offered at your institution, which I came across while researching reputable language schools.\n\nHaving recently been promoted to a position requiring frequent international communication, I am keen to enhance my business English skills at a well-established school such as yours. I would be grateful if you could provide details of course durations, fee structures, and any upcoming start dates.\n\nAdditionally, I would appreciate information regarding accommodation options for international students. Ideally, I am looking for a homestay arrangement that would allow me to practise English outside the classroom.\n\nI look forward to receiving your prospectus at your earliest convenience.\n\nYours faithfully,\nMaria Garcia"
                }
            },
            "reading_task": {
                "title": "Course Registration Notice",
                "type": "Notice",
                "content": "WESTFIELD LANGUAGE CENTRE\n\nSummer Intensive English Programme 2024\n\nRegistration Now Open!\n\nCourse Dates: July 1 - August 23 (8 weeks)\nLevels: Elementary to Advanced\nClass Size: Maximum 12 students\n\nFees:\n- Full programme (8 weeks): £2,400\n- 4-week option: £1,350\n- Registration fee: £75 (non-refundable)\n\nIncludes: All course materials, certificate, weekly excursions\n\nAccommodation:\n- Homestay (half-board): £180/week\n- Student residence: £150/week (self-catering)\n\nHow to Apply:\n1. Complete online application form\n2. Take online placement test\n3. Pay registration fee to secure your place\n\nEarly Bird Discount: 10% off if you register before May 1st\n\nContact: admissions@westfieldlc.ac.uk | +44 20 1234 5678",
                "questions": [
                    {"q": "How long is the full programme?", "a": "8 weeks", "skill": "locating specific info"},
                    {"q": "What is the maximum number of students per class?", "a": "12", "skill": "locating specific info"},
                    {"q": "Which accommodation option includes meals?", "a": "Homestay (half-board)", "skill": "understanding options"},
                    {"q": "How can you get 10% off?", "a": "Register before May 1st", "skill": "identifying conditions"},
                    {"q": "Is the registration fee refundable?", "a": "No, it is non-refundable", "skill": "understanding terms"}
                ]
            }
        },
        "health": {
            "lesson_id": "G_HEALTH_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Health",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to health services, write clear letters about medical appointments and complaints, and understand health-related notices and forms.",
            "key_vocabulary": [
                {"word": "appointment", "meaning": "Scheduled meeting with doctor", "typical_use": "I would like to book an appointment."},
                {"word": "prescription", "meaning": "Doctor's medicine order", "typical_use": "The doctor gave me a prescription."},
                {"word": "symptoms", "meaning": "Signs of illness", "typical_use": "What symptoms do you have?"},
                {"word": "treatment", "meaning": "Medical care given", "typical_use": "The treatment was very effective."},
                {"word": "diagnosis", "meaning": "Identifying an illness", "typical_use": "I am waiting for my diagnosis."},
                {"word": "consultation", "meaning": "Meeting with specialist", "typical_use": "I need a consultation with a specialist."},
                {"word": "referral", "meaning": "Being sent to another doctor", "typical_use": "My GP gave me a referral."},
                {"word": "waiting list", "meaning": "Queue for treatment", "typical_use": "There is a long waiting list."},
                {"word": "medical records", "meaning": "Health history documents", "typical_use": "Please send my medical records."},
                {"word": "insurance", "meaning": "Health coverage plan", "typical_use": "Does your insurance cover this?"},
                {"word": "side effects", "meaning": "Unwanted medicine effects", "typical_use": "Are there any side effects?"},
                {"word": "dosage", "meaning": "Amount of medicine", "typical_use": "What is the correct dosage?"},
                {"word": "check-up", "meaning": "Routine health exam", "typical_use": "I need my annual check-up."},
                {"word": "emergency", "meaning": "Urgent medical situation", "typical_use": "Go to emergency immediately."},
                {"word": "discharge", "meaning": "Release from hospital", "typical_use": "When will I be discharged?"}
            ],
            "functional_phrases": {
                "requests": [
                    "I would like to make an appointment with...",
                    "Could you please arrange a consultation...?",
                    "I am writing to request a referral to..."
                ],
                "complaints": [
                    "I wish to complain about the standard of care...",
                    "I am extremely concerned about...",
                    "I was very disappointed with the service..."
                ],
                "explanations": [
                    "I have been experiencing symptoms such as...",
                    "My condition has not improved despite...",
                    "The reason for my letter is that..."
                ],
                "closing": [
                    "I would appreciate your urgent attention to this matter.",
                    "Please contact me to arrange a suitable time.",
                    "I expect a response within 14 days."
                ]
            },
            "example_sentences": [
                "I am writing to complain about the long waiting time at the clinic last Tuesday.",
                "Could you please send me a copy of my medical records for insurance purposes?",
                "I have been experiencing severe headaches for the past two weeks.",
                "I would like to request a referral to a specialist as my symptoms have not improved.",
                "I am extremely concerned about the side effects of the medication prescribed."
            ],
            "common_mistakes": [
                {"wrong": "I have appointment", "correct": "I have an appointment", "explanation": "Use article 'an' before vowel sounds"},
                {"wrong": "The doctor give me prescription", "correct": "The doctor gave me a prescription", "explanation": "Use past tense and article"},
                {"wrong": "I am waiting since 2 hours", "correct": "I have been waiting for 2 hours", "explanation": "Use present perfect continuous for duration"},
                {"wrong": "My healthy is not good", "correct": "My health is not good", "explanation": "'Health' is the noun, 'healthy' is adjective"}
            ],
            "supports_tasks": ["GT_Writing_Task1_Letter", "GT_Reading_Notice", "GT_Reading_Form"],
            "writing_task": {
                "title": "Complaint to Health Centre",
                "prompt": "You recently visited a health centre and were unhappy with the service. Write a letter to the manager. In your letter:\n- describe your visit and what happened\n- explain why you are unhappy\n- say what action you would like them to take",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about my visit to your health centre on 15th March.\n\nI had an appointment at 10am but I had to wait for two hours. The reception staff were not helpful and did not explain the delay. When I finally saw the doctor, the consultation was very short.\n\nI am unhappy because I took time off work for this appointment. Also, I did not get enough time to discuss my problems with the doctor.\n\nI would like an apology and a new appointment with more time.\n\nYours faithfully,\nJohn Smith",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my deep dissatisfaction with the level of service I received during my visit to your health centre on 15th March.\n\nDespite having a confirmed appointment for 10am, I was not seen until nearly midday. When I enquired about the delay at reception, the staff appeared dismissive and offered no explanation whatsoever. Furthermore, the subsequent consultation with Dr. Patel lasted barely five minutes, during which I felt rushed and unable to adequately describe my symptoms.\n\nAs someone who had to take unpaid leave to attend this appointment, I find this standard of care wholly unacceptable. The lack of communication regarding the delay, coupled with the cursory consultation, has left me feeling that my time and health concerns were not valued.\n\nI would appreciate a written apology and, more importantly, a full consultation with sufficient time to properly address my medical concerns.\n\nYours faithfully,\nJohn Smith"
                }
            },
            "reading_task": {
                "title": "Clinic Information Notice",
                "type": "Notice",
                "content": "RIVERSIDE MEDICAL CENTRE\n\nPatient Information\n\nOpening Hours:\nMonday - Friday: 8:00 AM - 6:30 PM\nSaturday: 9:00 AM - 12:00 PM\nSunday & Bank Holidays: Closed\n\nAppointments:\n- Routine appointments: Book online or call 0845 123 4567\n- Same-day urgent appointments: Call from 8:00 AM\n- Home visits: Available for housebound patients only\n\nPrescriptions:\n- Allow 48 hours for repeat prescriptions\n- Collect from reception or nominated pharmacy\n- Electronic prescriptions available\n\nTest Results:\n- Call after 2:00 PM\n- Results will only be given to the patient\n- Some results may require a follow-up appointment\n\nOut of Hours:\nFor medical emergencies: Call 999\nFor urgent non-emergency: Call NHS 111\n\nPlease arrive 10 minutes before your appointment.\nIf you cannot attend, please cancel at least 24 hours in advance.",
                "questions": [
                    {"q": "When is the centre open on Saturday?", "a": "9:00 AM - 12:00 PM", "skill": "locating specific info"},
                    {"q": "How long does a repeat prescription take?", "a": "48 hours", "skill": "locating specific info"},
                    {"q": "What time should you call for test results?", "a": "After 2:00 PM", "skill": "understanding instructions"},
                    {"q": "Who qualifies for home visits?", "a": "Housebound patients only", "skill": "identifying conditions"},
                    {"q": "How much notice should you give to cancel?", "a": "At least 24 hours", "skill": "understanding requirements"}
                ]
            }
        },
        "work": {
            "lesson_id": "G_WORK_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Work",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to employment, write professional letters about jobs and workplace issues, and understand job adverts and company policies.",
            "key_vocabulary": [
                {"word": "application", "meaning": "Formal job request", "typical_use": "Please submit your application by Friday."},
                {"word": "vacancy", "meaning": "Available job position", "typical_use": "There is a vacancy in the sales team."},
                {"word": "salary", "meaning": "Regular payment for work", "typical_use": "The salary is £35,000 per year."},
                {"word": "benefits", "meaning": "Extra work advantages", "typical_use": "Benefits include health insurance."},
                {"word": "contract", "meaning": "Work agreement document", "typical_use": "Please sign the contract."},
                {"word": "probation", "meaning": "Trial work period", "typical_use": "There is a 3-month probation period."},
                {"word": "promotion", "meaning": "Moving to higher position", "typical_use": "She got a promotion to manager."},
                {"word": "resignation", "meaning": "Leaving a job formally", "typical_use": "I am writing to submit my resignation."},
                {"word": "notice period", "meaning": "Time before leaving job", "typical_use": "The notice period is one month."},
                {"word": "reference", "meaning": "Job recommendation letter", "typical_use": "Could you provide a reference?"},
                {"word": "interview", "meaning": "Job meeting/discussion", "typical_use": "I have an interview next week."},
                {"word": "qualifications", "meaning": "Skills and certificates", "typical_use": "What qualifications do you have?"},
                {"word": "overtime", "meaning": "Extra work hours", "typical_use": "Overtime is paid at 1.5x rate."},
                {"word": "shift", "meaning": "Work time period", "typical_use": "I work the night shift."},
                {"word": "redundancy", "meaning": "Job loss due to cuts", "typical_use": "Staff face redundancy."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to apply for the position of...",
                    "I would be grateful if you could consider my application...",
                    "Could you please confirm the details of...?"
                ],
                "complaints": [
                    "I am writing to raise a concern about...",
                    "I wish to formally report...",
                    "I feel I must bring to your attention..."
                ],
                "explanations": [
                    "I am writing to inform you that...",
                    "Please be advised that...",
                    "Further to our conversation..."
                ],
                "closing": [
                    "I am available for interview at your convenience.",
                    "Please do not hesitate to contact me.",
                    "I look forward to the opportunity to discuss this further."
                ]
            },
            "example_sentences": [
                "I am writing to apply for the position of Marketing Assistant advertised on your website.",
                "I would be grateful if you could consider me for any future vacancies in your company.",
                "I wish to formally report an issue with workplace safety equipment.",
                "Please be advised that I am submitting my resignation, effective from 1st April.",
                "I am available for interview at your convenience and can start immediately."
            ],
            "common_mistakes": [
                {"wrong": "I am interesting in this job", "correct": "I am interested in this job", "explanation": "Use -ed for feelings"},
                {"wrong": "I have 5 years experiences", "correct": "I have 5 years' experience", "explanation": "'Experience' is uncountable in this context"},
                {"wrong": "Please find my CV attached below", "correct": "Please find my CV attached", "explanation": "CV is attached to email, not below"},
                {"wrong": "I am looking forward to hear from you", "correct": "I am looking forward to hearing from you", "explanation": "Use -ing after 'to' in this phrase"}
            ],
            "supports_tasks": ["GT_Writing_Task1_Letter", "GT_Reading_Notice", "GT_Reading_Form"],
            "writing_task": {
                "title": "Job Application Letter",
                "prompt": "You saw an advertisement for a job that you are interested in. Write a letter to the company. In your letter:\n- explain which job you are applying for and where you saw it\n- describe your relevant experience and skills\n- say when you are available for interview",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to apply for the job of receptionist which I saw on the Indeed website yesterday.\n\nI have worked as a receptionist for two years at a hotel. I have good communication skills and I can use computers well. I speak English and Spanish fluently.\n\nI am available for interview any day next week. I can start work immediately.\n\nPlease find my CV attached. I look forward to hearing from you.\n\nYours faithfully,\nCarlos Martinez",
                    "band_8": "Dear Hiring Manager,\n\nI am writing to express my keen interest in the Receptionist position advertised on Indeed on 15th March. I believe my professional background and interpersonal skills make me an excellent candidate for this role.\n\nOver the past two years, I have been working as a Front Desk Receptionist at the Grand Plaza Hotel, where I have developed strong expertise in customer service, appointment scheduling, and administrative duties. I am proficient in Microsoft Office and various booking systems, and I am fluent in both English and Spanish, which has proven invaluable when assisting international guests.\n\nI would welcome the opportunity to discuss how my skills could benefit your organisation. I am available for interview throughout next week and could commence employment with two weeks' notice to my current employer.\n\nPlease find my CV attached for your consideration. I look forward to hearing from you at your earliest convenience.\n\nYours faithfully,\nCarlos Martinez"
                }
            },
            "reading_task": {
                "title": "Job Advertisement",
                "type": "Job Advert",
                "content": "CUSTOMER SERVICE REPRESENTATIVE\nBrightStar Communications\n\nLocation: Manchester City Centre\nSalary: £24,000 - £28,000 (depending on experience)\nContract: Full-time, Permanent\n\nAbout the Role:\nWe are seeking a motivated Customer Service Representative to join our growing team. You will be the first point of contact for our customers, handling enquiries via phone, email, and live chat.\n\nRequirements:\n- Minimum 1 year customer service experience\n- Excellent communication skills\n- Proficient in MS Office\n- Ability to work shifts (including some weekends)\n\nDesirable:\n- Experience in telecommunications\n- Additional languages\n\nBenefits:\n- 25 days annual leave + bank holidays\n- Company pension scheme\n- Staff discount on products\n- Free parking\n\nHow to Apply:\nSend CV and cover letter to careers@brightstar.co.uk\nClosing date: 30th April 2024\n\nBrightStar is an equal opportunities employer.",
                "questions": [
                    {"q": "What is the minimum salary offered?", "a": "£24,000", "skill": "locating specific info"},
                    {"q": "How much customer service experience is required?", "a": "Minimum 1 year", "skill": "identifying requirements"},
                    {"q": "Are weekend shifts required?", "a": "Yes, some weekends", "skill": "understanding conditions"},
                    {"q": "What should you include with your CV?", "a": "Cover letter", "skill": "understanding instructions"},
                    {"q": "How many days of annual leave are offered?", "a": "25 days + bank holidays", "skill": "locating benefits"}
                ]
            }
        },
        "travel": {
            "lesson_id": "G_TRAVEL_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Travel",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to travel and tourism, write letters about bookings and complaints, and understand travel notices and booking information.",
            "key_vocabulary": [
                {"word": "reservation", "meaning": "Advance booking", "typical_use": "I have a reservation for two nights."},
                {"word": "accommodation", "meaning": "Place to stay", "typical_use": "The accommodation was excellent."},
                {"word": "itinerary", "meaning": "Travel plan/schedule", "typical_use": "Please find the itinerary attached."},
                {"word": "departure", "meaning": "Leaving time/place", "typical_use": "Departure is at 6am."},
                {"word": "arrival", "meaning": "Coming time/place", "typical_use": "Arrival time is 10pm."},
                {"word": "cancellation", "meaning": "Stopping a booking", "typical_use": "What is the cancellation policy?"},
                {"word": "refund", "meaning": "Money returned", "typical_use": "I would like to request a refund."},
                {"word": "transfer", "meaning": "Transport between places", "typical_use": "Airport transfer is included."},
                {"word": "amenities", "meaning": "Hotel facilities", "typical_use": "Amenities include a pool and gym."},
                {"word": "excursion", "meaning": "Organized trip", "typical_use": "The excursion to the castle was fantastic."},
                {"word": "delay", "meaning": "Late timing", "typical_use": "There was a 2-hour delay."},
                {"word": "compensation", "meaning": "Payment for problems", "typical_use": "I expect compensation for the inconvenience."},
                {"word": "brochure", "meaning": "Information booklet", "typical_use": "Please send me your brochure."},
                {"word": "all-inclusive", "meaning": "Everything included in price", "typical_use": "We booked an all-inclusive resort."},
                {"word": "check-in/out", "meaning": "Arriving/leaving hotel", "typical_use": "Check-in is from 2pm."}
            ],
            "functional_phrases": {
                "requests": [
                    "I would like to book...",
                    "Could you please confirm my reservation for...?",
                    "I am writing to enquire about availability..."
                ],
                "complaints": [
                    "I am writing to express my disappointment with...",
                    "The service/accommodation did not meet expectations...",
                    "I am seeking compensation for..."
                ],
                "explanations": [
                    "Unfortunately, due to..., I need to cancel...",
                    "The problem arose when...",
                    "I was assured that... however..."
                ],
                "closing": [
                    "I would appreciate a response within 14 days.",
                    "Please confirm the booking at your earliest convenience.",
                    "I trust you will resolve this matter promptly."
                ]
            },
            "example_sentences": [
                "I would like to book a double room for three nights from 15th to 18th July.",
                "Could you please confirm whether airport transfer is included in the package?",
                "I am writing to express my disappointment with the accommodation during my recent stay.",
                "The room did not match the description in your brochure – it was much smaller.",
                "I am seeking compensation for the inconvenience caused by the flight delay."
            ],
            "common_mistakes": [
                {"wrong": "I want book a room", "correct": "I would like to book a room", "explanation": "Use polite form for requests"},
                {"wrong": "The hotel have a pool", "correct": "The hotel has a pool", "explanation": "Use 'has' for singular subjects"},
                {"wrong": "I am arrived yesterday", "correct": "I arrived yesterday", "explanation": "'Arrive' doesn't use 'be' auxiliary"},
                {"wrong": "Please confirm me the booking", "correct": "Please confirm the booking with me", "explanation": "Different preposition structure"}
            ],
            "supports_tasks": ["GT_Writing_Task1_Letter", "GT_Reading_Notice", "GT_Reading_Brochure"],
            "writing_task": {
                "title": "Hotel Complaint Letter",
                "prompt": "You recently stayed at a hotel and were not satisfied. Write a letter to the hotel manager. In your letter:\n- give details of your booking and when you stayed\n- describe the problems you experienced\n- explain what you expect the hotel to do",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about my stay at your hotel from 5th to 8th March. My booking reference was HT12345.\n\nThere were several problems. First, the room was not clean when we arrived. Second, the air conditioning did not work. Third, the breakfast was cold both mornings.\n\nI expect you to give me a partial refund for the problems. The room cost £120 per night and the service was not acceptable.\n\nI look forward to hearing from you soon.\n\nYours faithfully,\nSarah Jones",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my considerable disappointment with my recent stay at the Grandview Hotel from 5th to 8th March (booking reference: HT12345).\n\nRegrettably, the experience fell far short of the standards advertised. Upon arrival, we discovered the room had not been properly cleaned, with used towels still in the bathroom. Despite reporting this to reception, it took over three hours for housekeeping to address the issue. Furthermore, the air conditioning unit was malfunctioning throughout our stay, making the room uncomfortably warm. To compound matters, the breakfast buffet – a key selling point mentioned in your brochure – served lukewarm food on both mornings.\n\nGiven that we paid £120 per night, I believe these issues warrant compensation. I would expect, at minimum, a partial refund equivalent to one night's stay, along with a written assurance that these maintenance issues will be rectified.\n\nI trust you will treat this matter with the urgency it deserves and respond within 14 days.\n\nYours faithfully,\nSarah Jones"
                }
            },
            "reading_task": {
                "title": "Hotel Booking Confirmation",
                "type": "Email/Confirmation",
                "content": "Subject: Booking Confirmation - Grand Plaza Hotel\n\nDear Mr Thompson,\n\nThank you for your reservation. Please find your booking details below:\n\nBooking Reference: GP-78542\nGuest Name: James Thompson\nRoom Type: Deluxe Double with Sea View\nCheck-in: Saturday, 15th June 2024 (from 3:00 PM)\nCheck-out: Tuesday, 18th June 2024 (by 11:00 AM)\nNumber of Nights: 3\n\nRoom Rate: £145 per night\nTotal: £435 (breakfast included)\n\nYour reservation includes:\n✓ Daily buffet breakfast (7:00-10:00 AM)\n✓ Free WiFi\n✓ Access to gym and pool\n✓ Free parking\n\nPayment: A deposit of £145 has been charged to your card ending 4521.\nBalance due: £290 (payable at check-out)\n\nCancellation Policy:\n- Free cancellation up to 48 hours before check-in\n- Within 48 hours: First night charged\n- No-show: Full amount charged\n\nNeed to modify your booking? Call +44 1234 567890 or reply to this email.\n\nWe look forward to welcoming you!\n\nBest regards,\nReservations Team\nGrand Plaza Hotel",
                "questions": [
                    {"q": "What time can Mr Thompson check in?", "a": "From 3:00 PM", "skill": "locating specific info"},
                    {"q": "How much has already been paid?", "a": "£145 (deposit)", "skill": "understanding payment"},
                    {"q": "What happens if he cancels 24 hours before arrival?", "a": "First night charged", "skill": "understanding policy"},
                    {"q": "What time does breakfast finish?", "a": "10:00 AM", "skill": "locating specific info"},
                    {"q": "What is NOT included in the rate?", "a": "Balance of £290 (due at check-out)", "skill": "identifying what's excluded"}
                ]
            }
        },
        "housing": {
            "lesson_id": "G_HOUSING_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Housing",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to housing and accommodation, write letters to landlords and neighbours, and understand rental agreements and building notices.",
            "key_vocabulary": [
                {"word": "tenant", "meaning": "Person who rents property", "typical_use": "The tenant must pay rent monthly."},
                {"word": "landlord", "meaning": "Property owner who rents", "typical_use": "Contact the landlord for repairs."},
                {"word": "lease/tenancy", "meaning": "Rental agreement", "typical_use": "The lease is for 12 months."},
                {"word": "deposit", "meaning": "Security money paid", "typical_use": "The deposit is one month's rent."},
                {"word": "utilities", "meaning": "Gas, electricity, water", "typical_use": "Utilities are not included in rent."},
                {"word": "maintenance", "meaning": "Repairs and upkeep", "typical_use": "Maintenance is the landlord's responsibility."},
                {"word": "furnished", "meaning": "With furniture included", "typical_use": "The flat is fully furnished."},
                {"word": "unfurnished", "meaning": "Without furniture", "typical_use": "We prefer an unfurnished property."},
                {"word": "notice", "meaning": "Warning of leaving", "typical_use": "Give one month's notice to leave."},
                {"word": "eviction", "meaning": "Forced removal", "typical_use": "Eviction is a last resort."},
                {"word": "inventory", "meaning": "List of items in property", "typical_use": "Sign the inventory at check-in."},
                {"word": "letting agent", "meaning": "Rental agency", "typical_use": "Contact the letting agent for viewings."},
                {"word": "neighbour", "meaning": "Person living nearby", "typical_use": "My neighbour is very friendly."},
                {"word": "communal areas", "meaning": "Shared spaces", "typical_use": "Keep communal areas clean."},
                {"word": "renovation", "meaning": "Major repairs/updates", "typical_use": "The building is under renovation."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to request that you...",
                    "I would appreciate it if you could...",
                    "Could you please arrange for..."
                ],
                "complaints": [
                    "I am writing to bring to your attention...",
                    "I must ask you to address the issue of...",
                    "Despite my previous requests, the problem of... continues"
                ],
                "explanations": [
                    "The problem first arose when...",
                    "This has been ongoing since...",
                    "As stated in my tenancy agreement..."
                ],
                "closing": [
                    "I would appreciate a prompt response.",
                    "Please arrange for repairs within 7 days.",
                    "I hope we can resolve this matter amicably."
                ]
            },
            "example_sentences": [
                "I am writing to request urgent repairs to the heating system in my apartment.",
                "Despite my previous requests, the leak in the bathroom has not been fixed.",
                "Could you please arrange for a plumber to visit at your earliest convenience?",
                "As stated in my tenancy agreement, maintenance is the landlord's responsibility.",
                "I would appreciate it if you could reduce the noise levels after 10pm."
            ],
            "common_mistakes": [
                {"wrong": "My flat has a problem with the heat", "correct": "My flat has a problem with the heating", "explanation": "'Heating' for the system, 'heat' for temperature"},
                {"wrong": "I am living here since 2020", "correct": "I have been living here since 2020", "explanation": "Use present perfect continuous with 'since'"},
                {"wrong": "Please repair it fastly", "correct": "Please repair it quickly/as soon as possible", "explanation": "'Fastly' is not a word"},
                {"wrong": "The rent is too much expensive", "correct": "The rent is too expensive", "explanation": "Don't use 'much' with adjectives"}
            ],
            "supports_tasks": ["GT_Writing_Task1_Letter", "GT_Reading_Notice", "GT_Reading_Contract"],
            "writing_task": {
                "title": "Letter to Landlord",
                "prompt": "There is a problem with the property you are renting. Write a letter to your landlord. In your letter:\n- describe the problem\n- explain how it is affecting you\n- say what action you would like the landlord to take",
                "model_answer": {
                    "band_6": "Dear Mr Johnson,\n\nI am writing to tell you about a problem in my flat at 24 Oak Street.\n\nThe heating system is not working properly. The radiators are cold and the flat is very uncomfortable, especially at night. I have tried to fix it myself but I cannot.\n\nThis problem is affecting my health because the flat is too cold. I cannot sleep well and I have caught a cold.\n\nPlease send someone to fix the heating as soon as possible. I am free most afternoons this week.\n\nYours sincerely,\nMaria Garcia",
                    "band_8": "Dear Mr Johnson,\n\nI am writing to bring to your attention an urgent issue with the central heating system at 24 Oak Street, Flat 3B, which I have been renting since September.\n\nOver the past week, the radiators throughout the apartment have been failing to heat up adequately, despite the thermostat being set correctly. As a result, the indoor temperature has dropped to an uncomfortable level, particularly during the evening hours. I have attempted to bleed the radiators myself, but this has not resolved the issue.\n\nThis situation is significantly affecting my quality of life. Not only am I unable to feel comfortable in my own home, but I have also developed a persistent cold which I attribute to the low temperatures. Additionally, I am concerned about potential damp issues that may arise from the lack of heating.\n\nI would greatly appreciate it if you could arrange for a qualified heating engineer to inspect and repair the system as a matter of urgency. I am available on weekday afternoons and can adjust my schedule to accommodate a visit.\n\nI trust this matter will be resolved promptly, as heating is an essential service covered under our tenancy agreement.\n\nYours sincerely,\nMaria Garcia"
                }
            },
            "reading_task": {
                "title": "Building Notice",
                "type": "Notice",
                "content": "NOTICE TO ALL RESIDENTS\nMaple Court Apartments\n\nImportant: Planned Maintenance Work\n\nDear Residents,\n\nPlease be advised that essential maintenance work will be carried out in the building during the following period:\n\nDates: Monday 18th - Friday 22nd March\nHours: 9:00 AM - 5:00 PM daily\n\nWork includes:\n- External window cleaning (all floors)\n- Fire alarm system testing (Tuesday only, 10:00-11:00 AM)\n- Lift maintenance (Wednesday - lift out of service 2:00-4:00 PM)\n- Car park resurfacing (Thursday-Friday - no parking available)\n\nImportant Notes:\n- Please keep windows closed during external cleaning\n- The fire alarm test is routine - no evacuation required\n- Alternative parking is available at the public car park on Bridge Street (free for residents with permit - collect from office)\n\nWe apologise for any inconvenience. For queries, contact the Building Manager:\nTel: 0800 123 456 | Email: manager@maplecourt.co.uk\n\nMaple Court Management",
                "questions": [
                    {"q": "How many days will the maintenance last?", "a": "5 days (Monday to Friday)", "skill": "calculating duration"},
                    {"q": "When will the lift be out of service?", "a": "Wednesday 2:00-4:00 PM", "skill": "locating specific info"},
                    {"q": "What should residents do during window cleaning?", "a": "Keep windows closed", "skill": "understanding instructions"},
                    {"q": "Where can residents park on Thursday?", "a": "Public car park on Bridge Street", "skill": "finding alternatives"},
                    {"q": "Do residents need to evacuate during the fire alarm test?", "a": "No, no evacuation required", "skill": "understanding procedures"}
                ]
            }
        }
    }
    
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
