LEVEL_TEST_READING_QUESTIONS = [
    {
        "id": 1,
        "level": "elementary",
        "passage": "The weather today is sunny and warm. Many people are going to the park to enjoy the day. Children are playing on the grass while their parents sit on benches.",
        "question": "What are the children doing in the park?",
        "options": ["A) Sitting on benches", "B) Playing on the grass", "C) Going home", "D) Reading books"],
        "correct": "B",
    },
    {
        "id": 2,
        "level": "pre-intermediate",
        "passage": "Scientists have discovered that regular exercise not only improves physical health but also has significant benefits for mental well-being. Studies show that just 30 minutes of moderate exercise can reduce stress and improve mood.",
        "question": "According to the passage, what is one benefit of regular exercise?",
        "options": ["A) It makes you taller", "B) It reduces stress", "C) It helps you sleep longer", "D) It increases appetite"],
        "correct": "B",
    },
    {
        "id": 3,
        "level": "intermediate",
        "passage": "The proliferation of smartphones has fundamentally altered the way humans communicate and access information. While these devices offer unprecedented connectivity, critics argue that excessive screen time may be detrimental to interpersonal relationships and cognitive development, particularly among younger users.",
        "question": "What concern do critics have about smartphones?",
        "options": ["A) They are too expensive", "B) They may harm relationships and brain development", "C) They don't have enough features", "D) They are difficult to use"],
        "correct": "B",
    },
    {
        "id": 4,
        "level": "upper-intermediate",
        "passage": "The phenomenon of confirmation bias\u2014the tendency to seek out information that supports one's existing beliefs while dismissing contradictory evidence\u2014poses a significant challenge to objective decision-making. This cognitive bias is particularly pronounced in politically charged discussions, where individuals often interpret ambiguous information in ways that reinforce their preconceptions.",
        "question": "What does confirmation bias cause people to do?",
        "options": ["A) Accept all information equally", "B) Favor information that supports their existing beliefs", "C) Avoid making any decisions", "D) Change their opinions frequently"],
        "correct": "B",
    },
    {
        "id": 5,
        "level": "advanced",
        "passage": "The epistemological implications of artificial intelligence have sparked considerable debate among philosophers and technologists alike. As machine learning algorithms demonstrate increasingly sophisticated pattern recognition capabilities, questions arise regarding the nature of understanding itself\u2014whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension through statistical correlation.",
        "question": "What philosophical question does AI raise according to the passage?",
        "options": ["A) Whether computers will replace humans", "B) Whether machines can truly understand or just imitate understanding", "C) How to make AI more affordable", "D) When AI was first invented"],
        "correct": "B",
    },
]


