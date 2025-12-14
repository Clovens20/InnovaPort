# Dépannage : Erreur "column user_id does not exist"

## 🔴 Problème

Erreur SQL : `ERROR: 42703: column "user_id" does not exist`

Cette erreur se produit lorsque les tables `projects`, `quotes`, `subscriptions`, ou `analytics` n'ont pas la colonne `user_id`.

## ✅ Solution

### Option 1 : Appliquer la Migration (Recommandé)

Exécutez la migration `003_ensure_user_id_columns.sql` dans Supabase SQL Editor :

1. Connectez-vous à Supabase
2. Allez dans **SQL Editor**
3. Créez une nouvelle requête
4. Copiez-collez le contenu de `supabase/migrations/003_ensure_user_id_columns.sql`
5. Exécutez la requête

Cette migration :
- ✅ Vérifie si les colonnes `user_id` existent
- ✅ Les crée si elles n'existent pas
- ✅ Crée les index nécessaires
- ✅ Ajoute les contraintes UNIQUE si nécessaire

### Option 2 : Recréer les Tables (Si Option 1 échoue)

Si la migration ne fonctionne pas, vous pouvez recréer les tables :

```sql
-- Supprimer les tables (ATTENTION : cela supprime toutes les données)
DROP TABLE IF EXISTS analytics CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;
DROP TABLE IF EXISTS projects CASCADE;

-- Puis exécuter le schéma complet depuis supabase/schema.sql
```

### Option 3 : Vérification Manuelle

Vérifiez quelles colonnes existent :

```sql
-- Vérifier les colonnes de chaque table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'projects' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quotes' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
ORDER BY ordinal_position;

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'analytics' 
ORDER BY ordinal_position;
```

## 📋 Structure Attendue

Chaque table doit avoir une colonne `user_id` :

- **projects** : `user_id UUID NOT NULL REFERENCES profiles(id)`
- **quotes** : `user_id UUID NOT NULL REFERENCES profiles(id)`
- **subscriptions** : `user_id UUID NOT NULL REFERENCES profiles(id)`
- **analytics** : `user_id UUID NOT NULL REFERENCES profiles(id)`

## 🔍 Vérification Post-Migration

Après avoir appliqué la migration, vérifiez que tout fonctionne :

```sql
-- Vérifier que toutes les colonnes user_id existent
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE column_name = 'user_id'
AND table_schema = 'public'
ORDER BY table_name;
```

Vous devriez voir 4 tables : `analytics`, `projects`, `quotes`, `subscriptions`.

## ⚠️ Notes Importantes

- La table `profiles` n'a **PAS** de colonne `user_id` (elle utilise `id` comme clé primaire)
- Les colonnes `user_id` dans les autres tables référencent `profiles(id)`
- Ne supprimez jamais la table `profiles` sans avoir supprimé d'abord les tables qui y font référence

## 🆘 Si le Problème Persiste

1. Vérifiez les logs Supabase pour plus de détails
2. Assurez-vous que toutes les migrations ont été appliquées dans l'ordre
3. Vérifiez que les tables existent : `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

