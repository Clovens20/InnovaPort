/**
 * API Route: POST /api/admin/promo-codes
 * 
 * Fonction: Permet aux admins de créer des codes promo en bypassant RLS
 * Dépendances: @supabase/supabase-js
 * Raison: Les admins doivent pouvoir créer des codes promo sans être bloqués par RLS
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
        // Vérifier l'authentification
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur est admin
        // D'abord, récupérer toutes les colonnes disponibles pour debug
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return NextResponse.json(
                { error: `Erreur lors de la récupération du profil: ${profileError.message}` },
                { status: 500 }
            );
        }

        if (!profile) {
            console.error('Profile not found for user:', user.id, user.email);
            return NextResponse.json(
                { error: `Profil non trouvé pour l'utilisateur ${user.email}. Assurez-vous que le profil existe dans la table profiles.` },
                { status: 404 }
            );
        }

        // La vérification admin est déjà faite dans le bloc précédent

        // Récupérer les données du body
        const body = await request.json();
        const {
            code,
            discount_type,
            discount_value,
            valid_from,
            valid_until,
            max_uses,
            applicable_plans,
            is_active,
        } = body;

        // Validation
        if (!code || !discount_type || !discount_value || !valid_from || !valid_until) {
            return NextResponse.json(
                { error: 'Code, type de réduction, valeur, date de début et date de fin sont requis' },
                { status: 400 }
            );
        }

        // Insérer le code promo en utilisant la service role key (bypass RLS)
        const { data, error } = await supabaseAdmin
            .from('promo_codes')
            .insert({
                code: code.toUpperCase().replace(/[^A-Z0-9]/g, ''),
                discount_type,
                discount_value,
                valid_from,
                valid_until,
                max_uses: max_uses || null,
                applicable_plans: applicable_plans && applicable_plans.length > 0 ? applicable_plans : null,
                is_active: is_active !== undefined ? is_active : true,
                current_uses: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating promo code:', error);
            return NextResponse.json(
                { error: `Erreur lors de la création: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/promo-codes:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        // Vérifier l'authentification
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur est admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return NextResponse.json(
                { error: `Erreur lors de la récupération du profil: ${profileError.message}` },
                { status: 500 }
            );
        }

        if (!profile) {
            console.error('Profile not found for user:', user.id, user.email);
            return NextResponse.json(
                { error: `Profil non trouvé pour l'utilisateur ${user.email}. Assurez-vous que le profil existe dans la table profiles.` },
                { status: 404 }
            );
        }

        const isAdmin = (profile as any).is_admin === true || (profile as any).role === 'admin';
        if (!isAdmin) {
            return NextResponse.json(
                { error: 'Accès non autorisé. Admin requis.' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { id, ...updateData } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'ID requis' },
                { status: 400 }
            );
        }

        const { data, error } = await supabaseAdmin
            .from('promo_codes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Error updating promo code:', error);
            return NextResponse.json(
                { error: `Erreur lors de la mise à jour: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error: any) {
        console.error('Error in PATCH /api/admin/promo-codes:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que l'utilisateur est admin
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
            return NextResponse.json(
                { error: `Erreur lors de la récupération du profil: ${profileError.message}` },
                { status: 500 }
            );
        }

        if (!profile) {
            console.error('Profile not found for user:', { userId: user.id, email: user.email });
            return NextResponse.json(
                { error: `Profil non trouvé pour l'utilisateur ${user.email}. Assurez-vous que le profil existe dans la table profiles.` },
                { status: 404 }
            );
        }

        // Vérifier si l'utilisateur est admin (support pour is_admin et role)
        const isAdmin = (profile as any).is_admin === true || (profile as any).role === 'admin';
        if (!isAdmin) {
            console.error('User is not admin:', { userId: user.id, email: user.email, profile: { is_admin: (profile as any).is_admin, role: (profile as any).role } });
            return NextResponse.json(
                { error: 'Accès non autorisé. Admin requis.' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'ID requis' },
                { status: 400 }
            );
        }

        const { error } = await supabaseAdmin
            .from('promo_codes')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting promo code:', error);
            return NextResponse.json(
                { error: `Erreur lors de la suppression: ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error: any) {
        console.error('Error in DELETE /api/admin/promo-codes:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

