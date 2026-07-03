import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import {
  BookOpen, Headphones, PenTool, Mic, BookMarked,
  ChevronRight, ArrowLeft, Zap, PlayCircle
} from 'lucide-react';

export default function TestsTab({
  testCategory,
  setTestCategory,
  stats,
  fullTests,
  openTestModal,
  setSelectedCambridgeTest,
  setShowCambridgeTestModal,
}) {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">

      {/* Selection Screen - Choose Cambridge or AI */}
      {!testCategory && (
        <div data-testid="test-category-selection">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Test Type</h2>
            <p className="text-gray-500">Select a category to view available practice tests</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Cambridge Card */}
            <div
              data-testid="category-cambridge-card"
              className="relative overflow-hidden rounded-2xl border-2 border-red-200 bg-gradient-to-br from-white via-red-50/40 to-orange-50/30 p-8 cursor-pointer transition-all duration-300 hover:border-red-400 hover:shadow-xl hover:-translate-y-1 group"
              onClick={() => setTestCategory('cambridge')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg mb-5">
                  <BookMarked className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Cambridge IELTS</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">Official Cambridge practice tests from real past exams. The gold standard for IELTS preparation.</p>
                <div className="flex items-center gap-3 mb-5">
                  <Badge className="bg-red-100 text-red-700">IELTS 17</Badge>
                  <Badge className="bg-red-100 text-red-700">IELTS 18</Badge>
                  <Badge className="bg-gray-100 text-gray-500">+2 coming</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-semibold text-red-600">{stats?.cambridge_tests || 0} Tests Available</span>
                  <span>&middot;</span>
                  <span>4 Sections Each</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-red-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Tests <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* AI Practice Card */}
            <div
              data-testid="category-ai-card"
              className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 p-8 cursor-pointer transition-all duration-300 hover:border-indigo-400 hover:shadow-xl hover:-translate-y-1 group"
              onClick={() => setTestCategory('ai')}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/50 rounded-full -translate-y-8 translate-x-8 group-hover:scale-110 transition-transform" />
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg mb-5">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AI Practice Tests</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">AI-generated full tests with real exam visuals, detailed feedback, and smart scoring analysis.</p>
                <div className="flex items-center gap-3 mb-5">
                  <Badge className="bg-indigo-100 text-indigo-700">Academic</Badge>
                  <Badge className="bg-purple-100 text-purple-700">General Training</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span className="font-semibold text-indigo-600">{(stats?.ai_academic_tests || 0) + (stats?.ai_general_tests || 0)} Tests Available</span>
                  <span>&middot;</span>
                  <span>AI Feedback</span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold text-sm group-hover:gap-3 transition-all">
                  View Tests <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cambridge Tests Detail View */}
      {testCategory === 'cambridge' && (
        <div data-testid="cambridge-tests-view">
          <button
            data-testid="back-to-categories-btn"
            onClick={() => setTestCategory(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Test Types
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <BookMarked className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">Cambridge IELTS</h2>
              <p className="text-sm text-gray-500">Official past exam papers</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* IELTS 17 */}
            <Card className="p-6 border-2 border-red-100 bg-gradient-to-br from-white to-red-50/50 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">Cambridge IELTS 17</h3>
                    <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Official Academic practice tests</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-red-600">4</span>
                  <span className="text-sm text-gray-500"> tests</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(testNum => (
                  <div
                    key={testNum}
                    className="p-4 bg-white rounded-xl border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCambridgeTest({ book: 'ielts17', test: `test${testNum}`, title: `IELTS 17 - Test ${testNum}` });
                      setShowCambridgeTestModal(true);
                    }}
                    data-testid={`cambridge-test-ielts17-test${testNum}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">Test {testNum}</span>
                      <PlayCircle className="w-5 h-5 text-red-400 group-hover:text-red-600 transition-colors" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Headphones className="w-3 h-3 text-blue-400" />
                      <BookOpen className="w-3 h-3 text-green-400" />
                      <PenTool className="w-3 h-3 text-purple-400" />
                      <Mic className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] text-gray-400 ml-auto">4 sections</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* IELTS 18 */}
            <Card className="p-6 border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/50 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">Cambridge IELTS 18</h3>
                    <Badge className="bg-green-100 text-green-700 text-xs">Available</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Official Academic practice tests</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-blue-600">4</span>
                  <span className="text-sm text-gray-500"> tests</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(testNum => (
                  <div
                    key={testNum}
                    className="p-4 bg-white rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      setSelectedCambridgeTest({ book: 'ielts18', test: `test${testNum}`, title: `IELTS 18 - Test ${testNum}` });
                      setShowCambridgeTestModal(true);
                    }}
                    data-testid={`cambridge-test-ielts18-test${testNum}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900">Test {testNum}</span>
                      <PlayCircle className="w-5 h-5 text-blue-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                      <Headphones className="w-3 h-3 text-blue-400" />
                      <BookOpen className="w-3 h-3 text-green-400" />
                      <PenTool className="w-3 h-3 text-purple-400" />
                      <Mic className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] text-gray-400 ml-auto">4 sections</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Coming Soon */}
            <div className="grid md:grid-cols-2 gap-4">
              {['IELTS 16', 'IELTS 19'].map(book => (
                <Card key={book} className="p-5 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                      <BookMarked className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-400">Cambridge {book}</h4>
                      <Badge className="bg-amber-100 text-amber-600 text-xs mt-1">Coming Soon</Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AI Practice Tests Detail View */}
      {testCategory === 'ai' && (
        <div data-testid="ai-tests-view">
          <button
            data-testid="back-to-categories-btn-ai"
            onClick={() => setTestCategory(null)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Test Types
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900">AI Practice Tests</h2>
              <p className="text-sm text-gray-500">Full tests with AI feedback & real exam visuals</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Academic IELTS */}
            <Card className="p-6 border-2 border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">Academic IELTS</h3>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">8 Sets</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Complete practice tests with Listening, Reading, Writing & Speaking</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {id: 'academic_set_a_01', label: 'A', topic: 'Urbanisation'},
                  {id: 'academic_set_b_01', label: 'B', topic: 'US Households'},
                  {id: 'academic_set_c_01', label: 'C', topic: 'Diagrams & Maps'},
                  {id: 'academic_set_d_01', label: 'D', topic: 'Floor Plans'},
                  {id: 'academic_set_e_01', label: 'E', topic: 'Airport Maps'},
                  {id: 'academic_set_f_01', label: 'F', topic: 'Metal Prices'},
                  {id: 'academic_set_g_01', label: 'G', topic: 'Appliances'},
                  {id: 'academic_set_h_01', label: 'H', topic: 'Sugar Production'}
                ].map(set => (
                  <div
                    key={set.id}
                    data-testid={`academic-set-${set.label.toLowerCase()}-card`}
                    className="p-4 bg-white rounded-xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      const fullTest = fullTests.find(t => t.test_id === set.id);
                      if (fullTest) {
                        openTestModal(fullTest);
                      } else {
                        navigate(`/full-test?type=academic&set=${set.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <span className="font-bold text-emerald-700 text-lg">{set.label}</span>
                      </div>
                      <PlayCircle className="w-5 h-5 text-emerald-400 group-hover:text-emerald-600 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Set {set.label}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{set.topic}</p>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      <Headphones className="w-3 h-3 text-blue-400" />
                      <BookOpen className="w-3 h-3 text-green-400" />
                      <PenTool className="w-3 h-3 text-purple-400" />
                      <Mic className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] text-gray-400 ml-auto">4 sections</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* General Training */}
            <Card className="p-6 border-2 border-sky-100 bg-gradient-to-br from-white to-sky-50/30 rounded-2xl">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-gray-900">General Training IELTS</h3>
                    <Badge className="bg-sky-100 text-sky-700 text-xs">4 Sets</Badge>
                  </div>
                  <p className="text-sm text-gray-500">Practice tests for General Training module</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  {id: 'general_set_a_01', label: 'A', topic: 'Daily Life'},
                  {id: 'general_set_b_01', label: 'B', topic: 'Work & Social'},
                  {id: 'general_set_c_01', label: 'C', topic: 'Training'},
                  {id: 'general_set_d_01', label: 'D', topic: 'General Topics'}
                ].map(set => (
                  <div
                    key={set.id}
                    data-testid={`general-set-${set.label.toLowerCase()}-card`}
                    className="p-4 bg-white rounded-xl border-2 border-sky-200 hover:border-sky-400 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => {
                      const fullTest = fullTests.find(t => t.test_id === set.id);
                      if (fullTest) {
                        openTestModal(fullTest);
                      } else {
                        navigate(`/full-test?type=general&set=${set.id}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center group-hover:bg-sky-200 transition-colors">
                        <span className="font-bold text-sky-700 text-lg">{set.label}</span>
                      </div>
                      <PlayCircle className="w-5 h-5 text-sky-400 group-hover:text-sky-600 transition-colors" />
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm">Set {set.label}</h4>
                    <p className="text-xs text-gray-500 mt-0.5">{set.topic}</p>
                    <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                      <Headphones className="w-3 h-3 text-blue-400" />
                      <BookOpen className="w-3 h-3 text-green-400" />
                      <PenTool className="w-3 h-3 text-purple-400" />
                      <Mic className="w-3 h-3 text-orange-400" />
                      <span className="text-[10px] text-gray-400 ml-auto">4 sections</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
