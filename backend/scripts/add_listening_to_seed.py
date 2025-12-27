#!/usr/bin/env python3
"""
Add listening content directly into seed_advanced_mastery.py
This ensures listening is included in every deployment
"""

import json
import re

LISTENING_CONTENT = {
    1: {
        "title": "Academic Lecture: The Challenges and Opportunities of Artificial Intelligence",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_1_listening.mp3",
        "introduction": "You will hear a lecture about the challenges and opportunities presented by artificial intelligence in the digital frontier. Listen carefully and answer questions 1-6.",
        "transcript": "Good morning everyone. Today I want to discuss the multifaceted challenges and opportunities that Artificial Intelligence, or AI, presents within what many now term 'The Digital Frontier.' As you may already be aware, AI is not merely a technological trend. It represents a seismic shift akin to the Industrial Revolution. A recent study conducted by the Oxford Internet Institute indicates that approximately 47% of jobs in the US could be automated within the next two decades. However, it's not all doom and gloom. AI is set to revolutionize industries by enhancing efficiency and accuracy. For instance, in healthcare, DeepMind's algorithms are assisting in diagnosing eye diseases with an accuracy rate of 94%, as reported by The Lancet. Nonetheless, one cannot overlook the ethical implications. Should AI systems have autonomy in decision-making processes, especially those impacting human lives? Experts like Professor Stuart Russell from Berkeley argue the importance of integrating ethical considerations from the start. He notes that while AI could add $13 trillion to the global economy by 2030, as per McKinsey Global Institute, the societal divide could widen if regulations aren't implemented judiciously. Thus, as we forge ahead into this digital age, it is imperative to balance innovation with ethical responsibility. In conclusion, the digital frontier offers unprecedented opportunities but also compels us to reconsider our ethical frameworks to ensure that future advancements benefit all of humanity equitably.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "According to the lecturer, what is the main impact of AI on industries?", "options": ["A) Reducing human labor", "B) Enhancing efficiency and accuracy", "C) Increasing costs", "D) Reducing ethical concerns"], "answer": "B", "explanation": "The lecturer states that AI is set to revolutionize industries by enhancing efficiency and accuracy."},
            {"number": 2, "type": "completion", "question": "The research found that _____ percent of jobs could be automated in the next two decades.", "answer": "47", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What does the speaker suggest about AI's economic impact?", "options": ["A) It will decrease global GDP", "B) It will stagnate economic growth", "C) It could add $13 trillion to the global economy", "D) It will not affect the economy"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "The lecturer believes that AI systems should have full autonomy.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "According to experts, the key consideration is integrating _____ from the start.", "answer": "ethical considerations", "word_limit": 3},
            {"number": 6, "type": "multiple_choice", "question": "What is the lecturer's conclusion about the digital frontier?", "options": ["A) It requires balancing innovation with ethics", "B) It is largely negative", "C) It will only benefit the rich", "D) It is irrelevant"], "answer": "A"}
        ],
        "vocabulary_focus": [
            {"word": "autonomy", "definition": "The right or condition of self-government"},
            {"word": "seismic shift", "definition": "A fundamental change that has a significant impact"},
            {"word": "equitable", "definition": "Fair and impartial"}
        ],
        "listening_tips": ["Listen for signpost language", "Pay attention to stressed words", "Note down numbers and statistics"]
    },
    2: {
        "title": "Academic Lecture: Sustainable Development and Environmental Conservation",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_2_listening.mp3",
        "introduction": "You will hear a lecture about sustainable development and environmental conservation. Listen carefully and answer questions 1-6.",
        "transcript": "Good afternoon, class. Today we'll examine the critical intersection of sustainable development and environmental conservation. The concept of sustainability has evolved significantly since the 1987 Brundtland Report first defined it as meeting present needs without compromising future generations' ability to meet theirs. Current research from the World Wildlife Fund indicates that humanity is consuming resources at 1.7 times the rate Earth can regenerate them. This ecological overshoot has profound implications for biodiversity, with the Living Planet Index showing a 69% decline in wildlife populations since 1970. However, there are promising developments. Renewable energy capacity has increased by 280% over the past decade, with solar and wind power now cheaper than fossil fuels in many regions. Countries like Costa Rica have achieved nearly 100% renewable electricity generation, demonstrating that ambitious environmental goals are achievable. The circular economy model presents another opportunity. Rather than the traditional linear 'take-make-dispose' approach, circular systems design out waste through recycling, reusing, and regenerating materials. The Ellen MacArthur Foundation estimates this could generate $4.5 trillion in economic benefits by 2030. Nevertheless, implementation challenges remain significant. Developing nations often face difficult trade-offs between economic growth and environmental protection. International cooperation, technology transfer, and climate finance are essential for ensuring a just transition globally.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "According to the Brundtland Report, sustainability means:", "options": ["A) Using fewer resources", "B) Meeting present needs without compromising future generations", "C) Stopping all industrial development", "D) Reducing population growth"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "Wildlife populations have declined by _____ percent since 1970.", "answer": "69", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "What example does the lecturer give of successful renewable energy adoption?", "options": ["A) Germany", "B) China", "C) Costa Rica", "D) United States"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "The circular economy follows a 'take-make-dispose' model.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "The circular economy could generate $_____ trillion in economic benefits by 2030.", "answer": "4.5", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What does the lecturer identify as essential for global transition?", "options": ["A) Reduced consumption only", "B) International cooperation and technology transfer", "C) Individual action alone", "D) Government mandates"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "ecological overshoot", "definition": "Using resources faster than Earth can regenerate them"},
            {"word": "circular economy", "definition": "An economic system aimed at eliminating waste"},
            {"word": "just transition", "definition": "A fair shift to sustainable practices"}
        ],
        "listening_tips": ["Listen for numerical data", "Note contrasting ideas", "Pay attention to examples"]
    },
    3: {
        "title": "Academic Lecture: The Psychology of Learning and Memory",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_3_listening.mp3",
        "introduction": "You will hear a lecture about the psychology of learning and memory. Listen carefully and answer questions 1-6.",
        "transcript": "Welcome everyone. Today's lecture focuses on the fascinating field of cognitive psychology, specifically how we learn and retain information. Understanding these mechanisms has profound implications for education, professional development, and lifelong learning. The human memory system operates through three primary stages: encoding, storage, and retrieval. Research by cognitive psychologist Hermann Ebbinghaus demonstrated that we forget approximately 70% of new information within 24 hours unless we actively review it. This finding led to the development of spaced repetition techniques, now widely used in language learning applications. Recent neuroscience research has revealed the importance of sleep in memory consolidation. Studies at Harvard Medical School found that participants who slept after learning showed 20% better retention than those who remained awake. During sleep, the hippocampus replays newly acquired information, transferring it to long-term storage in the neocortex. Another crucial factor is the concept of 'desirable difficulties' proposed by Robert Bjork. Counterintuitively, making learning slightly challenging through testing effects, interleaving practice, and varying conditions actually enhances long-term retention. Students who struggle productively outperform those given easy, fluent learning experiences. The implications extend to educational policy. Traditional cramming before exams produces short-term gains but poor retention. Instead, distributed practice over time, combined with retrieval practice through self-testing, creates durable learning that transfers to new situations.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "According to Ebbinghaus, how much new information do we forget within 24 hours?", "options": ["A) 50%", "B) 60%", "C) 70%", "D) 80%"], "answer": "C"},
            {"number": 2, "type": "completion", "question": "Participants who slept after learning showed _____ percent better retention.", "answer": "20", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Which brain region is involved in memory consolidation during sleep?", "options": ["A) Amygdala", "B) Hippocampus", "C) Cerebellum", "D) Frontal lobe"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "Making learning easier always leads to better long-term retention.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "The three primary stages of memory are encoding, storage, and _____.", "answer": "retrieval", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "What does the lecturer recommend instead of cramming?", "options": ["A) More intense study sessions", "B) Distributed practice over time", "C) Group study only", "D) Reading without testing"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "memory consolidation", "definition": "The process of transforming short-term to long-term memory"},
            {"word": "spaced repetition", "definition": "Learning by reviewing at increasing intervals"},
            {"word": "desirable difficulties", "definition": "Challenges that improve long-term retention"}
        ],
        "listening_tips": ["Listen for cause-and-effect relationships", "Note specific researchers", "Pay attention to counterintuitive findings"]
    },
    4: {
        "title": "Academic Lecture: Globalization and Cultural Identity",
        "level": "C1",
        "duration": "3 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_4_listening.mp3",
        "introduction": "You will hear a lecture about globalization and its effects on cultural identity. Listen carefully and answer questions 1-6.",
        "transcript": "Good morning. Today we explore one of the most debated topics in contemporary sociology: the relationship between globalization and cultural identity. As our world becomes increasingly interconnected, fundamental questions arise about cultural preservation and transformation. Globalization has accelerated dramatically since the 1990s. The World Bank reports that international trade has grown from $4 trillion in 1990 to over $25 trillion today. This economic integration has facilitated unprecedented cultural exchange or, critics argue, cultural homogenization dominated by Western influences. The sociologist George Ritzer coined the term 'McDonaldization' to describe the spread of standardized, efficiency-driven practices across societies. His thesis suggests that local traditions and customs are being replaced by uniform global patterns. Evidence supporting this includes the dominance of English as a global language, with UNESCO estimating that a language dies approximately every two weeks. However, scholars like Arjun Appadurai challenge this homogenization thesis. His concept of 'glocalization' recognizes that global influences are always filtered through local contexts. Japanese anime, Korean pop music, and Nigerian cinema demonstrate how non-Western cultural products now command global audiences. The flow of culture, Appadurai argues, is multidirectional rather than simply West-to-rest. Furthermore, globalization can paradoxically strengthen local identities. The threat of cultural erosion has sparked revival movements worldwide, from indigenous language preservation in New Zealand to traditional craft renaissance in rural Japan.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "How much has international trade grown since 1990?", "options": ["A) From $4 trillion to $15 trillion", "B) From $4 trillion to $25 trillion", "C) From $10 trillion to $25 trillion", "D) From $4 trillion to $40 trillion"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "According to UNESCO, a language dies approximately every _____ weeks.", "answer": "two", "word_limit": 1},
            {"number": 3, "type": "multiple_choice", "question": "Who coined the term 'McDonaldization'?", "options": ["A) Arjun Appadurai", "B) George Ritzer", "C) The World Bank", "D) UNESCO"], "answer": "B"},
            {"number": 4, "type": "true_false", "question": "Appadurai argues that cultural flow is only from West to the rest of the world.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Appadurai's concept of '___' recognizes that global influences are filtered through local contexts.", "answer": "glocalization", "word_limit": 1},
            {"number": 6, "type": "multiple_choice", "question": "According to the lecture, what can globalization paradoxically do?", "options": ["A) Eliminate all local cultures", "B) Strengthen local identities", "C) Stop international trade", "D) Prevent cultural exchange"], "answer": "B"}
        ],
        "vocabulary_focus": [
            {"word": "homogenization", "definition": "Making things uniform or similar"},
            {"word": "glocalization", "definition": "Adapting global products to local cultures"},
            {"word": "multidirectional", "definition": "Moving in many directions"}
        ],
        "listening_tips": ["Listen for academic terminology", "Note contrasting viewpoints", "Pay attention to examples from different cultures"]
    },
    5: {
        "title": "Academic Lecture: The Future of Work and Automation",
        "level": "C1",
        "duration": "4 minutes",
        "format": "academic_lecture",
        "audio_file": "/audio/advanced_mastery/module_5_listening.mp3",
        "introduction": "You will hear a lecture about the future of work and the impact of automation. Listen carefully and answer questions 1-6.",
        "transcript": "Good afternoon everyone. Today's lecture addresses one of the most pressing questions of our time: how will automation reshape the future of work? This topic sits at the intersection of economics, technology, and social policy. Historical perspective is instructive here. The First Industrial Revolution displaced agricultural workers but created new manufacturing jobs. Similarly, computerization in the late 20th century eliminated clerical positions while generating roles in the knowledge economy. The question is whether artificial intelligence and robotics will follow this pattern or represent something fundamentally different. Research from MIT economists Daron Acemoglu and Pascual Restrepo suggests we're entering uncharted territory. Their analysis indicates that while previous technologies augmented human capabilities, current AI systems increasingly substitute for human labor across cognitive tasks. McKinsey Global Institute estimates that by 2030, automation could displace up to 375 million workers globally, roughly 14% of the workforce. However, this displacement won't be evenly distributed. Jobs requiring routine cognitive or manual tasks face the highest automation risk. Occupations combining creativity, emotional intelligence, and complex problem-solving appear more resilient. Healthcare, education, and creative industries may actually see job growth as automation increases productivity elsewhere. The policy implications are significant. Many economists advocate for expanded education and retraining programs. Others propose more radical interventions like universal basic income, arguing that traditional employment may no longer provide sufficient income distribution. Finland's recent UBI experiment, though limited, showed participants reported improved wellbeing and were more likely to find employment than control groups. What seems clear is that navigating this transition successfully requires proactive policy-making rather than reactive crisis management.",
        "questions": [
            {"number": 1, "type": "multiple_choice", "question": "According to the lecture, what happened during the First Industrial Revolution?", "options": ["A) Jobs were permanently lost", "B) Agricultural workers were displaced but new jobs were created", "C) No significant changes occurred", "D) Only positive outcomes resulted"], "answer": "B"},
            {"number": 2, "type": "completion", "question": "McKinsey estimates automation could displace up to _____ million workers by 2030.", "answer": "375", "word_limit": 2},
            {"number": 3, "type": "multiple_choice", "question": "Which type of jobs are most at risk from automation?", "options": ["A) Creative jobs", "B) Healthcare jobs", "C) Routine cognitive or manual tasks", "D) Education jobs"], "answer": "C"},
            {"number": 4, "type": "true_false", "question": "Finland's UBI experiment showed participants were less likely to find employment.", "answer": "False"},
            {"number": 5, "type": "completion", "question": "Automation could displace roughly _____ percent of the global workforce.", "answer": "14", "word_limit": 2},
            {"number": 6, "type": "multiple_choice", "question": "What does the lecturer suggest is needed to navigate this transition?", "options": ["A) Reactive crisis management", "B) Ignoring the problem", "C) Proactive policy-making", "D) Stopping all automation"], "answer": "C"}
        ],
        "vocabulary_focus": [
            {"word": "augmented", "definition": "Made greater or enhanced"},
            {"word": "resilient", "definition": "Able to withstand difficult conditions"},
            {"word": "universal basic income", "definition": "Regular payment to all citizens"}
        ],
        "listening_tips": ["Note statistics and numbers", "Listen for the speaker's evaluation", "Pay attention to historical comparisons"]
    }
}

