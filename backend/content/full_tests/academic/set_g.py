"""
IELTS-Style Academic Full Test - Set G
=======================================
100% ORIGINAL CONTENT with REAL VISUALS

FOCUS AREAS:
- Writing Task 1: Paired line graphs (appliances + housework hours)
- Listening Part 2: Floor plan labelling (Stevenson's site)
"""

ACADEMIC_SET_G = {
    "test_id": "academic_set_g_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set G",
    "description": "Complete IELTS Academic examination with paired graph analysis and plan labelling.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    
    "sections": {
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen.",
            
            "parts": [
                {
                    "part_number": 1,
                    "title": "Photography Course Enrolment",
                    "context": "A phone call to enrol in a photography course",
                    "speakers": ["Caller", "Administrator"],
                    "audio_script": """
Administrator: Hello, Greenfield Community College. How can I help you?
Caller: Hi, I'd like to enrol in the evening photography course, please.
Administrator: The Introduction to Digital Photography? That starts on the sixth of February and runs for ten weeks.
Caller: That's the one. How much is it?
Administrator: It's one hundred and eighty-five pounds for the full course. That includes all materials.
Caller: Does it cover editing software as well?
Administrator: Yes, you'll learn Lightroom in weeks six and seven. Can I take your details? First, your name?
Caller: James Thornton. T-H-O-R-N-T-O-N.
Administrator: And your address?
Caller: Twenty-seven Maple Drive, Greenfield. The postcode is GF three, seven PQ.
Administrator: Do you have any previous photography experience?
Caller: Just with my phone camera, nothing formal.
Administrator: That's fine - it's a beginner's course. The class meets every Tuesday from seven to nine PM in Room fourteen. You'll need to bring your own camera if you have one, but we do have some to lend.
Caller: I've got a basic DSLR. Is that suitable?
Administrator: Perfect. The tutor is Maria Santos - she's a professional portrait photographer. Any allergies we should know about? We sometimes use chemicals in the darkroom sessions.
Caller: No allergies, but I'm left-handed. Does that matter for equipment?
Administrator: Not at all. We'll note it down though. Payment can be made online or at reception. There's an early-bird discount of ten percent if you pay before the twentieth of January.
Caller: Oh, I'll pay today then. That brings it down to what, one hundred and sixty-six pounds fifty?
Administrator: Exactly right.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Course starts on: 6th ________", "answer": "February"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Course duration: ________ weeks", "answer": "10/ten"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Full course fee: \u00a3 ________", "answer": "185"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Editing software taught: ________", "answer": "Lightroom"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Address: 27 ________ Drive", "answer": "Maple"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Class day: ________", "answer": "Tuesday"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Class room: ________", "answer": "14/fourteen"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Tutor name: Maria ________", "answer": "Santos"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Early-bird discount: ________ percent", "answer": "10/ten"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Discounted price: \u00a3 ________", "answer": "166.50"}
                    ]
                },
                
                # PART 2: Plan Labelling - Stevenson's Site
                {
                    "part_number": 2,
                    "title": "Stevenson's Industrial Site Tour",
                    "context": "A manager giving a tour of a renovated industrial site",
                    "speakers": ["Manager"],
                    "question_types": ["map_labelling", "note_completion"],
                    
                    "visual": {
                        "type": "floor_plan",
                        "image_url": "visual_011_floor_plan_stevenson_site.png",
                        "title": "Plan of Stevenson's site",
                        "description": "Plan showing the layout of Stevenson's site. Label the areas marked A-J.",
                        "answer_key": {
                            "A": "Training Centre",
                            "B": "Storage",
                            "C": "Canteen",
                            "D": "Offices",
                            "E": "Design Studio",
                            "F": "Workshop",
                            "G": "Showroom",
                            "H": "Loading Bay"
                        }
                    },
                    
                    "audio_script": """
Welcome everyone to Stevenson's. I'm the site manager, and I'll give you a quick overview of our layout before your induction begins.

If you look at the plan, you'll see the Main Road running along the top, and our Access Road leading into the site from the left. The Reception is at the front, which is where you signed in this morning. Behind Reception is the Open Courtyard, which is the central area of the site.

Now, let's go through the labelled areas. Area A is in the front left corner, near the Access Road entrance. That's our Training Centre. All new staff spend their first two days there for health and safety certification.

Area B is directly behind the Training Centre. This is our main Storage facility. It holds raw materials and finished products. You'll need a security pass to access it.

Area C is on the right side of the courtyard. That's the Canteen. It's open from seven-thirty AM to two PM and serves hot meals at lunchtime. Tea and coffee are free throughout the day.

Moving around, area D is at the back right of the site. These are the administrative Offices. The finance team, HR, and management are all based there.

Area E is adjacent to the offices, slightly to the left. This is our Design Studio, where our product designers work. It's been recently renovated with new equipment.

Area F is the large space in the centre-back of the site. That's the main Workshop where manufacturing takes place. It operates in two shifts - day and night.

Area G faces the Main Road, on the right side. This is our public Showroom, where customers can view and purchase our products.

Finally, area H is at the back left, accessible from the Access Road. That's the Loading Bay, where deliveries arrive and shipments go out. Trucks use it between six AM and eight PM.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "map_labelling", "question": "Q11: Training Centre", "answer": "A"},
                        {"id": "L2Q12", "type": "map_labelling", "question": "Q12: Storage", "answer": "B"},
                        {"id": "L2Q13", "type": "map_labelling", "question": "Q13: Canteen", "answer": "C"},
                        {"id": "L2Q14", "type": "note_completion", "question": "Canteen opens at: ________ AM", "answer": "7:30/seven-thirty"},
                        {"id": "L2Q15", "type": "map_labelling", "question": "Q15: Offices", "answer": "D"},
                        {"id": "L2Q16", "type": "map_labelling", "question": "Q16: Design Studio", "answer": "E"},
                        {"id": "L2Q17", "type": "map_labelling", "question": "Q17: Workshop", "answer": "F"},
                        {"id": "L2Q18", "type": "note_completion", "question": "Workshop operates in ________ shifts", "answer": "2/two"},
                        {"id": "L2Q19", "type": "map_labelling", "question": "Q19: Showroom", "answer": "G"},
                        {"id": "L2Q20", "type": "map_labelling", "question": "Q20: Loading Bay", "answer": "H"}
                    ]
                },
                
                {
                    "part_number": 3,
                    "title": "Dissertation Planning Meeting",
                    "context": "A student meeting with their supervisor about a geography dissertation",
                    "speakers": ["Dr. Chen", "Student"],
                    "audio_script": """
Dr. Chen: So, Michael, how's the dissertation coming along?
Student: I've narrowed my topic to urban green spaces and mental health outcomes. I want to focus on three cities.
Dr. Chen: Which cities are you considering?
Student: Bristol, Sheffield, and Edinburgh. They have different approaches to urban planning.
Dr. Chen: Good range. What's your main research question?
Student: Whether the proximity of green spaces to residential areas correlates with reported mental health improvements.
Dr. Chen: Interesting. How will you measure proximity?
Student: I'll use GIS mapping data. The council websites provide detailed park boundaries and residential density maps.
Dr. Chen: And for mental health data?
Student: I've applied for access to the NHS mental health survey data. The ethics approval came through last Wednesday.
Dr. Chen: Excellent. What's your sample size looking like?
Student: I'm aiming for at least five hundred survey responses per city, so fifteen hundred total.
Dr. Chen: That's ambitious but achievable. What statistical method are you planning?
Student: Regression analysis primarily, with the green space distance as the independent variable.
Dr. Chen: Have you considered confounding variables? Income levels, age demographics?
Student: Yes, I'll control for those. I've identified six confounding variables so far.
Dr. Chen: Good. When's your draft due?
Student: The first of April. I've set myself a deadline of March fifteenth for the data collection phase.
Dr. Chen: That's tight but doable. One suggestion - consider including interviews with three or four urban planners as qualitative support. It would strengthen your conclusions considerably.
Student: That's a great idea. I know two planners in Bristol already.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "note_completion", "question": "Dissertation topic: urban green spaces and ________ outcomes", "answer": "mental health"},
                        {"id": "L3Q22", "type": "note_completion", "question": "Number of cities studied: ________", "answer": "3/three"},
                        {"id": "L3Q23", "type": "note_completion", "question": "Mapping technology used: ________", "answer": "GIS"},
                        {"id": "L3Q24", "type": "note_completion", "question": "Ethics approval received on: last ________", "answer": "Wednesday"},
                        {"id": "L3Q25", "type": "note_completion", "question": "Target survey responses per city: ________", "answer": "500/five hundred"},
                        {"id": "L3Q26", "type": "note_completion", "question": "Total target responses: ________", "answer": "1500/fifteen hundred"},
                        {"id": "L3Q27", "type": "note_completion", "question": "Main statistical method: ________ analysis", "answer": "regression"},
                        {"id": "L3Q28", "type": "note_completion", "question": "Number of confounding variables identified: ________", "answer": "6/six"},
                        {"id": "L3Q29", "type": "note_completion", "question": "Data collection deadline: ________ 15th", "answer": "March"},
                        {"id": "L3Q30", "type": "note_completion", "question": "Suggested qualitative addition: interviews with urban ________", "answer": "planners"}
                    ]
                },
                
                {
                    "part_number": 4,
                    "title": "The Evolution of Public Libraries",
                    "context": "An academic lecture on how public libraries have adapted to the digital age",
                    "speakers": ["Lecturer"],
                    "audio_script": """
Public libraries have undergone a remarkable transformation over the past century. What began as simple book repositories have evolved into dynamic community hubs offering far more than printed materials.

The first major shift came in the nineteen nineties, when libraries began introducing public internet access. By two thousand and five, over ninety-five percent of public libraries in the UK offered free internet, making them crucial resources for bridging the digital divide.

The second transformation involved physical space. Traditional silent reading rooms gave way to flexible, multi-purpose areas. The concept of the library as a "third place" - distinct from home and work - was championed by sociologist Ray Oldenburg. He argued that communities need informal gathering spaces for social cohesion.

Modern libraries have embraced this philosophy. The Birmingham Library, which opened in twenty thirteen at a cost of one hundred and eighty-nine million pounds, includes a performance space, exhibition galleries, and a rooftop garden. It attracts over two million visitors annually.

Perhaps most surprisingly, physical book lending hasn't declined as dramatically as predicted. While digital book sales peaked in twenty fourteen at around thirty percent of the market, they've since stabilized at approximately twenty-five percent. Meanwhile, physical library visits in many countries have actually increased since twenty fifteen.

Libraries have also become centres for lifelong learning. In the UK alone, libraries host over three hundred thousand events annually, from coding workshops to citizenship classes. The Royal Society of Arts found that for every pound invested in libraries, the community receives approximately seven pounds in social and economic value.

The challenge now is sustainability. Library funding in the UK decreased by twenty-nine percent between twenty ten and twenty nineteen. Over seven hundred libraries closed during this period. However, innovative models are emerging, including volunteer-run libraries and partnerships with local businesses.

The future likely lies in what experts call the "hybrid library" - combining physical and digital resources while serving as community anchor institutions. The most successful libraries will be those that continuously adapt to their communities' changing needs.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "sentence_completion", "question": "Libraries began offering internet in the ________.", "answer": "1990s/nineteen nineties"},
                        {"id": "L4Q32", "type": "sentence_completion", "question": "By 2005, ________ percent of UK libraries offered free internet.", "answer": "95/ninety-five"},
                        {"id": "L4Q33", "type": "sentence_completion", "question": "The 'third place' concept was championed by Ray ________.", "answer": "Oldenburg"},
                        {"id": "L4Q34", "type": "sentence_completion", "question": "Birmingham Library cost ________ million pounds.", "answer": "189/one hundred and eighty-nine"},
                        {"id": "L4Q35", "type": "sentence_completion", "question": "Birmingham Library attracts over ________ million visitors per year.", "answer": "2/two"},
                        {"id": "L4Q36", "type": "sentence_completion", "question": "Digital book sales peaked in ________.", "answer": "2014/twenty fourteen"},
                        {"id": "L4Q37", "type": "sentence_completion", "question": "UK libraries host over ________ events annually.", "answer": "300,000/three hundred thousand"},
                        {"id": "L4Q38", "type": "sentence_completion", "question": "For every pound invested, communities receive approximately ________ pounds.", "answer": "7/seven"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "Library funding decreased by ________ percent between 2010 and 2019.", "answer": "29/twenty-nine"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "Over ________ libraries closed during this period.", "answer": "700/seven hundred"}
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
                    "subtype": "paired_line_graphs",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The two graphs below show the percentage of households with various types of electrical appliances, and the number of hours spent doing housework, in one country between 1920 and 2019.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                    "visual_data": {
                        "type": "paired_line_graphs",
                        "image_url": "visual_012_line_graph_appliances.png",
                        "image_url_after": "visual_013_line_graph_housework.png",
                        "title": "Household appliances and housework hours",
                        "graph_1": {
                            "title": "Percentage of households with electrical appliances",
                            "items": ["Washing machine", "Refrigerator", "Vacuum cleaner"],
                            "x_axis": "Year (1920-2019)",
                            "y_axis": "Percentage of households (%)"
                        },
                        "graph_2": {
                            "title": "Number of hours of housework per week",
                            "x_axis": "Year (1920-2019)",
                            "y_axis": "Hours per week"
                        }
                    },
                    "visual_description": "Two related line graphs. Graph 1 shows the adoption of three electrical appliances from 1920-2019: washing machines rose from near 0% to about 75%, refrigerators from 0% to nearly 100%, vacuum cleaners from about 30% to 90%. Graph 2 shows hours of housework per week declined dramatically from about 50 hours in 1920 to approximately 12 hours by 2019, with the steepest decline between 1920 and 1960.",
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
                    "prompt": "In some countries, an increasing number of people are choosing to live alone.\n\nWhat are the reasons for this? Is this a positive or negative development?",
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
                    "topics": ["Food", "Cooking", "Eating out"],
                    "questions": [
                        {"id": "S1Q1", "text": "What kind of food do you like to eat?"},
                        {"id": "S1Q2", "text": "Do you cook at home often?"},
                        {"id": "S1Q3", "text": "Is there a dish from your country that visitors should try?"},
                        {"id": "S1Q4", "text": "Do you prefer eating at home or in restaurants?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a place you have visited that you would recommend to others",
                        "points": [
                            "Where the place is",
                            "When you visited it",
                            "What you did there",
                            "And explain why you would recommend it"
                        ]
                    },
                    "follow_up": "Would you like to visit this place again?"
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Tourism and Travel",
                    "questions": [
                        {"id": "S3Q1", "text": "What are the benefits of tourism for a country?"},
                        {"id": "S3Q2", "text": "Can tourism have negative effects on local communities?"},
                        {"id": "S3Q3", "text": "How has travel changed in recent years?"},
                        {"id": "S3Q4", "text": "Do you think people will travel more or less in the future?"}
                    ]
                }
            ]
        }
    }
}


def get_academic_set_g():
    return ACADEMIC_SET_G
