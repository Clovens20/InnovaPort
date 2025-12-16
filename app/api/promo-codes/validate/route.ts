/**
 * API Route: POST /api/promo-codes/validate
 * 
 * Fonction: Valide un code promo InnovaPort
 * Dépendances: @supabase/supabase-js
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabasePublic = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { code, plan } = body;

        if (!code || typeof code !== 'string') {
            return NextResponse.json(
                { 
                    valid: false,
                    error: 'Code promo requis' 
                },
                { status: 400 }
            );
        }

        if (!plan || !['pro', 'premium'].includes(plan)) {
            return NextResponse.json(
                { 
                    valid: false,
                    error: 'Plan invalide' 
                },
                { status: 400 }
            );
        }

        // Rechercher le code promo
        const { data: promoCode, error } = await supabasePublic
            .from('promo_codes')
            .select('*')
            .eq('code', code.toUpperCase().trim())
            .eq('is_active', true)
            .single();

        if (error || !promoCode) {
            return NextResponse.json({
                valid: false,
                error: 'Code promo invalide',
            });
        }

        // Vérifier la date de validité
        const now = new Date();
        const validFrom = new Date(promoCode.valid_from);
        const validUntil = new Date(promoCode.valid_until);

        if (now < validFrom || now > validUntil) {
            return NextResponse.json({
                valid: false,
                error: 'Code promo expiré',
            });
        }

        // Vérifier le nombre d'utilisations
        if (promoCode.max_uses && promoCode.current_uses >= promoCode.max_uses) {
            return NextResponse.json({
                valid: false,
                error: 'Code promo épuisé',
            });
        }

        // Vérifier si le code s'applique au plan
        if (promoCode.applicable_plans && promoCode.applicable_plans.length > 0) {
            if (!promoCode.applicable_plans.includes(plan)) {
                return NextResponse.json({
                    valid: false,
                    error: `Ce code promo n'est pas valide pour le plan ${plan}`,
                });
            }
        }

        // Code promo valide
        return NextResponse.json({
            valid: true,
            code: promoCode.code,
            discount_type: promoCode.discount_type,
            discount_value: promoCode.discount_value,
            applicable_plans: promoCode.applicable_plans,
        });
    } catch (error: any) {
        console.error('Error validating promo code:', error);
        return NextResponse.json(
            { 
                valid: false,
                error: 'Erreur lors de la validation du code promo' 
            },
            { status: 500 }
        );
    }
}

