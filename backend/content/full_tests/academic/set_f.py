"""
IELTS-Style Academic Full Test - Set F
=======================================
100% ORIGINAL CONTENT with REAL VISUALS

FOCUS AREAS:
- Writing Task 1: Line Graph (metal price changes)
- Listening Part 2: Map labelling (Farley House)
"""

ACADEMIC_SET_F = {
    "test_id": "academic_set_f_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set F",
    "description": "Complete IELTS Academic examination with line graph analysis and map labelling.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    
    "sections": {
        # ============ LISTENING SECTION ============
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Social/Transactional (Q1-10)
                {
                    "part_number": 1,
                    "title": "Gym Membership Enquiry",
                    "context": "A phone conversation between a customer and gym receptionist",
                    "speakers": ["Customer", "Receptionist"],
                    "audio_script": """
Receptionist: Good morning, Riverside Fitness Centre. How can I help you?
Customer: Hi, I'd like to ask about your membership options.
Receptionist: Of course. We have three types. The Basic is twenty-nine pounds a month, the Premium is forty-five pounds, and the VIP is sixty-two pounds.
Customer: What's included in the Premium?
Receptionist: The Premium gives you access to the gym, swimming pool, and all group classes. The Basic is gym-only, and the VIP adds personal training sessions and spa access.
Customer: I'll go with the Premium then. Can I sign up today?
Receptionist: Absolutely. Could I take your name please?
Customer: It's Patricia Kowalski. That's K-O-W-A-L-S-K-I.
Receptionist: Thank you. And your date of birth?
Customer: The twenty-third of September, nineteen eighty-five.
Receptionist: Perfect. And a contact number?
Customer: Oh-seven-eight-six-two, four-four-one, three-seven-oh.
Receptionist: Do you have any medical conditions we should know about?
Customer: I have mild asthma, but it doesn't affect my exercise.
Receptionist: Noted. Now, would you like to start immediately? Your first session includes a free fitness assessment.
Customer: When's the earliest available?
Receptionist: We have a slot this Thursday at six-thirty PM. The assessment takes about forty-five minutes.
Customer: Thursday works. What should I bring?
Receptionist: Just trainers, sportswear, and a water bottle. We provide towels. The assessment will be in Studio Three on the ground floor.
Customer: Is there parking?
Receptionist: Yes, we have a car park at the back. It's free for members. Just enter your membership number at the barrier.
Customer: Great. How do I pay?
Receptionist: We accept direct debit or card payment. There's a one-off joining fee of fifteen pounds.
Customer: That's fine. I'll pay by card now.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Membership type chosen: ________", "answer": "Premium", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Monthly cost: \u00a3 ________", "answer": "45", "instruction": "Write A NUMBER"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Surname: ________", "answer": "Kowalski", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Date of birth: 23rd ________ 1985", "answer": "September", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Contact number: 07862-441-________", "answer": "370", "instruction": "Write A NUMBER"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Medical condition: mild ________", "answer": "asthma", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Assessment day: ________", "answer": "Thursday", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Assessment duration: ________ minutes", "answer": "45/forty-five", "instruction": "Write A NUMBER"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Assessment location: Studio ________", "answer": "3/Three", "instruction": "Write A NUMBER"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Joining fee: \u00a3 ________", "answer": "15/fifteen", "instruction": "Write A NUMBER"}
                    ]
                },
                
                # PART 2: Map/Plan Labelling (Q11-20) - Farley House
                {
                    "part_number": 2,
                    "title": "Farley Country House Tour",
                    "context": "A guide describing the grounds of Farley House to a group of visitors",
                    "speakers": ["Guide"],
                    "question_types": ["map_labelling", "note_completion"],
                    
                    "visual": {
                        "type": "map",
                        "image_url": "visual_020_map_farley_house.png",
                        "title": "Farley House Grounds",
                        "description": "Map of Farley House and its grounds. Label the areas marked A-H.",
                        "answer_key": {
                            "A": "Rose Garden",
                            "B": "Gift Shop",
                            "C": "Cafe",
                            "D": "Children's Play Area",
                            "E": "Bird Hide",
                            "F": "Sculpture Trail Start",
                            "G": "Walled Garden",
                            "H": "Picnic Area"
                        }
                    },
                    
                    "audio_script": """
Good afternoon and welcome to Farley House. I'm your guide today, and before we head inside the house itself, let me orient you with the grounds using the map you've been given.

You can see Farley House in the centre of the map, and the old stables are just beside it. There are two lakes on the estate - the larger one to the west and a smaller ornamental one nearer the house.

Now, looking at the lettered areas on your map. Area A, which is just south of the house near the car park entrance, is our beautiful Rose Garden. It contains over two hundred varieties of roses and is at its best in June and July.

Moving along, area B is close to the main entrance path. This is where you'll find our Gift Shop. It sells locally made products, postcards, and books about the estate's history.

Area C is positioned between the house and the larger lake. This is our Cafe, which serves light lunches and afternoon teas. I'd recommend the scones - they're made fresh every morning.

For families, area D is particularly important. You'll see it marked on the eastern side of the grounds, near some trees. That's our Children's Play Area, with climbing structures and swings suitable for ages two to ten.

Now, if you enjoy wildlife, area E is a must. It's located beside the smaller lake, on the north side. This is our Bird Hide, where you can observe herons, kingfishers, and in winter, visiting geese.

Area F marks the starting point of our Sculpture Trail. It's on the western side of the estate, near the larger lake. The trail takes about forty minutes and features works by contemporary artists.

Area G is our Walled Garden, which you'll find to the north of the house. It's a traditional kitchen garden growing heritage vegetables and herbs. It dates back to seventeen eighty.

Finally, area H is our designated Picnic Area, set in a lovely meadow to the south, between the two lakes. There are tables and benches available on a first-come basis.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "map_labelling", "question": "Q11: Rose Garden", "answer": "A"},
                        {"id": "L2Q12", "type": "map_labelling", "question": "Q12: Gift Shop", "answer": "B"},
                        {"id": "L2Q13", "type": "map_labelling", "question": "Q13: Cafe", "answer": "C"},
                        {"id": "L2Q14", "type": "map_labelling", "question": "Q14: Children's Play Area", "answer": "D"},
                        {"id": "L2Q15", "type": "map_labelling", "question": "Q15: Bird Hide", "answer": "E"},
                        {"id": "L2Q16", "type": "map_labelling", "question": "Q16: Sculpture Trail Start", "answer": "F"},
                        {"id": "L2Q17", "type": "note_completion", "question": "Sculpture trail duration: about ________ minutes", "answer": "40/forty"},
                        {"id": "L2Q18", "type": "map_labelling", "question": "Q18: Walled Garden", "answer": "G"},
                        {"id": "L2Q19", "type": "note_completion", "question": "Walled Garden dates back to: ________", "answer": "1780/seventeen eighty"},
                        {"id": "L2Q20", "type": "map_labelling", "question": "Q20: Picnic Area", "answer": "H"}
                    ]
                },
                
                # PART 3: Academic Discussion (Q21-30)
                {
                    "part_number": 3,
                    "title": "Marketing Research Project",
                    "context": "Two students discussing their marketing research assignment",
                    "speakers": ["Rachel", "Tom"],
                    "audio_script": """
Rachel: Hi Tom, shall we go over our marketing research project? The deadline is in two weeks.
Tom: Yes, definitely. So our topic is consumer attitudes towards eco-friendly packaging, right?
Rachel: That's right. I've already drafted the literature review section. I found twelve relevant studies from the past five years.
Tom: Great. I've been working on the methodology. I think we should use a mixed-methods approach - an online survey followed by focus groups.
Rachel: How many survey respondents are we aiming for?
Tom: I was thinking two hundred minimum to get statistically significant results. We can distribute it through the university's social media channels.
Rachel: Good idea. For the focus groups, how many participants per group?
Tom: About eight to ten per group, and I'd suggest three groups: one with students, one with working professionals, and one with retirees. That gives us a good age range.
Rachel: Makes sense. What about the survey questions? I think we should include both Likert scale questions and some open-ended ones.
Tom: Agreed. I've drafted fifteen questions so far. Five on purchasing habits, five on environmental awareness, and five on packaging preferences.
Rachel: That sounds balanced. When should we run the pilot test?
Tom: I'd say next Monday. We can ask our classmates - about twenty people should be enough to identify any problems with the questions.
Rachel: Perfect. One concern I have is the response rate for online surveys. They can be quite low.
Tom: True. Professor Jenkins suggested offering a small incentive - like a five-pound voucher for the first fifty respondents. The department has a budget for that.
Rachel: Oh, that would help. What about the analysis? Are you comfortable with the statistical software?
Tom: I've used SPSS before, so the quantitative data should be fine. For the qualitative data from focus groups, I suggest we use thematic analysis.
Rachel: I can handle the thematic coding. I did that in my sociology module last semester. Let's aim to have all data collected by the end of week three, so we have a full week for analysis and writing.
Tom: Sounds like a solid plan.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "note_completion", "question": "Research topic: consumer attitudes towards eco-friendly ________", "answer": "packaging"},
                        {"id": "L3Q22", "type": "note_completion", "question": "Number of studies found for literature review: ________", "answer": "12/twelve"},
                        {"id": "L3Q23", "type": "note_completion", "question": "Minimum survey respondents needed: ________", "answer": "200/two hundred"},
                        {"id": "L3Q24", "type": "note_completion", "question": "Number of focus group participants per group: ________ to 10", "answer": "8/eight"},
                        {"id": "L3Q25", "type": "note_completion", "question": "Number of focus groups planned: ________", "answer": "3/three"},
                        {"id": "L3Q26", "type": "note_completion", "question": "Total survey questions drafted: ________", "answer": "15/fifteen"},
                        {"id": "L3Q27", "type": "note_completion", "question": "Pilot test day: ________", "answer": "Monday"},
                        {"id": "L3Q28", "type": "note_completion", "question": "Incentive for respondents: a ________-pound voucher", "answer": "5/five"},
                        {"id": "L3Q29", "type": "note_completion", "question": "Statistical software to be used: ________", "answer": "SPSS"},
                        {"id": "L3Q30", "type": "note_completion", "question": "Method for qualitative analysis: ________ analysis", "answer": "thematic"}
                    ]
                },
                
                # PART 4: Academic Lecture (Q31-40)
                {
                    "part_number": 4,
                    "title": "The Psychology of Decision Making",
                    "context": "A university lecture on cognitive biases in decision making",
                    "speakers": ["Professor"],
                    "audio_script": """
Today I want to explore a fascinating area of psychology - the hidden biases that influence our decisions. We like to think we're rational beings, but research shows we're anything but.

Let's start with confirmation bias. This is our tendency to seek out information that supports what we already believe, while ignoring contradictory evidence. A classic study by Peter Wason in nineteen sixty showed that people consistently failed to test their own hypotheses - they only looked for confirming evidence.

The second bias I want to discuss is the anchoring effect. When we make estimates, we're heavily influenced by the first piece of information we encounter. In a famous experiment by Tversky and Kahneman, participants were asked to estimate the percentage of African nations in the United Nations. Those who first saw the number sixty-five gave much higher estimates than those who saw ten, even though the initial number was completely random.

Next, consider the sunk cost fallacy. This is our tendency to continue investing in something because of what we've already spent, rather than making decisions based on future value. Think of someone sitting through a terrible film just because they paid twelve pounds for the ticket.

The availability heuristic is another important bias. We judge the likelihood of events based on how easily we can recall examples. After seeing news reports about shark attacks, people vastly overestimate the risk of swimming in the ocean, even though statistically the chance is about one in three point seven million.

Then there's loss aversion. Research by Kahneman showed that the pain of losing is approximately twice as powerful as the pleasure of gaining. This explains why people hold onto failing investments - the fear of realising a loss outweighs the potential benefit of reinvesting elsewhere.

The framing effect demonstrates how our decisions change based on how information is presented. Telling patients that a surgery has a ninety percent survival rate leads to more positive responses than saying it has a ten percent mortality rate - even though the information is identical.

Group think is another danger. Irving Janis identified this phenomenon in nineteen seventy-two, showing how cohesive groups can make irrational decisions because members suppress dissenting opinions to maintain harmony.

Finally, I want to mention the Dunning-Kruger effect. This bias causes people with limited knowledge to overestimate their competence, while experts tend to underestimate theirs. Studies suggest that people in the bottom quartile of performance typically rate themselves as above average.

Understanding these biases is the first step to overcoming them. In next week's lecture, we'll look at practical strategies for better decision making.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "sentence_completion", "question": "Peter Wason's study on confirmation bias was conducted in ________.", "answer": "1960/nineteen sixty"},
                        {"id": "L4Q32", "type": "sentence_completion", "question": "The anchoring effect experiment was conducted by Tversky and ________.", "answer": "Kahneman"},
                        {"id": "L4Q33", "type": "sentence_completion", "question": "In the sunk cost example, the cinema ticket cost ________ pounds.", "answer": "12/twelve"},
                        {"id": "L4Q34", "type": "sentence_completion", "question": "The statistical chance of a shark attack is about one in ________ million.", "answer": "3.7/three point seven"},
                        {"id": "L4Q35", "type": "sentence_completion", "question": "The pain of losing is approximately ________ times as powerful as gaining.", "answer": "2/two/twice"},
                        {"id": "L4Q36", "type": "sentence_completion", "question": "The surgery example: a ________ percent survival rate sounds more positive.", "answer": "90/ninety"},
                        {"id": "L4Q37", "type": "sentence_completion", "question": "Groupthink was identified by Irving ________.", "answer": "Janis"},
                        {"id": "L4Q38", "type": "sentence_completion", "question": "Janis identified groupthink in the year ________.", "answer": "1972/nineteen seventy-two"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "The Dunning-Kruger effect causes people with limited knowledge to ________ their competence.", "answer": "overestimate"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "People in the bottom ________ of performance rate themselves as above average.", "answer": "quartile"}
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
                    "subtype": "line_graph",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": "The graph below shows the average monthly change in the prices of three metals during 2014.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                    "visual_data": {
                        "type": "line_graph",
                        "image_url": "visual_001_line_graph_metals.png",
                        "title": "Average monthly change in the prices of copper, nickel and zinc (2014)",
                        "x_axis": "Month",
                        "y_axis": "% change compared with previous month",
                        "x_labels": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                        "datasets": [
                            {"metal": "Copper", "style": "dashed with circles"},
                            {"metal": "Nickel", "style": "solid with filled circles"},
                            {"metal": "Zinc", "style": "solid with x markers"}
                        ]
                    },
                    "visual_description": "Line graph showing monthly percentage price changes for copper, nickel and zinc during 2014. All three metals show volatility. Nickel starts highest at about 6% in January, then fluctuates dramatically, dropping to around -3% in June before recovering. Copper and zinc follow similar patterns but with less extreme movements. All three metals show a sharp decline around June. By December, the metals show mixed results with some returning to positive territory.",
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
                    "prompt": "Some people think that the increasing use of technology in the workplace is a positive development, while others believe it causes more problems than it solves.\n\nDiscuss both views and give your own opinion.",
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
                    "topics": ["Shopping", "Weather", "Hobbies"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you prefer shopping in stores or online? Why?"},
                        {"id": "S1Q2", "text": "What kind of weather do you prefer?"},
                        {"id": "S1Q3", "text": "Has the weather in your area changed in recent years?"},
                        {"id": "S1Q4", "text": "Do you have any hobbies? What are they?"},
                        {"id": "S1Q5", "text": "How did you become interested in your hobby?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a decision you made that changed your life",
                        "points": [
                            "What the decision was",
                            "When you made it",
                            "How you made the decision",
                            "And explain how it changed your life"
                        ]
                    },
                    "follow_up": "Do you think it was the right decision?"
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Decision Making",
                    "questions": [
                        {"id": "S3Q1", "text": "Why do some people find it difficult to make decisions?"},
                        {"id": "S3Q2", "text": "Do you think children should be allowed to make their own decisions?"},
                        {"id": "S3Q3", "text": "How has the internet affected the way people make decisions?"},
                        {"id": "S3Q4", "text": "Do you think important decisions are best made alone or with others?"}
                    ]
                }
            ]
        }
    }
}


def get_academic_set_f():
    return ACADEMIC_SET_F
