'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, Clock, User, Search, Filter, Settings, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { QuoteFormConfig } from './QuoteFormConfig';

interface Quote {
    id: string;
    user_id: string;
    name: string;
    email: string;
    phone: string | null;
    project_type: string;
    budget: string;
    status: string;
    created_at: string;
    profiles: {
        id: string;
        username: string;
        full_name: string | null;
        email: string | null;
    };
}

function formatRelativeDate(date: string): string {
    const now = new Date();
    const quoteDate = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - quoteDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'Il y a moins d\'une minute';
    } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `Il y a ${days} jour${days > 1 ? 's' : ''}`;
    } else {
        return quoteDate.toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }
}

function getStatusBadge(status: string) {
    const statusConfig: Record<string, { label: string; className: string }> = {
        new: { label: 'Nouveau', className: 'bg-blue-100 text-blue-800' },
        discussing: { label: 'En discussion', className: 'bg-yellow-100 text-yellow-800' },
        quoted: { label: 'Devis envoyé', className: 'bg-purple-100 text-purple-800' },
        accepted: { label: 'Accepté', className: 'bg-green-100 text-green-800' },
        rejected: { label: 'Refusé', className: 'bg-red-100 text-red-800' },
    };
    const config = statusConfig[status] || statusConfig.new;
    return (
        <span className={`px-2 py-1 rounded text-xs font-medium ${config.className}`}>
            {config.label}
        </span>
    );
}

