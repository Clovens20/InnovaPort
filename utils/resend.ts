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
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .email-wrapper { background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .header { background: ${BRAND_COLORS.primary}; color: white; padding: 30px 20px; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; line-height: 1.8; }
                        .content p { margin: 0 0 16px 0; }
                        .content p:last-child { margin-bottom: 0; }
                        .signature { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
                        .signature p { margin: 4px 0; }
                        .signature strong { color: ${BRAND_COLORS.primary}; }
                        .footer { text-align: center; margin-top: 20px; padding: 20px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; background: white; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="email-wrapper">
                            <div class="header">
                                <h1>Réponse à votre demande</h1>
                            </div>
                            <div class="content">
                                ${bodyHtml}
                                <div class="signature">
                                    <p>Cordialement,</p>
                                    <p><strong>${developerName}</strong></p>
                                    ${developerEmail ? `<p><a href="mailto:${developerEmail}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">${developerEmail}</a></p>` : ''}
                                </div>
                            </div>
                            <div class="footer">
                                <p>Cet email a été envoyé automatiquement par InnovaPort</p>
                            </div>
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

/**
 * Envoie un rappel de suivi au développeur pour un devis non traité
 */
export async function sendFollowUpReminderEmail({
    to,
    developerName,
    quoteData,
    daysSinceQuote,
}: {
    to: string;
    developerName: string;
    quoteData: {
        id: string;
        name: string;
        email: string;
        projectType: string;
        budget: string;
        description: string;
        status: string;
    };
    daysSinceQuote: number;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject: `Rappel : Devis en attente depuis ${daysSinceQuote} jour${daysSinceQuote > 1 ? 's' : ''}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: ${BRAND_COLORS.warning}; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 0 0 8px 8px; }
                        .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid ${BRAND_COLORS.warning}; }
                        .button { display: inline-block; padding: 12px 24px; background: ${BRAND_COLORS.primary}; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
                        .footer { text-align: center; margin-top: 30px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Rappel de suivi</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour ${developerName},</p>
                            <p>Vous avez un devis en attente depuis <strong>${daysSinceQuote} jour${daysSinceQuote > 1 ? 's' : ''}</strong> qui nécessite votre attention.</p>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0;">Informations du devis</h3>
                                <p><strong>Client:</strong> ${quoteData.name}</p>
                                <p><strong>Email:</strong> ${quoteData.email}</p>
                                <p><strong>Type de projet:</strong> ${quoteData.projectType}</p>
                                <p><strong>Budget:</strong> ${quoteData.budget}</p>
                                <p><strong>Statut actuel:</strong> ${quoteData.status}</p>
                            </div>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0;">Description</h3>
                                <p>${quoteData.description}</p>
                            </div>
                            
                            <a href="${APP_URL}/dashboard/quotes/${quoteData.id}" class="button">
                                Voir et répondre au devis
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
            console.error('Error sending follow-up reminder email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send follow-up reminder email:', error);
        throw error;
    }
}

/**
 * Envoie une notification au client lors d'un changement de statut du devis
 */
export async function sendStatusUpdateEmail({
    to,
    clientName,
    developerName,
    developerEmail,
    quoteData,
    oldStatus,
    newStatus,
}: {
    to: string;
    clientName: string;
    developerName: string;
    developerEmail?: string;
    quoteData: {
        projectType: string;
        budget: string;
    };
    oldStatus: string;
    newStatus: string;
}) {
    try {
        const statusLabels: Record<string, string> = {
            'new': 'Nouvelle',
            'discussing': 'En discussion',
            'quoted': 'Devis envoyé',
            'accepted': 'Acceptée',
            'rejected': 'Refusée',
        };

        const statusColors: Record<string, string> = {
            'new': BRAND_COLORS.primary,
            'discussing': '#3B82F6',
            'quoted': '#10B981',
            'accepted': '#10B981',
            'rejected': BRAND_COLORS.error,
        };

        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            replyTo: developerEmail || DEFAULT_FROM_EMAIL,
            subject: `Mise à jour de votre demande de devis - ${statusLabels[newStatus]}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: ${statusColors[newStatus]}; color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 0 0 8px 8px; }
                        .status-box { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid ${statusColors[newStatus]}; }
                        .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
                        .footer { text-align: center; margin-top: 30px; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1 style="margin: 0;">Mise à jour de votre demande</h1>
                        </div>
                        <div class="content">
                            <p>Bonjour ${clientName},</p>
                            <p>Nous vous informons que le statut de votre demande de devis a été mis à jour.</p>
                            
                            <div class="status-box">
                                <p style="margin: 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Ancien statut</p>
                                <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: 600; color: #333;">${statusLabels[oldStatus]}</p>
                                <p style="margin: 15px 0 5px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Nouveau statut</p>
                                <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: 700; color: ${statusColors[newStatus]};">${statusLabels[newStatus]}</p>
                            </div>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0;">Détails de votre demande</h3>
                                <p><strong>Type de projet:</strong> ${quoteData.projectType}</p>
                                <p><strong>Budget estimé:</strong> ${quoteData.budget}</p>
                            </div>
                            
                            <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
                            
                            <p>
                                Cordialement,<br>
                                <strong>${developerName}</strong>
                                ${developerEmail ? `<br><a href="mailto:${developerEmail}" style="color: ${BRAND_COLORS.primary};">${developerEmail}</a>` : ''}
                            </p>
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
            console.error('Error sending status update email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send status update email:', error);
        throw error;
    }
}

/**
 * Envoie un email de confirmation automatique lorsqu'un message de contact est reçu
 */
export async function sendContactConfirmationEmail({
    to,
    name,
}: {
    to: string;
    name: string;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            subject: 'Votre message a bien été reçu - InnovaPort',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #1E40AF 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 40px 30px; border-radius: 0 0 12px 12px; }
                        .success-box { background: white; padding: 30px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10B981; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid ${BRAND_COLORS.gray[200]}; }
                        .cta-button { display: inline-block; background: ${BRAND_COLORS.primary}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid ${BRAND_COLORS.gray[200]}; color: ${BRAND_COLORS.gray[500]}; font-size: 13px; }
                        .icon { font-size: 48px; margin-bottom: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <div class="icon">✓</div>
                            <h1>Message reçu avec succès !</h1>
                        </div>
                        <div class="content">
                            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Bonjour ${name},</p>
                            
                            <div class="success-box">
                                <p style="margin: 0; font-size: 16px; color: #333; line-height: 1.8;">
                                    Nous avons bien reçu votre message et nous vous en remercions ! Notre équipe va l'examiner attentivement et vous répondra dans les <strong>24 heures</strong>.
                                </p>
                            </div>
                            
                            <div class="info-box">
                                <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary}; font-size: 18px;">Que se passe-t-il maintenant ?</h3>
                                <ul style="margin: 15px 0; padding-left: 20px; color: #555;">
                                    <li style="margin-bottom: 10px;">Votre message a été transmis à notre équipe de support</li>
                                    <li style="margin-bottom: 10px;">Nous vous répondrons par email dans un bref délai</li>
                                    <li style="margin-bottom: 10px;">Vous recevrez une notification dès que nous aurons traité votre demande</li>
                                </ul>
                            </div>
                            
                            <p style="font-size: 16px; color: #333; margin-top: 30px;">
                                En attendant, n'hésitez pas à consulter notre <a href="${APP_URL}/faq" style="color: ${BRAND_COLORS.primary}; text-decoration: underline;">FAQ</a> pour trouver des réponses rapides à vos questions.
                            </p>
                            
                            <p style="font-size: 16px; color: #333; margin-top: 25px;">
                                Merci d'avoir choisi <strong>InnovaPort</strong> ! 🙏
                            </p>
                            
                            <p style="margin-top: 30px; color: #666;">
                                Cordialement,<br>
                                <strong style="color: ${BRAND_COLORS.primary};">L'équipe InnovaPort</strong>
                            </p>
                        </div>
                        <div class="footer">
                            <p style="margin: 5px 0;">Cet email a été envoyé automatiquement pour confirmer la réception de votre message.</p>
                            <p style="margin: 5px 0;">Si vous n'avez pas envoyé de message, vous pouvez ignorer cet email.</p>
                            <p style="margin: 15px 0 5px 0;">
                                <a href="${APP_URL}" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">InnovaPort</a> - 
                                <a href="${APP_URL}/faq" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">FAQ</a> - 
                                <a href="${APP_URL}/contact" style="color: ${BRAND_COLORS.primary}; text-decoration: none;">Contact</a>
                            </p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Error sending contact confirmation email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send contact confirmation email:', error);
        throw error;
    }
}

/**
 * Envoie une réponse de l'admin à un message de contact
 */
export async function sendAdminReplyEmail({
    to,
    clientName,
    originalMessage,
    replyMessage,
    originalSubject,
    adminName,
    adminEmail,
}: {
    to: string;
    clientName: string;
    originalMessage: string;
    replyMessage: string;
    originalSubject: string | null;
    adminName?: string;
    adminEmail?: string;
}) {
    try {
        const subject = originalSubject 
            ? `Re: ${originalSubject}`
            : `Re: Votre message à InnovaPort`;

        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            replyTo: adminEmail || DEFAULT_FROM_EMAIL,
            subject: subject,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #1E40AF 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                        .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 30px; border-radius: 0 0 12px 12px; }
                        .reply-box { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${BRAND_COLORS.primary}; }
                        .original-box { background: ${BRAND_COLORS.gray[100]}; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid ${BRAND_COLORS.gray[200]}; }
                        .original-box h3 { margin-top: 0; color: ${BRAND_COLORS.gray[500]}; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid ${BRAND_COLORS.gray[200]}; color: ${BRAND_COLORS.gray[500]}; font-size: 12px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Réponse à votre message</h1>
                        </div>
                        <div class="content">
                            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Bonjour ${clientName},</p>
                            
                            <div class="reply-box">
                                <p style="margin: 0; font-size: 16px; color: #333; white-space: pre-wrap; line-height: 1.8;">${replyMessage}</p>
                            </div>
                            
                            <div class="original-box">
                                <h3>Message original</h3>
                                <p style="margin: 0; font-size: 14px; color: #666; white-space: pre-wrap; line-height: 1.6;">${originalMessage}</p>
                            </div>
                            
                            <p style="font-size: 16px; color: #333; margin-top: 25px;">
                                Cordialement,<br>
                                <strong>${adminName || 'L\'équipe InnovaPort'}</strong>
                                ${adminEmail ? `<br><a href="mailto:${adminEmail}" style="color: ${BRAND_COLORS.primary};">${adminEmail}</a>` : ''}
                            </p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé depuis l'interface admin d'InnovaPort</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Error sending admin reply email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send admin reply email:', error);
        throw error;
    }
}

/**
 * Envoie un email détaillé au client lorsqu'un devis est créé par le développeur
 */
export async function sendQuoteCreatedEmail({
    to,
    clientName,
    developerName,
    developerEmail,
    quoteData,
    projectType,
    quoteId,
}: {
    to: string;
    clientName: string;
    developerName: string;
    developerEmail?: string;
    quoteData: {
        title: string;
        description: string;
        workProposal: string;
        items: Array<{
            name: string;
            quantity: number;
            unitPrice: number;
            total: number;
        }>;
        subtotal: number;
        tax: number;
        total: number;
        validUntil: string;
        paymentTerms: string;
        notes: string;
    };
    projectType: string;
    quoteId: string;
}) {
    try {
        // Formater la date de validité
        const validUntilDate = quoteData.validUntil 
            ? new Date(quoteData.validUntil).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            : 'Non spécifiée';

        // Générer le HTML pour les items
        const itemsHtml = quoteData.items.map((item, index) => `
            <tr style="border-bottom: 1px solid ${BRAND_COLORS.gray[200]};">
                <td style="padding: 12px; text-align: left;">${index + 1}</td>
                <td style="padding: 12px; text-align: left; font-weight: 500;">${item.name || 'Item'}</td>
                <td style="padding: 12px; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; font-weight: 600;">$${item.total.toFixed(2)}</td>
            </tr>
        `).join('');

        const { data, error } = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to: [to],
            replyTo: developerEmail || DEFAULT_FROM_EMAIL,
            subject: `Devis pour votre projet ${projectType} - ${quoteData.title}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                        .container { max-width: 700px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, #1E40AF 100%); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center; }
                        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
                        .content { background: ${BRAND_COLORS.gray[50]}; padding: 40px 30px; border-radius: 0 0 12px 12px; }
                        .quote-box { background: white; padding: 30px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLORS.primary}; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                        .info-box { background: ${BRAND_COLORS.gray[100]}; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid ${BRAND_COLORS.gray[200]}; }
                        .info-box h3 { margin-top: 0; color: ${BRAND_COLORS.primary}; font-size: 18px; }
                        .table-container { overflow-x: auto; margin: 20px 0; }
                        table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; }
                        thead { background: ${BRAND_COLORS.primary}; color: white; }
                        th { padding: 12px; text-align: left; font-weight: 600; }
                        th.text-center { text-align: center; }
                        th.text-right { text-align: right; }
                        td { padding: 12px; }
                        .total-row { background: ${BRAND_COLORS.gray[100]}; font-weight: 600; }
                        .grand-total { background: ${BRAND_COLORS.primary}; color: white; font-size: 18px; font-weight: 700; }
                        .notes-box { background: #FFF9E6; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B; }
                        .cta-button { display: inline-block; background: ${BRAND_COLORS.primary}; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                        .footer { text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid ${BRAND_COLORS.gray[200]}; color: ${BRAND_COLORS.gray[500]}; font-size: 13px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>📋 Votre Devis est Prêt !</h1>
                            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">${quoteData.title}</p>
                        </div>
                        <div class="content">
                            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">Bonjour ${clientName},</p>
                            
                            <p style="font-size: 16px; color: #333; line-height: 1.8;">
                                Nous avons le plaisir de vous présenter notre devis détaillé pour votre projet <strong>${projectType}</strong>. 
                                Ce devis a été préparé avec soin en fonction de vos besoins et de vos attentes.
                            </p>

                            <div class="quote-box">
                                <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary}; font-size: 22px;">Description du Projet</h2>
                                <p style="margin: 0; font-size: 16px; color: #333; white-space: pre-wrap; line-height: 1.8;">${quoteData.description}</p>
                            </div>

                            <div class="quote-box" style="background: #F0F9FF; border-left-color: #0EA5E9;">
                                <h2 style="margin-top: 0; color: ${BRAND_COLORS.primary}; font-size: 22px;">📋 Proposition de Travail Détaillée</h2>
                                <p style="margin: 0; font-size: 16px; color: #333; white-space: pre-wrap; line-height: 1.8;">${quoteData.workProposal || 'Aucune proposition détaillée fournie.'}</p>
                            </div>

                            <div class="info-box">
                                <h3>Détails du Devis</h3>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Description</th>
                                                <th class="text-center">Qté</th>
                                                <th class="text-right">Prix unit.</th>
                                                <th class="text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${itemsHtml}
                                        </tbody>
                                        <tfoot>
                                            <tr class="total-row">
                                                <td colspan="4" style="text-align: right; padding: 15px 12px; font-weight: 600;">Sous-total:</td>
                                                <td style="text-align: right; padding: 15px 12px; font-weight: 600;">$${quoteData.subtotal.toFixed(2)}</td>
                                            </tr>
                                            <tr class="total-row">
                                                <td colspan="4" style="text-align: right; padding: 12px; font-weight: 600;">TVA (20%):</td>
                                                <td style="text-align: right; padding: 12px; font-weight: 600;">$${quoteData.tax.toFixed(2)}</td>
                                            </tr>
                                            <tr class="grand-total">
                                                <td colspan="4" style="text-align: right; padding: 20px 12px; font-weight: 700; font-size: 20px;">TOTAL:</td>
                                                <td style="text-align: right; padding: 20px 12px; font-weight: 700; font-size: 20px;">$${quoteData.total.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>

                            <div class="info-box">
                                <h3>Conditions et Informations</h3>
                                <p style="margin: 10px 0;"><strong>Date de validité:</strong> ${validUntilDate}</p>
                                <p style="margin: 10px 0;"><strong>Conditions de paiement:</strong> ${quoteData.paymentTerms} jours</p>
                                <p style="margin: 10px 0;"><strong>Type de projet:</strong> ${projectType}</p>
                            </div>

                            ${quoteData.notes ? `
                                <div class="notes-box">
                                    <h3 style="margin-top: 0; color: #F59E0B; font-size: 18px;">💬 Questions et Notes</h3>
                                    <p style="margin: 0; font-size: 16px; color: #333; white-space: pre-wrap; line-height: 1.8;">${quoteData.notes}</p>
                                </div>
                            ` : ''}

                            <div style="text-align: center; margin: 30px 0;">
                                <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
                                    Ce devis est valable jusqu'au <strong>${validUntilDate}</strong>.
                                </p>
                                
                                <div style="margin: 30px 0; padding: 25px; background: white; border-radius: 12px; border: 2px solid ${BRAND_COLORS.primary};">
                                    <h3 style="margin-top: 0; color: ${BRAND_COLORS.primary}; font-size: 20px; margin-bottom: 20px;">
                                        Répondez à ce devis
                                    </h3>
                                    <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
                                        Cliquez sur l'un des boutons ci-dessous pour répondre directement :
                                    </p>
                                    <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 0 auto;">
                                        <a href="${APP_URL}/quotes/${quoteId}/respond?action=accept&email=${encodeURIComponent(to)}" 
                                           style="display: block; background: #10B981; color: white; padding: 16px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; font-size: 16px; transition: background 0.3s; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                                            ✅ Accepter le devis
                                        </a>
                                        <a href="${APP_URL}/quotes/${quoteId}/respond?action=negotiate&email=${encodeURIComponent(to)}" 
                                           style="display: block; background: #F59E0B; color: white; padding: 16px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; font-size: 16px; transition: background 0.3s; box-shadow: 0 2px 4px rgba(245, 158, 11, 0.3);">
                                            💰 Je veux négocier pour un meilleur prix
                                        </a>
                                        <a href="${APP_URL}/quotes/${quoteId}/respond?action=reject&email=${encodeURIComponent(to)}" 
                                           style="display: block; background: #EF4444; color: white; padding: 16px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; text-align: center; font-size: 16px; transition: background 0.3s; box-shadow: 0 2px 4px rgba(239, 68, 68, 0.3);">
                                            ❌ Refuser le devis
                                        </a>
                                    </div>
                                    <p style="font-size: 12px; color: #999; margin-top: 20px; margin-bottom: 0;">
                                        En cliquant sur un bouton, vous serez redirigé vers une page de confirmation.
                                    </p>
                                </div>
                                
                                <p style="font-size: 16px; color: #333; margin-top: 20px;">
                                    Si vous avez des questions ou souhaitez discuter de ce devis, n'hésitez pas à nous contacter.
                                </p>
                            </div>

                            <p style="font-size: 16px; color: #333; margin-top: 30px;">
                                Cordialement,<br>
                                <strong style="color: ${BRAND_COLORS.primary};">${developerName}</strong>
                                ${developerEmail ? `<br><a href="mailto:${developerEmail}" style="color: ${BRAND_COLORS.primary};">${developerEmail}</a>` : ''}
                            </p>
                        </div>
                        <div class="footer">
                            <p>Cet email a été envoyé automatiquement depuis InnovaPort</p>
                            <p>Vous recevez cet email car vous avez soumis une demande de devis sur notre plateforme.</p>
                        </div>
                    </div>
                </body>
                </html>
            `,
        });

        if (error) {
            console.error('Error sending quote created email:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Failed to send quote created email:', error);
        throw error;
    }
}

