import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import {
  FileText, BookOpen, Loader2, Volume2, ChevronLeft, ChevronRight
} from 'lucide-react';
import SideBySideReader from '../../../../components/test/SideBySideReader';

export default function ReadingSection({
  readingTrack,
  setReadingTrack,
  selectedLesson,
  generalReadingLessons,
  selectedReadingLesson,
  setSelectedReadingLesson,
  playPronunciation,
  playingAudio,
  setCurrentSection,
}) {
    // For Academic track, check if lesson has reading content
    if (readingTrack === 'academic' && !selectedLesson?.reading) {
      return <Card className="p-6"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></Card>;
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Reading Practice
          </h3>
          
          {/* Track Toggle - Academic vs General Training */}
          <div className="flex items-center gap-2">
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
              <FileText className="w-4 h-4 mr-1" /> General Training
            </Button>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          {readingTrack === 'academic' 
            ? '📘 Academic: Longer texts from books, journals - university/professional focus' 
            : '📋 General Training: Everyday texts - notices, emails, instructions'}
        </p>
        
        {/* Academic Reading */}
        {readingTrack === 'academic' && selectedLesson?.reading && (
          <>
            <div className="flex items-center justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => playPronunciation(selectedLesson.reading.text)}
                disabled={playingAudio === selectedLesson.reading.text}
              >
                {playingAudio === selectedLesson.reading.text ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Volume2 className="w-4 h-4 mr-1" />
                )}
                Listen
              </Button>
            </div>
            
            <SideBySideReader
              passage={selectedLesson.reading.text}
              passageTitle="Reading Passage"
              defaultRatio={60}
            >
              {/* Comprehension Questions */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-900 text-sm">Comprehension Questions</h4>
                {selectedLesson.reading.questions?.map((q, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900 text-sm mb-2">{idx + 1}. {q.question}</p>
                    <details className="cursor-pointer">
                      <summary className="text-xs text-green-600 hover:text-green-700">Click to see answer</summary>
                      <p className="mt-2 text-gray-700 text-sm bg-green-50 p-2 rounded">{q.answer}</p>
                    </details>
                  </div>
                ))}
              </div>
            </SideBySideReader>
          </>
        )}
        
        {/* General Training Reading - GLOBAL FOUNDATION for Beginner */}
        {readingTrack === 'general' && (
          <>
            {generalReadingLessons.length > 0 ? (
              <>
                {/* Lesson Selector */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-600 mb-2">Select a Foundation Reading Lesson:</p>
                  <div className="flex flex-wrap gap-2">
                    {generalReadingLessons.map((lesson, idx) => (
                      <Button
                        key={idx}
                        variant={selectedReadingLesson?.id === lesson.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedReadingLesson(lesson)}
                        className={selectedReadingLesson?.id === lesson.id ? 'bg-purple-600' : ''}
                      >
                        {lesson.topic || lesson.title}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedReadingLesson && (
                  <>
                    <div className="bg-purple-50 rounded-xl p-5 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-purple-600 text-white">FOUNDATION</Badge>
                        <span className="text-xs text-purple-600 font-semibold">GENERAL TRAINING READING</span>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 mb-2">{selectedReadingLesson.reading?.title || selectedReadingLesson.title}</h4>
                      
                      {/* Learning Goals */}
                      {selectedReadingLesson.learning_goals && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-2">🎯 Learning Goals:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedReadingLesson.learning_goals.map((goal, i) => (
                              <li key={i}>• {goal}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Text Types Info */}
                      {selectedReadingLesson.reading?.text_types && (
                        <div className="mb-4 p-3 bg-white rounded-lg">
                          <p className="text-xs font-semibold text-blue-700 mb-2">📚 Text Types You Will Learn:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedReadingLesson.reading.text_types.map((type, i) => (
                              <li key={i}>• {type}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Tips */}
                      {selectedReadingLesson.tips && (
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <p className="text-xs font-semibold text-amber-700 mb-2">💡 Reading Tips:</p>
                          <ul className="text-sm text-gray-700 space-y-1">
                            {selectedReadingLesson.tips.map((tip, i) => (
                              <li key={i}>• {tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Practice Text */}
                    {selectedReadingLesson.reading?.practice_text && (
                      <div className="bg-white border-2 border-gray-200 rounded-xl p-5 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="bg-gray-100 text-gray-700">{selectedReadingLesson.reading.practice_text.type}</Badge>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm whitespace-pre-line">
                          {selectedReadingLesson.reading.practice_text.content}
                        </div>
                      </div>
                    )}
                    
                    {/* Questions */}
                    {selectedReadingLesson.reading?.questions && (
                      <div className="space-y-3">
                        <h4 className="font-bold text-gray-900">Practice Questions</h4>
                        {selectedReadingLesson.reading.questions.map((q, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-gray-900 text-sm mb-2">{idx + 1}. {q.question}</p>
                            <details className="cursor-pointer">
                              <summary className="text-xs text-green-600 hover:text-green-700">Click to see answer</summary>
                              <p className="mt-2 text-gray-700 text-sm bg-green-50 p-2 rounded">{q.answer}</p>
                            </details>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Loading General Training reading lessons...</p>
              </div>
            )}
          </>
        )}
      
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('listening')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Listening
          </Button>
          <Button onClick={() => setCurrentSection('speaking')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            Next: Speaking <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
}
