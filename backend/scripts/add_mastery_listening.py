#!/usr/bin/env python3
"""
Add listening sections to all Mastery Course modules in seed_mastery_course.py
"""

import re
import sys
sys.path.insert(0, '/app/backend/scripts')
from mastery_listening_content import MASTERY_LISTENING_CONTENT

def add_listening_to_seed():
    """Add listening data to each module in the seed file"""
    
    seed_file = '/app/backend/seed_mastery_course.py'
    
    with open(seed_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if listening already exists
    if "'listening':" in content and "audio_script" in content:
        print("Listening sections already exist in seed file.")
        return
    
    # For each module, add listening section before the quiz section
    for module_num, listening_data in MASTERY_LISTENING_CONTENT.items():
        # Create listening section string
        listening_str = f"""'listening': {{
        'title': {repr(listening_data['title'])},
        'audio_script': {repr(listening_data['audio_script'])},
        'comprehension_questions': {repr(listening_data['comprehension_questions'])},
        'vocab_focus': {repr(listening_data['vocab_focus'])},
        'listening_tips': {repr(listening_data['listening_tips'])}
    }}, """
        
        # Find the quiz section for this module and insert listening before it
        pattern = rf"('id': 'mastery-module-{module_num}'.*?)'quiz':"
        
        def replacer(match):
            return match.group(1) + listening_str + "'quiz':"
        
        content = re.sub(pattern, replacer, content, flags=re.DOTALL)
        print(f"Added listening to module {module_num}")
    
    # Write back
    with open(seed_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\nSuccessfully updated {seed_file}")

if __name__ == "__main__":
    add_listening_to_seed()
