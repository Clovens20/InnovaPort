'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, User, Mail, Edit, Upload, X, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Profile {
    id: string;
    username: string;
    full_name: string | null;
    email: string | null;
    bio: string | null;
    avatar_url: string | null;
    title: string | null;
    website: string | null;
    linkedin_url: string | null;
    twitter_url: string | null;
    role: string | null;
}

export function AdminSettingsClient({ initialProfile }: { initialProfile: Profile | null }) {
    const [profile, setProfile] = useState({
        full_name: initialProfile?.full_name || '',
        username: initialProfile?.username || '',
        email: initialProfile?.email || '',
        bio: initialProfile?.bio || '',
        title: initialProfile?.title || '',
        website: initialProfile?.website || '',
        linkedin_url: initialProfile?.linkedin_url || '',
        twitter_url: initialProfile?.twitter_url || '',
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialProfile?.avatar_url || null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Utilisateur non authentifié');
            }

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name || null,
                    username: profile.username,
                    bio: profile.bio || null,
                    title: profile.title || null,
                    website: profile.website || null,
                    linkedin_url: profile.linkedin_url || null,
                    twitter_url: profile.twitter_url || null,
                })
                .eq('id', user.id);

            if (error) throw error;

            setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
        } catch (error: any) {
            console.error('Error updating profile:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour du profil' });
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'L\'image est trop volumineuse (max 5MB)' });
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleUploadAvatar = async () => {
        if (!avatarFile) return;

        setUploadingAvatar(true);
        setMessage(null);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('Utilisateur non authentifié');
            }

            // Upload vers Supabase Storage
            const fileExt = avatarFile.name.split('.').pop();
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, {
                    cacheControl: '3600',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Récupérer l'URL publique
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            // Mettre à jour le profil
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id);

            if (updateError) throw updateError;

            setMessage({ type: 'success', text: 'Avatar mis à jour avec succès' });
            setAvatarFile(null);
        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors du téléchargement de l\'avatar' });
        } finally {
            setUploadingAvatar(false);
        }
    };

    const getDicebearAvatarUrl = (username: string) => {
        return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;
    };

    const avatarUrl = avatarPreview || initialProfile?.avatar_url || getDicebearAvatarUrl(initialProfile?.username || 'admin');

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'admin
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Mon Profil Admin</h1>
                <p className="text-gray-600 mt-1">Complétez et gérez les informations de votre profil administrateur</p>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Section Avatar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Photo de profil</h2>
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                        />
                        {avatarPreview && avatarPreview !== initialProfile?.avatar_url && (
                            <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                                <Check className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Changer la photo
                        </label>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    className="hidden"
                                />
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                    <Upload className="w-4 h-4" />
                                    Choisir une image
                                </span>
                            </label>
                            {avatarFile && (
                                <button
                                    onClick={handleUploadAvatar}
                                    disabled={uploadingAvatar}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploadingAvatar ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Upload...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Enregistrer
                                        </>
                                    )}
                                </button>
                            )}
                            {avatarFile && (
                                <button
                                    onClick={() => {
                                        setAvatarFile(null);
                                        setAvatarPreview(initialProfile?.avatar_url || null);
                                    }}
                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">JPG, PNG ou GIF (max 5MB)</p>
                    </div>
                </div>
            </div>

            {/* Informations personnelles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations personnelles</h2>
                <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom complet *
                            </label>
                            <input
                                type="text"
                                value={profile.full_name}
                                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Username *
                            </label>
                            <input
                                type="text"
                                value={profile.username}
                                onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="johndoe"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={profile.email || ''}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre / Fonction
                        </label>
                        <input
                            type="text"
                            value={profile.title || ''}
                            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Administrateur système"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bio
                        </label>
                        <textarea
                            value={profile.bio || ''}
                            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Quelques mots sur vous..."
                        />
                    </div>
                </div>
            </div>

            {/* Liens sociaux */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Liens sociaux</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Site web
                        </label>
                        <input
                            type="url"
                            value={profile.website || ''}
                            onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="https://example.com"
                        />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                LinkedIn
                            </label>
                            <input
                                type="url"
                                value={profile.linkedin_url || ''}
                                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Twitter
                            </label>
                            <input
                                type="url"
                                value={profile.twitter_url || ''}
                                onChange={(e) => setProfile({ ...profile, twitter_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bouton sauvegarder */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Enregistrer les modifications
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

