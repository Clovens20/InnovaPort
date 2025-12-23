-- ============================================
-- MIGRATION: Complete subscriptions table structure
-- ============================================
-- Cette migration ajoute toutes les colonnes manquantes à la table subscriptions
-- pour qu'elle corresponde au schéma complet
-- ============================================

-- S'assurer que la table subscriptions existe
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Ajouter la colonne plan si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'plan'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN plan TEXT NOT NULL DEFAULT 'free';
        
        -- Ajouter la contrainte CHECK
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_plan_check 
        CHECK (plan IN ('free', 'pro', 'premium'));
        
        COMMENT ON COLUMN public.subscriptions.plan IS 'Plan d''abonnement (free, pro, premium)';
    END IF;
END $$;

-- Ajouter la colonne status si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'status'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
        
        -- Ajouter la contrainte CHECK
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_status_check 
        CHECK (status IN ('active', 'canceled', 'past_due', 'trialing'));
        
        COMMENT ON COLUMN public.subscriptions.status IS 'Statut de l''abonnement';
    END IF;
END $$;

-- Ajouter la colonne current_period_start si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'current_period_start'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN current_period_start TIMESTAMPTZ;
        
        COMMENT ON COLUMN public.subscriptions.current_period_start IS 'Début de la période d''abonnement actuelle';
    END IF;
END $$;

-- Ajouter la colonne current_period_end si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'current_period_end'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN current_period_end TIMESTAMPTZ;
        
        COMMENT ON COLUMN public.subscriptions.current_period_end IS 'Fin de la période d''abonnement actuelle';
    END IF;
END $$;

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

-- Ajouter la colonne created_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN created_at TIMESTAMPTZ DEFAULT NOW();
        
        COMMENT ON COLUMN public.subscriptions.created_at IS 'Date de création de l''abonnement';
    END IF;
END $$;

-- Ajouter la colonne updated_at si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.subscriptions 
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        
        COMMENT ON COLUMN public.subscriptions.updated_at IS 'Date de dernière mise à jour de l''abonnement';
    END IF;
END $$;

-- Créer l'index sur user_id s'il n'existe pas
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
ON public.subscriptions(user_id);

-- Créer l'index sur stripe_subscription_id s'il n'existe pas (si la colonne existe)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions' 
        AND column_name = 'stripe_subscription_id'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
        ON public.subscriptions(stripe_subscription_id);
    END IF;
END $$;

