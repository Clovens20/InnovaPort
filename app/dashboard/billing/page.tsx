import { Suspense } from "react";
import { BillingClient } from "./billing-client";

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="max-w-6xl mx-auto py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-48 mb-12"></div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-96 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        }>
            <BillingClient />
        </Suspense>
    );
}
