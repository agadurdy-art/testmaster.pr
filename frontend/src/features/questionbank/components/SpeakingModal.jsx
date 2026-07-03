import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { BookOpen, Mic, FileText, ChevronRight, X } from 'lucide-react';

// Speaking Practice Modal — extracted verbatim from pages/QuestionBank.js
export default function SpeakingModal({
  selectedTopic,
  selectedBand,
  bandLevels,
  topics,
  setShowSpeakingModal,
  closeSpeakingModal,
}) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={closeSpeakingModal}
        >
          <X className="w-4 h-4" />
        </Button>

        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Mic className="w-5 h-5 text-orange-600" /> Speaking Practice
        </h2>
        <p className="text-gray-500 mb-4">IELTS Speaking test practice with AI evaluation</p>

        {/* Info Box */}
        <div className="mb-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
          <p className="text-xs text-orange-600">
            🎙️ IELTS Speaking practice includes Part 1 (Interview), Part 2 (Cue Card), and Part 3 (Discussion).
            Record your answers and get AI-powered evaluation.
          </p>
        </div>

        {/* Active Filters */}
        {(selectedTopic || selectedBand) && (
          <div className="mb-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium mb-1">Selected Filters:</p>
            <div className="flex gap-2 flex-wrap">
              {selectedBand && (
                <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                  Band: {bandLevels.find(b => b.id === selectedBand)?.name || selectedBand}
                </Badge>
              )}
              {selectedTopic && (
                <Badge className="bg-purple-100 text-purple-700 text-xs">
                  Topic: {topics.find(t => t.id === selectedTopic)?.name || selectedTopic}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3">
          {/* Track Selection */}
          <p className="text-sm font-semibold text-gray-700 mb-2">Select IELTS Track:</p>

          {/* Academic Speaking */}
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-orange-300"
            onClick={() => {
              setShowSpeakingModal(false);
              const params = new URLSearchParams();
              params.set('track', 'academic');
              if (selectedBand) params.set('band', selectedBand);
              if (selectedTopic) params.set('topic', selectedTopic);
              navigate(`/question-bank/speaking?${params.toString()}`);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">Academic Speaking</h3>
                <p className="text-sm text-gray-500">Academic topics and formal discussion</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge className="bg-orange-100 text-orange-700">Part 1-2-3</Badge>
                  <Badge className="bg-gray-100 text-gray-600">11-14 min</Badge>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          {/* General Training Speaking */}
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-yellow-300"
            onClick={() => {
              setShowSpeakingModal(false);
              const params = new URLSearchParams();
              params.set('track', 'general');
              if (selectedBand) params.set('band', selectedBand);
              if (selectedTopic) params.set('topic', selectedTopic);
              navigate(`/question-bank/speaking?${params.toString()}`);
            }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">General Training Speaking</h3>
                <p className="text-sm text-gray-500">Everyday topics and casual discussion</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge className="bg-yellow-100 text-yellow-700">Part 1-2-3</Badge>
                  <Badge className="bg-gray-100 text-gray-600">11-14 min</Badge>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </Card>

          {/* Band Level Selection */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">Or select by Band Level:</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '4.0-5.0', name: 'Band 4-5', color: 'green', desc: 'Shows text' },
                { id: '5.5-6.5', name: 'Band 5.5-6.5', color: 'blue', desc: 'Audio only' },
                { id: '7.0-9.0', name: 'Band 7-9', color: 'purple', desc: 'Advanced' }
              ].map(band => (
                <Button
                  key={band.id}
                  variant="outline"
                  size="sm"
                  className={`flex-col h-auto py-3 hover:bg-${band.color}-50 hover:border-${band.color}-300`}
                  onClick={() => {
                    setShowSpeakingModal(false);
                    const params = new URLSearchParams();
                    params.set('band', band.id);
                    navigate(`/question-bank/speaking?${params.toString()}`);
                  }}
                >
                  <span className="font-medium">{band.name}</span>
                  <span className="text-xs text-gray-500 mt-1">{band.desc}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* All Practice Button */}
          <Button
            className="w-full mt-4 bg-gradient-to-r from-orange-600 to-amber-600"
            onClick={() => {
              setShowSpeakingModal(false);
              navigate('/question-bank/speaking');
            }}
          >
            <Mic className="w-4 h-4 mr-2" /> View All Speaking Practice
          </Button>
        </div>
      </Card>
    </div>
  );
}
