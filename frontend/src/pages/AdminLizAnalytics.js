import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, MessageSquare, BookOpen, Users, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminLizAnalytics({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/admin/liz-analytics?admin_email=${encodeURIComponent(user?.email || '')}`);
        if (!res.ok) throw new Error('Access denied');
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const maxCount = data?.users_by_plan?.length
    ? Math.max(...data.users_by_plan.map(p => p.count))
    : 1;

  return (
    <div className="min-h-screen bg-gray-950 pb-20">
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/admin')} className="text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Admin
          </Button>
          <div className="h-5 w-px bg-gray-800" />
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Liz Analytics</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Stats row */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Liz Sessions', value: data.total_sessions, icon: MessageSquare, color: 'from-violet-500 to-purple-600' },
                { label: 'Sessions This Month', value: data.sessions_this_month, icon: Brain, color: 'from-blue-500 to-cyan-600' },
                { label: 'Homework Assigned', value: data.total_homework_assigned, icon: BookOpen, color: 'from-emerald-500 to-teal-600' },
              ].map(stat => (
                <Card key={stat.label} className="bg-gray-900 border-gray-800 p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value?.toLocaleString() ?? '—'}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Users by plan */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <div className="flex items-center gap-2 mb-5">
                <Users className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-semibold text-white">Users by Plan</h2>
              </div>
              {data.users_by_plan?.length === 0 && (
                <p className="text-gray-500 text-sm">No data yet.</p>
              )}
              <div className="space-y-3">
                {data.users_by_plan?.map(item => (
                  <div key={item._id || 'none'}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300 capitalize">{item._id || 'No plan'}</span>
                      <span className="text-sm font-semibold text-white">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${Math.round((item.count / maxCount) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
