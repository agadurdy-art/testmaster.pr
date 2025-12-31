"""
IELTS-Style Academic Full Test - Set D
=======================================
100% ORIGINAL CONTENT

FOCUS AREAS:
- Reading: Classification, Table Completion, Yes/No/Not Given
- Listening: Table Completion, Selection (TWO/THREE), Map Labelling
- Writing Task 1: Process diagram
- Writing Task 2: Advantages-Disadvantages essay
"""

ACADEMIC_SET_D = {
    "test_id": "academic_set_d_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set D",
    "description": "Complete IELTS Academic examination with focus on Classification, Table, and Selection question types.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    "question_type_focus": ["classification", "table_completion", "selection", "yes_no_ng", "process_diagram"],
    
    "sections": {
        # ============ LISTENING SECTION ============
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Table Completion + Map (Q1-10)
                {
                    "part_number": 1,
                    "title": "Hotel Reservation",
                    "context": "A guest making a hotel reservation by phone",
                    "speakers": ["Receptionist", "Guest"],
                    "question_types": ["table_completion", "map_labelling"],
                    
                    "visual": {
                        "type": "combined",
                        "elements": [
                            {
                                "type": "table",
                                "title": "Booking Details",
                                "headers": ["Detail", "Information"],
                                "rows": [
                                    ["Guest Name", "Q1 ______"],
                                    ["Check-in Date", "Q2 ______ March"],
                                    ["Number of Nights", "Q3 ______"],
                                    ["Room Type", "Q4 ______"],
                                    ["Price per Night", "£Q5 ______"],
                                    ["Special Request", "Q6 ______"]
                                ]
                            },
                            {
                                "type": "map",
                                "title": "Hotel Ground Floor",
                                "elements": [
                                    {"id": "reception", "label": "Reception", "position": {"x": 50, "y": 80}, "given": True},
                                    {"id": "A", "label": "?", "position": {"x": 20, "y": 60}, "given": False},
                                    {"id": "B", "label": "?", "position": {"x": 80, "y": 60}, "given": False},
                                    {"id": "C", "label": "?", "position": {"x": 50, "y": 30}, "given": False},
                                    {"id": "lift", "label": "Lift", "position": {"x": 70, "y": 80}, "given": True}
                                ],
                                "answer_key": {"A": "Restaurant", "B": "Gym", "C": "Pool"}
                            }
                        ]
                    },
                    
                    "audio_script": """
Receptionist: Good afternoon, Lakeside Grand Hotel. How may I help you?
Guest: Hello, I'd like to make a reservation please.
Receptionist: Certainly. May I have your name?
Guest: Yes, it's Catherine Morrison. That's M-O-R-R-I-S-O-N.
Receptionist: Thank you, Ms Morrison. What dates are you looking at?
Guest: I'd like to check in on the eighteenth of March.
Receptionist: The eighteenth. And how many nights will you be staying?
Guest: Five nights, so checking out on the twenty-third.
Receptionist: Perfect. We have several room types available. Our standard rooms are one hundred and twenty pounds per night. Superior rooms are one hundred and fifty-five, and suites are two hundred and thirty.
Guest: What's the difference between standard and superior?
Receptionist: Superior rooms are larger with a king-size bed and a better view. They also include breakfast.
Guest: I'll take a superior room then.
Receptionist: Excellent choice. Do you have any special requests?
Guest: Yes, I'd prefer a room on a higher floor if possible, away from the lift.
Receptionist: I'll make a note - high floor, quiet location. Now, let me tell you about our facilities. Looking at the ground floor plan, when you come in through the main entrance, reception is straight ahead.
Guest: Yes, I see it on the map.
Receptionist: To your left is our restaurant. It's open for breakfast from seven to ten, and dinner from six to nine thirty. On your right is our fitness centre with gym equipment.
Guest: What about the pool I saw on your website?
Receptionist: The swimming pool is at the back of the building. It's heated and open from six AM to ten PM.
Guest: Wonderful. Can I pay when I arrive?
Receptionist: Of course. We'll just need a credit card to guarantee the booking.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "table_completion", "question": "Guest surname: ______", "answer": "Morrison"},
                        {"id": "L1Q2", "type": "table_completion", "question": "Check-in date: ______ March", "answer": "18/18th/eighteenth"},
                        {"id": "L1Q3", "type": "table_completion", "question": "Number of nights: ______", "answer": "5/five"},
                        {"id": "L1Q4", "type": "table_completion", "question": "Room type booked: ______", "answer": "superior"},
                        {"id": "L1Q5", "type": "table_completion", "question": "Price per night: £______", "answer": "155"},
                        {"id": "L1Q6", "type": "table_completion", "question": "Special request: high floor, away from ______", "answer": "lift"},
                        {"id": "L1Q7", "type": "table_completion", "question": "Breakfast available: 7 AM to ______ AM", "answer": "10"},
                        {"id": "L1Q8", "type": "map_labelling", "question": "Letter A on the map: ______", "answer": "Restaurant"},
                        {"id": "L1Q9", "type": "map_labelling", "question": "Letter B on the map: ______", "answer": "Gym/Fitness centre"},
                        {"id": "L1Q10", "type": "map_labelling", "question": "Letter C on the map: ______", "answer": "Pool/Swimming pool"}
                    ]
                },
                
                # PART 2: Selection Questions (Q11-20)
                {
                    "part_number": 2,
                    "title": "Library Services Update",
                    "context": "A librarian announcing new services and changes",
                    "speakers": ["Librarian"],
                    "question_types": ["selection", "multiple_choice"],
                    
                    "audio_script": """
Good morning everyone. I'm here to update you on some exciting changes to our library services. Please take notes as there's quite a lot of information to cover.

First, our opening hours. Starting next month, we'll be extending our weekday hours. Instead of closing at six PM, we'll now stay open until eight PM on Mondays, Wednesdays, and Fridays. Tuesday and Thursday hours remain unchanged, closing at six. Weekend hours are also extending - we'll now open at nine AM on Saturdays instead of ten, though Sunday hours stay the same.

Now, regarding our new digital services. We've just launched three exciting online resources. The first is an e-book lending platform where you can borrow up to five digital books at a time. The second is an academic journal database - particularly useful for students and researchers. The third is a language learning app with courses in twelve different languages.

For our physical improvements, we've completed renovations on the third floor. The old magazine section has been transformed into a modern collaborative workspace with individual pods for quiet study, group discussion areas, and even a small presentation room with audio-visual equipment. The magazine collection has moved to the second floor.

Some important changes to borrowing rules. The loan period for books is now four weeks instead of three. DVDs remain at one week. We're also introducing a new late fee structure - it's now fifty pence per day for books rather than the previous twenty pence. However, we've removed all fines for children's books to encourage young readers.

Membership options have expanded too. In addition to our free basic membership, we're now offering a premium tier at fifteen pounds annually. Premium members get extended loan periods, priority reservation, and free printing up to fifty pages per month.

Finally, our events programme. This month we're hosting author talks every Saturday afternoon. We also have a book club meeting on the first Tuesday of each month, and children's story time continues every Thursday at four PM.

Any questions can be directed to the information desk. Thank you.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "selection", "question": "Which THREE days will the library have extended evening hours?", "options": ["A) Monday", "B) Tuesday", "C) Wednesday", "D) Thursday", "E) Friday"], "answer": "A, C, E", "num_answers": 3},
                        {"id": "L2Q12", "type": "form_completion", "question": "New Saturday opening time: ______ AM", "answer": "9/nine"},
                        {"id": "L2Q13", "type": "selection", "question": "Which TWO are mentioned as new digital services?", "options": ["A) E-book lending", "B) Online newspapers", "C) Academic journals", "D) Video streaming", "E) Music downloads"], "answer": "A, C", "num_answers": 2},
                        {"id": "L2Q14", "type": "form_completion", "question": "Number of languages in learning app: ______", "answer": "12/twelve"},
                        {"id": "L2Q15", "type": "form_completion", "question": "New magazine section location: ______ floor", "answer": "second/2nd"},
                        {"id": "L2Q16", "type": "form_completion", "question": "New book loan period: ______ weeks", "answer": "4/four"},
                        {"id": "L2Q17", "type": "form_completion", "question": "New late fee for books per day: ______ pence", "answer": "50/fifty"},
                        {"id": "L2Q18", "type": "form_completion", "question": "Premium membership annual cost: £______", "answer": "15/fifteen"},
                        {"id": "L2Q19", "type": "form_completion", "question": "Free printing for premium members: ______ pages monthly", "answer": "50/fifty"},
                        {"id": "L2Q20", "type": "form_completion", "question": "Children's story time day: ______", "answer": "Thursday/Thursdays"}
                    ]
                },
                
                # PART 3: Table Completion + Matching (Q21-30)
                {
                    "part_number": 3,
                    "title": "Internship Discussion",
                    "context": "Two students discussing summer internship opportunities",
                    "speakers": ["Lisa", "James"],
                    "question_types": ["table_completion", "matching"],
                    
                    "visual": {
                        "type": "table",
                        "title": "Internship Comparison",
                        "headers": ["Company", "Duration", "Salary", "Location", "Main Benefit"],
                        "rows": [
                            ["TechStart", "Q21 ______ weeks", "Unpaid", "Q22 ______", "Q23 ______"],
                            ["MediaPro", "10 weeks", "£Q24 ______/week", "London", "Q25 ______"],
                            ["GreenEnergy", "Q26 ______ weeks", "£350/week", "Manchester", "Q27 ______"]
                        ]
                    },
                    
                    "audio_script": """
Lisa: James, have you decided which internship you're applying for this summer?
James: I've narrowed it down to three options. Want to compare notes?
Lisa: Sure, I'm also looking at a few. What's your first choice?
James: TechStart, the startup incubator. It's only eight weeks but it's right here in Birmingham, so I wouldn't have to relocate.
Lisa: Is it paid?
James: No, unfortunately it's unpaid. But the main benefit is the networking - you meet loads of entrepreneurs and investors. They've had interns go on to start their own companies.
Lisa: That's valuable in its own way. What else are you considering?
James: MediaPro in London. It's longer - ten weeks - and they pay four hundred pounds per week.
Lisa: That's decent! What would you be doing?
James: Digital marketing mostly. The big draw is they often hire their interns full-time after graduation. Three of last year's interns got job offers.
Lisa: Sounds competitive. What's your third option?
James: GreenEnergy in Manchester. Twelve weeks, three hundred and fifty pounds weekly. It's in their sustainability division.
Lisa: What makes that one attractive?
James: They offer a guaranteed reference letter from a senior manager. Given my interest in environmental policy, that could really help my future applications.
Lisa: They all sound good. Have you thought about accommodation costs?
James: That's the tricky part. London would eat into the salary with rent. Manchester's more affordable, and Birmingham I could stay at home.
Lisa: When are the application deadlines?
James: TechStart's deadline is January thirtieth. MediaPro is February fifteenth, and GreenEnergy is February twenty-eighth.
Lisa: You've got some time then. Are you applying to all three?
James: I think so. Better to have options. What about you?
Lisa: I'm focusing on publishing internships, but the process is similar.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "table_completion", "question": "TechStart duration: ______ weeks", "answer": "8/eight"},
                        {"id": "L3Q22", "type": "table_completion", "question": "TechStart location: ______", "answer": "Birmingham"},
                        {"id": "L3Q23", "type": "table_completion", "question": "TechStart main benefit: ______", "answer": "networking"},
                        {"id": "L3Q24", "type": "table_completion", "question": "MediaPro weekly salary: £______", "answer": "400"},
                        {"id": "L3Q25", "type": "table_completion", "question": "MediaPro main benefit: potential ______ offers", "answer": "job"},
                        {"id": "L3Q26", "type": "table_completion", "question": "GreenEnergy duration: ______ weeks", "answer": "12/twelve"},
                        {"id": "L3Q27", "type": "table_completion", "question": "GreenEnergy main benefit: guaranteed ______", "answer": "reference letter"},
                        {"id": "L3Q28", "type": "form_completion", "question": "TechStart deadline: January ______", "answer": "30/30th/thirtieth"},
                        {"id": "L3Q29", "type": "form_completion", "question": "MediaPro deadline: February ______", "answer": "15/15th/fifteenth"},
                        {"id": "L3Q30", "type": "form_completion", "question": "GreenEnergy deadline: February ______", "answer": "28/28th/twenty-eighth"}
                    ]
                },
                
                # PART 4: Note Completion Academic (Q31-40)
                {
                    "part_number": 4,
                    "title": "The Psychology of Habit Formation",
                    "context": "A university lecture on behavioural psychology",
                    "speakers": ["Professor"],
                    "question_types": ["note_completion", "sentence_completion"],
                    
                    "audio_script": """
Today's lecture focuses on habit formation - how behaviours become automatic and what strategies can help establish beneficial habits.

The neurological basis of habits lies in a brain region called the basal ganglia. When we repeat an action consistently, the basal ganglia takes over from the prefrontal cortex, which handles conscious decision-making. This transition is what makes habits feel effortless once established.

Research by psychologist Wendy Wood suggests that approximately forty-three percent of our daily actions are habitual rather than consciously chosen. This has profound implications - nearly half our behaviour operates on autopilot.

The habit loop model, popularised by Charles Duhigg, identifies three components. First, the cue - a trigger that initiates the behaviour. Second, the routine - the behaviour itself. Third, the reward - the benefit that reinforces the loop. Understanding this structure helps both in breaking bad habits and forming good ones.

How long does habit formation take? A study at University College London found that on average, a new behaviour takes sixty-six days to become automatic. However, this varied widely between participants, from eighteen to two hundred and fifty-four days depending on the behaviour's complexity.

Several factors influence habit formation speed. Consistency matters enormously - performing the behaviour at the same time and place strengthens the cue-routine connection. Starting small is also crucial. People who commit to tiny habits - say, one push-up rather than fifty - show higher success rates because the low barrier reduces resistance.

Implementation intentions significantly boost success. This means specifying exactly when, where, and how you'll perform the new behaviour. "I will meditate for five minutes after my morning coffee in the kitchen" is more effective than a vague goal to "meditate more."

Habit stacking, a technique promoted by James Clear, involves linking a new habit to an existing one. Since established habits have strong neural pathways, attaching new behaviours to them leverages existing cue-response patterns.

The environment plays a larger role than willpower. Research shows that people who appear to have strong self-control have actually structured their environments to minimise temptation. They've made the desired behaviour the path of least resistance.

Finally, consider identity-based habits. Rather than focusing on outcomes - "I want to lose weight" - focus on identity - "I am someone who eats healthily." When behaviour aligns with self-image, motivation becomes intrinsic rather than external.

Next week, we'll examine how these principles apply to addiction and behaviour change in clinical settings.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "note_completion", "question": "Brain region controlling habits: basal ______", "answer": "ganglia"},
                        {"id": "L4Q32", "type": "note_completion", "question": "Percentage of daily actions that are habitual: ______%", "answer": "43"},
                        {"id": "L4Q33", "type": "note_completion", "question": "Researcher who studied habitual behaviour: Wendy ______", "answer": "Wood"},
                        {"id": "L4Q34", "type": "note_completion", "question": "Three habit loop components: cue, routine, and ______", "answer": "reward"},
                        {"id": "L4Q35", "type": "note_completion", "question": "Average days for habit formation: ______", "answer": "66/sixty-six"},
                        {"id": "L4Q36", "type": "note_completion", "question": "Maximum days reported in UCL study: ______", "answer": "254"},
                        {"id": "L4Q37", "type": "note_completion", "question": "Technique of linking new and existing habits: habit ______", "answer": "stacking"},
                        {"id": "L4Q38", "type": "note_completion", "question": "Author who promoted habit stacking: James ______", "answer": "Clear"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "People with apparent self-control have structured their ______ to minimise temptation.", "answer": "environments"},
                        {"id": "L4Q40", "type": "note_completion", "question": "Focus on ______-based habits rather than outcome-based habits.", "answer": "identity"}
                    ]
                }
            ]
        },
        
        # ============ WRITING SECTION ============
        "writing": {
            "total_time": 3600,
            "tasks": [
                {
                    "task_number": 1,
                    "type": "data_description",
                    "subtype": "process_diagram",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The diagram below shows the process of recycling plastic bottles.",
                    
                    "visual_data": {
                        "type": "process",
                        "title": "Plastic Bottle Recycling Process",
                        "stages": [
                            {"number": 1, "name": "Collection", "description": "Bottles collected from recycling bins"},
                            {"number": 2, "name": "Sorting", "description": "Sorted by plastic type and colour"},
                            {"number": 3, "name": "Cleaning", "description": "Washed to remove labels and residue"},
                            {"number": 4, "name": "Shredding", "description": "Cut into small flakes"},
                            {"number": 5, "name": "Melting", "description": "Heated to 270°C"},
                            {"number": 6, "name": "Pelletizing", "description": "Formed into small pellets"},
                            {"number": 7, "name": "Manufacturing", "description": "Pellets used to make new products"}
                        ],
                        "flow_direction": "left_to_right",
                        "cycle": False
                    },
                    
                    "visual_description": """
PLASTIC BOTTLE RECYCLING PROCESS

Stage 1: COLLECTION - Plastic bottles collected from household and public recycling bins
    ↓
Stage 2: SORTING - Bottles sorted by plastic type (PET, HDPE) and colour at recycling facility
    ↓
Stage 3: CLEANING - Bottles washed in industrial washers to remove labels, caps, and residue
    ↓
Stage 4: SHREDDING - Clean bottles shredded into small plastic flakes (approximately 1cm)
    ↓
Stage 5: MELTING - Flakes heated to 270°C in industrial furnace
    ↓
Stage 6: PELLETIZING - Molten plastic extruded and cut into uniform pellets
    ↓
Stage 7: MANUFACTURING - Pellets sold to manufacturers for new plastic products
""",
                    "requirements": [
                        "Summarise the information by selecting and reporting the main features",
                        "Make comparisons where relevant"
                    ]
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "subtype": "advantages_disadvantages",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "Many universities now offer online degree programmes. Discuss the advantages and disadvantages of studying for a degree online rather than attending a traditional university campus.",
                    "requirements": [
                        "Give reasons for your answer",
                        "Include relevant examples from your own knowledge or experience"
                    ]
                }
            ]
        },
        
        # ============ SPEAKING SECTION ============
        "speaking": {
            "total_time": "11-14 minutes",
            "parts": [
                {
                    "part_number": 1,
                    "title": "Introduction and Interview",
                    "duration": "4-5 minutes",
                    "topics": ["Habits and routines", "Daily life", "Self-improvement"],
                    "questions": [
                        {"id": "S1Q1", "text": "What is your daily routine like?"},
                        {"id": "S1Q2", "text": "Have you ever tried to change a habit? Was it successful?"},
                        {"id": "S1Q3", "text": "Do you think routines are important? Why or why not?"},
                        {"id": "S1Q4", "text": "What time of day do you feel most productive?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a positive habit you have developed",
                        "points": [
                            "What the habit is",
                            "When and why you started it",
                            "How you maintain this habit",
                            "And explain how this habit has benefited you"
                        ]
                    },
                    "follow_up": ["Do you think this habit will be easy to maintain in the future?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Habits and Behaviour Change",
                    "questions": [
                        {"id": "S3Q1", "text": "Why do you think some people find it difficult to break bad habits?"},
                        {"id": "S3Q2", "text": "Do you think technology helps or hinders the formation of good habits?"},
                        {"id": "S3Q3", "text": "Should schools teach children about habit formation?"},
                        {"id": "S3Q4", "text": "How have people's daily habits changed compared to previous generations?"}
                    ]
                }
            ]
        }
    }
}
