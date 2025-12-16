import { Suspense } from "react";
import { LegalPageHistoryClient } from "./legal-page-history-client";

export default function LegalPageHistoryPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Suspense fallback={
                    <div className="animate-pulse">
                        <div className="h-12 bg-gray-200 rounded mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                }>
                    <LegalPageHistoryClient params={params} />
                </Suspense>
            </div>
        </div>
    );
}

