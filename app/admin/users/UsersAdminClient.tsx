'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserPlus, Edit, Shield, User as UserIcon, Mail, Calendar, Plus, X, Save, Loader2, Trash2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface User {
    id: string;
    username: string;
    full_name: string | null;
    email: string | null;
    role: string | null;
    subscription_tier: string | null;
    created_at: string;
}

function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function getRoleBadge(role: string | null) {
    if (role === 'admin') {
        return (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
            </span>
        );
    }
    return (
        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
            Développeur
        </span>
    );
}

export function UsersAdminClient({
    initialUsers,
    totalUsers,
    adminCount,
}: {
    initialUsers: User[];
    totalUsers: number;
    adminCount: number;
}) {
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Formulaire de création
    const [newUser, setNewUser] = useState({
        email: '',
        password: '',
        full_name: '',
        username: '',
        role: 'developer' as 'admin' | 'developer',
    });

    // Formulaire d'édition
    const [editUser, setEditUser] = useState({
        full_name: '',
        username: '',
        email: '',
        role: 'developer' as 'admin' | 'developer',
        subscription_tier: 'free' as 'free' | 'pro' | 'premium',
    });

    const handleCreateUser = async () => {
        if (!newUser.email || !newUser.password) {
            setMessage({ type: 'error', text: 'Email et mot de passe sont requis' });
            return;
        }

        if (newUser.password.length < 8) {
            setMessage({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Appeler l'API pour créer l'utilisateur
            const response = await fetch('/api/admin/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newUser),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création');
            }

            // Recharger la liste des utilisateurs
            const supabase = createClient();
            const { data: updatedUsers } = await supabase
                .from('profiles')
                .select('id, username, full_name, email, role, subscription_tier, created_at')
                .order('created_at', { ascending: false });

            setUsers((updatedUsers || []) as User[]);
            setShowCreateModal(false);
            setNewUser({ email: '', password: '', full_name: '', username: '', role: 'developer' });
            setMessage({ type: 'success', text: 'Utilisateur créé avec succès' });
        } catch (error: any) {
            console.error('Error creating user:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la création de l\'utilisateur' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenEdit = (user: User) => {
        setSelectedUser(user);
        setEditUser({
            full_name: user.full_name || '',
            username: user.username || '',
            email: user.email || '',
            role: (user.role as 'admin' | 'developer') || 'developer',
            subscription_tier: (user.subscription_tier as 'free' | 'pro' | 'premium') || 'free',
        });
        setShowEditModal(true);
    };

    const handleQuickPlanChange = async (user: User, newTier: 'free' | 'pro' | 'premium') => {
        const tierNames = { free: 'Gratuit', pro: 'Pro', premium: 'Premium' };
        
        if (!confirm(`Êtes-vous sûr de vouloir passer ${user.full_name || user.username} du plan ${tierNames[user.subscription_tier as keyof typeof tierNames] || 'Gratuit'} au plan ${tierNames[newTier]} ?`)) {
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // Appeler l'API pour mettre à jour le plan
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: user.id,
                    subscription_tier: newTier,
                    full_name: user.full_name,
                    username: user.username,
                    role: user.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }

            // Recharger la liste des utilisateurs
            const supabase = createClient();
            const { data: updatedUsers } = await supabase
                .from('profiles')
                .select('id, username, full_name, email, role, subscription_tier, created_at')
                .order('created_at', { ascending: false });

            setUsers((updatedUsers || []) as User[]);
            setMessage({ type: 'success', text: `Plan modifié avec succès : ${tierNames[newTier]}` });
        } catch (error: any) {
            console.error('Error updating plan:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la modification du plan' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;

        setLoading(true);
        setMessage(null);

        try {
            // Appeler l'API pour mettre à jour l'utilisateur
            const response = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: selectedUser.id,
                    ...editUser,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la mise à jour');
            }

            // Recharger la liste des utilisateurs
            const supabase = createClient();
            const { data: updatedUsers } = await supabase
                .from('profiles')
                .select('id, username, full_name, email, role, subscription_tier, created_at')
                .order('created_at', { ascending: false });

            setUsers((updatedUsers || []) as User[]);
            setShowEditModal(false);
            setSelectedUser(null);
            setMessage({ type: 'success', text: 'Utilisateur mis à jour avec succès' });
        } catch (error: any) {
            console.error('Error updating user:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la mise à jour' });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDelete = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmText('');
        setShowDeleteModal(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        // Vérifier que l'utilisateur a bien tapé "SUPPRIMER"
        if (deleteConfirmText !== 'SUPPRIMER') {
            setMessage({ type: 'error', text: 'Veuillez taper "SUPPRIMER" pour confirmer la suppression' });
            return;
        }

        const userName = userToDelete.full_name || userToDelete.username || userToDelete.email || 'cet utilisateur';
        setLoading(true);
        setMessage(null);

        try {
            // Appeler l'API pour supprimer l'utilisateur
            const response = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la suppression');
            }

            // Recharger la liste des utilisateurs
            const supabase = createClient();
            const { data: updatedUsers } = await supabase
                .from('profiles')
                .select('id, username, full_name, email, role, subscription_tier, created_at')
                .order('created_at', { ascending: false });

            setUsers((updatedUsers || []) as User[]);
            setShowDeleteModal(false);
            setUserToDelete(null);
            setDeleteConfirmText('');
            setMessage({ type: 'success', text: `Compte de ${userName} supprimé avec succès` });
        } catch (error: any) {
            console.error('Error deleting user:', error);
            setMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression du compte' });
        } finally {
            setLoading(false);
        }
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
                        <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
                        <p className="text-gray-600 mt-1">Créez des admins et gérez les utilisateurs du système</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2"
                    >
                        <UserPlus className="w-4 h-4" />
                        Créer un utilisateur
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

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Total utilisateurs</div>
                    <div className="text-2xl font-bold text-gray-900">{totalUsers}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Administrateurs</div>
                    <div className="text-2xl font-bold text-purple-600">{adminCount}</div>
                </div>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="text-sm text-gray-600 mb-1">Développeurs</div>
                    <div className="text-2xl font-bold text-blue-600">{totalUsers - adminCount}</div>
                </div>
            </div>

            {/* Liste des utilisateurs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="divide-y divide-gray-200">
                    {users.map((user) => (
                        <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {user.full_name || user.username || 'Utilisateur sans nom'}
                                            </h3>
                                            {getRoleBadge(user.role)}
                                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                                                user.subscription_tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                                                user.subscription_tier === 'pro' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {user.subscription_tier === 'premium' ? 'Premium' :
                                                 user.subscription_tier === 'pro' ? 'Pro' : 'Gratuit'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                {user.email || 'Pas d\'email'}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <UserIcon className="w-4 h-4" />
                                                @{user.username}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(user.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {user.role !== 'admin' && (
                                        <div className="relative group">
                                            <button
                                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                                                    user.subscription_tier === 'free' 
                                                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                        : user.subscription_tier === 'pro'
                                                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                }`}
                                            >
                                                Changer plan
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                                <div className="py-1">
                                                    {user.subscription_tier !== 'free' && (
                                                        <button
                                                            onClick={() => handleQuickPlanChange(user, 'free')}
                                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            ⬇️ Passer à Gratuit
                                                        </button>
                                                    )}
                                                    {user.subscription_tier !== 'pro' && (
                                                        <button
                                                            onClick={() => handleQuickPlanChange(user, 'pro')}
                                                            className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                                                        >
                                                            {user.subscription_tier === 'free' ? '⬆️' : '↔️'} Passer à Pro
                                                        </button>
                                                    )}
                                                    {user.subscription_tier !== 'premium' && (
                                                        <button
                                                            onClick={() => handleQuickPlanChange(user, 'premium')}
                                                            className="block w-full text-left px-4 py-2 text-sm text-purple-600 hover:bg-purple-50"
                                                        >
                                                            {user.subscription_tier === 'free' ? '⬆️' : '⬆️'} Passer à Premium
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleOpenEdit(user)}
                                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Modifier
                                    </button>
                                    <button
                                        onClick={() => handleOpenDelete(user)}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Supprimer le compte utilisateur"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal de création */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Créer un utilisateur</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe *</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Minimum 8 caractères"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                <input
                                    type="text"
                                    value={newUser.full_name}
                                    onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={newUser.username}
                                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="johndoe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as 'admin' | 'developer' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="developer">Développeur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
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
                                onClick={handleCreateUser}
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
                                        <UserPlus className="w-4 h-4" />
                                        Créer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal d'édition */}
            {showEditModal && selectedUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Modifier l'utilisateur</h2>
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={editUser.email}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
                                <input
                                    type="text"
                                    value={editUser.full_name}
                                    onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                <input
                                    type="text"
                                    value={editUser.username}
                                    onChange={(e) => setEditUser({ ...editUser, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="johndoe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
                                <select
                                    value={editUser.role}
                                    onChange={(e) => setEditUser({ ...editUser, role: e.target.value as 'admin' | 'developer' })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="developer">Développeur</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={loading}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Enregistrer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de suppression */}
            {showDeleteModal && userToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-red-600">Supprimer le compte</h2>
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                    setDeleteConfirmText('');
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                disabled={loading}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-sm text-red-800 font-semibold mb-2">
                                    ⚠️ Attention : Cette action est irréversible !
                                </p>
                                <p className="text-sm text-red-700">
                                    La suppression du compte de <strong>{userToDelete.full_name || userToDelete.username || userToDelete.email}</strong> supprimera définitivement :
                                </p>
                                <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
                                    <li>Le profil utilisateur</li>
                                    <li>Tous les projets</li>
                                    <li>Tous les devis</li>
                                    <li>Les abonnements</li>
                                    <li>Les analytics</li>
                                    <li>Toutes les données associées</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pour confirmer, tapez <strong className="text-red-600">SUPPRIMER</strong> :
                                </label>
                                <input
                                    type="text"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="SUPPRIMER"
                                    disabled={loading}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                    setDeleteConfirmText('');
                                }}
                                disabled={loading}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={loading || deleteConfirmText !== 'SUPPRIMER'}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer définitivement
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
