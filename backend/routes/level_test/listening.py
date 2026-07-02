"""
Level test — listening module
=============================
Single job: serve level-test listening sections/questions and score answers
server-side (official raw→band table), with localized skill guidance,
course recommendations and overall feedback (en/vi/tr). Stateless.

Extracted verbatim from server.py (Faz 1 refactor, 2026-07-02).
"""

import logging
from typing import Dict, List, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

logger = logging.getLogger(__name__)

from listening_data import get_listening_sections

@router.get("/level-test/listening-sections")
async def get_listening_sections_endpoint():
    """Get all listening sections with metadata for the level test."""
    sections = get_listening_sections()
    return {
        "sections": [
            {
                "id": s["id"],
                "level": s["level"],
                "band_range": s["band_range"],
                "title": s["title"],
                "audio_url": f"/audio/listening/{s['id']}.mp3",
                "question_count": len(s["questions"])
            }
            for s in sections
        ],
        "total_questions": sum(len(s["questions"]) for s in sections)
    }

@router.get("/level-test/listening-questions")
async def get_listening_questions():
    """Get all listening questions for the level test."""
    sections = get_listening_sections()
    all_questions = []
    
    for section in sections:
        for q in section["questions"]:
            all_questions.append({
                "section_id": section["id"],
                "section_title": section["title"],
                "audio_url": f"/audio/listening/{section['id']}.mp3",
                "level": section["level"],
                "band_range": section["band_range"],
                **q
            })
    
    return {"questions": all_questions, "total": len(all_questions)}


class ListeningEvaluationRequest(BaseModel):
    answers: Dict[str, str]  # {question_id: answer}
    language: Optional[str] = "en"


@router.post("/level-test/evaluate-listening")
async def evaluate_listening(request: ListeningEvaluationRequest):
    """Evaluate listening section answers with detailed explanations, course recommendations, and skill guidance."""
    try:
        sections = get_listening_sections()
        language = request.language or "en"
        
        correct_count = 0
        total_count = 0
        total_band_points = 0
        question_results = []
        skill_breakdown = {}
        weak_skills = []
        
        for section in sections:
            for q in section["questions"]:
                total_count += 1
                user_answer = request.answers.get(q["id"], "").strip().upper()
                correct_answer = q["correct"].strip().upper()
                is_correct = user_answer == correct_answer
                
                # Get band value from section
                band_range = section["band_range"]
                avg_band = (float(band_range.split("-")[0]) + float(band_range.split("-")[1])) / 2
                
                if is_correct:
                    correct_count += 1
                    total_band_points += avg_band
                
                # Track skill breakdown
                skill = q.get("skill", "general")
                if skill not in skill_breakdown:
                    skill_breakdown[skill] = {"correct": 0, "total": 0, "label": skill.replace("_", " ").title()}
                skill_breakdown[skill]["total"] += 1
                if is_correct:
                    skill_breakdown[skill]["correct"] += 1
                
                # Get explanation based on language
                explanation_key = f"explanation_{language}" if language != "en" else "explanation"
                explanation = q.get(explanation_key, q.get("explanation", ""))
                
                # Find correct option text
                correct_option_text = ""
                for opt in q.get("options", []):
                    if opt.startswith(correct_answer + ")"):
                        correct_option_text = opt
                        break
                
                question_results.append({
                    "question_id": q["id"],
                    "section_title": section["title"],
                    "section_level": section["level"],
                    "question_text": q["question"],
                    "user_answer": user_answer or "No answer",
                    "correct_answer": correct_answer,
                    "correct_option_text": correct_option_text,
                    "is_correct": is_correct,
                    "skill": skill,
                    "skill_label": skill.replace("_", " ").title(),
                    "explanation": explanation
                })
        
        # Calculate listening band score.
        # Audit BE-2: the old math summed each correct question's *difficulty
        # band* and divided by the TOTAL question count, then nudged by
        # percentage — not a band score (it systematically understated). Use the
        # official Cambridge Listening raw→band table, projecting the N-question
        # score onto the standard 40-question scale — same fix as comprehensive
        # reading and Quick Assessment. (`total_band_points` kept above for any
        # caller that still reads it, but the band now comes from the table.)
        if total_count > 0:
            percentage = (correct_count / total_count) * 100
            from services.ielts_band_tables import band_for_listening
            listening_band = band_for_listening(correct_count, total=total_count)
        else:
            percentage = 0
            listening_band = 0.0

        # Round to nearest 0.5
        listening_band = round(listening_band * 2) / 2
        
        # Identify weak skills (less than 50% correct)
        for skill, data in skill_breakdown.items():
            if data["total"] > 0 and (data["correct"] / data["total"]) < 0.5:
                weak_skills.append(data["label"])
        
        # Generate skill improvement guidance based on language
        skill_guidance = generate_skill_guidance(listening_band, weak_skills, language)
        
        # Generate course recommendations
        course_recommendations = generate_listening_course_recommendations(listening_band, weak_skills, language)
        
        return {
            "band_score": listening_band,
            "correct": correct_count,
            "total": total_count,
            "percentage": percentage,
            "question_results": question_results,
            "skill_breakdown": list(skill_breakdown.values()),
            "weak_skills": weak_skills,
            "skill_guidance": skill_guidance,
            "course_recommendations": course_recommendations,
            "overall_feedback": generate_overall_listening_feedback(listening_band, percentage, language)
        }
        
    except Exception as e:
        logger.error(f"Listening evaluation error: {e}")
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")


