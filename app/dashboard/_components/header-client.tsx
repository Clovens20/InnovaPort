'use client';

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export function HeaderClient({ userInitials, userName }: { userInitials: string; userName: string }) {
    const { t } = useTranslation();
    
    return (
        <header className="h-14 sm:h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-20 shadow-sm" role="banner">
            <div className="flex items-center gap-2 sm:gap-4">
                <h1 className="text-xs sm:text-sm font-medium text-gray-500">{t('dashboard.workspace')}</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
                <div className="hidden sm:block">
                    <LanguageSwitcher />
                </div>
                <Link
                    href="/dashboard/projects/new"
                    className="hidden sm:flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all text-xs sm:text-sm font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                    aria-label="Add new project"
                >
                    <Plus className="w-4 h-4 text-white" aria-hidden="true" />
                    <span className="hidden md:inline">{t('dashboard.addProject')}</span>
                </Link>
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-xs sm:text-sm border-2 border-primary/20" aria-label={`User ${userName}`}>
                        {userInitials}
                    </div>
                    <div className="text-xs sm:text-sm hidden md:block">
                        <p className="font-semibold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{t('dashboard.developer')}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

