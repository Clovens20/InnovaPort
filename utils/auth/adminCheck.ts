// utils/auth/adminCheck.ts
import { createClient } from '@/utils/supabase/client'

export async function checkIsAdmin(): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    return profile?.role === 'admin'
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