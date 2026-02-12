"""
IELTS-Style Academic Full Test - Set H
=======================================
100% ORIGINAL CONTENT with REAL VISUALS

FOCUS AREAS:
- Writing Task 1: Process diagram (sugar production)
- Listening Part 2: Map labelling (Bidcaster archaeological dig)
"""

ACADEMIC_SET_H = {
    "test_id": "academic_set_h_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set H",
    "description": "Complete IELTS Academic examination with process diagram analysis and map labelling.",
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
                    "title": "Car Insurance Enquiry",
                    "context": "A phone conversation about car insurance",
                    "speakers": ["Customer", "Agent"],
                    "audio_script": """
Agent: Good morning, AutoShield Insurance. This is Karen speaking. How can I help?
Customer: Hello, I'd like to get a quote for car insurance, please.
Agent: Of course. Is this for a new policy or a renewal?
Customer: A new policy. I've just bought a car.
Agent: Congratulations. Can I start with your name?
Customer: Robert Chambers. C-H-A-M-B-E-R-S.
Agent: And your date of birth?
Customer: The fourth of November, nineteen ninety-one.
Agent: How long have you held your driving licence?
Customer: Since two thousand and twelve, so about fourteen years.
Agent: Any accidents or claims in the last five years?
Customer: None at all.
Agent: Good, that helps with the premium. Now, about the car - what's the make and model?
Customer: It's a Honda Civic, twenty twenty-two model.
Agent: And the registration number?
Customer: BN twenty-two, AKP.
Agent: Where do you keep the car overnight?
Customer: In a private garage at my home.
Agent: And your annual mileage estimate?
Customer: About eight thousand miles.
Agent: Based on these details, I can offer you comprehensive cover at thirty-seven pounds per month, or third-party only at twenty-two pounds.
Customer: I'll go with comprehensive. Does that include breakdown cover?
Agent: Not as standard, but we can add it for an extra four pounds fifty per month. It covers you anywhere in the UK.
Customer: Yes, add that please.
Agent: So your total monthly payment will be forty-one pounds fifty. The policy starts from midnight tonight.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Policy type: ________", "answer": "new", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Customer surname: ________", "answer": "Chambers"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Date of birth: 4th November ________", "answer": "1991"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Licence held since: ________", "answer": "2012/two thousand and twelve"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Car model: Honda ________", "answer": "Civic"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Car kept overnight in: a private ________", "answer": "garage"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Annual mileage: about ________ miles", "answer": "8000/eight thousand"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Comprehensive cover cost: \u00a3________ per month", "answer": "37/thirty-seven"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Breakdown cover extra cost: \u00a3________ per month", "answer": "4.50/four fifty"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Total monthly payment: \u00a3________", "answer": "41.50/forty-one fifty"}
                    ]
                },
                
                # PART 2: Map Labelling - Bidcaster Archaeological Dig
                {
                    "part_number": 2,
                    "title": "Bidcaster Archaeological Site",
                    "context": "A guide showing visitors around an archaeological excavation site",
                    "speakers": ["Guide"],
                    "question_types": ["map_labelling", "note_completion"],
                    
                    "visual": {
                        "type": "map",
                        "image_url": "visual_024_map_bidcaster_dig.png",
                        "title": "Bidcaster Archaeological Dig",
                        "description": "Map of the Bidcaster dig site. Label the areas marked A-G.",
                        "answer_key": {
                            "A": "Roman Bath House",
                            "B": "Pottery Workshop",
                            "C": "Grain Store",
                            "D": "Market Square",
                            "E": "Temple Remains",
                            "F": "Burial Ground",
                            "G": "Defensive Wall"
                        }
                    },
                    
                    "audio_script": """
Welcome to the Bidcaster Roman Settlement excavation. I'm Dr. Sarah Hammond, lead archaeologist. You should all have a site map - if not, there are copies at the information board marked "You are here."

The site is bounded by the castle walls to the north and the river to the south. Let me take you through the main discoveries, area by area.

Starting with area A, which is in the northwest section near the castle walls. This is where we uncovered the remains of a Roman Bath House. We found the complete hypocaust system - that's the underfloor heating - still remarkably intact. The bath house dates from approximately 200 AD.

Area B is just south of the bath house, in the western part of the site. Here we discovered a Pottery Workshop. We found two kilns and thousands of pottery fragments. Interestingly, the designs suggest trade links with settlements as far as two hundred miles away.

Moving east, area C is in the north-central part of the site. This was a Grain Store. The foundations show it was a substantial building, capable of holding enough grain to feed approximately four hundred people for a year.

Area D is in the centre of the site and is one of our most significant finds. This was the Market Square, the commercial heart of the settlement. We've found coins from across the Roman Empire here - over three hundred individual coins so far.

Slightly to the south, area E houses the Temple Remains. Only the foundations survive, but the layout suggests it was dedicated to Minerva, the goddess of wisdom. We found a small bronze statue of her near the entrance.

Area F is in the southeast corner, near the river. This is a Burial Ground containing approximately sixty graves. Analysis of the skeletal remains has told us a great deal about the health and diet of the Roman population here.

Finally, area G runs along the eastern boundary of the site. This is the Defensive Wall, which is nearly three metres thick in places. It was built around 280 AD, probably in response to increasing threats from raids.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "map_labelling", "question": "Q11: Roman Bath House", "answer": "A"},
                        {"id": "L2Q12", "type": "note_completion", "question": "Bath house dates from approximately ________ AD", "answer": "200/two hundred"},
                        {"id": "L2Q13", "type": "map_labelling", "question": "Q13: Pottery Workshop", "answer": "B"},
                        {"id": "L2Q14", "type": "map_labelling", "question": "Q14: Grain Store", "answer": "C"},
                        {"id": "L2Q15", "type": "note_completion", "question": "Grain store could feed ________ people for a year", "answer": "400/four hundred"},
                        {"id": "L2Q16", "type": "map_labelling", "question": "Q16: Market Square", "answer": "D"},
                        {"id": "L2Q17", "type": "note_completion", "question": "Number of coins found: over ________", "answer": "300/three hundred"},
                        {"id": "L2Q18", "type": "map_labelling", "question": "Q18: Temple Remains", "answer": "E"},
                        {"id": "L2Q19", "type": "map_labelling", "question": "Q19: Burial Ground", "answer": "F"},
                        {"id": "L2Q20", "type": "note_completion", "question": "Number of graves found: approximately ________", "answer": "60/sixty"}
                    ]
                },
                
                {
                    "part_number": 3,
                    "title": "Environmental Science Project",
                    "context": "Two students discussing their water quality research project",
                    "speakers": ["Mia", "Jake"],
                    "audio_script": """
Mia: Jake, we need to finalize our water quality project proposal. The deadline is next Friday.
Jake: Right. So we're testing water quality in five locations along the Medway River, correct?
Mia: Yes, from the source to the estuary. I've identified sampling points every twelve kilometres.
Jake: What parameters are we measuring?
Mia: PH level, dissolved oxygen, nitrate concentration, and bacterial count. Those are the four the professor specified.
Jake: How often do we sample?
Mia: Monthly for six months, starting in April. That gives us data across two seasons.
Jake: I've been looking at the equipment. We can borrow the portable testing kits from the lab, but we need to book them at least a week in advance.
Mia: Good to know. For the bacterial testing, I spoke to Dr. Reynolds and she said we can use the microbiology lab on campus. Sessions are available on Wednesdays and Thursdays.
Jake: Perfect. What about transport to the sampling sites?
Mia: The department has a minibus we can use. It's free for research projects, but we need to submit a request form to the department secretary.
Jake: How long will each site visit take?
Mia: About ninety minutes per location, plus travel time. So a full sampling run will take about two days.
Mia: One thing I'm worried about is the statistical validity. Five sites with six sampling sessions gives us only thirty data points per parameter.
Jake: That's a fair point. Should we add more sites?
Mia: I think it's better to increase sampling frequency. If we go to twice monthly, we'd have sixty data points. That's much more robust.
Jake: Agreed. Let's budget for that. What about the final report format?
Mia: The professor wants a fifteen-page report plus appendices, due on the twentieth of October.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "note_completion", "question": "Number of sampling locations: ________", "answer": "5/five"},
                        {"id": "L3Q22", "type": "note_completion", "question": "Distance between sampling points: ________ kilometres", "answer": "12/twelve"},
                        {"id": "L3Q23", "type": "note_completion", "question": "Number of parameters measured: ________", "answer": "4/four"},
                        {"id": "L3Q24", "type": "note_completion", "question": "Sampling starts in: ________", "answer": "April"},
                        {"id": "L3Q25", "type": "note_completion", "question": "Sampling period: ________ months", "answer": "6/six"},
                        {"id": "L3Q26", "type": "note_completion", "question": "Equipment must be booked ________ in advance", "answer": "a week/one week"},
                        {"id": "L3Q27", "type": "note_completion", "question": "Time per location: about ________ minutes", "answer": "90/ninety"},
                        {"id": "L3Q28", "type": "note_completion", "question": "Revised frequency: ________ monthly", "answer": "twice"},
                        {"id": "L3Q29", "type": "note_completion", "question": "Revised total data points per parameter: ________", "answer": "60/sixty"},
                        {"id": "L3Q30", "type": "note_completion", "question": "Report due date: 20th ________", "answer": "October"}
                    ]
                },
                
                {
                    "part_number": 4,
                    "title": "The History and Science of Fermentation",
                    "context": "A university lecture on the science of fermentation",
                    "speakers": ["Professor"],
                    "audio_script": """
Fermentation is one of the oldest biotechnological processes known to humanity. Evidence from archaeological sites in China suggests that fermented beverages were being produced as early as seven thousand BC. The ancient Egyptians used fermentation to make both bread and beer around three thousand BC.

But what exactly is fermentation? In scientific terms, it's a metabolic process in which microorganisms, typically yeast or bacteria, convert sugars into other products. The most common types are alcoholic fermentation, where yeast converts glucose into ethanol and carbon dioxide, and lactic acid fermentation, used in making yogurt and cheese.

Louis Pasteur made the breakthrough discovery in eighteen fifty-seven that fermentation was caused by living organisms, not by a chemical process as previously believed. This discovery revolutionized both food science and medicine.

In modern food production, fermentation plays a surprisingly large role. Approximately one-third of all food consumed globally involves some form of fermentation. Think of bread, cheese, soy sauce, chocolate, coffee, and of course, alcoholic drinks.

The health benefits of fermented foods have gained significant attention recently. Fermented foods contain probiotics - live beneficial bacteria. A study published in twenty twenty-one found that people who consumed six or more servings of fermented food per day showed significant increases in gut microbiome diversity after just ten weeks.

Industrially, fermentation has expanded far beyond food. The pharmaceutical industry uses fermentation to produce approximately seventy percent of all antibiotics. Insulin, which was once extracted from animal pancreases, has been produced through microbial fermentation since nineteen eighty-two.

The future looks even more promising. Companies are now using precision fermentation to produce animal-free dairy proteins, with the market expected to reach sixty-five billion dollars by twenty thirty. Fermentation is also being explored for producing bioplastics and sustainable aviation fuel.

However, scaling up fermentation processes presents challenges. The energy requirements for industrial fermenters are substantial, and maintaining sterile conditions at scale requires constant vigilance. Contamination remains the biggest risk, with even a single unwanted microorganism potentially ruining an entire batch.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "sentence_completion", "question": "Earliest evidence of fermentation comes from ________.", "answer": "China"},
                        {"id": "L4Q32", "type": "sentence_completion", "question": "Fermented beverages date back to ________ thousand BC.", "answer": "7/seven"},
                        {"id": "L4Q33", "type": "sentence_completion", "question": "Pasteur discovered fermentation was caused by living organisms in ________.", "answer": "1857/eighteen fifty-seven"},
                        {"id": "L4Q34", "type": "sentence_completion", "question": "Approximately ________ of all food consumed involves fermentation.", "answer": "one-third/a third"},
                        {"id": "L4Q35", "type": "sentence_completion", "question": "Gut microbiome improvements were seen after ________ weeks.", "answer": "10/ten"},
                        {"id": "L4Q36", "type": "sentence_completion", "question": "Fermentation produces about ________ percent of all antibiotics.", "answer": "70/seventy"},
                        {"id": "L4Q37", "type": "sentence_completion", "question": "Insulin production through fermentation started in ________.", "answer": "1982/nineteen eighty-two"},
                        {"id": "L4Q38", "type": "sentence_completion", "question": "Precision fermentation market expected to reach ________ billion dollars.", "answer": "65/sixty-five"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "The biggest risk in industrial fermentation is ________.", "answer": "contamination"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "Even a single unwanted ________ can ruin a batch.", "answer": "microorganism"}
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
                    "subtype": "process_diagram",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The diagram below shows how sugar is produced from sugar cane.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                    "visual_data": {
                        "type": "process",
                        "image_url": "visual_014_process_sugar_production.png",
                        "title": "How sugar is produced from sugar cane",
                        "stages": [
                            {"number": 1, "name": "Growing", "description": "Sugar cane is grown in tropical regions for 12-18 months"},
                            {"number": 2, "name": "Harvesting", "description": "Mature cane is cut by hand or machine"},
                            {"number": 3, "name": "Crushing", "description": "Cane is crushed in a mill to extract juice"},
                            {"number": 4, "name": "Purifying", "description": "Lime is added to the juice to remove impurities"},
                            {"number": 5, "name": "Evaporating", "description": "Water is evaporated to produce a thick syrup"},
                            {"number": 6, "name": "Centrifuging", "description": "Syrup is spun in centrifuges to separate crystals from liquid"},
                            {"number": 7, "name": "Drying/Cooling", "description": "Sugar crystals are dried and cooled for packaging"}
                        ],
                        "flow_direction": "left_to_right",
                        "cycle": False
                    },
                    "visual_description": "Process diagram showing 7 stages of sugar production from sugar cane. Begins with growing sugar cane in tropical climates for 12-18 months. Mature cane is harvested, then crushed in a mill to extract juice. Lime is added to purify the juice. The juice is then evaporated to create a thick syrup. The syrup goes through centrifuging to separate sugar crystals from the liquid molasses. Finally, the crystals are dried and cooled before packaging.",
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
                    "prompt": "Some people believe that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime.\n\nDiscuss both views and give your own opinion.",
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
                    "topics": ["Music", "Learning", "Free time"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you enjoy listening to music? What kind?"},
                        {"id": "S1Q2", "text": "Have you ever learned to play a musical instrument?"},
                        {"id": "S1Q3", "text": "How do you usually spend your free time?"},
                        {"id": "S1Q4", "text": "Do you prefer to spend your free time alone or with others?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe an interesting old person you have met",
                        "points": [
                            "Who this person is",
                            "How you met them",
                            "What you talked about",
                            "And explain why you found them interesting"
                        ]
                    },
                    "follow_up": "Do you think old people and young people can learn from each other?"
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Elderly People in Society",
                    "questions": [
                        {"id": "S3Q1", "text": "How are elderly people treated in your country?"},
                        {"id": "S3Q2", "text": "Do you think the government does enough to support older people?"},
                        {"id": "S3Q3", "text": "What challenges do elderly people face in modern society?"},
                        {"id": "S3Q4", "text": "How important is it for young people to spend time with their grandparents?"}
                    ]
                }
            ]
        }
    }
}


def get_academic_set_h():
    return ACADEMIC_SET_H
