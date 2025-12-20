-- Migration: Correction du type de statut pour la table quotes
-- Date: 2024
-- Description: S'assure que la colonne status accepte les valeurs correctes ('new', 'discussing', 'quoted', 'accepted', 'rejected')
-- IMPORTANT: Cette migration doit être exécutée dans Supabase SQL Editor

-- Étape 1: Supprimer le type ENUM s'il existe (c'est la cause du problème)
DO $$
BEGIN
    -- Supprimer le type ENUM et toutes ses dépendances
    DROP TYPE IF EXISTS quote_status CASCADE;
END $$;

-- Étape 2: Supprimer toutes les contraintes CHECK existantes sur status
DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    -- Trouver et supprimer toutes les contraintes CHECK sur la colonne status
    FOR constraint_name IN 
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = 'quotes'::regclass 
        AND conname LIKE '%status%'
        AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE quotes DROP CONSTRAINT IF EXISTS ' || constraint_name;
    END LOOP;
END $$;

-- Étape 3: S'assurer que la colonne status existe et est de type TEXT
DO $$
BEGIN
    -- Vérifier si la colonne existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'quotes' 
        AND column_name = 'status'
    ) THEN
        -- Si elle n'existe pas, la créer
        ALTER TABLE quotes ADD COLUMN status TEXT DEFAULT 'new';
    ELSE
        -- Si elle existe, vérifier son type
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public'
            AND table_name = 'quotes' 
            AND column_name = 'status'
            AND (data_type != 'text' OR udt_name = 'quote_status')
        ) THEN
            -- Si elle utilise un ENUM ou n'est pas TEXT, la convertir
            -- D'abord, supprimer toutes les contraintes qui pourraient dépendre de cette colonne
            ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check;
            
            -- Convertir le type en TEXT
            ALTER TABLE quotes ALTER COLUMN status TYPE TEXT USING 
                CASE 
                    WHEN status::text IS NOT NULL THEN status::text
                    ELSE 'new'
                END;
        END IF;
    END IF;
END $$;

-- Étape 4: Mettre à jour les valeurs existantes qui pourraient être invalides
UPDATE quotes 
SET status = 'new' 
WHERE status IS NULL OR status NOT IN ('new', 'discussing', 'quoted', 'accepted', 'rejected');

-- Étape 5: Ajouter la contrainte CHECK correcte
ALTER TABLE quotes 
    DROP CONSTRAINT IF EXISTS quotes_status_check,
    ADD CONSTRAINT quotes_status_check 
    CHECK (status IN ('new', 'discussing', 'quoted', 'accepted', 'rejected'));

-- Étape 6: S'assurer que la valeur par défaut est bien 'new'
ALTER TABLE quotes ALTER COLUMN status SET DEFAULT 'new';

-- Étape 7: Ajouter un commentaire pour documenter
COMMENT ON COLUMN quotes.status IS 'Statut du devis: new (nouvelle), discussing (en discussion), quoted (devis envoyé), accepted (acceptée), rejected (refusée)';

