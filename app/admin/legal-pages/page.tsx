import { Suspense } from "react";
import { LegalPagesClient } from "./legal-pages-client";

export default function LegalPagesAdminPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Pages Légales</h1>
                    <p className="text-gray-600">
                        Gérez et modifiez le contenu des pages légales du site
                    </p>
                </div>
                <Suspense fallback={
                    <div className="animate-pulse">
                        <div className="h-12 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                }>
                    <LegalPagesClient />
                </Suspense>
            </div>
        </div>
    );
}

