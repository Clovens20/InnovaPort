/**
 * API Route: POST /api/verify-captcha
 * 
 * Fonction: Vérifie le token reCAPTCHA côté serveur
 * Dépendances: fetch
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json();

        if (!token) {
            return NextResponse.json(
                { error: 'Token CAPTCHA manquant' },
                { status: 400 }
            );
        }

        // Vérifier le token avec Google reCAPTCHA
        const secretKey = process.env.RECAPTCHA_SECRET_KEY;
        
        if (!secretKey) {
            // En développement, accepter sans vérification si la clé n'est pas configurée
            // Cela permet de tester en local sans configurer reCAPTCHA
            if (process.env.NODE_ENV === 'development') {
                console.warn('⚠️ RECAPTCHA_SECRET_KEY not configured, skipping verification in development');
                console.warn('💡 Pour activer reCAPTCHA en local, configurez RECAPTCHA_SECRET_KEY dans .env');
                return NextResponse.json({ success: true });
            }
            
            return NextResponse.json(
                { error: 'Configuration CAPTCHA manquante' },
                { status: 500 }
            );
        }

        // Vérifier le token avec Google reCAPTCHA
        // Note: Google reCAPTCHA accepte automatiquement localhost et 127.0.0.1 pour le développement
        const response = await fetch(
            `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
            {
                method: 'POST',
            }
        );

        const data = await response.json();

        // En développement, logger les erreurs pour debug
        if (process.env.NODE_ENV === 'development' && !data.success) {
            console.warn('⚠️ reCAPTCHA verification failed:', data['error-codes']);
            console.warn('💡 Assurez-vous que localhost est ajouté dans les domaines autorisés sur Google reCAPTCHA Admin');
        }

        if (!data.success) {
            // Vérifier si c'est une erreur de domaine (localhost non autorisé)
            const errorCodes = data['error-codes'] || [];
            const isDomainError = errorCodes.some((code: string) => 
                code === 'invalid-input-response' || 
                code === 'missing-input-response' ||
                code === 'timeout-or-duplicate'
            );

            return NextResponse.json(
                { 
                    error: 'CAPTCHA invalide', 
                    details: errorCodes,
                    hint: isDomainError ? 'Assurez-vous que localhost est ajouté dans les domaines autorisés sur Google reCAPTCHA Admin' : undefined
                },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error verifying CAPTCHA:', error);
        return NextResponse.json(
            { error: 'Erreur lors de la vérification du CAPTCHA' },
            { status: 500 }
        );
    }
}

