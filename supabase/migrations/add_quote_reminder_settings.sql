-- Migration: Ajout de la table quote_reminder_settings
-- Date: 2024
-- Description: Permet de configurer les rappels automatiques pour les devis

-- Table pour stocker les paramètres de rappels automatiques
CREATE TABLE IF NOT EXISTS quote_reminder_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    reminder_days INTEGER[] DEFAULT ARRAY[3, 7, 14], -- Jours après lesquels envoyer un rappel
    reminder_message TEXT, -- Message personnalisé pour les rappels
    notify_on_status_change BOOLEAN DEFAULT TRUE, -- Notifier le client lors des changements de statut
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_quote_reminder_settings_user_id ON quote_reminder_settings(user_id);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_quote_reminder_settings_updated_at ON quote_reminder_settings;
CREATE TRIGGER update_quote_reminder_settings_updated_at
    BEFORE UPDATE ON quote_reminder_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE quote_reminder_settings ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own reminder settings" ON quote_reminder_settings;
CREATE POLICY "Users can view own reminder settings"
    ON quote_reminder_settings FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reminder settings" ON quote_reminder_settings;
CREATE POLICY "Users can insert own reminder settings"
    ON quote_reminder_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own reminder settings" ON quote_reminder_settings;
CREATE POLICY "Users can update own reminder settings"
    ON quote_reminder_settings FOR UPDATE
    USING (auth.uid() = user_id);

-- Ajouter les colonnes de rappels à la table quotes si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'last_reminder_sent_at'
    ) THEN
        ALTER TABLE quotes ADD COLUMN last_reminder_sent_at TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'quotes' AND column_name = 'reminders_count'
    ) THEN
        ALTER TABLE quotes ADD COLUMN reminders_count INTEGER DEFAULT 0;
    END IF;
END $$;

-- Commentaires
COMMENT ON TABLE quote_reminder_settings IS 'Paramètres de rappels automatiques pour les devis';
COMMENT ON COLUMN quote_reminder_settings.reminder_days IS 'Tableau des jours après lesquels envoyer un rappel (ex: [3, 7, 14] = rappels après 3, 7 et 14 jours)';
COMMENT ON COLUMN quote_reminder_settings.notify_on_status_change IS 'Si true, envoie un email au client lors des changements de statut du devis';

