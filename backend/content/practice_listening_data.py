"""
Practice Listening Questions Data
=================================
51 short IELTS-style listening questions organized in 17 sets of 3.
Each question has a short audio transcript for TTS generation.
"""

PRACTICE_LISTENING_QUESTIONS = [
    # Set 1: Library Membership
    {
        "id": "PL_S01_Q1", "set": 1,
        "type": "form-completion",
        "text": "Library card number: ______",
        "correct": "7724",
        "options": [],
        "audio_transcript": "Good morning. I'd like to register for a library card, please. Of course, I'll need a few details. Your full name? It's Sarah Mitchell. And your library card number will be 7724. Please remember that number."
    },
    {
        "id": "PL_S01_Q2", "set": 1,
        "type": "form-completion",
        "text": "The woman lives on ______ Street.",
        "correct": "Oakwood",
        "options": [],
        "audio_transcript": "And your address? I live at 45 Oakwood Street. That's O-A-K-W-O-O-D Street, in Greenfield. And the postcode? It's NW3 5TH."
    },
    {
        "id": "PL_S01_Q3", "set": 1,
        "type": "form-completion",
        "text": "The annual membership fee is ______ pounds.",
        "correct": "25",
        "options": [],
        "audio_transcript": "Now, the annual membership fee is 25 pounds. That covers unlimited borrowing for twelve months. We also have a student rate of 15 pounds if you have a valid student ID."
    },
    # Set 2: Gym Booking
    {
        "id": "PL_S02_Q1", "set": 2,
        "type": "form-completion",
        "text": "The swimming pool opens at ______.",
        "correct": "6:30",
        "options": [],
        "audio_transcript": "Welcome to FitLife Gym. Our swimming pool opens at 6:30 in the morning and closes at 9 PM. The gym floor is open from 6 AM to 10 PM. On weekends, everything opens one hour later."
    },
    {
        "id": "PL_S02_Q2", "set": 2,
        "type": "multiple-choice",
        "text": "How much is a monthly pass?",
        "correct": "B",
        "options": ["A 35 pounds", "B 45 pounds", "C 55 pounds"],
        "audio_transcript": "For membership options, we have a day pass at 12 pounds, a monthly pass at 45 pounds, and an annual membership at 400 pounds. The monthly pass is the most popular with our members."
    },
    {
        "id": "PL_S02_Q3", "set": 2,
        "type": "form-completion",
        "text": "Classes must be booked ______ hours in advance.",
        "correct": "24",
        "options": [],
        "audio_transcript": "If you want to join group classes like yoga or spinning, you need to book at least 24 hours in advance through our app or at the front desk. Walk-ins are only accepted if there are empty spots."
    },
    # Set 3: Hotel Reservation
    {
        "id": "PL_S03_Q1", "set": 3,
        "type": "form-completion",
        "text": "Check-in date: March ______",
        "correct": "15th/15",
        "options": [],
        "audio_transcript": "I'd like to book a room, please. When would you like to check in? March 15th, and I'll be staying for three nights. So checking out on March 18th. Let me see what's available."
    },
    {
        "id": "PL_S03_Q2", "set": 3,
        "type": "multiple-choice",
        "text": "Which room type does the guest choose?",
        "correct": "B",
        "options": ["A Standard single", "B Deluxe double", "C Suite"],
        "audio_transcript": "We have standard singles at 80 pounds per night, deluxe doubles at 120, and suites at 200. I'll take the deluxe double, please. Excellent choice. It comes with a city view and breakfast included."
    },
    {
        "id": "PL_S03_Q3", "set": 3,
        "type": "form-completion",
        "text": "Breakfast is served from 7 AM to ______ AM.",
        "correct": "10",
        "options": [],
        "audio_transcript": "Breakfast is served in the restaurant on the ground floor from 7 AM to 10 AM. On Sundays, we extend it until 11 AM. There's also a 24 hour room service available."
    },
    # Set 4: Doctor's Appointment
    {
        "id": "PL_S04_Q1", "set": 4,
        "type": "form-completion",
        "text": "The appointment is on ______ at 2:30 PM.",
        "correct": "Thursday",
        "options": [],
        "audio_transcript": "I need to see the doctor, please. Let me check. Dr. Williams has an opening on Thursday at 2:30 PM. Would that work for you? Yes, Thursday at 2:30 is perfect. I'll book that for you."
    },
    {
        "id": "PL_S04_Q2", "set": 4,
        "type": "form-completion",
        "text": "Patient's date of birth: June ______, 1985.",
        "correct": "12th/12",
        "options": [],
        "audio_transcript": "Can I take some details? Your date of birth, please. June 12th, 1985. And do you have any allergies we should know about? Yes, I'm allergic to penicillin. I'll make a note of that."
    },
    {
        "id": "PL_S04_Q3", "set": 4,
        "type": "multiple-choice",
        "text": "What should the patient bring to the appointment?",
        "correct": "C",
        "options": ["A Insurance card only", "B Previous test results only", "C Both insurance card and previous test results"],
        "audio_transcript": "Please bring your insurance card and any previous test results you might have. Both are important for Dr. Williams to review before your consultation. Also arrive about 10 minutes early to fill in some forms."
    },
    # Set 5: Train Travel
    {
        "id": "PL_S05_Q1", "set": 5,
        "type": "form-completion",
        "text": "The train departs from platform ______.",
        "correct": "7",
        "options": [],
        "audio_transcript": "Attention passengers. The 10:15 express service to Manchester will depart from platform 7. I repeat, platform 7. Please have your tickets ready for inspection. The journey time is approximately two hours and fifteen minutes."
    },
    {
        "id": "PL_S05_Q2", "set": 5,
        "type": "multiple-choice",
        "text": "What is the price of a return ticket?",
        "correct": "A",
        "options": ["A 48 pounds", "B 58 pounds", "C 68 pounds"],
        "audio_transcript": "Ticket prices for Manchester. A single ticket is 28 pounds. A return ticket is 48 pounds, saving you 8 pounds compared to two singles. First class return is 85 pounds and includes complimentary refreshments."
    },
    {
        "id": "PL_S05_Q3", "set": 5,
        "type": "form-completion",
        "text": "The train arrives in Manchester at ______.",
        "correct": "12:30",
        "options": [],
        "audio_transcript": "The 10:15 service calls at Birmingham New Street at 11:45 and arrives at Manchester Piccadilly at 12:30. Please note there is a buffet car in coach D serving hot and cold drinks and light snacks."
    },
    # Set 6: Restaurant Booking
    {
        "id": "PL_S06_Q1", "set": 6,
        "type": "form-completion",
        "text": "The reservation is for ______ people.",
        "correct": "6",
        "options": [],
        "audio_transcript": "Good evening, The Olive Garden. How can I help? I'd like to book a table for Saturday evening. How many people? There will be 6 of us. And what time would you prefer? 7:30 if possible."
    },
    {
        "id": "PL_S06_Q2", "set": 6,
        "type": "form-completion",
        "text": "The booking name is ______.",
        "correct": "Henderson",
        "options": [],
        "audio_transcript": "Can I take a name for the reservation? Henderson. That's H-E-N-D-E-R-S-O-N. Thank you, Mr. Henderson. And a contact number? It's 07855 342 198. We'll send a confirmation text shortly."
    },
    {
        "id": "PL_S06_Q3", "set": 6,
        "type": "multiple-choice",
        "text": "What does the restaurant offer on Saturdays?",
        "correct": "B",
        "options": ["A Free dessert", "B Live music", "C A discount on wine"],
        "audio_transcript": "I should mention that we have live music on Saturday evenings, a jazz trio starting at 8 PM. Also, our new seasonal menu has just launched with some wonderful seafood options. Would anyone in your group have dietary requirements?"
    },
    # Set 7: University Enrollment
    {
        "id": "PL_S07_Q1", "set": 7,
        "type": "form-completion",
        "text": "The orientation starts on September ______.",
        "correct": "4th/4",
        "options": [],
        "audio_transcript": "Welcome to Riverside University. Orientation week starts on September 4th and runs until September 8th. During this week, you'll meet your tutors, tour the campus, and register for your modules."
    },
    {
        "id": "PL_S07_Q2", "set": 7,
        "type": "form-completion",
        "text": "The student ID office is in the ______ Building.",
        "correct": "Newton",
        "options": [],
        "audio_transcript": "You'll need to collect your student ID card from the Newton Building. That's the large glass building next to the library. The office is open Monday to Friday, 9 AM to 5 PM. Bring your enrollment letter and a passport photo."
    },
    {
        "id": "PL_S07_Q3", "set": 7,
        "type": "multiple-choice",
        "text": "How many modules can first-year students choose?",
        "correct": "C",
        "options": ["A 3", "B 4", "C 5"],
        "audio_transcript": "First year students must register for 5 modules. Three are compulsory for your degree program, and you can choose two electives from the list. I recommend looking at the course guide online before making your selection."
    },
    # Set 8: Airport Information
    {
        "id": "PL_S08_Q1", "set": 8,
        "type": "form-completion",
        "text": "The gate number is ______.",
        "correct": "B14",
        "options": [],
        "audio_transcript": "This is a boarding announcement for flight BA 247 to Rome. Please proceed to gate B14. Boarding will begin in approximately 15 minutes. Business class and passengers with children may board first."
    },
    {
        "id": "PL_S08_Q2", "set": 8,
        "type": "form-completion",
        "text": "The flight is delayed by ______ minutes.",
        "correct": "40",
        "options": [],
        "audio_transcript": "We regret to inform you that flight BA 247 to Rome is delayed by approximately 40 minutes due to air traffic control restrictions. The new estimated departure time is 3:25 PM. We apologize for the inconvenience."
    },
    {
        "id": "PL_S08_Q3", "set": 8,
        "type": "multiple-choice",
        "text": "What is offered to passengers during the delay?",
        "correct": "A",
        "options": ["A Refreshment vouchers", "B Free Wi-Fi", "C Access to the lounge"],
        "audio_transcript": "As compensation for the delay, we are distributing refreshment vouchers worth 10 pounds. These can be used at any restaurant or cafe in the departure area. Please collect your vouchers from the customer service desk near gate B12."
    },
    # Set 9: Moving House
    {
        "id": "PL_S09_Q1", "set": 9,
        "type": "form-completion",
        "text": "The moving date is October ______.",
        "correct": "22nd/22",
        "options": [],
        "audio_transcript": "Thank you for calling Quick Move Services. I need to arrange a house move. When would you like to move? October 22nd. And where are you moving from? From Bristol to London. That's about a two and a half hour drive."
    },
    {
        "id": "PL_S09_Q2", "set": 9,
        "type": "form-completion",
        "text": "The estimate for the move is ______ pounds.",
        "correct": "650",
        "options": [],
        "audio_transcript": "Based on a two bedroom flat in Bristol to London, I'd estimate about 650 pounds. That includes two movers, the van, and basic insurance. Premium insurance is an extra 50 pounds. Would you like us to do the packing as well?"
    },
    {
        "id": "PL_S09_Q3", "set": 9,
        "type": "multiple-choice",
        "text": "What time will the movers arrive?",
        "correct": "B",
        "options": ["A 7 AM", "B 8 AM", "C 9 AM"],
        "audio_transcript": "Our team will arrive at 8 AM on October 22nd. We usually take about 3 hours to load everything, then the drive, and another 2 hours to unload. So you should be all settled in by late afternoon."
    },
    # Set 10: Bank Account
    {
        "id": "PL_S10_Q1", "set": 10,
        "type": "form-completion",
        "text": "The minimum deposit to open the account is ______ pounds.",
        "correct": "100",
        "options": [],
        "audio_transcript": "I'd like to open a savings account. Certainly. Our standard savings account requires a minimum deposit of 100 pounds. The current interest rate is 3.5 percent per annum, paid monthly."
    },
    {
        "id": "PL_S10_Q2", "set": 10,
        "type": "form-completion",
        "text": "The bank branch is on ______ Road.",
        "correct": "Victoria",
        "options": [],
        "audio_transcript": "You can complete the application online or visit any branch. Our nearest branch is on Victoria Road, just opposite the post office. We're open Monday to Friday, 9 to 5, and Saturdays until 1 PM."
    },
    {
        "id": "PL_S10_Q3", "set": 10,
        "type": "multiple-choice",
        "text": "What documents are needed to open the account?",
        "correct": "C",
        "options": ["A Passport only", "B Utility bill only", "C Passport and a utility bill"],
        "audio_transcript": "To open the account, you'll need to bring your passport for identification and a recent utility bill as proof of address. The bill must be dated within the last three months. A bank statement from another bank can also serve as address proof."
    },
    # Set 11: Job Interview
    {
        "id": "PL_S11_Q1", "set": 11,
        "type": "form-completion",
        "text": "The interview is for the position of ______.",
        "correct": "marketing assistant",
        "options": [],
        "audio_transcript": "Hello, I'm calling about the job application I submitted. Which position did you apply for? The marketing assistant role. Ah yes, I can see your application here. We'd like to invite you for an interview."
    },
    {
        "id": "PL_S11_Q2", "set": 11,
        "type": "form-completion",
        "text": "The interview will take place on the ______ floor.",
        "correct": "3rd/third",
        "options": [],
        "audio_transcript": "The interview will be at our head office on Baker Street. When you arrive, go to the reception on the ground floor and they'll direct you to the 3rd floor, room 305. Please bring a copy of your CV."
    },
    {
        "id": "PL_S11_Q3", "set": 11,
        "type": "multiple-choice",
        "text": "How long will the interview last?",
        "correct": "B",
        "options": ["A 30 minutes", "B 45 minutes", "C 60 minutes"],
        "audio_transcript": "The interview will last approximately 45 minutes. There will be two interviewers, the department manager and an HR representative. The first part is about your experience, and the second part involves a short practical task."
    },
    # Set 12: Museum Visit
    {
        "id": "PL_S12_Q1", "set": 12,
        "type": "form-completion",
        "text": "The museum closes at ______ PM on weekdays.",
        "correct": "5:30",
        "options": [],
        "audio_transcript": "Welcome to the National History Museum. Our opening hours are 10 AM to 5:30 PM on weekdays. On weekends, we stay open until 6:30 PM. The last entry is 45 minutes before closing time."
    },
    {
        "id": "PL_S12_Q2", "set": 12,
        "type": "multiple-choice",
        "text": "What is the special exhibition about?",
        "correct": "A",
        "options": ["A Ancient Egypt", "B Roman Britain", "C Viking settlements"],
        "audio_transcript": "Don't miss our special exhibition on Ancient Egypt, running until the end of March. It features over 200 artifacts, including a genuine mummy case. There's an additional charge of 8 pounds for this exhibition."
    },
    {
        "id": "PL_S12_Q3", "set": 12,
        "type": "form-completion",
        "text": "The guided tour starts at ______ PM.",
        "correct": "2",
        "options": [],
        "audio_transcript": "Free guided tours are available daily at 2 PM. They last about one hour and cover the main galleries. If you'd like a private tour for your group, these can be arranged for 50 pounds by calling the booking office in advance."
    },
    # Set 13: Car Rental
    {
        "id": "PL_S13_Q1", "set": 13,
        "type": "form-completion",
        "text": "The rental period is ______ days.",
        "correct": "5",
        "options": [],
        "audio_transcript": "I need to rent a car starting from Monday. How long would you need it for? Five days, returning on Friday evening. We have several options available for a 5 day rental. What type of car would you prefer?"
    },
    {
        "id": "PL_S13_Q2", "set": 13,
        "type": "multiple-choice",
        "text": "Which car does the customer choose?",
        "correct": "B",
        "options": ["A Economy hatchback", "B Mid-size saloon", "C Large SUV"],
        "audio_transcript": "We have economy hatchbacks from 30 pounds per day, mid-size saloons from 45 pounds, and large SUVs from 65 pounds. I'll take the mid-size saloon, please. That will be a Ford Focus or similar."
    },
    {
        "id": "PL_S13_Q3", "set": 13,
        "type": "form-completion",
        "text": "The pick-up location is at the ______ branch.",
        "correct": "airport",
        "options": [],
        "audio_transcript": "Where would you like to pick it up? From the airport branch, please. That's fine. The airport branch is in the arrivals hall, right next to the baggage claim area. It's open 24 hours. Remember to bring your driving licence and a credit card."
    },
    # Set 14: Dentist Appointment
    {
        "id": "PL_S14_Q1", "set": 14,
        "type": "form-completion",
        "text": "The patient's last check-up was ______ months ago.",
        "correct": "18",
        "options": [],
        "audio_transcript": "When was your last dental check-up? It was about 18 months ago. We do recommend check-ups every 6 months. I'll make sure to do a thorough examination then. Have you been experiencing any problems?"
    },
    {
        "id": "PL_S14_Q2", "set": 14,
        "type": "form-completion",
        "text": "The appointment is at ______ AM.",
        "correct": "9:15",
        "options": [],
        "audio_transcript": "I can fit you in on Wednesday at 9:15 in the morning. Does that work? Yes, 9:15 on Wednesday is fine. Please arrive 5 minutes early to update your patient records at reception."
    },
    {
        "id": "PL_S14_Q3", "set": 14,
        "type": "multiple-choice",
        "text": "What is included in the check-up?",
        "correct": "C",
        "options": ["A Examination only", "B Cleaning only", "C Examination, cleaning, and X-rays"],
        "audio_transcript": "The check-up includes a full examination, a professional cleaning, and X-rays if needed. The total cost is 65 pounds for private patients, or free if you're registered with the NHS. We accept most insurance plans as well."
    },
    # Set 15: Flat Viewing
    {
        "id": "PL_S15_Q1", "set": 15,
        "type": "form-completion",
        "text": "The flat has ______ bedrooms.",
        "correct": "2",
        "options": [],
        "audio_transcript": "I'm calling about the flat on Park Lane. Can I arrange a viewing? Of course. It's a lovely 2 bedroom flat on the third floor. Fully furnished with modern appliances. There's also a small balcony overlooking the park."
    },
    {
        "id": "PL_S15_Q2", "set": 15,
        "type": "form-completion",
        "text": "Monthly rent is ______ pounds.",
        "correct": "950",
        "options": [],
        "audio_transcript": "The monthly rent is 950 pounds, excluding bills. Council tax is about 120 pounds per month. We require a deposit of one month's rent plus one month in advance. So that would be 1900 pounds to move in."
    },
    {
        "id": "PL_S15_Q3", "set": 15,
        "type": "multiple-choice",
        "text": "What is NOT included in the rent?",
        "correct": "A",
        "options": ["A Electricity and gas", "B Internet", "C Parking space"],
        "audio_transcript": "The rent includes high speed internet and one parking space in the underground car park. Electricity and gas are not included. You'll need to set those up with a provider. Average monthly bills are about 80 pounds."
    },
    # Set 16: Sports Club
    {
        "id": "PL_S16_Q1", "set": 16,
        "type": "form-completion",
        "text": "Tennis courts can be booked for ______ minutes.",
        "correct": "60",
        "options": [],
        "audio_transcript": "The tennis courts can be booked in 60 minute slots. Peak time is between 5 and 8 PM on weekdays. Off-peak times are usually available the same day, but peak slots should be reserved at least 2 days ahead."
    },
    {
        "id": "PL_S16_Q2", "set": 16,
        "type": "multiple-choice",
        "text": "When is the beginner's tennis class?",
        "correct": "A",
        "options": ["A Tuesday evenings", "B Wednesday mornings", "C Saturday afternoons"],
        "audio_transcript": "We run tennis classes at three levels. The beginner's class is on Tuesday evenings at 7 PM. Intermediate is Wednesday mornings at 10 AM, and advanced is on Saturday afternoons at 2 PM. Each class has a maximum of 8 players."
    },
    {
        "id": "PL_S16_Q3", "set": 16,
        "type": "form-completion",
        "text": "Annual club membership costs ______ pounds.",
        "correct": "320",
        "options": [],
        "audio_transcript": "Annual membership for the sports club is 320 pounds, which gives you access to all facilities including the pool, gym, and courts. We also have a family membership at 550 pounds, which covers two adults and up to three children."
    },
    # Set 17: Cooking Class
    {
        "id": "PL_S17_Q1", "set": 17,
        "type": "form-completion",
        "text": "The class is on ______ afternoons.",
        "correct": "Saturday",
        "options": [],
        "audio_transcript": "Thank you for your interest in our cooking classes. The Italian cooking course runs on Saturday afternoons from 2 PM to 5 PM. It's a 6 week course starting on the first Saturday of next month."
    },
    {
        "id": "PL_S17_Q2", "set": 17,
        "type": "form-completion",
        "text": "The course fee is ______ pounds.",
        "correct": "180",
        "options": [],
        "audio_transcript": "The course fee is 180 pounds for the full 6 weeks. This includes all ingredients and recipe booklets. We ask that you bring your own apron. Class size is limited to 12 participants, and we're already half full."
    },
    {
        "id": "PL_S17_Q3", "set": 17,
        "type": "multiple-choice",
        "text": "What will students learn to cook in week one?",
        "correct": "C",
        "options": ["A Pizza and salad", "B Risotto and soup", "C Fresh pasta and tomato sauce"],
        "audio_transcript": "In the first week, we start with the basics: making fresh pasta from scratch and a classic tomato sauce. Week two covers risotto and minestrone soup. By week six, you'll be making your own pizza dough and a three course Italian dinner."
    }
]
