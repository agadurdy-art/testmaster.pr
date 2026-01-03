"""
Cambridge IELTS 17 - Test 3
Official test content in correct IELTS format
"""

IELTS17_TEST3 = {
    "test_id": "ielts17_test3",
    "book": "Cambridge IELTS 17",
    "test_number": 3,
    "title": "IELTS 17 - Test 3",
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
                    "title": "Advice on surfing holidays",
                    "question_range": "1-10",
                    "question_count": 10,
                    "context": "A conversation about surfing holidays in Ireland",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test3_part1.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Advice on surfing holidays",
                        "sections": [
                            {
                                "heading": "Jack's advice",
                                "items": [
                                    "Recommends surfing for ___1___ holidays in the summer",
                                    "Need to be quite ___2___"
                                ]
                            },
                            {
                                "heading": "Irish surfing locations",
                                "subsections": [
                                    {
                                        "name": "County Clare",
                                        "items": [
                                            "Lahinch has some good quality ___3___ and surf schools",
                                            "There are famous cliffs nearby"
                                        ]
                                    },
                                    {
                                        "name": "County Mayo",
                                        "items": [
                                            "Good surf school at ___4___ beach",
                                            "Surf camp lasts for one ___5___",
                                            "Can also explore the local ___6___ by kayak"
                                        ]
                                    }
                                ]
                            },
                            {
                                "heading": "Weather",
                                "items": [
                                    "Best month to go: ___7___",
                                    "Average temperature in summer: approx. ___8___ degrees"
                                ]
                            },
                            {
                                "heading": "Costs",
                                "subsections": [
                                    {
                                        "name": "Equipment",
                                        "items": [
                                            "Wetsuit and surfboard: ___9___ euros per day",
                                            "Also advisable to hire ___10___ for warmth"
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
                    "title": "Extended hours childcare service",
                    "question_range": "11-20",
                    "question_count": 10,
                    "context": "Information about a school's extended hours childcare service",
                    "question_types": ["multiple_selection", "multiple_choice", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test3_part2.mp3",
                    "questions": [
                        {
                            "number": "11-12",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E.",
                            "question": "Which TWO facts are given about the school's extended hours childcare service?",
                            "options": [
                                "A: It started recently.",
                                "B: More children attend after school than before school.",
                                "C: An average of 50 children attend in the mornings.",
                                "D: A child cannot attend both the before and after school sessions.",
                                "E: The maximum number of children who can attend is 70."
                            ],
                            "select_count": 2
                        },
                        {
                            "number": 13,
                            "type": "multiple_choice",
                            "question": "How much does childcare cost for a complete afternoon session per child?",
                            "options": [
                                "A: £3.50",
                                "B: £5.70",
                                "C: £7.20"
                            ]
                        },
                        {
                            "number": 14,
                            "type": "multiple_choice",
                            "question": "What does the manager say about food?",
                            "options": [
                                "A: Children with allergies should bring their own food.",
                                "B: Children may bring healthy snacks with them.",
                                "C: Children are given a proper meal at 5 p.m."
                            ]
                        },
                        {
                            "number": 15,
                            "type": "multiple_choice",
                            "question": "What is different about arrangements in the school holidays?",
                            "options": [
                                "A: Children from other schools can attend.",
                                "B: Older children can attend.",
                                "C: A greater number of children can attend."
                            ]
                        },
                        {
                            "number": "16-20",
                            "type": "matching",
                            "instruction": "What information is given about each of the following activities on offer? Choose FIVE answers from the box and write the correct letter, A-G, next to Questions 16-20.",
                            "options_box": {
                                "title": "Information",
                                "options": [
                                    "A: has limited availability",
                                    "B: is no longer available",
                                    "C: is for over 8s only",
                                    "D: requires help from parents",
                                    "E: involves an additional fee",
                                    "F: is a new activity",
                                    "G: was requested by children"
                                ]
                            },
                            "items": [
                                {"number": 16, "item": "Spanish"},
                                {"number": 17, "item": "Music"},
                                {"number": 18, "item": "Painting"},
                                {"number": 19, "item": "Yoga"},
                                {"number": 20, "item": "Cooking"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Holly's Work Placement Tutorial",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "A tutorial discussion about a work placement at a stadium",
                    "question_types": ["multiple_choice", "matching"],
                    "audio_file": "/api/audio/cambridge/ielts17/test3_part3.mp3",
                    "questions": [
                        {
                            "number": 21,
                            "type": "multiple_choice",
                            "question": "Holly has chosen the Orion Stadium placement because",
                            "options": [
                                "A: it involves children.",
                                "B: it is outdoors.",
                                "C: it sounds like fun."
                            ]
                        },
                        {
                            "number": 22,
                            "type": "multiple_choice",
                            "question": "Which aspect of safety does Dr Green emphasise most?",
                            "options": [
                                "A: ensuring children stay in the stadium",
                                "B: checking the equipment children will use",
                                "C: removing obstacles in changing rooms"
                            ]
                        },
                        {
                            "number": 23,
                            "type": "multiple_choice",
                            "question": "What does Dr Green say about the spectators?",
                            "options": [
                                "A: They can be hard to manage.",
                                "B: They make useful volunteers.",
                                "C: They shouldn't take photographs."
                            ]
                        },
                        {
                            "number": 24,
                            "type": "multiple_choice",
                            "question": "What has affected the schedule in the past?",
                            "options": [
                                "A: bad weather",
                                "B: an injury",
                                "C: extra time"
                            ]
                        },
                        {
                            "number": "25-30",
                            "type": "matching",
                            "instruction": "What do Holly and her tutor agree is an important aspect of each of the following events management skills? Choose SIX answers from the box and write the correct letter, A-H, next to Questions 25-30.",
                            "options_box": {
                                "title": "Important aspects",
                                "options": [
                                    "A: being flexible",
                                    "B: focusing on details",
                                    "C: having a smart appearance",
                                    "D: hiding your emotions",
                                    "E: relying on experts",
                                    "F: trusting your own views",
                                    "G: doing one thing at a time",
                                    "H: thinking of the future"
                                ]
                            },
                            "items": [
                                {"number": 25, "item": "Communication"},
                                {"number": 26, "item": "Organisation"},
                                {"number": 27, "item": "Time management"},
                                {"number": 28, "item": "Creativity"},
                                {"number": 29, "item": "Leadership"},
                                {"number": 30, "item": "Networking"}
                            ]
                        }
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Bird Migration Theory",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "A lecture about the history of bird migration theories",
                    "question_types": ["note_completion"],
                    "audio_file": "/api/audio/cambridge/ielts17/test3_part4.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Bird Migration Theory",
                        "sections": [
                            {
                                "heading": "Introduction",
                                "items": [
                                    "Most birds are believed to migrate seasonally."
                                ]
                            },
                            {
                                "heading": "Hibernation theory",
                                "items": [
                                    "It was believed that birds hibernated underwater or buried themselves in ___31___.",
                                    "This theory was later disproved by experiments on caged birds."
                                ]
                            },
                            {
                                "heading": "Transmutation theory",
                                "items": [
                                    "Aristotle believed birds changed from one species into another in summer and winter.",
                                    "In autumn he observed that redstarts experience the loss of ___32___ and thought they then turned into robins.",
                                    "Aristotle's assumptions were logical because the two species of birds had a similar ___33___."
                                ]
                            },
                            {
                                "heading": "17th century",
                                "items": [
                                    "Charles Morton popularised the idea that birds fly to the ___34___ in winter."
                                ]
                            },
                            {
                                "heading": "Scientific developments",
                                "items": [
                                    "In 1822, a stork was killed in Germany which had an African spear in its ___35___.",
                                    "Previously there had been no ___36___ that storks migrate to Africa.",
                                    "Little was known about the ___37___ and journeys of migrating birds until the practice of ringing was established.",
                                    "It was thought large birds carried small birds on some journeys because they were considered incapable of travelling across huge ___38___.",
                                    "Ringing depended on what is called the ___39___ of dead birds.",
                                    "In 1931, the first ___40___ to show the migration of European birds was printed."
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
                    "title": "The thylacine",
                    "question_range": "1-13",
                    "question_count": 13,
                    "time_recommendation": "20 minutes",
                    "passage_intro": "The extinct thylacine, also known as the Tasmanian tiger, was a marsupial that bore a superficial resemblance to a dog.",
                    "passage_text": """The extinct thylacine, also known as the Tasmanian tiger, was a marsupial* that bore a superficial resemblance to a dog. Its most distinguishing feature was the 13-19 dark brown stripes over its back, beginning at the rear of the body and extending onto the tail. The thylacine's average nose-to-tail length for adult males was 162.6 cm, compared to 153.7 cm for females.

The thylacine appeared to occupy most types of terrain except dense rainforest, with open eucalyptus forest thought to be its prime habitat. In terms of feeding, it was exclusively carnivorous, and its stomach was muscular with an ability to distend so that it could eat large amounts of food at one time, probably an adaptation to compensate for long periods when hunting was unsuccessful and food scarce. The thylacine was not a fast runner and probably caught its prey by exhausting it during a long pursuit. During long-distance chases, thylacines were likely to have relied more on scent than any other sense. They emerged to hunt during the evening, night and early morning and tended to retreat to the hills and forest for shelter during the day. Despite the common name 'tiger', the thylacine had a shy, nervous temperament. Although mainly nocturnal, it was sighted moving during the day and some individuals were even recorded basking in the sun.

The thylacine had an extended breeding season from winter to spring, with indications that some breeding took place throughout the year. The thylacine, like all marsupials, was tiny and hairless when born. Newborns crawled into the pouch on the belly of their mother, and attached themselves to one of the four teats, remaining there for up to three months. When old enough to leave the pouch, the young stayed in a lair such as a deep rocky cave, well-hidden nest or hollow log, whilst the mother hunted.

Approximately 4,000 years ago, the thylacine was widespread throughout New Guinea and most of mainland Australia, as well as the island of Tasmania. The most recent, well-dated occurrence of a thylacine on the mainland is a carbon-dated fossil from Murray Cave in Western Australia, which is around 3,100 years old. Its extinction coincided closely with the arrival of wild dogs called dingoes in Australia and a similar predator in New Guinea. Dingoes never reached Tasmania, and most scientists see this as the main reason for the thylacine's survival there.

* marsupial: a mammal, such as a kangaroo, whose young are born incompletely developed and are typically carried and suckled in a pouch on the mother's belly

The dramatic decline of the thylacine in Tasmania, which began in the 1830s and continued for a century, is generally attributed to the relentless efforts of sheep farmers and bounty hunters** with shotguns. While this determined campaign undoubtedly played a large part, it is likely that various other factors also contributed to the decline and eventual extinction of the species. These include competition with wild dogs introduced by European settlers, loss of habitat along with the disappearance of prey species, and a distemper-like disease which may also have affected the thylacine.

There was only one successful attempt to breed a thylacine in captivity, at Melbourne Zoo in 1899. This was despite the large numbers that went through some zoos, particularly London Zoo and Tasmania's Hobart Zoo. The famous naturalist John Gould foresaw the thylacine's demise when he published his Mammals of Australia between 1848 and 1863, writing, 'The numbers of this singular animal will speedily diminish, extermination will have its full sway, and it will then, like the wolf of England and Scotland, be recorded as an animal of the past.'

However, there seems to have been little public pressure to preserve the thylacine, nor was much concern expressed by scientists at the decline of this species in the decades that followed. A notable exception was T.T. Flynn, Professor of Biology at the University of Tasmania. In 1914, he was sufficiently concerned about the scarcity of the thylacine to suggest that some should be captured and placed on a small island. But it was not until 1929, with the species on the very edge of extinction, that Tasmania's Animals and Birds Protection Board passed a motion protecting thylacines only for the month of December, which was thought to be their prime breeding season. The last known wild thylacine to be killed was shot by a farmer in the north-east of Tasmania in 1930, leaving just captive specimens. Official protection of the species by the Tasmanian government was introduced in July 1936, 59 days before the last known individual died in Hobart Zoo on 7th September, 1936.

There have been numerous expeditions and searches for the thylacine over the years, none of which has produced definitive evidence that thylacines still exist. The species was declared extinct by the Tasmanian government in 1986.

** bounty hunters: people who are paid a reward for killing a wild animal""",
                    "questions": [
                        {
                            "number": "1-5",
                            "type": "note_completion",
                            "instruction": "Complete the notes below. Choose ONE WORD ONLY from the passage for each answer.",
                            "visual": {
                                "title": "The thylacine",
                                "sections": [
                                    {
                                        "heading": "Appearance and behaviour",
                                        "items": [
                                            "looked rather like a dog",
                                            "had a series of stripes along its body and tail",
                                            "ate an entirely 1__________ diet",
                                            "probably depended mainly on 2__________ when hunting",
                                            "young spent first months of life inside its mother's 3__________"
                                        ]
                                    },
                                    {
                                        "heading": "Decline and extinction",
                                        "items": [
                                            "last evidence in mainland Australia is a 3,100-year-old 4__________",
                                            "probably went extinct in mainland Australia due to animals known as dingoes",
                                            "reduction in 5__________ and available sources of food were partly responsible for decline in Tasmania"
                                        ]
                                    }
                                ]
                            }
                        },
                        {
                            "number": "6-13",
                            "type": "true_false_not_given",
                            "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
                            "statements": [
                                {"number": 6, "statement": "Significant numbers of thylacines were killed by humans from the 1830s onwards."},
                                {"number": 7, "statement": "Several thylacines were born in zoos during the late 1800s."},
                                {"number": 8, "statement": "John Gould's prediction about the thylacine surprised some biologists."},
                                {"number": 9, "statement": "In the early 1900s, many scientists became worried about the possible extinction of the thylacine."},
                                {"number": 10, "statement": "T. T. Flynn's proposal to rehome captive thylacines on an island proved to be impractical."},
                                {"number": 11, "statement": "There were still reasonable numbers of thylacines in existence when a piece of legislation protecting the species during their breeding season was passed."},
                                {"number": 12, "statement": "From 1930 to 1936, the only known living thylacines were all in captivity."},
                                {"number": 13, "statement": "Attempts to find living thylacines are now rarely made."}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Palm oil",
                    "question_range": "14-26",
                    "question_count": 13,
                    "time_recommendation": "20 minutes",
                    "passage_intro": "Palm oil is an edible oil derived from the fruit of the African oil palm tree, and is currently the most consumed vegetable oil in the world.",
                    "passage_text": """A
Palm oil is an edible oil derived from the fruit of the African oil palm tree, and is currently the most consumed vegetable oil in the world. It's almost certainly in the soap we wash with in the morning, the sandwich we have for lunch, and the biscuits we snack on during the day. Why is palm oil so attractive for manufacturers? Primarily because its unique properties - such as remaining solid at room temperature - make it an ideal ingredient for long-term preservation, allowing many packaged foods on supermarket shelves to have 'best before' dates of months, even years, into the future.

B
Many farmers have seized the opportunity to maximise the planting of oil palm trees. Between 1990 and 2012, the global land area devoted to growing oil palm trees grew from 6 to 17 million hectares, now accounting for around ten percent of total cropland in the entire world. From a mere two million tonnes of palm oil being produced annually globally 50 years ago, there are now around 60 million tonnes produced every single year, a figure looking likely to double or even triple by the middle of the century.

C
However, there are multiple reasons why conservationists cite the rapid spread of oil palm plantations as a major concern. There are countless news stories of deforestation, habitat destruction and dwindling species populations, all as a direct result of land clearing to establish oil palm tree monoculture on an industrial scale, particularly in Malaysia and Indonesia. Endangered species - most famously the Sumatran orangutan, but also rhinos, elephants, tigers, and numerous other fauna - have suffered from the unstoppable spread of oil palm plantations.

D
'Palm oil is surely one of the greatest threats to global biodiversity,' declares Dr Farnon Ellwood of the University of the West of England, Bristol. 'Palm oil is replacing rainforest, and rainforest is where all the species are. That's a problem.' This has led to some radical questions among environmentalists, such as whether consumers should try to boycott palm oil entirely. Meanwhile Bhavani Shankar, Professor at London's School of Oriental and African Studies, argues, 'It's easy to say that palm oil is the enemy and we should be against it. It makes for a more dramatic story, and it's very intuitive. But given the complexity of the argument, I think a much more nuanced story is closer to the truth.'

E
One response to the boycott movement has been the argument for the vital role palm oil plays in lifting many millions of people in the developing world out of poverty. Is it desirable to have palm oil boycotted, replaced, eliminated from the global supply chain, given how many low-income people in developing countries depend on it for their livelihoods? How best to strike a utilitarian balance between these competing factors has become a serious bone of contention.

F
Even the deforestation argument isn't as straightforward as it seems. Oil palm plantations produce at least four and potentially up to ten times more oil per hectare than soybean, rapeseed, sunflower or other competing oils. That immensely high yield - which is predominantly what makes it so profitable - is potentially also an ecological benefit. If ten times more palm oil can be produced from a patch of land than any competing oil, then ten times more land would need to be cleared in order to produce the same volume of oil from that competitor. As for the question of carbon emissions, the issue really depends on what oil palm trees are replacing. Crops vary in the degree to which they sequester carbon - in other words, the amount of carbon they capture from the atmosphere and store within the plant. The more carbon a plant sequesters, the more it reduces the effect of climate change. As Shankar explains: '[Palm oil production] actually sequesters more carbon in some ways than other alternatives. [...] Of course, if you're cutting down virgin forest it's terrible - that's what's happening in Indonesia and Malaysia, it's been allowed to get out of hand. But if it's replacing rice, for example, it might actually sequester more carbon.'

G
The industry is now regulated by a group called the Roundtable on Sustainable Palm Oil (RSPO), consisting of palm growers, retailers, product manufacturers, and other interested parties. Over the past decade or so, an agreement has gradually been reached regarding standards that producers of palm oil have to meet in order for their product to be regarded as officially 'sustainable'. The RSPO insists upon no virgin forest clearing, transparency and regular assessment of carbon stocks, among other criteria. Only once these requirements are fully satisfied is the oil allowed to be sold as certified sustainable palm oil (CSPO). Recent figures show that the RSPO now certifies around 12 million tonnes of palm oil annually, equivalent to roughly 21 percent of the world's total palm oil production.

H
There is even hope that oil palm plantations might not need to be such sterile monocultures, or 'green deserts', as Ellwood describes them. New research at Ellwood's lab hints at one plant which might make all the difference. The bird's nest fern (Asplenium nidus) grows on trees in an epiphytic fashion (meaning it's dependent on the tree only for support, not for nutrients), and is native to many tropical regions, where as a keystone species it performs a vital ecological role. Ellwood believes that reintroducing the bird's nest fern into oil palm plantations could potentially allow these areas to recover their biodiversity, providing a home for all manner of species, from fungi and bacteria, to invertebrates such as insects, amphibians, reptiles and even mammals.""",
                    "paragraphs": [
                        {
                            "letter": "A",
                            "text": """Palm oil is an edible oil derived from the fruit of the African oil palm tree, and is currently the most consumed vegetable oil in the world. It's almost certainly in the soap we wash with in the morning, the sandwich we have for lunch, and the biscuits we snack on during the day. Why is palm oil so attractive for manufacturers? Primarily because its unique properties - such as remaining solid at room temperature - make it an ideal ingredient for long-term preservation, allowing many packaged foods on supermarket shelves to have 'best before' dates of months, even years, into the future."""
                        },
                        {
                            "letter": "B",
                            "text": """Many farmers have seized the opportunity to maximise the planting of oil palm trees. Between 1990 and 2012, the global land area devoted to growing oil palm trees grew from 6 to 17 million hectares, now accounting for around ten percent of total cropland in the entire world. From a mere two million tonnes of palm oil being produced annually globally 50 years ago, there are now around 60 million tonnes produced every single year, a figure looking likely to double or even triple by the middle of the century."""
                        },
                        {
                            "letter": "C",
                            "text": """However, there are multiple reasons why conservationists cite the rapid spread of oil palm plantations as a major concern. There are countless news stories of deforestation, habitat destruction and dwindling species populations, all as a direct result of land clearing to establish oil palm tree monoculture on an industrial scale, particularly in Malaysia and Indonesia. Endangered species - most famously the Sumatran orangutan, but also rhinos, elephants, tigers, and numerous other fauna - have suffered from the unstoppable spread of oil palm plantations."""
                        },
                        {
                            "letter": "D",
                            "text": """'Palm oil is surely one of the greatest threats to global biodiversity,' declares Dr Farnon Ellwood of the University of the West of England, Bristol. 'Palm oil is replacing rainforest, and rainforest is where all the species are. That's a problem.' This has led to some radical questions among environmentalists, such as whether consumers should try to boycott palm oil entirely. Meanwhile Bhavani Shankar, Professor at London's School of Oriental and African Studies, argues, 'It's easy to say that palm oil is the enemy and we should be against it. It makes for a more dramatic story, and it's very intuitive. But given the complexity of the argument, I think a much more nuanced story is closer to the truth.'"""
                        },
                        {
                            "letter": "E",
                            "text": """One response to the boycott movement has been the argument for the vital role palm oil plays in lifting many millions of people in the developing world out of poverty. Is it desirable to have palm oil boycotted, replaced, eliminated from the global supply chain, given how many low-income people in developing countries depend on it for their livelihoods? How best to strike a utilitarian balance between these competing factors has become a serious bone of contention."""
                        },
                        {
                            "letter": "F",
                            "text": """Even the deforestation argument isn't as straightforward as it seems. Oil palm plantations produce at least four and potentially up to ten times more oil per hectare than soybean, rapeseed, sunflower or other competing oils. That immensely high yield - which is predominantly what makes it so profitable - is potentially also an ecological benefit. If ten times more palm oil can be produced from a patch of land than any competing oil, then ten times more land would need to be cleared in order to produce the same volume of oil from that competitor. As for the question of carbon emissions, the issue really depends on what oil palm trees are replacing. Crops vary in the degree to which they sequester carbon - in other words, the amount of carbon they capture from the atmosphere and store within the plant. The more carbon a plant sequesters, the more it reduces the effect of climate change. As Shankar explains: '[Palm oil production] actually sequesters more carbon in some ways than other alternatives. [...] Of course, if you're cutting down virgin forest it's terrible - that's what's happening in Indonesia and Malaysia, it's been allowed to get out of hand. But if it's replacing rice, for example, it might actually sequester more carbon.'"""
                        },
                        {
                            "letter": "G",
                            "text": """The industry is now regulated by a group called the Roundtable on Sustainable Palm Oil (RSPO), consisting of palm growers, retailers, product manufacturers, and other interested parties. Over the past decade or so, an agreement has gradually been reached regarding standards that producers of palm oil have to meet in order for their product to be regarded as officially 'sustainable'. The RSPO insists upon no virgin forest clearing, transparency and regular assessment of carbon stocks, among other criteria. Only once these requirements are fully satisfied is the oil allowed to be sold as certified sustainable palm oil (CSPO). Recent figures show that the RSPO now certifies around 12 million tonnes of palm oil annually, equivalent to roughly 21 percent of the world's total palm oil production."""
                        },
                        {
                            "letter": "H",
                            "text": """There is even hope that oil palm plantations might not need to be such sterile monocultures, or 'green deserts', as Ellwood describes them. New research at Ellwood's lab hints at one plant which might make all the difference. The bird's nest fern (Asplenium nidus) grows on trees in an epiphytic fashion (meaning it's dependent on the tree only for support, not for nutrients), and is native to many tropical regions, where as a keystone species it performs a vital ecological role. Ellwood believes that reintroducing the bird's nest fern into oil palm plantations could potentially allow these areas to recover their biodiversity, providing a home for all manner of species, from fungi and bacteria, to invertebrates such as insects, amphibians, reptiles and even mammals."""
                        }
                    ],
                    "questions": [
                        {
                            "number": "14-20",
                            "type": "section_matching",
                            "instruction": "Reading Passage 2 has eight sections, A-H. Which section contains the following information? Write the correct letter, A-H, in boxes 14-20 on your answer sheet.",
                            "items": [
                                {"number": 14, "item": "examples of a range of potential environmental advantages of oil palm tree cultivation"},
                                {"number": 15, "item": "description of an organisation which controls the environmental impact of palm oil production"},
                                {"number": 16, "item": "examples of the widespread global use of palm oil"},
                                {"number": 17, "item": "reference to a particular species which could benefit the ecosystem of oil palm plantations"},
                                {"number": 18, "item": "figures illustrating the rapid expansion of the palm oil industry"},
                                {"number": 19, "item": "an economic justification for not opposing the palm oil industry"},
                                {"number": 20, "item": "examples of creatures badly affected by the establishment of oil palm plantations"}
                            ]
                        },
                        {
                            "number": "21-22",
                            "type": "multiple_selection",
                            "instruction": "Choose TWO letters, A-E. Write the correct letters in boxes 21 and 22 on your answer sheet.",
                            "question": "Which TWO statements are made about the Roundtable on Sustainable Palm Oil (RSPO)?",
                            "options": [
                                "A: Its membership has grown steadily over the course of the last decade.",
                                "B: It demands that certified producers be open and honest about their practices.",
                                "C: It took several years to establish its set of criteria for sustainable palm oil certification.",
                                "D: Its regulations regarding sustainability are stricter than those governing other industries.",
                                "E: It was formed at the request of environmentalists concerned about the loss of virgin forests."
                            ],
                            "select_count": 2
                        },
                        {
                            "number": "23-26",
                            "type": "sentence_completion",
                            "instruction": "Complete the sentences below. Choose NO MORE THAN TWO WORDS from the passage for each answer.",
                            "items": [
                                {"number": 23, "sentence": "One advantage of palm oil for manufacturers is that it stays __________ even when not refrigerated."},
                                {"number": 24, "sentence": "The __________ is the best known of the animals suffering habitat loss as a result of the spread of oil palm plantations."},
                                {"number": 25, "sentence": "As one of its criteria for the certification of sustainable palm oil, the RSPO insists that growers check __________ on a routine basis."},
                                {"number": 26, "sentence": "Ellwood and his researchers are looking into whether the bird's nest fern could restore __________ in areas where oil palm trees are grown."}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Building the Skyline: The Birth and Growth of Manhattan's Skyscrapers",
                    "question_range": "27-40",
                    "question_count": 14,
                    "time_recommendation": "20 minutes",
                    "passage_intro": "Katharine L. Shester reviews a book by Jason Barr about the development of New York City",
                    "text": """Katharine L. Shester reviews a book by Jason Barr about the development of New York City

In Building the Skyline, Jason Barr takes the reader through a detailed history of New York City. The book combines geology, history, economics, and a lot of data to explain why business clusters developed where they did and how the early decisions of workers and firms shaped the skyline we see today. Building the Skyline is organized into two distinct parts. The first is primarily historical and addresses New York's settlement and growth from 1609 to 1900; the second deals primarily with the 20th century and is a compilation of chapters commenting on different aspects of New York's urban development. The tone and organization of the book changes somewhat between the first and second parts, as the latter chapters incorporate aspects of Barr's related research papers.

Barr begins chapter one by taking the reader on a 'helicopter time-machine' ride - giving a fascinating account of how the New York landscape in 1609 might have looked from the sky. He then moves on to a subterranean walking tour of the city, indicating the location of rock and water below the subsoil, before taking the reader back to the surface. His love of the city comes through as he describes various fun facts about the location of the New York residence of early 19th-century vice-president Aaron Burr as well as a number of legends about the city.

Chapters two and three take the reader up to the Civil War (1861-1865), with chapter two focusing on the early development of land and the implementation of a grid system in 1811. Chapter three focuses on land use before the Civil War. Both chapters are informative and well researched and set the stage for the economic analysis that comes later in the book. I would have liked Barr to expand upon his claim that existing tenements* prevented skyscrapers in certain neighborhoods because 'likely no skyscraper developer was interested in performing the necessary "slum clearance"'. Later in the book, Barr makes the claim that the depth of bedrock** was not a limiting factor for developers, as foundation costs were a small fraction of the cost of development. At first glance, it is not obvious why slum clearance would be limiting, while more expensive foundations would not.

* a tenement: a multi-occupancy building of any sort, but particularly a run-down apartment building or slum building
** bedrock: the solid, hard rock in the ground that lies under a loose layer of soil

Chapters four and five. Following the end of the Civil War, Barr describes the period known as 'skyscraper birth' (1870-1910). During this period, technology, transportation, and financial innovations made the construction of tall buildings possible and desirable. The reader is introduced to a selection of the early skyscrapers, and shown how key innovations in construction (including elevators) revolutionized building design. Barr also examines the development of the midtown business district, and notes the role that the opening of Grand Central Terminal had in its growth. As Barr points out, it was during this period that Manhattan became a commuter business center.

Chapter six, 'The Soaring Twenties,' discusses the building boom that began in 1920. The decade of the 1920s was unusual for its prosperous economy and construction boom, and Barr describes how conditions at the end of World War I led to the building frenzy of the following decade. While this is an interesting period to study, Barr is not completely successful in explaining why the boom ended, emphasizing the role of 'overbuilding' rather than the broader economic crash of the Great Depression. Though this chapter, and others, discuss how economic downturns affected building, they lack the detailed economic analysis needed to fully explain why building booms and busts occurred when and where they did.

Chapter seven delves into what some call 'the bedrock myth' - the notion that Manhattan's skyscrapers arose in two clusters, downtown and midtown, because of the geography of bedrock in Manhattan. This idea, first proposed in the 1960s, holds that the deep bedrock in the area between the clusters prevented skyscraper development. Barr explains why this notion is wrong, showing that foundation costs were always a small fraction of building costs, so deep bedrock was not a barrier to development.

In chapter eight, Barr tackles the history and economics of land values in Manhattan over the course of 200 years. Relying largely on data he collected himself, he shows how land values changed as the city expanded northward and examines why land values in one area might exceed those in another. This discussion is very impressive, and the chapter is one of the book's highlights.

In spite of its flaws, Building the Skyline is quite enjoyable. The combination of history and economics comes together in a way that is informative and entertaining for the general reader. While the book is clearly intended for a general audience, the author does include academic references throughout the book, giving professional researchers a starting point for further study of the topics covered.""",
                    "questions": [
                        {
                            "number": "27-31",
                            "type": "multiple_choice",
                            "instruction": "Choose the correct letter, A, B, C or D. Write the correct letter in boxes 27-31 on your answer sheet.",
                            "items": [
                                {
                                    "number": 27,
                                    "question": "What point does Shester make about Barr's book in the first paragraph?",
                                    "options": [
                                        "A: It gives a highly original explanation for urban development.",
                                        "B: Elements of Barr's research papers are incorporated throughout the book.",
                                        "C: Other books that are available on the subject have taken a different approach.",
                                        "D: It covers a range of factors that affected the development of New York."
                                    ]
                                },
                                {
                                    "number": 28,
                                    "question": "How does Shester respond to the information in the book about tenements?",
                                    "options": [
                                        "A: She describes the reasons for Barr's interest.",
                                        "B: She indicates a potential problem with Barr's analysis.",
                                        "C: She compares Barr's conclusion with that of other writers.",
                                        "D: She provides details about the sources Barr used for his research."
                                    ]
                                },
                                {
                                    "number": 29,
                                    "question": "What does Shester say about chapter six of the book?",
                                    "options": [
                                        "A: It contains conflicting data.",
                                        "B: It focuses too much on possible trends.",
                                        "C: It is too specialised for most readers.",
                                        "D: It draws on research that is out of date."
                                    ]
                                },
                                {
                                    "number": 30,
                                    "question": "What does Shester suggest about the chapters focusing on the 1920s building boom?",
                                    "options": [
                                        "A: The information should have been organised differently.",
                                        "B: More facts are needed about the way construction was financed.",
                                        "C: The explanation that is given for the building boom is unlikely.",
                                        "D: Some parts will have limited appeal to certain people."
                                    ]
                                },
                                {
                                    "number": 31,
                                    "question": "What impresses Shester the most about the chapter on land values?",
                                    "options": [
                                        "A: the broad time period that is covered",
                                        "B: the interesting questions that Barr asks",
                                        "C: the nature of the research into the topic",
                                        "D: the recommendations Barr makes for the future"
                                    ]
                                }
                            ]
                        },
                        {
                            "number": "32-35",
                            "type": "yes_no_not_given",
                            "instruction": "Do the following statements agree with the claims of the writer in Reading Passage 3? Write YES if the statement agrees with the claims of the writer, NO if the statement contradicts the claims of the writer, NOT GIVEN if it is impossible to say what the writer thinks about this.",
                            "statements": [
                                {"number": 32, "statement": "The description in the first chapter of how New York probably looked from the air in the early 1600s lacks interest."},
                                {"number": 33, "statement": "Chapters two and three prepare the reader well for material yet to come."},
                                {"number": 34, "statement": "The biggest problem for many nineteenth-century New York immigrant neighbourhoods was a lack of amenities."},
                                {"number": 35, "statement": "In the nineteenth century, New York's immigrant neighbourhoods tended to concentrate around the harbour."}
                            ]
                        },
                        {
                            "number": "36-40",
                            "type": "summary_completion",
                            "instruction": "Complete the summary using the list of phrases, A-J, below. Write the correct letter, A-J, in boxes 36-40 on your answer sheet.",
                            "title": "The bedrock myth",
                            "text": "In chapter seven, Barr indicates how the lack of bedrock close to the surface does not explain why skyscrapers are absent from 36__________. He points out that although the cost of foundations increases when bedrock is deep below the surface, this cannot be regarded as 37__________, especially when compared to 38__________.\n\nA particularly enjoyable part of the chapter was Barr's account of how foundations are built. He describes not only how 39__________ are made possible by the use of caissons, but he also discusses their 40__________. The chapter is well researched but relatively easy to understand.",
                            "options": [
                                "A: development plans",
                                "B: deep excavations",
                                "C: great distance",
                                "D: excessive expense",
                                "E: impossible tasks",
                                "F: associated risks",
                                "G: water level",
                                "H: specific areas",
                                "I: total expenditure",
                                "J: construction guidelines"
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
                    "task_type": "bar_chart",
                    "prompt": "The chart below gives information about how families in one country spent their weekly income in 1968 and in 2018.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nWrite at least 150 words.",
                    "visual": {
                        "type": "bar_chart",
                        "title": "1968 and 2018: average weekly spending by families",
                        "description": "A bar chart comparing family weekly spending as percentage of weekly income across 8 categories between 1968 and 2018",
                        "x_axis": "% of weekly income",
                        "y_axis": "Spending categories",
                        "data": {
                            "categories": ["Food", "Housing", "Fuel and power", "Clothing and footwear", "Household goods", "Personal goods", "Transport", "Leisure"],
                            "1968": [35, 10, 6, 10, 10, 8, 8, 5],
                            "2018": [15, 20, 5, 9, 13, 9, 23, 16]
                        },
                        "image_url": "/api/cambridge/images/ielts17/test3/test3_writing_task1.png"
                    }
                },
                {
                    "task_number": 2,
                    "title": "Writing Task 2",
                    "time_recommendation": "40 minutes",
                    "minimum_words": 250,
                    "task_type": "discussion_essay",
                    "prompt": "Write about the following topic:\n\nSome people believe that professionals, such as doctors and engineers, should be required to work in the country where they did their training. Others believe they should be free to work in another country if they wish.\n\nDiscuss both these views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.\n\nWrite at least 250 words."
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
                    "topic": "Drinks",
                    "audio_only": True,
                    "questions": [
                        "What do you like to drink with your dinner? [Why?]",
                        "Do you drink a lot of water every day? [Why/Why not?]",
                        "Do you prefer drinking tea or coffee? [Why?]",
                        "If people visit you in your home, what do you usually offer them to drink? [Why/Why not?]"
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "description": "You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish.",
                    "cue_card": {
                        "topic": "Describe a monument (e.g., a statue or sculpture) that you like.",
                        "points": [
                            "what this monument is",
                            "where this monument is",
                            "what it looks like",
                            "and explain why you like this monument."
                        ],
                        "preparation_time": "1 minute",
                        "speaking_time": "1-2 minutes"
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
                            "topic": "Public monuments",
                            "questions": [
                                "What kinds of monuments do tourists in your country enjoy visiting?",
                                "Why do you think there are often statues of famous people in public places?",
                                "Do you agree that old monuments and buildings should always be preserved?"
                            ]
                        },
                        {
                            "topic": "Architecture",
                            "questions": [
                                "Why is architecture such a popular university subject?",
                                "In what ways has the design of homes changed in recent years?",
                                "To what extent does the design of buildings affect people's moods?"
                            ]
                        }
                    ]
                }
            ]
        }
    }
}
