"use client";

import { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

function ResetPasswordForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur a un token de réinitialisation valide
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
                // Pas de session, rediriger vers forgot-password
                router.push('/auth/forgot-password');
            }
        };
        
        checkSession();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        // Validation
        if (!password || !confirmPassword) {
            setError(t('auth.resetPassword.allFieldsRequired') || 'Veuillez remplir tous les champs');
            setIsLoading(false);
            return;
        }

        if (password.length < 8) {
            setError(t('auth.resetPassword.passwordMin') || 'Le mot de passe doit contenir au moins 8 caractères');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError(t('auth.resetPassword.passwordsDoNotMatch') || 'Les mots de passe ne correspondent pas');
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });

            if (updateError) {
                setError(updateError.message || t('auth.resetPassword.error') || 'Une erreur s\'est produite');
                setIsLoading(false);
            } else {
                setSuccess(true);
                setIsLoading(false);
                
                // Rediriger vers la page de login après 3 secondes
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            }
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || t('auth.resetPassword.error') || 'Une erreur s\'est produite');
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">{t('auth.resetPassword.title') || 'Réinitialiser votre mot de passe'}</h3>
                <p className="text-sm text-gray-600 mt-2">
                    {t('auth.resetPassword.subtitle') || 'Entrez votre nouveau mot de passe ci-dessous.'}
                </p>
            </div>

            {success ? (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">{t('auth.resetPassword.successTitle') || 'Mot de passe réinitialisé !'}</p>
                            <p className="mt-1">
                                {t('auth.resetPassword.successMessage') || 'Votre mot de passe a été réinitialisé avec succès. Vous allez être redirigé vers la page de connexion...'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/auth/login"
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        {t('auth.resetPassword.goToLogin') || 'Aller à la connexion'}
                    </Link>
                </div>
            ) : (
                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            {t('auth.resetPassword.newPassword') || 'Nouveau mot de passe'}
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
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
                        <p className="mt-1 text-xs text-gray-500">
                            {t('auth.resetPassword.passwordMin') || 'Minimum 8 caractères'}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                            {t('auth.resetPassword.confirmPassword') || 'Confirmer le mot de passe'}
                        </label>
                        <div className="mt-1 relative">
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E3A8A] disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    {t('auth.resetPassword.resetting') || 'Réinitialisation...'}
                                </>
                            ) : (
                                t('auth.resetPassword.submit') || 'Réinitialiser le mot de passe'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-[#1E3A8A] hover:text-[#1E40AF] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('auth.resetPassword.backToLogin') || 'Retour à la connexion'}
                        </Link>
                    </div>
                </form>
            )}
        </>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="mb-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
                <p className="text-sm text-gray-600">Chargement...</p>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}

