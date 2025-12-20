"use client";

import { useState, useEffect, useMemo, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, CheckCircle2, X, ExternalLink, Copy, Check, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/useTranslation";
import AutoResponseTemplateModal from "./_components/auto-response-template-modal";

export default function SettingsPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const supabase = createClient();
    
    // États de chargement et sauvegarde
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [savingProfile, setSavingProfile] = useState(false);
    const [avatarUploading, setAvatarUploading] = useState(false);
    
    // Profil
    const [profile, setProfile] = useState<any>(null);
    
    // Champs du formulaire
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [title, setTitle] = useState("");
    const [titleEn, setTitleEn] = useState("");
    const [email, setEmail] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [bio, setBio] = useState("");
    const [bioEn, setBioEn] = useState("");
    const [tiktokUrl, setTiktokUrl] = useState("");
    const [facebookUrl, setFacebookUrl] = useState("");
    const [twitterUrl, setTwitterUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    
    // Messages
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Réponses automatiques
    const [autoResponseTemplates, setAutoResponseTemplates] = useState<any[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<any | null>(null);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    // Paramètres de rappels
    const [reminderSettings, setReminderSettings] = useState<any>(null);
    const [reminderEnabled, setReminderEnabled] = useState(true);
    const [reminderDays, setReminderDays] = useState<number[]>([3, 7, 14]);
    const [reminderMessage, setReminderMessage] = useState("");
    const [notifyOnStatusChange, setNotifyOnStatusChange] = useState(true);
    const [savingReminders, setSavingReminders] = useState(false);

    // États initiaux pour détecter les changements
    const [initialUsername, setInitialUsername] = useState("");
    const [initialFullName, setInitialFullName] = useState("");
    const [initialTitle, setInitialTitle] = useState("");
    const [initialTitleEn, setInitialTitleEn] = useState("");
    const [initialEmail, setInitialEmail] = useState("");
    const [initialAvatarUrl, setInitialAvatarUrl] = useState("");
    const [initialBio, setInitialBio] = useState("");
    const [initialBioEn, setInitialBioEn] = useState("");
    const [initialTiktokUrl, setInitialTiktokUrl] = useState("");
    const [initialFacebookUrl, setInitialFacebookUrl] = useState("");
    const [initialTwitterUrl, setInitialTwitterUrl] = useState("");
    const [initialLinkedinUrl, setInitialLinkedinUrl] = useState("");

    // Vérifier si le profil a des changements (calcul automatique avec useMemo)
    const hasProfileChanges = useMemo(() => 
        fullName !== initialFullName ||
        title !== initialTitle ||
        titleEn !== initialTitleEn ||
        email !== initialEmail ||
        avatarUrl !== initialAvatarUrl || 
        bio !== initialBio ||
        bioEn !== initialBioEn ||
        tiktokUrl !== initialTiktokUrl ||
        facebookUrl !== initialFacebookUrl ||
        twitterUrl !== initialTwitterUrl ||
        linkedinUrl !== initialLinkedinUrl,
        [fullName, initialFullName, title, initialTitle, titleEn, initialTitleEn, 
         email, initialEmail, avatarUrl, initialAvatarUrl, bio, initialBio, 
         bioEn, initialBioEn, tiktokUrl, initialTiktokUrl, facebookUrl, 
         initialFacebookUrl, twitterUrl, initialTwitterUrl, linkedinUrl, initialLinkedinUrl]
    );
    
    // ✅ NOUVEAU CODE (fonctionne)
const hasUsernameChanges = useMemo(() => {
    const trimmedUsername = username.trim();
    const trimmedInitial = initialUsername.trim();
    
    // Vérifier que le username est valide ET différent
    if (trimmedUsername.length < 3) return false;
    if (trimmedUsername === trimmedInitial) return false;
    
    return true;
}, [username, initialUsername]);

// Charger le profil au démarrage
    useEffect(() => {
        loadProfile();
        loadReminderSettings();
    }, []);

    // Charger les templates de réponses automatiques
    useEffect(() => {
        if (!loading) {
            loadAutoResponseTemplates();
        }
    }, [loading]);

    const loadProfile = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/login");
                return;
            }

            const { data, error } = await supabase
                .from("profiles")
                .select("username, subscription_tier, avatar_url, bio, bio_en, full_name, title, title_en, email, tiktok_url, facebook_url, twitter_url, linkedin_url")
                .eq("id", user.id)
                .maybeSingle();

            if (error) throw error;

            // Initialiser tous les champs avec des valeurs par défaut
            const profileData = {
                username: data?.username || "",
                fullName: data?.full_name || "",
                title: data?.title || "",
                titleEn: data?.title_en || "",
                email: data?.email || "",
                avatarUrl: data?.avatar_url || "",
                bio: data?.bio || "",
                bioEn: data?.bio_en || "",
                tiktokUrl: data?.tiktok_url || "",
                facebookUrl: data?.facebook_url || "",
                twitterUrl: data?.twitter_url || "",
                linkedinUrl: data?.linkedin_url || "",
            };

            setProfile(data);
            
            // Définir les valeurs actuelles
            setUsername(profileData.username);
            setFullName(profileData.fullName);
            setTitle(profileData.title);
            setTitleEn(profileData.titleEn);
            setEmail(profileData.email);
            setAvatarUrl(profileData.avatarUrl);
            setAvatarPreview(profileData.avatarUrl || null);
            setBio(profileData.bio);
            setBioEn(profileData.bioEn);
            setTiktokUrl(profileData.tiktokUrl);
            setFacebookUrl(profileData.facebookUrl);
            setTwitterUrl(profileData.twitterUrl);
            setLinkedinUrl(profileData.linkedinUrl);
            
            // Sauvegarder les valeurs initiales
            setInitialUsername(profileData.username);
            setInitialFullName(profileData.fullName);
            setInitialTitle(profileData.title);
            setInitialTitleEn(profileData.titleEn);
            setInitialEmail(profileData.email);
            setInitialAvatarUrl(profileData.avatarUrl);
            setInitialBio(profileData.bio);
            setInitialBioEn(profileData.bioEn);
            setInitialTiktokUrl(profileData.tiktokUrl);
            setInitialFacebookUrl(profileData.facebookUrl);
            setInitialTwitterUrl(profileData.twitterUrl);
            setInitialLinkedinUrl(profileData.linkedinUrl);
            
            setLoading(false);
        } catch (err) {
            console.error("Error loading profile:", err);
            setError(t('dashboard.settings.errorLoading'));
            setLoading(false);
        }
    };

    // Fonction pour charger les paramètres de rappels
    const loadReminderSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('quote_reminder_settings')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
                console.error('Error loading reminder settings:', error);
                return;
            }

            if (data) {
                setReminderSettings(data);
                setReminderEnabled(data.enabled ?? true);
                setReminderDays(data.reminder_days || [3, 7, 14]);
                setReminderMessage(data.reminder_message || '');
                setNotifyOnStatusChange(data.notify_on_status_change !== false);
            } else {
                // Créer les paramètres par défaut
                setReminderEnabled(true);
                setReminderDays([3, 7, 14]);
                setReminderMessage('');
                setNotifyOnStatusChange(true);
            }
        } catch (err) {
            console.error('Error loading reminder settings:', err);
        }
    };

    // Fonction pour sauvegarder les paramètres de rappels
    const handleSaveReminderSettings = async () => {
        setSavingReminders(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Non authentifié');

            const settingsData = {
                user_id: user.id,
                enabled: reminderEnabled,
                reminder_days: reminderDays,
                reminder_message: reminderMessage || null,
                notify_on_status_change: notifyOnStatusChange,
            };

            const { error: upsertError } = await supabase
                .from('quote_reminder_settings')
                .upsert(settingsData, { onConflict: 'user_id' });

            if (upsertError) throw upsertError;

            setSuccess('Paramètres de rappels sauvegardés avec succès');
            await loadReminderSettings();
        } catch (err: any) {
            console.error('Error saving reminder settings:', err);
            setError(err.message || 'Erreur lors de la sauvegarde');
        } finally {
            setSavingReminders(false);
        }
    };

    // Fonction pour charger les templates de réponses automatiques
    const loadAutoResponseTemplates = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setLoadingTemplates(true);
            const { data, error } = await supabase
                .from('auto_response_templates')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAutoResponseTemplates(data || []);
        } catch (err) {
            console.error('Error loading templates:', err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    // Fonction pour sauvegarder un template
    const handleSaveTemplate = async (template: any) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            if (template.id) {
                // Mise à jour
                const { error } = await supabase
                    .from('auto_response_templates')
                    .update({
                        name: template.name,
                        enabled: template.enabled,
                        conditions: template.conditions,
                        subject: template.subject,
                        body_html: template.body_html,
                    })
                    .eq('id', template.id)
                    .eq('user_id', user.id);

                if (error) throw error;
            } else {
                // Création
                const { error } = await supabase
                    .from('auto_response_templates')
                    .insert({
                        user_id: user.id,
                        name: template.name,
                        enabled: template.enabled,
                        conditions: template.conditions,
                        subject: template.subject,
                        body_html: template.body_html,
                    });

                if (error) throw error;
            }

            await loadAutoResponseTemplates();
            setSuccess(template.id ? 'Template mis à jour avec succès' : 'Template créé avec succès');
        } catch (err: any) {
            console.error('Error saving template:', err);
            throw err;
        }
    };

    // Fonction pour supprimer un template
    const handleDeleteTemplate = async (templateId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            const { error } = await supabase
                .from('auto_response_templates')
                .delete()
                .eq('id', templateId)
                .eq('user_id', user.id);

            if (error) throw error;

            await loadAutoResponseTemplates();
            setSuccess('Template supprimé avec succès');
        } catch (err: any) {
            console.error('Error deleting template:', err);
            setError(err.message || 'Erreur lors de la suppression');
        }
    };

    const validateUsername = (value: string): string | null => {
        if (value.length < 3) {
            return t('dashboard.settings.usernameValidation.minLength');
        }
        if (value.length > 30) {
            return t('dashboard.settings.usernameValidation.maxLength');
        }
        if (!/^[a-z0-9-]+$/.test(value)) {
            return t('dashboard.settings.usernameValidation.invalidChars');
        }
        if (value.startsWith("-") || value.endsWith("-")) {
            return t('dashboard.settings.usernameValidation.startsWithDash');
        }
        if (value.includes("--")) {
            return t('dashboard.settings.usernameValidation.consecutiveDashes');
        }
        return null;
    };

    // Rafraîchir le profil quand on revient sur l'onglet (seulement si pas de modifications)
    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible" && !hasProfileChanges && !savingProfile && !avatarUploading) {
                loadProfile();
            }
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, [hasProfileChanges, savingProfile, avatarUploading]);
// Fonction dédiée pour sauvegarder le USERNAME uniquement
    const handleSaveUsername = async () => {
        if (profile?.subscription_tier === "free") {
            setError(t('dashboard.settings.urlCustomizationOnlyPaid'));
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

            // Vérifier si le username est disponible
            const { data: existing } = await supabase
                .from("profiles")
                .select("id")
                .eq("username", username)
                .neq("id", user.id)
                .maybeSingle();

            if (existing) {
                setError(t('dashboard.settings.usernameTaken'));
                setSaving(false);
                return;
            }

            // Mettre à jour le username uniquement
            const { error: updateError } = await supabase
                .from("profiles")
                .update({ username: username })
                .eq("id", user.id);

            if (updateError) throw updateError;

            // Invalider le cache du portfolio
            try {
                await fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, userId: user.id }),
                });
            } catch (revalidateError) {
                console.warn('Cache revalidation warning:', revalidateError);
            }

            setSuccess(t('dashboard.settings.urlUpdated'));
            setProfile({ ...profile, username });
            setInitialUsername(username);
            
            // Rafraîchir la page
            router.refresh();
            
            // Rediriger après un délai
            setTimeout(() => {
                router.push("/dashboard");
            }, 1500);
        } catch (err: any) {
            console.error("Error updating username:", err);
            setError(err.message || t('dashboard.settings.errorUpdating'));
        } finally {
            setSaving(false);
        }
    };

    // Fonction pour copier l'URL
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

    // Fonction pour uploader l'avatar
    const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError(t('common.imageTooLarge'));
            return;
        }

        // Créer une prévisualisation locale immédiate
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
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

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(path, file, {
                    upsert: true,
                    cacheControl: "3600",
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(path);
            
            const publicUrl = publicUrlData.publicUrl;

            setAvatarUrl(publicUrl);
            setAvatarPreview(publicUrl);
        } catch (err: any) {
            console.error("Error uploading avatar:", err);
            setError(err.message || t('common.errorUploading'));
            // Restaurer l'avatar précédent en cas d'erreur
            setAvatarPreview(initialAvatarUrl || null);
        } finally {
            setAvatarUploading(false);
        }
    };

    // Fonction pour sauvegarder le PROFIL (tous les champs sauf username)
    const handleSaveProfile = async () => {
        setSavingProfile(true);
        setError(null);
        setSuccess(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Non authentifié");

            const updateData = {
                full_name: fullName || null,
                title: title || null,
                title_en: titleEn || null,
                email: email || null,
                avatar_url: avatarUrl || null,
                bio: bio || null,
                bio_en: bioEn || null,
                tiktok_url: tiktokUrl || null,
                facebook_url: facebookUrl || null,
                twitter_url: twitterUrl || null,
                linkedin_url: linkedinUrl || null,
            };

            console.log('Updating profile with data:', updateData);

            const { data: updatedData, error: updateError } = await supabase
                .from("profiles")
                .update(updateData)
                .eq("id", user.id)
                .select()
                .single();

            if (updateError) {
                console.error('Error updating profile:', updateError);
                throw updateError;
            }

            if (!updatedData) {
                throw new Error('Aucune donnée retournée après la mise à jour');
            }

            console.log('Profile updated successfully:', updatedData);

            // Invalider le cache du portfolio
            try {
                await fetch('/api/revalidate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: username, userId: user.id }),
                });
            } catch (revalidateError) {
                console.warn('Cache revalidation warning:', revalidateError);
            }

            setSuccess(t('dashboard.settings.successUpdating'));
            setProfile({ ...profile, ...updateData });
            
            // Mettre à jour les valeurs initiales après sauvegarde réussie
            setInitialFullName(fullName);
            setInitialTitle(title);
            setInitialTitleEn(titleEn);
            setInitialEmail(email);
            setInitialAvatarUrl(avatarUrl);
            setInitialBio(bio);
            setInitialBioEn(bioEn);
            setInitialTiktokUrl(tiktokUrl);
            setInitialFacebookUrl(facebookUrl);
            setInitialTwitterUrl(twitterUrl);
            setInitialLinkedinUrl(linkedinUrl);
            
            // Rafraîchir pour mettre à jour les autres composants
            router.refresh();
        } catch (err: any) {
            console.error('Error in handleSaveProfile:', err);
            const errorMessage = err.message || t('dashboard.settings.errorUpdating');
            setError(errorMessage);
        } finally {
            setSavingProfile(false);
        }
    };
