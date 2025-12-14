/**
 * Page: /admin/security
 * 
 * Fonction: Gestion des rôles et permissions administrateurs
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { SecurityAdminClient } from './SecurityAdminClient';

export const metadata = {
    title: "Sécurité | Admin InnovaPort",
};

export default async function AdminSecurityPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/security');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Récupérer tous les admins
    const { data: admins } = await supabase
        .from('profiles')
        .select('id, username, full_name, email, role, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false });

    return (
        <SecurityAdminClient initialAdmins={admins || []} />
    );
}

