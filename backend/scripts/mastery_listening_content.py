#!/usr/bin/env python3
"""
Add listening sections to Mastery Course seed data.
This script updates the MASTERY_MODULES with listening content for all 17 modules.
"""

# Listening content for Mastery Course (Band 4.5-6.5)
MASTERY_LISTENING_CONTENT = {
    1: {
        "title": "Education Today",
        "audio_script": """Hello everyone. Today I want to talk about education and how it is changing around the world.

In the past, students went to school and listened to their teachers. They took notes in notebooks and read from textbooks. But now, things are different. Many students use computers and tablets in class. They can watch videos and do online quizzes.

One big change is online learning. During recent years, many schools started teaching online. Students could study from home. This was helpful for some people, but difficult for others. Some students missed their friends and teachers.

Another change is about what students learn. Today, many schools teach coding and computer skills. These skills are important for jobs in the future. Also, more schools now focus on creativity and teamwork, not just memorizing facts.

However, there are some problems too. Not all families can afford computers or internet. This creates inequality in education. Also, some students spend too much time on screens, which can be bad for their health.

In conclusion, education is changing fast. Technology brings many benefits, but we need to be careful about the challenges too. What do you think? Is technology making education better or worse?""",
        "comprehension_questions": [
            {"question": "What did students use to take notes in the past?", "answer": "Notebooks", "type": "short_answer"},
            {"question": "What can students do with computers and tablets in class?", "answer": "Watch videos and do online quizzes", "type": "short_answer"},
            {"question": "Online learning was helpful for everyone.", "answer": "False", "type": "true_false_ng"},
            {"question": "What new subjects are schools teaching today?", "answer": "Coding and computer skills", "type": "short_answer"},
            {"question": "The speaker thinks technology only has benefits for education.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["online learning", "tablets", "coding", "inequality", "memorizing"],
        "listening_tips": ["Listen for contrast words like 'but', 'however', and 'although'", "Note the speaker's conclusion at the end"]
    },
    2: {
        "title": "Staying Healthy in Modern Life",
        "audio_script": """Hi there. Today's topic is health and how we can stay healthy in our busy modern lives.

Let me start with some facts. According to health experts, many people today do not exercise enough. The World Health Organization says adults should do at least 150 minutes of exercise per week. But many people sit at desks all day for work and then watch TV at home.

Food is another important topic. Fast food is cheap and convenient, but it is often high in fat, sugar, and salt. Eating too much fast food can lead to weight gain and health problems like heart disease. Experts recommend eating more vegetables, fruits, and whole grains.

Sleep is also very important for health. Most adults need seven to eight hours of sleep each night. However, many people stay up late using their phones or watching videos. Poor sleep can affect your concentration and mood.

Mental health is getting more attention these days. Stress from work and life can cause anxiety and depression. It's important to take breaks, spend time with friends and family, and do activities you enjoy.

Here are some simple tips for staying healthy: First, try to walk more and sit less. Second, drink plenty of water. Third, eat regular meals with healthy food. Fourth, get enough sleep. And finally, don't forget to relax and have fun.

Remember, small changes can make a big difference to your health.""",
        "comprehension_questions": [
            {"question": "How many minutes of exercise per week does WHO recommend?", "answer": "150 minutes", "type": "short_answer"},
            {"question": "Fast food is low in fat and sugar.", "answer": "False", "type": "true_false_ng"},
            {"question": "How many hours of sleep do most adults need?", "answer": "Seven to eight hours", "type": "short_answer"},
            {"question": "What can stress cause according to the speaker?", "answer": "Anxiety and depression", "type": "short_answer"},
            {"question": "The speaker gives five tips for staying healthy.", "answer": "True", "type": "true_false_ng"}
        ],
        "vocab_focus": ["exercise", "convenient", "whole grains", "concentration", "mental health"],
        "listening_tips": ["Listen for numbers and statistics", "Pay attention to advice and recommendations"]
    },
    3: {
        "title": "Technology in Daily Life",
        "audio_script": """Good morning everyone. Let's talk about technology and how it affects our daily lives.

Think about your morning routine. Many people wake up to an alarm on their smartphone. They check messages and emails before getting out of bed. During breakfast, they might read news on a tablet or watch videos.

Technology has changed the way we communicate. In the past, people wrote letters and waited days or weeks for a reply. Now, we can send messages instantly. We can video call friends and family anywhere in the world. This is amazing, but some people worry that we talk face-to-face less often.

Shopping has also changed. Many people now buy things online instead of going to stores. This is convenient because you can shop anytime and compare prices easily. However, some local shops are closing because of online competition.

At work, technology helps us do things faster. We can create documents, send files, and have meetings online. Many people can now work from home, which saves time on traveling.

But technology also has negative effects. Many people check their phones constantly. This can be distracting and addictive. Also, children who spend too much time on screens may have problems with social skills.

What can we do? Experts suggest having "digital detox" periods when we don't use devices. It's also good to have phone-free meals with family. Technology is useful, but we need to use it wisely.""",
        "comprehension_questions": [
            {"question": "What do many people do before getting out of bed?", "answer": "Check messages and emails", "type": "short_answer"},
            {"question": "In the past, replies to letters came instantly.", "answer": "False", "type": "true_false_ng"},
            {"question": "Why are some local shops closing?", "answer": "Because of online competition", "type": "short_answer"},
            {"question": "What is a 'digital detox'?", "answer": "A period when we don't use devices", "type": "short_answer"},
            {"question": "The speaker thinks technology should not be used at all.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["smartphone", "instantly", "convenient", "distracting", "addictive"],
        "listening_tips": ["Notice the structure: positives and negatives of technology", "Listen for the speaker's balanced conclusion"]
    },
    4: {
        "title": "Protecting Our Environment",
        "audio_script": """Hello. Today I'd like to discuss the environment and what we can do to protect it.

Climate change is one of the biggest challenges we face. Scientists say the Earth is getting warmer because of greenhouse gases. These gases come from cars, factories, and power plants that burn fossil fuels like oil and coal.

The effects of climate change are serious. Sea levels are rising, which threatens coastal cities. Weather is becoming more extreme, with stronger storms and longer droughts. Many animals are losing their homes as habitats change.

Pollution is another major problem. Air pollution from traffic and industry can cause breathing problems. Water pollution from factories and farms harms rivers and oceans. Plastic waste is especially concerning because it doesn't break down and ends up in the sea.

But there is hope. Many countries are switching to renewable energy like solar and wind power. Electric cars are becoming more popular. Some cities are planting more trees and creating parks.

What can ordinary people do? Here are some simple actions: Reduce, reuse, and recycle. Use public transport or ride a bicycle instead of driving. Save energy by turning off lights and appliances. Bring reusable bags when shopping. Eat less meat, as animal farming produces many greenhouse gases.

Every small action helps. If everyone makes small changes, together we can make a big difference for our planet.""",
        "comprehension_questions": [
            {"question": "What causes greenhouse gases according to the speaker?", "answer": "Cars, factories, and power plants burning fossil fuels", "type": "short_answer"},
            {"question": "Sea levels are falling due to climate change.", "answer": "False", "type": "true_false_ng"},
            {"question": "Why is plastic waste concerning?", "answer": "It doesn't break down and ends up in the sea", "type": "short_answer"},
            {"question": "What type of energy is solar and wind power?", "answer": "Renewable energy", "type": "short_answer"},
            {"question": "The speaker believes individual actions can make a difference.", "answer": "True", "type": "true_false_ng"}
        ],
        "vocab_focus": ["climate change", "greenhouse gases", "fossil fuels", "renewable energy", "reusable"],
        "listening_tips": ["Listen for cause and effect relationships", "Note the action items mentioned at the end"]
    },
    5: {
        "title": "Finding the Right Career",
        "audio_script": """Hi everyone. Today we're going to talk about work and careers.

Choosing a career is one of the most important decisions in life. When you're young, people often ask "What do you want to be when you grow up?" But finding the right job isn't always easy.

What makes a good job? For some people, salary is the most important thing. They want to earn enough money to support their family and enjoy life. For others, job satisfaction matters more. They want to do work that is interesting and meaningful.

The job market has changed a lot in recent years. Some traditional jobs are disappearing because of automation and technology. But new jobs are being created too, especially in technology, healthcare, and green energy.

Many experts say that in the future, people will change jobs more often. The idea of working for one company for your whole life is becoming less common. Workers need to keep learning new skills throughout their careers.

Here are some tips for career success: First, think about what you enjoy and what you're good at. Second, get education and training in your chosen field. Third, gain experience through internships or part-time work. Fourth, build a network of professional contacts. Fifth, be open to new opportunities and challenges.

Work-life balance is also important. Working too much can cause stress and health problems. Make sure to spend time with family and friends, and do activities you enjoy outside of work.

Good luck with your career journey!""",
        "comprehension_questions": [
            {"question": "What is most important for some people when choosing a job?", "answer": "Salary", "type": "short_answer"},
            {"question": "Traditional jobs are increasing due to automation.", "answer": "False", "type": "true_false_ng"},
            {"question": "In which fields are new jobs being created?", "answer": "Technology, healthcare, and green energy", "type": "short_answer"},
            {"question": "The speaker gives how many tips for career success?", "answer": "Five", "type": "short_answer"},
            {"question": "Working too much has no negative effects according to the speaker.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["career", "salary", "job satisfaction", "automation", "work-life balance"],
        "listening_tips": ["Listen for contrasting opinions about what makes a good job", "Note the list of tips for success"]
    },
    6: {
        "title": "Exploring the World Through Travel",
        "audio_script": """Good afternoon. Let's talk about travel and tourism today.

Travel has become much easier and cheaper than it was in the past. Budget airlines offer low prices, and websites help us compare options and book trips. More people than ever are traveling abroad for holidays.

Why do people travel? Many want to relax and escape from their daily routine. Others want to experience different cultures and try new foods. Some people travel for adventure, like hiking mountains or diving in tropical waters. And of course, many people travel for work or to visit family.

Tourism brings many benefits. It creates jobs in hotels, restaurants, and attractions. It brings money to local communities. Travel also helps people understand different cultures, which can promote peace and tolerance.

However, tourism also has problems. Popular destinations can become too crowded. This is sometimes called "overtourism." Venice, Barcelona, and Bali have all struggled with too many visitors. Overtourism can damage the environment and make life difficult for local residents.

Air travel is also bad for the environment. Planes produce a lot of carbon dioxide, which contributes to climate change. Some travelers are now choosing trains instead of planes, or traveling less often.

What can responsible tourists do? Respect local customs and traditions. Try to support local businesses instead of international chains. Don't drop litter or damage nature. Consider the environmental impact of your travel choices.

Travel can be a wonderful experience that broadens your mind. Just remember to be a responsible tourist wherever you go.""",
        "comprehension_questions": [
            {"question": "What has made travel easier and cheaper?", "answer": "Budget airlines and websites for comparing options", "type": "short_answer"},
            {"question": "Tourism has no benefits for local communities.", "answer": "False", "type": "true_false_ng"},
            {"question": "What is 'overtourism'?", "answer": "When popular destinations become too crowded", "type": "short_answer"},
            {"question": "Which cities are mentioned as struggling with overtourism?", "answer": "Venice, Barcelona, and Bali", "type": "short_answer"},
            {"question": "The speaker encourages travelers to support international chains.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["budget airlines", "tourism", "overtourism", "carbon dioxide", "responsible"],
        "listening_tips": ["Listen for both benefits and problems of tourism", "Note the advice for responsible travelers"]
    },
    7: {
        "title": "Family Life in the Modern World",
        "audio_script": """Hello everyone. Today's topic is family and relationships.

Family structures are changing around the world. In the past, many people lived in extended families with grandparents, parents, and children all in one home. Now, nuclear families with just parents and children are more common, especially in cities.

The role of parents has also changed. In many countries, both mothers and fathers now work outside the home. This means families need childcare, and parents have less time with their children. However, many fathers are now more involved in taking care of children than in the past.

Another change is that people are getting married later. Many young adults focus on education and career before starting a family. Some couples choose not to have children at all. This is a personal choice that more people feel free to make.

Relationships between generations can be challenging. Teenagers often want independence, while parents worry about their safety. Grandparents may not understand young people's use of technology. But strong family relationships are still very important for happiness and wellbeing.

Communication is key to good family relationships. Families should try to eat meals together regularly. It's important to listen to each other and show respect for different opinions. Spending quality time together, even doing simple activities, helps strengthen family bonds.

In conclusion, families today may look different from the past, but the importance of love, support, and connection remains the same.""",
        "comprehension_questions": [
            {"question": "What type of family is now more common in cities?", "answer": "Nuclear families", "type": "short_answer"},
            {"question": "Fathers are less involved in childcare now than in the past.", "answer": "False", "type": "true_false_ng"},
            {"question": "Why are people getting married later?", "answer": "They focus on education and career first", "type": "short_answer"},
            {"question": "What is key to good family relationships according to the speaker?", "answer": "Communication", "type": "short_answer"},
            {"question": "The speaker thinks love and support in families is no longer important.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["extended families", "nuclear families", "childcare", "independence", "wellbeing"],
        "listening_tips": ["Listen for changes between past and present", "Note the speaker's conclusion about family importance"]
    },
    8: {
        "title": "Food and Eating Habits",
        "audio_script": """Hi there. Today we're discussing food and nutrition.

Food is essential for life, but it's also about culture, pleasure, and community. Different countries have different traditional foods and eating customs. These traditions are passed down through generations.

However, eating habits are changing globally. Fast food chains are now everywhere, from New York to Shanghai. People eat more processed foods and fewer home-cooked meals. This is partly because modern life is busy, and cooking takes time.

These changes affect health. Obesity rates are rising in many countries. Diabetes, heart disease, and other diet-related illnesses are becoming more common. Health experts are concerned about the amount of sugar, salt, and fat in modern diets.

At the same time, there's growing interest in healthy eating. Organic food, which is grown without chemicals, is popular with many consumers. Vegetarian and vegan diets are becoming more mainstream. People want to know where their food comes from and how it's produced.

Food choices also affect the environment. Meat production, especially beef, creates a lot of greenhouse gases. Growing food requires land and water. Food waste is another big problem – about one-third of all food produced is thrown away.

Here are some tips for healthy, sustainable eating: Eat plenty of fruits and vegetables. Choose whole grains instead of white bread and rice. Limit sugary drinks and snacks. Try to waste less food by planning meals and using leftovers. Consider eating less meat and more plant-based foods.

Remember, small changes in your diet can benefit both your health and the planet.""",
        "comprehension_questions": [
            {"question": "Why are people eating more processed foods?", "answer": "Because modern life is busy and cooking takes time", "type": "short_answer"},
            {"question": "Obesity rates are falling in most countries.", "answer": "False", "type": "true_false_ng"},
            {"question": "What is organic food?", "answer": "Food grown without chemicals", "type": "short_answer"},
            {"question": "What fraction of food produced is thrown away?", "answer": "About one-third", "type": "short_answer"},
            {"question": "The speaker suggests eating more meat for health.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["processed foods", "obesity", "organic", "vegetarian", "sustainable"],
        "listening_tips": ["Listen for health problems related to diet", "Note the tips for healthy eating at the end"]
    },
    9: {
        "title": "Sports and Physical Activity",
        "audio_script": """Good morning everyone. Let's talk about sports and fitness today.

Sports have been part of human culture for thousands of years. The ancient Olympics began in Greece nearly 3,000 years ago. Today, billions of people around the world watch and play sports.

Playing sports has many benefits. It keeps your body fit and healthy. It helps you maintain a healthy weight and strengthens your muscles and bones. Regular exercise also reduces the risk of many diseases.

Sports are also good for mental health. Physical activity releases chemicals in the brain that make you feel happy. Exercise can reduce stress, anxiety, and depression. Many people find that playing sports helps them sleep better.

Team sports teach important life skills. Players learn about teamwork, cooperation, and communication. They learn how to win gracefully and lose with dignity. Sports can build confidence and self-discipline.

However, there are some concerns about sports. Professional athletes face pressure to perform, which can lead to stress and injury. Some athletes use drugs to improve their performance, which is cheating and dangerous. Young athletes sometimes push themselves too hard.

You don't need to be a professional athlete to enjoy sports. Walking, swimming, cycling, and dancing are all great forms of exercise. The important thing is to find an activity you enjoy and do it regularly.

Health experts recommend at least 30 minutes of moderate exercise most days of the week. This could be a brisk walk, a bike ride, or playing with your children. Find what works for you and make it part of your routine.

Stay active and have fun!""",
        "comprehension_questions": [
            {"question": "When did the ancient Olympics begin?", "answer": "Nearly 3,000 years ago in Greece", "type": "short_answer"},
            {"question": "Exercise increases stress and anxiety.", "answer": "False", "type": "true_false_ng"},
            {"question": "What life skills do team sports teach?", "answer": "Teamwork, cooperation, and communication", "type": "short_answer"},
            {"question": "How many minutes of exercise per day do health experts recommend?", "answer": "At least 30 minutes", "type": "short_answer"},
            {"question": "You must be a professional to enjoy the benefits of sports.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["physical activity", "mental health", "teamwork", "self-discipline", "moderate"],
        "listening_tips": ["Listen for benefits of sports mentioned", "Note both physical and mental health benefits"]
    },
    10: {
        "title": "Media and Entertainment",
        "audio_script": """Hello. Today's topic is media and entertainment.

The media landscape has changed dramatically in recent years. Traditional media like newspapers, radio, and television are still important, but many people now get their news and entertainment online.

Streaming services have transformed how we watch TV and movies. Instead of waiting for shows at scheduled times, we can watch what we want, when we want. This is convenient, but some people worry about "binge-watching" – watching many episodes in one sitting.

Social media platforms like Facebook, Instagram, and TikTok are hugely popular. They let us connect with friends, share photos and videos, and follow celebrities. However, social media can also spread false information. It's important to check if news stories are true before sharing them.

Video games are another major form of entertainment. Gaming is now bigger than the movie and music industries combined. Many games are social, with players connecting online from around the world. However, excessive gaming can become addictive for some people.

Music has also changed. Streaming services let us listen to millions of songs. But some musicians complain they don't earn much money from streaming. Live concerts remain popular and are an important source of income for artists.

Media influences how we see the world. Advertising tries to make us buy things. News coverage shapes our understanding of events. It's important to be critical consumers of media – to think carefully about what we see and read.

In conclusion, we have more entertainment choices than ever before. The challenge is to enjoy media responsibly and not let it take over our lives.""",
        "comprehension_questions": [
            {"question": "How do many people get their news now?", "answer": "Online", "type": "short_answer"},
            {"question": "What is 'binge-watching'?", "answer": "Watching many episodes in one sitting", "type": "short_answer"},
            {"question": "Social media always spreads accurate information.", "answer": "False", "type": "true_false_ng"},
            {"question": "How big is the gaming industry compared to movies and music?", "answer": "Bigger than both combined", "type": "short_answer"},
            {"question": "The speaker encourages us to be critical consumers of media.", "answer": "True", "type": "true_false_ng"}
        ],
        "vocab_focus": ["streaming services", "binge-watching", "social media", "false information", "addictive"],
        "listening_tips": ["Listen for changes in different types of media", "Note the speaker's advice about being critical"]
    },
    11: {
        "title": "Managing Money Wisely",
        "audio_script": """Hi everyone. Today we're going to discuss money and finances.

Money is a necessary part of life. We need it to pay for housing, food, transportation, and other essentials. But managing money wisely isn't always easy, and many people struggle with financial problems.

Budgeting is the foundation of good money management. A budget is a plan for how you'll spend your money. Start by listing your income – how much money you receive. Then list your expenses – rent, bills, food, transport, and other costs. Make sure your spending doesn't exceed your income.

Saving is also important. Financial experts recommend saving at least 10-20% of your income. An emergency fund can help you cope with unexpected expenses like car repairs or medical bills. Savings can also help you achieve goals like buying a home or taking a holiday.

Debt can be a big problem. Credit cards make it easy to spend money you don't have. The interest rates on credit card debt are usually very high. If possible, pay off your credit card balance in full each month. Be careful with loans and only borrow what you can afford to repay.

Investing is a way to grow your money over time. Stocks, bonds, and property are common investments. Investing involves risk – you could lose money – but historically, investments have grown over the long term. It's wise to start investing early, even with small amounts.

Here are some simple tips: Track your spending to see where your money goes. Look for ways to reduce unnecessary expenses. Avoid impulse buying – wait a day before making big purchases. Learn about personal finance – there are many books and websites that can help.

Remember, good money habits can help you achieve financial security and peace of mind.""",
        "comprehension_questions": [
            {"question": "What is a budget?", "answer": "A plan for how you'll spend your money", "type": "short_answer"},
            {"question": "Financial experts recommend saving 50% of income.", "answer": "False", "type": "true_false_ng"},
            {"question": "What is an emergency fund for?", "answer": "To cope with unexpected expenses", "type": "short_answer"},
            {"question": "What common types of investments are mentioned?", "answer": "Stocks, bonds, and property", "type": "short_answer"},
            {"question": "Investing always guarantees you will make money.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["budgeting", "expenses", "emergency fund", "debt", "investing"],
        "listening_tips": ["Listen for specific percentages and recommendations", "Note the warnings about debt and credit cards"]
    },
    12: {
        "title": "Housing and Living Spaces",
        "audio_script": """Good afternoon. Let's talk about housing and architecture today.

Everyone needs a place to live. Housing provides shelter, safety, and a space for family life. But finding affordable, suitable housing is a challenge in many parts of the world.

Housing prices have risen dramatically in recent decades, especially in big cities. In places like London, New York, and Hong Kong, many young people cannot afford to buy homes. They must rent instead, often paying a large portion of their income for housing.

This has led to changes in how people live. More adults are living with their parents for longer. Some people share apartments with roommates to reduce costs. Others move to cheaper areas far from city centers, accepting long commutes to work.

Architecture is also evolving. Apartments are getting smaller as developers try to fit more units in expensive areas. "Micro-apartments" and "tiny homes" are trends in some cities. On the other hand, some people are moving to suburbs where they can have larger homes with gardens.

Sustainable housing is becoming more important. Energy-efficient homes use less electricity and gas, which saves money and helps the environment. Solar panels, good insulation, and efficient heating systems are increasingly common.

Smart home technology is also growing. People can control lights, heating, and security systems from their phones. Voice assistants like Alexa can play music or answer questions.

What makes a good home? It's not just about size or location. A good home should be comfortable, safe, and affordable. It should meet your needs and make you feel relaxed and happy.

Think about what matters most to you in a home. Everyone's priorities are different.""",
        "comprehension_questions": [
            {"question": "What cities are mentioned as having high housing prices?", "answer": "London, New York, and Hong Kong", "type": "short_answer"},
            {"question": "Young people in expensive cities can easily afford to buy homes.", "answer": "False", "type": "true_false_ng"},
            {"question": "What are 'micro-apartments'?", "answer": "Very small apartments (a trend in some cities)", "type": "short_answer"},
            {"question": "What does sustainable housing use less of?", "answer": "Electricity and gas", "type": "short_answer"},
            {"question": "According to the speaker, a good home is only about size.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["affordable", "rent", "commutes", "sustainable", "energy-efficient"],
        "listening_tips": ["Listen for examples of how housing is changing", "Note both challenges and solutions mentioned"]
    },
    13: {
        "title": "Crime and Safety",
        "audio_script": """Hello everyone. Today's topic is crime and law.

Safety is something we often take for granted until something goes wrong. Most people want to live in communities where they feel safe, where crime rates are low and laws are fairly enforced.

Crime takes many forms. Theft, burglary, and robbery are crimes against property. Assault and violence are crimes against people. Fraud involves deceiving people to get their money. Cybercrime is a growing problem as more of our lives move online.

What causes crime? There's no simple answer. Poverty and unemployment are linked to higher crime rates. Drug and alcohol addiction can lead people to commit crimes. Some people argue that harsh punishments deter crime, while others focus on addressing root causes like education and social support.

The justice system deals with people who break the law. Police investigate crimes and arrest suspects. Courts decide if people are guilty or innocent. Prisons punish offenders and are supposed to rehabilitate them.

However, justice systems aren't perfect. Sometimes innocent people are wrongly convicted. Some argue that punishments are too harsh, especially for minor crimes. Others believe the system is too lenient and doesn't protect victims enough.

What can ordinary people do to stay safe? Be aware of your surroundings, especially at night. Secure your home with good locks. Be careful online – don't share personal information with strangers. Report suspicious activity to the police.

Communities can also work together to reduce crime. Neighborhood watch programs, youth activities, and community centers can all help create safer areas.

Safety is everyone's responsibility.""",
        "comprehension_questions": [
            {"question": "What type of crime is burglary?", "answer": "A crime against property", "type": "short_answer"},
            {"question": "Cybercrime is decreasing as more people go online.", "answer": "False", "type": "true_false_ng"},
            {"question": "What factors are linked to higher crime rates?", "answer": "Poverty and unemployment", "type": "short_answer"},
            {"question": "What do courts do in the justice system?", "answer": "Decide if people are guilty or innocent", "type": "short_answer"},
            {"question": "The speaker says justice systems are always perfect.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["crime rates", "fraud", "cybercrime", "justice system", "rehabilitate"],
        "listening_tips": ["Listen for different types of crimes mentioned", "Note both causes and solutions for crime"]
    },
    14: {
        "title": "Language Learning and Communication",
        "audio_script": """Hi there. Today we're discussing language and communication.

Language is what makes us human. It allows us to share ideas, express feelings, and connect with others. Most children learn their first language naturally, without formal teaching.

Learning a second language is different. It requires effort and practice. But the benefits are significant. Speaking multiple languages opens doors to new cultures, friendships, and job opportunities. Research also shows that bilingual people may have better memory and problem-solving skills.

English has become a global language. It's the main language of international business, science, and the internet. This is why millions of people around the world study English. However, many worry that English dominance threatens smaller languages.

How can you learn a language effectively? Experts say immersion is the best method – being surrounded by the language in daily life. But even without living abroad, you can create immersion experiences. Watch films and TV shows in your target language. Listen to podcasts and music. Read books and news articles. Practice speaking with native speakers online.

Technology has made language learning easier. Apps like Duolingo make practice fun and convenient. Online tutors offer affordable lessons. Translation tools help when you're stuck.

Communication is more than just words. Body language, facial expressions, and tone of voice all carry meaning. In some cultures, direct communication is valued. In others, indirect communication is preferred. Understanding these differences is important in our globalized world.

Keep practicing and don't be afraid to make mistakes. Mistakes are a natural part of learning. The most important thing is to communicate and be understood.""",
        "comprehension_questions": [
            {"question": "How do most children learn their first language?", "answer": "Naturally, without formal teaching", "type": "short_answer"},
            {"question": "Bilingual people have worse memory skills.", "answer": "False", "type": "true_false_ng"},
            {"question": "What is the best method for learning a language according to experts?", "answer": "Immersion", "type": "short_answer"},
            {"question": "What app for language learning is mentioned?", "answer": "Duolingo", "type": "short_answer"},
            {"question": "The speaker encourages learners to avoid making mistakes.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["bilingual", "immersion", "target language", "body language", "globalized"],
        "listening_tips": ["Listen for tips on how to learn languages", "Note the difference between verbal and non-verbal communication"]
    },
    15: {
        "title": "Science and Discovery",
        "audio_script": """Good morning everyone. Let's talk about science and research today.

Science has transformed our world. Medical advances have doubled life expectancy in the past century. Technology has made travel, communication, and daily life easier. Scientific understanding helps us address challenges like climate change and disease.

How does science work? Scientists observe the world and ask questions. They form hypotheses – educated guesses about how things work. They test these hypotheses through experiments. If the evidence supports their ideas, they share their findings with other scientists for review.

This process, called the scientific method, has produced remarkable discoveries. We've learned that the Earth orbits the Sun, that diseases are caused by germs, and that DNA carries our genetic information. Each discovery builds on previous knowledge.

Scientists work in many fields. Biologists study living things. Physicists explore matter and energy. Chemists investigate substances and reactions. Earth scientists study our planet and its history.

Scientific research faces challenges. Good research requires funding, and competition for grants is intense. Some important research areas don't attract investment because they're not profitable. There are also debates about ethics – what kinds of research are acceptable.

Science literacy is important for everyone. Understanding basic science helps us make informed decisions about health, environment, and technology. It also helps us recognize false claims and misinformation.

Encouragingly, many young people are interested in science careers. STEM education – science, technology, engineering, and math – is a priority in many countries.

Science is a human adventure of discovery. Who knows what we'll learn next?""",
        "comprehension_questions": [
            {"question": "What is a hypothesis?", "answer": "An educated guess about how things work", "type": "short_answer"},
            {"question": "The scientific method has produced no important discoveries.", "answer": "False", "type": "true_false_ng"},
            {"question": "What do biologists study?", "answer": "Living things", "type": "short_answer"},
            {"question": "What does STEM stand for?", "answer": "Science, technology, engineering, and math", "type": "short_answer"},
            {"question": "Science literacy helps us recognize misinformation.", "answer": "True", "type": "true_false_ng"}
        ],
        "vocab_focus": ["hypothesis", "experiments", "evidence", "funding", "STEM education"],
        "listening_tips": ["Listen for how the scientific method works", "Note the challenges facing scientific research"]
    },
    16: {
        "title": "Art and Cultural Expression",
        "audio_script": """Hello. Today's topic is art and culture.

Art has been part of human life since prehistoric times. Cave paintings from 40,000 years ago show that early humans had the desire to create and express themselves. Today, art takes countless forms – painting, sculpture, music, dance, literature, film, and more.

Why is art important? Art helps us express emotions and ideas that are hard to put into words. It challenges us to think differently and see the world from new perspectives. Art also preserves cultural heritage, connecting us to our ancestors and traditions.

Every culture has its own artistic traditions. Japanese calligraphy, African drumming, Indian classical dance, and European opera are all unique forms of cultural expression. These traditions are valuable and worth preserving.

However, art is also changing. Digital technology has created new art forms like video games, digital animation, and virtual reality experiences. Social media lets artists share their work with global audiences instantly. Some people debate whether these new forms are really "art."

Access to art is important. Museums, galleries, and concert halls can be expensive or intimidating for some people. Public art, street performances, and community arts programs help make art accessible to everyone.

Art education faces challenges in many countries. When budgets are tight, art and music classes are often cut. But studies show that arts education develops creativity, critical thinking, and emotional intelligence.

You don't need to be a professional to enjoy art. Visit museums, listen to different music, read poetry, watch films from other countries. Creating art yourself – even simple drawing or singing – can be rewarding.

Art enriches our lives and makes us more human.""",
        "comprehension_questions": [
            {"question": "How old are the oldest cave paintings mentioned?", "answer": "40,000 years old", "type": "short_answer"},
            {"question": "Art only helps us express ideas that are easy to explain.", "answer": "False", "type": "true_false_ng"},
            {"question": "What new art forms has digital technology created?", "answer": "Video games, digital animation, and virtual reality", "type": "short_answer"},
            {"question": "What does arts education develop according to studies?", "answer": "Creativity, critical thinking, and emotional intelligence", "type": "short_answer"},
            {"question": "The speaker says you must be professional to enjoy art.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["cultural heritage", "traditions", "digital animation", "accessible", "emotional intelligence"],
        "listening_tips": ["Listen for examples of different art forms", "Note both traditional and new forms of art mentioned"]
    },
    17: {
        "title": "Shopping and Consumer Choices",
        "audio_script": """Hi everyone. Today we're going to discuss shopping and consumerism.

Shopping has changed dramatically in recent years. Online shopping has exploded in popularity. You can buy almost anything from your phone or computer and have it delivered to your door. This is incredibly convenient, but it's also changing our cities, as traditional shops close.

Advertising surrounds us everywhere. Companies spend billions trying to convince us to buy their products. Ads appear on TV, social media, websites, and even in video games. Children are especially influenced by advertising.

Consumer culture encourages us to always want more. New phone models, fashion trends, and must-have gadgets create constant pressure to buy. But does buying more things make us happier? Research suggests that experiences, not possessions, bring lasting happiness.

There are ethical concerns about consumption too. Many cheap products are made by workers in poor conditions. Fast fashion – trendy clothes at low prices – creates enormous waste as people discard items quickly. The environmental impact of manufacturing and shipping goods around the world is significant.

Some people are pushing back against consumer culture. The minimalist movement encourages owning fewer, better quality possessions. Second-hand shopping at charity shops and online marketplaces is growing. "Buy nothing" groups share items for free within communities.

How can we be smarter consumers? Ask yourself if you really need something before buying. Research products and companies – look for ethical and sustainable options. Take care of what you own so it lasts longer. Consider buying second-hand.

Being a conscious consumer means thinking about the impact of our choices – on our wallets, on workers, and on the environment.

Shop wisely!""",
        "comprehension_questions": [
            {"question": "What is changing our cities according to the speaker?", "answer": "Online shopping (causing traditional shops to close)", "type": "short_answer"},
            {"question": "Advertising has little influence on children.", "answer": "False", "type": "true_false_ng"},
            {"question": "What brings lasting happiness according to research?", "answer": "Experiences, not possessions", "type": "short_answer"},
            {"question": "What is the minimalist movement about?", "answer": "Owning fewer, better quality possessions", "type": "short_answer"},
            {"question": "The speaker encourages us to buy as much as possible.", "answer": "False", "type": "true_false_ng"}
        ],
        "vocab_focus": ["online shopping", "consumer culture", "fast fashion", "minimalist", "sustainable"],
        "listening_tips": ["Listen for problems with consumer culture", "Note the tips for being a smarter consumer"]
    }
}

if __name__ == "__main__":
    # Print sample data structure
    import json
    sample = MASTERY_LISTENING_CONTENT[1]
    print("Sample listening content structure:")
    print(json.dumps(sample, indent=2, ensure_ascii=False)[:1000])
