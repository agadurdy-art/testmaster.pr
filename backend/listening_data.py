"""
Listening Assessment Data for Comprehensive Level Test
5-10 progressive difficulty questions (Band 2.0 to 9.0)
Each item has: id, script_text (for TTS), questions, answers, explanations
"""

# Listening sections with progressive difficulty
LISTENING_SECTIONS = [
    # Section 1: Band 2.0-3.5 - Basic Comprehension (Short monologue)
    {
        "id": "listening_1",
        "level": "A1-A2",
        "band_range": "2.0-3.5",
        "title": "Daily Schedule",
        "voice": "female",  # en-GB-SoniaNeural
        "script_text": "Hello. My name is Sarah. I wake up at seven o'clock every morning. First, I have breakfast. I eat toast and drink tea. Then I go to work at eight thirty. I work in an office. I finish work at five o'clock. In the evening, I watch television and read books. I go to bed at ten o'clock.",
        "questions": [
            {
                "id": "q1",
                "type": "mcq",
                "question": "What time does Sarah wake up?",
                "options": ["A) 6 o'clock", "B) 7 o'clock", "C) 8 o'clock", "D) 9 o'clock"],
                "correct": "B",
                "skill": "specific_information",
                "explanation": "Sarah clearly states 'I wake up at seven o'clock every morning.' This tests your ability to identify specific time information.",
                "explanation_vi": "Sarah nói rõ ràng 'Tôi thức dậy lúc bảy giờ mỗi sáng.' Câu này kiểm tra khả năng nhận biết thông tin thời gian cụ thể.",
                "explanation_tr": "Sarah açıkça 'Her sabah saat yedide kalkarım' diyor. Bu, belirli zaman bilgisini tanımlama yeteneğinizi test eder."
            },
            {
                "id": "q2",
                "type": "mcq",
                "question": "What does Sarah have for breakfast?",
                "options": ["A) Eggs and coffee", "B) Cereal and milk", "C) Toast and tea", "D) Fruit and juice"],
                "correct": "C",
                "skill": "detail_comprehension",
                "explanation": "Sarah says 'I eat toast and drink tea' for breakfast. Listen for specific food and drink items mentioned together.",
                "explanation_vi": "Sarah nói 'Tôi ăn bánh mì nướng và uống trà' vào bữa sáng. Hãy nghe các món ăn và đồ uống cụ thể được đề cập cùng nhau.",
                "explanation_tr": "Sarah kahvaltıda 'Tost yerim ve çay içerim' diyor. Birlikte bahsedilen belirli yiyecek ve içecekleri dinleyin."
            }
        ]
    },
    
    # Section 2: Band 3.5-4.5 - Short Conversation (TWO SPEAKERS DIALOGUE)
    {
        "id": "listening_2",
        "level": "A2",
        "band_range": "3.5-4.5",
        "title": "At the Train Station",
        "type": "dialogue",  # NEW: marks this as multi-speaker
        "speakers": ["Passenger", "Staff"],  # NEW: speaker list
        "script_text": """Passenger: Excuse me, can you help me? I need to get to London. Which platform should I go to?
Staff: Platform three, sir. The next train to London leaves at two fifteen.
Passenger: Okay. And how long does the journey take?
Staff: It takes about one hour and twenty minutes.
Passenger: I see. How much is a ticket?
Staff: The ticket costs thirty-two pounds for a single journey, or fifty-eight pounds for a return ticket.
Passenger: I'll have a return ticket please.
Staff: Certainly. That's fifty-eight pounds. Here's your ticket.
Passenger: Thank you very much. That's very helpful.""",
        "questions": [
            {
                "id": "q3",
                "type": "mcq",
                "question": "Which platform does the train to London leave from?",
                "options": ["A) Platform 1", "B) Platform 2", "C) Platform 3", "D) Platform 4"],
                "correct": "C",
                "skill": "specific_information",
                "explanation": "The station attendant says 'Platform three, sir.' Numbers in travel contexts are crucial to understand correctly.",
                "explanation_vi": "Nhân viên nhà ga nói 'Sân ga ba, thưa ông.' Số trong ngữ cảnh du lịch rất quan trọng để hiểu đúng.",
                "explanation_tr": "İstasyon görevlisi 'Üç numaralı peron, efendim' diyor. Seyahat bağlamında sayılar doğru anlamak için çok önemlidir."
            },
            {
                "id": "q4",
                "type": "mcq",
                "question": "How long does the journey take?",
                "options": ["A) 1 hour", "B) 1 hour 20 minutes", "C) 2 hours", "D) 2 hours 15 minutes"],
                "correct": "B",
                "skill": "number_comprehension",
                "explanation": "The speaker says 'It takes about one hour and twenty minutes.' Be careful not to confuse '2:15' (departure time) with the journey duration.",
                "explanation_vi": "Người nói nói 'Mất khoảng một giờ hai mươi phút.' Cẩn thận không nhầm '2:15' (giờ khởi hành) với thời gian hành trình.",
                "explanation_tr": "Konuşmacı 'Yaklaşık bir saat yirmi dakika sürer' diyor. '2:15' (kalkış saati) ile yolculuk süresini karıştırmamaya dikkat edin."
            }
        ]
    },
    
    # Section 3: Band 5.0-5.5 - Extended Monologue
    {
        "id": "listening_3",
        "level": "B1",
        "band_range": "5.0-5.5",
        "title": "Museum Tour Introduction",
        "voice": "female",
        "script_text": "Welcome to the Natural History Museum. Before we begin our tour, I'd like to give you some important information. The museum has three floors. On the ground floor, you'll find the dinosaur exhibition, which is our most popular attraction. The first floor contains exhibits about ocean life and marine creatures. On the second floor, we have displays about human evolution and ancient civilizations. Photography is permitted in most areas, but please don't use flash as it can damage some of the older specimens. The tour will last approximately ninety minutes, and we'll have a fifteen-minute break at the café on the first floor.",
        "questions": [
            {
                "id": "q5",
                "type": "mcq",
                "question": "Where is the dinosaur exhibition located?",
                "options": ["A) Ground floor", "B) First floor", "C) Second floor", "D) In the café"],
                "correct": "A",
                "skill": "spatial_information",
                "explanation": "The guide states 'On the ground floor, you'll find the dinosaur exhibition.' Pay attention to spatial markers and floor descriptions.",
                "explanation_vi": "Hướng dẫn viên nói 'Ở tầng trệt, bạn sẽ tìm thấy triển lãm khủng long.' Chú ý đến các dấu hiệu không gian và mô tả tầng.",
                "explanation_tr": "Rehber 'Zemin katta dinozor sergisini bulacaksınız' diyor. Mekansal işaretlere ve kat açıklamalarına dikkat edin."
            },
            {
                "id": "q6",
                "type": "mcq",
                "question": "Why should visitors not use flash photography?",
                "options": ["A) It disturbs other visitors", "B) It can damage specimens", "C) It's against the law", "D) The batteries will run out"],
                "correct": "B",
                "skill": "reason_comprehension",
                "explanation": "The guide explicitly says 'please don't use flash as it can damage some of the older specimens.' Listen for cause-effect relationships.",
                "explanation_vi": "Hướng dẫn viên nói rõ 'xin đừng dùng đèn flash vì nó có thể làm hỏng một số mẫu vật cũ.' Lắng nghe các mối quan hệ nhân quả.",
                "explanation_tr": "Rehber açıkça 'lütfen flaş kullanmayın çünkü bazı eski örneklere zarar verebilir' diyor. Neden-sonuç ilişkilerini dinleyin."
            }
        ]
    },
    
    # Section 4: Band 5.5-6.5 - Academic Lecture Extract
    {
        "id": "listening_4",
        "level": "B2",
        "band_range": "5.5-6.5",
        "title": "Climate Change Lecture",
        "voice": "male",
        "script_text": "Today I want to discuss the impact of climate change on global food production. According to recent studies, rising temperatures have already begun to affect crop yields in many parts of the world. In particular, wheat production has decreased by approximately fifteen percent in tropical regions over the past decade. However, interestingly, some northern countries have actually seen an increase in agricultural output due to longer growing seasons. Scientists predict that by twenty fifty, we may need to produce up to sixty percent more food to meet global demand. This presents a significant challenge, as traditional farming methods may no longer be sufficient. One potential solution involves the development of drought-resistant crop varieties through genetic modification.",
        "questions": [
            {
                "id": "q7",
                "type": "mcq",
                "question": "By how much has wheat production decreased in tropical regions?",
                "options": ["A) 5 percent", "B) 10 percent", "C) 15 percent", "D) 20 percent"],
                "correct": "C",
                "skill": "numerical_data",
                "explanation": "The lecturer says 'wheat production has decreased by approximately fifteen percent in tropical regions.' Academic lectures often contain precise numerical data.",
                "explanation_vi": "Giảng viên nói 'sản lượng lúa mì đã giảm khoảng mười lăm phần trăm ở các vùng nhiệt đới.' Bài giảng học thuật thường chứa dữ liệu số chính xác.",
                "explanation_tr": "Öğretim üyesi 'tropikal bölgelerde buğday üretimi yaklaşık yüzde on beş azaldı' diyor. Akademik dersler genellikle kesin sayısal veriler içerir."
            },
            {
                "id": "q8",
                "type": "mcq",
                "question": "What solution does the speaker mention for food production challenges?",
                "options": ["A) Importing more food", "B) Reducing population", "C) Genetic modification", "D) Building more farms"],
                "correct": "C",
                "skill": "main_idea",
                "explanation": "The lecturer mentions 'drought-resistant crop varieties through genetic modification' as a potential solution. Understanding proposed solutions in academic contexts is key.",
                "explanation_vi": "Giảng viên đề cập 'các giống cây trồng chịu hạn thông qua biến đổi gen' như một giải pháp tiềm năng. Hiểu các giải pháp được đề xuất trong bối cảnh học thuật là chìa khóa.",
                "explanation_tr": "Öğretim üyesi potansiyel bir çözüm olarak 'genetik modifikasyon yoluyla kuraklığa dayanıklı mahsul çeşitleri'nden bahsediyor. Akademik bağlamlarda önerilen çözümleri anlamak önemlidir."
            }
        ]
    },
    
    # Section 5: Band 7.0-9.0 - Complex Academic Discussion
    {
        "id": "listening_5",
        "level": "C1-C2",
        "band_range": "7.0-9.0",
        "title": "Artificial Intelligence Ethics",
        "voice": "female",
        "script_text": "The ethical implications of artificial intelligence in decision-making processes have become increasingly pertinent in contemporary discourse. Consider, for instance, the deployment of algorithmic systems in judicial sentencing. While proponents argue that such systems can eliminate human bias and ensure consistency, critics contend that they may perpetuate historical inequalities embedded in the training data. Furthermore, the opacity of many machine learning models raises fundamental questions about accountability. When an algorithm makes a consequential decision that adversely affects an individual, determining responsibility becomes problematic. This phenomenon, often referred to as the 'black box' problem, challenges our traditional frameworks of legal and moral accountability. Some scholars advocate for a principle of algorithmic transparency, requiring that AI systems provide comprehensible explanations for their outputs.",
        "questions": [
            {
                "id": "q9",
                "type": "mcq",
                "question": "What do critics say about algorithmic systems in judicial sentencing?",
                "options": ["A) They are too expensive", "B) They may perpetuate inequalities", "C) They are too slow", "D) They replace human judges entirely"],
                "correct": "B",
                "skill": "inference",
                "explanation": "The speaker states 'critics contend that they may perpetuate historical inequalities embedded in the training data.' This requires understanding contrasting viewpoints in academic discussion.",
                "explanation_vi": "Người nói nói 'các nhà phê bình cho rằng chúng có thể duy trì sự bất bình đẳng lịch sử được nhúng trong dữ liệu huấn luyện.' Điều này đòi hỏi hiểu các quan điểm trái chiều trong thảo luận học thuật.",
                "explanation_tr": "Konuşmacı 'eleştirmenler eğitim verilerine gömülü tarihi eşitsizlikleri sürdürebileceklerini iddia ediyor' diyor. Bu, akademik tartışmada zıt görüşleri anlamayı gerektirir."
            },
            {
                "id": "q10",
                "type": "mcq",
                "question": "What is the 'black box' problem?",
                "options": ["A) AI systems are too large", "B) AI is too expensive", "C) AI decisions lack transparency", "D) AI cannot be transported"],
                "correct": "C",
                "skill": "concept_understanding",
                "explanation": "The 'black box' problem refers to 'the opacity of many machine learning models' - AI systems that don't provide clear explanations for their decisions. Understanding technical concepts in context is essential at higher levels.",
                "explanation_vi": "Vấn đề 'hộp đen' đề cập đến 'tính không rõ ràng của nhiều mô hình học máy' - các hệ thống AI không cung cấp giải thích rõ ràng cho các quyết định của chúng. Hiểu các khái niệm kỹ thuật trong ngữ cảnh là cần thiết ở cấp độ cao hơn.",
                "explanation_tr": "'Kara kutu' problemi 'birçok makine öğrenimi modelinin opak olması'na atıfta bulunur - kararları için net açıklamalar sunmayan AI sistemleri. Bağlamda teknik kavramları anlamak, daha yüksek seviyelerde önemlidir."
            }
        ]
    }
]

