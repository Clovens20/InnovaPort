/**
 * API Route: POST /api/admin/avatar
 * 
 * Fonction: Upload d'avatar pour les admins (contourne RLS du storage)
 * Dépendances: @supabase/supabase-js
 * Raison: Les admins doivent pouvoir uploader des avatars même avec RLS activé
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        
        // Vérifier l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur est admin
        const { data: profile } = await supabaseAdmin
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json(
                { error: 'Accès refusé. Seuls les administrateurs peuvent uploader des avatars via cette route.' },
                { status: 403 }
            );
        }

        // Récupérer le fichier depuis FormData
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'Aucun fichier fourni' },
                { status: 400 }
            );
        }

        // Vérifier la taille (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json(
                { error: 'Le fichier est trop volumineux (max 5MB)' },
                { status: 400 }
            );
        }

        // Vérifier le type de fichier
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'Le fichier doit être une image' },
                { status: 400 }
            );
        }

        // Générer le nom de fichier
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        // Le chemin doit être juste le nom du fichier, pas "avatars/filename"
        const filePath = fileName;

        // Upload vers Supabase Storage avec le service role key (contourne RLS)
        const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError);
            return NextResponse.json(
                { error: uploadError.message || 'Erreur lors de l\'upload de l\'avatar' },
                { status: 500 }
            );
        }

        // Récupérer l'URL publique
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Mettre à jour le profil
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({ avatar_url: publicUrl })
            .eq('id', user.id);

        if (updateError) {
            console.error('Error updating profile:', updateError);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du profil' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            avatar_url: publicUrl,
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/avatar:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

