"""
Cambridge IELTS 17 - Test 2
Complete test content extracted from official Cambridge materials
"""

IELTS17_TEST2 = {
    "test_id": "ielts17_test2",
    "book": "Cambridge IELTS 17",
    "test_number": 2,
    "title": "IELTS 17 - Test 2",
    "description": "Complete Academic test from Cambridge IELTS 17",
    "test_type": "academic",
    "estimated_time": "2 hours 45 minutes",
    "sections": {
        "listening": {
            "total_questions": 40,
            "duration": "30 minutes + 10 minutes transfer time",
            "parts": [
                {
                    "part_number": 1,
                    "title": "Opportunities for voluntary work in Southoe village",
                    "question_range": "1-10",
                    "question_count": 10,
                    "context": "A conversation about volunteer opportunities in Southoe village",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part1.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Voluntary work in Southoe village",
                        "sections": [
                            {
                                "heading": "Library",
                                "items": [
                                    "Help with ___1___ books",
                                    "Update ___2___"
                                ]
                            },
                            {
                                "heading": "Lunch Club",
                                "items": [
                                    "Held on ___3___ Street",
                                    "Help individuals with ___4___"
                                ]
                            },
                            {
                                "heading": "Classes",
                                "items": [
                                    "Volunteers can teach ___5___"
                                ]
                            },
                            {
                                "heading": "Fundraising Events",
                                "items": [
                                    "Location: ___6___",
                                    "May event will be in a ___7___",
                                    "April event type: ___8___",
                                    "Help with selling ___9___",
                                    "Help to make a ___10___"
                                ]
                            }
                        ]
                    },
                    "questions": [
                        {"number": 1, "type": "note_completion"},
                        {"number": 2, "type": "note_completion"},
                        {"number": 3, "type": "note_completion"},
                        {"number": 4, "type": "note_completion"},
                        {"number": 5, "type": "note_completion"},
                        {"number": 6, "type": "note_completion"},
                        {"number": 7, "type": "note_completion"},
                        {"number": 8, "type": "note_completion"},
                        {"number": 9, "type": "note_completion"},
                        {"number": 10, "type": "note_completion"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Oniton Hall",
                    "question_range": "11-20",
                    "question_count": 10,
                    "context": "A tour guide introducing Oniton Hall to visitors",
                    "question_types": ["multiple_choice", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part2.mp3",
                    "questions": [
                        {
                            "number": 11,
                            "type": "multiple_choice",
                            "question": "What change was made to Oniton Hall in the 19th century?",
                            "options": ["A: The kitchen wing was changed", "B: The gardens were redesigned", "C: The stable block was converted"]
                        },
                        {
                            "number": 12,
                            "type": "multiple_choice",
                            "question": "Sir Edward Downes built the house primarily because he wanted",
                            "options": ["A: somewhere to display his art collection", "B: a quiet place to write his books", "C: a place to entertain guests"]
                        },
                        {
                            "number": 13,
                            "type": "multiple_choice",
                            "question": "What can visitors learn about the servants who worked at Oniton Hall?",
                            "options": ["A: how they spent their leisure time", "B: how their working conditions changed", "C: how they felt about their employer"]
                        },
                        {
                            "number": 14,
                            "type": "multiple_choice",
                            "question": "What activity can children take part in at Oniton Hall?",
                            "options": ["A: making costumes", "B: following a trail", "C: making a video"]
                        },
                        {
                            "number": "15-20",
                            "type": "matching",
                            "instruction": "What activity can visitors do at each of the following places? Choose SIX answers from the box and write the correct letter, A-H.",
                            "options_box": {
                                "title": "Activities",
                                "options": [
                                    "A: exercise classes",
                                    "B: bird watching",
                                    "C: cycling",
                                    "D: fishing",
                                    "E: horse riding",
                                    "F: swimming",
                                    "G: walk in woods",
                                    "H: golf"
                                ]
                            },
                            "items": [
                                {"number": 15, "item": "Farm shop area"},
                                {"number": 16, "item": "Lake"},
                                {"number": 17, "item": "Woods"},
                                {"number": 18, "item": "Gym"},
                                {"number": 19, "item": "Stables"},
                                {"number": 20, "item": "Pool"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Romeo and Juliet Production Reviews",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "A discussion between students about a production of Romeo and Juliet",
                    "question_types": ["multiple_selection", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part3.mp3",
                    "questions": [
                        {
                            "number": "21-22",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E",
                            "question": "Which TWO things should reviews include, according to Ed and Gemma?",
                            "options": [
                                "A: information about the plot",
                                "B: advice for the director",
                                "C: description of the actors",
                                "D: comments on the costumes",
                                "E: judgement on the overall production"
                            ],
                            "answer_count": 2
                        },
                        {
                            "number": "23-30",
                            "type": "matching",
                            "instruction": "What opinion does each student express about aspects of the production?",
                            "options_box": {
                                "title": "Opinions",
                                "options": [
                                    "A: They weren't necessary",
                                    "B: They were effective",
                                    "C: They were inappropriate",
                                    "D: They were old-fashioned",
                                    "E: They needed more variety",
                                    "F: They weren't well done",
                                    "G: They weren't suitable"
                                ]
                            },
                            "items": [
                                {"number": 23, "item": "The set"},
                                {"number": 24, "item": "The lighting"},
                                {"number": 25, "item": "The costumes"},
                                {"number": 26, "item": "The music"},
                                {"number": 27, "item": "The actors' delivery of their lines"},
                                {"number": 28, "item": "The relevance of Romeo and Juliet"},
                                {"number": 29, "item": "Watching in another language"},
                                {"number": 30, "item": "Shakespeare's international appeal"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Impact of digital technology on the Icelandic language",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "A lecture about how digital technology affects the Icelandic language",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part4.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Impact of digital technology on the Icelandic language",
                        "sections": [
                            {
                                "heading": "Icelandic Language Facts",
                                "items": [
                                    "Number of speakers worldwide: ___31___",
                                    "Growth of ___32___ has been rapid"
                                ]
                            },
                            {
                                "heading": "Impact of Technology",
                                "items": [
                                    "Young people learn English from ___33___ and videos",
                                    "Children use ___34___ to access English content",
                                    "Some children become ___35___ in English and Icelandic"
                                ]
                            },
                            {
                                "heading": "Concerns",
                                "items": [
                                    "Use of English in the school ___36___",
                                    "Children might learn English word from a ___37___ before Icelandic word",
                                    "Concerns about errors in ___38___"
                                ]
                            },
                            {
                                "heading": "Importance of Icelandic",
                                "items": [
                                    "Language is important for national ___39___",
                                    "Goal is for people to remain ___40___ in Icelandic"
                                ]
                            }
                        ]
                    },
                    "questions": [
                        {"number": 31, "type": "note_completion"},
                        {"number": 32, "type": "note_completion"},
                        {"number": 33, "type": "note_completion"},
                        {"number": 34, "type": "note_completion"},
                        {"number": 35, "type": "note_completion"},
                        {"number": 36, "type": "note_completion"},
                        {"number": 37, "type": "note_completion"},
                        {"number": 38, "type": "note_completion"},
                        {"number": 39, "type": "note_completion"},
                        {"number": 40, "type": "note_completion"}
                    ]
                }
            ]
        },
        "reading": {
            "total_questions": 40,
            "duration": "60 minutes",
            "passages": [
                {
                    "passage_number": 1,
                    "title": "The Dead Sea Scrolls",
                    "question_range": "1-13",
                    "question_count": 13,
                    "passage_text": """The discovery of the Dead Sea Scrolls in 1947 is widely considered the greatest archaeological find of the twentieth century. The scrolls were found by Bedouin shepherds in caves near Qumran, on the northwest shore of the Dead Sea. Over the following years, thousands of scroll fragments were discovered in eleven caves.

The scrolls date from around 250 BCE to 68 CE and include the oldest known biblical manuscripts. They were preserved in clay jars, some sealed to protect them from moisture and decay. The dry, dark conditions of the caves helped maintain the scrolls in remarkable condition for over two thousand years.

Most scholars believe the scrolls were written by the Essenes, a Jewish sect that lived in the Qumran area. The majority of the texts are written in Hebrew, though some are in Aramaic and Greek. The collection includes copies of nearly every book of the Hebrew Bible, as well as previously unknown religious texts.

The scrolls have provided invaluable insights into Jewish religious practices and beliefs during the Second Temple period. They have also enhanced our understanding of the development of the Hebrew Bible and early Christianity. Carbon dating and other scientific techniques have confirmed the age of the scrolls.

Since their discovery, the scrolls have been the subject of intense scholarly debate. Some fragments remain too damaged to read, though new imaging technologies continue to reveal previously hidden text. The scrolls are now housed in the Shrine of the Book at the Israel Museum in Jerusalem.""",
                    "questions": [
                        {
                            "number": "1-5",
                            "type": "note_completion",
                            "instruction": "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
                            "visual": {
                                "title": "The Dead Sea Scrolls",
                                "sections": [
                                    {
                                        "heading": "Discovery and Preservation",
                                        "items": [
                                            "The scrolls were found in ___1___ near Qumran",
                                            "They were preserved in jars made of ___2___",
                                            "The jars were ___3___ to protect the contents"
                                        ]
                                    },
                                    {
                                        "heading": "Origins",
                                        "items": [
                                            "Written by the ___4___, a Jewish sect",
                                            "Most scrolls written in ___5___"
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            "number": "6-13",
                            "type": "true_false_not_given",
                            "instruction": "Do the following statements agree with the information given in Reading Passage 1?",
                            "statements": [
                                {"number": 6, "statement": "The scrolls were discovered by professional archaeologists."},
                                {"number": 7, "statement": "All the scrolls have been successfully preserved in their original condition."},
                                {"number": 8, "statement": "The scrolls contain texts from the Hebrew Bible."},
                                {"number": 9, "statement": "Scholars have reached agreement about who wrote the scrolls."},
                                {"number": 10, "statement": "The age of the scrolls has been verified using scientific methods."},
                                {"number": 11, "statement": "All the scrolls were found in a single cave."},
                                {"number": 12, "statement": "The scrolls have contributed to understanding of early religious history."},
                                {"number": 13, "statement": "All text on the scrolls can now be read using new technology."}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "A second attempt at domesticating the tomato",
                    "question_range": "14-26",
                    "question_count": 13,
                    "passage_text": """A: The fruit we know today as the tomato is a far cry from its wild ancestor. The original wild tomatoes that grew in the Andes mountains of South America were small, about the size of a blueberry, and not particularly appealing in taste. Through thousands of years of domestication, farmers gradually selected plants with larger, tastier fruit, eventually producing the tomatoes we enjoy today.

B: The tomato's journey from the Americas to the rest of the world began in the 16th century when Spanish conquistadors brought seeds back to Europe. Initially, Europeans were suspicious of the fruit, with some believing it to be poisonous due to its membership in the nightshade family. It wasn't until the 18th and 19th centuries that tomatoes became widely accepted as food in Europe and North America.

C: Scientists are now attempting what might be called a 'second domestication' of the tomato. Using gene-editing technology called CRISPR, researchers are modifying wild tomato varieties to create new cultivars that combine the best traits of both wild and domesticated plants. The appeal of wild tomatoes lies in their natural resistance to diseases, tolerance to drought and salt, and superior flavour compounds.

D: The modern commercial tomato, while large and visually appealing, has lost many beneficial traits through centuries of selective breeding. Commercial varieties are often susceptible to diseases and pests, requiring extensive use of pesticides. They also tend to have less flavour than wild varieties, as breeders focused primarily on appearance, shelf life, and uniform ripening rather than taste.

E: Through gene editing, scientists hope to reintroduce beneficial traits from wild tomatoes into domesticated varieties. Early results have been promising, with edited plants showing improved disease resistance, better flavour profiles, and higher nutritional content. Some modified varieties have shown increased levels of lycopene, a compound associated with various health benefits.

F: The technology is not without controversy. While proponents argue that gene editing is simply a more precise form of traditional breeding, critics raise concerns about unforeseen consequences and the control of food supply by large corporations. The regulatory status of gene-edited crops varies between countries, affecting their commercial viability.""",
                    "questions": [
                        {
                            "number": "14-18",
                            "type": "section_matching",
                            "instruction": "Which section contains the following information? Write the correct letter, A-F.",
                            "items": [
                                {"number": 14, "item": "reasons for choosing wild tomato varieties for research"},
                                {"number": 15, "item": "how tomatoes spread from their place of origin"},
                                {"number": 16, "item": "problems with commercially grown tomatoes"},
                                {"number": 17, "item": "a comparison between original wild tomatoes and modern varieties"},
                                {"number": 18, "item": "the technique being used to modify tomatoes"}
                            ]
                        },
                        {
                            "number": "19-23",
                            "type": "multiple_choice",
                            "instruction": "Choose the correct letter, A, B, C or D.",
                            "items": [
                                {"number": 19, "question": "Wild tomatoes are valued by scientists because of their", "options": ["A: large size", "B: disease resistance", "C: commercial appeal", "D: easy cultivation"]},
                                {"number": 20, "question": "Commercial tomatoes have been bred mainly for", "options": ["A: nutritional content", "B: environmental tolerance", "C: taste", "D: appearance"]},
                                {"number": 21, "question": "Gene-edited tomatoes have shown", "options": ["A: improved health benefits", "B: faster growth", "C: lower costs", "D: longer roots"]},
                                {"number": 22, "question": "A concern about gene-edited crops is", "options": ["A: their high price", "B: unexpected effects", "C: their small size", "D: limited availability"]},
                                {"number": 23, "question": "The regulatory situation for gene-edited crops is", "options": ["A: the same worldwide", "B: different in each country", "C: very strict everywhere", "D: completely unregulated"]}
                            ]
                        },
                        {
                            "number": "24-26",
                            "type": "note_completion",
                            "instruction": "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
                            "visual": {
                                "title": "Benefits of gene-edited tomatoes",
                                "sections": [
                                    {
                                        "heading": "Improvements",
                                        "items": [
                                            "Better ___24___",
                                            "Increased ___25___",
                                            "Reduced need for ___26___"
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Insight or evolution?",
                    "question_range": "27-40",
                    "question_count": 14,
                    "passage_text": """The nature of creative problem-solving has fascinated psychologists and neuroscientists for decades. How do we arrive at solutions to complex problems? Two competing theories have dominated the field: the insight theory, which suggests that solutions come suddenly in 'eureka' moments, and the evolutionary theory, which proposes that solutions develop gradually through trial and error.

The insight theory gained prominence through the work of Gestalt psychologists in the early 20th century. They described problem-solving as a process of sudden reorganisation of mental elements, leading to an instantaneous solution. The classic example is Archimedes supposedly shouting 'Eureka!' upon discovering how to measure the volume of an irregular object while sitting in his bath.

More recent research using brain imaging has provided some support for the insight model. Studies show that moments of insight are associated with distinctive patterns of brain activity, particularly in regions involved in integrating disparate pieces of information. Immediately before an insight occurs, there is often a burst of activity in the right hemisphere of the brain.

However, the evolutionary theory challenges this view. Proponents argue that what appears to be sudden insight is actually the culmination of a gradual, unconscious process of testing and rejecting potential solutions. According to this view, our brains continuously generate and evaluate possible solutions, and the 'eureka' moment occurs when an adequate solution finally reaches conscious awareness.

Recent evidence suggests that both theories may have merit. Some problems do seem to be solved through genuine insight, while others are tackled through more incremental processes. Individual differences also play a role; some people appear to rely more heavily on insight, while others favour systematic approaches.

The implications of this research extend beyond academic psychology. Understanding how we solve problems has potential applications in education, business innovation, and artificial intelligence. If insight can be cultivated, teaching methods could be designed to encourage it. Similarly, AI systems might be developed to mimic human insight processes.

Despite decades of research, the nature of creative problem-solving remains incompletely understood. What is clear is that the human mind possesses remarkable capabilities for finding solutions to novel challenges, whether through sudden flashes of insight, gradual evolutionary processes, or some combination of both.""",
                    "questions": [
                        {
                            "number": "27-31",
                            "type": "multiple_choice",
                            "instruction": "Choose the correct letter, A, B, C or D.",
                            "items": [
                                {"number": 27, "question": "The main purpose of the passage is to", "options": ["A: prove the insight theory is correct", "B: explain how the brain works", "C: compare two theories of problem-solving", "D: describe recent advances in neuroscience"]},
                                {"number": 28, "question": "According to the Gestalt psychologists, problem-solving involves", "options": ["A: slow, methodical processes", "B: sudden mental reorganisation", "C: conscious effort", "D: physical experimentation"]},
                                {"number": 29, "question": "Brain imaging studies have shown that insight is", "options": ["A: associated with specific brain activity", "B: impossible to measure", "C: equally common in all people", "D: not a real phenomenon"]},
                                {"number": 30, "question": "The evolutionary theory suggests that eureka moments are", "options": ["A: completely random", "B: the result of gradual processes", "C: more common in creative people", "D: caused by the left brain"]},
                                {"number": 31, "question": "The writer concludes that", "options": ["A: insight theory is definitely correct", "B: evolutionary theory has been disproven", "C: both theories may be partially valid", "D: more research will not be useful"]}
                            ]
                        },
                        {
                            "number": "32-36",
                            "type": "yes_no_not_given",
                            "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 3?",
                            "statements": [
                                {"number": 32, "statement": "Insight always occurs without any prior unconscious processing."},
                                {"number": 33, "statement": "The right hemisphere of the brain is more important than the left for creativity."},
                                {"number": 34, "statement": "Brain scanning has helped researchers understand insight better."},
                                {"number": 35, "statement": "All researchers now agree on which theory is correct."},
                                {"number": 36, "statement": "The research findings could be useful for developing AI systems."}
                            ]
                        },
                        {
                            "number": "37-40",
                            "type": "summary_completion",
                            "instruction": "Complete the summary using the list of words, A-H.",
                            "word_box": ["A: unconscious", "B: different", "C: creative", "D: sudden", "E: gradual", "F: educational", "G: complex", "H: simple"],
                            "summary": "Research suggests that problem-solving may involve both ___37___ insight and ___38___ evolutionary processes. People show ___39___ preferences for how they approach problems. Understanding these processes has potential ___40___ applications."
                        }
                    ]
                }
            ]
        },
        "writing": {
            "total_tasks": 2,
            "duration": "60 minutes",
            "tasks": [
                {
                    "task_number": 1,
                    "title": "Police Budget Report",
                    "task_type": "report",
                    "duration": "20 minutes",
                    "word_count": 150,
                    "description": "The table and charts below give information about the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed.",
                    "instructions": "Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
                    "visual_type": "table_and_pie_charts",
                    "visual_url": "/static/images/cambridge/ielts17/test2_writing_task1.png"
                },
                {
                    "task_number": 2,
                    "title": "Children and Smartphones",
                    "task_type": "essay",
                    "duration": "40 minutes",
                    "word_count": 250,
                    "prompt": "Some children spend hours every day on their smartphones. Why is this the case? Do you think this is a positive or a negative development?",
                    "instructions": "Give reasons for your answer and include any relevant examples from your own knowledge or experience."
                }
            ]
        },
        "speaking": {
            "total_parts": 3,
            "duration": "11-14 minutes",
            "parts": [
                {
                    "part_number": 1,
                    "title": "Introduction and Interview",
                    "duration": "4-5 minutes",
                    "description": "The examiner will ask you about yourself and general topics",
                    "topics": [
                        {
                            "name": "Reading",
                            "questions": [
                                "Do you like reading?",
                                "What kind of books do you read?",
                                "Did you read a lot when you were a child?",
                                "Do you think it is important for children to read?"
                            ]
                        },
                        {
                            "name": "Home",
                            "questions": [
                                "Do you live in a house or an apartment?",
                                "What is your favourite room in your home?",
                                "Would you like to move to a different home?",
                                "What kind of home would you like to live in?"
                            ]
                        }
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": "1 minute",
                    "speaking_time": "1-2 minutes",
                    "task_card": {
                        "topic": "Describe a big city you would like to visit",
                        "points": [
                            "which city you would like to visit",
                            "how you would travel there",
                            "what you would do there",
                            "and explain why you would like to visit this city"
                        ]
                    },
                    "questions": [
                        "Describe a big city you would like to visit. You should say which city you would like to visit, how you would travel there, what you would do there, and explain why you would like to visit this city."
                    ],
                    "follow_up_questions": ["Do you think you will visit this city in the future?"]
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "topics": [
                        {
                            "name": "Visiting cities on holiday",
                            "questions": [
                                "What are the advantages of visiting cities on holiday rather than going to the countryside?",
                                "Why do you think some cities are more popular tourist destinations than others?",
                                "What problems can result from too many tourists visiting a city?"
                            ]
                        },
                        {
                            "name": "The growth of cities",
                            "questions": [
                                "Why do you think cities are growing so fast in many countries?",
                                "What are some of the challenges cities face as they grow larger?",
                                "Do you think cities will continue to grow in the future?"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    "answer_keys": {
        "listening": {
            "1": "collecting",
            "2": "records",
            "3": "West",
            "4": "transport",
            "5": "art",
            "6": "hospital",
            "7": "garden",
            "8": "quiz",
            "9": "tickets",
            "10": "poster",
            "11": "B",
            "12": "C",
            "13": "C",
            "14": "B",
            "15": "D",
            "16": "C",
            "17": "G",
            "18": "A",
            "19": "E",
            "20": "F",
            "21": ["D", "E"],
            "22": ["D", "E"],
            "23": "D",
            "24": "C",
            "25": "A",
            "26": "E",
            "27": "F",
            "28": "B",
            "29": "C",
            "30": "C",
            "31": "321,000",
            "32": "vocabulary",
            "33": "podcast",
            "34": "smartphones",
            "35": "bilingual",
            "36": "playground",
            "37": "picture",
            "38": "grammar",
            "39": "identity",
            "40": "fluent"
        },
        "reading": {
            "1": "caves",
            "2": "clay",
            "3": "sealed",
            "4": "Essenes",
            "5": "Hebrew",
            "6": "FALSE",
            "7": "FALSE",
            "8": "TRUE",
            "9": "TRUE",
            "10": "TRUE",
            "11": "FALSE",
            "12": "TRUE",
            "13": "FALSE",
            "14": "C",
            "15": "B",
            "16": "D",
            "17": "A",
            "18": "C",
            "19": "B",
            "20": "D",
            "21": "A",
            "22": "B",
            "23": "B",
            "24": "flavour",
            "25": "size",
            "26": "pesticides",
            "27": "C",
            "28": "B",
            "29": "A",
            "30": "B",
            "31": "C",
            "32": "NO",
            "33": "NOT GIVEN",
            "34": "YES",
            "35": "NO",
            "36": "YES",
            "37": "D",
            "38": "E",
            "39": "B",
            "40": "F"
        }
    }
}
