-- ============================================
-- INNOVAPORT DATABASE SCHEMA
-- ============================================
-- Ce fichier contient le schéma SQL complet pour InnovaPort
-- À exécuter dans Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles
-- Stocke les profils utilisateurs avec leurs informations de portfolio
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    bio TEXT,
    avatar_url TEXT,
    title TEXT,
    website TEXT,
    tiktok_url TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    linkedin_url TEXT,
    email TEXT,
    primary_color TEXT DEFAULT '#1E3A8A',
    secondary_color TEXT DEFAULT '#10B981',
    template TEXT DEFAULT 'modern',
    custom_css TEXT,
    subdomain TEXT, -- Déprécié : utiliser username à la place
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
    -- Champs de personnalisation du portfolio
    available_for_work BOOLEAN DEFAULT TRUE,
    hero_title TEXT,
    hero_subtitle TEXT,
    hero_description TEXT,
    stats_years_experience INTEGER DEFAULT 5,
    stats_projects_delivered INTEGER DEFAULT 15,
    stats_clients_satisfied INTEGER DEFAULT 10,
    stats_response_time TEXT DEFAULT '48h',
    services JSONB DEFAULT '[]'::jsonb,
    work_process JSONB DEFAULT '[]'::jsonb,
    technologies_list TEXT[] DEFAULT '{}',
    cta_title TEXT,
    cta_subtitle TEXT,
    cta_button_text TEXT DEFAULT 'Demander un devis gratuit',
    cta_footer_text TEXT,
    -- Champs pour la page "À propos"
    about_journey TEXT,
    about_approach TEXT,
    about_why_choose TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: projects
-- Stocke les projets des utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    category TEXT,
    short_description TEXT,
    full_description TEXT,
    problem TEXT,
    technologies TEXT[] DEFAULT '{}',
    client_type TEXT DEFAULT 'personal',
    client_name TEXT,
    duration_value INTEGER,
    duration_unit TEXT DEFAULT 'weeks',
    project_url TEXT,
    tags TEXT,
    image_url TEXT,
    featured BOOLEAN DEFAULT FALSE,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- ============================================
-- TABLE: quotes
-- Stocke les demandes de devis reçues
-- ============================================
CREATE TABLE IF NOT EXISTS quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    location TEXT,
    project_type TEXT NOT NULL,
    platforms JSONB DEFAULT '{}',
    budget TEXT NOT NULL,
    deadline TEXT,
    features TEXT[] DEFAULT '{}',
    design_pref TEXT,
    description TEXT NOT NULL,
    has_vague_idea BOOLEAN DEFAULT FALSE,
    contact_pref TEXT DEFAULT 'Email',
    consent_contact BOOLEAN DEFAULT FALSE,
    consent_privacy BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'discussing', 'quoted', 'accepted', 'rejected')),
    internal_notes TEXT,
    last_reminder_sent_at TIMESTAMPTZ, -- Dernier rappel envoyé
    reminders_count INTEGER DEFAULT 0, -- Nombre de rappels envoyés
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: subscriptions
-- Stocke les abonnements utilisateurs
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: analytics
-- Stocke les analytics de visites et clics
-- ============================================
CREATE TABLE IF NOT EXISTS analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL CHECK (event_type IN ('portfolio_view', 'quote_click', 'project_view', 'contact_click')),
    path TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- TABLE: testimonials
