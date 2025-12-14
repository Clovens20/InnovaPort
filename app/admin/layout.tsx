/**
 * Layout Admin
 * 
 * Layout dédié pour toutes les routes /admin/*
 * S'assure que seule l'interface admin est utilisée, sans mélange avec le dashboard
 */

import { AdminGuard } from '@/components/admin/AdminGuard';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // La vérification admin est faite par AdminGuard côté client
    // Cela évite les redirections immédiates côté serveur
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-50">
                {children}
            </div>
        </AdminGuard>
    );
}

