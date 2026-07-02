import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { ACTIVITY_ICONS, ACTIVITY_LABELS } from '../lib/constants';

// ═══════ PLACEHOLDER ═══════
function PlaceholderActivity({ type, onComplete, onSkip, isSkippable }) {
  return (
    <Card className="p-12 text-center max-w-lg mx-auto" data-testid="placeholder-activity">
      <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
        {React.createElement(ACTIVITY_ICONS[type] || Play, { className: 'w-8 h-8 text-gray-400' })}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{ACTIVITY_LABELS[type] || type}</h3>
      <p className="text-gray-500 mb-6 text-sm">This activity module is coming soon.</p>
      <div className="flex justify-center gap-3">
        {isSkippable && <Button variant="outline" onClick={onSkip} data-testid="placeholder-skip-btn">Skip</Button>}
        <Button onClick={() => onComplete(100)} data-testid="placeholder-complete-btn">Mark Complete</Button>
      </div>
    </Card>
  );
}

export default PlaceholderActivity;
