'use client';

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layout, RefreshCw, CreditCard, ShieldCheck, Palette, Menu, X } from "lucide-react";
import { DashboardPreview } from "./_components/dashboard-preview";
import { SocialProofSection } from "./_components/social-proof-section";
import { UserCountBadge } from "./_components/user-count-badge";
import { TestimonialsSection } from "./_components/testimonials-section";
import { DeveloperTestimonialsSection } from "./_components/developer-testimonials-section";
import { LanguageSwitcher } from "./_components/language-switcher";
import { useTranslation } from "@/lib/i18n/useTranslation";
import { useState } from "react";

export default function Home() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Navbar Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" aria-label="InnovaPort Home">
              <Image
                src="/innovaport-logo.png"
                alt="InnovaPort Logo"
                width={400}
                height={120}
                priority
                className="h-20 sm:h-28 w-auto object-contain"
                sizes="(max-width: 640px) 200px, 400px"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-[#1E3A8A] transition-colors" aria-label="Features section">{t('nav.features')}</a>
            <a href="#how-it-works" className="hover:text-[#1E3A8A] transition-colors" aria-label="How it works section">{t('nav.howItWorks')}</a>
            <a href="#pricing" className="hover:text-[#1E3A8A] transition-colors" aria-label="Pricing section">{t('nav.pricing')}</a>
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <Link
              href="/auth/login"
              className="text-sm font-semibold text-gray-700 hover:text-[#1E3A8A] transition-colors"
              aria-label="Login"
            >
              {t('nav.login')}
            </Link>
            <Link
              href="/auth/register"
              className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-900/10 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
              aria-label="Get started"
            >
              {t('nav.getStarted')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t('nav.features')}
              </a>
              <a
                href="#how-it-works"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t('nav.howItWorks')}
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-gray-50 rounded-lg transition-colors"
              >
                {t('nav.pricing')}
              </a>
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <LanguageSwitcher />
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-[#1E3A8A] transition-colors"
                  >
                    {t('nav.login')}
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E40AF] transition-all"
                  >
                    {t('nav.getStarted')}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-16 sm:pt-24 md:pt-32 pb-16 sm:pb-20 md:pb-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
          <div className="relative z-10 text-center lg:text-left">
            <UserCountBadge />

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-4 sm:mb-6">
              {t('hero.title')} <span className="text-[#10B981]">{t('hero.titleProjects')}</span> & <span className="text-[#1E3A8A]">{t('hero.titleQuotes')}</span> {t('hero.titleSuffix')}
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 md:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {t('hero.subtitle')}<br />
              {t('hero.subtitle2')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-base sm:text-lg hover:bg-[#1E40AF] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A] focus:ring-offset-2"
                aria-label="Start free trial"
              >
                {t('hero.startFree')}
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              </Link>
              <Link
                href="/preview/demo"
                className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 border-2 border-gray-300 rounded-xl font-bold text-base sm:text-lg hover:bg-gray-50 hover:border-gray-400 transition-all flex items-center justify-center shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                aria-label="View demo"
              >
                {t('hero.viewDemo')}
              </Link>
            </div>

            <div className="mt-6 sm:mt-8">
              <SocialProofSection />
            </div>
          </div>

          <div className="relative lg:h-[600px] w-full hidden lg:block">
            {/* Abstract Shapes */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#1E3A8A]/10 rounded-full blur-3xl" aria-hidden="true" />

            {/* Real Dashboard Preview */}
            <DashboardPreview />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-3 sm:mb-4">{t('features.title')}</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">{t('features.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { titleKey: "features.portfolioBuilder.title", descKey: "features.portfolioBuilder.desc", icon: <Layout className="text-[#10B981]" /> },
              { titleKey: "features.quoteManagement.title", descKey: "features.quoteManagement.desc", icon: <CreditCard className="text-[#1E3A8A]" /> },
              { titleKey: "features.customization.title", descKey: "features.customization.desc", icon: <Palette className="text-purple-500" /> },
              { titleKey: "features.automation.title", descKey: "features.automation.desc", icon: <RefreshCw className="text-amber-500" /> },
              { titleKey: "features.secured.title", descKey: "features.secured.desc", icon: <ShieldCheck className="text-blue-500" /> },
            ].map((feat, i) => (
              <div key={i} className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-4 sm:mb-6" aria-hidden="true">
                  {feat.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{t(feat.titleKey)}</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{t(feat.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-3 sm:mb-4">{t('howItWorks.title')}</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">{t('howItWorks.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 md:gap-12 relative">
            <div className="text-center relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6" aria-hidden="true">1</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t('howItWorks.step1.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">{t('howItWorks.step1.desc')}</p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6" aria-hidden="true">2</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t('howItWorks.step2.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">{t('howItWorks.step2.desc')}</p>
            </div>
            <div className="text-center relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 text-[#1E3A8A] rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-4 sm:mb-6" aria-hidden="true">3</div>
              <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3">{t('howItWorks.step3.title')}</h3>
              <p className="text-sm sm:text-base text-gray-600 px-4">{t('howItWorks.step3.desc')}</p>
            </div>

            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-8 left-0 w-full h-0.5 bg-blue-50 -z-0" />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#1E3A8A] mb-3 sm:mb-4">{t('pricing.title')}</h2>
            <p className="text-base sm:text-lg text-gray-600 px-4">{t('pricing.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
            {/* Free */}
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{t('pricing.free.title')}</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold">{t('pricing.free.price')}</span>
                <span className="text-gray-600 text-base sm:text-lg">{t('pricing.free.period')}</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-gray-600 text-xs sm:text-sm">
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.basicPortfolio')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.oneProject')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.fiveQuotes')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.communitySupport')}</span></li>
              </ul>
              <Link href="/auth/register" className="block w-full py-3 bg-gray-100 text-gray-900 font-semibold text-center rounded-xl hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2">{t('pricing.free.startFree')}</Link>
            </div>

            {/* Pro */}
            <div className="bg-[#1E3A8A] p-6 sm:p-8 rounded-2xl shadow-xl text-white transform md:-translate-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-[#1E3A8A] text-xs font-bold px-3 py-1 rounded-full">
                {t('pricing.pro.popular')}
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('pricing.pro.title')}</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold">{t('pricing.pro.price')}</span>
                <span className="text-blue-100 text-base sm:text-lg">{t('pricing.pro.period')}</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-blue-100 text-xs sm:text-sm">
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.allFree')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.advancedPortfolio')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.unlimitedProjects')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.unlimitedQuotes')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.prioritySupport')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.customDomain')}</span></li>
              </ul>
              <Link href="/dashboard/billing" className="block w-full py-3 bg-white text-[#1E3A8A] font-semibold text-center rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#1E3A8A]">{t('pricing.pro.upgrade')}</Link>
            </div>

            {/* Premium */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-700 p-6 sm:p-8 rounded-2xl shadow-xl text-white">
              <h3 className="text-lg sm:text-xl font-bold mb-2">{t('pricing.premium.title')}</h3>
              <div className="mb-4 sm:mb-6">
                <span className="text-3xl sm:text-4xl font-bold">{t('pricing.premium.price')}</span>
                <span className="text-purple-100 text-base sm:text-lg">{t('pricing.premium.period')}</span>
              </div>
              <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-purple-100 text-xs sm:text-sm">
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.allPro')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.multiUsers')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.customClientSpace')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.accountingIntegration')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.advancedAutomations')}</span></li>
                <li className="flex gap-2 items-start"><div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs flex-shrink-0 mt-0.5">✓</div> <span>{t('pricing.features.customReports')}</span></li>
              </ul>
              <Link href="/dashboard/billing" className="block w-full py-3 bg-white text-purple-600 font-semibold text-center rounded-xl hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600">{t('pricing.premium.choose')}</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Developer Testimonials Section */}
      <DeveloperTestimonialsSection />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 sm:py-12 px-4 sm:px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/innovaport-logo.png"
              alt="InnovaPort Logo"
              width={280}
              height={84}
              className="h-20 sm:h-28 w-auto object-contain"
              sizes="(max-width: 640px) 200px, 280px"
            />
          </div>
          <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">{t('footer.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}
