/**
 * Service de gestion SSL/TLS
 * Gère la génération automatique de certificats SSL via différents providers
 */

export interface SSLStatus {
    status: 'pending' | 'active' | 'failed' | 'expired';
    certificateUrl?: string;
    expiresAt?: string;
    error?: string;
}

/**
 * Gère les certificats SSL via Vercel (si déployé sur Vercel)
 * Vercel gère automatiquement les certificats SSL via Let's Encrypt
 */
export async function manageSSLVercel(
    domain: string,
    subdomain: string | null
): Promise<SSLStatus> {
    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeamId = process.env.VERCEL_TEAM_ID;
    const vercelProjectId = process.env.VERCEL_PROJECT_ID;

    if (!vercelToken || !vercelProjectId) {
        return {
            status: 'pending',
            error: 'Configuration Vercel manquante. Les certificats SSL seront générés automatiquement lors du déploiement.',
        };
    }

    const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;

    try {
        // Vérifier si le domaine est déjà configuré dans Vercel
        const domainsResponse = await fetch(
            `https://api.vercel.com/v9/projects/${vercelProjectId}/domains${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}`,
            {
                headers: {
                    Authorization: `Bearer ${vercelToken}`,
                },
            }
        );

        if (!domainsResponse.ok) {
            throw new Error(`Vercel API error: ${domainsResponse.statusText}`);
        }

        const domains = await domainsResponse.json();
        const domainExists = domains.domains?.some((d: any) => d.name === fullDomain);

        if (!domainExists) {
            // Ajouter le domaine à Vercel
            const addDomainResponse = await fetch(
                `https://api.vercel.com/v9/projects/${vercelProjectId}/domains${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${vercelToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: fullDomain,
                    }),
                }
            );

            if (!addDomainResponse.ok) {
                const error = await addDomainResponse.json();
                throw new Error(error.error?.message || 'Erreur lors de l\'ajout du domaine');
            }

            // Vercel génère automatiquement le certificat SSL via Let's Encrypt
            // Cela peut prendre quelques minutes
            return {
                status: 'pending',
                error: 'Domaine ajouté à Vercel. Le certificat SSL sera généré automatiquement dans quelques minutes.',
            };
        }

        // Vérifier le statut du certificat
        const domainInfo = domains.domains.find((d: any) => d.name === fullDomain);
        
        if (domainInfo?.verification?.verified) {
            return {
                status: 'active',
                certificateUrl: `https://${fullDomain}`,
                expiresAt: domainInfo.expiresAt,
            };
        }

        return {
            status: 'pending',
            error: 'En attente de vérification du domaine',
        };
    } catch (error: any) {
        return {
            status: 'failed',
            error: error.message || 'Erreur lors de la gestion SSL via Vercel',
        };
    }
}

/**
 * Gère les certificats SSL via Cloudflare (si le domaine utilise Cloudflare)
 * Cloudflare fournit automatiquement des certificats SSL gratuits
 */
export async function manageSSLCloudflare(
    domain: string,
    subdomain: string | null
): Promise<SSLStatus> {
    const cloudflareToken = process.env.CLOUDFLARE_API_TOKEN;
    const cloudflareZoneId = process.env.CLOUDFLARE_ZONE_ID;

    if (!cloudflareToken || !cloudflareZoneId) {
        return {
            status: 'pending',
            error: 'Configuration Cloudflare manquante',
        };
    }

    const fullDomain = subdomain ? `${subdomain}.${domain}` : domain;

    try {
        // Vérifier le statut SSL dans Cloudflare
        const sslResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/ssl/universal/settings`,
            {
                headers: {
                    Authorization: `Bearer ${cloudflareToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!sslResponse.ok) {
            throw new Error(`Cloudflare API error: ${sslResponse.statusText}`);
        }

        const sslData = await sslResponse.json();
        
        // Cloudflare SSL Universal est activé par défaut
        // Vérifier si le domaine est dans la zone
        const dnsResponse = await fetch(
            `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records?name=${fullDomain}`,
            {
                headers: {
                    Authorization: `Bearer ${cloudflareToken}`,
                },
            }
        );

        if (!dnsResponse.ok) {
            throw new Error(`Cloudflare DNS API error: ${dnsResponse.statusText}`);
        }

        const dnsData = await dnsResponse.json();
        const recordExists = dnsData.result && dnsData.result.length > 0;

        if (recordExists && sslData.result?.enabled) {
            return {
                status: 'active',
                certificateUrl: `https://${fullDomain}`,
            };
        }

        return {
            status: 'pending',
            error: 'En attente de configuration DNS',
        };
    } catch (error: any) {
        return {
            status: 'failed',
            error: error.message || 'Erreur lors de la gestion SSL via Cloudflare',
        };
    }
}

/**
 * Gère les certificats SSL automatiquement selon le provider disponible
 */
export async function manageSSL(
    domain: string,
    subdomain: string | null
): Promise<SSLStatus> {
    // Priorité: Vercel (si déployé sur Vercel) > Cloudflare > Autre
    if (process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID) {
        return manageSSLVercel(domain, subdomain);
    }

    if (process.env.CLOUDFLARE_API_TOKEN && process.env.CLOUDFLARE_ZONE_ID) {
        return manageSSLCloudflare(domain, subdomain);
    }

    // Par défaut, indiquer que le SSL sera géré automatiquement
    return {
        status: 'pending',
        error: 'Aucun provider SSL configuré. Le SSL sera géré automatiquement lors du déploiement.',
    };
}

