'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, FileText, Globe } from 'lucide-react';

export function ContentAdminClient() {
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // État pour les contenus des pages
    const [landingContent, setLandingContent] = useState({
        heroTitle: 'Gérez vos Projets & Devis en un clic',
        heroSubtitle: 'La plateforme tout-en-un pour les freelances et agences',
        features: [
            { title: 'Portfolio Personnalisé', description: 'Créez un portfolio professionnel' },
            { title: 'Gestion de Projets', description: 'Organisez tous vos projets' },
            { title: 'Demandes de Devis', description: 'Recevez des devis qualifiés' },
        ]
    });

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            // TODO: Implémenter la sauvegarde dans la base de données
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage({ type: 'success', text: 'Contenu sauvegardé avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
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
                <h1 className="text-3xl font-bold text-gray-900">Pages & Contenu</h1>
                <p className="text-gray-600 mt-1">Gérez le contenu des pages principales du site</p>
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

            <div className="grid md:grid-cols-2 gap-6">
                {/* Page Landing */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Globe className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Page d'accueil (Landing)</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titre principal
                            </label>
                            <input
                                type="text"
                                value={landingContent.heroTitle}
                                onChange={(e) => setLandingContent({ ...landingContent, heroTitle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Sous-titre
                            </label>
                            <input
                                type="text"
                                value={landingContent.heroSubtitle}
                                onChange={(e) => setLandingContent({ ...landingContent, heroSubtitle: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Page Portfolio */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <h2 className="text-xl font-semibold text-gray-900">Page Portfolio</h2>
                    </div>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            La configuration du portfolio se fait au niveau de chaque développeur.
                            Utilisez la page <Link href="/admin/projects" className="text-blue-600 hover:underline">Gestion des Projets</Link> pour gérer les projets.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-end">
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

