"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Info } from "lucide-react";
import { projectTypes, budgetRanges } from "@/utils/contact-constants";

interface AutoResponseTemplate {
    id?: string;
    name: string;
    enabled: boolean;
    conditions: {
        project_type?: string;
        budget_range?: {
            min?: number;
            max?: number;
        };
    };
    subject: string;
    body_html: string;
}

interface AutoResponseTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    template: AutoResponseTemplate | null;
    onSave: (template: AutoResponseTemplate) => Promise<void>;
}

const AVAILABLE_VARIABLES = [
    { var: "{{clientName}}", desc: "Nom du prospect" },
    { var: "{{projectType}}", desc: "Type de projet" },
    { var: "{{budget}}", desc: "Budget estimé" },
    { var: "{{description}}", desc: "Description du projet" },
    { var: "{{deadline}}", desc: "Délai souhaité" },
    { var: "{{developerName}}", desc: "Votre nom" },
    { var: "{{developerEmail}}", desc: "Votre email" },
];

export default function AutoResponseTemplateModal({
    isOpen,
    onClose,
    template,
    onSave,
}: AutoResponseTemplateModalProps) {
    const [formData, setFormData] = useState<AutoResponseTemplate>({
        name: "",
        enabled: true,
        conditions: {},
        subject: "",
        body_html: "",
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [budgetMin, setBudgetMin] = useState("");
    const [budgetMax, setBudgetMax] = useState("");

    useEffect(() => {
        if (template) {
            setFormData(template);
            if (template.conditions.budget_range) {
                setBudgetMin(template.conditions.budget_range.min?.toString() || "");
                setBudgetMax(template.conditions.budget_range.max?.toString() || "");
            } else {
                setBudgetMin("");
                setBudgetMax("");
            }
        } else {
            setFormData({
                name: "",
                enabled: true,
                conditions: {},
                subject: "",
                body_html: "",
            });
            setBudgetMin("");
            setBudgetMax("");
        }
        setError(null);
    }, [template, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.name.trim()) {
            setError("Le nom du template est requis");
            return;
        }

        if (!formData.subject.trim()) {
            setError("Le sujet de l'email est requis");
            return;
        }

        if (!formData.body_html.trim()) {
            setError("Le corps de l'email est requis");
            return;
        }

        // Construire les conditions
        const conditions: AutoResponseTemplate["conditions"] = {};
        
        if (formData.conditions.project_type) {
            conditions.project_type = formData.conditions.project_type;
        }

        if (budgetMin || budgetMax) {
            conditions.budget_range = {};
            if (budgetMin) {
                conditions.budget_range.min = parseInt(budgetMin, 10);
            }
            if (budgetMax) {
                conditions.budget_range.max = parseInt(budgetMax, 10);
            }
        }

        setSaving(true);
        try {
            await onSave({
                ...formData,
                conditions,
            });
            onClose();
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {template ? "Modifier le template" : "Nouveau template de réponse"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Nom du template */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nom du template *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ex: Projet web, Projet mobile, Budget élevé..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            required
                        />
                    </div>

                    {/* Conditions */}
                    <div className="border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Conditions de déclenchement (optionnel)
                        </h3>
                        <p className="text-xs text-gray-500 mb-4">
                            Le template sera utilisé uniquement si toutes les conditions sont remplies
                        </p>

                        <div className="space-y-4">
                            {/* Type de projet */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type de projet
                                </label>
                                <select
                                    value={formData.conditions.project_type || ""}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            conditions: {
                                                ...formData.conditions,
                                                project_type: e.target.value || undefined,
                                            },
                                        })
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                >
                                    <option value="">Tous les types de projets</option>
                                    {projectTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Plage de budget */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plage de budget (€)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                                        <input
                                            type="number"
                                            value={budgetMin}
                                            onChange={(e) => setBudgetMin(e.target.value)}
                                            placeholder="Ex: 1000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                                        <input
                                            type="number"
                                            value={budgetMax}
                                            onChange={(e) => setBudgetMax(e.target.value)}
                                            placeholder="Ex: 5000"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    Laissez vide pour ne pas filtrer par budget
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sujet de l'email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sujet de l'email *
                        </label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            placeholder="Ex: Merci {{clientName}} pour votre demande de {{projectType}}"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Vous pouvez utiliser les variables disponibles (voir ci-dessous)
                        </p>
                    </div>

                    {/* Corps de l'email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Corps de l'email *
                        </label>
                        <textarea
                            value={formData.body_html}
                            onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                            rows={12}
                            placeholder="Bonjour {{clientName}},\n\nMerci pour votre demande concernant un {{projectType}}.\n\n..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Les sauts de ligne seront automatiquement convertis en HTML
                        </p>
                    </div>

                    {/* Variables disponibles */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-2 mb-3">
                            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                                    Variables disponibles
                                </h4>
                                <div className="grid md:grid-cols-2 gap-2">
                                    {AVAILABLE_VARIABLES.map((variable) => (
                                        <div key={variable.var} className="text-xs">
                                            <code className="bg-white px-2 py-1 rounded text-blue-700 font-mono">
                                                {variable.var}
                                            </code>
                                            <span className="text-blue-600 ml-2">{variable.desc}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={saving}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sauvegarde...
                                </>
                            ) : (
                                "Enregistrer"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

