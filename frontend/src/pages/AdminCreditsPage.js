import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { manualCreditSimple } from '../lib/api';
import { toast } from 'sonner';

export default function AdminCreditsPage({ user }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState('');
  const [credits, setCredits] = useState('');
  const [loading, setLoading] = useState(false);

  // Very simple guard: only allow a specific admin email for now
  const isAllowed = user?.email && user.email.includes('aga.durdy');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAllowed) {
      toast.error('You are not allowed to use this admin tool.');
      return;
    }
    if (!email) {
      toast.error('Please enter target user email');
      return;
    }

    const exam_credits = credits ? parseInt(credits, 10) : null;

    try {
      setLoading(true);
      const res = await manualCreditSimple({ email, plan: plan || null, exam_credits });
      toast.success(`Updated ${res.email}: ${JSON.stringify(res.update)}`);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Failed to update user';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold">Admin: Top Up Credits</h1>
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
        {!isAllowed && (
          <p className="text-xs text-red-600 mb-4">
            This page is restricted. Please log in with your admin account to use it.
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">User email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Plan (optional)</label>
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
            >
              <option value="">(no change)</option>
              <option value="free">Free</option>
              <optgroup label="IELTS-Ace (current)">
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="exam">Exam Pack</option>
              </optgroup>
              <optgroup label="Legacy General English">
                <option value="explorer">Explorer</option>
                <option value="learner">Learner</option>
                <option value="achiever">Achiever</option>
                <option value="master">Master</option>
                <option value="pro">Pro (alias → Master)</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Exam credits (optional)</label>
            <Input
              type="number"
              min="0"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              placeholder="e.g. 1, 2, 5, 8"
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Updating...' : 'Apply Update'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
