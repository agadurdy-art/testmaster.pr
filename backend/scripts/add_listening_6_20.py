#!/usr/bin/env python3
"""
Add listening content for modules 6-20 to seed file
"""

import re

LISTENING_CONTENT_6_20 = {
    6: {
        "title": "Academic Lecture: Criminal Justice and Rehabilitation",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_6_listening.mp3",
        "introduction": "You will hear a lecture about criminal justice systems and rehabilitation approaches.",
        "transcript": "Good morning, everyone. Today we examine one of society's most challenging questions: how should we respond to crime? The debate between punitive and rehabilitative approaches has shaped criminal justice policy for centuries. Traditional punitive systems focus on punishment as deterrence. The theory suggests that harsh sentences discourage both offenders and potential criminals. However, research from the Norwegian Correctional Service challenges this assumption. Norway's rehabilitation-focused prisons have achieved a remarkably low recidivism rate of just 20%, compared to approximately 76% in more punitive systems like the United States.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "What is Norway's recidivism rate?", "options": ["A) 76%", "B) 43%", "C) 20%", "D) 93%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Educational programs reduce reoffending by _____% .", "answer": "43", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What principle do Norwegian prisons operate on?", "options": ["A) Maximum security", "B) Strict discipline", "C) Normality", "D) Isolation"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Punitive systems are more cost-effective.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Norway spends $_____ per prisoner annually.", "answer": "93,000", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What challenge exists for rehabilitation?", "options": ["A) Lack of research", "B) Public pressure for punishment", "C) Prisoner resistance", "D) Cost"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "recidivism", "definition": "Tendency to reoffend"}, {"word": "punitive", "definition": "Inflicting punishment"}, {"word": "deterrence", "definition": "Discouraging through fear"}],
        "listening_tips": ["Note comparative statistics", "Listen for cause-effect", "Identify contrasting views"]
    },
    7: {
        "title": "Academic Lecture: Media Literacy in the Digital Age",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_7_listening.mp3",
        "introduction": "You will hear a lecture about media literacy and information integrity.",
        "transcript": "Welcome to today's lecture on navigating information in what many scholars call the post-truth era. The proliferation of digital media has fundamentally transformed how we consume and evaluate information. Research from MIT found that false news stories on Twitter spread approximately six times faster than accurate ones.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "How much faster do false news spread?", "options": ["A) 3x", "B) 4x", "C) 6x", "D) 10x"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Over _____% of students couldn't distinguish sponsored content.", "answer": "80", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Which country leads in media literacy?", "options": ["A) Sweden", "B) Finland", "C) Germany", "D) Norway"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "Media literacy alone solves misinformation.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "We live in the post-_____ era.", "answer": "truth", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Digital literacy includes:", "options": ["A) Reading only", "B) Source evaluation", "C) TV analysis", "D) Print critique"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "proliferation", "definition": "Rapid spread"}, {"word": "algorithmic", "definition": "Computer-based processes"}, {"word": "misinformation", "definition": "False information"}],
        "listening_tips": ["Note statistics", "Identify educational approaches", "Listen for solutions"]
    },
    8: {
        "title": "Academic Lecture: Global Wealth Inequality",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_8_listening.mp3",
        "introduction": "You will hear a lecture about wealth distribution and economic disparity.",
        "transcript": "Good afternoon. Today we examine the growing gap between the world's wealthiest and poorest citizens. Recent data from Oxfam International reveals that the richest 1% now own more wealth than the bottom 50% of humanity combined.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "The richest 1% own more than:", "options": ["A) Bottom 30%", "B) Bottom 50%", "C) Bottom 70%", "D) Bottom 90%"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "The _____ richest men doubled their fortunes since 2020.", "answer": "five", "word_limit": 1},
            {"number": 3, "type": "multiple_choice", "question": "Wilkinson's research shows unequal societies have:", "options": ["A) More innovation", "B) Higher crime rates", "C) Faster growth", "D) More stability"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "IMF believes inequality helps development.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Nearly _____ billion people became poorer.", "answer": "five", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Which region has low inequality?", "options": ["A) North America", "B) East Asia", "C) Scandinavia", "D) S. Europe"], "answer": "C"}
        ],
        "vocabulary_focus": [{"word": "disparity", "definition": "Great difference"}, {"word": "redistribution", "definition": "Transfer of wealth"}, {"word": "trajectory", "definition": "Path of development"}],
        "listening_tips": ["Note statistics", "Listen for cause-effect", "Identify policy approaches"]
    },
    9: {
        "title": "Academic Lecture: Urbanisation and Megacities",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_9_listening.mp3",
        "introduction": "You will hear a lecture about urbanisation trends and megacity challenges.",
        "transcript": "Welcome, everyone. Today's lecture examines the rapid growth of megacities, defined as urban areas exceeding ten million inhabitants. The United Nations estimates that by 2050, nearly 70% of the world's population will live in urban areas.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Urban population by 2050:", "options": ["A) 55%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Tokyo has _____ million residents.", "answer": "37", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Cities generate what % of GDP?", "options": ["A) 60%", "B) 70%", "C) 80%", "D) 90%"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Lagos adds 77 residents every day.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Urban areas produce _____% of carbon emissions.", "answer": "70", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Which city aims for carbon neutrality by 2025?", "options": ["A) Singapore", "B) Tokyo", "C) Lagos", "D) Copenhagen"], "answer": "D"}
        ],
        "vocabulary_focus": [{"word": "megacity", "definition": "City over 10 million"}, {"word": "urbanisation", "definition": "Growth of cities"}, {"word": "infrastructure", "definition": "Basic structures"}],
        "listening_tips": ["Note demographics", "Listen for city examples", "Identify problems/solutions"]
    },
    10: {
        "title": "Academic Lecture: Bioethics and Medical Innovation",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_10_listening.mp3",
        "introduction": "You will hear a lecture about bioethics and scientific research.",
        "transcript": "Good morning. Today we explore the complex intersection of scientific advancement and ethical responsibility in biomedicine. Gene editing technology, particularly CRISPR-Cas9, exemplifies this tension.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Which gene editing technology is discussed?", "options": ["A) CRISPR-Cas9", "B) PCR", "C) Gene therapy", "D) Cloning"], "answer": "A"},
            {"number": 2, "type": "completion", "question": "AI identified skin cancers with _____% accuracy.", "answer": "95", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What did He Jiankui do?", "options": ["A) Cloned human", "B) Created gene-edited babies", "C) Developed CRISPR", "D) Fake research"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "Nuremberg Code was established in 2018.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Dermatologists achieved _____% accuracy.", "answer": "87", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "WHO established committee on:", "options": ["A) UN", "B) WHO", "C) Stanford", "D) EU"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "bioethics", "definition": "Ethics of medical research"}, {"word": "therapeutic", "definition": "Healing-related"}, {"word": "informed consent", "definition": "Permission with knowledge"}],
        "listening_tips": ["Note technologies", "Listen for ethical principles", "Identify historical references"]
    },
    11: {
        "title": "Academic Lecture: Sustainable Public Transportation",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_11_listening.mp3",
        "introduction": "You will hear a lecture about sustainable transportation.",
        "transcript": "Welcome to today's discussion on sustainable public transportation, a critical component of addressing both climate change and urban livability. Transportation accounts for approximately 24% of global carbon dioxide emissions.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Transport's share of CO2 emissions:", "options": ["A) 14%", "B) 24%", "C) 34%", "D) 44%"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Swiss transit has _____% punctuality.", "answer": "97", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Which city has all-electric buses?", "options": ["A) Zurich", "B) Amsterdam", "C) Shenzhen", "D) Singapore"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Electric buses increased emissions.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Amsterdam: _____% of trips by bicycle.", "answer": "38", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Ridership increases with:", "options": ["A) No effect", "B) 10-min intervals or less", "C) Longer intervals", "D) Trains only"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "modal share", "definition": "Transport type percentage"}, {"word": "emissions", "definition": "Gas discharge"}, {"word": "punctuality", "definition": "Being on time"}],
        "listening_tips": ["Note percentages", "Listen for city examples", "Identify success factors"]
    },
    12: {
        "title": "Academic Lecture: The Future of Employment",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_12_listening.mp3",
        "introduction": "You will hear a lecture about changing employment patterns.",
        "transcript": "Good afternoon, everyone. Today we examine fundamental transformations in the nature of work and employment relationships. The rise of the gig economy represents perhaps the most visible change.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "US gig economy participation:", "options": ["A) 26%", "B) 36%", "C) 46%", "D) 56%"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Oxford: _____% of jobs at automation risk.", "answer": "47", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "UK Supreme Court ruled Uber drivers are:", "options": ["A) Contractors", "B) Employees", "C) Workers with minimum wage", "D) Volunteers"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Gig workers get traditional benefits.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Denmark's _____ model combines flexibility with benefits.", "answer": "flexicurity", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Highest automation risk jobs:", "options": ["A) Creative", "B) Healthcare", "C) Routine tasks", "D) Management"], "answer": "C"}
        ],
        "vocabulary_focus": [{"word": "gig economy", "definition": "Short-term contract work"}, {"word": "portfolio career", "definition": "Multiple part-time jobs"}, {"word": "flexicurity", "definition": "Flexible security model"}],
        "listening_tips": ["Note legal developments", "Listen for statistics", "Identify national approaches"]
    },
    13: {
        "title": "Academic Lecture: Aging Populations",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_13_listening.mp3",
        "introduction": "You will hear a lecture about demographic changes.",
        "transcript": "Welcome to today's lecture on global population aging. Japan offers a preview of challenges ahead with 29% of its population already over 65.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Japan's over-65 population:", "options": ["A) 19%", "B) 24%", "C) 29%", "D) 34%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Japan's fertility rate: _____ children/woman.", "answer": "1.3", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Worker-retiree ratio in 1950:", "options": ["A) 2:1", "B) 5:1", "C) 10:1", "D) 15:1"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "All cognitive functions decline with age.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Germany's pension age increased to _____.", "answer": "67", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Over-65 healthcare spending is:", "options": ["A) Same", "B) 3-5x higher", "C) Lower", "D) Slightly higher"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "demographics", "definition": "Population statistics"}, {"word": "fertility rate", "definition": "Average children per woman"}, {"word": "life expectancy", "definition": "Expected lifespan"}],
        "listening_tips": ["Note demographic stats", "Listen for country examples", "Identify economic implications"]
    },
    14: {
        "title": "Academic Lecture: Modern Educational Philosophy",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_14_listening.mp3",
        "introduction": "You will hear a lecture about educational approaches.",
        "transcript": "Good morning. Today we examine the evolution of educational philosophy, from traditional rote memorisation to contemporary competency-based approaches.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "WEF identifies key skills as:", "options": ["A) Memorisation", "B) Critical thinking/creativity", "C) Reading/writing", "D) Math only"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Finnish students: no standardised testing until age _____.", "answer": "16", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Finland emphasises:", "options": ["A) Rote memorisation", "B) Testing", "C) Collaborative learning", "D) Discipline"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Traditional education emphasised creative application.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Awareness of learning processes is called _____.", "answer": "metacognition", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Teachers' challenge with new approaches:", "options": ["A) Technology", "B) Facilitative roles", "C) Student resistance", "D) Content"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "pedagogy", "definition": "Teaching practice"}, {"word": "metacognition", "definition": "Awareness of thinking"}, {"word": "competency-based", "definition": "Skills-focused"}],
        "listening_tips": ["Note old vs new approaches", "Listen for country examples", "Identify challenges"]
    },
    15: {
        "title": "Academic Lecture: Cultural Globalisation",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_15_listening.mp3",
        "introduction": "You will hear a lecture about cultural globalisation.",
        "transcript": "Welcome, everyone. Today we explore the tension between cultural globalisation and preservation of local heritage.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Hollywood's global cinema revenue share:", "options": ["A) 50%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "_____ billion people speak English.", "answer": "1.5", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "How often does a language die?", "options": ["A) Weekly", "B) Every two weeks", "C) Monthly", "D) Yearly"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "Appadurai says cultures passively receive global influences.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "K-pop, Bollywood, and Japanese _____ show non-Western reach.", "answer": "manga", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Some scholars advocate:", "options": ["A) Isolation", "B) Environmental-like protection", "C) Banning media", "D) Language laws"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "cultural imperialism", "definition": "Cultural imposition"}, {"word": "heritage", "definition": "Traditions passed down"}, {"word": "homogenisation", "definition": "Making uniform"}],
        "listening_tips": ["Note statistics", "Listen for perspectives", "Identify adaptation examples"]
    },
    16: {
        "title": "Academic Lecture: Environmental Stewardship",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_16_listening.mp3",
        "introduction": "You will hear a lecture about environmental protection.",
        "transcript": "Good afternoon. Today we examine humanity's relationship with the natural environment in the Anthropocene epoch.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Atmospheric CO2 level:", "options": ["A) 320ppm", "B) 370ppm", "C) 420ppm", "D) 470ppm"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Global temps rose _____ degrees Celsius.", "answer": "1.1", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Planetary boundaries transgressed:", "options": ["A) Two", "B) Three", "C) Four", "D) Five"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Ozone layer is still deteriorating.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Solar prices fell _____% since 2010.", "answer": "89", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Renewable energy employs:", "options": ["A) 5M", "B) 8M", "C) 12M", "D) 15M"], "answer": "C"}
        ],
        "vocabulary_focus": [{"word": "Anthropocene", "definition": "Human impact epoch"}, {"word": "stewardship", "definition": "Responsible management"}, {"word": "planetary boundaries", "definition": "Environmental limits"}],
        "listening_tips": ["Note environmental stats", "Listen for progress examples", "Identify policy mechanisms"]
    },
    17: {
        "title": "Academic Lecture: Reducing Recidivism",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_17_listening.mp3",
        "introduction": "You will hear a lecture about reducing reoffending.",
        "transcript": "Welcome to today's discussion on breaking the cycle of reoffending. Recidivism rates reveal the scale of the problem.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "US recidivism in 5 years:", "options": ["A) 50%", "B) 66%", "C) 76%", "D) 86%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "CBT reduces recidivism by _____% .", "answer": "8", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "UK restorative conferences reduced reoffending by:", "options": ["A) 8%", "B) 10%", "C) 14%", "D) 20%"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Recidivism risk is lowest right after release.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Bastøy Prison: _____% recidivism.", "answer": "16", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Rehabilitation saves per pound:", "options": ["A) 1-2", "B) 3-4", "C) 5-6", "D) 7-8"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "recidivism", "definition": "Tendency to reoffend"}, {"word": "restorative justice", "definition": "Rehabilitation via reconciliation"}, {"word": "incarceration", "definition": "Prison confinement"}],
        "listening_tips": ["Note recidivism stats", "Listen for intervention rates", "Identify programme examples"]
    },
    18: {
        "title": "Academic Lecture: Health Equity",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_18_listening.mp3",
        "introduction": "You will hear a lecture about health inequalities.",
        "transcript": "Good morning. Today we examine ensuring equitable access to medical care across different populations.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "US life expectancy variation:", "options": ["A) 10yr", "B) 15yr", "C) 20yr", "D) 25yr"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Social determinants account for _____% of health outcomes.", "answer": "40", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "US healthcare spending (% GDP):", "options": ["A) 11%", "B) 14%", "C) 17%", "D) 20%"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Health equity means same resources for everyone.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Access to care explains _____% of health variation.", "answer": "20", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "COVID-19's effect on inequalities:", "options": ["A) Eliminated", "B) Exposed/exacerbated", "C) No effect", "D) Reduced"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "health equity", "definition": "Highest health for all"}, {"word": "social determinants", "definition": "Living conditions affecting health"}, {"word": "disparities", "definition": "Health differences"}],
        "listening_tips": ["Note health statistics", "Listen for system comparisons", "Identify factors"]
    },
    19: {
        "title": "Academic Lecture: Digital Journalism",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_19_listening.mp3",
        "introduction": "You will hear a lecture about journalism and democracy.",
        "transcript": "Welcome, everyone. Today we examine the evolving landscape of news and information dissemination in the digital age.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "Newspaper ad revenue decline since 2000:", "options": ["A) 50%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "US lost _____ newspapers since 2004.", "answer": "2,500", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Misinformation engagement vs facts:", "options": ["A) 3x", "B) 4x", "C) 6x", "D) 8x"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Algorithms prioritise accuracy over engagement.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "EU's _____ Services Act regulates platforms.", "answer": "Digital", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "Communities losing newspapers see:", "options": ["A) More turnout", "B) Less turnout", "C) No change", "D) Better govt"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "algorithmic curation", "definition": "Automated content selection"}, {"word": "dissemination", "definition": "Spreading widely"}, {"word": "scrutiny", "definition": "Critical examination"}],
        "listening_tips": ["Note media stats", "Listen for democracy effects", "Identify regulatory approaches"]
    },
    20: {
        "title": "Academic Lecture: Tourism and Heritage",
        "level": "C1", "duration": "3 minutes", "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_20_listening.mp3",
        "introduction": "You will hear a lecture about tourism's impact on cultural heritage.",
        "transcript": "Good afternoon. Today we examine the complex relationship between tourism, cultural heritage, and community wellbeing.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "2018 international arrivals:", "options": ["A) 1.0B", "B) 1.2B", "C) 1.4B", "D) 1.6B"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Tourism is _____% of global GDP.", "answer": "10", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Venice annual visitors:", "options": ["A) 10M", "B) 20M", "C) 30M", "D) 40M"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Venice's residents outnumber annual visitors.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Bhutan charges $_____ daily per visitor.", "answer": "200", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "Sustainable tourism uses:", "options": ["A) Profit margin", "B) Carrying capacity", "C) Marketing", "D) Brand value"], "answer": "B"}
        ],
        "vocabulary_focus": [{"word": "overtourism", "definition": "Excessive tourism damage"}, {"word": "carrying capacity", "definition": "Maximum sustainable visitors"}, {"word": "heritage", "definition": "Valued traditions"}],
        "listening_tips": ["Note tourism stats", "Listen for management strategies", "Identify national approaches"]
    }
}

def update_seed_file():
    seed_file = "/app/backend/seed_advanced_mastery.py"
    
    with open(seed_file, 'r') as f:
        content = f.read()
    
    match = re.search(r'ADVANCED_MODULES = (\[.*?\])\s*\n\nasync def', content, re.DOTALL)
    if not match:
        print("Could not find ADVANCED_MODULES")
        return False
    
    modules_str = match.group(1)
    modules = eval(modules_str)
    
    for module in modules:
        module_num = module.get('module_number')
        if module_num in LISTENING_CONTENT_6_20:
            module['listening'] = LISTENING_CONTENT_6_20[module_num]
            print(f"Added listening to module {module_num}")
    
    new_modules_str = repr(modules)
    new_content = content.replace(modules_str, new_modules_str)
    
    with open(seed_file, 'w') as f:
        f.write(new_content)
    
    print("✅ Seed file updated with modules 6-20 listening!")
    return True

if __name__ == "__main__":
    update_seed_file()
