import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, GitBranch, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Plan × learning_mode matrix. Helps decide whether GE and IELTS users
// convert at different rates, which feeds pricing / copy decisions.
export default function AdminLearningMode({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const isAdmin = user?.email && (
    user.email.includes('aga.durdy') ||
    user.email === 'admin@ieltsace.com' ||
    user.email === 'stemhousebenluc@gmail.com'
  );

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/learning-mode-stats`, {
        headers: { 'x-admin-email': user?.email || '' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    load();
  }, [isAdmin]); // eslint-disable-line

  if (!isAdmin) return null;

  // Collect the full set of plans seen so the table has consistent columns.
  const modes = data ? Object.keys(data.breakdown || {}) : [];
  const plans = data
    ? Array.from(new Set((data.flat || []).map(r => r.plan))).sort()
    : [];

  const rowTotal = (mode) =>
    plans.reduce((sum, p) => sum + (data.breakdown[mode]?.[p] || 0), 0);
  const colTotal = (plan) =>
    modes.reduce((sum, m) => sum + (data.breakdown[m]?.[plan] || 0), 0);
  const grandTotal = () => modes.reduce((sum, m) => sum + rowTotal(m), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <GitBranch className="w-7 h-7 text-indigo-400" /> Learning Mode × Plan
        </h1>
        <p className="text-gray-400 mb-6">Who's on what plan, broken down by learning mode.</p>

        {err && <Card className="p-4 mb-4 bg-red-900/30 border-red-800 text-red-200">{err}</Card>}

        {loading && !data ? (
          <Card className="p-8 text-center bg-gray-900 border-gray-800">Loading…</Card>
        ) : data ? (
          <Card className="p-5 bg-gray-900 border-gray-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-gray-400">
                <tr>
                  <th className="text-left py-2 pr-4">Mode</th>
                  {plans.map(p => (
                    <th key={p} className="text-right py-2 px-3 capitalize">{p}</th>
                  ))}
                  <th className="text-right py-2 pl-4 text-teal-300">Total</th>
                </tr>
              </thead>
              <tbody>
                {modes.map(m => (
                  <tr key={m} className="border-t border-gray-800">
                    <td className="py-2 pr-4 font-medium capitalize">{m.replace('_', ' ')}</td>
                    {plans.map(p => (
                      <td key={p} className="py-2 px-3 text-right font-mono">
                        {data.breakdown[m]?.[p] || 0}
                      </td>
                    ))}
                    <td className="py-2 pl-4 text-right font-mono text-teal-300">{rowTotal(m)}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-700 font-semibold">
                  <td className="py-2 pr-4">Total</td>
                  {plans.map(p => (
                    <td key={p} className="py-2 px-3 text-right font-mono">{colTotal(p)}</td>
                  ))}
                  <td className="py-2 pl-4 text-right font-mono text-teal-300">{grandTotal()}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
