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
                    "passage_text": """In late 1946 or early 1947, three Bedouin teenagers were tending their goats and sheep near the ancient settlement of Qumran, located on the northwest shore of the Dead Sea in what is now known as the West Bank. One of these young shepherds tossed a rock into an opening on the side of a cliff and was surprised to hear a shattering sound. He and his companions later entered the cave and stumbled across a collection of large clay jars, seven of which contained scrolls with writing on them. The teenagers took the seven scrolls to a nearby town where they were sold for a small sum to a local antiquities dealer. Word of the find spread, and Bedouins and archaeologists eventually unearthed tens of thousands of additional scroll fragments from 10 nearby caves; together they make up between 800 and 900 manuscripts. It soon became clear that this was one of the greatest archaeological discoveries ever made.

The origin of the Dead Sea Scrolls, which were written around 2,000 years ago between 150 BCE and 70 CE, is still the subject of scholarly debate even today. According to the prevailing theory, they are the work of a population that inhabited the area until Roman troops destroyed the settlement around 70 CE. The area was known as Judea at that time, and the people are thought to have belonged to a group called the Essenes, a devout Jewish sect.

The majority of the texts on the Dead Sea Scrolls are in Hebrew, with some fragments written in an ancient version of its alphabet thought to have fallen out of use in the fifth century BCE. But there are other languages as well. Some scrolls are in Aramaic, the language spoken by many inhabitants of the region from the sixth century BCE to the siege of Jerusalem in 70 CE. In addition, several texts feature translations of the Hebrew Bible into Greek.

The Dead Sea Scrolls include fragments from every book of the Old Testament of the Bible except for the Book of Esther. The only entire book of the Hebrew Bible preserved among the manuscripts from Qumran is Isaiah; this copy, dated to the first century BCE, is considered the earliest biblical manuscript still in existence. Along with biblical texts, the scrolls include documents about sectarian regulations and religious writings that do not appear in the Old Testament.

The writing on the Dead Sea Scrolls is mostly in black or occasionally red ink, and the scrolls themselves are nearly all made of either parchment (animal skin) or an early form of paper called 'papyrus'. The only exception is the scroll numbered 3Q15, which was created out of a combination of copper and tin. Known as the Copper Scroll, this curious document features letters chiselled onto metal - perhaps, as some have theorized, to better withstand the passage of time. One of the most intriguing manuscripts from Qumran, this is a sort of ancient treasure map that lists dozens of gold and silver caches. Using an unconventional vocabulary and odd spelling, it describes 64 underground hiding places that supposedly contain riches buried for safekeeping. None of these hoards have been recovered, possibly because the Romans pillaged Judea during the first century CE. According to various hypotheses, the treasure belonged to local people, or was rescued from the Second Temple before its destruction or never existed to begin with.

Some of the Dead Sea Scrolls have been on interesting journeys. In 1948, a Syrian Orthodox archbishop known as Mar Samuel acquired four of the original seven scrolls from a Jerusalem shoemaker and part-time antiquity dealer, paying less than $100 for them. He then travelled to the United States and unsuccessfully offered them to a number of universities, including Yale. Finally, in 1954, he placed an advertisement in the business newspaper The Wall Street Journal - under the category 'Miscellaneous Items for Sale' - that read: 'Biblical Manuscripts dating back to at least 200 B.C. are for sale. This would be an ideal gift to an educational or religious institution by an individual or group.' Fortunately, Israeli archaeologist and statesman Yigael Yadin negotiated their purchase and brought the scrolls back to Jerusalem, where they remain to this day.

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
                    "passage_text": """Two scientists consider the origins of discoveries and other innovative behaviour

Scientific discovery is popularly believed to result from the sheer genius of such intellectual stars as naturalist Charles Darwin and theoretical physicist Albert Einstein. Our view of such unique contributions to science often disregards the person's prior experience and the efforts of their lesser-known predecessors. Conventional wisdom also places great weight on insight in promoting breakthrough scientific achievements, as if ideas spontaneously pop into someone's head - fully formed and functional.

