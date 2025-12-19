-- Script SQL pour corriger l'abonnement d'un utilisateur
-- À exécuter dans Supabase SQL Editor
-- Remplacez 'a2899617-429d-4e52-8862-ea0ab3d035f7' par l'ID de l'utilisateur si nécessaire

-- 1. Vérifier l'état actuel du profil
SELECT 
    id,
    email,
    full_name,
    subscription_tier as profile_plan,
    stripe_customer_id,
    updated_at
FROM profiles
WHERE id = 'a2899617-429d-4e52-8862-ea0ab3d035f7';

-- 2. Mettre à jour directement le profil au plan Pro
-- (Si vous savez que l'utilisateur a payé pour Pro)
UPDATE profiles
SET 
    subscription_tier = 'pro',
    updated_at = NOW()
WHERE id = 'a2899617-429d-4e52-8862-ea0ab3d035f7';

-- 3. Vérifier le résultat
SELECT 
    id,
    email,
    subscription_tier as profile_plan,
    updated_at
FROM profiles
WHERE id = 'a2899617-429d-4e52-8862-ea0ab3d035f7';

-- NOTE: 
-- - Si vous voulez mettre à jour vers 'premium' au lieu de 'pro', changez 'pro' en 'premium' à la ligne 18
-- - Si l'abonnement existe dans Stripe mais pas dans la table subscriptions,
--   utilisez l'API admin (/admin/fix-subscription) pour synchroniser avec Stripe

