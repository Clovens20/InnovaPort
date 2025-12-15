"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, MessageSquareQuote, Palette, CreditCard, LogOut, Plus, Settings, Globe, Star, BarChart3 } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";

export function Sidebar() {
    const { t } = useTranslation();
    const navItems = [
        { href: "/dashboard", label: t('dashboard.sidebar.dashboard'), icon: LayoutDashboard },
        { href: "/dashboard/projects", label: t('dashboard.sidebar.projects'), icon: FolderKanban },
        { href: "/dashboard/quotes", label: t('dashboard.sidebar.quotes'), icon: MessageSquareQuote },
        { href: "/dashboard/testimonials", label: t('dashboard.sidebar.testimonials'), icon: Star },
        { href: "/dashboard/portfolio", label: t('dashboard.sidebar.portfolio'), icon: Globe },
        { href: "/dashboard/analytics", label: t('dashboard.sidebar.analytics'), icon: BarChart3 },
        { href: "/dashboard/appearance", label: t('dashboard.sidebar.appearance'), icon: Palette },
        { href: "/dashboard/billing", label: t('dashboard.sidebar.subscription'), icon: CreditCard },
        { href: "/dashboard/settings", label: t('dashboard.sidebar.settings'), icon: Settings },
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
                        {t('dashboard.addProject')}
                    </Link>
                </div>
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors"
                >
                    <LogOut className="w-5 h-5" />
                    {t('dashboard.sidebar.logout')}
                </button>
            </div>
        </aside>
    );
}