async function handleStatusChange(quoteId: string, newStatus: string, setUpdatingStatusId: (id: string | null) => void, setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>) {
    setUpdatingStatusId(quoteId);
    try {
        const response = await fetch(`/api/quotes/${quoteId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus }),
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.error || 'Failed to update status');
        }

        // Mettre à jour le devis dans la liste
        setQuotes((prevQuotes) => 
            prevQuotes.map((q) => 
                q.id === quoteId ? { ...q, status: newStatus } : q
            )
        );
    } catch (error) {
        console.error('Error updating status:', error);
        alert(error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut');
    } finally {
        setUpdatingStatusId(null);
    }
}

export function QuotesAdminClient({
    initialQuotes,
    totalQuotes,
    newQuotes,
}: {
    initialQuotes: Quote[];
    totalQuotes: number;
    newQuotes: number;
}) {
    const [activeTab, setActiveTab] = useState<'quotes' | 'form-config'>('quotes');
    const [quotes, setQuotes] = useState<Quote[]>(initialQuotes);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
    
    // Configuration du formulaire
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [formConfig, setFormConfig] = useState({
        projectTypes: [
            { value: 'web_app', label: 'Application Web', description: 'Saas, Dashboard, Outil métier' },
            { value: 'mobile_app', label: 'Application Mobile', description: 'iOS & Android' },
            { value: 'ecommerce', label: 'E-commerce', description: 'Boutique en ligne' },
            { value: 'website', label: 'Site Vitrine', description: 'Présentation entreprise' },
        ],
        budgetRanges: [
            { value: 'small', label: '< 5 000€' },
            { value: 'medium', label: '5k€ - 10k€' },
            { value: 'large', label: '10k€ - 20k€' },
            { value: 'xl', label: '> 20 000€' },
        ],
        features: [
            'Paiement en ligne',
            'Authentification',
            'Multi-langues',
            'Dashboard admin',
            'Blog / News',
            'Réservation',
            'Chat / Messagerie',
            'Map / Géolocalisation',
        ],
    });
    
    // Charger les constantes actuelles depuis le fichier
    useEffect(() => {
        import('@/utils/contact-constants').then((module) => {
            setFormConfig({
                projectTypes: module.projectTypes.map(pt => ({
                    value: pt.value,
                    label: pt.label,
                    description: pt.description,
                })),
                budgetRanges: module.budgetRanges,
                features: module.featuresList,
            });
        });
    }, []);

    const filteredQuotes = quotes.filter(quote => {
        const matchesSearch = 
            quote.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quote.profiles?.username?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });

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
                        <h1 className="text-3xl font-bold text-gray-900">Devis & Formulaires</h1>
                        <p className="text-gray-600 mt-1">
                            {activeTab === 'quotes' 
                                ? 'Gérez tous les devis de tous les développeurs'
                                : 'Configurez les champs et options du formulaire de demande de devis'
                            }
                        </p>
                    </div>
                    {activeTab === 'quotes' && (
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{filteredQuotes.length}</div>
                            <div className="text-sm text-gray-500">devis trouvés</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Onglets */}
            <div className="mb-6 border-b border-gray-200">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('quotes')}
                        className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                            activeTab === 'quotes'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Liste des devis
                    </button>
                    <button
                        onClick={() => setActiveTab('form-config')}
                        className={`px-4 py-2 font-semibold transition-colors border-b-2 ${
                            activeTab === 'form-config'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Configuration du formulaire
                    </button>
                </div>
            </div>

            {activeTab === 'form-config' && (
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
                    <QuoteFormConfig
                        config={formConfig}
                        onSave={async (config) => {
                            setSaving(true);
                            setMessage(null);
                            try {
                                // TODO: Sauvegarder dans la base de données
                                // Pour l'instant, sauvegarde temporaire
                                await new Promise(resolve => setTimeout(resolve, 1000));
                                setFormConfig(config);
                                setMessage({ type: 'success', text: 'Configuration sauvegardée avec succès. Note: Les modifications sont temporaires. Une table de configuration sera créée pour la persistance.' });
                            } catch (error) {
                                setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
                                throw error;
                            } finally {
                                setSaving(false);
                            }
                        }}
                    />
                </div>
            )}

            {activeTab === 'quotes' && (
                <>

                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Total devis</div>
                    <div className="text-2xl font-bold text-gray-900">{totalQuotes}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Nouveaux</div>
                    <div className="text-2xl font-bold text-blue-600">{newQuotes}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Acceptés</div>
                    <div className="text-2xl font-bold text-green-600">
                        {quotes.filter(q => q.status === 'accepted').length}
                    </div>
                </div>
            </div>

                    {/* Filtres */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un devis..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tous les statuts</option>
                            <option value="new">Nouveau</option>
                            <option value="discussing">En discussion</option>
                            <option value="quoted">Devis envoyé</option>
                            <option value="accepted">Accepté</option>
                            <option value="rejected">Refusé</option>
                        </select>
                    </div>
                </div>
            </div>

                    {/* Liste des devis */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {filteredQuotes.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Aucun devis trouvé</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredQuotes.map((quote) => (
                            <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">{quote.name}</h3>
                                            <select
                                                value={quote.status}
                                                onChange={(e) => handleStatusChange(quote.id, e.target.value, setUpdatingStatusId, setQuotes)}
                                                disabled={updatingStatusId === quote.id}
                                                className={`px-3 py-1 text-xs font-semibold rounded-lg border-2 transition-all outline-none cursor-pointer ${
                                                    quote.status === 'new' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                    quote.status === 'discussing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                                    quote.status === 'quoted' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    quote.status === 'accepted' ? 'bg-green-100 text-green-700 border-green-200' :
                                                    'bg-red-100 text-red-700 border-red-200'
                                                } ${updatingStatusId === quote.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <option value="new">Nouveau</option>
                                                <option value="discussing">En discussion</option>
                                                <option value="quoted">Devis envoyé</option>
                                                <option value="accepted">Accepté</option>
                                                <option value="rejected">Refusé</option>
                                            </select>
                                            {updatingStatusId === quote.id && (
                                                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {quote.email}
                                            </div>
                                            {quote.phone && (
                                                <div className="flex items-center gap-1">
                                                    <Phone className="w-4 h-4" />
                                                    {quote.phone}
                                                </div>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {formatRelativeDate(quote.created_at)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Type de projet: </span>
                                                <span className="font-medium text-gray-900">{quote.project_type}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Budget: </span>
                                                <span className="font-medium text-gray-900">{quote.budget}</span>
                                            </div>
                                        </div>
                                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span>Développeur: </span>
                                            <span className="font-medium text-gray-900">
                                                {quote.profiles?.full_name || quote.profiles?.username || 'Inconnu'}
                                            </span>
                                            <span className="text-gray-400">(@{quote.profiles?.username})</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                </>
            )}
        </div>
    );
}

