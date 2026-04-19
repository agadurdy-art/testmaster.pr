"""
Stage 2: Starters (A1) - Master Data
Based on Fun for Starters 4th Edition + PhD-level Mastery Curriculum
"""

STAGE_2_DATA = {
    "stage": "stage_2",
    "stage_title": "Starters (A1)",
    "units": [
        {
            "unit_num": 1,
            "title": "Say Hello!",
            "subtitle": "Greetings, Friends & Alphabet",
            "grammar_focus": ["Subject Pronouns (He/She/They)", "Who is...?", "Alphabet names"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Greetings", "vocab": ["hello", "hi", "answer", "listen"], "context": "Meeting the teacher on the first day.", "topic": "greetings"},
                {"lesson_num": 2, "title": "Friends", "vocab": ["they", "name", "new", "old"], "context": "Introducing two new students, Ben and Kim.", "topic": "friends"},
                {"lesson_num": 3, "title": "Alphabet", "vocab": ["alphabet", "spell", "letter", "word"], "context": "A spelling game in the classroom.", "topic": "alphabet"},
                {"lesson_num": 4, "title": "Unit 1 Review", "is_review": True, "context": "Spiral check of all Unit 1 items with distractors from Stage 1.", "topic": "review"}
            ]
        },
        {
            "unit_num": 2,
            "title": "Numbers & Colors",
            "subtitle": "Counting & Color Descriptions",
            "grammar_focus": ["How many are there?", "There are [Number] [Color] [Objects]."],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Numbers 11-15", "vocab": ["eleven", "twelve", "thirteen", "fourteen", "fifteen"], "context": "Counting colorful balloons at a party.", "topic": "numbers"},
                {"lesson_num": 2, "title": "Numbers 16-20", "vocab": ["sixteen", "seventeen", "eighteen", "nineteen", "twenty"], "context": "Counting books on a library shelf.", "topic": "numbers"},
                {"lesson_num": 3, "title": "New Colors", "vocab": ["purple", "grey", "brown", "white", "black", "rainbow"], "context": "Describing the colors of a classroom rainbow.", "topic": "colors"},
                {"lesson_num": 4, "title": "Unit 2 Review", "is_review": True, "context": "Counting colored objects and identifying higher numbers.", "topic": "review"}
            ]
        },
        {
            "unit_num": 3,
            "title": "What's in Your Classroom?",
            "subtitle": "Classroom Objects & Prepositions",
            "grammar_focus": ["Prepositions of Place (in, on, under, next to, behind)"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Objects", "vocab": ["desk", "chair", "board", "computer"], "context": "A tour of the school computer room.", "topic": "classroom objects"},
                {"lesson_num": 2, "title": "Positions 1", "vocab": ["in", "on", "under"], "context": "Finding a lost pencil in the classroom.", "topic": "prepositions"},
                {"lesson_num": 3, "title": "Positions 2", "vocab": ["behind", "next to", "wall", "floor"], "context": "Describing where pictures are hanging in the room.", "topic": "prepositions"},
                {"lesson_num": 4, "title": "Unit 3 Review", "is_review": True, "context": "Find the object challenge using prepositions.", "topic": "review"}
            ]
        },
        {
            "unit_num": 4,
            "title": "Body & Action",
            "subtitle": "Body Parts & Action Verbs",
            "grammar_focus": ["Modal Can / Can't", "Can you...?", "Action verbs"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Body Review", "vocab": ["shoulders", "knees", "toes", "arm", "leg"], "context": "A morning exercise routine.", "topic": "body parts"},
                {"lesson_num": 2, "title": "Actions", "vocab": ["jump", "run", "sing", "dance"], "context": "A talent show where kids show what they can do.", "topic": "actions"},
                {"lesson_num": 3, "title": "Abilities", "vocab": ["can", "can't", "swim", "climb"], "context": "Describing a robot's functions.", "topic": "abilities"},
                {"lesson_num": 4, "title": "Unit 4 Review", "is_review": True, "context": "Combining body parts and actions.", "topic": "review"}
            ]
        },
        {
            "unit_num": 5,
            "title": "Animals Everywhere",
            "subtitle": "Zoo Animals & Descriptions",
            "grammar_focus": ["Present Simple (it lives, it eats)", "Has it got...?", "Physical descriptions"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Zoo Animals", "vocab": ["giraffe", "hippo", "zebra", "snake"], "context": "A virtual trip to the zoo.", "topic": "zoo animals"},
                {"lesson_num": 2, "title": "Small Animals", "vocab": ["spider", "frog", "lizard", "tail"], "context": "Looking for tiny animals in a garden.", "topic": "small animals"},
                {"lesson_num": 3, "title": "Descriptions", "vocab": ["long neck", "big ears", "scary", "funny"], "context": "Guessing an animal based on physical clues.", "topic": "animal descriptions"},
                {"lesson_num": 4, "title": "Unit 5 Review", "is_review": True, "context": "Sorting animals by size and habitat.", "topic": "review"}
            ]
        },
        {
            "unit_num": 6,
            "title": "My Family & Friends",
            "subtitle": "Family Members & Possessives",
            "grammar_focus": ["Possessive 's (Ben's father)", "Who are they?", "Plural nouns"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Family Tree", "vocab": ["son", "daughter", "baby", "parent"], "context": "Looking at a family photo album.", "topic": "family"},
                {"lesson_num": 2, "title": "Relatives", "vocab": ["uncle", "aunt", "cousin"], "context": "Talking about visitors coming for dinner.", "topic": "relatives"},
                {"lesson_num": 3, "title": "People", "vocab": ["man", "woman", "children", "person"], "context": "Describing people at a park.", "topic": "people"},
                {"lesson_num": 4, "title": "Unit 6 Review", "is_review": True, "context": "Identifying family members and using possessive 's.", "topic": "review"}
            ]
        },
        {
            "unit_num": 7,
            "title": "Food I Like!",
            "subtitle": "Food, Drinks & Preferences",
            "grammar_focus": ["Do you like...?", "Yes, I do / No, I don't", "Conjunction 'and'"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Lunch Time", "vocab": ["chicken", "rice", "beans", "bread"], "context": "Choosing food in the school canteen.", "topic": "food"},
                {"lesson_num": 2, "title": "Drinks", "vocab": ["water", "juice", "milk", "hot", "cold"], "context": "Ordering drinks at a cafe.", "topic": "drinks"},
                {"lesson_num": 3, "title": "Preferences", "vocab": ["like", "don't like", "favorite", "fruit"], "context": "A survey about favorite snacks.", "topic": "preferences"},
                {"lesson_num": 4, "title": "Unit 7 Review", "is_review": True, "context": "Creating a healthy meal plan.", "topic": "review"}
            ]
        },
        {
            "unit_num": 8,
            "title": "My House",
            "subtitle": "Rooms, Furniture & Existence",
            "grammar_focus": ["Is there a...?", "Are there any...?", "There is / There are"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Rooms", "vocab": ["kitchen", "bathroom", "bedroom", "living room"], "context": "Describing the different parts of a house.", "topic": "rooms"},
                {"lesson_num": 2, "title": "Furniture", "vocab": ["mirror", "clock", "phone", "stairs"], "context": "Finding objects while cleaning a room.", "topic": "furniture"},
                {"lesson_num": 3, "title": "Existence", "vocab": ["there is", "there are", "many", "some"], "context": "Describing what is inside a dream house.", "topic": "existence"},
                {"lesson_num": 4, "title": "Unit 8 Review", "is_review": True, "context": "Matching furniture to the correct rooms.", "topic": "review"}
            ]
        },
        {
            "unit_num": 9,
            "title": "What are we doing?",
            "subtitle": "Present Continuous Actions",
            "grammar_focus": ["Present Continuous (am/is/are + verb-ing)"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Current Actions", "vocab": ["eating", "drinking", "playing", "wearing"], "context": "Describing a busy scene in a playground.", "topic": "current actions"},
                {"lesson_num": 2, "title": "At Home Actions", "vocab": ["sleeping", "drawing", "watching TV", "listening to music"], "context": "A phone call asking family members what they are doing.", "topic": "home actions"},
                {"lesson_num": 3, "title": "Grammar Focus", "vocab": ["-ing endings", "am", "is", "are"], "context": "A Mime the action game.", "topic": "grammar"},
                {"lesson_num": 4, "title": "Unit 9 Review", "is_review": True, "context": "Describing a picture of people doing various activities.", "topic": "review"}
            ]
        },
        {
            "unit_num": 10,
            "title": "Clothes",
            "subtitle": "Clothing & Descriptions",
            "grammar_focus": ["He/She is wearing...", "Adjective + Noun order (e.g., blue skirt)"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Basic Clothes", "vocab": ["shirt", "skirt", "dress", "trousers"], "context": "Getting dressed for school in the morning.", "topic": "clothes"},
                {"lesson_num": 2, "title": "Accessories", "vocab": ["shoes", "socks", "jacket", "hat"], "context": "Packing a bag for a cold trip.", "topic": "accessories"},
                {"lesson_num": 3, "title": "Descriptions", "vocab": ["glasses", "handbag", "clean", "dirty"], "context": "Identifying people at a party by their clothes.", "topic": "clothing descriptions"},
                {"lesson_num": 4, "title": "Unit 10 Review", "is_review": True, "context": "Dressing an avatar with specific colors and items.", "topic": "review"}
            ]
        },
        {
            "unit_num": 11,
            "title": "Play & Hobbies",
            "subtitle": "Sports, Music & Frequency",
            "grammar_focus": ["Verbs Play, Go, Do", "Adverbs of frequency (always, never)"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Sports", "vocab": ["basketball", "football", "tennis", "game"], "context": "Choosing a sport to play at the weekend.", "topic": "sports"},
                {"lesson_num": 2, "title": "Arts & Music", "vocab": ["guitar", "piano", "paint", "photo"], "context": "An after-school hobby club.", "topic": "arts"},
                {"lesson_num": 3, "title": "Frequency", "vocab": ["always", "never", "sometimes", "radio"], "context": "Describing daily hobby routines.", "topic": "frequency"},
                {"lesson_num": 4, "title": "Unit 11 Review", "is_review": True, "context": "Creating a weekly hobby schedule.", "topic": "review"}
            ]
        },
        {
            "unit_num": 12,
            "title": "Review & Final Gate",
            "subtitle": "Cumulative Review of Units 1-11",
            "grammar_focus": ["All Stage 2 grammar patterns"],
            "phonics_focus": [],
            "lessons": [
                {"lesson_num": 1, "title": "Basics Review", "vocab": ["greetings", "numbers", "colors"], "context": "A welcome back party.", "topic": "basics review", "is_review": True, "review_scope": "units_1_3"},
                {"lesson_num": 2, "title": "Description Review", "vocab": ["body", "clothes", "animals", "family"], "context": "Describing a Mystery Person.", "topic": "description review", "is_review": True, "review_scope": "units_4_6"},
                {"lesson_num": 3, "title": "Usage Review", "vocab": ["present continuous", "can/can't", "likes/dislikes"], "context": "A weekend trip story.", "topic": "usage review", "is_review": True, "review_scope": "units_7_9"},
                {"lesson_num": 4, "title": "Starters Mock Exam", "vocab": ["all skills"], "context": "The Island Adventure where students use all skills to find a treasure and earn their Stage 2 Certificate.", "topic": "final exam", "is_review": True, "review_scope": "all"}
            ]
        }
    ]
}
