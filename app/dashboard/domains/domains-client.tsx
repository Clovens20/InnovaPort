'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Globe, Plus, Trash2, CheckCircle2, XCircle, Clock, AlertCircle, ExternalLink, Copy, Check, HelpCircle, Loader2 } from 'lucide-react';
import { hasFeature, subscriptionLimits, canAddCustomDomain } from '@/lib/subscription-limits';
import { useTranslation } from '@/lib/i18n/useTranslation';
import Link from 'next/link';

interface CustomDomain {
    id: string;
    domain: string;
    subdomain: string | null;
    slug: string | null;
    is_primary: boolean;
    ssl_status: 'pending' | 'active' | 'failed' | 'expired';
    verification_token: string | null;
    verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export function DomainsClient() {
    const { t } = useTranslation();
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    
    const [loading, setLoading] = useState(true);
    const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'pro' | 'premium'>('free');
    const [domains, setDomains] = useState<CustomDomain[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [copied, setCopied] = useState<string | null>(null);
    
    // Formulaire
    const [formData, setFormData] = useState({
        domain: '',
        subdomain: '',
        slug: '',
        is_primary: false,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Détection du provider et disponibilité
    const [detectingProvider, setDetectingProvider] = useState(false);
    const [detectedProvider, setDetectedProvider] = useState<{
        provider: string;
        url: string | null;
        dnsUrl: string | null;
        available: boolean;
        isActive: boolean;
        ipAddress?: string;
        cname?: string;
    } | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Charger le plan
            const { data: profile } = await supabase
                .from('profiles')
                .select('subscription_tier')
                .eq('id', user.id)
                .single();

            if (profile?.subscription_tier) {
                setSubscriptionTier(profile.subscription_tier as 'free' | 'pro' | 'premium');
            }

            // Vérifier si l'utilisateur a accès aux domaines personnalisés
            if (!hasFeature(profile?.subscription_tier || 'free', 'customDomain')) {
                setLoading(false);
                return;
            }

            // Charger les domaines
            const response = await fetch('/api/domains');
            if (response.ok) {
                const data = await response.json();
                setDomains(data.domains || []);
            } else {
                console.error('Error loading domains');
            }
        } catch (err) {
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    }, [supabase, router]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Détection automatique du provider avec debounce
    useEffect(() => {
        if (!formData.domain || formData.domain.length < 3) {
            setDetectedProvider(null);
            return;
        }

        // Debounce réduit à 800ms pour une détection plus rapide
        const timeoutId = setTimeout(async () => {
            const domain = formData.domain.trim().toLowerCase();
            // Validation du format du domaine (plus permissive)
            const domainRegex = /^([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i;
            if (!domainRegex.test(domain)) {
                setDetectedProvider(null);
                return;
            }

            setDetectingProvider(true);
            try {
                const response = await fetch('/api/domains/detect', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ domain }),
                });

                const data = await response.json();

                if (response.ok && data.success) {
                    // Si un provider est détecté
                    if (data.provider && data.dnsUrl) {
                        setDetectedProvider({
                            provider: data.provider,
                            url: data.url || data.dnsUrl,
                            dnsUrl: data.dnsUrl,
                            available: data.availability?.available ?? true,
                            isActive: data.availability?.isActive ?? false,
                            ipAddress: data.availability?.ipAddress,
                            cname: data.availability?.cname,
                        });
                    } else {
                        // Même si le provider n'est pas détecté, on affiche les infos de disponibilité
                        if (data.availability) {
                            setDetectedProvider({
                                provider: 'Non détecté',
                                url: null,
                                dnsUrl: null,
                                available: data.availability.available ?? true,
                                isActive: data.availability.isActive ?? false,
                                ipAddress: data.availability.ipAddress,
                                cname: data.availability.cname,
                            });
                        } else {
                            setDetectedProvider(null);
                        }
                    }
                } else {
                    // En cas d'erreur, on essaie quand même de vérifier la disponibilité
                    console.warn('Provider detection failed, but domain format is valid:', domain);
                    setDetectedProvider(null);
                }
            } catch (err) {
                console.error('Error detecting provider:', err);
                setDetectedProvider(null);
            } finally {
                setDetectingProvider(false);
            }
        }, 800); // Debounce réduit à 800ms

        return () => clearTimeout(timeoutId);
    }, [formData.domain]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccess(null);

        // Vérifier si le domaine est disponible avant de soumettre
        if (detectedProvider && (!detectedProvider.available || detectedProvider.isActive)) {
            setError('Ce domaine est déjà actif et déployé. Veuillez utiliser un autre domaine ou modifier la configuration DNS.');
            setSubmitting(false);
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const payload: any = {
                domain: formData.domain.trim(),
                is_primary: formData.is_primary,
            };

            if (formData.subdomain.trim()) {
                payload.subdomain = formData.subdomain.trim();
            }

            if (formData.slug.trim()) {
                payload.slug = formData.slug.trim();
            }

            const response = await fetch('/api/domains', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Erreur lors de la création du domaine');
                return;
            }

            setSuccess('Domaine créé avec succès ! Configurez les enregistrements DNS pour l\'activer.');
            setFormData({ domain: '', subdomain: '', slug: '', is_primary: false });
            setShowAddForm(false);
            await loadData();
        } catch (err: any) {
            setError(err.message || 'Erreur lors de la création du domaine');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (domainId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) {
            return;
        }

        try {
            const response = await fetch(`/api/domains/${domainId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                alert(data.error || 'Erreur lors de la suppression');
                return;
            }

            await loadData();
        } catch (err) {
            console.error('Error deleting domain:', err);
            alert('Erreur lors de la suppression du domaine');
        }
    };

    const handleVerify = async (domainId: string) => {
        try {
            const response = await fetch('/api/domains/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domainId }),
            });

            const data = await response.json();
            
            if (response.ok && data.verified) {
                alert('Domaine vérifié avec succès !');
                await loadData();
            } else {
                alert(data.message || 'La vérification a échoué. Vérifiez vos enregistrements DNS.');
            }
        } catch (err) {
            console.error('Error verifying domain:', err);
            alert('Erreur lors de la vérification');
        }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(null), 2000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'failed':
            case 'expired':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'pending':
            default:
                return <Clock className="w-5 h-5 text-yellow-500" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Actif';
            case 'failed':
                return 'Échec';
            case 'expired':
                return 'Expiré';
            case 'pending':
            default:
                return 'En attente';
        }
    };

    const limits = subscriptionLimits[subscriptionTier];
    const canAdd = canAddCustomDomain(subscriptionTier, domains.filter(d => !d.subdomain).length);
    const hasCustomSlug = hasFeature(subscriptionTier, 'customSlug');
    const hasMultiDomain = hasFeature(subscriptionTier, 'multiDomainDashboard');
    const canAddSubdomain = limits.maxSubdomains === null || limits.maxSubdomains > 0;

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (!hasFeature(subscriptionTier, 'customDomain')) {
        return (
            <div className="max-w-6xl mx-auto py-8">
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <Globe className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Domaines personnalisés
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Les domaines personnalisés sont disponibles avec les plans Pro et Premium.
                    </p>
                    <Link
                        href="/dashboard/billing"
                        className="inline-flex items-center px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] transition-colors"
                    >
                        Voir les plans
                    </Link>
                </div>
            </div>
        );
    }

    const fullDomain = (domain: CustomDomain) => {
        return domain.subdomain 
            ? `${domain.subdomain}.${domain.domain}`
            : domain.domain;
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Domaines personnalisés
                        </h1>
                        <p className="text-gray-600">
                            Gérez vos domaines personnalisés et sous-domaines pour votre portfolio
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        {canAdd && !showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="inline-flex items-center px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] transition-colors shadow-sm font-medium"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Ajouter un domaine
                            </button>
                        )}
                        <Link
                            href="/dashboard/domains/help"
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            <HelpCircle className="w-5 h-5 mr-2" />
                            Guide DNS
                        </Link>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
                    {success}
                </div>
            )}

            {/* Limites du plan */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm text-blue-900">
                            <strong>Votre plan {subscriptionTier.toUpperCase()}</strong> : 
                            {limits.maxCustomDomains === null 
                                ? ' Domaines illimités' 
                                : ` ${limits.maxCustomDomains} domaine${limits.maxCustomDomains > 1 ? 's' : ''} personnalisé${limits.maxCustomDomains > 1 ? 's' : ''}`
                            }
                            {canAddSubdomain && (
                                <span>
                                    {limits.maxSubdomains === null 
                                        ? ', sous-domaines illimités' 
                                        : `, ${limits.maxSubdomains} sous-domaine${limits.maxSubdomains > 1 ? 's' : ''}`
                                    }
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            {/* Formulaire d'ajout de domaine */}
            {canAdd && showAddForm && (
                <div className="mb-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Ajouter un domaine personnalisé
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Domaine *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.domain}
                                        onChange={(e) => {
                                            setFormData({ ...formData, domain: e.target.value });
                                            setDetectedProvider(null); // Reset detection on change
                                        }}
                                        placeholder="exemple.com"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                                    />
                                    
                                    {/* Affichage du provider détecté */}
                                    {detectingProvider && (
                                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            <span>Détection du registrar en cours...</span>
                                        </div>
                                    )}
                                    
                                    {!detectingProvider && detectedProvider && (
                                        <div className={`mt-3 p-4 rounded-lg border ${
                                            !detectedProvider.available || detectedProvider.isActive
                                                ? 'bg-red-50 border-red-200'
                                                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
                                        }`}>
                                            {!detectedProvider.available || detectedProvider.isActive ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-start gap-3">
                                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-red-900 mb-1">
                                                                ⚠️ Domaine non disponible
                                                            </p>
                                                            <p className="text-xs text-red-700 mb-2">
                                                                Ce domaine est déjà actif et déployé sur un autre service.
                                                            </p>
                                                            {detectedProvider.ipAddress && (
                                                                <p className="text-xs text-red-600 font-mono bg-red-100 px-2 py-1 rounded">
                                                                    IP détectée : {detectedProvider.ipAddress}
                                                                </p>
                                                            )}
                                                            {detectedProvider.cname && (
                                                                <p className="text-xs text-red-600 font-mono bg-red-100 px-2 py-1 rounded">
                                                                    CNAME détecté : {detectedProvider.cname}
                                                                </p>
                                                            )}
                                                            <p className="text-xs text-red-600 mt-2">
                                                                Veuillez utiliser un autre domaine ou modifier la configuration DNS de ce domaine.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : detectedProvider.provider && detectedProvider.provider !== 'Non détecté' && detectedProvider.dnsUrl ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                                <Globe className="w-5 h-5 text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-gray-900">
                                                                    Registrar détecté : <span className="text-blue-600">{detectedProvider.provider}</span>
                                                                </p>
                                                                <p className="text-xs text-gray-600 mt-0.5">
                                                                    ✅ Domaine disponible • Prêt pour la configuration
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <a
                                                            href={detectedProvider.dnsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#1E40AF] text-white rounded-lg hover:from-[#1E40AF] hover:to-[#2563EB] transition-all text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                                                        >
                                                            <Globe className="w-4 h-4" />
                                                            Configurer DNS
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                    <div className="pt-2 border-t border-blue-200">
                                                        <p className="text-xs text-gray-600">
                                                            💡 <strong>Astuce :</strong> Le bouton ci-dessus vous redirige directement vers votre registrar pour configurer les enregistrements DNS nécessaires.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-white rounded-lg shadow-sm">
                                                            <Globe className="w-5 h-5 text-gray-600" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                ✅ Domaine disponible
                                                            </p>
                                                            <p className="text-xs text-gray-600 mt-0.5">
                                                                Le registrar n'a pas pu être détecté automatiquement. Vous pouvez configurer les DNS manuellement dans votre registrar.
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-2 border-t border-gray-200">
                                                        <p className="text-xs text-gray-600">
                                                            💡 <strong>Astuce :</strong> Consultez le <Link href="/dashboard/domains/help" className="text-blue-600 hover:underline">guide DNS</Link> pour les instructions détaillées de configuration.
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {canAddSubdomain && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Sous-domaine (optionnel)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.subdomain}
                                            onChange={(e) => setFormData({ ...formData, subdomain: e.target.value })}
                                            placeholder="portfolio"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Créera : {formData.subdomain ? `${formData.subdomain}.${formData.domain || 'exemple.com'}` : `exemple.${formData.domain || 'exemple.com'}`}
                                        </p>
                                    </div>
                                )}

                                {hasCustomSlug && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Slug personnalisé (optionnel)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="mon-portfolio"
                                            pattern="[a-z0-9-]+"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            URL personnalisée : /{formData.slug || 'votre-slug'}
                                        </p>
                                    </div>
                                )}

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_primary"
                                        checked={formData.is_primary}
                                        onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                                        className="h-4 w-4 text-[#1E3A8A] focus:ring-[#1E3A8A] border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_primary" className="ml-2 block text-sm text-gray-700">
                                        Définir comme domaine principal
                                    </label>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="px-4 py-2 bg-[#1E3A8A] text-white rounded-md hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? 'Création...' : 'Créer le domaine'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setFormData({ domain: '', subdomain: '', slug: '', is_primary: false });
                                            setError(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Liste des domaines */}
            <div className="bg-white rounded-lg shadow">
                {domains.length === 0 ? (
                    <div className="p-8 text-center">
                        <Globe className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-600">
                            Aucun domaine configuré. Ajoutez votre premier domaine personnalisé.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {domains.map((domain) => (
                            <div key={domain.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Globe className="w-5 h-5 text-gray-400" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {fullDomain(domain)}
                                            </h3>
                                            {domain.is_primary && (
                                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                                                    Principal
                                                </span>
                                            )}
                                            {getStatusIcon(domain.ssl_status)}
                                            <span className="text-sm text-gray-600">
                                                {getStatusLabel(domain.ssl_status)}
                                            </span>
                                        </div>

                                        {domain.slug && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm text-gray-600">Slug :</span>
                                                <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                                                    /{domain.slug}
                                                </code>
                                                <button
                                                    onClick={() => copyToClipboard(`/${domain.slug}`, `slug-${domain.id}`)}
                                                    className="text-gray-400 hover:text-gray-600"
                                                >
                                                    {copied === `slug-${domain.id}` ? (
                                                        <Check className="w-4 h-4" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {domain.ssl_status === 'pending' && domain.verification_token && (
                                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                                                <div className="flex items-start mb-3">
                                                    <Globe className="w-6 h-6 text-blue-600 mr-2 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                                                            🌐 Configurer votre domaine personnalisé
                                                        </h4>
                                                        <p className="text-sm text-gray-700 mb-2">
                                                            <strong className="text-green-600">✓ Vous n'avez PAS besoin de changer vos nameservers !</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-white rounded-lg p-4 mb-3">
                                                    <p className="text-sm font-semibold text-gray-900 mb-3">Étapes simples :</p>
                                                    <ol className="space-y-2 text-sm text-gray-700 list-decimal list-inside">
                                                        <li>Connectez-vous à votre registrar (GoDaddy, Namecheap, OVH, etc.)</li>
                                                        <li>Trouvez la section <strong>"DNS"</strong> ou <strong>"Gestion DNS"</strong></li>
                                                        <li>Ajoutez un nouvel enregistrement :
                                                            <div className="ml-6 mt-2 space-y-1 text-xs">
                                                                <div>• <strong>Type :</strong> <code className="px-1.5 py-0.5 bg-gray-100 rounded">CNAME</code></div>
                                                                <div>• <strong>Nom :</strong> <code className="px-1.5 py-0.5 bg-gray-100 rounded">@</code> (pour {domain.domain}) OU <code className="px-1.5 py-0.5 bg-gray-100 rounded">www</code> (pour www.{domain.domain})</div>
                                                                <div>• <strong>Valeur :</strong> 
                                                                    <code className="px-1.5 py-0.5 bg-gray-100 rounded ml-1">
                                                                        {process.env.NEXT_PUBLIC_DOMAIN || 'innovaport.dev'}
                                                                    </code>
                                                                    <button
                                                                        onClick={() => copyToClipboard(process.env.NEXT_PUBLIC_DOMAIN || 'innovaport.dev', `cname-value-${domain.id}`)}
                                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                                    >
                                                                        {copied === `cname-value-${domain.id}` ? (
                                                                            <Check className="w-3 h-3 inline" />
                                                                        ) : (
                                                                            <Copy className="w-3 h-3 inline" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                                <div>• <strong>TTL :</strong> Automatique (ou 3600)</div>
                                                            </div>
                                                        </li>
                                                        <li>Sauvegardez</li>
                                                        <li>Revenez ici et cliquez sur <strong>"Vérifier"</strong></li>
                                                    </ol>
                                                </div>

                                                <div className="flex items-start gap-2 text-xs text-gray-600">
                                                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                    <span><strong>⏱️ La propagation DNS</strong> prend généralement 5-10 minutes</span>
                                                </div>
                                                <div className="flex items-start gap-2 text-xs text-gray-600 mt-1">
                                                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-600" />
                                                    <span><strong>🔒 Le certificat SSL</strong> sera automatiquement généré sous 24h</span>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-blue-200">
                                                    <p className="text-xs font-semibold text-gray-700 mb-2">Enregistrement TXT (optionnel pour vérification) :</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="px-2 py-1 bg-gray-100 rounded text-xs flex-1">
                                                            innovaport-verification={domain.verification_token}
                                                        </code>
                                                        <button
                                                            onClick={() => copyToClipboard(`innovaport-verification=${domain.verification_token}`, `txt-${domain.id}`)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            {copied === `txt-${domain.id}` ? (
                                                                <Check className="w-4 h-4" />
                                                            ) : (
                                                                <Copy className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {domain.ssl_status === 'pending' && (
                                            <button
                                                onClick={() => handleVerify(domain.id)}
                                                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                                            >
                                                Vérifier
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(domain.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

