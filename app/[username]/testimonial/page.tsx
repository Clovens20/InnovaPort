/**
 * Page: /[username]/testimonial
 * 
 * Fonction: Permet aux clients de soumettre un témoignage
 * Dépendances: react, next/navigation, zod
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Star, Check, X, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { LanguageSwitcher } from '@/app/_components/language-switcher';

export default function TestimonialPage() {
    const { t } = useTranslation();
    const params = useParams();
    const router = useRouter();
    const username = params.username as string;
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [developerName, setDeveloperName] = useState('');

    const [formData, setFormData] = useState({
        client_name: '',
        client_email: '',
        client_company: '',
        client_position: '',
        rating: 0,
        testimonial_text: '',
        project_name: '',
        project_url: '',
    });

    // Charger les informations du développeur
    useEffect(() => {
        loadDeveloperInfo();
    }, [username]);

    const loadDeveloperInfo = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, username')
                .eq('username', username)
                .single();

            if (error || !data) {
                router.push(`/${username}`);
                return;
            }

            setUserId(data.id);
            setDeveloperName(data.full_name || data.username);
        } catch (err) {
            console.error('Error loading developer info:', err);
            router.push(`/${username}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRatingClick = (rating: number) => {
        setFormData({ ...formData, rating });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Validation basique
        if (!formData.client_name.trim()) {
            setError(t('portfolio.testimonialForm.nameRequired'));
            setSubmitting(false);
            return;
        }

        if (!formData.client_email.trim() || !formData.client_email.includes('@')) {
            setError(t('portfolio.testimonialForm.emailRequired'));
            setSubmitting(false);
            return;
        }

        if (!formData.testimonial_text.trim() || formData.testimonial_text.length < 10) {
            setError(t('portfolio.testimonialForm.testimonialMinLength'));
            setSubmitting(false);
            return;
        }

        if (!userId) {
            setError(t('portfolio.testimonialForm.developerNotFound'));
            setSubmitting(false);
            return;
        }

        try {
            const response = await fetch('/api/testimonials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: userId,
                    client_name: formData.client_name.trim(),
                    client_email: formData.client_email.trim().toLowerCase(),
                    client_company: formData.client_company.trim() || null,
                    client_position: formData.client_position.trim() || null,
                    rating: formData.rating > 0 ? formData.rating : null,
                    testimonial_text: formData.testimonial_text.trim(),
                    project_name: formData.project_name.trim() || null,
                    project_url: formData.project_url.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.details && Array.isArray(data.details)) {
                    const errorMessages = data.details.map((err: any) => err.message).join(', ');
                    throw new Error(errorMessages || data.error || t('portfolio.testimonialForm.errorSending'));
                }
                throw new Error(data.error || t('portfolio.testimonialForm.errorSending'));
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/${username}`);
            }, 3000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('portfolio.testimonialForm.errorSendingTestimonial');
            setError(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('portfolio.testimonialForm.successTitle')}</h2>
                    <p className="text-gray-600 mb-6">
                        {t('portfolio.testimonialForm.successMessage', { name: developerName })}
                    </p>
                    <p className="text-sm text-gray-500">{t('portfolio.testimonialForm.redirecting')}</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4">
            {/* Header avec Language Switcher */}
            <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-50 mb-8">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-end">
                    <LanguageSwitcher />
                </div>
            </header>

            <div className="max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl shadow-lg p-8"
                >
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('portfolio.testimonialForm.title')}</h1>
                        <p className="text-gray-600">
                            {t('portfolio.testimonialForm.subtitle', { name: developerName })}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Nom */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('portfolio.testimonialForm.yourName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.client_name}
                                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                placeholder={t('portfolio.testimonialForm.namePlaceholder')}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('portfolio.testimonialForm.yourEmail')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.client_email}
                                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                placeholder={t('portfolio.testimonialForm.emailPlaceholder')}
                            />
                        </div>

                        {/* Entreprise et Poste */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('portfolio.testimonialForm.company')} ({t('common.optional')})
                                </label>
                                <input
                                    type="text"
                                    value={formData.client_company}
                                    onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    placeholder={t('portfolio.testimonialForm.companyPlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('portfolio.testimonialForm.position')} ({t('common.optional')})
                                </label>
                                <input
                                    type="text"
                                    value={formData.client_position}
                                    onChange={(e) => setFormData({ ...formData, client_position: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    placeholder={t('portfolio.testimonialForm.positionPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Note */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('portfolio.testimonialForm.rating')} ({t('common.optional')})
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => handleRatingClick(star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-8 h-8 ${
                                                star <= formData.rating
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            } hover:text-yellow-400 transition-colors`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Projet */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('portfolio.testimonialForm.projectName')} ({t('common.optional')})
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_name}
                                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    placeholder={t('portfolio.testimonialForm.projectNamePlaceholder')}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('portfolio.testimonialForm.projectUrl')} ({t('common.optional')})
                                </label>
                                <input
                                    type="url"
                                    value={formData.project_url}
                                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    placeholder={t('portfolio.testimonialForm.projectUrlPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Témoignage */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('portfolio.testimonialForm.yourTestimonial')} <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={formData.testimonial_text}
                                onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                                required
                                rows={6}
                                minLength={10}
                                maxLength={1000}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none resize-none"
                                placeholder={t('portfolio.testimonialForm.testimonialPlaceholder')}
                            />
                            <p className="text-sm text-gray-500 mt-2">
                                {formData.testimonial_text.length}/1000 {t('portfolio.testimonialForm.characters')}
                            </p>
                        </div>

                        {/* Boutons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.push(`/${username}`)}
                                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('portfolio.testimonialForm.submitting')}
                                    </>
                                ) : (
                                    t('portfolio.testimonialForm.submit')
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

