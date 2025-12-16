'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Cookie, Shield, BarChart3, Settings, Target, Database, Globe, AlertCircle, CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function PolitiqueCookiesPage() {
    const { t, language } = useTranslation();
    const [activeSection, setActiveSection] = useState<string>('section-1');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [cookiePreferences, setCookiePreferences] = useState({
        essential: true, // Toujours activé
        analytics: false,
        functional: false,
        targeting: false,
    });
    const currentYear = new Date().getFullYear();

    // Table des matières
    const tableOfContents = [
        { id: 'section-1', title: 'Qu\'est-ce qu\'un cookie ?', icon: Cookie },
        { id: 'section-2', title: 'Pourquoi utilisons-nous des cookies ?', icon: BarChart3 },
        { id: 'section-3', title: 'Cookies utilisés', icon: Database },
        { id: 'section-4', title: 'Services tiers', icon: Globe },
        { id: 'section-5', title: 'Technologies similaires', icon: Settings },
        { id: 'section-6', title: 'Gérer mes préférences', icon: Settings },
        { id: 'section-7', title: 'Cookies et données personnelles', icon: Shield },
        { id: 'section-8', title: 'Réseaux sociaux', icon: Globe },
        { id: 'section-9', title: 'Mises à jour', icon: FileText },
        { id: 'section-10', title: 'Base légale', icon: Shield },
        { id: 'section-11', title: 'Vos droits', icon: CheckCircle },
        { id: 'section-12', title: 'Contact', icon: Mail },
        { id: 'section-13', title: 'Ressources utiles', icon: ExternalLink },
    ];

    // Données des cookies
    const cookiesData = {
        essential: [
            { name: 'session_id', purpose: 'Maintenir votre session active', duration: 'Session', type: 'Propriétaire' },
            { name: 'csrf_token', purpose: 'Protection contre les attaques CSRF', duration: 'Session', type: 'Propriétaire' },
            { name: 'cookie_consent', purpose: 'Mémoriser vos préférences de cookies', duration: '12 mois', type: 'Propriétaire' },
            { name: 'auth_token', purpose: 'Authentification sécurisée', duration: 'Session', type: 'Propriétaire' },
        ],
        analytics: [
            { name: '_ga', service: 'Google Analytics', purpose: 'Distinguer les utilisateurs', duration: '2 ans', type: 'Tiers' },
            { name: '_gid', service: 'Google Analytics', purpose: 'Distinguer les utilisateurs', duration: '24 heures', type: 'Tiers' },
            { name: '_gat', service: 'Google Analytics', purpose: 'Limiter le taux de requêtes', duration: '1 minute', type: 'Tiers' },
        ],
        functional: [
            { name: 'lang_pref', purpose: 'Mémoriser votre langue préférée', duration: '6 mois', type: 'Propriétaire' },
            { name: 'theme_mode', purpose: 'Mémoriser votre thème (clair/sombre)', duration: '6 mois', type: 'Propriétaire' },
            { name: 'user_preferences', purpose: 'Stocker vos paramètres personnalisés', duration: '12 mois', type: 'Propriétaire' },
        ],
    };

    // Détection de la section active
    useEffect(() => {
        const handleScroll = () => {
            const sections = tableOfContents.map(item => {
                const element = document.getElementById(item.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return {
                        id: item.id,
                        top: rect.top,
                    };
                }
                return null;
            }).filter(Boolean);

            const scrollPosition = window.scrollY + 200;

            for (let i = sections.length - 1; i >= 0; i--) {
                if (sections[i] && scrollPosition >= sections[i]!.top) {
                    setActiveSection(sections[i]!.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            setMobileMenuOpen(false);
        }
    };

    const getDurationBadgeColor = (duration: string) => {
        if (duration === 'Session') return 'bg-blue-100 text-blue-700';
        if (duration.includes('heure')) return 'bg-green-100 text-green-700';
        if (duration.includes('mois')) return 'bg-orange-100 text-orange-700';
        if (duration.includes('an')) return 'bg-purple-100 text-purple-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getCookieTypeIcon = (type: string) => {
        return type === 'Propriétaire' ? Shield : Globe;
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Sticky */}
            <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" role="navigation" aria-label="Navigation principale">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
                            aria-label={t('legal.backToHome')}
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            <span className="text-sm font-medium hidden sm:inline">{t('legal.backToHome')}</span>
                        </Link>
                        <Link href="/" aria-label="Innovaport" className="flex-shrink-0">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={200}
                                height={60}
                                className="h-12 sm:h-16 w-auto object-contain"
                                priority
                                sizes="(max-width: 640px) 150px, 200px"
                            />
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Table des matières */}
                    <aside className="lg:w-64 lg:flex-shrink-0">
                        {/* Mobile: Dropdown */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-full bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-200 flex items-center justify-between hover:from-blue-100 hover:to-green-100 transition-colors"
                                aria-expanded={mobileMenuOpen}
                            >
                                <span className="font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
                                    Table des matières
                                </span>
                                {mobileMenuOpen ? (
                                    <ChevronUp className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                )}
                            </button>
                            {mobileMenuOpen && (
                                <div className="mt-2 bg-white rounded-lg border border-gray-200 shadow-lg p-4 max-h-96 overflow-y-auto">
                                    <nav className="space-y-1">
                                        {tableOfContents.map((item) => {
                                            const Icon = item.icon;
                                            const isActive = activeSection === item.id;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => scrollToSection(item.id)}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                                        isActive
                                                            ? 'bg-[#1E3A8A] text-white font-medium'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
                                                    <span className="truncate">{item.title}</span>
                                                </button>
                                            );
                                        })}
                                    </nav>
                                </div>
                            )}
                        </div>

                        {/* Desktop: Sticky */}
                        <div className="hidden lg:block lg:sticky lg:top-24">
                            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-xl p-6 border border-blue-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
                                    Table des matières
                                </h2>
                                <nav className="space-y-2">
                                    {tableOfContents.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeSection === item.id;
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => scrollToSection(item.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                                                    isActive
                                                        ? 'bg-[#1E3A8A] text-white font-medium shadow-sm'
                                                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                                                }`}
                                                aria-current={isActive ? 'page' : undefined}
                                            >
                                                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} aria-hidden="true" />
                                                <span className="truncate">{item.title}</span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            </div>
                        </div>
                    </aside>

                    {/* Contenu principal */}
                    <main className="flex-1 min-w-0">
                        {/* Hero Section */}
                        <header className="mb-12 sm:mb-16 text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full mb-6">
                                <Cookie className="w-10 h-10 text-orange-600" aria-hidden="true" />
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {t('legal.politiqueCookies.title')}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mb-6">
                                {t('legal.politiqueCookies.lastUpdated')}
                            </p>
                            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 max-w-3xl mx-auto">
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {t('legal.politiqueCookies.intro')}
                                </p>
                                <p className="mt-3 text-sm sm:text-base text-gray-700 font-semibold">
                                    {t('legal.politiqueCookies.konekteGroup')} <strong className="text-[#1E3A8A]">{t('legal.politiqueCookies.konekteGroupName')}</strong>, {t('legal.politiqueCookies.legalEntity')}
                                </p>
                            </div>
                        </header>

                        {/* Sections */}
                        <div className="space-y-12 sm:space-y-16">
                            {/* Section 1 */}
                            <section id="section-1" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Cookie className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueCookies.section1.title')}
                                        </h2>
                                        <div className="space-y-4 text-gray-700 leading-relaxed">
                                            <p>
                                                {t('legal.politiqueCookies.section1.content1')}
                                            </p>

                                            <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                                <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5">
                                                    <h3 className="font-bold text-gray-900 mb-3">{t('legal.politiqueCookies.section1.byDuration')}</h3>
                                                    <ul className="space-y-2 text-sm">
                                                        <li className="flex items-start gap-2">
                                                            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                            <span><strong>{language === 'fr' ? 'Cookies de session' : 'Session cookies'}</strong> : {t('legal.politiqueCookies.section1.sessionCookies')}</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <Clock className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                            <span><strong>{language === 'fr' ? 'Cookies persistants' : 'Persistent cookies'}</strong> : {t('legal.politiqueCookies.section1.persistentCookies')}</span>
                                                        </li>
                                                    </ul>
                                                </div>

                                                <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-5">
                                                    <h3 className="font-bold text-gray-900 mb-3">{t('legal.politiqueCookies.section1.byOrigin')}</h3>
                                                    <ul className="space-y-2 text-sm">
                                                        <li className="flex items-start gap-2">
                                                            <Shield className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                            <span><strong>{language === 'fr' ? 'Cookies propriétaires' : 'First-party cookies'}</strong> : {t('legal.politiqueCookies.section1.firstParty')}</span>
                                                        </li>
                                                        <li className="flex items-start gap-2">
                                                            <Globe className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                            <span><strong>{language === 'fr' ? 'Cookies tiers' : 'Third-party cookies'}</strong> : {t('legal.politiqueCookies.section1.thirdParty')}</span>
                                                        </li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section id="section-2" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <BarChart3 className="w-6 h-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueCookies.section2.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {t('legal.politiqueCookies.section2.content1')}
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-4">
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3">
                                                    <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 mb-1">{language === 'fr' ? 'Fonctionnement du site' : 'Site functionality'}</h3>
                                                        <p className="text-sm text-gray-700">{t('legal.politiqueCookies.section2.reason1')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3">
                                                    <BarChart3 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 mb-1">{language === 'fr' ? 'Performance' : 'Performance'}</h3>
                                                        <p className="text-sm text-gray-700">{t('legal.politiqueCookies.section2.reason2')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3">
                                                    <Settings className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 mb-1">{language === 'fr' ? 'Préférences' : 'Preferences'}</h3>
                                                        <p className="text-sm text-gray-700">{t('legal.politiqueCookies.section2.reason3')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                                <div className="flex items-start gap-3">
                                                    <Shield className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" aria-hidden="true" />
                                                    <div>
                                                        <h3 className="font-bold text-gray-900 mb-1">{language === 'fr' ? 'Sécurité' : 'Security'}</h3>
                                                        <p className="text-sm text-gray-700">{t('legal.politiqueCookies.section2.reason4')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 - Cookies utilisés avec tableaux */}
                            <section id="section-3" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Database className="w-6 h-6 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            {t('legal.politiqueCookies.section3.title')}
                                        </h2>

                                        {/* 3.1 Cookies strictement nécessaires */}
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {t('legal.politiqueCookies.section3.essential')}
                                                </h3>
                                            </div>
                                            <p className="text-gray-700 mb-4 text-sm">
                                                {t('legal.politiqueCookies.section3.essentialDesc')}
                                            </p>

                                            {/* Desktop Table */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
                                                    <thead>
                                                        <tr className="bg-blue-50">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.cookieName')}</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.purpose')}</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.duration')}</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.type')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cookiesData.essential.map((cookie, index) => {
                                                            const TypeIcon = getCookieTypeIcon(cookie.type);
                                                            return (
                                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3 text-sm font-mono text-gray-900 border-b border-gray-100">{cookie.name}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{cookie.purpose}</td>
                                                                    <td className="px-4 py-3 border-b border-gray-100">
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationBadgeColor(cookie.duration)}`}>
                                                                            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                                                            {cookie.duration}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 border-b border-gray-100">
                                                                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                                                                            <TypeIcon className="w-4 h-4" aria-hidden="true" />
                                                                            {cookie.type}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Cards */}
                                            <div className="md:hidden space-y-3">
                                                {cookiesData.essential.map((cookie, index) => {
                                                    const TypeIcon = getCookieTypeIcon(cookie.type);
                                                    return (
                                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="font-mono text-sm font-semibold text-gray-900">{cookie.name}</span>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationBadgeColor(cookie.duration)}`}>
                                                                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                                                    {cookie.duration}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mb-2">{cookie.purpose}</p>
                                                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                                <TypeIcon className="w-3 h-3" aria-hidden="true" />
                                                                {cookie.type}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4">
                                                <p className="text-sm text-gray-700">
                                                    <strong className="text-gray-900">{t('legal.politiqueCookies.section3.legalBasis')}</strong> {t('legal.politiqueCookies.section3.legalBasisContent')}
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3.2 Cookies analytiques */}
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-4">
                                                <BarChart3 className="w-6 h-6 text-green-600" aria-hidden="true" />
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    3.2 Cookies de performance et analytiques
                                                </h3>
                                            </div>
                                            <p className="text-gray-700 mb-4 text-sm">
                                                Ces cookies nous permettent de compter les visites et les sources de trafic afin d'améliorer les performances de notre site.
                                            </p>

                                            {/* Desktop Table */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
                                                    <thead>
                                                        <tr className="bg-green-50">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Nom du cookie</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Service</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Finalité</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Durée</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">Type</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cookiesData.analytics.map((cookie, index) => {
                                                            const TypeIcon = getCookieTypeIcon(cookie.type);
                                                            return (
                                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3 text-sm font-mono text-gray-900 border-b border-gray-100">{cookie.name}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{cookie.service}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{cookie.purpose}</td>
                                                                    <td className="px-4 py-3 border-b border-gray-100">
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationBadgeColor(cookie.duration)}`}>
                                                                            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                                                            {cookie.duration}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 border-b border-gray-100">
                                                                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                                                                            <TypeIcon className="w-4 h-4" aria-hidden="true" />
                                                                            {cookie.type}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Cards */}
                                            <div className="md:hidden space-y-3">
                                                {cookiesData.analytics.map((cookie, index) => {
                                                    const TypeIcon = getCookieTypeIcon(cookie.type);
                                                    return (
                                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="font-mono text-sm font-semibold text-gray-900">{cookie.name}</span>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationBadgeColor(cookie.duration)}`}>
                                                                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                                                    {cookie.duration}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mb-1">Service: {cookie.service}</p>
                                                            <p className="text-sm text-gray-700 mb-2">{cookie.purpose}</p>
                                                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                                <TypeIcon className="w-3 h-3" aria-hidden="true" />
                                                                {cookie.type}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 bg-green-50 border-l-4 border-green-500 rounded-lg p-4">
                                                <p className="text-sm text-gray-700">
                                                    <strong className="text-gray-900">Base légale :</strong> Votre consentement (peut être retiré à tout moment).
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3.3 Cookies fonctionnels */}
                                        <div className="mb-8">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Settings className="w-6 h-6 text-orange-600" aria-hidden="true" />
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    3.3 Cookies de fonctionnalité
                                                </h3>
                                            </div>
                                            <p className="text-gray-700 mb-4 text-sm">
                                                Ces cookies permettent au site de mémoriser vos choix et de fournir des fonctionnalités améliorées.
                                            </p>

                                            {/* Desktop Table */}
                                            <div className="hidden md:block overflow-x-auto">
                                                <table className="w-full border-collapse bg-white rounded-lg shadow-sm border border-gray-200">
                                                    <thead>
                                                        <tr className="bg-orange-50">
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.cookieName')}</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.purpose')}</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.duration')}</th>
                                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 border-b border-gray-200">{t('legal.politiqueCookies.section3.type')}</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cookiesData.functional.map((cookie, index) => {
                                                            const TypeIcon = getCookieTypeIcon(cookie.type);
                                                            return (
                                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                                    <td className="px-4 py-3 text-sm font-mono text-gray-900 border-b border-gray-100">{cookie.name}</td>
                                                                    <td className="px-4 py-3 text-sm text-gray-700 border-b border-gray-100">{cookie.purpose}</td>
                                                                    <td className="px-4 py-3 border-b border-gray-100">
                                                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationBadgeColor(cookie.duration)}`}>
                                                                            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                                                            {cookie.duration}
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-4 py-3 border-b border-gray-100">
                                                                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                                                                            <TypeIcon className="w-4 h-4" aria-hidden="true" />
                                                                            {cookie.type}
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>

                                            {/* Mobile Cards */}
                                            <div className="md:hidden space-y-3">
                                                {cookiesData.functional.map((cookie, index) => {
                                                    const TypeIcon = getCookieTypeIcon(cookie.type);
                                                    return (
                                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <span className="font-mono text-sm font-semibold text-gray-900">{cookie.name}</span>
                                                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDurationBadgeColor(cookie.duration)}`}>
                                                                    <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                                                                    {cookie.duration}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-700 mb-2">{cookie.purpose}</p>
                                                            <span className="inline-flex items-center gap-1 text-xs text-gray-600">
                                                                <TypeIcon className="w-3 h-3" aria-hidden="true" />
                                                                {cookie.type}
                                                            </span>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            <div className="mt-4 bg-orange-50 border-l-4 border-orange-500 rounded-lg p-4">
                                                <p className="text-sm text-gray-700">
                                                    <strong className="text-gray-900">Base légale :</strong> Votre consentement ou intérêt légitime (amélioration de l'expérience utilisateur).
                                                </p>
                                            </div>
                                        </div>

                                        {/* 3.4 Cookies de ciblage */}
                                        <div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <Target className="w-6 h-6 text-purple-600" aria-hidden="true" />
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    3.4 Cookies de ciblage et publicité
                                                </h3>
                                            </div>
                                            <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-5">
                                                <p className="text-gray-700">
                                                    Actuellement, nous n'utilisons <strong>pas</strong> de cookies de ciblage publicitaire sur notre site.
                                                </p>
                                                <p className="text-gray-700 mt-2">
                                                    Si cela venait à changer, nous mettrions à jour cette politique et demanderions votre consentement explicite.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="section-4" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            4. Services tiers et cookies
                                        </h2>

                                        <div className="space-y-6">
                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <BarChart3 className="w-5 h-5 text-green-600" aria-hidden="true" />
                                                    4.1 Google Analytics
                                                </h3>
                                                <p className="text-gray-700 mb-4">
                                                    Nous utilisons Google Analytics pour analyser l'utilisation de notre site. Google Analytics utilise des cookies pour collecter des données sur votre utilisation du site de manière anonymisée.
                                                </p>
                                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                    <p className="font-semibold text-gray-900 mb-2">Données collectées :</p>
                                                    <ul className="list-disc list-inside ml-2 space-y-1 text-sm text-gray-700">
                                                        <li>Pages visitées</li>
                                                        <li>Temps passé sur le site</li>
                                                        <li>Source de référence</li>
                                                        <li>Données démographiques générales (âge, sexe approximatifs)</li>
                                                        <li>Appareil et navigateur utilisés</li>
                                                    </ul>
                                                </div>
                                                <p className="text-sm text-gray-700">
                                                    <strong>Contrôle :</strong> Vous pouvez désactiver Google Analytics en installant le module complémentaire de navigateur :{' '}
                                                    <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1">
                                                        Google Analytics Opt-out
                                                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                                                    </a>
                                                </p>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                    4.2 Hébergement et CDN
                                                </h3>
                                                <p className="text-gray-700">
                                                    Notre hébergeur peut utiliser des cookies techniques pour assurer la sécurité et la performance du site.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="section-5" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Settings className="w-6 h-6 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            5. Technologies similaires aux cookies
                                        </h2>

                                        <div className="space-y-4">
                                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                                <h3 className="text-lg font-bold text-gray-900 mb-3">5.1 Local Storage</h3>
                                                <p className="text-gray-700 text-sm mb-2">Nous utilisons le stockage local du navigateur pour :</p>
                                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm text-gray-700">
                                                    <li>Sauvegarder vos préférences d'interface</li>
                                                    <li>Améliorer la rapidité de chargement</li>
                                                    <li>Stocker des données temporaires non sensibles</li>
                                                </ul>
                                            </div>

                                            <div className="bg-white border border-gray-200 rounded-lg p-5">
                                                <h3 className="text-lg font-bold text-gray-900 mb-3">5.2 Session Storage</h3>
                                                <p className="text-gray-700 text-sm">Utilisé pour stocker des informations temporaires pendant votre session de navigation.</p>
                                            </div>

                                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                                                <h3 className="text-lg font-bold text-gray-900 mb-3">5.3 Pixels invisibles (Web Beacons)</h3>
                                                <p className="text-gray-700 text-sm">Actuellement non utilisés. Si nous les utilisons à l'avenir, cette politique sera mise à jour.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6 - Gérer mes cookies (CTA mise en évidence) */}
                            <section id="section-6" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Settings className="w-6 h-6 text-orange-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            6. Gestion de vos préférences
                                        </h2>

                                        {/* Panneau de gestion des cookies (démo) */}
                                        <div className="bg-gradient-to-br from-blue-50 via-green-50 to-orange-50 border-2 border-orange-300 rounded-xl p-6 sm:p-8 mb-8 shadow-lg">
                                            <div className="flex items-center gap-3 mb-6">
                                                <Cookie className="w-8 h-8 text-orange-600" aria-hidden="true" />
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    Gérer mes cookies
                                                </h3>
                                            </div>
                                            <p className="text-gray-700 mb-6">
                                                Vous pouvez contrôler vos préférences de cookies ci-dessous. Notez que certains cookies sont essentiels au fonctionnement du site.
                                            </p>

                                            <div className="space-y-4">
                                                {/* Essential - toujours activé */}
                                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Cookies strictement nécessaires</h4>
                                                                <p className="text-xs text-gray-600">Toujours activés - Essentiels au fonctionnement</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">Toujours actif</span>
                                                            <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                                                                <div className="w-4 h-4 bg-white rounded-full"></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Analytics */}
                                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <BarChart3 className="w-5 h-5 text-green-600" aria-hidden="true" />
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Cookies analytiques</h4>
                                                                <p className="text-xs text-gray-600">Nous aident à améliorer le site</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setCookiePreferences({ ...cookiePreferences, analytics: !cookiePreferences.analytics })}
                                                            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                                                                cookiePreferences.analytics ? 'bg-green-600' : 'bg-gray-300'
                                                            }`}
                                                            aria-label="Activer/désactiver les cookies analytiques"
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${cookiePreferences.analytics ? 'translate-x-6' : ''}`}></div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Functional */}
                                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Settings className="w-5 h-5 text-orange-600" aria-hidden="true" />
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Cookies de fonctionnalité</h4>
                                                                <p className="text-xs text-gray-600">Mémorisent vos préférences</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setCookiePreferences({ ...cookiePreferences, functional: !cookiePreferences.functional })}
                                                            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 ${
                                                                cookiePreferences.functional ? 'bg-green-600' : 'bg-gray-300'
                                                            }`}
                                                            aria-label="Activer/désactiver les cookies de fonctionnalité"
                                                        >
                                                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${cookiePreferences.functional ? 'translate-x-6' : ''}`}></div>
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Targeting */}
                                                <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Target className="w-5 h-5 text-purple-600" aria-hidden="true" />
                                                            <div>
                                                                <h4 className="font-semibold text-gray-900">Cookies de ciblage</h4>
                                                                <p className="text-xs text-gray-600">Actuellement non utilisés</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            disabled
                                                            className="relative w-12 h-6 rounded-full bg-gray-200 cursor-not-allowed"
                                                            aria-label="Cookies de ciblage désactivés"
                                                        >
                                                            <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full"></div>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                                <button className="px-6 py-3 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#1E40AF] transition-colors shadow-lg">
                                                    Enregistrer mes préférences
                                                </button>
                                                <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                                                    Tout accepter
                                                </button>
                                                <button className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                                                    Tout refuser
                                                </button>
                                            </div>

                                            <p className="mt-4 text-xs text-gray-600 text-center">
                                                ⚠️ Cette interface est une démonstration. Les préférences ne sont pas sauvegardées.
                                            </p>
                                        </div>

                                        {/* 6.1 Panneau de gestion */}
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">6.1 Panneau de gestion des cookies</h3>
                                            <p className="text-gray-700 mb-3">
                                                Vous pouvez gérer vos préférences de cookies à tout moment via notre panneau de configuration accessible :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                                                <li>En cliquant sur le lien "Gérer les cookies" dans le footer</li>
                                                <li>Via les paramètres de votre compte</li>
                                                <li>En cliquant sur le bandeau de cookies lors de votre première visite</li>
                                            </ul>
                                        </div>

                                        {/* 6.2 Paramètres navigateur */}
                                        <div className="mb-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">6.2 Paramètres du navigateur</h3>
                                            <p className="text-gray-700 mb-4">
                                                Vous pouvez également contrôler et supprimer les cookies via les paramètres de votre navigateur :
                                            </p>
                                            <div className="grid sm:grid-cols-2 gap-3">
                                                {[
                                                    { name: 'Chrome', path: 'Paramètres > Confidentialité et sécurité > Cookies et autres données de sites' },
                                                    { name: 'Firefox', path: 'Paramètres > Vie privée et sécurité > Cookies et données de sites' },
                                                    { name: 'Safari', path: 'Préférences > Confidentialité > Gérer les données de sites web' },
                                                    { name: 'Edge', path: 'Paramètres > Cookies et autorisations de site > Cookies et données de site' },
                                                ].map((browser, index) => (
                                                    <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                                        <h4 className="font-semibold text-gray-900 mb-2">{browser.name}</h4>
                                                        <p className="text-xs text-gray-700">{browser.path}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* 6.3 Refuser tous */}
                                        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4">6.3 Refuser tous les cookies</h3>
                                            <p className="text-gray-700 mb-2">
                                                Vous pouvez paramétrer votre navigateur pour refuser tous les cookies. Cependant :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                                                <li>Certaines fonctionnalités du site peuvent ne plus fonctionner correctement</li>
                                                <li>Vous devrez renouveler vos préférences à chaque visite</li>
                                                <li>Votre expérience utilisateur peut être dégradée</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section id="section-7" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            7. Cookies et données personnelles
                                        </h2>
                                        <div className="space-y-4 text-gray-700 leading-relaxed">
                                            <p>
                                                Certains cookies peuvent contenir des données personnelles, notamment les cookies d'authentification.
                                            </p>
                                            <p>
                                                Ces données sont traitées conformément à notre{' '}
                                                <Link href="/politique-confidentialite" className="text-[#1E3A8A] hover:underline font-semibold">
                                                    Politique de Confidentialité
                                                </Link>.
                                            </p>
                                            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5">
                                                <p className="font-semibold text-gray-900 mb-2">Protection des données :</p>
                                                <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                                                    <li>Les cookies sont chiffrés lorsqu'ils contiennent des informations sensibles</li>
                                                    <li>Les cookies de session sont automatiquement supprimés</li>
                                                    <li>Nous limitons la durée de conservation des cookies</li>
                                                    <li>Nous ne partageons pas les données des cookies avec des tiers sans votre consentement</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 8 */}
                            <section id="section-8" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Globe className="w-6 h-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            8. Cookies et réseaux sociaux
                                        </h2>
                                        <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-5">
                                            <p className="text-gray-700">
                                                Actuellement, nous n'utilisons pas de boutons de partage de réseaux sociaux qui placent des cookies.
                                            </p>
                                            <p className="text-gray-700 mt-2">
                                                Si notre site intègre à l'avenir des fonctionnalités de réseaux sociaux (Facebook, LinkedIn, Twitter, etc.), ces plateformes peuvent placer leurs propres cookies sur votre appareil. Nous n'avons aucun contrôle sur ces cookies tiers.
                                            </p>
                                            <p className="text-gray-700 mt-2">
                                                Consultez les politiques de confidentialité de ces plateformes pour plus d'informations.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 9 */}
                            <section id="section-9" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6 text-purple-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            9. Mises à jour de cette politique
                                        </h2>
                                        <div className="space-y-3 text-gray-700 leading-relaxed">
                                            <p>
                                                Nous pouvons mettre à jour cette politique de cookies à tout moment pour refléter :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1">
                                                <li>Les changements dans nos pratiques</li>
                                                <li>L'ajout ou la suppression de services tiers</li>
                                                <li>Les évolutions de la législation</li>
                                                <li>Les retours et demandes des utilisateurs</li>
                                            </ul>
                                            <p>
                                                La date de "Dernière mise à jour" sera modifiée en conséquence.
                                            </p>
                                            <p>
                                                Nous vous encourageons à consulter régulièrement cette page.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 10 */}
                            <section id="section-10" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            10. Base légale et conformité
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">10.1 Législation applicable</h3>
                                                <p className="text-gray-700 mb-3">
                                                    Cette politique de cookies est conforme aux exigences de :
                                                </p>
                                                <div className="grid sm:grid-cols-2 gap-3">
                                                    {[
                                                        'La Loi canadienne anti-pourriel (LCAP)',
                                                        'La Loi sur la protection des renseignements personnels du Québec',
                                                        'Le RGPD (pour les utilisateurs européens)',
                                                        'Les directives ePrivacy',
                                                    ].map((law, index) => (
                                                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-2">
                                                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" aria-hidden="true" />
                                                            <span className="text-sm text-gray-700">{law}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-5">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">10.2 Consentement</h3>
                                                <p className="text-gray-700 mb-2">
                                                    Conformément à la législation :
                                                </p>
                                                <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700">
                                                    <li>Les cookies non essentiels nécessitent votre consentement explicite</li>
                                                    <li>Vous pouvez retirer votre consentement à tout moment</li>
                                                    <li>Le refus des cookies n'empêche pas l'accès au site (sauf fonctionnalités essentielles)</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 11 */}
                            <section id="section-11" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            11. Vos droits
                                        </h2>
                                        <p className="text-gray-700 mb-4">
                                            En lien avec l'utilisation des cookies, vous avez le droit de :
                                        </p>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                            {[
                                                'Être informé : savoir quels cookies sont utilisés',
                                                'Consentir : accepter ou refuser les cookies non essentiels',
                                                'Accéder : demander quelles données sont collectées via les cookies',
                                                'Supprimer : demander la suppression des données collectées',
                                                'Rétracter : retirer votre consentement à tout moment',
                                                'Porter plainte : contacter l\'autorité de protection des données',
                                            ].map((right, index) => (
                                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-start gap-3">
                                                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                                                    <span className="text-sm text-gray-700">{right}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 12 */}
                            <section id="section-12" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-orange-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            12. Contact et questions
                                        </h2>
                                        <div className="bg-[#1E3A8A] rounded-lg p-6 text-white">
                                            <p className="mb-4 text-blue-100">
                                                Pour toute question concernant notre utilisation des cookies :
                                            </p>
                                            <div className="space-y-2">
                                                <p><strong>Responsable du traitement :</strong> Konekte Group</p>
                                                <p><strong>Produit :</strong> Innovaport</p>
                                                <p><strong>Courriel :</strong>{' '}
                                                    <a
                                                        href="mailto:support@innovaport.dev"
                                                        className="text-white hover:text-blue-100 underline inline-flex items-center gap-1"
                                                    >
                                                        support@innovaport.dev
                                                        <Mail className="w-4 h-4" aria-hidden="true" />
                                                    </a>
                                                </p>
                                            </div>
                                            <p className="mt-4 text-blue-100 text-sm">
                                                Nous nous engageons à répondre à vos questions dans un délai de 30 jours.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 13 */}
                            <section id="section-13" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <ExternalLink className="w-6 h-6 text-blue-600" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            13. Ressources utiles
                                        </h2>

                                        <div className="space-y-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Autorités de protection des données :</h3>
                                                <div className="space-y-3">
                                                    <a
                                                        href="https://www.priv.gc.ca"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                                                    >
                                                        <Shield className="w-5 h-5 text-blue-600" aria-hidden="true" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">
                                                                Commissariat à la protection de la vie privée du Canada
                                                            </p>
                                                            <p className="text-sm text-gray-600">www.priv.gc.ca</p>
                                                        </div>
                                                        <ExternalLink className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                                    </a>
                                                    <a
                                                        href="https://www.cai.gouv.qc.ca"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                                                    >
                                                        <Shield className="w-5 h-5 text-green-600" aria-hidden="true" />
                                                        <div className="flex-1">
                                                            <p className="font-semibold text-gray-900 group-hover:text-[#1E3A8A] transition-colors">
                                                                Commission d'accès à l'information du Québec
                                                            </p>
                                                            <p className="text-sm text-gray-600">www.cai.gouv.qc.ca</p>
                                                        </div>
                                                        <ExternalLink className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                                    </a>
                                                </div>
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">Outils de gestion des cookies :</h3>
                                                <ul className="list-disc list-inside ml-4 space-y-2 text-gray-700">
                                                    <li>Extensions de navigateur pour bloquer les cookies tiers</li>
                                                    <li>Outils d'opt-out des services analytiques</li>
                                                    <li>Paramètres de confidentialité du navigateur</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Footer info */}
                            <div className="mt-12 pt-8 border-t-2 border-gray-300 bg-gray-50 rounded-lg p-6">
                                <div className="text-center space-y-2">
                                    <p className="text-sm text-gray-600">
                                        <strong>Dernière révision :</strong> Décembre 2024
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>Version :</strong> 1.0
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        <strong>Entité légale :</strong> Konekte Group
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Navigation bottom */}
                        <div className="mt-16 pt-8 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1E3A8A] transition-colors text-sm font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                                    {t('legal.backToHome')}
                                </Link>
                                <a
                                    href="#section-1"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        scrollToSection('section-1');
                                    }}
                                    className="text-gray-600 hover:text-[#1E3A8A] transition-colors text-sm font-medium"
                                >
                                    {t('legal.backToTop')} ↑
                                </a>
                            </div>
                        </div>
                    </main>
                </div>
            </div>

            {/* Footer avec branding Konekte Group */}
            <footer className="bg-gradient-to-r from-blue-50 to-green-50 border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 mt-12" role="contentinfo">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex flex-col items-center sm:items-start gap-2">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={200}
                                height={60}
                                className="h-12 sm:h-14 w-auto object-contain"
                                sizes="(max-width: 640px) 150px, 200px"
                            />
                            <p className="text-xs text-gray-600 text-center sm:text-left">
                                Innovaport - {language === 'fr' ? 'Un produit de' : 'A'} <strong className="text-[#1E3A8A]">Konekte Group</strong>
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                            <Link href="/legal/mentions-legales" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
                                {t('legal.mentionsLegales.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/politique-confidentialite" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
                                {t('legal.politiqueConfidentialite.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/conditions-utilisation" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
                                {t('legal.conditionsUtilisation.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/politique-cookies" className="text-[#1E3A8A] font-semibold">
                                {t('legal.politiqueCookies.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <span className="text-gray-500">© {currentYear} Innovaport. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

