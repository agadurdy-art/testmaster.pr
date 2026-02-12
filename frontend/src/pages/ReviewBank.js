import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  ChevronLeft, ChevronRight, RotateCcw, CheckCircle, 
  XCircle, BookOpen, Volume2, Inbox
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function ReviewBank({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewingWord, setReviewingWord] = useState(false);

  useEffect(() => { if (user) fetchReviewBank(); }, [user]);

  const fetchReviewBank = async () => {
    try {
      const res = await fetch(`${API_URL}/api/vocabulary-engine/review-bank/${user.id}`);
      if (res.ok) setData(await res.json());
    } catch { toast.error('Connection error'); }
    finally { setLoading(false); }
  };

  const speakText = (text) => {
    if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 0.85; window.speechSynthesis.speak(u); }
  };

  const handleReview = async (knewIt) => {
    if (!data?.words?.length) return;
    const word = data.words[currentIdx];
    setReviewingWord(true);
    try {
      await fetch(`${API_URL}/api/vocabulary-engine/review-bank/review`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, word: word.word, module_id: word.module_id, knew_it: knewIt }),
      });
      toast.success(knewIt ? 'Great job!' : 'Added back for review');
      // Move to next or refetch
      if (currentIdx < data.words.length - 1) {
        setCurrentIdx(p => p + 1);
        setFlipped(false);
      } else {
        // Refresh the bank
        setCurrentIdx(0);
        setFlipped(false);
        await fetchReviewBank();
      }
    } catch { toast.error('Failed to save review'); }
    finally { setReviewingWord(false); }
  };

  if (loading) return <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center" data-testid="review-bank-loading"><div className="animate-spin rounded-full h-8 w-8 border-[3px] border-gray-200 border-t-orange-500" /></div>;

  const words = data?.words || [];
  const hasDueWords = words.length > 0;

  // Empty state
  if (!hasDueWords) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="review-bank-empty">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
          <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
            <button onClick={() => navigate('/advanced-mastery')} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-from-review"><ChevronLeft className="w-4 h-4" /> Back</button>
            <p className="text-[15px] font-semibold text-[#1D1D1F]">Review Bank</p>
            <div />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-green-50 flex items-center justify-center"><CheckCircle className="w-10 h-10 text-green-500" /></div>
            <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-2">All caught up!</h2>
            <p className="text-[14px] text-[#86868B] mb-2">No words to review right now.</p>
            {data?.mastered > 0 && <p className="text-[13px] text-green-600 font-medium mb-6">{data.mastered} word{data.mastered > 1 ? 's' : ''} mastered</p>}
            <button onClick={() => navigate('/advanced-mastery')} className="h-11 rounded-full bg-orange-500 text-white text-[14px] font-semibold px-6 shadow-[0_2px_10px_rgba(234,88,12,0.3)]" data-testid="back-to-course-empty">Continue Learning</button>
          </div>
        </div>
      </div>
    );
  }

  const word = words[currentIdx];

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col" data-testid="review-bank-page">
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-black/[0.04]">
        <div className="flex items-center justify-between px-4 py-3 max-w-3xl mx-auto">
          <button onClick={() => navigate('/advanced-mastery')} className="flex items-center gap-1.5 text-sm text-orange-500 font-medium" data-testid="back-from-review"><ChevronLeft className="w-4 h-4" /> Back</button>
          <p className="text-[15px] font-semibold text-[#1D1D1F]">Review Bank</p>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-[12px] font-semibold"><Inbox className="w-3 h-3 mr-1" />{words.length}</Badge>
            {data?.mastered > 0 && <Badge className="bg-green-50 text-green-600 border-green-200 text-[12px] font-semibold"><CheckCircle className="w-3 h-3 mr-1" />{data.mastered}</Badge>}
          </div>
        </div>
        <div className="h-[3px] bg-black/[0.04]">
          <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${((currentIdx + 1) / words.length) * 100}%` }} />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl">
          {/* Stats bar */}
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-[12px] text-[#AEAEB2] tabular-nums">Card {currentIdx + 1} of {words.length}</span>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#AEAEB2]">Mistakes: {word.mistake_count}</span>
              <span className="text-[12px] text-[#AEAEB2]">Reviews: {word.review_count}</span>
            </div>
          </div>

          {/* Flashcard */}
          <div className="cursor-pointer" onClick={() => setFlipped(!flipped)} data-testid="review-card">
            <div className="bg-white rounded-[20px] p-8 min-h-[300px] flex flex-col shadow-[0_2px_15px_rgba(0,0,0,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <Badge className="bg-orange-50 text-orange-600 border-orange-200 text-[11px] font-semibold">
                  {word.category === 'quiz_mistake' ? 'Quiz Review' : word.category || 'Review'}
                </Badge>
                <button onClick={(e) => { e.stopPropagation(); speakText(word.word); }} className="w-9 h-9 rounded-full bg-[#F5F5F7] flex items-center justify-center hover:bg-gray-200/60" data-testid="review-tts-btn">
                  <Volume2 className="w-[18px] h-[18px] text-[#86868B]" />
                </button>
              </div>

              {!flipped ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center" data-testid="review-card-front">
                  <h1 className="text-[36px] sm:text-[44px] font-bold text-[#1D1D1F] tracking-tight">{word.word}</h1>
                  <p className="text-[13px] text-[#AEAEB2] mt-6">Tap to see meaning</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-center" data-testid="review-card-back">
                  <h2 className="text-[22px] font-bold text-[#1D1D1F] mb-3">{word.word}</h2>
                  {word.meaning && <p className="text-[15px] text-[#3A3A3C] leading-relaxed">{word.meaning}</p>}
                  <p className="text-[13px] text-[#AEAEB2] mt-4">Source: {word.source}</p>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-4 mt-8 justify-center">
            <button 
              onClick={() => handleReview(false)} 
              disabled={reviewingWord}
              className="flex-1 max-w-[180px] h-14 rounded-2xl bg-white border border-red-200 text-red-500 text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-red-50 transition-colors disabled:opacity-40"
              data-testid="review-dont-know-btn"
            >
              <XCircle className="w-5 h-5" /> Still Learning
            </button>
            <button 
              onClick={() => handleReview(true)} 
              disabled={reviewingWord}
              className="flex-1 max-w-[180px] h-14 rounded-2xl bg-white border border-green-200 text-green-600 text-[15px] font-semibold flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:bg-green-50 transition-colors disabled:opacity-40"
              data-testid="review-know-btn"
            >
              <CheckCircle className="w-5 h-5" /> Got It!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
