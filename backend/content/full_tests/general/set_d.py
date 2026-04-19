"""
IELTS-Style General Training Full Test - Set D
===============================================
100% ORIGINAL CONTENT

FOCUS AREAS:
- Reading: Multiple document matching, Table completion, Yes/No/Not Given
- Listening: Table completion, Selection questions, Matching
- Writing Task 1: Formal letter (complaint)
- Writing Task 2: Advantages-Disadvantages essay
"""

GENERAL_SET_D = {
    "test_id": "general_set_d_01",
    "test_type": "general",
    "title": "IELTS-Style General Training Full Test - Set D",
    "description": "Complete IELTS General Training examination with focus on Table and Selection question types.",
    "estimated_time": "2 hours 45 minutes",
    "difficulty_profile": "IELTS-calibrated",
    "version": "1.0",
    "question_type_focus": ["table_completion", "selection", "matching", "multiple_documents"],
    
    "sections": {
        # ============ LISTENING SECTION ============
        "listening": {
            "total_questions": 40,
            "total_time": 2400,
            "instructions": "You will hear four recordings. Answer the questions as you listen. You will hear each recording ONCE only.",
            
            "parts": [
                # PART 1: Table Completion (Q1-10)
                {
                    "part_number": 1,
                    "title": "Gym Membership Enquiry",
                    "context": "A customer enquiring about gym membership options",
                    "speakers": ["Staff", "Customer"],
                    "question_types": ["table_completion"],
                    
                    "visual": {
                        "type": "table",
                        "title": "Membership Options",
                        "headers": ["Membership Type", "Monthly Cost", "Joining Fee", "Includes"],
                        "rows": [
                            ["Basic", "£Q1______", "£Q2______", "Gym equipment only"],
                            ["Standard", "£Q3______", "£50", "Gym + Q4______"],
                            ["Premium", "£Q5______", "None", "All facilities + Q6______"]
                        ]
                    },
                    
                    "audio_script": """
Staff: Good afternoon, FitLife Gym. How can I help?
Customer: Hi, I'd like some information about membership options.
Staff: Of course. We have three membership tiers. Let me explain each one.
Customer: Great, I'm ready to take notes.
Staff: Our Basic membership is twenty-five pounds monthly with a forty pound joining fee. This gives you access to all gym equipment - weights, cardio machines, and so on.
Customer: What about classes?
Staff: Classes aren't included in Basic. For that, you'd need our Standard membership at forty-five pounds monthly. The joining fee is fifty pounds. Standard includes gym access plus all group fitness classes - yoga, spinning, aerobics.
Customer: And your top tier?
Staff: Premium is seventy-five pounds monthly but there's no joining fee at all. You get everything - gym, classes, plus personal training sessions. You receive two PT sessions per month included in that price.
Customer: Are there any discounts available?
Staff: Yes, if you pay annually upfront, you get two months free on any tier. We also offer a student discount of fifteen percent, but you'll need a valid student ID.
Customer: What are your opening hours?
Staff: We're open six AM to ten PM on weekdays. Weekends we open at eight and close at eight. The pool - which is included in Standard and Premium - has slightly shorter hours: seven AM to nine PM.
Customer: Do you have parking?
Staff: Yes, free parking for all members. The car park holds about sixty vehicles. It does get busy between five and seven PM though.
Customer: Can I try before I commit?
Staff: Absolutely. We offer a free day pass, or you can buy a week trial for ten pounds. The trial amount is deducted from your joining fee if you sign up within seven days.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "table_completion", "question": "Basic monthly cost: £______", "answer": "25"},
                        {"id": "L1Q2", "type": "table_completion", "question": "Basic joining fee: £______", "answer": "40"},
                        {"id": "L1Q3", "type": "table_completion", "question": "Standard monthly cost: £______", "answer": "45"},
                        {"id": "L1Q4", "type": "table_completion", "question": "Standard includes gym plus: ______", "answer": "classes/group fitness classes"},
                        {"id": "L1Q5", "type": "table_completion", "question": "Premium monthly cost: £______", "answer": "75"},
                        {"id": "L1Q6", "type": "table_completion", "question": "Premium includes facilities plus: personal ______ sessions", "answer": "training/trainer"},
                        {"id": "L1Q7", "type": "form_completion", "question": "PT sessions included monthly: ______", "answer": "2/two"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Student discount: ______%", "answer": "15/fifteen"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Weekend opening time: ______ AM", "answer": "8/eight"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Week trial cost: £______", "answer": "10/ten"}
                    ]
                },
                
                # PART 2: Selection + Note Completion (Q11-20)
                {
                    "part_number": 2,
                    "title": "Local Council Waste Services",
                    "context": "Information about council waste collection and recycling",
                    "speakers": ["Council Officer"],
                    "question_types": ["selection", "note_completion"],
                    
                    "audio_script": """
Welcome to Riverside Council's waste services information line. This message contains important updates about collection schedules and recycling guidelines.

General household waste is collected every two weeks on Wednesdays. Please ensure your grey bin is out by seven AM on collection day. Missed collections can be reported online and will be picked up within three working days.

Recycling collections occur weekly, alternating between blue bins for paper and card, and green bins for plastics, glass, and cans. Blue bins are collected on the first and third Wednesday of each month. Green bins on the second and fourth Wednesday.

Large item collection is available for furniture and appliances. You can book up to three items per collection at no charge. Additional items are five pounds each. The current waiting time for large item pickup is approximately two weeks.

Garden waste collection requires a separate subscription at sixty pounds annually. Collections run from March to November, fortnightly on Thursdays. Subscribers receive a brown bin on registration.

Food waste can now be placed in your general waste bin - we've introduced treatment facilities that handle this safely. However, we encourage home composting where possible. Free compost bins are available from the council depot.

The household waste recycling centre on Industrial Road is open Tuesday to Sunday, nine AM to five PM. Note that vehicles over two metres in height require a permit, available free from our website. The centre accepts items not suitable for kerbside collection including batteries, paint, and small electrical items.

From next month, we're introducing a new mobile recycling point at the community centre car park every Saturday morning from eight until noon. This is ideal for residents who cannot easily transport items to the main centre.

For any queries, press one to speak to an advisor or visit our website at riverside.gov.uk/waste.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "note_completion", "question": "General waste collection day: ______", "answer": "Wednesday/Wednesdays"},
                        {"id": "L2Q12", "type": "note_completion", "question": "Bins must be out by: ______ AM", "answer": "7/seven"},
                        {"id": "L2Q13", "type": "selection", "question": "Which TWO items go in the green bin?", "options": ["A) Paper", "B) Card", "C) Plastics", "D) Glass", "E) Food waste"], "answer": "C, D", "num_answers": 2},
                        {"id": "L2Q14", "type": "note_completion", "question": "Free large items per collection: ______", "answer": "3/three"},
                        {"id": "L2Q15", "type": "note_completion", "question": "Extra large items cost: £______ each", "answer": "5/five"},
                        {"id": "L2Q16", "type": "note_completion", "question": "Garden waste annual subscription: £______", "answer": "60/sixty"},
                        {"id": "L2Q17", "type": "note_completion", "question": "Garden waste collection day: ______", "answer": "Thursday/Thursdays"},
                        {"id": "L2Q18", "type": "selection", "question": "Which THREE items are accepted at the recycling centre but NOT kerbside?", "options": ["A) Batteries", "B) Paper", "C) Paint", "D) Glass", "E) Electrical items"], "answer": "A, C, E", "num_answers": 3},
                        {"id": "L2Q19", "type": "note_completion", "question": "Recycling centre closed day: ______", "answer": "Monday/Mondays"},
                        {"id": "L2Q20", "type": "note_completion", "question": "Mobile recycling point day: ______", "answer": "Saturday/Saturdays"}
                    ]
                },
                
                # PART 3: Matching + Form Completion (Q21-30)
                {
                    "part_number": 3,
                    "title": "Book Club Discussion",
                    "context": "Members discussing upcoming book selections",
                    "speakers": ["Anna", "Ben", "Claire"],
                    "question_types": ["matching", "form_completion"],
                    
                    "audio_script": """
Anna: Thanks for coming everyone. We need to decide on our reading list for the next three months. Each of us suggested two books, so let's discuss.
Ben: Should we go through them one by one?
Anna: Good idea. My first suggestion is "The Silent Patient" - it's a psychological thriller. Really gripping, keeps you guessing until the end.
Claire: I've heard good things about that. Who's it by?
Anna: Alex Michaelides. My second choice is completely different - "Sapiens" by Yuval Noah Harari. It's non-fiction about human history.
Ben: I actually own Sapiens but haven't read it yet. My suggestions are both fiction. First is "Normal People" by Sally Rooney - it's about relationships and coming of age in Ireland.
Claire: I loved the TV adaptation of that.
Ben: Me too! My other pick is "The Midnight Library" by Matt Haig. It's about a woman who gets to try different versions of her life. Quite philosophical but very readable.
Anna: That sounds interesting. Claire, what about your choices?
Claire: Well, I went for diversity. "Educated" by Tara Westover - it's a memoir about growing up in a survivalist family and eventually going to Cambridge. Truly remarkable story.
Anna: I've seen that on bestseller lists for ages.
Claire: It deserves to be there. My other choice is "Project Hail Mary" by Andy Weir - he wrote "The Martian." It's science fiction but really accessible even if you're not into sci-fi usually.
Ben: So we have six books for three months. Should we vote?
Anna: Let's rate them. Everyone mark their top three and we'll go with the highest scores.
Claire: Works for me. When do we meet next?
Anna: How about the fifteenth? That gives us three weeks with whatever we choose first.
Ben: Perfect. I'll send a poll to confirm everyone's votes by email tonight.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "matching", "question": "Who suggested 'The Silent Patient'?", "answer": "Anna"},
                        {"id": "L3Q22", "type": "matching", "question": "Who suggested 'Normal People'?", "answer": "Ben"},
                        {"id": "L3Q23", "type": "matching", "question": "Who suggested 'Educated'?", "answer": "Claire"},
                        {"id": "L3Q24", "type": "matching", "question": "Who suggested 'Project Hail Mary'?", "answer": "Claire"},
                        {"id": "L3Q25", "type": "form_completion", "question": "'Sapiens' author: Yuval Noah ______", "answer": "Harari"},
                        {"id": "L3Q26", "type": "form_completion", "question": "'The Midnight Library' author: Matt ______", "answer": "Haig"},
                        {"id": "L3Q27", "type": "form_completion", "question": "'Project Hail Mary' author: Andy ______", "answer": "Weir"},
                        {"id": "L3Q28", "type": "form_completion", "question": "Total books suggested: ______", "answer": "6/six"},
                        {"id": "L3Q29", "type": "form_completion", "question": "Months to cover: ______", "answer": "3/three"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Next meeting date: the ______", "answer": "15th/fifteenth"}
                    ]
                },
                
                # PART 4: Note Completion (Q31-40)
                {
                    "part_number": 4,
                    "title": "The History of Chocolate",
                    "context": "A talk about the origins and development of chocolate",
                    "speakers": ["Speaker"],
                    "question_types": ["note_completion", "form_completion"],
                    
                    "audio_script": """
Good evening. Tonight I'll be taking you through the fascinating history of chocolate, from ancient Mesoamerica to the global industry we know today.

Chocolate's story begins around 1900 BCE with the Olmec civilisation in present-day Mexico. The Olmecs were likely the first to cultivate cacao trees and process the beans. However, it was the Maya who developed chocolate into a sophisticated beverage, often mixing it with chilli peppers and corn.

The Aztecs elevated cacao to sacred status. Emperor Montezuma reportedly consumed fifty cups of chocolate daily from a golden goblet. Cacao beans served as currency - a turkey could be purchased for one hundred beans. The Aztec word "xocolatl" - meaning bitter water - gave us the word chocolate.

Europeans first encountered chocolate through Spanish conquistadors in the early sixteenth century. Hernán Cortés brought cacao beans to Spain in 1528. Initially, chocolate remained a Spanish secret for nearly a century. When it did spread to other European courts, sugar was added to combat the natural bitterness - a revolutionary change from the original preparation.

The industrial revolution transformed chocolate from a luxury beverage to a mass-market product. In 1828, Dutch chemist Coenraad van Houten invented the cocoa press, which separated cocoa butter from cocoa powder. This made chocolate cheaper and easier to produce. In 1847, Joseph Fry created the first modern chocolate bar by combining cocoa powder, sugar, and cocoa butter into a mouldable paste.

Swiss innovations further refined the product. Daniel Peter added condensed milk in 1875 to create milk chocolate. Rodolphe Lindt's conching machine, developed in 1879, produced smoother, more luxurious texture through extended mixing and heating.

Today, global chocolate consumption exceeds seven million tonnes annually. The industry is valued at approximately one hundred and thirty billion dollars. West Africa produces about seventy percent of the world's cacao, with Côte d'Ivoire and Ghana being the largest producers.

However, the industry faces significant challenges. Climate change threatens cacao-growing regions. Labour practices on some plantations have drawn criticism. Sustainable and fair-trade certifications now influence consumer choices, pushing the industry toward more ethical practices.

Thank you. I'll take questions now.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "note_completion", "question": "First cacao cultivators: ______ civilisation", "answer": "Olmec"},
                        {"id": "L4Q32", "type": "note_completion", "question": "Chocolate origin date: around ______ BCE", "answer": "1900"},
                        {"id": "L4Q33", "type": "note_completion", "question": "Maya mixed chocolate with chilli and ______", "answer": "corn"},
                        {"id": "L4Q34", "type": "note_completion", "question": "Montezuma's daily chocolate consumption: ______ cups", "answer": "50/fifty"},
                        {"id": "L4Q35", "type": "note_completion", "question": "Cost of a turkey in cacao beans: ______", "answer": "100/one hundred"},
                        {"id": "L4Q36", "type": "note_completion", "question": "Cortés brought cacao to Spain in: ______", "answer": "1528"},
                        {"id": "L4Q37", "type": "note_completion", "question": "Van Houten's invention: cocoa ______", "answer": "press"},
                        {"id": "L4Q38", "type": "note_completion", "question": "First chocolate bar creator: Joseph ______", "answer": "Fry"},
                        {"id": "L4Q39", "type": "note_completion", "question": "Annual global consumption: over ______ million tonnes", "answer": "7/seven"},
                        {"id": "L4Q40", "type": "note_completion", "question": "West Africa produces ______% of world's cacao", "answer": "70/seventy"}
                    ]
                }
            ]
        },
        
        # ============ READING SECTION ============
        "reading": {
            "total_questions": 40,
            "total_time": 3600,
            "passages": [
                # Section 1: Multiple Short Texts
                {
                    "passage_number": 1,
                    "title": "Job Advertisements",
                    "text_type": "multiple_advertisements",
                    "text": """A. RETAIL ASSISTANT - Fashion Forward
Part-time, 16-20 hours weekly. £11.50/hour.
Must be available weekends. Retail experience preferred but training provided.
Staff discount: 40% on all purchases.
Apply: jobs@fashionforward.com by 20th March

B. WAREHOUSE OPERATIVE - QuickShip Logistics
Full-time, rotating shifts. £13.25/hour + overtime.
Forklift licence required. Night shift premium 15%.
Benefits: Pension, 28 days holiday.
Call: 0800-555-1234 for application pack

C. RECEPTIONIST - Sunrise Medical Centre
Part-time, Mon/Wed/Fri 8am-1pm. £12.00/hour.
Medical sector experience essential. DBS check required.
Professional manner and excellent communication skills.
Email CV to: admin@sunrisemedical.nhs.uk

D. CHEF - The Golden Oak Pub
Full-time, split shifts. Salary £28,000-32,000 depending on experience.
NVQ Level 3 or equivalent. Own transport needed.
Accommodation available if required.
Contact: manager@goldenoak.co.uk

E. DELIVERY DRIVER - CityPost
Full-time, 7am-3pm. £14.00/hour.
Clean driving licence held for minimum 2 years. Own vehicle not required.
Uniform provided. Fuel allowance included.
Apply online: www.citypost.com/careers

F. TEACHING ASSISTANT - Brookside Primary School
Term-time only, 8:30am-3:30pm. £10.50/hour.
Experience with primary-aged children essential.
Enhanced DBS required. GCSE Maths and English grade C minimum.
Closing date: 15th March""",
                    "questions": [
                        {"id": "R1Q1", "type": "matching", "question": "Which job offers accommodation?", "answer": "D"},
                        {"id": "R1Q2", "type": "matching", "question": "Which job requires a forklift licence?", "answer": "B"},
                        {"id": "R1Q3", "type": "matching", "question": "Which TWO jobs require a DBS check?", "answer": "C, F"},
                        {"id": "R1Q4", "type": "matching", "question": "Which job offers the highest hourly rate?", "answer": "E"},
                        {"id": "R1Q5", "type": "matching", "question": "Which job provides a company vehicle?", "answer": "E"},
                        {"id": "R1Q6", "type": "matching", "question": "Which job offers staff discount?", "answer": "A"},
                        {"id": "R1Q7", "type": "true_false", "question": "The warehouse job includes paid holidays.", "answer": "True"}
                    ]
                },
                
                # Section 2: Workplace Document
                {
                    "passage_number": 2,
                    "title": "Company Travel Policy",
                    "text_type": "policy_document",
                    "text": """GLOBAL TECH SOLUTIONS - BUSINESS TRAVEL POLICY

1. APPROVAL REQUIREMENTS
All business travel must be approved by your line manager at least 5 working days in advance. International travel requires additional approval from department director. Emergency travel may be approved retrospectively but must be justified in writing within 48 hours.

2. BOOKING PROCEDURES
Travel must be booked through our approved provider, TravelCorp. Using alternative providers without prior authorization will result in non-reimbursement of costs. Economy class is standard for flights under 6 hours. Premium economy may be approved for flights over 6 hours; business class requires director-level approval.

3. ACCOMMODATION
Use approved hotel chains where available (Marriott, Hilton, Holiday Inn). Maximum nightly rates: UK £150, Europe £180, North America £200, Other regions £170. Rates include breakfast where available. Exceeding limits requires written justification.

4. DAILY EXPENSES
Meal allowance: £15 breakfast (if not included), £20 lunch, £35 dinner
Incidental expenses: £15 per day (tips, small purchases)
All claims must be submitted within 14 days of travel completion with original receipts.
Alcohol is not reimbursable except when entertaining clients (maximum £30pp with approval).

5. TRANSPORT
Rail travel: Standard class unless journey exceeds 3 hours
Taxis: Permitted when public transport is impractical; require receipts
Private vehicle: 45p per mile for first 100 miles, 25p thereafter
Parking and tolls: Fully reimbursable with receipts

6. TRAVEL INSURANCE
All employees are covered by company travel insurance for business trips. Policy details available on the intranet. Personal travel extensions must be declared and are not covered.

7. HEALTH AND SAFETY
Employees must complete the online travel safety module before their first international trip. Check FCO travel advisories before booking. Vaccinations and visas are arranged and paid for by the company.

8. EXCEPTIONS
Any exceptions to this policy require written approval from HR Director. Consistent policy violations may result in disciplinary action.

Policy effective: January 2024. Review date: January 2025.""",
                    "questions": [
                        {"id": "R2Q8", "type": "form_completion", "question": "Advance notice required for travel approval: ______ working days", "answer": "5/five"},
                        {"id": "R2Q9", "type": "form_completion", "question": "International travel also needs approval from: department ______", "answer": "director"},
                        {"id": "R2Q10", "type": "form_completion", "question": "Maximum European hotel rate: £______", "answer": "180"},
                        {"id": "R2Q11", "type": "form_completion", "question": "Dinner allowance: £______", "answer": "35"},
                        {"id": "R2Q12", "type": "form_completion", "question": "Expense claim deadline: ______ days after travel", "answer": "14"},
                        {"id": "R2Q13", "type": "form_completion", "question": "Mileage rate first 100 miles: ______p", "answer": "45"},
                        {"id": "R2Q14", "type": "true_false_ng", "question": "Business class flights are never permitted.", "answer": "False"},
                        {"id": "R2Q15", "type": "true_false_ng", "question": "Employees can book travel with any provider.", "answer": "False"},
                        {"id": "R2Q16", "type": "true_false_ng", "question": "Lunch costs are reimbursed at £25.", "answer": "False"},
                        {"id": "R2Q17", "type": "true_false_ng", "question": "The company pays for work-related vaccinations.", "answer": "True"},
                        {"id": "R2Q18", "type": "form_completion", "question": "Policy exceptions require approval from: ______ Director", "answer": "HR"},
                        {"id": "R2Q19", "type": "true_false_ng", "question": "Premium economy is available for all international flights.", "answer": "False"},
                        {"id": "R2Q20", "type": "form_completion", "question": "Maximum client entertainment alcohol allowance: £______ per person", "answer": "30"}
                    ]
                },
                
                # Section 3: General Interest Article
                {
                    "passage_number": 3,
                    "title": "The Rise of Remote Working",
                    "text_type": "magazine_article",
                    "text": """When the pandemic forced millions to work from home in 2020, it triggered what many now call the largest workplace experiment in history. Three years on, the effects continue to reshape how and where we work.

Pre-pandemic surveys suggested that only about five percent of workers regularly worked from home. By 2023, this had risen to approximately thirty percent in developed economies. While some companies have pushed for a return to office, others have embraced permanent hybrid or fully remote arrangements.

The benefits are well documented. Workers save commuting time - an average of forty minutes daily in the UK - reducing stress and carbon emissions. Many report improved work-life balance, with greater flexibility to manage personal responsibilities. For employers, remote work can reduce office costs and expand the potential talent pool beyond geographic constraints.

However, challenges have emerged. Junior employees often miss the informal learning that comes from observing colleagues. Building company culture becomes harder without in-person interaction. Some workers report feeling isolated, with blurred boundaries between work and personal time leading to longer hours. A 2022 study found remote workers averaged fifty-three hours weekly compared to forty-five for office-based equivalents.

The technology enabling remote work has evolved rapidly. Video conferencing platforms that struggled with basic functionality in 2020 now offer virtual backgrounds, real-time translation, and collaborative features. Project management tools have become sophisticated, allowing teams to coordinate effectively across time zones.

Interestingly, productivity data has challenged assumptions. Initial concerns that remote workers would be less productive have largely been disproven. Multiple studies show productivity either unchanged or slightly increased for most knowledge workers. However, creative and collaborative tasks may still benefit from in-person interaction.

The geographic implications are significant. Some workers have relocated from expensive cities to more affordable areas, creating new economic challenges for urban centres. Rural areas and smaller towns have seen population influxes. This shift has accelerated investment in rural broadband infrastructure.

Legal and tax frameworks are adapting. Questions about which jurisdiction's labour laws apply, how to handle workplace injuries at home, and tax implications of employees living in different locations are being addressed through new legislation and case law.

Looking ahead, most experts predict a permanently changed landscape. The traditional nine-to-five office model may never fully return. Instead, flexibility will likely become a standard expectation rather than a perk. Companies that refuse to offer remote options may find themselves at a disadvantage in recruiting talent, particularly among younger workers who increasingly prioritise flexibility.""",
                    "questions": [
                        {"id": "R3Q21", "type": "form_completion", "question": "Pre-pandemic regular home working rate: about ______%", "answer": "5/five"},
                        {"id": "R3Q22", "type": "form_completion", "question": "2023 home working rate in developed economies: approximately ______%", "answer": "30/thirty"},
                        {"id": "R3Q23", "type": "form_completion", "question": "Average UK daily commute time saved: ______ minutes", "answer": "40/forty"},
                        {"id": "R3Q24", "type": "form_completion", "question": "Remote workers' average weekly hours (2022 study): ______", "answer": "53/fifty-three"},
                        {"id": "R3Q25", "type": "form_completion", "question": "Office workers' average weekly hours: ______", "answer": "45/forty-five"},
                        {"id": "R3Q26", "type": "yes_no_ng", "question": "Remote workers are generally less productive than office workers.", "answer": "No"},
                        {"id": "R3Q27", "type": "yes_no_ng", "question": "All companies now offer remote working options.", "answer": "Not Given"},
                        {"id": "R3Q28", "type": "yes_no_ng", "question": "Rural broadband investment has increased.", "answer": "Yes"},
                        {"id": "R3Q29", "type": "yes_no_ng", "question": "Creative tasks are always better done remotely.", "answer": "No"},
                        {"id": "R3Q30", "type": "yes_no_ng", "question": "The traditional office model will completely disappear.", "answer": "Not Given"}
                    ]
                },
                
                # Section 4: Information Text
                {
                    "passage_number": 4,
                    "title": "Starting Your Own Business",
                    "text_type": "information_guide",
                    "text": """ENTREPRENEUR'S GUIDE: LAUNCHING A SMALL BUSINESS

THE PLANNING STAGE

Before investing time and money, thorough research is essential. Your business plan should answer key questions: What problem does your product or service solve? Who are your target customers? How will you reach them? What makes you different from competitors?

Market research need not be expensive. Online surveys, social media polls, and informal conversations can provide valuable insights. Industry reports are often available free through public libraries. Study your competitors - their pricing, marketing, and customer reviews reveal much about market expectations.

LEGAL REQUIREMENTS

In the UK, you must register with HMRC if your annual turnover exceeds £1,000. Self-employment registration is straightforward and can be completed online. If establishing a limited company, you'll need to register with Companies House, requiring a minimum of one director and one shareholder (who may be the same person).

Depending on your business type, additional licences may be required. Food businesses need local authority registration. Financial services require FCA authorisation. Trade businesses often need specific certifications. Check requirements early to avoid costly delays.

Insurance is crucial. Public liability insurance protects against customer claims. Professional indemnity covers advice-related businesses. If employing staff, employers' liability insurance is a legal requirement.

FUNDING OPTIONS

Personal savings remain the most common startup funding source. However, alternatives exist for those requiring capital:
- Start Up Loans: Government-backed loans of £500-£25,000 at 6% interest
- Grants: Various schemes exist for specific sectors and demographics
- Crowdfunding: Platforms like Kickstarter or Crowdcube for consumer products
- Angel investors: High-net-worth individuals seeking equity stakes
- Bank loans: Traditional financing, typically requiring business plan and security

PRACTICAL CONSIDERATIONS

Separating business and personal finances simplifies accounting and tax compliance. Open a business bank account - many offer free banking for the first year.

Keep meticulous records from day one. HMRC may request records going back six years. Cloud accounting software like Xero or QuickBooks automates much of this process.

Consider your workspace needs. Working from home is permitted for many businesses but may require planning permission for customer visits. Shared workspaces offer professional meeting rooms without the commitment of traditional office leases.

GETTING HELP

The UK government offers free business support through the Business Support Helpline (0800 998 1098). Local Growth Hubs provide regional assistance. Mentoring programmes connect new entrepreneurs with experienced business owners.

Starting a business carries risk, but proper preparation significantly improves success chances. The most common causes of failure - insufficient cash flow, inadequate market research, and poor financial management - are all preventable with careful planning.""",
                    "questions": [
                        {"id": "R4Q31", "type": "form_completion", "question": "HMRC registration required if turnover exceeds £______", "answer": "1000/1,000"},
                        {"id": "R4Q32", "type": "form_completion", "question": "Minimum limited company directors: ______", "answer": "1/one"},
                        {"id": "R4Q33", "type": "form_completion", "question": "Start Up Loan maximum: £______", "answer": "25000/25,000"},
                        {"id": "R4Q34", "type": "form_completion", "question": "Start Up Loan interest rate: ______%", "answer": "6/six"},
                        {"id": "R4Q35", "type": "form_completion", "question": "HMRC may request records for ______ years", "answer": "6/six"},
                        {"id": "R4Q36", "type": "matching", "question": "Which insurance is legally required when employing staff?", "answer": "employers' liability"},
                        {"id": "R4Q37", "type": "matching", "question": "Which registration body handles limited companies?", "answer": "Companies House"},
                        {"id": "R4Q38", "type": "true_false_ng", "question": "Food businesses need special registration.", "answer": "True"},
                        {"id": "R4Q39", "type": "true_false_ng", "question": "Working from home always requires planning permission.", "answer": "False"},
                        {"id": "R4Q40", "type": "true_false_ng", "question": "Poor financial management is a common cause of business failure.", "answer": "True"}
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
                    "subtype": "complaint",
                    "time_recommended": 20,
                    "word_minimum": 150,
                    "prompt": """You recently stayed at a hotel that you found online. The hotel was not as advertised and you were very disappointed.

Write a letter to the hotel manager. In your letter:
- say when you stayed and what room you booked
- describe the problems you experienced
- state what action you expect the hotel to take""",
                    "tone": "formal"
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "subtype": "advantages_disadvantages",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "Many people now choose to work for themselves rather than for an employer. What are the advantages and disadvantages of being self-employed?",
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
                    "topics": ["Books and reading", "Entertainment preferences", "Leisure time"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you enjoy reading? What kind of books do you like?"},
                        {"id": "S1Q2", "text": "Do you prefer reading physical books or e-books? Why?"},
                        {"id": "S1Q3", "text": "How often do you read for pleasure?"},
                        {"id": "S1Q4", "text": "Did you read more or less when you were younger?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a book you have read recently",
                        "points": [
                            "What the book was called and who wrote it",
                            "What the book was about",
                            "Why you decided to read this book",
                            "And explain whether you would recommend it to others"
                        ]
                    },
                    "follow_up": ["Do you often recommend books to friends?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Reading and Education",
                    "questions": [
                        {"id": "S3Q1", "text": "Why do you think some people don't enjoy reading?"},
                        {"id": "S3Q2", "text": "How important is reading for children's development?"},
                        {"id": "S3Q3", "text": "Do you think the internet has changed people's reading habits?"},
                        {"id": "S3Q4", "text": "Will physical books still exist in the future?"}
                    ]
                }
            ]
        }
    }
}
