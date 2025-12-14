'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Star, Quote } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Testimonial {
    id: string;
    client_name: string;
    client_company: string | null;
    client_position: string | null;
    client_avatar_url: string | null;
    rating: number | null;
    testimonial_text: string;
    project_name: string | null;
}

export function TestimonialsSection() {
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            const supabase = createClient();

            // Récupérer les témoignages mis en avant et approuvés de la plateforme
            const { data, error } = await supabase
                .from('platform_testimonials')
                .select('id, client_name, client_company, client_position, client_avatar_url, rating, testimonial_text, project_name')
                .eq('approved', true)
                .eq('featured', true)
                .order('created_at', { ascending: false })
                .limit(6);

            if (error) throw error;

            setTestimonials(data || []);
        } catch (error) {
            console.error('Error loading testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return null; // Ne rien afficher pendant le chargement
    }

    if (testimonials.length === 0) {
        return null; // Ne rien afficher s'il n'y a pas de témoignages
    }

    return (
        <section className="py-24 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">
                        Ce que disent nos clients
                    </h2>
                    <p className="text-lg text-gray-600">
                        Découvrez les témoignages de freelances qui utilisent InnovaPort pour gérer leur business
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-gray-50 p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-center gap-1 mb-4">
                                {testimonial.rating && (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-4 h-4 ${
                                                    i < testimonial.rating!
                                                        ? 'text-yellow-400 fill-current'
                                                        : 'text-gray-300'
                                                }`}
                                            />
                                        ))}
                                    </>
                                )}
                            </div>
                            <Quote className="w-8 h-8 text-[#1E3A8A] opacity-20 mb-4" />
                            <p className="text-gray-700 mb-6 leading-relaxed italic">
                                "{testimonial.testimonial_text}"
                            </p>
                            <div className="flex items-center gap-3">
                                {testimonial.client_avatar_url ? (
                                    <img
                                        src={testimonial.client_avatar_url}
                                        alt={testimonial.client_name}
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-bold">
                                        {testimonial.client_name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.client_name}</p>
                                    {testimonial.client_company && (
                                        <p className="text-sm text-gray-600">{testimonial.client_company}</p>
                                    )}
                                    {testimonial.project_name && (
                                        <p className="text-xs text-gray-500 mt-1">Projet: {testimonial.project_name}</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="text-center">
                    <Link
                        href="/testimonial"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-[#1E3A8A] text-white rounded-xl font-semibold hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-900/20"
                    >
                        Laisser votre avis
                    </Link>
                </div>
            </div>
        </section>
    );
}

