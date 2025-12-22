/**
 * Page: Dashboard Quotes List
 * 
 * Fonction: Affiche la liste des devis réels du développeur
 * Dépendances: @supabase/supabase-js, react, next/navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import clsx from 'clsx';
import { Mail, Phone, Clock, MoreVertical, Loader2, Trash2, CheckCircle2, FileText, DollarSign, User, BarChart3, Plus, Sparkles } from 'lucide-react';
import { Quote } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Fonction pour formater la date relative
function formatRelativeDate(date: string, t: (key: string) => string): string {
    const now = new Date();
    const quoteDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - quoteDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return t('dashboard.quotes.timeAgo.lessThanMinute');
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        const minutesKey = minutes > 1 ? 'minutesPlural' : 'minutes';
        return `${t('dashboard.quotes.timeAgo.ago')} ${minutes} ${t(`dashboard.quotes.timeAgo.${minutesKey}`)}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        const hoursKey = hours > 1 ? 'hoursPlural' : 'hours';
        return `${t('dashboard.quotes.timeAgo.ago')} ${hours} ${t(`dashboard.quotes.timeAgo.${hoursKey}`)}`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        const daysKey = days > 1 ? 'daysPlural' : 'days';
        return `${t('dashboard.quotes.timeAgo.ago')} ${days} ${t(`dashboard.quotes.timeAgo.${daysKey}`)}`;
    } else {
        // Utiliser la locale selon la langue
        const locale = typeof window !== 'undefined' && document.documentElement.lang === 'en' ? 'en-US' : 'fr-FR';
        return quoteDate.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}

export default function QuotesPage() {
    const { t, language } = useTranslation();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'discussing' | 'quoted' | 'accepted' | 'rejected'>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

    useEffect(() => {
        loadQuotes();
    }, []);

    const loadQuotes = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setQuotes(data || []);
        } catch (error) {
            console.error('Error loading quotes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculer les compteurs pour chaque statut
    const counts = {
        all: quotes.length,
        new: quotes.filter((q) => q.status === 'new').length,
        discussing: quotes.filter((q) => q.status === 'discussing').length,
        quoted: quotes.filter((q) => q.status === 'quoted').length,
        accepted: quotes.filter((q) => q.status === 'accepted').length,
        rejected: quotes.filter((q) => q.status === 'rejected').length,
    };

    const tabs = [
        { id: 'all' as const, label: t('dashboard.quotes.tabs.all'), count: counts.all },
        { id: 'new' as const, label: t('dashboard.quotes.tabs.new'), count: counts.new, dot: counts.new > 0 },
        { id: 'discussing' as const, label: t('dashboard.quotes.tabs.discussing'), count: counts.discussing },
        { id: 'quoted' as const, label: t('dashboard.quotes.tabs.quoted'), count: counts.quoted },
        { id: 'accepted' as const, label: t('dashboard.quotes.tabs.accepted'), count: counts.accepted },
        { id: 'rejected' as const, label: t('dashboard.quotes.tabs.rejected'), count: counts.rejected },
    ];

    const filteredQuotes =
        activeTab === 'all'
            ? quotes
            : quotes.filter((q) => q.status === activeTab);

    const handleDeleteQuote = async (quoteId: string) => {
        if (!confirm(t('dashboard.quotes.deleteConfirm'))) {
            return;
        }

        setDeletingId(quoteId);
        try {
            const response = await fetch(`/api/quotes/${quoteId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete quote');
            }

            // Retirer le devis de la liste
            setQuotes(quotes.filter((q) => q.id !== quoteId));
        } catch (error) {
            console.error('Error deleting quote:', error);
            alert(t('dashboard.quotes.deleteError'));
        } finally {
            setDeletingId(null);
        }
    };

    const handleStatusChange = async (quoteId: string, newStatus: Quote['status']) => {
        console.log('[handleStatusChange] Starting status change:', { quoteId, newStatus, currentStatus: quotes.find(q => q.id === quoteId)?.status });
        
        if (!quoteId || !newStatus) {
            console.error('[handleStatusChange] Invalid parameters:', { quoteId, newStatus });
            alert('Paramètres invalides');
            return;
        }

        setUpdatingStatusId(quoteId);
        
        try {
            console.log('[handleStatusChange] Sending request to:', `/api/quotes/${quoteId}/status`);
            
            const response = await fetch(`/api/quotes/${quoteId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            console.log('[handleStatusChange] Response status:', response.status, response.statusText);

            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                console.error('[handleStatusChange] Failed to parse JSON:', jsonError);
                const text = await response.text();
                console.error('[handleStatusChange] Response text:', text);
                throw new Error('Réponse invalide du serveur');
            }

            console.log('[handleStatusChange] Response data:', data);

            if (!response.ok) {
                console.error('[handleStatusChange] Status update failed:', data);
                throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            console.log('[handleStatusChange] Status updated successfully:', data);

            // Mettre à jour le devis dans la liste
            const updatedQuotes = quotes.map((q) => 
                q.id === quoteId ? { ...q, status: newStatus } : q
            );
            setQuotes(updatedQuotes);
            
            console.log('[handleStatusChange] Quotes updated in state');
        } catch (error) {
            console.error('[handleStatusChange] Error updating status:', error);
            const errorMessage = error instanceof Error ? error.message : t('dashboard.quotes.statusUpdateError');
            alert(`Erreur: ${errorMessage}`);
        } finally {
            setUpdatingStatusId(null);
        }
    };

    // Fonction pour obtenir le label du statut
    const getStatusLabel = (status: Quote['status']): string => {
        const labels: Record<Quote['status'], string> = {
            'new': t('dashboard.quotes.tabs.new'),
            'discussing': t('dashboard.quotes.tabs.discussing'),
            'quoted': t('dashboard.quotes.tabs.quoted'),
            'accepted': t('dashboard.quotes.tabs.accepted'),
            'rejected': t('dashboard.quotes.tabs.rejected'),
        };
        return labels[status] || status;
    };

    // Fonction pour obtenir la couleur du statut
    const getStatusColor = (status: Quote['status']): string => {
        const colors: Record<Quote['status'], string> = {
            'new': 'bg-blue-100 text-blue-700 border-blue-200',
            'discussing': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'quoted': 'bg-purple-100 text-purple-700 border-purple-200',
            'accepted': 'bg-green-100 text-green-700 border-green-200',
            'rejected': 'bg-red-100 text-red-700 border-red-200',
        };
        return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">{t('dashboard.quotes.loading')}</p>
                </div>
            </div>
        );
    }

    // Calculer les statistiques
    const stats = {
        total: quotes.length,
        new: quotes.filter((q) => q.status === 'new').length,
        pending: quotes.filter((q) => q.status === 'discussing' || q.status === 'quoted').length,
        accepted: quotes.filter((q) => q.status === 'accepted').length,
        recent: quotes.filter((q) => {
            const date = new Date(q.created_at);
            const now = new Date();
            const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
            return diffDays <= 7;
        }).length,
    };

    // Activité récente (5 dernières)
    const recentActivity = quotes
        .slice(0, 5)
        .map((quote) => ({
            id: quote.id,
            type: quote.status === 'new' ? 'new' : quote.status === 'accepted' ? 'accepted' : 'update',
            message: quote.status === 'new' 
                ? `Nouveau devis reçu - ${quote.name}`
                : quote.status === 'accepted'
                ? `Devis accepté - ${quote.name}`
                : `Mise à jour - ${quote.name}`,
            time: formatRelativeDate(quote.created_at, t),
            quote,
        }));

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.quotes.title')}</h1>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Projets actifs / Devis totaux */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <FileText className="w-8 h-8 opacity-80" />
                        <span className="text-2xl font-bold">{stats.total}</span>
                    </div>
                    <p className="text-blue-100 text-sm font-medium">Devis totaux</p>
                </div>

                {/* Devis en attente */}
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-8 h-8 opacity-80" />
                        <span className="text-2xl font-bold">{stats.pending}</span>
                    </div>
                    <p className="text-green-100 text-sm font-medium">En attente</p>
                </div>

                {/* Nouveaux devis */}
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <User className="w-8 h-8 opacity-80" />
                        <span className="text-2xl font-bold">{stats.new}</span>
                    </div>
                    <p className="text-purple-100 text-sm font-medium">Nouveaux devis</p>
                </div>

                {/* Acceptés */}
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <BarChart3 className="w-8 h-8 opacity-80" />
                        <span className="text-2xl font-bold">{stats.accepted}</span>
                    </div>
                    <p className="text-orange-100 text-sm font-medium">Acceptés</p>
                </div>
            </div>

            {/* Automatisations Actives */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-6 border-2 border-purple-200">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Automatisations Actives</h2>
                    <p className="text-gray-600">Gagnez 10-15 heures par semaine</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        {
                            title: 'Réponse automatique aux nouveaux devis',
                            description: 'Envoie un email de confirmation dans les 2 minutes',
                            status: 'Actif',
                            count: `${quotes.filter((q) => q.status === 'new').length} nouveaux ce mois`,
                            icon: Sparkles,
                        },
                        {
                            title: 'Rappels de suivi client',
                            description: 'Notification 3 jours après envoi de devis',
                            status: 'Actif',
                            count: `${quotes.filter((q) => (q.reminders_count || 0) > 0).length} rappels envoyés`,
                            icon: Sparkles,
                        },
                        {
                            title: 'Mise à jour de statut projet',
                            description: 'Notifie le client à chaque changement',
                            status: 'Actif',
                            count: `${quotes.filter((q) => q.status !== 'new').length} notifications`,
                            icon: Sparkles,
                        },
                        {
                            title: 'Gestion centralisée',
                            description: 'Tous vos devis dans un seul dashboard',
                            status: 'Actif',
                            count: `${stats.total} devis gérés`,
                            icon: Sparkles,
                        },
                    ].map((auto, i) => (
                        <div key={i} className="bg-white border-2 border-purple-200 rounded-lg p-5 hover:border-purple-400 transition-all hover:shadow-lg">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-lg text-gray-900">{auto.title}</h3>
                                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            {auto.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 mb-2 text-sm">{auto.description}</p>
                                    <p className="text-sm text-purple-600 font-semibold">📊 {auto.count}</p>
                                </div>
                                <div className="ml-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                                        <auto.icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-6 text-center">
                    <p className="text-xl font-bold text-purple-900 mb-2">
                        ⏰ Temps économisé ce mois : {Math.round(quotes.length * 0.5)} heures
                    </p>
                    <p className="text-purple-700">
                        Soit l'équivalent de {Math.round(quotes.length * 0.5 * 50)}€ de travail facturable !
                    </p>
                </div>
            </div>

            {/* Activité récente et Tâches */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activité Récente */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-4 text-gray-900">Activité Récente</h3>
                    <div className="space-y-3">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => (
                                <Link
                                    key={activity.id}
                                    href={`/dashboard/quotes/${activity.quote.id}`}
                                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                                >
                                    <span className="text-2xl">
                                        {activity.type === 'new' ? '📧' : activity.type === 'accepted' ? '✅' : '💰'}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 text-sm">{activity.message}</p>
                                        <p className="text-xs text-gray-500">{activity.time}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 text-center py-4">Aucune activité récente</p>
                        )}
                    </div>
                </div>

                {/* Tâches du jour */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <h3 className="font-bold text-lg mb-4 text-gray-900">Tâches du jour</h3>
                    <div className="space-y-3">
                        {quotes.filter((q) => q.status === 'new' || q.status === 'discussing').slice(0, 3).map((quote) => (
                            <div
                                key={quote.id}
                                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors"
                            >
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded border-2 border-gray-300 cursor-pointer"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        // Optionnel: marquer comme fait
                                    }}
                                />
                                <Link
                                    href={`/dashboard/quotes/${quote.id}`}
                                    className={`flex-1 text-sm ${
                                        quote.status === 'new' ? 'text-red-600 font-semibold' : 'text-gray-700'
                                    }`}
                                >
                                    {quote.status === 'new' 
                                        ? `Répondre à ${quote.name}`
                                        : `Suivre devis - ${quote.name}`
                                    }
                                </Link>
                                {quote.status === 'new' && (
                                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                                        Urgent
                                    </span>
                                )}
                            </div>
                        ))}
                        {quotes.filter((q) => q.status === 'new' || q.status === 'discussing').length === 0 && (
                            <p className="text-sm text-gray-500 text-center py-4">Aucune tâche urgente</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                'pb-4 px-1 text-sm font-medium whitespace-nowrap transition-colors relative',
                                activeTab === tab.id
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-gray-500 hover:text-gray-700'
                            )}
                        >
                            {tab.label}{' '}
                            <span className="text-xs ml-1 bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                                {tab.count}
                            </span>
                            {tab.dot && (
                                <span className="absolute top-0 right-[-6px] w-2 h-2 rounded-full bg-red-500" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Quote List */}
            <div className="space-y-4">
                {filteredQuotes.map((quote) => (
                    <div
                        key={quote.id}
                        className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative"
                    >
                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="relative">
                                        <select
                                            value={quote.status}
                                            onChange={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                const newStatus = e.target.value as Quote['status'];
                                                console.log('Select changed:', quote.id, 'from', quote.status, 'to', newStatus);
                                                if (newStatus !== quote.status) {
                                                    handleStatusChange(quote.id, newStatus);
                                                }
                                            }}
                                            disabled={updatingStatusId === quote.id}
                                            className={clsx(
                                                'px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all outline-none cursor-pointer appearance-none bg-white',
                                                getStatusColor(quote.status),
                                                updatingStatusId === quote.id && 'opacity-50 cursor-not-allowed'
                                            )}
                                            style={{ minWidth: '150px' }}
                                        >
                                            <option value="new">{t('dashboard.quotes.tabs.new')}</option>
                                            <option value="discussing">{t('dashboard.quotes.tabs.discussing')}</option>
                                            <option value="quoted">{t('dashboard.quotes.tabs.quoted')}</option>
                                            <option value="accepted">{t('dashboard.quotes.tabs.accepted')}</option>
                                            <option value="rejected">{t('dashboard.quotes.tabs.rejected')}</option>
                                        </select>
                                        {updatingStatusId === quote.id && (
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{quote.name}</h3>
                                <p className="text-gray-600 font-medium mb-2">
                                    {quote.project_type} · {t('dashboard.quotes.budget')}{' '}
                                    <span className="text-gray-900">{quote.budget}</span>
                                </p>

                                <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                                    {quote.description}
                                </p>

                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 flex-shrink-0" /> 
                                        <span className="truncate max-w-[200px]">{quote.email}</span>
                                    </span>
                                    {quote.phone && (
                                        <span className="flex items-center gap-2">
                                            <Phone className="w-4 h-4 flex-shrink-0" /> 
                                            <span className="truncate">{quote.phone}</span>
                                        </span>
                                    )}
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 flex-shrink-0" /> 
                                        <span>{formatRelativeDate(quote.created_at, t)}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0 lg:ml-4 lg:self-start">
                                {quote.status !== 'quoted' && quote.status !== 'accepted' && quote.status !== 'rejected' && (
                                    <Link
                                        href={`/dashboard/quotes/create/${quote.id}`}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 shadow-sm hover:shadow-md min-w-[140px]"
                                    >
                                        <Plus className="w-4 h-4" />
                                        {language === 'fr' ? 'Créer le devis' : 'Create Quote'}
                                    </Link>
                                )}
                                <Link
                                    href={`/dashboard/quotes/${quote.id}`}
                                    className="px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center shadow-sm hover:shadow-md min-w-[120px]"
                                >
                                    {t('dashboard.quotes.viewDetails')}
                                </Link>
                                <button 
                                    className="px-4 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteQuote(quote.id);
                                    }}
                                    disabled={deletingId === quote.id}
                                    title={t('dashboard.quotes.delete')}
                                >
                                    {deletingId === quote.id ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>{t('dashboard.quotes.delete')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            <span>{t('dashboard.quotes.delete')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredQuotes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">
                            {quotes.length === 0
                                ? t('dashboard.quotes.noQuotes')
                                : t('dashboard.quotes.noQuotesFilter')}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
