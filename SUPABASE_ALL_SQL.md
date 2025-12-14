# 📋 TOUS LES SCRIPTS SQL POUR SUPABASE - InnovaPort

Ce document liste **TOUS** les fichiers SQL à exécuter dans Supabase, dans l'ordre correct.

---

## 🎯 ORDRE D'EXÉCUTION

### ⚠️ IMPORTANT: Exécutez dans cet ordre exact

1. **Schéma principal** (obligatoire en premier)
2. **Migrations** (dans l'ordre numérique)
3. **Migrations additionnelles** (sans numéro)

---

## 📁 FICHIER 1: SCHÉMA PRINCIPAL

### `supabase/schema.sql`

**⚠️ À EXÉCUTER EN PREMIER**

Ce fichier contient:
- ✅ Toutes les tables principales (`profiles`, `projects`, `quotes`, `subscriptions`, `analytics`)
- ✅ Toutes les politiques RLS (Row Level Security)
- ✅ Tous les triggers et fonctions SQL
- ✅ Tous les index pour les performances

**Comment exécuter:**
1. Ouvrez Supabase Dashboard
2. Allez dans **SQL Editor**
3. Copiez-collez le contenu de `supabase/schema.sql`
4. Cliquez sur **Run**

---

## 📁 MIGRATIONS (dans l'ordre)

### Migration 001: `supabase/migrations/001_auto_create_profile_trigger.sql`

**Description:** Crée automatiquement un profil lors de l'inscription d'un utilisateur

**À exécuter après:** `schema.sql`

---

### Migration 002: `supabase/migrations/002_remove_subdomain_dependency.sql`

**Description:** Supprime la dépendance au champ `subdomain` (remplacé par `username`)

**À exécuter après:** Migration 001

---

### Migration 003: `supabase/migrations/003_ensure_user_id_columns.sql`

**Description:** S'assure que toutes les colonnes `user_id` existent correctement

**À exécuter après:** Migration 002

---

### Migration 004: `supabase/migrations/004_fix_analytics_structure.sql`

**Description:** Corrige la structure de la table `analytics`

**À exécuter après:** Migration 003

---

### Migration 005: `supabase/migrations/005_create_avatars_bucket.sql`

**Description:** Crée le bucket Storage "avatars" pour les photos de profil

**À exécuter après:** Migration 004

**Contenu:**
```sql
-- Créer le bucket "avatars" (public pour que les images soient accessibles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB en bytes
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS pour le bucket avatars
-- (Voir le fichier complet pour toutes les politiques)
```

---

### Migration 006: `supabase/migrations/006_fix_avatars_rls.sql`

**Description:** Corrige les politiques RLS pour le bucket avatars

**À exécuter après:** Migration 005

---

### Migration 007: `supabase/migrations/007_add_avatar_url_column.sql`

**Description:** Ajoute la colonne `avatar_url` à la table `profiles`

**À exécuter après:** Migration 006

**Contenu:**
```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;
```

---

### Migration 008: `supabase/migrations/008_fix_profiles_select_policy.sql`

**Description:** Corrige les politiques SELECT sur la table `profiles` (fix erreur 406)

**À exécuter après:** Migration 007

**Contenu:**
```sql
-- Allow authenticated users to select their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Ensure public read
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles FOR SELECT
TO public
USING (true);
```

---

### Migration 009: `supabase/migrations/009_add_tiktok_facebook_urls.sql`

**Description:** Ajoute les colonnes `tiktok_url` et `facebook_url` à la table `profiles`

**À exécuter après:** Migration 008

**Contenu:**
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;
```

---

### Migration 010: `supabase/migrations/010_add_portfolio_customization_fields.sql`

**Description:** Ajoute les champs de personnalisation du portfolio (stats, services, process, CTA)

**À exécuter après:** Migration 009

**Contenu principal:**
```sql
-- Ajouter les champs de personnalisation
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS available_for_work BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS stats_years_experience INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS stats_projects_delivered INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS stats_clients_satisfied INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS stats_response_time TEXT DEFAULT '48h',
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_process JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS technologies_list TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cta_title TEXT,
ADD COLUMN IF NOT EXISTS cta_subtitle TEXT,
ADD COLUMN IF NOT EXISTS cta_button_text TEXT DEFAULT 'Demander un devis gratuit',
ADD COLUMN IF NOT EXISTS cta_footer_text TEXT;

-- Créer la table testimonials si elle n'existe pas
-- (Voir le fichier complet)
```

---

### Migration 011: `supabase/migrations/011_add_about_page_fields.sql`

**Description:** Ajoute les champs pour la page "À propos" personnalisable

**À exécuter après:** Migration 010

**Contenu:**
```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS about_journey TEXT,
ADD COLUMN IF NOT EXISTS about_approach TEXT,
ADD COLUMN IF NOT EXISTS about_why_choose TEXT;
```

---

### Migration 012: `supabase/migrations/012_add_homepage_social_proof.sql`

**Description:** Crée les tables pour le social proof de la page d'accueil

**À exécuter après:** Migration 011

**Contenu principal:**
```sql
-- Table pour le social proof
CREATE TABLE IF NOT EXISTS homepage_social_proof (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#1E3A8A',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour les paramètres de la page d'accueil
CREATE TABLE IF NOT EXISTS homepage_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Données par défaut
INSERT INTO homepage_social_proof (name, initials, color, display_order) VALUES
    ('Marie Charbonneau', 'MC', '#3B82F6', 1),
    ('Sophie Lavoie', 'SL', '#10B981', 2),
    ('Jean Dubois', 'JD', '#8B5CF6', 3)
ON CONFLICT DO NOTHING;
```

---

### Migration 013: `supabase/migrations/013_add_platform_testimonials.sql`

**Description:** Crée la table pour les témoignages sur la plateforme InnovaPort

**À exécuter après:** Migration 012

**Contenu principal:**
```sql
CREATE TABLE IF NOT EXISTS platform_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    client_position TEXT,
    client_avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    testimonial_text TEXT NOT NULL,
    project_name TEXT,
    project_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 📁 MIGRATIONS ADDITIONNELLES (sans numéro)

### `supabase/migrations/add_promo_codes.sql`

**Description:** Crée la table pour les codes promotionnels

**À exécuter après:** Migration 013

**Contenu principal:**
```sql
CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC NOT NULL CHECK (discount_value > 0),
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_until TIMESTAMPTZ NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    applicable_plans TEXT[] DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `supabase/migrations/add_site_settings.sql`

**Description:** Crée la table pour les paramètres globaux du site

**À exécuter après:** `add_promo_codes.sql`

**Contenu principal:**
```sql
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    developer_testimonials_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la ligne par défaut
INSERT INTO site_settings (id, developer_testimonials_enabled)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;
```

---

## ✅ CHECKLIST D'EXÉCUTION

### Étape 1: Schéma Principal
- [ ] Ouvrir Supabase Dashboard → SQL Editor
- [ ] Exécuter `supabase/schema.sql`
- [ ] Vérifier qu'il n'y a pas d'erreurs

### Étape 2: Migrations (dans l'ordre)
- [ ] Migration 001: `001_auto_create_profile_trigger.sql`
- [ ] Migration 002: `002_remove_subdomain_dependency.sql`
- [ ] Migration 003: `003_ensure_user_id_columns.sql`
- [ ] Migration 004: `004_fix_analytics_structure.sql`
- [ ] Migration 005: `005_create_avatars_bucket.sql`
- [ ] Migration 006: `006_fix_avatars_rls.sql`
- [ ] Migration 007: `007_add_avatar_url_column.sql`
- [ ] Migration 008: `008_fix_profiles_select_policy.sql`
- [ ] Migration 009: `009_add_tiktok_facebook_urls.sql`
- [ ] Migration 010: `010_add_portfolio_customization_fields.sql`
- [ ] Migration 011: `011_add_about_page_fields.sql`
- [ ] Migration 012: `012_add_homepage_social_proof.sql`
- [ ] Migration 013: `013_add_platform_testimonials.sql`

### Étape 3: Migrations Additionnelles
- [ ] `add_promo_codes.sql`
- [ ] `add_site_settings.sql`

### Étape 4: Vérification
- [ ] Vérifier que toutes les tables existent dans Supabase Dashboard → Table Editor
- [ ] Vérifier que RLS est activé sur toutes les tables
- [ ] Tester en créant un utilisateur de test

---

## 🚨 NOTES IMPORTANTES

1. **Ordre d'exécution:** Respectez l'ordre indiqué, certaines migrations dépendent des précédentes
2. **Idempotence:** La plupart des migrations utilisent `IF NOT EXISTS` ou `ON CONFLICT DO NOTHING`, donc vous pouvez les ré-exécuter sans problème
3. **Erreurs:** Si vous rencontrez une erreur, vérifiez que la migration précédente a bien été exécutée
4. **Backup:** Avant d'exécuter en production, faites un backup de votre base de données

---

## 📞 SUPPORT

Si vous rencontrez des problèmes:
1. Vérifiez les logs dans Supabase Dashboard → Logs
2. Consultez `TROUBLESHOOTING.md`
3. Vérifiez que toutes les migrations précédentes ont été exécutées

---

**Dernière mise à jour:** Décembre 2024

