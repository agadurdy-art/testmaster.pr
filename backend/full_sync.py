"""
FULL DATABASE AUTO-SYNC - PRODUCTION GRADE
===========================================
Bu modül HER STARTUP'ta çalışır ve TÜM veritabanı içeriğini ZORLA senkronize eder.
Preview ve Production HER ZAMAN aynı veriyi gösterir.

KURAL: seed_data.py'deki veriler = veritabanındaki veriler (her zaman)

Kapsam:
- Tüm Reading testleri (Cambridge 19 formatında)
- Tüm Writing testleri (side-by-side images dahil)
- Tüm Listening testleri
- Tüm Speaking testleri
- Tüm Tips
- Tüm Courses

ASLA parça parça değil, HER ZAMAN tam sync.
"""

import logging
import uuid
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


async def full_database_sync(db):
    """
    TÜM veritabanını ZORLA senkronize eder.
    Her startup'ta çalışır - eski veriler silinir, yeni veriler eklenir.
    Preview = Production garantisi sağlar.
    """
    logger.info("=" * 60)
    logger.info("🔄 FULL DATABASE SYNC STARTING...")
    logger.info("=" * 60)
    
    try:
        # ADIM 1: Mevcut test verilerini TAMAMEN temizle
        logger.info("📦 Step 1: Clearing ALL old data...")
        
        deleted_tests = await db.tests.delete_many({})
        deleted_tips = await db.tips.delete_many({})
        deleted_courses = await db.courses.delete_many({})
        
        logger.info(f"   ✅ Deleted {deleted_tests.deleted_count} tests")
        logger.info(f"   ✅ Deleted {deleted_tips.deleted_count} tips")
        logger.info(f"   ✅ Deleted {deleted_courses.deleted_count} courses")
        
        # ADIM 2: TÜM verileri doğrudan ekle (seed_data.py'den kopyalandı)
        logger.info("📦 Step 2: Inserting ALL fresh data...")
        
        # ==================== READING TESTS ====================
        reading_test = get_reading_test_1()
        reading_test_2 = get_reading_test_2()
        
        # ==================== WRITING TESTS ====================
        writing_test = get_writing_test_1()
        writing_test_2 = get_writing_test_2()
        
        # ==================== LISTENING TESTS ====================
        listening_test = get_listening_test_1()
        listening_test_2 = get_listening_test_2()
        
        # ==================== SPEAKING TESTS ====================
        speaking_test = get_speaking_test_1()
        speaking_test_2 = get_speaking_test_2()
        
        # ==================== INSERT ALL TESTS ====================
        all_tests = [
            reading_test, reading_test_2,
            listening_test, listening_test_2,
            writing_test, writing_test_2,
            speaking_test, speaking_test_2
        ]
        
        await db.tests.insert_many(all_tests)
        logger.info(f"   ✅ Inserted {len(all_tests)} tests")
        
        # ==================== INSERT TIPS ====================
        tips = get_tips()
        await db.tips.insert_many(tips)
        logger.info(f"   ✅ Inserted {len(tips)} tips")
        
        # ==================== INSERT COURSES ====================
        courses = get_courses()
        await db.courses.insert_many(courses)
        logger.info(f"   ✅ Inserted {len(courses)} courses")
        
        # ADIM 3: Doğrulama
        logger.info("📦 Step 3: Verification...")
        
        tests_count = await db.tests.count_documents({})
        tips_count = await db.tips.count_documents({})
        courses_count = await db.courses.count_documents({})
        
        # Writing Test 2 side-by-side kontrolü
        writing_test_2_db = await db.tests.find_one({"title": "Academic Writing Test 2"})
        writing_ok = False
        if writing_test_2_db:
            questions = writing_test_2_db.get("questions", [])
            if questions:
                task1 = questions[0]
                visual_data = task1.get("visual_data", {})
                writing_ok = visual_data.get("type") == "side_by_side_images"
                images = visual_data.get("images", [])
                writing_ok = writing_ok and len(images) == 2
        
        # Reading Test 2 summary_completion_block kontrolü
        reading_test_2_db = await db.tests.find_one({"title": "Academic Reading Practice Test 2"})
        reading_ok = False
        if reading_test_2_db:
            questions = reading_test_2_db.get("questions", [])
            has_block = any(q.get("type") == "summary_completion_block" for q in questions)
            passages = reading_test_2_db.get("passages", [])
            has_passages = len(passages) == 3 and all(len(p.get("text", "")) > 500 for p in passages)
            reading_ok = has_block and has_passages
        
        logger.info(f"   Tests count: {tests_count}")
        logger.info(f"   Tips count: {tips_count}")
        logger.info(f"   Courses count: {courses_count}")
        logger.info(f"   Writing Test 2 (side-by-side images): {'✅' if writing_ok else '❌'}")
        logger.info(f"   Reading Test 2 (summary_completion_block): {'✅' if reading_ok else '❌'}")
        
        if not writing_ok or not reading_ok:
            logger.error("❌ VERIFICATION FAILED - Some critical data missing!")
        else:
            logger.info("✅ ALL VERIFICATIONS PASSED")
        
        logger.info("=" * 60)
        logger.info("✅ FULL DATABASE SYNC COMPLETE")
        logger.info("=" * 60)
        
        return True
        
    except Exception as e:
        logger.error(f"❌ FULL SYNC ERROR: {e}")
        import traceback
        traceback.print_exc()
        return False


# ==================== DATA GETTERS ====================
# Bu fonksiyonlar seed_data.py ile sync kalmalı

