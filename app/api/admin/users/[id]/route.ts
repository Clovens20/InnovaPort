/**
 * Route API: /api/admin/users/[id]
 * 
 * Fonction: Supprimer un utilisateur (admin uniquement)
 * Dépendances: @supabase/supabase-js (service role key)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';

// Utiliser la service role key pour supprimer des utilisateurs
// Vérifier que les variables d'environnement sont définies
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

// Supprimer un utilisateur
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Vérifier que les variables d'environnement sont définies
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
            console.error('Missing Supabase environment variables');
            return NextResponse.json({ error: 'Configuration serveur manquante' }, { status: 500 });
        }

        // Vérifier que l'utilisateur est admin
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
        }

        // Vérifier que l'utilisateur à supprimer existe
        const { data: userToDelete, error: userError } = await supabaseAdmin
            .from('profiles')
            .select('id, email, full_name, username, role')
            .eq('id', id)
            .single();

        if (userError || !userToDelete) {
            return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
        }

        // Empêcher la suppression d'un admin par lui-même
        if (userToDelete.id === user.id) {
            return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 400 });
        }

        // Empêcher la suppression du dernier admin
        if (userToDelete.role === 'admin') {
            const { count: adminCount } = await supabaseAdmin
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'admin');

            if (adminCount && adminCount <= 1) {
                return NextResponse.json({ error: 'Impossible de supprimer le dernier administrateur' }, { status: 400 });
            }
        }

        // Vérifier d'abord si l'utilisateur existe dans auth.users
        const { data: authUser, error: authUserError } = await supabaseAdmin.auth.admin.getUserById(id);

        if (authUserError || !authUser) {
            // L'utilisateur n'existe pas dans auth.users, supprimer seulement le profil et les données associées
            // Cela peut arriver si l'utilisateur a été créé directement dans profiles ou supprimé de auth.users
            console.warn(`User ${id} not found in auth.users, deleting profile only`);
            
            // Supprimer le profil (cela supprimera automatiquement toutes les données associées grâce à ON DELETE CASCADE)
            const { error: deleteProfileError } = await supabaseAdmin
                .from('profiles')
                .delete()
                .eq('id', id);

            if (deleteProfileError) {
                console.error('Error deleting profile:', deleteProfileError);
                return NextResponse.json({ 
                    error: 'Erreur lors de la suppression du profil' 
                }, { status: 500 });
            }

            return NextResponse.json({ 
                success: true,
                message: `Compte de ${userToDelete.full_name || userToDelete.username || userToDelete.email} supprimé avec succès (profil uniquement)`
            });
        }

        // Supprimer l'utilisateur avec Supabase Admin
        // Cela supprimera automatiquement :
        // - Le profil (grâce à ON DELETE CASCADE)
        // - Les projets (grâce à ON DELETE CASCADE)
        // - Les devis (grâce à ON DELETE CASCADE)
        // - Les abonnements (grâce à ON DELETE CASCADE)
        // - Les analytics (grâce à ON DELETE CASCADE)
        // - Les témoignages (grâce à ON DELETE CASCADE)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (deleteError) {
            console.error('Error deleting user:', deleteError);
            
            // Si l'erreur est "User not found", essayer de supprimer seulement le profil
            if (deleteError.message?.includes('not found') || deleteError.message?.includes('User not found')) {
                console.warn(`User ${id} not found in auth.users during deletion, trying to delete profile only`);
                
                const { error: deleteProfileError } = await supabaseAdmin
                    .from('profiles')
                    .delete()
                    .eq('id', id);

                if (deleteProfileError) {
                    return NextResponse.json({ 
                        error: 'Erreur lors de la suppression du profil' 
                    }, { status: 500 });
                }

                return NextResponse.json({ 
                    success: true,
                    message: `Compte de ${userToDelete.full_name || userToDelete.username || userToDelete.email} supprimé avec succès (profil uniquement)`
                });
            }
            
            return NextResponse.json({ error: deleteError.message || 'Erreur lors de la suppression' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            message: `Compte de ${userToDelete.full_name || userToDelete.username || userToDelete.email} supprimé avec succès`
        });
    } catch (error: any) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
    }
}

