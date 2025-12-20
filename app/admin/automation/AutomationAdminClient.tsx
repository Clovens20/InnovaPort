'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Settings, Clock, User, CheckCircle2, X, Loader2, Zap, Bell } from 'lucide-react';

interface Template {
    id: string;
    user_id: string;
    name: string;
    enabled: boolean;
    conditions: any;
    subject: string;
    created_at: string;
    profiles: {
        id: string;
        username: string;
        full_name: string | null;
        email: string | null;
    };
}

interface ReminderSetting {
    id: string;
    user_id: string;
    enabled: boolean;
    reminder_days: number[];
    notify_on_status_change: boolean;
    profiles: {
        id: string;
        username: string;
        full_name: string | null;
        email: string | null;
    };
}

export function AutomationAdminClient({
    templates,
    reminderSettings,
    stats,
}: {
    templates: Template[];
    reminderSettings: ReminderSetting[];
    stats: {
        totalTemplates: number;
        enabledTemplates: number;
        usersWithReminders: number;
    };
}) {
    const [activeTab, setActiveTab] = useState<'overview' | 'templates' | 'reminders'>('overview');

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Retour au tableau de bord
                </Link>
                <h1 className="text-3xl font-bold text-gray-900">Gestion de l'Automatisation</h1>
                <p className="text-gray-600 mt-2">Gérez les réponses automatiques et les rappels pour tous les utilisateurs</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'overview'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Vue d'ensemble
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'templates'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Templates ({templates.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('reminders')}
                        className={`pb-4 px-1 text-sm font-medium transition-colors relative ${
                            activeTab === 'reminders'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        Rappels ({reminderSettings.length})
                    </button>
                </nav>
            </div>

            {/* Vue d'ensemble */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Statistiques */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-6 h-6 text-blue-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Templates</h3>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalTemplates}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                {stats.enabledTemplates} activés
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="w-6 h-6 text-yellow-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Rappels activés</h3>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{stats.usersWithReminders}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                utilisateurs avec rappels
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Settings className="w-6 h-6 text-green-600" />
                                <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
                            </div>
                            <div className="text-3xl font-bold text-gray-900">{reminderSettings.length}</div>
                            <div className="text-sm text-gray-600 mt-1">
                                avec paramètres configurés
                            </div>
                        </div>
                    </div>

                    {/* Informations */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités d'automatisation</h3>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-gray-900">Réponses automatiques :</strong> Les développeurs peuvent créer des templates personnalisés qui s'envoient automatiquement aux prospects selon des conditions (type de projet, budget).
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-gray-900">Rappels de suivi :</strong> Les développeurs reçoivent des rappels automatiques pour les devis en attente selon leurs paramètres (ex: après 3, 7, 14 jours).
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <strong className="text-gray-900">Notifications de statut :</strong> Les clients sont automatiquement notifiés par email lors des changements de statut de leur devis.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Templates */}
            {activeTab === 'templates' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {templates.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">Aucun template configuré</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {templates.map((template) => (
                                <div key={template.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                                                {template.enabled ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                        Actif
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                                        Inactif
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">
                                                <strong>Sujet:</strong> {template.subject}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User className="w-4 h-4" />
                                                <span>
                                                    {template.profiles?.full_name || template.profiles?.username || 'Inconnu'}
                                                    <span className="text-gray-400 ml-1">(@{template.profiles?.username})</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Rappels */}
            {activeTab === 'reminders' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {reminderSettings.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">Aucun paramètre de rappel configuré</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {reminderSettings.map((setting) => (
                                <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {setting.profiles?.full_name || setting.profiles?.username || 'Inconnu'}
                                                </h3>
                                                {setting.enabled ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                                                        Activé
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                                                        Désactivé
                                                    </span>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">
                                                <strong>Jours de rappel:</strong> {setting.reminder_days?.join(', ') || 'Non configuré'}
                                            </div>
                                            <div className="text-sm text-gray-600 mb-2">
                                                <strong>Notifications de statut:</strong> {setting.notify_on_status_change ? 'Activées' : 'Désactivées'}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <User className="w-4 h-4" />
                                                <span className="text-gray-400">@{setting.profiles?.username}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

