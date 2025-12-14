"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, Copy, Check, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { USERNAME_REFRESH_INTERVAL, COPY_FEEDBACK_DURATION, APP_URL } from "@/lib/constants";

interface PortfolioUrlCardProps {
    username: string;
    subscriptionTier?: string;
}

export function PortfolioUrlCard({ username, subscriptionTier = 'free' }: PortfolioUrlCardProps) {
    const [copied, setCopied] = useState(false);
    const [currentUsername, setCurrentUsername] = useState(username);
    const [currentTier, setCurrentTier] = useState(subscriptionTier);

    // Rafraîchir automatiquement le username depuis Supabase
    useEffect(() => {
        const supabase = createClient();
        
        const loadUsername = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                const { data, error } = await supabase
                    .from("profiles")
                    .select("username, subscription_tier")
                    .eq("id", user.id)
                    .maybeSingle();
                
                if (!error && data) {
                    if (data.username) {
                        setCurrentUsername(data.username);
                    }
                    if (data.subscription_tier) {
                        setCurrentTier(data.subscription_tier);
                    }
                }
            } catch (err) {
                console.error("Failed to refresh username", err);
            }
        };

        // Charger immédiatement
        loadUsername();

        // Rafraîchir périodiquement
        const interval = setInterval(loadUsername, USERNAME_REFRESH_INTERVAL);

        // Écouter les changements de visibilité de la page
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadUsername();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Configuration du realtime
        let channel: any = null;
        
        const setupRealtime = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // S'abonner aux changements en temps réel
            channel = supabase
                .channel('profile-changes')
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`
                    },
                    (payload: any) => {
                        if (payload.new.username) {
                            setCurrentUsername(payload.new.username);
                        }
                        if (payload.new.subscription_tier) {
                            setCurrentTier(payload.new.subscription_tier);
                        }
                    }
                )
                .subscribe();
        };

        setupRealtime();

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, []);

    const baseUrl = typeof window !== 'undefined' 
        ? window.location.origin 
        : APP_URL;
    const portfolioUrl = currentUsername ? `${baseUrl}/${currentUsername}` : '';

    const handleCopy = async () => {
        // Vérifier que l'URL est valide
        if (!portfolioUrl || !currentUsername) {
            console.error('Cannot copy: username is not set');
            return;
        }

        try {
            // Vérifier si l'API Clipboard est disponible
            if (!navigator.clipboard || !navigator.clipboard.writeText) {
                // Fallback pour les navigateurs qui ne supportent pas l'API Clipboard
                const textArea = document.createElement('textarea');
                textArea.value = portfolioUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    if (successful) {
                        setCopied(true);
                        setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
                    } else {
                        console.error('Failed to copy using execCommand');
                    }
                } catch (err) {
                    console.error('Error copying with execCommand:', err);
                } finally {
                    document.body.removeChild(textArea);
                }
                return;
            }

            // Utiliser l'API Clipboard moderne
            await navigator.clipboard.writeText(portfolioUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
        } catch (err) {
            console.error('Failed to copy:', err);
            // Essayer le fallback même en cas d'erreur
            try {
                const textArea = document.createElement('textarea');
                textArea.value = portfolioUrl;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                if (successful) {
                    setCopied(true);
                    setTimeout(() => setCopied(false), COPY_FEEDBACK_DURATION);
                }
                document.body.removeChild(textArea);
            } catch (fallbackErr) {
                console.error('Fallback copy also failed:', fallbackErr);
            }
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-2">Votre portfolio</h2>
            <p className="text-blue-100 mb-6">Partagez votre portfolio avec vos clients</p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-blue-200 mb-1">URL de votre portfolio</p>
                        <p className="font-mono text-sm text-white break-all">{portfolioUrl}</p>
                    </div>
                    <button
                        onClick={handleCopy}
                        disabled={!currentUsername || !portfolioUrl}
                        className="flex-shrink-0 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={currentUsername ? "Copier l'URL" : "Username non défini"}
                    >
                        {copied ? (
                            <Check className="w-5 h-5 text-green-300" />
                        ) : (
                            <Copy className="w-5 h-5" />
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Link
                    href={`/${currentUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
                >
                    <Eye className="w-5 h-5" />
                    Voir mon portfolio
                    <ExternalLink className="w-4 h-4" />
                </Link>
                
                {currentTier === 'free' && (
                    <Link
                        href="/dashboard/settings"
                        className="px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm font-medium"
                    >
                        Personnaliser l'URL
                    </Link>
                )}
            </div>

            {currentTier === 'free' && (
                <p className="text-xs text-blue-200 mt-4">
                    💡 Passez à un plan payant pour personnaliser votre URL
                </p>
            )}
        </div>
    );
}