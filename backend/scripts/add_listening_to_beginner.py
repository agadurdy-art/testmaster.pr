#!/usr/bin/env python3
"""
Add Listening sections to all 14 Beginner English lessons.
Each listening section includes:
- transcript: The audio transcript text
- questions: 3 comprehension questions with answers
- tips: Listening tips for beginners
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

# Listening content for each lesson
LISTENING_CONTENT = {
    1: {  # Family
        "title": "A Conversation About Family",
        "transcript": """
Woman: Hello! My name is Sarah. What is your name?
Man: Hi Sarah. I am Tom. Nice to meet you.
Woman: Nice to meet you too. Do you have a big family?
Man: No, my family is small. I live with my parents. I have one sister.
Woman: Oh, that's nice. Is your sister older or younger?
Man: She is younger. She is 15 years old. I am 20.
Woman: Do you live near your grandparents?
Man: Yes, my grandmother lives in the same city. We visit her on weekends.
Woman: That sounds lovely. Family is very important.
Man: Yes, I agree. What about you? Do you have siblings?
Woman: I am an only child. But I have many cousins.
        """.strip(),
        "questions": [
            {"question": "How many people are in Tom's family?", "answer": "Four people (parents, Tom, and his sister).", "options": ["Three", "Four", "Five", "Six"]},
            {"question": "How old is Tom's sister?", "answer": "She is 15 years old.", "options": ["12 years old", "15 years old", "18 years old", "20 years old"]},
            {"question": "Does Sarah have any brothers or sisters?", "answer": "No, she is an only child.", "options": ["Yes, one brother", "Yes, two sisters", "No, she is an only child", "Yes, many siblings"]}
        ],
        "tips": ["Listen for numbers carefully.", "Pay attention to family words like 'parents', 'sister', 'only child'."]
    },
    2: {  # Daily Life
        "title": "Morning Routine",
        "transcript": """
Interviewer: Good morning! Can you tell me about your morning routine?
Student: Sure! I wake up at six thirty every day.
Interviewer: That's early! What do you do first?
Student: First, I take a shower. Then I get dressed.
Interviewer: Do you eat breakfast at home?
Student: Yes, I always eat breakfast. I usually have toast and orange juice.
Interviewer: What time do you leave home?
Student: I leave at eight o'clock. I walk to school.
Interviewer: How long does it take?
Student: It takes about fifteen minutes. I arrive at school at eight fifteen.
Interviewer: Do you ever take the bus?
Student: Sometimes, when it rains. But I prefer walking.
        """.strip(),
        "questions": [
            {"question": "What time does the student wake up?", "answer": "Six thirty.", "options": ["Six o'clock", "Six thirty", "Seven o'clock", "Seven thirty"]},
            {"question": "What does the student eat for breakfast?", "answer": "Toast and orange juice.", "options": ["Eggs and coffee", "Toast and orange juice", "Cereal and milk", "Nothing"]},
            {"question": "How does the student usually go to school?", "answer": "By walking.", "options": ["By bus", "By car", "By walking", "By bicycle"]}
        ],
        "tips": ["Listen for time expressions.", "Note words like 'always', 'usually', 'sometimes'."]
    },
    3: {  # Food
        "title": "At a Restaurant",
        "transcript": """
Waiter: Hello! Welcome to our restaurant. Are you ready to order?
Customer: Yes, I think so. What do you recommend?
Waiter: Our chicken soup is very popular. It's delicious and healthy.
Customer: That sounds good. I'll have the chicken soup, please.
Waiter: Would you like something to drink?
Customer: Yes, can I have a glass of water, please?
Waiter: Of course. Still or sparkling water?
Customer: Still water, please.
Waiter: And for the main course? We have fish, steak, or pasta.
Customer: I'll have the pasta. Is it vegetarian?
Waiter: Yes, it's made with tomatoes and vegetables. No meat.
Customer: Perfect. Thank you.
Waiter: Your food will be ready in about ten minutes.
        """.strip(),
        "questions": [
            {"question": "What does the customer order first?", "answer": "Chicken soup.", "options": ["Fish soup", "Chicken soup", "Vegetable soup", "Tomato soup"]},
            {"question": "What kind of water does the customer want?", "answer": "Still water.", "options": ["Sparkling water", "Hot water", "Still water", "Ice water"]},
            {"question": "What is the pasta made with?", "answer": "Tomatoes and vegetables.", "options": ["Chicken and cheese", "Tomatoes and vegetables", "Meat and potatoes", "Fish and rice"]}
        ],
        "tips": ["Listen for food vocabulary.", "Pay attention to questions with 'Would you like...?'"]
    },
    4: {  # Work
        "title": "Talking About Jobs",
        "transcript": """
