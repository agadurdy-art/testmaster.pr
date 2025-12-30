"""
IELTS-Style Academic Full Test - Set B
=======================================
100% ORIGINAL CONTENT - NOT COPIED FROM CAMBRIDGE

This test matches IELTS Academic format, timing, and difficulty level.
Different topics and scenarios from Set A for variety.
"""

from typing import Dict, Any

ACADEMIC_SET_B = {
    "test_id": "academic_set_b_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set B",
    "description": "Complete IELTS Academic examination covering all 4 skills: Listening, Reading, Writing, and Speaking.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    
    "sections": {
        # ============ LISTENING SECTION ============
        "listening": {
            "total_questions": 40,
            "total_time": 2400,  # 40 minutes
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Social/Transactional (Q1-10)
                {
                    "part_number": 1,
                    "title": "Student Accommodation Inquiry",
                    "context": "A phone conversation between a student and university accommodation office",
                    "speakers": ["Officer", "Student"],
                    "audio_script": """
Officer: Good morning, University Housing Office. How can I help you?
Student: Hi, I'm an incoming international student and I need to arrange accommodation for next semester.
Officer: Of course. Can I take your name please?
Student: Yes, it's Maria Santos. That's S-A-N-T-O-S.
Officer: Thank you, Maria. And your student ID number?
Student: It's seven-four-two-nine-eight-six.
Officer: Perfect. Now, we have three types of accommodation available. First is shared dormitory rooms at one hundred and twenty pounds per week.
Student: What does that include?
Officer: Shared room with one other student, access to communal kitchen and bathroom, and basic internet.
Student: What about private rooms?
Officer: Single rooms are one hundred and seventy-five pounds weekly, and studio apartments are two hundred and thirty pounds. Studios include a small kitchen area.
Student: I think a single room would be best. Is there availability in January?
Officer: Let me check. Yes, we have rooms in both North Campus and Riverside Hall. North Campus is closer to the Science Faculty.
Student: I'm studying Biology, so North Campus sounds ideal.
Officer: Excellent choice. You'll need to pay a deposit of three hundred and fifty pounds to secure your booking.
Student: Can I pay by bank transfer?
Officer: Yes, our account details will be sent to your university email. The deposit is due by December fifteenth.
Student: One more question - is there parking available?
Officer: Yes, student parking permits cost forty-five pounds per month. You'll need to apply separately through the transport office.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Student's surname: ______", "answer": "Santos"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Student ID number: ______", "answer": "742986"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Shared dormitory cost per week: £______", "answer": "120"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Single room weekly cost: £______", "answer": "175"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Studio apartment weekly cost: £______", "answer": "230"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Student's field of study: ______", "answer": "Biology"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Preferred accommodation location: ______ Campus", "answer": "North"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Required deposit amount: £______", "answer": "350"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Deposit deadline: December ______", "answer": "15/15th/fifteenth"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Monthly parking permit cost: £______", "answer": "45"}
                    ]
                },
                
                # PART 2: Monologue - Social Context (Q11-20)
                {
                    "part_number": 2,
                    "title": "Science Museum Tour",
                    "context": "A guide giving information about a science museum",
                    "speakers": ["Guide"],
                    "audio_script": """
Welcome to the National Science Museum. I'm your guide today, and I'll be giving you an overview of our facilities before you explore on your own.

The museum was established in nineteen fifty-two and has since become one of the country's most visited educational attractions. We receive approximately eight hundred thousand visitors annually.

Let me explain our layout. We're currently in the main entrance hall. Directly ahead is the Space Exploration gallery, which houses our newest exhibit - a full-scale replica of the lunar landing module. This gallery opened just six months ago and has been incredibly popular.

To your left, you'll find the Natural World section, featuring interactive displays about ecosystems and biodiversity. Children particularly enjoy the rainforest simulation room, where temperature and humidity are controlled to match actual conditions.

On your right is the Technology Through Time exhibition, tracing human innovation from the wheel to artificial intelligence. Don't miss the hands-on coding workshop area - sessions run every hour from ten AM to four PM.

Upstairs, level two houses our Planetarium. Shows begin at eleven, one, and three o'clock. Each presentation lasts approximately forty-five minutes. I strongly recommend the three o'clock show called "Journey to Mars" - it's narrated by a former astronaut.

The museum café is located on level two as well, offering a range of healthy options. We close the café at five-thirty, though the museum stays open until six PM.

Finally, our gift shop near the exit sells educational toys, books, and souvenirs. Museum members receive a fifteen percent discount on all purchases.

Any questions before we begin the tour?
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "form_completion", "question": "Year the museum was established: ______", "answer": "1952"},
                        {"id": "L2Q12", "type": "form_completion", "question": "Annual visitor numbers: ______ thousand", "answer": "800"},
                        {"id": "L2Q13", "type": "form_completion", "question": "Newest exhibit features: lunar landing ______", "answer": "module"},
                        {"id": "L2Q14", "type": "form_completion", "question": "The rainforest room controls temperature and ______", "answer": "humidity"},
                        {"id": "L2Q15", "type": "form_completion", "question": "Coding workshops run from 10 AM to ______ PM", "answer": "4"},
                        {"id": "L2Q16", "type": "form_completion", "question": "Planetarium show duration: ______ minutes", "answer": "45"},
                        {"id": "L2Q17", "type": "form_completion", "question": "Recommended show title: Journey to ______", "answer": "Mars"},
                        {"id": "L2Q18", "type": "form_completion", "question": "Show narrator profession: former ______", "answer": "astronaut"},
                        {"id": "L2Q19", "type": "form_completion", "question": "Café closing time: ______:30 PM", "answer": "5"},
                        {"id": "L2Q20", "type": "form_completion", "question": "Member discount on gift shop: ______ percent", "answer": "15"}
                    ]
                },
                
                # PART 3: Discussion - Academic Context (Q21-30)
                {
                    "part_number": 3,
                    "title": "Renewable Energy Research Project",
                    "context": "Two students discussing their group project on renewable energy",
                    "speakers": ["Sophie", "Daniel"],
                    "audio_script": """
Sophie: Daniel, we really need to finalize our research project on renewable energy. The presentation is in two weeks.
Daniel: I know. I've been reading about solar panel efficiency improvements. The latest research shows they can now convert up to twenty-three percent of sunlight into electricity.
Sophie: That's impressive. My section focuses on wind power. Did you know that offshore wind farms can generate twice as much energy as onshore ones?
Daniel: I didn't realize the difference was that significant. What's the main advantage?
Sophie: Stronger and more consistent winds at sea. The turbines can be much larger too - some have blades over a hundred metres long.
Daniel: For our comparative analysis, should we include hydroelectric power as well?
Sophie: Definitely. Professor Martinez specifically mentioned wanting us to cover at least three energy sources.
Daniel: Right. I'll add a section on tidal energy too. The technology is still developing but has huge potential.
Sophie: Good idea. Now, about the structure - I think we should start with current global energy consumption statistics.
Daniel: Agreed. I found that renewable sources now account for roughly twenty-nine percent of global electricity production.
Sophie: And growing every year. Let's also address the economic factors - installation costs have dropped dramatically.
Daniel: Solar panel costs have fallen by about eighty-nine percent since two thousand and ten.
Sophie: Perfect for our cost-benefit analysis. When should we meet to combine our sections?
Daniel: How about Thursday afternoon in the library? Say, three o'clock?
Sophie: Works for me. I'll have my draft ready by then.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "form_completion", "question": "Presentation deadline: in ______ weeks", "answer": "2/two"},
                        {"id": "L3Q22", "type": "form_completion", "question": "Solar panel maximum efficiency: ______ percent", "answer": "23"},
                        {"id": "L3Q23", "type": "form_completion", "question": "Offshore wind generates ______ as much as onshore", "answer": "twice"},
                        {"id": "L3Q24", "type": "form_completion", "question": "Large turbine blade length: over ______ metres", "answer": "100"},
                        {"id": "L3Q25", "type": "form_completion", "question": "Professor's name: Professor ______", "answer": "Martinez"},
                        {"id": "L3Q26", "type": "form_completion", "question": "Minimum energy sources to cover: ______", "answer": "3/three"},
                        {"id": "L3Q27", "type": "form_completion", "question": "Renewable share of global electricity: ______ percent", "answer": "29"},
                        {"id": "L3Q28", "type": "form_completion", "question": "Solar cost reduction since 2010: ______ percent", "answer": "89"},
                        {"id": "L3Q29", "type": "form_completion", "question": "Meeting day: ______", "answer": "Thursday"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Meeting time: ______ o'clock", "answer": "3/three"}
                    ]
                },
                
                # PART 4: Academic Lecture (Q31-40)
                {
                    "part_number": 4,
                    "title": "Marine Biology: Ocean Ecosystems",
                    "context": "A university lecture on marine ecosystems and conservation",
                    "speakers": ["Professor"],
                    "audio_script": """
Good afternoon, everyone. Today we're continuing our marine biology module with a focus on ocean ecosystems and the challenges they face.

The world's oceans cover approximately seventy-one percent of Earth's surface and contain an estimated two hundred and twenty-eight thousand known species. However, scientists believe millions more remain undiscovered, particularly in deep-sea environments.

Let's begin with coral reefs, often called the rainforests of the sea. Despite covering less than one percent of the ocean floor, coral reefs support roughly twenty-five percent of all marine species. They're found primarily in tropical waters where temperatures remain between twenty and twenty-eight degrees Celsius.

Sadly, coral bleaching events have increased dramatically. When water temperatures rise even one to two degrees above normal, corals expel the algae living in their tissues, causing them to turn white. If conditions persist, the coral dies. Research indicates that we've lost approximately fifty percent of the world's coral reefs since nineteen fifty.

Moving to another crucial ecosystem - kelp forests. These underwater forests can grow up to half a metre per day under optimal conditions. They provide habitat for thousands of species and play a vital role in carbon sequestration, absorbing up to twenty times more carbon dioxide per hectare than land forests.

Human activities pose significant threats. Overfishing has reduced large predatory fish populations by ninety percent compared to pre-industrial levels. Plastic pollution is equally concerning - an estimated eight million tonnes of plastic enter our oceans annually.

Conservation efforts are showing some promise. Marine protected areas now cover about eight percent of global oceans, up from less than one percent in two thousand. The target set by international agreements is thirty percent by twenty-thirty.

For your assignment, I'd like you to research one specific marine ecosystem and propose conservation strategies. Papers should be between two thousand and two thousand five hundred words, due in three weeks.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "form_completion", "question": "Ocean coverage of Earth: ______ percent", "answer": "71"},
                        {"id": "L4Q32", "type": "form_completion", "question": "Known marine species: ______ thousand", "answer": "228"},
                        {"id": "L4Q33", "type": "form_completion", "question": "Coral reefs support ______ percent of marine species", "answer": "25"},
                        {"id": "L4Q34", "type": "form_completion", "question": "Coral reef water temperature maximum: ______ degrees", "answer": "28"},
                        {"id": "L4Q35", "type": "form_completion", "question": "Coral reef loss since 1950: ______ percent", "answer": "50"},
                        {"id": "L4Q36", "type": "form_completion", "question": "Kelp growth rate per day: up to half a ______", "answer": "metre/meter"},
                        {"id": "L4Q37", "type": "form_completion", "question": "Kelp absorbs ______ times more CO2 than land forests", "answer": "20/twenty"},
                        {"id": "L4Q38", "type": "form_completion", "question": "Predatory fish decline: ______ percent", "answer": "90"},
                        {"id": "L4Q39", "type": "form_completion", "question": "Annual plastic pollution: ______ million tonnes", "answer": "8/eight"},
                        {"id": "L4Q40", "type": "form_completion", "question": "Marine protected area target by 2030: ______ percent", "answer": "30"}
                    ]
                }
            ]
        },
        
        # ============ WRITING SECTION ============
        "writing": {
            "total_time": 3600,  # 60 minutes
            "tasks": [
                {
                    "task_number": 1,
                    "type": "data_description",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The graph below shows the percentage of households with internet access in four different countries between 2005 and 2020.",
                    "visual_description": "Line graph showing internet access trends for Japan, Germany, Brazil, and Nigeria from 2005-2020. Japan starts at 65% and reaches 92%. Germany goes from 58% to 89%. Brazil rises from 21% to 71%. Nigeria grows from 4% to 42%.",
                    "requirements": [
                        "Summarise the information by selecting and reporting the main features",
                        "Make comparisons where relevant"
                    ]
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "Some people believe that technology has made our lives too complicated, while others think it has simplified daily tasks. Discuss both views and give your own opinion.",
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
                    "topics": ["Technology", "Daily routines", "Communication"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you use technology much in your daily life?"},
                        {"id": "S1Q2", "text": "What electronic devices do you use most often?"},
                        {"id": "S1Q3", "text": "How do you usually communicate with your friends and family?"},
                        {"id": "S1Q4", "text": "Do you prefer sending messages or making phone calls? Why?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a piece of technology that you find very useful",
                        "points": [
                            "What the technology is",
                            "How long you have had it",
                            "How often you use it",
                            "And explain why you find it useful"
                        ]
                    },
                    "follow_up": ["Is this technology common in your country?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Technology and Society",
                    "questions": [
                        {"id": "S3Q1", "text": "How has technology changed the way people work?"},
                        {"id": "S3Q2", "text": "Do you think people rely too much on technology nowadays?"},
                        {"id": "S3Q3", "text": "What are some potential dangers of advancing technology?"},
                        {"id": "S3Q4", "text": "How might technology change our lives in the next twenty years?"}
                    ]
                }
            ]
        }
    }
}
