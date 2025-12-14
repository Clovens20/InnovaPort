'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { checkIsAdmin } from '@/utils/auth/adminCheck';
import { Loader2 } from 'lucide-react';

export function AdminGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const verifyAdmin = async () => {
            setIsChecking(true);
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
            setIsChecking(false);
        };

        verifyAdmin();
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

