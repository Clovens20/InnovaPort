'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layout, RefreshCw, CreditCard, ShieldCheck, Palette } from "lucide-react";
import { DashboardPreview } from "./_components/dashboard-preview";
import { SocialProofSection } from "./_components/social-proof-section";
import { UserCountBadge } from "./_components/user-count-badge";
import { TestimonialsSection } from "./_components/testimonials-section";
import { DeveloperTestimonialsSection } from "./_components/developer-testimonials-section";
import { LanguageSwitcher } from "./_components/language-switcher";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function Home() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Navbar Logo */}
          <div className="flex items-center gap-3">
            <Image
              src="/innovaport-logo.png"
              alt="InnovaPort"
              width={400}
              height={120}
              priority
              className="h-36 w-auto object-contain"
            />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-[#1E3A8A] transition-colors">{t('nav.features')}</a>
            <a href="#how-it-works" className="hover:text-[#1E3A8A] transition-colors">{t('nav.howItWorks')}</a>
            <a href="#pricing" className="hover:text-[#1E3A8A] transition-colors">{t('nav.pricing')}</a>
          </div>

          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-gray-700 hover:text-[#1E3A8A] transition-colors"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-900/10"
            >
              {t('nav.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <UserCountBadge />

            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              {t('hero.title')} <span className="text-[#10B981]">{t('hero.titleProjects')}</span> & <span className="text-[#1E3A8A]">{t('hero.titleQuotes')}</span> {t('hero.titleSuffix')}
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
              {t('hero.subtitle')}<br />
              {t('hero.subtitle2')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-lg hover:bg-[#1E40AF] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                {t('hero.startFree')}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/preview/demo"
                className="px-8 py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center shadow-sm"
              >
                {t('hero.viewDemo')}
              </Link>
            </div>

            <SocialProofSection />
          </div>

          <div className="relative lg:h-[600px] w-full hidden lg:block">
            {/* Abstract Shapes */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#1E3A8A]/10 rounded-full blur-3xl" />

            {/* Real Dashboard Preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">{t('features.title')}</h2>
            <p className="text-lg text-gray-600">{t('features.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { titleKey: "features.portfolioBuilder.title", descKey: "features.portfolioBuilder.desc", icon: <Layout className="text-[#10B981]" /> },
              { titleKey: "features.quoteManagement.title", descKey: "features.quoteManagement.desc", icon: <CreditCard className="text-[#1E3A8A]" /> },
              { titleKey: "features.customization.title", descKey: "features.customization.desc", icon: <Palette className="text-purple-500" /> },
              { titleKey: "features.automation.title", descKey: "features.automation.desc", icon: <RefreshCw className="text-amber-500" /> },
              { titleKey: "features.secured.title", descKey: "features.secured.desc", icon: <ShieldCheck className="text-blue-500" /> },
            ].map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{t(feat.titleKey)}</h3>
                <p className="text-gray-600 leading-relaxed">{t(feat.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">{t('howItWorks.title')}</h2>
            <p className="text-lg text-gray-600">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">1</div>
              <h3 className="text-xl font-bold mb-3">{t('howItWorks.step1.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step1.desc')}</p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">2</div>
              <h3 className="text-xl font-bold mb-3">{t('howItWorks.step2.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step2.desc')}</p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-16 h-16 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">3</div>
              <h3 className="text-xl font-bold mb-3">{t('howItWorks.step3.title')}</h3>
              <p className="text-gray-600">{t('howItWorks.step3.desc')}</p>
            </div>

            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-blue-50 -z-0" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">{t('pricing.title')}</h2>
            <p className="text-lg text-gray-600">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('pricing.free.title')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t('pricing.free.price')}</span>
                <span className="text-gray-600 text-lg">{t('pricing.free.period')}</span>
              </div>
              <ul className="space-y-3 mb-8 text-gray-600 text-sm">
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div> {t('pricing.features.basicPortfolio')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div> {t('pricing.features.oneProject')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div> {t('pricing.features.fiveQuotes')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">✓</div> {t('pricing.features.communitySupport')}</li>
              </ul>
              <Link href="/auth/register" className="block w-full py-3 bg-gray-100 text-gray-900 font-semibold text-center rounded-xl hover:bg-gray-200 transition-colors">{t('pricing.free.startFree')}</Link>
            </div>

            {/* Pro */}
            <div className="bg-[#1E3A8A] p-8 rounded-2xl shadow-xl text-white transform md:-translate-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-[#1E3A8A] text-xs font-bold px-3 py-1 rounded-full">
                {t('pricing.pro.popular')}
              </div>
              <h3 className="text-xl font-bold mb-2">{t('pricing.pro.title')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t('pricing.pro.price')}</span>
                <span className="text-blue-100 text-lg">{t('pricing.pro.period')}</span>
              </div>
              <ul className="space-y-3 mb-8 text-blue-100 text-sm">
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.allFree')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.advancedPortfolio')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.unlimitedProjects')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.unlimitedQuotes')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.prioritySupport')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.customDomain')}</li>
              </ul>
              <Link href="/dashboard/billing" className="block w-full py-3 bg-white text-[#1E3A8A] font-semibold text-center rounded-xl hover:bg-gray-100 transition-colors">{t('pricing.pro.upgrade')}</Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-8 rounded-2xl shadow-xl text-white">
              <h3 className="text-xl font-bold mb-2">{t('pricing.premium.title')}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{t('pricing.premium.price')}</span>
                <span className="text-purple-100 text-lg">{t('pricing.premium.period')}</span>
              </div>
              <ul className="space-y-3 mb-8 text-purple-100 text-sm">
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.allPro')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.multiUsers')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.customClientSpace')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.accountingIntegration')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.advancedAutomations')}</li>
                <li className="flex gap-2"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs">✓</div> {t('pricing.features.customReports')}</li>
              </ul>
              <Link href="/dashboard/billing" className="block w-full py-3 bg-white text-purple-600 font-semibold text-center rounded-xl hover:bg-gray-100 transition-colors">{t('pricing.premium.choose')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Developer Testimonials Section */}
      <DeveloperTestimonialsSection />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/innovaport-logo.png"
              alt="InnovaPort"
              width={280}
              height={84}
              className="h-28 w-auto object-contain"
            />
          </div>
          <p className="text-gray-500 text-sm">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
