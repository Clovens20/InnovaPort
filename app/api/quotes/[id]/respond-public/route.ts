/**
 * API Route: POST /api/quotes/[id]/respond-public
 * 
 * Fonction: Permet au client de répondre publiquement à un devis (accepter, refuser, négocier)
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Route publique pour permettre aux clients de répondre directement depuis l'email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStatusUpdateEmail } from '@/utils/resend';
import { APP_URL } from '@/lib/constants';

// Fonction pour envoyer un email de notification au développeur
async function sendDeveloperNotification({
    to,
    developerName,
    clientName,
    action,
    projectType,
    budget,
    description,
    message,
}: {
    to: string;
    developerName: string;
    clientName: string;
    action: 'accept' | 'reject' | 'negotiate';
    projectType: string;
    budget: string;
    description: string;
    message?: string;
}) {
    const { sendDeveloperResponseEmail } = await import('@/utils/resend');
    
    const actionMessages = {
        accept: `Votre devis a été accepté par ${clientName} ! 🎉`,
        reject: `${clientName} a refusé votre devis.`,
        negotiate: `${clientName} souhaite négocier le prix de votre devis.`,
    };

    await sendDeveloperResponseEmail({
        to,
        developerName,
        clientName,
        developerResponse: actionMessages[action] + (message ? `\n\nMessage du client:\n${message}` : ''),
        quoteData: {
            projectType,
            budget,
            description,
        },
    });
}

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
        const { id } = await params;
        const body = await request.json();
        const { action, email, message } = body;

        // Validation
        if (!action || !['accept', 'reject', 'negotiate'].includes(action)) {
            return NextResponse.json(
                { error: 'Action invalide' },
                { status: 400 }
            );
        }

        if (!email) {
            return NextResponse.json(
                { error: 'Email requis' },
                { status: 400 }
            );
        }

        // Récupérer le devis
        const { data: quote, error: quoteError } = await supabaseAdmin
            .from('quotes')
            .select('*')
            .eq('id', id)
            .single();

        if (quoteError || !quote) {
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que l'email correspond
        if (quote.email.toLowerCase() !== email.toLowerCase()) {
            return NextResponse.json(
                { error: 'Email non autorisé' },
                { status: 403 }
            );
        }

        // Déterminer le nouveau statut
        let newStatus: 'accepted' | 'rejected' | 'discussing';
        let statusMessage: string;

        switch (action) {
            case 'accept':
                newStatus = 'accepted';
                statusMessage = 'accepté';
                break;
            case 'reject':
                newStatus = 'rejected';
                statusMessage = 'refusé';
                break;
            case 'negotiate':
                newStatus = 'discussing';
                statusMessage = 'en négociation';
                break;
            default:
                return NextResponse.json(
                    { error: 'Action invalide' },
                    { status: 400 }
                );
        }

        const oldStatus = quote.status;

        // Mettre à jour le statut
        const updateData: any = { status: newStatus };

        // Si c'est une négociation, ajouter le message dans les notes internes
        if (action === 'negotiate' && message) {
            const existingNotes = quote.internal_notes || '';
            const negotiationNote = `\n\n--- NÉGOCIATION CLIENT ---\nDate: ${new Date().toLocaleString('fr-FR')}\nMessage: ${message}\n`;
            updateData.internal_notes = existingNotes + negotiationNote;
        }

        const { data: updatedQuote, error: updateError } = await supabaseAdmin
            .from('quotes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating quote status:', updateError);
            return NextResponse.json(
                { error: `Erreur lors de la mise à jour: ${updateError.message}` },
                { status: 500 }
            );
        }

        // Récupérer le profil du développeur pour la notification
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('full_name, username, email')
            .eq('id', quote.user_id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
        }

        // Envoyer une notification au développeur
        if (profile?.email) {
            try {
                const developerName = profile.full_name || profile.username || 'Développeur';
                await sendDeveloperNotification({
                    to: profile.email,
                    developerName,
                    clientName: quote.name,
                    action: action as 'accept' | 'reject' | 'negotiate',
                    projectType: quote.project_type,
                    budget: quote.budget,
                    description: quote.description,
                    message: action === 'negotiate' ? message : undefined,
                });
            } catch (emailError) {
                console.error('Error sending notification email:', emailError);
                // Ne pas faire échouer la requête
            }
        }

        return NextResponse.json({
            success: true,
            message: `Devis ${statusMessage} avec succès`,
            status: newStatus,
        });
    } catch (error: any) {
        console.error('Error in POST /api/quotes/[id]/respond-public:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

