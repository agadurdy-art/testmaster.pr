import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { AlertTriangle, Loader2, StickyNote, X, Settings, HelpCircle, EyeOff } from 'lucide-react';

// Submit / Note / Settings / Help / Screen-hidden overlays for the Cambridge
// test interface. JSX extracted verbatim from pages/CambridgeTestInterface.js;
// the old inline `{flag && (...)}` guards became `show` props (each
// component returns null unless shown - identical mount behavior).

export function SubmitModal({ show, isEvaluating, currentSection, setShowSubmitModal, handleSubmitSection }) {
  if (!show) return null;
  return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <div className="text-center">
              {isEvaluating ? (
                <>
                  <Loader2 className="w-16 h-16 mx-auto text-orange-500 mb-4 animate-spin" />
                  <h3 className="text-xl font-bold mb-2">Evaluating your speaking…</h3>
                  <p className="text-gray-500 mb-6">
                    We're scoring each answer per question. This can take up to a minute — please don't close the page.
                  </p>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-16 h-16 mx-auto text-amber-500 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Submit {currentSection}?</h3>
                  <p className="text-gray-500 mb-6">
                    You cannot return to this section after submitting. Make sure you have answered all questions.
                  </p>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowSubmitModal(false)}
                      data-testid="cancel-submit"
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      onClick={handleSubmitSection}
                      data-testid="confirm-submit"
                    >
                      Submit
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
  );
}

export function NoteModal({ show, currentNote, setCurrentNote, setShowNoteModal, saveNote }) {
  if (!show) return null;
  return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <StickyNote className="w-5 h-5 text-blue-600" />
                Add Note
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setShowNoteModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Highlighted text:</p>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-sm">
                &ldquo;{currentNote.text}&rdquo;
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Your note:</label>
              <textarea
                value={currentNote.note}
                onChange={(e) => setCurrentNote(prev => ({ ...prev, note: e.target.value }))}
                placeholder="Write your note here..."
                className="w-full p-3 border rounded-lg text-sm resize-none h-24 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowNoteModal(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={saveNote}
              >
                Save Note
              </Button>
            </div>
          </Card>
        </div>
  );
}

export function SettingsModal({ show, setShowSettingsModal, textSize, setTextSize, colorTheme, setColorTheme }) {
  if (!show) return null;
  return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Settings</span>
              <button 
                onClick={() => setShowSettingsModal(false)} 
                className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 bg-slate-50">
              <p className="text-slate-600 mb-6">
                If you wish, you can change these settings to make the test easier to read.
              </p>
              
              <div className="grid grid-cols-3 gap-8">
                {/* Text Size */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Text size</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="textSize" 
                        checked={textSize === 'standard'}
                        onChange={() => setTextSize('standard')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Standard</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="textSize" 
                        checked={textSize === 'large'}
                        onChange={() => setTextSize('large')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Large</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="textSize" 
                        checked={textSize === 'extra-large'}
                        onChange={() => setTextSize('extra-large')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Extra large</span>
                    </label>
                  </div>
                </div>
                
                {/* Colours */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Colours</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'standard'}
                        onChange={() => setColorTheme('standard')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Standard</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'yellow-on-black'}
                        onChange={() => setColorTheme('yellow-on-black')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Yellow on black</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'blue-on-white'}
                        onChange={() => setColorTheme('blue-on-white')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Blue on white</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="colorTheme" 
                        checked={colorTheme === 'blue-on-cream'}
                        onChange={() => setColorTheme('blue-on-cream')}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">Blue on cream</span>
                    </label>
                  </div>
                </div>
                
                {/* Screen Resolution */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">Screen Resolution</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={false}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">800 x 600</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={false}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">1024 x 768</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="screenRes" 
                        checked={true}
                        readOnly
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-slate-700">1280 x 1024</span>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* OK Button */}
              <div className="flex justify-center mt-8">
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}

export function HelpModal({ show, setShowHelpModal, helpTab, setHelpTab, currentSection }) {
  if (!show) return null;
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
                onClick={() => setShowHelpModal(false)} 
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
                          <li>• Read the passage carefully before answering</li>
                          <li>• Use highlighting to mark key information</li>
                          <li>• Pay attention to word limits for gap-fill questions</li>
                          <li>• Use the navigation bar to jump between questions</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'writing' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <h5 className="font-medium text-purple-900 mb-2">Writing Section</h5>
                        <ul className="text-purple-800 text-sm space-y-1">
                          <li>• Task 1: Write at least 150 words in 20 minutes</li>
                          <li>• Task 2: Write at least 250 words in 40 minutes</li>
                          <li>• Task 2 counts double in your final score</li>
                          <li>• Use the word counter at the bottom of the screen</li>
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  {currentSection === 'speaking' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <h5 className="font-medium text-orange-900 mb-2">Speaking Section</h5>
                        <ul className="text-orange-800 text-sm space-y-1">
                          <li>• Listen to each question before answering</li>
                          <li>• You can listen to each question up to 2 times</li>
                          <li>• Click Record Answer when you are ready</li>
                          <li>• For Part 2, use the 1-minute preparation time</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* OK Button */}
            <div className="p-4 border-t bg-slate-50">
              <div className="flex justify-center">
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="px-12 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}

export function ScreenHiddenOverlay({ show, setScreenHidden }) {
  if (!show) return null;
  return (
        <div className="fixed inset-0 bg-slate-600 flex items-center justify-center z-50">
          <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center">
                <EyeOff className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Screen hidden</span>
              <button 
                onClick={() => setScreenHidden(false)} 
                className="ml-auto w-6 h-6 bg-red-500 hover:bg-red-600 rounded flex items-center justify-center text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 bg-slate-50">
              <div className="space-y-4 text-slate-700">
                <p>Your answers have been stored.</p>
                <p>Please note that the clock is still running. The time has not been paused.</p>
                <p>If you wish to leave the room, please tell your invigilator.</p>
                <p>Click the button below to go back to your test.</p>
              </div>
              
              {/* Resume Button */}
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setScreenHidden(false)}
                  className="px-8 py-2 bg-slate-200 hover:bg-slate-300 border border-slate-400 rounded text-slate-800 font-medium transition-colors"
                >
                  Resume test
                </button>
              </div>
            </div>
          </div>
        </div>
  );
}
