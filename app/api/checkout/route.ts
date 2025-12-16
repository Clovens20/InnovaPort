/**
 * API Route: POST /api/checkout
 * 
 * Fonction: Crée une session Stripe Checkout bilingue avec support des codes promo
 * Dépendances: stripe, @supabase/supabase-js
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const supabasePublic = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Mapping des langues Stripe
const STRIPE_LOCALES: Record<string, string> = {
    'fr': 'fr',
    'en': 'en',
    'fr-FR': 'fr',
    'en-US': 'en',
    'en-GB': 'en',
};

// Prix des plans (en centimes USD)
const PLAN_PRICES = {
    pro: 1900, // $19.00
    premium: 3900, // $39.00
};

// Noms des plans traduits
const PLAN_NAMES = {
    fr: {
        pro: 'Pro',
        premium: 'Premium',
    },
    en: {
        pro: 'Pro',
        premium: 'Premium',
    },
};

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Vérifier que Stripe est configuré
        if (!process.env.STRIPE_SECRET_KEY) {
            return NextResponse.json(
                { 
                    error: 'Configuration Stripe manquante',
                    details: 'Les clés Stripe ne sont pas configurées. Veuillez contacter l\'administrateur.',
                    hint: 'Vérifiez que STRIPE_SECRET_KEY est configuré dans les variables d\'environnement'
                },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { plan, locale = 'en', promoCode } = body;

        // Valider la langue
        const language = locale === 'fr' ? 'fr' : 'en';
        const stripeLocale = STRIPE_LOCALES[locale] || 'en';

        if (!plan || !['pro', 'premium'].includes(plan)) {
            return NextResponse.json(
                { error: 'Plan invalide' },
                { status: 400 }
            );
        }

        // Récupérer le profil avec le stripe_customer_id s'il existe
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name, stripe_customer_id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json(
                { error: 'Profil non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier si l'utilisateur a déjà un abonnement actif
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id, plan, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        // Si l'utilisateur a déjà un abonnement Stripe actif, mettre à jour le plan
        if (existingSubscription?.stripe_subscription_id) {
            try {
                const priceId = plan === 'pro' 
                    ? process.env.STRIPE_PRICE_ID_PRO 
                    : process.env.STRIPE_PRICE_ID_PREMIUM;

                if (!priceId) {
                    return NextResponse.json(
                        { 
                            error: `Price ID non configuré pour ${plan}`,
                            details: `Vérifiez que STRIPE_PRICE_ID_${plan.toUpperCase()} est configuré dans les variables d'environnement`
                        },
                        { status: 500 }
                    );
                }

                // Récupérer d'abord la subscription pour obtenir l'item ID
                const currentSubscription = await stripe.subscriptions.retrieve(
                    existingSubscription.stripe_subscription_id
                );

                // Mettre à jour l'abonnement Stripe
                await stripe.subscriptions.update(
                    existingSubscription.stripe_subscription_id,
                    {
                        items: [{
                            id: currentSubscription.items.data[0].id,
                            price: priceId,
                        }],
                        proration_behavior: 'always_invoice',
                    }
                );

                // Récupérer la subscription mise à jour pour obtenir les nouvelles dates
                // Utiliser exactement le même pattern que dans le webhook qui fonctionne
                const updatedSubscription: any = await stripe.subscriptions.retrieve(
                    existingSubscription.stripe_subscription_id
                );
                
                // Utiliser l'accès direct aux propriétés comme dans le webhook
                await supabase
                    .from('subscriptions')
                    .update({
                        plan: plan,
                        current_period_start: new Date(updatedSubscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(updatedSubscription.current_period_end * 1000).toISOString(),
                        updated_at: new Date().toISOString(),
                    })
                    .eq('user_id', user.id);

                // Mettre à jour le profil
                await supabase
                    .from('profiles')
                    .update({
                        subscription_tier: plan,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', user.id);

                return NextResponse.json({
                    success: true,
                    message: 'Abonnement mis à jour avec succès',
                });
            } catch (stripeError: any) {
                console.error('Stripe subscription update error:', stripeError);
                return NextResponse.json(
                    { 
                        error: 'Erreur lors de la mise à jour de l\'abonnement',
                        details: stripeError.message || 'Erreur Stripe inconnue',
                    },
                    { status: 500 }
                );
            }
        }

        // Récupérer ou créer le customer Stripe
        // On vérifie d'abord si le profil a déjà un stripe_customer_id enregistré
        let customerId: string | null = profile.stripe_customer_id || null;
        
        // Si pas de customer ID dans le profil, chercher dans Stripe par email
        if (!customerId) {
            const customers = await stripe.customers.list({
                email: profile.email || user.email || undefined,
                limit: 1,
            });

            if (customers.data.length > 0) {
                customerId = customers.data[0].id;
                
                // Mettre à jour le profil avec le customer ID trouvé
                await supabase
                    .from('profiles')
                    .update({ stripe_customer_id: customerId })
                    .eq('id', user.id);
            } else {
                // Créer un nouveau customer Stripe
                const customer = await stripe.customers.create({
                    email: profile.email || user.email || undefined,
                    name: profile.full_name || undefined,
                    metadata: {
                        user_id: user.id,
                    },
                });
                customerId = customer.id;
                
                // Enregistrer le customer ID dans le profil
                await supabase
                    .from('profiles')
                    .update({ stripe_customer_id: customerId })
                    .eq('id', user.id);
            }
        }

        // Récupérer le price ID
        const priceId = plan === 'pro' 
            ? process.env.STRIPE_PRICE_ID_PRO 
            : process.env.STRIPE_PRICE_ID_PREMIUM;

        if (!priceId) {
            return NextResponse.json(
                { 
                    error: `Price ID non configuré pour ${plan}`,
                    details: `Vérifiez que STRIPE_PRICE_ID_${plan.toUpperCase()} est configuré dans les variables d'environnement`
                },
                { status: 500 }
            );
        }

        // Valider le code promo InnovaPort si fourni
        let innovaPortPromoCode: any = null;
        if (promoCode) {
            try {
                const promoResponse = await supabasePublic
                    .from('promo_codes')
                    .select('*')
                    .eq('code', promoCode.toUpperCase().trim())
                    .eq('is_active', true)
                    .single();

                if (promoResponse.data && !promoResponse.error) {
                    const promo = promoResponse.data;
                    const now = new Date();
                    const validFrom = new Date(promo.valid_from);
                    const validUntil = new Date(promo.valid_until);

                    // Vérifier la validité
                    if (now >= validFrom && now <= validUntil) {
                        if (!promo.max_uses || promo.current_uses < promo.max_uses) {
                            if (!promo.applicable_plans || promo.applicable_plans.includes(plan)) {
                                innovaPortPromoCode = promo;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Error validating InnovaPort promo code:', error);
                // On continue même si la validation échoue
            }
        }

        // Préparer les données de la session
        // Détecter automatiquement l'URL de base depuis les headers de la requête
        // Cela fonctionne en développement (localhost) et en production (domaine officiel)
        // Priorité: Variable d'environnement > Headers de la requête > Fallback localhost
        let baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL;
        
        if (!baseUrl) {
            // Détecter depuis les headers de la requête (fonctionne en production avec Vercel/autres plateformes)
            // Vercel utilise x-forwarded-proto et x-forwarded-host
            const protocol = request.headers.get('x-forwarded-proto') || 
                            (request.url.startsWith('https://') ? 'https' : 'http');
            const host = request.headers.get('x-forwarded-host') || 
                        request.headers.get('host') || 
                        'localhost:3000';
            baseUrl = `${protocol}://${host}`;
            
            // Logger pour debug (peut être retiré en production)
            console.log('Base URL détectée depuis headers:', baseUrl);
        }
        
        // S'assurer que l'URL ne se termine pas par un slash
        baseUrl = baseUrl.replace(/\/$/, '');
        
        const planName = PLAN_NAMES[language as 'fr' | 'en'][plan as 'pro' | 'premium'];
        
        // Créer les URLs avec la langue
        const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&lang=${language}&plan=${plan}`;
        const cancelUrl = `${baseUrl}/checkout/cancel?lang=${language}&plan=${plan}`;

        // Configuration de base de la session Stripe
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            locale: stripeLocale as Stripe.Checkout.SessionCreateParams.Locale,
            success_url: successUrl,
            cancel_url: cancelUrl,
            allow_promotion_codes: true, // Permettre les codes promo Stripe
            billing_address_collection: 'required', // Collecter l'adresse de facturation
            metadata: {
                user_id: user.id,
                plan: plan,
                language: language,
                plan_name: planName,
                timestamp: new Date().toISOString(),
                ...(innovaPortPromoCode && {
                    innovaport_promo_code: innovaPortPromoCode.code,
                    innovaport_discount_type: innovaPortPromoCode.discount_type,
                    innovaport_discount_value: innovaPortPromoCode.discount_value.toString(),
                }),
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    plan: plan,
                    language: language,
                    plan_name: planName,
                    ...(innovaPortPromoCode && {
                        innovaport_promo_code: innovaPortPromoCode.code,
                    }),
                },
            },
        };

        // Logique conditionnelle : utiliser SOIT customer SOIT customer_email, jamais les deux
        // Stripe n'accepte qu'un seul de ces paramètres à la fois
        if (customerId) {
            // Cas 1: Utilisateur existant avec customer ID Stripe
            // Utiliser le paramètre "customer" pour lier la session au customer existant
            sessionConfig.customer = customerId;
        } else if (profile.email || user.email) {
            // Cas 2: Nouvel utilisateur sans customer ID
            // Pré-remplir l'email avec "customer_email" pour faciliter le processus
            sessionConfig.customer_email = profile.email || user.email || undefined;
        }
        // Cas 3: Si aucun des deux n'est disponible, ne rien mettre
        // Stripe demandera l'email dans le formulaire de checkout

        // Si un code promo InnovaPort est valide, créer un coupon Stripe temporaire
        if (innovaPortPromoCode) {
            try {
                // Calculer le montant de la réduction
                const basePrice = PLAN_PRICES[plan as 'pro' | 'premium'];
                let discountAmount = 0;

                if (innovaPortPromoCode.discount_type === 'percentage') {
                    discountAmount = Math.round(basePrice * (innovaPortPromoCode.discount_value / 100));
                } else {
                    // Réduction fixe en centimes
                    discountAmount = Math.round(innovaPortPromoCode.discount_value * 100);
                }

                // Créer un coupon Stripe pour ce code promo
                const couponId = `innovaport_${innovaPortPromoCode.code.toLowerCase()}_${Date.now()}`;
                const coupon = await stripe.coupons.create({
                    id: couponId,
                    percent_off: innovaPortPromoCode.discount_type === 'percentage' 
                        ? innovaPortPromoCode.discount_value 
                        : undefined,
                    amount_off: innovaPortPromoCode.discount_type === 'fixed' 
                        ? discountAmount 
                        : undefined,
                    currency: 'usd',
                    duration: 'forever', // Réduction permanente sur l'abonnement
                    name: `InnovaPort ${innovaPortPromoCode.code}`,
                });

                // Appliquer le coupon à la session
                sessionConfig.discounts = [{
                    coupon: coupon.id,
                }];

                console.log(`Applied InnovaPort promo code: ${innovaPortPromoCode.code}`);
            } catch (couponError: any) {
                console.error('Error creating Stripe coupon for InnovaPort promo:', couponError);
                // On continue sans le coupon si la création échoue
            }
        }

        // Créer la session Checkout
        const session = await stripe.checkout.sessions.create(sessionConfig);

        // Logger l'événement
        console.log(`Checkout session created: ${session.id}`, {
            userId: user.id,
            plan,
            language,
            promoCode: innovaPortPromoCode?.code || null,
        });

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            url: session.url,
            language,
        });
    } catch (error: any) {
        console.error('Error creating checkout session:', error);
        
        return NextResponse.json(
            { 
                error: error.message || 'Erreur lors de la création de la session de paiement',
                details: error.details || undefined,
            },
            { status: error.status || 500 }
        );
    }
}
