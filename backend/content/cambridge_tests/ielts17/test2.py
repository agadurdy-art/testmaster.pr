"""
Cambridge IELTS 17 - Test 2
Official test content in correct IELTS format
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
                    "context": "A conversation about voluntary work opportunities",
                    "question_types": ["note_completion", "table_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part1.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Opportunities for voluntary work in Southoe village",
                        "sections": [
                            {
                                "heading": "Library",
                                "items": [
                                    "Help with ___1___ books (times to be arranged)",
                                    "Help needed to keep ___2___ of books up to date",
                                    "Library is in the ___3___ Room in the village hall"
                                ]
                            },
                            {
                                "heading": "Lunch club",
                                "items": [
                                    "Help by providing ___4___",
                                    "Help with hobbies such as ___5___"
                                ]
                            },
                            {
                                "heading": "Help for individuals needed next week",
                                "items": [
                                    "Taking Mrs Carroll to ___6___",
                                    "Work in the ___7___ at Mr Selsbury's house"
                                ]
                            },
                            {
                                "heading": "Village social events",
                                "subsections": [
                                    {
                                        "name": "19 Oct",
                                        "items": [
                                            "Event: ___8___",
                                            "Location: Village hall",
                                            "Help: providing refreshments"
                                        ]
                                    },
                                    {
                                        "name": "18 Nov",
                                        "items": [
                                            "Event: dance",
                                            "Location: Village hall",
                                            "Help: checking ___9___"
                                        ]
                                    },
                                    {
                                        "name": "31 Dec",
                                        "items": [
                                            "Event: New Year's Eve party",
                                            "Location: Mountfort Hotel",
                                            "Help: designing the ___10___"
                                        ]
                                    }
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
                    "context": "Information about Oniton Hall visitor attraction",
                    "question_types": ["multiple_choice", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part2.mp3",
                    "questions": [
                        {
                            "number": 11,
                            "type": "multiple_choice",
                            "question": "Many past owners made changes to",
                            "options": ["A: the gardens.", "B: the house.", "C: the farm."]
                        },
                        {
                            "number": 12,
                            "type": "multiple_choice",
                            "question": "Sir Edward Downes built Oniton Hall because he wanted",
                            "options": ["A: a place for discussing politics.", "B: a place to display his wealth.", "C: a place for artists and writers."]
                        },
                        {
                            "number": 13,
                            "type": "multiple_choice",
                            "question": "Visitors can learn about the work of servants in the past from",
                            "options": ["A: audio guides.", "B: photographs.", "C: people in costume."]
                        },
                        {
                            "number": 14,
                            "type": "multiple_choice",
                            "question": "What is new for children at Oniton Hall?",
                            "options": ["A: clothes for dressing up", "B: mini tractors", "C: the adventure playground"]
                        },
                        {
                            "number": "15-20",
                            "type": "matching",
                            "instruction": "Which activity is offered at each of the following locations on the farm? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 15-20.",
                            "options_box": {
                                "title": "Activities",
                                "options": [
                                    "A: shopping",
                                    "B: watching cows being milked",
                                    "C: seeing old farming equipment",
                                    "D: eating and drinking",
                                    "E: starting a trip",
                                    "F: seeing rare breeds of animals",
                                    "G: helping to look after animals",
                                    "H: using farming tools"
                                ]
                            },
                            "items": [
                                {"number": 15, "item": "dairy"},
                                {"number": 16, "item": "large barn"},
                                {"number": 17, "item": "small barn"},
                                {"number": 18, "item": "stables"},
                                {"number": 19, "item": "shed"},
                                {"number": 20, "item": "parkland"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Romeo and Juliet Production",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "Two students discussing a production of Romeo and Juliet",
                    "question_types": ["multiple_selection", "matching", "multiple_choice"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part3.mp3",
                    "questions": [
                        {
                            "number": "21-22",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E.",
                            "question": "Which TWO things do the students agree they need to include in their reviews of Romeo and Juliet?",
                            "options": [
                                "A: analysis of the text",
                                "B: a summary of the plot",
                                "C: a description of the theatre",
                                "D: a personal reaction",
                                "E: a reference to particular scenes"
                            ],
                            "answer_count": 2
                        },
                        {
                            "number": "23-27",
                            "type": "matching",
                            "instruction": "Which opinion do the speakers give about each of the following aspects of The Emporium's production of Romeo and Juliet? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 23-27.",
                            "options_box": {
                                "title": "Opinions",
                                "options": [
                                    "A: They both expected this to be more traditional.",
                                    "B: They both thought this was original.",
                                    "C: They agree this created the right atmosphere.",
                                    "D: They agree this was a major strength.",
                                    "E: They were both disappointed by this.",
                                    "F: They disagree about why this was an issue.",
                                    "G: They disagree about how this could be improved."
                                ]
                            },
                            "items": [
                                {"number": 23, "item": "the set"},
                                {"number": 24, "item": "the lighting"},
                                {"number": 25, "item": "the costume design"},
                                {"number": 26, "item": "the music"},
                                {"number": 27, "item": "the actors' delivery"}
                            ]
                        },
                        {
                            "number": 28,
                            "type": "multiple_choice",
                            "question": "The students think the story of Romeo and Juliet is still relevant for young people today because",
                            "options": ["A: it illustrates how easily conflict can start.", "B: it deals with problems that families experience.", "C: it teaches them about relationships."]
                        },
                        {
                            "number": 29,
                            "type": "multiple_choice",
                            "question": "The students found watching Romeo and Juliet in another language",
                            "options": ["A: frustrating.", "B: demanding.", "C: moving."]
                        },
                        {
                            "number": 30,
                            "type": "multiple_choice",
                            "question": "Why do the students think Shakespeare's plays have such international appeal?",
                            "options": ["A: The stories are exciting.", "B: There are recognisable characters.", "C: They can be interpreted in many ways."]
                        }
                    ]
                },
                {
                    "part_number": 4,
                    "title": "The impact of digital technology on the Icelandic language",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "A lecture about how digital technology affects the Icelandic language",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test2_part4.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "The impact of digital technology on the Icelandic language",
                        "sections": [
                            {
                                "heading": "The Icelandic language",
                                "items": [
                                    "has approximately ___31___ speakers",
                                    "has a ___32___ that is still growing",
                                    "has not changed a lot over the last thousand years",
                                    "has its own words for computer-based concepts, such as web browser and ___33___"
                                ]
                            },
                            {
                                "heading": "Young speakers",
                                "items": [
                                    "are big users of digital technology, such as ___34___",
                                    "are becoming ___35___ very quickly",
                                    "are having discussions using only English while they are in the ___36___ at school",
                                    "are better able to identify the content of a ___37___ in English than Icelandic"
                                ]
                            },
                            {
                                "heading": "Technology and internet companies",
                                "items": [
                                    "write very little in Icelandic because of the small number of speakers and because of how complicated its ___38___ is"
                                ]
                            },
                            {
                                "heading": "The Icelandic government",
                                "items": [
                                    "has set up a fund to support the production of more digital content in the language",
                                    "believes that Icelandic has a secure future",
                                    "is worried that young Icelanders may lose their ___39___ as Icelanders",
                                    "is worried about the consequences of children not being ___40___ in either Icelandic or English"
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
                    "passage_text": """A
