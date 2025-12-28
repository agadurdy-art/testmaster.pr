"""
IELTS Academic Reading - Advanced Level (Band 7.0-9.0)
======================================================
Strategic reading content for Advanced Mastery Course.

Content Types:
- Research articles
- Academic reviews
- Reports and analyses
- Cause-effect studies

Skill Categories:
1. Main Idea & Global Understanding
2. Factual Detail Retrieval
3. Writer's Intention & Purpose
4. Inference & Implication
5. Conditions & Exceptions

Question Types (Band 7.0-9.0):
- Inference questions
- Purpose questions
- Exception questions
- Complex matching
"""

from typing import Dict, List, Any

# =============================================================================
# ADVANCED ACADEMIC READING - MODULE-SPECIFIC CONTENT
# =============================================================================

ADVANCED_ACADEMIC_READING: Dict[str, Dict[str, Any]] = {
    
    # =========================================================================
    # MODULE 1: DIGITAL FRONTIER - TECHNOLOGY & AI
    # =========================================================================
    "digital_frontier": {
        "module_id": "digital_frontier",
        "module_title": "The Digital Frontier: AI, Automation, and the Future of Work",
        "track": "academic",
        "band_target": "7.0-9.0",
        "strategic_focus": "Analyzing research articles on technological disruption",
        "learning_outcome": "After this reading, you will be able to identify researchers' positions, evaluate evidence quality, and synthesize complex arguments about AI and automation.",
        
        "reading_scenario": {
            "title": "The Paradox of Automation: Job Displacement vs. Job Creation",
            "text_type": "Academic Research Article",
            "source_context": "Adapted from the Journal of Economic Perspectives, 2024",
            "word_count": 850,
            
            "passage": """The relationship between technological advancement and employment has been a subject of intense scholarly debate since the Industrial Revolution. While early economists predicted widespread technological unemployment, historical evidence suggests a more nuanced picture. This article examines the contemporary automation paradox: the simultaneous displacement and creation of jobs through artificial intelligence and robotics.

The displacement effect of automation is well-documented. According to Frey and Osborne's influential 2013 study, approximately 47% of US employment was at high risk of computerization within two decades. Subsequent research by the McKinsey Global Institute (2017) estimated that 400-800 million workers globally could be displaced by automation by 2030. However, these projections have faced substantial criticism for methodological limitations, particularly their failure to account for task-level automation rather than wholesale job replacement.

Recent empirical studies present a more complex narrative. Autor and Salomons (2018) analyzed employment data across 19 countries from 1970 to 2007 and found that while automation did reduce labor demand in directly affected industries, it simultaneously generated substantial employment growth in other sectors through what economists term the "reinstatement effect." This effect operates through three primary channels: the creation of new tasks requiring human labor, increased productivity leading to lower prices and higher demand, and capital accumulation that finances new industries.

The quality of newly created jobs remains contentious. Acemoglu and Restrepo (2020) distinguish between "so-so technologies" that automate tasks without significant productivity gains and "brilliant technologies" that create substantial new value. Their research suggests that recent decades have seen a preponderance of so-so automation, particularly in manufacturing and retail, contributing to wage stagnation among middle-skill workers while benefiting high-skill and, paradoxically, some low-skill workers in non-automatable service roles.

Geographical concentration of both job losses and gains presents another dimension of the automation paradox. Research by Berger and Frey (2016) demonstrates that routine-intensive jobs, predominantly located in suburban and rural areas, are most susceptible to automation, while new technology-driven employment clusters in major metropolitan centers. This spatial mismatch exacerbates existing regional inequalities and poses significant challenges for labor market policy.

The role of institutional factors in mediating automation's employment effects deserves particular attention. Comparative studies by Thelen (2019) reveal substantial variation across advanced economies in how automation impacts workers. Countries with strong vocational training systems, active labor market policies, and coordinated wage bargaining—such as Germany and the Nordic nations—have managed to distribute automation's productivity gains more equitably while maintaining higher overall employment rates.

Looking ahead, the emergence of generative artificial intelligence introduces new uncertainties. Unlike previous automation waves that primarily affected routine manual and cognitive tasks, large language models and AI image generators threaten non-routine cognitive work traditionally considered automation-resistant. Early evidence from Brynjolfsson et al. (2023) suggests that AI assistants can boost worker productivity by 14% on average, with the largest gains among less experienced workers, potentially reducing rather than exacerbating skill-based inequality.

The policy implications of this research are significant. Rather than viewing automation as an inevitable force with predetermined outcomes, the evidence suggests that societal choices regarding education, labor market institutions, and technology governance will substantially shape automation's employment consequences. Investment in lifelong learning, portable benefits systems, and regional development policies emerge as crucial interventions for ensuring that technological progress translates into broadly shared prosperity.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "What is the main limitation of Frey and Osborne's 2013 study according to subsequent researchers?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) It overestimated the timeline for automation",
                        "B) It failed to account for task-level automation rather than complete job replacement",
                        "C) It only examined the US employment market",
                        "D) It did not consider artificial intelligence"
                    ],
                    "answer": "B",
                    "explanation": "The passage states that projections 'faced substantial criticism for methodological limitations, particularly their failure to account for task-level automation rather than wholesale job replacement.'"
                },
                {
                    "id": "q2",
                    "question": "According to Autor and Salomons' research, the 'reinstatement effect' operates through all of the following EXCEPT:",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Creation of new tasks requiring human labor",
                        "B) Government subsidies for displaced workers",
                        "C) Increased productivity leading to lower prices and higher demand",
                        "D) Capital accumulation financing new industries"
                    ],
                    "answer": "B",
                    "explanation": "The passage lists three channels: new tasks, productivity/demand effects, and capital accumulation. Government subsidies are not mentioned as part of the reinstatement effect."
                },
                {
                    "id": "q3",
                    "question": "What does the author imply about the relationship between 'so-so technologies' and wage inequality?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) So-so technologies benefit all workers equally",
                        "B) So-so technologies primarily benefit high-skill workers",
                        "C) So-so technologies contribute to wage stagnation for middle-skill workers",
                        "D) So-so technologies only affect manufacturing jobs"
                    ],
                    "answer": "C",
                    "explanation": "The passage states that 'so-so automation' contributes to 'wage stagnation among middle-skill workers while benefiting high-skill and some low-skill workers.'"
                },
                {
                    "id": "q4",
                    "question": "The author's primary purpose in mentioning Germany and the Nordic nations is to:",
                    "type": "purpose",
                    "skill_tested": ["Writer's Intention & Purpose"],
                    "options": [
                        "A) Argue that these countries have the best technology sectors",
                        "B) Illustrate how institutional factors can mediate automation's negative effects",
                        "C) Criticize other countries' labor policies",
                        "D) Suggest that automation should be restricted"
                    ],
                    "answer": "B",
                    "explanation": "These countries are presented as examples where 'strong vocational training systems, active labor market policies' help distribute automation's gains more equitably."
                },
                {
                    "id": "q5",
                    "question": "Based on the passage, which statement best captures the author's overall position on automation?",
                    "type": "main_idea",
                    "skill_tested": ["Main Idea & Global Understanding"],
                    "options": [
                        "A) Automation will inevitably lead to mass unemployment",
                        "B) Automation is entirely beneficial for economic growth",
                        "C) Automation's effects depend significantly on policy choices and institutional factors",
                        "D) Automation should be halted until its effects are better understood"
                    ],
                    "answer": "C",
                    "explanation": "The conclusion emphasizes that 'societal choices regarding education, labor market institutions, and technology governance will substantially shape automation's employment consequences.'"
                },
                {
                    "id": "q6",
                    "question": "The research by Brynjolfsson et al. (2023) suggests that AI assistants:",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Primarily benefit experienced workers",
                        "B) Reduce overall productivity",
                        "C) Potentially reduce skill-based inequality by helping less experienced workers more",
                        "D) Have no measurable impact on worker performance"
                    ],
                    "answer": "C",
                    "explanation": "The passage states that AI assistants provide 'the largest gains among less experienced workers, potentially reducing rather than exacerbating skill-based inequality.'"
                }
            ],
            
            "vocabulary_focus": [
                {"term": "paradox", "meaning": "a seemingly contradictory situation", "context": "automation paradox"},
                {"term": "displacement", "meaning": "the act of forcing something/someone out of its usual place", "context": "job displacement"},
                {"term": "reinstatement", "meaning": "restoration to a previous condition or position", "context": "reinstatement effect"},
                {"term": "preponderance", "meaning": "the quality of being greater in number or importance", "context": "preponderance of so-so automation"},
                {"term": "exacerbate", "meaning": "to make worse", "context": "exacerbates existing regional inequalities"}
            ],
            
            "reading_tips": [
                "Pay attention to researchers' names and dates—they often signal different viewpoints",
                "Look for signal words like 'however,' 'although,' and 'while' that indicate contrasts",
                "Distinguish between direct evidence and the author's interpretation",
                "Note qualifying language ('suggests,' 'may,' 'potentially') that indicates uncertainty"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 2: GREEN IMPERATIVE - ENVIRONMENT
    # =========================================================================
    "green_imperative": {
        "module_id": "green_imperative",
        "module_title": "The Green Imperative: Climate, Sustainability, and Ecological Balance",
        "track": "academic",
        "band_target": "7.0-9.0",
        "strategic_focus": "Evaluating scientific reports on environmental challenges",
        "learning_outcome": "After this reading, you will be able to analyze scientific evidence, understand causal relationships, and evaluate environmental policy arguments.",
        
        "reading_scenario": {
            "title": "Urban Green Infrastructure: A Multi-Dimensional Approach to Climate Resilience",
            "text_type": "Academic Review Article",
            "source_context": "Adapted from Environmental Science & Policy, 2023",
            "word_count": 780,
            
            "passage": """The escalating frequency and intensity of climate-related hazards in urban areas have prompted a fundamental reassessment of city planning paradigms. Traditional "grey infrastructure"—engineered systems such as concrete drainage networks and air conditioning—increasingly proves inadequate for managing compound climate risks. This review synthesizes recent research on urban green infrastructure (UGI) as a multifunctional approach to building climate resilience.

Urban green infrastructure encompasses a spectrum of nature-based solutions, from street trees and green roofs to urban forests and constructed wetlands. Unlike conventional infrastructure, UGI provides multiple co-benefits beyond its primary function. Research by Demuzere et al. (2014) identified over 40 distinct ecosystem services delivered by UGI, spanning climate regulation, air quality improvement, stormwater management, biodiversity support, and human health benefits.

The thermal regulation capacity of UGI has received considerable attention given rising heat-related mortality. Meta-analyses by Bowler et al. (2010) and Ziter et al. (2019) demonstrate that urban parks can be 0.94°C to 3.5°C cooler than surrounding built-up areas, with cooling effects extending up to 300 meters beyond park boundaries. Individual street trees provide more localized but significant cooling, reducing surface temperatures by up to 12°C in their immediate vicinity. However, the effectiveness of green cooling strategies varies substantially with climate type, urban form, and vegetation characteristics.

Stormwater management represents another critical UGI function as precipitation patterns become more variable. Green roofs can retain 40-90% of rainfall depending on design depth and antecedent conditions, while bioswales and rain gardens infiltrate runoff while removing pollutants. A comprehensive study of Philadelphia's green stormwater infrastructure program (Valderrama et al., 2019) found that distributed green infrastructure reduced combined sewer overflows by 1.5 billion gallons annually while costing 75% less than equivalent grey infrastructure expansion.

Despite these benefits, significant implementation barriers persist. Initial installation costs for UGI typically exceed those of conventional alternatives, even when lifecycle cost analyses often favor green options. Maintenance requirements differ fundamentally from grey infrastructure, demanding horticultural expertise that municipal agencies may lack. Furthermore, the equitable distribution of UGI benefits raises environmental justice concerns, as studies consistently demonstrate that lower-income neighborhoods have significantly less green space per capita.

The question of scale presents particular challenges for UGI planning. While individual green elements provide measurable local benefits, achieving city-wide climate resilience requires strategic coordination. Network approaches to UGI planning (Hansen et al., 2019) emphasize connectivity between green spaces to maximize ecological function and create "green corridors" that support both wildlife movement and human active transportation.

Recent innovations in UGI design address some traditional limitations. Intensive green roofs with deeper soil profiles support greater plant diversity and water retention than earlier extensive designs. "Sponge city" initiatives in China integrate UGI at unprecedented scales, with Wuhan targeting 20% of urban area converted to permeable surfaces by 2030. Emerging research explores hybrid grey-green systems that combine the reliability of engineered solutions with the co-benefits of natural systems.

For UGI to fulfill its potential in climate adaptation, governance frameworks must evolve accordingly. Successful programs like Singapore's "City in a Garden" initiative demonstrate that consistent political commitment, dedicated funding mechanisms, and cross-sectoral coordination can overcome implementation barriers. As climate risks intensify, the case for integrating nature-based solutions into urban planning grows increasingly compelling.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "What is the author's main argument about urban green infrastructure?",
                    "type": "main_idea",
                    "skill_tested": ["Main Idea & Global Understanding"],
                    "options": [
                        "A) UGI should completely replace grey infrastructure",
                        "B) UGI offers a multifunctional approach to climate resilience with multiple co-benefits",
                        "C) UGI is too expensive for most cities to implement",
                        "D) UGI is only effective for stormwater management"
                    ],
                    "answer": "B",
                    "explanation": "The passage presents UGI as 'a multifunctional approach to building climate resilience' with 'over 40 distinct ecosystem services.'"
                },
                {
                    "id": "q2",
                    "question": "According to the research cited, what is the maximum cooling effect of urban parks compared to surrounding areas?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) 0.94°C",
                        "B) 3.5°C",
                        "C) 12°C",
                        "D) 300 meters"
                    ],
                    "answer": "B",
                    "explanation": "The passage states parks 'can be 0.94°C to 3.5°C cooler,' so 3.5°C is the maximum park cooling. The 12°C figure refers to street trees, not parks."
                },
                {
                    "id": "q3",
                    "question": "Which of the following is NOT mentioned as an implementation barrier for UGI?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Higher initial installation costs",
                        "B) Need for specialized maintenance expertise",
                        "C) Community opposition to green spaces",
                        "D) Inequitable distribution of benefits across neighborhoods"
                    ],
                    "answer": "C",
                    "explanation": "Community opposition is never mentioned. The barriers listed are costs, maintenance requirements, and environmental justice concerns."
                },
                {
                    "id": "q4",
                    "question": "The author implies that the Philadelphia green stormwater program demonstrates:",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) Grey infrastructure is always more cost-effective",
                        "B) UGI can achieve environmental goals at lower cost than traditional approaches",
                        "C) Philadelphia has the most advanced UGI in the United States",
                        "D) Green roofs are the most effective UGI element"
                    ],
                    "answer": "B",
                    "explanation": "The program 'costing 75% less than equivalent grey infrastructure expansion' demonstrates cost-effectiveness of UGI."
                },
                {
                    "id": "q5",
                    "question": "Why does the author mention 'sponge city' initiatives in China?",
                    "type": "purpose",
                    "skill_tested": ["Writer's Intention & Purpose"],
                    "options": [
                        "A) To criticize China's environmental policies",
                        "B) To illustrate large-scale implementation of UGI innovations",
                        "C) To argue that Asian cities are more advanced than Western cities",
                        "D) To explain why UGI is ineffective"
                    ],
                    "answer": "B",
                    "explanation": "The sponge city example appears in the 'innovations' paragraph to show 'unprecedented scales' of UGI integration."
                },
                {
                    "id": "q6",
                    "question": "What conditions does the author suggest are necessary for UGI to succeed?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication", "Conditions & Exceptions"],
                    "options": [
                        "A) Lower construction costs and simpler maintenance",
                        "B) Political commitment, dedicated funding, and cross-sectoral coordination",
                        "C) Complete replacement of all grey infrastructure",
                        "D) Focus on a single type of green element"
                    ],
                    "answer": "B",
                    "explanation": "The final paragraph identifies 'consistent political commitment, dedicated funding mechanisms, and cross-sectoral coordination' as success factors."
                }
            ],
            
            "vocabulary_focus": [
                {"term": "paradigm", "meaning": "a typical example or pattern of something; a model", "context": "planning paradigms"},
                {"term": "multifunctional", "meaning": "having or fulfilling several functions", "context": "multifunctional approach"},
                {"term": "co-benefits", "meaning": "secondary benefits beyond the primary purpose", "context": "multiple co-benefits"},
                {"term": "meta-analysis", "meaning": "statistical analysis combining results from multiple studies", "context": "meta-analyses by Bowler"},
                {"term": "antecedent", "meaning": "preceding in time or order", "context": "antecedent conditions"}
            ],
            
            "reading_tips": [
                "Track numerical data carefully—distinguish between ranges and specific values",
                "Notice how the author structures the argument: benefits → barriers → solutions",
                "Pay attention to examples from different countries and what they illustrate"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 3: EDUCATIONAL PARADIGM
    # =========================================================================
    "educational_paradigm": {
        "module_id": "educational_paradigm",
        "module_title": "The Educational Paradigm: Learning, Assessment, and Knowledge Transfer",
        "track": "academic",
        "band_target": "7.0-9.0",
        "strategic_focus": "Analyzing educational research and pedagogical theories",
        "learning_outcome": "After this reading, you will be able to evaluate educational theories, compare assessment approaches, and synthesize arguments about learning effectiveness.",
        
        "reading_scenario": {
            "title": "Rethinking Assessment: From Measurement to Learning Enhancement",
            "text_type": "Academic Research Review",
            "source_context": "Adapted from Educational Researcher, 2023",
            "word_count": 820,
            
            "passage": """The traditional conception of assessment as a mechanism for sorting and certifying students has undergone substantial revision in educational research over the past three decades. This article traces the evolution from assessment of learning to assessment for learning, examining both the theoretical foundations and practical implications of this paradigm shift.

Historically, large-scale standardized testing emerged in the early twentieth century as a tool for efficient classification. The development of psychometric theory provided sophisticated methods for ensuring test reliability and validity, establishing assessment as a scientific enterprise. However, critics increasingly questioned whether such measurements captured the complex, multidimensional nature of student learning. Messick's (1989) seminal work on validity expanded the concept beyond technical accuracy to include the consequences of test use—a transformation that opened space for reconceptualizing assessment's fundamental purpose.

The assessment for learning movement, pioneered by Black and Wiliam's (1998) influential review, shifted attention from summative evaluation to formative processes. Their analysis of 250 studies demonstrated that formative assessment interventions produced substantial learning gains, with effect sizes between 0.4 and 0.7—among the largest of any educational intervention. Crucially, the benefits were most pronounced for lower-achieving students, suggesting formative assessment's potential to reduce educational inequalities.

Formative assessment operates through multiple mechanisms. Feedback that helps students understand the gap between current and desired performance enables targeted improvement. Self-assessment develops metacognitive awareness, allowing students to monitor and regulate their own learning. Peer assessment engages students in applying evaluative criteria, deepening their understanding of quality. However, the effectiveness of these strategies depends critically on implementation quality—poorly designed feedback or superficial peer review may yield minimal benefits.

The tension between formative and summative functions presents ongoing challenges. Teachers often struggle to integrate formative practices within systems dominated by high-stakes testing. Research by Harlen and Deakin Crick (2003) documented negative effects of excessive summative testing on student motivation, particularly among lower achievers who experienced repeated failure. Conversely, entirely eliminating grades and rankings risks undermining accountability and failing to prepare students for competitive environments they will encounter.

Recent developments in technology offer potential solutions to this tension. Adaptive learning systems can provide immediate, personalized feedback without the motivational costs of comparative evaluation. Learning analytics enable tracking of student progress across multiple dimensions rather than reducing achievement to single scores. Stealth assessment embedded in educational games captures evidence of learning without interrupting engagement. However, algorithmic assessment raises new concerns about transparency, equity, and the reduction of learning to measurable outcomes.

Alternative assessment approaches attempt to capture richer evidence of learning. Portfolio assessment documents student work over time, revealing development trajectories invisible to one-time testing. Performance assessment requires students to demonstrate skills in authentic contexts rather than selecting answers from predetermined options. Competency-based assessment focuses on what students can do rather than time spent in instruction. Each approach offers distinct advantages but also introduces challenges regarding reliability, scalability, and comparability.

The international landscape reveals diverse assessment philosophies. Finland's education system, consistently high-performing in international comparisons, minimizes standardized testing until age sixteen, emphasizing teacher professional judgment and formative practices. Singapore, equally successful, maintains more frequent assessment but integrates it systematically with curriculum and instruction. These examples suggest that assessment effectiveness depends less on specific techniques than on coherent alignment with broader educational goals and contexts.

Looking forward, assessment reform requires addressing systemic factors beyond classroom practices. Teacher preparation programs must develop assessment literacy as a core competency. Policy frameworks should create space for multiple forms of evidence rather than privileging easily quantified outcomes. Most fundamentally, societies must grapple with the purposes education serves—whether primarily as credential signaling, human capital development, or individual flourishing—as different answers imply different assessment paradigms.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "What is the central distinction the author draws between traditional and reformed assessment?",
                    "type": "main_idea",
                    "skill_tested": ["Main Idea & Global Understanding"],
                    "options": [
                        "A) Traditional assessment is cheaper than reformed assessment",
                        "B) Traditional assessment focuses on sorting students; reformed assessment focuses on enhancing learning",
                        "C) Traditional assessment uses technology; reformed assessment does not",
                        "D) Traditional assessment is less accurate than reformed assessment"
                    ],
                    "answer": "B",
                    "explanation": "The passage contrasts 'assessment of learning' (sorting/certifying) with 'assessment for learning' (enhancement)."
                },
                {
                    "id": "q2",
                    "question": "According to Black and Wiliam's research, which group benefited most from formative assessment?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) High-achieving students",
                        "B) Average students",
                        "C) Lower-achieving students",
                        "D) All students equally"
                    ],
                    "answer": "C",
                    "explanation": "The passage states 'the benefits were most pronounced for lower-achieving students.'"
                },
                {
                    "id": "q3",
                    "question": "Which of the following does the author suggest is NOT a mechanism through which formative assessment works?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Feedback helping students understand performance gaps",
                        "B) Competitive ranking motivating student effort",
                        "C) Self-assessment developing metacognitive awareness",
                        "D) Peer assessment deepening understanding of quality"
                    ],
                    "answer": "B",
                    "explanation": "Competitive ranking is associated with summative assessment and its negative effects, not formative assessment mechanisms."
                },
                {
                    "id": "q4",
                    "question": "The author mentions stealth assessment in educational games in order to:",
                    "type": "purpose",
                    "skill_tested": ["Writer's Intention & Purpose"],
                    "options": [
                        "A) Criticize the gamification of education",
                        "B) Illustrate how technology might reduce assessment's motivational costs",
                        "C) Argue that games are better than traditional instruction",
                        "D) Show that assessment is unnecessary"
                    ],
                    "answer": "B",
                    "explanation": "Stealth assessment is presented as a technological solution that 'captures evidence of learning without interrupting engagement.'"
                },
                {
                    "id": "q5",
                    "question": "What can be inferred from the comparison between Finland and Singapore?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) Finland's approach is superior to Singapore's",
                        "B) Less testing always produces better educational outcomes",
                        "C) Different assessment approaches can be effective when aligned with broader educational contexts",
                        "D) Asian countries prefer more testing than European countries"
                    ],
                    "answer": "C",
                    "explanation": "Both are 'equally successful' despite different approaches, suggesting 'effectiveness depends less on specific techniques than on coherent alignment.'"
                },
                {
                    "id": "q6",
                    "question": "According to the author, what must be addressed for meaningful assessment reform?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication", "Main Idea & Global Understanding"],
                    "options": [
                        "A) Only classroom practices need to change",
                        "B) Systemic factors including teacher preparation and policy frameworks",
                        "C) Assessment reform is impossible given current constraints",
                        "D) Technology must be completely eliminated from assessment"
                    ],
                    "answer": "B",
                    "explanation": "The conclusion emphasizes 'systemic factors beyond classroom practices' including teacher preparation and policy frameworks."
                }
            ],
            
            "vocabulary_focus": [
                {"term": "psychometric", "meaning": "relating to the measurement of mental capacities and processes", "context": "psychometric theory"},
                {"term": "summative", "meaning": "evaluating at the end of a learning period", "context": "summative evaluation"},
                {"term": "formative", "meaning": "serving to form or develop during the learning process", "context": "formative assessment"},
                {"term": "metacognitive", "meaning": "awareness of one's own thought processes", "context": "metacognitive awareness"},
                {"term": "paradigm", "meaning": "a typical pattern or model of something", "context": "assessment paradigms"}
            ],
            
            "reading_tips": [
                "Notice the chronological structure—from historical origins to current developments to future directions",
                "Track contrasting concepts: summative vs. formative, sorting vs. enhancing",
                "Pay attention to conditional statements about when strategies work"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 4: HEALTH PUBLIC POLICY
    # =========================================================================
    "health_public_policy": {
        "module_id": "health_public_policy",
        "module_title": "Healthcare Systems: Access, Equity, and Public Health",
        "track": "academic",
        "band_target": "7.0-9.0",
        "strategic_focus": "Analyzing health policy research and epidemiological studies",
        "learning_outcome": "After this reading, you will be able to evaluate health policy arguments, interpret statistical evidence, and compare healthcare system approaches.",
        
        "reading_scenario": {
            "title": "Universal Healthcare: Comparing Models and Outcomes",
            "text_type": "Comparative Policy Analysis",
            "source_context": "Adapted from The Lancet Public Health, 2024",
            "word_count": 800,
            
            "passage": """The design of healthcare systems fundamentally shapes population health outcomes, financial protection, and social equity. This comparative analysis examines three dominant models of universal healthcare—single-payer, social insurance, and regulated multi-payer—evaluating their performance across key dimensions.

Single-payer systems, exemplified by Canada's Medicare and the UK's National Health Service, concentrate healthcare financing in a single public entity. Theoretical advantages include administrative simplicity, monopsony purchasing power that constrains costs, and universal coverage as a citizenship right rather than employment benefit. Empirical evidence broadly supports these claims: Commonwealth Fund comparisons consistently rank the UK favorably on administrative efficiency and equity of access, while Canada achieves universal coverage at per capita costs 40% below the United States.

However, single-payer systems face distinctive challenges. Centralized budget allocation can create political pressures that lead to underfunding, manifesting as extended wait times for elective procedures. Data from the Canadian Institute for Health Information reveals median wait times of 21 weeks from general practitioner referral to treatment in 2023—a figure that has deteriorated over the past decade. Critics argue that prohibiting private alternatives, as in Canada, reduces system flexibility and constrains individual choice.

Social insurance models, predominant in continental Europe, achieve universal coverage through mandatory contributions to nonprofit insurance funds. Germany's Krankenkassen system, dating from 1883, requires all residents to maintain coverage through approximately 100 competing sickness funds, with premiums linked to income and employers contributing half. This model preserves patient choice while achieving near-universal coverage, though administrative costs exceed single-payer systems and income-based premiums create complex cross-subsidization.

France's variation on social insurance consistently ranks among the world's top health systems in WHO evaluations. The statutory health insurance system covers approximately 75% of costs, with supplementary insurance providing additional coverage for most residents. This layered approach achieves excellent access and patient satisfaction while maintaining reasonable cost control—France spends 11.1% of GDP on healthcare compared to America's 17.8%.

Regulated multi-payer systems, as found in the Netherlands and Switzerland, mandate individual purchase of private insurance within tightly regulated markets. The Dutch model requires insurers to accept all applicants at community-rated premiums, with government subsidies for low-income households and risk equalization transfers between insurers. Proponents argue this approach combines competition's efficiency incentives with universal access, though critics note that introducing market dynamics into healthcare inevitably increases administrative complexity.

Cross-national comparisons reveal important insights but require careful interpretation. Countries with superior health outcomes often share characteristics beyond healthcare system design—lower inequality, stronger social safety nets, different disease burdens—making causal attribution difficult. The United States represents a crucial counterfactual: despite spending far more than any comparable nation, it achieves worse outcomes on most population health metrics while leaving millions uninsured, demonstrating that healthcare spending alone does not ensure system performance.

Reform trajectories vary significantly across nations. Taiwan's transition to single-payer in 1995 demonstrated that rapid universal coverage expansion is achievable, though subsequently controlling costs proved challenging. The Affordable Care Act moved the United States toward regulated multi-payer principles, substantially reducing uninsured rates while preserving employer-based coverage for most. Developing nations like Thailand and Rwanda have achieved remarkable coverage expansion through creative adaptation rather than wholesale adoption of any single model.

No healthcare system design optimizes all objectives simultaneously. Single-payer maximizes equity and administrative simplicity at potential cost to responsiveness and innovation. Social insurance balances multiple goals but with greater complexity. Regulated markets may encourage efficiency but risk fragmenting risk pools. The optimal choice depends on societal values, existing institutions, and political feasibility—technical analysis can inform but cannot resolve fundamentally normative questions about healthcare's place in society.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "What is the author's main argument about healthcare system design?",
                    "type": "main_idea",
                    "skill_tested": ["Main Idea & Global Understanding"],
                    "options": [
                        "A) Single-payer systems are clearly superior",
                        "B) Different models have different trade-offs and no system optimizes all objectives",
                        "C) Healthcare should be entirely privatized",
                        "D) The US system is the best model to follow"
                    ],
                    "answer": "B",
                    "explanation": "The conclusion explicitly states 'No healthcare system design optimizes all objectives simultaneously' and outlines trade-offs."
                },
                {
                    "id": "q2",
                    "question": "According to the passage, what is a specific weakness of the Canadian single-payer system?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) High administrative costs",
                        "B) Extended wait times for elective procedures (21 weeks median)",
                        "C) Lack of universal coverage",
                        "D) High per capita costs"
                    ],
                    "answer": "B",
                    "explanation": "The passage specifically states 'median wait times of 21 weeks from general practitioner referral to treatment in 2023.'"
                },
                {
                    "id": "q3",
                    "question": "Which of the following is NOT mentioned as a characteristic of the German social insurance model?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Mandatory contributions to nonprofit insurance funds",
                        "B) Income-linked premiums",
                        "C) Government-owned hospitals",
                        "D) Employer contributions of half the premium"
                    ],
                    "answer": "C",
                    "explanation": "Government-owned hospitals are not mentioned. The passage describes the insurance structure, not hospital ownership."
                },
                {
                    "id": "q4",
                    "question": "Why does the author include the United States as an example?",
                    "type": "purpose",
                    "skill_tested": ["Writer's Intention & Purpose"],
                    "options": [
                        "A) To recommend the US model to other countries",
                        "B) To demonstrate that high spending alone does not ensure good outcomes",
                        "C) To criticize American culture",
                        "D) To argue for completely private healthcare"
                    ],
                    "answer": "B",
                    "explanation": "The US is described as a 'crucial counterfactual' showing that 'healthcare spending alone does not ensure system performance.'"
                },
                {
                    "id": "q5",
                    "question": "What can be inferred about France's healthcare spending compared to the United States?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) France spends more than the US",
                        "B) France achieves better rankings while spending a lower percentage of GDP",
                        "C) France and the US spend the same amount",
                        "D) France's spending data is not available"
                    ],
                    "answer": "B",
                    "explanation": "France spends 11.1% of GDP vs. America's 17.8% while ranking 'among the world's top health systems.'"
                },
                {
                    "id": "q6",
                    "question": "According to the passage, what makes cross-national healthcare comparisons difficult?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication", "Factual Detail Retrieval"],
                    "options": [
                        "A) Countries refuse to share healthcare data",
                        "B) Countries with better outcomes often have other beneficial characteristics like lower inequality",
                        "C) Healthcare systems are too similar to compare",
                        "D) The data collection methods are incompatible"
                    ],
                    "answer": "B",
                    "explanation": "The passage notes that countries with better outcomes 'often share characteristics beyond healthcare system design—lower inequality, stronger social safety nets.'"
                }
            ],
            
            "vocabulary_focus": [
                {"term": "monopsony", "meaning": "a market situation where there is only one buyer", "context": "monopsony purchasing power"},
                {"term": "counterfactual", "meaning": "relating to what has not happened or is not the case", "context": "crucial counterfactual"},
                {"term": "normative", "meaning": "relating to standards or value judgments", "context": "fundamentally normative questions"},
                {"term": "cross-subsidization", "meaning": "using profits from one area to support another", "context": "complex cross-subsidization"},
                {"term": "trajectory", "meaning": "the path followed by something developing or changing", "context": "reform trajectories"}
            ],
            
            "reading_tips": [
                "Create a mental comparison table: model type → advantages → disadvantages",
                "Note statistical figures and what countries they refer to",
                "Distinguish between correlation and causation in health outcomes"
            ]
        }
    },
    
    # =========================================================================
    # MODULE 5: CRIME & JUSTICE
    # =========================================================================
    "crime_justice": {
        "module_id": "crime_justice",
        "module_title": "Crime, Punishment, and Rehabilitation",
        "track": "academic",
        "band_target": "7.0-9.0",
        "strategic_focus": "Analyzing criminological research and policy evaluation",
        "learning_outcome": "After this reading, you will be able to evaluate evidence on criminal justice policies, understand recidivism factors, and compare rehabilitation approaches.",
        
        "reading_scenario": {
            "title": "Beyond Incarceration: Evidence on Restorative Justice and Rehabilitation",
            "text_type": "Academic Review",
            "source_context": "Adapted from Criminology & Public Policy, 2023",
            "word_count": 790,
            
            "passage": """The dramatic expansion of imprisonment in many Western nations since the 1970s has prompted sustained scholarly examination of incarceration's effectiveness in reducing crime. This review synthesizes evidence on alternatives to traditional punishment, with particular focus on restorative justice and rehabilitation programs.

Mass incarceration in the United States represents the most extreme case, with the prison population increasing from approximately 300,000 in 1970 to over 2 million by 2020. Research on the crime-reduction effects of this expansion yields surprisingly modest results. Studies by Durlauf and Nagin (2011) estimate that the elasticity of crime with respect to incarceration is approximately -0.1 to -0.2, meaning a 10% increase in imprisonment produces only a 1-2% decrease in crime. Moreover, research consistently demonstrates that certainty of punishment deters crime more effectively than severity, suggesting that policing investments may yield greater public safety returns than prison expansion.

The collateral consequences of incarceration extend far beyond the individual prisoner. Western (2006) documented how incarceration disrupts employment trajectories, reduces lifetime earnings by 10-20%, and destabilizes families. Children of incarcerated parents face elevated risks of behavioral problems, educational difficulties, and subsequent criminal involvement—creating intergenerational cycles that perpetuate disadvantage. The concentration of incarceration in specific communities compounds these effects, removing working-age adults and fragmenting social networks.

Restorative justice represents a fundamentally different response to crime, emphasizing accountability to victims and communities rather than punishment by the state. Programs typically bring offenders into structured dialogue with victims and community members, acknowledging harm and developing plans for repair. Meta-analyses by Sherman and Strang (2007) found that restorative justice conferences reduced reoffending by approximately 27% compared to conventional prosecution, with effects strongest for violent crimes where victim participation was highest.

However, restorative justice faces significant limitations. Victim participation rates vary substantially—many crime victims, particularly for serious offenses, choose not to engage directly with offenders. Critics argue that voluntary processes cannot adequately address power imbalances or ensure proportional responses to serious harms. Implementation requires substantial investment in trained facilitators and may function primarily as a supplement rather than replacement for conventional justice processes.

Rehabilitation programs within correctional settings show variable effectiveness depending on program type and implementation quality. Lipsey and Cullen's (2007) comprehensive review found that therapeutic approaches—particularly cognitive-behavioral programs addressing criminal thinking patterns—reduced recidivism by 10-20% when implemented with fidelity. Educational and vocational programs show modest positive effects, with GED completion associated with approximately 7% reduction in recidivism. Conversely, programs based on deterrence, such as "scared straight" interventions exposing youth to prison environments, actually increase subsequent offending.

The Norwegian correctional system offers an instructive contrast to American approaches. Despite relatively short sentences and prison conditions emphasizing preparation for release, Norway maintains one of the world's lowest recidivism rates—approximately 20% within five years compared to over 50% in the United States. Research attributes this success to a combination of humane conditions, intensive rehabilitation programming, and robust social support upon release.

Reintegration support after release emerges as a critical factor in reducing recidivism. Transitional housing, employment assistance, and continued treatment access substantially reduce reoffending rates. A randomized evaluation of the Transitional Jobs program found that providing immediate employment to formerly incarcerated individuals reduced recidivism by 22% over three years. However, collateral consequences of conviction—including employment restrictions, housing barriers, and disenfranchisement—often undermine reintegration efforts.

The evidence suggests that effectively reducing crime requires moving beyond the incarceration-versus-alternatives framing. Both punishment and rehabilitation play roles in an effective criminal justice system. The key insight from research is that public safety is better served by front-end investments in prevention, moderate and certain consequences, rehabilitation during incarceration, and sustained support after release than by lengthy prison sentences that may actually increase long-term offending.""",
            
            "questions": [
                {
                    "id": "q1",
                    "question": "What is the main conclusion the author draws about mass incarceration's effectiveness?",
                    "type": "main_idea",
                    "skill_tested": ["Main Idea & Global Understanding"],
                    "options": [
                        "A) Mass incarceration has been highly effective at reducing crime",
                        "B) Mass incarceration produces surprisingly modest crime-reduction effects relative to its costs",
                        "C) Mass incarceration should be expanded further",
                        "D) Mass incarceration only affects violent criminals"
                    ],
                    "answer": "B",
                    "explanation": "The research yields 'surprisingly modest results' with only 1-2% crime reduction for 10% imprisonment increase."
                },
                {
                    "id": "q2",
                    "question": "According to the passage, what type of program actually increases reoffending rates?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Cognitive-behavioral programs",
                        "B) Educational programs",
                        "C) 'Scared straight' deterrence programs",
                        "D) Restorative justice conferences"
                    ],
                    "answer": "C",
                    "explanation": "The passage explicitly states that 'scared straight' interventions 'actually increase subsequent offending.'"
                },
                {
                    "id": "q3",
                    "question": "Which of the following is NOT mentioned as a limitation of restorative justice?",
                    "type": "exception",
                    "skill_tested": ["Conditions & Exceptions"],
                    "options": [
                        "A) Variable victim participation rates",
                        "B) Power imbalances in voluntary processes",
                        "C) High costs compared to traditional prosecution",
                        "D) Need for trained facilitators"
                    ],
                    "answer": "C",
                    "explanation": "Cost comparison is not mentioned. The limitations listed are participation, power imbalances, and facilitator requirements."
                },
                {
                    "id": "q4",
                    "question": "Why does the author include the Norwegian example?",
                    "type": "purpose",
                    "skill_tested": ["Writer's Intention & Purpose"],
                    "options": [
                        "A) To criticize Scandinavian countries",
                        "B) To illustrate that rehabilitation-focused systems can achieve low recidivism despite less punitive approaches",
                        "C) To argue that Norway has no crime",
                        "D) To show that cultural factors make comparison impossible"
                    ],
                    "answer": "B",
                    "explanation": "Norway is presented as an 'instructive contrast' showing low recidivism (20%) despite 'relatively short sentences.'"
                },
                {
                    "id": "q5",
                    "question": "What does the research suggest is more effective at deterring crime than severity of punishment?",
                    "type": "factual_detail",
                    "skill_tested": ["Factual Detail Retrieval"],
                    "options": [
                        "A) Longer prison sentences",
                        "B) Certainty of punishment",
                        "C) Solitary confinement",
                        "D) Public shaming"
                    ],
                    "answer": "B",
                    "explanation": "The passage states 'certainty of punishment deters crime more effectively than severity.'"
                },
                {
                    "id": "q6",
                    "question": "What can be inferred about the author's view on the 'incarceration-versus-alternatives' debate?",
                    "type": "inference",
                    "skill_tested": ["Inference & Implication"],
                    "options": [
                        "A) Incarceration should be completely eliminated",
                        "B) Only alternatives to incarceration should be used",
                        "C) The framing is too simplistic; both punishment and rehabilitation have roles to play",
                        "D) The debate cannot be resolved with current evidence"
                    ],
                    "answer": "C",
                    "explanation": "The conclusion calls for 'moving beyond the incarceration-versus-alternatives framing,' noting 'both punishment and rehabilitation play roles.'"
                }
            ],
            
            "vocabulary_focus": [
                {"term": "recidivism", "meaning": "the tendency to reoffend or return to criminal behavior", "context": "reduced recidivism"},
                {"term": "elasticity", "meaning": "a measure of responsiveness of one variable to changes in another", "context": "elasticity of crime"},
                {"term": "collateral", "meaning": "secondary; accompanying but subordinate", "context": "collateral consequences"},
                {"term": "intergenerational", "meaning": "existing or occurring between generations", "context": "intergenerational cycles"},
                {"term": "reintegration", "meaning": "the process of being restored to society", "context": "reintegration support"}
            ],
            
            "reading_tips": [
                "Track effectiveness percentages and what interventions they refer to",
                "Notice the contrast structure: problem → alternative approaches → evidence → limitations",
                "Pay attention to causal claims versus correlational observations"
            ]
        }
    }
}

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_academic_reading_by_module(module_id: str) -> Dict[str, Any]:
    """Get academic reading content for a specific module."""
    module_lower = module_id.lower().replace('-', '_').replace(' ', '_')
    return ADVANCED_ACADEMIC_READING.get(module_lower)

def get_all_academic_reading_modules() -> List[Dict[str, Any]]:
    """Get summary of all available academic reading modules."""
    return [
        {
            "module_id": k,
            "module_title": v["module_title"],
            "strategic_focus": v["strategic_focus"],
            "band_target": v["band_target"],
            "text_type": v["reading_scenario"]["text_type"]
        }
        for k, v in ADVANCED_ACADEMIC_READING.items()
    ]

def get_reading_skill_categories() -> List[Dict[str, str]]:
    """Get all reading skill categories with descriptions."""
    return [
        {"id": "main_idea", "name": "Main Idea & Global Understanding", "description": "Understanding the overall argument and thesis"},
        {"id": "factual_detail", "name": "Factual Detail Retrieval", "description": "Locating specific information stated in the text"},
        {"id": "purpose", "name": "Writer's Intention & Purpose", "description": "Understanding why the author includes specific information"},
        {"id": "inference", "name": "Inference & Implication", "description": "Drawing conclusions beyond what is explicitly stated"},
        {"id": "exception", "name": "Conditions & Exceptions", "description": "Identifying what is NOT mentioned or exceptions to rules"}
    ]
