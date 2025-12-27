#!/usr/bin/env python3
"""
Generate listening content and audio for Advanced Mastery Modules 6-20
"""

import os
from elevenlabs import ElevenLabs, VoiceSettings

ELEVENLABS_API_KEY = "sk_6d53acc086b064e9d104119ba83ff0dd4d85a7e5141420e7"
OUTPUT_DIR = "/app/frontend/public/audio/advanced_mastery"
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George - British male

# Listening content for modules 6-20
LISTENING_DATA = {
    6: {
        "title": "Academic Lecture: Criminal Justice and Rehabilitation",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_6_listening.mp3",
        "introduction": "You will hear a lecture about criminal justice systems and rehabilitation approaches. Listen carefully and answer questions 1-6.",
        "transcript": """Good morning, everyone. Today we examine one of society's most challenging questions: how should we respond to crime? The debate between punitive and rehabilitative approaches has shaped criminal justice policy for centuries.

Traditional punitive systems focus on punishment as deterrence. The theory suggests that harsh sentences discourage both offenders and potential criminals. However, research from the Norwegian Correctional Service challenges this assumption. Norway's rehabilitation-focused prisons have achieved a remarkably low recidivism rate of just 20%, compared to approximately 76% in more punitive systems like the United States.

The key difference lies in philosophy. Norwegian prisons operate on the principle of normality, where inmates live in conditions resembling the outside world as closely as possible. Prisoners have access to education, vocational training, and mental health services. Guards are trained in social work rather than purely security functions.

Critics argue this approach is too lenient, yet the evidence supports its effectiveness. A landmark study by the RAND Corporation found that inmates who participate in educational programs are 43% less likely to reoffend. Furthermore, rehabilitative programs prove cost-effective. While Norway spends approximately $93,000 per prisoner annually, the long-term savings from reduced reoffending far outweigh initial costs.

The challenge lies in implementation. Successful rehabilitation requires adequate funding, trained personnel, and political will. Many jurisdictions face public pressure for visible punishment rather than evidence-based reform. Nevertheless, as prison populations strain government budgets worldwide, the economic and ethical case for rehabilitation grows increasingly compelling.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What is Norway's recidivism rate according to the lecture?", "options": ["A) 76%", "B) 43%", "C) 20%", "D) 93%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Inmates who participate in educational programs are _____% less likely to reoffend.", "answer": "43", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What principle do Norwegian prisons operate on?", "options": ["A) Maximum security", "B) Strict discipline", "C) Normality", "D) Isolation"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "The lecturer suggests punitive systems are more cost-effective than rehabilitation.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Norway spends approximately $_____ per prisoner annually.", "answer": "93,000", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What challenge does the lecturer identify for implementing rehabilitation?", "options": ["A) Lack of research", "B) Public pressure for visible punishment", "C) Prisoner resistance", "D) Geographic limitations"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "recidivism", "definition": "The tendency of a convicted criminal to reoffend"},
            {"word": "punitive", "definition": "Inflicting or intended as punishment"},
            {"word": "deterrence", "definition": "Discouraging action through fear of consequences"}
        ],
        "listening_tips": ["Note comparative statistics between different systems", "Listen for cause-effect relationships", "Pay attention to contrasting viewpoints"]
    },
    7: {
        "title": "Academic Lecture: Media Literacy in the Digital Age",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_7_listening.mp3",
        "introduction": "You will hear a lecture about media literacy and information integrity. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome to today's lecture on navigating information in what many scholars call the 'post-truth era.' The proliferation of digital media has fundamentally transformed how we consume and evaluate information.

Research from MIT found that false news stories on Twitter spread approximately six times faster than accurate ones. This phenomenon, often attributed to the emotional appeal of sensational content, poses significant challenges for democratic societies that depend on informed citizens.

The concept of media literacy has evolved considerably. Traditional media literacy focused on understanding how messages are constructed. Digital media literacy now encompasses source evaluation, algorithmic awareness, and understanding of how personal data shapes the information we receive.

Studies by Stanford University revealed alarming gaps in students' ability to evaluate online sources. Over 80% of middle school students couldn't distinguish between sponsored content and legitimate news articles. This suggests urgent need for educational intervention.

Several countries have implemented systematic approaches. Finland integrates media literacy across its national curriculum, teaching critical evaluation from primary school. The results are notable: Finnish citizens consistently rank among the most resistant to misinformation in European surveys.

However, media literacy alone cannot solve the problem. Platform design, algorithmic transparency, and regulatory frameworks all play crucial roles. The challenge lies in balancing free expression with preventing harm from deliberate misinformation. As information environments grow increasingly complex, developing robust critical thinking skills becomes essential for civic participation.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "How much faster do false news stories spread compared to accurate ones?", "options": ["A) Three times faster", "B) Four times faster", "C) Six times faster", "D) Ten times faster"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Over _____% of middle school students couldn't distinguish sponsored content from news.", "answer": "80", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Which country is mentioned as a leader in media literacy education?", "options": ["A) Sweden", "B) Finland", "C) Germany", "D) Norway"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "The lecturer suggests media literacy alone can solve misinformation problems.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "The lecture describes the current era as the 'post-_____ era.'", "answer": "truth", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "What does digital media literacy now encompass according to the lecture?", "options": ["A) Only reading skills", "B) Source evaluation and algorithmic awareness", "C) Television analysis only", "D) Print media critique"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "proliferation", "definition": "Rapid increase or spread"},
            {"word": "algorithmic", "definition": "Relating to a process or set of rules followed by computers"},
            {"word": "misinformation", "definition": "False or inaccurate information, especially that which is deliberately intended to deceive"}
        ],
        "listening_tips": ["Listen for statistical evidence", "Note educational approaches mentioned", "Identify challenges and proposed solutions"]
    },
    8: {
        "title": "Academic Lecture: Global Wealth Inequality",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_8_listening.mp3",
        "introduction": "You will hear a lecture about wealth distribution and economic disparity. Listen carefully and answer questions 1-6.",
        "transcript": """Good afternoon. Today we examine one of the defining challenges of our time: the growing gap between the world's wealthiest and poorest citizens. Recent data from Oxfam International reveals that the richest 1% now own more wealth than the bottom 50% of humanity combined.

This concentration has accelerated dramatically. Since 2020, the world's five richest men have doubled their fortunes while nearly five billion people have become poorer. Such disparity raises fundamental questions about economic systems and social stability.

Economists identify multiple contributing factors. Globalisation, while lifting millions from absolute poverty, has disproportionately benefited capital owners over workers. Tax systems in many jurisdictions favour investment income over wages. Technological disruption has created enormous wealth for some while displacing traditional employment.

The consequences extend beyond economics. Research from epidemiologist Richard Wilkinson demonstrates that unequal societies experience higher rates of mental illness, crime, and reduced social trust regardless of absolute wealth levels. In other words, inequality itself produces negative outcomes.

Policy responses vary significantly. Scandinavian countries maintain relatively low inequality through progressive taxation and robust welfare systems. Other approaches include wealth taxes, inheritance reforms, and living wage legislation. The International Monetary Fund, traditionally focused on growth, now acknowledges that extreme inequality can actually impede economic development.

The debate continues between those prioritising redistribution and those arguing that economic growth naturally raises all boats. What seems clear is that current trajectories are unsustainable both economically and socially.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "According to Oxfam, how much wealth does the richest 1% own?", "options": ["A) More than the bottom 30%", "B) More than the bottom 50%", "C) More than the bottom 70%", "D) More than the bottom 90%"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Since 2020, the world's _____ richest men have doubled their fortunes.", "answer": "five", "word_limit": 1},
            {"number": 3, "type": "multiple_choice", "question": "What does Richard Wilkinson's research show about unequal societies?", "options": ["A) They are more innovative", "B) They have higher crime and mental illness rates", "C) They grow faster economically", "D) They are more stable"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "The IMF believes extreme inequality can help economic development.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Nearly _____ billion people have become poorer since 2020.", "answer": "five", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Which region is mentioned for maintaining low inequality?", "options": ["A) North America", "B) East Asia", "C) Scandinavia", "D) Southern Europe"], "answer": "C"}
        ],
        "vocabulary_focus": [
            {"word": "disparity", "definition": "A great difference or inequality"},
            {"word": "redistribution", "definition": "The transfer of income or wealth from some to others"},
            {"word": "trajectory", "definition": "The path followed by a moving object or the direction of development"}
        ],
        "listening_tips": ["Note specific statistics and sources", "Listen for cause-effect relationships", "Identify different policy approaches"]
    },
    9: {
        "title": "Academic Lecture: Urbanisation and Megacities",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_9_listening.mp3",
        "introduction": "You will hear a lecture about urbanisation trends and megacity challenges. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome, everyone. Today's lecture examines one of the most significant demographic shifts in human history: the rapid growth of megacities, defined as urban areas exceeding ten million inhabitants.

The United Nations estimates that by 2050, nearly 70% of the world's population will live in urban areas, compared to 55% today. Currently, there are over 30 megacities globally, with Tokyo being the largest at approximately 37 million residents.

This urbanisation presents both opportunities and challenges. Cities generate approximately 80% of global GDP and serve as hubs of innovation, culture, and economic activity. The concentration of talent and resources can produce significant efficiency gains.

However, rapid urban growth often outpaces infrastructure development. Many megacities in developing nations struggle with inadequate housing, transportation, water supply, and sanitation. Lagos, Nigeria, for example, adds approximately 77 residents every hour, straining already limited services.

Environmental concerns compound these challenges. Urban areas account for roughly 70% of global carbon emissions. Heat island effects raise temperatures in city centres by several degrees compared to surrounding areas, increasing energy consumption and health risks.

Progressive urban planning offers solutions. Singapore's integrated approach combines high-density housing with extensive green spaces and efficient public transit. Copenhagen aims to become carbon-neutral by 2025 through cycling infrastructure and renewable energy. These examples demonstrate that sustainable urban development, while challenging, remains achievable with appropriate planning and investment.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What percentage of the world's population will live in urban areas by 2050?", "options": ["A) 55%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Tokyo has approximately _____ million residents.", "answer": "37", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What percentage of global GDP do cities generate?", "options": ["A) 60%", "B) 70%", "C) 80%", "D) 90%"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Lagos adds approximately 77 residents every day.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Urban areas account for roughly _____% of global carbon emissions.", "answer": "70", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Which city aims to become carbon-neutral by 2025?", "options": ["A) Singapore", "B) Tokyo", "C) Lagos", "D) Copenhagen"], "answer": "D"}
        ],
        "vocabulary_focus": [
            {"word": "megacity", "definition": "A very large city, typically with a population of over ten million"},
            {"word": "urbanisation", "definition": "The process of making an area more urban"},
            {"word": "infrastructure", "definition": "Basic physical structures needed for society to function"}
        ],
        "listening_tips": ["Note demographic statistics", "Listen for city-specific examples", "Identify problems and solutions"]
    },
    10: {
        "title": "Academic Lecture: Bioethics and Medical Innovation",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_10_listening.mp3",
        "introduction": "You will hear a lecture about bioethics and scientific research. Listen carefully and answer questions 1-6.",
        "transcript": """Good morning. Today we explore the complex intersection of scientific advancement and ethical responsibility in biomedicine. As our technological capabilities expand, so too do the moral questions we must address.

Gene editing technology, particularly CRISPR-Cas9, exemplifies this tension. This revolutionary tool allows precise modification of DNA, offering potential cures for genetic diseases. However, the 2018 case of Chinese scientist He Jiankui, who created the first gene-edited babies, demonstrated the dangers of proceeding without adequate ethical oversight.

The scientific community responded swiftly, with the World Health Organization establishing an expert advisory committee on human genome editing. Most bioethicists advocate for a clear distinction between therapeutic applications, which correct disease-causing mutations, and enhancement applications, which aim to improve normal human characteristics.

Similar debates surround artificial intelligence in healthcare. Machine learning algorithms can now diagnose certain conditions more accurately than human physicians. A Stanford University study found that AI could identify skin cancers with 95% accuracy, compared to 87% for dermatologists. Yet questions arise about accountability when AI systems make errors, and about ensuring equitable access to such technologies.

The principle of informed consent, fundamental to medical ethics since the Nuremberg Code of 1947, faces new challenges in the era of big data. How can patients meaningfully consent to research using their genetic information when future applications remain unknown?

Navigating these waters requires ongoing dialogue between scientists, ethicists, policymakers, and the public. The goal is not to halt progress but to ensure that innovation serves human flourishing while respecting fundamental values.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What gene editing technology is discussed in the lecture?", "options": ["A) CRISPR-Cas9", "B) PCR", "C) Gene therapy", "D) Cloning"], "answer": "A"},
            {"number": 2, "type": "completion", "question": "AI could identify skin cancers with _____% accuracy.", "answer": "95", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What did He Jiankui do that caused controversy?", "options": ["A) Cloned a human", "B) Created gene-edited babies", "C) Developed CRISPR", "D) Published fake research"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "The Nuremberg Code was established in 2018.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Dermatologists identified skin cancers with _____% accuracy.", "answer": "87", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What organization established an expert committee on genome editing?", "options": ["A) United Nations", "B) World Health Organization", "C) Stanford University", "D) European Union"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "bioethics", "definition": "The ethics of medical and biological research"},
            {"word": "therapeutic", "definition": "Relating to the healing of disease"},
            {"word": "informed consent", "definition": "Permission granted with full knowledge of possible consequences"}
        ],
        "listening_tips": ["Note specific technologies mentioned", "Listen for ethical principles", "Identify historical references"]
    },
    11: {
        "title": "Academic Lecture: Sustainable Public Transportation",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_11_listening.mp3",
        "introduction": "You will hear a lecture about sustainable transportation and urban mobility. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome to today's discussion on sustainable public transportation, a critical component of addressing both climate change and urban livability.

Transportation accounts for approximately 24% of global carbon dioxide emissions, with road vehicles responsible for nearly three-quarters of this total. Transitioning to sustainable mobility represents one of our most significant opportunities for emissions reduction.

Successful public transit systems share common characteristics. Frequency matters enormously; research shows ridership increases substantially when services operate at intervals of ten minutes or less. Integration across modes, allowing seamless transfers between buses, trains, and bicycles, enhances system utility.

Cities like Zurich demonstrate what's achievable. Swiss transit systems maintain punctuality rates exceeding 97%, with coordinated schedules ensuring connections work reliably. Investment in quality infrastructure attracts riders who might otherwise drive, creating a virtuous cycle of improved service and increased revenue.

Electric buses are transforming urban transport. Shenzhen, China, became the first city to convert its entire bus fleet, approximately 16,000 vehicles, to electric power in 2017. The transition reduced carbon emissions by 1.35 million tonnes annually while lowering operating costs through fuel savings.

However, sustainable transport extends beyond technology. Urban design plays a crucial role. Cities built around car dependency face greater challenges than those with compact, mixed-use development. The Netherlands demonstrates how cycling infrastructure can capture significant modal share, with Amsterdam residents making 38% of all trips by bicycle.

The economic case strengthens as technology improves. Electric vehicles now achieve cost parity with conventional alternatives in many applications, while the health benefits of reduced air pollution provide additional justification for investment.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What percentage of global CO2 emissions comes from transportation?", "options": ["A) 14%", "B) 24%", "C) 34%", "D) 44%"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Swiss transit systems maintain punctuality rates exceeding _____%. ", "answer": "97", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Which city converted its entire bus fleet to electric?", "options": ["A) Zurich", "B) Amsterdam", "C) Shenzhen", "D") Singapore"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Shenzhen's electric bus transition increased carbon emissions.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Amsterdam residents make _____% of all trips by bicycle.", "answer": "38", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What does research show about transit frequency?", "options": ["A) Frequency doesn't affect ridership", "B) Ridership increases with intervals of 10 minutes or less", "C) Longer intervals are preferred", "D) Frequency only matters for trains"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "modal share", "definition": "The percentage of travelers using a particular type of transport"},
            {"word": "emissions", "definition": "The production and discharge of gases, especially greenhouse gases"},
            {"word": "punctuality", "definition": "The quality of being on time"}
        ],
        "listening_tips": ["Note percentages and statistics", "Listen for city examples", "Identify success factors"]
    },
    12: {
        "title": "Academic Lecture: The Future of Employment",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_12_listening.mp3",
        "introduction": "You will hear a lecture about changing employment patterns and the gig economy. Listen carefully and answer questions 1-6.",
        "transcript": """Good afternoon, everyone. Today we examine fundamental transformations in the nature of work and employment relationships in the 21st century.

The rise of the gig economy represents perhaps the most visible change. Platforms like Uber, Deliveroo, and Upwork have created new categories of work that blur traditional boundaries between employment and self-employment. In the United States, approximately 36% of workers now participate in the gig economy in some capacity.

This shift offers flexibility but raises concerns about worker protections. Traditional employment relationships provided benefits including health insurance, paid leave, and pension contributions. Gig workers typically receive none of these, bearing full responsibility for their own social safety net.

Legal systems struggle to categorise these arrangements. The UK Supreme Court's 2021 ruling that Uber drivers are workers rather than independent contractors represented a significant intervention, entitling them to minimum wage and holiday pay. Similar cases proceed in jurisdictions worldwide.

Automation adds another dimension to employment uncertainty. A widely cited Oxford University study suggested that 47% of US jobs face high risk of automation within two decades. While economists debate the exact figures, consensus exists that significant disruption will occur, particularly in routine cognitive and manual tasks.

Responses vary from market-based solutions emphasising retraining and adaptability to more radical proposals such as universal basic income. Denmark's 'flexicurity' model combines flexible labour markets with robust unemployment benefits and active training programs, offering one potential template.

What seems clear is that the traditional model of lifelong employment with a single employer has largely disappeared. Preparing workers for portfolio careers requiring continuous skill development becomes increasingly essential.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What percentage of US workers participate in the gig economy?", "options": ["A) 26%", "B) 36%", "C) 46%", "D) 56%"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "The Oxford study suggested _____% of US jobs face high automation risk.", "answer": "47", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What did the UK Supreme Court rule about Uber drivers in 2021?", "options": ["A) They are independent contractors", "B) They are employees", "C) They are workers entitled to minimum wage", "D) They are volunteers"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Gig workers typically receive traditional employment benefits.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Denmark's '_____ model combines flexible labour markets with benefits.", "answer": "flexicurity", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "What type of tasks face highest automation risk?", "options": ["A) Creative tasks", "B) Emotional intelligence tasks", "C) Routine cognitive and manual tasks", "D) Management tasks"], "answer": "C"}
        ],
        "vocabulary_focus": [
            {"word": "gig economy", "definition": "A labour market characterized by short-term contracts and freelance work"},
            {"word": "portfolio career", "definition": "A working life that involves multiple part-time positions"},
            {"word": "flexicurity", "definition": "A welfare state model combining flexible labour markets with security"}
        ],
        "listening_tips": ["Note legal and policy developments", "Listen for statistics about employment trends", "Identify different national approaches"]
    },
    13: {
        "title": "Academic Lecture: Aging Populations and Demographics",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_13_listening.mp3",
        "introduction": "You will hear a lecture about demographic changes and aging societies. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome to today's lecture on one of the most significant demographic transformations in human history: global population aging. For the first time, there will soon be more people over 65 than children under five worldwide.

Japan offers a preview of challenges ahead. With 29% of its population already over 65 and a fertility rate of just 1.3 children per woman, the country faces acute labour shortages and mounting healthcare costs. The ratio of workers to retirees has declined from approximately 10:1 in 1950 to less than 2:1 today.

This shift has profound economic implications. Pension systems designed when life expectancy was 65 struggle when many citizens live to 85 or beyond. Healthcare expenditure rises sharply with age; in most developed countries, per capita spending on those over 65 is three to five times higher than for younger adults.

However, aging need not mean decline. Research increasingly challenges assumptions about older workers' productivity. Studies from the Max Planck Institute demonstrate that while certain cognitive functions decrease with age, others, including vocabulary, knowledge, and emotional regulation, improve or remain stable.

Policy responses include raising retirement ages, encouraging immigration, and investing in automation. Germany has increased its state pension age to 67, while Japan actively recruits foreign workers and leads in developing care robots.

Some economists propose more fundamental reforms. Addressing aging requires rethinking assumptions about life stages, potentially moving toward models of continuous education and flexible transitions between work and retirement rather than rigid age-based categories.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What percentage of Japan's population is over 65?", "options": ["A) 19%", "B) 24%", "C) 29%", "D) 34%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Japan's fertility rate is _____ children per woman.", "answer": "1.3", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What was the worker-to-retiree ratio in Japan in 1950?", "options": ["A) 2:1", "B) 5:1", "C) 10:1", "D) 15:1"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "All cognitive functions decline with age according to research.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Germany has increased its pension age to _____.", "answer": "67", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What does healthcare spending show for those over 65?", "options": ["A) It's the same as younger adults", "B) It's 3-5 times higher than younger adults", "C) It's lower than younger adults", "D) It's only slightly higher"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "demographics", "definition": "Statistical data relating to the population"},
            {"word": "fertility rate", "definition": "The average number of children born to a woman"},
            {"word": "life expectancy", "definition": "The average period a person may expect to live"}
        ],
        "listening_tips": ["Note demographic statistics", "Listen for country-specific examples", "Identify economic implications"]
    },
    14: {
        "title": "Academic Lecture: Modern Educational Philosophy",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_14_listening.mp3",
        "introduction": "You will hear a lecture about educational approaches and pedagogical philosophy. Listen carefully and answer questions 1-6.",
        "transcript": """Good morning. Today we examine the evolution of educational philosophy, from traditional rote memorisation to contemporary competency-based approaches.

For much of history, education emphasised the transmission of established knowledge through repetition and recall. Students were expected to absorb and reproduce information, with success measured through standardised examinations testing factual retention.

This model faces increasing criticism in the knowledge economy. When information is instantly accessible through technology, the ability to recall facts becomes less valuable than the capacity to analyse, synthesise, and apply knowledge creatively. The World Economic Forum identifies critical thinking, creativity, and emotional intelligence among the most important skills for future employment.

Finland's education system demonstrates an alternative approach. Finnish schools emphasise collaborative learning, student agency, and broad competencies rather than narrow subject mastery. Remarkably, despite limited homework and no standardised testing until age 16, Finnish students consistently rank among the world's highest performers in international assessments like PISA.

The concept of 'learning to learn' has gained prominence. Metacognition, or awareness of one's own learning processes, proves crucial for lifelong adaptation in rapidly changing environments. Research suggests that explicitly teaching metacognitive strategies can significantly improve academic outcomes across subjects.

However, implementation challenges exist. Teachers trained in traditional methods may struggle with facilitative roles. Assessment systems designed for content knowledge don't easily measure competencies like collaboration or creativity. Parents and policymakers sometimes resist changes that differ from their own educational experiences.

The debate continues between those advocating structured knowledge transmission and those emphasising skills development. Increasingly, educators recognise that effective teaching requires both rich content knowledge and the ability to apply that knowledge in novel situations.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What skills does the World Economic Forum identify as most important?", "options": ["A) Memorisation and recall", "B) Critical thinking and creativity", "C) Reading and writing", "D) Mathematics only"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Finnish students have no standardised testing until age _____.", "answer": "16", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What does the lecture identify as Finland's educational emphasis?", "options": ["A) Rote memorisation", "B) Standardised testing", "C) Collaborative learning and student agency", "D) Strict discipline"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Traditional education models emphasised creative application of knowledge.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Awareness of one's own learning processes is called _____.", "answer": "metacognition", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "What challenge do teachers face with new approaches?", "options": ["A) Too much technology", "B) Struggling with facilitative roles", "C) Student resistance", "D) Lack of content"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "pedagogy", "definition": "The method and practice of teaching"},
            {"word": "metacognition", "definition": "Awareness and understanding of one's own thought processes"},
            {"word": "competency-based", "definition": "Focused on demonstrating skills rather than just knowledge"}
        ],
        "listening_tips": ["Note contrasts between old and new approaches", "Listen for specific country examples", "Identify challenges mentioned"]
    },
    15: {
        "title": "Academic Lecture: Cultural Globalisation and Identity",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_15_listening.mp3",
        "introduction": "You will hear a lecture about cultural globalisation and heritage preservation. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome, everyone. Today we explore the tension between cultural globalisation and the preservation of local heritage, examining how communities navigate these competing forces.

The spread of global culture has accelerated dramatically. American media dominates global entertainment markets; Hollywood films account for approximately 70% of cinema revenues in most countries. English has become the dominant language of international business, science, and the internet, with approximately 1.5 billion speakers worldwide.

Critics describe this as cultural imperialism, where dominant cultures overwhelm local traditions. UNESCO estimates that a language dies every two weeks, taking with it unique ways of understanding the world. Traditional crafts, cuisines, and practices face similar pressures from standardised global alternatives.

However, the narrative of one-way cultural flow oversimplifies reality. Anthropologist Arjun Appadurai emphasises that local cultures actively adapt and transform global influences rather than passively receiving them. Korean pop music, Bollywood films, and Japanese manga demonstrate how non-Western cultural products achieve global reach.

Some communities have successfully leveraged globalisation to preserve heritage. Indigenous groups use social media to maintain language and traditions among dispersed members. Slow food movements connect local producers with global consumers valuing authenticity.

The challenge lies in distinguishing between cultural exchange, which enriches all parties, and cultural erosion, which diminishes diversity. Some scholars advocate for policies protecting cultural heritage similar to environmental protection, recognising that cultural diversity represents a form of collective human wealth.

Ultimately, identity in the globalised world becomes less about fixed categories and more about ongoing negotiation between local roots and global connections.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What percentage of cinema revenues do Hollywood films account for globally?", "options": ["A) 50%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Approximately _____ billion people speak English worldwide.", "answer": "1.5", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "According to UNESCO, how often does a language die?", "options": ["A) Every week", "B) Every two weeks", "C) Every month", "D) Every year"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "Appadurai argues that local cultures passively receive global influences.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Korean pop music, Bollywood, and Japanese _____ demonstrate non-Western cultural global reach.", "answer": "manga", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "What do some scholars advocate for protecting cultural heritage?", "options": ["A) Isolation policies", "B) Policies similar to environmental protection", "C) Banning foreign media", "D) Mandatory language laws"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "cultural imperialism", "definition": "The imposition of cultural elements from one society onto another"},
            {"word": "heritage", "definition": "Valued traditions and culture passed down through generations"},
            {"word": "homogenisation", "definition": "The process of making things uniform or similar"}
        ],
        "listening_tips": ["Note statistics about cultural spread", "Listen for different perspectives", "Identify examples of cultural adaptation"]
    },
    16: {
        "title": "Academic Lecture: Environmental Stewardship",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_16_listening.mp3",
        "introduction": "You will hear a lecture about environmental protection and ecological sustainability. Listen carefully and answer questions 1-6.",
        "transcript": """Good afternoon. Today we examine humanity's relationship with the natural environment in what scientists increasingly call the Anthropocene, an epoch defined by human impact on Earth systems.

The evidence of environmental transformation is stark. Atmospheric carbon dioxide has reached 420 parts per million, levels not seen in 4 million years. Global average temperatures have risen approximately 1.1 degrees Celsius since pre-industrial times. The rate of species extinction now exceeds natural background rates by 100 to 1,000 times.

Scientists identify nine planetary boundaries, thresholds beyond which Earth systems may shift to states hostile to human civilisation. Research suggests we have already transgressed four of these: climate change, biodiversity loss, land-system change, and biogeochemical flows.

Yet the picture is not entirely bleak. The Montreal Protocol demonstrated that international cooperation can address environmental threats; the ozone layer is now recovering. Renewable energy costs have plummeted, with solar power prices falling 89% since 2010. Reforestation efforts in countries like Costa Rica show that ecosystem degradation can be reversed.

The concept of environmental stewardship emphasises human responsibility to preserve natural systems for future generations. This represents a shift from viewing nature purely as a resource for exploitation to recognising intrinsic value in ecological systems.

Implementation requires action at multiple levels: individual choices, corporate responsibility, and government policy. Carbon pricing mechanisms, now implemented in over 60 jurisdictions, attempt to incorporate environmental costs into economic decisions.

The transition to sustainable practices presents economic opportunities alongside challenges. The global renewable energy sector now employs approximately 12 million people, with projections of substantial growth.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What level has atmospheric CO2 reached?", "options": ["A) 320 ppm", "B) 370 ppm", "C) 420 ppm", "D) 470 ppm"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Global temperatures have risen approximately _____ degrees Celsius.", "answer": "1.1", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "How many planetary boundaries have been transgressed?", "options": ["A) Two", "B) Three", "C) Four", "D) Five"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "The ozone layer is continuing to deteriorate.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Solar power prices have fallen _____% since 2010.", "answer": "89", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "How many people does the global renewable energy sector employ?", "options": ["A) 5 million", "B) 8 million", "C) 12 million", "D) 15 million"], "answer": "C"}
        ],
        "vocabulary_focus": [
            {"word": "Anthropocene", "definition": "The current geological age, viewed as the period of significant human impact"},
            {"word": "stewardship", "definition": "The responsible management of resources"},
            {"word": "planetary boundaries", "definition": "Environmental limits within which humanity can safely operate"}
        ],
        "listening_tips": ["Note environmental statistics", "Listen for examples of progress", "Identify policy mechanisms mentioned"]
    },
    17: {
        "title": "Academic Lecture: Reducing Recidivism",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_17_listening.mp3",
        "introduction": "You will hear a lecture about criminal rehabilitation and reducing reoffending. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome to today's discussion on breaking the cycle of reoffending, one of the most pressing challenges in criminal justice systems worldwide.

Recidivism rates reveal the scale of the problem. In many countries, approximately 50% of released prisoners reoffend within three years. In the United States, this figure rises to 76% within five years. These statistics represent not only individual tragedies but enormous social and economic costs.

Research identifies key factors predicting reoffending: unemployment, lack of stable housing, substance abuse, and weak social connections. Addressing these factors proves more effective than punishment alone. A comprehensive review by the Washington State Institute found that cognitive behavioural therapy reduced recidivism by 8%, vocational training by 9%, and drug treatment programmes by 10-15%.

Innovative approaches show promise. Restorative justice programmes, bringing offenders face-to-face with victims under supervised conditions, demonstrate significant effects. A Ministry of Justice study in the UK found that restorative conferences reduced reoffending frequency by 14% for violent crimes.

The transition period immediately following release proves critical. Research shows that recidivism risk peaks in the first few months after prison. Programmes providing structured support during this vulnerable period, including housing assistance, employment services, and mentoring, substantially improve outcomes.

Norway's Bastøy Prison represents an extreme example of rehabilitation-focused incarceration. Prisoners live in relative freedom on an island, working in farming and forestry. Despite housing serious offenders, the prison achieves a recidivism rate of just 16%, compared to the European average of approximately 50%.

Cost-benefit analyses consistently favour rehabilitation over pure incarceration. Every pound invested in effective rehabilitation programmes saves an estimated three to four pounds in reduced prison and court costs.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What is the recidivism rate in the US within five years?", "options": ["A) 50%", "B) 66%", "C) 76%", "D) 86%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Cognitive behavioural therapy reduced recidivism by _____% .", "answer": "8", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What did UK restorative conferences reduce reoffending frequency by?", "options": ["A) 8%", "B) 10%", "C) 14%", "D) 20%"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Recidivism risk is lowest immediately after prison release.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Bastøy Prison achieves a recidivism rate of just _____% .", "answer": "16", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What does investment in rehabilitation save per pound spent?", "options": ["A) 1-2 pounds", "B) 3-4 pounds", "C) 5-6 pounds", "D) 7-8 pounds"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "recidivism", "definition": "The tendency of a convicted criminal to reoffend"},
            {"word": "restorative justice", "definition": "A system focusing on rehabilitation through reconciliation"},
            {"word": "incarceration", "definition": "The state of being confined in prison"}
        ],
        "listening_tips": ["Note recidivism statistics", "Listen for intervention effectiveness rates", "Identify successful programme examples"]
    },
    18: {
        "title": "Academic Lecture: Health Equity and Access",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_18_listening.mp3",
        "introduction": "You will hear a lecture about health inequalities and medical access. Listen carefully and answer questions 1-6.",
        "transcript": """Good morning. Today we examine one of the fundamental challenges in public health: ensuring equitable access to medical care across different populations.

Health disparities persist even in wealthy nations. In the United States, life expectancy varies by approximately 20 years between the healthiest and least healthy counties. Black Americans have life expectancies 4 years shorter than white Americans, a gap that has persisted for decades.

These disparities stem from multiple interconnected factors. Social determinants of health, including income, education, housing, and neighbourhood conditions, account for an estimated 40% of health outcomes. Access to care, while important, explains only about 20% of variation in health status.

The concept of health equity differs from equality. Equality means providing the same resources to everyone; equity means allocating resources according to need to achieve similar outcomes. This distinction has important policy implications.

Universal healthcare systems demonstrate different approaches. The UK's National Health Service provides care free at point of use, funded through taxation. France combines public insurance with regulated private supplementary coverage. Both achieve better health outcomes than the US while spending significantly less: approximately 11% of GDP compared to America's 17%.

However, universal coverage doesn't guarantee equity. Even in systems with comprehensive access, disadvantaged groups often experience worse outcomes due to factors including health literacy, cultural barriers, and discrimination within healthcare settings.

The COVID-19 pandemic exposed and exacerbated existing inequalities. Mortality rates among minority and low-income populations substantially exceeded those of advantaged groups, reflecting longstanding patterns of differential vulnerability.

Addressing health equity requires action beyond healthcare systems, encompassing housing, education, employment, and environmental policies that shape health before people ever reach a doctor.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "How much does life expectancy vary between US counties?", "options": ["A) 10 years", "B) 15 years", "C) 20 years", "D) 25 years"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Social determinants account for approximately _____% of health outcomes.", "answer": "40", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "How much of GDP does the US spend on healthcare?", "options": ["A) 11%", "B) 14%", "C) 17%", "D) 20%"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Health equity means providing the same resources to everyone.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Access to care explains only about _____% of variation in health status.", "answer": "20", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What did COVID-19 do to existing health inequalities?", "options": ["A) Eliminated them", "B) Exposed and exacerbated them", "C) Had no effect", "D) Reduced them"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "health equity", "definition": "The attainment of the highest level of health for all people"},
            {"word": "social determinants", "definition": "Conditions in which people are born, live, and work that affect health"},
            {"word": "disparities", "definition": "Differences, especially unfair ones, in health outcomes"}
        ],
        "listening_tips": ["Note statistics on health differences", "Listen for system comparisons", "Identify factors affecting health outcomes"]
    },
    19: {
        "title": "Academic Lecture: Digital Journalism and Democracy",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_19_listening.mp3",
        "introduction": "You will hear a lecture about journalism, social media, and their role in democratic society. Listen carefully and answer questions 1-6.",
        "transcript": """Welcome, everyone. Today we examine the evolving landscape of news and information dissemination in the digital age, and its implications for democratic governance.

Traditional media faces unprecedented challenges. Newspaper advertising revenue has declined by approximately 70% since 2000. Local news outlets have been particularly affected; since 2004, the United States has lost approximately 2,500 newspapers, leaving many communities without dedicated local journalism.

This decline matters for democracy. Research demonstrates that communities losing local newspapers experience decreased voter turnout, less competitive local elections, and increased municipal borrowing costs as scrutiny of government diminishes.

Social media platforms have partially filled this gap, but with significant differences. Algorithmic curation prioritises engagement over accuracy, often amplifying sensational or divisive content. A study by researchers at New York University found that misinformation received six times more engagement than factual news on Facebook during the 2020 US election.

The business model underlying digital platforms creates perverse incentives. Advertising-based revenue depends on attention capture, rewarding whatever content keeps users engaged regardless of social value. Subscription models offer an alternative but risk creating information inequality between those who can afford quality journalism and those who cannot.

Platform regulation remains contentious. The European Union's Digital Services Act requires platforms to address illegal content and disinformation. Critics argue such regulation threatens free expression, while supporters contend that unregulated platforms undermine the informed citizenry democracy requires.

Some innovative models show promise. Non-profit journalism organisations, public media with appropriate independence, and reader-funded cooperatives offer alternatives to advertising-dependent models. The challenge lies in achieving sustainability at scale.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "How much has newspaper advertising revenue declined since 2000?", "options": ["A) 50%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "The US has lost approximately _____ newspapers since 2004.", "answer": "2,500", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "How much more engagement did misinformation receive on Facebook?", "options": ["A) Three times more", "B) Four times more", "C) Six times more", "D) Eight times more"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Algorithmic curation prioritises accuracy over engagement.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "The European Union's _____ Services Act regulates platforms.", "answer": "Digital", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "What happens to communities that lose local newspapers?", "options": ["A) Increased voter turnout", "B) Decreased voter turnout", "C) No change in civic engagement", "D) Better local government"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "algorithmic curation", "definition": "The automated selection and arrangement of content by computer programs"},
            {"word": "dissemination", "definition": "The act of spreading something widely"},
            {"word": "scrutiny", "definition": "Critical observation or examination"}
        ],
        "listening_tips": ["Note media industry statistics", "Listen for effects on democracy", "Identify regulatory approaches"]
    },
    20: {
        "title": "Academic Lecture: Tourism and Cultural Preservation",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_20_listening.mp3",
        "introduction": "You will hear a lecture about tourism's impact on cultural heritage and local communities. Listen carefully and answer questions 1-6.",
        "transcript": """Good afternoon. Today we examine the complex relationship between tourism, cultural heritage, and community wellbeing, exploring both the opportunities and challenges this global industry presents.

Tourism has grown exponentially. International arrivals increased from 25 million in 1950 to 1.4 billion in 2018 before the pandemic disrupted travel patterns. The industry accounts for approximately 10% of global GDP and employs one in ten workers worldwide.

Heritage sites particularly attract visitors seeking authentic cultural experiences. UNESCO World Heritage Sites reported over 150 million visits annually before COVID-19. This interest can support preservation efforts through entrance fees and increased political attention to conservation.

However, mass tourism also threatens the heritage it celebrates. Venice, receiving approximately 30 million visitors annually against a resident population of just 50,000, exemplifies overtourism's challenges. Property prices have soared, traditional businesses have given way to tourist-oriented commerce, and historic infrastructure faces accelerated deterioration.

The concept of carrying capacity, borrowed from ecology, helps frame sustainable tourism. Physical carrying capacity concerns infrastructure limits. Social carrying capacity addresses how many visitors local communities can accommodate while maintaining quality of life. Psychological carrying capacity relates to visitor experience quality at different crowding levels.

Barcelona has implemented various management strategies: limiting accommodation licenses, dispersing visitors to less crowded areas, and restricting cruise ship arrivals. Bhutan takes an alternative approach, charging a minimum daily fee of $200 per visitor to limit numbers while maximising economic benefit.

Community-based tourism models offer another path, ensuring that local populations control and benefit from tourism development rather than serving as attractions for external operators.

The pandemic prompted reflection on tourism's future. Many communities expressed preference for fewer, higher-spending visitors over mass tourism, suggesting potential for more sustainable models going forward.""",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "How many international tourist arrivals were there in 2018?", "options": ["A) 1.0 billion", "B) 1.2 billion", "C) 1.4 billion", "D) 1.6 billion"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Tourism accounts for approximately _____% of global GDP.", "answer": "10", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "How many visitors does Venice receive annually?", "options": ["A) 10 million", "B) 20 million", "C) 30 million", "D) 40 million"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Venice's resident population is larger than its annual visitor numbers.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Bhutan charges a minimum daily fee of $_____ per visitor.", "answer": "200", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What concept helps frame sustainable tourism?", "options": ["A) Profit margin", "B) Carrying capacity", "C) Marketing reach", "D) Brand value"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "overtourism", "definition": "Excessive tourism that damages destinations"},
            {"word": "carrying capacity", "definition": "The maximum number of visitors an area can sustainably support"},
            {"word": "heritage", "definition": "Valued traditions and sites passed down through generations"}
        ],
        "listening_tips": ["Note tourism statistics", "Listen for management strategies", "Identify different national approaches"]
    }
}

def generate_audio(client, text, voice_id):
    """Generate audio from text using ElevenLabs API"""
    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        output_format="mp3_44100_128",
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.3,
            use_speaker_boost=True
        )
    )
    
    audio_bytes = b""
    for chunk in audio:
        audio_bytes += chunk
    
    return audio_bytes

def main():
    print("🎧 Generating Advanced Mastery listening audio for Modules 6-20...")
    print(f"Output directory: {OUTPUT_DIR}")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    
    for module_num, data in LISTENING_DATA.items():
        output_file = f"{OUTPUT_DIR}/module_{module_num}_listening.mp3"
        
        print(f"\n📝 Module {module_num}: {data['title'][:50]}...")
        print(f"   Transcript length: {len(data['transcript'])} characters")
        
        try:
            audio_bytes = generate_audio(client, data['transcript'], VOICE_ID)
            
            with open(output_file, "wb") as f:
                f.write(audio_bytes)
            
            file_size = os.path.getsize(output_file) / 1024
            print(f"   ✅ Saved: {output_file} ({file_size:.1f} KB)")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n🎉 Audio generation complete!")

if __name__ == "__main__":
    main()
