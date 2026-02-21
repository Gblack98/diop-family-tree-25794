import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

// Compte les sessions uniques actives dans les N dernières minutes
// Rafraîchit toutes les 60 secondes
export function useActiveVisitors(windowMinutes = 5) {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = useCallback(async () => {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    // Récupère les session_ids récents pour compter les sessions uniques côté JS
    const { data, error } = await supabase
      .from('page_visits')
      .select('session_id')
      .gte('visited_at', since);

    if (!error && data) {
      const unique = new Set(data.map((r) => r.session_id)).size;
      setCount(unique);
    }
  }, [windowMinutes]);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 60_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  return count;
}
