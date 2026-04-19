import React, { useEffect, useState } from 'react';
import { Star, Quote } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Public testimonials rail for the landing page. Reads only approved rows.
// Renders gracefully when empty (early days — no testimonials yet) by
// returning null rather than showing an empty section.
export default function TestimonialWall({ limit = 9, title = 'What learners say' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/testimonials?limit=${limit}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(d => { if (!cancelled) setItems(d.testimonials || []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [limit]);

  if (loading) return null;
  if (!items.length) return null;

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-teal-50/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-3">{title}</h2>
        <p className="text-center text-gray-600 mb-10">Real stories from IELTS Ace learners.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((t) => <TestimonialCard key={t.id} t={t} />)}
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ t }) {
  const initial = (t.name || '?').trim().charAt(0).toUpperCase();
  return (
    <div className="relative bg-white rounded-2xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition">
      <Quote className="absolute top-4 right-4 w-8 h-8 text-teal-100" />
      <div className="flex items-center gap-1 mb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < (t.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <p className="text-gray-800 text-sm leading-relaxed mb-4 line-clamp-6">
        "{t.quote}"
      </p>
      <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
        {t.avatar_url ? (
          <img src={t.avatar_url} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white font-semibold flex items-center justify-center">
            {initial}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{t.name}</div>
          {t.role && <div className="text-xs text-gray-500 truncate">{t.role}</div>}
        </div>
        {t.band_achieved != null && (
          <div className="text-right">
            <div className="text-xs text-gray-500">Band</div>
            <div className="text-sm font-bold text-teal-600">{t.band_achieved}</div>
          </div>
        )}
      </div>
    </div>
  );
}
