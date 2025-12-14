-- ============================================
-- MIGRATION: Remove subdomain dependency
-- ============================================
-- Cette migration supprime la dépendance à la colonne subdomain
-- qui peut ne pas exister dans certaines installations
-- ============================================

-- Supprimer l'index sur subdomain s'il existe (ne pas échouer si n'existe pas)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_subdomain'
    ) THEN
        DROP INDEX IF EXISTS idx_profiles_subdomain;
    END IF;
END $$;

-- Ajouter la colonne subdomain si elle n'existe pas (pour compatibilité)
-- Mais elle n'est plus utilisée dans le code
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'subdomain'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subdomain TEXT;
    END IF;
END $$;

-- Commentaire pour indiquer que subdomain est déprécié
COMMENT ON COLUMN public.profiles.subdomain IS 'Déprécié : utiliser username à la place';

