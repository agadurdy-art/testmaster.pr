import React from 'react';
import { HelpCircle } from 'lucide-react';

// Help Modal - IELTS Style with Tabs
export default function HelpModal({ helpTab, setHelpTab, currentSection, setShowHelp }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg">Help</span>
          <button
            onClick={() => setShowHelp(false)}
            className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-slate-100 border-b border-slate-300">
          <div className="flex">
            <button
              onClick={() => setHelpTab('information')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${helpTab === 'information'
                  ? 'bg-white border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'}`}
            >
              Information
            </button>
            <button
              onClick={() => setHelpTab('test-help')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${helpTab === 'test-help'
                  ? 'bg-white border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'}`}
            >
              Test help
            </button>
            <button
              onClick={() => setHelpTab('task-help')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors
                ${helpTab === 'task-help'
                  ? 'bg-white border-blue-500 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-800'}`}
            >
              Task help
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 bg-white max-h-96 overflow-auto">
          {helpTab === 'information' && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Multiple choice questions</h4>
              <p className="text-slate-600 mb-4">Choose your question by clicking on it.</p>

              {/* Example Question Display */}
              <div className="border border-slate-300 rounded-lg overflow-hidden mb-4">
                <div className="bg-blue-500 text-white px-4 py-2 font-medium">
                  1 &nbsp; Marie Curie&apos;s husband was a joint winner of both Marie&apos;s Nobel Prizes.
                </div>
                <div className="p-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="example" className="w-4 h-4" />
                    <span className="text-slate-700">TRUE</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="example" className="w-4 h-4" />
                    <span className="text-slate-700">FALSE</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="example" className="w-4 h-4" />
                    <span className="text-slate-700">NOT GIVEN</span>
                  </label>
                </div>
                <div className="px-4 py-2 bg-slate-50 border-t text-slate-600">
                  2 &nbsp; Marie became interested in science when she was a child.
                </div>
                <div className="px-4 py-2 bg-slate-50 border-t text-slate-600">
                  3 &nbsp; Marie&apos;s family in Poland had financial problems.
                </div>
              </div>

              <p className="text-slate-600 text-sm">Click on the answer you think is right.</p>
            </div>
          )}

          {helpTab === 'test-help' && (
            <div>
              <div className="flex items-center gap-3 mb-6 p-3 bg-slate-100 rounded-lg">
                <div className="w-8 h-8 bg-slate-800 text-white flex items-center justify-center rounded font-bold">
                  1
                </div>
                <p className="text-slate-700">The black highlighting shows that you have not answered the question</p>
              </div>

              <h4 className="font-semibold text-slate-900 mb-3">Highlighting</h4>
              <p className="text-slate-600 mb-3">To highlight something in the test:</p>

              <div className="bg-slate-50 p-4 rounded-lg mb-4">
                <p className="text-slate-700 mb-2"><strong>Select the text you want to highlight using the mouse.</strong></p>
                <p className="text-slate-700 mb-4">Right click over the text.</p>

                {/* Example Text Block */}
                <div className="bg-white p-3 border rounded text-slate-700 mb-4">
                  <p>book we travel back in time and across the</p>
                  <p>
                    and been{' '}
                    <span className="bg-yellow-200 px-1">in our the</span>
                    <span className="text-slate-400">last two m</span>
                  </p>
                  <p>word in a w<span className="inline-flex gap-2 mx-1">
                    <button className="text-xs bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded">✏️ Highlight</button>
                    <button className="text-xs bg-blue-100 border border-blue-300 px-2 py-0.5 rounded">📝 Notes</button>
                  </span>attempte</p>
                  <p>objects com<span className="text-slate-400">e – messa</span></p>
                  <p>rnments and interactions, about different m</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <button className="text-sm bg-yellow-100 border border-yellow-300 px-3 py-1 rounded">✏️ Highlight</button>
                  <span className="text-slate-600">Click to highlight the text you have selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <button className="text-sm bg-blue-100 border border-blue-300 px-3 py-1 rounded">📝 Notes</button>
                  <span className="text-slate-600">Click to highlight the text you have selected and to add notes about what you have highlighted.</span>
                </div>
              </div>
            </div>
          )}

          {helpTab === 'task-help' && (
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Task-specific Help</h4>

              {currentSection === 'listening' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h5 className="font-medium text-blue-900 mb-2">Listening Section</h5>
                    <ul className="text-blue-800 text-sm space-y-1">
                      <li>• The audio will play automatically for each part</li>
                      <li>• You can only hear each recording once</li>
                      <li>• Write your answers while you listen</li>
                      <li>• Use the volume slider to adjust the audio level</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentSection === 'reading' && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-900 mb-2">Reading Section</h5>
                    <ul className="text-green-800 text-sm space-y-1">
                      <li>• Read each passage carefully before answering</li>
                      <li>• You can scroll through the passage on the left</li>
                      <li>• Questions appear on the right side</li>
                      <li>• Use the navigation bar to jump between questions</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentSection === 'writing' && (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <h5 className="font-medium text-amber-900 mb-2">Writing Section</h5>
                    <ul className="text-amber-800 text-sm space-y-1">
                      <li>• Read the task carefully before you start writing</li>
                      <li>• Plan your answer before writing</li>
                      <li>• The word count is shown at the top of your answer</li>
                      <li>• You can copy, cut and paste text within your answer</li>
                    </ul>
                  </div>
                </div>
              )}

              {currentSection === 'speaking' && (
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h5 className="font-medium text-purple-900 mb-2">Speaking Section</h5>
                    <ul className="text-purple-800 text-sm space-y-1">
                      <li>• Listen to each question carefully</li>
                      <li>• Click the microphone button to start recording</li>
                      <li>• Speak clearly into your microphone</li>
                      <li>• Your response will be automatically saved</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* OK Button */}
        <div className="p-4 bg-slate-50 border-t flex justify-center">
          <button
            onClick={() => setShowHelp(false)}
            className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
