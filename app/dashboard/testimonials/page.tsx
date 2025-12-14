/**
 * Page: Dashboard Testimonials Management
 * 
 * Fonction: Permet au développeur de gérer (approuver/rejeter) les témoignages
 * Dépendances: @supabase/supabase-js, react, next/navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Star, Check, X, Trash2, Eye, EyeOff } from 'lucide-react';
import { Testimonial } from '@/types';

export default function TestimonialsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

    useEffect(() => {
        loadTestimonials();
    }, []);

    const loadTestimonials = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('testimonials')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            setTestimonials(data || []);
        } catch (error) {
            console.error('Error loading testimonials:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ approved: true })
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, approved: true } : t)));
        } catch (error) {
            console.error('Error approving testimonial:', error);
            alert('Erreur lors de l\'approbation');
        }
    };

    const handleReject = async (id: string) => {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ approved: false })
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, approved: false } : t)));
        } catch (error) {
            console.error('Error rejecting testimonial:', error);
            alert('Erreur lors du rejet');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

        try {
            const { error } = await supabase
                .from('testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.filter((t) => t.id !== id));
        } catch (error) {
            console.error('Error deleting testimonial:', error);
            alert('Erreur lors de la suppression');
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        try {
            const { error } = await supabase
                .from('testimonials')
                .update({ featured: !currentFeatured })
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.map((t) => (t.id === id ? { ...t, featured: !currentFeatured } : t)));
        } catch (error) {
            console.error('Error toggling featured:', error);
            alert('Erreur lors de la modification');
        }
    };

    const filteredTestimonials = testimonials.filter((t) => {
        if (filter === 'approved') return t.approved;
        if (filter === 'pending') return !t.approved;
        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Témoignages</h1>
                <p className="text-gray-600">Gérez les témoignages de vos clients</p>
            </div>

            {/* Filtres */}
            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Tous ({testimonials.length})
                </button>
                <button
                    onClick={() => setFilter('approved')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'approved'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    Approuvés ({testimonials.filter((t) => t.approved).length})
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        filter === 'pending'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                    En attente ({testimonials.filter((t) => !t.approved).length})
                </button>
            </div>

            {/* Liste des témoignages */}
            {filteredTestimonials.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                    <p className="text-gray-600 text-lg">Aucun témoignage {filter === 'approved' ? 'approuvé' : filter === 'pending' ? 'en attente' : ''}</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {filteredTestimonials.map((testimonial) => (
                        <div
                            key={testimonial.id}
                            className={`bg-white rounded-lg shadow-sm border-2 p-6 ${
                                testimonial.approved ? 'border-green-200' : 'border-yellow-200'
                            }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-2">
                                        {testimonial.client_avatar_url ? (
                                            <img
                                                src={testimonial.client_avatar_url}
                                                alt={testimonial.client_name}
                                                className="w-12 h-12 rounded-full"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <span className="text-blue-600 font-bold text-lg">
                                                    {testimonial.client_name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-gray-900 text-lg">
                                                {testimonial.client_name}
                                            </div>
                                            {testimonial.client_position && (
                                                <div className="text-sm text-gray-600">{testimonial.client_position}</div>
                                            )}
                                            {testimonial.client_company && (
                                                <div className="text-sm text-gray-500">{testimonial.client_company}</div>
                                            )}
                                            <div className="text-sm text-gray-500 mt-1">{testimonial.client_email}</div>
                                        </div>
                                    </div>
                                    {testimonial.rating && (
                                        <div className="flex gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-5 h-5 ${
                                                        i < testimonial.rating!
                                                            ? 'text-yellow-400 fill-current'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-gray-700 italic mb-4">"{testimonial.testimonial_text}"</p>
                                    {testimonial.project_name && (
                                        <div className="text-sm text-gray-600 mb-2">
                                            <strong>Projet:</strong> {testimonial.project_name}
                                            {testimonial.project_url && (
                                                <a
                                                    href={testimonial.project_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline ml-2"
                                                >
                                                    Voir le projet →
                                                </a>
                                            )}
                                        </div>
                                    )}
                                    <div className="text-xs text-gray-500">
                                        Reçu le {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                        })}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 ml-4">
                                    {!testimonial.approved ? (
                                        <button
                                            onClick={() => handleApprove(testimonial.id)}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                            title="Approuver"
                                        >
                                            <Check className="w-4 h-4" />
                                            Approuver
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleReject(testimonial.id)}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2"
                                            title="Désapprouver"
                                        >
                                            <X className="w-4 h-4" />
                                            Désapprouver
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                                        className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                            testimonial.featured
                                                ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                        title={testimonial.featured ? 'Retirer de la mise en avant' : 'Mettre en avant'}
                                    >
                                        {testimonial.featured ? (
                                            <Eye className="w-4 h-4" />
                                        ) : (
                                            <EyeOff className="w-4 h-4" />
                                        )}
                                        {testimonial.featured ? 'Mis en avant' : 'Mettre en avant'}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(testimonial.id)}
                                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

