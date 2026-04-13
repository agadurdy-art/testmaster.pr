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
    
    # ============ ADVANCED MODULE-SPECIFIC STRATEGIC WRITING ============
    # Each module has a focused General Training writing scenario
    # Focus: Tone + Purpose + Argument (not grammar)
    ADVANCED_MODULE_STRATEGIC_WRITING = {
        "digital_frontier": {
            "module_id": "digital_frontier",
            "module_title": "The Digital Frontier",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Formal complaint escalation and consumer rights",
            "learning_outcome": "Write sophisticated complaints about digital services requiring nuanced argumentation and professional escalation techniques.",
            "writing_scenario": {
                "title": "Digital Service Complaint Escalation",
                "context": "You have been experiencing persistent problems with a major tech company's service. Your initial complaints have been ignored.",
                "prompt": "Write a letter to the CEO of a technology company.\n\nIn your letter:\n- Summarize your previous attempts to resolve the issue\n- Explain the broader impact on your work/life\n- Propose a fair resolution\n- Indicate consequences of inaction",
                "strategic_elements": {
                    "tone": "Firm but professional, assertive without being aggressive",
                    "purpose": "Escalate while maintaining credibility for further action",
                    "argument": "Build logical case with documented evidence references"
                },
                "key_phrases": [
                    "Despite multiple attempts to resolve this matter through conventional channels...",
                    "I have thoroughly documented each interaction...",
                    "The cumulative impact of this ongoing issue has been...",
                    "I trust you will appreciate the gravity of this situation...",
                    "I remain committed to resolving this amicably, however..."
                ],
                "model_answer": {
                    "band_8": "Dear Mr. Chen,\n\nI am writing to you directly following the failure of your customer service department to adequately address a critical issue that has now persisted for over eight weeks.\n\nSince March 15th, I have contacted your support team on no fewer than seven occasions regarding persistent data synchronisation failures in your CloudPro business suite. Each interaction has been documented (reference numbers: CS-2847 through CS-2853), yet the responses have ranged from generic troubleshooting suggestions to promises of escalation that never materialised.\n\nThe implications extend far beyond mere inconvenience. As a freelance consultant, I rely heavily on your platform for client project management. The recurring failures have resulted in missed deadlines, compromised client relationships, and an estimated loss of approximately £4,500 in project value.\n\nI propose the following resolution: full refund of subscription fees for the affected period (£350), compensation equivalent to one year's subscription for the documented losses, and a formal assurance that the technical issue will be prioritised for resolution.\n\nShould this matter not be addressed within fourteen days, I shall have no alternative but to pursue formal complaint procedures through the relevant regulatory bodies and share my documented experience on professional networks.\n\nI trust you will recognise the urgency of this matter and respond accordingly.\n\nYours sincerely,\nJames Morrison"
                }
            }
        },
        "green_imperative": {
            "module_id": "green_imperative",
            "module_title": "The Green Imperative",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Community advocacy and environmental proposal writing",
            "learning_outcome": "Write persuasive letters proposing environmental initiatives to local authorities with strategic stakeholder consideration.",
            "writing_scenario": {
                "title": "Environmental Initiative Proposal",
                "context": "You want to propose a significant environmental project to your local council that requires community buy-in.",
                "prompt": "Write a letter to your local council proposing an environmental initiative.\n\nIn your letter:\n- Present your proposal with clear benefits\n- Address potential objections proactively\n- Offer to contribute to implementation\n- Request a meeting to discuss further",
                "strategic_elements": {
                    "tone": "Enthusiastic but practical, visionary yet grounded",
                    "purpose": "Secure support by addressing concerns before they're raised",
                    "argument": "Balance idealism with pragmatism and cost-awareness"
                },
                "key_phrases": [
                    "I write to propose an initiative that I believe could significantly benefit...",
                    "While I acknowledge the financial considerations involved...",
                    "Research from comparable communities suggests...",
                    "I would be delighted to volunteer my time to...",
                    "I am confident that with community support..."
                ],
                "model_answer": {
                    "band_8": "Dear Councillor Roberts,\n\nI am writing to propose the establishment of a community composting scheme in the Riverside Ward, an initiative that I believe could deliver substantial environmental and social benefits while proving financially viable.\n\nThe proposal involves converting the unused section of Memorial Park into a community composting facility, enabling residents to process organic waste locally. Based on successful models in Eastbourne and Brighton, such schemes typically divert 2-3 tonnes of waste annually from landfill while producing valuable compost for community gardens.\n\nI anticipate concerns regarding cost and maintenance. To address these, I have assembled a group of thirty committed residents willing to manage operations voluntarily. Additionally, I have secured provisional interest from Green Solutions Ltd, who would provide initial equipment and training at reduced cost in exchange for being recognised as a sustainability partner.\n\nRegarding potential objections about aesthetics or odour, modern composting systems using enclosed bins and appropriate carbon-nitrogen ratios produce no offensive smells when managed correctly. I can provide specifications from the suppliers.\n\nI would welcome the opportunity to present this proposal in greater detail at an appropriate committee meeting. I am committed to making this initiative a model for community-led environmental action.\n\nYours sincerely,\nDr. Sarah Mitchell"
                }
            }
        },
        "educational_paradigm": {
            "module_id": "educational_paradigm",
            "module_title": "The Educational Paradigm",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Academic advocacy and institutional appeals",
            "learning_outcome": "Write sophisticated appeals to educational institutions requiring diplomatic argument and evidence-based reasoning.",
            "writing_scenario": {
                "title": "Academic Policy Appeal",
                "context": "You disagree with a decision made by an educational institution and wish to appeal through formal channels.",
                "prompt": "Write a letter appealing an academic decision.\n\nIn your letter:\n- State the decision you are appealing\n- Present your grounds for appeal with evidence\n- Acknowledge any procedural requirements\n- Request specific reconsideration",
                "strategic_elements": {
                    "tone": "Respectful but firm, acknowledging authority while asserting rights",
                    "purpose": "Overturn decision while maintaining future relationship",
                    "argument": "Focus on procedure and fairness rather than emotion"
                },
                "key_phrases": [
                    "I am writing to formally appeal the decision of...",
                    "While I respect the committee's authority, I believe there are grounds for reconsideration...",
                    "The evidence I wish to present for your consideration includes...",
                    "I would request that my case be reviewed in light of...",
                    "I remain committed to meeting all academic standards..."
                ],
                "model_answer": {
                    "band_8": "Dear Professor Whitmore,\n\nI am writing to formally appeal the Academic Standards Committee's decision of 14th November to deny my application for extenuating circumstances consideration regarding my final year dissertation.\n\nWhile I fully respect the Committee's role in maintaining academic integrity, I believe relevant evidence was not adequately considered in reaching this decision. Specifically, I submitted medical documentation from Dr. Sarah Chen at University Health Services confirming diagnosis of a significant condition in September. However, the Committee's response indicated this was received after the deadline, when in fact I can demonstrate electronic submission via the portal at 23:47 on 30th September—three minutes before the midnight deadline.\n\nFurthermore, I understand from the Student Support Office that the Committee may not have received the supplementary statement from my Personal Tutor, Dr. James Harrison, who can attest to the impact on my research schedule.\n\nI request that my case be reconsidered with these documents properly included in my file. I am prepared to present my case in person if required, and I can provide additional supporting evidence from my GP if this would assist.\n\nI remain fully committed to completing my degree to the highest standard and trust the Committee will give this appeal fair consideration.\n\nYours sincerely,\nEmily Chang"
                }
            }
        },
        "globalisation_cultural": {
            "module_id": "globalisation_cultural",
            "module_title": "Globalisation and Cultural Identity",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Cross-cultural business communication and international relations",
            "learning_outcome": "Write culturally sensitive business correspondence that bridges different communication styles and expectations.",
            "writing_scenario": {
                "title": "International Business Partnership Proposal",
                "context": "You are proposing a business collaboration with a company from a different cultural background.",
                "prompt": "Write a letter proposing a business partnership with an international company.\n\nIn your letter:\n- Introduce yourself and your organisation\n- Explain the mutual benefits of collaboration\n- Address potential cultural considerations\n- Propose next steps for discussion",
                "strategic_elements": {
                    "tone": "Formal and respectful, acknowledging cultural differences",
                    "purpose": "Build trust and open dialogue for future collaboration",
                    "argument": "Emphasise mutual benefit and long-term relationship"
                },
                "key_phrases": [
                    "I have the pleasure of writing to introduce...",
                    "We have long admired your organisation's approach to...",
                    "I believe there may be significant mutual benefit in exploring...",
                    "We are committed to building relationships founded on respect and trust...",
                    "I would be honoured to arrange a meeting at your convenience..."
                ],
                "model_answer": {
                    "band_8": "Dear Mr. Tanaka,\n\nI have the pleasure of introducing myself as the International Partnerships Director at Greenfield Sustainable Foods, a British company specialising in organic product development.\n\nI am writing following your presentation at the Tokyo International Food Exhibition, where I was deeply impressed by your company's commitment to quality and your innovative approach to traditional food preservation methods. Having researched Yamamoto Foods' distinguished 75-year history, I believe there may be significant opportunity for collaboration that would benefit both our organisations.\n\nSpecifically, I envision a partnership whereby our organic certification expertise and European distribution network could complement your exceptional product development capabilities. This could open European markets to your artisan products while providing our customers with authentic, traditionally crafted foods.\n\nI recognise that building meaningful business relationships requires time and mutual understanding, and I am committed to proceeding at whatever pace feels appropriate. I would welcome the opportunity to visit Osaka to learn more about your operations and share details of our organisation in person.\n\nI have enclosed our company profile and recent annual report for your consideration. I would be honoured to receive your thoughts on whether such a partnership might align with your strategic objectives.\n\nWith respectful regards,\nRobert Harrison\nInternational Partnerships Director"
                }
            }
        },
        "health_public_policy": {
            "module_id": "health_public_policy",
            "module_title": "Health and Public Policy",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Healthcare advocacy and institutional negotiation",
            "learning_outcome": "Write compelling healthcare-related correspondence that combines empathy with strategic argumentation.",
            "writing_scenario": {
                "title": "Healthcare Access Advocacy Letter",
                "context": "You are writing to a health authority to advocate for improved services in your area.",
                "prompt": "Write a letter to the regional health authority.\n\nIn your letter:\n- Describe the current service gap\n- Present evidence of community impact\n- Propose practical solutions\n- Offer community collaboration",
                "strategic_elements": {
                    "tone": "Empathetic but evidence-based, collaborative not confrontational",
                    "purpose": "Secure change through partnership rather than pressure",
                    "argument": "Combine emotional appeal with practical proposals"
                },
                "key_phrases": [
                    "I am writing on behalf of the residents of...",
                    "The human impact of this service gap is significant...",
                    "We have gathered evidence through community consultation showing...",
                    "I would like to propose a collaborative approach...",
                    "Our community is prepared to support implementation through..."
                ],
                "model_answer": {
                    "band_8": "Dear Dr. Williams,\n\nI am writing on behalf of the Westbrook Community Health Action Group to address the growing gap in mental health services for young people in our area.\n\nSince the closure of the Westbrook Youth Mental Health clinic in 2022, young people requiring support have faced a 34-mile round trip to the nearest alternative service. Our community survey of 450 families revealed that 62% have experienced delayed access to care as a result, with several families reporting serious deterioration in their children's conditions during waiting periods.\n\nThe human cost extends beyond statistics. The Smith family, who have given permission to share their story, waited seven months for an initial assessment for their 14-year-old daughter, during which time she was hospitalised twice. Such cases, while extreme, illustrate the urgent need for intervention.\n\nWe propose a partnership to establish a fortnightly outreach clinic at the Westbrook Community Centre. Our group has already secured the venue at no cost, and local GPs have offered to provide supervision. We estimate this would reduce pressure on centralised services while serving approximately 200 young people within the catchment area.\n\nI would welcome the opportunity to present our proposal in detail and discuss how community resources might complement NHS provision.\n\nYours sincerely,\nDr. Margaret Stone\nChair, Westbrook Community Health Action Group"
                }
            }
        },
        "crime_justice": {
            "module_id": "crime_justice",
            "module_title": "Crime, Justice, and the Penal System",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Formal legal correspondence and victim advocacy",
            "learning_outcome": "Write formal correspondence related to legal matters requiring precise language and appropriate advocacy tone.",
            "writing_scenario": {
                "title": "Victim Support and Legal Process Letter",
                "context": "You are writing to support a friend or family member who has been a victim of crime through the legal process.",
                "prompt": "Write a character reference letter for a court case.\n\nIn your letter:\n- Explain your relationship with the person\n- Provide specific examples of their character\n- Address any relevant circumstances\n- Make a respectful appeal to the court",
                "strategic_elements": {
                    "tone": "Formal and respectful, sincere without being sycophantic",
                    "purpose": "Provide credible insight while maintaining court decorum",
                    "argument": "Use specific examples rather than general praise"
                },
                "key_phrases": [
                    "I am writing this letter in support of...",
                    "I have known [name] for [period] in my capacity as...",
                    "I can speak directly to [his/her] character based on...",
                    "I respectfully submit that the court consider...",
                    "I am prepared to provide further testimony if required..."
                ],
                "model_answer": {
                    "band_8": "To the Presiding Judge,\n\nI am writing to provide a character reference for Thomas Wright in relation to case CR-2024-0847. I am a Senior Social Worker with fifteen years' experience, and I have known Mr. Wright professionally for the past four years through my work with vulnerable adults.\n\nDuring this time, I have observed Mr. Wright consistently demonstrate exceptional compassion and reliability. When his elderly neighbour, Mrs. Patterson, suffered a stroke in 2022, Mr. Wright organised a rota of neighbours to ensure she received daily visits during her recovery. He personally handled her shopping and prescription collections for eight months without ever seeking recognition.\n\nI am aware of the circumstances that have brought Mr. Wright before the court. Without commenting on matters that are for the court to decide, I can confirm that he has been open with me about his struggles during the period in question. What I have witnessed since is a genuine commitment to addressing those issues, including his voluntary attendance at the support group I facilitate.\n\nI respectfully submit that the Mr. Wright I know is fundamentally a person of good character who has made significant positive contributions to our community. I am confident he will continue to do so given appropriate support.\n\nI remain available to provide further information if the court requires.\n\nRespectfully submitted,\nMargaret Evans\nBSW, MSW\nSenior Social Worker"
                }
            }
        },
        "media_integrity": {
            "module_id": "media_integrity",
            "module_title": "Media and Information Integrity",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Media complaints and press standards accountability",
            "learning_outcome": "Write effective complaints to media organisations about inaccurate reporting or ethical breaches.",
            "writing_scenario": {
                "title": "Press Standards Complaint",
                "context": "You have been personally affected by inaccurate or unfair media reporting and wish to seek correction.",
                "prompt": "Write a complaint to a newspaper's editor about inaccurate reporting.\n\nIn your letter:\n- Identify the specific inaccuracies\n- Explain the impact on you or your organisation\n- Reference relevant press standards\n- Request specific remedial action",
                "strategic_elements": {
                    "tone": "Professional and measured, avoiding emotional language",
                    "purpose": "Secure correction while maintaining credibility",
                    "argument": "Focus on factual inaccuracies and professional standards"
                },
                "key_phrases": [
                    "I am writing regarding the article published on...",
                    "The following statements are factually incorrect...",
                    "Under IPSO guidelines regarding accuracy...",
                    "The publication of this inaccurate information has resulted in...",
                    "I request that you publish a correction and..."
                ],
                "model_answer": {
                    "band_8": "Dear Editor,\n\nI am writing regarding the article 'Local Business Owner Under Investigation' published in your newspaper on 15th October (page 7), which contains several significant factual inaccuracies concerning my company, Greenwood Catering Services.\n\nFirstly, the article states that Environmental Health has 'launched an investigation' into our premises. This is incorrect. An Environmental Health officer conducted a routine scheduled inspection on 10th October—our fourth such inspection this year—resulting in our sixth consecutive 5-star food hygiene rating.\n\nSecondly, the article quotes 'an anonymous source' claiming several staff members reported concerns about food storage. I can confirm that no such reports have been made to any regulatory body, and I have statements from all seven staff members categorically denying having spoken to your newspaper.\n\nThe publication of this article, prominently positioned and accompanied by a photograph of our premises, has resulted in immediate and measurable damage. We have received four cancellations of advance bookings worth approximately £3,200, and our social media accounts have been subjected to hostile comments citing your article.\n\nUnder IPSO Editors' Code Clause 1 (Accuracy), newspapers must take care not to publish inaccurate, misleading or distorted information. I believe this standard has been breached.\n\nI request that you: (1) publish a correction of equivalent prominence within seven days, and (2) provide details of the 'source' cited, to enable us to consider further action.\n\nYours faithfully,\nMark Greenwood\nManaging Director, Greenwood Catering Services"
                }
            }
        },
        "economy_wealth": {
            "module_id": "economy_wealth",
            "module_title": "Government, Economy, and Wealth Disparity",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Financial advocacy and consumer protection correspondence",
            "learning_outcome": "Write sophisticated financial complaint letters requiring understanding of consumer rights and regulatory frameworks.",
            "writing_scenario": {
                "title": "Financial Misconduct Complaint",
                "context": "You have identified potentially unfair practices by a financial institution.",
                "prompt": "Write a formal complaint to a financial services company.\n\nIn your letter:\n- Detail the specific practices you believe are unfair\n- Reference relevant regulations\n- Explain the financial impact\n- Request investigation and compensation",
                "strategic_elements": {
                    "tone": "Assertive and well-informed, demonstrating regulatory knowledge",
                    "purpose": "Secure resolution while establishing grounds for escalation",
                    "argument": "Frame personal experience within regulatory framework"
                },
                "key_phrases": [
                    "I am writing to make a formal complaint under the FCA complaint handling procedures...",
                    "I believe this practice contravenes...",
                    "The financial impact has been quantified as...",
                    "Under the Consumer Rights Act 2015...",
                    "Should this matter not be resolved within eight weeks..."
                ],
                "model_answer": {
                    "band_8": "Dear Complaints Department,\n\nI am writing to make a formal complaint under Financial Conduct Authority complaint handling procedures regarding the systematic overcharging of fees on my Premium Current Account (account number ending 4872).\n\nOver the past eighteen months, I have been charged thirty-seven separate 'monthly premium fees' of £15.95 despite repeatedly requesting downgrade to a standard account. Each request—made on 14th March 2023, 2nd July 2023, and 15th November 2023—was acknowledged but never actioned. I have retained copies of all correspondence.\n\nI believe this practice contravenes Principle 6 of the FCA's Principles for Business, which requires firms to treat customers fairly. Additionally, under the Consumer Rights Act 2015, I should not be charged for services I have explicitly rejected.\n\nThe financial impact totals £590.15 in fees I should not have incurred. Furthermore, I have spent approximately eight hours attempting to resolve this matter, representing significant personal inconvenience.\n\nI request: (1) immediate refund of all premium fees charged since my first downgrade request (£590.15); (2) compensation of £150 for time and distress; and (3) written confirmation that my account has been converted.\n\nShould this matter not be satisfactorily resolved within your eight-week handling period, I intend to refer it to the Financial Ombudsman Service.\n\nYours faithfully,\nElizabeth Morgan"
                }
            }
        },
        "urbanisation": {
            "module_id": "urbanisation",
            "module_title": "Urbanisation and Modern Society",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Urban planning objections and community representation",
            "learning_outcome": "Write effective objection letters to planning proposals requiring balanced argument and community advocacy.",
            "writing_scenario": {
                "title": "Planning Application Objection",
                "context": "A development proposal threatens your community's character or amenities.",
                "prompt": "Write a letter objecting to a planning application.\n\nIn your letter:\n- Identify the specific planning concerns\n- Present evidence-based objections\n- Propose alternative approaches\n- Request appropriate consideration",
                "strategic_elements": {
                    "tone": "Constructive rather than purely oppositional",
                    "purpose": "Influence decision while appearing reasonable",
                    "argument": "Focus on planning policy, not personal preference"
                },
                "key_phrases": [
                    "I am writing to object to planning application reference...",
                    "This development would be contrary to Policy XX of the Local Plan...",
                    "The cumulative impact on the area would include...",
                    "I would suggest the following modifications...",
                    "I trust the committee will give these concerns appropriate weight..."
                ],
                "model_answer": {
                    "band_8": "Dear Planning Committee,\n\nI am writing to object to planning application 2024/PLN/00547 for the construction of 85 residential units on the former Millbrook industrial site.\n\nWhile I support the principle of developing this brownfield site, I have significant concerns regarding the current proposal's compatibility with the Local Development Plan.\n\nFirstly, the proposed density of 85 units significantly exceeds Policy H2's guidance of 30-40 units per hectare for this zone. At the proposed density, the development would place unsustainable pressure on local infrastructure, particularly Millbrook Primary School, which is already at 98% capacity.\n\nSecondly, the transport assessment fails to adequately address the impact on the B4051 junction, which already exceeds capacity during peak hours. The proposal for only 0.7 parking spaces per unit will inevitably result in overspill parking on surrounding residential streets.\n\nThirdly, the design fails to respect the character of the adjacent conservation area, with building heights of four storeys where three is the established maximum.\n\nI would suggest the following modifications be considered: reducing the development to 55 units with a maximum height of three storeys, incorporating a Section 106 contribution to school expansion, and requiring one parking space per unit.\n\nI trust the committee will give these concerns appropriate weight in their deliberations.\n\nYours faithfully,\nDavid Morrison"
                }
            }
        },
        "science_bioethics": {
            "module_id": "science_bioethics",
            "module_title": "Science and Biomedical Ethics",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Medical research participation and informed consent correspondence",
            "learning_outcome": "Write informed correspondence regarding medical research participation with appropriate questioning and rights awareness.",
            "writing_scenario": {
                "title": "Clinical Trial Inquiry Letter",
                "context": "You are considering participating in medical research and need clarification on important aspects.",
                "prompt": "Write a letter to a research institution about a clinical trial.\n\nIn your letter:\n- Express your interest in participation\n- Request specific information about risks and procedures\n- Ask about your rights as a participant\n- Seek clarification on data handling",
                "strategic_elements": {
                    "tone": "Informed and thoughtful, demonstrating awareness of research ethics",
                    "purpose": "Gather information while demonstrating suitable participant qualities",
                    "argument": "Balance enthusiasm with appropriate caution"
                },
                "key_phrases": [
                    "I am writing to express my interest in participating in...",
                    "I would appreciate clarification on the following aspects...",
                    "I understand that participation is voluntary and I may withdraw...",
                    "Could you please explain how my data will be...",
                    "I would be grateful for an opportunity to discuss..."
                ],
                "model_answer": {
                    "band_8": "Dear Research Team,\n\nI am writing to express my interest in participating in the CARDIO-PREDICT study (reference HP-2024-0156) following my discussion with Dr. Ahmed at the Cardiology Department.\n\nHaving read the participant information sheet, I am broadly supportive of the research objectives and believe my health profile may be suitable. However, I would appreciate clarification on several points before proceeding.\n\nFirstly, regarding the experimental medication: the information sheet mentions 'potential cardiovascular effects' as a known risk. Could you provide more specific information about the nature and frequency of such effects observed in previous phases?\n\nSecondly, I understand that participation involves five hospital visits over twelve months. Would there be flexibility in appointment scheduling for participants with work commitments?\n\nThirdly, concerning data handling: I note that anonymised data may be shared with international research partners. Could you clarify which organisations might receive this data and under what regulatory frameworks?\n\nFinally, I would like to understand the process should I wish to withdraw mid-study. Specifically, would any data collected before withdrawal be retained?\n\nI remain genuinely interested in contributing to this research and would welcome an opportunity to discuss these points in person.\n\nYours sincerely,\nJennifer Brooks"
                }
            }
        },
        "public_transport": {
            "module_id": "public_transport",
            "module_title": "Public Transport and Sustainable Infrastructure",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Transport infrastructure advocacy and policy engagement",
            "learning_outcome": "Write persuasive letters advocating for transport improvements with evidence-based arguments.",
            "writing_scenario": {
                "title": "Public Transport Improvement Proposal",
                "context": "Your community lacks adequate public transport and you want to advocate for improvements.",
                "prompt": "Write a letter to the regional transport authority.\n\nIn your letter:\n- Describe the current transport deficiencies\n- Present evidence of community impact\n- Propose specific improvements\n- Offer to facilitate community input",
                "strategic_elements": {
                    "tone": "Collaborative and solution-focused",
                    "purpose": "Secure commitment to improvements while building partnership",
                    "argument": "Combine resident testimony with economic/environmental benefits"
                },
                "key_phrases": [
                    "I am writing on behalf of residents to highlight...",
                    "Our community survey demonstrates that...",
                    "The economic implications include...",
                    "We propose the following improvements...",
                    "We are prepared to facilitate community engagement..."
                ],
                "model_answer": {
                    "band_8": "Dear Director of Strategic Planning,\n\nI am writing on behalf of the Oakfield Residents Association to address the urgent need for improved public transport connectivity in our area.\n\nThe closure of bus routes 47 and 52 in 2021 has left 3,400 households without direct public transport access to the town centre. Our community survey of 800 residents revealed that 67% now rely on private vehicles for journeys that were previously made by bus, while 23% of non-drivers report significant hardship accessing essential services.\n\nThe economic and environmental implications are substantial. Local businesses report an average 15% decline in footfall since the route closures, and the council's own air quality data shows increased particulate levels along the B3042—now the primary alternative route.\n\nWe propose the following: (1) reinstatement of hourly service to the town centre via a revised route 47; (2) integration with the planned cycle infrastructure on Mill Lane; and (3) a demand-responsive service for elderly residents.\n\nThe Residents Association has secured commitments from local employers to subsidise bus passes, potentially making the route commercially viable.\n\nWe are prepared to facilitate community engagement sessions and gather data to support the business case. I would welcome the opportunity to present our proposal in detail.\n\nYours sincerely,\nMichael Patterson\nChair, Oakfield Residents Association"
                }
            }
        },
        "work_employment": {
            "module_id": "work_employment",
            "module_title": "Work, Employment, and the Evolving Labor Market",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Employment dispute resolution and workplace rights",
            "learning_outcome": "Write effective formal correspondence regarding workplace issues and employment rights.",
            "writing_scenario": {
                "title": "Flexible Working Request",
                "context": "You need to request a change to your working arrangements and must make a formal case.",
                "prompt": "Write a formal flexible working request to your employer.\n\nIn your letter:\n- Specify the change you are requesting\n- Explain the reasons for your request\n- Address potential business concerns\n- Propose solutions to maintain productivity",
                "strategic_elements": {
                    "tone": "Professional and reasonable, demonstrating business awareness",
                    "purpose": "Secure approval by addressing concerns proactively",
                    "argument": "Frame personal needs within business benefit terms"
                },
                "key_phrases": [
                    "I am writing to make a statutory flexible working request...",
                    "The change I am proposing would involve...",
                    "I believe this arrangement would benefit the business by...",
                    "I have considered the following potential concerns...",
                    "I propose the following measures to maintain productivity..."
                ],
                "model_answer": {
                    "band_8": "Dear Ms. Harrison,\n\nI am writing to make a statutory flexible working request under Section 80F of the Employment Rights Act 1996.\n\nI am requesting to change my working pattern from 9am-5pm office-based to a hybrid arrangement: three days office-based (Tuesday, Wednesday, Thursday) and two days working from home (Monday, Friday). This arrangement would commence from 1st February and continue indefinitely.\n\nThe primary reason for this request relates to my recent appointment as primary carer for my elderly mother following her diagnosis with early-stage dementia. The proposed arrangement would enable me to manage medical appointments and care coordination while maintaining my professional commitments.\n\nI have carefully considered potential impacts on my role. Regarding team collaboration, I note that our critical project meetings already occur on Tuesdays and Wednesdays, which I would attend in person. For client interactions, I propose maintaining full availability via video conference and committing to attend the office for any client visits with 48 hours' notice.\n\nTo maintain productivity, I suggest: (1) installing company-approved VPN access; (2) weekly 1:1 calls with you to review priorities; and (3) a three-month review period to assess the arrangement's effectiveness.\n\nI am committed to ensuring this change supports rather than hinders my performance. I am happy to discuss this proposal and consider alternative arrangements.\n\nYours sincerely,\nRebecca Thompson"
                }
            }
        },
        "social_demographics": {
            "module_id": "social_demographics",
            "module_title": "Social Issues: Demographics and Generational Equity",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Social policy advocacy and citizen engagement",
            "learning_outcome": "Write compelling advocacy letters on social issues requiring balanced representation of diverse perspectives.",
            "writing_scenario": {
                "title": "Intergenerational Housing Policy Letter",
                "context": "You want to advocate for housing policies that benefit both older and younger generations.",
                "prompt": "Write a letter to your Member of Parliament about housing policy.\n\nIn your letter:\n- Describe the housing challenges in your area\n- Present perspectives from different generations\n- Propose policies that could help both groups\n- Request specific parliamentary action",
                "strategic_elements": {
                    "tone": "Diplomatic and inclusive, avoiding generational blame",
                    "purpose": "Build cross-generational coalition for change",
                    "argument": "Present as common challenge requiring collective solutions"
                },
                "key_phrases": [
                    "I am writing to you as a constituent concerned about...",
                    "This issue affects residents across all age groups...",
                    "Both older residents and young families have expressed...",
                    "I would propose policies that address...",
                    "I would welcome the opportunity to discuss..."
                ],
                "model_answer": {
                    "band_8": "Dear Ms. Thompson MP,\n\nI am writing as a constituent to express concern about the housing situation in Westford, which affects residents across all generations.\n\nAt our recent community forum, I was struck by how housing challenges connect rather than divide us. Young families shared their struggles to afford homes near aging parents who need support. Meanwhile, older residents spoke of being unable to downsize because suitable smaller properties are equally unaffordable.\n\nThe statistics reflect these concerns: average house prices in Westford have risen 45% in five years, while social housing waiting lists have doubled. At the same time, 340 three-bedroom council properties are occupied by single pensioners who would welcome smaller accommodation if it were available.\n\nI would propose a package addressing multiple needs: (1) incentivised downsizing schemes allowing elderly residents to move to purpose-built flats while freeing family homes; (2) community land trust development on council-owned sites; and (3) improved planning enforcement against second-home conversions.\n\nThese approaches would help young families access housing while enabling older residents to remain in supportive communities—addressing what appears to be generational conflict as the shared challenge it actually is.\n\nI would welcome the opportunity to discuss these proposals and share testimonies from community members.\n\nYours sincerely,\nDr. James Wilson"
                }
            }
        },
        "education_philosophy": {
            "module_id": "education_philosophy",
            "module_title": "Education and Pedagogical Philosophy",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Educational governance and parental advocacy",
            "learning_outcome": "Write effective correspondence to educational institutions regarding policy concerns.",
            "writing_scenario": {
                "title": "School Policy Feedback Letter",
                "context": "Your school has introduced a policy you have concerns about.",
                "prompt": "Write a letter to your school's governing body about a policy concern.\n\nIn your letter:\n- Acknowledge the policy's intentions\n- Present your specific concerns\n- Offer alternative suggestions\n- Request dialogue on the matter",
                "strategic_elements": {
                    "tone": "Respectful and constructive, parent as partner not adversary",
                    "purpose": "Influence policy while maintaining collaborative relationship",
                    "argument": "Frame concerns as helping achieve the school's own goals"
                },
                "key_phrases": [
                    "I am writing as a parent to offer feedback on...",
                    "I understand the rationale behind this policy...",
                    "My concern is that in practice...",
                    "I would suggest the following modifications...",
                    "I believe we share the goal of..."
                ],
                "model_answer": {
                    "band_8": "Dear Chair of Governors,\n\nI am writing as a parent to offer constructive feedback on the new mobile phone policy introduced this term.\n\nI understand and support the rationale behind restricting phone use during lessons—research clearly demonstrates the impact of device distractions on learning. I also appreciate the consultation process that preceded this decision.\n\nHowever, I have concerns about the policy's application to before-school and break times. My daughter, Emma (Year 9), uses her phone to coordinate with me regarding her after-school care arrangements, which vary daily due to my shift work. Under the current policy, she cannot check messages even during breaks, leading to significant anxiety about collection arrangements.\n\nSeveral other working parents have expressed similar concerns. We are not seeking unlimited phone access, but rather a balanced approach that acknowledges legitimate family communication needs.\n\nI would suggest: (1) permitting supervised phone checks at morning break in a designated area; (2) allowing students to check phones after the final bell before leaving school; or (3) implementing a messaging system via the school office for urgent family communications.\n\nI believe we share the goal of an education environment that supports both academic focus and practical family coordination. I would welcome the opportunity to discuss this at the next parent forum.\n\nYours sincerely,\nSarah Mitchell"
                }
            }
        },
        "globalisation_homogenisation": {
            "module_id": "globalisation_homogenisation",
            "module_title": "Globalisation, Cultural Identity, and Homogenisation",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Cultural heritage protection and community identity",
            "learning_outcome": "Write persuasive letters advocating for cultural preservation in the face of development pressures.",
            "writing_scenario": {
                "title": "Heritage Protection Campaign Letter",
                "context": "A development threatens a site of cultural significance to your community.",
                "prompt": "Write a letter to the Heritage Protection Agency.\n\nIn your letter:\n- Describe the site's cultural significance\n- Explain the threat it faces\n- Present evidence of community attachment\n- Request formal protection status",
                "strategic_elements": {
                    "tone": "Passionate but evidence-based, appealing to official criteria",
                    "purpose": "Secure protection by meeting heritage designation requirements",
                    "argument": "Connect local significance to broader heritage values"
                },
                "key_phrases": [
                    "I am writing to request consideration for heritage protection of...",
                    "The cultural significance of this site encompasses...",
                    "Our community has gathered evidence demonstrating...",
                    "The proposed development would irreversibly...",
                    "We believe this site meets the criteria for..."
                ],
                "model_answer": {
                    "band_8": "Dear Heritage Protection Officer,\n\nI am writing on behalf of the Riverside Heritage Group to request consideration for heritage protection of the Old Mill building and surrounding watermeadows on Mill Lane.\n\nThe cultural significance of this site encompasses multiple dimensions. The mill building, constructed in 1823, represents one of only three surviving examples of steam-powered grain mills in the region. Beyond its architectural merit, the site holds profound community significance—oral histories gathered from 47 long-term residents reveal that the annual Mill Fair, held continuously since 1856, remains a focal point of local identity.\n\nThe site now faces imminent threat from Planning Application 2024/PLN/00892, which proposes demolition of the mill and development of 120 residential units. While we recognise housing needs, we believe this particular site warrants protection rather than destruction.\n\nOur research documents: (1) the mill's inclusion in Pevsner's Architectural Guide as a 'notable survivor'; (2) archaeological evidence of medieval predecessor structures; and (3) the watermeadow system's value as a habitat corridor. We have petitions with 1,200 signatures supporting preservation.\n\nWe believe this site meets criteria for listing under both architectural and historic community significance. We request a formal assessment before any planning decision proceeds.\n\nYours faithfully,\nDr. Patricia Edwards\nChair, Riverside Heritage Group"
                }
            }
        },
        "environment_ecological": {
            "module_id": "environment_ecological",
            "module_title": "The Environment: Ecological Integrity and Sustainable Mitigation",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Environmental complaint and corporate accountability",
            "learning_outcome": "Write effective complaints about environmental issues requiring technical understanding and regulatory awareness.",
            "writing_scenario": {
                "title": "Environmental Pollution Complaint",
                "context": "You have observed environmental damage caused by a local business.",
                "prompt": "Write a complaint to the Environment Agency.\n\nIn your letter:\n- Describe the environmental issue you have observed\n- Provide evidence and documentation\n- Explain the ecological impact\n- Request investigation and enforcement",
                "strategic_elements": {
                    "tone": "Factual and precise, avoiding emotional language",
                    "purpose": "Trigger formal investigation through credible reporting",
                    "argument": "Present observations systematically with supporting evidence"
                },
                "key_phrases": [
                    "I wish to report what I believe to be a pollution incident...",
                    "I have documented the following observations...",
                    "The ecological impact has been evident in...",
                    "I have attached photographic evidence dated...",
                    "I request that this matter be formally investigated..."
                ],
                "model_answer": {
                    "band_8": "Dear Environment Agency Incident Team,\n\nI wish to report what I believe to be ongoing industrial discharge into the River Millbrook from premises operated by Westfield Chemical Processing Ltd (grid reference: TQ 456 789).\n\nI have documented the following observations over a four-week period. On 3rd, 10th, 17th, and 24th March, I observed discoloured water—ranging from milky white to pale yellow—being discharged from an outfall pipe on the company's boundary fence directly into the river. Discharge appeared to occur between 6am and 7am on each occasion. I have photographic and video evidence with timestamps.\n\nThe ecological impact has been evident in the 500-metre stretch downstream. I have observed: significant reduction in invertebrate life on river stones; absence of the usual heron population; and a visible decline in aquatic vegetation. Additionally, local residents have reported an unusual chemical odour on multiple occasions.\n\nI understand that Westfield Chemical Processing holds an environmental permit, but I question whether the discharge I have documented falls within permitted parameters.\n\nI attach: (1) photographs with dates and grid references; (2) a log of my observations; and (3) a map showing the discharge point and affected area.\n\nI request formal investigation and would be willing to provide access to my property for monitoring equipment if helpful.\n\nYours faithfully,\nRobert Mitchell"
                }
            }
        },
        "crime_reintegration": {
            "module_id": "crime_reintegration",
            "module_title": "Crime, Justice, and Social Reintegration",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Rehabilitation advocacy and second-chance employment",
            "learning_outcome": "Write persuasive letters supporting rehabilitation programmes and second-chance employment.",
            "writing_scenario": {
                "title": "Rehabilitation Programme Support Letter",
                "context": "You want to advocate for a local rehabilitation programme facing funding cuts.",
                "prompt": "Write a letter to your local council about a rehabilitation programme.\n\nIn your letter:\n- Describe the programme and its purpose\n- Present evidence of its effectiveness\n- Explain the consequences of closure\n- Request continued support",
                "strategic_elements": {
                    "tone": "Balanced and evidence-focused, addressing scepticism",
                    "purpose": "Secure funding by demonstrating value for money",
                    "argument": "Frame rehabilitation as practical benefit, not just compassion"
                },
                "key_phrases": [
                    "I am writing to urge the council to continue support for...",
                    "The evidence demonstrates that this programme...",
                    "The cost-benefit analysis shows...",
                    "Without this programme, the likely outcome is...",
                    "I would welcome the opportunity to present..."
                ],
                "model_answer": {
                    "band_8": "Dear Councillor Davies,\n\nI am writing to urge the council to continue funding for the Pathways Employment Programme, which I understand is under review due to budget constraints.\n\nAs a local business owner who has employed three programme participants over four years, I can speak to its practical value. The programme provides intensive employment preparation for individuals with criminal convictions, addressing the reality that stable employment reduces reoffending by up to 50%.\n\nThe evidence from Pathways' seven-year operation demonstrates clear effectiveness: 68% of participants remain in employment after two years, compared to 23% for the general ex-offender population. Of 340 participants, only 11% have reoffended—substantially below the national average of 48%.\n\nThe cost-benefit analysis is compelling. The programme costs approximately £450,000 annually but saves an estimated £2.1 million in reduced prison costs, court time, and benefits payments. Each successful participant represents approximately £37,000 in annual savings.\n\nWithout this programme, the likely outcome is increased reoffending, with consequent costs to victims, the justice system, and ultimately council budgets. The short-term saving would generate long-term expense.\n\nI would welcome the opportunity to present employer and participant testimonies at the relevant committee meeting.\n\nYours sincerely,\nMark Henderson\nManaging Director, Henderson Construction"
                }
            }
        },
        "public_health_allocation": {
            "module_id": "public_health_allocation",
            "module_title": "Public Health and Medical Resource Allocation",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Healthcare access advocacy and patient rights",
            "learning_outcome": "Write effective letters regarding healthcare access and treatment decisions.",
            "writing_scenario": {
                "title": "Treatment Access Appeal",
                "context": "You have been denied access to a treatment you believe should be available.",
                "prompt": "Write a letter appealing a healthcare funding decision.\n\nIn your letter:\n- State the treatment being requested\n- Present medical evidence supporting your case\n- Reference relevant guidelines and policies\n- Request formal reconsideration",
                "strategic_elements": {
                    "tone": "Factual and measured, avoiding emotional manipulation",
                    "purpose": "Secure reconsideration through procedural argument",
                    "argument": "Focus on clinical evidence and policy compliance"
                },
                "key_phrases": [
                    "I am writing to appeal the decision to decline funding for...",
                    "The clinical evidence supporting this treatment includes...",
                    "NICE guidelines TA-XXX state that...",
                    "I believe my case meets the exceptional circumstances criteria because...",
                    "I request that this decision be formally reconsidered..."
                ],
                "model_answer": {
                    "band_8": "Dear Individual Funding Request Panel,\n\nI am writing to appeal the decision of 15th October to decline funding for Pembrolizumab treatment for my condition (reference: IFR-2024-0567).\n\nI understand that this treatment falls outside standard commissioning criteria. However, I believe my case meets the exceptional circumstances threshold for the following reasons.\n\nThe clinical evidence supporting this treatment in my specific situation includes: (1) documented failure of three previous lines of therapy; (2) positive PD-L1 expression (score 95%), placing me in the cohort most likely to benefit; and (3) otherwise good performance status (ECOG 1) suggesting I could tolerate treatment.\n\nNICE guidelines TA-531 acknowledge that patients with high PD-L1 expression may benefit from immunotherapy even outside currently commissioned indications. My oncologist, Dr. Sarah Chen, has provided a supporting statement confirming that standard options are exhausted and that she considers this treatment clinically appropriate.\n\nThe decision letter cites 'insufficient evidence of benefit.' I respectfully suggest this assessment did not fully consider the clinical papers I previously submitted (Chen et al., 2023; Morrison et al., 2024), which report response rates of 42% in patients with my profile.\n\nI request formal reconsideration of this decision and would welcome the opportunity to attend the panel in person.\n\nYours faithfully,\nElizabeth Morgan"
                }
            }
        },
        "media_journalism": {
            "module_id": "media_journalism",
            "module_title": "The Media Landscape: Journalism, Social Media, and the Public Interest",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Digital rights and online reputation management",
            "learning_outcome": "Write effective correspondence regarding online content removal and digital rights.",
            "writing_scenario": {
                "title": "Right to Be Forgotten Request",
                "context": "Outdated online content is affecting your reputation and you wish to have it removed.",
                "prompt": "Write a letter to a website requesting content removal.\n\nIn your letter:\n- Identify the content and its location\n- Explain why removal is justified\n- Reference relevant data protection rights\n- Request specific action",
                "strategic_elements": {
                    "tone": "Professional and legally informed, not threatening",
                    "purpose": "Secure removal by demonstrating clear legal grounds",
                    "argument": "Balance rights assertion with reasonable expectations"
                },
                "key_phrases": [
                    "I am writing to request the removal of content located at...",
                    "Under Article 17 of the UK GDPR...",
                    "The information is no longer relevant because...",
                    "The continued availability of this content causes...",
                    "I request that this content be removed within..."
                ],
                "model_answer": {
                    "band_8": "Dear Data Protection Officer,\n\nI am writing to request the removal of content located at [website URL] under my rights established by Article 17 of the UK GDPR ('right to erasure').\n\nThe content in question is a 2015 news article reporting on criminal charges against me that were subsequently dismissed. While the original reporting was factually accurate at the time, the outcome—complete dismissal of all charges with no prosecution—was never reported. The article therefore presents a misleading picture to anyone searching my name.\n\nI believe removal is justified under the following grounds: (1) the personal data is no longer necessary for the original journalistic purpose, the case having concluded nine years ago; (2) the data is inaccurate through omission; and (3) the legitimate interests I have in removal outweigh any public interest in retention.\n\nThe continued availability of this content has caused demonstrable harm. I have been declined two employment positions in the past year where background searches revealed this article. Prospective employers have confirmed this was a factor in their decisions.\n\nI understand that journalistic archives may claim exemption, but I submit that a nine-year-old article about charges that were dismissed no longer serves a legitimate public interest.\n\nI request that this content be removed within 30 days, or that you provide written reasons for any refusal.\n\nYours faithfully,\nDavid Morrison"
                }
            }
        },
        "tourism_heritage": {
            "module_id": "tourism_heritage",
            "module_title": "Tourism, Cultural Heritage, and Global Mobility",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Travel complaint escalation and consumer protection",
            "learning_outcome": "Write sophisticated travel complaint letters requiring understanding of consumer rights and package travel regulations.",
            "writing_scenario": {
                "title": "Package Holiday Complaint",
                "context": "Your holiday was significantly different from what was advertised.",
                "prompt": "Write a formal complaint to a travel company.\n\nIn your letter:\n- Describe how the holiday differed from the booking\n- Reference consumer protection regulations\n- Quantify your losses and request compensation\n- Indicate next steps if not resolved",
                "strategic_elements": {
                    "tone": "Assertive and well-documented, demonstrating regulatory knowledge",
                    "purpose": "Secure fair compensation by establishing clear legal grounds",
                    "argument": "Systematically document failures against contractual promises"
                },
                "key_phrases": [
                    "I am writing to make a formal complaint under the Package Travel Regulations 2018...",
                    "The holiday as delivered differed materially from what was advertised...",
                    "Under Regulation 15, I am entitled to...",
                    "I have documented the following discrepancies...",
                    "Should this matter not be resolved, I will refer it to ABTA..."
                ],
                "model_answer": {
                    "band_8": "Dear Customer Relations Manager,\n\nI am writing to make a formal complaint under the Package Travel and Linked Travel Arrangements Regulations 2018 regarding booking reference SUN-789456 (departure 12th August, Santorini).\n\nThe holiday as delivered differed materially from what was advertised and contracted. Specifically: (1) we were accommodated at Hotel Artemis, a three-star property, rather than the booked four-star Hotel Olympia—your representative confirmed no rooms were available at the booked hotel; (2) the 'sea view' room promised featured a partial view of a construction site; (3) the advertised transfers failed to materialise on arrival, requiring a €45 taxi.\n\nUnder Regulation 15, where there is a lack of conformity affecting the performance of a package, the organiser must remedy this without undue cost to the traveller. Your representative's offer of a €50 food voucher was wholly inadequate.\n\nI have documented these failures with photographs, your representative's written acknowledgment, and a statement from fellow guests in similar circumstances.\n\nI calculate fair compensation as: (1) price differential between hotels booked and delivered: £340; (2) transfer costs: £40; (3) compensation for diminished enjoyment: £200. Total: £580.\n\nI request response within 14 days. Should this not be resolved satisfactorily, I will refer the matter to ABTA arbitration and the Competitions and Markets Authority.\n\nYours faithfully,\nRobert Chen"
                }
            }
        }
    }
    
    # ============ ADVANCED MODULE-SPECIFIC STRATEGIC READING ============
    # Each module has complex, real-life reading texts appropriate for Band 7-9
    ADVANCED_MODULE_STRATEGIC_READING = {
        "digital_frontier": {
            "module_id": "digital_frontier",
            "module_title": "The Digital Frontier: AI, Automation, and the Future of Work",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding technical policy documents and digital service agreements",
            "learning_outcome": "Navigate complex digital service terms, privacy policies, and automated decision-making disclosures.",
            "reading_scenario": {
                "title": "Automated Decision-Making Disclosure",
                "context": "You are reviewing a company's disclosure about how AI systems are used in their hiring process.",
                "text_type": "Corporate Policy Document",
                "passage": """AUTOMATED DECISION-MAKING IN RECRUITMENT

TechCorp Industries Limited
Automated Decision-Making Disclosure Statement
Effective Date: 1 January 2025

1. PURPOSE AND SCOPE

In accordance with Article 22 of the UK GDPR and the Information Commissioner's Office guidelines on automated individual decision-making, this document explains how TechCorp Industries Limited ('the Company') uses automated systems in its recruitment processes.

This disclosure applies to all applicants for positions within TechCorp Industries Limited and its subsidiaries. By submitting an application, candidates acknowledge receipt of this information.

2. AUTOMATED SYSTEMS IN USE

2.1 Application Screening Software
The Company utilises proprietary software ('TalentScreen Pro') to perform initial screening of applications. This system analyses:
- Qualification matches against role requirements
- Keyword correlation with job specifications
- Employment history patterns
- Application completeness metrics

The system generates a compatibility score (0-100) for each application. Applications scoring below 45 are automatically declined without human review. Applications scoring 45-70 receive expedited human review. Applications scoring above 70 proceed directly to interview scheduling.

2.2 Video Interview Analysis
For roles requiring video interview submission, the Company employs facial analysis software that assesses:
- Eye contact consistency
- Verbal fluency markers
- Response timing patterns
- Enthusiasm indicators (facial micro-expressions)

This analysis contributes to 30% of the interview assessment score. Human reviewers assess the remaining 70%.

3. DATA SOURCES AND LOGIC

3.1 Input Data
Automated systems process data provided directly by candidates, including CV content, cover letters, video recordings, and assessment responses. The Company does not purchase or utilise third-party profiling data.

3.2 Processing Logic
TalentScreen Pro employs machine learning algorithms trained on successful hire data from 2019-2024. The training dataset comprised 47,000 applications and subsequent employment outcomes. The algorithm weights factors including:
- Educational qualification relevance (25%)
- Direct experience alignment (35%)
- Skills keyword matching (20%)
- Career progression patterns (15%)
- Application quality indicators (5%)

4. SIGNIFICANCE AND CONSEQUENCES

Decisions made wholly or partly by automated means may result in:
- Immediate application rejection
- Invitation to interview
- Conditional offer generation
- Salary band allocation

These outcomes may significantly affect your access to employment opportunities with the Company.

5. YOUR RIGHTS

Under data protection law, you have the right to:
- Request human review of any automated decision
- Express your point of view regarding the decision
- Contest the decision and request reconsideration
- Obtain an explanation of the decision reached

To exercise these rights, contact: recruitment.appeals@techcorp-ind.com within 14 days of receiving an automated decision.

6. SAFEGUARDS

The Company implements the following safeguards:
- Quarterly bias audits of automated systems
- Human oversight for all final hiring decisions
- Regular algorithm retraining to address identified disparities
- Anonymous candidate processing (name, age, photograph removed) during initial screening

7. CONTACT

Data Protection Officer: dpo@techcorp-ind.com
Recruitment Appeals: recruitment.appeals@techcorp-ind.com
General Enquiries: careers@techcorp-ind.com

---
Document Reference: HR-AUT-2025-001
Last Review: December 2024
Next Scheduled Review: June 2025""",
                "questions": [
                    {
                        "question": "According to the document, what happens to applications that receive a TalentScreen Pro score between 45 and 70?",
                        "type": "multiple_choice",
                        "options": ["They are automatically rejected", "They receive expedited human review", "They proceed directly to interview", "They are placed on a waiting list"],
                        "answer": "They receive expedited human review",
                        "explanation": "Paragraph 2.1 states: 'Applications scoring 45-70 receive expedited human review.'"
                    },
                    {
                        "question": "The facial analysis software contributes to what percentage of the video interview assessment?",
                        "type": "short_answer",
                        "answer": "30%",
                        "explanation": "Section 2.2 states: 'This analysis contributes to 30% of the interview assessment score.'"
                    },
                    {
                        "question": "The TalentScreen Pro algorithm gives the highest weighting to which factor?",
                        "type": "multiple_choice",
                        "options": ["Educational qualification relevance", "Direct experience alignment", "Skills keyword matching", "Career progression patterns"],
                        "answer": "Direct experience alignment",
                        "explanation": "Section 3.2 shows direct experience alignment at 35%, which is the highest weighting."
                    },
                    {
                        "question": "Within how many days must a candidate contact the company to appeal an automated decision?",
                        "type": "short_answer",
                        "answer": "14 days",
                        "explanation": "Section 5 states: 'within 14 days of receiving an automated decision.'"
                    },
                    {
                        "question": "The statement that the Company removes identifying information during initial screening is:",
                        "type": "true_false_ng",
                        "answer": "True",
                        "explanation": "Section 6 confirms: 'Anonymous candidate processing (name, age, photograph removed) during initial screening.'"
                    },
                    {
                        "question": "The document states that the Company purchases candidate data from third-party sources.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3.1 explicitly states: 'The Company does not purchase or utilise third-party profiling data.'"
                    }
                ]
            }
        },
        "green_imperative": {
            "module_id": "green_imperative",
            "module_title": "The Green Imperative: Climate Change and Sustainable Development",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding environmental policy documents and sustainability reports",
            "learning_outcome": "Analyse complex environmental regulations, carbon offset schemes, and corporate sustainability commitments.",
            "reading_scenario": {
                "title": "Corporate Carbon Offset Programme Terms",
                "context": "You are reviewing the terms and conditions of a carbon offset programme offered by your employer.",
                "text_type": "Programme Terms and Conditions",
                "passage": """GREENPATH CORPORATE CARBON OFFSET PROGRAMME
Terms and Conditions for Participating Employees
Version 3.2 – November 2024

INTRODUCTION

The GreenPath Programme enables employees of participating organisations to offset their personal carbon emissions through verified projects. This document outlines the terms governing individual participation, the offset mechanism, and participant responsibilities.

SECTION A: ELIGIBILITY AND ENROLMENT

A1. Eligible Participants
Full-time and part-time employees of GreenPath partner organisations with at least 6 months' continuous service are eligible to enrol. Contract workers, agency staff, and consultants are excluded unless their engagement agreement specifically provides for GreenPath participation.

A2. Enrolment Process
Enrolment is completed through the HR self-service portal. Upon enrolment, participants select their contribution tier (Bronze: £15/month, Silver: £30/month, Gold: £50/month). Employers match contributions at 100% for the first year of participation, reducing to 50% in subsequent years.

A3. Commitment Period
The minimum commitment period is 12 months. Early termination within this period forfeits employer matching contributions and incurs an administrative fee of £25. After the initial period, participation may be adjusted or terminated with 30 days' notice.

SECTION B: OFFSET MECHANISM

B1. Project Portfolio
Contributions fund a diversified portfolio of offset projects, including:
- Reforestation initiatives (Kenya, Brazil, Indonesia) – 40% allocation
- Renewable energy development (India, Vietnam) – 30% allocation
- Methane capture from landfill sites (UK, Poland) – 20% allocation
- Community cookstove programmes (Sub-Saharan Africa) – 10% allocation

B2. Verification Standards
All projects hold verification under at least one of the following standards: Verified Carbon Standard (VCS), Gold Standard, or Climate Action Reserve. Projects undergo annual third-party audits, with summary reports available on the GreenPath portal.

B3. Carbon Credit Allocation
Participants receive carbon credits proportional to their contributions. Current pricing: 1 credit (representing 1 tonne CO2e offset) = £18.50. Credits are allocated quarterly, with a statement provided showing tonnes offset and equivalent impact metrics.

SECTION C: PARTICIPANT RIGHTS AND LIMITATIONS

C1. Credit Ownership
Carbon credits allocated to participants are held in a pooled account administered by GreenPath Ltd. Individual withdrawal or transfer of credits is not permitted. Upon leaving the programme, accumulated credits remain within the pool and cannot be monetised or transferred.

C2. Impact Guarantees
GreenPath guarantees that 85% of participant contributions directly fund offset projects. The remaining 15% covers programme administration, verification costs, and reserve fund contributions. GreenPath does not guarantee specific environmental outcomes, as project performance depends on factors beyond programmatic control.

C3. Project Failure Protocol
In the event of verified project failure or reversal, GreenPath will reallocate affected credits to alternative projects within 90 days. Participants will be notified of any reallocation affecting their contribution history.

SECTION D: REPORTING AND TRANSPARENCY

D1. Annual Impact Report
GreenPath publishes an annual impact report detailing total emissions offset, project-by-project performance, verification outcomes, and financial allocation. This report is available by March 31 each year for the preceding calendar year.

D2. Individual Statements
Participants receive quarterly statements showing: contributions made, employer matching, credits allocated, cumulative offset total, and equivalence metrics (e.g., 'equivalent to removing X cars from roads for one year').

D3. Grievance Procedure
Concerns regarding project integrity, credit allocation, or programme management should be directed to: integrity@greenpath-offsets.org. GreenPath commits to acknowledging complaints within 5 business days and providing a substantive response within 30 days.

SECTION E: MODIFICATIONS AND TERMINATION

E1. Programme Modifications
GreenPath reserves the right to modify contribution tiers, project allocations, and administrative procedures with 60 days' notice to participants. Material changes to verification standards require 90 days' notice.

E2. Programme Termination
Should GreenPath terminate the programme, remaining pooled credits will be retired through a verified registry, and participants will receive documentation of their lifetime offset contribution for personal records.

---
Document Reference: GP-TC-2024-3.2
Governing Law: England and Wales
Last Updated: 15 November 2024""",
                "questions": [
                    {
                        "question": "What is the employer matching rate for contributions in the second year of participation?",
                        "type": "multiple_choice",
                        "options": ["100%", "75%", "50%", "25%"],
                        "answer": "50%",
                        "explanation": "Section A2 states: 'Employers match contributions at 100% for the first year of participation, reducing to 50% in subsequent years.'"
                    },
                    {
                        "question": "Which project type receives the largest allocation of funds?",
                        "type": "short_answer",
                        "answer": "Reforestation initiatives",
                        "explanation": "Section B1 shows reforestation receives 40% allocation, the highest of all project types."
                    },
                    {
                        "question": "How much of participant contributions directly funds offset projects?",
                        "type": "short_answer",
                        "answer": "85%",
                        "explanation": "Section C2 states: 'GreenPath guarantees that 85% of participant contributions directly fund offset projects.'"
                    },
                    {
                        "question": "Participants can withdraw or transfer their individual carbon credits at any time.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section C1 explicitly states: 'Individual withdrawal or transfer of credits is not permitted.'"
                    },
                    {
                        "question": "The document provides information about the nationality of the programme administrators.",
                        "type": "true_false_ng",
                        "answer": "Not Given",
                        "explanation": "The document does not mention the nationality of programme administrators."
                    },
                    {
                        "question": "How many days' notice is required for material changes to verification standards?",
                        "type": "short_answer",
                        "answer": "90 days",
                        "explanation": "Section E1 states: 'Material changes to verification standards require 90 days' notice.'"
                    }
                ]
            }
        },
        "educational_paradigm": {
            "module_id": "educational_paradigm",
            "module_title": "The Educational Paradigm: Rethinking Learning for the 21st Century",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding educational policy and training programme documentation",
            "learning_outcome": "Navigate professional development programme requirements, academic regulations, and certification criteria.",
            "reading_scenario": {
                "title": "Professional Certification Programme Handbook",
                "context": "You are considering enrolling in a professional certification programme and reviewing the handbook.",
                "text_type": "Programme Handbook Extract",
                "passage": """CHARTERED INSTITUTE OF PROJECT EXCELLENCE
Professional Certification Programme Handbook
Academic Year 2024-2025

CHAPTER 4: ASSESSMENT FRAMEWORK

4.1 ASSESSMENT PHILOSOPHY

The CIPE assessment framework is designed to evaluate both theoretical understanding and practical application of project excellence principles. Assessment methods align with the Institute's competency framework and reflect the standards expected of chartered professionals operating in complex organisational environments.

4.2 ASSESSMENT COMPONENTS

4.2.1 Written Examinations (40% of Final Grade)
Candidates complete two written examinations:
- Paper 1: Strategic Project Governance (3 hours, closed book)
- Paper 2: Applied Project Analysis (3 hours, open book with approved materials)

Each paper comprises Section A (compulsory case study analysis, 50 marks) and Section B (choice of 2 from 4 essay questions, 25 marks each). A minimum score of 50% is required in each paper to pass.

4.2.2 Portfolio Assessment (35% of Final Grade)
Candidates submit a professional portfolio demonstrating:
- Evidence of project leadership (minimum 2 documented projects)
- Reflective analysis of professional development
- Stakeholder feedback and testimonials
- Continuous professional development log (minimum 40 CPD hours)

Portfolios are assessed against published rubrics available on the CIPE learning portal. Submissions exceeding 15,000 words (excluding appendices) will be returned unassessed.

4.2.3 Professional Discussion (25% of Final Grade)
A 45-minute professional discussion with two CIPE assessors covers:
- Portfolio content and professional experience
- Ethical scenarios and decision-making frameworks
- Future development plans and commitment to professional standards

Professional discussions are conducted via video conference or at approved assessment centres. Candidates may request a specific date within their allocated assessment window.

4.3 GRADING CRITERIA

4.3.1 Grade Descriptors
- Distinction (70%+): Demonstrates exceptional insight and sophisticated application
- Merit (60-69%): Shows clear understanding with consistent competent application
- Pass (50-59%): Meets minimum standards with adequate demonstration of competence
- Referral (40-49%): Requires resubmission of specific components
- Fail (Below 40%): Does not meet minimum standards; requires programme repeat

4.3.2 Compensation
Candidates may compensate one failed component (minimum 40%) if their aggregate score exceeds 50% and other components achieve Pass or above. Compensation is not available for candidates receiving Fail in more than one component.

4.4 REASSESSMENT PROVISIONS

4.4.1 First Reassessment
Candidates receiving Referral may resubmit or resit affected components at the next available assessment window. Reassessment fees apply (see Schedule of Fees). First reassessment grades are uncapped.

4.4.2 Second Reassessment
Candidates failing first reassessment may attempt second reassessment with approval from the Academic Standards Committee. Second reassessment grades are capped at Pass (59% maximum).

4.4.3 Final Attempt
A third attempt requires formal appeal demonstrating extenuating circumstances. If granted, this constitutes the candidate's final opportunity. Failure at third attempt results in termination from the programme without certification.

4.5 EXTENUATING CIRCUMSTANCES

Candidates experiencing circumstances beyond their control that affect assessment performance may apply for:
- Assessment deferral (application deadline: 5 working days before assessment)
- Extended submission deadline (maximum 14 days extension)
- Alternative assessment arrangements (disability, health conditions)

Applications must be supported by appropriate evidence (medical certificates, employer letters, official documentation). The Extenuating Circumstances Panel meets fortnightly during assessment periods.

4.6 ACADEMIC INTEGRITY

4.6.1 Plagiarism and Misconduct
The Institute operates a zero-tolerance policy on academic misconduct. All written submissions are processed through plagiarism detection software. Similarity scores exceeding 15% (excluding properly attributed quotations) trigger investigation.

4.6.2 Penalties
Minor infractions: Written warning and required resubmission
Significant infractions: Component grade reduced to zero
Serious misconduct: Permanent exclusion from CIPE programmes

All misconduct cases are recorded on the Institute's Professional Conduct Register and may be disclosed to employers upon request.

---
Document Reference: CIPE-PCPH-2024-04
Approved by: Academic Board, September 2024
Review Date: September 2025""",
                "questions": [
                    {
                        "question": "What is the minimum CPD hours requirement for the portfolio assessment?",
                        "type": "short_answer",
                        "answer": "40 hours",
                        "explanation": "Section 4.2.2 states: 'Continuous professional development log (minimum 40 CPD hours).'"
                    },
                    {
                        "question": "Portfolios exceeding how many words will be returned unassessed?",
                        "type": "short_answer",
                        "answer": "15,000 words",
                        "explanation": "Section 4.2.2 states: 'Submissions exceeding 15,000 words (excluding appendices) will be returned unassessed.'"
                    },
                    {
                        "question": "What is the maximum grade available for a second reassessment?",
                        "type": "multiple_choice",
                        "options": ["Distinction (70%+)", "Merit (69%)", "Pass (59%)", "Referral (49%)"],
                        "answer": "Pass (59%)",
                        "explanation": "Section 4.4.2 states: 'Second reassessment grades are capped at Pass (59% maximum).'"
                    },
                    {
                        "question": "What similarity score triggers a plagiarism investigation?",
                        "type": "multiple_choice",
                        "options": ["Over 5%", "Over 10%", "Over 15%", "Over 20%"],
                        "answer": "Over 15%",
                        "explanation": "Section 4.6.1 states: 'Similarity scores exceeding 15% (excluding properly attributed quotations) trigger investigation.'"
                    },
                    {
                        "question": "The professional discussion can only be conducted at physical assessment centres.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 4.2.3 states: 'Professional discussions are conducted via video conference or at approved assessment centres.'"
                    },
                    {
                        "question": "First reassessment grades are subject to capping.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 4.4.1 explicitly states: 'First reassessment grades are uncapped.'"
                    }
                ]
            }
        },
        "globalisation_cultural": {
            "module_id": "globalisation_cultural",
            "module_title": "Globalisation and Cultural Identity: Navigating a Connected World",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding international relocation and expatriate documentation",
            "learning_outcome": "Navigate complex visa requirements, international employment contracts, and cultural integration guidance.",
            "reading_scenario": {
                "title": "International Assignment Policy",
                "context": "You are reviewing your company's international assignment policy before accepting an overseas posting.",
                "text_type": "Corporate Policy Document",
                "passage": """GLOBALSERVE INTERNATIONAL
International Assignment Policy
Human Resources Policy Manual – Section 7
Effective: January 2025

1. POLICY OVERVIEW

1.1 Purpose
This policy establishes the framework for managing international assignments, ensuring consistent treatment of assignees while allowing flexibility for business needs. It covers assignment types, compensation approaches, and support provisions.

1.2 Scope
This policy applies to employees of GlobalServe International and its subsidiaries who relocate internationally for periods exceeding 6 months. Short-term assignments (1-6 months) and business travel are governed by separate policies.

2. ASSIGNMENT TYPES

2.1 Standard Assignment (1-3 years)
The employee transfers to a host country office while maintaining employment relationship with the home country entity. Compensation follows the balance sheet approach, maintaining home country purchasing power.

2.2 Localised Assignment (3+ years)
The employee transfers to host country employment terms after an initial transition period. Compensation transitions to local market rates within 18 months, with a 'gradual adjustment allowance' phased out over this period.

2.3 Commuter Assignment
The employee works in a host country location while maintaining residence in the home country, typically commuting weekly or bi-weekly. Additional support includes travel costs and accommodation for working days.

3. COMPENSATION FRAMEWORK

3.1 Balance Sheet Methodology
For standard assignments, compensation comprises:
- Base salary: Maintained at home country equivalent
- Cost of Living Allowance (COLA): Calculated using Mercer indices, reviewed quarterly
- Housing: Provided or subsidised to equivalent home country standard
- Hardship premium: 0-30% depending on location classification
- Tax equalisation: Employee pays hypothetical home country tax; company manages actual obligations

3.2 One-Time Allowances
- Relocation allowance: One month's base salary
- Settling-in allowance: £3,500 single / £5,000 with dependents
- Repatriation allowance: One month's base salary (paid upon successful completion)

3.3 Ongoing Benefits
- Annual home leave: Economy class return flights for assignee and approved dependents
- School fees: Contribution up to £15,000 per child per academic year (international schools only)
- Language training: Up to £2,000 per family member
- Emergency assistance: 24/7 global support line access

4. PRE-DEPARTURE REQUIREMENTS

4.1 Medical Assessment
All assignees and accompanying dependents must complete:
- Comprehensive medical examination
- Psychological readiness assessment
- Required vaccinations and health clearance

Medical conditions requiring ongoing treatment must be disclosed. The company reserves the right to decline assignments where medical support is inadequate in the host location.

4.2 Cultural Preparation
Mandatory pre-departure training includes:
- Country-specific cultural briefing (minimum 8 hours)
- Language fundamentals (where applicable)
- Security awareness training
- Family adjustment workshop (for accompanied assignments)

4.3 Documentation
Assignees are responsible for maintaining valid:
- Passport (minimum 18 months validity at assignment start)
- Visas and work permits (company provides administrative support)
- Professional certifications (as required for role)

5. DURING ASSIGNMENT

5.1 Performance Management
Assignees remain within home country performance management processes. Reviews incorporate input from host country supervisors. Performance ratings during assignment receive additional consideration for complexity factors.

5.2 Career Development
The company commits to maintaining visibility of assignee development and providing meaningful repatriation opportunities. Assignees should maintain contact with home country mentors and participate in virtual development programmes.

5.3 Early Return
Assignments may be terminated early due to:
- Business needs (full support provisions apply)
- Performance issues (modified support provisions)
- Personal request (limited support provisions)
- Failure to adapt (case-by-case assessment)

Voluntary early return within 12 months requires repayment of 50% of relocation costs.

6. REPATRIATION

6.1 Planning Timeline
Repatriation planning begins 6 months before assignment end. HR coordinates:
- Position identification in home country
- Logistics planning
- Re-entry cultural support

6.2 Repatriation Support
- Return relocation services
- Temporary accommodation (up to 30 days)
- Career transition coaching (3 sessions)
- Partner career support (where applicable)

---
Policy Owner: Global Mobility, Human Resources
Document Reference: HR-IAP-2025-07
Next Review: January 2026""",
                "questions": [
                    {
                        "question": "How long is the transition period for compensation to adjust to local market rates in a localised assignment?",
                        "type": "short_answer",
                        "answer": "18 months",
                        "explanation": "Section 2.2 states: 'Compensation transitions to local market rates within 18 months.'"
                    },
                    {
                        "question": "What is the maximum annual school fee contribution per child?",
                        "type": "short_answer",
                        "answer": "£15,000",
                        "explanation": "Section 3.3 states: 'School fees: Contribution up to £15,000 per child per academic year.'"
                    },
                    {
                        "question": "What is the minimum passport validity required at assignment start?",
                        "type": "multiple_choice",
                        "options": ["6 months", "12 months", "18 months", "24 months"],
                        "answer": "18 months",
                        "explanation": "Section 4.3 states: 'Passport (minimum 18 months validity at assignment start).'"
                    },
                    {
                        "question": "What percentage of relocation costs must be repaid for voluntary early return within 12 months?",
                        "type": "short_answer",
                        "answer": "50%",
                        "explanation": "Section 5.3 states: 'Voluntary early return within 12 months requires repayment of 50% of relocation costs.'"
                    },
                    {
                        "question": "The settling-in allowance is higher for single assignees than those with dependents.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3.2 shows: '£3,500 single / £5,000 with dependents' - those with dependents receive more."
                    },
                    {
                        "question": "The policy specifies the exact countries classified as 'hardship' locations.",
                        "type": "true_false_ng",
                        "answer": "Not Given",
                        "explanation": "Section 3.1 mentions hardship premium ranges but does not list specific countries."
                    }
                ]
            }
        },
        "health_public_policy": {
            "module_id": "health_public_policy",
            "module_title": "Health and Public Policy: Navigating Healthcare Systems",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding healthcare documentation and patient rights",
            "learning_outcome": "Navigate complex healthcare policies, insurance documents, and medical consent forms.",
            "reading_scenario": {
                "title": "Private Medical Insurance Policy Summary",
                "context": "You are reviewing a private medical insurance policy before purchasing coverage.",
                "text_type": "Insurance Policy Summary",
                "passage": """PREMIER HEALTH PARTNERS
Policy Summary and Key Information Document
Individual Private Medical Insurance
Policy Year: 2025

IMPORTANT: This summary does not replace your full policy document. Please read the complete terms and conditions before purchasing.

SECTION 1: COVERAGE OVERVIEW

1.1 What This Policy Covers
Your Premier Comprehensive policy provides cover for:
✓ In-patient treatment: Hospital stays, surgery, and associated care
✓ Day-patient treatment: Procedures not requiring overnight stay
✓ Out-patient treatment: Consultations, diagnostics, and therapies
✓ Cancer care: Full cover for eligible cancer treatments
✓ Mental health: Treatment for acute psychiatric conditions (limits apply)
✓ Physiotherapy: 10 sessions per condition per policy year

1.2 Annual Benefit Limits
- Overall annual maximum: £1,500,000
- Out-patient annual maximum: £25,000
- Mental health (out-patient): £5,000
- Complementary therapies: £500
- Dental (accident only): £5,000

SECTION 2: WHAT IS NOT COVERED

2.1 General Exclusions
✗ Pre-existing conditions (within 5 years before cover start)
✗ Chronic disease management (conditions requiring ongoing treatment)
✗ Cosmetic procedures (unless reconstructive following illness/accident)
✗ Pregnancy and childbirth (unless complications arise)
✗ Fertility treatment
✗ Experimental treatments not approved by NICE
✗ Self-inflicted injuries
✗ Injuries from professional sports participation

2.2 Waiting Periods
- General conditions: No waiting period
- Mental health: 90-day waiting period
- Back and joint problems: 180-day waiting period (moratorium underwriting)
- Cancer: No waiting period (full medical underwriting only)

SECTION 3: USING YOUR COVER

3.1 Pre-Authorisation Requirements
You MUST obtain pre-authorisation before:
- All in-patient and day-patient admissions
- Any treatment expected to cost over £500
- All cancer treatments
- Mental health treatment

Failure to obtain pre-authorisation may result in claim reduction or rejection. Emergency admissions must be notified within 48 hours.

3.2 Hospital and Specialist Lists
Your policy provides access to our Extended Network of 350+ hospitals and 15,000+ consultants. Using non-network providers incurs a 40% co-payment on all associated costs.

3.3 Excess Options
Your selected excess (£0/£100/£250/£500/£1,000) applies:
- Once per person per policy year
- To in-patient and day-patient claims only
- Does not apply to out-patient consultations

SECTION 4: PREMIUMS AND PAYMENT

4.1 Premium Basis
Your premium is calculated based on:
- Age at policy start
- Postcode rating area
- Selected excess
- Chosen optional benefits
- Previous claims history

4.2 Premium Changes
Premiums are reviewed annually. Factors affecting changes include:
- Your increasing age
- Overall claims experience across Premier's membership
- Medical cost inflation
- Any claims made during the policy year

Premium increases are applied at renewal. The company will notify you of changes at least 30 days before renewal date.

4.3 Cancellation and Refunds
- Cooling-off period: 14 days from policy start for full refund
- Mid-term cancellation: Pro-rata refund less £25 administration fee
- Claims made: No refund for periods during which claims were paid

SECTION 5: MAKING A CLAIM

5.1 Claim Process
1. Obtain GP referral to specialist (where required)
2. Contact Claims Team for pre-authorisation
3. Attend approved facility and provide membership number
4. Hospital/consultant invoices Premier directly (network providers)
5. Settle any excess or co-payment amounts

5.2 Claim Timelines
- Pre-authorisation decisions: Within 2 working days
- Claim processing: Within 10 working days of receiving complete documentation
- Payment to providers: Within 15 working days of claim approval

5.3 Disputes and Appeals
If your claim is declined, you may:
- Request written explanation within 5 working days
- Submit additional evidence for reconsideration
- Appeal to our Independent Medical Review panel
- Contact the Financial Ombudsman Service if unresolved

---
Premier Health Partners is authorised and regulated by the Financial Conduct Authority (FCA Reference: 123456)
Policy Document Reference: PHP-IND-2025-CS
Issue Date: December 2024""",
                "questions": [
                    {
                        "question": "What is the annual maximum for out-patient treatment?",
                        "type": "short_answer",
                        "answer": "£25,000",
                        "explanation": "Section 1.2 states: 'Out-patient annual maximum: £25,000.'"
                    },
                    {
                        "question": "How long is the waiting period for mental health coverage?",
                        "type": "short_answer",
                        "answer": "90 days",
                        "explanation": "Section 2.2 states: 'Mental health: 90-day waiting period.'"
                    },
                    {
                        "question": "What is the co-payment percentage for using non-network providers?",
                        "type": "multiple_choice",
                        "options": ["20%", "30%", "40%", "50%"],
                        "answer": "40%",
                        "explanation": "Section 3.2 states: 'Using non-network providers incurs a 40% co-payment.'"
                    },
                    {
                        "question": "Emergency admissions must be notified within how many hours?",
                        "type": "short_answer",
                        "answer": "48 hours",
                        "explanation": "Section 3.1 states: 'Emergency admissions must be notified within 48 hours.'"
                    },
                    {
                        "question": "The policy covers fertility treatment.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 2.1 explicitly lists 'Fertility treatment' as an exclusion."
                    },
                    {
                        "question": "The excess applies to both in-patient and out-patient consultations.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3.3 states the excess 'Does not apply to out-patient consultations.'"
                    }
                ]
            }
        },
        "crime_justice": {
            "module_id": "crime_justice",
            "module_title": "Crime and Justice: Balancing Security and Liberty",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding legal notices and rights documentation",
            "learning_outcome": "Navigate complex legal notices, tenancy dispute procedures, and regulatory compliance documents.",
            "reading_scenario": {
                "title": "Tenancy Deposit Protection Certificate",
                "context": "You are reviewing the prescribed information for your tenancy deposit as required by law.",
                "text_type": "Legal Notice and Prescribed Information",
                "passage": """TENANCY DEPOSIT PROTECTION SCHEME
Prescribed Information Certificate
Deposit Protection Service (DPS)

CERTIFICATE OF DEPOSIT PROTECTION

This document certifies that the deposit detailed below has been protected in accordance with the Housing Act 2004 and The Tenancy Deposit Schemes (England) Regulations.

SECTION A: DEPOSIT DETAILS

A1. Protection Reference: DPS-2024-7823456
A2. Date of Protection: 15 November 2024
A3. Deposit Amount: £1,450.00
A4. Property Address: Flat 12, Riverside Court, 45 Thames Walk, London SE1 2AB

SECTION B: PARTIES

B1. Landlord/Agent Details
Name: Riverside Property Management Ltd
Address: 78 Commercial Road, London E1 1LN
Email: deposits@riversidepm.co.uk
Scheme Membership: RPM-DPS-5567

B2. Tenant Details
Lead Tenant: [Name Redacted]
Joint Tenants: None recorded
Contact: As per tenancy agreement

SECTION C: THE TENANCY

C1. Tenancy Type: Assured Shorthold Tenancy (AST)
C2. Tenancy Start Date: 1 November 2024
C3. Initial Fixed Term: 12 months (ending 31 October 2025)
C4. Rent: £1,450.00 per calendar month

SECTION D: DEPOSIT PURPOSE AND DEDUCTIONS

D1. The deposit is held as security for the tenant's performance of obligations under the tenancy agreement, including but not limited to:
- Payment of rent and other charges
- Repair of damage beyond fair wear and tear
- Replacement of missing items
- Professional cleaning where required by the tenancy agreement
- Any outstanding utility bills or council tax at tenancy end

D2. Deduction Procedure
At tenancy end:
1. Landlord/agent conducts checkout inspection (tenant may attend)
2. Landlord/agent submits proposed deductions within 10 days of tenancy end
3. Tenant has 10 days to agree or dispute proposed deductions
4. If agreed, deposit returned (less deductions) within 10 days of agreement
5. If disputed, matter proceeds to Alternative Dispute Resolution (ADR)

D3. Evidence Requirements
Any deductions must be supported by:
- Check-in and check-out inventory reports
- Photographic evidence of damage
- Receipts or quotes for remedial works
- Proof of outstanding payments owed

SECTION E: DISPUTE RESOLUTION

E1. Alternative Dispute Resolution
The Deposit Protection Service provides free ADR for disputes that cannot be resolved between parties. ADR is:
- Impartial and independent
- Based on evidence submitted by both parties
- Legally binding once adjudication is issued

E2. ADR Process
1. Either party submits dispute within 90 days of tenancy end
2. DPS notifies other party and requests evidence submission
3. Evidence deadline: 14 days from notification
4. Adjudicator reviews submissions (parties cannot add further evidence)
5. Decision issued within 28 days of evidence deadline
6. Deposit distributed according to adjudication within 5 working days

E3. ADR Limitations
The adjudicator can only decide on the distribution of the protected deposit. They cannot:
- Award compensation beyond the deposit amount
- Make findings of breach of tenancy agreement
- Enforce attendance at mediation
- Consider late-submitted evidence

SECTION F: YOUR RIGHTS

F1. Tenant Rights
As a tenant, you have the right to:
- Receive this prescribed information within 30 days of payment
- Have your deposit protected in a government-backed scheme
- Challenge any proposed deductions
- Use the free ADR service
- Apply to court if deposit protection requirements are breached

F2. Statutory Penalties
If a landlord fails to protect a deposit or provide prescribed information:
- The tenant may apply to court for return of the deposit
- The court may order compensation of 1-3 times the deposit amount
- Section 21 'no fault' eviction notices cannot be served

F3. Court Option
Either party may choose court proceedings instead of ADR. Court proceedings:
- May allow greater remedies
- Incur court fees and potential costs liability
- Are binding and enforceable

SECTION G: CONTACT INFORMATION

Deposit Protection Service
Website: www.depositprotection.com
Telephone: 0330 303 0030
Email: enquiries@depositprotection.com
Post: DPS, PO Box 1255, Hemel Hempstead HP1 9GN

Dispute queries: disputes@depositprotection.com

---
This certificate was generated on 18 November 2024
Certificate Reference: DPS-CERT-2024-7823456-PI""",
                "questions": [
                    {
                        "question": "Within how many days must the landlord submit proposed deductions after the tenancy ends?",
                        "type": "short_answer",
                        "answer": "10 days",
                        "explanation": "Section D2 states: 'Landlord/agent submits proposed deductions within 10 days of tenancy end.'"
                    },
                    {
                        "question": "How long does the tenant have to respond to proposed deductions?",
                        "type": "short_answer",
                        "answer": "10 days",
                        "explanation": "Section D2 states: 'Tenant has 10 days to agree or dispute proposed deductions.'"
                    },
                    {
                        "question": "Within how many days of the tenancy ending must a dispute be submitted to ADR?",
                        "type": "multiple_choice",
                        "options": ["30 days", "60 days", "90 days", "120 days"],
                        "answer": "90 days",
                        "explanation": "Section E2 states: 'Either party submits dispute within 90 days of tenancy end.'"
                    },
                    {
                        "question": "What is the maximum compensation a court may order for failure to protect a deposit?",
                        "type": "short_answer",
                        "answer": "3 times the deposit amount",
                        "explanation": "Section F2 states: 'The court may order compensation of 1-3 times the deposit amount.'"
                    },
                    {
                        "question": "The ADR service can award compensation beyond the deposit amount.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section E3 explicitly states the adjudicator 'cannot award compensation beyond the deposit amount.'"
                    },
                    {
                        "question": "The document includes the name of the lead tenant.",
                        "type": "true_false_ng",
                        "answer": "Not Given",
                        "explanation": "Section B2 shows '[Name Redacted]' for the lead tenant, so the actual name is not provided."
                    }
                ]
            }
        },
        "media_integrity": {
            "module_id": "media_integrity",
            "module_title": "Media and Information Integrity in the Digital Age",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding media complaints and broadcasting regulations",
            "learning_outcome": "Navigate broadcasting complaint procedures and media regulatory documentation.",
            "reading_scenario": {
                "title": "Broadcasting Standards Complaint Decision",
                "context": "You are reading a broadcasting regulator's decision on a complaint about programme accuracy.",
                "text_type": "Regulatory Decision Notice",
                "passage": """BROADCASTING STANDARDS AUTHORITY
Decision Notice

Complaint Reference: BSA-2024-0892
Programme: 'Investigative Report: Hidden Dangers'
Broadcaster: National Broadcasting Network (NBN)
Transmission Date: 15 September 2024, 21:00
Complainant: Dr. Jennifer Morrison (Senior Research Fellow, University of Bristol)

BACKGROUND

1. On 15 September 2024, NBN broadcast 'Investigative Report: Hidden Dangers', a documentary examining the safety of a widely-used food additive (E621, monosodium glutamate). The programme alleged that recent research demonstrated significant health risks, including links to neurological disorders.

2. Dr. Morrison, a leading researcher in food science, complained that the programme breached the Broadcasting Code's accuracy requirements by:
(a) Misrepresenting scientific research findings
(b) Failing to present contrary evidence
(c) Using selective editing to distort expert contributions

3. NBN responded that the programme accurately reflected the research cited, presented multiple perspectives, and gave appropriate context to expert contributions.

THE COMPLAINT IN DETAIL

4. Dr. Morrison's specific complaints were:
(a) A 2023 study was described as showing 'clear evidence' of harm, when its actual conclusion was 'no statistically significant association'
(b) Her own interview was edited to remove her statement that 'the weight of evidence supports safety'
(c) The programme did not include responses from the European Food Safety Authority (EFSA) or UK Food Standards Agency, both of which have assessed MSG as safe

5. NBN acknowledged the editing of Dr. Morrison's contribution but stated this was for time constraints and did not materially alter her position. NBN disputed the characterisation of the 2023 study, stating their description reflected their interpretation of the data.

APPLICABLE CODE PROVISIONS

6. Broadcasting Code, Section 5 (Due Accuracy):
5.1: News and current affairs programmes must be duly accurate
5.2: Significant factual claims should be verified and attributed
5.3: Opposing viewpoints should be given due weight
5.4: Interviewees should not be portrayed unfairly through editing

AUTHORITY'S FINDINGS

7. Regarding the 2023 Study: The Authority reviewed the original research paper. The paper's conclusion stated: 'This study found no statistically significant association between MSG consumption at normal dietary levels and the adverse effects examined.' The programme's description as 'clear evidence' of harm was therefore materially inaccurate. BREACH FOUND.

8. Regarding the Edited Interview: The Authority compared the original interview recording with the broadcast version. Dr. Morrison's statement that 'the weight of evidence supports safety' was removed. This omission materially altered the impression of her views, creating unfairness. BREACH FOUND.

9. Regarding Absence of Regulatory Views: While broadcasters are not obligated to include every viewpoint, the absence of any response from food safety regulators on a matter within their direct responsibility represented a failure to give due weight to significant opposing perspectives. BREACH FOUND.

DETERMINATION

10. The Authority finds that the programme breached Code provisions 5.1, 5.3, and 5.4.

REQUIRED ACTIONS

11. NBN is required to:
(a) Broadcast a correction during a primetime slot within 28 days, acknowledging the inaccuracies
(b) Remove the programme from on-demand services until corrections are incorporated
(c) Provide a written explanation of editorial procedures to the Authority within 42 days

12. The Authority notes this is NBN's second accuracy breach within 12 months. Any further breaches may result in consideration of financial penalties.

RIGHT OF APPEAL

13. Either party may appeal this decision to the Broadcasting Appeals Tribunal within 28 days of publication. Appeals must be submitted in writing, specifying grounds for appeal.

---
Decision Date: 15 November 2024
Published: 20 November 2024
Panel Members: Judge R. Thompson (Chair), Dr. A. Chen, Ms. S. Patel

This decision will be published in the Authority's Decision Bulletin and on the Authority website.""",
                "questions": [
                    {
                        "question": "How many breaches of the Broadcasting Code did the Authority find?",
                        "type": "short_answer",
                        "answer": "3",
                        "explanation": "The Authority found breaches of Code provisions 5.1, 5.3, and 5.4 (paragraphs 7, 8, and 9)."
                    },
                    {
                        "question": "Within how many days must NBN broadcast a correction?",
                        "type": "short_answer",
                        "answer": "28 days",
                        "explanation": "Paragraph 11(a) states: 'Broadcast a correction during a primetime slot within 28 days.'"
                    },
                    {
                        "question": "What was removed from Dr. Morrison's interview in the broadcast version?",
                        "type": "multiple_choice",
                        "options": ["Her credentials", "Her statement that evidence supports safety", "Her criticism of the study", "Her recommendation for further research"],
                        "answer": "Her statement that evidence supports safety",
                        "explanation": "Paragraph 8 states her statement 'the weight of evidence supports safety' was removed."
                    },
                    {
                        "question": "How many accuracy breaches has NBN had in the past 12 months including this one?",
                        "type": "short_answer",
                        "answer": "2",
                        "explanation": "Paragraph 12 states: 'this is NBN's second accuracy breach within 12 months.'"
                    },
                    {
                        "question": "The Authority found that the programme accurately described the 2023 study.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Paragraph 7 states the programme's description was 'materially inaccurate.'"
                    },
                    {
                        "question": "The decision notice provides details about NBN's previous accuracy breach.",
                        "type": "true_false_ng",
                        "answer": "Not Given",
                        "explanation": "Paragraph 12 mentions the previous breach but does not provide details about it."
                    }
                ]
            }
        },
        "economy_wealth": {
            "module_id": "economy_wealth",
            "module_title": "Economy, Wealth Distribution, and Government Responsibility",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding financial documents and investment disclosures",
            "learning_outcome": "Navigate complex financial product information, pension documentation, and investment risk disclosures.",
            "reading_scenario": {
                "title": "Workplace Pension Scheme Guide",
                "context": "You are reviewing your employer's workplace pension scheme information before selecting investment options.",
                "text_type": "Pension Scheme Documentation",
                "passage": """FUTURESAFE WORKPLACE PENSION
Member Investment Guide
Scheme Year 2025

SECTION 1: YOUR INVESTMENT OPTIONS

1.1 How Your Contributions Are Invested
When you join the FutureSafe scheme, your contributions and your employer's contributions are invested in funds of your choosing. If you don't make a selection, your contributions are automatically invested in the Lifestyle Strategy appropriate to your retirement age.

1.2 Available Investment Approaches

Lifestyle Strategies (Default Options)
Our Lifestyle Strategies automatically adjust your investments as you approach retirement:
- Growth Phase (20+ years to retirement): 80% equities, 20% bonds
- Transition Phase (10-20 years): Gradually shifts to 60% equities, 30% bonds, 10% cash
- Pre-Retirement Phase (0-10 years): Further shifts to 30% equities, 40% bonds, 30% cash

Self-Select Funds
For members who prefer to manage their own investment choices:

Fund Name | Risk Rating | 5-Year Return | Annual Charge
---------|------------|---------------|---------------
Global Equity Growth | High | 8.2% p.a. | 0.35%
UK Equity Index | Medium-High | 5.7% p.a. | 0.12%
Diversified Assets | Medium | 4.9% p.a. | 0.28%
Corporate Bond | Low-Medium | 2.1% p.a. | 0.18%
Cash | Low | 1.3% p.a. | 0.08%
Ethical Global Equity | High | 7.6% p.a. | 0.42%
Property | Medium | 3.4% p.a. | 0.55%
Shariah Compliant | Medium-High | 5.2% p.a. | 0.45%

SECTION 2: UNDERSTANDING RISK

2.1 Investment Risk Categories
- Low Risk: Capital preservation priority; lower growth potential
- Low-Medium Risk: Limited volatility; modest growth expectation
- Medium Risk: Balanced approach; accepts some fluctuation for growth
- Medium-High Risk: Higher volatility accepted for enhanced growth potential
- High Risk: Significant short-term fluctuations possible; highest growth potential

2.2 Important Risk Information
Past performance is not a guide to future performance. The value of investments can fall as well as rise. You may get back less than you invested. Currency movements may affect returns for funds investing overseas. Property funds may suspend dealing during periods of market stress.

2.3 Inflation Risk
Even 'low risk' investments carry inflation risk. If your investments grow more slowly than inflation, your purchasing power decreases. Over a 20-year period, inflation averaging 2.5% would reduce £1,000 to £610 in real terms if investments don't keep pace.

SECTION 3: MAKING CHANGES

3.1 Switching Funds
You may switch between funds at any time without charge. Switches are processed on the next dealing day following receipt of instruction. During volatile markets, switches may take longer.

3.2 Switching Frequency
While unlimited switching is permitted, we recommend against frequent switching as:
- Markets are unpredictable in the short term
- Switching costs are reflected in fund performance
- Emotional decisions often produce poor outcomes

3.3 Changing Your Lifestyle Strategy
You may opt out of the Lifestyle Strategy at any time and select your own funds. Once opted out, you will not be automatically returned to the Lifestyle Strategy unless you specifically request this.

SECTION 4: FEES AND CHARGES

4.1 Annual Management Charges (AMC)
Each fund has an Annual Management Charge deducted daily from the fund value. These are shown in the fund table above. No additional administration charges apply.

4.2 Transaction Costs
In addition to AMCs, funds incur transaction costs when buying and selling underlying investments. These are not deducted separately but affect overall fund performance. Estimated transaction costs range from 0.02% (Cash) to 0.25% (Property).

4.3 Charge Cap
For auto-enrolled members, total charges on default funds are capped at 0.75% annually by regulation.

SECTION 5: GETTING HELP

5.1 Information vs Advice
This guide provides information to help you make decisions. It is not personal financial advice. We cannot recommend specific funds for your circumstances.

5.2 When to Seek Advice
Consider seeking independent financial advice if:
- You have significant pension savings
- You have complex financial circumstances
- You are unsure which options suit your needs
- You are approaching retirement

5.3 Finding an Adviser
The Money and Pensions Service (moneyhelper.org.uk) provides free guidance. For regulated advice, find advisers at the Financial Conduct Authority register (register.fca.org.uk).

---
FutureSafe Pensions Ltd is authorised and regulated by the Financial Conduct Authority (Reference: 654321)
Document Reference: FSP-MIG-2025-01
Last Updated: December 2024""",
                "questions": [
                    {
                        "question": "What percentage of contributions is allocated to equities during the Growth Phase of the Lifestyle Strategy?",
                        "type": "short_answer",
                        "answer": "80%",
                        "explanation": "Section 1.2 states: 'Growth Phase (20+ years to retirement): 80% equities, 20% bonds.'"
                    },
                    {
                        "question": "Which fund has the lowest Annual Management Charge?",
                        "type": "short_answer",
                        "answer": "Cash",
                        "explanation": "The fund table shows Cash has an AMC of 0.08%, the lowest of all funds listed."
                    },
                    {
                        "question": "What is the maximum total charge allowed for auto-enrolled members on default funds?",
                        "type": "multiple_choice",
                        "options": ["0.50%", "0.65%", "0.75%", "1.00%"],
                        "answer": "0.75%",
                        "explanation": "Section 4.3 states: 'total charges on default funds are capped at 0.75% annually.'"
                    },
                    {
                        "question": "According to Section 2.3, what would be the real-terms value of £1,000 after 20 years at 2.5% average inflation if investments don't keep pace?",
                        "type": "short_answer",
                        "answer": "£610",
                        "explanation": "Section 2.3 states: 'inflation averaging 2.5% would reduce £1,000 to £610 in real terms.'"
                    },
                    {
                        "question": "Members are charged a fee for switching between funds.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3.1 states: 'You may switch between funds at any time without charge.'"
                    },
                    {
                        "question": "The guide recommends that members switch funds frequently to maximise returns.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3.2 explicitly states: 'we recommend against frequent switching.'"
                    }
                ]
            }
        },
        "urbanisation": {
            "module_id": "urbanisation",
            "module_title": "Urbanisation: Cities, Infrastructure, and Modern Society",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding planning and development documentation",
            "learning_outcome": "Navigate planning applications, development consultations, and local authority notices.",
            "reading_scenario": {
                "title": "Planning Application Consultation Notice",
                "context": "You have received a notice about a proposed development near your home and need to understand your rights to respond.",
                "text_type": "Planning Consultation Document",
                "passage": """METROPOLITAN BOROUGH COUNCIL
PLANNING SERVICES
Notice of Planning Application

APPLICATION REFERENCE: PL/2024/5678
WARD: Riverside
CASE OFFICER: Sarah Mitchell

NOTICE TO NEIGHBOURING PROPERTIES

The Council has received the following planning application affecting land near your property. You are invited to submit comments.

1. THE PROPOSAL

Site Address: Former Riverside Industrial Estate, Thames Road, Riverside RM1 4AB

Description of Development:
Full planning permission for the demolition of existing industrial buildings and erection of a mixed-use development comprising:
- 245 residential units (35% affordable housing by unit)
- 2,500 sqm commercial floorspace (Class E)
- 89 car parking spaces (basement)
- Public realm improvements including riverside walkway
- Maximum height: 12 storeys (45m)

Applicant: Thames Riverside Developments Ltd
Agent: Urban Planning Associates

2. APPLICATION DOCUMENTS

The following documents are available for public inspection:
- Planning Statement
- Design and Access Statement
- Environmental Statement (including Transport, Noise, Air Quality, Ecology assessments)
- Affordable Housing Statement
- Flood Risk Assessment
- Heritage Impact Assessment
- Daylight and Sunlight Analysis
- Energy Strategy
- Construction Management Plan

Documents can be viewed:
- Online: www.metroborough.gov.uk/planning (search reference PL/2024/5678)
- In person: Planning Reception, Civic Centre, Monday-Friday 9:00-17:00

3. ENVIRONMENTAL IMPACT ASSESSMENT

This application is accompanied by an Environmental Statement prepared under the Town and Country Planning (Environmental Impact Assessment) Regulations 2017. The development is considered EIA development due to its scale and potential environmental effects.

The Environmental Statement assesses impacts including:
- Traffic and transportation
- Air quality during construction and operation
- Noise impacts on existing residents
- Ecology and biodiversity
- Heritage assets
- Landscape and visual amenity

A non-technical summary is available for those who prefer a shorter overview.

4. HOW TO COMMENT

Comments must be submitted by: 15 January 2025

Methods of submission:
- Online: www.metroborough.gov.uk/planning-comments
- Email: planning.comments@metroborough.gov.uk
- Post: Planning Services, Civic Centre, High Street, RM1 1AA

Please quote the application reference (PL/2024/5678) in all correspondence.

5. WHAT COMMENTS SHOULD ADDRESS

Comments should relate to planning considerations, which include:
✓ Impact on visual amenity and character of the area
✓ Traffic generation and parking
✓ Noise, disturbance, and pollution
✓ Overlooking and loss of privacy
✓ Loss of daylight or sunlight
✓ Design quality and scale
✓ Impact on heritage assets

Comments not typically considered:
✗ Effect on property values
✗ Private disputes between neighbours
✗ Competition with existing businesses
✗ The applicant's motives or character
✗ Matters controlled under other legislation (Building Regulations, licensing)

6. THE DECISION PROCESS

This application will be determined by the Planning Committee due to its scale. The anticipated committee date is March 2025, subject to receipt of consultation responses and completion of any necessary agreements.

Before the committee meeting:
- A report will be prepared summarising the proposal, consultee responses, and officer recommendation
- The report will be published 5 working days before the committee
- You may request to speak at committee (3 minutes maximum)

After determination:
- Decision notices are published online within 2 working days
- Refused applications may be appealed by the applicant
- Permission may be subject to conditions and legal agreements

7. DATA PROTECTION

Comments received become public documents and may be:
- Published on the Council website (personal contact details redacted)
- Reported to Planning Committee
- Used in any subsequent appeal

Do not include information you do not wish to be made public.

8. CONTACT

For queries about this application:
Case Officer: Sarah Mitchell
Email: sarah.mitchell@metroborough.gov.uk
Telephone: 020 8XXX XXXX
Public access queries: planning.helpdesk@metroborough.gov.uk

---
This notice is served under Article 15 of the Town and Country Planning (Development Management Procedure) Order 2015.
Date of Notice: 18 December 2024""",
                "questions": [
                    {
                        "question": "How many residential units does the proposed development include?",
                        "type": "short_answer",
                        "answer": "245",
                        "explanation": "Section 1 states: '245 residential units.'"
                    },
                    {
                        "question": "What percentage of the housing will be affordable?",
                        "type": "short_answer",
                        "answer": "35%",
                        "explanation": "Section 1 states: '35% affordable housing by unit.'"
                    },
                    {
                        "question": "By what date must comments be submitted?",
                        "type": "short_answer",
                        "answer": "15 January 2025",
                        "explanation": "Section 4 states: 'Comments must be submitted by: 15 January 2025.'"
                    },
                    {
                        "question": "Which of the following is considered a valid planning consideration?",
                        "type": "multiple_choice",
                        "options": ["Effect on property values", "Impact on visual amenity", "Competition with existing businesses", "The applicant's character"],
                        "answer": "Impact on visual amenity",
                        "explanation": "Section 5 lists 'Impact on visual amenity and character of the area' as a valid consideration."
                    },
                    {
                        "question": "How long may members of the public speak at the Planning Committee?",
                        "type": "short_answer",
                        "answer": "3 minutes",
                        "explanation": "Section 6 states: 'You may request to speak at committee (3 minutes maximum).'"
                    },
                    {
                        "question": "The Environmental Statement is optional for this application.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3 states the application 'is accompanied by an Environmental Statement' and 'is considered EIA development,' implying it is required."
                    }
                ]
            }
        },
        "science_bioethics": {
            "module_id": "science_bioethics",
            "module_title": "Science, Research Ethics, and Biomedical Advances",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding clinical trial and research participation documentation",
            "learning_outcome": "Navigate medical research consent forms, clinical trial information, and patient rights documentation.",
            "reading_scenario": {
                "title": "Clinical Trial Participant Information Sheet",
                "context": "You have been invited to participate in a clinical trial and are reviewing the participant information sheet.",
                "text_type": "Research Participant Information",
                "passage": """PARTICIPANT INFORMATION SHEET

Study Title: A Phase III Randomised Controlled Trial of Novel Compound XR-7721 Versus Standard Treatment for Moderate-to-Severe Rheumatoid Arthritis
Study Reference: ISRCTN12345678 | NHS REC Reference: 24/LO/0567
Chief Investigator: Professor Helen Chen, Royal Free Hospital, London

INVITATION

You are being invited to take part in a research study. Before you decide whether to participate, it is important that you understand why the research is being conducted and what it will involve. Please read this information carefully and discuss it with others if you wish.

PART 1: ESSENTIAL INFORMATION

What is the purpose of this study?
Rheumatoid arthritis affects approximately 400,000 people in the UK. Current treatments are effective for many patients but some do not respond adequately or experience significant side effects. XR-7721 is a new medication that works differently from existing treatments. Early studies suggest it may be effective with fewer side effects. This trial aims to determine whether XR-7721 is more effective than current standard treatment.

Why have I been invited?
You have been invited because you have moderate-to-severe rheumatoid arthritis that has not responded adequately to at least two disease-modifying treatments. We are recruiting 650 participants across 45 hospitals in the UK and Europe.

Do I have to take part?
No. Participation is entirely voluntary. If you decide not to participate, this will not affect your standard care in any way. If you do decide to participate, you may withdraw at any time without giving a reason and without any impact on your future care.

What will happen if I take part?
- You will be randomly allocated (like flipping a coin) to receive either XR-7721 or the standard treatment (methotrexate)
- Neither you nor your doctor will know which treatment you receive ('double-blind')
- You will take study medication for 52 weeks
- You will attend clinic visits at weeks 0, 4, 12, 24, 36, and 52
- Each visit takes approximately 2 hours and includes examination, blood tests, and questionnaires
- After the study, all participants will be offered XR-7721 if it proves effective

What are the possible benefits?
You may benefit from a new treatment that could be more effective than current options. However, we cannot guarantee any direct benefit to you personally. The information from this study will help future patients with rheumatoid arthritis.

What are the possible risks?
Known side effects of XR-7721 from early studies include:
- Common (>1 in 10): Injection site reactions, headache, mild nausea
- Uncommon (1 in 100 to 1 in 10): Upper respiratory infections, elevated liver enzymes (usually temporary)
- Rare (<1 in 100): Serious allergic reactions, serious infections

Blood tests will monitor for any adverse effects. A Data Safety Monitoring Board reviews safety data regularly and can stop the trial if significant concerns arise.

PART 2: ADDITIONAL INFORMATION

What happens when the study ends?
After completing the 52-week treatment period, you will be followed up for an additional 12 weeks to monitor any delayed effects. If XR-7721 proves effective and receives regulatory approval, you will be offered continued access.

What if something goes wrong?
If you are harmed as a direct result of taking part in this study, there are no special compensation arrangements. If you are harmed due to someone's negligence, you may have grounds for legal action. NHS complaints procedures remain available.

Will my information be kept confidential?
Yes. Your personal data will be processed in accordance with UK GDPR. Your medical records may be accessed by authorised research staff and regulatory authorities for verification purposes. Published results will not identify you. Data will be retained for 25 years as required by regulations.

What happens to samples?
Blood samples collected during the study will be used only for this study's purposes. Remaining samples will be stored securely and destroyed after 10 years unless you give separate consent for future research use.

Who has reviewed this study?
This study has been reviewed and approved by the London Central Research Ethics Committee, the Medicines and Healthcare products Regulatory Agency (MHRA), and the Research & Development departments of all participating hospitals.

What if I have concerns?
For concerns about the study: Contact Professor Helen Chen at 020 7XXX XXXX or helen.chen@nhs.net
For independent advice: Contact the Patient Advice and Liaison Service (PALS) at your local hospital
For complaints: Contact the Research Governance Manager at 020 7XXX XXXX

---
Version 4.0 | Date: October 2024
Please retain this information sheet for your records.""",
                "questions": [
                    {
                        "question": "How many participants is the study aiming to recruit?",
                        "type": "short_answer",
                        "answer": "650",
                        "explanation": "Part 1 states: 'We are recruiting 650 participants across 45 hospitals.'"
                    },
                    {
                        "question": "How long is the treatment period of the study?",
                        "type": "short_answer",
                        "answer": "52 weeks",
                        "explanation": "Part 1 states: 'You will take study medication for 52 weeks.'"
                    },
                    {
                        "question": "Which of the following is listed as a common side effect of XR-7721?",
                        "type": "multiple_choice",
                        "options": ["Serious infections", "Elevated liver enzymes", "Injection site reactions", "Serious allergic reactions"],
                        "answer": "Injection site reactions",
                        "explanation": "Part 1 lists 'Injection site reactions' under Common (>1 in 10) side effects."
                    },
                    {
                        "question": "How long will data be retained after the study?",
                        "type": "short_answer",
                        "answer": "25 years",
                        "explanation": "Part 2 states: 'Data will be retained for 25 years as required by regulations.'"
                    },
                    {
                        "question": "Participants will know which treatment they are receiving during the study.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Part 1 states: 'Neither you nor your doctor will know which treatment you receive (\"double-blind\").'"
                    },
                    {
                        "question": "There are special compensation arrangements if participants are harmed during the study.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Part 2 states: 'there are no special compensation arrangements.'"
                    }
                ]
            }
        },
        "public_transport": {
            "module_id": "public_transport",
            "module_title": "Public Transport and Sustainable Infrastructure",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding transport policy and passenger rights documentation",
            "learning_outcome": "Navigate transport compensation schemes, passenger rights, and service level commitments.",
            "reading_scenario": {
                "title": "Rail Passenger Charter",
                "context": "You are reviewing the passenger charter to understand your rights after experiencing service disruptions.",
                "text_type": "Passenger Rights Document",
                "passage": """TRANSCONNECT RAIL
Passenger Charter 2024-2025
Your Rights and Our Commitments

INTRODUCTION

This charter sets out what you can expect from TransConnect Rail and explains your rights when things go wrong. It covers all services operated by TransConnect Rail across our network of 150 stations and 2,400 daily services.

Our commitment: We aim to deliver punctual, reliable services. When we fall short, we commit to transparent communication and fair compensation.

SECTION 1: PERFORMANCE STANDARDS

1.1 Punctuality Targets
- Long-distance services (over 100 miles): 90% within 10 minutes of scheduled arrival
- Regional services: 92% within 5 minutes of scheduled arrival
- Commuter services: 95% within 5 minutes of scheduled arrival

1.2 Reliability Targets
- Cancellation rate: Below 2% of scheduled services
- Short-formed trains: Below 1.5% of services

1.3 Performance Reporting
Actual performance against these targets is published monthly on our website and displayed at major stations. If we fail to meet published targets for three consecutive months, we will implement a fare discount scheme for affected routes.

SECTION 2: DELAY COMPENSATION

2.1 Delay Repay Scheme
You are entitled to compensation for delays regardless of cause:

Delay Duration | Compensation
15-29 minutes | 25% of single fare (or relevant portion of return/season)
30-59 minutes | 50% of single fare
60-119 minutes | 100% of single fare
120+ minutes | 100% of fare plus reasonable additional expenses

Season ticket holders: Calculate based on proportional daily value of your ticket.

2.2 How to Claim
- Online: www.transconnect.co.uk/delayrepay (recommended - fastest processing)
- App: TransConnect app - 'My Journeys' section
- Post: Freepost TRANSCONNECT CLAIMS

Claims must be submitted within 28 days of the delayed journey. You will need your ticket or proof of purchase.

2.3 Processing Times
- Online claims: Decision within 5 working days, payment within 10 working days
- Postal claims: Decision within 20 working days, payment within 28 working days

If we miss these timescales, we will add a 10% goodwill payment to approved claims.

SECTION 3: CANCELLATIONS AND DISRUPTION

3.1 If Your Train Is Cancelled
You may:
- Travel on the next available TransConnect service at no extra cost
- Travel via an alternative route, including other operators (with TransConnect agreement)
- Claim a full refund if you decide not to travel
- Travel on an earlier service if available and accessible

3.2 Major Disruption (planned or unplanned)
During major disruption affecting multiple services:
- Rail replacement buses will be provided where feasible
- We will arrange ticket acceptance on other operators' services
- Staffed stations will have information points
- Real-time updates via app, website, and social media

3.3 Overnight Disruption
If the last service is cancelled and you cannot complete your journey:
- We will arrange overnight accommodation or
- Reimburse reasonable taxi costs to your destination (up to £100)
- Contact our 24-hour helpline: 0800 XXX XXXX

SECTION 4: ADDITIONAL COMMITMENTS

4.1 Accessibility
- Assistance available at all staffed stations (book 2 hours ahead for guaranteed service)
- Accessible toilets at 85% of stations
- Level boarding at 60% of stations (target: 75% by 2027)
- Compensation doubled for accessibility-related delays caused by our failure

4.2 Cleanliness
- Trains cleaned daily; deep-cleaned weekly
- Toilets checked and restocked at terminus stations
- Graffiti removed within 48 hours of report
- Customer satisfaction target: 85% rating 'good' or above

4.3 Information
- Accurate real-time information at stations and on trains
- Announcements of delays exceeding 5 minutes within 3 minutes of occurrence
- Cause of delay provided where known

SECTION 5: MAKING A COMPLAINT

5.1 How to Complain
- Online: www.transconnect.co.uk/feedback
- Email: customerrelations@transconnect.co.uk
- Post: Customer Relations, Freepost TRANSCONNECT CR
- Phone: 0345 XXX XXXX (Monday-Friday 08:00-20:00)

5.2 Response Times
- Acknowledgement: Within 2 working days
- Full response: Within 10 working days (complex cases: 20 working days)

5.3 If You Remain Dissatisfied
If you are unhappy with our response, you may escalate to the Rail Ombudsman (free, independent service): www.railombudsman.org

---
TransConnect Rail Limited
Registered in England: 12345678
This charter is effective 1 April 2024 to 31 March 2025""",
                "questions": [
                    {
                        "question": "What compensation is offered for delays of 30-59 minutes?",
                        "type": "short_answer",
                        "answer": "50% of single fare",
                        "explanation": "Section 2.1 shows: '30-59 minutes | 50% of single fare.'"
                    },
                    {
                        "question": "Within how many days must claims be submitted?",
                        "type": "short_answer",
                        "answer": "28 days",
                        "explanation": "Section 2.2 states: 'Claims must be submitted within 28 days of the delayed journey.'"
                    },
                    {
                        "question": "What is the maximum taxi reimbursement for overnight disruption?",
                        "type": "short_answer",
                        "answer": "£100",
                        "explanation": "Section 3.3 states: 'Reimburse reasonable taxi costs to your destination (up to £100).'"
                    },
                    {
                        "question": "What is the punctuality target for commuter services?",
                        "type": "multiple_choice",
                        "options": ["90% within 10 minutes", "92% within 5 minutes", "95% within 5 minutes", "98% within 5 minutes"],
                        "answer": "95% within 5 minutes",
                        "explanation": "Section 1.1 states: 'Commuter services: 95% within 5 minutes of scheduled arrival.'"
                    },
                    {
                        "question": "How far in advance should assistance be booked for guaranteed service?",
                        "type": "short_answer",
                        "answer": "2 hours",
                        "explanation": "Section 4.1 states: 'book 2 hours ahead for guaranteed service.'"
                    },
                    {
                        "question": "Compensation is only available if delays are caused by the rail company.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 2.1 states: 'You are entitled to compensation for delays regardless of cause.'"
                    }
                ]
            }
        },
        "work_employment": {
            "module_id": "work_employment",
            "module_title": "Work, Employment, and the Changing Nature of Labour",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding employment contracts and workplace rights documentation",
            "learning_outcome": "Navigate employment contracts, redundancy procedures, and workplace grievance documentation.",
            "reading_scenario": {
                "title": "Redundancy Consultation Document",
                "context": "Your employer has announced potential redundancies and you are reviewing the formal consultation document.",
                "text_type": "Employment Consultation Document",
                "passage": """NEXTERA TECHNOLOGIES PLC
Redundancy Consultation Document
Confidential - For Affected Employees Only

Date: 5 December 2024
Consultation Reference: HR/2024/RC-045

SECTION 1: INTRODUCTION

1.1 Purpose of This Document
This document initiates the formal collective consultation process as required under Section 188 of the Trade Union and Labour Relations (Consolidation) Act 1992. It provides information about proposed redundancies and invites your participation in meaningful consultation.

1.2 Background
Following a strategic review of operations, the Board has determined that restructuring is necessary to ensure the company's long-term viability. Market conditions, including a 35% reduction in enterprise software contracts and increased competition, have necessitated cost reduction measures.

1.3 Scope
This consultation affects employees in the Software Development Division, specifically:
- UK Development Centre, Cambridge (68 employees at risk)
- Northern Development Hub, Manchester (34 employees at risk)
- Total employees at risk: 102

SECTION 2: PROPOSALS

2.1 Proposed Redundancies
The company proposes to reduce headcount by up to 45 positions across the affected locations:
- Cambridge: Up to 32 roles
- Manchester: Up to 13 roles

2.2 Affected Roles
- Senior Software Engineers: 12 positions
- Software Engineers: 18 positions
- QA Specialists: 8 positions
- Technical Project Managers: 5 positions
- DevOps Engineers: 2 positions

2.3 Selection Criteria
Where redundancies proceed, selection will be based on:
- Performance ratings (weighted 40%): Average of last three annual reviews
- Skills and qualifications (weighted 30%): Relevance to future business needs
- Attendance record (weighted 15%): Excluding protected absences
- Disciplinary record (weighted 15%): Warnings within last 24 months

Criteria will be applied consistently across all affected employees.

SECTION 3: CONSULTATION PROCESS

3.1 Collective Consultation Period
The minimum consultation period is 45 days (required where 100+ redundancies proposed). Consultation begins 5 December 2024 and cannot conclude before 19 January 2025.

3.2 Consultation Objectives
We will consult with a view to reaching agreement on:
- Ways to avoid dismissals
- Ways to reduce the number of dismissals
- Ways to mitigate the consequences of dismissals

3.3 How to Participate
- Collective consultation: Through your elected employee representatives
- Individual consultation: You will have at least two individual meetings with your line manager and HR
- Written submissions: Email redundancy.consultation@nextera.com

All suggestions will receive written responses within 10 working days.

SECTION 4: ALTERNATIVES BEING CONSIDERED

4.1 Measures to Avoid or Reduce Redundancies
We are actively exploring:
- Voluntary redundancy scheme (enhanced terms available)
- Reduction in working hours (temporary or permanent)
- Redeployment to other roles within the company
- Secondment to partner organisations
- Unpaid leave (sabbatical) options
- Early retirement packages

4.2 Voluntary Redundancy
Employees who volunteer for redundancy by 20 December 2024 will receive enhanced terms:
- Statutory redundancy plus 50% enhancement
- 3 months' salary in lieu of notice (standard notice requirement waived)
- Extended private healthcare coverage (6 months post-termination)
- Outplacement support (6 months)

Voluntary applications are encouraged but acceptance is at the company's discretion based on business needs.

SECTION 5: STATUTORY REDUNDANCY ENTITLEMENTS

5.1 Redundancy Pay Calculation
If redundancy proceeds, statutory entitlements are:
- 0.5 week's pay for each full year employed (under age 22)
- 1 week's pay for each full year employed (age 22-40)
- 1.5 weeks' pay for each full year employed (age 41+)

Maximum service counted: 20 years
Maximum weekly pay: £700 (statutory cap)

5.2 Notice Period
Your contractual notice period will apply, or statutory minimum (1 week per year of service, maximum 12 weeks), whichever is greater.

5.3 Time Off
Employees with 2+ years' service are entitled to reasonable paid time off during notice period to:
- Seek other employment
- Arrange training

SECTION 6: SUPPORT AVAILABLE

6.1 Employee Assistance Programme
Free confidential counselling available 24/7: 0800 XXX XXXX

6.2 Career Transition Support
All affected employees will receive:
- Professional CV writing assistance
- Interview coaching (up to 4 sessions)
- Access to job-matching services
- LinkedIn optimisation workshop

6.3 Financial Advice
Independent financial advice sessions available through ACAS partnership.

SECTION 7: TIMELINE

Key Dates:
- 5 December 2024: Consultation begins
- 20 December 2024: Voluntary redundancy application deadline
- 8 January 2025: Selection pool finalised
- 19 January 2025: Earliest consultation conclusion
- 26 January 2025: Provisional selection decisions communicated
- February 2025: Individual consultation and appeals
- March 2025: Final decisions and termination dates

---
Document prepared by: Human Resources
For queries: redundancy.consultation@nextera.com | HR Hotline: ext. 4500""",
                "questions": [
                    {
                        "question": "How many positions in total does the company propose to make redundant?",
                        "type": "short_answer",
                        "answer": "45",
                        "explanation": "Section 2.1 states: 'The company proposes to reduce headcount by up to 45 positions.'"
                    },
                    {
                        "question": "What is the weighting given to performance ratings in the selection criteria?",
                        "type": "short_answer",
                        "answer": "40%",
                        "explanation": "Section 2.3 states: 'Performance ratings (weighted 40%).'"
                    },
                    {
                        "question": "What is the minimum consultation period for this redundancy process?",
                        "type": "multiple_choice",
                        "options": ["14 days", "30 days", "45 days", "90 days"],
                        "answer": "45 days",
                        "explanation": "Section 3.1 states: 'The minimum consultation period is 45 days.'"
                    },
                    {
                        "question": "By what date must employees apply for voluntary redundancy to receive enhanced terms?",
                        "type": "short_answer",
                        "answer": "20 December 2024",
                        "explanation": "Section 4.2 states: 'Employees who volunteer for redundancy by 20 December 2024 will receive enhanced terms.'"
                    },
                    {
                        "question": "What is the maximum weekly pay used in statutory redundancy calculations?",
                        "type": "short_answer",
                        "answer": "£700",
                        "explanation": "Section 5.1 states: 'Maximum weekly pay: £700 (statutory cap).'"
                    },
                    {
                        "question": "All applications for voluntary redundancy will automatically be accepted.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 4.2 states: 'acceptance is at the company's discretion based on business needs.'"
                    }
                ]
            }
        },
        "social_demographics": {
            "module_id": "social_demographics",
            "module_title": "Social Change and Demographic Shifts",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding social care and support service documentation",
            "learning_outcome": "Navigate care assessment documents, support service agreements, and eligibility criteria.",
            "reading_scenario": {
                "title": "Adult Social Care Assessment Guidance",
                "context": "You are supporting a family member in understanding the social care assessment process.",
                "text_type": "Local Authority Guidance Document",
                "passage": """CITYSHIRE COUNCIL
Adult Social Care
Assessment and Eligibility Guidance
For Adults and Their Families

INTRODUCTION

This guide explains how Cityshire Council assesses adults who may need care and support. It covers who can request an assessment, what happens during the assessment, and how eligibility is determined under the Care Act 2014.

Everyone has the right to request an assessment, regardless of their financial situation or the level of care they may need.

PART 1: REQUESTING AN ASSESSMENT

Who Can Request?
- Any adult who appears to have care and support needs
- A carer who appears to have support needs
- Anyone acting on behalf of an adult (with their consent)

Adults are defined as anyone aged 18 or over. For younger people, different arrangements apply under children's services.

How to Request
- Online: www.cityshire.gov.uk/care-assessment
- Telephone: 0300 XXX XXXX (Monday-Friday 8:30-17:30)
- In person: Any library or council customer service centre
- Via professional: GP, hospital, or other health professional can refer directly

Response Times
- Urgent cases (safeguarding concerns, hospital discharge): Within 24 hours
- Standard cases: Assessment offered within 10 working days
- Complex cases: Assessment offered within 15 working days

PART 2: THE ASSESSMENT PROCESS

What We Assess
The assessment considers:
- Physical, mental, and emotional wellbeing
- Personal dignity and respect
- Physical and mental health
- Protection from abuse and neglect
- Control over day-to-day life
- Participation in work, education, and training
- Social and economic wellbeing
- Domestic, family, and personal relationships
- Suitability of living accommodation

How Assessment Works
1. Initial conversation to understand your situation
2. Home visit by a qualified assessor (usually)
3. Discussion of what matters most to you
4. Review of medical and other relevant information (with consent)
5. Assessment of carer's needs (if applicable)
6. Draft support plan developed with your involvement

You may bring anyone you wish to the assessment. If you have difficulty participating, we will arrange an independent advocate at no cost.

PART 3: ELIGIBILITY DETERMINATION

National Eligibility Criteria
To be eligible for local authority support, you must meet ALL THREE conditions:

Condition 1: Your needs arise from a physical or mental impairment or illness
(This is broadly interpreted and includes long-term conditions, sensory impairments, learning disabilities, mental health conditions, substance dependence, and brain injury)

Condition 2: As a result of your needs, you are unable to achieve TWO OR MORE of these outcomes:
a) Managing and maintaining nutrition
b) Maintaining personal hygiene
c) Managing toilet needs
d) Being appropriately clothed
e) Being able to make use of your home safely
f) Maintaining a habitable home environment
g) Developing and maintaining family or personal relationships
h) Accessing and engaging in work, training, education, or volunteering
i) Making use of necessary facilities or services in the community
j) Carrying out caring responsibilities for a child

'Unable to achieve' means you cannot do it without assistance, can only do it with significant pain or distress, can only do it in a way that endangers yourself or others, or take significantly longer than would normally be expected.

Condition 3: As a consequence, there is a significant impact on your wellbeing

PART 4: AFTER THE ASSESSMENT

If You Are Eligible
- We will develop a care and support plan with you
- The plan will show how your needs will be met
- You may receive a personal budget to arrange your own care
- Options include council-arranged services, direct payments, or a combination

Financial Assessment
- Care services are means-tested (based on your income and savings)
- Anyone with savings below £23,250 may receive financial support
- Capital over £23,250 means you pay the full cost of care (but we can still help arrange services)
- Some services are free regardless of finances (e.g., reablement for first 6 weeks)

If You Are Not Eligible
- We will provide information and advice about other options
- We will signpost to voluntary organisations and community resources
- We will tell you how to request a reassessment if circumstances change
- You have the right to challenge the decision

PART 5: YOUR RIGHTS

You Have the Right To:
- An assessment that focuses on your outcomes and wishes
- Involvement in all decisions about your care
- A copy of your assessment and support plan
- Review of your support at least annually
- Request reassessment at any time if needs change
- Make a complaint if you are unhappy with any aspect

Complaints
- Stage 1: Local resolution with the assessing team
- Stage 2: Formal complaint to Customer Relations
- Stage 3: Local Government Ombudsman (independent review)

Time limits: Complaints should normally be made within 12 months

CONTACT INFORMATION

Adult Social Care Direct: 0300 XXX XXXX
Email: adultsocialcare@cityshire.gov.uk
Out of hours emergencies: 0300 XXX XXXX
Website: www.cityshire.gov.uk/adultsocialcare

---
Publication date: September 2024
Review date: September 2025
Document reference: ASC-ELG-2024-09""",
                "questions": [
                    {
                        "question": "How many outcomes must a person be unable to achieve to meet Condition 2 of the eligibility criteria?",
                        "type": "short_answer",
                        "answer": "Two or more",
                        "explanation": "Part 3 states: 'you are unable to achieve TWO OR MORE of these outcomes.'"
                    },
                    {
                        "question": "Within how many working days is an assessment offered for standard cases?",
                        "type": "short_answer",
                        "answer": "10 working days",
                        "explanation": "Part 1 states: 'Standard cases: Assessment offered within 10 working days.'"
                    },
                    {
                        "question": "What is the capital threshold below which adults may receive financial support?",
                        "type": "short_answer",
                        "answer": "£23,250",
                        "explanation": "Part 4 states: 'Anyone with savings below £23,250 may receive financial support.'"
                    },
                    {
                        "question": "How often must support be reviewed at minimum?",
                        "type": "multiple_choice",
                        "options": ["Every 6 months", "Annually", "Every 2 years", "Every 3 years"],
                        "answer": "Annually",
                        "explanation": "Part 5 states: 'Review of your support at least annually.'"
                    },
                    {
                        "question": "Within how many months should complaints normally be made?",
                        "type": "short_answer",
                        "answer": "12 months",
                        "explanation": "Part 5 states: 'Complaints should normally be made within 12 months.'"
                    },
                    {
                        "question": "Reablement services require a financial assessment before being provided.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Part 4 states: 'Some services are free regardless of finances (e.g., reablement for first 6 weeks).'"
                    }
                ]
            }
        },
        "crime_reintegration": {
            "module_id": "crime_reintegration",
            "module_title": "Criminal Justice: Rehabilitation and Social Reintegration",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding rehabilitation programme documentation and rights",
            "learning_outcome": "Navigate rehabilitation programme agreements, disclosure requirements, and participant rights.",
            "reading_scenario": {
                "title": "Community Rehabilitation Programme Agreement",
                "context": "You are supporting someone reviewing their community rehabilitation programme participation agreement.",
                "text_type": "Programme Participation Agreement",
                "passage": """FORWARD PATHWAYS
Community Rehabilitation Company
Participant Agreement and Information Document

Programme: Employment Preparation and Support (EPS)
Agreement Reference: EPS/2024/3456
Participant: [Name Redacted]
Start Date: 15 November 2024

SECTION A: PROGRAMME OVERVIEW

A1. About This Programme
The Employment Preparation and Support programme helps participants with criminal convictions develop skills and find sustainable employment. The programme is delivered by Forward Pathways under contract with the Ministry of Justice.

A2. Programme Components
Core elements (mandatory):
- Employment readiness assessment (Week 1)
- Skills audit and action planning (Week 2)
- Job search techniques workshop (3 sessions)
- Interview preparation and practice (2 sessions)
- Disclosure guidance (how to discuss your conviction with employers)

Optional elements (based on individual needs):
- Basic literacy and numeracy support
- Digital skills training
- Sector-specific qualifications (construction, catering, retail)
- Financial capability training
- Mentoring from programme graduates

A3. Programme Duration
Standard programme duration: 12 weeks
Maximum extension: Up to 26 weeks for participants making progress
Post-employment support: 6 months of in-work support after securing employment

SECTION B: YOUR COMMITMENTS

B1. Attendance Requirements
You must attend:
- All scheduled appointments and workshops
- At least 80% of optional sessions included in your action plan

B2. Notice Requirements
- Notify us at least 24 hours in advance if you cannot attend
- Provide evidence for any health-related absences
- Rearrange missed sessions within 5 working days

B3. Active Participation
You agree to:
- Engage constructively in all sessions
- Complete agreed tasks between sessions
- Apply for positions identified in job search activities
- Attend all interviews arranged with your support
- Accept suitable employment offers unless reasonable grounds exist

B4. Disclosure of Circumstances
You must inform us promptly of:
- Changes to your address or contact details
- Any new criminal proceedings or convictions
- Changes to your licence conditions (if applicable)
- Any barriers to employment that emerge

SECTION C: OUR COMMITMENTS

C1. Support We Provide
We will:
- Assign you a dedicated Employment Support Worker
- Provide all materials and resources needed for the programme
- Cover reasonable travel costs to programme activities (up to £50/week)
- Provide professional clothing for interviews (one outfit, up to £100 value)
- Support you in preparing for disclosure conversations with employers
- Advocate with employers on your behalf where appropriate

C2. Quality Standards
We commit to:
- Responding to communications within 2 working days
- Reviewing your progress fortnightly
- Adjusting your action plan based on feedback and progress
- Providing written references upon programme completion
- Maintaining confidentiality as set out in Section D

SECTION D: CONFIDENTIALITY AND INFORMATION SHARING

D1. What We Keep Confidential
All information you share with us is treated confidentially, including:
- Your participation in the programme
- Your criminal conviction history
- Personal circumstances discussed in sessions

D2. When We May Share Information
We may share information with:
- Your probation officer/offender manager (if you are under supervision)
- The Ministry of Justice (anonymised data for programme evaluation)
- Other agencies with your explicit written consent
- Authorities if there is a safeguarding concern or legal requirement

D3. Your Data Rights
Under UK GDPR, you have the right to:
- Access information we hold about you
- Correct inaccurate information
- Request deletion (subject to legal retention requirements)
- Object to processing in certain circumstances

SECTION E: BREACH AND CONSEQUENCES

E1. Warning Process
If you fail to meet commitments:
- First instance: Verbal warning and discussion
- Second instance: Written warning and action plan review
- Third instance: Final written warning and formal review meeting
- Continued non-compliance: Programme termination may be considered

E2. Programme Termination
Grounds for immediate termination without warning:
- Threatening or abusive behaviour toward staff or other participants
- Attending sessions under the influence of drugs or alcohol
- Committing further offences during the programme
- Providing deliberately false information

E3. Consequences of Termination
If the programme is terminated:
- We will notify your supervising officer (if applicable)
- Termination may be reported to the court (if programme is a sentence requirement)
- You may be excluded from Forward Pathways programmes for 12 months

SECTION F: COMPLAINTS AND APPEALS

F1. How to Complain
If you are unhappy with any aspect of the programme:
- Stage 1: Discuss with your Employment Support Worker
- Stage 2: Written complaint to Programme Manager (response within 10 days)
- Stage 3: Appeal to Regional Director (response within 15 days)
- External: Contact the Independent Monitoring Board if unresolved

F2. Your Right to Appeal
You may appeal:
- Warning decisions
- Changes to your action plan
- Programme termination decisions

Appeals must be submitted in writing within 14 days of the decision.

---
Forward Pathways CRC is registered with the Ministry of Justice
Data Controller Registration: ZA123456
Document Version: 3.1 | November 2024""",
                "questions": [
                    {
                        "question": "What is the standard programme duration?",
                        "type": "short_answer",
                        "answer": "12 weeks",
                        "explanation": "Section A3 states: 'Standard programme duration: 12 weeks.'"
                    },
                    {
                        "question": "What percentage of optional sessions must participants attend?",
                        "type": "short_answer",
                        "answer": "80%",
                        "explanation": "Section B1 states: 'At least 80% of optional sessions included in your action plan.'"
                    },
                    {
                        "question": "What is the maximum weekly travel cost reimbursement?",
                        "type": "short_answer",
                        "answer": "£50",
                        "explanation": "Section C1 states: 'Cover reasonable travel costs to programme activities (up to £50/week).'"
                    },
                    {
                        "question": "How long is post-employment support provided after securing a job?",
                        "type": "multiple_choice",
                        "options": ["3 months", "6 months", "9 months", "12 months"],
                        "answer": "6 months",
                        "explanation": "Section A3 states: 'Post-employment support: 6 months of in-work support after securing employment.'"
                    },
                    {
                        "question": "Within how many days must appeals be submitted?",
                        "type": "short_answer",
                        "answer": "14 days",
                        "explanation": "Section F2 states: 'Appeals must be submitted in writing within 14 days of the decision.'"
                    },
                    {
                        "question": "Disclosure guidance about discussing convictions with employers is an optional programme component.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section A2 lists 'Disclosure guidance' under 'Core elements (mandatory).'"
                    }
                ]
            }
        },
        "public_health_allocation": {
            "module_id": "public_health_allocation",
            "module_title": "Public Health and Medical Resource Allocation",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding NHS service documentation and patient pathways",
            "learning_outcome": "Navigate NHS referral pathways, waiting list management, and patient choice documentation.",
            "reading_scenario": {
                "title": "NHS Elective Care Patient Information",
                "context": "You have been referred for specialist treatment and are reviewing the patient information about managing your care pathway.",
                "text_type": "NHS Patient Information Document",
                "passage": """NHS MIDLANDS INTEGRATED CARE BOARD
Elective Care Pathway
Patient Information Guide

YOUR REFERRAL AND TREATMENT PATHWAY

This guide explains what happens after your GP or other healthcare professional refers you for specialist assessment or treatment. It covers your rights, choices, and what to expect at each stage.

SECTION 1: YOUR REFERRAL

1.1 Referral Received
Your referral has been received by [Hospital/Service Name]. Within 5 working days, you should receive:
- Acknowledgement of your referral
- Information about next steps
- Approximate waiting time indication

If you have not heard within 10 working days, please contact the Patient Services team (details at end).

1.2 Triage and Prioritisation
Clinical teams review all referrals to determine:
- Clinical urgency (urgent referrals seen within 2 weeks)
- Most appropriate service or specialist
- Whether additional information is needed before appointment

Your GP's referral contains clinical information to help this process. You may be contacted for additional details.

1.3 Your Rights Under the NHS Constitution
You have the right to:
- Start consultant-led treatment within 18 weeks of referral (the RTT target)
- Be seen within 2 weeks for suspected cancer referrals
- Choose which hospital or clinic you attend (see Section 2)
- Access clear information about waiting times

SECTION 2: PATIENT CHOICE

2.1 Choosing Your Provider
For most non-urgent referrals, you can choose where to receive care. Options may include:
- NHS hospitals in your area
- NHS hospitals in other areas
- Some private sector providers delivering NHS-funded care

Your GP can discuss options at the point of referral, or you can change your choice before your first appointment.

2.2 Information to Help You Choose
Consider:
- Waiting times (published on NHS website)
- Location and travel requirements
- Quality ratings (CQC inspection results)
- Patient feedback and experience scores
- Specialist expertise for your condition

2.3 How to Change Your Choice
Contact Patient Services within 14 days of receiving your appointment if you wish to transfer your referral. Please note that changing provider may affect your position on the waiting list.

SECTION 3: WAITING FOR TREATMENT

3.1 The 18-Week Standard
The NHS aims to start treatment within 18 weeks of your GP's referral. The 18-week clock:
- Starts on the date the hospital receives your referral
- Pauses if you choose to delay treatment
- Stops when treatment begins OR you and your consultant agree treatment is not needed

'Treatment' includes procedures, therapies, or a clinical decision that no treatment is required.

3.2 Managing the Wait
While waiting, you can:
- Access physiotherapy or other support services
- Attend pre-assessment appointments (these don't count as treatment start)
- Contact the hospital if your condition changes significantly
- Ask your GP for interim support or pain management

3.3 What If Waiting Time Exceeds 18 Weeks?
If your wait exceeds 18 weeks:
- The hospital should contact you to explain and offer alternatives
- You may be offered treatment at an alternative provider
- You can contact the Patient Advice and Liaison Service (PALS) for support

3.4 Cancellation Policy
If the hospital cancels your operation less than 24 hours before admission:
- They must offer another date within 28 days
- If they cannot, you may request treatment at an alternative hospital funded by them

SECTION 4: YOUR APPOINTMENTS

4.1 Attendance
Please attend all appointments. If you cannot attend:
- Give at least 48 hours' notice if possible
- Call the number on your appointment letter
- Request a new appointment at a time that suits you

4.2 Did Not Attend (DNA) Policy
If you miss appointments without notice:
- First DNA: You will be sent a new appointment
- Second DNA: Your referral may be returned to your GP
- Exceptions apply for clinical urgency and vulnerable patients

4.3 Reasonable Adjustments
If you need adjustments due to disability, communication needs, or other circumstances:
- Let us know when booking
- We will make reasonable adjustments (interpreter, accessible room, longer appointment)
- Contact the Equality Team if adjustments are not met

SECTION 5: KEEPING YOU INFORMED

5.1 Communication
We will contact you by:
- Letter (default for appointment notifications)
- Text message (appointment reminders)
- Email (only with your consent)
- Phone (for urgent matters)

Update your preferences through Patient Services or the NHS App.

5.2 Tracking Your Referral
You can track your referral progress:
- Online: NHS App or hospital patient portal
- Phone: Patient Services helpline

5.3 Escalating Concerns
If you have concerns about delays or care:
1. Contact the service directly (phone number on your letters)
2. Speak to PALS for independent support
3. Make a formal complaint if not resolved
4. Contact NHS England if RTT rights are not met

CONTACT INFORMATION

Patient Services: 01onal XXX XXXX (Monday-Friday 9:00-17:00)
PALS: 01local XXX XXXX
Email: patientservices@nhs.midlands.nhs.uk
Website: www.midlandsicb.nhs.uk/patients

---
Document Version: 2.3 | October 2024
Review Date: October 2025
Accessible formats available on request""",
                "questions": [
                    {
                        "question": "Within how many working days should patients receive acknowledgement of their referral?",
                        "type": "short_answer",
                        "answer": "5 working days",
                        "explanation": "Section 1.1 states: 'Within 5 working days, you should receive: Acknowledgement of your referral.'"
                    },
                    {
                        "question": "What is the NHS target timeframe for starting consultant-led treatment?",
                        "type": "short_answer",
                        "answer": "18 weeks",
                        "explanation": "Section 1.3 states: 'Start consultant-led treatment within 18 weeks of referral.'"
                    },
                    {
                        "question": "Within how many days must patients contact Patient Services to change their provider choice?",
                        "type": "short_answer",
                        "answer": "14 days",
                        "explanation": "Section 2.3 states: 'Contact Patient Services within 14 days of receiving your appointment.'"
                    },
                    {
                        "question": "How soon must the hospital offer a new operation date if they cancel less than 24 hours before admission?",
                        "type": "multiple_choice",
                        "options": ["Within 14 days", "Within 21 days", "Within 28 days", "Within 42 days"],
                        "answer": "Within 28 days",
                        "explanation": "Section 3.4 states: 'They must offer another date within 28 days.'"
                    },
                    {
                        "question": "What happens after a second 'Did Not Attend' without notice?",
                        "type": "multiple_choice",
                        "options": ["Automatic discharge from NHS", "Third appointment offered", "Referral may be returned to GP", "Fine imposed"],
                        "answer": "Referral may be returned to GP",
                        "explanation": "Section 4.2 states: 'Second DNA: Your referral may be returned to your GP.'"
                    },
                    {
                        "question": "Pre-assessment appointments count as the start of treatment under the 18-week clock.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 3.2 states: 'Attend pre-assessment appointments (these don't count as treatment start).'"
                    }
                ]
            }
        },
        "media_journalism": {
            "module_id": "media_journalism",
            "module_title": "The Media Landscape: Journalism, Social Media, and the Public Interest",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding social media platform policies and digital rights",
            "learning_outcome": "Navigate social media terms of service, content moderation policies, and appeal procedures.",
            "reading_scenario": {
                "title": "Social Media Platform Community Guidelines",
                "context": "You are reviewing a social media platform's community guidelines after receiving a content warning.",
                "text_type": "Platform Policy Document",
                "passage": """CONNECTSPHERE
Community Guidelines
Last Updated: November 2024

INTRODUCTION

ConnectSphere is committed to fostering authentic self-expression while maintaining a safe and respectful environment. These Community Guidelines explain what is and isn't allowed on our platform.

Violating these guidelines may result in content removal, account restrictions, or permanent suspension. We use a combination of automated systems and human review to identify potential violations.

SECTION 1: AUTHENTICITY

1.1 Real Identity
ConnectSphere is a platform for authentic identity:
- Accounts must represent real individuals or genuine organisations
- Impersonating others is not permitted
- Misleading profile information may result in account suspension

1.2 Automated Behaviour
- Automated posting is permitted only through approved API access
- Coordinated inauthentic behaviour (fake engagement, artificial amplification) is prohibited
- Accounts suspected of automation may be required to verify identity

1.3 Manipulated Media
Content that has been manipulated to deceive is not permitted:
- Deepfakes or synthetic media presented as authentic
- Deceptively edited video/audio
- Manipulated imagery designed to mislead

Exception: Clearly labelled satire, parody, or artistic expression

SECTION 2: SAFETY

2.1 Violence and Threats
We do not allow:
- Threats of violence against individuals or groups
- Content celebrating or glorifying violence
- Instructions for committing violent acts
- Graphic violence except in documentary or educational contexts (with warnings)

2.2 Harassment and Bullying
Prohibited behaviour includes:
- Targeted harassment of individuals
- Doxxing (sharing private information without consent)
- Sexual harassment or unwanted sexual content
- Encouraging others to harass

2.3 Hate Speech
Content that attacks people based on protected characteristics is not permitted:
- Race, ethnicity, national origin
- Religion
- Sexual orientation or gender identity
- Disability
- Immigration status

We distinguish between hate speech and legitimate discussion of these topics. Context matters in our assessment.

2.4 Self-Harm and Suicide
Content promoting or glorifying self-harm is prohibited. We:
- Remove content encouraging self-harm
- Show support resources on related searches
- May reach out to users who appear to be in crisis
- Allow discussion of personal experiences in recovery contexts

SECTION 3: CONTENT RESTRICTIONS

3.1 Adult Content
- Sexual content is not permitted on ConnectSphere
- Artistic nudity may be permitted with appropriate labelling
- Breastfeeding and post-mastectomy scarring are always allowed
- Sexual solicitation and exploitation are strictly prohibited

3.2 Illegal Activity
Content that facilitates illegal activity is prohibited:
- Drug sales or promotion
- Weapons sales
- Human trafficking
- Fraud and scams

3.3 Misinformation
We reduce the spread of misinformation that could cause harm:
- Health misinformation (especially regarding vaccines, treatments)
- Electoral misinformation during election periods
- Crisis misinformation (natural disasters, emergencies)

Misinformation may be labelled, demoted in distribution, or removed depending on potential harm.

SECTION 4: INTELLECTUAL PROPERTY

4.1 Copyright
- Do not post content that infringes copyright
- Brief clips may qualify as fair use; full videos generally do not
- Music must be licensed or from our royalty-free library

4.2 Reporting Copyright Infringement
Copyright holders may submit DMCA takedown notices. We will:
- Remove or disable access to allegedly infringing content
- Notify the poster
- Provide counter-notification procedures

SECTION 5: ENFORCEMENT

5.1 How We Detect Violations
- Automated systems scan for known violating content
- User reports are reviewed by trained specialists
- Proactive detection for priority violation types (child safety, terrorism)

5.2 Enforcement Actions
Depending on severity and history:
- Warning (first minor violation)
- Content removal
- Feature restrictions (posting, commenting)
- Temporary suspension (24 hours to 30 days)
- Permanent suspension

5.3 Account Strikes
- Strikes are issued for violations
- 3 strikes within 90 days may result in suspension
- Severe violations (terrorism, child exploitation) result in immediate permanent suspension
- Strikes expire after 90 days for first-time violations

SECTION 6: APPEALS

6.1 Appealing Enforcement Actions
If you believe we made an error:
- Use the 'Appeal' button on the violation notice
- Provide context explaining why the content should be allowed
- Appeals are reviewed by a different team from the original decision

6.2 Appeal Timelines
- Appeals must be submitted within 30 days
- We aim to review appeals within 48 hours
- Complex cases may take up to 7 days
- You may submit additional information once during review

6.3 Independent Review
If you disagree with an appeal outcome:
- Eligible decisions can be referred to the Independent Oversight Board
- The Board's decisions are binding on ConnectSphere
- Not all decision types are currently eligible for Board review

---
ConnectSphere Inc.
Community Guidelines Version 8.2
Questions: guidelines@connectsphere.com""",
                "questions": [
                    {
                        "question": "How many strikes within 90 days may result in account suspension?",
                        "type": "short_answer",
                        "answer": "3",
                        "explanation": "Section 5.3 states: '3 strikes within 90 days may result in suspension.'"
                    },
                    {
                        "question": "Within how many days must appeals be submitted?",
                        "type": "short_answer",
                        "answer": "30 days",
                        "explanation": "Section 6.2 states: 'Appeals must be submitted within 30 days.'"
                    },
                    {
                        "question": "What is the target timeframe for reviewing appeals?",
                        "type": "multiple_choice",
                        "options": ["24 hours", "48 hours", "72 hours", "7 days"],
                        "answer": "48 hours",
                        "explanation": "Section 6.2 states: 'We aim to review appeals within 48 hours.'"
                    },
                    {
                        "question": "After how many days do strikes expire for first-time violations?",
                        "type": "short_answer",
                        "answer": "90 days",
                        "explanation": "Section 5.3 states: 'Strikes expire after 90 days for first-time violations.'"
                    },
                    {
                        "question": "The platform allows clearly labelled deepfakes for satire or parody.",
                        "type": "true_false_ng",
                        "answer": "True",
                        "explanation": "Section 1.3 states: 'Exception: Clearly labelled satire, parody, or artistic expression.'"
                    },
                    {
                        "question": "All enforcement decisions are eligible for Independent Oversight Board review.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section 6.3 states: 'Not all decision types are currently eligible for Board review.'"
                    }
                ]
            }
        },
        "tourism_heritage": {
            "module_id": "tourism_heritage",
            "module_title": "Tourism, Cultural Heritage, and Global Mobility",
            "track": "general",
            "level": "advanced",
            "band_target": "7.0-9.0",
            "strategic_focus": "Understanding travel insurance and consumer protection documentation",
            "learning_outcome": "Navigate travel insurance policy documents, claim procedures, and consumer rights.",
            "reading_scenario": {
                "title": "Travel Insurance Policy Wording",
                "context": "You are reviewing your travel insurance policy before making a claim for a disrupted trip.",
                "text_type": "Insurance Policy Document",
                "passage": """GLOBAL TRAVEL PROTECT
Policy Wording Document
Annual Multi-Trip Premier Policy
Policy Year: 2024-2025

SECTION A: TRIP CANCELLATION

A1. What Is Covered
We will pay up to £5,000 per person (£15,000 total for group bookings) for irrecoverable travel and accommodation costs if you are forced to cancel your trip due to:
a) Death, serious illness, or injury of you, a travelling companion, or close relative
b) Jury service or witness summons
c) Redundancy (after 2 years continuous employment)
d) Your home being made uninhabitable
e) Theft of passport within 48 hours of departure
f) Foreign Office advice against travel to your destination (issued after booking)

A2. What Is Not Covered
We will not pay for cancellation due to:
- Disinclination to travel
- Known or foreseeable circumstances at time of booking
- Government action (other than FCDO advice against travel)
- Financial failure of travel provider (see ATOL/ABTA protection)
- Pregnancy (unless complication certified by medical professional)
- Pre-existing medical conditions not declared at policy purchase
- Any condition for which you were awaiting investigation, treatment, or consultation at time of booking

A3. Claims Evidence Required
- Original booking confirmations and receipts
- Cancellation invoice from travel provider
- Medical certificate (for health-related claims)
- Police report (theft/crime-related claims)
- Death certificate (bereavement claims)
- Employer letter (redundancy claims)

SECTION B: TRIP INTERRUPTION AND CURTAILMENT

B1. What Is Covered
We will pay:
- Unused portion of prepaid travel/accommodation (up to £5,000)
- Reasonable additional transport costs to return home early (up to £2,500)
- Reasonable additional accommodation if return is delayed (up to £150 per night, max 5 nights)

B2. Qualifying Events
Cover applies when your trip is cut short due to the same circumstances as Section A1, plus:
- Natural disaster at destination
- Outbreak of infectious disease (WHO-declared)
- Civil unrest or terrorism at destination (occurring after departure)

SECTION C: MEDICAL EXPENSES

C1. Coverage Limits
- Emergency medical treatment: Up to £10,000,000
- Emergency dental treatment: Up to £500 (pain relief only)
- Repatriation costs: Unlimited (when medically necessary)
- Hospital benefit: £50 per 24 hours as inpatient (max £1,500)

C2. What Is Covered
- Treatment by qualified medical practitioners
- Hospital accommodation and treatment
- Medical evacuation when local treatment inadequate
- Accompanying person's travel costs if medically required
- Funeral expenses abroad (up to £3,000) OR repatriation of remains

C3. Conditions
- You must contact our 24-hour emergency line before incurring costs over £500
- Treatment must be medically necessary (not elective or pre-planned)
- Pre-existing conditions covered only if declared and accepted
- Sports and activities: Additional premium required for hazardous activities

SECTION D: TRAVEL DELAY AND MISSED DEPARTURE

D1. Travel Delay
If departure is delayed by more than 12 hours due to circumstances beyond your control:
- £30 per complete 12-hour period delayed
- Maximum £200 per person

After 24 hours delay, you may alternatively claim under Section A (cancellation) for the outbound portion.

D2. Missed Departure
If you miss your departure point due to:
- Public transport failure
- Accident or breakdown of private vehicle
- Weather conditions

We will pay reasonable additional costs to reach your destination (up to £500) OR reimburse unused portions if journey cannot continue.

D3. What Is Not Covered
- Delays caused by strike or industrial action announced before booking
- Your failure to allow sufficient time
- Withdrawal of services by travel provider
- Delay under 12 hours

SECTION E: BAGGAGE AND PERSONAL POSSESSIONS

E1. Coverage Limits
- Total baggage: Up to £2,500
- Single item limit: £350
- Valuables aggregate: £500
- Cash: £250
- Baggage delay (over 12 hours): £150 for essential purchases

E2. Conditions
- Valuables must be in hand luggage or hotel safe
- Items left unattended in vehicles not covered
- Depreciation applied to items over 2 years old
- Pairs and sets: We pay proportional value, not full replacement

SECTION F: MAKING A CLAIM

F1. How to Claim
- Online: www.globaltravelprotect.co.uk/claims (fastest)
- Phone: 0800 XXX XXXX (Monday-Friday 9:00-17:30)
- Post: Claims Department, Freepost GLOBAL TRAVEL

F2. Time Limits
- Notify us within 31 days of the incident
- Submit full claim within 90 days
- Late claims may be rejected unless reasonable excuse

F3. Our Commitment
- Acknowledge claims within 3 working days
- Decision within 10 working days for straightforward claims
- Complex claims: Update every 14 days until resolved

---
Global Travel Protect is a trading name of Insurance Services Ltd
Authorised and regulated by the Financial Conduct Authority (FCA Number: 987654)
Policy Wording Version: GTP-MTP-2024-P""",
                "questions": [
                    {
                        "question": "What is the maximum cancellation cover per person?",
                        "type": "short_answer",
                        "answer": "£5,000",
                        "explanation": "Section A1 states: 'We will pay up to £5,000 per person.'"
                    },
                    {
                        "question": "After how many hours of delay can policyholders alternatively claim under the cancellation section?",
                        "type": "short_answer",
                        "answer": "24 hours",
                        "explanation": "Section D1 states: 'After 24 hours delay, you may alternatively claim under Section A.'"
                    },
                    {
                        "question": "What is the single item limit for baggage claims?",
                        "type": "short_answer",
                        "answer": "£350",
                        "explanation": "Section E1 states: 'Single item limit: £350.'"
                    },
                    {
                        "question": "Within how many days must claims be notified?",
                        "type": "multiple_choice",
                        "options": ["14 days", "21 days", "31 days", "60 days"],
                        "answer": "31 days",
                        "explanation": "Section F2 states: 'Notify us within 31 days of the incident.'"
                    },
                    {
                        "question": "What is the hospital benefit payment rate?",
                        "type": "short_answer",
                        "answer": "£50 per 24 hours",
                        "explanation": "Section C1 states: 'Hospital benefit: £50 per 24 hours as inpatient.'"
                    },
                    {
                        "question": "The policy covers cancellation due to pregnancy regardless of complications.",
                        "type": "true_false_ng",
                        "answer": "False",
                        "explanation": "Section A2 states: 'Pregnancy (unless complication certified by medical professional)' is not covered without complications."
                    }
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