-- Stocke les témoignages des clients
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
    approved BOOLEAN DEFAULT FALSE, -- Le développeur doit approuver le témoignage
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES pour optimiser les performances
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
-- Index subdomain supprimé (déprécié, utiliser username)
-- CREATE INDEX IF NOT EXISTS idx_profiles_subdomain ON profiles(subdomain);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_published ON projects(published) WHERE published = TRUE;
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_testimonials_user_id ON testimonials(user_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_approved ON testimonials(approved) WHERE approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials(featured) WHERE featured = TRUE;

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at (supprimer s'ils existent déjà, puis créer)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quotes_updated_at ON quotes;
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_testimonials_updated_at ON testimonials;
CREATE TRIGGER update_testimonials_updated_at BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour générer un username unique depuis un email
CREATE OR REPLACE FUNCTION generate_username_from_email(email TEXT)
RETURNS TEXT AS $$
DECLARE
    base_username TEXT;
    final_username TEXT;
    counter INTEGER := 0;
BEGIN
    -- Extraire la partie avant @ de l'email
    base_username := LOWER(SPLIT_PART(email, '@', 1));
    
    -- Nettoyer le username : remplacer les caractères spéciaux par des tirets
    base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '-', 'g');
    
    -- Supprimer les tirets multiples et les tirets en début/fin
    base_username := REGEXP_REPLACE(base_username, '-+', '-', 'g');
    base_username := TRIM(BOTH '-' FROM base_username);
    
    -- S'assurer que le username fait au moins 3 caractères
    IF LENGTH(base_username) < 3 THEN
        base_username := base_username || '-user';
    END IF;
    
    -- Limiter à 30 caractères
    IF LENGTH(base_username) > 30 THEN
        base_username := SUBSTRING(base_username FROM 1 FOR 30);
        base_username := RTRIM(base_username, '-');
    END IF;
    
    -- Vérifier l'unicité et ajouter un suffixe si nécessaire
    final_username := base_username;
    
    WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
        counter := counter + 1;
        final_username := base_username || '-' || counter::TEXT;
        
        -- Limiter à 30 caractères même avec le suffixe
        IF LENGTH(final_username) > 30 THEN
            final_username := SUBSTRING(base_username FROM 1 FOR 30 - LENGTH(counter::TEXT) - 1) || '-' || counter::TEXT;
        END IF;
    END LOOP;
    
    RETURN final_username;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    generated_username TEXT;
    user_full_name TEXT;
BEGIN
    -- Générer le username depuis l'email
    generated_username := generate_username_from_email(NEW.email);
    
    -- Récupérer le full_name depuis les métadonnées ou utiliser la partie avant @ de l'email
    user_full_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        INITCAP(SPLIT_PART(NEW.email, '@', 1))
    );
    
    -- Créer le profil
    INSERT INTO public.profiles (
        id,
        username,
        full_name,
        email,
        subscription_tier,
        primary_color,
        secondary_color,
        template
    )
    VALUES (
        NEW.id,
        generated_username,
        user_full_name,
        NEW.email,
        'free', -- Plan gratuit par défaut
        '#1E3A8A', -- Couleur primaire par défaut
        '#10B981', -- Couleur secondaire par défaut
        'modern' -- Template par défaut
    )
    ON CONFLICT (id) DO NOTHING; -- Éviter les doublons
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES: profiles
-- ============================================
-- Public: SELECT seulement pour les profils publiés
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users: UPDATE leur propre profil
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users: INSERT leur propre profil (via trigger)
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ============================================
-- POLICIES: projects
-- ============================================
-- Public: SELECT seulement les projets publiés
DROP POLICY IF EXISTS "Published projects are viewable by everyone" ON projects;
CREATE POLICY "Published projects are viewable by everyone"
    ON projects FOR SELECT
    USING (published = TRUE);

-- Users: SELECT tous leurs projets (publiés ou non)
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

-- Users: INSERT leurs propres projets
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users: UPDATE leurs propres projets
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id);

-- Users: DELETE leurs propres projets
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: quotes
-- ============================================
-- Public: INSERT pour créer des devis (via API avec service role)
-- Note: L'insertion publique se fait via API route avec service role key

-- Users: SELECT leurs propres devis
DROP POLICY IF EXISTS "Users can view own quotes" ON quotes;
CREATE POLICY "Users can view own quotes"
    ON quotes FOR SELECT
    USING (auth.uid() = user_id);

-- Users: UPDATE leurs propres devis
DROP POLICY IF EXISTS "Users can update own quotes" ON quotes;
CREATE POLICY "Users can update own quotes"
    ON quotes FOR UPDATE
    USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: subscriptions
-- ============================================
-- Users: SELECT leur propre abonnement
DROP POLICY IF EXISTS "Users can view own subscription" ON subscriptions;
CREATE POLICY "Users can view own subscription"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: analytics
-- ============================================
-- Public: INSERT pour tracker les événements (via API avec service role)
-- Note: L'insertion publique se fait via API route avec service role key

-- Users: SELECT leurs propres analytics
DROP POLICY IF EXISTS "Users can view own analytics" ON analytics;
CREATE POLICY "Users can view own analytics"
    ON analytics FOR SELECT
    USING (auth.uid() = user_id);

-- ============================================
-- POLICIES: testimonials
-- ============================================
-- Public: SELECT seulement les témoignages approuvés
DROP POLICY IF EXISTS "Approved testimonials are viewable by everyone" ON testimonials;
CREATE POLICY "Approved testimonials are viewable by everyone"
    ON testimonials FOR SELECT
    USING (approved = TRUE);

-- Users: SELECT tous leurs témoignages (approuvés ou non)
DROP POLICY IF EXISTS "Users can view own testimonials" ON testimonials;
CREATE POLICY "Users can view own testimonials"
    ON testimonials FOR SELECT
    USING (auth.uid() = user_id);

-- Users: UPDATE leurs propres témoignages
DROP POLICY IF EXISTS "Users can update own testimonials" ON testimonials;
CREATE POLICY "Users can update own testimonials"
    ON testimonials FOR UPDATE
    USING (auth.uid() = user_id);

