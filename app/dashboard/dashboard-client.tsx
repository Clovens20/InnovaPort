'use client';

import Link from 'next/link';
import { FolderKanban, MessageSquareQuote, Eye, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { PortfolioUrlCard } from './_components/portfolio-url-card';
export function DashboardPageClient({ stats, projects, profile, username }: { 
    stats: any, 
    projects: any[], 
    profile: any, 
    username: string 
}) {

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600 mt-1">Bienvenue dans votre espace de travail</p>
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
                    <h3 className="text-sm font-medium text-gray-600">Projets totaux</h3>
                    <p className="text-xs text-gray-500 mt-1">{stats.publishedProjects} publiés</p>
                </div>

                {/* Devis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <MessageSquareQuote className="w-6 h-6 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">Demandes de devis</h3>
                    {stats.newQuotes > 0 && (
                        <p className="text-xs text-red-600 mt-1 font-semibold">{stats.newQuotes} nouvelles</p>
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
                    <h3 className="text-sm font-medium text-gray-600">Vues portfolio</h3>
                    <p className="text-xs text-gray-500 mt-1">30 derniers jours</p>
                </div>

                {/* Clics devis */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{stats.quoteClicks}</span>
                    </div>
                    <h3 className="text-sm font-medium text-gray-600">Clics sur devis</h3>
                    <p className="text-xs text-gray-500 mt-1">30 derniers jours</p>
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
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Actions rapides</h2>
                    <div className="space-y-4">

                        <Link
                            href="/dashboard/quotes"
                            className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                        >
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                                <MessageSquareQuote className="w-5 h-5 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">Voir les devis</h3>
                                <p className="text-sm text-gray-500">
                                    {stats.newQuotes > 0 ? (
                                        <span className="text-red-600 font-semibold">{stats.newQuotes} nouvelles</span>
                                    ) : (
                                        'Gérez vos demandes de devis'
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
                                <h3 className="font-semibold text-gray-900">Personnaliser</h3>
                                <p className="text-sm text-gray-500">Modifiez l'apparence de votre portfolio</p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Projets récents */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Projets récents</h2>
                    <Link
                        href="/dashboard/projects"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Voir tout →
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
                                        <h3 className="font-semibold text-gray-900">Projet #{project.id.slice(0, 8)}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {project.published ? (
                                                <span className="flex items-center gap-1 text-xs text-green-600">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Publié
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    Brouillon
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/projects"
                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Modifier →
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun projet</h3>
                        <p className="text-gray-500 mb-6">Commencez par ajouter votre premier projet à votre portfolio en utilisant le bouton dans la sidebar</p>
                    </div>
                )}
            </div>
        </div>
    );
}

