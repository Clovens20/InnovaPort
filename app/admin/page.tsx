// app/admin/page.tsx
import React from "react";
import Link from "next/link";
import { Shield, Settings, DollarSign, FileText, Palette, Users, Globe, LogOut, MessageSquare } from "lucide-react";
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export const metadata = {
    title: "Admin | InnovaPort",
};

export default async function AdminPage() {
    // Récupérer les données utilisateur pour affichage
    // La vérification admin est faite par AdminGuard côté client
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('role, full_name, email')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 space-y-10">
                    {/* Header avec info admin */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-6 h-6 text-blue-600" />
                                <p className="text-sm uppercase font-semibold text-blue-600">
                                    Administration
                                </p>
                            </div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Panneau de contrôle
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Gérez l'ensemble du site : pages, tarifs, apparence et accès.
                            </p>
                        </div>
                        
                        <div className="flex gap-3 items-center">
                            {/* Info utilisateur */}
                            <div className="text-right mr-4 hidden md:block">
                                <p className="text-sm font-medium text-gray-900">
                                    {profile?.full_name || 'Admin'}
                                </p>
                                <p className="text-xs text-gray-500">{profile?.email}</p>
                            </div>

                            {/* Boutons d'action */}
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-800 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                            >
                                <Globe className="w-4 h-4" />
                                <span className="hidden sm:inline">Voir le site</span>
                            </Link>
                            
                            <form action="/auth/signout" method="post">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Déconnexion</span>
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Grille des modules admin */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AdminCard
                            icon={<Users className="w-5 h-5 text-orange-600" />}
                            title="Gestion des Projets"
                            description="Gérer tous les projets de tous les développeurs (publier, modifier, supprimer)."
                            href="/admin/projects"
                        />
                        <AdminCard
                            icon={<Users className="w-5 h-5 text-pink-600" />}
                            title="Social Proof"
                            description="Gérer les entreprises et freelances affichés sur la page d'accueil."
                            href="/admin/social-proof"
                        />
                        <AdminCard
                            icon={<Users className="w-5 h-5 text-cyan-600" />}
                            title="Gestion des Utilisateurs"
                            description="Créer des admins et gérer tous les utilisateurs du système (admins et développeurs)."
                            href="/admin/users"
                        />
                        <AdminCard
                            icon={<Settings className="w-5 h-5 text-indigo-600" />}
                            title="Mon Profil Admin"
                            description="Compléter et gérer votre profil administrateur."
                            href="/admin/settings"
                        />
                        <AdminCard
                            icon={<DollarSign className="w-5 h-5 text-yellow-600" />}
                            title="Codes Promotionnels"
                            description="Créer et gérer les codes promo pour les développeurs."
                            href="/admin/promoCodes"
                        />
                        <AdminCard
                            icon={<Shield className="w-5 h-5 text-red-600" />}
                            title="Sécurité"
                            description="Gestion des rôles et permissions administrateurs."
                            href="/admin/security"
                        />
                        {/* Modules admin à venir - pas de liens vers dashboard */}
                        <AdminCard
                            icon={<Settings className="w-5 h-5 text-blue-600" />}
                            title="Pages & contenu"
                            description="Modifier toutes les pages (landing, portfolio)."
                            href="/admin/content"
                        />
                        <AdminCard
                            icon={<DollarSign className="w-5 h-5 text-green-600" />}
                            title="Plans & prix"
                            description="Mettre à jour les prix des abonnements et options."
                            href="/admin/billing"
                        />
                        <AdminCard
                            icon={<Palette className="w-5 h-5 text-purple-600" />}
                            title="Apparence"
                            description="Couleurs, logos, favicon et thèmes."
                            href="/admin/appearance"
                        />
                        <AdminCard
                            icon={<FileText className="w-5 h-5 text-indigo-600" />}
                            title="Devis & formulaires"
                            description="Configurer le formulaire de devis et suivre les demandes."
                            href="/admin/quotes"
                        />
                        <AdminCard
                            icon={<Users className="w-5 h-5 text-teal-600" />}
                            title="Avis Développeurs"
                            description="Gérer les témoignages des développeurs sur la plateforme."
                            href="/admin/testimonials"
                        />
                        <AdminCard
                            icon={<FileText className="w-5 h-5 text-blue-600" />}
                            title="Pages Légales"
                            description="Gérer et modifier le contenu des pages légales (Mentions, Confidentialité, Cookies, etc.)."
                            href="/admin/legal-pages"
                        />
                        <AdminCard
                            icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
                            title="Messages & Newsletter"
                            description="Consulter les messages de contact et gérer les inscriptions à la newsletter."
                            href="/admin/messages"
                        />
                    </div>

                    {/* Message de sécurité */}
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h2 className="text-lg font-semibold text-green-900 mb-2">
                                    🔒 Interface sécurisée
                                </h2>
                                <p className="text-sm text-green-800 leading-relaxed">
                                    Cette interface est protégée par un système de rôles multi-niveaux. 
                                    Seuls les utilisateurs avec le rôle "admin" peuvent accéder à cette page. 
                                    La vérification est effectuée côté serveur (middleware), dans les composants serveur, 
                                    et renforcée côté client (AdminGuard).
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
    );
}

function AdminCard({
    icon,
    title,
    description,
    href,
    disabled = false,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    disabled?: boolean;
}) {
    if (disabled) {
        return (
            <div className="group block bg-white border border-gray-200 rounded-xl p-6 shadow-sm opacity-60 cursor-not-allowed">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0">
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
                <div className="flex items-center text-sm font-medium text-gray-400">
                    Bientôt disponible
                </div>
            </div>
        );
    }

    return (
        <Link
            href={href}
            className="group block bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all duration-200"
        >
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    {icon}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
            <div className="flex items-center text-sm font-semibold text-blue-600 group-hover:text-blue-700 group-hover:translate-x-1 transition-all">
                Ouvrir
                <span className="ml-1">→</span>
            </div>
        </Link>
    );
}