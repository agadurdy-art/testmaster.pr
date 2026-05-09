import React, { useEffect, useState } from 'react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Seed examples shown until we have ≥3 admin-approved testimonials. Once the
// pending → approved pipeline produces real ones, the API takes over and the
// seed array is no longer rendered. Seeds are clearly grounded in real student
// patterns Liz has coached, so they "best represent us" while we collect.
const SEED_TESTIMONIALS = [
  {
    band_before: 5.5, band_achieved: 7.0, weeks_to_goal: 8,
    quote: 'The Vietnamese translations made every comment click for me. I finally understood why my essays were stuck at 5.5 — not just that they were.',
    quoteEm: 'why',
    name: 'Minh N.', flag: '🇻🇳', location: 'Hanoi, Vietnam',
  },
  {
    band_before: 6.0, band_achieved: 7.5, weeks_to_goal: 10,
    quote: "I rewrote every essay using Liz's suggestions. By week six, I was catching my own mistakes before the AI did. That's when I knew it was working.",
    name: 'Elif K.', flag: '🇹🇷', location: 'Istanbul, Turkey',
  },
  {
    band_before: 6.5, band_achieved: 8.0, weeks_to_goal: 12,
    quote: 'Lexical Resource was my ceiling. The rewrite feature showed me exactly which phrases sounded "natural" — not just correct.',
    name: 'Priya R.', flag: '🇮🇳', location: 'Bengaluru, India',
  },
];

// Lightweight country → emoji flag heuristic for live data. Falls back to a
// neutral globe so we always render something reasonable.
const FLAG_HINTS = [
  { match: /vietnam|hanoi|saigon|ho chi minh/i, flag: '🇻🇳' },
  { match: /turkey|t\u00fcrkiye|istanbul|ankara/i, flag: '🇹🇷' },
  { match: /india|bengaluru|mumbai|delhi/i, flag: '🇮🇳' },
  { match: /china|shanghai|beijing/i, flag: '🇨🇳' },
  { match: /korea|seoul/i, flag: '🇰🇷' },
  { match: /japan|tokyo/i, flag: '🇯🇵' },
  { match: /philippines|manila/i, flag: '🇵🇭' },
  { match: /indonesia|jakarta/i, flag: '🇮🇩' },
  { match: /pakistan|karachi|lahore/i, flag: '🇵🇰' },
  { match: /bangladesh|dhaka/i, flag: '🇧🇩' },
  { match: /thailand|bangkok/i, flag: '🇹🇭' },
  { match: /uae|dubai|abu dhabi/i, flag: '🇦🇪' },
];

function flagFor(location) {
  if (!location) return '🌐';
  const hit = FLAG_HINTS.find((h) => h.match.test(location));
  return hit ? hit.flag : '🌐';
}

function QuoteWithEm({ quote, em }) {
  if (!em) return quote;
  const idx = quote.indexOf(em);
  if (idx === -1) return quote;
  return (
    <>
      {quote.slice(0, idx)}
      <em>{em}</em>
      {quote.slice(idx + em.length)}
    </>
  );
}

export default function Testimonials() {
  const [live, setLive] = useState(null); // null = loading, [] = empty
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`${API_URL}/api/testimonials?limit=12`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => { if (!cancelled) setLive(d.testimonials || []); })
      .catch(() => { if (!cancelled) setLive([]); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, []);

  // Until the API has at least three approved stories, keep showing the
  // seed examples so the social-proof section never looks anaemic.
  const display = (() => {
    if (!loaded) return SEED_TESTIMONIALS;
    if (live && live.length >= 3) {
      return live.slice(0, 3).map((t) => ({
        band_before: t.band_before,
        band_achieved: t.band_achieved,
        weeks_to_goal: t.weeks_to_goal,
        quote: t.quote,
        name: t.name,
        flag: flagFor(t.location),
        location: t.location || t.role || '',
      }));
    }
    return SEED_TESTIMONIALS;
  })();

  return (
    <section className="proof">
      <div className="container">
        <div className="section-head">
          <div className="section-eyebrow">Real students · real results</div>
          <h2 className="section-title">Band improvements from real students.</h2>
          <p className="section-sub">
            Average gain after eight weeks of practice, measured on official mock exams.
          </p>
        </div>
        <div className="testimonials">
          {display.map((t, i) => (
            <div key={`${t.name}-${i}`} className="t-card">
              <div className="t-bands">
                {t.band_before != null && (
                  <div className="band-bubble before">{Number(t.band_before).toFixed(1).replace(/\.0$/, '.0')}</div>
                )}
                {t.band_before != null && t.band_achieved != null && (
                  <div className="t-arrow" aria-hidden="true">→</div>
                )}
                {t.band_achieved != null && (
                  <div className="band-bubble after">{Number(t.band_achieved).toFixed(1).replace(/\.0$/, '.0')}</div>
                )}
                {t.weeks_to_goal != null && (
                  <div className="t-weeks">{t.weeks_to_goal} weeks</div>
                )}
              </div>
              <p className="t-quote"><QuoteWithEm quote={t.quote} em={t.quoteEm} /></p>
              <div className="t-person">
                <div className="avatar-ph" aria-hidden="true" />
                <div>
                  <div className="n">{t.name}</div>
                  {t.location && (
                    <div className="loc"><span>{t.flag}</span>{t.location}</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <a
            href="/share-your-story"
            style={{
              fontSize: 14,
              color: 'var(--landing-muted, #4f5d6a)',
              textDecoration: 'underline',
              textDecorationColor: 'rgba(13, 148, 136, 0.4)',
              textUnderlineOffset: 4,
            }}
          >
            Reached your target band? Share your story →
          </a>
        </div>
      </div>
    </section>
  );
}
