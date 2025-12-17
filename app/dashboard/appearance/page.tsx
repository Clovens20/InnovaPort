"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Editor from "@monaco-editor/react";
import { Monitor, Smartphone, Check, X, Lock } from "lucide-react";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Fonction pour convertir les noms de polices en noms Google Fonts
const getGoogleFontName = (fontName: string): string => {
    const fontMap: Record<string, string> = {
        'inter': 'Inter',
        'poppins': 'Poppins',
        'playfair': 'Playfair+Display',
        'roboto': 'Roboto',
        'montserrat': 'Montserrat',
        'raleway': 'Raleway',
        'oswald': 'Oswald',
        'lora': 'Lora',
        'merriweather': 'Merriweather',
        'nunito': 'Nunito',
        'ubuntu': 'Ubuntu',
        'source-sans-pro': 'Source+Sans+Pro',
        'work-sans': 'Work+Sans',
        'crimson-text': 'Crimson+Text',
        'libre-baskerville': 'Libre+Baskerville',
        'dancing-script': 'Dancing+Script',
        'caveat': 'Caveat',
        'bebas-neue': 'Bebas+Neue',
        'anton': 'Anton',
        'lato': 'Lato',
        'opensans': 'Open+Sans',
        'pt-sans': 'PT+Sans',
        'noto-sans': 'Noto+Sans',
        'rubik': 'Rubik',
        'quicksand': 'Quicksand',
    };
    return fontMap[fontName.toLowerCase()] || 'Inter';
};

// Fonction pour obtenir le nom CSS de la police
const getFontFamilyForPreview = (fontName: string): string => {
    const fontFamilyMap: Record<string, string> = {
        'inter': 'Inter, sans-serif',
        'poppins': 'Poppins, sans-serif',
        'playfair': '"Playfair Display", serif',
        'roboto': 'Roboto, sans-serif',
        'montserrat': 'Montserrat, sans-serif',
        'raleway': 'Raleway, sans-serif',
        'oswald': 'Oswald, sans-serif',
        'lora': 'Lora, serif',
        'merriweather': 'Merriweather, serif',
        'nunito': 'Nunito, sans-serif',
        'ubuntu': 'Ubuntu, sans-serif',
        'source-sans-pro': '"Source Sans Pro", sans-serif',
        'work-sans': '"Work Sans", sans-serif',
        'crimson-text': '"Crimson Text", serif',
        'libre-baskerville': '"Libre Baskerville", serif',
        'dancing-script': '"Dancing Script", cursive',
        'caveat': 'Caveat, cursive',
        'bebas-neue': '"Bebas Neue", sans-serif',
        'anton': 'Anton, sans-serif',
        'lato': 'Lato, sans-serif',
        'opensans': '"Open Sans", sans-serif',
        'pt-sans': '"PT Sans", sans-serif',
        'noto-sans': '"Noto Sans", sans-serif',
        'rubik': 'Rubik, sans-serif',
        'quicksand': 'Quicksand, sans-serif',
    };
    return fontFamilyMap[fontName.toLowerCase()] || 'Inter, sans-serif';
};

const templates = [
    {
        id: "modern",
        name: "Modern",
        description: "Layout dynamique avec glassmorphism et animations fluides",
        preview: "/templates/modern-preview.png",
        tags: ["Glassmorphism", "Animé", "Clean"],
        popular: true
    },
    {
        id: "minimal",
        name: "Minimal",
        description: "Layout épuré, beaucoup d'espaces blancs, focus sur le contenu",
        preview: "/templates/minimal-preview.png",
        tags: ["Minimaliste", "Sob", "Typographie"],
        popular: false
    },
    {
        id: "bold",
        name: "Bold",
        description: "Couleurs vives, contrastes forts et typographie impactante",
        preview: "/templates/bold-preview.png",
        tags: ["Fort", "Créatif", "High-contrast"],
        popular: false
    },
    {
        id: "corporate",
        name: "Corporate",
        description: "Design professionnel et structuré, idéal pour les freelances B2B",
        preview: "/templates/corporate-preview.png",
        tags: ["Pro", "Sérieux", "Business"],
        popular: false
    },
    {
        id: "creative",
        name: "Creative",
        description: "Layout asymétrique et créatif pour se démarquer",
        preview: "/templates/creative-preview.png",
        tags: ["Artiste", "Designer", "Unique"],
        popular: false
    }
];

const presetPalettes = [
    { name: 'Professionnel', primary: '#1E3A8A', secondary: '#10B981' },
    { name: 'Créatif', primary: '#8B5CF6', secondary: '#EC4899' },
    { name: 'Corporate', primary: '#1F2937', secondary: '#3B82F6' },
    { name: 'Minimaliste', primary: '#000000', secondary: '#6B7280' },
    { name: 'Chaleureux', primary: '#DC2626', secondary: '#F59E0B' },
    { name: 'Tech', primary: '#0EA5E9', secondary: '#06B6D4' }
];

