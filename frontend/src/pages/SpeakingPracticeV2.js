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
 * Scoped under .speaking-scope. Mounted at /speaking/v2.
 */
export default function SpeakingPracticeV2() {
  const navigate = useNavigate();
  return (
    <div className="speaking-scope">
      <SpeakingPractice onExit={() => navigate('/dashboard/v2')} />
    </div>
  );
}
