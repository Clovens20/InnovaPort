import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

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
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
        return NextResponse.json(
            { error: 'Signature manquante' },
            { status: 400 }
        );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
        console.error('STRIPE_WEBHOOK_SECRET not configured');
        return NextResponse.json(
            { error: 'Webhook secret non configuré' },
            { status: 500 }
        );
    }

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;
                
                if (session.mode === 'subscription' && session.subscription) {
                    const subscription = await stripe.subscriptions.retrieve(
                        session.subscription as string,
                        { expand: ['default_payment_method'] }
                    );

                    let userId = session.metadata?.user_id || subscription.metadata?.user_id;
                    const plan = session.metadata?.plan || subscription.metadata?.plan || 'pro';
                    const innovaPortPromoCode = session.metadata?.innovaport_promo_code || subscription.metadata?.innovaport_promo_code;

                    // Si userId n'est pas dans les métadonnées, essayer de le récupérer depuis le customer
                    if (!userId && subscription.customer) {
                        try {
                            const customer = await stripe.customers.retrieve(subscription.customer as string);
                            if (typeof customer !== 'deleted' && customer.metadata?.user_id) {
                                userId = customer.metadata.user_id;
                                console.log(`User ID récupéré depuis le customer: ${userId}`);
                            }
                        } catch (error) {
                            console.error('Error retrieving customer:', error);
                        }
                    }

                    // Si toujours pas de userId, essayer de le trouver via le customer_id dans la base de données
                    if (!userId && subscription.customer) {
                        try {
                            const { data: existingProfile } = await supabaseAdmin
                                .from('profiles')
                                .select('id')
                                .eq('stripe_customer_id', subscription.customer as string)
                                .single();
                            
                            if (existingProfile) {
                                userId = existingProfile.id;
                                console.log(`User ID récupéré depuis la base de données via customer_id: ${userId}`);
                            }
                        } catch (error) {
                            console.error('Error finding user by customer_id:', error);
                        }
                    }

                    if (!userId) {
                        console.error('User ID not found in session metadata, subscription metadata, customer metadata, or database');
                        console.error('Session metadata:', JSON.stringify(session.metadata, null, 2));
                        console.error('Subscription metadata:', JSON.stringify(subscription.metadata, null, 2));
                        console.error('Subscription ID:', subscription.id);
                        console.error('Customer ID:', subscription.customer);
                        // Ne pas break, mais logger l'erreur pour investigation
                        break;
                    }

                    // Si un code promo InnovaPort a été utilisé, incrémenter le compteur
                    if (innovaPortPromoCode) {
                        try {
                            const { data: promoData } = await supabaseAdmin
                                .from('promo_codes')
                                .select('current_uses')
                                .eq('code', innovaPortPromoCode)
                                .single();
                            
                            if (promoData) {
                                await supabaseAdmin
                                    .from('promo_codes')
                                    .update({ 
                                        current_uses: (promoData.current_uses || 0) + 1,
                                    })
                                    .eq('code', innovaPortPromoCode);
                                console.log(`Incremented usage for InnovaPort promo code: ${innovaPortPromoCode}`);
                            }
                        } catch (error) {
                            console.error('Error incrementing promo code usage:', error);
                            // On continue même si l'incrémentation échoue
                        }
                    }

                    // Créer ou mettre à jour l'abonnement dans la base de données
                    // TypeScript peut avoir des problèmes avec les types Stripe, donc on utilise l'accès direct
                    const subscriptionData: any = subscription;
                    const { error: subscriptionError } = await supabaseAdmin
                        .from('subscriptions')
                        .upsert({
                            user_id: userId,
                            stripe_customer_id: subscription.customer as string,
                            stripe_subscription_id: subscription.id,
                            plan: plan,
                            status: subscription.status === 'active' ? 'active' : 'trialing',
                            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
                            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
                            cancel_at_period_end: subscription.cancel_at_period_end || false,
                        }, {
                            onConflict: 'stripe_subscription_id',
                        });

                    if (subscriptionError) {
                        console.error('Error upserting subscription:', subscriptionError);
                        throw subscriptionError;
                    }

                    // Mettre à jour le profil avec le customer_id et le plan
                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: plan,
                            stripe_customer_id: subscription.customer as string,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);

                    if (profileError) {
                        console.error('Error updating profile:', profileError);
                        throw profileError;
                    }

                    console.log(`✅ Subscription created/updated for user ${userId}, plan: ${plan}, subscription_id: ${subscription.id}`);
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as Stripe.Subscription;
                let userId = subscription.metadata?.user_id;

                // Si userId n'est pas dans les métadonnées, essayer de le récupérer depuis la base de données
                if (!userId) {
                    try {
                        const { data: existingSub } = await supabaseAdmin
                            .from('subscriptions')
                            .select('user_id')
                            .eq('stripe_subscription_id', subscription.id)
                            .single();
                        
                        if (existingSub) {
                            userId = existingSub.user_id;
                            console.log(`User ID récupéré depuis la base de données: ${userId}`);
                        }
                    } catch (error) {
                        console.error('Error finding user by subscription_id:', error);
                    }
                }

                if (!userId) {
                    console.error('User ID not found in subscription metadata or database');
                    console.error('Subscription ID:', subscription.id);
                    console.error('Subscription metadata:', JSON.stringify(subscription.metadata, null, 2));
                    break;
                }

                // Déterminer le plan depuis le price ID si disponible
                let plan = subscription.metadata?.plan;
                if (!plan && subscription.items.data.length > 0) {
                    const priceId = subscription.items.data[0].price.id;
                    if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
                        plan = 'pro';
                    } else if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
                        plan = 'premium';
                    }
                }
                // Fallback sur le plan existant dans la base de données si toujours pas trouvé
                if (!plan) {
                    try {
                        const { data: existingSub } = await supabaseAdmin
                            .from('subscriptions')
                            .select('plan')
                            .eq('stripe_subscription_id', subscription.id)
                            .single();
                        if (existingSub) {
                            plan = existingSub.plan;
                        }
                    } catch (error) {
                        console.error('Error retrieving existing plan:', error);
                    }
                }
                // Dernier fallback
                plan = plan || 'pro';

                // Mettre à jour l'abonnement dans la base de données
                // TypeScript peut avoir des problèmes avec les types Stripe, donc on utilise l'accès direct
                const subscriptionData: any = subscription;
                const { error: subscriptionError } = await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        plan: plan,
                        status: subscription.status === 'active' ? 'active' : 
                               subscription.status === 'trialing' ? 'trialing' :
                               subscription.status === 'past_due' ? 'past_due' : 'canceled',
                        current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
                        current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
                        cancel_at_period_end: subscription.cancel_at_period_end || false,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscription.id);

                if (subscriptionError) {
                    console.error('Error updating subscription:', subscriptionError);
                }

                // Mettre à jour le profil selon le statut
                if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'free',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);

                    if (profileError) {
                        console.error('Error updating profile to free:', profileError);
                    }
                } else if (subscription.status === 'active' || subscription.status === 'trialing') {
                    // Mettre à jour le plan si l'abonnement est actif
                    const { error: profileError } = await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: plan,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', userId);

                    if (profileError) {
                        console.error('Error updating profile plan:', profileError);
                    }
                }

                console.log(`✅ Subscription updated for user ${userId}, status: ${subscription.status}, plan: ${plan}`);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as Stripe.Subscription;
                const userId = subscription.metadata?.user_id;

                if (!userId) {
                    console.error('User ID not found in subscription metadata');
                    break;
                }

                // Mettre à jour l'abonnement dans la base de données
                await supabaseAdmin
                    .from('subscriptions')
                    .update({
                        status: 'canceled',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('stripe_subscription_id', subscription.id);

                // Remettre au plan gratuit
                await supabaseAdmin
                    .from('profiles')
                    .update({
                        subscription_tier: 'free',
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', userId);

                console.log(`Subscription deleted for user ${userId}`);
                break;
            }

            case 'invoice.payment_succeeded': {
                const invoice = event.data.object as Stripe.Invoice;
                const invoiceData: any = invoice;
                
                if (invoiceData.subscription) {
                    const subscription: any = await stripe.subscriptions.retrieve(
                        invoiceData.subscription as string
                    );
                    const userId = subscription.metadata?.user_id;

                    if (userId) {
                        // Mettre à jour les dates de période
                        await supabaseAdmin
                            .from('subscriptions')
                            .update({
                                current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
                                current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
                                updated_at: new Date().toISOString(),
                            })
                            .eq('stripe_subscription_id', subscription.id);
                    }
                }
                break;
            }

            case 'invoice.payment_failed': {
                const invoice = event.data.object as Stripe.Invoice;
                const invoiceData: any = invoice;
                
                if (invoiceData.subscription) {
                    const subscription: any = await stripe.subscriptions.retrieve(
                        invoiceData.subscription as string
                    );
                    const userId = subscription.metadata?.user_id;

                    if (userId) {
                        // Mettre à jour le statut en past_due
                        await supabaseAdmin
                            .from('subscriptions')
                            .update({
                                status: 'past_due',
                                updated_at: new Date().toISOString(),
                            })
                            .eq('stripe_subscription_id', subscription.id);
                    }
                }
                break;
            }

            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Error processing webhook:', error);
        return NextResponse.json(
            { error: 'Erreur lors du traitement du webhook' },
            { status: 500 }
        );
    }
}

