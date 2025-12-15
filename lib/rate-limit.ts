/**
 * Rate Limiting Utility
 * 
 * Protection contre les abus avec rate limiting distribué via Upstash Redis
 * Fallback vers un système en mémoire si Redis n'est pas configuré
 */

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Fallback: Store en mémoire si Redis n'est pas configuré
interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Initialiser Redis si les variables d'environnement sont présentes
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });

        ratelimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requêtes par minute par défaut
            analytics: true,
        });
    } catch (error) {
        console.warn('Failed to initialize Upstash Redis, falling back to in-memory rate limiting:', error);
    }
}

/**
 * Nettoie les entrées expirées du store toutes les 5 minutes (fallback uniquement)
 */
if (!ratelimit) {
    setInterval(() => {
        const now = Date.now();
        Object.keys(store).forEach((key) => {
            if (store[key].resetTime < now) {
                delete store[key];
            }
        });
    }, 5 * 60 * 1000); // 5 minutes
}

/**
 * Vérifie si une requête dépasse la limite de taux
 * 
 * @param identifier - Identifiant unique (IP, user ID, etc.)
 * @param maxRequests - Nombre maximum de requêtes
 * @param windowMs - Fenêtre de temps en millisecondes
 * @returns true si la limite est dépassée, false sinon
 */
export async function checkRateLimit(
    identifier: string,
    maxRequests: number = 10,
    windowMs: number = 60000 // 1 minute par défaut
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    // Utiliser Upstash Redis si disponible
    if (ratelimit) {
        try {
            const limit = Math.floor(windowMs / 1000); // Convertir en secondes
            const result = await ratelimit.limit(identifier);
            
            return {
                allowed: result.success,
                remaining: result.remaining,
                resetTime: result.reset,
            };
        } catch (error) {
            console.error('Rate limit error with Redis, falling back to in-memory:', error);
            // Fallback vers le système en mémoire en cas d'erreur
        }
    }

    // Fallback: Système en mémoire
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

