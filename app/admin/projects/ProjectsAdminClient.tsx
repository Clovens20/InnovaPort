'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    EyeOff, 
    Star, 
    StarOff, 
    ExternalLink,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    XCircle,
    Calendar,
    User
} from 'lucide-react';
import Image from 'next/image';

interface Project {
    id: string;
    user_id: string;
    title: string;
    slug: string;
    category: string | null;
    short_description: string | null;
    image_url: string | null;
    published: boolean;
    featured: boolean;
    project_url: string | null;
    created_at: string;
    updated_at: string;
    profiles: {
        id: string;
        username: string;
        full_name: string | null;
        email: string | null;
    };
}

interface User {
    id: string;
    username: string;
    full_name: string | null;
    email: string | null;
}

export function ProjectsAdminClient({
    initialProjects,
    totalProjects,
    publishedProjects,
    featuredProjects,
    users,
}: {
    initialProjects: Project[];
    totalProjects: number;
    publishedProjects: number;
    featuredProjects: number;
    users: User[];
}) {
    const router = useRouter();
    const supabase = createClient();
    const [projects, setProjects] = useState<Project[]>(initialProjects);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>(initialProjects);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUserId, setSelectedUserId] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'unpublished'>('all');
    const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'not-featured'>('all');

    // Filtrer les projets
    useEffect(() => {
        let filtered = [...projects];

        // Recherche par titre ou description
        if (searchTerm) {
            filtered = filtered.filter(project =>
                project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.short_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                project.category?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtre par utilisateur
        if (selectedUserId !== 'all') {
            filtered = filtered.filter(project => project.user_id === selectedUserId);
        }

        // Filtre par statut de publication
        if (statusFilter === 'published') {
            filtered = filtered.filter(project => project.published);
        } else if (statusFilter === 'unpublished') {
            filtered = filtered.filter(project => !project.published);
        }

        // Filtre par featured
        if (featuredFilter === 'featured') {
            filtered = filtered.filter(project => project.featured);
        } else if (featuredFilter === 'not-featured') {
            filtered = filtered.filter(project => !project.featured);
        }

        setFilteredProjects(filtered);
    }, [projects, searchTerm, selectedUserId, statusFilter, featuredFilter]);

    const handleTogglePublished = async (projectId: string, currentStatus: boolean) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({ published: !currentStatus })
                .eq('id', projectId);

            if (error) throw error;

            setProjects(projects.map(p => 
                p.id === projectId ? { ...p, published: !currentStatus } : p
            ));
        } catch (error) {
            console.error('Error toggling published status:', error);
            alert('Erreur lors de la modification du statut de publication');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleFeatured = async (projectId: string, currentStatus: boolean) => {
        setLoading(true);
        try {
            const { error } = await supabase
                .from('projects')
                .update({ featured: !currentStatus })
                .eq('id', projectId);

            if (error) throw error;

            setProjects(projects.map(p => 
                p.id === projectId ? { ...p, featured: !currentStatus } : p
            ));
        } catch (error) {
            console.error('Error toggling featured status:', error);
            alert('Erreur lors de la modification du statut featured');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId: string, projectTitle: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le projet "${projectTitle}" ? Cette action est irréversible.`)) {
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            setProjects(projects.filter(p => p.id !== projectId));
            alert('Projet supprimé avec succès');
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Erreur lors de la suppression du projet');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-8 px-6">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour à l'admin
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Gestion des Projets</h1>
                            <p className="text-gray-600 mt-1">Gérez tous les projets de tous les développeurs</p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{filteredProjects.length}</div>
                            <div className="text-sm text-gray-500">projets trouvés</div>
                        </div>
                    </div>
                </div>

                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-600 mb-1">Total projets</div>
                        <div className="text-2xl font-bold text-gray-900">{totalProjects}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-600 mb-1">Publiés</div>
                        <div className="text-2xl font-bold text-green-600">{publishedProjects}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-600 mb-1">Non publiés</div>
                        <div className="text-2xl font-bold text-gray-600">{totalProjects - publishedProjects}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                        <div className="text-sm text-gray-600 mb-1">En vedette</div>
                        <div className="text-2xl font-bold text-yellow-600">{featuredProjects}</div>
                    </div>
                </div>

                {/* Filtres */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Recherche */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher un projet..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Filtre utilisateur */}
                        <div>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous les développeurs</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.full_name || user.username || user.email}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Filtre statut */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="published">Publiés</option>
                                <option value="unpublished">Non publiés</option>
                            </select>
                        </div>

                        {/* Filtre featured */}
                        <div>
                            <select
                                value={featuredFilter}
                                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="all">Tous</option>
                                <option value="featured">En vedette</option>
                                <option value="not-featured">Non en vedette</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Liste des projets */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    )}
                    
                    {filteredProjects.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">Aucun projet trouvé</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Projet</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Développeur</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    {project.image_url && (
                                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                            <img
                                                                src={project.image_url}
                                                                alt={project.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="text-sm font-semibold text-gray-900 truncate">
                                                                {project.title}
                                                            </h3>
                                                            {project.featured && (
                                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-500 truncate">
                                                            {project.short_description || project.category || 'Aucune description'}
                                                        </p>
                                                        {project.project_url && (
                                                            <a
                                                                href={project.project_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-1"
                                                            >
                                                                <ExternalLink className="w-3 h-3" />
                                                                Visiter
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="w-4 h-4 text-gray-400" />
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {project.profiles.full_name || project.profiles.username}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            @{project.profiles.username}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    {project.published ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            Publié
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                                            <XCircle className="w-3 h-3" />
                                                            Non publié
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(project.created_at)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleTogglePublished(project.id, project.published)}
                                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title={project.published ? 'Dépublier' : 'Publier'}
                                                    >
                                                        {project.published ? (
                                                            <EyeOff className="w-4 h-4" />
                                                        ) : (
                                                            <Eye className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleToggleFeatured(project.id, project.featured)}
                                                        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                        title={project.featured ? 'Retirer de la vedette' : 'Mettre en vedette'}
                                                    >
                                                        {project.featured ? (
                                                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                        ) : (
                                                            <StarOff className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(project.id, project.title)}
                                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

