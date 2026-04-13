"""
IELTS Listening Question Bank Content
=====================================
Structured listening sets following IELTS Part 1-4 format.
Each set includes: audio script, questions, answers, and metadata.
"""

from typing import Dict, List, Any

# Question Types for Listening
LISTENING_QUESTION_TYPES = {
    "multiple_choice": {
        "name": "Multiple Choice",
        "code": "MC",
        "description": "Choose the correct answer from options A, B, C, or D",
        "icon": "🔘"
    },
    "form_completion": {
        "name": "Form/Note Completion",
        "code": "FC",
        "description": "Complete forms, notes, or tables with missing information",
        "icon": "📝"
    },
    "sentence_completion": {
        "name": "Sentence Completion",
        "code": "SC",
        "description": "Complete sentences with words from the audio",
        "icon": "✏️"
    },
    "matching": {
        "name": "Matching",
        "code": "MT",
        "description": "Match items from two lists",
        "icon": "🔗"
    },
    "plan_map_labeling": {
        "name": "Plan/Map Labeling",
        "code": "PL",
        "description": "Label a plan, map, or diagram",
        "icon": "🗺️"
    },
    "short_answer": {
        "name": "Short Answer",
        "code": "SA",
        "description": "Answer questions with a few words",
        "icon": "💬"
    }
}

# IELTS Listening Parts Structure
LISTENING_PARTS = {
    "part1": {
        "name": "Part 1",
        "description": "Social/transactional conversation between two speakers",
        "difficulty": "easier",
        "typical_scenarios": ["booking", "enquiry", "registration"]
    },
    "part2": {
        "name": "Part 2",
        "description": "Monologue in a social context",
        "difficulty": "moderate",
        "typical_scenarios": ["tour guide", "announcement", "description"]
    },
    "part3": {
        "name": "Part 3",
        "description": "Discussion between 2-4 speakers in educational/training context",
        "difficulty": "challenging",
        "typical_scenarios": ["tutorial", "seminar", "group discussion"]
    },
    "part4": {
        "name": "Part 4",
        "description": "Academic lecture or talk",
        "difficulty": "most challenging",
        "typical_scenarios": ["lecture", "presentation", "academic talk"]
    }
}

# ============ BAND 4.0-5.0 LISTENING SETS ============

