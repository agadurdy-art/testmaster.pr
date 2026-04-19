# Fix for Q21-22 Display Issue

## Problem
In the deployed production environment, questions Q21, Q22, and Q23 are showing separately (as "21", "22", "23") instead of being combined as "Q20-21" and "Q22-23" as they should be for multi-select questions.

## Root Cause
The **production database** still has the old question structure where Q20, Q21, Q22, and Q23 are stored as separate questions. The codebase is correct, but the database needs to be updated.

## Solution

### ✅ Current Status in Preview/Dev Environment
- Questions are correctly stored as combined IDs: "20-21" and "22-23"
- The seed_data.py file has the correct structure
- Frontend correctly displays whatever ID comes from the database

### ❌ Issue in Production Environment
- The production database still has separate questions (20, 21, 22, 23)
- Need to run a migration/update script on the production database

### 🔧 How to Fix

**Option 1: Run the Production Fix Script**
```bash
cd /app/backend
python3 fix_production_questions.py
```

This script will:
1. Find questions 20, 21, 22, 23 in the reading test
2. Combine them into "20-21" and "22-23"
3. Update the answer keys accordingly
4. Verify the changes

**Option 2: Re-seed the Entire Database** (if starting fresh)
```bash
cd /app/backend
python3 seed_data.py
```

⚠️ WARNING: This will delete ALL existing test data and re-seed from scratch.

### 📝 After Running the Fix

1. **Redeploy** your application (so the production environment picks up the changes)
2. **Clear browser cache** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Test** by navigating to the reading test and checking Passage 2
4. **Verify** that questions now show as:
   - Q20-21 (not Q20, Q21 separately)
   - Q22-23 (not Q22, Q23 separately)

### 🎯 Expected Result

**Before:**
```
Q20 Which statement...
Q21 Which statement...
Q22 Which TWO statements...
Q23 (shouldn't exist as separate question)
```

**After:**
```
Q20-21 Which TWO statements... (Select exactly 2 options)
Q22-23 Which TWO statements... (Select exactly 2 options)
```

### 🔍 How to Verify the Database

Run this to check the current state:
```bash
cd /app/backend
python3 check_reading_questions.py
```

This will show you what question IDs are currently in the database.

## Technical Details

### Why This Happened
- Preview/development environment: Uses the local database which was seeded with correct data
- Production environment: Has a separate database that wasn't updated when the seed script was modified

### Files Involved
- `/app/backend/seed_data.py` - Contains correct question structure (lines 120-122)
- `/app/backend/fix_production_questions.py` - Migration script to fix production DB
- `/app/frontend/src/pages/TestInterface.js` - Frontend displays `q.id` directly (line 979)

### Database Structure
```javascript
// Correct format (multi-select questions)
{
  "id": "20-21",  // Combined ID
  "type": "multiple_choice_multi",
  "question": "Which TWO statements...",
  "answer_count": 2,
  "answer_ids": [20, 21]
}

// Incorrect format (separate questions)
{
  "id": 20,
  "type": "multiple_choice",
  ...
}
{
  "id": 21,
  "type": "multiple_choice",
  ...
}
```

## Contact
If the issue persists after following these steps, please check:
1. Are you looking at the correct deployed URL?
2. Have you cleared your browser cache completely?
3. Did the fix script run successfully in production?
