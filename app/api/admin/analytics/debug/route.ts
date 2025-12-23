/**
 * API Route: GET /api/admin/analytics/debug
 * 
 * Fonction: Diagnostic pour vérifier le fonctionnement du système analytics
 * Permet de vérifier si les données sont bien enregistrées dans Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

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

        // Utiliser le service role pour bypasser RLS
        const supabaseAdmin = createAdminClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );

        // 1. Vérifier la structure de la table
        const { data: tableInfo, error: tableError } = await supabaseAdmin
            .from('analytics')
            .select('*')
            .limit(1);

        // 2. Compter tous les événements
        const { count: totalCount, error: countError } = await supabaseAdmin
            .from('analytics')
            .select('*', { count: 'exact', head: true });

        // 3. Compter les événements par type
        const { data: eventsByType, error: eventsError } = await supabaseAdmin
            .from('analytics')
            .select('event_type, event')
            .limit(1000);

        const eventTypeCounts: { [key: string]: number } = {};
        eventsByType?.forEach(event => {
            const type = event.event_type || event.event || 'unknown';
            eventTypeCounts[type] = (eventTypeCounts[type] || 0) + 1;
        });

        // 4. Compter les événements avec user_id NULL (visiteurs anonymes)
        const { count: anonymousCount, error: anonymousError } = await supabaseAdmin
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .is('user_id', null);

        // 5. Récupérer les 10 derniers événements
        const { data: recentEvents, error: recentError } = await supabaseAdmin
            .from('analytics')
            .select('id, user_id, event_type, event, path, referrer, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

        // 6. Vérifier les événements page_view
        const { count: pageViewCount, error: pageViewError } = await supabaseAdmin
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .or('event_type.eq.page_view,event.eq.page_view');

        // 7. Vérifier les événements des 7 derniers jours
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { count: last7DaysCount, error: last7DaysError } = await supabaseAdmin
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', sevenDaysAgo.toISOString());

        return NextResponse.json({
            success: true,
            diagnostics: {
                tableAccessible: !tableError,
                tableError: tableError?.message,
                totalEvents: totalCount || 0,
                countError: countError?.message,
                eventTypeCounts,
                eventsError: eventsError?.message,
                anonymousVisitors: anonymousCount || 0,
                anonymousError: anonymousError?.message,
                pageViewEvents: pageViewCount || 0,
                pageViewError: pageViewError?.message,
                last7DaysEvents: last7DaysCount || 0,
                last7DaysError: last7DaysError?.message,
                recentEvents: recentEvents?.map(e => ({
                    id: e.id,
                    user_id: e.user_id,
                    event_type: e.event_type || e.event,
                    path: e.path,
                    referrer: e.referrer,
                    created_at: e.created_at,
                })) || [],
                recentError: recentError?.message,
            },
            recommendations: [
                totalCount === 0 ? 'Aucun événement trouvé. Vérifiez que le PageTracker fonctionne.' : null,
                pageViewCount === 0 ? 'Aucun événement page_view trouvé. Vérifiez que le PageTracker envoie bien les événements.' : null,
                last7DaysCount === 0 ? 'Aucun événement dans les 7 derniers jours. Vérifiez que le tracking fonctionne en production.' : null,
            ].filter(Boolean),
        });
    } catch (error: any) {
        console.error('❌ Error in GET /api/admin/analytics/debug:', error);
        return NextResponse.json({ 
            error: 'Erreur serveur interne',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}

