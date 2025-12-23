'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart3, Users, MousePointerClick, Eye, ArrowLeft, RefreshCw, Calendar, Globe, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

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
            const response = await fetch(`/api/admin/analytics?period=${timePeriod}&filter=all`);
            
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

    const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
    const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'page_view' | 'portfolio_view' | 'quote_click' | 'contact_click'>('all');

    // Calculer les statistiques supplémentaires
    const topPages = useMemo(() => {
        if (!data?.analytics) return [];
        const pageCounts: { [key: string]: number } = {};
        data.analytics.forEach(event => {
            const path = event.path || '/';
            pageCounts[path] = (pageCounts[path] || 0) + 1;
        });
        return Object.entries(pageCounts)
            .map(([path, count]) => ({ path, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }, [data]);

    const eventTypeStats = useMemo(() => {
        if (!data?.analytics) return [];
        const typeCounts: { [key: string]: number } = {};
        data.analytics.forEach(event => {
            const eventType = event.event_type || event.event || 'unknown';
            typeCounts[eventType] = (typeCounts[eventType] || 0) + 1;
        });
        return Object.entries(typeCounts)
            .map(([type, count]) => ({ name: type, value: count }))
            .sort((a, b) => b.value - a.value);
    }, [data]);

    const referrerStats = useMemo(() => {
        if (!data?.analytics) return [];
        const referrerCounts: { [key: string]: number } = {};
        data.analytics.forEach(event => {
            const referrer = event.referrer || 'Direct';
            referrerCounts[referrer] = (referrerCounts[referrer] || 0) + 1;
        });
        return Object.entries(referrerCounts)
            .map(([referrer, count]) => ({ name: referrer.length > 30 ? referrer.substring(0, 30) + '...' : referrer, value: count }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 10);
    }, [data]);

    const filteredAnalytics = useMemo(() => {
        if (!data?.analytics) return [];
        if (eventTypeFilter === 'all') return data.analytics;
        return data.analytics.filter(event => {
            const eventType = event.event_type || event.event;
            return eventType === eventTypeFilter;
        });
    }, [data, eventTypeFilter]);

    const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

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

                    {/* Graphique principal */}
                    {data.groupedByDate.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                        {language === 'fr' ? 'Évolution des visites' : 'Visit Evolution'}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {language === 'fr' 
                                            ? 'Visualisation de l\'évolution du trafic dans le temps'
                                            : 'Traffic trends over time visualization'}
                                    </p>
                                </div>
                                {/* Sélecteur de type de graphique */}
                                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                                    {(['area', 'line', 'bar'] as const).map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setChartType(type)}
                                            className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                                chartType === type
                                                    ? 'bg-white text-gray-900 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {type === 'area' 
                                                ? (language === 'fr' ? 'Aire' : 'Area')
                                                : type === 'line'
                                                ? (language === 'fr' ? 'Ligne' : 'Line')
                                                : (language === 'fr' ? 'Barres' : 'Bar')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Graphique professionnel avec Recharts */}
                            <div className="w-full" style={{ height: '400px' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    {chartType === 'area' ? (
                                        <AreaChart
                                            data={data.groupedByDate}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                                        >
                                            <defs>
                                                <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis 
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                }}
                                                formatter={(value: any) => [
                                                    `${value} ${language === 'fr' ? 'visites' : 'visits'}`,
                                                    language === 'fr' ? 'Visites' : 'Visits'
                                                ]}
                                                labelStyle={{ fontWeight: 600, color: '#111827' }}
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                fill="url(#colorVisits)"
                                                name={language === 'fr' ? 'Visites' : 'Visits'}
                                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                            />
                                        </AreaChart>
                                    ) : chartType === 'line' ? (
                                        <LineChart
                                            data={data.groupedByDate}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis 
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                }}
                                                formatter={(value: any) => [
                                                    `${value} ${language === 'fr' ? 'visites' : 'visits'}`,
                                                    language === 'fr' ? 'Visites' : 'Visits'
                                                ]}
                                                labelStyle={{ fontWeight: 600, color: '#111827' }}
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="count"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                                name={language === 'fr' ? 'Visites' : 'Visits'}
                                            />
                                        </LineChart>
                                    ) : (
                                        <BarChart
                                            data={data.groupedByDate}
                                            margin={{ top: 10, right: 30, left: 0, bottom: 60 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                                            <XAxis 
                                                dataKey="date" 
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                            />
                                            <YAxis 
                                                stroke="#6b7280"
                                                fontSize={12}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#fff',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                }}
                                                formatter={(value: any) => [
                                                    `${value} ${language === 'fr' ? 'visites' : 'visits'}`,
                                                    language === 'fr' ? 'Visites' : 'Visits'
                                                ]}
                                                labelStyle={{ fontWeight: 600, color: '#111827' }}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#3b82f6"
                                                radius={[8, 8, 0, 0]}
                                                name={language === 'fr' ? 'Visites' : 'Visits'}
                                            />
                                        </BarChart>
                                    )}
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}

                    {/* Graphiques supplémentaires */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Top pages */}
                        {topPages.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {language === 'fr' ? 'Pages les plus visitées' : 'Top Pages'}
                                </h3>
                                <div className="space-y-2">
                                    {topPages.map((page, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
                                                <span className="text-sm text-gray-900 truncate">{page.path}</span>
                                            </div>
                                            <span className="text-sm font-semibold text-blue-600">{page.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Types d'événements */}
                        {eventTypeStats.length > 0 && (
                            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    {language === 'fr' ? 'Répartition par type d\'événement' : 'Event Type Distribution'}
                                </h3>
                                <div className="w-full" style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={eventTypeStats}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {eventTypeStats.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sources de trafic */}
                    {referrerStats.length > 0 && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                {language === 'fr' ? 'Sources de trafic' : 'Traffic Sources'}
                            </h3>
                            <div className="space-y-2">
                                {referrerStats.map((ref, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <Globe className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 truncate">{ref.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-green-600">{ref.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Filtre par type d'événement */}
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-gray-700">
                                {language === 'fr' ? 'Filtrer par type:' : 'Filter by type:'}
                            </span>
                            {(['all', 'page_view', 'portfolio_view', 'quote_click', 'contact_click'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setEventTypeFilter(type)}
                                    className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                                        eventTypeFilter === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {type === 'all' 
                                        ? (language === 'fr' ? 'Tous' : 'All')
                                        : type === 'page_view'
                                        ? (language === 'fr' ? 'Pages vues' : 'Page Views')
                                        : type === 'portfolio_view'
                                        ? (language === 'fr' ? 'Vues portfolio' : 'Portfolio Views')
                                        : type === 'quote_click'
                                        ? (language === 'fr' ? 'Clics devis' : 'Quote Clicks')
                                        : (language === 'fr' ? 'Clics contact' : 'Contact Clicks')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Liste des événements récents */}
                    <div className="bg-white rounded-lg border border-gray-200">
                        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {language === 'fr' ? 'Événements récents' : 'Recent Events'}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {filteredAnalytics.length} {language === 'fr' ? 'événements' : 'events'}
                            </span>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                            {filteredAnalytics.slice(0, 50).map((event, index) => (
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
                                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1 flex-wrap">
                                                {event.ip_address && (
                                                    <span className="flex items-center gap-1">
                                                        <span className="font-medium">{language === 'fr' ? 'IP:' : 'IP:'}</span>
                                                        <span className="font-mono">{event.ip_address}</span>
                                                    </span>
                                                )}
                                                {event.referrer && (
                                                    <span className="flex items-center gap-1 truncate max-w-xs">
                                                        <Globe className="w-3 h-3" />
                                                        <span className="truncate" title={event.referrer}>
                                                            {event.referrer.length > 40 ? event.referrer.substring(0, 40) + '...' : event.referrer}
                                                        </span>
                                                    </span>
                                                )}
                                                {event.user_agent && (
                                                    <span className="text-xs text-gray-400 truncate max-w-xs" title={event.user_agent}>
                                                        {event.user_agent.length > 50 ? event.user_agent.substring(0, 50) + '...' : event.user_agent}
                                                    </span>
                                                )}
                                                <span className="ml-auto">
                                                    {new Date(event.created_at).toLocaleString(
                                                        language === 'fr' ? 'fr-FR' : 'en-US',
                                                        {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
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

