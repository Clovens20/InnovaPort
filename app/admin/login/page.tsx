/**
 * Page: /admin/login
 * 
 * Fonction: Page de connexion dédiée aux administrateurs
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff, Shield } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function AdminLoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        const supabase = createClient();
        const { error: authError, data } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setIsLoading(false);
        } else {
            // Vérifier le rôle de l'utilisateur
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            if (profile?.role === 'admin') {
                // Si admin, rediriger vers /admin
                router.push("/admin");
                // OPTIMISATION: Ne pas appeler router.refresh() car router.push() déclenche déjà une navigation
            } else {
                // Si pas admin, rediriger vers dashboard
                setError("Accès refusé. Seuls les administrateurs peuvent accéder à cette interface.");
                setIsLoading(false);
                // Déconnecter l'utilisateur car il n'est pas admin
                await supabase.auth.signOut();
                router.push("/auth/login");
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Connexion Admin</h2>
                    <p className="text-sm text-gray-600 mt-2">Accédez à l'interface d'administration</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                            placeholder="admin@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Mot de passe
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                required
                                className="appearance-none block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Connexion...</>
                            ) : (
                                'Se connecter'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 text-center">
                    <Link
                        href="/"
                        className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                    >
                        ← Retour à l'accueil
                    </Link>
                </div>
            </div>
        </div>
    );
}

