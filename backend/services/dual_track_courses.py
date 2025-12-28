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
        },
        {
            "id": "gt-beginner-6",
            "lesson_number": 106,
            "track": "general",
            "topic": "Reading Emails & Messages",
            "title": "Understanding Personal & Work Emails",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Understand informal email language",
                "Identify the purpose of an email",
                "Extract key information from messages"
            ],
            "reading": {
                "title": "Reading Emails & Messages",
                "text_types": [
                    "Personal emails from friends",
                    "Work emails from colleagues",
                    "Appointment confirmations",
                    "Online order confirmations"
                ],
                "practice_text": {
                    "type": "email",
                    "content": "From: sarah.jones@email.com\nTo: mike.brown@email.com\nSubject: Birthday Party - Saturday!\n\nHi Mike,\n\nJust a quick reminder about Emma's birthday party this Saturday.\n\nTime: 3pm - 7pm\nPlace: The Garden Café, 15 Park Road\nDress code: Casual\n\nWe're doing a surprise cake at 5pm, so please try to arrive before then! Parking is available behind the café.\n\nLet me know if you can make it!\n\nBest,\nSarah\n\nP.S. Emma thinks we're just having coffee, so don't say anything!"
                },
                "questions": [
                    {"question": "What time is the party?", "answer": "3pm - 7pm"},
                    {"question": "Why should Mike arrive before 5pm?", "answer": "Because they're doing a surprise cake at 5pm"},
                    {"question": "What doesn't Emma know?", "answer": "That it's a surprise party (she thinks they're just having coffee)"},
                    {"question": "Where can guests park?", "answer": "Behind the café"}
                ]
            },
            "tips": [
                "Read the subject line first - it tells you what the email is about",
                "Look at who sent the email and to whom",
                "Pay attention to dates, times, and locations",
                "P.S. (postscript) often contains important extra information"
            ]
        },
        {
            "id": "gt-beginner-7",
            "lesson_number": 107,
            "track": "general",
            "topic": "Reading Instructions",
            "title": "Following Simple Instructions",
            "level": "beginner",
            "band_target": "4.0-5.0",
            "learning_goals": [
                "Follow step-by-step instructions",
                "Understand warning and safety notices",
                "Read product instructions"
            ],
            "reading": {
                "title": "Reading Instructions & Directions",
                "text_types": [
                    "Product instructions",
                    "Recipe directions",
                    "Assembly instructions",
                    "Safety warnings"
                ],
                "practice_text": {
                    "type": "instructions",
                    "content": "MICROWAVE RICE - COOKING INSTRUCTIONS\n\n1. Remove plastic lid and peel back film corner 2cm.\n2. Place pouch in microwave.\n3. Heat on HIGH for 2 minutes.\n4. Let stand for 1 minute.\n5. Peel back film completely and fluff rice with a fork.\n6. Serve immediately.\n\n⚠️ CAUTION: Contents will be hot. Take care when opening.\n\n📝 TIP: For best results, add a splash of water before heating.\n\nStorage: Keep in a cool, dry place. Once opened, consume immediately.\nBest before: See date on pack."
                },
                "questions": [
                    {"question": "How long should you heat the rice?", "answer": "2 minutes"},
                    {"question": "What should you do before putting the pouch in the microwave?", "answer": "Remove plastic lid and peel back film corner 2cm"},
                    {"question": "Why should you be careful when opening?", "answer": "Because the contents will be hot"},
                    {"question": "What tip is given for better results?", "answer": "Add a splash of water before heating"}
                ]
            },
            "tips": [
                "Instructions usually need to be followed in order",
                "Warning symbols (⚠️) indicate important safety information",
                "Look for numbered steps - they tell you the sequence",
                "Tips are helpful suggestions, not required steps"
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
        },
        "technology": {
            "lesson_id": "G_TECHNOLOGY_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Technology",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to technology, write letters about technical issues and products, and understand user guides and warranty information.",
            "key_vocabulary": [
                {"word": "device", "meaning": "Electronic equipment", "typical_use": "Please restart your device."},
                {"word": "warranty", "meaning": "Guarantee for repairs", "typical_use": "The warranty covers 2 years."},
                {"word": "malfunction", "meaning": "Not working properly", "typical_use": "The device has a malfunction."},
                {"word": "upgrade", "meaning": "Improve to newer version", "typical_use": "I need to upgrade my software."},
                {"word": "compatible", "meaning": "Works together with", "typical_use": "Is this compatible with my phone?"},
                {"word": "install", "meaning": "Set up software/hardware", "typical_use": "Please install the latest update."},
                {"word": "settings", "meaning": "Configuration options", "typical_use": "Check your privacy settings."},
                {"word": "troubleshoot", "meaning": "Find and fix problems", "typical_use": "Let's troubleshoot the issue."},
                {"word": "backup", "meaning": "Copy of data for safety", "typical_use": "Always keep a backup of files."},
                {"word": "refund", "meaning": "Money returned", "typical_use": "I would like a full refund."},
                {"word": "technical support", "meaning": "Help with tech problems", "typical_use": "Contact technical support."},
                {"word": "defective", "meaning": "Has a fault/broken", "typical_use": "The product is defective."},
                {"word": "replacement", "meaning": "New item instead", "typical_use": "I request a replacement."},
                {"word": "receipt", "meaning": "Proof of purchase", "typical_use": "Please keep your receipt."},
                {"word": "specification", "meaning": "Technical details", "typical_use": "Check the specifications."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to request a refund for...",
                    "I would like to enquire about technical support for...",
                    "Could you please arrange for a replacement..."
                ],
                "complaints": [
                    "I am writing to complain about a faulty product...",
                    "Despite following the instructions, the device...",
                    "I purchased this item on... and it has stopped working"
                ],
                "explanations": [
                    "The problem first occurred when...",
                    "I have tried troubleshooting by...",
                    "According to the warranty terms..."
                ]
            },
            "common_mistakes": [
                {"wrong": "The computer doesn't work since yesterday", "correct": "The computer hasn't worked since yesterday", "explanation": "Use present perfect with 'since'"},
                {"wrong": "I bought it before 2 months", "correct": "I bought it 2 months ago", "explanation": "Use 'ago' for past time, not 'before'"},
                {"wrong": "Please fix it fastly", "correct": "Please fix it quickly", "explanation": "'Fastly' is not a word"}
            ],
            "writing_task": {
                "title": "Product Complaint Letter",
                "prompt": "You recently bought a new laptop but it has developed a problem. Write a letter to the company. In your letter:\n- describe the problem\n- explain what you have done to try to fix it\n- say what action you want them to take",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about a laptop I bought from your store last month.\n\nThe laptop screen keeps flickering and sometimes goes black. This happens several times a day and makes it impossible to work.\n\nI have tried updating the software and restarting the laptop many times but the problem continues.\n\nI would like a full refund or a replacement laptop. Please contact me to arrange this.\n\nYours faithfully,\nJohn Smith",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my dissatisfaction with a TechPro X500 laptop (Order #LP78923) that I purchased from your Oxford Street branch on 15th February.\n\nWithin two weeks of purchase, the screen began flickering intermittently, and this issue has progressively worsened. The display now goes completely black several times per hour, rendering the device virtually unusable for work purposes.\n\nI have attempted to resolve this issue by updating all drivers to the latest versions, performing a complete system restore, and adjusting the display settings as suggested in your online troubleshooting guide. Unfortunately, none of these measures have had any effect.\n\nGiven that the laptop is still within the warranty period and appears to have a manufacturing defect, I would appreciate either a full refund or a replacement unit of equivalent specification. I have attached copies of my receipt and warranty documentation for your reference.\n\nI look forward to your prompt response.\n\nYours faithfully,\nJohn Smith"
                }
            },
            "reading_task": {
                "title": "Product Warranty Card",
                "type": "Notice/Instructions",
                "content": "WARRANTY INFORMATION\nTechPro Electronics\n\nYour TechPro product is covered by our comprehensive warranty:\n\nCoverage Period: 24 months from date of purchase\n\nWhat's Covered:\n- Manufacturing defects\n- Hardware malfunctions\n- Battery issues (first 12 months only)\n\nNot Covered:\n- Accidental damage\n- Water damage\n- Unauthorized repairs\n- Software issues\n\nTo Make a Claim:\n1. Keep your original receipt\n2. Contact support within 30 days of discovering the fault\n3. Provide product serial number\n\nContact: support@techpro.com | 0800 555 789\nOnline: www.techpro.com/warranty",
                "questions": [
                    {"q": "How long is the full warranty period?", "a": "24 months", "skill": "locating specific info"},
                    {"q": "Is battery covered for the full warranty period?", "a": "No, only first 12 months", "skill": "understanding limitations"},
                    {"q": "What must you keep to make a claim?", "a": "Original receipt", "skill": "identifying requirements"}
                ]
            }
        },
        "environment": {
            "lesson_id": "G_ENVIRONMENT_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Environment",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to environmental issues, write letters about local environmental concerns, and understand recycling guides and community notices.",
            "key_vocabulary": [
                {"word": "recycling", "meaning": "Processing waste for reuse", "typical_use": "Put bottles in the recycling bin."},
                {"word": "pollution", "meaning": "Contamination of environment", "typical_use": "Air pollution is a serious problem."},
                {"word": "waste", "meaning": "Unwanted materials/rubbish", "typical_use": "Reduce household waste."},
                {"word": "sustainable", "meaning": "Can continue long-term", "typical_use": "We need sustainable solutions."},
                {"word": "conservation", "meaning": "Protecting nature", "typical_use": "Wildlife conservation is important."},
                {"word": "carbon footprint", "meaning": "CO2 emissions caused", "typical_use": "Reduce your carbon footprint."},
                {"word": "renewable", "meaning": "Can be replaced naturally", "typical_use": "Solar is renewable energy."},
                {"word": "disposal", "meaning": "Getting rid of waste", "typical_use": "Proper disposal of batteries."},
                {"word": "compost", "meaning": "Organic waste for gardens", "typical_use": "Food scraps go in compost."},
                {"word": "biodegradable", "meaning": "Breaks down naturally", "typical_use": "Use biodegradable bags."},
                {"word": "emissions", "meaning": "Gases released", "typical_use": "Vehicle emissions cause smog."},
                {"word": "litter", "meaning": "Rubbish in public places", "typical_use": "Don't drop litter."},
                {"word": "initiative", "meaning": "New plan or project", "typical_use": "The council's green initiative."},
                {"word": "volunteer", "meaning": "Work without pay", "typical_use": "Volunteer for beach cleanup."},
                {"word": "awareness", "meaning": "Knowledge about issue", "typical_use": "Raise environmental awareness."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to request more recycling facilities...",
                    "I would like to suggest improvements to...",
                    "Could the council please consider..."
                ],
                "complaints": [
                    "I am writing to express concern about...",
                    "I have noticed an increase in litter near...",
                    "The current situation regarding... is unacceptable"
                ],
                "explanations": [
                    "This issue affects residents because...",
                    "If action is not taken, the problem will...",
                    "Many local people have expressed concern about..."
                ]
            },
            "common_mistakes": [
                {"wrong": "The environment is in danger since many years", "correct": "The environment has been in danger for many years", "explanation": "Use 'for' with duration, present perfect for ongoing situations"},
                {"wrong": "We must to recycle more", "correct": "We must recycle more", "explanation": "Modal verbs are followed by base form without 'to'"},
                {"wrong": "This is a very important problem", "correct": "This is a serious problem / This is very important", "explanation": "Avoid 'very important problem' - use 'serious' or split"}
            ],
            "writing_task": {
                "title": "Letter to Local Council",
                "prompt": "You are concerned about an environmental problem in your local area. Write a letter to your local council. In your letter:\n- describe the problem\n- explain how it affects the community\n- suggest what the council could do",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing about the litter problem in Riverside Park in our town.\n\nThere is a lot of rubbish in the park, especially near the playground. I see plastic bottles, food wrappers and cigarette ends every day. It looks very bad and is unhealthy.\n\nThis problem affects families who use the park. Children play near the rubbish and it is dangerous. Also, tourists visit our town and this gives a bad impression.\n\nI think the council should put more bins in the park and clean it more often. Signs asking people not to litter would also help.\n\nYours faithfully,\nAnna Wilson",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my growing concern about the deteriorating state of Riverside Park, which has become increasingly littered over recent months.\n\nDuring my regular visits to the park, I have observed a significant accumulation of waste, particularly around the children's playground and picnic areas. The rubbish includes plastic packaging, discarded food containers, and cigarette ends. Despite there being bins available, they appear to be inadequate for the number of visitors the park attracts, especially during weekends.\n\nThis situation adversely affects our community in several ways. Families are reluctant to let their children play in areas strewn with potentially hazardous waste. Furthermore, as Riverside Park is a key attraction for tourists, the current state reflects poorly on our town's image and may impact local businesses that depend on tourism.\n\nI would respectfully suggest that the council consider installing additional waste bins at strategic locations, increasing the frequency of cleaning services, and perhaps launching an awareness campaign encouraging visitors to dispose of their rubbish responsibly.\n\nI trust you will give this matter your urgent attention.\n\nYours faithfully,\nAnna Wilson"
                }
            },
            "reading_task": {
                "title": "Community Recycling Guide",
                "type": "Information Leaflet",
                "content": "RECYCLING IN YOUR AREA\nGreen Street Council\n\nCollection Days:\n- Green bin (recycling): Mondays\n- Black bin (general waste): Thursdays\n- Brown bin (garden waste): First Wednesday of month (April-October only)\n\nWhat Goes in Your GREEN BIN:\n✓ Paper and cardboard (flattened)\n✓ Plastic bottles and containers\n✓ Glass bottles and jars (rinsed)\n✓ Metal cans and tins\n\nNOT in Green Bin:\n✗ Food waste\n✗ Plastic bags\n✗ Textiles\n✗ Electrical items\n\nSpecial Items:\nBatteries: Drop-off at library or supermarket\nClothing: Charity donation banks at car park\nElectronics: Book collection at www.greenstreet.gov/bulky\n\nMissed collection? Report within 48 hours: 01onal 234 5678",
                "questions": [
                    {"q": "What day is recycling collected?", "a": "Mondays", "skill": "locating specific info"},
                    {"q": "Can you put plastic bags in the green bin?", "a": "No", "skill": "understanding rules"},
                    {"q": "Where can you take old batteries?", "a": "Library or supermarket", "skill": "finding alternatives"}
                ]
            }
        },
        "family": {
            "lesson_id": "G_FAMILY_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Family and Society",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to family and social relationships, write personal letters to friends and family, and understand invitations and announcements.",
            "key_vocabulary": [
                {"word": "relative", "meaning": "Family member", "typical_use": "My relatives live abroad."},
                {"word": "sibling", "meaning": "Brother or sister", "typical_use": "I have two siblings."},
                {"word": "generation", "meaning": "Age group in family", "typical_use": "Three generations live together."},
                {"word": "occasion", "meaning": "Special event/time", "typical_use": "It's a special occasion."},
                {"word": "celebration", "meaning": "Party or festivity", "typical_use": "A birthday celebration."},
                {"word": "reunion", "meaning": "Getting together again", "typical_use": "A family reunion."},
                {"word": "upbringing", "meaning": "How child is raised", "typical_use": "A strict upbringing."},
                {"word": "ceremony", "meaning": "Formal event/ritual", "typical_use": "A wedding ceremony."},
                {"word": "milestone", "meaning": "Important life event", "typical_use": "Graduation is a milestone."},
                {"word": "anniversary", "meaning": "Yearly remembrance", "typical_use": "Their wedding anniversary."},
                {"word": "gathering", "meaning": "Group coming together", "typical_use": "A family gathering."},
                {"word": "hospitality", "meaning": "Friendly welcome", "typical_use": "Thank you for your hospitality."},
                {"word": "invitation", "meaning": "Request to attend", "typical_use": "Accept the invitation."},
                {"word": "congratulations", "meaning": "Expressing happiness for success", "typical_use": "Congratulations on your promotion!"},
                {"word": "grateful", "meaning": "Thankful", "typical_use": "I am very grateful for your help."}
            ],
            "functional_phrases": {
                "requests": [
                    "I was wondering if you could...",
                    "Would it be possible for you to...",
                    "I would really appreciate it if..."
                ],
                "invitations": [
                    "I am writing to invite you to...",
                    "We would be delighted if you could join us for...",
                    "It would mean a lot to us if you could attend..."
                ],
                "thanks": [
                    "I wanted to write to thank you for...",
                    "I really appreciate everything you did...",
                    "I don't know how to thank you enough for..."
                ]
            },
            "common_mistakes": [
                {"wrong": "I am knowing her since childhood", "correct": "I have known her since childhood", "explanation": "Use present perfect (not continuous) with 'know' + 'since'"},
                {"wrong": "Thank you for your help yesterday. I enjoyed very much", "correct": "Thank you for your help yesterday. I enjoyed it very much", "explanation": "'Enjoy' needs an object"},
                {"wrong": "I am looking forward to see you", "correct": "I am looking forward to seeing you", "explanation": "'Look forward to' is followed by -ing form"}
            ],
            "writing_task": {
                "title": "Letter to Friend About Family Event",
                "prompt": "A friend from another country is coming to visit you. Write a letter to your friend. In your letter:\n- invite them to a family event happening during their visit\n- describe what the event will involve\n- suggest what they should bring or wear",
                "model_answer": {
                    "band_6": "Dear Maria,\n\nI hope you are well. I am very excited that you are coming to visit next month!\n\nI want to invite you to my grandmother's 80th birthday party on Saturday 15th. The whole family will be there and they all want to meet you. There will be about 30 people.\n\nThe party is at my parents' house. We will have a big lunch with traditional food from our country. After lunch, there will be music and dancing. My grandmother loves to dance!\n\nYou should wear something smart but comfortable because we will be dancing. Don't bring a gift - just bring yourself!\n\nI can't wait to see you.\n\nLove,\nSophie",
                    "band_8": "Dear Maria,\n\nI was thrilled to receive your email confirming your visit next month! There's actually a wonderful opportunity I wanted to tell you about.\n\nMy grandmother is celebrating her 80th birthday on Saturday 15th, and the entire family is gathering at my parents' house for a special lunch. Everyone has heard so much about you and would be absolutely delighted if you could join us for this milestone celebration.\n\nThe day will begin with a traditional feast featuring dishes that have been in our family for generations. My mother and aunts have been planning the menu for weeks! After lunch, there will be live music and dancing - my grandmother, despite her age, insists on having at least one waltz! The celebration usually continues until early evening.\n\nAs for what to wear, I'd suggest something smart-casual - perhaps a nice dress or blouse with comfortable shoes, since there will definitely be dancing involved. There's no need to bring a gift; my grandmother has specifically requested 'no presents, just presence'!\n\nPlease let me know if you can make it - I really think you'll love experiencing this aspect of our family traditions.\n\nWith love,\nSophie"
                }
            },
            "reading_task": {
                "title": "Wedding Invitation",
                "type": "Invitation",
                "content": "Mr and Mrs James Wilson\nrequest the pleasure of your company\nat the marriage of their daughter\n\nEMILY LOUISE\nto\nMICHAEL DAVID CHEN\n\nSaturday 28th June 2025\nat 2:00 pm\n\nSt Mary's Church, Oak Lane, Millbrook\n\nReception to follow at\nThe Grand Hotel, High Street, Millbrook\n\nRSVP by 1st June to:\nemilymichaelwedding@email.com\n\nDress code: Smart casual\nChildren welcome\nGift registry: www.giftlist.com/emilymichael",
                "questions": [
                    {"q": "What time does the ceremony start?", "a": "2:00 pm", "skill": "locating specific info"},
                    {"q": "By when must you reply?", "a": "1st June", "skill": "understanding deadlines"},
                    {"q": "Are children allowed to attend?", "a": "Yes", "skill": "understanding details"}
                ]
            }
        },
        "finance": {
            "lesson_id": "G_FINANCE_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Money and Finance",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to personal finance, write letters to banks and financial institutions, and understand bank statements and financial notices.",
            "key_vocabulary": [
                {"word": "account", "meaning": "Bank record of money", "typical_use": "Open a savings account."},
                {"word": "balance", "meaning": "Amount of money in account", "typical_use": "Check your balance online."},
                {"word": "transaction", "meaning": "Money movement", "typical_use": "Recent transactions."},
                {"word": "statement", "meaning": "Record of account activity", "typical_use": "Monthly bank statement."},
                {"word": "overdraft", "meaning": "Spending more than balance", "typical_use": "Avoid overdraft fees."},
                {"word": "interest", "meaning": "Extra money earned/charged", "typical_use": "Earn interest on savings."},
                {"word": "loan", "meaning": "Borrowed money", "typical_use": "Apply for a loan."},
                {"word": "repayment", "meaning": "Paying back borrowed money", "typical_use": "Monthly repayments."},
                {"word": "budget", "meaning": "Plan for spending", "typical_use": "Stick to your budget."},
                {"word": "expenses", "meaning": "Money spent", "typical_use": "Monthly expenses."},
                {"word": "income", "meaning": "Money received", "typical_use": "Regular income."},
                {"word": "fee", "meaning": "Charge for service", "typical_use": "No monthly fee."},
                {"word": "transfer", "meaning": "Move money between accounts", "typical_use": "Transfer funds online."},
                {"word": "direct debit", "meaning": "Automatic payment", "typical_use": "Set up a direct debit."},
                {"word": "dispute", "meaning": "Question/challenge charge", "typical_use": "Dispute a transaction."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to request information about...",
                    "I would like to apply for...",
                    "Could you please send me details of..."
                ],
                "complaints": [
                    "I am writing to query a charge on my account...",
                    "I have noticed an error on my statement...",
                    "I would like to dispute the following transaction..."
                ],
                "explanations": [
                    "The transaction dated... was not made by me",
                    "According to my records...",
                    "I believe there has been an error because..."
                ]
            },
            "common_mistakes": [
                {"wrong": "I have received my statement and saw an error", "correct": "I have received my statement and have seen an error", "explanation": "Use present perfect consistently in formal letters"},
                {"wrong": "Please reply me as soon as possible", "correct": "Please reply to me as soon as possible", "explanation": "'Reply' requires 'to' before the person"},
                {"wrong": "I want that you refund my money", "correct": "I would like you to refund my money", "explanation": "Use 'would like + object + to' in polite requests"}
            ],
            "writing_task": {
                "title": "Letter to Bank About Error",
                "prompt": "You have noticed an error on your bank statement. Write a letter to your bank. In your letter:\n- explain what the error is\n- say when you first noticed it\n- tell them what you want them to do",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing about an error on my bank statement for October.\n\nThere is a transaction on 15th October for £150 to 'Online Shop XYZ'. I did not make this transaction and I do not know this shop. I noticed this error when I checked my statement online yesterday.\n\nI have checked all my receipts and I am sure this is not my purchase. I think someone may have used my card details.\n\nPlease investigate this transaction and refund the £150 to my account. Also, please check if my card is safe.\n\nYours faithfully,\nDavid Brown\nAccount number: 12345678",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to bring to your attention an unauthorised transaction that has appeared on my current account statement (Account No: 12345678, Sort Code: 12-34-56).\n\nUpon reviewing my October statement, which I received on 2nd November, I noticed a debit of £150.00 dated 15th October to a merchant listed as 'Online Shop XYZ'. I can confirm that I did not make this purchase, nor do I recognise this retailer. Furthermore, I was abroad on this date and did not use my card for any online transactions.\n\nI have thoroughly checked my records and can find no corresponding receipt or email confirmation for this amount. I am therefore concerned that my card details may have been compromised.\n\nI would be grateful if you could investigate this matter urgently and arrange for the amount to be refunded to my account. Additionally, I would appreciate advice on whether I should cancel my current card as a precautionary measure.\n\nI look forward to your prompt response.\n\nYours faithfully,\nDavid Brown"
                }
            },
            "reading_task": {
                "title": "Bank Account Terms",
                "type": "Information Notice",
                "content": "EVERYDAY SAVER ACCOUNT\nKey Features\n\nInterest Rate: 2.5% AER (variable)\nMinimum Opening Deposit: £1\nWithdrawals: Unlimited free withdrawals\n\nAccess:\n- Online banking 24/7\n- Mobile app\n- Branch (by appointment)\n\nFees:\n- No monthly fee\n- Overdraft not available on this account\n- International transfers: £15 per transaction\n\nImportant:\n- Interest paid annually in April\n- Rate may change - see website for current rate\n- Savings protected up to £85,000 by FSCS\n\nTo Open: Visit branch with ID and proof of address, or apply online at www.examplebank.com",
                "questions": [
                    {"q": "What is the interest rate?", "a": "2.5% AER", "skill": "locating specific info"},
                    {"q": "How much does an international transfer cost?", "a": "£15", "skill": "finding fee information"},
                    {"q": "When is interest paid?", "a": "Annually in April", "skill": "understanding terms"}
                ]
            }
        },
        "culture": {
            "lesson_id": "G_CULTURE_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Culture and Tradition",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to cultural events and traditions, write letters about cultural experiences, and understand event programmes and museum guides.",
            "key_vocabulary": [
                {"word": "tradition", "meaning": "Custom passed down", "typical_use": "It's a family tradition."},
                {"word": "heritage", "meaning": "Cultural inheritance", "typical_use": "Protect our heritage."},
                {"word": "custom", "meaning": "Traditional practice", "typical_use": "A local custom."},
                {"word": "festival", "meaning": "Celebration event", "typical_use": "The annual music festival."},
                {"word": "exhibition", "meaning": "Display of art/objects", "typical_use": "Visit the exhibition."},
                {"word": "performance", "meaning": "Show or concert", "typical_use": "An evening performance."},
                {"word": "admission", "meaning": "Entry fee/permission", "typical_use": "Free admission on Sundays."},
                {"word": "venue", "meaning": "Place for events", "typical_use": "The concert venue."},
                {"word": "authentic", "meaning": "Genuine, real", "typical_use": "Authentic local food."},
                {"word": "diverse", "meaning": "Varied, different", "typical_use": "A diverse community."},
                {"word": "preserve", "meaning": "Keep, maintain", "typical_use": "Preserve traditions."},
                {"word": "souvenir", "meaning": "Memory item bought", "typical_use": "Buy a souvenir."},
                {"word": "landmark", "meaning": "Famous place/building", "typical_use": "Visit famous landmarks."},
                {"word": "guided tour", "meaning": "Tour with expert", "typical_use": "Book a guided tour."},
                {"word": "membership", "meaning": "Being a member", "typical_use": "Annual membership benefits."}
            ],
            "functional_phrases": {
                "requests": [
                    "I would like to book tickets for...",
                    "Could you please provide information about...",
                    "I am writing to enquire about group bookings..."
                ],
                "descriptions": [
                    "The highlight of the event was...",
                    "I was particularly impressed by...",
                    "What made it special was..."
                ],
                "recommendations": [
                    "I would highly recommend...",
                    "It's definitely worth visiting...",
                    "You really should try..."
                ]
            },
            "common_mistakes": [
                {"wrong": "I have visited there last year", "correct": "I visited there last year", "explanation": "Use past simple with specific past time"},
                {"wrong": "The museum was very interested", "correct": "The museum was very interesting", "explanation": "-ed for feelings, -ing for things causing feelings"},
                {"wrong": "I suggest to visit the old town", "correct": "I suggest visiting the old town", "explanation": "'Suggest' is followed by -ing form"}
            ],
            "writing_task": {
                "title": "Letter Recommending Cultural Event",
                "prompt": "You recently attended a cultural event in your town. Write a letter to a friend who is interested in culture. In your letter:\n- describe the event you attended\n- explain what you enjoyed most\n- recommend they attend a similar event",
                "model_answer": {
                    "band_6": "Dear Tom,\n\nI hope you are well. I wanted to tell you about a great event I went to last weekend.\n\nI visited the International Food Festival in the town centre. There were stalls from about 20 different countries with traditional food. There was also music and dancing from different cultures.\n\nI enjoyed the food most - I tried Japanese sushi and Mexican tacos for the first time! The atmosphere was very friendly and everyone was having fun.\n\nI think you would love it because you like trying new food. The festival happens every June, so you should come visit next year and we can go together.\n\nWrite back soon!\n\nBest wishes,\nSarah",
                    "band_8": "Dear Tom,\n\nI hope this letter finds you well! I simply had to write and tell you about the most wonderful cultural event I attended last weekend - I immediately thought of you!\n\nThe International Food and Culture Festival took over our entire town centre for three days. More than twenty countries were represented, each with beautifully decorated stalls showcasing their traditional cuisine, crafts, and customs. The atmosphere was absolutely electric, with live music performances throughout the day ranging from Brazilian samba to Irish folk.\n\nWhat I enjoyed most was the immersive experience of moving from one culture to another within minutes. I particularly loved the Japanese tea ceremony demonstration - it was fascinating to learn about the significance of each careful movement. The food, of course, was exceptional. I finally tried authentic Thai street food and can confirm it's nothing like what we get at restaurants here!\n\nGiven your passion for world cultures, I genuinely believe you would find this festival inspiring. It runs every June, and I would be absolutely delighted if you could visit next summer so we could explore it together. I'll make sure to book you a good hotel early!\n\nDo write back with your thoughts.\n\nWarmest regards,\nSarah"
                }
            },
            "reading_task": {
                "title": "Museum Information",
                "type": "Information Leaflet",
                "content": "CITY HERITAGE MUSEUM\nVisitor Information\n\nOpening Hours:\nTuesday-Sunday: 10:00 AM - 6:00 PM\nMonday: Closed\nLate opening Thursday until 9:00 PM\n\nAdmission:\nAdults: £12\nChildren (5-16): £6\nUnder 5s: Free\nFamily ticket (2+2): £30\nMembers: Free\n\nSpecial Exhibitions:\n'Ancient Egypt' - Ground Floor (until March 31st)\n'Local History Gallery' - First Floor (permanent)\n'Modern Art Collection' - Second Floor\n\nFacilities:\nCafé (Ground floor) - open museum hours\nGift shop - near exit\nFree cloakroom - bags must be checked\nWheelchair access - all floors (lift available)\n\nGuided Tours: Daily at 11:00 AM and 2:00 PM (included in admission)\nAudio guide: £3 rental",
                "questions": [
                    {"q": "On which day does the museum close early?", "a": "It doesn't close early - Monday is closed entirely", "skill": "careful reading"},
                    {"q": "How much is a family ticket?", "a": "£30", "skill": "locating specific info"},
                    {"q": "Where must visitors leave their bags?", "a": "Free cloakroom", "skill": "understanding rules"}
                ]
            }
        },
        "media": {
            "lesson_id": "G_MEDIA_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Media and Advertising",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to media and advertising, write complaint letters about misleading advertisements, and understand subscription terms and media notices.",
            "key_vocabulary": [
                {"word": "advertisement", "meaning": "Promotional content", "typical_use": "I saw an advertisement online."},
                {"word": "subscription", "meaning": "Regular payment for service", "typical_use": "Cancel my subscription."},
                {"word": "misleading", "meaning": "Gives wrong impression", "typical_use": "The ad was misleading."},
                {"word": "broadcast", "meaning": "Transmit TV/radio", "typical_use": "Broadcast live."},
                {"word": "coverage", "meaning": "Reporting on topic", "typical_use": "News coverage of the event."},
                {"word": "headline", "meaning": "Main news title", "typical_use": "Today's headlines."},
                {"word": "promotion", "meaning": "Special offer", "typical_use": "A limited promotion."},
                {"word": "terms and conditions", "meaning": "Rules of agreement", "typical_use": "Read the terms and conditions."},
                {"word": "cancel", "meaning": "End subscription", "typical_use": "Cancel anytime."},
                {"word": "trial", "meaning": "Test period", "typical_use": "Free 30-day trial."},
                {"word": "renewal", "meaning": "Continuing subscription", "typical_use": "Automatic renewal."},
                {"word": "refund", "meaning": "Money returned", "typical_use": "Request a refund."},
                {"word": "claim", "meaning": "Statement said to be true", "typical_use": "False advertising claims."},
                {"word": "consumer", "meaning": "Person who buys", "typical_use": "Consumer rights."},
                {"word": "complain", "meaning": "Express dissatisfaction", "typical_use": "Complain to the company."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to request a refund for...",
                    "I would like to cancel my subscription...",
                    "Please confirm that my account has been closed"
                ],
                "complaints": [
                    "I am writing to complain about misleading advertising...",
                    "The advertisement claimed that... however...",
                    "I feel I have been misled because..."
                ],
                "explanations": [
                    "When I signed up, I was told that...",
                    "The advertisement clearly stated that...",
                    "I was not made aware that..."
                ]
            },
            "common_mistakes": [
                {"wrong": "I have cancelled my subscription yesterday", "correct": "I cancelled my subscription yesterday", "explanation": "Use past simple with specific past time (yesterday)"},
                {"wrong": "The advertisement said that I will get free delivery", "correct": "The advertisement said that I would get free delivery", "explanation": "Use 'would' for reported speech"},
                {"wrong": "I demand you to refund my money", "correct": "I demand that you refund my money / I demand a refund", "explanation": "'Demand' uses 'that + subject + base verb' or noun"}
            ],
            "writing_task": {
                "title": "Complaint About Misleading Advertisement",
                "prompt": "You bought a product after seeing an advertisement, but it was not as described. Write a letter to the company. In your letter:\n- explain what the advertisement promised\n- describe how the product was different\n- say what action you want them to take",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about a product I bought from your company after seeing your advertisement.\n\nThe advertisement said the face cream would make skin look younger in just 2 weeks. It also said it was made from natural ingredients.\n\nHowever, after using the cream for 3 weeks, I see no difference to my skin. Also, I read the ingredients and found many chemicals, not natural ingredients as advertised.\n\nI am very disappointed because the cream was expensive. I would like a full refund of £45.\n\nYours faithfully,\nJane Roberts",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my dissatisfaction with your 'Youth Restore' face cream, which I purchased on 5th October after viewing your advertisement in Women's Weekly magazine.\n\nThe advertisement made several specific claims: that the cream would produce 'visible results in just 14 days,' that it was '100% natural and organic,' and that it had been 'dermatologically tested.' Based on these claims and the premium price of £45, I decided to purchase the product.\n\nHowever, having used the cream diligently for over three weeks, I have seen no improvement whatsoever. More concerning, when I examined the ingredients list, I discovered that the product contains parabens and synthetic fragrances, which directly contradicts your 'natural' claims. I was unable to find any evidence of dermatological testing on the packaging or your website.\n\nI believe your advertisement is misleading and potentially in violation of advertising standards. I therefore request a full refund of £45 and would appreciate confirmation that you will review the claims made in your marketing materials.\n\nI look forward to your response within 14 days.\n\nYours faithfully,\nJane Roberts"
                }
            },
            "reading_task": {
                "title": "Subscription Terms",
                "type": "Terms Notice",
                "content": "STREAMVIEW PLUS\nSubscription Terms\n\nMonthly Plan: £9.99/month\nAnnual Plan: £89.99/year (save 25%)\n\nYour Subscription:\n- Access all content on up to 3 devices\n- Download up to 20 titles for offline viewing\n- HD streaming included (4K requires Premium)\n\nFree Trial:\n- 14-day free trial for new customers\n- Card details required at sign-up\n- Cancel before trial ends to avoid charges\n\nCancellation:\n- Cancel anytime from Account Settings\n- Annual plans: prorated refund in first 30 days only\n- Access continues until end of billing period\n\nAutomatic Renewal:\n- Subscriptions renew automatically\n- Price changes notified 30 days in advance\n- Manage renewal in Account Settings\n\nQuestions? Contact support@streamview.com",
                "questions": [
                    {"q": "How long is the free trial?", "a": "14 days", "skill": "locating specific info"},
                    {"q": "How many devices can you use?", "a": "Up to 3", "skill": "understanding limits"},
                    {"q": "When can you get a refund on annual plans?", "a": "In first 30 days only", "skill": "understanding conditions"}
                ]
            }
        },
        "food": {
            "lesson_id": "G_FOOD_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Food and Nutrition",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to food and dining, write letters about restaurant experiences, and understand menus and food labels.",
            "key_vocabulary": [
                {"word": "reservation", "meaning": "Booking a table", "typical_use": "Make a reservation for 7pm."},
                {"word": "dietary", "meaning": "Related to food intake", "typical_use": "Dietary requirements."},
                {"word": "allergy", "meaning": "Bad reaction to food", "typical_use": "A nut allergy."},
                {"word": "vegetarian", "meaning": "No meat diet", "typical_use": "Vegetarian options."},
                {"word": "ingredients", "meaning": "What food contains", "typical_use": "List all ingredients."},
                {"word": "portion", "meaning": "Amount of food served", "typical_use": "Large portions."},
                {"word": "recommendation", "meaning": "Suggestion", "typical_use": "Chef's recommendation."},
                {"word": "cuisine", "meaning": "Style of cooking", "typical_use": "Italian cuisine."},
                {"word": "appetizer", "meaning": "Starter dish", "typical_use": "Order an appetizer."},
                {"word": "beverage", "meaning": "Drink", "typical_use": "Alcoholic beverages."},
                {"word": "complimentary", "meaning": "Free", "typical_use": "Complimentary bread."},
                {"word": "takeaway", "meaning": "Food to go", "typical_use": "Order takeaway."},
                {"word": "feedback", "meaning": "Opinion/response", "typical_use": "Leave feedback."},
                {"word": "hygiene", "meaning": "Cleanliness", "typical_use": "Food hygiene standards."},
                {"word": "refund", "meaning": "Money back", "typical_use": "Request a refund."}
            ],
            "functional_phrases": {
                "requests": [
                    "I would like to make a reservation for...",
                    "Could you please check if... contains nuts?",
                    "Is it possible to have the sauce on the side?"
                ],
                "complaints": [
                    "I am writing to complain about a meal I had at...",
                    "The food was not as described on the menu...",
                    "I was disappointed to find..."
                ],
                "compliments": [
                    "I wanted to write to thank you for...",
                    "The food and service were excellent...",
                    "I will certainly recommend your restaurant to..."
                ]
            },
            "common_mistakes": [
                {"wrong": "The food was delicious and the service too", "correct": "The food was delicious and the service was too", "explanation": "Include the verb when adding another subject"},
                {"wrong": "I am allergic with nuts", "correct": "I am allergic to nuts", "explanation": "'Allergic' takes the preposition 'to'"},
                {"wrong": "The restaurant has a good food", "correct": "The restaurant has good food", "explanation": "'Food' is uncountable - no 'a'"}
            ],
            "writing_task": {
                "title": "Restaurant Complaint Letter",
                "prompt": "You had a disappointing experience at a restaurant recently. Write a letter to the restaurant manager. In your letter:\n- say when you visited and who you were with\n- describe the problems you experienced\n- say what you would like them to do",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to complain about my experience at your restaurant last Saturday evening.\n\nI visited with my family to celebrate my mother's birthday. We had reserved a table for 6 people at 7pm.\n\nFirst, we waited 30 minutes for our table even though we had a reservation. Then, when the food came, my steak was cold and my wife's fish was overcooked. We told the waiter but nothing was done.\n\nThis was supposed to be a special occasion but it was ruined. I would like a refund for our meal which cost £180.\n\nYours faithfully,\nRobert Williams",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my disappointment regarding an experience at your Riverside branch on Saturday 12th November.\n\nI had made a reservation for 7:00 PM to celebrate my mother's 60th birthday, a significant occasion for our family. We were a party of six, including two elderly relatives.\n\nDespite our advance booking, we were kept waiting at the bar for approximately thirty minutes before being shown to our table, with no explanation or apology offered. Once seated, the problems continued: my ribeye steak arrived lukewarm and had to be sent back, my wife's pan-fried sea bass was clearly overcooked and dry, and when we raised these concerns with our server, we received what I can only describe as indifferent responses.\n\nWhat made matters worse was that we had specifically mentioned the birthday celebration when booking, yet no acknowledgment was made by staff - quite unlike the 'special occasion packages' advertised on your website.\n\nGiven the total bill of £180 and the overall poor experience, I believe a substantial gesture of goodwill is warranted. I would appreciate either a full refund or, at minimum, a significant credit toward a future visit.\n\nI trust you will treat this matter with the seriousness it deserves.\n\nYours faithfully,\nRobert Williams"
                }
            },
            "reading_task": {
                "title": "Restaurant Menu",
                "type": "Menu/Information",
                "content": "THE GARDEN BISTRO\nLunch Menu (12-3pm)\n\nStarters\nSoup of the Day (V) - £5.50\nGarlic Mushrooms (V) - £6.95\nPrawn Cocktail - £8.50\n\nMains\nGrilled Salmon - £16.95\n  with seasonal vegetables and new potatoes\nChicken Risotto - £14.50\n  creamy Arborio rice with roasted chicken\nVegetable Curry (V, VG, GF) - £13.95\n  served with basmati rice and naan bread\n\nDesserts\nChocolate Brownie - £6.50\nFresh Fruit Salad (V, VG, GF) - £5.50\n\n(V)=Vegetarian (VG)=Vegan (GF)=Gluten Free\n\n10% service charge added for parties of 6+\nPlease inform staff of any allergies\nWe cannot guarantee nut-free dishes",
                "questions": [
                    {"q": "Which dishes are suitable for vegans?", "a": "Vegetable Curry and Fresh Fruit Salad", "skill": "locating specific info"},
                    {"q": "When is a service charge added?", "a": "For parties of 6 or more", "skill": "understanding conditions"},
                    {"q": "Can they guarantee nut-free food?", "a": "No", "skill": "understanding limitations"}
                ]
            }
        },
        "transport": {
            "lesson_id": "G_TRANSPORT_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Transportation",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to transport, write letters about travel issues, and understand timetables and transport notices.",
            "key_vocabulary": [
                {"word": "departure", "meaning": "Leaving time/place", "typical_use": "The departure is at 8am."},
                {"word": "arrival", "meaning": "Coming time/place", "typical_use": "Expected arrival time."},
                {"word": "delay", "meaning": "Late/behind schedule", "typical_use": "A 30-minute delay."},
                {"word": "cancellation", "meaning": "Service stopped", "typical_use": "Due to cancellation."},
                {"word": "platform", "meaning": "Where trains stop", "typical_use": "Platform 5."},
                {"word": "terminal", "meaning": "Airport building", "typical_use": "Terminal 2."},
                {"word": "fare", "meaning": "Cost of journey", "typical_use": "The fare is £15."},
                {"word": "single/return", "meaning": "One-way/round trip", "typical_use": "A return ticket."},
                {"word": "peak/off-peak", "meaning": "Busy/quiet times", "typical_use": "Off-peak fares."},
                {"word": "connection", "meaning": "Linked journey", "typical_use": "Miss my connection."},
                {"word": "compensation", "meaning": "Money for problems", "typical_use": "Claim compensation."},
                {"word": "valid", "meaning": "Acceptable/usable", "typical_use": "Ticket valid for 1 day."},
                {"word": "timetable", "meaning": "Schedule", "typical_use": "Check the timetable."},
                {"word": "disruption", "meaning": "Interruption to service", "typical_use": "Service disruptions."},
                {"word": "refund", "meaning": "Money returned", "typical_use": "Full refund available."}
            ],
            "functional_phrases": {
                "requests": [
                    "I am writing to request compensation for...",
                    "I would like to claim a refund for...",
                    "Could you please advise on how to..."
                ],
                "complaints": [
                    "I am writing to complain about the service on...",
                    "Due to the delay, I missed my connection...",
                    "Despite being promised..., this did not happen"
                ],
                "explanations": [
                    "On [date], I was travelling from... to...",
                    "The train was delayed by... hours",
                    "As a result of this delay, I..."
                ]
            },
            "common_mistakes": [
                {"wrong": "The train delayed 2 hours", "correct": "The train was delayed by 2 hours", "explanation": "Passive voice with 'by' for duration"},
                {"wrong": "I missed to catch my connection", "correct": "I missed my connection / I failed to catch my connection", "explanation": "'Miss' is directly followed by the object"},
                {"wrong": "I arrived to the station early", "correct": "I arrived at the station early", "explanation": "'Arrive' takes 'at' for buildings/stations"}
            ],
            "writing_task": {
                "title": "Train Delay Compensation Letter",
                "prompt": "You experienced significant delays on a train journey recently. Write a letter to the train company. In your letter:\n- give details of the journey and delay\n- explain how this affected you\n- say what compensation you expect",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing about a delayed train journey on 5th November.\n\nI was travelling from Manchester to London on the 9am train. The train was delayed by 2 hours because of problems with signals. I had a ticket for the 9am service.\n\nBecause of this delay, I missed an important job interview in London. I had to call the company and they were not happy. I also had to pay for a taxi because I missed my tube connection.\n\nI think I should get a full refund for my ticket (£85) and compensation for my taxi (£25).\n\nYours faithfully,\nPeter Jones",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to request compensation following a severely delayed journey on your service on Saturday 5th November (Booking Reference: XYZ789).\n\nI was travelling on the 09:00 service from Manchester Piccadilly to London Euston, which was scheduled to arrive at 11:15. Due to what was announced as 'signalling problems,' the train did not depart until 10:45 and subsequently arrived in London at 13:30 - over two hours late.\n\nThis delay had significant consequences. I had scheduled a job interview in central London for 12:30, which I was forced to miss entirely despite having allowed a generous buffer time. Additionally, I was obliged to take a taxi from Euston at a cost of £25, as I had missed my planned tube connection.\n\nUnder the Delay Repay scheme, I believe I am entitled to a full refund of my £85 ticket price for a delay exceeding 120 minutes. I would also request that you consider reimbursing my taxi fare, given that this expense was a direct consequence of the delay.\n\nI have attached copies of my ticket, booking confirmation, and taxi receipt. I would appreciate your response within 20 working days as per your stated policy.\n\nYours faithfully,\nPeter Jones"
                }
            },
            "reading_task": {
                "title": "Train Service Update",
                "type": "Travel Notice",
                "content": "SERVICE UPDATE\nNorthern Rail\n\nPlanned Engineering Works\nSaturday 18 - Sunday 19 November\n\nAFFECTED ROUTES:\nManchester - Leeds: No direct trains\n  Rail replacement buses from Manchester Victoria\n  Journey time: approximately 90 minutes (normally 55 mins)\n\nManchester - Sheffield: Trains running but calling additionally at Stockport\n  Expect delays of 10-15 minutes\n\nALTERNATIVES:\nCross-country services via Birmingham unaffected\nAdvance tickets will be valid on buses\n\nTICKET REFUNDS:\nUnused tickets can be refunded until 25 Nov\nClaim via website or ticket office\n\nWe apologise for inconvenience\nCheck before you travel: www.northernrail.com",
                "questions": [
                    {"q": "How long will the bus take from Manchester to Leeds?", "a": "Approximately 90 minutes", "skill": "locating specific info"},
                    {"q": "Are advance tickets valid on buses?", "a": "Yes", "skill": "understanding alternatives"},
                    {"q": "Until when can you get a refund?", "a": "25 November", "skill": "understanding deadlines"}
                ]
            }
        },
        "crime": {
            "lesson_id": "G_CRIME_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Crime and Law",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to crime and safety, write letters about incidents and insurance claims, and understand safety notices and incident reports.",
            "key_vocabulary": [
                {"word": "incident", "meaning": "Event (often bad)", "typical_use": "Report an incident."},
                {"word": "theft", "meaning": "Stealing", "typical_use": "Report a theft."},
                {"word": "witness", "meaning": "Person who saw event", "typical_use": "Be a witness."},
                {"word": "evidence", "meaning": "Proof", "typical_use": "Provide evidence."},
                {"word": "suspect", "meaning": "Person thought guilty", "typical_use": "A suspect was arrested."},
                {"word": "statement", "meaning": "Official account", "typical_use": "Give a statement."},
                {"word": "insurance", "meaning": "Financial protection", "typical_use": "Insurance claim."},
                {"word": "claim", "meaning": "Request for payment", "typical_use": "Make a claim."},
                {"word": "policy", "meaning": "Insurance agreement", "typical_use": "Policy number."},
                {"word": "premises", "meaning": "Building and area", "typical_use": "Leave the premises."},
                {"word": "security", "meaning": "Safety measures", "typical_use": "Security cameras."},
                {"word": "vandalism", "meaning": "Deliberate damage", "typical_use": "An act of vandalism."},
                {"word": "burglary", "meaning": "Breaking in to steal", "typical_use": "Report a burglary."},
                {"word": "damage", "meaning": "Harm caused", "typical_use": "Assess the damage."},
                {"word": "compensation", "meaning": "Payment for loss", "typical_use": "Receive compensation."}
            ],
            "functional_phrases": {
                "reporting": [
                    "I am writing to report an incident that...",
                    "I wish to make a formal complaint regarding...",
                    "This is to notify you that..."
                ],
                "descriptions": [
                    "The incident occurred at approximately...",
                    "I witnessed someone...",
                    "The damage includes..."
                ],
                "requests": [
                    "I would like to request a crime reference number...",
                    "Please arrange for an assessor to visit...",
                    "I would appreciate confirmation that my claim..."
                ]
            },
            "common_mistakes": [
                {"wrong": "The thief has stolen my bag yesterday", "correct": "The thief stole my bag yesterday", "explanation": "Use past simple with specific past time"},
                {"wrong": "I was robbed my wallet", "correct": "My wallet was stolen / I was robbed of my wallet", "explanation": "'Rob' takes the person as object, 'steal' takes the item"},
                {"wrong": "I saw the incident happened", "correct": "I saw the incident happen", "explanation": "After 'see/watch/hear' use base form of verb"}
            ],
            "writing_task": {
                "title": "Insurance Claim Letter",
                "prompt": "Your home was broken into while you were away. Write a letter to your insurance company. In your letter:\n- say when the incident happened\n- describe what was stolen or damaged\n- ask about making a claim",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to report a burglary at my home and make an insurance claim.\n\nThe break-in happened between 15th and 20th October while I was on holiday. I reported it to the police and my crime reference number is ABC123.\n\nThe thieves broke a window to get in. They stole my laptop (worth £800), a television (£400) and some jewellery (about £300). The window will cost about £200 to fix.\n\nI would like to know how to make a claim on my home insurance policy (number HI-456789). Please tell me what documents I need to send.\n\nYours faithfully,\nSusan Brown",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to report a burglary at my property and to initiate an insurance claim under my home contents policy (Policy No: HI-456789).\n\nThe incident occurred sometime between 15th and 20th October while I was abroad on holiday. Upon returning home on the evening of 20th October, I discovered that the property had been broken into via the rear kitchen window, which had been smashed. I immediately contacted the police and was issued crime reference number ABC123.\n\nThe stolen items include: a MacBook Pro laptop (approximate value £800), a 55-inch Samsung television (£400), and several items of jewellery inherited from my grandmother (estimated value £300). Additionally, the forced entry caused damage to the window frame, which I have had quoted for repair at £200.\n\nI understand that I need to provide proof of ownership and value for the stolen items. I have receipts for the laptop and television, and photographs of the jewellery.\n\nI would be grateful if you could advise on the claims procedure, including any forms I need to complete and whether an assessor will need to visit the property. I am available to discuss this further at your convenience.\n\nYours faithfully,\nSusan Brown"
                }
            },
            "reading_task": {
                "title": "Neighbourhood Watch Notice",
                "type": "Safety Notice",
                "content": "NEIGHBOURHOOD WATCH\nMaple Grove Residents\n\nSECURITY ALERT\n\nRecent Incidents in Our Area:\n- 3 shed break-ins reported (Oak Lane)\n- 2 car thefts (vehicles taken overnight)\n- Several suspicious door-to-door callers\n\nPreventive Measures:\n✓ Lock all doors and windows, even when home\n✓ Don't leave valuables visible in cars\n✓ Install outdoor security lights\n✓ Don't open door to unexpected callers\n✓ Mark valuable items with your postcode\n\nReport Suspicious Activity:\nNon-emergency: 101\nEmergency: 999\nAnonymous tip line: 0800 555 111\n\nNext Meeting: Tuesday 15th, 7pm\nCommunity Centre\nAll residents welcome\n\nCoordinator: John Price\njohn.price@maplegrovewatch.org",
                "questions": [
                    {"q": "How many car thefts were reported?", "a": "2", "skill": "locating specific info"},
                    {"q": "What number should you call for non-emergencies?", "a": "101", "skill": "understanding contact info"},
                    {"q": "When is the next meeting?", "a": "Tuesday 15th at 7pm", "skill": "locating event info"}
                ]
            }
        },
        "science": {
            "lesson_id": "G_SCIENCE_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Science and Research",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to science and research, write letters requesting information about courses and experiments, and understand science museum guides and research summaries.",
            "key_vocabulary": [
                {"word": "experiment", "meaning": "Scientific test", "typical_use": "Conduct an experiment."},
                {"word": "research", "meaning": "Systematic study", "typical_use": "Scientific research."},
                {"word": "discovery", "meaning": "Finding something new", "typical_use": "A major discovery."},
                {"word": "theory", "meaning": "Explanation based on evidence", "typical_use": "The theory of evolution."},
                {"word": "hypothesis", "meaning": "Proposed explanation to test", "typical_use": "Test the hypothesis."},
                {"word": "data", "meaning": "Information collected", "typical_use": "Analyse the data."},
                {"word": "evidence", "meaning": "Proof supporting conclusion", "typical_use": "Scientific evidence."},
                {"word": "laboratory", "meaning": "Science work room", "typical_use": "Work in a laboratory."},
                {"word": "innovation", "meaning": "New invention/method", "typical_use": "Technological innovation."},
                {"word": "breakthrough", "meaning": "Important discovery", "typical_use": "A medical breakthrough."},
                {"word": "method", "meaning": "Way of doing something", "typical_use": "Research methods."},
                {"word": "conclusion", "meaning": "Final result/decision", "typical_use": "Reach a conclusion."},
                {"word": "observation", "meaning": "Watching and noting", "typical_use": "Careful observation."},
                {"word": "sample", "meaning": "Small amount for testing", "typical_use": "A blood sample."},
                {"word": "volunteer", "meaning": "Unpaid participant", "typical_use": "Research volunteers."}
            ],
            "functional_phrases": {
                "enquiries": [
                    "I am writing to enquire about...",
                    "I would like more information regarding...",
                    "Could you please provide details of..."
                ],
                "applications": [
                    "I am interested in participating in...",
                    "I would like to apply for...",
                    "I wish to express my interest in..."
                ],
                "descriptions": [
                    "The study involves...",
                    "Participants will be required to...",
                    "The research aims to..."
                ]
            },
            "common_mistakes": [
                {"wrong": "The research shows that smoking is badly for health", "correct": "The research shows that smoking is bad for health", "explanation": "'Bad' is the adjective, 'badly' is an adverb"},
                {"wrong": "Scientists have discovered a new cure yesterday", "correct": "Scientists discovered a new cure yesterday", "explanation": "Use past simple with specific past time"},
                {"wrong": "I am interesting in science", "correct": "I am interested in science", "explanation": "-ed for feelings, -ing for things causing feelings"}
            ],
            "writing_task": {
                "title": "Letter to Research Institute",
                "prompt": "You read about a research study that interests you. Write a letter to the research institute. In your letter:\n- explain how you heard about the study\n- describe why you are interested\n- ask about how to participate",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing about the sleep study I read about in the newspaper last week.\n\nI saw that you are looking for volunteers to help with research about sleep patterns. I am very interested in this because I have problems sleeping and want to understand why.\n\nI am a healthy adult with no medical problems. I work regular hours so I can attend appointments at different times.\n\nCould you please tell me how I can take part in the study? I would also like to know how long it will take and if there is any payment.\n\nYours faithfully,\nMark Taylor",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my interest in participating in the sleep research study that was featured in The Daily Herald on 10th November.\n\nThe article explained that your institute is seeking volunteers for a six-month study investigating the relationship between sleep patterns and cognitive function. This topic particularly resonates with me as I have personally experienced difficulty maintaining consistent sleep patterns, and I am eager to better understand the science behind this common issue.\n\nI believe I would be a suitable candidate for your study. I am a 32-year-old professional in good general health with no underlying medical conditions. I maintain relatively regular working hours and would be able to commit to appointments at various times throughout the study period.\n\nI would be grateful if you could provide more details about the participation requirements, including the frequency of appointments, any compensation offered, and whether the study involves overnight stays at your facility. Additionally, I would like to know the selection criteria and how to formally apply.\n\nI look forward to hearing from you.\n\nYours faithfully,\nMark Taylor"
                }
            },
            "reading_task": {
                "title": "Science Museum Guide",
                "type": "Information Guide",
                "content": "SCIENCE DISCOVERY CENTRE\nVisitor Guide\n\nExhibitions:\n\nGround Floor: Space Exploration\n- Real moon rock sample on display\n- Interactive rocket launch simulator\n- Planetarium shows: 11am, 2pm, 4pm (additional £4)\n\nFirst Floor: Human Body\n- Walk-through heart exhibit\n- Test your reaction time\n- DNA discovery zone\n\nSecond Floor: Climate Science\n- Virtual reality arctic expedition\n- Build your own weather station\n- Live data from weather satellites\n\nDaily Activities:\n10:30am - Chemistry demonstration (Ground Floor)\n1:00pm - Robot workshop (ages 8+, booking required)\n3:30pm - Science show (Main Hall)\n\nAdmission includes all galleries\nAdults: £15 | Children: £8 | Family: £38",
                "questions": [
                    {"q": "What extra cost is there for the planetarium?", "a": "£4", "skill": "locating specific info"},
                    {"q": "What time is the chemistry demonstration?", "a": "10:30am", "skill": "finding schedule info"},
                    {"q": "Which activity requires advance booking?", "a": "Robot workshop", "skill": "understanding requirements"}
                ]
            }
        },
        "leisure": {
            "lesson_id": "G_LEISURE_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Hobbies and Leisure",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to hobbies and leisure activities, write letters about club memberships and leisure facilities, and understand club rules and activity schedules.",
            "key_vocabulary": [
                {"word": "membership", "meaning": "Being a club member", "typical_use": "Apply for membership."},
                {"word": "subscription", "meaning": "Regular payment", "typical_use": "Annual subscription."},
                {"word": "facilities", "meaning": "Equipment/buildings provided", "typical_use": "Excellent facilities."},
                {"word": "equipment", "meaning": "Tools/gear needed", "typical_use": "Sports equipment."},
                {"word": "instructor", "meaning": "Teacher/trainer", "typical_use": "Qualified instructor."},
                {"word": "session", "meaning": "Period of activity", "typical_use": "Book a session."},
                {"word": "beginner", "meaning": "New learner", "typical_use": "Beginner classes."},
                {"word": "intermediate", "meaning": "Middle level", "typical_use": "Intermediate level."},
                {"word": "advanced", "meaning": "High level", "typical_use": "Advanced course."},
                {"word": "timetable", "meaning": "Schedule", "typical_use": "Class timetable."},
                {"word": "booking", "meaning": "Reservation", "typical_use": "Make a booking."},
                {"word": "cancellation", "meaning": "Called off", "typical_use": "24-hour cancellation policy."},
                {"word": "discount", "meaning": "Reduced price", "typical_use": "Member discount."},
                {"word": "trial", "meaning": "Test period", "typical_use": "Free trial session."},
                {"word": "renewal", "meaning": "Extending membership", "typical_use": "Membership renewal."}
            ],
            "functional_phrases": {
                "enquiries": [
                    "I am writing to enquire about membership at...",
                    "I would like information about your facilities...",
                    "Could you please send me details of..."
                ],
                "bookings": [
                    "I would like to book a session for...",
                    "Please reserve a place for me on...",
                    "I wish to sign up for the... class"
                ],
                "complaints": [
                    "I am writing to express my disappointment with...",
                    "The facilities were not as described...",
                    "I am dissatisfied with the service because..."
                ]
            },
            "common_mistakes": [
                {"wrong": "I am interesting in joining the club", "correct": "I am interested in joining the club", "explanation": "-ed for feelings, -ing for things causing feelings"},
                {"wrong": "I enjoy to swim", "correct": "I enjoy swimming", "explanation": "'Enjoy' is followed by -ing form"},
                {"wrong": "The club has a good equipments", "correct": "The club has good equipment", "explanation": "'Equipment' is uncountable"}
            ],
            "writing_task": {
                "title": "Letter to Leisure Centre",
                "prompt": "You want to join a local leisure centre. Write a letter to the centre manager. In your letter:\n- explain what activities you are interested in\n- ask about membership options\n- enquire about beginner classes",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing to ask about joining your leisure centre.\n\nI have recently moved to the area and I want to start exercising regularly. I am interested in swimming and gym classes. I have not done much exercise before so I am a beginner.\n\nCould you please tell me about the different membership options? I would like to know the prices and what facilities are included.\n\nAlso, do you have any beginner swimming classes? I want to improve my technique.\n\nYours faithfully,\nLisa Chen",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to enquire about membership options at your leisure centre, having recently relocated to the Westfield area.\n\nI am particularly interested in utilising your swimming pool and fitness suite. Additionally, I noticed from your website that you offer a variety of group exercise classes, including yoga and spinning, which also appeal to me. I should mention that I am relatively new to regular exercise, so I would benefit from guidance on where to begin.\n\nI would appreciate it if you could provide details of your membership packages, including any off-peak options that might be more economical. I am also curious to know whether equipment induction sessions are included in the membership fee.\n\nFurthermore, I was wondering whether you offer beginner swimming lessons for adults. I can swim but would like to improve my technique, particularly for front crawl. If such classes exist, could you advise on costs, schedules, and how to enrol?\n\nFinally, is there an opportunity to visit the centre and try the facilities before committing to membership? A trial session would help me make an informed decision.\n\nI look forward to your response.\n\nYours faithfully,\nLisa Chen"
                }
            },
            "reading_task": {
                "title": "Sports Centre Information",
                "type": "Membership Guide",
                "content": "WESTFIELD SPORTS CENTRE\nMembership Guide 2024\n\nMembership Options:\nFull Access: £45/month\n- Gym, pool, all classes included\n- No booking fees\n\nOff-Peak: £30/month\n- Access before 4pm weekdays only\n- Classes subject to availability\n\nPay As You Go:\n- Gym: £8/visit\n- Pool: £6/visit\n- Classes: £10/class\n\nFacilities:\n- 25m swimming pool\n- Modern gym (80+ machines)\n- 2 fitness studios\n- Sauna and steam room (Full members only)\n\nClass Timetable:\nYoga: Mon/Wed/Fri 6pm\nSpinning: Tue/Thu 7pm, Sat 10am\nAquafit: Mon/Wed 10am\n\nBooking: Online or at reception\n24-hour cancellation policy applies\n\nJoin today: Free trial session for new enquiries!",
                "questions": [
                    {"q": "How much is Full Access membership?", "a": "£45/month", "skill": "locating specific info"},
                    {"q": "Who can use the sauna?", "a": "Full members only", "skill": "understanding restrictions"},
                    {"q": "What is the cancellation policy?", "a": "24 hours notice required", "skill": "understanding rules"}
                ]
            }
        },
        "sports": {
            "lesson_id": "G_SPORTS_LANG_01",
            "lesson_type": "Module-Specific Language Booster",
            "track": "general",
            "module": "Sports and Competition",
            "band_range": "5.5-6.5",
            "learning_outcome": "After this lesson, you will be able to understand and use key vocabulary related to sports and competition, write letters about sports events and team activities, and understand event programmes and sports club notices.",
            "key_vocabulary": [
                {"word": "tournament", "meaning": "Competition with many games", "typical_use": "Enter the tournament."},
                {"word": "championship", "meaning": "Competition to find best", "typical_use": "Win the championship."},
                {"word": "opponent", "meaning": "Person/team you compete against", "typical_use": "A tough opponent."},
                {"word": "spectator", "meaning": "Person watching event", "typical_use": "Thousands of spectators."},
                {"word": "athlete", "meaning": "Person who does sports", "typical_use": "A professional athlete."},
                {"word": "coach", "meaning": "Person who trains others", "typical_use": "The team coach."},
                {"word": "referee", "meaning": "Official who enforces rules", "typical_use": "The referee's decision."},
                {"word": "score", "meaning": "Points in game", "typical_use": "The final score."},
                {"word": "victory", "meaning": "Win", "typical_use": "A great victory."},
                {"word": "defeat", "meaning": "Loss", "typical_use": "A narrow defeat."},
                {"word": "training", "meaning": "Practice sessions", "typical_use": "Attend training."},
                {"word": "fixture", "meaning": "Scheduled match", "typical_use": "Upcoming fixtures."},
                {"word": "qualification", "meaning": "Meeting required standard", "typical_use": "Qualification round."},
                {"word": "amateur", "meaning": "Not professional", "typical_use": "Amateur league."},
                {"word": "sportsmanship", "meaning": "Fair play behaviour", "typical_use": "Show good sportsmanship."}
            ],
            "functional_phrases": {
                "enquiries": [
                    "I am writing to enquire about joining...",
                    "I would like information about upcoming events...",
                    "Could you tell me about training sessions..."
                ],
                "applications": [
                    "I would like to register for...",
                    "I wish to enter the... competition",
                    "Please add my name to the team list..."
                ],
                "apologies": [
                    "I regret to inform you that I cannot attend...",
                    "Unfortunately, due to injury, I will be unable to...",
                    "I apologise for any inconvenience caused..."
                ]
            },
            "common_mistakes": [
                {"wrong": "I am playing football since 5 years", "correct": "I have been playing football for 5 years", "explanation": "Use present perfect continuous with 'for' + duration"},
                {"wrong": "We won them 3-0", "correct": "We beat them 3-0", "explanation": "'Win' takes a game/prize, 'beat' takes an opponent"},
                {"wrong": "I did a goal", "correct": "I scored a goal", "explanation": "Use 'score' for goals/points"}
            ],
            "writing_task": {
                "title": "Letter to Sports Club",
                "prompt": "You want to join a local sports club. Write a letter to the club secretary. In your letter:\n- introduce yourself and explain your experience\n- ask about training times and fees\n- enquire about upcoming competitions",
                "model_answer": {
                    "band_6": "Dear Sir or Madam,\n\nI am writing because I would like to join your tennis club.\n\nMy name is Alex and I have been playing tennis for about 3 years. I play every week and I want to improve and meet other players. I have played in some small competitions at my old club.\n\nCould you please tell me when the training sessions are? I work during the day so I need evening or weekend times. Also, how much does membership cost?\n\nI am also interested in playing matches. Are there any competitions I could enter as a beginner?\n\nYours faithfully,\nAlex Johnson",
                    "band_8": "Dear Sir or Madam,\n\nI am writing to express my interest in becoming a member of Riverside Tennis Club.\n\nBy way of introduction, I am a 28-year-old marketing professional who has been playing tennis recreationally for approximately three years. While I consider myself an intermediate player, I am keen to develop my skills further and, equally importantly, to become part of a club community where I can meet fellow enthusiasts. Previously, I was a member of a smaller club in Manchester, where I participated in their internal league and several friendly tournaments.\n\nI would be grateful if you could provide information regarding your training programmes. Specifically, I am interested in sessions suitable for intermediate players, ideally scheduled in the evenings or at weekends due to my work commitments. Additionally, could you clarify the membership fees and whether coaching is included or charged separately?\n\nI am also eager to compete at club level. Could you advise whether there are internal tournaments or league matches that members can participate in? Furthermore, do you have affiliated events with other local clubs?\n\nI would welcome the opportunity to visit the club if you offer introductory sessions for prospective members.\n\nYours faithfully,\nAlex Johnson"
                }
            },
            "reading_task": {
                "title": "Sports Event Programme",
                "type": "Event Information",
                "content": "RIVERSIDE SUMMER SPORTS FESTIVAL\n15-16 July 2024\n\nVenue: Riverside Sports Complex, Mill Lane\n\nEvents:\n\nSaturday 15th:\n9:00am - 5K Fun Run (all ages)\n11:00am - Junior Football Tournament (ages 8-14)\n2:00pm - Tennis Singles Competition (adults)\n4:00pm - Swimming Gala\n\nSunday 16th:\n10:00am - Family Relay Race\n1:00pm - Basketball 3v3 Tournament\n3:00pm - Award Ceremony (Main Hall)\n\nRegistration:\n- Online: www.riversidesfestival.com\n- Deadline: 10th July\n- Entry fee: £5 per event (U16s free)\n\nSpectators: Free admission\nFood stalls and refreshments available\nFree parking at Mill Lane car park\n\nContact: events@riversidesports.org",
                "questions": [
                    {"q": "What is the registration deadline?", "a": "10th July", "skill": "locating specific info"},
                    {"q": "How much do under 16s pay to enter?", "a": "Free", "skill": "understanding pricing"},
                    {"q": "When is the Award Ceremony?", "a": "Sunday 16th at 3pm", "skill": "finding event times"}
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
