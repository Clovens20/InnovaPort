-- ============================================
-- MIGRATION: Création du bucket Storage "avatars"
-- ============================================
-- Ce script crée le bucket Supabase Storage pour les photos de profil
-- À exécuter dans Supabase SQL Editor si le bucket n'existe pas déjà
-- ============================================

-- Créer le bucket "avatars" (public pour que les images soient accessibles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    5242880, -- 5 MB en bytes
    ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- POLITIQUES RLS POUR LE BUCKET "avatars"
-- ============================================

-- Politique 1 : Upload autorisé pour les utilisateurs authentifiés
-- Les utilisateurs peuvent uploader dans leur propre dossier (avatars/{user_id}/)
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (string_to_array(name, '/'))[1] = 'avatars' AND
    (string_to_array(name, '/'))[2] = auth.uid()::text
);

-- Politique 2 : Lecture publique
-- Tout le monde peut voir les avatars (nécessaire pour les portfolios publics)
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Politique 3 : Mise à jour par le propriétaire
-- Les utilisateurs peuvent mettre à jour leurs propres avatars
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (string_to_array(name, '/'))[2] = auth.uid()::text
)
WITH CHECK (
    bucket_id = 'avatars' AND
    (string_to_array(name, '/'))[2] = auth.uid()::text
);

-- Politique 4 : Suppression par le propriétaire
-- Les utilisateurs peuvent supprimer leurs propres avatars
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (string_to_array(name, '/'))[2] = auth.uid()::text
);

