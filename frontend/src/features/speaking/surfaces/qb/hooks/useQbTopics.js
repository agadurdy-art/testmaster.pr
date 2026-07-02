import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// IELTS tips shown while topics load. Keeps the wait useful instead of
// staring at a spinner — Safari especially can take 1–2s for the modules
// fetch + audio_url resolve, and a passive spinner there made users
// assume the page was broken.
export const LOADING_TIPS = [
  { title: 'Part 1 timing', body: 'Aim for ~20–30 seconds per answer. Going too short signals limited range; rambling hurts coherence.' },
  { title: 'Hesitation > rushing', body: 'A short pause and a clear answer beats fast-but-mumbled. Examiners reward clarity, not speed.' },
  { title: 'Part 2 cue card', body: 'You get 1 minute to prepare. Jot 4–5 keywords, not full sentences — speak from memory, not a script.' },
  { title: 'Part 3 abstract', body: 'Use signposting: "There are two reasons…", "On the other hand…". It boosts your Coherence band.' },
  { title: 'Pronunciation', body: 'Word stress matters more than accent. "phoTOgraphy" not "PHOto-graphy" — Liz catches this for you.' },
];

/**
 * Topic-list data layer for the QB Speaking page:
 * - sessionStorage stale-while-revalidate cache for /api/speaking/modules
 * - hover-prefetch of /api/speaking/set/{setId} into the page-owned
 *   prefetchedSetsRef (selectModule on the page checks the same ref)
 * - rotating loading tip index
 *
 * The `loading` flag stays on the page because selectModule (set fetch)
 * shares it; the hook only reads/writes it via the passed setter.
 */
export function useQbTopics({
  filterTrack,
  filterBand,
  mode,
  initialSetId,
  selectModule,
  prefetchedSetsRef,
  loading,
  setLoading,
}) {
  const [modules, setModules] = useState([]);
  // Rotating IELTS tip while loading — replaces the bare spinner so users
  // don't bounce thinking the page is stuck. Cycles every 4s.
  const [tipIndex, setTipIndex] = useState(0);
  useEffect(() => {
    if (!loading) return undefined;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % LOADING_TIPS.length), 4000);
    return () => clearInterval(id);
  }, [loading]);

  const loadModules = async () => {
    // sessionStorage cache — repeat visits to QB Speaking within 5 min
    // skip the network round-trip entirely. Stale-while-revalidate: show
    // the cached list immediately, then fetch in the background to refresh
    // it. Track+band keyed so the Academic/GT toggle and band chips don't
    // poison each other's cache.
    const cacheKey = `qb_speaking_modules_v1:${filterTrack}:${filterBand || 'all'}`;
    const TTL_MS = 5 * 60 * 1000;
    let usedCache = false;
    try {
      const raw = sessionStorage.getItem(cacheKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached && Array.isArray(cached.modules) && Date.now() - cached.t < TTL_MS) {
          setModules(cached.modules);
          setLoading(false);
          usedCache = true;
        }
      }
    } catch (_) { /* ignore corrupt cache */ }

    try {
      let url = `${API_URL}/api/speaking/modules?track=${filterTrack}`;
      if (filterBand) url += `&band=${filterBand}`;

      const res = await fetch(url);
      // TODO(backend): /api/speaking/modules is served by routes/speaking_qb.py
      // and depends on content/speaking/speaking_sets.py being importable +
      // populated. If the import fails, the route itself 404s and modules
      // stay empty. The previous code silently ignored non-2xx responses,
      // leaving the page blank with no toast — confusing for users.
      if (!res.ok) {
        console.error('Speaking modules HTTP error', res.status);
        toast.error(`Speaking topics unavailable (${res.status}). Try again shortly.`);
        setModules([]);
        return;
      }
      const data = await res.json();

      if (data?.success) {
        const list = Array.isArray(data.modules) ? data.modules : [];
        setModules(list);
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), modules: list }));
        } catch (_) { /* sessionStorage full / disabled — non-fatal */ }
        if (list.length === 0 && !usedCache) {
          toast.info('No speaking topics matched this track yet.');
        }
        if (initialSetId) {
          selectModule(initialSetId);
        }
      } else {
        console.warn('Speaking modules response missing success flag', data);
        if (!usedCache) {
          setModules([]);
          toast.error(data?.error || 'Failed to load speaking topics.');
        }
      }
    } catch (error) {
      console.error('Error loading modules:', error);
      // Only surface the error if we don't already have a cached list on
      // screen — otherwise it's just a background-refresh blip.
      if (!usedCache) toast.error('Failed to load speaking modules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterTrack, filterBand]);

  // Hover-prefetch helper. Fires /api/speaking/set/{setId} once per setId
  // and stashes the response in prefetchedSetsRef. selectModule (page)
  // checks this ref first so the click is instant on hovered cards.
  const prefetchSet = (setId) => {
    if (!setId || prefetchedSetsRef.current[setId]) return;
    // Mark as in-flight immediately so hover-spam doesn't fire N requests.
    prefetchedSetsRef.current[setId] = 'pending';
    fetch(`${API_URL}/api/speaking/set/${setId}?include_audio=true&mode=${mode}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.set) {
          prefetchedSetsRef.current[setId] = data.set;
        } else {
          delete prefetchedSetsRef.current[setId];
        }
      })
      .catch(() => { delete prefetchedSetsRef.current[setId]; });
  };

  return { modules, tipIndex, prefetchSet };
}
