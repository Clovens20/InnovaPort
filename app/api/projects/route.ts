/**
 * API Route: POST /api/projects
 * 
 * Fonction: Crée ou met à jour un projet dans Supabase
 * Dépendances: @supabase/supabase-js, utils/supabase/server
 * Raison: Endpoint pour sauvegarder les projets depuis le formulaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createOrUpdateProjectSchema, getProjectSchema } from '@/lib/validations/schemas';
import { canCreateProject, subscriptionLimits } from '@/lib/subscription-limits';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validation avec Zod
        const validationResult = createOrUpdateProjectSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return NextResponse.json(
                {
                    error: 'Erreur de validation',
                    details: errors,
                },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;
        const {
            id,
            title,
            title_en,
            slug,
            category,
            short_description,
            short_description_en,
            full_description,
            full_description_en,
            problem,
            technologies,
            client_type,
            client_name,
            duration_value,
            duration_unit,
            project_url,
            tags,
            image_url,
            screenshots_url,
            featured,
            published,
        } = validatedData;

        const projectData = {
            user_id: user.id,
            title,
            title_en: title_en || null,
            slug,
            category: category || null,
            short_description: short_description || null,
            short_description_en: short_description_en || null,
            full_description: full_description || null,
            full_description_en: full_description_en || null,
            problem: problem || null,
            technologies: technologies || [],
            client_type: client_type || 'personal',
            client_name: client_name || null,
            duration_value: duration_value || null,
            duration_unit: duration_unit || 'weeks',
            project_url: project_url || null,
            tags: tags || null,
            image_url: image_url || null,
            screenshots_url: screenshots_url && screenshots_url.length > 0 ? screenshots_url : null,
            featured: featured || false,
            published: published || false,
        };

        let result;
        if (id) {
            // Mise à jour
            const { data, error } = await supabase
                .from('projects')
                .update(projectData)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur mise à jour:', error);
                return NextResponse.json(
                    { error: 'Erreur lors de la mise à jour du projet', details: error.message },
                    { status: 500 }
                );
            }

            result = data;
        } else {
            // Création - Vérifier la limite de projets pour le plan gratuit
            // Récupérer le profil pour connaître le plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            const tier = (profile?.subscription_tier || 'free') as 'free' | 'pro' | 'premium';

            // Compter les projets existants
            const { count } = await supabase
                .from('projects')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.id);

            // Vérifier si l'utilisateur peut créer un nouveau projet
            if (!canCreateProject(tier, count || 0)) {
                const limits = subscriptionLimits[tier];
                return NextResponse.json(
                    {
                        error: `Limite de projets atteinte. Le plan ${tier} permet ${limits.maxProjects} projets maximum. Passez au plan Pro pour des projets illimités.`,
                    },
                    { status: 403 }
                );
            }

            // Création
            const { data, error } = await supabase
                .from('projects')
                .insert(projectData)
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur création:', error);
                console.error('❌ Code erreur:', error.code);
                console.error('❌ Message:', error.message);
                console.error('❌ Détails:', error.details);
                
                // Vérifier si c'est une erreur de slug dupliqué
                if (error.code === '23505') {
                    return NextResponse.json(
                        { error: 'Un projet avec ce slug existe déjà. Choisissez un autre slug.' },
                        { status: 400 }
                    );
                }
                
                return NextResponse.json(
                    { error: 'Erreur lors de la création du projet', details: error.message },
                    { status: 500 }
                );
            }

            result = data;
        }

        return NextResponse.json(
            {
                success: true,
                message: id ? 'Projet mis à jour avec succès' : 'Projet créé avec succès',
                project: result,
            },
            { status: id ? 200 : 201 }
        );
    } catch (error) {
        console.error('❌ Erreur serveur:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

// GET pour récupérer un projet spécifique
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        // Validation avec Zod
        const validationResult = getProjectSchema.safeParse({ id });

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return NextResponse.json(
                {
                    error: 'Erreur de validation',
                    details: errors,
                },
                { status: 400 }
            );
        }

        const { id: validatedId } = validationResult.data;

        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', validatedId)
            .eq('user_id', user.id)
            .single();

        if (error || !data) {
            return NextResponse.json(
                { error: 'Projet non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ project: data });
    } catch (error) {
        console.error('❌ Erreur GET:', error);
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}