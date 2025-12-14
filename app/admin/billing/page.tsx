/**
 * Page: /admin/billing
 * 
 * Fonction: Gérer les plans et prix des abonnements
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { BillingAdminClient } from './BillingAdminClient';

export const metadata = {
    title: "Plans & Prix | Admin InnovaPort",
};

export default async function AdminBillingPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/billing');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return <BillingAdminClient />;
}

