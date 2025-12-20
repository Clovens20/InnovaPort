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
            return undefined;
        }

        return data;
    } catch (error) {
        console.error('Failed to send quote confirmation email:', error);
        // Ne pas throw pour la confirmation
        return undefined;
    }
}

/**
 * Envoie une réponse automatique personnalisée au prospect
 * Utilise les templates configurés par l'utilisateur
 */
export async function sendAutoResponseEmail({
    to,
    clientName,
    quoteData,
    template,
    developerName,
    developerEmail,
}: {
    to: string;
    clientName: string;
    quoteData: {
        projectType: string;
        budget: string;
        description: string;
        deadline?: string | null;
        features?: string[];
    };
    template: {
        subject: string;
        body_html: string;
    };
    developerName: string;
    developerEmail?: string;
}) {
    try {
        // Remplacer les variables dans le sujet et le corps
        let subject = template.subject
            .replace(/\{\{clientName\}\}/g, clientName)
            .replace(/\{\{projectType\}\}/g, quoteData.projectType)
            .replace(/\{\{budget\}\}/g, quoteData.budget)
            .replace(/\{\{developerName\}\}/g, developerName);

        let bodyHtml = template.body_html
            .replace(/\{\{clientName\}\}/g, clientName)
            .replace(/\{\{projectType\}\}/g, quoteData.projectType)
            .replace(/\{\{budget\}\}/g, quoteData.budget)
            .replace(/\{\{description\}\}/g, quoteData.description || 'Non spécifié')
            .replace(/\{\{deadline\}\}/g, quoteData.deadline || 'Non spécifié')
            .replace(/\{\{developerName\}\}/g, developerName)
            .replace(/\{\{developerEmail\}\}/g, developerEmail || '');

        // Convertir les sauts de ligne en <br> pour le HTML
        bodyHtml = bodyHtml.replace(/\n/g, '<br>');

        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            replyTo: developerEmail || DEFAULT_FROM_EMAIL,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 8px; }
                        .footer { text-align: center; margin-top: 30px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="content">
                            ${bodyHtml}
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
            console.error('Error sending auto response email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send auto response email:', error);
        throw error;
    }
}

/**
 * Envoie une réponse personnalisée du développeur au prospect
 * Inclut tous les détails du devis et la réponse personnalisée
 */
export async function sendDeveloperResponseEmail({
    to,
    clientName,
    developerName,
    developerEmail,
    developerResponse,
    quoteData,
}: {
    to: string;
    clientName: string;
    developerName: string;
    developerEmail?: string;
    developerResponse: string;
    quoteData: {
        projectType: string;
        budget: string;
        description: string;
        deadline?: string | null;
        features?: string[];
        platforms?: { ios?: boolean; android?: boolean };
        designPref?: string | null;
        company?: string | null;
        location?: string | null;
        phone?: string | null;
    };
}) {
    try {
        // Convertir les sauts de ligne en <br> pour le HTML
        const formattedResponse = developerResponse.replace(/\n/g, '<br>');

        // Construire la liste des fonctionnalités
        const featuresList = quoteData.features && quoteData.features.length > 0
            ? `<ul style="margin: 10px 0; padding-left: 20px;">${quoteData.features.map(f => `<li>${f}</li>`).join('')}</ul>`
            : '<p style="color: #666; font-style: italic;">Aucune fonctionnalité spécifiée</p>';

        // Construire les plateformes
        const platformsList = [];
        if (quoteData.platforms?.ios) platformsList.push('iOS');
        if (quoteData.platforms?.android) platformsList.push('Android');
        const platformsText = platformsList.length > 0 ? platformsList.join(', ') : 'Non spécifié';

        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            replyTo: developerEmail || DEFAULT_FROM_EMAIL,
            subject: `Réponse à votre demande de devis - ${quoteData.projectType}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
                        .header { background: ${BRAND_COLORS.primary}; color: white; padding: 30px; border-radius: 8px 8px 0 0; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 0 0 8px 8px; }
                        .info-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.primary}; }
                        .response-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border: 2px solid ${BRAND_COLORS.secondary}; }
                        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
                        .detail-label { font-weight: 600; color: #666; }
                        .detail-value { color: #333; }
                        .footer { text-align: center; margin-top: 30px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                        .button { display: inline-block; padding: 12px 24px; background: ${BRAND_COLORS.primary}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">Réponse à votre demande</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour ${clientName},</p>
                            
                            <div class="response-box">
                                <h3 style="margin-top: 0; color: ${BRAND_COLORS.secondary};">Ma réponse</h3>
                                <div style="color: #333; line-height: 1.8;">
                                    ${formattedResponse}
                                </div>
                            </div>

                            <div class="info-box">
                                <h3 style="margin-top: 0;">Récapitulatif de votre demande</h3>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Type de projet:</span>
                                    <span class="detail-value">${quoteData.projectType}</span>
                                </div>
                                
                                <div class="detail-row">
                                    <span class="detail-label">Budget estimé:</span>
                                    <span class="detail-value" style="color: ${BRAND_COLORS.primary}; font-weight: 600;">${quoteData.budget}</span>
                                </div>
                                
                                ${quoteData.deadline ? `
                                <div class="detail-row">
                                    <span class="detail-label">Délai souhaité:</span>
                                    <span class="detail-value">${quoteData.deadline}</span>
                                </div>
                                ` : ''}
                                
                                <div class="detail-row">
                                    <span class="detail-label">Plateformes:</span>
                                    <span class="detail-value">${platformsText}</span>
                                </div>
                                
                                ${quoteData.designPref ? `
                                <div class="detail-row">
                                    <span class="detail-label">Préférence de design:</span>
                                    <span class="detail-value">${quoteData.designPref}</span>
                                </div>
                                ` : ''}
                                
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                                    <span class="detail-label" style="display: block; margin-bottom: 8px;">Fonctionnalités demandées:</span>
                                    ${featuresList}
                                </div>
                                
                                <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
                                    <span class="detail-label" style="display: block; margin-bottom: 8px;">Description du projet:</span>
                                    <p style="color: #333; line-height: 1.6; margin: 0; padding: 10px; background: #f9f9f9; border-radius: 4px;">
                                        ${quoteData.description}
                                    </p>
                                </div>
                            </div>

                            <p style="margin-top: 30px;">
                                N'hésitez pas à me répondre directement à cette adresse email si vous avez des questions ou souhaitez discuter davantage de votre projet.
                            </p>

                            <p>
                                Cordialement,<br>
                                <strong>${developerName}</strong>
                                ${developerEmail ? `<br><a href="mailto:${developerEmail}" style="color: ${BRAND_COLORS.primary};">${developerEmail}</a>` : ''}
                            </p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé depuis InnovaPort</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Error sending developer response email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send developer response email:', error);
        throw error;
    }
}

