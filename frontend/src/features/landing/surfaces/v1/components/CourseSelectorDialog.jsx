// CourseSelectorDialog — the "Try Our Lessons" course selector, verbatim from
// pages/LandingPage.js lines 1048-1181 (Faz1 wave 10). Closed-over values arrive as
// same-named props; COURSES comes from ../constants.
import React from 'react';
import { Button } from '../../../../../components/ui/button';
import { Card } from '../../../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../../../components/ui/dialog';
import { GraduationCap, Award } from 'lucide-react';
import { COURSES } from '../constants';

export default function CourseSelectorDialog({
  showCourseSelector, setShowCourseSelector, courseLessons, language, navigate, setShowAuth, t,
}) {
  return (
      <Dialog open={showCourseSelector} onOpenChange={setShowCourseSelector}>
        <DialogContent className="bg-white border-gray-200 max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl text-gray-900 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-600" />
              {t('landingChooseCourse')}
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-gray-600 mb-6">{t('landingChooseCourseDesc')}</p>
          
          <div className="space-y-6">
            {COURSES.map((course) => {
              const lessons = courseLessons[course.id] || [];
              const courseName = language === 'vi' ? course.nameVi : language === 'tr' ? course.nameTr : course.name;
              const courseDesc = language === 'vi' ? course.descriptionVi : language === 'tr' ? course.descriptionTr : course.description;
              return (
                <Card key={course.id} className={`p-6 ${course.lightBg} border-0 rounded-2xl`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${course.color} flex items-center justify-center shadow-lg text-2xl`}>
                      {course.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {courseName}
                        </h3>
                        <span className="px-3 py-1 bg-white rounded-full text-sm font-bold text-gray-700 shadow-sm">
                          {course.bandRange}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {courseDesc}
                      </p>
                    </div>
                  </div>
                  
                  {lessons.length > 0 ? (
                    <div className="grid sm:grid-cols-3 gap-3">
                      {lessons.map((lesson, idx) => {
                        const isLocked = idx >= 3;
                        const lockText = {
                          en: 'Sign up to unlock',
                          vi: 'Đăng ký để mở khóa',
                          tr: 'Açmak için kayıt olun'
                        };
                        
                        return (
                          <Card
                            key={lesson.id || idx}
                            onClick={() => {
                              if (isLocked) {
                                // Show signup prompt for locked lessons
                                setShowCourseSelector(false);
                                navigate('/?signup=true');
                                return;
                              }
                              setShowCourseSelector(false);
                              // Navigate directly to the real course page with lesson parameter
                              if (course.id === 'beginner') {
                                navigate(`/beginner-course?lesson=${lesson.id}&preview=true`);
                              } else if (course.id === 'mastery') {
                                navigate(`/mastery-course?lesson=${lesson.module_number || idx + 1}&preview=true`);
                              } else if (course.id === 'advanced') {
                                navigate(`/advanced-mastery?lesson=${lesson.id || lesson.module_number || idx + 1}&preview=true`);
                              } else {
                                navigate(`${course.previewRoute}?preview=true`);
                              }
                            }}
                            className={`p-4 border-0 shadow-sm transition-all rounded-xl relative ${
                              isLocked 
                                ? 'bg-gray-100 cursor-pointer hover:bg-gray-200 opacity-75' 
                                : 'bg-white hover:shadow-lg cursor-pointer hover:-translate-y-1'
                            }`}
                          >
                            {/* Lock overlay for locked lessons */}
                            {isLocked && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/5 rounded-xl">
                                <div className="flex flex-col items-center">
                                  <svg className="w-6 h-6 text-gray-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">{lockText[language] || lockText.en}</span>
                                </div>
                              </div>
                            )}
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isLocked ? 'from-gray-400 to-gray-500' : course.color} flex items-center justify-center text-white font-bold text-sm`}>
                                {lesson.module_number || lesson.unit_number || idx + 1}
                              </div>
                              {!isLocked && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                  {t('landingFreePreview')}
                                </span>
                              )}
                            </div>
                            <h4 className={`font-semibold text-sm truncate ${isLocked ? 'text-gray-500' : 'text-gray-900'}`}>
                              {lesson.title || lesson.topic || `Lesson ${idx + 1}`}
                            </h4>
                            <p className="text-xs text-gray-500 truncate mt-1">
                              {lesson.subtitle || lesson.description || lesson.band_level || ''}
                            </p>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      {t('loading')}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-violet-50 rounded-xl border border-violet-200">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-violet-600" />
              <div>
                <p className="text-violet-800 font-medium">{t('landingMoreLessonsAvailable')}</p>
                <p className="text-violet-600 text-sm">{t('landingSignUpForMore')}</p>
              </div>
              <Button 
                onClick={() => { setShowCourseSelector(false); setShowAuth(true); }}
                className="ml-auto bg-violet-600 hover:bg-violet-700 text-white"
              >
                {t('getStarted')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
  );
}
