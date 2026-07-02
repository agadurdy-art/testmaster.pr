// Thin re-export shim: the QB Speaking page now lives under
// features/speaking/surfaces/qb/ (split into single-responsibility files).
// App.js keeps importing this path, so routing is untouched.
export { default } from '../features/speaking/surfaces/qb/SpeakingQBPage';
