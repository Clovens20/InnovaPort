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
import { Mail, Phone, Clock, MoreVertical, Loader2 } from 'lucide-react';
import { Quote } from '@/types';

// Fonction pour formater la date relative
function formatRelativeDate(date: string): string {
    const now = new Date();
    const quoteDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - quoteDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Il y a moins d\'une minute';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
        return quoteDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}

export default function QuotesPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'new' | 'discussing' | 'quoted' | 'accepted' | 'rejected'>('all');

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
        { id: 'all' as const, label: 'Toutes', count: counts.all },
        { id: 'new' as const, label: 'Nouvelles', count: counts.new, dot: counts.new > 0 },
        { id: 'discussing' as const, label: 'En discussion', count: counts.discussing },
        { id: 'quoted' as const, label: 'Devis envoyé', count: counts.quoted },
        { id: 'accepted' as const, label: 'Acceptées', count: counts.accepted },
        { id: 'rejected' as const, label: 'Refusées', count: counts.rejected },
    ];

    const filteredQuotes =
        activeTab === 'all'
            ? quotes
            : quotes.filter((q) => q.status === activeTab);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement des devis...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-full overflow-x-hidden">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Demandes de cotation</h1>
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
                                        NOUVELLE
                                    </span>
                                )}

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{quote.name}</h3>
                                <p className="text-gray-600 font-medium mb-2">
                                    {quote.project_type} · Budget:{' '}
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
                                        <span>{formatRelativeDate(quote.created_at)}</span>
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 flex-shrink-0 lg:ml-4 lg:self-start">
                                <Link
                                    href={`/dashboard/quotes/${quote.id}`}
                                    className="px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 text-sm font-semibold transition-all whitespace-nowrap flex items-center justify-center shadow-sm hover:shadow-md min-w-[120px]"
                                >
                                    Voir détails
                                </Link>
                                <button 
                                    className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    title="Plus d'options"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredQuotes.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">
                            {quotes.length === 0
                                ? 'Aucune demande de devis pour le moment.'
                                : 'Aucune demande trouvée pour ce filtre.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
