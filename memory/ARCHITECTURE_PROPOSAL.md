# Unified Learning Path - Architecture Proposal
## Hybrid Learning Platform v2.0

---

## Executive Summary

This document proposes a complete architectural transformation from the current fragmented course structure (Beginner → Advanced → Mastery) to a **single, unified, step-by-step learning pathway** inspired by the iSmart education platform.

### Core Vision
A cohesive learning journey from **absolute beginner (Pre-A1/Kindergarten)** to **IELTS mastery (C2)** with:
- Linear, sequential lesson progression
- Teacher-friendly smart board UI
- Gamification (points, rankings, achievements)
- Reusable activity modules

---

## 1. CEFR-Based Stage Structure

### Stage Overview

| Stage | CEFR Level | Target Audience | Duration |
|-------|------------|-----------------|----------|
| **Foundation** | Pre-A1 | Kindergarten/Starters | 3 months |
| **Elementary** | A1-A2 | Primary school (ages 7-10) | 6 months |
| **Pre-Intermediate** | A2-B1 | Middle school (ages 11-13) | 6 months |
| **Intermediate** | B1-B2 | High school (ages 14-16) | 6 months |
| **Upper-Intermediate** | B2-C1 | IELTS Foundation | 4 months |
| **Advanced** | C1-C2 | IELTS Academic/General | 4 months |

### Stage Details

#### Stage 1: Foundation (Pre-A1)
- **Units**: 12
- **Lessons per Unit**: 5
- **Focus**: Basic vocabulary, colors, numbers, family, animals
- **Activities**: Picture-word matching, audio repetition, simple games

#### Stage 2: Elementary (A1-A2)
- **Units**: 20
- **Lessons per Unit**: 6
- **Focus**: Simple sentences, present tense, daily routines
- **Activities**: Vocabulary + Grammar + Listening + Speaking basics

#### Stage 3: Pre-Intermediate (A2-B1)
- **Units**: 24
- **Lessons per Unit**: 6
- **Focus**: Past/future tenses, descriptions, opinions
- **Activities**: Reading comprehension, conversation practice

#### Stage 4: Intermediate (B1-B2)
- **Units**: 24
- **Lessons per Unit**: 8
- **Focus**: Complex grammar, academic vocabulary, formal writing
- **Activities**: Essay structure, listening for details

#### Stage 5: Upper-Intermediate (B2-C1) - IELTS Foundation
- **Units**: 16
- **Lessons per Unit**: 8
- **Focus**: IELTS task types introduction, band score criteria
- **Activities**: Timed practice, strategy lessons

#### Stage 6: Advanced (C1-C2) - IELTS Mastery
- **Units**: 20
- **Lessons per Unit**: 10
- **Focus**: Band 7+ strategies, full mock tests
- **Activities**: Full tests, feedback analysis, production mode

---

## 2. Lesson Flow Structure (iSmart-Inspired)

### Standard Lesson Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    LESSON: Unit X - Lesson Y                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [1. Vocabulary]  →  [2. Lecture]  →  [3. Practice 1]         │
│        📖              💻              🎮                       │
│                                                                 │
│              →  [4. Practice 2]  →  [5. Materials]             │
│                      🎮                  📄                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Activity Types by Stage

| Activity | Foundation | Elementary | Intermediate | IELTS |
|----------|------------|------------|--------------|-------|
| Vocabulary (Visual) | ✅ | ✅ | ✅ | ✅ |
| Vocabulary (Audio) | ✅ | ✅ | ✅ | ✅ |
| Grammar Lecture | ❌ | ✅ | ✅ | ✅ |
| Matching Games | ✅ | ✅ | ✅ | ❌ |
| Fill-in-Blank | ❌ | ✅ | ✅ | ✅ |
| Reading Practice | ❌ | ✅ | ✅ | ✅ |
| Listening Practice | ✅ | ✅ | ✅ | ✅ |
| Speaking Record | ❌ | ✅ | ✅ | ✅ |
| Writing Essay | ❌ | ❌ | ✅ | ✅ |
| Quiz/Test | ✅ | ✅ | ✅ | ✅ |
| Production Mode (AI) | ❌ | ❌ | ❌ | ✅ |

---

## 3. Activity Module Specifications

### 3.1 Vocabulary Module (Existing - Adapt)

**iSmart-Style Vocabulary Interface:**

```
┌────────────────────────────────────────────────────────────────┐
│  Vocabulary                                              [X]  │
├──────────────┬─────────────────────────────────────────────────┤
│              │                                                 │
│ ☑ cube       │            [CUBE IMAGE]                        │
│              │                                                 │
│ ○ net of cube│       ╔═══════════════════════╗                │
│              │       ║  cube                 ║                │
│ ○ cuboid     │       ║  /kjuːb/        🔊   ║                │
│              │       ╚═══════════════════════╝                │
│ ○ face       │                                                 │
│              │       ╔═══════════════════════╗                │
│ ○ vertex     │       ║  This is a cube.  🔊 ║                │
│              │       ╚═══════════════════════╝                │
│ ○ edge       │                                                 │
│              │       [Re-enter the vocabulary: _________ ]    │
│              │                                                 │
│              │       [ 🎤 Record ]  Attempts: 1/1             │
│              │                                                 │
└──────────────┴─────────────────────────────────────────────────┘
```

