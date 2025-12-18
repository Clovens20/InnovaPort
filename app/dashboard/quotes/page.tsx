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
import { Mail, Phone, Clock, MoreVertical, Loader2, Trash2 } from 'lucide-react';
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
    const { t } = useTranslation();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'discussing' | 'quoted' | 'accepted' | 'rejected'>('all');
    const [deletingId, setDeletingId] = useState<string | null>(null);

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

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.quotes.title')}</h1>
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
                                {quote.status === 'new' && (
                                    <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                                        {t('dashboard.quotes.newBadge')}
                                    </span>
                                )}

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
