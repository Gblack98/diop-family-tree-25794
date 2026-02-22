#!/usr/bin/env npx tsx
/**
 * ============================================================================
 * Script de synchronisation de src/lib/familyTree/data.ts avec Supabase
 * ============================================================================
 *
 * Ce script:
 * 1. Récupère toutes les personnes et relations depuis Supabase
 * 2. Compare avec data.ts existant pour identifier les différences
 * 3. Merge: Supabase = source de vérité pour les infos des personnes
 *           data.ts = conserve les relations qui n'existent pas dans la DB
 * 4. Génère le nouveau data.ts mis à jour
 *
 * Usage:
 *   npx tsx scripts/sync-family-data.ts
 *   npx tsx scripts/sync-family-data.ts --dry-run   (preview seulement)
 *   npx tsx scripts/sync-family-data.ts --diff       (afficher les différences)
 *
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// --- Configuration ---
const SUPABASE_URL = 'https://qshlsdjmzpoabribaemo.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFzaGxzZGptenBvYWJyaWJhZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTkzMzU4NiwiZXhwIjoyMDg1NTA5NTg2fQ.dat68EDqG4jWV39SGgZH8j_xaXELiQnO0g4Qv8XXN8k';

const OUTPUT_FILE = path.join(__dirname, '../src/lib/familyTree/data.ts');

const isDryRun = process.argv.includes('--dry-run');
const isDiff   = process.argv.includes('--diff');

// --- Types ---
interface DbPerson { id: string; name: string; genre: string; generation: number; }
interface DbRelation { parent_name: string; child_name: string; }
interface Person { name: string; genre: string; generation: number; parents: string[]; enfants: string[]; }

// --- Main ---
async function main() {
  console.log('🔄 Synchronisation data.ts ← Supabase\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Fetch from Supabase
  console.log('📡 Récupération des données Supabase...');
  const [{ data: dbPersons, error: e1 }, { data: dbRels, error: e2 }] = await Promise.all([
    supabase.from('persons').select('id, name, genre, generation').order('generation').order('name'),
    supabase.from('relationships')
      .select('parent:persons!relationships_parent_id_fkey(name), child:persons!relationships_child_id_fkey(name)'),
  ]);

  if (e1) throw new Error(`Erreur persons: ${e1.message}`);
  if (e2) throw new Error(`Erreur relationships: ${e2.message}`);

  const persons: DbPerson[] = dbPersons || [];
  const relations: DbRelation[] = (dbRels || []).map((r: any) => ({
    parent_name: r.parent.name,
    child_name: r.child.name,
  }));

  console.log(`   ✅ ${persons.length} personnes, ${relations.length} relations\n`);

  // 2. Read current data.ts
  console.log('📖 Lecture de data.ts existant...');
  const currentContent = fs.readFileSync(OUTPUT_FILE, 'utf-8');

  // Extract current persons via simple JSON parsing of the array
  const arrayMatch = currentContent.match(/export const familyData: Person\[\] = \[([\s\S]*)\];/);
  if (!arrayMatch) throw new Error('Format data.ts non reconnu');

  // Parse current data (eval-safe: use Function)
  let currentData: Person[] = [];
  try {
    const jsonLike = '[' + arrayMatch[1]
      .replace(/\/\/[^\n]*/g, '') // remove comments
      .replace(/,(\s*[\]\}])/g, '$1') // remove trailing commas
      + ']';
    currentData = JSON.parse(jsonLike);
  } catch {
    console.warn('   ⚠️  Impossible de parser data.ts exactement — reconstruction depuis DB uniquement');
  }

  const currentByName = new Map(currentData.map(p => [p.name, p]));

  // 3. Build name sets
  const dbNames = new Set(persons.map(p => p.name));
  const currentNames = new Set(currentData.map(p => p.name));

  const onlyInDb = persons.filter(p => !currentNames.has(p.name));
  const onlyInData = currentData.filter(p => !dbNames.has(p.name));
  const infoUpdates: Array<{ name: string; field: string; from: string; to: string }> = [];

  // Check for info mismatches
  for (const dbp of persons) {
    const cur = currentByName.get(dbp.name);
    if (!cur) continue;
    if (cur.genre !== dbp.genre)
      infoUpdates.push({ name: dbp.name, field: 'genre', from: cur.genre, to: dbp.genre });
    if (cur.generation !== dbp.generation)
      infoUpdates.push({ name: dbp.name, field: 'generation', from: String(cur.generation), to: String(dbp.generation) });
  }

  // Build DB relationship maps
  const dbParentsByChild = new Map<string, string[]>();
  const dbChildrenByParent = new Map<string, string[]>();
  for (const r of relations) {
    if (!dbParentsByChild.has(r.child_name)) dbParentsByChild.set(r.child_name, []);
    dbParentsByChild.get(r.child_name)!.push(r.parent_name);
    if (!dbChildrenByParent.has(r.parent_name)) dbChildrenByParent.set(r.parent_name, []);
    dbChildrenByParent.get(r.parent_name)!.push(r.child_name);
  }

  // 4. Show diff if requested
  if (isDiff || isDryRun) {
    console.log('📊 DIFFÉRENCES DÉTECTÉES:\n');

    if (onlyInDb.length > 0) {
      console.log(`➕ ${onlyInDb.length} personne(s) dans DB mais absente(s) de data.ts:`);
      onlyInDb.forEach(p => console.log(`   • ${p.name} (gen ${p.generation}, ${p.genre})`));
      console.log();
    }

    if (onlyInData.length > 0) {
      console.log(`⚠️  ${onlyInData.length} personne(s) dans data.ts mais absente(s) de DB (conservées):`);
      onlyInData.forEach(p => console.log(`   • ${p.name} (gen ${p.generation})`));
      console.log();
    }

    if (infoUpdates.length > 0) {
      console.log(`🔧 ${infoUpdates.length} mise(s) à jour d'informations:`);
      infoUpdates.forEach(u => console.log(`   • ${u.name}: ${u.field} "${u.from}" → "${u.to}"`));
      console.log();
    }

    // Check for relationship differences
    let relDiffs = 0;
    for (const dbp of persons) {
      const cur = currentByName.get(dbp.name);
      const dbParents = dbParentsByChild.get(dbp.name) || [];
      const curParents = cur?.parents || [];
      const onlyInDbParents = dbParents.filter(p => !curParents.includes(p));
      const onlyInCurParents = curParents.filter(p => !dbParents.includes(p) && dbNames.has(p));
      if (onlyInDbParents.length || onlyInCurParents.length) {
        relDiffs++;
        console.log(`🔗 Relations pour ${dbp.name}:`);
        onlyInDbParents.forEach(p => console.log(`   + parent DB: ${p}`));
        onlyInCurParents.forEach(p => console.log(`   ~ parent data.ts seulement: ${p}`));
      }
    }
    if (relDiffs === 0) console.log('✅ Toutes les relations DB sont déjà dans data.ts\n');

    if (isDryRun) {
      console.log('🔍 Mode dry-run: aucun fichier modifié.');
      return;
    }
  }

  // 5. Build merged person list
  console.log('🔨 Construction du data.ts mis à jour...');

  // All DB persons with merged relationships
  const merged: Person[] = persons.map(dbp => {
    const cur = currentByName.get(dbp.name);
    const dbParents = dbParentsByChild.get(dbp.name) || [];
    const dbChildren = dbChildrenByParent.get(dbp.name) || [];

    // Keep data.ts-only parents (not in DB) for this person
    const extraParents = (cur?.parents || []).filter(p => !dbParents.includes(p));
    // Keep data.ts-only children (not in DB) for this person
    const extraChildren = (cur?.enfants || []).filter(c => !dbChildren.includes(c));

    return {
      name: dbp.name,
      genre: dbp.genre,
      generation: dbp.generation,
      parents: [...dbParents, ...extraParents],
      enfants: [...dbChildren, ...extraChildren],
    };
  });

  // Add data.ts-only persons (not in DB)
  for (const cur of currentData) {
    if (!dbNames.has(cur.name)) {
      merged.push(cur);
    }
  }

  // Sort by generation, then name
  merged.sort((a, b) => a.generation - b.generation || a.name.localeCompare(b.name, 'fr'));

  // 6. Generate file content
  const now = new Date().toISOString().split('T')[0];
  const totalPersons = merged.length;

  const genGroups = new Map<number, Person[]>();
  for (const p of merged) {
    if (!genGroups.has(p.generation)) genGroups.set(p.generation, []);
    genGroups.get(p.generation)!.push(p);
  }

  let body = '';
  for (const [gen, group] of [...genGroups.entries()].sort((a, b) => a[0] - b[0])) {
    body += `\n  // ── Génération ${gen} (${group.length} personnes) ──\n`;
    for (const p of group) {
      body += `  ${JSON.stringify(p)},\n`;
    }
  }

  const output = `import { Person } from "./types";

/**
 * Family Tree Data - Famille Diop
 *
 * ⚠️  Ce fichier est généré automatiquement par scripts/sync-family-data.ts
 *    Dernière mise à jour: ${now}
 *    Source de vérité: Supabase (qshlsdjmzpoabribaemo)
 *
 * @summary
 * - **Total**: ${totalPersons} personnes
 * - **Générations**: 0 (racines) à ${Math.max(...merged.map(p => p.generation))}
 *
 * @connections
 * Principales connexions inter-familiales:
 * - Diop ↔ Ba (Birame Medor Diop × Diarra Ba)
 * - Diop ↔ Seck (Amadou Bamba Diop × Nafissatou Seck)
 * - Seck ↔ Diagne (Magatte Diop × Diarra Diagne)
 * - Seck ↔ Diouf (Mar Seck parents: Yatma Seck × Oulimata Diouf)
 * - Diallo ↔ Ba (Bilal Diallo × Diarra Ba)
 *
 * @see scripts/sync-family-data.ts pour mettre à jour ce fichier
 */
export const familyData: Person[] = [${body}];
`;

  // 7. Write file
  if (!isDryRun) {
    // Backup
    const backupPath = OUTPUT_FILE.replace('.ts', `.backup-${now}.ts`);
    fs.copyFileSync(OUTPUT_FILE, backupPath);
    console.log(`   💾 Backup: ${path.basename(backupPath)}`);

    fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
    console.log(`   ✅ data.ts mis à jour: ${totalPersons} personnes\n`);
  }

  // Summary
  console.log('📈 RÉSUMÉ:');
  console.log(`   • ${persons.length} personnes dans Supabase`);
  console.log(`   • ${onlyInDb.length} nouvelles personnes ajoutées depuis DB`);
  console.log(`   • ${onlyInData.length} personnes data.ts-seulement conservées`);
  console.log(`   • ${infoUpdates.length} corrections d'informations (genre, génération)`);
  console.log(`   • Total final: ${totalPersons} personnes`);
  console.log('\n✅ Synchronisation terminée !');
}

main().catch(err => {
  console.error('❌ Erreur:', err.message);
  process.exit(1);
});
