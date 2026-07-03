import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Loader2, Square, Mic, Star, Lightbulb, Layers, BookOpen,
  PenTool, HelpCircle, Award, ChevronRight
} from 'lucide-react';

export default function VocabularySection({
  selectedLesson,
  user,
  navigate,
  getText,
  playPronunciation,
  playingAudio,
  pronunciationRecording,
  pronunciationWord,
  startPronunciationRecording,
  stopPronunciationRecording,
  evaluatingPronunciation,
  pronunciationFeedback,
  setCurrentSection,
}) {
  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <div className="text-center mb-6 pb-4 border-b border-green-100">
        <div className="text-4xl mb-2">📚</div>
        <h3 className="text-xl font-bold text-gray-900">{getText('newWords')}</h3>
        <p className="text-sm text-gray-500">{getText('clickToListen')}</p>
      </div>
      
      <div className="space-y-4">
        {selectedLesson.vocabulary.map((item, idx) => (
          <div key={idx} className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-gray-900">{item.word}</h4>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playPronunciation(item.word)}
                  disabled={playingAudio === item.word}
                  className="text-blue-600 gap-1"
                >
                  {playingAudio === item.word ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>🔊 {getText('listen')}</>
                  )}
                </Button>
                <Button
                  variant={pronunciationRecording && pronunciationWord === item.word ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (pronunciationRecording && pronunciationWord === item.word) {
                      stopPronunciationRecording();
                    } else {
                      startPronunciationRecording(item.word);
                    }
                  }}
                  disabled={evaluatingPronunciation || (pronunciationRecording && pronunciationWord !== item.word)}
                  className={pronunciationRecording && pronunciationWord === item.word ? "gap-1" : "text-green-600 gap-1"}
                >
                  {evaluatingPronunciation && pronunciationWord === item.word ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : pronunciationRecording && pronunciationWord === item.word ? (
                    <Square className="w-4 h-4" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
            
            {/* Pronunciation Feedback */}
            {pronunciationFeedback && pronunciationWord === item.word && (
              <div className={`mt-3 p-3 rounded-lg ${pronunciationFeedback.stars >= 4 ? 'bg-green-50 border border-green-200' : pronunciationFeedback.stars >= 2 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map(star => (
                      <Star 
                        key={star} 
                        className={`w-4 h-4 ${star <= pronunciationFeedback.stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-sm">{pronunciationFeedback.main_feedback}</span>
                </div>
                <p className="text-sm text-gray-600">{pronunciationFeedback.encouragement}</p>
                {pronunciationFeedback.tips && pronunciationFeedback.tips.length > 0 && (
                  <ul className="mt-2 text-xs text-gray-500">
                    {pronunciationFeedback.tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-1">
                        <Lightbulb className="w-3 h-3 text-amber-500" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            <p className="text-gray-600 mb-2">
              <span className="font-medium text-gray-700">Meaning:</span> {item.meaning}
            </p>
            <p className="text-gray-600 italic">
              <span className="font-medium text-gray-700 not-italic">Example:</span> &ldquo;{item.example}&rdquo;
            </p>
          </div>
        ))}
      </div>
      
      {/* Interactive Vocabulary Engine */}
      {user && selectedLesson && (
        <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <h4 className="font-bold text-green-900 mb-1 flex items-center gap-2">
            <Layers className="w-4 h-4" /> Interactive Vocabulary Practice
          </h4>
          <p className="text-sm text-green-600 mb-4">Master these words through interactive exercises</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              data-testid="vocab-engine-learn-btn"
              variant="outline"
              className="border-green-300 text-green-700 hover:bg-green-100"
              onClick={() => navigate(`/vocabulary/learn/${selectedLesson.id}`)}
            >
              <BookOpen className="w-4 h-4 mr-1" /> Learn
            </Button>
            <Button
              data-testid="vocab-engine-practice-btn"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-100"
              onClick={() => navigate(`/vocabulary/practice/${selectedLesson.id}`)}
            >
              <PenTool className="w-4 h-4 mr-1" /> Practice
            </Button>
            <Button
              data-testid="vocab-engine-quiz-btn"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={() => navigate(`/vocabulary/quiz/${selectedLesson.id}`)}
            >
              <HelpCircle className="w-4 h-4 mr-1" /> Quiz
            </Button>
            <Button
              data-testid="vocab-engine-production-btn"
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100"
              onClick={() => navigate(`/vocabulary/production/${selectedLesson.id}`)}
            >
              <Award className="w-4 h-4 mr-1" /> Production
            </Button>
          </div>
        </div>
      )}
      
      <div className="mt-6 flex justify-end">
        <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
