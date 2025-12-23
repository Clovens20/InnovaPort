-- ============================================
-- MIGRATION: Add revenue tracking to projects
-- ============================================
-- Cette migration ajoute un champ pour tracker les revenus générés par les projets
-- ============================================

-- Ajouter la colonne revenue_amount si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'revenue_amount'
    ) THEN
        -- Ajouter la colonne revenue_amount (en centimes pour éviter les problèmes de précision)
        ALTER TABLE public.projects 
        ADD COLUMN revenue_amount INTEGER DEFAULT NULL;
        
        -- Ajouter un commentaire pour clarifier que c'est en centimes
        COMMENT ON COLUMN public.projects.revenue_amount IS 'Montant du revenu généré par ce projet en centimes (ex: 10000 = 100.00€)';
    END IF;
END $$;

-- Ajouter la colonne revenue_currency si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'revenue_currency'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN revenue_currency TEXT DEFAULT 'EUR';
        
        COMMENT ON COLUMN public.projects.revenue_currency IS 'Devise du revenu (EUR, USD, etc.)';
    END IF;
END $$;

-- Ajouter la colonne revenue_date si elle n'existe pas (date de génération du revenu)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'projects' AND column_name = 'revenue_date'
    ) THEN
        ALTER TABLE public.projects 
        ADD COLUMN revenue_date TIMESTAMPTZ DEFAULT NULL;
        
        COMMENT ON COLUMN public.projects.revenue_date IS 'Date à laquelle le revenu a été généré';
    END IF;
END $$;

-- Créer un index pour les requêtes de revenus
CREATE INDEX IF NOT EXISTS idx_projects_revenue_amount 
ON projects(revenue_amount) 
WHERE revenue_amount IS NOT NULL;

-- Créer un index pour les requêtes par date de revenu
CREATE INDEX IF NOT EXISTS idx_projects_revenue_date 
ON projects(revenue_date DESC) 
WHERE revenue_date IS NOT NULL;

