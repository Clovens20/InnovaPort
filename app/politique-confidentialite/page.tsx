'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Shield, Database, Target, Scale, Share2, Clock, Lock, UserCheck, Cookie, Globe, Users, FileText, AlertCircle, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function PolitiqueConfidentialitePage() {
    const { t, language } = useTranslation();
    const [activeSection, setActiveSection] = useState<string>('section-1');
    const currentYear = new Date().getFullYear();

    // Table des matières - traduite
    const tableOfContents = language === 'fr' ? [
        { id: 'section-1', title: 'Responsable du traitement', icon: Shield },
        { id: 'section-2', title: 'Données collectées', icon: Database },
        { id: 'section-3', title: 'Utilisation des données', icon: Target },
        { id: 'section-4', title: 'Partage des données', icon: Share2 },
        { id: 'section-5', title: 'Partage des données', icon: Share2 },
        { id: 'section-6', title: 'Durée de conservation', icon: Clock },
        { id: 'section-7', title: 'Sécurité des données', icon: Lock },
        { id: 'section-8', title: 'Vos droits', icon: UserCheck },
        { id: 'section-9', title: 'Cookies', icon: Cookie },
        { id: 'section-10', title: 'Transferts internationaux', icon: Globe },
        { id: 'section-11', title: 'Mineurs', icon: Users },
        { id: 'section-12', title: 'Modifications', icon: FileText },
        { id: 'section-13', title: 'Réclamations', icon: AlertCircle },
        { id: 'section-14', title: 'Contact', icon: MessageCircle },
    ] : [
        { id: 'section-1', title: 'Data Controller', icon: Shield },
        { id: 'section-2', title: 'Data Collected', icon: Database },
        { id: 'section-3', title: 'Use of Data', icon: Target },
        { id: 'section-4', title: 'Data Sharing', icon: Share2 },
        { id: 'section-5', title: 'Data Sharing', icon: Share2 },
        { id: 'section-6', title: 'Retention Period', icon: Clock },
        { id: 'section-7', title: 'Data Security', icon: Lock },
        { id: 'section-8', title: 'Your Rights', icon: UserCheck },
        { id: 'section-9', title: 'Cookies', icon: Cookie },
        { id: 'section-10', title: 'International Transfers', icon: Globe },
        { id: 'section-11', title: 'Minors', icon: Users },
        { id: 'section-12', title: 'Modifications', icon: FileText },
        { id: 'section-13', title: 'Complaints', icon: AlertCircle },
        { id: 'section-14', title: 'Contact', icon: MessageCircle },
    ];

    // Détection de la section active au scroll
    useEffect(() => {
        const handleScroll = () => {
            const sections = tableOfContents.map(item => {
                const element = document.getElementById(item.id);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return {
                        id: item.id,
                        top: rect.top,
                        bottom: rect.bottom,
                    };
                }
                return null;
            }).filter(Boolean);

            const scrollPosition = window.scrollY + 200; // Offset pour la navigation sticky

            for (let i = sections.length - 1; i >= 0; i--) {
                if (sections[i] && scrollPosition >= sections[i]!.top) {
                    setActiveSection(sections[i]!.id);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Appel initial

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // Offset pour la navigation sticky
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Sticky */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" role="navigation" aria-label="Navigation principale">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
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
                    {/* Table des matières - Sticky sur desktop */}
                    <aside className="lg:w-64 lg:flex-shrink-0">
                        <div className="lg:sticky lg:top-24">
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
                                    {language === 'fr' ? 'Table des matières' : 'Table of Contents'}
                                </h2>
                                <nav className="space-y-2" aria-label="Table des matières">
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
                                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
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
                        {/* Header */}
                        <header className="mb-8 sm:mb-12">
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {t('legal.politiqueConfidentialite.title')}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500">
                                {t('legal.politiqueConfidentialite.lastUpdated')}
                            </p>
                            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                                    {t('legal.politiqueConfidentialite.intro')}
                                </p>
                            </div>
                        </header>

                        {/* Sections */}
                        <div className="space-y-12 sm:space-y-16">
                            {/* Section 1 */}
                            <section id="section-1" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Shield className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section1.title')}
                                        </h2>
                                        <div className="space-y-3 text-gray-700 leading-relaxed">
                                            <p>
                                                {t('legal.politiqueConfidentialite.section1.content1')}
                                            </p>
                                            <p>
                                                <strong className="text-gray-900">{t('legal.politiqueConfidentialite.section1.contact')}</strong>{' '}
                                                <a
                                                    href="mailto:support@innovaport.dev"
                                                    className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                                                >
                                                    support@innovaport.dev
                                                    <Mail className="w-4 h-4" aria-hidden="true" />
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section id="section-2" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Database className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                                            {t('legal.politiqueConfidentialite.section2.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-6">
                                            {t('legal.politiqueConfidentialite.section2.content1')}
                                        </p>

                                        <div className="space-y-6">
                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                    2.1 Données fournies directement par vous
                                                </h3>
                                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                                    <li>Nom et prénom</li>
                                                    <li>Adresse courriel</li>
                                                    <li>Informations de contact professionnelles</li>
                                                    <li>Contenu des messages que vous nous envoyez</li>
                                                    <li>Toute autre information que vous choisissez de nous fournir</li>
                                                </ul>
                                            </div>

                                            <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                <h3 className="text-xl font-bold text-gray-900 mb-4">
                                                    2.2 Données collectées automatiquement
                                                </h3>
                                                <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                                    <li>Adresse IP</li>
                                                    <li>Type de navigateur et version</li>
                                                    <li>Pages visitées et durée de visite</li>
                                                    <li>Données de navigation (cookies, voir notre Politique de Cookies)</li>
                                                    <li>Données techniques nécessaires au bon fonctionnement du site</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="section-3" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Target className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section3.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {t('legal.politiqueConfidentialite.section3.content1')}
                                        </p>
                                        <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                            <li>{t('legal.politiqueConfidentialite.section3.purpose1')}</li>
                                            <li>{t('legal.politiqueConfidentialite.section3.purpose2')}</li>
                                            <li>{t('legal.politiqueConfidentialite.section3.purpose3')}</li>
                                            <li>{t('legal.politiqueConfidentialite.section3.purpose4')}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="section-4" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Scale className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {language === 'fr' ? '4. Base légale du traitement' : '4. Legal Basis for Processing'}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {language === 'fr' 
                                                ? 'Le traitement de vos données personnelles repose sur :'
                                                : 'The processing of your personal data is based on:'}
                                        </p>
                                        <ul className="space-y-2 text-gray-700 list-disc list-inside">
                                            <li>{language === 'fr' ? 'Votre consentement explicite' : 'Your explicit consent'}</li>
                                            <li>{language === 'fr' ? 'L\'exécution d\'un contrat ou de mesures précontractuelles' : 'The execution of a contract or pre-contractual measures'}</li>
                                            <li>{language === 'fr' ? 'Le respect d\'obligations légales' : 'Compliance with legal obligations'}</li>
                                            <li>{language === 'fr' ? 'Nos intérêts légitimes (amélioration de nos services, sécurité)' : 'Our legitimate interests (improving our services, security)'}</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="section-5" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Share2 className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section5.title')}
                                        </h2>
                                        <div className="space-y-4 text-gray-700 leading-relaxed">
                                            <p className="font-semibold text-gray-900">
                                                {t('legal.politiqueConfidentialite.section5.content1')}
                                            </p>
                                            <ul className="space-y-2 list-disc list-inside ml-4">
                                                <li><strong>{language === 'fr' ? 'Prestataires de services' : 'Service providers'}</strong> : {t('legal.politiqueConfidentialite.section5.share1')}</li>
                                                <li><strong>{language === 'fr' ? 'Autorités légales' : 'Legal authorities'}</strong> : {t('legal.politiqueConfidentialite.section5.share2')}</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="section-6" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Clock className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section6.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {t('legal.politiqueConfidentialite.section6.content1')}
                                        </p>
                                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-3">
                                            <p className="text-gray-700">
                                                <strong className="text-gray-900">{t('legal.politiqueConfidentialite.section6.contactData')}</strong> {t('legal.politiqueConfidentialite.section6.contactDataDesc')}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong className="text-gray-900">{t('legal.politiqueConfidentialite.section6.billingData')}</strong> {t('legal.politiqueConfidentialite.section6.billingDataDesc')}
                                            </p>
                                            <p className="text-gray-700">
                                                <strong className="text-gray-900">{t('legal.politiqueConfidentialite.section6.navigationData')}</strong> {t('legal.politiqueConfidentialite.section6.navigationDataDesc')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section id="section-7" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Lock className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section7.title')}
                                        </h2>
                                        <div className="space-y-4 text-gray-700 leading-relaxed">
                                            <p>
                                                {t('legal.politiqueConfidentialite.section7.content1')}
                                            </p>
                                            <ul className="space-y-2 list-disc list-inside ml-4">
                                                <li>{t('legal.politiqueConfidentialite.section7.protection1')}</li>
                                                <li>{t('legal.politiqueConfidentialite.section7.protection2')}</li>
                                                <li>{t('legal.politiqueConfidentialite.section7.protection3')}</li>
                                                <li>{t('legal.politiqueConfidentialite.section7.protection4')}</li>
                                            </ul>
                                            <p>
                                                {t('legal.politiqueConfidentialite.section7.protectionMeasures')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 8 - Vos droits (avec cards) */}
                            <section id="section-8" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <UserCheck className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section8.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-6">
                                            {t('legal.politiqueConfidentialite.section8.content1')}
                                        </p>

                                        {/* Cards des droits */}
                                        <div className="grid sm:grid-cols-2 gap-4 mb-6">
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-5 border border-blue-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('legal.politiqueConfidentialite.section8.right1Title')}</h3>
                                                <p className="text-sm text-gray-700">{t('legal.politiqueConfidentialite.section8.right1Desc')}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-5 border border-green-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('legal.politiqueConfidentialite.section8.right2Title')}</h3>
                                                <p className="text-sm text-gray-700">{t('legal.politiqueConfidentialite.section8.right2Desc')}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-5 border border-red-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('legal.politiqueConfidentialite.section8.right3Title')}</h3>
                                                <p className="text-sm text-gray-700">{t('legal.politiqueConfidentialite.section8.right3Desc')}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-5 border border-purple-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('legal.politiqueConfidentialite.section8.right4Title')}</h3>
                                                <p className="text-sm text-gray-700">{t('legal.politiqueConfidentialite.section8.right4Desc')}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-5 border border-orange-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('legal.politiqueConfidentialite.section8.right5Title')}</h3>
                                                <p className="text-sm text-gray-700">{t('legal.politiqueConfidentialite.section8.right5Desc')}</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-5 border border-indigo-200">
                                                <h3 className="text-lg font-bold text-gray-900 mb-2">{t('legal.politiqueConfidentialite.section8.right6Title')}</h3>
                                                <p className="text-sm text-gray-700">{t('legal.politiqueConfidentialite.section8.right6Desc')}</p>
                                            </div>
                                        </div>

                                        <div className="bg-[#1E3A8A] rounded-lg p-6 text-white">
                                            <h3 className="text-lg font-bold mb-2">{t('legal.politiqueConfidentialite.section8.exerciseRights')}</h3>
                                            <p className="mb-4 text-blue-100">
                                                {t('legal.politiqueConfidentialite.section8.exerciseRightsDesc')}
                                            </p>
                                            <a
                                                href="mailto:support@innovaport.dev"
                                                className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-100 transition-colors"
                                            >
                                                <Mail className="w-5 h-5" aria-hidden="true" />
                                                support@innovaport.dev
                                            </a>
                                            <p className="mt-4 text-sm text-blue-100">
                                                {t('legal.politiqueConfidentialite.section8.responseTime')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 9 */}
                            <section id="section-9" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Cookie className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section9.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            {t('legal.politiqueConfidentialite.section9.content1')}{' '}
                                            <Link href="/legal/politique-cookies" className="text-[#1E3A8A] hover:underline font-semibold">
                                                {t('legal.politiqueConfidentialite.section9.cookiePolicy')}
                                            </Link>.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 10 */}
                            <section id="section-10" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Globe className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section10.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            {t('legal.politiqueConfidentialite.section10.content1')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 11 */}
                            <section id="section-11" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section11.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            {t('legal.politiqueConfidentialite.section11.content1')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 12 */}
                            <section id="section-12" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <FileText className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section12.title')}
                                        </h2>
                                        <div className="space-y-3 text-gray-700 leading-relaxed">
                                            <p>
                                                {t('legal.politiqueConfidentialite.section12.content1')}
                                            </p>
                                            <p>
                                                {t('legal.politiqueConfidentialite.section12.content2')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 13 */}
                            <section id="section-13" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section13.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            {t('legal.politiqueConfidentialite.section13.content1')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 14 */}
                            <section id="section-14" className="scroll-mt-24">
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="flex-shrink-0 w-12 h-12 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center">
                                        <MessageCircle className="w-6 h-6" aria-hidden="true" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                            {t('legal.politiqueConfidentialite.section14.title')}
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed mb-4">
                                            {t('legal.politiqueConfidentialite.section14.content1')}
                                        </p>
                                        <div className="bg-[#1E3A8A] rounded-lg p-6 text-white">
                                            <p className="font-semibold mb-2">{t('legal.politiqueConfidentialite.section14.email')}</p>
                                            <a
                                                href="mailto:support@innovaport.dev"
                                                className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-100 transition-colors text-lg"
                                            >
                                                <Mail className="w-5 h-5" aria-hidden="true" />
                                                support@innovaport.dev
                                            </a>
                                            <p className="mt-4 text-blue-100">
                                                {t('legal.politiqueConfidentialite.section14.commitment')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>
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

            {/* Footer avec liens vers autres pages légales */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8 mt-12" role="contentinfo">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={200}
                                height={60}
                                className="h-12 sm:h-14 w-auto object-contain"
                                sizes="(max-width: 640px) 150px, 200px"
                            />
                        </div>
                            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                            <Link href="/legal/mentions-legales" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
                                {t('legal.mentionsLegales.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/politique-confidentialite" className="text-[#1E3A8A] font-semibold">
                                {t('legal.politiqueConfidentialite.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/conditions-utilisation" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
                                {t('legal.conditionsUtilisation.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/politique-cookies" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
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

