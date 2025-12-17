/**
 * Page: /preview/demo
 * 
 * Fonction: Page de démo montrant un vrai portfolio pour attirer les développeurs
 */

'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Home, Loader2 } from 'lucide-react';
import { PortfolioClient } from '@/app/[username]/portfolio-client';
import { hexToRgba } from '@/utils/color-utils';

// Données de démo réalistes pour montrer le potentiel de la plateforme
const demoProfile = {
    id: 'demo-user-id',
    username: 'demo',
    full_name: 'Alexandre Martin',
    title: 'Développeur Full-Stack & Designer UX',
    bio: 'Passionné par la création d\'expériences web modernes et performantes. Spécialisé en React, Next.js et Node.js. J\'aide les entreprises à transformer leurs idées en produits numériques réussis.',
    avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexandre',
    primary_color: '#1E3A8A',
    secondary_color: '#10B981',
    template: 'modern',
    email: 'alexandre@example.com',
    available_for_work: true,
    hero_title: null,
    hero_subtitle: null,
    hero_description: null,
    tiktok_url: null,
    facebook_url: null,
    twitter_url: 'https://twitter.com/alexandre_dev',
    linkedin_url: 'https://linkedin.com/in/alexandre-martin',
    subscription_tier: 'pro' as const,
    stats_years_experience: 8,
    stats_projects_delivered: 45,
    stats_clients_satisfied: 38,
    stats_response_time: '24h',
    technologies_list: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'],
    services: [
        {
            name: 'Application Web',
            description: 'Développement d\'applications web modernes et performantes',
            price: 'À partir de 5000€',
            features: ['Design sur-mesure', 'Responsive', 'SEO optimisé', 'Performance'],
            icon: 'globe',
            targetCategories: []
        },
        {
            name: 'E-commerce',
            description: 'Solutions e-commerce complètes avec paiement sécurisé',
            price: 'À partir de 8000€',
            features: ['Catalogue produits', 'Paiement en ligne', 'Gestion commandes', 'Dashboard admin'],
            icon: 'shopping',
            targetCategories: []
        },
        {
            name: 'Application Mobile',
            description: 'Applications mobiles natives et cross-platform',
            price: 'À partir de 10000€',
            features: ['iOS & Android', 'Design natif', 'Notifications push', 'App Store ready'],
            icon: 'mobile',
            targetCategories: []
        }
    ],
    work_process: [
        {
            step: 1,
            title: 'Découverte',
            description: 'Analyse de vos besoins et définition des objectifs'
        },
        {
            step: 2,
            title: 'Conception',
            description: 'Création de maquettes et validation du design'
        },
        {
            step: 3,
            title: 'Développement',
            description: 'Implémentation avec code propre et tests'
        },
        {
            step: 4,
            title: 'Livraison',
            description: 'Déploiement et formation à l\'utilisation'
        }
    ],
    cta_title: 'Prêt à démarrer votre projet ?',
    cta_subtitle: 'Discutons de vos besoins et créons quelque chose d\'extraordinaire ensemble.',
    cta_button_text: 'Demander un devis gratuit',
    cta_footer_text: 'Réponse sous 24h • Devis gratuit • Sans engagement',
    about_journey: 'Avec plus de 8 ans d\'expérience dans le développement web, j\'ai accompagné des dizaines d\'entreprises dans leur transformation digitale. De la startup naissante aux grandes entreprises, chaque projet est une nouvelle aventure.',
    about_approach: 'Je crois en une approche collaborative où votre vision rencontre mon expertise technique. Ensemble, nous créons des solutions qui non seulement fonctionnent parfaitement mais qui dépassent aussi les attentes.',
    about_why_choose: 'Choisir de travailler avec moi, c\'est opter pour la qualité, la transparence et un suivi personnalisé. Chaque ligne de code est écrite avec soin, chaque design est pensé pour l\'utilisateur final.'
};

