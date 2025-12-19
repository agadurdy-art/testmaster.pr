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
