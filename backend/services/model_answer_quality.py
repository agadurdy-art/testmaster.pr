"""
Model Answer Quality Standards
==============================
Guidelines for creating authentic, examiner-approved IELTS model answers.

Key Principles:
1. NO TEMPLATE LANGUAGE - Every answer should feel unique and authentic
2. NATURAL FLOW - Sentences should connect logically without forced transitions
3. TRACK-APPROPRIATE TONE - Academic vs General must feel genuinely different
4. EXAMINER-VERIFIED STYLE - Matches what IELTS examiners look for at each band
"""

# ============ QUALITY STANDARDS ============

WRITING_QUALITY_STANDARDS = {
    "band_9": {
        "characteristics": [
            "Sophisticated vocabulary used naturally, not forced",
            "Complex ideas expressed with apparent ease",
            "Zero grammatical errors",
            "Perfect paragraph flow - reader never gets lost",
            "Original insights, not recycled arguments"
        ],
        "avoid": [
            "Overused phrases: 'In today's modern world', 'It is widely believed'",
            "Mechanical transitions: 'Firstly... Secondly... Thirdly...'",
            "Generic examples: 'For example, many people...'",
            "Template conclusions: 'In conclusion, it can be said that...'"
        ],
        "prefer": [
            "Context-specific openings that hook the reader",
            "Varied linking: 'This raises the question of...', 'A case in point is...'",
            "Specific, concrete examples with details",
            "Conclusions that add new insight, not just summarize"
        ]
    },
    "band_8": {
        "characteristics": [
            "Wide vocabulary range with occasional sophisticated items",
            "Rare minor errors that don't impede communication",
            "Clear, logical progression throughout",
            "Well-developed ideas with relevant support"
        ],
        "avoid": [
            "Starting with 'Nowadays' or 'In recent years'",
            "Using 'pros and cons' in academic writing",
            "Vague quantifiers: 'a lot of', 'many people'"
        ],
        "prefer": [
            "Specific data or named examples where possible",
            "Hedging language: 'tends to', 'appears to', 'arguably'",
            "Varied sentence patterns naturally"
        ]
    },
    "band_7": {
        "characteristics": [
            "Good vocabulary with some less common items",
            "Some errors but meaning always clear",
            "Clear overall progression with minor lapses",
            "Ideas developed but may be over-generalized"
        ]
    }
}

SPEAKING_QUALITY_STANDARDS = {
    "part_2": {
        "authentic_features": [
            "Natural hesitation markers: 'Let me think...', 'Actually, I'd say...'",
            "Self-correction: 'Well, no, what I mean is...'",
            "Personal anecdotes with specific details",
            "Emotional language showing genuine engagement"
        ],
        "avoid": [
            "Perfect, rehearsed-sounding paragraphs",
            "Unnatural topic coverage (hitting all points mechanically)",
            "Generic descriptions without personal detail"
        ],
        "structure": [
            "Natural intro - not 'I'd like to talk about...'",
            "Story-like development with small digressions",
            "Genuine-sounding conclusion with personal reflection"
        ]
    },
    "part_3": {
        "authentic_features": [
            "Thinking aloud: 'That's an interesting question...', 'I suppose...'",
            "Building on ideas: 'And another thing is...', 'What's more...'",
            "Acknowledging complexity: 'It's not straightforward because...'",
            "Personal stance: 'I personally feel that...', 'From my perspective...'"
        ],
        "avoid": [
            "Memorized answers that sound scripted",
            "Over-structured responses (always 3 points)",
            "Academic vocabulary that sounds unnatural in speech"
        ]
    }
}

