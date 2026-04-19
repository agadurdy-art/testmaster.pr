import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Star, Send, CheckCircle2 } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Self-serve testimonial submission. Lives on the dashboard (or /submit-story)
// so real users can leave a story. Posts to /api/testimonials which lands in
// a pending queue — nothing shows on the landing page until admin approves.
export default function TestimonialSubmitForm({ user, onSubmitted }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: '',
    quote: '',
    rating: 5,
    band_achieved: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(null);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (form.quote.trim().length < 10) {
      setErr('Please write at least a sentence or two.');
      return;
    }
    setSubmitting(true); setErr(null);
    try {
      const body = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role.trim() || null,
        quote: form.quote.trim(),
        rating: Number(form.rating),
        band_achieved: form.band_achieved ? Number(form.band_achieved) : null,
      };
      const res = await fetch(`${API_URL}/api/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
      setDone(true);
      if (onSubmitted) onSubmitted(data);
    } catch (e) {
      setErr(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <Card className="p-6 bg-emerald-50 border-emerald-200 text-emerald-900">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
          <div>
            <div className="font-semibold">Thank you!</div>
            <div className="text-sm">Your story is in review. We'll publish it once we've had a chance to read it.</div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-gray-200">
      <h3 className="text-lg font-semibold mb-1">Share your story</h3>
      <p className="text-sm text-gray-600 mb-4">
        Helped by Liz or the practice? We'd love to feature your experience. Moderated before it goes live.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Your name" value={form.name} onChange={set('name')} required />
          <Input type="email" placeholder="Email (private)" value={form.email} onChange={set('email')} required />
        </div>
        <Input
          placeholder="Role or goal (e.g. \u201cUniversity applicant, Band 7 target\u201d)"
          value={form.role}
          onChange={set('role')}
        />
        <textarea
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:ring-2 focus:ring-teal-500"
          rows={5}
          placeholder="Tell us what changed for you..."
          value={form.quote}
          onChange={set('quote')}
          required
          minLength={10}
          maxLength={600}
        />
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                type="button"
                key={n}
                onClick={() => setForm(f => ({ ...f, rating: n }))}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star
                  className={`w-6 h-6 ${n <= form.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              </button>
            ))}
          </div>
          <Input
            type="number"
            step="0.5"
            min="0"
            max="9"
            placeholder="Band achieved (optional)"
            value={form.band_achieved}
            onChange={set('band_achieved')}
            className="md:max-w-[200px]"
          />
        </div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <Button type="submit" disabled={submitting} className="bg-teal-600 hover:bg-teal-700 text-white">
          <Send className="w-4 h-4 mr-2" /> {submitting ? 'Sending…' : 'Submit story'}
        </Button>
      </form>
    </Card>
  );
}
