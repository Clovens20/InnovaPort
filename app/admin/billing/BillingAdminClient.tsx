'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Check } from 'lucide-react';

export function BillingAdminClient() {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [plans, setPlans] = useState({
        free: {
            name: 'Gratuit',
            price: 0,
            features: [
                '5 projets actifs',
                'Gestion de devis basique',
                'Formulaire de contact',
                'Sous-domaine InnovaPort',
                'Avec logo InnovaPort',
            ]
        },
        pro: {
            name: 'Pro',
            price: 19,
            features: [
                'Projets illimités',
                'Domaine personnalisé',
                'Sans filigrane ni logo',
                'Devis & factures automatiques',
                'Signatures électroniques',
                'Export PDF/Excel',
                'Analytics et rapports',
                'Support prioritaire',
            ]
        },
        premium: {
            name: 'Premium',
            price: 39,
            features: [
                'Tout du plan Pro',
                'Multi-utilisateurs (équipe)',
                'Espace client personnalisé',
                'Intégration comptable',
                'Automatisations avancées',
                'Rapports personnalisés',
            ]
        }
    });

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // TODO: Implémenter la sauvegarde dans la base de données
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Plans et prix mis à jour avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'admin
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Plans & Prix</h1>
                <p className="text-gray-600 mt-1">Gérez les prix et fonctionnalités des abonnements</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-8 mb-8">
                {/* Free Plan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h2>
                    <div className="mb-6">
                        <div className="flex items-baseline">
                            <span className="text-4xl font-black text-gray-900">${plans.free.price}</span>
                            <span className="text-gray-600 ml-2">/mois</span>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6 flex-1">
                        {plans.free.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-gray-600">{feature}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prix ($/mois)
                            </label>
                            <input
                                type="number"
                                value={plans.free.price}
                                onChange={(e) => setPlans({
                                    ...plans,
                                    free: { ...plans.free, price: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Pro Plan */}
                <div className="bg-[#1E3A8A] rounded-xl shadow-xl text-white p-8 relative flex flex-col transform md:-translate-y-4">
                    <h2 className="text-xl font-bold mb-2">Pro</h2>
                    <div className="mb-6">
                        <div className="flex items-baseline">
                            <span className="text-4xl font-black">${plans.pro.price}</span>
                            <span className="text-blue-100 ml-2">/mois</span>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6 flex-1 text-sm text-blue-100">
                        {plans.pro.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-white flex-shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 border-t border-blue-400 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-blue-100 mb-1">
                                Prix ($/mois)
                            </label>
                            <input
                                type="number"
                                value={plans.pro.price}
                                onChange={(e) => setPlans({
                                    ...plans,
                                    pro: { ...plans.pro, price: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full px-4 py-2 border border-blue-400 rounded-lg bg-white/10 text-white placeholder-blue-200 focus:ring-2 focus:ring-white focus:border-white"
                                style={{ color: 'white' }}
                            />
                        </div>
                    </div>
                </div>

                {/* Premium Plan */}
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl shadow-xl text-white p-8 flex flex-col">
                    <h2 className="text-xl font-bold mb-2">Premium</h2>
                    <div className="mb-6">
                        <div className="flex items-baseline">
                            <span className="text-4xl font-black">${plans.premium.price}</span>
                            <span className="text-purple-100 ml-2">/mois</span>
                        </div>
                    </div>
                    <div className="space-y-3 mb-6 flex-1 text-sm text-purple-100">
                        {plans.premium.features.map((feature, idx) => (
                            <div key={idx} className="flex items-start gap-2">
                                <Check className="w-5 h-5 text-white flex-shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 border-t border-purple-400 pt-4">
                        <div>
                            <label className="block text-sm font-medium text-purple-100 mb-1">
                                Prix ($/mois)
                            </label>
                            <input
                                type="number"
                                value={plans.premium.price}
                                onChange={(e) => setPlans({
                                    ...plans,
                                    premium: { ...plans.premium, price: parseInt(e.target.value) || 0 }
                                })}
                                className="w-full px-4 py-2 border border-purple-400 rounded-lg bg-white/10 text-white placeholder-purple-200 focus:ring-2 focus:ring-white focus:border-white"
                                style={{ color: 'white' }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Enregistrer les modifications
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

