/**
 * Page: /admin/appearance
 * 
 * Fonction: Gérer l'apparence globale du site
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AppearanceAdminClient } from './AppearanceAdminClient';

export const metadata = {
    title: "Apparence | Admin InnovaPort",
};

export default async function AdminAppearancePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/appearance');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return <AppearanceAdminClient />;
}

