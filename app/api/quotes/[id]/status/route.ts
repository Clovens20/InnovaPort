/**
 * API Route: PATCH /api/quotes/[id]/status
 * 
 * Fonction: Met à jour le statut d'un devis et envoie une notification au client si activé
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Permet de notifier automatiquement les clients lors des changements de statut
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStatusUpdateEmail } from '@/utils/resend';
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

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = await createServerClient();
        
        // Vérifier l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Récupérer le devis
        const { data: quote, error: quoteError } = await supabaseAdmin
            .from('quotes')
            .select('*, profiles!quotes_user_id_fkey(id, full_name, email)')
            .eq('id', id)
            .single();

        if (quoteError || !quote) {
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que l'utilisateur est le propriétaire du devis
        if (quote.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { status: newStatus } = body;

        if (!newStatus || !['new', 'discussing', 'quoted', 'accepted', 'rejected'].includes(newStatus)) {
            return NextResponse.json(
                { error: 'Statut invalide' },
                { status: 400 }
            );
        }

        const oldStatus = quote.status;

        // Mettre à jour le statut
        const { data: updatedQuote, error: updateError } = await supabaseAdmin
            .from('quotes')
            .update({ status: newStatus })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour' },
                { status: 500 }
            );
        }

        // Vérifier si les notifications de changement de statut sont activées
        const { data: reminderSettings } = await supabaseAdmin
            .from('quote_reminder_settings')
            .select('notify_on_status_change')
            .eq('user_id', user.id)
            .single();

        const shouldNotify = reminderSettings?.notify_on_status_change !== false; // Par défaut activé

        // Envoyer une notification au client si le statut a changé et si les notifications sont activées
        if (oldStatus !== newStatus && shouldNotify && quote.consent_contact) {
            try {
                const profile = quote.profiles as any;
                await sendStatusUpdateEmail({
                    to: quote.email,
                    clientName: quote.name,
                    developerName: profile?.full_name || profile?.username || 'Développeur',
                    developerEmail: profile?.email,
                    quoteData: {
                        projectType: quote.project_type,
                        budget: quote.budget,
                    },
                    oldStatus,
                    newStatus,
                });
            } catch (emailError) {
                // Ne pas faire échouer la requête si l'email échoue
                console.error('Error sending status update email:', emailError);
            }
        }

        return NextResponse.json({
            success: true,
            quote: updatedQuote,
        });
    } catch (error: any) {
        console.error('Error in PATCH /api/quotes/[id]/status:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

