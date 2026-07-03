import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  Target, BookOpen, HelpCircle, Lightbulb, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import SideBySideReader from '../../../../components/test/SideBySideReader';

export default function ReadingSection({
  readingTrack,
  setReadingTrack,
  strategicReading,
  generalReading,
  selectedModule,
  setCurrentSection,
}) {
  return (
    <Card id="reading-section" className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Target className="w-5 h-5 text-blue-600" /> Advanced Reading
      </h3>

      {/* Track Toggle - Academic vs General Training */}
      <div className="mb-6 p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-600 mb-3">IELTS Track Seçin:</p>
        <div className="flex gap-2">
          <Button
            variant={readingTrack === 'academic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReadingTrack('academic')}
            className={readingTrack === 'academic' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <BookOpen className="w-4 h-4 mr-1" /> Academic IELTS
          </Button>
          <Button
            variant={readingTrack === 'general' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setReadingTrack('general')}
            className={readingTrack === 'general' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <Target className="w-4 h-4 mr-1" /> General Training
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {readingTrack === 'academic' 
            ? '📚 Academic: Complex texts from books, journals, and academic sources'
            : '📋 General: Real-life professional documents, policies, and official notices'}
        </p>
      </div>

      {/* Academic Reading Content */}
      {readingTrack === 'academic' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              {strategicReading?.reading_scenario?.title || selectedModule.reading?.title}
            </h4>
            <Badge className="bg-blue-100 text-blue-700">Academic</Badge>
          </div>

          {/* Reading passage with Side-by-Side */}
          <SideBySideReader
            passage={strategicReading?.reading_scenario?.passage || selectedModule.reading?.passage || selectedModule.reading?.text || ''}
            passageTitle="Academic Reading Passage"
            defaultRatio={70}
          >
            {/* Practice Questions */}
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Comprehension Questions</h4>
              {(strategicReading?.reading_scenario?.questions || selectedModule.reading?.questions)?.map((q, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2 text-sm">
                    {idx + 1}. {q.question}
                    {q.type === 'true_false_ng' && <span className="text-xs text-gray-500 ml-2">(T/F/NG)</span>}
                    {q.type === 'multiple_choice' && <span className="text-xs text-gray-500 ml-2">(MC)</span>}
                  </p>
                  {q.options ? (
                    <div className="space-y-1">
                      {q.options.map((opt, i) => (
                        <label key={i} className="flex items-center gap-2 text-xs text-gray-700">
                          <input type="radio" name={`reading_q_${idx}`} value={opt} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'true_false_ng' ? (
                    <div className="flex gap-3 flex-wrap">
                      {['True', 'False', 'Not Given'].map(opt => (
                        <label key={opt} className="flex items-center gap-1 text-xs">
                          <input type="radio" name={`reading_q_${idx}`} value={opt} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <input type="text" placeholder="Your answer..." className="w-full p-2 border rounded text-sm" />
                  )}
                  <details className="mt-2">
                    <summary className="text-xs text-blue-600 cursor-pointer">Show Answer</summary>
                    <div className="mt-1 p-2 bg-green-50 rounded text-xs">
                      <p className="text-green-700 font-medium">✓ {q.answer || q.correct}</p>
                      {q.explanation && <p className="text-gray-600 mt-1">{q.explanation}</p>}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </SideBySideReader>
        </div>
      )}

      {/* General Training Reading Content */}
      {readingTrack === 'general' && (
        <div className="space-y-6">
          {generalReading ? (
            <>
              {/* General Training Reading Header */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-200">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge className="bg-purple-600 text-white">GENERAL TRAINING</Badge>
                  <Badge className="bg-indigo-600 text-white">ADVANCED</Badge>
                  <span className="text-xs text-purple-600 font-semibold">{generalReading.module_title}</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2">{generalReading.strategic_focus}</h3>
                <p className="text-sm text-gray-600 mb-4">{generalReading.learning_outcome}</p>
                
                {/* Document Type Info */}
                {generalReading.reading_scenario && (
                  <div className="p-3 bg-white rounded-lg border border-purple-100">
                    <p className="text-xs font-bold text-purple-700 mb-1">📋 DOCUMENT TYPE</p>
                    <p className="text-sm text-gray-700">{generalReading.reading_scenario.text_type}</p>
                    <p className="text-xs text-gray-500 mt-1 italic">{generalReading.reading_scenario.context}</p>
                  </div>
                )}
              </div>
              
              {/* Reading Scenario & Passage */}
              {generalReading.reading_scenario && (
                <>
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-white/20 text-white">{generalReading.band_target}</Badge>
                        <span className="text-sm font-semibold">{generalReading.reading_scenario.title}</span>
                      </div>
                    </div>
                    
                    {/* The Passage - Professional Document */}
                    <div className="p-6 max-h-[500px] overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700 leading-relaxed">
                        {generalReading.reading_scenario.passage}
                      </pre>
                    </div>
                  </div>
                  
                  {/* Comprehension Questions */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-gray-900 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-600" /> Comprehension Questions
                    </h4>
                    {generalReading.reading_scenario.questions?.map((q, idx) => (
                      <div key={idx} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-start justify-between mb-3">
                          <p className="font-medium text-gray-900">
                            {idx + 1}. {q.question}
                          </p>
                          {q.skill_tested && (
                            <div className="flex flex-wrap gap-1">
                              {q.skill_tested.map((skill, si) => (
                                <span key={si} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{skill}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {q.options ? (
                          <div className="space-y-2 ml-4">
                            {q.options.map((opt, i) => (
                              <label key={i} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:text-purple-600">
                                <input type="radio" name={`general_reading_q_${idx}`} value={opt} className="accent-purple-600" />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : q.type === 'true_false_ng' ? (
                          <div className="flex gap-4 ml-4">
                            {['True', 'False', 'Not Given'].map(opt => (
                              <label key={opt} className="flex items-center gap-2 text-sm cursor-pointer hover:text-purple-600">
                                <input type="radio" name={`general_reading_q_${idx}`} value={opt} className="accent-purple-600" />
                                {opt}
                              </label>
                            ))}
                          </div>
                        ) : (
                          <input 
                            type="text" 
                            placeholder="Type your answer..." 
                            className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500" 
                          />
                        )}
                        
                        <details className="mt-3">
                          <summary className="text-sm text-purple-600 cursor-pointer font-medium hover:underline">Show Answer</summary>
                          <div className="mt-2 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-green-700 font-semibold text-sm">✓ {q.answer}</p>
                            {q.explanation && <p className="text-gray-600 mt-2 text-sm">{q.explanation}</p>}
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                  
                  {/* Vocabulary Focus */}
                  {generalReading.reading_scenario.vocabulary_focus && (
                    <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Key Vocabulary
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {generalReading.reading_scenario.vocabulary_focus.map((v, vi) => (
                          <div key={vi} className="p-3 bg-white rounded-lg border border-purple-100">
                            <p className="font-semibold text-purple-700">{v.term}</p>
                            <p className="text-sm text-gray-600">{v.meaning}</p>
                            <p className="text-xs text-gray-500 italic mt-1">Context: {v.context}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Reading Tips */}
                  {generalReading.reading_scenario.reading_tips && (
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" /> Reading Tips for This Document Type
                      </h4>
                      <ul className="space-y-1">
                        {generalReading.reading_scenario.reading_tips.map((tip, ti) => (
                          <li key={ti} className="text-sm text-gray-700 flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Loading General Training reading content...</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
        </Button>
        <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
