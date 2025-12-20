/**
 * API Route: POST /api/quotes/[id]/respond
 * 
 * Fonction: Envoie une réponse personnalisée du développeur au prospect
 * Dépendances: @supabase/supabase-js, resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { sendDeveloperResponseEmail } from '@/utils/resend';

// Utiliser la service role key pour accéder aux données
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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: quoteId } = await params;
        const body = await request.json();
        const { response, developerEmail } = body;

        if (!response || !response.trim()) {
            return NextResponse.json(
                { error: 'La réponse est requise' },
                { status: 400 }
            );
        }

        // Vérifier l'authentification de l'utilisateur
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            console.error('Auth error:', authError);
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // D'abord vérifier si le devis existe
        const { data: quoteCheck, error: quoteCheckError } = await supabaseAdmin
            .from('quotes')
            .select('id, user_id')
            .eq('id', quoteId)
            .single();

        if (quoteCheckError || !quoteCheck) {
            console.error('Quote not found:', quoteCheckError);
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que le devis appartient à l'utilisateur
        if (quoteCheck.user_id !== user.id) {
            console.error('Unauthorized access attempt:', {
                quoteUserId: quoteCheck.user_id,
                currentUserId: user.id,
            });
            return NextResponse.json(
                { error: 'Accès non autorisé à ce devis' },
                { status: 403 }
            );
        }

        // Récupérer tous les détails du devis
        const { data: quote, error: quoteError } = await supabaseAdmin
            .from('quotes')
            .select('*')
            .eq('id', quoteId)
            .single();

        if (quoteError || !quote) {
            console.error('Error fetching quote details:', quoteError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération du devis' },
                { status: 500 }
            );
        }

        // Récupérer le profil du développeur
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('full_name, email, username')
            .eq('id', user.id)
            .single();

        const developerName = profile?.full_name || profile?.username || 'Développeur';
        const developerEmailToUse = developerEmail || profile?.email;

        // Envoyer l'email de réponse
        await sendDeveloperResponseEmail({
            to: quote.email,
            clientName: quote.name,
            developerName,
            developerEmail: developerEmailToUse,
            developerResponse: response,
            quoteData: {
                projectType: quote.project_type,
                budget: quote.budget,
                description: quote.description,
                deadline: quote.deadline,
                features: Array.isArray(quote.features) ? quote.features : [],
                platforms: typeof quote.platforms === 'object' ? quote.platforms : undefined,
                designPref: quote.design_pref,
                company: quote.company,
                location: quote.location,
                phone: quote.phone,
            },
        });

        // Mettre à jour le statut du devis en "discussing" si c'était "new"
        if (quote.status === 'new') {
            await supabaseAdmin
                .from('quotes')
                .update({ status: 'discussing' })
                .eq('id', quoteId);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Réponse envoyée avec succès',
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Error in POST /api/quotes/[id]/respond:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

