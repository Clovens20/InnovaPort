/**
 * Utilitaire serveur pour vérifier si un utilisateur est admin
 * À utiliser dans les Server Components et Server Actions
 */

import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

/**
 * Vérifie si l'utilisateur actuel est admin
 * @returns true si admin, false sinon
 */
export async function isAdmin(): Promise<boolean> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return false;
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    return profile?.role === 'admin';
}

/**
 * Vérifie si l'utilisateur est admin et redirige si ce n'est pas le cas
 * À utiliser au début des Server Components admin
 * @param redirectTo Route vers laquelle rediriger si l'utilisateur n'est pas admin (défaut: '/dashboard')
 */
export async function requireAdmin(redirectTo: string = '/dashboard'): Promise<void> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?redirectTo=${encodeURIComponent('/admin')}`);
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (profile?.role !== 'admin') {
        redirect(redirectTo);
    }
}

/**
 * Récupère le profil admin complet
 * Redirige si l'utilisateur n'est pas admin
 * @returns Le profil de l'utilisateur admin
 */
export async function getAdminProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect(`/auth/login?redirectTo=${encodeURIComponent('/admin')}`);
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, role, full_name, email, username')
        .eq('id', user.id)
        .single();

    if (error || !profile || profile.role !== 'admin') {
        redirect('/dashboard');
    }

    return profile;
}

