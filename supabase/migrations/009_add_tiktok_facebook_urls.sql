-- Migration: Ajouter les colonnes TikTok et Facebook
-- Date: 2024
-- Description: Ajoute les colonnes tiktok_url et facebook_url à la table profiles

-- Ajouter les colonnes pour TikTok et Facebook
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS tiktok_url TEXT,
ADD COLUMN IF NOT EXISTS facebook_url TEXT;

-- Commentaires pour documentation
COMMENT ON COLUMN profiles.tiktok_url IS 'URL du profil TikTok de l''utilisateur';
COMMENT ON COLUMN profiles.facebook_url IS 'URL du profil Facebook de l''utilisateur';