BAND_4_5_SETS = [
    {
        "set_id": "ls_b45_001",
        "band_range": "4.0-5.0",
        "part": "part1",
        "title": "Hotel Reservation",
        "topic": "travel",
        "duration_seconds": 180,
        "question_types": ["form_completion"],
        "speakers": [
            {"id": "receptionist", "gender": "female", "accent": "british"},
            {"id": "guest", "gender": "male", "accent": "american"}
        ],
        "transcript": """Receptionist: Good morning, Riverside Hotel. How may I help you?

Guest: Hello, I'd like to book a room please.

Receptionist: Of course, sir. When would you like to stay?

Guest: From the 15th to the 18th of March.

Receptionist: That's three nights. And what type of room would you prefer?

Guest: A double room, please.

Receptionist: We have a standard double at 85 pounds per night, or a deluxe double with a sea view at 120 pounds.

Guest: The standard double is fine.

Receptionist: Excellent. Could I have your name, please?

Guest: Yes, it's Michael Thompson. That's T-H-O-M-P-S-O-N.

Receptionist: And a contact number?

Guest: 07845 223 156.

Receptionist: Perfect. Would you like breakfast included? It's an extra 15 pounds per person.

Guest: Yes, please. Just for one person.

Receptionist: And how would you like to pay?

Guest: By credit card when I arrive.

Receptionist: That's all confirmed. Your booking reference is HRB2847.""",
        "questions": [
            {
                "id": "q1",
                "type": "form_completion",
                "question": "Check-in date: _____ March",
                "answer": "15th",
                "answer_variants": ["15", "15th", "the 15th"],
                "skill_tested": ["specific information", "numbers"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "Number of nights: _____",
                "answer": "3",
                "answer_variants": ["3", "three"],
                "skill_tested": ["calculation", "numbers"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "Room type: _____ double",
                "answer": "standard",
                "answer_variants": ["standard"],
                "skill_tested": ["specific information"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Price per night: £_____",
                "answer": "85",
                "answer_variants": ["85", "eighty-five"],
                "skill_tested": ["numbers", "prices"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Guest surname: _____",
                "answer": "Thompson",
                "answer_variants": ["Thompson", "THOMPSON"],
                "skill_tested": ["spelling", "names"]
            },
            {
                "id": "q6",
                "type": "form_completion",
                "question": "Phone number: 07845 _____",
                "answer": "223 156",
                "answer_variants": ["223156", "223 156"],
                "skill_tested": ["numbers", "phone numbers"]
            },
            {
                "id": "q7",
                "type": "form_completion",
                "question": "Booking reference: _____",
                "answer": "HRB2847",
                "answer_variants": ["HRB2847", "hrb2847"],
                "skill_tested": ["alphanumeric codes"]
            }
        ],
        "tips": [
            "Listen for numbers carefully - they are often repeated",
            "Pay attention to spelling of names",
            "Write no more than the word limit specified"
        ]
    },
    {
        "set_id": "ls_b45_002",
        "band_range": "4.0-5.0",
        "part": "part1",
        "title": "Library Membership",
        "topic": "education",
        "duration_seconds": 200,
        "question_types": ["form_completion", "multiple_choice"],
        "speakers": [
            {"id": "librarian", "gender": "female", "accent": "british"},
            {"id": "student", "gender": "male", "accent": "british"}
        ],
        "transcript": """Librarian: Hello, welcome to the City Library. How can I help you today?

Student: Hi, I'd like to register for a library card please.

Librarian: Certainly. Are you a student or a regular member?

Student: I'm a student at the university.

Librarian: Great, student membership is free. I'll just need some details. Your full name?

Student: James Wilson.

Librarian: And your date of birth?

Student: The 22nd of September, 1999.

Librarian: Your current address?

Student: 45 Oak Street, Apartment 3B.

Librarian: And the postcode?

Student: NW3 5PT.

Librarian: Your student ID number?

Student: It's STU78432.

Librarian: Perfect. With student membership, you can borrow up to 8 books at a time. The loan period is 3 weeks, and you can renew online twice. Late returns are 20 pence per day per book.

Student: Can I also access the online resources?

Librarian: Yes, you'll get full access to our digital library including e-books and academic journals.

Student: That's great. When will my card be ready?

Librarian: You can collect it tomorrow after 2 PM.""",
        "questions": [
            {
                "id": "q1",
                "type": "form_completion",
                "question": "Membership type: _____",
                "answer": "student",
                "answer_variants": ["student"],
                "skill_tested": ["specific information"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "Date of birth: 22nd September _____",
                "answer": "1999",
                "answer_variants": ["1999"],
                "skill_tested": ["dates", "numbers"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "Address: 45 _____ Street, Apartment 3B",
                "answer": "Oak",
                "answer_variants": ["Oak", "oak"],
                "skill_tested": ["addresses"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Student ID: _____",
                "answer": "STU78432",
                "answer_variants": ["STU78432", "stu78432"],
                "skill_tested": ["alphanumeric codes"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Maximum books to borrow: _____",
                "answer": "8",
                "answer_variants": ["8", "eight"],
                "skill_tested": ["numbers"]
            },
            {
                "id": "q6",
                "type": "form_completion",
                "question": "Loan period: _____ weeks",
                "answer": "3",
                "answer_variants": ["3", "three"],
                "skill_tested": ["numbers", "time"]
            },
            {
                "id": "q7",
                "type": "multiple_choice",
                "question": "When can the student collect the library card?",
                "options": [
                    "A) Today after 2 PM",
                    "B) Tomorrow after 2 PM",
                    "C) Next week",
                    "D) In 3 days"
                ],
                "answer": "B",
                "skill_tested": ["specific information", "time"]
            }
        ],
        "tips": [
            "Listen for postcodes carefully - UK format is letters and numbers",
            "Student IDs often contain letters and numbers",
            "Pay attention to time expressions"
        ]
    },
    {
        "set_id": "ls_b45_003",
        "band_range": "4.0-5.0",
        "part": "part2",
        "title": "Museum Tour Introduction",
        "topic": "culture",
        "duration_seconds": 220,
        "question_types": ["multiple_choice", "matching"],
        "speakers": [
            {"id": "guide", "gender": "female", "accent": "british"}
        ],
        "transcript": """Good morning everyone, and welcome to the National History Museum. My name is Sarah, and I'll be your guide today.

Before we begin our tour, let me give you some important information. The museum has four floors. We're currently on the ground floor, where you'll find the gift shop and café. The café serves hot and cold drinks, sandwiches, and snacks. It's open until 4:30 PM.

On the first floor, we have our famous dinosaur exhibition. This is our most popular section, especially with children. You'll see complete skeletons of various dinosaurs, including a full-size T-Rex.

The second floor houses our ocean life collection. There's a beautiful blue whale model that hangs from the ceiling - it's 25 meters long! You can also explore interactive displays about marine ecosystems.

On the third floor, we have the human biology section. It includes exhibits about the human body, health, and medicine through the ages.

Today's tour will last approximately 90 minutes. We'll visit the dinosaur and ocean life exhibitions. Please stay with the group and feel free to ask questions at any time.

The toilets are located near the main entrance and on each floor. Photography is allowed but please don't use flash as it can damage some exhibits.

Are there any questions before we start?""",
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "Where is the café located?",
                "options": [
                    "A) First floor",
                    "B) Ground floor",
                    "C) Second floor",
                    "D) Third floor"
                ],
                "answer": "B",
                "skill_tested": ["location", "specific information"]
            },
            {
                "id": "q2",
                "type": "multiple_choice",
                "question": "What time does the café close?",
                "options": [
                    "A) 4:00 PM",
                    "B) 4:30 PM",
                    "C) 5:00 PM",
                    "D) 5:30 PM"
                ],
                "answer": "B",
                "skill_tested": ["time", "specific information"]
            },
            {
                "id": "q3",
                "type": "matching",
                "question": "Match each floor with its exhibition:",
                "items": ["First floor", "Second floor", "Third floor"],
                "options": ["A) Human biology", "B) Ocean life", "C) Dinosaurs"],
                "answers": {"First floor": "C", "Second floor": "B", "Third floor": "A"},
                "skill_tested": ["matching", "organization"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Length of blue whale model: _____ meters",
                "answer": "25",
                "answer_variants": ["25", "twenty-five"],
                "skill_tested": ["numbers", "measurements"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Tour duration: _____ minutes",
                "answer": "90",
                "answer_variants": ["90", "ninety"],
                "skill_tested": ["numbers", "time"]
            },
            {
                "id": "q6",
                "type": "multiple_choice",
                "question": "Why shouldn't visitors use flash photography?",
                "options": [
                    "A) It disturbs other visitors",
                    "B) It can damage the exhibits",
                    "C) It's not allowed in museums",
                    "D) The batteries might run out"
                ],
                "answer": "B",
                "skill_tested": ["reason", "inference"]
            }
        ],
        "tips": [
            "In Part 2, take notes quickly as information comes fast",
            "Pay attention to floor numbers and locations",
            "Listen for reasons and explanations"
        ]
    },
    {
        "set_id": "ls_b45_004",
        "band_range": "4.0-5.0",
        "part": "part1",
        "title": "Gym Membership Enquiry",
        "topic": "health",
        "duration_seconds": 190,
        "question_types": ["form_completion", "multiple_choice"],
        "speakers": [
            {"id": "staff", "gender": "male", "accent": "british"},
            {"id": "customer", "gender": "female", "accent": "american"}
        ],
        "transcript": """Staff: Good afternoon, Fitness Plus. How can I help you?

Customer: Hi, I'm interested in joining the gym. Could you tell me about your membership options?

Staff: Of course. We have three types of membership. The basic plan is 25 pounds per month and gives you access to the gym from 6 AM to 10 PM.

Customer: What about classes?

Staff: The basic doesn't include classes. For that, you'd need our premium membership at 40 pounds per month. That includes all fitness classes - yoga, spinning, aerobics, and swimming.

Customer: Is there a family option?

Staff: Yes, our family membership is 65 pounds per month for two adults and up to two children under 16.

Customer: I think I'll go with the premium. What do I need to sign up?

Staff: Just a photo ID and proof of address. There's also a one-time joining fee of 30 pounds.

Customer: Can I pay by card?

Staff: Yes, we accept all major cards. Would you like to sign up now?

Customer: Yes, please. My name is Emma Rodriguez. R-O-D-R-I-G-U-E-Z.

Staff: And your address?

Customer: 78 Green Lane, apartment 5C.

Staff: Your membership will start from the 1st of next month.""",
        "questions": [
            {
                "id": "q1",
                "type": "form_completion",
                "question": "Basic membership cost: £_____ per month",
                "answer": "25",
                "answer_variants": ["25", "twenty-five"],
                "skill_tested": ["numbers", "prices"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "Premium membership cost: £_____ per month",
                "answer": "40",
                "answer_variants": ["40", "forty"],
                "skill_tested": ["numbers", "prices"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "Family membership: for 2 adults and up to _____ children",
                "answer": "2",
                "answer_variants": ["2", "two"],
                "skill_tested": ["numbers"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Joining fee: £_____",
                "answer": "30",
                "answer_variants": ["30", "thirty"],
                "skill_tested": ["numbers", "prices"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Customer surname: _____",
                "answer": "Rodriguez",
                "answer_variants": ["Rodriguez", "RODRIGUEZ"],
                "skill_tested": ["spelling", "names"]
            },
            {
                "id": "q6",
                "type": "multiple_choice",
                "question": "Which membership type does the customer choose?",
                "options": [
                    "A) Basic",
                    "B) Premium",
                    "C) Family",
                    "D) Student"
                ],
                "answer": "B",
                "skill_tested": ["specific information"]
            }
        ],
        "tips": [
            "Compare different options and prices carefully",
            "Listen for the final decision the customer makes",
            "Pay attention to what's included in each package"
        ]
    }
]

# ============ BAND 5.5-6.5 LISTENING SETS ============

BAND_55_65_SETS = [
    {
        "set_id": "ls_b56_001",
        "band_range": "5.5-6.5",
        "part": "part3",
        "title": "University Project Discussion",
        "topic": "education",
        "duration_seconds": 280,
        "question_types": ["multiple_choice", "matching"],
        "speakers": [
            {"id": "tutor", "gender": "male", "accent": "british"},
            {"id": "student1", "gender": "female", "accent": "british"},
            {"id": "student2", "gender": "male", "accent": "american"}
        ],
        "transcript": """Tutor: So, let's discuss your group project on renewable energy. How's it going?

Student1: Well, we've made good progress on the research, but we're having some issues with dividing the work.

Student2: Yeah, we originally planned to split it into three equal parts, but it turns out the solar energy section is much larger than the others.

Tutor: That's a common problem. What have you decided to do about it?

Student1: We're thinking of having Tom focus entirely on solar, while I cover wind and hydroelectric together.

Student2: And I'll handle the conclusion and put together the final presentation.

Tutor: That sounds reasonable. What about your timeline? The deadline is in three weeks.

Student1: We're planning to finish the research by the end of this week, then spend a week on writing, and use the final week for revisions and practicing the presentation.

Tutor: Good. Now, what resources have you been using?

Student2: Mainly academic journals from the library database. We've found about 15 relevant articles.

Student1: We've also been using government reports on energy statistics. They have the most recent data.

Tutor: Have you considered interviewing any experts?

Student2: Actually, we contacted Professor Williams from the Engineering department, and she agreed to answer some questions via email.

Tutor: Excellent initiative. What's the main argument of your project?

Student1: We're arguing that a combination of renewable sources is more effective than relying on a single type. Each has advantages and limitations.

Tutor: That's a solid thesis. Make sure you support it with concrete data.""",
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "What problem did the students encounter with their project?",
                "options": [
                    "A) They couldn't find enough research",
                    "B) The workload was unevenly distributed",
                    "C) They missed the deadline",
                    "D) They disagreed about the topic"
                ],
                "answer": "B",
                "skill_tested": ["main idea", "problem identification"]
            },
            {
                "id": "q2",
                "type": "matching",
                "question": "Match each student with their assigned task:",
                "items": ["Tom (Student2)", "Female student", "Male student (Student2)"],
                "options": ["A) Solar energy", "B) Wind and hydroelectric", "C) Conclusion and presentation"],
                "answers": {"Tom (Student2)": "A", "Female student": "B", "Male student (Student2)": "C"},
                "skill_tested": ["specific information", "matching"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "Project deadline: in _____ weeks",
                "answer": "3",
                "answer_variants": ["3", "three"],
                "skill_tested": ["numbers", "time"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Number of relevant articles found: _____",
                "answer": "15",
                "answer_variants": ["15", "fifteen"],
                "skill_tested": ["numbers"]
            },
            {
                "id": "q5",
                "type": "multiple_choice",
                "question": "How will Professor Williams help with the project?",
                "options": [
                    "A) Give a lecture to the class",
                    "B) Review their final paper",
                    "C) Answer questions by email",
                    "D) Provide laboratory access"
                ],
                "answer": "C",
                "skill_tested": ["specific information"]
            },
            {
                "id": "q6",
                "type": "multiple_choice",
                "question": "What is the main argument of the students' project?",
                "options": [
                    "A) Solar energy is the best option",
                    "B) Renewable energy is too expensive",
                    "C) A mix of renewable sources works best",
                    "D) Government should invest more in energy"
                ],
                "answer": "C",
                "skill_tested": ["main argument", "thesis"]
            }
        ],
        "tips": [
            "Part 3 often involves academic discussions - listen for opinions and plans",
            "Pay attention to how work is divided among group members",
            "Note the reasons given for decisions"
        ]
    },
    {
        "set_id": "ls_b56_002",
        "band_range": "5.5-6.5",
        "part": "part2",
        "title": "Community Center Facilities",
        "topic": "community",
        "duration_seconds": 250,
        "question_types": ["sentence_completion", "multiple_choice"],
        "speakers": [
            {"id": "manager", "gender": "male", "accent": "british"}
        ],
        "transcript": """Good evening, everyone. Thank you for coming to this information session about our newly renovated community center. I'm David Chen, the center manager, and I'll walk you through all the facilities and programs we offer.

Let me start with our sports facilities. We have a large sports hall that can accommodate basketball, volleyball, and badminton. The hall is available for booking from 7 AM to 10 PM daily. We've also added a modern fitness suite with 30 pieces of equipment, including treadmills, exercise bikes, and weight machines.

For those interested in water activities, our swimming pool has been completely refurbished. It's 25 meters long with six lanes. We offer swimming lessons for all ages, from babies as young as 6 months to senior citizens. There's also an aqua aerobics class every Tuesday and Thursday at 11 AM.

Moving on to our arts and cultural programs. We have two art studios - one for painting and drawing, and another equipped for pottery and ceramics. All materials are included in the class fee, which is 45 pounds for a 10-week course.

Our music room has been soundproofed and contains a piano, drum kit, and various other instruments. It's available for band practice or individual lessons.

For younger visitors, our children's area includes a soft play zone for under-5s and a games room for older children with table tennis and video game consoles.

Membership costs 120 pounds annually for adults and 60 pounds for students and seniors. Family membership for up to 4 people is 250 pounds. Members get priority booking for all facilities and a 20% discount on courses.""",
        "questions": [
            {
                "id": "q1",
                "type": "sentence_completion",
                "question": "The sports hall can be used for basketball, volleyball, and _____.",
                "answer": "badminton",
                "answer_variants": ["badminton"],
                "skill_tested": ["specific information"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "Number of equipment pieces in fitness suite: _____",
                "answer": "30",
                "answer_variants": ["30", "thirty"],
                "skill_tested": ["numbers"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "Swimming pool length: _____ meters",
                "answer": "25",
                "answer_variants": ["25", "twenty-five"],
                "skill_tested": ["numbers", "measurements"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Minimum age for baby swimming lessons: _____ months",
                "answer": "6",
                "answer_variants": ["6", "six"],
                "skill_tested": ["numbers", "age"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Art course fee for 10 weeks: £_____",
                "answer": "45",
                "answer_variants": ["45", "forty-five"],
                "skill_tested": ["numbers", "prices"]
            },
            {
                "id": "q6",
                "type": "form_completion",
                "question": "Annual adult membership: £_____",
                "answer": "120",
                "answer_variants": ["120", "one hundred and twenty"],
                "skill_tested": ["numbers", "prices"]
            },
            {
                "id": "q7",
                "type": "multiple_choice",
                "question": "What discount do members receive on courses?",
                "options": [
                    "A) 10%",
                    "B) 15%",
                    "C) 20%",
                    "D) 25%"
                ],
                "answer": "C",
                "skill_tested": ["specific information", "percentages"]
            }
        ],
        "tips": [
            "Listen for numbers - prices, measurements, and ages are common",
            "Note the relationship between items (e.g., what's included in membership)",
            "Pay attention to schedules and timing"
        ]
    },
    {
        "set_id": "ls_b56_003",
        "band_range": "5.5-6.5",
        "part": "part3",
        "title": "Job Interview Preparation",
        "topic": "work",
        "duration_seconds": 260,
        "question_types": ["multiple_choice", "sentence_completion"],
        "speakers": [
            {"id": "advisor", "gender": "female", "accent": "british"},
            {"id": "student", "gender": "male", "accent": "british"}
        ],
        "transcript": """Advisor: Hi Marcus, come in. So you've got an interview at TechStart next week. Let's prepare.

Student: Thanks, Ms. Parker. I'm quite nervous actually. It's my first real job interview.

Advisor: That's completely normal. First, tell me what you know about the company.

Student: Well, they're a software development company founded in 2018. They specialize in mobile applications and have about 200 employees.

Advisor: Good research. Now, what position are you applying for?

Student: Junior Developer. The job description mentions working with Python and JavaScript, which I've studied.

Advisor: Excellent. Now, let's talk about common interview questions. They'll probably ask about your strengths and weaknesses. What would you say?

Student: My strength is problem-solving. I enjoy breaking down complex issues into smaller parts.

Advisor: That's a good answer for a developer role. And your weakness?

Student: I sometimes spend too much time perfecting details. I'm learning to balance quality with meeting deadlines.

Advisor: Smart approach - showing you're aware of it and working on it. They might also ask where you see yourself in five years.

Student: I'd like to have grown into a senior developer role, possibly leading a small team.

Advisor: Perfect. Now, don't forget to prepare some questions to ask them. It shows you're genuinely interested.

Student: What kind of questions should I ask?

Advisor: Ask about the team structure, professional development opportunities, or what a typical project looks like. Avoid asking about salary in the first interview.

Student: Thanks, that's really helpful. Any tips for the day itself?

Advisor: Arrive 10 minutes early, dress professionally, bring extra copies of your CV, and maintain eye contact. And remember to breathe - you've prepared well.""",
        "questions": [
            {
                "id": "q1",
                "type": "form_completion",
                "question": "Year TechStart was founded: _____",
                "answer": "2018",
                "answer_variants": ["2018"],
                "skill_tested": ["specific information", "dates"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "Number of employees at TechStart: approximately _____",
                "answer": "200",
                "answer_variants": ["200", "two hundred"],
                "skill_tested": ["numbers"]
            },
            {
                "id": "q3",
                "type": "multiple_choice",
                "question": "What does Marcus say is his main strength?",
                "options": [
                    "A) Communication skills",
                    "B) Problem-solving",
                    "C) Time management",
                    "D) Teamwork"
                ],
                "answer": "B",
                "skill_tested": ["specific information"]
            },
            {
                "id": "q4",
                "type": "multiple_choice",
                "question": "What is Marcus's stated weakness?",
                "options": [
                    "A) He's too ambitious",
                    "B) He doesn't like teamwork",
                    "C) He spends too much time on details",
                    "D) He's often late for meetings"
                ],
                "answer": "C",
                "skill_tested": ["specific information"]
            },
            {
                "id": "q5",
                "type": "sentence_completion",
                "question": "In five years, Marcus hopes to be a senior developer leading a small _____.",
                "answer": "team",
                "answer_variants": ["team"],
                "skill_tested": ["inference", "career goals"]
            },
            {
                "id": "q6",
                "type": "multiple_choice",
                "question": "What should Marcus NOT ask about in the first interview?",
                "options": [
                    "A) Team structure",
                    "B) Professional development",
                    "C) Typical projects",
                    "D) Salary"
                ],
                "answer": "D",
                "skill_tested": ["specific advice"]
            },
            {
                "id": "q7",
                "type": "form_completion",
                "question": "Marcus should arrive _____ minutes early.",
                "answer": "10",
                "answer_variants": ["10", "ten"],
                "skill_tested": ["specific advice", "numbers"]
            }
        ],
        "tips": [
            "Listen for advice and recommendations",
            "Note the reasons behind suggestions",
            "Pay attention to what NOT to do"
        ]
    },
    {
        "set_id": "ls_b56_004",
        "band_range": "5.5-6.5",
        "part": "part4",
        "title": "Environmental Conservation Lecture",
        "topic": "environment",
        "duration_seconds": 300,
        "question_types": ["sentence_completion", "multiple_choice"],
        "speakers": [
            {"id": "lecturer", "gender": "female", "accent": "british"}
        ],
        "transcript": """Today's lecture focuses on marine conservation and the challenges facing our oceans. I'll be discussing three main areas: coral reef degradation, plastic pollution, and overfishing.

Let's begin with coral reefs. Often called the rainforests of the sea, coral reefs support approximately 25% of all marine species despite covering less than 1% of the ocean floor. However, rising sea temperatures have caused widespread coral bleaching. The Great Barrier Reef alone has lost nearly 50% of its coral since 1995.

What causes bleaching? When water temperatures rise by just 1 to 2 degrees Celsius above the normal maximum, corals expel the algae living in their tissues. This algae provides up to 90% of the coral's energy needs. Without it, the coral turns white and eventually dies if conditions don't improve within a few weeks.

Moving to plastic pollution. An estimated 8 million tonnes of plastic enter our oceans annually. That's equivalent to one garbage truck of plastic being dumped every minute. By 2050, scientists predict there could be more plastic than fish in the ocean by weight.

The problem isn't just visible debris. Microplastics - pieces smaller than 5 millimeters - are now found in 83% of tap water samples worldwide. Marine animals mistake these tiny particles for food, introducing toxins into the food chain.

Finally, overfishing. Currently, about 34% of global fish stocks are overfished, triple the level of 1974. This doesn't just affect fish populations - it disrupts entire ecosystems. Removing top predators can cause population explosions in their prey, which then overconsume their own food sources.

Solutions require international cooperation. Marine protected areas, where fishing is restricted, have shown promising results. In protected zones, fish populations can recover by up to 600% compared to unprotected areas.

Next week, we'll examine successful conservation case studies from around the world.""",
        "questions": [
            {
                "id": "q1",
                "type": "form_completion",
                "question": "Coral reefs support approximately _____% of all marine species.",
                "answer": "25",
                "answer_variants": ["25", "twenty-five"],
                "skill_tested": ["statistics", "numbers"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "The Great Barrier Reef has lost nearly _____% of its coral since 1995.",
                "answer": "50",
                "answer_variants": ["50", "fifty"],
                "skill_tested": ["statistics", "numbers"]
            },
            {
                "id": "q3",
                "type": "sentence_completion",
                "question": "Algae provides up to _____% of the coral's energy needs.",
                "answer": "90",
                "answer_variants": ["90", "ninety"],
                "skill_tested": ["statistics"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Plastic entering oceans annually: _____ million tonnes",
                "answer": "8",
                "answer_variants": ["8", "eight"],
                "skill_tested": ["statistics", "numbers"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Microplastics are pieces smaller than _____ millimeters.",
                "answer": "5",
                "answer_variants": ["5", "five"],
                "skill_tested": ["measurements", "definitions"]
            },
            {
                "id": "q6",
                "type": "form_completion",
                "question": "Currently, _____% of global fish stocks are overfished.",
                "answer": "34",
                "answer_variants": ["34", "thirty-four"],
                "skill_tested": ["statistics"]
            },
            {
                "id": "q7",
                "type": "multiple_choice",
                "question": "By how much can fish populations recover in protected zones?",
                "options": [
                    "A) Up to 200%",
                    "B) Up to 400%",
                    "C) Up to 600%",
                    "D) Up to 800%"
                ],
                "answer": "C",
                "skill_tested": ["statistics", "solutions"]
            }
        ],
        "tips": [
            "Part 4 is academic - expect statistics and technical terms",
            "Take quick notes as statistics are often tested",
            "Listen for cause and effect relationships"
        ]
    }
]

# ============ BAND 7.0-9.0 LISTENING SETS ============

BAND_7_9_SETS = [
    {
        "set_id": "ls_b79_001",
        "band_range": "7.0-9.0",
        "part": "part3",
        "title": "Research Methodology Discussion",
        "topic": "education",
        "duration_seconds": 320,
        "question_types": ["multiple_choice", "matching", "sentence_completion"],
        "speakers": [
            {"id": "supervisor", "gender": "male", "accent": "british"},
            {"id": "student1", "gender": "female", "accent": "british"},
            {"id": "student2", "gender": "male", "accent": "australian"}
        ],
        "transcript": """Supervisor: So, let's review your research proposals. Sarah, you're looking at social media's impact on political engagement among young adults.

Student1: Yes, Professor. I've been debating between qualitative and quantitative approaches.

Supervisor: What are you leaning towards?

Student1: Initially I thought surveys would be best - I could reach thousands of respondents through online platforms. But I'm concerned the data might be too superficial.

Student2: That's a valid concern. When I did my pilot study on media consumption, the survey responses were quite predictable. People tend to give socially acceptable answers.

Supervisor: That's called social desirability bias, and it's particularly problematic in political research. Sarah, have you considered a mixed methods approach?

Student1: I have, actually. I'm thinking of conducting in-depth interviews first to identify key themes, then using those to design a more nuanced survey.

Supervisor: That's a sound strategy. The qualitative phase can inform your quantitative instrument. What about sampling?

Student1: I want to focus on 18 to 24-year-olds who are active on at least two social media platforms.

Supervisor: How will you define 'active'?

Student1: That's something I need to operationalize. Perhaps posting or commenting at least three times weekly?

Student2: In my study, I required daily use for at least 30 minutes. Though that might be too restrictive for your purposes.

Supervisor: Consider the research on passive consumption versus active engagement. They have different effects on political behavior.

Student1: Good point. I should distinguish between lurking and participating.

Supervisor: Exactly. Now James, your dissertation on urban planning. How's the literature review progressing?

Student2: Quite well. I've identified a gap in research on green corridor development in medium-sized cities. Most studies focus on major metropolitan areas.

Supervisor: That's a genuine contribution. Have you established contact with the city planning office?

Student2: Yes, they've agreed to provide access to development proposals and environmental impact assessments from the past decade.

Supervisor: Excellent. That archival data combined with your planned stakeholder interviews should give you rich material.""",
        "questions": [
            {
                "id": "q1",
                "type": "multiple_choice",
                "question": "What is Sarah's initial concern about using surveys?",
                "options": [
                    "A) They are too expensive",
                    "B) The data might be superficial",
                    "C) They take too long to administer",
                    "D) Response rates are typically low"
                ],
                "answer": "B",
                "skill_tested": ["inference", "evaluation"]
            },
            {
                "id": "q2",
                "type": "sentence_completion",
                "question": "The tendency to give socially acceptable answers is called social desirability _____.",
                "answer": "bias",
                "answer_variants": ["bias"],
                "skill_tested": ["terminology", "specific information"]
            },
            {
                "id": "q3",
                "type": "multiple_choice",
                "question": "What research approach does Sarah decide to use?",
                "options": [
                    "A) Purely qualitative",
                    "B) Purely quantitative",
                    "C) Mixed methods",
                    "D) Case study only"
                ],
                "answer": "C",
                "skill_tested": ["specific information"]
            },
            {
                "id": "q4",
                "type": "form_completion",
                "question": "Sarah's target age group: _____ to 24-year-olds",
                "answer": "18",
                "answer_variants": ["18", "eighteen"],
                "skill_tested": ["numbers", "demographics"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "James defined 'active use' as daily use for at least _____ minutes.",
                "answer": "30",
                "answer_variants": ["30", "thirty"],
                "skill_tested": ["numbers", "definitions"]
            },
            {
                "id": "q6",
                "type": "multiple_choice",
                "question": "What gap has James identified in the literature?",
                "options": [
                    "A) Research on large cities",
                    "B) Studies on transportation",
                    "C) Green corridors in medium-sized cities",
                    "D) Environmental impact in rural areas"
                ],
                "answer": "C",
                "skill_tested": ["main idea", "research focus"]
            },
            {
                "id": "q7",
                "type": "form_completion",
                "question": "The city planning office will provide data from the past _____ years.",
                "answer": "10",
                "answer_variants": ["10", "ten", "decade"],
                "skill_tested": ["numbers", "time period"]
            }
        ],
        "tips": [
            "Academic discussions often contain specialized terminology",
            "Listen for the reasoning behind methodological choices",
            "Note contrasts between different approaches"
        ]
    },
    {
        "set_id": "ls_b79_002",
        "band_range": "7.0-9.0",
        "part": "part4",
        "title": "Behavioral Economics Lecture",
        "topic": "business",
        "duration_seconds": 340,
        "question_types": ["sentence_completion", "multiple_choice"],
        "speakers": [
            {"id": "professor", "gender": "male", "accent": "american"}
        ],
        "transcript": """Today we're examining behavioral economics, a field that challenges the traditional assumption that humans are rational economic actors. Classical economics assumes people make decisions that maximize their utility - their benefit or satisfaction. But decades of research have shown this isn't quite how we operate.

Let's start with the concept of bounded rationality, introduced by Herbert Simon in the 1950s. Simon argued that our cognitive capabilities are limited. We can't process all available information, so we use mental shortcuts or heuristics to make decisions. These shortcuts are usually efficient, but they can lead to systematic errors or biases.

One well-documented bias is loss aversion. Research by Kahneman and Tversky found that losses feel approximately twice as painful as equivalent gains feel pleasurable. If you lose 100 dollars, you'd need to gain about 200 dollars to feel emotionally neutral. This asymmetry influences everything from investment decisions to negotiations.

Another key concept is the anchoring effect. When making estimates, we tend to rely heavily on the first piece of information we receive - the anchor - even if it's irrelevant. In one famous experiment, participants were asked to spin a wheel numbered 0 to 100, then estimate the percentage of African countries in the United Nations. Those who spun a higher number consistently gave higher estimates, despite the wheel being completely random.

Now, how can businesses apply these insights? Consider the framing effect. The same information presented differently can lead to vastly different choices. A product marketed as '95% fat-free' is more appealing than one described as 'containing 5% fat,' though they're identical.

Default options are another powerful tool. Research shows that organ donation rates are dramatically higher in countries with opt-out systems compared to opt-in systems. The default - whether you're automatically enrolled or not - shapes behavior more than we'd like to admit.

Finally, there's the paradox of choice. While traditional economics suggests more options are always better, psychologist Barry Schwartz demonstrated that too many choices can lead to decision paralysis and reduced satisfaction. A study in a supermarket found that offering 24 varieties of jam attracted more browsers than offering 6, but the smaller selection resulted in ten times more purchases.

Understanding these principles doesn't just help businesses market more effectively - it also allows policymakers to design 'nudges' that encourage better decisions without restricting freedom. This approach, advocated by Thaler and Sunstein, has influenced everything from retirement savings plans to environmental policies.""",
        "questions": [
            {
                "id": "q1",
                "type": "sentence_completion",
                "question": "Herbert Simon introduced the concept of bounded _____ in the 1950s.",
                "answer": "rationality",
                "answer_variants": ["rationality"],
                "skill_tested": ["key concepts", "terminology"]
            },
            {
                "id": "q2",
                "type": "multiple_choice",
                "question": "According to Kahneman and Tversky, losses feel how many times more painful than equivalent gains?",
                "options": [
                    "A) 1.5 times",
                    "B) Twice (2 times)",
                    "C) Three times",
                    "D) Four times"
                ],
                "answer": "B",
                "skill_tested": ["specific information", "research findings"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "To feel neutral after losing $100, you'd need to gain approximately $_____.",
                "answer": "200",
                "answer_variants": ["200", "two hundred"],
                "skill_tested": ["calculation", "application"]
            },
            {
                "id": "q4",
                "type": "multiple_choice",
                "question": "In the anchoring experiment, participants were asked to estimate the percentage of what?",
                "options": [
                    "A) World population in cities",
                    "B) African countries in the UN",
                    "C) Global trade from Asia",
                    "D) Water covering Earth's surface"
                ],
                "answer": "B",
                "skill_tested": ["specific detail"]
            },
            {
                "id": "q5",
                "type": "multiple_choice",
                "question": "Which factor most influences organ donation rates according to the lecture?",
                "options": [
                    "A) Public awareness campaigns",
                    "B) Cultural attitudes",
                    "C) Default options (opt-in vs opt-out)",
                    "D) Financial incentives"
                ],
                "answer": "C",
                "skill_tested": ["main point", "cause and effect"]
            },
            {
                "id": "q6",
                "type": "form_completion",
                "question": "In the jam study, the smaller selection resulted in _____ times more purchases.",
                "answer": "10",
                "answer_variants": ["10", "ten"],
                "skill_tested": ["statistics", "research findings"]
            },
            {
                "id": "q7",
                "type": "sentence_completion",
                "question": "Thaler and Sunstein advocate for 'nudges' that encourage better decisions without restricting _____.",
                "answer": "freedom",
                "answer_variants": ["freedom", "choice"],
                "skill_tested": ["key concepts", "definition"]
            }
        ],
        "tips": [
            "Academic lectures often define key terms - note these carefully",
            "Listen for specific examples and research findings",
            "Track the speaker's main argument and supporting evidence"
        ]
    },
    {
        "set_id": "ls_b79_003",
        "band_range": "7.0-9.0",
        "part": "part3",
        "title": "Architecture and Sustainability",
        "topic": "technology",
        "duration_seconds": 300,
        "question_types": ["multiple_choice", "sentence_completion"],
        "speakers": [
            {"id": "professor", "gender": "female", "accent": "british"},
            {"id": "student1", "gender": "male", "accent": "british"},
            {"id": "student2", "gender": "female", "accent": "american"}
        ],
        "transcript": """Professor: Today we're discussing your research on sustainable architecture. Let's start with you, Michael.

Student1: I've been analyzing passive house standards - the approach originated in Germany in the late 1980s. The fundamental principle is reducing energy consumption to near zero through exceptional insulation and airtight construction.

Professor: How does this compare to conventional building standards?

Student1: A passive house typically uses about 90% less energy for heating and cooling than a standard building. The key is the thermal envelope - walls, roof, and floor working together to minimize heat transfer.

Student2: But doesn't extreme airtightness create ventilation problems?

Student1: That's where mechanical ventilation with heat recovery comes in. The system extracts stale air while capturing about 75 to 95 percent of its heat to warm incoming fresh air.

Professor: Elena, you've been looking at a different approach.

Student2: Yes, I've researched biomimicry in architecture - designs inspired by natural systems. The Eastgate Centre in Zimbabwe is a famous example. It's modeled on termite mounds, which maintain a constant internal temperature despite external fluctuations of up to 40 degrees.

Professor: How does the building achieve this?

Student2: Through a sophisticated natural ventilation system. The building has no conventional air conditioning yet uses 90% less energy than similar-sized buildings. Cool night air is stored in the concrete structure, then released during the day.

Student1: What about the costs? I know passive houses have higher upfront costs but lower running expenses.

Student2: It's similar with biomimetic buildings. The Eastgate Centre saved 3.5 million dollars in air conditioning costs in its first five years alone.

Professor: Both approaches challenge the assumption that comfort requires high energy consumption. What about combining them?

Student1: There are emerging hybrid approaches. Some architects are incorporating biomimetic principles into passive house designs - using natural ventilation where possible and mechanical systems as backup.

Student2: The challenge is that each building site is unique. What works in Zimbabwe's climate won't necessarily work in Scandinavia.

Professor: Exactly. Context-specific solutions are essential. For next week, I'd like you both to consider how these principles might apply to a temperate maritime climate like ours.""",
        "questions": [
            {
                "id": "q1",
                "type": "form_completion",
                "question": "Passive house standards originated in Germany in the late _____.",
                "answer": "1980s",
                "answer_variants": ["1980s", "eighties", "1980's"],
                "skill_tested": ["dates", "history"]
            },
            {
                "id": "q2",
                "type": "form_completion",
                "question": "A passive house uses about _____% less energy than a standard building.",
                "answer": "90",
                "answer_variants": ["90", "ninety"],
                "skill_tested": ["statistics", "comparison"]
            },
            {
                "id": "q3",
                "type": "multiple_choice",
                "question": "Heat recovery ventilation systems capture what percentage of heat from extracted air?",
                "options": [
                    "A) 50-70%",
                    "B) 75-95%",
                    "C) 60-80%",
                    "D) 85-100%"
                ],
                "answer": "B",
                "skill_tested": ["specific information", "range"]
            },
            {
                "id": "q4",
                "type": "sentence_completion",
                "question": "The Eastgate Centre's design is inspired by _____ mounds.",
                "answer": "termite",
                "answer_variants": ["termite", "termite's"],
                "skill_tested": ["specific information", "biomimicry"]
            },
            {
                "id": "q5",
                "type": "form_completion",
                "question": "Temperature fluctuations that termite mounds can handle: up to _____ degrees.",
                "answer": "40",
                "answer_variants": ["40", "forty"],
                "skill_tested": ["numbers", "measurements"]
            },
            {
                "id": "q6",
                "type": "form_completion",
                "question": "The Eastgate Centre saved $_____ million in air conditioning costs in five years.",
                "answer": "3.5",
                "answer_variants": ["3.5", "three point five"],
                "skill_tested": ["statistics", "cost savings"]
            },
            {
                "id": "q7",
                "type": "multiple_choice",
                "question": "What do both students agree is a challenge for sustainable architecture?",
                "options": [
                    "A) Lack of funding",
                    "B) Building codes",
                    "C) Climate-specific solutions needed",
                    "D) Public resistance"
                ],
                "answer": "C",
                "skill_tested": ["inference", "agreement"]
            }
        ],
        "tips": [
            "Listen for comparisons between different approaches",
            "Note specific examples and their outcomes",
            "Identify areas of agreement and disagreement"
        ]
    },
    {
        "set_id": "ls_b79_004",
        "band_range": "7.0-9.0",
        "part": "part4",
        "title": "Neuroscience of Decision Making",
        "topic": "science",
        "duration_seconds": 350,
        "question_types": ["sentence_completion", "multiple_choice", "form_completion"],
        "speakers": [
            {"id": "lecturer", "gender": "female", "accent": "american"}
        ],
        "transcript": """Today's lecture examines the neuroscience of decision-making, focusing on how our brains process choices and what this reveals about human behavior.

For decades, scientists believed that emotions hindered rational decision-making. The work of Antonio Damasio challenged this view fundamentally. Studying patients with damage to the ventromedial prefrontal cortex - an area involved in processing emotions - Damasio discovered something surprising. These patients, despite having intact cognitive abilities, made catastrophically poor decisions in their personal and professional lives.

This led to the somatic marker hypothesis. Damasio proposed that emotions, experienced as bodily sensations - what he called somatic markers - guide our decisions by tagging options with feelings of goodness or badness. Without this emotional input, we struggle to evaluate alternatives effectively.

Let me illustrate with the Iowa Gambling Task, an experiment Damasio and colleagues developed. Participants choose cards from four decks. Two decks offer high rewards but devastating losses over time, while two provide modest but consistent gains. Most healthy participants begin choosing from the advantageous decks after about 50 cards, and importantly, they show stress responses to the risky decks before they can consciously articulate why. Patients with ventromedial damage, however, continue choosing badly, showing no anticipatory emotional signals.

More recent research using brain imaging has identified a network of regions involved in decision-making. The prefrontal cortex weighs consequences and plans. The anterior cingulate cortex monitors conflict between options. The insula processes internal body states - that gut feeling we often mention. And the striatum evaluates rewards and motivates action.

What about decisions under uncertainty? Work by Paul Glimcher introduced neuroeconomics, applying brain science to understand economic behavior. His research shows that when facing uncertain outcomes, neurons in the parietal cortex encode probability, while the prefrontal cortex integrates this with reward magnitude.

Fatigue significantly affects decision quality. Studies show that after prolonged mental effort, people tend to choose default options more frequently, a phenomenon called decision fatigue. This has practical implications - judges' parole decisions, for instance, become more favorable after breaks.

Finally, consider how social context shapes neural processing. When making decisions that others will evaluate, additional brain regions activate - particularly areas associated with self-reflection and social cognition. The pressure of social judgment literally changes how our brains process choices.

Next week, we'll explore applications of this research in fields from marketing to public policy.""",
        "questions": [
            {
                "id": "q1",
                "type": "sentence_completion",
                "question": "Damasio's patients had damage to the ventromedial _____ cortex.",
                "answer": "prefrontal",
                "answer_variants": ["prefrontal", "pre-frontal"],
                "skill_tested": ["terminology", "anatomy"]
            },
            {
                "id": "q2",
                "type": "sentence_completion",
                "question": "Emotions experienced as bodily sensations are called _____ markers.",
                "answer": "somatic",
                "answer_variants": ["somatic"],
                "skill_tested": ["terminology", "key concept"]
            },
            {
                "id": "q3",
                "type": "form_completion",
                "question": "In the Iowa Gambling Task, participants improve after about _____ cards.",
                "answer": "50",
                "answer_variants": ["50", "fifty"],
                "skill_tested": ["specific information"]
            },
            {
                "id": "q4",
                "type": "multiple_choice",
                "question": "Which brain region processes 'gut feelings'?",
                "options": [
                    "A) Prefrontal cortex",
                    "B) Striatum",
                    "C) Insula",
                    "D) Parietal cortex"
                ],
                "answer": "C",
                "skill_tested": ["specific information", "brain regions"]
            },
            {
                "id": "q5",
                "type": "sentence_completion",
                "question": "Paul Glimcher introduced the field of _____.",
                "answer": "neuroeconomics",
                "answer_variants": ["neuroeconomics", "neuro-economics"],
                "skill_tested": ["terminology", "field of study"]
            },
            {
                "id": "q6",
                "type": "sentence_completion",
                "question": "After mental effort, people tend to choose _____ options more frequently.",
                "answer": "default",
                "answer_variants": ["default"],
                "skill_tested": ["key concept", "phenomenon"]
            },
            {
                "id": "q7",
                "type": "multiple_choice",
                "question": "What happens when decisions will be evaluated by others?",
                "options": [
                    "A) Decision quality improves",
                    "B) Decision speed increases",
                    "C) Additional brain regions for social cognition activate",
                    "D) Emotional processing decreases"
                ],
                "answer": "C",
                "skill_tested": ["specific information", "social neuroscience"]
            }
        ],
        "tips": [
            "Academic lectures often introduce specialized terminology",
            "Listen for research findings and their implications",
            "Note the relationship between brain regions and functions"
        ]
    }
]

# ============ HELPER FUNCTIONS ============

def get_all_listening_sets() -> List[Dict[str, Any]]:
    """Get all listening sets across all bands."""
    return BAND_4_5_SETS + BAND_55_65_SETS + BAND_7_9_SETS

def get_listening_sets_by_band(band_range: str) -> List[Dict[str, Any]]:
    """Get listening sets for a specific band range."""
    band_map = {
        "4.0-5.0": BAND_4_5_SETS,
        "5.5-6.5": BAND_55_65_SETS,
        "7.0-9.0": BAND_7_9_SETS
    }
    return band_map.get(band_range, [])

def get_listening_set_by_id(set_id: str) -> Dict[str, Any]:
    """Get a specific listening set by ID."""
    all_sets = get_all_listening_sets()
    for s in all_sets:
        if s["set_id"] == set_id:
            return s
    return None

def get_listening_sets_by_topic(topic: str) -> List[Dict[str, Any]]:
    """Get listening sets filtered by topic."""
    all_sets = get_all_listening_sets()
    return [s for s in all_sets if s.get("topic") == topic]

def get_listening_sets_by_question_type(question_type: str) -> List[Dict[str, Any]]:
    """Get listening sets that include a specific question type."""
    all_sets = get_all_listening_sets()
    return [s for s in all_sets if question_type in s.get("question_types", [])]

def get_listening_sets_by_part(part: str) -> List[Dict[str, Any]]:
    """Get listening sets by IELTS part."""
    all_sets = get_all_listening_sets()
    return [s for s in all_sets if s.get("part") == part]

def get_question_types() -> Dict[str, Any]:
    """Get all listening question types."""
    return LISTENING_QUESTION_TYPES

def get_listening_parts() -> Dict[str, Any]:
    """Get IELTS listening part information."""
    return LISTENING_PARTS

def get_listening_modules_summary(band_range: str = None) -> List[Dict[str, Any]]:
    """Get summary of available listening modules/sets."""
    sets = get_listening_sets_by_band(band_range) if band_range else get_all_listening_sets()
    
    return [{
        "set_id": s["set_id"],
        "title": s["title"],
        "band_range": s["band_range"],
        "part": s["part"],
        "topic": s["topic"],
        "question_types": s["question_types"],
        "duration_seconds": s["duration_seconds"],
        "question_count": len(s["questions"])
    } for s in sets]