Man: Hi Lisa! I heard you got a new job. Congratulations!
Woman: Thank you, David! Yes, I'm very excited.
Man: What kind of job is it?
Woman: I work in a hospital now. I'm a nurse.
Man: That's great! Do you like it?
Woman: Yes, I love it. I help people every day. It feels good.
Man: What hours do you work?
Woman: I work from eight in the morning to four in the afternoon.
Man: That's not bad. Do you work on weekends?
Woman: Sometimes. About one weekend every month.
Man: How do you get to work?
Woman: I take the train. It takes thirty minutes.
Man: Well, good luck with your new job!
Woman: Thanks! I'm really happy there.
        """.strip(),
        "questions": [
            {"question": "What is Lisa's new job?", "answer": "She is a nurse.", "options": ["A doctor", "A nurse", "A teacher", "A secretary"]},
            {"question": "What time does Lisa start work?", "answer": "Eight in the morning.", "options": ["Seven in the morning", "Eight in the morning", "Nine in the morning", "Ten in the morning"]},
            {"question": "How does Lisa go to work?", "answer": "By train.", "options": ["By bus", "By car", "By train", "On foot"]}
        ],
        "tips": ["Listen for job titles.", "Pay attention to times and schedules."]
    },
    5: {  # Education
        "title": "At School",
        "transcript": """
Teacher: Good morning, class! Today we have a new student. Please welcome Maria.
Maria: Hello everyone. I'm Maria. I'm from Spain.
Teacher: Welcome, Maria! Please sit next to John. John, can you help Maria today?
John: Yes, of course. Hi Maria!
Maria: Hi John. What subject is this?
John: This is English class. After this, we have Math.
Maria: Oh, I like Math. It's my favorite subject.
John: Really? I prefer Science. What time does school finish?
Maria: I don't know yet. This is my first day.
John: School finishes at three thirty. We have lunch at twelve.
Maria: That's good. I'm a little nervous about my first day.
John: Don't worry. Everyone is very friendly here.
        """.strip(),
        "questions": [
            {"question": "Where is Maria from?", "answer": "Spain.", "options": ["France", "Italy", "Spain", "Portugal"]},
            {"question": "What is Maria's favorite subject?", "answer": "Math.", "options": ["English", "Math", "Science", "History"]},
            {"question": "What time does school finish?", "answer": "Three thirty.", "options": ["Two thirty", "Three o'clock", "Three thirty", "Four o'clock"]}
        ],
        "tips": ["Listen for country names.", "Note school subjects and times."]
    },
    6: {  # Travel
        "title": "Planning a Trip",
        "transcript": """
Agent: Hello! How can I help you today?
Customer: Hi. I want to book a flight to London.
Agent: Sure! When do you want to travel?
Customer: Next Monday. The fifth of June.
Agent: One way or return?
Customer: Return, please. I want to come back on Friday.
Agent: Let me check... We have a flight at ten in the morning and one at three in the afternoon.
Customer: I'll take the morning flight.
Agent: Great. Would you like a window seat or an aisle seat?
Customer: Window seat, please. I like to look outside.
Agent: Perfect. Do you have any luggage?
Customer: Yes, one suitcase and one small bag.
Agent: Okay. The total is two hundred and fifty dollars.
Customer: Can I pay by credit card?
Agent: Yes, of course.
        """.strip(),
        "questions": [
            {"question": "Where does the customer want to go?", "answer": "London.", "options": ["Paris", "London", "New York", "Tokyo"]},
            {"question": "What time is the morning flight?", "answer": "Ten in the morning.", "options": ["Eight in the morning", "Nine in the morning", "Ten in the morning", "Eleven in the morning"]},
            {"question": "What kind of seat does the customer want?", "answer": "Window seat.", "options": ["Aisle seat", "Window seat", "Middle seat", "First class"]}
        ],
        "tips": ["Listen for dates and times.", "Pay attention to travel vocabulary like 'flight', 'luggage', 'seat'."]
    },
    7: {  # Health
        "title": "At the Doctor's Office",
        "transcript": """
