/**
 * Utilitaire de logging pour le projet
 * 
 * Fonction: Centralise la gestion des logs et erreurs
 * Dépendances: Aucune
 * Raison: Remplacer console.error par une gestion d'erreur professionnelle
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogContext {
    file?: string;
    function?: string;
    userId?: string;
    [key: string]: unknown;
}

/**
 * Log une erreur de manière structurée
 */
export function logError(
    message: string,
    error?: Error | unknown,
    context?: LogContext
): void {
    const errorDetails = {
        message,
        error: error instanceof Error ? {
            name: error.name,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        } : error,
        context,
        timestamp: new Date().toISOString(),
    };

    // En production, vous pourriez envoyer ces logs à un service comme Sentry
    if (process.env.NODE_ENV === 'production') {
        // TODO: Intégrer un service de logging (Sentry, LogRocket, etc.)
        console.error('[ERROR]', JSON.stringify(errorDetails, null, 2));
    } else {
        console.error('[ERROR]', errorDetails);
    }
}

/**
 * Log un avertissement
 */
export function logWarn(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
        console.warn('[WARN]', { message, context, timestamp: new Date().toISOString() });
    }
}

/**
 * Log une information
 */
export function logInfo(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV === 'development') {
        console.log('[INFO]', { message, context, timestamp: new Date().toISOString() });
    }
}

