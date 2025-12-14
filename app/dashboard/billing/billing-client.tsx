"use client";

import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import clsx from "clsx";

export function BillingClient() {
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
                alert(`Abonnement ${plan} activé avec succès !`);
                router.replace('/dashboard/billing');
            }
        }
        
        if (searchParams.get('canceled') === 'true') {
            alert('Paiement annulé');
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
            alert('Vous êtes déjà abonné à ce plan.');
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
                throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
            }

            // Rediriger vers Stripe Checkout
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('URL de paiement non disponible');
            }
        } catch (error) {
            console.error('Error subscribing:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de l\'abonnement');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-12">Abonnement</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">$0</span>
                        <span className="text-gray-600">/mois</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>5 projets actifs</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>Gestion de devis basique</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>Formulaire de contact</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>Sous-domaine InnovaPort</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span>Avec logo InnovaPort</span>
                        </li>
                    </ul>
                    <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold bg-gray-50 cursor-not-allowed">
                        Plan actuel
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-[#1E3A8A] rounded-xl shadow-xl text-white p-8 relative flex flex-col transform md:-translate-y-4">
                    <h3 className="text-xl font-bold mb-2">Pro</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black">$19</span>
                        <span className="text-blue-100">/mois</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-blue-100">
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Projets illimités</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Domaine personnalisé</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Sans filigrane ni logo</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Devis & factures automatiques</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Signatures électroniques</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Export PDF/Excel</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Analytics et rapports</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Support prioritaire</span>
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
                                Chargement...
                            </>
                        ) : currentPlan === 'pro' ? (
                            'Plan actuel'
                        ) : (
                            'Choisir Pro'
                        )}
                    </button>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-xl text-white p-8 flex flex-col">
                    <h3 className="text-xl font-bold mb-2">Premium</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black">$39</span>
                        <span className="text-purple-100">/mois</span>
                    </div>
                    <ul className="space-y-3 mb-8 flex-1 text-sm text-purple-100">
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Tout du plan Pro</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Multi-utilisateurs (équipe)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Espace client personnalisé</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Intégration comptable</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Automatisations avancées</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <Check className="w-5 h-5 text-white flex-shrink-0" />
                            <span>Rapports personnalisés</span>
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
                                Chargement...
                            </>
                        ) : currentPlan === 'premium' ? (
                            'Plan actuel'
                        ) : (
                            'Choisir Premium'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

