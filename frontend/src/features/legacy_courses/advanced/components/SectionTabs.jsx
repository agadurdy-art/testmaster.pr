import React from 'react';
import { Button } from '../../../../components/ui/button';
import {
  BookOpen, Brain, Headphones, Target, Mic, PenTool, HelpCircle, CheckCircle
} from 'lucide-react';
import { isSectionCompleted } from '../../../../lib/progressTracker';

export default function SectionTabs({
  selectedModule,
  currentSection,
  setCurrentSection,
}) {
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Brain, label: 'Grammar' },
      { id: 'listening', icon: Headphones, label: 'Listening' },
      { id: 'reading', icon: Target, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {sections.map(s => {
          const sectionComplete = selectedModule ? isSectionCompleted('advanced', selectedModule.module_number, s.id) : false;
          return (
            <Button
              key={s.id}
              variant={currentSection === s.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentSection(s.id)}
              className={`${currentSection === s.id ? 'bg-gradient-to-r from-amber-500 to-orange-600 border-0' : ''} ${sectionComplete ? 'border-green-400' : ''}`}
            >
              {sectionComplete ? (
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              ) : (
                <s.icon className="w-4 h-4 mr-2" />
              )}
              {s.label}
            </Button>
          );
        })}
      </div>
    );
}
