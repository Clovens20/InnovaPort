"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function FixSubscriptionPage() {
    const { t } = useTranslation();
    const [userId, setUserId] = useState("a2899617-429d-4e52-8862-ea0ab3d035f7");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFix = async () => {
        if (!userId.trim()) {
            setError("Veuillez entrer un User ID");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch("/api/admin/fix-subscription", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: userId.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erreur lors de la correction");
            }

            setResult(data);
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Correction d'abonnement
            </h1>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="mb-4">
                    <label
                        htmlFor="userId"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        User ID
                    </label>
                    <input
                        id="userId"
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                        placeholder="Entrez l'ID de l'utilisateur"
                    />
                </div>

                <button
                    onClick={handleFix}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? "Correction en cours..." : "Corriger l'abonnement"}
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="text-red-800 font-semibold mb-2">Erreur</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-green-800 font-semibold mb-4">
                        ✅ Correction réussie
                    </h3>
                    <div className="space-y-2 text-sm">
                        <p>
                            <strong>User ID:</strong> {result.userId}
                        </p>
                        <p>
                            <strong>Plan précédent:</strong> {result.currentPlan}
                        </p>
                        <p>
                            <strong>Plan correct:</strong> {result.correctPlan}
                        </p>
                        <p>
                            <strong>Abonnement Stripe:</strong>{" "}
                            {result.hasStripeSubscription ? "Oui" : "Non"}
                        </p>
                        {result.stripeSubscriptionStatus && (
                            <p>
                                <strong>Statut Stripe:</strong>{" "}
                                {result.stripeSubscriptionStatus}
                            </p>
                        )}
                        {result.corrections && result.corrections.length > 0 && (
                            <div className="mt-4">
                                <strong>Corrections appliquées:</strong>
                                <ul className="list-disc list-inside mt-2">
                                    {result.corrections.map(
                                        (correction: string, index: number) => (
                                            <li key={index}>{correction}</li>
                                        )
                                    )}
                                </ul>
                            </div>
                        )}
                        <p className="mt-4 text-green-700 font-medium">
                            {result.message}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

