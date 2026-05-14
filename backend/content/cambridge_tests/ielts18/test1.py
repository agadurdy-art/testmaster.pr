"""
Cambridge IELTS 18 - Test 1
Complete test with full content extracted from official Cambridge materials
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
                    "audio_file": "/static/audio/330dmao1_18_section1-part1_169e5c57.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Transport survey",
                        "sections": [
                            {
                                "heading": "Personal details",
                                "items": [
                                    "Name: Sadie Jones",
                                    "Year of birth: 1991",
                                    "Postcode: ___1___"
                                ]
                            },
                            {
                                "heading": "Travelling by bus",
                                "items": [
                                    "Date of bus journey: ___2___",
                                    "Reason for trip: shopping and visit to the ___3___",
                                    "Travelled by bus because cost of ___4___ too high",
                                    "Got on bus at ___5___ Street"
                                ]
                            },
                            {
                                "heading": "Complaints about bus service",
                                "items": [
                                    "bus today was ___6___",
                                    "frequency of buses in the ___7___"
                                ]
                            },
                            {
                                "heading": "Other transport",
                                "items": [
                                    "Goes to the ___8___ by car",
                                    "Dislikes travelling by bike in the city centre because of the ___9___",
                                    "Doesn't own a bike because of a lack of ___10___"
                                ]
                            }
                        ]
                    },
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
                    "audio_file": "/static/audio/ut6d1tyx_18_section1-part2_9e800ca4.mp3",
                    "questions": [
                        {
                            "number": 11,
                            "type": "multiple_choice",
                            "question_text": "Why does the speaker apologise about the seats?",
                            "options": ["A They are too small.", "B There are not enough of them.", "C Some of them are very close together."],
                            "answer": "C"
                        },
                        {
                            "number": 12,
                            "type": "multiple_choice",
                            "question_text": "What does the speaker say about the age of volunteers?",
                            "options": ["A The age of volunteers is less important than other factors.", "B Young volunteers are less reliable than older ones.", "C Most volunteers are about 60 years old."],
                            "answer": "A"
                        },
                        {
                            "number": 13,
                            "type": "multiple_choice",
                            "question_text": "What does the speaker say about training?",
                            "options": ["A It is continuous.", "B It is conducted by a manager.", "C It takes place online."],
                            "answer": "A"
                        },
                        {
                            "number": "14-15",
                            "type": "multiple_selection",
                            "question_text": "Which TWO issues does the speaker ask the audience to consider before they apply to be volunteers?",
                            "options": ["A their financial situation", "B their level of commitment", "C their work experience", "D their ambition", "E their availability"],
                            "answer": ["B", "E"],
                            "select_count": 2
                        },
                        {
                            "number": "16-20",
                            "type": "matching",
                            "instruction": "What does the speaker suggest would be helpful for each of the following areas of voluntary work?",
                            "items": [
                                {"number": 16, "item": "Fundraising"},
                                {"number": 17, "item": "Litter collection"},
                                {"number": 18, "item": "'Playmates'"},
                                {"number": 19, "item": "Story club"},
                                {"number": 20, "item": "First aid"}
                            ],
                            "options_title": "Helpful things volunteers might offer",
                            "options": ["A a good memory", "B experience on stage", "C original, new ideas", "D parenting skills", "E an understanding of food and diet", "F a good level of fitness", "G retail experience"],
                            "answers": {"16": "B", "17": "G", "18": "D", "19": "A", "20": "F"}
                        }
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Talk on jobs in fashion design",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "Two students discussing a talk about jobs in fashion design",
                    "question_types": ["multiple_choice", "multiple_selection"],
                    "audio_file": "/static/audio/wlt7wyhd_18_section1-part3_1bcbe3ab.mp3",
                    "questions": [
                        {
                            "number": 21,
                            "type": "multiple_choice",
                            "question_text": "What problem did Chantal have at the start of the talk?",
                            "options": ["A Her view of the speaker was blocked.", "B She was unable to find an empty seat.", "C The students next to her were talking."],
                            "answer": "A"
                        },
                        {
                            "number": 22,
                            "type": "multiple_choice",
                            "question_text": "What were Hugo and Chantal surprised to hear about the job market?",
                            "options": ["A It has become more competitive than it used to be.", "B There is more variety in it than they had realised.", "C Some areas of it are more exciting than others."],
                            "answer": "B"
                        },
                        {
                            "number": 23,
                            "type": "multiple_choice",
                            "question_text": "Hugo and Chantal agree that the speaker's message was",
                            "options": ["A unfair to them at times.", "B hard for them to follow.", "C critical of the industry."],
                            "answer": "A"
                        },
                        {
                            "number": 24,
                            "type": "multiple_choice",
                            "question_text": "What do Hugo and Chantal criticise about their school careers advice?",
                            "options": ["A when they received the advice", "B how much advice was given", "C who gave the advice"],
                            "answer": "C"
                        },
                        {
                            "number": 25,
                            "type": "multiple_choice",
                            "question_text": "When discussing their future, Hugo and Chantal disagree on",
                            "options": ["A which is the best career in fashion.", "B when to choose a career in fashion.", "C why they would like a career in fashion."],
                            "answer": "B"
                        },
                        {
                            "number": 26,
                            "type": "multiple_choice",
                            "question_text": "How does Hugo feel about being an unpaid assistant?",
                            "options": ["A He is realistic about the practice.", "B He feels the practice is dishonest.", "C He thinks others want to change the practice."],
                            "answer": "A"
                        },
                        {
                            "number": "27-28",
                            "type": "multiple_selection",
                            "question_text": "Which TWO mistakes did the speaker admit she made in her first job?",
                            "options": ["A being dishonest to her employer", "B paying too much attention to how she looked", "C expecting to become well known", "D trying to earn a lot of money", "E openly disliking her client"],
                            "answer": ["B", "E"],
                            "select_count": 2
                        },
                        {
                            "number": "29-30",
                            "type": "multiple_selection",
                            "question_text": "Which TWO pieces of retail information do Hugo and Chantal agree would be useful?",
                            "options": ["A the reasons people return fashion items", "B how much time people have to shop for clothes", "C fashion designs people want but can't find", "D the best time of year for fashion buying", "E the most popular fashion sizes"],
                            "answer": ["A", "C"],
                            "select_count": 2
                        }
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Elephant translocation",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "A lecture about elephant translocation",
                    "question_types": ["note_completion"],
                    "audio_file": "/static/audio/6ozv5g9b_18_section1-part4_2f3172fc.mp3",
                    "instructions": "Complete the notes below. Write ONE WORD ONLY for each answer.",
                    "visual": {
                        "type": "notes",
                        "title": "Elephant translocation",
                        "sections": [
                            {
                                "heading": "Reasons for overpopulation at Majete National Park",
                                "items": [
                                    "strict enforcement of anti-poaching laws",
                                    "successful breeding"
                                ]
                            },
                            {
                                "heading": "Problems caused by elephant overpopulation",
                                "items": [
                                    "greater competition, causing hunger for elephants",
                                    "damage to ___31___ in the park"
                                ]
                            },
                            {
                                "heading": "The translocation process",
                                "items": [
                                    "a suitable group of elephants from the same ___32___ was selected",
                                    "vets and park staff made use of ___33___ to help guide the elephants into an open plain",
                                    "elephants were immobilised with tranquilisers",
                                    "this process had to be completed quickly to reduce ___34___",
                                    "elephants had to be turned on their ___35___ to avoid damage to their lungs",
                                    "elephants' ___36___ had to be monitored constantly",
                                    "tracking devices were fitted to the matriarchs",
                                    "data including the size of their tusks and ___37___ was taken",
                                    "elephants were taken by truck to their new reserve"
                                ]
                            },
                            {
                                "heading": "Advantages of translocation at Nkhotakota Wildlife Park",
                                "items": [
                                    "___38___ opportunities",
                                    "a reduction in the number of poachers and ___39___",
                                    "an example of conservation that other parks can follow",
                                    "an increase in ___40___ as a contributor to GDP"
                                ]
                            }
                        ]
                    },
                    "questions": [
                        {"number": 31, "type": "note_completion", "answer": "fences"},
                        {"number": 32, "type": "note_completion", "answer": "family"},
                        {"number": 33, "type": "note_completion", "answer": "helicopters"},
                        {"number": 34, "type": "note_completion", "answer": "stress"},
                        {"number": 35, "type": "note_completion", "answer": "sides"},
                        {"number": 36, "type": "note_completion", "answer": "breathing"},
                        {"number": 37, "type": "note_completion", "answer": "feet"},
                        {"number": 38, "type": "note_completion", "answer": "employment"},
                        {"number": 39, "type": "note_completion", "answer": "weapons"},
                        {"number": 40, "type": "note_completion", "answer": "tourism"}
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
                    "title": "Urban farming",
                    "subtitle": "In Paris, urban farmers are trying a soil-free approach to agriculture that uses less space and fewer resources. Could it help cities face the threats to our food supplies?",
                    "question_range": "1-13",
                    "question_count": 13,
                    "text": """On top of a striking new exhibition hall in southern Paris, the world's largest urban rooftop farm has started to bear fruit. Strawberries that are small, intensely flavoured and resplendently red sprout abundantly from large plastic tubes. Peer inside and you see the tubes are completely hollow, the roots of dozens of strawberry plants dangling down inside them. From identical vertical tubes nearby burst row upon row of lettuces; near those are aromatic herbs, such as basil, sage and peppermint. Opposite, in narrow, horizontal trays packed not with soil but with coconut fibre, grow cherry tomatoes, shiny aubergines and brightly coloured chards.

