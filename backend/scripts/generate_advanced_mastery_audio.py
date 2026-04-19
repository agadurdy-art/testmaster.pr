#!/usr/bin/env python3
"""
Generate Advanced Mastery listening audio files using ElevenLabs.
Each module gets a professional academic lecture audio.

Audio Naming Convention:
- /audio/advanced_mastery/module_{N}_listening.mp3

Voice: British academic lecturer style
Speed: Natural (1.0) - C1-C2 level content
"""

import os
import io
from pydub import AudioSegment
from elevenlabs import ElevenLabs
from elevenlabs import VoiceSettings

ELEVENLABS_API_KEY = "sk_6d53acc086b064e9d104119ba83ff0dd4d85a7e5141420e7"
OUTPUT_DIR = "/app/frontend/public/audio/advanced_mastery"

# Voice for academic lectures - British male professor
VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # George - British male, warm storyteller

# Advanced Mastery Module Transcripts (matching database content)
ADVANCED_LISTENING_DATA = [
    {
        "module": 1,
        "title": "The Challenges and Opportunities of Artificial Intelligence",
        "transcript": """Good morning everyone. Today I want to discuss the multifaceted challenges and opportunities that Artificial Intelligence, or AI, presents within what many now term 'The Digital Frontier.' As you may already be aware, AI is not merely a technological trend. It represents a seismic shift akin to the Industrial Revolution.

A recent study conducted by the Oxford Internet Institute indicates that approximately 47% of jobs in the US could be automated within the next two decades. However, it's not all doom and gloom. AI is set to revolutionize industries by enhancing efficiency and accuracy. For instance, in healthcare, DeepMind's algorithms are assisting in diagnosing eye diseases with an accuracy rate of 94%, as reported by The Lancet.

Nonetheless, one cannot overlook the ethical implications. Should AI systems have autonomy in decision-making processes, especially those impacting human lives? Experts like Professor Stuart Russell from Berkeley argue the importance of integrating ethical considerations from the start. He notes that while AI could add $13 trillion to the global economy by 2030, as per McKinsey Global Institute, the societal divide could widen if regulations aren't implemented judiciously.

Thus, as we forge ahead into this digital age, it is imperative to balance innovation with ethical responsibility. In conclusion, the digital frontier offers unprecedented opportunities but also compels us to reconsider our ethical frameworks to ensure that future advancements benefit all of humanity equitably."""
    },
    {
        "module": 2,
        "title": "Sustainable Development and Environmental Conservation",
        "transcript": """Good afternoon, class. Today we'll examine the critical intersection of sustainable development and environmental conservation. The concept of sustainability has evolved significantly since the 1987 Brundtland Report first defined it as meeting present needs without compromising future generations' ability to meet theirs.

Current research from the World Wildlife Fund indicates that humanity is consuming resources at 1.7 times the rate Earth can regenerate them. This ecological overshoot has profound implications for biodiversity, with the Living Planet Index showing a 69% decline in wildlife populations since 1970.

However, there are promising developments. Renewable energy capacity has increased by 280% over the past decade, with solar and wind power now cheaper than fossil fuels in many regions. Countries like Costa Rica have achieved nearly 100% renewable electricity generation, demonstrating that ambitious environmental goals are achievable.

The circular economy model presents another opportunity. Rather than the traditional linear 'take-make-dispose' approach, circular systems design out waste through recycling, reusing, and regenerating materials. The Ellen MacArthur Foundation estimates this could generate $4.5 trillion in economic benefits by 2030.

Nevertheless, implementation challenges remain significant. Developing nations often face difficult trade-offs between economic growth and environmental protection. International cooperation, technology transfer, and climate finance are essential for ensuring a just transition globally."""
    },
    {
        "module": 3,
        "title": "The Psychology of Learning and Memory",
        "transcript": """Welcome everyone. Today's lecture focuses on the fascinating field of cognitive psychology, specifically how we learn and retain information. Understanding these mechanisms has profound implications for education, professional development, and lifelong learning.

The human memory system operates through three primary stages: encoding, storage, and retrieval. Research by cognitive psychologist Hermann Ebbinghaus demonstrated that we forget approximately 70% of new information within 24 hours unless we actively review it. This finding led to the development of spaced repetition techniques, now widely used in language learning applications.

Recent neuroscience research has revealed the importance of sleep in memory consolidation. Studies at Harvard Medical School found that participants who slept after learning showed 20% better retention than those who remained awake. During sleep, the hippocampus replays newly acquired information, transferring it to long-term storage in the neocortex.

Another crucial factor is the concept of 'desirable difficulties' proposed by Robert Bjork. Counterintuitively, making learning slightly challenging – through testing effects, interleaving practice, and varying conditions – actually enhances long-term retention. Students who struggle productively outperform those given easy, fluent learning experiences.

The implications extend to educational policy. Traditional cramming before exams produces short-term gains but poor retention. Instead, distributed practice over time, combined with retrieval practice through self-testing, creates durable learning that transfers to new situations."""
    },
    {
        "module": 4,
        "title": "Globalization and Cultural Identity",
        "transcript": """Good morning. Today we explore one of the most debated topics in contemporary sociology: the relationship between globalization and cultural identity. As our world becomes increasingly interconnected, fundamental questions arise about cultural preservation and transformation.

Globalization has accelerated dramatically since the 1990s. The World Bank reports that international trade has grown from $4 trillion in 1990 to over $25 trillion today. This economic integration has facilitated unprecedented cultural exchange – or, critics argue, cultural homogenization dominated by Western influences.

The sociologist George Ritzer coined the term 'McDonaldization' to describe the spread of standardized, efficiency-driven practices across societies. His thesis suggests that local traditions and customs are being replaced by uniform global patterns. Evidence supporting this includes the dominance of English as a global language, with UNESCO estimating that a language dies approximately every two weeks.

However, scholars like Arjun Appadurai challenge this homogenization thesis. His concept of 'glocalization' recognizes that global influences are always filtered through local contexts. Japanese anime, Korean pop music, and Nigerian cinema demonstrate how non-Western cultural products now command global audiences. The flow of culture, Appadurai argues, is multidirectional rather than simply West-to-rest.

Furthermore, globalization can paradoxically strengthen local identities. The threat of cultural erosion has sparked revival movements worldwide, from indigenous language preservation in New Zealand to traditional craft renaissance in rural Japan. Identity becomes more consciously articulated when perceived as under threat."""
    },
    {
        "module": 5,
        "title": "The Future of Work and Automation",
        "transcript": """Good afternoon everyone. Today's lecture addresses one of the most pressing questions of our time: how will automation reshape the future of work? This topic sits at the intersection of economics, technology, and social policy.

Historical perspective is instructive here. The First Industrial Revolution displaced agricultural workers but created new manufacturing jobs. Similarly, computerization in the late 20th century eliminated clerical positions while generating roles in the knowledge economy. The question is whether artificial intelligence and robotics will follow this pattern or represent something fundamentally different.

Research from MIT economists Daron Acemoglu and Pascual Restrepo suggests we're entering uncharted territory. Their analysis indicates that while previous technologies augmented human capabilities, current AI systems increasingly substitute for human labor across cognitive tasks. McKinsey Global Institute estimates that by 2030, automation could displace up to 375 million workers globally – roughly 14% of the workforce.

However, this displacement won't be evenly distributed. Jobs requiring routine cognitive or manual tasks face the highest automation risk. Occupations combining creativity, emotional intelligence, and complex problem-solving appear more resilient. Healthcare, education, and creative industries may actually see job growth as automation increases productivity elsewhere.

The policy implications are significant. Many economists advocate for expanded education and retraining programs. Others propose more radical interventions like universal basic income, arguing that traditional employment may no longer provide sufficient income distribution. Finland's recent UBI experiment, though limited, showed participants reported improved wellbeing and were more likely to find employment than control groups.

What seems clear is that navigating this transition successfully requires proactive policy-making rather than reactive crisis management."""
    }
]

