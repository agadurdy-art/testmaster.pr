"""
Cambridge IELTS 18 - Test 3
Complete test with answer keys
"""

IELTS18_TEST3 = {
    "test_id": "ielts18_test3",
    "book": "Cambridge IELTS 18",
    "test_number": 3,
    "title": "IELTS 18 - Test 3",
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
                    "title": "Part 1",
                    "question_range": "1-10",
                    "question_count": 10,
                    "context": "Conversation",
                    "question_types": ["note_completion"],
                    "audio_file": "AUDIO_PLACEHOLDER",
                    "questions": [
                        {"number": 1, "type": "note_completion", "answer": "Marrowfield"},
                        {"number": 2, "type": "note_completion", "answer": "relative"},
                        {"number": 3, "type": "note_completion", "answer": "socialise"},
                        {"number": 4, "type": "note_completion", "answer": "full"},
                        {"number": 5, "type": "note_completion", "answer": "Domestic Life"},
                        {"number": 6, "type": "note_completion", "answer": "clouds"},
                        {"number": 7, "type": "note_completion", "answer": "timing"},
                        {"number": 8, "type": "note_completion", "answer": "Animal Magic"},
                        {"number": 9, "type": "note_completion", "answer": "(animal) movement"},
                        {"number": 10, "type": "note_completion", "answer": "dark"}
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Part 2",
                    "question_range": "11-20",
                    "question_count": 10,
                    "context": "Monologue",
                    "question_types": ["multiple_selection", "multiple_choice"],
                    "audio_file": "AUDIO_PLACEHOLDER",
                    "questions": [
                        {"number": "11-12", "type": "multiple_selection", "answer": ["B", "C"], "answer_count": 2},
                        {"number": "13-14", "type": "multiple_selection", "answer": ["B", "D"], "answer_count": 2},
                        {"number": 15, "type": "multiple_choice", "answer": "C"},
                        {"number": 16, "type": "multiple_choice", "answer": "B"},
                        {"number": 17, "type": "multiple_choice", "answer": "B"},
                        {"number": 18, "type": "multiple_choice", "answer": "C"},
                        {"number": 19, "type": "multiple_choice", "answer": "A"},
                        {"number": 20, "type": "multiple_choice", "answer": "A"}
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Part 3",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "Discussion",
                    "question_types": ["multiple_selection", "matching"],
                    "audio_file": "AUDIO_PLACEHOLDER",
                    "questions": [
                        {"number": "21-22", "type": "multiple_selection", "answer": ["A", "E"], "answer_count": 2},
                        {"number": "23-24", "type": "multiple_selection", "answer": ["B", "D"], "answer_count": 2},
                        {"number": 25, "type": "matching", "answer": "G"},
                        {"number": 26, "type": "matching", "answer": "E"},
                        {"number": 27, "type": "matching", "answer": "B"},
                        {"number": 28, "type": "matching", "answer": "C"},
                        {"number": 29, "type": "matching", "answer": "F"},
                        {"number": 30, "type": "matching", "answer": "A"}
                    ]
                },
                {
                    "part_number": 4,
                    "title": "Part 4",
                    "question_range": "31-40",
                    "question_count": 10,
                    "context": "Lecture",
                    "question_types": ["sentence_completion"],
                    "audio_file": "AUDIO_PLACEHOLDER",
                    "questions": [
                        {"number": 31, "type": "sentence_completion", "answer": "technical"},
                        {"number": 32, "type": "sentence_completion", "answer": "cheap"},
                        {"number": 33, "type": "sentence_completion", "answer": "thousands"},
                        {"number": 34, "type": "sentence_completion", "answer": "identification"},
                        {"number": 35, "type": "sentence_completion", "answer": "tracking"},
                        {"number": 36, "type": "sentence_completion", "answer": "military"},
                        {"number": 37, "type": "sentence_completion", "answer": "location"},
                        {"number": 38, "type": "sentence_completion", "answer": "prediction"},
                        {"number": 39, "type": "sentence_completion", "answer": "database"},
                        {"number": 40, "type": "sentence_completion", "answer": "trust"}
                    ]
                }
            ],
            "answer_key": {
                1: "Marrowfield", 2: "relative", 3: "socialise", 4: "full", 5: "Domestic Life",
                6: "clouds", 7: "timing", 8: "Animal Magic", 9: "(animal) movement", 10: "dark",
                "11-12": ["B", "C"], "13-14": ["B", "D"], 15: "C", 16: "B", 17: "B", 18: "C", 19: "A", 20: "A",
                "21-22": ["A", "E"], "23-24": ["B", "D"], 25: "G", 26: "E", 27: "B", 28: "C", 29: "F", 30: "A",
                31: "technical", 32: "cheap", 33: "thousands", 34: "identification", 35: "tracking",
                36: "military", 37: "location", 38: "prediction", 39: "database", 40: "trust"
            }
        },
        "reading": {
            "total_questions": 40,
            "duration": "60 minutes",
            "passages": [
                {
                    "passage_number": 1,
                    "title": "Passage 1",
                    "question_range": "1-13",
                    "question_count": 13,
                    "topic": "Topic placeholder",
                    "question_types": ["true_false_notgiven", "sentence_completion"],
                    "text": "PASSAGE_TEXT_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "sentence_completion", "answer": "TBD"} for i in range(1, 14)
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Passage 2",
                    "question_range": "14-26",
                    "question_count": 13,
                    "topic": "Topic placeholder",
                    "question_types": ["matching_information", "sentence_completion"],
                    "text": "PASSAGE_TEXT_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "sentence_completion", "answer": "TBD"} for i in range(14, 27)
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Passage 3",
                    "question_range": "27-40",
                    "question_count": 14,
                    "topic": "Topic placeholder",
                    "question_types": ["summary_completion", "yes_no_notgiven"],
                    "text": "PASSAGE_TEXT_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "sentence_completion", "answer": "TBD"} for i in range(27, 41)
                    ]
                }
            ],
            "answer_key": {}
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
                    "visual_url": "VISUAL_PLACEHOLDER",
                    "prompt": "PROMPT_PLACEHOLDER"
                },
                {
                    "task_number": 2,
                    "task_type": "essay",
                    "description": "Write an essay",
                    "word_limit": "at least 250 words",
                    "time_suggestion": "40 minutes",
                    "prompt": "PROMPT_PLACEHOLDER"
                }
            ]
        },
        "speaking": {
            "total_parts": 3,
            "duration": "11-14 minutes",
            "parts": [
                {"part_number": 1, "title": "Introduction and Interview", "duration": "4-5 minutes"},
                {"part_number": 2, "title": "Individual Long Turn", "duration": "3-4 minutes"},
                {"part_number": 3, "title": "Two-way Discussion", "duration": "4-5 minutes"}
            ]
        }
    }
}
