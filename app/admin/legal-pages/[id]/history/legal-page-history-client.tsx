'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Clock, User } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Version {
    id: string;
    version_number: number;
    content: string;
    change_note: string | null;
    created_at: string;
    created_by: string | null;
}

interface LegalPage {
    id: string;
    title: string;
    slug: string;
    content: string;
}

export function LegalPageHistoryClient({ params }: { params: Promise<{ id: string }> }) {
    const [pageId, setPageId] = useState<string>('');
    const [page, setPage] = useState<LegalPage | null>(null);
    const [versions, setVersions] = useState<Version[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
    const [showDiff, setShowDiff] = useState(false);

    useEffect(() => {
        params.then(({ id }) => {
            setPageId(id);
            loadData(id);
        });
    }, [params]);

    const loadData = async (id: string) => {
        try {
            const supabase = createClient();

            // Charger la page
            const { data: pageData, error: pageError } = await supabase
                .from('legal_pages')
                .select('*')
                .eq('id', id)
                .single();

            if (pageError) throw pageError;
            setPage(pageData);

            // Charger les versions
            const { data: versionsData, error: versionsError } = await supabase
                .from('legal_page_versions')
                .select('*')
                .eq('page_id', id)
                .order('version_number', { ascending: false });

            if (versionsError) throw versionsError;
            setVersions(versionsData || []);
        } catch (error) {
            console.error('Error loading history:', error);
        } finally {
            setLoading(false);
        }
    };

    const restoreVersion = async (version: Version) => {
        if (!confirm(`Restaurer la version ${version.version_number} ?`)) return;

        try {
            const supabase = createClient();
            const { error } = await supabase
                .from('legal_pages')
                .update({ content: version.content })
                .eq('id', pageId);

            if (error) throw error;

            alert('Version restaurée avec succès');
            loadData(pageId);
        } catch (error) {
            console.error('Error restoring version:', error);
            alert('Erreur lors de la restauration');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
            </div>
        );
    }

    if (!page) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600 mb-4">Page non trouvée</p>
                <Link href="/admin/legal-pages" className="text-[#1E3A8A] hover:underline">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/legal-pages"
                    className="p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-lg transition-colors"
                    aria-label="Retour"
                >
                    <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                </Link>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Historique des versions
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                        {page.title} ({versions.length} versions)
                    </p>
                </div>
            </div>

            {/* Versions List */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                <div className="divide-y divide-gray-200">
                    {/* Version actuelle */}
                    <div className="p-6 bg-blue-50 border-l-4 border-blue-500">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded">
                                        ACTUELLE
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        {formatDate(page.content ? new Date().toISOString() : '')}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700">
                                    Version actuelle de la page
                                </p>
                            </div>
                            <Link
                                href={`/admin/legal-pages/${pageId}/edit`}
                                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Éditer
                            </Link>
                        </div>
                    </div>

                    {/* Versions précédentes */}
                    {versions.map((version) => (
                        <div
                            key={version.id}
                            className={`p-6 hover:bg-gray-50 transition-colors ${
                                selectedVersion?.id === version.id ? 'bg-blue-50' : ''
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-gray-600 text-white text-xs font-bold rounded">
                                            V{version.version_number}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                            {formatDate(version.created_at)}
                                        </span>
                                        {version.change_note && (
                                            <span className="text-xs text-gray-500 italic">
                                                {version.change_note}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <User className="w-3 h-3" aria-hidden="true" />
                                        <span>Modifié par utilisateur</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setSelectedVersion(version)}
                                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        {selectedVersion?.id === version.id ? 'Masquer' : 'Voir'}
                                    </button>
                                    <button
                                        onClick={() => restoreVersion(version)}
                                        className="px-4 py-2 text-sm bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center gap-2"
                                    >
                                        <RotateCcw className="w-4 h-4" aria-hidden="true" />
                                        Restaurer
                                    </button>
                                </div>
                            </div>

                            {/* Contenu de la version */}
                            {selectedVersion?.id === version.id && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                                            {version.content}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {versions.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" aria-hidden="true" />
                        <p>Aucune version précédente</p>
                    </div>
                )}
            </div>
        </div>
    );
}

