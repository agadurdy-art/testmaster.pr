"""
Additional Vocabulary & Grammar Units
Completes the course to 30 units with 300+ items
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / '.env')

# Additional Foundation Units (Grammar for units 3-5)
ADDITIONAL_FOUNDATION = [
    # Unit 5: Work - Grammar
    {
        "id": "f-u5-grammar",
        "title": "Unit 5: Comparatives & Superlatives",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 5,
        "description": "Compare jobs, salaries, and working conditions",
        "ielts_relevance": "Essential for comparing options in Writing Task 2 and Speaking.",
        "items": [
            {"id": "f5g1", "word": "Comparative - Short Adjectives", "part_of_speech": "grammar", "definition": "adjective + -er + than", "examples": ["This job is easier than that one.", "She works harder than me.", "The salary is higher than before."], "grammar_formula": "short adj + -er + than", "common_mistakes": ["more easy → easier"], "ielts_tip": "Short adjectives (1-2 syllables) add -er."},
            {"id": "f5g2", "word": "Comparative - Long Adjectives", "part_of_speech": "grammar", "definition": "more + adjective + than", "examples": ["This is more interesting than that.", "The work is more challenging.", "It's more rewarding than before."], "grammar_formula": "more + long adj + than", "common_mistakes": ["interestinger → more interesting"], "ielts_tip": "Long adjectives (3+ syllables) use 'more'."},
            {"id": "f5g3", "word": "Superlative - Short", "part_of_speech": "grammar", "definition": "the + adjective + -est", "examples": ["This is the highest salary.", "She's the hardest worker.", "It's the easiest job."], "grammar_formula": "the + adj + -est", "common_mistakes": ["the most easy → the easiest"], "ielts_tip": "Always use 'the' with superlatives."},
            {"id": "f5g4", "word": "Superlative - Long", "part_of_speech": "grammar", "definition": "the most + adjective", "examples": ["The most interesting job.", "The most successful company.", "The most important factor."], "grammar_formula": "the most + long adj", "common_mistakes": ["the importantest → the most important"], "ielts_tip": "Use for comparing 3+ things."},
            {"id": "f5g5", "word": "Irregular Comparatives", "part_of_speech": "grammar", "definition": "good→better→best, bad→worse→worst", "examples": ["This is better than that.", "The worst decision.", "The best option."], "grammar_formula": "good/better/best, bad/worse/worst", "common_mistakes": ["more good → better, most bad → worst"], "ielts_tip": "Memorize irregular forms."}
        ],
        "quiz_questions": [
            {"question": "This job is ___ (easy) than my previous one.", "options": ["more easy", "easier", "most easy"], "answer": "easier", "explanation": "'Easy' is short - add -er."},
            {"question": "It's ___ (important) decision of my career.", "options": ["the importantest", "the most important", "more important"], "answer": "the most important", "explanation": "'Important' is long - use 'the most'."},
            {"question": "Her salary is ___ (good) than mine.", "options": ["gooder", "more good", "better"], "answer": "better", "explanation": "'Good' is irregular: good → better → best."}
        ]
    },
    
    # Unit 6: Health - Vocabulary
    {
        "id": "f-u6-vocab",
        "title": "Unit 6: Health & Lifestyle",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 6,
        "description": "Basic health vocabulary for everyday discussions",
        "ielts_relevance": "Health topics are common in Speaking Part 1 and Part 3.",
        "items": [
            {"id": "f6v1", "word": "exercise", "ipa": "/ˈek.sə.saɪz/", "part_of_speech": "noun/verb", "definition": "Physical activity for health", "examples": ["I exercise every morning.", "Regular exercise is important.", "Do you get enough exercise?"], "collocations": ["do exercise", "regular exercise", "physical exercise"], "ielts_tip": "Can be noun or verb."},
            {"id": "f6v2", "word": "fit", "ipa": "/fɪt/", "part_of_speech": "adjective", "definition": "In good physical condition", "examples": ["I try to keep fit.", "She's very fit.", "A fit and healthy lifestyle."], "collocations": ["keep fit", "get fit", "stay fit"], "ielts_tip": "Adjective: fit (healthy), not 'fitness'."},
            {"id": "f6v3", "word": "stress", "ipa": "/stres/", "part_of_speech": "noun/verb", "definition": "Feeling of pressure and worry", "examples": ["Work causes me stress.", "I'm stressed about exams.", "Stress affects health."], "collocations": ["under stress", "stress levels", "reduce stress"], "ielts_tip": "Common topic in modern life discussions."},
            {"id": "f6v4", "word": "healthy", "ipa": "/ˈhel.θi/", "part_of_speech": "adjective", "definition": "Good for health, in good health", "examples": ["A healthy diet.", "She looks healthy.", "Healthy eating habits."], "collocations": ["healthy diet", "healthy lifestyle", "healthy food"], "ielts_tip": "Noun: health."},
            {"id": "f6v5", "word": "benefit", "ipa": "/ˈben.ɪ.fɪt/", "part_of_speech": "noun/verb", "definition": "Advantage, positive result", "examples": ["The benefits of exercise.", "This will benefit your health.", "Health benefits."], "collocations": ["health benefits", "benefit from", "benefits of"], "ielts_tip": "Very common in IELTS discussions."},
            {"id": "f6v6", "word": "harmful", "ipa": "/ˈhɑːm.fəl/", "part_of_speech": "adjective", "definition": "Causing damage or injury", "examples": ["Smoking is harmful.", "Harmful effects.", "Harmful to health."], "collocations": ["harmful effects", "harmful to", "potentially harmful"], "ielts_tip": "Opposite: harmless, beneficial."},
            {"id": "f6v7", "word": "maintain", "ipa": "/meɪnˈteɪn/", "part_of_speech": "verb", "definition": "Keep something at same level", "examples": ["Maintain a healthy weight.", "Maintain fitness levels.", "Difficult to maintain."], "collocations": ["maintain health", "maintain weight", "maintain a balance"], "ielts_tip": "Keep something going."},
            {"id": "f6v8", "word": "improve", "ipa": "/ɪmˈpruːv/", "part_of_speech": "verb", "definition": "Make or become better", "examples": ["Improve your health.", "My health has improved.", "Room for improvement."], "collocations": ["improve health", "improve fitness", "improve diet"], "ielts_tip": "Noun: improvement."},
            {"id": "f6v9", "word": "avoid", "ipa": "/əˈvɔɪd/", "part_of_speech": "verb", "definition": "Keep away from, not do", "examples": ["Avoid junk food.", "I try to avoid stress.", "Avoid unhealthy habits."], "collocations": ["avoid eating", "avoid stress", "try to avoid"], "ielts_tip": "Followed by -ing or noun."},
            {"id": "f6v10", "word": "recommend", "ipa": "/ˌrek.əˈmend/", "part_of_speech": "verb", "definition": "Suggest as good or suitable", "examples": ["Doctors recommend exercise.", "I recommend this gym.", "Highly recommended."], "collocations": ["highly recommend", "strongly recommend", "recommend that"], "ielts_tip": "Noun: recommendation."}
        ],
        "quiz_questions": [
            {"question": "I try to ___ fit by going to the gym.", "options": ["keep", "make", "do"], "answer": "keep", "explanation": "'Keep fit' is the correct collocation."},
            {"question": "Smoking has ___ effects on your health.", "options": ["healthy", "harmful", "beneficial"], "answer": "harmful", "explanation": "'Harmful' means causing damage."},
            {"question": "Doctors ___ at least 30 minutes of exercise daily.", "options": ["avoid", "maintain", "recommend"], "answer": "recommend", "explanation": "'Recommend' means suggest as good."}
        ]
    },
    
    # Unit 6: Health - Grammar
    {
        "id": "f-u6-grammar",
        "title": "Unit 6: Should & Must for Advice",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 6,
        "description": "Give health advice using modal verbs",
        "ielts_relevance": "Useful for Speaking Part 3 and Writing Task 2 recommendations.",
        "items": [
            {"id": "f6g1", "word": "Should - Advice", "part_of_speech": "grammar", "definition": "It's a good idea to...", "examples": ["You should exercise more.", "People should eat healthily.", "We should reduce stress."], "grammar_formula": "should + base verb", "common_mistakes": ["should to go → should go"], "ielts_tip": "Gives advice, not as strong as 'must'."},
            {"id": "f6g2", "word": "Shouldn't - Negative Advice", "part_of_speech": "grammar", "definition": "It's not a good idea to...", "examples": ["You shouldn't smoke.", "People shouldn't eat too much sugar.", "We shouldn't ignore health."], "grammar_formula": "shouldn't + base verb", "common_mistakes": ["shouldn't to eat → shouldn't eat"], "ielts_tip": "Advises against something."},
            {"id": "f6g3", "word": "Must - Strong Obligation", "part_of_speech": "grammar", "definition": "It's necessary/required", "examples": ["You must see a doctor.", "We must take care of our health.", "Children must sleep enough."], "grammar_formula": "must + base verb", "common_mistakes": ["must to go → must go"], "ielts_tip": "Stronger than 'should'."},
            {"id": "f6g4", "word": "Mustn't - Prohibition", "part_of_speech": "grammar", "definition": "It's not allowed/dangerous", "examples": ["You mustn't take too many pills.", "We mustn't ignore symptoms.", "Children mustn't play with medicine."], "grammar_formula": "mustn't + base verb", "common_mistakes": ["Mustn't ≠ don't have to"], "ielts_tip": "Mustn't = prohibited, Don't have to = not necessary."},
            {"id": "f6g5", "word": "Have to - External Obligation", "part_of_speech": "grammar", "definition": "It's required by rules/others", "examples": ["I have to take medicine.", "She has to rest.", "We have to follow the doctor's advice."], "grammar_formula": "have to/has to + base verb", "common_mistakes": ["He have to → He has to"], "ielts_tip": "Third person: has to."}
        ],
        "quiz_questions": [
            {"question": "You ___ exercise regularly for good health.", "options": ["should", "shouldn't", "mustn't"], "answer": "should", "explanation": "'Should' gives positive advice."},
            {"question": "You ___ smoke. It's very bad for you.", "options": ["should", "shouldn't", "must"], "answer": "shouldn't", "explanation": "'Shouldn't' advises against something."},
            {"question": "I ___ take this medicine three times a day. (doctor's orders)", "options": ["should", "have to", "shouldn't"], "answer": "have to", "explanation": "'Have to' for external rules/requirements."}
        ]
    },
    
    # Unit 7: Environment - Vocabulary
    {
        "id": "f-u7-vocab",
        "title": "Unit 7: Environment Basics",
        "band_level": "foundation",
        "type": "vocabulary",
        "unit_number": 7,
        "description": "Basic environmental vocabulary for everyday discussions",
        "ielts_relevance": "Environment is tested across all skills.",
        "items": [
            {"id": "f7v1", "word": "pollution", "ipa": "/pəˈluː.ʃən/", "part_of_speech": "noun", "definition": "Damage to air, water, or land", "examples": ["Air pollution is a problem.", "Reduce pollution.", "Pollution harms health."], "collocations": ["air pollution", "water pollution", "reduce pollution"], "ielts_tip": "Very common IELTS topic."},
            {"id": "f7v2", "word": "environment", "ipa": "/ɪnˈvaɪ.rən.mənt/", "part_of_speech": "noun", "definition": "The natural world around us", "examples": ["Protect the environment.", "Environmental problems.", "Good for the environment."], "collocations": ["protect the environment", "harm the environment", "environmental issues"], "ielts_tip": "Adjective: environmental."},
            {"id": "f7v3", "word": "waste", "ipa": "/weɪst/", "part_of_speech": "noun/verb", "definition": "Unwanted material / use carelessly", "examples": ["Don't waste water.", "Reduce waste.", "Household waste."], "collocations": ["waste of time", "reduce waste", "household waste"], "ielts_tip": "Can be noun or verb."},
            {"id": "f7v4", "word": "recycle", "ipa": "/riːˈsaɪ.kəl/", "part_of_speech": "verb", "definition": "Convert waste into new materials", "examples": ["Recycle plastic.", "We should recycle more.", "Recycling bins."], "collocations": ["recycle waste", "recycling center", "recyclable materials"], "ielts_tip": "Noun: recycling."},
            {"id": "f7v5", "word": "protect", "ipa": "/prəˈtekt/", "part_of_speech": "verb", "definition": "Keep safe from harm", "examples": ["Protect the environment.", "Protect wildlife.", "Protected areas."], "collocations": ["protect from", "protect against", "protection"], "ielts_tip": "Noun: protection."},
            {"id": "f7v6", "word": "damage", "ipa": "/ˈdæm.ɪdʒ/", "part_of_speech": "noun/verb", "definition": "Physical harm or injury", "examples": ["Damage to the environment.", "Pollution damages nature.", "Environmental damage."], "collocations": ["cause damage", "environmental damage", "damage to"], "ielts_tip": "Can be noun or verb."},
            {"id": "f7v7", "word": "wildlife", "ipa": "/ˈwaɪld.laɪf/", "part_of_speech": "noun", "definition": "Wild animals and plants", "examples": ["Protect wildlife.", "Wildlife habitats.", "Endangered wildlife."], "collocations": ["wildlife conservation", "wildlife habitat", "protect wildlife"], "ielts_tip": "Uncountable noun."},
            {"id": "f7v8", "word": "climate", "ipa": "/ˈklaɪ.mət/", "part_of_speech": "noun", "definition": "Weather conditions over time", "examples": ["Climate change.", "A warm climate.", "Tropical climate."], "collocations": ["climate change", "climate crisis", "global climate"], "ielts_tip": "Climate (long-term) vs Weather (daily)."},
            {"id": "f7v9", "word": "save", "ipa": "/seɪv/", "part_of_speech": "verb", "definition": "Keep and not waste / rescue", "examples": ["Save energy.", "Save the planet.", "Save water."], "collocations": ["save energy", "save money", "save the environment"], "ielts_tip": "Multiple meanings."},
            {"id": "f7v10", "word": "endangered", "ipa": "/ɪnˈdeɪn.dʒəd/", "part_of_speech": "adjective", "definition": "At risk of extinction", "examples": ["Endangered species.", "Endangered animals.", "Become endangered."], "collocations": ["endangered species", "endangered animals", "critically endangered"], "ielts_tip": "At risk of dying out."}
        ],
        "quiz_questions": [
            {"question": "Air ___ is a serious problem in many cities.", "options": ["pollution", "waste", "recycle"], "answer": "pollution", "explanation": "'Pollution' means damage to air/water/land."},
            {"question": "We should ___ plastic bottles instead of throwing them away.", "options": ["waste", "recycle", "damage"], "answer": "recycle", "explanation": "'Recycle' means convert waste to new materials."},
            {"question": "Many ___ species need protection.", "options": ["endangered", "environmental", "polluted"], "answer": "endangered", "explanation": "'Endangered' means at risk of extinction."}
        ]
    },
    
    # Unit 7: Environment - Grammar
    {
        "id": "f-u7-grammar",
        "title": "Unit 7: Future Simple (will)",
        "band_level": "foundation",
        "type": "grammar",
        "unit_number": 7,
        "description": "Talk about future predictions and environmental changes",
        "ielts_relevance": "Essential for predictions in Speaking and Writing.",
        "items": [
            {"id": "f7g1", "word": "Will - Predictions", "part_of_speech": "grammar", "definition": "Subject + will + base verb", "examples": ["Pollution will increase.", "The climate will change.", "Temperatures will rise."], "grammar_formula": "will + base verb", "common_mistakes": ["will to increase → will increase"], "ielts_tip": "For future predictions."},
            {"id": "f7g2", "word": "Won't - Negative", "part_of_speech": "grammar", "definition": "Subject + will not/won't + base verb", "examples": ["It won't get better.", "Things won't change easily.", "We won't solve this quickly."], "grammar_formula": "won't + base verb", "common_mistakes": ["willn't → won't"], "ielts_tip": "Won't = will not."},
            {"id": "f7g3", "word": "Will - Offers & Decisions", "part_of_speech": "grammar", "definition": "Spontaneous decisions", "examples": ["I'll help you recycle.", "I'll turn off the lights.", "We'll do something about it."], "grammar_formula": "I'll/We'll + base verb", "common_mistakes": ["I going to help → I'll help (spontaneous)"], "ielts_tip": "For instant decisions."},
            {"id": "f7g4", "word": "Will vs Going to", "part_of_speech": "grammar", "definition": "Predictions vs Plans", "examples": ["It will rain. (prediction)", "I'm going to recycle more. (plan)", "Pollution will get worse. / I'm going to reduce my waste."], "grammar_formula": "will = prediction, going to = plan", "common_mistakes": ["Mixing them up"], "ielts_tip": "Will = general future/prediction, Going to = plan/intention."},
            {"id": "f7g5", "word": "First Conditional", "part_of_speech": "grammar", "definition": "If + present, will + base verb", "examples": ["If we recycle, we'll help the planet.", "If pollution continues, health will suffer.", "If we don't act, things will get worse."], "grammar_formula": "If + present simple, will + verb", "common_mistakes": ["If we will recycle → If we recycle"], "ielts_tip": "For possible future situations."}
        ],
        "quiz_questions": [
            {"question": "Scientists predict temperatures ___ rise.", "options": ["going to", "will", "are"], "answer": "will", "explanation": "'Will' for predictions."},
            {"question": "If we don't protect forests, many animals ___ extinct.", "options": ["become", "becoming", "will become"], "answer": "will become", "explanation": "First conditional: If + present, will + verb."},
            {"question": "I ___ help clean the beach this weekend. (spontaneous offer)", "options": ["going to", "'ll", "am"], "answer": "'ll", "explanation": "'ll (will) for spontaneous offers."}
        ]
    },
]

# Additional Development Units
ADDITIONAL_DEVELOPMENT = [
    # Unit 6: Crime & Law - Vocabulary  
    {
        "id": "d-u6-vocab",
        "title": "Unit 6: Crime & Law",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 6,
        "description": "Vocabulary for discussing crime, punishment, and justice",
        "ielts_relevance": "Crime is a common Writing Task 2 and Speaking Part 3 topic.",
        "items": [
            {"id": "d6v1", "word": "crime", "ipa": "/kraɪm/", "part_of_speech": "noun", "definition": "Illegal activity", "examples": ["Crime rates are rising.", "Commit a crime.", "Serious crime."], "collocations": ["commit a crime", "crime rate", "violent crime"], "ielts_tip": "Related: criminal (noun/adj)."},
            {"id": "d6v2", "word": "punishment", "ipa": "/ˈpʌn.ɪʃ.mənt/", "part_of_speech": "noun", "definition": "Penalty for wrongdoing", "examples": ["Harsh punishment.", "Capital punishment.", "Appropriate punishment."], "collocations": ["severe punishment", "capital punishment", "appropriate punishment"], "ielts_tip": "Verb: punish."},
            {"id": "d6v3", "word": "offender", "ipa": "/əˈfen.dər/", "part_of_speech": "noun", "definition": "Person who commits a crime", "examples": ["Young offenders.", "First-time offender.", "Repeat offender."], "collocations": ["young offender", "first-time offender", "repeat offender"], "ielts_tip": "Related: offence (crime)."},
            {"id": "d6v4", "word": "rehabilitation", "ipa": "/ˌriː.həˌbɪl.ɪˈteɪ.ʃən/", "part_of_speech": "noun", "definition": "Helping criminals reform", "examples": ["Focus on rehabilitation.", "Rehabilitation programs.", "Rehabilitate prisoners."], "collocations": ["rehabilitation program", "focus on rehabilitation", "rehabilitation vs punishment"], "ielts_tip": "Alternative to punishment."},
            {"id": "d6v5", "word": "deterrent", "ipa": "/dɪˈter.ənt/", "part_of_speech": "noun/adjective", "definition": "Something that discourages", "examples": ["An effective deterrent.", "Deterrent effect.", "Prison as a deterrent."], "collocations": ["effective deterrent", "act as a deterrent", "deterrent effect"], "ielts_tip": "Something that stops crime."},
            {"id": "d6v6", "word": "incarceration", "ipa": "/ɪnˌkɑː.sərˈeɪ.ʃən/", "part_of_speech": "noun", "definition": "Imprisonment", "examples": ["Incarceration rates.", "Mass incarceration.", "Alternative to incarceration."], "collocations": ["incarceration rate", "mass incarceration", "risk of incarceration"], "ielts_tip": "Formal word for imprisonment."},
            {"id": "d6v7", "word": "juvenile", "ipa": "/ˈdʒuː.vən.aɪl/", "part_of_speech": "adjective/noun", "definition": "Young person / relating to young people", "examples": ["Juvenile crime.", "Juvenile offenders.", "Juvenile detention."], "collocations": ["juvenile delinquency", "juvenile court", "juvenile offender"], "ielts_tip": "Under 18."},
            {"id": "d6v8", "word": "recidivism", "ipa": "/rɪˈsɪd.ɪ.vɪ.zəm/", "part_of_speech": "noun", "definition": "Returning to crime", "examples": ["High recidivism rates.", "Reduce recidivism.", "Prevent recidivism."], "collocations": ["recidivism rate", "reduce recidivism", "recidivism problem"], "ielts_tip": "Re-offending after release."},
            {"id": "d6v9", "word": "legislation", "ipa": "/ˌledʒ.ɪˈsleɪ.ʃən/", "part_of_speech": "noun", "definition": "Laws passed by government", "examples": ["New legislation.", "Introduce legislation.", "Strict legislation."], "collocations": ["introduce legislation", "strict legislation", "new legislation"], "ielts_tip": "Laws as a group."},
            {"id": "d6v10", "word": "enforce", "ipa": "/ɪnˈfɔːs/", "part_of_speech": "verb", "definition": "Make people obey laws", "examples": ["Enforce the law.", "Enforce regulations.", "Strictly enforced."], "collocations": ["enforce the law", "law enforcement", "strictly enforced"], "ielts_tip": "Noun: enforcement."}
        ],
        "quiz_questions": [
            {"question": "Some argue prison is an effective ___ against crime.", "options": ["rehabilitation", "deterrent", "legislation"], "answer": "deterrent", "explanation": "'Deterrent' means something that discourages crime."},
            {"question": "___ programs help criminals become productive members of society.", "options": ["Deterrent", "Rehabilitation", "Incarceration"], "answer": "Rehabilitation", "explanation": "'Rehabilitation' helps criminals reform."},
            {"question": "The government plans to introduce stricter ___.", "options": ["recidivism", "enforcement", "legislation"], "answer": "legislation", "explanation": "'Legislation' means laws passed by government."}
        ]
    },
    
    # Unit 7: Media & Communication - Vocabulary
    {
        "id": "d-u7-vocab",
        "title": "Unit 7: Media & Communication",
        "band_level": "development",
        "type": "vocabulary",
        "unit_number": 7,
        "description": "Vocabulary for discussing media, news, and communication",
        "ielts_relevance": "Media topics appear frequently in Speaking and Writing.",
        "items": [
            {"id": "d7v1", "word": "broadcast", "ipa": "/ˈbrɔːd.kɑːst/", "part_of_speech": "verb/noun", "definition": "Transmit programs by radio/TV", "examples": ["Broadcast news.", "Live broadcast.", "Broadcasting station."], "collocations": ["live broadcast", "broadcast news", "broadcasting company"], "ielts_tip": "Past: broadcast (same form)."},
            {"id": "d7v2", "word": "coverage", "ipa": "/ˈkʌv.ər.ɪdʒ/", "part_of_speech": "noun", "definition": "Reporting of news events", "examples": ["Media coverage.", "News coverage.", "Extensive coverage."], "collocations": ["media coverage", "news coverage", "extensive coverage"], "ielts_tip": "How much news reports on something."},
            {"id": "d7v3", "word": "bias", "ipa": "/ˈbaɪ.əs/", "part_of_speech": "noun", "definition": "Unfair preference for/against", "examples": ["Media bias.", "Political bias.", "Biased reporting."], "collocations": ["media bias", "political bias", "biased towards"], "ielts_tip": "Adjective: biased."},
            {"id": "d7v4", "word": "reliable", "ipa": "/rɪˈlaɪ.ə.bəl/", "part_of_speech": "adjective", "definition": "Can be trusted, dependable", "examples": ["Reliable sources.", "Reliable information.", "Not reliable."], "collocations": ["reliable source", "reliable information", "highly reliable"], "ielts_tip": "Noun: reliability."},
            {"id": "d7v5", "word": "sensationalism", "ipa": "/senˈseɪ.ʃən.əl.ɪ.zəm/", "part_of_speech": "noun", "definition": "Exaggerating news for attention", "examples": ["Media sensationalism.", "Avoid sensationalism.", "Sensationalist headlines."], "collocations": ["media sensationalism", "sensationalist reporting", "avoid sensationalism"], "ielts_tip": "Making news more dramatic."},
            {"id": "d7v6", "word": "censorship", "ipa": "/ˈsen.sə.ʃɪp/", "part_of_speech": "noun", "definition": "Controlling what media can publish", "examples": ["Government censorship.", "Internet censorship.", "Against censorship."], "collocations": ["government censorship", "media censorship", "self-censorship"], "ielts_tip": "Verb: censor."},
            {"id": "d7v7", "word": "circulation", "ipa": "/ˌsɜː.kjəˈleɪ.ʃən/", "part_of_speech": "noun", "definition": "Number of copies sold/distributed", "examples": ["Newspaper circulation.", "Wide circulation.", "Declining circulation."], "collocations": ["newspaper circulation", "in circulation", "circulation figures"], "ielts_tip": "How many copies sold."},
            {"id": "d7v8", "word": "misinformation", "ipa": "/ˌmɪs.ɪn.fəˈmeɪ.ʃən/", "part_of_speech": "noun", "definition": "False or inaccurate information", "examples": ["Spread misinformation.", "Combat misinformation.", "Online misinformation."], "collocations": ["spread misinformation", "combat misinformation", "misinformation campaign"], "ielts_tip": "Different from disinformation (deliberate)."},
            {"id": "d7v9", "word": "viral", "ipa": "/ˈvaɪə.rəl/", "part_of_speech": "adjective", "definition": "Spreading rapidly online", "examples": ["Go viral.", "Viral video.", "Viral content."], "collocations": ["go viral", "viral video", "viral marketing"], "ielts_tip": "Modern media term."},
            {"id": "d7v10", "word": "platform", "ipa": "/ˈplæt.fɔːm/", "part_of_speech": "noun", "definition": "System for sharing content", "examples": ["Social media platform.", "Online platform.", "Streaming platform."], "collocations": ["social media platform", "online platform", "streaming platform"], "ielts_tip": "Where content is shared."}
        ],
        "quiz_questions": [
            {"question": "Some news outlets show political ___ in their reporting.", "options": ["coverage", "bias", "circulation"], "answer": "bias", "explanation": "'Bias' means unfair preference."},
            {"question": "The video quickly went ___ on social media.", "options": ["broadcast", "viral", "censored"], "answer": "viral", "explanation": "'Viral' means spreading rapidly online."},
            {"question": "It's important to check if news sources are ___.", "options": ["biased", "reliable", "sensational"], "answer": "reliable", "explanation": "'Reliable' means can be trusted."}
        ]
    },
]

# Additional Advanced Units
ADDITIONAL_ADVANCED = [
    # Unit 6: Research & Evidence - Vocabulary
    {
        "id": "a-u6-vocab",
        "title": "Unit 6: Research & Evidence",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 6,
        "description": "Academic vocabulary for discussing research and evidence",
        "ielts_relevance": "Essential for academic writing and discussing studies.",
        "items": [
            {"id": "a6v1", "word": "empirical", "ipa": "/ɪmˈpɪr.ɪ.kəl/", "part_of_speech": "adjective", "definition": "Based on observation/experiment", "examples": ["Empirical evidence.", "Empirical research.", "Empirical data."], "collocations": ["empirical evidence", "empirical research", "empirical findings"], "ielts_tip": "Research-based, not theoretical."},
            {"id": "a6v2", "word": "hypothesis", "ipa": "/haɪˈpɒθ.ə.sɪs/", "part_of_speech": "noun", "definition": "Proposed explanation to test", "examples": ["Test a hypothesis.", "The hypothesis suggests.", "Reject the hypothesis."], "collocations": ["test the hypothesis", "hypothesis testing", "support the hypothesis"], "ielts_tip": "Plural: hypotheses."},
            {"id": "a6v3", "word": "correlate", "ipa": "/ˈkɒr.ə.leɪt/", "part_of_speech": "verb", "definition": "Have mutual relationship", "examples": ["Income correlates with education.", "These factors correlate.", "Correlated variables."], "collocations": ["correlate with", "positively correlate", "closely correlate"], "ielts_tip": "Noun: correlation."},
            {"id": "a6v4", "word": "longitudinal", "ipa": "/ˌlɒn.dʒɪˈtjuː.dɪ.nəl/", "part_of_speech": "adjective", "definition": "Study over long time period", "examples": ["Longitudinal study.", "Longitudinal data.", "Longitudinal research."], "collocations": ["longitudinal study", "longitudinal research", "longitudinal data"], "ielts_tip": "Tracking over time."},
            {"id": "a6v5", "word": "replicate", "ipa": "/ˈrep.lɪ.keɪt/", "part_of_speech": "verb", "definition": "Repeat a study/experiment", "examples": ["Replicate the findings.", "Difficult to replicate.", "Replicated studies."], "collocations": ["replicate the study", "replicate findings", "replicable results"], "ielts_tip": "Repeat to verify."},
            {"id": "a6v6", "word": "robust", "ipa": "/rəʊˈbʌst/", "part_of_speech": "adjective", "definition": "Strong and reliable", "examples": ["Robust evidence.", "Robust methodology.", "Robust findings."], "collocations": ["robust evidence", "robust methodology", "statistically robust"], "ielts_tip": "Strong and unlikely to fail."},
            {"id": "a6v7", "word": "preliminary", "ipa": "/prɪˈlɪm.ɪ.nər.i/", "part_of_speech": "adjective", "definition": "Initial, before main work", "examples": ["Preliminary findings.", "Preliminary research.", "Preliminary results."], "collocations": ["preliminary findings", "preliminary research", "preliminary stage"], "ielts_tip": "Early-stage findings."},
            {"id": "a6v8", "word": "extrapolate", "ipa": "/ɪkˈstræp.ə.leɪt/", "part_of_speech": "verb", "definition": "Extend findings beyond data", "examples": ["Extrapolate from data.", "Cannot extrapolate.", "Extrapolated conclusions."], "collocations": ["extrapolate from", "extrapolate to", "extrapolate findings"], "ielts_tip": "Extend conclusions cautiously."},
            {"id": "a6v9", "word": "cohort", "ipa": "/ˈkəʊ.hɔːt/", "part_of_speech": "noun", "definition": "Group studied together", "examples": ["Birth cohort.", "Study cohort.", "Cohort study."], "collocations": ["cohort study", "birth cohort", "cohort of participants"], "ielts_tip": "Group in a study."},
            {"id": "a6v10", "word": "methodology", "ipa": "/ˌmeθ.əˈdɒl.ə.dʒi/", "part_of_speech": "noun", "definition": "System of methods used", "examples": ["Research methodology.", "Sound methodology.", "Flawed methodology."], "collocations": ["research methodology", "sound methodology", "methodological approach"], "ielts_tip": "How research is done."}
        ],
        "quiz_questions": [
            {"question": "The study provides ___ evidence based on controlled experiments.", "options": ["preliminary", "empirical", "longitudinal"], "answer": "empirical", "explanation": "'Empirical' means based on observation/experiment."},
            {"question": "A ___ study tracks the same group over many years.", "options": ["robust", "longitudinal", "preliminary"], "answer": "longitudinal", "explanation": "'Longitudinal' means over long time period."},
            {"question": "The research ___ suggests a link between diet and health.", "options": ["methodology", "hypothesis", "cohort"], "answer": "hypothesis", "explanation": "'Hypothesis' is a proposed explanation to test."}
        ]
    },
    
    # Unit 7: Economic & Business - Vocabulary
    {
        "id": "a-u7-vocab",
        "title": "Unit 7: Economics & Business",
        "band_level": "advanced",
        "type": "vocabulary",
        "unit_number": 7,
        "description": "Advanced vocabulary for economic discussions",
        "ielts_relevance": "Common in Writing Task 2 and Speaking Part 3.",
        "items": [
            {"id": "a7v1", "word": "fiscal", "ipa": "/ˈfɪs.kəl/", "part_of_speech": "adjective", "definition": "Related to government spending/tax", "examples": ["Fiscal policy.", "Fiscal responsibility.", "Fiscal year."], "collocations": ["fiscal policy", "fiscal responsibility", "fiscal deficit"], "ielts_tip": "Government finances."},
            {"id": "a7v2", "word": "subsidise", "ipa": "/ˈsʌb.sɪ.daɪz/", "part_of_speech": "verb", "definition": "Give government money to support", "examples": ["Subsidise industries.", "Government subsidies.", "Subsidised housing."], "collocations": ["subsidise industry", "government subsidy", "heavily subsidised"], "ielts_tip": "Noun: subsidy."},
            {"id": "a7v3", "word": "austerity", "ipa": "/ɒˈster.ə.ti/", "part_of_speech": "noun", "definition": "Strict economy, reduced spending", "examples": ["Austerity measures.", "Economic austerity.", "Austerity policies."], "collocations": ["austerity measures", "austerity policy", "austerity budget"], "ielts_tip": "Cutting government spending."},
            {"id": "a7v4", "word": "inflation", "ipa": "/ɪnˈfleɪ.ʃən/", "part_of_speech": "noun", "definition": "General increase in prices", "examples": ["Control inflation.", "High inflation.", "Inflation rates."], "collocations": ["inflation rate", "high inflation", "control inflation"], "ielts_tip": "Opposite: deflation."},
            {"id": "a7v5", "word": "recession", "ipa": "/rɪˈseʃ.ən/", "part_of_speech": "noun", "definition": "Period of economic decline", "examples": ["Economic recession.", "Global recession.", "Recession fears."], "collocations": ["economic recession", "deep recession", "recession recovery"], "ielts_tip": "Economic downturn."},
            {"id": "a7v6", "word": "procurement", "ipa": "/prəˈkjʊə.mənt/", "part_of_speech": "noun", "definition": "Obtaining goods/services", "examples": ["Government procurement.", "Procurement process.", "Procurement policies."], "collocations": ["procurement process", "public procurement", "procurement policy"], "ielts_tip": "Formal: buying/acquiring."},
            {"id": "a7v7", "word": "monopoly", "ipa": "/məˈnɒp.əl.i/", "part_of_speech": "noun", "definition": "Exclusive control of market", "examples": ["Market monopoly.", "Break up monopolies.", "Monopoly power."], "collocations": ["market monopoly", "monopoly power", "natural monopoly"], "ielts_tip": "One company controls all."},
            {"id": "a7v8", "word": "diversify", "ipa": "/daɪˈvɜː.sɪ.faɪ/", "part_of_speech": "verb", "definition": "Expand into different areas", "examples": ["Diversify the economy.", "Diversify investments.", "Economic diversification."], "collocations": ["diversify the economy", "diversify investments", "diversification strategy"], "ielts_tip": "Spread into different areas."},
            {"id": "a7v9", "word": "volatile", "ipa": "/ˈvɒl.ə.taɪl/", "part_of_speech": "adjective", "definition": "Likely to change suddenly", "examples": ["Volatile markets.", "Market volatility.", "Economically volatile."], "collocations": ["volatile market", "market volatility", "highly volatile"], "ielts_tip": "Unpredictable changes."},
            {"id": "a7v10", "word": "tariff", "ipa": "/ˈtær.ɪf/", "part_of_speech": "noun", "definition": "Tax on imports/exports", "examples": ["Import tariffs.", "Tariff barriers.", "Impose tariffs."], "collocations": ["import tariff", "tariff barrier", "impose tariffs"], "ielts_tip": "Trade tax."}
        ],
        "quiz_questions": [
            {"question": "The government's ___ policy includes tax cuts and increased spending.", "options": ["austerity", "fiscal", "volatile"], "answer": "fiscal", "explanation": "'Fiscal' relates to government spending and tax."},
            {"question": "During the ___, many businesses closed and unemployment rose.", "options": ["inflation", "recession", "subsidy"], "answer": "recession", "explanation": "'Recession' is a period of economic decline."},
            {"question": "The country needs to ___ its economy beyond oil exports.", "options": ["subsidise", "diversify", "monopolise"], "answer": "diversify", "explanation": "'Diversify' means expand into different areas."}
        ]
    },
]

# Combine all additional units
ALL_ADDITIONAL_UNITS = ADDITIONAL_FOUNDATION + ADDITIONAL_DEVELOPMENT + ADDITIONAL_ADVANCED

async def seed_additional_units():
    """Add additional units to complete the course."""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("📚 Adding additional units to Vocab & Grammar course...")
    print()
    
    total_items = 0
    quiz_count = 0
    
    for unit in ALL_ADDITIONAL_UNITS:
        # Check if unit already exists
        existing = await db.vocab_grammar_lessons.find_one({"id": unit["id"]})
        if existing:
            print(f"⏭️  Skipping (exists): {unit['title']}")
            continue
            
        await db.vocab_grammar_lessons.insert_one(unit)
        items_count = len(unit.get('items', []))
        total_items += items_count
        print(f"✅ {unit['band_level'].upper():12} | Unit {unit['unit_number']:2} | {unit['type']:10} | {items_count:2} items | {unit['title']}")
        
        # Add quiz questions
        if 'quiz_questions' in unit:
            for i, quiz in enumerate(unit['quiz_questions']):
                quiz_doc = {
                    "id": f"{unit['id']}-q{i+1}",
                    "unit_id": unit['id'],
                    "unit_title": unit['title'],
                    "band_level": unit['band_level'],
                    "type": unit['type'],
                    "question": quiz['question'],
                    "options": quiz['options'],
                    "answer": quiz['answer'],
                    "explanation": quiz['explanation']
                }
                await db.vocab_grammar_quizzes.update_one(
                    {"id": quiz_doc["id"]},
                    {"$set": quiz_doc},
                    upsert=True
                )
                quiz_count += 1
    
    # Get final counts
    total_units = await db.vocab_grammar_lessons.count_documents({})
    total_quizzes = await db.vocab_grammar_quizzes.count_documents({})
    
    # Count all items
    all_lessons = await db.vocab_grammar_lessons.find({}).to_list(100)
    all_items = sum(len(l.get('items', [])) for l in all_lessons)
    
    print(f"\n{'='*60}")
    print(f"📊 VOCAB & GRAMMAR COURSE UPDATE COMPLETE!")
    print(f"{'='*60}")
    print(f"   New items added: {total_items}")
    print(f"   New quizzes added: {quiz_count}")
    print(f"{'='*60}")
    print(f"   TOTAL UNITS:   {total_units}")
    print(f"   TOTAL ITEMS:   {all_items}")
    print(f"   TOTAL QUIZZES: {total_quizzes}")
    print(f"{'='*60}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_additional_units())
