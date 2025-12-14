'use client';

import { useState } from 'react';
import { Plus, X, Save, Loader2, Trash2, Edit2 } from 'lucide-react';

interface FormConfig {
    projectTypes: Array<{ value: string; label: string; description: string }>;
    budgetRanges: Array<{ value: string; label: string }>;
    features: string[];
}

export function QuoteFormConfig({ 
    config, 
    onSave 
}: { 
    config: FormConfig; 
    onSave: (config: FormConfig) => Promise<void>;
}) {
    const [formConfig, setFormConfig] = useState<FormConfig>(config);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [editingIndex, setEditingIndex] = useState<{ type: string; index: number } | null>(null);
    const [newProjectType, setNewProjectType] = useState({ value: '', label: '', description: '' });
    const [newBudgetRange, setNewBudgetRange] = useState({ value: '', label: '' });
    const [newFeature, setNewFeature] = useState('');

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            await onSave(formConfig);
            setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
        } finally {
            setSaving(false);
        }
    };

    const addProjectType = () => {
        if (newProjectType.value && newProjectType.label) {
            setFormConfig({
                ...formConfig,
                projectTypes: [...formConfig.projectTypes, newProjectType],
            });
            setNewProjectType({ value: '', label: '', description: '' });
        }
    };

    const removeProjectType = (index: number) => {
        setFormConfig({
            ...formConfig,
            projectTypes: formConfig.projectTypes.filter((_, i) => i !== index),
        });
    };

    const updateProjectType = (index: number, field: string, value: string) => {
        const updated = [...formConfig.projectTypes];
        updated[index] = { ...updated[index], [field]: value };
        setFormConfig({ ...formConfig, projectTypes: updated });
    };

    const addBudgetRange = () => {
        if (newBudgetRange.value && newBudgetRange.label) {
            setFormConfig({
                ...formConfig,
                budgetRanges: [...formConfig.budgetRanges, newBudgetRange],
            });
            setNewBudgetRange({ value: '', label: '' });
        }
    };

    const removeBudgetRange = (index: number) => {
        setFormConfig({
            ...formConfig,
            budgetRanges: formConfig.budgetRanges.filter((_, i) => i !== index),
        });
    };

    const updateBudgetRange = (index: number, field: string, value: string) => {
        const updated = [...formConfig.budgetRanges];
        updated[index] = { ...updated[index], [field]: value };
        setFormConfig({ ...formConfig, budgetRanges: updated });
    };

    const addFeature = () => {
        if (newFeature.trim()) {
            setFormConfig({
                ...formConfig,
                features: [...formConfig.features, newFeature.trim()],
            });
            setNewFeature('');
        }
    };

    const removeFeature = (index: number) => {
        setFormConfig({
            ...formConfig,
            features: formConfig.features.filter((_, i) => i !== index),
        });
    };

    const updateFeature = (index: number, value: string) => {
        const updated = [...formConfig.features];
        updated[index] = value;
        setFormConfig({ ...formConfig, features: updated });
    };

    return (
        <div className="space-y-6">
            {message && (
                <div className={`p-4 rounded-lg ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                    {message.text}
                </div>
            )}

            {/* Types de projets */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Types de projets</h2>
                <div className="space-y-4">
                    {formConfig.projectTypes.map((type, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                                    <input
                                        type="text"
                                        value={type.value}
                                        onChange={(e) => updateProjectType(index, 'value', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={type.label}
                                        onChange={(e) => updateProjectType(index, 'label', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={type.description}
                                        onChange={(e) => updateProjectType(index, 'description', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeProjectType(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                            <input
                                type="text"
                                placeholder="web_app"
                                value={newProjectType.value}
                                onChange={(e) => setNewProjectType({ ...newProjectType, value: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="Application Web"
                                value={newProjectType.label}
                                onChange={(e) => setNewProjectType({ ...newProjectType, label: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="Saas, Dashboard..."
                                value={newProjectType.description}
                                onChange={(e) => setNewProjectType({ ...newProjectType, description: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={addProjectType}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* Tranches de budget */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tranches de budget</h2>
                <div className="space-y-4">
                    {formConfig.budgetRanges.map((range, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex-1 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Valeur</label>
                                    <input
                                        type="text"
                                        value={range.value}
                                        onChange={(e) => updateBudgetRange(index, 'value', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                                    <input
                                        type="text"
                                        value={range.label}
                                        onChange={(e) => updateBudgetRange(index, 'label', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={() => removeBudgetRange(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                        <div className="flex-1 grid grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="small"
                                value={newBudgetRange.value}
                                onChange={(e) => setNewBudgetRange({ ...newBudgetRange, value: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <input
                                type="text"
                                placeholder="< 5 000€"
                                value={newBudgetRange.label}
                                onChange={(e) => setNewBudgetRange({ ...newBudgetRange, label: e.target.value })}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={addBudgetRange}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* Fonctionnalités */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Fonctionnalités</h2>
                <div className="space-y-4">
                    {formConfig.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                            <input
                                type="text"
                                value={feature}
                                onChange={(e) => updateFeature(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <button
                                onClick={() => removeFeature(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-2 border-dashed border-blue-300">
                        <input
                            type="text"
                            placeholder="Nouvelle fonctionnalité"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addFeature()}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                            onClick={addFeature}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter
                        </button>
                    </div>
                </div>
            </div>

            {/* Bouton sauvegarder */}
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
                            Enregistrer la configuration
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

