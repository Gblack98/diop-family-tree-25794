# 🚀 Configuration Supabase - Guide Simple

## ✅ Étape 1 : .env.local
**FAIT** ✓

---

## 📝 Étape 2 : Exécuter le schéma SQL

### Instructions :

1. **Ouvrir Supabase** → Va sur [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Sélectionner ton projet** "Gblack98's Project"

3. **Dans le menu de gauche, clique sur "SQL Editor"** (icône 🔧)

4. **Clique sur "+ New query"** (bouton en haut)

5. **Copier TOUT le contenu du fichier `supabase/schema.sql`** :
   - Ouvre le fichier `supabase/schema.sql` dans ton éditeur
   - Sélectionne tout (Cmd+A sur Mac, Ctrl+A sur Windows)
   - Copie (Cmd+C / Ctrl+C)

6. **Coller dans l'éditeur Supabase**
   - Retourne dans Supabase SQL Editor
   - Colle (Cmd+V / Ctrl+V)

7. **Clique sur "Run"** (bouton vert en bas à droite)

8. **Attendre ~5-10 secondes**

9. **Vérifier le résultat** :
   - Si tu vois "Success. No rows returned" → ✅ PARFAIT !
   - Si tu vois des erreurs rouges → Me les envoyer

---

## 📁 Étape 3 : Créer le bucket Storage

### Instructions :

1. **Dans Supabase, clique sur "Storage"** (menu de gauche, icône 📦)

2. **Clique sur "New bucket"** (bouton vert en haut à droite)

3. **Remplir le formulaire :**
   - **Name** : Tape exactement : `family-images`
   - **Public bucket** : ✅ COCHER cette case (très important !)
   - **File size limit** : Laisser par défaut
   - **Allowed MIME types** : Laisser vide

4. **Clique sur "Create bucket"**

5. **Configurer les permissions :**
   - Tu devrais voir ton bucket `family-images` dans la liste
   - Clique dessus
   - Clique sur l'onglet "Policies" en haut
   - Clique sur "New policy"
   - Dans "Policy name" : Tape `Public read and moderator upload`
   - Clique sur "Review" puis "Save policy"

---

## 👤 Étape 4 : Créer ton compte admin

### Instructions :

1. **Dans Supabase, clique sur "Authentication"** (menu de gauche, icône 👤)

2. **Clique sur "Users"** (onglet en haut)

3. **Clique sur "Add user"** puis **"Create new user"**

4. **Remplir le formulaire :**
   - **Email** : Ton email (par exemple : `ibrahima@example.com`)
   - **Password** : Un mot de passe fort (note-le bien !)
   - **Auto Confirm User** : ✅ COCHER cette case
   - **Email confirm** : Laisser décoché

5. **Clique sur "Create user"**

6. **IMPORTANT : Copier l'UUID du user**
   - Tu vois une liste avec ton user
   - Dans la colonne "ID", il y a un long code genre `123e4567-e89b-12d3-a456-426614174000`
   - **COPIE CE CODE** (clique dessus pour sélectionner, puis Cmd+C)

7. **Retourne dans "SQL Editor"**

8. **Clique sur "+ New query"**

9. **Copie et colle ce code** (remplace `TON_UUID_ICI` par l'UUID que tu as copié à l'étape 6) :

```sql
-- Remplacer TON_UUID_ICI par l'UUID copié
-- Remplacer 'ibrahima' par ton nom d'utilisateur
-- Remplacer 'ton@email.com' par ton email
INSERT INTO profiles (id, role, username, email)
VALUES (
  'TON_UUID_ICI',
  'admin',
  'ibrahima',
  'ton@email.com'
);
```

**EXEMPLE COMPLET** (avec un UUID fictif) :
```sql
INSERT INTO profiles (id, role, username, email)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  'admin',
  'ibrahima',
  'ibrahima@example.com'
);
```

10. **Clique sur "Run"**

11. **Vérifier** :
    - Si tu vois "Success. 1 row affected" → ✅ PARFAIT !
    - Si erreur → Me l'envoyer

---

## ✅ Vérification finale

Pour vérifier que tout fonctionne, exécute cette requête dans SQL Editor :

```sql
-- Voir toutes les tables créées
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Tu devrais voir :
- archives
- change_history
- persons
- profiles
- relationships

Puis :

```sql
-- Vérifier ton compte admin
SELECT * FROM profiles;
```

Tu devrais voir ton profil avec `role = 'admin'` !

---

## 🆘 Besoin d'aide ?

Si tu es bloqué à une étape, **fais une capture d'écran** et envoie-la moi avec l'étape où tu bloques.
