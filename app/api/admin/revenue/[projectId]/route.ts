/**
 * API Route: PATCH /api/admin/revenue/[projectId]
 * 
 * Fonction: Met à jour le revenu d'un projet (admin uniquement)
 * Dépendances: @supabase/supabase-js
 * Raison: Permettre aux admins de définir/modifier les revenus des projets
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ projectId: string }> }
) {
    try {
        const supabase = await createClient();
        
        // Vérifier que l'utilisateur est admin
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

        // Await params dans Next.js 16
        const { projectId } = await params;

        const body = await request.json();
        const { revenueAmount, revenueCurrency, revenueDate } = body;

        // Validation
        if (revenueAmount !== null && revenueAmount !== undefined) {
            if (typeof revenueAmount !== 'number' || revenueAmount < 0) {
                return NextResponse.json(
                    { error: 'Le montant du revenu doit être un nombre positif ou null' },
                    { status: 400 }
                );
            }
        }

        // Préparer les données à mettre à jour
        const updateData: any = {
            updated_at: new Date().toISOString(),
        };

        if (revenueAmount !== null && revenueAmount !== undefined) {
            updateData.revenue_amount = Math.round(revenueAmount); // Convertir en centimes si nécessaire
        } else {
            updateData.revenue_amount = null;
        }

        if (revenueCurrency) {
            updateData.revenue_currency = revenueCurrency;
        }

        if (revenueDate) {
            updateData.revenue_date = revenueDate;
        } else if (revenueAmount !== null && revenueAmount !== undefined && !revenueDate) {
            // Si on définit un revenu mais pas de date, utiliser la date actuelle
            updateData.revenue_date = new Date().toISOString();
        } else if (revenueAmount === null || revenueAmount === undefined) {
            // Si on supprime le revenu, supprimer aussi la date
            updateData.revenue_date = null;
        }

        // Mettre à jour le projet
        const { data: project, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', projectId)
            .select()
            .single();

        if (error) {
            console.error('Error updating project revenue:', error);
            return NextResponse.json(
                { error: 'Erreur lors de la mise à jour du revenu' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            project,
            message: 'Revenu mis à jour avec succès',
        });
    } catch (error) {
        console.error('Error in PATCH /api/admin/revenue/[projectId]:', error);
        return NextResponse.json({ error: 'Erreur serveur interne' }, { status: 500 });
    }
}

