'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Eye, X, CheckCircle, Clock, FileText, Settings } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Editor from '@monaco-editor/react';

interface LegalPage {
    id: string;
    slug: string;
    title: string;
    content: string;
    meta_title: string | null;
    meta_description: string | null;
    status: 'draft' | 'published';
    template_id: string;
    major_changes: boolean;
    published_at: string | null;
    scheduled_publish_at: string | null;
}

export function LegalPageEditorClient({ params }: { params: Promise<{ id: string }> }) {
    const [pageId, setPageId] = useState<string>('');
    const [page, setPage] = useState<LegalPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [metaTitle, setMetaTitle] = useState('');
    const [metaDescription, setMetaDescription] = useState('');
    const [status, setStatus] = useState<'draft' | 'published'>('draft');
    const [majorChanges, setMajorChanges] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [wordCount, setWordCount] = useState(0);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();

    useEffect(() => {
        params.then(({ id }) => {
            setPageId(id);
            loadPage(id);
        });
    }, [params]);

    useEffect(() => {
        // Calculer le nombre de mots
        const words = content.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
    }, [content]);

    useEffect(() => {
        // Auto-sauvegarde toutes les 30 secondes
        if (pageId && content) {
            autoSaveIntervalRef.current = setInterval(() => {
                savePage(true); // Auto-save silencieux
            }, 30000); // 30 secondes
        }

        return () => {
            if (autoSaveIntervalRef.current) {
                clearInterval(autoSaveIntervalRef.current);
            }
        };
    }, [pageId, content]);

    const loadPage = async (id: string) => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('legal_pages')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;

            if (data) {
                setPage(data);
                setContent(data.content);
                setTitle(data.title);
                setMetaTitle(data.meta_title || '');
                setMetaDescription(data.meta_description || '');
                setStatus(data.status);
                setMajorChanges(data.major_changes || false);
            }
        } catch (error) {
            console.error('Error loading page:', error);
        } finally {
            setLoading(false);
        }
    };

    const savePage = async (isAutoSave = false) => {
        if (!pageId) return;

        setSaving(true);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            const updateData: any = {
                content,
                title,
                meta_title: metaTitle || null,
                meta_description: metaDescription || null,
                status,
                major_changes: majorChanges,
                updated_at: new Date().toISOString(),
                last_updated_by: user?.id || null,
            };

            if (status === 'published' && !page?.published_at) {
                updateData.published_at = new Date().toISOString();
            }

            const { error } = await supabase
                .from('legal_pages')
                .update(updateData)
                .eq('id', pageId);

            if (error) throw error;

            if (!isAutoSave) {
                setLastSaved(new Date());
                // Recharger la page pour avoir les dernières données
                await loadPage(pageId);
            }
        } catch (error) {
            console.error('Error saving page:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-96 bg-gray-200 rounded"></div>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/legal-pages"
                        className="p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-lg transition-colors"
                        aria-label="Retour"
                    >
                        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
                    </Link>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Éditer la page</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Slug: <code className="bg-gray-100 px-2 py-1 rounded">/{page.slug}</code>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {lastSaved && (
                        <span className="text-xs text-gray-500 hidden sm:inline">
                            Sauvegardé à {lastSaved.toLocaleTimeString('fr-FR')}
                        </span>
                    )}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:inline">Prévisualiser</span>
                    </button>
                    <button
                        onClick={() => savePage(false)}
                        disabled={saving}
                        className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Clock className="w-4 h-4 animate-spin" aria-hidden="true" />
                                <span>Sauvegarde...</span>
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" aria-hidden="true" />
                                <span>Sauvegarder</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Split View: Editor + Preview */}
            <div className={`grid ${showPreview ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
                {/* Editor Panel */}
                <div className="space-y-4">
                    {/* Métadonnées */}
                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-5 h-5 text-gray-600" aria-hidden="true" />
                            <h2 className="font-semibold text-gray-900">Métadonnées</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Titre de la page
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Title (SEO)
                                </label>
                                <input
                                    type="text"
                                    value={metaTitle}
                                    onChange={(e) => setMetaTitle(e.target.value)}
                                    placeholder="Titre pour les moteurs de recherche"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Meta Description (SEO)
                                </label>
                                <textarea
                                    value={metaDescription}
                                    onChange={(e) => setMetaDescription(e.target.value)}
                                    placeholder="Description pour les moteurs de recherche"
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Statut
                                    </label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                                    >
                                        <option value="draft">Brouillon</option>
                                        <option value="published">Publié</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="major-changes"
                                        checked={majorChanges}
                                        onChange={(e) => setMajorChanges(e.target.checked)}
                                        className="w-4 h-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]"
                                    />
                                    <label htmlFor="major-changes" className="text-sm text-gray-700">
                                        Changements majeurs
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Éditeur */}
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />
                                <h2 className="font-semibold text-gray-900">Contenu (Markdown)</h2>
                            </div>
                            <div className="text-xs text-gray-500">
                                {wordCount} mots
                            </div>
                        </div>
                        <div className="h-[600px]">
                            <Editor
                                height="100%"
                                defaultLanguage="markdown"
                                value={content}
                                onChange={(value) => setContent(value || '')}
                                theme="vs-light"
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    wordWrap: 'on',
                                    lineNumbers: 'on',
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Preview Panel */}
                {showPreview && (
                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="font-semibold text-gray-900">Aperçu</h2>
                            <button
                                onClick={() => setShowPreview(false)}
                                className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                                aria-label="Fermer l'aperçu"
                            >
                                <X className="w-5 h-5" aria-hidden="true" />
                            </button>
                        </div>
                        <div className="p-6 h-[600px] overflow-y-auto prose prose-lg max-w-none">
                            <h1>{title}</h1>
                            <div className="markdown-content" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

