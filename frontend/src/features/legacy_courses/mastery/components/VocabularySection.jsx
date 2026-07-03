import React from 'react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import {
  BookOpen, Volume2, Loader2, Target, PenTool, HelpCircle, Award, ChevronRight
} from 'lucide-react';

export default function VocabularySection({
  selectedModule,
  user,
  navigate,
  playPronunciation,
  playingAudio,
  setCurrentSection,
}) {
    const vocab = selectedModule.vocabulary;
    const categories = ['nouns', 'verbs', 'adjectives', 'adverbs'];
    
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-violet-600" /> Vocabulary
        </h3>
        
        {categories.map(cat => vocab[cat] && (
          <div key={cat} className="mb-6">
            <h4 className="font-bold text-gray-700 capitalize mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-500"></span> {cat}
            </h4>
            <div className="grid gap-3">
              {vocab[cat].map((item, idx) => (
                <div key={idx} className="p-4 bg-gray-50 rounded-xl flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">{item.word}</span>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => playPronunciation(item.word)} disabled={playingAudio === item.word}>
                        {playingAudio === item.word ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">{item.meaning}</p>
                    <p className="text-sm text-gray-500 italic mt-1">&ldquo;{item.example}&rdquo;</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Collocations & Idiom */}
        {selectedModule.collocations && (
          <div className="mb-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-bold text-blue-800 mb-3">📚 Collocations</h4>
            {selectedModule.collocations.map((col, idx) => (
              <div key={idx} className="mb-3 last:mb-0">
                <p className="font-medium text-blue-900">{col.phrase}</p>
                <p className="text-sm text-blue-700">{col.meaning}</p>
                <p className="text-sm text-blue-600 italic">&ldquo;{col.example}&rdquo;</p>
              </div>
            ))}
          </div>
        )}
        
        {selectedModule.idiom && (
          <div className="p-4 bg-amber-50 rounded-xl">
            <h4 className="font-bold text-amber-800 mb-2">💡 IELTS Idiom</h4>
            <p className="font-medium text-amber-900">{selectedModule.idiom.phrase}</p>
            <p className="text-sm text-amber-700">{selectedModule.idiom.meaning}</p>
            <p className="text-sm text-amber-600 italic">&ldquo;{selectedModule.idiom.example}&rdquo;</p>
          </div>
        )}
        
        {/* Interactive Vocabulary Engine */}
        {user && (
          <div className="mt-6 p-5 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-200">
            <h4 className="font-bold text-violet-900 mb-1 flex items-center gap-2">
              <Target className="w-4 h-4" /> Interactive Vocabulary Practice
            </h4>
            <p className="text-sm text-violet-600 mb-4">Master these words through interactive exercises</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                data-testid="vocab-engine-learn-btn"
                variant="outline"
                className="border-violet-300 text-violet-700 hover:bg-violet-100"
                onClick={() => navigate(`/vocabulary/learn/${selectedModule.id}`)}
              >
                <BookOpen className="w-4 h-4 mr-1" /> Learn
              </Button>
              <Button
                data-testid="vocab-engine-practice-btn"
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => navigate(`/vocabulary/practice/${selectedModule.id}`)}
              >
                <PenTool className="w-4 h-4 mr-1" /> Practice
              </Button>
              <Button
                data-testid="vocab-engine-quiz-btn"
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-100"
                onClick={() => navigate(`/vocabulary/quiz/${selectedModule.id}`)}
              >
                <HelpCircle className="w-4 h-4 mr-1" /> Quiz
              </Button>
              <Button
                data-testid="vocab-engine-production-btn"
                variant="outline"
                className="border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => navigate(`/vocabulary/production/${selectedModule.id}`)}
              >
                <Award className="w-4 h-4 mr-1" /> Production
              </Button>
            </div>
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setCurrentSection('grammar')} className="bg-gradient-to-r from-violet-500 to-purple-600">
            Next: Grammar <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>
    );
}
