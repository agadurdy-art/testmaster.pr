import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { BookOpen, BookMarked, Target, HelpCircle, Award, FileText, X } from 'lucide-react';
import { READING_QTYPES } from '../constants';

// Reading Task Selection Modal — extracted verbatim from pages/QuestionBank.js
export default function ReadingModal({
  selectedTopic,
  selectedBand,
  bandLevels,
  topics,
  selectedReadingQType,
  setSelectedReadingQType,
  setShowReadingModal,
  closeReadingModal,
}) {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" /> Reading Practice
            </div>
            <Button variant="ghost" size="sm" onClick={closeReadingModal}>
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Show selected filters */}
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

          {/* Question Type Based Practice — single dropdown (Cathoven-style).
              Pre-2026-05-09 this rendered a 6-card grid that grew unwieldy
              once we surfaced all 8 official IELTS reading types; users
              reported it as "confusing — everything visible at once". */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
            <h4 className="text-sm font-bold text-amber-700 mb-3 flex items-center gap-2">
              <HelpCircle className="w-4 h-4" /> PRACTICE BY QUESTION TYPE
            </h4>
            <p className="text-xs text-amber-600 mb-3">Pick a specific question type to drill</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedReadingQType}
                onChange={(e) => setSelectedReadingQType(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-amber-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                <option value="">— Select a question type —</option>
                {READING_QTYPES.map(q => (
                  <option key={q.id} value={q.id}>{q.name}</option>
                ))}
              </select>
              <Button
                size="sm"
                disabled={!selectedReadingQType}
                className="bg-amber-600 hover:bg-amber-700 text-white disabled:opacity-50"
                onClick={() => {
                  setShowReadingModal(false);
                  navigate(`/question-bank/reading/practice?type=${selectedReadingQType}`);
                }}
              >
                Start Practice
              </Button>
            </div>
          </div>

          {/* Academic Reading Section */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-blue-700 mb-3 flex items-center gap-2">
              <BookMarked className="w-4 h-4" /> ACADEMIC IELTS
            </h4>

            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-300"
              onClick={() => {
                setShowReadingModal(false);
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

          {/* General Training Reading Section */}
          <div className="mb-4">
            <h4 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> GENERAL TRAINING IELTS
            </h4>

            <Card
              className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-300"
              onClick={() => {
                setShowReadingModal(false);
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

          {/* Mastery Level Section - NEW */}
          <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
            <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center gap-2">
              <Award className="w-4 h-4" /> MASTERY LEVEL (Band 6-7)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className="p-3 cursor-pointer hover:shadow-md transition-all border hover:border-green-300"
                onClick={() => {
                  setShowReadingModal(false);
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
                  setShowReadingModal(false);
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

        </div>
      </Card>
    </div>
  );
}
