import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import FeedbackModal from './FeedbackModal';

/**
 * Floating feedback button for logged-in users. Sits bottom-left so it does
 * not collide with LizFloatingButton (bottom-right). Click opens the existing
 * FeedbackModal which POSTs to /api/feedback.
 *
 * `railVisible` (desktop ≥ lg): when the global 264px left nav rail is showing,
 * shift the button right of it so it no longer covers the rail's profile chip.
 */
export default function FeedbackLauncher({ user, railVisible = false }) {
  const [open, setOpen] = useState(false);
  if (!user) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Send feedback"
        className={`fixed bottom-6 left-6 z-40 flex items-center gap-2 rounded-full bg-white text-violet-700 border border-violet-200 shadow-lg hover:shadow-xl hover:bg-violet-50 px-4 py-2.5 text-sm font-medium transition-all ${railVisible ? 'lg:left-[284px]' : ''}`}
      >
        <MessageSquare className="w-4 h-4" />
        <span className="hidden sm:inline">Feedback</span>
      </button>
      <FeedbackModal isOpen={open} onClose={() => setOpen(false)} user={user} />
    </>
  );
}
