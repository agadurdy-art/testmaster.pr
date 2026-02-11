import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Target, ArrowRight, Clock, Zap, ChevronLeft,
  Headphones, BookOpen, Mic, PenTool, RefreshCw, Dumbbell
} from 'lucide-react';

const SKILL_ICONS = {
  listening: Headphones,
  reading: BookOpen,
  speaking: Mic,
  writing: PenTool
};

const SKILL_COLORS = {
  listening: 'from-blue-500 to-cyan-600',
  reading: 'from-emerald-500 to-green-600',
  speaking: 'from-violet-500 to-purple-600',
  writing: 'from-orange-500 to-amber-600'
};

export default function FocusPlan() {
  const location = useLocation();
  const navigate = useNavigate();
  const plan = location.state?.plan;

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <p className="text-gray-500 mb-4">No focus plan available. Complete a test first.</p>
          <Button onClick={() => navigate('/question-bank')}>Go to Tests</Button>
        </Card>
      </div>
    );
  }

  const SkillIcon = SKILL_ICONS[plan.skill] || Target;
  const gradient = SKILL_COLORS[plan.skill] || 'from-gray-500 to-gray-600';

  const handleStart = () => {
    if (plan.action_type === 'retry' && plan.action_data) {
      navigate(`/cambridge-test/${plan.action_data.bookId}/${plan.action_data.testId}`, {
        state: { 
          retryWrongOnly: true, 
          wrongQuestions: plan.action_data.wrongQuestions,
          retryLabel: plan.focus_area,
          testData: plan.action_data.testData
        }
      });
    } else if (plan.action_type === 'drill') {
      navigate(plan.action_data?.returnPath || '/question-bank', {
        state: { openDrills: true }
      });
    } else {
      navigate(plan.action_data?.targetPath || '/question-bank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className={`bg-gradient-to-r ${gradient} text-white`}>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-1 text-white/80 hover:text-white text-sm mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Results
          </button>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <SkillIcon className="w-6 h-6" />
            </div>
            <Badge className="bg-white/20 text-white border-0 text-xs">15-Minute Focus Plan</Badge>
          </div>
          
          <h1 data-testid="focus-plan-title" className="text-2xl sm:text-3xl font-bold mb-2">
            {plan.title}
          </h1>
          <p className="text-white/80 text-sm sm:text-base">{plan.subtitle}</p>
        </div>
      </div>

      {/* Plan Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-4">
        {/* Why This Focus */}
        <Card data-testid="focus-plan-why" className="p-6 mb-4 border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-gray-900">Why This Focus?</h2>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{plan.reason}</p>
          
          {plan.data_points && plan.data_points.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {plan.data_points.map((dp, i) => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border">
                  {dp}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Steps */}
        <Card data-testid="focus-plan-steps" className="p-6 mb-4 border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-900">Your Plan ({plan.steps?.length || 3} Steps)</h2>
          </div>
          <div className="space-y-4">
            {(plan.steps || []).map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${gradient} text-white text-sm font-bold flex items-center justify-center flex-shrink-0`}>
                  {i + 1}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-sm font-medium text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>
                  {step.duration && (
                    <span className="text-[10px] text-gray-400 mt-1 inline-block">{step.duration}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expected Outcome */}
        {plan.expected_outcome && (
          <Card className="p-5 mb-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800 text-sm">Expected Outcome</h3>
            </div>
            <p className="text-sm text-green-700">{plan.expected_outcome}</p>
          </Card>
        )}

        {/* Start Button */}
        <Button
          data-testid="focus-plan-start-btn"
          onClick={handleStart}
          className={`w-full py-6 text-lg font-semibold bg-gradient-to-r ${gradient} text-white border-0 shadow-xl rounded-2xl mb-8`}
        >
          {plan.action_type === 'retry' ? (
            <><RefreshCw className="w-5 h-5 mr-2" /> Start Practice</>
          ) : plan.action_type === 'drill' ? (
            <><Dumbbell className="w-5 h-5 mr-2" /> Start Drill</>
          ) : (
            <><ArrowRight className="w-5 h-5 mr-2" /> Start Focus Plan</>
          )}
        </Button>
      </div>
    </div>
  );
}
