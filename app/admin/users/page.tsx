/**
 * Page: /admin/users
 * 
 * Fonction: Gérer les utilisateurs et admins du système
 */

import { createClient } from '@/utils/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';
import { UsersAdminClient } from './UsersAdminClient';

export const metadata = {
    title: "Gestion des Utilisateurs | Admin InnovaPort",
};

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/users');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Créer un client admin pour vérifier l'existence dans auth.users
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

    // Récupérer tous les utilisateurs (sans jointure pour éviter l'erreur de relation)
    const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select(`
            id, 
            username, 
            full_name, 
            email, 
            role, 
            subscription_tier,
            created_at
        `)
        .order('created_at', { ascending: false });

    // Récupérer toutes les subscriptions séparément
    const { data: allSubscriptions, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('user_id, plan, status')
        .order('created_at', { ascending: false });

    if (usersError) {
        console.error('❌ Error fetching users:', usersError);
    }
    if (subscriptionsError) {
        console.error('❌ Error fetching subscriptions:', subscriptionsError);
    }

    // Créer un map des subscriptions par user_id pour un accès rapide
    const subscriptionsMap = new Map();
    if (allSubscriptions && allSubscriptions.length > 0) {
        allSubscriptions.forEach((sub: any) => {
            if (!subscriptionsMap.has(sub.user_id)) {
                subscriptionsMap.set(sub.user_id, []);
            }
            subscriptionsMap.get(sub.user_id).push(sub);
        });
    }

    // Log pour diagnostic
    console.log('📊 Users fetch result:', {
        usersError: usersError?.message,
        subscriptionsError: subscriptionsError?.message,
        allUsersCount: allUsers?.length || 0,
        allSubscriptionsCount: allSubscriptions?.length || 0,
        sample: allUsers?.slice(0, 2),
    });

    // Traiter tous les utilisateurs de la table profiles
    // Afficher tous les utilisateurs, qu'ils aient un plan gratuit ou payant
    const validUsers = [];
    if (allUsers && allUsers.length > 0) {
        // Pour chaque utilisateur, déterminer son plan actuel
        for (const profileUser of allUsers) {
            // Récupérer les subscriptions depuis le map
            const userSubscriptions = subscriptionsMap.get(profileUser.id) || [];
            const activeSubscription = userSubscriptions.find((sub: any) => sub.status === 'active') || userSubscriptions[0];
            
            // Utiliser le plan depuis subscriptions si disponible, sinon subscription_tier depuis profiles
            const currentPlan = activeSubscription?.plan || profileUser.subscription_tier || 'free';
            
            validUsers.push({
                id: profileUser.id,
                username: profileUser.username || '',
                full_name: profileUser.full_name || null,
                email: profileUser.email || null,
                role: profileUser.role || null,
                subscription_tier: currentPlan, // Pour compatibilité avec l'interface
                created_at: profileUser.created_at || new Date().toISOString(),
            });
        }
    }

    // Compter tous les utilisateurs (gratuits et payants)
    const totalUsers = validUsers.length;
    const adminCount = validUsers.filter(u => u.role === 'admin').length;

    // Log pour diagnostic (toujours actif pour voir les problèmes en production)
    console.log('📊 Users processed:', {
        totalInDB: allUsers?.length || 0,
        validUsers: validUsers.length,
        totalUsers,
        adminCount,
        sample: validUsers.slice(0, 3),
    });

    return (
        <UsersAdminClient
            initialUsers={validUsers}
            totalUsers={totalUsers}
            adminCount={adminCount}
        />
    );
}
