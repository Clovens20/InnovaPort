import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// GET - Liste des pages légales
export async function GET(request: NextRequest) {
    try {
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

        const { data, error } = await supabase
            .from('legal_pages')
            .select('*')
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ pages: data });
    } catch (error: any) {
        console.error('Error fetching legal pages:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

// POST - Créer une nouvelle page légale
export async function POST(request: NextRequest) {
    try {
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
        const { slug, title, content, meta_title, meta_description, status, template_id } = body;

        // Validation
        if (!slug || !title || !content) {
            return NextResponse.json(
                { error: 'Slug, titre et contenu sont requis' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('legal_pages')
            .insert({
                slug,
                title,
                content,
                meta_title: meta_title || null,
                meta_description: meta_description || null,
                status: status || 'draft',
                template_id: template_id || 'default',
                last_updated_by: user.id,
                published_at: status === 'published' ? new Date().toISOString() : null,
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ page: data }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating legal page:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

