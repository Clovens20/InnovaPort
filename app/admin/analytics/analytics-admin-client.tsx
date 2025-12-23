'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart3, Users, MousePointerClick, Eye, ArrowLeft, RefreshCw, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';

type TimePeriod = 'day' | 'week' | 'month' | 'year';

interface AnalyticsData {
    analytics: any[];
    stats: {
        totalVisits: number;
        uniqueVisitors: number;
        pageViews: number;
        clicks: number;
    };
    groupedByDate: { date: string; count: number }[];
    period: string;
}

export function AnalyticsAdminClient() {
    const { t, language } = useTranslation();
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('week');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const supabase = useMemo(() => createClient(), []);

    const loadData = useCallback(async (showRefreshing = false) => {
        try {
            if (showRefreshing) {
                setRefreshing(true);
            }
            const response = await fetch(`/api/admin/analytics?period=${timePeriod}`);
            
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des analytics');
            }

            const analyticsData = await response.json();
            setData(analyticsData);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [timePeriod]);

    // Charger les données au montage
    useEffect(() => {
        loadData(true); // Afficher le spinner au chargement initial
    }, [loadData]);

    // Rafraîchir automatiquement toutes les 30 secondes (temps réel)
    useEffect(() => {
        const interval = setInterval(() => {
            // Actualiser silencieusement en arrière-plan (sans afficher le spinner)
            loadData();
        }, 30000); // 30 secondes

        return () => clearInterval(interval);
    }, [loadData]);

    const maxCount = useMemo(() => {
        if (!data?.groupedByDate.length) return 1;
        return Math.max(...data.groupedByDate.map(d => d.count));
    }, [data]);

    const periodLabels = {
        day: language === 'fr' ? 'Aujourd\'hui' : 'Today',
        week: language === 'fr' ? '7 derniers jours' : 'Last 7 days',
        month: language === 'fr' ? '30 derniers jours' : 'Last 30 days',
        year: language === 'fr' ? '12 derniers mois' : 'Last 12 months',
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-6">
            {/* Header */}
            <div>
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">
                        {language === 'fr' ? 'Retour au panneau admin' : 'Back to admin panel'}
                    </span>
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {language === 'fr' ? 'Analytics du site' : 'Site Analytics'}
                        </h1>
                        <p className="text-gray-600 mt-2">
                            {language === 'fr' 
                                ? 'Statistiques des visiteurs sur www.innovaport.dev'
                                : 'Visitor statistics for www.innovaport.dev'}
                        </p>
                    </div>
                    <button
                        onClick={() => loadData(true)}
                        disabled={refreshing}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        {language === 'fr' ? 'Actualiser' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Filtres de période */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                        {language === 'fr' ? 'Période:' : 'Period:'}
                    </span>
                    {(['day', 'week', 'month', 'year'] as TimePeriod[]).map((period) => (
                        <button
                            key={period}
                            onClick={() => setTimePeriod(period)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                timePeriod === period
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {periodLabels[period]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">{language === 'fr' ? 'Chargement...' : 'Loading...'}</p>
                </div>
            ) : data ? (
                <>
                    {/* Statistiques principales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            icon={<Eye className="w-6 h-6" />}
                            title={language === 'fr' ? 'Visites totales' : 'Total Visits'}
                            value={data.stats.totalVisits}
                            color="blue"
                        />
                        <StatCard
                            icon={<Users className="w-6 h-6" />}
                            title={language === 'fr' ? 'Visiteurs uniques' : 'Unique Visitors'}
                            value={data.stats.uniqueVisitors}
                            color="green"
                        />
                        <StatCard
                            icon={<BarChart3 className="w-6 h-6" />}
                            title={language === 'fr' ? 'Pages vues' : 'Page Views'}
                            value={data.stats.pageViews}
                            color="purple"
                        />
                        <StatCard
                            icon={<MousePointerClick className="w-6 h-6" />}
                            title={language === 'fr' ? 'Clics' : 'Clicks'}
                            value={data.stats.clicks}
                            color="orange"
                        />
                    </div>

                    {/* Graphique */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">
                            {language === 'fr' ? 'Évolution des visites' : 'Visit Evolution'}
                        </h2>
                        {data.groupedByDate.length > 0 ? (
                            <div className="space-y-4">
                                {/* Graphique en barres */}
                                <div className="flex items-end gap-2 h-64">
                                    {data.groupedByDate.map((item, index) => (
                                        <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                            <div className="relative w-full flex items-end justify-center" style={{ height: '240px' }}>
                                                <div
                                                    className="w-full bg-blue-500 rounded-t-lg hover:bg-blue-600 transition-colors cursor-pointer"
                                                    style={{
                                                        height: `${(item.count / maxCount) * 100}%`,
                                                        minHeight: item.count > 0 ? '4px' : '0',
                                                    }}
                                                    title={`${item.date}: ${item.count} ${language === 'fr' ? 'visites' : 'visits'}`}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-600 text-center transform -rotate-45 origin-center whitespace-nowrap">
                                                {item.date}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                {/* Légende */}
                                <div className="flex items-center justify-center gap-4 pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                        <span className="text-sm text-gray-600">
                                            {language === 'fr' ? 'Nombre de visites' : 'Number of visits'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                {language === 'fr' ? 'Aucune donnée disponible pour cette période' : 'No data available for this period'}
                            </div>
                        )}
                    </div>

                    {/* Liste des événements récents */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {language === 'fr' ? 'Événements récents' : 'Recent Events'}
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                            {data.analytics.slice(0, 50).map((event, index) => (
                                <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {event.path || '/'}
                                                </span>
                                                {event.event_type && (
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                        {event.event_type}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                {event.ip_address && (
                                                    <span>{language === 'fr' ? 'IP:' : 'IP:'} {event.ip_address}</span>
                                                )}
                                                <span>
                                                    {new Date(event.created_at).toLocaleString(
                                                        language === 'fr' ? 'fr-FR' : 'en-US',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-gray-500">
                    {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
                </div>
            )}
        </div>
    );
}

function StatCard({
    icon,
    title,
    value,
    color,
}: {
    icon: React.ReactNode;
    title: string;
    value: number;
    color: 'blue' | 'green' | 'purple' | 'orange';
}) {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
        </div>
    );
}

