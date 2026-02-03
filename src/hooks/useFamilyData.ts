import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Person } from '@/lib/familyTree/types';

interface SupabasePerson {
  id: string;
  name: string;
  genre: 'Homme' | 'Femme';
  generation: number;
}

interface SupabaseRelationship {
  parent_id: string;
  child_id: string;
}

// Cache global pour éviter les rechargements
let cachedData: Person[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useFamilyData() {
  const [familyData, setFamilyData] = useState<Person[]>(cachedData || []);
  const [loading, setLoading] = useState(!cachedData);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    // Utiliser le cache si disponible et pas expiré
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      setFamilyData(cachedData);
      setLoading(false);
      return;
    }

    // Éviter les chargements multiples simultanés
    if (loadingRef.current) return;

    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Charger toutes les personnes
      const { data: persons, error: personsError } = await supabase
        .from('persons')
        .select('id, name, genre, generation')
        .order('generation', { ascending: true });

      if (personsError) throw personsError;

      // Charger toutes les relations
      const { data: relationships, error: relError } = await supabase
        .from('relationships')
        .select('parent_id, child_id');

      if (relError) throw relError;

      // Créer un map id -> name pour lookup rapide
      const idToName: Record<string, string> = {};
      (persons || []).forEach((p) => {
        idToName[p.id] = p.name;
      });

      // Créer les maps de relations
      const parentsByChildId: Record<string, string[]> = {};
      const childrenByParentId: Record<string, string[]> = {};

      (relationships || []).forEach((rel) => {
        // Parents de chaque enfant
        if (!parentsByChildId[rel.child_id]) {
          parentsByChildId[rel.child_id] = [];
        }
        const parentName = idToName[rel.parent_id];
        if (parentName) {
          parentsByChildId[rel.child_id].push(parentName);
        }

        // Enfants de chaque parent
        if (!childrenByParentId[rel.parent_id]) {
          childrenByParentId[rel.parent_id] = [];
        }
        const childName = idToName[rel.child_id];
        if (childName) {
          childrenByParentId[rel.parent_id].push(childName);
        }
      });

      // Transformer en format Person[]
      const transformedData: Person[] = (persons || []).map((p) => ({
        name: p.name,
        genre: p.genre,
        generation: p.generation,
        parents: parentsByChildId[p.id] || [],
        enfants: childrenByParentId[p.id] || [],
      }));

      // Mettre en cache
      cachedData = transformedData;
      cacheTimestamp = Date.now();

      setFamilyData(transformedData);
    } catch (err: any) {
      console.error('Error loading family data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const refresh = () => {
    // Invalider le cache et recharger
    cachedData = null;
    cacheTimestamp = 0;
    loadingRef.current = false;
    loadFamilyData();
  };

  return { familyData, loading, error, refresh };
}
