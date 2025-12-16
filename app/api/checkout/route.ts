import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
});

// Prix des plans (en centimes USD)
const PLAN_PRICES = {
    pro: 1900, // $19.00
    premium: 3900, // $39.00
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
        const { plan } = body;

        if (!plan || !['pro', 'premium'].includes(plan)) {
            return NextResponse.json(
                { error: 'Plan invalide' },
                { status: 400 }
            );
        }

        // Récupérer le profil
        const { data: profile } = await supabase
            .from('profiles')
            .select('id, email, full_name')
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
                // Récupérer le price ID depuis les variables d'environnement
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

                // Mettre à jour l'abonnement Stripe
                const subscription = await stripe.subscriptions.update(
                    existingSubscription.stripe_subscription_id,
                    {
                        items: [{
                            id: (await stripe.subscriptions.retrieve(existingSubscription.stripe_subscription_id)).items.data[0].id,
                            price: priceId,
                        }],
                        proration_behavior: 'always_invoice',
                    }
                );

                // Mettre à jour dans la base de données
                await supabase
                    .from('subscriptions')
                    .update({
                        plan: plan,
                        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
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

        // Créer ou récupérer le customer Stripe
        let customerId: string | null = null;

        // Chercher un customer existant dans Stripe par email
        const customers = await stripe.customers.list({
            email: profile.email || user.email || undefined,
            limit: 1,
        });

        if (customers.data.length > 0) {
            customerId = customers.data[0].id;
        } else {
            // Créer un nouveau customer
            const customer = await stripe.customers.create({
                email: profile.email || user.email || undefined,
                name: profile.full_name || undefined,
                metadata: {
                    user_id: user.id,
                },
            });
            customerId = customer.id;
        }

        // Récupérer le price ID depuis les variables d'environnement
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

        // Créer une session Checkout Stripe
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${baseUrl}/dashboard/billing?success=true&plan=${plan}`,
            cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
            metadata: {
                user_id: user.id,
                plan: plan,
            },
            subscription_data: {
                metadata: {
                    user_id: user.id,
                    plan: plan,
                },
            },
        });

        return NextResponse.json({
            success: true,
            sessionId: session.id,
            url: session.url,
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