There may be some limited truth to this view. However, we believe that it largely misrepresents the real nature of scientific discovery, as well as that of creativity and innovation in many other realms of human endeavor.

Setting aside such greats as Darwin and Einstein - whose monumental contributions are duly celebrated - we suggest that innovation is more a process of trial and error, where two steps forward may sometimes come with one step back, as well as one or more steps to the right or left. This evolutionary view of human innovation undermines the notion of creative genius and recognizes the cumulative nature of scientific progress.

Consider one unheralded scientist: John Nicholson, a mathematical physicist working in the 1910s who postulated the existence of 'proto-elements' in outer space. By combining different numbers of weights of these proto-elements' atoms, Nicholson could recover the weights of all the elements in the then-known periodic table. These successes are all the more noteworthy given the fact that Nicholson was wrong about the presence of proto-elements: they do not actually exist. Yet, amid his often fanciful theories and wild speculations, Nicholson also proposed a novel theory about the structure of atoms. Niels Bohr, the Nobel prize-winning father of modern atomic theory, jumped off from this interesting idea to conceive his now-famous model of the atom.

What are we to make of this story? One might simply conclude that science is a collective and cumulative enterprise. That may be true, but there may be a deeper insight to be gleaned. We propose that science is constantly evolving, much as species of animals do. In biological systems, organisms may display new characteristics that result from random genetic mutations. In the same way, random, arbitrary or accidental mutations of ideas may help pave the way for advances in science. If mutations prove beneficial, then the animal or the scientific theory will continue to thrive and perhaps reproduce.

Support for this evolutionary view of behavioral innovation comes from many domains. Consider one example of an influential innovation in US horseracing. The so-called 'acey-deucy' stirrup placement, in which the rider's foot in his left stirrup is placed as much as 25 centimeters lower than the right, is believed to confer important speed advantages when turning on oval tracks. It was developed by a relatively unknown jockey named Jackie Westrope. Had Westrope conducted methodical investigations or examined extensive film records in a shrewd plan to outrun his rivals? Had he foreseen the speed advantage that would be conferred by riding acey-deucy? No. He suffered a leg injury, which left him unable to fully bend his left knee. His modification just happened to coincide with enhanced left-hand turning performance. This led to the rapid and widespread adoption of riding acey-deucy by many riders, a racing style which continues in today's thoroughbred racing.

Plenty of other stories show that fresh advances can arise from error, misadventure, and also pure serendipity - a happy accident. For example, in the early 1970s, two employees of the company 3M each had a problem: Spencer Silver had a product - a glue which was only slightly sticky - and no use for it, while his colleague Art Fry was trying to figure out how to affix temporary bookmarks in his hymn book without damaging its pages. The solution to both these problems was the invention of the brilliantly simple yet phenomenally successful Post-It note. Such examples give lie to the claim that ingenious, designing minds are responsible for human creativity and invention. Far more banal and mechanical forces may be at work; forces that are fundamentally connected to the laws of science.

The notions of insight, creativity and genius are often invoked, but they remain vague and of doubtful scientific utility, especially when one considers the diverse and enduring contributions of individuals such as Plato, Leonardo da Vinci, Shakespeare, Beethoven, Galileo, Newton, Kepler, Curie, Pasteur and Edison. These notions merely label rather than explain the evolution of human innovations. We need another approach, and there is a promising candidate.

The Law of Effect was advanced by psychologist Edward Thorndike in 1898, some 40 years after Charles Darwin published his groundbreaking work on biological evolution, On the Origin of Species. This simple law holds that organisms tend to repeat successful behaviors and to refrain from performing unsuccessful ones. Just like Darwin's Law of Natural Selection, the Law of Effect involves an entirely mechanical process of variation and selection, without any end objective in sight.

Of course, the origin of human innovation demands much further study. In particular, the provenance of the raw material on which the Law of Effect operates is not as clearly known as that of the genetic mutations on which the Law of Natural Selection operates. The generation of novel ideas and behaviors may not be entirely random, but constrained by prior successes and failures - of the current individual (such as Bohr) or of predecessors (such as Nicholson).