def get_reading_test_1():
    """Cambridge 19 Reading Test 1"""
    return {
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
            {"id": 1, "passage": 1, "type": "true_false_notgiven", "question": "People had expected Andy Murray to become the world's top tennis player for at least five years before 2016."},
            {"id": 2, "passage": 1, "type": "true_false_notgiven", "question": "The change that Andy Murray made to his rackets attracted a lot of attention."},
            {"id": 3, "passage": 1, "type": "true_false_notgiven", "question": "Most of the world's top players take a professional racket stringer on tour with them."},
            {"id": 4, "passage": 1, "type": "true_false_notgiven", "question": "Mike and Bob Bryan use rackets that are light in comparison to the majority of rackets."},
            {"id": 5, "passage": 1, "type": "true_false_notgiven", "question": "Werner Fischer played with a spaghetti-strung racket that he designed himself."},
            {"id": 6, "passage": 1, "type": "true_false_notgiven", "question": "The weather can affect how professional players adjust the strings on their rackets."},
            {"id": 7, "passage": 1, "type": "true_false_notgiven", "question": "It was believed that the change Pete Sampras made to his rackets contributed to his strong serve."},
            {"id": 8, "passage": 1, "type": "sentence_completion", "question": "Mike and Bob Bryan made changes to the types of _______ used on their rackets."},
            {"id": 9, "passage": 1, "type": "sentence_completion", "question": "Players were not allowed to use the spaghetti-strung racket because of the amount of _______ it created."},
            {"id": 10, "passage": 1, "type": "sentence_completion", "question": "Changes to rackets can be regarded as being as important as players' diets or the _______ they do."},
            {"id": 11, "passage": 1, "type": "sentence_completion", "question": "All rackets used to have natural strings made from the _______ of animals."},
            {"id": 12, "passage": 1, "type": "sentence_completion", "question": "Pete Sampras had metal _______ put into the frames of his rackets."},
            {"id": 13, "passage": 1, "type": "sentence_completion", "question": "Gonçalo Oliveira changed the _______ on his racket handles."},
            {"id": 14, "passage": 2, "type": "matching_information", "question": "A reference to a denial of involvement in piracy", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 15, "passage": 2, "type": "matching_information", "question": "Details of how a campaign to eradicate piracy was carried out", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 16, "passage": 2, "type": "matching_information", "question": "A mention of the circumstances in which states in the ancient world would make use of pirates", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 17, "passage": 2, "type": "matching_information", "question": "A reference to how people today commonly view pirates", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 18, "passage": 2, "type": "matching_information", "question": "An explanation of how some people were encouraged not to return to piracy", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": 19, "passage": 2, "type": "matching_information", "question": "A mention of the need for many sailing vessels to stay relatively close to land", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F", "G) Paragraph G"]},
            {"id": "20-21", "passage": 2, "type": "multiple_choice_multi", "question": "Which TWO statements does the writer make about inhabitants of the Mediterranean region in the ancient world?", "options": ["A) They often used stolen vessels to carry out pirate attacks", "B) They managed to escape capture by the authorities because they knew the area so well", "C) They paid for information about the routes merchant ships would take", "D) They depended more on the sea for their livelihood than on farming", "E) They stored many of the goods taken in pirate attacks in coves along the coastline"], "answer_count": 2, "answer_ids": [20, 21]},
            {"id": "22-23", "passage": 2, "type": "multiple_choice_multi", "question": "Which TWO statements does the writer make about piracy and ancient Greece?", "options": ["A) The state estimated that very few people were involved in piracy", "B) Attitudes towards piracy changed shortly after the Iliad and the Odyssey were written", "C) Important officials were known to occasionally take part in piracy", "D) Every citizen regarded pirate attacks on cities as unacceptable", "E) A favourable view of piracy is evident in certain ancient Greek texts"], "answer_count": 2, "answer_ids": [22, 23]},
            {"id": 24, "passage": 2, "type": "sentence_completion", "question": "Complete the summary about Ancient Rome and piracy: Rome profited from piracy because raids provided _______ for agriculture and mining."},
            {"id": 25, "passage": 2, "type": "sentence_completion", "question": "Pirates attacked _______ ships that were essential for Roman citizens."},
            {"id": 26, "passage": 2, "type": "sentence_completion", "question": "Julius Caesar was captured by pirates and held for _______."},
            {"id": 27, "passage": 3, "type": "multiple_choice", "question": "What point does the writer make about misinformation in the first paragraph?", "options": ["A) Misinformation is a relatively recent phenomenon", "B) Some people find it easy to identify misinformation", "C) Misinformation changes as it is passed from one person to another", "D) There may be a number of reasons for the spread of misinformation"]},
            {"id": 28, "passage": 3, "type": "multiple_choice", "question": "What does the writer say about the role of technology?", "options": ["A) It may at some point provide us with a solution to misinformation", "B) It could fundamentally alter the way in which people regard information", "C) It has changed the way in which organisations use misinformation", "D) It has made it easier for people to check whether information is accurate"]},
            {"id": 29, "passage": 3, "type": "multiple_choice", "question": "What is the writer doing in the fourth paragraph?", "options": ["A) comparing the different opinions people have of misinformation", "B) explaining how the effects of misinformation have changed over time", "C) outlining which issues connected with misinformation are significant today", "D) describing the attitude of policy makers towards misinformation in the media"]},
            {"id": 30, "passage": 3, "type": "multiple_choice", "question": "What point does the writer make about regulation in the USA?", "options": ["A) The guidelines issued by the FDA need to be simplified", "B) Regulation does not affect people's opinions of new prescription drugs", "C) The USA has more regulatory bodies than most other countries", "D) Regulation fails to prevent misinformation from appearing in the media"]},
            {"id": 31, "passage": 3, "type": "summary_completion", "question": "Although people have _______ to misinformation, there is debate about precisely how and when we label something as true or untrue."},
            {"id": 32, "passage": 3, "type": "summary_completion", "question": "The philosophers Descartes and Spinoza had _______ about how people engage with information."},
            {"id": 33, "passage": 3, "type": "summary_completion", "question": "Moreover, Spinoza believed that a distinct _______ is involved in these stages."},
            {"id": 34, "passage": 3, "type": "summary_completion", "question": "Recent research has provided _______ for Spinoza's theory."},
            {"id": 35, "passage": 3, "type": "summary_completion", "question": "It would appear that people accept all encountered information as if it were true, even if this is for an extremely _______."},
            {"id": 36, "passage": 3, "type": "summary_completion", "question": "This is consistent with the fact that the resources for scepticism and the resources for perceiving and encoding are in _______ in the brain."},
            {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Campaigns designed to correct misinformation will fail to achieve their purpose if people are unable to understand them."},
            {"id": 38, "passage": 3, "type": "yes_no_notgiven", "question": "Attempts to teach elementary school students about misinformation have been opposed."},
            {"id": 39, "passage": 3, "type": "yes_no_notgiven", "question": "It may be possible to overcome the problem of misinformation in a relatively short period."},
            {"id": 40, "passage": 3, "type": "yes_no_notgiven", "question": "The need to keep up with new information is hugely exaggerated in today's world."},
        ],
        "answer_key": [
            {"question_id": 1, "answer": "False", "explanation": "The first paragraph tells us that five years before 2016, Andy Murray had been regarded as someone who 'never won the major tournaments'."},
            {"question_id": 2, "answer": "False", "explanation": "Murray's switch to synthetic string was 'so subtle as to pass more or less unnoticed'."},
            {"question_id": 3, "answer": "Not Given", "explanation": "The text mentions racket customisation but doesn't say when or where this is done."},
            {"question_id": 4, "answer": "False", "explanation": "The rackets they use now 'weigh more than the average model'."},
            {"question_id": 5, "answer": "Not Given", "explanation": "We are told Werner Fischer used the spaghetti-strung racket, but not who designed it."},
            {"question_id": 6, "answer": "True", "explanation": "Players change string tension depending on 'factors including climatic conditions'."},
            {"question_id": 7, "answer": "False", "explanation": "The text says the change was 'believed to have contributed' but doesn't confirm it was attributed to lead weights as fact."},
            {"question_id": 8, "answer": "paint", "explanation": "Mike and Bob Bryan 'experimented with different kinds of paint'."},
            {"question_id": 9, "answer": "topspin", "explanation": "The spaghetti-strung racket 'generated so much topspin that it was quickly banned'."},
            {"question_id": 10, "answer": "training", "explanation": "Racket modification became 'equal in significance to nutrition or training'."},
            {"question_id": 11, "answer": "intestines", "explanation": "Rackets were 'strung with natural gut made from intestines'."},
            {"question_id": 12, "answer": "weights", "explanation": "'Four or five lead weights' were added to Sampras's rackets."},
            {"question_id": 13, "answer": "grips", "explanation": "Oliveira 'replaced the original grips of his rackets'."},
            {"question_id": 14, "answer": "D", "explanation": "The king of Alashiya 'rejected Akhenaten's claims of a connection with the Lukka'."},
            {"question_id": 15, "answer": "G", "explanation": "Paragraph G details how Pompey divided the Mediterranean into 13 districts."},
            {"question_id": 16, "answer": "C", "explanation": "Paragraph C explains governments would 'resort to pirates' services' during wartime."},
            {"question_id": 17, "answer": "A", "explanation": "Paragraph A describes the present-day image of pirates."},
            {"question_id": 18, "answer": "G", "explanation": "Pirates were 'offered land in fertile areas located far from the sea'."},
            {"question_id": 19, "answer": "B", "explanation": "Ships were 'restricted to routes that followed the coastline'."},
            {"question_id": "20-21", "answer": ["B", "D"], "explanation": "B: 'knowledge of the local area helped the pirates to avoid retaliation'. D: inhabitants 'relied heavily on marine resources'."},
            {"question_id": "22-23", "answer": ["C", "E"], "explanation": "C: 'high-ranking members of the state were not beyond engaging in such activities'. E: Homer 'praises the lifestyle and actions of pirates'."},
            {"question_id": 24, "answer": "grain", "explanation": "Rome needed grain ships for citizens."},
            {"question_id": 25, "answer": "punishment", "explanation": "Rome did nothing, further encouraging piracy - no punishment was given."},
            {"question_id": 26, "answer": "ransom", "explanation": "Pirates kidnapped dignitaries 'asking for a large ransom to be paid'."},
            {"question_id": 27, "answer": "D", "explanation": "The first paragraph gives multiple reasons for sharing misinformation."},
            {"question_id": 28, "answer": "A", "explanation": "'The means to correct misinformation might be found in those same patterns of mass communication'."},
            {"question_id": 29, "answer": "C", "explanation": "The writer summarises three significant issues about misinformation."},
            {"question_id": 30, "answer": "D", "explanation": "Regulatory agencies 'focus on post hoc detection' rather than 'preemptive censoring'."},
            {"question_id": 31, "answer": "G", "explanation": "Word bank answer for summary completion."},
            {"question_id": 32, "answer": "J", "explanation": "Word bank answer for summary completion."},
            {"question_id": 33, "answer": "H", "explanation": "Word bank answer for summary completion."},
            {"question_id": 34, "answer": "E", "explanation": "Word bank answer for summary completion."},
            {"question_id": 35, "answer": "C", "explanation": "Word bank answer for summary completion."},
            {"question_id": 36, "answer": "B", "explanation": "Word bank answer for summary completion."},
            {"question_id": 37, "answer": "Yes", "explanation": "'Audiences need to be able to comprehend' corrective campaigns."},
            {"question_id": 38, "answer": "No", "explanation": "The passage states attempts have been opposed."},
            {"question_id": 39, "answer": "Not Given", "explanation": "The writer doesn't specifically say if it's possible in a short period."},
            {"question_id": 40, "answer": "Not Given", "explanation": "The writer doesn't discuss the need to keep up with new information."},
        ]
    }


