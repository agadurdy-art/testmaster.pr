import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { Trophy, BookOpen, Clock, ArrowLeft, Play } from 'lucide-react';
import { getCourse } from '../lib/api';
import { toast } from 'sonner';

export default function CourseDetail({ user, onLogout }) {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStart, setCurrentStart] = useState(0);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        const data = await getCourse(courseId);
        setCourse(data);
      } catch (error) {
        console.error('Failed to load course', error);
        toast.error('Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId]);

  const videoId = useMemo(() => {
    if (!course || !course.video_url) return null;
    try {
      const url = new URL(course.video_url);
      const v = url.searchParams.get('v');
      if (v) return v;
      // Fallback if full watch URL not provided
      return course.video_url.replace('https://youtu.be/', '').replace('https://www.youtube.com/embed/', '');
    } catch (e) {
      return null;
    }
  }, [course]);

  // Compute simple sequential start times for each lesson (rough segmentation)
  const lessonStarts = useMemo(() => {
    const starts = {};
    if (!course || !course.modules) return starts;

    let counter = 0;
    const chunkSeconds = 300; // 5 minutes per lesson (approx)

    course.modules.forEach((module, mIdx) => {
      (module.lessons || []).forEach((lesson, lIdx) => {
        const key = `${mIdx}-${lIdx}`;
        starts[key] = counter * chunkSeconds;
        counter += 1;
      });
    });

    return starts;
  }, [course]);

  const handleWatchLesson = (moduleIndex, lessonIndex) => {
    const key = `${moduleIndex}-${lessonIndex}`;
    const start = lessonStarts[key] || 0;
    setCurrentStart(start);
    window.scrollTo({ top: 200, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Course not found.</p>
          <Button onClick={() => navigate('/courses')}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const iframeSrc = videoId
    ? `https://www.youtube.com/embed/${videoId}?start=${currentStart}&autoplay=1`
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">IELTS Ace</h1>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/courses')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">{course.title}</h2>
          <p className="text-lg text-gray-700 max-w-3xl">{course.description}</p>
        </div>

        {/* Video Player */}
        {iframeSrc ? (
          <Card className="p-4 bg-black/5">
            <div className="aspect-video w-full max-w-4xl mx-auto">
              <iframe
                key={currentStart}
                width="100%"
                height="100%"
                src={iframeSrc}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-xs text-gray-600 mt-2 text-center">
              This video is hosted on YouTube. Each lesson below links to a relevant part of this masterclass.
            </p>
          </Card>
        ) : (
          <Card className="p-4">
            <p className="text-gray-600">Video not available for this course.</p>
          </Card>
        )}

        {/* Modules and lessons */}
        <Card className="p-6">
          <Accordion type="single" collapsible className="w-full">
            {course.modules.map((module, mIndex) => (
              <AccordionItem key={module.id || mIndex} value={`module-${module.id || mIndex}`}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-5 h-5 text-sky-500" />
                    <span className="text-lg font-semibold">{module.title}</span>
                    <span className="text-sm text-gray-600">
                      ({(module.lessons || []).length} lessons)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pl-4">
                    {(module.lessons || []).map((lesson, lIndex) => (
                      <div
                        key={lesson.id || `${mIndex}-${lIndex}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <Play className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-800 font-medium">{lesson.title}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{lesson.duration}</span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleWatchLesson(mIndex, lIndex)}
                          >
                            Watch lesson
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>
    </div>
  );
}
