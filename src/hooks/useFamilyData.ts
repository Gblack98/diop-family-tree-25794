import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Person } from '@/lib/familyTree/types';
import { familyData as staticFamilyData } from '@/lib/familyTree/data';

// Cache global pour éviter les rechargements
let cachedData: Person[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const FETCH_TIMEOUT = 5000; // 5 secondes timeout

export function useFamilyData() {
  // Initialiser avec les données statiques pour un affichage immédiat
  const [familyData, setFamilyData] = useState<Person[]>(cachedData || staticFamilyData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFromSupabase, setIsFromSupabase] = useState(!!cachedData);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // Utiliser le cache si disponible et pas expiré
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      setFamilyData(cachedData);
      setIsFromSupabase(true);
      return;
    }

    // Éviter les chargements multiples simultanés
    if (!loadingRef.current) {
      loadFamilyData();
    }

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadFamilyData = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setLoading(true);
      setError(null);

      // Créer un timeout pour basculer sur les données statiques
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), FETCH_TIMEOUT);
      });

      // Charger les données avec timeout
      const fetchPromise = fetchSupabaseData();

      const result = await Promise.race([fetchPromise, timeoutPromise]);

      if (result && mountedRef.current) {
        // Mettre en cache
        cachedData = result;
        cacheTimestamp = Date.now();
        setFamilyData(result);
        setIsFromSupabase(true);
      }
    } catch (err: any) {
      console.warn('Supabase unavailable, using static data:', err.message);
      if (mountedRef.current) {
        // Fallback silencieux vers données statiques
        setFamilyData(staticFamilyData);
        setIsFromSupabase(false);
        setError(null); // Pas d'erreur visible pour l'utilisateur
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  const fetchSupabaseData = async (): Promise<Person[]> => {
    // Charger personnes et relations en parallèle
    const [personsResult, relationsResult] = await Promise.all([
      supabase.from('persons').select('id, name, genre, generation').order('generation'),
      supabase.from('relationships').select('parent_id, child_id')
    ]);

    if (personsResult.error) throw personsResult.error;
    if (relationsResult.error) throw relationsResult.error;

    const persons = personsResult.data || [];
    const relationships = relationsResult.data || [];

    // Créer un map id -> name pour lookup rapide
    const idToName: Record<string, string> = {};
    persons.forEach((p) => {
      idToName[p.id] = p.name;
    });

    // Créer les maps de relations
    const parentsByChildId: Record<string, string[]> = {};
    const childrenByParentId: Record<string, string[]> = {};

    relationships.forEach((rel) => {
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
    return persons.map((p) => ({
      name: p.name,
      genre: p.genre as 'Homme' | 'Femme',
      generation: p.generation,
      parents: parentsByChildId[p.id] || [],
      enfants: childrenByParentId[p.id] || [],
    }));
  };

  const refresh = () => {
    // Invalider le cache et recharger
    cachedData = null;
    cacheTimestamp = 0;
    loadingRef.current = false;
    loadFamilyData();
  };

  return { familyData, loading, error, refresh, isFromSupabase };
}
