import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { subscriptionLimits, canAddCustomDomain, hasFeature } from '@/lib/subscription-limits';
import { manageSSL } from '@/lib/ssl-management';
import { z } from 'zod';

// Schéma de validation pour créer un domaine
const createDomainSchema = z.object({
    domain: z.string().min(1).max(255).regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/, {
        message: 'Format de domaine invalide'
    }),
    subdomain: z.string().max(63).regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/, {
        message: 'Format de sous-domaine invalide'
    }).optional(),
    slug: z.string().max(50).regex(/^[a-z0-9-]+$/, {
        message: 'Le slug ne peut contenir que des lettres minuscules, chiffres et tirets'
    }).optional(),
    is_primary: z.boolean().optional().default(false),
});

// Générer un token de vérification unique
function generateVerificationToken(): string {
    return `innovaport-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * GET /api/domains
 * Liste tous les domaines de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Récupérer les domaines de l'utilisateur
        const { data: domains, error } = await supabase
            .from('custom_domains')
            .select('*')
            .eq('user_id', user.id)
            .order('is_primary', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching domains:', error);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des domaines' },
                { status: 500 }
            );
        }

        return NextResponse.json({ domains: domains || [] });
    } catch (error) {
        console.error('Error in GET /api/domains:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/domains
 * Crée un nouveau domaine personnalisé
 */
export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non authentifié' },
                { status: 401 }
            );
        }

        // Récupérer le profil pour connaître le plan
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: 'Profil non trouvé' },
                { status: 404 }
            );
        }

        const tier = (profile.subscription_tier || 'free') as 'free' | 'pro' | 'premium';

        // Vérifier si l'utilisateur a accès aux domaines personnalisés
        if (!hasFeature(tier, 'customDomain')) {
            return NextResponse.json(
                { error: 'Les domaines personnalisés ne sont pas disponibles avec votre plan actuel' },
                { status: 403 }
            );
        }

        // Compter les domaines existants
        const { count: domainCount, error: countError } = await supabase
            .from('custom_domains')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .is('subdomain', null); // Compter uniquement les domaines racine

        if (countError) {
            console.error('Error counting domains:', countError);
            return NextResponse.json(
                { error: 'Erreur lors de la vérification des limites' },
                { status: 500 }
            );
        }

        // Vérifier les limites
        if (!canAddCustomDomain(tier, domainCount || 0)) {
            const limits = subscriptionLimits[tier];
            return NextResponse.json(
                { 
                    error: `Limite de domaines atteinte. Votre plan permet ${limits.maxCustomDomains} domaine(s) personnalisé(s).`,
                    limit: limits.maxCustomDomains
                },
                { status: 403 }
            );
        }

        // Parser et valider le body
        const body = await request.json();
        const validationResult = createDomainSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Données invalides',
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        const { domain, subdomain, slug, is_primary } = validationResult.data;

        // Vérifier si le domaine existe déjà
        const domainKey = subdomain ? `${subdomain}.${domain}` : domain;
        const { data: existingDomain, error: checkError } = await supabase
            .from('custom_domains')
            .select('id')
            .eq('domain', domain)
            .eq('subdomain', subdomain || null)
            .single();

        if (existingDomain) {
            return NextResponse.json(
                { error: 'Ce domaine est déjà configuré' },
                { status: 409 }
            );
        }

        // Vérifier le slug personnalisé si fourni
        if (slug) {
            if (!hasFeature(tier, 'customSlug')) {
                return NextResponse.json(
                    { error: 'Les slugs personnalisés ne sont pas disponibles avec votre plan' },
                    { status: 403 }
                );
            }

            // Vérifier si le slug est déjà utilisé
            const { data: existingSlug, error: slugError } = await supabase
                .from('profiles')
                .select('id')
                .eq('custom_slug', slug)
                .neq('id', user.id)
                .single();

            if (existingSlug) {
                return NextResponse.json(
                    { error: 'Ce slug est déjà utilisé' },
                    { status: 409 }
                );
            }
        }

        // Générer un token de vérification
        const verificationToken = generateVerificationToken();

        // Créer le domaine
        const { data: newDomain, error: insertError } = await supabase
            .from('custom_domains')
            .insert({
                user_id: user.id,
                domain: domain.toLowerCase(),
                subdomain: subdomain?.toLowerCase() || null,
                slug: slug?.toLowerCase() || null,
                is_primary: is_primary || false,
                verification_token: verificationToken,
                ssl_status: 'pending',
                dns_records: {
                    txt: `innovaport-verification=${verificationToken}`,
                    cname: subdomain ? `${subdomain}.${domain}` : domain,
                }
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error creating domain:', insertError);
            return NextResponse.json(
                { error: 'Erreur lors de la création du domaine' },
                { status: 500 }
            );
        }

        // Si un slug personnalisé est fourni, mettre à jour le profil
        if (slug) {
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ custom_slug: slug.toLowerCase() })
                .eq('id', user.id);

            if (updateError) {
                console.error('Error updating custom slug:', updateError);
                // Ne pas échouer la création du domaine si le slug échoue
            }
        }

        // Gérer le SSL automatiquement (si configuré)
        const sslStatus = await manageSSL(domain.toLowerCase(), subdomain?.toLowerCase() || null);
        
        // Mettre à jour le statut SSL si disponible
        if (sslStatus.status === 'active' || sslStatus.status === 'pending') {
            await supabase
                .from('custom_domains')
                .update({
                    ssl_status: sslStatus.status,
                })
                .eq('id', newDomain.id);
        }

        return NextResponse.json({
            domain: newDomain,
            message: 'Domaine créé avec succès. Veuillez configurer les enregistrements DNS pour activer le domaine.',
            verification: {
                token: verificationToken,
                instructions: subdomain 
                    ? `Ajoutez un enregistrement CNAME pour ${subdomain}.${domain} pointant vers votre domaine InnovaPort`
                    : `Ajoutez un enregistrement CNAME pour ${domain} pointant vers votre domaine InnovaPort`
            },
            ssl: sslStatus
        }, { status: 201 });
    } catch (error) {
        console.error('Error in POST /api/domains:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

