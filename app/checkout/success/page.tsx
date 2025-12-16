/**
 * Page: /checkout/success
 * 
 * Fonction: Page de succès bilingue après paiement Stripe
 * Dépendances: stripe, next/navigation
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { motion } from 'framer-motion';

// Composant de chargement
function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Chargement...</p>
            </div>
        </div>
    );
}

// Composant qui utilise useSearchParams
function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { t, language } = useTranslation();
    
    const sessionId = searchParams.get('session_id');
    const planParam = searchParams.get('plan') || 'pro';
    const langParam = searchParams.get('lang');
    
    // Utiliser la langue de l'URL ou celle détectée
    const currentLang = langParam === 'fr' ? 'fr' : 'en';
    
    const [loading, setLoading] = useState(true);
    const [session, setSession] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!sessionId) {
            setError('Session ID manquant');
            setLoading(false);
            return;
        }

        // Récupérer les détails de la session depuis Stripe
        const fetchSession = async () => {
            try {
                const response = await fetch(`/api/checkout/session?session_id=${sessionId}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Erreur lors de la récupération de la session');
                }

                setSession(data.session);
            } catch (err: any) {
                console.error('Error fetching session:', err);
                setError(err.message || 'Erreur lors de la récupération des détails');
            } finally {
                setLoading(false);
            }
        };

        fetchSession();
    }, [sessionId]);

    const planName = planParam === 'premium' 
        ? (currentLang === 'fr' ? t('dashboard.billing.premium') : t('dashboard.billing.premium'))
        : (currentLang === 'fr' ? t('dashboard.billing.pro') : t('dashboard.billing.pro'));

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">
                        {t('common.loading')}
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50">
                <div className="max-w-md mx-auto text-center p-8">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">
                            {t('common.error')}
                        </h1>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <Link
                            href="/dashboard/billing"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            {t('checkout.cancel.backToDashboard')}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-12 px-4">
            <div className="max-w-2xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    {/* Header avec animation */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', duration: 0.5 }}
                            className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle2 className="w-12 h-12 text-green-600" />
                        </motion.div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {t('checkout.success.title')}
                        </h1>
                        <p className="text-green-100 text-lg">
                            {t('checkout.success.message', { planName })}
                        </p>
                    </div>

                    {/* Contenu */}
                    <div className="p-8">
                        {session && (
                            <div className="space-y-6 mb-8">
                                {/* Détails de l'abonnement */}
                                <div className="bg-gray-50 rounded-lg p-6">
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                        {t('checkout.success.details')}
                                    </h2>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">
                                                {t('checkout.success.plan')}
                                            </span>
                                            <span className="font-semibold text-gray-900">{planName}</span>
                                        </div>
                                        {session.amount_total && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    {t('checkout.success.amount')}
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ${(session.amount_total / 100).toFixed(2)} USD
                                                </span>
                                            </div>
                                        )}
                                        {session.customer_email && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">
                                                    {t('checkout.success.email')}
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    {session.customer_email}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Message de confirmation */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <p className="text-blue-900">
                                    {t('checkout.success.activeMessage')}
                                </p>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/dashboard"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                {t('checkout.success.goToDashboard')}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/dashboard/billing"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                {t('checkout.success.viewSubscription')}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

// Composant principal avec Suspense
export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <SuccessContent />
        </Suspense>
    );
}