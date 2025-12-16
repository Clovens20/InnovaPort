'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export function LegalNav() {
    const { t } = useTranslation();

    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm" role="navigation" aria-label="Navigation principale">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
                        aria-label={t('legal.backToHome')}
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
                        <span className="text-sm font-medium hidden sm:inline">{t('legal.backToHome')}</span>
                    </Link>
                    <Link href="/" aria-label="Innovaport" className="flex-shrink-0">
                        <Image
                            src="/innovaport-logo.png"
                            alt="InnovaPort Logo"
                            width={200}
                            height={60}
                            className="h-12 sm:h-16 w-auto object-contain"
                            priority
                            sizes="(max-width: 640px) 150px, 200px"
                        />
                    </Link>
                    <LanguageSwitcher />
                </div>
            </div>
        </nav>
    );
}

