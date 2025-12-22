'use client';

export const dynamic = 'force-dynamic';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, ExternalLink } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function MentionsLegalesPage() {
    const { t, language } = useTranslation();
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation Sticky */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" role="navigation" aria-label="Navigation principale">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
                            aria-label={t('legal.backToHome')}
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                            <span className="text-sm font-medium hidden sm:inline">{t('legal.backToHome')}</span>
                        </Link>
                        <Link href="/" aria-label="Innovaport">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={200}
                                height={60}
                                className="h-12 w-auto object-contain"
                                priority
                                sizes="200px"
                            />
                        </Link>
                        <LanguageSwitcher />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
                {/* Header */}
                <header className="mb-12 sm:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {t('legal.mentionsLegales.title')}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-500">
                        {t('legal.mentionsLegales.lastUpdated')}
                    </p>
                </header>

                {/* Content Sections */}
                <div className="prose prose-lg max-w-none">
                    {/* Section 1: Informations générales */}
                    <section id="section-1" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                1
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section1.title')}
                                </h2>
                                <div className="space-y-3 text-gray-700 leading-relaxed">
                                    <p>
                                        <strong className="text-gray-900">{t('legal.mentionsLegales.section1.siteName')}</strong> Innovaport
                                    </p>
                                    <p>
                                        <strong className="text-gray-900">{t('legal.mentionsLegales.section1.url')}</strong>{' '}
                                        <a
                                            href="https://www.innovaport.dev"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                                        >
                                            www.innovaport.dev
                                            <ExternalLink className="w-4 h-4" aria-hidden="true" />
                                        </a>
                                    </p>
                                    <p>
                                        <strong className="text-gray-900">{t('legal.mentionsLegales.section1.contact')}</strong>{' '}
                                        <a
                                            href="mailto:support@innovaport.dev"
                                            className="text-[#1E3A8A] hover:underline inline-flex items-center gap-1"
                                        >
                                            support@innovaport.dev
                                            <Mail className="w-4 h-4" aria-hidden="true" />
                                        </a>
                                    </p>
                                    <p className="mt-4">
                                        {t('legal.mentionsLegales.section1.publishedBy')} <strong className="text-gray-900">{t('legal.mentionsLegales.section1.konekteGroup')}</strong>, {t('legal.mentionsLegales.section1.establishedIn')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Directeur de publication */}
                    <section id="section-2" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                2
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section2.title')}
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {t('legal.mentionsLegales.section2.content')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Hébergement */}
                    <section id="section-3" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                3
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section3.title')}
                                </h2>
                                <div className="space-y-3 text-gray-700 leading-relaxed">
                                    <p>
                                        {t('legal.mentionsLegales.section3.content1')}
                                    </p>
                                    <p>
                                        {t('legal.mentionsLegales.section3.content2')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4: Propriété intellectuelle */}
                    <section id="section-4" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                4
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section4.title')}
                                </h2>
                                <div className="space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        {t('legal.mentionsLegales.section4.content1')}
                                    </p>
                                    <p>
                                        {t('legal.mentionsLegales.section4.content2')}
                                    </p>
                                    <p>
                                        {t('legal.mentionsLegales.section4.content3')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 5: Limitation de responsabilité */}
                    <section id="section-5" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                5
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section5.title')}
                                </h2>
                                <div className="space-y-4 text-gray-700 leading-relaxed">
                                    <p>
                                        {t('legal.mentionsLegales.section5.content1')}
                                    </p>
                                    <p>
                                        {t('legal.mentionsLegales.section5.content2')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 6: Liens hypertextes */}
                    <section id="section-6" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                6
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section6.title')}
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {t('legal.mentionsLegales.section6.content')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 7: Droit applicable */}
                    <section id="section-7" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                7
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section7.title')}
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    {t('legal.mentionsLegales.section7.content')}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 8: Contact */}
                    <section id="section-8" className="mb-12 sm:mb-16 scroll-mt-20">
                        <div className="flex items-start gap-4 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center text-sm font-bold">
                                8
                            </span>
                            <div className="flex-1">
                                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                                    {t('legal.mentionsLegales.section8.title')}
                                </h2>
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {t('legal.mentionsLegales.section8.content')}
                                </p>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6">
                                    <a
                                        href="mailto:support@innovaport.dev"
                                        className="text-[#1E3A8A] hover:text-[#1E40AF] font-semibold text-lg sm:text-xl inline-flex items-center gap-2 transition-colors"
                                    >
                                        <Mail className="w-5 h-5" aria-hidden="true" />
                                        support@innovaport.dev
                                    </a>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Back to top / Navigation */}
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
                            className="text-gray-600 hover:text-[#1E3A8A] transition-colors text-sm font-medium"
                        >
                            {t('legal.backToTop')} ↑
                        </a>
                    </div>
                </div>
            </main>

            {/* Footer Minimal */}
            <footer className="bg-gray-50 border-t border-gray-200 py-8 px-4 sm:px-6 lg:px-8" role="contentinfo">
                <div className="max-w-4xl mx-auto">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <Image
                                src="/innovaport-logo.png"
                                alt="InnovaPort Logo"
                                width={150}
                                height={45}
                                className="h-10 w-auto object-contain opacity-70"
                                sizes="150px"
                            />
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm">
                            <Link href="/legal/mentions-legales" className="text-[#1E3A8A] font-semibold">
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
