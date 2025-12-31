"""
IELTS-Style Academic Full Test - Set C
=======================================
100% ORIGINAL CONTENT

FOCUS AREAS:
- Reading: Matching Features, Matching Information, Short Answer Questions
- Listening: Map/Plan Labelling, Note Completion, 2-option Multiple Choice
- Writing Task 1: Bar chart with table
- Writing Task 2: Problem-Solution essay
"""

ACADEMIC_SET_C = {
    "test_id": "academic_set_c_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set C",
    "description": "Complete IELTS Academic examination with focus on Matching and Short Answer question types.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    "question_type_focus": ["matching_features", "matching_information", "short_answer", "map_labelling"],
    
    "sections": {
        # ============ LISTENING SECTION ============
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Map/Plan Labelling Focus (Q1-10)
                {
                    "part_number": 1,
                    "title": "University Campus Tour",
                    "context": "A student guide showing a new student around the campus",
                    "speakers": ["Guide", "Student"],
                    "question_types": ["map_labelling", "form_completion"],
                    
                    # Visual Map Data - Frontend will render this
                    "visual": {
                        "type": "map",
                        "image_url": "academic_set_c_campus.png",
                        "title": "Westbrook University Campus Map",
                        "description": "Map showing campus buildings. Label the buildings marked A-H.",
                        "orientation": "North at top",
                        "elements": [
                            # Fixed/Given elements (already labeled)
                            {"id": "entrance", "label": "Main Entrance", "position": {"x": 50, "y": 95}, "type": "gate", "given": True},
                            {"id": "lawn", "label": "Central Lawn", "position": {"x": 50, "y": 50}, "type": "area", "given": True},
                            {"id": "path_main", "label": "Main Path", "position": {"x": 50, "y": 70}, "type": "path", "given": True},
                            
                            # Buildings to be labeled by student (A-H)
                            {"id": "A", "label": "?", "position": {"x": 50, "y": 60}, "type": "building", "shape": "rectangle", "given": False},
                            {"id": "B", "label": "?", "position": {"x": 20, "y": 50}, "type": "building", "shape": "rectangle", "note": "glass structure", "given": False},
                            {"id": "C", "label": "?", "position": {"x": 50, "y": 30}, "type": "building", "shape": "rectangle", "given": False},
                            {"id": "D", "label": "?", "position": {"x": 70, "y": 30}, "type": "building", "shape": "rectangle", "given": False},
                            {"id": "E", "label": "?", "position": {"x": 80, "y": 50}, "type": "building", "shape": "tower", "given": False},
                            {"id": "F", "label": "?", "position": {"x": 85, "y": 40}, "type": "building", "shape": "dome", "given": False},
                            {"id": "G", "label": "?", "position": {"x": 90, "y": 20}, "type": "building", "shape": "rectangle", "given": False}
                        ],
                        "compass": {"position": {"x": 90, "y": 90}},
                        "answer_key": {
                            "A": "Administration Building",
                            "B": "Science Complex", 
                            "C": "Main Library",
                            "D": "Student Union",
                            "E": "Engineering Faculty",
                            "F": "Planetarium",
                            "G": "Sports Centre"
                        }
                    },
                    
                    "audio_script": """
Guide: Welcome to Westbrook University. I'm James, and I'll be showing you around the main campus today. Do you have the campus map I emailed you?
Student: Yes, I printed it out. I'm Sarah, by the way. This place is huge!
Guide: It can be overwhelming at first. Let's start from where we're standing now - that's the Main Entrance, which is at the bottom of your map, facing south.
Student: Got it. So we're looking north into the campus?
Guide: Exactly. Now, directly ahead of you, you can see a large brick building. That's the Administration Building. All student registrations and ID cards are handled there.
Student: Is that where I go for my student visa paperwork?
Guide: Yes, the International Office is on the second floor. Now, if you look to your left - that's the west side - you'll see a modern glass structure. That's our Science Complex.
Student: The one with the solar panels on the roof?
Guide: That's right. It houses Biology, Chemistry, and Physics departments. Moving clockwise, the building directly north of where we're standing - past the central lawn - is the Main Library. It's open twenty-four hours during exam periods.
Student: That's useful to know. What about the building to the right of it?
Guide: That's the Student Union. It has cafeterias, common rooms, and the student services desk. Now, on the east side of campus - that's your right - there's a tall tower building. That's the Engineering Faculty.
Student: I can see it. Must be about eight floors?
Guide: Ten actually. Behind it, you'll notice a domed building - that's the Planetarium, part of our Astronomy department. It's open to the public on Friday evenings.
Student: Amazing! What about sports facilities?
Guide: Good question. The Sports Centre is at the northeast corner of campus, behind the Engineering tower. It has an Olympic-sized pool, gym, and indoor courts. The outdoor playing fields are beyond that, but they're not on this map.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "map_labelling", "question": "Write the correct letter A-G: Administration Building", "answer": "A"},
                        {"id": "L1Q2", "type": "map_labelling", "question": "Write the correct letter A-G: Science Complex", "answer": "B"},
                        {"id": "L1Q3", "type": "form_completion", "question": "The Science Complex has ______ panels on the roof", "answer": "solar"},
                        {"id": "L1Q4", "type": "map_labelling", "question": "Write the correct letter A-G: Main Library", "answer": "C"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Library hours during exams: ______ hours", "answer": "24/twenty-four"},
                        {"id": "L1Q6", "type": "map_labelling", "question": "Write the correct letter A-G: Student Union", "answer": "D"},
                        {"id": "L1Q7", "type": "map_labelling", "question": "Write the correct letter A-G: Engineering Faculty", "answer": "E"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Engineering tower number of floors: ______", "answer": "10/ten"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Planetarium public opening day: ______", "answer": "Friday/Fridays"},
                        {"id": "L1Q10", "type": "map_labelling", "question": "Write the correct letter A-G: Sports Centre", "answer": "G"}
                    ]
                },
                
                # PART 2: Note Completion Focus (Q11-20)
                {
                    "part_number": 2,
                    "title": "Public Health Seminar",
                    "context": "A health officer giving a presentation about community wellness programs",
                    "speakers": ["Officer"],
                    "question_types": ["note_completion", "multiple_choice"],
                    "audio_script": """
Good evening everyone, and thank you for attending this community health seminar. I'm Dr. Patricia Wong from the Regional Health Authority, and tonight I'll be outlining our new wellness initiatives for the coming year.

Our flagship program is called "Active Neighborhoods." Research shows that people living in walkable communities have significantly lower rates of obesity and heart disease. We've partnered with city planners to create more pedestrian-friendly zones in residential areas.

The first phase involves installing proper footpaths in twelve neighborhoods that currently lack them. Construction begins next month and should be completed by September. Each pathway will be at least two meters wide, suitable for both walking and cycling.

The second initiative focuses on mental health. We're launching free counseling services at community centres every Saturday. No appointment is necessary - just walk in between nine AM and three PM. Sessions are confidential and conducted by qualified therapists.

Our nutrition program, "Eat Smart," will run cooking workshops twice weekly at the Central Community Hall. These sessions teach participants to prepare healthy meals on a budget. Registration opens on the fifteenth of this month, and spaces are limited to twenty per class.

For seniors specifically, we're introducing "Silver Fitness" classes. These gentle exercise sessions are designed for people over sixty-five and will take place on Monday and Wednesday mornings at various locations. Participants need a doctor's clearance before joining.

We've also secured funding for a new mobile health clinic. This van will visit remote areas of the region every Thursday, providing basic health checks, vaccinations, and medication reviews. The service is entirely free and no registration is required.

Finally, our website has been updated with a symptom checker tool. While this doesn't replace professional medical advice, it can help you decide whether to visit a doctor or manage minor conditions at home. The website also features a database of local health services searchable by postcode.

Leaflets with full details are available at the exit. Any questions?
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "note_completion", "question": "Program name for walkable communities: Active ______", "answer": "Neighborhoods/Neighbourhoods"},
                        {"id": "L2Q12", "type": "note_completion", "question": "Number of neighborhoods getting footpaths: ______", "answer": "12/twelve"},
                        {"id": "L2Q13", "type": "note_completion", "question": "Footpath completion month: ______", "answer": "September"},
                        {"id": "L2Q14", "type": "note_completion", "question": "Footpath minimum width: ______ meters", "answer": "2/two"},
                        {"id": "L2Q15", "type": "note_completion", "question": "Free counseling available on: ______", "answer": "Saturday/Saturdays"},
                        {"id": "L2Q16", "type": "note_completion", "question": "Cooking workshop location: ______ Community Hall", "answer": "Central"},
                        {"id": "L2Q17", "type": "note_completion", "question": "Maximum cooking class size: ______", "answer": "20/twenty"},
                        {"id": "L2Q18", "type": "note_completion", "question": "Silver Fitness minimum age: ______", "answer": "65/sixty-five"},
                        {"id": "L2Q19", "type": "note_completion", "question": "Mobile clinic visiting day: ______", "answer": "Thursday/Thursdays"},
                        {"id": "L2Q20", "type": "note_completion", "question": "Website tool for self-diagnosis: symptom ______", "answer": "checker"}
                    ]
                },
                
                # PART 3: 2-option Multiple Choice + Matching (Q21-30)
                {
                    "part_number": 3,
                    "title": "Research Project Discussion",
                    "context": "Two students and their supervisor discussing a psychology research project",
                    "speakers": ["Dr. Harris", "Emma", "Tom"],
                    "question_types": ["multiple_choice_2opt", "matching"],
                    "audio_script": """
Dr. Harris: Emma, Tom, thanks for coming in. Let's discuss your joint research project on consumer behavior. How's it progressing?
Emma: We've collected all our survey data, Dr. Harris. Three hundred and forty-two responses in total.
Tom: But we're having some disagreements about the analysis methodology.
Dr. Harris: I see. What's the issue?
Emma: I think we should use qualitative coding for the open-ended questions first, then run statistical tests on the numerical data.
Tom: But I feel we'd get more robust results if we started with the quantitative analysis. The patterns might inform how we interpret the qualitative responses.
Dr. Harris: Both approaches have merit. Emma's suggestion follows a more traditional grounded theory approach, while Tom, you're proposing a more hypothesis-driven method. Given your research questions, I'd actually recommend Emma's approach for this particular study.
Emma: Thank you. The other issue is our sample demographics.
Tom: Right. We ended up with mostly female respondents - about seventy percent. And the age range skewed younger than we intended.
Dr. Harris: That's common with online surveys. You could weight your results, or clearly acknowledge this as a limitation. I'd suggest the latter for an undergraduate project.
Emma: What about our timeline? We're worried about the deadline.
Dr. Harris: When's your submission date?
Tom: April thirtieth.
Dr. Harris: That gives you eight weeks. My advice would be to complete the analysis within three weeks, leaving plenty of time for writing and revision. Don't underestimate how long the write-up takes.
Emma: Should we split the sections between us?
Dr. Harris: Yes, but make sure you both review everything. Tom, given your statistics background, perhaps you could lead on the methodology section. Emma, your writing skills would suit the discussion and conclusion.
Tom: That makes sense.
Dr. Harris: One more thing - have you considered the ethical implications section? The ethics committee feedback needs addressing before submission.
Emma: We received their comments last week. They want more detail on data anonymization procedures.
Dr. Harris: Address that promptly. It shouldn't delay you significantly, but don't leave it until the last minute. Any other concerns?
Tom: I think we're clearer now. Thanks, Dr. Harris.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "form_completion", "question": "Total survey responses collected: ______", "answer": "342"},
                        {"id": "L3Q22", "type": "multiple_choice_2opt", "question": "Whose analysis approach does Dr. Harris recommend?", "options": ["Emma's approach", "Tom's approach"], "answer": "Emma's approach"},
                        {"id": "L3Q23", "type": "form_completion", "question": "Percentage of female respondents: ______%", "answer": "70/seventy"},
                        {"id": "L3Q24", "type": "multiple_choice_2opt", "question": "For the demographic issue, Dr. Harris suggests:", "options": ["Weight the results", "Acknowledge as limitation"], "answer": "Acknowledge as limitation"},
                        {"id": "L3Q25", "type": "form_completion", "question": "Submission deadline: April ______", "answer": "30/30th/thirtieth"},
                        {"id": "L3Q26", "type": "form_completion", "question": "Time until deadline: ______ weeks", "answer": "8/eight"},
                        {"id": "L3Q27", "type": "form_completion", "question": "Recommended time for analysis: ______ weeks", "answer": "3/three"},
                        {"id": "L3Q28", "type": "matching", "question": "Tom should lead on which section?", "answer": "methodology"},
                        {"id": "L3Q29", "type": "matching", "question": "Emma should lead on which sections?", "answer": "discussion and conclusion"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Ethics committee wants more detail on: data ______ procedures", "answer": "anonymization/anonymisation"}
                    ]
                },
                
                # PART 4: Short Answer + Sentence Completion (Q31-40)
                {
                    "part_number": 4,
                    "title": "The Evolution of Writing Systems",
                    "context": "A university lecture on the history and development of writing",
                    "speakers": ["Professor"],
                    "question_types": ["short_answer", "sentence_completion"],
                    "audio_script": """
Today we're examining one of humanity's most transformative inventions: writing. The ability to record information permanently changed the course of civilization, enabling complex societies, accumulated knowledge, and historical memory.

The earliest writing systems emerged independently in at least four regions: Mesopotamia, Egypt, China, and Mesoamerica. Interestingly, these civilizations developed writing without direct contact, suggesting that once societies reach a certain complexity, written communication becomes necessary.

Cuneiform, developed in Mesopotamia around 3400 BCE, is often considered the first true writing system. Initially, it used pictographs - simple pictures representing objects or ideas. Over centuries, these evolved into abstract wedge-shaped marks pressed into clay tablets. The Sumerians used cuneiform primarily for accounting purposes, recording transactions and inventories.

Egyptian hieroglyphics emerged slightly later, around 3200 BCE. Unlike cuneiform, hieroglyphics maintained their pictorial nature throughout their three-thousand-year history. This is partly because Egyptians used writing extensively for religious and ceremonial purposes, where visual aesthetics mattered.

Chinese characters, developed around 1200 BCE, remain in use today - making them the oldest continuously used writing system. The key feature of Chinese writing is its logographic nature: each character represents a word or meaningful unit, rather than a sound.

The alphabet - where symbols represent individual sounds - was a revolutionary simplification. The Phoenicians developed the first widely adopted alphabet around 1050 BCE, containing just twenty-two letters, all consonants. The Greeks later added vowels, creating the template for most modern European alphabets.

The impact of alphabetic writing was profound. Literacy became achievable for ordinary people, not just specialized scribes. The reduced symbol set made learning to read and write far less time-consuming.

Moving to modern times, the twentieth century brought new writing challenges. The typewriter standardized document formatting. Computers initially replicated typewriter limitations but eventually enabled unprecedented flexibility. Today, Unicode can represent virtually every writing system ever devised, containing over one hundred and forty thousand characters.

The future of writing remains open. Voice recognition and artificial intelligence may eventually reduce our reliance on written text. Yet writing's fundamental achievement - the external storage of human thought - seems unlikely to be superseded entirely.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "short_answer", "question": "How many regions independently developed writing systems?", "answer": "4/four"},
                        {"id": "L4Q32", "type": "short_answer", "question": "What was the primary purpose of Sumerian cuneiform?", "answer": "accounting"},
                        {"id": "L4Q33", "type": "sentence_completion", "question": "Cuneiform used ______ pressed into clay tablets.", "answer": "wedge-shaped marks"},
                        {"id": "L4Q34", "type": "short_answer", "question": "When did Egyptian hieroglyphics emerge?", "answer": "3200 BCE"},
                        {"id": "L4Q35", "type": "sentence_completion", "question": "Hieroglyphics were important for religious and ______ purposes.", "answer": "ceremonial"},
                        {"id": "L4Q36", "type": "short_answer", "question": "What type of writing system is Chinese?", "answer": "logographic"},
                        {"id": "L4Q37", "type": "short_answer", "question": "How many letters were in the Phoenician alphabet?", "answer": "22/twenty-two"},
                        {"id": "L4Q38", "type": "sentence_completion", "question": "The Greeks added ______ to the Phoenician alphabet.", "answer": "vowels"},
                        {"id": "L4Q39", "type": "short_answer", "question": "How many characters does Unicode contain?", "answer": "140000/one hundred and forty thousand"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "Writing's fundamental achievement is the external storage of human ______.", "answer": "thought"}
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
                    "subtype": "bar_chart_with_table",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The bar chart shows the percentage of people who cycled to work in five European cities in 2010 and 2020. The table shows the average distance cycled per person per week in the same cities.",
                    # Structured Chart Data for Frontend Rendering
                    "visual_data": {
                        "type": "combined",
                        "charts": [
                            {
                                "chart_type": "bar",
                                "title": "Percentage of People Cycling to Work",
                                "x_axis": "City",
                                "y_axis": "Percentage (%)",
                                "legend": ["2010", "2020"],
                                "data": [
                                    {"city": "Amsterdam", "2010": 35, "2020": 48},
                                    {"city": "Copenhagen", "2010": 30, "2020": 42},
                                    {"city": "Berlin", "2010": 12, "2020": 19},
                                    {"city": "Paris", "2010": 5, "2020": 14},
                                    {"city": "London", "2010": 3, "2020": 8}
                                ]
                            },
                            {
                                "chart_type": "table",
                                "title": "Average Distance Cycled (km/person/week)",
                                "headers": ["City", "2010", "2020"],
                                "data": [
                                    ["Amsterdam", 22, 28],
                                    ["Copenhagen", 18, 24],
                                    ["Berlin", 8, 12],
                                    ["Paris", 3, 7],
                                    ["London", 2, 5]
                                ]
                            }
                        ]
                    },
                    "visual_description": """
BAR CHART - Cycling to Work (%)
                    2010    2020
Amsterdam           35%     48%
Copenhagen          30%     42%
Berlin              12%     19%
Paris                5%     14%
London               3%      8%

TABLE - Average Distance Cycled (km/person/week)
City          2010    2020
Amsterdam      22      28
Copenhagen     18      24
Berlin          8      12
Paris           3       7
London          2       5
""",
                    "requirements": [
                        "Summarise the information by selecting and reporting the main features",
                        "Make comparisons where relevant"
                    ]
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "subtype": "problem_solution",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "In many cities, traffic congestion is becoming an increasingly serious problem. What are the causes of this problem, and what measures could be taken to reduce traffic in cities?",
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
                    "topics": ["Maps and directions", "Your neighborhood", "Getting around"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you often use maps? Why or why not?"},
                        {"id": "S1Q2", "text": "How do you usually find your way when visiting a new place?"},
                        {"id": "S1Q3", "text": "Has technology changed how people navigate? In what ways?"},
                        {"id": "S1Q4", "text": "Do you think it's important for children to learn to read maps?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a place in your town or city that you know very well",
                        "points": [
                            "Where it is located",
                            "How often you go there",
                            "What you do there",
                            "And explain why you know this place so well"
                        ]
                    },
                    "follow_up": ["Would you recommend this place to visitors?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Urban Development and City Planning",
                    "questions": [
                        {"id": "S3Q1", "text": "What facilities do you think are essential in a good neighborhood?"},
                        {"id": "S3Q2", "text": "How have cities changed in your country over the past few decades?"},
                        {"id": "S3Q3", "text": "Do you think cities are becoming too crowded? What could be done about this?"},
                        {"id": "S3Q4", "text": "How important is it to preserve old buildings in modern cities?"}
                    ]
                }
            ]
        }
    }
}
