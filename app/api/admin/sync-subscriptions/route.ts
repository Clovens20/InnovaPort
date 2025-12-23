/**
 * Route API: /api/admin/sync-subscriptions
 * 
 * Fonction: Synchronise les abonnements depuis profiles.subscription_tier vers subscriptions
 * Dépendances: @supabase/supabase-js (service role key)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

// Utiliser la service role key pour accéder à toutes les données
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(request: NextRequest) {
    try {
        // Vérifier que l'utilisateur est admin
        const supabase = await createServerClient();
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

        // Récupérer tous les utilisateurs avec subscription_tier = 'pro' ou 'premium'
        const { data: profilesWithPlans, error: profilesError } = await supabaseAdmin
            .from('profiles')
            .select('id, subscription_tier, created_at')
            .in('subscription_tier', ['pro', 'premium']);

        if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des profils' },
                { status: 500 }
            );
        }

        if (!profilesWithPlans || profilesWithPlans.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Aucun utilisateur avec plan pro/premium trouvé',
                synced: 0,
            });
        }

        // Récupérer tous les abonnements existants
        const { data: existingSubscriptions, error: subscriptionsError } = await supabaseAdmin
            .from('subscriptions')
            .select('user_id');

        if (subscriptionsError) {
            console.error('Error fetching subscriptions:', subscriptionsError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des abonnements' },
                { status: 500 }
            );
        }

        const existingUserIds = new Set(
            (existingSubscriptions || []).map((sub: any) => sub.user_id)
        );

        // Filtrer les utilisateurs qui n'ont pas d'abonnement
        const usersToSync = profilesWithPlans.filter(
            (profile: any) => !existingUserIds.has(profile.id)
        );

        if (usersToSync.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Tous les utilisateurs ont déjà un abonnement',
                synced: 0,
            });
        }

        // Créer les abonnements manquants
        // Utiliser uniquement les colonnes minimales requises (comme dans app/api/admin/users/route.ts)
        const subscriptionsToCreate = usersToSync.map((profile: any) => {
            // Colonnes minimales : user_id, plan, status
            // Les autres colonnes (created_at, updated_at, current_period_start, etc.) 
            // seront gérées par les valeurs par défaut ou mises à jour plus tard
            return {
                user_id: profile.id,
                plan: profile.subscription_tier,
                status: 'active',
            };
        });

        const { data: createdSubscriptions, error: createError } = await supabaseAdmin
            .from('subscriptions')
            .insert(subscriptionsToCreate)
            .select('id, user_id, plan');

        if (createError) {
            console.error('Error creating subscriptions:', createError);
            return NextResponse.json(
                { error: `Erreur lors de la création des abonnements: ${createError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: `${createdSubscriptions?.length || 0} abonnement(s) créé(s) avec succès`,
            synced: createdSubscriptions?.length || 0,
            subscriptions: createdSubscriptions,
        });
    } catch (error: any) {
        console.error('Error syncing subscriptions:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

