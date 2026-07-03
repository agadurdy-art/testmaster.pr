import React from 'react';
import { Button } from '../../../../components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function ModuleDetailView({
  selectedModule,
  setView,
  setSelectedModule,
  currentSection,
  renderSectionTabs,
  renderVocabulary,
  renderGrammar,
  renderListening,
  renderReading,
  renderSpeaking,
  renderWriting,
  renderQuiz,
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => { setView('modules'); setSelectedModule(null); }} className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
          {selectedModule.module_number}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{selectedModule.title}</h1>
          <p className="text-gray-500 text-sm">{selectedModule.subtitle}</p>
        </div>
      </div>

      {/* Section Tabs */}
      {renderSectionTabs()}

      {/* Section Content */}
      {currentSection === 'vocabulary' && renderVocabulary()}
      {currentSection === 'grammar' && renderGrammar()}
      {currentSection === 'listening' && renderListening()}
      {currentSection === 'reading' && renderReading()}
      {currentSection === 'speaking' && renderSpeaking()}
      {currentSection === 'writing' && renderWriting()}
      {currentSection === 'quiz' && renderQuiz()}
    </div>
  );
}
