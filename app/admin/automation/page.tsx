/**
 * Page: /admin/automation
 * 
 * Fonction: Gérer l'automatisation pour tous les utilisateurs (templates, rappels, statistiques)
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { AutomationAdminClient } from './AutomationAdminClient';

export const metadata = {
    title: "Automatisation | Admin InnovaPort",
};

export default async function AdminAutomationPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login?redirectTo=/admin/automation');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Récupérer toutes les statistiques d'automatisation
    const { data: templates } = await supabase
        .from('auto_response_templates')
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

    const { data: reminderSettings } = await supabase
        .from('quote_reminder_settings')
        .select(`
            *,
            profiles:user_id (
                id,
                username,
                full_name,
                email
            )
        `);

    // Statistiques
    const { count: totalTemplates } = await supabase
        .from('auto_response_templates')
        .select('*', { count: 'exact', head: true });

    const { count: enabledTemplates } = await supabase
        .from('auto_response_templates')
        .select('*', { count: 'exact', head: true })
        .eq('enabled', true);

    const { count: usersWithReminders } = await supabase
        .from('quote_reminder_settings')
        .select('*', { count: 'exact', head: true })
        .eq('enabled', true);

    return (
        <AutomationAdminClient
            templates={templates || []}
            reminderSettings={reminderSettings || []}
            stats={{
                totalTemplates: totalTemplates || 0,
                enabledTemplates: enabledTemplates || 0,
                usersWithReminders: usersWithReminders || 0,
            }}
        />
    );
}

