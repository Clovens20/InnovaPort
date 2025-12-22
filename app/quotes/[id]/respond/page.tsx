'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { APP_URL } from '@/lib/constants';

export default function QuoteRespondPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const quoteId = params.id as string;
    const action = searchParams.get('action');
    const email = searchParams.get('email');

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [negotiateMessage, setNegotiateMessage] = useState('');

    useEffect(() => {
        if (action && email && quoteId) {
            if (action === 'negotiate') {
                // Pour la négociation, on affiche un formulaire
                setLoading(false);
            } else {
                // Pour accepter/refuser, on envoie directement
                handleResponse(action as 'accept' | 'reject');
            }
        } else {
            setError('Paramètres manquants');
            setLoading(false);
        }
    }, [action, email, quoteId]);

    const handleResponse = async (responseAction: 'accept' | 'reject' | 'negotiate', message?: string) => {
        if (!email || !quoteId) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${APP_URL}/api/quotes/${quoteId}/respond-public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: responseAction,
                    email: email,
                    message: message || '',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi de la réponse');
            }

            setSuccess(true);
        } catch (err: any) {
            console.error('Error responding to quote:', err);
            setError(err.message || 'Erreur lors de l\'envoi de la réponse');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (error && !success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Erreur</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    if (success) {
        const actionLabels = {
            accept: { title: 'Devis Accepté !', message: 'Votre acceptation a été enregistrée. Le développeur vous contactera prochainement.', icon: CheckCircle, color: 'text-green-500' },
            reject: { title: 'Devis Refusé', message: 'Votre refus a été enregistré. Merci pour votre retour.', icon: XCircle, color: 'text-red-500' },
            negotiate: { title: 'Demande de Négociation Envoyée', message: 'Votre demande de négociation a été envoyée au développeur. Il vous contactera prochainement.', icon: DollarSign, color: 'text-orange-500' },
        };

        const result = actionLabels[action as keyof typeof actionLabels] || actionLabels.accept;
        const Icon = result.icon;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <Icon className={`w-16 h-16 ${result.color} mx-auto mb-4`} />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">{result.title}</h1>
                    <p className="text-gray-600 mb-6">{result.message}</p>
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Retour à l'accueil
                    </Link>
                </div>
            </div>
        );
    }

    // Formulaire de négociation
    if (action === 'negotiate') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <DollarSign className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Négocier le Prix</h1>
                        <p className="text-gray-600">
                            Expliquez votre proposition de prix ou vos conditions
                        </p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleResponse('negotiate', negotiateMessage);
                        }}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Votre message (optionnel)
                            </label>
                            <textarea
                                value={negotiateMessage}
                                onChange={(e) => setNegotiateMessage(e.target.value)}
                                rows={6}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Ex: Je propose un prix de $X pour ce projet car..."
                            />
                        </div>

                        <div className="flex gap-4">
                            <Link
                                href="/"
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-center"
                            >
                                Annuler
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Envoi...
                                    </>
                                ) : (
                                    <>
                                        <DollarSign className="w-5 h-5" />
                                        Envoyer la demande
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    return null;
}

