import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map, GraduationCap, Globe, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function AdminLearningMode({ user }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_URL}/api/admin/learning-mode-stats?admin_email=${encodeURIComponent(user?.email || '')}`);
        if (!res.ok) throw new Error('Access denied');
        setData(await res.json());
      } catch (e) {
        setError(e.message);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const total = (data?.ielts_users ?? 0) + (data?.general_users ?? 0);
  const maxStage = data?.unified_stage_engagement?.length
    ? Math.max(...data.unified_stage_engagement.map(s => s.count))
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Map className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-white">Learning Mode Stats</h1>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-red-400 text-center">
            {error}
          </div>
        )}

        {data && (
          <div className="space-y-6">
            {/* IELTS vs General split */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-3">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{data.ielts_users}</div>
                <div className="text-sm text-gray-500 mt-1">IELTS Ace users</div>
                {total > 0 && (
                  <div className="mt-3 text-xs text-violet-400 font-semibold">
                    {Math.round(data.ielts_users / total * 100)}% of total
                  </div>
                )}
              </Card>

              <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center mb-3">
                  <Globe className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold text-white">{data.general_users}</div>
                <div className="text-sm text-gray-500 mt-1">General English users</div>
                {total > 0 && (
                  <div className="mt-3 text-xs text-sky-400 font-semibold">
                    {Math.round(data.general_users / total * 100)}% of total
                  </div>
                )}
              </Card>
            </div>

            {/* Unified stage engagement */}
            <Card className="bg-gray-900 border-gray-800 p-6">
              <h2 className="text-base font-semibold text-white mb-5">Unified Course Stage Engagement</h2>
              {data.unified_stage_engagement?.length === 0 && (
                <p className="text-gray-500 text-sm">No stage progress data yet.</p>
              )}
              <div className="space-y-3">
                {data.unified_stage_engagement?.map(item => (
                  <div key={item._id || 'unknown'}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-300 capitalize">{item._id || 'Unknown stage'}</span>
                      <span className="text-sm font-semibold text-white">{item.count} users</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all"
                        style={{ width: `${Math.round((item.count / maxStage) * 100)}%` }}
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
