'use client';

export const dynamic = 'force-dynamic';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, FileText, CheckCircle, AlertTriangle, Scale, Shield, Lock, ExternalLink, ChevronDown, ChevronUp, ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function ConditionsUtilisationPage() {
    const { t, language } = useTranslation();
    const [activeSection, setActiveSection] = useState<string>('section-1');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [readingProgress, setReadingProgress] = useState(0);
    const currentYear = new Date().getFullYear();

    // Table des matières
    const tableOfContents = [
        { id: 'section-1', title: 'Définitions', icon: FileText },
        { id: 'section-2', title: 'Acceptation des conditions', icon: CheckCircle },
        { id: 'section-3', title: 'Accès au site', icon: Shield },
        { id: 'section-4', title: 'Utilisation du site', icon: Lock },
        { id: 'section-5', title: 'Propriété intellectuelle', icon: FileText },
        { id: 'section-6', title: 'Contenu utilisateur', icon: FileText },
        { id: 'section-7', title: 'Liens externes', icon: ExternalLink },
        { id: 'section-8', title: 'Limitation de responsabilité', icon: AlertTriangle },
        { id: 'section-9', title: 'Indemnisation', icon: Shield },
        { id: 'section-10', title: 'Résiliation', icon: AlertTriangle },
        { id: 'section-11', title: 'Confidentialité', icon: Lock },
        { id: 'section-12', title: 'Droit applicable', icon: Scale },
        { id: 'section-13', title: 'Dispositions générales', icon: FileText },
        { id: 'section-14', title: 'Contact', icon: Mail },
    ];

    // Détection de la section active et progression de lecture
    useEffect(() => {
        const handleScroll = () => {
            // Progression de lecture
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight - windowHeight;
            const scrollTop = window.scrollY;
            const progress = (scrollTop / documentHeight) * 100;
            setReadingProgress(Math.min(100, Math.max(0, progress)));

            // Bouton scroll to top
            setShowScrollTop(scrollTop > 300);

            // Section active
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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Barre de progression de lecture */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-gray-200 z-50">
                <div
                    className="h-full bg-[#1E3A8A] transition-all duration-150"
                    style={{ width: `${readingProgress}%` }}
                    role="progressbar"
                    aria-valuenow={readingProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>

            {/* Navigation Sticky */}
            <nav className="sticky top-1 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm" role="navigation" aria-label="Navigation principale">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Link href="/" className="hover:text-[#1E3A8A] transition-colors">
                                {language === 'fr' ? 'Accueil' : 'Home'}
                            </Link>
                            <span>/</span>
                            <span className="text-gray-900 font-medium">{t('legal.conditionsUtilisation.title')}</span>
                        </div>

                        <Link href="/" aria-label="Innovaport" className="hidden sm:block flex-shrink-0">
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

                        <Link
                            href="/"
                            className="sm:hidden flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors"
                            aria-label={t('legal.backToHome')}
                        >
                            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Table des matières - Sticky sur desktop, Dropdown sur mobile */}
                    <aside className="lg:w-64 lg:flex-shrink-0">
                        {/* Mobile: Dropdown */}
                        <div className="lg:hidden mb-6">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200 flex items-center justify-between hover:bg-gray-100 transition-colors"
                                aria-expanded={mobileMenuOpen}
                                aria-label="Ouvrir la table des matières"
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
                                    <nav className="space-y-1" aria-label="Table des matières">
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
                            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#1E3A8A]" aria-hidden="true" />
                                    Table des matières
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
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 font-sans">
                                {t('legal.conditionsUtilisation.title')}
                            </h1>
                            <p className="text-sm sm:text-base text-gray-500 mb-6">
                                {t('legal.conditionsUtilisation.lastUpdated')}
                            </p>
                            <div className="bg-blue-50 border-l-4 border-[#1E3A8A] p-4 rounded-r-lg">
                                <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-serif">
                                    {t('legal.conditionsUtilisation.intro')}
                                </p>
                            </div>
                        </header>

                        {/* Sections */}
                        <div className="space-y-12 sm:space-y-16">
                            {/* Section 1 */}
                            <section id="section-1" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        1. Définitions
                                    </h2>
                                    <div className="space-y-3 text-gray-700 leading-relaxed font-serif">
                                        <p>
                                            <strong className="text-gray-900">« Site »</strong> désigne le site web accessible à l'adresse www.innovaport.dev et l'ensemble de ses pages.
                                        </p>
                                        <p>
                                            <strong className="text-gray-900">« Utilisateur »</strong> désigne toute personne physique ou morale qui accède et utilise le Site.
                                        </p>
                                        <p>
                                            <strong className="text-gray-900">« Services »</strong> désigne l'ensemble des services, contenus et fonctionnalités proposés par Innovaport via le Site.
                                        </p>
                                        <p>
                                            <strong className="text-gray-900">« Nous », « Notre »</strong> désigne Innovaport, l'éditeur du Site.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2 */}
                            <section id="section-2" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-sans">
                                        {t('legal.conditionsUtilisation.section1.title')}
                                    </h2>
                                    <div className="space-y-4 text-gray-700 leading-relaxed font-serif">
                                        <p>
                                            {t('legal.conditionsUtilisation.section1.content1')}
                                        </p>
                                        <p>
                                            {t('legal.conditionsUtilisation.section6.content1')}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 3 */}
                            <section id="section-3" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        3. Accès au site
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                3.1 Disponibilité
                                            </h3>
                                            <div className="space-y-3 text-gray-700 leading-relaxed font-serif">
                                                <p>
                                                    Nous nous efforçons de maintenir le Site accessible 24h/24 et 7j/7. Toutefois, nous ne pouvons garantir une disponibilité continue et ininterrompue du Site.
                                                </p>
                                                <p>
                                                    L'accès au Site peut être temporairement suspendu pour :
                                                </p>
                                                <ul className="list-disc list-inside ml-4 space-y-1">
                                                    <li>Maintenance technique</li>
                                                    <li>Mises à jour</li>
                                                    <li>Interventions d'urgence</li>
                                                    <li>Cas de force majeure</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                3.2 Responsabilité d'accès
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                L'Utilisateur est responsable de :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Son équipement informatique et de connexion Internet</li>
                                                <li>Les coûts de connexion et d'accès au Site</li>
                                                <li>La sécurité de ses identifiants (le cas échéant)</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 4 */}
                            <section id="section-4" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        {t('legal.conditionsUtilisation.section2.title')}
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                4.1 Utilisation autorisée
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Vous vous engagez à utiliser le Site de manière légale et conformément aux présentes conditions. Vous ne devez pas :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Utiliser le Site à des fins illégales ou frauduleuses</li>
                                                <li>Tenter d'accéder à des zones non autorisées du Site</li>
                                                <li>Introduire des virus, malwares ou codes malveillants</li>
                                                <li>Collecter des données personnelles d'autres utilisateurs</li>
                                                <li>Effectuer du scraping ou de l'extraction automatisée de contenu</li>
                                                <li>Surcharger ou perturber le fonctionnement du Site</li>
                                                <li>Usurper l'identité d'une autre personne ou entité</li>
                                                <li>Transmettre du contenu offensant, diffamatoire ou illégal</li>
                                            </ul>
                                        </div>

                                        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                4.2 Compte utilisateur (le cas échéant)
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Si vous créez un compte sur le Site :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Vous devez fournir des informations exactes et à jour</li>
                                                <li>Vous êtes responsable de la confidentialité de vos identifiants</li>
                                                <li>Vous êtes responsable de toute activité effectuée via votre compte</li>
                                                <li>Vous devez nous informer immédiatement de toute utilisation non autorisée</li>
                                                <li>Nous nous réservons le droit de suspendre ou supprimer votre compte en cas de violation</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 5 */}
                            <section id="section-5" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        {t('legal.conditionsUtilisation.section4.title')}
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                5.1 Droits d'Innovaport
                                            </h3>
                                            <div className="space-y-3 text-gray-700 leading-relaxed font-serif">
                                                <p>
                                                    L'ensemble du contenu du Site (textes, images, graphiques, logos, icônes, sons, logiciels, structure, design) est protégé par les droits d'auteur canadiens et internationaux.
                                                </p>
                                                <p>
                                                    Tous les droits de propriété intellectuelle sont la propriété exclusive d'Innovaport ou de ses concédants de licence.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-5">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                5.2 Licence d'utilisation limitée
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Nous vous accordons une licence limitée, non exclusive, non transférable et révocable pour :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif mb-4">
                                                <li>Accéder au Site à des fins personnelles ou professionnelles légitimes</li>
                                                <li>Consulter et télécharger le contenu pour un usage personnel uniquement</li>
                                            </ul>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Cette licence ne vous permet pas de :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Reproduire, distribuer ou modifier le contenu</li>
                                                <li>Utiliser le contenu à des fins commerciales sans autorisation</li>
                                                <li>Retirer les mentions de droits d'auteur ou propriétaires</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                5.3 Marques
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Tous les noms de marques, logos et marques de service affichés sur le Site sont des marques déposées ou non déposées d'Innovaport ou de tiers. Aucune licence ou droit n'est accordé concernant ces marques.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 6 */}
                            <section id="section-6" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        6. Contenu utilisateur
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                6.1 Responsabilité
                                            </h3>
                                            <div className="space-y-3 text-gray-700 leading-relaxed font-serif">
                                                <p>
                                                    Si le Site permet aux utilisateurs de publier du contenu (commentaires, messages, fichiers), vous restez responsable de ce contenu.
                                                </p>
                                                <p>
                                                    Vous garantissez que votre contenu :
                                                </p>
                                                <ul className="list-disc list-inside ml-4 space-y-1">
                                                    <li>Ne viole aucun droit de propriété intellectuelle</li>
                                                    <li>N'est pas diffamatoire, offensant ou illégal</li>
                                                    <li>Ne contient pas de virus ou codes malveillants</li>
                                                    <li>Respecte la vie privée des tiers</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                6.2 Licence accordée à Innovaport
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                En publiant du contenu sur le Site, vous accordez à Innovaport une licence mondiale, gratuite, non exclusive pour utiliser, reproduire, modifier et afficher ce contenu dans le cadre de la fourniture de nos Services.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                6.3 Modération
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Nous nous réservons le droit de modérer, refuser ou supprimer tout contenu utilisateur qui violerait ces conditions ou serait inapproprié, sans préavis ni responsabilité.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 7 */}
                            <section id="section-7" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-sans">
                                        7. Liens externes
                                    </h2>
                                    <div className="space-y-3 text-gray-700 leading-relaxed font-serif">
                                        <p>
                                            Le Site peut contenir des liens vers des sites web tiers. Ces liens sont fournis uniquement pour votre commodité.
                                        </p>
                                        <p>
                                            Nous n'exerçons aucun contrôle sur ces sites et déclinons toute responsabilité quant à :
                                        </p>
                                        <ul className="list-disc list-inside ml-4 space-y-1">
                                            <li>Leur contenu</li>
                                            <li>Leur disponibilité</li>
                                            <li>Leurs pratiques de confidentialité</li>
                                            <li>Les dommages résultant de leur utilisation</li>
                                        </ul>
                                        <p>
                                            L'inclusion d'un lien n'implique pas notre approbation du site lié.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 8 - Limitation de responsabilité (mise en évidence) */}
                            <section id="section-8" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        8. Limitation de responsabilité
                                    </h2>

                                    <div className="space-y-6">
                                        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                8.1 Contenu du site
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Le contenu du Site est fourni "tel quel" et "selon disponibilité". Nous ne garantissons pas :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>L'exactitude, l'exhaustivité ou l'actualité du contenu</li>
                                                <li>L'absence d'erreurs ou d'interruptions</li>
                                                <li>L'adéquation à un usage particulier</li>
                                            </ul>
                                        </div>

                                        <div className="bg-orange-50 border-l-4 border-orange-500 rounded-lg p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                8.2 Exclusion de responsabilité
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Dans toute la mesure permise par la loi applicable, Innovaport ne sera pas responsable de :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Dommages directs, indirects, accessoires ou consécutifs</li>
                                                <li>Perte de profits, de données ou d'opportunités commerciales</li>
                                                <li>Interruption d'activité</li>
                                                <li>Dommages résultant de l'utilisation ou de l'impossibilité d'utiliser le Site</li>
                                                <li>Dommages causés par des virus ou erreurs</li>
                                                <li>Dommages résultant de l'accès à des sites tiers</li>
                                            </ul>
                                        </div>

                                        <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                8.3 Limitation monétaire
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Dans les juridictions où une limitation totale de responsabilité n'est pas permise, notre responsabilité sera limitée au montant maximum autorisé par la loi.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 9 */}
                            <section id="section-9" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-sans">
                                        9. Indemnisation
                                    </h2>
                                    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                                        <p className="text-gray-700 leading-relaxed font-serif">
                                            Vous acceptez d'indemniser et de dégager Innovaport de toute responsabilité concernant :
                                        </p>
                                        <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif mt-3">
                                            <li>Votre utilisation du Site</li>
                                            <li>Votre violation de ces conditions</li>
                                            <li>Votre violation des droits de tiers</li>
                                            <li>Le contenu que vous publiez sur le Site</li>
                                        </ul>
                                    </div>
                                </div>
                            </section>

                            {/* Section 10 */}
                            <section id="section-10" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        10. Résiliation
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                10.1 Par l'utilisateur
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Vous pouvez cesser d'utiliser le Site à tout moment.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                10.2 Par Innovaport
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                Nous nous réservons le droit de suspendre ou de résilier votre accès au Site à tout moment, sans préavis, si :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Vous violez ces conditions</li>
                                                <li>Votre utilisation pose des problèmes légaux ou de sécurité</li>
                                                <li>Nous décidons de cesser d'exploiter le Site</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                10.3 Effets de la résiliation
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif mb-3">
                                                En cas de résiliation :
                                            </p>
                                            <ul className="list-disc list-inside ml-4 space-y-1 text-gray-700 font-serif">
                                                <li>Votre droit d'accès au Site cesse immédiatement</li>
                                                <li>Les dispositions qui, par nature, doivent survivre, restent en vigueur</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 11 */}
                            <section id="section-11" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-sans">
                                        11. Confidentialité
                                    </h2>
                                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-lg p-6">
                                        <p className="text-gray-700 leading-relaxed font-serif">
                                            Votre utilisation du Site est également régie par notre{' '}
                                            <Link href="/politique-confidentialite" className="text-[#1E3A8A] hover:underline font-semibold">
                                                Politique de Confidentialité
                                            </Link>
                                            . Veuillez la consulter pour comprendre comment nous collectons et utilisons vos données personnelles.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 12 */}
                            <section id="section-12" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        12. Droit applicable et juridiction
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                12.1 Loi applicable
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Les présentes conditions d'utilisation sont régies et interprétées conformément aux lois en vigueur au Québec et au Canada, sans égard aux principes de conflits de lois.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                12.2 Juridiction compétente
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Tout litige découlant de ou lié à l'utilisation du Site sera soumis à la compétence exclusive des tribunaux du Québec, Canada.
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 border-l-4 border-gray-400 rounded-lg p-6">
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                12.3 Résolution des litiges
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                En cas de litige, nous vous encourageons à nous contacter d'abord pour tenter de résoudre le problème à l'amiable avant d'engager toute procédure judiciaire.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 13 */}
                            <section id="section-13" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 font-sans">
                                        13. Dispositions générales
                                    </h2>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                13.1 Intégralité de l'accord
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Ces conditions constituent l'intégralité de l'accord entre vous et Innovaport concernant l'utilisation du Site.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                13.2 Divisibilité
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Si une disposition de ces conditions est jugée invalide ou inapplicable, les autres dispositions restent pleinement en vigueur.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                13.3 Non-renonciation
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Le fait pour Innovaport de ne pas exercer un droit prévu par ces conditions ne constitue pas une renonciation à ce droit.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                13.4 Cession
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Vous ne pouvez pas céder vos droits ou obligations en vertu de ces conditions sans notre consentement écrit préalable. Nous pouvons céder nos droits à tout moment.
                                            </p>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 font-sans">
                                                13.5 Force majeure
                                            </h3>
                                            <p className="text-gray-700 leading-relaxed font-serif">
                                                Innovaport ne sera pas tenu responsable de tout retard ou défaut d'exécution résultant de circonstances indépendantes de sa volonté raisonnable.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Section 14 */}
                            <section id="section-14" className="scroll-mt-24">
                                <div className="mb-6">
                                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 font-sans">
                                        14. Contact
                                    </h2>
                                    <div className="bg-[#1E3A8A] rounded-lg p-6 text-white">
                                        <p className="mb-4 text-blue-100 font-serif">
                                            Pour toute question concernant ces conditions d'utilisation :
                                        </p>
                                        <p className="font-semibold mb-2">Courriel :</p>
                                        <a
                                            href="mailto:support@innovaport.dev"
                                            className="inline-flex items-center gap-2 text-white font-semibold hover:text-blue-100 transition-colors text-lg"
                                        >
                                            <Mail className="w-5 h-5" aria-hidden="true" />
                                            support@innovaport.dev
                                        </a>
                                        <p className="mt-4 text-blue-100 font-serif">
                                            Nous nous engageons à répondre à vos questions dans les meilleurs délais.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Acceptation */}
                            <div className="mt-12 pt-8 border-t-2 border-gray-300 bg-gray-50 rounded-lg p-6">
                                <p className="text-center text-gray-700 font-serif font-semibold text-lg">
                                    En utilisant le Site, vous reconnaissez avoir lu, compris et accepté les présentes conditions d'utilisation.
                                </p>
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

            {/* Bouton Scroll to Top flottant */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 bg-[#1E3A8A] text-white p-4 rounded-full shadow-lg hover:bg-[#1E40AF] transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
                    aria-label={t('legal.backToTop')}
                >
                    <ArrowUp className="w-6 h-6" aria-hidden="true" />
                </button>
            )}

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
                            <Link href="/legal/politique-confidentialite" className="text-gray-600 hover:text-[#1E3A8A] transition-colors">
                                {t('legal.politiqueConfidentialite.title')}
                            </Link>
                            <span className="text-gray-300">•</span>
                            <Link href="/legal/conditions-utilisation" className="text-[#1E3A8A] font-semibold">
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

