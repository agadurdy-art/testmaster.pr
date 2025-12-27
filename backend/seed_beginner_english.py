#!/usr/bin/env python3
"""
Seed data for the 14-lesson Beginner English Course (Band 4.5 and below)
This course is for students who want to start learning for the IELTS exam.
The language is simple and easy to understand.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

# All 14 Beginner English Lessons
ALL_LISTENING_CONTENT = {
    1: {  # Family
        "title": "A Conversation About Family",
        "transcript": """
Woman: Hello! My name is Sarah. What is your name?
Man: Hi Sarah. I am Tom. Nice to meet you.
Woman: Nice to meet you too. Tell me about your family, Tom.
Man: Well, my family has four people. My father, my mother, my sister, and me.
Woman: Oh, that's nice. Is your sister older or younger than you?
Man: She is younger. She is fifteen years old. I am twenty.
Woman: Do you live near your grandparents?
Man: Yes, my grandmother lives in the same city. We visit her on weekends.
Woman: That sounds lovely. Family is very important.
Man: Yes, I agree. What about you? Do you have brothers or sisters?
Woman: No, I am an only child. But I have many cousins.
        """.strip(),
        "questions": [
            {"question": "How many people are in Tom's family?", "answer": "Four", "options": ["Three", "Four", "Five", "Six"]},
            {"question": "How old is Tom's sister?", "answer": "15 years old", "options": ["12 years old", "15 years old", "18 years old", "20 years old"]},
            {"question": "Does Sarah have any brothers or sisters?", "answer": "No, she is an only child", "options": ["Yes, one brother", "Yes, two sisters", "No, she is an only child", "Yes, many siblings"]}
        ],
        "tips": ["Listen for numbers carefully.", "Pay attention to family words."]
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
Student: It takes about fifteen minutes.
Interviewer: Do you ever take the bus?
Student: Sometimes, when it rains. But I prefer walking.
        """.strip(),
        "questions": [
            {"question": "What time does the student wake up?", "answer": "Six thirty", "options": ["Six o'clock", "Six thirty", "Seven o'clock", "Seven thirty"]},
            {"question": "What does the student eat for breakfast?", "answer": "Toast and orange juice", "options": ["Eggs and coffee", "Toast and orange juice", "Cereal and milk", "Nothing"]},
            {"question": "How does the student usually go to school?", "answer": "By walking", "options": ["By bus", "By car", "By walking", "By bicycle"]}
        ],
        "tips": ["Listen for time expressions.", "Note words like 'always', 'usually', 'sometimes'."]
    },
    3: {  # Food
        "title": "At a Restaurant",
        "transcript": """
Waiter: Hello! Welcome to our restaurant. Are you ready to order?
Customer: Yes, I think so. What do you recommend?
Waiter: Our chicken soup is very popular. It's delicious.
Customer: That sounds good. I'll have the chicken soup, please.
Waiter: Would you like something to drink?
Customer: Yes, can I have a glass of water, please?
Waiter: Of course. Still water or sparkling water?
Customer: Still water, please.
Waiter: And for the main course? We have fish, steak, or pasta.
Customer: I'll have the pasta. Is it vegetarian?
Waiter: Yes, it's made with tomatoes and vegetables. No meat.
Customer: Perfect. Thank you.
        """.strip(),
        "questions": [
            {"question": "What does the customer order first?", "answer": "Chicken soup", "options": ["Fish soup", "Chicken soup", "Vegetable soup", "Tomato soup"]},
            {"question": "What kind of water does the customer want?", "answer": "Still water", "options": ["Sparkling water", "Hot water", "Still water", "Ice water"]},
            {"question": "What is the pasta made with?", "answer": "Tomatoes and vegetables", "options": ["Chicken and cheese", "Tomatoes and vegetables", "Meat and potatoes", "Fish and rice"]}
        ],
        "tips": ["Listen for food vocabulary.", "Pay attention to polite requests."]
    },
    4: {  # Work
        "title": "Talking About Jobs",
        "transcript": """
Man: Hi Lisa! I heard you got a new job. Congratulations!
Woman: Thank you, David! Yes, I'm very excited.
Man: What kind of job is it?
Woman: I work in a hospital now. I'm a nurse.
Man: That's great! Do you like it?
Woman: Yes, I love it. I help people every day.
Man: What hours do you work?
Woman: I work from eight in the morning to four in the afternoon.
Man: That's good. Do you work on weekends?
Woman: Sometimes. About one weekend every month.
Man: How do you get to work?
Woman: I take the train. It takes thirty minutes.
        """.strip(),
        "questions": [
            {"question": "What is Lisa's new job?", "answer": "A nurse", "options": ["A doctor", "A nurse", "A teacher", "A secretary"]},
            {"question": "What time does Lisa start work?", "answer": "Eight in the morning", "options": ["Seven in the morning", "Eight in the morning", "Nine in the morning", "Ten in the morning"]},
            {"question": "How does Lisa go to work?", "answer": "By train", "options": ["By bus", "By car", "By train", "On foot"]}
        ],
        "tips": ["Listen for job titles.", "Pay attention to times."]
    },
    5: {  # Education
        "title": "At School",
        "transcript": """
Teacher: Good morning, class! Today we have a new student. Please welcome Maria.
Maria: Hello everyone. I'm Maria. I'm from Spain.
Teacher: Welcome, Maria! Please sit next to John.
John: Hi Maria! What subject is this?
Maria: Hi John. I don't know. This is my first day.
John: This is English class. After this, we have Math.
Maria: Oh, I like Math. It's my favorite subject.
John: Really? I prefer Science. What time does school finish?
Maria: I don't know yet.
John: School finishes at three thirty. We have lunch at twelve.
Maria: Thanks for telling me.
        """.strip(),
        "questions": [
            {"question": "Where is Maria from?", "answer": "Spain", "options": ["France", "Italy", "Spain", "Portugal"]},
            {"question": "What is Maria's favorite subject?", "answer": "Math", "options": ["English", "Math", "Science", "History"]},
            {"question": "What time does school finish?", "answer": "Three thirty", "options": ["Two thirty", "Three o'clock", "Three thirty", "Four o'clock"]}
        ],
        "tips": ["Listen for country names.", "Note school subjects and times."]
    },
    6: {  # Travel
        "title": "Planning a Trip",
        "transcript": """
Agent: Hello! How can I help you today?
Customer: Hi. I want to book a flight to London.
Agent: Sure! When do you want to travel?
Customer: Next Monday, the fifth of June.
Agent: One way or return?
Customer: Return, please. I want to come back on Friday.
Agent: Let me check. We have a flight at ten in the morning.
Customer: That's perfect. I'll take that one.
Agent: Great. Would you like a window seat or an aisle seat?
Customer: Window seat, please. I like to look outside.
Agent: Perfect. The total is two hundred and fifty dollars.
Customer: Can I pay by credit card?
Agent: Yes, of course.
        """.strip(),
        "questions": [
            {"question": "Where does the customer want to go?", "answer": "London", "options": ["Paris", "London", "New York", "Tokyo"]},
            {"question": "What time is the flight?", "answer": "Ten in the morning", "options": ["Eight in the morning", "Nine in the morning", "Ten in the morning", "Eleven in the morning"]},
            {"question": "What kind of seat does the customer want?", "answer": "Window seat", "options": ["Aisle seat", "Window seat", "Middle seat", "First class"]}
        ],
        "tips": ["Listen for dates and times.", "Pay attention to travel vocabulary."]
    },
    7: {  # Health
        "title": "At the Doctor",
        "transcript": """
Doctor: Hello. What seems to be the problem today?
Patient: I don't feel well. I have a bad headache.
Doctor: I see. How long have you had this headache?
Patient: For three days now.
Doctor: Do you have any other problems? Fever? Cough?
Patient: Yes, I have a small fever. But no cough.
Doctor: Let me check your temperature. It's thirty-eight degrees.
Patient: Is it serious?
Doctor: No, I think you have a cold. You need to rest.
Patient: Should I take any medicine?
Doctor: Yes, take these pills twice a day. Morning and night.
Patient: Thank you, doctor.
        """.strip(),
        "questions": [
            {"question": "What is the patient's main problem?", "answer": "A bad headache", "options": ["A cough", "A bad headache", "A broken arm", "A stomachache"]},
            {"question": "How long has the patient been sick?", "answer": "Three days", "options": ["One day", "Two days", "Three days", "One week"]},
            {"question": "How often should the patient take medicine?", "answer": "Twice a day", "options": ["Once a day", "Twice a day", "Three times a day", "Four times a day"]}
        ],
        "tips": ["Listen for health symptoms.", "Note the doctor's instructions."]
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
Man: Really? Are you a good artist?
Woman: I'm still learning. But it's very relaxing.
Man: I play video games in my free time.
Woman: Do you have any outdoor hobbies?
Man: Sometimes I go hiking with friends.
Woman: That sounds fun!
        """.strip(),
        "questions": [
            {"question": "What does Sophie do on Saturdays?", "answer": "She goes swimming", "options": ["She paints", "She goes swimming", "She plays video games", "She goes hiking"]},
            {"question": "What is Sophie's hobby at home?", "answer": "Painting pictures", "options": ["Playing music", "Painting pictures", "Reading books", "Cooking"]},
            {"question": "What outdoor hobby does the man have?", "answer": "Hiking", "options": ["Swimming", "Running", "Hiking", "Cycling"]}
        ],
        "tips": ["Listen for activity words.", "Note time expressions."]
    },
    9: {  # Technology
        "title": "Buying a New Phone",
        "transcript": """
Shop assistant: Hello! Can I help you?
Customer: Yes, I want to buy a new phone.
Shop assistant: Sure! What kind of phone are you looking for?
Customer: Something simple. I mostly use it for calls and messages.
Shop assistant: Do you use the internet on your phone?
Customer: Yes, sometimes. I check my email.
Shop assistant: I recommend this model. It has a big screen.
Customer: How much is it?
Shop assistant: It's three hundred dollars.
Customer: That's expensive. Do you have something cheaper?
Shop assistant: Yes, this one is one hundred and fifty dollars.
Customer: Does it have good battery life?
Shop assistant: Yes, the battery lasts two days.
Customer: Perfect. I'll take that one.
        """.strip(),
        "questions": [
            {"question": "What does the customer mainly use the phone for?", "answer": "Calls and messages", "options": ["Games", "Calls and messages", "Taking photos", "Watching movies"]},
            {"question": "How much is the first phone?", "answer": "Three hundred dollars", "options": ["One hundred dollars", "Two hundred dollars", "Three hundred dollars", "Four hundred dollars"]},
            {"question": "How long does the cheaper phone's battery last?", "answer": "Two days", "options": ["One day", "Two days", "Three days", "One week"]}
        ],
        "tips": ["Listen for prices.", "Note technology words."]
    },
    10: {  # Environment
        "title": "Helping the Environment",
        "transcript": """
Teacher: Today we're talking about the environment. Who can tell me one way to help?
Student 1: We can recycle plastic and paper.
Teacher: Excellent! Recycling is very important. What else?
Student 2: We should save water. Don't leave the tap running.
Teacher: Very good! Any other ideas?
Student 3: We can plant trees. Trees clean the air.
Teacher: Yes! Trees are wonderful for our planet.
Student 1: My family uses cloth bags instead of plastic bags.
Teacher: That's a great habit!
Student 2: I turn off the lights when I leave a room.
Teacher: Saving electricity also helps. Small actions make a big difference!
        """.strip(),
        "questions": [
            {"question": "What is one way to save water?", "answer": "Don't leave the tap running", "options": ["Take long showers", "Don't leave the tap running", "Use a dishwasher", "Wash the car often"]},
            {"question": "Why are trees good for the planet?", "answer": "They clean the air", "options": ["They give food", "They clean the air", "They make money", "They look beautiful"]},
            {"question": "What does Student 1's family use instead of plastic bags?", "answer": "Cloth bags", "options": ["Paper bags", "Cloth bags", "No bags", "Metal bags"]}
        ],
        "tips": ["Listen for environmental vocabulary.", "Note action words."]
    },
    11: {  # Money
        "title": "At the Bank",
        "transcript": """
Bank clerk: Good morning! How can I help you?
Customer: Hi. I want to open a savings account.
Bank clerk: Certainly. Do you have identification?
Customer: Yes, here is my passport.
Bank clerk: Thank you. How much would you like to deposit?
Customer: I want to start with five hundred dollars.
Bank clerk: That's fine. Would you like a debit card?
Customer: Yes, please. How long will it take to get the card?
Bank clerk: You'll receive it in about one week.
Customer: Can I use online banking?
Bank clerk: Yes, I'll set that up for you.
Customer: Is there a fee for the account?
Bank clerk: No, this account is free.
        """.strip(),
        "questions": [
            {"question": "What does the customer want to open?", "answer": "A savings account", "options": ["A checking account", "A savings account", "A business account", "A joint account"]},
            {"question": "How much does the customer want to deposit?", "answer": "Five hundred dollars", "options": ["One hundred dollars", "Three hundred dollars", "Five hundred dollars", "One thousand dollars"]},
            {"question": "How long will it take to receive the debit card?", "answer": "About one week", "options": ["One day", "Three days", "About one week", "One month"]}
        ],
        "tips": ["Listen for money amounts.", "Note banking vocabulary."]
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
Agent: The kitchen is modern. It has a new stove.
Visitor: Is the apartment furnished?
Agent: No, it's empty. You can bring your own furniture.
Visitor: How much is the rent?
Agent: Eight hundred dollars per month.
        """.strip(),
        "questions": [
            {"question": "How many bedrooms does the apartment have?", "answer": "Two bedrooms", "options": ["One bedroom", "Two bedrooms", "Three bedrooms", "Four bedrooms"]},
            {"question": "Is the apartment furnished?", "answer": "No, it's empty", "options": ["Yes, fully furnished", "Yes, partially", "No, it's empty", "Only the bedroom"]},
            {"question": "How much is the monthly rent?", "answer": "Eight hundred dollars", "options": ["Five hundred dollars", "Six hundred dollars", "Seven hundred dollars", "Eight hundred dollars"]}
        ],
        "tips": ["Listen for room names.", "Note descriptions."]
    },
    13: {  # Transportation
        "title": "At the Train Station",
        "transcript": """
Passenger: Excuse me. What time is the next train to Manchester?
Staff: The next train leaves at eleven forty-five.
Passenger: What platform does it leave from?
Staff: Platform three. It's that way.
Passenger: How long is the journey?
Staff: About two hours and fifteen minutes.
Passenger: Is it a direct train?
Staff: No, you need to change at Birmingham.
Passenger: How long do I wait at Birmingham?
Staff: Only fifteen minutes. The connection is easy.
Passenger: How much is a return ticket?
Staff: Forty-five pounds.
Passenger: I'll take a return ticket, please.
        """.strip(),
        "questions": [
            {"question": "What time does the train leave?", "answer": "Eleven forty-five", "options": ["Eleven fifteen", "Eleven thirty", "Eleven forty-five", "Twelve o'clock"]},
            {"question": "Does the passenger need to change trains?", "answer": "Yes, at Birmingham", "options": ["No, it's direct", "Yes, at London", "Yes, at Birmingham", "Yes, at Leeds"]},
            {"question": "How much is a return ticket?", "answer": "Forty-five pounds", "options": ["Thirty pounds", "Thirty-five pounds", "Forty pounds", "Forty-five pounds"]}
        ],
        "tips": ["Listen for platform numbers.", "Note journey times and prices."]
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
        """.strip(),
        "questions": [
            {"question": "What will the weather be like in the morning?", "answer": "Cloudy with light rain", "options": ["Sunny and warm", "Cloudy with light rain", "Very cold", "Snowing"]},
            {"question": "What temperature is expected in the afternoon?", "answer": "About twenty degrees", "options": ["Fifteen degrees", "About twenty degrees", "Twenty-five degrees", "Thirty degrees"]},
            {"question": "What will the weather be like on Saturday?", "answer": "Warm and sunny", "options": ["Rainy", "Cold and windy", "Warm and sunny", "Cloudy"]}
        ],
        "tips": ["Listen for weather words.", "Note temperature numbers."]
    }
}

BEGINNER_LESSONS = [
    # Lesson 1: Family
    {
        "id": "beginner-lesson-1",
        "title": "Lesson 1: Family",
        "lesson_number": 1,
        "topic": "Family",
        "level": "beginner",
        "learning_goals": "Learn words for family and how to use the verb 'to be'.",
        "vocabulary": [
            {"word": "Parents", "meaning": "Father and mother", "example": "My parents live in a big house."},
            {"word": "Siblings", "meaning": "Brothers and sisters", "example": "I have two siblings."},
            {"word": "Relative", "meaning": "A person in your family", "example": "My aunt is a nice relative."},
            {"word": "Only child", "meaning": "A person with no brothers or sisters", "example": "I am an only child."}
        ],
        "grammar": {
            "title": "Present Simple (To Be)",
            "explanation": "Use 'am,' 'is,' or 'are' to talk about facts.",
            "example": "I am a student."
        },
        "reading": {
            "text": "My name is Anna. I have a small family. I live with my mother and my father. My mother is a teacher. My father is a doctor. I do not have any brothers or sisters. I am an only child. We live in a small apartment. My grandmother lives near us. We see her every Sunday. We eat dinner together. My family is very kind. We like to talk and laugh. Family is very important to me. I love my parents very much.",
            "questions": [
                {"question": "Is Anna's family big?", "answer": "No, Anna has a small family."},
                {"question": "What does her father do?", "answer": "Her father is a doctor."}
            ]
        },
        "speaking": {
            "question": "Do you have a large family?",
            "model_answer": "No, I have a small family. There are four people."
        },
        "writing": {
            "task": "Write three sentences about your family.",
            "model_answer": "My family is small. I have one brother. We live in a city."
        },
        "common_mistake": {
            "wrong": "I have 20 years old.",
            "correct": "I am 20 years old."
        }
    },
    # Lesson 2: Daily Life
    {
        "id": "beginner-lesson-2",
        "title": "Lesson 2: Daily Life",
        "lesson_number": 2,
        "topic": "Daily Life",
        "level": "beginner",
        "learning_goals": "Talk about your day using the Present Simple.",
        "vocabulary": [
            {"word": "Routine", "meaning": "Things you do every day", "example": "My daily routine is the same."},
            {"word": "Wake up", "meaning": "To stop sleeping", "example": "I wake up at 6:00 AM."},
            {"word": "Breakfast", "meaning": "The first meal of the day", "example": "I eat eggs for breakfast."},
            {"word": "Relax", "meaning": "To rest", "example": "I relax on the sofa."}
        ],
        "grammar": {
            "title": "Present Simple",
            "explanation": "Use this for things you do every day.",
            "example": "I walk to school."
        },
        "reading": {
            "text": "Every day, I wake up early. I wake up at seven o'clock. First, I wash my face. Then, I eat breakfast. I usually eat bread and drink tea. After breakfast, I go to work. I take the bus to my office. I work from nine to five. I am very busy. At noon, I eat lunch with my friends. We talk about our day. I go home at six o'clock. I cook dinner for my family. After dinner, I watch TV or read a book. I go to bed at ten o'clock. This is my daily routine.",
            "questions": [
                {"question": "What time does the person wake up?", "answer": "The person wakes up at seven o'clock."},
                {"question": "What does the person do after dinner?", "answer": "The person watches TV or reads a book."}
            ]
        },
        "speaking": {
            "question": "What do you do in the morning?",
            "model_answer": "I wake up and drink coffee. Then I go to school."
        },
        "writing": {
            "task": "Write a short paragraph about your morning.",
            "model_answer": "I wake up at 7 AM. I brush my teeth. I eat breakfast at 8 AM."
        },
        "common_mistake": {
            "wrong": "He go to school.",
            "correct": "He goes to school."
        }
    },
    # Lesson 3: Food
    {
        "id": "beginner-lesson-3",
        "title": "Lesson 3: Food",
        "lesson_number": 3,
        "topic": "Food",
        "level": "beginner",
        "learning_goals": "Learn words for food and how to say what you like.",
        "vocabulary": [
            {"word": "Healthy", "meaning": "Good for your body", "example": "Fruit is a healthy food."},
            {"word": "Delicious", "meaning": "Very good taste", "example": "This cake is delicious."},
            {"word": "Meal", "meaning": "Food you eat at one time", "example": "Dinner is my favorite meal."},
            {"word": "Vegetable", "meaning": "A plant you eat", "example": "I like green vegetables."}
        ],
        "grammar": {
            "title": "Basic Sentence Structure",
            "explanation": "A sentence needs a Subject + Verb + Object.",
            "example": "I (S) like (V) apples (O)."
        },
        "reading": {
            "text": "Food is very important for our health. Many people like to eat healthy food. Healthy food gives us energy. Fruit and vegetables are very good for you. You should eat them every day. Some people like to eat meat or fish. Other people do not eat meat. They are called vegetarians. Fast food is popular but it is not very healthy. Pizza and burgers have a lot of salt and fat. It is better to cook at home. When you cook at home, you know what is in your food. I like to cook pasta for my friends. It is easy and delicious.",
            "questions": [
                {"question": "Why is healthy food good?", "answer": "Healthy food gives us energy."},
                {"question": "Is fast food healthy?", "answer": "No, fast food is not very healthy."}
            ]
        },
        "speaking": {
            "question": "What is your favorite food?",
            "model_answer": "My favorite food is rice. I eat it every day."
        },
        "writing": {
            "task": "Write about a food you like.",
            "model_answer": "I like pizza. It is very delicious. I eat it on Fridays."
        },
        "common_mistake": {
            "wrong": "I like very much pizza.",
            "correct": "I like pizza very much."
        }
    },
    # Lesson 4: Work
    {
        "id": "beginner-lesson-4",
        "title": "Lesson 4: Work",
        "lesson_number": 4,
        "topic": "Work",
        "level": "beginner",
        "learning_goals": "Talk about jobs and the workplace.",
        "vocabulary": [
            {"word": "Company", "meaning": "A business", "example": "I work for a big company."},
            {"word": "Colleague", "meaning": "A person you work with", "example": "My colleagues are very helpful."},
            {"word": "Salary", "meaning": "Money from a job", "example": "I get my salary every month."},
            {"word": "Office", "meaning": "A place where people work", "example": "My office is in the city."}
        ],
        "grammar": {
            "title": "Present Simple (Negative)",
            "explanation": "Use 'do not' or 'does not' to say 'no'.",
            "example": "I do not like my job."
        },
        "reading": {
            "text": "Many people go to work every day. Some people work in an office. They sit at a desk and use a computer. Other people work outside. For example, farmers work on a farm. They grow food for us. Doctors and nurses work in a hospital. They help people who are sick. Teachers work in a school. They help students learn new things. My brother is a waiter. He works in a restaurant. He is very busy on weekends. He talks to many customers. Work can be hard, but it is important. We need work to earn money. Money helps us buy things we need.",
            "questions": [
                {"question": "Where do doctors work?", "answer": "Doctors work in a hospital."},
                {"question": "Why is work important?", "answer": "We need work to earn money."}
            ]
        },
        "speaking": {
            "question": "Do you have a job?",
            "model_answer": "Yes, I am a teacher. I work at a school."
        },
        "writing": {
            "task": "Write two sentences about a job you want.",
            "model_answer": "I want to be a doctor. I want to help sick people."
        },
        "common_mistake": {
            "wrong": "She work in an office.",
            "correct": "She works in an office."
        }
    },
    # Lesson 5: Education
    {
        "id": "beginner-lesson-5",
        "title": "Lesson 5: Education",
        "lesson_number": 5,
        "topic": "Education",
        "level": "beginner",
        "learning_goals": "Use words for school and learning.",
        "vocabulary": [
            {"word": "Subject", "meaning": "A thing you study", "example": "Math is my favorite subject."},
            {"word": "Exam", "meaning": "A big test", "example": "I have a difficult exam today."},
            {"word": "University", "meaning": "School after high school", "example": "She studies at a university."},
            {"word": "Library", "meaning": "A place with many books", "example": "I study in the library."}
        ],
        "grammar": {
            "title": "Basic Future (Will)",
            "explanation": "Use 'will' to talk about the future.",
            "example": "I will study tonight."
        },
        "reading": {
            "text": "Education is very important for children. Children go to school to learn. They study many subjects like English and math. They also learn how to play with other children. Some students go to university after school. University is a place for higher learning. Students choose one subject to study deeply. For example, they can study science or history. Learning is not just for children. Adults can also learn new skills. They can take classes online or at a college. I am learning English now. It is a very useful language. I hope I will speak English well in the future. I study every day.",
            "questions": [
                {"question": "What subjects do children study?", "answer": "Children study many subjects like English and math."},
                {"question": "Where can adults learn new skills?", "answer": "Adults can take classes online or at a college."}
            ]
        },
        "speaking": {
            "question": "What was your favorite subject in school?",
            "model_answer": "My favorite subject was Art. I like to draw."
        },
        "writing": {
            "task": "Write three sentences about your school.",
            "model_answer": "My school is very big. It has many classrooms. The teachers are kind."
        },
        "common_mistake": {
            "wrong": "I study in the school.",
            "correct": "I study at school."
        }
    },
    # Lesson 6: Travel
    {
        "id": "beginner-lesson-6",
        "title": "Lesson 6: Travel",
        "lesson_number": 6,
        "topic": "Travel",
        "level": "beginner",
        "learning_goals": "Talk about past trips and vacations.",
        "vocabulary": [
            {"word": "Vacation", "meaning": "Time away from work", "example": "I am on vacation this week."},
            {"word": "Luggage", "meaning": "Bags for travel", "example": "I have two pieces of luggage."},
            {"word": "Destination", "meaning": "The place you are going", "example": "Paris is a famous destination."},
            {"word": "Passport", "meaning": "A book for travel", "example": "Do not forget your passport."}
        ],
        "grammar": {
            "title": "Past Simple",
            "explanation": "Use this for things that finished in the past.",
            "example": "I visited London."
        },
        "reading": {
            "text": "Last year, I went on a trip to the mountains. I went with my best friend. We traveled by train. The journey was very long but beautiful. We saw many trees and rivers. When we arrived, the air was cold and fresh. We stayed in a small hotel. Every morning, we walked in the forest. We saw some beautiful birds. In the evening, we ate local food at a restaurant. The people were very friendly. We took many photos of the mountains. I felt very happy and relaxed. It was a great vacation. I want to go back there again next year.",
            "questions": [
                {"question": "How did they travel to the mountains?", "answer": "They traveled by train."},
                {"question": "Where did they stay?", "answer": "They stayed in a small hotel."}
            ]
        },
        "speaking": {
            "question": "Do you like to travel?",
            "model_answer": "Yes, I love to travel. I like to see new places."
        },
        "writing": {
            "task": "Write about your last holiday.",
            "model_answer": "Last summer, I went to the beach. I swam in the sea. It was fun."
        },
        "common_mistake": {
            "wrong": "I go to the park yesterday.",
            "correct": "I went to the park yesterday."
        }
    },
    # Lesson 7: Health
    {
        "id": "beginner-lesson-7",
        "title": "Lesson 7: Health",
        "lesson_number": 7,
        "topic": "Health",
        "level": "beginner",
        "learning_goals": "Talk about staying healthy and seeing a doctor.",
        "vocabulary": [
            {"word": "Exercise", "meaning": "To move your body", "example": "I exercise every morning."},
            {"word": "Sick", "meaning": "Not feeling well", "example": "I feel sick today."},
            {"word": "Medicine", "meaning": "Something to help you feel better", "example": "I need to take my medicine."},
            {"word": "Hospital", "meaning": "A place for sick people", "example": "The hospital is near the park."}
        ],
        "grammar": {
            "title": "Basic Future (Going to)",
            "explanation": "Use 'going to' for plans.",
            "example": "I am going to join a gym."
        },
        "reading": {
            "text": "It is important to take care of your health. To stay healthy, you should eat good food. You should also exercise. Walking and running are good for your heart. Some people go to the gym to lift weights. Sleep is also very important for health. You should sleep for eight hours every night. If you feel sick, you should see a doctor. The doctor will give you medicine. Sometimes, you need to go to the hospital. Drinking water is also good for your body. Do not drink too much soda. Soda has a lot of sugar. Sugar can be bad for your teeth and your body.",
            "questions": [
                {"question": "What should you do if you feel sick?", "answer": "You should see a doctor."},
                {"question": "How many hours should you sleep?", "answer": "You should sleep for eight hours."}
            ]
        },
        "speaking": {
            "question": "What do you do to stay healthy?",
            "model_answer": "I eat fruit and I walk every day."
        },
        "writing": {
            "task": "Write two sentences about exercise.",
            "model_answer": "I like to play football. It is good exercise."
        },
        "common_mistake": {
            "wrong": "I am a headache.",
            "correct": "I have a headache."
        }
    },
    # Lesson 8: Hobbies
    {
        "id": "beginner-lesson-8",
        "title": "Lesson 8: Hobbies",
        "lesson_number": 8,
        "topic": "Hobbies",
        "level": "beginner",
        "learning_goals": "Describe activities you do for fun.",
        "vocabulary": [
            {"word": "Hobby", "meaning": "Something you do for fun", "example": "My hobby is reading."},
            {"word": "Free time", "meaning": "Time when you do not work", "example": "I listen to music in my free time."},
            {"word": "Join", "meaning": "To become a member", "example": "I want to join a book club."},
            {"word": "Collect", "meaning": "To keep things together", "example": "I collect old coins."}
        ],
        "grammar": {
            "title": "Basic Sentence Structure (Likes)",
            "explanation": "Use 'Subject + like + (verb + ing)'.",
            "example": "I like swimming."
        },
        "reading": {
            "text": "Hobbies are activities we do for fun. They help us relax after work or school. There are many kinds of hobbies. Some people like quiet hobbies. For example, they like reading books or painting. Other people like active hobbies. They play sports like basketball or tennis. Some people have creative hobbies. They like to cook new recipes or play an instrument. I have a few hobbies. I love listening to music. It makes me feel happy. I also like gardening. I have many flowers in my garden. Hobbies are a good way to meet new friends. You can join a club and meet people with the same interests.",
            "questions": [
                {"question": "What is a quiet hobby?", "answer": "Reading books or painting are quiet hobbies."},
                {"question": "Why are hobbies good?", "answer": "Hobbies help us relax and meet new friends."}
            ]
        },
        "speaking": {
            "question": "What do you do in your free time?",
            "model_answer": "I like to play video games with my friends."
        },
        "writing": {
            "task": "Write about your favorite hobby.",
            "model_answer": "My favorite hobby is photography. I take many pictures of nature."
        },
        "common_mistake": {
            "wrong": "I like play soccer.",
            "correct": "I like playing soccer."
        }
    },
    # Lesson 9: Technology
    {
        "id": "beginner-lesson-9",
        "title": "Lesson 9: Technology",
        "lesson_number": 9,
        "topic": "Technology",
        "level": "beginner",
        "learning_goals": "Learn basic words for gadgets and the internet.",
        "vocabulary": [
            {"word": "Smartphone", "meaning": "A phone with internet", "example": "I use my smartphone for maps."},
            {"word": "Website", "meaning": "A page on the internet", "example": "This is a very useful website."},
            {"word": "Laptop", "meaning": "A small computer", "example": "I take my laptop to school."},
            {"word": "Online", "meaning": "Connected to the internet", "example": "I like to shop online."}
        ],
        "grammar": {
            "title": "Present Simple (General Facts)",
            "explanation": "Use this for things that are always true.",
            "example": "Technology changes quickly."
        },
        "reading": {
            "text": "Technology is all around us. Most people use a smartphone every day. We use phones to talk to friends and family. We also use them to browse the internet. The internet has a lot of information. You can find answers to almost any question. Many people use computers for work and study. Laptops are popular because you can carry them easily. Some people like to play games online. Other people like to watch movies on their tablets. Technology makes our lives easier. We can send messages in a second. We can also buy things without leaving our house. However, we should not use technology too much. It is important to spend time outside too.",
            "questions": [
                {"question": "Why are laptops popular?", "answer": "Laptops are popular because you can carry them easily."},
                {"question": "What can you find on the internet?", "answer": "You can find answers to almost any question."}
            ]
        },
        "speaking": {
            "question": "How often do you use the internet?",
            "model_answer": "I use the internet every day for my studies."
        },
        "writing": {
            "task": "Write two sentences about your phone.",
            "model_answer": "My phone is new. I use it to take photos."
        },
        "common_mistake": {
            "wrong": "I lost my handphone.",
            "correct": "I lost my phone."
        }
    },
    # Lesson 10: Environment
    {
        "id": "beginner-lesson-10",
        "title": "Lesson 10: Environment",
        "lesson_number": 10,
        "topic": "Environment",
        "level": "beginner",
        "learning_goals": "Use very simple words to talk about nature.",
        "vocabulary": [
            {"word": "Nature", "meaning": "Trees, animals, and rivers", "example": "I love walking in nature."},
            {"word": "Pollution", "meaning": "Dirty air or water", "example": "Pollution is bad for the earth."},
            {"word": "Recycle", "meaning": "To use things again", "example": "I recycle paper and plastic."},
            {"word": "Planet", "meaning": "The world (Earth)", "example": "We must save our planet."}
        ],
        "grammar": {
            "title": "Present Simple (Commands/Rules)",
            "explanation": "Use the base verb to give simple advice.",
            "example": "Protect the trees."
        },
        "reading": {
            "text": "The environment is the world around us. It includes the air, the water, and the land. We need a clean environment to stay healthy. Today, there are some problems with our environment. Pollution makes the air dirty. This is bad for our lungs. There is also a lot of trash in the ocean. This is bad for the fish. We can help the environment in simple ways. We can recycle our plastic bottles. We can also save water at home. Do not leave the water running when you brush your teeth. We should also plant more trees. Trees make the air clean and fresh. If everyone helps, we can keep our planet beautiful.",
            "questions": [
                {"question": "Why is pollution bad?", "answer": "Pollution makes the air dirty and is bad for our lungs."},
                {"question": "How can we save water?", "answer": "Do not leave the water running when you brush your teeth."}
            ]
        },
        "speaking": {
            "question": "Do you like nature?",
            "model_answer": "Yes, I like nature. I like to see trees and flowers."
        },
        "writing": {
            "task": "Write about one thing you do to help the earth.",
            "model_answer": "I do not use plastic bags. I use a cloth bag."
        },
        "common_mistake": {
            "wrong": "The nature is beautiful.",
            "correct": "Nature is beautiful."
        }
    },
    # Lesson 11: Money
    {
        "id": "beginner-lesson-11",
        "title": "Lesson 11: Money",
        "lesson_number": 11,
        "topic": "Money",
        "level": "beginner",
        "learning_goals": "Talk about buying things and costs.",
        "vocabulary": [
            {"word": "Price", "meaning": "How much something costs", "example": "The price of this book is $10."},
            {"word": "Cash", "meaning": "Paper money or coins", "example": "I pay with cash."},
            {"word": "Expensive", "meaning": "Costs a lot of money", "example": "That car is very expensive."},
            {"word": "Cheap", "meaning": "Costs a little money", "example": "This shirt is very cheap."}
        ],
        "grammar": {
            "title": "Present Simple (Questions)",
            "explanation": "Use 'Do' or 'Does' for questions.",
            "example": "Does it cost a lot?"
        },
        "reading": {
            "text": "We use money to buy things we need and want. We need money for food, clothes, and a house. Most people earn money by working. They get a salary every month. Some things are very expensive. For example, a big house or a new car costs a lot of money. Other things are cheap, like a pen or a piece of fruit. It is important to save money. You should not spend all your money at once. Many people put their money in a bank. A bank is a safe place for money. When you go shopping, you can pay with cash or a card. I like to look for sales. Sales help me buy things at a lower price.",
            "questions": [
                {"question": "Where do people put their money?", "answer": "Many people put their money in a bank."},
                {"question": "How can you buy things at a lower price?", "answer": "You can look for sales."}
            ]
        },
        "speaking": {
            "question": "Do you like shopping?",
            "model_answer": "Yes, I like shopping for clothes on weekends."
        },
        "writing": {
            "task": "Write two sentences about a bank.",
            "model_answer": "A bank is a safe place. I keep my money there."
        },
        "common_mistake": {
            "wrong": "It's more cheap.",
            "correct": "It's cheaper."
        }
    },
    # Lesson 12: Housing
    {
        "id": "beginner-lesson-12",
        "title": "Lesson 12: Housing",
        "lesson_number": 12,
        "topic": "Housing",
        "level": "beginner",
        "learning_goals": "Describe your home and furniture.",
        "vocabulary": [
            {"word": "Apartment", "meaning": "A home in a big building", "example": "I live in a small apartment."},
            {"word": "Kitchen", "meaning": "The room where you cook", "example": "My kitchen is very clean."},
            {"word": "Neighbor", "meaning": "A person who lives near you", "example": "My neighbor is very quiet."},
            {"word": "Furniture", "meaning": "Tables, chairs, and beds", "example": "I need to buy new furniture."}
        ],
        "grammar": {
            "title": "There is / There are",
            "explanation": "Use 'There is' for one thing. Use 'There are' for many things.",
            "example": "There are three chairs."
        },
        "reading": {
            "text": "Everyone needs a place to live. Some people live in a house. Houses often have a garden and a garage. Other people live in an apartment. Apartments are usually in the city. My home is a small apartment on the third floor. It has two bedrooms, a kitchen, and a living room. My favorite room is the living room. It has a big sofa and a TV. I like to relax there after work. My kitchen is small but I like to cook there. I have very nice neighbors. We always say hello to each other. I like my home because it is cozy and warm. It is a good place to rest.",
            "questions": [
                {"question": "What floor is the apartment on?", "answer": "The apartment is on the third floor."},
                {"question": "What is in the living room?", "answer": "There is a big sofa and a TV."}
            ]
        },
        "speaking": {
            "question": "Do you live in a house or an apartment?",
            "model_answer": "I live in a house. It has a small garden."
        },
        "writing": {
            "task": "Write three sentences about your bedroom.",
            "model_answer": "My bedroom is small. It has a bed and a desk. I sleep there."
        },
        "common_mistake": {
            "wrong": "There is many people.",
            "correct": "There are many people."
        }
    },
    # Lesson 13: Transportation
    {
        "id": "beginner-lesson-13",
        "title": "Lesson 13: Transportation",
        "lesson_number": 13,
        "topic": "Transportation",
        "level": "beginner",
        "learning_goals": "Talk about how you move from place to place.",
        "vocabulary": [
            {"word": "Vehicle", "meaning": "A car, truck, or bus", "example": "A car is a common vehicle."},
            {"word": "Passenger", "meaning": "A person in a bus or train", "example": "The bus has many passengers."},
            {"word": "Traffic", "meaning": "Many cars on the road", "example": "The traffic is very slow today."},
            {"word": "Bicycle", "meaning": "A vehicle with two wheels", "example": "I ride my bicycle to work."}
        ],
        "grammar": {
            "title": "Present Continuous",
            "explanation": "Use 'am/is/are + verb + ing' for things happening now.",
            "example": "The bus is coming."
        },
        "reading": {
            "text": "There are many ways to travel in a city. Many people use a car. Cars are comfortable but they can be expensive. In big cities, there is often a lot of traffic. This means cars move very slowly. Many people prefer to use public transportation. They take the bus or the train. Trains are usually very fast. Some cities have a subway system. This is a train that goes under the ground. If the weather is nice, some people like to walk. Walking is healthy and free. Other people ride a bicycle. Bicycles are good for the environment because they do not make pollution. I usually take the bus to my office. It is easy and cheap.",
            "questions": [
                {"question": "Why are bicycles good for the environment?", "answer": "Bicycles do not make pollution."},
                {"question": "What is a subway?", "answer": "A subway is a train that goes under the ground."}
            ]
        },
        "speaking": {
            "question": "How do you go to school?",
            "model_answer": "I go to school by bus. It takes twenty minutes."
        },
        "writing": {
            "task": "Write about how you like to travel.",
            "model_answer": "I like to travel by train. I can see the trees."
        },
        "common_mistake": {
            "wrong": "I go with bus.",
            "correct": "I go by bus."
        }
    },
    # Lesson 14: Weather
    {
        "id": "beginner-lesson-14",
        "title": "Lesson 14: Weather",
        "lesson_number": 14,
        "topic": "Weather",
        "level": "beginner",
        "learning_goals": "Describe the weather and seasons.",
        "vocabulary": [
            {"word": "Sunny", "meaning": "When the sun is shining", "example": "It is a sunny day today."},
            {"word": "Cloudy", "meaning": "When there are many clouds", "example": "The sky is very cloudy."},
            {"word": "Season", "meaning": "Summer, winter, spring, fall", "example": "Winter is my favorite season."},
            {"word": "Temperature", "meaning": "How hot or cold it is", "example": "The temperature is very high."}
        ],
        "grammar": {
            "title": "It is + Adjective",
            "explanation": "Use 'It is' to talk about the weather.",
            "example": "It is cold today."
        },
        "reading": {
            "text": "The weather changes every day. Sometimes it is sunny and warm. People like to go outside when it is sunny. They go to the park or the beach. Sometimes it is rainy and cold. When it rains, we use an umbrella. In some places, it snows in the winter. The ground becomes white and beautiful. There are four seasons in a year. They are spring, summer, autumn, and winter. In summer, the days are long and the temperature is hot. In winter, the days are short and it is very cold. My favorite season is spring. In spring, the flowers start to grow. The weather is not too hot and not too cold. It is a very beautiful time of year.",
            "questions": [
                {"question": "What do people use when it rains?", "answer": "People use an umbrella."},
                {"question": "What are the four seasons?", "answer": "The four seasons are spring, summer, autumn, and winter."}
            ]
        },
        "speaking": {
            "question": "What is the weather like today?",
            "model_answer": "It is very hot and sunny today."
        },
        "writing": {
            "task": "Write two sentences about your favorite weather.",
            "model_answer": "I like rainy weather. I stay home and read."
        },
        "common_mistake": {
            "wrong": "It is very sun.",
            "correct": "It is very sunny."
        }
    }
]

async def seed_beginner_lessons():
    """Seed the beginner English lessons into MongoDB"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check if lessons already exist
    existing = await db.beginner_english_lessons.count_documents({})
    if existing > 0:
        print(f"Found {existing} existing beginner lessons. Clearing and re-seeding...")
        await db.beginner_english_lessons.delete_many({})
    
    # Insert all lessons
    result = await db.beginner_english_lessons.insert_many(BEGINNER_LESSONS)
    print(f"Successfully seeded {len(result.inserted_ids)} beginner English lessons!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_beginner_lessons())
