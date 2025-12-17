import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { 
  PenTool, ArrowLeft, Clock, CheckCircle, XCircle, Loader2, 
  ChevronRight, BarChart2, BookOpen, FileText, Send, RotateCcw,
  Target, AlertCircle, Lightbulb, Award
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Writing Task Types
const TASK_TYPES = [
  {
    id: 'task1_academic',
    title: 'Task 1 Academic',
    description: 'Describe graphs, charts, diagrams, or processes',
    icon: BarChart2,
    color: 'from-blue-500 to-indigo-600',
    duration: 20,
    wordLimit: '150+',
    tips: 'Summarize main trends, compare data, and describe key features'
  },
  {
    id: 'task1_general',
    title: 'Task 1 General',
    description: 'Write formal, semi-formal, or informal letters',
    icon: FileText,
    color: 'from-purple-500 to-pink-600',
    duration: 20,
    wordLimit: '150+',
    tips: 'Match tone to audience, cover all bullet points, use appropriate openings/closings'
  },
  {
    id: 'task2',
    title: 'Task 2 Essay',
    description: 'Write an argumentative or discursive essay',
    icon: BookOpen,
    color: 'from-orange-500 to-red-600',
    duration: 40,
    wordLimit: '250+',
    tips: 'Clear thesis, well-developed paragraphs, balanced arguments, strong conclusion'
  }
];

// Sample prompts for each task type
const WRITING_PROMPTS = {
  task1_academic: [
    {
      id: 'ac1',
      title: 'Line Graph - Internet Usage',
      prompt: 'The graph below shows the percentage of households with access to the internet in three different countries between 2000 and 2020.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop',
      type: 'line_graph'
    },
    {
      id: 'ac2',
      title: 'Bar Chart - Energy Sources',
      prompt: 'The bar chart below shows the percentage of electricity generated from different sources in four countries.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.',
      imageUrl: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=600&h=400&fit=crop',
      type: 'bar_chart'
    },
    {
      id: 'ac3',
      title: 'Process Diagram - Water Treatment',
      prompt: 'The diagram below shows the process of treating water to make it drinkable.\n\nSummarize the information by selecting and reporting the main features.',
      imageUrl: 'https://images.unsplash.com/photo-1581093458791-9d42e3c2fd45?w=600&h=400&fit=crop',
      type: 'process'
    }
  ],
  task1_general: [
    {
      id: 'gt1',
      title: 'Formal Letter - Job Application',
      prompt: 'You saw an advertisement for a job at an international company. Write a letter to the Human Resources Manager.\n\nIn your letter:\n• Explain which job you are applying for\n• Describe your qualifications and experience\n• Say why you would be suitable for the job',
      type: 'formal'
    },
    {
      id: 'gt2',
      title: 'Semi-formal Letter - Neighbor Issue',
      prompt: 'You have a problem with a neighbor. Write a letter to your landlord.\n\nIn your letter:\n• Describe the problem\n• Explain how this affects you\n• Suggest what the landlord should do',
      type: 'semi_formal'
    },
    {
      id: 'gt3',
      title: 'Informal Letter - Friend Invitation',
      prompt: 'An English-speaking friend is coming to visit your country. Write a letter to your friend.\n\nIn your letter:\n• Suggest places to visit\n• Recommend what to pack\n• Offer to help with arrangements',
      type: 'informal'
    }
  ],
  task2: [
    {
      id: 'e1',
      title: 'Opinion Essay - Technology in Education',
      prompt: 'Some people believe that technology has made it easier for students to learn, while others think it has made learning more difficult.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.',
      type: 'discussion'
    },
    {
      id: 'e2',
      title: 'Problem-Solution Essay - Traffic Congestion',
      prompt: 'Traffic congestion is becoming a major problem in many cities around the world.\n\nWhat are the causes of this problem? What solutions can you suggest?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.',
      type: 'problem_solution'
    },
    {
      id: 'e3',
      title: 'Advantages/Disadvantages - Remote Work',
      prompt: 'More and more people are working from home instead of going to an office.\n\nWhat are the advantages and disadvantages of this trend?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.',
      type: 'advantages_disadvantages'
    },
    {
      id: 'e4',
      title: 'Agree/Disagree - Environmental Responsibility',
      prompt: 'Some people think that individuals can do little to protect the environment, and only governments and large companies can make a real difference.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.',
      type: 'agree_disagree'
    }
  ]
};

export default function WritingPractice({ user }) {
  const navigate = useNavigate();
  
  // State management
  const [view, setView] = useState('tasks'); // tasks, prompts, writing, feedback
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [savedDrafts, setSavedDrafts] = useState([]);
  
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  // Word count calculator
  useEffect(() => {
    const words = essay.trim() ? essay.trim().split(/\s+/).length : 0;
    setWordCount(words);
  }, [essay]);

  // Timer logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setTimerActive(false);
            toast.warning('Time is up! You can still continue writing.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startWriting = (prompt) => {
    setSelectedPrompt(prompt);
    const task = TASK_TYPES.find(t => t.id === selectedTaskType);
    setTimeLeft(task.duration * 60);
    setTimerActive(true);
    setEssay('');
    setView('writing');
  };

  const submitEssay = async () => {
    if (wordCount < 50) {
      toast.error('Please write at least 50 words before submitting.');
      return;
    }

    setLoading(true);
    setTimerActive(false);

    try {
      const response = await fetch(`${API_URL}/api/writing-practice/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_type: selectedTaskType,
          prompt: selectedPrompt.prompt,
          essay: essay,
          word_count: wordCount
        })
      });

      if (!response.ok) throw new Error('Evaluation failed');

      const data = await response.json();
      setFeedback(data);
      setView('feedback');
      toast.success('Essay evaluated successfully!');
    } catch (error) {
      console.error('Evaluation error:', error);
      toast.error('Failed to evaluate essay. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPractice = () => {
    setView('tasks');
    setSelectedTaskType(null);
    setSelectedPrompt(null);
    setEssay('');
    setFeedback(null);
    setTimerActive(false);
    setTimeLeft(0);
  };

  // Render task type selection
  const renderTaskSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Writing Practice</h1>
        <p className="text-gray-600">Master IELTS Writing with AI-powered feedback</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {TASK_TYPES.map((task) => {
          const Icon = task.icon;
          return (
            <Card
              key={task.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1"
              onClick={() => {
                setSelectedTaskType(task.id);
                setView('prompts');
              }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${task.color} flex items-center justify-center mb-4`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{task.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {task.duration} min
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-4 h-4" /> {task.wordLimit} words
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Writing Tips Section */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2">
          <Lightbulb className="w-5 h-5" /> IELTS Writing Tips
        </h3>
        <ul className="grid md:grid-cols-2 gap-3 text-sm text-amber-900">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
            Plan your answer before you start writing
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
            Use a variety of sentence structures
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
            Include specific examples to support your points
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />
            Leave time to check your spelling and grammar
          </li>
        </ul>
      </Card>
    </div>
  );

  // Render prompt selection
  const renderPromptSelection = () => {
    const task = TASK_TYPES.find(t => t.id === selectedTaskType);
    const prompts = WRITING_PROMPTS[selectedTaskType] || [];

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => setView('tasks')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${task.color} flex items-center justify-center`}>
            <task.icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{task.title}</h2>
            <p className="text-sm text-gray-600">{task.duration} minutes • {task.wordLimit} words minimum</p>
          </div>
        </div>

        {/* Task Tips */}
        <Card className="p-4 mb-6 bg-sky-50 border-sky-200">
          <p className="text-sm text-sky-800 flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span><strong>Tip:</strong> {task.tips}</span>
          </p>
        </Card>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a prompt:</h3>
        <div className="space-y-4">
          {prompts.map((prompt) => (
            <Card
              key={prompt.id}
              className="p-5 cursor-pointer hover:shadow-md transition-all hover:border-sky-300"
              onClick={() => startWriting(prompt)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">{prompt.title}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{prompt.prompt.substring(0, 150)}...</p>
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">
                    {prompt.type?.replace('_', ' ')}
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Render writing interface
  const renderWritingInterface = () => {
    const task = TASK_TYPES.find(t => t.id === selectedTaskType);
    const minWords = selectedTaskType === 'task2' ? 250 : 150;
    const wordProgress = Math.min((wordCount / minWords) * 100, 100);

    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => {
            if (window.confirm('Are you sure? Your progress will be lost.')) {
              resetPractice();
            }
          }}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Exit
          </Button>
          
          <div className="flex items-center gap-4">
            <div className={`px-4 py-2 rounded-lg font-mono text-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              <Clock className="w-4 h-4 inline mr-2" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Prompt Panel */}
          <Card className="p-6 h-fit lg:sticky lg:top-4">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${task.color} text-white`}>
                {task.title}
              </span>
            </div>
            
            <h3 className="font-semibold text-gray-900 mb-3">{selectedPrompt.title}</h3>
            
            {selectedPrompt.imageUrl && (
              <div className="mb-4 rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={selectedPrompt.imageUrl} 
                  alt="Task visual"
                  className="w-full h-48 object-cover"
                />
              </div>
            )}
            
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-line">{selectedPrompt.prompt}</p>
            </div>

            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-xs text-amber-800">
                <strong>Remember:</strong> Write at least {minWords} words. Spend about {task.duration} minutes on this task.
              </p>
            </div>
          </Card>

          {/* Writing Panel */}
          <div className="space-y-4">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-600">Word count: <strong>{wordCount}</strong> / {minWords}+</span>
                <span className={`text-sm font-medium ${wordCount >= minWords ? 'text-green-600' : 'text-amber-600'}`}>
                  {wordCount >= minWords ? '✓ Minimum reached' : `${minWords - wordCount} more needed`}
                </span>
              </div>
              <Progress value={wordProgress} className="h-2" />
            </Card>

            <Card className="p-4">
              <textarea
                ref={textareaRef}
                value={essay}
                onChange={(e) => setEssay(e.target.value)}
                placeholder="Start writing your response here..."
                className="w-full h-[400px] p-4 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 text-gray-800 leading-relaxed"
              />
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  localStorage.setItem(`draft_${selectedTaskType}_${selectedPrompt.id}`, essay);
                  toast.success('Draft saved!');
                }}
              >
                Save Draft
              </Button>
              <Button
                className="flex-1 primary-gradient text-white"
                onClick={submitEssay}
                disabled={loading || wordCount < 50}
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</>
                ) : (
                  <><Send className="w-4 h-4 mr-2" /> Submit for Feedback</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render feedback view
  const renderFeedback = () => {
    if (!feedback) return null;

    const getBandColor = (band) => {
      if (band >= 7) return 'text-green-600 bg-green-100';
      if (band >= 6) return 'text-blue-600 bg-blue-100';
      if (band >= 5) return 'text-amber-600 bg-amber-100';
      return 'text-red-600 bg-red-100';
    };

    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={resetPractice} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
        </Button>

        {/* Overall Score */}
        <Card className="p-6 mb-6 text-center bg-gradient-to-br from-sky-50 to-blue-50">
          <Award className="w-12 h-12 mx-auto text-sky-600 mb-3" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Estimated Band Score</h2>
          <div className={`inline-block px-6 py-3 rounded-full text-4xl font-bold ${getBandColor(feedback.overall_band)}`}>
            {feedback.overall_band}
          </div>
          <p className="text-gray-600 mt-3">Word count: {wordCount} words</p>
        </Card>

        {/* Criterion Scores */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { key: 'task_achievement', label: 'Task Achievement', desc: 'How well you addressed the task' },
              { key: 'coherence_cohesion', label: 'Coherence & Cohesion', desc: 'Organization and flow' },
              { key: 'lexical_resource', label: 'Lexical Resource', desc: 'Vocabulary range and accuracy' },
              { key: 'grammar', label: 'Grammatical Range', desc: 'Grammar variety and accuracy' }
            ].map((criterion) => (
              <div key={criterion.key} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900">{criterion.label}</span>
                  <span className={`px-2 py-1 rounded text-sm font-bold ${getBandColor(feedback.scores?.[criterion.key] || feedback.overall_band)}`}>
                    {feedback.scores?.[criterion.key] || feedback.overall_band}
                  </span>
                </div>
                <p className="text-xs text-gray-500">{criterion.desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Detailed Feedback */}
        <Card className="p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Feedback</h3>
          
          {/* Strengths */}
          <div className="mb-6">
            <h4 className="font-medium text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Strengths
            </h4>
            <ul className="space-y-2">
              {(feedback.strengths || []).map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>

          {/* Areas for Improvement */}
          <div className="mb-6">
            <h4 className="font-medium text-amber-700 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Areas for Improvement
            </h4>
            <ul className="space-y-2">
              {(feedback.improvements || []).map((improvement, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>

          {/* Grammar/Vocabulary Corrections */}
          {feedback.corrections && feedback.corrections.length > 0 && (
            <div className="mb-6">
              <h4 className="font-medium text-red-700 mb-2 flex items-center gap-2">
                <XCircle className="w-4 h-4" /> Corrections
              </h4>
              <div className="space-y-2">
                {feedback.corrections.map((correction, idx) => (
                  <div key={idx} className="p-3 bg-red-50 rounded-lg text-sm">
                    <p className="text-red-700 line-through">{correction.original}</p>
                    <p className="text-green-700">→ {correction.corrected}</p>
                    {correction.explanation && (
                      <p className="text-gray-600 text-xs mt-1">{correction.explanation}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Improved Version */}
        {feedback.improved_version && (
          <Card className="p-6 mb-6 bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5" /> Sample Improved Version
            </h3>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
              {feedback.improved_version}
            </div>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetPractice} className="flex-1">
            <RotateCcw className="w-4 h-4 mr-2" /> Try Another
          </Button>
          <Button 
            className="flex-1 primary-gradient text-white"
            onClick={() => {
              setView('writing');
              setFeedback(null);
            }}
          >
            <PenTool className="w-4 h-4 mr-2" /> Revise This Essay
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-red-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Dashboard
          </Button>
        </div>

        {view === 'tasks' && renderTaskSelection()}
        {view === 'prompts' && renderPromptSelection()}
        {view === 'writing' && renderWritingInterface()}
        {view === 'feedback' && renderFeedback()}
      </div>
    </div>
  );
}
