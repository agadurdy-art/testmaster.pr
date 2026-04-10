# Liz Bilingual Lesson Teacher — Mimari Dokümanı

## 1. Genel Bakış

Liz, her dersin başında 2-3 dakikalık **iki dilli** (İngilizce + kullanıcının ana dili) bir açıklama yapan AI öğretmen. Kullanıcı bir derse girdiğinde Liz otomatik olarak:

1. Dersin konusunu ana dilde özetler
2. Önemli kelime/gramer yapılarını önceden tanıtır
3. Dersi nasıl çalışması gerektiğine dair ipuçları verir
4. İsteğe bağlı TTS ile sesli anlatım yapar

---

## 2. Mevcut Durum

### Mevcut Liz Endpoint'leri (`/api/liz/`)
| Endpoint | Açıklama |
|----------|----------|
| `POST /chat` | Serbest sohbet (plan gated: learner+) |
| `POST /greet` | Kişiselleştirilmiş karşılama |
| `POST /new-session` | Yeni session |
| `GET /status/{user_id}` | Plan durumu, kullanım istatistikleri |
| `GET /history/{session_id}` | Chat geçmişi |
| `GET /sessions/{user_id}` | Tüm session'lar |
| `POST /tts` | Text-to-Speech |
| `POST /stt` | Speech-to-Text |
| `GET /homework/{user_id}` | Ödev listesi |
| `POST /homework/assign` | Ödev ata |
| `POST /homework/{id}/submit` | Ödev teslim et |

### Mevcut Ders Yapıları

**Beginner Lesson:**
```json
{
  "id": "beginner-lesson-1",
  "title": "Lesson 1: Family",
  "lesson_number": 1,
  "level": "A1",
  "vocabulary": ["Parents", "Siblings", ...],
  "grammar": {"title": "Present Simple (To Be)", "explanation": "...", "examples": [...]},
  "reading": {...},
  "speaking": {...},
  "listening": {...},
  "learning_goals": ["Learn family vocabulary", "Use present simple"]
}
```

**Mastery Module:**
```json
{
  "id": "mastery-module-1",
  "title": "Education",
  "module_number": 1,
  "level": "B2",
  "vocabulary": {"nouns": [...], "verbs": [...], "adjectives": [...], "adverbs": [...]},
  "grammar": {"title": "Complex Sentences", "explanation": "...", "examples": [...]},
  "writing": {"question": "...", "model_essay": "...", "notes": "..."},
  "speaking": {"part1": [...], "part2": [...]},
  "reading": {...},
  "listening": {...},
  "collocations": [...],
  "idiom": {...},
  "common_mistake": {...},
  "learning_goals": [...]
}
```

**Advanced Module:** Mastery ile aynı yapı, daha ileri seviye içerik.

---

## 3. Yeni Feature: Bilingual Lesson Introduction

### 3.1 Akış

```
Kullanıcı dersi açar
    ↓
Frontend: GET /api/liz/lesson-intro/{course_type}/{module_id}?lang=tr
    ↓
Backend:
  1. Ders verisini DB'den çek (vocabulary, grammar, learning_goals, vb.)
  2. Kullanıcının geçmiş performansını çek (varsa)
  3. AI'a ders + kullanıcı bağlamı gönder
  4. AI iki dilli açıklama üretir
  5. Cache'e kaydet (aynı ders+dil için tekrar üretme)
    ↓
Frontend: Açıklamayı modal/card olarak göster
    ↓
(Opsiyonel) Kullanıcı "Sesli Dinle" butonuna basarsa → POST /api/liz/tts
```

### 3.2 Yeni Backend Endpoint

**`GET /api/liz/lesson-intro/{course_type}/{module_id}`**

**Path params:**
- `course_type`: `beginner` | `mastery` | `advanced`
- `module_id`: Dersin ID'si (ör: `beginner-lesson-1`, `mastery-module-5`)

**Query params:**
- `user_id` (required): Kullanıcı ID
- `lang` (optional, default: `tr`): Hedef dil kodu

