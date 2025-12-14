-- ============================================
-- MIGRATION: Ajout des champs pour la page "À propos"
-- ============================================
-- Date: 2024
-- Description: Ajoute les champs nécessaires pour la page "À propos" personnalisable
--              (parcours, approche, pourquoi_choisir)
-- ============================================

-- Ajouter les champs "À propos" au profil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS about_journey TEXT,
ADD COLUMN IF NOT EXISTS about_approach TEXT,
ADD COLUMN IF NOT EXISTS about_why_choose TEXT;

COMMENT ON COLUMN profiles.about_journey IS 'Parcours professionnel du développeur pour la page À propos';
COMMENT ON COLUMN profiles.about_approach IS 'Approche de travail du développeur pour la page À propos';
COMMENT ON COLUMN profiles.about_why_choose IS 'Pourquoi choisir ce développeur pour la page À propos';

