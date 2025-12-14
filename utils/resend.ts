/**
 * Resend Email Utility
 * 
 * Fonction: Gère l'envoi d'emails via Resend API
 * Dépendances: resend (package.json)
 * Raison: Nécessaire pour envoyer des notifications email lors de la réception de devis
 */

import { Resend } from 'resend';
import { DEFAULT_FROM_EMAIL, APP_URL, BRAND_COLORS } from '@/lib/constants';

if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set in environment variables');
}

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Envoie un email de notification lorsqu'un nouveau devis est reçu
 */
export async function sendQuoteNotificationEmail({
    to,
    developerName,
    quoteData,
}: {
    to: string;
    developerName: string;
    quoteData: {
        name: string;
        email: string;
        projectType: string;
        budget: string;
        description: string;
    };
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject: `Nouvelle demande de devis - ${quoteData.projectType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: ${BRAND_COLORS.primary}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 0 0 8px 8px; }
                        .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid ${BRAND_COLORS.primary}; }
                        .button { display: inline-block; padding: 12px 24px; background: ${BRAND_COLORS.primary}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Nouvelle demande de devis</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour ${developerName},</p>
                            <p>Vous avez reçu une nouvelle demande de devis sur votre portfolio InnovaPort.</p>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0;">Informations du client</h3>
                                <p><strong>Nom:</strong> ${quoteData.name}</p>
                                <p><strong>Email:</strong> ${quoteData.email}</p>
                                <p><strong>Type de projet:</strong> ${quoteData.projectType}</p>
                                <p><strong>Budget:</strong> ${quoteData.budget}</p>
                            </div>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0;">Description</h3>
                                <p>${quoteData.description}</p>
                            </div>
                            
                            <a href="${APP_URL}/dashboard/quotes" class="button">
                                Voir la demande complète
                            </a>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement par InnovaPort</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Error sending email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send quote notification email:', error);
        throw error;
    }
}

/**
 * Envoie un email de confirmation au client qui a soumis un devis
 */
export async function sendQuoteConfirmationEmail({
    to,
    clientName,
}: {
    to: string;
    clientName: string;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject: 'Votre demande de devis a été reçue',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: ${BRAND_COLORS.secondary}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 0 0 8px 8px; }
                        .footer { text-align: center; margin-top: 30px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Demande reçue ✓</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour ${clientName},</p>
                            <p>Nous avons bien reçu votre demande de devis. Notre équipe va l'examiner et vous répondre dans les plus brefs délais.</p>
                            <p>Merci de votre confiance !</p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement par InnovaPort</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Error sending confirmation email:', error);
            // Ne pas throw pour la confirmation, c'est secondaire
        }

        return data;
    } catch (error) {
        console.error('Failed to send quote confirmation email:', error);
        // Ne pas throw pour la confirmation
        return null;
    }
}

