/**
 * Schémas de validation Zod pour toutes les routes API
 * 
 * Fonction: Centralise toutes les validations de données pour la sécurité
 * Dépendances: zod
 * Raison: Validation stricte des données entrantes pour prévenir les injections et erreurs
 */

import { z } from 'zod';

// ============================================
// SCHÉMAS POUR /api/quotes
// ============================================

/**
 * Schéma pour la création d'un devis
 */
export const createQuoteSchema = z.object({
    username: z
        .string({ message: 'Le nom d\'utilisateur est requis' })
        .min(1, 'Le nom d\'utilisateur ne peut pas être vide')
        .max(50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères')
        .regex(/^[a-z0-9-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres minuscules, chiffres et tirets'),
    
    name: z
        .string({ message: 'Le nom est requis' })
        .min(1, 'Le nom ne peut pas être vide')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .trim(),
    
    email: z
        .string({ message: 'L\'email est requis' })
        .email('Format d\'email invalide')
        .max(255, 'L\'email ne peut pas dépasser 255 caractères')
        .toLowerCase()
        .trim(),
    
    phone: z
        .string()
        .max(20, 'Le numéro de téléphone ne peut pas dépasser 20 caractères')
        .regex(/^[\d\s\-\+\(\)]+$/, 'Format de numéro de téléphone invalide')
        .optional()
        .nullable(),
    
    company: z
        .string()
        .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
        .trim()
        .optional()
        .nullable(),
    
    location: z
        .string()
        .max(100, 'La localisation ne peut pas dépasser 100 caractères')
        .trim()
        .optional()
        .nullable(),
    
    projectType: z
        .string({ message: 'Le type de projet est requis' })
        .min(1, 'Le type de projet ne peut pas être vide')
        .max(100, 'Le type de projet ne peut pas dépasser 100 caractères')
        .trim(),
    
    platforms: z
        .object({
            ios: z.boolean().optional(),
            android: z.boolean().optional(),
        })
        .optional()
        .nullable(),
    
    budget: z
        .string({ message: 'Le budget est requis' })
        .min(1, 'Le budget ne peut pas être vide')
        .max(50, 'Le budget ne peut pas dépasser 50 caractères')
        .trim(),
    
    deadline: z
        .string()
        .max(100, 'Le délai ne peut pas dépasser 100 caractères')
        .trim()
        .optional()
        .nullable(),
    
    features: z
        .array(z.string().max(200, 'Chaque fonctionnalité ne peut pas dépasser 200 caractères'))
        .max(50, 'Maximum 50 fonctionnalités autorisées')
        .optional()
        .default([]),
    
    designPref: z
        .string()
        .max(200, 'La préférence de design ne peut pas dépasser 200 caractères')
        .trim()
        .optional()
        .nullable(),
    
    description: z
        .string({ message: 'La description est requise' })
        .min(10, 'La description doit contenir au moins 10 caractères')
        .max(5000, 'La description ne peut pas dépasser 5000 caractères')
        .trim(),
    
    hasVagueIdea: z
        .boolean()
        .optional()
        .default(false),
    
    contactPref: z
        .string()
        .max(50, 'La préférence de contact ne peut pas dépasser 50 caractères')
        .trim()
        .optional()
        .default('Email'),
    
    consentContact: z
        .boolean()
        .optional()
        .default(false),
    
    consentPrivacy: z
        .boolean({ message: 'Le consentement à la politique de confidentialité est requis' })
        .refine((val) => val === true, {
            message: 'Vous devez accepter la politique de confidentialité',
        }),
});

// Type TypeScript dérivé du schéma
export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;

// ============================================
// SCHÉMAS POUR /api/analytics
// ============================================

/**
 * Types d'événements analytics valides
 */
export const analyticsEventTypes = [
    'portfolio_view',
    'quote_click',
    'project_view',
    'contact_click',
] as const;

/**
 * Schéma pour l'enregistrement d'un événement analytics
 */
export const createAnalyticsSchema = z.object({
    userId: z
        .string({ message: 'L\'ID utilisateur est requis' })
        .uuid('Format UUID invalide pour l\'ID utilisateur'),
    
    eventType: z
        .enum(analyticsEventTypes, {
            message: 'Type d\'événement invalide. Les valeurs autorisées sont: portfolio_view, quote_click, project_view, contact_click',
        }),
    
    path: z
        .string()
        .max(500, 'Le chemin ne peut pas dépasser 500 caractères')
        .refine(
            (val) => !val || val.startsWith('/') || val.startsWith('http://') || val.startsWith('https://'),
            { message: 'Le chemin doit commencer par / ou être une URL valide' }
        )
        .optional()
        .nullable(),
    
    referrer: z
        .string()
        .max(1000, 'Le referrer ne peut pas dépasser 1000 caractères')
        .refine(
            (val) => !val || val.startsWith('http://') || val.startsWith('https://') || val.startsWith('/'),
            { message: 'Le referrer doit être une URL valide ou un chemin' }
        )
        .optional()
        .nullable(),
    
    metadata: z
        .record(z.string(), z.any())
        .optional()
        .nullable(),
});

// Type TypeScript dérivé du schéma
export type CreateAnalyticsInput = z.infer<typeof createAnalyticsSchema>;

// ============================================
// SCHÉMAS POUR /api/projects
// ============================================

/**
 * Types de clients valides
 */
export const clientTypes = ['personal', 'professional', 'open_source'] as const;

/**
 * Unités de durée valides
 */
export const durationUnits = ['weeks', 'months'] as const;

/**
 * Schéma pour la création/mise à jour d'un projet
 */
export const createOrUpdateProjectSchema = z.object({
    id: z
        .string()
        .uuid('Format UUID invalide pour l\'ID du projet')
        .optional(),
    
    title: z
        .string({ message: 'Le titre est requis' })
        .min(1, 'Le titre ne peut pas être vide')
        .max(200, 'Le titre ne peut pas dépasser 200 caractères')
        .trim(),
    
    title_en: z
        .string()
        .max(200, 'Le titre anglais ne peut pas dépasser 200 caractères')
        .trim()
        .optional()
        .nullable(),
    
    slug: z
        .string({ message: 'Le slug est requis' })
        .min(1, 'Le slug ne peut pas être vide')
        .max(100, 'Le slug ne peut pas dépasser 100 caractères')
        .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets')
        .trim(),
    
    category: z
        .string()
        .max(50, 'La catégorie ne peut pas dépasser 50 caractères')
        .trim()
        .optional()
        .nullable(),
    
    short_description: z
        .string()
        .max(500, 'La description courte ne peut pas dépasser 500 caractères')
        .trim()
        .optional()
        .nullable(),
    
    short_description_en: z
        .string()
        .max(500, 'La description courte anglaise ne peut pas dépasser 500 caractères')
        .trim()
        .optional()
        .nullable(),
    
    full_description: z
        .string()
        .max(10000, 'La description complète ne peut pas dépasser 10000 caractères')
        .trim()
        .optional()
        .nullable(),
    
    full_description_en: z
        .string()
        .max(10000, 'La description complète anglaise ne peut pas dépasser 10000 caractères')
        .trim()
        .optional()
        .nullable(),
    
    problem: z
        .string()
        .max(2000, 'La description du problème ne peut pas dépasser 2000 caractères')
        .trim()
        .optional()
        .nullable(),
    
    technologies: z
        .array(z.string().max(50, 'Chaque technologie ne peut pas dépasser 50 caractères'))
        .max(50, 'Maximum 50 technologies autorisées')
        .optional()
        .default([]),
    
    client_type: z
        .enum(clientTypes)
        .optional()
        .default('personal'),
    
    client_name: z
        .string()
        .max(100, 'Le nom du client ne peut pas dépasser 100 caractères')
        .trim()
        .optional()
        .nullable(),
    
    duration_value: z
        .union([z.string(), z.number()])
        .transform((val) => {
            if (typeof val === 'string') {
                const parsed = parseInt(val, 10);
                return isNaN(parsed) ? null : parsed;
            }
            return val;
        })
        .refine((val) => val === null || (typeof val === 'number' && val > 0 && val <= 1000), {
            message: 'La durée doit être un nombre entre 1 et 1000',
        })
        .optional()
        .nullable(),
    
    duration_unit: z
        .enum(durationUnits)
        .optional()
        .default('weeks'),
    
    project_url: z
        .string()
        .url('Format d\'URL invalide')
        .max(500, 'L\'URL du projet ne peut pas dépasser 500 caractères')
        .optional()
        .nullable(),
    
    tags: z
        .string()
        .max(500, 'Les tags ne peuvent pas dépasser 500 caractères')
        .trim()
        .optional()
        .nullable(),
    
    image_url: z
        .string()
        .refine(
            (val) => {
                if (!val) return true; // null/undefined est accepté
                // Accepter les URLs HTTP/HTTPS ou les data URLs (base64)
                return val.startsWith('http://') || 
                       val.startsWith('https://') || 
                       val.startsWith('data:image/');
            },
            { message: 'Format d\'URL invalide pour l\'image. Utilisez une URL HTTP/HTTPS ou une image base64.' }
        )
        .max(5000000, 'L\'URL de l\'image ne peut pas dépasser 5MB (pour base64)') // Augmenter la limite pour base64
        .optional()
        .nullable(),
    
    screenshots_url: z
        .array(
            z.string()
                .refine(
                    (val) => {
                        // Accepter les URLs HTTP/HTTPS ou les data URLs (base64)
                        return val.startsWith('http://') || 
                               val.startsWith('https://') || 
                               val.startsWith('data:image/');
                    },
                    { message: 'Format d\'URL invalide pour la capture d\'écran. Utilisez une URL HTTP/HTTPS ou une image base64.' }
                )
                .max(5000000, 'L\'URL ne peut pas dépasser 5MB (pour base64)')
        )
        .max(10, 'Maximum 10 captures d\'écran autorisées')
        .optional()
        .nullable(),
    
    featured: z
        .boolean()
        .optional()
        .default(false),
    
    published: z
        .boolean()
        .optional()
        .default(false),
});

// Type TypeScript dérivé du schéma
export type CreateOrUpdateProjectInput = z.infer<typeof createOrUpdateProjectSchema>;

/**
 * Schéma pour la récupération d'un projet (GET)
 */
export const getProjectSchema = z.object({
    id: z
        .string({ message: 'L\'ID du projet est requis' })
        .uuid('Format UUID invalide pour l\'ID du projet'),
});

// Type TypeScript dérivé du schéma
export type GetProjectInput = z.infer<typeof getProjectSchema>;