Pascal Hardy, an engineer and sustainable development consultant, began experimenting with vertical farming and aeroponic growing towers — as the soil-free plastic tubes are known — on his Paris apartment block roof five years ago. The urban rooftop space above the exhibition hall is somewhat bigger: 14,000 square metres and almost exactly the size of a couple of football pitches. Already, the team of young urban farmers who tend it have picked, in one day, 3,000 lettuces and 150 punnets of strawberries. When the remaining two thirds of the vast open area are in production, 20 staff will harvest up to 1,000 kg of perhaps 35 different varieties of fruit and vegetables, every day. 'We're not ever, obviously, going to feed the whole city this way,' cautions Hardy. 'In the urban environment you're working with very significant practical constraints, clearly, on what you can do and where. But if enough unused space can be developed like this, there's no reason why you shouldn't eventually target maybe between 5% and 10% of consumption.'

Perhaps most significantly, however, this is a real-life showcase for the work of Hardy's flourishing urban agriculture consultancy, Agripolis, which is currently fielding enquiries from around the world to design, build and equip a new breed of soil-free inner-city farm. 'The method's advantages are many,' he says. 'First, I don't much like the fact that most of the fruit and vegetables we eat have been treated with something like 17 different pesticides, or that the intensive farming techniques that produced them are such huge generators of greenhouse gases. I don't much like the fact, either, that they've travelled an average of 2,000 refrigerated kilometres to my plate, that their quality is so poor, because the varieties are selected for their capacity to withstand such substantial journeys, or that 80% of the price I pay goes to wholesalers and transport companies, not the producers.'

