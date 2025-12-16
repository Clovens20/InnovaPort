-- Migration: Création des tables pour les messages de contact et les inscriptions newsletter
-- Date: 2025-01-XX

-- Table pour les messages de contact
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    message TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    read_at TIMESTAMP WITH TIME ZONE,
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les inscriptions newsletter
CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    source VARCHAR(100) DEFAULT 'blog' CHECK (source IN ('blog', 'homepage', 'footer', 'other')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_status ON newsletter_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscriptions_subscribed_at ON newsletter_subscriptions(subscribed_at DESC);

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_newsletter_subscriptions_updated_at
    BEFORE UPDATE ON newsletter_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies pour contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent tout faire
CREATE POLICY "Admins can manage contact messages"
    ON contact_messages
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Public peut créer des messages
CREATE POLICY "Public can create contact messages"
    ON contact_messages
    FOR INSERT
    WITH CHECK (true);

-- Policy: Public ne peut pas lire les messages (seuls les admins)
CREATE POLICY "Public cannot read contact messages"
    ON contact_messages
    FOR SELECT
    USING (false);

-- RLS Policies pour newsletter_subscriptions
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Les admins peuvent tout faire
CREATE POLICY "Admins can manage newsletter subscriptions"
    ON newsletter_subscriptions
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Policy: Public peut créer des inscriptions
CREATE POLICY "Public can create newsletter subscriptions"
    ON newsletter_subscriptions
    FOR INSERT
    WITH CHECK (true);

-- Policy: Public peut mettre à jour son propre email (pour unsubscribe)
CREATE POLICY "Public can update own subscription"
    ON newsletter_subscriptions
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Policy: Public ne peut pas lire les inscriptions (seuls les admins)
CREATE POLICY "Public cannot read newsletter subscriptions"
    ON newsletter_subscriptions
    FOR SELECT
    USING (false);

-- Commentaires pour documentation
COMMENT ON TABLE contact_messages IS 'Messages de contact reçus depuis le formulaire de contact';
COMMENT ON TABLE newsletter_subscriptions IS 'Inscriptions à la newsletter depuis différents points du site';
COMMENT ON COLUMN contact_messages.status IS 'Statut du message: new, read, replied, archived';
COMMENT ON COLUMN newsletter_subscriptions.source IS 'Source de l''inscription: blog, homepage, footer, other';
COMMENT ON COLUMN newsletter_subscriptions.status IS 'Statut de l''abonnement: active, unsubscribed, bounced';

