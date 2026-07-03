import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import { ChevronRight, CheckCircle, Headphones } from 'lucide-react';
import AudioPlayer from '../../../../components/AudioPlayer';
import LanguageSwitcher from './LanguageSwitcher';

// LISTENING SECTION — extracted verbatim from the `stage === 'listening'`
// block of pages/ComprehensiveLevelTest.js. Closed-over values became
// same-named props. Audio playback stays inside AudioPlayer exactly as
// before; this component only reports "played at least once".
export default function ListeningSection({
  language,
  getListeningSections,
  currentListeningSection,
  listeningAnswers,
  audioPlayed,
  handleListeningAnswer,
  markSectionAudioPlayed,
  nextListeningSection,
  getProgressPercentage,
}) {
    const sections = getListeningSections();
    const currentSection = sections[currentListeningSection] || { questions: [], title: 'Loading...' };
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-teal-50 to-emerald-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Nghe - Phần ${currentListeningSection + 1} / ${sections.length}` :
                 language === 'tr' ? `Dinleme Değerlendirmesi - Bölüm ${currentListeningSection + 1} / ${sections.length}` :
                 `Listening Assessment - Section ${currentListeningSection + 1} of ${sections.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-cyan-600">
                  {language === 'vi' ? 'Cấp độ' : language === 'tr' ? 'Seviye' : 'Level'}: {currentSection.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            {/* Section Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Headphones className="w-5 h-5 text-cyan-600" />
                <h3 className="font-semibold text-gray-700">{currentSection.title}</h3>
                <span className="text-xs px-2 py-1 bg-cyan-100 text-cyan-700 rounded-full">
                  {currentSection.band_range}
                </span>
              </div>
              
              {/* Audio Player */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-3">
                  {language === 'vi' ? 'Nghe đoạn ghi âm và trả lời các câu hỏi bên dưới:' :
                   language === 'tr' ? 'Ses kaydını dinleyin ve aşağıdaki soruları cevaplayın:' :
                   'Listen to the recording and answer the questions below:'}
                </p>
                <AudioPlayer
                  src={currentSection.audio_url}
                  persistKey={`comprehensive-level-test:${currentSection.id}`}
                  onEnded={() => markSectionAudioPlayed(currentSection.id)}
                />
                {audioPlayed[currentSection.id] && (
                  <span className="text-xs text-green-600 flex items-center gap-1 mt-2">
                    <CheckCircle className="w-3 h-3" /> Audio played
                  </span>
                )}
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentSection.questions.map((q, idx) => (
                <div key={q.id} className="border-b pb-6 last:border-b-0">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {idx + 1}. {q.question}
                  </h4>
                  <div className="space-y-2">
                    {q.options.map((option) => {
                      const optionLetter = option.charAt(0);
                      const isSelected = listeningAnswers[q.id] === optionLetter;
                      
                      return (
                        <button
                          key={option}
                          onClick={() => handleListeningAnswer(q.id, optionLetter)}
                          className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50'
                              : 'border-gray-200 hover:border-cyan-300 hover:bg-cyan-50/50'
                          }`}
                        >
                          <span className={`font-medium ${isSelected ? 'text-cyan-700' : 'text-gray-700'}`}>
                            {option}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                onClick={nextListeningSection}
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {currentListeningSection < sections.length - 1 ? 'Next Section' : 'Continue to Writing'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
}
