import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  Sparkles, ChevronRight, PenTool, RotateCcw
} from 'lucide-react';
import VocabularyHub from '../../../advancedVocab/VocabularyHub';

export default function VocabularySection({
  selectedModule,
  speakText,
  navigate,
  setCurrentSection,
}) {
  return (
    <Card id="vocabulary-section" className="p-6 bg-white border-0 shadow-lg scroll-mt-24">
      <VocabularyHub module={selectedModule} speakText={speakText} />

      {/* Interactive Vocabulary Engine CTA */}
      <div className="mt-6 p-4 bg-[#F5F5F7] rounded-2xl border border-black/[0.04]">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h4 className="font-semibold text-[#1D1D1F] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" /> Interactive Vocabulary Engine
            </h4>
            <p className="text-sm text-[#86868B] mt-1">Learn with slides, practice exercises, AI writing & mastery quiz</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button 
              onClick={() => navigate(`/vocabulary/learn/${selectedModule.id}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm px-5"
            >
              Start Learning <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate(`/vocabulary/production/${selectedModule.id}`)}
              className="border-black/[0.08] text-[#3A3A3C] hover:bg-white rounded-full text-sm"
            >
              <PenTool className="w-4 h-4 mr-1" /> AI Writing
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/review-bank')}
              className="border-black/[0.08] text-[#3A3A3C] hover:bg-white rounded-full text-sm"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Review Bank
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-amber-500 to-orange-600">
          Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </Card>
  );
}