def generate_skill_guidance(band: float, weak_skills: List[str], language: str) -> List[Dict]:
    """Generate skill improvement tips based on band and weak areas."""
    guidance = []
    
    # Base guidance by band level
    if language == "vi":
        if band < 4.0:
            guidance = [
                {"skill": "Nghe Cơ Bản", "tip": "Bắt đầu với các podcast và video tiếng Anh đơn giản với phụ đề. Lắng nghe 15-30 phút mỗi ngày.", "priority": "high"},
                {"skill": "Từ Vựng", "tip": "Học 10 từ vựng mới mỗi ngày từ các chủ đề hàng ngày như gia đình, công việc, thời tiết.", "priority": "high"},
                {"skill": "Số Liệu", "tip": "Luyện nghe số, ngày tháng và giờ giấc từ các đoạn hội thoại ngắn.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Nghe Chi Tiết", "tip": "Luyện nghe để tìm thông tin cụ thể như tên, địa điểm và số liệu trong các cuộc hội thoại dài hơn.", "priority": "high"},
                {"skill": "Suy Luận", "tip": "Học cách suy luận thông tin không được nói trực tiếp từ ngữ cảnh.", "priority": "medium"},
                {"skill": "Ghi Chú", "tip": "Phát triển kỹ năng ghi chú nhanh trong khi nghe để ghi nhớ chi tiết.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Nghe Học Thuật", "tip": "Luyện nghe các bài giảng và thảo luận học thuật để chuẩn bị cho IELTS.", "priority": "high"},
                {"skill": "Phân Tích Quan Điểm", "tip": "Học cách nhận biết quan điểm khác nhau và ý chính trong các cuộc thảo luận phức tạp.", "priority": "medium"},
                {"skill": "Thuật Ngữ Chuyên Môn", "tip": "Mở rộng từ vựng học thuật và thuật ngữ chuyên ngành.", "priority": "medium"}
            ]
    elif language == "tr":
        if band < 4.0:
            guidance = [
                {"skill": "Temel Dinleme", "tip": "Altyazılı basit İngilizce podcast ve videolarla başlayın. Günde 15-30 dakika dinleyin.", "priority": "high"},
                {"skill": "Kelime Dağarcığı", "tip": "Aile, iş, hava durumu gibi günlük konulardan her gün 10 yeni kelime öğrenin.", "priority": "high"},
                {"skill": "Sayısal Veriler", "tip": "Kısa diyaloglardan sayıları, tarihleri ve saatleri dinleme pratiği yapın.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Detaylı Dinleme", "tip": "Uzun konuşmalarda isimler, yerler ve sayılar gibi belirli bilgileri bulmak için dinleme pratiği yapın.", "priority": "high"},
                {"skill": "Çıkarım", "tip": "Bağlamdan doğrudan söylenmemiş bilgileri çıkarmayı öğrenin.", "priority": "medium"},
                {"skill": "Not Alma", "tip": "Dinlerken hızlı not alma becerileri geliştirin.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Akademik Dinleme", "tip": "IELTS'e hazırlanmak için akademik dersler ve tartışmaları dinleme pratiği yapın.", "priority": "high"},
                {"skill": "Görüş Analizi", "tip": "Karmaşık tartışmalarda farklı görüşleri ve ana fikirleri tanımlamayı öğrenin.", "priority": "medium"},
                {"skill": "Teknik Terminoloji", "tip": "Akademik kelime dağarcığı ve özel terminolojiyi genişletin.", "priority": "medium"}
            ]
    else:
        if band < 4.0:
            guidance = [
                {"skill": "Basic Listening", "tip": "Start with simple English podcasts and videos with subtitles. Listen for 15-30 minutes daily.", "priority": "high"},
                {"skill": "Vocabulary", "tip": "Learn 10 new vocabulary words daily from everyday topics like family, work, weather.", "priority": "high"},
                {"skill": "Numbers", "tip": "Practice listening for numbers, dates, and times from short dialogues.", "priority": "medium"}
            ]
        elif band < 6.0:
            guidance = [
                {"skill": "Detail Comprehension", "tip": "Practice listening for specific information like names, places, and numbers in longer conversations.", "priority": "high"},
                {"skill": "Inference", "tip": "Learn to infer information that isn't directly stated from context.", "priority": "medium"},
                {"skill": "Note-Taking", "tip": "Develop quick note-taking skills while listening to remember details.", "priority": "medium"}
            ]
        else:
            guidance = [
                {"skill": "Academic Listening", "tip": "Practice listening to academic lectures and discussions to prepare for IELTS.", "priority": "high"},
                {"skill": "Opinion Analysis", "tip": "Learn to identify different viewpoints and main ideas in complex discussions.", "priority": "medium"},
                {"skill": "Technical Terminology", "tip": "Expand academic vocabulary and specialized terminology.", "priority": "medium"}
            ]
    
    return guidance


