/**
 * API Route: PATCH /api/quotes/[id]/status
 * 
 * Fonction: Met à jour le statut d'un devis et envoie une notification au client si activé
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Permet de notifier automatiquement les clients lors des changements de statut
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendStatusUpdateEmail, sendQuoteCreatedEmail } from '@/utils/resend';
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
            .select('*')
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
        const { status: newStatus, quoteData } = body;

        if (!newStatus || !['new', 'discussing', 'quoted', 'accepted', 'rejected'].includes(newStatus)) {
            return NextResponse.json(
                { error: 'Statut invalide' },
                { status: 400 }
            );
        }

        const oldStatus = quote.status;

        // Préparer les données de mise à jour
        const updateData: any = { status: newStatus };
        
        // Si des données de devis sont fournies, les stocker dans internal_notes ou créer une colonne dédiée
        if (quoteData && typeof quoteData === 'object') {
            try {
                // Stocker les données du devis dans internal_notes au format JSON
                const existingNotes = quote.internal_notes || '';
                const quoteInfo = {
                    title: quoteData.title || '',
                    description: quoteData.description || '',
                    workProposal: quoteData.workProposal || '',
                    items: quoteData.items || [],
                    subtotal: quoteData.subtotal || 0,
                    tax: quoteData.tax || 0,
                    total: quoteData.total || 0,
                    validUntil: quoteData.validUntil || '',
                    paymentTerms: quoteData.paymentTerms || '30',
                    notes: quoteData.notes || '',
                    createdAt: new Date().toISOString(),
                };
                
                // Ajouter les données du devis aux notes internes
                const quoteDataJson = JSON.stringify(quoteInfo, null, 2);
                updateData.internal_notes = existingNotes 
                    ? `${existingNotes}\n\n--- DEVIS CRÉÉ ---\n${quoteDataJson}`
                    : `--- DEVIS CRÉÉ ---\n${quoteDataJson}`;
            } catch (jsonError) {
                console.error('Error processing quote data:', jsonError);
                // Continuer même si le JSON échoue, on met juste à jour le statut
            }
        }

        // Mettre à jour le statut et les données
        const { data: updatedQuote, error: updateError } = await supabaseAdmin
            .from('quotes')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (updateError) {
            console.error('Error updating quote status:', updateError);
            return NextResponse.json(
                { error: `Erreur lors de la mise à jour: ${updateError.message || 'Erreur inconnue'}` },
                { status: 500 }
            );
        }

        // Vérifier si les notifications de changement de statut sont activées
        // Utiliser .maybeSingle() au lieu de .single() pour éviter les erreurs si aucun enregistrement n'existe
        const { data: reminderSettings, error: reminderError } = await supabaseAdmin
            .from('quote_reminder_settings')
            .select('notify_on_status_change')
            .eq('user_id', user.id)
            .maybeSingle();

        // Ignorer l'erreur si aucun enregistrement n'existe (c'est normal)
        if (reminderError && reminderError.code !== 'PGRST116') {
            console.error('Error fetching reminder settings:', reminderError);
        }

        const shouldNotify = reminderSettings?.notify_on_status_change !== false; // Par défaut activé

        // Récupérer le profil du développeur une seule fois
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('full_name, username, email')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError) {
            console.error('Error fetching profile:', profileError);
        }

        const developerName = profile?.full_name || profile?.username || 'Développeur';
        const developerEmail = profile?.email;

        // Si un devis complet a été créé (quoteData fourni et status = 'quoted'), envoyer l'email détaillé
        if (quoteData && newStatus === 'quoted' && quote.consent_contact) {
            try {
                await sendQuoteCreatedEmail({
                    to: quote.email,
                    clientName: quote.name,
                    developerName,
                    developerEmail,
                    quoteData: {
                        title: quoteData.title || '',
                        description: quoteData.description || '',
                        workProposal: quoteData.workProposal || '',
                        items: quoteData.items || [],
                        subtotal: quoteData.subtotal || 0,
                        tax: quoteData.tax || 0,
                        total: quoteData.total || 0,
                        validUntil: quoteData.validUntil || '',
                        paymentTerms: quoteData.paymentTerms || '30',
                        notes: quoteData.notes || '',
                    },
                    projectType: quote.project_type,
                    quoteId: id,
                });
            } catch (emailError) {
                // Ne pas faire échouer la requête si l'email échoue
                console.error('Error sending quote created email:', emailError);
            }
        }
        // Sinon, envoyer une notification de changement de statut standard
        else if (oldStatus !== newStatus && shouldNotify && quote.consent_contact) {
            try {
                await sendStatusUpdateEmail({
                    to: quote.email,
                    clientName: quote.name,
                    developerName,
                    developerEmail,
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
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
        });
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne', details: process.env.NODE_ENV === 'development' ? error.stack : undefined },
            { status: 500 }
        );
    }
}

