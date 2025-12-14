-- ============================================
-- MIGRATION: Ensure user_id columns exist
-- ============================================
-- Cette migration s'assure que toutes les colonnes user_id
-- existent dans les tables qui en ont besoin
-- ============================================

-- Vérifier et créer user_id dans projects si nécessaire
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
        
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    END IF;
END $$;

-- Vérifier et créer user_id dans quotes si nécessaire
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.quotes 
        ADD COLUMN user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
        
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
    END IF;
END $$;

-- Vérifier et créer user_id dans subscriptions si nécessaire
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
        
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
    END IF;
END $$;

-- Vérifier et créer user_id dans analytics si nécessaire
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE public.analytics 
        ADD COLUMN user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
        
        -- Créer l'index
        CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
    END IF;
END $$;

-- Vérifier que la contrainte UNIQUE sur (user_id, slug) existe dans projects
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'projects_user_id_slug_key'
    ) THEN
        ALTER TABLE public.projects 
        ADD CONSTRAINT projects_user_id_slug_key UNIQUE(user_id, slug);
    END IF;
END $$;

