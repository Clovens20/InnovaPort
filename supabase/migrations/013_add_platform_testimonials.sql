-- ============================================
-- TABLE: platform_testimonials
-- Stocke les témoignages sur la plateforme InnovaPort elle-même
-- ============================================
CREATE TABLE IF NOT EXISTS platform_testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    client_position TEXT,
    client_avatar_url TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    testimonial_text TEXT NOT NULL,
    project_name TEXT,
    project_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_platform_testimonials_updated_at ON platform_testimonials;
CREATE TRIGGER update_platform_testimonials_updated_at
    BEFORE UPDATE ON platform_testimonials
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Index
CREATE INDEX IF NOT EXISTS idx_platform_testimonials_approved ON platform_testimonials(approved) WHERE approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_platform_testimonials_featured ON platform_testimonials(featured) WHERE featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_platform_testimonials_created_at ON platform_testimonials(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE platform_testimonials ENABLE ROW LEVEL SECURITY;

-- Policies: Tout le monde peut lire les témoignages approuvés
DROP POLICY IF EXISTS "Anyone can view approved platform testimonials" ON platform_testimonials;
CREATE POLICY "Anyone can view approved platform testimonials"
    ON platform_testimonials FOR SELECT
    USING (approved = TRUE);

-- Policies: Tout le monde peut insérer (pour soumettre un témoignage)
DROP POLICY IF EXISTS "Anyone can insert platform testimonials" ON platform_testimonials;
CREATE POLICY "Anyone can insert platform testimonials"
    ON platform_testimonials FOR INSERT
    WITH CHECK (true);

-- Policies: Utilisateurs authentifiés peuvent modifier (pour admin)
DROP POLICY IF EXISTS "Authenticated users can manage platform testimonials" ON platform_testimonials;
CREATE POLICY "Authenticated users can manage platform testimonials"
    ON platform_testimonials FOR ALL
    USING (auth.role() = 'authenticated');

COMMENT ON TABLE platform_testimonials IS 'Témoignages des clients sur la plateforme InnovaPort elle-même';

