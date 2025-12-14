/**
 * Page: /admin/promoCodes
 * 
 * Fonction: Gérer les codes promotionnels pour les développeurs
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { PromoCodesAdminClient } from './PromoCodesAdminClient';

export const metadata = {
    title: "Codes Promotionnels | Admin InnovaPort",
};

export default async function AdminPromoCodesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/promoCodes');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Récupérer tous les codes promo
    const { data: promoCodes, error } = await supabase
        .from('promo_codes')
        .select('*')
        .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching promo codes:', error);
    }

    return (
        <PromoCodesAdminClient initialPromoCodes={promoCodes || []} />
    );
}

