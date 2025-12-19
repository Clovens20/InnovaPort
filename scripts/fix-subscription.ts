/**
 * Script de diagnostic et correction des abonnements
 * Usage: npx tsx scripts/fix-subscription.ts <user_id>
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
        
        // Ajouter aux process.env
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

async function diagnoseAndFix(userId: string) {
    console.log(`\n🔍 Diagnostic pour l'utilisateur: ${userId}\n`);

    // 1. Vérifier le profil
    console.log('1️⃣ Vérification du profil...');
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
    console.log(`   - Plan actuel (profiles.subscription_tier): ${profile.subscription_tier}`);
    console.log(`   - Stripe Customer ID: ${profile.stripe_customer_id || 'Aucun'}`);

    // 2. Vérifier la table subscriptions
    console.log('\n2️⃣ Vérification de la table subscriptions...');
    const { data: subscription, error: subError } = await supabaseAdmin
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (subError) {
        console.error('❌ Erreur lors de la récupération de l\'abonnement:', subError);
    } else if (subscription) {
        console.log('✅ Abonnement trouvé dans la base de données:');
        console.log(`   - Plan: ${subscription.plan}`);
        console.log(`   - Statut: ${subscription.status}`);
        console.log(`   - Stripe Subscription ID: ${subscription.stripe_subscription_id || 'Aucun'}`);
        console.log(`   - Période: ${subscription.current_period_start} → ${subscription.current_period_end}`);
    } else {
        console.log('⚠️ Aucun abonnement trouvé dans la base de données');
    }

    // 3. Vérifier dans Stripe
    console.log('\n3️⃣ Vérification dans Stripe...');
    let stripeSubscription: Stripe.Subscription | null = null;
    let stripeCustomer: Stripe.Customer | null = null;

    if (profile.stripe_customer_id) {
        try {
            stripeCustomer = await stripe.customers.retrieve(profile.stripe_customer_id) as Stripe.Customer;
            console.log('✅ Customer Stripe trouvé:');
            console.log(`   - Customer ID: ${stripeCustomer.id}`);
            console.log(`   - Email: ${stripeCustomer.email}`);

            // Chercher les abonnements actifs
            const subscriptions = await stripe.subscriptions.list({
                customer: stripeCustomer.id,
                status: 'all',
                limit: 10,
            });

            if (subscriptions.data.length > 0) {
                stripeSubscription = subscriptions.data[0];
                console.log('\n✅ Abonnement Stripe trouvé:');
                console.log(`   - Subscription ID: ${stripeSubscription.id}`);
                console.log(`   - Statut: ${stripeSubscription.status}`);
                console.log(`   - Métadonnées:`, stripeSubscription.metadata);
                
                // Déterminer le plan depuis le price ID
                const priceId = stripeSubscription.items.data[0]?.price?.id;
                let planFromStripe = 'unknown';
                if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
                    planFromStripe = 'pro';
                } else if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
                    planFromStripe = 'premium';
                }
                console.log(`   - Plan (depuis Price ID): ${planFromStripe}`);
            } else {
                console.log('⚠️ Aucun abonnement trouvé dans Stripe');
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la récupération du customer Stripe:', error.message);
        }
    } else {
        // Chercher par email
        try {
            const customers = await stripe.customers.list({
                email: profile.email || undefined,
                limit: 1,
            });

            if (customers.data.length > 0) {
                stripeCustomer = customers.data[0];
                console.log('✅ Customer Stripe trouvé par email:');
                console.log(`   - Customer ID: ${stripeCustomer.id}`);

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
                    console.log('\n✅ Abonnement Stripe trouvé:');
                    console.log(`   - Subscription ID: ${stripeSubscription.id}`);
                    console.log(`   - Statut: ${stripeSubscription.status}`);
                }
            } else {
                console.log('⚠️ Aucun customer Stripe trouvé');
            }
        } catch (error: any) {
            console.error('❌ Erreur lors de la recherche par email:', error.message);
        }
    }

    // 4. Analyser les incohérences
    console.log('\n4️⃣ Analyse des incohérences...');
    const issues: string[] = [];

    if (profile.subscription_tier === 'free' && stripeSubscription && stripeSubscription.status === 'active') {
        issues.push('Le profil indique "free" mais il y a un abonnement actif dans Stripe');
    }

    if (subscription && subscription.plan !== profile.subscription_tier) {
        issues.push(`Incohérence: subscriptions.plan = "${subscription.plan}" mais profiles.subscription_tier = "${profile.subscription_tier}"`);
    }

    if (stripeSubscription && subscription && stripeSubscription.id !== subscription.stripe_subscription_id) {
        issues.push(`Incohérence: L\'ID d\'abonnement Stripe ne correspond pas à celui dans la base de données`);
    }

    if (issues.length === 0) {
        console.log('✅ Aucune incohérence détectée');
    } else {
        console.log('⚠️ Incohérences détectées:');
        issues.forEach((issue, i) => {
            console.log(`   ${i + 1}. ${issue}`);
        });
    }

    // 5. Proposer une correction
    if (issues.length > 0 && stripeSubscription && stripeSubscription.status === 'active') {
        console.log('\n5️⃣ Correction proposée...');
        
        // Déterminer le plan depuis Stripe
        const priceId = stripeSubscription.items.data[0]?.price?.id;
        let correctPlan = 'free';
        if (priceId === process.env.STRIPE_PRICE_ID_PRO) {
            correctPlan = 'pro';
        } else if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) {
            correctPlan = 'premium';
        }

        console.log(`\n📝 Plan correct détecté depuis Stripe: ${correctPlan}`);
        console.log('Voulez-vous corriger les données? (y/n)');
        
        // Pour l'automatisation, on peut utiliser un argument --fix
        const shouldFix = process.argv.includes('--fix');
        
        if (shouldFix || correctPlan !== 'free') {
            console.log('\n🔧 Application des corrections...');

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
            } else {
                console.log('✅ Profil mis à jour');
            }

            // Mettre à jour ou créer l'abonnement
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
            } else {
                console.log('✅ Abonnement mis à jour dans la base de données');
            }

            console.log('\n✅ Corrections appliquées avec succès!');
        }
    }

    console.log('\n✅ Diagnostic terminé\n');
}

// Exécuter le script
const userId = process.argv[2];
if (!userId) {
    console.error('Usage: npx tsx scripts/fix-subscription.ts <user_id> [--fix]');
    process.exit(1);
}

diagnoseAndFix(userId).catch(console.error);

