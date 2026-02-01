# 🚀 Configuration Supabase

Ce guide vous accompagne dans la configuration complète de Supabase pour l'arbre généalogique.

## 📋 Étape 1 : Créer le projet Supabase

1. **Aller sur [supabase.com](https://supabase.com)**
2. **Créer un compte** (gratuit) si vous n'en avez pas
3. **Cliquer sur "New Project"**
4. **Remplir les informations :**
   - **Name**: `diop-family-tree` (ou le nom que vous voulez)
   - **Database Password**: Créer un mot de passe fort et le NOTER quelque part
   - **Region**: Choisir la région la plus proche (ex: `Europe West (Ireland)`)
   - **Pricing Plan**: `Free` (suffisant pour commencer)
5. **Cliquer sur "Create new project"**

⏳ La création prend environ 2 minutes.

## 📋 Étape 2 : Récupérer les clés API

Une fois le projet créé :

1. **Dans le menu de gauche, cliquer sur "Settings" (⚙️)**
2. **Puis sur "API"**
3. **Copier ces deux valeurs :**
   - **Project URL** : `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public** (dans la section "Project API keys")

## 📋 Étape 3 : Configurer les variables d'environnement

1. **Créer le fichier `.env.local`** à la racine du projet (ne PAS le commit !)
2. **Copier le contenu de `.env.example`**
3. **Remplacer les valeurs** avec celles copiées :

```bash
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci... (votre clé anon très longue)
```

## 📋 Étape 4 : Exécuter le schéma SQL

1. **Dans Supabase, aller dans "SQL Editor"** (menu de gauche)
2. **Cliquer sur "New query"**
3. **Copier tout le contenu de `supabase/schema.sql`**
4. **Coller dans l'éditeur**
5. **Cliquer sur "Run"** (bouton en bas à droite)

✅ Vous devriez voir : "Success. No rows returned"

## 📋 Étape 5 : Créer le bucket Storage

1. **Aller dans "Storage"** (menu de gauche)
2. **Cliquer sur "New bucket"**
3. **Remplir :**
   - **Name**: `family-images`
   - **Public bucket**: ✅ Coché
4. **Cliquer sur "Create bucket"**

5. **Configurer les policies :**
   - Cliquer sur le bucket `family-images`
   - Aller dans "Policies"
   - Cliquer sur "New policy"
   - Choisir "Custom" et coller :

```sql
-- Policy pour upload (modérateurs et admins)
CREATE POLICY "Moderators can upload images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'family-images' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND suspended = FALSE
    )
  );

-- Policy pour lecture publique
CREATE POLICY "Public can read images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'family-images');
```

## 📋 Étape 6 : Créer le premier compte admin

1. **Aller dans "Authentication" > "Users"**
2. **Cliquer sur "Add user" > "Create new user"**
3. **Remplir :**
   - **Email**: Votre email
   - **Password**: Un mot de passe fort
   - **Auto Confirm User**: ✅ Coché
4. **Cliquer sur "Create user"**
5. **Noter l'UUID du user** (colonne "ID")

6. **Retourner dans "SQL Editor"** et exécuter :

```sql
-- Remplacer 'USER_UUID_ICI' par l'UUID copié
-- Remplacer 'VotreUsername' par votre nom d'utilisateur
INSERT INTO profiles (id, role, username, email)
VALUES (
  'USER_UUID_ICI',
  'admin',
  'VotreUsername',
  'votre@email.com'
);
```

✅ Vous avez maintenant un compte admin !

## 📋 Étape 7 : Vérification

Exécuter cette requête SQL pour vérifier :

```sql
-- Vérifier les tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Devrait afficher :
-- archives
-- change_history
-- persons
-- profiles
-- relationships
```

```sql
-- Vérifier votre compte admin
SELECT * FROM profiles;

-- Devrait afficher votre profil avec role = 'admin'
```

## ✅ Configuration terminée !

Prochaines étapes :
1. ✅ Migrer les données (218 personnes + archives)
2. ✅ Créer l'interface admin
3. ✅ Tester l'authentification

## 🆘 En cas de problème

**Erreur "Missing environment variables"** :
- Vérifier que `.env.local` existe
- Vérifier que les variables commencent par `VITE_`
- Redémarrer le serveur de dev (`npm run dev`)

**Erreur SQL** :
- Vérifier que le schéma a bien été exécuté entièrement
- Regarder les messages d'erreur dans l'éditeur SQL

**Autres problèmes** :
- Consulter la [documentation Supabase](https://supabase.com/docs)
- Ouvrir une issue sur GitHub
