/**
 * Page: /dashboard
 * 
 * Fonction: Dashboard principal avec vue d'ensemble et statistiques
 * Dépendances: @supabase/supabase-js, utils/supabase/server
 * Raison: Interface professionnelle pour les développeurs avec vue d'ensemble
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DashboardPageClient } from './dashboard-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Récupérer le profil utilisateur
    const { data: profile } = await supabase
        .from('profiles')
        .select('username, subscription_tier')
        .eq('id', user.id)
        .single();

    // Récupérer les statistiques
    const [projectsResult, quotesResult, analyticsResult] = await Promise.all([
        supabase
            .from('projects')
            .select('id, published, created_at')
            .eq('user_id', user.id),
        supabase
            .from('quotes')
            .select('id, status, created_at')
            .eq('user_id', user.id),
        supabase
            .from('analytics')
            .select('id, event_type, event, user_id, profile_id, created_at')
            .or(`user_id.eq.${user.id},profile_id.eq.${user.id}`)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // 30 derniers jours
    ]);

    const projects = projectsResult.data || [];
    const quotes = quotesResult.data || [];
    const analytics = analyticsResult.data || [];

    const stats = {
        totalProjects: projects.length,
        publishedProjects: projects.filter(p => p.published).length,
        totalQuotes: quotes.length,
        newQuotes: quotes.filter(q => q.status === 'new').length,
        portfolioViews: analytics.filter(a => (a.event_type || a.event) === 'portfolio_view').length,
        quoteClicks: analytics.filter(a => (a.event_type || a.event) === 'quote_click').length,
    };

    const username = profile?.username || (() => {
        const emailPart = (user?.email || '').split('@')[0] || 'profil';
        return emailPart
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 30) || 'profil';
    })();

    return (
        <DashboardPageClient stats={stats} projects={projects} profile={profile} username={username} />
    );
}