export const API_URL = process.env.REACT_APP_BACKEND_URL;

// ============ REAL IELTS-STYLE TEST CONFIGURATION ============
export const SECTION_CONFIG = {
  listening: { totalTime: 40 * 60, questions: 40, parts: 4 },
  reading: { totalTime: 60 * 60, questions: 40, parts: 3 },
  writing: { totalTime: 60 * 60, tasks: 2 },
  speaking: { totalTime: 14 * 60, parts: 3 }
};
