export function getRecommendedLessonPath(lesson) {
  if (!lesson) return '/dashboard';

  if (lesson.lesson_path) return lesson.lesson_path;
  if (lesson.route) return lesson.route;
  if (lesson.url) return lesson.url;

  const stage = lesson.stage || lesson.course_stage;
  if (stage === 'beginner') {
    return `/beginner-course?lesson=${lesson.lesson_id || lesson.lesson_number || 1}`;
  }
  if (stage === 'mastery') {
    return `/mastery-course?lesson=${lesson.module_number || lesson.lesson_id || 1}`;
  }
  if (stage === 'advanced') {
    return `/advanced-mastery?lesson=${lesson.module_number || lesson.lesson_id || 1}`;
  }

  return '/dashboard';
}
