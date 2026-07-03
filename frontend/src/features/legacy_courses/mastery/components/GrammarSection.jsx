import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Languages, Lightbulb, Award, AlertCircle, XCircle, CheckCircle,
  Layers, BookOpen, PenTool, HelpCircle, Target, ChevronRight
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
        <Languages className="w-5 h-5 text-purple-600" /> {selectedModule.grammar?.title}
      </h3>
      
      {/* Visual Grammar Structure */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6">
        {/* Mind Map Style Visualization */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-purple-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
            {selectedModule.grammar?.title || 'Grammar Point'}
          </div>
          <div className="w-1 h-8 bg-purple-300"></div>
          <div className="flex flex-wrap justify-center gap-4 relative">
            <div className="absolute top-0 left-1/2 w-3/4 h-0.5 bg-purple-300 -translate-x-1/2"></div>
            {/* Structure branches */}
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-purple-200 text-center min-w-[120px] mt-4">
              <p className="text-purple-600 font-bold text-sm">📐 Form</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.form || 'Subject + Verb + Object'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-blue-200 text-center min-w-[120px] mt-4">
              <p className="text-blue-600 font-bold text-sm">🎯 Use</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.use || 'Express actions/states'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-md border-2 border-green-200 text-center min-w-[120px] mt-4">
              <p className="text-green-600 font-bold text-sm">⏰ Time</p>
              <p className="text-xs text-gray-600 mt-1">{selectedModule.grammar?.time_reference || 'Past / Present / Future'}</p>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 mb-4 text-center">{selectedModule.grammar?.explanation}</p>
        
        {selectedModule.grammar?.benefit && (
          <div className="flex items-center justify-center gap-2 text-sm text-purple-700 bg-purple-100 p-3 rounded-lg mb-4">
            <Lightbulb className="w-4 h-4" />
            <span><strong>IELTS Tip:</strong> {selectedModule.grammar.benefit}</span>
          </div>
        )}
        
        {/* Examples with Visual Flow */}
        <div className="space-y-3 mt-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-purple-600" /> Examples
          </h4>
          {selectedModule.grammar?.examples?.map((ex, idx) => (
            <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-3">
                <span className="bg-purple-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                <p className="text-purple-700 font-medium">{ex}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Band Level Comparison - Same idea at different levels */}
        <div className="mt-6">
          <h4 className="font-semibold text-gray-800 mb-3 text-center">📊 Same Idea - Different Band Levels</h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-amber-50 rounded-xl border-l-4 border-amber-400">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                📝 Band 5.5-6.0 Example
              </h4>
              <p className="text-gray-600 text-xs mb-2">Simple structure, basic vocabulary:</p>
              <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                {selectedModule.grammar?.band_55_example || 
                 '"Many people think education is very important. It helps people get good jobs."'}
              </p>
              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                ⚠️ Correct but simple - short sentences, basic words
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-500">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                ⭐ Band 7.0+ Example
              </h4>
              <p className="text-gray-600 text-xs mb-2">Same idea with complex structure:</p>
              <p className="text-gray-700 italic text-sm bg-white p-2 rounded">
                {selectedModule.grammar?.band_70_example || 
                 '"It is widely acknowledged that education plays a pivotal role in society, as it not only equips individuals with essential skills but also enhances their employment prospects."'}
              </p>
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                ✓ Complex sentence + advanced vocabulary + linking
              </p>
            </div>
          </div>
          <p className="text-xs text-center text-gray-500 mt-3">💡 Notice: Same concept expressed differently - Band 7+ uses complex structures and academic vocabulary</p>
        </div>
      </div>
      
      {/* Signal Words Visual */}
      {selectedModule.grammar?.signal_words && (
        <div className="bg-blue-50 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
            🔑 Signal Words & Phrases
          </h4>
          <div className="flex flex-wrap gap-2">
            {(selectedModule.grammar.signal_words || '').split(',').map((word, idx) => (
              <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                {word.trim()}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Common Mistake with Visual Comparison */}
      {selectedModule.common_mistake && (
        <div className="bg-red-50 rounded-xl p-5 mb-4">
          <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Common Mistake
          </h4>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-red-100 p-4 rounded-lg border-2 border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="font-bold text-red-700">❌ Incorrect</span>
              </div>
              <p className="text-red-700 line-through">{selectedModule.common_mistake.wrong}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-700">✓ Correct</span>
              </div>
              <p className="text-green-700 font-medium">{selectedModule.common_mistake.correct}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3 bg-white p-3 rounded-lg">
            💡 <strong>Remember:</strong> {selectedModule.common_mistake.explanation}
          </p>
        </div>
      )}
      
      {selectedModule.tip && (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
          <p className="text-amber-800 flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            <span><strong>Pro Tip:</strong> {selectedModule.tip}</span>
          </p>
        </div>
      )}
      
      {/* Interactive Grammar Engine */}
      {user && (
        <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
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
        <Button onClick={() => setCurrentSection('listening')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Listening <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
