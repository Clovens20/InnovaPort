-- ============================================
-- TABLE: legal_pages
-- Pages légales éditable depuis l'admin
-- ============================================
CREATE TABLE IF NOT EXISTS legal_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    template_id TEXT DEFAULT 'default',
    last_updated_by UUID REFERENCES auth.users(id),
    published_at TIMESTAMPTZ,
    scheduled_publish_at TIMESTAMPTZ,
    major_changes BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: legal_page_versions
-- Historique des versions des pages légales
-- ============================================
CREATE TABLE IF NOT EXISTS legal_page_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id UUID NOT NULL REFERENCES legal_pages(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    change_note TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(page_id, version_number)
);

-- ============================================
-- TABLE: legal_page_templates
-- Templates pour les pages légales
-- ============================================
CREATE TABLE IF NOT EXISTS legal_page_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    structure TEXT NOT NULL, -- JSON structure
    variables JSONB DEFAULT '{}'::jsonb,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: site_settings (extension pour réseaux sociaux)
-- ============================================
-- Ajouter colonnes pour réseaux sociaux si elles n'existent pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'site_settings' AND column_name = 'social_facebook_url'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN social_facebook_url TEXT;
        ALTER TABLE site_settings ADD COLUMN social_tiktok_url TEXT;
        ALTER TABLE site_settings ADD COLUMN social_twitter_url TEXT;
        ALTER TABLE site_settings ADD COLUMN social_linkedin_url TEXT;
        ALTER TABLE site_settings ADD COLUMN social_instagram_url TEXT;
        ALTER TABLE site_settings ADD COLUMN social_youtube_url TEXT;
        ALTER TABLE site_settings ADD COLUMN social_github_url TEXT;
    END IF;
END $$;

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_legal_pages_slug ON legal_pages(slug);
CREATE INDEX IF NOT EXISTS idx_legal_pages_status ON legal_pages(status);
CREATE INDEX IF NOT EXISTS idx_legal_page_versions_page_id ON legal_page_versions(page_id);
CREATE INDEX IF NOT EXISTS idx_legal_page_versions_created_at ON legal_page_versions(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================
-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_legal_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_legal_pages_updated_at ON legal_pages;
CREATE TRIGGER trigger_update_legal_pages_updated_at
    BEFORE UPDATE ON legal_pages
    FOR EACH ROW
    EXECUTE FUNCTION update_legal_pages_updated_at();

-- Trigger pour créer une version lors de la mise à jour
CREATE OR REPLACE FUNCTION create_legal_page_version()
RETURNS TRIGGER AS $$
DECLARE
    next_version INTEGER;
BEGIN
    -- Récupérer le numéro de version suivant
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
    FROM legal_page_versions
    WHERE page_id = NEW.id;
    
    -- Créer une nouvelle version
    INSERT INTO legal_page_versions (page_id, version_number, content, created_by)
    VALUES (NEW.id, next_version, OLD.content, NEW.last_updated_by);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_legal_page_version ON legal_pages;
CREATE TRIGGER trigger_create_legal_page_version
    AFTER UPDATE OF content ON legal_pages
    FOR EACH ROW
    WHEN (OLD.content IS DISTINCT FROM NEW.content)
    EXECUTE FUNCTION create_legal_page_version();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS
ALTER TABLE legal_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_page_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_page_templates ENABLE ROW LEVEL SECURITY;

-- Policies: legal_pages
-- Public peut lire les pages publiées
DROP POLICY IF EXISTS "Public can read published legal pages" ON legal_pages;
CREATE POLICY "Public can read published legal pages"
    ON legal_pages FOR SELECT
    USING (status = 'published');

-- Admins peuvent tout faire
DROP POLICY IF EXISTS "Admins can manage legal pages" ON legal_pages;
CREATE POLICY "Admins can manage legal pages"
    ON legal_pages FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Policies: legal_page_versions
-- Admins peuvent lire toutes les versions
DROP POLICY IF EXISTS "Admins can read legal page versions" ON legal_page_versions;
CREATE POLICY "Admins can read legal page versions"
    ON legal_page_versions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Admins peuvent créer des versions
DROP POLICY IF EXISTS "Admins can create legal page versions" ON legal_page_versions;
CREATE POLICY "Admins can create legal page versions"
    ON legal_page_versions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- Policies: legal_page_templates
-- Public peut lire les templates
DROP POLICY IF EXISTS "Public can read legal page templates" ON legal_page_templates;
CREATE POLICY "Public can read legal page templates"
    ON legal_page_templates FOR SELECT
    USING (true);

-- Admins peuvent gérer les templates
DROP POLICY IF EXISTS "Admins can manage legal page templates" ON legal_page_templates;
CREATE POLICY "Admins can manage legal page templates"
    ON legal_page_templates FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.is_admin = TRUE
        )
    );

-- ============================================
-- DONNÉES INITIALES
-- ============================================

