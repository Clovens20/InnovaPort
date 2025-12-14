"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, MessageSquareQuote, Palette, CreditCard, LogOut, Plus, Settings, Globe, Star, BarChart3 } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
export function Sidebar() {
    const navItems = [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/projects", label: "Projets", icon: FolderKanban },
        { href: "/dashboard/quotes", label: "Devis", icon: MessageSquareQuote },
        { href: "/dashboard/testimonials", label: "Témoignages", icon: Star },
        { href: "/dashboard/portfolio", label: "Portfolio", icon: Globe },
        { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/dashboard/appearance", label: "Apparence", icon: Palette },
        { href: "/dashboard/billing", label: "Abonnement", icon: CreditCard },
        { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
    ];

    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full fixed left-0 top-0 z-30">
            <div className="p-6 border-b border-gray-100 flex justify-center">
                <Link href="/dashboard">
                    <Image src="/innovaport-logo.png" alt="InnovaPort" width={320} height={96} className="w-auto h-24 object-contain" priority />
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all",
                                isActive
                                    ? "bg-primary/10 text-primary border-l-4 border-primary"
                                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            )}
                        >
                            <item.icon className={clsx("w-5 h-5", isActive ? "text-primary" : "text-gray-400")} />
                            {item.label}
                        </Link>
                    );
                })}
                
                {/* Bouton ajouter projet proéminent */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <Link
                        href="/dashboard/projects/new"
                        className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-semibold text-sm"
                    >
                        <Plus className="w-5 h-5 text-white" />
                        Ajouter un projet
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    Déconnexion
                </button>
            </div>
        </aside>
    );
}
