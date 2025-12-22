'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Eye, MousePointerClick, Users, Calendar, Download, RefreshCw } from 'lucide-react';
import { hasFeature } from '@/lib/subscription-limits';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import clsx from 'clsx';

type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'all';

export default function AnalyticsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('free');
    const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
    const [stats, setStats] = useState({
        totalViews: 0,
        quoteClicks: 0,
        projectViews: 0,
        contactClicks: 0,
        uniqueVisitors: 0,
    });
    const [recentEvents, setRecentEvents] = useState<any[]>([]);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const getDateFilter = useCallback((period: TimePeriod): Date => {
        const now = new Date();
        switch (period) {
            case 'day':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                return weekStart;
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'year':
                return new Date(now.getFullYear(), 0, 1);
            case 'all':
            default:
                return new Date(0); // Date très ancienne pour tout récupérer
        }
    }, []);

    const loadData = useCallback(async (silent = false) => {
        try {
            if (!silent) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Charger le plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            if (profile?.subscription_tier) {
                setSubscriptionTier(profile.subscription_tier as 'free' | 'pro' | 'premium');
            }

            // Vérifier si l'utilisateur a accès aux analytics
            if (!hasFeature(profile?.subscription_tier || 'free', 'analyticsReports')) {
                setLoading(false);
                setRefreshing(false);
                return;
            }

            // Calculer la date de début selon la période
            const startDate = getDateFilter(timePeriod);
            const startDateISO = startDate.toISOString();

            // Charger les statistiques avec filtre de date
            let query = supabase
                .from('analytics')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (timePeriod !== 'all') {
                query = query.gte('created_at', startDateISO);
            }

            const { data: events, error } = await query.limit(1000);

            if (error) throw error;

            // Calculer les stats
            const totalViews = events?.filter(e => e.event_type === 'portfolio_view').length || 0;
            const quoteClicks = events?.filter(e => e.event_type === 'quote_click').length || 0;
            const projectViews = events?.filter(e => e.event_type === 'project_view').length || 0;
            const contactClicks = events?.filter(e => e.event_type === 'contact_click').length || 0;

            // Visiteurs uniques (approximation basée sur les IPs uniques)
            const uniqueIPs = new Set(events?.map(e => e.ip_address).filter(Boolean));
            const uniqueVisitors = uniqueIPs.size;

            setStats({
                totalViews,
                quoteClicks,
                projectViews,
                contactClicks,
                uniqueVisitors,
            });

            setRecentEvents(events?.slice(0, 20) || []);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [timePeriod, supabase, router, getDateFilter]);

    useEffect(() => {
        loadData();
        
        // Rafraîchissement automatique toutes les 30 secondes
        intervalRef.current = setInterval(() => {
            loadData(true);
        }, 30000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [loadData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('dashboard.analytics.loading')}</p>
                </div>
            </div>
        );
    }

    if (!hasFeature(subscriptionTier, 'analyticsReports')) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                    <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('dashboard.analytics.title')}</h2>
                    <p className="text-gray-600 mb-6">
                        {t('dashboard.analytics.proOnly')}
                    </p>
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        {t('dashboard.analytics.upgradeToPro')}
                    </Link>
                </div>
            </div>
        );
    }

    const timePeriods: { value: TimePeriod; label: string }[] = [
        { value: 'day', label: t('dashboard.analytics.periods.day') },
        { value: 'week', label: t('dashboard.analytics.periods.week') },
        { value: 'month', label: t('dashboard.analytics.periods.month') },
        { value: 'year', label: t('dashboard.analytics.periods.year') },
        { value: 'all', label: t('dashboard.analytics.periods.all') },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.analytics.title')}</h1>
                    <p className="text-gray-600 mt-1">{t('dashboard.analytics.subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => loadData(false)}
                        disabled={refreshing}
                        className={clsx(
                            "px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2",
                            refreshing && "opacity-50 cursor-not-allowed"
                        )}
                        title={t('dashboard.analytics.refresh')}
                    >
                        <RefreshCw className={clsx("w-4 h-4", refreshing && "animate-spin")} />
                        {t('dashboard.analytics.refresh')}
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        {t('dashboard.analytics.export')}
                    </button>
                </div>
            </div>

            {/* Sélecteur de période */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 flex-wrap">
                    <Calendar className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 mr-2">{t('dashboard.analytics.filterBy')}:</span>
                    {timePeriods.map((period) => (
                        <button
                            key={period.value}
                            onClick={() => setTimePeriod(period.value)}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                timePeriod === period.value
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                        >
                            {period.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">{t('dashboard.analytics.totalViews')}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalViews}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <MousePointerClick className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">{t('dashboard.analytics.quoteClicks')}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.quoteClicks}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">{t('dashboard.analytics.projectViews')}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.projectViews}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-gray-600">{t('dashboard.analytics.uniqueVisitors')}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.uniqueVisitors}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-600">{t('dashboard.analytics.contactClicks')}</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.contactClicks}</div>
                </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('dashboard.analytics.recentEvents')}</h2>
                <div className="space-y-2">
                    {recentEvents.length > 0 ? (
                        recentEvents.map((event, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${
                                        event.event_type === 'portfolio_view' ? 'bg-blue-500' :
                                        event.event_type === 'quote_click' ? 'bg-green-500' :
                                        event.event_type === 'project_view' ? 'bg-purple-500' :
                                        'bg-orange-500'
                                    }`} />
                                    <span className="text-sm text-gray-700">
                                        {event.event_type === 'portfolio_view' ? t('dashboard.analytics.portfolioView') :
                                         event.event_type === 'quote_click' ? t('dashboard.analytics.quoteClick') :
                                         event.event_type === 'project_view' ? t('dashboard.analytics.projectView') :
                                         t('dashboard.analytics.contactClick')}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(event.created_at).toLocaleDateString(t('common.locale') || 'fr-FR', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('dashboard.analytics.noEvents')}</p>
                    )}
                </div>
            </div>
        </div>
    );
}