def generate_listening_course_recommendations(band: float, weak_skills: List[str], language: str) -> List[Dict]:
    """Generate course recommendations based on listening performance."""
    recommendations = []
    
    if language == "vi":
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "Nền Tảng Nghe Tiếng Anh",
                    "description": "Khóa học cơ bản giúp bạn phát triển kỹ năng nghe từ đầu với các chủ đề hàng ngày.",
                    "duration": "4-6 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "vocabulary-builder",
                    "name": "Xây Dựng Từ Vựng Qua Nghe",
                    "description": "Học từ vựng mới thông qua các bài nghe thú vị và dễ hiểu.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "Nghe IELTS Trung Cấp",
                    "description": "Phát triển kỹ năng nghe chi tiết và ghi chú cho bài thi IELTS.",
                    "duration": "6-8 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "listening-strategies",
                    "name": "Chiến Thuật Nghe IELTS",
                    "description": "Học các chiến thuật làm bài nghe hiệu quả để đạt điểm cao hơn.",
                    "duration": "4 tuần",
                    "priority": "supplementary"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "Nghe Nâng Cao IELTS 7+",
                    "description": "Kỹ năng nghe nâng cao cho điểm Band 7-9 với các bài giảng học thuật.",
                    "duration": "8-10 tuần",
                    "priority": "recommended"
                },
                {
                    "course_id": "academic-lectures",
                    "name": "Nghe Bài Giảng Học Thuật",
                    "description": "Luyện nghe các bài giảng đại học và thảo luận chuyên sâu.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
    elif language == "tr":
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "İngilizce Dinleme Temelleri",
                    "description": "Günlük konularla sıfırdan dinleme becerileri geliştirmenize yardımcı olan temel kurs.",
                    "duration": "4-6 hafta",
                    "priority": "recommended"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "IELTS Orta Düzey Dinleme",
                    "description": "IELTS sınavı için detaylı dinleme ve not alma becerileri geliştirin.",
                    "duration": "6-8 hafta",
                    "priority": "recommended"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "IELTS 7+ İleri Dinleme",
                    "description": "Akademik derslerle Band 7-9 için ileri dinleme becerileri.",
                    "duration": "8-10 hafta",
                    "priority": "recommended"
                }
            ]
    else:
        if band < 4.0:
            recommendations = [
                {
                    "course_id": "beginner-listening",
                    "name": "English Listening Foundations",
                    "description": "Basic course helping you develop listening skills from scratch with everyday topics.",
                    "duration": "4-6 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "vocabulary-builder",
                    "name": "Vocabulary Through Listening",
                    "description": "Learn new vocabulary through engaging and easy-to-understand listening exercises.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
        elif band < 6.0:
            recommendations = [
                {
                    "course_id": "intermediate-listening",
                    "name": "IELTS Intermediate Listening",
                    "description": "Develop detailed listening and note-taking skills for the IELTS exam.",
                    "duration": "6-8 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "listening-strategies",
                    "name": "IELTS Listening Strategies",
                    "description": "Learn effective listening strategies to achieve higher scores.",
                    "duration": "4 weeks",
                    "priority": "supplementary"
                }
            ]
        else:
            recommendations = [
                {
                    "course_id": "advanced-listening",
                    "name": "IELTS 7+ Advanced Listening",
                    "description": "Advanced listening skills for Band 7-9 with academic lectures.",
                    "duration": "8-10 weeks",
                    "priority": "recommended"
                },
                {
                    "course_id": "academic-lectures",
                    "name": "Academic Lecture Listening",
                    "description": "Practice listening to university lectures and in-depth discussions.",
                    "duration": "ongoing",
                    "priority": "supplementary"
                }
            ]
    
    return recommendations


def generate_overall_listening_feedback(band: float, percentage: float, language: str) -> str:
    """Generate overall feedback message based on performance."""
    if language == "vi":
        if band < 4.0:
            return f"Bạn đạt {percentage:.0f}% chính xác. Đây là điểm khởi đầu tốt! Hãy tập trung vào việc nghe tiếng Anh hàng ngày và xây dựng từ vựng cơ bản."
        elif band < 6.0:
            return f"Bạn đạt {percentage:.0f}% chính xác (Band {band}). Bạn đang tiến bộ! Hãy luyện nghe các cuộc hội thoại dài hơn và phát triển kỹ năng ghi chú."
        else:
            return f"Xuất sắc! Bạn đạt {percentage:.0f}% chính xác (Band {band}). Hãy tiếp tục thử thách bản thân với các bài nghe học thuật phức tạp hơn."
    elif language == "tr":
        if band < 4.0:
            return f"%{percentage:.0f} doğruluk oranına ulaştınız. Bu iyi bir başlangıç! Günlük İngilizce dinlemeye ve temel kelime dağarcığı oluşturmaya odaklanın."
        elif band < 6.0:
            return f"%{percentage:.0f} doğruluk oranına ulaştınız (Band {band}). İlerleme kaydediyorsunuz! Daha uzun konuşmaları dinleme ve not alma becerileri geliştirme pratiği yapın."
        else:
            return f"Mükemmel! %{percentage:.0f} doğruluk oranına ulaştınız (Band {band}). Daha karmaşık akademik dinleme içerikleriyle kendinize meydan okumaya devam edin."
    else:
        if band < 4.0:
            return f"You achieved {percentage:.0f}% accuracy. This is a good starting point! Focus on daily English listening and building basic vocabulary."
        elif band < 6.0:
            return f"You achieved {percentage:.0f}% accuracy (Band {band}). You're making progress! Practice listening to longer conversations and develop note-taking skills."
        else:
            return f"Excellent! You achieved {percentage:.0f}% accuracy (Band {band}). Keep challenging yourself with more complex academic listening content."


