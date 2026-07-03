import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Textarea } from '../../../../components/ui/textarea';
import {
  Mic, Square, CheckCircle, Star, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function SpeakingSection({
  selectedLesson,
  recording,
  startRecording,
  stopRecording,
  speakingResponse,
  setSpeakingResponse,
  evaluateSpeaking,
  speakingFeedback,
  setCurrentSection,
}) {
  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Mic className="w-5 h-5 text-violet-600" />
        Speaking Practice
      </h3>
      
      <div className="bg-violet-50 rounded-xl p-5 mb-6">
        <p className="text-sm text-violet-600 font-medium mb-2">Question:</p>
        <p className="text-xl text-gray-900 font-medium">{selectedLesson.speaking.question}</p>
      </div>
      
      {/* Recording Controls */}
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">Record your answer or type it below:</p>
        <div className="flex gap-3 mb-4">
          {!recording ? (
            <Button onClick={startRecording} className="bg-violet-600 hover:bg-violet-700 text-white">
              <Mic className="w-4 h-4 mr-2" /> Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} className="bg-red-500 hover:bg-red-600 text-white">
              <Square className="w-4 h-4 mr-2" /> Stop Recording
            </Button>
          )}
        </div>
        
        <Textarea
          value={speakingResponse}
          onChange={(e) => setSpeakingResponse(e.target.value)}
          placeholder="Or type your answer here..."
          className="min-h-[100px]"
        />
        
        <Button 
          onClick={evaluateSpeaking} 
          disabled={!speakingResponse.trim()}
          className="mt-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white"
        >
          Get Feedback
        </Button>
      </div>
      
      {/* Model Answer */}
      <div className="bg-green-50 rounded-xl p-4 mb-4">
        <p className="text-sm text-green-600 font-medium mb-2">Model Answer:</p>
        <p className="text-gray-800 italic">&ldquo;{selectedLesson.speaking.model_answer}&rdquo;</p>
      </div>
      
      {/* Feedback */}
      {speakingFeedback && (
        <div className={`p-4 rounded-xl ${speakingFeedback.score >= 70 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className="flex items-center gap-2 mb-2">
            {speakingFeedback.score >= 70 ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <Star className="w-5 h-5 text-yellow-600" />
            )}
            <span className="font-bold">{speakingFeedback.score}% Match</span>
          </div>
          <p className="text-gray-700">{speakingFeedback.feedback}</p>
          {speakingFeedback.tip && (
            <p className="text-sm text-gray-600 mt-2">💡 Tip: {speakingFeedback.tip}</p>
          )}
        </div>
      )}
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={() => setCurrentSection('reading')}>
          <ChevronLeft className="w-4 h-4 mr-1" /> Reading
        </Button>
        <Button onClick={() => setCurrentSection('writing')} className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          Next: Writing <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