-- Users: DELETE leurs propres témoignages
DROP POLICY IF EXISTS "Users can delete own testimonials" ON testimonials;
CREATE POLICY "Users can delete own testimonials"
    ON testimonials FOR DELETE
    USING (auth.uid() = user_id);

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

-- Policies: Utilisateurs authentifiés peuvent modifier
DROP POLICY IF EXISTS "Authenticated users can manage social proof" ON homepage_social_proof;
CREATE POLICY "Authenticated users can manage social proof"
    ON homepage_social_proof FOR ALL
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can manage settings" ON homepage_settings;
CREATE POLICY "Authenticated users can manage settings"
    ON homepage_settings FOR ALL
    USING (auth.role() = 'authenticated');

-- ============================================
-- COMMENTS
-- ============================================
COMMENT ON TABLE profiles IS 'Profils utilisateurs avec informations de portfolio';
COMMENT ON TABLE projects IS 'Projets des utilisateurs pour leurs portfolios';
COMMENT ON TABLE quotes IS 'Demandes de devis reçues par les utilisateurs';
COMMENT ON TABLE subscriptions IS 'Abonnements Stripe des utilisateurs';
COMMENT ON TABLE analytics IS 'Analytics de visites et interactions';
COMMENT ON TABLE testimonials IS 'Témoignages des clients sur les projets réalisés';
COMMENT ON COLUMN testimonials.approved IS 'Le développeur doit approuver le témoignage avant qu''il ne soit visible publiquement';
COMMENT ON TABLE homepage_social_proof IS 'Entreprises/freelances affichés dans le social proof de la page d''accueil';
COMMENT ON TABLE homepage_settings IS 'Paramètres de la page d''accueil (texte, emoji, etc.)';

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

-- ============================================
-- TABLE: auto_response_templates
-- Stocke les templates de réponses automatiques pour les prospects
-- ============================================
CREATE TABLE IF NOT EXISTS auto_response_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    conditions JSONB DEFAULT '{}'::jsonb,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_auto_response_templates_user_id ON auto_response_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_auto_response_templates_enabled ON auto_response_templates(user_id, enabled) WHERE enabled = TRUE;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS update_auto_response_templates_updated_at ON auto_response_templates;
CREATE TRIGGER update_auto_response_templates_updated_at
    BEFORE UPDATE ON auto_response_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE auto_response_templates ENABLE ROW LEVEL SECURITY;

-- Policies: Users peuvent gérer leurs propres templates
DROP POLICY IF EXISTS "Users can view own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can view own auto response templates"
    ON auto_response_templates FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can insert own auto response templates"
    ON auto_response_templates FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can update own auto response templates"
    ON auto_response_templates FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own auto response templates" ON auto_response_templates;
CREATE POLICY "Users can delete own auto response templates"
    ON auto_response_templates FOR DELETE
    USING (auth.uid() = user_id);

COMMENT ON TABLE auto_response_templates IS 'Templates de réponses automatiques personnalisées pour les prospects';
COMMENT ON COLUMN auto_response_templates.conditions IS 'Conditions JSON pour déclencher ce template (project_type, budget_range, etc.)';

-- ============================================
-- TABLE: quote_reminder_settings
-- Stocke les paramètres de rappels automatiques pour chaque utilisateur
-- ============================================
CREATE TABLE IF NOT EXISTS quote_reminder_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    reminder_days INTEGER[] DEFAULT ARRAY[3, 7, 14], -- Jours après lesquels envoyer un rappel (ex: après 3, 7, 14 jours)
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

COMMENT ON TABLE quote_reminder_settings IS 'Paramètres de rappels automatiques pour les devis';
COMMENT ON COLUMN quote_reminder_settings.reminder_days IS 'Tableau des jours après lesquels envoyer un rappel (ex: [3, 7, 14] = rappels après 3, 7 et 14 jours)';

-- ============================================
-- TABLE: quote_reminder_settings
-- Stocke les paramètres de rappels automatiques pour chaque utilisateur
-- ============================================
CREATE TABLE IF NOT EXISTS quote_reminder_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    enabled BOOLEAN DEFAULT TRUE,
    reminder_days INTEGER[] DEFAULT ARRAY[3, 7, 14], -- Jours après lesquels envoyer un rappel (ex: après 3, 7, 14 jours)
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

COMMENT ON TABLE quote_reminder_settings IS 'Paramètres de rappels automatiques pour les devis';
COMMENT ON COLUMN quote_reminder_settings.reminder_days IS 'Tableau des jours après lesquels envoyer un rappel (ex: [3, 7, 14] = rappels après 3, 7 et 14 jours)';