Doctor: Hello. What seems to be the problem today?
Patient: I don't feel well. I have a bad headache.
Doctor: I see. How long have you had this headache?
Patient: For three days now.
Doctor: Do you have any other symptoms? Fever? Cough?
Patient: Yes, I have a small fever. But no cough.
Doctor: Let me take your temperature... It's thirty-eight degrees. A small fever.
Patient: Is it serious?
Doctor: No, I think you have a cold. You need to rest.
Patient: Should I take any medicine?
Doctor: Yes, take these pills twice a day. One in the morning and one at night.
Patient: Do I need to come back?
Doctor: Only if you don't feel better in five days. Drink lots of water too.
Patient: Thank you, doctor.
        """.strip(),
        "questions": [
            {"question": "What is the patient's main problem?", "answer": "A bad headache.", "options": ["A cough", "A bad headache", "A broken arm", "A stomachache"]},
            {"question": "How long has the patient been sick?", "answer": "Three days.", "options": ["One day", "Two days", "Three days", "One week"]},
            {"question": "How often should the patient take the medicine?", "answer": "Twice a day.", "options": ["Once a day", "Twice a day", "Three times a day", "Four times a day"]}
        ],
        "tips": ["Listen for health symptoms.", "Note instructions from the doctor."]
    },
    8: {  # Hobbies
        "title": "Talking About Free Time",
        "transcript": """
Man: Hey Sophie! What do you usually do on weekends?
Woman: Hi! I have many hobbies. On Saturdays, I usually go swimming.
Man: Swimming? That's great exercise!
Woman: Yes, I love it. I go to the pool near my house.
Man: What about Sundays?
Woman: On Sundays, I like to stay home. I paint pictures.
Man: Really? That's interesting. Are you a good artist?
Woman: I'm still learning. But it's very relaxing.
Man: I play video games in my free time. Maybe too much!
Woman: Ha! Do you have any outdoor hobbies?
Man: Sometimes I go hiking with friends. We go to the mountains.
Woman: That sounds fun. I want to try hiking too.
Man: You should! It's good for your health.
        """.strip(),
        "questions": [
            {"question": "What does Sophie do on Saturdays?", "answer": "She goes swimming.", "options": ["She paints", "She goes swimming", "She plays video games", "She goes hiking"]},
            {"question": "What is Sophie's hobby at home?", "answer": "Painting pictures.", "options": ["Playing music", "Painting pictures", "Reading books", "Cooking"]},
            {"question": "What outdoor hobby does the man have?", "answer": "Hiking.", "options": ["Swimming", "Running", "Hiking", "Cycling"]}
        ],
        "tips": ["Listen for activity words.", "Note time expressions like 'on Saturdays', 'in my free time'."]
    },
    9: {  # Technology
        "title": "New Phone",
        "transcript": """
Shop assistant: Hello! Can I help you?
Customer: Yes, I want to buy a new phone.
Shop assistant: Sure! What kind of phone are you looking for?
Customer: Something simple. I mostly use it for calls and messages.
Shop assistant: Do you use the internet on your phone?
Customer: Yes, sometimes. I check my email and social media.
Shop assistant: I recommend this model. It has a big screen and good camera.
Customer: How much is it?
Shop assistant: It's three hundred dollars.
Customer: That's a bit expensive. Do you have something cheaper?
Shop assistant: Yes, this one is one hundred and fifty dollars. It's also very good.
Customer: Does it have a good battery life?
Shop assistant: Yes, the battery lasts two days with normal use.
Customer: Perfect. I'll take that one.
        """.strip(),
        "questions": [
            {"question": "What does the customer mainly use the phone for?", "answer": "Calls and messages.", "options": ["Games", "Calls and messages", "Taking photos", "Watching movies"]},
            {"question": "How much is the first phone?", "answer": "Three hundred dollars.", "options": ["One hundred dollars", "Two hundred dollars", "Three hundred dollars", "Four hundred dollars"]},
            {"question": "How long does the cheaper phone's battery last?", "answer": "Two days.", "options": ["One day", "Two days", "Three days", "One week"]}
        ],
        "tips": ["Listen for prices and numbers.", "Note technology words like 'screen', 'camera', 'battery'."]
    },
    10: {  # Environment
        "title": "Helping the Environment",
        "transcript": """
