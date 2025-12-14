-- ============================================
-- MIGRATION: Ajout des champs de personnalisation du portfolio
-- ============================================
-- Date: 2024
-- Description: Ajoute les champs nécessaires pour personnaliser le portfolio public
--              (stats, services, process, technologies, CTA, disponibilité)
-- ============================================

-- Ajouter les champs de personnalisation au profil
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS available_for_work BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_description TEXT,
ADD COLUMN IF NOT EXISTS stats_years_experience INTEGER DEFAULT 5,
ADD COLUMN IF NOT EXISTS stats_projects_delivered INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS stats_clients_satisfied INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS stats_response_time TEXT DEFAULT '48h',
ADD COLUMN IF NOT EXISTS services JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS work_process JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS technologies_list TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cta_title TEXT,
ADD COLUMN IF NOT EXISTS cta_subtitle TEXT,
ADD COLUMN IF NOT EXISTS cta_button_text TEXT DEFAULT 'Demander un devis gratuit',
ADD COLUMN IF NOT EXISTS cta_footer_text TEXT;

-- ============================================
-- TABLE: testimonials
-- Stocke les témoignages des clients
-- ============================================
-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    client_position TEXT,
    client_avatar_url TEXT,
    rating INTEGER,
    testimonial_text TEXT NOT NULL,
    project_name TEXT,
    project_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ajouter les colonnes manquantes si la table existe déjà (pour les migrations incrémentielles)
DO $$ 
BEGIN
    -- Ajouter la colonne featured si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'featured') THEN
        ALTER TABLE testimonials ADD COLUMN featured BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Ajouter la colonne approved si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'testimonials' AND column_name = 'approved') THEN
        ALTER TABLE testimonials ADD COLUMN approved BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Ajouter la contrainte CHECK pour rating si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints 
                   WHERE table_name = 'testimonials' 
                   AND constraint_name = 'testimonials_rating_check') THEN
        ALTER TABLE testimonials ADD CONSTRAINT testimonials_rating_check 
        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));
    END IF;
END $$;

-- Index pour optimiser les requêtes (créés après avoir assuré que les colonnes existent)
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved) WHERE approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured) WHERE featured = TRUE;

-- Trigger pour updated_at (supprimer s'il existe déjà, puis créer)
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) pour testimonials
-- ============================================
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public: SELECT seulement les témoignages approuvés
CREATE POLICY "Approved testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    USING (approved = TRUE);

-- Users: SELECT tous leurs témoignages (approuvés ou non)
CREATE POLICY "Users can view own testimonials"
    ON testimonials FOR SELECT
    USING (auth.uid() = user_id);

-- Users: UPDATE leurs propres témoignages
CREATE POLICY "Users can update own testimonials"
    ON testimonials FOR UPDATE
    USING (auth.uid() = user_id);

-- Users: DELETE leurs propres témoignages
CREATE POLICY "Users can delete own testimonials"
    ON testimonials FOR DELETE
    USING (auth.uid() = user_id);

-- Public: INSERT pour permettre aux clients de soumettre des témoignages
-- Note: L'insertion publique se fait via API route avec service role key
-- pour valider l'email du client et vérifier qu'il a bien un projet avec le développeur

COMMENT ON TABLE testimonials IS 'Témoignages des clients sur les projets réalisés';
COMMENT ON COLUMN testimonials.approved IS 'Le développeur doit approuver le témoignage avant qu''il ne soit visible publiquement';

