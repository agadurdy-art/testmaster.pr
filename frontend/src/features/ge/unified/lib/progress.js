// ═══════ FETCH WITH RETRY ═══════
async function fetchRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
}

// ═══════ LESSON PROGRESS PERSISTENCE ═══════
const PROGRESS_KEY = 'lesson_progress_';
function saveLessonProgress(lessonId, data) {
  try { localStorage.setItem(PROGRESS_KEY + lessonId, JSON.stringify({ ...data, ts: Date.now() })); } catch {}
}
function loadLessonProgress(lessonId) {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY + lessonId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Expire after 24 hours
    if (Date.now() - data.ts > 86400000) { localStorage.removeItem(PROGRESS_KEY + lessonId); return null; }
    return data;
  } catch { return null; }
}
function clearLessonProgress(lessonId) {
  try { localStorage.removeItem(PROGRESS_KEY + lessonId); } catch {}
}

export { fetchRetry, saveLessonProgress, loadLessonProgress, clearLessonProgress };
