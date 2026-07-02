"""IELTS dual-track (Academic/GT) course content. Extracted from services/dual_track_courses.py (Faz 1 refactor, 2026-07-02). DATA ONLY."""

# ============ ADVANCED MODULE-SPECIFIC STRATEGIC WRITING ============
# Each module has a focused General Training writing scenario
# Focus: Tone + Purpose + Argument (not grammar)
ADVANCED_MODULE_STRATEGIC_WRITING = {
    "digital_frontier": {
        "module_id": "digital_frontier",
        "module_title": "The Digital Frontier",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Formal complaint escalation and consumer rights",
        "learning_outcome": "Write sophisticated complaints about digital services requiring nuanced argumentation and professional escalation techniques.",
        "writing_scenario": {
            "title": "Digital Service Complaint Escalation",
            "context": "You have been experiencing persistent problems with a major tech company's service. Your initial complaints have been ignored.",
            "prompt": "Write a letter to the CEO of a technology company.\n\nIn your letter:\n- Summarize your previous attempts to resolve the issue\n- Explain the broader impact on your work/life\n- Propose a fair resolution\n- Indicate consequences of inaction",
            "strategic_elements": {
                "tone": "Firm but professional, assertive without being aggressive",
                "purpose": "Escalate while maintaining credibility for further action",
                "argument": "Build logical case with documented evidence references"
            },
            "key_phrases": [
                "Despite multiple attempts to resolve this matter through conventional channels...",
                "I have thoroughly documented each interaction...",
                "The cumulative impact of this ongoing issue has been...",
                "I trust you will appreciate the gravity of this situation...",
                "I remain committed to resolving this amicably, however..."
            ],
            "model_answer": {
                "band_8": "Dear Mr. Chen,\n\nI am writing to you directly following the failure of your customer service department to adequately address a critical issue that has now persisted for over eight weeks.\n\nSince March 15th, I have contacted your support team on no fewer than seven occasions regarding persistent data synchronisation failures in your CloudPro business suite. Each interaction has been documented (reference numbers: CS-2847 through CS-2853), yet the responses have ranged from generic troubleshooting suggestions to promises of escalation that never materialised.\n\nThe implications extend far beyond mere inconvenience. As a freelance consultant, I rely heavily on your platform for client project management. The recurring failures have resulted in missed deadlines, compromised client relationships, and an estimated loss of approximately £4,500 in project value.\n\nI propose the following resolution: full refund of subscription fees for the affected period (£350), compensation equivalent to one year's subscription for the documented losses, and a formal assurance that the technical issue will be prioritised for resolution.\n\nShould this matter not be addressed within fourteen days, I shall have no alternative but to pursue formal complaint procedures through the relevant regulatory bodies and share my documented experience on professional networks.\n\nI trust you will recognise the urgency of this matter and respond accordingly.\n\nYours sincerely,\nJames Morrison"
            }
        }
    },
    "green_imperative": {
        "module_id": "green_imperative",
        "module_title": "The Green Imperative",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Community advocacy and environmental proposal writing",
        "learning_outcome": "Write persuasive letters proposing environmental initiatives to local authorities with strategic stakeholder consideration.",
        "writing_scenario": {
            "title": "Environmental Initiative Proposal",
            "context": "You want to propose a significant environmental project to your local council that requires community buy-in.",
            "prompt": "Write a letter to your local council proposing an environmental initiative.\n\nIn your letter:\n- Present your proposal with clear benefits\n- Address potential objections proactively\n- Offer to contribute to implementation\n- Request a meeting to discuss further",
            "strategic_elements": {
                "tone": "Enthusiastic but practical, visionary yet grounded",
                "purpose": "Secure support by addressing concerns before they're raised",
                "argument": "Balance idealism with pragmatism and cost-awareness"
            },
            "key_phrases": [
                "I write to propose an initiative that I believe could significantly benefit...",
                "While I acknowledge the financial considerations involved...",
                "Research from comparable communities suggests...",
                "I would be delighted to volunteer my time to...",
                "I am confident that with community support..."
            ],
            "model_answer": {
                "band_8": "Dear Councillor Roberts,\n\nI am writing to propose the establishment of a community composting scheme in the Riverside Ward, an initiative that I believe could deliver substantial environmental and social benefits while proving financially viable.\n\nThe proposal involves converting the unused section of Memorial Park into a community composting facility, enabling residents to process organic waste locally. Based on successful models in Eastbourne and Brighton, such schemes typically divert 2-3 tonnes of waste annually from landfill while producing valuable compost for community gardens.\n\nI anticipate concerns regarding cost and maintenance. To address these, I have assembled a group of thirty committed residents willing to manage operations voluntarily. Additionally, I have secured provisional interest from Green Solutions Ltd, who would provide initial equipment and training at reduced cost in exchange for being recognised as a sustainability partner.\n\nRegarding potential objections about aesthetics or odour, modern composting systems using enclosed bins and appropriate carbon-nitrogen ratios produce no offensive smells when managed correctly. I can provide specifications from the suppliers.\n\nI would welcome the opportunity to present this proposal in greater detail at an appropriate committee meeting. I am committed to making this initiative a model for community-led environmental action.\n\nYours sincerely,\nDr. Sarah Mitchell"
            }
        }
    },
    "educational_paradigm": {
        "module_id": "educational_paradigm",
        "module_title": "The Educational Paradigm",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Academic advocacy and institutional appeals",
        "learning_outcome": "Write sophisticated appeals to educational institutions requiring diplomatic argument and evidence-based reasoning.",
        "writing_scenario": {
            "title": "Academic Policy Appeal",
            "context": "You disagree with a decision made by an educational institution and wish to appeal through formal channels.",
            "prompt": "Write a letter appealing an academic decision.\n\nIn your letter:\n- State the decision you are appealing\n- Present your grounds for appeal with evidence\n- Acknowledge any procedural requirements\n- Request specific reconsideration",
            "strategic_elements": {
                "tone": "Respectful but firm, acknowledging authority while asserting rights",
                "purpose": "Overturn decision while maintaining future relationship",
                "argument": "Focus on procedure and fairness rather than emotion"
            },
            "key_phrases": [
                "I am writing to formally appeal the decision of...",
                "While I respect the committee's authority, I believe there are grounds for reconsideration...",
                "The evidence I wish to present for your consideration includes...",
                "I would request that my case be reviewed in light of...",
                "I remain committed to meeting all academic standards..."
            ],
            "model_answer": {
                "band_8": "Dear Professor Whitmore,\n\nI am writing to formally appeal the Academic Standards Committee's decision of 14th November to deny my application for extenuating circumstances consideration regarding my final year dissertation.\n\nWhile I fully respect the Committee's role in maintaining academic integrity, I believe relevant evidence was not adequately considered in reaching this decision. Specifically, I submitted medical documentation from Dr. Sarah Chen at University Health Services confirming diagnosis of a significant condition in September. However, the Committee's response indicated this was received after the deadline, when in fact I can demonstrate electronic submission via the portal at 23:47 on 30th September—three minutes before the midnight deadline.\n\nFurthermore, I understand from the Student Support Office that the Committee may not have received the supplementary statement from my Personal Tutor, Dr. James Harrison, who can attest to the impact on my research schedule.\n\nI request that my case be reconsidered with these documents properly included in my file. I am prepared to present my case in person if required, and I can provide additional supporting evidence from my GP if this would assist.\n\nI remain fully committed to completing my degree to the highest standard and trust the Committee will give this appeal fair consideration.\n\nYours sincerely,\nEmily Chang"
            }
        }
    },
    "globalisation_cultural": {
        "module_id": "globalisation_cultural",
        "module_title": "Globalisation and Cultural Identity",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Cross-cultural business communication and international relations",
        "learning_outcome": "Write culturally sensitive business correspondence that bridges different communication styles and expectations.",
        "writing_scenario": {
            "title": "International Business Partnership Proposal",
            "context": "You are proposing a business collaboration with a company from a different cultural background.",
            "prompt": "Write a letter proposing a business partnership with an international company.\n\nIn your letter:\n- Introduce yourself and your organisation\n- Explain the mutual benefits of collaboration\n- Address potential cultural considerations\n- Propose next steps for discussion",
            "strategic_elements": {
                "tone": "Formal and respectful, acknowledging cultural differences",
                "purpose": "Build trust and open dialogue for future collaboration",
                "argument": "Emphasise mutual benefit and long-term relationship"
            },
            "key_phrases": [
                "I have the pleasure of writing to introduce...",
                "We have long admired your organisation's approach to...",
                "I believe there may be significant mutual benefit in exploring...",
                "We are committed to building relationships founded on respect and trust...",
                "I would be honoured to arrange a meeting at your convenience..."
            ],
            "model_answer": {
                "band_8": "Dear Mr. Tanaka,\n\nI have the pleasure of introducing myself as the International Partnerships Director at Greenfield Sustainable Foods, a British company specialising in organic product development.\n\nI am writing following your presentation at the Tokyo International Food Exhibition, where I was deeply impressed by your company's commitment to quality and your innovative approach to traditional food preservation methods. Having researched Yamamoto Foods' distinguished 75-year history, I believe there may be significant opportunity for collaboration that would benefit both our organisations.\n\nSpecifically, I envision a partnership whereby our organic certification expertise and European distribution network could complement your exceptional product development capabilities. This could open European markets to your artisan products while providing our customers with authentic, traditionally crafted foods.\n\nI recognise that building meaningful business relationships requires time and mutual understanding, and I am committed to proceeding at whatever pace feels appropriate. I would welcome the opportunity to visit Osaka to learn more about your operations and share details of our organisation in person.\n\nI have enclosed our company profile and recent annual report for your consideration. I would be honoured to receive your thoughts on whether such a partnership might align with your strategic objectives.\n\nWith respectful regards,\nRobert Harrison\nInternational Partnerships Director"
            }
        }
    },
    "health_public_policy": {
        "module_id": "health_public_policy",
        "module_title": "Health and Public Policy",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Healthcare advocacy and institutional negotiation",
        "learning_outcome": "Write compelling healthcare-related correspondence that combines empathy with strategic argumentation.",
        "writing_scenario": {
            "title": "Healthcare Access Advocacy Letter",
            "context": "You are writing to a health authority to advocate for improved services in your area.",
            "prompt": "Write a letter to the regional health authority.\n\nIn your letter:\n- Describe the current service gap\n- Present evidence of community impact\n- Propose practical solutions\n- Offer community collaboration",
            "strategic_elements": {
                "tone": "Empathetic but evidence-based, collaborative not confrontational",
                "purpose": "Secure change through partnership rather than pressure",
                "argument": "Combine emotional appeal with practical proposals"
            },
            "key_phrases": [
                "I am writing on behalf of the residents of...",
                "The human impact of this service gap is significant...",
                "We have gathered evidence through community consultation showing...",
                "I would like to propose a collaborative approach...",
                "Our community is prepared to support implementation through..."
            ],
            "model_answer": {
                "band_8": "Dear Dr. Williams,\n\nI am writing on behalf of the Westbrook Community Health Action Group to address the growing gap in mental health services for young people in our area.\n\nSince the closure of the Westbrook Youth Mental Health clinic in 2022, young people requiring support have faced a 34-mile round trip to the nearest alternative service. Our community survey of 450 families revealed that 62% have experienced delayed access to care as a result, with several families reporting serious deterioration in their children's conditions during waiting periods.\n\nThe human cost extends beyond statistics. The Smith family, who have given permission to share their story, waited seven months for an initial assessment for their 14-year-old daughter, during which time she was hospitalised twice. Such cases, while extreme, illustrate the urgent need for intervention.\n\nWe propose a partnership to establish a fortnightly outreach clinic at the Westbrook Community Centre. Our group has already secured the venue at no cost, and local GPs have offered to provide supervision. We estimate this would reduce pressure on centralised services while serving approximately 200 young people within the catchment area.\n\nI would welcome the opportunity to present our proposal in detail and discuss how community resources might complement NHS provision.\n\nYours sincerely,\nDr. Margaret Stone\nChair, Westbrook Community Health Action Group"
            }
        }
    },
    "crime_justice": {
        "module_id": "crime_justice",
        "module_title": "Crime, Justice, and the Penal System",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Formal legal correspondence and victim advocacy",
        "learning_outcome": "Write formal correspondence related to legal matters requiring precise language and appropriate advocacy tone.",
        "writing_scenario": {
            "title": "Victim Support and Legal Process Letter",
            "context": "You are writing to support a friend or family member who has been a victim of crime through the legal process.",
            "prompt": "Write a character reference letter for a court case.\n\nIn your letter:\n- Explain your relationship with the person\n- Provide specific examples of their character\n- Address any relevant circumstances\n- Make a respectful appeal to the court",
            "strategic_elements": {
                "tone": "Formal and respectful, sincere without being sycophantic",
                "purpose": "Provide credible insight while maintaining court decorum",
                "argument": "Use specific examples rather than general praise"
            },
            "key_phrases": [
                "I am writing this letter in support of...",
                "I have known [name] for [period] in my capacity as...",
                "I can speak directly to [his/her] character based on...",
                "I respectfully submit that the court consider...",
                "I am prepared to provide further testimony if required..."
            ],
            "model_answer": {
                "band_8": "To the Presiding Judge,\n\nI am writing to provide a character reference for Thomas Wright in relation to case CR-2024-0847. I am a Senior Social Worker with fifteen years' experience, and I have known Mr. Wright professionally for the past four years through my work with vulnerable adults.\n\nDuring this time, I have observed Mr. Wright consistently demonstrate exceptional compassion and reliability. When his elderly neighbour, Mrs. Patterson, suffered a stroke in 2022, Mr. Wright organised a rota of neighbours to ensure she received daily visits during her recovery. He personally handled her shopping and prescription collections for eight months without ever seeking recognition.\n\nI am aware of the circumstances that have brought Mr. Wright before the court. Without commenting on matters that are for the court to decide, I can confirm that he has been open with me about his struggles during the period in question. What I have witnessed since is a genuine commitment to addressing those issues, including his voluntary attendance at the support group I facilitate.\n\nI respectfully submit that the Mr. Wright I know is fundamentally a person of good character who has made significant positive contributions to our community. I am confident he will continue to do so given appropriate support.\n\nI remain available to provide further information if the court requires.\n\nRespectfully submitted,\nMargaret Evans\nBSW, MSW\nSenior Social Worker"
            }
        }
    },
    "media_integrity": {
        "module_id": "media_integrity",
        "module_title": "Media and Information Integrity",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Media complaints and press standards accountability",
        "learning_outcome": "Write effective complaints to media organisations about inaccurate reporting or ethical breaches.",
        "writing_scenario": {
            "title": "Press Standards Complaint",
            "context": "You have been personally affected by inaccurate or unfair media reporting and wish to seek correction.",
            "prompt": "Write a complaint to a newspaper's editor about inaccurate reporting.\n\nIn your letter:\n- Identify the specific inaccuracies\n- Explain the impact on you or your organisation\n- Reference relevant press standards\n- Request specific remedial action",
            "strategic_elements": {
                "tone": "Professional and measured, avoiding emotional language",
                "purpose": "Secure correction while maintaining credibility",
                "argument": "Focus on factual inaccuracies and professional standards"
            },
            "key_phrases": [
                "I am writing regarding the article published on...",
                "The following statements are factually incorrect...",
                "Under IPSO guidelines regarding accuracy...",
                "The publication of this inaccurate information has resulted in...",
                "I request that you publish a correction and..."
            ],
            "model_answer": {
                "band_8": "Dear Editor,\n\nI am writing regarding the article 'Local Business Owner Under Investigation' published in your newspaper on 15th October (page 7), which contains several significant factual inaccuracies concerning my company, Greenwood Catering Services.\n\nFirstly, the article states that Environmental Health has 'launched an investigation' into our premises. This is incorrect. An Environmental Health officer conducted a routine scheduled inspection on 10th October—our fourth such inspection this year—resulting in our sixth consecutive 5-star food hygiene rating.\n\nSecondly, the article quotes 'an anonymous source' claiming several staff members reported concerns about food storage. I can confirm that no such reports have been made to any regulatory body, and I have statements from all seven staff members categorically denying having spoken to your newspaper.\n\nThe publication of this article, prominently positioned and accompanied by a photograph of our premises, has resulted in immediate and measurable damage. We have received four cancellations of advance bookings worth approximately £3,200, and our social media accounts have been subjected to hostile comments citing your article.\n\nUnder IPSO Editors' Code Clause 1 (Accuracy), newspapers must take care not to publish inaccurate, misleading or distorted information. I believe this standard has been breached.\n\nI request that you: (1) publish a correction of equivalent prominence within seven days, and (2) provide details of the 'source' cited, to enable us to consider further action.\n\nYours faithfully,\nMark Greenwood\nManaging Director, Greenwood Catering Services"
            }
        }
    },
    "economy_wealth": {
        "module_id": "economy_wealth",
        "module_title": "Government, Economy, and Wealth Disparity",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Financial advocacy and consumer protection correspondence",
        "learning_outcome": "Write sophisticated financial complaint letters requiring understanding of consumer rights and regulatory frameworks.",
        "writing_scenario": {
            "title": "Financial Misconduct Complaint",
            "context": "You have identified potentially unfair practices by a financial institution.",
            "prompt": "Write a formal complaint to a financial services company.\n\nIn your letter:\n- Detail the specific practices you believe are unfair\n- Reference relevant regulations\n- Explain the financial impact\n- Request investigation and compensation",
            "strategic_elements": {
                "tone": "Assertive and well-informed, demonstrating regulatory knowledge",
                "purpose": "Secure resolution while establishing grounds for escalation",
                "argument": "Frame personal experience within regulatory framework"
            },
            "key_phrases": [
                "I am writing to make a formal complaint under the FCA complaint handling procedures...",
                "I believe this practice contravenes...",
                "The financial impact has been quantified as...",
                "Under the Consumer Rights Act 2015...",
                "Should this matter not be resolved within eight weeks..."
            ],
            "model_answer": {
                "band_8": "Dear Complaints Department,\n\nI am writing to make a formal complaint under Financial Conduct Authority complaint handling procedures regarding the systematic overcharging of fees on my Premium Current Account (account number ending 4872).\n\nOver the past eighteen months, I have been charged thirty-seven separate 'monthly premium fees' of £15.95 despite repeatedly requesting downgrade to a standard account. Each request—made on 14th March 2023, 2nd July 2023, and 15th November 2023—was acknowledged but never actioned. I have retained copies of all correspondence.\n\nI believe this practice contravenes Principle 6 of the FCA's Principles for Business, which requires firms to treat customers fairly. Additionally, under the Consumer Rights Act 2015, I should not be charged for services I have explicitly rejected.\n\nThe financial impact totals £590.15 in fees I should not have incurred. Furthermore, I have spent approximately eight hours attempting to resolve this matter, representing significant personal inconvenience.\n\nI request: (1) immediate refund of all premium fees charged since my first downgrade request (£590.15); (2) compensation of £150 for time and distress; and (3) written confirmation that my account has been converted.\n\nShould this matter not be satisfactorily resolved within your eight-week handling period, I intend to refer it to the Financial Ombudsman Service.\n\nYours faithfully,\nElizabeth Morgan"
            }
        }
    },
    "urbanisation": {
        "module_id": "urbanisation",
        "module_title": "Urbanisation and Modern Society",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Urban planning objections and community representation",
        "learning_outcome": "Write effective objection letters to planning proposals requiring balanced argument and community advocacy.",
        "writing_scenario": {
            "title": "Planning Application Objection",
            "context": "A development proposal threatens your community's character or amenities.",
            "prompt": "Write a letter objecting to a planning application.\n\nIn your letter:\n- Identify the specific planning concerns\n- Present evidence-based objections\n- Propose alternative approaches\n- Request appropriate consideration",
            "strategic_elements": {
                "tone": "Constructive rather than purely oppositional",
                "purpose": "Influence decision while appearing reasonable",
                "argument": "Focus on planning policy, not personal preference"
            },
            "key_phrases": [
                "I am writing to object to planning application reference...",
                "This development would be contrary to Policy XX of the Local Plan...",
                "The cumulative impact on the area would include...",
                "I would suggest the following modifications...",
                "I trust the committee will give these concerns appropriate weight..."
            ],
            "model_answer": {
                "band_8": "Dear Planning Committee,\n\nI am writing to object to planning application 2024/PLN/00547 for the construction of 85 residential units on the former Millbrook industrial site.\n\nWhile I support the principle of developing this brownfield site, I have significant concerns regarding the current proposal's compatibility with the Local Development Plan.\n\nFirstly, the proposed density of 85 units significantly exceeds Policy H2's guidance of 30-40 units per hectare for this zone. At the proposed density, the development would place unsustainable pressure on local infrastructure, particularly Millbrook Primary School, which is already at 98% capacity.\n\nSecondly, the transport assessment fails to adequately address the impact on the B4051 junction, which already exceeds capacity during peak hours. The proposal for only 0.7 parking spaces per unit will inevitably result in overspill parking on surrounding residential streets.\n\nThirdly, the design fails to respect the character of the adjacent conservation area, with building heights of four storeys where three is the established maximum.\n\nI would suggest the following modifications be considered: reducing the development to 55 units with a maximum height of three storeys, incorporating a Section 106 contribution to school expansion, and requiring one parking space per unit.\n\nI trust the committee will give these concerns appropriate weight in their deliberations.\n\nYours faithfully,\nDavid Morrison"
            }
        }
    },
    "science_bioethics": {
        "module_id": "science_bioethics",
        "module_title": "Science and Biomedical Ethics",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Medical research participation and informed consent correspondence",
        "learning_outcome": "Write informed correspondence regarding medical research participation with appropriate questioning and rights awareness.",
        "writing_scenario": {
            "title": "Clinical Trial Inquiry Letter",
            "context": "You are considering participating in medical research and need clarification on important aspects.",
            "prompt": "Write a letter to a research institution about a clinical trial.\n\nIn your letter:\n- Express your interest in participation\n- Request specific information about risks and procedures\n- Ask about your rights as a participant\n- Seek clarification on data handling",
            "strategic_elements": {
                "tone": "Informed and thoughtful, demonstrating awareness of research ethics",
                "purpose": "Gather information while demonstrating suitable participant qualities",
                "argument": "Balance enthusiasm with appropriate caution"
            },
            "key_phrases": [
                "I am writing to express my interest in participating in...",
                "I would appreciate clarification on the following aspects...",
                "I understand that participation is voluntary and I may withdraw...",
                "Could you please explain how my data will be...",
                "I would be grateful for an opportunity to discuss..."
            ],
            "model_answer": {
                "band_8": "Dear Research Team,\n\nI am writing to express my interest in participating in the CARDIO-PREDICT study (reference HP-2024-0156) following my discussion with Dr. Ahmed at the Cardiology Department.\n\nHaving read the participant information sheet, I am broadly supportive of the research objectives and believe my health profile may be suitable. However, I would appreciate clarification on several points before proceeding.\n\nFirstly, regarding the experimental medication: the information sheet mentions 'potential cardiovascular effects' as a known risk. Could you provide more specific information about the nature and frequency of such effects observed in previous phases?\n\nSecondly, I understand that participation involves five hospital visits over twelve months. Would there be flexibility in appointment scheduling for participants with work commitments?\n\nThirdly, concerning data handling: I note that anonymised data may be shared with international research partners. Could you clarify which organisations might receive this data and under what regulatory frameworks?\n\nFinally, I would like to understand the process should I wish to withdraw mid-study. Specifically, would any data collected before withdrawal be retained?\n\nI remain genuinely interested in contributing to this research and would welcome an opportunity to discuss these points in person.\n\nYours sincerely,\nJennifer Brooks"
            }
        }
    },
    "public_transport": {
        "module_id": "public_transport",
        "module_title": "Public Transport and Sustainable Infrastructure",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Transport infrastructure advocacy and policy engagement",
        "learning_outcome": "Write persuasive letters advocating for transport improvements with evidence-based arguments.",
        "writing_scenario": {
            "title": "Public Transport Improvement Proposal",
            "context": "Your community lacks adequate public transport and you want to advocate for improvements.",
            "prompt": "Write a letter to the regional transport authority.\n\nIn your letter:\n- Describe the current transport deficiencies\n- Present evidence of community impact\n- Propose specific improvements\n- Offer to facilitate community input",
            "strategic_elements": {
                "tone": "Collaborative and solution-focused",
                "purpose": "Secure commitment to improvements while building partnership",
                "argument": "Combine resident testimony with economic/environmental benefits"
            },
            "key_phrases": [
                "I am writing on behalf of residents to highlight...",
                "Our community survey demonstrates that...",
                "The economic implications include...",
                "We propose the following improvements...",
                "We are prepared to facilitate community engagement..."
            ],
            "model_answer": {
                "band_8": "Dear Director of Strategic Planning,\n\nI am writing on behalf of the Oakfield Residents Association to address the urgent need for improved public transport connectivity in our area.\n\nThe closure of bus routes 47 and 52 in 2021 has left 3,400 households without direct public transport access to the town centre. Our community survey of 800 residents revealed that 67% now rely on private vehicles for journeys that were previously made by bus, while 23% of non-drivers report significant hardship accessing essential services.\n\nThe economic and environmental implications are substantial. Local businesses report an average 15% decline in footfall since the route closures, and the council's own air quality data shows increased particulate levels along the B3042—now the primary alternative route.\n\nWe propose the following: (1) reinstatement of hourly service to the town centre via a revised route 47; (2) integration with the planned cycle infrastructure on Mill Lane; and (3) a demand-responsive service for elderly residents.\n\nThe Residents Association has secured commitments from local employers to subsidise bus passes, potentially making the route commercially viable.\n\nWe are prepared to facilitate community engagement sessions and gather data to support the business case. I would welcome the opportunity to present our proposal in detail.\n\nYours sincerely,\nMichael Patterson\nChair, Oakfield Residents Association"
            }
        }
    },
    "work_employment": {
        "module_id": "work_employment",
        "module_title": "Work, Employment, and the Evolving Labor Market",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Employment dispute resolution and workplace rights",
        "learning_outcome": "Write effective formal correspondence regarding workplace issues and employment rights.",
        "writing_scenario": {
            "title": "Flexible Working Request",
            "context": "You need to request a change to your working arrangements and must make a formal case.",
            "prompt": "Write a formal flexible working request to your employer.\n\nIn your letter:\n- Specify the change you are requesting\n- Explain the reasons for your request\n- Address potential business concerns\n- Propose solutions to maintain productivity",
            "strategic_elements": {
                "tone": "Professional and reasonable, demonstrating business awareness",
                "purpose": "Secure approval by addressing concerns proactively",
                "argument": "Frame personal needs within business benefit terms"
            },
            "key_phrases": [
                "I am writing to make a statutory flexible working request...",
                "The change I am proposing would involve...",
                "I believe this arrangement would benefit the business by...",
                "I have considered the following potential concerns...",
                "I propose the following measures to maintain productivity..."
            ],
            "model_answer": {
                "band_8": "Dear Ms. Harrison,\n\nI am writing to make a statutory flexible working request under Section 80F of the Employment Rights Act 1996.\n\nI am requesting to change my working pattern from 9am-5pm office-based to a hybrid arrangement: three days office-based (Tuesday, Wednesday, Thursday) and two days working from home (Monday, Friday). This arrangement would commence from 1st February and continue indefinitely.\n\nThe primary reason for this request relates to my recent appointment as primary carer for my elderly mother following her diagnosis with early-stage dementia. The proposed arrangement would enable me to manage medical appointments and care coordination while maintaining my professional commitments.\n\nI have carefully considered potential impacts on my role. Regarding team collaboration, I note that our critical project meetings already occur on Tuesdays and Wednesdays, which I would attend in person. For client interactions, I propose maintaining full availability via video conference and committing to attend the office for any client visits with 48 hours' notice.\n\nTo maintain productivity, I suggest: (1) installing company-approved VPN access; (2) weekly 1:1 calls with you to review priorities; and (3) a three-month review period to assess the arrangement's effectiveness.\n\nI am committed to ensuring this change supports rather than hinders my performance. I am happy to discuss this proposal and consider alternative arrangements.\n\nYours sincerely,\nRebecca Thompson"
            }
        }
    },
    "social_demographics": {
        "module_id": "social_demographics",
        "module_title": "Social Issues: Demographics and Generational Equity",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Social policy advocacy and citizen engagement",
        "learning_outcome": "Write compelling advocacy letters on social issues requiring balanced representation of diverse perspectives.",
        "writing_scenario": {
            "title": "Intergenerational Housing Policy Letter",
            "context": "You want to advocate for housing policies that benefit both older and younger generations.",
            "prompt": "Write a letter to your Member of Parliament about housing policy.\n\nIn your letter:\n- Describe the housing challenges in your area\n- Present perspectives from different generations\n- Propose policies that could help both groups\n- Request specific parliamentary action",
            "strategic_elements": {
                "tone": "Diplomatic and inclusive, avoiding generational blame",
                "purpose": "Build cross-generational coalition for change",
                "argument": "Present as common challenge requiring collective solutions"
            },
            "key_phrases": [
                "I am writing to you as a constituent concerned about...",
                "This issue affects residents across all age groups...",
                "Both older residents and young families have expressed...",
                "I would propose policies that address...",
                "I would welcome the opportunity to discuss..."
            ],
            "model_answer": {
                "band_8": "Dear Ms. Thompson MP,\n\nI am writing as a constituent to express concern about the housing situation in Westford, which affects residents across all generations.\n\nAt our recent community forum, I was struck by how housing challenges connect rather than divide us. Young families shared their struggles to afford homes near aging parents who need support. Meanwhile, older residents spoke of being unable to downsize because suitable smaller properties are equally unaffordable.\n\nThe statistics reflect these concerns: average house prices in Westford have risen 45% in five years, while social housing waiting lists have doubled. At the same time, 340 three-bedroom council properties are occupied by single pensioners who would welcome smaller accommodation if it were available.\n\nI would propose a package addressing multiple needs: (1) incentivised downsizing schemes allowing elderly residents to move to purpose-built flats while freeing family homes; (2) community land trust development on council-owned sites; and (3) improved planning enforcement against second-home conversions.\n\nThese approaches would help young families access housing while enabling older residents to remain in supportive communities—addressing what appears to be generational conflict as the shared challenge it actually is.\n\nI would welcome the opportunity to discuss these proposals and share testimonies from community members.\n\nYours sincerely,\nDr. James Wilson"
            }
        }
    },
    "education_philosophy": {
        "module_id": "education_philosophy",
        "module_title": "Education and Pedagogical Philosophy",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Educational governance and parental advocacy",
        "learning_outcome": "Write effective correspondence to educational institutions regarding policy concerns.",
        "writing_scenario": {
            "title": "School Policy Feedback Letter",
            "context": "Your school has introduced a policy you have concerns about.",
            "prompt": "Write a letter to your school's governing body about a policy concern.\n\nIn your letter:\n- Acknowledge the policy's intentions\n- Present your specific concerns\n- Offer alternative suggestions\n- Request dialogue on the matter",
            "strategic_elements": {
                "tone": "Respectful and constructive, parent as partner not adversary",
                "purpose": "Influence policy while maintaining collaborative relationship",
                "argument": "Frame concerns as helping achieve the school's own goals"
            },
            "key_phrases": [
                "I am writing as a parent to offer feedback on...",
                "I understand the rationale behind this policy...",
                "My concern is that in practice...",
                "I would suggest the following modifications...",
                "I believe we share the goal of..."
            ],
            "model_answer": {
                "band_8": "Dear Chair of Governors,\n\nI am writing as a parent to offer constructive feedback on the new mobile phone policy introduced this term.\n\nI understand and support the rationale behind restricting phone use during lessons—research clearly demonstrates the impact of device distractions on learning. I also appreciate the consultation process that preceded this decision.\n\nHowever, I have concerns about the policy's application to before-school and break times. My daughter, Emma (Year 9), uses her phone to coordinate with me regarding her after-school care arrangements, which vary daily due to my shift work. Under the current policy, she cannot check messages even during breaks, leading to significant anxiety about collection arrangements.\n\nSeveral other working parents have expressed similar concerns. We are not seeking unlimited phone access, but rather a balanced approach that acknowledges legitimate family communication needs.\n\nI would suggest: (1) permitting supervised phone checks at morning break in a designated area; (2) allowing students to check phones after the final bell before leaving school; or (3) implementing a messaging system via the school office for urgent family communications.\n\nI believe we share the goal of an education environment that supports both academic focus and practical family coordination. I would welcome the opportunity to discuss this at the next parent forum.\n\nYours sincerely,\nSarah Mitchell"
            }
        }
    },
    "globalisation_homogenisation": {
        "module_id": "globalisation_homogenisation",
        "module_title": "Globalisation, Cultural Identity, and Homogenisation",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Cultural heritage protection and community identity",
        "learning_outcome": "Write persuasive letters advocating for cultural preservation in the face of development pressures.",
        "writing_scenario": {
            "title": "Heritage Protection Campaign Letter",
            "context": "A development threatens a site of cultural significance to your community.",
            "prompt": "Write a letter to the Heritage Protection Agency.\n\nIn your letter:\n- Describe the site's cultural significance\n- Explain the threat it faces\n- Present evidence of community attachment\n- Request formal protection status",
            "strategic_elements": {
                "tone": "Passionate but evidence-based, appealing to official criteria",
                "purpose": "Secure protection by meeting heritage designation requirements",
                "argument": "Connect local significance to broader heritage values"
            },
            "key_phrases": [
                "I am writing to request consideration for heritage protection of...",
                "The cultural significance of this site encompasses...",
                "Our community has gathered evidence demonstrating...",
                "The proposed development would irreversibly...",
                "We believe this site meets the criteria for..."
            ],
            "model_answer": {
                "band_8": "Dear Heritage Protection Officer,\n\nI am writing on behalf of the Riverside Heritage Group to request consideration for heritage protection of the Old Mill building and surrounding watermeadows on Mill Lane.\n\nThe cultural significance of this site encompasses multiple dimensions. The mill building, constructed in 1823, represents one of only three surviving examples of steam-powered grain mills in the region. Beyond its architectural merit, the site holds profound community significance—oral histories gathered from 47 long-term residents reveal that the annual Mill Fair, held continuously since 1856, remains a focal point of local identity.\n\nThe site now faces imminent threat from Planning Application 2024/PLN/00892, which proposes demolition of the mill and development of 120 residential units. While we recognise housing needs, we believe this particular site warrants protection rather than destruction.\n\nOur research documents: (1) the mill's inclusion in Pevsner's Architectural Guide as a 'notable survivor'; (2) archaeological evidence of medieval predecessor structures; and (3) the watermeadow system's value as a habitat corridor. We have petitions with 1,200 signatures supporting preservation.\n\nWe believe this site meets criteria for listing under both architectural and historic community significance. We request a formal assessment before any planning decision proceeds.\n\nYours faithfully,\nDr. Patricia Edwards\nChair, Riverside Heritage Group"
            }
        }
    },
    "environment_ecological": {
        "module_id": "environment_ecological",
        "module_title": "The Environment: Ecological Integrity and Sustainable Mitigation",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Environmental complaint and corporate accountability",
        "learning_outcome": "Write effective complaints about environmental issues requiring technical understanding and regulatory awareness.",
        "writing_scenario": {
            "title": "Environmental Pollution Complaint",
            "context": "You have observed environmental damage caused by a local business.",
            "prompt": "Write a complaint to the Environment Agency.\n\nIn your letter:\n- Describe the environmental issue you have observed\n- Provide evidence and documentation\n- Explain the ecological impact\n- Request investigation and enforcement",
            "strategic_elements": {
                "tone": "Factual and precise, avoiding emotional language",
                "purpose": "Trigger formal investigation through credible reporting",
                "argument": "Present observations systematically with supporting evidence"
            },
            "key_phrases": [
                "I wish to report what I believe to be a pollution incident...",
                "I have documented the following observations...",
                "The ecological impact has been evident in...",
                "I have attached photographic evidence dated...",
                "I request that this matter be formally investigated..."
            ],
            "model_answer": {
                "band_8": "Dear Environment Agency Incident Team,\n\nI wish to report what I believe to be ongoing industrial discharge into the River Millbrook from premises operated by Westfield Chemical Processing Ltd (grid reference: TQ 456 789).\n\nI have documented the following observations over a four-week period. On 3rd, 10th, 17th, and 24th March, I observed discoloured water—ranging from milky white to pale yellow—being discharged from an outfall pipe on the company's boundary fence directly into the river. Discharge appeared to occur between 6am and 7am on each occasion. I have photographic and video evidence with timestamps.\n\nThe ecological impact has been evident in the 500-metre stretch downstream. I have observed: significant reduction in invertebrate life on river stones; absence of the usual heron population; and a visible decline in aquatic vegetation. Additionally, local residents have reported an unusual chemical odour on multiple occasions.\n\nI understand that Westfield Chemical Processing holds an environmental permit, but I question whether the discharge I have documented falls within permitted parameters.\n\nI attach: (1) photographs with dates and grid references; (2) a log of my observations; and (3) a map showing the discharge point and affected area.\n\nI request formal investigation and would be willing to provide access to my property for monitoring equipment if helpful.\n\nYours faithfully,\nRobert Mitchell"
            }
        }
    },
    "crime_reintegration": {
        "module_id": "crime_reintegration",
        "module_title": "Crime, Justice, and Social Reintegration",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Rehabilitation advocacy and second-chance employment",
        "learning_outcome": "Write persuasive letters supporting rehabilitation programmes and second-chance employment.",
        "writing_scenario": {
            "title": "Rehabilitation Programme Support Letter",
            "context": "You want to advocate for a local rehabilitation programme facing funding cuts.",
            "prompt": "Write a letter to your local council about a rehabilitation programme.\n\nIn your letter:\n- Describe the programme and its purpose\n- Present evidence of its effectiveness\n- Explain the consequences of closure\n- Request continued support",
            "strategic_elements": {
                "tone": "Balanced and evidence-focused, addressing scepticism",
                "purpose": "Secure funding by demonstrating value for money",
                "argument": "Frame rehabilitation as practical benefit, not just compassion"
            },
            "key_phrases": [
                "I am writing to urge the council to continue support for...",
                "The evidence demonstrates that this programme...",
                "The cost-benefit analysis shows...",
                "Without this programme, the likely outcome is...",
                "I would welcome the opportunity to present..."
            ],
            "model_answer": {
                "band_8": "Dear Councillor Davies,\n\nI am writing to urge the council to continue funding for the Pathways Employment Programme, which I understand is under review due to budget constraints.\n\nAs a local business owner who has employed three programme participants over four years, I can speak to its practical value. The programme provides intensive employment preparation for individuals with criminal convictions, addressing the reality that stable employment reduces reoffending by up to 50%.\n\nThe evidence from Pathways' seven-year operation demonstrates clear effectiveness: 68% of participants remain in employment after two years, compared to 23% for the general ex-offender population. Of 340 participants, only 11% have reoffended—substantially below the national average of 48%.\n\nThe cost-benefit analysis is compelling. The programme costs approximately £450,000 annually but saves an estimated £2.1 million in reduced prison costs, court time, and benefits payments. Each successful participant represents approximately £37,000 in annual savings.\n\nWithout this programme, the likely outcome is increased reoffending, with consequent costs to victims, the justice system, and ultimately council budgets. The short-term saving would generate long-term expense.\n\nI would welcome the opportunity to present employer and participant testimonies at the relevant committee meeting.\n\nYours sincerely,\nMark Henderson\nManaging Director, Henderson Construction"
            }
        }
    },
    "public_health_allocation": {
        "module_id": "public_health_allocation",
        "module_title": "Public Health and Medical Resource Allocation",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Healthcare access advocacy and patient rights",
        "learning_outcome": "Write effective letters regarding healthcare access and treatment decisions.",
        "writing_scenario": {
            "title": "Treatment Access Appeal",
            "context": "You have been denied access to a treatment you believe should be available.",
            "prompt": "Write a letter appealing a healthcare funding decision.\n\nIn your letter:\n- State the treatment being requested\n- Present medical evidence supporting your case\n- Reference relevant guidelines and policies\n- Request formal reconsideration",
            "strategic_elements": {
                "tone": "Factual and measured, avoiding emotional manipulation",
                "purpose": "Secure reconsideration through procedural argument",
                "argument": "Focus on clinical evidence and policy compliance"
            },
            "key_phrases": [
                "I am writing to appeal the decision to decline funding for...",
                "The clinical evidence supporting this treatment includes...",
                "NICE guidelines TA-XXX state that...",
                "I believe my case meets the exceptional circumstances criteria because...",
                "I request that this decision be formally reconsidered..."
            ],
            "model_answer": {
                "band_8": "Dear Individual Funding Request Panel,\n\nI am writing to appeal the decision of 15th October to decline funding for Pembrolizumab treatment for my condition (reference: IFR-2024-0567).\n\nI understand that this treatment falls outside standard commissioning criteria. However, I believe my case meets the exceptional circumstances threshold for the following reasons.\n\nThe clinical evidence supporting this treatment in my specific situation includes: (1) documented failure of three previous lines of therapy; (2) positive PD-L1 expression (score 95%), placing me in the cohort most likely to benefit; and (3) otherwise good performance status (ECOG 1) suggesting I could tolerate treatment.\n\nNICE guidelines TA-531 acknowledge that patients with high PD-L1 expression may benefit from immunotherapy even outside currently commissioned indications. My oncologist, Dr. Sarah Chen, has provided a supporting statement confirming that standard options are exhausted and that she considers this treatment clinically appropriate.\n\nThe decision letter cites 'insufficient evidence of benefit.' I respectfully suggest this assessment did not fully consider the clinical papers I previously submitted (Chen et al., 2023; Morrison et al., 2024), which report response rates of 42% in patients with my profile.\n\nI request formal reconsideration of this decision and would welcome the opportunity to attend the panel in person.\n\nYours faithfully,\nElizabeth Morgan"
            }
        }
    },
    "media_journalism": {
        "module_id": "media_journalism",
        "module_title": "The Media Landscape: Journalism, Social Media, and the Public Interest",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Digital rights and online reputation management",
        "learning_outcome": "Write effective correspondence regarding online content removal and digital rights.",
        "writing_scenario": {
            "title": "Right to Be Forgotten Request",
            "context": "Outdated online content is affecting your reputation and you wish to have it removed.",
            "prompt": "Write a letter to a website requesting content removal.\n\nIn your letter:\n- Identify the content and its location\n- Explain why removal is justified\n- Reference relevant data protection rights\n- Request specific action",
            "strategic_elements": {
                "tone": "Professional and legally informed, not threatening",
                "purpose": "Secure removal by demonstrating clear legal grounds",
                "argument": "Balance rights assertion with reasonable expectations"
            },
            "key_phrases": [
                "I am writing to request the removal of content located at...",
                "Under Article 17 of the UK GDPR...",
                "The information is no longer relevant because...",
                "The continued availability of this content causes...",
                "I request that this content be removed within..."
            ],
            "model_answer": {
                "band_8": "Dear Data Protection Officer,\n\nI am writing to request the removal of content located at [website URL] under my rights established by Article 17 of the UK GDPR ('right to erasure').\n\nThe content in question is a 2015 news article reporting on criminal charges against me that were subsequently dismissed. While the original reporting was factually accurate at the time, the outcome—complete dismissal of all charges with no prosecution—was never reported. The article therefore presents a misleading picture to anyone searching my name.\n\nI believe removal is justified under the following grounds: (1) the personal data is no longer necessary for the original journalistic purpose, the case having concluded nine years ago; (2) the data is inaccurate through omission; and (3) the legitimate interests I have in removal outweigh any public interest in retention.\n\nThe continued availability of this content has caused demonstrable harm. I have been declined two employment positions in the past year where background searches revealed this article. Prospective employers have confirmed this was a factor in their decisions.\n\nI understand that journalistic archives may claim exemption, but I submit that a nine-year-old article about charges that were dismissed no longer serves a legitimate public interest.\n\nI request that this content be removed within 30 days, or that you provide written reasons for any refusal.\n\nYours faithfully,\nDavid Morrison"
            }
        }
    },
    "tourism_heritage": {
        "module_id": "tourism_heritage",
        "module_title": "Tourism, Cultural Heritage, and Global Mobility",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Travel complaint escalation and consumer protection",
        "learning_outcome": "Write sophisticated travel complaint letters requiring understanding of consumer rights and package travel regulations.",
        "writing_scenario": {
            "title": "Package Holiday Complaint",
            "context": "Your holiday was significantly different from what was advertised.",
            "prompt": "Write a formal complaint to a travel company.\n\nIn your letter:\n- Describe how the holiday differed from the booking\n- Reference consumer protection regulations\n- Quantify your losses and request compensation\n- Indicate next steps if not resolved",
            "strategic_elements": {
                "tone": "Assertive and well-documented, demonstrating regulatory knowledge",
                "purpose": "Secure fair compensation by establishing clear legal grounds",
                "argument": "Systematically document failures against contractual promises"
            },
            "key_phrases": [
                "I am writing to make a formal complaint under the Package Travel Regulations 2018...",
                "The holiday as delivered differed materially from what was advertised...",
                "Under Regulation 15, I am entitled to...",
                "I have documented the following discrepancies...",
                "Should this matter not be resolved, I will refer it to ABTA..."
            ],
            "model_answer": {
                "band_8": "Dear Customer Relations Manager,\n\nI am writing to make a formal complaint under the Package Travel and Linked Travel Arrangements Regulations 2018 regarding booking reference SUN-789456 (departure 12th August, Santorini).\n\nThe holiday as delivered differed materially from what was advertised and contracted. Specifically: (1) we were accommodated at Hotel Artemis, a three-star property, rather than the booked four-star Hotel Olympia—your representative confirmed no rooms were available at the booked hotel; (2) the 'sea view' room promised featured a partial view of a construction site; (3) the advertised transfers failed to materialise on arrival, requiring a €45 taxi.\n\nUnder Regulation 15, where there is a lack of conformity affecting the performance of a package, the organiser must remedy this without undue cost to the traveller. Your representative's offer of a €50 food voucher was wholly inadequate.\n\nI have documented these failures with photographs, your representative's written acknowledgment, and a statement from fellow guests in similar circumstances.\n\nI calculate fair compensation as: (1) price differential between hotels booked and delivered: £340; (2) transfer costs: £40; (3) compensation for diminished enjoyment: £200. Total: £580.\n\nI request response within 14 days. Should this not be resolved satisfactorily, I will refer the matter to ABTA arbitration and the Competitions and Markets Authority.\n\nYours faithfully,\nRobert Chen"
            }
        }
    }
}

