-- ============================================
-- MIGRATION: Enable anonymous visitor tracking
-- ============================================
-- Cette migration permet de tracker les visiteurs anonymes
-- du site principal (www.innovaport.dev) sans nécessiter un user_id
-- ============================================

-- 1. Ajouter 'page_view' comme type d'événement valide
DO $$ 
BEGIN
    -- Supprimer la contrainte CHECK existante si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'analytics_event_type_check' 
        AND table_name = 'analytics'
    ) THEN
        ALTER TABLE public.analytics 
        DROP CONSTRAINT analytics_event_type_check;
    END IF;
    
    -- Recréer la contrainte avec 'page_view' ajouté
    ALTER TABLE public.analytics 
    ADD CONSTRAINT analytics_event_type_check 
    CHECK (event_type IN ('portfolio_view', 'quote_click', 'project_view', 'contact_click', 'page_view'));
END $$;

-- 2. Permettre user_id NULL pour les visiteurs anonymes
DO $$ 
BEGIN
    -- Supprimer la contrainte NOT NULL si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'analytics' 
        AND column_name = 'user_id' 
        AND is_nullable = 'NO'
    ) THEN
        -- Supprimer d'abord la contrainte de clé étrangère si elle existe
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'analytics_user_id_fkey' 
            AND table_name = 'analytics'
        ) THEN
            ALTER TABLE public.analytics 
            DROP CONSTRAINT analytics_user_id_fkey;
        END IF;
        
        -- Permettre NULL
        ALTER TABLE public.analytics 
        ALTER COLUMN user_id DROP NOT NULL;
        
        -- Recréer la contrainte de clé étrangère avec ON DELETE CASCADE
        ALTER TABLE public.analytics 
        ADD CONSTRAINT analytics_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Créer un index partiel pour les événements du site principal (sans user_id)
CREATE INDEX IF NOT EXISTS idx_analytics_site_visits 
ON analytics(created_at DESC) 
WHERE user_id IS NULL;

-- 4. Créer un index pour les événements page_view
CREATE INDEX IF NOT EXISTS idx_analytics_page_view 
ON analytics(event_type, created_at DESC) 
WHERE event_type = 'page_view';

-- 5. Créer un index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_analytics_path_created 
ON analytics(path, created_at DESC) 
WHERE path IS NOT NULL;

