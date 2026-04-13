#!/usr/bin/env python3
"""
Update seed_beginner_english.py to include listening data from update_all_listening.py
"""

import re

# Read the listening content from update_all_listening.py
with open('/app/backend/scripts/update_all_listening.py', 'r') as f:
    content = f.read()

# Extract ALL_LISTENING_CONTENT dict
start = content.find('ALL_LISTENING_CONTENT = {')
end = content.find('\n\nasync def update_all_lessons')
listening_dict_str = content[start:end]

# Read current seed file
with open('/app/backend/seed_beginner_english.py', 'r') as f:
    seed_content = f.read()

# Check if listening is already in the seed file
if 'ALL_LISTENING_CONTENT' in seed_content:
    print("Listening data already in seed file")
else:
    # Find where BEGINNER_LESSONS starts
    insert_pos = seed_content.find('BEGINNER_LESSONS = [')
    
    # Insert listening dict before BEGINNER_LESSONS
    new_seed = seed_content[:insert_pos] + listening_dict_str + "\n\n" + seed_content[insert_pos:]
    
    # Write updated seed file
    with open('/app/backend/seed_beginner_english.py', 'w') as f:
        f.write(new_seed)
    
    print("✅ Listening data added to seed_beginner_english.py")
