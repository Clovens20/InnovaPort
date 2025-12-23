/**
 * API Route: POST /api/analytics
 * 
 * Fonction: Enregistre les événements analytics (visites, clics) dans Supabase
 * Dépendances: @supabase/supabase-js
 * Raison: Tracking des visites portfolios et interactions pour les analytics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createAnalyticsSchema } from '@/lib/validations/schemas';
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
    // Limite: 20 requêtes par minute par IP (plus permissif car analytics est appelé fréquemment)
    const identifier = getRateLimitIdentifier(request);
    const rateLimitResult = await checkRateLimit(identifier, 20, 60000); // 20 req/min

    if (!rateLimitResult.allowed) {
        return NextResponse.json(
            {
                error: 'Trop de requêtes',
                message: `Limite de 20 requêtes par minute atteinte. Réessayez dans ${Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)} secondes.`,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
                    'X-RateLimit-Limit': '20',
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(rateLimitResult.resetTime),
                },
            }
        );
    }

    try {
        const body = await request.json();

        // Validation avec Zod
        const validationResult = createAnalyticsSchema.safeParse(body);

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
            userId,
            eventType,
            path,
            referrer,
            metadata,
        } = validatedData;

        // Récupérer les headers pour user_agent et IP
        const userAgent = request.headers.get('user-agent') || null;
        const forwardedFor = request.headers.get('x-forwarded-for');
        const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null;

        // Insérer l'événement analytics
        // Support pour les deux structures : event_type (nouveau) ou event (ancien)
        // Support pour user_id (nouveau) ou profile_id (ancien)
        // user_id peut être NULL pour les visiteurs anonymes du site principal
        const insertData: any = {
            path: path || null,
            referrer: referrer || null,
            user_agent: userAgent,
            ip_address: ipAddress,
        };

        // Utiliser user_id si disponible (peut être null pour visiteurs anonymes)
        if (userId) {
            insertData.user_id = userId;
            insertData.profile_id = userId; // Fallback pour compatibilité
        } else {
            // Pour les visiteurs anonymes, on ne définit pas user_id (sera NULL en DB)
            insertData.user_id = null;
        }

        // Utiliser event_type si disponible, sinon event
        if (eventType) {
            insertData.event_type = eventType;
            insertData.event = eventType; // Fallback pour compatibilité
        }

        // Utiliser metadata si disponible, sinon meta
        if (metadata) {
            insertData.metadata = metadata;
            insertData.meta = metadata; // Fallback pour compatibilité
        } else {
            insertData.metadata = {};
            insertData.meta = {};
        }

        const { error: insertError } = await supabaseAdmin
            .from('analytics')
            .insert(insertData);

        if (insertError) {
            // Log error for debugging (in production, this would go to a logging service)
            if (process.env.NODE_ENV === 'development') {
                console.error('Error inserting analytics:', insertError);
            }
            return NextResponse.json(
                { error: 'Erreur lors de l\'enregistrement de l\'analytics' },
                { status: 500 }
            );
        }

        const response = NextResponse.json(
            { success: true, message: 'Événement analytics enregistré' },
            { status: 201 }
        );

        // Ajouter les headers de rate limit à la réponse
        response.headers.set('X-RateLimit-Limit', '20');
        response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining));
        response.headers.set('X-RateLimit-Reset', String(rateLimitResult.resetTime));

        return response;
    } catch (error) {
        // Log error for debugging (in production, this would go to a logging service)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error in POST /api/analytics:', error);
        }
        return NextResponse.json(
            { error: 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

// Optionnel: GET pour récupérer les analytics (protégé, nécessite auth)
export async function GET(request: NextRequest) {
    return NextResponse.json(
        { error: 'Méthode non autorisée. Utilisez POST pour enregistrer un événement.' },
        { status: 405 }
    );
}