// État de chargement
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const portfolioUrl = `${baseUrl}/${username}`;
    const canCustomize = profile?.subscription_tier === "pro" || profile?.subscription_tier === "premium";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.settings.title')}</h1>
                <p className="text-gray-600 mt-1">{t('dashboard.settings.subtitle')}</p>
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
                        <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.settings.publicProfile')}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('dashboard.settings.publicProfileDesc')}
                        </p>
                    </div>
                    <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile || !hasProfileChanges}
                        className={`px-6 py-3 rounded-lg transition-all font-semibold flex items-center gap-2 ${
                            hasProfileChanges && !savingProfile
                                ? 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                        }`}
                    >
                        {savingProfile ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {t('dashboard.settings.saving')}
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                {t('dashboard.settings.saveChanges')}
                            </>
                        )}
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('dashboard.settings.fullName')}
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={t('dashboard.settings.fullNamePlaceholder')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('dashboard.settings.professionTitle')} (FR)
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={t('dashboard.settings.professionTitlePlaceholder')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-2 text-gray-900 placeholder:text-gray-400"
                            />
                            <label className="block text-sm font-medium text-gray-700">
                                {t('dashboard.settings.professionTitle')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span>
                            </label>
                            <input
                                type="text"
                                value={titleEn}
                                onChange={(e) => setTitleEn(e.target.value)}
                                placeholder="Freelance Developer"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('dashboard.settings.publicEmail')}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('dashboard.settings.publicEmailPlaceholder')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                            />
                            <p className="text-xs text-gray-500">
                                {t('dashboard.settings.publicEmailHint')}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                                {t('dashboard.settings.profilePhoto')}
                            </label>
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                onChange={handleAvatarUpload}
                                disabled={avatarUploading}
                                className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500">
                                {t('dashboard.settings.profilePhotoHint')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('dashboard.settings.bio')} (FR)
                            </label>
                            <textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                rows={4}
                                placeholder={t('dashboard.settings.bioPlaceholder')}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none mb-2 text-gray-900 placeholder:text-gray-400"
                            />
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('dashboard.settings.bio')} (EN) <span className="text-gray-400 font-normal">- {t('common.optional')}</span>
                            </label>
                            <textarea
                                value={bioEn}
                                onChange={(e) => setBioEn(e.target.value)}
                                rows={4}
                                placeholder="Creator of custom web solutions"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {t('dashboard.settings.bioHint')}
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
                                            <div className="text-xs">{t('dashboard.settings.noPhoto')}</div>
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
                                {t('dashboard.settings.photoPreview')}
                            </p>
                            {avatarUploading && (
                                <p className="text-xs text-blue-600 font-medium">{t('dashboard.settings.uploading')}</p>
                            )}
                            {avatarPreview && !avatarUploading && (
                                <p className="text-xs text-green-600 font-medium">{t('dashboard.settings.photoReady')}</p>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('dashboard.settings.tiktok')} <span className="text-gray-400 font-normal">{t('dashboard.settings.optional')}</span>
                                </label>
                                <input
                                    type="url"
                                    value={tiktokUrl}
                                    onChange={(e) => setTiktokUrl(e.target.value)}
                                    placeholder="https://tiktok.com/@your-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('dashboard.settings.facebook')} <span className="text-gray-400 font-normal">{t('dashboard.settings.optional')}</span>
                                </label>
                                <input
                                    type="url"
                                    value={facebookUrl}
                                    onChange={(e) => setFacebookUrl(e.target.value)}
                                    placeholder="https://facebook.com/your-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('dashboard.settings.twitter')} <span className="text-gray-400 font-normal">{t('dashboard.settings.optional')}</span>
                                </label>
                                <input
                                    type="url"
                                    value={twitterUrl}
                                    onChange={(e) => setTwitterUrl(e.target.value)}
                                    placeholder="https://twitter.com/your-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('dashboard.settings.linkedin')} <span className="text-gray-400 font-normal">{t('dashboard.settings.optional')}</span>
                                </label>
                                <input
                                    type="url"
                                    value={linkedinUrl}
                                    onChange={(e) => setLinkedinUrl(e.target.value)}
                                    placeholder="https://linkedin.com/in/your-username"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
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
                        <h2 className="text-xl font-semibold text-gray-900">{t('dashboard.settings.portfolioUrl')}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {t('dashboard.settings.portfolioUrlDesc')}
                        </p>
                    </div>
                </div>

                {/* URL actuelle */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-500 mb-1">{t('dashboard.settings.currentUrl')}</p>
                            <p className="font-mono text-sm text-gray-900 break-all">{portfolioUrl}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleCopy}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                title={t('dashboard.settings.copyUrl')}
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
                                title={t('dashboard.settings.openPortfolio')}
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
                                {t('dashboard.settings.customizeUsername')}
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 bg-gray-50 px-3 py-2 border border-r-0 border-gray-300 rounded-l-lg">
                                    {baseUrl}/
                                </span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => {
                                        const newValue = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                                        setUsername(newValue);
                                        setError(null);
                                        setSuccess(null);
                                    }}
                                    disabled={saving}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
                                    placeholder="your-username"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {t('dashboard.settings.usernameRules')}
                            </p>
                        </div>

                        <button
                            onClick={handleSaveUsername}
                            disabled={saving || !hasUsernameChanges}
                            className={`px-6 py-2 rounded-lg transition-all font-semibold flex items-center gap-2 ${
                                hasUsernameChanges && !saving
                                    ? 'bg-sky-500 text-white hover:bg-sky-600 cursor-pointer shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t('dashboard.settings.savingUrl')}
                                </>
                            ) : (
                                t('dashboard.settings.save')
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">
                                    {t('dashboard.settings.upgradeToPro')}
                                </h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {t('dashboard.settings.upgradeToProDesc')}
                                </p>
                                <Link
                                    href="/dashboard/billing"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-semibold"
                                >
                                    {t('dashboard.settings.viewPlans')}
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Section Réponses automatiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Réponses automatiques</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configurez des réponses personnalisées envoyées automatiquement aux prospects après qu'ils aient rempli le formulaire
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingTemplate(null);
                            setShowTemplateModal(true);
                        }}
                        className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Nouveau template
                    </button>
                </div>

                {/* Liste des templates */}
                {loadingTemplates ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-sky-500" />
                    </div>
                ) : (
                    <div className="space-y-4">
                        {autoResponseTemplates.map((template) => (
                            <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                            {template.enabled ? (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-medium">Actif</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium">Inactif</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mb-1">
                                            <span className="font-medium">Sujet:</span> {template.subject}
                                        </p>
                                        {template.conditions && Object.keys(template.conditions).length > 0 && (
                                            <div className="text-xs text-gray-500 mt-2">
                                                <span className="font-medium">Conditions:</span>
                                                {template.conditions.project_type && (
                                                    <span className="ml-2">Type: {template.conditions.project_type}</span>
                                                )}
                                                {template.conditions.budget_range && (
                                                    <span className="ml-2">
                                                        Budget: {template.conditions.budget_range.min || '∞'}€ - {template.conditions.budget_range.max || '∞'}€
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                setEditingTemplate(template);
                                                setShowTemplateModal(true);
                                            }}
                                            className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                            title="Modifier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const { error } = await supabase
                                                    .from('auto_response_templates')
                                                    .update({ enabled: !template.enabled })
                                                    .eq('id', template.id);
                                                if (!error) {
                                                    await loadAutoResponseTemplates();
                                                    setSuccess(template.enabled ? 'Template désactivé' : 'Template activé');
                                                }
                                            }}
                                            className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                            title={template.enabled ? 'Désactiver' : 'Activer'}
                                        >
                                            {template.enabled ? (
                                                <X className="w-4 h-4" />
                                            ) : (
                                                <CheckCircle2 className="w-4 h-4" />
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {autoResponseTemplates.length === 0 && (
                            <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
                                <p className="text-sm text-gray-500 mb-4">
                                    Aucun template configuré. Créez-en un pour personnaliser vos réponses automatiques.
                                </p>
                                <button
                                    onClick={() => {
                                        setEditingTemplate(null);
                                        setShowTemplateModal(true);
                                    }}
                                    className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors inline-flex items-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Créer un template
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modal pour créer/éditer un template */}
            <AutoResponseTemplateModal
                isOpen={showTemplateModal}
                onClose={() => {
                    setShowTemplateModal(false);
                    setEditingTemplate(null);
                }}
                template={editingTemplate}
                onSave={handleSaveTemplate}
            />

            {/* Section Rappels automatiques */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Rappels automatiques</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Configurez les rappels automatiques pour ne jamais oublier un devis en attente
                        </p>
                    </div>
                    <button
                        onClick={handleSaveReminderSettings}
                        disabled={savingReminders}
                        className={`px-6 py-3 rounded-lg transition-all font-semibold flex items-center gap-2 ${
                            savingReminders
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-500/30'
                        }`}
                    >
                        {savingReminders ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Enregistrement...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-5 h-5" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Activation des rappels */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-900">Activer les rappels automatiques</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Recevez des rappels par email pour les devis en attente
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={reminderEnabled}
                                onChange={(e) => setReminderEnabled(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                    </div>

                    {/* Jours de rappel */}
                    {reminderEnabled && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jours de rappel (après combien de jours envoyer un rappel)
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {[1, 2, 3, 5, 7, 10, 14, 21, 30].map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => {
                                                if (reminderDays.includes(day)) {
                                                    setReminderDays(reminderDays.filter(d => d !== day));
                                                } else {
                                                    setReminderDays([...reminderDays, day].sort((a, b) => a - b));
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                reminderDays.includes(day)
                                                    ? 'bg-sky-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                        >
                                            {day} jour{day > 1 ? 's' : ''}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Sélectionnez les jours après lesquels vous souhaitez recevoir un rappel
                                </p>
                            </div>

                            {/* Message personnalisé */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Message personnalisé pour les rappels (optionnel)
                                </label>
                                <textarea
                                    value={reminderMessage}
                                    onChange={(e) => setReminderMessage(e.target.value)}
                                    placeholder="Ajoutez un message personnalisé qui sera inclus dans les emails de rappel..."
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none text-gray-900 placeholder:text-gray-400"
                                />
                            </div>
                        </>
                    )}

                    {/* Notifications de changement de statut */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="font-medium text-gray-900">Notifier les clients lors des changements de statut</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Envoyer automatiquement un email au client quand vous changez le statut de son devis
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={notifyOnStatusChange}
                                onChange={(e) => setNotifyOnStatusChange(e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}