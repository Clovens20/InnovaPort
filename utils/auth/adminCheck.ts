// utils/auth/adminCheck.ts
import { createClient } from '@/utils/supabase/client'

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Si erreur d'authentification ou pas d'utilisateur, retourner false
    if (userError || !user) {
      return false
    }

    // OPTIMISATION: Vérifier d'abord dans les métadonnées utilisateur si disponible
    const userRole = user.user_metadata?.role
    if (userRole === 'admin') {
      return true
    }

    // Sinon, faire une requête à la base de données
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    // Si erreur de requête, ne pas considérer comme admin mais ne pas throw
    if (profileError) {
      console.error('Error checking admin status:', profileError)
      return false
    }

    return profile?.role === 'admin' ?? false
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}

export async function requireAdmin() {
  const isAdmin = await checkIsAdmin()
  if (!isAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
  return true
}