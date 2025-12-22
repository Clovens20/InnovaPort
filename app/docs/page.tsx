'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Book, Search, FileText, Code, Zap, Shield, Users } from "lucide-react";
import { Footer } from "@/app/_components/footer";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function DocumentationPage() {
    const { t, language } = useTranslation();

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
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

            {/* Hero Section */}
            <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-12 sm:py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1E3A8A] rounded-full mb-6">
                            <Book className="w-8 h-8 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {t('docs.title')}
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            {t('docs.subtitle')}
                        </p>
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder={t('docs.searchPlaceholder')}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid md:grid-cols-3 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:col-span-1">
                        <div className="sticky top-24">
                            <nav className="space-y-2">
                                <a href="#getting-started" className="block px-4 py-2 text-sm font-medium text-gray-900 bg-blue-50 rounded-lg">
                                    {t('docs.gettingStarted')}
                                </a>
                                <a href="#portfolios" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {t('docs.portfolios')}
                                </a>
                                <a href="#quotes" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {t('docs.quotes')}
                                </a>
                                <a href="#projects" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {t('docs.projects')}
                                </a>
                                <a href="#api" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {t('docs.api')}
                                </a>
                                <a href="/faq" className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                                    {t('docs.faq')}
                                </a>
                            </nav>
                        </div>
                    </aside>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-12">
                        {/* Getting Started */}
                        <section id="getting-started" className="scroll-mt-24">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Zap className="w-8 h-8 text-[#1E3A8A]" aria-hidden="true" />
                                {t('docs.gettingStartedContent.title')}
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {t('docs.gettingStartedContent.intro')}
                                </p>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t('docs.gettingStartedContent.step1.title')}</h3>
                                <p className="text-gray-700 mb-4">
                                    {t('docs.gettingStartedContent.step1.content')}
                                </p>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t('docs.gettingStartedContent.step2.title')}</h3>
                                <p className="text-gray-700 mb-4">
                                    {t('docs.gettingStartedContent.step2.content')}
                                </p>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t('docs.gettingStartedContent.step3.title')}</h3>
                                <p className="text-gray-700 mb-4">
                                    {t('docs.gettingStartedContent.step3.content')}
                                </p>
                            </div>
                        </section>

                        {/* Portfolios */}
                        <section id="portfolios" className="scroll-mt-24">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <FileText className="w-8 h-8 text-[#1E3A8A]" aria-hidden="true" />
                                {t('docs.portfoliosContent.title')}
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {t('docs.portfoliosContent.intro')}
                                </p>
                                <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">{t('docs.portfoliosContent.templates')}</h3>
                                <p className="text-gray-700 mb-4">
                                    {t('docs.portfoliosContent.templatesDesc')}
                                </p>
                            </div>
                        </section>

                        {/* Quotes */}
                        <section id="quotes" className="scroll-mt-24">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Code className="w-8 h-8 text-[#1E3A8A]" aria-hidden="true" />
                                {t('docs.quotesContent.title')}
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {t('docs.quotesContent.intro')}
                                </p>
                            </div>
                        </section>

                        {/* Projects */}
                        <section id="projects" className="scroll-mt-24">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <FileText className="w-8 h-8 text-[#1E3A8A]" aria-hidden="true" />
                                {t('docs.projectsContent.title')}
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {t('docs.projectsContent.intro')}
                                </p>
                            </div>
                        </section>

                        {/* API */}
                        <section id="api" className="scroll-mt-24">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Code className="w-8 h-8 text-[#1E3A8A]" aria-hidden="true" />
                                {t('docs.apiContent.title')}
                            </h2>
                            <div className="prose prose-lg max-w-none">
                                <p className="text-gray-700 leading-relaxed mb-4">
                                    {t('docs.apiContent.intro')}
                                </p>
                            </div>
                        </section>

                        {/* FAQ - Link to dedicated FAQ page */}
                        <section id="faq" className="scroll-mt-24">
                            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <Users className="w-8 h-8 text-[#1E3A8A]" aria-hidden="true" />
                                {t('docs.faq')}
                            </h2>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                                <p className="text-gray-700 mb-6">
                                    {language === 'fr'
                                        ? 'Consultez notre FAQ complète avec plus de 20 questions et réponses détaillées.'
                                        : 'Check out our complete FAQ with over 20 detailed questions and answers.'
                                    }
                                </p>
                                <Link
                                    href="/faq"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#1E40AF] transition-colors"
                                >
                                    {language === 'fr' ? 'Voir toutes les questions' : 'View all questions'}
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
