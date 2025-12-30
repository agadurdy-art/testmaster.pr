"""
IELTS-Style Academic Full Test - Set E
=======================================
100% ORIGINAL CONTENT

FOCUS AREAS:
- Reading: Yes/No/Not Given heavy, Diagram labelling, Summary completion
- Listening: Flowchart completion, Mixed accents, Multiple choice
- Writing Task 1: Pie chart comparison
- Writing Task 2: Double question essay
"""

ACADEMIC_SET_E = {
    "test_id": "academic_set_e_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set E",
    "description": "Complete IELTS Academic examination with focus on rare question types including YNNG and Double Question essays.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    "question_type_focus": ["yes_no_ng", "diagram_labelling", "flowchart", "pie_chart", "double_question"],
    
    "sections": {
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                {
                    "part_number": 1,
                    "title": "Doctor's Appointment Booking",
                    "context": "A patient booking an appointment at a medical clinic",
                    "speakers": ["Receptionist", "Patient"],
                    "question_types": ["form_completion"],
                    "audio_script": """
Receptionist: Good morning, Riverside Health Centre. How can I help you?
Patient: Hello, I'd like to book an appointment with Dr. Patterson please.
Receptionist: Certainly. Can I take your name?
Patient: Yes, it's Oliver Henshaw. That's H-E-N-S-H-A-W.
Receptionist: Thank you, Mr Henshaw. And your date of birth?
Patient: Fifteenth of August, nineteen eighty-seven.
Receptionist: Let me just check... I don't seem to have you on our system. Are you a new patient?
Patient: Yes, I've just moved to the area. My previous surgery was Greenfield Medical Practice.
Receptionist: I see. You'll need to register first. What's your current address?
Patient: It's forty-seven Maple Avenue, that's M-A-P-L-E Avenue.
Receptionist: And the postcode?
Patient: RH6 8PQ.
Receptionist: Perfect. Contact number?
Patient: My mobile is oh-seven-seven-double four-nine-three-six-eight-two-one.
Receptionist: And what's the reason for your appointment?
Patient: I've been having persistent headaches for about three weeks now.
Receptionist: I'll note that down. Dr. Patterson has availability on Thursday at nine forty-five AM or Friday at two thirty PM.
Patient: Thursday morning would be better.
Receptionist: Thursday the twenty-third at nine forty-five. Please arrive ten minutes early to complete registration forms. Do you have any allergies we should know about?
Patient: Yes, I'm allergic to penicillin.
Receptionist: I've added that to your file. See you Thursday, Mr Henshaw.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Patient surname: ______", "answer": "Henshaw"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Date of birth: 15th August ______", "answer": "1987"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Previous surgery: ______ Medical Practice", "answer": "Greenfield"},
                        {"id": "L1Q4", "type": "form_completion", "question": "House number: ______", "answer": "47"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Street name: ______ Avenue", "answer": "Maple"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Postcode: RH6 ______", "answer": "8PQ"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Mobile number: 07744 ______", "answer": "936821"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Reason for visit: persistent ______", "answer": "headaches"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Appointment day: ______", "answer": "Thursday"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Allergy: ______", "answer": "penicillin"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Art Gallery Tour",
                    "context": "A guide explaining exhibits at an art gallery",
                    "speakers": ["Guide"],
                    "question_types": ["multiple_choice", "form_completion"],
                    "audio_script": """
Welcome to the National Portrait Gallery. I'm your guide this afternoon, and I'll be taking you through our most celebrated works.

We're standing in the West Wing, which houses our permanent collection of eighteenth-century portraits. The gallery was established in eighteen fifty-six, making it the first portrait gallery in the world. Our collection now numbers over eleven thousand works.

The painting directly ahead is our most famous piece - the Chandos portrait of William Shakespeare, believed to be the only portrait painted during his lifetime. It was our very first acquisition, purchased for three hundred and fifty guineas. The artist remains unknown, though several names have been proposed.

Moving to your right, you'll see a series of royal portraits. The large canvas in the centre shows Queen Elizabeth the First in her coronation robes. Notice the intricate detail in the fabric - each pearl was painted individually. This technique took the artist, an anonymous court painter, approximately eight months to complete.

Our Tudor collection continues in the next room, but first, note the portrait of Sir Thomas More by Hans Holbein the Younger. Holbein was court painter to Henry the Eighth and is considered one of the greatest portraitists of all time. This work dates from fifteen twenty-seven.

The gallery is open daily from ten until six, with extended hours until nine on Fridays. Admission is free, though we welcome donations. Special exhibitions in the East Wing have a separate charge of twelve pounds, or eight pounds for concessions.

Photography is permitted in the permanent collection but not in special exhibitions. Please refrain from using flash as it damages the pigments over time.

The café on the ground floor serves lunch until three, and our gift shop stocks a wide range of art books and prints. Guided tours like this one run at eleven and two daily. Any questions before we continue?
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "form_completion", "question": "Gallery established: ______", "answer": "1856"},
                        {"id": "L2Q12", "type": "form_completion", "question": "Total works in collection: over ______", "answer": "11000/11,000/eleven thousand"},
                        {"id": "L2Q13", "type": "form_completion", "question": "Shakespeare portrait purchase price: ______ guineas", "answer": "350"},
                        {"id": "L2Q14", "type": "form_completion", "question": "Elizabeth I portrait completion time: ______ months", "answer": "8/eight"},
                        {"id": "L2Q15", "type": "form_completion", "question": "Holbein's role: court ______", "answer": "painter"},
                        {"id": "L2Q16", "type": "form_completion", "question": "Thomas More portrait date: ______", "answer": "1527"},
                        {"id": "L2Q17", "type": "form_completion", "question": "Standard closing time: ______ PM", "answer": "6/six"},
                        {"id": "L2Q18", "type": "form_completion", "question": "Friday extended hours until: ______ PM", "answer": "9/nine"},
                        {"id": "L2Q19", "type": "form_completion", "question": "Special exhibition standard price: £______", "answer": "12/twelve"},
                        {"id": "L2Q20", "type": "form_completion", "question": "Concession price: £______", "answer": "8/eight"}
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Research Methods Discussion",
                    "context": "Students and tutor discussing a research methodology",
                    "speakers": ["Dr. Chen", "Amy", "David"],
                    "question_types": ["flowchart_completion", "multiple_choice"],
                    
                    "visual": {
                        "type": "flowchart",
                        "title": "Research Process",
                        "stages": [
                            {"step": 1, "label": "Literature Review", "next": 2},
                            {"step": 2, "label": "Q21: ______", "next": 3},
                            {"step": 3, "label": "Q22: ______ Design", "next": 4},
                            {"step": 4, "label": "Q23: ______", "next": 5},
                            {"step": 5, "label": "Data Q24: ______", "next": 6},
                            {"step": 6, "label": "Q25: Writing"}
                        ]
                    },
                    
                    "audio_script": """
Dr. Chen: Amy, David, let's discuss your progress on the research methodology. Where are you in the process?
Amy: We've completed the literature review stage. We found about forty relevant papers.
Dr. Chen: Good. The next stage should be formulating your research questions. Have you done that?
David: We're working on it. We've drafted three main questions but we're not sure if they're focused enough.
Dr. Chen: Let me see them. Yes, the first one is quite broad. Try to narrow it down to something more testable.
Amy: After the research questions, we move to the survey design, right?
Dr. Chen: Exactly. Survey design is crucial. You'll need to decide on question types - closed questions for quantitative data, open questions for qualitative insights.
David: How many respondents do we need?
Dr. Chen: For statistical validity, aim for at least one hundred and fifty. After you've designed the survey, the next stage is pilot testing.
Amy: What does that involve exactly?
Dr. Chen: You run the survey with a small group - maybe fifteen to twenty people - to identify any problems with wording or structure. It's essential before full deployment.
David: Then we collect the actual data?
Dr. Chen: Yes, data collection follows. Allow at least three weeks for sufficient responses. After that comes data analysis - that's where you'll use the statistical software we discussed.
Amy: And finally the write-up?
Dr. Chen: Report writing, yes. But don't underestimate it - presenting findings clearly takes time. Budget at least four weeks for that stage.
David: Thanks, Dr. Chen. This really helps clarify the timeline.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "flowchart_completion", "question": "Stage 2: Research ______", "answer": "Questions"},
                        {"id": "L3Q22", "type": "flowchart_completion", "question": "Stage 3: ______ Design", "answer": "Survey"},
                        {"id": "L3Q23", "type": "flowchart_completion", "question": "Stage 4: ______ Testing", "answer": "Pilot"},
                        {"id": "L3Q24", "type": "flowchart_completion", "question": "Stage 5: Data ______", "answer": "Collection"},
                        {"id": "L3Q25", "type": "flowchart_completion", "question": "Stage 6: Report ______", "answer": "Writing"},
                        {"id": "L3Q26", "type": "form_completion", "question": "Papers found in literature review: about ______", "answer": "40/forty"},
                        {"id": "L3Q27", "type": "form_completion", "question": "Minimum respondents needed: ______", "answer": "150"},
                        {"id": "L3Q28", "type": "form_completion", "question": "Pilot test group size: ______ to 20 people", "answer": "15/fifteen"},
                        {"id": "L3Q29", "type": "form_completion", "question": "Data collection minimum time: ______ weeks", "answer": "3/three"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Report writing time budget: ______ weeks", "answer": "4/four"}
                    ]
                },
                {
                    "part_number": 4,
                    "title": "The Science of Memory",
                    "context": "A lecture on human memory and cognitive psychology",
                    "speakers": ["Professor"],
                    "question_types": ["sentence_completion", "multiple_choice"],
                    "audio_script": """
Today we examine human memory - one of the most complex and fascinating aspects of cognition. Understanding how memory works has practical implications for education, therapy, and daily life.

Memory is not a single system but comprises multiple distinct processes. The most influential model, proposed by Atkinson and Shiffrin in nineteen sixty-eight, distinguishes three stores: sensory memory, short-term memory, and long-term memory.

Sensory memory holds information for mere milliseconds - iconic memory for visual stimuli, echoic memory for auditory. Its capacity is large but duration extremely brief. Information must be attended to within about half a second or it's lost entirely.

Short-term memory, now often called working memory, can hold approximately seven items for about twenty to thirty seconds without rehearsal. George Miller's famous paper, "The Magical Number Seven," established this capacity limit. Working memory is where we actively manipulate information - doing mental arithmetic, for instance.

Long-term memory has effectively unlimited capacity and duration. It divides into declarative memory - facts and events we can consciously recall - and procedural memory - skills and habits that operate automatically. You use declarative memory to remember your first day at school; procedural memory to ride a bicycle.

Encoding is the process of converting information into memory. Depth of processing matters enormously. Shallow processing - focusing on superficial features like font or colour - produces weak memories. Deep processing - considering meaning, making connections, generating examples - creates durable traces.

Retrieval is equally important. Memories aren't simply stored and fetched like files; they're reconstructed each time. This reconstruction is prone to error, which explains why eyewitness testimony can be unreliable. Elizabeth Loftus's research demonstrated how easily false memories can be implanted through suggestive questioning.

Sleep plays a crucial role in memory consolidation. During sleep, especially slow-wave and REM stages, the brain replays and strengthens new memories. Students who sleep well after studying outperform those who don't, even controlling for study time.

Practical implications abound. Spaced practice - distributing study over time - dramatically outperforms massed practice. Testing yourself retrieves memories, strengthening them more than passive re-reading. Teaching others requires deep processing, cementing your own understanding.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "form_completion", "question": "Atkinson-Shiffrin model proposed: ______", "answer": "1968"},
                        {"id": "L4Q32", "type": "form_completion", "question": "Sensory memory duration: about ______ second(s)", "answer": "0.5/half"},
                        {"id": "L4Q33", "type": "form_completion", "question": "Short-term memory capacity: approximately ______ items", "answer": "7/seven"},
                        {"id": "L4Q34", "type": "form_completion", "question": "Short-term memory duration without rehearsal: ______ to 30 seconds", "answer": "20/twenty"},
                        {"id": "L4Q35", "type": "form_completion", "question": "Miller's famous paper title includes: The Magical Number ______", "answer": "Seven/7"},
                        {"id": "L4Q36", "type": "sentence_completion", "question": "Declarative memory stores facts and ______.", "answer": "events"},
                        {"id": "L4Q37", "type": "sentence_completion", "question": "Procedural memory handles skills and ______.", "answer": "habits"},
                        {"id": "L4Q38", "type": "form_completion", "question": "False memory researcher: Elizabeth ______", "answer": "Loftus"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "Spaced practice is better than ______ practice.", "answer": "massed"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "Memory consolidation happens during ______.", "answer": "sleep"}
                    ]
                }
            ]
        },
        
        "writing": {
            "total_time": 3600,
            "tasks": [
                {
                    "task_number": 1,
                    "type": "data_description",
                    "subtype": "pie_chart",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The pie charts below show the main reasons why students chose to study at a particular university in 2000 and 2020.",
                    
                    "visual_data": {
                        "type": "pie_chart_comparison",
                        "title": "Reasons for University Choice",
                        "charts": [
                            {
                                "year": 2000,
                                "data": [
                                    {"reason": "Course reputation", "percentage": 35},
                                    {"reason": "Location", "percentage": 25},
                                    {"reason": "Cost/Fees", "percentage": 20},
                                    {"reason": "Facilities", "percentage": 12},
                                    {"reason": "Social life", "percentage": 8}
                                ]
                            },
                            {
                                "year": 2020,
                                "data": [
                                    {"reason": "Career prospects", "percentage": 32},
                                    {"reason": "Course reputation", "percentage": 28},
                                    {"reason": "Cost/Fees", "percentage": 18},
                                    {"reason": "Location", "percentage": 14},
                                    {"reason": "Facilities", "percentage": 8}
                                ]
                            }
                        ]
                    },
                    "visual_description": """
2000:
- Course reputation: 35%
- Location: 25%
- Cost/Fees: 20%
- Facilities: 12%
- Social life: 8%

2020:
- Career prospects: 32%
- Course reputation: 28%
- Cost/Fees: 18%
- Location: 14%
- Facilities: 8%
""",
                    "requirements": [
                        "Summarise the information by selecting and reporting the main features",
                        "Make comparisons where relevant"
                    ]
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "subtype": "double_question",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "Many museums and historical sites are mainly visited by tourists, not local people. Why is this? What can be done to encourage more local people to visit these places?",
                    "requirements": [
                        "Give reasons for your answer",
                        "Include relevant examples from your own knowledge or experience"
                    ]
                }
            ]
        },
        
        "speaking": {
            "total_time": "11-14 minutes",
            "parts": [
                {
                    "part_number": 1,
                    "title": "Introduction and Interview",
                    "duration": "4-5 minutes",
                    "topics": ["Memory", "Learning", "Studying"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you have a good memory? Why do you think that is?"},
                        {"id": "S1Q2", "text": "What things do you find easy to remember?"},
                        {"id": "S1Q3", "text": "How do you try to remember important things?"},
                        {"id": "S1Q4", "text": "Do you think your memory has changed as you've got older?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe something you learned recently that you found difficult",
                        "points": [
                            "What you learned",
                            "Why you needed to learn it",
                            "What made it difficult",
                            "And explain how you felt when you finally learned it"
                        ]
                    },
                    "follow_up": ["Do you enjoy learning new things?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Education and Learning",
                    "questions": [
                        {"id": "S3Q1", "text": "What do you think is the best way to learn something new?"},
                        {"id": "S3Q2", "text": "How has technology changed the way people learn?"},
                        {"id": "S3Q3", "text": "Do you think some people are naturally better at learning than others?"},
                        {"id": "S3Q4", "text": "Should education focus more on practical skills or academic knowledge?"}
                    ]
                }
            ]
        }
    }
}
