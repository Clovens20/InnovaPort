/**
 * API Route: /api/testimonials
 * 
 * Fonction: Gère la création de témoignages par les clients
 * Dépendances: @supabase/supabase-js, zod
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Schéma de validation pour les témoignages
const createTestimonialSchema = z.object({
    user_id: z
        .string({ message: 'L\'ID utilisateur est requis' })
        .uuid('Format UUID invalide pour l\'ID utilisateur'),
    client_name: z
        .string({ message: 'Le nom du client est requis' })
        .min(1, 'Le nom ne peut pas être vide')
        .max(100, 'Le nom ne peut pas dépasser 100 caractères')
        .trim(),
    client_email: z
        .string({ message: 'L\'email du client est requis' })
        .email('Format d\'email invalide')
        .max(255, 'L\'email ne peut pas dépasser 255 caractères')
        .toLowerCase()
        .trim(),
    client_company: z
        .string()
        .max(100, 'Le nom de l\'entreprise ne peut pas dépasser 100 caractères')
        .trim()
        .optional()
        .nullable(),
    client_position: z
        .string()
        .max(100, 'Le poste ne peut pas dépasser 100 caractères')
        .trim()
        .optional()
        .nullable(),
    client_avatar_url: z
        .string()
        .url('Format d\'URL invalide')
        .max(500, 'L\'URL de l\'avatar ne peut pas dépasser 500 caractères')
        .optional()
        .nullable(),
    rating: z
        .number()
        .int()
        .min(1, 'La note doit être au moins 1')
        .max(5, 'La note ne peut pas dépasser 5')
        .optional()
        .nullable(),
    testimonial_text: z
        .string({ message: 'Le texte du témoignage est requis' })
        .min(10, 'Le témoignage doit contenir au moins 10 caractères')
        .max(1000, 'Le témoignage ne peut pas dépasser 1000 caractères')
        .trim(),
    project_name: z
        .string()
        .max(200, 'Le nom du projet ne peut pas dépasser 200 caractères')
        .trim()
        .optional()
        .nullable(),
    project_url: z
        .string()
        .url('Format d\'URL invalide')
        .max(500, 'L\'URL du projet ne peut pas dépasser 500 caractères')
        .optional()
        .nullable(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validationResult = createTestimonialSchema.safeParse(body);

        if (!validationResult.success) {
            const errors = validationResult.error.issues.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            return NextResponse.json(
                {
                    error: 'Erreur de validation',
                    details: errors,
                },
                { status: 400 }
            );
        }

        const validatedData = validationResult.data;
        const supabase = await createClient();

        // Vérifier que l'utilisateur existe
        const { data: userProfile, error: userError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', validatedData.user_id)
            .single();

        if (userError || !userProfile) {
            return NextResponse.json(
                { error: 'Utilisateur non trouvé' },
                { status: 404 }
            );
        }

        // Vérifier si le client a déjà un projet avec ce développeur (optionnel mais recommandé)
        // Pour l'instant, on permet à tous les clients de soumettre un témoignage
        // Le développeur devra l'approuver manuellement

        // Créer le témoignage (non approuvé par défaut)
        const { data: testimonial, error: insertError } = await supabase
            .from('testimonials')
            .insert({
                user_id: validatedData.user_id,
                client_name: validatedData.client_name,
                client_email: validatedData.client_email,
                client_company: validatedData.client_company || null,
                client_position: validatedData.client_position || null,
                client_avatar_url: validatedData.client_avatar_url || null,
                rating: validatedData.rating || null,
                testimonial_text: validatedData.testimonial_text,
                project_name: validatedData.project_name || null,
                project_url: validatedData.project_url || null,
                approved: false, // Le développeur doit approuver
            })
            .select()
            .single();

        if (insertError) {
            console.error('Error inserting testimonial:', insertError);
            return NextResponse.json(
                { error: 'Erreur lors de la création du témoignage' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                message: 'Témoignage soumis avec succès. Il sera visible après approbation par le développeur.',
                testimonial,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error in POST /api/testimonials:', error);
        return NextResponse.json(
            { error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}

