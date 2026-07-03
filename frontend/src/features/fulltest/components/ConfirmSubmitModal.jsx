import React from 'react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Loader2 } from 'lucide-react';

// Submit Confirmation Modal
export default function ConfirmSubmitModal({ currentSection, submitting, setShowConfirmSubmit, submitCurrentSection }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Submit {currentSection}?</h3>
        <p className="text-slate-600 mb-6">You cannot return to this section after submitting.</p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>Cancel</Button>
          <Button onClick={submitCurrentSection} disabled={submitting} className="bg-slate-900">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
