"use client";

import React, { useState, Suspense, useRef, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import ReCAPTCHA from 'react-google-recaptcha';
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

function LoginForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const recaptchaRef = useRef<ReCAPTCHA>(null);

    // Vérifier s'il y a une erreur dans l'URL (par exemple depuis le callback)
    useEffect(() => {
        const errorParam = searchParams.get('error');
        if (errorParam === 'invalid_confirmation_link') {
            setError(t('auth.login.invalidConfirmationLink') || 'Lien de confirmation invalide ou expiré. Veuillez réessayer.');
        }
    }, [searchParams, t]);

    // OPTIMISATION: Précharger le client Supabase et le recaptchaSiteKey
    const supabase = useMemo(() => createClient(), []);
    const recaptchaSiteKey = useMemo(
        () => typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY : undefined,
        []
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        // OPTIMISATION: Vérifier le CAPTCHA AVANT l'authentification pour éviter une requête inutile
        // Vérification du CAPTCHA (seulement si configuré)
        if (recaptchaSiteKey) {
            if (!captchaToken) {
                setError(t('auth.login.captchaRequired') || t('register.captchaRequired') || 'Veuillez compléter le CAPTCHA');
                setIsLoading(false);
                return;
            }

            // Vérifier le CAPTCHA d'abord (plus rapide que l'auth)
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
                    setError(t('auth.login.captchaInvalid') || t('register.captchaInvalid') || 'CAPTCHA invalide. Veuillez réessayer.');
                    recaptchaRef.current?.reset();
                    setCaptchaToken(null);
                    setIsLoading(false);
                    return;
                }
            } catch (captchaError) {
                setError(t('auth.login.captchaError') || 'Erreur lors de la vérification du CAPTCHA');
                setIsLoading(false);
                return;
            }
        }

        // OPTIMISATION: Authentification avec le client préchargé (après vérification CAPTCHA)
        const authResult = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        const { error: authError, data } = authResult!;

        if (authError) {
            setError(authError.message || t('auth.login.error') || 'Erreur lors de la connexion');
            setIsLoading(false);
            recaptchaRef.current?.reset();
            setCaptchaToken(null);
            return;
        }

        // OPTIMISATION: Récupérer le rôle depuis les métadonnées utilisateur si disponible
        // Si non disponible, utiliser une valeur par défaut et laisser la page de destination vérifier
        const userRole = data!.user.user_metadata?.role;
        const isAdmin = userRole === 'admin';

        // OPTIMISATION: Simplification de la logique de redirection
        const redirectTo = searchParams.get('redirectTo');
        
        let targetPath = '/dashboard'; // Par défaut pour les développeurs
        
        if (isAdmin) {
            // Pour les admins, vérifier si redirectTo est valide pour admin
            if (redirectTo && (redirectTo === '/admin' || redirectTo.startsWith('/admin/'))) {
                targetPath = redirectTo;
            } else {
                targetPath = '/admin';
            }
        } else {
            // Pour les développeurs, ignorer les redirectTo vers /admin
            if (redirectTo && !redirectTo.startsWith('/admin')) {
                targetPath = redirectTo;
            }
        }

        // OPTIMISATION: Redirection immédiate sans prefetch pour réduire la latence
        // Le prefetch peut ralentir la redirection, on laisse Next.js gérer le chargement
        router.replace(targetPath);
    };

    return (
        <>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">{t('auth.login.title')}</h3>
                <p className="text-sm text-gray-600 mt-2">{t('auth.login.subtitle')}</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        {t('auth.login.email')}
                    </label>
                    <div className="mt-1">
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder="votre@email.com"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        {t('auth.login.password')}
                    </label>
                    <div className="mt-1 relative">
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:text-gray-900 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                            placeholder="••••••••"
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
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            name="remember-me"
                            type="checkbox"
                            className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                            {t('auth.login.remember')}
                        </label>
                    </div>

                    <div className="text-sm">
                        <Link href="/auth/forgot-password" className="font-medium text-[#1E3A8A] hover:text-[#1E40AF]">
                            {t('auth.login.forgotPassword')}
                        </Link>
                    </div>
                </div>

                {/* CAPTCHA - Seulement si configuré */}
                {recaptchaSiteKey && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            {t('auth.login.captchaLabel') || t('register.captchaLabel') || 'Vérification de sécurité'} *
                        </label>
                        <ReCAPTCHA
                            ref={recaptchaRef}
                            sitekey={recaptchaSiteKey}
                            onChange={(token) => setCaptchaToken(token)}
                            onExpired={() => setCaptchaToken(null)}
                            onError={() => {
                                setCaptchaToken(null);
                                setError(t('auth.login.captchaError') || t('register.captchaError') || 'Erreur lors du chargement du CAPTCHA');
                            }}
                        />
                    </div>
                )}

                <div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {t('auth.login.submitting') || 'Connexion en cours...'}
                            </>
                        ) : (
                            t('auth.login.submit') || 'Se connecter'
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
                        <span className="px-2 bg-white text-gray-500">
                            {t('auth.login.noAccount') || 'Pas encore de compte ?'}
                        </span>
                    </div>
                </div>

                <div className="mt-6">
                    <Link
                        href="/auth/register"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        {t('auth.login.createAccount') || 'Créer un compte'}
                    </Link>
                </div>
            </div>
        </>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="mb-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
                <p className="text-sm text-gray-600">Chargement...</p>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
