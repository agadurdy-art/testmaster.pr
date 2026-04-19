# Cambridge IELTS 19 Content Import Guide

## How to Add Your Test Content

Since I cannot extract copyrighted content from the PDF, here's how you can add it yourself:

### Method 1: Direct Database Update (Recommended)

1. **Edit the seed file**: `/app/backend/seed_data.py`

2. **For Reading Test** - Replace the passages and questions with your Cambridge IELTS 19 Test 1:
   - Copy Passage 1 text from your book
   - Copy all questions 1-13 with options
   - Copy Passage 2 text and questions 14-26
   - Copy Passage 3 text and questions 27-40
   - Add the answer key

3. **For Listening Test** - Add the transcript and questions:
   - Copy the audio transcript for each section
   - Copy all 40 questions with context
   - Add answer key

4. **For Writing Test** - Add the tasks:
   - For Task 1: Describe the chart/graph you see
   - Upload the chart image to `/app/frontend/public/images/`
   - For Task 2: Copy the essay question

5. **Run**: `python /app/backend/seed_data.py`

### Method 2: API Upload (Coming Soon)

Admin interface at `/admin` to paste content directly.

### Quick Template for Reading Test:

```python
{
    "passage": {
        "id": 1,
        "title": "YOUR PASSAGE TITLE FROM BOOK",
        "text": """PASTE FULL PASSAGE TEXT HERE"""
    },
    "questions": [
        {"id": 1, "passage": 1, "type": "true_false_notgiven", "question": "PASTE QUESTION 1"},
        {"id": 2, "passage": 1, "type": "multiple_choice", "question": "PASTE QUESTION 2", 
         "options": ["A) option1", "B) option2", "C) option3", "D) option4"]},
        # ... continue for all 40 questions
    ],
    "answer_key": [
        {"question_id": 1, "answer": "True"},
        {"question_id": 2, "answer": "B"},
        # ... all answers
    ]
}
```

### For Images (Writing Task 1):

1. Save chart/graph as image file
2. Upload to: `/app/frontend/public/images/writing-task1-test1.png`
3. Reference in question: `"image_url": "/images/writing-task1-test1.png"`

## Technical Fixes Applied:

✅ Microphone permissions handler added
✅ Answer explanations structure ready
✅ AI evaluation working (GPT-5 + Whisper)
✅ All 40 questions displaying
✅ Audio recording/transcription functional

## Need Help?

The platform structure is complete and matches official IELTS format. Just add your content and it will work immediately.
