# Mastery Level Reading Question Bank
# Band Range: 6.0-7.0 (Intermediate-Advanced)
# Content: Academic and General Training Reading with Question Type categorization

"""
IELTS Reading Question Types:
1. Multiple Choice (MC) - Select correct answer from options
2. True/False/Not Given (TFNG) - Determine if statements match passage
3. Yes/No/Not Given (YNNG) - Opinion-based matching
4. Matching Headings (MH) - Match headings to paragraphs
5. Matching Information (MI) - Match statements to paragraphs
6. Matching Features (MF) - Match items to categories
7. Sentence Completion (SC) - Fill in gaps with words from passage
8. Summary Completion (SUM) - Complete summary with words
9. Note/Table/Flow-chart Completion (NTC) - Fill structured information
10. Short Answer Questions (SAQ) - Answer with words from passage
"""

# Question Types Definition
READING_QUESTION_TYPES = {
    "multiple_choice": {
        "name": "Multiple Choice",
        "code": "MC",
        "description": "Select the correct answer from A, B, C, or D options",
        "skills_tested": ["Main Idea", "Factual Detail", "Inference"],
        "difficulty_range": "5.0-9.0"
    },
    "true_false_ng": {
        "name": "True/False/Not Given",
        "code": "TFNG",
        "description": "Determine if statements are True, False, or Not Given based on the passage",
        "skills_tested": ["Factual Detail Retrieval", "Logical Inference"],
        "difficulty_range": "5.0-9.0"
    },
    "yes_no_ng": {
        "name": "Yes/No/Not Given",
        "code": "YNNG",
        "description": "Determine if statements match the writer's views or claims",
        "skills_tested": ["Writer's Opinion", "Claims Identification"],
        "difficulty_range": "6.0-9.0"
    },
    "matching_headings": {
        "name": "Matching Headings",
        "code": "MH",
        "description": "Match headings to paragraphs based on main ideas",
        "skills_tested": ["Main Idea", "Paragraph Structure"],
        "difficulty_range": "5.5-9.0"
    },
    "matching_information": {
        "name": "Matching Information",
        "code": "MI",
        "description": "Match specific information to the correct paragraph",
        "skills_tested": ["Scanning", "Information Location"],
        "difficulty_range": "5.5-9.0"
    },
    "matching_features": {
        "name": "Matching Features",
        "code": "MF",
        "description": "Match items, events, or statements to categories or people",
        "skills_tested": ["Categorization", "Detail Matching"],
        "difficulty_range": "5.5-8.5"
    },
    "sentence_completion": {
        "name": "Sentence Completion",
        "code": "SC",
        "description": "Complete sentences using words from the passage",
        "skills_tested": ["Detail Location", "Comprehension"],
        "difficulty_range": "5.0-8.0"
    },
    "summary_completion": {
        "name": "Summary Completion",
        "code": "SUM",
        "description": "Complete a summary using words from the passage or a word list",
        "skills_tested": ["Summary Skills", "Paraphrasing Recognition"],
        "difficulty_range": "5.5-8.5"
    },
    "table_completion": {
        "name": "Note/Table/Flow-chart Completion",
        "code": "NTC",
        "description": "Complete notes, tables, or flow-charts with information from passage",
        "skills_tested": ["Information Organization", "Detail Extraction"],
        "difficulty_range": "5.0-8.0"
    },
    "short_answer": {
        "name": "Short Answer Questions",
        "code": "SAQ",
        "description": "Answer questions using a limited number of words from the passage",
        "skills_tested": ["Factual Detail", "Comprehension"],
        "difficulty_range": "5.0-8.0"
    }
}

# Topics for Reading passages
READING_TOPICS = {
    "technology": {"name": "Technology & Innovation", "icon": "💻"},
    "environment": {"name": "Environment & Climate", "icon": "🌍"},
    "health": {"name": "Health & Medicine", "icon": "🏥"},
    "education": {"name": "Education & Learning", "icon": "📚"},
    "society": {"name": "Society & Culture", "icon": "👥"},
    "science": {"name": "Science & Research", "icon": "🔬"},
    "business": {"name": "Business & Economics", "icon": "💼"},
    "history": {"name": "History & Archaeology", "icon": "🏛️"}
}

