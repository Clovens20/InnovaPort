/**
 * API Route: GET /api/admin/revenue
 * 
 * Fonction: Récupère les revenus générés par les projets pour l'admin
 * Dépendances: @supabase/supabase-js
 * Raison: Analytics des revenus pour le tableau de bord admin
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

        // Prix des plans (en centimes USD)
        const PLAN_PRICES: { [key: string]: number } = {
            pro: 1900,      // 19$/mois = 1900 centimes
            premium: 4900,  // 49$/mois = 4900 centimes
        };

        // Récupérer les paramètres de filtre
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'all'; // all, month, year
        const startDate = getStartDate(period);

        // Récupérer tous les projets avec des revenus manuels
        let projectsQuery = supabase
            .from('projects')
            .select(`
                id,
                title,
                revenue_amount,
                revenue_currency,
                revenue_date,
                created_at,
                user_id,
                profiles(username, full_name, email)
            `)
            .not('revenue_amount', 'is', null)
            .order('revenue_date', { ascending: false, nullsFirst: false });

        // Filtrer par période si nécessaire
        if (period !== 'all' && startDate) {
            projectsQuery = projectsQuery.gte('revenue_date', startDate.toISOString());
        }

        const { data: projects, error: projectsError } = await projectsQuery;

        // Récupérer tous les abonnements (actifs et passés) pour calculer les revenus historiques
        let subscriptionsQuery = supabase
            .from('subscriptions')
            .select(`
                id,
                user_id,
                plan,
                status,
                current_period_start,
                current_period_end,
                created_at,
                updated_at,
                profiles(username, full_name, email)
            `)
            .in('plan', ['pro', 'premium'])
            .order('created_at', { ascending: false });

        // Filtrer par période si nécessaire
        // Pour les abonnements, on inclut ceux qui ont été actifs pendant la période
        if (period !== 'all' && startDate) {
            // Inclure les abonnements qui ont commencé pendant la période
            // OU qui étaient actifs pendant la période (même s'ils sont maintenant annulés)
            subscriptionsQuery = subscriptionsQuery.gte('created_at', startDate.toISOString());
        }

        const { data: subscriptions, error: subscriptionsError } = await subscriptionsQuery;

        // Toujours chercher dans profiles pour les utilisateurs avec subscription_tier = pro/premium
        // qui n'ont peut-être pas d'entrée dans subscriptions
        const { data: allProfilesWithPlans, error: profilesError } = await supabase
            .from('profiles')
            .select(`
                id,
                username,
                full_name,
                email,
                subscription_tier,
                created_at,
                updated_at
            `)
            .in('subscription_tier', ['pro', 'premium']);

        // Récupérer les IDs des utilisateurs qui ont déjà une entrée dans subscriptions
        const subscriptionUserIds = new Set(
            (subscriptions || []).map((sub: any) => sub.user_id)
        );

        // Filtrer les profils qui n'ont PAS d'entrée dans subscriptions
        const profilesWithoutSubscriptions = (allProfilesWithPlans || []).filter(
            (profile: any) => !subscriptionUserIds.has(profile.id)
        );

        // Convertir les profils en format "subscriptions" pour le calcul des revenus
        const profilesWithPlans = profilesWithoutSubscriptions.map(profile => ({
            id: `profile-${profile.id}`,
            user_id: profile.id,
            plan: profile.subscription_tier,
            status: 'active', // On assume actif si dans profiles
            current_period_start: profile.created_at,
            current_period_end: null, // Sera calculé
            created_at: profile.created_at,
            updated_at: profile.updated_at,
            profiles: {
                username: profile.username,
                full_name: profile.full_name,
                email: profile.email,
            },
        }));

        if (profilesWithPlans.length > 0) {
            console.log(`Found ${profilesWithPlans.length} users with pro/premium plans in profiles but not in subscriptions table`);
        }

        if (projectsError) {
            console.error('Error fetching projects revenue:', projectsError);
        }
        if (subscriptionsError) {
            console.error('Error fetching subscriptions:', subscriptionsError);
        }

        // Combiner les abonnements de subscriptions et profiles
        const allSubscriptions = [
            ...(subscriptions || []),
            ...profilesWithPlans,
        ];

        // Convertir les abonnements en revenus
        // Pour chaque abonnement (actif ou passé), on calcule le revenu total
        const subscriptionRevenues = allSubscriptions.map(sub => {
            const profile = Array.isArray(sub.profiles) ? sub.profiles[0] : sub.profiles;
            const monthlyPrice = PLAN_PRICES[sub.plan] || 0;
            
            // Date de début : création de l'abonnement
            const subscriptionStart = new Date(sub.created_at);
            
            // Date de fin : 
            // - Si actif : fin de la période actuelle ou maintenant
            // - Si annulé/past_due : fin de la dernière période payée ou updated_at
            let subscriptionEnd: Date;
            
            if (sub.status === 'active') {
                // Abonnement actif : utiliser la fin de période ou maintenant
                subscriptionEnd = sub.current_period_end 
                    ? new Date(sub.current_period_end) 
                    : new Date();
            } else if (sub.status === 'canceled' || sub.status === 'past_due') {
                // Abonnement terminé : utiliser la fin de la dernière période payée
                // Si current_period_end existe, c'est la fin de la dernière période payée
                // Sinon, utiliser updated_at (date d'annulation) ou created_at + 1 mois minimum
                if (sub.current_period_end) {
                    subscriptionEnd = new Date(sub.current_period_end);
                } else if (sub.updated_at) {
                    subscriptionEnd = new Date(sub.updated_at);
                } else {
                    // Au minimum 1 mois si aucune date de fin
                    subscriptionEnd = new Date(subscriptionStart);
                    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);
                }
            } else {
                // Autres statuts (trialing, etc.) : utiliser la fin de période ou maintenant
                subscriptionEnd = sub.current_period_end 
                    ? new Date(sub.current_period_end) 
                    : new Date();
            }
            
            // Calculer le nombre de mois complets depuis le début jusqu'à la fin
            const daysDiff = Math.max(0, (subscriptionEnd.getTime() - subscriptionStart.getTime()) / (1000 * 60 * 60 * 24));
            // Arrondir au mois supérieur pour inclure le mois partiel
            // Minimum 1 mois (même si l'abonnement a été annulé rapidement)
            const monthsDiff = Math.max(1, Math.ceil(daysDiff / 30));
            
            // Revenu total = prix mensuel × nombre de mois
            const totalRevenue = monthlyPrice * monthsDiff;
            
            // Date de revenu : utiliser la date de création pour le graphique
            const revenueDate = sub.current_period_start || sub.created_at;
            
            return {
                id: `subscription-${sub.id}`,
                title: `Abonnement ${sub.plan.toUpperCase()} (${sub.status})`,
                revenueAmount: totalRevenue,
                revenueCurrency: 'USD',
                revenueDate: revenueDate,
                createdAt: sub.created_at,
                updatedAt: sub.updated_at,
                userId: sub.user_id,
                username: profile?.username,
                fullName: profile?.full_name,
                email: profile?.email,
                type: 'subscription',
                plan: sub.plan,
                status: sub.status,
                months: monthsDiff,
                monthlyPrice: monthlyPrice,
                startDate: subscriptionStart.toISOString(),
                endDate: subscriptionEnd.toISOString(),
            };
        });

        // Combiner les revenus des projets et des abonnements
        const allRevenues = [
            ...(projects || []).map(p => {
                const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles;
                return {
                    id: p.id,
                    title: p.title,
                    revenueAmount: p.revenue_amount,
                    revenueCurrency: p.revenue_currency || 'USD',
                    revenueDate: p.revenue_date,
                    createdAt: p.created_at,
                    userId: p.user_id,
                    username: profile?.username,
                    fullName: profile?.full_name,
                    email: profile?.email,
                    type: 'project',
                };
            }),
            ...subscriptionRevenues,
        ];

        if (allRevenues.length === 0) {
            return NextResponse.json({
                projects: [],
                subscriptions: [],
                allRevenues: [],
                stats: {
                    totalRevenue: 0,
                    totalProjects: 0,
                    totalSubscriptions: 0,
                    averageRevenue: 0,
                    currency: 'USD',
                },
                groupedByDate: [],
                groupedByUser: [],
                period,
            });
        }

        // Calculer les statistiques
        const totalRevenue = allRevenues.reduce((sum, r) => sum + (r.revenueAmount || 0), 0);
        const totalProjects = (projects || []).length;
        const totalSubscriptions = allSubscriptions.length; // Utiliser allSubscriptions qui inclut subscriptions + profiles
        const averageRevenue = allRevenues.length > 0 ? Math.round(totalRevenue / allRevenues.length) : 0;
        const currency = 'USD';

        // Grouper par date pour les graphiques
        const groupedByDate = groupByDate(allRevenues, period);

        // Grouper par utilisateur
        const groupedByUser = groupByUser(allRevenues);

        return NextResponse.json({
            projects: allRevenues.filter(r => r.type === 'project'),
            subscriptions: allRevenues.filter(r => r.type === 'subscription'),
            allRevenues: allRevenues.sort((a, b) => {
                const dateA = new Date(a.revenueDate || a.createdAt).getTime();
                const dateB = new Date(b.revenueDate || b.createdAt).getTime();
                return dateB - dateA;
            }),
            stats: {
                totalRevenue,
                totalProjects,
                totalSubscriptions,
                averageRevenue,
                currency,
            },
            groupedByDate,
            groupedByUser,
            period,
        });
    } catch (error) {
        console.error('Error in GET /api/admin/revenue:', error);
        return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
    }
}

function getStartDate(period: string): Date | null {
    if (period === 'all') {
        return null;
    }

    const now = new Date();
    const start = new Date();

    switch (period) {
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default:
            return null;
    }

    return start;
}

function groupByDate(revenues: any[], period: string): { date: string; revenue: number; count: number }[] {
    const grouped: { [key: string]: { revenue: number; count: number } } = {};

    revenues.forEach(revenue => {
        const date = new Date(revenue.revenueDate || revenue.createdAt);
        let key: string;

        switch (period) {
            case 'month':
                key = date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
                break;
            case 'year':
                key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
                break;
            default:
                key = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        }

        if (!grouped[key]) {
            grouped[key] = { revenue: 0, count: 0 };
        }

        grouped[key].revenue += revenue.revenueAmount || 0;
        grouped[key].count += 1;
    });

    return Object.entries(grouped)
        .map(([date, data]) => ({ date, revenue: data.revenue, count: data.count }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

function groupByUser(revenues: any[]): { userId: string; username: string; fullName: string; revenue: number; count: number }[] {
    const grouped: { [key: string]: { username: string; fullName: string; revenue: number; count: number } } = {};

    revenues.forEach(revenue => {
        const userId = revenue.userId;
        if (!userId) return;

        if (!grouped[userId]) {
            grouped[userId] = {
                username: revenue.username || 'N/A',
                fullName: revenue.fullName || 'N/A',
                revenue: 0,
                count: 0,
            };
        }

        grouped[userId].revenue += revenue.revenueAmount || 0;
        grouped[userId].count += 1;
    });

    return Object.entries(grouped)
        .map(([userId, data]) => ({
            userId,
            username: data.username,
            fullName: data.fullName,
            revenue: data.revenue,
            count: data.count,
        }))
        .sort((a, b) => b.revenue - a.revenue);
}