Produce grown using this soil-free method, on the other hand — which relies solely on a small quantity of water, enriched with organic nutrients, pumped around a closed circuit of pipes, towers and trays — is 'produced up here, and sold locally, just down there. It barely travels at all,' Hardy says. 'You can select crop varieties for their flavour, not their resistance to the transport and storage chain, and you can pick them when they're really at their best, and not before.' No soil is exhausted, and the water that gently showers the plants' roots every 12 minutes is recycled, so the method uses 90% less water than a classic intensive farm for the same yield.

Urban farming is not, of course, a new phenomenon. Inner-city agriculture is booming from Shanghai to Detroit and Tokyo to Bangkok. Strawberries are being grown in disused shipping containers, mushrooms in underground carparks. Aeroponic farming, he says, is 'virtuous'. The equipment weighs little, can be installed on almost any flat surface and is cheap to buy: roughly €100 to €150 per square metre. It is cheap to run, too, consuming a tiny fraction of the electricity used by some techniques.

Produce grown this way typically sells at prices that, while generally higher than those of classic intensive agriculture, are lower than soil-based organic growers. There are limits to what farmers can grow this way, of course, and much of the produce is suited to the summer months. 'Root vegetables we cannot do, at least not yet,' he says. 'Radishes are OK, but carrots, potatoes, that kind of thing — the roots are simply too long. Fruit trees are obviously not an option. And beans tend to take up a lot of space for not much return.' Nevertheless, urban farming of the kind being practised in Paris is one part of a bigger and fast-changing picture that is bringing food production closer to our lives.""",
                    "questions": [
                        {
                            "number": "1-3",
                            "type": "sentence_completion",
                            "instruction": "Complete the sentences below. Choose NO MORE THAN TWO WORDS AND/OR A NUMBER from the passage for each answer.",
                            "title": "Urban farming in Paris",
                            "items": [
                                {"number": 1, "text": "Vertical tubes are used to grow strawberries, _____ overall.", "answer": "lettuces"},
                                {"number": 2, "text": "There will eventually be a daily harvest of as much as _____ weight of fruit and vegetables.", "answer": "1,000 kg"},
                                {"number": 3, "text": "It may be possible that the farm's produce will account for as much as 10% of the city's _____.", "answer": "consumption"}
                            ]
                        },
                        {
                            "number": "4-7",
                            "type": "table_completion",
                            "instruction": "Complete the table below. Choose ONE WORD ONLY from the passage for each answer.",
                            "title": "Intensive farming versus aeroponic urban farming",
                            "table": {
                                "headers": ["", "Growth", "Selection", "Sale"],
                                "rows": [
                                    {
                                        "label": "Intensive farming",
                                        "cells": [
                                            "wide range of ___4___ techniques pollute air",
                                            "quality not good; varieties of fruit and vegetables chosen that can survive long ___5___",
                                            "___6___ receive very little of overall income"
                                        ]
                                    },
                                    {
                                        "label": "Aeroponic urban farming",
                                        "cells": [
                                            "no soil used; nutrients added to water, which is recycled",
                                            "produce chosen because of its ___7___",
                                            "sold locally"
                                        ]
                                    }
                                ]
                            },
                            "items": [
                                {"number": 4, "answer": "pesticides"},
                                {"number": 5, "answer": "journeys"},
                                {"number": 6, "answer": "producers"},
                                {"number": 7, "answer": "flavour"}
                            ]
                        },
                        {
                            "number": "8-13",
                            "type": "true_false_not_given",
                            "instruction": "Do the following statements agree with the information given in Reading Passage 1? Write TRUE if the statement agrees with the information, FALSE if the statement contradicts the information, NOT GIVEN if there is no information on this.",
                            "statements": [
                                {"number": 8, "statement": "Urban farming can take place above or below ground.", "answer": "TRUE"},
                                {"number": 9, "statement": "Some of the equipment used in aeroponic farming can be made by hand.", "answer": "NOT GIVEN"},
                                {"number": 10, "statement": "Urban farming relies more on electricity than some other types of farming.", "answer": "FALSE"},
                                {"number": 11, "statement": "Fruit and vegetables grown on an aeroponic urban farm are cheaper than traditionally grown organic produce.", "answer": "TRUE"},
                                {"number": 12, "statement": "Most produce can be grown on an aeroponic urban farm at any time of the year.", "answer": "FALSE"},
                                {"number": 13, "statement": "Beans take longer to grow on an urban farm than other vegetables.", "answer": "NOT GIVEN"}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Forest management in Pennsylvania, USA",
                    "subtitle": "How managing low-quality wood (also known as low-use wood) for bioenergy can encourage sustainable forest management",
                    "question_range": "14-26",
                    "question_count": 13,
                    "text": """A
