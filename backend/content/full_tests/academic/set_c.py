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
                    "title": "Recreation Ground Changes",
                    "context": "A council officer describing proposed changes to a recreation ground to local residents",
                    "speakers": ["Officer", "Resident"],
                    "question_types": ["map_labelling"],
                    
                    "visual": {
                        "type": "map",
                        "image_url": "visual_006_map_recreation_after.png",
                        "title": "Recreation ground after proposed changes",
                        "description": "Map showing recreation ground after proposed changes. Label the areas marked A-I.",
                        "orientation": "North at top",
                        "elements": [
                            {"id": "road", "label": "Road", "position": "top", "type": "road", "given": True},
                            {"id": "river", "label": "River", "position": "bottom", "type": "water", "given": True},
                            {"id": "community_hall", "label": "Community Hall", "position": "top-right", "type": "building", "given": True},
                            {"id": "field", "label": "Field", "position": "centre-right", "type": "area", "given": True},
                            {"id": "A", "label": "?", "type": "area", "given": False},
                            {"id": "B", "label": "?", "type": "area", "given": False},
                            {"id": "C", "label": "?", "type": "area", "given": False},
                            {"id": "D", "label": "?", "type": "area", "given": False},
                            {"id": "E", "label": "?", "type": "area", "given": False},
                            {"id": "F", "label": "?", "type": "area", "given": False}
                        ],
                        "answer_key": {
                            "A": "New car park",
                            "B": "Cricket pitch",
                            "C": "Playground",
                            "D": "Skateboard ramp",
                            "E": "Pavilion",
                            "F": "Notice board"
                        }
                    },
                    
                    "audio_script": """
Officer: Good evening, everyone. Thank you for coming to this meeting about the proposed changes to the recreation ground. I'm David Clarke from the town council. As you can see on the map I've distributed, the recreation ground borders the road to the north and the river runs along the southern edge. The Community Hall is in the northeast corner, and the main open field is on the right-hand side.

Now, let me walk you through the proposed changes. First, you'll notice area A on the map, which is at the top left, next to the road. We're planning to build a new car park there. Currently people park along the road, which causes congestion, so this should help considerably.

Resident: How many spaces will that have?

Officer: Around forty-five spaces, including disabled parking. Now, moving down from the car park, area B is in the centre-left of the map. This will become a proper cricket pitch. Several local teams have been requesting dedicated facilities for years.

Next to the cricket pitch, slightly to the south, you can see area C. This is earmarked for a children's playground. It will have climbing frames, swings, and a sandpit - all suitable for children aged three to twelve.

Resident: What about older children?

Officer: Great question. That brings us to area D, which is in the lower left part of the map, closer to the river. We're installing a skateboard ramp there. It's positioned away from the playground for safety reasons.

Now, area E is between the field and the Community Hall, on the right side. We're building a pavilion there - it will have changing rooms, showers, and a small kitchen for events and matches.

Finally, area F is right at the entrance from the road, near the new car park. We're putting up a large notice board there so visitors can see upcoming events, maps, and safety information as they arrive.

Resident: When will the work start?

Officer: Construction begins in March and should be completed by August.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "map_labelling", "question": "Write the correct letter A-F next to Questions 15-20.\n\nQ15: New car park", "answer": "A"},
                        {"id": "L1Q2", "type": "map_labelling", "question": "Q16: Cricket pitch", "answer": "B"},
                        {"id": "L1Q3", "type": "map_labelling", "question": "Q17: Playground", "answer": "C"},
                        {"id": "L1Q4", "type": "map_labelling", "question": "Q18: Skateboard ramp", "answer": "D"},
                        {"id": "L1Q5", "type": "map_labelling", "question": "Q19: Pavilion", "answer": "E"},
                        {"id": "L1Q6", "type": "map_labelling", "question": "Q20: Notice board", "answer": "F"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Number of parking spaces planned: approximately ______", "answer": "45/forty-five"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Playground suitable for children aged ______ to twelve", "answer": "3/three"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Construction begins in: ______", "answer": "March"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Completion expected by: ______", "answer": "August"}
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
                    "subtype": "process_diagram",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The diagram below shows how plastic bottles are recycled.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                    "visual_data": {
                        "type": "process",
                        "image_url": "visual_010_process_plastic_recycling.png",
                        "title": "How plastic bottles are recycled",
                        "stages": [
                            {"number": 1, "name": "Collection", "description": "Plastic bottles are collected from recycling bins and taken to a recycling centre"},
                            {"number": 2, "name": "Sorting", "description": "Bottles are sorted by hand and by machine into different types of plastic"},
                            {"number": 3, "name": "Crushing", "description": "Sorted bottles are crushed and compressed into large blocks"},
                            {"number": 4, "name": "Washing", "description": "Crushed plastic is washed in large vats to remove labels and dirt"},
                            {"number": 5, "name": "Shredding", "description": "Clean plastic is shredded into small flakes"},
                            {"number": 6, "name": "Heating", "description": "Flakes are heated and melted into liquid plastic"},
                            {"number": 7, "name": "Pelletizing", "description": "Molten plastic is formed into uniform pellets"},
                            {"number": 8, "name": "Raw material", "description": "Pellets are used as raw material for producing new products"},
                            {"number": 9, "name": "End products", "description": "New products such as clothing, containers, bottles and bags are manufactured"}
                        ],
                        "flow_direction": "left_to_right_with_wrap",
                        "cycle": False
                    },
                    "visual_description": "Process diagram showing 9 stages of plastic bottle recycling. Starts with collection from recycling bins, then sorting by type, crushing into blocks, washing to remove contaminants, shredding into flakes, heating/melting, pelletizing, and finally manufacturing new products including clothing, containers, bottles and bags.",
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
