import { promises as dns } from 'dns';

/**
 * Mapping des nameservers vers les registrars/DNS providers
 */
const NAMESERVER_MAPPING: Record<string, { name: string; url: string; dnsUrl?: string }> = {
    // Cloudflare
    'cloudflare.com': { 
        name: 'Cloudflare', 
        url: 'https://dash.cloudflare.com',
        dnsUrl: 'https://dash.cloudflare.com'
    },
    'ns.cloudflare.com': { 
        name: 'Cloudflare', 
        url: 'https://dash.cloudflare.com',
        dnsUrl: 'https://dash.cloudflare.com'
    },
    
    // Namecheap
    'namecheap.com': { 
        name: 'Namecheap', 
        url: 'https://www.namecheap.com/myaccount/login/',
        dnsUrl: 'https://www.namecheap.com/domains/domain-control-panel/'
    },
    'dns1.registrar-servers.com': { 
        name: 'Namecheap', 
        url: 'https://www.namecheap.com/myaccount/login/',
        dnsUrl: 'https://www.namecheap.com/domains/domain-control-panel/'
    },
    'dns2.registrar-servers.com': { 
        name: 'Namecheap', 
        url: 'https://www.namecheap.com/myaccount/login/',
        dnsUrl: 'https://www.namecheap.com/domains/domain-control-panel/'
    },
    
    // GoDaddy
    'godaddy.com': { 
        name: 'GoDaddy', 
        url: 'https://sso.godaddy.com/',
        dnsUrl: 'https://sso.godaddy.com/'
    },
    'ns1.godaddy.com': { 
        name: 'GoDaddy', 
        url: 'https://sso.godaddy.com/',
        dnsUrl: 'https://sso.godaddy.com/'
    },
    'ns2.godaddy.com': { 
        name: 'GoDaddy', 
        url: 'https://sso.godaddy.com/',
        dnsUrl: 'https://sso.godaddy.com/'
    },
    'ns3.godaddy.com': { 
        name: 'GoDaddy', 
        url: 'https://sso.godaddy.com/',
        dnsUrl: 'https://sso.godaddy.com/'
    },
    'ns4.godaddy.com': { 
        name: 'GoDaddy', 
        url: 'https://sso.godaddy.com/',
        dnsUrl: 'https://sso.godaddy.com/'
    },
    
    // Google Domains / Google Cloud DNS
    'google.com': { 
        name: 'Google Domains', 
        url: 'https://domains.google.com/registrar',
        dnsUrl: 'https://domains.google.com/registrar'
    },
    'ns-cloud-a1.googledomains.com': { 
        name: 'Google Domains', 
        url: 'https://domains.google.com/registrar',
        dnsUrl: 'https://domains.google.com/registrar'
    },
    'ns-cloud-a2.googledomains.com': { 
        name: 'Google Domains', 
        url: 'https://domains.google.com/registrar',
        dnsUrl: 'https://domains.google.com/registrar'
    },
    'ns-cloud-a3.googledomains.com': { 
        name: 'Google Domains', 
        url: 'https://domains.google.com/registrar',
        dnsUrl: 'https://domains.google.com/registrar'
    },
    'ns-cloud-a4.googledomains.com': { 
        name: 'Google Domains', 
        url: 'https://domains.google.com/registrar',
        dnsUrl: 'https://domains.google.com/registrar'
    },
    
    // OVH
    'ovh.com': { 
        name: 'OVH', 
        url: 'https://www.ovh.com/manager/',
        dnsUrl: 'https://www.ovh.com/manager/web/#/domain'
    },
    'dns1.ovh.net': { 
        name: 'OVH', 
        url: 'https://www.ovh.com/manager/',
        dnsUrl: 'https://www.ovh.com/manager/web/#/domain'
    },
    'dns2.ovh.net': { 
        name: 'OVH', 
        url: 'https://www.ovh.com/manager/',
        dnsUrl: 'https://www.ovh.com/manager/web/#/domain'
    },
    'ns1.ovh.net': { 
        name: 'OVH', 
        url: 'https://www.ovh.com/manager/',
        dnsUrl: 'https://www.ovh.com/manager/web/#/domain'
    },
    'ns2.ovh.net': { 
        name: 'OVH', 
        url: 'https://www.ovh.com/manager/',
        dnsUrl: 'https://www.ovh.com/manager/web/#/domain'
    },
    
    // Gandi
    'gandi.net': { 
        name: 'Gandi', 
        url: 'https://id.gandi.net/',
        dnsUrl: 'https://admin.gandi.net/'
    },
    'a.dns.gandi.net': { 
        name: 'Gandi', 
        url: 'https://id.gandi.net/',
        dnsUrl: 'https://admin.gandi.net/'
    },
    'b.dns.gandi.net': { 
        name: 'Gandi', 
        url: 'https://id.gandi.net/',
        dnsUrl: 'https://admin.gandi.net/'
    },
    'c.dns.gandi.net': { 
        name: 'Gandi', 
        url: 'https://id.gandi.net/',
        dnsUrl: 'https://admin.gandi.net/'
    },
    
    // AWS Route 53
    'amazonaws.com': { 
        name: 'AWS Route 53', 
        url: 'https://console.aws.amazon.com/route53/',
        dnsUrl: 'https://console.aws.amazon.com/route53/'
    },
    
    // Name.com
    'name.com': { 
        name: 'Name.com', 
        url: 'https://www.name.com/account/login',
        dnsUrl: 'https://www.name.com/account/login'
    },
    
    // 1&1 IONOS
    'ionos.com': { 
        name: 'IONOS', 
        url: 'https://www.ionos.com/',
        dnsUrl: 'https://www.ionos.com/'
    },
    '1and1.com': { 
        name: 'IONOS', 
        url: 'https://www.ionos.com/',
        dnsUrl: 'https://www.ionos.com/'
    },
    
    // Hostinger
    'hostinger.com': { 
        name: 'Hostinger', 
        url: 'https://www.hostinger.com/',
        dnsUrl: 'https://www.hostinger.com/'
    },
    
    // Bluehost
    'bluehost.com': { 
        name: 'Bluehost', 
        url: 'https://my.bluehost.com/',
        dnsUrl: 'https://my.bluehost.com/'
    },
    
    // HostGator
    'hostgator.com': { 
        name: 'HostGator', 
        url: 'https://portal.hostgator.com/',
        dnsUrl: 'https://portal.hostgator.com/'
    },
};

