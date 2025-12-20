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

    // Récupérer tous les utilisateurs avec leur rôle et plan
    const { data: allUsers, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, email, role, subscription_tier, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
    }

    // Filtrer les utilisateurs qui existent réellement dans auth.users
    // Utiliser Promise.all pour paralléliser les vérifications
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

    // Compter uniquement les utilisateurs valides
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