**Components:**
1. Word list sidebar (checkmarks for completion)
2. Visual image display
3. Word + IPA pronunciation + TTS
4. Example sentence + TTS
5. Input field for word recall
6. Record button for pronunciation practice
7. Attempts counter

### 3.2 Lecture Module (New)

**Purpose:** Present grammar rules, concepts, or strategies

**Components:**
- Video player (optional)
- Slide-based presentation
- Interactive examples
- Quick comprehension checks

### 3.3 Practice Module (Existing - Enhance)

**Types:**
1. **Matching** - Drag-drop word-definition pairs
2. **Fill-in-Blank** - Complete sentences
3. **Multiple Choice** - Select correct answer
4. **True/False/Not Given** - Reading-style questions
5. **Ordering** - Arrange words/sentences

**Gamification:**
- 3 crowns system (★★★)
- Point rewards
- Time bonuses

### 3.4 Materials Module (New)

**Purpose:** Downloadable resources

**Components:**
- PDF worksheets
- Audio files
- Additional reading
- Homework assignments

---

## 4. Data Models

### Stage Model
```javascript
{
  _id: ObjectId,
  stage_id: "foundation",
  name: "Foundation",
  cefr_level: "Pre-A1",
  order: 1,
  total_units: 12,
  description: "Basic English for beginners",
  icon: "rocket",
  color: "#FF6B6B",
  unlock_requirements: null,
  created_at: ISODate
}
```

### Unit Model
```javascript
{
  _id: ObjectId,
  unit_id: "foundation_unit_01",
  stage_id: "foundation",
  number: 1,
  title: "Hello! Nice to meet you",
  description: "Greetings and introductions",
  total_lessons: 5,
  order: 1,
  unlock_requirements: {
    previous_unit_completion: true,
    min_score: 70
  },
  created_at: ISODate
}
```

### Lesson Model
```javascript
{
  _id: ObjectId,
  lesson_id: "foundation_unit_01_lesson_01",
  unit_id: "foundation_unit_01",
  stage_id: "foundation",
  number: 1,
  title: "Greetings",
  description: "Learn basic greetings",
  activity_flow: [
    {
      order: 1,
      type: "vocabulary",
      activity_id: "vocab_greetings_01",
      icon: "book",
      label: "Vocabulary"
    },
    {
      order: 2,
      type: "lecture",
      activity_id: "lecture_greetings_01",
      icon: "laptop",
      label: "Lecture"
    },
    {
      order: 3,
      type: "practice",
      activity_id: "practice_greetings_01",
      icon: "gamepad",
      label: "Practice 1"
    },
    {
      order: 4,
      type: "practice",
      activity_id: "practice_greetings_02",
      icon: "gamepad",
      label: "Practice 2"
    },
    {
      order: 5,
      type: "materials",
      activity_id: "materials_greetings_01",
      icon: "file",
      label: "Materials"
    }
  ],
  estimated_duration_minutes: 20,
  points_reward: 50,
  created_at: ISODate
}
```

### Vocabulary Activity Model
```javascript
{
  _id: ObjectId,
  activity_id: "vocab_greetings_01",
  lesson_id: "foundation_unit_01_lesson_01",
  type: "vocabulary",
  words: [
    {
      word_id: "word_hello",
      word: "hello",
      ipa: "/həˈloʊ/",
      definition: "A greeting",
      example_sentence: "Hello! How are you?",
      image_url: "/static/images/vocab/hello.png",
      audio_url: "/static/audio/vocab/hello.mp3",
      sentence_audio_url: "/static/audio/vocab/hello_sentence.mp3"
    },
    // ... more words
  ],
  requires_typing: true,
  requires_pronunciation: true,
  pass_threshold: 80,
  created_at: ISODate
}
```

### User Progress Model
```javascript
{
  _id: ObjectId,
  user_id: ObjectId,
  current_stage: "foundation",
  current_unit: 1,
  current_lesson: 3,
  total_points: 4575,
  rank: 42,
  stage_progress: {
    foundation: {
      started_at: ISODate,
      completed_at: null,
      units_completed: 0,
      lessons_completed: 12,
      total_lessons: 60
    }
  },
  lesson_progress: {
    "foundation_unit_01_lesson_01": {
      completed: true,
      activities_completed: ["vocabulary", "lecture", "practice", "practice", "materials"],
      score: 95,
      points_earned: 50,
      crowns: 3,
      completed_at: ISODate
    }
  },
  achievements: [
    { type: "first_lesson", earned_at: ISODate },
    { type: "perfect_score", earned_at: ISODate }
  ]
}
```

---

## 5. UI/UX Design Specifications

### 5.1 Color Palette

