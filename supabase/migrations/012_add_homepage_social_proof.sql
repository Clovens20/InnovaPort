-- ============================================
-- TABLE: homepage_social_proof
-- Stocke les informations du social proof de la page d'accueil
-- ============================================
CREATE TABLE IF NOT EXISTS homepage_social_proof (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    initials TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#1E3A8A',
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table pour le texte du social proof
CREATE TABLE IF NOT EXISTS homepage_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les valeurs par défaut
INSERT INTO homepage_social_proof (name, initials, color, display_order) VALUES
    ('Marie Charbonneau', 'MC', '#3B82F6', 1),
    ('Sophie Lavoie', 'SL', '#10B981', 2),
    ('Jean Dubois', 'JD', '#8B5CF6', 3)
ON CONFLICT DO NOTHING;

INSERT INTO homepage_settings (key, value) VALUES
    ('social_proof_text', 'Rejoint par 50+ freelances en 2 semaines'),
    ('social_proof_emoji', '🚀')
ON CONFLICT (key) DO NOTHING;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_homepage_social_proof_updated_at ON homepage_social_proof;
CREATE TRIGGER update_homepage_social_proof_updated_at
    BEFORE UPDATE ON homepage_social_proof
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_homepage_settings_updated_at ON homepage_settings;
CREATE TRIGGER update_homepage_settings_updated_at
    BEFORE UPDATE ON homepage_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX IF NOT EXISTS idx_homepage_social_proof_order ON homepage_social_proof(display_order);

-- RLS (Row Level Security)
ALTER TABLE homepage_social_proof ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_settings ENABLE ROW LEVEL SECURITY;

-- Policies: Tout le monde peut lire
DROP POLICY IF EXISTS "Anyone can view social proof" ON homepage_social_proof;
CREATE POLICY "Anyone can view social proof"
    ON homepage_social_proof FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Anyone can view settings" ON homepage_settings;
CREATE POLICY "Anyone can view settings"
    ON homepage_settings FOR SELECT
    USING (true);

-- Policies: Seuls les admins peuvent modifier (à adapter selon votre système d'auth)
-- Pour l'instant, on permet à tous les utilisateurs authentifiés de modifier
-- Vous devrez ajouter un check de rôle admin plus tard
DROP POLICY IF EXISTS "Authenticated users can manage social proof" ON homepage_social_proof;
CREATE POLICY "Authenticated users can manage social proof"
    ON homepage_social_proof FOR ALL
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON homepage_settings;
CREATE POLICY "Authenticated users can manage settings"
    ON homepage_settings FOR ALL
    USING (auth.role() = 'authenticated');

