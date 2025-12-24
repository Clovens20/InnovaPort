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

    // Récupérer tous les utilisateurs avec leur rôle et plan actuel depuis subscriptions
    const { data: allUsers, error } = await supabase
        .from('profiles')
        .select(`
            id, 
            username, 
            full_name, 
            email, 
            role, 
            subscription_tier,
            created_at,
            subscriptions!left(plan, status)
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
    }

    // Traiter tous les utilisateurs de la table profiles
    // Afficher tous les utilisateurs, qu'ils aient un plan gratuit ou payant
    const validUsers = [];
    if (allUsers && allUsers.length > 0) {
        // Pour chaque utilisateur, déterminer son plan actuel
        for (const profileUser of allUsers) {
            // Utiliser le plan depuis subscriptions si disponible, sinon subscription_tier
            const subscriptions = Array.isArray(profileUser.subscriptions) 
                ? profileUser.subscriptions 
                : (profileUser.subscriptions ? [profileUser.subscriptions] : []);
            const activeSubscription = subscriptions.find((sub: any) => sub.status === 'active') || subscriptions[0];
            const currentPlan = activeSubscription?.plan || profileUser.subscription_tier || 'free';
            
            validUsers.push({
                ...profileUser,
                current_plan: currentPlan, // Plan actuel depuis subscriptions
                subscription_tier: currentPlan, // Pour compatibilité avec l'interface
            });
        }
    }

    // Compter tous les utilisateurs (gratuits et payants)
    const totalUsers = validUsers.length;
    const adminCount = validUsers.filter(u => u.role === 'admin').length;

    return (
        <UsersAdminClient
            initialUsers={validUsers}
            totalUsers={totalUsers}
            adminCount={adminCount}
        />
    );
}