export default function AppearancePage() {
    const { t } = useTranslation();
    const [currentTemplateId, setCurrentTemplateId] = useState("modern");
    const [showTemplateModal, setShowTemplateModal] = useState(false);

    const [primaryColor, setPrimaryColor] = useState("#1E3A8A");
    const [secondaryColor, setSecondaryColor] = useState("#10B981");

    const [headingFont, setHeadingFont] = useState("inter");
    const [bodyFont, setBodyFont] = useState("inter");

    const [customCss, setCustomCss] = useState("/* Ajoutez votre CSS personnalisé ici */\n.hero-section {\n  \n}");
    const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

    const [plan, setPlan] = useState<"free" | "pro">("free"); // Mock plan state

    const currentTemplate = templates.find(t => t.id === currentTemplateId) || templates[0];

    const applyPalette = (palette: { primary: string; secondary: string }) => {
        setPrimaryColor(palette.primary);
        setSecondaryColor(palette.secondary);
    };

    // Charger les polices Google Fonts pour l'aperçu
    useEffect(() => {
        const headingFontName = getGoogleFontName(headingFont);
        const bodyFontName = getGoogleFontName(bodyFont);
        
        const fontsToLoad = new Set([headingFontName, bodyFontName]);
        
        fontsToLoad.forEach(font => {
            const existingLink = document.querySelector(`link[href*="${font}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700&display=swap`;
                document.head.appendChild(link);
            }
        });
    }, [headingFont, bodyFont]);

    return (
        <div className="flex gap-6 h-[calc(100vh-100px)]">
            {/* Settings Column - Scrollable */}
            <div className="w-[450px] overflow-y-auto pr-2 pb-12 space-y-6">

                {/* Template Selection */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.appearance.currentTemplate')}</h2>
                    <div className="border-2 border-primary rounded-lg overflow-hidden bg-gray-100 h-48 mb-4 flex items-center justify-center text-gray-400">
                        {/* Replace with actual image in production */}
                        <span className="text-sm">{t('dashboard.appearance.preview', { name: currentTemplate.name })}</span>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-semibold text-gray-900">{currentTemplate.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{currentTemplate.description}</p>
                    </div>
                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {t('dashboard.appearance.changeTemplate')}
                    </button>
                </div>

                {/* Colors */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.appearance.colors')}</h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t('dashboard.appearance.primaryColor')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer p-1"
                            />
                            <input
                                type="text"
                                value={primaryColor}
                                onChange={(e) => setPrimaryColor(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm uppercase"
                            />
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t('dashboard.appearance.secondaryColor')}</label>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer p-1"
                            />
                            <input
                                type="text"
                                value={secondaryColor}
                                onChange={(e) => setSecondaryColor(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm uppercase"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t('dashboard.appearance.suggestedPalettes')}</label>
                        <div className="grid grid-cols-4 gap-3">
                            {presetPalettes.map((palette, i) => (
                                <button
                                    key={i}
                                    onClick={() => applyPalette(palette)}
                                    className="p-2 border-2 border-transparent hover:border-primary rounded-lg transition-all text-center group"
                                >
                                    <div className="flex justify-center gap-1 mb-1">
                                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: palette.primary }} />
                                        <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: palette.secondary }} />
                                    </div>
                                    <p className="text-[10px] text-gray-500 group-hover:text-primary truncate">{palette.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Typography */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.appearance.typography')}</h2>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t('dashboard.appearance.headingFont')}</label>
                        <select
                            value={headingFont}
                            onChange={(e) => setHeadingFont(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-900"
                            style={{ fontFamily: getFontFamilyForPreview(headingFont) }}
                        >
                            <option value="inter">Inter</option>
                            <option value="poppins">Poppins</option>
                            <option value="playfair">Playfair Display</option>
                            <option value="roboto">Roboto</option>
                            <option value="montserrat">Montserrat</option>
                            <option value="raleway">Raleway</option>
                            <option value="oswald">Oswald</option>
                            <option value="lora">Lora</option>
                            <option value="merriweather">Merriweather</option>
                            <option value="nunito">Nunito</option>
                            <option value="ubuntu">Ubuntu</option>
                            <option value="source-sans-pro">Source Sans Pro</option>
                            <option value="work-sans">Work Sans</option>
                            <option value="crimson-text">Crimson Text</option>
                            <option value="libre-baskerville">Libre Baskerville</option>
                            <option value="dancing-script">Dancing Script</option>
                            <option value="caveat">Caveat</option>
                            <option value="bebas-neue">Bebas Neue</option>
                            <option value="anton">Anton</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">{t('dashboard.appearance.bodyFont')}</label>
                        <select
                            value={bodyFont}
                            onChange={(e) => setBodyFont(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-primary text-gray-900"
                            style={{ fontFamily: getFontFamilyForPreview(bodyFont) }}
                        >
                            <option value="inter">Inter</option>
                            <option value="lato">Lato</option>
                            <option value="roboto">Roboto</option>
                            <option value="opensans">Open Sans</option>
                            <option value="montserrat">Montserrat</option>
                            <option value="raleway">Raleway</option>
                            <option value="nunito">Nunito</option>
                            <option value="ubuntu">Ubuntu</option>
                            <option value="source-sans-pro">Source Sans Pro</option>
                            <option value="work-sans">Work Sans</option>
                            <option value="poppins">Poppins</option>
                            <option value="merriweather">Merriweather</option>
                            <option value="lora">Lora</option>
                            <option value="crimson-text">Crimson Text</option>
                            <option value="libre-baskerville">Libre Baskerville</option>
                            <option value="pt-sans">PT Sans</option>
                            <option value="noto-sans">Noto Sans</option>
                            <option value="rubik">Rubik</option>
                            <option value="quicksand">Quicksand</option>
                        </select>
                    </div>
                </div>

                {/* Custom CSS (Pro) */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">{t('dashboard.appearance.customCSS')}</h2>
                        {plan === 'free' && (
                            <span className="px-2 py-0.5 bg-yellow-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wide">
                                {t('dashboard.appearance.proFeature')}
                            </span>
                        )}
                    </div>

                    {plan === 'free' ? (
                        <div className="p-8 bg-gray-50 rounded-lg text-center border-2 border-dashed border-gray-200">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Lock className="w-5 h-5 text-gray-500" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.appearance.proFeatureTitle')}</h3>
                            <p className="text-sm text-gray-600 mb-4">{t('dashboard.appearance.proFeatureDesc')}</p>
                            <button
                                onClick={() => setPlan('pro')}
                                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                {t('dashboard.appearance.upgradeToPro')}
                            </button>
                        </div>
                    ) : (
                        <div className="border border-gray-300 rounded-lg overflow-hidden h-64">
                            <Editor
                                height="100%"
                                defaultLanguage="css"
                                theme="vs-dark"
                                value={customCss}
                                onChange={(val) => setCustomCss(val || "")}
                                options={{ minimap: { enabled: false }, fontSize: 13 }}
                            />
                        </div>
                    )}
                </div>

            </div>

            {/* Preview Column */}
            <div className="flex-1 min-w-0 flex flex-col h-full sticky top-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h3 className="font-semibold text-gray-900">{t('dashboard.appearance.livePreview')}</h3>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setDevice("desktop")}
                                className={clsx("p-2 rounded transition-colors", device === "desktop" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Monitor className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setDevice("mobile")}
                                className={clsx("p-2 rounded transition-colors", device === "mobile" ? "bg-white shadow text-primary" : "text-gray-500 hover:text-gray-900")}
                            >
                                <Smartphone className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border border-gray-200 relative">
                        <div className={clsx(
                            "bg-white shadow-2xl transition-all duration-300 overflow-hidden iframe-container relative",
                            device === "mobile" ? "w-[375px] h-[667px] rounded-[30px] border-[10px] border-gray-900" : "w-full h-full"
                        )}>
                            {/* 
                   Ideally this would be an iframe pointing to /preview/[user] 
                   For now, we can Mock the iframe content or actually point to a route 
                */}
                            <iframe
                                src={`/preview/demo?template=${currentTemplateId}&primary=${encodeURIComponent(primaryColor)}&secondary=${encodeURIComponent(secondaryColor)}&headingFont=${encodeURIComponent(headingFont)}&bodyFont=${encodeURIComponent(bodyFont)}`}
                                className="w-full h-full border-0"
                                title="Preview"
                            />
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-3 flex-shrink-0">
                        <button className="px-5 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                            {t('dashboard.appearance.reset')}
                        </button>
                        <button className="px-6 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 font-medium transition-colors shadow-lg shadow-secondary/20">
                            {t('dashboard.appearance.saveChanges')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Template Selection Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-8">
                    <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.appearance.chooseTemplate')}</h2>
                            <button onClick={() => setShowTemplateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(template => (
                                <div
                                    key={template.id}
                                    onClick={() => setCurrentTemplateId(template.id)}
                                    className={clsx(
                                        "border-2 rounded-xl overflow-hidden cursor-pointer transition-all group relative",
                                        currentTemplateId === template.id
                                            ? "border-primary ring-2 ring-primary/20 ring-offset-2"
                                            : "border-gray-200 hover:border-gray-300"
                                    )}
                                >
                                    <div className="aspect-video bg-gray-100 relative">
                                        {/* Image Preview Placeholder */}
                                        <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-medium">
                                            Preview {template.name}
                                        </div>

                                        {template.popular && (
                                            <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full uppercase">
                                                {t('dashboard.appearance.popular')}
                                            </span>
                                        )}

                                        {currentTemplateId === template.id && (
                                            <div className="absolute inset-0 bg-primary/10 flex items-center justify-center">
                                                <div className="bg-primary text-white p-2 rounded-full shadow-lg">
                                                    <Check className="w-6 h-6" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="font-bold text-gray-900">{template.name}</h3>
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{template.description}</p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {template.tags.map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                {t('dashboard.appearance.cancel')}
                            </button>
                            <button
                                onClick={() => setShowTemplateModal(false)}
                                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium transition-colors shadow-lg shadow-primary/20"
                            >
                                {t('dashboard.appearance.selectTemplate')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
