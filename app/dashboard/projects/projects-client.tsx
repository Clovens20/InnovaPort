/**
 * Component: ProjectsClient
 * 
 * Fonction: Composant client pour les actions interactives sur les projets (suppression, etc.)
 * Dépendances: react, next/navigation
 * Raison: Permet les actions côté client comme la suppression de projets
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Project {
    id: string;
    title: string;
    published: boolean;
}

export function ProjectsClient({ projects }: { projects: Project[] }) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (projectId: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) {
            return;
        }

        setDeletingId(projectId);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) {
                throw error;
            }

            router.refresh();
        } catch (error) {
            // Log error for debugging (in production, this would go to a logging service)
            if (process.env.NODE_ENV === 'development') {
                console.error('Error deleting project:', error);
            }
            alert('Erreur lors de la suppression du projet');
        } finally {
            setDeletingId(null);
        }
    };

    // Ce composant peut être étendu pour d'autres actions
    return null;
}