def get_all_listening_questions():
    """Get all listening questions flattened into a list"""
    all_questions = []
    for section in LISTENING_SECTIONS:
        for q in section["questions"]:
            all_questions.append({
                **q,
                "section_id": section["id"],
                "level": section["level"],
                "band_range": section["band_range"]
            })
    return all_questions

def get_listening_sections():
    """Get all listening sections with metadata"""
    return LISTENING_SECTIONS


def get_question_band_value(section):
    """Return the average band weight for a listening question in a section."""
    band_range = section["band_range"]
    low, high = band_range.split("-")
    return (float(low) + float(high)) / 2


def calculate_listening_band(correct_question_count, total_question_count, earned_band_points):
    """
    Convert progressive listening-question difficulty into an IELTS-style band.

    The previous implementation divided earned difficulty points by total
    question count, then added a coarse percentage bonus. That capped a perfect
    10/10 at Band 6.0 because the section averages summed to 52.0 across 10
    questions. Here we normalize earned difficulty against the maximum
    available difficulty and map the result directly to the 2.0-9.0 range.
    """
    if total_question_count <= 0:
        return 2.0

    max_points = 0.0
    for section in LISTENING_SECTIONS:
        question_weight = get_question_band_value(section)
        max_points += question_weight * len(section["questions"])

    if max_points <= 0:
        return 2.0

    if correct_question_count <= 0:
        return 2.0

    normalized = earned_band_points / max_points
    band = 2.0 + (normalized * 7.0)
    return round(band * 2) / 2
