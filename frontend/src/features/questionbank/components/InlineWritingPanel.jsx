import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { BookOpen, PenTool, BarChart3, FileText, Edit3 } from 'lucide-react';

export default function InlineWritingPanel({ selectedTopic, selectedBand, bandLevels, topics }) {
  const navigate = useNavigate();
  return (
    <Card className="p-6" data-testid="inline-skill-writing">
      <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <PenTool className="w-5 h-5 text-green-600" /> Writing Practice
      </h2>
      <p className="text-gray-500 mb-4">Which task would you like to practice?</p>

      <div className="space-y-3">
        <div className="mb-2">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Academic IELTS
          </p>
          <p className="text-xs text-gray-500 mb-3">Course-aligned topics with band filtering</p>
        </div>

        {(selectedTopic || selectedBand) && (
          <div className="mb-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
            <p className="text-xs text-indigo-600 font-medium mb-1">Academic Writing Filters:</p>
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

        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-300"
          onClick={() => {
            const params = new URLSearchParams();
            if (selectedTopic) params.set('topic', selectedTopic);
            if (selectedBand) params.set('band', selectedBand);
            navigate(`/question-bank/writing/task1${params.toString() ? '?' + params.toString() : ''}`);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Task 1 - Academic</h3>
              <p className="text-sm text-gray-500">Graph, table, process or map description</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-green-100 text-green-700">150+ words</Badge>
                <Badge className="bg-gray-100 text-gray-600">20 minutes</Badge>
                {selectedTopic && <Badge className="bg-indigo-100 text-indigo-600">Topic Focused</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
          onClick={() => {
            const params = new URLSearchParams();
            if (selectedTopic) params.set('topic', selectedTopic);
            if (selectedBand) params.set('band', selectedBand);
            navigate(`/question-bank/writing/task2${params.toString() ? '?' + params.toString() : ''}`);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Task 2 - Essay</h3>
              <p className="text-sm text-gray-500">Opinion, Discussion, Problem-Solution essay</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-blue-100 text-blue-700">250+ words</Badge>
                <Badge className="bg-gray-100 text-gray-600">40 minutes</Badge>
                {selectedTopic && <Badge className="bg-indigo-100 text-indigo-600">Topic Focused</Badge>}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 mb-2 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" /> General Training IELTS
          </p>
          <p className="text-xs text-gray-500 mb-3">Letter writing practice, independent of course topics</p>
        </div>

        <div className="mb-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
          <p className="text-xs text-purple-600">
            General Training letter writing is independent of course topics. It includes 32 different letter scenarios (Formal, Semi-formal, Informal).
          </p>
        </div>

        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
          onClick={() => navigate('/question-bank/writing/general/task1')}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Task 1 - Letter Writing</h3>
              <p className="text-sm text-gray-500">Formal, Semi-formal, Informal letter writing</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-700">150+ words</Badge>
                <Badge className="bg-gray-100 text-gray-600">20 minutes</Badge>
                <Badge className="bg-amber-100 text-amber-700">32 scenarios</Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-pink-300"
          onClick={() => navigate('/question-bank/writing/general/task2')}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Task 2 - Essay (General)</h3>
              <p className="text-sm text-gray-500">Opinion, Discussion, Problem-Solution essays</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-pink-100 text-pink-700">250+ words</Badge>
                <Badge className="bg-gray-100 text-gray-600">40 minutes</Badge>
                <Badge className="bg-amber-100 text-amber-700">16 scenarios</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </Card>
  );
}
