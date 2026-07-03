import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Brain, Lightbulb, Award, Layers, BookOpen, PenTool,
  HelpCircle, Target, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function GrammarSection({
  selectedModule,
  user,
  navigate,
  setCurrentSection,
}) {
  return (
    <Card id="grammar-section" className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Brain className="w-5 h-5 text-purple-600" /> {selectedModule.grammar?.title}
      </h3>
      
      {/* Visual Grammar Structure - Mastery Style */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
        {/* Mind Map Style Visualization */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            {selectedModule.grammar?.title || 'Advanced Grammar'}
          </div>
          <div className="w-1 h-8 bg-purple-300"></div>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <div className="absolute top-0 left-1/2 w-3/4 h-0.5 bg-purple-300 -translate-x-1/2"></div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-purple-200 text-center min-w-[120px] mt-4">
              <p className="text-purple-600 font-bold text-sm">📐 Form</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.form || 'Complex structures'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200 text-center min-w-[120px] mt-4">
              <p className="text-blue-600 font-bold text-sm">🎯 Use</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.use || 'Band 7+ writing/speaking'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-green-200 text-center min-w-[120px] mt-4">
              <p className="text-green-600 font-bold text-sm">⭐ Effect</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.effect || 'Sophistication'}</p>
            </div>
          </div>
        </div>

        {/* Explanation */}
        <p className="text-gray-700 mb-4 text-center">{selectedModule.grammar?.explanation}</p>

        {selectedModule.grammar?.benefit && (
          <div className="flex items-center justify-center gap-2 text-sm text-purple-700 bg-purple-100 p-3 rounded-lg mb-4">
            <Lightbulb className="w-4 h-4" />
            <span><strong>IELTS Band 7+ Tip:</strong> {selectedModule.grammar.benefit}</span>
          </div>
        )}

        {/* Examples with Visual Flow */}
        {selectedModule.grammar?.examples && selectedModule.grammar.examples.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" /> Advanced Examples
            </h4>
            {selectedModule.grammar.examples.map((ex, idx) => (
              <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                  <p className="text-purple-700 font-medium">{ex}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Band Level Comparison - Same idea at different levels (Chris-authored, lesson-specific) */}
        {(selectedModule.grammar?.band_55_example || selectedModule.grammar?.band_75_example) && (
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 Same Idea — Different Band Levels</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
                <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                  Band 5.5 Example
                </h4>
                <p className="text-gray-600 text-xs mb-2">Clear meaning, simpler structure:</p>
                <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                  {selectedModule.grammar.band_55_example}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
                <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                  Band 7.5+ Example
                </h4>
                <p className="text-gray-600 text-xs mb-2">Same idea, lifted with this lesson's grammar:</p>
                <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                  {selectedModule.grammar.band_75_example}
                </p>
              </div>
            </div>
            {selectedModule.grammar?.coach_note && (
              <div className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                <p className="text-xs text-indigo-900 leading-relaxed">
                  <span className="font-bold">Coach's note:</span> {selectedModule.grammar.coach_note}
                </p>
                <p className="text-[11px] text-indigo-500 mt-1 text-right italic">— Chris</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Why it works explanation */}
      {selectedModule.grammar?.why_it_works && (
        <div className="p-4 bg-amber-50 rounded-xl mb-4">
          <h4 className="font-semibold text-amber-800 mb-2">💡 Why This Works</h4>
          <p className="text-gray-700">{selectedModule.grammar.why_it_works}</p>
        </div>
      )}

      {/* Interactive Grammar Engine */}
      {user && (
        <div className="mt-4 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
          <h4 className="font-bold text-indigo-900 mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Interactive Grammar Practice
          </h4>
          <p className="text-sm text-indigo-600 mb-4">Master this grammar through 5 stages of practice</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <Button
              data-testid="grammar-engine-learn-btn"
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-100"
              onClick={() => navigate(`/grammar/learn/${selectedModule.id}`)}
            >
              <BookOpen className="w-4 h-4 mr-1" /> Learn
            </Button>
            <Button
              data-testid="grammar-engine-practice-btn"
              variant="outline"
              className="border-purple-300 text-purple-700 hover:bg-purple-100"
              onClick={() => navigate(`/grammar/practice/${selectedModule.id}`)}
            >
              <PenTool className="w-4 h-4 mr-1" /> Practice
            </Button>
            <Button
              data-testid="grammar-engine-quiz-btn"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => navigate(`/grammar/quiz/${selectedModule.id}`)}
            >
              <HelpCircle className="w-4 h-4 mr-1" /> Quiz
            </Button>
            <Button
              data-testid="grammar-engine-guided-btn"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => navigate(`/grammar/guided/${selectedModule.id}`)}
            >
              <Target className="w-4 h-4 mr-1" /> Guided
            </Button>
            <Button
              data-testid="grammar-engine-free-btn"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => navigate(`/grammar/free/${selectedModule.id}`)}
            >
              <Award className="w-4 h-4 mr-1" /> Free
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('vocabulary')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Vocabulary
        </Button>
        <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
