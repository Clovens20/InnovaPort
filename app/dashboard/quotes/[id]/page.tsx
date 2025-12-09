"use client";

import { Mail, Phone, MapPin, Calendar, Paperclip, Clock, Download, Star } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function QuoteDetailPage() {
    const params = useParams();
    const id = params.id as string;

    // Mock data - normally fetched via API
    const quote = {
        id,
        name: "Marie Dubois",
        company: "Artisan & Co",
        email: "marie.dubois@email.com",
        phone: "+33 6 12 34 56 78",
        location: "Paris, France",
        projectType: "Site E-commerce",
        budget: "5 000€ - 10 000€",
        deadline: "1-3 mois",
        features: ["Paiement en ligne", "Gestion de contenu", "Dashboard admin", "Stripe"],
        fullDescription: "Je souhaite créer une boutique en ligne pour vendre des produits artisanaux. J'ai besoin d'une interface simple pour gérer mes produits et mes commandes. J'aimerais également un blog pour partager mes créations.",
        hasVagueIdea: false,
        attachments: [
            { name: "Cahier_des_charges.pdf", size: "2.4 MB", url: "#" },
            { name: "Inspiration_design.jpg", size: "1.2 MB", url: "#" }
        ],
        receivedAt: "9 décembre 2024 à 14:30"
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">

                {/* Header */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Demande de {quote.name}</h1>
                            <p className="text-gray-500 mt-1">Reçue le {quote.receivedAt}</p>
                        </div>

                        <select className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary outline-none">
                            <option value="new">Nouvelle</option>
                            <option value="discussing">En discussion</option>
                            <option value="quoted">Devis envoyé</option>
                            <option value="accepted">Acceptée</option>
                            <option value="rejected">Refusée</option>
                        </select>
                    </div>
                </div>

                {/* Client Info */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations du client</h2>
                    <dl className="grid grid-cols-2 gap-y-6 gap-x-4">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Nom</dt>
                            <dd className="mt-1 text-base text-gray-900">{quote.name}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Entreprise</dt>
                            <dd className="mt-1 text-base text-gray-900">{quote.company}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Email</dt>
                            <dd className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" /> {quote.email}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                            <dd className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" /> {quote.phone}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Localisation</dt>
                            <dd className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" /> {quote.location}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Préférence de contact</dt>
                            <dd className="mt-1 text-base text-gray-900">Email</dd>
                        </div>
                    </dl>
                </div>

                {/* Project Details */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Détails du projet</h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Type de projet</p>
                                <p className="mt-1 text-base text-gray-900 font-medium">{quote.projectType}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Budget estimé</p>
                                <p className="mt-1 text-base text-gray-900 font-medium text-primary">{quote.budget}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-gray-500">Délai souhaité</p>
                                <p className="mt-1 text-base text-gray-900 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400" /> {quote.deadline}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Fonctionnalités demandées</p>
                            <div className="flex flex-wrap gap-2">
                                {quote.features.map(feature => (
                                    <span key={feature} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border border-gray-200">
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-2">Description du projet</p>
                            <div className="p-4 bg-gray-50 rounded-lg text-gray-900 text-sm leading-relaxed border border-gray-100">
                                {quote.fullDescription}
                            </div>
                        </div>

                        {quote.attachments.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Fichiers joints</p>
                                <div className="space-y-2">
                                    {quote.attachments.map((file, i) => (
                                        <a
                                            key={i}
                                            href={file.url}
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 border border-gray-100 transition-colors group"
                                        >
                                            <Paperclip className="w-4 h-4 text-gray-400 group-hover:text-primary" />
                                            <span className="text-sm text-gray-900 font-medium">{file.name}</span>
                                            <span className="text-xs text-gray-500">({file.size})</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Internal Notes */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes internes</h2>
                    <textarea
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        placeholder="Ajoutez des notes privées sur cette demande..."
                    />
                    <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors">
                        Enregistrer les notes
                    </button>
                </div>
            </div>

            {/* Sidebar Actions */}
            <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                    <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>
                    <div className="space-y-3">
                        <button className="w-full px-4 py-2.5 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2 font-medium">
                            <Mail className="w-4 h-4" />
                            Envoyer un email
                        </button>
                        <button className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium">
                            <Download className="w-4 h-4" />
                            Exporter en PDF
                        </button>
                        <button className="w-full px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium">
                            <Star className="w-4 h-4" />
                            Marquer comme urgent
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-900 mb-3">Historique</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-900">Demande reçue</p>
                                    <p className="text-xs text-gray-500 mt-0.5">Il y a 2 heures</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
