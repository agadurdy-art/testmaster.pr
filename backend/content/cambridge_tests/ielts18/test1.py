"""
Cambridge IELTS 18 - Test 1
Complete test with full content and answer keys
"""

IELTS18_TEST1 = {
    "test_id": "ielts18_test1",
    "book": "Cambridge IELTS 18",
    "test_number": 1,
    "title": "IELTS 18 - Test 1",
    "description": "Complete Academic test from Cambridge IELTS 18",
    "test_type": "academic",
    "estimated_time": "2 hours 45 minutes",
    "sections": {
        "listening": {
            "total_questions": 40,
            "duration": "30 minutes + 10 minutes transfer time",
            "parts": [
                {
                    "part_number": 1,
                    "title": "Transport Survey",
                    "question_range": "1-10",
                    "question_count": 10,
                    "context": "A woman answering questions for a transport survey",
                    "question_types": ["note_completion"],
                    "audio_file": "https://customer-assets.emergentagent.com/job_syncflow-6/artifacts/330dmao1_18%20section1-part1.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                    "note_template": """Transport survey
Name: Sadie Jones
Year of birth: _____
Postcode: 1 _____
Travelling by bus
Date of bus journey: 2 _____
Reason for trip: shopping and visit to the 3 _____
Travelled by bus because cost of 4 _____ too high
Got on bus at 5 _____ Street
Complaints about bus service:
- bus today was 6 _____
- frequency of buses in the 7 _____
Travelling by car
Goes to the 8 _____ by car
Travelling by bicycle
Dislikes travelling by bike in the city centre because of the 9 _____
Doesn't own a bike because of a lack of 10 _____""",
                    "questions": [
                        {"number": 1, "type": "note_completion", "answer": "DW30 7YZ"},
                        {"number": 2, "type": "note_completion", "answer": "24(th) April"},
                        {"number": 3, "type": "note_completion", "answer": "dentist"},
                        {"number": 4, "type": "note_completion", "answer": "parking"},
                        {"number": 5, "type": "note_completion", "answer": "Claxby"},
                        {"number": 6, "type": "note_completion", "answer": "late"},
                        {"number": 7, "type": "note_completion", "answer": "evening"},
                        {"number": 8, "type": "note_completion", "answer": "supermarket"},
                        {"number": 9, "type": "note_completion", "answer": "pollution"},
                        {"number": 10, "type": "note_completion", "answer": "storage"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Becoming a volunteer for ACE",
                    "question_range": "11-20",
                    "question_count": 10,
                    "context": "A talk about volunteering opportunities at ACE",
                    "question_types": ["multiple_choice", "multiple_selection", "matching"],
                    "audio_file": "https://customer-assets.emergentagent.com/job_syncflow-6/artifacts/ut6d1tyx_18%20section1-part2.mp3",
                    "instructions": "Questions 11-13: Choose the correct letter, A, B or C.",
                    "questions": [
                        {
                            "number": 11, 
                            "type": "multiple_choice", 
                            "question_text": "Why does the speaker apologise about the seats?",
                            "options": {
                                "A": "They are too small.",
                                "B": "There are not enough of them.",
                                "C": "Some of them are very close together."
                            },
                            "answer": "C"
                        },
                        {
                            "number": 12, 
                            "type": "multiple_choice", 
                            "question_text": "What does the speaker say about the age of volunteers?",
                            "options": {
                                "A": "The age of volunteers is less important than other factors.",
                                "B": "Young volunteers are less reliable than older ones.",
                                "C": "Most volunteers are about 60 years old."
                            },
                            "answer": "A"
                        },
                        {
                            "number": 13, 
                            "type": "multiple_choice", 
                            "question_text": "What does the speaker say about training?",
                            "options": {
                                "A": "It is continuous.",
                                "B": "It is conducted by a manager.",
                                "C": "It takes place online."
                            },
                            "answer": "A"
                        },
                        {
                            "number": "14-15", 
                            "type": "multiple_selection", 
                            "question_text": "Which TWO issues does the speaker ask the audience to consider before they apply to be volunteers?",
                            "options": {
                                "A": "their financial situation",
                                "B": "their level of commitment",
                                "C": "their work experience",
                                "D": "their ambition",
                                "E": "their availability"
                            },
                            "answer": ["B", "E"], 
                            "answer_count": 2
                        },
                        {"number": 16, "type": "matching", "question_text": "Fundraising", "answer": "B"},
                        {"number": 17, "type": "matching", "question_text": "Litter collection", "answer": "G"},
                        {"number": 18, "type": "matching", "question_text": "'Playmates'", "answer": "D"},
                        {"number": 19, "type": "matching", "question_text": "Story club", "answer": "A"},
                        {"number": 20, "type": "matching", "question_text": "First aid", "answer": "F"}
                    ],
                    "matching_options": {
                        "title": "Helpful things volunteers might offer",
                        "options": {
                            "A": "a good memory",
                            "B": "experience on stage",
                            "C": "original, new ideas",
                            "D": "parenting skills",
                            "E": "an understanding of food and diet",
                            "F": "a good level of fitness",
                            "G": "retail experience"
                        }
                    }
                },
                {
                    "part_number": 3,
                    "title": "Talk on jobs in fashion design",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "Two students discussing a talk about jobs in fashion design",
                    "question_types": ["multiple_choice", "multiple_selection"],
                    "audio_file": "https://customer-assets.emergentagent.com/job_syncflow-6/artifacts/wlt7wyhd_18%20section1-part3.mp3",
                    "questions": [
                        {
                            "number": 21, 
                            "type": "multiple_choice", 
                            "question_text": "What problem did Chantal have at the start of the talk?",
                            "options": {
                                "A": "Her view of the speaker was blocked.",
                                "B": "She was unable to find an empty seat.",
                                "C": "The students next to her were talking."
                            },
                            "answer": "A"
                        },
                        {
                            "number": 22, 
                            "type": "multiple_choice", 
                            "question_text": "What were Hugo and Chantal surprised to hear about the job market?",
                            "options": {
                                "A": "It has become more competitive than it used to be.",
                                "B": "There is more variety in it than they had realised.",
                                "C": "Some areas of it are more exciting than others."
                            },
                            "answer": "B"
                        },
                        {
                            "number": 23, 
                            "type": "multiple_choice", 
                            "question_text": "Hugo and Chantal agree that the speaker's message was",
                            "options": {
                                "A": "unfair to them at times.",
                                "B": "hard for them to follow.",
                                "C": "critical of the industry."
                            },
                            "answer": "A"
                        },
                        {
                            "number": 24, 
                            "type": "multiple_choice", 
                            "question_text": "What do Hugo and Chantal criticise about their school careers advice?",
                            "options": {
                                "A": "when they received the advice",
                                "B": "how much advice was given",
                                "C": "who gave the advice"
                            },
                            "answer": "C"
                        },
                        {
                            "number": 25, 
                            "type": "multiple_choice", 
                            "question_text": "When discussing their future, Hugo and Chantal disagree on",
                            "options": {
                                "A": "which is the best career in fashion.",
                                "B": "when to choose a career in fashion.",
                                "C": "why they would like a career in fashion."
                            },
                            "answer": "B"
                        },
                        {
                            "number": 26, 
                            "type": "multiple_choice", 
                            "question_text": "How does Hugo feel about being an unpaid assistant?",
                            "options": {
                                "A": "He is realistic about the practice.",
                                "B": "He feels the practice is dishonest.",
                                "C": "He thinks others want to change the practice."
                            },
                            "answer": "A"
                        },
                        {
                            "number": "27-28", 
                            "type": "multiple_selection", 
                            "question_text": "Which TWO mistakes did the speaker admit she made in her first job?",
                            "options": {
                                "A": "being dishonest to her employer",
                                "B": "paying too much attention to how she looked",
                                "C": "expecting to become well known",
                                "D": "trying to earn a lot of money",
                                "E": "openly disliking her client"
                            },
                            "answer": ["B", "E"], 
                            "answer_count": 2
                        },
                        {
                            "number": "29-30", 
                            "type": "multiple_selection", 
                            "question_text": "Which TWO pieces of retail information do Hugo and Chantal agree would be useful?",
                            "options": {
                                "A": "the reasons people return fashion items",
                                "B": "how much time people have to shop for clothes",
                                "C": "fashion designs people want but can't find",
                                "D": "the best time of year for fashion buying",
                                "E": "the most popular fashion sizes"
                            },
                            "answer": ["A", "C"], 
                            "answer_count": 2
                        }
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Elephant translocation",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "A lecture about elephant translocation",
                    "question_types": ["sentence_completion"],
                    "audio_file": "https://customer-assets.emergentagent.com/job_syncflow-6/artifacts/6ozv5g9b_18%20section1-part4.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "note_template": """Elephant translocation

Reasons for overpopulation at Majete National Park
• strict enforcement of anti-poaching laws
• successful breeding

Problems caused by elephant overpopulation
• greater competition, causing hunger for elephants
• damage to 31 _____ in the park

The translocation process
• a suitable group of elephants from the same 32 _____ was selected
• vets and park staff made use of 33 _____ to help guide the elephants into an open plain
• elephants were immobilised with tranquilisers
• this process had to be completed quickly to reduce 34 _____
• elephants had to be turned on their 35 _____ to avoid damage to their lungs
• elephants' 36 _____ had to be monitored constantly
• tracking devices were fitted to the matriarchs
• data including the size of their tusks and 37 _____ was taken
• elephants were taken by truck to their new reserve

Advantages of translocation at Nkhotakota Wildlife Park
• 38 _____ opportunities
• a reduction in the number of poachers and 39 _____
• an example of conservation that other parks can follow
• an increase in 40 _____ as a contributor to GDP""",
                    "questions": [
                        {"number": 31, "type": "sentence_completion", "answer": "fences"},
                        {"number": 32, "type": "sentence_completion", "answer": "family"},
                        {"number": 33, "type": "sentence_completion", "answer": "helicopters"},
                        {"number": 34, "type": "sentence_completion", "answer": "stress"},
                        {"number": 35, "type": "sentence_completion", "answer": "sides"},
                        {"number": 36, "type": "sentence_completion", "answer": "breathing"},
                        {"number": 37, "type": "sentence_completion", "answer": "feet"},
                        {"number": 38, "type": "sentence_completion", "answer": "employment"},
                        {"number": 39, "type": "sentence_completion", "answer": "weapons"},
                        {"number": 40, "type": "sentence_completion", "answer": "tourism"}
                    ]
                }
            ],
            "answer_key": {
                1: "DW30 7YZ", 2: "24(th) April", 3: "dentist", 4: "parking", 5: "Claxby",
                6: "late", 7: "evening", 8: "supermarket", 9: "pollution", 10: "storage",
                11: "C", 12: "A", 13: "A", "14-15": ["B", "E"], 16: "B", 17: "G", 18: "D", 19: "A", 20: "F",
                21: "A", 22: "B", 23: "A", 24: "C", 25: "B", 26: "A", "27-28": ["B", "E"], "29-30": ["A", "C"],
                31: "fences", 32: "family", 33: "helicopters", 34: "stress", 35: "sides",
                36: "breathing", 37: "feet", 38: "employment", 39: "weapons", 40: "tourism"
            }
        },
        "reading": {
            "total_questions": 40,
            "duration": "60 minutes",
            "passages": [
                {
                    "passage_number": 1,
                    "title": "Urban farming",
                    "question_range": "1-13",
                    "question_count": 13,
                    "topic": "Urban farming in Paris using soil-free agriculture",
                    "question_types": ["sentence_completion", "table_completion", "true_false_notgiven"],
                    "text": """Urban farming

In Paris, urban farmers are trying a soil-free approach to agriculture that uses less space and fewer resources. Could it help cities face the threats to our food supplies?

On top of a striking new exhibition hall in southern Paris, the world's largest urban rooftop farm has started to bear fruit. Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes. Peer inside and you see the tubes are completely hollow, the roots of dozens of strawberry plants dangling down inside them. From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint. Opposite, in narrow, horizontal trays packed not with soil but with coconut fibre, grow cherry tomatoes, shiny aubergines and brightly coloured chards.

Pascal Hardy, an engineer and sustainable development consultant, began experimenting with vertical farming and aeroponic growing towers — as the soil-free plastic tubes are known — on his Paris apartment block roof five years ago. The urban rooftop space above the exhibition hall is somewhat bigger: 14,000 square metres and almost exactly the size of a couple of football pitches. Already, the team of young urban farmers who tend it have picked, in one day, 3,000 lettuces and 150 punnets of strawberries. When the remaining two thirds of the vast open area are in production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day. 'We're not ever, obviously, going to feed the whole city this way,' cautions Hardy. 'In the urban environment you're working with very significant practical constraints, clearly, on what you can do and where. But if enough unused space can be developed like this, there's no reason why you shouldn't eventually target maybe between 5% and 10% of consumption.'

Perhaps most significantly, however, this is a real-life showcase for the work of Hardy's flourishing urban agriculture consultancy, Agripolis, which is currently fielding enquiries from around the world to design, build and equip a new breed of soil-free inner-city farm. 'The method's advantages are many,' he says. 'First, I don't much like the fact that most of the fruit and vegetables we eat have been treated with something like 17 different pesticides, or that the intensive farming techniques that produced them are such huge generators of greenhouse gases. I don't much like the fact, either, that they've travelled an average of 2,000 refrigerated kilometres to my plate, that their quality is so poor, because the varieties are selected for their capacity to withstand such substantial journeys, or that 80% of the price I pay goes to wholesalers and transport companies, not the producers.'

Produce grown using this soil-free method, on the other hand — which relies solely on a small quantity of water, enriched with organic nutrients, pumped around a closed circuit of pipes, towers and trays — is 'produced up here, and sold locally, just down there. It barely travels at all,' Hardy says. 'You can select crop varieties for their flavour, not their resistance to the transport and storage chain, and you can pick them when they're really at their best, and not before.' No soil is exhausted, and the water that gently showers the plants' roots every 12 minutes is recycled, so the method uses 90% less water than a classic intensive farm for the same yield.

Urban farming is not, of course, a new phenomenon. Inner-city agriculture is booming from Shanghai to Detroit and Tokyo to Bangkok. Strawberries are being grown in disused shipping containers, mushrooms in underground carparks. Aeroponic farming, he says, is 'virtuous'. The equipment weighs little, can be installed on almost any flat surface and is cheap to buy: roughly €100 to €150 per square metre. It is cheap to run, too, consuming a tiny fraction of the electricity used by some techniques.

Produce grown this way typically sells at prices that, while generally higher than those of classic intensive agriculture, are lower than soil-based organic growers. There are limits to what farmers can grow this way, of course, and much of the produce is suited to the summer months. 'Root vegetables we cannot do, at least not yet,' he says. 'Radishes are OK, but carrots, potatoes, that kind of thing — the roots are simply too long. Fruit trees are obviously not an option. And beans tend to take up a lot of space for not much return.' Nevertheless, urban farming of the kind being practised in Paris is one part of a bigger and fast-changing picture that is bringing food production closer to our lives.""",
                    "questions": [
                        {
                            "number": 1, 
                            "type": "sentence_completion", 
                            "question_text": "Vertical tubes are used to grow strawberries, _____ overall.",
                            "answer": "lettuces"
                        },
                        {
                            "number": 2, 
                            "type": "sentence_completion", 
                            "question_text": "There will eventually be a daily harvest of as much as _____ weight of fruit and vegetables.",
                            "answer": "1,000 kg"
                        },
                        {
                            "number": 3, 
                            "type": "sentence_completion", 
                            "question_text": "It may be possible that the farm's produce will account for as much as 10% of the city's _____ overall.",
                            "answer": "(food) consumption"
                        },
                        {"number": 4, "type": "table_completion", "answer": "pesticides"},
                        {"number": 5, "type": "table_completion", "answer": "journeys"},
                        {"number": 6, "type": "table_completion", "answer": "producers"},
                        {"number": 7, "type": "table_completion", "answer": "flavour"},
                        {
                            "number": 8, 
                            "type": "true_false_notgiven", 
                            "question_text": "Urban farming can take place above or below ground.",
                            "answer": "TRUE"
                        },
                        {
                            "number": 9, 
                            "type": "true_false_notgiven", 
                            "question_text": "Some of the equipment used in aeroponic farming can be made by hand.",
                            "answer": "NOT GIVEN"
                        },
                        {
                            "number": 10, 
                            "type": "true_false_notgiven", 
                            "question_text": "Urban farming relies more on electricity than some other types of farming.",
                            "answer": "FALSE"
                        },
                        {
                            "number": 11, 
                            "type": "true_false_notgiven", 
                            "question_text": "Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.",
                            "answer": "TRUE"
                        },
                        {
                            "number": 12, 
                            "type": "true_false_notgiven", 
                            "question_text": "Most produce can be grown on an aeroponic urban farm at any time of the year.",
                            "answer": "FALSE"
                        },
                        {
                            "number": 13, 
                            "type": "true_false_notgiven", 
                            "question_text": "Beans take longer to grow on an urban farm than other vegetables.",
                            "answer": "NOT GIVEN"
                        }
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Forest management in Pennsylvania, USA",
                    "question_range": "14-26",
                    "question_count": 13,
                    "topic": "How managing low-quality wood for bioenergy can encourage sustainable forest management",
                    "question_types": ["matching_information", "matching_features", "sentence_completion"],
                    "text": """Forest management in Pennsylvania, USA

How managing low-quality wood (also known as low-use wood) for bioenergy can encourage sustainable forest management

A. A tree's 'value' depends on several factors including its species, size, form, condition, quality, function, and accessibility, and depends on the management goals for a given forest. The same tree can be valued very differently by each person who looks at it. A large, straight black cherry tree has high value as timber to be cut into logs or made into furniture, but for a landowner more interested in wildlife habitat, the real value of that stem (or trunk) may be the food it provides to animals. Likewise, if the tree suffers from black knot disease, its value for timber decreases, but to a woodworker interested in making bowls, it brings an opportunity for a unique and beautiful piece of art.

B. In the past, Pennsylvania landowners were solely interested in the value of their trees as high-quality timber. The norm was to remove the stems of highest quality and leave behind poorly formed trees that were not as well suited to the site where they grew. This practice, called 'high-grading', has left a legacy of 'low-use wood' in the forests. Some people even call these 'junk trees', and they are abundant in Pennsylvania. These trees have lower economic value for traditional timber markets, compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand, leaving it more vulnerable to poor weather and disease. Management that specifically targets low-use wood can help landowners manage these forest health issues, and wood energy markets help promote this.

C. Wood energy markets can accept less expensive wood material of lower quality than would be suitable for traditional timber markets. Most wood used for energy in Pennsylvania is used to produce heat or electricity through combustion. Many schools and hospitals use wood boiler systems to heat and power their facilities, many homes are primarily heated with wood, and some coal plants incorporate wood into their coal streams to produce electricity. Wood can also be gasified for electrical generation and can even be made into liquid fuels like ethanol and gasoline for lorries and cars. All these products are made primarily from low-use wood. Several tree- and plant-cutting approaches, which could greatly improve the long-term quality of a forest, focus strongly or solely on the use of wood for those markets.

D. One such approach is called a Timber Stand Improvement (TSI) Cut. In a TSI Cut, really poor-quality tree and plant material is cut down to allow more space, light, and other resources to the highest-valued stems that remain. Removing invasive plants might be another primary goal of a TSI Cut. The stems that are left behind might then grow in size and develop more foliage and larger crowns or tops that produce more coverage for wildlife; they have a better chance to regenerate in a less crowded environment. TSI Cuts can be tailored to one farmer's specific management goals for his or her land.

E. Another approach that might yield a high amount of low-use wood is a Salvage Cut. With the many pests and pathogens visiting forests including hemlock wooly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth, to name just a few, it is important to remember that those working in the forests can help ease these issues through cutting procedures. These types of cut reduce the number of sick trees and seek to manage the future spread of a pest problem. They leave vigorous trees that have stayed healthy enough to survive the outbreak.

F. A Shelterwood Cut, which only takes place in a mature forest that has already been thinned several times, involves removing all the mature trees when other seedlings have become established. This then allows the forester to decide which tree species are regenerated. It leaves a young forest where all trees are at a similar point in their growth. It can also be used to develop a two-tier forest so that there are two harvests and the money that comes in is spread out over a decade or more.

G. Thinnings and dense and dead wood removal for fire prevention also center on the production of low-use wood. However, it is important to remember that some retention of what many would classify as low-use wood is very important. The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil. In addition, trees with many cavities are extremely important habitats for insect predators like woodpeckers, bats and small mammals. They help control problem insects and increase the health and resilience of the forest. It is also important to remember that not all small trees are low-use. For example, many species like hawthorn provide food for wildlife. Finally, rare species of trees in a forest should also stay behind as they add to its structural diversity.""",
                    "questions": [
                        {"number": 14, "type": "matching_information", "question_text": "bad outcomes for a forest when people focus only on its financial reward", "answer": "B"},
                        {"number": 15, "type": "matching_information", "question_text": "reference to the aspects of any tree that contribute to its worth", "answer": "A"},
                        {"number": 16, "type": "matching_information", "question_text": "mention of the potential use of wood to help run vehicles", "answer": "C"},
                        {"number": 17, "type": "matching_information", "question_text": "examples of insects that attack trees", "answer": "E"},
                        {"number": 18, "type": "matching_information", "question_text": "an alternative name for trees that produce low-use wood", "answer": "B"},
                        {"number": 19, "type": "matching_features", "question_text": "


to


prevent








 


competition


 


__(purpose)__


", "answer": "B"},
                        {"number": 20, "type": "multiple_choice", "answer": "C"},
                        {"number": 21, "type": "multiple_choice", "answer": "C"},
                        {"number": 22, "type": "sentence_completion", "answer": "fire"},
                        {"number": 23, "type": "sentence_completion", "answer": "nutrients"},
                        {"number": 24, "type": "sentence_completion", "answer": "cavities"},
                        {"number": 25, "type": "sentence_completion", "answer": "hawthorn"},
                        {"number": 26, "type": "sentence_completion", "answer": "rare"}
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Conquering Earth's space junk problem",
                    "question_range": "27-40",
                    "question_count": 14,
                    "topic": "Satellites, rocket shards and collision debris creating traffic risks in orbit",
                    "question_types": ["matching_information", "summary_completion", "matching_features"],
                    "text": """Conquering Earth's space junk problem

Satellites, rocket shards and collision debris are creating major traffic risks in orbit around the planet. Researchers are working to reduce these threats.

Last year, commercial companies, military and civil departments and amateurs sent more than 400 satellites into orbit, over four times the yearly average in the previous decade. Numbers could rise even more sharply if leading space companies follow through on plans to deploy hundreds to thousands of large constellations of satellites to space in the next few years.

All that traffic can lead to disaster. Ten years ago, a US commercial Iridium satellite smashed into an inactive Russian communications satellite called Cosmos-2251, creating thousands of new pieces of space shrapnel that now threaten other satellites in low Earth orbit — the zone stretching up to 2,000 kilometres in altitude. Altogether, there are roughly 20,000 human-made objects in orbit, from working satellites to small rocket pieces. And satellite operators can't steer away from every potential crash, because each move consumes time and fuel that could otherwise be used for the spacecraft's main job.

Concern about space junk goes back to the beginning of the satellite era, but the number of objects in orbit is rising so rapidly that researchers are investigating new ways of attacking the problem. Several teams are trying to improve methods for assessing what is in orbit, so that satellite operators can work more efficiently in ever-more-crowded space. Some researchers are now starting to compile a massive data set that includes the best possible information on where everything is in orbit. Others are developing taxonomies of space debris — working on measuring properties such as the shape and size of an object, so that satellite operators know how much to worry about what's coming their way.

The alternative, many say, is unthinkable. Just a few uncontrolled space crashes could generate enough debris to set off a runaway cascade of fragments, rendering near-Earth space unusable. 'If we go on like this, we will reach a point of no return,' says Carolin Frueh, an astrodynamical researcher at Purdue University in West Lafayette, Indiana.

Even as our ability to monitor space objects increases, so too does the total number of items in orbit. That means companies, governments and other players in space are collaborating in new ways to avoid a shared threat. International groups such as the Inter-Agency Space Debris Coordination Committee have developed guidelines on space sustainability. Those include inactivating satellites at the end of their useful life by venting pressurised materials or leftover fuel that might lead to explosions. The intergovernmental groups also advise lowering satellites deep enough into the atmosphere that they will burn up or disintegrate within 25 years. But so far, only about half of all missions have abided by this 25-year goal, says Holger Krag, head of the European Space Agency's space-debris office in Darmstadt, Germany. Operators of the planned large constellations of satellites say they will be responsible stewards in their enterprises in space, but Krag worries that problems could increase, despite their best intentions. 'What happens to those that fail or go bankrupt?' he asks. 'They are probably not going to spend money to remove their satellites from space.'

In theory, given the vastness of space, satellite operators should have plenty of room for all these missions to fly safely without ever nearing another object. So some scientists are tackling the problem of space junk by trying to find out where all the debris is to a high degree of precision. That would alleviate the need for many of the unnecessary manoeuvres that are carried out to avoid potential collisions. 'If you knew precisely where everything was, you would almost never have a problem,' says Marlon Sorge, a space-debris specialist at the Aerospace Corporation in El Segundo, California.

The field is called space traffic management, because it's similar to managing traffic on the roads or in the air. Think about a busy day at an airport, says Moriba Jah, an astrodynamicist at the University of Texas at Austin: planes line up in the sky, landing and taking off close to one another in a carefully choreographed routine. Air-traffic controllers know the location of the planes down to one metre in accuracy. The same can't be said for space debris. Not all objects in orbit are known, and even those included in databases are not tracked consistently.

An additional problem is that there is no authoritative catalogue that accurately lists the orbits of all known space debris. Jah illustrates this with a web-based database that he has developed. It draws on several sources, such as catalogues maintained by the US and Russian governments, to visualise where objects are in space. When he types in an identifier for a particular space object, the database draws a purple line to designate its orbit. Only this doesn't quite work for a number of objects, such as a Russian rocket body designated in the database as object number 32280. When Jah enters that number, the database draws two purple lines: the US and Russian sources contain two completely different orbits for the same object. Jah says that it is almost impossible to tell which is correct, unless a third source of information made it possible to cross-correlate.

Jah describes himself as a space environmentalist: 'I want to make space a place that is safe to operate, that is free and useful for generations to come.' Until that happens, he argues, the space community will continue devolving into a tragedy in which all spaceflight operators are polluting a common resource.""",
                    "questions": [
                        {"number": 27, "type": "matching_information", "question_text": "a reference to the cooperation that takes place to try and minimise risk", "answer": "C"},
                        {"number": 28, "type": "matching_information", "question_text": "an explanation of a person's aims", "answer": "F"},
                        {"number": 29, "type": "matching_information", "question_text": "a description of a major collision that occurred in space", "answer": "A"},
                        {"number": 30, "type": "matching_information", "question_text": "a comparison between tracking objects in space and the efficiency of a transportation system", "answer": "E"},
                        {"number": 31, "type": "matching_information", "question_text": "a reference to efforts to classify space junk", "answer": "B"},
                        {"number": 32, "type": "summary_completion", "answer": "sustainability"},
                        {"number": 33, "type": "summary_completion", "answer": "fuel"},
                        {"number": 34, "type": "summary_completion", "answer": "explosions"},
                        {"number": 35, "type": "summary_completion", "answer": "bankrupt"},
                        {"number": 36, "type": "matching_features", "question_text": "Knowing the exact location of space junk would help prevent any possible danger.", "answer": "C"},
                        {"number": 37, "type": "matching_features", "question_text": "Space should be available to everyone and should be preserved for the future.", "answer": "D"},
                        {"number": 38, "type": "matching_features", "question_text": "A recommendation regarding satellites is widely ignored.", "answer": "B"},
                        {"number": 39, "type": "matching_features", "question_text": "There is conflicting information about where some satellites are in space.", "answer": "D"},
                        {"number": 40, "type": "matching_features", "question_text": "There is a risk we will not be able to undo the damage that occurs in space.", "answer": "A"}
                    ],
                    "matching_people": {
                        "A": "Carolin Frueh",
                        "B": "Holger Krag",
                        "C": "Marlon Sorge",
                        "D": "Moriba Jah"
                    }
                }
            ],
            "answer_key": {
                1: "lettuces", 2: "1,000 kg", 3: "(food) consumption", 4: "pesticides", 5: "journeys",
                6: "producers", 7: "flavour", 8: "TRUE", 9: "NOT GIVEN", 10: "FALSE",
                11: "TRUE", 12: "FALSE", 13: "NOT GIVEN",
                14: "B", 15: "A", 16: "C", 17: "E", 18: "B", 19: "B", 20: "C",
                21: "C", 22: "fire", 23: "nutrients", 24: "cavities", 25: "hawthorn", 26: "rare",
                27: "C", 28: "F", 29: "A", 30: "E", 31: "B",
                32: "sustainability", 33: "fuel", 34: "explosions", 35: "bankrupt",
                36: "C", 37: "D", 38: "B", 39: "D", 40: "A"
            }
        },
        "writing": {
            "total_tasks": 2,
            "duration": "60 minutes",
            "tasks": [
                {
                    "task_number": 1,
                    "task_type": "report",
                    "description": "Describe visual information",
                    "word_limit": "at least 150 words",
                    "time_suggestion": "20 minutes",
                    "visual_type": "line_graph",
                    "visual_url": "https://customer-assets.emergentagent.com/job_syncflow-6/artifacts/5olsly9y_cambridge%2018%20test%201%20writing%20task%201.png",
                    "prompt": "The graph below gives information about the percentage of the population in four Asian countries living in cities from 1970 to 2020, with predictions for 2030 and 2040.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant."
                },
                {
                    "task_number": 2,
                    "task_type": "essay",
                    "description": "Write an essay",
                    "word_limit": "at least 250 words",
                    "time_suggestion": "40 minutes",
                    "prompt": "In many countries, people are now living longer than ever before. Some people say an ageing population creates problems for governments. Other people think there are benefits if society has more elderly people.\n\nTo what extent do the advantages of having an ageing population outweigh the disadvantages?"
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
                    "topics": ["Home/Accommodation", "Work or Studies", "Colours"],
                    "sample_questions": [
                        "Do you live in a house or a flat?",
                        "What do you do? Work or study?",
                        "What's your favourite colour?",
                        "Did you like any colours as a child?",
                        "Do you think colours affect the way people feel?"
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "cue_card": {
                        "topic": "Describe a successful person you admire",
                        "points": [
                            "who this person is",
                            "how you know about this person",
                            "what they do to be successful",
                            "and explain why you admire this person"
                        ]
                    }
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "topic": "Success and achievement",
                    "sample_questions": [
                        "What makes a person successful?",
                        "Is success more about talent or hard work?",
                        "Do you think success is important in life?",
                        "How do people in your country define success?"
                    ]
                }
            ]
        }
    }
}
