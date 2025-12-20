/**
 * API Route: POST /api/quotes/reminders
 * 
 * Fonction: Envoie les rappels de suivi automatiques pour les devis en attente
 * Dépendances: @supabase/supabase-js, resend
 * Raison: Système de rappels automatiques pour ne jamais oublier un devis
 * 
 * Cette route peut être appelée par :
 * - Un cron job (Vercel Cron, GitHub Actions, etc.)
 * - Un webhook externe
 * - Un service de planification
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendFollowUpReminderEmail } from '@/utils/resend';

// Utiliser la service role key pour accéder aux données
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

export async function POST(request: NextRequest) {
    try {
        // Vérifier l'authentification (optionnel : peut être appelé par un cron job)
        const authHeader = request.headers.get('authorization');
        const cronSecret = request.headers.get('x-cron-secret');
        
        // Autoriser si c'est un appel cron avec le secret ou si c'est authentifié
        if (cronSecret !== process.env.CRON_SECRET && !authHeader) {
            return NextResponse.json(
                { error: 'Non autorisé' },
                { status: 401 }
            );
        }

        const now = new Date();
        const remindersSent: string[] = [];
        const errors: string[] = [];

        // Récupérer tous les utilisateurs avec des paramètres de rappels activés
        const { data: reminderSettings, error: settingsError } = await supabaseAdmin
            .from('quote_reminder_settings')
            .select('*, profiles!quote_reminder_settings_user_id_fkey(id, full_name, email, username)')
            .eq('enabled', true);

        if (settingsError) {
            console.error('Error fetching reminder settings:', settingsError);
            return NextResponse.json(
                { error: 'Erreur lors de la récupération des paramètres' },
                { status: 500 }
            );
        }

        if (!reminderSettings || reminderSettings.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'Aucun paramètre de rappel activé',
                remindersSent: 0,
            });
        }

        // Pour chaque utilisateur avec rappels activés
        for (const setting of reminderSettings) {
            const userId = setting.user_id;
            const reminderDays = setting.reminder_days || [3, 7, 14];
            const profile = setting.profiles as any;

            // Récupérer les devis en attente (status: 'new' ou 'discussing')
            const { data: quotes, error: quotesError } = await supabaseAdmin
                .from('quotes')
                .select('*')
                .eq('user_id', userId)
                .in('status', ['new', 'discussing']);

            if (quotesError) {
                console.error(`Error fetching quotes for user ${userId}:`, quotesError);
                continue;
            }

            if (!quotes || quotes.length === 0) {
                continue;
            }

            // Pour chaque devis, vérifier s'il faut envoyer un rappel
            for (const quote of quotes) {
                const quoteDate = new Date(quote.created_at);
                const daysSinceQuote = Math.floor((now.getTime() - quoteDate.getTime()) / (1000 * 60 * 60 * 24));

                // Vérifier si on doit envoyer un rappel aujourd'hui
                const shouldSendReminder = reminderDays.some((day: number) => {
                    // Vérifier si c'est le jour exact pour un rappel
                    if (daysSinceQuote === day) {
                        // Vérifier si un rappel a déjà été envoyé pour ce jour
                        const lastReminder = quote.last_reminder_sent_at 
                            ? new Date(quote.last_reminder_sent_at)
                            : null;
                        
                        if (!lastReminder) {
                            return true; // Premier rappel
                        }
                        
                        const daysSinceLastReminder = Math.floor((now.getTime() - lastReminder.getTime()) / (1000 * 60 * 60 * 24));
                        // Envoyer si le dernier rappel date d'au moins 1 jour
                        return daysSinceLastReminder >= 1;
                    }
                    return false;
                });

                if (shouldSendReminder) {
                    try {
                        // Envoyer le rappel au développeur
                        await sendFollowUpReminderEmail({
                            to: profile.email || '',
                            developerName: profile.full_name || profile.username || 'Développeur',
                            quoteData: {
                                id: quote.id,
                                name: quote.name,
                                email: quote.email,
                                projectType: quote.project_type,
                                budget: quote.budget,
                                description: quote.description,
                                status: quote.status,
                            },
                            daysSinceQuote,
                        });

                        // Mettre à jour le devis
                        await supabaseAdmin
                            .from('quotes')
                            .update({
                                last_reminder_sent_at: now.toISOString(),
                                reminders_count: (quote.reminders_count || 0) + 1,
                            })
                            .eq('id', quote.id);

                        remindersSent.push(quote.id);
                    } catch (emailError) {
                        console.error(`Error sending reminder for quote ${quote.id}:`, emailError);
                        errors.push(`Quote ${quote.id}: ${emailError instanceof Error ? emailError.message : 'Erreur inconnue'}`);
                    }
                }
            }
        }

        return NextResponse.json({
            success: true,
            message: `Rappels envoyés avec succès`,
            remindersSent: remindersSent.length,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error('Error in POST /api/quotes/reminders:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur serveur interne' },
            { status: 500 }
        );
    }
}

// GET pour tester (développement uniquement)
export async function GET(request: NextRequest) {
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Méthode non autorisée en production' },
            { status: 405 }
        );
    }

    // Appeler POST pour tester
    return POST(request);
}

