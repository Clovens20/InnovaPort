// app/admin/social-proof/SocialProofClient.tsx
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { Save, Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { AdminGuard } from '@/components/admin/AdminGuard';

interface SocialProofItem {
    id: string;
    name: string;
    initials: string;
    color: string;
    display_order: number;
}

export default function SocialProofClient() {
    const router = useRouter();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    
    const [items, setItems] = useState<SocialProofItem[]>([]);
    const [socialProofText, setSocialProofText] = useState('Rejoint par 50+ freelances en 2 semaines');
    const [socialProofEmoji, setSocialProofEmoji] = useState('🚀');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Charger les items du social proof
            const { data: socialProofData, error: socialProofError } = await supabase
                .from('homepage_social_proof')
                .select('*')
                .order('display_order', { ascending: true });

            if (socialProofError) throw socialProofError;
            setItems(socialProofData || []);

            // Charger les settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('homepage_settings')
                .select('*')
                .in('key', ['social_proof_text', 'social_proof_emoji']);

            if (settingsError) throw settingsError;
            
            settingsData?.forEach((setting) => {
                if (setting.key === 'social_proof_text') {
                    setSocialProofText(setting.value);
                } else if (setting.key === 'social_proof_emoji') {
                    setSocialProofEmoji(setting.value);
                }
            });
        } catch (error) {
            console.error('Error loading data:', error);
            setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth/login');
                return;
            }

            // Sauvegarder les items
            for (const item of items) {
                if (item.id && !item.id.startsWith('temp_')) {
                    const { error } = await supabase
                        .from('homepage_social_proof')
                        .update({
                            name: item.name,
                            initials: item.initials,
                            color: item.color,
                            display_order: item.display_order,
                        })
                        .eq('id', item.id);

                    if (error) throw error;
                } else {
                    const { error } = await supabase
                        .from('homepage_social_proof')
                        .insert({
                            name: item.name,
                            initials: item.initials,
                            color: item.color,
                            display_order: item.display_order,
                        });

                    if (error) throw error;
                }
            }

            // Sauvegarder les settings
            const { error: textError } = await supabase
                .from('homepage_settings')
                .upsert({ key: 'social_proof_text', value: socialProofText }, { onConflict: 'key' });

            if (textError) throw textError;

            const { error: emojiError } = await supabase
                .from('homepage_settings')
                .upsert({ key: 'social_proof_emoji', value: socialProofEmoji }, { onConflict: 'key' });

            if (emojiError) throw emojiError;

            setMessage({ type: 'success', text: 'Modifications enregistrées avec succès !' });
            
            // Recharger les données pour avoir les nouveaux IDs
            setTimeout(() => {
                loadData();
            }, 1000);
        } catch (error) {
            console.error('Error saving:', error);
            setMessage({ type: 'error', text: 'Erreur lors de l\'enregistrement' });
        } finally {
            setSaving(false);
        }
    };

    const addItem = () => {
        const newOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) + 1 : 0;
        setItems([
            ...items,
            {
                id: `temp_${Date.now()}`,
                name: '',
                initials: '',
                color: '#3B82F6',
                display_order: newOrder,
            },
        ]);
    };

    const removeItem = async (index: number) => {
        const item = items[index];
        if (item.id && !item.id.startsWith('temp_')) {
            const { error } = await supabase
                .from('homepage_social_proof')
                .delete()
                .eq('id', item.id);
            
            if (error) {
                setMessage({ type: 'error', text: 'Erreur lors de la suppression' });
                return;
            }
        }
        setItems(items.filter((_, i) => i !== index));
    };

    const updateItem = (index: number, field: keyof SocialProofItem, value: string | number) => {
        const updated = [...items];
        updated[index] = { ...updated[index], [field]: value };
        setItems(updated);
    };

    if (loading) {
        return (
            <AdminGuard>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Chargement...</p>
                    </div>
                </div>
            </AdminGuard>
        );
    }

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <Link
                                href="/admin"
                                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Retour à l'admin
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-900">Gestion du Social Proof</h1>
                            <p className="text-gray-600 mt-2">
                                Modifiez les entreprises et freelances affichés sur la page d'accueil
                            </p>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Enregistrement...' : 'Enregistrer'}
                        </button>
                    </div>

                    {message && (
                        <div
                            className={`p-4 rounded-lg ${
                                message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    {/* Texte du social proof */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <h2 className="text-xl font-bold mb-4">Texte du Social Proof</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Emoji</label>
                                <input
                                    type="text"
                                    value={socialProofEmoji}
                                    onChange={(e) => setSocialProofEmoji(e.target.value)}
                                    placeholder="🚀"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none text-2xl"
                                    maxLength={2}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Texte</label>
                                <input
                                    type="text"
                                    value={socialProofText}
                                    onChange={(e) => setSocialProofText(e.target.value)}
                                    placeholder="Rejoint par 50+ freelances en 2 semaines"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Liste des entreprises/freelances */}
                    <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Entreprises / Freelances</h2>
                            <button
                                onClick={addItem}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Ajouter
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.map((item, index) => (
                                <div key={item.id || index} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom de l'entreprise
                                            </label>
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(index, 'name', e.target.value)}
                                                placeholder="Marie Charbonneau"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Initiales (pour l'avatar)
                                            </label>
                                            <input
                                                type="text"
                                                value={item.initials}
                                                onChange={(e) => updateItem(index, 'initials', e.target.value.toUpperCase())}
                                                placeholder="MC"
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                                maxLength={3}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Couleur de l'avatar
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="color"
                                                    value={item.color}
                                                    onChange={(e) => updateItem(index, 'color', e.target.value)}
                                                    placeholder="#3B82F6"
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Ordre d'affichage
                                            </label>
                                            <input
                                                type="number"
                                                value={item.display_order}
                                                onChange={(e) => updateItem(index, 'display_order', parseInt(e.target.value) || 0)}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={() => removeItem(index)}
                                            className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Supprimer
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {items.length === 0 && (
                                <div className="text-center py-12 text-gray-500">
                                    <p>Aucune entreprise ajoutée. Cliquez sur "Ajouter" pour commencer.</p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </AdminGuard>
    );
}