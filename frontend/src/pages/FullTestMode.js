import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, Clock, BookOpen, Headphones, PenTool, Mic,
  ChevronRight, AlertCircle, CheckCircle, Play, FileText,
  Loader2, ArrowRight
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SECTION_ICONS = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic
};

const SECTION_TIMES = {
  listening: '40 minutes',
  reading: '60 minutes',
  writing: '60 minutes',
  speaking: '11-14 minutes'
};

const SECTION_QUESTIONS = {
  listening: '40 questions',
  reading: '40 questions',
  writing: '2 tasks',
  speaking: '3 parts'
};

export default function FullTestMode({ user }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [testSets, setTestSets] = useState({ academic: [], general: [] });
  const [selectedType, setSelectedType] = useState('academic');
  const [selectedTest, setSelectedTest] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    loadTestSets();
  }, []);

  const loadTestSets = async () => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/sets`);
      const data = await res.json();
      if (data.success) {
        setTestSets({
          academic: data.academic_sets || [],
          general: data.general_sets || []
        });
      }
    } catch (error) {
      console.error('Error loading test sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = async (testId, mode = 'full') => {
    try {
      const res = await fetch(`${API_URL}/api/full-test/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test_id: testId,
          user_id: user?.id,
          mode: mode
        })
      });
      const data = await res.json();
      if (data.success) {
        // Navigate to test interface with session
        navigate(`/full-test/take/${testId}?session=${data.session.session_id}&mode=${mode}`);
      }
    } catch (error) {
      console.error('Error starting test:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div className="border-l pl-4">
              <h1 className="text-xl font-semibold text-slate-900">IELTS Full Test Mode</h1>
              <p className="text-sm text-slate-500">Complete examination under test conditions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Test Type Selector */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setSelectedType('academic')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              selectedType === 'academic'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
            }`}
          >
            <h3 className="font-semibold mb-1">Academic</h3>
            <p className={`text-sm ${selectedType === 'academic' ? 'text-slate-300' : 'text-slate-500'}`}>
              For university admissions
            </p>
          </button>
          <button
            onClick={() => setSelectedType('general')}
            className={`flex-1 p-4 rounded-lg border-2 transition-all ${
              selectedType === 'general'
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300'
            }`}
          >
            <h3 className="font-semibold mb-1">General Training</h3>
            <p className={`text-sm ${selectedType === 'general' ? 'text-slate-300' : 'text-slate-500'}`}>
              For work or migration
            </p>
          </button>
        </div>

        {/* Info Banner */}
        <Card className="p-4 mb-8 border-amber-200 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">Important Information</h4>
              <p className="text-sm text-amber-700 mt-1">
                This test is designed to closely match the real IELTS exam in format, timing, and difficulty. 
                All content is original and created to help you prepare effectively.
              </p>
            </div>
          </div>
        </Card>

        {/* Available Tests */}
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Available {selectedType === 'academic' ? 'Academic' : 'General Training'} Tests
        </h2>

        {testSets[selectedType].length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h3 className="font-medium text-slate-900 mb-2">No Tests Available</h3>
            <p className="text-sm text-slate-500">
              {selectedType === 'general' 
                ? 'General Training tests are coming soon.'
                : 'No tests available at the moment.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {testSets[selectedType].map((test) => (
              <Card 
                key={test.test_id} 
                className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTest(test)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">{test.title}</h3>
                    <p className="text-sm text-slate-500 mb-4">{test.description}</p>
                    
                    {/* Section badges */}
                    <div className="flex flex-wrap gap-2">
                      {test.sections_available.map((section) => {
                        const Icon = SECTION_ICONS[section];
                        return (
                          <Badge key={section} variant="outline" className="text-slate-600">
                            <Icon className="w-3 h-3 mr-1" />
                            {section.charAt(0).toUpperCase() + section.slice(1)}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge className="bg-slate-100 text-slate-700 mb-2">
                      <Clock className="w-3 h-3 mr-1" />
                      {test.estimated_time}
                    </Badge>
                    <ChevronRight className="w-5 h-5 text-slate-400 ml-auto" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Test Details Modal */}
        {selectedTest && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-slate-900">{selectedTest.title}</h2>
                <p className="text-sm text-slate-500 mt-1">{selectedTest.description}</p>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Test Structure */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Test Structure</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedTest.sections_available.map((section) => {
                      const Icon = SECTION_ICONS[section];
                      return (
                        <div key={section} className="p-3 bg-slate-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Icon className="w-4 h-4 text-slate-600" />
                            <span className="font-medium text-slate-900 capitalize">{section}</span>
                          </div>
                          <div className="text-sm text-slate-500">
                            <div>{SECTION_TIMES[section]}</div>
                            <div>{SECTION_QUESTIONS[section]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Test Rules */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Test Rules</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      You must complete each section within the time limit
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Once a section is submitted, you cannot return to it
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Results will only be shown after completing all sections
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                      Ensure you have a stable internet connection
                    </li>
                  </ul>
                </div>

                {/* Mode Selection */}
                <div>
                  <h3 className="font-medium text-slate-900 mb-3">Choose How to Start</h3>
                  
                  {/* Full Test Option */}
                  <button
                    onClick={() => startTest(selectedTest.test_id, 'full')}
                    className="w-full p-4 mb-3 border-2 border-slate-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <Play className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">Full Test (All Sections)</div>
                        <div className="text-sm text-slate-500">
                          Complete Listening → Reading → Writing → Speaking (~3 hours)
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Individual Section Selection */}
                  <div className="border-2 border-slate-200 rounded-lg p-4">
                    <div className="font-medium text-slate-900 mb-3">Or Start a Single Section:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedTest.sections_available.map((section) => {
                        const Icon = SECTION_ICONS[section];
                        const colors = {
                          listening: 'bg-blue-50 border-blue-200 hover:border-blue-500 text-blue-700',
                          reading: 'bg-green-50 border-green-200 hover:border-green-500 text-green-700',
                          writing: 'bg-purple-50 border-purple-200 hover:border-purple-500 text-purple-700',
                          speaking: 'bg-orange-50 border-orange-200 hover:border-orange-500 text-orange-700'
                        };
                        return (
                          <button
                            key={section}
                            onClick={() => startTest(selectedTest.test_id, section)}
                            className={`p-3 border-2 rounded-lg transition-all text-left ${colors[section]}`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4" />
                              <span className="font-medium capitalize">{section}</span>
                            </div>
                            <div className="text-xs opacity-80">
                              {SECTION_TIMES[section]} • {SECTION_QUESTIONS[section]}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t bg-slate-50 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedTest(null)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
