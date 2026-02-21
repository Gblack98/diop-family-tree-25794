import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase/client';

// Génère ou récupère un session_id stable pour toute la session du navigateur
function getSessionId(): string {
  const KEY = 'fam_session_id';
  let sid = sessionStorage.getItem(KEY);
  if (!sid) {
    sid = crypto.randomUUID();
    sessionStorage.setItem(KEY, sid);
  }
  return sid;
}

// Pages déjà tracées dans cette session (évite les doublons si React re-render)
const trackedPaths = new Set<string>();

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;

    // Ne pas tracker les pages admin
    if (path.startsWith('/admin')) return;

    // Éviter d'enregistrer deux fois la même page dans la même session
    if (trackedPaths.has(path)) return;
    trackedPaths.add(path);

    const sessionId = getSessionId();

    // Insert asynchrone — on ignore l'erreur silencieusement
    supabase
      .from('page_visits')
      .insert({ session_id: sessionId, page_path: path })
      .then(({ error }) => {
        if (error) {
          // Ne pas bloquer l'UI — juste log en dev
          if (import.meta.env.DEV) {
            console.warn('[Tracking] Erreur insertion visite:', error.message);
          }
        }
      });
  }, [location.pathname]);
}
