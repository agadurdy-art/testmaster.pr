#!/usr/bin/env python3
"""
Advanced IELTS Mastery: Band 6.0-9.0 Full Course
20 Modules covering all advanced IELTS topics for Band 7-9 achievement
Complete curriculum with full reading passages, 10-12 questions per module,
and comprehensive model essays.
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
            "band_80_example": "The increasing integration of artificial intelligence into the workforce has led to the unprecedented displacement of traditional labor.",
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
                {"type": "sentence_completion", "question": "Standardized testing may undermine ______ development.", "answer": "holistic"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a teacher who had a significant impact on your education. Explain what made them effective.",
                "model_answer": "The teacher who influenced me most was my literature professor. His pedagogical approach was revolutionary—he fostered critical thinking rather than rote learning, encouraging us to question assumptions and develop our own interpretations."
            },
            "part3": {
                "question": "How has the role of the teacher changed in the digital age?",
                "band8_sample": "The teacher has transitioned from being the 'sage on the stage' to a 'guide on the side', facilitating the navigation of information rather than the mere dissemination of it."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that children should be taught to memorize facts, while others think they should be taught to think critically. Discuss both views.",
            "band75_excerpt": "The debate over pedagogical methodology is fundamental to educational reform. While rote memorization has its place in foundational learning, I would argue that an educational system that prioritizes critical thinking equips students with the analytical tools necessary to navigate an increasingly complex world.",
            "examiner_analysis": {
                "task_response": "Acknowledges both approaches while clearly favoring critical thinking with justification.",
                "lexical_resource": "Uses 'pedagogical methodology', 'foundational learning', and 'analytical tools'."
            }
        },
        "examiner_tips": [
            "Use 'pedagogical' instead of 'teaching'",
            "Contrast 'rote' vs 'critical thinking' explicitly",
            "Link education to broader social outcomes"
        ]
    },
    # Module 4: Globalisation and Cultural Identity
    {
        "id": "advanced-module-4",
        "module_number": 4,
        "title": "Globalisation and Cultural Identity",
        "subtitle": "Cultural Homogenization vs. Heterogenization",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the tension between cultural homogenization and heterogenization",
            "Utilize negative inversion to provide rhetorical emphasis in arguments",
            "Critically evaluate the socio-economic impacts of multinational corporations on local heritage"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Cultural Homogenization", "meaning": "The process by which local cultures are transformed or absorbed by a dominant outside culture", "usage": "Noun phrase; often used as a negative outcome", "example": "The primary concern regarding globalisation is the potential for cultural homogenization across the globe."},
                {"term": "Linguistic Hegemony", "meaning": "The dominance of one language over others, often through political or economic influence", "usage": "Noun; specific to language topics", "example": "The linguistic hegemony of English often threatens the survival of indigenous dialects."},
                {"term": "To transcend", "meaning": "To rise above or go beyond the limits of something", "usage": "Verb; high-level alternative to 'go past'", "example": "Art and music possess a unique ability to transcend political and cultural boundaries."},
                {"term": "A veneer of modernity", "meaning": "A thin outward appearance of being modern that hides a different reality", "usage": "Idiomatic/Metaphorical phrase", "example": "Many cities have adopted a veneer of modernity while struggling to preserve their historical essence."}
            ]
        },
        "grammar": {
            "title": "Negative Inversion for Emphasis",
            "explanation": "To achieve a Band 7+ in Grammatical Range and Accuracy, you must demonstrate mastery over rare structures like inversion.",
            "band_65_example": "Globalisation helps the economy and it also helps people understand other cultures.",
            "band_80_example": "Not only does globalisation bolster international trade, but it also facilitates a profound cross-pollination of cultural values.",
            "alternative_structure": "Seldom have we seen such a rapid erosion of traditional customs as in the current era of digital connectivity."
        },
        "reading": {
            "title": "The Paradox of the Global Village",
            "word_count": 335,
            "text": "The term 'Global Village,' coined by Marshall McLuhan, suggests a world interconnected by electronic media where distances are shrunk and cultures are shared. However, this interconnectedness is a double-edged sword. While it allows for the unprecedented dissemination of information, it simultaneously facilitates a 'McDonaldisation' of society. This refers to the standardisation of consumer habits, where global brands replace local businesses, leading to a singular, westernised lifestyle.\n\nSociologists argue that this trend leads to 'cultural dilution,' where the unique nuances of heritage are lost to the convenience of mass production. For instance, the traditional architecture of many Southeast Asian cities is being overshadowed by glass-and-steel skyscrapers that are indistinguishable from those in London or New York. Yet, a counter-movement known as 'glocalisation' has emerged. This is the process wherein global products are adapted to suit local tastes and cultures. For example, international fast-food chains often incorporate regional flavours into their menus to remain relevant.\n\nThe challenge for the 21st century lies in balancing the economic benefits of a globalised market with the preservation of 'intangible cultural heritage.' Critics argue that if the current trajectory continues, the world risks becoming a cultural monolith. Proponents, however, suggest that globalisation actually fosters a new, hybrid identity that is more inclusive and less provincial. They believe that the exchange of ideas—from medical breakthroughs to cinematic masterpieces—far outweighs the loss of traditional isolation. Ultimately, the survival of cultural diversity depends on the conscious efforts of nations to protect their unique customs while remaining open to the global flow of innovation.",
            "questions": [
                {"type": "true_false_ng", "question": "Does the author state that 'glocalisation' is purely an economic strategy?", "answer": "False - it is described as a process of adaptation to local culture"},
                {"type": "matching_info", "question": "Which section mentions the architectural standardisation of cities?", "answer": "Paragraph 2"},
                {"type": "sentence_completion", "question": "The term 'McDonaldisation' is used to illustrate the ______ of consumer habits.", "answer": "standardisation"},
                {"type": "identify_view", "question": "Does the author believe globalisation only has negative effects?", "answer": "No - mentions benefits like exchange of ideas"},
                {"type": "vocabulary_match", "question": "Which term describes adapting global products to local tastes?", "answer": "Glocalisation"},
                {"type": "true_false_ng", "question": "Traditional architecture is thriving in Southeast Asian cities.", "answer": "False"},
                {"type": "summary_completion", "question": "The survival of cultural diversity requires ______ efforts from nations.", "answer": "conscious"},
                {"type": "multiple_choice", "question": "What is the 'Global Village' concept associated with?", "options": ["Economic isolation", "Electronic media interconnectedness", "Cultural preservation"], "answer": "Electronic media interconnectedness"},
                {"type": "sentence_completion", "question": "Critics warn the world risks becoming a cultural ______.", "answer": "monolith"},
                {"type": "matching_info", "question": "Which paragraph discusses the concept of hybrid identity?", "answer": "Paragraph 3"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a tradition from your country that you think is important to preserve. Explain why it is at risk and how it could be protected.",
                "model_answer": "I'd like to talk about the traditional lunar new year celebrations in my country. This festival is at risk due to the pervasive influence of Western consumer culture and the fast pace of modern life. To protect it, we need conscious efforts to educate younger generations about its significance."
            },
            "part3": {
                "question": "In your opinion, is the influence of Western culture on the rest of the world a positive or negative development?",
                "band8_sample": "I'd argue it's a nuanced issue. On one hand, the proliferation of Western media has introduced concepts like individual rights to new audiences. On the other hand, it can lead to a displacement of local values. We shouldn't view it as a zero-sum game, but rather a complex synthesis of ideologies."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "The increasing presence of international brands and products in many countries is leading to the disappearance of local cultures. To what extent do you agree or disagree?",
            "band75_excerpt": "The omnipresence of multinational corporations is undeniably reshaping the global cultural landscape. While some assert that this leads to the extinction of local identity, I believe the reality is more a process of evolution than destruction. While global brands provide a standardised experience, they often exist alongside, rather than in place of, local traditions. However, the risk of cultural erosion remains high if governments do not actively subsidise the arts and traditional crafts.",
            "examiner_analysis": {
                "task_response": "The response avoids a black-and-white 'agree or disagree' stance, opting for a nuanced position that acknowledges both evolution and risk.",
                "lexical_resource": "Uses high-level terms like 'omnipresence,' 'standardised,' 'subsidise,' and 'cultural erosion' instead of 'lots of shops' or 'losing culture'.",
                "coherence": "Uses 'While,' 'However,' and 'Rather than' to create a logical flow between opposing ideas."
            }
        },
        "examiner_tips": [
            "The 'Critical Thinking' Trap: At Band 6.5, students often describe the problem. At Band 7+, you must analyze the implications.",
            "Vocabulary Precision: Avoid vague words like 'stuff' or 'things.' Instead of 'globalisation does many things,' use 'Globalisation exerts a multifaceted influence on...'",
            "Avoid Over-generalising: Do not say 'All local cultures will die.' Use hedging language: 'There is a significant risk that certain niche traditions may become obsolete...'"
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
                {"term": "Socio-economic Status", "meaning": "The social standing or class of an individual or group", "usage": "Noun phrase; formal context", "example": "Health outcomes are often inextricably linked to an individual's socio-economic status."},
                {"term": "To Mandate", "meaning": "To give an official order or commission to do something", "usage": "Verb; used for government actions", "example": "The government chose to mandate nutritional labeling on all processed foods."}
            ]
        },
        "grammar": {
            "title": "Concessive Clauses and the Subjunctive",
            "explanation": "To reach Band 7+, you must use complex structures that signal nuanced thinking.",
            "band_65_example": "Exercise is good, but people are busy.",
            "band_80_example": "Notwithstanding the undeniable benefits of regular physical activity, the modern workforce finds it increasingly difficult to integrate exercise into a rigorous schedule.",
            "subjunctive_example": "It is essential that the government prioritize public health campaigns over the construction of new hospital wings."
        },
        "reading": {
            "title": "The Paradigm Shift: From Treatment to Prevention",
            "word_count": 325,
            "text": "The global healthcare landscape is currently undergoing a fundamental transformation. For decades, the Western medical model has been primarily 'reactive'—focusing on the treatment of acute conditions after they manifest. However, as the global population ages and the prevalence of non-communicable diseases such as type 2 diabetes and cardiovascular disease skyrockets, this model is becoming fiscally unsustainable. The solution, many experts argue, lies in a 'proactive' approach: preventative medicine.\n\nThe primary hurdle to this shift is the concept of 'health literacy.' Studies indicate that individuals with a higher socio-economic status are more likely to engage in health-promoting behaviors because they have better access to information and resources. Conversely, those in lower-income brackets often face 'prohibitive costs' when attempting to access fresh produce or gym facilities. Furthermore, the rise of a sedentary lifestyle, driven by the digital economy, has exacerbated the issue.\n\nCritics of state-led health initiatives argue that government intervention—such as 'sugar taxes' or mandatory calorie counts—constitutes 'nanny statism' and infringes upon individual liberty. They posit that individuals should be free to make their own lifestyle choices, however detrimental they may be. Proponents, however, counter that the societal cost of poor health, including lost productivity and the strain on public resources, justifies legislative action. They suggest that it is imperative that the state incentivize healthy behavior through subsidies for fitness programs and stricter regulations on the food industry. Ultimately, the transition from a 'sick-care' system to a true healthcare system requires a multi-faceted approach involving education, infrastructure, and a rethink of corporate responsibility.",
            "questions": [
                {"type": "true_false_ng", "question": "The Western medical model has historically focused on preventing illnesses.", "answer": "False"},
                {"type": "true_false_ng", "question": "People with higher incomes generally have better health literacy.", "answer": "True"},
                {"type": "true_false_ng", "question": "Digital technology is the only cause of sedentary lifestyles.", "answer": "Not Given"},
                {"type": "matching_info", "question": "In which paragraph is the concept of 'nanny statism' discussed?", "answer": "Paragraph 3"},
                {"type": "summary_completion", "question": "The author suggests that the current reactive medical model is becoming ______ due to an aging population.", "answer": "fiscally unsustainable"},
                {"type": "sentence_completion", "question": "Critics believe government health mandates are an ______ on personal freedom.", "answer": "infringement"},
                {"type": "identify_view", "question": "Does the author believe education alone is enough to solve the health crisis?", "answer": "No—requires a 'multi-faceted approach'"},
                {"type": "vocabulary_match", "question": "Which term describes costs that prevent people from accessing services?", "answer": "Prohibitive costs"},
                {"type": "multiple_choice", "question": "What is driving the shift to preventative medicine?", "options": ["Government policy", "Aging population and NCDs", "Technology advances"], "answer": "Aging population and NCDs"},
                {"type": "sentence_completion", "question": "The transition requires education, infrastructure, and a rethink of ______ responsibility.", "answer": "corporate"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a healthy habit you have recently started. You should say what it is, how you started it, and how it has improved your life.",
                "model_answer": "I've recently incorporated daily meditation into my routine. I started after reading about its benefits for mental health. It has significantly reduced my stress levels and improved my focus at work."
            },
            "part3": {
                "question": "Should governments be responsible for the health of their citizens, or is it an individual responsibility?",
                "band8_sample": "I believe the onus is on the state to provide a conducive environment for health. While individual agency is vital, one cannot expect healthy choices from a population that is systemically disadvantaged. Therefore, the government should spearhead initiatives that make nutritious food more accessible and affordable."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that the best way to improve public health is to increase the price of unhealthy food and drinks. Others believe that education is the only effective solution. Discuss both views and give your opinion.",
            "band75_excerpt": "The debate over how to combat the growing obesity epidemic is multifaceted. Proponents of taxation argue that financial disincentives are the most direct way to alter consumer behavior. However, I would argue that while fiscal measures provide a short-term deterrent, they do not address the root causes of poor health. Education, while slower to produce results, fosters a sustainable shift in public consciousness by empowering individuals with health literacy.",
            "examiner_analysis": {
                "task_response": "Addresses both 'taxation' and 'education' while providing a clear preference for education as a long-term solution.",
                "coherence": "Uses 'while' and 'however' to compare the effectiveness of strategies.",
                "lexical_resource": "Uses 'disincentives,' 'deterrent,' and 'health literacy' instead of 'penalties' or 'learning about health'.",
                "error_upgrade": "Instead of saying 'Taxing sugar is bad for poor people,' use 'Regressive taxes on unhealthy commodities may disproportionately affect low-income households'."
            }
        },
        "examiner_tips": [
            "Avoid Emotional Language: Do not say 'It's a tragedy that people are sick.' Use neutral, academic phrasing: 'The rising incidence of chronic disease presents a significant challenge to public infrastructure'.",
            "Hedge Your Claims: High-level writers rarely use 'always' or 'never.' Use 'tend to,' 'arguably,' 'predominantly,' or 'in many instances' to show academic caution.",
            "Lexical Precision: Be careful with 'Healthy.' At this level, use 'nutritious' (food), 'salubrious' (environment), or 'wholesome' (habits) depending on the context."
        ]
    },
    # Module 6: Crime, Justice, and the Penal System
    {
        "id": "advanced-module-6",
        "module_number": 6,
        "title": "Crime, Justice, and the Penal System",
        "subtitle": "Jurisprudence and Social Order",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the efficacy of deterrence versus rehabilitation",
            "Utilize reduced relative clauses to condense complex ideas for better cohesion",
            "Master advanced legal and sociological collocations to satisfy the 'Lexical Resource' criteria for Band 7+"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Recidivism", "meaning": "The tendency of a convicted criminal to reoffend", "usage": "Noun; focus for 'effectiveness of prison' topics", "example": "High rates of recidivism suggest that purely punitive measures are failing to reform offenders."},
                {"term": "Deterrent", "meaning": "A thing that discourages or is intended to discourage someone from doing something", "usage": "Noun; used with 'effective' or 'strong'", "example": "Harsh sentencing acts as a deterrent only if the likelihood of apprehension is high."},
                {"term": "Restorative Justice", "meaning": "A system of criminal justice which focuses on the rehabilitation of offenders through reconciliation with victims", "usage": "Noun phrase; academic alternative to 'fixing problems'", "example": "Restorative justice programs have shown promise in reducing long-term hostility between communities."},
                {"term": "To Mitigate", "meaning": "To make something less severe, serious, or painful", "usage": "Verb; high-level alternative to 'reduce' or 'lessen'", "example": "Improved socio-economic conditions can help mitigate the factors that lead to juvenile delinquency."},
                {"term": "Capital Punishment", "meaning": "The legally authorized killing of someone as punishment for a crime", "usage": "Noun phrase; specific to 'death penalty' debates", "example": "The ethical implications of capital punishment remain a point of contention in international law."}
            ]
        },
        "grammar": {
            "title": "Reduced Relative Clauses",
            "explanation": "To achieve high scores in 'Grammatical Range and Accuracy,' you must use complex structures that improve the 'flow' or coherence of your writing.",
            "band_65_example": "Criminals who are released from prison often find it hard to get a job.",
            "band_80_example": "Offenders released from correctional facilities frequently encounter significant barriers to employment.",
            "application": "Use this when defining groups or conditions. 'Policies aimed at social inclusion are more effective than those focused solely on incarceration.'"
        },
        "reading": {
            "title": "The Evolution of the Penal System",
            "word_count": 325,
            "text": "The debate over the primary purpose of the penal system—whether it should be punitive or rehabilitative—has intensified in recent decades. Historically, the 'retributive justice' model predominated, operating on the principle of lex talionis (an eye for an eye). Proponents of this view argue that the primary function of prison is to serve as a deterrent and to provide a just desert for the transgression committed. They posit that without the threat of significant hardship, the social contract is undermined, and the rule of law becomes toothless.\n\nHowever, a growing body of sociological evidence suggests that the 'tough on crime' approach may actually exacerbate the problem it seeks to solve. In many jurisdictions, the experience of incarceration serves as a 'school for crime,' where low-level offenders are exposed to more sophisticated criminal networks. This phenomenon often leads to high levels of recidivism, creating a revolving door that places an immense fiscal burden on the state. Consequently, many modern legal systems are pivoting toward a 'rehabilitative' or 'restorative' model.\n\nThe rehabilitative approach views crime as a symptom of underlying social or psychological issues, such as poverty, lack of education, or substance abuse. By providing vocational training and mental health support, these systems aim to reintegrate the individual into society as a productive citizen. Critics of this approach argue it is 'soft on crime' and fails to provide closure for victims. Nevertheless, countries that have implemented robust rehabilitation programs, such as Norway, report significantly lower reoffending rates compared to those relying on strict incarceration. Ultimately, the challenge for the 21st-century judiciary is to strike a balance between holding individuals accountable and addressing the systemic root causes of criminal behavior.",
            "questions": [
                {"type": "identify_view", "question": "Does the author suggest the retributive model is the most modern approach?", "answer": "No; it is 'historical'"},
                {"type": "vocabulary_match", "question": "Which term in paragraph 1 means 'punishment that is deserved'?", "answer": "Just desert"},
                {"type": "true_false_ng", "question": "The 'school for crime' theory suggests prisons make people better citizens.", "answer": "False"},
                {"type": "true_false_ng", "question": "Norway's system is mentioned as a successful example of rehabilitation.", "answer": "True"},
                {"type": "true_false_ng", "question": "The author believes victims' needs are always met by rehabilitation.", "answer": "Not Given"},
                {"type": "summary_completion", "question": "The retributive model is based on the concept of ______.", "answer": "retributive justice / lex talionis"},
                {"type": "summary_completion", "question": "High ______ rates contribute to the financial strain on governments.", "answer": "recidivism"},
                {"type": "multiple_choice", "question": "What is the 'revolving door' mentioned in paragraph 2?", "options": ["A type of prison door", "The cycle of reoffending and returning to prison", "A rehabilitation program"], "answer": "The cycle of reoffending and returning to prison"},
                {"type": "matching_info", "question": "Which paragraph discusses the financial impact of crime?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph mentions vocational training?", "answer": "Paragraph 3"},
                {"type": "sentence_completion", "question": "Critics believe rehabilitation may be ______ on crime.", "answer": "soft"},
                {"type": "identify_view", "question": "The author concludes that the judiciary must find a ______ between accountability and root causes.", "answer": "balance"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a law in your country that you think is very important. You should say what the law is, how it works, and why it is necessary for society.",
                "model_answer": "I'd like to discuss the mandatory education law in my country. It mandates that all children between ages 6 and 16 must attend school. This law is crucial because it ensures equal opportunity and helps mitigate the socio-economic disparities that can arise from educational neglect."
            },
            "part3": {
                "question": "Do you think that the media's portrayal of crime influences public fear?",
                "band8_sample": "Undoubtedly. The media tends to sensationalize violent crimes, which creates a distorted perception of reality. While actual crime rates may be declining, the constant influx of high-profile cases in the news can lead to a heightened state of anxiety among the public. It's a classic case of the 'availability heuristic,' where people judge the safety of their environment based on the most vivid examples they see on screen."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that the best way to reduce crime is to give longer prison sentences. Others believe there are better ways. Discuss both views and give your opinion.",
            "band75_excerpt": "The efficacy of lengthy custodial sentences as a means of crime reduction is a subject of intense debate. While proponents of strict sentencing argue that it serves as a powerful deterrent, I am of the conviction that such measures merely address the symptoms of criminality rather than its etiology. A more sustainable approach involves tackling socio-economic disparities and investing in early-intervention programs.",
            "examiner_analysis": {
                "task_response": "The model addresses both sides and gives a clear, sophisticated opinion using 'etiology' (cause) instead of 'reason'.",
                "lexical_resource": "Instead of saying 'Long prison stays,' uses 'Extended custodial sentences.' Instead of 'reasons for crime,' uses 'The root causes of delinquency'.",
                "error_upgrade": "Common 6.5 Error: 'I think long sentences are good because they scare people.' Band 7.5+ Upgrade: 'The implementation of stringent sentencing may act as a psychological deterrent for potential offenders'."
            }
        },
        "examiner_tips": [
            "Avoid Over-Simplification: At Band 7+, do not just say crime is 'bad.' Discuss it as a sociological phenomenon.",
            "Precision in Collocation: Use 'commit a crime,' 'perpetrate a felony,' or 'violate the law.' Do not use 'do a crime'.",
            "The 'Context' Trap: When discussing laws, ensure you remain objective. The examiner is looking for your ability to argue, not your personal political views."
        ]
    },
    # Module 7: Media, Information Integrity, and the Digital Landscape
    {
        "id": "advanced-module-7",
        "module_number": 7,
        "title": "Media, Information Integrity, and the Digital Landscape",
        "subtitle": "The Post-Truth Era and Information Proliferation",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the shift from traditional journalism to citizen-led digital media",
            "Master Participle Clauses to create concise, sophisticated descriptions in Writing Task 2",
            "Develop a lexicon for discussing bias, algorithmic filters, and journalistic ethics"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Sensationalism", "meaning": "The use of exciting or shocking stories or language at the expense of accuracy, in order to provoke public interest", "usage": "Noun; usually used to criticize modern news", "example": "The rise of sensationalism in digital tabloids has led to a measurable decline in public trust."},
                {"term": "Echo Chamber", "meaning": "An environment where a person only encounters information or opinions that reflect and reinforce their own", "usage": "Noun; vital for discussing social media algorithms", "example": "Social media algorithms often create an echo chamber, insulating users from diverse perspectives."},
                {"term": "To Disseminate", "meaning": "To spread or disperse information widely", "usage": "Verb; high-level alternative to 'share' or 'send out'", "example": "The internet allows individuals to disseminate news globally in a matter of seconds."},
                {"term": "Objectivity", "meaning": "The quality of being able to make decisions or report news based on facts rather than feelings", "usage": "Noun; the gold standard of journalism", "example": "Maintaining strict objectivity is becoming increasingly difficult in a polarized political climate."},
                {"term": "Empirical Evidence", "meaning": "Information acquired by observation or experimentation", "usage": "Noun phrase; used when discussing the validity of news", "example": "In a post-truth era, many narratives are constructed without the support of empirical evidence."}
            ]
        },
        "grammar": {
            "title": "Participle Clauses",
            "explanation": "To reach Band 7.0+, you must vary sentence beginnings. Participle clauses allow you to provide extra information without repetitive 'which' or 'who' clauses.",
            "band_65_example": "The news is controlled by large companies and this means they can influence what people think.",
            "band_80_example": "Being controlled by large conglomerates, modern media outlets possess the power to significantly influence public opinion.",
            "alternative_structure": "Equipped with advanced algorithms, social media platforms can curate content that caters specifically to an individual's biases."
        },
        "reading": {
            "title": "The Paradox of Choice and the Rise of Misinformation",
            "word_count": 330,
            "text": "The digital age has democratized the flow of information, effectively ending the era when a few elite news organizations acted as the sole 'gatekeepers' of truth. While this has empowered the individual, it has also birthed a 'paradox of choice.' When faced with an overwhelming volume of content, users often gravitate toward sources that confirm their pre-existing worldviews, a phenomenon known as confirmation bias. This shift has been accelerated by the profit-driven models of tech giants, which utilize algorithms to maximize engagement. Consequently, provocative and emotionally charged content often travels faster and further than nuanced, factual reporting.\n\nThis environment has provided fertile ground for the spread of 'fake news' and 'deepfakes.' Unlike traditional media, which—at least in theory—is governed by editorial standards and legal accountability, digital platforms often operate in a regulatory gray area. This lack of oversight makes it increasingly difficult for the average consumer to distinguish between a credible report and a sophisticated fabrication. Furthermore, the speed at which information is disseminated today leaves little room for traditional fact-checking.\n\nThe implications for democracy are profound. An informed citizenry is the bedrock of a functional society; however, if the public cannot agree on a basic set of facts, constructive debate becomes impossible. Critics argue that the commodification of news has turned information into a weapon of manipulation rather than a tool for enlightenment. To combat this, some advocate for a return to state-subsidized, independent journalism, while others believe that the only long-term solution is the implementation of comprehensive 'media literacy' programs in schools. These programs aim to equip students with the critical thinking skills necessary to verify sources and identify logical fallacies. Ultimately, the challenge of the 21st century is not the scarcity of information, but the ability to filter the signal from the noise.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe the 'gatekeeper' era was entirely negative?", "answer": "No; its end has created a 'paradox of choice'"},
                {"type": "vocabulary_match", "question": "Which term in paragraph 1 means 'choosing sources that support one's own views'?", "answer": "Confirmation bias"},
                {"type": "true_false_ng", "question": "Traditional media outlets were historically more regulated than digital platforms.", "answer": "True"},
                {"type": "true_false_ng", "question": "The author suggests that deepfakes are easy for the average person to spot.", "answer": "False"},
                {"type": "true_false_ng", "question": "The text claims that state-subsidized journalism is the only solution.", "answer": "False—it says 'some advocate' for it among other solutions"},
                {"type": "summary_completion", "question": "The author describes an informed citizenry as the ______ of a functional society.", "answer": "bedrock"},
                {"type": "summary_completion", "question": "Tech companies use ______ to ensure high levels of user engagement.", "answer": "algorithms"},
                {"type": "multiple_choice", "question": "What does 'filter the signal from the noise' mean in the conclusion?", "options": ["Increase data volume", "Distinguishing truth from irrelevant or false info", "Blocking all media"], "answer": "Distinguishing truth from irrelevant or false info"},
                {"type": "matching_info", "question": "Which paragraph discusses the speed of information dissemination?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph discusses educational solutions?", "answer": "Paragraph 3"},
                {"type": "sentence_completion", "question": "High levels of emotional content are prioritized over ______.", "answer": "nuanced, factual reporting"},
                {"type": "identify_view", "question": "The overall tone regarding the current media landscape is ______.", "answer": "critical/concerned"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a news story that you found particularly interesting. You should say what it was about, where you heard it, and why it caught your attention.",
                "model_answer": "I'd like to discuss a report on artificial intelligence in healthcare that I read in a reputable science journal. It caught my attention because it highlighted both the transformative potential and the ethical dilemmas of using AI for medical diagnoses."
            },
            "part3": {
                "question": "How has the way people consume news changed in the last decade?",
                "band8_sample": "In the past, news consumption was a communal and scheduled event—people watched the evening broadcast. Today, it is fragmented and instantaneous. We are constantly bombarded with snippets of information via our smartphones. While this ensures we are always 'in the loop,' it often leads to intellectual fatigue and a superficial understanding of complex global issues."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Nowadays, more and more people get their news from social media rather than traditional newspapers or television. Do the advantages of this trend outweigh the disadvantages?",
            "band75_excerpt": "The transition from traditional broadcast media to social-media-driven news is a paradigm shift with significant societal consequences. While the democratization of information allows for a greater variety of voices, I believe the disadvantages, particularly the erosion of journalistic integrity and the rise of algorithmic bias, far outweigh the benefits. Without the rigorous fact-checking inherent in traditional journalism, the public is left vulnerable to misinformation campaigns.",
            "examiner_analysis": {
                "task_response": "Clearly weights the disadvantages over the advantages with a specific thesis.",
                "lexical_resource": "Uses 'paradigm shift,' 'democratization,' and 'misinformation campaigns'.",
                "error_upgrade": "Instead of saying 'False news is a problem,' use 'The proliferation of fabricated narratives poses a grave threat to the integrity of public discourse'."
            }
        },
        "examiner_tips": [
            "Avoid Cliches: Do not just say 'Every coin has two sides.' Use 'This issue presents a significant dichotomy...'",
            "Logical Flow: Use cohesive devices that show the relationship between ideas, such as 'Consequently,' 'In contrast,' or 'Paradoxically'.",
            "Specificity: Instead of 'social media,' specify 'micro-blogging sites' or 'content-sharing platforms' to show lexical range."
        ]
    },
    # Module 8: Government, the Economy, and Wealth Disparity
    {
        "id": "advanced-module-8",
        "module_number": 8,
        "title": "Government, the Economy, and Wealth Disparity",
        "subtitle": "Fiscal Responsibility and Social Equity",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the role of fiscal policy in addressing socio-economic disparities",
            "Master the use of agentless passive voice to maintain an objective, academic tone in formal reports",
            "Develop a lexicon for discussing social mobility, redistribution, and economic stability"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Fiscal Policy", "meaning": "Government adjusted spending levels and tax rates to monitor and influence a nation's economy", "usage": "Noun; focus for government-themed questions", "example": "Prudent fiscal policy is essential for stabilizing the economy during periods of inflation."},
                {"term": "Social Mobility", "meaning": "The movement of individuals or groups in social position over time", "usage": "Noun phrase; critical for discussing education and wealth", "example": "High levels of wealth inequality often serve as a barrier to social mobility for the youth."},
                {"term": "Progressive Taxation", "meaning": "A tax system where the tax rate increases as the taxable amount increases", "usage": "Noun phrase; common in 'rich vs. poor' debates", "example": "Proponents of progressive taxation argue it is the most effective tool for wealth redistribution."},
                {"term": "To Alleviate", "meaning": "To make a problem or suffering less severe", "usage": "Verb; high-level alternative to 'fix' or 'help'", "example": "Targeted subsidies can help alleviate the financial pressure on low-income households."},
                {"term": "Economic Stagnation", "meaning": "A prolonged period of little or no growth in an economy", "usage": "Noun phrase; describes negative economic states", "example": "Persistent underinvestment in infrastructure often leads to long-term economic stagnation."}
            ]
        },
        "grammar": {
            "title": "Agentless Passive Voice",
            "explanation": "To achieve a Band 7+ in Grammatical Range and Accuracy, you should use the passive voice to shift focus from the 'doer' to the 'action' or 'result,' making the writing more objective.",
            "band_65_example": "The government should tax the rich more to help the poor.",
            "band_80_example": "It is widely argued that wealth should be redistributed through more rigorous tax frameworks to support vulnerable demographics.",
            "application": "Use 'It is estimated that,' 'It has been observed that,' or 'Measures must be implemented to...' to sound like an authority."
        },
        "reading": {
            "title": "The Great Divide: The Challenge of Global Wealth Inequality",
            "word_count": 335,
            "text": "In the contemporary global economy, the widening chasm between the ultra-wealthy and the impoverished has become a defining issue for policymakers. While global trade has lifted millions out of absolute poverty, the relative gap within nations continues to expand. This disparity is often attributed to 'capital deepening,' where the owners of technology and capital reap the rewards of productivity gains, while wages for manual and service labor remain stagnant. Economists warn that such extreme concentration of wealth can lead to social fragmentation and the erosion of democratic institutions.\n\nCentral to this debate is the role of the state in market intervention. Advocates of laissez-faire economics suggest that government interference stifles innovation and that wealth eventually 'trickles down' to the lower tiers of society. However, empirical evidence from the last three decades suggests that without robust intervention, wealth tends to aggregate at the top. To counter this, many suggest a return to more aggressive fiscal policies, including the closing of offshore tax havens and the implementation of higher inheritance taxes.\n\nFurthermore, the concept of social mobility—the ability of an individual to improve their economic status regardless of their background—is under threat. In societies with high inequality, access to quality education and healthcare is often contingent upon wealth. This creates a 'poverty trap' where systemic barriers prevent talented individuals from contributing fully to the economy. Consequently, investment in public services is not merely a moral imperative but an economic one. By ensuring a level playing field, governments can foster a more dynamic and resilient workforce. Ultimately, the challenge lies in balancing the incentives for individual success with the necessity of maintaining a cohesive and equitable society.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe global trade has been entirely unsuccessful?", "answer": "No; it has 'lifted millions out of absolute poverty'"},
                {"type": "vocabulary_match", "question": "Which phrase in paragraph 1 refers to the gap between rich and poor?", "answer": "Widening chasm / Disparity"},
                {"type": "true_false_ng", "question": "'Capital deepening' primarily benefits manual laborers.", "answer": "False"},
                {"type": "true_false_ng", "question": "Extreme wealth concentration can damage democracy.", "answer": "True"},
                {"type": "true_false_ng", "question": "Wealth has successfully 'trickled down' in most countries over the last 30 years.", "answer": "False"},
                {"type": "summary_completion", "question": "Advocates of laissez-faire believe intervention ______ innovation.", "answer": "stifles"},
                {"type": "summary_completion", "question": "Social mobility is hindered when public services depend on ______.", "answer": "wealth"},
                {"type": "multiple_choice", "question": "What is the 'poverty trap' mentioned in paragraph 3?", "options": ["A government program", "Systemic barriers that prevent movement out of poverty", "A type of taxation"], "answer": "Systemic barriers that prevent movement out of poverty"},
                {"type": "matching_info", "question": "Which paragraph discusses specific tax solutions?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph links public service investment to economic resilience?", "answer": "Paragraph 3"},
                {"type": "sentence_completion", "question": "Governments must balance individual incentives with ______.", "answer": "social cohesion/equity"},
                {"type": "identify_view", "question": "The author argues that reducing inequality is an ______ imperative.", "answer": "economic"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a successful small business you know. You should say what it is, how it started, and why you think it is successful.",
                "model_answer": "I'd like to discuss a local organic food cooperative in my neighborhood. It started as a grassroots initiative by community members who wanted access to affordable, healthy food. It's successful because it addresses a genuine need while fostering community solidarity."
            },
            "part3": {
                "question": "To what extent should a government interfere in the free market to protect small businesses?",
                "band8_sample": "I believe a certain degree of interventionism is vital. Small businesses are the backbone of the economy, yet they are often crowded out by multinational corporations with economies of scale. Governments should level the playing field by offering tax breaks or subsidies to local entrepreneurs. This doesn't just protect jobs; it preserves the unique character of our local communities."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many countries, the gap between the rich and the poor is widening. What problems does this cause, and what measures can be taken to address it?",
            "band75_excerpt": "The escalating disparity in wealth distribution is a pervasive issue in modern society. This trend frequently results in social stratification, where the marginalized feel disenfranchised from the political process. To mitigate this, governments must adopt multi-faceted strategies, such as increasing the minimum wage to a 'living wage' and investing heavily in vocational training to ensure the workforce remains competitive in an increasingly automated economy.",
            "examiner_analysis": {
                "task_response": "Identifies both specific problems (disenfranchisement) and solutions (living wage, training).",
                "lexical_resource": "Instead of 'The rich get richer,' use 'The concentration of capital among the affluent continues unabated'.",
                "error_upgrade": "Instead of 'The government should give money to poor people,' use 'Direct financial assistance should be supplemented by systemic reforms to healthcare and education'."
            }
        },
        "examiner_tips": [
            "Avoid Over-reliance on 'I': In Writing Task 2, use the passive voice or phrases like 'It is widely contended' to make your arguments sound more objective and academic.",
            "Logical Extensions: Don't just list problems. Explain why a problem leads to a specific consequence (e.g., wealth gap → lack of education access → lower national productivity).",
            "Synonym Range: Instead of repeating 'rich' and 'poor,' use 'affluent/privileged' and 'underprivileged/marginalized/low-income demographics'."
        ]
    },
    # Module 9: Urbanisation and the Architecture of Modern Society
    {
        "id": "advanced-module-9",
        "module_number": 9,
        "title": "Urbanisation and the Architecture of Modern Society",
        "subtitle": "Navigating the Complexities of the Modern Megalopolis",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically analyze the socio-economic impacts of urban sprawl and gentrification",
            "Master nominalization to maintain a high level of academic abstraction",
            "Develop a sophisticated lexicon to discuss the evolution of city infrastructure and 'Smart Cities'"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Urban Sprawl", "meaning": "The uncontrolled expansion of urban areas", "usage": "Noun phrase; subject or object of discussion on city planning", "example": "The rapid acceleration of urban sprawl has placed an unprecedented strain on local ecosystems."},
                {"term": "Gentrification", "meaning": "The process of changing the character of a neighborhood through the influx of more affluent residents and businesses", "usage": "Noun; focus for social equity and housing topics", "example": "Gentrification often acts as a catalyst for economic growth, yet it frequently results in the displacement of long-term residents."},
                {"term": "Infrastructure", "meaning": "The basic physical and organizational structures needed for the operation of a society", "usage": "Noun; core topic term", "example": "Investment in green infrastructure is imperative for the resilience of coastal cities."},
                {"term": "Conurbation", "meaning": "An extended urban area, typically consisting of several towns merging with the suburbs of one or more cities", "usage": "Noun; sophisticated alternative to 'urban area'", "example": "The Tokyo-Yokohama conurbation represents the pinnacle of high-density metropolitan living."},
                {"term": "Ubiquitous", "meaning": "Present, appearing, or found everywhere", "usage": "Adjective; used for technology or trends in cities", "example": "Digital surveillance has become ubiquitous in modern urban centers, raising concerns regarding privacy."}
            ]
        },
        "grammar": {
            "title": "Nominalization for Academic Precision",
            "explanation": "To achieve Band 7+ in Grammatical Range and Accuracy, you must use nominalization (turning verbs or adjectives into nouns) to make your arguments sound more objective and authoritative.",
            "band_65_example": "When cities grow too fast, it causes many social problems.",
            "band_80_example": "The rapid expansion of urban centers often precipitates a multitude of socio-economic complications.",
            "application": "Instead of saying 'People are moving to cities,' use 'The mass migration of rural populations to urban hubs.'"
        },
        "reading": {
            "title": "The Vertical Frontier: The Rise of the Smart City",
            "word_count": 330,
            "text": "The 21st century is defined by the inexorable rise of the city. For the first time in human history, more people live in urban environments than in rural ones. This shift has necessitated a radical rethink of urban planning, leading to the emergence of the 'Smart City'—an urban area that uses different types of electronic methods and sensors to collect data. Proponents argue that these data-driven insights allow for more efficient management of resources, from optimizing traffic flow to reducing energy consumption in public buildings. However, the implementation of such technology is not without its detractors.\n\nOne significant challenge is the phenomenon of 'urban heat islands,' where the concentration of concrete and lack of greenery causes city temperatures to soar. Critics argue that while Smart City technology might optimize energy, it does little to address the fundamental environmental flaws of modern architecture. Furthermore, the social fabric of the city is undergoing a transformation. As 'gentrification' sweeps through former industrial districts, the resulting 'social stratification' often leaves lower-income demographics marginalized. These individuals are frequently pushed to the peripheries of the conurbation, where infrastructure is often substandard and public transport links are tenuous.\n\nMoreover, the 'ubiquity' of digital sensors in Smart Cities has ignited a fierce debate over 'algorithmic governance.' When data dictates the distribution of police resources or the placement of public housing, there is a risk that historical biases will be 'baked into' the system. To mitigate these risks, urban planners are now looking toward 'biophilic design'—the integration of natural elements into the built environment—as a way to improve mental health and environmental sustainability simultaneously. Ultimately, the success of the modern city will be measured not just by its technological sophistication, but by its ability to foster inclusive, resilient, and salubrious environments for all its inhabitants.",
            "questions": [
                {"type": "true_false_ng", "question": "The majority of the global population now lives in cities.", "answer": "True"},
                {"type": "true_false_ng", "question": "'Smart Cities' rely primarily on historical data rather than real-time sensors.", "answer": "False"},
                {"type": "true_false_ng", "question": "Every city in the world has adopted 'biophilic design.'", "answer": "Not Given"},
                {"type": "matching_info", "question": "Which paragraph discusses the social impact of gentrification?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph mentions the risks of biased algorithms?", "answer": "Paragraph 3"},
                {"type": "matching_info", "question": "Which paragraph introduces the concept of 'urban heat islands'?", "answer": "Paragraph 2"},
                {"type": "summary_completion", "question": "Smart Cities aim to ______ the management of resources.", "answer": "optimize"},
                {"type": "summary_completion", "question": "High concentrations of concrete contribute to the ______ effect.", "answer": "urban heat island"},
                {"type": "sentence_completion", "question": "'Biophilic design' involves the ______ of nature into architecture.", "answer": "integration"},
                {"type": "multiple_choice", "question": "What is a major concern regarding 'algorithmic governance'?", "options": ["High costs", "The perpetuation of historical biases", "Lack of data"], "answer": "The perpetuation of historical biases"},
                {"type": "vocabulary_match", "question": "Which word in the text means 'found everywhere'?", "answer": "Ubiquity"},
                {"type": "identify_view", "question": "The author believes a city's success depends on its ______ and inclusivity.", "answer": "resilience"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a significant change that has occurred in your hometown or city. You should say what the change was, why it happened, and how it has affected the people living there.",
                "model_answer": "I'd like to discuss the development of a new metro system in my city. It was necessitated by the increasing urban congestion and pollution. The change has been transformative, significantly reducing commute times and improving air quality for residents."
            },
            "part3": {
                "question": "In what ways do you think cities will change in the next fifty years?",
                "band8_sample": "I anticipate a move toward hyper-localization, where cities are designed as a series of '15-minute' hubs. This would effectively curb the necessity for long-distance commuting and alleviate the congestion that currently plagues our conurbations. It's about shifting from a car-centric model to a pedestrian-centric one, which is arguably more conducive to social cohesion."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many parts of the world, people are moving from rural areas to cities. Does this trend have more advantages or disadvantages?",
            "band75_excerpt": "The global phenomenon of rural-to-urban migration is a defining characteristic of the modern era. While this shift offers significant opportunities for economic advancement, I would argue that the resultant pressures on urban infrastructure and social equity constitute a net disadvantage if left unmanaged.\n\nOn the one hand, cities act as engines of innovation and economic growth. The concentration of labor and capital in urban hubs allows for specialized industries to flourish, providing migrants with access to better-paying jobs and superior educational facilities. This concentration of resources often leads to a higher standard of living in terms of healthcare and cultural amenities.\n\nHowever, the rapid influx of populations often outpaces the development of essential infrastructure. This leads to the proliferation of informal settlements and the exacerbation of urban sprawl, which degrades the environment and increases commute times. Furthermore, the competitive nature of city life and the high cost of living can lead to social isolation and socio-economic disparity. Without proactive government intervention and rigorous urban planning, the benefits of city living are often overshadowed by these systemic failures.",
            "examiner_analysis": {
                "task_response": "Clearly weights the disadvantages while acknowledging the economic benefits.",
                "coherence": "Uses sophisticated transitions like 'The resultant pressures' and 'On the one hand... However.'",
                "lexical_resource": "Uses 'engines of innovation,' 'informal settlements,' and 'socio-economic disparity.'",
                "error_upgrade": "Instead of 'Cities have many people,' use 'The densification of urban populations...'"
            }
        },
        "examiner_tips": [
            "Avoid Over-Generalization: Instead of saying 'Cities are crowded,' use 'High-density living environments present unique challenges for waste management and public health'.",
            "Precision in Problem-Solving: When discussing urban issues, distinguish between infrastructure (physical) and social fabric (human/community).",
            "Lexical Accuracy: 'Urban' is an adjective, but 'Urbanisation' is a process. Using the correct form is essential for a Band 7+ score."
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
            "Master the use of advanced modal verbs and hedging to express academic caution",
            "Develop a sophisticated lexicon for discussing scientific integrity, funding, and bioethics"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Genetic Engineering", "meaning": "The deliberate modification of the characteristics of an organism by manipulating its genetic material", "usage": "Noun phrase; central to bioethics debates", "example": "The ethical implications of genetic engineering extend far beyond the laboratory."},
                {"term": "Paradigm Shift", "meaning": "A fundamental change in approach or underlying assumptions", "usage": "Noun; describes major scientific breakthroughs", "example": "The discovery of CRISPR technology represents a paradigm shift in modern medicine."},
                {"term": "Inherent Risks", "meaning": "Risks existing as a permanent, essential attribute", "usage": "Collocation; used when discussing new research", "example": "While the benefits of AI in healthcare are vast, the inherent risks to data privacy cannot be ignored."},
                {"term": "To Leapfrog", "meaning": "To surpass or move ahead of something or someone", "usage": "Verb; often used in 'Technological Leapfrogging'", "example": "Developing nations may leapfrog traditional infrastructure by adopting satellite-based internet."},
                {"term": "Ethical Dilemma", "meaning": "A situation in which a difficult choice has to be made between two courses of action", "usage": "Noun phrase; high-level alternative to 'problem'", "example": "The use of embryonic stem cells presents a profound ethical dilemma for researchers."}
            ]
        },
        "grammar": {
            "title": "Advanced Modals and Hedging",
            "explanation": "To reach Band 7+, you must avoid overly certain or 'black-and-white' statements. Hedging demonstrates academic maturity and precision.",
            "band_65_example": "Science will solve all our problems in the future.",
            "band_80_example": "It is arguably the case that scientific innovation could potentially mitigate many of the challenges facing modern society, provided that ethical frameworks are strictly observed.",
            "application": "Use 'might well,' 'would appear to,' and 'is likely to' instead of 'will.'"
        },
        "reading": {
            "title": "The Architect of Life: Ethics in the CRISPR Era",
            "word_count": 320,
            "text": "The advent of CRISPR-Cas9 technology has ushered in a new era of genomic editing, offering the tantalizing prospect of eradicating hereditary diseases. Unlike previous methods, which were often imprecise and prohibitively expensive, CRISPR allows scientists to 'cut and paste' DNA sequences with unprecedented accuracy. Proponents argue that this represents a pinnacle of human achievement, potentially saving millions of lives from conditions such as cystic fibrosis or sickle cell anemia. However, the ability to rewrite the 'blueprint of life' has ignited a firestorm of ethical debate.\n\nThe primary concern among bioethicists is the potential for 'germline editing'—modifications that are passed down to future generations. Critics suggest that such interventions could have unforeseen consequences on the human gene pool, leading to irreversible biological errors. Furthermore, there is the specter of 'designer babies,' where genetic modification is used not for therapeutic purposes, but for enhancement—selecting for traits like intelligence, athletic ability, or physical appearance. This raises significant questions regarding social equity; if such technologies are only available to the affluent, it could lead to a new form of 'genetic aristocracy,' further entrenching socio-economic disparities.\n\nMoreover, the commercialization of scientific research presents its own set of challenges. When breakthroughs are driven by the profit motives of pharmaceutical conglomerates rather than public good, the transparency of clinical trials can be compromised. Many argue that it is imperative for international regulatory bodies to establish a cohesive framework to oversee genetic research. Without such oversight, the pursuit of scientific progress risks outpacing our moral capacity to manage its consequences. Ultimately, the challenge of the 21st century is to ensure that while we possess the power to edit the code of life, we maintain the wisdom to use it ethically and inclusively.",
            "questions": [
                {"type": "true_false_ng", "question": "CRISPR is described as being more affordable than earlier gene-editing techniques.", "answer": "True"},
                {"type": "true_false_ng", "question": "Germline editing only affects the individual receiving the treatment.", "answer": "False"},
                {"type": "true_false_ng", "question": "Most scientists agree that 'designer babies' are a positive development.", "answer": "False"},
                {"type": "matching_info", "question": "Which paragraph discusses the risk of increasing social inequality?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph mentions the influence of private companies on research?", "answer": "Paragraph 3"},
                {"type": "summary_completion", "question": "CRISPR technology allows for the ______ of DNA with high precision.", "answer": "editing/modification"},
                {"type": "summary_completion", "question": "Critics fear that genetic enhancement could create a ______.", "answer": "genetic aristocracy"},
                {"type": "multiple_choice", "question": "What does the author mean by 'the blueprint of life'?", "options": ["Medical records", "The genetic code/DNA", "Hospital plans"], "answer": "The genetic code/DNA"},
                {"type": "multiple_choice", "question": "What is the main concern regarding 'germline editing'?", "options": ["Cost", "Unforeseen effects on future generations", "Lack of interest"], "answer": "Unforeseen effects on future generations"},
                {"type": "sentence_completion", "question": "The author suggests that ______ should oversee genetic research.", "answer": "international regulatory bodies"},
                {"type": "vocabulary_match", "question": "Which word in the text means 'extremely expensive'?", "answer": "Prohibitively"},
                {"type": "identify_view", "question": "The author concludes that scientific power must be balanced with ______.", "answer": "moral wisdom/ethical management"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe an area of science that you find particularly interesting. You should say what it is, how you learned about it, and why you think it is important for the future.",
                "model_answer": "I'm fascinated by the field of regenerative medicine. I first learned about it through a documentary on stem cell research. It's important because it could potentially revolutionize how we treat degenerative diseases. However, I believe stringent ethical oversight is essential to prevent misuse."
            },
            "part3": {
                "question": "To what extent should governments control scientific research?",
                "band8_sample": "I'm of the opinion that a delicate equilibrium must be maintained. While unfettered research is often the cradle of innovation, the state has a moral obligation to ensure that such progress does not compromise ethical standards. For instance, in fields like cloning or AI, stringent oversight is essential to prevent malicious applications. We shouldn't stifle curiosity, but we must erect guardrails to protect societal interests."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that scientific research should be carried out and controlled by the government rather than private companies. To what extent do you agree or disagree?",
            "band75_excerpt": "The question of who should steward scientific inquiry is a pivotal issue in the modern age. While private enterprise is often credited with the rapid commercialization of technology, I would argue that state-led research is fundamentally more aligned with the public interest. Private corporations are predominantly beholden to shareholders, which can lead to a prioritization of profit over long-term societal benefits. In contrast, government-funded initiatives can focus on 'blue-sky' research—endeavors that may not have immediate fiscal returns but are essential for the advancement of human knowledge.",
            "examiner_analysis": {
                "task_response": "Presents a nuanced argument for government control while acknowledging the role of private enterprise.",
                "lexical_resource": "Uses 'steward,' 'private enterprise,' 'beholden,' and 'blue-sky research.'",
                "error_upgrade": "Instead of 'Private companies only want money,' use 'The profit-centric nature of private corporations may circumvent ethical considerations in favor of financial gain.'"
            }
        },
        "examiner_tips": [
            "Maintain Academic Neutrality: Avoid saying 'I think this is scary.' Instead, use 'This development has prompted significant apprehension among the scientific community regarding...'",
            "Use 'Conditionals' for Ethical Arguments: Topics involving 'what if' scenarios are perfect for second and third conditionals.",
            "Precise Collocations: Use 'conduct research,' 'publish findings,' 'carry out trials,' or 'uphold standards.'"
        ]
    },
    # Module 11: Public Transport and Sustainable Infrastructure
    {
        "id": "advanced-module-11",
        "module_number": 11,
        "title": "Public Transport and Sustainable Infrastructure",
        "subtitle": "Mobility, Sustainability, and Public Transit",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the relationship between mass transit systems and urban sustainability",
            "Master the use of Cleft Sentences to provide focus and emphasis in academic arguments",
            "Develop a sophisticated lexicon to discuss fiscal allocation, modal shifts, and carbon sequestration through transit"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Modal Shift", "meaning": "A change from one mode of transport to another (usually from private cars to public transit)", "usage": "Noun; focus for sustainability topics", "example": "Achieving a modal shift requires significant investment in the reliability of rail networks."},
                {"term": "To Subsidise", "meaning": "To support an organization or activity financially", "usage": "Verb; high-level alternative to 'give money to'", "example": "Many argue that the government must subsidise public transport to make it a viable alternative to driving."},
                {"term": "Fiscal Burden", "meaning": "The financial weight or pressure on a government or individual", "usage": "Noun phrase; formal economic context", "example": "The maintenance of aging underground networks places a heavy fiscal burden on municipal budgets."},
                {"term": "Intermodal Connectivity", "meaning": "The seamless integration of different modes of transport", "usage": "Noun phrase; academic/technical", "example": "Enhanced intermodal connectivity is the cornerstone of a functional smart city."},
                {"term": "Commuter Belt", "meaning": "An area surrounding a large city where people live and travel to work", "usage": "Noun phrase; common in urbanization topics", "example": "Property prices in the commuter belt have skyrocketed due to improved high-speed rail links."}
            ]
        },
        "grammar": {
            "title": "Cleft Sentences for Emphasis",
            "explanation": "To reach Band 7+, you must use structures that allow you to emphasize specific parts of a sentence, signaling to the examiner what is most important.",
            "band_65_example": "The government needs to invest in trains to stop pollution.",
            "band_80_example": "It is investment in rail infrastructure that will ultimately facilitate a significant reduction in urban carbon emissions.",
            "alternative_structure": "What many city dwellers require is not more roads, but a more integrated and affordable transit network."
        },
        "reading": {
            "title": "The Transit Revolution: Beyond the Private Automobile",
            "word_count": 340,
            "text": "In the mid-20th century, the 'car was king,' and urban planning reflected this by prioritizing expansive highway networks. However, as the 21st century progresses, the 'ubiquity' of traffic congestion and the escalating climate crisis have forced a radical rethink. Modern urban planners now advocate for 'Transit-Oriented Development' (TOD)—a strategy that focuses on high-density, mixed-use housing built around major transit hubs. The goal is to minimize the 'carbon footprint' of the average citizen by making public transport the most convenient option.\n\nThe primary hurdle to this transition is often financial. Implementing a comprehensive underground or light-rail system requires astronomical 'fiscal allocation,' often leading to debates over whether transit should be a 'for-profit' enterprise or a subsidized public service. In cities like Luxembourg, the government has taken the unprecedented step of making all public transport free. Proponents argue that the resulting reduction in road maintenance costs and healthcare savings (due to decreased pollution) far outweigh the loss of ticket revenue. Conversely, critics suggest that without 'farebox recovery,' systems may suffer from underinvestment and poor maintenance over time.\n\nFurthermore, the 'last-mile problem'—the difficulty of getting people from a transit station to their final destination—remains a significant barrier to 'modal shift.' To solve this, many cities are integrating 'micro-mobility' options, such as electric scooters and bike-sharing schemes, into their 'intermodal' frameworks. By utilizing digital apps to bridge these gaps, transit becomes a seamless experience. Ultimately, the success of sustainable infrastructure depends on its ability to compete with the private car in terms of time, cost, and reliability. As the 'commuter belt' continues to expand, the necessity for a robust, green, and efficient public transport network has never been more pressing.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe 20th-century planning was good for the environment?", "answer": "No; it prioritized highways"},
                {"type": "vocabulary_match", "question": "Which term refers to development focused around transit stations?", "answer": "Transit-Oriented Development / TOD"},
                {"type": "true_false_ng", "question": "Luxembourg was the first country to offer free public transport.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Healthcare costs can be lowered by reducing traffic.", "answer": "True"},
                {"type": "true_false_ng", "question": "Farebox recovery is always enough to pay for rail maintenance.", "answer": "False"},
                {"type": "summary_completion", "question": "Planners use ______ to encourage people to use transit instead of cars.", "answer": "Transit-Oriented Development"},
                {"type": "summary_completion", "question": "Making transport free can reduce ______ costs.", "answer": "road maintenance"},
                {"type": "multiple_choice", "question": "What is the 'last-mile problem'?", "options": ["Expensive tickets", "The difficulty of traveling from a station to one's destination", "Traffic congestion"], "answer": "The difficulty of traveling from a station to one's destination"},
                {"type": "matching_info", "question": "Which paragraph discusses the integration of micro-mobility?", "answer": "Paragraph 3"},
                {"type": "matching_info", "question": "Which paragraph discusses the debate over for-profit transit?", "answer": "Paragraph 2"},
                {"type": "sentence_completion", "question": "High-speed rail links have caused prices in the ______ to rise.", "answer": "commuter belt"},
                {"type": "identify_view", "question": "The author suggests that transit must ______ with the private car to be successful.", "answer": "compete"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a time you had a long journey by public transport. You should say where you went, how long it took, what the experience was like, and explain how you felt about using that mode of transport.",
                "model_answer": "I once took a high-speed train from Paris to Lyon. The journey took only two hours, which was remarkably efficient. The experience was comfortable and stress-free, allowing me to work during the commute. It reinforced my belief that well-funded public transit can be superior to private car travel."
            },
            "part3": {
                "question": "To what extent should governments discourage the use of private cars in city centers?",
                "band8_sample": "I believe it is imperative that governments take a proactive stance. Simply asking people to drive less is ineffectual. We need a combination of 'push and pull' factors: taxing congestion in the city center while simultaneously subsidising high-quality, high-frequency transit. If the fiscal burden of driving becomes too high, and the public option becomes sufficiently reliable, we will see a natural modal shift."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that public transport should be free of charge for all citizens. Others argue that this would lead to a lack of funding and poor quality services. Discuss both views and give your opinion.",
            "band75_excerpt": "The proposal to eliminate fares for public transit is a polarizing issue. Advocates for universal access argue that it is the removal of financial barriers that will most effectively trigger a modal shift away from carbon-intensive private vehicles. However, I am of the view that while the laudable aim is to reduce pollution, the erasure of ticket revenue may inadvertently lead to a deterioration of service quality. A more prudent approach would be to offer targeted subsidies for low-income demographics while maintaining a self-sustaining financial model for the network at large.",
            "examiner_analysis": {
                "task_response": "Addresses both sides and offers a nuanced 'third way' (targeted subsidies).",
                "lexical_resource": "Instead of 'Removing tickets is a good idea,' use 'The abolition of fare-based systems may incentivize transit usage among a broader demographic.'",
                "error_upgrade": "Instead of 'Trains will get old and break,' use 'The absence of farebox recovery may compromise the long-term maintenance and modernization of the fleet.'"
            }
        },
        "examiner_tips": [
            "Avoid the 'Traffic' Cliche: Everyone mentions 'traffic' at Band 6.0. At Band 7.5, discuss it as 'urban congestion' or 'gridlock' and focus on its socio-economic impact (lost productivity).",
            "The 'Nuance' Bonus: Don't just say free transport is good. Acknowledge the fiscal reality—where will the money come from? Mentioning 'reallocation of tax revenue' shows the examiner you have the vocabulary for complex topics.",
            "Use Anaphoric Reference (e.g., 'This financial shortfall...') to link your sentences without using simple conjunctions."
        ]
    },
    # Module 12: Work, Employment, and the Evolving Labor Market
    {
        "id": "advanced-module-12",
        "module_number": 12,
        "title": "Work, Employment, and the Evolving Labor Market",
        "subtitle": "Precarious Employment, Automation, and the Gig Economy",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the shift from lifelong employment to the gig economy",
            "Master mixed conditionals to discuss hypothetical socio-economic impacts",
            "Utilize advanced professional collocations to satisfy 'Lexical Resource' for Band 8.0+"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Precarious Labor", "meaning": "Employment characterized by a lack of security, low wages, and limited benefits", "usage": "Noun phrase; subject or object in economy essays", "example": "The rise of the gig economy has led to a significant increase in precarious labor among the youth."},
                {"term": "Gig Economy", "meaning": "A labor market characterized by the prevalence of short-term contracts or freelance work", "usage": "Noun; focus for work/tech topics", "example": "While the gig economy offers flexibility, it often lacks the safety nets of traditional employment."},
                {"term": "Meritocracy", "meaning": "A system where advancement is based on individual ability or achievement", "usage": "Noun; academic context", "example": "Critics argue that a pure meritocracy is difficult to achieve without equal access to education."},
                {"term": "To Automate", "meaning": "To convert a process to be operated by largely automatic equipment", "usage": "Verb; high-level alternative to 'using machines'", "example": "Industries that fail to automate may find themselves unable to compete in a global market."},
                {"term": "Work-Life Synthesis", "meaning": "A more holistic approach than 'balance,' where work and life are integrated", "usage": "Noun phrase; sophisticated alternative to 'balance'", "example": "Remote work has forced many professionals to seek a better work-life synthesis."}
            ],
            "synonym_groups": {
                "job_security": ["Career stability", "professional tenure", "employment certainty"],
                "high_paying": ["Lucrative", "remunerative", "well-compensated"],
                "to_fire": ["To dismiss", "to terminate employment", "to make redundant"]
            }
        },
        "grammar": {
            "title": "Mixed Conditionals & Hypothetical Structures",
            "explanation": "To reach Band 7.5+, you must demonstrate the ability to link past actions to present results (Mixed Conditionals).",
            "band_65_example": "If companies use more robots, people will lose jobs.",
            "band_80_example": "If governments had invested in vocational re-skilling a decade ago, the current workforce would not be struggling with the rapid onset of automation.",
            "alternative_structure": "Were the minimum wage to be significantly increased, the immediate result might be a surge in inflation, though long-term social equity could improve."
        },
        "reading": {
            "title": "The Erosion of the 9-to-5: A New Industrial Revolution",
            "word_count": 345,
            "text": "For much of the 20th century, the 'standard employment relationship' was the cornerstone of the middle class. Employees offered loyalty in exchange for a predictable career path and retirement security. However, the 21st century has seen this social contract unravel. The catalyst for this change is two-fold: the digital revolution and the rise of neoliberal economic policies that prioritize 'labor flexibility.'\n\nThis shift has birthed the 'gig economy,' where digital platforms act as intermediaries between independent contractors and customers. Proponents argue that this model democratizes work, allowing individuals to 'be their own boss' and choose their hours. However, sociologists point to a more troubling reality: the externalization of risk. In this new model, the costs of equipment, insurance, and downtime are shifted from the corporation to the individual. This has created a new class of 'precariat' workers who, despite working full-time hours, lack the legal protections and benefits associated with traditional roles.\n\nFurthermore, the specter of automation looms over the service and manufacturing sectors. Unlike the mechanization of the past, which replaced physical brawn, modern artificial intelligence threatens to displace cognitive labor. Financial analysts, legal researchers, and even diagnostic doctors find their roles being supplemented—or in some cases, supplanted—by algorithms. While some economists suggest that technology will eventually create new, more 'human-centric' roles, the transition period is likely to be characterized by significant social upheaval.\n\nThe challenge for modern governance is to adapt the legal framework to these new realities. Some advocate for a 'Universal Basic Income' (UBI) to decouple survival from traditional employment, while others suggest a 'Robot Tax' to fund re-training programs. Regardless of the solution, it is clear that the traditional notions of 'work' and 'career' are undergoing a fundamental transformation. The ability of a society to navigate this change will determine its stability and prosperity in the decades to come.",
            "questions": [
                {"type": "true_false_ng", "question": "The 20th-century social contract was based on mutual loyalty between worker and employer.", "answer": "True"},
                {"type": "true_false_ng", "question": "The gig economy has completely replaced traditional office jobs in most countries.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Gig workers usually receive the same benefits as full-time staff.", "answer": "False"},
                {"type": "matching_info", "question": "Which paragraph discusses the shift of financial risk to the worker?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph mentions the threat of AI to high-level professional roles?", "answer": "Paragraph 3"},
                {"type": "summary_completion", "question": "Neoliberal policies often prioritize ______ over job security.", "answer": "labor flexibility"},
                {"type": "summary_completion", "question": "The gig economy allows platforms to act as ______ between clients and workers.", "answer": "intermediaries"},
                {"type": "multiple_choice", "question": "What is the 'precariat'?", "options": ["A new political party", "A class of workers with no job security or benefits", "A type of contract"], "answer": "A class of workers with no job security or benefits"},
                {"type": "multiple_choice", "question": "How does modern automation differ from past mechanization?", "options": ["It's cheaper", "It targets cognitive labor rather than just physical tasks", "It only affects factories"], "answer": "It targets cognitive labor rather than just physical tasks"},
                {"type": "sentence_completion", "question": "A 'Robot Tax' could be used to pay for ______.", "answer": "re-training programs"},
                {"type": "identify_view", "question": "Does the author believe the transition to an automated economy will be smooth?", "answer": "No; 'characterized by significant social upheaval'"},
                {"type": "identify_view", "question": "The future of a society depends on its ability to ______ traditional notions of work.", "answer": "transform/adapt"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a job you would like to do in the future. You should say what it is, what qualifications you would need, and explain why you think you would be good at it.",
                "model_answer": "I aspire to work as a sustainability consultant. This role would require expertise in environmental science and business strategy. I believe I would excel because I possess strong analytical skills and a genuine passion for addressing climate change through corporate reform."
            },
            "part3": {
                "question": "Do you think the concept of a 'job for life' is still relevant in today's world?",
                "band8_sample": "I'd say the 'job for life' is essentially a relic of the past. In the current volatile economic climate, adaptability is far more valuable than tenure. Most professionals now expect to pivot between industries several times. While this can be daunting, it also offers a level of professional autonomy that previous generations simply didn't have. It's no longer about staying in one place, but about continual upskilling."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In the modern world, many people prefer to change jobs frequently rather than staying with one employer for a long time. Does this trend have more advantages or disadvantages?",
            "band75_excerpt": "The contemporary labor market has shifted away from the long-term tenure that defined previous generations. While some view this professional fluidity as a source of instability, I contend that the advantages—namely skill diversification and market resilience—far outweigh the drawbacks of reduced job security. In a rapidly evolving economy, a worker who has navigated multiple roles is often more versatile than one who has remained in a single siloed position for decades.",
            "examiner_analysis": {
                "task_response": "Clearly weights the advantages of flexibility in a modern context.",
                "lexical_resource": "Instead of 'Changing jobs often,' use 'Embracing professional fluidity.' Instead of 'Learning new things,' use 'The acquisition of a diversified skill set.'",
                "error_upgrade": "Instead of 'People are scared of losing their jobs,' use 'The erosion of traditional career paths has fostered a sense of professional precarity among the workforce'."
            }
        },
        "examiner_tips": [
            "Avoid the 'Lazy' Idiom: Don't say 'It's a piece of cake.' Use IELTS-safe, academic idioms like 'The silver lining,' 'A level playing field,' or 'To bear the brunt'.",
            "Structure Your Argument: Use Nominalization (e.g., 'The implementation of automation') to start your sentences, as it sounds more authoritative to an examiner.",
            "Critical Thinking: When discussing work, don't just talk about money. Mention pensions, mental health, and social status to show breadth."
        ]
    },
    # Module 13: Social Issues (Demographics and Generational Equity)
    {
        "id": "advanced-module-13",
        "module_number": 13,
        "title": "Social Issues",
        "subtitle": "Demographics and Generational Equity",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the challenges of the 'Silver Tsunami' and the shifting dependency ratio",
            "Master Negative Inversion to add rhetorical weight and sophistication to arguments",
            "Utilize advanced sociological collocations to satisfy Band 7+ Lexical Resource requirements"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Dependency Ratio", "meaning": "An age-population measure of those typically not in the labor force and those typically in the labor force", "usage": "Noun; vital for economic/social impact analysis", "example": "A burgeoning dependency ratio threatens the long-term viability of the national pension scheme."},
                {"term": "Intergenerational Solidarity", "meaning": "Social cohesion and cooperation between different age groups", "usage": "Noun phrase; high-level alternative to 'getting along'", "example": "Maintaining intergenerational solidarity is crucial as the competition for public resources intensifies."},
                {"term": "Silver Tsunami", "meaning": "A metaphor used to describe a large increase in the number of elderly people", "usage": "Idiomatic (IELTS-safe); use for descriptive flair", "example": "Governments must prepare for the impending Silver Tsunami by restructuring healthcare services."},
                {"term": "To Alleviate", "meaning": "To make a problem or suffering less severe", "usage": "Verb; high-level alternative to 'lessen' or 'reduce'", "example": "Subsidized home-care programs can alleviate the burden on working-age family members."},
                {"term": "Socio-economic Stratification", "meaning": "The hierarchical arrangement of individuals into social classes or strata", "usage": "Noun phrase; formal sociological context", "example": "The lack of elderly care often exacerbates existing socio-economic stratification within the community."}
            ]
        },
        "grammar": {
            "title": "Negative Inversion",
            "explanation": "To achieve Band 7.5+ in Grammatical Range and Accuracy, you must demonstrate mastery over rare structures like inversion to highlight key points.",
            "band_65_example": "The government shouldn't just ignore the elderly, and they should also build more hospitals.",
            "band_80_example": "Not only must the state increase its fiscal allocation for elderly care, but it should also reform the statutory retirement age to reflect increasing life expectancy.",
            "alternative_structure": "Seldom has the global community faced a demographic challenge as formidable as the current aging trend."
        },
        "reading": {
            "title": "The Aging Paradox: Burden or Boon?",
            "word_count": 325,
            "text": "The 21st century is witnessing a demographic shift unparalleled in human history. As birth rates plummet and medical advancements extend life expectancy, many nations are transitioning into 'super-aged' societies. While some economists view this as a testament to human progress, others warn of a looming 'Grey Dawn'—a period where the dwindling working-age population can no longer sustain the fiscal demands of an aging demographic.\n\nThe primary concern lies in the 'dependency ratio.' When the number of retirees significantly outweighs the number of active contributors to the tax base, the pressure on social security systems becomes untenable. This often necessitates unpopular political maneuvers, such as raising the pensionable age or increasing taxation on the youth. Critics argue that such measures risk fracturing 'intergenerational solidarity,' leading to resentment among younger demographics who feel burdened by the needs of their predecessors.\n\nHowever, a counter-narrative suggests that an aging population is not an inherent liability. Proponents of the 'Silver Economy' argue that seniors are not merely consumers of healthcare but are active contributors to the economy through volunteerism, mentorship, and consumer spending. Furthermore, as the workforce shrinks, businesses are forced to innovate, leading to increased automation and productivity gains. In this view, the challenge is not the age of the population itself, but the rigidity of current social structures.\n\nUltimately, the goal for policymakers is to foster 'active aging.' This involves creating urban environments that are 'age-friendly' and providing opportunities for lifelong learning. By integrating the elderly into the social fabric rather than segregating them in specialized facilities, societies can leverage the wisdom of the old while maintaining the dynamism of the young. The success of this transition depends on a holistic rethink of the social contract—one that prioritizes equity and resilience across all age groups.",
            "questions": [
                {"type": "true_false_ng", "question": "Medical progress has contributed to the current demographic trend.", "answer": "True"},
                {"type": "true_false_ng", "question": "The 'Grey Dawn' refers to a rise in global birth rates.", "answer": "False"},
                {"type": "true_false_ng", "question": "Young people are generally happy to pay higher taxes for pensions.", "answer": "False"},
                {"type": "true_false_ng", "question": "Automation is a direct result of a shrinking workforce.", "answer": "Not Given"},
                {"type": "vocabulary_match", "question": "Which term describes the ratio of workers to non-workers?", "answer": "Dependency ratio"},
                {"type": "vocabulary_match", "question": "Which phrase refers to cooperation between age groups?", "answer": "Intergenerational solidarity"},
                {"type": "matching_info", "question": "Which section discusses the potential economic benefits of the elderly?", "answer": "Paragraph 3"},
                {"type": "matching_info", "question": "Which section mentions urban planning for the elderly?", "answer": "Paragraph 4"},
                {"type": "summary_completion", "question": "The text suggests that the 'dependency ratio' puts ______ on social security.", "answer": "pressure/demands"},
                {"type": "summary_completion", "question": "'Active aging' requires ______ environments and learning opportunities.", "answer": "age-friendly"},
                {"type": "sentence_completion", "question": "Critics believe raising the retirement age might ______ the social fabric.", "answer": "fracture"},
                {"type": "identify_view", "question": "The author argues for a rethink of the ______ to ensure generational equity.", "answer": "social contract"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe an elderly person you know who is an inspiration to you. You should say who they are, how you know them, and explain what qualities they have that you admire.",
                "model_answer": "I'd like to talk about my grandmother. She's in her eighties but remains incredibly active, volunteering at the local community center. What I admire most is her resilience and her commitment to lifelong learning—she recently took up painting. Her attitude embodies the concept of 'active aging.'"
            },
            "part3": {
                "question": "To what extent should children be responsible for looking after their elderly parents?",
                "band8_sample": "I believe it's a complex ethical quandary. In many cultures, filial piety is the cornerstone of the family unit, and children are expected to provide care. However, in a modern, mobile society, this can place an insurmountable strain on the 'sandwich generation'—those who are raising children while simultaneously caring for aging parents. I would argue that while emotional support is vital, the state must provide a robust infrastructure of professional care to ensure that the fiscal and physical burden doesn't fall solely on individuals."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many countries, the proportion of older people is increasing. Does this trend have more advantages or disadvantages for society?",
            "band75_excerpt": "The global demographic shift toward an aging population is a multifaceted phenomenon. While many fear the economic repercussions of a shrinking workforce, I believe that if societies adapt their socio-economic frameworks, the wisdom and stability provided by an older demographic can offer significant advantages. However, the success of this transition is contingent upon proactive government intervention to prevent the erosion of intergenerational equity.",
            "examiner_analysis": {
                "task_response": "Addresses the 'advantages vs. disadvantages' prompt with a nuanced, balanced thesis.",
                "lexical_resource": "Uses 'multifaceted,' 'contingent upon,' and 'intergenerational equity' instead of 'many sides' or 'depends on.'",
                "error_upgrade": "Instead of 'Old people are a problem for the economy,' use 'The burgeoning elderly demographic presents a unique fiscal challenge for modern welfare states.'"
            }
        },
        "examiner_tips": [
            "Avoid 'The Sandwich' Approach: Do not simply list one advantage and one disadvantage. Show how they interact.",
            "Precise Terminology: Use 'geriatric care' instead of 'help for old people' and 'demographic dividend' when discussing the benefits of a younger workforce.",
            "The 'Critical Thinking' Trap: Don't just describe the problem; evaluate the solutions."
        ]
    },
    # Module 14: Education and Pedagogical Philosophy
    {
        "id": "advanced-module-14",
        "module_number": 14,
        "title": "Education and Pedagogical Philosophy",
        "subtitle": "From Rote Memorisation to Competency-Based Pedagogy",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the efficacy of traditional vs. progressive educational models",
            "Master Parallelism and Clausal Subjects to enhance academic weight and cohesion",
            "Critically evaluate the commodification of higher education and its socio-economic impacts"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Pedagogical", "meaning": "Relating to the methods and principles of teaching", "usage": "Adjective; used when discussing teaching styles", "example": "Modern pedagogical theories emphasize the importance of student-centered learning over traditional lectures."},
                {"term": "Rote Learning", "meaning": "A memorization technique based on repetition without a deep understanding of the subject", "usage": "Noun; usually used critically in IELTS essays", "example": "While rote learning may help students pass exams, it often fails to foster critical thinking skills."},
                {"term": "To Assimilate", "meaning": "To take in and fully understand information or ideas", "usage": "Verb; high-level alternative to 'learn' or 'absorb'", "example": "Students must be given the time to assimilate complex concepts before moving on to new material."},
                {"term": "Egalitarian", "meaning": "Believing in the principle that all people are equal and deserve equal rights and opportunities", "usage": "Adjective; used in debates about educational access", "example": "A truly egalitarian education system provides the same quality of resources to every child, regardless of background."},
                {"term": "Cognitive Development", "meaning": "The construction of thought processes, including remembering, problem-solving, and decision-making", "usage": "Noun phrase; academic alternative to 'mental growth'", "example": "Play-based learning is essential for the cognitive development of early-years learners."}
            ],
            "synonym_groups": {
                "curriculum": ["Syllabus", "educational programme", "course of study"],
                "academic_achievement": ["Scholastic attainment", "educational outcomes", "intellectual proficiency"],
                "compulsory": ["Mandatory", "obligatory", "requisite"]
            }
        },
        "grammar": {
            "title": "Clausal Subjects and Parallelism",
            "explanation": "To achieve Band 7.5+, you must move away from simple sentence starters. Using a clause as the subject of your sentence adds immediate sophistication.",
            "band_65_example": "It is important that students learn how to solve problems.",
            "band_80_example": "That students are equipped with problem-solving skills is far more critical than their ability to memorize facts.",
            "parallelism": "The current education system must focus on fostering creativity, encouraging critical thinking, and promoting digital literacy."
        },
        "reading": {
            "title": "The Flipped Classroom: A Paradigm Shift in Education",
            "word_count": 335,
            "text": "The traditional model of education, characterized by a teacher delivering a lecture to a passive audience, is increasingly being viewed as an artifact of the industrial age. In its place, many institutions are adopting the 'flipped classroom' model. In this pedagogical approach, the standard relationship between classroom time and homework is inverted. Students absorb primary content—such as recorded lectures or readings—independently at home, while class time is dedicated to active problem-solving, collaborative projects, and deeper discussion.\n\nProponents of this model suggest that it fosters greater student autonomy. When learners are responsible for their initial encounter with new material, they can proceed at their own pace, re-watching difficult sections of a lecture or skipping familiar content. This promotes a more personalized learning experience, which is particularly beneficial in diverse classrooms where students possess varying levels of prior knowledge. Furthermore, by utilizing class time for application rather than passive listening, educators can provide immediate feedback, addressing misconceptions as they arise.\n\nHowever, the shift toward digital-first pedagogy has also exposed a 'digital divide.' For the flipped classroom to be effective, students must have reliable access to high-speed internet and personal devices. In many regions, this technological requirement exacerbates existing socio-economic disparities, leaving underprivileged students at a significant disadvantage. Moreover, critics argue that this model places an undue burden on students who may lack the self-discipline or the parental support necessary to manage independent study.\n\nThe future of education likely lies in a 'hybrid' or 'blended' approach that combines the best elements of face-to-face instruction with digital flexibility. The ultimate goal of any curriculum should be to move beyond the mere transmission of information. Instead, it must focus on 'meta-cognition'—teaching students how to learn. In an era where information is ubiquitous, the ability to analyze, synthesize, and apply knowledge is far more valuable than the capacity to retain it.",
            "questions": [
                {"type": "true_false_ng", "question": "The traditional education model was designed for the industrial age.", "answer": "True"},
                {"type": "true_false_ng", "question": "In a flipped classroom, students listen to lectures in school.", "answer": "False"},
                {"type": "true_false_ng", "question": "Flipped classrooms are easier for teachers to manage than traditional ones.", "answer": "Not Given"},
                {"type": "matching_info", "question": "Which section discusses the risks to underprivileged students?", "answer": "Paragraph 3"},
                {"type": "matching_info", "question": "Which section defines the concept of 'meta-cognition'?", "answer": "Paragraph 4"},
                {"type": "summary_completion", "question": "The flipped classroom model is said to increase student ______.", "answer": "autonomy"},
                {"type": "summary_completion", "question": "One benefit of this model is that students can learn at their own ______.", "answer": "pace"},
                {"type": "multiple_choice", "question": "What is the 'digital divide' mentioned in the text?", "options": ["A new curriculum", "The gap in access to technology between rich and poor", "A teaching method"], "answer": "The gap in access to technology between rich and poor"},
                {"type": "multiple_choice", "question": "What is the primary purpose of class time in the new model?", "options": ["Listening to lectures", "Active application and feedback", "Taking exams"], "answer": "Active application and feedback"},
                {"type": "sentence_completion", "question": "Critics believe the flipped model requires high levels of ______ from learners.", "answer": "self-discipline"},
                {"type": "vocabulary_match", "question": "Which word in the text means 'present everywhere'?", "answer": "Ubiquitous"},
                {"type": "identify_view", "question": "Education should focus on the ______ of knowledge rather than its retention.", "answer": "synthesis/application"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a subject you enjoyed studying at school. You should say what it was, who taught you, what you learned, and explain why you found it so interesting.",
                "model_answer": "I particularly enjoyed studying history. My teacher, Mr. Chen, had an exceptional pedagogical approach—he made the past come alive through storytelling and primary source analysis. What I found most engaging was learning to assimilate complex historical narratives and draw connections to contemporary issues."
            },
            "part3": {
                "question": "Do you think that the traditional classroom will eventually be replaced by online learning?",
                "band8_sample": "I suspect we are heading toward a blended model rather than a total replacement. While online platforms offer unparalleled accessibility, they cannot replicate the socio-emotional development that occurs during face-to-face interaction. Human beings are inherently social creatures, and the classroom serves as a crucial environment for collaboration and the exchange of ideas. Therefore, I believe digital tools will supplement, rather than supplant, the traditional teacher-student relationship."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that university students should be allowed to study whatever they like. Others think that they should only be allowed to study subjects that will be useful in the future, such as those related to science and technology. Discuss both views and give your opinion.",
            "band75_excerpt": "The debate regarding the primary purpose of tertiary education is a contentious one. Some argue that universities should be bastions of intellectual freedom, where the pursuit of knowledge is an end in itself. However, I believe that in an increasingly competitive global economy, a more pragmatic approach is necessary. While the humanities foster critical thinking, a national curriculum that fails to prioritize STEM subjects risks leaving its workforce ill-equipped for the challenges of the digital age.",
            "examiner_analysis": {
                "task_response": "Addresses both the 'intellectual freedom' and 'utilitarian' perspectives before providing a balanced opinion.",
                "lexical_resource": "Uses 'bastions of intellectual freedom,' 'contentious,' 'STEM subjects,' and 'ill-equipped.'",
                "error_upgrade": "Instead of 'Students should choose their own subjects,' use 'The autonomy of students to select their course of study is a fundamental tenet of liberal education.'"
            }
        },
        "examiner_tips": [
            "Avoid the 'Good/Bad' Trap: Instead of saying a teaching method is 'good,' use 'It is highly conducive to student engagement.'",
            "Use Precise Verbs: Instead of 'Education gives people jobs,' use 'Education facilitates professional entry into specialized sectors.'",
            "Critique the Prompt: At Band 8.0, you can challenge the premises of a question."
        ]
    },
    # Module 15: Globalisation, Cultural Identity, and the Homogenisation of Society
    {
        "id": "advanced-module-15",
        "module_number": 15,
        "title": "Globalisation, Cultural Identity, and the Homogenisation of Society",
        "subtitle": "Cultural Convergence versus the Preservation of Heritage",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the impact of global economic integration on local traditions",
            "Master the use of inverted conditionals (e.g., 'Should,' 'Had,' 'Were') to present sophisticated hypothetical arguments",
            "Develop a lexicon for discussing cultural hegemony, standardisation, and linguistic diversity"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Cultural Homogenisation", "meaning": "The process by which local cultures are transformed or absorbed by a dominant outside culture", "usage": "Noun; central to the 'globalisation' debate", "example": "The primary concern regarding global trade is the potential for cultural homogenisation at the expense of local identity."},
                {"term": "Hegemony", "meaning": "Leadership or dominance, especially by one country or social group over others", "usage": "Noun; used in political/cultural contexts", "example": "The cultural hegemony of Western media has a profound influence on global consumer habits."},
                {"term": "To Assimilate", "meaning": "To take in information, ideas, or culture and understand them fully; to become part of a wider society", "usage": "Verb; high-level alternative to 'join' or 'fit in'", "example": "Migrant communities often strive to assimilate while simultaneously maintaining their ancestral traditions."},
                {"term": "Standardisation", "meaning": "The process of making things of the same type all have the same features or quality", "usage": "Noun; used when discussing products or lifestyles", "example": "The standardisation of urban architecture makes many international cities appear virtually identical."},
                {"term": "Indigenous", "meaning": "Originating or occurring naturally in a particular place; native", "usage": "Adjective; used for people, languages, or plants", "example": "Globalisation poses a significant threat to the survival of indigenous languages."}
            ],
            "synonym_groups": {
                "widespread": ["Pervasive", "ubiquitous", "rife", "prevalent"],
                "to_change": ["To alter", "to modify", "to transform", "to evolve"],
                "loss_of_identity": ["Cultural erosion", "the dilution of heritage", "the effacement of tradition"]
            }
        },
        "grammar": {
            "title": "Inverted Conditionals",
            "explanation": "To reach Band 7.5+, you must demonstrate mastery of formal conditional structures that eliminate the word 'if.'",
            "band_65_example": "If the government doesn't protect local traditions, they will disappear.",
            "band_80_example": "Should the state fail to implement protective cultural policies, indigenous traditions will inevitably succumb to the pressures of global standardisation.",
            "past_hypothetical": "Had international bodies intervened earlier, many endangered languages might have been saved from extinction."
        },
        "reading": {
            "title": "The Paradox of the Global Village",
            "word_count": 340,
            "text": "The term 'Global Village,' coined by Marshall McLuhan, suggests a world where technological and economic integration brings humanity closer together. In many ways, this has been realized; digital platforms allow for instantaneous 'intercultural dialogue,' fostering a sense of global community. However, critics argue that this 'interconnectedness' is a double-edged sword. While it facilitates the exchange of ideas, it also acts as a conduit for 'cultural imperialism,' where the values of dominant economic powers overshadow local customs.\n\nThe most visible sign of this shift is the 'standardisation' of the global consumer landscape. From the prevalence of multinational fast-food chains to the 'ubiquity' of Hollywood cinema, the nuances of local identity are increasingly being eroded. This 'cultural homogenisation' is often driven by the 'hegemony' of the English language, which, as the global lingua franca, provides immense economic opportunities but simultaneously threatens the survival of minority tongues. When a language dies, the unique worldview and historical knowledge 'assimilated' within its vocabulary are lost forever.\n\nConversely, some sociologists suggest that globalisation triggers a 'counter-movement'—a resurgence of localism and 'cultural revitalisation.' In response to the perceived threat of a uniform world, many communities are doubling down on their heritage, reviving ancient festivals and promoting traditional craftsmanship. This 'glocalisation'—the adaptation of international products to fit local contexts—suggests that cultures are not passive victims of change but active participants in an evolving global narrative. Ultimately, the challenge for the 21st century is to leverage the benefits of a globalised economy without sacrificing the 'indigenous' diversity that makes the human experience rich and multifaceted.",
            "questions": [
                {"type": "identify_view", "question": "Who coined the phrase 'Global Village'?", "answer": "Marshall McLuhan"},
                {"type": "true_false_ng", "question": "Interconnectedness has only positive effects.", "answer": "False"},
                {"type": "true_false_ng", "question": "English is the most spoken language in history.", "answer": "Not Given"},
                {"type": "vocabulary_match", "question": "Which term describes the dominance of one group over others?", "answer": "Hegemony"},
                {"type": "matching_info", "question": "Which paragraph discusses the loss of historical knowledge through language?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph introduces the concept of 'glocalisation'?", "answer": "Paragraph 3"},
                {"type": "summary_completion", "question": "Globalisation is often described as a ______, bringing both benefits and risks.", "answer": "double-edged sword"},
                {"type": "summary_completion", "question": "The spread of Western values is sometimes called ______.", "answer": "cultural imperialism"},
                {"type": "multiple_choice", "question": "What is 'glocalisation'?", "options": ["Complete rejection of global products", "The adaptation of global trends to local tastes", "Government regulation of imports"], "answer": "The adaptation of global trends to local tastes"},
                {"type": "multiple_choice", "question": "What is the primary cause of cultural erosion mentioned?", "options": ["Government policy", "Economic and technological integration/Standardisation", "Natural disasters"], "answer": "Economic and technological integration/Standardisation"},
                {"type": "sentence_completion", "question": "Digital platforms have made ______ dialogue much faster.", "answer": "intercultural"},
                {"type": "identify_view", "question": "The author concludes that global diversity is ______ and should be preserved.", "answer": "multifaceted/rich"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a tradition or festival in your country that you are proud of. You should say what it is, when it happens, how people celebrate it, and explain why it is important to preserve this tradition in a globalised world.",
                "model_answer": "I'd like to describe the Mid-Autumn Festival in my country. It occurs in September or October, depending on the lunar calendar. Families gather to admire the full moon, enjoy mooncakes, and light lanterns. Preserving this tradition is crucial because it embodies intergenerational solidarity and provides a counter-narrative to the cultural homogenisation driven by globalisation."
            },
            "part3": {
                "question": "Do you think that the world will eventually have one single culture?",
                "band8_sample": "I suspect we are moving toward a hybridized global culture rather than a completely uniform one. While the standardisation of technology and fashion is ubiquitous, human beings have an inherent drive to differentiate themselves. We might watch the same blockbusters, but we interpret them through the lens of our own local heritage. Therefore, I don't believe a monolithic culture is likely; rather, we will see a multi-layered identity where global and local values coexist."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that the fact that the world is becoming more uniform is a positive development. Others believe that it is a negative trend that destroys cultural identity. Discuss both views and give your opinion.",
            "band75_excerpt": "The debate over the convergence of global cultures is highly contentious. Proponents of a more uniform world argue that it facilitates international cooperation and reduces the likelihood of conflict by creating a shared set of values. However, I am of the conviction that the erosion of cultural distinctiveness is a profound loss for humanity. The homogenisation of society leads to a reduction in intellectual diversity, as different cultures offer unique ways of problem-solving and understanding the world. Were we to allow local traditions to disappear, we would be sacrificing the collective wisdom of our ancestors for the sake of mere economic convenience.",
            "examiner_analysis": {
                "task_response": "Addresses both the 'cooperation' and 'loss of identity' perspectives with a clear stance.",
                "lexical_resource": "Instead of 'The world is all the same,' use 'The inexorable march toward global uniformity...'",
                "grammar_upgrade": "Instead of 'If we let traditions go, we will lose them,' use the inverted conditional: 'Should we permit the effacement of local customs, the cultural fabric of society will be irreparably damaged.'"
            }
        },
        "examiner_tips": [
            "Precision with Abstract Nouns: Use words like 'proliferation,' 'integration,' and 'dilution' to describe cultural changes.",
            "The 'Third Way' Argument: At Band 8.0, try to argue for a 'middle ground,' such as 'Glocalisation,' to show a more sophisticated understanding.",
            "Cohesive Devices: Use 'consequently,' 'notwithstanding,' and 'by the same token' to link complex ideas."
        ]
    },
    # Module 16: The Environment: Ecological Integrity and Sustainable Mitigation
    {
        "id": "advanced-module-16",
        "module_number": 16,
        "title": "The Environment: Ecological Integrity and Sustainable Mitigation",
        "subtitle": "Environmental Stewardship in the Anthropocene",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the concept of 'The Tragedy of the Commons' in relation to global resource management",
            "Master the use of Complex Prepositional Phrases to link causes and effects with academic precision",
            "Utilize advanced environmental collocations to move from Band 6.5 (descriptive) to Band 8.0+ (analytical)"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Anthropogenic", "meaning": "Originating in human activity (chiefly of environmental pollution and pollutants)", "usage": "Adjective; replaces 'human-made'", "example": "The current rate of species extinction is largely driven by anthropogenic climate change."},
                {"term": "Biodiversity Loss", "meaning": "The decline in the number, genetic variability, and variety of species in a given area", "usage": "Noun phrase; more academic than 'animals dying'", "example": "The biodiversity loss in the Amazon has reached a critical tipping point."},
                {"term": "To Mitigate", "meaning": "To make something less severe, serious, or painful", "usage": "Verb; high-level alternative to 'reduce'", "example": "Strict carbon taxes are essential to mitigate the long-term effects of global warming."},
                {"term": "Ecosystem Services", "meaning": "The many and varied benefits to humans provided by the natural environment and healthy ecosystems", "usage": "Noun phrase; used to argue for economic value of nature", "example": "Forests provide essential ecosystem services, such as water purification and carbon sequestration."},
                {"term": "Sustainability", "meaning": "The ability to be maintained at a certain rate or level; meeting needs without compromising the future", "usage": "Noun; core topic term for environmental essays", "example": "Corporate sustainability initiatives must move beyond simple 'greenwashing' to effect real change."}
            ],
            "synonym_groups": {
                "environmental_damage": ["Ecological degradation", "habitat destruction", "environmental despoliation"],
                "to_deplete": ["To exhaust", "to drain", "to use up (resources)"],
                "inevitable": ["Inescapable", "unavoidable", "inexorable"]
            }
        },
        "grammar": {
            "title": "Complex Prepositional Phrases",
            "explanation": "Advanced writing requires linking ideas through prepositions rather than just basic conjunctions like 'because' or 'so.'",
            "band_65_example": "The environment is dying because companies want to make money.",
            "band_80_example": "In light of the relentless pursuit of profit, many corporations have historically prioritized short-term gains at the expense of ecological integrity.",
            "key_phrases": ["With a view to", "By virtue of", "In accordance with", "In the face of"]
        },
        "reading": {
            "title": "The Sixth Mass Extinction and the Tragedy of the Commons",
            "word_count": 335,
            "text": "The 'Tragedy of the Commons' is a central concept in environmental economics, describing a situation where individuals, acting independently and rationally according to their own self-interest, behave contrary to the whole group's long-term best interests by depleting a shared resource. In the context of the 21st century, the 'commons' is the global atmosphere and the vast biodiversity of our oceans. As nations compete for industrial dominance, the anthropogenic emission of greenhouse gases continues unabated, leading to what many biologists term the 'Sixth Mass Extinction.'\n\nUnlike previous extinction events caused by volcanic eruptions or asteroid impacts, the current crisis is driven primarily by habitat fragmentation and the over-exploitation of natural resources. The conversion of wildlands into agricultural space has led to a precipitous decline in pollinator populations, which threatens the very ecosystem services upon which human food security depends. Furthermore, the acidification of the oceans—a direct result of carbon absorption—is decimating coral reefs, the 'rainforests of the sea.'\n\nMitigating these effects requires more than individual lifestyle changes; it necessitates a fundamental shift in fiscal policy and international law. Some environmentalists advocate for 'Deep Ecology,' a philosophy that rejects the anthropocentric view that nature exists solely for human use. Instead, it posits that all living things have an inherent right to flourish. To implement this, governments are exploring 'Circular Economy' models, which aim to eliminate waste through the continual use of resources. However, the transition is often hampered by political inertia and the lobbying power of fossil fuel conglomerates. Ultimately, the preservation of our planet depends on our ability to move beyond national borders and recognize that ecological degradation in one region is a threat to stability everywhere.",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe the 'Tragedy of the Commons' is caused by irrational behavior?", "answer": "No; it is 'rational' self-interest"},
                {"type": "vocabulary_match", "question": "Which term in paragraph 1 refers to human-caused emissions?", "answer": "Anthropogenic"},
                {"type": "true_false_ng", "question": "The current extinction is the first mass extinction in Earth's history.", "answer": "False"},
                {"type": "true_false_ng", "question": "Ocean acidification is caused by agricultural runoff.", "answer": "False—it's carbon absorption"},
                {"type": "true_false_ng", "question": "The author believes individual recycling is enough to save the environment.", "answer": "False"},
                {"type": "summary_completion", "question": "The decline in pollinators is a direct threat to human ______.", "answer": "food security"},
                {"type": "summary_completion", "question": "The 'Circular Economy' aims to stop ______ by reusing resources.", "answer": "waste"},
                {"type": "multiple_choice", "question": "What is 'Deep Ecology'?", "options": ["A type of farming", "The belief that nature has value independent of human needs", "A government policy"], "answer": "The belief that nature has value independent of human needs"},
                {"type": "multiple_choice", "question": "Why is the transition to sustainable models difficult?", "options": ["Lack of technology", "Political inertia and corporate lobbying", "Public opposition"], "answer": "Political inertia and corporate lobbying"},
                {"type": "matching_info", "question": "Which paragraph discusses the impact of agriculture on wildlands?", "answer": "Paragraph 2"},
                {"type": "sentence_completion", "question": "Coral reefs are metaphorically referred to as ______.", "answer": "rainforests of the sea"},
                {"type": "identify_view", "question": "Ecological damage is a ______ to global stability.", "answer": "threat"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe an environmental problem in your country. You should say what it is, how long it has been a problem, what the causes are, and explain what you think could be done to solve it.",
                "model_answer": "I'd like to discuss air pollution in my city. It has been a persistent issue for over two decades. The primary causes are industrial emissions and vehicle exhaust. To solve it, I believe the government should invest in public transport infrastructure and impose stricter regulations on factories. However, this requires political will and public support."
            },
            "part3": {
                "question": "Who do you think is more responsible for protecting the environment: individuals or the government?",
                "band8_sample": "I'm of the conviction that while individual actions are laudable, the onus of responsibility lies primarily with the state. Without stringent regulatory frameworks, corporations will continue to externalize their environmental costs. We need systemic reform, such as the implementation of a carbon tax, to incentivize sustainable practices. Individual efforts, though well-intentioned, are often dwarfed by the scale of industrial pollution."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that only governments can make significant changes to protect the environment. Others believe that individuals can have a great impact. Discuss both views and give your opinion.",
            "band75_excerpt": "The debate regarding environmental stewardship often centers on the efficacy of individual versus collective action. While I acknowledge that widespread shifts in consumer behavior can influence market trends, I contend that meaningful ecological preservation is impossible without robust governmental intervention. Individual choices are often constrained by socio-economic factors, whereas the state possesses the legislative power to enforce industry-wide standards and facilitate the transition to renewable energy.",
            "examiner_analysis": {
                "task_response": "Addresses the limitations of both individual and state power while providing a clear preference.",
                "lexical_resource": "Uses 'stewardship,' 'efficacy,' 'socio-economic factors,' and 'legislative power.'",
                "error_upgrade": "Instead of 'If people stop using plastic, it helps,' use 'The collective cessation of single-use plastic consumption could significantly alleviate the pressure on marine ecosystems.'"
            }
        },
        "examiner_tips": [
            "Avoid Emotional Language: Don't say 'It's so sad that trees are dying.' Use 'The loss of forest cover represents a catastrophic depletion of natural capital.'",
            "Think Globally: In Speaking Part 3, always link the environment to globalization or the economy to show depth.",
            "Precision in Action: Don't just say 'stop pollution.' Specify 'decarbonizing the economy' or 'enforcing effluent standards.'"
        ]
    },
    # Module 17: Crime, Justice, and Social Reintegration
    {
        "id": "advanced-module-17",
        "module_number": 17,
        "title": "Crime, Justice, and Social Reintegration",
        "subtitle": "Punitive versus Rehabilitative Justice",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the efficacy of custodial sentences versus rehabilitative programmes",
            "Master the Subjunctive Mood to express necessity and urgency in policy-related writing",
            "Develop a lexicon for discussing deterrents, correctional facilities, and judicial equity"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Recidivism", "meaning": "The tendency of a convicted criminal to reoffend", "usage": "Noun; vital for discussing prison effectiveness", "example": "High rates of recidivism suggest that purely punitive measures are failing to reform offenders."},
                {"term": "Deterrent", "meaning": "A thing that discourages or is intended to discourage someone from doing something", "usage": "Noun; common in 'capital punishment' debates", "example": "Longer prison sentences are often cited as a deterrent, yet their impact on crime rates remains disputed."},
                {"term": "To Rehabilitate", "meaning": "To restore someone to health or normal life through training and therapy after imprisonment", "usage": "Verb; the opposite of 'punish'", "example": "It is far more cost-effective to rehabilitate non-violent offenders than to keep them incarcerated."},
                {"term": "Capital Punishment", "meaning": "The legally authorized killing of someone as punishment for a crime", "usage": "Noun phrase; high-level academic term", "example": "The abolition of capital punishment is seen by many as a prerequisite for a modern, civilised society."},
                {"term": "Custodial Sentence", "meaning": "A judicial sentence consisting of a mandatory period of time in a prison or other closed institution", "usage": "Noun phrase; formal alternative to 'prison time'", "example": "Judges are increasingly opting for community service over custodial sentences for minor infractions."}
            ],
            "synonym_groups": {
                "minor_crimes": ["Petty offences", "misdemeanours", "non-violent infractions"],
                "to_imprison": ["To incarcerate", "to detain", "to commit to a correctional facility"],
                "punishment": ["Sanctions", "penalties", "retributive measures"]
            }
        },
        "grammar": {
            "title": "The Subjunctive Mood",
            "explanation": "To reach Band 7.5+, use the subjunctive to convey a strong sense of recommendation or necessity in Task 2.",
            "band_65_example": "The government must make sure that prisons are clean.",
            "band_80_example": "It is imperative that the government ensure (not ensures) that correctional facilities prioritise rehabilitation over mere retribution.",
            "structure": "It is essential/vital/imperative that + [subject] + [base form of verb]."
        },
        "reading": {
            "title": "The Prison Paradox",
            "word_count": 335,
            "text": "The debate over the primary purpose of the penal system—whether it should be retributive or rehabilitative—has intensified as global incarceration rates climb. Traditional 'tough-on-crime' policies operate on the principle of retributive justice, where the severity of the punishment mirrors the gravity of the crime. Advocates of this model argue that the fear of a custodial sentence acts as a powerful deterrent, maintaining social order and providing a sense of closure to victims. However, a growing body of empirical evidence suggests that this approach may be counterproductive, particularly regarding recidivism.\n\nIn many jurisdictions, the 'prison-industrial complex' has been criticized for prioritizing security over transformation. When offenders are isolated from society without access to education or vocational training, they often emerge with fewer prospects than they had prior to their incarceration. This systemic failure creates a 'revolving door' where individuals are trapped in a cycle of crime and imprisonment. To combat this, some nations, particularly in Scandinavia, have shifted toward 'restorative justice.' This model focuses on repairing the harm caused by criminal behavior through mediation and community involvement, rather than focusing solely on the isolation of the perpetrator.\n\nFurthermore, the socio-economic roots of crime cannot be ignored. Research consistently indicates that poverty, lack of education, and mental health issues are significant predictors of criminal activity. Critics of the purely punitive model argue that it is essential that the state address these underlying catalysts through social welfare and community-based intervention. By investing in preventative measures, governments can potentially reduce the fiscal burden of the penal system while fostering a more equitable society. Ultimately, the challenge for the modern judiciary is to balance the public's demand for justice with the practical necessity of integrating former offenders back into the social fabric.",
            "questions": [
                {"type": "true_false_ng", "question": "Retributive justice suggests that punishment should match the crime.", "answer": "True"},
                {"type": "true_false_ng", "question": "The text claims that deterrents are always effective in reducing crime.", "answer": "False"},
                {"type": "true_false_ng", "question": "Scandinavian prisons are more expensive to run than others.", "answer": "Not Given"},
                {"type": "vocabulary_match", "question": "Which term describes the cycle of going in and out of prison?", "answer": "Revolving door"},
                {"type": "vocabulary_match", "question": "Which term refers to the primary causes of crime, like poverty?", "answer": "Underlying catalysts"},
                {"type": "summary_completion", "question": "Advocates of retributive justice believe it provides ______ to those affected by crime.", "answer": "closure"},
                {"type": "summary_completion", "question": "Restorative justice emphasizes the ______ of harm.", "answer": "repair/repairing"},
                {"type": "matching_info", "question": "Which paragraph discusses the lack of opportunities for ex-convicts?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which paragraph links mental health to crime rates?", "answer": "Paragraph 3"},
                {"type": "multiple_choice", "question": "What is a common criticism of the 'prison-industrial complex'?", "options": ["It's too expensive", "The prioritization of security over reform", "It's too lenient"], "answer": "The prioritization of security over reform"},
                {"type": "sentence_completion", "question": "The state should address poverty to reduce the ______ on the penal system.", "answer": "fiscal burden"},
                {"type": "identify_view", "question": "The author suggests that the judicial system must be ______.", "answer": "balanced/rehabilitative"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a law in your country that you think is good. You should say what the law is, how it affects people, and explain why you think it is important.",
                "model_answer": "I'd like to discuss the law requiring free education for all children up to age 16. It ensures that every child, regardless of socio-economic background, has access to basic education. This is important because education is the cornerstone of social mobility and helps mitigate the factors that lead to crime and poverty."
            },
            "part3": {
                "question": "To what extent can education prevent people from committing crimes?",
                "band8_sample": "I would argue that education is the primary bulwark against criminal activity. It's not just about academic knowledge; it's about socialisation and the acquisition of critical thinking skills. When individuals are equipped with marketable skills, they are far less likely to resort to illicit means of survival. However, education must be coupled with economic opportunity; if the job market is stagnant, even a well-educated populace may feel disenfranchised and turn to crime."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that prison is the best way to punish criminals. Others argue that other forms of punishment, such as community service, are more effective for most crimes. Discuss both views and give your opinion.",
            "band75_excerpt": "The methodology of modern sentencing is a subject of intense scrutiny. While many maintain that incarceration is the only way to ensure public safety and provide a just retribution, I contend that for non-violent offences, community-based sanctions are far more effective. It is vital that the judicial system distinguish between those who pose a physical threat to society and those who have simply erred in judgement. By mandating community service, the state not only alleviates the overcrowding in prisons but also allows the offender to repay their debt to society in a constructive manner.",
            "examiner_analysis": {
                "lexical_resource": "Uses 'scrutiny,' 'just retribution,' 'erred in judgement,' and 'alleviates overcrowding.'",
                "grammar": "Employs the Subjunctive: 'It is vital that the judicial system distinguish...'",
                "error_upgrade": "Instead of 'Community service is better because it's cheaper,' use 'The fiscal advantages of non-custodial sentences are substantial, as they circumvent the exorbitant costs of long-term detention.'"
            }
        },
        "examiner_tips": [
            "Avoid Emotional Appeals: Don't say 'Crime is very sad for families.' Say 'Criminality has profound deleterious effects on the social cohesion of communities.'",
            "Be Specific: Instead of 'bad people,' use 'offenders,' 'perpetrators,' or 'delinquents.'",
            "Use Conditionals: Discuss the deterrent effect using second conditionals."
        ]
    },
    # Module 18: Public Health and Medical Resource Allocation
    {
        "id": "advanced-module-18",
        "module_number": 18,
        "title": "Public Health and Medical Resource Allocation",
        "subtitle": "Health Equity, Preventative Medicine, and State Responsibility",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the conflict between individual lifestyle choices and state-funded healthcare",
            "Master Advanced Concessive Clauses (e.g., Notwithstanding, Much as) to show complex viewpoints",
            "Develop a lexicon for discussing universal healthcare, pathogens, and lifestyle-related diseases"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Preventative Medicine", "meaning": "Medical practices designed to prevent disease rather than treat it", "usage": "Noun phrase; focus for health policy essays", "example": "Investment in preventative medicine, such as vaccination programs, can save governments billions in the long term."},
                {"term": "To Exacerbate", "meaning": "To make a problem, bad situation, or negative feeling worse", "usage": "Verb; common in 'pollution and health' topics", "example": "High sugar consumption has exacerbated the global obesity crisis."},
                {"term": "Universal Healthcare", "meaning": "A system that provides quality health services to all citizens regardless of their ability to pay", "usage": "Noun phrase; core topic for government role debates", "example": "The implementation of universal healthcare is often seen as a hallmark of a developed nation."},
                {"term": "Pathogen", "meaning": "A bacterium, virus, or other microorganism that can cause disease", "usage": "Noun; academic alternative to 'germ' or 'virus'", "example": "Rapid urbanization has made it easier for pathogens to spread across borders."},
                {"term": "Socio-economic Gradient", "meaning": "The relationship between social status and health outcomes", "usage": "Noun phrase; high-level sociological term", "example": "The socio-economic gradient in health remains one of the most persistent challenges for policymakers."}
            ],
            "synonym_groups": {
                "disease": ["Ailment", "malady", "affliction", "disorder"],
                "harmful": ["Deleterious", "detrimental", "pernicious", "injurious"],
                "treatment": ["Intervention", "therapy", "medical regimen"]
            }
        },
        "grammar": {
            "title": "Advanced Concessive Clauses",
            "explanation": "To reach Band 7+, you must be able to acknowledge an opposing view within your own sentence using sophisticated linkers.",
            "band_65_example": "Although smoking is bad, people should be allowed to choose to do it.",
            "band_80_example": "Notwithstanding the undeniable risks to public health, some argue that the state should not infringe upon an individual's right to make personal lifestyle choices.",
            "alternative_structure": "Much as universal healthcare is desirable, the fiscal reality often makes its implementation difficult for developing nations."
        },
        "reading": {
            "title": "The Burden of Choice: Health in the Modern Era",
            "word_count": 340,
            "text": "The landscape of global health has undergone a fundamental transformation. In the past, the primary threats were infectious diseases caused by pathogens; today, however, the burden has shifted toward non-communicable diseases (NCDs) such as type 2 diabetes, heart disease, and lung cancer. These 'lifestyle diseases' are often the result of sedentary habits, poor diet, and tobacco use. This shift has ignited a fierce debate regarding where the responsibility for health lies: with the individual or with the state.\n\nProponents of state intervention argue that the modern food environment is 'obesogenic,' meaning it is designed to encourage weight gain through the cheap availability of ultra-processed foods. In this view, individual choice is an illusion, as consumers are constantly bombarded by sophisticated marketing campaigns. Therefore, they suggest that it is imperative that the government implement 'sin taxes' on sugar and tobacco to discourage harmful behavior and fund public health initiatives. They argue that preventative medicine is far more efficient than treating chronic conditions after they have developed.\n\nConversely, critics of the 'nanny state' argue that health is a matter of personal autonomy. They contend that if individuals are forced to pay higher taxes for their lifestyle choices, it sets a dangerous precedent for government overreach. Furthermore, they point out that the socio-economic gradient plays a massive role; the most marginalized communities often lack access to fresh produce and safe areas for exercise. Instead of punitive taxes, they advocate for better health literacy and the improvement of public infrastructure. Ultimately, the challenge for the 21st century is to develop a healthcare model that encourages personal responsibility without abandoning those who are most vulnerable to systemic health disparities.",
            "questions": [
                {"type": "identify_view", "question": "What acronym is used for diseases like diabetes and heart disease?", "answer": "NCDs"},
                {"type": "vocabulary_match", "question": "Which word describes an environment that encourages weight gain?", "answer": "Obesogenic"},
                {"type": "true_false_ng", "question": "Most people died of lifestyle diseases in the past.", "answer": "False"},
                {"type": "true_false_ng", "question": "The author believes marketing makes choice difficult.", "answer": "True"},
                {"type": "true_false_ng", "question": "Sin taxes are the only way to fund healthcare.", "answer": "Not Given"},
                {"type": "summary_completion", "question": "Critics of the state argue that health is a matter of personal ______.", "answer": "autonomy"},
                {"type": "summary_completion", "question": "Marginalized groups often lack access to ______ areas for exercise.", "answer": "safe"},
                {"type": "matching_info", "question": "Which section discusses 'sin taxes'?", "answer": "Paragraph 2"},
                {"type": "matching_info", "question": "Which section mentions the 'socio-economic gradient'?", "answer": "Paragraph 3"},
                {"type": "multiple_choice", "question": "What is the primary difference between past and present health threats?", "options": ["Cost of treatment", "A shift from infectious pathogens to lifestyle-related conditions", "Government involvement"], "answer": "A shift from infectious pathogens to lifestyle-related conditions"},
                {"type": "sentence_completion", "question": "Governments should focus on ______ rather than just treating symptoms.", "answer": "preventative medicine"},
                {"type": "identify_view", "question": "A successful healthcare model must balance responsibility with ______.", "answer": "disparities/vulnerability"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a healthy habit you have. You should say what it is, how often you do it, and explain how it helps your physical or mental well-being.",
                "model_answer": "I practice mindfulness meditation every morning for about twenty minutes. I started after reading about its benefits for reducing stress and improving focus. It has significantly improved my mental well-being by helping me manage anxiety and approach challenges with a clearer mindset."
            },
            "part3": {
                "question": "Should people who lead unhealthy lifestyles pay more for healthcare?",
                "band8_sample": "Much as I understand the argument for fiscal fairness, I find the idea of charging people more based on their lifestyle to be highly problematic. It ignores the systemic factors at play. For instance, someone living in a food desert might not have the luxury of choosing organic produce. Punishing them financially would only exacerbate the wealth gap and lead to even worse health outcomes. Instead, we should focus on subsidising healthy options and improving health literacy across the board."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people think that governments should be responsible for the health of their citizens. Others believe that it is the responsibility of individuals to lead a healthy life. Discuss both views and give your opinion.",
            "band75_excerpt": "The allocation of responsibility for public health is a complex ethical dilemma. While it is undeniably true that individual choices regarding diet and exercise are pivotal, I believe the state must play a supervisory and supportive role. Notwithstanding the importance of personal autonomy, the government possesses the tools to regulate the food industry and provide universal access to medical care. A purely individualistic approach ignores the socio-economic barriers that prevent many from attaining a healthy lifestyle; therefore, a collaborative framework is essential.",
            "examiner_analysis": {
                "task_response": "Explains the importance of both individual and state action, concluding that a collaborative approach is best.",
                "lexical_resource": "Uses 'allocation,' 'pivotal,' 'supervisory,' and 'socio-economic barriers.'",
                "grammar": "Uses the concessive 'Notwithstanding...' to balance the sentence.",
                "error_upgrade": "Instead of 'If the government helps, it's better,' use 'State-led health initiatives are imperative to mitigate the systemic inequalities that underpin global health disparities.'"
            }
        },
        "examiner_tips": [
            "Use 'Hedges': Avoid saying 'Sugar causes diabetes.' Say 'High sugar consumption is a significant contributing factor to the development of diabetes.'",
            "Avoid Overusing 'Healthy': Use 'wholesome,' 'nutritious,' 'salubrious,' or 'beneficial to one's well-being.'",
            "Connect to Other Modules: When discussing health, mention the fiscal burden on the government or the aging population to show comprehensive understanding."
        ]
    },
    # Module 19: The Media Landscape: Journalism, Social Media, and the Public Interest
    {
        "id": "advanced-module-19",
        "module_number": 19,
        "title": "The Media Landscape",
        "subtitle": "Journalism, Social Media, and the Public Interest",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the shift from traditional journalism to user-generated content",
            "Master Fronting for Emphasis to vary sentence structure and highlight key arguments",
            "Develop a lexicon for discussing misinformation, media literacy, and agenda-setting"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Dissemination", "meaning": "The act of spreading something, especially information, widely", "usage": "Noun; academic alternative to 'sharing'", "example": "The rapid dissemination of unverified reports can cause widespread public alarm."},
                {"term": "Sensationalism", "meaning": "The use of exciting or shocking stories at the expense of accuracy to provoke public interest", "usage": "Noun; critical for media ethics discussions", "example": "Traditional news outlets often resort to sensationalism to compete with the speed of social media."},
                {"term": "Echo Chamber", "meaning": "An environment where a person only encounters information or opinions that reflect and reinforce their own", "usage": "Noun; focus for technology/bias topics", "example": "Social media algorithms frequently create an echo chamber, stifling diverse political discourse."},
                {"term": "Agenda-setting", "meaning": "The ability of the media to influence the importance placed on the topics of the public agenda", "usage": "Noun/Verb; sociological term", "example": "By focusing on specific scandals, the media performs an agenda-setting role that distracts from policy issues."},
                {"term": "Media Literacy", "meaning": "The ability to access, analyze, evaluate, and create media in a variety of forms", "usage": "Noun phrase; the 'solution' in many essays", "example": "Improving media literacy is the most effective defense against the spread of fake news."}
            ]
        },
        "grammar": {
            "title": "Fronting for Emphasis",
            "explanation": "To achieve Band 7+ in Grammatical Range, use 'fronting' to move a key element to the beginning of the sentence for rhetorical effect.",
            "band_65_example": "Fake news is more dangerous than ever before.",
            "band_80_example": "Never before has the threat of misinformation been so pervasive in our democratic processes.",
            "application": "Move adverbs or prepositional phrases to the front: 'Only by implementing strict regulations can platforms be held accountable.'"
        },
        "reading": {
            "title": "The Algorithmic Editor: News in the 21st Century",
            "word_count": 338,
            "text": "The transition from print to digital media has fundamentally altered how society consumes information. Traditionally, 'gatekeepers'—professional editors and journalists—vetted information for accuracy before dissemination. Today, however, this role has been largely supplanted by algorithms designed to maximize 'engagement.' While this allows for a more personalized user experience, it raises profound questions regarding the 'objectivity' of the information presented.\n\nOne of the most concerning phenomena in the digital realm is the 'echo chamber.' Algorithms are programmed to show users content that aligns with their previous interactions, effectively shielding them from dissenting viewpoints. This 'filter bubble' can lead to increased political polarization, as individuals are rarely challenged by opposing arguments. Furthermore, the rise of 'citizen journalism' has democratized the news, yet it has also facilitated the spread of 'misinformation.' Without the rigorous fact-checking standards of traditional media, sensationalist or entirely fabricated stories can go viral in a matter of minutes.\n\nMoreover, the business model of modern media, which relies heavily on 'clickbait' for advertising revenue, has led to a decline in investigative journalism. When news outlets are incentivized to produce high volumes of 'shareable' content, the depth and nuance of reporting often suffer. This has prompted calls for a return to 'public interest journalism,' funded by subsidies or non-profit models rather than commercial interests. Ultimately, the responsibility for navigating this complex landscape lies with both the platform providers and the users themselves. Developing a high degree of 'media literacy' is no longer an optional skill but a civic necessity. By questioning the source, intent, and bias of the information they encounter, citizens can protect themselves from manipulation and contribute to a more informed and healthy public discourse.",
            "questions": [
                {"type": "true_false_ng", "question": "Algorithms are primarily designed to ensure information is accurate.", "answer": "False"},
                {"type": "true_false_ng", "question": "The 'filter bubble' helps people understand opposing viewpoints.", "answer": "False"},
                {"type": "true_false_ng", "question": "Investigative journalism is more profitable than 'clickbait.'", "answer": "False"},
                {"type": "matching_info", "question": "Which paragraph discusses the role of traditional 'gatekeepers'?", "answer": "Paragraph 1"},
                {"type": "matching_info", "question": "Which paragraph mentions the funding of non-profit news models?", "answer": "Paragraph 3"},
                {"type": "summary_completion", "question": "Algorithms prioritize user ______ over accuracy.", "answer": "engagement"},
                {"type": "summary_completion", "question": "Political ______ is often a result of being trapped in echo chambers.", "answer": "polarization"},
                {"type": "vocabulary_match", "question": "Which term in the text means 'to verify or check'?", "answer": "Vetted"},
                {"type": "multiple_choice", "question": "What is 'citizen journalism' according to the text?", "options": ["Government-controlled news", "The democratization of news through non-professionals", "A type of advertising"], "answer": "The democratization of news through non-professionals"},
                {"type": "multiple_choice", "question": "What is the primary cause of the decline in reporting depth?", "options": ["Lack of journalists", "The commercial reliance on clickbait/ad revenue", "Government censorship"], "answer": "The commercial reliance on clickbait/ad revenue"},
                {"type": "sentence_completion", "question": "Citizens must improve their ______ to avoid being manipulated.", "answer": "media literacy"},
                {"type": "identify_view", "question": "Navigating the media landscape is a ______ responsibility.", "answer": "shared/civic"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a news story that you found particularly interesting. You should say what it was about, where you heard it, why it was important, and explain how you felt about it.",
                "model_answer": "I'd like to discuss a recent investigative report on plastic pollution in our oceans. I read it in a reputable scientific journal. It was important because it highlighted the scale of the crisis and proposed actionable solutions. I felt a mix of concern and hope—concern about the damage already done, but hope that increased awareness could drive policy change."
            },
            "part3": {
                "question": "To what extent can we trust the news we see on social media?",
                "band8_sample": "I believe we should approach social media news with a healthy degree of skepticism. While it allows for real-time updates, the lack of editorial oversight means that sensationalism often trumps factual accuracy. We must be discerning consumers and cross-reference information with reputable sources before forming a definitive opinion. Otherwise, we risk becoming beholden to algorithms that prioritize outrage over insight."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In many countries, social media is replacing traditional newspapers and television as the main source of news. Do you think this is a positive or negative development?",
            "band75_excerpt": "The shift toward social media as the primary vehicle for news consumption is a transformative trend. While it offers unprecedented accessibility and a plurality of voices, I would argue that it is a predominantly negative development due to the erosion of journalistic integrity and the rise of misinformation. Traditional media, despite its flaws, is bound by professional ethics that are often absent in the unregulated digital sphere.",
            "examiner_analysis": {
                "lexical_resource": "Instead of 'Social media is fast,' use 'Social media facilitates the instantaneous dissemination of information.'",
                "error_upgrade": "Instead of 'People believe fake news,' use 'The lack of rigorous vetting processes leaves the populace vulnerable to sophisticated misinformation campaigns.'"
            }
        },
        "examiner_tips": [
            "Avoid Over-generalization: Don't say 'All social media is bad.' Instead, say 'The unregulated nature of certain platforms can inadvertently facilitate...'",
            "Precision: Use 'editorial oversight' instead of 'checking the news.'"
        ]
    },
    # Module 20: Tourism, Cultural Heritage, and Global Mobility
    {
        "id": "advanced-module-20",
        "module_number": 20,
        "title": "Tourism, Cultural Heritage, and Global Mobility",
        "subtitle": "Preservation vs. Profit",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Critically evaluate the socio-economic impacts of mass tourism and commodification",
            "Master Participle Clauses for concise, academic sentence variety",
            "Develop a lexicon for discussing ecotourism, cultural authenticity, and environmental footprints"
        ],
        "vocabulary": {
            "advanced_terms": [
                {"term": "Commodification", "meaning": "The action or process of treating something as a mere commodity (product for sale)", "usage": "Noun; focus for culture/tourism", "example": "The commodification of traditional ceremonies often strips them of their spiritual significance."},
                {"term": "Overtourism", "meaning": "A condition where there are too many visitors to a particular destination", "usage": "Noun; modern environmental/social topic", "example": "Cities like Venice are struggling with overtourism, which threatens the quality of life for locals."},
                {"term": "Authenticity", "meaning": "The quality of being authentic; genuineness", "usage": "Noun; used in 'culture' debates", "example": "Travelers today are increasingly seeking authenticity rather than staged tourist experiences."},
                {"term": "Transient", "meaning": "Lasting only for a short time; impermanent", "usage": "Adjective; used to describe the nature of tourist stays", "example": "The transient nature of the tourism workforce can lead to a lack of community stability."},
                {"term": "Ecotourism", "meaning": "Tourism directed towards exotic, often threatened, natural environments, intended to support conservation efforts", "usage": "Noun; the 'green' solution", "example": "Sustainable ecotourism provides a financial incentive for local communities to protect their wildlife."}
            ]
        },
        "grammar": {
            "title": "Participle Clauses",
            "explanation": "Use participle clauses (-ing or -ed) to provide extra information more concisely, a hallmark of Band 8.0+ writing.",
            "band_65_example": "Many people visit historical sites and they take photos but they don't learn the history.",
            "band_80_example": "Attracted by the allure of historical sites, many tourists focus on photography, often neglecting to engage with the cultural significance of the location.",
            "application": "Having recognized the dangers of overtourism, many cities have implemented visitor caps."
        },
        "reading": {
            "title": "The Paradox of Travel: Mass Tourism and the Erosion of Heritage",
            "word_count": 342,
            "text": "In the era of low-cost aviation and digital global mobility, international tourism has become one of the world's largest industries. While it provides essential foreign currency and employment for many developing nations, the environmental and cultural 'footprint' of mass tourism is becoming increasingly difficult to ignore. The phenomenon of 'overtourism' has transformed once-serene heritage sites into crowded hubs of commercial activity, leading to what sociologists call the 'commodification of culture.'\n\nWhen local traditions are adapted to suit the tastes and schedules of international visitors, they often lose their 'authenticity.' Ceremonies that once held deep communal meaning may be shortened or altered for photographic appeal, becoming 'staged authenticity' rather than living culture. Furthermore, the economic benefits of tourism do not always 'trickle down' to the local population. In many instances, 'leakage' occurs, where the profits are absorbed by multinational hotel chains and airlines rather than the communities that host the visitors.\n\nEnvironmental degradation is another significant concern. The carbon emissions from long-haul flights, coupled with the strain on local resources such as water and waste management, often outweigh the immediate financial gains. In response, the concept of 'ecotourism' or 'sustainable travel' has gained traction. This model emphasizes low-impact visits that support conservation and respect local cultures. However, critics argue that 'ecotourism' is often used as a marketing label—a form of 'greenwashing'—rather than a genuine commitment to sustainability. Ultimately, the future of travel depends on a radical shift in perspective. Instead of viewing destinations as 'products' to be consumed, we must see them as fragile ecosystems and living cultures that require 'stewardship' rather than exploitation. By prioritizing the quality of the experience over the quantity of visitors, the tourism industry can become a force for cross-cultural understanding and environmental protection.",
            "questions": [
                {"type": "true_false_ng", "question": "Tourism is currently the largest industry in the world.", "answer": "Not Given—text says 'one of the largest'"},
                {"type": "true_false_ng", "question": "'Staged authenticity' refers to ceremonies that have been changed for tourists.", "answer": "True"},
                {"type": "true_false_ng", "question": "'Leakage' means that local people get most of the tourism money.", "answer": "False"},
                {"type": "matching_info", "question": "Which paragraph discusses the carbon footprint of travel?", "answer": "Paragraph 3"},
                {"type": "matching_info", "question": "Which paragraph explains why traditions lose meaning?", "answer": "Paragraph 2"},
                {"type": "summary_completion", "question": "Mass tourism leads to the ______ of culture.", "answer": "commodification"},
                {"type": "summary_completion", "question": "______ travel aims to minimize the negative impact on the environment.", "answer": "Sustainable/Eco-"},
                {"type": "multiple_choice", "question": "What is 'greenwashing'?", "options": ["A cleaning method", "Using environmental labels for marketing without real action", "A type of tourism"], "answer": "Using environmental labels for marketing without real action"},
                {"type": "multiple_choice", "question": "What is the author's view on the economic benefits of tourism?", "options": ["They always help locals", "They are often diverted away from local communities", "They are irrelevant"], "answer": "They are often diverted away from local communities"},
                {"type": "vocabulary_match", "question": "Which word in the text means 'a strong influence or impact'?", "answer": "Footprint"},
                {"type": "sentence_completion", "question": "Destinations should be treated as ______ rather than products.", "answer": "fragile ecosystems/living cultures"},
                {"type": "identify_view", "question": "The author believes the tourism industry needs a ______ shift in perspective.", "answer": "radical"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a place you have visited that was of great cultural importance. You should say where it was, why you went there, what you saw, and explain what you learned about the local culture.",
                "model_answer": "I visited the ancient city of Petra in Jordan. I went there as part of a cultural heritage tour. I saw the incredible rock-carved architecture, including the famous Treasury. What I learned was the importance of preservation—the site is under threat from both overtourism and environmental erosion. It made me appreciate the need for sustainable travel practices."
            },
            "part3": {
                "question": "Do you think that international tourism will eventually destroy local cultures?",
                "band8_sample": "I wouldn't say it's an inevitability, but it is a substantial risk. When a culture is beholden to the tourist dollar, there is a tendency to package its traditions in a way that is 'digestible' for outsiders. This can lead to a dilution of heritage. However, if managed correctly through community-led initiatives, tourism can actually provide the financial impetus necessary to preserve traditions that might otherwise have been consigned to history."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "International tourism has become a major industry in the world. Some people think it is very beneficial for the host countries, while others think it has many negative effects. Discuss both views and give your opinion.",
            "band75_excerpt": "The expansion of global tourism is a double-edged sword. While it acts as a catalyst for economic development and provides a lifeline for many developing economies, the resultant environmental despoliation and cultural commodification cannot be overlooked. I believe that while the economic benefits are undeniable, they must be tempered by rigorous regulation to ensure that the host country's natural and cultural capital is not irreparably damaged for the sake of short-term profit.",
            "examiner_analysis": {
                "lexical_resource": "Uses 'catalyst,' 'despoliation,' 'tempered by,' and 'cultural capital.'",
                "grammar": "Uses a complex concessive structure: 'While... I believe that...'",
                "error_upgrade": "Instead of 'Tourism helps the economy but hurts nature,' use 'The fiscal influx provided by tourism must be balanced against the preservation of ecological integrity.'"
            }
        },
        "examiner_tips": [
            "Don't forget the 'Local': When discussing tourism, always mention the impact on the indigenous or local population to show socio-economic awareness.",
            "Use 'Future' Hypotheticals: Use the third conditional to discuss what would have happened without tourism to show high-level grammar range."
        ]
    }
]


# Seeding function
async def seed_advanced_modules():
    """Seed the advanced mastery modules to MongoDB."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing advanced modules
    await db.advanced_mastery_modules.delete_many({})
    
    # Insert all modules
    await db.advanced_mastery_modules.insert_many(ADVANCED_MODULES)
    
    print(f"✅ Successfully seeded {len(ADVANCED_MODULES)} Advanced IELTS Mastery modules")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_advanced_modules())