const demoProjects = [
    {
        id: 'demo-project-1',
        title: 'Plateforme E-commerce Moderne',
        slug: 'plateforme-ecommerce-moderne',
        category: 'E-commerce',
        short_description: 'Solution e-commerce complète avec gestion de stock et paiement sécurisé',
        full_description: 'Développement d\'une plateforme e-commerce moderne pour une marque de mode. Intégration de Stripe pour les paiements, système de gestion de stock en temps réel, et dashboard administrateur complet.',
        technologies: ['Next.js', 'TypeScript', 'Stripe', 'PostgreSQL', 'Tailwind CSS'],
        client_type: 'business',
        client_name: 'Mode & Style',
        duration_value: 3,
        duration_unit: 'months',
        project_url: 'https://example.com',
        tags: 'E-commerce, Stripe, Dashboard',
        image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop',
        featured: true,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'demo-project-2',
        title: 'Application de Gestion de Projets',
        slug: 'application-gestion-projets',
        category: 'SaaS',
        short_description: 'Outil collaboratif pour gérer vos projets et équipes efficacement',
        full_description: 'Création d\'une application SaaS complète permettant aux équipes de gérer leurs projets, tâches et collaborateurs. Fonctionnalités de temps réel, notifications, et rapports avancés.',
        technologies: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Material-UI'],
        client_type: 'business',
        client_name: 'TechCorp',
        duration_value: 4,
        duration_unit: 'months',
        project_url: 'https://example.com',
        tags: 'SaaS, Temps réel, Collaboration',
        image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
        featured: true,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'demo-project-3',
        title: 'Site Vitrine Premium',
        slug: 'site-vitrine-premium',
        category: 'Website',
        short_description: 'Site web élégant et performant pour une agence créative',
        full_description: 'Conception et développement d\'un site vitrine premium pour une agence créative. Design moderne, animations fluides, et optimisation SEO pour maximiser la visibilité.',
        technologies: ['Next.js', 'Framer Motion', 'GSAP', 'Tailwind CSS'],
        client_type: 'business',
        client_name: 'Creative Studio',
        duration_value: 2,
        duration_unit: 'months',
        project_url: 'https://example.com',
        tags: 'Vitrine, Design, SEO',
        image_url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop',
        featured: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 'demo-project-4',
        title: 'Application Mobile Fitness',
        slug: 'application-mobile-fitness',
        category: 'Mobile',
        short_description: 'App mobile pour suivre vos entraînements et votre progression',
        full_description: 'Développement d\'une application mobile cross-platform pour le fitness. Suivi des entraînements, statistiques détaillées, et intégration avec les wearables.',
        technologies: ['React Native', 'Firebase', 'Redux', 'Expo'],
        client_type: 'startup',
        client_name: 'FitLife',
        duration_value: 5,
        duration_unit: 'months',
        project_url: 'https://example.com',
        tags: 'Mobile, Fitness, Cross-platform',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        featured: false,
        published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

const demoTestimonials: any[] = [];

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
const getFontFamily = (fontName: string): string => {
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

function DemoPageContent() {
    const searchParams = useSearchParams();
    
    // Récupérer les paramètres de l'URL
    const headingFont = searchParams.get('headingFont') || 'inter';
    const bodyFont = searchParams.get('bodyFont') || 'inter';
    const primaryColor = searchParams.get('primary') || demoProfile.primary_color || '#1E3A8A';
    const secondaryColor = searchParams.get('secondary') || demoProfile.secondary_color || '#10B981';
    const template = searchParams.get('template') || demoProfile.template || 'modern';

    // Charger les polices Google Fonts dynamiquement
    useEffect(() => {
        const headingFontName = getGoogleFontName(headingFont);
        const bodyFontName = getGoogleFontName(bodyFont);
        
        // Créer les liens pour charger les polices
        const fontsToLoad = new Set([headingFontName, bodyFontName]);
        const fontLinks: HTMLLinkElement[] = [];

        fontsToLoad.forEach(font => {
            // Vérifier si la police n'est pas déjà chargée
            const existingLink = document.querySelector(`link[href*="${font}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = `https://fonts.googleapis.com/css2?family=${font}:wght@400;500;600;700&display=swap`;
                document.head.appendChild(link);
                fontLinks.push(link);
            }
        });

        // Nettoyer les liens lors du démontage
        return () => {
            fontLinks.forEach(link => {
                if (link.parentNode) {
                    link.parentNode.removeChild(link);
                }
            });
        };
    }, [headingFont, bodyFont]);

    // Styles dynamiques avec les polices
    const style = {
        '--primary': primaryColor,
        '--secondary': secondaryColor,
        '--primary-light': hexToRgba(primaryColor, 0.1),
        '--heading-font': getFontFamily(headingFont),
        '--body-font': getFontFamily(bodyFont),
    } as React.CSSProperties;

    // Mettre à jour le profil avec les couleurs de l'URL
    const updatedProfile = {
        ...demoProfile,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        template: template,
    };

    return (
        <div className="relative" style={style}>
            {/* Bouton de retour en haut */}
            <div className="fixed top-4 left-4 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg hover:bg-white transition-all text-gray-700 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Retour à l'accueil</span>
                    <Home className="w-4 h-4 sm:hidden" />
                </Link>
            </div>

            {/* Bannière de démo en haut */}
            <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 text-center text-sm font-medium shadow-lg">
                <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
                    <span>✨</span>
                    <span>Ceci est une démo du portfolio InnovaPort</span>
                    <span>✨</span>
                    <Link 
                        href="/auth/register" 
                        className="ml-4 underline hover:no-underline font-semibold"
                    >
                        Créer votre portfolio gratuitement →
                    </Link>
                </div>
            </div>

            {/* Portfolio avec un décalage pour la bannière */}
            <div className="pt-12">
                <style dangerouslySetInnerHTML={{
                    __html: `
                        :root {
                            --heading-font: ${getFontFamily(headingFont)};
                            --body-font: ${getFontFamily(bodyFont)};
                        }
                        h1, h2, h3, h4, h5, h6, .font-heading {
                            font-family: var(--heading-font) !important;
                        }
                        body, p, span, div, a, button, input, textarea, select, .font-body {
                            font-family: var(--body-font) !important;
                        }
                    `
                }} />
                <PortfolioClient
                    profile={updatedProfile as any}
                    projects={demoProjects as any}
                    testimonials={demoTestimonials}
                    template={template}
                    style={style}
                    analyticsData={{
                        userId: 'demo',
                        eventType: 'demo_view',
                        path: '/preview/demo'
                    }}
                />
            </div>
        </div>
    );
}

export default function DemoPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement de la démo...</p>
                </div>
            </div>
        }>
            <DemoPageContent />
        </Suspense>
    );
}

