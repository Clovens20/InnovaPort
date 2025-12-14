'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, User, Mail, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Admin {
    id: string;
    username: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    created_at: string;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function SecurityAdminClient({ initialAdmins }: { initialAdmins: Admin[] }) {
    const [admins] = useState<Admin[]>(initialAdmins);

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
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-red-600" />
                    <h1 className="text-3xl font-bold text-gray-900">Sécurité & Permissions</h1>
                </div>
                <p className="text-gray-600">Gestion des rôles et permissions administrateurs</p>
            </div>

            {/* Informations de sécurité */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900 mb-2">
                            Informations de sécurité
                        </h2>
                        <ul className="text-sm text-blue-800 space-y-2">
                            <li>• Seuls les utilisateurs avec le rôle "admin" peuvent accéder à cette interface</li>
                            <li>• Les vérifications sont effectuées côté serveur (middleware) et dans les composants</li>
                            <li>• Les admins ont accès à toutes les fonctionnalités du système</li>
                            <li>• Les développeurs ont accès uniquement à leur dashboard et portfolio</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Liste des administrateurs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Administrateurs du système</h2>
                    <p className="text-sm text-gray-600 mt-1">{admins.length} administrateur(s) actif(s)</p>
                </div>
                <div className="divide-y divide-gray-200">
                    {admins.length === 0 ? (
                        <div className="p-12 text-center">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-500">Aucun administrateur trouvé</p>
                        </div>
                    ) : (
                        admins.map((admin) => (
                            <div key={admin.id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-red-600 flex items-center justify-center text-white font-bold">
                                            {(admin.full_name || admin.username || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {admin.full_name || admin.username || 'Admin sans nom'}
                                                </h3>
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    Admin
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Mail className="w-4 h-4" />
                                                    {admin.email || 'Pas d\'email'}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <User className="w-4 h-4" />
                                                    @{admin.username}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    Créé le {formatDate(admin.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        <span className="text-sm text-gray-600">Actif</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Permissions */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Permissions administrateurs</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Accès administrateur</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Gestion de tous les projets
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Gestion de tous les utilisateurs
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Configuration du formulaire de devis
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Gestion des codes promotionnels
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Modification des plans et prix
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                Personnalisation de l'apparence
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Accès développeur</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                Gestion de ses propres projets
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                Personnalisation de son portfolio
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                Gestion de ses devis reçus
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                Visualisation de ses statistiques
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                Gestion de son profil
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

