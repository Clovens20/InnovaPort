/**
 * API Route: POST /api/admin/messages/[id]/reply
 * 
 * Fonction: Envoie une réponse de l'admin à un message de contact
 * Dépendances: @supabase/supabase-js, resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAdminReplyEmail } from '@/utils/resend';
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
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('is_admin, full_name, email')
            .eq('id', user.id)
            .maybeSingle();

        if (profileError || !profile || !profile.is_admin) {
            return NextResponse.json(
                { error: 'Accès non autorisé. Admin requis.' },
                { status: 403 }
            );
        }

        // Récupérer le message
        const { data: message, error: messageError } = await supabaseAdmin
            .from('contact_messages')
            .select('*')
            .eq('id', id)
            .single();

        if (messageError || !message) {
            return NextResponse.json(
                { error: 'Message non trouvé' },
                { status: 404 }
            );
        }

        // Récupérer le corps de la requête
        const body = await request.json();
        const { replyMessage } = body;

        if (!replyMessage || !replyMessage.trim()) {
            return NextResponse.json(
                { error: 'Le message de réponse est requis' },
                { status: 400 }
            );
        }

        // Envoyer l'email de réponse
        try {
            await sendAdminReplyEmail({
                to: message.email,
                clientName: message.name,
                originalMessage: message.message,
                replyMessage: replyMessage.trim(),
                originalSubject: message.subject,
                adminName: profile.full_name || 'L\'équipe InnovaPort',
                adminEmail: profile.email,
            });
        } catch (emailError) {
            console.error('Error sending reply email:', emailError);
            return NextResponse.json(
                { error: 'Erreur lors de l\'envoi de l\'email' },
                { status: 500 }
            );
        }

        // Mettre à jour le statut du message à "replied"
        const { error: updateError } = await supabaseAdmin
            .from('contact_messages')
            .update({
                status: 'replied',
                replied_at: new Date().toISOString(),
            })
            .eq('id', id);

        if (updateError) {
            console.error('Error updating message status:', updateError);
            // Ne pas faire échouer la requête si l'email a été envoyé
        }

        return NextResponse.json({
            success: true,
            message: 'Réponse envoyée avec succès',
        });
    } catch (error: any) {
        console.error('Error in POST /api/admin/messages/[id]/reply:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