Teacher: Today we're talking about the environment. Who can tell me one way to help?
Student 1: We can recycle plastic and paper.
Teacher: Excellent! Recycling is very important. What else?
Student 2: We should save water. Don't leave the tap running.
Teacher: Very good! Water is precious. Any other ideas?
Student 3: We can plant trees. Trees clean the air.
Teacher: Yes! Trees are wonderful for our planet.
Student 1: My family uses cloth bags instead of plastic bags.
Teacher: That's a great habit! Plastic bags are bad for the ocean.
Student 2: I turn off the lights when I leave a room.
Teacher: Saving electricity is also helping the environment.
Teacher: Remember, small actions make a big difference. Let's all do our part!
        """.strip(),
        "questions": [
            {"question": "What is one way to save water?", "answer": "Don't leave the tap running.", "options": ["Take long showers", "Don't leave the tap running", "Use a dishwasher", "Wash the car often"]},
            {"question": "Why are trees good for the planet?", "answer": "They clean the air.", "options": ["They give food", "They clean the air", "They make money", "They look beautiful"]},
            {"question": "What does the student's family use instead of plastic bags?", "answer": "Cloth bags.", "options": ["Paper bags", "Cloth bags", "No bags", "Metal bags"]}
        ],
        "tips": ["Listen for environmental vocabulary.", "Note action words like 'recycle', 'save', 'plant'."]
    },
    11: {  # Money
        "title": "At the Bank",
        "transcript": """
Bank clerk: Good morning! How can I help you?
Customer: Hi. I want to open a savings account.
Bank clerk: Certainly. Do you have identification with you?
Customer: Yes, here is my passport.
Bank clerk: Thank you. How much would you like to deposit today?
Customer: I want to start with five hundred dollars.
Bank clerk: That's fine. Would you like a debit card?
Customer: Yes, please. How long will it take to get the card?
Bank clerk: You'll receive it in about one week.
Customer: Can I use online banking?
Bank clerk: Yes, I'll set that up for you. You can check your balance anytime.
Customer: Is there a fee for the account?
Bank clerk: No, this account is free. But there's a small fee for international transfers.
Customer: Okay, that's fine. Thank you for your help!
        """.strip(),
        "questions": [
            {"question": "What does the customer want to open?", "answer": "A savings account.", "options": ["A checking account", "A savings account", "A business account", "A joint account"]},
            {"question": "How much does the customer want to deposit?", "answer": "Five hundred dollars.", "options": ["One hundred dollars", "Three hundred dollars", "Five hundred dollars", "One thousand dollars"]},
            {"question": "How long will it take to receive the debit card?", "answer": "About one week.", "options": ["One day", "Three days", "About one week", "One month"]}
        ],
        "tips": ["Listen for money amounts.", "Note banking vocabulary like 'deposit', 'account', 'balance'."]
    },
    12: {  # Housing
        "title": "Looking for an Apartment",
        "transcript": """
Agent: Hello! I'm showing an apartment today. Please come in.
Visitor: Thank you. It looks nice and bright.
Agent: Yes, it has big windows. This is the living room.
Visitor: How many bedrooms does it have?
Agent: Two bedrooms. One is large, and one is smaller.
Visitor: Is there a balcony?
Agent: Yes, there's a small balcony in the main bedroom.
Visitor: What about the kitchen?
Agent: The kitchen is modern. It has a new stove and refrigerator.
Visitor: Is the apartment furnished?
Agent: No, it's empty. But you can bring your own furniture.
Visitor: How much is the rent?
Agent: Eight hundred dollars per month, plus electricity and water.
Visitor: That's reasonable. Can I think about it?
Agent: Of course. Let me know by Friday.
        """.strip(),
        "questions": [
            {"question": "How many bedrooms does the apartment have?", "answer": "Two bedrooms.", "options": ["One bedroom", "Two bedrooms", "Three bedrooms", "Four bedrooms"]},
            {"question": "Is the apartment furnished?", "answer": "No, it's empty.", "options": ["Yes, fully furnished", "Yes, partially", "No, it's empty", "Only the bedroom"]},
            {"question": "How much is the monthly rent?", "answer": "Eight hundred dollars.", "options": ["Five hundred dollars", "Six hundred dollars", "Seven hundred dollars", "Eight hundred dollars"]}
        ],
        "tips": ["Listen for room names.", "Note descriptions like 'large', 'small', 'modern'."]
    },
    13: {  # Transportation
        "title": "At the Train Station",
        "transcript": """
