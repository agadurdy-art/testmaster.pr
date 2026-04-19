"""
Generate listening audio for new test sets (F, G, H).
Run in background: python3 generate_new_set_audio.py &
"""
import asyncio
import os
import sys
sys.path.insert(0, '/app/backend')

from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from services.audio_generator import AudioGeneratorService

async def generate_all():
    service = AudioGeneratorService()
    if not service.client:
        print("ERROR: ElevenLabs client not initialized")
        return
    
    sets_to_generate = ['academic_set_f_01', 'academic_set_g_01', 'academic_set_h_01']
    
    for set_id in sets_to_generate:
        print(f"\n{'='*50}")
        print(f"Generating audio for {set_id}")
        print(f"{'='*50}")
        
        # Import the set data
        if set_id == 'academic_set_f_01':
            from content.full_tests.academic.set_f import ACADEMIC_SET_F as test_data
        elif set_id == 'academic_set_g_01':
            from content.full_tests.academic.set_g import ACADEMIC_SET_G as test_data
        elif set_id == 'academic_set_h_01':
            from content.full_tests.academic.set_h import ACADEMIC_SET_H as test_data
        
        results = await service.generate_all_listening_audio(test_data)
        
        for part_key, result in results.items():
            if isinstance(result, dict):
                if result.get('error'):
                    print(f"  {part_key}: ERROR - {result['error']}")
                else:
                    print(f"  {part_key}: OK - {result.get('audio_url', 'generated')}")
            else:
                print(f"  {part_key}: {result}")
    
    print("\n\nAll audio generation complete!")

if __name__ == '__main__':
    asyncio.run(generate_all())
