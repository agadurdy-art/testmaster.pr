import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Headphones, Play, Pause, RotateCcw, AlertCircle, HelpCircle,
  BookOpen, Lightbulb, CheckCircle, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function ListeningSection({
  selectedModule,
  listeningAudioRef,
  isPlayingListening,
  setIsPlayingListening,
  listeningProgress,
  setListeningProgress,
  showTranscript,
  setShowTranscript,
  bgCard,
  bgSubtle,
  textPrimary,
  textSecondary,
  setCurrentSection,
}) {
    const listening = selectedModule?.listening;
    const moduleNum = selectedModule?.module_number;
    const audioPath = `/audio/advanced_mastery/module_${moduleNum}_listening.mp3`;
    
    const handlePlayPause = () => {
      if (listeningAudioRef.current) {
        if (isPlayingListening) {
          listeningAudioRef.current.pause();
        } else {
          listeningAudioRef.current.play();
        }
        setIsPlayingListening(!isPlayingListening);
      }
    };
    
    const handleRestart = () => {
      if (listeningAudioRef.current) {
        listeningAudioRef.current.currentTime = 0;
        setListeningProgress(0);
        setIsPlayingListening(false);
      }
    };
    
    const handleTimeUpdate = () => {
      if (listeningAudioRef.current) {
        const progress = (listeningAudioRef.current.currentTime / listeningAudioRef.current.duration) * 100;
        setListeningProgress(progress || 0);
      }
    };
    
    const handleEnded = () => {
      setIsPlayingListening(false);
      setListeningProgress(100);
    };
    
    // Check if audio exists for this module (only first 5 modules have audio)
    const hasAudio = moduleNum >= 1 && moduleNum <= 20;
    
    if (!listening) {
      return (
        <Card id="listening-section" className={`p-6 ${bgCard} border-0 shadow-lg scroll-mt-24`}>
          <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
            <Headphones className="w-5 h-5 text-purple-600" /> Academic Listening
          </h3>
          <div className="text-center py-8">
            <Headphones className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className={textSecondary}>Listening content is coming soon for this module.</p>
            {hasAudio && (
              <div className="mt-4">
                <p className={`text-sm ${textSecondary}`}>Audio file is available. Content will be added shortly.</p>
                <audio 
                  ref={listeningAudioRef}
                  src={audioPath}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleEnded}
                  className="hidden"
                />
                <Button 
                  onClick={handlePlayPause}
                  className="mt-3 bg-purple-600 hover:bg-purple-700"
                >
                  {isPlayingListening ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  {isPlayingListening ? 'Pause' : 'Play Audio Preview'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      );
    }
    
    return (
      <Card id="listening-section" className={`p-6 ${bgCard} border-0 shadow-lg scroll-mt-24`}>
        <h3 className={`text-xl font-bold ${textPrimary} mb-4 flex items-center gap-2`}>
          <Headphones className="w-5 h-5 text-purple-600" /> {listening.title || 'Academic Listening'}
        </h3>
        
        {/* Audio Player */}
        {hasAudio && (
          <div className="mb-6 p-4 bg-purple-50 rounded-xl">
            <audio 
              ref={listeningAudioRef}
              src={audioPath}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              className="hidden"
            />
            
            <div className="flex items-center gap-4 mb-3">
              <Button 
                onClick={handlePlayPause}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium"
                size="sm"
              >
                {isPlayingListening ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isPlayingListening ? 'Pause' : 'Play'}
              </Button>
              <Button 
                onClick={handleRestart}
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Restart
              </Button>
              <div className="flex-1">
                <div className="h-2 bg-purple-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 transition-all duration-300"
                    style={{ width: `${listeningProgress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm text-purple-700 font-medium">
                {listening.duration || '~3 min'}
              </span>
            </div>
            
            <p className="text-sm text-purple-700">
              🎧 {listening.introduction || 'Listen to the academic lecture and answer the questions below.'}
            </p>
          </div>
        )}
        
        {!hasAudio && (
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Audio for this module is being generated. Read the transcript below and answer the questions.
            </p>
          </div>
        )}
        
        {/* Transcript Toggle */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setShowTranscript(!showTranscript)}
            className="mb-3"
          >
            {showTranscript ? 'Hide Transcript' : 'Show Transcript'}
          </Button>
          
          {showTranscript && listening.transcript && (
            <div className={`p-4 ${bgSubtle} rounded-xl text-sm ${textSecondary} leading-relaxed max-h-64 overflow-y-auto`}>
              {listening.transcript}
            </div>
          )}
        </div>
        
        {/* Comprehension Questions */}
        {listening.questions && listening.questions.length > 0 && (
          <div className="space-y-4 mb-6">
            <h4 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
              <HelpCircle className="w-4 h-4 text-purple-600" /> Comprehension Questions
            </h4>
            {listening.questions.map((q, idx) => (
              <div key={idx} className={`p-4 ${bgSubtle} rounded-xl`}>
                <p className={`font-medium ${textPrimary} mb-2`}>
                  {q.number || idx + 1}. {q.question}
                </p>
                
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2 mb-3">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className={`flex items-center gap-2 text-sm ${textSecondary} cursor-pointer`}>
                        <input type="radio" name={`listening_q_${idx}`} value={opt} className="accent-purple-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                
                {(q.type === 'completion' || q.type === 'fill_blank') && (
                  <div className="mb-3">
                    <input 
                      type="text" 
                      placeholder={q.word_limit ? `Max ${q.word_limit} words` : "Your answer..."}
                      className="w-full p-2 border rounded text-sm"
                    />
                  </div>
                )}
                
                {q.type === 'true_false' && (
                  <div className="space-y-2 mb-3">
                    {['True', 'False'].map((opt) => (
                      <label key={opt} className={`flex items-center gap-2 text-sm ${textSecondary} cursor-pointer`}>
                        <input type="radio" name={`listening_q_${idx}`} value={opt} className="accent-purple-600" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                
                <details className="mt-2">
                  <summary className="text-xs text-purple-600 cursor-pointer hover:underline">Show Answer</summary>
                  <div className="mt-1 p-2 bg-green-50 rounded text-xs">
                    <p className="text-green-700 font-medium">✓ {q.answer}</p>
                    {q.explanation && <p className="text-gray-600 mt-1">{q.explanation}</p>}
                  </div>
                </details>
              </div>
            ))}
          </div>
        )}
        
        {/* Vocabulary Focus */}
        {listening.vocabulary_focus && listening.vocabulary_focus.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Key Vocabulary from Lecture
            </h4>
            <div className="grid gap-2">
              {listening.vocabulary_focus.map((v, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg">
                  <span className="font-medium text-blue-900">{v.word}</span>
                  <span className="text-gray-600 text-sm ml-2">- {v.definition}</span>
                  {v.context && <p className="text-xs text-gray-500 mt-1 italic">{v.context}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Listening Tips */}
        {listening.listening_tips && listening.listening_tips.length > 0 && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <Lightbulb className="w-4 h-4" /> Listening Tips
            </h4>
            <ul className="space-y-1">
              {listening.listening_tips.map((tip, idx) => (
                <li key={idx} className="text-sm text-amber-700 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
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
          <Button onClick={() => setCurrentSection('reading')} className="bg-gradient-to-r from-amber-500 to-orange-600">
            Next: Reading <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
}
