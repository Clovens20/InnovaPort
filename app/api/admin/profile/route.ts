/**
 * API Route: PATCH /api/admin/profile
 * 
 * Fonction: Permet aux admins de mettre à jour leur profil (contourne RLS)
 * Dépendances: @supabase/supabase-js
 * Raison: Les admins doivent pouvoir modifier leur profil même avec RLS activé
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

export async function PATCH(request: NextRequest) {
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
                { error: 'Accès refusé. Seuls les administrateurs peuvent modifier leur profil via cette route.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const {
            full_name,
            username,
            bio,
            title,
            website,
            linkedin_url,
            twitter_url,
            avatar_url,
        } = body;

        // Validation basique (seulement si username est fourni)
        if (username !== undefined) {
            if (!username || username.trim().length < 3) {
                return NextResponse.json(
                    { error: 'Le username doit contenir au moins 3 caractères' },
                    { status: 400 }
                );
            }

            // Vérifier l'unicité du username (sauf pour l'utilisateur actuel)
            const { data: existingProfile } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('username', username.trim().toLowerCase())
                .neq('id', user.id)
                .single();

            if (existingProfile) {
                return NextResponse.json(
                    { error: 'Ce username est déjà utilisé' },
                    { status: 400 }
                );
            }
        }

        // Construire l'objet de mise à jour dynamiquement
        const updateData: any = {};
        if (full_name !== undefined) updateData.full_name = full_name || null;
        if (username !== undefined) {
            updateData.username = username.trim().toLowerCase();
        }
        if (bio !== undefined) updateData.bio = bio || null;
        if (title !== undefined) updateData.title = title || null;
        if (website !== undefined) updateData.website = website || null;
        if (linkedin_url !== undefined) updateData.linkedin_url = linkedin_url || null;
        if (twitter_url !== undefined) updateData.twitter_url = twitter_url || null;
        if (avatar_url !== undefined) updateData.avatar_url = avatar_url || null;

        // Mettre à jour le profil avec le service role key (contourne RLS)
        const { data: updatedProfile, error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating admin profile:', updateError);
            return NextResponse.json(
                { error: updateError.message || 'Erreur lors de la mise à jour du profil' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            profile: updatedProfile,
        });
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/profile:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

