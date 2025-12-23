/**
 * API Route: GET /api/admin/analytics
 * 
 * Fonction: Récupère les analytics du site innovaport.dev pour l'admin
 * Filtre les événements qui concernent le site principal (pas les portfolios utilisateurs)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        
        // Vérifier que l'utilisateur est admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        // Récupérer les paramètres de filtre
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'week'; // day, week, month, year
        const filterType = searchParams.get('filter') || 'all'; // all, site-only
        const startDate = getStartDate(period);

        // Récupérer tous les analytics de la période avec toutes les colonnes nécessaires
        // On récupère tous les événements et on filtre ensuite pour:
        // - user_id IS NULL (visiteurs anonymes du site principal)
        // - event_type = 'page_view' (pages vues du site principal)
        // - OU les événements avec user_id mais qui sont des pages du site principal
        let query = supabase
            .from('analytics')
            .select('id, user_id, event_type, event, path, referrer, user_agent, ip_address, metadata, created_at')
            .gte('created_at', startDate.toISOString())
            .order('created_at', { ascending: false });

        const { data: analytics, error } = await query;

        if (error) {
            console.error('Error fetching analytics:', error);
            return NextResponse.json({ error: 'Erreur lors de la récupération des analytics' }, { status: 500 });
        }

        // Pages connues du site principal innovaport.dev
        const mainSitePages = [
            '/',
            '/blog',
            '/contact',
            '/faq',
            '/docs',
            '/support',
            '/checkout',
            '/conditions-utilisation',
            '/mentions-legales',
            '/politique-confidentialite',
            '/politique-cookies',
        ];

        // Filtrer les analytics selon le type de filtre
        // Si filterType = 'all', on inclut tous les événements
        // Si filterType = 'site-only', on filtre pour ne garder que le site principal
        const filteredAnalytics = filterType === 'all' 
            ? (analytics || [])
            : (analytics || []).filter(item => {
            // Gérer les deux noms de colonnes : event_type (nouveau) ou event (ancien)
            const eventType = item.event_type || item.event;
            
            // Si user_id est NULL, c'est un visiteur anonyme du site principal
            if (!item.user_id) {
                return true;
            }
            
            // Si event_type est 'page_view', c'est probablement du site principal
            // (les portfolios utilisent 'portfolio_view')
            if (eventType === 'page_view') {
                return true;
            }
            
            // Si pas de path, on garde (peut être un événement générique)
            if (!item.path) {
                return true;
            }
            
            const path = item.path.toLowerCase();
            
            // Si c'est une page connue du site principal, on la garde
            if (mainSitePages.some(page => path === page || path.startsWith(page + '/'))) {
                return true;
            }
            
            // Si le path commence par "/blog/", "/legal/", "/preview/", "/quotes/", "/checkout/", "/auth/", on le garde
            if (path.startsWith('/blog/') || 
                path.startsWith('/legal/') || 
                path.startsWith('/preview/') ||
                path.startsWith('/quotes/') ||
                path.startsWith('/checkout/') ||
                path.startsWith('/auth/')) {
                return true;
            }
            
            // Si c'est un seul segment (ex: "/username"), c'est probablement un portfolio utilisateur
            const segments = path.split('/').filter((s: string) => s);
            if (segments.length === 1) {
                // Vérifier si c'est une page connue
                if (mainSitePages.includes('/' + segments[0])) {
                    return true;
                }
                // Sinon, c'est probablement un portfolio utilisateur
                return false;
            }
            
            // Si le path contient "/username/contact", "/username/about", etc., c'est un portfolio
            // Les portfolios ont généralement des sous-pages comme /contact, /about, /testimonial
            if (segments.length >= 2 && 
                ['contact', 'about', 'testimonial'].includes(segments[1])) {
                return false; // C'est un portfolio utilisateur
            }
            
            // Par défaut, on garde les autres paths (pour être sûr de ne rien manquer)
            return true;
        });

        // Calculer les statistiques
        // Gérer les deux noms de colonnes : event_type (nouveau) ou event (ancien)
        const stats = {
            totalVisits: filteredAnalytics.length,
            uniqueVisitors: new Set(filteredAnalytics.map(a => a.ip_address).filter(Boolean)).size,
            pageViews: filteredAnalytics.filter(a => {
                const eventType = a.event_type || a.event;
                return eventType === 'page_view' || eventType === 'portfolio_view';
            }).length,
            clicks: filteredAnalytics.filter(a => {
                const eventType = a.event_type || a.event;
                return eventType === 'quote_click' || 
                       eventType === 'contact_click' || 
                       eventType === 'click';
            }).length,
        };

        // Grouper par date pour les graphiques
        const groupedByDate = groupByDate(filteredAnalytics, period);

        return NextResponse.json({
            analytics: filteredAnalytics,
            stats,
            groupedByDate,
            period,
            filterType,
            totalInDatabase: analytics?.length || 0,
        });
    } catch (error) {
        console.error('Error in GET /api/admin/analytics:', error);
        return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
    }
}

function getStartDate(period: string): Date {
    const now = new Date();
    const start = new Date();

    switch (period) {
        case 'day':
            start.setHours(0, 0, 0, 0);
            break;
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            start.setDate(now.getDate() - 7);
    }

    return start;
}

function groupByDate(analytics: any[], period: string): { date: string; count: number }[] {
    const grouped: { [key: string]: number } = {};

    analytics.forEach(item => {
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
}

