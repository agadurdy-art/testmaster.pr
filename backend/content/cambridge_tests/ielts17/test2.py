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
                    "passage_text": "In late 1946 or early 1947, three Bedouin teenagers were tending their goats near Qumran, on the northwest shore of the Dead Sea. One shepherd tossed a rock into a cave opening and heard a shattering sound. They found large clay jars containing scrolls. These were sold to an antiquities dealer. Eventually tens of thousands of scroll fragments were found in 10 nearby caves, making up 800-900 manuscripts.\n\nThe scrolls were written around 2,000 years ago between 150 BCE and 70 CE. According to prevailing theory, they were written by the Essenes, a devout Jewish sect, until Roman troops destroyed the settlement around 70 CE.\n\nMost texts are in Hebrew, some in Aramaic, and several in Greek. The scrolls include fragments from every Old Testament book except Esther. The only complete book is Isaiah, the earliest biblical manuscript in existence.\n\nThe scrolls are mostly written in black or red ink on parchment or papyrus. The Copper Scroll is unique - made of copper and tin with chiselled letters. It describes 64 underground hiding places supposedly containing treasure.\n\nIn 1948, Mar Samuel acquired four scrolls for less than $100. In 1954, he advertised them in The Wall Street Journal. Israeli archaeologist Yigael Yadin brought them back to Jerusalem.\n\nIn 2017, University of Haifa researchers deciphered one of the last untranslated scrolls, spending a year reassembling 60 fragments. Only one scroll remains untranslated.",
                    "questions": [
                        {
                            "number": "1-5",
                            "type": "note_completion",
                            "instruction": "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
                            "visual": {
                                "title": "The Dead Sea Scrolls",
                                "sections": [
                                    {
                                        "heading": "Discovery",
                                        "items": [
                                            "heard a noise of breaking when one teenager threw a ___1___",
                                            "teenagers went into the ___2___ and found containers made of ___3___"
                                        ]
                                    },
                                    {
                                        "heading": "Origin",
                                        "items": [
                                            "thought to have been written by group known as the ___4___",
                                            "written mainly in the ___5___ language"
                                        ]
                                    }
                                ]
                            },
                            "items": [
                                {"number": 1, "blank": "threw a ___1___"},
                                {"number": 2, "blank": "into the ___2___"},
                                {"number": 3, "blank": "made of ___3___"},
                                {"number": 4, "blank": "known as the ___4___"},
                                {"number": 5, "blank": "the ___5___ language"}
                            ]
                        },
                        {
                            "number": "6-13",
                            "type": "true_false_not_given",
                            "instruction": "Do the following statements agree with the information given in Reading Passage 1?",
                            "items": [
                                {"number": 6, "statement": "The Bedouin teenagers who found the scrolls were disappointed by how little money they received for them."},
                                {"number": 7, "statement": "There is agreement among academics about the origin of the Dead Sea Scrolls."},
                                {"number": 8, "statement": "Most of the books of the Bible written on the scrolls are incomplete."},
                                {"number": 9, "statement": "The information on the Copper Scroll is written in an unusual way."},
                                {"number": 10, "statement": "Mar Samuel was given some of the scrolls as a gift."},
                                {"number": 11, "statement": "In the early 1950s, a number of educational establishments in the US were keen to buy scrolls from Mar Samuel."},
                                {"number": 12, "statement": "The scroll that was pieced together in 2017 contains information about annual occasions in the Qumran area 2,000 years ago."},
                                {"number": 13, "statement": "Academics at the University of Haifa are currently researching how to decipher the final scroll."}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "A second attempt at domesticating the tomato",
                    "question_range": "14-26",
                    "question_count": 13,
                    "passage_text": """A
It took at least 3,000 years for humans to learn how to domesticate the wild tomato and cultivate it for food. Now two separate teams in Brazil and China have done it all over again in less than three years. And they have done it better in some ways, as the re-domesticated tomatoes are more nutritious than the ones we eat at present.

This approach relies on the revolutionary CRISPR genome editing technique, in which changes are deliberately made to the DNA of a living cell, allowing genetic material to be added, removed or altered. The technique could not only improve existing crops, but could also be used to turn thousands of wild plants into useful and appealing foods. In fact, a third team in the US has already begun to do this with a relative of the tomato called the groundcherry.

This fast-track domestication could help make the world's food supply healthier and far more resistant to diseases, such as the rust fungus devastating wheat crops. 'This could transform what we eat,' says Jorg Kudla at the University of Munster in Germany, a member of the Brazilian team. 'There are 50,000 edible plants in the world, but 90 percent of our energy comes from just 15 crops.'

'We can now mimic the known domestication course of major crops like rice, maize, sorghum or others,' says Caixia Gao of the Chinese Academy of Sciences in Beijing. 'Then we might try to domesticate plants that have never been domesticated.'

B
Wild tomatoes, which are native to the Andes region in South America, produce pea-sized fruits. Over many generations, peoples such as the Aztecs and Incas transformed the plant by selecting and breeding plants with mutations in their genetic structure, which resulted in desirable traits such as larger fruit.

But every time a single plant with a mutation is taken from a larger population for breeding, much genetic diversity is lost. And sometimes the desirable mutations come with less desirable traits. For instance, the tomato strains grown for supermarkets have lost much of their flavour.

By comparing the genomes of modern plants to those of their wild relatives, biologists have been working out what genetic changes occurred as plants were domesticated. The teams in Brazil and China have now used this knowledge to reintroduce these changes from scratch while maintaining or even enhancing the desirable traits of wild strains.

C
Kudla's team made six changes altogether. For instance, they tripled the size of fruit by editing a gene called FRUIT WEIGHT, and increased the number of tomatoes per truss by editing another called MULTIFLORA.

While the historical domestication of tomatoes reduced levels of the red pigment lycopene - thought to have potential health benefits - the team in Brazil managed to boost it instead. The wild tomato has twice as much lycopene as cultivated ones; the newly domesticated one has five times as much.

'They are quite tasty,' says Kudla. 'A little bit strong. And very aromatic.'

The team in China re-domesticated several strains of wild tomatoes with desirable traits lost in domesticated tomatoes. In this way they managed to create a strain resistant to a common disease called bacterial spot race, which can devastate yields. They also created another strain that is more salt tolerant - and has higher levels of vitamin C.

D
Meanwhile, Joyce Van Eck at the Boyce Thompson Institute in New York state decided to use the same approach to domesticate the groundcherry or goldenberry (Physalis pruinosa) for the first time. This fruit looks similar to the closely related Cape gooseberry (Physalis peruviana).

Groundcherries are already sold to a limited extent in the US but they are hard to produce because the plant has a sprawling growth habit and the small fruits fall off the branches when ripe. Van Eck's team has edited the plants to increase fruit size, make their growth more compact and to stop fruits dropping. 'There's potential for this to be a commercial crop,' says Van Eck. But she adds that taking the work further would be expensive because of the need to pay for a licence for the CRISPR technology and get regulatory approval.

E
This approach could boost the use of many obscure plants, says Jonathan Jones of the Sainsbury Lab in the UK. But it will be hard for new foods to grow so popular with farmers and consumers that they become new staple crops, he thinks.

The three teams already have their eye on other plants that could be 'catapulted into the mainstream', including foxtail, oat-grass and cowpea. By choosing wild plants that are drought or heat tolerant, says Gao, we could create crops that will thrive even as the planet warms.

But Kudla didn't want to reveal which species were in his team's sights, because CRISPR has made the process so easy. 'Any one with the right skills could go to their lab and do this.'""",
                    "questions": [
                        {
                            "number": "14-18",
                            "type": "section_matching",
                            "instruction": "Which section contains the following information? Write the correct letter, A-E.",
                            "items": [
                                {"number": 14, "item": "a reference to a type of tomato that can resist a dangerous infection"},
                                {"number": 15, "item": "an explanation of how problems can arise from focusing only on a certain type of tomato plant"},
                                {"number": 16, "item": "a number of examples of plants that are not cultivated at present but could be useful as food sources"},
                                {"number": 17, "item": "a comparison between the early domestication of the tomato and more recent research"},
                                {"number": 18, "item": "a personal reaction to the flavour of a tomato that has been genetically edited"}
                            ]
                        },
                        {
                            "number": "19-23",
                            "type": "matching_features",
                            "instruction": "Match each statement with the correct researcher, A-D.",
                            "researchers": [
                                {"letter": "A", "name": "Jorg Kudla"},
                                {"letter": "B", "name": "Caixia Gao"},
                                {"letter": "C", "name": "Joyce Van Eck"},
                                {"letter": "D", "name": "Jonathan Jones"}
                            ],
                            "items": [
                                {"number": 19, "statement": "Domestication of certain plants could allow them to adapt to future environmental challenges."},
                                {"number": 20, "statement": "The idea of growing and eating unusual plants may not be accepted on a large scale."},
                                {"number": 21, "statement": "It is not advisable for the future direction of certain research to be made public."},
                                {"number": 22, "statement": "Present efforts to domesticate one wild fruit are limited by the costs involved."},
                                {"number": 23, "statement": "Humans only make use of a small proportion of the plant food available on Earth."}
                            ]
                        },
                        {
                            "number": "24-26",
                            "type": "sentence_completion",
                            "instruction": "Complete the sentences below. Choose ONE WORD ONLY from the passage.",
                            "items": [
                                {"number": 24, "sentence": "An undesirable trait such as loss of ___24___ may be caused by a mutation in a tomato gene."},
                                {"number": 25, "sentence": "By modifying one gene, researchers made the tomato three times its original ___25___."},
                                {"number": 26, "sentence": "A type of tomato not badly affected by ___26___, rich in vitamin C, was produced in China."}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Insight or evolution?",
                    "question_range": "27-40",
                    "question_count": 14,
                    "passage_text": "This passage examines two theories of creative breakthroughs: sudden insight versus evolutionary variation and selection. The traditional view holds that geniuses have sudden aha moments. However, evidence suggests advances often come through gradual processes involving mistakes, accidents, and refinement.\n\nExamples include John Nicholson whose incorrect proto-elements theory laid groundwork for later atomic theory. The acey-deucy stirrup was invented for simple practical reasons. The Post-It note emerged from lucky coincidence.\n\nThe Law of Effect shows organisms learn through trial and error, not planning. Scientific progress often follows evolutionary principles rather than requiring moments of genius.",
                    "questions": [
                        {
                            "number": "27-31",
                            "type": "multiple_choice",
                            "instruction": "Choose the correct letter, A, B, C or D.",
                            "items": [
                                {"number": 27, "question": "The purpose of the first paragraph is to", "options": ["A: defend particular ideas.", "B: compare certain beliefs.", "C: disprove a widely held view.", "D: outline a common assumption."]},
                                {"number": 28, "question": "What are the writers doing in the second paragraph?", "options": ["A: criticising an opinion", "B: justifying a standpoint", "C: explaining an approach", "D: supporting an argument"]},
                                {"number": 29, "question": "In the third paragraph, what do the writers suggest about Darwin and Einstein?", "options": ["A: They represent an exception to a general rule.", "B: Their way of working has been misunderstood.", "C: They are an ideal which others should aspire to.", "D: Their achievements deserve greater recognition."]},
                                {"number": 30, "question": "John Nicholson is an example of a person whose idea", "options": ["A: established his reputation as an influential scientist.", "B: was only fully understood at a later point in history.", "C: laid the foundations for someone else's breakthrough.", "D: initially met with scepticism from the scientific community."]},
                                {"number": 31, "question": "What is the key point of interest about the acey-deucy stirrup placement?", "options": ["A: the simple reason why it was invented", "B: the enthusiasm with which it was adopted", "C: the research that went into its development", "D: the cleverness of the person who first used it"]}
                            ]
                        },
                        {
                            "number": "32-36",
                            "type": "yes_no_not_given",
                            "instruction": "Do the following statements agree with the claims of the writer?",
                            "items": [
                                {"number": 32, "statement": "Acknowledging people such as Plato or da Vinci as geniuses will help us understand the process by which great minds create new ideas."},
                                {"number": 33, "statement": "The Law of Effect was discovered at a time when psychologists were seeking a scientific reason why creativity occurs."},
                                {"number": 34, "statement": "The Law of Effect states that no planning is involved in the behaviour of organisms."},
                                {"number": 35, "statement": "The Law of Effect sets out clear explanations about the sources of new ideas and behaviours."},
                                {"number": 36, "statement": "Many scientists are now turning away from the notion of intelligent design and genius."}
                            ]
                        },
                        {
                            "number": "37-40",
                            "type": "summary_completion",
                            "instruction": "Complete the summary. Choose ONE WORD ONLY from the list A-G.",
                            "word_box": {"options": [{"letter": "A", "word": "invention"}, {"letter": "B", "word": "goals"}, {"letter": "C", "word": "compromise"}, {"letter": "D", "word": "mistakes"}, {"letter": "E", "word": "luck"}, {"letter": "F", "word": "inspiration"}, {"letter": "G", "word": "experiments"}]},
                            "summary_text": "The traditional view is that breakthroughs happen when a great mind has sudden ___37___. Advances often involve ___38___, like Nicholsons theory. There is often an element of ___39___, like the Post-It note. There may be no clear ___40___ involved, but merely variation and selection.",
                            "items": [{"number": 37, "blank": "sudden ___37___"}, {"number": 38, "blank": "involves ___38___"}, {"number": 39, "blank": "element of ___39___"}, {"number": 40, "blank": "no clear ___40___"}]
                        }
                    ]
                }
            ]
        },        "writing": {
            "total_tasks": 2,
            "duration": "60 minutes",
            "tasks": [
                {
                    "task_number": 1,
                    "title": "Report Writing",
                    "duration": "20 minutes",
                    "word_count": "at least 150 words",
                    "task_type": "table_description",
                    "instruction": "The table below shows the numbers of visitors to Ashdown Museum during the year before and the year after it was refurbished. The charts show the result of surveys asking visitors how satisfied they were with their visit, during the same two periods.",
                    "visual": {
                        "type": "table_and_pie_charts",
                        "description": "Table showing visitor numbers and satisfaction surveys",
                        "image_url": "/api/static/images/cambridge/ielts17/test2_writing_task1.png"
                    }
                },
                {
                    "task_number": 2,
                    "title": "Essay Writing",
                    "duration": "40 minutes",
                    "word_count": "at least 250 words",
                    "task_type": "opinion_essay",
                    "instruction": "In their advertising, businesses nowadays usually emphasise that their products are new in some way. Why is this? Do you think it is a positive or negative development?"
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
                    "topics": [
                        {"topic": "Work or Studies", "questions": ["Do you work or are you a student?", "What do you do for work?", "Why did you choose that job?"]},
                        {"topic": "Neighbours", "questions": ["How well do you know your neighbours?", "How often do you see them?", "How can neighbours help each other?"]}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Long Turn",
                    "duration": "3-4 minutes",
                    "topic_card": {
                        "instruction": "Describe a film you watched that you found disappointing.",
                        "points": ["what the film was about", "why you decided to watch it", "why you found it disappointing"],
                        "final_prompt": "and explain whether you would recommend this film to others."
                    }
                },
                {
                    "part_number": 3,
                    "title": "Discussion",
                    "duration": "4-5 minutes",
                    "topic": "Films and Society",
                    "questions": ["What kinds of films are most popular in your country?", "Do you think films can influence peoples behaviour?", "Why do some people prefer foreign films?"]
                }
            ]
        }
    },
    "answer_keys": {
        "listening": {
            "1": "shelving", "2": "records", "3": "Green", "4": "transport", "5": "painting",
            "6": "hospital", "7": "Saturday", "8": "A", "9": "E", "10": "C",
            "11": "1875", "12": "farm", "13": "clothing", "14": "damage", "15": "toys",
            "16": "10", "17": "8", "18": "library", "19": "paintings", "20": "C",
            "21": "A", "22": "B", "23": "F", "24": "D", "25": "B",
            "26": "E", "27": "G", "28": "B", "29": "A", "30": "C",
            "31": "audience", "32": "stage", "33": "plots", "34": "costumes", "35": "movements",
            "36": "sound", "37": "dancing", "38": "emotions", "39": "rehearsals", "40": "director"
        },
        "reading": {
            "1": "rock", "2": "cave", "3": "clay", "4": "Essenes", "5": "Hebrew",
            "6": "NOT GIVEN", "7": "FALSE", "8": "TRUE", "9": "TRUE", "10": "FALSE",
            "11": "FALSE", "12": "TRUE", "13": "NOT GIVEN",
            "14": "C", "15": "B", "16": "E", "17": "A", "18": "C",
            "19": "B", "20": "D", "21": "A", "22": "C", "23": "A",
            "24": "flavour", "25": "size", "26": "salt",
            "27": "D", "28": "C", "29": "B", "30": "C", "31": "A",
            "32": "NO", "33": "NOT GIVEN", "34": "YES", "35": "NO", "36": "NOT GIVEN",
            "37": "F", "38": "D", "39": "E", "40": "B"
        }
    }
}
