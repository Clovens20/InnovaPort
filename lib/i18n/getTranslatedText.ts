/**
 * Helper function to get translated text from user-created content
 * 
 * Logic:
 * - If language is 'en' and _en field exists and is not empty, use it
 * - Otherwise, use the default field (which is French)
 * 
 * @param language - Current language ('fr' | 'en')
 * @param defaultText - Default text (French, from DB column without _en suffix)
 * @param translatedText - Translated text (English, from DB column with _en suffix)
 * @returns The appropriate text based on language
 */
export function getTranslatedText(
    language: 'fr' | 'en',
    defaultText: string | null | undefined,
    translatedText: string | null | undefined
): string {
    // If language is English and translated text exists and is not empty
    if (language === 'en' && translatedText && translatedText.trim() !== '') {
        return translatedText;
    }
    
    // Otherwise, use default text (French) or empty string
    return defaultText || '';
}

/**
 * Helper function to get translated text with fallback
 * 
 * @param language - Current language ('fr' | 'en')
 * @param defaultText - Default text (French)
 * @param translatedText - Translated text (English)
 * @param fallback - Fallback text if both are empty
 * @returns The appropriate text based on language
 */
export function getTranslatedTextWithFallback(
    language: 'fr' | 'en',
    defaultText: string | null | undefined,
    translatedText: string | null | undefined,
    fallback: string
): string {
    const text = getTranslatedText(language, defaultText, translatedText);
    return text || fallback;
}

