-- ============================================
-- MIGRATION: Auto-create profile with username generation
-- ============================================
-- Cette migration améliore le trigger de création automatique de profil
-- pour générer un username unique basé sur l'email
-- ============================================

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

-- Ajouter la colonne subscription_tier si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'subscription_tier'
    ) THEN
        ALTER TABLE public.profiles 
        ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'business'));
    END IF;
END $$;

-- Fonction améliorée pour créer automatiquement un profil lors de l'inscription
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

-- Recréer le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Index pour améliorer les performances de recherche de username
CREATE INDEX IF NOT EXISTS idx_profiles_username_lower ON profiles(LOWER(username));

-- Commentaires
COMMENT ON FUNCTION generate_username_from_email IS 'Génère un username unique depuis un email';
COMMENT ON FUNCTION handle_new_user IS 'Crée automatiquement un profil lors de l''inscription d''un nouvel utilisateur';

