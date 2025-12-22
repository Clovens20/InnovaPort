'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, HelpCircle, Mail, MessageSquare, Book, Search } from "lucide-react";
import { Footer } from "@/app/_components/footer";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default function SupportPage() {
    const { t, language } = useTranslation();

    const supportCategories = [
        {
            icon: Book,
            title: t('support.documentation'),
            description: t('support.documentationDesc'),
            href: '/docs',
            color: 'blue',
        },
        {
            icon: MessageSquare,
            title: t('support.faq'),
            description: t('support.faqDesc'),
            href: '/faq',
            color: 'green',
        },
        {
            icon: Mail,
            title: t('support.contact'),
            description: t('support.contactDesc'),
            href: '/contact',
            color: 'purple',
        },
    ];


    const colorClasses = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        purple: 'bg-purple-100 text-purple-600',
    };

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
                            <HelpCircle className="w-8 h-8 text-white" aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            {t('support.title')}
                        </h1>
                        <p className="text-lg text-gray-600 mb-8">
                            {t('support.subtitle')}
                        </p>
                        {/* Search Bar */}
                        <div className="max-w-2xl mx-auto">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                                <input
                                    type="text"
                                    placeholder={t('support.searchPlaceholder')}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Support Categories */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid md:grid-cols-3 gap-6">
                    {supportCategories.map((category) => {
                        const Icon = category.icon;
                        return (
                            <Link
                                key={category.title}
                                href={category.href}
                                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg hover:border-[#1E3A8A] transition-all group"
                            >
                                <div className={`w-12 h-12 ${colorClasses[category.color as keyof typeof colorClasses]} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6" aria-hidden="true" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                                <p className="text-gray-600 text-sm">{category.description}</p>
                            </Link>
                        );
                    })}
                </div>
            </section>

            {/* FAQ Section - Link to dedicated FAQ page */}
            <section className="bg-gray-50 py-12 sm:py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                        {t('support.faqTitle')}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {language === 'fr' 
                            ? 'Consultez notre FAQ complète pour trouver des réponses à toutes vos questions.'
                            : 'Check out our complete FAQ to find answers to all your questions.'
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

            {/* Contact CTA */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] rounded-xl p-8 sm:p-12 text-center text-white">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                        {t('support.needHelp')}
                    </h2>
                    <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
                        {t('support.needHelpDesc')}
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/contact"
                            className="px-6 py-3 bg-white text-[#1E3A8A] rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            {t('support.contactUs')}
                        </Link>
                        <a
                            href="mailto:support@innovaport.dev"
                            className="px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                        >
                            support@innovaport.dev
                        </a>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
}
