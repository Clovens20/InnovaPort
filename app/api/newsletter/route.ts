import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';

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

// Schéma de validation pour les inscriptions newsletter
const newsletterSchema = z.object({
    email: z.string().email('Email invalide'),
    source: z.enum(['blog', 'homepage', 'footer', 'other']).default('blog'),
});

export async function POST(request: NextRequest) {
    // Rate limiting: 3 requêtes par minute par IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, 3, 60000);

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            {
                error: 'Trop de requêtes',
                message: `Limite de 3 requêtes par minute atteinte. Réessayez dans ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} secondes.`,
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
        const validationResult = newsletterSchema.safeParse(body);

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

        const { email, source } = validationResult.data;

        // Vérifier si l'email existe déjà
        const { data: existingSubscription } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .select('id, status')
            .eq('email', email)
            .single();

        if (existingSubscription) {
            // Si déjà inscrit et actif, retourner un message de succès (pour éviter de révéler l'existence)
            if (existingSubscription.status === 'active') {
                return NextResponse.json(
                    {
                        success: true,
                        message: 'Vous êtes déjà inscrit à notre newsletter',
                    },
                    { status: 200 }
                );
            }

            // Si désinscrit, réactiver l'abonnement
            const { error: updateError } = await supabaseAdmin
                .from('newsletter_subscriptions')
                .update({
                    status: 'active',
                    source,
                    subscribed_at: new Date().toISOString(),
                    unsubscribed_at: null,
                })
                .eq('id', existingSubscription.id);

            if (updateError) {
                console.error('Error updating newsletter subscription:', updateError);
                return NextResponse.json(
                    { error: 'Erreur lors de la réactivation de l\'abonnement' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                {
                    success: true,
                    message: 'Votre abonnement a été réactivé',
                },
                { status: 200 }
            );
        }

        // Créer une nouvelle inscription
        const { data: subscription, error: insertError } = await supabaseAdmin
            .from('newsletter_subscriptions')
            .insert({
                email,
                source,
                status: 'active',
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting newsletter subscription:', insertError);
            return NextResponse.json(
                { error: 'Erreur lors de l\'inscription' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: 'Inscription réussie !',
                id: subscription.id,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error in POST /api/newsletter:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur' },
            { status: 500 }
        );
    }
}

