import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname
    const hostname = request.headers.get('host') || ''

    // Gestion des domaines personnalisés
    // Vérifier si c'est un domaine personnalisé (pas localhost ni le domaine principal)
    const isCustomDomain = hostname && 
                          !hostname.includes('localhost') && 
                          !hostname.includes('127.0.0.1') &&
                          !hostname.includes('.vercel.app') &&
                          hostname !== process.env.NEXT_PUBLIC_DOMAIN;

    if (isCustomDomain) {
        try {
            // Chercher le domaine dans la base de données
            const { data: domainConfig, error: domainError } = await supabase
                .from('custom_domains')
                .select('user_id, slug, subdomain, domain, ssl_status')
                .eq('domain', hostname.split(':')[0]) // Enlever le port si présent
                .is('subdomain', null)
                .eq('ssl_status', 'active')
                .single();

            // Si pas de domaine racine, chercher un sous-domaine
            if (domainError || !domainConfig) {
                const domainParts = hostname.split('.');
                if (domainParts.length >= 3) {
                    const subdomain = domainParts[0];
                    const domain = domainParts.slice(1).join('.');
                    
                    const { data: subdomainConfig, error: subdomainError } = await supabase
                        .from('custom_domains')
                        .select('user_id, slug, subdomain, domain, ssl_status')
                        .eq('domain', domain.split(':')[0])
                        .eq('subdomain', subdomain)
                        .eq('ssl_status', 'active')
                        .single();

                    if (!subdomainError && subdomainConfig) {
                        // Rediriger vers le portfolio avec le slug ou user_id
                        const targetSlug = subdomainConfig.slug || subdomainConfig.user_id;
                        const targetPath = `/${targetSlug}${pathname === '/' ? '' : pathname}`;
                        
                        const url = request.nextUrl.clone();
                        url.pathname = targetPath;
                        return NextResponse.rewrite(url);
                    }
                }
            } else {
                // Rediriger vers le portfolio avec le slug ou user_id
                const targetSlug = domainConfig.slug || domainConfig.user_id;
                const targetPath = `/${targetSlug}${pathname === '/' ? '' : pathname}`;
                
                const url = request.nextUrl.clone();
                url.pathname = targetPath;
                return NextResponse.rewrite(url);
            }
        } catch (error) {
            // En cas d'erreur, continuer normalement
            console.error('Error handling custom domain:', error);
        }
    }

    // Protection des routes /dashboard : nécessite une authentification
    if (!user && pathname.startsWith('/dashboard')) {
        const url = request.nextUrl.clone()
        url.pathname = '/auth/login'
        url.searchParams.set('redirectTo', pathname)
        return NextResponse.redirect(url)
    }

    // Protection des routes /admin : la vérification est faite côté client par AdminGuard
    // Exception : /admin/login est accessible sans authentification
    // On laisse passer toutes les routes /admin pour que AdminGuard puisse gérer la vérification
    // Cela évite les redirections immédiates côté serveur

    return supabaseResponse
}
