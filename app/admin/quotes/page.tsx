/**
 * Page: /admin/quotes
 * 
 * Fonction: Gérer tous les devis de tous les développeurs
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { QuotesAdminClient } from './QuotesAdminClient';

export const metadata = {
    title: "Devis & Formulaires | Admin InnovaPort",
};

export default async function AdminQuotesPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/quotes');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Récupérer TOUS les devis
    const { data: quotes, error } = await supabase
        .from('quotes')
        .select(`
            *,
            profiles:user_id (
                id,
                username,
                full_name,
                email
            )
        `)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching quotes:', error);
    }

    const { count: totalQuotes } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true });

    const { count: newQuotes } = await supabase
        .from('quotes')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'new');

    return (
        <QuotesAdminClient
            initialQuotes={quotes || []}
            totalQuotes={totalQuotes || 0}
            newQuotes={newQuotes || 0}
        />
    );
}

