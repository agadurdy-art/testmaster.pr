# Mastery Level General Training Reading Question Bank
# Band Range: 6.0-7.0 (Intermediate-Advanced)
# Content: Professional documents, workplace notices, advertisements, policies

"""
General Training Reading focuses on:
- Section 1: Social survival (notices, advertisements, timetables)
- Section 2: Workplace survival (job descriptions, contracts, policies)
- Section 3: General reading (more complex texts)
"""

from .reading_mastery_academic import READING_QUESTION_TYPES, READING_TOPICS, MASTERY_BAND_LEVELS

# General Training specific document types
GT_DOCUMENT_TYPES = {
    "notice": {"name": "Public Notice", "icon": "📋"},
    "advertisement": {"name": "Advertisement", "icon": "📢"},
    "policy": {"name": "Company Policy", "icon": "📑"},
    "contract": {"name": "Contract/Agreement", "icon": "📝"},
    "job_description": {"name": "Job Description", "icon": "💼"},
    "instruction": {"name": "Instructions/Manual", "icon": "📖"},
    "letter": {"name": "Formal Letter", "icon": "✉️"},
    "report": {"name": "Report", "icon": "📊"}
}

MASTERY_GENERAL_READING = {
    "workplace_mc": {
        "module_id": "workplace_mc",
        "topic": "business",
        "question_type": "multiple_choice",
        "document_type": "policy",
        "band_target": "6.0-7.0",
        "track": "general",
        "title": "Employee Remote Work Policy",
        "text_type": "Company Policy Document",
        "word_count": 580,
        "context": "You are a new employee reviewing your company's remote work policy.",
        "passage": """GREENFIELD TECHNOLOGIES LTD
REMOTE WORK POLICY
Effective Date: 1 January 2024
Policy Reference: HR-2024-017

1. PURPOSE AND SCOPE
This policy establishes guidelines for employees who work remotely, either on a full-time basis or through a hybrid arrangement. It applies to all permanent staff members who have completed their probationary period of three months and received approval from their line manager.

2. ELIGIBILITY REQUIREMENTS
Employees may apply for remote work arrangements if their role permits tasks to be performed outside the office. Positions requiring physical presence, such as reception, facilities management, and laboratory work, are excluded from this policy. All applications must be submitted through the HR portal at least two weeks before the intended start date.

3. EQUIPMENT AND EXPENSES
The company will provide essential equipment including a laptop computer and, where necessary, a second monitor. Employees are responsible for ensuring they have adequate internet connectivity, with a minimum speed of 50 Mbps recommended. A monthly allowance of £50 will be paid to cover additional utility costs associated with home working. This allowance is subject to tax and will be included in regular salary payments.

4. WORKING HOURS AND AVAILABILITY
Remote workers must be available during core business hours of 10:00 AM to 3:00 PM, Monday to Friday. Outside these hours, employees may arrange their schedule flexibly, provided they complete their contracted weekly hours. All employees must respond to urgent communications within two hours during working days.

5. HEALTH AND SAFETY
Employees working from home are responsible for maintaining a safe working environment. The company will provide guidance on workstation setup and offer virtual ergonomic assessments upon request. Any work-related injuries occurring in the home office must be reported immediately following standard incident procedures.

6. DATA SECURITY
All company data must be handled in accordance with existing information security policies. Remote workers must use the company VPN when accessing internal systems and must not work from public Wi-Fi networks. Confidential documents should not be printed at home unless specifically authorized.

7. REVIEW AND TERMINATION
Remote work arrangements will be reviewed annually. The company reserves the right to require employees to return to office-based work with 30 days' notice if business needs change or if performance standards are not maintained.""",
        "questions": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "Who is eligible to apply for remote work under this policy?",
                "options": [
                    "A) All employees from their first day",
                    "B) Employees who have completed three months and have manager approval",
                    "C) Only senior management staff",
                    "D) Temporary contract workers"
                ],
                "answer": "B",
                "explanation": "The policy states employees 'who have completed their probationary period of three months and received approval from their line manager.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 2,
                "type": "multiple_choice",
                "question": "What equipment does the company NOT provide?",
                "options": [
                    "A) Laptop computer",
                    "B) Second monitor",
                    "C) Internet connection",
                    "D) VPN access"
                ],
                "answer": "C",
                "explanation": "The policy states 'Employees are responsible for ensuring they have adequate internet connectivity.'",
                "skill_tested": ["Factual Detail Retrieval", "Inference"]
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "When must employees definitely be available?",
                "options": [
                    "A) 9:00 AM to 5:00 PM",
                    "B) 10:00 AM to 3:00 PM",
                    "C) 8:00 AM to 4:00 PM",
                    "D) Any eight hours of their choice"
                ],
                "answer": "B",
                "explanation": "Section 4 specifies 'core business hours of 10:00 AM to 3:00 PM.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 4,
                "type": "multiple_choice",
                "question": "What is the monthly home working allowance?",
                "options": [
                    "A) £30",
                    "B) £40",
                    "C) £50",
                    "D) £100"
                ],
                "answer": "C",
                "explanation": "Section 3 states 'A monthly allowance of £50 will be paid.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 5,
                "type": "multiple_choice",
                "question": "What is prohibited regarding data security?",
                "options": [
                    "A) Using the company VPN",
                    "B) Working from public Wi-Fi networks",
                    "C) Accessing internal systems",
                    "D) Using a laptop computer"
                ],
                "answer": "B",
                "explanation": "Section 6 states employees 'must not work from public Wi-Fi networks.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 6,
                "type": "multiple_choice",
                "question": "How much notice is required if the company ends a remote work arrangement?",
                "options": [
                    "A) Two weeks",
                    "B) 30 days",
                    "C) Three months",
                    "D) Immediate effect"
                ],
                "answer": "B",
                "explanation": "Section 7 states the company may 'require employees to return to office-based work with 30 days' notice.'",
                "skill_tested": ["Factual Detail Retrieval"]
            }
        ],
        "vocabulary_focus": [
            {"term": "probationary period", "meaning": "A trial period at the start of employment", "context": "Completed their probationary period"},
            {"term": "ergonomic", "meaning": "Designed for efficiency and comfort in the working environment", "context": "Virtual ergonomic assessments"},
            {"term": "VPN", "meaning": "Virtual Private Network - secure connection for remote access", "context": "Must use the company VPN"}
        ],
        "reading_tips": [
            "Scan section headings to locate relevant information quickly",
            "Pay attention to specific numbers, dates, and conditions",
            "Look for exceptions and exclusions in policy documents"
        ]
    },
    "notice_tfng": {
        "module_id": "notice_tfng",
        "topic": "society",
        "question_type": "true_false_ng",
        "document_type": "notice",
        "band_target": "6.0-7.0",
        "track": "general",
        "title": "Community Centre Events and Facilities",
        "text_type": "Public Notice Board",
        "word_count": 520,
        "context": "You have just moved to a new neighborhood and are reading notices at your local community centre.",
        "passage": """RIVERSIDE COMMUNITY CENTRE
Opening Hours & Facilities Information

GENERAL OPENING HOURS
Monday to Friday: 8:00 AM - 9:00 PM
Saturday: 9:00 AM - 6:00 PM
Sunday: 10:00 AM - 4:00 PM
Bank Holidays: Closed

MEMBERSHIP FEES (Annual)
Adult (18-64): £120
Senior (65+): £80
Student (with valid ID): £60
Family (2 adults + up to 3 children): £250
Day passes available for non-members: £8 per visit

FITNESS CENTRE
Our recently renovated fitness centre features 30 pieces of cardiovascular equipment, a free weights area, and a dedicated stretching zone. Personal training sessions can be booked at £35 per hour. All new members receive a complimentary fitness assessment during their first visit.

SWIMMING POOL
25-metre heated indoor pool
Lane swimming: 6:30 AM - 8:30 AM and 12:00 PM - 2:00 PM (weekdays)
General swimming: All other opening hours
Children under 8 must be accompanied by an adult
Swimming lessons available - see reception for current timetable

ROOM HIRE
Meeting rooms and the main hall are available for private hire. Rates vary depending on the day and duration. Members receive a 15% discount on all room bookings. Please book at least one week in advance. A refundable deposit of £100 is required for all bookings.

UPCOMING EVENTS
Art Exhibition: Local Artists Showcase - 15-22 March (Free entry)
Charity Quiz Night - Saturday 25 March, 7:00 PM (£5 per person, teams of up to 6)
Spring Fair - Sunday 2 April, 11:00 AM - 4:00 PM (Free entry, various stalls)
Children's Drama Workshop - Every Saturday, 2:00 PM - 4:00 PM (£8 per session)

CAFÉ
The Riverside Café serves hot and cold drinks, light meals, and snacks daily. Members receive 10% off all purchases. Free Wi-Fi available throughout the centre.

PARKING
Free parking for members in the rear car park (display membership card). Non-member parking: £2 per hour in the public car park adjacent to the centre.""",
        "questions": [
            {
                "id": 1,
                "type": "true_false_ng",
                "question": "The community centre is open every day of the week.",
                "answer": "False",
                "explanation": "The notice states the centre is 'Closed' on Bank Holidays.",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 2,
                "type": "true_false_ng",
                "question": "A family membership costs less than three individual adult memberships.",
                "answer": "True",
                "explanation": "Family membership is £250, while three adult memberships would be £360 (3 × £120).",
                "skill_tested": ["Calculation", "Comparison"]
            },
            {
                "id": 3,
                "type": "true_false_ng",
                "question": "New members must pay extra for their initial fitness assessment.",
                "answer": "False",
                "explanation": "The notice states members receive 'a complimentary fitness assessment' (complimentary means free).",
                "skill_tested": ["Vocabulary", "Factual Detail"]
            },
            {
                "id": 4,
                "type": "true_false_ng",
                "question": "Lane swimming is only available in the mornings.",
                "answer": "False",
                "explanation": "Lane swimming is available '6:30 AM - 8:30 AM and 12:00 PM - 2:00 PM' (both morning and lunchtime).",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 5,
                "type": "true_false_ng",
                "question": "The Art Exhibition requires advance booking.",
                "answer": "Not Given",
                "explanation": "The notice mentions 'Free entry' but doesn't specify whether booking is required.",
                "skill_tested": ["Not Given Recognition"]
            },
            {
                "id": 6,
                "type": "true_false_ng",
                "question": "Members can park for free if they show their membership card.",
                "answer": "True",
                "explanation": "The notice states 'Free parking for members in the rear car park (display membership card).'",
                "skill_tested": ["Factual Detail Retrieval"]
            }
        ],
        "vocabulary_focus": [
            {"term": "complimentary", "meaning": "Given free as a courtesy", "context": "Complimentary fitness assessment"},
            {"term": "refundable", "meaning": "Able to be returned or paid back", "context": "Refundable deposit"},
            {"term": "adjacent", "meaning": "Next to or beside", "context": "Car park adjacent to the centre"}
        ],
        "reading_tips": [
            "Read each statement carefully - one wrong word can change the answer",
            "For Not Given, ensure the information truly isn't there (not just implied)",
            "Pay attention to qualifiers like 'all', 'only', 'always'"
        ]
    },
    "job_matching": {
        "module_id": "job_matching",
        "topic": "business",
        "question_type": "matching_information",
        "document_type": "job_description",
        "band_target": "6.0-7.0",
        "track": "general",
        "title": "Job Vacancy Listings",
        "text_type": "Employment Section",
        "word_count": 600,
        "context": "You are looking for a new job and browsing the employment section of a local newspaper.",
        "passage": """JOB VACANCY LISTINGS - WEEK ENDING 15 MARCH

POSITION A: Marketing Coordinator
Bright Solutions Ltd is seeking a Marketing Coordinator to join our growing team. The successful candidate will manage social media accounts, coordinate marketing campaigns, and assist with event planning. Previous experience in digital marketing is essential, and familiarity with graphic design software is advantageous. This is a full-time position with a starting salary of £28,000. Applications close 22 March.

POSITION B: Customer Service Representative
Join our award-winning customer service team at TechSupport Plus. We're looking for patient, articulate individuals to handle customer inquiries via phone and email. No previous experience required as full training is provided. Shift work required, including some evenings and weekends. Competitive salary plus performance bonuses. Immediate start available for the right candidate.

POSITION C: Administrative Assistant
A busy medical practice requires an Administrative Assistant to handle patient appointments, manage correspondence, and maintain records. The ideal candidate will have excellent organizational skills and be comfortable using standard office software. Previous experience in a healthcare setting is preferred but not essential. Part-time hours (20 hours per week) available, with potential to increase to full-time.

POSITION D: Warehouse Operative
FastShip Logistics has multiple positions available in our distribution centre. Duties include picking and packing orders, stock management, and loading vehicles. Forklift license holders will receive a higher rate of pay. Physical fitness required as the role involves manual handling. Day and night shifts available. Weekly pay with overtime opportunities.

POSITION E: Junior Accountant
Mitchell & Partners, a well-established accounting firm, has an opening for a Junior Accountant. Candidates must hold a relevant degree or be studying towards an accounting qualification. Responsibilities include preparing financial statements, processing invoices, and assisting senior accountants during audit season. Excellent career progression opportunities and study support offered.""",
        "questions": [
            {
                "id": 1,
                "type": "matching_information",
                "question": "Which position offers training for people with no experience?",
                "answer": "B",
                "explanation": "Position B states 'No previous experience required as full training is provided.'",
                "skill_tested": ["Information Matching", "Scanning"]
            },
            {
                "id": 2,
                "type": "matching_information",
                "question": "Which position mentions support for further education?",
                "answer": "E",
                "explanation": "Position E offers 'study support' for accounting qualifications.",
                "skill_tested": ["Information Matching", "Scanning"]
            },
            {
                "id": 3,
                "type": "matching_information",
                "question": "Which position involves managing social media?",
                "answer": "A",
                "explanation": "Position A requires the candidate to 'manage social media accounts.'",
                "skill_tested": ["Information Matching", "Scanning"]
            },
            {
                "id": 4,
                "type": "matching_information",
                "question": "Which position offers extra pay for a specific qualification?",
                "answer": "D",
                "explanation": "Position D states 'Forklift license holders will receive a higher rate of pay.'",
                "skill_tested": ["Information Matching", "Scanning"]
            },
            {
                "id": 5,
                "type": "matching_information",
                "question": "Which position could potentially become full-time?",
                "answer": "C",
                "explanation": "Position C offers 'Part-time hours (20 hours per week) available, with potential to increase to full-time.'",
                "skill_tested": ["Information Matching", "Scanning"]
            },
            {
                "id": 6,
                "type": "matching_information",
                "question": "Which position requires working non-standard hours?",
                "answer": "B",
                "explanation": "Position B mentions 'Shift work required, including some evenings and weekends.'",
                "skill_tested": ["Information Matching", "Scanning"]
            }
        ],
        "vocabulary_focus": [
            {"term": "articulate", "meaning": "Able to express thoughts clearly", "context": "Patient, articulate individuals"},
            {"term": "correspondence", "meaning": "Written communication such as letters and emails", "context": "Manage correspondence"},
            {"term": "audit", "meaning": "Official examination of financial records", "context": "During audit season"}
        ],
        "reading_tips": [
            "Underline key words in each question before scanning",
            "Remember one paragraph may match multiple questions",
            "Check that your answer matches all parts of the question"
        ]
    },
    "instruction_completion": {
        "module_id": "instruction_completion",
        "topic": "society",
        "question_type": "sentence_completion",
        "document_type": "instruction",
        "band_target": "6.0-7.0",
        "track": "general",
        "title": "Library Card Application Guide",
        "text_type": "Instructions/Guide",
        "word_count": 480,
        "context": "You want to join your local library and are reading the application guide.",
        "passage": """MEADOWBROOK PUBLIC LIBRARY
How to Apply for a Library Card

ELIGIBILITY
Anyone who lives, works, or studies in Meadowbrook District is eligible for a free library card. Visitors from neighboring districts may apply for a temporary card with a refundable deposit of £25.

WHAT YOU NEED TO BRING
To register for a library card, you must present valid photo identification (passport, driving license, or national ID card) along with proof of your current address. Acceptable address documents include a recent utility bill, bank statement, or official letter dated within the last three months. Students should also bring their current student ID or enrollment letter.

APPLICATION PROCESS
1. Visit any Meadowbrook Library branch during opening hours
2. Complete the registration form (available at the service desk or download from our website)
3. Present your identification documents to a staff member
4. Have your photograph taken (used for your library card only)
5. Receive your temporary card immediately - your permanent card with photo will arrive by post within 14 days

BORROWING LIMITS
Standard adult cards allow you to borrow up to 20 items at once, including books, DVDs, and audiobooks. The loan period for books is three weeks, while DVDs and audiobooks must be returned within one week. Children's cards (under 16) permit 10 items with the same loan periods.

RENEWALS AND RESERVATIONS
Items can be renewed up to twice, either online, by phone, or in person, provided no other user has reserved them. To reserve items currently on loan, log into your account on our website or ask at the service desk. You will be notified by email or text message when your reservation is ready for collection.

FINES AND REPLACEMENT COSTS
Late returns incur a fine of 20p per day per item, up to a maximum of £5 per item. Lost or damaged items must be paid for at current replacement cost. Library cards reported lost or stolen will be cancelled immediately, and a replacement card costs £3.""",
        "questions": [
            {
                "id": 1,
                "type": "sentence_completion",
                "question": "Visitors from other districts must pay a deposit of ___.",
                "answer": "£25",
                "word_limit": 1,
                "explanation": "The passage states 'a refundable deposit of £25.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 2,
                "type": "sentence_completion",
                "question": "Address documents must be dated within the last ___.",
                "answer": "three months",
                "word_limit": 2,
                "explanation": "The passage states 'dated within the last three months.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 3,
                "type": "sentence_completion",
                "question": "Your permanent library card will be sent within ___.",
                "answer": "14 days",
                "word_limit": 2,
                "explanation": "The passage states the permanent card 'will arrive by post within 14 days.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 4,
                "type": "sentence_completion",
                "question": "DVDs must be returned within ___.",
                "answer": "one week",
                "word_limit": 2,
                "explanation": "The passage states 'DVDs and audiobooks must be returned within one week.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 5,
                "type": "sentence_completion",
                "question": "Items can be renewed a maximum of ___ times.",
                "answer": "twice/two",
                "word_limit": 1,
                "explanation": "The passage states 'Items can be renewed up to twice.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 6,
                "type": "sentence_completion",
                "question": "The maximum late fine per item is ___.",
                "answer": "£5",
                "word_limit": 1,
                "explanation": "The passage states 'up to a maximum of £5 per item.'",
                "skill_tested": ["Factual Detail Retrieval"]
            }
        ],
        "vocabulary_focus": [
            {"term": "refundable", "meaning": "Can be returned/paid back", "context": "Refundable deposit"},
            {"term": "incur", "meaning": "To become subject to (something unwelcome)", "context": "Late returns incur a fine"},
            {"term": "enrollment", "meaning": "The act of officially joining a course or institution", "context": "Enrollment letter"}
        ],
        "reading_tips": [
            "Look for specific numbers, dates, and amounts",
            "Use the word limit to guide your answer format",
            "Copy words exactly as they appear in the passage"
        ]
    }
}

# Helper functions
def get_all_mastery_general_modules():
    """Return summary of all Mastery General Reading modules"""
    modules = []
    for key, module in MASTERY_GENERAL_READING.items():
        modules.append({
            "module_id": module["module_id"],
            "topic": module["topic"],
            "question_type": module["question_type"],
            "document_type": module.get("document_type", "general"),
            "title": module["title"],
            "band_target": module["band_target"],
            "track": module["track"],
            "text_type": module["text_type"],
            "question_count": len(module.get("questions", []))
        })
    return modules

def get_mastery_general_by_id(module_id):
    """Get specific Mastery General Reading module by ID"""
    return MASTERY_GENERAL_READING.get(module_id)

def get_mastery_general_by_topic(topic):
    """Get all modules for a specific topic"""
    return [m for m in MASTERY_GENERAL_READING.values() if m["topic"] == topic]

def get_mastery_general_by_question_type(question_type):
    """Get all modules for a specific question type"""
    return [m for m in MASTERY_GENERAL_READING.values() if m["question_type"] == question_type]

def get_gt_document_types():
    """Return all General Training document types"""
    return GT_DOCUMENT_TYPES
