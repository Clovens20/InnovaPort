"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
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
        // The handle_new_user trigger in Postgres (Setup in Schema) will handle profile creation
        const { error: authError, data } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    username: email.split('@')[0], // Générer un username basé sur l'email
                },
                emailRedirectTo: `${window.location.origin}/auth/login`,
            },
        });

        if (authError) {
            // Log error for debugging (in production, this would go to a logging service)
            if (process.env.NODE_ENV === 'development') {
                console.error('Registration error:', authError);
            }
            setError(authError.message || t('register.createError'));
            setIsLoading(false);
            return;
        }

        if (data.user) {
            // Si email confirmation est activé dans Supabase
            if (data.session) {
                // Session créée immédiatement (auto-confirm activé)
                setMessage(t('register.createSuccess'));
                setTimeout(() => {
                    router.push("/dashboard");
                    router.refresh();
                }, 1000);
            } else {
                // Email confirmation requise
                setMessage(t('register.createSuccessEmail'));
                setTimeout(() => {
                    router.push("/auth/login?registered=true&email=" + encodeURIComponent(email));
                }, 3000);
            }
        } else {
            setError(t('register.unexpectedError'));
            setIsLoading(false);
        }
    };

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
