import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { sendContactConfirmationEmail } from '@/utils/resend';

// Utiliser la service role key pour bypasser RLS lors de l'insertion publique
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

// Schéma de validation pour les messages de contact
const contactMessageSchema = z.object({
    name: z.string().min(1, 'Le nom est requis').max(255, 'Le nom est trop long'),
    email: z.string().email('Email invalide'),
    subject: z.string().max(500, 'Le sujet est trop long').optional(),
    message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
});

export async function POST(request: NextRequest) {
    // Rate limiting: 5 requêtes par minute par IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, 5, 60000);

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            {
                error: 'Trop de requêtes',
                message: `Limite de 5 requêtes par minute atteinte. Réessayez dans ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} secondes.`,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                },
            }
        );
    }

    try {
        const body = await request.json();

        // Validation avec Zod
        const validationResult = contactMessageSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));

            return NextResponse.json(
                {
                    error: 'Erreur de validation',
                    details: errors,
                },
                { status: 400 }
            );
        }

        const { name, email, subject, message } = validationResult.data;

        // Insérer le message dans la base de données
        const { data: contactMessage, error: insertError } = await supabaseAdmin
            .from('contact_messages')
            .insert({
                name,
                email,
                subject: subject || null,
                message,
                status: 'new',
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting contact message:', insertError);
            return NextResponse.json(
                { error: 'Erreur lors de l\'enregistrement du message' },
                { status: 500 }
            );
        }

        // Envoyer l'email de confirmation automatique
        try {
            await sendContactConfirmationEmail({
                to: email,
                name: name,
            });
        } catch (emailError) {
            // Ne pas faire échouer la requête si l'email échoue
            console.error('Error sending confirmation email:', emailError);
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Message envoyé avec succès',
                id: contactMessage.id,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error in POST /api/contact:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

