-- Migration: Créer le profil admin s'il n'existe pas
-- Date: 2024
-- Description: Crée automatiquement le profil pour l'utilisateur admin s'il n'existe pas

-- Fonction pour créer un profil admin s'il n'existe pas
DO $$
DECLARE
    admin_user_id UUID;
    admin_email TEXT := 'claircl18@gmail.com';
    admin_username TEXT;
BEGIN
    -- Trouver l'ID de l'utilisateur par email
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = admin_email
    LIMIT 1;

    -- Si l'utilisateur existe
    IF admin_user_id IS NOT NULL THEN
        -- Vérifier si le profil existe déjà
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = admin_user_id) THEN
            -- Générer un username depuis l'email
            admin_username := LOWER(SPLIT_PART(admin_email, '@', 1));
            admin_username := REGEXP_REPLACE(admin_username, '[^a-z0-9]', '', 'g');
            
            -- Vérifier si le username existe déjà
            IF EXISTS (SELECT 1 FROM profiles WHERE username = admin_username) THEN
                admin_username := admin_username || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
            END IF;

            -- Créer le profil avec role='admin'
            INSERT INTO profiles (id, username, email, role, full_name)
            VALUES (
                admin_user_id,
                admin_username,
                admin_email,
                'admin',
                'Administrateur'
            )
            ON CONFLICT (id) DO NOTHING;

            RAISE NOTICE 'Profil admin créé pour % avec username: %', admin_email, admin_username;
        ELSE
            -- Mettre à jour le profil existant pour s'assurer qu'il est admin
            UPDATE profiles
            SET role = 'admin'
            WHERE id = admin_user_id
            AND (role IS NULL OR role != 'admin');

            RAISE NOTICE 'Profil admin mis à jour pour %', admin_email;
        END IF;
    ELSE
        RAISE NOTICE 'Utilisateur avec email % non trouvé dans auth.users', admin_email;
    END IF;
END $$;

-- Vérifier que la colonne role existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'role'
    ) THEN
        ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user';
        ALTER TABLE profiles ADD CONSTRAINT chk_profile_role CHECK (role IN ('user', 'admin'));
        UPDATE profiles SET role = 'user' WHERE role IS NULL;
    END IF;
END $$;

