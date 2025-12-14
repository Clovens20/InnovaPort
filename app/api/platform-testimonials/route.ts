import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const platformTestimonialSchema = z.object({
    client_name: z.string().min(1).max(100),
    client_email: z.string().email(),
    client_company: z.string().max(100).optional().nullable(),
    client_position: z.string().max(100).optional().nullable(),
    rating: z.number().int().min(1).max(5).optional().nullable(),
    testimonial_text: z.string().min(10).max(1000),
    project_name: z.string().max(200).optional().nullable(),
    project_url: z
        .union([
            z.string().url(),
            z.literal(''),
            z.null(),
        ])
        .optional()
        .nullable(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validatedData = platformTestimonialSchema.parse(body);

        // Utiliser le service role key pour permettre l'insertion publique
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

        // Insérer dans la table platform_testimonials
        const { data, error } = await supabaseAdmin
            .from('platform_testimonials')
            .insert([
                {
                    client_name: validatedData.client_name,
                    client_email: validatedData.client_email,
                    client_company: validatedData.client_company,
                    client_position: validatedData.client_position,
                    rating: validatedData.rating,
                    testimonial_text: validatedData.testimonial_text,
                    project_name: validatedData.project_name,
                    project_url: validatedData.project_url,
                    approved: false, // Nécessite validation admin
                    featured: false,
                },
            ])
            .select()
            .single();

        if (error) {
            // Si la table n'existe pas, on peut utiliser testimonials avec un user_id NULL ou spécial
            // Pour l'instant, on retourne une erreur et on créera la table
            console.error('Error inserting platform testimonial:', error);
            return NextResponse.json(
                { error: 'Erreur lors de la soumission. La table platform_testimonials doit être créée.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Témoignage soumis avec succès. Il sera publié après validation.' },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Erreur de validation', details: error.issues },
                { status: 400 }
            );
        }
        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'Erreur interne du serveur' },
            { status: 500 }
        );
    }
}

