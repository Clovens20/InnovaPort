"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Smartphone, Monitor, ShoppingCart, Globe, Server, Upload } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

const projectTypes = [
    { value: "web_app", label: "Application Web", icon: <Monitor />, description: "Saas, Dashboard, Outil métier" },
    { value: "mobile_app", label: "Application Mobile", icon: <Smartphone />, description: "iOS & Android" },
    { value: "ecommerce", label: "E-commerce", icon: <ShoppingCart />, description: "Boutique en ligne" },
    { value: "website", label: "Site Vitrine", icon: <Globe />, description: "Présentation entreprise" },
];

const budgetRanges = [
    { value: "small", label: "< 5 000€" },
    { value: "medium", label: "5k€ - 10k€" },
    { value: "large", label: "10k€ - 20k€" },
    { value: "xl", label: "> 20 000€" },
];

const featuresList = [
    "Paiement en ligne", "Authentification", "Multi-langues", "Dashboard admin", "Blog / News", "Réservation", "Chat / Messagerie", "Map / Géolocalisation"
];

export default function PublicQuoteForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        name: "", email: "", phone: "", company: "", location: "",
        projectType: "",
        platforms: { ios: false, android: false },
        budget: "",
        deadline: "1-3",
        features: [] as string[],
        designPref: "examples",
        description: "",
        hasVagueIdea: false,
        contactPref: "Email",
        consentContact: false,
        consentPrivacy: false
    });

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleFeature = (feature: string) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter(f => f !== feature)
                : [...prev.features, feature]
        }));
    };

    const handleSubmit = () => {
        alert("Demande envoyée avec succès ! (Simulation)");
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Demande de devis</h1>
                    <p className="text-xl text-gray-600">Parlez-nous de votre projet et recevez une proposition personnalisée</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4].map(step => (
                            <div key={step} className="flex items-center">
                                <div className={clsx(
                                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-300",
                                    currentStep >= step ? "bg-blue-900 text-white" : "bg-gray-200 text-gray-500"
                                )}>
                                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                                </div>
                                {step < 4 && (
                                    <div className={clsx(
                                        "w-16 md:w-32 h-1 mx-2 transition-colors duration-300",
                                        currentStep > step ? "bg-blue-900" : "bg-gray-200"
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 px-2">
                        <span>Contact</span>
                        <span>Projet</span>
                        <span>Détails</span>
                        <span>Finalisation</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-8 overflow-hidden relative min-h-[500px]">
                    <AnimatePresence mode="wait">
                        {/* STEP 1 */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Vos informations</h2>
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Nom complet *</label>
                                            <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Jean Dupont" value={formData.name} onChange={e => updateFormData('name', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                                            <input type="email" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" placeholder="jean@email.com" value={formData.email} onChange={e => updateFormData('email', e.target.value)} />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                                            <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" placeholder="+33 6..." value={formData.phone} onChange={e => updateFormData('phone', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Entreprise</label>
                                            <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Votre société" value={formData.company} onChange={e => updateFormData('company', e.target.value)} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Localisation</label>
                                        <input type="text" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Paris, France" value={formData.location} onChange={e => updateFormData('location', e.target.value)} />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2 */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Type de projet</h2>
                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    {projectTypes.map(type => (
                                        <button
                                            key={type.value}
                                            onClick={() => updateFormData('projectType', type.value)}
                                            className={clsx(
                                                "p-6 border-2 rounded-xl text-left transition-all hover:shadow-md",
                                                formData.projectType === type.value ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                            )}
                                        >
                                            <div className="text-3xl mb-3 text-blue-900">{type.icon}</div>
                                            <h3 className="font-semibold text-gray-900 mb-1">{type.label}</h3>
                                            <p className="text-sm text-gray-500">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3 */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Détails du projet</h2>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Budget estimé *</label>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {budgetRanges.map(range => (
                                            <label key={range.value} className={clsx(
                                                "flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all",
                                                formData.budget === range.value ? "border-blue-900 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                                            )}>
                                                <input type="radio" name="budget" value={range.value} checked={formData.budget === range.value} onChange={() => updateFormData('budget', range.value)} className="mr-3 text-blue-900 focus:ring-blue-900" />
                                                <span className="font-medium">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">Fonctionnalités souhaitées</label>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {featuresList.map(feature => (
                                            <label key={feature} className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input type="checkbox" checked={formData.features.includes(feature)} onChange={() => toggleFeature(feature)} className="mr-3 rounded text-blue-900 focus:ring-blue-900" />
                                                <span className="text-sm">{feature}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 4 */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Description finale</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description détaillée</label>
                                        <textarea rows={6} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none" placeholder="Décrivez votre projet..." />
                                    </div>

                                    <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                        <label className="flex items-start cursor-pointer">
                                            <input type="checkbox" className="mt-1 mr-3 rounded text-amber-600 focus:ring-amber-500" onChange={(e) => updateFormData('hasVagueIdea', e.target.checked)} />
                                            <div>
                                                <span className="font-semibold text-gray-900">Idée floue ?</span>
                                                <p className="text-sm text-gray-600 mt-1">On vous aide à structurer votre vision.</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-3 rounded text-blue-900 focus:ring-blue-900" />
                                            <span className="text-sm">J'accepte d'être contacté</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
                        {currentStep > 1 && (
                            <button onClick={() => setCurrentStep(c => c - 1)} className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                                ← Précédent
                            </button>
                        )}

                        <div className="ml-auto">
                            {currentStep < 4 ? (
                                <button onClick={() => setCurrentStep(c => c + 1)} className="px-8 py-3 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors">
                                    Suivant →
                                </button>
                            ) : (
                                <button onClick={handleSubmit} className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2">
                                    Envoyer
                                    <Check className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