A tree's 'value' depends on several factors including its species, size, form, condition, quality, function, and accessibility, and depends on the management goals for a given forest. The same tree can be valued very differently by each person who looks at it. A large, straight black cherry tree has high value as timber to be cut into logs or made into furniture, but for a landowner more interested in wildlife habitat, the real value of that stem (or trunk) may be the food it provides to animals. Likewise, if the tree suffers from black knot disease, its value for timber decreases, but to a woodworker interested in making bowls, it brings an opportunity for a unique and beautiful piece of art.

B
In the past, Pennsylvania landowners were solely interested in the value of their trees as high-quality timber. The norm was to remove the stems of highest quality and leave behind poorly formed trees that were not as well suited to the site where they grew. This practice, called 'high-grading', has left a legacy of 'low-use wood' in the forests. Some people even call these 'junk trees', and they are abundant in Pennsylvania. These trees have lower economic value for traditional timber markets, compete for growth with higher-value trees, shade out desirable regeneration and decrease the health of a stand, leaving it more vulnerable to poor weather and disease. Management that specifically targets low-use wood can help landowners manage these forest health issues, and wood energy markets help promote this.

C
Wood energy markets can accept less expensive wood material of lower quality than would be suitable for traditional timber markets. Most wood used for energy in Pennsylvania is used to produce heat or electricity through combustion. Many schools and hospitals use wood boiler systems to heat and power their facilities, many homes are primarily heated with wood, and some coal plants incorporate wood into their coal streams to produce electricity. Wood can also be gasified for electrical generation and can even be made into liquid fuels like ethanol and gasoline for lorries and cars. All these products are made primarily from low-use wood. Several tree- and plant-cutting approaches, which could greatly improve the long-term quality of a forest, focus strongly or solely on the use of wood for those markets.

