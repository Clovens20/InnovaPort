-- ============================================
-- MIGRATION: Add cancel_at_period_end to subscriptions
-- ============================================
-- Cette migration ajoute la colonne cancel_at_period_end à la table subscriptions
-- ============================================

-- Ajouter la colonne cancel_at_period_end si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'cancel_at_period_end'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
        
        COMMENT ON COLUMN public.subscriptions.cancel_at_period_end IS 'Indique si l''abonnement sera annulé à la fin de la période en cours';
    END IF;
END $$;

