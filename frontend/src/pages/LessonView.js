import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { 
  BookOpen, CheckCircle, Clock, ArrowRight, ArrowLeft, Award, Lightbulb, Volume2, Mic
} from 'lucide-react';
import { toast } from 'sonner';
import PronunciationRecorder from '../components/PronunciationRecorder';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LessonView({ user }) {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!user || !user.id) {
      console.error('No user found, redirecting to home');
      navigate('/');
      return;
    }
    loadLesson();
  }, [lessonId, user]);

  const loadLesson = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/learning-platform/lessons/${lessonId}?user_id=${user.id}`
      );
      const data = await response.json();
      setLesson(data);

      // Mark lesson as started
      await fetch(`${API_URL}/api/learning-platform/lessons/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, lesson_id: lessonId })
      });
    } catch (error) {
      console.error('Failed to load lesson:', error);
      toast.error('Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const completeLesson = async () => {
    setCompleting(true);
    try {
      const timeSpentMinutes = Math.round((Date.now() - startTime) / 60000);
      
      const response = await fetch(`${API_URL}/api/learning-platform/lessons/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          lesson_id: lessonId,
          time_spent_minutes: Math.max(1, timeSpentMinutes),
          score: 100 // For now, assume completion = 100%
        })
      });

      if (response.ok) {
        toast.success('Lesson completed! 🎉');
        navigate(-1); // Go back to unit page
      } else {
        throw new Error('Failed to complete lesson');
      }
    } catch (error) {
      console.error('Failed to complete lesson:', error);
      toast.error('Failed to save progress');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">Lesson not found</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Card>
      </div>
    );
  }

  const { content } = lesson;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 text-white py-6 sticky top-0 z-10 shadow-lg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <p className="text-sm text-violet-100">Lesson {lesson.lesson_number}</p>
                <h1 className="text-xl sm:text-2xl font-bold">{lesson.title}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </Button>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                {lesson.duration_minutes} min
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Vocabulary Section */}
        {content.vocabulary && content.vocabulary.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-violet-600" />
              Vocabulary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.vocabulary.map((item, idx) => {
                const vocabItem = typeof item === 'string' ? { word: item } : item;
                return (
                  <Card key={idx} className="p-4 bg-violet-50 border-violet-200 hover:shadow-lg transition-shadow">
                    {vocabItem.visual_url && (
                      <img 
                        src={vocabItem.visual_url} 
                        alt={vocabItem.word}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-xl text-violet-900">{vocabItem.word}</p>
                        {vocabItem.audio_url && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const audio = new Audio(`${API_URL}${vocabItem.audio_url}`);
                              audio.play().catch(() => {
                                // Fallback to text-to-speech
                                const utterance = new SpeechSynthesisUtterance(vocabItem.word);
                                utterance.lang = 'en-US';
                                window.speechSynthesis.speak(utterance);
                              });
                            }}
                          >
                            <Volume2 className="w-4 h-4 text-violet-600" />
                          </Button>
                        )}
                      </div>
                      {vocabItem.phonetic && (
                        <p className="text-sm text-slate-600 font-mono">{vocabItem.phonetic}</p>
                      )}
                      {vocabItem.pronunciation_focus && (
                        <p className="text-xs bg-amber-100 text-amber-800 p-2 rounded border-l-2 border-amber-500">
                          <strong>Focus:</strong> {vocabItem.pronunciation_focus}
                        </p>
                      )}
                      {vocabItem.example && (
                        <p className="text-sm text-slate-700 italic">"{vocabItem.example}"</p>
                      )}
                      {vocabItem.animal_sound && (
                        <p className="text-sm bg-green-100 text-green-700 p-1 rounded text-center">
                          🔊 {vocabItem.animal_sound}
                        </p>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </Card>
        )}

        {/* Grammar Focus */}
        {content.grammar_focus && (
          <Card className="p-6 mb-6 border-l-4 border-l-amber-500">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-amber-600" />
              Grammar Focus
            </h2>
            <p className="text-lg text-slate-700">{content.grammar_focus}</p>
          </Card>
        )}

        {/* Example Sentences */}
        {content.example_sentences && content.example_sentences.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Volume2 className="w-6 h-6 text-green-600" />
              Example Sentences
            </h2>
            <div className="space-y-3">
              {content.example_sentences.map((sentence, idx) => (
                <div key={idx} className="p-4 bg-green-50 rounded-lg border-l-4 border-l-green-500">
                  <p className="text-slate-800 italic">"{sentence}"</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Pronunciation Practice Section */}
        {content.pronunciation_practice && content.pronunciation_practice.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-red-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mic className="w-6 h-6 text-red-600" />
              Pronunciation Practice
            </h2>
            {content.pronunciation_practice.map((practice, idx) => (
              <div key={idx} className="mb-6 last:mb-0">
                <p className="text-sm text-slate-600 mb-3">{practice.instruction}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {practice.words?.map((wordItem, wordIdx) => {
                    // Handle both string and object word formats
                    const word = typeof wordItem === 'string' ? wordItem : wordItem.word;
                    const phonetic = typeof wordItem === 'object' ? wordItem.phonetic : null;
                    return (
                      <div key={wordIdx}>
                        <PronunciationRecorder
                          word={word}
                          phonetic={phonetic}
                          userId={user.id}
                          type="word"
                          maxAttempts={3}
                          onFeedback={(feedback) => {
                            console.log('Pronunciation feedback:', feedback);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </Card>
        )}

        {/* Quick Vocabulary Practice - Record each word */}
        {content.vocabulary && content.vocabulary.length > 0 && (
          <Card className="p-6 mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Mic className="w-6 h-6 text-emerald-600" />
              Practice Pronunciation
            </h2>
            <p className="text-slate-600 mb-4">Record yourself saying each word. Click the speaker icon to hear the correct pronunciation first!</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {content.vocabulary.slice(0, 4).map((item, idx) => {
                const vocabItem = typeof item === 'string' ? { word: item } : item;
                return (
                  <PronunciationRecorder
                    key={idx}
                    word={vocabItem.word}
                    phonetic={vocabItem.phonetic}
                    imageUrl={vocabItem.visual_url}
                    userId={user.id}
                    type="word"
                    maxAttempts={3}
                    onFeedback={(feedback) => {
                      if (feedback.correct || feedback.score >= 70) {
                        toast.success(`Great job saying "${vocabItem.word}"! 🌟`);
                      }
                    }}
                  />
                );
              })}
            </div>
          </Card>
        )}

        {/* Exercises Section */}
        {content.exercises && content.exercises.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-blue-600" />
              Practice Exercises
            </h2>
            <div className="space-y-6">
              {content.exercises.map((exercise, idx) => (
                <div key={idx}>
                  {exercise.type === 'pronunciation_record' && (
                    <div>
                      <p className="font-semibold mb-3 text-slate-800">
                        {exercise.prompt}
                      </p>
                      <PronunciationRecorder
                        targetText={exercise.target_text}
                        userId={user.id}
                        type="sentence"
                        onFeedback={(feedback) => {
                          if (feedback.overall_score >= 80) {
                            toast.success('Excellent pronunciation! 🎉');
                          } else if (feedback.overall_score >= 60) {
                            toast.success('Good job! Keep practicing.');
                          } else {
                            toast.info('Keep practicing! Check the tips below.');
                          }
                        }}
                      />
                    </div>
                  )}
                  {exercise.type !== 'pronunciation_record' && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <p className="font-semibold mb-3 text-slate-800">
                        {idx + 1}. {exercise.prompt}
                      </p>
                      {exercise.type === 'fill_blank' && exercise.options && (
                        <div className="space-y-2">
                          {exercise.options.map((option, optIdx) => (
                            <button
                              key={optIdx}
                              className="block w-full text-left px-4 py-2 bg-white rounded hover:bg-blue-100 transition-colors"
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Reading Passage (if exists) */}
        {content.reading_passage && (
          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">Reading</h2>
            <div className="prose max-w-none">
              <p className="text-slate-700 leading-relaxed">{content.reading_passage}</p>
            </div>
          </Card>
        )}

        {/* Complete Button */}
        <div className="flex justify-between items-center mt-8">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Unit
          </Button>
          
          {!lesson.user_progress?.completed && (
            <Button
              onClick={completeLesson}
              disabled={completing}
              className="bg-green-600 hover:bg-green-700"
            >
              {completing ? 'Saving...' : 'Complete Lesson'}
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}

          {lesson.user_progress?.completed && (
            <div className="flex items-center gap-2 text-green-600 font-semibold">
              <CheckCircle className="w-5 h-5" />
              Completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
