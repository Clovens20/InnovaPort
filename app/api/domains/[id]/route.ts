import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const updateDomainSchema = z.object({
    slug: z.string().max(50).regex(/^[a-z0-9-]+$/).optional(),
    is_primary: z.boolean().optional(),
});

/**
 * GET /api/domains/[id]
 * Récupère les détails d'un domaine spécifique
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        const { data: domain, error } = await supabase
            .from('custom_domains')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (error || !domain) {
            return NextResponse.json(
                { error: 'Domaine non trouvé' },
                { status: 404 }
            );
        }

        return NextResponse.json({ domain });
    } catch (error) {
        console.error('Error in GET /api/domains/[id]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/domains/[id]
 * Met à jour un domaine
 */
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que le domaine appartient à l'utilisateur
        const { data: existingDomain, error: checkError } = await supabase
            .from('custom_domains')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (checkError || !existingDomain) {
            return NextResponse.json(
                { error: 'Domaine non trouvé' },
                { status: 404 }
            );
        }

        // Parser et valider le body
        const body = await request.json();
        const validationResult = updateDomainSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Données invalides',
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        const { slug, is_primary } = validationResult.data;

        // Préparer les mises à jour
        const updates: any = {};
        if (slug !== undefined) {
            // Vérifier si le slug est déjà utilisé par un autre utilisateur
            const { data: existingSlug, error: slugError } = await supabase
                .from('profiles')
                .select('id')
                .eq('custom_slug', slug.toLowerCase())
                .neq('id', user.id)
                .single();

            if (existingSlug) {
                return NextResponse.json(
                    { error: 'Ce slug est déjà utilisé' },
                    { status: 409 }
                );
            }
            updates.slug = slug.toLowerCase();
        }
        if (is_primary !== undefined) {
            updates.is_primary = is_primary;
        }

        // Mettre à jour le domaine
        const { data: updatedDomain, error: updateError } = await supabase
            .from('custom_domains')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating domain:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du domaine' },
                { status: 500 }
            );
        }

        // Si le slug a été mis à jour, mettre à jour aussi le profil
        if (slug !== undefined) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ custom_slug: slug.toLowerCase() })
                .eq('id', user.id);

            if (profileError) {
                console.error('Error updating profile slug:', profileError);
                // Ne pas échouer si le profil ne peut pas être mis à jour
            }
        }

        return NextResponse.json({
            domain: updatedDomain,
            message: 'Domaine mis à jour avec succès'
        });
    } catch (error) {
        console.error('Error in PUT /api/domains/[id]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/domains/[id]
 * Supprime un domaine
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que le domaine appartient à l'utilisateur
        const { data: domain, error: checkError } = await supabase
            .from('custom_domains')
            .select('*')
            .eq('id', id)
            .eq('user_id', user.id)
            .single();

        if (checkError || !domain) {
            return NextResponse.json(
                { error: 'Domaine non trouvé' },
                { status: 404 }
            );
        }

        // Supprimer le domaine
        const { error: deleteError } = await supabase
            .from('custom_domains')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Error deleting domain:', deleteError);
            return NextResponse.json(
                { error: 'Erreur lors de la suppression du domaine' },
                { status: 500 }
            );
        }

        // Si c'était le domaine principal et qu'il avait un slug, nettoyer le slug du profil
        if (domain.is_primary && domain.slug) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ custom_slug: null })
                .eq('id', user.id)
                .eq('custom_slug', domain.slug);

            if (profileError) {
                console.error('Error cleaning profile slug:', profileError);
            }
        }

        return NextResponse.json({
            message: 'Domaine supprimé avec succès'
        });
    } catch (error) {
        console.error('Error in DELETE /api/domains/[id]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

