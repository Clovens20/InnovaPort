'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, FileText, DollarSign, Calendar, Check } from 'lucide-react';
import Link from 'next/link';
import { Quote } from '@/types';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function CreateQuotePage() {
    const params = useParams();
    const router = useRouter();
    const { t, language } = useTranslation();
    const supabase = createClient();
    const quoteRequestId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [quoteRequest, setQuoteRequest] = useState<Quote | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        workProposal: '',
        items: [{ name: '', quantity: 1, unitPrice: 0, total: 0 }],
        subtotal: 0,
        tax: 0,
        total: 0,
        validUntil: '',
        paymentTerms: '30',
        notes: '',
    });

    useEffect(() => {
        loadQuoteRequest();
    }, [quoteRequestId]);

    const loadQuoteRequest = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            const { data, error } = await supabase
                .from('quotes')
                .select('*')
                .eq('id', quoteRequestId)
                .eq('user_id', user.id)
                .single();

            if (error) throw error;

            if (!data) {
                router.push('/dashboard/quotes');
                return;
            }

            setQuoteRequest(data);

            // Pré-remplir le formulaire avec les données de la demande
            const deadlineDate = data.deadline ? new Date(data.deadline) : null;
            const validUntilDate = deadlineDate 
                ? new Date(deadlineDate.getTime() - 7 * 24 * 60 * 60 * 1000) // 7 jours avant le délai
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut

            // Extraire le budget estimé
            const budgetMatch = data.budget?.match(/(\d+)/);
            const estimatedBudget = budgetMatch ? parseInt(budgetMatch[1]) * 1000 : 5000;

            // Créer un item par défaut basé sur le type de projet
            const defaultItem = {
                name: data.project_type || 'Développement',
                quantity: 1,
                unitPrice: estimatedBudget,
                total: estimatedBudget,
            };

            setFormData({
                title: `${data.project_type} - ${data.name}`,
                description: data.description || '',
                workProposal: '',
                items: [defaultItem],
                subtotal: estimatedBudget,
                tax: estimatedBudget * 0.2, // 20% de TVA par défaut
                total: estimatedBudget * 1.2,
                validUntil: validUntilDate.toISOString().split('T')[0],
                paymentTerms: '30',
                notes: `Devis basé sur la demande de ${data.name}.\nType de projet: ${data.project_type}\nBudget estimé: ${data.budget}\nDélai souhaité: ${data.deadline || 'Non spécifié'}`,
            });
        } catch (error) {
            console.error('Error loading quote request:', error);
            router.push('/dashboard/quotes');
        } finally {
            setLoading(false);
        }
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...formData.items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
        };

        // Recalculer le total de l'item
        if (field === 'quantity' || field === 'unitPrice') {
            newItems[index].total = newItems[index].quantity * newItems[index].unitPrice;
        }

        // Recalculer les totaux
        const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.2; // 20% de TVA
        const total = subtotal + tax;

        setFormData({
            ...formData,
            items: newItems,
            subtotal,
            tax,
            total,
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { name: '', quantity: 1, unitPrice: 0, total: 0 }],
        });
    };

    const removeItem = (index: number) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        const subtotal = newItems.reduce((sum, item) => sum + item.total, 0);
        const tax = subtotal * 0.2;
        const total = subtotal + tax;

        setFormData({
            ...formData,
            items: newItems,
            subtotal,
            tax,
            total,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // Mettre à jour le statut de la demande à "quoted"
            const response = await fetch(`/api/quotes/${quoteRequestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    status: 'quoted',
                    quoteData: formData 
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                const errorMessage = data.error || data.message || 'Erreur lors de la création du devis';
                throw new Error(errorMessage);
            }

            // Rediriger vers la page de détail avec un message de succès
            router.push(`/dashboard/quotes/${quoteRequestId}?created=true`);
        } catch (error) {
            console.error('Error creating quote:', error);
            const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du devis';
            alert(errorMessage);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Chargement...</p>
                </div>
            </div>
        );
    }

    if (!quoteRequest) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Demande de devis non trouvée</p>
                <Link href="/dashboard/quotes" className="text-blue-600 hover:underline mt-4 inline-block">
                    Retour à la liste
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Link
                        href="/dashboard/quotes"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour aux devis
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {language === 'fr' ? 'Créer un Devis' : 'Create Quote'}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        {language === 'fr' 
                            ? `Basé sur la demande de ${quoteRequest.name}`
                            : `Based on request from ${quoteRequest.name}`
                        }
                    </p>
                </div>
            </div>

            {/* Informations de la demande */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {language === 'fr' ? 'Informations de la demande' : 'Request Information'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">{language === 'fr' ? 'Client:' : 'Client:'}</span>
                        <span className="ml-2 font-medium text-gray-900">{quoteRequest.name}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">{language === 'fr' ? 'Email:' : 'Email:'}</span>
                        <span className="ml-2 font-medium text-gray-900">{quoteRequest.email}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">{language === 'fr' ? 'Type de projet:' : 'Project Type:'}</span>
                        <span className="ml-2 font-medium text-gray-900">{quoteRequest.project_type}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">{language === 'fr' ? 'Budget estimé:' : 'Estimated Budget:'}</span>
                        <span className="ml-2 font-medium text-gray-900">{quoteRequest.budget}</span>
                    </div>
                </div>
            </div>

            {/* Formulaire de devis */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
                {/* Titre */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'fr' ? 'Titre du devis' : 'Quote Title'} *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'fr' ? 'Description du projet' : 'Project Description'} *
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={language === 'fr' ? 'Décrivez brièvement le projet...' : 'Briefly describe the project...'}
                    />
                </div>

                {/* Proposition de travail détaillée */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'fr' ? 'Proposition de travail détaillée' : 'Detailed Work Proposal'} *
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        {language === 'fr' 
                            ? 'Détaillez précisément le travail que vous allez effectuer, les étapes, les livrables et votre approche.'
                            : 'Detail precisely the work you will perform, steps, deliverables and your approach.'}
                    </p>
                    <textarea
                        required
                        rows={8}
                        value={formData.workProposal}
                        onChange={(e) => setFormData({ ...formData, workProposal: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={language === 'fr' 
                            ? 'Exemple:\n\n1. Phase de découverte et analyse des besoins\n2. Conception et maquettage\n3. Développement frontend et backend\n4. Tests et corrections\n5. Déploiement et formation\n\nLivrables:\n- Site web responsive\n- Documentation technique\n- Formation utilisateur'
                            : 'Example:\n\n1. Discovery and needs analysis phase\n2. Design and mockups\n3. Frontend and backend development\n4. Testing and corrections\n5. Deployment and training\n\nDeliverables:\n- Responsive website\n- Technical documentation\n- User training'}
                    />
                </div>

                {/* Items */}
                <div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            {language === 'fr' ? 'Éléments du devis' : 'Quote Items'} *
                        </label>
                        <button
                            type="button"
                            onClick={addItem}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                            + {language === 'fr' ? 'Ajouter un élément' : 'Add Item'}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end p-4 bg-gray-50 rounded-lg">
                                <div className="col-span-5">
                                    <label className="block text-xs text-gray-600 mb-1">
                                        {language === 'fr' ? 'Description' : 'Description'}
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={item.name}
                                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        placeholder={language === 'fr' ? 'Ex: Développement frontend' : 'Ex: Frontend development'}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">
                                        {language === 'fr' ? 'Qté' : 'Qty'}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">
                                        {language === 'fr' ? 'Prix unit.' : 'Unit Price'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs text-gray-600 mb-1">
                                        {language === 'fr' ? 'Total' : 'Total'}
                                    </label>
                                    <input
                                        type="text"
                                        readOnly
                                        value={`$${item.total.toFixed(2)}`}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-sm font-semibold"
                                    />
                                </div>
                                <div className="col-span-1">
                                    {formData.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totaux */}
                <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-end">
                        <div className="w-full max-w-md space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{language === 'fr' ? 'Sous-total' : 'Subtotal'}</span>
                                <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">{language === 'fr' ? 'TVA (20%)' : 'Tax (20%)'}</span>
                                <span className="font-medium">${formData.tax.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                <span>{language === 'fr' ? 'Total' : 'Total'}</span>
                                <span className="text-blue-600">${formData.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Conditions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'fr' ? 'Valable jusqu\'au' : 'Valid Until'} *
                        </label>
                        <input
                            type="date"
                            required
                            value={formData.validUntil}
                            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'fr' ? 'Conditions de paiement (jours)' : 'Payment Terms (days)'} *
                        </label>
                        <input
                            type="number"
                            min="0"
                            required
                            value={formData.paymentTerms}
                            onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="30"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'fr' ? 'Notes additionnelles' : 'Additional Notes'}
                    </label>
                    <textarea
                        rows={4}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder={language === 'fr' ? 'Informations complémentaires...' : 'Additional information...'}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <Link
                        href="/dashboard/quotes"
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                {language === 'fr' ? 'Enregistrement...' : 'Saving...'}
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                {language === 'fr' ? 'Créer et Envoyer le Devis' : 'Create and Send Quote'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

