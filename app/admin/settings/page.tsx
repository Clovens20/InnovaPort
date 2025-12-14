/**
 * Page: /admin/settings
 * 
 * Fonction: Permet aux admins de compléter et gérer leur profil
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AdminSettingsClient } from './AdminSettingsClient';

export const metadata = {
    title: "Mon Profil Admin | InnovaPort",
};

export default async function AdminSettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/settings');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <AdminSettingsClient initialProfile={profile} />
    );
}

