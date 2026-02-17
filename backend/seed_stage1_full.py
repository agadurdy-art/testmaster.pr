"""
TESTMASTER: STAGE 1 COMPLETE CURRICULUM SEED (V3)
12 Units × 4 Lessons = 48 Lessons with UNIQUE content per lesson
Each lesson has a pedagogical progression:
  L1: Meet the Words (first 3 words + rule 1)
  L2: Practice Time (last 3 words + rule 2)
  L3: Read and Learn (all words combined, deeper reading)
  L4: Review and Speak (review all, challenge questions)
"""
import asyncio
import os
import random
import re
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

TS = datetime.now(timezone.utc).isoformat()

# ══════════════════════════════════════════
# UNIT DEFINITIONS - 12 Units for Stage 1
# Each unit has 4 reading passages, 4 listening scripts
# ══════════════════════════════════════════

UNITS = [
    {
        "num": 1, "substage": "A", "title": "Hello!", "theme": "Greetings & Introductions",
        "phonics": "Letters A, B, C, D, E", "color": "#FF6B6B",
        "grammar": "I am... / Hello!",
        "words": [
            {"word": "hello", "ipa": "/həˈləʊ/", "definition": "A greeting when you meet someone", "example": "Hello! How are you?", "emoji": "👋"},
            {"word": "teacher", "ipa": "/ˈtiːtʃər/", "definition": "A person who teaches students", "example": "The teacher is kind.", "emoji": "👨‍🏫"},
            {"word": "student", "ipa": "/ˈstjuːdənt/", "definition": "A person who learns at school", "example": "I am a student.", "emoji": "🎒"},
            {"word": "apple", "ipa": "/ˈæpəl/", "definition": "A round red or green fruit", "example": "I have an apple.", "emoji": "🍎"},
            {"word": "ball", "ipa": "/bɔːl/", "definition": "A round object used in games", "example": "The ball is red.", "emoji": "⚽"},
            {"word": "cat", "ipa": "/kæt/", "definition": "A small furry pet animal", "example": "The cat is sleeping.", "emoji": "🐱"},
        ],
        "grammar_rules": [
            {"rule": "I am + name", "explanation": "Use 'I am' to introduce yourself.", "examples": ["I am Tom.", "I am a student."], "pattern": "I am ___"},
            {"rule": "Hello! / Hi!", "explanation": "Use 'Hello' or 'Hi' to greet someone.", "examples": ["Hello, teacher!", "Hi, friend!"], "pattern": "Hello, ___!"},
        ],
        "readings": [
            {"passage": "Hello! I am Tom. I am a student. My teacher says hello every morning. Hello, teacher!", "questions": [
                {"q": "Who is Tom?", "options": ["A teacher", "A student", "A cat", "An apple"], "answer": "A student"},
                {"q": "Who does Tom say hello to?", "options": ["His cat", "His teacher", "His ball", "His apple"], "answer": "His teacher"},
            ]},
            {"passage": "I have an apple. The apple is red. I also have a ball. The ball is big. My cat likes the ball!", "questions": [
                {"q": "What color is the apple?", "options": ["Green", "Yellow", "Red", "Blue"], "answer": "Red"},
                {"q": "Who likes the ball?", "options": ["The teacher", "The student", "The cat", "Tom"], "answer": "The cat"},
            ]},
            {"passage": "Hello! My name is Tom. I am a student. I have a red apple and a ball. My teacher is kind. I have a cat. The cat is cute!", "questions": [
                {"q": "What is the student's name?", "options": ["Tom", "Sam", "Ben", "Ali"], "answer": "Tom"},
                {"q": "What does Tom have?", "options": ["A dog and a fish", "An apple and a ball", "A pen and a book", "A hat and a bag"], "answer": "An apple and a ball"},
                {"q": "How is the teacher?", "options": ["Tall", "Kind", "Angry", "Sleepy"], "answer": "Kind"},
            ]},
            {"passage": "I am Tom. Hello, everyone! I am a student. My teacher is Ms. Brown. She is kind. I have a cat, an apple, and a ball. I like school!", "questions": [
                {"q": "Who is Ms. Brown?", "options": ["A student", "A teacher", "A cat", "A friend"], "answer": "A teacher"},
                {"q": "Does Tom like school?", "options": ["Yes", "No", "Maybe", "We don't know"], "answer": "Yes"},
                {"q": "How many things does Tom have?", "options": ["One", "Two", "Three", "Four"], "answer": "Three"},
            ]},
        ],
        "listenings": [
            {"script": "Hello! I am your teacher. Welcome to class. Say hello to your friends!", "questions": [
                {"q": "Who is speaking?", "options": ["A student", "A teacher", "A cat", "A friend"], "answer": "A teacher"},
                {"q": "What should you say to your friends?", "options": ["Goodbye", "Hello", "Sorry", "Thank you"], "answer": "Hello"},
            ]},
            {"script": "I have a red apple. I also have a ball. My cat wants to play with the ball.", "questions": [
                {"q": "What color is the apple?", "options": ["Blue", "Green", "Red", "Yellow"], "answer": "Red"},
                {"q": "What does the cat want?", "options": ["The apple", "To play with the ball", "To sleep", "Food"], "answer": "To play with the ball"},
            ]},
            {"script": "Tom is a student. He says hello to his teacher every day. His teacher is kind and says hello back.", "questions": [
                {"q": "What does Tom do every day?", "options": ["Plays ball", "Says hello to his teacher", "Eats an apple", "Plays with his cat"], "answer": "Says hello to his teacher"},
                {"q": "How is the teacher?", "options": ["Angry", "Sad", "Kind", "Sleepy"], "answer": "Kind"},
            ]},
            {"script": "Hello, class! Today we learn about greetings. When you meet someone, say Hello or Hi. I am your teacher, and you are my students.", "questions": [
                {"q": "What do you say when you meet someone?", "options": ["Goodbye", "Sorry", "Hello or Hi", "Thank you"], "answer": "Hello or Hi"},
                {"q": "Who are the listeners?", "options": ["Teachers", "Students", "Cats", "Friends"], "answer": "Students"},
            ]},
        ],
    },
    {
        "num": 2, "substage": "A", "title": "Friends", "theme": "Making Friends",
        "phonics": "Letters F, G, H, I, J", "color": "#4ECDC4",
        "grammar": "What is your name?",
        "words": [
            {"word": "name", "ipa": "/neɪm/", "definition": "What someone is called", "example": "My name is Sara.", "emoji": "📛"},
            {"word": "friend", "ipa": "/frend/", "definition": "A person you like and trust", "example": "She is my friend.", "emoji": "🤝"},
            {"word": "boy", "ipa": "/bɔɪ/", "definition": "A male child", "example": "The boy is happy.", "emoji": "👦"},
            {"word": "girl", "ipa": "/ɡɜːrl/", "definition": "A female child", "example": "The girl is my friend.", "emoji": "👧"},
            {"word": "fish", "ipa": "/fɪʃ/", "definition": "An animal that lives in water", "example": "I like fish.", "emoji": "🐟"},
            {"word": "hat", "ipa": "/hæt/", "definition": "Something you wear on your head", "example": "The hat is blue.", "emoji": "🎩"},
        ],
        "grammar_rules": [
            {"rule": "What is your name?", "explanation": "Ask someone's name with this question.", "examples": ["What is your name?", "My name is Sara."], "pattern": "What is your ___?"},
            {"rule": "My name is...", "explanation": "Use 'My name is' to tell your name.", "examples": ["My name is Tom.", "My name is Ali."], "pattern": "My name is ___"},
        ],
        "readings": [
            {"passage": "My name is Sara. I am a girl. I have a friend. His name is Tom. Tom is a boy.", "questions": [
                {"q": "Is Sara a boy or a girl?", "options": ["A boy", "A girl", "A teacher", "A baby"], "answer": "A girl"},
                {"q": "What is Sara's friend's name?", "options": ["Ali", "Tom", "Sam", "Ben"], "answer": "Tom"},
            ]},
            {"passage": "I have a fish. The fish is in water. I also have a hat. The hat is blue. My friend likes my hat.", "questions": [
                {"q": "Where is the fish?", "options": ["On the table", "In water", "In a hat", "On the floor"], "answer": "In water"},
                {"q": "What color is the hat?", "options": ["Red", "Green", "Blue", "Yellow"], "answer": "Blue"},
            ]},
            {"passage": "Hi! My name is Sara. I am a girl. Tom is a boy. Tom is my friend. I have a fish. Tom has a hat. The hat is blue. We are happy!", "questions": [
                {"q": "Who is Tom?", "options": ["Sara's teacher", "Sara's friend", "Sara's brother", "Sara's father"], "answer": "Sara's friend"},
                {"q": "What does Tom have?", "options": ["A fish", "A cat", "A hat", "A ball"], "answer": "A hat"},
                {"q": "How are Sara and Tom?", "options": ["Sad", "Angry", "Happy", "Sleepy"], "answer": "Happy"},
            ]},
            {"passage": "What is your name? My name is Ali. I am a boy. Sara is a girl. She is my friend. We have a fish and a hat. The fish is small. The hat is big!", "questions": [
                {"q": "Who is Ali?", "options": ["A girl", "A boy", "A fish", "A teacher"], "answer": "A boy"},
                {"q": "What is small?", "options": ["The hat", "The fish", "The boy", "The girl"], "answer": "The fish"},
                {"q": "Is the hat big or small?", "options": ["Big", "Small", "Blue", "Red"], "answer": "Big"},
            ]},
        ],
        "listenings": [
            {"script": "Hello! What is your name? My name is Sara. Nice to meet you, Sara!", "questions": [
                {"q": "What question is asked?", "options": ["How are you?", "What is your name?", "Where are you?", "How old are you?"], "answer": "What is your name?"},
                {"q": "What is the girl's name?", "options": ["Tom", "Ali", "Sara", "Ben"], "answer": "Sara"},
            ]},
            {"script": "I have a fish at home. My fish is orange. I also have a blue hat. I wear my hat every day.", "questions": [
                {"q": "What color is the fish?", "options": ["Blue", "Red", "Orange", "Green"], "answer": "Orange"},
                {"q": "When does the speaker wear the hat?", "options": ["Never", "Every day", "On weekends", "At night"], "answer": "Every day"},
            ]},
            {"script": "Tom is a boy. Sara is a girl. They are friends. Tom and Sara play together every day.", "questions": [
                {"q": "Who are Tom and Sara?", "options": ["Brother and sister", "Teacher and student", "Friends", "Strangers"], "answer": "Friends"},
                {"q": "What do they do every day?", "options": ["Study", "Play together", "Eat", "Sleep"], "answer": "Play together"},
            ]},
            {"script": "Hi! My name is Ben. I am a new student. What is your name? My name is Sara. Let us be friends!", "questions": [
                {"q": "Who is the new student?", "options": ["Sara", "Tom", "Ben", "Ali"], "answer": "Ben"},
                {"q": "What does Sara suggest?", "options": ["Let us study", "Let us be friends", "Let us eat", "Let us go home"], "answer": "Let us be friends"},
            ]},
        ],
    },
    {
        "num": 3, "substage": "A", "title": "Numbers", "theme": "Counting 1-10",
        "phonics": "Letters K, L, M, N, O", "color": "#45B7D1",
        "grammar": "It is (number).",
        "words": [
            {"word": "one", "ipa": "/wʌn/", "definition": "The number 1", "example": "I have one apple.", "emoji": "1️⃣"},
            {"word": "two", "ipa": "/tuː/", "definition": "The number 2", "example": "I have two hands.", "emoji": "2️⃣"},
            {"word": "three", "ipa": "/θriː/", "definition": "The number 3", "example": "Three cats are playing.", "emoji": "3️⃣"},
            {"word": "four", "ipa": "/fɔːr/", "definition": "The number 4", "example": "I have four books.", "emoji": "4️⃣"},
            {"word": "five", "ipa": "/faɪv/", "definition": "The number 5", "example": "I have five fingers.", "emoji": "5️⃣"},
            {"word": "ten", "ipa": "/ten/", "definition": "The number 10", "example": "I count to ten.", "emoji": "🔟"},
        ],
        "grammar_rules": [
            {"rule": "It is + number", "explanation": "Use 'It is' to tell a number.", "examples": ["It is one.", "It is five."], "pattern": "It is ___"},
            {"rule": "I have + number + noun", "explanation": "Use to tell how many things you have.", "examples": ["I have two hands.", "I have five fingers."], "pattern": "I have ___ ___"},
        ],
        "readings": [
            {"passage": "I can count! One, two, three. I have one apple. I have two bananas. I have three oranges.", "questions": [
                {"q": "How many apples?", "options": ["One", "Two", "Three", "Four"], "answer": "One"},
                {"q": "How many oranges?", "options": ["One", "Two", "Three", "Five"], "answer": "Three"},
            ]},
            {"passage": "Look at my hands! I have four fingers and one thumb on each hand. Four plus one is five. I have five fingers on each hand.", "questions": [
                {"q": "How many fingers on each hand?", "options": ["Three", "Four", "Five", "Ten"], "answer": "Five"},
                {"q": "What is four plus one?", "options": ["Three", "Four", "Five", "Six"], "answer": "Five"},
            ]},
            {"passage": "Let us count everything! I have one nose, two eyes, two ears, and one mouth. That is one plus two plus two plus one. It is six!", "questions": [
                {"q": "How many eyes?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
                {"q": "What is the total count?", "options": ["Four", "Five", "Six", "Ten"], "answer": "Six"},
                {"q": "How many ears?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
            ]},
            {"passage": "My class has ten students. Five boys and five girls. We have one teacher. I count: one, two, three, four, five, six, seven, eight, nine, ten!", "questions": [
                {"q": "How many students in the class?", "options": ["Five", "Eight", "Ten", "Three"], "answer": "Ten"},
                {"q": "How many boys?", "options": ["Three", "Four", "Five", "Ten"], "answer": "Five"},
                {"q": "How many teachers?", "options": ["One", "Two", "Three", "Five"], "answer": "One"},
            ]},
        ],
        "listenings": [
            {"script": "Count with me! One, two, three! Very good! Now let us count more. One, two, three.", "questions": [
                {"q": "What number comes after two?", "options": ["One", "Three", "Four", "Five"], "answer": "Three"},
                {"q": "What are we doing?", "options": ["Singing", "Counting", "Reading", "Writing"], "answer": "Counting"},
            ]},
            {"script": "I have four books on my desk. My friend has five pencils. Four plus five is nine!", "questions": [
                {"q": "How many books are on the desk?", "options": ["Three", "Four", "Five", "Nine"], "answer": "Four"},
                {"q": "How many pencils does the friend have?", "options": ["Three", "Four", "Five", "Nine"], "answer": "Five"},
            ]},
            {"script": "How many apples are in the basket? Let me count. One, two, three, four, five. There are five apples in the basket.", "questions": [
                {"q": "Where are the apples?", "options": ["On the table", "In the basket", "In the bag", "On the tree"], "answer": "In the basket"},
                {"q": "How many apples?", "options": ["Three", "Four", "Five", "Ten"], "answer": "Five"},
            ]},
            {"script": "Today we learn numbers one to ten. Repeat after me: one, two, three, four, five, six, seven, eight, nine, ten. How many numbers is that? It is ten!", "questions": [
                {"q": "What are we learning today?", "options": ["Colors", "Animals", "Numbers", "Names"], "answer": "Numbers"},
                {"q": "How many numbers from one to ten?", "options": ["Five", "Eight", "Nine", "Ten"], "answer": "Ten"},
            ]},
        ],
    },
    {
        "num": 4, "substage": "A", "title": "Colors", "theme": "Learning Colors",
        "phonics": "Letters P, Q, R, S, T", "color": "#F7DC6F",
        "grammar": "The (noun) is (color).",
        "words": [
            {"word": "red", "ipa": "/red/", "definition": "The color of an apple or fire", "example": "The apple is red.", "emoji": "🔴"},
            {"word": "blue", "ipa": "/bluː/", "definition": "The color of the sky", "example": "The sky is blue.", "emoji": "🔵"},
            {"word": "green", "ipa": "/ɡriːn/", "definition": "The color of grass and trees", "example": "The tree is green.", "emoji": "🟢"},
            {"word": "yellow", "ipa": "/ˈjeləʊ/", "definition": "The color of the sun", "example": "The sun is yellow.", "emoji": "🟡"},
            {"word": "orange", "ipa": "/ˈɒrɪndʒ/", "definition": "A color between red and yellow", "example": "The orange is orange.", "emoji": "🟠"},
            {"word": "white", "ipa": "/waɪt/", "definition": "The color of snow", "example": "The cloud is white.", "emoji": "⚪"},
        ],
        "grammar_rules": [
            {"rule": "The noun is color", "explanation": "Describe the color of something.", "examples": ["The apple is red.", "The sky is blue."], "pattern": "The ___ is ___"},
            {"rule": "What color is it?", "explanation": "Ask about a color.", "examples": ["What color is it?", "It is green."], "pattern": "What color is ___?"},
        ],
        "readings": [
            {"passage": "Look at the sky! The sky is blue. The sun is yellow. I like blue and yellow.", "questions": [
                {"q": "What color is the sky?", "options": ["Red", "Blue", "Green", "Yellow"], "answer": "Blue"},
                {"q": "What color is the sun?", "options": ["Red", "Blue", "White", "Yellow"], "answer": "Yellow"},
            ]},
            {"passage": "I have crayons. I have an orange crayon and a white crayon. The paper is white. I draw an orange flower.", "questions": [
                {"q": "What color is the paper?", "options": ["Blue", "Yellow", "White", "Green"], "answer": "White"},
                {"q": "What color is the flower?", "options": ["Red", "Orange", "Yellow", "White"], "answer": "Orange"},
            ]},
            {"passage": "Look at the picture! The apple is red. The sky is blue. The tree is green. The sun is yellow. What color is the flower? The flower is orange!", "questions": [
                {"q": "What color is the tree?", "options": ["Red", "Blue", "Green", "Yellow"], "answer": "Green"},
                {"q": "What color is the flower?", "options": ["White", "Green", "Orange", "Red"], "answer": "Orange"},
                {"q": "How many colors are in the picture?", "options": ["Three", "Four", "Five", "Six"], "answer": "Five"},
            ]},
            {"passage": "I see a rainbow! It has red, orange, yellow, green, and blue. The clouds are white. My favorite color is green. What is your favorite color?", "questions": [
                {"q": "What does the speaker see?", "options": ["A flower", "A rainbow", "A tree", "A cat"], "answer": "A rainbow"},
                {"q": "What is the speaker's favorite color?", "options": ["Red", "Blue", "Green", "Yellow"], "answer": "Green"},
                {"q": "What color are the clouds?", "options": ["Blue", "Gray", "White", "Yellow"], "answer": "White"},
            ]},
        ],
        "listenings": [
            {"script": "The apple is red. Can you see the red apple? Red is a warm color.", "questions": [
                {"q": "What is red?", "options": ["The sky", "The apple", "The tree", "The cloud"], "answer": "The apple"},
                {"q": "What kind of color is red?", "options": ["Cold", "Warm", "Sad", "Dark"], "answer": "Warm"},
            ]},
            {"script": "Look outside! The grass is green. The sky is blue. Can you find something orange? The orange on the table is orange!", "questions": [
                {"q": "What color is the grass?", "options": ["Blue", "Green", "Yellow", "Red"], "answer": "Green"},
                {"q": "Where is the orange?", "options": ["Outside", "In the sky", "On the table", "On the grass"], "answer": "On the table"},
            ]},
            {"script": "Let us play a color game! I say a color, you point to it. Ready? Blue! Now yellow! Now red! Good job!", "questions": [
                {"q": "What game are we playing?", "options": ["A number game", "A color game", "A name game", "A word game"], "answer": "A color game"},
                {"q": "What is the first color the speaker says?", "options": ["Red", "Yellow", "Blue", "Green"], "answer": "Blue"},
            ]},
            {"script": "My room has many colors. The wall is white. My bed is blue. My chair is green. My lamp is yellow. I love my colorful room!", "questions": [
                {"q": "What color is the bed?", "options": ["White", "Blue", "Green", "Yellow"], "answer": "Blue"},
                {"q": "What color is the wall?", "options": ["White", "Blue", "Green", "Yellow"], "answer": "White"},
            ]},
        ],
    },
    {
        "num": 5, "substage": "A", "title": "My Family", "theme": "Family Members",
        "phonics": "Letters U, V, W, X, Y, Z", "color": "#AF7AC5",
        "grammar": "This is my...",
        "words": [
            {"word": "mother", "ipa": "/ˈmʌðər/", "definition": "Your female parent", "example": "This is my mother.", "emoji": "👩"},
            {"word": "father", "ipa": "/ˈfɑːðər/", "definition": "Your male parent", "example": "This is my father.", "emoji": "👨"},
            {"word": "brother", "ipa": "/ˈbrʌðər/", "definition": "A boy with the same parents as you", "example": "My brother is tall.", "emoji": "👦"},
            {"word": "sister", "ipa": "/ˈsɪstər/", "definition": "A girl with the same parents as you", "example": "My sister is kind.", "emoji": "👧"},
            {"word": "baby", "ipa": "/ˈbeɪbi/", "definition": "A very young child", "example": "The baby is sleeping.", "emoji": "👶"},
            {"word": "family", "ipa": "/ˈfæməli/", "definition": "A group of related people", "example": "I love my family.", "emoji": "👨‍👩‍👧‍👦"},
        ],
        "grammar_rules": [
            {"rule": "This is my + family member", "explanation": "Introduce your family members.", "examples": ["This is my mother.", "This is my brother."], "pattern": "This is my ___"},
            {"rule": "He/She is my...", "explanation": "Talk about family members.", "examples": ["He is my father.", "She is my sister."], "pattern": "He/She is my ___"},
        ],
        "readings": [
            {"passage": "This is my mother. Her name is Anna. This is my father. His name is John. They are my parents.", "questions": [
                {"q": "What is the mother's name?", "options": ["Sara", "Anna", "Tom", "Ali"], "answer": "Anna"},
                {"q": "What is the father's name?", "options": ["Tom", "Ali", "John", "Ben"], "answer": "John"},
            ]},
            {"passage": "I have a brother and a sister. My brother likes to play. My sister likes to read. We also have a baby. The baby sleeps a lot.", "questions": [
                {"q": "What does the brother like to do?", "options": ["Read", "Sleep", "Play", "Eat"], "answer": "Play"},
                {"q": "What does the baby do a lot?", "options": ["Play", "Read", "Eat", "Sleep"], "answer": "Sleep"},
            ]},
            {"passage": "This is my family. My mother is kind. My father is strong. I have one brother and one sister. My sister likes cats. My brother likes balls. I love my family!", "questions": [
                {"q": "How many brothers does the speaker have?", "options": ["Two", "One", "Three", "None"], "answer": "One"},
                {"q": "What does the sister like?", "options": ["Dogs", "Cats", "Fish", "Birds"], "answer": "Cats"},
                {"q": "How is the father?", "options": ["Kind", "Strong", "Tall", "Happy"], "answer": "Strong"},
            ]},
            {"passage": "My family is big. I have a mother, a father, two brothers, one sister, and a baby. That is seven people! We live in a big house. I love my big family!", "questions": [
                {"q": "How many people are in the family?", "options": ["Five", "Six", "Seven", "Eight"], "answer": "Seven"},
                {"q": "How many brothers?", "options": ["One", "Two", "Three", "None"], "answer": "Two"},
                {"q": "Where do they live?", "options": ["A small house", "A big house", "A school", "A farm"], "answer": "A big house"},
            ]},
        ],
        "listenings": [
            {"script": "This is my mother. She is kind. She makes food for us every day.", "questions": [
                {"q": "Who is kind?", "options": ["The father", "The mother", "The sister", "The brother"], "answer": "The mother"},
                {"q": "What does she do every day?", "options": ["Plays", "Reads", "Makes food", "Sleeps"], "answer": "Makes food"},
            ]},
            {"script": "My brother is five years old. My sister is three. The baby is only one year old. I am the oldest!", "questions": [
                {"q": "How old is the brother?", "options": ["One", "Three", "Five", "Ten"], "answer": "Five"},
                {"q": "Who is the youngest?", "options": ["The brother", "The sister", "The baby", "The speaker"], "answer": "The baby"},
            ]},
            {"script": "Look at this photo! This is my family. My mother, my father, my brother, my sister, and me. We are smiling!", "questions": [
                {"q": "What is the speaker showing?", "options": ["A book", "A photo", "A drawing", "A toy"], "answer": "A photo"},
                {"q": "What is the family doing?", "options": ["Crying", "Sleeping", "Smiling", "Eating"], "answer": "Smiling"},
            ]},
            {"script": "In my family, my father works. My mother works too. My sister goes to school. The baby stays at home with grandma.", "questions": [
                {"q": "Who stays at home with the baby?", "options": ["Mother", "Father", "Sister", "Grandma"], "answer": "Grandma"},
                {"q": "Does the mother work?", "options": ["Yes", "No", "Maybe", "We don't know"], "answer": "Yes"},
            ]},
        ],
    },
    {
        "num": 6, "substage": "A", "title": "My Face", "theme": "Body Parts - Face",
        "phonics": "Vowel Sounds: a, e, i, o, u", "color": "#F1948A",
        "grammar": "I have...",
        "words": [
            {"word": "eye", "ipa": "/aɪ/", "definition": "The part of your body used for seeing", "example": "I have two eyes.", "emoji": "👁️"},
            {"word": "ear", "ipa": "/ɪər/", "definition": "The part of your body used for hearing", "example": "I have two ears.", "emoji": "👂"},
            {"word": "nose", "ipa": "/nəʊz/", "definition": "The part of your face used for smelling", "example": "I have one nose.", "emoji": "👃"},
            {"word": "mouth", "ipa": "/maʊθ/", "definition": "The part of your face used for eating and talking", "example": "Open your mouth.", "emoji": "👄"},
            {"word": "face", "ipa": "/feɪs/", "definition": "The front part of your head", "example": "Wash your face.", "emoji": "😊"},
            {"word": "hair", "ipa": "/heər/", "definition": "The thin strands that grow on your head", "example": "My hair is brown.", "emoji": "💇"},
        ],
        "grammar_rules": [
            {"rule": "I have + number + body part", "explanation": "Tell about your body parts.", "examples": ["I have two eyes.", "I have one nose."], "pattern": "I have ___ ___"},
            {"rule": "My + body part + is/are", "explanation": "Describe your body parts.", "examples": ["My eyes are brown.", "My hair is long."], "pattern": "My ___ is/are ___"},
        ],
        "readings": [
            {"passage": "I have two eyes. My eyes can see many things. I have two ears. My ears can hear music.", "questions": [
                {"q": "How many eyes do you have?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
                {"q": "What can ears do?", "options": ["See", "Hear", "Smell", "Taste"], "answer": "Hear"},
            ]},
            {"passage": "I have a nose and a mouth. My nose can smell flowers. My mouth can eat food and talk. I also have hair on my head.", "questions": [
                {"q": "What can the nose do?", "options": ["Eat", "Talk", "Smell", "Hear"], "answer": "Smell"},
                {"q": "Where is the hair?", "options": ["On the arm", "On the head", "On the foot", "On the hand"], "answer": "On the head"},
            ]},
            {"passage": "Look at my face! I have two eyes. My eyes are big. I have two ears. I have one nose and one mouth. My hair is brown. I can see, hear, and talk!", "questions": [
                {"q": "How are the eyes?", "options": ["Small", "Big", "Green", "Sad"], "answer": "Big"},
                {"q": "What color is the hair?", "options": ["Black", "Brown", "Red", "Yellow"], "answer": "Brown"},
                {"q": "How many ears?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
            ]},
            {"passage": "My friend has brown eyes and black hair. I have blue eyes and yellow hair. We look different, but we are friends! Everyone has a face with two eyes, two ears, one nose, and one mouth.", "questions": [
                {"q": "What color are the friend's eyes?", "options": ["Blue", "Green", "Brown", "Black"], "answer": "Brown"},
                {"q": "How many noses does everyone have?", "options": ["One", "Two", "Three", "None"], "answer": "One"},
                {"q": "Do the friends look the same?", "options": ["Yes", "No", "Maybe", "Sometimes"], "answer": "No"},
            ]},
        ],
        "listenings": [
            {"script": "Point to your eyes. Good! Now point to your ears. Excellent! Can you point to your nose?", "questions": [
                {"q": "What should you point to first?", "options": ["Ears", "Eyes", "Nose", "Mouth"], "answer": "Eyes"},
                {"q": "What should you point to last?", "options": ["Ears", "Eyes", "Nose", "Mouth"], "answer": "Nose"},
            ]},
            {"script": "I wash my face every morning. I brush my hair. My face is clean and my hair is neat.", "questions": [
                {"q": "When does the speaker wash their face?", "options": ["At night", "Every morning", "After lunch", "Never"], "answer": "Every morning"},
                {"q": "What does the speaker do to their hair?", "options": ["Cut it", "Wash it", "Brush it", "Color it"], "answer": "Brush it"},
            ]},
            {"script": "I have two big eyes. They are brown. I have one small nose. My mouth is for eating and talking. I love my face!", "questions": [
                {"q": "What color are the eyes?", "options": ["Blue", "Green", "Brown", "Black"], "answer": "Brown"},
                {"q": "What is the mouth for?", "options": ["Seeing and hearing", "Eating and talking", "Smelling and touching", "Running and jumping"], "answer": "Eating and talking"},
            ]},
            {"script": "Draw a face! First, draw two eyes. Then draw a nose in the middle. Add a mouth below the nose. Finally, add some hair on top. Your face drawing is complete!", "questions": [
                {"q": "What do you draw first?", "options": ["Nose", "Mouth", "Eyes", "Hair"], "answer": "Eyes"},
                {"q": "Where is the nose?", "options": ["On top", "In the middle", "At the bottom", "On the side"], "answer": "In the middle"},
            ]},
        ],
    },
    {
        "num": 7, "substage": "B", "title": "My Body", "theme": "Body Parts - Body",
        "phonics": "Consonant Blends: bl, cl, fl", "color": "#85C1E9",
        "grammar": "Touch your...",
        "words": [
            {"word": "arm", "ipa": "/ɑːrm/", "definition": "The long part of your body between shoulder and hand", "example": "Raise your arm.", "emoji": "💪"},
            {"word": "leg", "ipa": "/leɡ/", "definition": "The long part of your body used for walking", "example": "I have two legs.", "emoji": "🦵"},
            {"word": "hand", "ipa": "/hænd/", "definition": "The part at the end of your arm", "example": "Clap your hands.", "emoji": "✋"},
            {"word": "foot", "ipa": "/fʊt/", "definition": "The part at the end of your leg", "example": "My foot is small.", "emoji": "🦶"},
            {"word": "finger", "ipa": "/ˈfɪŋɡər/", "definition": "The thin parts at the end of your hand", "example": "I have ten fingers.", "emoji": "☝️"},
            {"word": "shoulder", "ipa": "/ˈʃəʊldər/", "definition": "The top part of your arm where it connects to your body", "example": "Touch your shoulder.", "emoji": "🤷"},
        ],
        "grammar_rules": [
            {"rule": "Touch your + body part", "explanation": "Give commands about body parts.", "examples": ["Touch your nose.", "Touch your arm."], "pattern": "Touch your ___"},
            {"rule": "Can you + action?", "explanation": "Ask about ability.", "examples": ["Can you clap your hands?", "Can you jump?"], "pattern": "Can you ___?"},
        ],
        "readings": [
            {"passage": "I have two arms. I use my arms to carry things. I can raise my arms high. Touch your arms!", "questions": [
                {"q": "How many arms do you have?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
                {"q": "What do arms help you do?", "options": ["Walk", "Carry things", "Smell", "Hear"], "answer": "Carry things"},
            ]},
            {"passage": "I have two hands. Each hand has five fingers. I can clap my hands. I use my fingers to hold a pencil.", "questions": [
                {"q": "How many fingers on each hand?", "options": ["Three", "Four", "Five", "Ten"], "answer": "Five"},
                {"q": "What can you do with your hands?", "options": ["Run", "Clap", "Kick", "Smell"], "answer": "Clap"},
            ]},
            {"passage": "Let us play a game! Touch your head. Touch your arm. Clap your hands. Now jump with your legs! Can you touch your foot? I have two arms, two legs, two hands, and two feet. I have ten fingers!", "questions": [
                {"q": "How many fingers?", "options": ["Five", "Eight", "Ten", "Two"], "answer": "Ten"},
                {"q": "What do you do with your hands in the game?", "options": ["Wave", "Clap", "Touch", "Raise"], "answer": "Clap"},
                {"q": "How many feet?", "options": ["One", "Two", "Three", "Four"], "answer": "Two"},
            ]},
            {"passage": "My body is amazing! I use my legs to walk and run. I use my hands to write and draw. My shoulders help me carry my bag. My feet take me to school every day!", "questions": [
                {"q": "What do you use legs for?", "options": ["Writing", "Carrying", "Walking and running", "Drawing"], "answer": "Walking and running"},
                {"q": "What helps carry the bag?", "options": ["Hands", "Feet", "Shoulders", "Fingers"], "answer": "Shoulders"},
                {"q": "Where do feet take you?", "options": ["To bed", "To school", "To the park", "To the store"], "answer": "To school"},
            ]},
        ],
        "listenings": [
            {"script": "Raise your arm! Good. Now raise both arms. Very good! Put your arms down.", "questions": [
                {"q": "What should you raise?", "options": ["Your leg", "Your arm", "Your hand", "Your foot"], "answer": "Your arm"},
                {"q": "How many arms should you raise next?", "options": ["One", "Both", "Three", "None"], "answer": "Both"},
            ]},
            {"script": "I have two feet. My feet are in my shoes. I walk with my feet. I can also kick a ball with my foot.", "questions": [
                {"q": "Where are the feet?", "options": ["In socks", "In shoes", "On the table", "In water"], "answer": "In shoes"},
                {"q": "What can you kick with your foot?", "options": ["A book", "A ball", "A hat", "A pencil"], "answer": "A ball"},
            ]},
            {"script": "Let us exercise! Move your arms up and down. Kick your legs. Touch your shoulders. Wiggle your fingers. Good job!", "questions": [
                {"q": "What do you do with your arms?", "options": ["Kick them", "Move up and down", "Wiggle them", "Touch them"], "answer": "Move up and down"},
                {"q": "What do you wiggle?", "options": ["Arms", "Legs", "Shoulders", "Fingers"], "answer": "Fingers"},
            ]},
            {"script": "How many body parts can you name? I have arms, legs, hands, feet, fingers, and shoulders. That is six different body parts!", "questions": [
                {"q": "How many body parts are named?", "options": ["Four", "Five", "Six", "Seven"], "answer": "Six"},
                {"q": "Which is NOT mentioned?", "options": ["Arms", "Legs", "Knees", "Fingers"], "answer": "Knees"},
            ]},
        ],
    },
    {
        "num": 8, "substage": "B", "title": "The Farm", "theme": "Farm Animals",
        "phonics": "Animal Sounds", "color": "#82E0AA",
        "grammar": "That is a...",
        "words": [
            {"word": "cow", "ipa": "/kaʊ/", "definition": "A large farm animal that gives milk", "example": "The cow says moo.", "emoji": "🐄"},
            {"word": "horse", "ipa": "/hɔːrs/", "definition": "A large animal you can ride", "example": "The horse is fast.", "emoji": "🐴"},
            {"word": "sheep", "ipa": "/ʃiːp/", "definition": "A farm animal with soft wool", "example": "The sheep is white.", "emoji": "🐑"},
            {"word": "duck", "ipa": "/dʌk/", "definition": "A bird that swims in water", "example": "The duck is in the pond.", "emoji": "🦆"},
            {"word": "pig", "ipa": "/pɪɡ/", "definition": "A pink farm animal", "example": "The pig is big.", "emoji": "🐷"},
            {"word": "chicken", "ipa": "/ˈtʃɪkɪn/", "definition": "A bird kept on farms for eggs", "example": "The chicken has eggs.", "emoji": "🐔"},
        ],
        "grammar_rules": [
            {"rule": "That is a + animal", "explanation": "Point to something and name it.", "examples": ["That is a cow.", "That is a horse."], "pattern": "That is a ___"},
            {"rule": "The animal + action", "explanation": "Describe what an animal does.", "examples": ["The cow says moo.", "The duck swims."], "pattern": "The ___ ___s"},
        ],
        "readings": [
            {"passage": "That is a cow. The cow is big. The cow says moo. That is a horse. The horse can run fast.", "questions": [
                {"q": "What does the cow say?", "options": ["Baa", "Moo", "Quack", "Oink"], "answer": "Moo"},
                {"q": "What can the horse do?", "options": ["Fly", "Swim", "Run fast", "Climb"], "answer": "Run fast"},
            ]},
            {"passage": "The duck is in the pond. The duck says quack. The pig is in the mud. The pig is pink and big.", "questions": [
                {"q": "Where is the duck?", "options": ["In the barn", "In the pond", "On the hill", "In the house"], "answer": "In the pond"},
                {"q": "What color is the pig?", "options": ["White", "Brown", "Pink", "Black"], "answer": "Pink"},
            ]},
            {"passage": "Welcome to the farm! That is a cow. The cow says moo. That is a horse. The horse is fast. Look! A duck is in the pond. The sheep has white wool. The pig is big and pink. The chicken has eggs.", "questions": [
                {"q": "What does the sheep have?", "options": ["Eggs", "Wool", "Milk", "Feathers"], "answer": "Wool"},
                {"q": "What does the chicken have?", "options": ["Wool", "Milk", "Eggs", "Horns"], "answer": "Eggs"},
                {"q": "How many animals are on the farm?", "options": ["Four", "Five", "Six", "Seven"], "answer": "Six"},
            ]},
            {"passage": "I love the farm! Every morning, the chicken gives us eggs. The cow gives us milk. The horse takes us for rides. The sheep gives us wool for warm clothes. The duck swims happily. Even the pig is fun to watch!", "questions": [
                {"q": "What does the cow give?", "options": ["Eggs", "Milk", "Wool", "Rides"], "answer": "Milk"},
                {"q": "What does the horse do?", "options": ["Gives eggs", "Gives milk", "Takes for rides", "Swims"], "answer": "Takes for rides"},
                {"q": "What is the wool for?", "options": ["Food", "Warm clothes", "Building", "Toys"], "answer": "Warm clothes"},
            ]},
        ],
        "listenings": [
            {"script": "Listen! Moo! That is a cow. Neigh! That is a horse. What animals can you hear?", "questions": [
                {"q": "What animal says moo?", "options": ["Horse", "Cow", "Duck", "Pig"], "answer": "Cow"},
                {"q": "What animal says neigh?", "options": ["Cow", "Duck", "Horse", "Sheep"], "answer": "Horse"},
            ]},
            {"script": "On the farm, the duck goes quack quack. The pig goes oink oink. They are having fun!", "questions": [
                {"q": "What does the duck say?", "options": ["Moo", "Baa", "Quack", "Oink"], "answer": "Quack"},
                {"q": "What does the pig say?", "options": ["Moo", "Baa", "Quack", "Oink"], "answer": "Oink"},
            ]},
            {"script": "Good morning, farm animals! The cow is eating grass. The horse is running. The chicken is sitting on eggs. The duck is swimming in the pond.", "questions": [
                {"q": "What is the cow doing?", "options": ["Running", "Swimming", "Eating grass", "Sitting"], "answer": "Eating grass"},
                {"q": "What is the chicken doing?", "options": ["Eating", "Running", "Swimming", "Sitting on eggs"], "answer": "Sitting on eggs"},
            ]},
            {"script": "I want to be a farmer! I will have cows for milk, chickens for eggs, sheep for wool, and horses for riding. My farm will be wonderful!", "questions": [
                {"q": "What does the speaker want to be?", "options": ["A teacher", "A doctor", "A farmer", "A student"], "answer": "A farmer"},
                {"q": "Why does the speaker want sheep?", "options": ["For milk", "For eggs", "For riding", "For wool"], "answer": "For wool"},
            ]},
        ],
    },
    {
        "num": 9, "substage": "B", "title": "My Pets", "theme": "Pet Animals",
        "phonics": "Short Vowels: a, e, i, o, u", "color": "#F0B27A",
        "grammar": "I like...",
        "words": [
            {"word": "dog", "ipa": "/dɒɡ/", "definition": "A common pet animal that barks", "example": "I like dogs.", "emoji": "🐕"},
            {"word": "rabbit", "ipa": "/ˈræbɪt/", "definition": "A small animal with long ears", "example": "The rabbit is soft.", "emoji": "🐰"},
            {"word": "bird", "ipa": "/bɜːrd/", "definition": "An animal with wings that can fly", "example": "The bird sings.", "emoji": "🐦"},
            {"word": "mouse", "ipa": "/maʊs/", "definition": "A very small animal with a long tail", "example": "The mouse is tiny.", "emoji": "🐭"},
            {"word": "turtle", "ipa": "/ˈtɜːrtəl/", "definition": "A slow animal with a hard shell", "example": "The turtle is slow.", "emoji": "🐢"},
            {"word": "goldfish", "ipa": "/ˈɡəʊldfɪʃ/", "definition": "A small orange fish kept as a pet", "example": "I have a goldfish.", "emoji": "🐠"},
        ],
        "grammar_rules": [
            {"rule": "I like + animal", "explanation": "Tell about animals you enjoy.", "examples": ["I like dogs.", "I like cats."], "pattern": "I like ___"},
            {"rule": "I do not like + animal", "explanation": "Tell about animals you do not enjoy.", "examples": ["I do not like mice.", "I do not like spiders."], "pattern": "I do not like ___"},
        ],
        "readings": [
            {"passage": "I have a dog. My dog is big and brown. He likes to run and play. I like my dog very much!", "questions": [
                {"q": "What pet does the speaker have?", "options": ["A cat", "A dog", "A bird", "A fish"], "answer": "A dog"},
                {"q": "What does the dog like to do?", "options": ["Sleep", "Eat", "Run and play", "Swim"], "answer": "Run and play"},
            ]},
            {"passage": "My friend has a rabbit. The rabbit is white and soft. She also has a turtle. The turtle is very slow but cute.", "questions": [
                {"q": "What color is the rabbit?", "options": ["Brown", "Black", "White", "Gray"], "answer": "White"},
                {"q": "How is the turtle?", "options": ["Fast", "Slow", "Big", "Loud"], "answer": "Slow"},
            ]},
            {"passage": "I have many pets! I like dogs. My dog is big and happy. I also have a rabbit. The rabbit is soft. My bird sings every morning. I do not have a mouse, but my friend does!", "questions": [
                {"q": "What pet sings every morning?", "options": ["The dog", "The bird", "The rabbit", "The mouse"], "answer": "The bird"},
                {"q": "What is the rabbit like?", "options": ["Big", "Soft", "Loud", "Fast"], "answer": "Soft"},
                {"q": "Does the speaker have a mouse?", "options": ["Yes", "No", "Maybe", "Two"], "answer": "No"},
            ]},
            {"passage": "Pets are wonderful friends! Dogs are loyal and playful. Rabbits are soft and quiet. Birds can sing beautiful songs. Goldfish swim in bowls. Turtles are slow but live very long. I like all pets!", "questions": [
                {"q": "What are dogs like?", "options": ["Slow and quiet", "Loyal and playful", "Small and soft", "Fast and loud"], "answer": "Loyal and playful"},
                {"q": "Where do goldfish swim?", "options": ["In the pond", "In the river", "In bowls", "In the sea"], "answer": "In bowls"},
                {"q": "What is special about turtles?", "options": ["They sing", "They fly", "They are fast", "They live very long"], "answer": "They live very long"},
            ]},
        ],
        "listenings": [
            {"script": "My dog says woof woof! He is happy to see me. I like my dog. He is my best friend.", "questions": [
                {"q": "What does the dog say?", "options": ["Meow", "Woof woof", "Tweet", "Squeak"], "answer": "Woof woof"},
                {"q": "Who is the speaker's best friend?", "options": ["A cat", "A teacher", "A dog", "A rabbit"], "answer": "A dog"},
            ]},
            {"script": "I want a pet. I like rabbits because they are soft. I also like goldfish because they are pretty. I do not like mice.", "questions": [
                {"q": "Why does the speaker like rabbits?", "options": ["They are fast", "They are soft", "They are big", "They are loud"], "answer": "They are soft"},
                {"q": "What does the speaker NOT like?", "options": ["Rabbits", "Goldfish", "Mice", "Dogs"], "answer": "Mice"},
            ]},
            {"script": "Look at the pet shop! There are dogs, birds, rabbits, turtles, and goldfish. Which pet do you like? I like the bird because it sings.", "questions": [
                {"q": "Where are the animals?", "options": ["At the farm", "At school", "At the pet shop", "At home"], "answer": "At the pet shop"},
                {"q": "Why does the speaker like the bird?", "options": ["It flies", "It sings", "It is soft", "It is big"], "answer": "It sings"},
            ]},
            {"script": "Taking care of pets is important. Give your dog food and water. Clean your goldfish bowl. Play with your rabbit. Love your pets and they will love you!", "questions": [
                {"q": "What should you give your dog?", "options": ["Toys only", "Food and water", "A bath", "A hat"], "answer": "Food and water"},
                {"q": "What should you clean?", "options": ["The dog", "The rabbit", "The goldfish bowl", "The cage"], "answer": "The goldfish bowl"},
            ]},
        ],
    },
    {
        "num": 10, "substage": "B", "title": "At School", "theme": "School Objects",
        "phonics": "High Frequency Words", "color": "#A3E4D7",
        "grammar": "I have a...",
        "words": [
            {"word": "bag", "ipa": "/bæɡ/", "definition": "Something you carry your things in", "example": "My bag is heavy.", "emoji": "🎒"},
            {"word": "pen", "ipa": "/pen/", "definition": "A tool used for writing with ink", "example": "I write with a pen.", "emoji": "🖊️"},
            {"word": "pencil", "ipa": "/ˈpensəl/", "definition": "A tool used for writing and drawing", "example": "I draw with a pencil.", "emoji": "✏️"},
            {"word": "book", "ipa": "/bʊk/", "definition": "Pages with words to read", "example": "I read a book.", "emoji": "📖"},
            {"word": "eraser", "ipa": "/ɪˈreɪzər/", "definition": "A tool used to remove pencil marks", "example": "I need an eraser.", "emoji": "🧹"},
            {"word": "ruler", "ipa": "/ˈruːlər/", "definition": "A tool used to draw straight lines", "example": "I use a ruler.", "emoji": "📏"},
        ],
        "grammar_rules": [
            {"rule": "I have a + school object", "explanation": "Tell about things you own.", "examples": ["I have a pen.", "I have a book."], "pattern": "I have a ___"},
            {"rule": "Do you have a...?", "explanation": "Ask if someone has something.", "examples": ["Do you have a pen?", "Do you have a ruler?"], "pattern": "Do you have a ___?"},
        ],
        "readings": [
            {"passage": "I have a bag. My bag is blue. Inside my bag, I have a pen and a pencil. I use the pen to write.", "questions": [
                {"q": "What color is the bag?", "options": ["Red", "Blue", "Green", "Yellow"], "answer": "Blue"},
                {"q": "What is inside the bag?", "options": ["A book and eraser", "A pen and pencil", "A ruler and bag", "An apple and ball"], "answer": "A pen and pencil"},
            ]},
            {"passage": "I need a book to read. I also need an eraser to fix my mistakes. My ruler helps me draw straight lines.", "questions": [
                {"q": "Why do you need an eraser?", "options": ["To write", "To draw", "To fix mistakes", "To cut paper"], "answer": "To fix mistakes"},
                {"q": "What does the ruler help you do?", "options": ["Write", "Read", "Draw straight lines", "Erase"], "answer": "Draw straight lines"},
            ]},
            {"passage": "I am at school. I have a bag. In my bag, I have a pen, a pencil, a book, and an eraser. My friend does not have a ruler. I give my ruler to my friend. Sharing is good!", "questions": [
                {"q": "Where is the speaker?", "options": ["At home", "At school", "At the park", "At the farm"], "answer": "At school"},
                {"q": "What does the speaker give to the friend?", "options": ["A pen", "A book", "A ruler", "An eraser"], "answer": "A ruler"},
                {"q": "What is good?", "options": ["Running", "Sharing", "Sleeping", "Eating"], "answer": "Sharing"},
            ]},
            {"passage": "Do you have everything for school? You need a bag, a pen, a pencil, a book, an eraser, and a ruler. That is six things! Check your bag every morning.", "questions": [
                {"q": "How many things do you need?", "options": ["Four", "Five", "Six", "Seven"], "answer": "Six"},
                {"q": "When should you check your bag?", "options": ["At night", "Every morning", "After school", "At lunch"], "answer": "Every morning"},
                {"q": "Which is NOT mentioned?", "options": ["Pen", "Pencil", "Scissors", "Ruler"], "answer": "Scissors"},
            ]},
        ],
        "listenings": [
            {"script": "Open your bag. Take out your pen. Now take out your pencil. Let us start writing!", "questions": [
                {"q": "What should you open?", "options": ["Your book", "Your bag", "Your box", "Your hand"], "answer": "Your bag"},
                {"q": "What are we going to do?", "options": ["Read", "Draw", "Write", "Play"], "answer": "Write"},
            ]},
            {"script": "I forgot my eraser at home. Do you have an extra eraser? Yes, I do. Here you go. Thank you!", "questions": [
                {"q": "What did the speaker forget?", "options": ["A pen", "A book", "An eraser", "A ruler"], "answer": "An eraser"},
                {"q": "Where did they forget it?", "options": ["At school", "At home", "In the bag", "On the desk"], "answer": "At home"},
            ]},
            {"script": "Use your pencil to draw a picture. If you make a mistake, use your eraser. Then use your ruler to draw a straight line at the bottom.", "questions": [
                {"q": "What do you use to draw?", "options": ["A pen", "A pencil", "An eraser", "A ruler"], "answer": "A pencil"},
                {"q": "Where do you draw the line?", "options": ["At the top", "In the middle", "At the bottom", "On the side"], "answer": "At the bottom"},
            ]},
            {"script": "Let me read from my book. This book is about animals. I like reading. Books help us learn new things every day.", "questions": [
                {"q": "What is the book about?", "options": ["Colors", "Numbers", "Animals", "School"], "answer": "Animals"},
                {"q": "What do books help us do?", "options": ["Sleep", "Play", "Eat", "Learn new things"], "answer": "Learn new things"},
            ]},
        ],
    },
    {
        "num": 11, "substage": "B", "title": "Feelings", "theme": "Emotions",
        "phonics": "Intonation and Pitch", "color": "#F9E79F",
        "grammar": "I am (feeling).",
        "words": [
            {"word": "happy", "ipa": "/ˈhæpi/", "definition": "Feeling good and pleased", "example": "I am happy today!", "emoji": "😊"},
            {"word": "sad", "ipa": "/sæd/", "definition": "Feeling unhappy or upset", "example": "She is sad.", "emoji": "😢"},
            {"word": "angry", "ipa": "/ˈæŋɡri/", "definition": "Feeling very upset or mad", "example": "He is angry.", "emoji": "😠"},
            {"word": "sleepy", "ipa": "/ˈsliːpi/", "definition": "Feeling like you want to sleep", "example": "I am sleepy.", "emoji": "😴"},
            {"word": "hungry", "ipa": "/ˈhʌŋɡri/", "definition": "Feeling like you want to eat", "example": "I am hungry.", "emoji": "🤤"},
            {"word": "scared", "ipa": "/skeərd/", "definition": "Feeling afraid", "example": "The cat is scared.", "emoji": "😨"},
        ],
        "grammar_rules": [
            {"rule": "I am + feeling", "explanation": "Tell about how you feel.", "examples": ["I am happy.", "I am sad."], "pattern": "I am ___"},
            {"rule": "Are you + feeling?", "explanation": "Ask someone how they feel.", "examples": ["Are you happy?", "Are you hungry?"], "pattern": "Are you ___?"},
        ],
        "readings": [
            {"passage": "I am happy today! The sun is shining. My friend is here. We play together. Being happy is great!", "questions": [
                {"q": "How does the speaker feel?", "options": ["Sad", "Happy", "Angry", "Scared"], "answer": "Happy"},
                {"q": "Why is the speaker happy?", "options": ["It is raining", "The friend is here", "It is bedtime", "School is over"], "answer": "The friend is here"},
            ]},
            {"passage": "My cat is scared of thunder. When it is loud, the cat hides under the bed. I am not scared. I feel sleepy when it rains.", "questions": [
                {"q": "What is the cat scared of?", "options": ["Dogs", "Water", "Thunder", "Darkness"], "answer": "Thunder"},
                {"q": "How does the speaker feel when it rains?", "options": ["Happy", "Angry", "Scared", "Sleepy"], "answer": "Sleepy"},
            ]},
            {"passage": "How are you today? I am happy! My friend Tom is sad because he lost his ball. Sara is hungry. She wants an apple. Are you sleepy? It is time for bed! Good night!", "questions": [
                {"q": "Why is Tom sad?", "options": ["He is hungry", "He lost his ball", "He is sleepy", "He is scared"], "answer": "He lost his ball"},
                {"q": "What does Sara want?", "options": ["A ball", "A book", "An apple", "A cat"], "answer": "An apple"},
                {"q": "What time is it at the end?", "options": ["Morning", "Lunch time", "Afternoon", "Bedtime"], "answer": "Bedtime"},
            ]},
            {"passage": "Feelings change during the day. In the morning, I am happy. Before lunch, I am hungry. After playing, I am sleepy. If I lose my toy, I am sad. If someone takes my food, I am angry. All feelings are normal!", "questions": [
                {"q": "When is the speaker hungry?", "options": ["In the morning", "Before lunch", "After playing", "At night"], "answer": "Before lunch"},
                {"q": "When is the speaker sleepy?", "options": ["In the morning", "Before lunch", "After playing", "At night"], "answer": "After playing"},
                {"q": "What makes the speaker angry?", "options": ["Losing a toy", "Playing", "Someone takes food", "Going to bed"], "answer": "Someone takes food"},
            ]},
        ],
        "listenings": [
            {"script": "I am happy! I am smiling. When I am happy, I laugh and play. Are you happy too?", "questions": [
                {"q": "What does the speaker do when happy?", "options": ["Cry", "Laugh and play", "Sleep", "Hide"], "answer": "Laugh and play"},
                {"q": "What question is asked?", "options": ["Are you sad?", "Are you happy?", "Are you sleepy?", "Are you hungry?"], "answer": "Are you happy?"},
            ]},
            {"script": "I am hungry. My stomach is making noises. I want to eat something. Maybe an apple or a banana.", "questions": [
                {"q": "How does the speaker feel?", "options": ["Happy", "Sad", "Hungry", "Sleepy"], "answer": "Hungry"},
                {"q": "What does the speaker want?", "options": ["To play", "To sleep", "To eat", "To read"], "answer": "To eat"},
            ]},
            {"script": "Tom is angry because someone broke his toy. Sara is sad because her friend moved away. But they will feel better soon!", "questions": [
                {"q": "Why is Tom angry?", "options": ["He is hungry", "Someone broke his toy", "He lost his bag", "He is sleepy"], "answer": "Someone broke his toy"},
                {"q": "Will they feel better?", "options": ["Yes", "No", "Maybe", "Never"], "answer": "Yes"},
            ]},
            {"script": "Let us learn about feelings. When you smile, you are happy. When you cry, you are sad. When your face is red, you are angry. When your eyes close, you are sleepy. Feelings are part of being human!", "questions": [
                {"q": "What do you do when you are sad?", "options": ["Smile", "Cry", "Laugh", "Yawn"], "answer": "Cry"},
                {"q": "When your eyes close, you are...", "options": ["Happy", "Sad", "Angry", "Sleepy"], "answer": "Sleepy"},
            ]},
        ],
    },
    {
        "num": 12, "substage": "B", "title": "Big Review!", "theme": "Cumulative Review",
        "phonics": "Cumulative Mastery Check", "color": "#D7BDE2",
        "grammar": "Mixed Patterns (Review)",
        "words": [
            {"word": "hello", "ipa": "/həˈləʊ/", "definition": "A greeting when you meet someone", "example": "Hello! How are you?", "emoji": "👋"},
            {"word": "family", "ipa": "/ˈfæməli/", "definition": "A group of related people", "example": "I love my family.", "emoji": "👨‍👩‍👧‍👦"},
            {"word": "red", "ipa": "/red/", "definition": "The color of an apple or fire", "example": "The apple is red.", "emoji": "🔴"},
            {"word": "dog", "ipa": "/dɒɡ/", "definition": "A common pet animal that barks", "example": "I like dogs.", "emoji": "🐕"},
            {"word": "happy", "ipa": "/ˈhæpi/", "definition": "Feeling good and pleased", "example": "I am happy today!", "emoji": "😊"},
            {"word": "book", "ipa": "/bʊk/", "definition": "Pages with words to read", "example": "I read a book.", "emoji": "📖"},
        ],
        "grammar_rules": [
            {"rule": "I am + name/feeling", "explanation": "Introduce yourself or tell how you feel.", "examples": ["I am Tom.", "I am happy."], "pattern": "I am ___"},
            {"rule": "This is my + noun", "explanation": "Show something that belongs to you.", "examples": ["This is my dog.", "This is my family."], "pattern": "This is my ___"},
        ],
        "readings": [
            {"passage": "Hello! I am Tom. I am a student. I like school. My favorite color is red. I have a dog.", "questions": [
                {"q": "What is Tom's favorite color?", "options": ["Blue", "Green", "Red", "Yellow"], "answer": "Red"},
                {"q": "What pet does Tom have?", "options": ["A cat", "A dog", "A bird", "A fish"], "answer": "A dog"},
            ]},
            {"passage": "My family is great. I have a mother, a father, and a sister. We read books together. Reading makes me happy.", "questions": [
                {"q": "What does the family do together?", "options": ["Play ball", "Watch TV", "Read books", "Cook food"], "answer": "Read books"},
                {"q": "How does reading make the speaker feel?", "options": ["Sad", "Angry", "Happy", "Sleepy"], "answer": "Happy"},
            ]},
            {"passage": "My name is Tom. I am a student. I have a big family: a mother, a father, a brother, and a sister. I like my dog. My dog is brown. I am happy at school. I have a red bag, a pen, and many books!", "questions": [
                {"q": "What color is Tom's bag?", "options": ["Blue", "Green", "Red", "Yellow"], "answer": "Red"},
                {"q": "What color is the dog?", "options": ["White", "Black", "Brown", "Red"], "answer": "Brown"},
                {"q": "How does Tom feel at school?", "options": ["Sad", "Angry", "Happy", "Scared"], "answer": "Happy"},
            ]},
            {"passage": "Hello, everyone! I am Tom. I learned many things this year. I can count to ten, name colors, talk about my family, and describe animals. I have a dog, a red bag, many books, and a happy smile. I love learning English!", "questions": [
                {"q": "What can Tom count to?", "options": ["Five", "Eight", "Ten", "Twenty"], "answer": "Ten"},
                {"q": "What does Tom love?", "options": ["Sleeping", "Playing", "Learning English", "Eating"], "answer": "Learning English"},
                {"q": "Which is something Tom learned?", "options": ["Cooking", "Driving", "Naming colors", "Swimming"], "answer": "Naming colors"},
            ]},
        ],
        "listenings": [
            {"script": "Hello, Tom! How are you? I am happy! What is your name? My name is Sara. Nice to meet you!", "questions": [
                {"q": "How is Tom?", "options": ["Sad", "Happy", "Angry", "Sleepy"], "answer": "Happy"},
                {"q": "What is the girl's name?", "options": ["Anna", "Tom", "Sara", "Ben"], "answer": "Sara"},
            ]},
            {"script": "I love my family. My mother is kind. My father is strong. I have a dog. The dog is brown and happy.", "questions": [
                {"q": "How is the mother?", "options": ["Strong", "Kind", "Angry", "Sleepy"], "answer": "Kind"},
                {"q": "What color is the dog?", "options": ["White", "Black", "Brown", "Red"], "answer": "Brown"},
            ]},
            {"script": "Let me tell you about my day. I go to school with my red bag. I read books. I play with friends. At home, I play with my dog. I am happy!", "questions": [
                {"q": "What color is the bag?", "options": ["Blue", "Red", "Green", "Yellow"], "answer": "Red"},
                {"q": "What does the speaker do at home?", "options": ["Reads books", "Studies", "Plays with dog", "Sleeps"], "answer": "Plays with dog"},
            ]},
            {"script": "Congratulations! You finished Stage One! You learned about greetings, friends, numbers, colors, family, body parts, animals, school things, and feelings. You are amazing!", "questions": [
                {"q": "What did the student finish?", "options": ["A book", "Stage One", "A test", "A game"], "answer": "Stage One"},
                {"q": "How does the speaker describe the student?", "options": ["Good", "Smart", "Amazing", "Nice"], "answer": "Amazing"},
            ]},
        ],
    },
]


def make_activity_flow(unit_num, lesson_num):
    pfx = f"s1u{unit_num:02d}l{lesson_num:02d}"
    return [
        {"order": 1, "type": "retrieval_warmup", "activity_id": f"warmup_{pfx}", "icon": "refresh-cw", "label": "Warm-up", "duration_minutes": 2, "is_skippable": True},
        {"order": 2, "type": "vocabulary", "activity_id": f"vocab_{pfx}", "icon": "book-open", "label": "Vocabulary", "duration_minutes": 6, "is_skippable": False},
        {"order": 3, "type": "micro_game_vocab", "activity_id": f"game_vocab_{pfx}", "icon": "gamepad-2", "label": "Vocab Game", "duration_minutes": 4, "is_skippable": False},
        {"order": 4, "type": "micro_reading", "activity_id": f"reading_{pfx}", "icon": "file-text", "label": "Reading", "duration_minutes": 3, "is_skippable": True},
        {"order": 5, "type": "grammar_focus", "activity_id": f"grammar_{pfx}", "icon": "edit-3", "label": "Grammar", "duration_minutes": 4, "is_skippable": False},
        {"order": 6, "type": "micro_game_grammar", "activity_id": f"game_grammar_{pfx}", "icon": "gamepad-2", "label": "Grammar Game", "duration_minutes": 3, "is_skippable": False},
        {"order": 7, "type": "listening", "activity_id": f"listening_{pfx}", "icon": "headphones", "label": "Listening", "duration_minutes": 4, "is_skippable": False},
        {"order": 8, "type": "production", "activity_id": f"production_{pfx}", "icon": "mic", "label": "Speaking", "duration_minutes": 4, "is_skippable": False},
        {"order": 9, "type": "exit_ticket", "activity_id": f"exit_{pfx}", "icon": "check-circle", "label": "Exit Quiz", "duration_minutes": 2, "is_skippable": False},
        {"order": 10, "type": "auto_review", "activity_id": f"review_{pfx}", "icon": "repeat", "label": "Review", "duration_minutes": 0, "is_skippable": False},
    ]


def make_lessons(unit):
    un = unit["num"]
    titles = ["Meet the Words", "Practice Time", "Read and Learn", "Review and Speak"]
    descs = [
        f"Learn the first {unit['theme'].lower()} vocabulary",
        f"Practice more {unit['theme'].lower()} words and patterns",
        f"Read about {unit['theme'].lower()} in context and go deeper",
        f"Review everything, speak and challenge yourself",
    ]
    lessons = []
    for ln in range(1, 5):
        lessons.append({
            "lesson_id": f"stage_1_unit_{un:02d}_lesson_{ln:02d}",
            "unit_id": f"stage_1_unit_{un:02d}",
            "stage_id": "stage_1",
            "number": ln,
            "title": titles[ln - 1],
            "description": descs[ln - 1],
            "estimated_duration_minutes": 25,
            "points_reward": 50,
            "activity_flow": make_activity_flow(un, ln),
            "created_at": TS
        })
    return lessons


def make_vocab_activity(unit, lesson_num):
    un = unit["num"]
    words = unit["words"]
    half = len(words) // 2
    if lesson_num == 1:
        selected = words[:half]
    elif lesson_num == 2:
        selected = words[half:]
    elif lesson_num == 3:
        selected = words  # all words
    else:
        selected = list(reversed(words))  # reversed order for variety
    return {
        "activity_id": f"vocab_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "unit_number": un,
        "words": [{
            "word_id": f"w_{un}_{i}_{lesson_num}",
            "word": w["word"], "ipa": w["ipa"], "definition": w["definition"],
            "example_sentence": w["example"], "image_emoji": w["emoji"],
            "audio_url": None, "sentence_audio_url": None,
        } for i, w in enumerate(selected)],
        "created_at": TS
    }


async def make_warmup_activity_ai(unit, lesson_num):
    """AI-powered warmup generation"""
    un = unit["num"]
    words = unit["words"]
    half = len(words) // 2
    if lesson_num == 1:
        sel = words[:half]
    elif lesson_num == 2:
        sel = words[half:]
    elif lesson_num == 3:
        sel = [words[0], words[2], words[4]] if len(words) > 4 else words[:3]
    else:
        sel = [words[1], words[3], words[5]] if len(words) > 5 else words[:3]
    
    try:
        from ai_content_generator import generate_warmup_questions
        result = await generate_warmup_questions(unit, lesson_num, sel)
        questions = []
        for i, q in enumerate(result.get("questions", [])):
            questions.append({
                "question_id": f"wq_{un}_{lesson_num}_{i}",
                "question_text": q.get("question_text", f"What does '{sel[i]['definition'].lower()}' mean?"),
                "correct_answer": q.get("correct_answer", sel[i]["word"]),
                "options": q.get("options", [sel[i]["word"]])[:4],
                "question_type": "multiple_choice",
                "image_emoji": q.get("image_emoji", sel[i].get("emoji", "")),
                "hint": q.get("hint", ""),
                "hint_word": sel[i]["word"]
            })
        if not questions:
            raise ValueError("No questions generated")
    except Exception as e:
        print(f"  AI warmup failed for U{un}L{lesson_num}: {e}, using fallback")
        questions = []
        for i, w in enumerate(sel):
            others = [x["word"] for x in words if x != w]
            random.shuffle(others)
            options = [w["word"]] + others[:3]
            random.shuffle(options)
            questions.append({
                "question_id": f"wq_{un}_{lesson_num}_{i}",
                "question_text": f"What does '{w['definition'].lower()}' mean?",
                "correct_answer": w["word"],
                "options": options[:4],
                "question_type": "multiple_choice",
                "image_emoji": w.get("emoji", ""),
                "hint_word": w["word"]
            })
    
    return {
        "activity_id": f"warmup_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "questions": questions,
        "created_at": TS
    }


def make_vocab_game(unit, lesson_num):
    un = unit["num"]
    words = unit["words"]
    half = len(words) // 2
    if lesson_num == 1:
        selected = words[:half]
    elif lesson_num == 2:
        selected = words[half:]
    elif lesson_num == 3:
        selected = [words[0], words[2], words[4]] if len(words) > 4 else words[:3]
    else:
        selected = words  # all words for final review
    return {
        "activity_id": f"game_vocab_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "type": "micro_game_vocab",
        "game_type": "matching",
        "items": [{"word": w["word"], "match": w["definition"]} for w in selected],
        "time_limit_seconds": 180,
        "scoring": {"perfect": 90, "good": 70, "pass": 50},
        "created_at": TS
    }


def make_grammar_activity(unit, lesson_num):
    un = unit["num"]
    rules = unit["grammar_rules"]
    if lesson_num == 1:
        selected_rules = [rules[0]]
    elif lesson_num == 2:
        selected_rules = [rules[min(1, len(rules) - 1)]]
    else:
        selected_rules = rules  # both rules for L3/L4
    return {
        "activity_id": f"grammar_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "rules": [{
            "rule_id": f"gr_{un}_{lesson_num}_{ri}",
            "title": r["rule"],
            "explanation": r["explanation"],
            "examples": r["examples"],
            "pattern": r["pattern"],
        } for ri, r in enumerate(selected_rules)],
        "created_at": TS
    }


async def make_grammar_game_ai(unit, lesson_num):
    un = unit["num"]
    rules = unit["grammar_rules"]
    words = unit["words"]
    if lesson_num <= 2:
        r = rules[min(lesson_num - 1, len(rules) - 1)]
    else:
        r = rules[lesson_num % len(rules)]

    # Error hunter items (keep as-is - these are simple)
    error_items = []
    for ex in r["examples"]:
        error_items.append({"sentence": ex, "has_error": False, "correct_sentence": ex})
    if words:
        error_items.append({
            "sentence": f"I is a {words[lesson_num % len(words)]['word']}.",
            "has_error": True,
            "correct_sentence": f"I am a {words[lesson_num % len(words)]['word']}."
        })

    # AI-generated fill-blank and word-order
    half = len(words) // 2
    if lesson_num == 1:
        sel = words[:half]
    elif lesson_num == 2:
        sel = words[half:]
    elif lesson_num == 3:
        sel = [words[0], words[2], words[4]] if len(words) > 4 else words[:3]
    else:
        sel = words[:3]

    try:
        from ai_content_generator import generate_grammar_exercises
        result = await generate_grammar_exercises(unit, lesson_num, sel)
        fill_blank = result.get("fill_blank_items", [])
        word_order = result.get("word_order_items", [])
        # Add hint from grammar rule if not present
        for wo in word_order:
            if "hint" not in wo:
                wo["hint"] = r.get("explanation", "")
    except Exception as e:
        print(f"  AI grammar game failed for U{un}L{lesson_num}: {e}, using fallback")
        fill_blank = []
        word_order = []
        for ex in r["examples"][:2]:
            w_list = ex.rstrip('.!?').split()
            word_order.append({"words": w_list, "correct_sentence": ex, "hint": r["explanation"]})

    return {
        "activity_id": f"game_grammar_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "type": "micro_game_grammar",
        "game_type": "mixed",
        "items": error_items,
        "word_order_items": word_order,
        "fill_blank_items": fill_blank,
        "time_limit_seconds": 300,
        "scoring": {"perfect": 90, "good": 70, "pass": 50},
        "created_at": TS
    }


def make_reading_activity(unit, lesson_num):
    un = unit["num"]
    readings = unit.get("readings", [])
    idx = min(lesson_num - 1, len(readings) - 1)
    rd = readings[idx]
    return {
        "activity_id": f"reading_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "passage": rd["passage"],
        "title": f"Reading: {unit['title']} ({lesson_num})",
        "questions": [{
            "question_id": f"rq_{un}_{lesson_num}_{i}",
            "question_text": q["q"],
            "options": q["options"],
            "correct_answer": q["answer"],
            "question_type": "multiple_choice"
        } for i, q in enumerate(rd["questions"])],
        "created_at": TS
    }


def make_listening_activity(unit, lesson_num):
    un = unit["num"]
    listenings = unit.get("listenings", [])
    idx = min(lesson_num - 1, len(listenings) - 1)
    ls = listenings[idx]
    return {
        "activity_id": f"listening_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "audio_script": ls["script"],
        "audio_url": None,
        "speakers": [{"name": "Teacher", "role": "narrator"}],
        "questions": [{
            "question_id": f"lq_{un}_{lesson_num}_{i}",
            "question_text": q["q"],
            "options": q["options"],
            "correct_answer": q["answer"],
            "question_type": "multiple_choice"
        } for i, q in enumerate(ls["questions"])],
        "created_at": TS
    }


def make_production_activity(unit, lesson_num):
    un = unit["num"]
    rules = unit["grammar_rules"]
    r = rules[min(lesson_num - 1, len(rules) - 1)]
    prompts = [
        f"Use the pattern '{r['pattern']}' to make a sentence about {unit['theme'].lower()}.",
        f"Write two sentences using '{r['rule']}' about your life.",
        f"Create a short paragraph (3 sentences) about {unit['theme'].lower()} using the words you learned.",
        f"Describe {unit['theme'].lower()} to a friend using at least 4 words from this unit.",
    ]
    return {
        "activity_id": f"production_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "production_type": "speaking" if lesson_num % 2 == 0 else "writing",
        "prompt": prompts[lesson_num - 1],
        "example_answer": r["examples"][0],
        "rubric": ["Uses the correct pattern", "Uses vocabulary from this unit", "Clear pronunciation or spelling"],
        "created_at": TS
    }


async def make_exit_ticket_ai(unit, lesson_num):
    un = unit["num"]
    words = unit["words"]
    half = len(words) // 2
    rules = unit["grammar_rules"]

    if lesson_num == 1:
        vocab_words = words[:2]
    elif lesson_num == 2:
        vocab_words = words[half:half + 2]
    elif lesson_num == 3:
        vocab_words = [words[0], words[-1]]
    else:
        vocab_words = [words[2], words[4]] if len(words) > 4 else words[:2]

    try:
        from ai_content_generator import generate_exit_questions
        result = await generate_exit_questions(unit, lesson_num, vocab_words)
        questions = []
        for i, q in enumerate(result.get("questions", [])):
            qdata = {
                "question_id": f"eq_{un}_{lesson_num}_{i}",
                "question_text": q["question_text"],
                "correct_answer": q["correct_answer"],
                "question_type": q.get("question_type", "multiple_choice"),
            }
            if q.get("options"):
                qdata["options"] = q["options"][:4]
            if q.get("hint"):
                qdata["hint"] = q["hint"]
            if q.get("acceptable_answers"):
                qdata["acceptable_answers"] = q["acceptable_answers"]
            questions.append(qdata)
        if not questions:
            raise ValueError("No questions generated")
    except Exception as e:
        print(f"  AI exit ticket failed for U{un}L{lesson_num}: {e}, using fallback")
        questions = []
        for i, w in enumerate(vocab_words):
            others = [x["word"] for x in words if x != w]
            random.shuffle(others)
            options = [w["word"]] + others[:3]
            random.shuffle(options)
            questions.append({
                "question_id": f"eq_{un}_{lesson_num}_{i}",
                "question_text": f"What is '{w['definition'].lower()}'?",
                "correct_answer": w["word"],
                "options": options,
                "question_type": "multiple_choice"
            })

    return {
        "activity_id": f"exit_s1u{un:02d}l{lesson_num:02d}",
        "lesson_id": f"stage_1_unit_{un:02d}_lesson_{lesson_num:02d}",
        "questions": questions,
        "time_limit_seconds": 120,
        "scoring": {"perfect": 100, "good": 75, "pass": 50},
        "created_at": TS
    }


async def seed_full_stage_1():
    mongo_url = os.environ.get('MONGO_URL')
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ.get('DB_NAME', 'ielts_ace')]

    print("=" * 60)
    print("SEEDING FULL STAGE 1 CURRICULUM V3 (12 Units, 48 Lessons)")
    print("Unique content per lesson!")
    print("=" * 60)

    collections_to_clear = [
        "unified_units", "unified_lessons",
        "unified_vocabulary_activities", "unified_warmup_activities",
        "unified_game_activities", "unified_grammar_activities",
        "unified_reading_activities", "unified_listening_activities",
        "unified_production_activities", "unified_exit_activities"
    ]
    for col in collections_to_clear:
        r = await db[col].delete_many({"$or": [
            {"stage_id": "stage_1"},
            {"stage_id": "stage_1_foundations"},
            {"lesson_id": {"$regex": "^stage_1_"}},
            {"unit_id": {"$regex": "^stage_1_"}}
        ]})
        if r.deleted_count > 0:
            print(f"  Cleared {col}: {r.deleted_count} docs")

    await db.unified_stages.update_one(
        {"number": 1},
        {"$set": {"stage_id": "stage_1", "name": "Foundations", "cefr_level": "Pre-A1",
                  "total_units": 12, "description": "Build your English foundation from scratch!",
                  "color": "#F59E0B", "visual_strategy": "heavy", "tone": "playful"}},
        upsert=True
    )

    unit_docs = []
    for u in UNITS:
        unit_docs.append({
            "unit_id": f"stage_1_unit_{u['num']:02d}",
            "stage_id": "stage_1",
            "number": u["num"],
            "substage": u["substage"],
            "title": u["title"],
            "description": u["theme"],
            "theme": u["theme"],
            "phonics_focus": u["phonics"],
            "grammar_pattern": u["grammar"],
            "total_lessons": 4,
            "order": u["num"],
            "theme_color": u["color"],
            "created_at": TS
        })
    await db.unified_units.insert_many(unit_docs)
    print(f"Inserted {len(unit_docs)} units")

    all_lessons, all_vocab, all_warmup = [], [], []
    all_vocab_games, all_grammar, all_grammar_games = [], [], []
    all_reading, all_listening, all_production, all_exit = [], [], [], []

    for u in UNITS:
        lessons = make_lessons(u)
        all_lessons.extend(lessons)
        for ln in range(1, 5):
            all_vocab.append(make_vocab_activity(u, ln))
            all_vocab_games.append(make_vocab_game(u, ln))
            all_grammar.append(make_grammar_activity(u, ln))
            all_reading.append(make_reading_activity(u, ln))
            all_listening.append(make_listening_activity(u, ln))
            all_production.append(make_production_activity(u, ln))
            # AI-powered generation
            print(f"  AI generating Unit {u['num']} Lesson {ln}...")
            warmup = await make_warmup_activity_ai(u, ln)
            all_warmup.append(warmup)
            grammar_game = await make_grammar_game_ai(u, ln)
            all_grammar_games.append(grammar_game)
            exit_ticket = await make_exit_ticket_ai(u, ln)
            all_exit.append(exit_ticket)

    await db.unified_lessons.insert_many(all_lessons)
    print(f"Inserted {len(all_lessons)} lessons")
    await db.unified_vocabulary_activities.insert_many(all_vocab)
    print(f"Inserted {len(all_vocab)} vocabulary activities")
    await db.unified_warmup_activities.insert_many(all_warmup)
    print(f"Inserted {len(all_warmup)} warmup activities")
    await db.unified_game_activities.insert_many(all_vocab_games + all_grammar_games)
    print(f"Inserted {len(all_vocab_games)} vocab games + {len(all_grammar_games)} grammar games")
    await db.unified_grammar_activities.insert_many(all_grammar)
    print(f"Inserted {len(all_grammar)} grammar activities")
    await db.unified_reading_activities.insert_many(all_reading)
    print(f"Inserted {len(all_reading)} reading activities")
    await db.unified_listening_activities.insert_many(all_listening)
    print(f"Inserted {len(all_listening)} listening activities")
    await db.unified_production_activities.insert_many(all_production)
    print(f"Inserted {len(all_production)} production activities")
    await db.unified_exit_activities.insert_many(all_exit)
    print(f"Inserted {len(all_exit)} exit activities")

    print("=" * 60)
    print("STAGE 1 CURRICULUM V3 SEED COMPLETE!")
    total = sum(len(x) for x in [all_lessons, all_vocab, all_warmup, all_vocab_games,
                                   all_grammar, all_grammar_games, all_reading,
                                   all_listening, all_production, all_exit])
    print(f"Total records: {total}")
    print("=" * 60)
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_full_stage_1())