def generate_audio(client: ElevenLabs, text: str, voice_id: str) -> bytes:
    """Generate audio from text using ElevenLabs API"""
    audio = client.text_to_speech.convert(
        voice_id=voice_id,
        output_format="mp3_44100_128",
        text=text,
        model_id="eleven_multilingual_v2",
        voice_settings=VoiceSettings(
            stability=0.5,
            similarity_boost=0.75,
            style=0.3,  # Professional lecture style
            use_speaker_boost=True
        )
    )
    
    # Collect audio bytes
    audio_bytes = b""
    for chunk in audio:
        audio_bytes += chunk
    
    return audio_bytes

def main():
    print("🎧 Generating Advanced Mastery listening audio files...")
    print(f"Output directory: {OUTPUT_DIR}")
    
    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Initialize ElevenLabs client
    client = ElevenLabs(api_key=ELEVENLABS_API_KEY)
    
    for item in ADVANCED_LISTENING_DATA:
        module_num = item["module"]
        title = item["title"]
        transcript = item["transcript"]
        
        output_file = f"{OUTPUT_DIR}/module_{module_num}_listening.mp3"
        
        print(f"\n📝 Module {module_num}: {title}")
        print(f"   Transcript length: {len(transcript)} characters")
        
        try:
            # Generate audio
            audio_bytes = generate_audio(client, transcript, VOICE_ID)
            
            # Save to file
            with open(output_file, "wb") as f:
                f.write(audio_bytes)
            
            file_size = os.path.getsize(output_file) / 1024  # KB
            print(f"   ✅ Saved: {output_file} ({file_size:.1f} KB)")
            
        except Exception as e:
            print(f"   ❌ Error: {e}")
    
    print("\n🎉 Audio generation complete!")
    print(f"Files saved to: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
