/**
 * Route API: POST /auth/signout
 * 
 * Fonction: Déconnexion de l'utilisateur
 * Dépendances: @supabase/ssr
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore errors in server components
                    }
                },
            },
        }
    )

    // Vérifier le rôle avant de déconnecter pour savoir où rediriger
    const { data: { user } } = await supabase.auth.getUser()
    let isAdmin = false

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        isAdmin = profile?.role === 'admin'
    }

    // Vérifier aussi le referer pour détecter si on vient de l'interface admin
    const referer = request.headers.get('referer')
    const isFromAdmin = referer?.includes('/admin') || isAdmin

    // Déconnexion
    await supabase.auth.signOut()

    // Rediriger vers la page de login appropriée
    const url = request.nextUrl.clone()
    
    // Si on vient de l'interface admin, rediriger vers /admin/login
    if (isFromAdmin) {
        url.pathname = '/admin/login'
    } else {
        url.pathname = '/auth/login'
    }
    
    return NextResponse.redirect(url)
}

