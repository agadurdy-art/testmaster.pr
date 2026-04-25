import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * History-aware back navigation. Pops the previous entry when the user has
 * one (e.g. came in from the dashboard); otherwise falls back to the given
 * route (default `/dashboard`) so deep-linked / first-page-load arrivals
 * still land somewhere sensible.
 */
export function useGoBack(fallback = '/dashboard') {
  const navigate = useNavigate();
  return useCallback(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }, [navigate, fallback]);
}

export default useGoBack;
