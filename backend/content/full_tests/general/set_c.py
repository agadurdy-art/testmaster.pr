"""
IELTS-Style General Training Full Test - Set C
===============================================
100% ORIGINAL CONTENT

FOCUS AREAS:
- Reading: Map-based questions, Notice boards, Short answers
- Listening: Map/Plan labelling, Matching, Selection questions
- Writing Task 1: Request letter
- Writing Task 2: Problem-Solution essay
"""

GENERAL_SET_C = {
    "test_id": "general_set_c_01",
    "test_type": "general",
    "title": "IELTS-Style General Training Full Test - Set C",
    "description": "Complete IELTS General Training examination with focus on Map-based and Notice board questions.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    "question_type_focus": ["map_based", "notice_board", "short_answer", "matching"],
    
    "sections": {
        # ============ LISTENING SECTION ============
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Map/Plan Labelling (Q1-10)
                {
                    "part_number": 1,
                    "title": "Shopping Centre Information",
                    "context": "A customer asking for directions at a shopping centre information desk",
                    "speakers": ["Staff", "Customer"],
                    "question_types": ["map_labelling", "form_completion"],
                    
                    # Visual Map Data - Multi-floor shopping centre
                    "visual": {
                        "type": "floor_plan",
                        "image_url": "general_set_c_shopping.png",
                        "title": "Riverside Shopping Centre - Floor Plans",
                        "floors": [
                            {
                                "level": "Ground Floor",
                                "elements": [
                                    {"id": "entrance_main", "label": "Main Entrance", "position": {"x": 50, "y": 90}, "type": "entrance", "given": True},
                                    {"id": "entrance_south", "label": "South Entrance", "position": {"x": 80, "y": 90}, "type": "entrance", "given": True},
                                    {"id": "info_desk", "label": "Information Desk (You are here)", "position": {"x": 50, "y": 85}, "type": "desk", "given": True},
                                    {"id": "fountain", "label": "Fountain", "position": {"x": 50, "y": 60}, "type": "feature", "given": True},
                                    {"id": "escalator", "label": "Escalator", "position": {"x": 45, "y": 80}, "type": "escalator", "given": True},
                                    {"id": "A", "label": "?", "position": {"x": 40, "y": 50}, "type": "shop", "given": False},
                                    {"id": "B", "label": "Bookshop", "position": {"x": 35, "y": 50}, "type": "shop", "given": True},
                                    {"id": "C", "label": "?", "position": {"x": 45, "y": 50}, "type": "shop", "given": False},
                                    {"id": "D", "label": "?", "position": {"x": 75, "y": 80}, "type": "shop", "given": False},
                                    {"id": "E", "label": "Hendersons", "position": {"x": 20, "y": 40}, "type": "department_store", "given": True},
                                    {"id": "F", "label": "?", "position": {"x": 10, "y": 40}, "type": "desk", "given": False}
                                ]
                            },
                            {
                                "level": "First Floor",
                                "elements": [
                                    {"id": "food_court", "label": "Food Court", "position": {"x": 60, "y": 50}, "type": "area", "given": True},
                                    {"id": "G", "label": "?", "position": {"x": 30, "y": 50}, "type": "shop", "given": False},
                                    {"id": "H", "label": "Travel Agent", "position": {"x": 70, "y": 30}, "type": "shop", "given": True},
                                    {"id": "I", "label": "?", "position": {"x": 75, "y": 30}, "type": "cafe", "given": False}
                                ]
                            },
                            {
                                "level": "Second Floor",
                                "elements": [
                                    {"id": "lift", "label": "Lift", "position": {"x": 90, "y": 50}, "type": "lift", "given": True},
                                    {"id": "J", "label": "?", "position": {"x": 85, "y": 45}, "type": "area", "given": False},
                                    {"id": "K", "label": "Café", "position": {"x": 80, "y": 45}, "type": "cafe", "given": True}
                                ]
                            }
                        ],
                        "answer_key": {
                            "A": "MediCare Plus (Pharmacy)",
                            "C": "Optician",
                            "D": "Costa Coffee",
                            "F": "Customer Services",
                            "G": "TechFix",
                            "I": "Bean & Brew",
                            "J": "Play Zone"
                        }
                    },
                    
                    "audio_script": """
Staff: Good morning, welcome to Riverside Shopping Centre. How can I help you?
Customer: Hi, I'm new to the area and this place is huge. Could you help me find a few shops?
Staff: Of course. Let me give you a map. You're currently here at the Information Desk, which is right by the main entrance on the ground floor.
Customer: Great. First, I need to find a pharmacy.
Staff: The pharmacy is called MediCare Plus. If you're facing into the centre from where we are, go straight ahead past the fountain. It's on your left, between the bookshop and the optician.
Customer: Got it. What about a phone repair shop?
Staff: TechFix is on the first floor. Take the escalator up - it's right behind you - and turn left. TechFix is the third shop along, opposite the food court.
Customer: Perfect. I also need to find the children's play area. I'm bringing my kids here tomorrow.
Staff: The play zone is on the second floor, in the east wing. Take the lift at the far end of the building and it's immediately on your right when you exit.
Customer: Is there a charge for that?
Staff: It's free for children under eight, and five pounds for older children. Parents can wait in the café next door.
Customer: Speaking of cafés, where can I get a good coffee?
Staff: There's a Costa on the ground floor, near the south entrance. Or if you prefer independent places, there's a lovely café called Bean & Brew on the first floor, next to the travel agent.
Customer: One more thing - where's the customer service desk? I need to return something.
Staff: Customer Services is on the ground floor, but it's at the opposite end from here, past the department store. Look for the big Hendersons sign and it's just beyond that.
Customer: What time does it close?
Staff: Six thirty on weekdays, eight on Saturdays, and five on Sundays. We're open now until nine, but some services close earlier.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "map_labelling", "question": "Write the correct letter: MediCare Plus pharmacy", "answer": "A"},
                        {"id": "L1Q2", "type": "map_labelling", "question": "Write the correct letter: Optician", "answer": "C"},
                        {"id": "L1Q3", "type": "map_labelling", "question": "TechFix floor: ______ floor", "answer": "first/1st"},
                        {"id": "L1Q4", "type": "map_labelling", "question": "Write the correct letter: TechFix", "answer": "G"},
                        {"id": "L1Q5", "type": "map_labelling", "question": "Write the correct letter: Play Zone", "answer": "J"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Play zone cost for older children: £______", "answer": "5/five"},
                        {"id": "L1Q7", "type": "map_labelling", "question": "Write the correct letter: Costa Coffee", "answer": "D"},
                        {"id": "L1Q8", "type": "map_labelling", "question": "Write the correct letter: Bean & Brew café", "answer": "I"},
                        {"id": "L1Q9", "type": "map_labelling", "question": "Write the correct letter: Customer Services", "answer": "F"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Customer Services Sunday closing time: ______ PM", "answer": "5/five"}
                    ]
                },
                
                # PART 2: Note Completion + Matching (Q11-20)
                {
                    "part_number": 2,
                    "title": "Community Centre Programs",
                    "context": "An announcement about activities at a community centre",
                    "speakers": ["Coordinator"],
                    "question_types": ["note_completion", "matching"],
                    "audio_script": """
Hello everyone, and thank you for attending our open evening at Parkview Community Centre. I'd like to tell you about the programs we're offering this autumn.

For fitness enthusiasts, we have yoga classes every Tuesday and Thursday morning from seven to eight. These are suitable for all levels, from complete beginners to advanced practitioners. Our instructor, Maya, has fifteen years of experience. The cost is eight pounds per session, or sixty pounds for a ten-class pass.

New this season is our senior swimming program. Every Monday and Wednesday afternoon from two to three, we offer pool access exclusively for over-sixties. A qualified lifeguard is always present. There's no booking required - just turn up with your membership card. Non-members can pay six pounds per visit.

Our children's drama club has been incredibly popular. Run by former theatre actress Jennifer Clarke, sessions take place on Saturday mornings from ten to twelve. Children aged seven to fourteen can join. The club will be performing their winter show on December fifteenth - mark your calendars!

For creative adults, we're launching a pottery workshop starting next month. Classes run every Wednesday evening from six thirty to eight thirty. All materials are provided. Spaces are limited to twelve per class, so booking is essential. The eight-week course costs one hundred and twenty pounds.

If you're interested in learning new technology skills, our digital literacy program might be for you. These free sessions cover everything from basic computer use to online safety. They're held on Friday mornings and are particularly popular with our older members.

Language learners will be pleased to know we're expanding our conversation groups. Spanish and French groups meet weekly, and we're adding Mandarin Chinese from October. Each group meets for ninety minutes.

Finally, don't forget our social events. The first Friday of every month is our community dinner - all are welcome, and it's a great way to meet your neighbors. Suggested donation is five pounds.

Program leaflets are available at the reception desk. Any questions, please speak to our staff.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "note_completion", "question": "Yoga class days: Tuesday and ______", "answer": "Thursday"},
                        {"id": "L2Q12", "type": "note_completion", "question": "Yoga instructor experience: ______ years", "answer": "15/fifteen"},
                        {"id": "L2Q13", "type": "note_completion", "question": "Ten-class yoga pass cost: £______", "answer": "60/sixty"},
                        {"id": "L2Q14", "type": "note_completion", "question": "Senior swimming minimum age: ______", "answer": "60/sixty"},
                        {"id": "L2Q15", "type": "note_completion", "question": "Drama club instructor: Jennifer ______", "answer": "Clarke"},
                        {"id": "L2Q16", "type": "note_completion", "question": "Drama show date: December ______", "answer": "15/15th/fifteenth"},
                        {"id": "L2Q17", "type": "note_completion", "question": "Pottery maximum class size: ______", "answer": "12/twelve"},
                        {"id": "L2Q18", "type": "note_completion", "question": "Pottery course total cost: £______", "answer": "120"},
                        {"id": "L2Q19", "type": "note_completion", "question": "New language being added: ______ Chinese", "answer": "Mandarin"},
                        {"id": "L2Q20", "type": "note_completion", "question": "Community dinner suggested donation: £______", "answer": "5/five"}
                    ]
                },
                
                # PART 3: Selection Questions (Q21-30)
                {
                    "part_number": 3,
                    "title": "Flatmate Discussion",
                    "context": "Two people discussing household arrangements",
                    "speakers": ["Rachel", "Marcus"],
                    "question_types": ["selection", "matching"],
                    "audio_script": """
Rachel: Marcus, we need to sort out the flat before Tina moves in next week. I've made a list of things to discuss.
Marcus: Good idea. What's first?
Rachel: Cleaning rota. Currently you do the bathroom, I do the kitchen, and we alternate the living room. With three people, how should we divide things?
Marcus: I think we should add the hallway and stairs to the rota. And maybe rotate everything weekly instead of keeping fixed areas.
Rachel: That seems fair. So everyone does everything over a three-week cycle. What about shared expenses?
Marcus: The bills are straightforward - we split them three ways. But groceries are tricky. Tina mentioned she's vegetarian.
Rachel: Right. I suggest we buy basics together - milk, bread, cleaning supplies - but keep separate accounts for main meals.
Marcus: Works for me. Now, what about guests? I sometimes have friends over at weekends.
Rachel: I don't mind guests, but we should probably agree on some guidelines. Like giving notice if someone's staying overnight?
Marcus: Definitely. Twenty-four hours seems reasonable. And no more than two consecutive nights without asking others first?
Rachel: Perfect. There's also the noise issue. Tina works shifts at the hospital, so she might be sleeping during the day.
Marcus: I hadn't thought of that. We should establish quiet hours. Maybe eleven PM to seven AM, and be considerate about daytime noise when she's on night shifts.
Rachel: She's going to put a note on her door when she's sleeping days. That way we'll know. What about parking?
Marcus: We only have two spaces. Since Tina doesn't have a car, that's actually easier.
Rachel: True. Let's just agree that if either of us has visitors who need parking, we text the other first.
Marcus: Sounds good. One more thing - the thermostat. You like it warmer than I do.
Rachel: Ha! Let's compromise at twenty degrees and wear jumpers if we're cold.
Marcus: Deal. Shall we write all this up as a proper agreement?
Rachel: Yes, I'll draft something tonight and share it with you both.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "form_completion", "question": "New flatmate's name: ______", "answer": "Tina"},
                        {"id": "L3Q22", "type": "form_completion", "question": "New areas added to cleaning rota: hallway and ______", "answer": "stairs"},
                        {"id": "L3Q23", "type": "form_completion", "question": "Cleaning rotation cycle: ______ weeks", "answer": "3/three"},
                        {"id": "L3Q24", "type": "form_completion", "question": "Tina's dietary requirement: ______", "answer": "vegetarian"},
                        {"id": "L3Q25", "type": "selection", "question": "Which items will be bought together? (Choose TWO)", "options": ["A) Milk", "B) Main meals", "C) Bread", "D) Meat", "E) Personal food"], "answer": "A and C"},
                        {"id": "L3Q26", "type": "form_completion", "question": "Notice required for overnight guests: ______ hours", "answer": "24/twenty-four"},
                        {"id": "L3Q27", "type": "form_completion", "question": "Maximum consecutive guest nights without asking: ______", "answer": "2/two"},
                        {"id": "L3Q28", "type": "form_completion", "question": "Tina's workplace: the ______", "answer": "hospital"},
                        {"id": "L3Q29", "type": "form_completion", "question": "Agreed thermostat temperature: ______ degrees", "answer": "20/twenty"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Who will draft the written agreement: ______", "answer": "Rachel"}
                    ]
                },
                
                # PART 4: Sentence Completion + Short Answer (Q31-40)
                {
                    "part_number": 4,
                    "title": "Urban Beekeeping",
                    "context": "A talk about keeping bees in cities",
                    "speakers": ["Speaker"],
                    "question_types": ["sentence_completion", "short_answer"],
                    "audio_script": """
Good evening. My talk tonight is about a growing trend: keeping bees in urban environments. You might think cities are unsuitable for beekeeping, but I'll explain why the opposite is often true.

First, let's address the obvious question: why keep bees in cities at all? The primary answer is pollination. Urban gardens, allotments, and parks all benefit from healthy bee populations. A single hive can pollinate plants within a three-mile radius. Then there's the honey - urban beekeepers typically harvest between twenty and forty pounds per hive annually.

Surprisingly, urban bees often outperform their rural counterparts. Cities are generally two to three degrees warmer than surrounding countryside, extending the foraging season. Urban areas also offer more diverse food sources - think of all those garden flowers, window boxes, and street trees. In contrast, rural monocultures like oilseed rape fields provide abundant food for only brief periods.

Starting urban beekeeping requires careful planning. First, check local regulations - most cities allow beekeeping, but some have restrictions on hive placement. You'll need your neighbors' consent; frightened neighbors make life difficult. The rooftop of a building is ideal because bees fly upward when leaving the hive, avoiding pedestrians below.

A beginner's setup costs between three and five hundred pounds. This includes the hive itself, protective clothing, a smoker to calm the bees, and various tools. I strongly recommend joining a local beekeeping association before purchasing anything. Most offer training courses and mentor programs that will save you expensive mistakes.

Hive maintenance takes about thirty minutes weekly during spring and summer, reducing to monthly checks in winter. Bees are remarkably self-sufficient; your main responsibilities are monitoring for disease, managing honey production, and ensuring adequate food stores for winter.

Common concerns about urban beekeeping include bee stings and swarms. In reality, well-managed bees rarely sting unless threatened. Swarming - when colonies split - can be prevented through proper management techniques. If it does occur, contacting a local beekeeping group will usually produce someone willing to collect the swarm for free.

The environmental benefits extend beyond pollination. Bees act as indicators of ecosystem health. Declining urban bee populations signal problems with pesticide use or habitat loss. Many cities now encourage beekeeping as part of wider biodiversity strategies.

If you're interested in trying beekeeping, the spring is the best time to start. Courses typically run from January to March, preparing participants for their first season. You don't need a garden - balconies, rooftops, and community spaces can all host hives.

Leaflets about local courses and associations are available at the back of the room.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "sentence_completion", "question": "One hive can pollinate plants within a ______ mile radius.", "answer": "3/three"},
                        {"id": "L4Q32", "type": "sentence_completion", "question": "Urban beekeepers harvest between 20 and ______ pounds of honey per hive yearly.", "answer": "40/forty"},
                        {"id": "L4Q33", "type": "short_answer", "question": "How much warmer are cities compared to the countryside?", "answer": "2-3 degrees/two to three degrees"},
                        {"id": "L4Q34", "type": "sentence_completion", "question": "______ provide abundant food for bees for only short periods.", "answer": "monocultures/rural monocultures"},
                        {"id": "L4Q35", "type": "short_answer", "question": "What is recommended as an ideal location for urban hives?", "answer": "rooftop/rooftops/building rooftop"},
                        {"id": "L4Q36", "type": "sentence_completion", "question": "A beginner's beekeeping setup costs between £300 and £______.", "answer": "500/five hundred"},
                        {"id": "L4Q37", "type": "sentence_completion", "question": "Weekly maintenance time during spring/summer: about ______ minutes.", "answer": "30/thirty"},
                        {"id": "L4Q38", "type": "short_answer", "question": "What do bees act as indicators of?", "answer": "ecosystem health"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "The best time to start beekeeping is ______.", "answer": "spring"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "Training courses run from January to ______.", "answer": "March"}
                    ]
                }
            ]
        },
        
        # ============ READING SECTION ============
        "reading": {
            "total_questions": 40,
            "total_time": 3600,
            "passages": [
                # Section 1: Notice Board + Map-based
                {
                    "passage_number": 1,
                    "title": "Town Centre Services Directory",
                    "text_type": "notice_board",
                    "question_types": ["map_based", "matching", "true_false"],
                    "text": """TOWN CENTRE SERVICES - DIRECTORY BOARD

COUNCIL SERVICES
Town Hall - Main Square (Building A on map)
Opening hours: Monday-Friday 9am-5pm
Services: Council tax, housing enquiries, planning applications
Note: Birth/death certificates now issued at Registry Office only

Registry Office - 14 Church Lane (Building B on map)
Opening hours: Monday-Friday 9:30am-4pm, Saturday 10am-1pm
Services: Certificates, marriage bookings, citizenship ceremonies
Appointment required for all services

LIBRARY SERVICES
Central Library - Victoria Road (Building C on map)
Opening hours: Mon-Sat 9am-7pm, Sunday 11am-4pm
Services: Book loans, computer access, printing/copying
Children's section: Lower ground floor
Quiet study area: First floor
Coffee shop on premises

Mobile Library
Visits outlying villages every Thursday
See schedule at Central Library or online

HEALTH SERVICES
Riverside Medical Centre - Waterside Walk (Building D on map)
Opening hours: Monday-Friday 8am-6:30pm
Urgent care: Walk-in appointments 8am-10am daily
Routine appointments: Book online or phone 0123-456789
Pharmacy on site (separate entrance)

Dental Clinic - 42 High Street (Building E on map)
Opening hours: Monday-Friday 8:30am-5pm
NHS and private patients accepted
Emergency line for registered patients: 0800-123456

LEISURE
Sports Centre - Oak Lane (Building F on map)
Opening hours: Mon-Fri 6:30am-10pm, Sat-Sun 8am-8pm
Facilities: Pool, gym, courts, fitness classes
Membership and pay-as-you-go options
Parking: Free for 2 hours with valid ticket

Community Arts Centre - Behind library (Building G on map)
Exhibition space, workshop rooms, theatre
Box office: 0123-789456
Current exhibition: Local Photographers until March 15

PARKING
Multi-storey car park: Adjacent to Town Hall
Ground floor: Disabled spaces, parent & child
Levels 1-4: Standard parking
24-hour access, CCTV monitored
Tariffs: £1.50/hour, £8 max daily, £35 weekly pass""",
                    "questions": [
                        {"id": "R1Q1", "type": "map_based", "question": "Which building on the map is the Registry Office?", "answer": "B"},
                        {"id": "R1Q2", "type": "map_based", "question": "Where is the Dental Clinic located?", "answer": "E/Building E/42 High Street"},
                        {"id": "R1Q3", "type": "matching", "question": "Where would you go to book a wedding?", "answer": "Registry Office/Building B"},
                        {"id": "R1Q4", "type": "matching", "question": "Where can you get urgent medical care without an appointment?", "answer": "Riverside Medical Centre/Building D"},
                        {"id": "R1Q5", "type": "true_false", "question": "The Central Library is open every day of the week.", "answer": "True"},
                        {"id": "R1Q6", "type": "true_false", "question": "Birth certificates can be obtained at Town Hall.", "answer": "False"},
                        {"id": "R1Q7", "type": "form_completion", "question": "Sports Centre free parking duration: ______ hours", "answer": "2/two"}
                    ]
                },
                
                # Section 2: Workplace Information
                {
                    "passage_number": 2,
                    "title": "New Employee Information Pack",
                    "text_type": "workplace_document",
                    "text": """GREENWOOD MANUFACTURING - NEW STARTER INFORMATION

WORKING HOURS AND ATTENDANCE

Standard hours are 8:30am to 5:00pm Monday to Friday, with a one-hour unpaid lunch break. Flexible working arrangements may be available after completion of your probationary period (three months). Requests should be submitted through your line manager.

All employees must clock in and out using the electronic system at Reception. If you forget your ID card, report to Security who will provide a temporary pass. Three instances of failing to clock in correctly may result in a formal warning.

Overtime may be required during busy periods. Overtime rates are time-and-a-half for weekday evenings and Saturdays, and double time for Sundays and bank holidays. All overtime must be pre-approved by your department head.

LEAVE ENTITLEMENT

Annual leave: 22 days per year, increasing to 25 days after three years' service. Leave must be booked at least two weeks in advance for periods of three days or more. No more than two weeks may be taken consecutively without director approval.

Sick leave: Full pay for the first five days of any absence, then Statutory Sick Pay thereafter. A self-certification form is required for absences of one to seven days. Medical certificates are required for longer absences.

Other leave: Please consult the full employee handbook for information about maternity/paternity leave, bereavement leave, and unpaid leave options.

HEALTH AND SAFETY

All new employees must complete the online Health & Safety induction within their first week. This takes approximately 90 minutes and can be completed at any time. Your manager will provide login details.

Fire assembly points are marked on floor plans displayed throughout the building. Fire drills are conducted quarterly without prior notice.

First aid boxes are located in each department. Trained first aiders wear green lanyards. The on-site nurse is available Monday, Wednesday, and Friday from 10am-3pm in Room G12.

Report all accidents, however minor, using the Incident Report Form available on the intranet or from Reception.

FACILITIES

Canteen: Open 7:30am-6pm. Hot meals served 12-2pm. Payment by card or staff account only - no cash accepted.

Parking: Limited spaces available. Apply to Facilities Management. Priority given to those with mobility needs or who live more than 15 miles away. Bicycle storage is unlimited and free.

Staff room: Located on each floor. Equipped with microwaves, kettles, and vending machines.

QUESTIONS?

Your line manager is your first point of contact. HR drop-in sessions are held every Thursday 2-4pm in Meeting Room 3.""",
                    "questions": [
                        {"id": "R2Q8", "type": "form_completion", "question": "Standard lunch break duration: ______ hour(s)", "answer": "1/one"},
                        {"id": "R2Q9", "type": "form_completion", "question": "Probationary period length: ______ months", "answer": "3/three"},
                        {"id": "R2Q10", "type": "form_completion", "question": "Sunday overtime rate: ______ time", "answer": "double"},
                        {"id": "R2Q11", "type": "form_completion", "question": "Starting annual leave entitlement: ______ days", "answer": "22"},
                        {"id": "R2Q12", "type": "form_completion", "question": "Leave increases to 25 days after ______ years", "answer": "3/three"},
                        {"id": "R2Q13", "type": "form_completion", "question": "Full sick pay duration: first ______ days", "answer": "5/five"},
                        {"id": "R2Q14", "type": "form_completion", "question": "H&S induction completion time: approximately ______ minutes", "answer": "90/ninety"},
                        {"id": "R2Q15", "type": "true_false", "question": "Fire drills happen without warning.", "answer": "True"},
                        {"id": "R2Q16", "type": "true_false", "question": "The canteen accepts cash payments.", "answer": "False"},
                        {"id": "R2Q17", "type": "form_completion", "question": "Parking priority distance: more than ______ miles", "answer": "15/fifteen"},
                        {"id": "R2Q18", "type": "matching", "question": "Where should you go for HR queries?", "answer": "Meeting Room 3/Thursday drop-in"},
                        {"id": "R2Q19", "type": "matching", "question": "Who wears green lanyards?", "answer": "first aiders/trained first aiders"},
                        {"id": "R2Q20", "type": "form_completion", "question": "On-site nurse room number: G______", "answer": "12"}
                    ]
                },
                
                # Section 3: General Interest Article
                {
                    "passage_number": 3,
                    "title": "The Rise of Urban Cycling",
                    "text_type": "magazine_article",
                    "text": """When Amsterdam residents cycle to work, they're following a tradition stretching back over a century. But for many of the world's cities, cycling as mainstream transport is a recent phenomenon - and one that's transforming urban landscapes.

The numbers are striking. London's cycle lanes, virtually non-existent before 2010, now form a network spanning hundreds of miles. Paris has tripled its cycling infrastructure in just five years. New York added over 100 miles of protected bike lanes between 2019 and 2023. Even car-centric cities like Los Angeles and Houston are investing in cycling infrastructure.

Several factors drive this shift. Climate concerns top the list - transport accounts for roughly a quarter of global carbon emissions, and cycling produces none. Health benefits are equally compelling: regular cyclists have a 45% lower risk of developing cancer and a 46% lower risk of cardiovascular disease compared to non-cyclists, according to a 2017 University of Glasgow study.

Economic arguments prove surprisingly strong. Building cycling infrastructure costs a fraction of road or rail construction - typically between £1 million and £3 million per mile versus £100 million or more per mile of new underground rail. Cities that invest in cycling also see reduced healthcare costs and increased retail spending in areas with cycle-friendly streets.

The transformation extends beyond dedicated lanes. Bike-sharing schemes, first launched in Lyon in 2005, now operate in over 2,000 cities worldwide. Electric bikes have removed the barrier of hills and distance, making cycling practical for commutes that would otherwise require a car. Cargo bikes increasingly replace delivery vans for last-mile logistics.

Opposition persists. Motorists complain about lost road space. Some pedestrians feel unsafe sharing paths with cyclists. Business owners occasionally resist changes that reduce parking. These concerns deserve attention, but evidence from cities with mature cycling networks shows that fears are generally unfounded - retail areas with cycling improvements typically see increased foot traffic and sales.

Design innovations are addressing many practical barriers. Protected lanes physically separated from traffic make cycling feel safe for a broader range of users. Secure parking facilities reduce theft concerns. Winter maintenance programs in Scandinavian cities demonstrate that cycling need not be seasonal even in harsh climates.

The pandemic accelerated changes already underway. Many cities installed temporary cycle lanes during lockdowns; most have since made these permanent. The experience of quieter, less polluted streets during restrictions demonstrated what urban life could become.

Cultural shifts may prove most significant. In cities where cycling has become mainstream, children cycle to school, elderly residents cycle to shops, and business attire is no barrier. The image of cycling as something only for the athletic or unconventional is fading.

Progress remains uneven. Cycling rates in Northern European cities like Copenhagen (where 62% of residents cycle to work) dwarf those of most other places. But the direction of travel is clear: cities worldwide are recognizing that making space for cyclists improves life for everyone.""",
                    "questions": [
                        {"id": "R3Q21", "type": "short_answer", "question": "What percentage of global carbon emissions comes from transport?", "answer": "25%/a quarter/roughly a quarter"},
                        {"id": "R3Q22", "type": "short_answer", "question": "According to the Glasgow study, what is the lower risk percentage for cancer among cyclists?", "answer": "45%/45 percent"},
                        {"id": "R3Q23", "type": "form_completion", "question": "Cost of cycling infrastructure per mile: £______ million to £3 million", "answer": "1/one"},
                        {"id": "R3Q24", "type": "short_answer", "question": "Where was the first bike-sharing scheme launched?", "answer": "Lyon"},
                        {"id": "R3Q25", "type": "short_answer", "question": "What year did the first bike-sharing scheme start?", "answer": "2005"},
                        {"id": "R3Q26", "type": "form_completion", "question": "Number of cities with bike-sharing: over ______", "answer": "2000/two thousand/2,000"},
                        {"id": "R3Q27", "type": "true_false_ng", "question": "Electric bikes have made cycling impractical for longer distances.", "answer": "False"},
                        {"id": "R3Q28", "type": "true_false_ng", "question": "Retail sales typically decrease when cycling improvements are made.", "answer": "False"},
                        {"id": "R3Q29", "type": "true_false_ng", "question": "Copenhagen has the highest cycling rates mentioned in the passage.", "answer": "True"},
                        {"id": "R3Q30", "type": "form_completion", "question": "Copenhagen cycling to work rate: ______%", "answer": "62"}
                    ]
                },
                
                # Section 4: Information Text
                {
                    "passage_number": 4,
                    "title": "Volunteering Opportunities Guide",
                    "text_type": "information_guide",
                    "text": """VOLUNTEERING IN YOUR COMMUNITY - A COMPREHENSIVE GUIDE

THE VALUE OF VOLUNTEERING

Volunteering offers benefits beyond helping others. Research consistently shows that volunteers experience improved mental health, reduced stress, and a stronger sense of purpose. Many also gain valuable work experience and professional skills.

The national survey of 2023 found that 28% of adults had volunteered in the previous year, contributing an estimated 1.9 billion hours of unpaid work. The economic value of this contribution exceeds £50 billion annually.

FINDING OPPORTUNITIES

Local volunteer centres maintain databases of opportunities matching volunteers with organizations needing help. Many councils now host online portals where residents can browse positions by category, time commitment, and location.

Universities and colleges typically have volunteering offices connecting students with community projects. Student volunteers gain experience while meeting degree requirements for placements or community engagement.

Employer-supported volunteering has grown significantly. Over 40% of large companies now offer paid volunteering days, typically two to five days annually. This benefits charities while building employee skills and morale.

TYPES OF VOLUNTEERING

Regular commitment roles suit those with predictable schedules. Examples include weekly sessions at food banks, monthly administrative support for charities, or ongoing mentoring relationships with young people.

Event-based volunteering appeals to those preferring one-off involvement. Festivals, sports events, and community clean-ups all rely heavily on occasional volunteers.

Skills-based volunteering matches professional expertise with organizational needs. Accountants might prepare charity accounts, marketers develop campaigns, or IT professionals upgrade systems.

Remote volunteering has expanded considerably. Helpline staffing, online tutoring, and administrative tasks can often be performed from home, removing geographical barriers.

THINGS TO CONSIDER

Time: Be realistic about your availability. Organizations depend on reliable volunteers; overcommitting helps no one.

Interests: Choose causes you care about. Passion sustains involvement when initial enthusiasm fades.

Skills: Consider both what you can offer and what you might learn. Volunteering works best as a mutual exchange.

Support: Good organizations provide training, supervision, and clear expectations. Be wary of those that don't.

Background checks: Most positions working with vulnerable groups require Disclosure and Barring Service (DBS) checks. Organizations handle applications, but processing takes several weeks.

GETTING STARTED

Visit www.volunteering.org.uk for the national database
Contact your local council's volunteering coordinator
Ask existing volunteers about their experiences
Start with a trial period before committing long-term""",
                    "questions": [
                        {"id": "R4Q31", "type": "form_completion", "question": "Adult volunteering rate in 2023: ______%", "answer": "28"},
                        {"id": "R4Q32", "type": "form_completion", "question": "Estimated volunteer hours contributed: ______ billion", "answer": "1.9"},
                        {"id": "R4Q33", "type": "form_completion", "question": "Economic value of volunteering: over £______ billion", "answer": "50/fifty"},
                        {"id": "R4Q34", "type": "form_completion", "question": "Large companies offering volunteering days: over ______%", "answer": "40"},
                        {"id": "R4Q35", "type": "form_completion", "question": "Typical paid volunteering days per year: ______ to 5", "answer": "2/two"},
                        {"id": "R4Q36", "type": "matching", "question": "Which type of volunteering involves using professional skills?", "answer": "skills-based volunteering"},
                        {"id": "R4Q37", "type": "matching", "question": "Which type involves one-off participation?", "answer": "event-based volunteering"},
                        {"id": "R4Q38", "type": "short_answer", "question": "What check is required for working with vulnerable groups?", "answer": "DBS check/Disclosure and Barring Service check"},
                        {"id": "R4Q39", "type": "true_false_ng", "question": "Volunteers should commit to as many hours as possible.", "answer": "False"},
                        {"id": "R4Q40", "type": "true_false_ng", "question": "DBS checks are processed immediately.", "answer": "False"}
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
                    "type": "letter",
                    "subtype": "request",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": """You are organizing a community event and need to use the local town hall.

Write a letter to the town hall manager. In your letter:
- explain what event you are planning
- say what facilities you will need
- ask about availability and costs""",
                    "tone": "semi-formal"
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "subtype": "problem_solution",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "Many young people today find it difficult to get their first job after leaving school or university. What problems does this cause for individuals and society? What solutions can you suggest?",
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
                    "topics": ["Your neighborhood", "Local facilities", "Community"],
                    "questions": [
                        {"id": "S1Q1", "text": "Can you describe the area where you live?"},
                        {"id": "S1Q2", "text": "What facilities are available in your neighborhood?"},
                        {"id": "S1Q3", "text": "Do you know your neighbors well?"},
                        {"id": "S1Q4", "text": "What changes would you like to see in your local area?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a community service or organization in your area",
                        "points": [
                            "What service or organization it is",
                            "What it does for the community",
                            "How you know about it",
                            "And explain why it is important to the community"
                        ]
                    },
                    "follow_up": ["Would you consider volunteering for this organization?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Community and Social Responsibility",
                    "questions": [
                        {"id": "S3Q1", "text": "Why do you think some people volunteer their time to help others?"},
                        {"id": "S3Q2", "text": "Should helping the community be compulsory for young people?"},
                        {"id": "S3Q3", "text": "How has community life changed compared to the past?"},
                        {"id": "S3Q4", "text": "What role should the government play in supporting local communities?"}
                    ]
                }
            ]
        }
    }
}
