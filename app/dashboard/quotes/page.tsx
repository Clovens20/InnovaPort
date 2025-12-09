"use client";

import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, Clock, MoreVertical } from "lucide-react";

const quotes = [
    {
        id: "1",
        name: "Marie Dubois",
        email: "marie.dubois@email.com",
        phone: "+33 6 12 34 56 78",
        projectType: "Site E-commerce",
        budget: "5 000€ - 10 000€",
        description: "Je souhaite créer une boutique en ligne pour vendre des produits artisanaux...",
        status: "new",
        date: "Il y a 2 heures",
    },
    {
        id: "2",
        name: "Thomas Bernard",
        email: "thomas.b@startup.io",
        phone: "+33 6 98 76 54 32",
        projectType: "Application Mobile",
        budget: "10 000€ - 20 000€",
        description: "MVP pour une app de livraison locale...",
        status: "discussing",
        date: "Il y a 1 jour",
    },
    // Add more mock data if needed
];

const tabs = [
    { id: "all", label: "Toutes", count: 24 },
    { id: "new", label: "Nouvelles", count: 3, dot: true },
    { id: "discussing", label: "En discussion", count: 5 },
    { id: "quoted", label: "Devis envoyé", count: 8 },
    { id: "accepted", label: "Acceptées", count: 6 },
    { id: "rejected", label: "Refusées", count: 2 },
];

export default function QuotesPage() {
    const [activeTab, setActiveTab] = useState("all");

    const filteredQuotes = activeTab === "all"
        ? quotes
        : quotes.filter(q => q.status === activeTab);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Demandes de cotation</h1>
                {/* Statistics could go here */}
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="flex gap-8 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "pb-4 px-1 text-sm font-medium whitespace-nowrap transition-colors relative",
                                activeTab === tab.id
                                    ? "border-b-2 border-primary text-primary"
                                    : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            {tab.label} <span className="text-xs ml-1 bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">{tab.count}</span>
                            {tab.dot && <span className="absolute top-0 right-[-6px] w-2 h-2 rounded-full bg-red-500" />}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Quote List */}
            <div className="space-y-4">
                {filteredQuotes.map(quote => (
                    <div key={quote.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                {quote.status === "new" && (
                                    <span className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                                        NOUVELLE
                                    </span>
                                )}

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{quote.name}</h3>
                                <p className="text-gray-600 font-medium mb-2">
                                    {quote.projectType} · Budget: <span className="text-gray-900">{quote.budget}</span>
                                </p>

                                <p className="text-sm text-gray-500 line-clamp-2 max-w-3xl mb-4">
                                    {quote.description}
                                </p>

                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                    <span className="flex items-center gap-2">
                                        <Mail className="w-4 h-4" /> {quote.email}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Phone className="w-4 h-4" /> {quote.phone}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" /> {quote.date}
                                    </span>
                                </div>
                            </div>

                            <div className="flex gap-2 ml-4 self-center">
                                <Link
                                    href={`/dashboard/quotes/${quote.id}`}
                                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                                >
                                    Voir détails
                                </Link>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredQuotes.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Aucune demande trouvée pour ce filtre.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