**Response:**
```json
{
  "success": true,
  "course_type": "mastery",
  "module_id": "mastery-module-1",
  "module_title": "Education",
  "intro": {
    "native_summary": "Bu derste 'Education' (Eğitim) konusunu çalışacağız. Üniversite, öğretim ve okul sistemi ile ilgili temel akademik kelimeleri öğreneceksin. Gramer olarak karmaşık cümle yapılarına (Complex Sentences) odaklanacağız...",
    "key_vocabulary_preview": [
      {"word": "tuition", "translation": "öğretim ücreti", "example": "University tuition has increased."},
      {"word": "curriculum", "translation": "müfredat", "example": "The national curriculum was revised."},
      {"word": "scholarship", "translation": "burs", "example": "She won a full scholarship."}
    ],
    "grammar_preview": {
      "title": "Complex Sentences",
      "native_explanation": "Bu yapılar 'although', 'because', 'while' gibi bağlaçlarla iki fikri birleştirmenizi sağlar.",
      "quick_example": "Although tuition is expensive, many students apply."
    },
    "study_tips": [
      "Önce kelimelerin Türkçe anlamlarını oku, sonra İngilizce örnekleri çalış",
      "Grammar kısmında kendi cümlelerini yazmayı dene",
      "Speaking part'ta sesli pratik yap"
    ],
    "estimated_time_minutes": 25,
    "difficulty_note": "Band 5.0-6.5 seviyesi. Temel kelime bilgisi yeterli."
  },
  "cached": false
}
```

### 3.3 Backend Implementasyon Detayı

**Dosya:** `/app/backend/routes/liz_teacher.py` içine eklenir veya ayrı bir helper.

**Fonksiyonlar:**

```python
# 1. Ders verisini çekmek
async def _fetch_lesson_data(course_type: str, module_id: str) -> dict:
    """
    course_type'a göre doğru collection'dan dersi çeker.
    - beginner → db.beginner_english_lessons.find_one({"id": module_id})
    - mastery  → db.mastery_course_modules.find_one({"id": module_id})
    - advanced → db.advanced_mastery_modules.find_one({"id": module_id})
    """

# 2. AI prompt builder
def _build_lesson_intro_prompt(lesson_data: dict, course_type: str, user_context: str, target_lang: str) -> str:
    """
    Ders verisinden (vocabulary, grammar, learning_goals, writing topic, speaking topics)
    bir prompt oluşturur.

    Prompt şablonu:
    ---
    You are Liz, an IELTS teacher. A student is about to start a lesson.
    Your task: Write a 2-3 paragraph BILINGUAL introduction in {target_lang} and English.

    Lesson: {lesson_title}
    Course: {course_type} (Band {level})
    Key Vocabulary: {top 5-8 words from lesson}
    Grammar Focus: {grammar title + short explanation}
    Learning Goals: {learning_goals}
    Writing Topic: {writing question if exists}
    Speaking Topics: {speaking part1/part2 if exists}

    Student Context: {user_context}

    Rules:
    1. Write the summary in {target_lang} (native language)
    2. Keep English terms in English with native translation in parentheses
    3. Preview 3-5 key vocabulary items with translations
    4. Briefly explain the grammar point in native language
    5. Give 2-3 actionable study tips in native language
    6. Estimate study time for this lesson
    7. If student has weak areas matching this lesson, mention them
    8. Keep total response under 400 words
    9. Be warm but professional - this is a lesson intro, not a full lesson

    Respond ONLY with valid JSON:
    {
      "native_summary": "...",
      "key_vocabulary_preview": [{"word": "...", "translation": "...", "example": "..."}],
      "grammar_preview": {"title": "...", "native_explanation": "...", "quick_example": "..."},
      "study_tips": ["...", "..."],
      "estimated_time_minutes": 25,
      "difficulty_note": "..."
    }
    ---
    """

# 3. Cache mekanizması
COLLECTION = "liz_lesson_intros"

async def _get_cached_intro(course_type: str, module_id: str, lang: str) -> dict | None:
    """
    DB'den cache'lenmiş intro'yu çeker.
    Cache key: {course_type}_{module_id}_{lang}
    TTL: 7 gün (ders içeriği değişmedikçe aynı intro kullanılabilir)
    """

async def _set_cached_intro(course_type: str, module_id: str, lang: str, data: dict):
    """
    Üretilen intro'yu DB'ye kaydeder.
    """

# 4. Ana endpoint
@router.get("/lesson-intro/{course_type}/{module_id}")
async def get_lesson_intro(course_type: str, module_id: str, user_id: str, lang: str = "tr"):
    # 1. Cache kontrol
    cached = await _get_cached_intro(course_type, module_id, lang)
    if cached:
        return {"success": True, ..., "cached": True}

    # 2. Ders verisini çek
    lesson = await _fetch_lesson_data(course_type, module_id)
    if not lesson:
        raise HTTPException(404, "Lesson not found")

    # 3. Kullanıcı bağlamını çek (mevcut get_user_context fonksiyonu)
    user_context = await get_user_context(user_id)

    # 4. Prompt oluştur ve AI'a gönder
    prompt = _build_lesson_intro_prompt(lesson, course_type, user_context, lang)
    chat = LlmChat(api_key=api_key, ...).with_model("openai", LIZ_DEFAULT_MODEL)
    response = await chat.send_message(UserMessage(text=prompt))

    # 5. JSON parse et
    data = json.loads(response)

    # 6. Cache'e kaydet
    await _set_cached_intro(course_type, module_id, lang, data)

    # 7. Döndür
    return {"success": True, "course_type": course_type, "module_id": module_id,
            "module_title": lesson.get("title"), "intro": data, "cached": False}
```