GENERAL_TRAINING_LETTER_STANDARDS = {
    "formal": {
        "tone": "Professional, respectful, maintains distance",
        "authentic_phrases": [
            "I am writing to bring to your attention...",
            "I would be grateful if you could...",
            "Please do not hesitate to contact me...",
            "I look forward to hearing from you."
        ],
        "avoid": [
            "Overly stiff language: 'I hereby request...'",
            "Mixing registers: formal + contractions",
            "Being too deferential: 'I humbly request...'"
        ],
        "examples": {
            "complaint_opening": "I am writing to express my dissatisfaction with the service I received...",
            "request_opening": "I am writing to enquire about...",
            "closing": "I trust this matter will receive your prompt attention."
        }
    },
    "semi_formal": {
        "tone": "Polite but warmer, professional yet approachable",
        "authentic_phrases": [
            "I hope this finds you well.",
            "I wanted to let you know that...",
            "Would it be possible for you to...?",
            "Thank you for your understanding."
        ],
        "avoid": [
            "Being too formal: 'I am writing to inform you...'",
            "Being too casual: 'Hey, just wanted to say...'",
            "Inconsistent register shifts"
        ]
    },
    "informal": {
        "tone": "Warm, personal, conversational",
        "authentic_phrases": [
            "I've been meaning to write...",
            "You won't believe what happened!",
            "I can't wait to hear from you!",
            "Drop me a line when you get a chance."
        ],
        "natural_features": [
            "Contractions: I'm, you're, can't, won't",
            "Exclamations: 'Guess what!'",
            "Rhetorical questions: 'Can you believe it?'",
            "Colloquial expressions (appropriate level)"
        ],
        "avoid": [
            "Slang that's too strong for IELTS",
            "Text-speak abbreviations",
            "Overly formal closings: 'Yours sincerely'"
        ]
    }
}


# ============ ENHANCED MODEL ANSWERS ============

