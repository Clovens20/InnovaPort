-- ============================================
-- MIGRATION: Custom Domains & Custom Slugs
-- ============================================
-- Ajoute le support des domaines personnalisés et slugs personnalisés
-- Pour les plans Pro (1 domaine + slug) et Premium (domaines illimités + sous-domaines)
-- ============================================

-- Ajouter le champ custom_slug dans profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS custom_slug TEXT UNIQUE;

-- Index pour recherche rapide par custom_slug
CREATE INDEX IF NOT EXISTS idx_profiles_custom_slug ON profiles(custom_slug) WHERE custom_slug IS NOT NULL;

-- ============================================
-- TABLE: custom_domains
-- Gère les domaines personnalisés et sous-domaines
-- ============================================
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL, -- Ex: monsite.com
    subdomain TEXT, -- Ex: portfolio, work (pour portfolio.monsite.com, NULL = domaine racine)
    slug TEXT, -- Slug personnalisé pour le portfolio (optionnel)
    is_primary BOOLEAN DEFAULT FALSE, -- Domaine principal
    ssl_status TEXT DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'active', 'failed', 'expired')),
    verification_token TEXT, -- Token pour vérifier la propriété du domaine
    verification_method TEXT DEFAULT 'dns' CHECK (verification_method IN ('dns', 'file')), -- Méthode de vérification
    verified_at TIMESTAMPTZ,
    dns_records JSONB DEFAULT '{}'::jsonb, -- Stocke les enregistrements DNS nécessaires
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_user_id ON custom_domains(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_slug ON custom_domains(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custom_domains_ssl_status ON custom_domains(ssl_status);

-- Contrainte unique : un utilisateur ne peut pas avoir le même domaine+subdomain
-- Utilisation d'un index unique avec expression pour gérer les valeurs NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_domains_user_domain_subdomain 
    ON custom_domains(user_id, domain, COALESCE(subdomain, ''));

-- Trigger pour mettre à jour updated_at
DROP TRIGGER IF EXISTS update_custom_domains_updated_at ON custom_domains;
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE ON custom_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour s'assurer qu'un utilisateur n'a qu'un seul domaine principal
CREATE OR REPLACE FUNCTION ensure_single_primary_domain()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_primary = TRUE THEN
        -- Désactiver les autres domaines principaux du même utilisateur
        UPDATE custom_domains
        SET is_primary = FALSE
        WHERE user_id = NEW.user_id
        AND id != NEW.id
        AND is_primary = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour s'assurer qu'un seul domaine principal existe
DROP TRIGGER IF EXISTS trigger_single_primary_domain ON custom_domains;
CREATE TRIGGER trigger_single_primary_domain
    BEFORE INSERT OR UPDATE ON custom_domains
    FOR EACH ROW
    WHEN (NEW.is_primary = TRUE)
    EXECUTE FUNCTION ensure_single_primary_domain();

-- RLS (Row Level Security) pour custom_domains
ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;

-- Politique : Les utilisateurs peuvent voir leurs propres domaines
CREATE POLICY "Users can view their own domains"
    ON custom_domains FOR SELECT
    USING (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent créer leurs propres domaines
CREATE POLICY "Users can create their own domains"
    ON custom_domains FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres domaines
CREATE POLICY "Users can update their own domains"
    ON custom_domains FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres domaines
CREATE POLICY "Users can delete their own domains"
    ON custom_domains FOR DELETE
    USING (auth.uid() = user_id);

-- Politique : Lecture publique pour vérification DNS (domaine uniquement, pas user_id)
CREATE POLICY "Public can read domain verification info"
    ON custom_domains FOR SELECT
    USING (true); -- Permet la lecture publique pour vérification DNS

