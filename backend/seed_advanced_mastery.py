#!/usr/bin/env python3
"""
Advanced IELTS Mastery: Band 6.0-9.0 Full Course
20 Modules covering all advanced IELTS topics for Band 7-9 achievement
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

ADVANCED_MODULES = [
    # Module 1: The Digital Frontier (Technology & Ethics)
    {
        "id": "advanced-module-1",
        "module_number": 1,
        "title": "The Digital Frontier",
        "subtitle": "Technology & Ethics",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Master the nuances of 'Disruptive Technology' and 'Algorithmic Ethics'",
            "Utilize nominalization to enhance academic tone",
            "Critically analyze the intersection of privacy and innovation"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Disruptive Innovation", "meaning": "Innovations that significantly alter the way markets operate", "usage": "Noun phrase; Subject of sentence", "example": "The advent of AI is a disruptive innovation that challenges traditional employment."},
                {"term": "Pervasive", "meaning": "Spreading widely throughout an area or group of people", "usage": "Adjective; used with 'influence/nature'", "example": "The pervasive nature of surveillance technology raises significant privacy concerns."},
                {"term": "Double-edged sword", "meaning": "Something that has both favorable and unfavorable consequences", "usage": "Idiomatic (IELTS-safe)", "example": "Social media is a double-edged sword, fostering connection while facilitating misinformation."},
                {"term": "To exacerbate", "meaning": "To make a problem or bad situation worse", "usage": "Verb; high-level alternative to 'worsen'", "example": "Unregulated automation may exacerbate existing wealth inequalities."}
            ]
        },
        "grammar": {
            "title": "Nominalization & Cleft Sentences",
            "explanation": "To reach Band 7+, you must move away from simple 'subject-verb' patterns. Use nominalization to turn verbs into nouns for academic tone.",
            "band_65_example": "People use AI more, and this makes jobs disappear.",
            "band_75_example": "The increasing integration of artificial intelligence into the workforce has led to the unprecedented displacement of traditional labor.",
            "cleft_sentence": "What concerns ethicists most is not the technology itself, but the lack of a regulatory framework."
        },
        "reading": {
            "title": "The Algorithmic Governance of Society",
            "word_count": 320,
            "text": "The 21st century has ushered in an era where algorithms dictate human experience, from the news we consume to the credit scores we are assigned. While proponents argue that data-driven decisions are more objective than human judgment, critics highlight the danger of 'encoded bias.' When machine learning models are trained on historical data containing human prejudices, they do not eliminate bias; they institutionalize it. This phenomenon, known as algorithmic opacity, makes it difficult for individuals to challenge decisions that affect their livelihoods. Furthermore, the relentless pursuit of data-mining by tech conglomerates has turned personal information into the world's most valuable commodity, often at the expense of individual sovereignty.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe algorithms are entirely objective?", "answer": "No"},
                {"type": "matching_info", "question": "Which paragraph discusses 'encoded bias'?", "answer": "Paragraph 1"},
                {"type": "summary_completion", "question": "The author suggests that data-mining prioritizes ______ over ______.", "answer": "Profit/Commodity over individual sovereignty"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a piece of technology you find difficult to use. Explain why it is challenging and how it impacts your life.",
                "model_answer": "I'd like to describe the smart home system I recently installed. While the concept is straightforward, the execution has been challenging due to the pervasive connectivity issues between devices. The technology requires a sophisticated understanding of network protocols, which I find frustrating."
            },
            "part3": {
                "question": "To what extent should governments regulate the development of artificial intelligence?",
                "band8_sample": "I'm of the mind that regulation is imperative. We cannot simply allow tech giants to operate in a legislative vacuum. If we don't implement a robust framework, the socio-economic repercussions could be profound."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some argue that the rise of automation will lead to a better quality of life, while others fear it will cause mass unemployment. Discuss both views and give your opinion.",
            "band75_excerpt": "The debate surrounding automation is often polarized. Opponents argue that the mechanization of service industries will inevitably lead to a redundancy crisis. However, I would contend that while certain roles become obsolete, technology historically acts as a catalyst for new, more sophisticated employment sectors. The shift is not towards 'joblessness' but towards 're-skilling'.",
            "examiner_analysis": {
                "task_response": "Addresses both sides and provides a clear, nuanced position.",
                "lexical_resource": "Uses 'mechanization,' 'redundancy,' 'obsolete,' and 'catalyst' instead of 'machines' or 'ending jobs'.",
                "error_upgrade": "Avoid 'I think technology is good.' Use 'It is widely asserted that technological advancement yields significant societal benefits'."
            }
        },
        "examiner_tips": [
            "Use nominalization to create academic tone",
            "Cleft sentences show sophistication",
            "Avoid over-simplification of complex issues"
        ]
    },
    # Module 2: The Green Imperative (Environment & Urbanization)
    {
        "id": "advanced-module-2",
        "module_number": 2,
        "title": "The Green Imperative",
        "subtitle": "Environment & Urbanization",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Discuss 'Ecological Footprints' and 'Urban Sprawl' using academic collocations",
            "Master conditional structures (Type 2 & 3) for hypothetical problem-solving",
            "Develop complex arguments regarding international cooperation"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Mitigation", "meaning": "The action of reducing the severity of something", "usage": "Noun; usually with 'strategies'", "example": "Climate mitigation strategies must be prioritized by industrialized nations."},
                {"term": "Irreversible Damage", "meaning": "Harm that cannot be repaired or undone", "usage": "Collocation (High-level)", "example": "We are approaching a tipping point of irreversible damage to marine ecosystems."},
                {"term": "To incentivize", "meaning": "To provide someone with an incentive for doing something", "usage": "Verb; useful for 'Government' topics", "example": "Governments should incentivize the adoption of renewable energy sources."},
                {"term": "Sustainable Urbanization", "meaning": "Growing cities in a way that preserves resources", "usage": "Academic phrase", "example": "Sustainable urbanization requires a radical rethink of public transport."}
            ]
        },
        "grammar": {
            "title": "Conditional Complexity",
            "explanation": "Use inverted third conditionals and mixed conditionals to express sophisticated hypothetical scenarios.",
            "band_65_example": "If we don't stop pollution, the earth will get hotter.",
            "band_80_example": "Had governments acted sooner to curb carbon emissions, the current rate of glacial depletion might not have reached such critical levels."
        },
        "reading": {
            "title": "Urban Sprawl and Environmental Degradation",
            "word_count": 340,
            "text": "The phenomenon of urban sprawl represents one of the most significant challenges to environmental sustainability. As cities expand outward, natural habitats are destroyed, biodiversity declines, and carbon footprints increase dramatically. The infrastructure required to support sprawling suburbs—roads, utilities, and services—consumes vast resources and generates substantial emissions. Critics argue that this pattern of development is fundamentally unsustainable. Proponents of 'smart growth' advocate for compact, walkable urban designs that minimize environmental impact while maximizing quality of life.",
            "questions": [
                {"type": "true_false_ng", "question": "Urban sprawl always leads to improved quality of life.", "answer": "False"},
                {"type": "true_false_ng", "question": "Smart growth prioritizes walkable urban designs.", "answer": "True"},
                {"type": "sentence_completion", "question": "The infrastructure of sprawling suburbs generates substantial ______.", "answer": "emissions"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe an environmental problem in your area. Explain what causes it and what could be done to solve it.",
                "model_answer": "In my city, air pollution has become a pressing concern. The primary catalyst is the reliance on private vehicles. Had the government invested in public transportation infrastructure earlier, we might not be facing such severe air quality issues today."
            },
            "part3": {
                "question": "Should individuals or governments be more responsible for environmental protection?",
                "band8_sample": "While individual actions are commendable, systemic change requires governmental intervention. It is imperative that legislators implement policies that incentivize sustainable practices at the corporate level."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Environmental protection is the responsibility of the individual, not the government. To what extent do you agree?",
            "band75_excerpt": "While the humanities foster critical thinking, a national curriculum that fails to prioritize environmental education risks leaving its workforce ill-equipped for the challenges of climate change. Individual actions, though laudable, are insufficient without macro-level intervention.",
            "examiner_analysis": {
                "task_response": "Focuses on 'systemic change' and 'legislative mandates' rather than just 'recycling'.",
                "lexical_resource": "Uses sophisticated collocations like 'corporate accountability' and 'macro-level intervention'."
            }
        },
        "examiner_tips": [
            "Use inverted conditionals for sophistication",
            "Balance individual and governmental perspectives",
            "Employ academic collocations for environment topics"
        ]
    },
    # Module 3: The Educational Paradigm
    {
        "id": "advanced-module-3",
        "module_number": 3,
        "title": "The Educational Paradigm",
        "subtitle": "Education & The Future",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Contrast 'Rote Learning' vs. 'Critical Thinking' using academic vocabulary",
            "Discuss 'Holistic Development' and 'Socio-economic Disparity'",
            "Use 'Pedagogical approach' as a high-level synonym for teaching style"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Rote Learning", "meaning": "Memorization without deep understanding", "usage": "Noun; often contrasted with critical thinking", "example": "Rote learning may help students pass exams but fails to foster analytical skills."},
                {"term": "Holistic Development", "meaning": "Comprehensive growth including intellectual, emotional, and social aspects", "usage": "Noun phrase", "example": "Modern education should prioritize holistic development over mere academic achievement."},
                {"term": "Socio-economic Disparity", "meaning": "Differences in wealth and opportunity between groups", "usage": "Noun phrase", "example": "Socio-economic disparity significantly impacts access to quality education."},
                {"term": "Pedagogical Approach", "meaning": "Teaching methodology or style", "usage": "Noun phrase; formal", "example": "The pedagogical approach has shifted from teacher-centered to student-centered learning."}
            ]
        },
        "grammar": {
            "title": "Complex Noun Phrases",
            "explanation": "Build sophisticated noun phrases to convey complex ideas concisely.",
            "band_65_example": "The way teachers teach has changed a lot.",
            "band_80_example": "The fundamental transformation in pedagogical approaches has necessitated a complete reconceptualization of classroom dynamics."
        },
        "reading": {
            "title": "The Digital Classroom Revolution",
            "word_count": 330,
            "text": "The integration of technology into education has sparked intense debate about the future of learning. Traditional pedagogical approaches, characterized by rote memorization and passive absorption of information, are increasingly being challenged by advocates of experiential and inquiry-based learning. The digital revolution offers unprecedented opportunities for personalized education, yet critics warn of the widening socio-economic disparity in access to technology. Furthermore, the emphasis on standardized testing may undermine efforts to promote holistic development and critical thinking skills.",
            "questions": [
                {"type": "multiple_choice", "question": "What is being challenged by new educational approaches?", "options": ["Technology integration", "Traditional pedagogical methods", "Student engagement"], "answer": "Traditional pedagogical methods"},
                {"type": "true_false_ng", "question": "All students have equal access to educational technology.", "answer": "False"},
                {"type": "sentence_completion", "question": "Standardized testing may undermine efforts to promote ______ development.", "answer": "holistic"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "How has the role of the teacher changed in the digital age?",
                "band8_sample": "The teacher has transitioned from being the 'sage on the stage' to a 'guide on the side', facilitating the navigation of information rather than the mere dissemination of it."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that university education should be available to all students. Others think it should be restricted to those with strong academic ability. Discuss both views.",
            "band75_excerpt": "The democratization of higher education has profound implications for social mobility. While meritocratic selection ensures academic rigor, restricting access may perpetuate socio-economic disparities across generations.",
            "examiner_analysis": {
                "task_response": "Balances egalitarian and meritocratic perspectives",
                "lexical_resource": "Uses 'democratization', 'social mobility', 'meritocratic selection'"
            }
        },
        "examiner_tips": [
            "Use 'pedagogical' instead of 'teaching' for academic tone",
            "Contrast traditional and modern approaches",
            "Address socio-economic implications"
        ]
    },
    # Module 4: Globalisation and Cultural Identity
    {
        "id": "advanced-module-4",
        "module_number": 4,
        "title": "Globalisation and Cultural Identity",
        "subtitle": "Cultural Convergence vs. Preservation",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the tension between cultural homogenization and heterogenization",
            "Utilize negative inversion to provide rhetorical emphasis in arguments",
            "Critically evaluate the socio-economic impacts of multinational corporations on local heritage"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Cultural Homogenization", "meaning": "The process by which local cultures are transformed or absorbed by a dominant outside culture", "usage": "Noun phrase; often used as a negative outcome", "example": "The primary concern regarding globalisation is the potential for cultural homogenization across the globe."},
                {"term": "Linguistic Hegemony", "meaning": "The dominance of one language over others", "usage": "Noun; specific to language topics", "example": "The linguistic hegemony of English often threatens the survival of indigenous dialects."},
                {"term": "To transcend", "meaning": "To rise above or go beyond the limits of something", "usage": "Verb; high-level alternative to 'go past'", "example": "Art and music possess a unique ability to transcend political and cultural boundaries."},
                {"term": "A veneer of modernity", "meaning": "A thin outward appearance of being modern that hides a different reality", "usage": "Idiomatic/Metaphorical phrase", "example": "Many cities have adopted a veneer of modernity while struggling to preserve their historical essence."}
            ]
        },
        "grammar": {
            "title": "Negative Inversion for Emphasis",
            "explanation": "To achieve Band 7+, you must demonstrate mastery over rare structures like inversion.",
            "band_65_example": "Globalisation helps the economy and it also helps people understand other cultures.",
            "band_80_example": "Not only does globalisation bolster international trade, but it also facilitates a profound cross-pollination of cultural values.",
            "alternative_structure": "Seldom have we seen such a rapid erosion of traditional customs as in the current era of digital connectivity."
        },
        "reading": {
            "title": "The Paradox of the Global Village",
            "word_count": 335,
            "text": "The term 'Global Village,' coined by Marshall McLuhan, suggests a world interconnected by electronic media where distances are shrunk and cultures are shared. However, this interconnectedness is a double-edged sword. While it allows for the unprecedented dissemination of information, it simultaneously facilitates a 'McDonaldisation' of society. This refers to the standardisation of consumer habits, where global brands replace local businesses, leading to a singular, westernised lifestyle. Sociologists argue that this trend leads to 'cultural dilution,' where the unique nuances of heritage are lost to the convenience of mass production.",
            "questions": [
                {"type": "true_false_ng", "question": "Does the author state that 'glocalisation' is purely an economic strategy?", "answer": "False"},
                {"type": "matching_info", "question": "Which section mentions the architectural standardisation of cities?", "answer": "Paragraph 2"},
                {"type": "sentence_completion", "question": "The term 'McDonaldisation' is used to illustrate the ______ of consumer habits.", "answer": "Standardisation"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a tradition from your country that you think is important to preserve. Explain why it is at risk and how it could be protected.",
                "model_answer": "I'd like to discuss the traditional tea ceremony in my culture. Not only does it embody centuries of artistic refinement, but it also represents a philosophical approach to mindfulness. Unfortunately, the pervasive influence of Western fast-food culture threatens its continuation."
            },
            "part3": {
                "question": "In your opinion, is the influence of Western culture on the rest of the world a positive or negative development?",
                "band8_sample": "I'd argue it's a nuanced issue. On one hand, the proliferation of Western media has introduced concepts like individual rights to new audiences. On the other hand, it can lead to a displacement of local values. We shouldn't view it as a zero-sum game, but rather a complex synthesis of ideologies."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "The increasing presence of international brands and products in many countries is leading to the disappearance of local cultures. To what extent do you agree or disagree?",
            "band75_excerpt": "The omnipresence of multinational corporations is undeniably reshaping the global cultural landscape. While some assert that this leads to the extinction of local identity, I believe the reality is more a process of evolution than destruction.",
            "examiner_analysis": {
                "task_response": "Avoids a black-and-white stance, opting for nuanced position",
                "lexical_resource": "Uses 'omnipresence', 'standardised', 'subsidise', and 'cultural erosion'"
            }
        },
        "examiner_tips": [
            "Use negative inversion for rhetorical emphasis",
            "Balance global and local perspectives",
            "Avoid over-generalizing about cultural impacts"
        ]
    },
    # Module 5: Health and Public Policy
    {
        "id": "advanced-module-5",
        "module_number": 5,
        "title": "Health and Public Policy",
        "subtitle": "Ethics & Responsibility",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically analyze the tension between individual liberty and state intervention in public health",
            "Master the subjunctive mood to express urgency and recommendations",
            "Develop arguments regarding preventative medicine vs. curative care"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Preventative Medicine", "meaning": "Medical practices designed to prevent disease rather than treat it", "usage": "Noun phrase; subject or object", "example": "Investment in preventative medicine can significantly reduce the long-term fiscal burden on the state."},
                {"term": "Prohibitive Costs", "meaning": "Costs so high that they prevent people from doing or buying something", "usage": "Adjective + Noun; high-level alternative to 'expensive'", "example": "The prohibitive costs of private healthcare often marginalize lower-income demographics."},
                {"term": "Sedentary Lifestyle", "meaning": "A type of lifestyle involving little or no physical activity", "usage": "Noun phrase; common in health/work topics", "example": "Modern office environments often necessitate a sedentary lifestyle, leading to chronic health issues."},
                {"term": "Socio-economic Status", "meaning": "The social standing or class of an individual or group", "usage": "Noun phrase; formal context", "example": "Health outcomes are often inextricably linked to an individual's socio-economic status."}
            ]
        },
        "grammar": {
            "title": "Concessive Clauses and the Subjunctive",
            "explanation": "Use complex concessive structures and the subjunctive mood to show nuanced thinking.",
            "band_65_example": "Exercise is good, but people are busy.",
            "band_80_example": "Notwithstanding the undeniable benefits of regular physical activity, the modern workforce finds it increasingly difficult to integrate exercise into a rigorous schedule.",
            "subjunctive_example": "It is essential that the government prioritize public health campaigns over the construction of new hospital wings."
        },
        "reading": {
            "title": "The Paradigm Shift: From Treatment to Prevention",
            "word_count": 325,
            "text": "The global healthcare landscape is currently undergoing a fundamental transformation. For decades, the Western medical model has been primarily 'reactive'—focusing on the treatment of acute conditions after they manifest. However, as the global population ages and the prevalence of non-communicable diseases such as type 2 diabetes and cardiovascular disease skyrockets, this model is becoming fiscally unsustainable. The solution, many experts argue, lies in a 'proactive' approach: preventative medicine.",
            "questions": [
                {"type": "true_false_ng", "question": "The Western medical model has historically focused on preventing illnesses.", "answer": "False"},
                {"type": "true_false_ng", "question": "People with higher incomes generally have better health literacy.", "answer": "True"},
                {"type": "summary_completion", "question": "The author suggests that the current reactive medical model is becoming ______ due to an aging population.", "answer": "fiscally unsustainable"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a healthy habit you have recently started. Say what it is, how you started it, and how it has improved your life.",
                "model_answer": "I've recently incorporated daily meditation into my routine. It is essential that I maintain this practice to manage the stress inherent in modern life. The benefits have been profound—improved focus and emotional resilience."
            },
            "part3": {
                "question": "Should governments be responsible for the health of their citizens, or is it an individual responsibility?",
                "band8_sample": "I believe the onus is on the state to provide a conducive environment for health. While individual agency is vital, one cannot expect healthy choices from a population that is systemically disadvantaged. Therefore, the government should spearhead initiatives that make nutritious food more accessible and affordable."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that the best way to improve public health is to increase the price of unhealthy food and drinks. Others believe that education is the only effective solution. Discuss both views and give your opinion.",
            "band75_excerpt": "While fiscal measures provide a short-term deterrent, they do not address the root causes of poor health. Education, while slower to produce results, fosters a sustainable shift in public consciousness by empowering individuals with health literacy.",
            "examiner_analysis": {
                "task_response": "Addresses both 'taxation' and 'education' while providing clear preference",
                "lexical_resource": "Uses 'disincentives', 'deterrent', and 'health literacy'"
            }
        },
        "examiner_tips": [
            "Use subjunctive mood for recommendations",
            "Employ hedging language for academic caution",
            "Address systemic factors in health debates"
        ]
    },
    # Module 6: Crime, Justice, and the Penal System
    {
        "id": "advanced-module-6",
        "module_number": 6,
        "title": "Crime, Justice, and the Penal System",
        "subtitle": "From Punitive Measures to Rehabilitation",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the efficacy of deterrence versus rehabilitation",
            "Utilize reduced relative clauses to condense complex ideas",
            "Master advanced legal and sociological collocations for Band 7+"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Recidivism", "meaning": "The tendency of a convicted criminal to reoffend", "usage": "Noun; focus for 'effectiveness of prison' topics", "example": "High rates of recidivism suggest that purely punitive measures are failing to reform offenders."},
                {"term": "Deterrent", "meaning": "A thing that discourages someone from doing something", "usage": "Noun; used with 'effective' or 'strong'", "example": "Harsh sentencing acts as a deterrent only if the likelihood of apprehension is high."},
                {"term": "Restorative Justice", "meaning": "A system focusing on rehabilitation through reconciliation with victims", "usage": "Noun phrase; academic alternative", "example": "Restorative justice programs have shown promise in reducing long-term hostility between communities."},
                {"term": "Capital Punishment", "meaning": "The legally authorized killing of someone as punishment", "usage": "Noun phrase; specific to death penalty debates", "example": "The ethical implications of capital punishment remain a point of contention in international law."}
            ]
        },
        "grammar": {
            "title": "Reduced Relative Clauses",
            "explanation": "Condense complex ideas by removing 'who/which/that + be' from relative clauses.",
            "band_65_example": "Criminals who are released from prison often find it hard to get a job.",
            "band_80_example": "Offenders released from correctional facilities frequently encounter significant barriers to employment."
        },
        "reading": {
            "title": "The Evolution of the Penal System",
            "word_count": 325,
            "text": "The debate over the primary purpose of the penal system—whether it should be punitive or rehabilitative—has intensified in recent decades. Historically, the 'retributive justice' model predominated, operating on the principle of lex talionis (an eye for an eye). Proponents argue that the primary function of prison is to serve as a deterrent and provide a just desert for the transgression committed. However, a growing body of sociological evidence suggests that the 'tough on crime' approach may actually exacerbate the problem it seeks to solve.",
            "questions": [
                {"type": "identify_view", "question": "Does the author suggest the retributive model is the most modern approach?", "answer": "No; it is 'historical'"},
                {"type": "vocabulary_match", "question": "Which term in paragraph 1 means 'punishment that is deserved'?", "answer": "Just desert"},
                {"type": "true_false_ng", "question": "The 'school for crime' theory suggests prisons make people better citizens.", "answer": "False"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a law in your country that you think is very important. Say what the law is, how it works, and why it is necessary for society.",
                "model_answer": "I'd like to discuss anti-corruption legislation. This law serves as a powerful deterrent against the misuse of public funds. Without such legislation, the social contract between citizens and the state would be fundamentally undermined."
            },
            "part3": {
                "question": "Do you think that the media's portrayal of crime influences public fear?",
                "band8_sample": "Undoubtedly. The media tends to sensationalize violent crimes, which creates a distorted perception of reality. While actual crime rates may be declining, the constant influx of high-profile cases leads to heightened anxiety—a classic case of the 'availability heuristic.'"
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that the best way to reduce crime is to give longer prison sentences. Others believe there are better ways. Discuss both views and give your opinion.",
            "band75_excerpt": "The efficacy of lengthy custodial sentences as a means of crime reduction is a subject of intense debate. While proponents argue it serves as a powerful deterrent, I contend that such measures merely address the symptoms of criminality rather than its etiology.",
            "examiner_analysis": {
                "task_response": "Uses 'etiology' (cause) instead of 'reason'",
                "lexical_resource": "Uses 'Extended custodial sentences' instead of 'Long prison stays'"
            }
        },
        "examiner_tips": [
            "Use reduced relative clauses for conciseness",
            "Discuss crime as a sociological phenomenon",
            "Use precise legal collocations"
        ]
    },
    # Module 7: Media, Information Integrity, and the Digital Landscape
    {
        "id": "advanced-module-7",
        "module_number": 7,
        "title": "Media and Information Integrity",
        "subtitle": "Navigating the Post-Truth Era",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the shift from traditional journalism to citizen-led digital media",
            "Master Participle Clauses to create concise, sophisticated descriptions",
            "Develop a lexicon for discussing bias, algorithmic filters, and journalistic ethics"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Sensationalism", "meaning": "The use of exciting or shocking stories at the expense of accuracy", "usage": "Noun; usually used to criticize modern news", "example": "The rise of sensationalism in digital tabloids has led to a measurable decline in public trust."},
                {"term": "Echo Chamber", "meaning": "An environment where a person only encounters information that reinforces their own views", "usage": "Noun; vital for discussing social media algorithms", "example": "Social media algorithms often create an echo chamber, insulating users from diverse perspectives."},
                {"term": "To Disseminate", "meaning": "To spread information widely", "usage": "Verb; high-level alternative to 'share'", "example": "The internet allows individuals to disseminate news globally in seconds."},
                {"term": "Empirical Evidence", "meaning": "Information acquired by observation or experimentation", "usage": "Noun phrase; used when discussing validity", "example": "In a post-truth era, many narratives are constructed without the support of empirical evidence."}
            ]
        },
        "grammar": {
            "title": "Participle Clauses",
            "explanation": "Use participle clauses to provide extra information more concisely.",
            "band_65_example": "The news is controlled by large companies and this means they can influence what people think.",
            "band_80_example": "Being controlled by large conglomerates, modern media outlets possess the power to significantly influence public opinion."
        },
        "reading": {
            "title": "The Paradox of Choice and the Rise of Misinformation",
            "word_count": 330,
            "text": "The digital age has democratized the flow of information, effectively ending the era when a few elite news organizations acted as the sole 'gatekeepers' of truth. While this has empowered the individual, it has also birthed a 'paradox of choice.' When faced with an overwhelming volume of content, users often gravitate toward sources that confirm their pre-existing worldviews—a phenomenon known as confirmation bias. This shift has been accelerated by profit-driven tech giants, which utilize algorithms to maximize engagement.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe the 'gatekeeper' era was entirely negative?", "answer": "No; its end has created a 'paradox of choice'"},
                {"type": "vocabulary_match", "question": "Which term means 'choosing sources that support one's own views'?", "answer": "Confirmation bias"},
                {"type": "summary_completion", "question": "The author describes an informed citizenry as the ______ of a functional society.", "answer": "bedrock"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a news story that you found particularly interesting. Say what it was about, where you heard it, and why it caught your attention.",
                "model_answer": "I was captivated by a report on the impact of algorithmic bias in criminal sentencing. Being aware of the far-reaching implications of such technology, I found the story profoundly concerning."
            },
            "part3": {
                "question": "How has the way people consume news changed in the last decade?",
                "band8_sample": "In the past, news consumption was a communal, scheduled event. Today, it is fragmented and instantaneous. We are constantly bombarded with snippets of information via smartphones, which often leads to intellectual fatigue and superficial understanding."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Nowadays, more people get their news from social media rather than traditional newspapers or television. Do the advantages of this trend outweigh the disadvantages?",
            "band75_excerpt": "The transition from traditional broadcast media to social-media-driven news is a paradigm shift with significant societal consequences. While the democratization of information allows for a greater variety of voices, the disadvantages—particularly the erosion of journalistic integrity—far outweigh the benefits.",
            "examiner_analysis": {
                "task_response": "Clearly weights the disadvantages over advantages with specific thesis",
                "lexical_resource": "Uses 'paradigm shift', 'democratization', 'misinformation campaigns'"
            }
        },
        "examiner_tips": [
            "Use participle clauses for conciseness",
            "Discuss media using academic vocabulary",
            "Avoid clichés like 'every coin has two sides'"
        ]
    },
    # Module 8: Government, Economy, and Wealth Disparity
    {
        "id": "advanced-module-8",
        "module_number": 8,
        "title": "Government, Economy, and Wealth Disparity",
        "subtitle": "Navigating the Global Wealth Gap",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the role of fiscal policy in addressing socio-economic disparities",
            "Master the use of agentless passive voice for academic objectivity",
            "Develop a lexicon for discussing social mobility and redistribution"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Fiscal Policy", "meaning": "Government adjusted spending and tax rates to influence the economy", "usage": "Noun; focus for government-themed questions", "example": "Prudent fiscal policy is essential for stabilizing the economy during inflation."},
                {"term": "Social Mobility", "meaning": "The movement of individuals in social position over time", "usage": "Noun phrase; critical for education and wealth discussions", "example": "High wealth inequality often serves as a barrier to social mobility for youth."},
                {"term": "Progressive Taxation", "meaning": "A tax system where the rate increases as the taxable amount increases", "usage": "Noun phrase; common in 'rich vs. poor' debates", "example": "Proponents of progressive taxation argue it is the most effective tool for wealth redistribution."},
                {"term": "Economic Stagnation", "meaning": "A prolonged period of little or no growth in an economy", "usage": "Noun phrase; describes negative economic states", "example": "Persistent underinvestment in infrastructure often leads to long-term economic stagnation."}
            ]
        },
        "grammar": {
            "title": "Agentless Passive Voice",
            "explanation": "Use passive voice to shift focus from the 'doer' to the 'action' or 'result' for objectivity.",
            "band_65_example": "The government should tax the rich more to help the poor.",
            "band_80_example": "It is widely argued that wealth should be redistributed through more rigorous tax frameworks to support vulnerable demographics."
        },
        "reading": {
            "title": "The Great Divide: Global Wealth Inequality",
            "word_count": 335,
            "text": "In the contemporary global economy, the widening chasm between the ultra-wealthy and the impoverished has become a defining issue for policymakers. While global trade has lifted millions out of absolute poverty, the relative gap within nations continues to expand. This disparity is often attributed to 'capital deepening,' where the owners of technology and capital reap the rewards while wages for manual labor remain stagnant. Economists warn that extreme concentration of wealth can lead to social fragmentation.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe global trade has been entirely unsuccessful?", "answer": "No; it has 'lifted millions out of absolute poverty'"},
                {"type": "vocabulary_match", "question": "Which phrase refers to the gap between rich and poor?", "answer": "Widening chasm / Disparity"},
                {"type": "true_false_ng", "question": "Wealth has successfully 'trickled down' in most countries over the last 30 years.", "answer": "False"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a successful small business you know. Say what it is, how it started, and why you think it is successful.",
                "model_answer": "I know a local coffee shop that has thrived despite competition from large chains. Its success can be attributed to the owner's focus on community engagement and quality over profit maximization."
            },
            "part3": {
                "question": "To what extent should a government interfere in the free market to protect small businesses?",
                "band8_sample": "I believe a certain degree of interventionism is vital. Small businesses are the backbone of the economy, yet they are often crowded out by multinational corporations with economies of scale. Governments should level the playing field by offering tax breaks to local entrepreneurs."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many countries, the gap between the rich and the poor is widening. What problems does this cause, and what measures can be taken to address it?",
            "band75_excerpt": "The escalating disparity in wealth distribution is a pervasive issue. This trend frequently results in social stratification, where the marginalized feel disenfranchised from the political process. To mitigate this, governments must adopt multi-faceted strategies, such as increasing the minimum wage to a 'living wage.'",
            "examiner_analysis": {
                "task_response": "Identifies specific problems (disenfranchisement) and solutions (living wage)",
                "lexical_resource": "Uses 'The concentration of capital among the affluent continues unabated'"
            }
        },
        "examiner_tips": [
            "Use agentless passive for objectivity",
            "Explain why problems lead to consequences",
            "Use 'affluent/privileged' instead of repeating 'rich'"
        ]
    },
    # Module 9: Urbanisation and Modern Society
    {
        "id": "advanced-module-9",
        "module_number": 9,
        "title": "Urbanisation and Modern Society",
        "subtitle": "The Complexities of the Modern Megalopolis",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically analyze the socio-economic impacts of urban sprawl and gentrification",
            "Master nominalization to maintain high-level academic abstraction",
            "Develop a sophisticated lexicon to discuss 'Smart Cities' and infrastructure"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Urban Sprawl", "meaning": "The uncontrolled expansion of urban areas", "usage": "Noun phrase; subject or object", "example": "The rapid acceleration of urban sprawl has placed unprecedented strain on local ecosystems."},
                {"term": "Gentrification", "meaning": "The process of changing a neighborhood through influx of affluent residents", "usage": "Noun; focus for social equity and housing topics", "example": "Gentrification often acts as a catalyst for economic growth, yet frequently results in displacement of long-term residents."},
                {"term": "Conurbation", "meaning": "An extended urban area consisting of several towns merging", "usage": "Noun; sophisticated alternative to 'urban area'", "example": "The Tokyo-Yokohama conurbation represents the pinnacle of high-density metropolitan living."},
                {"term": "Ubiquitous", "meaning": "Present, appearing, or found everywhere", "usage": "Adjective; used for technology or trends", "example": "Digital surveillance has become ubiquitous in modern urban centers."}
            ]
        },
        "grammar": {
            "title": "Nominalization for Academic Precision",
            "explanation": "Turn verbs or adjectives into nouns to make arguments sound more objective.",
            "band_65_example": "When cities grow too fast, it causes many social problems.",
            "band_80_example": "The rapid expansion of urban centers often precipitates a multitude of socio-economic complications."
        },
        "reading": {
            "title": "The Vertical Frontier: The Rise of the Smart City",
            "word_count": 330,
            "text": "The 21st century is defined by the inexorable rise of the city. For the first time in human history, more people live in urban environments than in rural ones. This shift has necessitated a radical rethink of urban planning, leading to the emergence of the 'Smart City'—an urban area that uses sensors and data to manage resources efficiently. However, the implementation of such technology is not without its detractors. The 'ubiquity' of digital sensors has ignited debate over 'algorithmic governance.'",
            "questions": [
                {"type": "true_false_ng", "question": "The majority of the global population now lives in cities.", "answer": "True"},
                {"type": "true_false_ng", "question": "'Smart Cities' rely primarily on historical data rather than real-time sensors.", "answer": "False"},
                {"type": "sentence_completion", "question": "Smart Cities aim to ______ the management of resources.", "answer": "optimize"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a significant change that has occurred in your hometown or city. Say what the change was, why it happened, and how it has affected people.",
                "model_answer": "My city has undergone significant gentrification over the past decade. The densification of urban populations has led to both economic revitalization and the displacement of lower-income residents from traditionally affordable neighborhoods."
            },
            "part3": {
                "question": "In what ways do you think cities will change in the next fifty years?",
                "band8_sample": "I anticipate a move toward hyper-localization, where cities are designed as a series of '15-minute' hubs. This would effectively curb the necessity for long-distance commuting and alleviate the congestion that currently plagues our conurbations."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many parts of the world, people are moving from rural areas to cities. Does this trend have more advantages or disadvantages?",
            "band75_excerpt": "Cities act as engines of innovation and economic growth. The concentration of labor and capital in urban hubs allows for specialized industries to flourish. However, the rapid influx of populations often outpaces the development of essential infrastructure.",
            "examiner_analysis": {
                "task_response": "Clearly weights the disadvantages while acknowledging economic benefits",
                "lexical_resource": "Uses 'engines of innovation', 'informal settlements', 'socio-economic disparity'"
            }
        },
        "examiner_tips": [
            "Use nominalization for academic tone",
            "Distinguish between infrastructure (physical) and social fabric (human/community)",
            "Use precise terms: 'Urban' (adjective), 'Urbanisation' (process)"
        ]
    },
    # Module 10: Science and Biomedical Ethics
    {
        "id": "advanced-module-10",
        "module_number": 10,
        "title": "Science and Biomedical Ethics",
        "subtitle": "Balancing Innovation with Ethical Responsibility",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the implications of genetic engineering and biotechnology",
            "Master the use of advanced modal verbs and hedging for academic caution",
            "Develop a sophisticated lexicon for discussing scientific integrity and bioethics"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Genetic Engineering", "meaning": "The deliberate modification of an organism's genetic material", "usage": "Noun phrase; central to bioethics debates", "example": "The ethical implications of genetic engineering extend far beyond the laboratory."},
                {"term": "Paradigm Shift", "meaning": "A fundamental change in approach or underlying assumptions", "usage": "Noun; describes major scientific breakthroughs", "example": "The discovery of CRISPR technology represents a paradigm shift in modern medicine."},
                {"term": "Inherent Risks", "meaning": "Risks existing as a permanent, essential attribute", "usage": "Collocation; used when discussing new research", "example": "While the benefits of AI in healthcare are vast, the inherent risks to data privacy cannot be ignored."},
                {"term": "Ethical Dilemma", "meaning": "A situation requiring choice between equally undesirable alternatives", "usage": "Noun phrase; high-level alternative to 'problem'", "example": "The use of embryonic stem cells presents a profound ethical dilemma for researchers."}
            ]
        },
        "grammar": {
            "title": "Advanced Modals and Hedging",
            "explanation": "Use hedging to avoid overly certain statements and demonstrate academic maturity.",
            "band_65_example": "Science will solve all our problems in the future.",
            "band_80_example": "It is arguably the case that scientific innovation could potentially mitigate many of the challenges facing modern society, provided that ethical frameworks are strictly observed."
        },
        "reading": {
            "title": "The Architect of Life: Ethics in the CRISPR Era",
            "word_count": 320,
            "text": "The advent of CRISPR-Cas9 technology has ushered in a new era of genomic editing, offering the tantalizing prospect of eradicating hereditary diseases. Unlike previous methods, CRISPR allows scientists to 'cut and paste' DNA sequences with unprecedented accuracy. However, the ability to rewrite the 'blueprint of life' has ignited a firestorm of ethical debate. The primary concern is the potential for 'germline editing'—modifications passed down to future generations.",
            "questions": [
                {"type": "true_false_ng", "question": "CRISPR is described as being more affordable than earlier gene-editing techniques.", "answer": "True"},
                {"type": "true_false_ng", "question": "Germline editing only affects the individual receiving the treatment.", "answer": "False"},
                {"type": "summary_completion", "question": "Critics fear that genetic enhancement could create a ______.", "answer": "genetic aristocracy"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe an area of science that you find particularly interesting. Say what it is, how you learned about it, and why you think it is important for the future.",
                "model_answer": "I'm fascinated by the field of regenerative medicine. It could potentially revolutionize how we treat degenerative diseases. However, I believe stringent ethical oversight is essential to prevent misuse."
            },
            "part3": {
                "question": "To what extent should governments control scientific research?",
                "band8_sample": "I'm of the opinion that a delicate equilibrium must be maintained. While unfettered research is often the cradle of innovation, the state has a moral obligation to ensure that progress does not compromise ethical standards. In fields like cloning or AI, stringent oversight is essential."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that scientific research should be carried out and controlled by the government rather than private companies. To what extent do you agree or disagree?",
            "band75_excerpt": "While private enterprise is often credited with the rapid commercialization of technology, I would argue that state-led research is fundamentally more aligned with the public interest. Private corporations are predominantly beholden to shareholders, which can lead to a prioritization of profit over long-term societal benefits.",
            "examiner_analysis": {
                "task_response": "Presents nuanced argument for government control while acknowledging private enterprise",
                "lexical_resource": "Uses 'steward', 'private enterprise', 'beholden', 'blue-sky research'"
            }
        },
        "examiner_tips": [
            "Use hedging for academic caution",
            "Maintain academic neutrality on controversial topics",
            "Use precise collocations: 'conduct research', 'publish findings'"
        ]
    },
    # Modules 11-20 (abbreviated structure for remaining modules)
    {
        "id": "advanced-module-11",
        "module_number": 11,
        "title": "Public Transport and Sustainable Infrastructure",
        "subtitle": "Mobility, Sustainability, and Public Transit",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the relationship between mass transit systems and urban sustainability",
            "Master the use of Cleft Sentences for focus and emphasis",
            "Develop a sophisticated lexicon for fiscal allocation and modal shifts"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Modal Shift", "meaning": "A change from one mode of transport to another", "usage": "Noun; focus for sustainability topics", "example": "Achieving a modal shift requires significant investment in rail network reliability."},
                {"term": "Fiscal Burden", "meaning": "The financial weight or pressure on a government", "usage": "Noun phrase; formal economic context", "example": "The maintenance of aging underground networks places a heavy fiscal burden on municipal budgets."},
                {"term": "Intermodal Connectivity", "meaning": "The seamless integration of different transport modes", "usage": "Noun phrase; academic/technical", "example": "Enhanced intermodal connectivity is the cornerstone of a functional smart city."},
                {"term": "Commuter Belt", "meaning": "An area surrounding a city where people live and travel to work", "usage": "Noun phrase; common in urbanization topics", "example": "Property prices in the commuter belt have skyrocketed due to improved high-speed rail links."}
            ]
        },
        "grammar": {
            "title": "Cleft Sentences for Emphasis",
            "explanation": "Use cleft sentences to emphasize specific parts of a sentence.",
            "band_65_example": "The government needs to invest in trains to stop pollution.",
            "band_80_example": "It is investment in rail infrastructure that will ultimately facilitate a significant reduction in urban carbon emissions."
        },
        "reading": {
            "title": "The Transit Revolution: Beyond the Private Automobile",
            "word_count": 340,
            "text": "In the mid-20th century, the 'car was king,' and urban planning prioritized expansive highway networks. However, as the 21st century progresses, traffic congestion and the climate crisis have forced a radical rethink. Modern urban planners now advocate for 'Transit-Oriented Development' (TOD)—a strategy focusing on high-density, mixed-use housing built around major transit hubs.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe 20th-century planning was good for the environment?", "answer": "No; it prioritized highways"},
                {"type": "vocabulary_match", "question": "Which term refers to development focused around transit stations?", "answer": "Transit-Oriented Development / TOD"},
                {"type": "sentence_completion", "question": "High-speed rail links have caused prices in the ______ to rise.", "answer": "commuter belt"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "To what extent should governments discourage the use of private cars in city centers?",
                "band8_sample": "I believe it is imperative that governments take a proactive stance. We need a combination of 'push and pull' factors: taxing congestion while simultaneously subsidising high-quality, high-frequency transit."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that public transport should be free of charge for all citizens. Others argue that this would lead to lack of funding and poor quality services. Discuss both views and give your opinion.",
            "band75_excerpt": "The proposal to eliminate fares for public transit is polarizing. While the laudable aim is to reduce pollution, the erasure of ticket revenue may inadvertently lead to deterioration of service quality.",
            "examiner_analysis": {
                "task_response": "Offers a nuanced 'third way' (targeted subsidies)",
                "lexical_resource": "Uses 'abolition of fare-based systems', 'incentivize transit usage'"
            }
        },
        "examiner_tips": [
            "Use cleft sentences for emphasis",
            "Discuss 'urban congestion' or 'gridlock' instead of just 'traffic'",
            "Acknowledge fiscal realities in policy discussions"
        ]
    },
    {
        "id": "advanced-module-12",
        "module_number": 12,
        "title": "Work, Employment, and the Evolving Labor Market",
        "subtitle": "Precarious Employment, Automation, and the Gig Economy",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the shift from lifelong employment to the gig economy",
            "Master mixed conditionals to discuss hypothetical socio-economic impacts",
            "Utilize advanced professional collocations for Band 8.0+"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Precarious Labor", "meaning": "Employment characterized by a lack of security and limited benefits", "usage": "Noun phrase; subject or object in economy essays", "example": "The rise of the gig economy has led to a significant increase in precarious labor among the youth."},
                {"term": "Gig Economy", "meaning": "A labor market characterized by short-term contracts or freelance work", "usage": "Noun; focus for work/tech topics", "example": "While the gig economy offers flexibility, it often lacks the safety nets of traditional employment."},
                {"term": "Meritocracy", "meaning": "A system where advancement is based on individual ability", "usage": "Noun; academic context", "example": "Critics argue that a pure meritocracy is difficult to achieve without equal access to education."},
                {"term": "Work-Life Synthesis", "meaning": "A more holistic approach than 'balance,' where work and life are integrated", "usage": "Noun phrase; sophisticated alternative", "example": "Remote work has forced many professionals to seek a better work-life synthesis."}
            ]
        },
        "grammar": {
            "title": "Mixed Conditionals & Hypothetical Structures",
            "explanation": "Link past actions to present results using mixed conditionals.",
            "band_65_example": "If companies use more robots, people will lose jobs.",
            "band_80_example": "If governments had invested in vocational re-skilling a decade ago, the current workforce would not be struggling with the rapid onset of automation."
        },
        "reading": {
            "title": "The Erosion of the 9-to-5: A New Industrial Revolution",
            "word_count": 345,
            "text": "For much of the 20th century, the 'standard employment relationship' was the cornerstone of the middle class. However, the 21st century has seen this social contract unravel. The catalyst is two-fold: the digital revolution and the rise of neoliberal economic policies that prioritize 'labor flexibility.'",
            "questions": [
                {"type": "true_false_ng", "question": "The 20th-century social contract was based on mutual loyalty between worker and employer.", "answer": "True"},
                {"type": "true_false_ng", "question": "Gig workers usually receive the same benefits as full-time staff.", "answer": "False"},
                {"type": "multiple_choice", "question": "What is the 'precariat'?", "options": ["A new political party", "A class of workers with no job security", "A type of contract"], "answer": "A class of workers with no job security"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Do you think the concept of a 'job for life' is still relevant in today's world?",
                "band8_sample": "I'd say the 'job for life' is essentially a relic of the past. In the current volatile economic climate, adaptability is far more valuable than tenure. Most professionals now expect to pivot between industries several times."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In the modern world, many people prefer to change jobs frequently rather than staying with one employer for a long time. Does this trend have more advantages or disadvantages?",
            "band75_excerpt": "The contemporary labor market has shifted away from the long-term tenure that defined previous generations. While some view this professional fluidity as instability, I contend that the advantages—namely skill diversification and market resilience—far outweigh the drawbacks.",
            "examiner_analysis": {
                "task_response": "Clearly weights advantages of flexibility in modern context",
                "lexical_resource": "Uses 'Embracing professional fluidity' instead of 'Changing jobs often'"
            }
        },
        "examiner_tips": [
            "Use mixed conditionals for sophisticated hypotheticals",
            "Discuss pensions, mental health, and social status when discussing work",
            "Use nominalization for authoritative tone"
        ]
    },
    {
        "id": "advanced-module-13",
        "module_number": 13,
        "title": "Social Issues: Demographics and Generational Equity",
        "subtitle": "Navigating the Socio-Economic Implications of an Aging Population",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the challenges of the 'Silver Tsunami' and shifting dependency ratio",
            "Master Negative Inversion for rhetorical weight and sophistication",
            "Utilize advanced sociological collocations for Band 7+ Lexical Resource"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Dependency Ratio", "meaning": "The ratio of those not in the labor force to those in the labor force", "usage": "Noun; vital for economic/social impact analysis", "example": "A burgeoning dependency ratio threatens the long-term viability of the national pension scheme."},
                {"term": "Intergenerational Solidarity", "meaning": "Social cohesion and cooperation between different age groups", "usage": "Noun phrase; high-level alternative", "example": "Maintaining intergenerational solidarity is crucial as competition for public resources intensifies."},
                {"term": "Silver Tsunami", "meaning": "A metaphor for a large increase in the number of elderly people", "usage": "Idiomatic (IELTS-safe)", "example": "Governments must prepare for the impending Silver Tsunami by restructuring healthcare services."},
                {"term": "Socio-economic Stratification", "meaning": "The hierarchical arrangement of individuals into social classes", "usage": "Noun phrase; formal sociological context", "example": "The lack of elderly care often exacerbates existing socio-economic stratification within the community."}
            ]
        },
        "grammar": {
            "title": "Negative Inversion",
            "explanation": "Use negative inversion to highlight key points with rhetorical emphasis.",
            "band_65_example": "The government shouldn't just ignore the elderly, and they should also build more hospitals.",
            "band_80_example": "Not only must the state increase its fiscal allocation for elderly care, but it should also reform the statutory retirement age to reflect increasing life expectancy."
        },
        "reading": {
            "title": "The Aging Paradox: Burden or Boon?",
            "word_count": 325,
            "text": "The 21st century is witnessing a demographic shift unparalleled in human history. As birth rates plummet and medical advancements extend life expectancy, many nations are transitioning into 'super-aged' societies. While some economists view this as a testament to human progress, others warn of a looming 'Grey Dawn.'",
            "questions": [
                {"type": "true_false_ng", "question": "Medical progress has contributed to the current demographic trend.", "answer": "True"},
                {"type": "true_false_ng", "question": "The 'Grey Dawn' refers to a rise in global birth rates.", "answer": "False"},
                {"type": "vocabulary_match", "question": "Which term describes the ratio of workers to non-workers?", "answer": "Dependency ratio"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "To what extent should children be responsible for looking after their elderly parents?",
                "band8_sample": "I believe it's a complex ethical quandary. In many cultures, filial piety is the cornerstone of the family unit. However, in a modern, mobile society, this can place an insurmountable strain on the 'sandwich generation'—those raising children while simultaneously caring for aging parents."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many countries, the proportion of older people is increasing. Does this trend have more advantages or disadvantages for society?",
            "band75_excerpt": "The global demographic shift toward an aging population is a multifaceted phenomenon. While many fear the economic repercussions of a shrinking workforce, I believe that if societies adapt their socio-economic frameworks, the wisdom and stability provided by an older demographic can offer significant advantages.",
            "examiner_analysis": {
                "task_response": "Addresses 'advantages vs. disadvantages' with a nuanced, balanced thesis",
                "lexical_resource": "Uses 'multifaceted', 'contingent upon', 'intergenerational equity'"
            }
        },
        "examiner_tips": [
            "Use negative inversion for rhetorical emphasis",
            "Use 'geriatric care' instead of 'help for old people'",
            "Show how cost of healthcare can be offset by 'Silver Economy'"
        ]
    },
    {
        "id": "advanced-module-14",
        "module_number": 14,
        "title": "Education and Pedagogical Philosophy",
        "subtitle": "From Rote Memorisation to Competency-Based Pedagogy",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the efficacy of traditional vs. progressive educational models",
            "Master Parallelism and Clausal Subjects for academic weight",
            "Critically evaluate the commodification of higher education"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Pedagogical", "meaning": "Relating to the methods and principles of teaching", "usage": "Adjective; used when discussing teaching styles", "example": "Modern pedagogical theories emphasize student-centered learning over traditional lectures."},
                {"term": "To Assimilate", "meaning": "To take in and fully understand information or ideas", "usage": "Verb; high-level alternative to 'learn'", "example": "Students must be given time to assimilate complex concepts before moving on."},
                {"term": "Egalitarian", "meaning": "Believing that all people are equal and deserve equal opportunities", "usage": "Adjective; used in debates about educational access", "example": "A truly egalitarian education system provides the same quality of resources to every child."},
                {"term": "Cognitive Development", "meaning": "The construction of thought processes including remembering and problem-solving", "usage": "Noun phrase; academic alternative to 'mental growth'", "example": "Play-based learning is essential for the cognitive development of early-years learners."}
            ]
        },
        "grammar": {
            "title": "Clausal Subjects and Parallelism",
            "explanation": "Use a clause as the subject for immediate sophistication.",
            "band_65_example": "It is important that students learn how to solve problems.",
            "band_80_example": "That students are equipped with problem-solving skills is far more critical than their ability to memorize facts.",
            "parallelism_example": "The current education system must focus on fostering creativity, encouraging critical thinking, and promoting digital literacy."
        },
        "reading": {
            "title": "The Flipped Classroom: A Paradigm Shift in Education",
            "word_count": 335,
            "text": "The traditional model of education, characterized by a teacher delivering a lecture to a passive audience, is increasingly viewed as an artifact of the industrial age. In its place, many institutions are adopting the 'flipped classroom' model, where students absorb content independently at home while class time is dedicated to active problem-solving.",
            "questions": [
                {"type": "true_false_ng", "question": "The traditional education model was designed for the industrial age.", "answer": "True"},
                {"type": "true_false_ng", "question": "In a flipped classroom, students listen to lectures in school.", "answer": "False"},
                {"type": "sentence_completion", "question": "The flipped classroom model is said to increase student ______.", "answer": "autonomy"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Do you think that the traditional classroom will eventually be replaced by online learning?",
                "band8_sample": "I suspect we are heading toward a blended model rather than a total replacement. While online platforms offer unparalleled accessibility, they cannot replicate the socio-emotional development that occurs during face-to-face interaction."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that university students should be allowed to study whatever they like. Others think they should only study subjects useful for the future. Discuss both views.",
            "band75_excerpt": "Some argue that universities should be bastions of intellectual freedom, where the pursuit of knowledge is an end in itself. However, I believe that in an increasingly competitive global economy, a more pragmatic approach is necessary.",
            "examiner_analysis": {
                "task_response": "Addresses both 'intellectual freedom' and 'utilitarian' perspectives",
                "lexical_resource": "Uses 'bastions of intellectual freedom', 'contentious', 'STEM subjects'"
            }
        },
        "examiner_tips": [
            "Use 'pedagogical' instead of 'teaching' for academic tone",
            "Use clausal subjects for sophistication",
            "Challenge the premises of questions at Band 8.0"
        ]
    },
    {
        "id": "advanced-module-15",
        "module_number": 15,
        "title": "Globalisation, Cultural Identity, and Homogenisation",
        "subtitle": "Cultural Convergence versus Preservation of Heritage",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the impact of global economic integration on local traditions",
            "Master inverted conditionals (Should, Had, Were) for sophisticated hypothetical arguments",
            "Develop a lexicon for discussing cultural hegemony and linguistic diversity"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Hegemony", "meaning": "Leadership or dominance by one country or social group over others", "usage": "Noun; used in political/cultural contexts", "example": "The cultural hegemony of Western media has a profound influence on global consumer habits."},
                {"term": "To Assimilate (cultural)", "meaning": "To become part of a wider society while losing one's own cultural identity", "usage": "Verb; high-level", "example": "Migrant communities often strive to assimilate while maintaining their ancestral traditions."},
                {"term": "Standardisation", "meaning": "The process of making things all have the same features", "usage": "Noun; used when discussing products or lifestyles", "example": "The standardisation of urban architecture makes many international cities appear virtually identical."},
                {"term": "Indigenous", "meaning": "Originating naturally in a particular place; native", "usage": "Adjective; used for people, languages, or plants", "example": "Globalisation poses a significant threat to the survival of indigenous languages."}
            ]
        },
        "grammar": {
            "title": "Inverted Conditionals",
            "explanation": "Use formal conditional structures that eliminate the word 'if' for sophistication.",
            "band_65_example": "If the government doesn't protect local traditions, they will disappear.",
            "band_80_example": "Should the state fail to implement protective cultural policies, indigenous traditions will inevitably succumb to the pressures of global standardisation.",
            "past_hypothetical": "Had international bodies intervened earlier, many endangered languages might have been saved from extinction."
        },
        "reading": {
            "title": "The Paradox of the Global Village (Advanced)",
            "word_count": 340,
            "text": "The term 'Global Village' suggests a world where distances are shrunk and cultures are shared. However, this interconnectedness is a double-edged sword. While it facilitates the exchange of ideas, it also acts as a conduit for 'cultural imperialism,' where the values of dominant economic powers overshadow local customs.",
            "questions": [
                {"type": "identify_term", "question": "Who coined the phrase 'Global Village'?", "answer": "Marshall McLuhan"},
                {"type": "true_false_ng", "question": "Interconnectedness has only positive effects.", "answer": "False"},
                {"type": "summary_completion", "question": "Globalisation is often described as a ______, bringing both benefits and risks.", "answer": "double-edged sword"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Do you think that the world will eventually have one single culture?",
                "band8_sample": "I suspect we are moving toward a hybridized global culture rather than a completely uniform one. While the standardisation of technology is ubiquitous, human beings have an inherent drive to differentiate themselves. We might watch the same blockbusters, but we interpret them through the lens of our own local heritage."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that the fact that the world is becoming more uniform is a positive development. Others believe it destroys cultural identity. Discuss both views.",
            "band75_excerpt": "The debate over the convergence of global cultures is highly contentious. Proponents of a more uniform world argue it facilitates international cooperation. However, I am of the conviction that the erosion of cultural distinctiveness is a profound loss for humanity.",
            "examiner_analysis": {
                "task_response": "Addresses both 'cooperation' and 'loss of identity' perspectives with clear stance",
                "lexical_resource": "Uses 'The inexorable march toward global uniformity'"
            }
        },
        "examiner_tips": [
            "Use inverted conditionals for formal tone",
            "Argue for a 'middle ground' like 'Glocalisation'",
            "Use precision with abstract nouns: 'proliferation', 'integration', 'dilution'"
        ]
    },
    {
        "id": "advanced-module-16",
        "module_number": 16,
        "title": "The Environment: Ecological Integrity and Sustainable Mitigation",
        "subtitle": "Environmental Stewardship in the Anthropocene",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate 'The Tragedy of the Commons' in relation to global resource management",
            "Master the use of Complex Prepositional Phrases to link causes and effects",
            "Utilize advanced environmental collocations for Band 8.0+"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Anthropogenic", "meaning": "Originating in human activity (chiefly of environmental pollution)", "usage": "Adjective; replaces 'human-made'", "example": "The current rate of species extinction is largely driven by anthropogenic climate change."},
                {"term": "Biodiversity Loss", "meaning": "The decline in the number and variety of species in a given area", "usage": "Noun phrase; more academic than 'animals dying'", "example": "The biodiversity loss in the Amazon has reached a critical tipping point."},
                {"term": "Ecosystem Services", "meaning": "The benefits to humans provided by the natural environment", "usage": "Noun phrase; used to argue for economic value of nature", "example": "Forests provide essential ecosystem services, such as water purification and carbon sequestration."},
                {"term": "Sustainability", "meaning": "The ability to be maintained at a certain rate without depleting resources", "usage": "Noun; core topic term", "example": "Corporate sustainability initiatives must move beyond simple 'greenwashing' to effect real change."}
            ]
        },
        "grammar": {
            "title": "Complex Prepositional Phrases",
            "explanation": "Link ideas through prepositions rather than basic conjunctions.",
            "band_65_example": "The environment is dying because companies want to make money.",
            "band_80_example": "In light of the relentless pursuit of profit, many corporations have historically prioritized short-term gains at the expense of ecological integrity.",
            "key_phrases": ["With a view to", "By virtue of", "In accordance with", "In the face of"]
        },
        "reading": {
            "title": "The Sixth Mass Extinction and the Tragedy of the Commons",
            "word_count": 335,
            "text": "The 'Tragedy of the Commons' is a central concept in environmental economics, describing a situation where individuals deplete a shared resource by acting in their own self-interest. In the 21st century, the 'commons' is the global atmosphere and the vast biodiversity of our oceans. As nations compete for industrial dominance, anthropogenic emissions continue unabated.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe the 'Tragedy of the Commons' is caused by irrational behavior?", "answer": "No; it is 'rational' self-interest"},
                {"type": "vocabulary_match", "question": "Which term refers to human-caused emissions?", "answer": "Anthropogenic"},
                {"type": "summary_completion", "question": "The 'Circular Economy' aims to stop ______ by reusing resources.", "answer": "waste"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Who do you think is more responsible for protecting the environment: individuals or the government?",
                "band8_sample": "I'm of the conviction that while individual actions are laudable, the onus of responsibility lies primarily with the state. Without stringent regulatory frameworks, corporations will continue to externalize their environmental costs."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that only governments can make significant changes to protect the environment. Others believe that individuals can have a great impact. Discuss both views.",
            "band75_excerpt": "While I acknowledge that widespread shifts in consumer behavior can influence market trends, I contend that meaningful ecological preservation is impossible without robust governmental intervention. Individual choices are often constrained by socio-economic factors.",
            "examiner_analysis": {
                "task_response": "Addresses limitations of both individual and state power",
                "lexical_resource": "Uses 'stewardship', 'efficacy', 'socio-economic factors', 'legislative power'"
            }
        },
        "examiner_tips": [
            "Use complex prepositional phrases for academic linking",
            "Avoid emotional language: use 'catastrophic depletion of natural capital' instead of 'sad that trees are dying'",
            "Link environment to globalization or economy for depth"
        ]
    },
    {
        "id": "advanced-module-17",
        "module_number": 17,
        "title": "Crime, Justice, and Social Reintegration",
        "subtitle": "Addressing the Roots of Recidivism",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the efficacy of custodial sentences versus rehabilitative programmes",
            "Master the Subjunctive Mood to express necessity and urgency",
            "Develop a lexicon for discussing deterrents and judicial equity"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "To Rehabilitate", "meaning": "To restore someone to normal life through training and therapy", "usage": "Verb; the opposite of 'punish'", "example": "It is far more cost-effective to rehabilitate non-violent offenders than to keep them incarcerated."},
                {"term": "Custodial Sentence", "meaning": "A mandatory period of time in a prison or other closed institution", "usage": "Noun phrase; formal alternative to 'prison time'", "example": "Judges are increasingly opting for community service over custodial sentences for minor infractions."},
                {"term": "To Mitigate (crime context)", "meaning": "To make something less severe, serious, or painful", "usage": "Verb; high-level alternative to 'reduce'", "example": "Improved socio-economic conditions can help mitigate the factors that lead to juvenile delinquency."}
            ]
        },
        "grammar": {
            "title": "The Subjunctive Mood",
            "explanation": "Use the subjunctive to convey a strong sense of recommendation or necessity.",
            "band_65_example": "The government must make sure that prisons are clean.",
            "band_80_example": "It is imperative that the government ensure that correctional facilities prioritise rehabilitation over mere retribution."
        },
        "reading": {
            "title": "The Prison Paradox",
            "word_count": 335,
            "text": "The debate over the primary purpose of the penal system—whether it should be retributive or rehabilitative—has intensified as global incarceration rates climb. Traditional 'tough-on-crime' policies argue that fear of custodial sentences acts as a powerful deterrent. However, empirical evidence suggests this approach may be counterproductive regarding recidivism.",
            "questions": [
                {"type": "true_false_ng", "question": "Retributive justice suggests that punishment should match the crime.", "answer": "True"},
                {"type": "vocabulary_match", "question": "Which term describes the cycle of going in and out of prison?", "answer": "Revolving door"},
                {"type": "sentence_completion", "question": "The state should address poverty to reduce the ______ on the penal system.", "answer": "fiscal burden"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "To what extent can education prevent people from committing crimes?",
                "band8_sample": "I would argue that education is the primary bulwark against criminal activity. It's not just about academic knowledge; it's about socialisation and the acquisition of critical thinking skills. When individuals are equipped with marketable skills, they are far less likely to resort to illicit means of survival."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that prison is the best way to punish criminals. Others argue that other forms of punishment, such as community service, are more effective. Discuss both views.",
            "band75_excerpt": "While many maintain that incarceration is the only way to ensure public safety, I contend that for non-violent offences, community-based sanctions are far more effective. It is vital that the judicial system distinguish between those who pose a physical threat and those who have simply erred in judgement.",
            "examiner_analysis": {
                "task_response": "Uses the Subjunctive: 'It is vital that the judicial system distinguish...'",
                "lexical_resource": "Uses 'scrutiny', 'just retribution', 'erred in judgement'"
            }
        },
        "examiner_tips": [
            "Use subjunctive mood for recommendations",
            "Avoid emotional appeals: use 'profound deleterious effects' instead of 'Crime is very sad'",
            "Use conditionals to discuss deterrent effects"
        ]
    },
    {
        "id": "advanced-module-18",
        "module_number": 18,
        "title": "Public Health and Medical Resource Allocation",
        "subtitle": "The Wellness Gap: Health Equity and State Responsibility",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the conflict between individual lifestyle choices and state-funded healthcare",
            "Master Advanced Concessive Clauses (Notwithstanding, Much as)",
            "Develop a lexicon for discussing universal healthcare and lifestyle-related diseases"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Universal Healthcare", "meaning": "A system that provides quality health services to all citizens regardless of ability to pay", "usage": "Noun phrase; core topic", "example": "The implementation of universal healthcare is often seen as a hallmark of a developed nation."},
                {"term": "Pathogen", "meaning": "A bacterium, virus, or other microorganism that can cause disease", "usage": "Noun; academic alternative to 'germ'", "example": "Rapid urbanization has made it easier for pathogens to spread across borders."},
                {"term": "Socio-economic Gradient", "meaning": "The relationship between social status and health outcomes", "usage": "Noun phrase; high-level sociological term", "example": "The socio-economic gradient in health remains one of the most persistent challenges for policymakers."},
                {"term": "Obesogenic", "meaning": "An environment that encourages weight gain", "usage": "Adjective; modern public health term", "example": "Proponents argue that the modern food environment is 'obesogenic', designed to encourage weight gain."}
            ]
        },
        "grammar": {
            "title": "Advanced Concessive Clauses",
            "explanation": "Acknowledge opposing views within your own sentence using sophisticated linkers.",
            "band_65_example": "Although smoking is bad, people should be allowed to choose to do it.",
            "band_80_example": "Notwithstanding the undeniable risks to public health, some argue that the state should not infringe upon an individual's right to make personal lifestyle choices.",
            "alternative": "Much as universal healthcare is desirable, the fiscal reality often makes its implementation difficult for developing nations."
        },
        "reading": {
            "title": "The Burden of Choice: Health in the Modern Era",
            "word_count": 340,
            "text": "The landscape of global health has undergone a fundamental transformation. In the past, the primary threats were infectious diseases caused by pathogens; today, the burden has shifted toward non-communicable diseases (NCDs) such as type 2 diabetes and cardiovascular disease. These 'lifestyle diseases' are often the result of sedentary habits, poor diet, and tobacco use.",
            "questions": [
                {"type": "identify_term", "question": "What acronym is used for diseases like diabetes and heart disease?", "answer": "NCDs"},
                {"type": "vocabulary_match", "question": "Which word describes an environment that encourages weight gain?", "answer": "Obesogenic"},
                {"type": "sentence_completion", "question": "Governments should focus on ______ rather than just treating symptoms.", "answer": "preventative medicine"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Should people who lead unhealthy lifestyles pay more for healthcare?",
                "band8_sample": "Much as I understand the argument for fiscal fairness, I find the idea highly problematic. It ignores the systemic factors at play. Someone living in a food desert might not have the luxury of choosing organic produce. Punishing them financially would only exacerbate the wealth gap."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people think that governments should be responsible for the health of their citizens. Others believe that it is the responsibility of individuals to lead a healthy life. Discuss both views.",
            "band75_excerpt": "While it is undeniably true that individual choices regarding diet and exercise are pivotal, I believe the state must play a supervisory and supportive role. Notwithstanding the importance of personal autonomy, the government possesses the tools to regulate the food industry.",
            "examiner_analysis": {
                "task_response": "Explains importance of both individual and state action",
                "lexical_resource": "Uses 'allocation', 'pivotal', 'supervisory', 'socio-economic barriers'"
            }
        },
        "examiner_tips": [
            "Use hedges: 'a significant contributing factor' instead of 'causes'",
            "Use 'wholesome', 'nutritious', 'salubrious' instead of repeating 'healthy'",
            "Connect health topics to modules on economy and demographics"
        ]
    },
    {
        "id": "advanced-module-19",
        "module_number": 19,
        "title": "The Media Landscape: Journalism, Social Media, and the Public Interest",
        "subtitle": "Information Dissemination in the Digital Age",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the shift from traditional journalism to user-generated content",
            "Master Fronting for Emphasis to vary sentence structure",
            "Develop a lexicon for discussing misinformation, media literacy, and agenda-setting"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Dissemination", "meaning": "The act of spreading something, especially information, widely", "usage": "Noun; academic alternative to 'sharing'", "example": "The rapid dissemination of unverified reports can cause widespread public alarm."},
                {"term": "Agenda-setting", "meaning": "The ability of the media to influence the importance placed on topics", "usage": "Noun/Verb; sociological term", "example": "By focusing on specific scandals, the media performs an agenda-setting role that distracts from policy issues."},
                {"term": "Media Literacy", "meaning": "The ability to access, analyze, evaluate, and create media", "usage": "Noun phrase; the 'solution' in many essays", "example": "Improving media literacy is the most effective defense against the spread of fake news."}
            ]
        },
        "grammar": {
            "title": "Fronting for Emphasis",
            "explanation": "Move a key element to the beginning of the sentence for rhetorical effect.",
            "band_65_example": "Fake news is more dangerous than ever before.",
            "band_80_example": "Never before has the threat of misinformation been so pervasive in our democratic processes.",
            "application": "Only by implementing strict regulations can platforms be held accountable."
        },
        "reading": {
            "title": "The Algorithmic Editor: News in the 21st Century",
            "word_count": 338,
            "text": "The transition from print to digital media has fundamentally altered how society consumes information. Traditionally, 'gatekeepers'—professional editors and journalists—vetted information for accuracy before dissemination. Today, this role has been largely supplanted by algorithms designed to maximize 'engagement.'",
            "questions": [
                {"type": "true_false_ng", "question": "Algorithms are primarily designed to ensure information is accurate.", "answer": "False"},
                {"type": "vocabulary_match", "question": "Which term in the text means 'to verify or check'?", "answer": "Vetted"},
                {"type": "sentence_completion", "question": "Citizens must improve their ______ to avoid being manipulated.", "answer": "media literacy"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "To what extent can we trust the news we see on social media?",
                "band8_sample": "I believe we should approach social media news with a healthy degree of skepticism. While it allows for real-time updates, the lack of editorial oversight means that sensationalism often trumps factual accuracy. We must be discerning consumers and cross-reference information with reputable sources."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many countries, social media is replacing traditional newspapers and television as the main source of news. Do you think this is a positive or negative development?",
            "band75_excerpt": "The shift toward social media as the primary vehicle for news consumption is a transformative trend. While it offers unprecedented accessibility, I would argue that it is a predominantly negative development due to the erosion of journalistic integrity.",
            "examiner_analysis": {
                "task_response": "Clearly weights disadvantages with specific thesis",
                "lexical_resource": "Uses 'instantaneous dissemination of information'"
            }
        },
        "examiner_tips": [
            "Use fronting for rhetorical emphasis",
            "Avoid over-generalization: use 'The unregulated nature of certain platforms'",
            "Use 'editorial oversight' instead of 'checking the news'"
        ]
    },
    {
        "id": "advanced-module-20",
        "module_number": 20,
        "title": "Tourism, Cultural Heritage, and Global Mobility",
        "subtitle": "Tourism and Global Mobility: Preservation vs. Profit",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the socio-economic impacts of mass tourism and commodification",
            "Master Participle Clauses for concise, academic sentence variety",
            "Develop a lexicon for discussing ecotourism, cultural authenticity, and environmental footprints"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Commodification", "meaning": "The action of treating something as a mere product for sale", "usage": "Noun; focus for culture/tourism", "example": "The commodification of traditional ceremonies often strips them of their spiritual significance."},
                {"term": "Overtourism", "meaning": "A condition where there are too many visitors to a particular destination", "usage": "Noun; modern environmental/social topic", "example": "Cities like Venice are struggling with overtourism, which threatens the quality of life for locals."},
                {"term": "Authenticity", "meaning": "The quality of being genuine", "usage": "Noun; used in 'culture' debates", "example": "Travelers today are increasingly seeking authenticity rather than staged tourist experiences."},
                {"term": "Ecotourism", "meaning": "Tourism directed towards exotic, often threatened, natural environments to support conservation", "usage": "Noun; the 'green' solution", "example": "Sustainable ecotourism provides a financial incentive for local communities to protect their wildlife."}
            ]
        },
        "grammar": {
            "title": "Participle Clauses",
            "explanation": "Use participle clauses (-ing or -ed) to provide extra information more concisely.",
            "band_65_example": "Many people visit historical sites and they take photos but they don't learn the history.",
            "band_80_example": "Attracted by the allure of historical sites, many tourists focus on photography, often neglecting to engage with the cultural significance of the location.",
            "application": "Having recognized the dangers of overtourism, many cities have implemented visitor caps."
        },
        "reading": {
            "title": "The Paradox of Travel: Mass Tourism and the Erosion of Heritage",
            "word_count": 342,
            "text": "In the era of low-cost aviation and digital global mobility, international tourism has become one of the world's largest industries. While it provides essential foreign currency and employment for many developing nations, the environmental and cultural 'footprint' of mass tourism is becoming increasingly difficult to ignore. The phenomenon of 'overtourism' has transformed once-serene heritage sites into crowded hubs of commercial activity.",
            "questions": [
                {"type": "true_false_ng", "question": "Tourism is currently the largest industry in the world.", "answer": "Not Given—text says 'one of the largest'"},
                {"type": "true_false_ng", "question": "'Staged authenticity' refers to ceremonies that have been changed for tourists.", "answer": "True"},
                {"type": "summary_completion", "question": "Mass tourism leads to the ______ of culture.", "answer": "commodification"}
            ]
        },
        "speaking": {
            "part3": {
                "question": "Do you think that international tourism will eventually destroy local cultures?",
                "band8_sample": "I wouldn't say it's an inevitability, but it is a substantial risk. When a culture is beholden to the tourist dollar, there is a tendency to package its traditions in a way that is 'digestible' for outsiders. However, if managed correctly through community-led initiatives, tourism can actually provide the financial impetus necessary to preserve traditions."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "International tourism has become a major industry in the world. Some people think it is very beneficial for the host countries, while others think it has many negative effects. Discuss both views and give your opinion.",
            "band75_excerpt": "The expansion of global tourism is a double-edged sword. While it acts as a catalyst for economic development, the resultant environmental despoliation and cultural commodification cannot be overlooked. I believe that while the economic benefits are undeniable, they must be tempered by rigorous regulation.",
            "examiner_analysis": {
                "task_response": "Uses a complex concessive structure: 'While... I believe that...'",
                "lexical_resource": "Uses 'catalyst', 'despoliation', 'tempered by', 'cultural capital'"
            }
        },
        "examiner_tips": [
            "Use participle clauses for concise academic style",
            "Always mention impact on local/indigenous population",
            "Use third conditional to discuss what would have happened without tourism"
        ]
    }
]


async def seed_advanced_mastery():
    """Seed the Advanced IELTS Mastery course modules into MongoDB."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Drop existing collection and recreate
    await db.advanced_mastery_modules.drop()
    
    # Insert all modules
    await db.advanced_mastery_modules.insert_many(ADVANCED_MODULES)
    
    print(f"✅ Successfully seeded {len(ADVANCED_MODULES)} Advanced IELTS Mastery modules")
    
    # Create index for efficient querying
    await db.advanced_mastery_modules.create_index("module_number")
    await db.advanced_mastery_modules.create_index("id", unique=True)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_advanced_mastery())
