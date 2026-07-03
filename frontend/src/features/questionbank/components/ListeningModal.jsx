import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Headphones, ChevronRight, X } from 'lucide-react';
import { LISTENING_QTYPES } from '../constants';

// Listening Practice Modal — extracted verbatim from pages/QuestionBank.js
export default function ListeningModal({
  selectedTopic,
  selectedBand,
  bandLevels,
  topics,
  selectedListeningQType,
  setSelectedListeningQType,
  setShowListeningModal,
  closeListeningModal,
}) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4"
          onClick={closeListeningModal}
        >
          <X className="w-4 h-4" />
        </Button>

        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Headphones className="w-5 h-5 text-purple-600" /> Listening Practice
        </h2>
        <p className="text-gray-500 mb-4">Select your band level and start practicing</p>

        {/* Info Box */}
        <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs text-purple-600">
            🎧 IELTS Listening has ONE track for both Academic and General Training.
            Practice with audio recordings covering Parts 1-4.
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
          {/* Band-based Practice Options */}
          <p className="text-sm font-semibold text-gray-700 mb-2">Practice by Band Level:</p>

          {[
            { id: '4.0-5.0', name: 'Band 4.0-5.0', desc: 'Foundation - Simple conversations', color: 'green', parts: 'Part 1-2' },
            { id: '5.5-6.5', name: 'Band 5.5-6.5', desc: 'Intermediate - Discussions & talks', color: 'blue', parts: 'Part 2-3' },
            { id: '7.0-9.0', name: 'Band 7.0-9.0', desc: 'Advanced - Academic lectures', color: 'purple', parts: 'Part 3-4' }
          ].map(band => (
            <Card
              key={band.id}
              className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-${band.color}-300`}
              onClick={() => {
                setShowListeningModal(false);
                const params = new URLSearchParams();
                params.set('band', band.id);
                if (selectedTopic) params.set('topic', selectedTopic);
                navigate(`/question-bank/listening?${params.toString()}`);
              }}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br from-${band.color}-500 to-${band.color}-600 rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Headphones className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{band.name}</h3>
                  <p className="text-sm text-gray-500">{band.desc}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <Badge className={`bg-${band.color}-100 text-${band.color}-700`}>{band.parts}</Badge>
                    <Badge className="bg-gray-100 text-gray-600">3-4 sets</Badge>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </Card>
          ))}

          {/* Question Type Based Practice — Cathoven-style dropdown.
              Replaces the 4-card grid; surfaces all 6 official listening
              types instead of the prior subset. See parallel change in
              the Reading modal block above. */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-semibold text-gray-700 mb-2">Or practice by Question Type:</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedListeningQType}
                onChange={(e) => setSelectedListeningQType(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-purple-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <option value="">— Select a question type —</option>
                {LISTENING_QTYPES.map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!selectedListeningQType}
                className="bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50"
                onClick={() => {
                  setShowListeningModal(false);
                  navigate(`/question-bank/listening?question_type=${selectedListeningQType}`);
                }}
              >
                Start Practice
              </Button>
            </div>
          </div>

          {/* All Practice Button */}
          <Button
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
            onClick={() => {
              setShowListeningModal(false);
              navigate('/question-bank/listening');
            }}
          >
            <Headphones className="w-4 h-4 mr-2" /> View All Listening Practice
          </Button>
        </div>
      </Card>
    </div>
  );
}
