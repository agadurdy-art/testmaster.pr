import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Progress } from '../../../../components/ui/progress';
import {
  Mic, CheckCircle, BookOpen, AlertCircle, Lightbulb, Headphones, PenTool,
} from 'lucide-react';
import LocateExplain from '../../../../components/test/LocateExplain';

// Single Skill Specific Feedback — the per-skill detailed results blocks
// (reading / listening / writing / speaking), extracted verbatim from the
// results screen of pages/ComprehensiveLevelTest.js. Rendered by
// ResultsScreen only when `isSingleSkillTest && !isStillEvaluating`.
export default function SingleSkillFeedback({
  testMode,
  results,
  language,
  readingQuestions,
  readingAnswers,
}) {
  return (
            <div className="mb-8">
              {/* Reading specific feedback */}
              {testMode === 'reading' && results.reading && (
                <div className="space-y-6">
                  {/* Score Overview */}
                  <Card className="p-6 bg-white shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                    </h3>
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'vi' ? 'Điểm' : language === 'tr' ? 'Puan' : 'Score'}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {results.reading.correct}/{results.reading.total} {language === 'vi' ? 'đúng' : language === 'tr' ? 'doğru' : 'correct'}
                        </span>
                      </div>
                      <Progress value={(results.reading.correct / results.reading.total) * 100} className="h-2" />
                    </div>
                    {results.reading.skill_breakdown && Object.keys(results.reading.skill_breakdown).length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {language === 'vi' ? 'Phân tích kỹ năng:' : language === 'tr' ? 'Beceri Dağılımı:' : 'Skill Breakdown:'}
                        </p>
                        {Object.entries(results.reading.skill_breakdown).map(([skill, data]) => (
                          <div key={skill} className="flex justify-between items-center text-sm">
                            <span className="text-gray-600 capitalize">{skill.replace(/_/g, ' ')}</span>
                            <span className={`font-medium ${data.correct === data.total ? 'text-green-600' : 'text-amber-600'}`}>
                              {data.correct}/{data.total}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* Locate & Explain - Question by Question Review */}
                  <Card className="p-6 bg-white shadow-lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      {language === 'vi' ? 'Đáp Án Chi Tiết' : language === 'tr' ? 'Detaylı Cevap İncelemesi' : 'Answer Review - Locate & Explain'}
                    </h3>
                    <div className="space-y-2">
                      {readingQuestions.map((q, idx) => {
                        const userAnswer = q.user_answer || readingAnswers[q.id];
                        const correctKey = q.correct_answer || q.correct;
                        const isCorrect = q.is_correct !== undefined ? q.is_correct : (userAnswer === correctKey);
                        const userAnswerText = q.options?.find(opt => opt.startsWith(userAnswer))?.substring(3) || userAnswer;
                        const correctAnswerText = q.options?.find(opt => opt.startsWith(correctKey))?.substring(3) || correctKey;
                        
                        return (
                          <LocateExplain
                            key={q.id}
                            questionNumber={idx + 1}
                            questionText={q.question}
                            userAnswer={userAnswerText}
                            correctAnswer={correctAnswerText}
                            isCorrect={isCorrect}
                            passageExcerpt={q.passageExcerpt}
                            explanation={q.explanation}
                            wrongExplanation={!isCorrect ? `You selected "${userAnswerText}" but the passage indicates "${correctAnswerText}".` : null}
                            skillTip={q.skillTip}
                            language={language}
                          />
                        );
                      })}
                    </div>
                  </Card>
                </div>
              )}

              {/* Listening specific feedback */}
              {testMode === 'listening' && results.listening && (
                <div className="space-y-6">
                  {/* Overall Feedback */}
                  <Card className="p-6 bg-white shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Headphones className="w-5 h-5 text-cyan-600" />
                      {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                    </h3>
                    
                    {/* Score Overview */}
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {language === 'vi' ? 'Điểm' : language === 'tr' ? 'Puan' : 'Score'}
                        </span>
                        <span className="text-sm font-bold text-cyan-600">
                          {results.listening.correct}/{results.listening.total} {language === 'vi' ? 'đúng' : language === 'tr' ? 'doğru' : 'correct'} ({results.listening.percentage?.toFixed(0)}%)
                        </span>
                      </div>
                      <Progress value={results.listening.percentage || 0} className="h-2" />
                    </div>
                    
                    {/* Overall Feedback Message */}
                    {results.listening.overall_feedback && (
                      <p className="text-sm text-gray-700 bg-cyan-50 p-3 rounded-lg mb-4">
                        {results.listening.overall_feedback}
                      </p>
                    )}
                    
                    {/* Skill Breakdown */}
                    {results.listening.skill_breakdown && results.listening.skill_breakdown.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {language === 'vi' ? 'Phân tích kỹ năng:' : language === 'tr' ? 'Beceri Dağılımı:' : 'Skill Breakdown:'}
                        </p>
                        <div className="space-y-2">
                          {results.listening.skill_breakdown.map((skill, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-600">{skill.label}</span>
                              <span className={`font-medium ${skill.correct === skill.total ? 'text-green-600' : skill.correct > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                {skill.correct}/{skill.total}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Question-by-Question Review */}
                  {results.listening.question_results && results.listening.question_results.length > 0 && (
                    <Card className="p-6 bg-white shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-cyan-600" />
                        {language === 'vi' ? 'Đáp Án Chi Tiết' : language === 'tr' ? 'Detaylı Cevaplar' : 'Answer Review'}
                      </h3>
                      <div className="space-y-4">
                        {results.listening.question_results.map((q, idx) => (
                          <div key={idx} className={`p-4 rounded-lg border-l-4 ${q.is_correct ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-medium text-gray-900 text-sm flex-1">{idx + 1}. {q.question_text}</p>
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${q.is_correct ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                {q.is_correct ? (language === 'vi' ? 'Đúng' : language === 'tr' ? 'Doğru' : 'Correct') : (language === 'vi' ? 'Sai' : language === 'tr' ? 'Yanlış' : 'Incorrect')}
                              </span>
                            </div>
                            <div className="text-sm space-y-1">
                              <p className="text-gray-600">
                                <span className="font-medium">{language === 'vi' ? 'Câu trả lời của bạn:' : language === 'tr' ? 'Cevabınız:' : 'Your answer:'}</span> 
                                <span className={q.is_correct ? 'text-green-700' : 'text-red-700'}> {q.user_answer}</span>
                              </p>
                              {!q.is_correct && (
                                <p className="text-gray-600">
                                  <span className="font-medium">{language === 'vi' ? 'Đáp án đúng:' : language === 'tr' ? 'Doğru cevap:' : 'Correct answer:'}</span> 
                                  <span className="text-green-700"> {q.correct_option_text || q.correct_answer}</span>
                                </p>
                              )}
                              {q.explanation && (
                                <div className="mt-2 p-2 bg-white rounded border">
                                  <p className="text-xs text-gray-500 font-medium mb-1">
                                    {language === 'vi' ? 'Giải thích:' : language === 'tr' ? 'Açıklama:' : 'Explanation:'}
                                  </p>
                                  <p className="text-xs text-gray-700">{q.explanation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Skill Improvement Guidance */}
                  {results.listening.skill_guidance && results.listening.skill_guidance.length > 0 && (
                    <Card className="p-6 bg-white shadow-lg">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-amber-500" />
                        {language === 'vi' ? 'Hướng Dẫn Cải Thiện' : language === 'tr' ? 'İyileştirme Rehberi' : 'Improvement Guidance'}
                      </h3>
                      <div className="space-y-3">
                        {results.listening.skill_guidance.map((item, idx) => (
                          <div key={idx} className="p-3 bg-amber-50 rounded-lg">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">{item.skill}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                {item.priority === 'high' ? (language === 'vi' ? 'Ưu tiên' : language === 'tr' ? 'Öncelikli' : 'Priority') : (language === 'vi' ? 'Khuyến nghị' : language === 'tr' ? 'Önerilen' : 'Recommended')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{item.tip}</p>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}

                  {/* Course Recommendations */}
                  {results.listening.course_recommendations && results.listening.course_recommendations.length > 0 && (
                    <Card className="p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-cyan-600" />
                        {language === 'vi' ? 'Khóa Học Đề Xuất' : language === 'tr' ? 'Önerilen Kurslar' : 'Recommended Courses'}
                      </h3>
                      <div className="space-y-3">
                        {results.listening.course_recommendations.map((course, idx) => (
                          <div key={idx} className="p-4 bg-white rounded-lg shadow-sm">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900">{course.name}</h4>
                                <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                  {language === 'vi' ? 'Thời lượng:' : language === 'tr' ? 'Süre:' : 'Duration:'} {course.duration}
                                </p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded-full ${course.priority === 'recommended' ? 'bg-cyan-100 text-cyan-700' : 'bg-gray-100 text-gray-600'}`}>
                                {course.priority === 'recommended' ? (language === 'vi' ? 'Đề xuất' : language === 'tr' ? 'Önerilen' : 'Recommended') : (language === 'vi' ? 'Bổ sung' : language === 'tr' ? 'Ek' : 'Supplementary')}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {/* Writing specific feedback */}
              {testMode === 'writing' && results.writing && (
                <Card className="p-6 bg-white shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PenTool className="w-5 h-5 text-amber-600" />
                    {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                  </h3>
                  {results.writing.task_evaluations && results.writing.task_evaluations.map((task, idx) => (
                    <div key={idx} className="mb-4 p-4 bg-amber-50 rounded-lg">
                      <p className="font-medium text-gray-900 mb-2">
                        {language === 'vi' ? `Bài ${idx + 1}` : language === 'tr' ? `Görev ${idx + 1}` : `Task ${idx + 1}`}: Band {task.band_score?.toFixed(1)}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">{task.feedback}</p>
                      <p className="text-xs text-gray-500">
                        {language === 'vi' ? 'Số từ' : language === 'tr' ? 'Kelime sayısı' : 'Word count'}: {task.word_count}
                      </p>
                    </div>
                  ))}
                  {results.writing.top_tips && results.writing.top_tips.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600" />
                        {language === 'vi' ? 'Gợi ý cải thiện:' : language === 'tr' ? 'İyileştirme ipuçları:' : 'Improvement Tips:'}
                      </p>
                      <ul className="space-y-1">
                        {results.writing.top_tips.map((tip, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-amber-500">•</span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}

              {/* Speaking specific feedback */}
              {testMode === 'speaking' && results.speaking && (
                <Card className="p-6 bg-white shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mic className="w-5 h-5 text-purple-600" />
                    {language === 'vi' ? 'Kết Quả Chi Tiết' : language === 'tr' ? 'Detaylı Sonuçlar' : 'Detailed Results'}
                  </h3>
                  <div className={`mb-4 p-3 rounded-lg text-sm ${
                    results.speaking.pronunciation_estimated
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-green-50 text-green-800 border border-green-200'
                  }`}>
                    {results.speaking.pronunciation_estimated ? (
                      language === 'vi'
                        ? 'Phát âm hiện đang là điểm ước tính từ transcript. Để có đánh giá phát âm đáng tin cậy hơn, cần phân tích âm thanh.'
                        : language === 'tr'
                          ? 'Telaffuz şu anda transcript üzerinden tahmin ediliyor. Daha güvenilir telaffuz puanı için ses analizi gerekir.'
                          : 'Pronunciation is currently estimated from the transcript. Reliable pronunciation scoring requires acoustic audio analysis.'
                    ) : (
                      language === 'vi'
                        ? 'Điểm phát âm này có hỗ trợ từ phân tích âm thanh Azure.'
                        : language === 'tr'
                          ? 'Telaffuz puanı Azure ses analizi ile desteklendi.'
                          : 'This pronunciation score is supported by Azure acoustic analysis.'
                    )}
                  </div>
                  {results.speaking.criteria_scores && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      {Object.entries(results.speaking.criteria_scores).map(([criterion, score]) => (
                        <div key={criterion} className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{criterion.replace(/_/g, ' ')}</p>
                          <p className="text-lg font-bold text-purple-600">{score?.toFixed(1) || 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.speaking.azure_scores && (
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {Object.entries(results.speaking.azure_scores).map(([metric, score]) => (
                        <div key={metric} className="p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-gray-500 capitalize">{metric.replace(/_/g, ' ')}</p>
                          <p className="text-lg font-bold text-green-700">{score}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {results.speaking.feedback && (
                    <p className="text-sm text-gray-600 mb-4">{results.speaking.feedback}</p>
                  )}
                  {results.speaking.acoustic_warnings && results.speaking.acoustic_warnings.length > 0 && (
                    <p className="text-xs text-gray-500 mb-4">
                      {results.speaking.acoustic_warnings[0]}
                    </p>
                  )}
                  {results.speaking.weaknesses && results.speaking.weaknesses.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-900 mb-2">
                        {language === 'vi' ? 'Điểm cần cải thiện:' : language === 'tr' ? 'Geliştirilecek alanlar:' : 'Areas to Improve:'}
                      </p>
                      <ul className="space-y-1">
                        {results.speaking.weaknesses.map((weakness, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            {weakness}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )}
            </div>
  );
}
