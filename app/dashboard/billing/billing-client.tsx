"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Tag, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function BillingClient() {
    const { t, language } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'premium'>('free');
    const [loadingPlan, setLoadingPlan] = useState(true);
    
    // État pour les codes promo
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null);
    const [validatingPromo, setValidatingPromo] = useState(false);
    const [promoError, setPromoError] = useState<string | null>(null);
    const [promoDiscount, setPromoDiscount] = useState<{ type: 'percentage' | 'fixed'; value: number } | null>(null);

    useEffect(() => {
        loadCurrentPlan();
        
        // Vérifier si le paiement a réussi
        if (searchParams.get('success') === 'true') {
            const plan = searchParams.get('plan');
            if (plan) {
                alert(t('dashboard.billing.subscriptionActivated', { plan }));
                router.replace('/dashboard/billing');
            }
        }
        
        if (searchParams.get('canceled') === 'true') {
            alert(t('dashboard.billing.paymentCanceled'));
            router.replace('/dashboard/billing');
        }
    }, [searchParams, router, t]);

    const loadCurrentPlan = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            if (profile?.subscription_tier) {
                setCurrentPlan(profile.subscription_tier as 'free' | 'pro' | 'premium');
            }
        } catch (error) {
            console.error('Error loading current plan:', error);
        } finally {
            setLoadingPlan(false);
        }
    };

    const validatePromoCode = async (code: string, plan: 'pro' | 'premium') => {
        if (!code.trim()) {
            setPromoError(null);
            setAppliedPromoCode(null);
            setPromoDiscount(null);
            return;
        }

        setValidatingPromo(true);
        setPromoError(null);

        try {
            const response = await fetch('/api/promo-codes/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code: code.trim(), plan }),
            });

            const data = await response.json();

            if (data.valid) {
                setAppliedPromoCode(data.code);
                setPromoDiscount({
                    type: data.discount_type,
                    value: data.discount_value,
                });
                setPromoError(null);
            } else {
                setAppliedPromoCode(null);
                setPromoDiscount(null);
                setPromoError(data.error || t('dashboard.billing.promoCodeInvalid'));
            }
        } catch (error) {
            console.error('Error validating promo code:', error);
            setPromoError(t('dashboard.billing.promoCodeError'));
            setAppliedPromoCode(null);
            setPromoDiscount(null);
        } finally {
            setValidatingPromo(false);
        }
    };

    const removePromoCode = () => {
        setPromoCode('');
        setAppliedPromoCode(null);
        setPromoDiscount(null);
        setPromoError(null);
    };

    const handleSubscribe = async (plan: 'pro' | 'premium') => {
        if (currentPlan === plan) {
            alert(t('dashboard.billing.alreadySubscribed'));
            return;
        }

        // Valider le code promo pour ce plan spécifique si un code est saisi
        if (promoCode.trim() && !appliedPromoCode) {
            setValidatingPromo(true);
            try {
                const validationResponse = await fetch('/api/promo-codes/validate', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: promoCode.trim(), plan }),
                });

                const validationData = await validationResponse.json();
                
                if (!validationData.valid) {
                    alert(validationData.error || t('dashboard.billing.promoCodeInvalid'));
                    setValidatingPromo(false);
                    return;
                }
                
                // Code valide pour ce plan
                setAppliedPromoCode(validationData.code);
                setPromoDiscount({
                    type: validationData.discount_type,
                    value: validationData.discount_value,
                });
            } catch (error) {
                console.error('Error validating promo code:', error);
                alert(t('dashboard.billing.promoCodeError'));
                setValidatingPromo(false);
                return;
            } finally {
                setValidatingPromo(false);
            }
        }

        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    plan,
                    locale: language,
                    promoCode: appliedPromoCode || promoCode.trim() || undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = data.error || t('common.error');
                
                if (data.details) {
                    errorMessage += `\n\n${data.details}`;
                }
                
                if (data.hint) {
                    errorMessage += `\n\n💡 ${data.hint}`;
                }
                
                throw new Error(errorMessage);
            }

            // Rediriger vers Stripe Checkout
            if (data.success && data.url) {
                window.location.href = data.url;
            } else if (data.success) {
                alert(data.message || t('dashboard.billing.subscriptionSuccess'));
                window.location.reload();
            } else {
                throw new Error(t('common.error'));
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            const errorMessage = error instanceof Error ? error.message : t('common.error');
            alert(errorMessage);
            setLoading(false);
        }
    };

    const calculatePrice = (basePrice: number) => {
        if (!promoDiscount) return basePrice;
        
        if (promoDiscount.type === 'percentage') {
            return basePrice * (1 - promoDiscount.value / 100);
        } else {
            return Math.max(0, basePrice - promoDiscount.value);
        }
    };

    const formatPrice = (price: number) => {
        return `$${price.toFixed(2)}`;
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-12">{t('dashboard.billing.title')}</h1>

            {/* Champ Code Promo Global */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('dashboard.billing.promoCode')}
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => {
                                        setPromoCode(e.target.value.toUpperCase());
                                        if (appliedPromoCode) {
                                            removePromoCode();
                                        }
                                    }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && promoCode.trim()) {
                                            e.preventDefault();
                                            // Valider pour les deux plans possibles
                                            validatePromoCode(promoCode.trim(), 'pro');
                                        }
                                    }}
                                    placeholder={t('dashboard.billing.promoCodePlaceholder')}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none"
                                    disabled={validatingPromo || loading}
                                />
                            </div>
                            {appliedPromoCode && (
                                <button
                                    onClick={removePromoCode}
                                    className="px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    title={language === 'fr' ? 'Retirer le code promo' : 'Remove promo code'}
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                        {validatingPromo && (
                            <p className="mt-2 text-sm text-gray-600 flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {language === 'fr' ? 'Validation...' : 'Validating...'}
                            </p>
                        )}
                        {promoError && (
                            <p className="mt-2 text-sm text-red-600">{promoError}</p>
                        )}
                        {appliedPromoCode && promoDiscount && (
                            <div className="mt-2 flex items-center gap-2">
                                <span className="text-sm font-semibold text-green-700">
                                    {language === 'fr' ? '✓ Code promo appliqué' : '✓ Promo code applied'}
                                </span>
                                <span className="text-sm text-gray-600">
                                    {promoDiscount.type === 'percentage' 
                                        ? `-${promoDiscount.value}%`
                                        : `-$${promoDiscount.value}`}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t('dashboard.billing.free')}</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">$0</span>
                        <span className="text-gray-600">{t('dashboard.billing.perMonth')}</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{t('dashboard.billing.features.free.activeProjects')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{t('dashboard.billing.features.free.basicQuotes')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{t('dashboard.billing.features.free.contactForm')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{t('dashboard.billing.features.free.subdomain')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>{t('dashboard.billing.features.free.withLogo')}</span>
                        </li>
                    </ul>
                    <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold bg-gray-50 cursor-not-allowed">
                        {t('dashboard.billing.currentPlan')}
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-[#1E3A8A] rounded-xl shadow-xl text-white p-8 relative flex flex-col transform md:-translate-y-4">
                    <h3 className="text-xl font-bold mb-2">{t('dashboard.billing.pro')}</h3>
                    <div className="mb-6">
                        {promoDiscount && appliedPromoCode ? (
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-blue-200 line-through">
                                        $19
                                    </span>
                                    <span className="text-4xl font-black">
                                        {formatPrice(calculatePrice(19))}
                                    </span>
                                </div>
                                <span className="text-blue-100">{t('dashboard.billing.perMonth')}</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-4xl font-black">$19</span>
                                <span className="text-blue-100">{t('dashboard.billing.perMonth')}</span>
                            </>
                        )}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-blue-100">
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.unlimitedProjects')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.customDomain')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.noWatermark')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.autoQuotes')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.eSignatures')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.export')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.analytics')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.pro.prioritySupport')}</span>
                        </li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe('pro')}
                        disabled={loading || currentPlan === 'pro' || loadingPlan || validatingPromo}
                        className={clsx(
                            "w-full py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center justify-center gap-2",
                            currentPlan === 'pro'
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-white text-[#1E3A8A] hover:bg-gray-100"
                        )}
                    >
                        {loading && currentPlan !== 'pro' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('dashboard.billing.loading')}
                            </>
                        ) : currentPlan === 'pro' ? (
                            t('dashboard.billing.currentPlan')
                        ) : (
                            t('dashboard.billing.choosePro')
                        )}
                    </button>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-xl text-white p-8 flex flex-col">
                    <h3 className="text-xl font-bold mb-2">{t('dashboard.billing.premium')}</h3>
                    <div className="mb-6">
                        {promoDiscount && appliedPromoCode ? (
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-purple-200 line-through">
                                        $39
                                    </span>
                                    <span className="text-4xl font-black">
                                        {formatPrice(calculatePrice(39))}
                                    </span>
                                </div>
                                <span className="text-purple-100">{t('dashboard.billing.perMonth')}</span>
                            </div>
                        ) : (
                            <>
                                <span className="text-4xl font-black">$39</span>
                                <span className="text-purple-100">{t('dashboard.billing.perMonth')}</span>
                            </>
                        )}
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-purple-100">
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.premium.allPro')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.premium.multiUsers')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.premium.customClientSpace')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.premium.accountingIntegration')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.premium.advancedAutomations')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>{t('dashboard.billing.features.premium.customReports')}</span>
                        </li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe('premium')}
                        disabled={loading || currentPlan === 'premium' || loadingPlan || validatingPromo}
                        className={clsx(
                            "w-full py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center justify-center gap-2",
                            currentPlan === 'premium'
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                : "bg-white text-purple-600 hover:bg-gray-100"
                        )}
                    >
                        {loading && currentPlan !== 'premium' ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                {t('dashboard.billing.loading')}
                            </>
                        ) : currentPlan === 'premium' ? (
                            t('dashboard.billing.currentPlan')
                        ) : (
                            t('dashboard.billing.choosePremium')
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
