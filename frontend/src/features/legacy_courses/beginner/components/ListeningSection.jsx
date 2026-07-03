import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Headphones, Play, Pause, CheckCircle, XCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ListeningSection({
  selectedLesson,
  listeningAnswers,
  setListeningAnswers,
  listeningSubmitted,
  setListeningSubmitted,
  listeningScore,
  setListeningScore,
  isPlayingListening,
  setIsPlayingListening,
  showTranscript,
  setShowTranscript,
  setCurrentSection,
}) {
    const listening = selectedLesson?.listening;
    if (!listening) return (
      <Card className="p-6 text-center">
        <Headphones className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">No listening content available for this lesson.</p>
        <Button onClick={() => setCurrentSection('reading')} className="mt-4">
          Continue to Reading <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </Card>
    );

    const handleListeningAnswer = (qIndex, answer) => {
      if (listeningSubmitted) return;
      setListeningAnswers({ ...listeningAnswers, [qIndex]: answer });
    };

    const submitListeningQuiz = () => {
      let correct = 0;
      listening.questions.forEach((q, idx) => {
        if (listeningAnswers[idx] === q.answer) {
          correct++;
        }
      });
      setListeningScore(correct);
      setListeningSubmitted(true);
      toast.success(`You got ${correct}/${listening.questions.length} correct!`);
    };

    const playListeningAudio = async () => {
      if (isPlayingListening) {
        // Stop currently playing audio
        if (window.currentListeningAudio) {
          window.currentListeningAudio.pause();
          window.currentListeningAudio = null;
        }
        setIsPlayingListening(false);
        return;
      }
      
      setIsPlayingListening(true);
      
      try {
        // Use pre-generated local audio files (much faster!)
        const lessonNum = selectedLesson.lesson_number;
        const audioUrl = `/audio/listening/lesson-${lessonNum}.mp3`;
        
        const audio = new Audio(audioUrl);
        window.currentListeningAudio = audio;
        
        audio.onloadeddata = () => {
          toast.success('Playing audio', { duration: 1500 });
        };
        
        audio.onended = () => {
          setIsPlayingListening(false);
          window.currentListeningAudio = null;
        };
        
        audio.onerror = async () => {
          // Fallback to API if local file not found
          console.log('Local audio not found, fetching from API...');
          try {
            const response = await fetch(`${API_URL}/api/beginner-english/listening-audio/${selectedLesson.id}`);
            const data = await response.json();
            
            if (data.success && data.audio_base64) {
              const audioBlob = new Blob(
                [Uint8Array.from(atob(data.audio_base64), c => c.charCodeAt(0))],
                { type: 'audio/mp3' }
              );
              const blobUrl = URL.createObjectURL(audioBlob);
              const fallbackAudio = new Audio(blobUrl);
              
              window.currentListeningAudio = fallbackAudio;
              fallbackAudio.onended = () => {
                setIsPlayingListening(false);
                URL.revokeObjectURL(blobUrl);
                window.currentListeningAudio = null;
              };
              
              await fallbackAudio.play();
              toast.success('Playing audio');
            } else {
              throw new Error('API fallback failed');
            }
          } catch (apiError) {
            setIsPlayingListening(false);
            toast.error('Audio not available');
            window.currentListeningAudio = null;
          }
        };
        
        await audio.play();
      } catch (error) {
        console.error('Audio error:', error);
        setIsPlayingListening(false);
        toast.error('Failed to play audio');
        window.currentListeningAudio = null;
      }
    };

    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-600" />
          Listening Practice: {listening.title}
        </h3>

        {/* Tips */}
        {listening.tips && listening.tips.length > 0 && (
          <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-sm font-medium text-purple-700 mb-1">💡 Listening Tips:</p>
            <ul className="text-sm text-purple-600 space-y-1">
              {listening.tips.map((tip, i) => (
                <li key={i}>• {tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Audio Player */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-gray-700">
              🎧 Listen to the conversation carefully, then answer the questions below.
            </p>
            <Button
              onClick={playListeningAudio}
              className={`${isPlayingListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} text-white`}
            >
              {isPlayingListening ? (
                <>
                  <Pause className="w-4 h-4 mr-2" /> Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" /> Play Audio
                </>
              )}
            </Button>
          </div>
          
          {/* Show Transcript Toggle */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowTranscript(!showTranscript)}
            className="text-xs"
          >
            {showTranscript ? 'Hide Transcript' : 'Show Transcript (after listening)'}
          </Button>
          
          {showTranscript && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 max-h-60 overflow-y-auto">
              <p className="text-sm text-gray-700 whitespace-pre-line">{listening.transcript}</p>
            </div>
          )}
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <h4 className="font-semibold text-gray-800">Questions</h4>
          {listening.questions.map((q, qIdx) => (
            <div key={qIdx} className={`p-4 rounded-lg border ${
              listeningSubmitted 
                ? listeningAnswers[qIdx] === q.answer 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
                : 'bg-gray-50 border-gray-200'
            }`}>
              <p className="font-medium text-gray-800 mb-3">
                {qIdx + 1}. {q.question}
              </p>
              
              <div className="space-y-2">
                {q.options.map((option, oIdx) => (
                  <label 
                    key={oIdx} 
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                      listeningSubmitted
                        ? option === q.answer
                          ? 'bg-green-100 text-green-800'
                          : listeningAnswers[qIdx] === option
                            ? 'bg-red-100 text-red-800'
                            : 'bg-white'
                        : listeningAnswers[qIdx] === option
                          ? 'bg-purple-100'
                          : 'hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`listening-q-${qIdx}`}
                      checked={listeningAnswers[qIdx] === option}
                      onChange={() => handleListeningAnswer(qIdx, option)}
                      disabled={listeningSubmitted}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm">{option}</span>
                    {listeningSubmitted && option === q.answer && (
                      <CheckCircle className="w-4 h-4 text-green-600 ml-auto" />
                    )}
                    {listeningSubmitted && listeningAnswers[qIdx] === option && option !== q.answer && (
                      <XCircle className="w-4 h-4 text-red-600 ml-auto" />
                    )}
                  </label>
                ))}
              </div>
              
              {listeningSubmitted && (
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium">Correct answer:</span> {q.answer}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Submit / Results */}
        {!listeningSubmitted ? (
          <Button 
            onClick={submitListeningQuiz}
            disabled={Object.keys(listeningAnswers).length < listening.questions.length}
            className="mt-6 w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Submit Answers
          </Button>
        ) : (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl text-center">
            <div className="text-4xl mb-2">
              {listeningScore === listening.questions.length ? '🎧🏆' : 
               listeningScore >= listening.questions.length / 2 ? '🎧⭐' : '🎧💪'}
            </div>
            <p className="text-lg font-bold text-gray-800">
              You got {listeningScore} out of {listening.questions.length}!
            </p>
            <p className="text-sm text-gray-600">
              {listeningScore === listening.questions.length 
                ? 'WOW! Perfect score! Your ears are amazing! 🎉' 
                : listeningScore >= listening.questions.length / 2
                  ? 'Nice listening! You heard a lot of the words! 👍'
                  : 'Good try! Listen again and you\'ll hear more! 💪'}
            </p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="outline" onClick={() => setCurrentSection('grammar')}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Grammar
          </Button>
          <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
}
