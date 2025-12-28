"""
IELTS Writing Task 2 - Authentic Essay Generator & Model Answers
================================================================
Generates IELTS-authentic essay prompts with multi-band model answers.

ULTRA MASTER PROMPT RULES:
- Every prompt must be academically relevant
- Model answers at Band 6 and Band 8.5 levels
- Academic reasoning notes for learning
- Template-free, natural academic writing
"""

import random
from typing import Dict, List, Any, Optional
from datetime import datetime


class WritingTask2Generator:
    """
    Generates IELTS Writing Task 2 essay prompts with model answers.
    
    Essay Types:
    1. Opinion (Agree/Disagree)
    2. Discussion (Discuss both views)
    3. Advantage/Disadvantage
    4. Problem/Solution
    5. Two-part question
    """
    
    # ============ AUTHENTIC ESSAY PROMPTS ============
    ESSAY_PROMPTS = {
        "opinion": [
            {
                "prompt": "Some people believe that universities should focus on providing academic skills rather than preparing students for employment. To what extent do you agree or disagree?",
                "topic": "education",
                "key_points": [
                    "Purpose of university education",
                    "Academic knowledge vs practical skills",
                    "Employability and career preparation",
                    "Balance between theory and practice"
                ],
                "useful_vocabulary": [
                    "theoretical knowledge", "practical skills", "employability",
                    "curriculum", "workforce", "job market", "academic rigour"
                ]
            },
            {
                "prompt": "In many countries, the proportion of older people is steadily increasing. Some argue that this is a positive development, while others think it creates problems for society. Discuss and give your opinion.",
                "topic": "society",
                "key_points": [
                    "Benefits of an ageing population",
                    "Challenges for healthcare and pensions",
                    "Experience and wisdom of older generations",
                    "Economic implications"
                ],
                "useful_vocabulary": [
                    "demographic shift", "pension system", "healthcare burden",
                    "life expectancy", "retirement age", "intergenerational"
                ]
            },
            {
                "prompt": "Some people think that the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative ways of reducing crime. Discuss both views and give your opinion.",
                "topic": "crime",
                "key_points": [
                    "Effectiveness of longer sentences",
                    "Alternative approaches to crime reduction",
                    "Rehabilitation vs punishment",
                    "Prevention through education and social programs"
                ],
                "useful_vocabulary": [
                    "deterrent", "rehabilitation", "recidivism", "incarceration",
                    "community service", "preventive measures", "criminal justice"
                ]
            },
            {
                "prompt": "Many people believe that social networking sites have had a huge negative impact on both individuals and society. To what extent do you agree or disagree?",
                "topic": "technology",
                "key_points": [
                    "Impact on personal relationships",
                    "Effects on mental health",
                    "Information sharing and awareness",
                    "Privacy concerns"
                ],
                "useful_vocabulary": [
                    "social media", "online connectivity", "digital footprint",
                    "cyberbullying", "misinformation", "virtual community"
                ]
            }
        ],
        "discussion": [
            {
                "prompt": "Some people think that children should begin their formal education at a very early age, while others think they should not start until they are older. Discuss both views and give your own opinion.",
                "topic": "education",
                "key_points": [
                    "Benefits of early formal education",
                    "Importance of play-based learning",
                    "Developmental readiness",
                    "Long-term academic outcomes"
                ],
                "useful_vocabulary": [
                    "cognitive development", "play-based learning", "formal instruction",
                    "developmental milestones", "early childhood", "academic foundation"
                ]
            },
            {
                "prompt": "Some people believe that governments should invest more in public transportation. Others think the focus should be on building more roads. Discuss both views and give your opinion.",
                "topic": "transport",
                "key_points": [
                    "Environmental benefits of public transport",
                    "Economic considerations",
                    "Urban planning and congestion",
                    "Individual freedom vs collective benefit"
                ],
                "useful_vocabulary": [
                    "infrastructure", "congestion", "sustainable transport",
                    "carbon emissions", "urban mobility", "commuters"
                ]
            }
        ],
        "advantage_disadvantage": [
            {
                "prompt": "In some countries, young people are encouraged to work or travel for a year between finishing high school and starting university. Discuss the advantages and disadvantages of this approach.",
                "topic": "education",
                "key_points": [
                    "Personal growth and maturity",
                    "Work experience benefits",
                    "Potential delay in career progression",
                    "Financial considerations"
                ],
                "useful_vocabulary": [
                    "gap year", "self-discovery", "work experience",
                    "personal development", "career prospects", "life skills"
                ]
            },
            {
                "prompt": "Many people now prefer to shop online rather than in traditional stores. What are the advantages and disadvantages of this trend?",
                "topic": "lifestyle",
                "key_points": [
                    "Convenience and accessibility",
                    "Impact on local businesses",
                    "Consumer protection issues",
                    "Environmental considerations"
                ],
                "useful_vocabulary": [
                    "e-commerce", "brick-and-mortar stores", "consumer behaviour",
                    "delivery logistics", "retail sector", "digital marketplace"
                ]
            }
        ],
        "problem_solution": [
            {
                "prompt": "In many cities, traffic congestion is becoming an increasingly serious problem. What are the causes of this problem and what measures could be taken to reduce it?",
                "topic": "urban",
                "key_points": [
                    "Population growth and urbanization",
                    "Inadequate public transport",
                    "Urban planning solutions",
                    "Technology-based solutions"
                ],
                "useful_vocabulary": [
                    "urbanisation", "rush hour", "congestion charges",
                    "carpooling", "infrastructure development", "sustainable mobility"
                ]
            },
            {
                "prompt": "Obesity among children is becoming a major health crisis in many countries. What are the causes of this problem and what solutions can you suggest?",
                "topic": "health",
                "key_points": [
                    "Dietary factors and fast food",
                    "Sedentary lifestyle and screen time",
                    "Role of schools and parents",
                    "Government policies and regulations"
                ],
                "useful_vocabulary": [
                    "sedentary lifestyle", "processed food", "nutritional education",
                    "physical activity", "public health", "dietary habits"
                ]
            }
        ],
        "two_part": [
            {
                "prompt": "Many young people today are leaving rural areas to live in cities. Why is this happening? Do you think this is a positive or negative development?",
                "topic": "urbanization",
                "key_points": [
                    "Economic opportunities in cities",
                    "Educational and career prospects",
                    "Impact on rural communities",
                    "Quality of life considerations"
                ],
                "useful_vocabulary": [
                    "rural-urban migration", "economic opportunities",
                    "brain drain", "agricultural sector", "urban lifestyle"
                ]
            }
        ]
    }
    
    # ============ MODEL ANSWERS BY BAND ============
    MODEL_ANSWERS = {
        "opinion_education_band6": {
            "band": 6.0,
            "text": """There is a debate about whether universities should teach academic subjects or prepare students for jobs. I partially agree that universities should focus on both.

On the one hand, universities are traditional places for learning knowledge. Students go there to learn subjects like science, history and literature. These subjects help people understand the world better. Also, academic research is very important for society. Without research, we would not have new discoveries.

On the other hand, students need to find jobs after graduation. Many students pay a lot of money for university. They expect to get good jobs after they finish. If universities only teach theory, students may not have the skills that employers want.

In my opinion, the best solution is to combine both approaches. Universities can teach academic subjects but also include some practical training. For example, engineering students can do internships in companies. This way, they learn both theory and practice.

In conclusion, I believe universities should not focus only on academic skills. They should also help students prepare for their future careers. This will benefit both students and society.""",
            "word_count": 183,
            "characteristics": [
                "Addresses the task but development is sometimes limited",
                "Clear position but supporting ideas need more development",
                "Basic vocabulary used appropriately",
                "Mix of simple and complex sentences",
                "Some errors that do not impede communication"
            ]
        },
        "opinion_education_band85": {
            "band": 8.5,
            "text": """The question of whether universities should prioritise academic rigour over vocational preparation has generated considerable debate in educational circles. While I acknowledge the intrinsic value of pure academic knowledge, I would argue that modern universities must strike a careful balance between theoretical foundations and practical employability.

The traditional view that universities exist primarily to cultivate intellectual inquiry has much merit. Academic disciplines such as philosophy, mathematics, and the liberal arts develop critical thinking capacities that transcend specific career applications. Furthermore, fundamental research conducted in university settings has historically driven innovation and societal progress. The discovery of penicillin and the development of the internet, for instance, emerged from academic environments where practical applications were not the immediate concern.

However, the contemporary reality is that higher education has become a significant financial investment for most students. With rising tuition costs and competitive job markets, there is a legitimate expectation that university education should enhance graduates' employment prospects. Moreover, the rapid pace of technological change means that graduates require not only theoretical knowledge but also adaptable skills and practical competencies.

The optimal approach, in my view, involves integrating academic depth with practical relevance. Universities can maintain rigorous academic standards while incorporating experiential learning opportunities, industry partnerships, and career development programmes. This synthesis would produce graduates who possess both the intellectual foundations for lifelong learning and the practical capabilities for immediate professional contribution.

In conclusion, rather than viewing academic and vocational purposes as mutually exclusive, universities should embrace their complementary nature. Such an approach would serve both individual aspirations and broader societal needs effectively.""",
            "word_count": 258,
            "characteristics": [
                "Fully addresses all parts of the task with a well-developed response",
                "Clear position throughout with sophisticated argumentation",
                "Wide range of vocabulary used precisely and naturally",
                "Wide range of structures with full flexibility",
                "Very rare minor errors"
            ]
        },
        "discussion_education_band6": {
            "band": 6.0,
            "text": """Some people think children should start school early, while others believe they should wait until they are older. In this essay, I will discuss both views and give my opinion.

Those who support early education say it helps children learn important skills. Young children can learn languages and numbers easily. Starting school early also helps children become social. They learn to make friends and follow rules. Additionally, early education can help children from poor families.

However, others believe that young children should play more. Play is very important for child development. When children play, they learn creativity and problem-solving. Also, some children are not ready for formal learning at a young age. They may become stressed and lose interest in education.

In my opinion, I think a balance is best. Children can start with play-based learning at age 3 or 4. This means they learn through games and activities. Then, they can start more formal education at age 6 or 7. This way, they get the benefits of both approaches.

To conclude, while both views have valid points, I believe children should have time to play before starting formal education. Play-based learning in early years can prepare them for school later.""",
            "word_count": 204,
            "characteristics": [
                "Addresses both views but with uneven development",
                "Position is clear but conclusion could be stronger",
                "Adequate vocabulary for the task",
                "Mix of sentence structures",
                "Some grammatical errors present"
            ]
        },
        "discussion_education_band85": {
            "band": 8.5,
            "text": """The appropriate age for children to commence formal education remains a contentious issue among educators, parents, and policymakers. This essay will examine the arguments for both early and delayed school entry before presenting my own perspective.

Proponents of early formal education point to the remarkable cognitive plasticity of young children. Research in developmental psychology suggests that children's brains are particularly receptive to structured learning during their early years, particularly in areas such as language acquisition and numeracy. Furthermore, early schooling can provide crucial socialisation experiences and help establish educational foundations that benefit children throughout their academic careers. This is especially significant for children from disadvantaged backgrounds, who may have limited access to educational stimulation at home.

Conversely, advocates for delayed formal schooling emphasise the fundamental importance of play-based learning in early childhood. According to this view, premature exposure to formal instruction may undermine children's natural curiosity and creativity. Nordic countries such as Finland, which delay formal education until age seven, consistently achieve excellent educational outcomes, suggesting that later school entry does not necessarily disadvantage children academically. Additionally, children who begin formal schooling prematurely may experience stress and academic pressure that could negatively affect their long-term relationship with learning.

Having considered both perspectives, I believe that the optimal approach depends largely on individual children's developmental readiness and the nature of the educational programme offered. Rather than adhering rigidly to either early or late school entry, educational systems should adopt flexible, child-centred approaches that incorporate play-based learning methods while gradually introducing more structured activities as children demonstrate readiness.

In conclusion, while both early and late school entry have their merits, I would advocate for developmentally appropriate education that prioritises children's individual needs over arbitrary age-based requirements.""",
            "word_count": 285,
            "characteristics": [
                "Thoroughly addresses both views with well-developed arguments",
                "Sophisticated position with nuanced conclusion",
                "Precise and natural use of a wide vocabulary range",
                "Flexible use of complex structures",
                "Minimal errors"
            ]
        }
    }
    
    # ============ GENERAL TRAINING TASK 1 - LETTER WRITING ============
    LETTER_PROMPTS = {
        "formal": [
            # COMPLAINT LETTERS
            {
                "prompt": "You recently bought a piece of electronic equipment from an online store. However, when you received it, you found that it was faulty.\n\nWrite a letter to the manager of the store. In your letter:\n- describe the item you bought\n- explain the problem with the item\n- say what action you would like the store to take",
                "topic": "complaint",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Describe the purchase (what, when, order number)",
                    "Explain the specific fault or problem",
                    "State your expectation (refund, replacement, repair)"
                ]
            },
            {
                "prompt": "You are unhappy with the service you received at a local restaurant.\n\nWrite a letter to the restaurant manager. In your letter:\n- say when you visited the restaurant\n- describe the problems you experienced\n- say what you think the manager should do",
                "topic": "complaint",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Provide date and time of visit",
                    "Detail the specific issues",
                    "Request appropriate action"
                ]
            },
            {
                "prompt": "You recently travelled by train and left a bag on the train. You need to get your bag back.\n\nWrite a letter to the railway company. In your letter:\n- describe the journey you made\n- explain what the bag looks like and what it contains\n- say what you would like the company to do",
                "topic": "lost_property",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Provide train details (date, time, route)",
                    "Describe bag appearance and contents",
                    "Request return procedure"
                ]
            },
            {
                "prompt": "You recently stayed at a hotel and were not satisfied with the quality of the room.\n\nWrite a letter to the hotel manager. In your letter:\n- give details of your stay\n- explain why you were dissatisfied with the room\n- suggest what the hotel should do to compensate you",
                "topic": "complaint",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Provide booking details",
                    "List specific complaints about the room",
                    "Request compensation (refund, discount, voucher)"
                ]
            },
            {
                "prompt": "You ordered some goods online but they have not arrived on time.\n\nWrite a letter to the company. In your letter:\n- describe what you ordered and when\n- explain the problem with the delivery\n- say what you expect the company to do",
                "topic": "complaint",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Order details and date",
                    "Expected vs actual delivery",
                    "Request resolution"
                ]
            },
            # JOB APPLICATION LETTERS
            {
                "prompt": "You want to apply for a job at a local company.\n\nWrite a letter to the Human Resources Manager. In your letter:\n- say which position you are applying for\n- explain why you are suitable for the job\n- ask for information about the interview process",
                "topic": "job_application",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Specify the position",
                    "Highlight relevant qualifications and experience",
                    "Request interview details"
                ]
            },
            {
                "prompt": "You have seen an advertisement for a part-time job at a local museum. You are interested in applying.\n\nWrite a letter to the museum director. In your letter:\n- give some information about yourself\n- explain why you would be suitable for the job\n- say when you could start work",
                "topic": "job_application",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Personal background and education",
                    "Relevant skills and interest in museums",
                    "Availability"
                ]
            },
            # REQUEST LETTERS
            {
                "prompt": "You are planning to visit a city you have never been to before. You need some information about the place.\n\nWrite a letter to the tourist information office. In your letter:\n- say when you plan to visit and for how long\n- ask about places you can visit\n- ask about accommodation options",
                "topic": "information_request",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Travel dates and duration",
                    "Attractions of interest",
                    "Budget and accommodation preferences"
                ]
            },
            {
                "prompt": "You want to join a local gym and would like some information about membership.\n\nWrite a letter to the gym manager. In your letter:\n- explain why you want to join\n- ask about facilities and classes available\n- enquire about membership fees and opening hours",
                "topic": "information_request",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Reason for wanting to join",
                    "Specific facilities of interest",
                    "Practical details (cost, hours)"
                ]
            },
            {
                "prompt": "You would like to attend a short training course at a college in an English-speaking country.\n\nWrite a letter to the college principal. In your letter:\n- give some information about yourself\n- explain which course you are interested in\n- ask about fees and accommodation",
                "topic": "course_enquiry",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Educational background",
                    "Course name and reason for interest",
                    "Financial and practical questions"
                ]
            },
            # SUGGESTION LETTERS
            {
                "prompt": "You live in a town where there is a problem with traffic congestion.\n\nWrite a letter to the local council. In your letter:\n- describe the traffic problem in your area\n- explain how this affects your daily life\n- suggest some solutions to the problem",
                "topic": "suggestion",
                "letter_type": "formal",
                "addressee": "Dear Sir or Madam,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Specific traffic issues",
                    "Personal impact",
                    "Constructive solutions"
                ]
            },
            {
                "prompt": "Your local library is considering closing due to lack of funding.\n\nWrite a letter to the local newspaper. In your letter:\n- explain why the library is important to you\n- describe how the closure would affect the community\n- suggest ways to keep the library open",
                "topic": "suggestion",
                "letter_type": "formal",
                "addressee": "Dear Editor,",
                "closing": "Yours faithfully,",
                "key_points": [
                    "Personal value of library",
                    "Community impact",
                    "Alternative funding ideas"
                ]
            }
        ],
        "semi_formal": [
            # NEIGHBOUR/LANDLORD LETTERS
            {
                "prompt": "Your neighbour has been making a lot of noise recently, which has been disturbing you.\n\nWrite a letter to your neighbour. In your letter:\n- explain how the noise has affected you\n- suggest some ways to resolve the problem\n- warn of possible consequences if the situation continues",
                "topic": "neighbour_issue",
                "letter_type": "semi-formal",
                "addressee": "Dear Mr/Mrs [Name],",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Describe the noise and when it occurs",
                    "Explain the impact on your life",
                    "Propose reasonable solutions"
                ]
            },
            {
                "prompt": "You rent an apartment from a private landlord. There is a problem with the heating system that needs fixing.\n\nWrite a letter to your landlord. In your letter:\n- describe the problem with the heating\n- explain how this is affecting you\n- say what you would like the landlord to do",
                "topic": "landlord_issue",
                "letter_type": "semi-formal",
                "addressee": "Dear Mr/Mrs [Name],",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Details of heating problem",
                    "Impact on daily life",
                    "Request for repair"
                ]
            },
            {
                "prompt": "You live in rented accommodation. There has been a water leak in your kitchen and some of your possessions have been damaged.\n\nWrite a letter to your landlord. In your letter:\n- explain what has happened\n- describe the damage to your possessions\n- ask for compensation",
                "topic": "landlord_issue",
                "letter_type": "semi-formal",
                "addressee": "Dear Mr/Mrs [Name],",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Details of the leak",
                    "List of damaged items",
                    "Compensation request"
                ]
            },
            # CLUB/ORGANIZATION LETTERS
            {
                "prompt": "You have been a member of a local sports club for several years. The club has recently announced significant changes that you disagree with.\n\nWrite a letter to the club committee. In your letter:\n- explain which changes you are concerned about\n- describe why you disagree with them\n- suggest alternative solutions",
                "topic": "complaint",
                "letter_type": "semi-formal",
                "addressee": "Dear Committee Members,",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Identify specific changes",
                    "Give reasons for disagreement",
                    "Offer constructive alternatives"
                ]
            },
            {
                "prompt": "You are a member of a book club. The club is looking for new members and you have been asked to help.\n\nWrite a letter to a local newspaper. In your letter:\n- describe what kind of club it is\n- explain what activities the club offers\n- say how interested people can join",
                "topic": "promotion",
                "letter_type": "semi-formal",
                "addressee": "Dear Editor,",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Club description",
                    "Activities and benefits",
                    "Joining information"
                ]
            },
            {
                "prompt": "You work for an international company. Your manager has asked you to organize a team-building event.\n\nWrite a letter to your colleagues. In your letter:\n- explain what the event is and why it is being organized\n- give details of the activities planned\n- ask colleagues to confirm their attendance",
                "topic": "work_event",
                "letter_type": "semi-formal",
                "addressee": "Dear Colleagues,",
                "closing": "Best regards,",
                "key_points": [
                    "Event purpose",
                    "Activity details (date, time, location)",
                    "RSVP request"
                ]
            },
            # TEACHER/SCHOOL LETTERS
            {
                "prompt": "Your child has been given a lot of homework recently and you are concerned about the amount.\n\nWrite a letter to your child's teacher. In your letter:\n- describe the situation\n- explain why you are worried\n- suggest a possible solution",
                "topic": "education",
                "letter_type": "semi-formal",
                "addressee": "Dear Mr/Mrs [Teacher],",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Amount of homework",
                    "Impact on child",
                    "Suggested solution"
                ]
            },
            {
                "prompt": "Your child is doing a school project and needs to interview someone about their job.\n\nWrite a letter to a family friend who you think would be suitable. In your letter:\n- explain what the project is about\n- say why you think they would be good to interview\n- suggest a time and place for the interview",
                "topic": "request",
                "letter_type": "semi-formal",
                "addressee": "Dear [Name],",
                "closing": "Yours sincerely,",
                "key_points": [
                    "Project description",
                    "Why they are suitable",
                    "Practical arrangements"
                ]
            }
        ],
        "informal": [
            # INVITATION LETTERS
            {
                "prompt": "A friend from another country is coming to visit you. You want to tell them about your plans for their stay.\n\nWrite a letter to your friend. In your letter:\n- say how you feel about their visit\n- describe what you plan to do during their stay\n- ask what they would like to do",
                "topic": "invitation",
                "letter_type": "informal",
                "addressee": "Dear [Friend's name],",
                "closing": "Best wishes, / Take care,",
                "key_points": [
                    "Express excitement about the visit",
                    "Suggest activities and places to visit",
                    "Ask about their preferences"
                ]
            },
            {
                "prompt": "You are organizing a surprise birthday party for a close friend.\n\nWrite a letter to another friend inviting them to the party. In your letter:\n- explain who the party is for and why it is a surprise\n- give details of the party (when, where, etc.)\n- ask them to bring something specific",
                "topic": "invitation",
                "letter_type": "informal",
                "addressee": "Hi [Name],",
                "closing": "See you there! / Can't wait!",
                "key_points": [
                    "Party details (surprise element)",
                    "Date, time, location",
                    "What to bring"
                ]
            },
            {
                "prompt": "You are getting married soon and want to invite an old friend who lives far away.\n\nWrite a letter to your friend. In your letter:\n- share your news about the wedding\n- give details of the wedding celebration\n- offer to help with their travel arrangements",
                "topic": "invitation",
                "letter_type": "informal",
                "addressee": "Dearest [Name],",
                "closing": "With love, / Looking forward to seeing you,",
                "key_points": [
                    "Share the exciting news",
                    "Wedding details",
                    "Travel assistance offer"
                ]
            },
            # THANK YOU LETTERS
            {
                "prompt": "You recently had a birthday party and a friend gave you a very special gift.\n\nWrite a letter to your friend. In your letter:\n- thank them for the gift\n- explain why you like it so much\n- invite them to meet you soon",
                "topic": "thank_you",
                "letter_type": "informal",
                "addressee": "Dear [Friend's name],",
                "closing": "Lots of love, / See you soon,",
                "key_points": [
                    "Express gratitude",
                    "Describe how you will use/display the gift",
                    "Suggest a meeting"
                ]
            },
            {
                "prompt": "You recently stayed at a friend's house while visiting their city.\n\nWrite a letter to your friend. In your letter:\n- thank them for their hospitality\n- mention some things you particularly enjoyed\n- invite them to visit you in return",
                "topic": "thank_you",
                "letter_type": "informal",
                "addressee": "Dear [Name],",
                "closing": "Take care, / Miss you already,",
                "key_points": [
                    "Thank for hospitality",
                    "Highlight memorable moments",
                    "Return invitation"
                ]
            },
            # NEWS/UPDATE LETTERS
            {
                "prompt": "You have recently moved to a new city and want to tell your friend about your new life.\n\nWrite a letter to your friend. In your letter:\n- describe your new home\n- tell them about your new job or studies\n- invite them to visit you",
                "topic": "personal_update",
                "letter_type": "informal",
                "addressee": "Hi [Friend's name],",
                "closing": "Write back soon, / Miss you,",
                "key_points": [
                    "Describe the new location and home",
                    "Share news about work/studies",
                    "Extend an invitation"
                ]
            },
            {
                "prompt": "You have recently started a new hobby and want to tell a friend about it.\n\nWrite a letter to your friend. In your letter:\n- describe what your new hobby is\n- explain how you got started with this hobby\n- suggest doing this activity together",
                "topic": "personal_update",
                "letter_type": "informal",
                "addressee": "Hey [Name],",
                "closing": "Talk soon, / Can't wait to hear from you,",
                "key_points": [
                    "Describe the hobby",
                    "How you started",
                    "Invitation to join"
                ]
            },
            {
                "prompt": "You have just passed an important exam or achieved something significant.\n\nWrite a letter to a friend telling them about it. In your letter:\n- explain what you achieved\n- describe how you prepared for it\n- say what you plan to do next",
                "topic": "personal_update",
                "letter_type": "informal",
                "addressee": "Dear [Name],",
                "closing": "Speak soon, / Your excited friend,",
                "key_points": [
                    "Share the achievement",
                    "Preparation journey",
                    "Future plans"
                ]
            },
            # ADVICE LETTERS
            {
                "prompt": "A friend has asked you for advice about learning English.\n\nWrite a letter to your friend. In your letter:\n- give some advice about how to learn English effectively\n- recommend some useful resources\n- offer to help them practice",
                "topic": "advice",
                "letter_type": "informal",
                "addressee": "Dear [Name],",
                "closing": "Good luck! / I'm here if you need me,",
                "key_points": [
                    "Learning tips",
                    "Resource recommendations",
                    "Offer of help"
                ]
            },
            {
                "prompt": "A friend is planning to visit your country for the first time and has asked for your advice.\n\nWrite a letter to your friend. In your letter:\n- suggest the best time to visit\n- recommend places they should see\n- give advice about what to bring",
                "topic": "advice",
                "letter_type": "informal",
                "addressee": "Hi [Name],",
                "closing": "Safe travels! / Can't wait to see you,",
                "key_points": [
                    "Best season/time",
                    "Must-see attractions",
                    "Packing advice"
                ]
            },
            # APOLOGY LETTERS
            {
                "prompt": "You borrowed something from a friend and accidentally broke it.\n\nWrite a letter to your friend. In your letter:\n- apologize for what happened\n- explain how it happened\n- offer to replace or repair the item",
                "topic": "apology",
                "letter_type": "informal",
                "addressee": "Dear [Name],",
                "closing": "I'm so sorry, / Hope you can forgive me,",
                "key_points": [
                    "Sincere apology",
                    "Explanation",
                    "Offer to make amends"
                ]
            },
            {
                "prompt": "You promised to attend a friend's important event but were unable to go.\n\nWrite a letter to your friend. In your letter:\n- apologize for not attending\n- explain why you couldn't be there\n- suggest meeting up soon to make up for it",
                "topic": "apology",
                "letter_type": "informal",
                "addressee": "Dear [Name],",
                "closing": "I'm really sorry, / Please forgive me,",
                "key_points": [
                    "Apology for absence",
                    "Reason (valid excuse)",
                    "Make-up plan"
                ]
            }
        ]
    }
    
    LETTER_MODEL_ANSWERS = {
        "formal_complaint_band6": {
            "band": 6.0,
            "text": """Dear Sir or Madam,

I am writing to complain about a laptop computer that I bought from your online store on 15th November. The order number is #12345.

When I received the laptop, I was very disappointed because it does not work properly. The screen has a problem – there are some dark spots that do not show any picture. Also, the computer is very slow and sometimes turns off by itself. I have tried to restart it many times, but the problem continues.

I would like you to take action about this problem. I think I should receive a full refund because the product is not usable. Alternatively, you could send me a new laptop that works correctly.

I hope you can solve this problem quickly. Please contact me at my email address: customer@email.com.

I look forward to hearing from you soon.

Yours faithfully,
[Your name]""",
            "word_count": 152,
            "characteristics": [
                "Covers all bullet points",
                "Appropriate formal tone",
                "Clear purpose and request",
                "Some range in vocabulary",
                "Minor errors that don't impede meaning"
            ]
        },
        "formal_complaint_band85": {
            "band": 8.5,
            "text": """Dear Sir or Madam,

I am writing to express my dissatisfaction with a laptop computer purchased from your online store on 15th November, order reference #12345. Despite having waited eagerly for its delivery, I was profoundly disappointed upon discovering that the device is fundamentally defective.

Upon unboxing the laptop, I immediately noticed several significant issues. Most conspicuously, the display screen exhibits multiple dead pixels, resulting in permanent dark spots that render portions of the screen unusable. Furthermore, the device experiences persistent performance issues, including unexplained system crashes and processing speeds far below the advertised specifications. Despite following all troubleshooting procedures outlined in the user manual, these problems have persisted.

Given the severity of these defects, I believe I am entitled to a full refund in accordance with your returns policy and consumer protection regulations. Should you prefer to offer a replacement unit, I would require assurance that the replacement has been thoroughly tested prior to dispatch.

I trust you will treat this matter with the urgency it deserves and respond within seven working days. I can be reached at customer@email.com or on 07123 456789.

I look forward to your prompt response and a satisfactory resolution to this matter.

Yours faithfully,
[Your name]""",
            "word_count": 208,
            "characteristics": [
                "Comprehensive coverage of all points",
                "Sophisticated formal register throughout",
                "Clear logical organisation",
                "Wide range of vocabulary and structures",
                "Virtually error-free"
            ]
        },
        "informal_invitation_band6": {
            "band": 6.0,
            "text": """Dear Maria,

I hope you are well! I am so happy to hear that you are coming to visit me next month. I have been looking forward to this for a long time!

I have lots of plans for when you come. First, I want to show you around my city. There are many beautiful places to see, like the old town and the big park near my house. We can also go shopping because there is a nice mall nearby. In the evening, I thought we could go to some good restaurants. The food here is really delicious!

Also, I want to take you to the beach one day. It is about one hour by car, but it is very beautiful. We can swim and relax on the sand.

What do you think? Is there anything special you would like to do? Let me know your ideas and I will try to arrange everything.

I cannot wait to see you!

Take care,
Sarah""",
            "word_count": 164,
            "characteristics": [
                "Addresses all bullet points",
                "Appropriate informal tone",
                "Shows enthusiasm and warmth",
                "Adequate vocabulary range",
                "Some minor errors"
            ]
        },
        "informal_invitation_band85": {
            "band": 8.5,
            "text": """Dear Maria,

I hope this letter finds you in great spirits! I was absolutely thrilled to receive your message confirming your visit next month – I've been counting down the days ever since!

I've been racking my brains to come up with the perfect itinerary for your stay. First and foremost, I'm dying to show you around the city that I've grown to love. The historic old town is genuinely breathtaking, with its cobblestone streets and centuries-old architecture. There's also a stunning botanical garden that I think you'd adore, especially given your passion for photography. For our evening entertainment, I've discovered some fantastic restaurants serving everything from traditional local cuisine to international fusion dishes.

Weather permitting, I thought we might venture to the coast one day. There's a charming seaside village about an hour's drive away with pristine beaches and the freshest seafood you've ever tasted!

That said, this is your holiday, so I'm completely open to suggestions. Is there anything in particular you've been wanting to experience? Perhaps some local cultural events or specific attractions you've read about?

I simply cannot wait to catch up with you in person – we have so much to talk about!

Lots of love,
Sarah

P.S. Don't forget to bring comfortable walking shoes – we're going to explore every corner of this place!""",
            "word_count": 228,
            "characteristics": [
                "Fully covers all bullet points with elaboration",
                "Natural, warm informal style",
                "Sophisticated vocabulary used naturally",
                "Excellent range of structures",
                "Virtually error-free with appropriate idioms"
            ]
        }
    }
    
    @classmethod
    def get_essay_prompts(cls, essay_type: str = None, band_level: str = None) -> List[Dict]:
        """Get essay prompts, optionally filtered by type."""
        prompts = []
        prompt_id = 1
        
        types_to_include = [essay_type] if essay_type and essay_type != 'all' else cls.ESSAY_PROMPTS.keys()
        
        for etype in types_to_include:
            if etype in cls.ESSAY_PROMPTS:
                for prompt in cls.ESSAY_PROMPTS[etype]:
                    prompts.append({
                        "id": prompt_id,
                        "type": etype,
                        "prompt": prompt["prompt"],
                        "topic": prompt["topic"],
                        "key_points": prompt.get("key_points", []),
                        "useful_vocabulary": prompt.get("useful_vocabulary", []),
                        "band_level": band_level or "5.5-6.5"
                    })
                    prompt_id += 1
        
        return prompts
    
    @classmethod
    def get_letter_prompts(cls, letter_type: str = None) -> List[Dict]:
        """Get letter prompts for General Training Task 1."""
        prompts = []
        prompt_id = 1
        
        types_to_include = [letter_type] if letter_type and letter_type != 'all' else cls.LETTER_PROMPTS.keys()
        
        for ltype in types_to_include:
            if ltype in cls.LETTER_PROMPTS:
                for prompt in cls.LETTER_PROMPTS[ltype]:
                    prompts.append({
                        "id": prompt_id,
                        "type": ltype,
                        "prompt": prompt["prompt"],
                        "topic": prompt["topic"],
                        "letter_type": prompt["letter_type"],
                        "addressee": prompt["addressee"],
                        "closing": prompt["closing"],
                        "key_points": prompt.get("key_points", [])
                    })
                    prompt_id += 1
        
        return prompts
    
    @classmethod
    def get_model_answer(cls, prompt_type: str, topic: str, band_level: float) -> Dict:
        """Get model answer for a specific prompt type and band level."""
        band_key = "band6" if band_level < 7.0 else "band85"
        key = f"{prompt_type}_{topic}_{band_key}"
        
        if key in cls.MODEL_ANSWERS:
            return cls.MODEL_ANSWERS[key]
        
        # Try to find a generic match
        for model_key, model in cls.MODEL_ANSWERS.items():
            if prompt_type in model_key and band_key in model_key:
                return model
        
        return None
    
    @classmethod
    def get_letter_model_answer(cls, letter_type: str, topic: str, band_level: float) -> Dict:
        """Get model answer for a letter prompt."""
        band_key = "band6" if band_level < 7.0 else "band85"
        key = f"{letter_type}_{topic}_{band_key}"
        
        if key in cls.LETTER_MODEL_ANSWERS:
            return cls.LETTER_MODEL_ANSWERS[key]
        
        # Try to find a generic match
        for model_key, model in cls.LETTER_MODEL_ANSWERS.items():
            if letter_type in model_key and band_key in model_key:
                return model
        
        return None


# Create singleton instance
writing_task2_generator = WritingTask2Generator()
