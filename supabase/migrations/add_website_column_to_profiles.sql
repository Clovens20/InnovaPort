-- Migration: Ajout de la colonne website à la table profiles si elle n'existe pas
-- Date: 2024
-- Description: Assure que la colonne website existe dans profiles

-- Ajouter la colonne website si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'website'
    ) THEN
        ALTER TABLE profiles ADD COLUMN website TEXT;
    END IF;
END $$;

-- Commentaire
COMMENT ON COLUMN profiles.website IS 'URL du site web personnel ou professionnel';

