import React from 'react';

/**
 * IELTS Opinion Matching Component
 * 
 * Displays a box with opinions/options labeled A-H
 * Questions ask user to match items to the correct opinion letter
 */

export default function OpinionMatching({ 
  title = "Opinions",
  options = [],
  questions = [],
  answers = {},
  onAnswerChange,
  questionStartNum = 1
}) {
  if (!options || options.length === 0) return null;
  
  // Get the letter range
  const startLetter = 'A';
  const endLetter = String.fromCharCode(64 + options.length);
  
  return (
    <div className="space-y-6">
      {/* Options Box */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
        {/* Header */}
        <div className="mb-4 pb-2 border-b border-amber-200">
          <h3 className="font-bold text-lg text-amber-900 text-center">{title}</h3>
        </div>
        
        {/* Instructions */}
        <p className="text-sm text-amber-800 mb-4">
          Choose <strong>{questions.length > 1 ? questions.length : 'SIX'}</strong> answers from the box and write the correct letter, <strong>{startLetter}-{endLetter}</strong>, next to Questions {questionStartNum}-{questionStartNum + questions.length - 1}.
        </p>
        
        {/* Options List */}
        <div className="space-y-2">
          {options.map((option, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D...
            return (
              <div key={idx} className="flex items-start gap-3 py-1">
                <span className="font-bold text-amber-800 w-6">{letter}</span>
                <span className="text-slate-800">{option}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Questions Section */}
      {questions.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm">
          <div className="p-4 bg-slate-50 border-b">
            <h4 className="font-bold text-slate-900">Questions {questionStartNum}-{questionStartNum + questions.length - 1}</h4>
          </div>
          
          {/* Quick letter buttons */}
          <div className="p-4 border-b bg-slate-50 flex flex-wrap gap-2 justify-center">
            {options.map((_, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return (
                <span
                  key={letter}
                  className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-300 rounded font-bold text-slate-700"
                >
                  {letter}
                </span>
              );
            })}
          </div>
          
          <div className="p-4 space-y-3">
            {questions.map((q, idx) => {
              const qNum = questionStartNum + idx;
              // Clean up question text
              let questionText = q.question || q.text || '';
              
              return (
                <div key={q.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="font-bold text-slate-700 w-8">{qNum}</span>
                  <span className="flex-1 text-slate-800">{questionText}</span>
                  <input
                    type="text"
                    value={answers?.[q.id] || ''}
                    onChange={(e) => onAnswerChange?.(q.id, e.target.value.toUpperCase())}
                    maxLength={1}
                    className="w-12 h-10 text-center text-lg font-bold border-2 border-blue-400 rounded uppercase focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    placeholder=""
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Matching Features Component
 * Similar to Opinion Matching but for matching features to categories/people
 */
export function MatchingFeatures({
  title = "Features",
  categories = [],
  questions = [],
  answers = {},
  onAnswerChange,
  questionStartNum = 1
}) {
  if (!categories || categories.length === 0) return null;
  
  const startLetter = 'A';
  const endLetter = String.fromCharCode(64 + categories.length);
  
  return (
    <div className="space-y-6">
      {/* Categories Box */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
        <div className="mb-4 pb-2 border-b border-blue-200">
          <h3 className="font-bold text-lg text-blue-900 text-center">{title}</h3>
        </div>
        
        <p className="text-sm text-blue-800 mb-4">
          Match each statement with the correct category, <strong>{startLetter}-{endLetter}</strong>.
        </p>
        
        <div className="space-y-2">
          {categories.map((category, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return (
              <div key={idx} className="flex items-start gap-3 py-1">
                <span className="font-bold text-blue-800 w-6">{letter}</span>
                <span className="text-slate-800">{category}</span>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Questions */}
      {questions.length > 0 && (
        <div className="bg-white rounded-lg border-2 border-slate-200 shadow-sm">
          <div className="p-4 bg-slate-50 border-b">
            <h4 className="font-bold text-slate-900">Questions {questionStartNum}-{questionStartNum + questions.length - 1}</h4>
          </div>
          
          <div className="p-4 flex flex-wrap gap-2 justify-center border-b bg-slate-50">
            {categories.map((_, idx) => {
              const letter = String.fromCharCode(65 + idx);
              return (
                <span
                  key={letter}
                  className="w-8 h-8 flex items-center justify-center bg-white border-2 border-slate-300 rounded font-bold text-slate-700"
                >
                  {letter}
                </span>
              );
            })}
          </div>
          
          <div className="p-4 space-y-3">
            {questions.map((q, idx) => {
              const qNum = questionStartNum + idx;
              return (
                <div key={q.id} className="flex items-center gap-4 py-2 border-b last:border-0">
                  <span className="font-bold text-slate-700 w-8">{qNum}</span>
                  <span className="flex-1 text-slate-800">{q.question || q.text}</span>
                  <input
                    type="text"
                    value={answers?.[q.id] || ''}
                    onChange={(e) => onAnswerChange?.(q.id, e.target.value.toUpperCase())}
                    maxLength={1}
                    className="w-12 h-10 text-center text-lg font-bold border-2 border-blue-400 rounded uppercase focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    placeholder=""
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
