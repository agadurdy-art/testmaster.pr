import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { MessageSquare, AlertTriangle, Send, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function FeedbackModal({ isOpen, onClose, user, type = 'feedback' }) {
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState(type === 'bug' ? 'bug' : 'general');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { id: 'general', label: 'General Feedback', icon: '💬' },
    { id: 'bug', label: 'Bug Report', icon: '🐛' },
    { id: 'feature', label: 'Feature Request', icon: '💡' },
    { id: 'content', label: 'Content Issue', icon: '📝' },
    { id: 'ui', label: 'UI/UX Feedback', icon: '🎨' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error('Please enter your feedback');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || null,
          user_email: user?.email || 'anonymous',
          user_name: user?.name || 'Anonymous User',
          type: category,
          message: message.trim(),
          rating: rating || null,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
        }),
      });

      if (!response.ok) throw new Error('Failed to submit');

      setSubmitted(true);
      toast.success('Thank you for your feedback!');
      
      // Reset after 2 seconds and close
      setTimeout(() => {
        setMessage('');
        setCategory(type === 'bug' ? 'bug' : 'general');
        setRating(0);
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      toast.error('Failed to submit feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isBugReport = type === 'bug';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            {isBugReport ? (
              <>
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Report an Issue
              </>
            ) : (
              <>
                <MessageSquare className="w-5 h-5 text-violet-500" />
                Give Feedback
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thank You!</h3>
            <p className="text-gray-600 text-sm">Your feedback helps us improve the platform.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2 rounded-lg text-left text-sm transition-colors flex items-center gap-2 ${
                      category === cat.id
                        ? 'bg-violet-100 border-2 border-violet-500 text-violet-700'
                        : 'bg-gray-50 border-2 border-transparent text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isBugReport ? 'Describe the issue' : 'Your feedback'}
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isBugReport
                    ? 'Please describe what happened, what you expected, and steps to reproduce...'
                    : 'Share your thoughts, suggestions, or ideas...'
                }
                className="min-h-[120px] border-gray-300"
                required
              />
            </div>

            {/* Rating (only for feedback, not bugs) */}
            {!isBugReport && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate your experience? (optional)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* User Info (readonly if logged in) */}
            {user && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                <p>Submitting as: <span className="font-medium">{user.name}</span> ({user.email})</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
