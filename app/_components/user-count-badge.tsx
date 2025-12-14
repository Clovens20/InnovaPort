'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export function UserCountBadge() {
    const [userCount, setUserCount] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserCount();
    }, []);

    const loadUserCount = async () => {
        try {
            const supabase = createClient();

            // Compter le nombre d'utilisateurs dans la table profiles
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true });

            if (error) throw error;

            // Ajouter 50 au nombre réel d'utilisateurs
            setUserCount((count || 0) + 50);
        } catch (error) {
            console.error('Error loading user count:', error);
            // En cas d'erreur, afficher 50 par défaut
            setUserCount(50);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        // Afficher une valeur par défaut pendant le chargement
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-sm font-bold mb-8">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Rejoint par 50+ freelances
            </div>
        );
    }

    return (
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-sm font-bold mb-8">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Rejoint par {userCount}+ freelances
        </div>
    );
}

