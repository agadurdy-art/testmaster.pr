#!/usr/bin/env python3
"""
IELTS Mastery Blueprint: Band 4.5-6.5 Full Course
17 Modules covering all core IELTS topics
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

MASTERY_MODULES = [
    # Module 1: Education
    {
        "id": "mastery-module-1",
        "module_number": 1,
        "title": "Education",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Master academic and school-related vocabulary",
            "Use the Passive Voice to describe educational processes",
            "Analyze IELTS Reading texts regarding modern teaching methods",
            "Construct a Band 6 Task 2 essay on university education"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Curriculum", "meaning": "The subjects in a course of study", "example": "The school updated its curriculum to include coding."},
                {"word": "Literacy", "meaning": "The ability to read and write", "example": "Improving literacy rates is a government priority."},
                {"word": "Tuition", "meaning": "Fees paid for instruction", "example": "University tuition has increased dramatically."}
            ],
            "verbs": [
                {"word": "Enroll", "meaning": "To officially register for a course", "example": "I plan to enroll in an online course."},
                {"word": "Graduate", "meaning": "To complete a degree", "example": "She will graduate next summer."},
                {"word": "Revise", "meaning": "To study again before an exam", "example": "I need to revise for my test."}
            ],
            "adjectives": [
                {"word": "Academic", "meaning": "Related to education and scholarship", "example": "His academic performance improved."},
                {"word": "Studious", "meaning": "Spending a lot of time studying", "example": "She is a very studious student."},
                {"word": "Compulsory", "meaning": "Required by law or rules", "example": "Math is a compulsory subject."}
            ],
            "adverbs": [
                {"word": "Academically", "meaning": "In terms of education", "example": "He excels academically."},
                {"word": "Literally", "meaning": "In a literal manner", "example": "I literally studied all night."},
                {"word": "Virtually", "meaning": "Almost entirely", "example": "Classes are now virtually online."}
            ]
        },
        "collocations": [
            {"phrase": "Higher education", "meaning": "Education at a college or university level", "example": "Many students seek higher education to improve job prospects."},
            {"phrase": "Meet a deadline", "meaning": "To finish a task by a specific time", "example": "It is hard to meet a deadline when you have multiple assignments."}
        ],
        "idiom": {"phrase": "Learn by heart", "meaning": "To memorize something perfectly", "example": "I had to learn the poem by heart for the school play."},
        "grammar": {
            "title": "The Passive Voice (Present/Past Simple)",
            "explanation": "Using 'be' + past participle (e.g., 'is taught'). Use this in Writing Task 1 (processes) or Task 2 when the action is more important than the person doing it.",
            "benefit": "It makes your writing sound more objective and formal, which is necessary for a Band 6+.",
            "examples": ["The students are required to wear uniforms.", "New technology was introduced to the classroom last year."]
        },
        "reading": {
            "title": "The Rise of Online Learning",
            "text": "Online learning has transformed how students access information. In the past, students had to attend physical classrooms to receive instruction from a teacher. However, with the development of high-speed internet, many universities now offer 'distance learning' courses. This allows students from different countries to enroll in programs without moving abroad. While some argue that face-to-face interaction is essential for literacy and social skills, others suggest that digital tools provide more flexibility for those who work while studying.",
            "questions": [
                {"type": "sentence_completion", "question": "In the past, instruction was received in __________.", "answer": "physical classrooms"},
                {"type": "sentence_completion", "question": "Distance learning is possible because of __________.", "answer": "high-speed internet"},
                {"type": "sentence_completion", "question": "Some believe __________ is necessary for social skill development.", "answer": "face-to-face interaction"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Do you prefer studying alone or with others?",
                "model_answer": "Actually, I prefer studying alone because it is easier to focus. When I am with friends, we often start chatting about other things, and I can't meet my deadlines."
            },
            "part2": {
                "cue_card": "Describe a subject you enjoyed at school.",
                "model_answer": "I would like to talk about History. It was a compulsory subject, but I found it fascinating. My teacher was very studious and told great stories. I enjoyed it because it helped me understand the world today."
            }
        },
        "writing": {
            "question": "Some people think that all university students should study whatever they like. Others believe they should only study subjects that are useful for the future, such as science. Discuss both views and give your opinion.",
            "model_essay": "In modern society, there is a debate about whether students should choose their own subjects or focus on practical ones. On one hand, people should follow their passions. If a student is forced to study something they hate, they might not graduate. On the other hand, the economy needs workers with skills in technology and science. In my opinion, it is better to have a balance. Students should be allowed to choose, but universities should encourage useful subjects by offering lower tuition fees.",
            "notes": "This essay uses a clear four-paragraph structure. It avoids C2-level complexity but uses topic-specific words like 'tuition' and 'graduate' correctly."
        },
        "common_mistake": {
            "wrong": "I am study English.",
            "correct": "I am studying English.",
            "explanation": "Use Present Continuous for ongoing actions."
        },
        "tip": "Do not use slang like 'wanna' or 'gonna' in the Speaking test."
    },
    # Module 2: Health
    {
        "id": "mastery-module-2",
        "module_number": 2,
        "title": "Health",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Identify essential vocabulary for diet, exercise, and medicine",
            "Use Modal Verbs to give advice and express necessity",
            "Practice Part 3 Speaking questions on public health"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Ailment", "meaning": "A minor illness", "example": "He has a common ailment."},
                {"word": "Obesity", "meaning": "Being very overweight", "example": "Obesity is a growing health problem."},
                {"word": "Nutrient", "meaning": "A substance that provides nourishment", "example": "Vegetables contain many nutrients."}
            ],
            "verbs": [
                {"word": "Prevent", "meaning": "To stop something from happening", "example": "Exercise can prevent diseases."},
                {"word": "Maintain", "meaning": "To keep in good condition", "example": "Maintain a healthy lifestyle."},
                {"word": "Recover", "meaning": "To return to normal health", "example": "She recovered from the illness."}
            ],
            "adjectives": [
                {"word": "Nutritious", "meaning": "Full of nutrients, healthy", "example": "Fruits are very nutritious."},
                {"word": "Chronic", "meaning": "Lasting for a long time", "example": "He has a chronic condition."},
                {"word": "Sedentary", "meaning": "Involving little physical activity", "example": "A sedentary lifestyle is unhealthy."}
            ],
            "adverbs": [
                {"word": "Physically", "meaning": "In terms of the body", "example": "Stay physically active."},
                {"word": "Regularly", "meaning": "At consistent intervals", "example": "Exercise regularly."},
                {"word": "Moderately", "meaning": "In a moderate way", "example": "Eat moderately."}
            ]
        },
        "collocations": [
            {"phrase": "Balanced diet", "meaning": "A diet with the right amounts of different foods", "example": "Eating a balanced diet is the key to long-term health."},
            {"phrase": "Sedentary lifestyle", "meaning": "A way of life involving little physical activity", "example": "Office workers often lead a sedentary lifestyle."}
        ],
        "idiom": {"phrase": "Under the weather", "meaning": "Feeling slightly ill", "example": "I'm feeling a bit under the weather, so I might skip the gym today."},
        "grammar": {
            "title": "Modal Verbs for Advice (Should / Ought to / Must)",
            "explanation": "Auxiliary verbs used to express degrees of necessity. Useful in Speaking Part 3 and Writing Task 2 when suggesting solutions to health problems.",
            "benefit": "Shows the examiner you can express nuance and give recommendations effectively.",
            "examples": ["Governments should tax sugary drinks.", "People must exercise at least three times a week to maintain their health."]
        },
        "reading": {
            "title": "The Obesity Epidemic",
            "text": "Health experts are increasingly worried about the global rise in obesity. In many developed nations, people consume high amounts of processed food that lacks essential nutrients. Furthermore, the shift toward office work means many adults lead a sedentary life. This combination leads to chronic diseases such as diabetes and heart disease. To prevent these ailments, doctors suggest a combination of regular exercise and a balanced diet. However, changing habits is difficult in a world where fast food is cheap and convenient.",
            "questions": [
                {"type": "true_false_ng", "question": "Obesity is only a problem in developed countries.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Processed foods often lack vitamins.", "answer": "True"},
                {"type": "true_false_ng", "question": "Office work contributes to health problems.", "answer": "True"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "What do you do to stay healthy?",
                "model_answer": "I try to eat a balanced diet with lots of vegetables. Also, I go jogging regularly, usually three times a week, because it makes me feel energetic."
            },
            "part3": {
                "question": "Should the government be responsible for public health?",
                "model_answer": "I believe the government plays a big role. They should provide free sports facilities and educate children about nutritious food. However, individuals also must take responsibility for their own choices."
            }
        },
        "writing": {
            "question": "The percentage of overweight people is increasing in many countries. What are the causes of this, and what are the solutions?",
            "model_essay": "Nowadays, many people are becoming overweight. One main cause is the popularity of fast food, which is often unhealthy. Another cause is that people have a sedentary lifestyle because they work at computers all day. To solve this, governments should introduce a tax on junk food. Also, schools must teach children how to cook nutritious meals. If we take these steps, we can prevent many chronic diseases.",
            "notes": "This is a clear 'Cause and Solution' essay structure. The vocabulary is topic-focused without being overly academic."
        },
        "common_mistake": {
            "wrong": "The exercise is good for health.",
            "correct": "Exercise is good for health.",
            "explanation": "Do not use 'the' for general concepts."
        },
        "tip": "In Writing Task 2, use 'For example' instead of 'Like' to introduce evidence."
    },
    # Module 3: Technology
    {
        "id": "mastery-module-3",
        "module_number": 3,
        "title": "Technology",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Acquire vocabulary for digital devices and the internet",
            "Use First Conditional to discuss future technological impacts",
            "Understand Band 6 requirements for technology-themed speaking"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Innovation", "meaning": "A new method or idea", "example": "The smartphone was a major innovation."},
                {"word": "Device", "meaning": "A piece of equipment", "example": "Mobile devices are everywhere."},
                {"word": "Privacy", "meaning": "The state of being free from public attention", "example": "Data privacy is a concern."}
            ],
            "verbs": [
                {"word": "Revolutionize", "meaning": "To change something completely", "example": "The internet revolutionized communication."},
                {"word": "Interact", "meaning": "To communicate or work together", "example": "People interact through social media."},
                {"word": "Upgrade", "meaning": "To improve or update", "example": "I need to upgrade my software."}
            ],
            "adjectives": [
                {"word": "Automated", "meaning": "Operated by machines", "example": "Many factories are now automated."},
                {"word": "Cutting-edge", "meaning": "The most advanced", "example": "This is cutting-edge technology."},
                {"word": "Obsolete", "meaning": "No longer used or needed", "example": "Floppy disks are obsolete."}
            ],
            "adverbs": [
                {"word": "Virtually", "meaning": "Almost entirely", "example": "We work virtually now."},
                {"word": "Technically", "meaning": "In terms of technology", "example": "Technically, it's possible."},
                {"word": "Digitally", "meaning": "Using digital technology", "example": "Books are available digitally."}
            ]
        },
        "collocations": [
            {"phrase": "Social media", "meaning": "Websites and apps for social networking", "example": "Social media has changed how we interact."},
            {"phrase": "Cutting-edge technology", "meaning": "The newest and most advanced technology", "example": "The hospital uses cutting-edge technology to treat patients."}
        ],
        "idiom": {"phrase": "Behind the times", "meaning": "Outdated or not using modern technology", "example": "My grandfather is a bit behind the times; he doesn't have a smartphone."},
        "grammar": {
            "title": "First Conditional (If + Present Simple, Will + Verb)",
            "explanation": "A structure used to talk about things likely to happen in the future. Use this to predict technology's impact in Speaking Part 3 or Writing Task 2.",
            "benefit": "It demonstrates your ability to discuss hypothetical situations and future consequences.",
            "examples": ["If children spend too much time on devices, they will lose social skills.", "If we invest in innovation, our lives will become easier."]
        },
        "reading": {
            "title": "The Impact of Automation",
            "text": "Innovation in artificial intelligence is starting to revolutionize the workplace. Many tasks that were once done by humans are now automated. For example, in many factories, robots handle the assembly line. While this makes production faster, some fear that human workers will become obsolete. Furthermore, the use of smart devices has raised concerns about data privacy. Despite these worries, proponents argue that technology allows us to interact with people globally and provides access to a wealth of information digitally.",
            "questions": [
                {"type": "short_answer", "question": "What is currently changing the workplace?", "answer": "Artificial intelligence / Innovation"},
                {"type": "short_answer", "question": "Which industry uses robots for assembly?", "answer": "Factories / Manufacturing"},
                {"type": "short_answer", "question": "What is a major concern regarding smart devices?", "answer": "Data privacy"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "How often do you use the internet?",
                "model_answer": "I use it every day, virtually all the time. I need it for my studies and also to keep in touch with friends on social media."
            },
            "part2": {
                "cue_card": "Describe a piece of technology you own.",
                "model_answer": "I want to describe my laptop. It is not exactly cutting-edge, but it is very reliable. I use it to upgrade my skills by taking online courses. It has revolutionized the way I study because I can find information instantly."
            }
        },
        "writing": {
            "question": "Technology is making communication easier and more efficient. Do the advantages outweigh the disadvantages?",
            "model_essay": "Technology has transformed how we communicate. On the positive side, we can now interact with people across the world instantly through social media and video calls. This has made business more efficient and helped families stay connected. However, there are downsides. Many people feel that face-to-face interaction is declining. Also, privacy concerns have increased as our data is collected digitally. In conclusion, while technology brings many benefits, we must be careful about its impact on personal relationships.",
            "notes": "Clear advantages/disadvantages structure with topic vocabulary."
        },
        "common_mistake": {
            "wrong": "The technology is very fast nowadays.",
            "correct": "Technology is very fast nowadays.",
            "explanation": "General nouns do not usually need an article."
        },
        "tip": "When you don't know a specific technical word, try to describe it (e.g., 'the thing we use to move the cursor' instead of 'mouse')."
    },
    # Module 4: Environment
    {
        "id": "mastery-module-4",
        "module_number": 4,
        "title": "The Environment",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Acquire vocabulary for environmental issues and conservation",
            "Master the Second Conditional to discuss hypothetical solutions",
            "Answer True/False/Not Given and Short Answer questions",
            "Structure a Writing Task 2 essay about environmental responsibility"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Emissions", "meaning": "Gases released into the air", "example": "Car emissions pollute the air."},
                {"word": "Biodiversity", "meaning": "Variety of plant and animal life", "example": "Rainforests have rich biodiversity."},
                {"word": "Habitat", "meaning": "Natural home of an animal or plant", "example": "Deforestation destroys habitats."}
            ],
            "verbs": [
                {"word": "Conserve", "meaning": "To protect from harm or destruction", "example": "We must conserve water."},
                {"word": "Contaminate", "meaning": "To make impure or pollute", "example": "Factories contaminate rivers."},
                {"word": "Endanger", "meaning": "To put at risk", "example": "Pollution endangers wildlife."}
            ],
            "adjectives": [
                {"word": "Sustainable", "meaning": "Able to be maintained without depleting resources", "example": "We need sustainable energy sources."},
                {"word": "Disposable", "meaning": "Intended to be thrown away after use", "example": "Disposable plastics harm the ocean."},
                {"word": "Renewable", "meaning": "Capable of being replaced naturally", "example": "Solar power is renewable."}
            ],
            "adverbs": [
                {"word": "Environmentally", "meaning": "In terms of the environment", "example": "This product is environmentally friendly."},
                {"word": "Ecologically", "meaning": "In terms of ecology", "example": "The area is ecologically important."},
                {"word": "Globally", "meaning": "Throughout the world", "example": "Climate change affects us globally."}
            ]
        },
        "collocations": [
            {"phrase": "Fossil fuels", "meaning": "Energy sources like coal or oil", "example": "We must reduce our reliance on fossil fuels."},
            {"phrase": "Carbon footprint", "meaning": "Amount of carbon dioxide released by a person or group", "example": "Taking the bus helps lower your carbon footprint."}
        ],
        "idiom": {"phrase": "A drop in the ocean", "meaning": "A very small amount that won't have much effect", "example": "Recycling one bottle is a drop in the ocean, but it is a start."},
        "grammar": {
            "title": "The Second Conditional (If + Past Simple, would + Verb)",
            "explanation": "A structure for imagined or unlikely situations. Use this to propose solutions to global problems in Writing Task 2 or Speaking Part 3.",
            "benefit": "It demonstrates the ability to discuss complex, hypothetical ideas, which is key for Band 6+.",
            "examples": ["If governments banned disposable plastics, the oceans would be cleaner.", "If people drove less, air quality would improve globally."]
        },
        "reading": {
            "title": "The Threat to Biodiversity",
            "text": "The Earth is currently facing a significant loss of biodiversity. As human populations grow, natural habitats are being destroyed to make room for cities and farms. This destruction endangers many species, pushing them toward extinction. Furthermore, industrial activities release harmful emissions into the atmosphere, contributing to climate change. Scientists argue that we must switch to renewable energy sources, such as solar and wind power, to conserve what remains of the natural world. If we do not adopt sustainable practices now, the damage to our ecosystem may become permanent.",
            "questions": [
                {"type": "true_false_ng", "question": "Human population growth is the only cause of habitat loss.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Renewable energy is more expensive than fossil fuels.", "answer": "Not Given"},
                {"type": "short_answer", "question": "What kind of energy sources are solar and wind power?", "answer": "Renewable"},
                {"type": "short_answer", "question": "What are industrial activities releasing into the atmosphere?", "answer": "Emissions / Harmful emissions"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Is there much pollution in your hometown?",
                "model_answer": "Yes, unfortunately. There are too many cars, so the exhaust emissions are quite high. It makes the air feel contaminated during rush hour."
            },
            "part2": {
                "cue_card": "Describe a beautiful place in your country.",
                "model_answer": "I'd like to talk about a national park near my city. It has amazing biodiversity. I love it because it's a protected habitat where you can see rare birds. It's very peaceful and environmentally clean."
            },
            "part3": {
                "question": "Whose responsibility is it to protect the environment?",
                "model_answer": "In my view, it is a shared responsibility. Individuals should reduce their carbon footprint, but if the government didn't create laws, companies would continue to use disposable materials."
            }
        },
        "writing": {
            "question": "Some people think that individuals can do nothing to improve the environment. Only governments and large companies can make a difference. To what extent do you agree or disagree?",
            "model_essay": "Environmental protection is a major issue today. Some argue that private citizens are powerless, and only authorities can help. I disagree with this view because I believe both sides are important. On one hand, governments can pass laws to limit emissions and promote renewable energy. This has a huge impact globally. On the other hand, if every person lived a more sustainable life, it would make a difference. For example, if we all stopped using disposable plastic, pollution would decrease. In conclusion, while governments must lead the way, individual actions are not just a drop in the ocean; they are essential for change.",
            "notes": "Uses Second Conditional effectively and includes the idiom naturally."
        },
        "common_mistake": {
            "wrong": "The environment is very importance.",
            "correct": "The environment is very important.",
            "explanation": "Use the adjective, not the noun."
        },
        "tip": "When talking about the environment, always use 'The' (e.g., the environment, the atmosphere, the Earth)."
    },
    # Module 5: Work and Employment
    {
        "id": "mastery-module-5",
        "module_number": 5,
        "title": "Work and Employment",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Use professional vocabulary to describe jobs and career paths",
            "Master the Present Perfect to talk about work experience",
            "Understand Multiple Choice questions in Reading",
            "Write a Task 2 essay on Work-Life Balance"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Occupation", "meaning": "A job or profession", "example": "Teaching is a rewarding occupation."},
                {"word": "Promotion", "meaning": "Advancement to a higher position", "example": "She received a promotion last month."},
                {"word": "Incentive", "meaning": "Something that motivates", "example": "Bonuses are a good incentive."}
            ],
            "verbs": [
                {"word": "Resign", "meaning": "To quit a job formally", "example": "He decided to resign from the company."},
                {"word": "Collaborate", "meaning": "To work together", "example": "Teams must collaborate effectively."},
                {"word": "Commute", "meaning": "To travel to work regularly", "example": "I commute by train every day."}
            ],
            "adjectives": [
                {"word": "Strenuous", "meaning": "Requiring great effort", "example": "Construction is strenuous work."},
                {"word": "Rewarding", "meaning": "Providing satisfaction", "example": "Teaching can be very rewarding."},
                {"word": "Redundant", "meaning": "No longer needed", "example": "Many workers were made redundant."}
            ],
            "adverbs": [
                {"word": "Professionally", "meaning": "In a professional manner", "example": "She handled the situation professionally."},
                {"word": "Efficiently", "meaning": "In an effective way", "example": "Work more efficiently to save time."},
                {"word": "Manually", "meaning": "By hand, not by machine", "example": "Some tasks are still done manually."}
            ]
        },
        "collocations": [
            {"phrase": "Work-life balance", "meaning": "Balance between work and personal life", "example": "A good work-life balance prevents stress."},
            {"phrase": "Job satisfaction", "meaning": "Feeling of pleasure in your job", "example": "High salaries do not always lead to job satisfaction."}
        ],
        "idiom": {"phrase": "Get your foot in the door", "meaning": "To get a start in a company or profession", "example": "An internship is a good way to get your foot in the door."},
        "grammar": {
            "title": "The Present Perfect (Have/Has + Past Participle)",
            "explanation": "Connects the past to the present. Use in Speaking Part 1 or Writing Task 2 to talk about experiences or ongoing situations.",
            "benefit": "It is a more advanced tense than Past Simple and shows you can discuss your background accurately.",
            "examples": ["I have worked as a teacher for five years.", "Technology has changed how we collaborate."]
        },
        "reading": {
            "title": "The Changing Nature of Work",
            "text": "In the past, most people held a single occupation for their entire lives. However, the modern job market is very different. Many employees now resign after a few years to find more rewarding roles elsewhere. Additionally, the rise of technology means many strenuous or repetitive tasks are now done manually by machines, sometimes making human workers redundant. To keep their staff motivated, companies offer incentives such as bonuses or flexible hours. This flexibility helps employees achieve a better work-life balance, as they no longer need to commute to an office every day.",
            "questions": [
                {"type": "multiple_choice", "question": "Why do people change jobs more often now?", "options": ["They are fired", "To find more satisfying work", "To avoid commuting"], "answer": "To find more satisfying work"},
                {"type": "multiple_choice", "question": "What is a result of machines doing more tasks?", "options": ["Higher salaries", "People become redundant", "Better collaboration"], "answer": "People become redundant"},
                {"type": "sentence_completion", "question": "Bonuses and flexible hours are types of __________.", "answer": "incentives"},
                {"type": "sentence_completion", "question": "Workers who work well with others in digital spaces often get a __________.", "answer": "promotion"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Do you have a job right now?",
                "model_answer": "Yes, I have worked in a marketing agency for two years. My occupation involves managing social media, which I find very rewarding."
            },
            "part2": {
                "cue_card": "Describe a job you would like to do in the future.",
                "model_answer": "I would like to be a software developer. It is a modern occupation where I could collaborate with talented people. I think it would give me great job satisfaction and a good salary."
            },
            "part3": {
                "question": "What is more important: a high salary or job satisfaction?",
                "model_answer": "That's a tough question. A high salary is an important incentive, but if the work is too strenuous and you have no work-life balance, you will be unhappy. I think satisfaction is more important in the long run."
            }
        },
        "writing": {
            "question": "In many countries, people work long hours. What are the reasons for this, and how does it affect family life?",
            "model_essay": "Working long hours is common in many societies today. One reason for this is high competition in the workplace; employees want to get a promotion or avoid being made redundant. Another reason is the high cost of living, which forces people to seek extra incentives. However, this has a negative effect on family life. If parents commute for hours and work late, they cannot spend time with their children. This ruins the work-life balance and can cause stress at home. In conclusion, while working hard is necessary for a career, it should not happen at the expense of the family.",
            "notes": "Uses Present Perfect and topic vocabulary effectively."
        },
        "common_mistake": {
            "wrong": "I have graduate from university in 2020.",
            "correct": "I graduated from university in 2020.",
            "explanation": "Use Past Simple for specific dates, not Present Perfect."
        },
        "tip": "Don't just say 'My job is good.' Use adjectives like rewarding, challenging, or dynamic."
    },
    # Module 6: Family and Society
    {
        "id": "mastery-module-6",
        "module_number": 6,
        "title": "Family and Society",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Master vocabulary related to family structures and upbringing",
            "Use Comparatives and Superlatives to compare generations",
            "Use Relative Clauses to define complex relationships",
            "Practice Sentence Completion in Reading"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Upbringing", "meaning": "The way a child is raised", "example": "His upbringing shaped his values."},
                {"word": "Sibling", "meaning": "A brother or sister", "example": "I have two siblings."},
                {"word": "Adolescence", "meaning": "The period of teenage years", "example": "Adolescence can be challenging."}
            ],
            "verbs": [
                {"word": "Nurture", "meaning": "To care for and encourage growth", "example": "Parents nurture their children."},
                {"word": "Inherit", "meaning": "To receive from parents", "example": "Children inherit traits from parents."},
                {"word": "Discipline", "meaning": "To train or punish", "example": "Parents must discipline children fairly."}
            ],
            "adjectives": [
                {"word": "Nuclear", "meaning": "Consisting of parents and children only", "example": "A nuclear family is common today."},
                {"word": "Extended", "meaning": "Including grandparents, aunts, uncles", "example": "An extended family provides support."},
                {"word": "Close-knit", "meaning": "Very close relationships", "example": "We are a close-knit family."}
            ],
            "adverbs": [
                {"word": "Traditionally", "meaning": "According to tradition", "example": "Traditionally, families ate together."},
                {"word": "Strictly", "meaning": "In a strict manner", "example": "She was raised strictly."},
                {"word": "Solely", "meaning": "Only, exclusively", "example": "He is solely responsible."}
            ]
        },
        "collocations": [
            {"phrase": "Generation gap", "meaning": "Difference in opinions between young and old", "example": "Technology has widened the generation gap."},
            {"phrase": "Single-parent family", "meaning": "Family with only one parent", "example": "Single-parent families are more common now."}
        ],
        "idiom": {"phrase": "Follow in someone's footsteps", "meaning": "To do the same job or path as someone else", "example": "I decided to follow in my father's footsteps and become a doctor."},
        "grammar": {
            "title": "Relative Clauses and Comparatives",
            "explanation": "Relative clauses give more information about a person or thing. Comparatives compare two or more things.",
            "benefit": "Allows you to combine sentences and provide clear descriptions for Band 6.",
            "examples": ["A nuclear family is a group which consists of only parents and children.", "Modern families are often smaller than families in the past."]
        },
        "reading": {
            "title": "The Changing Face of the Family",
            "text": "The structure of the human family has undergone a dramatic transformation over the last century. Traditionally, most societies were built around the extended family model, where several generations lived together. This provided a strong support system for the upbringing of children. However, industrialization led to the rise of the nuclear family, consisting solely of parents and their children. During adolescence, many young people now seek more independence, often influenced by peers rather than parents. This has widened the generation gap.",
            "questions": [
                {"type": "sentence_completion", "question": "In the past, the __________ model provided a support system for raising children.", "answer": "extended family"},
                {"type": "sentence_completion", "question": "The rise of the nuclear family was caused by the need for __________.", "answer": "labor mobility / industrialization"},
                {"type": "sentence_completion", "question": "Peers often have more influence than parents during the period of __________.", "answer": "adolescence"},
                {"type": "true_false_ng", "question": "Modern young people are more independent than those in the past.", "answer": "True"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Do you have a large family or a small family?",
                "model_answer": "I come from a relatively small nuclear family. There are just my parents, my sibling, and me. We are very close-knit, and we try to have dinner together every night."
            },
            "part2": {
                "cue_card": "Describe a family member you admire.",
                "model_answer": "I'd like to talk about my grandfather. I admire him because he had a very difficult upbringing, but he worked hard to provide for us. He always told me to follow in his footsteps regarding my work ethic."
            },
            "part3": {
                "question": "Is it better for children to grow up in a large family?",
                "model_answer": "There are benefits to both. In an extended family, children have many people to nurture them. However, in a smaller family, parents can focus more on each child. I think the most important thing is that the family is close-knit and supportive."
            }
        },
        "writing": {
            "question": "Some people believe that family is the most important influence on a child's development. Others think that friends and school have a greater impact. Discuss both views and give your opinion.",
            "model_essay": "The question of what influences a child most is frequently debated. While some argue that the home environment is key, others believe that external factors like friends are more significant. On the one hand, family is the first place where a child learns social skills. Parents provide the discipline and nurturing that form a child's character. On the other hand, during adolescence, friends become extremely important. Young people want to fit in with their peers. In my opinion, while friends are important for social life, family remains the most vital influence. Parents provide the foundation of a person's life.",
            "notes": "Uses relative clauses and comparatives effectively."
        },
        "common_mistake": {
            "wrong": "My family have four people.",
            "correct": "There are four people in my family.",
            "explanation": "Use 'There are' to describe family size."
        },
        "tip": "When talking about your brother or sister, use the word 'sibling' to sound more academic."
    },
    # Module 7: Travel and Tourism
    {
        "id": "mastery-module-7",
        "module_number": 7,
        "title": "Travel and Tourism",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Acquire vocabulary for travel types, benefits, and environmental impacts",
            "Master Present Perfect vs. Past Simple for travel experiences",
            "Practice Multiple Choice and Short Answer questions",
            "Draft a Writing Task 2 essay on international tourism"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Destination", "meaning": "A place to which one is going", "example": "Paris is a popular destination."},
                {"word": "Itinerary", "meaning": "A planned route or journey", "example": "Our itinerary includes three cities."},
                {"word": "Excursion", "meaning": "A short trip or outing", "example": "We went on an excursion to the beach."}
            ],
            "verbs": [
                {"word": "Embark", "meaning": "To begin a journey", "example": "We embark on our trip tomorrow."},
                {"word": "Explore", "meaning": "To travel through to learn about", "example": "I love to explore new places."},
                {"word": "Wander", "meaning": "To walk without a specific destination", "example": "We wandered through the old town."}
            ],
            "adjectives": [
                {"word": "Exotic", "meaning": "Unusual and exciting", "example": "Thailand is an exotic destination."},
                {"word": "Remote", "meaning": "Far away from civilization", "example": "The village was very remote."},
                {"word": "Scenic", "meaning": "Having beautiful natural scenery", "example": "We took the scenic route."}
            ],
            "adverbs": [
                {"word": "Extensively", "meaning": "To a large extent", "example": "She has traveled extensively."},
                {"word": "Locally", "meaning": "In a local area", "example": "We ate locally grown food."},
                {"word": "Seasonally", "meaning": "According to seasons", "example": "Prices vary seasonally."}
            ]
        },
        "collocations": [
            {"phrase": "Off the beaten track", "meaning": "Places not popular with tourists", "example": "I prefer traveling off the beaten track to see the real culture."},
            {"phrase": "Package holiday", "meaning": "Holiday with flight, hotel included", "example": "Many families prefer a package holiday because it is easier to plan."}
        ],
        "idiom": {"phrase": "Recharge one's batteries", "meaning": "To take a break to get energy back", "example": "I need a vacation to recharge my batteries after a long semester."},
        "grammar": {
            "title": "Present Perfect vs. Past Simple",
            "explanation": "Use 'have + past participle' for general experience vs. past tense for specific times. Crucial for Speaking Part 1 and Part 2.",
            "benefit": "Shows the examiner you can navigate different time frames accurately.",
            "examples": ["I have traveled to many countries (general).", "I went to Japan last year (specific)."]
        },
        "reading": {
            "title": "The Impact of Mass Tourism",
            "text": "The tourism industry has grown extensively over the last few decades, becoming a vital part of the global economy. Many exotic destinations that were once remote are now accessible to millions of travelers. This growth has provided a boost to locally owned businesses. However, mass tourism has also brought significant challenges. One major concern is the environmental impact. When thousands of tourists embark on excursions to fragile ecosystems, they can cause permanent damage. Many countries are promoting sustainable tourism, encouraging visitors to explore less-known areas, often referred to as going 'off the beaten track.'",
            "questions": [
                {"type": "multiple_choice", "question": "What has helped the global economy in recent decades?", "options": ["Local business", "The tourism industry", "Environmental protection"], "answer": "The tourism industry"},
                {"type": "multiple_choice", "question": "What is a negative result of mass tourism?", "options": ["More souvenirs", "Damage to ecosystems", "Better itineraries"], "answer": "Damage to ecosystems"},
                {"type": "short_answer", "question": "What term is used for places that are not popular with many tourists?", "answer": "Off the beaten track"},
                {"type": "short_answer", "question": "What kind of tourism helps protect the environment?", "answer": "Sustainable tourism"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Do you like traveling?",
                "model_answer": "Yes, I love it. I have traveled to several countries in Asia. I think it's a great way to explore new cultures and recharge my batteries."
            },
            "part2": {
                "cue_card": "Describe a place you visited that you enjoyed.",
                "model_answer": "Last year, I went to a remote village in the mountains. It was beautiful and very scenic. I didn't have a strict itinerary, so I just wandered around and met the local people. It was much better than a package holiday."
            }
        },
        "writing": {
            "question": "International tourism has become a huge industry. Is this a positive or negative development?",
            "model_essay": "In recent years, more people than ever are traveling abroad. In my opinion, this is a positive development, although it has some drawbacks. The main advantage is economic. Tourism creates jobs for local people in hotels and restaurants. Additionally, it allows people to explore exotic cultures, which helps us understand each other better. However, there are negatives. Mass tourism can damage scenic areas and lead to pollution. If too many people visit a remote destination, it may lose its beauty. In conclusion, while we must manage the environment carefully, the benefits of travel for the economy and for global understanding are very important.",
            "notes": "Uses Present Perfect and Past Simple correctly."
        },
        "common_mistake": {
            "wrong": "I am go to travel next week.",
            "correct": "I am going to travel next week.",
            "explanation": "Use 'going to' for future plans."
        },
        "tip": "Use 'journey' for the act of traveling and 'trip' for the whole visit."
    },
    # Module 8: Money and Finance
    {
        "id": "mastery-module-8",
        "module_number": 8,
        "title": "Money and Finance",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Master vocabulary related to spending, saving, and the economy",
            "Use Modal Verbs of Possibility for financial predictions",
            "Apply Comparisons with 'as...as' to describe costs",
            "Write a Band 6 Task 2 essay on money and happiness"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Expenditure", "meaning": "The act of spending money", "example": "Government expenditure on education increased."},
                {"word": "Budget", "meaning": "A plan for spending money", "example": "I set a monthly budget."},
                {"word": "Debt", "meaning": "Money owed", "example": "Many students have student debt."}
            ],
            "verbs": [
                {"word": "Economize", "meaning": "To spend less money", "example": "We need to economize this month."},
                {"word": "Invest", "meaning": "To put money into something for profit", "example": "I invest in stocks."},
                {"word": "Squander", "meaning": "To waste money", "example": "Don't squander your savings."}
            ],
            "adjectives": [
                {"word": "Exorbitant", "meaning": "Unreasonably high (price)", "example": "The hotel was exorbitant."},
                {"word": "Affordable", "meaning": "Reasonably priced", "example": "Housing should be affordable."},
                {"word": "Frugal", "meaning": "Careful with money", "example": "She is very frugal."}
            ],
            "adverbs": [
                {"word": "Financially", "meaning": "In terms of money", "example": "They are financially stable."},
                {"word": "Economically", "meaning": "In terms of the economy", "example": "The country is economically strong."},
                {"word": "Sparingly", "meaning": "In a limited way", "example": "Use resources sparingly."}
            ]
        },
        "collocations": [
            {"phrase": "Cost of living", "meaning": "The level of everyday prices", "example": "The cost of living in London is extremely high."},
            {"phrase": "Live within one's means", "meaning": "To not spend more than one earns", "example": "It is important for students to live within their means to avoid debt."}
        ],
        "idiom": {"phrase": "Break the bank", "meaning": "To cost too much money", "example": "You can find a good smartphone that doesn't break the bank."},
        "grammar": {
            "title": "Modal Verbs for Possibility (May / Might / Could)",
            "explanation": "Auxiliary verbs to express that something is possible but not certain. Use in Writing Task 2 or Speaking Part 3 for economic predictions.",
            "benefit": "It adds 'hedging' to your writing, making it sound more academic (Band 6+).",
            "examples": ["Investing in stocks might lead to high returns, but it is risky.", "A higher income could improve your quality of life."]
        },
        "reading": {
            "title": "The Move to a Cashless Society",
            "text": "The way we manage our expenditure has changed significantly. In many prosperous nations, physical currency is becoming a thing of the past. Digital payments allow consumers to buy goods instantly. Proponents argue that this transition is economically efficient, as it reduces the costs of printing money. Furthermore, it helps people track their budget more accurately through mobile apps. However, some experts worry about those who are not financially literate. If a society becomes solely digital, these individuals might struggle to make ends meet.",
            "questions": [
                {"type": "true_false_ng", "question": "Physical money is still the most common way to pay in all countries.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Digital payments can help users monitor their spending.", "answer": "True"},
                {"type": "sentence_completion", "question": "The move to digital payments is considered __________ because it lowers printing costs.", "answer": "economically efficient"},
                {"type": "short_answer", "question": "What is a major concern regarding the recording of every digital transaction?", "answer": "Data privacy"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Are you good at saving money?",
                "model_answer": "To be honest, I try to be frugal, but it's hard. I usually set a budget at the start of the month, but I sometimes squander money on clothes or eating out."
            },
            "part2": {
                "cue_card": "Describe something expensive you bought recently.",
                "model_answer": "I recently bought a new laptop for my studies. It was quite exorbitant, but I needed a powerful machine for video editing. I had to save my income for six months to afford it. It didn't break the bank, but I had to live very frugally for a while."
            },
            "part3": {
                "question": "Is it important for children to learn about money at school?",
                "model_answer": "Yes, I think it's vital. If children learn how to allocate a budget early, they will be more financially responsible as adults. It might prevent them from falling into debt later in life."
            }
        },
        "writing": {
            "question": "Some people believe that money is the most important factor for a happy life. Others believe that other factors, such as family and health, are more important. Discuss both views and give your opinion.",
            "model_essay": "The link between wealth and happiness is a common topic of discussion. While having a high income is helpful, I believe that other factors are more significant for long-term satisfaction. On one hand, money is necessary to cover the cost of living. Without enough money to pay for affordable housing and food, it is very difficult to be happy. On the other hand, money cannot buy health or strong relationships. Many people with exorbitant wealth feel lonely or suffer from stress. In conclusion, while money is essential to make ends meet, it is not as important as health and family. A balanced life is the best way to achieve happiness.",
            "notes": "Uses modal verbs and topic vocabulary effectively."
        },
        "common_mistake": {
            "wrong": "I borrowed my friend some money.",
            "correct": "I lent my friend some money.",
            "explanation": "Use 'lend' when giving money, 'borrow' when receiving."
        },
        "tip": "'Money' is uncountable. Never say 'many moneys.' Use 'a lot of money' or 'large sums of money'."
    },
    # Module 9: Culture and Tradition
    {
        "id": "mastery-module-9",
        "module_number": 9,
        "title": "Culture and Tradition",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Identify vocabulary for heritage, customs, and globalization",
            "Master Relative Clauses to define cultural concepts",
            "Use 'Used to' to compare past and present traditions",
            "Answer Speaking questions about festivals and customs"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Heritage", "meaning": "Traditions passed down from ancestors", "example": "We must preserve our cultural heritage."},
                {"word": "Custom", "meaning": "A traditional practice", "example": "It is a custom to bow in Japan."},
                {"word": "Diversity", "meaning": "Variety of different things", "example": "Cultural diversity enriches society."}
            ],
            "verbs": [
                {"word": "Preserve", "meaning": "To maintain or keep", "example": "We should preserve old buildings."},
                {"word": "Adapt", "meaning": "To adjust to new conditions", "example": "Immigrants adapt to new cultures."},
                {"word": "Appreciate", "meaning": "To recognize the value of", "example": "I appreciate traditional art."}
            ],
            "adjectives": [
                {"word": "Authentic", "meaning": "Genuine, original", "example": "The restaurant serves authentic cuisine."},
                {"word": "Contemporary", "meaning": "Modern, current", "example": "Contemporary art is popular."},
                {"word": "Multicultural", "meaning": "Having many cultures", "example": "London is a multicultural city."}
            ],
            "adverbs": [
                {"word": "Traditionally", "meaning": "According to tradition", "example": "Traditionally, we eat turkey at Christmas."},
                {"word": "Culturally", "meaning": "In terms of culture", "example": "It is culturally significant."},
                {"word": "Uniquely", "meaning": "In a unique way", "example": "Each region is uniquely different."}
            ]
        },
        "collocations": [
            {"phrase": "Cultural heritage", "meaning": "The legacy of physical artifacts and traditions", "example": "Governments should spend more to preserve our cultural heritage."},
            {"phrase": "Deeply-rooted", "meaning": "Strongly established", "example": "Many customs in my country are deeply-rooted in ancient history."}
        ],
        "idiom": {"phrase": "A fish out of water", "meaning": "Someone uncomfortable in a specific situation", "example": "When I first moved abroad, I felt like a fish out of water."},
        "grammar": {
            "title": "Defining Relative Clauses and 'Used to'",
            "explanation": "Relative clauses give essential information about a noun. 'Used to' talks about past habits that no longer exist.",
            "benefit": "Perfect for comparing how traditions have changed over time.",
            "examples": ["A ritual is a ceremony which is performed according to a prescribed order.", "People used to wear traditional clothing every day, but now they only wear it for festivals."]
        },
        "reading": {
            "title": "The Impact of Globalization on Culture",
            "text": "In the modern world, the process of globalization is rapidly changing how we experience culture. Historically, different regions had uniquely distinct customs and rituals. However, as the world becomes more connected, many fear that local heritage is being lost. Fast-food chains and international media have created a contemporary global culture. Some argue that this diversity is beneficial because it allows people to appreciate different ways of life. In many multicultural societies, individuals adapt to new ideas while still holding onto their deeply-rooted beliefs.",
            "questions": [
                {"type": "multiple_choice", "question": "What is the main cause of cultural change mentioned?", "options": ["Local laws", "Globalization", "Historical rituals"], "answer": "Globalization"},
                {"type": "multiple_choice", "question": "What do critics fear is happening to local traditions?", "options": ["They are becoming expensive", "They are being replaced by global identity", "They are becoming diverse"], "answer": "They are being replaced by global identity"},
                {"type": "sentence_completion", "question": "Fast-food chains are an example of __________ global culture.", "answer": "contemporary"},
                {"type": "short_answer", "question": "What kind of societies allow people to adapt to new ideas?", "answer": "Multicultural societies"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "What is your favorite festival?",
                "model_answer": "My favorite is the Spring Festival. It's a traditionally important time where we have many rituals, like family dinners. I really appreciate the chance to see my extended family."
            },
            "part3": {
                "question": "Is it important to preserve traditional buildings?",
                "model_answer": "Yes, definitely. These buildings are part of our cultural heritage. They show us how people used to live. If we don't preserve them, our cities will look the same as everywhere else, which would be a loss of diversity."
            }
        },
        "writing": {
            "question": "Some people think that it is good for a country to have a multicultural society. Others think it leads to the loss of national identity. Discuss both views and give your opinion.",
            "model_essay": "The rise of multicultural societies is a key feature of the modern world. While some worry about the loss of national heritage, I believe that diversity brings more benefits than drawbacks. On one hand, a multicultural society allows people to appreciate different foods, music, and ideas. This makes a country more vibrant and helps people become more tolerant. On the other hand, some feel that their deeply-rooted customs are disappearing. They believe that everyone should follow the same traditionally established rules. In my opinion, it is possible to have both. A country can preserve its history while still welcoming new cultures. This creates a uniquely rich environment that benefits everyone.",
            "notes": "Uses relative clauses and 'used to' effectively."
        },
        "common_mistake": {
            "wrong": "The culture is very important.",
            "correct": "Culture is very important.",
            "explanation": "General concept, no article needed."
        },
        "tip": "Distinguish between Culture (the concept) and A culture (a specific group). Use Cultural (adjective) for 'cultural activities.'"
    },
    # Module 10: Media
    {
        "id": "mastery-module-10",
        "module_number": 10,
        "title": "Media and Advertising",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Master vocabulary related to news, broadcasting, and social media",
            "Use Reported Speech to discuss opinions and news reports",
            "Differentiate between Active and Passive Voice in journalism",
            "Write a Task 2 essay on social media's impact"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Broadcasting", "meaning": "Transmitting programs via radio or TV", "example": "Broadcasting news has changed."},
                {"word": "Journalism", "meaning": "The profession of reporting news", "example": "Good journalism is essential."},
                {"word": "Censorship", "meaning": "Suppression of information", "example": "Censorship limits free speech."}
            ],
            "verbs": [
                {"word": "Broadcast", "meaning": "To transmit a program", "example": "The game was broadcast live."},
                {"word": "Manipulate", "meaning": "To control or influence unfairly", "example": "Ads can manipulate consumers."},
                {"word": "Publicize", "meaning": "To make widely known", "example": "Companies publicize their products."}
            ],
            "adjectives": [
                {"word": "Reliable", "meaning": "Trustworthy", "example": "Is this source reliable?"},
                {"word": "Biased", "meaning": "Showing unfair preference", "example": "The report was biased."},
                {"word": "Sensational", "meaning": "Causing great public interest", "example": "The headline was sensational."}
            ],
            "adverbs": [
                {"word": "Objectively", "meaning": "In an unbiased way", "example": "Report the news objectively."},
                {"word": "Frequently", "meaning": "Often", "example": "News updates frequently."},
                {"word": "Globally", "meaning": "Throughout the world", "example": "The story spread globally."}
            ]
        },
        "collocations": [
            {"phrase": "Breaking news", "meaning": "Information just being received", "example": "The program was interrupted for breaking news."},
            {"phrase": "Target audience", "meaning": "Specific group an ad is aimed at", "example": "Social media ads reach a specific target audience."}
        ],
        "idiom": {"phrase": "Read between the lines", "meaning": "To find the hidden meaning", "example": "When reading political news, you often have to read between the lines."},
        "grammar": {
            "title": "Reported Speech and Passive Voice",
            "explanation": "Reported Speech reports what someone said without exact words. Passive Voice focuses on the action, not the doer.",
            "benefit": "Shows you can handle complex structures and shifts in tense.",
            "examples": ["Many experts claimed that social media was addictive.", "Millions of messages are sent every second."]
        },
        "reading": {
            "title": "The Power of Modern Advertising",
            "text": "In the digital age, the way companies publicize their products has moved away from traditional broadcasting. While television and newspapers still provide significant coverage, the most influential platform today is the internet. Through social media, advertisers can manipulate data to reach a specific target audience with sensational accuracy. This level of personalization makes ads feel more reliable to the consumer, but it also raises concerns about censorship and data privacy.",
            "questions": [
                {"type": "true_false_ng", "question": "Traditional broadcasting is no longer used by advertisers.", "answer": "False"},
                {"type": "true_false_ng", "question": "Social media allows for more accurate targeting than newspapers.", "answer": "True"},
                {"type": "sentence_completion", "question": "Advertisers use data to __________ their audience.", "answer": "manipulate / target"},
                {"type": "short_answer", "question": "What are the two main concerns regarding digital advertising?", "answer": "Censorship and data privacy"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "How do you get your news?",
                "model_answer": "I usually keep up to date with the news through my phone. I follow a few reliable journalism sites so I don't have to wait for the evening broadcast."
            },
            "part2": {
                "cue_card": "Describe an interesting advertisement you saw.\n\nYou should say:\n- what the advertisement was for\n- where you saw it\n- what happened in it\n\nand explain why you found it interesting.",
                "model_answer": "I saw an ad for a new electric car. It was very sensational because it used beautiful music and scenic views. It was clearly aimed at a young target audience who cares about the environment.",
                "tips": [
                    "Describe the visual elements and music used in the advertisement.",
                    "Explain your emotional reaction - did it make you want to buy the product?"
                ],
                "follow_up_questions": [
                    "Do you usually pay attention to advertisements?",
                    "Do you think this advertisement would be effective for everyone?"
                ]
            },
            "part3": {
                "questions": [
                    {
                        "question": "How do you think social media has changed the advertising industry?",
                        "model_answer": "Social media has fundamentally transformed the advertising industry in several ways. Firstly, it has enabled highly targeted advertising, where companies can reach specific demographics based on users' interests, behaviours, and online activity. This is far more efficient than traditional media like television or newspapers, which broadcast to a general audience. Secondly, social media has made advertising more interactive - consumers can now engage directly with brands, share content, and even become brand ambassadors themselves through influencer marketing. However, this shift has also raised concerns about privacy and the manipulation of consumer behaviour. Overall, I believe social media has made advertising more personalised and measurable, but it has also created new ethical challenges."
                    },
                    {
                        "question": "Do you think advertising has too much influence on children?",
                        "model_answer": "I do think advertising has a significant and potentially harmful influence on children. Children are particularly vulnerable to advertising because they often cannot distinguish between entertainment and commercial content, especially in formats like YouTube videos or mobile games. Advertisements for unhealthy foods, toys, and certain lifestyle choices can shape children's preferences and demands, putting pressure on parents. Some countries have introduced restrictions on advertising targeted at children, particularly for junk food, and I believe this is a reasonable approach. Media literacy education should be part of the school curriculum, teaching children to critically evaluate the messages they receive from advertisements."
                    },
                    {
                        "question": "What responsibility do companies have regarding the truthfulness of their advertisements?",
                        "model_answer": "I believe companies have a significant ethical and legal responsibility to ensure their advertisements are truthful and not misleading. False advertising can harm consumers financially and even physically - for example, if a health product makes exaggerated claims. In most countries, there are advertising standards authorities that regulate commercial communications, and companies can face penalties for deceptive practices. However, many advertisements operate in a grey area, using clever wording or impressive imagery that technically doesn't lie but creates misleading impressions. I think companies should go beyond mere legal compliance and adopt ethical marketing practices because honest advertising builds consumer trust and brand loyalty."
                    }
                ]
            }
        },
        "writing": {
            "question": "Some people believe that the media has too much power over our lives. To what extent do you agree?",
            "model_essay": "It is often said that the media is the most influential force in the world today. I agree that it has a huge impact on how we think and behave. First, news coverage can be biased, which means people only hear one side of a story. This can manipulate public opinion. Second, advertising is everywhere, forcing us to buy things we do not need. However, the media also informs us about important global issues. In conclusion, while the media is necessary, we must learn to read between the lines to avoid being controlled by it.",
            "notes": "Uses Reported Speech and Passive Voice."
        },
        "common_mistake": {
            "wrong": "The medias are biased.",
            "correct": "The media is biased.",
            "explanation": "'Media' is usually treated as singular collective noun."
        },
        "tip": "Don't say 'I saw it on the Facebook.' Say 'I saw it on Facebook.'"
    },
    # Module 11: Food and Nutrition
    {
        "id": "mastery-module-11",
        "module_number": 11,
        "title": "Food and Nutrition",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Build vocabulary for diets, cooking, and global food issues",
            "Master Countable vs. Uncountable Nouns",
            "Use Quantifiers (much, many, a lot of, few) correctly"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Cuisine", "meaning": "A style of cooking", "example": "Italian cuisine is famous."},
                {"word": "Nutrition", "meaning": "The process of providing food", "example": "Good nutrition is important."},
                {"word": "Additive", "meaning": "Substance added to food", "example": "This food contains no additives."}
            ],
            "verbs": [
                {"word": "Consume", "meaning": "To eat or drink", "example": "We consume too much sugar."},
                {"word": "Nourish", "meaning": "To provide food for health", "example": "Vegetables nourish the body."},
                {"word": "Preserve", "meaning": "To keep food from spoiling", "example": "Salt is used to preserve meat."}
            ],
            "adjectives": [
                {"word": "Organic", "meaning": "Produced without chemicals", "example": "Organic food is healthier."},
                {"word": "Wholesome", "meaning": "Good for health", "example": "A wholesome meal is important."},
                {"word": "Processed", "meaning": "Treated or changed from natural state", "example": "Avoid processed food."}
            ],
            "adverbs": [
                {"word": "Locally", "meaning": "In the local area", "example": "Buy locally grown produce."},
                {"word": "Excessively", "meaning": "To an extreme degree", "example": "Don't eat excessively."},
                {"word": "Moderately", "meaning": "In a moderate way", "example": "Eat meat moderately."}
            ]
        },
        "collocations": [
            {"phrase": "Balanced diet", "meaning": "A diet with all necessary nutrients", "example": "A balanced diet is essential for children's growth."},
            {"phrase": "Fast food", "meaning": "Food prepared and served quickly", "example": "Fast food often contains too many additives."}
        ],
        "idiom": {"phrase": "Take it with a grain of salt", "meaning": "To not completely believe something", "example": "I take health claims on social media with a grain of salt."},
        "grammar": {
            "title": "Countable/Uncountable Nouns and Quantifiers",
            "explanation": "Distinguish between things we can count (vegetables) and things we cannot (sugar, advice). Use 'much/many' correctly.",
            "benefit": "Correct use of 'is/are' and quantifiers is essential for Band 6 accuracy.",
            "examples": ["There is too much sugar in processed food.", "There are many ingredients in this cuisine."]
        },
        "reading": {
            "title": "The Rise of Organic Farming",
            "text": "The modern consumer is becoming more concerned about what they consume. In the past, people primarily ate locally grown produce. However, the rise of the industrial food system introduced processed items filled with chemical additives to preserve shelf life. In response, organic farming has gained popularity. This method avoids artificial chemicals, focusing instead on wholesome ingredients that nourish the body. While organic food is often more expensive, many believe it provides better nutrition.",
            "questions": [
                {"type": "multiple_choice", "question": "Why did people eat locally in the past?", "options": ["It was cheaper", "Lack of industrial systems", "They preferred the taste"], "answer": "Lack of industrial systems"},
                {"type": "multiple_choice", "question": "What is a disadvantage of organic food?", "options": ["Poor nutrition", "High cost", "Lack of flavor"], "answer": "High cost"},
                {"type": "sentence_completion", "question": "Chemical __________ are used to make food last longer.", "answer": "additives"},
                {"type": "sentence_completion", "question": "Organic farming is a reaction against the __________ food system.", "answer": "industrial"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "What is your favorite type of food?",
                "model_answer": "I really enjoy Italian cuisine. I love the fresh ingredients, and it always feels like a wholesome meal."
            },
            "part3": {
                "question": "Is fast food the biggest cause of health problems?",
                "model_answer": "It is a major factor. Because people consume fast food excessively, they gain weight. However, a lack of exercise is also a problem."
            }
        },
        "writing": {
            "question": "Some people think that everyone should become vegetarian. Others believe that a diet including meat is better. Discuss both views and give your opinion.",
            "model_essay": "The debate over meat and vegetarianism is very popular. Some argue that meat is essential for nutrition, while others claim it is unhealthy. On one hand, meat provides a great deal of protein. In many cuisines, meat is the main ingredient. If people eat meat moderately, it can be part of a balanced diet. On the other hand, processed meat can be harmful. Many people believe that eating organic vegetables is more wholesome. In my opinion, people should reduce their meat consumption but do not need to stop entirely. A balanced diet with more vegetables is the best choice.",
            "notes": "Uses quantifiers and topic vocabulary."
        },
        "common_mistake": {
            "wrong": "I like to eat some fruits.",
            "correct": "I like to eat some fruit.",
            "explanation": "'Fruit' is usually uncountable when talking about it as a food group."
        },
        "tip": "Use the word 'cuisine' instead of 'cooking style' to sound more formal."
    },
    # Module 12: Housing and Urbanization
    {
        "id": "mastery-module-12",
        "module_number": 12,
        "title": "Housing and Urbanization",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Use vocabulary for types of homes and city living",
            "Master Prepositions of Place for describing layouts",
            "Use 'There is / There are' correctly in descriptions"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Accommodation", "meaning": "A place to live", "example": "Finding accommodation is hard."},
                {"word": "Tenant", "meaning": "A person who rents", "example": "The tenant pays rent monthly."},
                {"word": "Amenity", "meaning": "A useful feature of a place", "example": "The apartment has many amenities."}
            ],
            "verbs": [
                {"word": "Reside", "meaning": "To live in a place", "example": "I reside in the city center."},
                {"word": "Renovate", "meaning": "To repair and improve", "example": "They renovated the old house."},
                {"word": "Construct", "meaning": "To build", "example": "New apartments are being constructed."}
            ],
            "adjectives": [
                {"word": "Spacious", "meaning": "Having a lot of space", "example": "The living room is spacious."},
                {"word": "Residential", "meaning": "Designed for people to live in", "example": "This is a residential area."},
                {"word": "Cramped", "meaning": "Uncomfortably small", "example": "The room felt cramped."}
            ],
            "adverbs": [
                {"word": "Conveniently", "meaning": "In a convenient manner", "example": "It's conveniently located near the station."},
                {"word": "Centrally", "meaning": "In the center", "example": "The hotel is centrally located."},
                {"word": "Densely", "meaning": "Closely packed together", "example": "The city is densely populated."}
            ]
        },
        "collocations": [
            {"phrase": "High-rise apartment", "meaning": "A very tall building with many flats", "example": "Living in a high-rise apartment is common in densely populated cities."},
            {"phrase": "Residential area", "meaning": "Part of town where people live", "example": "I live in a quiet residential area."}
        ],
        "idiom": {"phrase": "Home sweet home", "meaning": "Expression of happiness at being home", "example": "After a long trip, there is nothing like home sweet home."},
        "grammar": {
            "title": "There is / There are + Prepositions",
            "explanation": "Used to describe existence and location of things. Essential for Speaking Part 1 (describing your home) and Writing Task 1 (maps).",
            "benefit": "Shows ability to describe locations accurately.",
            "examples": ["There are many amenities near my house.", "There is a small park opposite the high-rise apartment."]
        },
        "reading": {
            "title": "The Challenge of Urban Housing",
            "text": "As more people move to cities, finding affordable accommodation has become a global crisis. In many urban centers, the population is so densely packed that residents must live in cramped conditions. While some prefer the convenience of living centrally near shops and amenities, many families are moving to the suburbs to find more spacious homes. To solve this, developers continue to construct high-rise apartments. However, the cost of rent remains high, making it difficult for many tenants to maintain a good standard of living.",
            "questions": [
                {"type": "short_answer", "question": "Where are families moving to find larger houses?", "answer": "The suburbs"},
                {"type": "short_answer", "question": "What kind of buildings are being constructed to save space?", "answer": "High-rise apartments"},
                {"type": "true_false_ng", "question": "Living in the city center is always cheaper than the suburbs.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Tenants are finding it easy to pay their rent.", "answer": "False"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Do you live in a house or an apartment?",
                "model_answer": "I live in a high-rise apartment in a densely populated area. It's a bit cramped, but it's centrally located, which is very convenient."
            },
            "part2": {
                "cue_card": "Describe your ideal home.",
                "model_answer": "My ideal home would be a spacious house in the suburbs. It would have many amenities like a garden and a modern kitchen. I would love to reside somewhere quiet and residential."
            }
        },
        "writing": {
            "question": "In many cities, there is a shortage of housing. What are the causes and solutions?",
            "model_essay": "Many large cities today face a housing crisis. One cause is urbanization, as people move to cities for work. This makes accommodation very expensive. Another cause is that there is not enough land to construct new houses. To solve this, governments should build more high-rise apartments which can hold many people. Also, they must provide more affordable housing for low-income tenants. If we improve the suburbs, more people might move there, which would reduce the pressure on the city center.",
            "notes": "Uses 'There is/are' and prepositions correctly."
        },
        "common_mistake": {
            "wrong": "I am living in a house with three rooms.",
            "correct": "I live in a house with three rooms.",
            "explanation": "Use Present Simple for permanent situations."
        },
        "tip": "Use 'accommodation' to refer to any kind of housing; it is always uncountable."
    },
    # Module 13: Transportation
    {
        "id": "mastery-module-13",
        "module_number": 13,
        "title": "Transportation",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Master vocabulary related to public transit, traffic, and infrastructure",
            "Use Comparative and Superlative Adjectives to evaluate transport",
            "Apply Future Forms to discuss transportation trends",
            "Write a Band 6 Task 2 essay on traffic congestion"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Congestion", "meaning": "Overcrowding of traffic", "example": "Traffic congestion is a problem."},
                {"word": "Infrastructure", "meaning": "Basic physical structures", "example": "We need better infrastructure."},
                {"word": "Transit", "meaning": "The movement of people or goods", "example": "Public transit is improving."}
            ],
            "verbs": [
                {"word": "Commute", "meaning": "To travel to work regularly", "example": "I commute by train."},
                {"word": "Upgrade", "meaning": "To improve", "example": "They upgraded the roads."},
                {"word": "Minimize", "meaning": "To reduce to the smallest amount", "example": "We should minimize car use."}
            ],
            "adjectives": [
                {"word": "Efficient", "meaning": "Working well without waste", "example": "Trains are efficient."},
                {"word": "Crowded", "meaning": "Full of people", "example": "The bus was crowded."},
                {"word": "Sustainable", "meaning": "Able to be maintained", "example": "We need sustainable transport."}
            ],
            "adverbs": [
                {"word": "Reliably", "meaning": "In a dependable way", "example": "Buses run reliably here."},
                {"word": "Rapidly", "meaning": "Very quickly", "example": "Cities are growing rapidly."},
                {"word": "Daily", "meaning": "Every day", "example": "I commute daily."}
            ]
        },
        "collocations": [
            {"phrase": "Public transport", "meaning": "Buses, trains provided by government", "example": "Using public transport is more sustainable than driving."},
            {"phrase": "Rush hour", "meaning": "Time when traffic is heaviest", "example": "I avoid the highway during rush hour."}
        ],
        "idiom": {"phrase": "In the same boat", "meaning": "In the same difficult situation", "example": "Everyone stuck in this traffic is in the same boat."},
        "grammar": {
            "title": "Comparatives and Future Forms",
            "explanation": "Comparatives compare two transport methods. Future forms discuss trends and predictions.",
            "benefit": "Essential for Writing Task 1 (trends) and Speaking Part 3 (comparisons).",
            "examples": ["Trains are often more efficient than cars.", "Governments are going to upgrade the rail infrastructure next year."]
        },
        "reading": {
            "title": "The Future of Urban Transit",
            "text": "Urban congestion has reached critical levels in many rapidly growing cities. As millions of people commute to work daily, the existing road infrastructure is no longer sufficient. This has led to an increase in air pollution and travel times. To address this, many city planners are focusing on sustainable alternatives. Efficient bus transit systems and new subway lines can move thousands of people more rapidly than private vehicles. Creating accessible lanes for pedestrians and cyclists encourages people to leave their cars at home.",
            "questions": [
                {"type": "multiple_choice", "question": "What is the main cause of air pollution in cities?", "options": ["Factories", "Urban congestion", "Lack of pedestrians"], "answer": "Urban congestion"},
                {"type": "sentence_completion", "question": "High levels of congestion have made the current __________ insufficient.", "answer": "infrastructure"},
                {"type": "sentence_completion", "question": "Creating lanes for cyclists helps __________ the number of cars.", "answer": "minimize / reduce"},
                {"type": "short_answer", "question": "What are two benefits of sustainable transit?", "answer": "Better environment and quality of life"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "How do you usually travel to work or school?",
                "model_answer": "I usually commute by bus. It's quite efficient, and I don't have to worry about parking. However, it can be very crowded during rush hour."
            },
            "part3": {
                "question": "Is it better to travel by car or by train?",
                "model_answer": "I believe trains are better because they are more sustainable and often faster in big cities. Traveling by car is more flexible, but the congestion makes it very stressful."
            }
        },
        "writing": {
            "question": "The best way to solve traffic problems is to increase the price of fuel. To what extent do you agree or disagree?",
            "model_essay": "Traffic congestion is a serious problem in modern cities. Some people believe that making fuel more expensive is the best solution. While I agree this might help, I believe that improving infrastructure is more important. On one hand, if fuel prices are high, people might drive less to save money. This would minimize the number of cars on the road. On the other hand, many people have no choice but to drive because public transport is not accessible in their area. In my opinion, the government should focus on providing efficient and affordable alternatives.",
            "notes": "Uses comparatives and future forms."
        },
        "common_mistake": {
            "wrong": "I go to work by a bus.",
            "correct": "I go to work by bus.",
            "explanation": "Do not use articles after 'by' for modes of transport."
        },
        "tip": "Use 'commute' instead of 'go to work' to sound more formal and precise."
    },
    # Module 14: Crime
    {
        "id": "mastery-module-14",
        "module_number": 14,
        "title": "Crime and Law",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Learn basic vocabulary for crimes, legal system, and prevention",
            "Master the Passive Voice for formal descriptions of law",
            "Practice Modal Verbs of Obligation (must, should)"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Offence", "meaning": "An illegal act", "example": "Theft is a criminal offence."},
                {"word": "Punishment", "meaning": "Penalty for a crime", "example": "The punishment was severe."},
                {"word": "Deterrent", "meaning": "Something that discourages", "example": "Prison is a deterrent."}
            ],
            "verbs": [
                {"word": "Prevent", "meaning": "To stop from happening", "example": "Police prevent crime."},
                {"word": "Commit", "meaning": "To carry out an illegal act", "example": "He committed a crime."},
                {"word": "Rehabilitate", "meaning": "To restore to normal life", "example": "Programs rehabilitate offenders."}
            ],
            "adjectives": [
                {"word": "Illegal", "meaning": "Against the law", "example": "Drug use is illegal."},
                {"word": "Violent", "meaning": "Using physical force", "example": "Violent crime is decreasing."},
                {"word": "Minor", "meaning": "Not serious", "example": "It was a minor offence."}
            ],
            "adverbs": [
                {"word": "Unlawfully", "meaning": "In an illegal manner", "example": "He acted unlawfully."},
                {"word": "Securely", "meaning": "In a safe manner", "example": "The prison is securely guarded."},
                {"word": "Legally", "meaning": "According to law", "example": "It must be done legally."}
            ]
        },
        "collocations": [
            {"phrase": "Commit a crime", "meaning": "To do something illegal", "example": "Young people who commit a crime should be educated."},
            {"phrase": "Prison sentence", "meaning": "Time spent in jail", "example": "He received a long prison sentence."}
        ],
        "idiom": {"phrase": "Against the law", "meaning": "Illegal", "example": "Driving without a license is against the law."},
        "grammar": {
            "title": "Passive Voice and Modals for Obligation",
            "explanation": "Passive Voice focuses on the person affected or the law. Modals express obligation and suggestions.",
            "benefit": "Makes writing about crime sound objective and academic.",
            "examples": ["The new law was enforced to prevent minor offences.", "Governments should invest in rehabilitation programs."]
        },
        "reading": {
            "title": "Preventing Youth Crime",
            "text": "Crime is a significant concern for many societies, particularly minor offences committed by teenagers. Many experts argue that a strict punishment is not always the best deterrent. Instead, they suggest that the focus should be on how to prevent these actions before they happen. Programs that provide after-school activities can keep young people away from illegal activities. When an offence is committed, the legal system must decide if the person should be sent to prison or if they can be rehabilitated through community service.",
            "questions": [
                {"type": "true_false_ng", "question": "Strict punishment is always the best way to stop crime.", "answer": "False"},
                {"type": "true_false_ng", "question": "After-school programs can help prevent teenagers from breaking the law.", "answer": "True"},
                {"type": "sentence_completion", "question": "Programs are designed to keep youth away from __________ activities.", "answer": "illegal"},
                {"type": "short_answer", "question": "What is one alternative to prison for minor crimes?", "answer": "Community service"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Is your city a safe place to live?",
                "model_answer": "Generally, yes. The police enforce the laws strictly, and there aren't many violent crimes. However, some people still worry about minor offences like theft."
            }
        },
        "writing": {
            "question": "Some people think that the best way to reduce crime is to give longer prison sentences. Others believe there are better ways. Discuss both views and give your opinion.",
            "model_essay": "Crime reduction is a complex issue. While some favor long prison sentences, I believe that prevention and rehabilitation are more effective. On one hand, a long sentence acts as a deterrent. It shows that if you commit a crime, the punishment will be severe. On the other hand, prisons are often full, and many people commit crimes again after they are released. It is better to rehabilitate people so they can find jobs. Also, we should prevent crime by improving education. In my opinion, while serious criminals must be punished, we should focus more on education to stop crime before it starts.",
            "notes": "Uses Passive Voice and modal verbs."
        },
        "common_mistake": {
            "wrong": "He did a crime.",
            "correct": "He committed a crime.",
            "explanation": "Always use 'commit' with crime."
        },
        "tip": "Use 'offence' as a synonym for 'crime' to vary your vocabulary."
    },
    # Module 15: Science
    {
        "id": "mastery-module-15",
        "module_number": 15,
        "title": "Science and Research",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Acquire vocabulary for scientific research, space, and technology",
            "Master Zero and First Conditionals for scientific facts and predictions"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Discovery", "meaning": "Finding something new", "example": "A scientific discovery changed medicine."},
                {"word": "Experiment", "meaning": "A scientific test", "example": "They conducted an experiment."},
                {"word": "Evidence", "meaning": "Facts supporting a theory", "example": "There is strong evidence."}
            ],
            "verbs": [
                {"word": "Analyze", "meaning": "To examine in detail", "example": "Scientists analyze data."},
                {"word": "Conduct", "meaning": "To carry out", "example": "We conduct experiments in labs."},
                {"word": "Prove", "meaning": "To demonstrate truth", "example": "The theory was proved correct."}
            ],
            "adjectives": [
                {"word": "Theoretical", "meaning": "Based on theory", "example": "This is theoretical physics."},
                {"word": "Scientific", "meaning": "Related to science", "example": "Scientific research is important."},
                {"word": "Experimental", "meaning": "Based on experiments", "example": "This is an experimental drug."}
            ],
            "adverbs": [
                {"word": "Logically", "meaning": "In a logical manner", "example": "Think logically about the problem."},
                {"word": "Precisely", "meaning": "Exactly", "example": "Measure precisely."},
                {"word": "Technically", "meaning": "In technical terms", "example": "Technically, it is possible."}
            ]
        },
        "collocations": [
            {"phrase": "Conduct an experiment", "meaning": "To perform a scientific test", "example": "Scientists conduct experiments in a laboratory."},
            {"phrase": "Scientific evidence", "meaning": "Facts that support a theory", "example": "There is strong scientific evidence that climate change is real."}
        ],
        "idiom": {"phrase": "Trial and error", "meaning": "Learning by trying and making mistakes", "example": "Most inventions come from trial and error."},
        "grammar": {
            "title": "Zero and First Conditional",
            "explanation": "Zero Conditional for universal truths or scientific facts. First Conditional for likely future outcomes.",
            "benefit": "Essential for discussing scientific facts and predictions.",
            "examples": ["If you heat ice, it melts. (Zero)", "If we invest in research, we will make new discoveries. (First)"]
        },
        "reading": {
            "title": "The Importance of Space Exploration",
            "text": "Scientific discovery has always driven human progress. In recent years, much of this focus has turned toward space. While some argue that the money should be spent on Earth, others believe that conducting experiments in space leads to scientific breakthroughs that benefit everyone. For example, satellite technology was invented through space research and now allows us to communicate virtually anywhere.",
            "questions": [
                {"type": "short_answer", "question": "Where do scientists conduct experiments?", "answer": "In a laboratory / In space"},
                {"type": "short_answer", "question": "What was invented through space research to help communication?", "answer": "Satellite technology"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Should governments spend money on space exploration?",
                "model_answer": "I think so. Space research leads to new discoveries that benefit everyone. Satellite technology, for example, was invented through space programs. If we continue to invest, we will make more breakthroughs."
            }
        },
        "writing": {
            "question": "Should governments spend money on space exploration?",
            "model_essay": "Science is the key to our future. Some say space research is a waste, but I disagree. It leads to new discoveries and scientific evidence about our universe. If we conduct experiments in space, we can invent new materials. In conclusion, science funding is a necessary investment.",
            "notes": "Uses Zero and First Conditional."
        },
        "common_mistake": {
            "wrong": "The scientist made an experiment.",
            "correct": "The scientist conducted an experiment.",
            "explanation": "Use 'conduct' with experiment, not 'make'."
        },
        "tip": "Use 'research' as an uncountable noun. Don't say 'researches'."
    },
    # Module 16: Hobbies and Leisure
    {
        "id": "mastery-module-16",
        "module_number": 16,
        "title": "Hobbies and Leisure",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Master vocabulary for pastimes, recreation, and creative pursuits",
            "Correctly use Gerunds and Infinitives after specific verbs",
            "Analyze a Reading text on the psychological benefits of leisure"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Pastime", "meaning": "An activity done for enjoyment", "example": "Reading is my favorite pastime."},
                {"word": "Pursuit", "meaning": "An activity done regularly", "example": "Painting is a creative pursuit."},
                {"word": "Recreation", "meaning": "Activity done for enjoyment", "example": "The park offers recreation for families."}
            ],
            "verbs": [
                {"word": "Unwind", "meaning": "To relax", "example": "I unwind by listening to music."},
                {"word": "Engage", "meaning": "To participate in", "example": "I engage in many hobbies."},
                {"word": "Socialize", "meaning": "To interact with others", "example": "Hobbies help me socialize."}
            ],
            "adjectives": [
                {"word": "Creative", "meaning": "Involving imagination", "example": "Painting is a creative hobby."},
                {"word": "Solitary", "meaning": "Done alone", "example": "Reading is a solitary activity."},
                {"word": "Fulfilling", "meaning": "Making one feel satisfied", "example": "Volunteering is fulfilling."}
            ],
            "adverbs": [
                {"word": "Leisurely", "meaning": "Without hurry", "example": "I walked leisurely through the park."},
                {"word": "Occasionally", "meaning": "Sometimes", "example": "I occasionally play tennis."},
                {"word": "Eagerly", "meaning": "With enthusiasm", "example": "I eagerly await the weekend."}
            ]
        },
        "collocations": [
            {"phrase": "Take up a hobby", "meaning": "To start a new hobby", "example": "I decided to take up photography last year."},
            {"phrase": "Leisure facilities", "meaning": "Places like gyms or parks for fun", "example": "Local governments should invest in better leisure facilities."}
        ],
        "idiom": {"phrase": "Get a kick out of something", "meaning": "To enjoy something very much", "example": "I really get a kick out of solving complex puzzles."},
        "grammar": {
            "title": "Gerunds vs. Infinitives",
            "explanation": "Some verbs are followed by a gerund (enjoy, suggest) and others by an infinitive (want, decide).",
            "benefit": "Shows accurate grammar use for Band 6.",
            "examples": ["I enjoy painting because it is a creative outlet.", "I decided to join a local club to socialize more."]
        },
        "reading": {
            "title": "The Value of Leisure Time",
            "text": "In modern society, the pressure to be productive often leaves little room for recreation. However, psychologists suggest that having a pastime is essential for mental health. Engaging in a hobby allows the brain to unwind from work-related stress. Whether it is a creative pursuit like pottery or a solitary activity like gardening, these moments are deeply fulfilling. People who regularly set aside time for a hobby often return to their jobs feeling more passionate and refreshed. Furthermore, hobbies provide a chance to socialize with others who share similar interests.",
            "questions": [
                {"type": "true_false_ng", "question": "Leisure time is more important than work productivity.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Hobbies can help improve how someone performs at their job.", "answer": "True"},
                {"type": "sentence_completion", "question": "Having a pastime is considered __________ for mental health.", "answer": "essential"},
                {"type": "short_answer", "question": "What are two examples of creative or solitary pursuits mentioned?", "answer": "Pottery and gardening"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "What do you do in your free time?",
                "model_answer": "In my free time, I like to unwind by playing guitar. I took up this hobby a few years ago, and I regularly practice to improve my skills. It's very fulfilling."
            },
            "part2": {
                "cue_card": "Describe a hobby you enjoy.",
                "model_answer": "I want to talk about photography. It's a creative pastime that I engage in on weekends. I get a kick out of finding beautiful landscapes. It helps me kill time in a productive way and allows me to unwind."
            }
        },
        "writing": {
            "question": "Some people think that hobbies are a waste of time and people should focus only on work or study. To what extent do you agree?",
            "model_essay": "Some believe that leisure activities are not useful and that we should focus solely on our careers. I disagree with this view because hobbies are essential for a balanced life. On one hand, work is necessary for income. However, if a person only works, they might suffer from stress. Engaging in recreation helps the mind unwind. For example, creative hobbies like music or art provide a break from strenuous tasks. On the other hand, hobbies can help people develop new skills. In conclusion, hobbies are not a waste of time; they are a fulfilling part of life that makes us more efficient and happy.",
            "notes": "Uses gerunds and infinitives correctly."
        },
        "common_mistake": {
            "wrong": "I am hobby is swimming.",
            "correct": "My hobby is swimming.",
            "explanation": "Use 'My hobby is...' not 'I am hobby is...'"
        },
        "tip": "Use the word 'pursuit' or 'pastime' instead of saying 'hobby' every time to show range."
    },
    # Module 17: Sports
    {
        "id": "mastery-module-17",
        "module_number": 17,
        "title": "Sports and Competition",
        "level": "band-4.5-6.5",
        "learning_goals": [
            "Acquire vocabulary for athletic performance, teamwork, and spectators",
            "Master Superlative Adjectives and 'Used to'",
            "Write a Task 2 essay on high salaries of professional athletes"
        ],
        "vocabulary": {
            "nouns": [
                {"word": "Spectator", "meaning": "A person watching an event", "example": "The stadium was full of spectators."},
                {"word": "Opponent", "meaning": "A person competing against you", "example": "He defeated his opponent."},
                {"word": "Endurance", "meaning": "Ability to last through difficulty", "example": "Marathon runners need endurance."}
            ],
            "verbs": [
                {"word": "Compete", "meaning": "To take part in a contest", "example": "Athletes compete at the Olympics."},
                {"word": "Outperform", "meaning": "To do better than", "example": "She outperformed her rivals."},
                {"word": "Train", "meaning": "To practice for sport", "example": "I train every morning."}
            ],
            "adjectives": [
                {"word": "Competitive", "meaning": "Having a strong desire to win", "example": "She is very competitive."},
                {"word": "Athletic", "meaning": "Physically strong and active", "example": "He has an athletic build."},
                {"word": "Professional", "meaning": "Doing something as a job", "example": "Professional athletes earn a lot."}
            ],
            "adverbs": [
                {"word": "Skillfully", "meaning": "In a skilled manner", "example": "She played skillfully."},
                {"word": "Intensely", "meaning": "With great effort", "example": "They trained intensely."},
                {"word": "Fairly", "meaning": "In a fair manner", "example": "The game was played fairly."}
            ]
        },
        "collocations": [
            {"phrase": "Team spirit", "meaning": "Feeling of pride and loyalty in a group", "example": "Playing football helps children develop team spirit."},
            {"phrase": "Personal best", "meaning": "One's best ever performance", "example": "The runner beat her personal best."}
        ],
        "idiom": {"phrase": "Level playing field", "meaning": "A situation where everyone has equal opportunities", "example": "In the Olympics, drug testing ensures a level playing field."},
        "grammar": {
            "title": "Superlative Adjectives and 'Used to'",
            "explanation": "Superlatives compare three or more things or show the 'top' level. 'Used to' describes past habits that no longer exist.",
            "benefit": "Use these to describe records, famous athletes, or compare past and present activity.",
            "examples": ["Football is the most popular sport for spectators.", "I used to train every day, but now I only exercise occasionally."]
        },
        "reading": {
            "title": "The Evolution of Professional Sports",
            "text": "The world of sports has changed significantly from its amateur beginnings. Historically, athletes used to compete for the love of the game rather than for money. However, in the modern era, sports have become a professional industry worth billions of dollars. Large stadiums are built to hold thousands of spectators. Athletes now train intensely from a young age to outperform their opponents. To qualify for international events like the Olympics, one must possess exceptional endurance and athletic skill. However, some critics argue that the focus on winning has hurt the team spirit that used to define sports.",
            "questions": [
                {"type": "multiple_choice", "question": "Why did athletes compete in the past?", "options": ["Money", "Love of the game", "Television rights"], "answer": "Love of the game"},
                {"type": "multiple_choice", "question": "What is a concern for critics?", "options": ["Modern stadiums", "Loss of team spirit", "Television coverage"], "answer": "Loss of team spirit"},
                {"type": "sentence_completion", "question": "Modern sports is a professional __________ worth billions.", "answer": "industry"},
                {"type": "short_answer", "question": "What must an athlete have to qualify for the Olympics?", "answer": "Exceptional endurance and athletic skill"}
            ]
        },
        "speaking": {
            "part1": {
                "question": "Do you like sports?",
                "model_answer": "Yes, I'm a big fan of basketball. I used to play it a lot in high school. Now, I mostly enjoy being a spectator and watching games at the stadium."
            },
            "part3": {
                "question": "Should children be encouraged to play competitive sports?",
                "model_answer": "I think so. It helps them learn team spirit and how to face an opponent fairly. However, it shouldn't be too intense because they also need to focus on their studies."
            }
        },
        "writing": {
            "question": "Some people think that professional athletes earn too much money. Others believe that high salaries are justified. Discuss both views and give your opinion.",
            "model_essay": "The high salaries of professional athletes are often criticized. While some people think they are paid too much, others argue they deserve the money. On one hand, many believe that doctors or teachers should earn more than sports stars. They think that playing a game is not as important as saving lives. On the other hand, the career of an athlete is very short. They must train intensely and risk getting injured. Furthermore, millions of spectators pay to watch them, which generates a lot of income. In my opinion, athletes deserve high pay because they have exceptional skills and provide entertainment. However, the money should be shared to improve leisure facilities for everyone.",
            "notes": "Uses superlatives and 'used to' effectively."
        },
        "common_mistake": {
            "wrong": "I am win the game.",
            "correct": "I won the game.",
            "explanation": "Use Past Simple for completed actions."
        },
        "tip": "Distinguish between 'spectators' (watching sports) and 'audience' (watching a play or movie)."
    }
]

async def seed_mastery_course():
    """Seed the IELTS Mastery Blueprint course into MongoDB"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Check if modules already exist
    existing = await db.mastery_course_modules.count_documents({})
    if existing > 0:
        print(f"Found {existing} existing mastery modules. Clearing and re-seeding...")
        await db.mastery_course_modules.delete_many({})
    
    # Insert all modules
    result = await db.mastery_course_modules.insert_many(MASTERY_MODULES)
    print(f"Successfully seeded {len(result.inserted_ids)} mastery course modules!")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_mastery_course())
