/**
 * Page: /admin/users
 * 
 * Fonction: Gérer les utilisateurs et admins du système
 */

import { createClient } from '@/utils/supabase/server';
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

    // Récupérer tous les utilisateurs avec leur rôle et plan
    const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, email, role, subscription_tier, created_at')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching users:', error);
    }

    const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

    return (
        <UsersAdminClient
            initialUsers={users || []}
            totalUsers={totalUsers || 0}
            adminCount={adminCount || 0}
        />
    );
}
