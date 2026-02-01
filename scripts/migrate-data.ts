/**
 * Script de migration des données existantes vers Supabase
 * Migre les 218 personnes + relations + archives
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types';
import { familyData } from '../src/lib/familyTree/data';

// Import archives directement sans import.meta.glob
// On migrera les archives plus tard via l'interface admin
const archivesData: any[] = [];

// Charger les variables d'environnement
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  console.error('Ajouter SUPABASE_SERVICE_ROLE_KEY dans .env.local');
  console.error('(Trouver dans Supabase Dashboard > Settings > API > service_role)');
  process.exit(1);
}

// Utiliser la service role key pour bypasser les RLS pendant la migration
const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function migrateData() {
  console.log('🚀 Migration des données vers Supabase\n');
  console.log(`📊 À migrer: ${familyData.length} personnes\n`);

  try {
    // Étape 1: Migrer les personnes
    console.log('👥 Étape 1/3: Migration des personnes...');

    const personsToInsert = familyData.map(person => ({
      name: person.name,
      genre: person.genre,
      generation: person.generation,
    }));

    const { data: insertedPersons, error: personsError } = await supabase
      .from('persons')
      .insert(personsToInsert)
      .select();

    if (personsError) {
      console.error('❌ Erreur migration personnes:', personsError);
      return false;
    }

    console.log(`✅ ${insertedPersons?.length || 0} personnes migrées\n`);

    // Créer un map nom -> UUID pour les relations
    const nameToIdMap = new Map<string, string>();
    insertedPersons?.forEach(person => {
      nameToIdMap.set(person.name, person.id);
    });

    // Étape 2: Migrer les relations
    console.log('🔗 Étape 2/3: Migration des relations...');

    const relationships: Array<{ parent_id: string; child_id: string }> = [];

    for (const person of familyData) {
      const childId = nameToIdMap.get(person.name);
      if (!childId) continue;

      for (const parentName of person.parents) {
        const parentId = nameToIdMap.get(parentName);
        if (parentId) {
          relationships.push({
            parent_id: parentId,
            child_id: childId,
          });
        }
      }
    }

    if (relationships.length > 0) {
      const { data: insertedRelations, error: relationsError } = await supabase
        .from('relationships')
        .insert(relationships)
        .select();

      if (relationsError) {
        console.error('❌ Erreur migration relations:', relationsError);
        return false;
      }

      console.log(`✅ ${insertedRelations?.length || 0} relations migrées\n`);
    }

    // Étape 3: Archives (à faire via l'interface admin)
    console.log('📚 Étape 3/3: Archives...');
    console.log('⏭️  Les archives seront ajoutées via l\'interface admin\n');

    // Résumé
    console.log('═══════════════════════════════════════');
    console.log('🎉 MIGRATION RÉUSSIE !');
    console.log('═══════════════════════════════════════');
    console.log(`✅ ${insertedPersons?.length || 0} personnes`);
    console.log(`✅ ${relationships.length} relations parentales`);
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('1. Vérifier les données dans Supabase Dashboard');
    console.log('2. Créer l\'interface admin');
    console.log('3. Ajouter les archives via l\'interface admin');
    console.log('═══════════════════════════════════════');

    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Exécuter la migration
migrateData()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
