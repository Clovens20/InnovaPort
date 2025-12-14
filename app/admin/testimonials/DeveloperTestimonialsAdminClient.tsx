'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, XCircle, Star, Trash2, ToggleLeft, ToggleRight, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface DeveloperTestimonial {
    id: string;
    client_name: string;
    client_email: string;
    client_position: string | null;
    client_company: string | null;
    client_avatar_url: string | null;
    rating: number;
    testimonial_text: string;
    approved: boolean;
    featured: boolean;
    created_at: string;
}

export function DeveloperTestimonialsAdminClient({
    initialTestimonials,
    isEnabled: initialIsEnabled,
}: {
    initialTestimonials: DeveloperTestimonial[];
    isEnabled: boolean;
}) {
    const [testimonials, setTestimonials] = useState<DeveloperTestimonial[]>(initialTestimonials);
    const [isEnabled, setIsEnabled] = useState(initialIsEnabled);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleToggleEnabled = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const newValue = !isEnabled;

            // Vérifier s'il y a des témoignages approuvés avant d'activer
            if (newValue && testimonials.filter(t => t.approved).length === 0) {
                setMessage({ 
                    type: 'error', 
                    text: 'Impossible d\'activer la section : aucun témoignage approuvé disponible.' 
                });
                setLoading(false);
                return;
            }

            // Mettre à jour les paramètres du site
            const { error } = await supabase
                .from('site_settings')
                .upsert({
                    id: 1, // ID fixe pour les paramètres globaux
                    developer_testimonials_enabled: newValue,
                }, {
                    onConflict: 'id'
                });

            if (error) throw error;

            setIsEnabled(newValue);
            setMessage({ 
                type: 'success', 
                text: `Section ${newValue ? 'activée' : 'désactivée'} avec succès` 
            });
        } catch (error: any) {
            console.error('Error updating settings:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('platform_testimonials')
                .update({ approved: true })
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.map(t => t.id === id ? { ...t, approved: true } : t));
            setMessage({ type: 'success', text: 'Témoignage approuvé' });
        } catch (error: any) {
            console.error('Error approving testimonial:', error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'approbation' });
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (id: string) => {
        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('platform_testimonials')
                .update({ approved: false })
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.map(t => t.id === id ? { ...t, approved: false } : t));
            setMessage({ type: 'success', text: 'Témoignage rejeté' });
        } catch (error: any) {
            console.error('Error rejecting testimonial:', error);
            setMessage({ type: 'error', text: 'Erreur lors du rejet' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (id: string, currentFeatured: boolean) => {
        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('platform_testimonials')
                .update({ featured: !currentFeatured })
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.map(t => t.id === id ? { ...t, featured: !currentFeatured } : t));
            setMessage({ type: 'success', text: `Témoignage ${!currentFeatured ? 'mis en vedette' : 'retiré de la vedette'}` });
        } catch (error: any) {
            console.error('Error toggling featured:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer l'avis de ${name} ?`)) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('platform_testimonials')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setTestimonials(testimonials.filter(t => t.id !== id));
            setMessage({ type: 'success', text: 'Témoignage supprimé' });
        } catch (error: any) {
            console.error('Error deleting testimonial:', error);
            setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
        } finally {
            setLoading(false);
        }
    };

    const approvedCount = testimonials.filter(t => t.approved).length;
    const pendingCount = testimonials.filter(t => !t.approved).length;

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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Avis des Développeurs</h1>
                        <p className="text-gray-600 mt-1">Gérez les témoignages des développeurs sur la plateforme</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-sm text-gray-600">Statut de la section</div>
                            <div className={`text-lg font-semibold ${isEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                                {isEnabled ? 'Activée' : 'Désactivée'}
                            </div>
                        </div>
                        <button
                            onClick={handleToggleEnabled}
                            disabled={loading || (isEnabled && approvedCount === 0)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                                isEnabled
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={isEnabled && approvedCount === 0 ? 'Activez au moins un témoignage pour activer la section' : ''}
                        >
                            {isEnabled ? (
                                <>
                                    <ToggleRight className="w-5 h-5" />
                                    Désactiver
                                </>
                            ) : (
                                <>
                                    <ToggleLeft className="w-5 h-5" />
                                    Activer
                                </>
                            )}
                        </button>
                    </div>
                </div>
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

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Total avis</div>
                    <div className="text-2xl font-bold text-gray-900">{testimonials.length}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Approuvés</div>
                    <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">En attente</div>
                    <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                </div>
            </div>

            {/* Liste des témoignages */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {testimonials.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Aucun témoignage reçu</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {testimonials.map((testimonial) => (
                            <div key={testimonial.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {testimonial.client_name.charAt(0).toUpperCase()}
                                    </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {testimonial.client_name}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {testimonial.client_email}
                                            </p>
                                            {(testimonial.client_position || testimonial.client_company) && (
                                                <p className="text-sm text-gray-500">
                                                    {[testimonial.client_position, testimonial.client_company].filter(Boolean).join(' • ')}
                                                </p>
                                            )}
                                        </div>
                                        </div>
                                        <div className="flex gap-1 mb-2">
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
                                        <p className="text-gray-700 mb-2">"{testimonial.testimonial_text}"</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(testimonial.created_at).toLocaleDateString('fr-FR', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                                            testimonial.approved
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {testimonial.approved ? 'Approuvé' : 'En attente'}
                                        </span>
                                        {testimonial.featured && (
                                            <span className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                                                Vedette
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    {!testimonial.approved && (
                                        <button
                                            onClick={() => handleApprove(testimonial.id)}
                                            disabled={loading}
                                            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approuver
                                        </button>
                                    )}
                                    {testimonial.approved && (
                                        <>
                                            <button
                                                onClick={() => handleToggleFeatured(testimonial.id, testimonial.featured)}
                                                disabled={loading}
                                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 ${
                                                    testimonial.featured
                                                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {testimonial.featured ? 'Retirer vedette' : 'Mettre en vedette'}
                                            </button>
                                            <button
                                                onClick={() => handleReject(testimonial.id)}
                                                disabled={loading}
                                                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Rejeter
                                            </button>
                                        </>
                                    )}
                                    <button
                                        onClick={() => handleDelete(testimonial.id, testimonial.client_name)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

