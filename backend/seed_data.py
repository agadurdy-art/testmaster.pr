"""Seed script with proper IELTS test structure - ready for your content"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path
import uuid

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding database with proper IELTS structure...")
    
    await db.tests.delete_many({})
    await db.tips.delete_many({})
    await db.courses.delete_many({})
    
    # READING TEST 1 - Proper IELTS Academic Structure (Cambridge 19 Reading Test 2 content currently)
    reading_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Reading Practice Test 1",
        "test_type": "reading",
        "duration": 60,
        "passages": [
            {
                "id": 1,
                "title": "Passage 1: How tennis rackets have changed",
                "text": """In 2016, the British professional tennis player Andy Murray was ranked as the world's number one. It was an incredible achievement by any standard - made even more remarkable by the fact that he did this during a period considered to be one of the strongest in the sport's history, competing against the likes of Rafael Nadal, Roger Federer and Novak Djokovic, to name just a few. Yet five years previously, he had been regarded as a talented outsider who entered but never won the major tournaments.

Of the changes that account for this transformation, one was visible and widely publicised: in 2011, Murray invited former number one player Ivan Lendl onto his coaching team - a valuable addition that had a visible impact on the player's playing style. Another change was so subtle as to pass more or less unnoticed. Like many players, Murray has long preferred a racket that consists of two types of string: one for the mains (verticals) and another for the crosses (horizontals). While he continued to use natural string in the crosses, in 2012 he switched to a synthetic string for the mains. A small change, perhaps, but its importance should not be underestimated.

The modification that Murray made is just one of a number of options available to players looking to tweak their rackets in order to improve their games. 'Touring professionals have their rackets customised to their specific needs,' says Colin Triplow, a UK-based professional racket stringer. 'It's a highly important part of performance maximisation.' Consequently, the specific rackets used by the world's elite are not actually readily available to the public; rather, each racket is individually made to suit the player who uses it. Take the US professional tennis players Mike and Bob Bryan, for example: 'We're very particular with our racket specifications,' they say. 'All our rackets are sent from our manufacturer to Tampa, Florida, where our frames go through a thorough customisation process.' They explain how they have adjusted not only racket length, but even experimented with different kinds of paint. The rackets they use now weigh more than the average model and also have a denser string pattern (i.e. more crosses and mains).

The primary reason for these modifications is simple: as the line between winning and losing becomes thinner and thinner, even these slight changes become more and more important. As a result, players and their teams are becoming increasingly creative with the modifications to their rackets as they look to maximise their competitive advantage.

Racket modifications mainly date back to the 1970s, when the amateur German tennis player Werner Fischer started playing with the so-called spaghetti-strung racket. It created a string bed that generated so much topspin that it was quickly banned by the International Tennis Federation.

However, within a decade or two, racket modification became a regularity. Today it is, in many ways, an aspect of the game that is equal in significance to nutrition or training.

Modifications can be divided into two categories: those to the string bed and those to the racket frame. The former is far more common than the latter: the choice of the strings and the tension with which they are installed is something that nearly all professional players experiment with. They will continually change it depending on various factors including the court surface, climatic conditions, and game styles. Some will even change it depending on how they feel at the time.

At one time, all tennis rackets were strung with natural gut made from the outer layer of sheep or cow intestines. This all changed in the early 1990s with the development of synthetic strings that were cheaper and more durable. They are made from three materials: nylon (relatively durable and affordable), Kevlar (too stiff to be used alone) or co-polyester (polyester combined with additives that enhance its performance). Even so, many professional players continue to use a 'hybrid set-up', where a combination of both synthetic and natural strings are used.

Of the synthetics, co-polyester is by far the most widely used. It's a perfect fit for the style of tennis now played, where players tend to battle it out from the back of the court rather than coming to the net. Studies indicate that the average spin from a co-polyester string is 25% greater than that from natural string or other synthetics. In a sense, the development of co-polyester strings has revolutionised the game.

However, many players go beyond these basic adjustments to the strings and make changes to the racket frame itself. For example, much of the serving power of US professional player Pete Sampras was attributed to the addition of four to five lead weights onto his rackets, and today many professionals have the weight adjusted during the manufacturing process.

Other changes to the frame involve the handle. Players have individual preferences for the shape of the handle and some will have the handle of one racket moulded onto the frame of a different racket. Other players make different changes. The professional Portuguese player Gonçalo Oliveira replaced the original grips of his rackets with something thinner because they had previously felt uncomfortable to hold.

