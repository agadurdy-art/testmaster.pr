#!/usr/bin/env python3
"""
Advanced IELTS Mastery: Band 6.0-9.0 Full Course
Cambridge-Aligned Curriculum with Strict Academic Standards
Complete modules with full reading passages, 12 questions per module,
comprehensive model essays, and examiner-grade content.
"""

import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'ielts_database')

ADVANCED_MODULES = [
    # Module 1: Language and Communication
    {
        "id": "advanced-module-1",
        "module_number": 1,
        "title": "Linguistic Evolution",
        "subtitle": "The Intersection of Cultural Identity and Global Discourse",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Evaluate the socio-political impact of linguistic imperialism",
            "Master Nominalization to transform descriptive sentences into academic, objective arguments",
            "Develop a lexicon focused on nuance, semantic shifts, and vernacular"
        ],
        "vocabulary": {
            "advanced_terms": [
                {
                    "term": "Linguistic Imperialism",
                    "meaning": "The imposition of one language on speakers of other languages",
                    "usage": "Noun; central to globalization debates",
                    "example": "The dominance of English in academia is often cited as a form of linguistic imperialism."
                },
                {
                    "term": "Semantic Shift",
                    "meaning": "The evolution of word meanings over time",
                    "usage": "Noun phrase; academic context",
                    "example": "The word 'awesome' has undergone a significant semantic shift in the last century."
                },
                {
                    "term": "To Vernacularise",
                    "meaning": "To translate or adapt into the local or common language",
                    "usage": "Verb; high-level alternative to 'translate'",
                    "example": "Efforts to vernacularise technical manuals helped improve local safety standards."
                },
                {
                    "term": "Monolingualism",
                    "meaning": "The condition of speaking only one language",
                    "usage": "Noun; focus for education/social topics",
                    "example": "In an increasingly globalized world, monolingualism can be seen as a professional handicap."
                },
                {
                    "term": "Pervasive",
                    "meaning": "Spreading widely throughout an area or a group of people",
                    "usage": "Adjective; replaces 'common' or 'everywhere'",
                    "example": "The influence of social media on teenage slang is pervasive across all continents."
                }
            ],
            "synonym_groups": [
                {"base": "Language", "synonyms": ["Tongue", "dialect", "parlance", "lexicon"]},
                {"base": "To communicate", "synonyms": ["To convey", "to articulate", "to disseminate information"]},
                {"base": "Clear", "synonyms": ["Pellucid", "articulate", "unambiguous"]}
            ]
        },
        "grammar": {
            "title": "Nominalization",
            "explanation": "To reach Band 7.5+, you must move away from 'people do things' (verbs) and toward 'the doing of things' (nouns). This creates the 'objective' tone examiners look for.",
            "band_65_example": "If we speak different languages, we might understand each other's cultures better.",
            "band_80_example": "The acquisition of a secondary language facilitates a deeper appreciation of cultural nuances and cross-border empathy.",
            "why_it_works": "It replaces a conditional clause with a strong noun phrase, making the argument sound more authoritative and concise."
        },
        "reading": {
            "title": "The Silent Death of Endangered Tongues",
            "word_count": 340,
            "text": """The world is currently experiencing a linguistic crisis of unprecedented proportions. Estimates suggest that every two weeks, a language disappears, taking with it a unique repository of human knowledge and cultural history. This phenomenon is often driven by the "hegemony" of global languages like English, Mandarin, and Spanish, which offer greater economic utility in a globalized marketplace. As younger generations in indigenous communities prioritize these dominant tongues, the "intergenerational transmission" of native dialects ceases, leading to their eventual extinction.

Critics of linguistic preservation argue that a unified global language facilitates smoother international trade and scientific cooperation. They posit that the "fragmentation" caused by thousands of minor languages acts as a barrier to progress. However, anthropologists warn that this perspective is dangerously "reductive." A language is not merely a tool for communication; it is a lens through which we interpret the world. For instance, many indigenous languages contain specific "lexical sets" related to local biodiversity that are not present in major world languages. When these tongues die, the specific ecological knowledge "assimilated" within them is lost.

Furthermore, the loss of a mother tongue is frequently linked to a decline in community well-being. Language is the primary "vessel" of cultural identity; its erasure can lead to social "dislocation" and a loss of historical continuity. To mitigate this, some nations are employing digital archives and "immersion" programs to revitalize endangered speeches. Ultimately, the goal is not to reject global languages but to foster a state of "stable bilingualism," where global connectivity and local heritage can coexist. The survival of linguistic diversity is, in essence, the survival of the human ability to think and exist in a variety of ways.""",
            "questions": [
                {"type": "identify_view", "question": "Does the author believe the death of a language only loses words?", "answer": "No; it loses knowledge and history"},
                {"type": "vocabulary_match", "question": "Which term refers to the dominance of one language over others?", "answer": "Hegemony"},
                {"type": "true_false_ng", "question": "Half of all languages will be dead by 2050.", "answer": "Not Given"},
                {"type": "true_false_ng", "question": "Younger people are the main drivers of linguistic shifts.", "answer": "True"},
                {"type": "true_false_ng", "question": "Indigenous languages often have better words for nature than English.", "answer": "True"},
                {"type": "summary_completion", "question": "Critics argue that linguistic diversity causes ______ to global progress.", "answer": "fragmentation/barriers"},
                {"type": "summary_completion", "question": "Digital ______ are being used to save languages.", "answer": "archives"},
                {"type": "multiple_choice", "question": "Why is the loss of a language linked to social 'dislocation'?", "options": ["Because it reduces trade", "Because it is the vessel of identity", "Because it affects technology"], "answer": "Because it is the vessel of identity"},
                {"type": "multiple_choice", "question": "What is the goal of 'stable bilingualism'?", "options": ["Eliminating minor languages", "Coexistence of global and local tongues", "Teaching only English"], "answer": "Coexistence of global and local tongues"},
                {"type": "matching_info", "question": "Which paragraph discusses the economic utility of major languages?", "answer": "Paragraph 1"},
                {"type": "sentence_completion", "question": "Language provides a ______ through which we interpret the world.", "answer": "lens"},
                {"type": "author_tone", "question": "The author views the loss of diversity as ______ to human knowledge.", "answer": "detrimental/dangerous"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a language you would like to learn besides English. You should say what it is, where it is spoken, how you would learn it, and explain why it would be beneficial for you.",
                "model_answer": "I would love to learn Japanese, which is spoken primarily in Japan but also has significant communities in Brazil and the United States. I would approach this through a combination of formal language classes and immersion techniques, such as watching Japanese media without subtitles. The benefits would be multifaceted—professionally, it would open doors to working with Japanese corporations, while personally, it would allow me to appreciate Japanese literature and philosophy in their original form. Moreover, the acquisition of a language so structurally different from English would fundamentally expand my cognitive framework."
            },
            "part3": {
                "question": "How does language influence the way people think?",
                "band8_sample": "I'm of the opinion that language profoundly shapes our cognitive framework. For example, certain languages lack a future tense, which sociologists suggest might lead those speakers to be more present-oriented. While it's a contentious theory, the lexical richness of a language certainly dictates the nuance with which we can express complex emotions. Therefore, learning a new language is not just about communication; it's about expanding one's intellectual horizons."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "In the future, it is likely that many less spoken languages will disappear. Some people believe this is a positive trend because it will make communication easier. To what extent do you agree or disagree?",
            "band75_excerpt": """While the homogenisation of global speech may appear to streamline international discourse, I believe that the unfettered disappearance of minority languages is an irreversible cultural catastrophe. The argument that a single language improves efficiency is inherently reductive, as it overlooks the intrinsic link between a language and the ecological and historical knowledge it contains. Should the current trend continue, we risk a future defined by a monolithic worldview rather than a vibrant, diverse intellectual landscape.""",
            "examiner_analysis": {
                "lexical_resource": "Uses 'homogenisation,' 'unfettered,' 'reductive,' and 'monolithic' instead of basic terms.",
                "coherence_cohesion": "Uses inverted conditionals ('Should the current trend...') to link cause and effect.",
                "error_upgrade": "Instead of 'It is bad if languages die,' use 'The erosion of linguistic diversity represents a significant depletion of our collective cultural heritage.'"
            }
        },
        "examiner_tips": [
            "Focus on 'Nuance': Don't just say communication is 'important.' Say it is 'pivotal for diplomatic and interpersonal relations.'",
            "Structure: Use Nominalization to start your body paragraphs (e.g., 'The preservation of minor dialects is essential for...') to show high-level control."
        ]
    },
    
    # Module 2: Technology and the Digital Divide
    {
        "id": "advanced-module-2",
        "module_number": 2,
        "title": "The Silicon Stratification",
        "subtitle": "Connectivity, Innovation, and the Digital Chasm",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the socio-economic implications of technology in developing vs. developed nations",
            "Master Relative Clauses (Non-Defining) to add descriptive complexity to sentences",
            "Develop a lexicon for discussing automation, obsolescence, and digital literacy"
        ],
        "vocabulary": {
            "advanced_terms": [
                {
                    "term": "Digital Divide",
                    "meaning": "The gulf between those who have ready access to computers and the internet, and those who do not",
                    "usage": "Noun; focus for inequality topics",
                    "example": "The digital divide exacerbates existing socio-economic disparities in rural areas."
                },
                {
                    "term": "Obsolescence",
                    "meaning": "The process of becoming outdated or no longer useful",
                    "usage": "Noun; used for tech and economic trends",
                    "example": "Planned obsolescence encourages consumers to replace devices more frequently than necessary."
                },
                {
                    "term": "Automation",
                    "meaning": "The use of largely automatic equipment in a system of manufacturing or other processes",
                    "usage": "Noun; common in 'work' topics",
                    "example": "Increased automation in the service sector threatens low-skilled employment."
                },
                {
                    "term": "To Proliferate",
                    "meaning": "To increase rapidly in numbers; multiply",
                    "usage": "Verb; replaces 'increase' or 'grow'",
                    "example": "As mobile devices proliferate, global connectivity reaches even the most remote regions."
                },
                {
                    "term": "Ubiquitous",
                    "meaning": "Present, appearing, or found everywhere",
                    "usage": "Adjective; replaces 'common' or 'everywhere'",
                    "example": "Smartphones have become ubiquitous in modern social interactions."
                }
            ],
            "synonym_groups": [
                {"base": "Advanced", "synonyms": ["Cutting-edge", "state-of-the-art", "sophisticated", "pioneering"]},
                {"base": "Impact", "synonyms": ["Repercussion", "consequence", "profound effect", "implication"]},
                {"base": "Modern", "synonyms": ["Contemporary", "current", "21st-century"]}
            ]
        },
        "grammar": {
            "title": "Non-Defining Relative Clauses",
            "explanation": "To reach Band 7.5+, you must use commas to insert extra, sophisticated detail into your sentences.",
            "band_65_example": "Artificial intelligence is very useful and it is changing the world.",
            "band_80_example": "Artificial intelligence, which is currently revolutionizing sectors from healthcare to finance, presents both immense opportunities and ethical dilemmas.",
            "why_it_works": "It shows the examiner you can handle complex punctuation and 'embedding' information, which improves your 'Grammatical Range and Accuracy.'"
        },
        "reading": {
            "title": "The Paradox of Progress: AI and the Human Labor Force",
            "word_count": 345,
            "text": """The rapid advancement of Artificial Intelligence (AI) has sparked a global debate regarding the future of work. While previous technological revolutions replaced physical labor with machines, the current "AI wave" threatens to displace cognitive tasks. From data analysis to creative writing, algorithms are now capable of performing roles once thought to be exclusively human. This shift promises a "productivity surge," allowing for more efficient resource allocation and economic growth. However, economists warn that the benefits of this innovation may not be "equitably distributed."

One of the primary concerns is the exacerbation of the "digital divide." As AI technology requires high-level digital literacy and expensive infrastructure, developed nations are poised to capture the majority of the economic gains. Conversely, developing countries, which often rely on low-skilled labor, may face mass unemployment and social "destabilization." This technological "leapfrogging"—where a nation skips traditional stages of development—is only possible if the state invests heavily in education and digital infrastructure. Without such intervention, the gap between the "connected" and the "unconnected" will only widen.

Furthermore, the "human element" of work is being called into question. In fields like healthcare, AI can diagnose diseases with greater precision than human doctors. Yet, the lack of "empathetic intelligence" in algorithms means that the emotional aspects of care remain irreplaceable. The challenge for future policy is to ensure that AI "augments" rather than "supplants" human roles. By focusing on "hybrid models"—where humans and machines work in tandem—societies can leverage the speed of AI while maintaining human oversight. Ultimately, the success of the digital age depends on our ability to navigate the "ethical minefield" of automation while ensuring that technology serves the collective good rather than a narrow elite.""",
            "questions": [
                {"type": "true_false_ng", "question": "Past technological revolutions targeted physical tasks.", "answer": "True"},
                {"type": "true_false_ng", "question": "AI is expected to decrease global productivity.", "answer": "False"},
                {"type": "true_false_ng", "question": "Digital literacy is essential for using AI effectively.", "answer": "True"},
                {"type": "true_false_ng", "question": "AI will eventually be able to feel human emotions.", "answer": "Not Given"},
                {"type": "vocabulary_match", "question": "Which term describes skipping stages of development?", "answer": "Leapfrogging"},
                {"type": "vocabulary_match", "question": "Which term describes AI making a situation worse?", "answer": "Exacerbation"},
                {"type": "summary_completion", "question": "AI threatens to displace ______ tasks rather than just physical ones.", "answer": "cognitive"},
                {"type": "summary_completion", "question": "Governments must invest in ______ to avoid social instability.", "answer": "education/infrastructure"},
                {"type": "multiple_choice", "question": "What is the main risk for developing nations?", "options": ["Losing internet access", "Mass unemployment due to reliance on low-skilled labor", "Too many robots"], "answer": "Mass unemployment due to reliance on low-skilled labor"},
                {"type": "multiple_choice", "question": "What are 'hybrid models' in the text?", "options": ["New types of cars", "Systems where humans and machines work together", "Cloud computing"], "answer": "Systems where humans and machines work together"},
                {"type": "matching_info", "question": "Which paragraph discusses the 'ethical minefield' of AI?", "answer": "Paragraph 3"},
                {"type": "sentence_completion", "question": "AI lacks the ______ necessary for emotional care in medicine.", "answer": "empathetic intelligence"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a piece of technology you find difficult to use. You should say what it is, when you use it, why it is difficult, and explain how you feel about using it.",
                "model_answer": "I'd like to discuss the complex home automation system I recently installed. While the concept promised to streamline my daily routines, the execution has proven frustratingly opaque. The technology requires synchronization across multiple platforms and protocols, which often results in connectivity failures. I find myself spending more time troubleshooting than actually benefiting from the supposed conveniences. Despite this, I remain cautiously optimistic that as these technologies mature, they will become more user-friendly and intuitive."
            },
            "part3": {
                "question": "To what extent should governments regulate the development of Artificial Intelligence?",
                "band8_sample": "I believe state regulation is absolutely imperative. Without a robust legal framework, the development of AI could lead to unintended consequences, such as the erosion of privacy or the amplification of bias. While innovation should not be stifled, we must ensure that technology is developed in a way that is ethically sound and socially responsible. It shouldn't be a lawless frontier; there must be oversight."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that technology has made us more socially isolated. Others argue that it has brought people closer together. Discuss both views and give your opinion.",
            "band75_excerpt": """The impact of technology on social cohesion is a contentious issue. Critics of digital integration argue that the ubiquity of smartphones has led to the atrophy of face-to-face social skills. However, I contend that technology has facilitated the formation of global communities that were previously logistically impossible. While digital interactions may lack physical intimacy, they offer a plurality of perspectives that enriches our social lives. Therefore, the issue is not technology itself, but our unwillingness to balance virtual and physical realms.""",
            "examiner_analysis": {
                "lexical_resource": "Uses 'contentious,' 'atrophy,' 'facilitated,' and 'plurality' instead of basic vocabulary.",
                "task_response": "Acknowledges both 'isolation' and 'connection' before providing a balanced opinion.",
                "error_upgrade": "Instead of 'Technology changes how we talk,' use 'The digital revolution has fundamentally altered the paradigm of human communication.'"
            }
        },
        "examiner_tips": [
            "Avoid the 'Good/Bad' Binary: Instead of saying technology is 'good,' use 'It has multifaceted benefits for global connectivity.'",
            "Vocabulary Precision: Use 'dissemination of information' instead of 'sharing news.'"
        ]
    },
    
    # Module 3: The Environment and Sustainability
    {
        "id": "advanced-module-3",
        "module_number": 3,
        "title": "Ecological Stewardship",
        "subtitle": "Circular Economies and the Climate Imperative",
        "level": "band-6.0-9.0",
        "learning_goals": [
            "Analyze the efficacy of individual responsibility versus corporate regulation",
            "Master Conditional Sentences (Type 2 & 3) to discuss hypothetical environmental solutions",
            "Develop a lexicon for discussing carbon sequestration, greenwashing, and biodiversity"
        ],
        "vocabulary": {
            "advanced_terms": [
                {
                    "term": "Carbon Sequestration",
                    "meaning": "The process of capturing and storing atmospheric carbon dioxide",
                    "usage": "Noun; focus for climate solution topics",
                    "example": "Reforestation is a natural and effective method of carbon sequestration."
                },
                {
                    "term": "Greenwashing",
                    "meaning": "Disseminating misleading information to portray an organization as environmentally responsible",
                    "usage": "Noun; critical for 'corporate ethics' topics",
                    "example": "Many fossil fuel companies have been accused of greenwashing through their marketing campaigns."
                },
                {
                    "term": "Biodiversity",
                    "meaning": "The variety of plant and animal life in a particular habitat",
                    "usage": "Noun; replaces 'animals and plants'",
                    "example": "The preservation of biodiversity is crucial for maintaining ecosystem services."
                },
                {
                    "term": "To Deplete",
                    "meaning": "To exhaust or use up a resource",
                    "usage": "Verb; high-level alternative to 'run out of'",
                    "example": "Industrial overfishing continues to deplete the world's marine populations."
                },
                {
                    "term": "Sustainability",
                    "meaning": "The ability to be maintained at a certain rate or level without damaging the environment",
                    "usage": "Noun; core topic term",
                    "example": "The transition to renewable energy is the cornerstone of global sustainability."
                }
            ],
            "synonym_groups": [
                {"base": "Environment", "synonyms": ["Ecosystem", "biosphere", "natural world", "ecological landscape"]},
                {"base": "Dangerous", "synonyms": ["Perilous", "hazardous", "detrimental", "catastrophic"]},
                {"base": "To Reduce", "synonyms": ["To mitigate", "to curtail", "to alleviate"]}
            ]
        },
        "grammar": {
            "title": "Hypothetical Conditionals (Type 2 & 3)",
            "explanation": "To reach Band 7.5+, you must use conditionals to weigh solutions and analyze past failures.",
            "band_65_example": "If we stop using oil, the planet will get better.",
            "band_80_example_type2": "If governments were to implement a global carbon tax, corporations would have a powerful financial incentive to transition to green energy.",
            "band_80_example_type3": "Had international treaties been enforced more rigorously in the 1990s, the current climate crisis might not have reached such a perilous stage.",
            "why_it_works": "These structures allow for 'critical evaluation' rather than just simple description."
        },
        "reading": {
            "title": "The Circular Economy: Redefining Growth",
            "word_count": 330,
            "text": """For decades, the global economy has followed a "linear model": take, make, and dispose. This approach has led to the "unprecedented depletion" of natural resources and a catastrophic rise in global waste. However, a new paradigm is emerging: the "Circular Economy." This model seeks to decouple economic growth from resource consumption by designing systems that eliminate waste, keep products in use for longer, and regenerate natural systems. Instead of viewing waste as a problem to be hidden, the circular model treats it as a "valuable resource" to be fed back into the production cycle.

One of the primary barriers to this transition is the concept of "planned obsolescence." Many modern products, from smartphones to household appliances, are designed to fail or become unfashionable within a few years. This drives a "consumption cycle" that is inherently unsustainable. To counter this, advocates for the circular economy suggest that manufacturers should be held "legally responsible" for the entire lifecycle of their products. This "Extended Producer Responsibility" (EPR) would incentivize companies to create durable, repairable, and recyclable goods.

Furthermore, the transition requires a shift in consumer mindset. In a "sharing economy," individuals might lease services (like transportation or power) rather than owning physical assets. While this could significantly "curtail" our individual carbon footprints, it requires a move away from the traditional "materialistic" indicators of success. Critics argue that such a shift could slow economic growth and reduce "innovation." However, proponents suggest that the circular model will spark a "new wave of green innovation," creating millions of jobs in the repair and recycling sectors. Ultimately, the survival of the biosphere depends on our ability to transition from a "frontier mentality" to a more "stewardship-based" approach to the planet's finite resources.""",
            "questions": [
                {"type": "identify_term", "question": "What is the traditional economic model called?", "answer": "Linear model"},
                {"type": "vocabulary_match", "question": "Which term describes capturing carbon from the air?", "answer": "Carbon sequestration (from vocabulary table)"},
                {"type": "true_false_ng", "question": "The circular economy aims to stop all economic growth.", "answer": "False"},
                {"type": "true_false_ng", "question": "Waste is seen as a resource in the circular model.", "answer": "True"},
                {"type": "true_false_ng", "question": "Most people prefer owning cars to leasing them.", "answer": "Not Given"},
                {"type": "summary_completion", "question": "______ encourages companies to make products that break quickly.", "answer": "Planned obsolescence"},
                {"type": "summary_completion", "question": "______ Responsibility makes companies pay for their product's waste.", "answer": "Extended Producer"},
                {"type": "multiple_choice", "question": "What is the 'sharing economy'?", "options": ["A model where everyone shares money", "A model where people lease services instead of owning goods", "A type of government system"], "answer": "A model where people lease services instead of owning goods"},
                {"type": "multiple_choice", "question": "Why do critics fear the circular economy?", "options": ["It might slow economic growth", "It uses too much energy", "It requires too many workers"], "answer": "It might slow economic growth"},
                {"type": "matching_info", "question": "Which paragraph discusses the role of the consumer?", "answer": "Paragraph 3"},
                {"type": "sentence_completion", "question": "The planet's resources are described as ______, meaning they have a limit.", "answer": "finite"},
                {"type": "author_conclusion", "question": "We must move toward a ______ approach to protect the planet.", "answer": "stewardship-based"}
            ]
        },
        "speaking": {
            "part2": {
                "cue_card": "Describe a time you did something to help the environment. You should say what you did, why you did it, how easy or difficult it was, and explain how you felt about it.",
                "model_answer": "I'd like to describe a community beach cleanup I organized last summer. The initiative stemmed from my growing concern about plastic pollution in our local marine ecosystem. While coordinating volunteers and securing equipment proved logistically challenging, the actual cleanup was remarkably efficient thanks to collective effort. What struck me most was the tangible impact we made—removing over 200 kilograms of debris in just four hours. The experience left me with a profound sense of agency, demonstrating that grassroots action, while modest in scale, can catalyze broader environmental awareness."
            },
            "part3": {
                "question": "To what extent can individual actions really make a difference in the fight against climate change?",
                "band8_sample": "While I believe individual actions are symbolically important, they are often dwarfed by the scale of industrial pollution. If every person on earth recycled, we would still face a climate crisis unless the fossil fuel conglomerates were held accountable. However, individual actions create a collective consciousness that puts pressure on policymakers. It's a top-down and bottom-up problem; we need both systemic reform and personal responsibility."
            }
        },
        "writing": {
            "task_type": "Task 2",
            "prompt": "Some people believe that it is the responsibility of individuals to take care of the environment. Others argue that only governments and large companies can make a difference. Discuss both views and give your opinion.",
            "band75_excerpt": """The question of who should bear the burden of environmental stewardship is a pivotal one. While individual efforts like recycling and reducing meat consumption are commendable, I believe they are insufficient without robust governmental oversight. Large corporations are the primary drivers of ecological despoliation; therefore, it is imperative that the state implements punitive taxes and stringent regulations to enforce sustainable practices. Without such systemic intervention, individual actions are merely a temporary palliative rather than a long-term solution.""",
            "examiner_analysis": {
                "lexical_resource": "Uses 'stewardship,' 'despoliation,' 'imperative,' and 'palliative' for sophisticated expression.",
                "coherence_cohesion": "Uses 'Therefore' and 'While' to weigh the two sides of the argument.",
                "error_upgrade": "Instead of 'It is the job of the government,' use 'The onus of responsibility for climate mitigation lies primarily with the state.'"
            }
        },
        "examiner_tips": [
            "Be Analytical: Don't just say 'global warming is bad.' Explain its socio-economic repercussions (e.g., loss of arable land).",
            "Structure: Use Type 2 Conditionals in your conclusion to suggest what could happen if your proposed solutions are followed."
        ],
        "analogy": "Saving the environment is like bailing water out of a leaking boat. A Band 6.5 student talks about the bucket (individual recycling). A Band 8.0 student analyzes the hole in the hull (corporate pollution) and the navigation skills of the captain (government policy) required to reach the shore."
    }
]

async def seed_advanced_mastery():
    """Seed the Advanced IELTS Mastery course modules"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing data
    await db.advanced_mastery_modules.delete_many({})
    
    # Insert new modules
    for module in ADVANCED_MODULES:
        await db.advanced_mastery_modules.insert_one(module)
        print(f"✅ Seeded Module {module['module_number']}: {module['title']}")
    
    print(f"\n🎓 Advanced IELTS Mastery Course seeded with {len(ADVANCED_MODULES)} modules")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_advanced_mastery())
