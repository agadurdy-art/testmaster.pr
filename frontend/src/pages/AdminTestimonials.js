import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  ArrowLeft, Star, Check, X, Trash2, RefreshCw, MessageSquare,
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'all', label: 'All' },
];

// Admin moderation queue for user-submitted testimonials. Approve → shows on
// the landing page's TestimonialWall. Reject → hides, keeps record. Delete →
// wipes the row. Header-based admin auth (x-admin-email).
export default function AdminTestimonials({ user }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('pending');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [acting, setActing] = useState(null); // id currently being acted on

  const isAdmin = user?.email && (
    user.email.includes('aga.durdy') ||
    user.email === 'admin@ieltsace.com' ||
    user.email === 'stemhousebenluc@gmail.com'
  );

  const load = async () => {
    setLoading(true); setErr(null);
    try {
      const q = tab === 'all' ? '' : `?status=${tab}`;
      const res = await fetch(`${API_URL}/api/admin/testimonials${q}`, {
        headers: { 'x-admin-email': user?.email || '' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(data.testimonials || []);
    } catch (e) {
      setErr(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return; }
    load();
  }, [isAdmin, tab]); // eslint-disable-line

  const act = async (id, action) => {
    setActing(id);
    try {
      const method = action === 'delete' ? 'DELETE' : 'POST';
      const path = action === 'delete'
        ? `/api/admin/testimonials/${id}`
        : `/api/admin/testimonials/${id}/${action}`;
      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: { 'x-admin-email': user?.email || '' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setItems(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert(e.message || 'Action failed');
    } finally {
      setActing(null);
    }
  };

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
          <MessageSquare className="w-7 h-7 text-amber-400" /> Testimonials
        </h1>
        <p className="text-gray-400 mb-6">Approve what ships to the landing page. Reject or delete anything that doesn't belong.</p>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition ${
                tab === t.id ? 'bg-teal-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {err && <Card className="p-4 mb-4 bg-red-900/30 border-red-800 text-red-200">{err}</Card>}

        {loading ? (
          <Card className="p-8 text-center bg-gray-900 border-gray-800">Loading…</Card>
        ) : items.length === 0 ? (
          <Card className="p-8 text-center bg-gray-900 border-gray-800 text-gray-400">
            Nothing in this queue.
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(t => (
              <Card key={t.id} className="p-5 bg-gray-900 border-gray-800">
                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                  <div>
                    <div className="font-semibold">{t.name} <span className="text-gray-500 text-sm font-normal">· {t.email}</span></div>
                    {t.role && <div className="text-sm text-gray-400">{t.role}</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < (t.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-gray-600'}`}
                      />
                    ))}
                    {t.band_achieved != null && (
                      <span className="ml-3 px-2 py-0.5 rounded bg-teal-900/40 text-teal-300 text-xs">Band {t.band_achieved}</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-200 text-sm leading-relaxed mb-4 whitespace-pre-line">"{t.quote}"</p>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="text-xs text-gray-500">
                    Status: <span className="capitalize">{t.status}</span> · submitted {t.created_at ? t.created_at.slice(0, 10) : '?'}
                  </div>
                  <div className="flex gap-2">
                    {t.status !== 'approved' && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700"
                        disabled={acting === t.id}
                        onClick={() => act(t.id, 'approve')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                    )}
                    {t.status !== 'rejected' && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acting === t.id}
                        onClick={() => act(t.id, 'reject')}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-700 text-red-400 hover:bg-red-900/30"
                      disabled={acting === t.id}
                      onClick={() => {
                        if (window.confirm('Delete this testimonial permanently?')) act(t.id, 'delete');
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
