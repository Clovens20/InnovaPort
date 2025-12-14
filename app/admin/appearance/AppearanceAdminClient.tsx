'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Palette, Upload, Image as ImageIcon } from 'lucide-react';

export function AppearanceAdminClient() {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [appearance, setAppearance] = useState({
        primaryColor: '#1E3A8A',
        secondaryColor: '#10B981',
        logoUrl: '/innovaport-logo.png',
        faviconUrl: '/innovaport-logo.png',
    });

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // TODO: Implémenter la sauvegarde dans la base de données
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Apparence mise à jour avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la mise à jour' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto py-8 px-6">
            <Link
                href="/admin"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <ArrowLeft className="w-4 h-4" />
                Retour à l'admin
            </Link>

            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Apparence</h1>
                <p className="text-gray-600 mt-1">Gérez les couleurs, logos et favicon du site</p>
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

            <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Couleurs */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Couleurs</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Couleur primaire
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={appearance.primaryColor}
                                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={appearance.primaryColor}
                                    onChange={(e) => setAppearance({ ...appearance, primaryColor: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Couleur secondaire
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={appearance.secondaryColor}
                                    onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
                                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                                />
                                <input
                                    type="text"
                                    value={appearance.secondaryColor}
                                    onChange={(e) => setAppearance({ ...appearance, secondaryColor: e.target.value })}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <ImageIcon className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Logos & Favicon</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Logo principal
                            </label>
                            <div className="flex items-center gap-4">
                                <img 
                                    src={appearance.logoUrl} 
                                    alt="Logo" 
                                    className="h-16 object-contain"
                                />
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Changer
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Favicon
                            </label>
                            <div className="flex items-center gap-4">
                                <img 
                                    src={appearance.faviconUrl} 
                                    alt="Favicon" 
                                    className="h-8 w-8 object-contain"
                                />
                                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                                    <Upload className="w-4 h-4" />
                                    Changer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {saving ? (
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

