"use client";

import { useState, useEffect } from "react";
import { ProjectPreview } from "./project-preview";
import { Loader2, Save, X, Eye, Trash2, Upload, Cloud } from "lucide-react";
import Link from "next/link";

export default function ProjectForm() {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        shortDescription: "",
        fullDescription: "",
        problem: "",
        technologies: [] as string[],
        clientType: "personal", // personal, professional, open_source
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

    // Simulated Auto-save
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

    return (
        <div className="max-w-7xl mx-auto pb-24">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nouveau Projet</h1>
                    <p className="text-gray-500">Créez une nouvelle entrée pour votre portfolio</p>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    {isSaving ? (
                        <span className="flex items-center gap-2 text-primary">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Enregistrement...
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Cloud className="w-4 h-4" />
                            Enregistré
                        </span>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Section 1: Informations générales */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Informations générales</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Titre du projet *</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Ex: Application de gestion de tâches"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL du projet</label>
                                <div className="flex items-center">
                                    <span className="text-sm text-gray-500 mr-2 bg-gray-50 p-3 border border-r-0 border-gray-300 rounded-l-lg">
                                        innovaport.com/project/
                                    </span>
                                    <input
                                        type="text"
                                        name="slug"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                        placeholder="application-gestion"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">Sélectionner une catégorie</option>
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Résumé en une phrase pour la grille de projets"
                                />
                                <p className="mt-1 text-sm text-gray-500 text-right">{formData.shortDescription.length}/150 caractères</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description complète *</label>
                                <div className="border border-gray-300 rounded-lg min-h-[300px] bg-gray-50 flex items-center justify-center text-gray-400">
                                    {/* Placeholder for Tiptap */}
                                    <p>Éditeur de texte riche (Tiptap) ici</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Problématique résolue</label>
                                <textarea
                                    name="problem"
                                    value={formData.problem}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Quel problème ce projet résout-il ?"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Technologies et client */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Technologies et contexte</h2>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Technologies utilisées *</label>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    {formData.technologies.map(tech => (
                                        <span key={tech} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary text-white">
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="Ajouter une technologie (Entrée pour valider)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type de client</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" name="clientType" value="personal" checked={formData.clientType === 'personal'} onChange={handleChange} className="mr-3 w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Projet personnel</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" name="clientType" value="professional" checked={formData.clientType === 'professional'} onChange={handleChange} className="mr-3 w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Professionnel</span>
                                    </label>
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" name="clientType" value="open_source" checked={formData.clientType === 'open_source'} onChange={handleChange} className="mr-3 w-4 h-4 text-primary focus:ring-primary" />
                                        <span>Open source</span>
                                    </label>
                                </div>
                            </div>

                            {formData.clientType === 'professional' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Nom du client</label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Nom de l'entreprise ou du client"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Durée du projet</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        name="durationValue"
                                        value={formData.durationValue}
                                        onChange={handleChange}
                                        className="w-24 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="4"
                                    />
                                    <select
                                        name="durationUnit"
                                        value={formData.durationUnit}
                                        onChange={handleChange}
                                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option value="weeks">semaines</option>
                                        <option value="months">mois</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Lien du projet en ligne</label>
                                <input
                                    type="url"
                                    name="projectUrl"
                                    value={formData.projectUrl}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                                    placeholder="https://mon-projet.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Images */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Visuels du projet</h2>
                        <p className="text-sm text-gray-500 mb-6">Ajoutez entre 1 et 10 images. La première sera l'image principale.</p>

                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary hover:bg-blue-50 transition-colors cursor-pointer group">
                            <div className="space-y-4">
                                <div className="mx-auto w-16 h-16 bg-blue-100 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Upload className="w-8 h-8" />
                                </div>
                                <div>
                                    <p className="text-base font-medium text-gray-900">Glissez vos images ici</p>
                                    <p className="text-sm text-gray-500">ou</p>
                                    <button className="mt-2 text-primary hover:underline font-medium">Parcourir les fichiers</button>
                                </div>
                                <p className="text-xs text-gray-500">PNG, JPG, WebP jusqu'à 5MB</p>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Paramètres */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Paramètres d'affichage</h2>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900">Projet en vedette</p>
                                    <p className="text-sm text-gray-500">Afficher en premier sur votre portfolio</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.featured}
                                    onChange={(e) => setFormData(p => ({ ...p, featured: e.target.checked }))}
                                    className="w-5 h-5 text-primary focus:ring-primary rounded"
                                />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                <div>
                                    <p className="font-medium text-gray-900">Publier le projet</p>
                                    <p className="text-sm text-gray-500">Visible sur votre portfolio public</p>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.published}
                                    onChange={(e) => setFormData(p => ({ ...p, published: e.target.checked }))}
                                    className="w-5 h-5 text-primary focus:ring-primary rounded"
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
            <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 z-20 shadow-lg-up">
                <div className="max-w-7xl mx-auto flex justify-between items-center px-6">
                    <Link href="/dashboard/projects" className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors">
                        Annuler
                    </Link>
                    <div className="flex gap-3">
                        <button
                            onClick={() => alert("Sauvegardé en brouillon")}
                            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Enregistrer comme brouillon
                        </button>
                        <button
                            onClick={() => alert("Projet publié !")}
                            className="px-8 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 font-medium transition-colors shadow-lg shadow-secondary/20"
                        >
                            Publier le projet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
