import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PenTool, ArrowRight, Loader2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function LearningToolsIndex({ user }) {
  const navigate = useNavigate();
  const [vocabTopics, setVocabTopics] = useState([]);
  const [grammarTopics, setGrammarTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('vocabulary');

  useEffect(() => {
    async function load() {
      try {
        const [vRes, gRes] = await Promise.all([
          fetch(`${API_URL}/api/learning-tools/vocabulary`),
          fetch(`${API_URL}/api/learning-tools/grammar`),
        ]);
        const vData = await vRes.json();
        const gData = await gRes.json();
        setVocabTopics(vData.topics || []);
        setGrammarTopics(gData.topics || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <button onClick={() => navigate('/dashboard')} className="text-sm text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1">
            ← Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Learning Tools</h1>
          <p className="text-gray-500 mt-1">Topic-based vocabulary and grammar practice for IELTS</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'vocabulary'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Vocabulary
          </button>
          <button
            onClick={() => setActiveTab('grammar')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition ${
              activeTab === 'grammar'
                ? 'bg-violet-600 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'
            }`}
          >
            <PenTool className="w-4 h-4" />
            Grammar
          </button>
        </div>

        {/* Vocabulary Grid */}
        {activeTab === 'vocabulary' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{vocabTopics.length} IELTS topic areas — click to practice</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vocabTopics.map(topic => (
                <button
                  key={topic.topic}
                  onClick={() => navigate(topic.route)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-violet-400 hover:shadow-md transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center mb-3">
                    <BookOpen className="w-5 h-5 text-violet-600" />
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-violet-700 mb-1">{topic.topic}</div>
                  <div className="text-xs text-gray-400">{topic.word_count} words</div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-violet-500 font-semibold opacity-0 group-hover:opacity-100 transition">
                    Practice now <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grammar Grid */}
        {activeTab === 'grammar' && (
          <div>
            <p className="text-sm text-gray-500 mb-4">{grammarTopics.length} grammar topics — 5-stage learning for each</p>
            <div className="grid sm:grid-cols-2 gap-4">
              {grammarTopics.map(topic => (
                <button
                  key={topic.topic}
                  onClick={() => navigate(topic.route)}
                  className="bg-white border border-gray-200 rounded-2xl p-5 text-left hover:border-violet-400 hover:shadow-md transition group"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center mb-3">
                    <PenTool className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="font-semibold text-gray-900 group-hover:text-violet-700 mb-1">{topic.topic}</div>
                  <div className="text-xs text-gray-400">{topic.description}</div>
                  <div className="mt-3 flex items-center gap-1 text-xs text-violet-500 font-semibold opacity-0 group-hover:opacity-100 transition">
                    Start learning <ArrowRight className="w-3 h-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Liz CTA */}
        <div className="mt-10 bg-violet-50 border border-violet-200 rounded-2xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-violet-200 flex-shrink-0 overflow-hidden">
            <img src="/liz-avatar.svg" alt="Liz" className="w-full h-full object-cover"
              onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-gray-900 mb-1">Not sure where to start?</div>
            <div className="text-sm text-gray-500">Ask Liz — she'll tell you exactly which topic to focus on based on your weak areas.</div>
          </div>
          <button
            onClick={() => navigate('/liz')}
            className="px-4 py-2 bg-violet-600 text-white font-semibold rounded-xl text-sm hover:bg-violet-700 transition flex-shrink-0"
          >
            Ask Liz →
          </button>
        </div>

      </div>
    </div>
  );
}
