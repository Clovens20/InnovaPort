/**
 * Page: /admin/testimonials
 * 
 * Fonction: Gérer les avis des développeurs sur la plateforme
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { DeveloperTestimonialsAdminClient } from './DeveloperTestimonialsAdminClient';

export const metadata = {
    title: "Avis Développeurs | Admin InnovaPort",
};

export default async function AdminTestimonialsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Récupérer les témoignages des développeurs
    const { data: testimonials, error } = await supabase
        .from('platform_testimonials')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching testimonials:', error);
    }

    // Récupérer les paramètres du site
    const { data: settings } = await supabase
        .from('site_settings')
        .select('developer_testimonials_enabled')
        .single();

    return (
        <DeveloperTestimonialsAdminClient
            initialTestimonials={testimonials || []}
            isEnabled={settings?.developer_testimonials_enabled || false}
        />
    );
}

