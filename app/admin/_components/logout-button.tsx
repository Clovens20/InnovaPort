'use client';

import { LogOut } from "lucide-react";

export function LogoutButton() {
    const handleLogout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // S'assurer que c'est bien une intention de déconnexion
        if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            return;
        }
        // Soumettre le formulaire
        const form = e.currentTarget;
        form.submit();
    };

    return (
        <form 
            action="/auth/signout" 
            method="post"
            onSubmit={handleLogout}
        >
            <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
            </button>
        </form>
    );
}

