/**
 * Route API: /api/admin/users
 * 
 * Fonction: Créer et gérer les utilisateurs (admin uniquement)
 * Dépendances: @supabase/supabase-js (service role key)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

// Utiliser la service role key pour créer des utilisateurs
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

// Créer un utilisateur
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

        const body = await request.json();
        const { email, password, full_name, username, role } = body;

        if (!email || !password) {
            return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
        }

        // Générer un username si non fourni
        const finalUsername = username || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '-');

        // Créer l'utilisateur avec Supabase Admin
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name: full_name || null,
            },
        });

        if (authError) {
            return NextResponse.json({ error: authError.message }, { status: 400 });
        }

        if (!authData.user) {
            return NextResponse.json({ error: 'Erreur lors de la création de l\'utilisateur' }, { status: 500 });
        }

        // Mettre à jour le profil avec le rôle
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                role: role || 'developer',
                full_name: full_name || null,
                username: finalUsername,
            })
            .eq('id', authData.user.id);

        if (profileError) {
            // Si erreur, supprimer l'utilisateur créé
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            return NextResponse.json({ error: profileError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            user: {
                id: authData.user.id,
                email: authData.user.email,
            }
        });
    } catch (error: any) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

// Mettre à jour un utilisateur
export async function PUT(request: NextRequest) {
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

        const body = await request.json();
        const { id, full_name, username, role, subscription_tier } = body;

        if (!id) {
            return NextResponse.json({ error: 'ID utilisateur requis' }, { status: 400 });
        }

        const finalSubscriptionTier = subscription_tier || 'free';

        // Mettre à jour le profil
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
                role: role,
                full_name: full_name || null,
                username: username,
                subscription_tier: finalSubscriptionTier,
            })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // Synchroniser avec la table subscriptions
        // Vérifier si une subscription existe déjà pour cet utilisateur
        const { data: existingSubscription } = await supabaseAdmin
            .from('subscriptions')
            .select('id')
            .eq('user_id', id)
            .single();

        if (existingSubscription) {
            // Mettre à jour l'abonnement existant
            const { error: subscriptionUpdateError } = await supabaseAdmin
                .from('subscriptions')
                .update({
                    plan: finalSubscriptionTier,
                    status: finalSubscriptionTier === 'free' ? 'canceled' : 'active',
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', id);

            if (subscriptionUpdateError) {
                console.error('Error updating subscription:', subscriptionUpdateError);
                // Ne pas échouer la requête si la mise à jour de subscription échoue
                // mais logger l'erreur pour debug
            }
        } else {
            // Créer un nouvel abonnement si aucun n'existe
            const { error: subscriptionCreateError } = await supabaseAdmin
                .from('subscriptions')
                .insert({
                    user_id: id,
                    plan: finalSubscriptionTier,
                    status: finalSubscriptionTier === 'free' ? 'canceled' : 'active',
                });

            if (subscriptionCreateError) {
                console.error('Error creating subscription:', subscriptionCreateError);
                // Ne pas échouer la requête si la création de subscription échoue
                // mais logger l'erreur pour debug
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

// Récupérer la liste des utilisateurs valides (admin uniquement)
export async function GET(request: NextRequest) {
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

        // Récupérer tous les utilisateurs
        const { data: allUsers, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('id, username, full_name, email, role, subscription_tier, created_at')
            .order('created_at', { ascending: false });

        if (fetchError) {
            return NextResponse.json({ error: fetchError.message }, { status: 500 });
        }

        // Filtrer les utilisateurs qui existent réellement dans auth.users
        const validUsers = [];
        if (allUsers && allUsers.length > 0) {
            const userChecks = await Promise.allSettled(
                allUsers.map(async (profileUser) => {
                    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(profileUser.id);
                    if (!authError && authUser?.user) {
                        return profileUser;
                    }
                    return null;
                })
            );

            validUsers.push(
                ...userChecks
                    .filter((result) => result.status === 'fulfilled' && result.value !== null)
                    .map((result) => (result as PromiseFulfilledResult<any>).value)
            );
        }

        return NextResponse.json({ 
            users: validUsers,
            totalUsers: validUsers.length,
            adminCount: validUsers.filter(u => u.role === 'admin').length
        });
    } catch (error: any) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

