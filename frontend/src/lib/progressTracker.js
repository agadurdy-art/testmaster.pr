/**
 * Course Progress Tracking Utility
 * Stores and retrieves lesson/course completion status from localStorage
 */

const PROGRESS_KEY = 'ielts_course_progress';

/**
 * Get all progress data
 */
export const getProgressData = () => {
  try {
    const data = localStorage.getItem(PROGRESS_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Error reading progress data:', e);
    return {};
  }
};

/**
 * Save progress data
 */
export const saveProgressData = (data) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving progress data:', e);
  }
};

/**
 * Mark a lesson section as completed
 * @param {string} courseType - 'beginner', 'mastery', 'advanced'
 * @param {string|number} lessonId - Lesson identifier
 * @param {string} section - Section name (e.g., 'vocabulary', 'reading', 'quiz')
 */
export const markSectionComplete = (courseType, lessonId, section) => {
  const data = getProgressData();
  
  if (!data[courseType]) {
    data[courseType] = { lessons: {}, completedLessons: [] };
  }
  
  const lessonKey = String(lessonId);
  if (!data[courseType].lessons[lessonKey]) {
    data[courseType].lessons[lessonKey] = {
      completedSections: [],
      startedAt: new Date().toISOString(),
      progress: 0
    };
  }
  
  const lesson = data[courseType].lessons[lessonKey];
  if (!lesson.completedSections.includes(section)) {
    lesson.completedSections.push(section);
  }
  
  // Calculate progress based on typical sections
  const allSections = ['vocabulary', 'grammar', 'reading', 'speaking', 'quiz'];
  const completedCount = lesson.completedSections.filter(s => allSections.includes(s)).length;
  lesson.progress = Math.round((completedCount / allSections.length) * 100);
  
  // Mark lesson as fully completed if all sections done
  if (lesson.progress >= 100) {
    lesson.completedAt = new Date().toISOString();
    if (!data[courseType].completedLessons.includes(lessonKey)) {
      data[courseType].completedLessons.push(lessonKey);
    }
  }
  
  saveProgressData(data);
  return lesson;
};

/**
 * Mark entire lesson as completed
 */
export const markLessonComplete = (courseType, lessonId) => {
  const data = getProgressData();
  
  if (!data[courseType]) {
    data[courseType] = { lessons: {}, completedLessons: [] };
  }
  
  const lessonKey = String(lessonId);
  if (!data[courseType].lessons[lessonKey]) {
    data[courseType].lessons[lessonKey] = {
      completedSections: [],
      startedAt: new Date().toISOString()
    };
  }
  
  data[courseType].lessons[lessonKey].progress = 100;
  data[courseType].lessons[lessonKey].completedAt = new Date().toISOString();
  
  if (!data[courseType].completedLessons.includes(lessonKey)) {
    data[courseType].completedLessons.push(lessonKey);
  }
  
  saveProgressData(data);
};

/**
 * Get lesson progress
 * @returns {number} Progress percentage (0-100)
 */
export const getLessonProgress = (courseType, lessonId) => {
  const data = getProgressData();
  const lessonKey = String(lessonId);
  return data[courseType]?.lessons?.[lessonKey]?.progress || 0;
};

/**
 * Check if lesson is completed
 */
export const isLessonCompleted = (courseType, lessonId) => {
  const data = getProgressData();
  const lessonKey = String(lessonId);
  return data[courseType]?.completedLessons?.includes(lessonKey) || false;
};

/**
 * Check if section is completed
 */
export const isSectionCompleted = (courseType, lessonId, section) => {
  const data = getProgressData();
  const lessonKey = String(lessonId);
  return data[courseType]?.lessons?.[lessonKey]?.completedSections?.includes(section) || false;
};

/**
 * Get course overall progress
 * @param {string} courseType
 * @param {number} totalLessons - Total number of lessons in the course
 * @returns {object} { completed, total, percentage }
 */
export const getCourseProgress = (courseType, totalLessons) => {
  const data = getProgressData();
  const completedCount = data[courseType]?.completedLessons?.length || 0;
  
  return {
    completed: completedCount,
    total: totalLessons,
    percentage: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0
  };
};

/**
 * Get all in-progress lessons for a course
 */
export const getInProgressLessons = (courseType) => {
  const data = getProgressData();
  if (!data[courseType]?.lessons) return [];
  
  return Object.entries(data[courseType].lessons)
    .filter(([_, lesson]) => lesson.progress > 0 && lesson.progress < 100)
    .map(([id, lesson]) => ({ id, ...lesson }));
};

/**
 * Reset course progress
 */
export const resetCourseProgress = (courseType) => {
  const data = getProgressData();
  if (data[courseType]) {
    delete data[courseType];
    saveProgressData(data);
  }
};

export default {
  getProgressData,
  markSectionComplete,
  markLessonComplete,
  getLessonProgress,
  isLessonCompleted,
  isSectionCompleted,
  getCourseProgress,
  getInProgressLessons,
  resetCourseProgress
};
