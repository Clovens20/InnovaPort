/**
 * Page: /admin/projects
 * 
 * Fonction: Interface admin complète pour gérer tous les projets de tous les développeurs
 * Dépendances: @supabase/supabase-js, utils/supabase/server
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectsAdminClient } from './ProjectsAdminClient';

export const metadata = {
    title: "Gestion des Projets | Admin InnovaPort",
};

export default async function AdminProjectsPage() {
    // Vérification admin avec redirection automatique si non-admin
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login?redirectTo=/admin/projects');
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect('/dashboard');
    }

    // Récupérer TOUS les projets avec les informations des utilisateurs
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
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

    // Récupérer les statistiques globales
    const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

    const { count: publishedProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('published', true);

    const { count: featuredProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('featured', true);

    // Récupérer la liste des utilisateurs pour le filtre
    const { data: users } = await supabase
        .from('profiles')
        .select('id, username, full_name, email')
        .order('full_name');

    if (projectsError) {
        console.error('Error fetching projects:', projectsError);
    }

    return (
        <ProjectsAdminClient
            initialProjects={projects || []}
            totalProjects={totalProjects || 0}
            publishedProjects={publishedProjects || 0}
            featuredProjects={featuredProjects || 0}
            users={users || []}
        />
    );
}

