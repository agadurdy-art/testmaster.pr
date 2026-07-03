// Module-level constants + helpers extracted verbatim from pages/Dashboard.js (Faz1 refactor).
// API_URL was already unused in the original page — kept intentionally.

const API_URL = process.env.REACT_APP_BACKEND_URL;
const SUPPORT_EMAIL = 'support@testmaster.pro';

// Days between today (UTC) and an ISO YYYY-MM-DD exam date. Returns null when
// the date is missing / unparseable; negative numbers mean the exam has passed.
function daysUntilExam(isoDate) {
  if (!isoDate) return null;
  const exam = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(exam.getTime())) return null;
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return Math.round((exam.getTime() - todayUtc) / 86400000);
}

// Personalized welcome subtitle. Uses onboarding fields (target_band,
// exam_date, learning_mode) when available and falls back to the generic
// IELTS copy otherwise, so users who signed up before onboarding launched
// still see something sensible.
function buildWelcomeSubtitle(profile, getText) {
  const mode = profile?.learning_mode;
  const targetBand = profile?.target_band;
  const days = daysUntilExam(profile?.exam_date);

  // Mode-aware base line
  const baseIelts = getText(
    'Continue your IELTS preparation journey',
    'Tiếp tục hành trình IELTS của bạn',
    'IELTS hazırlık yolculuğunuza devam edin'
  );
  const baseGeneral = getText(
    'Continue building your English, one session at a time',
    'Tiếp tục cải thiện tiếng Anh của bạn',
    'İngilizcenizi adım adım geliştirmeye devam edin'
  );
  const parts = [];

  if (mode === 'general_english') {
    parts.push(baseGeneral);
  } else if (targetBand) {
    parts.push(
      getText(
        `Targeting Band ${targetBand}`,
        `Mục tiêu Band ${targetBand}`,
        `Hedef Band ${targetBand}`
      )
    );
  } else {
    parts.push(baseIelts);
  }

  if (typeof days === 'number') {
    if (days > 0) {
      parts.push(
        getText(
          `${days} day${days === 1 ? '' : 's'} until your exam`,
          `Còn ${days} ngày đến kỳ thi`,
          `Sınavına ${days} gün kaldı`
        )
      );
    } else if (days === 0) {
      parts.push(
        getText('Exam day — you\'ve got this.', 'Ngày thi — bạn làm được!', 'Sınav günü — başaracaksın!')
      );
    }
  }

  return parts.join(' · ');
}

export { API_URL, SUPPORT_EMAIL, daysUntilExam, buildWelcomeSubtitle };
