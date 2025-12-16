import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET - Récupérer une page légale
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();

        const { data, error } = await supabase
            .from('legal_pages')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        // Si publiée, accessible à tous. Sinon, vérifier admin
        if (data.status !== 'published') {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('is_admin')
                    .eq('id', user.id)
                    .single();

                if (!profile?.is_admin) {
                    return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
                }
            } else {
                return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
            }
        }

        return NextResponse.json({ page: data });
    } catch (error: any) {
        console.error('Error fetching legal page:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// PUT - Mettre à jour une page légale
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Vérifier si admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const body = await request.json();
        const { title, content, meta_title, meta_description, status, major_changes } = body;

        const updateData: any = {
            title,
            content,
            meta_title: meta_title || null,
            meta_description: meta_description || null,
            status,
            major_changes: major_changes || false,
            last_updated_by: user.id,
            updated_at: new Date().toISOString(),
        };

        // Si on passe en publié pour la première fois
        if (status === 'published') {
            const { data: currentPage } = await supabase
                .from('legal_pages')
                .select('published_at')
                .eq('id', id)
                .single();

            if (!currentPage?.published_at) {
                updateData.published_at = new Date().toISOString();
            }
        }

        const { data, error } = await supabase
            .from('legal_pages')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ page: data });
    } catch (error: any) {
        console.error('Error updating legal page:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// DELETE - Supprimer une page légale
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Vérifier si admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .single();

        if (!profile?.is_admin) {
            return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
        }

        const { error } = await supabase
            .from('legal_pages')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting legal page:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

