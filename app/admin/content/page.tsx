/**
 * Page: /admin/content
 * 
 * Fonction: Gérer le contenu global des pages (landing, portfolio)
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ContentAdminClient } from './ContentAdminClient';

export const metadata = {
    title: "Pages & Contenu | Admin InnovaPort",
};

export default async function AdminContentPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/content');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    return <ContentAdminClient />;
}

