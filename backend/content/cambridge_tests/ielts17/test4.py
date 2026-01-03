"""
Cambridge IELTS 17 - Test 4
Complete test content with all 4 skills
"""

IELTS17_TEST4 = {
    "test_id": "ielts17_test4",
    "book": "Cambridge IELTS 17",
    "test_number": 4,
    "title": "IELTS 17 - Test 4",
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
                    "title": "Easy Life Cleaning Services",
                    "question_range": "1-10",
                    "question_count": 10,
                    "context": "A phone conversation about cleaning services",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test4_part1.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Easy Life Cleaning Services",
                        "sections": [
                            {
                                "heading": "Basic cleaning package offered",
                                "items": [
                                    "Cleaning all surfaces",
                                    "Cleaning the ___1___ throughout the apartment",
                                    "Cleaning shower, sinks, toilet etc."
                                ]
                            },
                            {
                                "heading": "Additional services agreed",
                                "subsections": [
                                    {
                                        "name": "Every week",
                                        "items": [
                                            "Cleaning the ___2___",
                                            "Ironing clothes – ___3___ only"
                                        ]
                                    },
                                    {
                                        "name": "Every month",
                                        "items": [
                                            "Cleaning all the ___4___ from the inside",
                                            "Washing down the ___5___"
                                        ]
                                    }
                                ]
                            },
                            {
                                "heading": "Other possibilities",
                                "items": [
                                    "They can organise a plumber or an ___6___ if necessary.",
                                    "A special cleaning service is available for customers who are allergic to ___7___."
                                ]
                            },
                            {
                                "heading": "Information on the cleaners",
                                "items": [
                                    "Before being hired, all cleaners have a background check carried out by the ___8___.",
                                    "References are required.",
                                    "All cleaners are given ___9___ for two weeks.",
                                    "Customers send a ___10___ after each visit.",
                                    "Usually, each customer has one regular cleaner."
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
                    "title": "Hotel Staff Turnover",
                    "question_range": "11-20",
                    "question_count": 10,
                    "context": "A talk about reducing staff turnover in hotels",
                    "question_types": ["multiple_choice", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test4_part2.mp3",
                    "questions": [
                        {
                            "number": 11,
                            "type": "multiple_choice",
                            "question": "Many hotel managers are unaware that their staff often leave because of",
                            "options": [
                                "A: a lack of training.",
                                "B: long hours.",
                                "C: low pay."
                            ]
                        },
                        {
                            "number": 12,
                            "type": "multiple_choice",
                            "question": "What is the impact of high staff turnover on managers?",
                            "options": [
                                "A: an increased workload",
                                "B: low morale",
                                "C: an inability to meet targets"
                            ]
                        },
                        {
                            "number": 13,
                            "type": "multiple_choice",
                            "question": "What mistake should managers always avoid?",
                            "options": [
                                "A: failing to treat staff equally",
                                "B: reorganising shifts without warning",
                                "C: neglecting to have enough staff during busy periods"
                            ]
                        },
                        {
                            "number": 14,
                            "type": "multiple_choice",
                            "question": "What unexpected benefit did Dunwich Hotel notice after improving staff retention rates?",
                            "options": [
                                "A: a fall in customer complaints",
                                "B: an increase in loyalty club membership",
                                "C: a rise in spending per customer"
                            ]
                        },
                        {
                            "number": "15-20",
                            "type": "matching",
                            "instruction": "What approach did each hotel take to reduce staff turnover? Choose SIX answers from the box and write the correct letter, A-C, next to Questions 15-20.",
                            "options_box": {
                                "title": "Ways of reducing staff turnover",
                                "options": [
                                    "A: improving relationships and teamwork",
                                    "B: offering incentives and financial benefits",
                                    "C: providing career opportunities"
                                ]
                            },
                            "items": [
                                {"number": 15, "item": "The Sun Club"},
                                {"number": 16, "item": "The Portland"},
                                {"number": 17, "item": "Bluewater Hotels"},
                                {"number": 18, "item": "Pentlow Hotels"},
                                {"number": 19, "item": "Green Planet"},
                                {"number": 20, "item": "The Amesbury"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Sporting Activities Discussion",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "A discussion between two students about sporting equipment development",
                    "question_types": ["multiple_selection", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test4_part3.mp3",
                    "questions": [
                        {
                            "number": "21-22",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E.",
                            "question": "Which TWO points do Thomas and Jeanne make about Thomas's sporting activities at school?",
                            "options": [
                                "A: He should have felt more positive about them.",
                                "B: The training was too challenging for him.",
                                "C: He could have worked harder at them.",
                                "D: His parents were disappointed in him.",
                                "E: His fellow students admired him."
                            ],
                            "select_count": 2,
                            "items": [
                                {"number": 21},
                                {"number": 22}
                            ]
                        },
                        {
                            "number": "23-24",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E.",
                            "question": "Which TWO feelings did Thomas experience when he was in Kenya?",
                            "options": [
                                "A: disbelief",
                                "B: relief",
                                "C: stress",
                                "D: gratitude",
                                "E: homesickness"
                            ],
                            "select_count": 2,
                            "items": [
                                {"number": 23},
                                {"number": 24}
                            ]
                        },
                        {
                            "number": "25-30",
                            "type": "matching",
                            "instruction": "What comment do the students make about the development of each of the following items of sporting equipment? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.",
                            "options_box": {
                                "title": "Comments about the development of the equipment",
                                "options": [
                                    "A: It could cause excessive sweating.",
                                    "B: The material was being mass produced for another purpose.",
                                    "C: People often needed to make their own.",
                                    "D: It often had to be replaced.",
                                    "E: The material was expensive.",
                                    "F: It was unpopular among spectators.",
                                    "G: It caused injuries.",
                                    "H: No one using it liked it at first."
                                ]
                            },
                            "items": [
                                {"number": 25, "item": "the table tennis bat"},
                                {"number": 26, "item": "the cricket helmet"},
                                {"number": 27, "item": "the cycle helmet"},
                                {"number": 28, "item": "the golf club"},
                                {"number": 29, "item": "the hockey stick"},
                                {"number": 30, "item": "the football"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Maple Syrup",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "A lecture about maple syrup production",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test4_part4.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Maple Syrup",
                        "sections": [
                            {
                                "heading": "What is maple syrup?",
                                "items": [
                                    "made from the sap of the maple tree",
                                    "added to food or used in cooking",
                                    "colour described as ___31___",
                                    "very ___32___ compared to refined sugar"
                                ]
                            },
                            {
                                "heading": "The maple tree",
                                "items": [
                                    "has many species",
                                    "needs sunny days and cool nights",
                                    "maple leaf has been on the Canadian flag since 1964",
                                    "needs moist soil but does not need fertiliser as well",
                                    "best growing conditions and ___33___ are in Canada and North America"
                                ]
                            },
                            {
                                "heading": "Early maple sugar producers",
                                "items": [
                                    "made holes in the tree trunks",
                                    "used hot ___34___ to heat the sap",
                                    "used tree bark to make containers for collection",
                                    "sweetened food and drink with sugar"
                                ]
                            },
                            {
                                "heading": "Today's maple syrup",
                                "subsections": [
                                    {
                                        "name": "The trees",
                                        "items": [
                                            "Tree trunks may not have the correct ___35___ until they have been growing for 40 years.",
                                            "The changing temperature and movement of water within the tree produces the sap."
                                        ]
                                    },
                                    {
                                        "name": "The production",
                                        "items": [
                                            "A tap is drilled into the trunk and a ___36___ carries the sap into a bucket.",
                                            "Large pans of sap called evaporators are heated by means of a ___37___.",
                                            "A lot of ___38___ is produced during the evaporation process.",
                                            "'Sugar sand' is removed because it makes the syrup look ___39___ and affects the taste.",
                                            "The syrup is ready for use.",
                                            "A huge quantity of sap is needed to make a ___40___ of maple syrup."
                                        ]
                                    }
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
                    "title": "Bats to the rescue",
                    "subtitle": "How Madagascar's bats are helping to save the rainforest",
                    "question_range": "1-13",
                    "question_count": 13,
                    "time_recommendation": "20 minutes",
                    "passage_text": """Bats to the rescue
How Madagascar's bats are helping to save the rainforest

There are few places in the world where relations between agriculture and conservation are more strained. Madagascar's forests are being converted to agricultural land at a rate of one percent every year. Much of this destruction is fuelled by the cultivation of the country's main staple crop: rice. And a key reason for this destruction is that insect pests are destroying vast quantities of what is grown by local subsistence farmers, leading them to clear forest to create new paddy fields. The result is devastating habitat and biodiversity loss on the island, but not all species are suffering. In fact, some of the island's insectivorous bats are currently thriving and this has important implications for farmers and conservationists alike.

Enter University of Cambridge zoologist Ricardo Rocha. He's passionate about conservation, and bats. More specifically, he's interested in how bats are responding to human activity and deforestation in particular. Rocha's new study shows that several species of bats are giving Madagascar's rice farmers a vital pest control service by feasting on plagues of insects. And this, he believes, can ease the financial pressure on farmers to turn forest into fields.

Bats comprise roughly one-fifth of all mammal species in Madagascar and thirty-six recorded bat species are native to the island, making it one of the most important regions for conservation of this animal group anywhere in the world.

Co-leading an international team of scientists, Rocha found that several species of indigenous bats are taking advantage of habitat modification to hunt insects swarming above the country's rice fields. They include the Malagasy mouse-eared bat, Major's long-fingered bat, the Malagasy white-bellied free-tailed bat and Peters' wrinkle-lipped bat.

'These winner species are providing a valuable free service to Madagascar as biological pest suppressors,' says Rocha. 'We found that six species of bat are preying on rice pests, including the paddy swarming caterpillar and grass webworm. The damage which these insects cause puts the island's farmers under huge financial pressure and that encourages deforestation.'

The study, now published in the journal Agriculture, Ecosystems and Environment, set out to investigate the feeding activity of insectivorous bats in the farmland bordering the Ranomafana National Park in the southeast of the country.

Rocha and his team used state-of-the-art ultrasonic recorders to record over a thousand bat 'feeding buzzes' (echolocation sequences used by bats to target their prey) at 54 sites, in order to identify the favourite feeding spots of the bats. They next used DNA barcoding techniques to analyse droppings collected from bats at the different sites.

The recordings revealed that bat activity over rice fields was much higher than it was in continuous forest – seven times higher over rice fields which were on flat ground, and sixteen times higher over fields on the sides of hills – leaving no doubt that the animals are preferentially foraging in these man-made ecosystems. The researchers suggest that the bats favour these fields because lack of water and nutrient run-off make these crops more susceptible to insect pest infestations. DNA analysis showed that all six species of bat had fed on economically important insect pests. While the findings indicated that rice farming benefits most from the bats, the scientists also found indications that the bats were consuming pests of other crops, including the black twig borer (which infests coffee plants), the sugarcane cicada, the macadamia nut-borer, and the sober tabby (a pest of citrus fruits).

'The effectiveness of bats as pest controllers has already been proven in the USA and Catalonia,' said co-author James Kemp, from the University of Lisbon. 'But our study is the first to show this happening in Madagascar, where the stakes for both farmers and conservationists are so high.'

Local people may have a further reason to be grateful to their bats. While the animal is often associated with spreading disease, Rocha and his team found evidence that Malagasy bats feed not just on crop pests but also on mosquitoes – carriers of malaria, Rift Valley fever virus and elephantiasis – as well as blackflies, which spread river blindness.

Rocha points out that the relationship is complicated. When food is scarce, bats become a crucial source of protein for local people. Even the children will hunt them. And as well as roosting in trees, the bats sometimes roost in buildings, but are not welcomed there because they make them unclean. At the same time, however, they are associated with sacred caves and the ancestors, so they can be viewed as beings between worlds, which makes them very significant in the culture of the people. And one potential problem is that while these bats are benefiting from farming, at the same time deforestation is reducing the places where they can roost, which could have long-term effects on their numbers. Rocha says, 'With the right help, we hope that farmers can promote this mutually beneficial relationship by installing bat houses.'

Rocha and his colleagues believe that maximising bat populations can help to boost crop yields and promote sustainable livelihoods. The team is now calling for further research to quantify this contribution. 'I'm very optimistic,' says Rocha. 'If we give nature a hand, we can speed up the process of regeneration.'""",
                    "questions": [
                        {
                            "number": "1-6",
                            "type": "true_false_not_given",
                            "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
                            "statements": [
                                {"number": 1, "statement": "Many Madagascan forests are being destroyed by attacks from insects."},
                                {"number": 2, "statement": "Loss of habitat has badly affected insectivorous bats in Madagascar."},
                                {"number": 3, "statement": "Ricardo Rocha has carried out studies of bats in different parts of the world."},
                                {"number": 4, "statement": "Habitat modification has resulted in indigenous bats in Madagascar becoming useful to farmers."},
                                {"number": 5, "statement": "The Malagasy mouse-eared bat is more common than other indigenous bat species in Madagascar."},
                                {"number": 6, "statement": "Bats may feed on paddy swarming caterpillars and grass webworms."}
                            ]
                        },
                        {
                            "number": "7-13",
                            "type": "note_completion",
                            "instruction": "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
                            "visual": {
                                "title": "The study carried out by Rocha's team",
                                "sections": [
                                    {
                                        "heading": "Aim",
                                        "items": [
                                            "to investigate the feeding habits of bats in farmland near the Ranomafana National Park"
                                        ]
                                    },
                                    {
                                        "heading": "Method",
                                        "items": [
                                            "ultrasonic recording to identify favourite feeding spots",
                                            "DNA analysis of bat ___7___"
                                        ]
                                    },
                                    {
                                        "heading": "Findings: the bats",
                                        "items": [
                                            "were most active in rice fields located on hills",
                                            "ate pests of rice, ___8___, sugarcane, nuts and fruit",
                                            "prevent the spread of disease by eating ___9___ and blackflies"
                                        ]
                                    },
                                    {
                                        "heading": "Local attitudes to bats are mixed",
                                        "items": [
                                            "they provide food rich in ___10___",
                                            "the buildings where they roost become ___11___",
                                            "they play an important role in local ___12___"
                                        ]
                                    },
                                    {
                                        "heading": "Recommendation",
                                        "items": [
                                            "farmers should provide special ___13___ to support the bat population"
                                        ]
                                    }
                                ]
                            }
                        }
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Does education fuel economic growth?",
                    "question_range": "14-26",
                    "question_count": 13,
                    "time_recommendation": "20 minutes",
                    "passage_text": """Does education fuel economic growth?

A
Over the last decade, a huge database about the lives of southwest German villagers between 1600 and 1900 has been compiled by a team led by Professor Sheilagh Ogilvie at Cambridge University's Faculty of Economics. It includes court records, guild ledgers, parish registers, village censuses, tax lists and – the most recent addition – 9,000 handwritten inventories listing over a million personal possessions belonging to ordinary women and men across three centuries. Ogilvie, who discovered the inventories in the archives of two German communities 30 years ago, believes they may hold the answer to a conundrum that has long puzzled economists: the lack of evidence for a causal link between education and a country's economic growth.

B
As Ogilvie explains, 'Education helps us to work more productively, invent better technology, and earn more … surely it must be critical for economic growth? But, if you look back through history, there's no evidence that having a high literacy rate made a country industrialise earlier.' Between 1600 and 1900, England had only mediocre literacy rates by European standards, yet its economy grew fast and it was the first country to industrialise. During this period, Germany and Scandinavia had excellent literacy rates, but their economies grew slowly and they industrialised late. 'Modern cross-country analyses have also struggled to find evidence that education causes economic growth, even though there is plenty of evidence that growth increases education,' she adds.

C
In the handwritten inventories that Ogilvie is analysing are the belongings of women and men at marriage, remarriage and death. From badger skins to Bibles, sewing machines to scarlet bodices – the villagers' entire worldly goods are included. Inventories of agricultural equipment and craft tools reveal economic activities; ownership of books and education related objects like pens and slates suggests how people learned. In addition, the tax lists included in the database record the value of farms, workshops, assets and debts; signatures and people's estimates of their age indicate literacy and numeracy levels; and court records reveal obstacles (such as the activities of the guilds*) that stifled industry.

Previous studies usually had just one way of linking education with economic growth – the presence of schools and printing presses, perhaps, or school enrolment, or the ability to sign names. According to Ogilvie, the database provides multiple indicators for the same individuals, making it possible to analyse links between literacy, numeracy, wealth, and industriousness, for individual women and men over the long term.

* guild: an association of artisans or merchants which oversees the practice of their craft or trade in a particular area

D
Ogilvie and her team have been building the vast database of material possessions on top of their full demographic reconstruction of the people who lived in these two German communities. 'We can follow the same people – and their descendants – across 300 years of educational and economic change,' she says. Individual lives have unfolded before their eyes. Stories like that of the 24-year-olds Ana Regina and Magdalena Riethmüllerin, who were chastised in 1707 for reading books in church instead of listening to the sermon. 'This tells us they were continuing to develop their reading skills at least a decade after leaving school,' explains Ogilvie. The database also reveals the case of Juliana Schweickherdt, a 50-year-old spinster living in the small Black Forest community of Wildberg, who was reprimanded in 1752 by the local weavers' guild for 'weaving cloth and combing wool, counter to the guild ordinance'. When Juliana continued taking jobs reserved for male guild members, she was summoned before the guild court and told to pay a fine equivalent to one third of a servant's annual wage. It was a small act of defiance by today's standards, but it reflects a time when laws in Germany and elsewhere regulated people's access to labour markets. The dominance of guilds not only prevented people from using their skills, but also held back even the simplest industrial innovation.

E
The data-gathering phase of the project has been completed and now, according to Ogilvie, it is time 'to ask the big questions'. One way to look at whether education causes economic growth is to 'hold wealth constant'. This involves following the lives of different people with the same level of wealth over a period of time. If wealth is constant, it is possible to discover whether education was, for example, linked to the cultivation of new crops, or to the adoption of industrial innovations like sewing machines. The team will also ask what aspect of education helped people engage more with productive and innovative activities. Was it, for instance, literacy, numeracy, book ownership, years of schooling? Was there a threshold level – a tipping point – that needed to be reached to affect economic performance?

F
Ogilvie hopes to start finding answers to these questions over the next few years. One thing is already clear, she says: the relationship between education and economic growth is far from straightforward. 'German-speaking central Europe is an excellent laboratory for testing theories of economic growth,' she explains. Between 1600 and 1900, literacy rates and book ownership were high and yet the region remained poor. It was also the case that local guilds and merchant associations were extremely powerful and legislated against anything that undermined their monopolies. In villages throughout the region, guilds blocked labour migration and resisted changes that might reduce their influence.

'Early findings suggest that the potential benefits of education for the economy can be held back by other barriers, and this has implications for today,' says Ogilvie. 'Huge amounts are spent improving education in developing countries, but this spending can fail to deliver economic growth if restrictions block people – especially women and the poor – from using their education in economically productive ways. If economic institutions are poorly set up, for instance, education can't lead to growth.'""",
                    "paragraphs": [
                        {"letter": "A"},
                        {"letter": "B"},
                        {"letter": "C"},
                        {"letter": "D"},
                        {"letter": "E"},
                        {"letter": "F"}
                    ],
                    "questions": [
                        {
                            "number": "14-18",
                            "type": "section_matching",
                            "instruction": "Reading Passage 2 has six sections, A-F. Which section contains the following information? Write the correct letter, A-F, in boxes 14-18 on your answer sheet.",
                            "items": [
                                {"number": 14, "item": "an explanation of the need for research to focus on individuals with a fairly consistent income"},
                                {"number": 15, "item": "examples of the sources the database has been compiled from"},
                                {"number": 16, "item": "an account of one individual's refusal to obey an order"},
                                {"number": 17, "item": "a reference to a region being particularly suited to research into the link between education and economic growth"},
                                {"number": 18, "item": "examples of the items included in a list of personal possessions"}
                            ]
                        },
                        {
                            "number": "19-22",
                            "type": "sentence_completion",
                            "instruction": "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
                            "title": "Demographic reconstruction of two German communities",
                            "items": [
                                {"number": 19, "text": "The database that Ogilvie and her team has compiled sheds light on the lives of a range of individuals, as well as those of their ___19___, over a 300-year period."},
                                {"number": 20, "text": "For example, Ana Regina and Magdalena Riethmüllerin were reprimanded for reading while they should have been paying attention to a ___20___."},
                                {"number": 21, "text": "There was also Juliana Schweickherdt, who came to the notice of the weavers' guild in the year 1752 for breaking guild rules. As a punishment, she was later given a ___21___."},
                                {"number": 22, "text": "Cases like this illustrate how the guilds could prevent ___22___ and stop skilled people from working."}
                            ]
                        },
                        {
                            "number": "23-24",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E.",
                            "question": "Which TWO of the following statements does the writer make about literacy rates in Section B?",
                            "options": [
                                "A: Very little research has been done into the link between high literacy rates and improved earnings.",
                                "B: Literacy rates in Germany between 1600 and 1900 were very good.",
                                "C: There is strong evidence that high literacy rates in the modern world result in economic growth.",
                                "D: England is a good example of how high literacy rates helped a country industrialise.",
                                "E: Economic growth can help to improve literacy rates."
                            ],
                            "select_count": 2,
                            "items": [
                                {"number": 23},
                                {"number": 24}
                            ]
                        },
                        {
                            "number": "25-26",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E.",
                            "question": "Which TWO of the following statements does the writer make in Section F about guilds in German-speaking Central Europe between 1600 and 1900?",
                            "options": [
                                "A: They helped young people to learn a skill.",
                                "B: They were opposed to people moving to an area for work.",
                                "C: They kept better records than guilds in other parts of the world.",
                                "D: They opposed practices that threatened their control over a trade.",
                                "E: They predominantly consisted of wealthy merchants."
                            ],
                            "select_count": 2,
                            "items": [
                                {"number": 25},
                                {"number": 26}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Timur Gareyev – blindfold chess champion",
                    "question_range": "27-40",
                    "question_count": 14,
                    "time_recommendation": "20 minutes",
                    "passage_text": """Timur Gareyev – blindfold chess champion

A
Next month, a chess player named Timur Gareyev will take on nearly 50 opponents at once. But that is not the hard part. While his challengers will play the games as normal, Gareyev himself will be blindfolded. Even by world record standards, it sets a high bar for human performance. The 28-year-old already stands out in the rarefied world of blindfold chess. He has a fondness for bright clothes and unusual hairstyles, and he gets his kicks from the adventure sport of BASE jumping. He has already proved himself a strong chess player, too. In a 10-hour chess marathon in 2013, Gareyev played 33 games in his head simultaneously. He won 29 and lost none. The skill has become his brand: he calls himself the Blindfold King.

B
But Gareyev's prowess has drawn interest from beyond the chess-playing community. In the hope of understanding how he and others like him can perform such mental feats, researchers at the University of California in Los Angeles (UCLA) called him in for tests. They now have their first results. 'The ability to play a game of chess with your eyes closed is not a far reach for most accomplished players,' said Jesse Rissman, who runs a memory lab at UCLA. 'But the thing that's so remarkable about Timur and a few other individuals is the number of games they can keep active at once. To me it is simply astonishing.'

C
Gareyev learned to play chess in his native Uzbekistan when he was six years old. Tutored by his grandfather, he entered his first tournament aged eight and soon became obsessed with competitions. At 16, he was crowned Asia's youngest ever chess grandmaster. He moved to the US soon after, and as a student helped his university win its first national chess championship. In 2013, Gareyev was ranked the third best chess player in the US.

D
To the uninitiated, blindfold chess seems to call for superhuman skill. But displays of the feat go back centuries. The first recorded game in Europe was played in 13th-century Florence. In 1947, the Argentinian grandmaster Miguel Najdorf played 45 simultaneous games in his mind, winning 39 in the 24-hour session.

E
Accomplished players can develop the skill of playing blind even without realising it. The nature of the game is to run through possible moves in the mind to see how they play out. From this, regular players develop a memory for the patterns the pieces make, the defences and attacks. 'You recreate it in your mind,' said Gareyev. 'A lot of players are capable of doing what I'm doing.' The real mental challenge comes from playing multiple games at once in the head. Not only must the positions of each piece on every board be memorised, they must be recalled faithfully when needed, updated with each player's moves, and then reliably stored again, so the brain can move on to the next board. First moves can be tough to remember because they are fairly uninteresting. But the ends of games are taxing too, as exhaustion sets in. When Gareyev is tired, his recall can get patchy. He sometimes makes moves based on only a fragmented memory of the pieces' positions.

F
The scientists first had Gareyev perform some standard memory tests. These assessed his ability to hold numbers, pictures and words in mind. One classic test measures how many numbers a person can repeat, both forwards and backwards, soon after hearing them. Most people manage about seven. 'He was not exceptional on any of these standard tests,' said Rissman. 'We didn't find anything other than playing chess that he seems to be supremely gifted at.' But next came the brain scans. With Gareyev lying down in the machine, Rissman looked at how well connected the various regions of the chess player's brain were. Though the results are tentative and as yet unpublished, the scans found much greater than average communication between parts of Gareyev's brain that make up what is called the frontoparietal control network. Of 63 people scanned alongside the chess player, only one or two scored more highly on the measure. 'You use this network in almost any complex task. It helps you to allocate attention, keep rules in mind, and work out whether you should be responding or not,' said Rissman.

G
It was not the only hint of something special in Gareyev's brain. The scans also suggest that Gareyev's visual network is more highly connected to other brain parts than usual. Initial results suggest that the areas of his brain that process visual images – such as chess boards – may have stronger links to other brain regions, and so be more powerful than normal. While the analyses are not finalised yet, they may hold the first clues to Gareyev's extraordinary ability.

H
For the world record attempt, Gareyev hopes to play 47 blindfold games at once in about 16 hours. He will need to win 80% to claim the title. 'I don't worry too much about the winning percentage, that's never been an issue for me,' he said. 'The most important part of blindfold chess for me is that I have found the one thing that I can fully dedicate myself to. I miss having an obsession.'""",
                    "paragraphs": [
                        {"letter": "A"},
                        {"letter": "B"},
                        {"letter": "C"},
                        {"letter": "D"},
                        {"letter": "E"},
                        {"letter": "F"},
                        {"letter": "G"},
                        {"letter": "H"}
                    ],
                    "questions": [
                        {
                            "number": "27-32",
                            "type": "section_matching",
                            "instruction": "Reading Passage 3 has eight paragraphs, A-H. Which paragraph contains the following information? Write the correct letter, A-H, in boxes 27-32 on your answer sheet.",
                            "items": [
                                {"number": 27, "item": "a reference to earlier examples of blindfold chess"},
                                {"number": 28, "item": "an outline of what blindfold chess involves"},
                                {"number": 29, "item": "a claim that Gareyev's skill is limited to chess"},
                                {"number": 30, "item": "why Gareyev's skill is of interest to scientists"},
                                {"number": 31, "item": "an outline of Gareyev's priorities"},
                                {"number": 32, "item": "a reason why the last part of a game may be difficult"}
                            ]
                        },
                        {
                            "number": "33-36",
                            "type": "true_false_not_given",
                            "instruction": "Do the following statements agree with the information given in Reading Passage 3? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
                            "statements": [
                                {"number": 33, "statement": "In the forthcoming games, all the participants will be blindfolded."},
                                {"number": 34, "statement": "Gareyev has won competitions in BASE jumping."},
                                {"number": 35, "statement": "UCLA is the first university to carry out research into blindfold chess players."},
                                {"number": 36, "statement": "Good chess players are likely to be able to play blindfold chess."}
                            ]
                        },
                        {
                            "number": "37-40",
                            "type": "summary_completion",
                            "instruction": "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
                            "title": "How the research was carried out",
                            "summary_text": "The researchers started by testing Gareyev's ___37___; for example, he was required to recall a string of ___38___ in order and also in reverse order. Although his performance was normal, scans showed an unusual amount of ___39___ within the areas of Gareyev's brain that are concerned with directing attention. In addition, the scans raised the possibility of unusual strength in the parts of his brain that deal with ___40___ input.",
                            "items": [
                                {"number": 37, "gap": "___37___"},
                                {"number": 38, "gap": "___38___"},
                                {"number": 39, "gap": "___39___"},
                                {"number": 40, "gap": "___40___"}
                            ]
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
                    "title": "Writing Task 1",
                    "time_recommendation": "20 minutes",
                    "minimum_words": 150,
                    "task_type": "line_graph",
                    "prompt": "The line graph shows trends in shop closures and openings of new shops in a particular country between the years 2011 and 2018.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                    "visual": {
                        "type": "line_graph",
                        "title": "Shop closures and openings, 2011-2018",
                        "description": "A line graph with two lines showing shop closures (decreasing then increasing) and shop openings (increasing then decreasing) from 2011 to 2018",
                        "image_url": "/api/cambridge/images/ielts17/test4/test4_writing_task1.png"
                    }
                },
                {
                    "task_number": 2,
                    "title": "Writing Task 2",
                    "time_recommendation": "40 minutes",
                    "minimum_words": 250,
                    "task_type": "opinion_essay",
                    "prompt": "Nowadays, a growing number of people with health problems are trying alternative medicines and treatments instead of visiting their usual doctor.\n\nDo you think this is a positive or a negative development?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
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
                    "topic": "Maps",
                    "audio_only": True,
                    "questions": [
                        "Do you think it's better to use a paper map or a map on your phone? [Why?]",
                        "When was the last time you needed to use a map? [Why/Why not?]",
                        "If you visit a new city, do you always use a map to find your way around? [Why/Why not?]",
                        "In general, do you find it easy to read maps? [Why/Why not?]"
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "description": "You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
                    "task_card": {
                        "instruction": "Describe an occasion when you had to do something in a hurry.",
                        "bullets": [
                            "what you had to do",
                            "why you had to do this in a hurry",
                            "how well you did this",
                            "and explain how you felt about having to do this in a hurry."
                        ],
                        "timing_note": "You will have to talk about this topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish."
                    }
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "description": "Discussion topics related to Part 2",
                    "audio_only": True,
                    "topics": [
                        {
                            "topic": "Arriving late",
                            "questions": [
                                "Do you think it's OK to arrive late when meeting a friend?",
                                "What should happen to people who arrive late for work?",
                                "Can you suggest how people can make sure they don't arrive late?"
                            ]
                        },
                        {
                            "topic": "Managing study time",
                            "questions": [
                                "Is it better to study for long periods or in shorter blocks of time?",
                                "What are the likely effects of students not managing their study time well?",
                                "How important is it for students to have enough leisure time?"
                            ]
                        }
                    ]
                }
            ]
        }
    },
    "answer_keys": {
        "listening": {
            "1": "floors",
            "2": "oven",
            "3": "shirts",
            "4": "windows",
            "5": "balcony",
            "6": "electrician",
            "7": "dust",
            "8": "police",
            "9": "training",
            "10": "report",
            "11": "C",
            "12": "A",
            "13": "A",
            "14": "C",
            "15": "B",
            "16": "C",
            "17": "A",
            "18": "B",
            "19": "C",
            "20": "A",
            "21": "A",
            "22": "C",
            "23": "A",
            "24": "D",
            "25": "D",
            "26": "G",
            "27": "B",
            "28": "E",
            "29": "C",
            "30": "H",
            "31": "golden",
            "32": "healthy",
            "33": "climate",
            "34": "stones",
            "35": "diameter",
            "36": "tube",
            "37": "fire",
            "38": "steam",
            "39": "cloudy",
            "40": "litre"
        },
        "reading": {
            "1": "FALSE",
            "2": "FALSE",
            "3": "NOT GIVEN",
            "4": "TRUE",
            "5": "NOT GIVEN",
            "6": "TRUE",
            "7": "droppings",
            "8": "coffee",
            "9": "mosquitoes",
            "10": "protein",
            "11": "unclean",
            "12": "culture",
            "13": "houses",
            "14": "E",
            "15": "C",
            "16": "D",
            "17": "F",
            "18": "C",
            "19": "descendants",
            "20": "sermon",
            "21": "fine",
            "22": "innovation",
            "23": "B",
            "24": "E",
            "25": "B",
            "26": "D",
            "27": "D",
            "28": "E",
            "29": "F",
            "30": "B",
            "31": "H",
            "32": "E",
            "33": "FALSE",
            "34": "NOT GIVEN",
            "35": "NOT GIVEN",
            "36": "TRUE",
            "37": "memory",
            "38": "communication",
            "39": "visual",
            "40": "board"
        }
    }
}