def update_seed_file():
    """Add listening to each module in the seed file"""
    
    seed_file = "/app/backend/seed_advanced_mastery.py"
    
    # Read the current file
    with open(seed_file, 'r') as f:
        content = f.read()
    
    # Parse the ADVANCED_MODULES list
    # Find where it starts
    match = re.search(r'ADVANCED_MODULES = (\[.*?\])\s*\n\nasync def', content, re.DOTALL)
    if not match:
        print("Could not find ADVANCED_MODULES in seed file")
        return False
    
    modules_str = match.group(1)
    
    try:
        # This is risky but should work for valid Python list
        modules = eval(modules_str)
    except Exception as e:
        print(f"Error parsing modules: {e}")
        return False
    
    # Add listening to modules 1-5
    for module in modules:
        module_num = module.get('module_number')
        if module_num in LISTENING_CONTENT:
            module['listening'] = LISTENING_CONTENT[module_num]
            print(f"Added listening to module {module_num}")
    
    # Convert back to string
    new_modules_str = repr(modules)
    
    # Replace in content
    new_content = content.replace(modules_str, new_modules_str)
    
    # Write back
    with open(seed_file, 'w') as f:
        f.write(new_content)
    
    print("✅ Seed file updated with listening content!")
    return True

if __name__ == "__main__":
    update_seed_file()
