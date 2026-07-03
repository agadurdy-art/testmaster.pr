import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import {
  Volume2, HelpCircle, BookOpen, Lightbulb, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ListeningSection({
  selectedModule,
  listeningAnswers,
  setListeningAnswers,
  showListeningResults,
  setShowListeningResults,
  showTranscript,
  setShowTranscript,
  playPronunciation,
  setCurrentSection,
}) {
    const listening = selectedModule?.listening;
    const moduleNum = selectedModule?.module_number || 1;
    const hasAudio = moduleNum >= 1 && moduleNum <= 17;
    const audioPath = `${API_URL}/api/static/audio/mastery_course/module_${moduleNum}_listening.mp3`;
    
    const handleListeningAnswer = (qIdx, answer) => {
      setListeningAnswers(prev => ({ ...prev, [qIdx]: answer }));
    };
    
    const checkListeningAnswers = () => {
      setShowListeningResults(true);
      const questions = listening?.comprehension_questions || [];
      let correct = 0;
      questions.forEach((q, idx) => {
        const userAns = (listeningAnswers[idx] || '').toLowerCase().trim();
        const correctAns = (q.answer || '').toLowerCase().trim();
        if (q.type === 'true_false_ng') {
          if (userAns === correctAns) correct++;
        } else if (userAns && (correctAns.includes(userAns) || userAns.includes(correctAns.split('/')[0].trim()))) {
          correct++;
        }
      });
      toast.success(`Listening Quiz: ${correct}/${questions.length} correct!`);
    };
    
    if (!listening) {
      return (
        <Card className="p-6 bg-white border-0 shadow-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-cyan-600" /> Listening Practice
          </h3>
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Volume2 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">Listening content coming soon for this module!</p>
          </div>
          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
            </Button>
            <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-violet-500 to-purple-600">
              Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>
      );
    }
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-cyan-600" /> {listening.title || 'Listening Practice'}
        </h3>
        
        {/* Audio Player */}
        {hasAudio ? (
          <div className="mb-6 p-5 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Module {moduleNum} Listening</p>
                <p className="text-sm text-gray-600">Band 4.5-6.5 Level</p>
              </div>
            </div>
            <audio controls className="w-full" preload="metadata">
              <source src={audioPath} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p className="text-xs text-gray-500 mt-2">💡 Tip: Listen at least twice before answering questions</p>
          </div>
        ) : (
          <div className="mb-6 p-5 bg-gray-100 rounded-xl text-center">
            <Volume2 className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Audio coming soon!</p>
          </div>
        )}
        
        {/* Transcript Toggle */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="mb-3"
          >
            {showTranscript ? '🔒 Hide Transcript' : '📜 Show Transcript'}
          </Button>
          {showTranscript && listening.audio_script && (
            <div className="p-4 bg-gray-50 rounded-lg border max-h-64 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                {listening.audio_script}
              </p>
            </div>
          )}
        </div>
        
        {/* Comprehension Questions */}
        {listening.comprehension_questions && listening.comprehension_questions.length > 0 && (
          <div className="mb-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-cyan-600" /> Comprehension Questions
            </h4>
            <div className="space-y-4">
              {listening.comprehension_questions.map((q, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-900 mb-2">
                    {idx + 1}. {q.question}
                    {q.type === 'true_false_ng' && <span className="text-xs text-gray-500 ml-2">(T/F/NG)</span>}
                  </p>
                  {q.type === 'true_false_ng' ? (
                    <div className="flex gap-3 flex-wrap">
                      {['True', 'False', 'Not Given'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name={`listening_q_${idx}`}
                            value={opt}
                            checked={listeningAnswers[idx] === opt}
                            onChange={() => handleListeningAnswer(idx, opt)}
                          />
                          <span className="text-sm">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <Input
                      placeholder="Type your answer..."
                      value={listeningAnswers[idx] || ''}
                      onChange={(e) => handleListeningAnswer(idx, e.target.value)}
                      className="text-sm"
                    />
                  )}
                  {showListeningResults && (
                    <div className={`mt-2 p-2 rounded text-sm ${
                      (listeningAnswers[idx] || '').toLowerCase().trim() === q.answer.toLowerCase().trim() ||
                      q.answer.toLowerCase().includes((listeningAnswers[idx] || '').toLowerCase().trim())
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      <strong>Answer:</strong> {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Button
              onClick={checkListeningAnswers}
              className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600"
            >
              Check Answers
            </Button>
          </div>
        )}
        
        {/* Vocabulary Focus */}
        {listening.vocab_focus && listening.vocab_focus.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl">
            <h4 className="font-bold text-purple-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Key Vocabulary from Audio
            </h4>
            <div className="flex flex-wrap gap-2">
              {listening.vocab_focus.map((word, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors"
                  onClick={() => playPronunciation(word)}
                >
                  {word}
                  <Volume2 className="w-3 h-3 inline ml-1" />
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Listening Tips */}
        {listening.listening_tips && listening.listening_tips.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> IELTS Listening Tips
            </h4>
            <ul className="text-sm text-amber-700 space-y-1">
              {listening.listening_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
          </Button>
          <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
}
