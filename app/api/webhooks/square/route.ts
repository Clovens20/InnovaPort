import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WebhooksHelper } from 'square';
import crypto from 'crypto';

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

// Vérifier la signature du webhook Square
function verifySquareWebhook(body: string, signature: string, webhookUrl: string): boolean {
    if (!process.env.SQUARE_WEBHOOK_SECRET) {
        console.warn('SQUARE_WEBHOOK_SECRET not set, skipping signature verification');
        return true; // En développement, on peut skip la vérification
    }
    
    const hmac = crypto.createHmac('sha256', process.env.SQUARE_WEBHOOK_SECRET);
    hmac.update(webhookUrl + body);
    const hash = hmac.digest('base64');
    return hash === signature;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const signature = request.headers.get('x-square-signature');
        const webhookUrl = request.url;

        if (!signature) {
            return NextResponse.json(
                { error: 'Signature manquante' },
                { status: 400 }
            );
        }

        // Vérifier la signature
        if (!verifySquareWebhook(body, signature, webhookUrl)) {
            console.error('Webhook signature verification failed');
            return NextResponse.json(
                { error: 'Signature invalide' },
                { status: 400 }
            );
        }

        const event = JSON.parse(body);
        const { type, data } = event;

        try {
            switch (type) {
                case 'subscription.created': {
                    const subscription = data.object?.subscription;
                    if (!subscription?.id) break;

                    // Récupérer le customer ID pour trouver l'utilisateur
                    const customerId = subscription.customerId;
                    if (!customerId) break;

                    // Trouver l'utilisateur par customer ID
                    const { data: subscriptionData } = await supabaseAdmin
                        .from('subscriptions')
                        .select('user_id')
                        .eq('square_customer_id', customerId)
                        .maybeSingle();

                    if (subscriptionData?.user_id) {
                        // Le plan est déjà défini lors de la création, on met juste à jour l'ID
                        await supabaseAdmin
                            .from('subscriptions')
                            .update({
                                square_subscription_id: subscription.id,
                                status: 'active',
                                current_period_start: subscription.phases?.[0]?.periods?.[0]?.startDate
                                    ? new Date(subscription.phases[0].periods[0].startDate).toISOString()
                                    : new Date().toISOString(),
                                    current_period_end: subscription.chargedThroughDate
                                        ? new Date(subscription.chargedThroughDate).toISOString()
                                        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                            })
                            .eq('square_customer_id', customerId);
                    }

                    break;
                }

                case 'subscription.updated': {
                    const subscription = data.object?.subscription;
                    if (!subscription?.id) break;

                    // Trouver l'abonnement par ID
                    const { data: subData } = await supabaseAdmin
                        .from('subscriptions')
                        .select('user_id, plan')
                        .eq('square_subscription_id', subscription.id)
                        .maybeSingle();

                    if (!subData) break;

                    // Mettre à jour l'abonnement
                    const periodStart = subscription.startDate
                        ? new Date(subscription.startDate).toISOString()
                        : null;
                    const periodEnd = subscription.chargedThroughDate
                        ? new Date(subscription.chargedThroughDate).toISOString()
                        : null;

                    await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            status: subscription.status === 'ACTIVE' ? 'active' : 'canceled',
                            current_period_start: periodStart,
                            current_period_end: periodEnd,
                            cancel_at_period_end: subscription.status === 'CANCELED' || false,
                            updated_at: new Date().toISOString(),
                        })
                        .eq('square_subscription_id', subscription.id);

                    // Mettre à jour le profil si l'abonnement est actif
                    if (subscription.status === 'ACTIVE' && subData.plan) {
                        await supabaseAdmin
                            .from('profiles')
                            .update({
                                subscription_tier: subData.plan,
                                updated_at: new Date().toISOString(),
                            })
                            .eq('id', subData.user_id);
                    }

                    break;
                }

                case 'subscription.canceled': {
                    const subscription = data.object?.subscription;
                    if (!subscription?.id) break;

                    // Trouver l'abonnement par ID
                    const { data: subData } = await supabaseAdmin
                        .from('subscriptions')
                        .select('user_id')
                        .eq('square_subscription_id', subscription.id)
                        .maybeSingle();

                    if (!subData) break;

                    // Mettre à jour l'abonnement
                    await supabaseAdmin
                        .from('subscriptions')
                        .update({
                            status: 'canceled',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('square_subscription_id', subscription.id);

                    // Revenir au plan gratuit
                    await supabaseAdmin
                        .from('profiles')
                        .update({
                            subscription_tier: 'free',
                            updated_at: new Date().toISOString(),
                        })
                        .eq('id', subData.user_id);

                    break;
                }

                default:
                    console.log(`Unhandled event type: ${type}`);
            }

            return NextResponse.json({ received: true });
        } catch (error) {
            console.error('Error processing webhook:', error);
            return NextResponse.json(
                { error: 'Erreur lors du traitement du webhook' },
                { status: 500 }
            );
        }
    } catch (error) {
        console.error('Error parsing webhook:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la lecture du webhook' },
            { status: 500 }
        );
    }
}
