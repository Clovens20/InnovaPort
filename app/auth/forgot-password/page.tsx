"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

function ForgotPasswordForm() {
    const { t } = useTranslation();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccess(false);

        if (!email) {
            setError(t('auth.forgotPassword.emailRequired') || 'Veuillez entrer votre adresse email');
            setIsLoading(false);
            return;
        }

        try {
            const supabase = createClient();
            
            // Détecter l'URL de base pour le lien de réinitialisation
            const protocol = window.location.protocol;
            const host = window.location.host;
            const baseUrl = `${protocol}//${host}`;
            const redirectUrl = `${baseUrl}/auth/reset-password`;

            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: redirectUrl,
            });

            if (resetError) {
                setError(resetError.message || t('auth.forgotPassword.error') || 'Une erreur s\'est produite');
                setIsLoading(false);
            } else {
                setSuccess(true);
                setIsLoading(false);
            }
        } catch (err: any) {
            console.error('Password reset error:', err);
            setError(err.message || t('auth.forgotPassword.error') || 'Une erreur s\'est produite');
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="mb-6 text-center">
                <h3 className="text-xl font-bold text-gray-900">{t('auth.forgotPassword.title') || 'Mot de passe oublié ?'}</h3>
                <p className="text-sm text-gray-600 mt-2">
                    {t('auth.forgotPassword.subtitle') || 'Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.'}
                </p>
            </div>

            {success ? (
                <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded text-sm flex items-start gap-3">
                        <Mail className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-semibold">{t('auth.forgotPassword.successTitle') || 'Email envoyé !'}</p>
                            <p className="mt-1">
                                {t('auth.forgotPassword.successMessage') || `Nous avons envoyé un lien de réinitialisation à ${email}. Vérifiez votre boîte de réception.`}
                            </p>
                        </div>
                    </div>
                    <Link
                        href="/auth/login"
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('auth.forgotPassword.backToLogin') || 'Retour à la connexion'}
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
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            {t('auth.login.email') || 'Adresse email'}
                        </label>
                        <div className="mt-1">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#1E3A8A] focus:border-[#1E3A8A] sm:text-sm transition-colors"
                                placeholder="votre@email.com"
                            />
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
                                    {t('auth.forgotPassword.sending') || 'Envoi en cours...'}
                                </>
                            ) : (
                                t('auth.forgotPassword.sendResetLink') || 'Envoyer le lien de réinitialisation'
                            )}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-[#1E3A8A] hover:text-[#1E40AF] flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            {t('auth.forgotPassword.backToLogin') || 'Retour à la connexion'}
                        </Link>
                    </div>
                </form>
            )}
        </>
    );
}

export default function ForgotPasswordPage() {
    return (
        <Suspense fallback={
            <div className="mb-6 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-4 text-[#1E3A8A]" />
                <p className="text-sm text-gray-600">Chargement...</p>
            </div>
        }>
            <ForgotPasswordForm />
        </Suspense>
    );
}

