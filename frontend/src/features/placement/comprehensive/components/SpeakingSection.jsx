import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import {
  Mic, Square, ChevronRight, CheckCircle, MessageSquare, Sparkles, Clock,
} from 'lucide-react';
import { speakingPrompts } from '../constants';
import LanguageSwitcher from './LanguageSwitcher';

// SPEAKING SECTION — extracted verbatim from the `stage === 'speaking'`
// block of pages/ComprehensiveLevelTest.js. Closed-over values became
// same-named props. Recording / timer / transcription logic stays in the
// orchestrator (ComprehensiveLevelTestPage) — this is presentation only.
export default function SpeakingSection({
  language,
  currentSpeakingPrompt,
  speakingResponses,
  setSpeakingResponses,
  recording,
  transcribing,
  currentTranscript,
  setCurrentTranscript,
  setAudioBlob,
  timeRemaining,
  formatTime,
  startRecording,
  stopRecording,
  nextSpeakingPrompt,
  getProgressPercentage,
}) {
    const currentPrompt = speakingPrompts[currentSpeakingPrompt];
    const hasResponse = speakingResponses[currentSpeakingPrompt];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Nói - Câu ${currentSpeakingPrompt + 1} / ${speakingPrompts.length}` :
                 language === 'tr' ? `Konuşma Değerlendirmesi - Soru ${currentSpeakingPrompt + 1} / ${speakingPrompts.length}` :
                 `Speaking Assessment - Question ${currentSpeakingPrompt + 1} of ${speakingPrompts.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-purple-600">
                  {language === 'vi' ? 'Cấp độ' : language === 'tr' ? 'Seviye' : 'Level'}: {currentPrompt.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-700">
                  {language === 'vi' ? 'Câu Hỏi Nói' : language === 'tr' ? 'Konuşma Sorusu' : 'Speaking Prompt'}
                </h3>
              </div>
              <p className="text-gray-900 text-lg leading-relaxed mb-4">
                {currentPrompt.prompt}
              </p>
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>{currentPrompt.tip}</span>
              </div>
            </div>

            {recording && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-red-700 font-medium">
                      {language === 'vi' ? 'Đang ghi...' : language === 'tr' ? 'Kaydediliyor...' : 'Recording...'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700 font-mono">
                    <Clock className="w-4 h-4" />
                    {formatTime(timeRemaining)}
                  </div>
                </div>
              </div>
            )}

            {transcribing && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
                  <span className="text-blue-700 font-medium">
                    {language === 'vi' ? 'Đang chuyển đổi câu trả lời...' : language === 'tr' ? 'Yanıtınız yazıya çevriliyor...' : 'Transcribing your response...'}
                  </span>
                </div>
              </div>
            )}

            {currentTranscript && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  {language === 'vi' ? 'Câu trả lời của bạn:' :
                   language === 'tr' ? 'Cevabınız:' :
                   'Your Response:'}
                </h4>
                <p className="text-green-800 text-sm leading-relaxed mb-3">
                  {currentTranscript}
                </p>
                <div className="flex items-center gap-2 text-xs text-green-700">
                  <span>
                    {language === 'vi' ? `${currentTranscript.split(' ').length} từ` :
                     language === 'tr' ? `${currentTranscript.split(' ').length} kelime` :
                     `${currentTranscript.split(' ').length} words`}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {!recording && !hasResponse && (
                <Button
                  onClick={startRecording}
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  {language === 'vi' ? 'Bắt đầu ghi âm' :
                   language === 'tr' ? 'Kaydı Başlat' :
                   'Start Recording'}
                </Button>
              )}
              
              {recording && (
                <Button
                  onClick={stopRecording}
                  size="lg"
                  className="flex-1 bg-gray-800 hover:bg-gray-900 text-white"
                >
                  <Square className="w-5 h-5 mr-2" />
                  {language === 'vi' ? 'Dừng ghi âm' :
                   language === 'tr' ? 'Kaydı Durdur' :
                   'Stop Recording'}
                </Button>
              )}

              {hasResponse && (
                <>
                  <Button
                    onClick={() => {
                      setAudioBlob(null);
                      setCurrentTranscript('');
                      const updatedResponses = [...speakingResponses];
                      updatedResponses[currentSpeakingPrompt] = null;
                      setSpeakingResponses(updatedResponses);
                    }}
                    size="lg"
                    variant="outline"
                    className="border-2 border-red-500 text-red-600 hover:bg-red-50"
                  >
                    {language === 'vi' ? 'Ghi lại' :
                     language === 'tr' ? 'Tekrar Kaydet' :
                     'Record Again'}
                  </Button>
                  <Button
                    onClick={nextSpeakingPrompt}
                    size="lg"
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    {currentSpeakingPrompt < speakingPrompts.length - 1 ? 
                      (language === 'vi' ? 'Câu tiếp theo' :
                       language === 'tr' ? 'Sonraki Soru' :
                       'Next Question') : 
                      (language === 'vi' ? 'Hoàn thành đánh giá' :
                       language === 'tr' ? 'Değerlendirmeyi Tamamla' :
                       'Complete Assessment')}
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    );
}
