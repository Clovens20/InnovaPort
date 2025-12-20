/**
 * API Route: POST /api/quotes
 * 
 * Fonction: Enregistre une nouvelle demande de devis dans Supabase et envoie un email
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Endpoint public pour recevoir les demandes de devis depuis le formulaire
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendQuoteNotificationEmail, sendQuoteConfirmationEmail, sendAutoResponseEmail } from '@/utils/resend';
import { createQuoteSchema } from '@/lib/validations/schemas';
import { checkRateLimit, getRateLimitIdentifier } from '@/lib/rate-limit';
import { subscriptionLimits, canReceiveQuote } from '@/lib/subscription-limits';

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
    const rateLimitResult = await checkRateLimit(identifier, 5, 60000); // 5 req/min

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
            .select('id, username, full_name, email, subscription_tier')
            .eq('username', username)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Portfolio non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier la limite de devis/mois pour le plan gratuit
        const tier = (profile.subscription_tier || 'free') as 'free' | 'pro' | 'premium';
        const limits = subscriptionLimits[tier];
        
        if (limits.maxQuotesPerMonth !== null) {
            // Calculer le début du mois en cours (UTC)
            const now = new Date();
            const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
            
            // Compter les devis du mois en cours
            const { count: monthlyQuoteCount, error: countError } = await supabaseAdmin
                .from('quotes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .gte('created_at', startOfMonth.toISOString());

            if (countError) {
                console.error('Error counting monthly quotes:', countError);
            } else {
                // Vérifier si la limite est atteinte
                if (!canReceiveQuote(tier, monthlyQuoteCount || 0)) {
                    return NextResponse.json(
                        {
                            error: 'Limite de devis mensuelle atteinte',
                            message: `Le plan ${tier} permet ${limits.maxQuotesPerMonth} devis par mois maximum. Vous avez déjà reçu ${monthlyQuoteCount} devis ce mois-ci. Passez au plan Pro pour recevoir des devis illimités.`,
                        },
                        { status: 403 }
                    );
                }
            }
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

        // Fonction helper pour convertir le budget en nombre
        const parseBudgetToNumber = (budgetStr: string): number | null => {
            // Gérer les valeurs textuelles (small, medium, large, xl)
            const budgetMap: Record<string, number> = {
                'small': 2500,      // < 5 000€ -> moyenne de 2500€
                'medium': 7500,      // 5k€ - 10k€ -> moyenne de 7500€
                'large': 15000,     // 10k€ - 20k€ -> moyenne de 15000€
                'xl': 25000,        // > 20 000€ -> moyenne de 25000€
            };
            
            const lowerBudget = budgetStr.toLowerCase().trim();
            if (budgetMap[lowerBudget]) {
                return budgetMap[lowerBudget];
            }
            
            // Gérer les valeurs numériques: "1000-5000€" -> 1000, "5000+" -> 5000, "1000€" -> 1000
            const match = budgetStr.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : null;
        };

        // Récupérer les templates de réponses automatiques activés
        const { data: templates, error: templatesError } = await supabaseAdmin
            .from('auto_response_templates')
            .select('*')
            .eq('user_id', profile.id)
            .eq('enabled', true);

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
        ];

        // Gérer la réponse automatique au client
        if (!templatesError && templates && templates.length > 0) {
            // Trouver le template qui correspond aux conditions
            let matchedTemplate = null;
            
            for (const template of templates) {
                const conditions = template.conditions || {};
                let matches = true;
                
                // Vérifier les conditions
                if (conditions.project_type && conditions.project_type !== projectType) {
                    matches = false;
                }
                
                if (conditions.budget_range) {
                    // Logique pour vérifier la plage de budget
                    // Exemple: conditions.budget_range = { min: 1000, max: 5000 }
                    const budgetNum = parseBudgetToNumber(budget);
                    if (budgetNum !== null) {
                        if (conditions.budget_range.min && budgetNum < conditions.budget_range.min) {
                            matches = false;
                        }
                        if (conditions.budget_range.max && budgetNum > conditions.budget_range.max) {
                            matches = false;
                        }
                    }
                }
                
                if (matches) {
                    matchedTemplate = template;
                    break; // Utiliser le premier template qui correspond
                }
            }
            
            // Si un template correspond, l'utiliser
            if (matchedTemplate) {
                emailPromises.push(
                    sendAutoResponseEmail({
                        to: email,
                        clientName: name,
                        quoteData: {
                            projectType,
                            budget,
                            description,
                            deadline,
                            features: Array.isArray(features) ? features : [],
                        },
                        template: {
                            subject: matchedTemplate.subject,
                            body_html: matchedTemplate.body_html,
                        },
                        developerName: profile.full_name || profile.username,
                        developerEmail: profile.email || undefined,
                    }).catch((emailError) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.error('Error sending auto response email:', emailError);
                        }
                        // Ne pas faire échouer la requête si l'email échoue
                    })
                );
            } else {
                // Fallback sur l'email de confirmation par défaut
                emailPromises.push(
                    sendQuoteConfirmationEmail({
                        to: email,
                        clientName: name,
                    }).catch((emailError) => {
                        if (process.env.NODE_ENV === 'development') {
                            console.error('Error sending confirmation email:', emailError);
                        }
                        // Ne pas faire échouer la requête si l'email échoue
                    })
                );
            }
        } else {
            // Pas de templates configurés, utiliser l'email par défaut
            emailPromises.push(
                sendQuoteConfirmationEmail({
                    to: email,
                    clientName: name,
                }).catch((emailError) => {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Error sending confirmation email:', emailError);
                    }
                    // Ne pas faire échouer la requête si l'email échoue
                })
            );
        }

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

