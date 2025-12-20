-- Migration: Ajout de témoignages de développeurs sur la plateforme
-- Date: 2024
-- Description: Ajoute deux témoignages de développeurs (Cany Maitre et François Louvens)

-- Témoignage #1 - Cany Maitre
INSERT INTO platform_testimonials (
    id,
    client_name,
    client_email,
    client_position,
    client_company,
    rating,
    testimonial_text,
    approved,
    featured,
    created_at
) VALUES (
    uuid_generate_v4(),
    'Cany Maitre',
    'cany.maitre@example.com',
    'Développeur Full-Stack Freelance',
    NULL,
    5,
    'Avant InnovaPort, je jonglais entre GitHub pour le code, Notion pour suivre mes projets, Excel pour les devis, et un vieux site WordPress pour mon portfolio. C''était le chaos ! Maintenant, tout est centralisé. Je reçois les demandes de devis directement dans mon dashboard, j''envoie des propositions professionnelles en 2 clics, et mon portfolio tech a l''air ultra pro. J''ai gagné au moins 10 heures par semaine que je peux maintenant consacrer au développement. Le plan gratuit m''a permis de tester sans risque, et maintenant je suis passé au Pro - meilleur investissement de l''année !',
    true,
    true,
    NOW()
) ON CONFLICT DO NOTHING;

-- Témoignage #2 - François Louvens
INSERT INTO platform_testimonials (
    id,
    client_name,
    client_email,
    client_position,
    client_company,
    rating,
    testimonial_text,
    approved,
    featured,
    created_at
) VALUES (
    uuid_generate_v4(),
    'François Louvens',
    'francois.louvens@example.com',
    'Développeur Web & Fondateur d''Agence',
    NULL,
    5,
    'Ce qui m''a convaincu avec InnovaPort, c''est que ça résout VRAIMENT les problèmes qu''on rencontre en développement freelance. L''automatisation des réponses me fait gagner un temps fou - je ne perds plus de clients potentiels parce que j''ai répondu trop tard à une demande. Le système de devis est clair et technique, mes clients développeurs ou entreprises adorent. Et le domaine personnalisé ? Game changer pour ma crédibilité. En 3 mois, j''ai augmenté mon taux de conversion de 40%. Si vous hésitez, testez le plan gratuit - vous ne reviendrez jamais en arrière.',
    true,
    true,
    NOW()
) ON CONFLICT DO NOTHING;

