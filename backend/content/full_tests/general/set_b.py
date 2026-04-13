"""
IELTS-Style General Training Full Test - Set B
===============================================
100% ORIGINAL CONTENT - NOT COPIED FROM CAMBRIDGE

This test matches IELTS General Training format, timing, and difficulty level.
Different topics and scenarios from Set A for variety.
"""

from typing import Dict, Any

GENERAL_SET_B = {
    "test_id": "general_set_b_01",
    "test_type": "general",
    "title": "IELTS-Style General Training Full Test - Set B",
    "description": "Complete IELTS General Training examination covering all 4 skills: Listening, Reading, Writing, and Speaking.",
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
                    "title": "Car Rental Booking",
                    "context": "A phone conversation between a customer and car rental company",
                    "speakers": ["Agent", "Customer"],
                    "audio_script": """
Agent: Good morning, Speedy Car Rentals. This is Claire speaking. How may I assist you?
Customer: Hi, I'd like to book a car for next weekend please.
Agent: Certainly. Could I have your name?
Customer: Yes, it's Michael Thompson. T-H-O-M-P-S-O-N.
Agent: Thank you, Mr Thompson. And when would you like to pick up the vehicle?
Customer: Saturday morning, around nine o'clock.
Agent: And the return date?
Customer: Monday evening, probably around six.
Agent: So that's three days. What type of vehicle are you looking for?
Customer: Something economical. It's just for a short trip to the coast.
Agent: Our economy class is the Ford Fiesta at thirty-five pounds per day. We also have the mid-range Toyota Corolla at forty-eight pounds.
Customer: The Fiesta sounds fine. What's included?
Agent: Basic insurance and unlimited mileage. Fuel isn't included - you return it with a full tank.
Customer: Are there any additional charges?
Agent: There's a one-time cleaning fee of fifteen pounds, and if you'd like GPS navigation, that's eight pounds per day.
Customer: I'll take the GPS please. My phone's navigation isn't reliable.
Agent: No problem. So your total comes to one hundred and forty-four pounds.
Customer: Can I pay when I collect the car?
Agent: Yes, we accept card payments. We'll need your driving licence and a credit card for the deposit - that's two hundred pounds, refunded on return.
Customer: Perfect. What's the pickup location?
Agent: Our main office is at twenty-seven Station Road, opposite the train station. We open at eight on Saturdays.
                    """,
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Customer's surname spelling: ______", "answer": "Thompson"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Pickup day: ______", "answer": "Saturday"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Pickup time: ______ o'clock", "answer": "9/nine"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Rental duration: ______ days", "answer": "3/three"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Ford Fiesta daily rate: £______", "answer": "35"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Toyota Corolla daily rate: £______", "answer": "48"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Cleaning fee: £______", "answer": "15"},
                        {"id": "L1Q8", "type": "form_completion", "question": "GPS daily cost: £______", "answer": "8"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Refundable deposit: £______", "answer": "200"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Pickup address: ______ Station Road", "answer": "27"}
                    ]
                },
                
                # PART 2: Monologue - Social Context (Q11-20)
                {
                    "part_number": 2,
                    "title": "Recycling Centre Information",
                    "context": "An information announcement about a local council recycling program",
                    "speakers": ["Announcer"],
                    "audio_script": """
Welcome to Greenfield Council's recycling centre. Before you begin sorting your materials, please listen to the following important information.

Our centre accepts a wide range of recyclable materials. The main hall is divided into clearly marked sections. On your left, you'll find containers for paper and cardboard. Please flatten all boxes and remove any plastic tape before depositing them.

Moving clockwise, the next section is for glass. We accept bottles and jars of any colour - clear, green, or brown. However, please note that window glass and mirrors cannot be processed here and should be taken to the household waste section.

The plastics area is perhaps our busiest section. We accept bottles with the numbers one and two printed on the bottom. Plastic bags and film wrapping should go in the separate soft plastics bin at the far end.

Metal recycling is divided into two categories. Aluminium cans go in the silver containers, while steel cans - typically food tins - go in the blue containers. A simple test: if a magnet sticks to it, it's steel.

For electrical items, we have a dedicated e-waste area near the exit. This includes mobile phones, computers, and small appliances. Batteries should be placed in the red collection boxes - never in general waste as they can cause fires.

Regarding garden waste, we offer composting services. Green bins are available for grass cuttings and leaves. Please no plastic bags in these bins. Branches should be cut to maximum lengths of fifty centimetres.

The centre is open Tuesday through Sunday, from eight AM to six PM. We're closed on Mondays for maintenance. During summer months - June through August - we extend our hours to eight PM.

For items we cannot accept, including paint, chemicals, and large furniture, please visit our main depot on Industrial Estate. Appointments can be booked online at www.greenfield.gov.uk/waste.

Staff members in high-visibility jackets are here to help if you're unsure where something belongs. Thank you for recycling responsibly.
                    """,
                    "questions": [
                        {"id": "L2Q11", "type": "form_completion", "question": "Paper preparation: flatten boxes and remove plastic ______", "answer": "tape"},
                        {"id": "L2Q12", "type": "multiple_choice", "question": "Window glass should be taken to:", "options": ["Glass section", "Household waste", "Metal recycling", "E-waste area"], "answer": "Household waste"},
                        {"id": "L2Q13", "type": "form_completion", "question": "Accepted plastic bottle numbers: ______ and 2", "answer": "1/one"},
                        {"id": "L2Q14", "type": "form_completion", "question": "Steel cans go in ______ containers", "answer": "blue"},
                        {"id": "L2Q15", "type": "form_completion", "question": "Batteries go in ______ collection boxes", "answer": "red"},
                        {"id": "L2Q16", "type": "form_completion", "question": "Maximum branch length for garden waste: ______ centimetres", "answer": "50"},
                        {"id": "L2Q17", "type": "form_completion", "question": "Centre closed day: ______", "answer": "Monday/Mondays"},
                        {"id": "L2Q18", "type": "form_completion", "question": "Standard opening hours: 8 AM to ______ PM", "answer": "6"},
                        {"id": "L2Q19", "type": "form_completion", "question": "Summer extended closing time: ______ PM", "answer": "8"},
                        {"id": "L2Q20", "type": "form_completion", "question": "Location of main depot: ______ Estate", "answer": "Industrial"}
                    ]
                },
                
                # PART 3: Discussion - Social Context (Q21-30)
                {
                    "part_number": 3,
                    "title": "Office Renovation Discussion",
                    "context": "Two colleagues discussing plans for office renovation",
                    "speakers": ["Karen", "Tom"],
                    "audio_script": """
Karen: Tom, have you seen the renovation plans for our floor? They sent the email this morning.
Tom: Just briefly. It looks like quite a significant change from our current layout.
Karen: Definitely. The biggest change is moving to open plan. They're removing most of the partition walls.
Tom: I have mixed feelings about that. I appreciate being able to concentrate in my own space.
Karen: Me too, but apparently research shows open plans improve collaboration. They're creating quiet zones in the corners for focused work.
Tom: That's something at least. What about the meeting rooms?
Karen: We're losing two of the four, but the remaining two are being upgraded. Both will have video conferencing equipment and larger screens.
Tom: With so many teams working remotely now, that makes sense. When does construction start?
Karen: March fifteenth, according to the timeline. Phase one covers the east side of the building.
Tom: That's our area. How long will it take?
Karen: About six weeks. We'll need to relocate to the third floor temporarily.
Tom: I saw something about new furniture too?
Karen: Yes, they're replacing all the desks with adjustable standing desks. Supposed to be better for health.
Tom: Nice! And the kitchen area?
Karen: Completely redesigned. They're adding a proper coffee machine - finally! - and a larger fridge. The microwave count is increasing from two to four.
Tom: The lunch queue should be shorter then. What's the total budget for all this?
Karen: Two hundred and fifty thousand pounds for our floor alone. Company-wide it's nearly a million.
Tom: Quite an investment. Well, I suppose change can be good.
Karen: The facilities team is holding an information session on Thursday at two. You should come.
                    """,
                    "questions": [
                        {"id": "L3Q21", "type": "form_completion", "question": "Main change: moving to ______ plan layout", "answer": "open"},
                        {"id": "L3Q22", "type": "form_completion", "question": "Quiet zones will be located in the ______", "answer": "corners"},
                        {"id": "L3Q23", "type": "form_completion", "question": "Number of meeting rooms after renovation: ______", "answer": "2/two"},
                        {"id": "L3Q24", "type": "form_completion", "question": "Construction start date: March ______", "answer": "15/15th/fifteenth"},
                        {"id": "L3Q25", "type": "form_completion", "question": "Phase one duration: about ______ weeks", "answer": "6/six"},
                        {"id": "L3Q26", "type": "form_completion", "question": "Temporary relocation floor: ______ floor", "answer": "third/3rd/3"},
                        {"id": "L3Q27", "type": "form_completion", "question": "New desk type: adjustable ______ desks", "answer": "standing"},
                        {"id": "L3Q28", "type": "form_completion", "question": "New number of microwaves: ______", "answer": "4/four"},
                        {"id": "L3Q29", "type": "form_completion", "question": "Budget for this floor: £______ thousand", "answer": "250"},
                        {"id": "L3Q30", "type": "form_completion", "question": "Information session day: ______", "answer": "Thursday"}
                    ]
                },
                
                # PART 4: Monologue - Academic (Q31-40)
                {
                    "part_number": 4,
                    "title": "The History of Coffee",
                    "context": "A talk about the origins and spread of coffee",
                    "speakers": ["Speaker"],
                    "audio_script": """
Good evening, and welcome to our food history series. Tonight, I'll be exploring the fascinating journey of coffee, from ancient Ethiopian highlands to your morning cup.

The story of coffee begins in the ninth century in Ethiopia, where legend tells of a goat herder named Kaldi. He noticed his goats became unusually energetic after eating berries from a certain tree. Curious, he tried them himself and experienced the stimulating effect we now associate with caffeine.

The cultivation of coffee as a crop began in Yemen around the fifteenth century. Sufi monks were among the first systematic coffee consumers, using it to stay alert during long nights of prayer. From Yemen, coffee spread throughout the Arabian Peninsula, and the world's first coffee houses appeared in Mecca in the early fifteen hundreds.

Europeans discovered coffee through trade with the Ottoman Empire. Venice was one of the first European cities to import coffee, around sixteen fifteen. Initially met with suspicion - some called it "the bitter invention of Satan" - Pope Clement the Eighth supposedly blessed coffee after tasting it, clearing the way for its acceptance.

The first European coffee house opened in Oxford, England, in sixteen fifty. These establishments quickly became centers of intellectual and commercial activity. Lloyd's of London, the famous insurance market, actually started as a coffee house where merchants gathered to do business.

The colonial era transformed coffee into a global commodity. The Dutch established plantations in Java - hence our use of "java" as slang for coffee. The French introduced coffee to the Caribbean, while Portuguese cultivation in Brazil eventually made it the world's largest producer, a position it maintains today, producing about forty percent of global supply.

The instant coffee revolution came in nineteen three, when Japanese-American chemist Sato Kato invented a process for creating soluble coffee. However, it was Nestle's development of freeze-dried instant coffee in nineteen thirty-eight that truly popularized this convenient form.

Today, coffee is the world's second most traded commodity after oil. Approximately two billion cups are consumed daily worldwide. The specialty coffee movement, beginning in the nineteen sixties and accelerating in the nineteen eighties, has elevated coffee from a simple stimulant to a subject of serious appreciation, much like wine.

Climate change poses significant challenges to coffee production. Both major commercial varieties - Arabica and Robusta - are sensitive to temperature changes. Studies suggest that by twenty-fifty, suitable growing areas may decrease by fifty percent, threatening both the industry and the livelihoods of an estimated one hundred and twenty million people who depend on coffee farming.
                    """,
                    "questions": [
                        {"id": "L4Q31", "type": "form_completion", "question": "Coffee legend century: ______ century", "answer": "9th/ninth"},
                        {"id": "L4Q32", "type": "form_completion", "question": "Country where coffee cultivation began: ______", "answer": "Yemen"},
                        {"id": "L4Q33", "type": "form_completion", "question": "First coffee houses appeared in ______ in the early 1500s", "answer": "Mecca"},
                        {"id": "L4Q34", "type": "form_completion", "question": "Venice imported coffee around ______", "answer": "1615"},
                        {"id": "L4Q35", "type": "form_completion", "question": "Pope who blessed coffee: Clement the ______", "answer": "Eighth/8th"},
                        {"id": "L4Q36", "type": "form_completion", "question": "First European coffee house opened in: ______", "answer": "Oxford"},
                        {"id": "L4Q37", "type": "form_completion", "question": "Brazil produces about ______ percent of global coffee", "answer": "40"},
                        {"id": "L4Q38", "type": "form_completion", "question": "Instant coffee invented by Sato Kato in: ______", "answer": "1903"},
                        {"id": "L4Q39", "type": "form_completion", "question": "Daily global coffee consumption: ______ billion cups", "answer": "2/two"},
                        {"id": "L4Q40", "type": "form_completion", "question": "People dependent on coffee farming: ______ million", "answer": "120"}
                    ]
                }
            ]
        },
        
        # ============ READING SECTION ============
        "reading": {
            "total_questions": 40,
            "total_time": 3600,
            "passages": [
                # Section 1: Short texts (advertisements, notices)
                {
                    "passage_number": 1,
                    "title": "Apartment Rental Advertisements",
                    "text_type": "advertisements",
                    "text": """A. SUNNY STUDIO - Central Location
Bright studio apartment, 5-minute walk from metro. Recently renovated with new kitchen appliances. Rent: £850/month including water. Electricity separate. Available immediately. Minimum 6-month lease. No pets. Contact: 020-7123-4567

B. SPACIOUS 2-BED - Family Area
Large 2-bedroom apartment in quiet residential street. Garden access. Parking included. Near excellent schools. Rent: £1,400/month excluding bills. 12-month contract required. Small pets considered. Available March 1st. Email: greenview@rentals.co.uk

C. SHARED HOUSE - Professional Only
Room available in shared 3-bedroom house. Common areas include modern kitchen and living room. All bills included in £650/month rent. Must be working professional. Current tenants are 28 and 31. Available now. Call Sarah: 07700-900123

D. LUXURY PENTHOUSE - River Views
Stunning 3-bedroom penthouse overlooking Thames. Private balcony, concierge service, gym access. Furnished or unfurnished options. Rent: £3,200/month. Bills extra. Minimum 24-month lease. References required. Contact: premium@londonliving.com

E. COZY FLAT - Student Friendly
Perfect for students! One-bedroom flat near university campus. Basic furnishings included. Wi-Fi ready. Rent: £720/month, bills not included. Flexible lease terms from 3 months. No smoking. Photos at: www.studentpads.com/flat42

F. CONVERTED WAREHOUSE - Creative Space
Unique loft-style apartment in former industrial building. Open plan living, exposed brick, high ceilings. 1 bedroom plus study area. Rent: £1,150/month excluding utilities. 6-month minimum. Pets welcome. View by appointment: loftlife@email.com""",
                    "questions": [
                        {"id": "R1Q1", "type": "matching", "question": "Which apartment would suit someone with a cat?", "answer": "B or F"},
                        {"id": "R1Q2", "type": "matching", "question": "Which apartment includes all utility costs?", "answer": "C"},
                        {"id": "R1Q3", "type": "matching", "question": "Which apartment requires the longest minimum lease?", "answer": "D"},
                        {"id": "R1Q4", "type": "matching", "question": "Which apartment is nearest to public transport?", "answer": "A"},
                        {"id": "R1Q5", "type": "matching", "question": "Which apartment offers outdoor space?", "answer": "B"},
                        {"id": "R1Q6", "type": "matching", "question": "Which apartment would suit a short-term stay?", "answer": "E"},
                        {"id": "R1Q7", "type": "true_false_ng", "question": "Apartment A allows tenants to keep pets.", "answer": "False"}
                    ]
                },
                
                # Section 2: Workplace document
                {
                    "passage_number": 2,
                    "title": "Employee Handbook Extract: Leave Policies",
                    "text_type": "policy_document",
                    "text": """SECTION 4: LEAVE ENTITLEMENTS

4.1 Annual Leave
All permanent employees are entitled to 25 days of paid annual leave per year, in addition to public holidays. Part-time staff receive leave pro-rata based on their contracted hours. Leave must be requested through the HR portal at least two weeks in advance for periods exceeding three consecutive days.

4.2 Leave Carry-Over
Up to 5 days of unused annual leave may be carried over to the following year. Carried-over leave must be used by March 31st. Any leave not taken by this date will be forfeited unless exceptional circumstances apply, as approved by HR.

4.3 Sick Leave
Employees are entitled to full pay for the first 10 days of sick leave per year. For absences exceeding 3 consecutive days, a medical certificate is required. Long-term illness (over 4 weeks) will be managed under our Long-Term Absence Policy.

4.4 Parental Leave
New parents are entitled to:
- Maternity leave: 52 weeks, with the first 26 weeks at full pay
- Paternity leave: 4 weeks at full pay
- Adoption leave: Same entitlements as maternity leave
- Shared parental leave: Parents may share up to 50 weeks of leave

4.5 Compassionate Leave
Up to 5 days of paid leave may be granted following the death of an immediate family member (spouse, parent, child, sibling). Additional unpaid leave may be approved at management discretion.

4.6 Study Leave
Employees pursuing approved qualifications may request up to 5 days of paid study leave per year for examinations. Requests must be submitted with supporting documentation from the educational institution.

4.7 Emergency Leave
Reasonable time off will be granted to deal with unexpected emergencies involving dependants. The first day is paid; subsequent days may be unpaid or taken from annual leave.

Contact HR at extension 2200 or hr@company.com for clarification on any leave policies.""",
                    "questions": [
                        {"id": "R2Q8", "type": "form_completion", "question": "Annual leave entitlement for full-time staff: ______ days", "answer": "25"},
                        {"id": "R2Q9", "type": "form_completion", "question": "Advance notice required for leave over 3 days: ______ weeks", "answer": "2/two"},
                        {"id": "R2Q10", "type": "form_completion", "question": "Maximum leave carry-over: ______ days", "answer": "5/five"},
                        {"id": "R2Q11", "type": "form_completion", "question": "Deadline for using carried-over leave: March ______", "answer": "31/31st"},
                        {"id": "R2Q12", "type": "form_completion", "question": "Full pay sick leave entitlement: ______ days per year", "answer": "10"},
                        {"id": "R2Q13", "type": "form_completion", "question": "Medical certificate required for absences over ______ consecutive days", "answer": "3/three"},
                        {"id": "R2Q14", "type": "form_completion", "question": "Maternity leave first period at full pay: ______ weeks", "answer": "26"},
                        {"id": "R2Q15", "type": "form_completion", "question": "Paternity leave duration: ______ weeks", "answer": "4/four"},
                        {"id": "R2Q16", "type": "form_completion", "question": "Compassionate leave for immediate family death: up to ______ days", "answer": "5/five"},
                        {"id": "R2Q17", "type": "form_completion", "question": "Annual paid study leave entitlement: up to ______ days", "answer": "5/five"},
                        {"id": "R2Q18", "type": "true_false_ng", "question": "All emergency leave days are unpaid.", "answer": "False"},
                        {"id": "R2Q19", "type": "true_false_ng", "question": "Adoption leave provides the same benefits as maternity leave.", "answer": "True"},
                        {"id": "R2Q20", "type": "true_false_ng", "question": "Part-time workers receive the same number of leave days as full-time workers.", "answer": "False"}
                    ]
                },
                
                # Section 3: Consumer article
                {
                    "passage_number": 3,
                    "title": "Smartphone Buying Guide",
                    "text_type": "consumer_guide",
                    "text": """Choosing the Right Smartphone: A Comprehensive Guide

With hundreds of smartphone models available, selecting the right device can be overwhelming. This guide will help you understand the key features to consider before making your purchase.

Operating System
The two dominant mobile operating systems are iOS (Apple) and Android (Google). iOS offers a streamlined, consistent experience across all Apple devices but limits customization options. Android provides greater flexibility and is available on phones at various price points, though the experience can vary between manufacturers.

Display
Screen size is measured diagonally in inches. Most modern smartphones range from 6 to 7 inches. Consider how you'll use the phone: larger screens are better for video and gaming but may be difficult to operate one-handed. Resolution matters for image clarity - look for at least 1080p (Full HD) for comfortable viewing.

Camera
Camera quality depends on more than megapixel count. Sensor size, aperture, and software processing all contribute to image quality. If photography is important, look for phones with optical image stabilization, night mode capabilities, and multiple lenses offering different focal lengths.

Battery
Battery capacity is measured in milliamp-hours (mAh). Generally, 4000mAh or above will provide all-day battery life, though actual performance depends on usage patterns and screen brightness. Fast charging capabilities can restore significant battery life in short charging sessions - some phones can reach 50% in just 15 minutes.

Storage
Internal storage determines how much content you can keep on your device. Budget phones typically offer 64GB, mid-range devices 128GB, and flagship models 256GB or more. Some Android phones allow expansion via microSD cards - a useful feature if you take many photos or download music and videos.

Processor
The processor (chip) affects how smoothly apps run and how quickly tasks complete. Current flagship processors include Apple's A-series chips and Qualcomm's Snapdragon 8 series. Most users won't notice performance differences between recent flagship processors, but budget chips may struggle with demanding games or multitasking.

5G Connectivity
5G networks are expanding rapidly, offering faster data speeds and lower latency than 4G. However, 5G phones typically cost more and consume more battery. Consider whether 5G coverage is available in your area and whether you need the additional speed.

Water Resistance
Many modern phones offer water resistance, rated using the IP (Ingress Protection) system. IP68 is the current gold standard, indicating the device can withstand submersion in 1.5 meters of water for 30 minutes. Note that water damage is typically not covered by manufacturer warranties despite these ratings.

Price Considerations
Flagship phones from major manufacturers typically cost £800-1,200. Mid-range options (£300-500) offer excellent value, with features that satisfy most users. Budget phones (under £200) have improved significantly but may compromise on camera quality, processing power, or build materials.""",
                    "questions": [
                        {"id": "R3Q21", "type": "true_false_ng", "question": "iOS allows more customization than Android.", "answer": "False"},
                        {"id": "R3Q22", "type": "true_false_ng", "question": "Larger screens are always better for smartphone users.", "answer": "Not Given"},
                        {"id": "R3Q23", "type": "true_false_ng", "question": "Megapixel count is the only factor determining camera quality.", "answer": "False"},
                        {"id": "R3Q24", "type": "true_false_ng", "question": "Some phones can charge to 50% in 15 minutes.", "answer": "True"},
                        {"id": "R3Q25", "type": "true_false_ng", "question": "All Android phones support microSD expansion.", "answer": "False"},
                        {"id": "R3Q26", "type": "form_completion", "question": "Minimum resolution recommended for comfortable viewing: ______ HD", "answer": "Full"},
                        {"id": "R3Q27", "type": "form_completion", "question": "Battery capacity for all-day use: ______ mAh or above", "answer": "4000"},
                        {"id": "R3Q28", "type": "form_completion", "question": "IP68 water resistance depth: ______ meters", "answer": "1.5"},
                        {"id": "R3Q29", "type": "form_completion", "question": "IP68 water submersion time: ______ minutes", "answer": "30"},
                        {"id": "R3Q30", "type": "form_completion", "question": "Flagship phone typical price range: £800 to £______", "answer": "1200"}
                    ]
                },
                
                # Section 4: General interest article
                {
                    "passage_number": 4,
                    "title": "The Rise of Electric Vehicles",
                    "text_type": "article",
                    "text": """The automotive industry is undergoing its most significant transformation since the invention of the internal combustion engine. Electric vehicles (EVs), once considered impractical curiosities, are rapidly becoming mainstream choices for consumers worldwide.

The environmental argument for EVs is compelling. While manufacturing an EV produces more emissions than a conventional car due to battery production, this "carbon debt" is typically repaid within two years of driving in most regions. Over their lifetime, EVs produce significantly fewer emissions, particularly in countries with clean electricity grids.

Range anxiety - the fear of running out of charge - has been a major barrier to EV adoption. However, modern EVs have largely addressed this concern. Many current models offer ranges exceeding 300 miles on a single charge, with some premium vehicles capable of over 400 miles. The average daily commute in most developed countries is under 40 miles, well within any EV's capabilities.

Charging infrastructure continues to expand rapidly. Public charging stations have increased by approximately 40% annually over the past five years. Fast chargers can now add 200 miles of range in just 20 minutes. Home charging remains the most convenient option for most owners - simply plug in overnight using a standard outlet or dedicated home charger.

The economics of EV ownership are increasingly attractive. While purchase prices remain higher than equivalent petrol or diesel vehicles, the gap is narrowing. More significantly, running costs are substantially lower. Electricity is cheaper than fuel, and EVs have fewer moving parts requiring maintenance - no oil changes, no exhaust system repairs, no clutch replacements.

Governments worldwide are accelerating the transition through policy measures. The UK has announced a ban on new petrol and diesel car sales from 2030. Norway, the global leader in EV adoption, will end such sales in 2025. Many countries offer purchase incentives, reduced registration fees, and access to bus lanes or congestion charge exemptions for EV owners.

Battery technology continues to advance. Current lithium-ion batteries are roughly three times cheaper per kilowatt-hour than a decade ago, while energy density has improved substantially. Solid-state batteries, expected to reach commercial production in the coming years, promise even better performance - faster charging, longer range, and improved safety.

The used EV market is also maturing. Concerns about battery degradation have proven largely unfounded, with most EV batteries retaining over 80% of their capacity after 8 years and 100,000 miles. This is prompting more buyers to consider second-hand electric vehicles.

Infrastructure challenges remain in some areas. Apartment dwellers without dedicated parking face difficulties accessing home charging. Rural areas often have limited public charging networks. However, these gaps are gradually closing as investment continues to flow into the sector.

The automotive industry's commitment to electrification is now irreversible. Every major manufacturer has announced plans to electrify their lineups, with many pledging to sell only EVs by certain target dates. The question is no longer whether EVs will dominate the market, but how quickly the transition will occur.""",
                    "questions": [
                        {"id": "R4Q31", "type": "true_false_ng", "question": "Manufacturing an EV produces fewer emissions than making a conventional car.", "answer": "False"},
                        {"id": "R4Q32", "type": "true_false_ng", "question": "The EV carbon debt is typically recovered within two years.", "answer": "True"},
                        {"id": "R4Q33", "type": "true_false_ng", "question": "The average daily commute in developed countries exceeds most EV ranges.", "answer": "False"},
                        {"id": "R4Q34", "type": "true_false_ng", "question": "Fast chargers can add 200 miles of range in 20 minutes.", "answer": "True"},
                        {"id": "R4Q35", "type": "form_completion", "question": "Some premium EVs can travel over ______ miles on one charge.", "answer": "400"},
                        {"id": "R4Q36", "type": "form_completion", "question": "Public charging stations annual growth rate: approximately ______%", "answer": "40"},
                        {"id": "R4Q37", "type": "form_completion", "question": "UK ban on new petrol/diesel car sales from: ______", "answer": "2030"},
                        {"id": "R4Q38", "type": "form_completion", "question": "Norway will end petrol/diesel car sales in: ______", "answer": "2025"},
                        {"id": "R4Q39", "type": "form_completion", "question": "Most EV batteries retain over ______% capacity after 8 years", "answer": "80"},
                        {"id": "R4Q40", "type": "form_completion", "question": "Average daily commute in developed countries: under ______ miles", "answer": "40"}
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
                    "prompt": """You recently bought a new laptop from an electronics store. When you got home, you discovered that some features were not working properly.

Write a letter to the store manager. In your letter:
- describe what you bought and when
- explain what problems you found
- say what you would like the store to do""",
                    "tone": "formal"
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "time_recommended": 40,
                    "word_minimum": 250,
                    "prompt": "Many employers now expect their employees to be available to answer phone calls and emails outside of normal working hours. Do you think the advantages of this outweigh the disadvantages?",
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
                    "topics": ["Shopping", "Leisure activities", "Local area"],
                    "questions": [
                        {"id": "S1Q1", "text": "Do you enjoy shopping? Why or why not?"},
                        {"id": "S1Q2", "text": "What kind of shops are there near where you live?"},
                        {"id": "S1Q3", "text": "How do you usually spend your weekends?"},
                        {"id": "S1Q4", "text": "Is there anything you would like to change about your local area?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": 60,
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "Describe a shop near your home that you sometimes use",
                        "points": [
                            "What the shop sells",
                            "Where it is located",
                            "How often you go there",
                            "And explain what you like or dislike about this shop"
                        ]
                    },
                    "follow_up": ["Do many people use this shop?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "theme": "Shopping and Consumer Culture",
                    "questions": [
                        {"id": "S3Q1", "text": "How has online shopping changed the way people buy things?"},
                        {"id": "S3Q2", "text": "Why do you think some people prefer shopping in physical stores?"},
                        {"id": "S3Q3", "text": "Do you think people buy too many things they don't need?"},
                        {"id": "S3Q4", "text": "How might shopping habits change in the future?"}
                    ]
                }
            ]
        }
    }
}
