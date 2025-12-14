'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, Loader2, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function TestimonialPage() {
    const router = useRouter();
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [hoveredRating, setHoveredRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage(null);

        // Validation basique
        if (!formData.client_name || !formData.client_email || !formData.testimonial_text) {
            setSubmitMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
            setIsSubmitting(false);
            return;
        }

        if (formData.testimonial_text.length < 10) {
            setSubmitMessage({ type: 'error', text: 'Le témoignage doit contenir au moins 10 caractères.' });
            setIsSubmitting(false);
            return;
        }

        try {
            // Note: Pour une page générale, on pourrait créer une table platform_testimonials
            // Pour l'instant, on va utiliser l'API existante mais avec un userId spécial
            // ou créer une nouvelle route API pour les témoignages de la plateforme
            
            // Solution temporaire : on va créer une route API pour les témoignages de la plateforme
            const response = await fetch('/api/platform-testimonials', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    client_name: formData.client_name,
                    client_email: formData.client_email,
                    client_company: formData.client_company.trim() || null,
                    client_position: formData.client_position.trim() || null,
                    rating: formData.rating || null,
                    testimonial_text: formData.testimonial_text,
                    project_name: formData.project_name.trim() || null,
                    project_url: formData.project_url.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la soumission du témoignage');
            }

            setSubmitMessage({ type: 'success', text: 'Merci pour votre témoignage ! Il sera publié après validation.' });
            
            // Réinitialiser le formulaire
            setFormData({
                client_name: '',
                client_email: '',
                client_company: '',
                client_position: '',
                rating: 0,
                testimonial_text: '',
                project_name: '',
                project_url: '',
            });

            // Rediriger après 3 secondes
            setTimeout(() => {
                router.push('/');
            }, 3000);
        } catch (error: any) {
            setSubmitMessage({ type: 'error', text: error.message || 'Erreur lors de la soumission du témoignage.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-16 px-6">
            <div className="max-w-3xl mx-auto">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour à l'accueil
                </Link>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 md:p-12"
                >
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Partagez votre <span className="text-[#1E3A8A]">expérience</span>
                        </h1>
                        <p className="text-lg text-gray-600">
                            Votre avis nous aide à améliorer InnovaPort et aide d'autres freelances à nous découvrir.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom complet <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.client_name}
                                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.client_email}
                                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                    placeholder="jean@example.com"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entreprise (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={formData.client_company}
                                    onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                    placeholder="Ma Startup"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Poste (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={formData.client_position}
                                    onChange={(e) => setFormData({ ...formData, client_position: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                    placeholder="CEO"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note (optionnel)
                            </label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, rating })}
                                        onMouseEnter={() => setHoveredRating(rating)}
                                        onMouseLeave={() => setHoveredRating(0)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`w-8 h-8 transition-colors ${
                                                rating <= (hoveredRating || formData.rating)
                                                    ? 'text-yellow-400 fill-current'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Votre témoignage <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                required
                                rows={6}
                                value={formData.testimonial_text}
                                onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                placeholder="Décrivez votre expérience avec InnovaPort..."
                                minLength={10}
                            />
                            <p className="text-xs text-gray-500 mt-1">Minimum 10 caractères</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nom du projet (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={formData.project_name}
                                    onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                    placeholder="Mon Portfolio"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL du projet (optionnel)
                                </label>
                                <input
                                    type="url"
                                    value={formData.project_url}
                                    onChange={(e) => setFormData({ ...formData, project_url: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent outline-none"
                                    placeholder="https://monportfolio.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full px-6 py-4 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                'Soumettre mon témoignage'
                            )}
                        </button>

                        {submitMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-4 rounded-lg flex items-center gap-3 ${
                                    submitMessage.type === 'success'
                                        ? 'bg-green-50 text-green-800 border border-green-200'
                                        : 'bg-red-50 text-red-800 border border-red-200'
                                }`}
                            >
                                {submitMessage.type === 'success' ? (
                                    <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                    <XCircle className="w-6 h-6" />
                                )}
                                <p>{submitMessage.text}</p>
                            </motion.div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