def get_reading_test_2():
    """Cambridge 19 Reading Test 2 - with summary_completion_block"""
    return {
        "id": str(uuid.uuid4()),
        "title": "Academic Reading Practice Test 2",
        "test_type": "reading",
        "duration": 60,
        "passages": [
            {
                "id": 1,
                "title": "Passage 1: The Industrial Revolution in Britain",
                "text": """The Industrial Revolution began in Britain in the mid-1700s and by the 1830s and 1840s had spread to many other parts of the world, including the United States. In Britain, it was a period when a largely rural, agrarian* society was transformed into an industrialised, urban one. Goods that had once been crafted by hand started to be produced in mass quantities by machines in factories, thanks to the invention of steam power and the introduction of new machines and manufacturing techniques in textiles, iron-making and other industries.

The foundations of the Industrial Revolution date back to the early 1700s, when the English inventor Thomas Newcomen designed the first modern steam engine. Called the 'atmospheric steam engine', Newcomen's invention was originally used to power machines that pumped water out of mines. In the 1760s, the Scottish engineer James Watt started to adapt one of Newcomen's models, and succeeded in making it far more efficient. Watt later worked with the English manufacturer Matthew Boulton to invent a new steam engine driven by both the forward and backward strokes of the piston, while the gear mechanism it was connected to produced rotary motion. It was a key innovation that would allow steam power to spread across British industries.

The demand for coal, which was a relatively cheap energy source, grew rapidly during the Industrial Revolution, as it was needed to run not only the factories used to produce manufactured goods, but also steam-powered transportation. In the early 1800s, the English engineer Richard Trevithick built a steam-powered locomotive, and by 1830 goods and passengers were being transported between the industrial centres of Manchester and Liverpool. In addition, steam-powered boats and ships were widely used to carry goods along Britain's canals as well as across the Atlantic.

Britain had produced textiles like wool, linen and cotton, for hundreds of years, but prior to the Industrial Revolution, the British textile business was a true 'cottage industry', with the work performed in small workshops or even homes by individual spinners, weavers and dyers. Starting in the mid-1700s, innovations like the spinning jenny and the power loom made weaving cloth and spinning yarn and thread much easier. With these machines, relatively little labour was required to produce cloth, and the new, mechanised textile factories that opened around the country were quickly able to meet customer demand for cloth both at home and abroad.

The British iron industry also underwent major change as it adopted new innovations. Chief among the new techniques was the smelting of iron ore with coke (a material made by heating coal) instead of the traditional charcoal. This method was cheaper and produced metals that were of a higher quality, enabling Britain's iron and steel production to expand in response to demand created by the Napoleonic Wars (1803-15) and the expansion of the railways from the 1830s.

The latter part of the Industrial Revolution also saw key advances in communication methods, as people increasingly saw the need to communicate efficiently over long distances. In 1837, British inventors William Cooke and Charles Wheatstone patented the first commercial telegraphy system. In the 1830s and 1840s, Samuel Morse and other inventors worked on their own versions in the United States. Cooke and Wheatstone's system was soon used for railway signalling in the UK. As the speed of the new locomotives increased, it was essential to have a fast and effective means of avoiding collisions.

The impact of the Industrial Revolution on people's lives was immense. Although many people in Britain had begun moving to the cities from rural areas before the Industrial Revolution, this accelerated dramatically with industrialisation, as the rise of large factories turned smaller towns into major cities in just a few decades. This rapid urbanisation brought significant challenges, as overcrowded cities suffered from pollution and inadequate sanitation.

Although industrialisation increased the country's economic output overall and improved the standard of living for the middle and upper classes, many poor people continued to struggle. Factory workers had to work long hours in dangerous conditions for extremely low wages. These conditions along with the rapid pace of change fuelled opposition to industrialisation. A group of British workers who became known as 'Luddites' were British weavers and textile workers who objected to the increased use of mechanised looms and knitting frames. Many had spent years learning their craft, and they feared that unskilled machine operators were robbing them of their livelihood. A few desperate weavers began breaking into factories and smashing textile machines. They called themselves Luddites after Ned Ludd, a young apprentice who was rumoured to have wrecked a textile machine in 1779.

The first major instances of machine breaking took place in 1811 in the city of Nottingham, and the practice soon spread across the country. Machine-breaking Luddites attacked and burned factories, and in some cases they even exchanged gunfire with company guards and soldiers. The workers wanted employers to stop installing new machinery, but the British government responded to the uprisings by making machine-breaking punishable by death. The unrest finally reached its peak in April 1812, when a few Luddites were shot during an attack on a mill near Huddersfield. In the days that followed, other Luddites were arrested, and dozens were hanged or transported to Australia. By 1813, the Luddite resistance had all but vanished.

* agrarian: relating to the land, especially the use of land for farming"""
            },
            {
                "id": 2,
                "title": "Passage 2: Athletes and stress",
                "text": """It isn't easy being a professional athlete. Not only are the physical demands greater than most people could handle, athletes also face intense psychological pressure during competition. This is something that British tennis player Emma Raducanu wrote about on social media following her withdrawal from the 2021 Wimbledon tournament. Though the young player had been doing well in the tournament, she began having difficulty regulating her breathing and heart rate during a match, which she later attributed to 'the accumulation of the excitement and the buzz'.

For athletes, some level of performance stress is almost unavoidable. But there are many different factors that dictate just how people's minds and bodies respond to stressful events. Typically, stress is the result of an exchange between two factors: demands and resources. An athlete may feel stressed about an event if they feel the demands on them are greater than they can handle. These demands include the high level of physical and mental effort required to succeed, and also the athlete's concerns about the difficulty of the event, their chance of succeeding, and any potential dangers such as injury. Resources, on the other hand, are a person's ability to cope with these demands. These include factors such as the competitor's degree of confidence, how much they believe they can control the situation's outcome, and whether they're looking forward to the event or not.

Each new demand or change in circumstances affects whether a person responds positively or negatively to stress. Typically, the more resources a person feels they have in handling the situation, the more positive their stress response. This positive stress response is called a challenge state. But should the person feel there are too many demands placed on them, the more likely they are to experience a negative stress response – known as a threat state. Research shows that the challenge states lead to good performance, while threat states lead to poorer performance. So, in Emma Raducanu's case, a much larger audience, higher expectations and facing a more skilful opponent, may all have led her to feel there were greater demands being placed on her at Wimbledon – but she didn't have the resources to tackle them. This led to her experiencing a threat response.

Our challenge and threat responses essentially influence how our body responds to stressful situations, as both affect the production of adrenaline and cortisol – also known as 'stress hormones'. During a challenge state, adrenaline increases the amount of blood pumped from the heart and expands the blood vessels, which allows more energy to be delivered to the muscles and brain. This increase of blood and decrease of pressure in the blood vessels has been consistently related to superior sport performance in everything from cricket batting, to golf putting and football penalty taking. But during a threat state, cortisol inhibits the positive effect of adrenaline, resulting in tighter blood vessels, higher blood pressure, slower psychological responses, and a faster heart rate. In short, a threat state makes people more anxious – they make worse decisions and perform more poorly. In tennis players, cortisol has been associated with more unsuccessful serves and greater anxiety.

That said, anxiety is also a common experience for athletes when they're under pressure. Anxiety can increase heart rate and perspiration, cause heart palpitations, muscle tremors and shortness of breath, as well as headaches, nausea, stomach pain, weakness and a desire to escape in more extreme cases. Anxiety can also reduce concentration and self-control and cause overthinking. The intensity with which a person experiences anxiety depends on the demands and resources they have. Anxiety may also manifest itself in the form of excitement or nervousness depending on the stress response. Negative stress responses can be damaging to both physical and mental health – and repeated episodes of anxiety coupled with negative responses can increase risk of heart disease and depression.

But there are many ways athletes can ensure they respond positively under pressure. Positive stress responses can be promoted through the language that they and others – such as coaches or parents – use. Psychologists can also help athletes change how they see their physiological responses – such as helping them see a higher heart rate as excitement, rather than nerves. Developing psychological skills, such as visualisation, can also help decrease physiological responses to threat. Visualisation may involve the athlete recreating a mental picture of a time when they performed well, or picturing themselves doing well in the future. This can help create a feeling of control over the stressful event. Recreating competitive pressure during training can also help athletes learn how to deal with stress. An example of this might be scoring athletes against their peers to create a sense of competition. This would increase the demands which players experience compared to a normal training session, while still allowing them to practise coping with stress."""
            },
            {
                "id": 3,
                "title": "Passage 3: An inquiry into the existence of the gifted child",
                "text": """Let us start by looking at a modern 'genius', Maryam Mirzakhani, who died at the early age of 40. She was the only woman to win the Fields Medal – the mathematical equivalent of a Nobel prize. It would be easy to assume that someone as special as Mirzakhani must have been one of those 'gifted' children, those who have an extraordinary ability in a specific sphere of activity or knowledge. But look closer and a different story emerges. Mirzakhani was born in Tehran, Iran. She went to a highly selective girls' school but maths wasn't her interest – reading was. She loved novels and would read anything she could lay her hands on. As for maths, she did rather poorly at it for the first couple of years in her middle school, but became interested when her elder brother told her about what he'd learned. He shared a famous maths problem from a magazine that fascinated her – and she was hooked.

In adult life it is clear that she was curious, excited by what she did and also resolute in the face of setbacks. One of her comments sums it up. 'Of course, the most rewarding part is the "Aha" moment, the excitement of discovery and enjoyment of understanding something new ... But most of the time, doing mathematics for me is like being on a long hike with no trail and no end in sight.' That trail took her to the heights of original research into mathematics.

Is her background unusual? Apparently not. Most Nobel prize winners were unexceptional in childhood. Einstein was slow to talk as a baby. He failed the general part of the entry test to Zurich Polytechnic – though they let him in because of high physics and maths scores. He struggled at work initially, but he kept plugging away and eventually rewrote the laws of Newtonian mechanics with his theory of relativity.

There has been a considerable amount of research on high performance over the last century that suggests it goes way beyond tested intelligence. On top of that, research is clear that brains are flexible, new neural pathways can be created, and IQ isn't fixed. For example, just because you can read stories with hundreds of pages at the age of five doesn't mean you will still be ahead of your contemporaries in your teens.

While the jury is out on giftedness being innate and other factors potentially making the difference, what is certain is that the behaviours associated with high levels of performance are replicable and most can be taught – even traits such as curiosity.

According to my colleague Prof Deborah Eyre, with whom I've collaborated on the book Great Minds and How to Grow Them, the latest neuroscience and psychological research suggests most individuals can reach levels of performance associated with the gifted and talented. However, they must be taught the right attitudes and approaches to their learning and develop the attributes of high performers – curiosity, persistence and hard work, for example – and Eyre calls this 'high performance learning'. Critically, they need the right support in developing those approaches at home as well as at school.

Prof Anders Ericsson, an eminent education psychologist at Florida State University, US, is the co-author of Peak: Secrets from the New Science of Expertise. After research going back to 1980 into diverse achievements, from music to memory, he doesn't think unique and innate talents are at the heart of performance. Deliberate practice, that stretches you very slightly over the way, and around 10,000 hours of it, is what produces the goods. It's not a magic number – the highest performers move on to doing a whole lot more, of course. Ericsson's enormously rich research is particularly interesting because many students, trained in memory techniques for the study, went on to outperform others thought to have innately superior memories – those who you might call gifted.

But it is perhaps the work of Benjamin Bloom, another distinguished American educationist working in the 1980s, that gives me the most pause for thought. Bloom's team looked at a group of extraordinarily high achieving people in disciplines as varied as ballet, swimming, piano, tennis, maths, sculpture and neurology. He found a pattern of parents encouraging and supporting their children, often in areas they enjoyed themselves. Bloom's outstanding people had worked very hard and consistently at something they had become hooked on when at a young age, and their parents all emerged as having strong work ethics themselves.

Eyre says we know how high performers learn. From that she has developed a high performing learning approach. She is working with this through a group of schools, both in Britain and abroad. Some spin-off research, which looked in detail at 24 of the 3,000 children studied who were succeeding despite difficult circumstances, found something remarkable. Half were getting free school meals because of poverty, more than half were living with a single parent, and four in five were living in disadvantaged areas. Interviews uncovered strong evidence an adult or adults in the child's life who valued and supported education, either in the immediate or extended family or in the child's wider community. Children talked about the need to work hard at school, to listen in class and keep trying.

Let us end with Einstein, the epitome of a genius. He clearly had curiosity, character and determination. He struggled against rejection early in life but was undeterred. Did he think he was a genius or even gifted? He once wrote: 'It's not that I'm so smart, it's just that I stay with problems longer.' Most people say it is the intellect which makes a great scientist. They are wrong: it is character.'"""
            }
        ],
        "questions": [
            {"id": 1, "passage": 1, "type": "sentence_completion", "question": "In Watt and Boulton's steam engine, the movement of the _______ was linked to a gear system."},
            {"id": 2, "passage": 1, "type": "sentence_completion", "question": "A greater supply of _______ was required to power steam engines."},
            {"id": 3, "passage": 1, "type": "sentence_completion", "question": "Before the Industrial Revolution, spinners and weavers worked at home and in _______."},
            {"id": 4, "passage": 1, "type": "sentence_completion", "question": "Not as much _______ was needed to produce cloth once the spinning jenny and power loom were invented."},
            {"id": 5, "passage": 1, "type": "sentence_completion", "question": "Smelting of iron ore with coke resulted in material that was better _______."},
            {"id": 6, "passage": 1, "type": "sentence_completion", "question": "Demand for iron increased with the growth of the _______."},
            {"id": 7, "passage": 1, "type": "sentence_completion", "question": "The new cities were dirty, crowded and lacked sufficient _______."},
            {"id": 8, "passage": 1, "type": "true_false_notgiven", "question": "Britain's canal network grew rapidly so that more goods could be transported around the country."},
            {"id": 9, "passage": 1, "type": "true_false_notgiven", "question": "Costs in the iron industry rose when the technique of smelting iron ore with coke was introduced."},
            {"id": 10, "passage": 1, "type": "true_false_notgiven", "question": "Samuel Morse's communication system was more reliable than that developed by William Cooke and Charles Wheatstone."},
            {"id": 11, "passage": 1, "type": "true_false_notgiven", "question": "The economic benefits of industrialisation were limited to certain sectors of society."},
            {"id": 12, "passage": 1, "type": "true_false_notgiven", "question": "Some skilled weavers believed that the introduction of the new textile machines would lead to job losses."},
            {"id": 13, "passage": 1, "type": "true_false_notgiven", "question": "There was some sympathy among local people for the Luddites who were arrested near Huddersfield."},
            {"id": 14, "passage": 2, "type": "matching_information", "question": "reference to two chemical compounds which impact on performance", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F"]},
            {"id": 15, "passage": 2, "type": "matching_information", "question": "examples of strategies for minimising the effects of stress", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F"]},
            {"id": 16, "passage": 2, "type": "matching_information", "question": "how a sportsperson accounted for their own experience of stress", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F"]},
            {"id": 17, "passage": 2, "type": "matching_information", "question": "study results indicating links between stress responses and performance", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F"]},
            {"id": 18, "passage": 2, "type": "matching_information", "question": "mention of people who can influence how athletes perceive their stress responses", "options": ["A) Paragraph A", "B) Paragraph B", "C) Paragraph C", "D) Paragraph D", "E) Paragraph E", "F) Paragraph F"]},
            {"id": 19, "passage": 2, "type": "sentence_completion", "question": "Performance stress involves many demands on the athlete, for example, coping with the possible risk of _______."},
            {"id": 20, "passage": 2, "type": "sentence_completion", "question": "Cortisol can cause tennis players to produce fewer good _______."},
            {"id": 21, "passage": 2, "type": "sentence_completion", "question": "Psychologists can help athletes to view their physiological responses as the effect of a positive feeling such as _______."},
            {"id": 22, "passage": 2, "type": "sentence_completion", "question": "_______ is an example of a psychological technique which can reduce an athlete's stress responses."},
            {"id": "23-24", "passage": 2, "type": "multiple_choice_multi", "question": "Which TWO facts about Emma Raducanu's withdrawal from the Wimbledon tournament are mentioned in the text?", "options": ["A) the stage at which she dropped out of the tournament", "B) symptoms of her performance stress at the tournament", "C) measures which she had taken to manage her stress levels", "D) aspects of the Wimbledon tournament which increased her stress levels", "E) reactions to her social media posts about her experience at Wimbledon"], "answer_count": 2, "answer_ids": [23, 24]},
            {"id": "25-26", "passage": 2, "type": "multiple_choice_multi", "question": "Which TWO facts about anxiety are mentioned in Paragraph E of the text?", "options": ["A) the factors which determine how severe it may be", "B) how long it takes for its effects to become apparent", "C) which of its symptoms is most frequently encountered", "D) the types of athletes who are most likely to suffer from it", "E) the harm that can result if athletes experience it too often"], "answer_count": 2, "answer_ids": [25, 26]},
            {"id": "27-32", "passage": 3, "type": "summary_completion_block", 
             "title": "Maryam Mirzakhani",
             "summary_text": "Maryam Mirzakhani is regarded as **27** .................. in the field of mathematics because she was the only female holder of the prestigious Fields Medal – a record that she retained at the time of her death. However, maths held little **28** .................. for her as a child and in fact her performance was below average until she was **29** .................. by a difficult puzzle that one of her siblings showed her.\n\nLater, as a professional mathematician, she had an inquiring mind and proved herself to be **30** .................. when things did not go smoothly. She said she got the greatest **31** .................. from making ground-breaking discoveries and in fact she was responsible for some extremely **32** .................. mathematical studies.",
             "blanks": [27, 28, 29, 30, 31, 32],
             "options": ["A) appeal", "B) determined", "C) intrigued", "D) single", "E) achievement", "F) devoted", "G) involved", "H) unique", "I) innovative", "J) satisfaction", "K) intent"]},
            {"id": 33, "passage": 3, "type": "yes_no_notgiven", "question": "Many people who ended up winning prestigious intellectual prizes were unremarkable as children."},
            {"id": 34, "passage": 3, "type": "yes_no_notgiven", "question": "Einstein had low levels of confidence throughout his early years."},
            {"id": 35, "passage": 3, "type": "yes_no_notgiven", "question": "Early accomplishments often indicate future success."},
            {"id": 36, "passage": 3, "type": "yes_no_notgiven", "question": "The work of Anders Ericsson disproves the ideas of Benjamin Bloom."},
            {"id": 37, "passage": 3, "type": "yes_no_notgiven", "question": "Some children in the study succeeded despite lacking support from their immediate family."},
            {"id": 38, "passage": 3, "type": "multiple_choice", "question": "What is the main argument of the passage?", "options": ["A) Intelligence is largely determined by genetics", "B) High performance can be developed through practice and support", "C) Some children are naturally more gifted than others", "D) Educational systems need complete reform"]},
            {"id": 39, "passage": 3, "type": "multiple_choice", "question": "According to the passage, what did Bloom's research find?", "options": ["A) Natural talent is the key to success", "B) Parents' support and work ethic were important factors", "C) Only children from wealthy families succeeded", "D) Early intervention programs are essential"]},
            {"id": 40, "passage": 3, "type": "multiple_choice", "question": "What does Einstein's quote at the end suggest?", "options": ["A) He believed he was naturally intelligent", "B) Character and persistence matter more than raw intellect", "C) Scientists are born, not made", "D) Education is not important for success"]}
        ],
        "answer_key": [
            {"question_id": 1, "answer": "piston", "explanation": "The steam engine was 'driven by both the forward and backward strokes of the piston'."},
            {"question_id": 2, "answer": "coal", "explanation": "Coal was needed to run factories and steam-powered transportation."},
            {"question_id": 3, "answer": "workshops", "explanation": "Work was performed 'in small workshops or even homes'."},
            {"question_id": 4, "answer": "labour", "explanation": "'Relatively little labour was required to produce cloth'."},
            {"question_id": 5, "answer": "quality", "explanation": "The method 'produced metals that were of a higher quality'."},
            {"question_id": 6, "answer": "railways", "explanation": "Demand was created by 'the expansion of the railways from the 1830s'."},
            {"question_id": 7, "answer": "sanitation", "explanation": "Cities suffered from 'pollution and inadequate sanitation'."},
            {"question_id": 8, "answer": "Not Given", "explanation": "The text mentions canals but doesn't say the network grew rapidly."},
            {"question_id": 9, "answer": "False", "explanation": "'This method was cheaper' - costs did not rise."},
            {"question_id": 10, "answer": "Not Given", "explanation": "The text doesn't compare the reliability of the systems."},
            {"question_id": 11, "answer": "True", "explanation": "Benefits improved life 'for the middle and upper classes' but 'poor people continued to struggle'."},
            {"question_id": 12, "answer": "True", "explanation": "Weavers 'feared that unskilled machine operators were robbing them of their livelihood'."},
            {"question_id": 13, "answer": "Not Given", "explanation": "The text doesn't mention local people's sympathy for arrested Luddites."},
            {"question_id": 14, "answer": "D", "explanation": "Paragraph D mentions adrenaline and cortisol."},
            {"question_id": 15, "answer": "F", "explanation": "Paragraph F describes strategies like visualisation and language use."},
            {"question_id": 16, "answer": "A", "explanation": "Raducanu attributed her stress to 'the accumulation of the excitement and the buzz'."},
            {"question_id": 17, "answer": "C", "explanation": "Paragraph C discusses research showing challenge states lead to good performance."},
            {"question_id": 18, "answer": "E", "explanation": "Paragraph E discusses anxiety symptoms."},
            {"question_id": 19, "answer": "injury", "explanation": "Demands include 'any potential dangers such as injury'."},
            {"question_id": 20, "answer": "serves", "explanation": "'Cortisol has been associated with more unsuccessful serves'."},
            {"question_id": 21, "answer": "excitement", "explanation": "Helping athletes 'see a higher heart rate as excitement'."},
            {"question_id": 22, "answer": "Visualisation", "explanation": "'Developing psychological skills, such as visualisation'."},
            {"question_id": "23-24", "answer": ["B", "D"], "explanation": "B: She had difficulty with breathing and heart rate. D: Larger audience and higher expectations."},
            {"question_id": "25-26", "answer": ["A", "E"], "explanation": "A: Intensity depends on demands and resources. E: Repeated episodes can increase risk of heart disease."},
            {"question_id": 27, "answer": "H", "explanation": "She was 'unique' - the only woman to win the Fields Medal."},
            {"question_id": 28, "answer": "A", "explanation": "Maths held little 'appeal' for her as a child."},
            {"question_id": 29, "answer": "C", "explanation": "She was 'intrigued' by the puzzle her brother showed her."},
            {"question_id": 30, "answer": "B", "explanation": "She was 'determined' - resolute in the face of setbacks."},
            {"question_id": 31, "answer": "I", "explanation": "Word bank answer - innovative."},
            {"question_id": 32, "answer": "J", "explanation": "Word bank answer - satisfaction."},
            {"question_id": 33, "answer": "Yes", "explanation": "'Most Nobel prize winners were unexceptional in childhood'."},
            {"question_id": 34, "answer": "Not Given", "explanation": "The text mentions Einstein's struggles but not his confidence levels."},
            {"question_id": 35, "answer": "Yes", "explanation": "Early accomplishments do not always indicate future success."},
            {"question_id": 36, "answer": "Not Given", "explanation": "The text presents both researchers' work without suggesting one disproves the other."},
            {"question_id": 37, "answer": "No", "explanation": "Children succeeded with support from extended family or community."},
            {"question_id": 38, "answer": "C", "explanation": "High performance can be developed through practice and support."},
            {"question_id": 39, "answer": "B", "explanation": "Bloom found 'a pattern of parents encouraging and supporting their children'."},
            {"question_id": 40, "answer": "D", "explanation": "Character and persistence matter more than raw intellect."}
        ]
    }


def get_writing_test_1():
    """Writing Test 1 - Line Graph"""
    return {
        "id": str(uuid.uuid4()),
        "title": "Academic Writing Test 1",
        "test_type": "writing",
        "duration": 60,
        "questions": [
            {
                "id": 1,
                "task_number": 1,
                "task": "task1",
                "type": "line_graph",
                "question": """The graph below shows the number of participants taking part in five different activities at one Australian community centre between 2000 and 2020.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.""",
                "visual_data": {
                    "type": "image",
                    "image_url": "https://customer-assets.emergentagent.com/job_syncflow-6/artifacts/1uka5mxg_Screenshot%202026-01-05%20at%2001.14.15.png"
                },
                "word_limit": 150,
                "time_suggestion": 20
            },
            {
                "id": 2,
                "task_number": 2,
                "task": "task2",
                "type": "essay",
                "question": """Some people believe that it is best to accept a bad situation, such as an unsatisfactory job or shortage of money. Others argue that it is better to try and improve such situations.

Discuss both these views and give your own opinion.

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.""",
                "word_limit": 250,
                "time_suggestion": 40
            }
        ],
        "answer_key": []
    }


def get_writing_test_2():
    """Writing Test 2 - Side-by-side images (maps)"""
    return {
        "id": str(uuid.uuid4()),
        "title": "Academic Writing Test 2",
        "test_type": "writing",
        "duration": 60,
        "questions": [
            {
                "id": 1,
                "task_number": 1,
                "task": "task1",
                "type": "map_comparison",
                "question": """The plans below show a harbour in 2000 and how it looks today.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.

Write at least 150 words.""",
                "visual_data": {
                    "type": "side_by_side_images",
                    "images": [
                        {
                            "title": "Porth Harbour (in 2000)",
                            "url": "https://customer-assets.emergentagent.com/job_lesson-preview-hub/artifacts/csy5kx8j_Screenshot%202026-01-04%20at%2009.21.11.png"
                        },
                        {
                            "title": "Porth Harbour (today)",
                            "url": "https://customer-assets.emergentagent.com/job_lesson-preview-hub/artifacts/4he4nkvg_Screenshot%202026-01-04%20at%2009.21.19.png"
                        }
                    ]
                },
                "word_limit": 150,
                "time_suggestion": 20
            },
            {
                "id": 2,
                "task_number": 2,
                "task": "task2",
                "type": "essay",
                "question": """The working week should be shorter and workers should have a longer weekend.

Do you agree or disagree?

Give reasons for your answer and include any relevant examples from your own knowledge or experience.

Write at least 250 words.""",
                "word_limit": 250,
                "time_suggestion": 40
            }
        ],
        "answer_key": []
    }


def get_listening_test_1():
    """Listening Test 1"""
    return {
        "id": str(uuid.uuid4()),
        "title": "Listening Practice Test 1",
        "test_type": "listening",
        "duration": 30,
        "audio_url": "/static/audio/listening_test_1.mp3",
        "sections": [
            {"section": 1, "title": "Section 1: A conversation about renting an apartment", "question_range": "1-10"},
            {"section": 2, "title": "Section 2: A talk about local facilities", "question_range": "11-20"},
            {"section": 3, "title": "Section 3: A discussion about a research project", "question_range": "21-30"},
            {"section": 4, "title": "Section 4: A lecture on marine biology", "question_range": "31-40"}
        ],
        "questions": [
            {"id": 1, "section": 1, "type": "note_completion", "question": "Name: Sarah _______"},
            {"id": 2, "section": 1, "type": "note_completion", "question": "Current address: 45 _______ Road"},
            {"id": 3, "section": 1, "type": "note_completion", "question": "Phone: _______"},
            {"id": 4, "section": 1, "type": "note_completion", "question": "Preferred location: near the _______"},
            {"id": 5, "section": 1, "type": "note_completion", "question": "Maximum rent: _______ per month"},
            {"id": 6, "section": 1, "type": "multiple_choice", "question": "What is included in the rent?", "options": ["A) Electricity only", "B) Water only", "C) Both electricity and water", "D) Neither"]},
            {"id": 7, "section": 1, "type": "multiple_choice", "question": "When does Sarah want to move in?", "options": ["A) Immediately", "B) Next week", "C) Next month", "D) In two months"]},
            {"id": 8, "section": 1, "type": "note_completion", "question": "Apartment size preference: _______ bedrooms"},
            {"id": 9, "section": 1, "type": "note_completion", "question": "Must have: _______ parking"},
            {"id": 10, "section": 1, "type": "note_completion", "question": "Viewing appointment: _______ afternoon"},
            {"id": 11, "section": 2, "type": "matching", "question": "Match the facility with its location: Swimming pool", "options": ["A) North end", "B) South end", "C) Town center", "D) Near the park"]},
            {"id": 12, "section": 2, "type": "matching", "question": "Match the facility with its location: Library", "options": ["A) North end", "B) South end", "C) Town center", "D) Near the park"]},
            {"id": 13, "section": 2, "type": "matching", "question": "Match the facility with its location: Sports center", "options": ["A) North end", "B) South end", "C) Town center", "D) Near the park"]},
            {"id": 14, "section": 2, "type": "sentence_completion", "question": "The new gym will open in _______"},
            {"id": 15, "section": 2, "type": "sentence_completion", "question": "Membership costs _______ per year"},
            {"id": 16, "section": 2, "type": "multiple_choice", "question": "What is the main advantage of the new facility?", "options": ["A) Lower prices", "B) Better equipment", "C) Longer opening hours", "D) More parking"]},
            {"id": 17, "section": 2, "type": "sentence_completion", "question": "The facility is open from _______ to 10 PM"},
            {"id": 18, "section": 2, "type": "sentence_completion", "question": "Children under _______ years need supervision"},
            {"id": 19, "section": 2, "type": "multiple_choice", "question": "What is NOT available at the center?", "options": ["A) Cafe", "B) Shop", "C) Childcare", "D) Restaurant"]},
            {"id": 20, "section": 2, "type": "sentence_completion", "question": "Free trial period: _______ days"},
            {"id": 21, "section": 3, "type": "multiple_choice", "question": "What is the main topic of the students' project?", "options": ["A) Climate change effects", "B) Urban wildlife adaptation", "C) Water pollution", "D) Forest conservation"]},
            {"id": 22, "section": 3, "type": "multiple_choice", "question": "How long have they been working on it?", "options": ["A) Two weeks", "B) One month", "C) Two months", "D) Three months"]},
            {"id": 23, "section": 3, "type": "sentence_completion", "question": "Their survey included _______ participants"},
            {"id": 24, "section": 3, "type": "sentence_completion", "question": "Most data was collected from the _______ area"},
            {"id": 25, "section": 3, "type": "multiple_choice", "question": "What was the biggest challenge?", "options": ["A) Finding participants", "B) Analyzing data", "C) Getting funding", "D) Time management"]},
            {"id": 26, "section": 3, "type": "sentence_completion", "question": "The professor suggested adding more _______ to the methodology"},
            {"id": 27, "section": 3, "type": "multiple_choice", "question": "When is the final deadline?", "options": ["A) Next week", "B) In two weeks", "C) Next month", "D) In six weeks"]},
            {"id": 28, "section": 3, "type": "sentence_completion", "question": "They need to include at least _______ references"},
            {"id": 29, "section": 3, "type": "sentence_completion", "question": "The presentation will last _______ minutes"},
            {"id": 30, "section": 3, "type": "multiple_choice", "question": "What will they focus on next?", "options": ["A) More research", "B) Writing the conclusion", "C) Creating visuals", "D) Practicing the presentation"]},
            {"id": 31, "section": 4, "type": "sentence_completion", "question": "Ocean temperatures have risen by _______ degrees"},
            {"id": 32, "section": 4, "type": "sentence_completion", "question": "The most affected species are _______"},
            {"id": 33, "section": 4, "type": "multiple_choice", "question": "What percentage of coral reefs are at risk?", "options": ["A) 25%", "B) 50%", "C) 75%", "D) 90%"]},
            {"id": 34, "section": 4, "type": "sentence_completion", "question": "Migration patterns have shifted by _______ kilometers"},
            {"id": 35, "section": 4, "type": "sentence_completion", "question": "The study was conducted over _______ years"},
            {"id": 36, "section": 4, "type": "multiple_choice", "question": "What is the main cause of these changes?", "options": ["A) Overfishing", "B) Pollution", "C) Global warming", "D) Natural cycles"]},
            {"id": 37, "section": 4, "type": "sentence_completion", "question": "Fish populations have decreased by _______ percent"},
            {"id": 38, "section": 4, "type": "sentence_completion", "question": "New research focuses on _______ adaptation"},
            {"id": 39, "section": 4, "type": "multiple_choice", "question": "What solution does the lecturer propose?", "options": ["A) More fishing restrictions", "B) Marine protected areas", "C) Artificial reefs", "D) All of the above"]},
            {"id": 40, "section": 4, "type": "sentence_completion", "question": "International cooperation started in _______"}
        ],
        "answer_key": [
            {"question_id": 1, "answer": "Mitchell"},
            {"question_id": 2, "answer": "Garden"},
            {"question_id": 3, "answer": "07845123456"},
            {"question_id": 4, "answer": "university"},
            {"question_id": 5, "answer": "800"},
            {"question_id": 6, "answer": "C"},
            {"question_id": 7, "answer": "C"},
            {"question_id": 8, "answer": "2/two"},
            {"question_id": 9, "answer": "underground"},
            {"question_id": 10, "answer": "Saturday"},
            {"question_id": 11, "answer": "B"},
            {"question_id": 12, "answer": "C"},
            {"question_id": 13, "answer": "D"},
            {"question_id": 14, "answer": "March"},
            {"question_id": 15, "answer": "450"},
            {"question_id": 16, "answer": "C"},
            {"question_id": 17, "answer": "6 AM"},
            {"question_id": 18, "answer": "12"},
            {"question_id": 19, "answer": "D"},
            {"question_id": 20, "answer": "7/seven"},
            {"question_id": 21, "answer": "B"},
            {"question_id": 22, "answer": "C"},
            {"question_id": 23, "answer": "250"},
            {"question_id": 24, "answer": "suburban"},
            {"question_id": 25, "answer": "D"},
            {"question_id": 26, "answer": "interviews"},
            {"question_id": 27, "answer": "D"},
            {"question_id": 28, "answer": "30"},
            {"question_id": 29, "answer": "15"},
            {"question_id": 30, "answer": "C"},
            {"question_id": 31, "answer": "2"},
            {"question_id": 32, "answer": "coral"},
            {"question_id": 33, "answer": "C"},
            {"question_id": 34, "answer": "500"},
            {"question_id": 35, "answer": "10"},
            {"question_id": 36, "answer": "C"},
            {"question_id": 37, "answer": "40"},
            {"question_id": 38, "answer": "species"},
            {"question_id": 39, "answer": "D"},
            {"question_id": 40, "answer": "2015"}
        ]
    }


def get_listening_test_2():
    """Listening Test 2"""
    return {
        "id": str(uuid.uuid4()),
        "title": "Listening Practice Test 2",
        "test_type": "listening",
        "duration": 30,
        "audio_url": "/static/audio/listening_test_2.mp3",
        "sections": [
            {"section": 1, "title": "Section 1: Booking a tour", "question_range": "1-10"},
            {"section": 2, "title": "Section 2: Museum guide", "question_range": "11-20"},
            {"section": 3, "title": "Section 3: Academic discussion", "question_range": "21-30"},
            {"section": 4, "title": "Section 4: Lecture on architecture", "question_range": "31-40"}
        ],
        "questions": [
            {"id": 1, "section": 1, "type": "note_completion", "question": "Tour destination: _______ Valley"},
            {"id": 2, "section": 1, "type": "note_completion", "question": "Date of tour: _______ October"},
            {"id": 3, "section": 1, "type": "note_completion", "question": "Number of people: _______"},
            {"id": 4, "section": 1, "type": "note_completion", "question": "Pick-up point: _______ Hotel"},
            {"id": 5, "section": 1, "type": "note_completion", "question": "Total cost: _______ dollars"},
            {"id": 6, "section": 1, "type": "multiple_choice", "question": "What is included in the tour?", "options": ["A) Breakfast only", "B) Lunch only", "C) All meals", "D) No meals"]},
            {"id": 7, "section": 1, "type": "multiple_choice", "question": "What should participants bring?", "options": ["A) Warm clothes", "B) Swimming gear", "C) Hiking boots", "D) All of the above"]},
            {"id": 8, "section": 1, "type": "note_completion", "question": "Emergency contact: _______"},
            {"id": 9, "section": 1, "type": "note_completion", "question": "Special dietary requirement: _______ free"},
            {"id": 10, "section": 1, "type": "note_completion", "question": "Return time: _______ PM"},
            {"id": 11, "section": 2, "type": "matching", "question": "Match exhibit with floor: Ancient Egypt", "options": ["A) Ground floor", "B) First floor", "C) Second floor", "D) Basement"]},
            {"id": 12, "section": 2, "type": "matching", "question": "Match exhibit with floor: Modern Art", "options": ["A) Ground floor", "B) First floor", "C) Second floor", "D) Basement"]},
            {"id": 13, "section": 2, "type": "matching", "question": "Match exhibit with floor: Natural History", "options": ["A) Ground floor", "B) First floor", "C) Second floor", "D) Basement"]},
            {"id": 14, "section": 2, "type": "sentence_completion", "question": "The special exhibition ends on _______"},
            {"id": 15, "section": 2, "type": "sentence_completion", "question": "Audio guides cost _______ dollars"},
            {"id": 16, "section": 2, "type": "multiple_choice", "question": "What day is the museum closed?", "options": ["A) Monday", "B) Tuesday", "C) Wednesday", "D) Never"]},
            {"id": 17, "section": 2, "type": "sentence_completion", "question": "Group bookings need _______ people minimum"},
            {"id": 18, "section": 2, "type": "sentence_completion", "question": "Photography is not allowed in the _______ gallery"},
            {"id": 19, "section": 2, "type": "multiple_choice", "question": "What is the most popular exhibit?", "options": ["A) Dinosaurs", "B) Mummies", "C) Paintings", "D) Sculptures"]},
            {"id": 20, "section": 2, "type": "sentence_completion", "question": "The cafe opens at _______ AM"},
            {"id": 21, "section": 3, "type": "multiple_choice", "question": "What subject are the students discussing?", "options": ["A) History", "B) Psychology", "C) Economics", "D) Literature"]},
            {"id": 22, "section": 3, "type": "multiple_choice", "question": "What grade did Emma get?", "options": ["A) A", "B) B+", "C) B", "D) C+"]},
            {"id": 23, "section": 3, "type": "sentence_completion", "question": "The essay needs to be _______ words"},
            {"id": 24, "section": 3, "type": "sentence_completion", "question": "The main theorist they studied was _______"},
            {"id": 25, "section": 3, "type": "multiple_choice", "question": "What was the tutor's main criticism?", "options": ["A) Poor structure", "B) Weak conclusion", "C) Not enough examples", "D) Too short"]},
            {"id": 26, "section": 3, "type": "sentence_completion", "question": "They must include _______ case studies"},
            {"id": 27, "section": 3, "type": "multiple_choice", "question": "When is the resubmission due?", "options": ["A) Friday", "B) Next Monday", "C) Next Wednesday", "D) In two weeks"]},
            {"id": 28, "section": 3, "type": "sentence_completion", "question": "Office hours are from _______ to 4 PM"},
            {"id": 29, "section": 3, "type": "sentence_completion", "question": "The library has _______ copies of the main textbook"},
            {"id": 30, "section": 3, "type": "multiple_choice", "question": "What will they do after the meeting?", "options": ["A) Go to the library", "B) Email the tutor", "C) Write the introduction", "D) Have lunch"]},
            {"id": 31, "section": 4, "type": "sentence_completion", "question": "The lecture focuses on _______ century architecture"},
            {"id": 32, "section": 4, "type": "sentence_completion", "question": "The main building material was _______"},
            {"id": 33, "section": 4, "type": "multiple_choice", "question": "Which city is the main example?", "options": ["A) Paris", "B) London", "C) Vienna", "D) Barcelona"]},
            {"id": 34, "section": 4, "type": "sentence_completion", "question": "The movement lasted approximately _______ years"},
            {"id": 35, "section": 4, "type": "sentence_completion", "question": "The most famous architect mentioned is _______"},
            {"id": 36, "section": 4, "type": "multiple_choice", "question": "What influenced this style?", "options": ["A) Nature", "B) Industry", "C) Religion", "D) Politics"]},
            {"id": 37, "section": 4, "type": "sentence_completion", "question": "Buildings often featured _______ shaped windows"},
            {"id": 38, "section": 4, "type": "sentence_completion", "question": "The style spread to _______ countries"},
            {"id": 39, "section": 4, "type": "multiple_choice", "question": "What led to the decline of this style?", "options": ["A) Cost", "B) World War I", "C) New materials", "D) Public opinion"]},
            {"id": 40, "section": 4, "type": "sentence_completion", "question": "Today there are _______ protected buildings in this style"}
        ],
        "answer_key": [
            {"question_id": 1, "answer": "Green"},
            {"question_id": 2, "answer": "15th"},
            {"question_id": 3, "answer": "4"},
            {"question_id": 4, "answer": "Grand"},
            {"question_id": 5, "answer": "280"},
            {"question_id": 6, "answer": "B"},
            {"question_id": 7, "answer": "D"},
            {"question_id": 8, "answer": "07912345678"},
            {"question_id": 9, "answer": "gluten"},
            {"question_id": 10, "answer": "6"},
            {"question_id": 11, "answer": "D"},
            {"question_id": 12, "answer": "C"},
            {"question_id": 13, "answer": "A"},
            {"question_id": 14, "answer": "December"},
            {"question_id": 15, "answer": "5"},
            {"question_id": 16, "answer": "A"},
            {"question_id": 17, "answer": "15"},
            {"question_id": 18, "answer": "Egyptian"},
            {"question_id": 19, "answer": "A"},
            {"question_id": 20, "answer": "9"},
            {"question_id": 21, "answer": "B"},
            {"question_id": 22, "answer": "C"},
            {"question_id": 23, "answer": "3000"},
            {"question_id": 24, "answer": "Freud"},
            {"question_id": 25, "answer": "C"},
            {"question_id": 26, "answer": "3"},
            {"question_id": 27, "answer": "C"},
            {"question_id": 28, "answer": "2"},
            {"question_id": 29, "answer": "5"},
            {"question_id": 30, "answer": "A"},
            {"question_id": 31, "answer": "19th"},
            {"question_id": 32, "answer": "iron"},
            {"question_id": 33, "answer": "D"},
            {"question_id": 34, "answer": "40"},
            {"question_id": 35, "answer": "Gaudi"},
            {"question_id": 36, "answer": "A"},
            {"question_id": 37, "answer": "curved"},
            {"question_id": 38, "answer": "25"},
            {"question_id": 39, "answer": "B"},
            {"question_id": 40, "answer": "2000"}
        ]
    }


def get_speaking_test_1():
    """Speaking Test 1"""
    return {
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
                "task_card": {
                    "topic": "Describe a law in your country that you think is particularly good.",
                    "points": [
                        "what the law is",
                        "how you first learned about this law",
                        "who benefits from this law",
                        "and explain why you think it is a good law"
                    ]
                }
            },
            {
                "part": 3,
                "title": "Two-way discussion",
                "duration": "4-5 minutes",
                "topics": ["Good and bad laws"],
                "questions": [
                    "Are there any laws that you consider to be bad laws?",
                    "Do you think the same laws should apply to everyone?",
                    "What qualities do you think are needed to be a good police officer?",
                    "What could governments do to make people more aware of the law?"
                ]
            }
        ],
        "questions": [
            {"id": 1, "part": 1, "question": "Can you find food from many different countries where you live?"},
            {"id": 2, "part": 1, "question": "How often do you eat typical food from other countries?"},
            {"id": 3, "part": 1, "question": "Have you ever tried making food from another country?"},
            {"id": 4, "part": 1, "question": "What food from your country would you recommend to people from other countries?"},
            {"id": 5, "part": 2, "question": "Describe a law in your country that you think is particularly good."},
            {"id": 6, "part": 3, "question": "Are there any laws that you consider to be bad laws?"},
            {"id": 7, "part": 3, "question": "Do you think the same laws should apply to everyone?"},
            {"id": 8, "part": 3, "question": "What qualities do you think are needed to be a good police officer?"},
            {"id": 9, "part": 3, "question": "What could governments do to make people more aware of the law?"}
        ],
        "answer_key": []
    }


def get_speaking_test_2():
    """Speaking Test 2"""
    return {
        "id": str(uuid.uuid4()),
        "title": "Speaking Practice Test 2",
        "test_type": "speaking",
        "duration": 15,
        "parts": [
            {
                "part": 1,
                "title": "Introduction and interview",
                "duration": "4-5 minutes",
                "topics": ["Prizes and rewards"],
                "questions": [
                    "Have you ever won a prize or an award?",
                    "What kind of prizes do students get at school in your country?",
                    "Do you think prizes are a good way to encourage people?",
                    "How would you feel if you won a big prize?"
                ]
            },
            {
                "part": 2,
                "title": "Individual long turn",
                "duration": "3-4 minutes",
                "task_card": {
                    "topic": "Describe a time when you received something for free.",
                    "points": [
                        "what it was",
                        "who gave it to you",
                        "where you received it",
                        "and explain how you felt about receiving it"
                    ]
                }
            },
            {
                "part": 3,
                "title": "Two-way discussion",
                "duration": "4-5 minutes",
                "topics": ["Rewards and recognition"],
                "questions": [
                    "What do you think are the advantages of rewarding schoolchildren for good work?",
                    "Do you agree that it's more important for children to receive rewards from their parents than from teachers?",
                    "Do you think that some sportspeople (e.g., top footballers) are paid too much money?",
                    "Should everyone on a team get the same prize money when they win?",
                    "Do you agree with the view that, in sport, taking part is more important than winning?"
                ]
            }
        ],
        "questions": [
            {"id": 1, "part": 1, "question": "Have you ever won a prize or an award?"},
            {"id": 2, "part": 1, "question": "What kind of prizes do students get at school in your country?"},
            {"id": 3, "part": 1, "question": "Do you think prizes are a good way to encourage people?"},
            {"id": 4, "part": 1, "question": "How would you feel if you won a big prize?"},
            {"id": 5, "part": 2, "question": "Describe a time when you received something for free."},
            {"id": 6, "part": 3, "question": "What do you think are the advantages of rewarding schoolchildren for good work?"},
            {"id": 7, "part": 3, "question": "Do you agree that it's more important for children to receive rewards from their parents than from teachers?"},
            {"id": 8, "part": 3, "question": "Do you think that some sportspeople (e.g., top footballers) are paid too much money?"},
            {"id": 9, "part": 3, "question": "Should everyone on a team get the same prize money when they win?"},
            {"id": 10, "part": 3, "question": "Do you agree with the view that, in sport, taking part is more important than winning?"}
        ],
        "answer_key": []
    }


def get_tips():
    """Get all tips"""
    return [
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
• Explanation and example
• Link back to thesis

**Body Paragraph 2 (100 words)**
• Different supporting point
• Evidence and reasoning
• Maintain clear progression

**Conclusion (50 words)**
• Summarize main points
• Restate your position
• No new information"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Listening: Note-taking Strategy",
            "category": "listening",
            "content": """**Effective note-taking for IELTS Listening:**

**Before the audio:**
• Read all questions carefully
• Predict possible answers
• Underline key words

**During the audio:**
• Write only essential information
• Use abbreviations and symbols
• Don't stop writing if you miss something

**After each section:**
• Transfer answers immediately
• Check spelling and grammar
• Move on to prepare for next section"""
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Speaking Part 2: Cue Card Success",
            "category": "speaking",
            "content": """**How to ace the long turn:**

**1 minute preparation:**
• Read all bullet points carefully
• Make brief notes (keywords only)
• Plan your structure

**2 minutes speaking:**
• Start with a clear introduction
• Address ALL bullet points
• Add personal experiences and details
• Use a variety of vocabulary
• Maintain natural pace

**Key techniques:**
• Use signposting language
• Expand with reasons and examples
• End with a memorable conclusion"""
        }
    ]


def get_courses():
    """Get all courses"""
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "IELTS Academic Complete Preparation",
            "description": "Comprehensive course covering all four IELTS skills",
            "modules": [
                {"id": 1, "title": "Reading Strategies", "lessons": 10},
                {"id": 2, "title": "Writing Task 1 & 2", "lessons": 12},
                {"id": 3, "title": "Listening Skills", "lessons": 8},
                {"id": 4, "title": "Speaking Practice", "lessons": 10}
            ]
        },
        {
            "id": str(uuid.uuid4()),
            "title": "IELTS General Training",
            "description": "Focused preparation for IELTS General Training",
            "modules": [
                {"id": 1, "title": "Reading for GT", "lessons": 8},
                {"id": 2, "title": "Letter Writing", "lessons": 6},
                {"id": 3, "title": "Listening Practice", "lessons": 8},
                {"id": 4, "title": "Speaking Topics", "lessons": 8}
            ]
        }
    ]
