/**
 * Page: /[username]/about
 * 
 * Fonction: Page "À propos" publique du développeur
 * Dépendances: @supabase/supabase-js, next/navigation, framer-motion
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Mail, Twitter, Linkedin, Music2, Facebook, Loader2 } from 'lucide-react';
import { getDicebearAvatarUrl } from '@/lib/constants';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LanguageSwitcher } from '@/app/_components/language-switcher';

export default function AboutPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const username = params.username as string;

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        loadProfile();
    }, [username]);

    const loadProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();

            if (error || !data) {
                router.push('/');
                return;
            }

            setProfile(data);
        } catch (error) {
            console.error('Error loading profile:', error);
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mx-auto mb-4" />
                    <p className="text-white">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return null;
    }

    const avatarUrl = profile.avatar_url || getDicebearAvatarUrl(profile.username);
    const displayName = profile.full_name || profile.username;
    const displayTitle = profile.title || t('portfolio.defaults.title');
    const displayBio = profile.bio || t('portfolio.defaults.bio');

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            {/* Header avec navigation */}
            <header className="border-b border-slate-700/50 backdrop-blur-sm bg-slate-900/50 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link href={`/${username}`} className="text-2xl font-bold">
                            {displayName}
                        </Link>
                        <div className="flex items-center gap-6">
                            <nav className="flex gap-6">
                                <Link href={`/${username}`} className="text-slate-300 hover:text-white transition-colors">
                                    {t('portfolio.footer.home')}
                                </Link>
                                <Link href={`/${username}/about`} className="text-white font-semibold">
                                    {t('portfolio.footer.about')}
                                </Link>
                            </nav>
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-16">
                {/* Hero Section avec photo proéminente */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-16"
                >
                    <div className="max-w-5xl mx-auto">
                        <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-3xl p-8 md:p-12">
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                                {/* Photo du développeur */}
                                <div className="flex-shrink-0">
                                    <div className="relative">
                                        <img
                                            src={avatarUrl}
                                            alt={displayName}
                                            className="w-48 h-48 md:w-64 md:h-64 rounded-2xl object-cover border-4 border-cyan-500/30 shadow-2xl shadow-cyan-500/20"
                                        />
                                        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-800 animate-pulse"></div>
                                    </div>
                                </div>
                                
                                {/* Texte */}
                                <div className="flex-1 text-center md:text-left">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                                        <span className="text-white">{t('portfolio.about.about')} </span>
                                        <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                                            {displayName}
                                        </span>
                                    </h1>
                                    <p className="text-xl md:text-2xl text-slate-300 mb-4">{displayTitle}</p>
                                    {displayBio && (
                                        <p className="text-lg text-slate-400 max-w-2xl mx-auto md:mx-0">{displayBio}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Section 1: Votre parcours */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mb-16"
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-8 md:p-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-1 h-12 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                                {t('portfolio.about.journey')}
                            </h2>
                            {profile.about_journey ? (
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">
                                        {profile.about_journey}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-slate-400 italic">
                                    <p>{t('portfolio.about.journeyNotSet')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Section 2: Votre approche */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mb-16"
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-8 md:p-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-1 h-12 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                                {t('portfolio.about.approach')}
                            </h2>
                            {profile.about_approach ? (
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">
                                        {profile.about_approach}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-slate-400 italic">
                                    <p>{t('portfolio.about.approachNotSet')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* Section 3: Pourquoi vous choisir */}
                <motion.section
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="mb-16"
                >
                    <div className="max-w-4xl mx-auto">
                        <div className="backdrop-blur-md bg-slate-800/50 border border-cyan-500/20 rounded-2xl p-8 md:p-12">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6 flex items-center gap-3">
                                <span className="w-1 h-12 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full"></span>
                                {t('portfolio.about.whyChoose')}
                            </h2>
                            {profile.about_why_choose ? (
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">
                                        {profile.about_why_choose}
                                    </p>
                                </div>
                            ) : (
                                <div className="text-slate-400 italic">
                                    <p>{t('portfolio.about.whyChooseNotSet')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-center"
                >
                    <div className="max-w-2xl mx-auto backdrop-blur-md bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold mb-4">{t('portfolio.about.readyToWork')}</h3>
                        <p className="text-slate-300 mb-6">
                            {t('portfolio.about.readyToWorkDesc')}
                        </p>
                        <Link
                            href={`/${username}/contact`}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-lg shadow-cyan-500/50"
                        >
                            {t('portfolio.requestQuote')}
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </motion.div>
            </div>

            {/* Footer */}
            <footer className="border-t border-slate-700/50 mt-20 py-12">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-slate-400">
                            © {new Date().getFullYear()} {displayName}. {t('portfolio.footer.rights')}
                        </div>
                        <div className="flex gap-6">
                            {profile.tiktok_url && (
                                <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                                    <Music2 className="w-5 h-5" />
                                </a>
                            )}
                            {profile.facebook_url && (
                                <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                                    <Facebook className="w-5 h-5" />
                                </a>
                            )}
                            {profile.twitter_url && (
                                <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                                    <Twitter className="w-5 h-5" />
                                </a>
                            )}
                            {profile.linkedin_url && (
                                <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-blue-400 transition-colors">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            )}
                            {profile.email && (
                                <a href={`mailto:${profile.email}`} className="text-slate-400 hover:text-white transition-colors">
                                    <Mail className="w-5 h-5" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
