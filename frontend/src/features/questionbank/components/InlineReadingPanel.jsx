import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { BookOpen, BookMarked, Target, HelpCircle, Award, FileText } from 'lucide-react';

export default function InlineReadingPanel({ selectedTopic, selectedBand, bandLevels, topics }) {
  const navigate = useNavigate();
  return (
    <Card className="p-6" data-testid="inline-skill-reading">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-900">Reading Practice</h2>
      </div>

      {(selectedBand || selectedTopic) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600 font-medium mb-1">Active Filters:</p>
          <div className="flex gap-2 flex-wrap">
            {selectedBand && (
              <Badge className="bg-blue-100 text-blue-700">
                {bandLevels.find(b => b.id === selectedBand)?.name}
              </Badge>
            )}
            {selectedTopic && (
              <Badge className="bg-purple-100 text-purple-700">
                {topics.find(t => t.id === selectedTopic)?.icon} {topics.find(t => t.id === selectedTopic)?.name}
              </Badge>
            )}
          </div>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-6">Select an IELTS Reading type or question type:</p>

      <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
        <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> PRACTICE BY QUESTION TYPE
        </h4>
        <p className="text-xs text-amber-600 mb-3">Choose a specific question type to master</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'multiple_choice', name: 'Multiple Choice', icon: '🔘' },
            { id: 'true_false_ng', name: 'True/False/NG', icon: '✓✗' },
            { id: 'matching_headings', name: 'Matching Headings', icon: '📑' },
            { id: 'sentence_completion', name: 'Sentence Completion', icon: '✏️' },
            { id: 'summary_completion', name: 'Summary Completion', icon: '📝' },
            { id: 'matching_information', name: 'Matching Info', icon: '🔗' },
          ].map(qtype => (
            <Button
              key={qtype.id}
              variant="outline"
              size="sm"
              className="justify-start text-xs hover:bg-amber-100 hover:border-amber-300"
              onClick={() => navigate(`/question-bank/reading/practice?type=${qtype.id}`)}
            >
              <span className="mr-1">{qtype.icon}</span> {qtype.name}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
          <BookMarked className="w-4 h-4" /> ACADEMIC IELTS
        </h4>
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
          onClick={() => {
            const params = new URLSearchParams();
            if (selectedTopic) params.append('topic', selectedTopic);
            if (selectedBand) params.append('band', selectedBand);
            navigate(`/question-bank/reading/academic${params.toString() ? '?' + params.toString() : ''}`);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">Academic Reading</h3>
              <p className="text-sm text-gray-500">Research articles, journals, academic texts</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-blue-100 text-blue-700">Band 7-9</Badge>
                <Badge className="bg-gray-100 text-gray-600">5 Modules</Badge>
                <Badge className="bg-indigo-100 text-indigo-700">Advanced</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
          <Target className="w-4 h-4" /> GENERAL TRAINING IELTS
        </h4>
        <Card
          className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
          onClick={() => {
            const params = new URLSearchParams();
            if (selectedTopic) params.append('topic', selectedTopic);
            if (selectedBand) params.append('band', selectedBand);
            navigate(`/question-bank/reading/general${params.toString() ? '?' + params.toString() : ''}`);
          }}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900">General Training Reading</h3>
              <p className="text-sm text-gray-500">Policy documents, contracts, workplace notices</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge className="bg-purple-100 text-purple-700">Band 7-9</Badge>
                <Badge className="bg-gray-100 text-gray-600">5 Modules</Badge>
                <Badge className="bg-pink-100 text-pink-700">Advanced</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
        <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4" /> MASTERY LEVEL (Band 6-7)
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <Card
            className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-green-300"
            onClick={() => {
              const params = new URLSearchParams();
              if (selectedTopic) params.append('topic', selectedTopic);
              navigate(`/question-bank/reading/mastery/academic${params.toString() ? '?' + params.toString() : ''}`);
            }}
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">Academic</p>
                <p className="text-xs text-gray-500">5 Modules</p>
              </div>
            </div>
          </Card>
          <Card
            className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-green-300"
            onClick={() => {
              const params = new URLSearchParams();
              if (selectedTopic) params.append('topic', selectedTopic);
              navigate(`/question-bank/reading/mastery/general${params.toString() ? '?' + params.toString() : ''}`);
            }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-sm text-gray-900">General</p>
                <p className="text-xs text-gray-500">4 Modules</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Card>
  );
}
