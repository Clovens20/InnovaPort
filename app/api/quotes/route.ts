/**
 * API Route: POST /api/quotes
 * 
 * Fonction: Enregistre une nouvelle demande de devis dans Supabase et envoie un email
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Endpoint public pour recevoir les demandes de devis depuis le formulaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendQuoteNotificationEmail, sendQuoteConfirmationEmail } from '@/utils/resend';
import { createQuoteSchema } from '@/lib/validations/schemas';
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

export async function POST(request: NextRequest) {
    // OPTIMISATION: Rate limiting pour protéger contre les abus
    // Limite: 5 requêtes par minute par IP
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, 5, 60000); // 5 req/min

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
                    'X-RateLimit-Limit': '5',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                },
            }
        );
    }

    try {
        const body = await request.json();

        // Validation avec Zod
        const validationResult = createQuoteSchema.safeParse(body);

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

        const validatedData = validationResult.data;
        const {
            username,
            name,
            email,
            phone,
            company,
            location,
            projectType,
            platforms,
            budget,
            deadline,
            features,
            designPref,
            description,
            hasVagueIdea,
            contactPref,
            consentContact,
            consentPrivacy,
        } = validatedData;

        // Récupérer l'utilisateur par username
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, username, full_name, email')
            .eq('username', username)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Portfolio non trouvé' },
                { status: 404 }
            );
        }

        // Insérer le devis dans la base de données
        const { data: quote, error: insertError } = await supabaseAdmin
            .from('quotes')
            .insert({
                user_id: profile.id,
                name,
                email,
                phone: phone || null,
                company: company || null,
                location: location || null,
                project_type: projectType,
                platforms: platforms || {},
                budget,
                deadline: deadline || null,
                features: features || [],
                design_pref: designPref || null,
                description,
                has_vague_idea: hasVagueIdea || false,
                contact_pref: contactPref || 'Email',
                consent_contact: consentContact || false,
                consent_privacy: consentPrivacy || false,
                status: 'new',
            })
            .select()
            .single();

        if (insertError) {
            // Log error for debugging (in production, this would go to a logging service)
            if (process.env.NODE_ENV === 'development') {
                console.error('Error inserting quote:', insertError);
            }
            return NextResponse.json(
                { error: 'Erreur lors de l\'enregistrement du devis' },
                { status: 500 }
            );
        }

        // OPTIMISATION: Envoyer les deux emails en parallèle pour réduire le temps de réponse
        // Les deux emails sont indépendants et peuvent être envoyés simultanément
        const emailPromises = [
            // Envoyer l'email de notification au développeur
            sendQuoteNotificationEmail({
                to: profile.email || email, // Fallback sur l'email du client si pas d'email dans le profil
                developerName: profile.full_name || profile.username,
                quoteData: {
                    name,
                    email,
                    projectType,
                    budget,
                    description,
                },
            }).catch((emailError) => {
                // Log error for debugging (in production, this would go to a logging service)
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error sending notification email:', emailError);
                }
                // Ne pas faire échouer la requête si l'email échoue
            }),
            // Envoyer l'email de confirmation au client
            sendQuoteConfirmationEmail({
                to: email,
                clientName: name,
            }).catch((emailError) => {
                // Log error for debugging (in production, this would go to a logging service)
                if (process.env.NODE_ENV === 'development') {
                    console.error('Error sending confirmation email:', emailError);
                }
                // Ne pas faire échouer la requête si l'email échoue
            }),
        ];

        // Attendre que les deux emails soient envoyés (ou échouent silencieusement)
        await Promise.allSettled(emailPromises);

        const response = NextResponse.json(
            {
                success: true,
                message: 'Demande de devis enregistrée avec succès',
                quoteId: quote.id,
            },
            { status: 201 }
        );

        // Ajouter les headers de rate limit à la réponse
        response.headers.set('X-RateLimit-Limit', '5');
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));

        return response;
    } catch (error) {
        // Log error for debugging (in production, this would go to a logging service)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error in POST /api/quotes:', error);
        }
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

// Optionnel: GET pour récupérer les devis (protégé, nécessite auth)
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { error: 'Méthode non autorisée. Utilisez POST pour soumettre un devis.' },
        { status: 405 }
    );
}

