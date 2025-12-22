/**
 * Page: Dashboard Quote Detail
 * 
 * Fonction: Affiche les détails d'un devis spécifique et permet de le gérer
 * Dépendances: @supabase/supabase-js, react, next/navigation
 */

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { Mail, Phone, MapPin, Calendar, Clock, Download, Star, Save, Loader2, ArrowRight, MessageSquare, DollarSign, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Quote } from '@/types';
import { ExportQuote } from '../_components/export-quote';
import RespondToQuoteModal from '../_components/respond-to-quote-modal';

// Fonction pour formater la date
function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function QuoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const supabase = createClient();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quote, setQuote] = useState<Quote | null>(null);
    const [status, setStatus] = useState<Quote['status']>('new');
    const [internalNotes, setInternalNotes] = useState('');
    const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('free');
    const [showRespondModal, setShowRespondModal] = useState(false);
    const [negotiationResponse, setNegotiationResponse] = useState('');
    const [respondingToNegotiation, setRespondingToNegotiation] = useState(false);

    useEffect(() => {
        loadQuote();
    }, [id]);

    const loadQuote = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .eq('id', id)
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (!data) {
                router.push('/dashboard/quotes');
                return;
            }

            setQuote(data);
            setStatus(data.status);
            setInternalNotes(data.internal_notes || '');

            // Charger le plan d'abonnement
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            if (profile?.subscription_tier) {
                setSubscriptionTier(profile.subscription_tier as 'free' | 'pro' | 'premium');
            }
        } catch (error) {
            console.error('Error loading quote:', error);
            router.push('/dashboard/quotes');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: Quote['status']) => {
        if (!quote) return;

        setSaving(true);
        try {
            const response = await fetch(`/api/quotes/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }

            const data = await response.json();
            setStatus(newStatus);
            setQuote({ ...quote, status: newStatus });
        } catch (error) {
            console.error('Error updating status:', error);
            alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveNotes = async () => {
        if (!quote) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('quotes')
                .update({ internal_notes: internalNotes })
                .eq('id', id);

            if (error) throw error;

            alert('Notes enregistrées avec succès');
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Erreur lors de l\'enregistrement des notes');
        } finally {
            setSaving(false);
        }
    };

    // Fonction pour extraire les négociations depuis les notes internes
    const extractNegotiations = (notes: string | null) => {
        if (!notes) return [];
        
        const negotiations: Array<{ date: string; message: string }> = [];
        const regex = /--- NÉGOCIATION CLIENT ---\nDate: ([^\n]+)\nMessage: ([^\n]+(?:\n(?!---)[^\n]+)*)/g;
        let match;
        
        while ((match = regex.exec(notes)) !== null) {
            negotiations.push({
                date: match[1],
                message: match[2].trim(),
            });
        }
        
        return negotiations;
    };

    // Fonction pour répondre à une négociation
    const handleRespondToNegotiation = async (accept: boolean) => {
        if (!quote) return;

        setRespondingToNegotiation(true);
        try {
            const response = await fetch(`/api/quotes/${id}/respond-negotiation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    accept,
                    responseMessage: negotiationResponse,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Erreur lors de l\'envoi de la réponse');
            }

            // Recharger le devis
            await loadQuote();
            setNegotiationResponse('');
            alert(accept ? 'Négociation acceptée ! Le client a été notifié.' : 'Négociation refusée. Le client a été notifié.');
        } catch (error: any) {
            console.error('Error responding to negotiation:', error);
            alert(error.message || 'Erreur lors de l\'envoi de la réponse');
        } finally {
            setRespondingToNegotiation(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement du devis...</p>
                </div>
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Devis non trouvé</p>
                <Link href="/dashboard/quotes" className="text-blue-600 hover:underline mt-4 inline-block">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Bouton retour */}
            <Link
                href="/dashboard/quotes"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Retour à la liste des devis
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Header */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Demande de {quote.name}</h1>
                                <p className="text-gray-500 mt-1">Reçue le {formatDate(quote.created_at)}</p>
                            </div>
                            <select
                                value={status}
                                onChange={(e) => handleStatusChange(e.target.value as Quote['status'])}
                                disabled={saving}
                                className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none disabled:opacity-50"
                            >
                                <option value="new">Nouvelle</option>
                                <option value="discussing">En discussion</option>
                                <option value="quoted">Devis envoyé</option>
                                <option value="accepted">Acceptée</option>
                                <option value="rejected">Refusée</option>
                            </select>
                        </div>
                    </div>

                {/* Client Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du client</h2>
                    <dl className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Nom</dt>
                            <dd className="mt-1 text-base text-gray-900">{quote.name}</dd>
                        </div>
                        {quote.company && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Entreprise</dt>
                                <dd className="mt-1 text-base text-gray-900">{quote.company}</dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />{' '}
                                <a href={`mailto:${quote.email}`} className="text-blue-600 hover:underline">
                                    {quote.email}
                                </a>
                            </dd>
                        </div>
                        {quote.phone && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                                <dd className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400" />{' '}
                                    <a href={`tel:${quote.phone}`} className="text-blue-600 hover:underline">
                                        {quote.phone}
                                    </a>
                                </dd>
                            </div>
                        )}
                        {quote.location && (
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Localisation</dt>
                                <dd className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-gray-400" /> {quote.location}
                                </dd>
                            </div>
                        )}
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Préférence de contact</dt>
                            <dd className="mt-1 text-base text-gray-900">{quote.contact_pref}</dd>
                        </div>
                    </dl>
                </div>

                {/* Project Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Détails du projet</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Type de projet</p>
                                <p className="mt-1 text-base text-gray-900 font-medium">{quote.project_type}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Budget estimé</p>
                                <p className="mt-1 text-base text-gray-900 font-medium text-primary">{quote.budget}</p>
                            </div>

                            {quote.deadline && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Délai souhaité</p>
                                    <p className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-gray-400" /> {quote.deadline}
                                    </p>
                                </div>
                            )}

                            {quote.design_pref && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Préférence de design</p>
                                    <p className="mt-1 text-base text-gray-900">{quote.design_pref}</p>
                                </div>
                            )}

                            {/* Platforms (iOS/Android) */}
                            {quote.platforms && typeof quote.platforms === 'object' && (
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Plateformes ciblées</p>
                                    <div className="mt-1 flex flex-wrap gap-2">
                                        {quote.platforms.ios && (
                                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full font-medium">
                                                iOS
                                            </span>
                                        )}
                                        {quote.platforms.android && (
                                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                                                Android
                                            </span>
                                        )}
                                        {!quote.platforms.ios && !quote.platforms.android && (
                                            <span className="text-sm text-gray-500">Non spécifié</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {quote.features && quote.features.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Fonctionnalités demandées</p>
                                <div className="flex flex-wrap gap-2">
                                    {quote.features.map((feature, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200"
                                        >
                                            {feature}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Description du projet</p>
                            <div className="p-4 bg-gray-50 rounded-lg text-gray-900 text-sm leading-relaxed border border-gray-100 whitespace-pre-wrap">
                                {quote.description}
                            </div>
                        </div>

                        {quote.has_vague_idea && (
                            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Note:</strong> Le client a indiqué avoir une idée vague du projet.
                                </p>
                            </div>
                        )}

                        {/* Consents */}
                        <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-500 mb-3">Consentements</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    {quote.consent_privacy ? (
                                        <span className="text-green-600 font-semibold">✓</span>
                                    ) : (
                                        <span className="text-red-600 font-semibold">✗</span>
                                    )}
                                    <span className="text-sm text-gray-700">
                                        Politique de confidentialité acceptée
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {quote.consent_contact ? (
                                        <span className="text-green-600 font-semibold">✓</span>
                                    ) : (
                                        <span className="text-gray-400 font-semibold">-</span>
                                    )}
                                    <span className="text-sm text-gray-700">
                                        Consentement pour être contacté
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Negotiations Section */}
                {quote.status === 'discussing' && extractNegotiations(quote.internal_notes).length > 0 && (
                    <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-lg shadow-sm border-2 border-orange-200">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <DollarSign className="w-6 h-6 text-orange-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Demande de Négociation</h2>
                                <p className="text-sm text-gray-600">Le client souhaite négocier le prix</p>
                            </div>
                        </div>

                        {extractNegotiations(quote.internal_notes).map((negotiation, index) => (
                            <div key={index} className="mb-4 p-4 bg-white rounded-lg border border-orange-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="w-4 h-4 text-orange-600" />
                                            <span className="text-xs font-medium text-orange-600">
                                                Négociation reçue le {negotiation.date}
                                            </span>
                                        </div>
                                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                {negotiation.message || 'Aucun message spécifique'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Votre réponse (optionnel)
                                    </label>
                                    <textarea
                                        rows={4}
                                        value={negotiationResponse}
                                        onChange={(e) => setNegotiationResponse(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                                        placeholder="Ex: Je peux réduire le prix à $X si nous réduisons la portée à..."
                                    />
                                    
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => handleRespondToNegotiation(true)}
                                            disabled={respondingToNegotiation}
                                            className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {respondingToNegotiation ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Envoi...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Accepter la négociation
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleRespondToNegotiation(false)}
                                            disabled={respondingToNegotiation}
                                            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {respondingToNegotiation ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Envoi...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Refuser la négociation
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Internal Notes */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes internes</h2>
                    <textarea
                        rows={4}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Ajoutez des notes privées sur cette demande..."
                    />
                    <button
                        onClick={handleSaveNotes}
                        disabled={saving}
                        className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Enregistrer les notes
                            </>
                        )}
                    </button>
                </div>
                </div>

                {/* Sidebar Actions */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                        <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setShowRespondModal(true)}
                                className="w-full px-4 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                            >
                                <MessageSquare className="w-4 h-4" />
                                Répondre au prospect
                            </button>
                            <a
                                href={`mailto:${quote.email}?subject=Re: Demande de devis - ${quote.project_type}`}
                                className="w-full px-4 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium"
                            >
                                <Mail className="w-4 h-4" />
                                Envoyer un email
                            </a>
                            {quote && (
                                <div className="space-y-2">
                                    <ExportQuote quote={quote} subscriptionTier={subscriptionTier} />
                                </div>
                            )}
                        </div>

                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-semibold text-gray-900 mb-3">Historique</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm text-gray-900">Demande reçue</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{formatDate(quote.created_at)}</p>
                                    </div>
                                </div>
                                {quote.updated_at !== quote.created_at && (
                                    <div className="flex items-start gap-3">
                                        <div className="w-2 h-2 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                                        <div>
                                            <p className="text-sm text-gray-900">Dernière mise à jour</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(quote.updated_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de réponse */}
            <RespondToQuoteModal
                isOpen={showRespondModal}
                onClose={() => setShowRespondModal(false)}
                quote={quote}
                onSuccess={() => {
                    // Recharger le devis pour mettre à jour le statut
                    loadQuote();
                }}
            />
        </div>
    );
}
