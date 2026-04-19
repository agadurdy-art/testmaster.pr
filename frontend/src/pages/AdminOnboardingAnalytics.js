import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, UserPlus, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Onboarding funnel + path distribution. Backend aggregates are read-only
// and already scoped — no PII leaves the server here.
export default function AdminOnboardingAnalytics({ user }) {
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
      const res = await fetch(`${API_URL}/api/admin/onboarding-analytics`, {
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

  const pct = (n, total) => total ? Math.round((n / total) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="text-gray-300">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Admin
          </Button>
          <Button variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>

        <h1 className="text-3xl font-bold mb-1 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-emerald-400" /> Onboarding Analytics
        </h1>
        <p className="text-gray-400 mb-6">Completion funnel and IELTS vs General English split.</p>

        {err && <Card className="p-4 mb-4 bg-red-900/30 border-red-800 text-red-200">{err}</Card>}

        {loading && !data ? (
          <Card className="p-8 text-center bg-gray-900 border-gray-800">Loading…</Card>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={UserPlus} label="Total users" value={data.total_users} />
              <StatCard icon={CheckCircle2} label="Completed" value={data.completed} sub={`${data.completion_rate_pct}%`} />
              <StatCard icon={Clock} label="Incomplete" value={data.incomplete} />
              <StatCard icon={CheckCircle2} label="Last 7d completed" value={data.last_7d_completed} />
            </div>

            <Card className="p-5 bg-gray-900 border-gray-800">
              <h2 className="text-xl font-semibold mb-4">Learning Path Distribution</h2>
              {['ielts', 'general_english', 'unset'].map((k) => {
                const n = data.path_distribution?.[k] ?? 0;
                const p = pct(n, data.total_users);
                const label = k === 'general_english' ? 'General English' : k === 'ielts' ? 'IELTS' : 'Unset';
                const color = k === 'ielts' ? 'bg-teal-500' : k === 'general_english' ? 'bg-indigo-500' : 'bg-gray-600';
                return (
                  <div key={k} className="mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{label}</span>
                      <span className="text-gray-400">{n} ({p}%)</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded overflow-hidden">
                      <div className={`h-full ${color}`} style={{ width: `${p}%` }} />
                    </div>
                  </div>
                );
              })}
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-2xl font-bold">{value ?? 0}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </Card>
  );
}