In late 1946 or early 1947, three Bedouin teenagers were tending their goats and sheep near the ancient settlement of Qumran, located on the northwest shore of the Dead Sea in what is now known as the West Bank. One of these young shepherds tossed a rock into an opening on the side of a cliff and was surprised to hear a shattering sound. He and his companions later entered the cave and stumbled across a collection of large clay jars, seven of which contained scrolls with writing on them. The teenagers took the seven scrolls to a nearby town where they were sold for a small sum to a local antiquities dealer. Word of the find spread, and Bedouins and archaeologists eventually unearthed tens of thousands of additional scroll fragments from 10 nearby caves; together they make up between 800 and 900 manuscripts. It soon became clear that this was one of the greatest archaeological discoveries ever made.

B
The origin of the Dead Sea Scrolls, which were written around 2,000 years ago between 150 BCE and 70 CE, is still the subject of scholarly debate even today. According to the prevailing theory, they are the work of a population that inhabited the area until Roman troops destroyed the settlement around 70 CE. The area was known as Judea at that time, and the people are thought to have belonged to a group called the Essenes, a devout Jewish sect.

C
The majority of the texts on the Dead Sea Scrolls are in Hebrew, with some fragments written in an ancient version of its alphabet thought to have fallen out of use in the fifth century BCE. But there are other languages as well. Some scrolls are in Aramaic, the language spoken by many inhabitants of the region from the sixth century BCE to the siege of Jerusalem in 70 CE. In addition, several texts feature translations of the Hebrew Bible into Greek.

D
The Dead Sea Scrolls include fragments from every book of the Old Testament of the Bible except for the Book of Esther. The only entire book of the Hebrew Bible preserved among the manuscripts from Qumran is Isaiah; this copy, dated to the first century BCE, is considered the earliest biblical manuscript still in existence. Along with biblical texts, the scrolls include documents about sectarian regulations and religious writings that do not appear in the Old Testament.

E
The writing on the Dead Sea Scrolls is mostly in black or occasionally red ink, and the scrolls themselves are nearly all made of either parchment (animal skin) or an early form of paper called 'papyrus'. The only exception is the scroll numbered 3Q15, which was created out of a combination of copper and tin. Known as the Copper Scroll, this curious document features letters chiselled onto metal – perhaps, as some have theorized, to better withstand the passage of time. One of the most intriguing manuscripts from Qumran, this is a sort of ancient treasure map that lists dozens of gold and silver caches. Using an unconventional vocabulary and odd spelling, it describes 64 underground hiding places that supposedly contain riches buried for safekeeping. None of these hoards have been recovered, possibly because the Romans pillaged Judea during the first century CE. According to various hypotheses, the treasure belonged to local people, or was rescued from the Second Temple before its destruction or never existed to begin with.

