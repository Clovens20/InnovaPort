import { NextRequest, NextResponse } from 'next/server';
import { detectDomainProvider, checkDomainAvailability } from '@/lib/domain-detection';
import { z } from 'zod';

const detectDomainSchema = z.object({
    domain: z.string().trim().min(1, "Le domaine est requis"),
});

/**
 * POST /api/domains/detect
 * Détecte le registrar/DNS provider d'un domaine et vérifie sa disponibilité
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = detectDomainSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                { 
                    error: 'Données invalides',
                    details: validationResult.error.issues
                },
                { status: 400 }
            );
        }

        const { domain } = validationResult.data;

        // Vérifier la disponibilité du domaine (si déjà actif/déployé)
        const availability = await checkDomainAvailability(domain);

        // Détecter le provider (peut retourner null si non détecté, c'est OK)
        const providerResult = await detectDomainProvider(domain);

        // Toujours retourner un résultat, même si le provider n'est pas détecté
        // L'important est de vérifier la disponibilité
        return NextResponse.json({
            success: true,
            provider: providerResult?.provider || null,
            url: providerResult?.url || null,
            dnsUrl: providerResult?.dnsUrl || null,
            nameservers: providerResult?.nameservers || [],
            availability: {
                available: availability.available,
                isActive: availability.isActive,
                ipAddress: availability.ipAddress,
                cname: availability.cname,
                error: availability.error,
            },
        });
    } catch (error: any) {
        console.error('Error in POST /api/domains/detect:', error);
        return NextResponse.json(
            { error: 'Erreur serveur', details: error.message },
            { status: 500 }
        );
    }
}

