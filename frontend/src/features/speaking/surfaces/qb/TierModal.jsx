import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Award, Mic, CheckCircle, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Evaluation Tier Selection Modal — shown when a part completes. Basic is
 * free; Premium requires at least 1 credit (guarded here with the same
 * toast the inline version used).
 */
export default function TierModal({ userCredits, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg p-6 bg-white">
        <h2 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" /> Test Completed! 🎉
        </h2>
        <p className="text-gray-500 mb-4">Choose your evaluation type:</p>

        {/* User Credits Display */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-600">Your Credits:</span>
          <Badge className={userCredits > 0 ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}>
            {userCredits} credit{userCredits !== 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Free Tier */}
          <Card
            className="p-4 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-400 bg-green-50/50"
            onClick={() => onSubmit('free')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mic className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Basic Evaluation</h3>
                  <Badge className="bg-green-100 text-green-700">FREE</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-2">AI-powered analysis with Whisper + GPT-4o</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Band estimation</li>
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Strengths & weaknesses</li>
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> General feedback</li>
                </ul>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
            </div>
          </Card>

          {/* Premium Tier */}
          <Card
            className={`p-4 cursor-pointer hover:shadow-md transition-all border-2 bg-gradient-to-r from-purple-50 to-indigo-50 ${userCredits > 0 ? 'hover:border-purple-400' : 'opacity-75'}`}
            onClick={() => userCredits > 0 ? onSubmit('premium') : toast.error('You need at least 1 credit for premium evaluation')}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">Premium Evaluation</h3>
                  <Badge className="bg-purple-100 text-purple-700">1 Token</Badge>
                </div>
                <p className="text-sm text-gray-500 mb-2">Azure Pronunciation Assessment + Advanced AI</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Word-level accuracy scores</li>
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Phoneme analysis (ses yutma tespiti)</li>
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Missing endings detection</li>
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Fluency & prosody scores</li>
                  <li className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-purple-500" /> Mentor notes & practice focus</li>
                </ul>
                {userCredits === 0 && (
                  <p className="text-xs text-red-500 mt-2">⚠️ You need at least 1 credit</p>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 mt-4" />
            </div>
          </Card>
        </div>

        <p className="text-xs text-gray-400 mt-4 text-center">
          1 Credit = 5 Tokens • Premium gives detailed pronunciation feedback
        </p>
      </Card>
    </div>
  );
}
