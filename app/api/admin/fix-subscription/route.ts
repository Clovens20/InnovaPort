/**
 * API Route: POST /api/admin/fix-subscription
 * 
 * Fonction: Corrige les incohérences d'abonnement pour un utilisateur
 * Usage: POST avec { userId: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { serverAdminCheck } from '@/utils/auth/serverAdminCheck';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    try {
        // Vérifier que l'utilisateur est admin
        const adminCheck = await serverAdminCheck();
        if (!adminCheck.isAdmin) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId } = body;

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID requis' },
                { status: 400 }
            );
        }

        console.log(`\n🔍 Diagnostic pour l'utilisateur: ${userId}\n`);

        // 1. Vérifier le profil
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, subscription_tier, stripe_customer_id')
            .eq('id', userId)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Profil non trouvé', details: profileError },
                { status: 404 }
            );
        }

        // 2. Vérifier la table subscriptions
        const { data: subscription, error: subError } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

        // 3. Vérifier dans Stripe
        let stripeSubscription: Stripe.Subscription | null = null;
        let stripeCustomer: Stripe.Customer | null = null;

        if (profile.stripe_customer_id) {
            try {
                stripeCustomer = await stripe.customers.retrieve(profile.stripe_customer_id) as Stripe.Customer;
                
                // Chercher les abonnements actifs
                const subscriptions = await stripe.subscriptions.list({
                    customer: stripeCustomer.id,
                    status: 'all',
                    limit: 10,
                });

                if (subscriptions.data.length > 0) {
                    stripeSubscription = subscriptions.data[0];
                }
            } catch (error: any) {
                console.error('Error retrieving customer:', error.message);
            }
        } else if (profile.email) {
            // Chercher par email
            try {
                const customers = await stripe.customers.list({
                    email: profile.email,
                    limit: 1,
                });

                if (customers.data.length > 0) {
                    stripeCustomer = customers.data[0];
                    
                    // Mettre à jour le profil avec le customer ID
                    await supabaseAdmin
                        .from('profiles')
                        .update({ stripe_customer_id: stripeCustomer.id })
                        .eq('id', userId);

                    // Chercher les abonnements
                    const subscriptions = await stripe.subscriptions.list({
                        customer: stripeCustomer.id,
                        status: 'all',
                        limit: 10,
                    });

                    if (subscriptions.data.length > 0) {
                        stripeSubscription = subscriptions.data[0];
                    }
                }
            } catch (error: any) {
                console.error('Error finding customer by email:', error.message);
            }
        }

        // 4. Déterminer le plan correct
        let correctPlan = 'free';
        if (stripeSubscription && stripeSubscription.status === 'active') {
            const priceId = stripeSubscription.items.data[0]?.price?.id;
            if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
                correctPlan = 'pro';
            } else if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
                correctPlan = 'premium';
            }
        }

        // 5. Corriger les données
        const corrections: string[] = [];

        // Mettre à jour le profil
        if (profile.subscription_tier !== correctPlan) {
            const { error: updateProfileError } = await supabaseAdmin
                .from('profiles')
                .update({
                    subscription_tier: correctPlan,
                    stripe_customer_id: stripeCustomer?.id || profile.stripe_customer_id,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', userId);

            if (updateProfileError) {
                return NextResponse.json(
                    { error: 'Erreur lors de la mise à jour du profil', details: updateProfileError },
                    { status: 500 }
                );
            }
            corrections.push(`Profil mis à jour: ${profile.subscription_tier} → ${correctPlan}`);
        }

        // Mettre à jour ou créer l'abonnement
        if (stripeSubscription) {
            const subscriptionData: any = stripeSubscription;
            const { error: upsertSubError } = await supabaseAdmin
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    stripe_customer_id: stripeCustomer?.id || profile.stripe_customer_id,
                    stripe_subscription_id: stripeSubscription.id,
                    plan: correctPlan,
                    status: stripeSubscription.status === 'active' ? 'active' : 
                           stripeSubscription.status === 'trialing' ? 'trialing' :
                           stripeSubscription.status === 'past_due' ? 'past_due' : 'canceled',
                    current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
                    current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
                    cancel_at_period_end: stripeSubscription.cancel_at_period_end || false,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'stripe_subscription_id',
                });

            if (upsertSubError) {
                return NextResponse.json(
                    { error: 'Erreur lors de la mise à jour de l\'abonnement', details: upsertSubError },
                    { status: 500 }
                );
            }
            corrections.push(`Abonnement mis à jour dans la base de données`);
        }

        return NextResponse.json({
            success: true,
            userId,
            currentPlan: profile.subscription_tier,
            correctPlan,
            hasStripeSubscription: !!stripeSubscription,
            stripeSubscriptionStatus: stripeSubscription?.status,
            corrections,
            message: corrections.length > 0 
                ? 'Corrections appliquées avec succès' 
                : 'Aucune correction nécessaire',
        });
    } catch (error: any) {
        console.error('Error fixing subscription:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la correction', details: error.message },
            { status: 500 }
        );
    }
}

