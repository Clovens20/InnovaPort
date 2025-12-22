'use client';

import { useState } from 'react';
import { X, Loader2, Check, Mail, User, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface ExpertContactModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ExpertContactModal({ isOpen, onClose }: ExpertContactModalProps) {
    const { t, language } = useTranslation();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        // Validation
        if (!formData.name || !formData.email || !formData.message) {
            setSubmitError(language === 'fr' 
                ? 'Veuillez remplir tous les champs requis'
                : 'Please fill in all required fields'
            );
            return;
        }

        if (!formData.email.includes('@')) {
            setSubmitError(language === 'fr' 
                ? 'Veuillez entrer une adresse email valide'
                : 'Please enter a valid email address'
            );
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    subject: formData.subject || (language === 'fr' ? 'Demande de contact - Parler à un Expert' : 'Contact Request - Talk to an Expert'),
                    message: formData.message,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi du message');
            }

            setSubmitSuccess(true);
            setFormData({ name: '', email: '', subject: '', message: '' });

            // Fermer le modal après 3 secondes
            setTimeout(() => {
                setSubmitSuccess(false);
                onClose();
            }, 3000);
        } catch (error: any) {
            console.error('Error submitting contact form:', error);
            setSubmitError(
                error.message || 
                (language === 'fr' 
                    ? 'Erreur lors de l\'envoi du message. Veuillez réessayer.'
                    : 'Error sending message. Please try again.')
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">
                            {language === 'fr' ? 'Parler à un Expert' : 'Talk to an Expert'}
                        </h2>
                        <p className="text-blue-100 text-sm">
                            {language === 'fr' 
                                ? 'Notre équipe vous répondra dans les plus brefs délais'
                                : 'Our team will respond as soon as possible'
                            }
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        aria-label={language === 'fr' ? 'Fermer' : 'Close'}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {submitSuccess ? (
                        <div className="text-center py-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                                <Check className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                {language === 'fr' ? 'Message envoyé avec succès !' : 'Message sent successfully!'}
                            </h3>
                            <p className="text-gray-600">
                                {language === 'fr' 
                                    ? 'Nous avons bien reçu votre message et vous répondrons dans les plus brefs délais. Vous recevrez un email de confirmation.'
                                    : 'We have received your message and will respond as soon as possible. You will receive a confirmation email.'
                                }
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {submitError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {submitError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-1" />
                                    {language === 'fr' ? 'Nom complet' : 'Full Name'} *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={language === 'fr' ? 'Votre nom' : 'Your name'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Mail className="w-4 h-4 inline mr-1" />
                                    {language === 'fr' ? 'Email' : 'Email'} *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {language === 'fr' ? 'Sujet' : 'Subject'} (optionnel)
                                </label>
                                <input
                                    type="text"
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={language === 'fr' ? 'Sujet de votre message' : 'Message subject'}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MessageSquare className="w-4 h-4 inline mr-1" />
                                    {language === 'fr' ? 'Message' : 'Message'} *
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder={language === 'fr' 
                                        ? 'Décrivez votre demande ou posez vos questions...'
                                        : 'Describe your request or ask your questions...'
                                    }
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    {language === 'fr' ? 'Annuler' : 'Cancel'}
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            {language === 'fr' ? 'Envoi...' : 'Sending...'}
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            {language === 'fr' ? 'Envoyer le message' : 'Send Message'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

