'use client';

import { useState, useEffect } from 'react';
import { Star, MessageSquare, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface DeveloperTestimonial {
    id: string;
    developer_name: string;
    developer_email: string;
    developer_role: string | null;
    developer_company: string | null;
    developer_avatar_url: string | null;
    rating: number;
    testimonial_text: string;
    approved: boolean;
    featured: boolean;
    created_at: string;
}

export function DeveloperTestimonialsSection() {
    const [testimonials, setTestimonials] = useState<DeveloperTestimonial[]>([]);
    const [isEnabled, setIsEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    
    const [formData, setFormData] = useState({
        developer_name: '',
        developer_email: '',
        developer_role: '',
        developer_company: '',
        rating: 5,
        testimonial_text: '',
    });

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            const supabase = createClient();
            
            // Vérifier si la section est activée
            const { data: settings } = await supabase
                .from('site_settings')
                .select('developer_testimonials_enabled')
                .single();

            setIsEnabled(settings?.developer_testimonials_enabled || false);

            if (settings?.developer_testimonials_enabled) {
                // Charger les témoignages approuvés
            const { data } = await supabase
                .from('platform_testimonials')
                .select('*')
                .eq('approved', true)
                .order('featured', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(6);

                // Mapper les données pour correspondre à l'interface
                const mappedData = (data || []).map((t: any) => ({
                    id: t.id,
                    developer_name: t.client_name,
                    developer_email: t.client_email,
                    developer_role: t.client_position,
                    developer_company: t.client_company,
                    developer_avatar_url: t.client_avatar_url,
                    rating: t.rating,
                    testimonial_text: t.testimonial_text,
                    approved: t.approved,
                    featured: t.featured,
                    created_at: t.created_at,
                }));

                setTestimonials(mappedData);
            }
        } catch (error) {
            console.error('Error loading testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const supabase = createClient();
            
            const { error } = await supabase
                .from('platform_testimonials')
                .insert({
                    client_name: formData.developer_name,
                    client_email: formData.developer_email,
                    client_position: formData.developer_role || null,
                    client_company: formData.developer_company || null,
                    rating: formData.rating,
                    testimonial_text: formData.testimonial_text,
                    approved: false, // Nécessite l'approbation admin
                    featured: false,
                });

            if (error) throw error;

            setSubmitted(true);
            setFormData({
                developer_name: '',
                developer_email: '',
                developer_role: '',
                developer_company: '',
                rating: 5,
                testimonial_text: '',
            });

            setTimeout(() => setSubmitted(false), 5000);
        } catch (error: any) {
            console.error('Error submitting testimonial:', error);
            alert('Erreur lors de l\'envoi de votre avis. Veuillez réessayer.');
        } finally {
            setSubmitting(false);
        }
    };

    const getDicebearAvatar = (name: string) => {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
    };

    if (loading) {
        return null;
    }

    if (!isEnabled) {
        return null;
    }

    return (
        <section id="testimonials" className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Ce que disent nos développeurs
                    </h2>
                    <p className="text-lg text-gray-600">
                        Découvrez les retours de ceux qui utilisent InnovaPort au quotidien
                    </p>
                </div>

                {/* Liste des témoignages */}
                {testimonials.length > 0 && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {testimonials.map((testimonial) => (
                            <div
                                key={testimonial.id}
                                className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={testimonial.developer_avatar_url || getDicebearAvatar(testimonial.developer_name)}
                                        alt={testimonial.developer_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-900">
                                            {testimonial.developer_name}
                                        </h4>
                                        {(testimonial.developer_role || testimonial.developer_company) && (
                                            <p className="text-sm text-gray-500">
                                                {[testimonial.developer_role, testimonial.developer_company].filter(Boolean).join(' • ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${
                                                i < testimonial.rating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-700 leading-relaxed">
                                    "{testimonial.testimonial_text}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Formulaire pour laisser un avis */}
                <div className="max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                    <div className="text-center mb-6">
                        <MessageSquare className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            Partagez votre expérience
                        </h3>
                        <p className="text-gray-600">
                            Votre avis nous aide à améliorer InnovaPort
                        </p>
                    </div>

                    {submitted ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                            <p className="text-green-800 font-semibold">
                                Merci pour votre avis ! Il sera publié après modération.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nom *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.developer_name}
                                        onChange={(e) => setFormData({ ...formData, developer_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Votre nom"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.developer_email}
                                        onChange={(e) => setFormData({ ...formData, developer_email: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="votre@email.com"
                                    />
                                </div>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Rôle / Fonction
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.developer_role}
                                        onChange={(e) => setFormData({ ...formData, developer_role: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Développeur Full-Stack"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Entreprise
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.developer_company}
                                        onChange={(e) => setFormData({ ...formData, developer_company: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Nom de l'entreprise"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Note *
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, rating })}
                                            className={`p-2 rounded-lg transition-colors ${
                                                formData.rating >= rating
                                                    ? 'bg-yellow-100 text-yellow-600'
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Star className={`w-6 h-6 ${formData.rating >= rating ? 'fill-current' : ''}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Votre avis *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.testimonial_text}
                                    onChange={(e) => setFormData({ ...formData, testimonial_text: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Partagez votre expérience avec InnovaPort..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Envoi en cours...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        Envoyer mon avis
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </section>
    );
}

