"""
IELTS-Style Academic Full Test - Set A
======================================
100% ORIGINAL CONTENT - NOT COPIED FROM CAMBRIDGE

This test matches IELTS format, timing, and difficulty level.
Used as calibration reference only.
"""

from typing import Dict, Any

ACADEMIC_SET_A = {
    "test_id": "academic_set_a_01",
    "test_type": "academic",
    "title": "IELTS-Style Academic Full Test - Set A",
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
                    "title": "Hotel Reservation",
                    "context": "A phone conversation between a customer and hotel receptionist",
                    "speakers": ["Customer", "Receptionist"],
                    "audio_script": """
Receptionist: Good morning, Riverside Hotel. How may I help you?
Customer: Hello, I'd like to make a reservation for next month please.
Receptionist: Certainly. What dates are you looking at?
Customer: From the fifteenth to the nineteenth of March.
Receptionist: That's four nights. And how many guests will there be?
Customer: Two adults and one child. My daughter is eight years old.
Receptionist: Perfect. We have family rooms available. Could I take your name please?
Customer: Yes, it's Henderson. That's H-E-N-D-E-R-S-O-N.
Receptionist: And your first name?
Customer: Margaret.
Receptionist: Thank you, Mrs Henderson. Now, we have two types of family rooms. The Standard is one hundred and twenty pounds per night, and the Superior is one hundred and fifty-five pounds.
Customer: What's the difference?
Receptionist: The Superior has a sea view and includes breakfast. The Standard has a city view and breakfast is extra at twelve pounds per person.
Customer: I'll take the Superior, please.
Receptionist: Excellent choice. Could I have your contact number?
Customer: It's oh-seven-seven-zero-four, five-five-three, eight-two-nine.
Receptionist: And your email address for confirmation?
Customer: It's m.henderson at globalmail.com.
Receptionist: Perfect. Now, do you have any special requirements? We can arrange airport transfers if needed.
Customer: Actually yes, we'll be arriving at the airport around two pm on the fifteenth. How much would a transfer cost?
Receptionist: The airport shuttle is thirty-five pounds for up to four passengers.
Customer: That sounds reasonable. Please add that.
Receptionist: Of course. The shuttle will meet you at Terminal Two, arrivals hall. Look for a sign with your name.
Customer: Terminal Two, got it. One more thing - does the hotel have a swimming pool?
Receptionist: Yes, our pool is open from seven am to nine pm. There's also a fitness centre and spa.
Customer: Wonderful. And is there parking available? We might hire a car for a day trip.
Receptionist: Yes, we have underground parking. It's eight pounds per day for hotel guests.
Customer: Perfect. I think that covers everything.
Receptionist: Let me confirm your booking. Mrs Margaret Henderson, Superior family room, fifteenth to nineteenth March, airport transfer included. The total comes to six hundred and ninety-five pounds. Would you like to pay now or at check-in?
Customer: I'll pay a deposit now. Can I pay the rest on arrival?
Receptionist: Absolutely. We require a fifty percent deposit. That's three hundred and forty-seven pounds fifty.
Customer: Fine. I'll pay by credit card.
""",
                    "questions": [
                        {"id": "L1Q1", "type": "form_completion", "question": "Guest name: Margaret ________", "answer": "Henderson", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q2", "type": "form_completion", "question": "Check-in date: ________ March", "answer": "15/15th/fifteenth", "instruction": "Write A NUMBER"},
                        {"id": "L1Q3", "type": "form_completion", "question": "Number of nights: ________", "answer": "4/four", "instruction": "Write A NUMBER"},
                        {"id": "L1Q4", "type": "form_completion", "question": "Room type: ________", "answer": "Superior", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L1Q5", "type": "form_completion", "question": "Price per night: £ ________", "answer": "155", "instruction": "Write A NUMBER"},
                        {"id": "L1Q6", "type": "form_completion", "question": "Contact number: 07704-553-________", "answer": "829", "instruction": "Write A NUMBER"},
                        {"id": "L1Q7", "type": "form_completion", "question": "Airport shuttle cost: £ ________", "answer": "35", "instruction": "Write A NUMBER"},
                        {"id": "L1Q8", "type": "form_completion", "question": "Meeting point: Terminal ________, arrivals hall", "answer": "2/Two", "instruction": "Write A NUMBER"},
                        {"id": "L1Q9", "type": "form_completion", "question": "Car parking cost per day: £ ________", "answer": "8", "instruction": "Write A NUMBER"},
                        {"id": "L1Q10", "type": "form_completion", "question": "Deposit amount: £ ________", "answer": "347.50/347.5", "instruction": "Write A NUMBER"}
                    ]
                },
                
                # PART 2: Social Monologue (Q11-20)
                {
                    "part_number": 2,
                    "title": "City Library Tour",
                    "context": "A library staff member giving information to new members",
                    "speakers": ["Librarian"],
                    "audio_script": """
Good afternoon everyone, and welcome to Central City Library. I'm Sarah, and I'll be showing you around our facilities today.

First, let me give you some background. This library was originally built in nineteen twenty-three and has been renovated twice, most recently in two thousand and nineteen. We now have over two hundred thousand books and resources available.

Let's start with the ground floor. As you enter through the main entrance, you'll find the Information Desk directly ahead. This is where you can get your library card, ask questions, and return books. To the left of the Information Desk is our Children's Section. This area has picture books, early readers, and educational games for children up to age twelve.

On the right side of the ground floor, you'll find our Periodicals Room. This is where we keep newspapers, magazines, and journals. Most popular magazines are available for the past three years. We receive newspapers daily, and these must be read in the library - they cannot be borrowed.

Now, moving to the first floor. Take the stairs or lift and you'll arrive at our main Fiction Section. This covers everything from classics to contemporary novels. We've organised books alphabetically by author surname. Next to Fiction is our Non-Fiction Section, which uses the Dewey Decimal System.

The second floor is dedicated to our Study Rooms and Computer Lab. We have ten individual study rooms that can be booked in advance for up to three hours at a time. The Computer Lab has forty workstations with internet access. Sessions are limited to two hours, but you can extend if no one is waiting.

There's also a Quiet Study Area on the second floor. This is a silent zone - no talking, no phones, no eating or drinking. It's popular during exam periods, so arrive early if you want a seat.

Finally, on the third floor, we have our Special Collections and Local History Archive. Access to these requires advance booking and staff supervision. We also have a small café on this floor, open from eight am to six pm.

Regarding borrowing, standard members can borrow up to twelve items for three weeks. DVDs and CDs have a one-week loan period. Renewals can be done online, by phone, or in person - up to two renewals per item as long as no one else has reserved it.

Late fees are twenty pence per day per item, with a maximum fine of five pounds per item. Lost items must be paid for at replacement cost plus a five pound processing fee.

The library is open Monday to Friday from nine am to eight pm, Saturdays from ten to six, and Sundays from twelve to five. We're closed on public holidays.

Any questions before we begin the tour?
""",
                    "questions": [
                        {"id": "L2Q11", "type": "multiple_choice", "question": "When was the library most recently renovated?", "options": ["A) 1923", "B) 2009", "C) 2019"], "answer": "C"},
                        {"id": "L2Q12", "type": "multiple_choice", "question": "What is located to the left of the Information Desk?", "options": ["A) Periodicals Room", "B) Children's Section", "C) Fiction Section"], "answer": "B"},
                        {"id": "L2Q13", "type": "sentence_completion", "question": "Newspapers must be read in the library and cannot be ________.", "answer": "borrowed", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L2Q14", "type": "sentence_completion", "question": "Fiction books are organised alphabetically by author ________.", "answer": "surname", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L2Q15", "type": "sentence_completion", "question": "Study rooms can be booked for a maximum of ________ hours.", "answer": "3/three", "instruction": "Write A NUMBER"},
                        {"id": "L2Q16", "type": "sentence_completion", "question": "Computer sessions are limited to ________ hours.", "answer": "2/two", "instruction": "Write A NUMBER"},
                        {"id": "L2Q17", "type": "sentence_completion", "question": "The Special Collections require advance ________ to access.", "answer": "booking", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L2Q18", "type": "sentence_completion", "question": "Standard members can borrow up to ________ items.", "answer": "12/twelve", "instruction": "Write A NUMBER"},
                        {"id": "L2Q19", "type": "sentence_completion", "question": "Late fees are ________ pence per day.", "answer": "20/twenty", "instruction": "Write A NUMBER"},
                        {"id": "L2Q20", "type": "multiple_choice", "question": "What time does the library close on Sundays?", "options": ["A) 5 pm", "B) 6 pm", "C) 8 pm"], "answer": "A"}
                    ]
                },
                
                # PART 3: Educational Discussion (Q21-30)
                {
                    "part_number": 3,
                    "title": "Research Project Discussion",
                    "context": "Two university students discussing their group project with their tutor",
                    "speakers": ["Tutor (Dr. Williams)", "Student 1 (Emma)", "Student 2 (James)"],
                    "audio_script": """
Dr. Williams: Good afternoon, Emma, James. Thanks for coming in. Let's discuss your research project on renewable energy adoption. How's it progressing?

Emma: We've made good progress, Dr. Williams. We've finished the literature review and collected most of our data.

James: Yes, we surveyed three hundred households in the local area about their attitudes towards solar panels.

Dr. Williams: Excellent sample size. What were your main findings?

Emma: Well, the most surprising result was about age groups. We expected younger people to be more enthusiastic, but actually the fifty-five to sixty-five age group showed the highest interest in installing solar panels.

James: We think this is because they're more likely to own their homes and have the capital for investment. Renters, who tend to be younger, don't have the option to install panels.

Dr. Williams: That's an insightful observation. What about barriers to adoption?

Emma: The initial cost was the biggest barrier - seventy-two percent mentioned it. But interestingly, aesthetic concerns came second at forty-three percent. Many people think panels look ugly on roofs.

James: Government incentives played a role too. Areas with feed-in tariff schemes showed thirty percent higher adoption rates.

Dr. Williams: Have you considered the methodological limitations?

James: Yes, we acknowledge that our survey only covered one region. Results might differ in rural areas or different climate zones.

Emma: Also, we relied on self-reported data. There could be a gap between what people say they'd do and their actual behaviour.

Dr. Williams: Good awareness of limitations. What about your analysis approach?

Emma: We're using regression analysis to identify the strongest predictors of adoption intention. So far, household income and environmental concern are the two most significant variables.

James: We've also created three different models - one for homeowners, one for renters, and a combined model.

Dr. Williams: That's sophisticated work. When do you expect to complete the analysis?

Emma: The statistical analysis should be done by next Friday. Then we need about two weeks for writing up.

James: We're aiming to submit a draft to you by the twentieth of November.

Dr. Williams: That gives us time for revisions before the December deadline. One suggestion - make sure you discuss the policy implications of your findings. Policymakers would be interested in how to increase adoption rates.

Emma: That's a great point. We could recommend targeted subsidies for middle-income households.

James: And perhaps public education campaigns to address aesthetic concerns.

Dr. Williams: Excellent ideas. I look forward to reading your draft.
""",
                    "questions": [
                        {"id": "L3Q21", "type": "multiple_choice", "question": "How many households did they survey?", "options": ["A) 200", "B) 300", "C) 400"], "answer": "B"},
                        {"id": "L3Q22", "type": "multiple_choice", "question": "Which age group showed the highest interest in solar panels?", "options": ["A) 25-35", "B) 35-45", "C) 55-65"], "answer": "C"},
                        {"id": "L3Q23", "type": "sentence_completion", "question": "The main reason older people are more interested is because they're more likely to ________ their homes.", "answer": "own", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L3Q24", "type": "sentence_completion", "question": "________ percent of respondents mentioned initial cost as a barrier.", "answer": "72/seventy-two", "instruction": "Write A NUMBER"},
                        {"id": "L3Q25", "type": "sentence_completion", "question": "The second biggest barrier was ________ concerns at 43%.", "answer": "aesthetic", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L3Q26", "type": "multiple_choice", "question": "What type of analysis are they using?", "options": ["A) correlation analysis", "B) regression analysis", "C) factor analysis"], "answer": "B"},
                        {"id": "L3Q27", "type": "sentence_completion", "question": "The two most significant variables are household income and environmental ________.", "answer": "concern", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L3Q28", "type": "sentence_completion", "question": "They plan to submit a draft by the ________ of November.", "answer": "20/20th/twentieth", "instruction": "Write A NUMBER"},
                        {"id": "L3Q29", "type": "matching", "question": "Match the limitation with the description: The survey only covered one ________.", "answer": "region", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L3Q30", "type": "multiple_choice", "question": "What recommendation do they suggest for middle-income households?", "options": ["A) tax breaks", "B) targeted subsidies", "C) free installation"], "answer": "B"}
                    ]
                },
                
                # PART 4: Academic Lecture (Q31-40)
                {
                    "part_number": 4,
                    "title": "The Science of Sleep",
                    "context": "A university lecture on sleep research and its implications",
                    "speakers": ["Professor"],
                    "audio_script": """
Good morning, everyone. Today we're going to examine the science of sleep - specifically, why we sleep and what happens when we don't get enough of it.

Sleep has been a mystery for most of human history. The ancient Greeks believed sleep was caused by blood flowing away from the brain. It wasn't until the twentieth century that we began to understand sleep scientifically.

Let me start with the basics. Sleep occurs in cycles of approximately ninety minutes. Each cycle has several stages. Stages one and two are light sleep - you can be easily awakened. Stages three and four are deep sleep, also called slow-wave sleep. This is when the body repairs tissues and strengthens the immune system.

Then there's REM sleep - that's Rapid Eye Movement sleep. This is when most dreaming occurs. Your brain is almost as active as when you're awake, but your muscles are essentially paralysed. This paralysis is actually protective - it stops you from acting out your dreams.

Now, how much sleep do we need? The common advice is eight hours, but research shows individual needs vary considerably. A two thousand and fifteen study found that genetic factors account for about forty percent of variation in sleep needs. Some people function well on six hours; others need nine or more.

What's particularly interesting is the effect of sleep deprivation. After just seventeen hours without sleep, cognitive impairment is equivalent to having a blood alcohol level of point-oh-five percent. After twenty-four hours, it's like being legally drunk in most countries.

The consequences extend beyond tiredness. Chronic sleep deprivation affects memory consolidation. During sleep, the brain transfers information from short-term to long-term memory. Without adequate sleep, learning efficiency drops by up to forty percent.

There are also serious health implications. Studies show that regularly sleeping less than six hours increases the risk of heart disease by forty-eight percent. The immune system suffers too - people who sleep less than seven hours are three times more likely to catch a cold when exposed to the virus.

So why is modern society so sleep-deprived? The main culprit is artificial lighting. Before electricity, people slept about ten hours per night. Now the average is just under seven hours. Screen time is particularly problematic because blue light from devices suppresses melatonin production.

Some researchers are investigating 'sleep banking' - whether you can store up extra sleep. Unfortunately, it doesn't work that way. You can recover from short-term sleep debt, but chronic deprivation causes cumulative damage.

There is some good news, however. Sleep quality can be improved through consistent habits. Going to bed and waking at the same time every day is more important than the total hours slept. Avoiding caffeine after two pm and keeping bedrooms cool and dark also helps significantly.

One final point - napping. Many cultures practice afternoon naps, and research supports this. A twenty-minute nap can boost alertness and performance. However, naps longer than thirty minutes can cause sleep inertia - that groggy feeling - and may interfere with nighttime sleep.

In next week's lecture, we'll examine sleep disorders and their treatments. Please read chapters seven and eight before then.
""",
                    "questions": [
                        {"id": "L4Q31", "type": "sentence_completion", "question": "Ancient Greeks believed sleep was caused by blood flowing away from the ________.", "answer": "brain", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L4Q32", "type": "sentence_completion", "question": "Each sleep cycle lasts approximately ________ minutes.", "answer": "90/ninety", "instruction": "Write A NUMBER"},
                        {"id": "L4Q33", "type": "sentence_completion", "question": "During deep sleep, the body repairs tissues and strengthens the ________ system.", "answer": "immune", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L4Q34", "type": "sentence_completion", "question": "During REM sleep, muscles are essentially ________.", "answer": "paralysed/paralyzed", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L4Q35", "type": "sentence_completion", "question": "Genetic factors account for about ________ percent of variation in sleep needs.", "answer": "40/forty", "instruction": "Write A NUMBER"},
                        {"id": "L4Q36", "type": "sentence_completion", "question": "After 17 hours without sleep, impairment equals a blood alcohol level of ________ percent.", "answer": "0.05/point-oh-five", "instruction": "Write A NUMBER"},
                        {"id": "L4Q37", "type": "sentence_completion", "question": "Without adequate sleep, learning efficiency drops by up to ________ percent.", "answer": "40/forty", "instruction": "Write A NUMBER"},
                        {"id": "L4Q38", "type": "sentence_completion", "question": "Before electricity, people slept about ________ hours per night.", "answer": "10/ten", "instruction": "Write A NUMBER"},
                        {"id": "L4Q39", "type": "sentence_completion", "question": "Blue light from devices suppresses ________ production.", "answer": "melatonin", "instruction": "Write NO MORE THAN ONE WORD"},
                        {"id": "L4Q40", "type": "sentence_completion", "question": "A ________ minute nap can boost alertness and performance.", "answer": "20/twenty", "instruction": "Write A NUMBER"}
                    ]
                }
            ]
        },
        
        # ============ READING SECTION ============
        # (Will be in next file due to length)
        "reading": {
            "total_questions": 40,
            "total_time": 3600,
            "instructions": "Read the passages and answer questions 1-40. You have 60 minutes.",
            "passages": []  # Detailed in set_a_reading.py
        },
        
        # ============ WRITING SECTION ============
        "writing": {
            "total_time": 3600,
            "instructions": "Complete both tasks. Task 2 contributes twice as much as Task 1 to your Writing score.",
            "tasks": [
                {
                    "task_number": 1,
                    "type": "data_description",
                    "time_suggested": 1200,
                    "word_limit": {"min": 150, "recommended": 170},
                    "prompt": "The charts below show the percentage of water used for different purposes in six areas of the world.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                    "visual_data": {
                        "type": "bar_chart",
                        "title": "Water Usage by Sector (%)",
                        "categories": ["North America", "South America", "Europe", "Africa", "Central Asia", "Southeast Asia"],
                        "data": [
                            {"sector": "Domestic", "values": [13, 19, 15, 9, 3, 7]},
                            {"sector": "Industrial", "values": [48, 10, 54, 7, 5, 12]},
                            {"sector": "Agricultural", "values": [39, 71, 31, 84, 92, 81]}
                        ]
                    }
                },
                {
                    "task_number": 2,
                    "type": "essay",
                    "time_suggested": 2400,
                    "word_limit": {"min": 250, "recommended": 280},
                    "prompt": "Some people believe that unpaid community service should be a compulsory part of high school programmes (for example, working for a charity, improving the neighbourhood, or teaching sports to younger children).\n\nTo what extent do you agree or disagree?"
                }
            ]
        },
        
        # ============ SPEAKING SECTION ============
        "speaking": {
            "total_time": 840,
            "instructions": "The speaking test has three parts and takes 11-14 minutes.",
            "parts": [
                {
                    "part_number": 1,
                    "title": "Introduction and Interview",
                    "time": 300,
                    "description": "The examiner will ask general questions about familiar topics.",
                    "topics": ["Home", "Work/Studies", "Technology"],
                    "questions": [
                        {"id": "S1Q1", "text": "Let's talk about where you live. Do you live in a house or an apartment?"},
                        {"id": "S1Q2", "text": "What do you like most about living there?"},
                        {"id": "S1Q3", "text": "How long have you lived in your current home?"},
                        {"id": "S1Q4", "text": "Now let's talk about your work or studies. What do you do?"},
                        {"id": "S1Q5", "text": "Why did you choose this field?"},
                        {"id": "S1Q6", "text": "What do you enjoy most about it?"},
                        {"id": "S1Q7", "text": "Let's move on to technology. How often do you use your phone?"},
                        {"id": "S1Q8", "text": "What do you mainly use your phone for?"},
                        {"id": "S1Q9", "text": "Do you think people spend too much time on their phones?"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "prep_time": 60,
                    "speak_time": 120,
                    "description": "You will be given a card with a topic and points to include.",
                    "cue_card": {
                        "topic": "Describe a time when you helped someone.",
                        "points": [
                            "Who you helped",
                            "What the situation was",
                            "How you helped them",
                            "And explain how you felt about helping them"
                        ]
                    },
                    "follow_up": "Do you often help people?"
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "time": 300,
                    "description": "The examiner will ask more abstract questions related to Part 2.",
                    "questions": [
                        {"id": "S3Q1", "text": "In your country, do people generally like to help others?"},
                        {"id": "S3Q2", "text": "Do you think it's important to teach children to help others?"},
                        {"id": "S3Q3", "text": "How do you think technology has changed the way people help each other?"},
                        {"id": "S3Q4", "text": "Some say we've become less willing to help strangers. What's your view?"},
                        {"id": "S3Q5", "text": "What motivates people to do volunteer work?"}
                    ]
                }
            ]
        }
    },
    
    "band_mapping": {
        "listening": "standard_ielts",
        "reading": "academic_ielts",
        "writing": "band_descriptors",
        "speaking": "band_descriptors"
    },
    
    "internal_calibration_notes": {
        "listening_difficulty": "IELTS-standard mix of easy and challenging questions",
        "reading_difficulty": "Passages increase in difficulty from P1 to P3",
        "writing_prompts": "Common IELTS Academic topics with data interpretation and argumentation",
        "speaking_topics": "Standard familiar and abstract topics"
    }
}


# Import and merge reading content
from content.full_tests.academic.set_a_reading import ACADEMIC_SET_A_READING
ACADEMIC_SET_A["sections"]["reading"] = ACADEMIC_SET_A_READING


def get_academic_set_a():
    return ACADEMIC_SET_A
