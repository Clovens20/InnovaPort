'use client';

import Link from 'next/link';
import { FolderKanban, MessageSquareQuote, Eye, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { PortfolioUrlCard } from './_components/portfolio-url-card';
import { useTranslation } from '@/lib/i18n/useTranslation';

export function DashboardPageClient({ stats, projects, profile, username }: { 
    stats: any, 
    projects: any[], 
    profile: any, 
    username: string 
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
                <p className="text-gray-600 mt-1">{t('dashboard.welcome')}</p>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Projets totaux */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <FolderKanban className="w-6 h-6 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.totalProjects}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.totalProjects')}</h3>
                    <p className="text-xs text-gray-500 mt-1">{stats.publishedProjects} {t('dashboard.stats.publishedProjects')}</p>
                </div>

                {/* Devis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <MessageSquareQuote className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.quoteRequests')}</h3>
                    {stats.newQuotes > 0 && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">{stats.newQuotes} {t('dashboard.stats.newQuotes')}</p>
                    )}
                </div>

                {/* Vues portfolio */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Eye className="w-6 h-6 text-purple-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.portfolioViews}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.portfolioViews')}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.stats.last30Days')}</p>
                </div>

                {/* Clics devis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.quoteClicks}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">{t('dashboard.stats.quoteClicks')}</h3>
                    <p className="text-xs text-gray-500 mt-1">{t('dashboard.stats.last30Days')}</p>
                </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Lien portfolio */}
                <PortfolioUrlCard 
                    username={username} 
                    subscriptionTier={profile?.subscription_tier || 'free'} 
                />

                {/* Actions rapides */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">{t('dashboard.quickActions.title')}</h2>
                    <div className="space-y-4">

                        <Link
                            href="/dashboard/quotes"
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <MessageSquareQuote className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{t('dashboard.quickActions.viewQuotes')}</h3>
                                <p className="text-sm text-gray-500">
                                    {stats.newQuotes > 0 ? (
                                        <span className="text-red-600 font-semibold">{stats.newQuotes} {t('dashboard.stats.newQuotes')}</span>
                                    ) : (
                                        t('dashboard.quickActions.manageQuotes')
                                    )}
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/dashboard/appearance"
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{t('dashboard.quickActions.customize')}</h3>
                                <p className="text-sm text-gray-500">{t('dashboard.quickActions.customizeDesc')}</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Projets récents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{t('dashboard.recentProjects.title')}</h2>
                    <Link
                        href="/dashboard/projects"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        {t('dashboard.recentProjects.viewAll')}
                    </Link>
                </div>
                {projects.length > 0 ? (
                    <div className="space-y-4">
                        {projects.slice(0, 3).map((project) => (
                            <div key={project.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-500/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <FolderKanban className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('dashboard.recentProjects.project')}{project.id.slice(0, 8)}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {project.published ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    {t('dashboard.projects.published')}
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {t('dashboard.projects.draft')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/projects"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    {t('dashboard.recentProjects.edit')}
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.recentProjects.noProjects')}</h3>
                        <p className="text-gray-500 mb-6">{t('dashboard.recentProjects.noProjectsDesc')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

