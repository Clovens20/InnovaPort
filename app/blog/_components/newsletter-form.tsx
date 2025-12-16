'use client';

import { useState } from 'react';
import { Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface NewsletterFormProps {
    language: 'fr' | 'en';
}

export function NewsletterForm({ language }: NewsletterFormProps) {
    const [email, setEmail] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    source: 'blog',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erreur lors de l\'inscription');
            }

            setSuccess(true);
            setEmail('');
            
            // Réinitialiser le message de succès après 5 secondes
            setTimeout(() => {
                setSuccess(false);
            }, 5000);
        } catch (error: any) {
            console.error('Error subscribing to newsletter:', error);
            setError(error.message || (language === 'fr' ? 'Erreur lors de l\'inscription' : 'Subscription error'));
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center gap-2 max-w-md mx-auto">
                <div className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">
                        {language === 'fr' ? 'Inscription réussie !' : 'Successfully subscribed!'}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <div className="flex-1 relative">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                    }}
                    placeholder={language === 'fr' ? 'Votre email' : 'Your email'}
                    required
                    className="w-full px-6 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white shadow-lg"
                    disabled={submitting}
                />
                {error && (
                    <div className="absolute -bottom-6 left-0 right-0 flex items-center gap-1 text-red-200 text-xs">
                        <AlertCircle className="w-3 h-3" />
                        <span>{error}</span>
                    </div>
                )}
            </div>
            <button
                type="submit"
                disabled={submitting || !email}
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {submitting ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        {language === 'fr' ? 'Inscription...' : 'Subscribing...'}
                    </>
                ) : (
                    <>
                        <Mail className="w-5 h-5" />
                        {language === 'fr' ? 'S\'abonner' : 'Subscribe'}
                    </>
                )}
            </button>
        </form>
    );
}

