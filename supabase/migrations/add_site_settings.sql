-- ============================================
-- TABLE: site_settings
-- Stocke les paramètres globaux du site
-- ============================================
CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    developer_testimonials_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insérer la ligne par défaut si elle n'existe pas
INSERT INTO site_settings (id, developer_testimonials_enabled)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_site_settings_updated_at ON site_settings;
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (seuls les admins peuvent modifier)
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Tout le monde peut lire les paramètres
CREATE POLICY "Anyone can view site settings"
    ON site_settings FOR SELECT
    USING (true);

-- Policy: Seuls les admins peuvent modifier
CREATE POLICY "Admins can update site settings"
    ON site_settings FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

