import { useState, useEffect } from 'react';
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

export function useFamilyData() {
  const [familyData, setFamilyData] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFamilyData();
  }, []);

  const loadFamilyData = async () => {
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
      const nameToId: Record<string, string> = {};
      (persons || []).forEach((p) => {
        idToName[p.id] = p.name;
        nameToId[p.name] = p.id;
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

      setFamilyData(transformedData);
    } catch (err: any) {
      console.error('Error loading family data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const refresh = () => {
    loadFamilyData();
  };

  return { familyData, loading, error, refresh };
}
