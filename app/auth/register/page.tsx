"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Mail, AlertCircle, CheckCircle } from "lucide-react";
import ReCAPTCHA from 'react-google-recaptcha';
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function RegisterPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [registeredEmail, setRegisteredEmail] = useState<string>("");
    const [registeredName, setRegisteredName] = useState<string>("");
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setMessage(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const name = formData.get("name") as string;

        // Validation du mot de passe
        if (password.length < 8) {
            setError(t('register.passwordMin'));
            setIsLoading(false);
            return;
        }

        // Vérification du CAPTCHA (seulement si configuré)
        const recaptchaSiteKey = typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY : undefined;
        if (recaptchaSiteKey) {
            if (!captchaToken) {
                setError(t('register.captchaRequired') || t('contact.form.captchaRequired') || 'Veuillez compléter le CAPTCHA');
                setIsLoading(false);
                return;
            }

            // Vérifier le CAPTCHA côté serveur
            try {
                const captchaResponse = await fetch('/api/verify-captcha', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token: captchaToken }),
                });

                const captchaData = await captchaResponse.json();

                if (!captchaData.success) {
                    setError(t('register.captchaInvalid') || t('contact.form.captchaInvalid') || 'CAPTCHA invalide. Veuillez réessayer.');
                    recaptchaRef.current?.reset();
                    setCaptchaToken(null);
                    setIsLoading(false);
                    return;
                }
            } catch (captchaError) {
                console.error('CAPTCHA verification error:', captchaError);
                setError(t('register.captchaError') || t('contact.form.captchaError') || 'Erreur lors de la vérification du CAPTCHA. Veuillez réessayer.');
                setIsLoading(false);
                return;
            }
        }

        const supabase = createClient();

        // Sign up with Supabase Auth
        const { error: authError, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    username: email.split('@')[0],
                },
                emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
            },
        });

        if (authError) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Registration error:', authError);
            }
            setError(authError.message || t('register.createError'));
            setIsLoading(false);
            return;
        }

        if (data.user) {
            setRegisteredEmail(email);
            setRegisteredName(name);
            
            if (data.session) {
                // Session créée immédiatement (auto-confirm activé)
                setMessage(t('register.createSuccess'));
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 1000);
            } else {
                // Email confirmation requise - Afficher le message de succès
                setShowSuccessMessage(true);
                setIsLoading(false);
            }
        } else {
            setError(t('register.unexpectedError'));
            setIsLoading(false);
        }
    };

    const handleResendEmail = async () => {
        setIsLoading(true);
        const supabase = createClient();
        
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: registeredEmail,
        });

        if (error) {
            setError('Erreur lors du renvoi de l\'email. Veuillez réessayer.');
        } else {
            setMessage('Email renvoyé ! Vérifiez votre boîte de réception et vos courriers indésirables.');
        }
        setIsLoading(false);
    };

    // Message de succès après inscription
    if (showSuccessMessage) {
        return (
            <div className="max-w-2xl mx-auto">
                {/* Carte principale avec design professionnel */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header avec gradient Innovaport */}
                    <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] px-8 py-10 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/30">
                                <CheckCircle className="w-12 h-12 text-white" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                            {t('register.successTitle') || 'Bienvenue sur InnovaPort ! 🎉'}
                        </h2>
                        {registeredName && (
                            <p className="text-lg text-white/90 font-medium">
                                {registeredName}
                            </p>
                        )}
                    </div>

                    {/* Contenu principal */}
                    <div className="px-8 py-8 space-y-6">
                        {/* Message de confirmation email */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                        <Mail className="w-6 h-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {t('register.emailSent') || 'Email de confirmation envoyé'}
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {t('register.emailSentDescription') || 'Nous avons envoyé un email de confirmation à l\'adresse'}{' '}
                                        <strong className="text-[#1E3A8A] font-semibold">{registeredEmail}</strong>
                                        {t('register.emailSentDescriptionEnd') || '. Veuillez vérifier votre boîte de réception pour activer votre compte.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Instructions étape par étape */}
                        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 bg-[#1E3A8A] text-white rounded-lg flex items-center justify-center text-sm font-bold">!</span>
                                {t('register.nextSteps') || 'Comment activer votre compte :'}
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        1
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-gray-900 font-medium mb-1">
                                            {t('register.step1') || 'Ouvrez votre boîte de réception'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {t('register.step1Description') || 'Consultez l\'email que nous venons de vous envoyer à l\'adresse indiquée ci-dessus.'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        2
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-gray-900 font-medium mb-1">
                                            {t('register.step2') || 'Cliquez sur le bouton de confirmation'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {t('register.step2Description') || 'Dans l\'email, cliquez sur le bouton "Confirmer mon email" ou sur le lien de confirmation pour activer votre compte.'}
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold text-sm">
                                        3
                                    </div>
                                    <div className="flex-1 pt-1">
                                        <p className="text-gray-900 font-medium mb-1">
                                            {t('register.step3') || 'Accédez à votre tableau de bord'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {t('register.step3Description') || 'Une fois votre email confirmé, vous serez automatiquement redirigé vers votre tableau de bord InnovaPort pour commencer à créer votre portfolio professionnel.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Avertissement SPAM */}
                        <div className="bg-amber-50 border-l-4 border-amber-400 rounded-lg p-5">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-amber-900 mb-2">
                                        {t('register.checkSpam') || 'Vous ne voyez pas l\'email ?'}
                                    </p>
                                    <p className="text-sm text-amber-800 leading-relaxed mb-2">
                                        {t('register.checkSpamDescription') || 'Si l\'email n\'apparaît pas dans votre boîte de réception dans les prochaines minutes, vérifiez votre dossier de courrier indésirable (SPAM) ou vos filtres email.'}
                                    </p>
                                    <p className="text-xs text-amber-700 bg-amber-100 rounded px-3 py-2 mt-3">
                                        💡 <strong>Astuce :</strong> {t('register.addToContacts') || 'Ajoutez'}{' '}
                                        <strong>noreply@mail.app.supabase.io</strong>{' '}
                                        {t('register.addToContactsEnd') || 'à vos contacts pour recevoir tous nos emails sans problème.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Message de succès temporaire */}
                        {message && (
                            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    {message}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4">
                            <Link
                                href="/auth/login"
                                className="flex-1 py-3 px-6 bg-gray-100 text-gray-700 text-center rounded-lg font-semibold hover:bg-gray-200 transition-colors border border-gray-300"
                            >
                                {t('register.backToLogin') || 'Retour à la connexion'}
                            </Link>
                            
                            <button
                                onClick={handleResendEmail}
                                disabled={isLoading}
                                className="flex-1 py-3 px-6 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-[#1E40AF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>{t('register.resending') || 'Envoi en cours...'}</span>
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        <span>{t('register.resendEmail') || 'Renvoyer l\'email'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer avec informations supplémentaires */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        {t('register.needHelp') || 'Besoin d\'aide ?'}{' '}
                        <Link href="/support" className="text-[#1E3A8A] hover:text-[#1E40AF] font-medium">
                            {t('register.contactSupport') || 'Contactez notre support'}
                        </Link>
                    </p>
                </div>
            </div>
        );
    }

    // Formulaire d'inscription normal
    return (
        <>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">{t('auth.register.title')}</h3>
                <p className="text-sm text-gray-600 mt-2">{t('register.subtitle')}</p>
            </div>

            {message && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm mb-6">
                    {message}
                </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        {t('auth.register.name')}
                    </label>
                    <div className="mt-1">
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder={t('contact.placeholders.name') || 'Votre nom complet'}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        {t('auth.register.email')}
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder={t('contact.placeholders.email') || 'votre@email.com'}
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {t('auth.register.password')}
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            minLength={8}
                            className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder={t('register.passwordPlaceholder')}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                            tabIndex={-1}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5" />
                            ) : (
                                <Eye className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">{t('register.passwordMinLabel')}</p>
                </div>

                {/* CAPTCHA - Seulement si configuré */}
                {typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t('register.captchaLabel') || t('contact.form.captchaLabel') || 'Vérification de sécurité'} *
                        </label>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                            onChange={(token) => setCaptchaToken(token)}
                            onExpired={() => setCaptchaToken(null)}
                            onError={() => {
                                setCaptchaToken(null);
                                setError(t('register.captchaError') || t('contact.form.captchaError') || 'Erreur lors du chargement du CAPTCHA');
                            }}
                        />
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#10B981] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> {t('auth.register.submitting')}</>
                        ) : (
                            t('register.startFree')
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-gray-500">{t('register.alreadyRegistered')}</span>
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href="/auth/login"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        {t('auth.register.login')}
                    </Link>
                </div>
            </div>
        </>
    );
}