COMPREHENSIVE_READING_QUESTIONS = [
    {
        "id": 1,
        "level": "A1",
        "band": 2.5,
        "passage": "My name is John. I am a teacher. I work at a school. I like my job. I have many students.",
        "question": "What is John's job?",
        "options": ["A) Doctor", "B) Teacher", "C) Student", "D) Driver"],
        "correct": "B",
        "skill": "basic_comprehension",
        "passageExcerpt": "I am a teacher",
        "explanation": "The passage directly states 'I am a teacher.' This is a straightforward factual question.",
        "skillTip": "For 'What is/are' questions, look for direct statements using 'is', 'am', or 'are'.",
    },
    {
        "id": 2,
        "level": "A1",
        "band": 3.0,
        "passage": "The library opens at 9:00 AM and closes at 6:00 PM every day except Sunday. On Sunday, it is closed.",
        "question": "When is the library closed?",
        "options": ["A) Monday", "B) Saturday", "C) Sunday", "D) Every day"],
        "correct": "C",
        "skill": "time_information",
        "passageExcerpt": "On Sunday, it is closed",
        "explanation": "The passage explicitly states 'On Sunday, it is closed.' The word 'except' indicates Sunday is different from other days.",
        "skillTip": "Pay attention to words like 'except', 'but', and 'however'. They often mark the key exception.",
    },
    {
        "id": 3,
        "level": "A2",
        "band": 4.0,
        "passage": "Sarah goes to the gym three times a week to stay healthy. She usually runs for 30 minutes and then does some exercises. After her workout, she feels energetic and happy.",
        "question": "How often does Sarah go to the gym?",
        "options": ["A) Every day", "B) Once a week", "C) Three times a week", "D) Twice a month"],
        "correct": "C",
        "skill": "frequency_detail",
        "passageExcerpt": "goes to the gym three times a week",
        "explanation": "The frequency 'three times a week' is stated directly at the beginning of the passage.",
        "skillTip": "Frequency questions often use phrases like 'once', 'twice', or 'times a week'.",
    },
    {
        "id": 4,
        "level": "A2",
        "band": 4.5,
        "passage": "Scientists have discovered that regular exercise not only improves physical health but also has significant benefits for mental well-being. Studies show that just 30 minutes of moderate exercise can reduce stress and improve mood.",
        "question": "According to the passage, what is one benefit of regular exercise?",
        "options": ["A) It makes you taller", "B) It reduces stress", "C) It helps you sleep longer", "D) It increases appetite"],
        "correct": "B",
        "skill": "detail_comprehension",
        "passageExcerpt": "can reduce stress and improve mood",
        "explanation": "The passage states that exercise 'can reduce stress and improve mood.'",
        "skillTip": "For benefit questions, scan for positive result words such as 'improve', 'reduce', and 'help'.",
    },
    {
        "id": 5,
        "level": "B1",
        "band": 5.0,
        "passage": "Remote work has become increasingly popular in recent years, offering employees flexibility and eliminating commute time. However, it also presents challenges such as maintaining work-life balance and staying connected with colleagues. Companies must adapt their management strategies to support remote teams effectively.",
        "question": "What challenge does remote work present according to the passage?",
        "options": ["A) Higher salary costs", "B) Difficulty maintaining work-life balance", "C) Increased office space needs", "D) More vacation time required"],
        "correct": "B",
        "skill": "inference",
        "passageExcerpt": "it also presents challenges such as maintaining work-life balance",
        "explanation": "The passage explicitly names work-life balance as a challenge introduced after 'However'.",
        "skillTip": "Contrast markers like 'However' often introduce the tested detail.",
    },
    {
        "id": 6,
        "level": "B1",
        "band": 5.5,
        "passage": "The proliferation of smartphones has fundamentally altered the way humans communicate and access information. While these devices offer unprecedented connectivity, critics argue that excessive screen time may be detrimental to interpersonal relationships and cognitive development, particularly among younger users.",
        "question": "What concern do critics have about smartphones?",
        "options": ["A) They are too expensive", "B) They may harm relationships and brain development", "C) They don't have enough features", "D) They are difficult to use"],
        "correct": "B",
        "skill": "critical_analysis",
        "passageExcerpt": "may be detrimental to interpersonal relationships and cognitive development",
        "explanation": "'Detrimental' means harmful. The passage links the concern to relationships and cognitive development.",
        "skillTip": "Translate advanced vocabulary into simple meaning before matching an option.",
    },
    {
        "id": 7,
        "level": "B2",
        "band": 6.0,
        "passage": "The phenomenon of confirmation bias\u2014the tendency to seek out information that supports one's existing beliefs while dismissing contradictory evidence\u2014poses a significant challenge to objective decision-making. This cognitive bias is particularly pronounced in politically charged discussions, where individuals often interpret ambiguous information in ways that reinforce their preconceptions.",
        "question": "What does confirmation bias cause people to do?",
        "options": ["A) Accept all information equally", "B) Favor information that supports their existing beliefs", "C) Avoid making any decisions", "D) Change their opinions frequently"],
        "correct": "B",
        "skill": "complex_inference",
        "passageExcerpt": "the tendency to seek out information that supports one's existing beliefs",
        "explanation": "The definition inside dashes directly explains the answer.",
        "skillTip": "Definitions between dashes often contain the exact answer logic.",
    },
    {
        "id": 8,
        "level": "B2",
        "band": 6.5,
        "passage": "Contemporary urban planning faces the paradox of simultaneously accommodating population growth while preserving environmental sustainability. Innovative solutions such as vertical gardens, green roofs, and mixed-use developments represent attempts to reconcile these competing demands, though their long-term efficacy remains subject to empirical validation.",
        "question": "What challenge do urban planners face?",
        "options": ["A) Finding enough construction workers", "B) Balancing population growth with environmental protection", "C) Reducing traffic congestion", "D) Building taller buildings"],
        "correct": "B",
        "skill": "paradox_understanding",
        "passageExcerpt": "accommodating population growth while preserving environmental sustainability",
        "explanation": "The paradox is the need to grow while also protecting the environment.",
        "skillTip": "When a passage says 'paradox', identify the two competing demands.",
    },
    {
        "id": 9,
        "level": "C1",
        "band": 7.5,
        "passage": "The epistemological implications of artificial intelligence have sparked considerable debate among philosophers and technologists alike. As machine learning algorithms demonstrate increasingly sophisticated pattern recognition capabilities, questions arise regarding the nature of understanding itself\u2014whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension through statistical correlation.",
        "question": "What philosophical question does AI raise according to the passage?",
        "options": ["A) Whether computers will replace humans", "B) Whether machines can truly understand or just imitate understanding", "C) How to make AI more affordable", "D) When AI was first invented"],
        "correct": "B",
        "skill": "abstract_reasoning",
        "passageExcerpt": "whether computational processes can be said to 'comprehend' in any meaningful sense, or whether they merely simulate comprehension",
        "explanation": "The passage contrasts genuine understanding with simulated understanding.",
        "skillTip": "In advanced texts, watch for 'whether X or Y' structures because they usually define the core issue.",
    },
    {
        "id": 10,
        "level": "C2",
        "band": 8.5,
        "passage": "The reification of abstract concepts in contemporary discourse often obscures rather than illuminates substantive analysis. When complex socioeconomic phenomena are reduced to simplistic metaphors or personified as autonomous agents, the resultant narrative frameworks can inadvertently perpetuate cognitive distortions that impede nuanced understanding and forestall pragmatic solutions.",
        "question": "According to the passage, what problem occurs when complex ideas are oversimplified?",
        "options": ["A) They become easier to test scientifically", "B) They create distorted thinking that blocks clear solutions", "C) They improve public understanding immediately", "D) They encourage deeper analysis"],
        "correct": "B",
        "skill": "high_level_inference",
        "passageExcerpt": "perpetuate cognitive distortions that impede nuanced understanding and forestall pragmatic solutions",
        "explanation": "The passage says oversimplified narratives create distortions and block nuanced understanding and practical solutions.",
        "skillTip": "For very advanced items, match the consequence described in the passage, not the abstract opening phrase.",
    },
]


def calculate_comprehensive_reading_band(correct_questions):
    """
    Convert progressive reading-question difficulty into an IELTS-style band.

    The previous implementation averaged raw question difficulty points over the
    number of questions, which capped a perfect 10/10 at 5.5 because the item
    weights summed to 53.0 across 10 questions. This function instead:

    1. Sums the difficulty weights of correctly answered questions.
    2. Normalizes that against the maximum available weight.
    3. Maps the normalized score onto the 2.0-9.0 IELTS band range.

    This preserves progressive difficulty while ensuring:
    - 0 correct -> 2.0
    - all correct -> 9.0
    - isolated hard-question guesses do not inflate the result excessively
    """
    max_points = sum(question.get("band", 0) for question in COMPREHENSIVE_READING_QUESTIONS)
    if max_points <= 0:
        return 2.0

    earned_points = sum(question.get("band", 0) for question in correct_questions)
    normalized = earned_points / max_points

    band = 2.0 + (normalized * 7.0)
    return round(band * 2) / 2


def strip_answer_keys(questions):
    return [{key: value for key, value in question.items() if key != "correct"} for question in questions]
