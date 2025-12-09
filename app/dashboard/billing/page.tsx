"use client";

import { Check, Star } from "lucide-react";
import clsx from "clsx";

export default function BillingPage() {
    return (
        <div className="max-w-6xl mx-auto py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-12">Abonnement</h1>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Free Plan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Gratuit</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">0€</span>
                        <span className="text-gray-600">/mois</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {["5 projets maximum", "Formulaire de cotation", "Sous-domaine inclus", "5 templates", "Personnalisation couleurs"].map((feat, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold bg-gray-50 cursor-not-allowed">
                        Plan actuel
                    </button>
                </div>

                {/* Pro Plan */}
                <div className="bg-white rounded-xl shadow-xl border-2 border-primary p-8 relative flex flex-col transform scale-105 z-10">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                        <span className="px-4 py-1 bg-amber-500 text-white text-sm font-bold rounded-full">POPULAIRE</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Pro</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">19€</span>
                        <span className="text-gray-600">/mois</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        {["Projets illimités", "Domaine personnalisé", "CSS personnalisé", "Sans branding", "Analytics de base", "Support email"].map((feat, i) => (
                            <li key={i} className="flex items-start text-sm font-medium text-gray-900">
                                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
                        Passer au Pro
                    </button>
                </div>

                {/* Business Plan */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Business</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-black text-gray-900">49€</span>
                        <span className="text-gray-600">/mois</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-start text-sm text-gray-500 italic">Tout du plan Pro +</li>
                        {["Analytics avancés", "Support prioritaire", "Export données", "API Access"].map((feat, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                                <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                                {feat}
                            </li>
                        ))}
                    </ul>
                    <button className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors">
                        Contacter les ventes
                    </button>
                </div>
            </div>
        </div>
    );
}
