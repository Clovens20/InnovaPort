'use client';

/**
 * Language Switcher Component
 * 
 * Bouton pour changer la langue (FR / EN)
 * Placement discret, changement immédiat sans refresh
 */

import { useLanguage } from '@/lib/i18n/LanguageProvider';
import { Globe } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LanguageSwitcher() {
    const { language, toggleLanguage } = useLanguage();
    const [mounted, setMounted] = useState(false);

    // Éviter le flash de contenu non stylé
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            aria-label={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}
            title={`Switch to ${language === 'fr' ? 'English' : 'Français'}`}
        >
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">{language === 'fr' ? 'FR' : 'EN'}</span>
            <span className="sm:hidden">{language === 'fr' ? 'FR' : 'EN'}</span>
        </button>
    );
}

