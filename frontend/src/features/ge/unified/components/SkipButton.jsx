import React from 'react';
import { ChevronRight } from 'lucide-react';

// ═══════ SKIP BUTTON ═══════
function SkipButton({ onSkip, label = 'Skip' }) {
  return (
    <button onClick={onSkip} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1" data-testid="activity-skip-btn">
      {label} <ChevronRight className="w-3 h-3" />
    </button>
  );
}

export default SkipButton;
