'use client';

/**
 * useTranslation Hook
 * 
 * Hook léger pour traduire les clés
 * Retourne la clé si la traduction n'existe pas (pas de crash)
 * Gère le SSR en retournant la langue par défaut si le provider n'est pas disponible
 */

import { useLanguage } from './LanguageProvider';
import { getTranslation, Language } from './translations';

export function useTranslation() {
    // useLanguage gère maintenant le fallback pour SSR
    const { language } = useLanguage();

    /**
     * Traduit une clé
     * @param key - Clé de traduction (ex: "nav.login" ou "hero.title")
     * @param options - Options pour les placeholders ou fallback (optionnel)
     * @returns Texte traduit ou clé/fallback si non trouvé
     */
    const t = (key: string, options?: { [key: string]: any } | string): string => {
        try {
            let translation = getTranslation(language, key);
            
            // Si options est une string, c'est un fallback legacy
            if (typeof options === 'string') {
                if (translation === key) {
                    return options;
                }
                return translation;
            }
            
            // Si la traduction retourne la clé elle-même, c'est qu'elle n'a pas été trouvée
            if (translation === key) {
                return key;
            }
            
            // Replace placeholders if any (support both {{key}} and {key} formats)
            if (options && typeof options === 'object') {
                for (const optKey in options) {
                    translation = translation.replace(`{{${optKey}}}`, String(options[optKey]));
                    translation = translation.replace(`{${optKey}}`, String(options[optKey]));
                }
            }
            
            return translation;
        } catch (error) {
            // En cas d'erreur, retourner la clé
            console.warn(`Translation error for key "${key}":`, error);
            return key;
        }
    };

    return {
        t,
        language,
    };
}

