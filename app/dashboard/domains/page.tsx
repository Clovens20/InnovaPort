'use client';

import { Suspense } from 'react';
import { DomainsClient } from './domains-client';

export default function DomainsPage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
                    <div className="h-96 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        }>
            <DomainsClient />
        </Suspense>
    );
}

