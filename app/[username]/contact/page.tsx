/**
 * Page: /[username]/contact
 * 
 * Fonction: Page de contact avec formulaire de devis intégré à l'API
 * Dépendances: react, framer-motion, lucide-react
 * Raison: Remplace /preview/[subdomain]/contact avec intégration API réelle
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { projectTypes, budgetRanges, featuresList } from '@/utils/contact-constants';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LanguageSwitcher } from '@/app/_components/language-switcher';

export default function ContactPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;

    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [showOtherFeatures, setShowOtherFeatures] = useState(false);
    const [otherFeaturesText, setOtherFeaturesText] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        location: '',
        projectType: '',
        platforms: { ios: false, android: false },
        budget: '',
        deadline: '1-3',
        features: [] as string[],
        designPref: 'examples',
        description: '',
        hasVagueIdea: false,
        contactPref: 'Email',
        consentContact: false,
        consentPrivacy: false,
    });

    const updateFormData = (field: string, value: string | boolean | string[] | { ios: boolean; android: boolean }) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleFeature = (feature: string) => {
        setFormData((prev) => ({
            ...prev,
            features: prev.features.includes(feature)
                ? prev.features.filter((f) => f !== feature)
                : [...prev.features, feature],
        }));
    };

    const handleSubmit = async () => {
            // Validation des champs requis
            if (!formData.name || !formData.email || !formData.projectType || !formData.budget || !formData.description) {
                setSubmitError(t('common.error') + ': ' + t('contact.form.description') + ' ' + t('common.required'));
                return;
            }

            // Validation du consentement à la politique de confidentialité (requis)
            if (!formData.consentPrivacy) {
                setSubmitError(t('contact.form.consentPrivacy') + ' ' + t('common.required'));
                return;
            }

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Préparer les fonctionnalités : combiner les checkboxes et le texte "autre"
            const allFeatures: string[] = Array.isArray(formData.features) ? [...formData.features] : [];
            if (showOtherFeatures && otherFeaturesText.trim()) {
                const otherFeature = `${t('contact.form.otherFeaturePrefix')}: ${otherFeaturesText.trim()}`;
                // Limiter à 200 caractères pour la validation Zod
                if (otherFeature.length <= 200) {
                    allFeatures.push(otherFeature);
                } else {
                    setSubmitError(t('contact.form.featuresTooLong'));
                    setIsSubmitting(false);
                    return;
                }
            }

            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone || null,
                    company: formData.company || null,
                    location: formData.location || null,
                    projectType: formData.projectType,
                    platforms: formData.platforms || { ios: false, android: false },
                    budget: formData.budget,
                    deadline: formData.deadline || null,
                    features: allFeatures,
                    designPref: formData.designPref || null,
                    description: formData.description,
                    hasVagueIdea: formData.hasVagueIdea || false,
                    contactPref: formData.contactPref || 'Email',
                    consentContact: formData.consentContact || false,
                    consentPrivacy: formData.consentPrivacy,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Afficher les détails d'erreur de validation si disponibles
                if (data.details && Array.isArray(data.details)) {
                    const errorMessages = data.details.map((err: any) => err.message).join(', ');
                    throw new Error(errorMessages || data.error || t('common.error'));
                }
                throw new Error(data.error || t('common.error'));
            }

            setSubmitSuccess(true);
            setTimeout(() => {
                router.push(`/${username}`);
            }, 3000);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : t('common.error');
            setSubmitError(errorMessage);
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('contact.success.title')}</h2>
                    <p className="text-gray-600 mb-6">
                        {t('contact.success.message')}
                    </p>
                    <p className="text-sm text-gray-500">{t('contact.success.redirecting')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{t('contact.title')}</h1>
                    <p className="text-xl text-gray-600">{t('contact.subtitle')}</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className="flex items-center">
                                <div
                                    className={clsx(
                                        'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors duration-300',
                                        currentStep >= step ? 'bg-blue-900 text-white' : 'bg-gray-200 text-gray-500'
                                    )}
                                >
                                    {currentStep > step ? <Check className="w-5 h-5" /> : step}
                                </div>
                                {step < 4 && (
                                    <div
                                        className={clsx(
                                            'w-16 md:w-32 h-1 mx-2 transition-colors duration-300',
                                            currentStep > step ? 'bg-blue-900' : 'bg-gray-200'
                                        )}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 px-2">
                        <span>{t('contact.steps.yourInfo')}</span>
                        <span>{t('contact.steps.projectType')}</span>
                        <span>{t('contact.steps.details')}</span>
                        <span>{t('contact.steps.finalization')}</span>
                    </div>
                </div>

                {submitError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        {submitError}
                    </div>
                )}

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
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form.yourInfo')}</h2>
                                <div className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('contact.form.name')} *
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                                placeholder={t('contact.placeholders.name')}
                                                value={formData.name}
                                                onChange={(e) => updateFormData('name', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.email')} *</label>
                                            <input
                                                type="email"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                                placeholder={t('contact.placeholders.email')}
                                                value={formData.email}
                                                onChange={(e) => updateFormData('email', e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.phone')}</label>
                                            <input
                                                type="tel"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                                placeholder={t('contact.placeholders.phone')}
                                                value={formData.phone}
                                                onChange={(e) => updateFormData('phone', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.company')}</label>
                                            <input
                                                type="text"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                                placeholder={t('contact.placeholders.company')}
                                                value={formData.company}
                                                onChange={(e) => updateFormData('company', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('contact.form.location')}</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                            placeholder={t('contact.placeholders.location')}
                                            value={formData.location}
                                            onChange={(e) => updateFormData('location', e.target.value)}
                                        />
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
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form.projectTypeTitle')}</h2>
                                <div className="grid md:grid-cols-2 gap-4 mb-8">
                                    {projectTypes.map((type) => (
                                        <button
                                            key={type.value}
                                            onClick={() => updateFormData('projectType', type.value)}
                                            className={clsx(
                                                'p-6 border-2 rounded-xl text-left transition-all hover:shadow-md',
                                                formData.projectType === type.value
                                                    ? 'border-blue-900 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            )}
                                        >
                                            <div className="text-3xl mb-3 text-blue-900"><type.icon /></div>
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
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.form.projectDetails')}</h2>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">{t('contact.form.budget')} *</label>
                                    <div className="grid md:grid-cols-2 gap-3">
                                        {budgetRanges.map((range) => (
                                            <label
                                                key={range.value}
                                                className={clsx(
                                                    'flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all',
                                                    formData.budget === range.value
                                                        ? 'border-blue-900 bg-blue-50'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                )}
                                            >
                                                <input
                                                    type="radio"
                                                    name="budget"
                                                    value={range.value}
                                                    checked={formData.budget === range.value}
                                                    onChange={() => updateFormData('budget', range.value)}
                                                    className="mr-3 text-blue-900 focus:ring-blue-900"
                                                />
                                                <span className="font-medium">{range.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <label className="block text-sm font-medium text-gray-700 mb-3">
                                        {t('contact.form.features')}
                                    </label>
                                    <div className="grid md:grid-cols-2 gap-3 mb-4">
                                        {featuresList.map((feature) => (
                                            <label
                                                key={feature}
                                                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={formData.features.includes(feature)}
                                                    onChange={() => toggleFeature(feature)}
                                                    className="mr-3 rounded text-blue-900 focus:ring-blue-900"
                                                />
                                                <span className="text-sm">{feature}</span>
                                            </label>
                                        ))}
                                        <label
                                            className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={showOtherFeatures}
                                                onChange={(e) => {
                                                    setShowOtherFeatures(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setOtherFeaturesText('');
                                                    }
                                                }}
                                                className="mr-3 rounded text-blue-900 focus:ring-blue-900"
                                            />
                                            <span className="text-sm">{t('contact.form.other')}</span>
                                        </label>
                                    </div>
                                    
                                    {showOtherFeatures && (
                                        <div className="mt-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {t('contact.form.otherPlaceholder')}
                                            </label>
                                            <textarea
                                                rows={3}
                                                value={otherFeaturesText}
                                                onChange={(e) => setOtherFeaturesText(e.target.value)}
                                                placeholder={t('contact.form.otherPlaceholder')}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                            />
                                        </div>
                                    )}
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
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('contact.steps.finalization')}</h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {t('contact.form.description')} *
                                        </label>
                                        <textarea
                                            rows={6}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-900 outline-none"
                                            placeholder={t('contact.form.descriptionPlaceholder')}
                                            value={formData.description}
                                            onChange={(e) => updateFormData('description', e.target.value)}
                                            required
                                        />
                                    </div>

                                    <div className="p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                                        <label className="flex items-start cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="mt-1 mr-3 rounded text-amber-600 focus:ring-amber-500"
                                                checked={formData.hasVagueIdea}
                                                onChange={(e) => updateFormData('hasVagueIdea', e.target.checked)}
                                            />
                                            <div>
                                                <span className="font-semibold text-gray-900">{t('contact.form.vagueIdea')}</span>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {t('contact.form.vagueIdeaHelp')}
                                                </p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="pt-6 border-t border-gray-200 space-y-3">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="mr-3 rounded text-blue-900 focus:ring-blue-900"
                                                checked={formData.consentContact}
                                                onChange={(e) => updateFormData('consentContact', e.target.checked)}
                                            />
                                            <span className="text-sm">{t('contact.form.consentContact')}</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="mr-3 rounded text-blue-900 focus:ring-blue-900"
                                                checked={formData.consentPrivacy}
                                                onChange={(e) => updateFormData('consentPrivacy', e.target.checked)}
                                                required
                                            />
                                            <span className="text-sm">{t('contact.form.consentPrivacy')} *</span>
                                        </label>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    <div className="mt-12 flex justify-between items-center pt-6 border-t border-gray-100">
                        {currentStep > 1 && (
                            <button
                                onClick={() => setCurrentStep((c) => c - 1)}
                                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                                disabled={isSubmitting}
                            >
                                ← {t('contact.form.previous')}
                            </button>
                        )}

                        <div className="ml-auto">
                            {currentStep < 4 ? (
                                <button
                                    onClick={() => setCurrentStep((c) => c + 1)}
                                    className="px-8 py-3 bg-[#10B981] text-white rounded-lg font-semibold hover:bg-[#059669] transition-colors"
                                >
                                    {t('contact.form.next')} →
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {t('contact.form.submitting')}
                                        </>
                                    ) : (
                                        <>
                                            {t('contact.form.submit')}
                                            <Check className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

