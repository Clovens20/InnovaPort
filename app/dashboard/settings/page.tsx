"use client";

import { useState, useEffect, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, X, ExternalLink, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bio, setBio] = useState("");
    const [tiktokUrl, setTiktokUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // États initiaux pour détecter les changements
    const [initialUsername, setInitialUsername] = useState("");
    const [initialFullName, setInitialFullName] = useState("");
    const [initialTitle, setInitialTitle] = useState("");
    const [initialEmail, setInitialEmail] = useState("");
    const [initialAvatarUrl, setInitialAvatarUrl] = useState("");
    const [initialBio, setInitialBio] = useState("");
    const [initialTiktokUrl, setInitialTiktokUrl] = useState("");
    const [initialFacebookUrl, setInitialFacebookUrl] = useState("");
    const [initialTwitterUrl, setInitialTwitterUrl] = useState("");
    const [initialLinkedinUrl, setInitialLinkedinUrl] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("username, subscription_tier, avatar_url, bio, full_name, title, public_email, tiktok_url, facebook_url, twitter_url, linkedin_url")
                .eq("id", user.id)
                .maybeSingle();

            if (error) throw error;

            setProfile(data);
            setUsername(data?.username || "");
            setFullName(data?.full_name || "");
            setTitle(data?.title || "");
            setEmail(data?.public_email || "");
            setAvatarUrl(data?.avatar_url || "");
            setAvatarPreview(data?.avatar_url || null);
            setBio(data?.bio || "");
            setTiktokUrl(data?.tiktok_url || "");
            setFacebookUrl(data?.facebook_url || "");
            setTwitterUrl(data?.twitter_url || "");
            setLinkedinUrl(data?.linkedin_url || "");
            
            // Sauvegarder les valeurs initiales
            setInitialUsername(data?.username || "");
            setInitialFullName(data?.full_name || "");
            setInitialTitle(data?.title || "");
            setInitialEmail(data?.public_email || "");
            setInitialAvatarUrl(data?.avatar_url || "");
            setInitialBio(data?.bio || "");
            setInitialTiktokUrl(data?.tiktok_url || "");
            setInitialFacebookUrl(data?.facebook_url || "");
            setInitialTwitterUrl(data?.twitter_url || "");
            setInitialLinkedinUrl(data?.linkedin_url || "");
            
            setIsDirty(false);
            setLoading(false);
        } catch (err) {
            console.error("Error loading profile:", err);
            setError("Erreur lors du chargement du profil");
            setLoading(false);
        }
    };

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) {
            return "Le username doit contenir au moins 3 caractères";
        }
        if (value.length > 30) {
            return "Le username ne peut pas dépasser 30 caractères";
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
            return "Le username ne peut contenir que des lettres minuscules, chiffres et tirets";
        }
        if (value.startsWith("-") || value.endsWith("-")) {
            return "Le username ne peut pas commencer ou se terminer par un tiret";
        }
        if (value.includes("--")) {
            return "Le username ne peut pas contenir de tirets consécutifs";
        }
        return null;
    };

    const handleSave = async () => {
        if (profile?.subscription_tier === "free") {
            setError("La personnalisation de l'URL est disponible uniquement pour les plans payants");
            return;
        }

        const validationError = validateUsername(username);
        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            // Vérifier si le username est disponible (seulement si changé)
            if (username !== initialUsername) {
                const { data: existing } = await supabase
                    .from("profiles")
                    .select("id")
                    .eq("username", username)
                    .neq("id", user.id)
                    .maybeSingle();

                if (existing) {
                    setError("Ce username est déjà pris. Veuillez en choisir un autre.");
                    setSaving(false);
                    return;
                }

                // Mettre à jour le username
                const { error: updateError } = await supabase
                    .from("profiles")
                    .update({ username })
                    .eq("id", user.id);

                if (updateError) throw updateError;

                setSuccess("URL personnalisée mise à jour avec succès !");
                setProfile({ ...profile, username });
                setInitialUsername(username);
                
                // Forcer le rafraîchissement de la page pour mettre à jour les composants
                // Le portfolio-url-card écoute déjà les changements via realtime Supabase
                router.refresh();
                
                // Petit délai avant de rediriger pour que le message de succès soit visible
                setTimeout(() => {
                    router.push("/dashboard");
                }, 1500);
            }
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour");
        } finally {
            setSaving(false);
        }
    };

    const handleCopy = async () => {
        const baseUrl = window.location.origin;
        const portfolioUrl = `${baseUrl}/${username}`;
        try {
            await navigator.clipboard.writeText(portfolioUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError("L'image est trop lourde (max 5MB)");
            return;
        }

        // Créer une prévisualisation locale immédiate
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
            setIsDirty(true);
        };
        reader.readAsDataURL(file);

        setAvatarUploading(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            const ext = file.name.split(".").pop();
            const path = `avatars/${user.id}/${Date.now()}.${ext}`;

            const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file, {
                upsert: true,
                cacheControl: "3600",
            });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
            const publicUrl = publicUrlData.publicUrl;

            setAvatarUrl(publicUrl);
            setAvatarPreview(publicUrl);
            setIsDirty(true);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'upload de la photo");
            // Restaurer l'avatar précédent en cas d'erreur
            setAvatarPreview(initialAvatarUrl || null);
        } finally {
            setAvatarUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            const { error: updateError } = await supabase
                .from("profiles")
                .update({
                    full_name: fullName || null,
                    title: title || null,
                    public_email: email || null,
                    avatar_url: avatarUrl || null,
                    bio: bio || null,
                    tiktok_url: tiktokUrl || null,
                    facebook_url: facebookUrl || null,
                    twitter_url: twitterUrl || null,
                    linkedin_url: linkedinUrl || null,
                })
                .eq("id", user.id);

            if (updateError) throw updateError;

            setSuccess("Profil mis à jour avec succès !");
            setProfile({ 
                ...profile, 
                full_name: fullName,
                title: title,
                public_email: email,
                avatar_url: avatarUrl, 
                bio: bio,
                tiktok_url: tiktokUrl,
                facebook_url: facebookUrl,
                twitter_url: twitterUrl,
                linkedin_url: linkedinUrl,
            });
            
            // Mettre à jour les valeurs initiales après sauvegarde
            setInitialFullName(fullName);
            setInitialTitle(title);
            setInitialEmail(email);
            setInitialAvatarUrl(avatarUrl);
            setInitialBio(bio);
            setInitialTiktokUrl(tiktokUrl);
            setInitialFacebookUrl(facebookUrl);
            setInitialTwitterUrl(twitterUrl);
            setInitialLinkedinUrl(linkedinUrl);
            setIsDirty(false);
            
            // Rafraîchir pour mettre à jour les autres composants
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setSavingProfile(false);
        }
    };

    // Rafraîchir le profil quand on revient sur l'onglet (si pas de brouillon en cours)
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible" && !isDirty && !savingProfile && !avatarUploading) {
                loadProfile();
            }
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [isDirty, savingProfile, avatarUploading]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const portfolioUrl = `${baseUrl}/${username}`;
    // Seuls les plans 'pro' et 'premium' peuvent personnaliser leur URL
    const canCustomize = profile?.subscription_tier === "pro" || profile?.subscription_tier === "premium";
    
    // Vérifier si le profil a des changements non sauvegardés
    const hasProfileChanges = 
        fullName !== initialFullName ||
        title !== initialTitle ||
        email !== initialEmail ||
        avatarUrl !== initialAvatarUrl || 
        bio !== initialBio ||
        tiktokUrl !== initialTiktokUrl ||
        facebookUrl !== initialFacebookUrl ||
        twitterUrl !== initialTwitterUrl ||
        linkedinUrl !== initialLinkedinUrl;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
                <p className="text-gray-600 mt-1">Gérez les paramètres de votre compte et portfolio</p>
            </div>

            {/* Messages de notification globaux */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <X className="w-4 h-4" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    {success}
                </div>
            )}

            {/* Section Profil public */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Profil public</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Ajoutez votre photo et une courte description qui apparaîtront sur votre portfolio.
                        </p>
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile || !hasProfileChanges}
                        className="px-6 py-3 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40"
                    >
                        {savingProfile ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Sauvegarder les modifications
                            </>
                        )}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Nom complet
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => {
                                    setFullName(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Votre nom complet"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Titre / Profession
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="Ex: Développeur Full Stack, Designer UX/UI..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Email public
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setIsDirty(true);
                                }}
                                placeholder="votre@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            <p className="text-xs text-gray-500">
                                Cet email sera visible sur votre portfolio public
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Photo de profil
                            </label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleAvatarUpload}
                                disabled={avatarUploading}
                                className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500">
                                PNG, JPG, WebP. Max 5MB. L'image sera stockée dans le bucket Supabase "avatars".
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description courte (Bio)
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => {
                                    setBio(e.target.value);
                                    setIsDirty(true);
                                }}
                                rows={4}
                                placeholder="Décrivez-vous en quelques lignes..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                Cette description sera affichée en haut de votre portfolio.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                        <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-2 border-gray-300 shadow-md mb-4 relative">
                            {avatarPreview ? (
                                <img 
                                    src={avatarPreview} 
                                    alt="Avatar preview" 
                                    className="w-full h-full object-cover"
                                    onError={() => setAvatarPreview(initialAvatarUrl || null)}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl mb-1">📷</div>
                                        <div className="text-xs">Aucune photo</div>
                                    </div>
                                </div>
                            )}
                            {avatarUploading && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-white" />
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                            La photo et la description seront visibles sur votre page portfolio.
                        </p>
                        {avatarUploading && (
                            <p className="text-xs text-blue-600 font-medium">Téléversement en cours...</p>
                        )}
                        {avatarPreview && !avatarUploading && (
                            <p className="text-xs text-green-600 font-medium">✓ Photo prête</p>
                        )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    TikTok <span className="text-gray-400 font-normal">(optionnel)</span>
                                </label>
                                <input
                                    type="url"
                                    value={tiktokUrl}
                                    onChange={(e) => {
                                        setTiktokUrl(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    placeholder="https://tiktok.com/@votre-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Facebook <span className="text-gray-400 font-normal">(optionnel)</span>
                                </label>
                                <input
                                    type="url"
                                    value={facebookUrl}
                                    onChange={(e) => {
                                        setFacebookUrl(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    placeholder="https://facebook.com/votre-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Twitter / X <span className="text-gray-400 font-normal">(optionnel)</span>
                                </label>
                                <input
                                    type="url"
                                    value={twitterUrl}
                                    onChange={(e) => {
                                        setTwitterUrl(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    placeholder="https://twitter.com/votre-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    LinkedIn <span className="text-gray-400 font-normal">(optionnel)</span>
                                </label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => {
                                        setLinkedinUrl(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    placeholder="https://linkedin.com/in/votre-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Section URL du portfolio */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">URL de votre portfolio</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Personnalisez l'URL de votre portfolio pour un partage plus professionnel
                        </p>
                    </div>
                </div>

                {/* URL actuelle */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">URL actuelle</p>
                            <p className="font-mono text-sm text-gray-900 break-all">{portfolioUrl}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Copier l'URL"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-600" />
                                ) : (
                                    <Copy className="w-5 h-5 text-gray-600" />
                                )}
                            </button>
                            <Link
                                href={`/${username}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Ouvrir le portfolio"
                            >
                                <ExternalLink className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Personnalisation */}
                {canCustomize ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Personnaliser votre username
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
                                    {baseUrl}/
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        if (canCustomize) {
                                            setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""));
                                            setError(null);
                                            setSuccess(null);
                                        }
                                    }}
                                    disabled={!canCustomize}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                                    placeholder="votre-username"
                                    readOnly={!canCustomize}
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                3-30 caractères, lettres minuscules, chiffres et tirets uniquement
                            </p>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving || username === initialUsername}
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enregistrement...
                                </>
                            ) : (
                                "Enregistrer"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    Personnalisez votre URL avec le plan Pro
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    Le plan Pro vous permet de personnaliser l'URL de votre portfolio
                                    pour un partage plus professionnel.
                                </p>
                                <Link
                                    href="/dashboard/billing"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                                >
                                    Voir les plans
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}