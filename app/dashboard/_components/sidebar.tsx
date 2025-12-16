"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, MessageSquareQuote, Palette, CreditCard, LogOut, Plus, Settings, Globe, Star, BarChart3, Menu, X } from "lucide-react";
import clsx from "clsx";
import { createClient } from "@/utils/supabase/client";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useState, useEffect } from "react";

export function Sidebar() {
    const { t } = useTranslation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

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

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="Toggle menu"
                aria-expanded={mobileMenuOpen}
            >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "w-64 bg-white border-r border-gray-200 flex flex-col h-full fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out",
                    "lg:translate-x-0",
                    mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
                )}
                role="navigation"
                aria-label="Dashboard navigation"
            >
                <div className="p-4 sm:p-6 border-b border-gray-100 flex justify-center">
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <Image
                            src="/innovaport-logo.png"
                            alt="InnovaPort Logo"
                            width={320}
                            height={96}
                            className="w-auto h-16 sm:h-20 md:h-24 object-contain"
                            priority
                            sizes="(max-width: 1024px) 200px, 320px"
                        />
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                                    isActive
                                        ? "bg-primary/10 text-primary border-l-4 border-primary"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <item.icon className={clsx("w-5 h-5 flex-shrink-0", isActive ? "text-primary" : "text-gray-400")} aria-hidden="true" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    
                    {/* Bouton ajouter projet proéminent */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <Link
                            href="/dashboard/projects/new"
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        >
                            <Plus className="w-5 h-5 text-white flex-shrink-0" aria-hidden="true" />
                            <span>{t('dashboard.addProject')}</span>
                        </Link>
                    </div>
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-50 hover:text-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label="Logout"
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                        <span>{t('dashboard.sidebar.logout')}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
