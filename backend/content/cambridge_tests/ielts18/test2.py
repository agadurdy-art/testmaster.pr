"""
Cambridge IELTS 18 - Test 2
Complete test structure following Cambridge 17 format
"""

IELTS18_TEST2 = {
    "test_id": "ielts18_test2",
    "book": "Cambridge IELTS 18",
    "test_number": 2,
    "title": "IELTS 18 - Test 2",
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
                    "instructions": "Complete the notes below. Write ONE WORD AND/OR A NUMBER for each answer.",
                    "questions": [
                        {"number": i, "type": "note_completion", "answer": "TBD"} for i in range(1, 11)
                    ]
                },
                {
                    "part_number": 2,
                    "title": "Part 2",
                    "question_range": "11-20",
                    "question_count": 10,
                    "context": "Monologue",
                    "question_types": ["multiple_choice", "matching"],
                    "audio_file": "AUDIO_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "multiple_choice", "answer": "TBD"} for i in range(11, 21)
                    ]
                },
                {
                    "part_number": 3,
                    "title": "Part 3",
                    "question_range": "21-30",
                    "question_count": 10,
                    "context": "Discussion",
                    "question_types": ["multiple_choice", "matching"],
                    "audio_file": "AUDIO_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "multiple_choice", "answer": "TBD"} for i in range(21, 31)
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
                        {"number": i, "type": "sentence_completion", "answer": "TBD"} for i in range(31, 41)
                    ]
                }
            ],
            "answer_key": {}
        },
        "reading": {
            "total_questions": 40,
            "duration": "60 minutes",
            "passages": [
                {
                    "passage_number": 1,
                    "title": "The growth of the British film industry",
                    "question_range": "1-13",
                    "question_count": 13,
                    "topic": "Development of the British film industry",
                    "question_types": ["true_false_notgiven", "sentence_completion"],
                    "text": "PASSAGE_TEXT_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "true_false_notgiven", "answer": "TBD"} for i in range(1, 8)
                    ] + [
                        {"number": i, "type": "sentence_completion", "answer": "TBD"} for i in range(8, 14)
                    ]
                },
                {
                    "passage_number": 2,
                    "title": "Stonehenge",
                    "question_range": "14-26",
                    "question_count": 13,
                    "topic": "The history and purpose of Stonehenge",
                    "question_types": ["matching_information", "sentence_completion", "multiple_choice"],
                    "text": "PASSAGE_TEXT_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "matching_information", "answer": "TBD"} for i in range(14, 19)
                    ] + [
                        {"number": i, "type": "sentence_completion", "answer": "TBD"} for i in range(19, 24)
                    ] + [
                        {"number": i, "type": "multiple_choice", "answer": "TBD"} for i in range(24, 27)
                    ]
                },
                {
                    "passage_number": 3,
                    "title": "Energy solutions",
                    "question_range": "27-40",
                    "question_count": 14,
                    "topic": "Solutions to energy problems",
                    "question_types": ["summary_completion", "yes_no_notgiven", "multiple_choice"],
                    "text": "PASSAGE_TEXT_PLACEHOLDER",
                    "questions": [
                        {"number": i, "type": "summary_completion", "answer": "TBD"} for i in range(27, 33)
                    ] + [
                        {"number": i, "type": "yes_no_notgiven", "answer": "TBD"} for i in range(33, 38)
                    ] + [
                        {"number": i, "type": "multiple_choice", "answer": "TBD"} for i in range(38, 41)
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
                    "visual_type": "map",
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
                {
                    "part_number": 1,
                    "title": "Introduction and Interview",
                    "duration": "4-5 minutes",
                    "topics": ["Topic 1", "Topic 2", "Topic 3"],
                    "sample_questions": ["QUESTIONS_PLACEHOLDER"]
                },
                {
                    "part_number": 2,
                    "title": "Individual Long Turn",
                    "duration": "3-4 minutes",
                    "preparation_time": "1 minute",
                    "speaking_time": "1-2 minutes",
                    "cue_card": {
                        "topic": "TOPIC_PLACEHOLDER",
                        "points": ["point 1", "point 2", "point 3", "point 4"]
                    }
                },
                {
                    "part_number": 3,
                    "title": "Two-way Discussion",
                    "duration": "4-5 minutes",
                    "topic": "TOPIC_PLACEHOLDER",
                    "sample_questions": ["QUESTIONS_PLACEHOLDER"]
                }
            ]
        }
    }
}
