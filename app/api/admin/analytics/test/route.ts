/**
 * API Route: GET /api/admin/analytics/test
 * 
 * Fonction: Teste le système analytics pour diagnostiquer les problèmes
 * Dépendances: @supabase/supabase-js
 * Raison: Debugging du système analytics
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

        // Vérifier la structure de la table analytics
        let tableInfo = null;
        let tableError = null;
        try {
            const result = await supabase.rpc('get_table_info', { table_name: 'analytics' });
            tableInfo = result.data;
            tableError = result.error;
        } catch (err) {
            tableError = err instanceof Error ? err : new Error(String(err));
        }

        // Compter tous les événements
        const { count: totalCount, error: countError } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true });

        // Compter les événements avec user_id NULL
        const { count: nullUserIdCount, error: nullUserIdError } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .is('user_id', null);

        // Compter les événements page_view
        const { count: pageViewCount, error: pageViewError } = await supabase
            .from('analytics')
            .select('*', { count: 'exact', head: true })
            .eq('event_type', 'page_view');

        // Récupérer les 5 derniers événements
        const { data: recentEvents, error: recentError } = await supabase
            .from('analytics')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        // Vérifier si la colonne user_id peut être NULL
        const { data: columnInfo, error: columnError } = await supabase
            .from('analytics')
            .select('user_id')
            .limit(1);

        return NextResponse.json({
            diagnostics: {
                totalEvents: totalCount || 0,
                eventsWithNullUserId: nullUserIdCount || 0,
                pageViewEvents: pageViewCount || 0,
                recentEvents: recentEvents || [],
                columnInfo: columnInfo || [],
                errors: {
                    countError: countError?.message,
                    nullUserIdError: nullUserIdError?.message,
                    pageViewError: pageViewError?.message,
                    recentError: recentError?.message,
                    columnError: columnError?.message,
                },
            },
            message: 'Diagnostics analytics',
        });
    } catch (error) {
        console.error('Error in GET /api/admin/analytics/test:', error);
        return NextResponse.json({ 
            error: 'Erreur serveur interne',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}

