'use client';

/**
 * Composant de tracking global pour toutes les pages du site
 * 
 * Fonction: Enregistre automatiquement les visites de pages dans analytics
 * Dépendances: next/navigation, useEffect, usePathname
 * Raison: Tracking automatique de tous les visiteurs sur www.innovaport.dev
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Pages à exclure du tracking (pages admin, dashboard, etc.)
const EXCLUDED_PATHS = [
    '/admin',
    '/dashboard',
    '/auth',
    '/api',
    '/_next',
];

// Vérifier si un path doit être exclu du tracking
function shouldExcludePath(path: string): boolean {
    return EXCLUDED_PATHS.some(excluded => path.startsWith(excluded));
}

// Fonction pour envoyer l'événement analytics
async function trackPageView(path: string, referrer: string | null) {
    // Toujours tracker en production, logger en développement
    const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
    
    try {
        // Ne pas tracker les pages exclues
        if (shouldExcludePath(path)) {
            if (isDev) {
                console.log('⏭️ Page excluded from tracking:', path);
            }
            return;
        }

        // Préparer les données à envoyer
        const payload = {
            eventType: 'page_view',
            path: path,
            referrer: referrer,
            metadata: {
                timestamp: new Date().toISOString(),
                hostname: typeof window !== 'undefined' ? window.location.hostname : null,
            },
        };

        if (isDev) {
            console.log('📊 Tracking page view:', payload);
        }

        const response = await fetch('/api/analytics', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            // Logger les erreurs pour déboguer
            console.error('❌ Failed to track page view:', response.status, errorText);
            // En production, on peut aussi logger dans un service externe
        } else {
            const result = await response.json();
            if (isDev) {
                console.log('✅ Page view tracked successfully:', path, result);
            }
        }
    } catch (error) {
        // Logger les erreurs pour déboguer
        console.error('❌ Error tracking page view:', error);
    }
}

export function PageTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const previousPathRef = useRef<string | null>(null);
    const referrerRef = useRef<string | null>(null);

    useEffect(() => {
        // Construire le path complet avec les query params
        const fullPath = searchParams.toString() 
            ? `${pathname}?${searchParams.toString()}` 
            : pathname;

        // Ne pas tracker si c'est la même page (évite les doubles enregistrements)
        if (previousPathRef.current === fullPath) {
            return;
        }

        // Déterminer le referrer
        // Pour la première visite, utiliser document.referrer
        // Pour les navigations suivantes, utiliser la page précédente
        const referrer = referrerRef.current || 
            (typeof window !== 'undefined' ? document.referrer || null : null);

        // Enregistrer le tracking
        trackPageView(fullPath, referrer);

        // Mettre à jour les refs pour la prochaine navigation
        previousPathRef.current = fullPath;
        referrerRef.current = fullPath;
    }, [pathname, searchParams]);

    // Ce composant ne rend rien
    return null;
}

