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

const TASK_TYPES = [
  { id: 'task1_academic', title: 'Task 1 Academic', description: 'Describe graphs, charts, diagrams, or processes', icon: BarChart2, color: 'bg-blue-500', lightBg: 'bg-blue-50', duration: 20, wordLimit: '150+', tips: 'Summarize main trends, compare data, and describe key features' },
  { id: 'task1_general', title: 'Task 1 General', description: 'Write formal, semi-formal, or informal letters', icon: FileText, color: 'bg-purple-500', lightBg: 'bg-purple-50', duration: 20, wordLimit: '150+', tips: 'Match tone to audience, cover all bullet points' },
  { id: 'task2', title: 'Task 2 Essay', description: 'Write an argumentative or discursive essay', icon: BookOpen, color: 'bg-orange-500', lightBg: 'bg-orange-50', duration: 40, wordLimit: '250+', tips: 'Clear thesis, well-developed paragraphs, strong conclusion' }
];

const WRITING_PROMPTS = {
  task1_academic: [
    { id: 'ac1', title: 'Line Graph - Internet Usage', prompt: 'The graph below shows the percentage of households with access to the internet in three different countries between 2000 and 2020.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.', imageUrl: 'https://customer-assets.emergentagent.com/job_ielts-ace-3/artifacts/zkfesaxt_Screenshot%202025-12-18%20at%2011.06.08.png', type: 'line_graph' },
    { id: 'ac2', title: 'Bar Chart - Energy Sources', prompt: 'The bar chart below shows the percentage of electricity generated from different sources in four countries.\n\nSummarize the information by selecting and reporting the main features, and make comparisons where relevant.', imageUrl: 'https://customer-assets.emergentagent.com/job_ielts-ace-3/artifacts/t9vh6l2n_Code_Generated_Image.png', type: 'bar_chart' },
    { id: 'ac3', title: 'Process Diagram - Water Treatment', prompt: 'The diagram below shows the process of treating water to make it drinkable.\n\nSummarize the information by selecting and reporting the main features.', imageUrl: 'https://customer-assets.emergentagent.com/job_ielts-ace-3/artifacts/oslspp62_Gemini_Generated_Image_njmstsnjmstsnjms.png', type: 'process' }
  ],
  task1_general: [
    { id: 'gt1', title: 'Formal Letter - Job Application', prompt: 'You saw an advertisement for a job at an international company. Write a letter to the Human Resources Manager.\n\nIn your letter:\n• Explain which job you are applying for\n• Describe your qualifications and experience\n• Say why you would be suitable for the job', type: 'formal' },
    { id: 'gt2', title: 'Semi-formal Letter - Neighbor Issue', prompt: 'You have a problem with a neighbor. Write a letter to your landlord.\n\nIn your letter:\n• Describe the problem\n• Explain how this affects you\n• Suggest what the landlord should do', type: 'semi_formal' },
    { id: 'gt3', title: 'Informal Letter - Friend Invitation', prompt: 'An English-speaking friend is coming to visit your country. Write a letter to your friend.\n\nIn your letter:\n• Suggest places to visit\n• Recommend what to pack\n• Offer to help with arrangements', type: 'informal' }
  ],
  task2: [
    { id: 'e1', title: 'Opinion Essay - Technology in Education', prompt: 'Some people believe that technology has made it easier for students to learn, while others think it has made learning more difficult.\n\nDiscuss both views and give your own opinion.\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.', type: 'discussion' },
    { id: 'e2', title: 'Problem-Solution Essay - Traffic Congestion', prompt: 'Traffic congestion is becoming a major problem in many cities around the world.\n\nWhat are the causes of this problem? What solutions can you suggest?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.', type: 'problem_solution' },
    { id: 'e3', title: 'Advantages/Disadvantages - Remote Work', prompt: 'More and more people are working from home instead of going to an office.\n\nWhat are the advantages and disadvantages of this trend?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.', type: 'advantages_disadvantages' },
    { id: 'e4', title: 'Agree/Disagree - Environmental Responsibility', prompt: 'Some people think that individuals can do little to protect the environment, and only governments and large companies can make a real difference.\n\nTo what extent do you agree or disagree?\n\nGive reasons for your answer and include any relevant examples from your own knowledge or experience.', type: 'agree_disagree' }
  ]
};

