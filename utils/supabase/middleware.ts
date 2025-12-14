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