F
Some of the Dead Sea Scrolls have been on interesting journeys. In 1948, a Syrian Orthodox archbishop known as Mar Samuel acquired four of the original seven scrolls from a Jerusalem shoemaker and part-time antiquity dealer, paying less than $100 for them. He then travelled to the United States and unsuccessfully offered them to a number of universities, including Yale. Finally, in 1954, he placed an advertisement in the business newspaper The Wall Street Journal – under the category 'Miscellaneous Items for Sale' – that read: 'Biblical Manuscripts dating back to at least 200 B.C. are for sale. This would be an ideal gift to an educational or religious institution by an individual or group.' Fortunately, Israeli archaeologist and statesman Yigael Yadin negotiated their purchase and brought the scrolls back to Jerusalem, where they remain to this day.

G
In 2017, researchers from the University of Haifa restored and deciphered one of the last untranslated scrolls. The university's Eshbal Ratson and Jonathan Ben-Dov spent one year reassembling the 60 fragments that make up the scroll. Deciphered from a band of coded text on parchment, the find provides insight into the community of people who wrote it and the 364-day calendar they would have used. The scroll names celebrations that indicate shifts in seasons and details two yearly religious events known from another Dead Sea Scroll. Only one more known scroll remains untranslated.""",
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
                    "passage_text": """A: The fruit we know today as the tomato is a far cry from its wild ancestor. The original wild tomatoes that grew in the Andes mountains of South America were small, about the size of a blueberry, and not particularly appealing in taste. Through thousands of years of domestication, farmers gradually selected plants with larger, tastier fruit.

B: The tomato's journey from the Americas to the rest of the world began in the 16th century when Spanish conquistadors brought seeds back to Europe. Initially, Europeans were suspicious of the fruit, with some believing it to be poisonous due to its membership in the nightshade family.

C: Scientists are now attempting what might be called a 'second domestication' of the tomato. Using gene-editing technology called CRISPR, researchers are modifying wild tomato varieties to create new cultivars. The appeal of wild tomatoes lies in their natural resistance to diseases and superior flavour compounds.

D: The modern commercial tomato has lost many beneficial traits through centuries of selective breeding. Commercial varieties are often susceptible to diseases and pests, requiring extensive use of pesticides. They also tend to have less flavour than wild varieties.

E: Through gene editing, scientists hope to reintroduce beneficial traits from wild tomatoes into domesticated varieties. Early results have been promising, with edited plants showing improved disease resistance and better flavour profiles.

F: The technology is not without controversy. Critics raise concerns about unforeseen consequences and the control of food supply by large corporations.""",
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
                    "passage_text": """The nature of creative problem-solving has fascinated psychologists and neuroscientists for decades. How do we arrive at solutions to complex problems? Two competing theories have dominated the field: the insight theory and the evolutionary theory.

The insight theory gained prominence through the work of Gestalt psychologists in the early 20th century. They described problem-solving as a process of sudden reorganisation of mental elements, leading to an instantaneous solution.

More recent research using brain imaging has provided some support for the insight model. Studies show that moments of insight are associated with distinctive patterns of brain activity.

However, the evolutionary theory challenges this view. Proponents argue that what appears to be sudden insight is actually the culmination of a gradual, unconscious process of testing and rejecting potential solutions.

Recent evidence suggests that both theories may have merit. Some problems do seem to be solved through genuine insight, while others are tackled through more incremental processes. Individual differences also play a role.

The implications of this research extend beyond academic psychology. Understanding how we solve problems has potential applications in education, business innovation, and artificial intelligence.

Despite decades of research, the nature of creative problem-solving remains incompletely understood. What is clear is that the human mind possesses remarkable capabilities for finding solutions to novel challenges.""",
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
            "1": ["shelving", "re-shelving", "reshelving"],
            "2": ["records", "record", "catalogue", "catalog"],
            "3": "Green",
            "4": "transport",
            "5": "painting",
            "6": "hospital",
            "7": "garden",
            "8": "quiz",
            "9": ["tickets", "ticket"],
            "10": "poster",
            "11": "A",
            "12": "C",
            "13": "C",
            "14": "B",
            "15": "B",
            "16": "C",
            "17": "F",
            "18": "G",
            "19": "H",
            "20": "E",
            "21": ["D", "E"],
            "22": ["D", "E"],
            "23": "A",
            "24": "C",
            "25": "E",
            "26": "F",
            "27": "G",
            "28": "C",
            "29": "C",
            "30": "C",
            "31": "340,000",
            "32": "vocabulary",
            "33": "podcast",
            "34": "smartphones",
            "35": "bilingual",
            "36": "playground",
            "37": "photograph",
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
