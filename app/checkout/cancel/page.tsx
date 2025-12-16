/**
 * Page: /checkout/cancel
 * 
 * Fonction: Page d'annulation bilingue après annulation du paiement Stripe
 */

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

// Composant de chargement
function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
        </div>
    );
}

// Composant qui utilise useSearchParams
function CancelContent() {
    const searchParams = useSearchParams();
    const { t, language } = useTranslation();
    
    const langParam = searchParams.get('lang');
    const planParam = searchParams.get('plan') || 'pro';
    
    // Utiliser la langue de l'URL ou celle détectée
    const currentLang = langParam === 'fr' ? 'fr' : 'en';

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 py-12 px-4">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-12 h-12 text-orange-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {t('checkout.cancel.title')}
                        </h1>
                        <p className="text-orange-100 text-lg">
                            {t('checkout.cancel.message')}
                        </p>
                    </div>

                    {/* Contenu */}
                    <div className="p-8">
                        <div className="space-y-6 mb-8">
                            {/* Message */}
                            <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                                <p className="text-orange-900">
                                    {t('checkout.cancel.helpMessage')}
                                </p>
                            </div>

                            {/* Raisons possibles */}
                            <div className="bg-gray-50 rounded-lg p-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    {t('checkout.cancel.whyCancelled')}
                                </h2>
                                <ul className="space-y-2 text-gray-600">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>{t('checkout.cancel.reason1')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>{t('checkout.cancel.reason2')}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-1">•</span>
                                        <span>{t('checkout.cancel.reason3')}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href={`/dashboard/billing?plan=${planParam}`}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                            >
                                <RefreshCw className="w-5 h-5" />
                                {t('checkout.cancel.tryAgain')}
                            </Link>
                            <Link
                                href="/dashboard"
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                {t('checkout.cancel.backToDashboard')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Composant principal avec Suspense
export default function CheckoutCancelPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <CancelContent />
        </Suspense>
    );
}