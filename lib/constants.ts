/**
 * Constantes de l'application
 * 
 * Fonction: Centralise toutes les constantes et valeurs de configuration
 * Dépendances: Aucune
 * Raison: Évite les valeurs hardcodées et facilite la maintenance
 */

// ============================================
// TIMING & INTERVALS
// ============================================

/**
 * Intervalle de rafraîchissement du username (en millisecondes)
 */
export const USERNAME_REFRESH_INTERVAL = 5000; // 5 secondes

/**
 * Durée d'affichage du feedback de copie (en millisecondes)
 */
export const COPY_FEEDBACK_DURATION = 2000; // 2 secondes

// ============================================
// URLS EXTERNES
// ============================================

/**
 * URL de l'API Dicebear pour générer les avatars par défaut
 */
export const DICEBEAR_AVATAR_API = 'https://api.dicebear.com/7.x/avataaars/svg';

/**
 * Génère l'URL d'un avatar Dicebear avec un seed
 */
export function getDicebearAvatarUrl(seed: string): string {
    return `${DICEBEAR_AVATAR_API}?seed=${encodeURIComponent(seed)}`;
}

// ============================================
// CONFIGURATION EMAIL
// ============================================

/**
 * Email expéditeur par défaut (peut être surchargé par variable d'environnement)
 */
export const DEFAULT_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'InnovaPort <noreply@innovaport.dev>';

/**
 * Nom de l'application pour les emails
 */
export const APP_NAME = 'InnovaPort';

// ============================================
// CONFIGURATION APP
// ============================================

/**
 * URL de base de l'application
 * Production: https://www.innovaport.dev
 * Développement: http://localhost:3000
 */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/**
 * URL complète du logo InnovaPort pour les emails
 */
export const LOGO_URL = `${APP_URL}/innovaport-logo.png`;

/**
 * Domaine de l'application (extrait de APP_URL)
 */
export function getAppDomain(): string {
    try {
        const url = new URL(APP_URL);
        return url.hostname;
    } catch {
        // Fallback si l'URL n'est pas valide
        // Production par défaut
        return process.env.NODE_ENV === 'production' ? 'www.innovaport.dev' : 'localhost';
    }
}

/**
 * URL complète du dashboard
 */
export function getDashboardUrl(path: string = ''): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${APP_URL}/dashboard${cleanPath}`;
}

// ============================================
// LIMITES & VALIDATION
// ============================================

/**
 * Limites pour les formulaires
 */
export const FORM_LIMITS = {
    MAX_USERNAME_LENGTH: 50,
    MAX_NAME_LENGTH: 100,
    MAX_EMAIL_LENGTH: 255,
    MAX_PHONE_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_PROJECT_TITLE_LENGTH: 200,
    MAX_PROJECT_SLUG_LENGTH: 100,
} as const;

// ============================================
// COULEURS (pour les emails)
// ============================================

/**
 * Couleurs de la marque pour les emails
 */
export const BRAND_COLORS = {
    primary: '#1E3A8A',
    secondary: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        500: '#6B7280',
        900: '#111827',
    },
} as const;

