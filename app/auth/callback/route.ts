import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { type NextRequest } from 'next/server'

/**
 * Route de callback pour la confirmation d'email Supabase
 * Cette route est appelée quand l'utilisateur clique sur le lien de confirmation dans son email
 * 
 * Formats d'URL supportés:
 * - /auth/callback?code=xxx (PKCE flow)
 * - /auth/callback?token_hash=xxx&type=signup (Classic flow)
 * - /auth/callback#access_token=xxx (Hash-based, géré côté client)
 */
export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const tokenHash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    // Log pour débogage (seulement en développement)
    if (process.env.NODE_ENV === 'development') {
        console.log('Callback route called with:', {
            code: code ? 'present' : 'missing',
            tokenHash: tokenHash ? 'present' : 'missing',
            type,
            next,
            fullUrl: requestUrl.toString()
        })
    }

    try {
        const supabase = await createClient()
        
        // Vérifier si c'est un flow PKCE (avec code)
        if (code) {
            // Échanger le code de confirmation contre une session (PKCE flow)
            const { error, data } = await supabase.auth.exchangeCodeForSession(code)

            if (error) {
                console.error('Error exchanging code for session:', error)
                const errorUrl = new URL('/auth/login', requestUrl.origin)
                errorUrl.searchParams.set('error', 'invalid_confirmation_link')
                return NextResponse.redirect(errorUrl)
            }

            // Vérifier que l'utilisateur est bien confirmé
            if (data.user && data.session) {
                if (process.env.NODE_ENV === 'development') {
                    console.log('Successfully exchanged code for session, redirecting to:', next)
                }
                return redirectToDashboard(requestUrl, next, request)
            } else {
                console.error('No user or session after code exchange')
                const errorUrl = new URL('/auth/login', requestUrl.origin)
                errorUrl.searchParams.set('error', 'invalid_confirmation_link')
                return NextResponse.redirect(errorUrl)
            }
        }
        // Vérifier si c'est un flow classique (avec token_hash)
        else if (tokenHash && type) {
            // Pour le flow classique avec token_hash, on doit vérifier le token
            // Note: Le token_hash est généralement vérifié automatiquement par Supabase
            // lors du clic sur le lien, mais on peut aussi le vérifier explicitement
            
            // Récupérer l'email depuis les query params si disponible
            const email = requestUrl.searchParams.get('email')
            
            // Vérifier que l'utilisateur est maintenant authentifié
            const { data: { user }, error: getUserError } = await supabase.auth.getUser()

            if (getUserError || !user) {
                // Si pas d'utilisateur, essayer de vérifier le token_hash explicitement
                if (email && tokenHash) {
                    // Note: verifyOtp nécessite le token complet, pas juste le hash
                    // Dans ce cas, Supabase devrait avoir déjà créé la session via le lien
                    // On redirige vers login avec erreur
                    console.error('User not authenticated after token_hash confirmation')
                    const errorUrl = new URL('/auth/login', requestUrl.origin)
                    errorUrl.searchParams.set('error', 'invalid_confirmation_link')
                    return NextResponse.redirect(errorUrl)
                } else {
                    console.error('Error verifying user after token_hash confirmation:', getUserError)
                    const errorUrl = new URL('/auth/login', requestUrl.origin)
                    errorUrl.searchParams.set('error', 'invalid_confirmation_link')
                    return NextResponse.redirect(errorUrl)
                }
            }

            // Vérifier que l'email est confirmé
            if (user.email_confirmed_at) {
                return redirectToDashboard(requestUrl, next, request)
            } else {
                // L'email n'est pas encore confirmé, mais l'utilisateur existe
                // Cela peut arriver si le token_hash n'a pas été correctement traité
                console.error('Email not confirmed after token_hash verification')
                const errorUrl = new URL('/auth/login', requestUrl.origin)
                errorUrl.searchParams.set('error', 'invalid_confirmation_link')
                return NextResponse.redirect(errorUrl)
            }
        }
        // Si aucun paramètre valide n'est trouvé
        else {
            console.error('No valid confirmation parameters found')
            const errorUrl = new URL('/auth/login', requestUrl.origin)
            errorUrl.searchParams.set('error', 'invalid_confirmation_link')
            return NextResponse.redirect(errorUrl)
        }

        // Si on arrive ici sans redirection, quelque chose s'est mal passé
        const errorUrl = new URL('/auth/login', requestUrl.origin)
        errorUrl.searchParams.set('error', 'invalid_confirmation_link')
        return NextResponse.redirect(errorUrl)
    } catch (error) {
        console.error('Unexpected error in callback route:', error)
        const errorUrl = new URL('/auth/login', requestUrl.origin)
        errorUrl.searchParams.set('error', 'invalid_confirmation_link')
        return NextResponse.redirect(errorUrl)
    }
}

/**
 * Fonction helper pour construire l'URL de redirection vers le dashboard
 */
function redirectToDashboard(requestUrl: URL, next: string, request: NextRequest): NextResponse {
    // Construire l'URL de redirection en tenant compte de l'environnement (local, Vercel, etc.)
    const forwardedHost = request.headers.get('x-forwarded-host')
    const protocol = request.headers.get('x-forwarded-proto') || (requestUrl.protocol === 'https:' ? 'https' : 'http')
    
    let redirectUrl: string
    
    // En production, utiliser le domaine configuré ou le forwarded-host
    if (process.env.NODE_ENV === 'production') {
        // Utiliser le domaine de production si configuré
        const productionDomain = process.env.NEXT_PUBLIC_BASE_URL 
            ? new URL(process.env.NEXT_PUBLIC_BASE_URL).hostname
            : forwardedHost || 'www.innovaport.dev'
        
        redirectUrl = `https://${productionDomain}${next}`
    } else if (forwardedHost) {
        // Staging ou autres environnements avec forwarded-host
        redirectUrl = `${protocol}://${forwardedHost}${next}`
    } else {
        // Développement local
        redirectUrl = `${requestUrl.origin}${next}`
    }

    if (process.env.NODE_ENV === 'development') {
        console.log('Redirecting to:', redirectUrl)
    }

    // Créer la réponse de redirection avec les cookies de session
    return NextResponse.redirect(redirectUrl)
}

