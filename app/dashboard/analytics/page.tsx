'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { BarChart3, TrendingUp, Eye, MousePointerClick, Users, Calendar, Download } from 'lucide-react';
import { hasFeature } from '@/lib/subscription-limits';
import Link from 'next/link';

export default function AnalyticsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('free');
    const [stats, setStats] = useState({
        totalViews: 0,
        quoteClicks: 0,
        projectViews: 0,
        contactClicks: 0,
        uniqueVisitors: 0,
    });
    const [recentEvents, setRecentEvents] = useState<any[]>([]);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
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
                return;
            }

            // Charger les statistiques
            const { data: events, error } = await supabase
                .from('analytics')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(100);

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
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement des analytics...</p>
                </div>
            </div>
        );
    }

    if (!hasFeature(subscriptionTier, 'analyticsReports')) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-6">
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
                    <BarChart3 className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics et Rapports</h2>
                    <p className="text-gray-600 mb-6">
                        Cette fonctionnalité est disponible uniquement pour les plans Pro et Premium.
                    </p>
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Passer au plan Pro
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Analytics et Rapports</h1>
                    <p className="text-gray-600 mt-1">Suivez les performances de votre portfolio</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Exporter
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Eye className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-600">Vues totales</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.totalViews}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <MousePointerClick className="w-5 h-5 text-green-600" />
                        <span className="text-sm text-gray-600">Clics devis</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.quoteClicks}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <BarChart3 className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-600">Vues projets</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.projectViews}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-5 h-5 text-orange-600" />
                        <span className="text-sm text-gray-600">Visiteurs uniques</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.uniqueVisitors}</div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        <TrendingUp className="w-5 h-5 text-red-600" />
                        <span className="text-sm text-gray-600">Clics contact</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{stats.contactClicks}</div>
                </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Événements récents</h2>
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
                                        {event.event_type === 'portfolio_view' ? 'Vue du portfolio' :
                                         event.event_type === 'quote_click' ? 'Clic sur devis' :
                                         event.event_type === 'project_view' ? 'Vue de projet' :
                                         'Clic sur contact'}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {new Date(event.created_at).toLocaleDateString('fr-FR')}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500 text-center py-8">Aucun événement enregistré</p>
                    )}
                </div>
            </div>
        </div>
    );
}

