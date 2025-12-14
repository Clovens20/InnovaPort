import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { SquareClient, SquareEnvironment } from 'square';

const squareClient = new SquareClient({
    token: process.env.SQUARE_ACCESS_TOKEN!,
    environment: process.env.SQUARE_ENVIRONMENT === 'production' ? SquareEnvironment.Production : SquareEnvironment.Sandbox,
});

// Plan Variation IDs créés dans Square Dashboard > Subscriptions
const PLAN_VARIATION_IDS = {
    pro: process.env.SQUARE_PLAN_VARIATION_ID_PRO || '',
    premium: process.env.SQUARE_PLAN_VARIATION_ID_PREMIUM || '',
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

        // Vérifier si l'utilisateur a déjà un abonnement
        const { data: existingSubscription } = await supabase
            .from('subscriptions')
            .select('square_customer_id, square_subscription_id, plan, status')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

        // Si l'utilisateur a déjà un abonnement actif, on le met à jour
        if (existingSubscription?.square_subscription_id) {
            // Mettre à jour dans la base de données
            await supabase
                .from('subscriptions')
                .update({
                    plan: plan,
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
        }

        const subscriptionsApi = squareClient.subscriptions;
        const customersApi = squareClient.customers;

        // Créer ou récupérer le customer Square
        let customerId = existingSubscription?.square_customer_id;

        if (!customerId) {
            // Rechercher le customer par email
            const searchResponse = await customersApi.search({
                query: {
                    filter: {
                        emailAddress: {
                            exact: profile.email || user.email || undefined,
                        },
                    },
                },
            });

            if (searchResponse.customers && searchResponse.customers.length > 0) {
                customerId = searchResponse.customers[0].id || undefined;
            } else {
                // Créer un nouveau customer
                const customerResponse = await customersApi.create({
                    givenName: profile.full_name?.split(' ')[0] || undefined,
                    familyName: profile.full_name?.split(' ').slice(1).join(' ') || undefined,
                    emailAddress: profile.email || user.email || undefined,
                    note: `User ID: ${user.id}`,
                });

                if (!customerResponse.customer?.id) {
                    throw new Error('Impossible de créer le customer');
                }

                customerId = customerResponse.customer.id;

                // Enregistrer le customer ID
                await supabase
                    .from('subscriptions')
                    .upsert({
                        user_id: user.id,
                        square_customer_id: customerId,
                        plan: 'free',
                        status: 'active',
                    });
            }
        }

        if (!customerId) {
            throw new Error('Impossible de créer ou récupérer le customer');
        }

        const planVariationId = PLAN_VARIATION_IDS[plan as 'pro' | 'premium'];
        if (!planVariationId) {
            throw new Error(`Plan variation ID non configuré pour ${plan}`);
        }

        // Créer l'abonnement Square
        const subscriptionResponse = await subscriptionsApi.create({
            idempotencyKey: `${user.id}-${plan}-${Date.now()}`,
            locationId: process.env.SQUARE_LOCATION_ID!,
            planVariationId: planVariationId,
            customerId: customerId,
            startDate: new Date().toISOString().split('T')[0], // Aujourd'hui
            timezone: 'UTC',
            source: {
                name: 'InnovaPort',
            },
        });

        if (!subscriptionResponse.subscription?.id) {
            throw new Error('Impossible de créer l\'abonnement');
        }

        const subscription = subscriptionResponse.subscription;

        // Mettre à jour dans la base de données
        await supabase
            .from('subscriptions')
            .upsert({
                user_id: user.id,
                square_customer_id: customerId,
                square_subscription_id: subscription.id,
                plan: plan,
                status: 'active',
                current_period_start: new Date().toISOString(),
                current_period_end: subscription.chargedThroughDate
                    ? new Date(subscription.chargedThroughDate).toISOString()
                    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            });

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
            message: 'Abonnement créé avec succès',
            subscriptionId: subscription.id,
        });
    } catch (error: any) {
        console.error('Error creating subscription:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la création de l\'abonnement' },
            { status: 500 }
        );
    }
}
