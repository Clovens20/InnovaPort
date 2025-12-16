/**
 * Component: PortfolioClient
 * 
 * Fonction: Composant client pour le portfolio avec toutes les sections optimisées pour la conversion
 * Dépendances: react, next/navigation, framer-motion
 * Raison: Permet le tracking analytics côté client et les interactions utilisateur
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Twitter, Linkedin, Mail, Music2, Facebook, Check, Star, Globe, Code, ShoppingCart, MessageCircle, ChevronRight } from 'lucide-react';
import { getDicebearAvatarUrl } from '@/lib/constants';
import { motion } from 'framer-motion';
import { Testimonial, Service, WorkProcessStep } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LanguageSwitcher } from '@/app/_components/language-switcher';
import { getTranslatedTextWithFallback } from '@/lib/i18n/getTranslatedText';

interface Profile {
    id: string;
    username: string;
    full_name: string | null;
    bio: string | null;
    bio_en: string | null;
    title: string | null;
    title_en: string | null;
    avatar_url: string | null;
    primary_color: string;
    secondary_color: string;
    tiktok_url: string | null;
    facebook_url: string | null;
    twitter_url: string | null;
    linkedin_url: string | null;
    email: string | null;
    available_for_work: boolean;
    hero_title: string | null;
    hero_title_en: string | null;
    hero_subtitle: string | null;
    hero_subtitle_en: string | null;
    hero_description: string | null;
    hero_description_en: string | null;
    stats_years_experience: number | null;
    stats_projects_delivered: number | null;
    stats_clients_satisfied: number | null;
    stats_response_time: string | null;
    services: Service[] | null;
    work_process: WorkProcessStep[] | null;
    technologies_list: string[] | null;
    cta_title: string | null;
    cta_title_en: string | null;
    cta_subtitle: string | null;
    cta_subtitle_en: string | null;
    cta_button_text: string | null;
    cta_button_text_en: string | null;
    cta_footer_text: string | null;
    cta_footer_text_en: string | null;
    about_journey: string | null;
    about_journey_en: string | null;
    about_approach: string | null;
    about_approach_en: string | null;
    about_why_choose: string | null;
    about_why_choose_en: string | null;
    subscription_tier: 'free' | 'pro' | 'premium';
}

interface Project {
    id: string;
    title: string;
    title_en: string | null;
    slug: string;
    category: string | null;
    short_description: string | null;
    short_description_en: string | null;
    full_description: string | null;
    full_description_en: string | null;
    technologies: string[];
    project_url: string | null;
    image_url: string | null;
    tags: string | null;
}

export function PortfolioClient({
    profile,
    projects,
    testimonials,
    template,
    style,
    analyticsData,
}: {
    profile: Profile;
    projects: Project[];
    testimonials: Testimonial[];
    template: string;
    style: React.CSSProperties;
    analyticsData: {
        userId: string;
        eventType: string;
        path: string;
    };
}) {
    const { t, language } = useTranslation();
    const [showFloatingButton, setShowFloatingButton] = useState(false);

    // Track analytics au chargement
    useEffect(() => {
        const trackAnalytics = async () => {
            try {
                await fetch('/api/analytics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        ...analyticsData,
                        referrer: document.referrer || null,
                    }),
                });
            } catch (error) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error tracking analytics:', error);
                }
            }
        };

        trackAnalytics();

        // Afficher le bouton flottant après scroll
        const handleScroll = () => {
            setShowFloatingButton(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [analyticsData]);

    const handleQuoteClick = async () => {
        try {
            await fetch('/api/analytics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: profile.id,
                    eventType: 'quote_click',
                    path: window.location.pathname,
                    referrer: document.referrer || null,
                }),
            });
        } catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Error tracking quote click:', error);
            }
        }
    };

    const avatarUrl = profile.avatar_url || getDicebearAvatarUrl(profile.username);
    const displayName = profile.full_name || profile.username;
    const displayTitle = getTranslatedTextWithFallback(language, profile.title, profile.title_en, t('portfolio.defaults.title'));
    const displayBio = getTranslatedTextWithFallback(language, profile.bio, profile.bio_en, t('portfolio.defaults.bio'));

    // Valeurs par défaut pour les sections personnalisables (avec traduction)
    const heroTitle = getTranslatedTextWithFallback(language, profile.hero_title, profile.hero_title_en, t('portfolio.defaults.heroTitle'));
    const heroSubtitle = getTranslatedTextWithFallback(language, profile.hero_subtitle, profile.hero_subtitle_en, t('portfolio.defaults.heroSubtitle'));
    const heroDescription = getTranslatedTextWithFallback(language, profile.hero_description, profile.hero_description_en, t('portfolio.defaults.heroDescription'));
    const availableForWork = profile.available_for_work ?? true;

    const stats = {
        years: profile.stats_years_experience ?? 5,
        projects: profile.stats_projects_delivered ?? 15,
        clients: profile.stats_clients_satisfied ?? 10,
        responseTime: profile.stats_response_time || '48h',
    };

    // Services par défaut si non définis (traduits selon la langue)
    const getDefaultServices = (): Service[] => {
        if (language === 'en') {
            return [
                {
                    name: 'Website Showcase',
                    description: 'Responsive professional website, SEO optimized and ultra-fast',
                    price: '$1000',
                    features: [
                        'Custom and modern design',
                        'Mobile & tablet responsive',
                        'SEO optimized (Google)',
                        'Contact form',
                        '1 year hosting included'
                    ],
                    icon: 'globe',
                    targetCategories: [
                        { emoji: '🍽️', label: 'Restaurants' },
                        { emoji: '🔨', label: 'Craftsmen' },
                        { emoji: '💼', label: 'Professionals' },
                        { emoji: '🏢', label: 'SMEs' }
                    ],
                    exampleProject: 'Showcase website with menu, online reservations, photo gallery'
                },
                {
                    name: 'Web Application',
                    description: 'Complete application with backend and database',
                    price: '$2000',
                    features: [
                        'Modern stack (React/Node.js)',
                        'Secure database',
                        'User authentication',
                        'Complete REST API',
                        'Scalable architecture'
                    ],
                    icon: 'code',
                    targetCategories: [
                        { emoji: '📊', label: 'SaaS' },
                        { emoji: '🎓', label: 'Platforms' },
                        { emoji: '🏢', label: 'Internal management' },
                        { emoji: '🤝', label: 'B2B' }
                    ],
                    exampleProject: 'Student management platform with dashboard, grades, attendance'
                },
                {
                    name: 'E-commerce',
                    description: 'Complete online store with payment and management',
                    price: '$2000',
                    features: [
                        'Secure payment (Stripe)',
                        'Product catalog management',
                        'Admin dashboard',
                        'Order & inventory management',
                        'Automatic emails'
                    ],
                    icon: 'shopping',
                    targetCategories: [
                        { emoji: '👗', label: 'Fashion' },
                        { emoji: '🎨', label: 'Crafts' },
                        { emoji: '📦', label: 'Products' },
                        { emoji: '💍', label: 'Luxury' }
                    ],
                    exampleProject: 'Clothing store with 200+ products, cart, payment, delivery'
                },
            ];
        }
        // Français (par défaut)
        return [
            {
                name: 'Site Web Vitrine',
                description: 'Site professionnel responsive, optimisé SEO et ultra-rapide',
                price: '1000$',
                features: [
                    'Design sur-mesure et moderne',
                    'Responsive mobile & tablette',
                    'Optimisé SEO (Google)',
                    'Formulaire de contact',
                    'Hébergement 1 an inclus'
                ],
                icon: 'globe',
                targetCategories: [
                    { emoji: '🍽️', label: 'Restaurants' },
                    { emoji: '🔨', label: 'Artisans' },
                    { emoji: '💼', label: 'Professionnels' },
                    { emoji: '🏢', label: 'PME' }
                ],
                exampleProject: 'Site vitrine avec menu, réservations en ligne, galerie photos'
            },
            {
                name: 'Application Web',
                description: 'Application complète avec backend et base de données',
                price: '2000$',
                features: [
                    'Stack moderne (React/Node.js)',
                    'Base de données sécurisée',
                    'Authentification utilisateurs',
                    'API REST complète',
                    'Architecture scalable'
                ],
                icon: 'code',
                targetCategories: [
                    { emoji: '📊', label: 'SaaS' },
                    { emoji: '🎓', label: 'Plateformes' },
                    { emoji: '🏢', label: 'Gestion interne' },
                    { emoji: '🤝', label: 'B2B' }
                ],
                exampleProject: 'Plateforme de gestion d\'étudiants avec dashboard, notes, présences'
            },
            {
                name: 'E-commerce',
                description: 'Boutique en ligne complète avec paiement et gestion',
                price: '2000$',
                features: [
                    'Paiement sécurisé (Stripe)',
                    'Gestion catalogue produits',
                    'Dashboard administrateur',
                    'Gestion commandes & stock',
                    'Emails automatiques'
                ],
                icon: 'shopping',
                targetCategories: [
                    { emoji: '👗', label: 'Mode' },
                    { emoji: '🎨', label: 'Artisanat' },
                    { emoji: '📦', label: 'Produits' },
                    { emoji: '💍', label: 'Luxe' }
                ],
                exampleProject: 'Boutique de vêtements avec 200+ produits, panier, paiement, livraison'
            },
        ];
    };
    const defaultServices = getDefaultServices();
    const services: Service[] = profile.services && profile.services.length > 0 
        ? profile.services 
        : defaultServices;

    // Process de travail par défaut (traduit selon la langue)
    const getDefaultWorkProcess = (): WorkProcessStep[] => {
        if (language === 'en') {
            return [
                { num: 1, title: 'Discovery', description: 'Analysis of your needs and definition of the specifications' },
                { num: 2, title: 'Design', description: 'Mockups and interactive prototype to validate the experience' },
                { num: 3, title: 'Development', description: 'Clean, tested and documented code following best practices' },
                { num: 4, title: 'Delivery', description: 'Deployment, training and support to ensure your success' },
            ];
        }
        // Français (par défaut)
        return [
            { num: 1, title: 'Discovery', description: 'Analyse de vos besoins et définition du cahier des charges' },
            { num: 2, title: 'Design', description: 'Maquettes et prototype interactif pour valider l\'expérience' },
            { num: 3, title: 'Développement', description: 'Code propre, testé et documenté selon les meilleures pratiques' },
            { num: 4, title: 'Livraison', description: 'Déploiement, formation et support pour garantir votre succès' },
        ];
    };
    const defaultWorkProcess = getDefaultWorkProcess();
    const workProcess: WorkProcessStep[] = profile.work_process && profile.work_process.length > 0
        ? profile.work_process
        : defaultWorkProcess;

    // Technologies par défaut
    const defaultTechnologies = ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS'];
    const technologies = profile.technologies_list && profile.technologies_list.length > 0
        ? profile.technologies_list
        : defaultTechnologies;

    // CTA (avec traduction)
    const ctaTitle = getTranslatedTextWithFallback(language, profile.cta_title, profile.cta_title_en, t('portfolio.defaults.ctaTitle'));
    const ctaSubtitle = getTranslatedTextWithFallback(language, profile.cta_subtitle, profile.cta_subtitle_en, t('portfolio.defaults.ctaSubtitle'));
    const ctaButtonText = getTranslatedTextWithFallback(language, profile.cta_button_text, profile.cta_button_text_en, t('portfolio.defaults.ctaButtonText'));
    const ctaFooterText = getTranslatedTextWithFallback(language, profile.cta_footer_text, profile.cta_footer_text_en, t('portfolio.defaults.ctaFooterText'));

    // Template Minimal (simplifié)
    if (template === 'minimal') {
        return (
            <div className="min-h-screen bg-white text-gray-900 font-sans" style={style}>
                {/* Header avec Language Switcher */}
                <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-end">
                        <LanguageSwitcher />
                    </div>
                </header>

                {/* Hero Section */}
                <section className="min-h-screen flex items-center bg-gradient-to-br from-slate-50 to-blue-50 py-12 sm:py-16 md:py-20">
                    <div className="container mx-auto px-4 sm:px-6">
                        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
                            <div className="text-center md:text-left">
                                {availableForWork && (
                                    <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
                                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" aria-hidden="true"></span>
                                        {t('portfolio.availableForWork')}
                                    </div>
                                )}
                                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                                    {heroTitle}
                                </h1>
                                <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
                                    {heroDescription}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
                                    <Link
                                        href={`/${profile.username}/contact`}
                                        className="px-6 sm:px-8 py-3 sm:py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                                        onClick={handleQuoteClick}
                                        aria-label="Request a quote"
                                    >
                                        {ctaButtonText}
                                    </Link>
                                    <a
                                        href="#projects"
                                        className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:border-blue-600 hover:text-blue-600 transition-all text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                                        aria-label="View projects"
                                    >
                                        {t('portfolio.viewProjects')}
                                    </a>
                                </div>
                            </div>
                            <div className="mt-8 md:mt-0">
                                <div className="relative max-w-sm mx-auto">
                                    <div className="relative w-full aspect-square">
                                        <Image
                                            src={avatarUrl}
                                            alt={`${displayName} profile picture`}
                                            fill
                                            className="rounded-3xl object-cover shadow-2xl"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                                            priority
                                        />
                                    </div>
                                    <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                                        <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.projects}+</div>
                                        <div className="text-xs sm:text-sm text-gray-600">{t('portfolio.stats.projectsDelivered')}</div>
                                    </div>
                                    <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 bg-white p-3 sm:p-4 rounded-xl shadow-lg">
                                        <div className="text-2xl sm:text-3xl font-bold text-green-600">100%</div>
                                        <div className="text-xs sm:text-sm text-gray-600">{t('portfolio.stats.clientsSatisfied')}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Projects Section */}
                {projects.length > 0 && (
                    <section id="projects" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-white">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">{t('portfolio.projects.title')}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {projects.map((project) => {
                                    const projectTitle = getTranslatedTextWithFallback(language, project.title, project.title_en, project.title);
                                    const projectShortDesc = getTranslatedTextWithFallback(language, project.short_description, project.short_description_en, project.short_description || t('portfolio.projects.defaultDescription'));
                                    
                                    return (
                                    <div key={project.id} className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${project.project_url ? 'cursor-pointer' : ''}`}>
                                        {project.project_url ? (
                                            <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-xl">
                                                {project.image_url && (
                                                    <div className="aspect-video relative bg-gray-100">
                                                        <Image
                                                            src={project.image_url}
                                                            alt={`${projectTitle} project screenshot`}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4 sm:p-6">
                                                    <h3 className="text-lg sm:text-xl font-bold mb-2 hover:text-blue-600 transition-colors">{projectTitle}</h3>
                                                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">{projectShortDesc}</p>
                                                    <span className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline inline-flex items-center gap-1">
                                                        {t('portfolio.projects.visitProject')} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                                    </span>
                                                </div>
                                            </a>
                                        ) : (
                                            <>
                                                {project.image_url && (
                                                    <div className="aspect-video relative bg-gray-100">
                                                        <Image
                                                            src={project.image_url}
                                                            alt={`${projectTitle} project screenshot`}
                                                            fill
                                                            className="object-cover"
                                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                            loading="lazy"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4 sm:p-6">
                                                    <h3 className="text-lg sm:text-xl font-bold mb-2">{projectTitle}</h3>
                                                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2">{projectShortDesc}</p>
                                                    <Link
                                                        href={`/${profile.username}/contact`}
                                                        className="text-blue-600 font-semibold text-xs sm:text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
                                                        onClick={handleQuoteClick}
                                                        aria-label={`Request quote for ${projectTitle}`}
                                                    >
                                                        {t('portfolio.requestQuote')}
                                                    </Link>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12 px-6">
                    <div className="max-w-6xl mx-auto text-center">
                        <p className="text-gray-400">© {new Date().getFullYear()} {displayName}. {t('portfolio.footer.rights')}</p>
                    </div>
                </footer>
            </div>
        );
    }

    // Template Modern (complet avec toutes les sections)
    return (
        <div className="min-h-screen bg-white font-sans" style={style}>
            {/* Header avec Language Switcher */}
            <header className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-end">
                    <LanguageSwitcher />
                </div>
            </header>

            {/* Styles CSS pour animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 20px rgba(6, 182, 212, 0.3); }
                    50% { box-shadow: 0 0 40px rgba(6, 182, 212, 0.6); }
                }
                .text-gradient {
                    background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .glow-text {
                    text-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
                }
                .float-animation {
                    animation: float 6s ease-in-out infinite;
                }
                .pulse-glow-animation {
                    animation: pulse-glow 2s ease-in-out infinite;
                }
            `}</style>

            {/* ============================================
                1. HERO SECTION (Nouveau Design)
                ============================================ */}
            <section className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
            }}>
                {/* Grid Pattern Background */}
                <div 
                    className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Floating Bubbles */}
                <div className="absolute top-20 left-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl float-animation" style={{ animationDelay: '2s' }} />

                <div className="container mx-auto px-6 relative z-10 py-20">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge de disponibilité */}
                        {availableForWork && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-4 py-2 rounded-full text-sm font-semibold mb-8 pulse-glow-animation"
                            >
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                <span className="text-green-400">{t('portfolio.availableForWork')}</span>
                            </motion.div>
                        )}

                        {/* Titre principal */}
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-4"
                        >
                            <span className="text-white glow-text">
                                {heroTitle.split(' ').slice(0, -2).join(' ')}
                            </span>{' '}
                            <span className="text-gradient">
                                {heroTitle.split(' ').slice(-2).join(' ')}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 mb-6 sm:mb-8 md:mb-10 space-y-2 px-4"
                        >
                            <p>{heroSubtitle || t('portfolio.defaults.heroSubtitle')}</p>
                            <p>{heroDescription || t('portfolio.defaults.heroDescription')}</p>
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 md:mb-16 px-4"
                        >
                            <Link
                                href={`/${profile.username}/contact`}
                                onClick={handleQuoteClick}
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                                aria-label="Request a quote"
                            >
                                {ctaButtonText}
                            </Link>
                            <a
                                href="#projects"
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-slate-800/50 backdrop-blur-sm border border-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800/70 transition-all text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2 focus:ring-offset-slate-900"
                                aria-label="View projects"
                            >
                                {t('portfolio.viewProjects')}
                            </a>
                        </motion.div>

                        {/* Stats Cards - Grid 2x2 mobile, 4 colonnes desktop */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-12 px-4"
                        >
                            {/* Années d'expérience */}
                            <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 sm:p-6 hover:border-cyan-500/50 hover:-translate-y-1 transition-all cursor-pointer">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2">{stats.years}+</div>
                                <div className="text-xs sm:text-sm text-slate-400">{t('portfolio.stats.yearsExperience')}</div>
                            </div>

                            {/* Projets livrés */}
                            <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 sm:p-6 hover:border-cyan-500/50 hover:-translate-y-1 transition-all cursor-pointer">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2">{stats.projects}+</div>
                                <div className="text-xs sm:text-sm text-slate-400">{t('portfolio.stats.projectsDelivered')}</div>
                            </div>

                            {/* Clients satisfaits */}
                            <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 sm:p-6 hover:border-cyan-500/50 hover:-translate-y-1 transition-all cursor-pointer">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2">{stats.clients}+</div>
                                <div className="text-xs sm:text-sm text-slate-400">{t('portfolio.stats.clientsSatisfied')}</div>
                            </div>

                            {/* Délai de réponse */}
                            <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 sm:p-6 hover:border-cyan-500/50 hover:-translate-y-1 transition-all cursor-pointer">
                                <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-1 sm:mb-2">{stats.responseTime}</div>
                                <div className="text-xs sm:text-sm text-slate-400">{t('portfolio.stats.responseTime')}</div>
                            </div>
                        </motion.div>

                        {/* Badges de skills */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 1 }}
                            className="flex flex-wrap justify-center gap-4"
                        >
                            <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-6 py-3 flex items-center gap-2">
                                <span className="text-2xl">💻</span>
                                <span className="text-slate-300 font-medium">{t('portfolio.badges.fullStack')}</span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-6 py-3 flex items-center gap-2">
                                <span className="text-2xl">🚀</span>
                                <span className="text-slate-300 font-medium">{t('portfolio.badges.performance')}</span>
                            </div>
                            <div className="bg-slate-900/50 border border-slate-800 rounded-lg px-6 py-3 flex items-center gap-2">
                                <span className="text-2xl">⚡</span>
                                <span className="text-slate-300 font-medium">{t('portfolio.badges.cleanCode')}</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ============================================
                3. SERVICES OFFERTS
                ============================================ */}
            <section className="py-12 sm:py-16 md:py-20 bg-slate-50">
                <div className="container mx-auto px-4 sm:px-6">
                    <div className="text-center mb-8 sm:mb-12 md:mb-16">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
                            {t('portfolio.services.title')}
                        </h2>
                        <p className="text-base sm:text-lg md:text-xl text-gray-600 px-4">
                            {t('portfolio.services.subtitle')}
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                        {services.map((service, index) => {
                            const IconComponent = service.icon === 'globe' ? Globe : service.icon === 'code' ? Code : ShoppingCart;
                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 border border-gray-100"
                                >
                                    {/* Header */}
                                    <div className="mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                                            <IconComponent className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {service.description}
                                        </p>
                                    </div>

                                    {/* Catégories cibles */}
                                        {service.targetCategories && service.targetCategories.length > 0 && (
                                        <div className="mb-6">
                                            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                                <span className="text-lg">✨</span> {t('portfolio.services.perfectFor')} :
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {service.targetCategories.map((category, i) => (
                                                    <span
                                                        key={i}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700"
                                                    >
                                                        <span>{category.emoji}</span>
                                                        <span>{category.label}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Fonctionnalités */}
                                    {service.features && service.features.length > 0 && (
                                        <div className="mb-6">
                                            <ul className="space-y-2.5">
                                                {service.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                                                        <Check className="text-green-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Exemple de projet */}
                                    {service.exampleProject && (
                                        <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                            <p className="text-xs text-blue-800 leading-relaxed italic">
                                                {service.exampleProject}
                                            </p>
                                        </div>
                                    )}

                                    {/* Prix */}
                                    <div className="mb-6 pt-6 border-t border-gray-200">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-500 mb-1">{t('portfolio.services.startingFrom')}</p>
                                            <div className="text-3xl font-bold text-blue-600">
                                                {service.price}
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href={`/${profile.username}/contact`}
                                        className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all text-center block"
                                        onClick={handleQuoteClick}
                                    >
                                        {t('portfolio.requestQuote')}
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ============================================
                4. PROJETS PORTFOLIO
                ============================================ */}
            {projects.length > 0 && (
                <section id="projects" className="py-12 sm:py-16 md:py-20 lg:py-24 px-4 sm:px-6 bg-white">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex justify-between items-end mb-8 sm:mb-12">
                            <div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('portfolio.projects.completed')}</h2>
                                <p className="text-sm sm:text-base text-gray-600">{t('portfolio.projects.discover')}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                {projects.map((project, index) => {
                                    const projectTitle = getTranslatedTextWithFallback(language, project.title, project.title_en, project.title);
                                    const projectShortDesc = getTranslatedTextWithFallback(language, project.short_description, project.short_description_en, project.short_description || t('portfolio.projects.defaultDescription'));
                                    
                                    return (
                                    <motion.div
                                    key={project.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${project.project_url ? 'cursor-pointer' : ''}`}
                                >
                                    {project.project_url ? (
                                        <a href={project.project_url} target="_blank" rel="noopener noreferrer" className="block focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded-2xl">
                                            <div className="aspect-video bg-gray-200 overflow-hidden relative">
                                                {project.image_url ? (
                                                    <Image
                                                        src={project.image_url}
                                                        alt={`${projectTitle} project screenshot`}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
                                                        {projectTitle}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 sm:p-6">
                                                {project.technologies && project.technologies.length > 0 && (
                                                    <div className="flex gap-2 mb-3 flex-wrap">
                                                        {project.technologies.slice(0, 3).map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {projectTitle}
                                                </h3>
                                                <p className="text-gray-500 text-xs sm:text-sm mb-4 line-clamp-2">
                                                    {projectShortDesc}
                                                </p>
                                                <span className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs sm:text-sm hover:gap-3 transition-all">
                                                    {t('portfolio.projects.visitProject')}
                                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                                </span>
                                            </div>
                                        </a>
                                    ) : (
                                        <>
                                            <div className="aspect-video bg-gray-200 overflow-hidden relative">
                                                {project.image_url ? (
                                                    <Image
                                                        src={project.image_url}
                                                        alt={`${projectTitle} project screenshot`}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        loading="lazy"
                                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm sm:text-base">
                                                        {projectTitle}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 sm:p-6">
                                                {project.technologies && project.technologies.length > 0 && (
                                                    <div className="flex gap-2 mb-3 flex-wrap">
                                                        {project.technologies.slice(0, 3).map((tech) => (
                                                            <span
                                                                key={tech}
                                                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded font-medium"
                                                            >
                                                                {tech}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {projectTitle}
                                                </h3>
                                                <p className="text-gray-500 text-xs sm:text-sm mb-4 line-clamp-2">
                                                    {projectShortDesc}
                                                </p>
                                                <Link
                                                    href={`/${profile.username}/contact`}
                                                    className="inline-flex items-center gap-2 text-blue-600 font-semibold text-xs sm:text-sm hover:gap-3 transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 rounded"
                                                    onClick={handleQuoteClick}
                                                    aria-label={`Request quote for ${projectTitle}`}
                                                >
                                                    {t('portfolio.requestQuote')}
                                                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </>
                                    )}
                                </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {/* ============================================
                5. PROCESS DE TRAVAIL
                ============================================ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        {t('portfolio.workProcess.title')}
                    </h2>

                    <div className="max-w-4xl mx-auto">
                        {workProcess.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-6 mb-12"
                            >
                                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0">
                                    {step.num}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                                    <p className="text-gray-600">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                6. TÉMOIGNAGES
                ============================================ */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        {t('portfolio.testimonials.title')}
                    </h2>
                    {testimonials.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
                            {testimonials.slice(0, 3).map((testimonial, index) => (
                                <motion.div
                                    key={testimonial.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white p-6 rounded-xl shadow-lg"
                                >
                                    {testimonial.rating && (
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${
                                                        i < testimonial.rating! ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-gray-700 mb-6 italic">"{testimonial.testimonial_text}"</p>
                                    <div className="flex items-center gap-4">
                                        {testimonial.client_avatar_url ? (
                                            <img
                                                src={testimonial.client_avatar_url}
                                                alt={testimonial.client_name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-bold">
                                                    {testimonial.client_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-900">{testimonial.client_name}</div>
                                            {testimonial.client_position && (
                                                <div className="text-sm text-gray-600">{testimonial.client_position}</div>
                                            )}
                                            {testimonial.client_company && (
                                                <div className="text-sm text-gray-500">{testimonial.client_company}</div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center mb-12">
                            <p className="text-gray-600 text-lg">{t('portfolio.testimonials.noTestimonials')}</p>
                        </div>
                    )}
                    {/* Bouton pour laisser un témoignage */}
                    <div className="text-center">
                        <Link
                            href={`/${profile.username}/testimonial`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                        >
                            <MessageCircle className="w-5 h-5" />
                            {t('portfolio.testimonials.leaveTestimonial')}
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============================================
                7. TECHNOLOGIES
                ============================================ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <h2 className="text-4xl font-bold text-center mb-16">
                        {t('portfolio.technologies.title')}
                    </h2>
                    <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                        {technologies.map((tech, index) => (
                            <motion.span
                                key={tech}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="px-6 py-3 bg-blue-50 text-blue-700 rounded-full font-semibold text-sm hover:bg-blue-100 transition-colors"
                            >
                                {tech}
                            </motion.span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                8. CTA FINAL
                ============================================ */}
            <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">
                        {ctaTitle}
                    </h2>
                    <p className="text-xl mb-8 text-blue-100">
                        {ctaSubtitle}
                    </p>
                    <Link
                        href={`/${profile.username}/contact`}
                        className="inline-block px-12 py-5 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-blue-50 transition-all shadow-2xl hover:scale-105"
                        onClick={handleQuoteClick}
                    >
                        {ctaButtonText}
                    </Link>
                    <p className="mt-4 text-blue-200">
                        {ctaFooterText}
                    </p>
                </div>
            </section>

            {/* ============================================
                9. FOOTER
                ============================================ */}
            <footer className="bg-gray-900 text-white py-12 px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
                        <div className="text-2xl font-bold">
                            {displayName} <span className="text-blue-400">.</span>
                        </div>
                        <div className="flex gap-6 text-gray-400">
                            {profile.tiktok_url && (
                                <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                    <Music2 className="w-5 h-5" />
                                </a>
                            )}
                            {profile.facebook_url && (
                                <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {profile.twitter_url && (
                                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            )}
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} className="hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-800">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                            <Link href={`/${profile.username}`} className="hover:text-white transition-colors">
                                {t('portfolio.footer.home')}
                            </Link>
                            <Link href={`/${profile.username}/about`} className="hover:text-white transition-colors">
                                {t('portfolio.footer.about')}
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-sm text-gray-500">© {new Date().getFullYear()} {displayName}. {t('portfolio.footer.rights')}</p>
                            {profile.subscription_tier === 'free' && (
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span>{t('portfolio.footer.poweredBy')}</span>
                                    <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
                                        <Image
                                            src="/innovaport-logo.png"
                                            alt="InnovaPort"
                                            width={100}
                                            height={30}
                                            className="h-6 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity"
                                        />
                                    </Link>
                                </div>
                            )}
                        </div>
                        <Link
                            href={`/${profile.username}/contact`}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                            onClick={handleQuoteClick}
                        >
                            {t('portfolio.requestQuote')}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </footer>

            {/* ============================================
                9. BOUTON FLOTTANT (sticky CTA)
                ============================================ */}
            {showFloatingButton && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50"
                >
                    <Link
                        href={`/${profile.username}/contact`}
                        className="flex items-center gap-2 px-4 sm:px-6 py-3 sm:py-4 bg-blue-600 text-white rounded-full font-semibold shadow-2xl hover:bg-blue-700 transition-all hover:scale-105 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                        onClick={handleQuoteClick}
                        aria-label="Request a free quote"
                    >
                        <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
                        <span className="hidden sm:inline">{t('portfolio.floatingButton.freeQuote')}</span>
                        <span className="sm:hidden">{t('portfolio.requestQuote')}</span>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}
