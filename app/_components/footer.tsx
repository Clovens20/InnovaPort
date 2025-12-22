'use client';

import Link from "next/link";
import Image from "next/image";
import { Mail, Facebook, Music2, Github, Twitter, Linkedin, Instagram, Youtube } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

interface SocialLink {
    icon: any;
    href: string;
    label: string;
}

export function Footer() {
    const { t, language } = useTranslation();
    const currentYear = new Date().getFullYear();
    const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

    useEffect(() => {
        loadSocialLinks();
    }, []);

    const loadSocialLinks = async () => {
        try {
            const supabase = createClient();
            const { data } = await supabase
                .from('site_settings')
                .select('social_facebook_url, social_tiktok_url, social_twitter_url, social_linkedin_url, social_instagram_url, social_youtube_url, social_github_url')
                .single();

            if (data) {
                const links: SocialLink[] = [];
                if (data.social_facebook_url) links.push({ icon: Facebook, href: data.social_facebook_url, label: 'Facebook' });
                if (data.social_tiktok_url) links.push({ icon: Music2, href: data.social_tiktok_url, label: 'TikTok' });
                if (data.social_twitter_url) links.push({ icon: Twitter, href: data.social_twitter_url, label: 'Twitter' });
                if (data.social_linkedin_url) links.push({ icon: Linkedin, href: data.social_linkedin_url, label: 'LinkedIn' });
                if (data.social_instagram_url) links.push({ icon: Instagram, href: data.social_instagram_url, label: 'Instagram' });
                if (data.social_youtube_url) links.push({ icon: Youtube, href: data.social_youtube_url, label: 'YouTube' });
                if (data.social_github_url) links.push({ icon: Github, href: data.social_github_url, label: 'GitHub' });
                setSocialLinks(links);
            }
        } catch (error) {
            console.error('Error loading social links:', error);
        }
    };

    // Liens rapides
    const quickLinks = [
        { href: '/#features', label: t('nav.features') },
        { href: '/#how-it-works', label: t('nav.howItWorks') },
        { href: '/#pricing', label: t('nav.pricing') },
        { href: '/preview/demo', label: t('hero.viewDemo') },
    ];

    // Ressources
    const resources = [
        { href: '/docs', label: language === 'fr' ? 'Documentation' : 'Documentation' },
        { href: '/blog', label: language === 'fr' ? 'Blog' : 'Blog' },
        { href: '/support', label: language === 'fr' ? 'Support' : 'Support' },
        { href: '/faq', label: language === 'fr' ? 'FAQ' : 'FAQ' },
        { href: '/contact', label: language === 'fr' ? 'Contact' : 'Contact' },
    ];

    // Pages légales
    const legalPages = [
        { href: '/mentions-legales', label: language === 'fr' ? 'Mentions Légales' : 'Legal Mentions' },
        { href: '/politique-confidentialite', label: language === 'fr' ? 'Politique de Confidentialité' : 'Privacy Policy' },
        { href: '/conditions-utilisation', label: language === 'fr' ? 'Conditions d\'Utilisation' : 'Terms of Use' },
        { href: '/politique-cookies', label: language === 'fr' ? 'Politique de Cookies' : 'Cookie Policy' },
    ];

    return (
        <footer className="bg-[#0A0E27] text-gray-300" role="contentinfo">
            {/* Séparateur */}
            <div className="border-t border-gray-800"></div>

            {/* Contenu principal */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
                    {/* Colonne 1: À propos */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Link href="/" aria-label={t('legal.backToHome')} className="block">
                                {/* Logo inversé pour fond sombre */}
                                <div className="bg-white rounded-lg p-2 inline-block">
                                    <Image
                                        src="/innovaport-logo.png"
                                        alt="InnovaPort Logo"
                                        width={200}
                                        height={60}
                                        className="h-10 sm:h-12 w-auto object-contain"
                                        sizes="(max-width: 640px) 150px, 200px"
                                        priority
                                    />
                                </div>
                            </Link>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            {t('footer.about.description')}
                        </p>
                        <div className="pt-2">
                            <p className="text-xs text-gray-500">
                                {t('footer.about.konekteGroup')}
                            </p>
                        </div>
                        <div className="pt-2">
                            <a
                                href="mailto:support@innovaport.dev"
                                className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                            >
                                <Mail className="w-4 h-4 group-hover:text-[#1E3A8A] transition-colors" aria-hidden="true" />
                                support@innovaport.dev
                            </a>
                        </div>
                    </div>

                    {/* Colonne 2: Liens rapides */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            {t('footer.navigation')}
                        </h3>
                        <ul className="space-y-3">
                            {quickLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-gray-400 hover:text-white hover:underline transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 3: Ressources */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            {t('footer.resources')}
                        </h3>
                        <ul className="space-y-3">
                            {resources.map((resource) => (
                                <li key={resource.href}>
                                    <Link
                                        href={resource.href}
                                        className="text-sm text-gray-400 hover:text-white hover:underline transition-colors inline-block"
                                    >
                                        {resource.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Colonne 4: Pages légales */}
                    <div>
                        <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
                            {t('footer.legal')}
                        </h3>
                        <ul className="space-y-3">
                            {legalPages.map((page) => (
                                <li key={page.href}>
                                    <Link
                                        href={page.href}
                                        className="text-sm text-gray-400 hover:text-white hover:underline transition-colors inline-block"
                                    >
                                        {page.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-center gap-4 text-xs text-gray-500">
                            <p>{t('footer.copyright').replace('{year}', String(currentYear))}</p>
                            <span className="hidden sm:inline">•</span>
                            <p>{t('footer.about.konekteGroup')}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => {
                                const Icon = social.icon;
                                return (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-gray-400 hover:text-white transition-colors"
                                        aria-label={social.label}
                                    >
                                        <Icon className="w-5 h-5" aria-hidden="true" />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

