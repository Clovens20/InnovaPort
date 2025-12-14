/**
 * Constantes partagées pour les formulaires de contact/devis
 * 
 * Fonction: Évite la duplication de code entre les différents formulaires
 * Dépendances: lucide-react
 * Raison: Centraliser les constantes utilisées dans app/[username]/contact et app/preview/[subdomain]/contact
 */

import { Monitor, Smartphone, ShoppingCart, Globe, LucideIcon } from 'lucide-react';

export const projectTypes: Array<{
    value: string;
    label: string;
    icon: LucideIcon;
    description: string;
}> = [
    { value: 'web_app', label: 'Application Web', icon: Monitor, description: 'Saas, Dashboard, Outil métier' },
    { value: 'mobile_app', label: 'Application Mobile', icon: Smartphone, description: 'iOS & Android' },
    { value: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, description: 'Boutique en ligne' },
    { value: 'website', label: 'Site Vitrine', icon: Globe, description: 'Présentation entreprise' },
];

export const budgetRanges = [
    { value: 'small', label: '< 5 000€' },
    { value: 'medium', label: '5k€ - 10k€' },
    { value: 'large', label: '10k€ - 20k€' },
    { value: 'xl', label: '> 20 000€' },
];

export const featuresList = [
    'Paiement en ligne',
    'Authentification',
    'Multi-langues',
    'Dashboard admin',
    'Blog / News',
    'Réservation',
    'Chat / Messagerie',
    'Map / Géolocalisation',
];

