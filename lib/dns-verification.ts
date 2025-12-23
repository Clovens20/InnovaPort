/**
 * Service de vérification DNS
 * Vérifie les enregistrements TXT et CNAME pour valider la propriété d'un domaine
 */

import dns from 'dns/promises';

export interface DNSVerificationResult {
    verified: boolean;
    txtRecord?: {
        found: boolean;
        value?: string;
        expected: string;
    };
    cnameRecord?: {
        found: boolean;
        value?: string;
        expected: string;
    };
    errors?: string[];
}

/**
 * Vérifie les enregistrements DNS pour un domaine
 */
export async function verifyDNSRecords(
    domain: string,
    subdomain: string | null,
    verificationToken: string
): Promise<DNSVerificationResult> {
    const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;
    const result: DNSVerificationResult = {
        verified: false,
        errors: [],
    };

    try {
        // Vérifier l'enregistrement TXT
        const expectedTxt = `innovaport-verification=${verificationToken}`;
        try {
            const txtRecords = await dns.resolveTxt(fullDomain);
            const foundTxt = txtRecords
                .flat()
                .find((record) => record.includes('innovaport-verification='));

            result.txtRecord = {
                found: !!foundTxt,
                value: foundTxt,
                expected: expectedTxt,
            };

            if (!foundTxt) {
                result.errors?.push(`Enregistrement TXT non trouvé pour ${fullDomain}`);
            } else if (!foundTxt.includes(verificationToken)) {
                result.errors?.push(`Token de vérification incorrect dans l'enregistrement TXT`);
            }
        } catch (error: any) {
            result.errors?.push(`Erreur lors de la vérification TXT: ${error.message}`);
            result.txtRecord = {
                found: false,
                expected: expectedTxt,
            };
        }

        // Vérifier l'enregistrement CNAME (optionnel mais recommandé)
        // Le CNAME doit pointer vers le domaine InnovaPort
        const expectedCname = process.env.NEXT_PUBLIC_DOMAIN || 'innovaport.dev';
        try {
            const cnameRecords = await dns.resolveCname(fullDomain);
            const foundCname = cnameRecords[0];

            result.cnameRecord = {
                found: !!foundCname,
                value: foundCname,
                expected: expectedCname,
            };

            if (!foundCname) {
                result.errors?.push(`Enregistrement CNAME non trouvé pour ${fullDomain}`);
            } else if (!foundCname.includes(expectedCname)) {
                result.errors?.push(
                    `L'enregistrement CNAME ne pointe pas vers ${expectedCname}`
                );
            }
        } catch (error: any) {
            // CNAME peut ne pas exister, ce n'est pas une erreur critique
            if (error.code !== 'ENODATA' && error.code !== 'ENOTFOUND') {
                result.errors?.push(`Erreur lors de la vérification CNAME: ${error.message}`);
            }
            result.cnameRecord = {
                found: false,
                expected: expectedCname,
            };
        }

        // Le domaine est vérifié si le TXT est correct
        // Le CNAME est optionnel mais recommandé
        result.verified = result.txtRecord?.found === true && 
                         result.txtRecord.value?.includes(verificationToken) === true;

        return result;
    } catch (error: any) {
        result.errors?.push(`Erreur générale: ${error.message}`);
        return result;
    }
}

/**
 * Vérifie les enregistrements DNS via Cloudflare API (optionnel)
 * Nécessite CLOUDFLARE_API_TOKEN dans les variables d'environnement
 */
export async function verifyDNSRecordsCloudflare(
    domain: string,
    subdomain: string | null,
    verificationToken: string
): Promise<DNSVerificationResult> {
    const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (!cloudflareToken || !cloudflareZoneId) {
        // Fallback vers la vérification DNS standard
        return verifyDNSRecords(domain, subdomain, verificationToken);
    }

    const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;
    const result: DNSVerificationResult = {
        verified: false,
        errors: [],
    };

    try {
        // Récupérer les enregistrements DNS depuis Cloudflare
        const response = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records?name=${fullDomain}`,
            {
                headers: {
                    Authorization: `Bearer ${cloudflareToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Cloudflare API error: ${response.statusText}`);
        }

        const data = await response.json();
        const records = data.result || [];

        // Vérifier l'enregistrement TXT
        const expectedTxt = `innovaport-verification=${verificationToken}`;
        const txtRecord = records.find(
            (r: any) => r.type === 'TXT' && r.content.includes('innovaport-verification=')
        );

        result.txtRecord = {
            found: !!txtRecord,
            value: txtRecord?.content,
            expected: expectedTxt,
        };

        if (!txtRecord) {
            result.errors?.push(`Enregistrement TXT non trouvé pour ${fullDomain}`);
        } else if (!txtRecord.content.includes(verificationToken)) {
            result.errors?.push(`Token de vérification incorrect dans l'enregistrement TXT`);
        }

        // Vérifier l'enregistrement CNAME
        const expectedCname = process.env.NEXT_PUBLIC_DOMAIN || 'innovaport.dev';
        const cnameRecord = records.find((r: any) => r.type === 'CNAME');

        result.cnameRecord = {
            found: !!cnameRecord,
            value: cnameRecord?.content,
            expected: expectedCname,
        };

        if (!cnameRecord) {
            result.errors?.push(`Enregistrement CNAME non trouvé pour ${fullDomain}`);
        } else if (!cnameRecord.content.includes(expectedCname)) {
            result.errors?.push(
                `L'enregistrement CNAME ne pointe pas vers ${expectedCname}`
            );
        }

        result.verified = result.txtRecord?.found === true && 
                         result.txtRecord.value?.includes(verificationToken) === true;

        return result;
    } catch (error: any) {
        result.errors?.push(`Erreur Cloudflare API: ${error.message}`);
        // Fallback vers la vérification DNS standard
        return verifyDNSRecords(domain, subdomain, verificationToken);
    }
}

