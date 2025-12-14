-- ============================================
-- MIGRATION: Correction des politiques RLS pour le bucket "avatars"
-- ============================================
-- Ce script corrige les politiques RLS pour permettre l'upload de photos de profil
-- À exécuter dans Supabase SQL Editor après avoir créé le bucket
-- ============================================

-- Supprimer toutes les politiques existantes pour le bucket avatars
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Politique 1 : Upload autorisé pour tous les utilisateurs authentifiés dans le bucket avatars
-- Vérifie que le chemin commence par "avatars/" et contient l'user_id
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'avatars' AND
    (string_to_array(name, '/'))[1] = 'avatars' AND
    (string_to_array(name, '/'))[2] = auth.uid()::text
);

-- Politique 2 : Lecture publique de tous les fichiers du bucket avatars
CREATE POLICY "Public can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Politique 3 : Mise à jour par le propriétaire
-- Les utilisateurs peuvent mettre à jour leurs propres avatars
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
CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'avatars' AND
    (string_to_array(name, '/'))[2] = auth.uid()::text
);