# ============ ADVANCED MODULE-SPECIFIC STRATEGIC READING ============
# Each module has complex, real-life reading texts appropriate for Band 7-9
ADVANCED_MODULE_STRATEGIC_READING = {
    "digital_frontier": {
        "module_id": "digital_frontier",
        "module_title": "The Digital Frontier: AI, Automation, and the Future of Work",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding technical policy documents and digital service agreements",
        "learning_outcome": "Navigate complex digital service terms, privacy policies, and automated decision-making disclosures.",
        "reading_scenario": {
            "title": "Automated Decision-Making Disclosure",
            "context": "You are reviewing a company's disclosure about how AI systems are used in their hiring process.",
            "text_type": "Corporate Policy Document",
            "passage": """AUTOMATED DECISION-MAKING IN RECRUITMENT

TechCorp Industries Limited
Automated Decision-Making Disclosure Statement
Effective Date: 1 January 2025

1. PURPOSE AND SCOPE

In accordance with Article 22 of the UK GDPR and the Information Commissioner's Office guidelines on automated individual decision-making, this document explains how TechCorp Industries Limited ('the Company') uses automated systems in its recruitment processes.

This disclosure applies to all applicants for positions within TechCorp Industries Limited and its subsidiaries. By submitting an application, candidates acknowledge receipt of this information.

2. AUTOMATED SYSTEMS IN USE

2.1 Application Screening Software
The Company utilises proprietary software ('TalentScreen Pro') to perform initial screening of applications. This system analyses:
- Qualification matches against role requirements
- Keyword correlation with job specifications
- Employment history patterns
- Application completeness metrics

The system generates a compatibility score (0-100) for each application. Applications scoring below 45 are automatically declined without human review. Applications scoring 45-70 receive expedited human review. Applications scoring above 70 proceed directly to interview scheduling.

2.2 Video Interview Analysis
For roles requiring video interview submission, the Company employs facial analysis software that assesses:
- Eye contact consistency
- Verbal fluency markers
- Response timing patterns
- Enthusiasm indicators (facial micro-expressions)

This analysis contributes to 30% of the interview assessment score. Human reviewers assess the remaining 70%.

3. DATA SOURCES AND LOGIC

3.1 Input Data
Automated systems process data provided directly by candidates, including CV content, cover letters, video recordings, and assessment responses. The Company does not purchase or utilise third-party profiling data.

3.2 Processing Logic
TalentScreen Pro employs machine learning algorithms trained on successful hire data from 2019-2024. The training dataset comprised 47,000 applications and subsequent employment outcomes. The algorithm weights factors including:
- Educational qualification relevance (25%)
- Direct experience alignment (35%)
- Skills keyword matching (20%)
- Career progression patterns (15%)
- Application quality indicators (5%)

4. SIGNIFICANCE AND CONSEQUENCES

Decisions made wholly or partly by automated means may result in:
- Immediate application rejection
- Invitation to interview
- Conditional offer generation
- Salary band allocation

These outcomes may significantly affect your access to employment opportunities with the Company.

5. YOUR RIGHTS

Under data protection law, you have the right to:
- Request human review of any automated decision
- Express your point of view regarding the decision
- Contest the decision and request reconsideration
- Obtain an explanation of the decision reached

To exercise these rights, contact: recruitment.appeals@techcorp-ind.com within 14 days of receiving an automated decision.

6. SAFEGUARDS

The Company implements the following safeguards:
- Quarterly bias audits of automated systems
- Human oversight for all final hiring decisions
- Regular algorithm retraining to address identified disparities
- Anonymous candidate processing (name, age, photograph removed) during initial screening

7. CONTACT

Data Protection Officer: dpo@techcorp-ind.com
Recruitment Appeals: recruitment.appeals@techcorp-ind.com
General Enquiries: careers@techcorp-ind.com

---
Document Reference: HR-AUT-2025-001
Last Review: December 2024
Next Scheduled Review: June 2025""",
            "questions": [
                {
                    "question": "According to the document, what happens to applications that receive a TalentScreen Pro score between 45 and 70?",
                    "type": "multiple_choice",
                    "options": ["They are automatically rejected", "They receive expedited human review", "They proceed directly to interview", "They are placed on a waiting list"],
                    "answer": "They receive expedited human review",
                    "explanation": "Paragraph 2.1 states: 'Applications scoring 45-70 receive expedited human review.'"
                },
                {
                    "question": "The facial analysis software contributes to what percentage of the video interview assessment?",
                    "type": "short_answer",
                    "answer": "30%",
                    "explanation": "Section 2.2 states: 'This analysis contributes to 30% of the interview assessment score.'"
                },
                {
                    "question": "The TalentScreen Pro algorithm gives the highest weighting to which factor?",
                    "type": "multiple_choice",
                    "options": ["Educational qualification relevance", "Direct experience alignment", "Skills keyword matching", "Career progression patterns"],
                    "answer": "Direct experience alignment",
                    "explanation": "Section 3.2 shows direct experience alignment at 35%, which is the highest weighting."
                },
                {
                    "question": "Within how many days must a candidate contact the company to appeal an automated decision?",
                    "type": "short_answer",
                    "answer": "14 days",
                    "explanation": "Section 5 states: 'within 14 days of receiving an automated decision.'"
                },
                {
                    "question": "The statement that the Company removes identifying information during initial screening is:",
                    "type": "true_false_ng",
                    "answer": "True",
                    "explanation": "Section 6 confirms: 'Anonymous candidate processing (name, age, photograph removed) during initial screening.'"
                },
                {
                    "question": "The document states that the Company purchases candidate data from third-party sources.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3.1 explicitly states: 'The Company does not purchase or utilise third-party profiling data.'"
                }
            ]
        }
    },
    "green_imperative": {
        "module_id": "green_imperative",
        "module_title": "The Green Imperative: Climate Change and Sustainable Development",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding environmental policy documents and sustainability reports",
        "learning_outcome": "Analyse complex environmental regulations, carbon offset schemes, and corporate sustainability commitments.",
        "reading_scenario": {
            "title": "Corporate Carbon Offset Programme Terms",
            "context": "You are reviewing the terms and conditions of a carbon offset programme offered by your employer.",
            "text_type": "Programme Terms and Conditions",
            "passage": """GREENPATH CORPORATE CARBON OFFSET PROGRAMME
Terms and Conditions for Participating Employees
Version 3.2 – November 2024

INTRODUCTION

The GreenPath Programme enables employees of participating organisations to offset their personal carbon emissions through verified projects. This document outlines the terms governing individual participation, the offset mechanism, and participant responsibilities.

SECTION A: ELIGIBILITY AND ENROLMENT

A1. Eligible Participants
Full-time and part-time employees of GreenPath partner organisations with at least 6 months' continuous service are eligible to enrol. Contract workers, agency staff, and consultants are excluded unless their engagement agreement specifically provides for GreenPath participation.

A2. Enrolment Process
Enrolment is completed through the HR self-service portal. Upon enrolment, participants select their contribution tier (Bronze: £15/month, Silver: £30/month, Gold: £50/month). Employers match contributions at 100% for the first year of participation, reducing to 50% in subsequent years.

A3. Commitment Period
The minimum commitment period is 12 months. Early termination within this period forfeits employer matching contributions and incurs an administrative fee of £25. After the initial period, participation may be adjusted or terminated with 30 days' notice.

SECTION B: OFFSET MECHANISM

B1. Project Portfolio
Contributions fund a diversified portfolio of offset projects, including:
- Reforestation initiatives (Kenya, Brazil, Indonesia) – 40% allocation
- Renewable energy development (India, Vietnam) – 30% allocation
- Methane capture from landfill sites (UK, Poland) – 20% allocation
- Community cookstove programmes (Sub-Saharan Africa) – 10% allocation

B2. Verification Standards
All projects hold verification under at least one of the following standards: Verified Carbon Standard (VCS), Gold Standard, or Climate Action Reserve. Projects undergo annual third-party audits, with summary reports available on the GreenPath portal.

B3. Carbon Credit Allocation
Participants receive carbon credits proportional to their contributions. Current pricing: 1 credit (representing 1 tonne CO2e offset) = £18.50. Credits are allocated quarterly, with a statement provided showing tonnes offset and equivalent impact metrics.

SECTION C: PARTICIPANT RIGHTS AND LIMITATIONS

C1. Credit Ownership
Carbon credits allocated to participants are held in a pooled account administered by GreenPath Ltd. Individual withdrawal or transfer of credits is not permitted. Upon leaving the programme, accumulated credits remain within the pool and cannot be monetised or transferred.

C2. Impact Guarantees
GreenPath guarantees that 85% of participant contributions directly fund offset projects. The remaining 15% covers programme administration, verification costs, and reserve fund contributions. GreenPath does not guarantee specific environmental outcomes, as project performance depends on factors beyond programmatic control.

C3. Project Failure Protocol
In the event of verified project failure or reversal, GreenPath will reallocate affected credits to alternative projects within 90 days. Participants will be notified of any reallocation affecting their contribution history.

SECTION D: REPORTING AND TRANSPARENCY

D1. Annual Impact Report
GreenPath publishes an annual impact report detailing total emissions offset, project-by-project performance, verification outcomes, and financial allocation. This report is available by March 31 each year for the preceding calendar year.

D2. Individual Statements
Participants receive quarterly statements showing: contributions made, employer matching, credits allocated, cumulative offset total, and equivalence metrics (e.g., 'equivalent to removing X cars from roads for one year').

D3. Grievance Procedure
Concerns regarding project integrity, credit allocation, or programme management should be directed to: integrity@greenpath-offsets.org. GreenPath commits to acknowledging complaints within 5 business days and providing a substantive response within 30 days.

SECTION E: MODIFICATIONS AND TERMINATION

E1. Programme Modifications
GreenPath reserves the right to modify contribution tiers, project allocations, and administrative procedures with 60 days' notice to participants. Material changes to verification standards require 90 days' notice.

E2. Programme Termination
Should GreenPath terminate the programme, remaining pooled credits will be retired through a verified registry, and participants will receive documentation of their lifetime offset contribution for personal records.

---
Document Reference: GP-TC-2024-3.2
Governing Law: England and Wales
Last Updated: 15 November 2024""",
            "questions": [
                {
                    "question": "What is the employer matching rate for contributions in the second year of participation?",
                    "type": "multiple_choice",
                    "options": ["100%", "75%", "50%", "25%"],
                    "answer": "50%",
                    "explanation": "Section A2 states: 'Employers match contributions at 100% for the first year of participation, reducing to 50% in subsequent years.'"
                },
                {
                    "question": "Which project type receives the largest allocation of funds?",
                    "type": "short_answer",
                    "answer": "Reforestation initiatives",
                    "explanation": "Section B1 shows reforestation receives 40% allocation, the highest of all project types."
                },
                {
                    "question": "How much of participant contributions directly funds offset projects?",
                    "type": "short_answer",
                    "answer": "85%",
                    "explanation": "Section C2 states: 'GreenPath guarantees that 85% of participant contributions directly fund offset projects.'"
                },
                {
                    "question": "Participants can withdraw or transfer their individual carbon credits at any time.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section C1 explicitly states: 'Individual withdrawal or transfer of credits is not permitted.'"
                },
                {
                    "question": "The document provides information about the nationality of the programme administrators.",
                    "type": "true_false_ng",
                    "answer": "Not Given",
                    "explanation": "The document does not mention the nationality of programme administrators."
                },
                {
                    "question": "How many days' notice is required for material changes to verification standards?",
                    "type": "short_answer",
                    "answer": "90 days",
                    "explanation": "Section E1 states: 'Material changes to verification standards require 90 days' notice.'"
                }
            ]
        }
    },
    "educational_paradigm": {
        "module_id": "educational_paradigm",
        "module_title": "The Educational Paradigm: Rethinking Learning for the 21st Century",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding educational policy and training programme documentation",
        "learning_outcome": "Navigate professional development programme requirements, academic regulations, and certification criteria.",
        "reading_scenario": {
            "title": "Professional Certification Programme Handbook",
            "context": "You are considering enrolling in a professional certification programme and reviewing the handbook.",
            "text_type": "Programme Handbook Extract",
            "passage": """CHARTERED INSTITUTE OF PROJECT EXCELLENCE
Professional Certification Programme Handbook
Academic Year 2024-2025

CHAPTER 4: ASSESSMENT FRAMEWORK

4.1 ASSESSMENT PHILOSOPHY

The CIPE assessment framework is designed to evaluate both theoretical understanding and practical application of project excellence principles. Assessment methods align with the Institute's competency framework and reflect the standards expected of chartered professionals operating in complex organisational environments.

4.2 ASSESSMENT COMPONENTS

4.2.1 Written Examinations (40% of Final Grade)
Candidates complete two written examinations:
- Paper 1: Strategic Project Governance (3 hours, closed book)
- Paper 2: Applied Project Analysis (3 hours, open book with approved materials)

Each paper comprises Section A (compulsory case study analysis, 50 marks) and Section B (choice of 2 from 4 essay questions, 25 marks each). A minimum score of 50% is required in each paper to pass.

4.2.2 Portfolio Assessment (35% of Final Grade)
Candidates submit a professional portfolio demonstrating:
- Evidence of project leadership (minimum 2 documented projects)
- Reflective analysis of professional development
- Stakeholder feedback and testimonials
- Continuous professional development log (minimum 40 CPD hours)

Portfolios are assessed against published rubrics available on the CIPE learning portal. Submissions exceeding 15,000 words (excluding appendices) will be returned unassessed.

4.2.3 Professional Discussion (25% of Final Grade)
A 45-minute professional discussion with two CIPE assessors covers:
- Portfolio content and professional experience
- Ethical scenarios and decision-making frameworks
- Future development plans and commitment to professional standards

Professional discussions are conducted via video conference or at approved assessment centres. Candidates may request a specific date within their allocated assessment window.

4.3 GRADING CRITERIA

4.3.1 Grade Descriptors
- Distinction (70%+): Demonstrates exceptional insight and sophisticated application
- Merit (60-69%): Shows clear understanding with consistent competent application
- Pass (50-59%): Meets minimum standards with adequate demonstration of competence
- Referral (40-49%): Requires resubmission of specific components
- Fail (Below 40%): Does not meet minimum standards; requires programme repeat

4.3.2 Compensation
Candidates may compensate one failed component (minimum 40%) if their aggregate score exceeds 50% and other components achieve Pass or above. Compensation is not available for candidates receiving Fail in more than one component.

4.4 REASSESSMENT PROVISIONS

4.4.1 First Reassessment
Candidates receiving Referral may resubmit or resit affected components at the next available assessment window. Reassessment fees apply (see Schedule of Fees). First reassessment grades are uncapped.

4.4.2 Second Reassessment
Candidates failing first reassessment may attempt second reassessment with approval from the Academic Standards Committee. Second reassessment grades are capped at Pass (59% maximum).

4.4.3 Final Attempt
A third attempt requires formal appeal demonstrating extenuating circumstances. If granted, this constitutes the candidate's final opportunity. Failure at third attempt results in termination from the programme without certification.

4.5 EXTENUATING CIRCUMSTANCES

Candidates experiencing circumstances beyond their control that affect assessment performance may apply for:
- Assessment deferral (application deadline: 5 working days before assessment)
- Extended submission deadline (maximum 14 days extension)
- Alternative assessment arrangements (disability, health conditions)

Applications must be supported by appropriate evidence (medical certificates, employer letters, official documentation). The Extenuating Circumstances Panel meets fortnightly during assessment periods.

4.6 ACADEMIC INTEGRITY

4.6.1 Plagiarism and Misconduct
The Institute operates a zero-tolerance policy on academic misconduct. All written submissions are processed through plagiarism detection software. Similarity scores exceeding 15% (excluding properly attributed quotations) trigger investigation.

4.6.2 Penalties
Minor infractions: Written warning and required resubmission
Significant infractions: Component grade reduced to zero
Serious misconduct: Permanent exclusion from CIPE programmes

All misconduct cases are recorded on the Institute's Professional Conduct Register and may be disclosed to employers upon request.

---
Document Reference: CIPE-PCPH-2024-04
Approved by: Academic Board, September 2024
Review Date: September 2025""",
            "questions": [
                {
                    "question": "What is the minimum CPD hours requirement for the portfolio assessment?",
                    "type": "short_answer",
                    "answer": "40 hours",
                    "explanation": "Section 4.2.2 states: 'Continuous professional development log (minimum 40 CPD hours).'"
                },
                {
                    "question": "Portfolios exceeding how many words will be returned unassessed?",
                    "type": "short_answer",
                    "answer": "15,000 words",
                    "explanation": "Section 4.2.2 states: 'Submissions exceeding 15,000 words (excluding appendices) will be returned unassessed.'"
                },
                {
                    "question": "What is the maximum grade available for a second reassessment?",
                    "type": "multiple_choice",
                    "options": ["Distinction (70%+)", "Merit (69%)", "Pass (59%)", "Referral (49%)"],
                    "answer": "Pass (59%)",
                    "explanation": "Section 4.4.2 states: 'Second reassessment grades are capped at Pass (59% maximum).'"
                },
                {
                    "question": "What similarity score triggers a plagiarism investigation?",
                    "type": "multiple_choice",
                    "options": ["Over 5%", "Over 10%", "Over 15%", "Over 20%"],
                    "answer": "Over 15%",
                    "explanation": "Section 4.6.1 states: 'Similarity scores exceeding 15% (excluding properly attributed quotations) trigger investigation.'"
                },
                {
                    "question": "The professional discussion can only be conducted at physical assessment centres.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 4.2.3 states: 'Professional discussions are conducted via video conference or at approved assessment centres.'"
                },
                {
                    "question": "First reassessment grades are subject to capping.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 4.4.1 explicitly states: 'First reassessment grades are uncapped.'"
                }
            ]
        }
    },
    "globalisation_cultural": {
        "module_id": "globalisation_cultural",
        "module_title": "Globalisation and Cultural Identity: Navigating a Connected World",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding international relocation and expatriate documentation",
        "learning_outcome": "Navigate complex visa requirements, international employment contracts, and cultural integration guidance.",
        "reading_scenario": {
            "title": "International Assignment Policy",
            "context": "You are reviewing your company's international assignment policy before accepting an overseas posting.",
            "text_type": "Corporate Policy Document",
            "passage": """GLOBALSERVE INTERNATIONAL
International Assignment Policy
Human Resources Policy Manual – Section 7
Effective: January 2025

1. POLICY OVERVIEW

1.1 Purpose
This policy establishes the framework for managing international assignments, ensuring consistent treatment of assignees while allowing flexibility for business needs. It covers assignment types, compensation approaches, and support provisions.

1.2 Scope
This policy applies to employees of GlobalServe International and its subsidiaries who relocate internationally for periods exceeding 6 months. Short-term assignments (1-6 months) and business travel are governed by separate policies.

2. ASSIGNMENT TYPES

2.1 Standard Assignment (1-3 years)
The employee transfers to a host country office while maintaining employment relationship with the home country entity. Compensation follows the balance sheet approach, maintaining home country purchasing power.

2.2 Localised Assignment (3+ years)
The employee transfers to host country employment terms after an initial transition period. Compensation transitions to local market rates within 18 months, with a 'gradual adjustment allowance' phased out over this period.

2.3 Commuter Assignment
The employee works in a host country location while maintaining residence in the home country, typically commuting weekly or bi-weekly. Additional support includes travel costs and accommodation for working days.

3. COMPENSATION FRAMEWORK

3.1 Balance Sheet Methodology
For standard assignments, compensation comprises:
- Base salary: Maintained at home country equivalent
- Cost of Living Allowance (COLA): Calculated using Mercer indices, reviewed quarterly
- Housing: Provided or subsidised to equivalent home country standard
- Hardship premium: 0-30% depending on location classification
- Tax equalisation: Employee pays hypothetical home country tax; company manages actual obligations

3.2 One-Time Allowances
- Relocation allowance: One month's base salary
- Settling-in allowance: £3,500 single / £5,000 with dependents
- Repatriation allowance: One month's base salary (paid upon successful completion)

3.3 Ongoing Benefits
- Annual home leave: Economy class return flights for assignee and approved dependents
- School fees: Contribution up to £15,000 per child per academic year (international schools only)
- Language training: Up to £2,000 per family member
- Emergency assistance: 24/7 global support line access

4. PRE-DEPARTURE REQUIREMENTS

4.1 Medical Assessment
All assignees and accompanying dependents must complete:
- Comprehensive medical examination
- Psychological readiness assessment
- Required vaccinations and health clearance

Medical conditions requiring ongoing treatment must be disclosed. The company reserves the right to decline assignments where medical support is inadequate in the host location.

4.2 Cultural Preparation
Mandatory pre-departure training includes:
- Country-specific cultural briefing (minimum 8 hours)
- Language fundamentals (where applicable)
- Security awareness training
- Family adjustment workshop (for accompanied assignments)

4.3 Documentation
Assignees are responsible for maintaining valid:
- Passport (minimum 18 months validity at assignment start)
- Visas and work permits (company provides administrative support)
- Professional certifications (as required for role)

5. DURING ASSIGNMENT

5.1 Performance Management
Assignees remain within home country performance management processes. Reviews incorporate input from host country supervisors. Performance ratings during assignment receive additional consideration for complexity factors.

5.2 Career Development
The company commits to maintaining visibility of assignee development and providing meaningful repatriation opportunities. Assignees should maintain contact with home country mentors and participate in virtual development programmes.

5.3 Early Return
Assignments may be terminated early due to:
- Business needs (full support provisions apply)
- Performance issues (modified support provisions)
- Personal request (limited support provisions)
- Failure to adapt (case-by-case assessment)

Voluntary early return within 12 months requires repayment of 50% of relocation costs.

6. REPATRIATION

6.1 Planning Timeline
Repatriation planning begins 6 months before assignment end. HR coordinates:
- Position identification in home country
- Logistics planning
- Re-entry cultural support

6.2 Repatriation Support
- Return relocation services
- Temporary accommodation (up to 30 days)
- Career transition coaching (3 sessions)
- Partner career support (where applicable)

---
Policy Owner: Global Mobility, Human Resources
Document Reference: HR-IAP-2025-07
Next Review: January 2026""",
            "questions": [
                {
                    "question": "How long is the transition period for compensation to adjust to local market rates in a localised assignment?",
                    "type": "short_answer",
                    "answer": "18 months",
                    "explanation": "Section 2.2 states: 'Compensation transitions to local market rates within 18 months.'"
                },
                {
                    "question": "What is the maximum annual school fee contribution per child?",
                    "type": "short_answer",
                    "answer": "£15,000",
                    "explanation": "Section 3.3 states: 'School fees: Contribution up to £15,000 per child per academic year.'"
                },
                {
                    "question": "What is the minimum passport validity required at assignment start?",
                    "type": "multiple_choice",
                    "options": ["6 months", "12 months", "18 months", "24 months"],
                    "answer": "18 months",
                    "explanation": "Section 4.3 states: 'Passport (minimum 18 months validity at assignment start).'"
                },
                {
                    "question": "What percentage of relocation costs must be repaid for voluntary early return within 12 months?",
                    "type": "short_answer",
                    "answer": "50%",
                    "explanation": "Section 5.3 states: 'Voluntary early return within 12 months requires repayment of 50% of relocation costs.'"
                },
                {
                    "question": "The settling-in allowance is higher for single assignees than those with dependents.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3.2 shows: '£3,500 single / £5,000 with dependents' - those with dependents receive more."
                },
                {
                    "question": "The policy specifies the exact countries classified as 'hardship' locations.",
                    "type": "true_false_ng",
                    "answer": "Not Given",
                    "explanation": "Section 3.1 mentions hardship premium ranges but does not list specific countries."
                }
            ]
        }
    },
    "health_public_policy": {
        "module_id": "health_public_policy",
        "module_title": "Health and Public Policy: Navigating Healthcare Systems",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding healthcare documentation and patient rights",
        "learning_outcome": "Navigate complex healthcare policies, insurance documents, and medical consent forms.",
        "reading_scenario": {
            "title": "Private Medical Insurance Policy Summary",
            "context": "You are reviewing a private medical insurance policy before purchasing coverage.",
            "text_type": "Insurance Policy Summary",
            "passage": """PREMIER HEALTH PARTNERS
Policy Summary and Key Information Document
Individual Private Medical Insurance
Policy Year: 2025

IMPORTANT: This summary does not replace your full policy document. Please read the complete terms and conditions before purchasing.

SECTION 1: COVERAGE OVERVIEW

1.1 What This Policy Covers
Your Premier Comprehensive policy provides cover for:
✓ In-patient treatment: Hospital stays, surgery, and associated care
✓ Day-patient treatment: Procedures not requiring overnight stay
✓ Out-patient treatment: Consultations, diagnostics, and therapies
✓ Cancer care: Full cover for eligible cancer treatments
✓ Mental health: Treatment for acute psychiatric conditions (limits apply)
✓ Physiotherapy: 10 sessions per condition per policy year

1.2 Annual Benefit Limits
- Overall annual maximum: £1,500,000
- Out-patient annual maximum: £25,000
- Mental health (out-patient): £5,000
- Complementary therapies: £500
- Dental (accident only): £5,000

SECTION 2: WHAT IS NOT COVERED

2.1 General Exclusions
✗ Pre-existing conditions (within 5 years before cover start)
✗ Chronic disease management (conditions requiring ongoing treatment)
✗ Cosmetic procedures (unless reconstructive following illness/accident)
✗ Pregnancy and childbirth (unless complications arise)
✗ Fertility treatment
✗ Experimental treatments not approved by NICE
✗ Self-inflicted injuries
✗ Injuries from professional sports participation

2.2 Waiting Periods
- General conditions: No waiting period
- Mental health: 90-day waiting period
- Back and joint problems: 180-day waiting period (moratorium underwriting)
- Cancer: No waiting period (full medical underwriting only)

SECTION 3: USING YOUR COVER

3.1 Pre-Authorisation Requirements
You MUST obtain pre-authorisation before:
- All in-patient and day-patient admissions
- Any treatment expected to cost over £500
- All cancer treatments
- Mental health treatment

Failure to obtain pre-authorisation may result in claim reduction or rejection. Emergency admissions must be notified within 48 hours.

3.2 Hospital and Specialist Lists
Your policy provides access to our Extended Network of 350+ hospitals and 15,000+ consultants. Using non-network providers incurs a 40% co-payment on all associated costs.

3.3 Excess Options
Your selected excess (£0/£100/£250/£500/£1,000) applies:
- Once per person per policy year
- To in-patient and day-patient claims only
- Does not apply to out-patient consultations

SECTION 4: PREMIUMS AND PAYMENT

4.1 Premium Basis
Your premium is calculated based on:
- Age at policy start
- Postcode rating area
- Selected excess
- Chosen optional benefits
- Previous claims history

4.2 Premium Changes
Premiums are reviewed annually. Factors affecting changes include:
- Your increasing age
- Overall claims experience across Premier's membership
- Medical cost inflation
- Any claims made during the policy year

Premium increases are applied at renewal. The company will notify you of changes at least 30 days before renewal date.

4.3 Cancellation and Refunds
- Cooling-off period: 14 days from policy start for full refund
- Mid-term cancellation: Pro-rata refund less £25 administration fee
- Claims made: No refund for periods during which claims were paid

SECTION 5: MAKING A CLAIM

5.1 Claim Process
1. Obtain GP referral to specialist (where required)
2. Contact Claims Team for pre-authorisation
3. Attend approved facility and provide membership number
4. Hospital/consultant invoices Premier directly (network providers)
5. Settle any excess or co-payment amounts

5.2 Claim Timelines
- Pre-authorisation decisions: Within 2 working days
- Claim processing: Within 10 working days of receiving complete documentation
- Payment to providers: Within 15 working days of claim approval

5.3 Disputes and Appeals
If your claim is declined, you may:
- Request written explanation within 5 working days
- Submit additional evidence for reconsideration
- Appeal to our Independent Medical Review panel
- Contact the Financial Ombudsman Service if unresolved

---
Premier Health Partners is authorised and regulated by the Financial Conduct Authority (FCA Reference: 123456)
Policy Document Reference: PHP-IND-2025-CS
Issue Date: December 2024""",
            "questions": [
                {
                    "question": "What is the annual maximum for out-patient treatment?",
                    "type": "short_answer",
                    "answer": "£25,000",
                    "explanation": "Section 1.2 states: 'Out-patient annual maximum: £25,000.'"
                },
                {
                    "question": "How long is the waiting period for mental health coverage?",
                    "type": "short_answer",
                    "answer": "90 days",
                    "explanation": "Section 2.2 states: 'Mental health: 90-day waiting period.'"
                },
                {
                    "question": "What is the co-payment percentage for using non-network providers?",
                    "type": "multiple_choice",
                    "options": ["20%", "30%", "40%", "50%"],
                    "answer": "40%",
                    "explanation": "Section 3.2 states: 'Using non-network providers incurs a 40% co-payment.'"
                },
                {
                    "question": "Emergency admissions must be notified within how many hours?",
                    "type": "short_answer",
                    "answer": "48 hours",
                    "explanation": "Section 3.1 states: 'Emergency admissions must be notified within 48 hours.'"
                },
                {
                    "question": "The policy covers fertility treatment.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 2.1 explicitly lists 'Fertility treatment' as an exclusion."
                },
                {
                    "question": "The excess applies to both in-patient and out-patient consultations.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3.3 states the excess 'Does not apply to out-patient consultations.'"
                }
            ]
        }
    },
    "crime_justice": {
        "module_id": "crime_justice",
        "module_title": "Crime and Justice: Balancing Security and Liberty",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding legal notices and rights documentation",
        "learning_outcome": "Navigate complex legal notices, tenancy dispute procedures, and regulatory compliance documents.",
        "reading_scenario": {
            "title": "Tenancy Deposit Protection Certificate",
            "context": "You are reviewing the prescribed information for your tenancy deposit as required by law.",
            "text_type": "Legal Notice and Prescribed Information",
            "passage": """TENANCY DEPOSIT PROTECTION SCHEME
Prescribed Information Certificate
Deposit Protection Service (DPS)

CERTIFICATE OF DEPOSIT PROTECTION

This document certifies that the deposit detailed below has been protected in accordance with the Housing Act 2004 and The Tenancy Deposit Schemes (England) Regulations.

SECTION A: DEPOSIT DETAILS

A1. Protection Reference: DPS-2024-7823456
A2. Date of Protection: 15 November 2024
A3. Deposit Amount: £1,450.00
A4. Property Address: Flat 12, Riverside Court, 45 Thames Walk, London SE1 2AB

SECTION B: PARTIES

B1. Landlord/Agent Details
Name: Riverside Property Management Ltd
Address: 78 Commercial Road, London E1 1LN
Email: deposits@riversidepm.co.uk
Scheme Membership: RPM-DPS-5567

B2. Tenant Details
Lead Tenant: [Name Redacted]
Joint Tenants: None recorded
Contact: As per tenancy agreement

SECTION C: THE TENANCY

C1. Tenancy Type: Assured Shorthold Tenancy (AST)
C2. Tenancy Start Date: 1 November 2024
C3. Initial Fixed Term: 12 months (ending 31 October 2025)
C4. Rent: £1,450.00 per calendar month

SECTION D: DEPOSIT PURPOSE AND DEDUCTIONS

D1. The deposit is held as security for the tenant's performance of obligations under the tenancy agreement, including but not limited to:
- Payment of rent and other charges
- Repair of damage beyond fair wear and tear
- Replacement of missing items
- Professional cleaning where required by the tenancy agreement
- Any outstanding utility bills or council tax at tenancy end

D2. Deduction Procedure
At tenancy end:
1. Landlord/agent conducts checkout inspection (tenant may attend)
2. Landlord/agent submits proposed deductions within 10 days of tenancy end
3. Tenant has 10 days to agree or dispute proposed deductions
4. If agreed, deposit returned (less deductions) within 10 days of agreement
5. If disputed, matter proceeds to Alternative Dispute Resolution (ADR)

D3. Evidence Requirements
Any deductions must be supported by:
- Check-in and check-out inventory reports
- Photographic evidence of damage
- Receipts or quotes for remedial works
- Proof of outstanding payments owed

SECTION E: DISPUTE RESOLUTION

E1. Alternative Dispute Resolution
The Deposit Protection Service provides free ADR for disputes that cannot be resolved between parties. ADR is:
- Impartial and independent
- Based on evidence submitted by both parties
- Legally binding once adjudication is issued

E2. ADR Process
1. Either party submits dispute within 90 days of tenancy end
2. DPS notifies other party and requests evidence submission
3. Evidence deadline: 14 days from notification
4. Adjudicator reviews submissions (parties cannot add further evidence)
5. Decision issued within 28 days of evidence deadline
6. Deposit distributed according to adjudication within 5 working days

E3. ADR Limitations
The adjudicator can only decide on the distribution of the protected deposit. They cannot:
- Award compensation beyond the deposit amount
- Make findings of breach of tenancy agreement
- Enforce attendance at mediation
- Consider late-submitted evidence

SECTION F: YOUR RIGHTS

F1. Tenant Rights
As a tenant, you have the right to:
- Receive this prescribed information within 30 days of payment
- Have your deposit protected in a government-backed scheme
- Challenge any proposed deductions
- Use the free ADR service
- Apply to court if deposit protection requirements are breached

F2. Statutory Penalties
If a landlord fails to protect a deposit or provide prescribed information:
- The tenant may apply to court for return of the deposit
- The court may order compensation of 1-3 times the deposit amount
- Section 21 'no fault' eviction notices cannot be served

F3. Court Option
Either party may choose court proceedings instead of ADR. Court proceedings:
- May allow greater remedies
- Incur court fees and potential costs liability
- Are binding and enforceable

SECTION G: CONTACT INFORMATION

Deposit Protection Service
Website: www.depositprotection.com
Telephone: 0330 303 0030
Email: enquiries@depositprotection.com
Post: DPS, PO Box 1255, Hemel Hempstead HP1 9GN

Dispute queries: disputes@depositprotection.com

---
This certificate was generated on 18 November 2024
Certificate Reference: DPS-CERT-2024-7823456-PI""",
            "questions": [
                {
                    "question": "Within how many days must the landlord submit proposed deductions after the tenancy ends?",
                    "type": "short_answer",
                    "answer": "10 days",
                    "explanation": "Section D2 states: 'Landlord/agent submits proposed deductions within 10 days of tenancy end.'"
                },
                {
                    "question": "How long does the tenant have to respond to proposed deductions?",
                    "type": "short_answer",
                    "answer": "10 days",
                    "explanation": "Section D2 states: 'Tenant has 10 days to agree or dispute proposed deductions.'"
                },
                {
                    "question": "Within how many days of the tenancy ending must a dispute be submitted to ADR?",
                    "type": "multiple_choice",
                    "options": ["30 days", "60 days", "90 days", "120 days"],
                    "answer": "90 days",
                    "explanation": "Section E2 states: 'Either party submits dispute within 90 days of tenancy end.'"
                },
                {
                    "question": "What is the maximum compensation a court may order for failure to protect a deposit?",
                    "type": "short_answer",
                    "answer": "3 times the deposit amount",
                    "explanation": "Section F2 states: 'The court may order compensation of 1-3 times the deposit amount.'"
                },
                {
                    "question": "The ADR service can award compensation beyond the deposit amount.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section E3 explicitly states the adjudicator 'cannot award compensation beyond the deposit amount.'"
                },
                {
                    "question": "The document includes the name of the lead tenant.",
                    "type": "true_false_ng",
                    "answer": "Not Given",
                    "explanation": "Section B2 shows '[Name Redacted]' for the lead tenant, so the actual name is not provided."
                }
            ]
        }
    },
    "media_integrity": {
        "module_id": "media_integrity",
        "module_title": "Media and Information Integrity in the Digital Age",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding media complaints and broadcasting regulations",
        "learning_outcome": "Navigate broadcasting complaint procedures and media regulatory documentation.",
        "reading_scenario": {
            "title": "Broadcasting Standards Complaint Decision",
            "context": "You are reading a broadcasting regulator's decision on a complaint about programme accuracy.",
            "text_type": "Regulatory Decision Notice",
            "passage": """BROADCASTING STANDARDS AUTHORITY
Decision Notice

Complaint Reference: BSA-2024-0892
Programme: 'Investigative Report: Hidden Dangers'
Broadcaster: National Broadcasting Network (NBN)
Transmission Date: 15 September 2024, 21:00
Complainant: Dr. Jennifer Morrison (Senior Research Fellow, University of Bristol)

BACKGROUND

1. On 15 September 2024, NBN broadcast 'Investigative Report: Hidden Dangers', a documentary examining the safety of a widely-used food additive (E621, monosodium glutamate). The programme alleged that recent research demonstrated significant health risks, including links to neurological disorders.

2. Dr. Morrison, a leading researcher in food science, complained that the programme breached the Broadcasting Code's accuracy requirements by:
(a) Misrepresenting scientific research findings
(b) Failing to present contrary evidence
(c) Using selective editing to distort expert contributions

3. NBN responded that the programme accurately reflected the research cited, presented multiple perspectives, and gave appropriate context to expert contributions.

THE COMPLAINT IN DETAIL

4. Dr. Morrison's specific complaints were:
(a) A 2023 study was described as showing 'clear evidence' of harm, when its actual conclusion was 'no statistically significant association'
(b) Her own interview was edited to remove her statement that 'the weight of evidence supports safety'
(c) The programme did not include responses from the European Food Safety Authority (EFSA) or UK Food Standards Agency, both of which have assessed MSG as safe

5. NBN acknowledged the editing of Dr. Morrison's contribution but stated this was for time constraints and did not materially alter her position. NBN disputed the characterisation of the 2023 study, stating their description reflected their interpretation of the data.

APPLICABLE CODE PROVISIONS

6. Broadcasting Code, Section 5 (Due Accuracy):
5.1: News and current affairs programmes must be duly accurate
5.2: Significant factual claims should be verified and attributed
5.3: Opposing viewpoints should be given due weight
5.4: Interviewees should not be portrayed unfairly through editing

AUTHORITY'S FINDINGS

7. Regarding the 2023 Study: The Authority reviewed the original research paper. The paper's conclusion stated: 'This study found no statistically significant association between MSG consumption at normal dietary levels and the adverse effects examined.' The programme's description as 'clear evidence' of harm was therefore materially inaccurate. BREACH FOUND.

8. Regarding the Edited Interview: The Authority compared the original interview recording with the broadcast version. Dr. Morrison's statement that 'the weight of evidence supports safety' was removed. This omission materially altered the impression of her views, creating unfairness. BREACH FOUND.

9. Regarding Absence of Regulatory Views: While broadcasters are not obligated to include every viewpoint, the absence of any response from food safety regulators on a matter within their direct responsibility represented a failure to give due weight to significant opposing perspectives. BREACH FOUND.

DETERMINATION

10. The Authority finds that the programme breached Code provisions 5.1, 5.3, and 5.4.

REQUIRED ACTIONS

11. NBN is required to:
(a) Broadcast a correction during a primetime slot within 28 days, acknowledging the inaccuracies
(b) Remove the programme from on-demand services until corrections are incorporated
(c) Provide a written explanation of editorial procedures to the Authority within 42 days

12. The Authority notes this is NBN's second accuracy breach within 12 months. Any further breaches may result in consideration of financial penalties.

RIGHT OF APPEAL

13. Either party may appeal this decision to the Broadcasting Appeals Tribunal within 28 days of publication. Appeals must be submitted in writing, specifying grounds for appeal.

---
Decision Date: 15 November 2024
Published: 20 November 2024
Panel Members: Judge R. Thompson (Chair), Dr. A. Chen, Ms. S. Patel

This decision will be published in the Authority's Decision Bulletin and on the Authority website.""",
            "questions": [
                {
                    "question": "How many breaches of the Broadcasting Code did the Authority find?",
                    "type": "short_answer",
                    "answer": "3",
                    "explanation": "The Authority found breaches of Code provisions 5.1, 5.3, and 5.4 (paragraphs 7, 8, and 9)."
                },
                {
                    "question": "Within how many days must NBN broadcast a correction?",
                    "type": "short_answer",
                    "answer": "28 days",
                    "explanation": "Paragraph 11(a) states: 'Broadcast a correction during a primetime slot within 28 days.'"
                },
                {
                    "question": "What was removed from Dr. Morrison's interview in the broadcast version?",
                    "type": "multiple_choice",
                    "options": ["Her credentials", "Her statement that evidence supports safety", "Her criticism of the study", "Her recommendation for further research"],
                    "answer": "Her statement that evidence supports safety",
                    "explanation": "Paragraph 8 states her statement 'the weight of evidence supports safety' was removed."
                },
                {
                    "question": "How many accuracy breaches has NBN had in the past 12 months including this one?",
                    "type": "short_answer",
                    "answer": "2",
                    "explanation": "Paragraph 12 states: 'this is NBN's second accuracy breach within 12 months.'"
                },
                {
                    "question": "The Authority found that the programme accurately described the 2023 study.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Paragraph 7 states the programme's description was 'materially inaccurate.'"
                },
                {
                    "question": "The decision notice provides details about NBN's previous accuracy breach.",
                    "type": "true_false_ng",
                    "answer": "Not Given",
                    "explanation": "Paragraph 12 mentions the previous breach but does not provide details about it."
                }
            ]
        }
    },
    "economy_wealth": {
        "module_id": "economy_wealth",
        "module_title": "Economy, Wealth Distribution, and Government Responsibility",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding financial documents and investment disclosures",
        "learning_outcome": "Navigate complex financial product information, pension documentation, and investment risk disclosures.",
        "reading_scenario": {
            "title": "Workplace Pension Scheme Guide",
            "context": "You are reviewing your employer's workplace pension scheme information before selecting investment options.",
            "text_type": "Pension Scheme Documentation",
            "passage": """FUTURESAFE WORKPLACE PENSION
Member Investment Guide
Scheme Year 2025

SECTION 1: YOUR INVESTMENT OPTIONS

1.1 How Your Contributions Are Invested
When you join the FutureSafe scheme, your contributions and your employer's contributions are invested in funds of your choosing. If you don't make a selection, your contributions are automatically invested in the Lifestyle Strategy appropriate to your retirement age.

1.2 Available Investment Approaches

Lifestyle Strategies (Default Options)
Our Lifestyle Strategies automatically adjust your investments as you approach retirement:
- Growth Phase (20+ years to retirement): 80% equities, 20% bonds
- Transition Phase (10-20 years): Gradually shifts to 60% equities, 30% bonds, 10% cash
- Pre-Retirement Phase (0-10 years): Further shifts to 30% equities, 40% bonds, 30% cash

Self-Select Funds
For members who prefer to manage their own investment choices:

Fund Name | Risk Rating | 5-Year Return | Annual Charge
---------|------------|---------------|---------------
Global Equity Growth | High | 8.2% p.a. | 0.35%
UK Equity Index | Medium-High | 5.7% p.a. | 0.12%
Diversified Assets | Medium | 4.9% p.a. | 0.28%
Corporate Bond | Low-Medium | 2.1% p.a. | 0.18%
Cash | Low | 1.3% p.a. | 0.08%
Ethical Global Equity | High | 7.6% p.a. | 0.42%
Property | Medium | 3.4% p.a. | 0.55%
Shariah Compliant | Medium-High | 5.2% p.a. | 0.45%

SECTION 2: UNDERSTANDING RISK

2.1 Investment Risk Categories
- Low Risk: Capital preservation priority; lower growth potential
- Low-Medium Risk: Limited volatility; modest growth expectation
- Medium Risk: Balanced approach; accepts some fluctuation for growth
- Medium-High Risk: Higher volatility accepted for enhanced growth potential
- High Risk: Significant short-term fluctuations possible; highest growth potential

2.2 Important Risk Information
Past performance is not a guide to future performance. The value of investments can fall as well as rise. You may get back less than you invested. Currency movements may affect returns for funds investing overseas. Property funds may suspend dealing during periods of market stress.

2.3 Inflation Risk
Even 'low risk' investments carry inflation risk. If your investments grow more slowly than inflation, your purchasing power decreases. Over a 20-year period, inflation averaging 2.5% would reduce £1,000 to £610 in real terms if investments don't keep pace.

SECTION 3: MAKING CHANGES

3.1 Switching Funds
You may switch between funds at any time without charge. Switches are processed on the next dealing day following receipt of instruction. During volatile markets, switches may take longer.

3.2 Switching Frequency
While unlimited switching is permitted, we recommend against frequent switching as:
- Markets are unpredictable in the short term
- Switching costs are reflected in fund performance
- Emotional decisions often produce poor outcomes

3.3 Changing Your Lifestyle Strategy
You may opt out of the Lifestyle Strategy at any time and select your own funds. Once opted out, you will not be automatically returned to the Lifestyle Strategy unless you specifically request this.

SECTION 4: FEES AND CHARGES

4.1 Annual Management Charges (AMC)
Each fund has an Annual Management Charge deducted daily from the fund value. These are shown in the fund table above. No additional administration charges apply.

4.2 Transaction Costs
In addition to AMCs, funds incur transaction costs when buying and selling underlying investments. These are not deducted separately but affect overall fund performance. Estimated transaction costs range from 0.02% (Cash) to 0.25% (Property).

4.3 Charge Cap
For auto-enrolled members, total charges on default funds are capped at 0.75% annually by regulation.

SECTION 5: GETTING HELP

5.1 Information vs Advice
This guide provides information to help you make decisions. It is not personal financial advice. We cannot recommend specific funds for your circumstances.

5.2 When to Seek Advice
Consider seeking independent financial advice if:
- You have significant pension savings
- You have complex financial circumstances
- You are unsure which options suit your needs
- You are approaching retirement

5.3 Finding an Adviser
The Money and Pensions Service (moneyhelper.org.uk) provides free guidance. For regulated advice, find advisers at the Financial Conduct Authority register (register.fca.org.uk).

---
FutureSafe Pensions Ltd is authorised and regulated by the Financial Conduct Authority (Reference: 654321)
Document Reference: FSP-MIG-2025-01
Last Updated: December 2024""",
            "questions": [
                {
                    "question": "What percentage of contributions is allocated to equities during the Growth Phase of the Lifestyle Strategy?",
                    "type": "short_answer",
                    "answer": "80%",
                    "explanation": "Section 1.2 states: 'Growth Phase (20+ years to retirement): 80% equities, 20% bonds.'"
                },
                {
                    "question": "Which fund has the lowest Annual Management Charge?",
                    "type": "short_answer",
                    "answer": "Cash",
                    "explanation": "The fund table shows Cash has an AMC of 0.08%, the lowest of all funds listed."
                },
                {
                    "question": "What is the maximum total charge allowed for auto-enrolled members on default funds?",
                    "type": "multiple_choice",
                    "options": ["0.50%", "0.65%", "0.75%", "1.00%"],
                    "answer": "0.75%",
                    "explanation": "Section 4.3 states: 'total charges on default funds are capped at 0.75% annually.'"
                },
                {
                    "question": "According to Section 2.3, what would be the real-terms value of £1,000 after 20 years at 2.5% average inflation if investments don't keep pace?",
                    "type": "short_answer",
                    "answer": "£610",
                    "explanation": "Section 2.3 states: 'inflation averaging 2.5% would reduce £1,000 to £610 in real terms.'"
                },
                {
                    "question": "Members are charged a fee for switching between funds.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3.1 states: 'You may switch between funds at any time without charge.'"
                },
                {
                    "question": "The guide recommends that members switch funds frequently to maximise returns.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3.2 explicitly states: 'we recommend against frequent switching.'"
                }
            ]
        }
    },
    "urbanisation": {
        "module_id": "urbanisation",
        "module_title": "Urbanisation: Cities, Infrastructure, and Modern Society",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding planning and development documentation",
        "learning_outcome": "Navigate planning applications, development consultations, and local authority notices.",
        "reading_scenario": {
            "title": "Planning Application Consultation Notice",
            "context": "You have received a notice about a proposed development near your home and need to understand your rights to respond.",
            "text_type": "Planning Consultation Document",
            "passage": """METROPOLITAN BOROUGH COUNCIL
PLANNING SERVICES
Notice of Planning Application

APPLICATION REFERENCE: PL/2024/5678
WARD: Riverside
CASE OFFICER: Sarah Mitchell

NOTICE TO NEIGHBOURING PROPERTIES

The Council has received the following planning application affecting land near your property. You are invited to submit comments.

1. THE PROPOSAL

Site Address: Former Riverside Industrial Estate, Thames Road, Riverside RM1 4AB

Description of Development:
Full planning permission for the demolition of existing industrial buildings and erection of a mixed-use development comprising:
- 245 residential units (35% affordable housing by unit)
- 2,500 sqm commercial floorspace (Class E)
- 89 car parking spaces (basement)
- Public realm improvements including riverside walkway
- Maximum height: 12 storeys (45m)

Applicant: Thames Riverside Developments Ltd
Agent: Urban Planning Associates

2. APPLICATION DOCUMENTS

The following documents are available for public inspection:
- Planning Statement
- Design and Access Statement
- Environmental Statement (including Transport, Noise, Air Quality, Ecology assessments)
- Affordable Housing Statement
- Flood Risk Assessment
- Heritage Impact Assessment
- Daylight and Sunlight Analysis
- Energy Strategy
- Construction Management Plan

Documents can be viewed:
- Online: www.metroborough.gov.uk/planning (search reference PL/2024/5678)
- In person: Planning Reception, Civic Centre, Monday-Friday 9:00-17:00

3. ENVIRONMENTAL IMPACT ASSESSMENT

This application is accompanied by an Environmental Statement prepared under the Town and Country Planning (Environmental Impact Assessment) Regulations 2017. The development is considered EIA development due to its scale and potential environmental effects.

The Environmental Statement assesses impacts including:
- Traffic and transportation
- Air quality during construction and operation
- Noise impacts on existing residents
- Ecology and biodiversity
- Heritage assets
- Landscape and visual amenity

A non-technical summary is available for those who prefer a shorter overview.

4. HOW TO COMMENT

Comments must be submitted by: 15 January 2025

Methods of submission:
- Online: www.metroborough.gov.uk/planning-comments
- Email: planning.comments@metroborough.gov.uk
- Post: Planning Services, Civic Centre, High Street, RM1 1AA

Please quote the application reference (PL/2024/5678) in all correspondence.

5. WHAT COMMENTS SHOULD ADDRESS

Comments should relate to planning considerations, which include:
✓ Impact on visual amenity and character of the area
✓ Traffic generation and parking
✓ Noise, disturbance, and pollution
✓ Overlooking and loss of privacy
✓ Loss of daylight or sunlight
✓ Design quality and scale
✓ Impact on heritage assets

Comments not typically considered:
✗ Effect on property values
✗ Private disputes between neighbours
✗ Competition with existing businesses
✗ The applicant's motives or character
✗ Matters controlled under other legislation (Building Regulations, licensing)

6. THE DECISION PROCESS

This application will be determined by the Planning Committee due to its scale. The anticipated committee date is March 2025, subject to receipt of consultation responses and completion of any necessary agreements.

Before the committee meeting:
- A report will be prepared summarising the proposal, consultee responses, and officer recommendation
- The report will be published 5 working days before the committee
- You may request to speak at committee (3 minutes maximum)

After determination:
- Decision notices are published online within 2 working days
- Refused applications may be appealed by the applicant
- Permission may be subject to conditions and legal agreements

7. DATA PROTECTION

Comments received become public documents and may be:
- Published on the Council website (personal contact details redacted)
- Reported to Planning Committee
- Used in any subsequent appeal

Do not include information you do not wish to be made public.

8. CONTACT

For queries about this application:
Case Officer: Sarah Mitchell
Email: sarah.mitchell@metroborough.gov.uk
Telephone: 020 8XXX XXXX
Public access queries: planning.helpdesk@metroborough.gov.uk

---
This notice is served under Article 15 of the Town and Country Planning (Development Management Procedure) Order 2015.
Date of Notice: 18 December 2024""",
            "questions": [
                {
                    "question": "How many residential units does the proposed development include?",
                    "type": "short_answer",
                    "answer": "245",
                    "explanation": "Section 1 states: '245 residential units.'"
                },
                {
                    "question": "What percentage of the housing will be affordable?",
                    "type": "short_answer",
                    "answer": "35%",
                    "explanation": "Section 1 states: '35% affordable housing by unit.'"
                },
                {
                    "question": "By what date must comments be submitted?",
                    "type": "short_answer",
                    "answer": "15 January 2025",
                    "explanation": "Section 4 states: 'Comments must be submitted by: 15 January 2025.'"
                },
                {
                    "question": "Which of the following is considered a valid planning consideration?",
                    "type": "multiple_choice",
                    "options": ["Effect on property values", "Impact on visual amenity", "Competition with existing businesses", "The applicant's character"],
                    "answer": "Impact on visual amenity",
                    "explanation": "Section 5 lists 'Impact on visual amenity and character of the area' as a valid consideration."
                },
                {
                    "question": "How long may members of the public speak at the Planning Committee?",
                    "type": "short_answer",
                    "answer": "3 minutes",
                    "explanation": "Section 6 states: 'You may request to speak at committee (3 minutes maximum).'"
                },
                {
                    "question": "The Environmental Statement is optional for this application.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3 states the application 'is accompanied by an Environmental Statement' and 'is considered EIA development,' implying it is required."
                }
            ]
        }
    },
    "science_bioethics": {
        "module_id": "science_bioethics",
        "module_title": "Science, Research Ethics, and Biomedical Advances",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding clinical trial and research participation documentation",
        "learning_outcome": "Navigate medical research consent forms, clinical trial information, and patient rights documentation.",
        "reading_scenario": {
            "title": "Clinical Trial Participant Information Sheet",
            "context": "You have been invited to participate in a clinical trial and are reviewing the participant information sheet.",
            "text_type": "Research Participant Information",
            "passage": """PARTICIPANT INFORMATION SHEET

Study Title: A Phase III Randomised Controlled Trial of Novel Compound XR-7721 Versus Standard Treatment for Moderate-to-Severe Rheumatoid Arthritis
Study Reference: ISRCTN12345678 | NHS REC Reference: 24/LO/0567
Chief Investigator: Professor Helen Chen, Royal Free Hospital, London

INVITATION

You are being invited to take part in a research study. Before you decide whether to participate, it is important that you understand why the research is being conducted and what it will involve. Please read this information carefully and discuss it with others if you wish.

PART 1: ESSENTIAL INFORMATION

What is the purpose of this study?
Rheumatoid arthritis affects approximately 400,000 people in the UK. Current treatments are effective for many patients but some do not respond adequately or experience significant side effects. XR-7721 is a new medication that works differently from existing treatments. Early studies suggest it may be effective with fewer side effects. This trial aims to determine whether XR-7721 is more effective than current standard treatment.

Why have I been invited?
You have been invited because you have moderate-to-severe rheumatoid arthritis that has not responded adequately to at least two disease-modifying treatments. We are recruiting 650 participants across 45 hospitals in the UK and Europe.

Do I have to take part?
No. Participation is entirely voluntary. If you decide not to participate, this will not affect your standard care in any way. If you do decide to participate, you may withdraw at any time without giving a reason and without any impact on your future care.

What will happen if I take part?
- You will be randomly allocated (like flipping a coin) to receive either XR-7721 or the standard treatment (methotrexate)
- Neither you nor your doctor will know which treatment you receive ('double-blind')
- You will take study medication for 52 weeks
- You will attend clinic visits at weeks 0, 4, 12, 24, 36, and 52
- Each visit takes approximately 2 hours and includes examination, blood tests, and questionnaires
- After the study, all participants will be offered XR-7721 if it proves effective

What are the possible benefits?
You may benefit from a new treatment that could be more effective than current options. However, we cannot guarantee any direct benefit to you personally. The information from this study will help future patients with rheumatoid arthritis.

What are the possible risks?
Known side effects of XR-7721 from early studies include:
- Common (>1 in 10): Injection site reactions, headache, mild nausea
- Uncommon (1 in 100 to 1 in 10): Upper respiratory infections, elevated liver enzymes (usually temporary)
- Rare (<1 in 100): Serious allergic reactions, serious infections

Blood tests will monitor for any adverse effects. A Data Safety Monitoring Board reviews safety data regularly and can stop the trial if significant concerns arise.

PART 2: ADDITIONAL INFORMATION

What happens when the study ends?
After completing the 52-week treatment period, you will be followed up for an additional 12 weeks to monitor any delayed effects. If XR-7721 proves effective and receives regulatory approval, you will be offered continued access.

What if something goes wrong?
If you are harmed as a direct result of taking part in this study, there are no special compensation arrangements. If you are harmed due to someone's negligence, you may have grounds for legal action. NHS complaints procedures remain available.

Will my information be kept confidential?
Yes. Your personal data will be processed in accordance with UK GDPR. Your medical records may be accessed by authorised research staff and regulatory authorities for verification purposes. Published results will not identify you. Data will be retained for 25 years as required by regulations.

What happens to samples?
Blood samples collected during the study will be used only for this study's purposes. Remaining samples will be stored securely and destroyed after 10 years unless you give separate consent for future research use.

Who has reviewed this study?
This study has been reviewed and approved by the London Central Research Ethics Committee, the Medicines and Healthcare products Regulatory Agency (MHRA), and the Research & Development departments of all participating hospitals.

What if I have concerns?
For concerns about the study: Contact Professor Helen Chen at 020 7XXX XXXX or helen.chen@nhs.net
For independent advice: Contact the Patient Advice and Liaison Service (PALS) at your local hospital
For complaints: Contact the Research Governance Manager at 020 7XXX XXXX

---
Version 4.0 | Date: October 2024
Please retain this information sheet for your records.""",
            "questions": [
                {
                    "question": "How many participants is the study aiming to recruit?",
                    "type": "short_answer",
                    "answer": "650",
                    "explanation": "Part 1 states: 'We are recruiting 650 participants across 45 hospitals.'"
                },
                {
                    "question": "How long is the treatment period of the study?",
                    "type": "short_answer",
                    "answer": "52 weeks",
                    "explanation": "Part 1 states: 'You will take study medication for 52 weeks.'"
                },
                {
                    "question": "Which of the following is listed as a common side effect of XR-7721?",
                    "type": "multiple_choice",
                    "options": ["Serious infections", "Elevated liver enzymes", "Injection site reactions", "Serious allergic reactions"],
                    "answer": "Injection site reactions",
                    "explanation": "Part 1 lists 'Injection site reactions' under Common (>1 in 10) side effects."
                },
                {
                    "question": "How long will data be retained after the study?",
                    "type": "short_answer",
                    "answer": "25 years",
                    "explanation": "Part 2 states: 'Data will be retained for 25 years as required by regulations.'"
                },
                {
                    "question": "Participants will know which treatment they are receiving during the study.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Part 1 states: 'Neither you nor your doctor will know which treatment you receive (\"double-blind\").'"
                },
                {
                    "question": "There are special compensation arrangements if participants are harmed during the study.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Part 2 states: 'there are no special compensation arrangements.'"
                }
            ]
        }
    },
    "public_transport": {
        "module_id": "public_transport",
        "module_title": "Public Transport and Sustainable Infrastructure",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding transport policy and passenger rights documentation",
        "learning_outcome": "Navigate transport compensation schemes, passenger rights, and service level commitments.",
        "reading_scenario": {
            "title": "Rail Passenger Charter",
            "context": "You are reviewing the passenger charter to understand your rights after experiencing service disruptions.",
            "text_type": "Passenger Rights Document",
            "passage": """TRANSCONNECT RAIL
Passenger Charter 2024-2025
Your Rights and Our Commitments

INTRODUCTION

This charter sets out what you can expect from TransConnect Rail and explains your rights when things go wrong. It covers all services operated by TransConnect Rail across our network of 150 stations and 2,400 daily services.

Our commitment: We aim to deliver punctual, reliable services. When we fall short, we commit to transparent communication and fair compensation.

SECTION 1: PERFORMANCE STANDARDS

1.1 Punctuality Targets
- Long-distance services (over 100 miles): 90% within 10 minutes of scheduled arrival
- Regional services: 92% within 5 minutes of scheduled arrival
- Commuter services: 95% within 5 minutes of scheduled arrival

1.2 Reliability Targets
- Cancellation rate: Below 2% of scheduled services
- Short-formed trains: Below 1.5% of services

1.3 Performance Reporting
Actual performance against these targets is published monthly on our website and displayed at major stations. If we fail to meet published targets for three consecutive months, we will implement a fare discount scheme for affected routes.

SECTION 2: DELAY COMPENSATION

2.1 Delay Repay Scheme
You are entitled to compensation for delays regardless of cause:

Delay Duration | Compensation
15-29 minutes | 25% of single fare (or relevant portion of return/season)
30-59 minutes | 50% of single fare
60-119 minutes | 100% of single fare
120+ minutes | 100% of fare plus reasonable additional expenses

Season ticket holders: Calculate based on proportional daily value of your ticket.

2.2 How to Claim
- Online: www.transconnect.co.uk/delayrepay (recommended - fastest processing)
- App: TransConnect app - 'My Journeys' section
- Post: Freepost TRANSCONNECT CLAIMS

Claims must be submitted within 28 days of the delayed journey. You will need your ticket or proof of purchase.

2.3 Processing Times
- Online claims: Decision within 5 working days, payment within 10 working days
- Postal claims: Decision within 20 working days, payment within 28 working days

If we miss these timescales, we will add a 10% goodwill payment to approved claims.

SECTION 3: CANCELLATIONS AND DISRUPTION

3.1 If Your Train Is Cancelled
You may:
- Travel on the next available TransConnect service at no extra cost
- Travel via an alternative route, including other operators (with TransConnect agreement)
- Claim a full refund if you decide not to travel
- Travel on an earlier service if available and accessible

3.2 Major Disruption (planned or unplanned)
During major disruption affecting multiple services:
- Rail replacement buses will be provided where feasible
- We will arrange ticket acceptance on other operators' services
- Staffed stations will have information points
- Real-time updates via app, website, and social media

3.3 Overnight Disruption
If the last service is cancelled and you cannot complete your journey:
- We will arrange overnight accommodation or
- Reimburse reasonable taxi costs to your destination (up to £100)
- Contact our 24-hour helpline: 0800 XXX XXXX

SECTION 4: ADDITIONAL COMMITMENTS

4.1 Accessibility
- Assistance available at all staffed stations (book 2 hours ahead for guaranteed service)
- Accessible toilets at 85% of stations
- Level boarding at 60% of stations (target: 75% by 2027)
- Compensation doubled for accessibility-related delays caused by our failure

4.2 Cleanliness
- Trains cleaned daily; deep-cleaned weekly
- Toilets checked and restocked at terminus stations
- Graffiti removed within 48 hours of report
- Customer satisfaction target: 85% rating 'good' or above

4.3 Information
- Accurate real-time information at stations and on trains
- Announcements of delays exceeding 5 minutes within 3 minutes of occurrence
- Cause of delay provided where known

SECTION 5: MAKING A COMPLAINT

5.1 How to Complain
- Online: www.transconnect.co.uk/feedback
- Email: customerrelations@transconnect.co.uk
- Post: Customer Relations, Freepost TRANSCONNECT CR
- Phone: 0345 XXX XXXX (Monday-Friday 08:00-20:00)

5.2 Response Times
- Acknowledgement: Within 2 working days
- Full response: Within 10 working days (complex cases: 20 working days)

5.3 If You Remain Dissatisfied
If you are unhappy with our response, you may escalate to the Rail Ombudsman (free, independent service): www.railombudsman.org

---
TransConnect Rail Limited
Registered in England: 12345678
This charter is effective 1 April 2024 to 31 March 2025""",
            "questions": [
                {
                    "question": "What compensation is offered for delays of 30-59 minutes?",
                    "type": "short_answer",
                    "answer": "50% of single fare",
                    "explanation": "Section 2.1 shows: '30-59 minutes | 50% of single fare.'"
                },
                {
                    "question": "Within how many days must claims be submitted?",
                    "type": "short_answer",
                    "answer": "28 days",
                    "explanation": "Section 2.2 states: 'Claims must be submitted within 28 days of the delayed journey.'"
                },
                {
                    "question": "What is the maximum taxi reimbursement for overnight disruption?",
                    "type": "short_answer",
                    "answer": "£100",
                    "explanation": "Section 3.3 states: 'Reimburse reasonable taxi costs to your destination (up to £100).'"
                },
                {
                    "question": "What is the punctuality target for commuter services?",
                    "type": "multiple_choice",
                    "options": ["90% within 10 minutes", "92% within 5 minutes", "95% within 5 minutes", "98% within 5 minutes"],
                    "answer": "95% within 5 minutes",
                    "explanation": "Section 1.1 states: 'Commuter services: 95% within 5 minutes of scheduled arrival.'"
                },
                {
                    "question": "How far in advance should assistance be booked for guaranteed service?",
                    "type": "short_answer",
                    "answer": "2 hours",
                    "explanation": "Section 4.1 states: 'book 2 hours ahead for guaranteed service.'"
                },
                {
                    "question": "Compensation is only available if delays are caused by the rail company.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 2.1 states: 'You are entitled to compensation for delays regardless of cause.'"
                }
            ]
        }
    },
    "work_employment": {
        "module_id": "work_employment",
        "module_title": "Work, Employment, and the Changing Nature of Labour",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding employment contracts and workplace rights documentation",
        "learning_outcome": "Navigate employment contracts, redundancy procedures, and workplace grievance documentation.",
        "reading_scenario": {
            "title": "Redundancy Consultation Document",
            "context": "Your employer has announced potential redundancies and you are reviewing the formal consultation document.",
            "text_type": "Employment Consultation Document",
            "passage": """NEXTERA TECHNOLOGIES PLC
Redundancy Consultation Document
Confidential - For Affected Employees Only

Date: 5 December 2024
Consultation Reference: HR/2024/RC-045

SECTION 1: INTRODUCTION

1.1 Purpose of This Document
This document initiates the formal collective consultation process as required under Section 188 of the Trade Union and Labour Relations (Consolidation) Act 1992. It provides information about proposed redundancies and invites your participation in meaningful consultation.

1.2 Background
Following a strategic review of operations, the Board has determined that restructuring is necessary to ensure the company's long-term viability. Market conditions, including a 35% reduction in enterprise software contracts and increased competition, have necessitated cost reduction measures.

1.3 Scope
This consultation affects employees in the Software Development Division, specifically:
- UK Development Centre, Cambridge (68 employees at risk)
- Northern Development Hub, Manchester (34 employees at risk)
- Total employees at risk: 102

SECTION 2: PROPOSALS

2.1 Proposed Redundancies
The company proposes to reduce headcount by up to 45 positions across the affected locations:
- Cambridge: Up to 32 roles
- Manchester: Up to 13 roles

2.2 Affected Roles
- Senior Software Engineers: 12 positions
- Software Engineers: 18 positions
- QA Specialists: 8 positions
- Technical Project Managers: 5 positions
- DevOps Engineers: 2 positions

2.3 Selection Criteria
Where redundancies proceed, selection will be based on:
- Performance ratings (weighted 40%): Average of last three annual reviews
- Skills and qualifications (weighted 30%): Relevance to future business needs
- Attendance record (weighted 15%): Excluding protected absences
- Disciplinary record (weighted 15%): Warnings within last 24 months

Criteria will be applied consistently across all affected employees.

SECTION 3: CONSULTATION PROCESS

3.1 Collective Consultation Period
The minimum consultation period is 45 days (required where 100+ redundancies proposed). Consultation begins 5 December 2024 and cannot conclude before 19 January 2025.

3.2 Consultation Objectives
We will consult with a view to reaching agreement on:
- Ways to avoid dismissals
- Ways to reduce the number of dismissals
- Ways to mitigate the consequences of dismissals

3.3 How to Participate
- Collective consultation: Through your elected employee representatives
- Individual consultation: You will have at least two individual meetings with your line manager and HR
- Written submissions: Email redundancy.consultation@nextera.com

All suggestions will receive written responses within 10 working days.

SECTION 4: ALTERNATIVES BEING CONSIDERED

4.1 Measures to Avoid or Reduce Redundancies
We are actively exploring:
- Voluntary redundancy scheme (enhanced terms available)
- Reduction in working hours (temporary or permanent)
- Redeployment to other roles within the company
- Secondment to partner organisations
- Unpaid leave (sabbatical) options
- Early retirement packages

4.2 Voluntary Redundancy
Employees who volunteer for redundancy by 20 December 2024 will receive enhanced terms:
- Statutory redundancy plus 50% enhancement
- 3 months' salary in lieu of notice (standard notice requirement waived)
- Extended private healthcare coverage (6 months post-termination)
- Outplacement support (6 months)

Voluntary applications are encouraged but acceptance is at the company's discretion based on business needs.

SECTION 5: STATUTORY REDUNDANCY ENTITLEMENTS

5.1 Redundancy Pay Calculation
If redundancy proceeds, statutory entitlements are:
- 0.5 week's pay for each full year employed (under age 22)
- 1 week's pay for each full year employed (age 22-40)
- 1.5 weeks' pay for each full year employed (age 41+)

Maximum service counted: 20 years
Maximum weekly pay: £700 (statutory cap)

5.2 Notice Period
Your contractual notice period will apply, or statutory minimum (1 week per year of service, maximum 12 weeks), whichever is greater.

5.3 Time Off
Employees with 2+ years' service are entitled to reasonable paid time off during notice period to:
- Seek other employment
- Arrange training

SECTION 6: SUPPORT AVAILABLE

6.1 Employee Assistance Programme
Free confidential counselling available 24/7: 0800 XXX XXXX

6.2 Career Transition Support
All affected employees will receive:
- Professional CV writing assistance
- Interview coaching (up to 4 sessions)
- Access to job-matching services
- LinkedIn optimisation workshop

6.3 Financial Advice
Independent financial advice sessions available through ACAS partnership.

SECTION 7: TIMELINE

Key Dates:
- 5 December 2024: Consultation begins
- 20 December 2024: Voluntary redundancy application deadline
- 8 January 2025: Selection pool finalised
- 19 January 2025: Earliest consultation conclusion
- 26 January 2025: Provisional selection decisions communicated
- February 2025: Individual consultation and appeals
- March 2025: Final decisions and termination dates

---
Document prepared by: Human Resources
For queries: redundancy.consultation@nextera.com | HR Hotline: ext. 4500""",
            "questions": [
                {
                    "question": "How many positions in total does the company propose to make redundant?",
                    "type": "short_answer",
                    "answer": "45",
                    "explanation": "Section 2.1 states: 'The company proposes to reduce headcount by up to 45 positions.'"
                },
                {
                    "question": "What is the weighting given to performance ratings in the selection criteria?",
                    "type": "short_answer",
                    "answer": "40%",
                    "explanation": "Section 2.3 states: 'Performance ratings (weighted 40%).'"
                },
                {
                    "question": "What is the minimum consultation period for this redundancy process?",
                    "type": "multiple_choice",
                    "options": ["14 days", "30 days", "45 days", "90 days"],
                    "answer": "45 days",
                    "explanation": "Section 3.1 states: 'The minimum consultation period is 45 days.'"
                },
                {
                    "question": "By what date must employees apply for voluntary redundancy to receive enhanced terms?",
                    "type": "short_answer",
                    "answer": "20 December 2024",
                    "explanation": "Section 4.2 states: 'Employees who volunteer for redundancy by 20 December 2024 will receive enhanced terms.'"
                },
                {
                    "question": "What is the maximum weekly pay used in statutory redundancy calculations?",
                    "type": "short_answer",
                    "answer": "£700",
                    "explanation": "Section 5.1 states: 'Maximum weekly pay: £700 (statutory cap).'"
                },
                {
                    "question": "All applications for voluntary redundancy will automatically be accepted.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 4.2 states: 'acceptance is at the company's discretion based on business needs.'"
                }
            ]
        }
    },
    "social_demographics": {
        "module_id": "social_demographics",
        "module_title": "Social Change and Demographic Shifts",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding social care and support service documentation",
        "learning_outcome": "Navigate care assessment documents, support service agreements, and eligibility criteria.",
        "reading_scenario": {
            "title": "Adult Social Care Assessment Guidance",
            "context": "You are supporting a family member in understanding the social care assessment process.",
            "text_type": "Local Authority Guidance Document",
            "passage": """CITYSHIRE COUNCIL
Adult Social Care
Assessment and Eligibility Guidance
For Adults and Their Families

INTRODUCTION

This guide explains how Cityshire Council assesses adults who may need care and support. It covers who can request an assessment, what happens during the assessment, and how eligibility is determined under the Care Act 2014.

Everyone has the right to request an assessment, regardless of their financial situation or the level of care they may need.

PART 1: REQUESTING AN ASSESSMENT

Who Can Request?
- Any adult who appears to have care and support needs
- A carer who appears to have support needs
- Anyone acting on behalf of an adult (with their consent)

Adults are defined as anyone aged 18 or over. For younger people, different arrangements apply under children's services.

How to Request
- Online: www.cityshire.gov.uk/care-assessment
- Telephone: 0300 XXX XXXX (Monday-Friday 8:30-17:30)
- In person: Any library or council customer service centre
- Via professional: GP, hospital, or other health professional can refer directly

Response Times
- Urgent cases (safeguarding concerns, hospital discharge): Within 24 hours
- Standard cases: Assessment offered within 10 working days
- Complex cases: Assessment offered within 15 working days

PART 2: THE ASSESSMENT PROCESS

What We Assess
The assessment considers:
- Physical, mental, and emotional wellbeing
- Personal dignity and respect
- Physical and mental health
- Protection from abuse and neglect
- Control over day-to-day life
- Participation in work, education, and training
- Social and economic wellbeing
- Domestic, family, and personal relationships
- Suitability of living accommodation

How Assessment Works
1. Initial conversation to understand your situation
2. Home visit by a qualified assessor (usually)
3. Discussion of what matters most to you
4. Review of medical and other relevant information (with consent)
5. Assessment of carer's needs (if applicable)
6. Draft support plan developed with your involvement

You may bring anyone you wish to the assessment. If you have difficulty participating, we will arrange an independent advocate at no cost.

PART 3: ELIGIBILITY DETERMINATION

National Eligibility Criteria
To be eligible for local authority support, you must meet ALL THREE conditions:

Condition 1: Your needs arise from a physical or mental impairment or illness
(This is broadly interpreted and includes long-term conditions, sensory impairments, learning disabilities, mental health conditions, substance dependence, and brain injury)

Condition 2: As a result of your needs, you are unable to achieve TWO OR MORE of these outcomes:
a) Managing and maintaining nutrition
b) Maintaining personal hygiene
c) Managing toilet needs
d) Being appropriately clothed
e) Being able to make use of your home safely
f) Maintaining a habitable home environment
g) Developing and maintaining family or personal relationships
h) Accessing and engaging in work, training, education, or volunteering
i) Making use of necessary facilities or services in the community
j) Carrying out caring responsibilities for a child

'Unable to achieve' means you cannot do it without assistance, can only do it with significant pain or distress, can only do it in a way that endangers yourself or others, or take significantly longer than would normally be expected.

Condition 3: As a consequence, there is a significant impact on your wellbeing

PART 4: AFTER THE ASSESSMENT

If You Are Eligible
- We will develop a care and support plan with you
- The plan will show how your needs will be met
- You may receive a personal budget to arrange your own care
- Options include council-arranged services, direct payments, or a combination

Financial Assessment
- Care services are means-tested (based on your income and savings)
- Anyone with savings below £23,250 may receive financial support
- Capital over £23,250 means you pay the full cost of care (but we can still help arrange services)
- Some services are free regardless of finances (e.g., reablement for first 6 weeks)

If You Are Not Eligible
- We will provide information and advice about other options
- We will signpost to voluntary organisations and community resources
- We will tell you how to request a reassessment if circumstances change
- You have the right to challenge the decision

PART 5: YOUR RIGHTS

You Have the Right To:
- An assessment that focuses on your outcomes and wishes
- Involvement in all decisions about your care
- A copy of your assessment and support plan
- Review of your support at least annually
- Request reassessment at any time if needs change
- Make a complaint if you are unhappy with any aspect

Complaints
- Stage 1: Local resolution with the assessing team
- Stage 2: Formal complaint to Customer Relations
- Stage 3: Local Government Ombudsman (independent review)

Time limits: Complaints should normally be made within 12 months

CONTACT INFORMATION

Adult Social Care Direct: 0300 XXX XXXX
Email: adultsocialcare@cityshire.gov.uk
Out of hours emergencies: 0300 XXX XXXX
Website: www.cityshire.gov.uk/adultsocialcare

---
Publication date: September 2024
Review date: September 2025
Document reference: ASC-ELG-2024-09""",
            "questions": [
                {
                    "question": "How many outcomes must a person be unable to achieve to meet Condition 2 of the eligibility criteria?",
                    "type": "short_answer",
                    "answer": "Two or more",
                    "explanation": "Part 3 states: 'you are unable to achieve TWO OR MORE of these outcomes.'"
                },
                {
                    "question": "Within how many working days is an assessment offered for standard cases?",
                    "type": "short_answer",
                    "answer": "10 working days",
                    "explanation": "Part 1 states: 'Standard cases: Assessment offered within 10 working days.'"
                },
                {
                    "question": "What is the capital threshold below which adults may receive financial support?",
                    "type": "short_answer",
                    "answer": "£23,250",
                    "explanation": "Part 4 states: 'Anyone with savings below £23,250 may receive financial support.'"
                },
                {
                    "question": "How often must support be reviewed at minimum?",
                    "type": "multiple_choice",
                    "options": ["Every 6 months", "Annually", "Every 2 years", "Every 3 years"],
                    "answer": "Annually",
                    "explanation": "Part 5 states: 'Review of your support at least annually.'"
                },
                {
                    "question": "Within how many months should complaints normally be made?",
                    "type": "short_answer",
                    "answer": "12 months",
                    "explanation": "Part 5 states: 'Complaints should normally be made within 12 months.'"
                },
                {
                    "question": "Reablement services require a financial assessment before being provided.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Part 4 states: 'Some services are free regardless of finances (e.g., reablement for first 6 weeks).'"
                }
            ]
        }
    },
    "crime_reintegration": {
        "module_id": "crime_reintegration",
        "module_title": "Criminal Justice: Rehabilitation and Social Reintegration",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding rehabilitation programme documentation and rights",
        "learning_outcome": "Navigate rehabilitation programme agreements, disclosure requirements, and participant rights.",
        "reading_scenario": {
            "title": "Community Rehabilitation Programme Agreement",
            "context": "You are supporting someone reviewing their community rehabilitation programme participation agreement.",
            "text_type": "Programme Participation Agreement",
            "passage": """FORWARD PATHWAYS
Community Rehabilitation Company
Participant Agreement and Information Document

Programme: Employment Preparation and Support (EPS)
Agreement Reference: EPS/2024/3456
Participant: [Name Redacted]
Start Date: 15 November 2024

SECTION A: PROGRAMME OVERVIEW

A1. About This Programme
The Employment Preparation and Support programme helps participants with criminal convictions develop skills and find sustainable employment. The programme is delivered by Forward Pathways under contract with the Ministry of Justice.

A2. Programme Components
Core elements (mandatory):
- Employment readiness assessment (Week 1)
- Skills audit and action planning (Week 2)
- Job search techniques workshop (3 sessions)
- Interview preparation and practice (2 sessions)
- Disclosure guidance (how to discuss your conviction with employers)

Optional elements (based on individual needs):
- Basic literacy and numeracy support
- Digital skills training
- Sector-specific qualifications (construction, catering, retail)
- Financial capability training
- Mentoring from programme graduates

A3. Programme Duration
Standard programme duration: 12 weeks
Maximum extension: Up to 26 weeks for participants making progress
Post-employment support: 6 months of in-work support after securing employment

SECTION B: YOUR COMMITMENTS

B1. Attendance Requirements
You must attend:
- All scheduled appointments and workshops
- At least 80% of optional sessions included in your action plan

B2. Notice Requirements
- Notify us at least 24 hours in advance if you cannot attend
- Provide evidence for any health-related absences
- Rearrange missed sessions within 5 working days

B3. Active Participation
You agree to:
- Engage constructively in all sessions
- Complete agreed tasks between sessions
- Apply for positions identified in job search activities
- Attend all interviews arranged with your support
- Accept suitable employment offers unless reasonable grounds exist

B4. Disclosure of Circumstances
You must inform us promptly of:
- Changes to your address or contact details
- Any new criminal proceedings or convictions
- Changes to your licence conditions (if applicable)
- Any barriers to employment that emerge

SECTION C: OUR COMMITMENTS

C1. Support We Provide
We will:
- Assign you a dedicated Employment Support Worker
- Provide all materials and resources needed for the programme
- Cover reasonable travel costs to programme activities (up to £50/week)
- Provide professional clothing for interviews (one outfit, up to £100 value)
- Support you in preparing for disclosure conversations with employers
- Advocate with employers on your behalf where appropriate

C2. Quality Standards
We commit to:
- Responding to communications within 2 working days
- Reviewing your progress fortnightly
- Adjusting your action plan based on feedback and progress
- Providing written references upon programme completion
- Maintaining confidentiality as set out in Section D

SECTION D: CONFIDENTIALITY AND INFORMATION SHARING

D1. What We Keep Confidential
All information you share with us is treated confidentially, including:
- Your participation in the programme
- Your criminal conviction history
- Personal circumstances discussed in sessions

D2. When We May Share Information
We may share information with:
- Your probation officer/offender manager (if you are under supervision)
- The Ministry of Justice (anonymised data for programme evaluation)
- Other agencies with your explicit written consent
- Authorities if there is a safeguarding concern or legal requirement

D3. Your Data Rights
Under UK GDPR, you have the right to:
- Access information we hold about you
- Correct inaccurate information
- Request deletion (subject to legal retention requirements)
- Object to processing in certain circumstances

SECTION E: BREACH AND CONSEQUENCES

E1. Warning Process
If you fail to meet commitments:
- First instance: Verbal warning and discussion
- Second instance: Written warning and action plan review
- Third instance: Final written warning and formal review meeting
- Continued non-compliance: Programme termination may be considered

E2. Programme Termination
Grounds for immediate termination without warning:
- Threatening or abusive behaviour toward staff or other participants
- Attending sessions under the influence of drugs or alcohol
- Committing further offences during the programme
- Providing deliberately false information

E3. Consequences of Termination
If the programme is terminated:
- We will notify your supervising officer (if applicable)
- Termination may be reported to the court (if programme is a sentence requirement)
- You may be excluded from Forward Pathways programmes for 12 months

SECTION F: COMPLAINTS AND APPEALS

F1. How to Complain
If you are unhappy with any aspect of the programme:
- Stage 1: Discuss with your Employment Support Worker
- Stage 2: Written complaint to Programme Manager (response within 10 days)
- Stage 3: Appeal to Regional Director (response within 15 days)
- External: Contact the Independent Monitoring Board if unresolved

F2. Your Right to Appeal
You may appeal:
- Warning decisions
- Changes to your action plan
- Programme termination decisions

Appeals must be submitted in writing within 14 days of the decision.

---
Forward Pathways CRC is registered with the Ministry of Justice
Data Controller Registration: ZA123456
Document Version: 3.1 | November 2024""",
            "questions": [
                {
                    "question": "What is the standard programme duration?",
                    "type": "short_answer",
                    "answer": "12 weeks",
                    "explanation": "Section A3 states: 'Standard programme duration: 12 weeks.'"
                },
                {
                    "question": "What percentage of optional sessions must participants attend?",
                    "type": "short_answer",
                    "answer": "80%",
                    "explanation": "Section B1 states: 'At least 80% of optional sessions included in your action plan.'"
                },
                {
                    "question": "What is the maximum weekly travel cost reimbursement?",
                    "type": "short_answer",
                    "answer": "£50",
                    "explanation": "Section C1 states: 'Cover reasonable travel costs to programme activities (up to £50/week).'"
                },
                {
                    "question": "How long is post-employment support provided after securing a job?",
                    "type": "multiple_choice",
                    "options": ["3 months", "6 months", "9 months", "12 months"],
                    "answer": "6 months",
                    "explanation": "Section A3 states: 'Post-employment support: 6 months of in-work support after securing employment.'"
                },
                {
                    "question": "Within how many days must appeals be submitted?",
                    "type": "short_answer",
                    "answer": "14 days",
                    "explanation": "Section F2 states: 'Appeals must be submitted in writing within 14 days of the decision.'"
                },
                {
                    "question": "Disclosure guidance about discussing convictions with employers is an optional programme component.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section A2 lists 'Disclosure guidance' under 'Core elements (mandatory).'"
                }
            ]
        }
    },
    "public_health_allocation": {
        "module_id": "public_health_allocation",
        "module_title": "Public Health and Medical Resource Allocation",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding NHS service documentation and patient pathways",
        "learning_outcome": "Navigate NHS referral pathways, waiting list management, and patient choice documentation.",
        "reading_scenario": {
            "title": "NHS Elective Care Patient Information",
            "context": "You have been referred for specialist treatment and are reviewing the patient information about managing your care pathway.",
            "text_type": "NHS Patient Information Document",
            "passage": """NHS MIDLANDS INTEGRATED CARE BOARD
Elective Care Pathway
Patient Information Guide

YOUR REFERRAL AND TREATMENT PATHWAY

This guide explains what happens after your GP or other healthcare professional refers you for specialist assessment or treatment. It covers your rights, choices, and what to expect at each stage.

SECTION 1: YOUR REFERRAL

1.1 Referral Received
Your referral has been received by [Hospital/Service Name]. Within 5 working days, you should receive:
- Acknowledgement of your referral
- Information about next steps
- Approximate waiting time indication

If you have not heard within 10 working days, please contact the Patient Services team (details at end).

1.2 Triage and Prioritisation
Clinical teams review all referrals to determine:
- Clinical urgency (urgent referrals seen within 2 weeks)
- Most appropriate service or specialist
- Whether additional information is needed before appointment

Your GP's referral contains clinical information to help this process. You may be contacted for additional details.

1.3 Your Rights Under the NHS Constitution
You have the right to:
- Start consultant-led treatment within 18 weeks of referral (the RTT target)
- Be seen within 2 weeks for suspected cancer referrals
- Choose which hospital or clinic you attend (see Section 2)
- Access clear information about waiting times

SECTION 2: PATIENT CHOICE

2.1 Choosing Your Provider
For most non-urgent referrals, you can choose where to receive care. Options may include:
- NHS hospitals in your area
- NHS hospitals in other areas
- Some private sector providers delivering NHS-funded care

Your GP can discuss options at the point of referral, or you can change your choice before your first appointment.

2.2 Information to Help You Choose
Consider:
- Waiting times (published on NHS website)
- Location and travel requirements
- Quality ratings (CQC inspection results)
- Patient feedback and experience scores
- Specialist expertise for your condition

2.3 How to Change Your Choice
Contact Patient Services within 14 days of receiving your appointment if you wish to transfer your referral. Please note that changing provider may affect your position on the waiting list.

SECTION 3: WAITING FOR TREATMENT

3.1 The 18-Week Standard
The NHS aims to start treatment within 18 weeks of your GP's referral. The 18-week clock:
- Starts on the date the hospital receives your referral
- Pauses if you choose to delay treatment
- Stops when treatment begins OR you and your consultant agree treatment is not needed

'Treatment' includes procedures, therapies, or a clinical decision that no treatment is required.

3.2 Managing the Wait
While waiting, you can:
- Access physiotherapy or other support services
- Attend pre-assessment appointments (these don't count as treatment start)
- Contact the hospital if your condition changes significantly
- Ask your GP for interim support or pain management

3.3 What If Waiting Time Exceeds 18 Weeks?
If your wait exceeds 18 weeks:
- The hospital should contact you to explain and offer alternatives
- You may be offered treatment at an alternative provider
- You can contact the Patient Advice and Liaison Service (PALS) for support

3.4 Cancellation Policy
If the hospital cancels your operation less than 24 hours before admission:
- They must offer another date within 28 days
- If they cannot, you may request treatment at an alternative hospital funded by them

SECTION 4: YOUR APPOINTMENTS

4.1 Attendance
Please attend all appointments. If you cannot attend:
- Give at least 48 hours' notice if possible
- Call the number on your appointment letter
- Request a new appointment at a time that suits you

4.2 Did Not Attend (DNA) Policy
If you miss appointments without notice:
- First DNA: You will be sent a new appointment
- Second DNA: Your referral may be returned to your GP
- Exceptions apply for clinical urgency and vulnerable patients

4.3 Reasonable Adjustments
If you need adjustments due to disability, communication needs, or other circumstances:
- Let us know when booking
- We will make reasonable adjustments (interpreter, accessible room, longer appointment)
- Contact the Equality Team if adjustments are not met

SECTION 5: KEEPING YOU INFORMED

5.1 Communication
We will contact you by:
- Letter (default for appointment notifications)
- Text message (appointment reminders)
- Email (only with your consent)
- Phone (for urgent matters)

Update your preferences through Patient Services or the NHS App.

5.2 Tracking Your Referral
You can track your referral progress:
- Online: NHS App or hospital patient portal
- Phone: Patient Services helpline

5.3 Escalating Concerns
If you have concerns about delays or care:
1. Contact the service directly (phone number on your letters)
2. Speak to PALS for independent support
3. Make a formal complaint if not resolved
4. Contact NHS England if RTT rights are not met

CONTACT INFORMATION

Patient Services: 01onal XXX XXXX (Monday-Friday 9:00-17:00)
PALS: 01local XXX XXXX
Email: patientservices@nhs.midlands.nhs.uk
Website: www.midlandsicb.nhs.uk/patients

---
Document Version: 2.3 | October 2024
Review Date: October 2025
Accessible formats available on request""",
            "questions": [
                {
                    "question": "Within how many working days should patients receive acknowledgement of their referral?",
                    "type": "short_answer",
                    "answer": "5 working days",
                    "explanation": "Section 1.1 states: 'Within 5 working days, you should receive: Acknowledgement of your referral.'"
                },
                {
                    "question": "What is the NHS target timeframe for starting consultant-led treatment?",
                    "type": "short_answer",
                    "answer": "18 weeks",
                    "explanation": "Section 1.3 states: 'Start consultant-led treatment within 18 weeks of referral.'"
                },
                {
                    "question": "Within how many days must patients contact Patient Services to change their provider choice?",
                    "type": "short_answer",
                    "answer": "14 days",
                    "explanation": "Section 2.3 states: 'Contact Patient Services within 14 days of receiving your appointment.'"
                },
                {
                    "question": "How soon must the hospital offer a new operation date if they cancel less than 24 hours before admission?",
                    "type": "multiple_choice",
                    "options": ["Within 14 days", "Within 21 days", "Within 28 days", "Within 42 days"],
                    "answer": "Within 28 days",
                    "explanation": "Section 3.4 states: 'They must offer another date within 28 days.'"
                },
                {
                    "question": "What happens after a second 'Did Not Attend' without notice?",
                    "type": "multiple_choice",
                    "options": ["Automatic discharge from NHS", "Third appointment offered", "Referral may be returned to GP", "Fine imposed"],
                    "answer": "Referral may be returned to GP",
                    "explanation": "Section 4.2 states: 'Second DNA: Your referral may be returned to your GP.'"
                },
                {
                    "question": "Pre-assessment appointments count as the start of treatment under the 18-week clock.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 3.2 states: 'Attend pre-assessment appointments (these don't count as treatment start).'"
                }
            ]
        }
    },
    "media_journalism": {
        "module_id": "media_journalism",
        "module_title": "The Media Landscape: Journalism, Social Media, and the Public Interest",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding social media platform policies and digital rights",
        "learning_outcome": "Navigate social media terms of service, content moderation policies, and appeal procedures.",
        "reading_scenario": {
            "title": "Social Media Platform Community Guidelines",
            "context": "You are reviewing a social media platform's community guidelines after receiving a content warning.",
            "text_type": "Platform Policy Document",
            "passage": """CONNECTSPHERE
Community Guidelines
Last Updated: November 2024

INTRODUCTION

ConnectSphere is committed to fostering authentic self-expression while maintaining a safe and respectful environment. These Community Guidelines explain what is and isn't allowed on our platform.

Violating these guidelines may result in content removal, account restrictions, or permanent suspension. We use a combination of automated systems and human review to identify potential violations.

SECTION 1: AUTHENTICITY

1.1 Real Identity
ConnectSphere is a platform for authentic identity:
- Accounts must represent real individuals or genuine organisations
- Impersonating others is not permitted
- Misleading profile information may result in account suspension

1.2 Automated Behaviour
- Automated posting is permitted only through approved API access
- Coordinated inauthentic behaviour (fake engagement, artificial amplification) is prohibited
- Accounts suspected of automation may be required to verify identity

1.3 Manipulated Media
Content that has been manipulated to deceive is not permitted:
- Deepfakes or synthetic media presented as authentic
- Deceptively edited video/audio
- Manipulated imagery designed to mislead

Exception: Clearly labelled satire, parody, or artistic expression

SECTION 2: SAFETY

2.1 Violence and Threats
We do not allow:
- Threats of violence against individuals or groups
- Content celebrating or glorifying violence
- Instructions for committing violent acts
- Graphic violence except in documentary or educational contexts (with warnings)

2.2 Harassment and Bullying
Prohibited behaviour includes:
- Targeted harassment of individuals
- Doxxing (sharing private information without consent)
- Sexual harassment or unwanted sexual content
- Encouraging others to harass

2.3 Hate Speech
Content that attacks people based on protected characteristics is not permitted:
- Race, ethnicity, national origin
- Religion
- Sexual orientation or gender identity
- Disability
- Immigration status

We distinguish between hate speech and legitimate discussion of these topics. Context matters in our assessment.

2.4 Self-Harm and Suicide
Content promoting or glorifying self-harm is prohibited. We:
- Remove content encouraging self-harm
- Show support resources on related searches
- May reach out to users who appear to be in crisis
- Allow discussion of personal experiences in recovery contexts

SECTION 3: CONTENT RESTRICTIONS

3.1 Adult Content
- Sexual content is not permitted on ConnectSphere
- Artistic nudity may be permitted with appropriate labelling
- Breastfeeding and post-mastectomy scarring are always allowed
- Sexual solicitation and exploitation are strictly prohibited

3.2 Illegal Activity
Content that facilitates illegal activity is prohibited:
- Drug sales or promotion
- Weapons sales
- Human trafficking
- Fraud and scams

3.3 Misinformation
We reduce the spread of misinformation that could cause harm:
- Health misinformation (especially regarding vaccines, treatments)
- Electoral misinformation during election periods
- Crisis misinformation (natural disasters, emergencies)

Misinformation may be labelled, demoted in distribution, or removed depending on potential harm.

SECTION 4: INTELLECTUAL PROPERTY

4.1 Copyright
- Do not post content that infringes copyright
- Brief clips may qualify as fair use; full videos generally do not
- Music must be licensed or from our royalty-free library

4.2 Reporting Copyright Infringement
Copyright holders may submit DMCA takedown notices. We will:
- Remove or disable access to allegedly infringing content
- Notify the poster
- Provide counter-notification procedures

SECTION 5: ENFORCEMENT

5.1 How We Detect Violations
- Automated systems scan for known violating content
- User reports are reviewed by trained specialists
- Proactive detection for priority violation types (child safety, terrorism)

5.2 Enforcement Actions
Depending on severity and history:
- Warning (first minor violation)
- Content removal
- Feature restrictions (posting, commenting)
- Temporary suspension (24 hours to 30 days)
- Permanent suspension

5.3 Account Strikes
- Strikes are issued for violations
- 3 strikes within 90 days may result in suspension
- Severe violations (terrorism, child exploitation) result in immediate permanent suspension
- Strikes expire after 90 days for first-time violations

SECTION 6: APPEALS

6.1 Appealing Enforcement Actions
If you believe we made an error:
- Use the 'Appeal' button on the violation notice
- Provide context explaining why the content should be allowed
- Appeals are reviewed by a different team from the original decision

6.2 Appeal Timelines
- Appeals must be submitted within 30 days
- We aim to review appeals within 48 hours
- Complex cases may take up to 7 days
- You may submit additional information once during review

6.3 Independent Review
If you disagree with an appeal outcome:
- Eligible decisions can be referred to the Independent Oversight Board
- The Board's decisions are binding on ConnectSphere
- Not all decision types are currently eligible for Board review

---
ConnectSphere Inc.
Community Guidelines Version 8.2
Questions: guidelines@connectsphere.com""",
            "questions": [
                {
                    "question": "How many strikes within 90 days may result in account suspension?",
                    "type": "short_answer",
                    "answer": "3",
                    "explanation": "Section 5.3 states: '3 strikes within 90 days may result in suspension.'"
                },
                {
                    "question": "Within how many days must appeals be submitted?",
                    "type": "short_answer",
                    "answer": "30 days",
                    "explanation": "Section 6.2 states: 'Appeals must be submitted within 30 days.'"
                },
                {
                    "question": "What is the target timeframe for reviewing appeals?",
                    "type": "multiple_choice",
                    "options": ["24 hours", "48 hours", "72 hours", "7 days"],
                    "answer": "48 hours",
                    "explanation": "Section 6.2 states: 'We aim to review appeals within 48 hours.'"
                },
                {
                    "question": "After how many days do strikes expire for first-time violations?",
                    "type": "short_answer",
                    "answer": "90 days",
                    "explanation": "Section 5.3 states: 'Strikes expire after 90 days for first-time violations.'"
                },
                {
                    "question": "The platform allows clearly labelled deepfakes for satire or parody.",
                    "type": "true_false_ng",
                    "answer": "True",
                    "explanation": "Section 1.3 states: 'Exception: Clearly labelled satire, parody, or artistic expression.'"
                },
                {
                    "question": "All enforcement decisions are eligible for Independent Oversight Board review.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section 6.3 states: 'Not all decision types are currently eligible for Board review.'"
                }
            ]
        }
    },
    "tourism_heritage": {
        "module_id": "tourism_heritage",
        "module_title": "Tourism, Cultural Heritage, and Global Mobility",
        "track": "general",
        "level": "advanced",
        "band_target": "7.0-9.0",
        "strategic_focus": "Understanding travel insurance and consumer protection documentation",
        "learning_outcome": "Navigate travel insurance policy documents, claim procedures, and consumer rights.",
        "reading_scenario": {
            "title": "Travel Insurance Policy Wording",
            "context": "You are reviewing your travel insurance policy before making a claim for a disrupted trip.",
            "text_type": "Insurance Policy Document",
            "passage": """GLOBAL TRAVEL PROTECT
Policy Wording Document
Annual Multi-Trip Premier Policy
Policy Year: 2024-2025

SECTION A: TRIP CANCELLATION

A1. What Is Covered
We will pay up to £5,000 per person (£15,000 total for group bookings) for irrecoverable travel and accommodation costs if you are forced to cancel your trip due to:
a) Death, serious illness, or injury of you, a travelling companion, or close relative
b) Jury service or witness summons
c) Redundancy (after 2 years continuous employment)
d) Your home being made uninhabitable
e) Theft of passport within 48 hours of departure
f) Foreign Office advice against travel to your destination (issued after booking)

A2. What Is Not Covered
We will not pay for cancellation due to:
- Disinclination to travel
- Known or foreseeable circumstances at time of booking
- Government action (other than FCDO advice against travel)
- Financial failure of travel provider (see ATOL/ABTA protection)
- Pregnancy (unless complication certified by medical professional)
- Pre-existing medical conditions not declared at policy purchase
- Any condition for which you were awaiting investigation, treatment, or consultation at time of booking

A3. Claims Evidence Required
- Original booking confirmations and receipts
- Cancellation invoice from travel provider
- Medical certificate (for health-related claims)
- Police report (theft/crime-related claims)
- Death certificate (bereavement claims)
- Employer letter (redundancy claims)

SECTION B: TRIP INTERRUPTION AND CURTAILMENT

B1. What Is Covered
We will pay:
- Unused portion of prepaid travel/accommodation (up to £5,000)
- Reasonable additional transport costs to return home early (up to £2,500)
- Reasonable additional accommodation if return is delayed (up to £150 per night, max 5 nights)

B2. Qualifying Events
Cover applies when your trip is cut short due to the same circumstances as Section A1, plus:
- Natural disaster at destination
- Outbreak of infectious disease (WHO-declared)
- Civil unrest or terrorism at destination (occurring after departure)

SECTION C: MEDICAL EXPENSES

C1. Coverage Limits
- Emergency medical treatment: Up to £10,000,000
- Emergency dental treatment: Up to £500 (pain relief only)
- Repatriation costs: Unlimited (when medically necessary)
- Hospital benefit: £50 per 24 hours as inpatient (max £1,500)

C2. What Is Covered
- Treatment by qualified medical practitioners
- Hospital accommodation and treatment
- Medical evacuation when local treatment inadequate
- Accompanying person's travel costs if medically required
- Funeral expenses abroad (up to £3,000) OR repatriation of remains

C3. Conditions
- You must contact our 24-hour emergency line before incurring costs over £500
- Treatment must be medically necessary (not elective or pre-planned)
- Pre-existing conditions covered only if declared and accepted
- Sports and activities: Additional premium required for hazardous activities

SECTION D: TRAVEL DELAY AND MISSED DEPARTURE

D1. Travel Delay
If departure is delayed by more than 12 hours due to circumstances beyond your control:
- £30 per complete 12-hour period delayed
- Maximum £200 per person

After 24 hours delay, you may alternatively claim under Section A (cancellation) for the outbound portion.

D2. Missed Departure
If you miss your departure point due to:
- Public transport failure
- Accident or breakdown of private vehicle
- Weather conditions

We will pay reasonable additional costs to reach your destination (up to £500) OR reimburse unused portions if journey cannot continue.

D3. What Is Not Covered
- Delays caused by strike or industrial action announced before booking
- Your failure to allow sufficient time
- Withdrawal of services by travel provider
- Delay under 12 hours

SECTION E: BAGGAGE AND PERSONAL POSSESSIONS

E1. Coverage Limits
- Total baggage: Up to £2,500
- Single item limit: £350
- Valuables aggregate: £500
- Cash: £250
- Baggage delay (over 12 hours): £150 for essential purchases

E2. Conditions
- Valuables must be in hand luggage or hotel safe
- Items left unattended in vehicles not covered
- Depreciation applied to items over 2 years old
- Pairs and sets: We pay proportional value, not full replacement

SECTION F: MAKING A CLAIM

F1. How to Claim
- Online: www.globaltravelprotect.co.uk/claims (fastest)
- Phone: 0800 XXX XXXX (Monday-Friday 9:00-17:30)
- Post: Claims Department, Freepost GLOBAL TRAVEL

F2. Time Limits
- Notify us within 31 days of the incident
- Submit full claim within 90 days
- Late claims may be rejected unless reasonable excuse

F3. Our Commitment
- Acknowledge claims within 3 working days
- Decision within 10 working days for straightforward claims
- Complex claims: Update every 14 days until resolved

---
Global Travel Protect is a trading name of Insurance Services Ltd
Authorised and regulated by the Financial Conduct Authority (FCA Number: 987654)
Policy Wording Version: GTP-MTP-2024-P""",
            "questions": [
                {
                    "question": "What is the maximum cancellation cover per person?",
                    "type": "short_answer",
                    "answer": "£5,000",
                    "explanation": "Section A1 states: 'We will pay up to £5,000 per person.'"
                },
                {
                    "question": "After how many hours of delay can policyholders alternatively claim under the cancellation section?",
                    "type": "short_answer",
                    "answer": "24 hours",
                    "explanation": "Section D1 states: 'After 24 hours delay, you may alternatively claim under Section A.'"
                },
                {
                    "question": "What is the single item limit for baggage claims?",
                    "type": "short_answer",
                    "answer": "£350",
                    "explanation": "Section E1 states: 'Single item limit: £350.'"
                },
                {
                    "question": "Within how many days must claims be notified?",
                    "type": "multiple_choice",
                    "options": ["14 days", "21 days", "31 days", "60 days"],
                    "answer": "31 days",
                    "explanation": "Section F2 states: 'Notify us within 31 days of the incident.'"
                },
                {
                    "question": "What is the hospital benefit payment rate?",
                    "type": "short_answer",
                    "answer": "£50 per 24 hours",
                    "explanation": "Section C1 states: 'Hospital benefit: £50 per 24 hours as inpatient.'"
                },
                {
                    "question": "The policy covers cancellation due to pregnancy regardless of complications.",
                    "type": "true_false_ng",
                    "answer": "False",
                    "explanation": "Section A2 states: 'Pregnancy (unless complication certified by medical professional)' is not covered without complications."
                }
            ]
        }
    }
}
