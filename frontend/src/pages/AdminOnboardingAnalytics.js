import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Users, Target, Mic, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SKILL_COLORS = {
  writing: 'from-rose-500 to-pink-600',
  speaking: 'from-orange-500 to-amber-600',
  reading: 'from-blue-500 to-cyan-600',
  listening: 'from-emerald-500 to-teal-600',
};

export default function AdminOnboardingAnalytics({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/admin/onboarding-analytics?admin_email=${encodeURIComponent(user?.email || '')}`);
        if (!res.ok) throw new Error('Access denied');
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const maxBand = data?.target_band_distribution?.length
    ? Math.max(...data.target_band_distribution.map(b => b.count))
    : 1;
  const maxSkill = data?.weakest_skill_distribution?.length
    ? Math.max(...data.weakest_skill_distribution.map(s => s.count))
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Onboarding Analytics</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* Overview stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Users', value: data.total_users, icon: Users, color: 'from-gray-600 to-gray-700' },
                { label: 'Onboarding Complete', value: `${data.onboarding_complete} (${data.onboarding_rate}%)`, icon: Target, color: 'from-teal-500 to-emerald-600' },
                { label: 'IELTS Ace', value: data.ielts_mode_users, icon: BarChart3, color: 'from-violet-500 to-purple-600' },
                { label: 'General English', value: data.general_mode_users, icon: Mic, color: 'from-blue-500 to-cyan-600' },
              ].map(stat => (
                <Card key={stat.label} className="bg-gray-900 border-gray-800 p-5">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value ?? '—'}</div>
                  <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Learning mode split */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-base font-semibold text-white mb-4">Learning Mode Split</h2>
              <div className="flex gap-2 h-8 rounded-full overflow-hidden">
                {data.total_users > 0 && (
                  <>
                    <div
                      className="bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center text-xs text-white font-semibold"
                      style={{ width: `${Math.round(data.ielts_mode_users / data.total_users * 100)}%` }}
                    >
                      {Math.round(data.ielts_mode_users / data.total_users * 100)}%
                    </div>
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 flex items-center justify-center text-xs text-white font-semibold"
                      style={{ width: `${Math.round(data.general_mode_users / data.total_users * 100)}%` }}
                    >
                      {Math.round(data.general_mode_users / data.total_users * 100)}%
                    </div>
                    <div
                      className="bg-gray-800 flex items-center justify-center text-xs text-gray-500 font-semibold flex-1"
                    >
                      {data.no_mode_selected} none
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-6 mt-3 text-xs text-gray-400">
                <span><span className="inline-block w-2 h-2 rounded-full bg-violet-500 mr-1" />IELTS Ace</span>
                <span><span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1" />General English</span>
                <span><span className="inline-block w-2 h-2 rounded-full bg-gray-600 mr-1" />Not selected</span>
              </div>
            </Card>

            {/* Target band + Weakest skill */}
            <div className="grid sm:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <h2 className="text-base font-semibold text-white mb-4">Target Band Distribution</h2>
                {data.target_band_distribution?.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
                <div className="space-y-3">
                  {data.target_band_distribution?.map(item => (
                    <div key={item._id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300">Band {item._id}</span>
                        <span className="text-sm font-semibold text-white">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                          style={{ width: `${Math.round((item.count / maxBand) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6">
                <h2 className="text-base font-semibold text-white mb-4">Weakest Skill</h2>
                {data.weakest_skill_distribution?.length === 0 && <p className="text-gray-500 text-sm">No data yet.</p>}
                <div className="space-y-3">
                  {data.weakest_skill_distribution?.map(item => (
                    <div key={item._id}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-300 capitalize">{item._id}</span>
                        <span className="text-sm font-semibold text-white">{item.count}</span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${SKILL_COLORS[item._id] || 'from-gray-500 to-gray-600'} rounded-full`}
                          style={{ width: `${Math.round((item.count / maxSkill) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
