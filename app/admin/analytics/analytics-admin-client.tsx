'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { BarChart3, Users, MousePointerClick, Eye, ArrowLeft, RefreshCw, Calendar, Globe, TrendingUp, Bug } from 'lucide-react';
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
    totalInDatabase?: number;
    filteredCount?: number;
    startDate?: string;
    endDate?: string;
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
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Erreur lors du chargement des analytics');
            }

            const analyticsData = await response.json();
            
            // Log pour diagnostic
            console.log('📊 Analytics data loaded:', {
                total: analyticsData.analytics?.length || 0,
                stats: analyticsData.stats,
                period: analyticsData.period,
                filterType: analyticsData.filterType,
                totalInDatabase: analyticsData.totalInDatabase,
            });
            
            setData(analyticsData);
        } catch (error) {
            console.error('❌ Error loading analytics:', error);
            // Afficher un message d'erreur à l'utilisateur
            setData(null);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [timePeriod]);

    // Charger les données au montage
    useEffect(() => {
        loadData(true); // Afficher le spinner au chargement initial
    }, [loadData]);

    // Rafraîchir automatiquement toutes les 10 secondes (temps réel)
    useEffect(() => {
        const interval = setInterval(() => {
            // Actualiser silencieusement en arrière-plan (sans afficher le spinner)
            loadData();
        }, 10000); // 10 secondes pour un rafraîchissement plus fréquent

        return () => clearInterval(interval);
    }, [loadData]);

    const [chartType, setChartType] = useState<'area' | 'line' | 'bar'>('area');
    const [eventTypeFilter, setEventTypeFilter] = useState<'all' | 'page_view' | 'portfolio_view' | 'quote_click' | 'contact_click'>('all');
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [showDiagnostics, setShowDiagnostics] = useState(false);

    // Fonction pour exécuter le diagnostic
    const runDiagnostics = useCallback(async () => {
        try {
            setShowDiagnostics(true);
            const response = await fetch('/api/admin/analytics/debug');
            if (!response.ok) {
                throw new Error('Erreur lors du diagnostic');
            }
            const diagnosticsData = await response.json();
            setDiagnostics(diagnosticsData);
            
            // Recharger aussi les données principales après le diagnostic
            // pour s'assurer que les statistiques sont à jour
            loadData();
        } catch (error) {
            console.error('Error running diagnostics:', error);
            setDiagnostics({ error: 'Erreur lors du diagnostic' });
        }
    }, [loadData]);

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

    // Recalculer les statistiques en fonction des données filtrées
    const filteredStats = useMemo(() => {
        if (!filteredAnalytics.length) {
            return {
                totalVisits: 0,
                uniqueVisitors: 0,
                pageViews: 0,
                clicks: 0,
            };
        }

        const uniqueIPs = new Set(filteredAnalytics.map(a => a.ip_address).filter(Boolean));
        
        const pageViews = filteredAnalytics.filter(a => {
            const eventType = a.event_type || a.event;
            return eventType === 'page_view' || eventType === 'portfolio_view';
        }).length;

        const clicks = filteredAnalytics.filter(a => {
            const eventType = a.event_type || a.event;
            return eventType === 'quote_click' || 
                   eventType === 'contact_click' || 
                   eventType === 'click';
        }).length;

        return {
            totalVisits: filteredAnalytics.length,
            uniqueVisitors: uniqueIPs.size,
            pageViews: pageViews,
            clicks: clicks,
        };
    }, [filteredAnalytics]);

    // Recalculer groupedByDate en fonction des données filtrées
    const filteredGroupedByDate = useMemo(() => {
        if (!filteredAnalytics.length) return [];
        
        const grouped: { [key: string]: number } = {};
        const period = timePeriod;

        filteredAnalytics.forEach(item => {
            const date = new Date(item.created_at);
            let key: string;

            switch (period) {
                case 'day':
                    key = date.toLocaleDateString('fr-FR', { hour: '2-digit' });
                    break;
                case 'week':
                    key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                    break;
                case 'month':
                    key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                    break;
                case 'year':
                    key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                    break;
                default:
                    key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
            }

            grouped[key] = (grouped[key] || 0) + 1;
        });

        return Object.entries(grouped)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }, [filteredAnalytics, timePeriod]);

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
                    <div className="flex items-center gap-2">
                        <button
                            onClick={runDiagnostics}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <Bug className="w-4 h-4" />
                            {language === 'fr' ? 'Diagnostic' : 'Diagnostics'}
                        </button>
                        <button
                            onClick={() => loadData(true)}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            {language === 'fr' ? 'Actualiser' : 'Refresh'}
                        </button>
                        {data && (
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>{language === 'fr' ? 'Temps réel (10s)' : 'Real-time (10s)'}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Diagnostic Panel */}
            {showDiagnostics && diagnostics && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">
                            {language === 'fr' ? 'Diagnostic du système analytics' : 'Analytics System Diagnostics'}
                        </h2>
                        <button
                            onClick={() => setShowDiagnostics(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    {diagnostics.error ? (
                        <div className="text-red-600">{diagnostics.error}</div>
                    ) : diagnostics.diagnostics ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-gray-600">{language === 'fr' ? 'Total événements' : 'Total Events'}</div>
                                    <div className="text-2xl font-bold text-blue-600">{diagnostics.diagnostics.totalEvents || 0}</div>
                                </div>
                                <div className="p-4 bg-green-50 rounded-lg">
                                    <div className="text-sm text-gray-600">{language === 'fr' ? 'Visiteurs anonymes' : 'Anonymous Visitors'}</div>
                                    <div className="text-2xl font-bold text-green-600">{diagnostics.diagnostics.anonymousVisitors || 0}</div>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                    <div className="text-sm text-gray-600">{language === 'fr' ? 'Pages vues' : 'Page Views'}</div>
                                    <div className="text-2xl font-bold text-purple-600">{diagnostics.diagnostics.pageViewEvents || 0}</div>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                    <div className="text-sm text-gray-600">{language === 'fr' ? '7 derniers jours' : 'Last 7 Days'}</div>
                                    <div className="text-2xl font-bold text-orange-600">{diagnostics.diagnostics.last7DaysEvents || 0}</div>
                                </div>
                            </div>
                            {Object.keys(diagnostics.diagnostics.eventTypeCounts || {}).length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{language === 'fr' ? 'Événements par type' : 'Events by Type'}</h3>
                                    <div className="space-y-1">
                                        {Object.entries(diagnostics.diagnostics.eventTypeCounts).map(([type, count]: [string, any]) => (
                                            <div key={type} className="flex justify-between text-sm">
                                                <span className="text-gray-600">{type}</span>
                                                <span className="font-medium">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {diagnostics.diagnostics.recentEvents && diagnostics.diagnostics.recentEvents.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{language === 'fr' ? '10 derniers événements' : '10 Recent Events'}</h3>
                                    <div className="space-y-2 max-h-60 overflow-y-auto">
                                        {diagnostics.diagnostics.recentEvents.map((event: any) => (
                                            <div key={event.id} className="p-2 bg-gray-50 rounded text-xs">
                                                <div className="font-medium">{event.event_type || 'unknown'}</div>
                                                <div className="text-gray-600">{event.path || 'N/A'}</div>
                                                <div className="text-gray-500">{new Date(event.created_at).toLocaleString()}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {diagnostics.recommendations && diagnostics.recommendations.length > 0 && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                    <h3 className="font-semibold text-yellow-900 mb-2">{language === 'fr' ? 'Recommandations' : 'Recommendations'}</h3>
                                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                                        {diagnostics.recommendations.map((rec: string, idx: number) => (
                                            <li key={idx}>{rec}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-4 text-gray-500">
                            {language === 'fr' ? 'Chargement du diagnostic...' : 'Loading diagnostics...'}
                        </div>
                    )}
                </div>
            )}

            {/* Filtres de période */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
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
                    {data && (
                        <div className="text-xs text-gray-500">
                            {language === 'fr' 
                                ? `${data.totalInDatabase || 0} événements au total dans la base`
                                : `${data.totalInDatabase || 0} total events in database`}
                        </div>
                    )}
                </div>
                {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            {language === 'fr' 
                                ? '⚠️ Vous êtes en localhost. Les données affichées sont celles de la base de données Supabase. Pour voir les données de production, visitez www.innovaport.dev.'
                                : '⚠️ You are on localhost. The displayed data is from the Supabase database. To see production data, visit www.innovaport.dev.'}
                        </p>
                    </div>
                )}
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
                            value={filteredStats.totalVisits}
                            color="blue"
                        />
                        <StatCard
                            icon={<Users className="w-6 h-6" />}
                            title={language === 'fr' ? 'Visiteurs uniques' : 'Unique Visitors'}
                            value={filteredStats.uniqueVisitors}
                            color="green"
                        />
                        <StatCard
                            icon={<BarChart3 className="w-6 h-6" />}
                            title={language === 'fr' ? 'Pages vues' : 'Page Views'}
                            value={filteredStats.pageViews}
                            color="purple"
                        />
                        <StatCard
                            icon={<MousePointerClick className="w-6 h-6" />}
                            title={language === 'fr' ? 'Clics' : 'Clicks'}
                            value={filteredStats.clicks}
                            color="orange"
                        />
                    </div>

                    {/* Graphique principal */}
                    {filteredGroupedByDate.length > 0 && (
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
                                            data={filteredGroupedByDate}
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
                                            data={filteredGroupedByDate}
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
                                            data={filteredGroupedByDate}
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
                <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                        <div className="mb-4">
                            <Eye className="w-16 h-16 mx-auto text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {language === 'fr' ? 'Aucune donnée disponible' : 'No data available'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {language === 'fr' 
                                ? `Aucun événement analytics trouvé pour la période sélectionnée (${periodLabels[timePeriod]}).`
                                : `No analytics events found for the selected period (${periodLabels[timePeriod]}).`}
                        </p>
                        <div className="space-y-2 text-sm text-gray-500">
                            <p>
                                {language === 'fr' 
                                    ? '💡 Conseils pour voir des données :'
                                    : '💡 Tips to see data:'}
                            </p>
                            <ul className="list-disc list-inside space-y-1 text-left max-w-sm mx-auto">
                                <li>
                                    {language === 'fr' 
                                        ? 'Visitez le site www.innovaport.dev pour générer des événements'
                                        : 'Visit www.innovaport.dev to generate events'}
                                </li>
                                <li>
                                    {language === 'fr' 
                                        ? 'Essayez une période plus longue (30 jours ou 12 mois)'
                                        : 'Try a longer period (30 days or 12 months)'}
                                </li>
                                <li>
                                    {language === 'fr' 
                                        ? 'Utilisez le bouton "Diagnostic" pour vérifier les données dans Supabase'
                                        : 'Use the "Diagnostics" button to check data in Supabase'}
                                </li>
                            </ul>
                        </div>
                    </div>
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

