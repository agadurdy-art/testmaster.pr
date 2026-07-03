import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Volume2, ArrowLeft } from 'lucide-react';
import { SECTION_CONFIG } from '../constants';

// ============ IELTS-STYLE INSTRUCTIONS PAGE ============
export default function InstructionsPage({ currentSection, onStart }) {
  const navigate = useNavigate();
  const config = SECTION_CONFIG[currentSection];
  const sectionTitle = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);

  return (
    <div className="flex-1 bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header bar with battery/volume indicators */}
      <div className="bg-slate-800 text-white px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back to Question Bank button */}
          <button
            onClick={() => navigate('/question-bank')}
            className="flex items-center gap-1 text-sm text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Question Bank
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs">ID</span>
            </div>
            <span className="text-sm text-slate-300">XXXX.XXXXXXX - 123456</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-slate-400" />
          <div className="w-8 h-3 bg-green-500 rounded-sm"></div>
        </div>
      </div>

      {/* Main Instructions Content */}
      <div className="max-w-3xl mx-auto py-12 px-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">IELTS {sectionTitle}</h1>
        <p className="text-slate-600 text-lg mb-8">Time: Approximately {config.totalTime / 60} minutes</p>

        {/* Instructions to Candidates */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide">
            Instructions to Candidates
          </h2>
          <ul className="text-slate-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>Answer <strong className="underline">all</strong> the questions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400">•</span>
              <span>You can change your answers at any time during the test.</span>
            </li>
          </ul>
        </div>

        {/* Information for Candidates */}
        <div className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4 uppercase tracking-wide">
            Information for Candidates
          </h2>
          <ul className="text-slate-700 space-y-2">
            {currentSection === 'listening' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>There are 40 questions in this test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Each question carries one mark.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>There are four parts to the test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>You will hear each part once.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>For each part of the test there will be time for you to look through the questions and time for you to check your answers.</span>
                </li>
              </>
            )}
            {currentSection === 'reading' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>There are 40 questions in this test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Each question carries one mark.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>There are three passages in this test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Passages are of increasing difficulty.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>You should spend approximately 20 minutes on each passage.</span>
                </li>
              </>
            )}
            {currentSection === 'writing' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>There are two tasks in this test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Task 1 requires a minimum of 150 words.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Task 2 requires a minimum of 250 words.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Task 2 contributes twice as much to your Writing score as Task 1.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>You should spend approximately 20 minutes on Task 1 and 40 minutes on Task 2.</span>
                </li>
              </>
            )}
            {currentSection === 'speaking' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>There are three parts to this test.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Part 1: Introduction and general questions (4-5 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Part 2: Individual long turn with cue card (3-4 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Part 3: Two-way discussion on abstract topics (4-5 minutes)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>Speak clearly and naturally. Your responses will be recorded.</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Warning Message */}
        <div className="flex items-center justify-center gap-2 text-blue-600 mb-6">
          <AlertCircle className="w-5 h-5" />
          <span>Do not click &apos;Start test&apos; until you are told to do so.</span>
        </div>

        {/* Start Button */}
        <div className="flex justify-center">
          <button
            onClick={onStart}
            className="px-8 py-3 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors shadow-sm"
          >
            Start test
          </button>
        </div>
      </div>
    </div>
  );
}
