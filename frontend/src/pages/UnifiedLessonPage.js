// Thin re-export shim: the GE unified lesson player now lives under
// features/ge/unified/ (split into single-responsibility files).
// App.js keeps importing this path, so routing is untouched.
export { default } from '../features/ge/unified/UnifiedLessonPage';
