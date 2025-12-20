/**
 * API Route: POST /api/revalidate
 * 
 * Fonction: Invalider le cache du portfolio après modification
 * Dépendances: next/cache
 */

import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
    try {
        // Vérifier que l'utilisateur est authentifié
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const body = await request.json();
        const { username, userId } = body;

        if (!username && !userId) {
            return NextResponse.json({ error: 'Username ou userId requis' }, { status: 400 });
        }

        // Récupérer le username si seulement userId est fourni
        let finalUsername = username;
        if (!finalUsername && userId) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', userId)
                .single();

            if (profile) {
                finalUsername = profile.username;
            }
        }

        if (!finalUsername) {
            return NextResponse.json({ error: 'Username non trouvé' }, { status: 404 });
        }

        // Invalider le cache du portfolio
        // Note: Dans Next.js 16, revalidateTag et revalidatePath nécessitent un deuxième paramètre
        revalidateTag(`portfolio-${finalUsername}`, 'page');
        revalidateTag(`portfolio-profile-${finalUsername}`, 'page');
        
        if (userId) {
            revalidateTag(`portfolio-${userId}`, 'page');
            revalidateTag(`portfolio-projects-${userId}`, 'page');
            revalidateTag(`projects-${userId}`, 'page');
            revalidateTag(`portfolio-testimonials-${userId}`, 'page');
            revalidateTag(`testimonials-${userId}`, 'page');
        }

        // Invalider le chemin du portfolio
        revalidatePath(`/${finalUsername}`, 'page');
        revalidatePath(`/${finalUsername}/contact`, 'page');

        return NextResponse.json({ 
            success: true,
            message: `Cache invalidé pour ${finalUsername}`
        });
    } catch (error: any) {
        console.error('Error revalidating cache:', error);
        return NextResponse.json({ 
            error: error.message || 'Erreur lors de l\'invalidation du cache' 
        }, { status: 500 });
    }
}

