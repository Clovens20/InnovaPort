'use client';

/**
 * Language Provider
 * 
 * Context provider pour gérer la langue de l'application
 * Stocke la langue dans localStorage et détecte la langue du navigateur
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Language } from './translations';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'innovaport-language';
const DEFAULT_LANGUAGE: Language = 'fr';

/**
 * Détecte la langue du navigateur
 */
function detectBrowserLanguage(): Language {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    
    const browserLang = navigator.language || (navigator as any).userLanguage;
    
    // Support pour 'en', 'en-US', 'en-GB', etc.
    if (browserLang.startsWith('en')) {
        return 'en';
    }
    
    // Support pour 'fr', 'fr-FR', 'fr-CA', etc.
    if (browserLang.startsWith('fr')) {
        return 'fr';
    }
    
    return DEFAULT_LANGUAGE;
}

/**
 * Récupère la langue depuis localStorage ou détecte depuis le navigateur
 */
function getInitialLanguage(): Language {
    if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'fr' || stored === 'en') {
            return stored as Language;
        }
    } catch (error) {
        // localStorage peut être indisponible (SSR, mode privé, etc.)
        console.warn('Could not access localStorage:', error);
    }
    
    return detectBrowserLanguage();
}

interface LanguageProviderProps {
    children: React.ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
    const [mounted, setMounted] = useState(false);

    // Initialiser la langue au montage (client-side uniquement)
    useEffect(() => {
        const initialLang = getInitialLanguage();
        setLanguageState(initialLang);
        setMounted(true);
        
        // Mettre à jour l'attribut lang du HTML
        if (typeof document !== 'undefined') {
            document.documentElement.lang = initialLang;
        }
    }, []);

    // Sauvegarder la langue dans localStorage et mettre à jour l'attribut lang
    const setLanguage = useCallback((lang: Language) => {
        setLanguageState(lang);
        
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            console.warn('Could not save language to localStorage:', error);
        }
        
        // Mettre à jour l'attribut lang du HTML
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
    }, []);

    // Basculer entre FR et EN
    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'fr' ? 'en' : 'fr');
    }, [language, setLanguage]);

    // Ne pas rendre les enfants jusqu'à ce que la langue soit initialisée (évite le flash)
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook pour utiliser le contexte de langue
 * Retourne une valeur par défaut si utilisé en dehors du provider (pour SSR)
 */
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        // En SSR ou si le provider n'est pas disponible, retourner une valeur par défaut
        // Cela évite les erreurs lors du prerendering
        if (typeof window === 'undefined') {
            return {
                language: 'fr' as Language,
                setLanguage: () => {},
                toggleLanguage: () => {},
            };
        }
        // En client-side mais sans provider, essayer de récupérer depuis localStorage
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            const lang = (stored === 'fr' || stored === 'en') ? stored as Language : DEFAULT_LANGUAGE;
            return {
                language: lang,
                setLanguage: () => {},
                toggleLanguage: () => {},
            };
        } catch {
            return {
                language: DEFAULT_LANGUAGE,
                setLanguage: () => {},
                toggleLanguage: () => {},
            };
        }
    }
    return context;
}

