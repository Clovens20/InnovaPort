/**
 * Rate Limiting Utility
 * 
 * Protection légère contre les abus sans bloquer les vrais utilisateurs
 * Utilise un système de compteur en mémoire (simple et efficace pour MVP)
 * 
 * Pour la production à grande échelle, considérer Redis ou un service dédié
 */

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

// Store en mémoire (sera réinitialisé au redémarrage du serveur)
// En production, utiliser Redis pour la persistance entre instances
const store: RateLimitStore = {};

/**
 * Nettoie les entrées expirées du store toutes les 5 minutes
 */
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach((key) => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 5 * 60 * 1000); // 5 minutes

/**
 * Vérifie si une requête dépasse la limite de taux
 * 
 * @param identifier - Identifiant unique (IP, user ID, etc.)
 * @param maxRequests - Nombre maximum de requêtes
 * @param windowMs - Fenêtre de temps en millisecondes
 * @returns true si la limite est dépassée, false sinon
 */
export function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute par défaut
): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = store[identifier];

    // Si aucune entrée ou si la fenêtre est expirée, créer/réinitialiser
    if (!entry || entry.resetTime < now) {
        store[identifier] = {
            count: 1,
            resetTime: now + windowMs,
        };
        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetTime: now + windowMs,
        };
    }

    // Si la limite est atteinte, refuser
    if (entry.count >= maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetTime: entry.resetTime,
        };
    }

    // Incrémenter le compteur
    entry.count++;
    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetTime: entry.resetTime,
    };
}

/**
 * Récupère l'identifiant de rate limiting depuis la requête
 * Priorité: IP address > User ID (si authentifié)
 */
export function getRateLimitIdentifier(request: Request): string {
    // Essayer de récupérer l'IP depuis les headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor?.split(',')[0].trim() || realIp || 'unknown';

    // En production, on pourrait aussi utiliser l'user ID si authentifié
    // Pour l'instant, on utilise uniquement l'IP pour simplifier
    return `ip:${ip}`;
}

