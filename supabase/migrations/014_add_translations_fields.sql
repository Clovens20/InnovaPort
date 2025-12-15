-- ============================================
-- MIGRATION: Ajout des champs de traduction pour les contenus utilisateurs
-- ============================================
-- Date: 2024
-- Description: Ajoute les colonnes pour stocker les traductions FR/EN des contenus créés par les utilisateurs
-- ============================================

-- ============================================
-- TABLE: profiles
-- Ajouter les colonnes de traduction pour les champs texte du portfolio
-- ============================================

-- Bio et titre
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bio_en TEXT,
ADD COLUMN IF NOT EXISTS title_en TEXT;

-- Hero section
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS hero_title_en TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS hero_description_en TEXT;

-- Page "À propos"
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS about_journey_en TEXT,
ADD COLUMN IF NOT EXISTS about_approach_en TEXT,
ADD COLUMN IF NOT EXISTS about_why_choose_en TEXT;

-- CTA
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS cta_title_en TEXT,
ADD COLUMN IF NOT EXISTS cta_subtitle_en TEXT,
ADD COLUMN IF NOT EXISTS cta_button_text_en TEXT,
ADD COLUMN IF NOT EXISTS cta_footer_text_en TEXT;

-- Renommer les colonnes existantes pour clarifier qu'elles sont en français
-- (Optionnel : on garde les noms actuels pour la compatibilité)
-- Les colonnes sans suffixe _en sont considérées comme françaises (langue par défaut)

-- ============================================
-- TABLE: projects
-- Ajouter les colonnes de traduction pour les projets
-- ============================================

ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS title_en TEXT,
ADD COLUMN IF NOT EXISTS short_description_en TEXT,
ADD COLUMN IF NOT EXISTS full_description_en TEXT;

-- ============================================
-- TABLE: testimonials
-- Ajouter les colonnes de traduction pour les témoignages
-- ============================================

ALTER TABLE testimonials 
ADD COLUMN IF NOT EXISTS testimonial_text_en TEXT;

-- ============================================
-- COMMENTAIRES pour documentation
-- ============================================

COMMENT ON COLUMN profiles.bio_en IS 'Bio du développeur en anglais (si bio existe, sinon utilise bio)';
COMMENT ON COLUMN profiles.title_en IS 'Titre du développeur en anglais (si title existe, sinon utilise title)';
COMMENT ON COLUMN profiles.hero_title_en IS 'Titre hero en anglais (si hero_title existe, sinon utilise hero_title)';
COMMENT ON COLUMN profiles.hero_subtitle_en IS 'Sous-titre hero en anglais (si hero_subtitle existe, sinon utilise hero_subtitle)';
COMMENT ON COLUMN profiles.hero_description_en IS 'Description hero en anglais (si hero_description existe, sinon utilise hero_description)';
COMMENT ON COLUMN profiles.about_journey_en IS 'Parcours professionnel en anglais';
COMMENT ON COLUMN profiles.about_approach_en IS 'Approche de travail en anglais';
COMMENT ON COLUMN profiles.about_why_choose_en IS 'Pourquoi choisir ce développeur en anglais';
COMMENT ON COLUMN profiles.cta_title_en IS 'Titre CTA en anglais';
COMMENT ON COLUMN profiles.cta_subtitle_en IS 'Sous-titre CTA en anglais';
COMMENT ON COLUMN profiles.cta_button_text_en IS 'Texte bouton CTA en anglais';
COMMENT ON COLUMN profiles.cta_footer_text_en IS 'Texte footer CTA en anglais';

COMMENT ON COLUMN projects.title_en IS 'Titre du projet en anglais (si title_en existe, sinon utilise title)';
COMMENT ON COLUMN projects.short_description_en IS 'Description courte en anglais (si short_description_en existe, sinon utilise short_description)';
COMMENT ON COLUMN projects.full_description_en IS 'Description complète en anglais (si full_description_en existe, sinon utilise full_description)';

COMMENT ON COLUMN testimonials.testimonial_text_en IS 'Texte du témoignage en anglais (si testimonial_text_en existe, sinon utilise testimonial_text)';

-- ============================================
-- NOTES IMPORTANTES
-- ============================================
-- Logique d'affichage :
-- - Si la colonne _en existe et n'est pas NULL, l'utiliser pour la langue anglaise
-- - Sinon, utiliser la colonne sans suffixe (français par défaut)
-- - Les colonnes sans suffixe sont considérées comme françaises
-- - Les services et work_process sont en JSONB, donc on peut ajouter des champs "name_en", "description_en" dans les objets JSON