export default function WritingPractice({ user }) {
  const navigate = useNavigate();
  const [view, setView] = useState('tasks');
  const [selectedTaskType, setSelectedTaskType] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const textareaRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { setWordCount(essay.trim() ? essay.trim().split(/\s+/).length : 0); }, [essay]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => { if (prev <= 1) { setTimerActive(false); toast.warning('Time is up!'); return 0; } return prev - 1; });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [timerActive, timeLeft]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

  const startWriting = (prompt) => {
    setSelectedPrompt(prompt);
    const task = TASK_TYPES.find(t => t.id === selectedTaskType);
    setTimeLeft(task.duration * 60);
    setTimerActive(true);
    setEssay('');
    setView('writing');
  };

  const submitEssay = async () => {
    if (wordCount < 50) { toast.error('Please write at least 50 words.'); return; }
    setLoading(true); setTimerActive(false);
    try {
      const response = await fetch(`${API_URL}/api/writing-practice/evaluate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ task_type: selectedTaskType, prompt: selectedPrompt.prompt, essay, word_count: wordCount }) });
      if (!response.ok) throw new Error('Evaluation failed');
      const data = await response.json();
      setFeedback(data); setView('feedback');
      toast.success('Essay evaluated!');
    } catch (error) { toast.error('Failed to evaluate essay.'); }
    finally { setLoading(false); }
  };

  const resetPractice = () => { setView('tasks'); setSelectedTaskType(null); setSelectedPrompt(null); setEssay(''); setFeedback(null); setTimerActive(false); setTimeLeft(0); };

  const getBandColor = (band) => band >= 7 ? 'bg-green-100 text-green-700' : band >= 6 ? 'bg-blue-100 text-blue-700' : band >= 5 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700';

  // Task Selection View
  if (view === 'tasks') return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100 py-8 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mb-6 text-gray-600 hover:text-violet-600"><ArrowLeft className="w-4 h-4 mr-2" /> Dashboard</Button>
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-orange-200">
            <PenTool className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Writing Practice</h1>
          <p className="text-gray-500">Master IELTS Writing with AI-powered feedback</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TASK_TYPES.map((task) => (
            <Card key={task.id} className={`p-6 bg-white border-0 shadow-lg hover:shadow-xl cursor-pointer group transition-all hover:-translate-y-1 rounded-2xl`} onClick={() => { setSelectedTaskType(task.id); setView('prompts'); }}>
              <div className={`w-14 h-14 rounded-2xl ${task.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <task.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{task.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{task.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {task.duration} min</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {task.wordLimit}</span>
              </div>
            </Card>
          ))}
        </div>
        <Card className="mt-8 p-6 bg-amber-50 border-amber-200 rounded-2xl">
          <h3 className="text-lg font-semibold text-amber-800 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> IELTS Writing Tips</h3>
          <ul className="grid md:grid-cols-2 gap-3 text-sm text-amber-900">
            {['Plan your answer before writing', 'Use varied sentence structures', 'Include specific examples', 'Check spelling and grammar'].map((tip, i) => (
              <li key={i} className="flex items-start gap-2"><CheckCircle className="w-4 h-4 mt-0.5 text-amber-600" />{tip}</li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );

  // Prompt Selection View
  if (view === 'prompts') {
    const task = TASK_TYPES.find(t => t.id === selectedTaskType);
    const prompts = WRITING_PROMPTS[selectedTaskType] || [];
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100 py-8 px-4 pb-32">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" onClick={() => setView('tasks')} className="mb-4 text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl ${task.color} flex items-center justify-center shadow-lg`}><task.icon className="w-6 h-6 text-white" /></div>
            <div><h2 className="text-2xl font-bold text-gray-900">{task.title}</h2><p className="text-sm text-gray-500">{task.duration} minutes • {task.wordLimit} words</p></div>
          </div>
          <Card className="p-4 mb-6 bg-blue-50 border-blue-200 rounded-xl"><p className="text-sm text-blue-800 flex items-start gap-2"><Lightbulb className="w-4 h-4 mt-0.5" /><span><strong>Tip:</strong> {task.tips}</span></p></Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a prompt:</h3>
          <div className="space-y-4">
            {prompts.map((prompt) => (
              <Card key={prompt.id} className="p-5 bg-white border-0 shadow-lg hover:shadow-xl cursor-pointer transition-all rounded-2xl" onClick={() => startWriting(prompt)}>
                <div className="flex items-center justify-between">
                  <div className="flex-1"><h4 className="font-semibold text-gray-900 mb-2">{prompt.title}</h4><p className="text-sm text-gray-500 line-clamp-2">{prompt.prompt.substring(0, 150)}...</p><span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs capitalize">{prompt.type?.replace('_', ' ')}</span></div>
                  <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Writing Interface View
  if (view === 'writing') {
    const task = TASK_TYPES.find(t => t.id === selectedTaskType);
    const minWords = selectedTaskType === 'task2' ? 250 : 150;
    const wordProgress = Math.min((wordCount / minWords) * 100, 100);
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100 py-8 px-4 pb-32">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" onClick={() => resetPractice()} className="text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Exit</Button>
            <div className={`px-4 py-2 rounded-xl font-mono text-lg ${timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}><Clock className="w-4 h-4 inline mr-2" />{formatTime(timeLeft)}</div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 h-fit lg:sticky lg:top-4 bg-white border-0 shadow-lg rounded-2xl">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${task.color} text-white mb-4`}>{task.title}</span>
              <h3 className="font-semibold text-gray-900 mb-3">{selectedPrompt.title}</h3>
              <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-2 mb-2 text-blue-600">
                  <BarChart2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Task Visual: {selectedPrompt.type?.replace('_', ' ').toUpperCase()}</span>
                </div>
                <p className="text-xs text-gray-500 italic">Data reference is included in the prompt below</p>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{selectedPrompt.prompt}</p>
              <div className="mt-4 p-3 bg-amber-50 rounded-xl"><p className="text-xs text-amber-800"><strong>Remember:</strong> Write at least {minWords} words.</p></div>
            </Card>
            <div className="space-y-4">
              <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">Words: <strong>{wordCount}</strong> / {minWords}+</span>
                  <span className={`text-sm font-medium ${wordCount >= minWords ? 'text-green-600' : 'text-amber-600'}`}>{wordCount >= minWords ? '✓ Minimum reached' : `${minWords - wordCount} more needed`}</span>
                </div>
                <Progress value={wordProgress} className="h-2" />
              </Card>
              <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl">
                <textarea ref={textareaRef} value={essay} onChange={(e) => setEssay(e.target.value)} placeholder="Start writing here..." className="w-full h-[400px] p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 text-gray-800" />
              </Card>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => { localStorage.setItem(`draft_${selectedTaskType}_${selectedPrompt.id}`, essay); toast.success('Draft saved!'); }}>Save Draft</Button>
                <Button className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={submitEssay} disabled={loading || wordCount < 50}>
                  {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Evaluating...</> : <><Send className="w-4 h-4 mr-2" /> Submit</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Feedback View
  if (view === 'feedback' && feedback) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-orange-50/30 to-gray-100 py-8 px-4 pb-32">
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={resetPractice} className="mb-4 text-gray-600"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>
        <Card className="p-6 mb-6 text-center bg-gradient-to-br from-violet-50 to-purple-50 border-0 shadow-lg rounded-2xl">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"><Award className="w-8 h-8 text-white" /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Estimated Band Score</h2>
          <div className={`inline-block px-6 py-3 rounded-full text-4xl font-bold ${getBandColor(feedback.overall_band)}`}>{feedback.overall_band}</div>
          <p className="text-gray-500 mt-3">Word count: {wordCount}</p>
        </Card>
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Scores</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[{ key: 'task_achievement', label: 'Task Achievement' }, { key: 'coherence_cohesion', label: 'Coherence & Cohesion' }, { key: 'lexical_resource', label: 'Lexical Resource' }, { key: 'grammar', label: 'Grammar' }].map((c) => (
              <div key={c.key} className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                <span className="font-medium text-gray-900">{c.label}</span>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getBandColor(feedback.scores?.[c.key] || feedback.overall_band)}`}>{feedback.scores?.[c.key] || feedback.overall_band}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-6 mb-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Feedback</h3>
          <div className="mb-6"><h4 className="font-medium text-green-700 mb-2 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Strengths</h4><ul className="space-y-2">{(feedback.strengths || []).map((s, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-green-500">•</span>{s}</li>)}</ul></div>
          <div><h4 className="font-medium text-amber-700 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> Improvements</h4><ul className="space-y-2">{(feedback.improvements || []).map((s, i) => <li key={i} className="text-sm text-gray-700 flex items-start gap-2"><span className="text-amber-500">•</span>{s}</li>)}</ul></div>
        </Card>
        {feedback.improved_version && <Card className="p-6 mb-6 bg-emerald-50 border-emerald-200 rounded-2xl"><h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center gap-2"><Lightbulb className="w-5 h-5" /> Sample Improved Version</h3><p className="text-gray-700 whitespace-pre-line">{feedback.improved_version}</p></Card>}
        <div className="flex gap-3">
          <Button variant="outline" onClick={resetPractice} className="flex-1"><RotateCcw className="w-4 h-4 mr-2" /> Try Another</Button>
          <Button className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white" onClick={() => { setView('writing'); setFeedback(null); }}><PenTool className="w-4 h-4 mr-2" /> Revise Essay</Button>
        </div>
      </div>
    </div>
  );

  return null;
}