D
One such approach is called a Timber Stand Improvement (TSI) Cut. In a TSI Cut, really poor-quality tree and plant material is cut down to allow more space, light, and other resources to the highest-valued stems that remain. Removing invasive plants might be another primary goal of a TSI Cut. The stems that are left behind might then grow in size and develop more foliage and larger crowns or tops that produce more coverage for wildlife; they have a better chance to regenerate in a less crowded environment. TSI Cuts can be tailored to one farmer's specific management goals for his or her land.

E
Another approach that might yield a high amount of low-use wood is a Salvage Cut. With the many pests and pathogens visiting forests including hemlock wooly adelgid, Asian longhorned beetle, emerald ash borer, and gypsy moth, to name just a few, it is important to remember that those working in the forests can help ease these issues through cutting procedures. These types of cut reduce the number of sick trees and seek to manage the future spread of a pest problem. They leave vigorous trees that have stayed healthy enough to survive the outbreak.

F
A Shelterwood Cut, which only takes place in a mature forest that has already been thinned several times, involves removing all the mature trees when other seedlings have become established. This then allows the forester to decide which tree species are regenerated. It leaves a young forest where all trees are at a similar point in their growth. It can also be used to develop a two-tier forest so that there are two harvests and the money that comes in is spread out over a decade or more.

