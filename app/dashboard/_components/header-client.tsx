'use client';

import Link from "next/link";
import { Plus } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export function HeaderClient({ userInitials, userName }: { userInitials: string; userName: string }) {
    const { t } = useTranslation();
    
    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
            <div className="flex items-center gap-4">
                <h1 className="text-sm font-medium text-gray-500">{t('dashboard.workspace')}</h1>
            </div>

            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <Link
                    href="/dashboard/projects/new"
                    className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all text-sm font-semibold shadow-lg shadow-sky-500/30 hover:shadow-xl hover:shadow-sky-500/40"
                >
                    <Plus className="w-4 h-4 text-white" />
                    {t('dashboard.addProject')}
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20">
                        {userInitials}
                    </div>
                    <div className="text-sm hidden sm:block">
                        <p className="font-semibold text-gray-900">{userName}</p>
                        <p className="text-xs text-gray-500">{t('dashboard.developer')}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

