'use client';

import Link from 'next/link';
import { Plus, Eye, Edit, CheckCircle2, Clock, ExternalLink, Sparkles } from 'lucide-react';
export function ProjectsPageClient({ projects }: { projects: any[] }) {

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
                        {projects.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                                {projects.length} projet{projects.length > 1 ? 's' : ''} actif{projects.length > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
                <p className="text-gray-600 ml-14">
                    Gérez vos projets et partagez-les avec vos clients
                </p>
            </div>

            {/* Liste des projets */}
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all overflow-hidden group"
                        >
                            {/* Image ou placeholder */}
                            <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
                                {project.image_url ? (
                                    <img
                                        src={project.image_url}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <div className="text-center">
                                            <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                                                <Eye className="w-8 h-8 text-primary" />
                                            </div>
                                            <p className="text-sm text-gray-500">Aucune image</p>
                                        </div>
                                    </div>
                                )}
                                {/* Badge statut */}
                                <div className="absolute top-3 right-3">
                                    {project.published ? (
                                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Publié
                                        </span>
                                    ) : (
                                        <span className="px-3 py-1 bg-gray-500 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Brouillon
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Contenu */}
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                                            {project.title || 'Sans titre'}
                                        </h3>
                                        {project.category && (
                                            <p className="text-sm text-gray-500">{project.category}</p>
                                        )}
                                    </div>
                                </div>

                                {project.short_description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                        {project.short_description}
                                    </p>
                                )}

                                {/* Technologies */}
                                {project.technologies && project.technologies.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {project.technologies.slice(0, 3).map((tech: string, idx: number) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded font-medium"
                                            >
                                                {tech}
                                            </span>
                                        ))}
                                        {project.technologies.length > 3 && (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                                                +{project.technologies.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/dashboard/projects/${project.id}/edit`}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Modifier
                                    </Link>
                                    {project.published && (
                                        <a
                                            href={`/${project.slug || project.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors text-sm font-medium flex items-center gap-2"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Voir
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Plus className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Commencez à créer vos projets</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Ajoutez votre premier projet pour le partager avec vos clients et le mettre en avant sur votre portfolio.
                    </p>
                    <Link
                        href="/dashboard/projects/new"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-semibold text-lg"
                    >
                        <Plus className="w-6 h-6" />
                        Ajouter mon premier projet
                    </Link>
                </div>
            )}
        </div>
    );
}

