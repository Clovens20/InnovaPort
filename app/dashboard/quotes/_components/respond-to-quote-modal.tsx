"use client";

import { useState } from "react";
import { X, Loader2, Send, Mail } from "lucide-react";
import { Quote } from "@/types";

interface RespondToQuoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    quote: Quote;
    onSuccess?: () => void;
}

export default function RespondToQuoteModal({
    isOpen,
    onClose,
    quote,
    onSuccess,
}: RespondToQuoteModalProps) {
    const [response, setResponse] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!response.trim()) {
            setError("Veuillez écrire une réponse");
            return;
        }

        setSending(true);
        try {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                throw new Error("Non authentifié");
            }

            // Récupérer l'email du développeur depuis le profil
            const { data: profile } = await supabase
                .from("profiles")
                .select("email")
                .eq("id", user.id)
                .single();

            const responseData = await fetch(`/api/quotes/${quote.id}/respond`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${user.id}`, // Simple auth check
                },
                body: JSON.stringify({
                    response: response.trim(),
                    developerEmail: profile?.email || undefined,
                }),
            });

            const data = await responseData.json();

            if (!responseData.ok) {
                throw new Error(data.error || "Erreur lors de l'envoi");
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                setResponse("");
                setSuccess(false);
                if (onSuccess) onSuccess();
            }, 2000);
        } catch (err: any) {
            console.error("Error sending response:", err);
            setError(err.message || "Erreur lors de l'envoi de la réponse");
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-sky-500" />
                        <h2 className="text-xl font-semibold text-gray-900">
                            Répondre à {quote.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        disabled={sending}
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Réponse envoyée avec succès !
                        </div>
                    )}

                    {/* Informations du prospect */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                            Informations du prospect
                        </h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-500">Nom:</span>
                                <span className="ml-2 text-gray-900 font-medium">{quote.name}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Email:</span>
                                <span className="ml-2 text-gray-900">{quote.email}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Type de projet:</span>
                                <span className="ml-2 text-gray-900 font-medium">{quote.project_type}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Budget:</span>
                                <span className="ml-2 text-gray-900 font-medium text-sky-600">{quote.budget}</span>
                            </div>
                        </div>
                    </div>

                    {/* Champ de réponse */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Votre réponse *
                        </label>
                        <textarea
                            value={response}
                            onChange={(e) => setResponse(e.target.value)}
                            rows={12}
                            placeholder="Bonjour [Nom du prospect],

Merci pour votre demande concernant [Type de projet].

[Votre réponse personnalisée ici...]

Cordialement,
[Votre nom]"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent outline-none resize-none"
                            required
                            disabled={sending || success}
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Votre réponse sera envoyée par email au prospect avec tous les détails de sa demande.
                        </p>
                    </div>

                    {/* Aperçu des détails qui seront inclus */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                            📋 Les détails suivants seront inclus dans l'email :
                        </h4>
                        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
                            <li>Type de projet : {quote.project_type}</li>
                            <li>Budget : {quote.budget}</li>
                            {quote.deadline && <li>Délai souhaité : {quote.deadline}</li>}
                            {quote.features && quote.features.length > 0 && (
                                <li>Fonctionnalités : {quote.features.join(", ")}</li>
                            )}
                            <li>Description complète du projet</li>
                        </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            disabled={sending || success}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={sending || success || !response.trim()}
                            className="px-6 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {sending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : success ? (
                                <>
                                    <Send className="w-4 h-4" />
                                    Envoyé !
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Envoyer la réponse
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

