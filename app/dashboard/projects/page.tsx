/**
 * Page: /dashboard/projects
 * 
 * Fonction: Liste des projets avec intégration Supabase
 * Dépendances: @supabase/supabase-js, utils/supabase/server
 * Raison: Affiche les vrais projets depuis la base de données
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { ProjectsPageClient } from './projects-page-client';
import { ProjectsClient } from './projects-client';

export default async function ProjectsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth/login');
    }

    // Récupérer les projets
    const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        // Log error for debugging (in production, this would go to a logging service)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching projects:', error);
        }
    }

    const projectsList = projects || [];

    return (
        <>
            <ProjectsPageClient projects={projectsList} />
            {/* Composant client pour les actions interactives */}
            <ProjectsClient projects={projectsList} />
        </>
    );
}
