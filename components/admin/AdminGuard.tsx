'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkIsAdmin } from '@/utils/auth/adminCheck';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const lastCheckRef = useRef<number>(0);
    const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Si on est sur la page de login admin, toujours autoriser sans vérification
        if (pathname === '/admin/login') {
            setIsAuthorized(true);
            setIsChecking(false);
            return;
        }

        const verifyAdmin = async () => {
            // OPTIMISATION: Éviter les vérifications trop fréquentes (max 1 fois toutes les 2 secondes)
            const now = Date.now();
            const timeSinceLastCheck = now - lastCheckRef.current;
            
            if (timeSinceLastCheck < 2000 && lastCheckRef.current > 0) {
                // Si une vérification a été faite récemment, ne pas re-vérifier
                return;
            }

            setIsChecking(true);
            lastCheckRef.current = now;

            try {
                const isAdmin = await checkIsAdmin();
                
                if (!isAdmin) {
                    // Si on n'est pas sur la page de login admin, rediriger
                    if (pathname !== '/admin/login') {
                        router.push('/admin/login');
                    }
                    setIsAuthorized(false);
                } else {
                    setIsAuthorized(true);
                }
            } catch (error) {
                console.error('Error verifying admin status:', error);
                // En cas d'erreur, ne pas déconnecter immédiatement
                // Attendre un peu et réessayer une fois
                if (lastCheckRef.current === now) {
                    // Si c'est la première tentative, réessayer après 1 seconde
                    checkTimeoutRef.current = setTimeout(async () => {
                        try {
                            const retryIsAdmin = await checkIsAdmin();
                            if (!retryIsAdmin && pathname !== '/admin/login') {
                                router.push('/admin/login');
                            }
                            setIsAuthorized(retryIsAdmin);
                        } catch (retryError) {
                            console.error('Retry failed:', retryError);
                            // Seulement déconnecter si la deuxième tentative échoue aussi
                            if (pathname !== '/admin/login') {
                                router.push('/admin/login');
                            }
                            setIsAuthorized(false);
                        } finally {
                            setIsChecking(false);
                        }
                    }, 1000);
                    return; // Ne pas mettre setIsChecking(false) ici car on va réessayer
                } else {
                    // Si c'est déjà un retry qui a échoué, déconnecter
                    if (pathname !== '/admin/login') {
                        router.push('/admin/login');
                    }
                    setIsAuthorized(false);
                }
            } finally {
                if (!checkTimeoutRef.current) {
                    setIsChecking(false);
                }
            }
        };

        verifyAdmin();

        // Cleanup: annuler le timeout si le composant est démonté ou si pathname change
        return () => {
            if (checkTimeoutRef.current) {
                clearTimeout(checkTimeoutRef.current);
                checkTimeoutRef.current = null;
            }
        };
    }, [router, pathname]);

    // Si on est sur la page de login admin, toujours autoriser
    if (pathname === '/admin/login') {
        return <>{children}</>;
    }

    if (isChecking || isAuthorized === null) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}