# Band Levels for Mastery
MASTERY_BAND_LEVELS = {
    "band_6": {"range": "5.5-6.5", "name": "Band 6", "description": "Competent User"},
    "band_6.5": {"range": "6.0-7.0", "name": "Band 6.5", "description": "Competent-Good User"},
    "band_7": {"range": "6.5-7.5", "name": "Band 7", "description": "Good User"}
}

# Mastery Academic Reading Content
MASTERY_ACADEMIC_READING = {
    "technology_mc": {
        "module_id": "technology_mc",
        "topic": "technology",
        "question_type": "multiple_choice",
        "band_target": "6.0-7.0",
        "track": "academic",
        "title": "The Rise of Artificial Intelligence in Healthcare",
        "text_type": "Academic Journal Article",
        "word_count": 750,
        "passage": """The integration of artificial intelligence (AI) into healthcare systems represents one of the most significant technological shifts in modern medicine. While the concept of using machines to assist in medical diagnosis dates back several decades, recent advances in machine learning and computational power have dramatically accelerated the practical applications of AI in clinical settings.

Paragraph A
One of the primary applications of AI in healthcare is diagnostic imaging. Radiologists have traditionally relied on their trained eyes to detect abnormalities in X-rays, MRIs, and CT scans. However, AI algorithms can now analyze thousands of images in the time it takes a human specialist to review a single scan. Studies conducted at major medical centers have shown that AI systems can match or even exceed human accuracy in detecting certain conditions, particularly in identifying early-stage cancers that might be overlooked by exhausted practitioners.

Paragraph B
The implementation of AI diagnostic tools has not been without controversy. Critics argue that the 'black box' nature of machine learning algorithms makes it difficult to understand how decisions are reached. When a physician diagnoses a patient, they can explain their reasoning process. In contrast, deep learning systems often cannot provide clear explanations for their conclusions. This lack of transparency raises concerns about accountability when AI systems make errors.

Paragraph C
Beyond diagnostics, AI is revolutionizing drug discovery and development. Traditional pharmaceutical research involves testing thousands of compounds over many years, with a high failure rate. Machine learning models can now predict which molecular structures are most likely to be effective against specific diseases, potentially reducing development time from over a decade to just a few years. Several pharmaceutical companies have already announced partnerships with AI firms to accelerate their research pipelines.

Paragraph D
The economic implications of AI in healthcare are substantial. While the initial investment in AI systems is significant, proponents argue that long-term savings could be considerable. Automated systems can reduce administrative costs, minimize diagnostic errors that lead to expensive treatments, and enable earlier intervention when diseases are more treatable. However, skeptics point out that the technology may also lead to job displacement among healthcare workers and could exacerbate existing inequalities if access to AI-enhanced care is limited to wealthy institutions.

Paragraph E
Looking forward, the integration of AI into healthcare will likely deepen. Wearable devices and continuous monitoring systems are already generating vast amounts of health data that AI systems can analyze to predict and prevent illness before symptoms appear. The challenge for healthcare systems will be to harness these capabilities while addressing legitimate concerns about privacy, equity, and the fundamental role of human judgment in medical care.""",
        "questions": [
            {
                "id": 1,
                "type": "multiple_choice",
                "question": "According to the passage, what is one advantage of AI in diagnostic imaging?",
                "options": [
                    "A) It completely eliminates the need for human radiologists",
                    "B) It can process images much faster than human specialists",
                    "C) It is less expensive than traditional diagnostic methods",
                    "D) It provides clear explanations for all diagnoses"
                ],
                "answer": "B",
                "explanation": "The passage states that 'AI algorithms can now analyze thousands of images in the time it takes a human specialist to review a single scan.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 2,
                "type": "multiple_choice",
                "question": "What concern do critics have about AI diagnostic tools?",
                "options": [
                    "A) They are too slow for practical use",
                    "B) They cannot analyze multiple types of scans",
                    "C) Their decision-making process is not transparent",
                    "D) They require constant human supervision"
                ],
                "answer": "C",
                "explanation": "Paragraph B mentions that 'the black box nature of machine learning algorithms makes it difficult to understand how decisions are reached.'",
                "skill_tested": ["Main Idea", "Inference"]
            },
            {
                "id": 3,
                "type": "multiple_choice",
                "question": "How is AI affecting pharmaceutical research according to the passage?",
                "options": [
                    "A) By replacing all human researchers",
                    "B) By predicting effective molecular structures",
                    "C) By eliminating the need for clinical trials",
                    "D) By increasing the failure rate of drug development"
                ],
                "answer": "B",
                "explanation": "Paragraph C states that 'Machine learning models can now predict which molecular structures are most likely to be effective against specific diseases.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 4,
                "type": "multiple_choice",
                "question": "What economic benefit of AI in healthcare is mentioned?",
                "options": [
                    "A) Immediate cost savings from day one",
                    "B) Guaranteed job creation for all workers",
                    "C) Potential reduction in administrative and diagnostic costs",
                    "D) Equal distribution of technology to all hospitals"
                ],
                "answer": "C",
                "explanation": "Paragraph D mentions that 'Automated systems can reduce administrative costs, minimize diagnostic errors that lead to expensive treatments.'",
                "skill_tested": ["Factual Detail Retrieval", "Inference"]
            },
            {
                "id": 5,
                "type": "multiple_choice",
                "question": "What does the passage suggest about the future of AI in healthcare?",
                "options": [
                    "A) It will completely replace human doctors",
                    "B) It will become less important over time",
                    "C) Integration will likely increase with wearable devices",
                    "D) It will only be used in wealthy countries"
                ],
                "answer": "C",
                "explanation": "Paragraph E discusses how 'Wearable devices and continuous monitoring systems are already generating vast amounts of health data that AI systems can analyze.'",
                "skill_tested": ["Inference", "Main Idea"]
            },
            {
                "id": 6,
                "type": "multiple_choice",
                "question": "What is the main purpose of Paragraph B?",
                "options": [
                    "A) To explain how AI works in hospitals",
                    "B) To discuss concerns about AI transparency",
                    "C) To compare different AI systems",
                    "D) To promote the use of AI in medicine"
                ],
                "answer": "B",
                "explanation": "Paragraph B focuses on the controversy and concerns about the 'black box' nature of AI decision-making.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            }
        ],
        "vocabulary_focus": [
            {"term": "algorithm", "meaning": "A set of rules or instructions for solving problems", "context": "AI algorithms can analyze thousands of images"},
            {"term": "accountability", "meaning": "The state of being responsible for decisions or actions", "context": "Raises concerns about accountability when AI systems make errors"},
            {"term": "exacerbate", "meaning": "To make a problem or situation worse", "context": "Could exacerbate existing inequalities"}
        ],
        "reading_tips": [
            "For multiple choice, eliminate obviously wrong answers first",
            "Look for keywords from the question in the passage",
            "Be careful of answers that are partially correct but incomplete"
        ]
    },
    "environment_tfng": {
        "module_id": "environment_tfng",
        "topic": "environment",
        "question_type": "true_false_ng",
        "band_target": "6.0-7.0",
        "track": "academic",
        "title": "Urban Green Spaces and Mental Health",
        "text_type": "Research Report",
        "word_count": 680,
        "passage": """The relationship between urban green spaces and mental health has attracted considerable research attention in recent years. As cities continue to expand and more people live in densely populated urban environments, understanding the psychological benefits of parks, gardens, and other natural areas has become increasingly important for urban planners and public health officials.

A comprehensive study conducted across 15 European cities found that residents living within 300 meters of a park or green space reported significantly lower levels of stress and anxiety compared to those without nearby access to nature. The research, which surveyed over 20,000 participants, controlled for factors such as income, age, and pre-existing health conditions.

Interestingly, the type of green space appears to matter less than its accessibility. Both formal parks with maintained lawns and more natural, wild areas showed similar benefits for mental wellbeing. What proved crucial was regular exposure – participants who visited green spaces at least three times per week showed the most substantial improvements in reported mood and stress levels.

The mechanisms behind these benefits are still being investigated. Some researchers suggest that exposure to nature reduces cortisol levels, a hormone associated with stress. Others point to the social benefits of green spaces, which often serve as community gathering points where people can interact with neighbors and build social connections.

However, not all urban green spaces provide equal benefits. Research indicates that perceived safety is a crucial factor – parks that residents consider unsafe due to crime or poor maintenance do not confer the same mental health advantages. This finding has significant implications for urban planning, suggesting that investment in green space maintenance and security may be as important as creating new parks.

Children appear to benefit particularly from access to nature. Studies have linked time spent in green spaces with improved attention spans, reduced symptoms of ADHD, and better emotional regulation in young people. Some schools have begun incorporating more outdoor learning and 'green time' into their curricula as a result of these findings.

The COVID-19 pandemic highlighted the importance of urban green spaces when many indoor facilities closed. Cities with abundant, accessible parks saw their residents cope better with lockdown restrictions, underscoring the essential role these spaces play in urban resilience.""",
        "questions": [
            {
                "id": 1,
                "type": "true_false_ng",
                "question": "The European study involved more than 20,000 participants.",
                "answer": "True",
                "explanation": "The passage states 'The research, which surveyed over 20,000 participants.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 2,
                "type": "true_false_ng",
                "question": "Formal parks with maintained lawns are more beneficial than wild natural areas.",
                "answer": "False",
                "explanation": "The passage states that 'Both formal parks with maintained lawns and more natural, wild areas showed similar benefits.'",
                "skill_tested": ["Factual Detail Retrieval", "Comparison"]
            },
            {
                "id": 3,
                "type": "true_false_ng",
                "question": "Researchers have definitively identified why green spaces improve mental health.",
                "answer": "False",
                "explanation": "The passage says 'The mechanisms behind these benefits are still being investigated,' indicating uncertainty.",
                "skill_tested": ["Inference", "Logical Reasoning"]
            },
            {
                "id": 4,
                "type": "true_false_ng",
                "question": "Parks that are perceived as unsafe provide fewer mental health benefits.",
                "answer": "True",
                "explanation": "The passage states 'parks that residents consider unsafe due to crime or poor maintenance do not confer the same mental health advantages.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 5,
                "type": "true_false_ng",
                "question": "All schools have now incorporated outdoor learning into their curricula.",
                "answer": "Not Given",
                "explanation": "The passage says 'Some schools have begun incorporating' – not all schools, and the current extent is not specified.",
                "skill_tested": ["Inference", "Not Given Recognition"]
            },
            {
                "id": 6,
                "type": "true_false_ng",
                "question": "The study controlled for participants' economic status.",
                "answer": "True",
                "explanation": "The passage mentions the research 'controlled for factors such as income, age, and pre-existing health conditions.'",
                "skill_tested": ["Factual Detail Retrieval"]
            }
        ],
        "vocabulary_focus": [
            {"term": "cortisol", "meaning": "A hormone released in response to stress", "context": "Exposure to nature reduces cortisol levels"},
            {"term": "confer", "meaning": "To give or grant something", "context": "Do not confer the same mental health advantages"},
            {"term": "resilience", "meaning": "The ability to recover from difficulties", "context": "The essential role these spaces play in urban resilience"}
        ],
        "reading_tips": [
            "For True/False/Not Given, focus only on what the passage explicitly states",
            "Not Given means the information is neither confirmed nor denied",
            "Be careful with words like 'all', 'never', 'always' - these often indicate False answers"
        ]
    },
    "health_matching": {
        "module_id": "health_matching",
        "topic": "health",
        "question_type": "matching_headings",
        "band_target": "6.0-7.0",
        "track": "academic",
        "title": "Sleep Patterns and Cognitive Performance",
        "text_type": "Scientific Review",
        "word_count": 720,
        "passage": """Paragraph A
The relationship between sleep and cognitive function has been studied extensively over the past few decades. Research consistently demonstrates that adequate sleep is essential for optimal brain performance, affecting everything from memory consolidation to decision-making abilities. Adults typically require between seven and nine hours of sleep per night, though individual needs can vary.

Paragraph B
Recent studies have identified specific stages of sleep that are particularly important for different cognitive functions. During rapid eye movement (REM) sleep, the brain processes emotional experiences and creative problem-solving. Non-REM sleep, particularly the deep sleep stages, appears crucial for consolidating factual memories and motor skills. Disruption to either type of sleep can impair specific cognitive abilities.

Paragraph C
The consequences of chronic sleep deprivation extend beyond simple tiredness. Research conducted on medical residents working extended shifts found that those who slept fewer than six hours per night made significantly more errors in diagnostic tests. Similar studies in other professions have confirmed that sleep deprivation affects judgment, reaction time, and the ability to learn new information.

Paragraph D
Interestingly, the timing of sleep may be as important as its duration. The body's circadian rhythm, an internal clock that regulates sleep-wake cycles, influences when cognitive performance peaks. Most people experience their highest alertness in the late morning and early afternoon, with a natural dip in the early afternoon and again in the evening. Working against this rhythm can reduce effectiveness even when total sleep hours are adequate.

Paragraph E
Age-related changes in sleep patterns present particular challenges. Older adults often experience lighter, more fragmented sleep and may have difficulty achieving deep sleep stages. These changes have been linked to the cognitive decline sometimes observed in aging populations. However, research suggests that maintaining good sleep hygiene can mitigate some of these effects.

Paragraph F
The technology industry has begun developing solutions to address sleep-related cognitive issues. Smart devices can now track sleep stages and provide personalized recommendations for improving sleep quality. Some employers have even introduced nap rooms and flexible schedules to accommodate employees' natural sleep needs, recognizing the productivity benefits of well-rested workers.""",
        "headings": [
            "i. Technological approaches to sleep improvement",
            "ii. The importance of sleep timing",
            "iii. Different sleep stages and their functions",
            "iv. The basic connection between sleep and brain function",
            "v. How sleep needs change with age",
            "vi. Evidence of sleep deprivation's effects on work",
            "vii. The economic cost of poor sleep",
            "viii. Recommended sleep interventions"
        ],
        "questions": [
            {
                "id": 1,
                "type": "matching_headings",
                "question": "Paragraph A",
                "answer": "iv",
                "explanation": "Paragraph A introduces the basic relationship between sleep and cognitive function.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            },
            {
                "id": 2,
                "type": "matching_headings",
                "question": "Paragraph B",
                "answer": "iii",
                "explanation": "Paragraph B discusses REM and Non-REM sleep and their specific functions.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            },
            {
                "id": 3,
                "type": "matching_headings",
                "question": "Paragraph C",
                "answer": "vi",
                "explanation": "Paragraph C provides evidence from studies on medical residents and other professions.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            },
            {
                "id": 4,
                "type": "matching_headings",
                "question": "Paragraph D",
                "answer": "ii",
                "explanation": "Paragraph D focuses on circadian rhythm and the timing of sleep.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            },
            {
                "id": 5,
                "type": "matching_headings",
                "question": "Paragraph E",
                "answer": "v",
                "explanation": "Paragraph E discusses how sleep patterns change as people get older.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            },
            {
                "id": 6,
                "type": "matching_headings",
                "question": "Paragraph F",
                "answer": "i",
                "explanation": "Paragraph F describes technology solutions and workplace initiatives for sleep.",
                "skill_tested": ["Main Idea", "Paragraph Structure"]
            }
        ],
        "vocabulary_focus": [
            {"term": "consolidation", "meaning": "The process of making something stronger or more solid", "context": "Memory consolidation"},
            {"term": "circadian rhythm", "meaning": "The natural internal process regulating the sleep-wake cycle", "context": "The body's circadian rhythm"},
            {"term": "mitigate", "meaning": "To make less severe or serious", "context": "Can mitigate some of these effects"}
        ],
        "reading_tips": [
            "Read paragraphs quickly to identify the main idea",
            "Look at the first and last sentences of each paragraph",
            "Some headings may not be used - don't force a match"
        ]
    },
    "education_sentence_completion": {
        "module_id": "education_sentence_completion",
        "topic": "education",
        "question_type": "sentence_completion",
        "band_target": "6.0-7.0",
        "track": "academic",
        "title": "The Evolution of Distance Learning",
        "text_type": "Educational Research Paper",
        "word_count": 650,
        "passage": """Distance learning, once considered a fringe alternative to traditional classroom education, has undergone a remarkable transformation over the past two decades. What began as correspondence courses delivered by post has evolved into sophisticated online platforms offering interactive, multimedia-rich learning experiences to millions of students worldwide.

The earliest forms of distance education emerged in the nineteenth century when universities began offering courses by mail. Students would receive printed materials, complete assignments, and return them for grading. This model persisted well into the twentieth century, with institutions like the Open University in Britain pioneering large-scale distance learning from 1969 onwards.

The advent of the internet revolutionized the field entirely. By the early 2000s, universities were experimenting with online course delivery, though initial attempts often simply replicated traditional lectures in video format. The real breakthrough came with the development of learning management systems that enabled genuine interaction between students and instructors, as well as among students themselves.

Massive Open Online Courses, commonly known as MOOCs, emerged around 2012 and attracted significant attention. Platforms such as Coursera and edX offered free courses from prestigious universities, enrolling millions of participants. However, completion rates for these courses remained disappointingly low, often below ten percent, prompting educators to reconsider the design of online learning experiences.

The COVID-19 pandemic accelerated the adoption of online learning dramatically. Institutions that had previously resisted digital transformation were forced to move courses online almost overnight. This sudden shift revealed both the potential and limitations of distance learning, highlighting the need for proper technological infrastructure and instructor training.

Research into the effectiveness of online learning has produced mixed results. While some studies suggest that well-designed online courses can be as effective as face-to-face instruction, others emphasize the importance of social interaction and hands-on experience that virtual environments struggle to replicate. The consensus among educators is that the future likely lies in hybrid models that combine the flexibility of online learning with the engagement of in-person instruction.""",
        "questions": [
            {
                "id": 1,
                "type": "sentence_completion",
                "question": "The earliest distance education courses were delivered by ___.",
                "answer": "post/mail",
                "word_limit": 2,
                "explanation": "The passage states 'correspondence courses delivered by post' and 'courses by mail'.",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 2,
                "type": "sentence_completion",
                "question": "The Open University in Britain started large-scale distance learning in ___.",
                "answer": "1969",
                "word_limit": 1,
                "explanation": "The passage mentions 'the Open University in Britain pioneering large-scale distance learning from 1969 onwards.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 3,
                "type": "sentence_completion",
                "question": "Learning management systems enabled ___ between students and instructors.",
                "answer": "interaction/genuine interaction",
                "word_limit": 3,
                "explanation": "The passage states these systems 'enabled genuine interaction between students and instructors.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 4,
                "type": "sentence_completion",
                "question": "MOOC completion rates were often below ___ percent.",
                "answer": "ten/10",
                "word_limit": 1,
                "explanation": "The passage states 'completion rates for these courses remained disappointingly low, often below ten percent.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 5,
                "type": "sentence_completion",
                "question": "The pandemic revealed the need for proper technological infrastructure and ___.",
                "answer": "instructor training",
                "word_limit": 2,
                "explanation": "The passage mentions 'the need for proper technological infrastructure and instructor training.'",
                "skill_tested": ["Factual Detail Retrieval"]
            },
            {
                "id": 6,
                "type": "sentence_completion",
                "question": "The future of education likely involves ___ models combining online and in-person learning.",
                "answer": "hybrid",
                "word_limit": 1,
                "explanation": "The passage concludes that 'the future likely lies in hybrid models.'",
                "skill_tested": ["Factual Detail Retrieval", "Main Idea"]
            }
        ],
        "vocabulary_focus": [
            {"term": "fringe", "meaning": "Not part of the mainstream; marginal", "context": "Once considered a fringe alternative"},
            {"term": "replicate", "meaning": "To copy or reproduce exactly", "context": "Simply replicated traditional lectures"},
            {"term": "consensus", "meaning": "General agreement among a group", "context": "The consensus among educators"}
        ],
        "reading_tips": [
            "Pay attention to the word limit for each answer",
            "Use words directly from the passage",
            "Check that your answer makes grammatical sense in the sentence"
        ]
    },
    "science_summary": {
        "module_id": "science_summary",
        "topic": "science",
        "question_type": "summary_completion",
        "band_target": "6.0-7.0",
        "track": "academic",
        "title": "Ocean Acidification and Marine Ecosystems",
        "text_type": "Scientific Article",
        "word_count": 700,
        "passage": """Ocean acidification represents one of the most significant but often overlooked consequences of rising carbon dioxide levels in Earth's atmosphere. As humans burn fossil fuels, the oceans absorb approximately one-quarter of the carbon dioxide released, triggering chemical reactions that increase the acidity of seawater. Since the Industrial Revolution, ocean acidity has increased by roughly 30 percent, a rate of change unprecedented in millions of years.

The chemistry behind ocean acidification is straightforward. When carbon dioxide dissolves in seawater, it forms carbonic acid, which releases hydrogen ions. These hydrogen ions combine with carbonate ions that are essential for marine organisms to build their shells and skeletons. As more carbonate ions are consumed, creatures such as corals, mollusks, and certain types of plankton find it increasingly difficult to construct and maintain their calcium carbonate structures.

The effects on marine ecosystems are already becoming apparent. Coral reefs, often called the rainforests of the sea due to their extraordinary biodiversity, are particularly vulnerable. Scientists have observed that corals in more acidic waters grow more slowly and are more susceptible to erosion. Some species may be unable to adapt quickly enough to survive the projected changes in ocean chemistry over the coming decades.

The implications extend throughout the food chain. Pteropods, tiny sea snails that form a crucial part of the marine food web, have shown alarming shell dissolution in acidified waters. Since these organisms serve as food for fish, whales, and seabirds, their decline could have cascading effects on larger species, including those important to commercial fisheries.

However, not all marine life responds negatively to acidification. Some research suggests that certain seagrasses and algae may actually benefit from higher carbon dioxide levels, growing more rapidly under acidified conditions. These organisms could potentially expand their range, altering the composition of marine communities in ways scientists are only beginning to understand.

Addressing ocean acidification requires reducing carbon dioxide emissions, as there is no practical way to neutralize the acid in the open ocean. Some coastal areas have experimented with adding alkaline substances to local waters, but such interventions are only feasible on very limited scales. The long-term solution must involve the same measures needed to address climate change more broadly.""",
        "summary_text": """Ocean acidification occurs when the ocean absorbs (1)___ from the atmosphere. This creates carbonic acid, which releases (2)___ that reduce the availability of carbonate ions. Marine organisms like corals and (3)___ need these carbonate ions to build their shells.

Coral reefs are especially at risk because they grow more (4)___ in acidic water. Small creatures called (5)___ are showing shell damage, which could affect the entire food chain. Interestingly, some (6)___ may actually grow better with more CO2.

The only real solution is to reduce (7)___ emissions since treating the ocean directly is not practical on a large scale.""",
        "word_list": ["carbon dioxide", "hydrogen ions", "mollusks", "slowly", "pteropods", "seagrasses", "carbon dioxide", "plankton", "quickly", "fish"],
        "questions": [
            {
                "id": 1,
                "type": "summary_completion",
                "question": "Gap 1",
                "answer": "carbon dioxide",
                "explanation": "The passage states 'the oceans absorb approximately one-quarter of the carbon dioxide released.'",
                "skill_tested": ["Summary Skills"]
            },
            {
                "id": 2,
                "type": "summary_completion",
                "question": "Gap 2",
                "answer": "hydrogen ions",
                "explanation": "The passage explains that carbonic acid 'releases hydrogen ions.'",
                "skill_tested": ["Summary Skills"]
            },
            {
                "id": 3,
                "type": "summary_completion",
                "question": "Gap 3",
                "answer": "mollusks",
                "explanation": "The passage mentions 'corals, mollusks, and certain types of plankton.'",
                "skill_tested": ["Summary Skills"]
            },
            {
                "id": 4,
                "type": "summary_completion",
                "question": "Gap 4",
                "answer": "slowly",
                "explanation": "The passage states 'corals in more acidic waters grow more slowly.'",
                "skill_tested": ["Summary Skills"]
            },
            {
                "id": 5,
                "type": "summary_completion",
                "question": "Gap 5",
                "answer": "pteropods",
                "explanation": "The passage mentions 'Pteropods, tiny sea snails.'",
                "skill_tested": ["Summary Skills"]
            },
            {
                "id": 6,
                "type": "summary_completion",
                "question": "Gap 6",
                "answer": "seagrasses",
                "explanation": "The passage states 'certain seagrasses and algae may actually benefit.'",
                "skill_tested": ["Summary Skills"]
            },
            {
                "id": 7,
                "type": "summary_completion",
                "question": "Gap 7",
                "answer": "carbon dioxide",
                "explanation": "The passage concludes 'Addressing ocean acidification requires reducing carbon dioxide emissions.'",
                "skill_tested": ["Summary Skills", "Main Idea"]
            }
        ],
        "vocabulary_focus": [
            {"term": "acidification", "meaning": "The process of becoming more acidic", "context": "Ocean acidification represents"},
            {"term": "unprecedented", "meaning": "Never done or known before", "context": "A rate of change unprecedented in millions of years"},
            {"term": "cascading", "meaning": "Occurring in a series of stages", "context": "Could have cascading effects"}
        ],
        "reading_tips": [
            "Read the summary first to understand the overall structure",
            "Use the word list to narrow down options",
            "Make sure selected words fit grammatically"
        ]
    }
}

# Helper functions
def get_all_mastery_reading_modules():
    """Return summary of all Mastery Reading modules"""
    modules = []
    for key, module in MASTERY_ACADEMIC_READING.items():
        modules.append({
            "module_id": module["module_id"],
            "topic": module["topic"],
            "question_type": module["question_type"],
            "title": module["title"],
            "band_target": module["band_target"],
            "track": module["track"],
            "text_type": module["text_type"],
            "question_count": len(module.get("questions", []))
        })
    return modules

def get_mastery_reading_by_id(module_id):
    """Get specific Mastery Reading module by ID"""
    return MASTERY_ACADEMIC_READING.get(module_id)

def get_mastery_reading_by_topic(topic):
    """Get all modules for a specific topic"""
    return [m for m in MASTERY_ACADEMIC_READING.values() if m["topic"] == topic]

def get_mastery_reading_by_question_type(question_type):
    """Get all modules for a specific question type"""
    return [m for m in MASTERY_ACADEMIC_READING.values() if m["question_type"] == question_type]

def get_reading_question_types():
    """Return all IELTS reading question types"""
    return READING_QUESTION_TYPES

def get_reading_topics():
    """Return all reading topics"""
    return READING_TOPICS

def get_mastery_band_levels():
    """Return Mastery band level options"""
    return MASTERY_BAND_LEVELS
