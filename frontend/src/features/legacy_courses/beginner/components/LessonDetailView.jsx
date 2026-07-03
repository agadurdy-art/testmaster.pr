import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  BookOpen, Languages, Headphones, FileText, Mic, PenTool,
  HelpCircle, ArrowLeft, CheckCircle
} from 'lucide-react';
import { isSectionCompleted } from '../../../../lib/progressTracker';
import { TOPIC_CONFIG } from '../constants';

export default function LessonDetailView({
  selectedLesson,
  setView,
  setSelectedLesson,
  currentSection,
  setCurrentSection,
  renderSectionContent,
}) {
    if (!selectedLesson) return null;
    const config = TOPIC_CONFIG[selectedLesson.topic] || { icon: '📖', color: 'from-gray-500 to-gray-600' };
    
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Languages, label: 'Grammar' },
      { id: 'listening', icon: Headphones, label: 'Listening' },
      { id: 'reading', icon: FileText, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          onClick={() => { setView('lessons'); setSelectedLesson(null); }}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Lessons
        </Button>
        
        {/* Lesson Header */}
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg`}>
              {config.icon}
            </div>
            <div>
              <span className="text-sm text-gray-500">Lesson {selectedLesson.lesson_number}</span>
              <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.topic}</h2>
              <p className="text-gray-600">{selectedLesson.learning_goals}</p>
            </div>
          </div>
          
          {/* Section Tabs */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const sectionComplete = isSectionCompleted('beginner', selectedLesson.lesson_number, section.id);
              return (
                <Button
                  key={section.id}
                  variant={currentSection === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSection(section.id)}
                  className={`relative ${currentSection === section.id ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : ''} ${sectionComplete ? 'border-green-400' : ''}`}
                >
                  {sectionComplete ? (
                    <CheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <section.icon className="w-4 h-4 mr-1" />
                  )}
                  {section.label}
                </Button>
              );
            })}
          </div>
        </Card>
        
        {/* Section Content */}
        {renderSectionContent()}
      </div>
    );
}