-- Insérer les pages légales par défaut
INSERT INTO legal_pages (slug, title, content, status, meta_title, meta_description) VALUES
(
    'mentions-legales',
    'Mentions Légales',
    '# Mentions Légales

**Dernière mise à jour : Décembre 2024**

**Nom du site :** Innovaport  
**URL :** www.innovaport.dev  
**Contact :** support@innovaport.dev

Le site Innovaport est édité par Konekte Group, entreprise établie au Québec, Canada.

## 2. Directeur de publication

Le directeur de la publication du site est le représentant légal d''Innovaport.

## 3. Hébergement

Le site www.innovaport.dev est hébergé par un prestataire d''hébergement web professionnel.

Les données sont stockées et traitées conformément aux lois canadiennes et québécoises sur la protection des données.

## 4. Propriété intellectuelle

L''ensemble du contenu présent sur le site www.innovaport.dev (textes, graphiques, logos, icônes, images, code source, structure) est la propriété exclusive d''Innovaport, sauf mention contraire.

Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans l''autorisation écrite préalable d''Innovaport.

Toute exploitation non autorisée du site ou de l''un des éléments qu''il contient sera considérée comme constitutive d''une contrefaçon et poursuivie conformément aux dispositions du Code criminel du Canada.

## 5. Limitation de responsabilité

Innovaport s''efforce d''assurer l''exactitude et la mise à jour des informations diffusées sur ce site. Toutefois, Innovaport ne peut garantir l''exactitude, la précision ou l''exhaustivité des informations mises à disposition sur ce site.

Innovaport ne pourra être tenu responsable des dommages directs ou indirects résultant de l''accès au site ou de l''utilisation du site, y compris l''inaccessibilité, les pertes de données, détériorations, destructions ou virus qui pourraient affecter l''équipement informatique de l''utilisateur.

## 6. Liens hypertextes

Le site www.innovaport.dev peut contenir des liens hypertextes vers d''autres sites. Innovaport n''exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu.

## 7. Droit applicable

Les présentes mentions légales sont régies par le droit canadien et québécois. Tout litige relatif à l''utilisation du site www.innovaport.dev sera soumis à la compétence exclusive des tribunaux du Québec, Canada.

## 8. Contact

Pour toute question concernant les présentes mentions légales, vous pouvez nous contacter à l''adresse suivante :  

**support@innovaport.dev**',
    'published',
    'Mentions Légales - Innovaport',
    'Mentions légales du site Innovaport - Informations sur l''éditeur, l''hébergement, la propriété intellectuelle et les conditions d''utilisation.'
),
(
    'politique-confidentialite',
    'Politique de Confidentialité',
    '# Politique de Confidentialité

**Dernière mise à jour : Décembre 2024**

Chez Innovaport, nous accordons une grande importance à la protection de vos données personnelles. Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations personnelles.

Innovaport est un produit de **Konekte Group**, l''entité légale responsable du traitement de vos données.',
    'published',
    'Politique de Confidentialité - Innovaport',
    'Politique de confidentialité d''Innovaport - Comment nous collectons, utilisons et protégeons vos données personnelles.'
),
(
    'conditions-utilisation',
    'Conditions d''Utilisation',
    '# Conditions d''Utilisation

**Dernière mise à jour : Décembre 2024**

Bienvenue sur Innovaport. En accédant et en utilisant le site www.innovaport.dev, vous acceptez d''être lié par les présentes conditions d''utilisation.',
    'published',
    'Conditions d''Utilisation - Innovaport',
    'Conditions d''utilisation du site Innovaport - Règles et conditions d''accès et d''utilisation.'
),
(
    'politique-cookies',
    'Politique de Cookies',
    '# Politique de Cookies

**Dernière mise à jour : Décembre 2024**

Cette politique de cookies explique ce que sont les cookies, comment nous les utilisons sur le site www.innovaport.dev, et comment vous pouvez contrôler vos préférences en matière de cookies.

Innovaport est un produit de **Konekte Group**, l''entité légale responsable du traitement de vos données.',
    'published',
    'Politique de Cookies - Innovaport',
    'Politique de cookies d''Innovaport - Informations sur l''utilisation des cookies et technologies similaires.'
)
ON CONFLICT (slug) DO NOTHING;

-- Insérer les templates par défaut
INSERT INTO legal_page_templates (name, slug, structure, description) VALUES
(
    'Default',
    'default',
    '{"sections": ["header", "content", "footer"]}',
    'Template par défaut pour les pages légales'
),
(
    'Mentions Légales',
    'mentions-legales',
    '{"sections": ["header", "numbered_sections", "contact", "footer"]}',
    'Template spécifique pour les mentions légales'
),
(
    'Politique de Confidentialité',
    'politique-confidentialite',
    '{"sections": ["header", "toc", "numbered_sections", "rights_cards", "contact", "footer"]}',
    'Template pour les politiques de confidentialité avec table des matières'
)
ON CONFLICT (slug) DO NOTHING;

COMMENT ON TABLE legal_pages IS 'Pages légales éditable depuis l''interface admin';
COMMENT ON TABLE legal_page_versions IS 'Historique des versions des pages légales pour traçabilité';
COMMENT ON TABLE legal_page_templates IS 'Templates pour structurer les pages légales';

