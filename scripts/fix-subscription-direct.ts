/**
 * Script direct pour corriger l'abonnement sans passer par l'API
 * Usage: npx tsx scripts/fix-subscription-direct.ts <user_id>
 */

import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { join } from 'path';

// Charger les variables d'environnement depuis .env.local
function loadEnv() {
    try {
        const envPath = join(process.cwd(), '.env.local');
        const envFile = readFileSync(envPath, 'utf-8');
        const envVars: Record<string, string> = {};
        
        envFile.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const [key, ...valueParts] = trimmed.split('=');
                if (key && valueParts.length > 0) {
                    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
                    envVars[key.trim()] = value.trim();
                }
            }
        });
        
        Object.entries(envVars).forEach(([key, value]) => {
            if (!process.env[key]) {
                process.env[key] = value;
            }
        });
    } catch (error) {
        console.warn('Could not load .env.local, using existing environment variables');
    }
}

loadEnv();

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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

async function fixSubscription(userId: string) {
    console.log(`\n🔍 Correction de l'abonnement pour l'utilisateur: ${userId}\n`);

    // 1. Vérifier le profil
    const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, full_name, subscription_tier, stripe_customer_id')
        .eq('id', userId)
        .single();

    if (profileError || !profile) {
        console.error('❌ Erreur lors de la récupération du profil:', profileError);
        return;
    }

    console.log('✅ Profil trouvé:');
    console.log(`   - Email: ${profile.email}`);
    console.log(`   - Nom: ${profile.full_name}`);
    console.log(`   - Plan actuel: ${profile.subscription_tier}`);
    console.log(`   - Stripe Customer ID: ${profile.stripe_customer_id || 'Aucun'}`);

    // 2. Vérifier dans Stripe
    let stripeSubscription: Stripe.Subscription | null = null;
    let stripeCustomer: Stripe.Customer | null = null;

    if (profile.stripe_customer_id) {
        try {
            stripeCustomer = await stripe.customers.retrieve(profile.stripe_customer_id) as Stripe.Customer;
            console.log('✅ Customer Stripe trouvé');
            
            const subscriptions = await stripe.subscriptions.list({
                customer: stripeCustomer.id,
                status: 'all',
                limit: 10,
            });

            if (subscriptions.data.length > 0) {
                stripeSubscription = subscriptions.data[0];
                console.log(`✅ Abonnement Stripe trouvé: ${stripeSubscription.id}, statut: ${stripeSubscription.status}`);
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération du customer:', error.message);
        }
    }

    if (!stripeCustomer && profile.email) {
        try {
            const customers = await stripe.customers.list({
                email: profile.email,
                limit: 1,
            });

            if (customers.data.length > 0) {
                stripeCustomer = customers.data[0];
                console.log(`✅ Customer Stripe trouvé par email: ${stripeCustomer.id}`);
                
                const subscriptions = await stripe.subscriptions.list({
                    customer: stripeCustomer.id,
                    status: 'all',
                    limit: 10,
                });

                if (subscriptions.data.length > 0) {
                    stripeSubscription = subscriptions.data[0];
                    console.log(`✅ Abonnement Stripe trouvé: ${stripeSubscription.id}`);
                }
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la recherche par email:', error.message);
        }
    }

    // 3. Déterminer le plan correct
    let correctPlan = 'free';
    if (stripeSubscription && stripeSubscription.status === 'active') {
        const priceId = stripeSubscription.items.data[0]?.price?.id;
        if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
            correctPlan = 'pro';
        } else if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
            correctPlan = 'premium';
        }
        console.log(`\n📝 Plan correct détecté depuis Stripe: ${correctPlan}`);
    } else {
        console.log(`\n⚠️ Aucun abonnement actif trouvé dans Stripe. Plan restera: ${correctPlan}`);
    }

    // 4. Corriger les données
    console.log('\n🔧 Application des corrections...\n');

    // Mettre à jour le profil
    const { error: updateProfileError } = await supabaseAdmin
        .from('profiles')
        .update({
            subscription_tier: correctPlan,
            stripe_customer_id: stripeCustomer?.id || profile.stripe_customer_id,
            updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

    if (updateProfileError) {
        console.error('❌ Erreur lors de la mise à jour du profil:', updateProfileError);
        return;
    }
    console.log(`✅ Profil mis à jour: ${profile.subscription_tier} → ${correctPlan}`);

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
            console.error('❌ Erreur lors de la mise à jour de l\'abonnement:', upsertSubError);
            return;
        }
        console.log('✅ Abonnement mis à jour dans la base de données');
    }

    console.log('\n✅ Corrections appliquées avec succès!\n');
}

// Exécuter le script
const userId = process.argv[2];
if (!userId) {
    console.error('Usage: npx tsx scripts/fix-subscription-direct.ts <user_id>');
    process.exit(1);
}

fixSubscription(userId).catch(console.error);