The time seems right for abandoning the naive notions of intelligent design and genius, and for scientifically exploring the true origins of creative behavior.""",
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
                    "task_type": "table_and_charts",
                    "instruction": "You should spend about 20 minutes on this task.\n\nThe table and charts below give information on the police budget for 2017 and 2018 in one area of Britain. The table shows where the money came from and the charts show how it was distributed.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                    "visual": {
                        "type": "table_and_pie_charts",
                        "description": "Police Budget 2017-2018",
                        "image_url": "/api/cambridge/images/ielts17/test2/test2_writing_task1.png",
                        "table_data": {
                            "title": "Police Budget 2017-2018 (in £m)",
                            "headers": ["Sources", "2017", "2018"],
                            "rows": [
                                ["National Government", "175.5", "177.8"],
                                ["Local Taxes", "91.2", "102.3"],
                                ["Other sources (eg grants)", "38.5", "38.5"],
                                ["Total", "304.7", "318.6"]
                            ]
                        },
                        "charts": [
                            {
                                "year": "2017",
                                "title": "How the money was spent",
                                "segments": [
                                    {"label": "Salaries (officers and staff)", "percentage": 75},
                                    {"label": "Technology", "percentage": 17},
                                    {"label": "Buildings and transport", "percentage": 8}
                                ]
                            },
                            {
                                "year": "2018",
                                "title": "How the money was spent",
                                "segments": [
                                    {"label": "Salaries (officers and staff)", "percentage": 69},
                                    {"label": "Technology", "percentage": 14},
                                    {"label": "Buildings and transport", "percentage": 17}
                                ]
                            }
                        ]
                    }
                },
                {
                    "task_number": 2,
                    "title": "Essay Writing",
                    "duration": "40 minutes",
                    "word_count": "at least 250 words",
                    "task_type": "causes_and_opinion",
                    "instruction": "You should spend about 40 minutes on this task.\n\nWrite about the following topic:",
                    "prompt": "Some children spend hours every day on their smartphones.\n\nWhy is this the case? Do you think this is a positive or a negative development?",
                    "requirements": "Give reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
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
                    "description": "The examiner asks you about yourself, your home, work or studies and other familiar topics.",
                    "topics": [
                        {
                            "topic": "Reading",
                            "questions": [
                                "Did you have a favourite book when you were a child? [Why/Why not?]",
                                "How much reading do you do for your work/studies? [Why/Why not?]",
                                "What kinds of books do you read for pleasure? [Why/Why not?]",
                                "Do you prefer to read a newspaper or a magazine online, or to buy a copy? [Why?]"
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
                    "topic_card": {
                        "instruction": "Describe a big city you would like to visit.",
                        "points": [
                            "which big city you would like to visit",
                            "how you would travel there",
                            "what you would do there"
                        ],
                        "final_prompt": "and explain why you would like to visit this big city."
                    },
                    "examiner_note": "You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish."
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "discussion_topics": [
                        {
                            "topic": "Visiting cities on holiday",
                            "questions": [
                                "What are the most interesting things to do while visiting cities on holiday?",
                                "Why can it be expensive to visit cities on holiday?",
                                "Do you think it is better to visit cities alone or in a group with friends?"
                            ]
                        },
                        {
                            "topic": "The growth of cities",
                            "questions": [
                                "Why have cities increased in size in recent years?",
                                "What are the challenges created by ever-growing cities?",
                                "In what ways do you think cities of the future will be different to cities today?"
                            ]
                        }
                    ]
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


# Attach official Cambridge audioscripts to the listening section so the
# results page can render the "Audioscript" modal + per-part panels.
try:
    from .audioscripts import IELTS17_AUDIOSCRIPTS as _A
except ImportError:
    from audioscripts import IELTS17_AUDIOSCRIPTS as _A
IELTS17_TEST2["sections"]["listening"]["transcripts"] = _A.get(2, {})
del _A
