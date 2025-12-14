-- ============================================
-- MIGRATION: Fix analytics table structure
-- ============================================
-- Cette migration adapte la table analytics pour correspondre
-- à la structure attendue par le code
-- ============================================

-- Ajouter event_type si elle n'existe pas (et migrer les données depuis event)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'event_type'
    ) THEN
        -- Ajouter la colonne event_type
        ALTER TABLE public.analytics 
        ADD COLUMN event_type TEXT;
        
        -- Migrer les données de event vers event_type si event existe
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'analytics' AND column_name = 'event'
        ) THEN
            UPDATE public.analytics 
            SET event_type = event 
            WHERE event_type IS NULL;
        END IF;
        
        -- Rendre event_type NOT NULL après migration
        ALTER TABLE public.analytics 
        ALTER COLUMN event_type SET NOT NULL;
        
        -- Ajouter la contrainte CHECK
        ALTER TABLE public.analytics 
        ADD CONSTRAINT analytics_event_type_check 
        CHECK (event_type IN ('portfolio_view', 'quote_click', 'project_view', 'contact_click'));
    END IF;
END $$;

-- Ajouter metadata si elle n'existe pas (et migrer depuis meta)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'metadata'
    ) THEN
        -- Ajouter la colonne metadata
        ALTER TABLE public.analytics 
        ADD COLUMN metadata JSONB DEFAULT '{}';
        
        -- Migrer les données de meta vers metadata si meta existe
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'analytics' AND column_name = 'meta'
        ) THEN
            UPDATE public.analytics 
            SET metadata = COALESCE(meta, '{}'::jsonb) 
            WHERE metadata IS NULL;
        END IF;
    END IF;
END $$;

-- S'assurer que user_id existe (au lieu de profile_id)
DO $$ 
BEGIN
    -- Si profile_id existe mais pas user_id, créer user_id et migrer
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'profile_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'user_id'
    ) THEN
        -- Ajouter user_id
        ALTER TABLE public.analytics 
        ADD COLUMN user_id UUID;
        
        -- Migrer les données
        UPDATE public.analytics 
        SET user_id = profile_id 
        WHERE user_id IS NULL;
        
        -- Rendre NOT NULL et ajouter la référence
        ALTER TABLE public.analytics 
        ALTER COLUMN user_id SET NOT NULL;
        
        ALTER TABLE public.analytics 
        ADD CONSTRAINT analytics_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Ajouter les colonnes manquantes si elles n'existent pas
DO $$ 
BEGIN
    -- path
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'path'
    ) THEN
        ALTER TABLE public.analytics ADD COLUMN path TEXT;
    END IF;
    
    -- referrer
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'referrer'
    ) THEN
        ALTER TABLE public.analytics ADD COLUMN referrer TEXT;
    END IF;
    
    -- user_agent
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'user_agent'
    ) THEN
        ALTER TABLE public.analytics ADD COLUMN user_agent TEXT;
    END IF;
    
    -- ip_address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'ip_address'
    ) THEN
        ALTER TABLE public.analytics ADD COLUMN ip_address INET;
    END IF;
END $$;

-- Créer l'index sur event_type
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);

-- Créer l'index sur user_id s'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);

-- Créer l'index sur created_at s'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);

