"""
Listening Assessment Data for Comprehensive Level Test
5-10 progressive difficulty questions (Band 2.0 to 9.0)
Each item has: id, script_text (for TTS), questions, answers
"""

# Listening sections with progressive difficulty
LISTENING_SECTIONS = [
    # Section 1: Band 2.0-3.5 - Basic Comprehension (Short monologue)
    {
        "id": "listening_1",
        "level": "A1-A2",
        "band_range": "2.0-3.5",
        "title": "Daily Schedule",
        "voice": "female",  # en-GB-SoniaNeural
        "script_text": "Hello. My name is Sarah. I wake up at seven o'clock every morning. First, I have breakfast. I eat toast and drink tea. Then I go to work at eight thirty. I work in an office. I finish work at five o'clock. In the evening, I watch television and read books. I go to bed at ten o'clock.",
        "questions": [
            {
                "id": "q1",
                "type": "mcq",
                "question": "What time does Sarah wake up?",
                "options": ["A) 6 o'clock", "B) 7 o'clock", "C) 8 o'clock", "D) 9 o'clock"],
                "correct": "B",
                "skill": "specific_information"
            },
            {
                "id": "q2",
                "type": "mcq",
                "question": "What does Sarah have for breakfast?",
                "options": ["A) Eggs and coffee", "B) Cereal and milk", "C) Toast and tea", "D) Fruit and juice"],
                "correct": "C",
                "skill": "detail_comprehension"
            }
        ]
    },
    
    # Section 2: Band 3.5-4.5 - Short Conversation
    {
        "id": "listening_2",
        "level": "A2",
        "band_range": "3.5-4.5",
        "title": "At the Train Station",
        "voice": "male",  # en-GB-RyanNeural
        "script_text": "Excuse me, can you help me? I need to get to London. Which platform should I go to? Platform three, sir. The next train to London leaves at two fifteen. It takes about one hour and twenty minutes. The ticket costs thirty-two pounds for a single journey, or fifty-eight pounds for a return ticket. Thank you very much. That's very helpful.",
        "questions": [
            {
                "id": "q3",
                "type": "mcq",
                "question": "Which platform does the train to London leave from?",
                "options": ["A) Platform 1", "B) Platform 2", "C) Platform 3", "D) Platform 4"],
                "correct": "C",
                "skill": "specific_information"
            },
            {
                "id": "q4",
                "type": "mcq",
                "question": "How long does the journey take?",
                "options": ["A) 1 hour", "B) 1 hour 20 minutes", "C) 2 hours", "D) 2 hours 15 minutes"],
                "correct": "B",
                "skill": "number_comprehension"
            }
        ]
    },
    
    # Section 3: Band 5.0-5.5 - Extended Monologue
    {
        "id": "listening_3",
        "level": "B1",
        "band_range": "5.0-5.5",
        "title": "Museum Tour Introduction",
        "voice": "female",
        "script_text": "Welcome to the Natural History Museum. Before we begin our tour, I'd like to give you some important information. The museum has three floors. On the ground floor, you'll find the dinosaur exhibition, which is our most popular attraction. The first floor contains exhibits about ocean life and marine creatures. On the second floor, we have displays about human evolution and ancient civilizations. Photography is permitted in most areas, but please don't use flash as it can damage some of the older specimens. The tour will last approximately ninety minutes, and we'll have a fifteen-minute break at the café on the first floor.",
        "questions": [
            {
                "id": "q5",
                "type": "mcq",
                "question": "Where is the dinosaur exhibition located?",
                "options": ["A) Ground floor", "B) First floor", "C) Second floor", "D) In the café"],
                "correct": "A",
                "skill": "spatial_information"
            },
            {
                "id": "q6",
                "type": "mcq",
                "question": "Why should visitors not use flash photography?",
                "options": ["A) It disturbs other visitors", "B) It can damage specimens", "C) It's against the law", "D) The batteries will run out"],
                "correct": "B",
                "skill": "reason_comprehension"
            }
        ]
    },
    
    # Section 4: Band 5.5-6.5 - Academic Lecture Extract
    {
        "id": "listening_4",
        "level": "B2",
        "band_range": "5.5-6.5",
        "title": "Climate Change Lecture",
        "voice": "male",
        "script_text": "Today I want to discuss the impact of climate change on global food production. According to recent studies, rising temperatures have already begun to affect crop yields in many parts of the world. In particular, wheat production has decreased by approximately fifteen percent in tropical regions over the past decade. However, interestingly, some northern countries have actually seen an increase in agricultural output due to longer growing seasons. Scientists predict that by twenty fifty, we may need to produce up to sixty percent more food to meet global demand. This presents a significant challenge, as traditional farming methods may no longer be sufficient. One potential solution involves the development of drought-resistant crop varieties through genetic modification.",
        "questions": [
            {
                "id": "q7",
                "type": "mcq",
                "question": "By how much has wheat production decreased in tropical regions?",
                "options": ["A) 5 percent", "B) 10 percent", "C) 15 percent", "D) 20 percent"],
                "correct": "C",
                "skill": "numerical_data"
            },
            {
                "id": "q8",
                "type": "mcq",
                "question": "What solution does the speaker mention for food production challenges?",
                "options": ["A) Importing more food", "B) Reducing population", "C) Genetic modification", "D) Building more farms"],
                "correct": "C",
                "skill": "main_idea"
            }
        ]
    },
    
    # Section 5: Band 7.0-9.0 - Complex Academic Discussion
    {
        "id": "listening_5",
        "level": "C1-C2",
        "band_range": "7.0-9.0",
        "title": "Artificial Intelligence Ethics",
        "voice": "female",
        "script_text": "The ethical implications of artificial intelligence in decision-making processes have become increasingly pertinent in contemporary discourse. Consider, for instance, the deployment of algorithmic systems in judicial sentencing. While proponents argue that such systems can eliminate human bias and ensure consistency, critics contend that they may perpetuate historical inequalities embedded in the training data. Furthermore, the opacity of many machine learning models raises fundamental questions about accountability. When an algorithm makes a consequential decision that adversely affects an individual, determining responsibility becomes problematic. This phenomenon, often referred to as the 'black box' problem, challenges our traditional frameworks of legal and moral accountability. Some scholars advocate for a principle of algorithmic transparency, requiring that AI systems provide comprehensible explanations for their outputs.",
        "questions": [
            {
                "id": "q9",
                "type": "mcq",
                "question": "What do critics say about algorithmic systems in judicial sentencing?",
                "options": ["A) They are too expensive", "B) They may perpetuate inequalities", "C) They are too slow", "D) They replace human judges entirely"],
                "correct": "B",
                "skill": "inference"
            },
            {
                "id": "q10",
                "type": "mcq",
                "question": "What is the 'black box' problem?",
                "options": ["A) AI systems are too large", "B) AI is too expensive", "C) AI decisions lack transparency", "D) AI cannot be transported"],
                "correct": "C",
                "skill": "concept_understanding"
            }
        ]
    }
]

def get_all_listening_questions():
    """Get all listening questions flattened into a list"""
    all_questions = []
    for section in LISTENING_SECTIONS:
        for q in section["questions"]:
            all_questions.append({
                **q,
                "section_id": section["id"],
                "level": section["level"],
                "band_range": section["band_range"]
            })
    return all_questions

def get_listening_sections():
    """Get all listening sections with metadata"""
    return LISTENING_SECTIONS
