"""
IELTS-Style General Training Full Test - Set A
===============================================
100% ORIGINAL CONTENT - NOT COPIED FROM CAMBRIDGE

This test matches IELTS General Training format, timing, and difficulty level.
General Training Reading has different text types than Academic.
Writing Task 1 is a letter instead of data description.
"""

from typing import Dict, Any

GENERAL_SET_A = {
    "test_id": "general_set_a_01",
    "test_type": "general",
    "title": "IELTS-Style General Training Full Test - Set A",
    "description": "Complete IELTS General Training examination covering all 4 skills: Listening, Reading, Writing, and Speaking.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    
    "sections": {
        # ============ LISTENING SECTION ============
        # (Same as Academic - Listening is identical for both test types)
        "listening": {
            "total_questions": 40,
            "total_time": 2400,  # 40 minutes
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Social/Transactional (Q1-10)
                {
                    "part_number": 1,
                    "title": "Fitness Centre Membership",
                    "context": "A phone conversation between a new member and gym staff",
                    "speakers": ["Staff", "New Member"],
                    "audio_script": """
Staff: Good afternoon, Riverside Fitness Centre. How can I help you?
Member: Hi, I'd like to enquire about membership options, please.
Staff: Of course. Are you interested in individual or family membership?
Member: Just individual. I work nearby and want to use the gym during lunch breaks.
Staff: Perfect. We have three membership tiers: Bronze, Silver, and Gold. Bronze is forty-five pounds monthly and gives you access to the gym floor and pool.
Member: What about classes?
Staff: Silver includes unlimited classes and costs sixty-five pounds. Gold is our premium tier at eighty-five pounds, which includes personal training sessions and spa access.
Member: I think Silver would suit me. What are your opening hours?
Staff: We're open from six AM to ten PM on weekdays, and eight to eight on weekends.
Member: Great. Can I sign up today?
Staff: Absolutely. I'll need your full name and a form of ID.
Member: My name is David Chen. That's C-H-E-N.
Staff: And your contact number, Mr Chen?
Member: It's oh-seven-nine-five-five, three-two-one, four-eight-six.
Staff: Thank you. Now, your first month is half price as a joining offer. That makes it thirty-two pounds fifty for the first month.
Member: Excellent. Can I pay by card?
Staff: Yes, we accept all major cards. Also, I should mention we're currently renovating the changing rooms, so there may be some noise this week.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Type of membership enquired about: ______", "answer": "individual"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Bronze membership monthly cost: £______", "answer": "45"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Silver membership includes unlimited ______", "answer": "classes"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Gold membership additional feature: ______ access", "answer": "spa"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Weekend opening hours: 8 AM to ______ PM", "answer": "8"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Customer surname spelling: ______", "answer": "Chen"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Contact number: 07955 321 ______", "answer": "486"},
                        {"id": "L1Q8", "type": "form_completion", "question": "First month special price: £______", "answer": "32.50/32.5"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Payment method accepted: all major ______", "answer": "cards"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Current renovation work: ______ rooms", "answer": "changing"}
                    ]
                },
                
                # PART 2: Monologue - Social Context (Q11-20)
                {
                    "part_number": 2,
                    "title": "Community Centre Activities",
                    "context": "An information talk about a local community centre",
                    "speakers": ["Centre Manager"],
                    "audio_script": """
Good morning everyone, and welcome to the Oakwood Community Centre open day. I'm Patricia, the centre manager, and I'm delighted to show you around today.

First, let me give you a brief overview of our facilities. On the ground floor, we have the main hall, which can accommodate up to two hundred people for events. It's very popular for birthday parties, wedding receptions, and community meetings. Adjacent to this is our smaller meeting room, perfect for groups of twenty to thirty people.

Upstairs, you'll find our newly refurbished art studio. We offer painting and pottery classes every Tuesday and Thursday evening from six-thirty to eight-thirty. No experience is necessary - our qualified instructors will guide you through everything.

For those interested in physical activities, we have a dance studio on the first floor. Currently, we run yoga classes on Monday mornings, salsa dancing on Wednesday evenings, and a children's ballet class on Saturday afternoons.

The community centre also houses a small library. It's not as extensive as the town library, but we have a wonderful collection of local history books and children's literature. The library is staffed by volunteers and is open Tuesday to Saturday, from ten until four.

Now, regarding membership. Annual membership costs just fifteen pounds for adults and five pounds for children under sixteen. Members receive a ten percent discount on room hire and priority booking for popular classes.

If you'd like to volunteer with us, we're always looking for help, particularly with our senior citizens' lunch club which runs every Friday. Volunteers help prepare and serve meals and, most importantly, provide companionship for elderly residents who might otherwise be isolated.

Any questions? Please feel free to ask as we walk around.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "multiple_choice", "question": "The main hall capacity is:", "options": ["100 people", "200 people", "300 people"], "answer": "200 people"},
                        {"id": "L2Q12", "type": "form_completion", "question": "Art classes are held on Tuesday and ______ evenings", "answer": "Thursday"},
                        {"id": "L2Q13", "type": "form_completion", "question": "Art class time: 6:30 to ______", "answer": "8:30/8.30"},
                        {"id": "L2Q14", "type": "matching", "question": "Yoga classes are on ______ mornings", "answer": "Monday"},
                        {"id": "L2Q15", "type": "matching", "question": "Salsa dancing is on ______ evenings", "answer": "Wednesday"},
                        {"id": "L2Q16", "type": "matching", "question": "Children's ballet is on ______ afternoons", "answer": "Saturday"},
                        {"id": "L2Q17", "type": "form_completion", "question": "Library opening days: Tuesday to ______", "answer": "Saturday"},
                        {"id": "L2Q18", "type": "form_completion", "question": "Adult membership annual cost: £______", "answer": "15"},
                        {"id": "L2Q19", "type": "form_completion", "question": "Member discount on room hire: ______ percent", "answer": "10"},
                        {"id": "L2Q20", "type": "form_completion", "question": "Senior citizens' lunch club day: ______", "answer": "Friday"}
                    ]
                },
                
                # PART 3: Discussion - Educational/Training Context (Q21-30)
                {
                    "part_number": 3,
                    "title": "Workplace Training Discussion",
                    "context": "Two colleagues discussing a professional development course",
                    "speakers": ["Sarah", "Michael"],
                    "audio_script": """
Sarah: Michael, have you signed up for the project management training next month?
Michael: I'm considering it. What do you know about it?
Sarah: Well, it's a three-day intensive course. Days one and two cover the fundamentals, and day three is a practical workshop where you work on a real project.
Michael: Three days is quite a commitment. Is it worth it?
Sarah: Definitely. I did a similar course last year. The certification is recognized industry-wide, and several colleagues got promotions partly because of it.
Michael: What topics does it cover exactly?
Sarah: The first day focuses on planning and scheduling - things like creating timelines, setting milestones, and resource allocation. Day two is about team management, communication strategies, and handling conflicts.
Michael: And the practical workshop?
Sarah: You're put into groups and given a scenario. Last year, we had to plan a product launch within budget and time constraints. It was challenging but really valuable.
Michael: Who runs the training?
Sarah: It's delivered by an external company called ProSkills Training. The lead instructor, Dr Angela Foster, has twenty years' experience in the field. She's written several textbooks on the subject.
Michael: What's the cost?
Sarah: The company covers the course fee for permanent staff. You just need manager approval. Contractors have to pay themselves - I think it's around four hundred and fifty pounds.
Michael: I'm permanent, so that's good. When's the deadline for applications?
Sarah: The fifteenth of this month. You submit a form online and need a brief statement explaining why the training would benefit your role.
Michael: I'd better get on that then. Thanks for the information, Sarah.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "multiple_choice", "question": "The training course lasts:", "options": ["2 days", "3 days", "5 days"], "answer": "3 days"},
                        {"id": "L3Q22", "type": "form_completion", "question": "Day 1 topics: planning and ______", "answer": "scheduling"},
                        {"id": "L3Q23", "type": "form_completion", "question": "Day 2 topic includes handling ______", "answer": "conflicts"},
                        {"id": "L3Q24", "type": "form_completion", "question": "Practical workshop scenario: planning a product ______", "answer": "launch"},
                        {"id": "L3Q25", "type": "form_completion", "question": "Training company name: ______ Training", "answer": "ProSkills"},
                        {"id": "L3Q26", "type": "form_completion", "question": "Lead instructor: Dr Angela ______", "answer": "Foster"},
                        {"id": "L3Q27", "type": "form_completion", "question": "Dr Foster's experience: ______ years", "answer": "20/twenty"},
                        {"id": "L3Q28", "type": "form_completion", "question": "Cost for contractors: £______", "answer": "450"},
                        {"id": "L3Q29", "type": "form_completion", "question": "Application deadline: ______ of this month", "answer": "15th/fifteenth"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Application requires a brief ______ explaining benefits", "answer": "statement"}
                    ]
                },
                
                # PART 4: Academic Lecture/Talk (Q31-40)
                {
                    "part_number": 4,
                    "title": "The History of Public Libraries",
                    "context": "A lecture about the development of public libraries",
                    "speakers": ["Lecturer"],
                    "audio_script": """
Today's lecture examines the fascinating history of public libraries and their role in democratizing knowledge.

The concept of libraries dates back thousands of years. The famous Library of Alexandria, founded around 300 BC, was one of the largest in the ancient world. However, these early libraries were exclusively for scholars and the wealthy elite.

The modern public library movement began in the nineteenth century. In Britain, the Public Libraries Act of 1850 allowed local authorities to establish free libraries funded by taxes. This was revolutionary - for the first time, ordinary working people could access books without payment.

One key figure in this movement was Andrew Carnegie, the Scottish-American industrialist. Between 1883 and 1929, Carnegie funded the construction of over two thousand five hundred public libraries worldwide, with the majority in the United States, Britain, and Canada. He believed that libraries were the best form of philanthropy because they helped people help themselves.

The twentieth century saw libraries expand their services beyond book lending. Reference sections, children's areas, and study spaces became standard features. The introduction of computers in the 1990s transformed how libraries operated, with digital catalogs replacing card systems.

Today, public libraries face new challenges. Some argue that the internet has made them obsolete. However, research shows that library usage has actually increased in many areas. Libraries now offer services like job-seeking assistance, digital literacy training, and community meeting spaces. They've become community hubs rather than simply book repositories.

Looking ahead, libraries continue to evolve. Many now lend items beyond books - from tools and musical instruments to artwork and even cake tins. The core mission remains unchanged: providing free access to information and resources for all members of society.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "form_completion", "question": "Library of Alexandria founded around: ______ BC", "answer": "300"},
                        {"id": "L4Q32", "type": "form_completion", "question": "Early libraries were only for scholars and the wealthy ______", "answer": "elite"},
                        {"id": "L4Q33", "type": "form_completion", "question": "British Public Libraries Act passed in: ______", "answer": "1850"},
                        {"id": "L4Q34", "type": "form_completion", "question": "The act allowed libraries funded by ______", "answer": "taxes"},
                        {"id": "L4Q35", "type": "form_completion", "question": "Andrew Carnegie's nationality: ______-American", "answer": "Scottish"},
                        {"id": "L4Q36", "type": "form_completion", "question": "Carnegie funded over ______ public libraries", "answer": "2500/2,500"},
                        {"id": "L4Q37", "type": "form_completion", "question": "Carnegie believed libraries helped people help ______", "answer": "themselves"},
                        {"id": "L4Q38", "type": "form_completion", "question": "In the 1990s, ______ catalogs replaced card systems", "answer": "digital"},
                        {"id": "L4Q39", "type": "form_completion", "question": "Modern libraries have become community ______", "answer": "hubs"},
                        {"id": "L4Q40", "type": "form_completion", "question": "Core mission: providing free access to information for all ______ of society", "answer": "members"}
                    ]
                }
            ]
        },
        
        # ============ READING SECTION ============
        # General Training Reading is different from Academic
        "reading": {
            "total_questions": 40,
            "total_time": 3600,  # 60 minutes
            "instructions": "Read the texts and answer questions 1-40.",
            
            "passages": [
                # Section 1: Short texts (Q1-14) - Practical, everyday contexts
                {
                    "passage_number": 1,
                    "title": "Job Advertisements",
                    "type": "multiple_short_texts",
                    "text": """
TEXT A - RETAIL SALES ASSISTANT
MORRISON'S DEPARTMENT STORE
Part-time position (20 hours/week)
We are seeking a friendly, customer-focused individual to join our home furnishings department. Previous retail experience preferred but not essential. Must be available weekends. Competitive hourly rate plus staff discount.
Apply online at www.morrisons-careers.com or in-store.

TEXT B - DELIVERY DRIVER
SWIFT LOGISTICS
Full-time, permanent position
Immediate start available. Clean driving licence required (Category B minimum). Must be physically fit as role involves loading/unloading. £28,000 annual salary plus overtime. Company van provided.
Email CV to: recruitment@swiftlogistics.co.uk

TEXT C - ADMINISTRATIVE ASSISTANT  
GREENWOOD MEDICAL CENTRE
37.5 hours/week, Monday-Friday
We require an organized individual with excellent communication skills to support our busy medical practice. Duties include appointment scheduling, patient enquiries, and general office tasks. Experience with medical software advantageous. Salary: £22,500.
Applications by post only with covering letter to: Practice Manager, Greenwood Medical Centre, 45 Oak Street, Manchester M1 2AB

TEXT D - CAFE TEAM MEMBER
THE COFFEE CORNER
Various shifts available
No experience necessary - full training provided! We're looking for enthusiastic people to prepare and serve food and beverages. Flexible hours suit students. Minimum age 16. £8.50/hour.
Drop in with CV any weekday between 10am-4pm.

TEXT E - NIGHT SECURITY OFFICER
HARBORVIEW SHOPPING CENTRE
Full-time, shift work (10pm-6am)
SIA licence essential. Previous security experience required (minimum 2 years). Responsibilities include patrols, CCTV monitoring, and incident reporting. £14.50/hour plus night shift premium.
Apply through our website: www.harborview.com/careers
                    """,
                    "questions": [
                        {"id": "R1Q1", "type": "matching", "question": "Which job requires a specific licence beyond a driving licence?", "answer": "E"},
                        {"id": "R1Q2", "type": "matching", "question": "Which job offers training for people with no experience?", "answer": "D"},
                        {"id": "R1Q3", "type": "matching", "question": "Which job requires applications to be sent by mail?", "answer": "C"},
                        {"id": "R1Q4", "type": "matching", "question": "Which job provides a vehicle?", "answer": "B"},
                        {"id": "R1Q5", "type": "matching", "question": "Which job mentions an employee discount?", "answer": "A"},
                        {"id": "R1Q6", "type": "true_false_ng", "question": "The retail position requires weekend availability.", "answer": "TRUE"},
                        {"id": "R1Q7", "type": "true_false_ng", "question": "The delivery driver role is a temporary position.", "answer": "FALSE"}
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Workplace Safety Guidelines",
                    "type": "information_text",
                    "text": """
FIRE SAFETY PROCEDURES - EMPLOYEE HANDBOOK EXTRACT

All employees must familiarize themselves with the following fire safety procedures:

FIRE ALARMS
The building is equipped with automatic smoke detectors and manual call points. If you discover a fire or see smoke, activate the nearest call point by breaking the glass. The fire alarm is a continuous ringing bell.

EVACUATION ROUTES
Emergency exit routes are marked with green signs throughout the building. Never use lifts during a fire evacuation. Assembly points are located in the main car park (Area A) and the grass area behind Building B (Area B). Your assembly point depends on your department - check the notice board in your work area.

FIRE EXTINGUISHERS
Fire extinguishers are positioned at regular intervals throughout all buildings. Different types are used for different fires:
- RED (Water): Paper, wood, textiles - NOT for electrical fires
- BLUE (Dry powder): Flammable liquids, electrical equipment
- BLACK (CO2): Electrical fires, computer equipment
Only use a fire extinguisher if you have received training and the fire is small.

FIRE MARSHALS
Each floor has designated fire marshals who wear orange vests during evacuations. Follow their instructions and report to them at the assembly point.

FIRE DRILLS
Practice evacuations are held quarterly. All employees must participate. During drills, behave as if the alarm were real. Evacuation time targets: ground floor under 2 minutes, upper floors under 4 minutes.
                    """,
                    "questions": [
                        {"id": "R1Q8", "type": "fill_blank", "question": "The fire alarm makes a continuous ______ sound.", "answer": "ringing/bell"},
                        {"id": "R1Q9", "type": "true_false_ng", "question": "Employees should use lifts to evacuate quickly during fires.", "answer": "FALSE"},
                        {"id": "R1Q10", "type": "fill_blank", "question": "Water extinguishers should not be used on ______ fires.", "answer": "electrical"},
                        {"id": "R1Q11", "type": "fill_blank", "question": "Fire marshals can be identified by their ______ vests.", "answer": "orange"},
                        {"id": "R1Q12", "type": "fill_blank", "question": "Fire drills take place every ______ months.", "answer": "three/3"},
                        {"id": "R1Q13", "type": "true_false_ng", "question": "Only trained employees should attempt to use fire extinguishers.", "answer": "TRUE"},
                        {"id": "R1Q14", "type": "fill_blank", "question": "Upper floors should be evacuated within ______ minutes.", "answer": "4/four"}
                    ]
                },
                
                # Section 2: Medium-length text (Q15-27)
                {
                    "passage_number": 3,
                    "title": "A Guide to Renting Your First Apartment",
                    "type": "informative_article",
                    "text": """
A GUIDE TO RENTING YOUR FIRST APARTMENT

Finding and securing your first rental property can be both exciting and daunting. This guide walks you through the essential steps.

DETERMINING YOUR BUDGET
Financial experts recommend spending no more than 30% of your gross monthly income on rent. Remember to account for additional costs: utility bills (electricity, gas, water), council tax, internet, and contents insurance. Many landlords require a deposit (typically 4-6 weeks' rent) plus the first month's rent upfront.

WHAT TO LOOK FOR IN A PROPERTY
Location is paramount. Consider proximity to your workplace, public transport links, local amenities, and safety. Inside the property, check water pressure, heating efficiency, storage space, and natural light. Look for signs of damp or mould, and test all appliances if furnished.

THE APPLICATION PROCESS
Landlords or letting agents will require references - typically from a previous landlord and your employer. They'll also conduct a credit check. Be prepared to provide:
- Proof of identity (passport or driving licence)
- Proof of income (recent payslips or employment contract)
- Bank statements (usually 3 months)
- Previous landlord references

If you're a first-time renter without landlord references, some landlords accept a guarantor instead. A guarantor is typically a parent or relative who agrees to cover rent payments if you cannot.

UNDERSTANDING YOUR TENANCY AGREEMENT
Before signing, read the tenancy agreement thoroughly. Key points to understand:
- Length of tenancy (fixed term vs. periodic)
- Notice period required to end the tenancy
- Restrictions (e.g., pets, smoking, subletting)
- Responsibility for repairs and maintenance
- Rules about making alterations or decorating

THE INVENTORY CHECK
An inventory documents the condition of the property and its contents at the start of your tenancy. Go through it carefully, noting any existing damage. Take dated photographs as evidence. This protects your deposit when you eventually move out.

MOVING IN
Arrange connections for utilities and internet before your moving day. Notify relevant parties of your address change: bank, employer, GP, DVLA if you have a vehicle. Consider arranging contents insurance to protect your belongings.

YOUR RIGHTS AS A TENANT
You have the legal right to live in a property that's safe, in good repair, and free from hazards. Your landlord must provide an Energy Performance Certificate, gas safety certificate, and protect your deposit in a government-approved scheme. They cannot enter the property without giving appropriate notice (usually 24 hours), except in emergencies.
                    """,
                    "questions": [
                        {"id": "R2Q15", "type": "fill_blank", "question": "Maximum recommended rent as percentage of income: ______%", "answer": "30"},
                        {"id": "R2Q16", "type": "fill_blank", "question": "Typical deposit amount: ______ weeks' rent", "answer": "4-6/4 to 6"},
                        {"id": "R2Q17", "type": "true_false_ng", "question": "Location should be considered less important than property size.", "answer": "FALSE"},
                        {"id": "R2Q18", "type": "fill_blank", "question": "Number of months of bank statements typically required: ______", "answer": "3/three"},
                        {"id": "R2Q19", "type": "fill_blank", "question": "First-time renters may need a ______ instead of landlord references.", "answer": "guarantor"},
                        {"id": "R2Q20", "type": "true_false_ng", "question": "A tenancy agreement may include rules about keeping pets.", "answer": "TRUE"},
                        {"id": "R2Q21", "type": "fill_blank", "question": "The inventory should be checked and ______ taken as evidence.", "answer": "photographs/photos"},
                        {"id": "R2Q22", "type": "multiple_choice", "question": "Which document is NOT mentioned as a landlord requirement?", "options": ["Energy Performance Certificate", "Gas safety certificate", "Building insurance certificate"], "answer": "Building insurance certificate"},
                        {"id": "R2Q23", "type": "fill_blank", "question": "Landlords must give ______ hours notice before entering.", "answer": "24"},
                        {"id": "R2Q24", "type": "true_false_ng", "question": "Landlords can enter the property anytime without notice.", "answer": "FALSE"},
                        {"id": "R2Q25", "type": "fill_blank", "question": "Deposits must be protected in a ______ scheme.", "answer": "government-approved"},
                        {"id": "R2Q26", "type": "true_false_ng", "question": "Contents insurance is legally required for tenants.", "answer": "NOT GIVEN"},
                        {"id": "R2Q27", "type": "matching_headings", "question": "Which section discusses what a guarantor does?", "answer": "THE APPLICATION PROCESS"}
                    ]
                },
                
                # Section 3: Long text (Q28-40) - More complex, similar to Academic
                {
                    "passage_number": 4,
                    "title": "The Rise of Remote Working",
                    "type": "discursive_text",
                    "text": """
THE RISE OF REMOTE WORKING: TRANSFORMING THE MODERN WORKPLACE

A The COVID-19 pandemic fundamentally altered how millions of people around the world approach their working lives. What was once considered a perk offered by progressive employers became, almost overnight, the default mode of operation for countless businesses. As restrictions have eased, many organizations have chosen to maintain some form of flexible working arrangement, prompting a broader reassessment of traditional workplace norms.

B The technology enabling remote work has existed for decades. Video conferencing, cloud computing, and collaborative software were all well-established before 2020. What the pandemic provided was the catalyst for mass adoption. Companies that had resisted remote work, citing concerns about productivity and collaboration, were forced to embrace it. Many discovered that their fears were unfounded - numerous studies conducted during and after lockdowns suggested that productivity actually increased for many remote workers.

C However, the picture is not uniformly positive. Mental health professionals have noted a rise in feelings of isolation and burnout among remote workers. The boundaries between work and personal life have become increasingly blurred, with many employees reporting that they work longer hours when based at home. The informal interactions that occur naturally in office environments - conversations by the coffee machine, impromptu brainstorming sessions - are difficult to replicate virtually, potentially impacting creativity and team cohesion.

D The implications for urban planning and commercial real estate are significant. City centres built around the assumption of daily commuting face uncertain futures. Some analysts predict a shift towards smaller, more flexible office spaces used for collaboration rather than individual desk work. Suburban and rural areas may benefit as workers, freed from daily commutes, seek larger homes in areas with lower costs of living.

E Employers are navigating complex decisions about their future workplace strategies. A hybrid model, combining remote work with periodic office attendance, has emerged as a popular compromise. This approach aims to capture the benefits of flexibility while maintaining opportunities for in-person collaboration and company culture building. However, implementing hybrid work effectively presents its own challenges, including ensuring equity between remote and office-based employees.

F The environmental impact of reduced commuting presents another dimension to consider. Fewer cars on the road and reduced demand for office heating and cooling could contribute to lower carbon emissions. However, increased home energy consumption and the environmental cost of shipping goods to individual homes rather than centralized workplaces partially offset these gains. The net environmental effect remains a subject of ongoing research.

G Looking ahead, it seems clear that the traditional model of five days per week in a centralized office is unlikely to return for many knowledge workers. Instead, a more diverse landscape of working arrangements is emerging. Some organizations are embracing fully remote models, hiring talent globally without regard to geography. Others are investing in redesigned office spaces optimized for collaboration rather than individual work. The challenge for businesses and policymakers alike will be adapting systems and infrastructure built around old assumptions to serve this new reality.

H For individual workers, this shift presents both opportunities and responsibilities. The ability to work from anywhere offers unprecedented flexibility in balancing professional and personal commitments. Yet this freedom demands greater self-discipline and intentionality in maintaining boundaries, social connections, and professional development. As remote work becomes normalized rather than novel, workers must actively cultivate the skills and habits that contribute to long-term success in this environment.
                    """,
                    "questions": [
                        {"id": "R3Q28", "type": "matching_headings", "question": "Which paragraph discusses the mental health impacts of remote work?", "answer": "C"},
                        {"id": "R3Q29", "type": "matching_headings", "question": "Which paragraph mentions the environmental considerations?", "answer": "F"},
                        {"id": "R3Q30", "type": "matching_headings", "question": "Which paragraph discusses urban planning implications?", "answer": "D"},
                        {"id": "R3Q31", "type": "true_false_ng", "question": "Remote working technology was only developed during the pandemic.", "answer": "FALSE"},
                        {"id": "R3Q32", "type": "true_false_ng", "question": "Studies showed productivity decreased for most remote workers.", "answer": "FALSE"},
                        {"id": "R3Q33", "type": "true_false_ng", "question": "Remote workers often work fewer hours than office-based employees.", "answer": "FALSE"},
                        {"id": "R3Q34", "type": "fill_blank", "question": "A ______ model combines remote work with office attendance.", "answer": "hybrid"},
                        {"id": "R3Q35", "type": "true_false_ng", "question": "The environmental benefits of remote work are conclusively proven.", "answer": "NOT GIVEN"},
                        {"id": "R3Q36", "type": "fill_blank", "question": "Some companies now hire talent ______ without geographic limitations.", "answer": "globally"},
                        {"id": "R3Q37", "type": "multiple_choice", "question": "According to paragraph E, what challenge does hybrid work present?", "options": ["Higher costs", "Ensuring equity between remote and office workers", "Technology failures"], "answer": "Ensuring equity between remote and office workers"},
                        {"id": "R3Q38", "type": "fill_blank", "question": "Paragraph H suggests remote workers need greater self-______ to succeed.", "answer": "discipline"},
                        {"id": "R3Q39", "type": "true_false_ng", "question": "The author believes all workers will return to five-day office weeks.", "answer": "FALSE"},
                        {"id": "R3Q40", "type": "matching_information", "question": "Which paragraph discusses what individual workers need to do?", "answer": "H"}
                    ]
                }
            ]
        },
        
        # ============ WRITING SECTION ============
        # General Training Writing Task 1 is a LETTER
        "writing": {
            "total_time": 3600,  # 60 minutes
            "instructions": "Complete both tasks. Task 2 carries more marks than Task 1.",
            
            "tasks": [
                # Task 1: Letter (20 minutes, 150 words minimum)
                {
                    "task_number": 1,
                    "type": "letter",
                    "letter_type": "semi-formal",
                    "prompt": """You recently bought a piece of equipment for your kitchen but it did not work. You phoned the shop but no action was taken.

Write a letter to the shop manager. In your letter:
- describe the problem with the equipment
- explain what happened when you phoned the shop
- say what you would like the manager to do""",
                    "word_limit": {"min": 150, "recommended": 170},
                    "time_suggested": 20,
                    "assessment_criteria": ["task_achievement", "coherence_cohesion", "lexical_resource", "grammatical_range_accuracy"],
                    "sample_beginning": "Dear Sir/Madam,\n\nI am writing to complain about..."
                },
                
                # Task 2: Essay (40 minutes, 250 words minimum)
                {
                    "task_number": 2,
                    "type": "essay",
                    "prompt": """Some people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try and improve such situations.

Discuss both these views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.""",
                    "word_limit": {"min": 250, "recommended": 280},
                    "time_suggested": 40,
                    "assessment_criteria": ["task_response", "coherence_cohesion", "lexical_resource", "grammatical_range_accuracy"]
                }
            ]
        },
        
        # ============ SPEAKING SECTION ============
        # Same format as Academic
        "speaking": {
            "total_time": 900,  # 11-14 minutes
            "instructions": "The speaking test has three parts and takes between 11 and 14 minutes.",
            
            "parts": [
                # Part 1: Introduction and Interview (4-5 minutes)
                {
                    "part_number": 1,
                    "title": "Introduction and Interview",
                    "time": "4-5 minutes",
                    "description": "The examiner will ask general questions about yourself and familiar topics.",
                    "questions": [
                        {"id": "S1Q1", "question": "Do you work or are you a student?", "follow_ups": ["What do you do?", "Do you enjoy it?"]},
                        {"id": "S1Q2", "question": "Let's talk about your hometown. Where is it located?", "follow_ups": ["What do you like about living there?", "Has it changed much in recent years?"]},
                        {"id": "S1Q3", "question": "Do you like cooking?", "follow_ups": ["What kind of food do you usually cook?", "Who taught you to cook?"]},
                        {"id": "S1Q4", "question": "How do you usually travel to work or school?", "follow_ups": ["How long does your journey take?", "Would you like to change the way you travel?"]}
                    ]
                },
                
                # Part 2: Long Turn (3-4 minutes)
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "prep_time": 60,
                    "speak_time": 120,
                    "description": "You will be given a task card. You have one minute to prepare and then should speak for 1-2 minutes.",
                    "cue_card": {
                        "topic": "Describe a time when you helped someone",
                        "bullet_points": [
                            "Who you helped",
                            "How you helped them",
                            "Why they needed help",
                            "And explain how you felt about helping them"
                        ]
                    },
                    "follow_up": [
                        "Do you think people help each other more or less than in the past?",
                        "Is it important to help strangers?"
                    ]
                },
                
                # Part 3: Discussion (4-5 minutes)
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "time": "4-5 minutes",
                    "description": "The examiner will ask further questions connected to the topic in Part 2.",
                    "questions": [
                        {"id": "S3Q1", "question": "Why do some people prefer to give help rather than receive it?"},
                        {"id": "S3Q2", "question": "In what ways can communities help people in need?"},
                        {"id": "S3Q3", "question": "Do you think governments should be responsible for helping those in difficulty?"},
                        {"id": "S3Q4", "question": "How might attitudes to helping others differ between generations?"}
                    ]
                }
            ]
        }
    },
    
    "band_mapping": {
        "listening": "standard_ielts",
        "reading": "general_training_ielts",
        "writing": "ielts_writing_general",
        "speaking": "standard_ielts"
    },
    
    "audio_requirements": {
        "listening": {
            "total_audio_files": 4,
            "format": "mp3",
            "bitrate": "128kbps",
            "parts": [
                {"part": 1, "duration_estimate": "5-6 minutes"},
                {"part": 2, "duration_estimate": "5-6 minutes"},
                {"part": 3, "duration_estimate": "6-7 minutes"},
                {"part": 4, "duration_estimate": "6-7 minutes"}
            ]
        },
        "speaking": {
            "total_audio_files": 9,
            "format": "mp3",
            "includes": ["questions", "instructions"]
        }
    }
}


def get_general_set_a():
    return GENERAL_SET_A
