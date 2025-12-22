/**
 * API Route: POST /api/quotes/[id]/respond-negotiation
 * 
 * Fonction: Permet au développeur de répondre à une demande de négociation du client
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Gère les réponses aux négociations et envoie des notifications
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendDeveloperResponseEmail } from '@/utils/resend';
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

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { accept, responseMessage } = body;

        // Vérifier l'authentification
        const supabase = await createServerClient();
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
            .select('*')
            .eq('id', id)
            .single();

        if (quoteError || !quote) {
            return NextResponse.json(
                { error: 'Devis non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier que le devis appartient au développeur
        if (quote.user_id !== user.id) {
            return NextResponse.json(
                { error: 'Accès non autorisé' },
                { status: 403 }
            );
        }

        // Vérifier que le statut est "discussing" (en négociation)
        if (quote.status !== 'discussing') {
            return NextResponse.json(
                { error: 'Ce devis n\'est pas en négociation' },
                { status: 400 }
            );
        }

        // Déterminer le nouveau statut et le message
        let newStatus: 'quoted' | 'rejected';
        let statusMessage: string;
        let emailSubject: string;
        let emailMessage: string;

        if (accept) {
            newStatus = 'quoted';
            statusMessage = 'Négociation acceptée';
            emailSubject = `Votre demande de négociation a été acceptée - ${quote.project_type}`;
            emailMessage = `Bonjour ${quote.name},\n\nJ'ai accepté votre demande de négociation pour le projet "${quote.project_type}".\n\n`;
        } else {
            newStatus = 'rejected';
            statusMessage = 'Négociation refusée';
            emailSubject = `Réponse à votre demande de négociation - ${quote.project_type}`;
            emailMessage = `Bonjour ${quote.name},\n\nJe ne peux malheureusement pas accepter votre demande de négociation pour le projet "${quote.project_type}".\n\n`;
        }

        // Ajouter le message de réponse si fourni
        if (responseMessage && responseMessage.trim()) {
            emailMessage += `\n${responseMessage.trim()}\n\n`;
        }

        emailMessage += `N'hésitez pas à me contacter si vous avez des questions.\n\nCordialement`;

        // Mettre à jour le statut et ajouter la réponse dans les notes internes
        const existingNotes = quote.internal_notes || '';
        const responseNote = `\n\n--- RÉPONSE DÉVELOPPEUR ---\nDate: ${new Date().toLocaleString('fr-FR')}\nAction: ${accept ? 'Accepté' : 'Refusé'}\nMessage: ${responseMessage || 'Aucun message'}\n`;
        
        const { data: updatedQuote, error: updateError } = await supabaseAdmin
            .from('quotes')
            .update({
                status: newStatus,
                internal_notes: existingNotes + responseNote,
            })
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating quote:', updateError);
            return NextResponse.json(
                { error: `Erreur lors de la mise à jour: ${updateError.message}` },
                { status: 500 }
            );
        }

        // Récupérer le profil du développeur
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('full_name, username, email')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
        }

        // Envoyer un email au client
        if (quote.consent_contact) {
            try {
                const developerName = profile?.full_name || profile?.username || 'Développeur';
                const developerEmail = profile?.email;

                await sendDeveloperResponseEmail({
                    to: quote.email,
                    clientName: quote.name,
                    developerName,
                    developerEmail,
                    developerResponse: emailMessage,
                    quoteData: {
                        projectType: quote.project_type,
                        budget: quote.budget,
                        description: quote.description,
                        deadline: quote.deadline,
                        features: quote.features,
                    },
                });
            } catch (emailError) {
                console.error('Error sending email:', emailError);
                // Ne pas faire échouer la requête si l'email échoue
            }
        }

        return NextResponse.json({
            success: true,
            message: statusMessage,
            status: newStatus,
        });
    } catch (error: any) {
        console.error('Error in POST /api/quotes/[id]/respond-negotiation:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

