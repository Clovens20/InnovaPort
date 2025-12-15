"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function BillingClient() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [loading, setLoading] = useState(false);
    const [currentPlan, setCurrentPlan] = useState<'free' | 'pro' | 'premium'>('free');
    const [loadingPlan, setLoadingPlan] = useState(true);

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
    }, [searchParams, router]);

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

    const handleSubscribe = async (plan: 'pro' | 'premium') => {
        if (currentPlan === plan) {
            alert(t('dashboard.billing.alreadySubscribed'));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ plan }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || t('common.error'));
            }

            // Rediriger vers Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error(t('common.error'));
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert(error instanceof Error ? error.message : t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-12">{t('dashboard.billing.title')}</h1>

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
                        <span className="text-4xl font-black">$19</span>
                        <span className="text-blue-100">{t('dashboard.billing.perMonth')}</span>
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
                        disabled={loading || currentPlan === 'pro' || loadingPlan}
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
                        <span className="text-4xl font-black">$39</span>
                        <span className="text-purple-100">{t('dashboard.billing.perMonth')}</span>
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
                        disabled={loading || currentPlan === 'premium' || loadingPlan}
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