G
Thinnings and dense and dead wood removal for fire prevention also center on the production of low-use wood. However, it is important to remember that some retention of what many would classify as low-use wood is very important. The tops of trees that have been cut down should be left on the site so that their nutrients cycle back into the soil. In addition, trees with many cavities are extremely important habitats for insect predators like woodpeckers, bats and small mammals. They help control problem insects and increase the health and resilience of the forest. It is also important to remember that not all small trees are low-use. For example, many species like hawthorn provide food for wildlife. Finally, rare species of trees in a forest should also stay behind as they add to its structural diversity.""",
                    "questions": [
                        {
                            "number": "14-18",
                            "type": "matching_information",
                            "instruction": "Reading Passage 2 has seven paragraphs, A-G. Which paragraph contains the following information? NB You may use any letter more than once.",
                            "items": [
                                {"number": 14, "text": "bad outcomes for a forest when people focus only on its financial reward", "answer": "B"},
                                {"number": 15, "text": "reference to the aspects of any tree that contribute to its worth", "answer": "A"},
                                {"number": 16, "text": "mention of the potential use of wood to help run vehicles", "answer": "C"},
                                {"number": 17, "text": "examples of insects that attack trees", "answer": "E"},
                                {"number": 18, "text": "an alternative name for trees that produce low-use wood", "answer": "B"}
                            ]
                        },
                        {
                            "number": "19-21",
                            "type": "matching_features",
                            "instruction": "Look at the following purposes (Questions 19-21) and the list of timber cuts below. Match each purpose with the correct timber cut, A, B or C. NB You may use any letter more than once.",
                            "items": [
                                {"number": 19, "text": "to remove trees that are diseased", "answer": "B"},
                                {"number": 20, "text": "to generate income across a number of years", "answer": "C"},
                                {"number": 21, "text": "to create a forest whose trees are close in age", "answer": "C"}
                            ],
                            "options_title": "List of Timber Cuts",
                            "options": ["A a TSI Cut", "B a Salvage Cut", "C a Shelterwood Cut"]
                        },
                        {
                            "number": "22-26",
                            "type": "sentence_completion",
                            "instruction": "Complete the sentences below. Choose ONE WORD ONLY from the passage for each answer.",
                            "items": [
                                {"number": 22, "text": "Some dead wood is removed to avoid the possibility of _____.", "answer": "fire"},
                                {"number": 23, "text": "The _____ from the tops of cut trees can help improve soil quality.", "answer": "nutrients"},
                                {"number": 24, "text": "Some damaged trees should be left, as their _____ provide habitats for a range of creatures.", "answer": "cavities"},
                                {"number": 25, "text": "Some trees that are small, such as _____, are a source of food for animals and insects.", "answer": "hawthorn"},
                                {"number": 26, "text": "Any trees that are _____ should be left to grow, as they add to the variety of species in the forest.", "answer": "rare"}
                            ]
                        }
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Conquering Earth's space junk problem",
                    "subtitle": "Satellites, rocket shards and collision debris are creating major traffic risks in orbit around the planet. Researchers are working to reduce these threats",
                    "question_range": "27-40",
                    "question_count": 14,
                    "text": """A
Last year, commercial companies, military and civil departments and amateurs sent more than 400 satellites into orbit, over four times the yearly average in the previous decade. Numbers could rise even more sharply if leading space companies follow through on plans to deploy hundreds to thousands of large constellations of satellites to space in the next few years.

All that traffic can lead to disaster. Ten years ago, a US commercial Iridium satellite smashed into an inactive Russian communications satellite called Cosmos-2251, creating thousands of new pieces of space shrapnel that now threaten other satellites in low Earth orbit — the zone stretching up to 2,000 kilometres in altitude. Altogether, there are roughly 20,000 human-made objects in orbit, from working satellites to small rocket pieces. And satellite operators can't steer away from every potential crash, because each move consumes time and fuel that could otherwise be used for the spacecraft's main job.

