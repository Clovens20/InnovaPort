/**
 * API Route: GET /api/checkout/session
 * 
 * Fonction: Récupère les détails d'une session Stripe Checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('session_id');

        if (!sessionId) {
            return NextResponse.json(
                { error: 'Session ID requis' },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId, {
            expand: ['line_items', 'customer'],
        });

        return NextResponse.json({
            session: {
                id: session.id,
                amount_total: session.amount_total,
                currency: session.currency,
                customer_email: session.customer_email,
                payment_status: session.payment_status,
                status: session.status,
                metadata: session.metadata,
            },
        });
    } catch (error: any) {
        console.error('Error retrieving session:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors de la récupération de la session' },
            { status: 500 }
        );
    }
}