```css
:root {
  /* Stage Colors */
  --stage-foundation: #FF6B6B;
  --stage-elementary: #4ECDC4;
  --stage-preint: #45B7D1;
  --stage-intermediate: #96CEB4;
  --stage-upperint: #FFEAA7;
  --stage-advanced: #DDA0DD;
  
  /* UI Colors */
  --primary: #FF9800;
  --secondary: #2196F3;
  --success: #4CAF50;
  --warning: #FFC107;
  --background: #FFF8E1;
  --card: #FFFFFF;
  --text-primary: #333333;
  --text-secondary: #757575;
}
```

### 5.2 Lesson Path Component

```
Visual Design:
- Winding path connecting activities
- Checkmarks for completed items
- Crown system for practice scores
- Current activity highlighted
- Locked activities grayed out
```

### 5.3 Navigation Structure

```
┌──────────────────────────────────────────────────────────────┐
│  [Logo]  [User Avatar]    🏆 5  📊 Ranking  💎 4,575 +     │
├──────────┬───────────────────────────────────────────────────┤
│          │                                                   │
│ 🏠 Home  │          < Unit 7 - Lesson 1: Greetings          │
│          │                                                   │
│ 📋 Tasks │              [LESSON PATH VIEW]                   │
│          │                                                   │
│ 🔔 Notif │                                                   │
│          │                                                   │
│ 👨‍👩‍👧 Parent│                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

### 5.4 Teacher Control Panel (Future)

- Class management
- Student progress tracking
- Content assignment
- Real-time monitoring
- Smart board presentation mode

---

## 6. Migration Strategy

### Phase 1: Foundation (Weeks 1-2)
1. Create new data models
2. Build Stage/Unit/Lesson navigation UI
3. Build Lesson Path component (iSmart-style)
4. Migrate existing Vocabulary Engine to new structure

### Phase 2: Activity Modules (Weeks 3-4)
1. Refactor Vocabulary module for new data model
2. Build Lecture module
3. Enhance Practice module with crowns/gamification
4. Build Materials/Download module

### Phase 3: Content Population (Weeks 5-8)
1. Create Foundation stage content (12 units)
2. Migrate existing Advanced content to new structure
3. Build content creation tools for teachers

### Phase 4: Gamification & Polish (Weeks 9-10)
1. Implement points system
2. Build leaderboard
3. Add achievements
4. Create progress visualizations

### Phase 5: Teacher Layer (Weeks 11-12)
1. Teacher dashboard
2. Class management
3. Content assignment
4. Analytics

---

## 7. Existing Asset Reuse

### Can Reuse Directly
- VocabularyLearnMode.js (adapt for new data model)
- VocabularyPracticeMode.js (add crowns)
- VocabularyQuizMode.js → Quiz component
- VocabularyProductionMode.js → IELTS stages only
- ReviewBank.js → Cross-stage review system

### Need Modification
- AdvancedMasteryCourse.js → Break into smaller components
- Listening components → Integrate into lesson flow
- Reading components → Integrate into lesson flow

### New Components Required
- LessonPathView.js (iSmart-style winding path)
- StageSelector.js (stage overview)
- UnitGrid.js (units within a stage)
- LecturePlayer.js (video/slide presentation)
- MaterialsDownload.js (PDF/resource downloads)
- PointsDisplay.js (gamification header)
- Leaderboard.js
- AchievementBadges.js

---

## 8. API Endpoints (New)

### Stages
- `GET /api/learning/stages` - List all stages
- `GET /api/learning/stages/{stage_id}` - Get stage details

### Units
- `GET /api/learning/stages/{stage_id}/units` - List units in stage
- `GET /api/learning/units/{unit_id}` - Get unit details

### Lessons
- `GET /api/learning/units/{unit_id}/lessons` - List lessons in unit
- `GET /api/learning/lessons/{lesson_id}` - Get lesson with activity flow
- `GET /api/learning/lessons/{lesson_id}/activities/{activity_id}` - Get activity content

### Progress
- `GET /api/learning/progress` - Get user's overall progress
- `POST /api/learning/progress/activity` - Mark activity complete
- `POST /api/learning/progress/lesson` - Mark lesson complete

### Gamification
- `GET /api/learning/leaderboard` - Get rankings
- `GET /api/learning/achievements` - Get user achievements
- `POST /api/learning/points` - Award points

---

## 9. Questions for User Approval

1. **Stage Names**: Are the proposed stage names appropriate for Turkish students?
2. **Activity Flow**: Should every lesson follow the same 5-step flow, or allow customization?
3. **Content Priority**: Which stage should we populate with content first?
4. **Existing Content**: Should we migrate existing Advanced course content, or start fresh?
5. **Teacher Features**: When should we start building teacher features?
6. **Gamification Level**: How important is the points/ranking system?

---

## 10. Next Steps

Upon approval:
1. Create new database collections
2. Build core navigation components
3. Create first sample unit with full lesson flow
4. Test with iSmart-style UI
5. Iterate based on feedback

---

*Document Version: 1.0*
*Created: February 2026*
*Status: PENDING APPROVAL*
