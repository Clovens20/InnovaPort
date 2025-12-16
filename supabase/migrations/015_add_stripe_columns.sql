-- Migration: Ajouter les colonnes Stripe à la table subscriptions
-- Date: 2024-12-18

-- Ajouter les colonnes Stripe si elles n'existent pas déjà
DO $$ 
BEGIN
    -- Ajouter stripe_customer_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'stripe_customer_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_customer_id TEXT;
    END IF;

    -- Ajouter stripe_subscription_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_id'
    ) THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_subscription_id TEXT UNIQUE;
    END IF;
END $$;

-- Créer un index sur stripe_subscription_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id 
ON subscriptions(stripe_subscription_id);

-- Créer un index sur stripe_customer_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id 
ON subscriptions(stripe_customer_id);

