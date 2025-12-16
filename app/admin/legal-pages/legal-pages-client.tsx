'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Eye, History, FileText, CheckCircle, Clock, Search } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface LegalPage {
    id: string;
    slug: string;
    title: string;
    status: 'draft' | 'published';
    updated_at: string;
    published_at: string | null;
    last_updated_by: string | null;
}

export function LegalPagesClient() {
    const [pages, setPages] = useState<LegalPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadPages();
    }, []);

    const loadPages = async () => {
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('legal_pages')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) throw error;
            setPages(data || []);
        } catch (error) {
            console.error('Error loading legal pages:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPages = pages.filter(page =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.slug.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Jamais';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" aria-hidden="true" />
                    <input
                        type="text"
                        placeholder="Rechercher une page..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1E3A8A] focus:border-transparent"
                    />
                </div>
                <Link
                    href="/admin/legal-pages/new"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E40AF] transition-colors font-semibold"
                >
                    <Plus className="w-5 h-5" aria-hidden="true" />
                    Nouvelle page
                </Link>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                    Titre
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                    Slug
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                    Dernière modification
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        {searchQuery ? 'Aucune page trouvée' : 'Aucune page légale pour le moment'}
                                    </td>
                                </tr>
                            ) : (
                                filteredPages.map((page) => (
                                    <tr key={page.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <FileText className="w-5 h-5 text-gray-400" aria-hidden="true" />
                                                <span className="font-medium text-gray-900">{page.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <code className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                                /{page.slug}
                                            </code>
                                        </td>
                                        <td className="px-6 py-4">
                                            {page.status === 'published' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                                    <CheckCircle className="w-3 h-3" aria-hidden="true" />
                                                    Publié
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                    <Clock className="w-3 h-3" aria-hidden="true" />
                                                    Brouillon
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(page.updated_at)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/${page.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-lg transition-colors"
                                                    aria-label="Prévisualiser"
                                                >
                                                    <Eye className="w-5 h-5" aria-hidden="true" />
                                                </Link>
                                                <Link
                                                    href={`/admin/legal-pages/${page.id}/history`}
                                                    className="p-2 text-gray-600 hover:text-[#1E3A8A] hover:bg-gray-100 rounded-lg transition-colors"
                                                    aria-label="Historique"
                                                >
                                                    <History className="w-5 h-5" aria-hidden="true" />
                                                </Link>
                                                <Link
                                                    href={`/admin/legal-pages/${page.id}/edit`}
                                                    className="p-2 text-[#1E3A8A] hover:bg-blue-50 rounded-lg transition-colors"
                                                    aria-label="Éditer"
                                                >
                                                    <Edit className="w-5 h-5" aria-hidden="true" />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-900">{pages.length}</div>
                    <div className="text-sm text-gray-600">Pages totales</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-green-600">
                        {pages.filter(p => p.status === 'published').length}
                    </div>
                    <div className="text-sm text-gray-600">Publiées</div>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-2xl font-bold text-gray-600">
                        {pages.filter(p => p.status === 'draft').length}
                    </div>
                    <div className="text-sm text-gray-600">Brouillons</div>
                </div>
            </div>
        </div>
    );
}

