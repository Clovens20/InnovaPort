import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { PageTracker } from "./_components/page-tracker";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "InnovaPort - Gérez vos Projets & Devis en un clic",
  description: "La plateforme tout-en-un pour les freelances et agences. Créez des portfolios époustouflants, recevez des demandes de devis qualifiées et gérez votre business.",
  icons: {
    icon: "/innovaport-logo.png",
    apple: "/innovaport-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <Suspense fallback={null}>
            <PageTracker />
          </Suspense>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
