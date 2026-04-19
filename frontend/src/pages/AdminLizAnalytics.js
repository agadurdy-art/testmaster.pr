import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { ArrowLeft, MessageSquare, Users, TrendingUp, Crown, RefreshCw } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Admin-only Liz usage dashboard. Feeds off /api/admin/liz-analytics,
// which aggregates from users.monthly_usage.liz_messages + the
// liz_conversations collection. Emails are already redacted server-side.
export default function AdminLizAnalytics({ user }) {
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
      const res = await fetch(`${API_URL}/api/admin/liz-analytics`, {
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
          <MessageSquare className="w-7 h-7 text-teal-400" /> Liz Analytics
        </h1>
        <p className="text-gray-400 mb-6">Conversations, messages, and top engagement over the last 30 days.</p>

        {err && (
          <Card className="p-4 mb-4 bg-red-900/30 border-red-800 text-red-200">{err}</Card>
        )}

        {loading && !data ? (
          <Card className="p-8 text-center bg-gray-900 border-gray-800">Loading…</Card>
        ) : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <StatCard icon={MessageSquare} label="Total messages" value={data.total_messages} />
              <StatCard icon={Users} label="Active users (30d)" value={data.active_users_30d} />
              <StatCard icon={TrendingUp} label="Avg msgs / user" value={data.avg_messages_per_user} />
              <StatCard icon={Crown} label="Conversations" value={data.total_conversations} />
            </div>

            <Card className="p-5 bg-gray-900 border-gray-800">
              <h2 className="text-xl font-semibold mb-3">Top Users (redacted)</h2>
              {(!data.top_users || data.top_users.length === 0) ? (
                <p className="text-gray-500">No active Liz users yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="text-gray-400">
                    <tr>
                      <th className="text-left py-2">#</th>
                      <th className="text-left py-2">Email</th>
                      <th className="text-right py-2">Messages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.top_users.map((u, i) => (
                      <tr key={i} className="border-t border-gray-800">
                        <td className="py-2 text-gray-500">{i + 1}</td>
                        <td className="py-2">{u.email}</td>
                        <td className="py-2 text-right font-mono">{u.messages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4 bg-gray-900 border-gray-800">
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
        <Icon className="w-4 h-4" /> {label}
      </div>
      <div className="text-2xl font-bold">{value ?? 0}</div>
    </Card>
  );
}
