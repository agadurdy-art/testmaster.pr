import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Headphones, ChevronRight } from 'lucide-react';

export default function InlineListeningPanel({ selectedTopic, selectedBand, bandLevels, topics }) {
  const navigate = useNavigate();
  return (
    <Card className="p-6" data-testid="inline-skill-listening">
      <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Headphones className="w-5 h-5 text-purple-600" /> Listening Practice
      </h2>
      <p className="text-gray-500 mb-4">Select your band level and start practicing</p>

      <div className="mb-4 p-3 bg-purple-50 rounded-lg border border-purple-100">
        <p className="text-xs text-purple-600">
          🎧 IELTS Listening has ONE track for both Academic and General Training.
          Practice with audio recordings covering Parts 1-4.
        </p>
      </div>

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
        <p className="text-sm font-semibold text-gray-700 mb-2">Practice by Band Level:</p>
        {[
          { id: '4.0-5.0', name: 'Band 4.0-5.0', desc: 'Foundation - Simple conversations', color: 'green', parts: 'Part 1-2' },
          { id: '5.5-6.5', name: 'Band 5.5-6.5', desc: 'Intermediate - Discussions & talks', color: 'blue', parts: 'Part 2-3' },
          { id: '7.0-9.0', name: 'Band 7.0-9.0', desc: 'Advanced - Academic lectures', color: 'purple', parts: 'Part 3-4' },
        ].map(band => (
          <Card
            key={band.id}
            className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-${band.color}-300`}
            onClick={() => {
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

        <div className="mt-4 pt-4 border-t">
          <p className="text-sm font-semibold text-gray-700 mb-2">Or practice by Question Type:</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'multiple_choice', name: 'Multiple Choice', icon: '🔘' },
              { id: 'form_completion', name: 'Form Completion', icon: '📝' },
              { id: 'sentence_completion', name: 'Sentence Completion', icon: '✏️' },
              { id: 'matching', name: 'Matching', icon: '🔗' },
            ].map(qtype => (
              <Button
                key={qtype.id}
                variant="outline"
                size="sm"
                className="justify-start text-xs hover:bg-purple-50 hover:border-purple-300"
                onClick={() => navigate(`/question-bank/listening?question_type=${qtype.id}`)}
              >
                <span className="mr-1">{qtype.icon}</span> {qtype.name}
              </Button>
            ))}
          </div>
        </div>

        <Button
          className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600"
          onClick={() => navigate('/question-bank/listening')}
        >
          <Headphones className="w-4 h-4 mr-2" /> View All Listening Practice
        </Button>
      </div>
    </Card>
  );
}
