import React from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { AlertCircle, Play } from 'lucide-react';
import { SECTION_CONFIG } from '../constants';

// ============ SECTION START (Legacy) ============
export default function SectionStartCard({ currentSection, startSection }) {
  const config = SECTION_CONFIG[currentSection];
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-100">
      <Card className="max-w-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2 capitalize">{currentSection}</h2>
        <p className="text-slate-600 mb-6">Time: {config.totalTime / 60} minutes</p>

        <div className="text-left bg-amber-50 p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" /> Instructions
          </h3>
          <ul className="text-sm text-amber-800 space-y-1">
            {currentSection === 'listening' && (
              <>
                <li>• Audio plays ONCE only - no rewinding</li>
                <li>• Answer questions as you listen</li>
                <li>• Transfer answers before time ends</li>
              </>
            )}
            {currentSection === 'reading' && (
              <>
                <li>• You have 60 minutes for all passages</li>
                <li>• Suggested: 20 minutes per passage</li>
              </>
            )}
            {currentSection === 'writing' && (
              <>
                <li>• Task 1: minimum 150 words</li>
                <li>• Task 2: minimum 250 words</li>
              </>
            )}
            {currentSection === 'speaking' && (
              <>
                <li>• Listen to questions via audio</li>
                <li>• Record your answers</li>
              </>
            )}
          </ul>
        </div>

        <Button onClick={startSection} size="lg" className="bg-slate-900 hover:bg-slate-800">
          <Play className="w-5 h-5 mr-2" /> Start {currentSection}
        </Button>
      </Card>
    </div>
  );
}
