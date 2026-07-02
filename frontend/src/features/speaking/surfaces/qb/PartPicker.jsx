import React from 'react';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { ArrowLeft, User, FileText, MessageSquare, Award, ChevronRight } from 'lucide-react';

/**
 * Part 1 / Part 2 / Part 3 chooser shown after a module loads, plus the
 * Full Mock Test cross-sell card. Pure presentation — the page owns which
 * part is selected and what happens on selection.
 */
export default function PartPicker({ moduleContent, onChoosePart, onBackToModules, onFullMock }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{moduleContent.title || 'Speaking Module'}</h2>
          <p className="text-sm text-gray-500 mt-1">
            Choose a part to practise. Each part is scored on its own — come back here to try another.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBackToModules}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Modules
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Part 1 */}
        <Card
          className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-green-400 bg-gradient-to-br from-green-50 to-emerald-50"
          onClick={() => onChoosePart(1)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge className="bg-green-600 text-white mb-1">Part 1</Badge>
              <h3 className="font-bold text-gray-900">Introduction</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Familiar topic Q&amp;A. Short answers (~25s each).
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{moduleContent.part1?.questions?.length || 0} questions</span>
            <span>~4–5 min</span>
          </div>
        </Card>

        {/* Part 2 */}
        <Card
          className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-sky-50"
          onClick={() => onChoosePart(2)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge className="bg-blue-600 text-white mb-1">Part 2</Badge>
              <h3 className="font-bold text-gray-900">Long Turn</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Cue-card monologue. 1 min prep, 2 min speaking.
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="truncate pr-2">{moduleContent.part2?.cue_card?.topic || 'Cue card'}</span>
            <span>~3 min</span>
          </div>
        </Card>

        {/* Part 3 */}
        <Card
          className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-indigo-50"
          onClick={() => onChoosePart(3)}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <Badge className="bg-purple-600 text-white mb-1">Part 3</Badge>
              <h3 className="font-bold text-gray-900">Discussion</h3>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Abstract follow-ups. Longer, opinion-based answers (~75s).
          </p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{moduleContent.part3?.questions?.length || 0} questions</span>
            <span>~4–5 min</span>
          </div>
        </Card>
      </div>

      {/* Full Mock Test — one continuous ElevenLabs conversation with Liz,
          graded holistically. Lives at /full-mock (gating handled there). */}
      <Card
        className="p-5 cursor-pointer hover:shadow-md transition-all border-2 hover:border-amber-400 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50"
        onClick={onFullMock}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-amber-600 text-white">Full Test</Badge>
              <span className="text-xs text-amber-700 font-medium">Monthly · Exam Pack</span>
            </div>
            <h3 className="font-bold text-gray-900">All 3 parts back-to-back</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Simulate the full exam in one sitting — Part 1 → Part 2 → Part 3 with one shared theme.
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-gray-500">~11–14 min</div>
            <ChevronRight className="w-5 h-5 text-amber-700 ml-auto mt-1" />
          </div>
        </div>
      </Card>
    </div>
  );
}
