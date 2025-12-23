import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';
import { verifyDNSRecords, verifyDNSRecordsCloudflare } from '@/lib/dns-verification';

const verifyDomainSchema = z.object({
    domainId: z.string().uuid(),
});

/**
 * POST /api/domains/verify
 * Vérifie la propriété d'un domaine en vérifiant les enregistrements DNS
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

        // Parser et valider le body
        const body = await request.json();
        const validationResult = verifyDomainSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Données invalides',
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        const { domainId } = validationResult.data;

        // Récupérer le domaine
        const { data: domain, error: domainError } = await supabase
            .from('custom_domains')
            .select('*')
            .eq('id', domainId)
            .eq('user_id', user.id)
            .single();

        if (domainError || !domain) {
            return NextResponse.json(
                { error: 'Domaine non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier les enregistrements DNS
        if (!domain.verification_token) {
            return NextResponse.json(
                { error: 'Token de vérification manquant' },
                { status: 400 }
            );
        }

        // Utiliser Cloudflare API si configuré, sinon DNS standard
        const useCloudflare = !!process.env.CLOUDFLARE_API_TOKEN && !!process.env.CLOUDFLARE_ZONE_ID;
        const verificationResult = useCloudflare
            ? await verifyDNSRecordsCloudflare(
                domain.domain,
                domain.subdomain,
                domain.verification_token
            )
            : await verifyDNSRecords(
                domain.domain,
                domain.subdomain,
                domain.verification_token
            );

        if (verificationResult.verified) {
            // Mettre à jour le statut du domaine
            const { data: updatedDomain, error: updateError } = await supabase
                .from('custom_domains')
                .update({
                    ssl_status: 'active',
                    verified_at: new Date().toISOString(),
                })
                .eq('id', domainId)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating domain status:', updateError);
                return NextResponse.json(
                    { error: 'Erreur lors de la mise à jour du statut' },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                verified: true,
                domain: updatedDomain,
                message: 'Domaine vérifié avec succès',
                verificationDetails: {
                    txtRecord: verificationResult.txtRecord,
                    cnameRecord: verificationResult.cnameRecord,
                }
            });
        } else {
            // Mettre à jour le statut en échec
            await supabase
                .from('custom_domains')
                .update({
                    ssl_status: 'failed',
                })
                .eq('id', domainId);

            const targetDomain = domain.subdomain 
                ? `${domain.subdomain}.${domain.domain}`
                : domain.domain;

            return NextResponse.json({
                verified: false,
                message: 'La vérification DNS a échoué. Veuillez vérifier que les enregistrements DNS sont correctement configurés.',
                errors: verificationResult.errors,
                instructions: {
                    txt: `Ajoutez un enregistrement TXT pour ${targetDomain} avec la valeur: innovaport-verification=${domain.verification_token}`,
                    cname: `Ajoutez un enregistrement CNAME pour ${targetDomain} pointant vers ${process.env.NEXT_PUBLIC_DOMAIN || 'innovaport.dev'}`,
                },
                verificationDetails: {
                    txtRecord: verificationResult.txtRecord,
                    cnameRecord: verificationResult.cnameRecord,
                }
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in POST /api/domains/verify:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