/**
 * Vérifie si un domaine est déjà actif et déployé (résout vers une IP)
 */
export async function checkDomainAvailability(domain: string): Promise<{
    available: boolean;
    isActive: boolean;
    ipAddress?: string;
    cname?: string;
    error?: string;
}> {
    try {
        // Vérifier si le domaine résout vers une IP (A record)
        try {
            const addresses = await dns.resolve4(domain);
            if (addresses && addresses.length > 0) {
                return {
                    available: false,
                    isActive: true,
                    ipAddress: addresses[0],
                };
            }
        } catch (e) {
            // Pas d'enregistrement A, continuer
        }

        // Vérifier si le domaine a un CNAME
        try {
            const cnames = await dns.resolveCname(domain);
            if (cnames && cnames.length > 0) {
                return {
                    available: false,
                    isActive: true,
                    cname: cnames[0],
                };
            }
        } catch (e) {
            // Pas d'enregistrement CNAME, continuer
        }

        // Le domaine ne résout vers rien, il est disponible
        return {
            available: true,
            isActive: false,
        };
    } catch (error: any) {
        // Si le domaine n'existe pas ou n'a pas de DNS configuré, il est disponible
        if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
            return {
                available: true,
                isActive: false,
            };
        }
        
        return {
            available: false,
            isActive: false,
            error: error.message || 'Erreur lors de la vérification',
        };
    }
}

/**
 * Détecte le registrar/DNS provider d'un domaine en analysant ses nameservers
 */
export async function detectDomainProvider(domain: string): Promise<{
    provider: string | null;
    url: string | null;
    dnsUrl: string | null;
    nameservers: string[];
} | null> {
    try {
        // Résoudre les nameservers du domaine
        let nameservers: string[] = [];
        
        try {
            nameservers = await dns.resolveNs(domain);
        } catch (nsError: any) {
            // Si la résolution des nameservers échoue, le domaine peut ne pas avoir de DNS configuré
            // C'est normal pour un nouveau domaine, on continue quand même
            if (nsError.code !== 'ENOTFOUND' && nsError.code !== 'ENODATA') {
                console.warn('Error resolving nameservers for', domain, ':', nsError.message);
            }
            // Retourner null mais ne pas échouer complètement
            return {
                provider: null,
                url: null,
                dnsUrl: null,
                nameservers: [],
            };
        }
        
        if (!nameservers || nameservers.length === 0) {
            return {
                provider: null,
                url: null,
                dnsUrl: null,
                nameservers: [],
            };
        }

        // Chercher une correspondance dans le mapping
        for (const ns of nameservers) {
            const nsLower = ns.toLowerCase();
            
            // Vérifier les correspondances exactes et partielles
            for (const [key, value] of Object.entries(NAMESERVER_MAPPING)) {
                if (nsLower.includes(key.toLowerCase())) {
                    return {
                        provider: value.name,
                        url: value.url,
                        dnsUrl: value.dnsUrl || value.url,
                        nameservers,
                    };
                }
            }
        }

        // Si aucune correspondance trouvée, retourner les nameservers pour information
        // Cela permet de voir quels nameservers sont configurés même si non reconnus
        return {
            provider: null,
            url: null,
            dnsUrl: null,
            nameservers,
        };
    } catch (error: any) {
        console.error('Error detecting domain provider:', error);
        // Ne pas échouer complètement, retourner un résultat vide
        return {
            provider: null,
            url: null,
            dnsUrl: null,
            nameservers: [],
        };
    }
}

/**
 * Mapping des registrars populaires avec leurs URLs de configuration DNS
 * Utilisé comme fallback si la détection automatique échoue
 */
export const REGISTRAR_URLS: Record<string, { name: string; url: string; dnsUrl: string }> = {
    cloudflare: {
        name: 'Cloudflare',
        url: 'https://dash.cloudflare.com',
        dnsUrl: 'https://dash.cloudflare.com',
    },
    namecheap: {
        name: 'Namecheap',
        url: 'https://www.namecheap.com/myaccount/login/',
        dnsUrl: 'https://www.namecheap.com/domains/domain-control-panel/',
    },
    godaddy: {
        name: 'GoDaddy',
        url: 'https://sso.godaddy.com/',
        dnsUrl: 'https://sso.godaddy.com/',
    },
    googledomains: {
        name: 'Google Domains',
        url: 'https://domains.google.com/registrar',
        dnsUrl: 'https://domains.google.com/registrar',
    },
    ovh: {
        name: 'OVH',
        url: 'https://www.ovh.com/manager/',
        dnsUrl: 'https://www.ovh.com/manager/web/#/domain',
    },
    gandi: {
        name: 'Gandi',
        url: 'https://id.gandi.net/',
        dnsUrl: 'https://admin.gandi.net/',
    },
};

