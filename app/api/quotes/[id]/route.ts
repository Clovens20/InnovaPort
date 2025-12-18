/**
 * API Route: DELETE /api/quotes/[id]
 * 
 * Fonction: Supprime un devis spécifique pour l'utilisateur authentifié
 * Dépendances: @supabase/supabase-js, next/server
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: quoteId } = await params;
        const supabase = await createClient();
        
        // Vérifier l'authentification
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        // Vérifier que le devis appartient à l'utilisateur
        const { data: quote, error: fetchError } = await supabase
            .from('quotes')
            .select('id, user_id')
            .eq('id', quoteId)
            .eq('user_id', user.id)
            .single();

        if (fetchError || !quote) {
            return NextResponse.json(
                { error: 'Devis non trouvé ou accès non autorisé' },
                { status: 404 }
            );
        }

        // Supprimer le devis
        const { error: deleteError } = await supabase
            .from('quotes')
            .delete()
            .eq('id', quoteId)
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('Error deleting quote:', deleteError);
            return NextResponse.json(
                { error: 'Erreur lors de la suppression du devis' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Devis supprimé avec succès' },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error in DELETE /api/quotes/[id]:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