ENHANCED_WRITING_MODELS = {
    "academic_task2": {
        "topic": "Technology and ethical regulations",
        "band_9_model": """The pace at which technological innovation advances has long outstripped our capacity to establish ethical guardrails, creating a regulatory landscape that perpetually plays catch-up. This asymmetry presents both immediate risks and longer-term societal challenges that demand our attention.

The crux of the problem lies in the fundamental nature of innovation itself. Technological breakthroughs emerge from competitive, often proprietary environments where speed-to-market is paramount. Consider the rapid deployment of large language models: within months, these systems moved from research labs to billions of users worldwide, with minimal public discourse about their implications for employment, education, or democratic processes. By the time legislators begin drafting frameworks, the technology has evolved into something quite different from what sparked initial concerns.

This regulatory lag manifests in concerning ways. Data harvesting practices that would have seemed dystopian a generation ago are now standard business models. Algorithmic decision-making increasingly determines who receives loans, jobs, or medical treatment—yet the systems making these determinations often operate as black boxes, immune to meaningful scrutiny. The Cambridge Analytica scandal offered a glimpse of how personal data could be weaponized, yet similar vulnerabilities persist years later.

Addressing this imbalance requires acknowledging that traditional regulatory approaches are inadequate. Legislation written for specific technologies becomes obsolete almost immediately. Instead, we need principles-based frameworks that establish clear ethical boundaries while remaining technology-agnostic. The European Union's GDPR, despite its imperfections, offers a model: it focuses on data rights rather than specific technical implementations.

Furthermore, the technology sector itself must accept greater responsibility. Self-regulation has demonstrably failed to prevent harm, but the expertise needed to anticipate technological risks resides primarily within the industry. Mandatory ethical impact assessments, similar to environmental reviews for construction projects, could bridge this gap.

The challenge is formidable, but not insurmountable. What we lack is not the capacity to develop ethical frameworks, but the collective will to prioritize them alongside commercial interests.""",
        
        "examiner_notes": {
            "task_response": "Fully addresses all parts with a well-developed, nuanced position. Each paragraph advances the argument.",
            "coherence": "Exceptional flow. 'The crux of the problem', 'This regulatory lag', 'Furthermore' - transitions feel natural, not mechanical.",
            "lexical": "Sophisticated vocabulary (asymmetry, guardrails, proprietary, weaponized) used naturally. No forced academic terms.",
            "grammar": "Wide range of structures. Complex sentences don't sacrifice clarity. Zero errors."
        }
    },
    
    "general_task1_formal_complaint": {
        "scenario": "Complaint about internet service",
        "band_9_model": """Dear Sir or Madam,

I am writing regarding the persistent failure of the broadband service at my residence, 47 Maple Drive, which has now entered its third week without resolution despite multiple attempts to address the matter through your customer service channels.

The issues began on 12th November, when connectivity dropped entirely without warning. Over the subsequent fortnight, I have contacted your helpline on four separate occasions (reference numbers available upon request), each time receiving assurances that an engineer would attend within 48 hours. To date, no engineer has visited, and my calls to the technical support line have resulted in lengthy hold times followed by scripted apologies but no substantive action.

The impact has been considerable. As someone who works remotely three days per week, I have been forced to use expensive mobile data and seek alternative working arrangements at significant personal inconvenience. The disruption has affected not only my professional obligations but also my children's ability to complete online homework assignments.

Given the circumstances, I require the following: immediate attendance by a qualified engineer, a detailed explanation for the repeated failures in your appointment system, and appropriate compensation reflecting the period without service. I note that under my contract, I am paying £45 monthly for a service that has not been delivered.

I would appreciate your written response within seven working days. Should this matter remain unresolved, I will refer it to Ofcom and explore my options under the Alternative Dispute Resolution scheme.

Yours faithfully,
Rachel Morrison""",
        
        "quality_markers": [
            "Specific details: address, dates, reference numbers",
            "Professional but not stiff tone",
            "Clear structure: problem → impact → required action",
            "Appropriate assertiveness without rudeness",
            "Knowledge of rights (Ofcom, ADR) shows educated consumer"
        ]
    },
    
    "general_task1_informal": {
        "scenario": "Inviting a friend to visit",
        "band_9_model": """Hi Tom,

I've been meaning to write for ages, but you know how it is—life gets in the way! Anyway, I've got some news that I'm really excited about, and I think you might be too.

Remember how I've always complained about my tiny flat? Well, I finally moved! The new place is brilliant—two bedrooms, a proper kitchen where I can actually cook without bumping into things, and get this: a balcony with a view of the park. I've spent the last month making it feel like home, and now I'm itching to show it off.

Which brings me to my point: any chance you could come and visit next month? I know you mentioned having some time off in June, and honestly, the timing couldn't be better. There's so much to catch up on, and I've discovered this amazing little restaurant down the street that does the best Thai food—we have to try it together.

The spare room is all set up and waiting. I've even bought proper guest towels instead of the ratty ones from uni (yes, I'm finally a real adult!). We could spend a day exploring the neighbourhood, maybe catch a film one evening, or just sit on the balcony with a bottle of wine and put the world to rights like we used to.

Let me know what dates work for you, and I'll make sure everything's sorted. Can't wait to see you!

Sarah x

P.S. Bring that jacket you borrowed last time—I actually miss it!""",
        
        "quality_markers": [
            "Natural, conversational flow",
            "Personal details that feel genuine",
            "Humor and warmth: 'ratty ones from uni', 'real adult'",
            "Informal markers: contractions, 'you know how it is'",
            "P.S. adds authenticity"
        ]
    }
}


