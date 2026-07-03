import React from 'react';
import { Card } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Headphones, Target } from 'lucide-react';

// Pre-section instructions screen. JSX extracted verbatim from the
// `if (showInstructions)` branch of pages/CambridgeTestInterface.js;
// closed-over values became same-named props.
export default function InstructionsScreen({
  sections,
  currentSection,
  testData,
  sectionData,
  isSkillMode,
  handleStartTest,
}) {
    const sectionInfo = sections.find(s => s.id === currentSection);
    const Icon = sectionInfo?.icon || Headphones;
    
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 rounded-full bg-${sectionInfo?.color}-100 flex items-center justify-center mx-auto mb-4`}>
              <Icon className={`w-10 h-10 text-${sectionInfo?.color}-600`} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              IELTS {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
            </h1>
            <p className="text-gray-500">{testData.title}</p>
          </div>
          
          <div className="bg-slate-50 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-gray-900">
                  {sectionData?.total_questions || sectionData?.total_tasks || sectionData?.total_parts || '-'}
                </p>
                <p className="text-sm text-gray-500">
                  {currentSection === 'writing' ? 'Tasks' : currentSection === 'speaking' ? 'Parts' : 'Questions'}
                </p>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{sectionInfo?.time}</p>
                <p className="text-sm text-gray-500">Time Limit</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-8">
            <h3 className="font-semibold text-gray-900">Instructions:</h3>
            {currentSection === 'listening' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• You will hear the recording ONCE only</li>
                <li>• Answer all questions as you listen</li>
                <li>• You will have 10 minutes to transfer your answers</li>
                <li>• Write your answers in the gaps provided</li>
              </ul>
            )}
            {currentSection === 'reading' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Read each passage carefully</li>
                <li>• Answer all 40 questions</li>
                <li>• You may write on the question paper</li>
                <li>• Manage your time - approximately 20 minutes per passage</li>
              </ul>
            )}
            {currentSection === 'writing' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Task 1: Write at least 150 words (20 minutes recommended)</li>
                <li>• Task 2: Write at least 250 words (40 minutes recommended)</li>
                <li>• Answer both tasks</li>
                <li>• Write in formal academic style</li>
              </ul>
            )}
            {currentSection === 'speaking' && (
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Part 1: Introduction and interview (4-5 minutes)</li>
                <li>• Part 2: Individual long turn - speak for 1-2 minutes</li>
                <li>• Part 3: Two-way discussion (4-5 minutes)</li>
                <li>• Speak clearly and at a natural pace</li>
              </ul>
            )}
          </div>
          
          {/* Skill Mode Indicator */}
          {isSkillMode && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-indigo-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span><strong>Skill Practice Mode:</strong> You are practicing only {currentSection}. After completing, you will see your results for this section.</span>
              </p>
            </div>
          )}
          
          <Button 
            onClick={handleStartTest}
            className="w-full h-12 text-lg bg-red-600 hover:bg-red-700"
            data-testid="start-section-btn"
          >
            Start {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)} {isSkillMode ? 'Practice' : 'Test'}
          </Button>
        </Card>
      </div>
    );
}
