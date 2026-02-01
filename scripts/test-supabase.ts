/**
 * Script de test Supabase
 * Vérifie que la configuration fonctionne correctement
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../src/lib/supabase/types';

// Charger les variables d'environnement depuis .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables d\'environnement manquantes !');
  console.error('Vérifier que .env.local contient :');
  console.error('- VITE_SUPABASE_URL');
  console.error('- VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function testSupabaseConnection() {
  console.log('🧪 Test de la connexion Supabase...\n');

  try {
    // Test 1: Vérifier la connexion
    console.log('📡 Test 1: Connexion au serveur...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('persons')
      .select('count')
      .limit(1);

    if (healthError) {
      console.error('❌ Erreur de connexion:', healthError.message);
      return false;
    }
    console.log('✅ Connexion établie\n');

    // Test 2: Vérifier les tables
    console.log('📋 Test 2: Vérification des tables...');
    const tables = ['persons', 'relationships', 'archives', 'profiles'];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ Erreur sur la table ${table}:`, error.message);
        return false;
      }
      console.log(`✅ Table "${table}" accessible`);
    }
    console.log('');

    // Test 3: Vérifier le profil admin
    console.log('👤 Test 3: Vérification du profil admin...');
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*');

    if (profileError) {
      console.error('❌ Erreur:', profileError.message);
      return false;
    }

    if (!profiles || profiles.length === 0) {
      console.log('⚠️  Aucun profil trouvé. Créer un admin via SETUP_SUPABASE.md');
      return false;
    }

    const admin = profiles.find(p => p.role === 'admin');
    if (!admin) {
      console.log('⚠️  Aucun admin trouvé. Rôles présents:', profiles.map(p => p.role));
      return false;
    }

    console.log('✅ Admin trouvé:', admin.username);
    console.log('   Email:', admin.email);
    console.log('');

    // Test 4: Vérifier le Storage
    console.log('📦 Test 4: Vérification du Storage...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('❌ Erreur Storage:', bucketError.message);
      return false;
    }

    const familyImagesBucket = buckets.find(b => b.name === 'family-images');
    if (!familyImagesBucket) {
      console.log('⚠️  Bucket "family-images" non trouvé. Créer via Supabase Dashboard.');
      return false;
    }

    console.log('✅ Bucket "family-images" trouvé');
    console.log('   Public:', familyImagesBucket.public ? 'Oui' : 'Non');
    console.log('');

    // Résumé
    console.log('═══════════════════════════════════════');
    console.log('🎉 TOUS LES TESTS RÉUSSIS !');
    console.log('═══════════════════════════════════════');
    console.log('✅ Configuration Supabase complète');
    console.log('✅ Base de données prête');
    console.log('✅ Compte admin créé');
    console.log('✅ Storage configuré');
    console.log('');
    console.log('📋 Prochaines étapes:');
    console.log('1. Migrer les 218 personnes existantes');
    console.log('2. Migrer les archives');
    console.log('3. Créer l\'interface admin');
    console.log('═══════════════════════════════════════');

    return true;
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
    return false;
  }
}

// Exécuter le test
testSupabaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Erreur fatale:', error);
    process.exit(1);
  });