Passenger: Excuse me. What time is the next train to Manchester?
Staff: The next train leaves at eleven forty-five.
Passenger: What platform does it leave from?
Staff: Platform three. It's that way, past the ticket office.
Passenger: How long is the journey?
Staff: About two hours and fifteen minutes.
Passenger: Is it a direct train?
Staff: No, you need to change at Birmingham.
Passenger: Oh, I see. How long do I wait at Birmingham?
Staff: Only fifteen minutes. The connection is easy.
Passenger: How much is a return ticket?
Staff: Forty-five pounds. Or thirty pounds for a single.
Passenger: I'll take a return ticket, please.
Staff: Here you go. The train is on time today. Have a good trip!
        """.strip(),
        "questions": [
            {"question": "What time does the train to Manchester leave?", "answer": "Eleven forty-five.", "options": ["Eleven fifteen", "Eleven thirty", "Eleven forty-five", "Twelve o'clock"]},
            {"question": "Does the passenger need to change trains?", "answer": "Yes, at Birmingham.", "options": ["No, it's direct", "Yes, at London", "Yes, at Birmingham", "Yes, at Leeds"]},
            {"question": "How much is a return ticket?", "answer": "Forty-five pounds.", "options": ["Thirty pounds", "Thirty-five pounds", "Forty pounds", "Forty-five pounds"]}
        ],
        "tips": ["Listen for platform numbers.", "Pay attention to journey times and prices."]
    },
    14: {  # Weather
        "title": "Weather Forecast",
        "transcript": """
Presenter: Good evening. Here is the weather forecast for tomorrow.
Presenter: In the morning, it will be cloudy with some light rain.
Presenter: The temperature will be around fifteen degrees.
Presenter: By the afternoon, the rain will stop.
Presenter: We expect some sunshine in the late afternoon.
Presenter: The temperature will rise to about twenty degrees.
Presenter: In the evening, it will be cool but dry.
Presenter: Perfect weather for a walk in the park!
Presenter: For the weekend, we expect warm and sunny weather.
Presenter: Saturday will be the best day, with temperatures reaching twenty-five degrees.
Presenter: Don't forget your sunscreen!
Presenter: That's all for the weather. Have a good evening!
        """.strip(),
        "questions": [
            {"question": "What will the weather be like in the morning?", "answer": "Cloudy with some light rain.", "options": ["Sunny and warm", "Cloudy with some light rain", "Very cold", "Snowing"]},
            {"question": "What temperature is expected in the afternoon?", "answer": "About twenty degrees.", "options": ["Fifteen degrees", "About twenty degrees", "Twenty-five degrees", "Thirty degrees"]},
            {"question": "What will the weather be like on Saturday?", "answer": "Warm and sunny.", "options": ["Rainy", "Cold and windy", "Warm and sunny", "Cloudy"]}
        ],
        "tips": ["Listen for weather words like 'cloudy', 'rain', 'sunny'.", "Note temperature numbers carefully."]
    }
}

async def add_listening_sections():
    """Add listening sections to all beginner lessons in the database."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("Adding Listening sections to Beginner English lessons...")
    
    for lesson_num, listening in LISTENING_CONTENT.items():
        lesson_id = f"beginner-lesson-{lesson_num}"
        
        # Update the lesson with listening content
        result = await db.beginner_english_lessons.update_one(
            {"id": lesson_id},
            {"$set": {"listening": listening}}
        )
        
        if result.modified_count > 0:
            print(f"  ✅ Lesson {lesson_num}: Added listening section")
        elif result.matched_count > 0:
            print(f"  ⚠️ Lesson {lesson_num}: Already has listening (no change)")
        else:
            print(f"  ❌ Lesson {lesson_num}: Not found in database")
    
    # Verify
    print("\nVerification:")
    async for lesson in db.beginner_english_lessons.find({}, {"id": 1, "title": 1, "listening": 1}):
        has_listening = "listening" in lesson and lesson["listening"]
        status = "✅" if has_listening else "❌"
        print(f"  {status} {lesson.get('title')}: {'Has listening' if has_listening else 'No listening'}")
    
    client.close()
    print("\nDone!")

if __name__ == "__main__":
    asyncio.run(add_listening_sections())
