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
                emailRedirectTo: `${window.location.origin}/auth/callback`,
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
            <div className="max-w-md mx-auto">
                {/* Icône de succès */}
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                </div>

                {/* Titre */}
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
                    {t('register.successTitle') || 'Inscription réussie ! 🎉'}
                </h2>

                {/* Message principal */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 mb-1">
                                {t('register.emailSent') || 'Email de confirmation envoyé'}
                            </p>
                            <p className="text-sm text-blue-700">
                                {t('register.emailSentDescription') || 'Nous avons envoyé un email de confirmation à'}{' '}
                                <strong>{registeredEmail}</strong>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Avertissement SPAM */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-medium text-amber-900 mb-2">
                                ⚠️ {t('register.checkSpam') || 'Vérifiez vos courriers indésirables'}
                            </p>
                            <p className="text-sm text-amber-700 mb-2">
                                {t('register.checkSpamDescription') || 'Si vous ne recevez pas l\'email dans les prochaines minutes, consultez votre dossier SPAM ou Courrier indésirable.'}
                            </p>
                            <p className="text-xs text-amber-600">
                                💡 {t('register.addToContacts') || 'Conseil : Ajoutez'}{' '}
                                <strong>noreply@mail.app.supabase.io</strong>{' '}
                                {t('register.addToContactsEnd') || 'à vos contacts pour éviter ce problème à l\'avenir.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                        {t('register.nextSteps') || 'Prochaines étapes :'}
                    </h3>
                    <ol className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-blue-600">1.</span>
                            <span>{t('register.step1') || 'Ouvrez l\'email de confirmation'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-blue-600">2.</span>
                            <span>{t('register.step2') || 'Cliquez sur le lien de confirmation'}</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-semibold text-blue-600">3.</span>
                            <span>{t('register.step3') || 'Vous serez redirigé vers votre tableau de bord'}</span>
                        </li>
                    </ol>
                </div>

                {/* Message de succès temporaire */}
                {message && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm mb-4">
                        {message}
                    </div>
                )}

                {/* Bouton de retour */}
                <Link
                    href="/auth/login"
                    className="block w-full py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    {t('register.backToLogin') || 'Retour à la connexion'}
                </Link>

                {/* Lien de renvoi */}
                <button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full mt-3 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <span className="flex items-center justify-center">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            {t('register.resending') || 'Envoi en cours...'}
                        </span>
                    ) : (
                        t('register.resendEmail') || 'Renvoyer l\'email de confirmation'
                    )}
                </button>
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
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder={t('contact.placeholders.name')}
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
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder={t('contact.placeholders.email')}
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
                            className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
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