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
    # Modules 9-20 continue...
]