ENHANCED_SPEAKING_MODELS = {
    "part2": {
        "topic": "Describe a technological innovation that has raised ethical concerns",
        "band_9_model": """I'd like to talk about facial recognition technology, which is something that's become increasingly controversial over the past few years.

I first really became aware of it—I mean, genuinely thought about the implications—during a work trip to Shenzhen about two years ago. There were cameras everywhere, and my colleague mentioned that the city uses facial recognition for everything from catching jaywalkers to monitoring behaviour in schools. It was fascinating but also quite unsettling.

What struck me most was how seamlessly it had been integrated into daily life there. People would pay for meals by looking at a screen, enter buildings without showing ID—it was remarkably convenient. But the flip side was that this same technology was tracking everyone's movements, all the time. I remember reading that a journalist was identified and located within seven minutes using the city's surveillance network as a demonstration.

The technology itself is genuinely impressive, I think. The accuracy rates have improved dramatically, and there are clearly beneficial applications—helping find missing children, for instance, or speeding up airport security. But here's what troubles me: once these systems exist, there's enormous pressure to expand their use in ways that weren't originally intended. We've seen this pattern with other technologies.

What really changed my perspective was learning about the bias issues. These systems have been shown to be significantly less accurate for women and people with darker skin, which means if they're used for law enforcement—as they increasingly are—they disproportionately affect certain communities.

I suppose what I've taken away from thinking about this is that the question isn't really whether a technology is good or bad in itself—it's about who controls it, how it's regulated, and whether we've genuinely considered the long-term consequences before deployment. And honestly, I don't think we're very good at that last part.""",
        
        "authenticity_markers": [
            "Natural self-interruption: 'I mean, genuinely thought about'",
            "Specific personal detail: work trip, colleague, Shenzhen",
            "Thinking aloud: 'What struck me most', 'here's what troubles me'",
            "Acknowledging complexity: 'The flip side', 'both sides'",
            "Personal reflection in conclusion: 'what I've taken away'",
            "Hedging that sounds natural: 'I suppose', 'honestly'"
        ]
    },
    
    "part3": {
        "question": "Do you think governments should regulate technology companies more strictly?",
        "band_9_model": """That's a question I've thought about quite a bit, actually, and I don't think there's a simple answer—though I do lean towards saying yes, more regulation is probably necessary.

The thing is, we're in a situation now where a handful of tech companies have more influence over what information billions of people see than any government in history. And unlike governments, there's no democratic accountability. When Facebook changes its algorithm, it can shift political discourse in ways we don't fully understand. That kind of power, I think, does require some form of oversight.

But then the counterargument—and it's a reasonable one—is that heavy regulation could stifle innovation. The tech sector has created enormous value precisely because it's been relatively free to experiment. If you look at Europe, which has stricter rules, there are far fewer major tech companies there than in the US or China. So there's a real tension.

What I'd suggest is that we need to be quite targeted about what we regulate. Antitrust measures to prevent monopolies, absolutely. Rules about data protection, yes. But I'd be wary of governments trying to regulate the content itself—that gets into censorship territory quite quickly.

I suppose what concerns me most is that legislators often don't understand the technology they're trying to regulate. We saw this during the Facebook congressional hearings a few years ago—some of the questions were embarrassingly basic. So whatever regulation we develop needs genuine technical expertise behind it, not just political will.

It's not straightforward, but I think finding the right balance is one of the defining challenges for democracies over the next decade.""",
        
        "authenticity_markers": [
            "Acknowledging complexity upfront",
            "Presenting counterarguments fairly",
            "Specific references: Facebook algorithm, congressional hearings",
            "Natural hedging: 'I think', 'I'd suggest', 'I suppose'",
            "Building argument progressively",
            "Thoughtful conclusion without over-claiming"
        ]
    }
}


# ============ ANTI-TEMPLATE PATTERNS ============

TEMPLATE_PHRASES_TO_AVOID = {
    "openings": [
        "In today's modern world...",
        "It is widely believed that...",
        "There are many advantages and disadvantages...",
        "Nowadays, it is a common practice to...",
        "In recent years, there has been a significant increase..."
    ],
    "transitions": [
        "Firstly... Secondly... Thirdly...",
        "On the one hand... On the other hand...",
        "Furthermore, moreover, additionally" # (overused in sequence)
    ],
    "conclusions": [
        "In conclusion, it can be said that...",
        "To sum up, I believe that...",
        "In my opinion, the advantages outweigh the disadvantages.",
        "All in all..."
    ],
    "speaking": [
        "I would like to talk about...",
        "The topic I'm going to discuss is...",
        "There are several reasons why I think this..."
    ]
}

NATURAL_ALTERNATIVES = {
    "openings": [
        "The relationship between X and Y has never been more contested than...",
        "Few issues provoke as much debate as...",
        "X represents one of the defining challenges of our time.",
        "[Direct statement of position or fact as hook]"
    ],
    "transitions": [
        "This raises the question of...",
        "A case in point is...",
        "The implications extend beyond...",
        "What this overlooks, however, is...",
        "Set against this is the reality that..."
    ],
    "conclusions": [
        "[New insight that synthesizes the argument]",
        "The path forward lies in...",
        "What remains clear is that...",
        "[Call to action or future projection]"
    ],
    "speaking": [
        "[Launch directly into the topic with a hook]",
        "Something that immediately comes to mind is...",
        "Actually, this is something I've thought about before..."
    ]
}
