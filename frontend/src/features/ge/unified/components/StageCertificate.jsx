import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, Award, Star, Sparkles, ArrowLeft, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../../../../components/ui/button';

// ═══════ STAGE CERTIFICATE (Final Gate Celebration) ═══════
function StageCertificate({ lesson, activityScores }) {
  const navigate = useNavigate();
  const confettiFired = useRef(false);
  const stageNum = parseInt(lesson?.stage_id?.replace('stage_', '') || '1');
  const nextStageId = `stage_${stageNum + 1}`;

  const scores = Object.values(activityScores).filter(s => typeof s === 'number');
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 85;
  const passed = avgScore >= 80;

  useEffect(() => {
    if (confettiFired.current) return;
    confettiFired.current = true;
    if (passed) {
      const duration = 3000;
      const end = Date.now() + duration;
      const colors = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899'];
      (function frame() {
        confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors });
        confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors });
        if (Date.now() < end) requestAnimationFrame(frame);
      })();
    }
  }, [passed]);

  const stageNames = { 1: 'Foundations', 2: 'Starters', 3: 'Movers', 4: 'Flyers' };
  const stageName = stageNames[stageNum] || `Stage ${stageNum}`;
  const nextStageName = stageNames[stageNum + 1] || `Stage ${stageNum + 1}`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 30%, #fbbf24 60%, #f59e0b 100%)' }} data-testid="stage-certificate">
      <div className="max-w-lg w-full">
        {passed ? (
          <div className="text-center space-y-6" data-testid="certificate-passed">
            <div className="relative inline-block">
              <div className="w-28 h-28 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-4 border-amber-400">
                <Trophy className="w-14 h-14 text-amber-500" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-black text-amber-900">Congratulations!</h1>
              <p className="text-lg text-amber-800 font-medium">You are now a <span className="font-black">{stageName} Graduate</span></p>
            </div>

            <div className="bg-white/90 backdrop-blur rounded-2xl p-6 shadow-xl border border-amber-200 mx-auto max-w-sm" data-testid="certificate-card">
              <div className="border-2 border-amber-300 rounded-xl p-5 space-y-3" style={{ borderStyle: 'dashed' }}>
                <div className="flex items-center justify-center gap-2 text-amber-600">
                  <Award className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-widest">Certificate of Completion</span>
                  <Award className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Stage {stageNum}: {stageName}</h2>
                <div className="text-4xl font-black text-amber-600">{avgScore}%</div>
                <p className="text-sm text-gray-600">12 Units &middot; 48 Lessons Mastered</p>
                <div className="flex justify-center gap-1 pt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.ceil(avgScore / 20) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-md border border-green-200 mx-auto max-w-sm" data-testid="stage-unlock-card">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-green-800">Stage {stageNum + 1}: {nextStageName}</p>
                  <p className="text-xs text-green-600">Unlocked! Ready for new adventures.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} className="border-amber-300 text-amber-800 hover:bg-amber-100" data-testid="certificate-back-btn">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to {stageName}
              </Button>
              <Button onClick={() => navigate(`/unified/stage/${nextStageId}`)} className="bg-green-600 hover:bg-green-700 text-white shadow-lg" data-testid="certificate-next-stage-btn">
                Start {nextStageName} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6" data-testid="certificate-retry">
            <div className="w-24 h-24 rounded-full bg-white shadow-xl flex items-center justify-center mx-auto border-4 border-orange-300">
              <RefreshCw className="w-12 h-12 text-orange-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-amber-900">Almost There!</h1>
              <p className="text-lg text-amber-800">You scored <span className="font-black text-orange-600">{avgScore}%</span> &mdash; you need 80% to graduate.</p>
            </div>
            <div className="bg-white/90 backdrop-blur rounded-xl p-5 shadow-md border border-orange-200 max-w-sm mx-auto">
              <p className="text-sm text-gray-700">Review the lessons you found difficult and try the Final Gate again. You can do it!</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button variant="outline" onClick={() => navigate(`/unified/stage/${lesson.stage_id}`)} className="border-amber-300 text-amber-800" data-testid="certificate-review-btn">
                <ArrowLeft className="w-4 h-4 mr-2" /> Review Lessons
              </Button>
              <Button onClick={() => window.location.reload()} className="bg-orange-500 hover:bg-orange-600 text-white" data-testid="certificate-retry-btn">
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StageCertificate;
