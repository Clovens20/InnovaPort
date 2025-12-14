"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ProjectPreview } from "./project-preview";
import { Loader2, CheckCircle2, Cloud, Upload, X } from "lucide-react";
import Link from "next/link";
import { getAppDomain } from "@/lib/constants";

export default function ProjectForm() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [projectId, setProjectId] = useState<string | null>(null);
    
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        shortDescription: "",
        fullDescription: "",
        problem: "",
        technologies: [] as string[],
        clientType: "personal",
        clientName: "",
        durationValue: "",
        durationUnit: "weeks",
        projectUrl: "",
        tags: "",
        image: null as string | null,
        featured: false,
        published: false
    });

    const [techInput, setTechInput] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 1500);
        }, 30000);

        return () => clearInterval(timer);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTechKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && techInput.trim()) {
            e.preventDefault();
            setFormData(prev => ({
                ...prev,
                technologies: [...prev.technologies, techInput.trim()]
            }));
            setTechInput("");
        }
    };

    const removeTech = (techToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            technologies: prev.technologies.filter(t => t !== techToRemove)
        }));
    };

    const handleImageSelect = (file: File) => {
        if (file.size > 5 * 1024 * 1024) {
            setError("L'image est trop grande. Taille maximale : 5MB");
            return;
        }

        const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setError("Format non supporté. Utilisez PNG, JPG ou WebP");
            return;
        }

        setImageFile(file);
        setError(null);

        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setFormData(prev => ({ ...prev, image: result }));
        };
        reader.readAsDataURL(file);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleImageSelect(file);
        }
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, image: null }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Générer le slug automatiquement depuis le titre
    useEffect(() => {
        if (formData.title) {
            const slug = formData.title
                .toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');
            setFormData(prev => ({ ...prev, slug }));
        }
    }, [formData.title]);

    const handleSave = async (published: boolean = false) => {
        // Validation
        if (!formData.title) {
            setError("Le nom du projet est requis");
            return;
        }

        if (!formData.slug) {
            setError("Le slug du projet est requis");
            return;
        }
        
        if (!formData.projectUrl) {
            setError("L'URL du projet en ligne est requise");
            return;
        }

        if (formData.clientType === 'professional' && !formData.clientName) {
            setError("Le nom du client est requis pour un projet professionnel");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                ...(projectId && { id: projectId }),
                title: formData.title,
                slug: formData.slug,
                category: formData.category || null,
                short_description: formData.shortDescription || null,
                full_description: formData.fullDescription || null,
                problem: formData.problem || null,
                technologies: formData.technologies,
                client_type: formData.clientType,
                client_name: formData.clientName || null,
                duration_value: formData.durationValue ? parseInt(formData.durationValue) : null,
                duration_unit: formData.durationUnit,
                project_url: formData.projectUrl || null,
                tags: formData.tags || null,
                image_url: formData.image || null,
                featured: formData.featured,
                published: published,
            };

            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la sauvegarde');
            }

            setProjectId(data.project.id);
            setSuccess(published ? 'Projet ajouté au portfolio avec succès !' : 'Projet enregistré en brouillon');
            
            if (published) {
                setTimeout(() => {
                    router.push('/dashboard/projects');
                    router.refresh();
                }, 1500);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Ajouter un Projet</h1>
                    <p className="text-gray-600 mt-1">Ajoutez un projet existant à votre portfolio pour le présenter à vos clients</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                    {isSubmitting ? (
                        <span className="flex items-center gap-2 text-blue-600 font-medium">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enregistrement...
                        </span>
                    ) : success ? (
                        <span className="flex items-center gap-2 text-green-600 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            {success}
                        </span>
                    ) : (
                        <span className="flex items-center gap-2 text-gray-500">
                            <Cloud className="w-4 h-4" />
                            Non sauvegardé
                        </span>
                    )}
                </div>
            </div>

            {/* Messages d'erreur/succès */}
            {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section 1: Informations générales */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Informations du projet</h2>
                            <p className="text-sm text-gray-500">
                                Remplissez les informations d'un projet que vous avez déjà développé
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du projet *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: AMORA - Application de rencontres"
                                />
                                <p className="mt-1 text-xs text-gray-500">Le nom du projet tel qu'il apparaîtra sur votre portfolio</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL du projet en ligne *</label>
                                <input
                                    type="url"
                                    name="projectUrl"
                                    value={formData.projectUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                    placeholder="https://mon-projet.com"
                                />
                                <p className="mt-1 text-xs text-gray-500">Lien vers le projet en production ou sur GitHub</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL de la page projet</label>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2 bg-gray-50 p-3 border border-r-0 border-gray-300 rounded-l-lg">
                                        {getAppDomain()}/project/
                                    </span>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-gray-50"
                                        placeholder="amora-application-rencontres"
                                        readOnly
                                    />
                                </div>
                                <p className="mt-1 text-xs text-gray-500">Généré automatiquement depuis le nom du projet</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de projet *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    required
                                >
                                    <option value="">Sélectionner un type</option>
                                    <option value="web_app">Application Web</option>
                                    <option value="mobile_app">Application Mobile</option>
                                    <option value="website">Site Web Vitrine</option>
                                    <option value="ecommerce">E-commerce</option>
                                    <option value="api">API / Backend</option>
                                    <option value="other">Autre</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description courte *</label>
                                <textarea
                                    name="shortDescription"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    rows={2}
                                    maxLength={150}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    placeholder="Application de rencontres multiculturelles avec matching intelligent et chat temps réel"
                                    required
                                />
                                <p className="mt-1 text-sm text-gray-500 text-right">{formData.shortDescription.length}/150 caractères</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description complète *</label>
                                <textarea
                                    name="fullDescription"
                                    value={formData.fullDescription}
                                    onChange={handleChange}
                                    rows={8}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                                    placeholder="Décrivez le projet en détail : contexte, fonctionnalités, technologies..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Contexte et défis</label>
                                <textarea
                                    name="problem"
                                    value={formData.problem}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    placeholder="Décrivez le contexte du projet et les défis rencontrés..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Technologies */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Technologies utilisées et contexte</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies utilisées *</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.technologies.map(tech => (
                                        <span key={tech} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-600 text-white">
                                            {tech}
                                            <button onClick={() => removeTech(tech)} className="ml-2 hover:text-red-200">×</button>
                                        </span>
                                    ))}
                                </div>
                                <input
                                    type="text"
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    onKeyDown={handleTechKeyDown}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    placeholder="Ex: React, Node.js, MongoDB... (Entrée pour ajouter)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de projet *</label>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600/50" style={{ borderColor: formData.clientType === 'personal' ? '#2563EB' : '#E5E7EB' }}>
                                        <input type="radio" name="clientType" value="personal" checked={formData.clientType === 'personal'} onChange={handleChange} className="mt-1 mr-3 w-4 h-4 text-blue-600 focus:ring-blue-600" />
                                        <div>
                                            <span className="font-medium text-gray-900 block">Projet personnel</span>
                                            <span className="text-xs text-gray-500">Vos propres projets</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600/50" style={{ borderColor: formData.clientType === 'professional' ? '#2563EB' : '#E5E7EB' }}>
                                        <input type="radio" name="clientType" value="professional" checked={formData.clientType === 'professional'} onChange={handleChange} className="mt-1 mr-3 w-4 h-4 text-blue-600 focus:ring-blue-600" />
                                        <div>
                                            <span className="font-medium text-gray-900 block">Projet client</span>
                                            <span className="text-xs text-gray-500">Développé pour un client</span>
                                        </div>
                                    </label>
                                    <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-blue-600/50" style={{ borderColor: formData.clientType === 'open_source' ? '#2563EB' : '#E5E7EB' }}>
                                        <input type="radio" name="clientType" value="open_source" checked={formData.clientType === 'open_source'} onChange={handleChange} className="mt-1 mr-3 w-4 h-4 text-blue-600 focus:ring-blue-600" />
                                        <div>
                                            <span className="font-medium text-gray-900 block">Open source</span>
                                            <span className="text-xs text-gray-500">Contribution open source</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {formData.clientType === 'professional' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Client / Entreprise *</label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                        placeholder="Nom de l'entreprise ou du client"
                                        required={formData.clientType === 'professional'}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Durée de développement (optionnel)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        name="durationValue"
                                        value={formData.durationValue}
                                        onChange={handleChange}
                                        className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                        placeholder="4"
                                    />
                                    <select
                                        name="durationUnit"
                                        value={formData.durationUnit}
                                        onChange={handleChange}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none"
                                    >
                                        <option value="weeks">semaines</option>
                                        <option value="months">mois</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Images */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Image de présentation</h2>
                        <p className="text-sm text-gray-500 mb-6">Ajoutez une image représentative du projet</p>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileInputChange}
                            accept="image/png,image/jpeg,image/jpg,image/webp"
                            className="hidden"
                        />

                        {imagePreview ? (
                            <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden">
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="w-full h-64 object-cover"
                                />
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                    type="button"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                                    {imageFile?.name} ({(imageFile?.size ? (imageFile.size / 1024 / 1024).toFixed(2) : '0')} MB)
                                </div>
                            </div>
                        ) : (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleBrowseClick}
                                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors cursor-pointer group ${
                                    isDragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                                }`}
                            >
                                <div className="space-y-4">
                                    <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-gray-900">Glissez vos images ici</p>
                                        <p className="text-sm text-gray-500">ou</p>
                                        <button
                                            type="button"
                                            className="mt-2 text-blue-600 hover:underline font-medium"
                                        >
                                            Parcourir les fichiers
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500">PNG, JPG, WebP jusqu'à 5MB</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Section 4: Paramètres */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Visibilité sur votre portfolio</h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900">Projet en vedette</p>
                                    <p className="text-sm text-gray-500">Afficher ce projet en premier sur votre portfolio</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData(p => ({ ...p, featured: e.target.checked }))}
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-600 rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-blue-50 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors border-2 border-blue-200">
                                <div>
                                    <p className="font-semibold text-gray-900">Publier sur le portfolio</p>
                                    <p className="text-sm text-gray-600">Rendre ce projet visible sur votre portfolio public</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(e) => setFormData(p => ({ ...p, published: e.target.checked }))}
                                    className="w-5 h-5 text-blue-600 focus:ring-blue-600 rounded"
                                />
                            </label>
                        </div>
                    </div>

                </div>

                {/* Preview Column */}
                <div className="hidden lg:block">
                    <ProjectPreview data={formData} />
                </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-6 z-20 shadow-2xl">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
                    <Link 
                        href="/dashboard/projects" 
                        className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                    >
                        Annuler
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={() => handleSave(true)}
                            disabled={isSubmitting || !formData.title || !formData.slug || !formData.projectUrl}
                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Publication en cours...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                    Publier le projet
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}