Racket customisation and modification have pushed the standards of the game to greater levels that few could have anticipated in the days of natural strings and heavy, wooden frames, and it's exciting to see what further developments there will be in the future."""
            },
            {
                "id": 2,
                "title": "Passage 2: The pirates of the ancient Mediterranean",
                "text": """When one mentions pirates, an image springs to most people's minds of a crew of misfits, daredevils and adventurers in command of a tall sailing ship in the Caribbean Sea. Yet from the first to the third millennium BCE, thousands of years before these swashbucklers began spreading fear across the Caribbean, pirates prowled the Mediterranean, raiding merchant ships and threatening vital trade routes. However, despite all efforts and the might of various ancient states, piracy could not be stopped. The situation remained unchanged for thousands of years. Only when the pirates directly threatened the interests of ancient Rome did the Roman Republic organise a massive fleet to eliminate piracy. Under the command of the Roman general Pompey, Rome eradicated piracy, transforming the Mediterranean into Mare Nostrum ('Our Sea').

Although piracy in the Mediterranean is first recorded in ancient Egypt during the reign of Pharaoh Amenhotep III (c 1390–1353 BCE), it is reasonable to assume it predated this powerful civilisation. This is partly due to the great importance the Mediterranean held at this time, and partly due to its geography. While the Mediterranean region is predominantly fertile, some parts are rugged and hilly, even mountainous. In the ancient times, the inhabitants of these areas relied heavily on marine resources, including fish and salt. Most had their own boats, possessed good seafaring skills, and unsurpassed knowledge of the local coastline and sailing routes. Thus, it is not surprising that during hardships, these men turned to piracy. Geography itself further benefited the pirates, with the numerous coves along the coast providing places for them to hide their boats and strike undetected. Before the invention of ocean-going caravels in the 15th century, ships could not easily cross long distances over open water. Thus, in the ancient world most were restricted to a few well-known navigable routes that followed the coastline. Caught in a trap, a slow merchant ship laden with goods had no other option but to surrender. In addition, knowledge of the local area helped the pirates to avoid retaliation once a state fleet arrived.

One should also add that it was not unknown in the first and second millennia BCE for governments to resort to pirates' services, especially during wartime, employing their skills and numbers against their opponents. A pirate fleet would serve in the first wave of attack, preparing the way for the navy. Some of the regions were known for providing safe harbours to pirates, who, in return, boosted the local economy.

The first known record of a named group of Mediterranean pirates, made during the rule of ancient Egyptian Pharaoh Akhenaten (c 1353–1336 BCE), was in the Amarna Letters. These were extracts of diplomatic correspondence between the pharaoh and his allies, and covered many pressing issues, including piracy. It seems the pharaoh was troubled by two distinct pirate groups, the Lukka and the Sherden. Despite the Egyptian fleet's best efforts, the pirates continued to cause substantial disruption to regional commerce. In the letters, the king of Alashiya (modern Cyprus) rejected Akhenaten's claims of a connection with the Lukka (based in modern-day Turkey). The king assured Akhenaten he was prepared to punish any of his subjects involved in piracy.

The ancient Greek world's experience of piracy was different from that of Egyptian rulers. While Egypt's power was land-based, the ancient Greeks relied on the Mediterranean in almost all aspects of life, from trade to warfare. Interestingly, in his works the Iliad and the Odyssey, the ancient Greek writer Homer not only condones, but praises the lifestyle and actions of pirates. The opinion remained unchanged in the following centuries. The ancient Greek historian Thucydides, for instance, glorified pirates' daring attacks on ships or even cities. For Greeks, piracy was a part of everyday life. Even high-ranking members of the state were not beyond engaging in such activities. According to the Greek orator Demosthenes, in 355 BCE, Athenian ambassadors made a detour from their official travel to capture a ship sailing from Egypt, taking the wealth found onboard for themselves! The Greeks' liberal approach towards piracy does not mean they always tolerated it, but attempts to curtail piracy were hampered by the large number of pirates operating in the Mediterranean.

The rising power of ancient Rome required the Roman Republic to deal with piracy in the Mediterranean. While piracy was a serious issue for the Republic, Rome profited greatly from its existence. Pirate raids provided a steady source of slaves, essential for Rome's agriculture and mining industries. But this arrangement could work only while the pirates left Roman interests alone. Pirate attacks on grain ships, which were essential to Roman citizens, led to angry voices in the Senate, demanding punishment of the culprits. Rome, however, did nothing, further encouraging piracy. By the 1st century BCE, emboldened pirates kidnapped prominent Roman dignitaries, asking for a large ransom to be paid. Their most famous hostage was none other than Julius Caesar, captured in 75 BCE.

By now, Rome was well aware that pirates had outlived their usefulness. The time had come for concerted action. In 67 BCE, a new law granted Pompey vast funds to combat the Mediterranean menace. Taking personal command, Pompey divided the entire Mediterranean into 13 districts, assigning a fleet and commander to each. After cleansing one district of pirates, the fleet would join another in the next district. The process continued until the entire Mediterranean was free of pirates. Although thousands of pirates died at the hands of Pompey's troops, as a long-term solution to the problem, many more were offered land in fertile areas located far from the sea. Instead of a maritime menace, Rome got productive farmers that further boosted its economy."""
            },
            {
                "id": 3,
                "title": "Passage 3: The persistence and peril of misinformation",
                "text": """Misinformation – both deliberately promoted and accidentally shared – is perhaps an inevitable part of the world in which we live, but it is not a new problem. People likely have lied to one another for roughly as long as verbal communication has existed. Deceiving others can offer an apparent opportunity to gain strategic advantage, to motivate others to action, or even to protect interpersonal bonds. Moreover, people inadvertently have been sharing inaccurate information with one another for thousands of years.

However, we currently live in an era in which technology enables information to reach large audiences distributed across the globe, and thus the potential for immediate and widespread effects from misinformation now looms larger than in the past. Yet the means to correct misinformation might, over time, be found in those same patterns of mass communication and of the facilitated spread of information.

The main worry regarding misinformation is its potential to unduly influence attitudes and behaviour, leading people to think and act differently than they would if they were correctly informed, as suggested by the research teams of Stephan Lewandowsky of the University of Bristol and Elisabeth Marsh of Duke University, among others. In other words, we worry that misinformation might lead people to hold misperceptions (or false beliefs) and that these misperceptions, especially when they occur among large groups of people, may have detrimental downstream consequences for health, social harmony, and the political climate.

At least three observations related to misinformation in the contemporary mass-media environment warrant the attention of researchers, policy makers, and really everyone who watches television, listens to the radio, or reads information online. First of all, people who encounter misinformation tend to believe it, at least initially. Secondly, electronic and print media often do not block many types of misinformation before it appears in content available to large audiences. Thirdly, countering misinformation once it has enjoyed wide exposure can be a resource-intensive effort.

Knowing what happens when people initially encounter misinformation holds tremendous importance for estimating the potential for subsequent problems. Although it is fairly routine for individuals to come across information that is false, the question of exactly how – and when – we mentally label information as true or false has prompted considerable philosophical debate. The dilemma is perhaps best summarised by a contrast between the 17th-century philosophers René Descartes and Baruch Spinoza. The claims recently have been empirically tested in novel ways. Descartes argued that a person only accepts or rejects information after considering it for its truth or falsehood; Spinoza argued that people accept all encountered information (or misinformation) by default and then subsequently verify or reject it through a separate cognitive process. In recent decades, empirical evidence from the research teams of Erik Asp of the University of Chicago and Daniel Gilbert at Harvard University, among others, has supported Spinoza's account: people appear to encode all new information as if it were true, even if only momentarily, and later tag the information as being either true or false, a pattern that seems consistent with the observation that mental resources for scepticism physically reside in a different part of the brain than the resources used in perceiving and encoding.

What about our second observation: that misinformation often can appear in electronic or print media without being preemptively blocked? In support of this, one might consider the nature of regulatory structures in the United States: regulatory agencies here tend to focus on post hoc detection of broadcast information. Organizations such as the Food and Drug Administration (FDA) offer considerable monitoring and notification functions, but these roles typically do not involve preemptive censoring. The FDA oversees direct-to-consumer prescription drug advertising, for example, and has developed mechanisms such as the 'Bad Ad' program, through which people can report advertising in apparent violation of FDA guidelines on drug risks. Such programs, although laudable and useful, do not keep false advertising off the airwaves. In addition, even misinformation that is successfully corrected can continue to affect attitudes.

This leads us to our third observation: a campaign to correct misinformation, even if rhetorically compelling, requires resources and planning to accomplish necessary reach and frequency. For corrective campaigns to be persuasive, audiences need to be able to comprehend them, which requires either effort to frame messages in ways that are accessible or effort to educate and sensitize audiences to the possibility of misinformation. That some audiences might be unaware of the potential for misinformation also suggests the utility of media literacy efforts as early as elementary school. Even with journalists and scholars pointing to the phenomenon of 'fake news', people do not distinguish between demonstrably false stories and those based in fact when scanning and processing written information.

We live at a time when widespread misinformation is common. Yet at this time many people also are passionately developing potential solutions and remedies. The journey forward undoubtedly will be a long and arduous one. Future remedies will require not only continued theoretical consideration but also the development and maintenance of consistent monitoring tools – and a recognition among fellow members of society that claims which find prominence in the media that are insufficiently based in scientific consensus and social reality should be countered. Misinformation arises as a result of human fallibility and human information needs. To overcome the worst effects of the phenomenon, we will need coordinated efforts over time, rather than any singular one-time panacea we could hope to offer."""
            }
        ],
        "questions": [
            # Passage 1 Questions (1-7) - Cambridge IELTS 19
            {"id": 1, "passage": 1, "type": "true_false_notgiven", "question": "People had expected Andy Murray to become the world's top tennis player for at least five years before 2016."},
            {"id": 2, "passage": 1, "type": "true_false_notgiven", "question": "The change that Andy Murray made to his rackets attracted a lot of attention."},
            {"id": 3, "passage": 1, "type": "true_false_notgiven", "question": "Most of the world's top players take a professional racket stringer on tour with them."},
            {"id": 4, "passage": 1, "type": "true_false_notgiven", "question": "Mike and Bob Bryan use rackets that are light in comparison to the majority of rackets."},
            {"id": 5, "passage": 1, "type": "true_false_notgiven", "question": "Werner Fischer played with a spaghetti-strung racket that he designed himself."},
            {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "The weather can affect how professional players adjust the strings on their rackets."},
            {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "It was believed that the change Pete Sampras made to his rackets contributed to his strong serve."},
            
            # Questions 8-13 - Note completion (ONE WORD ONLY)
            {"id": 8, "passage": 1, "type": "sentence_completion", "question": "Mike and Bob Bryan made changes to the types of _______ used on their rackets."},
            {"id": 9, "passage": 1, "type": "sentence_completion", "question": "Players were not allowed to use the spaghetti-strung racket because of the amount of _______ it created."},
            {"id": 10, "passage": 1, "type": "sentence_completion", "question": "Changes to rackets can be regarded as being as important as players' diets or the _______ they do."},
            {"id": 11, "passage": 1, "type": "sentence_completion", "question": "All rackets used to have natural strings made from the _______ of animals."},
            {"id": 12, "passage": 1, "type": "sentence_completion", "question": "Pete Sampras had metal _______ put into the frames of his rackets."},
            {"id": 13, "passage": 1, "type": "sentence_completion", "question": "Gonçalo Oliveira changed the _______ on his racket handles."},
            
            # Passage 2 Questions (14-26) - Cambridge IELTS 19
            {"id": 14, "passage": 2, "type": "matching_information", "question": "A reference to a denial of involvement in piracy", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 15, "passage": 2, "type": "matching_information", "question": "Details of how a campaign to eradicate piracy was carried out", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 16, "passage": 2, "type": "matching_information", "question": "A mention of the circumstances in which states in the ancient world would make use of pirates", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 17, "passage": 2, "type": "matching_information", "question": "A reference to how people today commonly view pirates", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 18, "passage": 2, "type": "matching_information", "question": "An explanation of how some people were encouraged not to return to piracy", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 19, "passage": 2, "type": "matching_information", "question": "A mention of the need for many sailing vessels to stay relatively close to land", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 20, "passage": 2, "type": "multiple_choice", "question": "Which TWO statements does the writer make about inhabitants of the Mediterranean region in the ancient world?", "options": ["A) They often used stolen vessels to carry out pirate attacks", "B) They managed to escape capture by the authorities because they knew the area so well", "C) They paid for information about the routes merchant ships would take", "D) They depended more on the sea for their livelihood than on farming", "E) They stored many of the goods taken in pirate attacks in coves along the coastline"]},
            {"id": 21, "passage": 2, "type": "multiple_choice", "question": "Which TWO statements does the writer make about inhabitants of the Mediterranean region in the ancient world? (Select TWO)", "options": ["A) They often used stolen vessels to carry out pirate attacks", "B) They managed to escape capture by the authorities because they knew the area so well", "C) They paid for information about the routes merchant ships would take", "D) They depended more on the sea for their livelihood than on farming", "E) They stored many of the goods taken in pirate attacks in coves along the coastline"]},
            {"id": 22, "passage": 2, "type": "multiple_choice", "question": "Which TWO statements does the writer make about piracy and ancient Greece?", "options": ["A) The state estimated that very few people were involved in piracy", "B) Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written", "C) Important officials were known to occasionally take part in piracy", "D) Every citizen regarded pirate attacks on cities as unacceptable", "E) A favourable view of piracy is evident in certain ancient Greek texts"]},
            {"id": 23, "passage": 2, "type": "multiple_choice", "question": "Which TWO statements does the writer make about piracy and ancient Greece? (Select TWO)", "options": ["A) The state estimated that very few people were involved in piracy", "B) Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written", "C) Important officials were known to occasionally take part in piracy", "D) Every citizen regarded pirate attacks on cities as unacceptable", "E) A favourable view of piracy is evident in certain ancient Greek texts"]},
            {"id": 24, "passage": 2, "type": "sentence_completion", "question": "Complete the summary about Ancient Rome and piracy: Rome profited from piracy because raids provided _______ for agriculture and mining."},
            {"id": 25, "passage": 2, "type": "sentence_completion", "question": "Pirates attacked _______ ships that were essential for Roman citizens."},
            {"id": 26, "passage": 2, "type": "sentence_completion", "question": "Julius Caesar was captured by pirates and held for _______."},
            
            # Passage 3 Questions (27-40) - Cambridge IELTS 19
            {"id": 27, "passage": 3, "type": "multiple_choice", "question": "What point does the writer make about misinformation in the first paragraph?", "options": ["A) Misinformation is a relatively recent phenomenon", "B) Some people find it easy to identify misinformation", "C) Misinformation changes as it is passed from one person to another", "D) There may be a number of reasons for the spread of misinformation"]},
            {"id": 28, "passage": 3, "type": "multiple_choice", "question": "What does the writer say about the role of technology?", "options": ["A) It may at some point provide us with a solution to misinformation", "B) It could fundamentally alter the way in which people regard information", "C) It has changed the way in which organisations use misinformation", "D) It has made it easier for people to check whether information is accurate"]},
            {"id": 29, "passage": 3, "type": "multiple_choice", "question": "What is the writer doing in the fourth paragraph?", "options": ["A) comparing the different opinions people have of misinformation", "B) explaining how the effects of misinformation have changed over time", "C) outlining which issues connected with misinformation are significant today", "D) describing the attitude of policy makers towards misinformation in the media"]},
            {"id": 30, "passage": 3, "type": "multiple_choice", "question": "What point does the writer make about regulation in the USA?", "options": ["A) The guidelines issued by the FDA need to be simplified", "B) Regulation does not affect people's opinions of new prescription drugs", "C) The USA has more regulatory bodies than most other countries", "D) Regulation fails to prevent misinformation from appearing in the media"]},
            {"id": 31, "passage": 3, "type": "summary_completion", "question": "Although people have _______ to misinformation, there is debate about precisely how and when we label something as true or untrue.", "options": ["A) constant conflict", "B) additional evidence", "C) different locations", "D) experimental subjects", "E) short period", "F) extreme distrust", "G) frequent exposure", "H) mental operation", "I) dubious reason", "J) different ideas"]},
            {"id": 32, "passage": 3, "type": "summary_completion", "question": "The philosophers Descartes and Spinoza had _______ about how people engage with information.", "options": ["A) constant conflict", "B) additional evidence", "C) different locations", "D) experimental subjects", "E) short period", "F) extreme distrust", "G) frequent exposure", "H) mental operation", "I) dubious reason", "J) different ideas"]},
            {"id": 33, "passage": 3, "type": "summary_completion", "question": "Moreover, Spinoza believed that a distinct _______ is involved in these stages.", "options": ["A) constant conflict", "B) additional evidence", "C) different locations", "D) experimental subjects", "E) short period", "F) extreme distrust", "G) frequent exposure", "H) mental operation", "I) dubious reason", "J) different ideas"]},
            {"id": 34, "passage": 3, "type": "summary_completion", "question": "Recent research has provided _______ for Spinoza's theory.", "options": ["A) constant conflict", "B) additional evidence", "C) different locations", "D) experimental subjects", "E) short period", "F) extreme distrust", "G) frequent exposure", "H) mental operation", "I) dubious reason", "J) different ideas"]},
            {"id": 35, "passage": 3, "type": "summary_completion", "question": "It would appear that people accept all encountered information as if it were true, even if this is for an extremely _______.", "options": ["A) constant conflict", "B) additional evidence", "C) different locations", "D) experimental subjects", "E) short period", "F) extreme distrust", "G) frequent exposure", "H) mental operation", "I) dubious reason", "J) different ideas"]},
            {"id": 36, "passage": 3, "type": "summary_completion", "question": "This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in _______ in the brain.", "options": ["A) constant conflict", "B) additional evidence", "C) different locations", "D) experimental subjects", "E) short period", "F) extreme distrust", "G) frequent exposure", "H) mental operation", "I) dubious reason", "J) different ideas"]},
            {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Campaigns designed to correct misinformation will fail to achieve their purpose if people are unable to understand them."},
            {"id": 38, "passage": 3, "type": "yes_no_notgiven", "question": "Attempts to teach elementary school students about misinformation have been opposed."},
            {"id": 39, "passage": 3, "type": "yes_no_notgiven", "question": "It may be possible to overcome the problem of misinformation in a relatively short period."},
            {"id": 40, "passage": 3, "type": "yes_no_notgiven", "question": "The need to keep up with new information is hugely exaggerated in today's world."},
        ],
        "answer_key": [
            {"question_id": 1, "answer": "False", "explanation": "The first paragraph tells us that five years before 2016 (when he was ranked as the number one tennis player), Andy Murray had been regarded as someone who 'never won the major tournaments'."},
            {"question_id": 2, "answer": "False", "explanation": "According to the second paragraph, Murray's switch to the use of a synthetic string in his rackets was 'so subtle as to pass more or less unnoticed', meaning that it hardly attracted any attention."},
            {"question_id": 3, "answer": "Not Given", "explanation": "In the third paragraph, Colin Triplow says that touring professionals 'have their rackets customised to their specific needs', but there is no information about when or where this is done. We're told that Mike and Bob Bryan have all their rackets customised in Florida, but this relates to just two people, not most of the world's top players."},
            {"question_id": 4, "answer": "False", "explanation": "The final sentence in the third paragraph says, 'The rackets they (Mike and Bob Bryan) use now weigh more than the average model.'"},
            {"question_id": 5, "answer": "Not Given", "explanation": "The fifth paragraph describes a racket modification (the spaghetti-strung racket) that was used by Werner Fischer, but we are not told who designed this."},
            {"question_id": 6, "answer": "True", "explanation": "According to the sixth paragraph, professional players will change the tension of their racket strings depending on 'factors including climatic conditions', so they are affected by the weather."},
            {"question_id": 7, "answer": "True", "explanation": "In the ninth paragraph, we are told that Pete Sampras added 'four or five lead weights' to his rackets, and that the power of his serve 'was attributed to (believed to be because of)' this addition."},
            {"question_id": 8, "answer": "paint", "explanation": "In the third paragraph, we are told that Mike and Bob Bryan 'experimented with different kinds of paint' on their rackets. 'String' is incorrect as they did not change the type of string used, only the density of the pattern."},
            {"question_id": 9, "answer": "topspin", "explanation": "The fifth paragraph says that the spaghetti-strung racket 'generated (created) so much topspin that it was quickly banned'."},
            {"question_id": 10, "answer": "training", "explanation": "The fifth paragraph says that racket modification became 'equal in significance (importance) to nutrition (players' diets) or training'."},
            {"question_id": 11, "answer": "intestines", "explanation": "According to the seventh paragraph, all tennis rackets were once 'strung with natural gut made from intestines'. This means that the strings were made of this substance. Note: 'gut' is also acceptable."},
            {"question_id": 12, "answer": "weights", "explanation": "The ninth paragraph of the text says that 'four or five lead weights' were added to Pete Sampras's rackets. Note: 'weight' is incorrect as the plural form is needed after 'metal'."},
            {"question_id": 13, "answer": "grips", "explanation": "The tenth paragraph describes changes made to racket handles and tells us that Gonçalo Oliveira 'replaced the original grips of his rackets'. Note: 'grip' is also acceptable."},
            {"question_id": 14, "answer": "D", "explanation": "Paragraph D explains that 'the king of Alashiya (modern Cyprus) rejected Akhenaten's claims of a connection with the Lukka (a group of pirates)', meaning that the king denied that he was involved with these pirates."},
            {"question_id": 15, "answer": "G", "explanation": "Paragraph G provides a detailed account of how Pompey carried out a campaign to free the Mediterranean of pirates. He 'divided the entire Mediterranean into 13 districts, assigning a fleet and commander to each. After cleansing one district of pirates, the fleet would join another in the next district.'"},
            {"question_id": 16, "answer": "C", "explanation": "Paragraph C tells us that sometimes governments would 'resort to (use) pirates' services' and describes the circumstances when this might happen – 'especially during wartime in the first wave of attack'."},
            {"question_id": 17, "answer": "A", "explanation": "Paragraph A begins by describing the present time, and the impression most people nowadays have of pirates – 'an image springs to most people's minds of a crew of misfits, daredevils and adventurers.'"},
            {"question_id": 18, "answer": "G", "explanation": "After describing how the Mediterranean was freed of pirates, Paragraph G tells us what happened to those pirates who survived. They were 'offered land in fertile areas located far from the sea'."},
            {"question_id": 19, "answer": "B", "explanation": "Paragraph B explains that before the 15th century, ships had to stay close to land and were 'restricted to routes that followed the coastline' as they 'could not easily cross long distances over open water'."},
            {"question_id": 20, "answer": "B", "explanation": "B is correct as the final sentence in Paragraph B states that 'knowledge of the local area helped the pirates to avoid retaliation once a state fleet arrived'."},
            {"question_id": 21, "answer": "D", "explanation": "D is correct as Paragraph B states that while most of the Mediterranean is 'fertile', certain areas are hilly or mountainous. The text says that 'the inhabitants of these areas relied heavily on marine resources, including fish and salt', meaning that they depended on resources from the sea more than farming."},
            {"question_id": 22, "answer": "C", "explanation": "C is correct: According to Paragraph E, in ancient Greece 'Even high-ranking members of the state were not beyond engaging in such activities (pirates' daring attacks)'. The phrase 'were not beyond engaging' means that they did sometimes take part in these activities."},
            {"question_id": 23, "answer": "E", "explanation": "E is correct: Paragraph E says that in his works the Iliad and the Odyssey, Homer 'not only condones (accepts), but praises the lifestyle and actions of pirates'. In addition, the historian Thucydides 'glorified pirates' daring attacks'."},
            {"question_id": 24, "answer": "slaves", "explanation": "In Paragraph F, the writer explains that pirate raids provided 'a steady source of slaves, essential for Rome's agriculture and mining industries'."},
            {"question_id": 25, "answer": "grain", "explanation": "In Paragraph F, the writer refers to 'Pirate attacks on grain ships, which were essential to Roman citizens'."},
            {"question_id": 26, "answer": "ransom", "explanation": "The text says that 'pirates kidnapped prominent Roman dignitaries, asking for a large ransom to be paid'. Julius Caesar was their most famous hostage, captured in 75 BCE."},
            {"question_id": 27, "answer": "D", "explanation": "The first paragraph gives three reasons why people may share misinformation – 'to gain advantage', 'to motivate others' and to 'protect interpersonal bonds'."},
            {"question_id": 28, "answer": "A", "explanation": "The second paragraph claims that 'the means to correct misinformation might, over time, be found in those same patterns of mass communication', that is, through the use of technology for mass communication."},
            {"question_id": 29, "answer": "C", "explanation": "The writer summarises three issues connected with misinformation (people believe it, blocking does not always happen, and it is difficult to deal with once widely shared). The first sentence explains that these are significant today because they 'warrant the attention of' a very wide range of people."},
            {"question_id": 30, "answer": "D", "explanation": "In the sixth paragraph, the writer says that in the United States, 'regulatory agencies tend to focus on post hoc (later) detection'. This tells us that regulation only comes into effect after the misinformation has already been broadcast, rather than 'preemptive censoring' which would prevent it from being broadcast in the first place."},
            {"question_id": 31, "answer": "G", "explanation": "In the fifth paragraph, the writer says that 'it is fairly routine for individuals to come across information that is false'. This means that people have frequent exposure to misinformation."},
            {"question_id": 32, "answer": "J", "explanation": "The writer describes the 'contrast' between the views of Descartes and Spinoza, and explains how they had different ideas about how people engage with information."},
            {"question_id": 33, "answer": "H", "explanation": "Spinoza argued that a 'separate cognitive process (mental operation)' was involved in verifying or rejecting information."},
            {"question_id": 34, "answer": "B", "explanation": "The writer says that 'in recent decades, empirical evidence has supported Spinoza's account'. This provides additional evidence for Spinoza's theory."},
            {"question_id": 35, "answer": "E", "explanation": "According to the text, people seem to believe all information is true 'even if only momentarily'. This means for an extremely short period."},
            {"question_id": 36, "answer": "C", "explanation": "The text says that mental resources for scepticism 'reside in a different part of the brain' from those used in perceiving and encoding. This means they are in different locations."},
            {"question_id": 37, "answer": "Yes", "explanation": "In the seventh paragraph, the writer says, 'For corrective campaigns to be persuasive, audiences need to be able to comprehend them'. This means that if people cannot understand the campaigns, the campaigns will fail to persuade people and therefore not achieve their purpose."},
            {"question_id": 38, "answer": "Not Given", "explanation": "The writer suggests that media literacy efforts in elementary schools could be useful in raising awareness of misinformation but does not say that this has been attempted or that attempts have been opposed."},
            {"question_id": 39, "answer": "No", "explanation": "In the final paragraph, the writer says, 'The journey forward (to develop solutions and remedies) undoubtedly will be a long and arduous (difficult) one.' This contradicts the idea that the problem could be overcome in a relatively short period."},
            {"question_id": 40, "answer": "Not Given", "explanation": "The writer describes what will be needed in future to address the problem of misinformation but does not refer to the need to keep up with new information or say that this is exaggerated."},
        ]
    }
    
    # Create a second Reading test entry so the UI can show Test 1 and Test 2
    # For now it reuses the same Cambridge 19 Reading content with a different title.
    reading_test_2 = dict(reading_test)
    reading_test_2["id"] = str(uuid.uuid4())
    reading_test_2["title"] = "Academic Reading Practice Test 2"
    

    
    # LISTENING TEST - Cambridge IELTS 19 Test 1
    # LISTENING TEST - Cambridge IELTS 19 Test 2
    listening_test_2 = {
        "id": str(uuid.uuid4()),
        "title": "Cambridge IELTS 19 - Test 2 - Listening",
        "test_type": "listening",
        "duration": 40,
        "sections": [
            {
                "id": 1,
                "title": "Part 1: Guitar Group enquiry",
                "context": "A telephone conversation about joining a guitar group",
                "audio_url": "https://customer-assets.emergentagent.com/job_ielts-buddy-11/artifacts/dn1r0fnc_IELTS%2019%20Track%2005.mp3"
            },
            {
                "id": 2,
                "title": "Part 2: Talk about a school sports club",
                "context": "A talk about a sports club and its activities",
                "audio_url": "https://customer-assets.emergentagent.com/job_ielts-buddy-11/artifacts/rvxwt4ru_IELTS%2019%20Track%2006.mp3"
            },
            {
                "id": 3,
                "title": "Part 3: Discussion about food trends",
                "context": "Two students discussing food trends and innovation",
                "audio_url": "https://customer-assets.emergentagent.com/job_ielts-buddy-11/artifacts/2zd9b819_IELTS%2019%20Track%2007.mp3"
            },
            {
                "id": 4,
                "title": "Part 4: Lecture on marine life and food security",
                "context": "A lecture about marine ecosystems and food security",
                "audio_url": "https://customer-assets.emergentagent.com/job_ielts-buddy-11/artifacts/y0zzip05_IELTS%2019%20Track%2008.mp3"
            }
        ],
        "questions": [
            # Part 1 - Questions 1-10 (Form completion: Guitar Group)
            {"id": 1, "section": 1, "type": "note_completion", "question": "Coordinator: Gary _______"},
            {"id": 2, "section": 1, "type": "note_completion", "question": "Level: _______"},
            {"id": 3, "section": 1, "type": "note_completion", "question": "Place: the _______"},
            {"id": 4, "section": 1, "type": "note_completion", "question": "_______ Street"},
            {"id": 5, "section": 1, "type": "note_completion", "question": "Time: Thursday morning at _______"},
            {"id": 6, "section": 1, "type": "note_completion", "question": "Recommended website: 'The perfect _______'"},
            {"id": 7, "section": 1, "type": "note_completion", "question": "First exercise: training the _______"},
            {"id": 8, "section": 1, "type": "note_completion", "question": "Second exercise: _______ along to the music"},
            {"id": 9, "section": 1, "type": "note_completion", "question": "Third exercise: playing simple _______"},
            {"id": 10, "section": 1, "type": "note_completion", "question": "Final advice: be patient and enjoy the _______"},

            # Part 2 - Questions 11-20 (Working as a lifeboat volunteer)
            {"id": 11, "section": 2, "type": "multiple_choice", "question": "What made David leave London and move to Northsea?", "options": [
                "A) He was eager to develop a hobby.",
                "B) He wanted to work shorter hours.",
                "C) He found his job in website design unsatisfying."
            ]},
            {"id": 12, "section": 2, "type": "multiple_choice", "question": "The Lifeboat Institution in Northsea was built with money provided by", "options": [
                "A) a local organisation.",
                "B) a local resident.",
                "C) the local council."
            ]},
            {"id": 13, "section": 2, "type": "multiple_choice", "question": "In his health assessment, the doctor was concerned about the fact that David", "options": [
                "A) might be colour blind.",
                "B) was rather short-sighted.",
                "C) had undergone eye surgery."
            ]},
            {"id": 14, "section": 2, "type": "multiple_choice", "question": "After arriving at the lifeboat station, they aim to launch the boat within", "options": [
                "A) five minutes.",
                "B) six to eight minutes.",
                "C) eight and a half minutes."
            ]},
            {"id": 15, "section": 2, "type": "multiple_choice", "question": "As a 'helmsman', David has the responsibility of deciding", "options": [
                "A) who will be the members of his crew.",
                "B) what equipment it will be necessary to take.",
                "C) if the lifeboat should be launched."
            ]},
            {"id": 16, "section": 2, "type": "multiple_choice", "question": "As well as going out on the lifeboat, David", "options": [
                "A) gives talks on safety at sea.",
                "B) helps with fundraising.",
                "C) recruits new volunteers."
            ]},

            # Questions 17-20: choose TWO letters A–E (modeled as single-letter answers per question)
            {"id": 17, "section": 2, "type": "multiple_choice", "question": "Which TWO things does David say about the lifeboat volunteer training? (Q17)", "options": [
                "A) The residential course developed his leadership skills.",
                "B) The training in use of ropes and knots was quite brief.",
                "C) The training exercises have built up his mental strength.",
                "D) The casualty care activities were particularly challenging for him.",
                "E) The wave tank activities provided practice in survival techniques."
            ]},
            {"id": 18, "section": 2, "type": "multiple_choice", "question": "Which TWO things does David say about the lifeboat volunteer training? (Q18)", "options": [
                "A) The residential course developed his leadership skills.",
                "B) The training in use of ropes and knots was quite brief.",
                "C) The training exercises have built up his mental strength.",
                "D) The casualty care activities were particularly challenging for him.",
                "E) The wave tank activities provided practice in survival techniques."
            ]},
            {"id": 19, "section": 2, "type": "multiple_choice", "question": "Which TWO things does David find most motivating about the work he does? (Q19)", "options": [
                "A) working as part of a team",
                "B) experiences when working in winter",
                "C) being thanked by those he has helped",
                "D) the fact that it keeps him fit",
                "E) the chance to develop new equipment"
            ]},
            {"id": 20, "section": 2, "type": "multiple_choice", "question": "Which TWO things does David find most motivating about the work he does? (Q20)", "options": [
                "A) working as part of a team",
                "B) experiences when working in winter",
                "C) being thanked by those he has helped",
                "D) the fact that it keeps him fit",
                "E) the chance to develop new equipment"
            ]},

            # Part 3 - Questions 21-30 (recycling footwear)
            {"id": 21, "section": 3, "type": "multiple_choice", "question": "At first, Don thought the topic of recycling footwear might be too", "options": [
                "A) limited in scope.",
                "B) hard to research.",
                "C) boring for listeners."
            ]},
            {"id": 22, "section": 3, "type": "multiple_choice", "question": "When discussing trainers, Bella and Don disagree about", "options": [
                "A) how popular they are among young people.",
                "B) how suitable they are for school.",
                "C) how quickly they wear out."
            ]},
            {"id": 23, "section": 3, "type": "multiple_choice", "question": "Bella says that she sometimes recycles shoes because", "options": [
                "A) they no longer fit.",
                "B) she no longer likes them.",
                "C) they are no longer in fashion."
            ]},
            {"id": 24, "section": 3, "type": "multiple_choice", "question": "What did the article say that confused Don?", "options": [
                "A) Public consumption of footwear has risen.",
                "B) Less footwear is recycled now than in the past.",
                "C) People dispose of more footwear than they used to."
            ]},
            {"id": 25, "section": 3, "type": "multiple_choice", "question": "The high-heeled shoes were rejected because", "options": [
                "A) one shoe was missing",
                "B) the colour of one shoe had faded",
                "C) one shoe had a hole in it",
                "D) the shoes were brand new",
                "E) the shoes were too dirty",
                "F) the stitching on the shoes was broken"
            ]},
            {"id": 26, "section": 3, "type": "multiple_choice", "question": "The ankle boots were rejected because", "options": [
                "A) one shoe was missing",
                "B) the colour of one shoe had faded",
                "C) one shoe had a hole in it",
                "D) the shoes were brand new",
                "E) the shoes were too dirty",
                "F) the stitching on the shoes was broken"
            ]},
            {"id": 27, "section": 3, "type": "multiple_choice", "question": "The baby shoes were rejected because", "options": [
                "A) one shoe was missing",
                "B) the colour of one shoe had faded",
                "C) one shoe had a hole in it",
                "D) the shoes were brand new",
                "E) the shoes were too dirty",
                "F) the stitching on the shoes was broken"
            ]},
            {"id": 28, "section": 3, "type": "multiple_choice", "question": "The trainers were rejected because", "options": [
                "A) one shoe was missing",
                "B) the colour of one shoe had faded",
                "C) one shoe had a hole in it",
                "D) the shoes were brand new",
                "E) the shoes were too dirty",
                "F) the stitching on the shoes was broken"
            ]},
            {"id": 29, "section": 3, "type": "multiple_choice", "question": "Why did the project to make 'new' shoes out of old shoes fail?", "options": [
                "A) People believed the 'new' pairs of shoes were unhygienic.",
                "B) There were not enough good parts to use in the old shoes.",
                "C) The shoes in the 'new' pairs were not completely alike."
            ]},
            {"id": 30, "section": 3, "type": "multiple_choice", "question": "Bella and Don agree that they can present their topic", "options": [
                "A) from a new angle.",
                "B) with relevant images.",
                "C) in a straightforward way."
            ]},

            # Part 4 - Questions 31-40 (Tardigrades – note completion)
            {"id": 31, "section": 4, "type": "sentence_completion", "question": "Tardigrades are also known as water 'bears' due to how they _______ and 'moss piglets'."},
            {"id": 32, "section": 4, "type": "note_completion", "question": "They have a _______ round body and four pairs of legs."},
            {"id": 33, "section": 4, "type": "note_completion", "question": "They have claws or _______ for gripping."},
            {"id": 34, "section": 4, "type": "note_completion", "question": "Their body is filled with a liquid that carries both _______ and blood."},
            {"id": 35, "section": 4, "type": "note_completion", "question": "Their mouth is shaped like a _______ with teeth called stylets."},
            {"id": 36, "section": 4, "type": "note_completion", "question": "They are very resilient and can exist in very low or high _______."},
            {"id": 37, "section": 4, "type": "note_completion", "question": "A type of _______ ensures their DNA is not damaged."},
            {"id": 38, "section": 4, "type": "note_completion", "question": "Research is underway to find out how many days they can stay alive in _______."},
            {"id": 39, "section": 4, "type": "note_completion", "question": "They consume liquids found in moss or _______."},
            {"id": 40, "section": 4, "type": "note_completion", "question": "They are not considered to be _______."},
        ],
        "answer_key": [
            # Part 1
            {"question_id": 1, "answer": "Mathieson"},
            {"question_id": 2, "answer": "beginners"},
            {"question_id": 3, "answer": "college"},
            {"question_id": 4, "answer": "New"},
            {"question_id": 5, "answer": "11"},
            {"question_id": 6, "answer": "instrument"},
            {"question_id": 7, "answer": "ear"},
            {"question_id": 8, "answer": "clapping"},
            {"question_id": 9, "answer": ""},
            {"question_id": 10, "answer": ""},

            # Part 2
            {"question_id": 11, "answer": "A"},
            {"question_id": 12, "answer": "B"},
            {"question_id": 13, "answer": "A"},
            {"question_id": 14, "answer": "B"},
            {"question_id": 15, "answer": "C"},
            {"question_id": 16, "answer": "A"},
            {"question_id": 17, "answer": "C"},
            {"question_id": 18, "answer": "E"},
            {"question_id": 19, "answer": "A"},
            {"question_id": 20, "answer": "B"},

            # Part 3
            {"question_id": 21, "answer": "A"},
            {"question_id": 22, "answer": "B"},
            {"question_id": 23, "answer": "B"},
            {"question_id": 24, "answer": "B"},
            {"question_id": 25, "answer": "E"},
            {"question_id": 26, "answer": "B"},
            {"question_id": 27, "answer": "A"},
            {"question_id": 28, "answer": "C"},
            {"question_id": 29, "answer": "B"},
            {"question_id": 30, "answer": "A"},

            # Part 4
            {"question_id": 31, "answer": "move"},
            {"question_id": 32, "answer": "short"},
            {"question_id": 33, "answer": "discs"},
            {"question_id": 34, "answer": "oxygen"},
            {"question_id": 35, "answer": "tube"},
            {"question_id": 36, "answer": "temperatures"},
            {"question_id": 37, "answer": "protein"},
            {"question_id": 38, "answer": "space"},
            {"question_id": 39, "answer": "seaweed"},
            {"question_id": 40, "answer": "endangered"},
        ]
    }

    listening_test = {
        "id": str(uuid.uuid4()),
        "title": "Cambridge IELTS 19 - Test 1 - Listening",
        "test_type": "listening",
        "duration": 40,
        "sections": [
            {
                "id": 1,
                "title": "Part 1: Conversation about Hinchingbrooke Country Park",
                "context": "A conversation about educational visits to a country park",
                "audio_url": "https://customer-assets.emergentagent.com/job_ieltsace/artifacts/i09fo3b5_IELTS%2019%20Track%2001.mp3"
            },
            {
                "id": 2,
                "title": "Part 2: Information about a twinning association and Farley House",
                "context": "A talk about a twinning association and directions around Farley House",
                "audio_url": "https://customer-assets.emergentagent.com/job_ieltsace/artifacts/doe7u73v_IELTS%2019%20Track%2002.mp3"
            },
            {
                "id": 3,
                "title": "Part 3: Discussion about innovation projects",
                "context": "Two students discussing their innovation projects",
                "audio_url": "https://customer-assets.emergentagent.com/job_ieltsace/artifacts/105tkh6h_IELTS%2019%20Track%2003.mp3"
            },
            {
                "id": 4,
                "title": "Part 4: Lecture on an academic subject",
                "context": "A lecture on an academic topic",
                "audio_url": "https://customer-assets.emergentagent.com/job_ieltsace/artifacts/i6iw429j_IELTS%2019%20Track%2004.mp3"
            }
        ],
        "questions": [
            # Part 1 - Questions 1-10 (Note completion)
            {"id": 1, "section": 1, "type": "note_completion", "question": "Area: _______ hectares"},
            {"id": 2, "section": 1, "type": "note_completion", "question": "Wetland: lakes, ponds and a _______"},
            {"id": 3, "section": 1, "type": "note_completion", "question": "Science: Children look at _______ about plants, etc."},
            {"id": 4, "section": 1, "type": "note_completion", "question": "Geography: includes learning to use a _______ and compass"},
            {"id": 5, "section": 1, "type": "note_completion", "question": "Leisure and tourism: mostly concentrates on the park's _______"},
            {"id": 6, "section": 1, "type": "note_completion", "question": "Music: Children make _______ with natural materials"},
            {"id": 7, "section": 1, "type": "note_completion", "question": "They give children a feeling of _______ that they may not have elsewhere"},
            {"id": 8, "section": 1, "type": "note_completion", "question": "Children learn new _______ and gain self-confidence"},
            {"id": 9, "section": 1, "type": "note_completion", "question": "Cost per child: £_______"},
            {"id": 10, "section": 1, "type": "note_completion", "question": "Adults, such as _______, free"},
            
            # Part 2 - Questions 11-20
            {"id": 11, "section": 2, "type": "multiple_choice", "question": "During the visit to Malatte, in France, members especially enjoyed", "options": ["A) going to a theme park", "B) experiencing a river trip", "C) visiting a cheese factory"]},
            {"id": 12, "section": 2, "type": "multiple_choice", "question": "What will happen in Stanthorpe to mark the 25th anniversary of the Twinning Association?", "options": ["A) A tree will be planted", "B) A garden seat will be bought", "C) A footbridge will be built"]},
            {"id": 13, "section": 2, "type": "multiple_choice", "question": "Which event raised most funds this year?", "options": ["A) the film show", "B) the pancake evening", "C) the cookery demonstration"]},
            {"id": 14, "section": 2, "type": "multiple_choice", "question": "For the first evening with the French visitors host families are advised to", "options": ["A) take them for a walk round the town", "B) go to a local restaurant", "C) have a meal at home"]},
            {"id": 15, "section": 2, "type": "multiple_choice", "question": "On Saturday evening there will be the chance to", "options": ["A) listen to a concert", "B) watch a match", "C) take part in a competition"]},
            {"id": 16, "section": 2, "type": "map_labeling", "question": "Farm shop (Label the map - write the correct letter A-H)"},
            {"id": 17, "section": 2, "type": "map_labeling", "question": "Disabled entry (Label the map - write the correct letter A-H)"},
            {"id": 18, "section": 2, "type": "map_labeling", "question": "Adventure playground (Label the map - write the correct letter A-H)"},
            {"id": 19, "section": 2, "type": "map_labeling", "question": "Kitchen gardens (Label the map - write the correct letter A-H)"},
            {"id": 20, "section": 2, "type": "map_labeling", "question": "The Temple of the Four Winds (Label the map - write the correct letter A-H)"},
            
            # Part 3 - Questions 21-30
            {"id": 21, "section": 3, "type": "multiple_choice_two", "question": "Which TWO things did Colin find most satisfying about his bread reuse project?", "options": ["A) receiving support from local restaurants", "B) finding a good way to prevent waste", "C) overcoming problems in a basic process", "D) experimenting with designs and colours", "E) learning how to apply 3-D printing"]},
            {"id": 22, "section": 3, "type": "multiple_choice_two", "question": "Which TWO things did Colin find most satisfying about his bread reuse project? (Select TWO)", "options": ["A) receiving support from local restaurants", "B) finding a good way to prevent waste", "C) overcoming problems in a basic process", "D) experimenting with designs and colours", "E) learning how to apply 3-D printing"]},
            {"id": 23, "section": 3, "type": "multiple_choice_two", "question": "Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future?", "options": ["A) for use on medical products", "B) to show that food is no longer fit to eat", "C) for use with drinks as well as foods", "D) to provide applications for blind people", "E) to indicate the weight of certain foods"]},
            {"id": 24, "section": 3, "type": "multiple_choice_two", "question": "Which TWO ways do the students agree that touch-sensitive sensors for food labels could be developed in future? (Select TWO)", "options": ["A) for use on medical products", "B) to show that food is no longer fit to eat", "C) for use with drinks as well as foods", "D) to provide applications for blind people", "E) to indicate the weight of certain foods"]},
            {"id": 25, "section": 3, "type": "matching", "question": "Use of local products"},
            {"id": 26, "section": 3, "type": "matching", "question": "Reduction in unnecessary packaging"},
            {"id": 27, "section": 3, "type": "matching", "question": "Gluten-free and lactose-free food"},
            {"id": 28, "section": 3, "type": "matching", "question": "Use of branded products related to celebrity chefs"},
            {"id": 29, "section": 3, "type": "matching", "question": "Development of 'ghost kitchens' for takeaway food"},
            {"id": 30, "section": 3, "type": "matching", "question": "Use of mushrooms for common health concerns"},
            
            # Part 4 - Questions 31-40 (Céide Fields lecture)
            {"id": 31, "section": 4, "type": "sentence_completion", "question": "In the 1930s, a local teacher realised that stones beneath the bog surface were once _______"},
            {"id": 32, "section": 4, "type": "sentence_completion", "question": "His _______ became an archaeologist and undertook an investigation of the site"},
            {"id": 33, "section": 4, "type": "sentence_completion", "question": "A traditional method used by local people to dig for _______ was used to identify where stones were located"},
            {"id": 34, "section": 4, "type": "sentence_completion", "question": "Items are well preserved in the bog because of a lack of _______"},
            {"id": 35, "section": 4, "type": "sentence_completion", "question": "Houses were _______ in shape and had a hole in the roof"},
            {"id": 36, "section": 4, "type": "sentence_completion", "question": "Pots used for storage and to make _______"},
            {"id": 37, "section": 4, "type": "sentence_completion", "question": "Each field at Céide was large enough to support a big _______"},
            {"id": 38, "section": 4, "type": "sentence_completion", "question": "The fields were probably used to restrict the grazing of animals – no evidence of structures to house them during _______"},
            {"id": 39, "section": 4, "type": "sentence_completion", "question": "Reasons for the decline in farming: a decline in _______ quality"},
            {"id": 40, "section": 4, "type": "sentence_completion", "question": "Reasons for the decline in farming: an increase in _______"},
        ],
        "answer_key": [
            # Part 1
            {"question_id": 1, "answer": "69"},
            {"question_id": 2, "answer": "stream"},
            {"question_id": 3, "answer": "data"},
            {"question_id": 4, "answer": "map"},
            {"question_id": 5, "answer": "visitors"},
            {"question_id": 6, "answer": "sounds"},
            {"question_id": 7, "answer": "freedom"},
            {"question_id": 8, "answer": "skills"},
            {"question_id": 9, "answer": "4.95"},
            {"question_id": 10, "answer": "leaders"},
            # Part 2
            {"question_id": 11, "answer": "B"},
            {"question_id": 12, "answer": "A"},
            {"question_id": 13, "answer": "B"},
            {"question_id": 14, "answer": "C"},
            {"question_id": 15, "answer": "A"},
            {"question_id": 16, "answer": "G"},
            {"question_id": 17, "answer": "C"},
            {"question_id": 18, "answer": "B"},
            {"question_id": 19, "answer": "D"},
            {"question_id": 20, "answer": "A"},
            # Part 3 (21&22 and 23&24 in either order)
            {"question_id": 21, "answer": "B"},
            {"question_id": 22, "answer": "D"},
            {"question_id": 23, "answer": "A"},
            {"question_id": 24, "answer": "E"},
            {"question_id": 25, "answer": "D"},
            {"question_id": 26, "answer": "G"},
            {"question_id": 27, "answer": "C"},
            {"question_id": 28, "answer": "B"},
            {"question_id": 29, "answer": "F"},
            {"question_id": 30, "answer": "H"},
            # Part 4
            {"question_id": 31, "answer": "walls"},
            {"question_id": 32, "answer": "son"},
            {"question_id": 33, "answer": "fuel"},
            {"question_id": 34, "answer": "oxygen"},
            {"question_id": 35, "answer": "rectangular"},
            {"question_id": 36, "answer": "lamps"},
            {"question_id": 37, "answer": "family"},
            {"question_id": 38, "answer": "winter"},
            {"question_id": 39, "answer": "soil"},
            {"question_id": 40, "answer": "rain"},
        ]
    }
    
    # WRITING TEST - Cambridge IELTS 19 Test 1
    writing_test = {
        "id": str(uuid.uuid4()),
        "title": "Academic Writing Test 1",
        "test_type": "writing",
        "duration": 60,
        "questions": [
            {
                "id": 1,
                "task": "task1",
                "type": "graph_description",
                "question": """The graph below gives information on the numbers of participants for different activities at one social centre in Melbourne, Australia for the period 2000 to 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.""",
                "image_url": "https://customer-assets.emergentagent.com/job_ielts-buddy-11/artifacts/ws4df3j7_Screenshot%202025-11-22%20at%2021.50.56.png",
                "word_limit": 150,
                "time_suggestion": 20
            },
            {
                "id": 2,
                "task": "task2",
                "type": "essay",
                "question": """Some people think that competition at work, at school and in daily life is a good thing. Others believe that we should try to cooperate more, rather than competing against each other.

Discuss both these views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.""",
                "word_limit": 250,
                "time_suggestion": 40
            }
        ],
        "answer_key": []
    }
    
    # SPEAKING TEST - Cambridge-style prompts (International food & law)
    speaking_test = {
        "id": str(uuid.uuid4()),
        "title": "Speaking Practice Test 1",
        "test_type": "speaking",
        "duration": 15,
        "parts": [
            {
                "part": 1,
                "title": "Introduction and interview",
                "duration": "4-5 minutes",
                "topics": ["International food"],
                "questions": [
                    "Can you find food from many different countries where you live? [Why/Why not?]",
                    "How often do you eat typical food from other countries? [Why/Why not?]",
                    "Have you ever tried making food from another country? [Why/Why not?]",
                    "What food from your country would you recommend to people from other countries? [Why?]"
                ]
            },
            {
                "part": 2,
                "title": "Individual long turn",
                "duration": "3-4 minutes",
                "preparation_time": "1 minute",
                "questions": [
                    """Describe a law that was introduced in your country and that you thought was a very good idea.

You should say:
what the law was
who introduced it
when and why it was introduced
and explain why you thought this law was such a good idea.

You will have to talk about the topic for one to two minutes. You have one minute to think about what you are going to say. You can make some notes to help you if you wish."""
                ]
            },
            {
                "part": 3,
                "title": "Two-way discussion",
                "duration": "4-5 minutes",
                "questions": [
                    # School rules
                    "What kinds of rules are common in a school?",
                    "How important is it to have rules in a school?",
                    "What do you recommend should happen if children break school rules?",
                    # Working in the legal profession
                    "Can you suggest why many students decide to study law at university?",
                    "What are the key personal qualities needed to be a successful lawyer?",
                    "Do you agree that working in the legal profession is very stressful?"
                ]
            }
        ],
        "questions": [
            {"id": 1, "part": 1, "question": "Can you find food from many different countries where you live? [Why/Why not?]"},
            {"id": 2, "part": 1, "question": "How often do you eat typical food from other countries? [Why/Why not?]"},
            {"id": 3, "part": 1, "question": "Have you ever tried making food from another country? [Why/Why not?]"},
            {"id": 4, "part": 1, "question": "What food from your country would you recommend to people from other countries? [Why?]"},
            {"id": 5, "part": 2, "question": "Describe a law that was introduced in your country and that you thought was a very good idea. You should say what the law was, who introduced it, when and why it was introduced, and explain why you thought this law was such a good idea."},
            {"id": 6, "part": 3, "question": "What kinds of rules are common in a school?"},
            {"id": 7, "part": 3, "question": "How important is it to have rules in a school?"},
            {"id": 8, "part": 3, "question": "What do you recommend should happen if children break school rules?"},
            {"id": 9, "part": 3, "question": "Can you suggest why many students decide to study law at university?"},
            {"id": 10, "part": 3, "question": "What are the key personal qualities needed to be a successful lawyer?"},
            {"id": 11, "part": 3, "question": "Do you agree that working in the legal profession is very stressful?"}
        ],
        "answer_key": []
    }
    
    await db.tests.insert_many([reading_test, reading_test_2, listening_test, listening_test_2, writing_test, speaking_test])
    print("✅ Tests seeded with proper IELTS structure")
    
    # Tips remain the same
    tips = [
        {
            "id": str(uuid.uuid4()),
            "title": "Reading: Skimming and Scanning",
            "category": "reading",
            "content": """**Master these essential techniques:**

**Skimming** - Read quickly to get the general idea:
• Read the title, headings, and first/last paragraphs
• Look at any images, charts, or highlighted text
• Don't read every word - just get the main points

**Scanning** - Search for specific information:
• Know what you're looking for before you scan
• Move your eyes quickly over the text
• Stop only when you find the keyword or answer

**Time-saving tips:**
• Skim all passages first (2-3 minutes total)
• Read questions before detailed reading
• Use pencil to mark key information"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Writing Task 2: Essay Structure",
            "category": "writing",
            "content": """**Perfect essay structure for Band 7+:**

**Introduction (50 words)**
• Paraphrase the question
• State your thesis/position clearly

**Body Paragraph 1 (100 words)**
• Topic sentence with main idea
• Explanation and development
• Specific example or evidence
• Linking sentence to next paragraph

**Body Paragraph 2 (100 words)**
• Second main point
• Full development with examples
• Counter-argument if relevant

**Conclusion (40 words)**
• Summarize main points
• Restate position clearly
• No new information

**Key tips:**
• Plan for 5 minutes before writing
• Use linking words naturally
• Vary your sentence structures"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Listening: Note-Taking Techniques",
            "category": "listening",
            "content": """**Effective note-taking strategies:**

**Before listening:**
• Read all questions carefully
• Predict possible answers
• Identify keywords

**While listening:**
• Write abbreviated notes
• Focus on keywords, not full sentences
• Listen for signpost words (firstly, however, finally)
• Don't panic if you miss an answer - move on

**After each section:**
• You have 30 seconds to check answers
• Correct any spelling quickly
• Make educated guesses for missed questions

**Common traps to avoid:**
• Distractors - similar sounding words
• Changed answers - speaker corrects themselves
• Plural vs singular forms"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Speaking Part 2: PREP Method",
            "category": "speaking",
            "content": """**Use PREP to organize your 2-minute talk:**

**P - Point**: State your main topic clearly
*"The person who has influenced me most is my grandmother."*

**R - Reason**: Explain why
*"She taught me the importance of education and perseverance."*

**E - Example**: Give specific details
*"When I was struggling with mathematics in school, she would spend hours helping me..."*

**P - Point**: Conclude by restating
*"That's why my grandmother has been such an important influence in my life."*

**Time management:**
• Use full 1 minute to make notes
• Aim for 1.5-2 minutes (don't stop early)
• Speak naturally - don't memorize scripts"""
        }
    ]
    
    await db.tips.insert_many(tips)
    print("✅ Tips seeded")
    
    # IELTS Masterclass video-based course (built from a single YouTube video)
    courses = [
        {
            "id": str(uuid.uuid4()),
            "title": "IELTS Masterclass",
            "description": "Video-based masterclass covering all IELTS skills (Listening, Reading, Writing, Speaking) with practical strategies for a higher band score.",
            "video_url": "https://www.youtube.com/watch?v=xGtKdsVxV8A",
            "modules": [
                {
                    "id": 1,
                    "title": "Exam Overview & Strategy",
                    "lessons": [
                        {"id": 1, "title": "IELTS Format and Band Descriptors", "duration": "20 min"},
                        {"id": 2, "title": "Common Mistakes and How to Avoid Them", "duration": "20 min"},
                        {"id": 3, "title": "Overall Strategy for Band 7+", "duration": "20 min"}
                    ]
                },
                {
                    "id": 2,
                    "title": "Reading Skills",
                    "lessons": [
                        {"id": 1, "title": "Question Types Overview", "duration": "25 min"},
                        {"id": 2, "title": "Skimming & Scanning Techniques", "duration": "30 min"},
                        {"id": 3, "title": "True/False/Not Given & Yes/No/Not Given", "duration": "25 min"},
                        {"id": 4, "title": "Matching Headings & Paragraph Information", "duration": "25 min"}
                    ]
                },
                {
                    "id": 3,
                    "title": "Writing Task 1",
                    "lessons": [
                        {"id": 1, "title": "Understanding Graphs and Charts", "duration": "25 min"},
                        {"id": 2, "title": "Task 1 Structure and Key Language", "duration": "30 min"},
                        {"id": 3, "title": "Describing Trends and Comparisons", "duration": "25 min"}
                    ]
                },
                {
                    "id": 4,
                    "title": "Writing Task 2",
                    "lessons": [
                        {"id": 1, "title": "Essay Question Types & Planning", "duration": "30 min"},
                        {"id": 2, "title": "High-band Introductions and Conclusions", "duration": "25 min"},
                        {"id": 3, "title": "Developing Ideas and Examples", "duration": "25 min"},
                        {"id": 4, "title": "Advanced Vocabulary & Grammar for Writing", "duration": "30 min"}
                    ]
                },
                {
                    "id": 5,
                    "title": "Listening Skills",
                    "lessons": [
                        {"id": 1, "title": "Understanding Different Accents", "duration": "20 min"},
                        {"id": 2, "title": "Note-taking & Predicting Answers", "duration": "25 min"},
                        {"id": 3, "title": "Traps, Distractors and Spelling", "duration": "25 min"}
                    ]
                },
                {
                    "id": 6,
                    "title": "Speaking Skills",
                    "lessons": [
                        {"id": 1, "title": "Part 1: First Impressions & Simple Answers", "duration": "20 min"},
                        {"id": 2, "title": "Part 2: Cue Card Structure and PREP Method", "duration": "25 min"},
                        {"id": 3, "title": "Part 3: Extending Answers & Complex Discussion", "duration": "25 min"},
                        {"id": 4, "title": "Pronunciation, Fluency & Coherence", "duration": "25 min"}
                    ]
                },
                {
                    "id": 7,
                    "title": "Exam Day & Practice Plan",
                    "lessons": [
                        {"id": 1, "title": "Creating a 4-week Study Plan", "duration": "20 min"},
                        {"id": 2, "title": "Test-day Strategy and Mindset", "duration": "20 min"}
                    ]
                }
            ]
        }
    ]
    
    await db.courses.insert_many(courses)
    print("✅ Courses seeded")
    
    print("\n🎉 Database seeded with authentic IELTS test structure!")
    print("\n📝 Note: You can now add your Cambridge IELTS content through the admin interface.")
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_database())
