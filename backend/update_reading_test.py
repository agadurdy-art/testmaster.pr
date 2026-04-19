#!/usr/bin/env python3
"""
Update Academic Reading Practice Test 1 to match authentic IELTS format
- Split passages into paragraphs
- Add proper formatting for summary completion questions
- Update question types and structures
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

client = MongoClient(os.getenv("MONGO_URL"))
db = client[os.getenv("DB_NAME")]

# Passage 1: How tennis rackets have changed (with proper paragraphs)
passage_1_paragraphs = [
    {
        "id": "A",
        "text": "In 2016, the British professional tennis player Andy Murray was ranked as the world's number one. Over the previous twelve months, he had won numerous tournaments, including the ATP World Tour Finals, and at the French Open he reached the final for the first time. Yet surprisingly, earlier in his career, Murray had been regarded as a talented but erratic player who would never quite reach the pinnacle of the sport or win the major tournaments."
    },
    {
        "id": "B",
        "text": "Of the changes that account for this transformation, one was visible and widely publicised: in 2011, Murray invited former number one player Ivan Lendl onto his coaching team – a valuable addition that had a visible impact on the player's playing style. But another, less conspicuous change also played a part: the modifications Murray made to the stringing on his rackets. The change from a synthetic string to a natural one may seem minor. It should not be underestimated, however. As Colin Triplow, who strings rackets for some of the world's leading professionals, explains: 'What we're talking about here is a highly important phenomenon: the modification of the racket to individual performance characteristics.'"
    },
    {
        "id": "C",
        "text": "The modification that Murray made is just one of a number of options available to players looking to tweak their rackets in order to improve their games. For some players, the priority will be to enhance their touch when hitting the ball. To achieve this, they might change the string pattern on their racket, giving them more 'open' (i.e. fewer crosses and mains) or 'closed' (i.e. more crosses and mains). The identical approach is taken by the world famous tennis twins, Mike and Bob Bryan. 'At every level of the game, we're very particular with our racket specifications,' they say. 'All our rackets are sent from our manufacturer to Tampa, Florida, where our frames go through a ... thorough customisation process.'"
    },
    {
        "id": "D",
        "text": "They explain how they have adjusted not only racket length, but even experimented with different kinds of paint. As one player told me recently, 'Nowadays, getting a racket out of the box is not what it used to be. You can adjust everything if you know what you're looking for.' Mike and Bob also adjust the density of their string patterns, either by having more strings put in (i.e. more crosses and mains) or fewer strings put in (i.e. fewer crosses and mains), to control the power and spin of the ball."
    },
    {
        "id": "E",
        "text": "The primary reason for these modifications is simple: as the line between winning and losing becomes thinner and thinner, even these slight changes become more and more important. The pace of professional tennis has increased dramatically in recent years, and players are constantly seeking new ways to gain that extra advantage over their opponents. As such, racket customisation has become an absolutely critical part of the game at the highest level, and one which players and their coaches are increasingly willing to invest time and money in to maximise their competitive advantage."
    }
]

# Update the test in database
print("Updating Academic Reading Practice Test 1...")

update_result = db.tests.update_one(
    {"title": "Academic Reading Practice Test 1"},
    {
        "$set": {
            "type": "reading",
            "passages": [
                {
                    "id": 1,
                    "title": "Passage 1: How tennis rackets have changed",
                    "paragraphs": passage_1_paragraphs,
                    "questions_range": "1-13"
                }
            ]
        }
    }
)

print(f"✅ Updated {update_result.modified_count} document(s)")

# Update questions 31-36 to have proper summary completion format
summary_answer_choices = [
    {"letter": "A", "text": "at varying speeds"},
    {"letter": "B", "text": "to check the accuracy of what they have heard"},
    {"letter": "C", "text": "and immediately question its validity"},
    {"letter": "D", "text": "which often seems reasonable"},
    {"letter": "E", "text": "reflect on the arguments put forward"},
    {"letter": "F", "text": "rather than passively absorb all incoming information"},
    {"letter": "G", "text": "that all information encountered is true"},
    {"letter": "H", "text": "using cognitive resources"},
    {"letter": "I", "text": "and then automatically accept or reject it"},
    {"letter": "J", "text": "then we only label it afterwards"}
]

# Update question 31-36 type to include answer choices
db.tests.update_one(
    {"title": "Academic Reading Practice Test 1"},
    {
        "$set": {
            "questions.$[elem].answer_choices": summary_answer_choices
        }
    },
    array_filters=[
        {"elem.id": {"$gte": 31, "$lte": 36}}
    ]
)

print("✅ Updated summary completion questions with answer choices")
print("Done!")