B
Concern about space junk goes back to the beginning of the satellite era, but the number of objects in orbit is rising so rapidly that researchers are investigating new ways of attacking the problem. Several teams are trying to improve methods for assessing what is in orbit, so that satellite operators can work more efficiently in ever-more-crowded space. Some researchers are now starting to compile a massive data set that includes the best possible information on where everything is in orbit. Others are developing taxonomies of space debris — working on measuring properties such as the shape and size of an object, so that satellite operators know how much to worry about what's coming their way.

C
The alternative, many say, is unthinkable. Just a few uncontrolled space crashes could generate enough debris to set off a runaway cascade of fragments, rendering near-Earth space unusable. 'If we go on like this, we will reach a point of no return,' says Carolin Frueh, an astrodynamical researcher at Purdue University in West Lafayette, Indiana.

D
Even as our ability to monitor space objects increases, so too does the total number of items in orbit. That means companies, governments and other players in space are collaborating in new ways to avoid a shared threat. International groups such as the Inter-Agency Space Debris Coordination Committee have developed guidelines on space sustainability. Those include inactivating satellites at the end of their useful life by venting pressurised materials or leftover fuel that might lead to explosions. The intergovernmental groups also advise lowering satellites deep enough into the atmosphere that they will burn up or disintegrate within 25 years. But so far, only about half of all missions have abided by this 25-year goal, says Holger Krag, head of the European Space Agency's space-debris office in Darmstadt, Germany. Operators of the planned large constellations of satellites say they will be responsible stewards in their enterprises in space, but Krag worries that problems could increase, despite their best intentions. 'What happens to those that fail or go bankrupt?' he asks. 'They are probably not going to spend money to remove their satellites from space.'

E
In theory, given the vastness of space, satellite operators should have plenty of room for all these missions to fly safely without ever nearing another object. So some scientists are tackling the problem of space junk by trying to find out where all the debris is to a high degree of precision. That would alleviate the need for many of the unnecessary manoeuvres that are carried out to avoid potential collisions. 'If you knew precisely where everything was, you would almost never have a problem,' says Marlon Sorge, a space-debris specialist at the Aerospace Corporation in El Segundo, California.

F
The field is called space traffic management, because it's similar to managing traffic on the roads or in the air. Think about a busy day at an airport, says Moriba Jah, an astrodynamicist at the University of Texas at Austin: planes line up in the sky, landing and taking off close to one another in a carefully choreographed routine. Air-traffic controllers know the location of the planes down to one metre in accuracy. The same can't be said for space debris. Not all objects in orbit are known, and even those included in databases are not tracked consistently.

An additional problem is that there is no authoritative catalogue that accurately lists the orbits of all known space debris. Jah illustrates this with a web-based database that he has developed. It draws on several sources, such as catalogues maintained by the US and Russian governments, to visualise where objects are in space. When he types in an identifier for a particular space object, the database draws a purple line to designate its orbit. Only this doesn't quite work for a number of objects, such as a Russian rocket body designated in the database as object number 32280. When Jah enters that number, the database draws two purple lines: the US and Russian sources contain two completely different orbits for the same object. Jah says that it is almost impossible to tell which is correct, unless a third source of information made it possible to cross-correlate.

