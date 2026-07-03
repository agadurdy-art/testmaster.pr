import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import {
  BookOpen, FileText, Volume2, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import SideBySideReader from '../../../../components/test/SideBySideReader';

export default function ReadingSection({
  readingTrack,
  setReadingTrack,
  readingAnswers,
  setReadingAnswers,
  showReadingResults,
  setShowReadingResults,
  selectedModule,
  languageBooster,
  playingAudio,
  playPronunciation,
  handleQuizAnswer,
  setCurrentSection,
}) {
  return (
    <div className="space-y-4">
      {/* Track Toggle - Academic vs General Training */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm font-medium text-gray-600 mb-3">Select IELTS Track:</p>
        <div className="flex gap-2">
          <Button
            variant={readingTrack === 'academic' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setReadingTrack('academic'); setReadingAnswers({}); setShowReadingResults(false); }}
            className={readingTrack === 'academic' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <BookOpen className="w-4 h-4 mr-1" /> Academic IELTS
          </Button>
          <Button
            variant={readingTrack === 'general' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setReadingTrack('general'); setReadingAnswers({}); setShowReadingResults(false); }}
            className={readingTrack === 'general' ? 'bg-purple-600 hover:bg-purple-700' : ''}
          >
            <FileText className="w-4 h-4 mr-1" /> General Training
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {readingTrack === 'academic' 
            ? '📚 Academic: University-level texts, journals, research articles'
            : '📋 General: Notices, emails, workplace documents, forms'}
        </p>
      </div>
      
      {/* Academic Reading Content */}
      {readingTrack === 'academic' && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> {selectedModule.reading?.title}
            </h3>
            <Button variant="outline" size="sm" onClick={() => playPronunciation(selectedModule.reading.passage || selectedModule.reading.text)} disabled={playingAudio === (selectedModule.reading.passage || selectedModule.reading.text)}>
              {playingAudio === (selectedModule.reading.passage || selectedModule.reading.text) ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
              Listen
            </Button>
          </div>
          
          <SideBySideReader
            passage={selectedModule.reading?.passage || selectedModule.reading?.text || ''}
            passageTitle="Reading Passage"
            defaultRatio={65}
          >
            <div className="space-y-4">
              <h4 className="font-bold text-gray-900 text-sm">Comprehension Questions</h4>
              {selectedModule.reading?.questions?.map((q, idx) => (
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
                          <input type="radio" name={`q_${idx}`} value={opt} onChange={() => handleQuizAnswer(`q_${idx}`, opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : q.type === 'true_false_ng' ? (
                    <div className="flex gap-3 flex-wrap">
                      {['True', 'False', 'Not Given'].map(opt => (
                        <label key={opt} className="flex items-center gap-1 text-xs">
                          <input type="radio" name={`q_${idx}`} value={opt} onChange={() => handleQuizAnswer(`q_${idx}`, opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Input placeholder="Your answer..." className="text-sm h-8" onChange={(e) => handleQuizAnswer(`q_${idx}`, e.target.value)} />
                  )}
                  <details className="mt-2 cursor-pointer">
                    <summary className="text-xs text-green-600">Show Answer</summary>
                    <p className="mt-1 text-xs text-gray-700 bg-green-50 p-2 rounded">{q.answer}</p>
                  </details>
                </div>
              ))}
            </div>
          </SideBySideReader>
        </>
      )}
      
      {/* General Training Reading Content - Module-Specific */}
      {readingTrack === 'general' && (
        <Card className="p-6 bg-white border-0 shadow-lg">
          {languageBooster?.reading_task ? (
            <>
              {/* Module-Specific Reading Content */}
              <div className="bg-purple-50 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-purple-600 text-white">{languageBooster.module.toUpperCase()}</Badge>
                  <span className="text-xs text-purple-600 font-semibold">GENERAL TRAINING READING - Module-Specific</span>
                </div>
                
                {/* Learning Outcome */}
                <p className="text-sm text-gray-600 mb-4">{languageBooster.learning_outcome}</p>
              </div>
              
              {/* Reading Task */}
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-700">{languageBooster.reading_task.type}</Badge>
                  <h4 className="font-semibold text-gray-800">{languageBooster.reading_task.title}</h4>
                </div>
                
                {/* The actual text content */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4 font-mono text-sm whitespace-pre-line">
                  {languageBooster.reading_task.content}
                </div>
                
                {/* Questions */}
                <div className="space-y-3">
                  <h5 className="font-semibold text-gray-800 text-sm">Questions:</h5>
                  {languageBooster.reading_task.questions?.map((q, qIdx) => {
                    const questionKey = `booster-${qIdx}`;
                    const userAnswer = readingAnswers[questionKey] || '';
                    const isCorrect = userAnswer.toLowerCase().trim() === q.a.toLowerCase().trim();
                    
                    return (
                      <div key={qIdx} className="p-3 bg-white rounded-lg border border-gray-100">
                        <p className="font-medium text-gray-900 mb-2 text-sm">
                          {qIdx + 1}. {q.q}
                          <span className="text-xs text-gray-400 ml-2">({q.skill})</span>
                        </p>
                        <div className="flex gap-2 items-center">
                          <Input 
                            placeholder="Your answer..." 
                            className="text-sm h-8 flex-1"
                            value={userAnswer}
                            onChange={(e) => setReadingAnswers(prev => ({...prev, [questionKey]: e.target.value}))}
                          />
                          {showReadingResults && (
                            <span className={`text-lg ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                              {isCorrect ? '✓' : '✗'}
                            </span>
                          )}
                        </div>
                        {showReadingResults && !isCorrect && (
                          <p className="mt-1 text-xs text-green-600 bg-green-50 p-2 rounded">
                            Correct answer: {q.a}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <Button 
                onClick={() => setShowReadingResults(true)}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600"
              >
                Check Answers
              </Button>
              
              {/* Key Vocabulary Preview */}
              <details className="mt-4 cursor-pointer">
                <summary className="font-bold text-blue-700">📘 Related Vocabulary ({languageBooster.key_vocabulary?.length || 0} words)</summary>
                <div className="mt-2 p-3 bg-blue-50 rounded-lg max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {languageBooster.key_vocabulary?.slice(0, 10).map((vocab, i) => (
                      <span key={i} className="px-2 py-1 bg-white rounded-full text-xs text-blue-700 border border-blue-200">
                        {vocab.word}
                      </span>
                    ))}
                  </div>
                </div>
              </details>
            </>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Module-specific reading content loading...</p>
            </div>
          )}
        </Card>
      )}
      
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('listening')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Listening
        </Button>
        <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-violet-500 to-purple-600">
          Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