### 3.4 Frontend Entegrasyonu

**Nerede gösterilecek:**
- `MasteryCourse.js` — Kullanıcı modüle tıkladığında, modül açılmadan önce
- `AdvancedMasteryCourse.js` — Aynı mantık
- `BeginnerCourse.js` — Aynı mantık

**Component:** `LizLessonIntro` (yeni component)

```
Dosya: /app/frontend/src/components/LizLessonIntro.jsx
```

**Props:**
```javascript
{
  courseType: "mastery" | "beginner" | "advanced",
  moduleId: "mastery-module-1",
  userId: "xxx",
  onClose: () => void,     // Kapatma
  onStart: () => void,     // "Derse Başla" butonu
}
```

**UI Yapısı:**
```
┌──────────────────────────────────────┐
│  👩‍🏫 Liz — Ders Tanıtımı            │
│                                      │
│  "Bu derste Education konusunu..."   │
│                                      │
│  📝 Önemli Kelimeler                 │
│  • tuition (öğretim ücreti)          │
│  • curriculum (müfredat)             │
│  • scholarship (burs)                │
│                                      │
│  📐 Gramer: Complex Sentences        │
│  "Bu yapılar although, because..."   │
│                                      │
│  💡 Çalışma İpuçları                 │
│  1. Önce kelimelerin anlamlarını...  │
│  2. Grammar kısmında kendi...        │
│                                      │
│  ⏱ Tahmini süre: 25 dk              │
│                                      │
│  [🔊 Sesli Dinle]  [▶ Derse Başla]  │
└──────────────────────────────────────┘
```

**Akış:**
```javascript
// MasteryCourse.js, AdvancedMasteryCourse.js, BeginnerCourse.js içinde:

const [showLizIntro, setShowLizIntro] = useState(false);
const [selectedModule, setSelectedModule] = useState(null);

const handleModuleClick = (module) => {
  setSelectedModule(module);
  setShowLizIntro(true);  // Liz intro göster
};

// JSX:
{showLizIntro && selectedModule && (
  <LizLessonIntro
    courseType="mastery"
    moduleId={selectedModule.id}
    userId={user.id}
    onClose={() => setShowLizIntro(false)}
    onStart={() => {
      setShowLizIntro(false);
      navigate(`/vocabulary/learn/${selectedModule.id}`);
    }}
  />
)}
```

---

## 4. Plan Erişimi

| Plan | Ders Intro |
|------|-----------|
| free | İlk ders için intro göster (free preview) |
| explorer | Tüm açık dersler |
| learner+ | Tüm dersler |

**Not:** Intro üretimi `LIZ_DEFAULT_MODEL` (gpt-4o-mini) ile yapılır → düşük maliyet. Cache sayesinde her ders için sadece 1 kez üretilir.

---

## 5. DB Collections

### `liz_lesson_intros` (Cache)
```json
{
  "cache_key": "mastery_mastery-module-1_tr",
  "course_type": "mastery",
  "module_id": "mastery-module-1",
  "lang": "tr",
  "module_title": "Education",
  "intro": { ... },
  "created_at": "2026-04-10T...",
  "expires_at": "2026-04-17T..."
}
```

---

## 6. Mevcut Dosyalarda Değişiklik Gereksinimi

| Dosya | Değişiklik |
|-------|-----------|
| `backend/routes/liz_teacher.py` | Yeni endpoint + helper fonksiyonlar ekle |
| `frontend/src/components/LizLessonIntro.jsx` | Yeni component oluştur |
| `frontend/src/pages/MasteryCourse.js` | Modül tıklamasına intro entegre et |
| `frontend/src/pages/AdvancedMasteryCourse.js` | Aynı entegrasyon |
| `frontend/src/pages/BeginnerCourse.js` | Aynı entegrasyon |

---

## 7. Test Senaryoları

1. `GET /api/liz/lesson-intro/mastery/mastery-module-1?user_id=xxx&lang=tr` → 200 + JSON
2. Aynı istek tekrar → `cached: true`
3. `GET /api/liz/lesson-intro/beginner/beginner-lesson-1?user_id=xxx&lang=tr` → 200
4. Geçersiz module_id → 404
5. Frontend: Modüle tıkla → Liz intro modal açılır → "Derse Başla" → Lesson sayfasına yönlendir
6. "Sesli Dinle" → mevcut `/api/liz/tts` endpoint'i ile ses üretir
