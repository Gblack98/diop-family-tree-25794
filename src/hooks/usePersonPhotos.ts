import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';

// Cache global – valable 10 minutes
let cachedPhotos: Map<string, string> | null = null;
let cacheTs = 0;
const CACHE_TTL = 10 * 60 * 1000;

/**
 * Retourne un Map<nomPersonne, urlPremièrePhoto>
 * La photo la plus récente (sort_year DESC) par personne est retenue.
 */
export function usePersonPhotos(): Map<string, string> {
  const [photoMap, setPhotoMap] = useState<Map<string, string>>(cachedPhotos ?? new Map());

  useEffect(() => {
    const now = Date.now();
    if (cachedPhotos && now - cacheTs < CACHE_TTL) {
      setPhotoMap(cachedPhotos);
      return;
    }

    supabase
      .from('archives')
      .select('images, persons!inner(name)')
      .eq('category', 'photo')
      .not('images', 'is', null)
      .order('sort_year', { ascending: false })
      .then(({ data, error }) => {
        if (error || !data) return;

        const map = new Map<string, string>();
        (data as any[]).forEach((row) => {
          const personName = row.persons?.name as string | undefined;
          const images = row.images as string[] | null;
          // On conserve uniquement la première photo par personne (la plus récente)
          if (personName && images && images.length > 0 && !map.has(personName)) {
            map.set(personName, images[0]);
          }
        });

        cachedPhotos = map;
        cacheTs = Date.now();
        setPhotoMap(new Map(map));
      });
  }, []);

  return photoMap;
}
