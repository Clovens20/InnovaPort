'use client';

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

export function LogoutButton() {
    const router = useRouter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        // S'assurer que c'est bien une intention de déconnexion
        if (!confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
            return;
        }

        setIsLoggingOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            
            // Rediriger vers la page de login admin
            router.push('/admin/login');
            router.refresh();
        } catch (error) {
            console.error('Error logging out:', error);
            alert('Erreur lors de la déconnexion');
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">
                {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
            </span>
        </button>
    );
}

