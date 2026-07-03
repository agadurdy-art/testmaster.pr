import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  BookOpen, Volume2, Mic, ArrowLeft, Languages, FileText,
  PenTool, HelpCircle, Target, CheckCircle, CircleCheck
} from 'lucide-react';
import { isSectionCompleted } from '../../../../lib/progressTracker';
import { MODULE_CONFIG } from '../constants';

export default function ModuleDetailView({
  selectedModule,
  setView,
  setSelectedModule,
  currentSection,
  setCurrentSection,
  renderSectionContent,
}) {
    if (!selectedModule) return null;
    const config = MODULE_CONFIG[selectedModule.title] || { icon: '📚', color: 'from-gray-500 to-gray-600' };
    
    const sections = [
      { id: 'vocabulary', icon: BookOpen, label: 'Vocabulary' },
      { id: 'grammar', icon: Languages, label: 'Grammar' },
      { id: 'listening', icon: Volume2, label: 'Listening' },
      { id: 'reading', icon: FileText, label: 'Reading' },
      { id: 'speaking', icon: Mic, label: 'Speaking' },
      { id: 'writing', icon: PenTool, label: 'Writing' },
      { id: 'quiz', icon: HelpCircle, label: 'Quiz' }
    ];

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => { setView('modules'); setSelectedModule(null); }} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Modules
        </Button>
        
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg">
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center text-3xl shadow-lg`}>
              {config.icon}
            </div>
            <div>
              <span className="text-sm text-violet-600 font-medium">Module {selectedModule.module_number}</span>
              <h2 className="text-2xl font-bold text-gray-900">{selectedModule.title}</h2>
            </div>
          </div>
          
          {/* Learning Goals */}
          <div className="mb-4 p-4 bg-violet-50 rounded-xl">
            <h4 className="font-bold text-violet-800 mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" /> Learning Goals
            </h4>
            <ul className="text-sm text-violet-700 space-y-1">
              {selectedModule.learning_goals?.map((goal, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-violet-500 mt-0.5 flex-shrink-0" />
                  {goal}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Section Tabs with Completion Status */}
          <div className="flex flex-wrap gap-2">
            {sections.map((section) => {
              const sectionComplete = isSectionCompleted('mastery', selectedModule.module_number, section.id);
              return (
                <Button
                  key={section.id}
                  variant={currentSection === section.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentSection(section.id)}
                  className={`relative ${currentSection === section.id ? 'bg-gradient-to-r from-violet-500 to-purple-600' : ''} ${sectionComplete ? 'border-green-400' : ''}`}
                >
                  {sectionComplete ? (
                    <CircleCheck className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <section.icon className="w-4 h-4 mr-1" />
                  )}
                  {section.label}
                </Button>
              );
            })}
          </div>
        </Card>
        
        {renderSectionContent()}
      </div>
    );
}
