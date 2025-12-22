'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Loader2, Trash2, Copy, Check, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface PromoCode {
    id: string;
    code: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    valid_from: string;
    valid_until: string;
    max_uses: number | null;
    current_uses: number;
    applicable_plans: string[] | null;
    is_active: boolean;
    created_at: string;
}

export function PromoCodesAdminClient({ initialPromoCodes }: { initialPromoCodes: PromoCode[] }) {
    const [promoCodes, setPromoCodes] = useState<PromoCode[]>(initialPromoCodes);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const [newPromoCode, setNewPromoCode] = useState({
        code: '',
        discount_type: 'percentage' as 'percentage' | 'fixed',
        discount_value: 10,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
        max_uses: null as number | null,
        applicable_plans: [] as string[],
        is_active: true,
    });

    const handleCreatePromoCode = async () => {
        if (!newPromoCode.code || !newPromoCode.valid_until) {
            setMessage({ type: 'error', text: 'Code, date de fin et valeur de réduction sont requis' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const response = await fetch('/api/admin/promo-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: newPromoCode.code,
                    discount_type: newPromoCode.discount_type,
                    discount_value: newPromoCode.discount_value,
                    valid_from: newPromoCode.valid_from,
                    valid_until: newPromoCode.valid_until,
                    max_uses: newPromoCode.max_uses,
                    applicable_plans: newPromoCode.applicable_plans,
                    is_active: newPromoCode.is_active,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la création');
            }

            setPromoCodes([result.data, ...promoCodes]);
            setShowCreateModal(false);
            setNewPromoCode({
                code: '',
                discount_type: 'percentage',
                discount_value: 10,
                valid_from: new Date().toISOString().split('T')[0],
                valid_until: '',
                max_uses: null,
                applicable_plans: [],
                is_active: true,
            });
            setMessage({ type: 'success', text: 'Code promo créé avec succès' });
        } catch (error: any) {
            console.error('Error creating promo code:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la création' });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: string, currentStatus: boolean) => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/promo-codes', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    is_active: !currentStatus,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la mise à jour');
            }

            setPromoCodes(promoCodes.map(pc => pc.id === id ? { ...pc, is_active: !currentStatus } : pc));
        } catch (error: any) {
            console.error('Error updating promo code:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, code: string) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le code "${code}" ?`)) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/admin/promo-codes?id=${id}`, {
                method: 'DELETE',
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la suppression');
            }

            setPromoCodes(promoCodes.filter(pc => pc.id !== id));
            setMessage({ type: 'success', text: 'Code promo supprimé' });
        } catch (error: any) {
            console.error('Error deleting promo code:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Codes Promotionnels</h1>
                        <p className="text-gray-600 mt-1">Créez et gérez les codes promo pour les développeurs</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        Créer un code promo
                    </button>
                </div>
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

            {/* Liste des codes promo */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {promoCodes.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Aucun code promo créé</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {promoCodes.map((promo) => (
                            <div key={promo.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 font-mono">
                                                {promo.code}
                                            </h3>
                                            <button
                                                onClick={() => copyToClipboard(promo.code)}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                title="Copier"
                                            >
                                                {copiedCode === promo.code ? (
                                                    <Check className="w-4 h-4 text-green-600" />
                                                ) : (
                                                    <Copy className="w-4 h-4 text-gray-600" />
                                                )}
                                            </button>
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                promo.is_active 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                                {promo.is_active ? 'Actif' : 'Inactif'}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">Réduction:</span>{' '}
                                                {promo.discount_type === 'percentage' 
                                                    ? `${promo.discount_value}%`
                                                    : `${promo.discount_value}€`
                                                }
                                            </div>
                                            <div>
                                                <span className="font-medium">Utilisations:</span>{' '}
                                                {promo.current_uses} / {promo.max_uses || '∞'}
                                            </div>
                                            <div>
                                                <span className="font-medium">Valide jusqu'au:</span>{' '}
                                                {new Date(promo.valid_until).toLocaleDateString('fr-FR')}
                                            </div>
                                            <div>
                                                <span className="font-medium">Plans:</span>{' '}
                                                {promo.applicable_plans && promo.applicable_plans.length > 0
                                                    ? promo.applicable_plans.join(', ')
                                                    : 'Tous'
                                                }
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggleActive(promo.id, promo.is_active)}
                                            className={`px-4 py-2 rounded-lg transition-colors ${
                                                promo.is_active
                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                                            }`}
                                        >
                                            {promo.is_active ? 'Désactiver' : 'Activer'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(promo.id, promo.code)}
                                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de création */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Créer un code promo</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
                                <input
                                    type="text"
                                    value={newPromoCode.code}
                                    onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                                    placeholder="PROMO2024"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type de réduction *</label>
                                <select
                                    value={newPromoCode.discount_type}
                                    onChange={(e) => setNewPromoCode({ ...newPromoCode, discount_type: e.target.value as 'percentage' | 'fixed' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="percentage">Pourcentage (%)</option>
                                    <option value="fixed">Montant fixe (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Valeur * ({newPromoCode.discount_type === 'percentage' ? '%' : '€'})
                                </label>
                                <input
                                    type="number"
                                    value={newPromoCode.discount_value}
                                    onChange={(e) => setNewPromoCode({ ...newPromoCode, discount_value: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="0"
                                    max={newPromoCode.discount_type === 'percentage' ? 100 : undefined}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
                                    <input
                                        type="date"
                                        value={newPromoCode.valid_from}
                                        onChange={(e) => setNewPromoCode({ ...newPromoCode, valid_from: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
                                    <input
                                        type="date"
                                        value={newPromoCode.valid_until}
                                        onChange={(e) => setNewPromoCode({ ...newPromoCode, valid_until: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Utilisations max (vide = illimité)</label>
                                <input
                                    type="number"
                                    value={newPromoCode.max_uses || ''}
                                    onChange={(e) => setNewPromoCode({ ...newPromoCode, max_uses: e.target.value ? parseInt(e.target.value) : null })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    min="1"
                                    placeholder="Illimité"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Plans applicables (vide = tous)</label>
                                <div className="space-y-2">
                                    {['pro', 'premium'].map(plan => (
                                        <label key={plan} className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={newPromoCode.applicable_plans.includes(plan)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setNewPromoCode({ ...newPromoCode, applicable_plans: [...newPromoCode.applicable_plans, plan] });
                                                    } else {
                                                        setNewPromoCode({ ...newPromoCode, applicable_plans: newPromoCode.applicable_plans.filter(p => p !== plan) });
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 rounded"
                                            />
                                            <span className="text-sm text-gray-700 capitalize">{plan}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newPromoCode.is_active}
                                    onChange={(e) => setNewPromoCode({ ...newPromoCode, is_active: e.target.checked })}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label className="text-sm font-medium text-gray-700">Code actif</label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleCreatePromoCode}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Création...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Créer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

