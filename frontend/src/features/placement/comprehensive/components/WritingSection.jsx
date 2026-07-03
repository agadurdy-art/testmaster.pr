import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import { ChevronRight, Clock, PenTool } from 'lucide-react';
import LanguageSwitcher from './LanguageSwitcher';

// WRITING SECTION — extracted verbatim from the `stage === 'writing'` block
// of pages/ComprehensiveLevelTest.js. Closed-over values became same-named
// props.
export default function WritingSection({
  language,
  writingTasks,
  currentWritingTask,
  writingResponses,
  handleWritingChange,
  getWordCount,
  nextWritingTask,
  getProgressPercentage,
}) {
    const currentTask = writingTasks[currentWritingTask] || {
      id: 'default',
      title: 'Writing Task',
      instruction: 'Write your response below.',
      min_words: 20,
      max_words: 100,
      level: 'Band 4-6'
    };
    const currentResponse = writingResponses[currentTask.id] || '';
    const wordCount = getWordCount(currentResponse);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {language === 'vi' ? `Đánh Giá Viết - Bài ${currentWritingTask + 1} / ${writingTasks.length}` :
                 language === 'tr' ? `Yazma Değerlendirmesi - Görev ${currentWritingTask + 1} / ${writingTasks.length}` :
                 `Writing Assessment - Task ${currentWritingTask + 1} of ${writingTasks.length}`}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-amber-600">
                  {currentTask.level}
                </span>
                <LanguageSwitcher />
              </div>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <Card className="p-8 bg-white shadow-xl">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <PenTool className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-gray-900 text-lg">{currentTask.title}</h3>
              </div>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-4">
                <p className="text-gray-800 leading-relaxed">
                  {currentTask.instruction}
                </p>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentTask.time_minutes} {language === 'vi' ? 'phút' : language === 'tr' ? 'dakika' : 'minutes'}
                </span>
                <span>
                  {language === 'vi' ? 'Mục tiêu' : language === 'tr' ? 'Hedef' : 'Target'}: {currentTask.min_words}-{currentTask.max_words} {language === 'vi' ? 'từ' : language === 'tr' ? 'kelime' : 'words'}
                </span>
              </div>
            </div>

            {/* Writing Area */}
            <div className="relative">
              <textarea
                value={currentResponse}
                onChange={(e) => handleWritingChange(currentTask.id, e.target.value)}
                placeholder={
                  language === 'vi' ? 'Viết câu trả lời của bạn ở đây...' :
                  language === 'tr' ? 'Cevabınızı buraya yazın...' :
                  'Write your response here...'
                }
                className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:ring-2 focus:ring-amber-200 resize-none text-gray-800"
              />
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className={`text-sm font-medium ${
                  wordCount < currentTask.min_words ? 'text-red-500' :
                  wordCount > currentTask.max_words ? 'text-amber-500' :
                  'text-green-500'
                }`}>
                  {wordCount} / {currentTask.min_words}-{currentTask.max_words} words
                </span>
              </div>
            </div>
            
            {wordCount < currentTask.min_words && wordCount > 0 && (
              <p className="text-sm text-amber-600 mt-2">
                {language === 'vi' ? `Cần thêm ${currentTask.min_words - wordCount} từ nữa` :
                 language === 'tr' ? `${currentTask.min_words - wordCount} kelime daha gerekli` :
                 `Need ${currentTask.min_words - wordCount} more words`}
              </p>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                onClick={nextWritingTask}
                size="lg"
                className="bg-amber-600 hover:bg-amber-700"
                disabled={wordCount < 5}
              >
                {currentWritingTask < writingTasks.length - 1 ? 'Next Task' : 'Continue to Speaking'}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
}
