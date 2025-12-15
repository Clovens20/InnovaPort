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
import { unstable_cache } from 'next/cache';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * OPTIMISATION: Créer un client Supabase anonyme pour le cache (sans cookies)
 * Ce client est utilisé uniquement pour les données publiques (portfolios)
 */
const supabasePublic = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
    }
);

/**
 * OPTIMISATION: Fonction helper pour récupérer le profil avec cache
 * Cache de 60 secondes pour réduire les requêtes DB sur les portfolios populaires
 * Utilise un client public (sans cookies) pour éviter l'erreur avec unstable_cache
 */
async function getCachedProfile(username: string) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabasePublic
                .from('profiles')
                .select('*')
                .eq('username', username)
                .single();
            return { data, error };
        },
        [`portfolio-profile-${username}`],
        {
            revalidate: 60, // Cache pendant 60 secondes
            tags: [`portfolio-${username}`], // Tag pour invalidation manuelle si nécessaire
        }
    )();
}

/**
 * OPTIMISATION: Fonction helper pour récupérer les projets avec cache
 * Cache de 120 secondes (plus long car les projets changent moins souvent)
 */
async function getCachedProjects(userId: string) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabasePublic
                .from('projects')
                .select('*')
                .eq('user_id', userId)
                .eq('published', true)
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false });
            return { data, error };
        },
        [`portfolio-projects-${userId}`],
        {
            revalidate: 120, // Cache pendant 120 secondes
            tags: [`portfolio-${userId}`, `projects-${userId}`],
        }
    )();
}

/**
 * OPTIMISATION: Fonction helper pour récupérer les témoignages avec cache
 * Cache de 180 secondes (encore plus long car les témoignages changent rarement)
 */
async function getCachedTestimonials(userId: string) {
    return unstable_cache(
        async () => {
            const { data, error } = await supabasePublic
                .from('testimonials')
                .select('*')
                .eq('user_id', userId)
                .eq('approved', true)
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false });
            return { data, error };
        },
        [`portfolio-testimonials-${userId}`],
        {
            revalidate: 180, // Cache pendant 180 secondes
            tags: [`portfolio-${userId}`, `testimonials-${userId}`],
        }
    )();
}

export default async function PortfolioPage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const { username } = await params;

    // OPTIMISATION: Récupérer le profil avec cache (60s)
    const { data: profile, error: profileError } = await getCachedProfile(username);

    if (profileError || !profile) {
        notFound();
    }

    // OPTIMISATION: Paralléliser les requêtes indépendantes avec cache
    // Ces deux requêtes ne dépendent que de profile.id et peuvent être exécutées en parallèle
    // Chaque requête utilise son propre cache pour maximiser les performances
    const [projectsResult, testimonialsResult] = await Promise.all([
        getCachedProjects(profile.id),
        getCachedTestimonials(profile.id),
    ]);

    const { data: projects, error: projectsError } = projectsResult;
    const { data: testimonials, error: testimonialsError } = testimonialsResult;

    if (projectsError) {
        // Log error for debugging (in production, this would go to a logging service)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching projects:', projectsError);
        }
    }

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
    
    // OPTIMISATION: Utiliser le même cache que la page principale pour les métadonnées
    // Cela évite une requête DB supplémentaire pour generateMetadata
    const { data: profile } = await getCachedProfile(username);

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

