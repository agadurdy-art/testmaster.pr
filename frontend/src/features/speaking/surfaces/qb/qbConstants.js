// Top-level state machine for the QB Speaking question loop. Shared between
// the page (owns transitions) and the presentational flows (render per state).
export const STATES = {
  IDLE: 'IDLE',
  PROMPT_PLAYING: 'PROMPT_PLAYING',
  RECORDING: 'RECORDING',
  PROCESSING: 'PROCESSING',
  READY_NEXT: 'READY_NEXT',
  COMPLETED: 'COMPLETED'
};
