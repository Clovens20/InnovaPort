-- Migration: Correction des politiques RLS pour le bucket "avatars"
-- Date: 2024
-- Description: Assure que les admins et utilisateurs peuvent uploader des avatars
-- IMPORTANT: Cette migration doit être exécutée dans Supabase SQL Editor

-- Supprimer toutes les politiques existantes pour le bucket avatars
DROP POLICY IF EXISTS "Users can upload their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- Politique 1 : Upload autorisé pour tous les utilisateurs authentifiés
-- Format accepté: filename (le nom du fichier contient l'user_id)
CREATE POLICY "Users can upload their own avatars"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' AND
        -- Le nom du fichier doit contenir l'user_id de l'utilisateur authentifié
        name LIKE '%' || auth.uid()::text || '%'
    );

-- Politique 2 : Lecture publique de tous les fichiers du bucket avatars
CREATE POLICY "Public can view avatars"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'avatars');

-- Politique 3 : Les utilisateurs peuvent mettre à jour leurs propres avatars
CREATE POLICY "Users can update their own avatars"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        name LIKE '%' || auth.uid()::text || '%'
    )
    WITH CHECK (
        bucket_id = 'avatars' AND
        name LIKE '%' || auth.uid()::text || '%'
    );

-- Politique 4 : Les utilisateurs peuvent supprimer leurs propres avatars
CREATE POLICY "Users can delete their own avatars"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'avatars' AND
        name LIKE '%' || auth.uid()::text || '%'
    );

