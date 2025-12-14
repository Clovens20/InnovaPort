/**
 * Page: /[username]
 * 
 * Fonction: Page portfolio publique dynamique qui charge les données depuis Supabase
 * Dépendances: @supabase/supabase-js, utils/supabase/server
 * Raison: Remplace la route /preview/[subdomain] avec des données réelles depuis la DB
 */

import { createClient } from '@/utils/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { PortfolioClient } from './portfolio-client';
import { hexToRgba } from '@/utils/color-utils';

export default async function PortfolioPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const supabase = await createClient();

    // Récupérer le profil par username
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

    if (profileError || !profile) {
        notFound();
    }

    // Récupérer les projets publiés
    const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', profile.id)
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

    if (projectsError) {
        // Log error for debugging (in production, this would go to a logging service)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching projects:', projectsError);
        }
    }

    // Récupérer les témoignages approuvés
    const { data: testimonials, error: testimonialsError } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', profile.id)
        .eq('approved', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

    if (testimonialsError) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching testimonials:', testimonialsError);
        }
    }

    // Styles dynamiques basés sur les couleurs du profil
    const primary = profile.primary_color || '#1E3A8A';
    const secondary = profile.secondary_color || '#10B981';
    const style = {
        '--primary': primary,
        '--secondary': secondary,
        '--primary-light': hexToRgba(primary, 0.1),
    } as React.CSSProperties;

    // Template selection
    const template = profile.template || 'modern';

    // Enregistrer la visite analytics (via client component pour éviter le blocage)
    const analyticsData = {
        userId: profile.id,
        eventType: 'portfolio_view',
        path: `/${username}`,
    };

    return (
        <PortfolioClient
            profile={profile}
            projects={projects || []}
            testimonials={testimonials || []}
            template={template}
            style={style}
            analyticsData={analyticsData}
        />
    );
}

// Générer les métadonnées pour le SEO
export async function generateMetadata({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;
    const supabase = await createClient();

    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, title, bio')
        .eq('username', username)
        .single();

    if (!profile) {
        return {
            title: 'Portfolio non trouvé',
        };
    }

    return {
        title: `${profile.full_name || username} - Portfolio`,
        description: profile.bio || profile.title || `Portfolio de ${profile.full_name || username}`,
    };
}

