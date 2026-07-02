import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SpeakingPractice } from '../features/speaking';
import '../features/speaking/speaking.css';

/**
 * D7 Speaking Practice — implemented from Claude Design handoff bundle
 * Uf8SWiooEr4N-Mti1X95Iw (Speaking Practice.html).
 *
 * Four-state interactive flow: Part selector → 1-minute prep → 2-minute recording →
 * Processing → Two-panel results with pronunciation underlines + radar + Liz coach.
 *
 * Scoped under .speaking-scope. Mounted at /speaking/v2 and /speaking-practice.
 *
 * NOTE: `user` MUST be forwarded to SpeakingPractice. Dropping it (Faz 0 bug,
 * fixed 2026-07-02) made every caller look logged-out: part locks treated
 * everyone as free tier, Part 2 eval failed with "must be logged in", and
 * Liz Live failed with no_user_id — the "/speaking-practice flow stuck" report.
 */
export default function SpeakingPracticeV2({ user }) {
  const navigate = useNavigate();
  return (
    <div className="speaking-scope">
      <SpeakingPractice user={user} onExit={() => navigate('/dashboard/v2')} />
    </div>
  );
}