Jah describes himself as a space environmentalist: 'I want to make space a place that is safe to operate, that is free and useful for generations to come.' Until that happens, he argues, the space community will continue devolving into a tragedy in which all spaceflight operators are polluting a common resource.""",
                    "questions": [
                        {
                            "number": "27-31",
                            "type": "matching_information",
                            "instruction": "Reading Passage 3 has six sections, A-F. Which section contains the following information?",
                            "items": [
                                {"number": 27, "text": "a reference to the cooperation that takes place to try and minimise risk", "answer": "D"},
                                {"number": 28, "text": "an explanation of a person's aims", "answer": "F"},
                                {"number": 29, "text": "a description of a major collision that occurred in space", "answer": "A"},
                                {"number": 30, "text": "a comparison between tracking objects in space and the efficiency of a transportation system", "answer": "F"},
                                {"number": 31, "text": "a reference to efforts to classify space junk", "answer": "B"}
                            ]
                        },
                        {
                            "number": "32-35",
                            "type": "summary_completion",
                            "instruction": "Complete the summary below. Choose ONE WORD ONLY from the passage for each answer.",
                            "title": "The Inter-Agency Space Debris Coordination Committee",
                            "summary_text": "The committee gives advice on how the ___32___ of space can be achieved. The committee advises that when satellites are no longer active, any unused ___33___ or pressurised material that could cause ___34___ should be removed. Although operators of large satellite constellations accept that they have obligations as stewards of space, Holger Krag points out that the operators that become ___35___ are unlikely to prioritise removing their satellites from space.",
                            "items": [
                                {"number": 32, "answer": "sustainability"},
                                {"number": 33, "answer": "fuel"},
                                {"number": 34, "answer": "explosions"},
                                {"number": 35, "answer": "bankrupt"}
                            ]
                        },
                        {
                            "number": "36-40",
                            "type": "matching_features",
                            "instruction": "Look at the following statements (Questions 36-40) and the list of people below. Match each statement with the correct person, A, B, C or D. NB You may use any letter more than once.",
                            "items": [
                                {"number": 36, "text": "Knowing the exact location of space junk would help prevent any possible danger.", "answer": "C"},
                                {"number": 37, "text": "Space should be available to everyone and should be preserved for the future.", "answer": "D"},
                                {"number": 38, "text": "A recommendation regarding satellites is widely ignored.", "answer": "B"},
                                {"number": 39, "text": "There is conflicting information about where some satellites are in space.", "answer": "D"},
                                {"number": 40, "text": "There is a risk we will not be able to undo the damage that occurs in space.", "answer": "A"}
                            ],
                            "options_title": "List of People",
                            "options": ["A Carolin Frueh", "B Holger Krag", "C Marlon Sorge", "D Moriba Jah"]
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
                    "task_type": "report",
                    "description": "Describe visual information",
                    "word_limit": "at least 150 words",
                    "time_suggestion": "20 minutes",
                    "visual_type": "line_graph",
                    "visual_url": "/static/cambridge/5olsly9y_cambridge_18_test_1_writing_task_1_2bb6c826.png",
                    "prompt": "The graph below gives information about the percentage of the population in four Asian countries living in cities from 1970 to 2020, with predictions for 2030 and 2040.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant."
                },
                {
                    "task_number": 2,
                    "task_type": "essay",
                    "description": "Write an essay",
                    "word_limit": "at least 250 words",
                    "time_suggestion": "40 minutes",
                    "prompt": "The most important aim of science should be to improve people's lives.\n\nTo what extent do you agree or disagree with this statement?"
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
                    "topics": ["Colours", "Work or studies"],
                    "sample_questions": [
                        "What's your favourite colour?",
                        "Did you like the same colours when you were a child?",
                        "What colours are the walls in your home?",
                        "What do you do? Do you work or are you a student?"
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "cue_card": {
                        "topic": "Describe a time when you helped someone",
                        "points": [
                            "who you helped",
                            "how you helped them",
                            "why you helped them",
                            "and explain how you felt about helping them"
                        ]
                    }
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "topic": "Helping others",
                    "sample_questions": [
                        "Do you think people help others more now than in the past?",
                        "What are the benefits of helping others?",
                        "Should people be paid for helping others?"
                    ]
                }
            ]
        }
    }
}


# Attach official Cambridge audioscripts to the listening section so the
# results page can render the "Audioscript" modal + per-part panels.
try:
    from .audioscripts import IELTS18_AUDIOSCRIPTS as _A
except ImportError:
    from audioscripts import IELTS18_AUDIOSCRIPTS as _A
IELTS18_TEST1["sections"]["listening"]["transcripts"] = _A.get(1, {})
del _A
