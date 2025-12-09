import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Layout, RefreshCw, CreditCard, ShieldCheck, Palette } from "lucide-react";

export default function Home() {
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
              width={160}
              height={48}
              priority
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-[#1E3A8A] transition-colors">Fonctionnalités</a>
            <a href="#how-it-works" className="hover:text-[#1E3A8A] transition-colors">Comment ça marche</a>
            <a href="#pricing" className="hover:text-[#1E3A8A] transition-colors">Tarifs</a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="text-sm font-semibold text-gray-700 hover:text-[#1E3A8A] transition-colors"
            >
              Se connecter
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 bg-[#1E3A8A] text-white rounded-lg text-sm font-semibold hover:bg-[#1E40AF] transition-all shadow-lg shadow-blue-900/10"
            >
              Commencer
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-[#1E3A8A] text-sm font-bold mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              InnovaPort v1.0 est disponible
            </div>

            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-6">
              Gérez vos <span className="text-[#10B981]">Projets</span> & <span className="text-[#1E3A8A]">Devis</span> en un clic.
            </h1>

            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
              La plateforme tout-en-un pour les freelances et agences. Créez des portfolios époustouflants, recevez des demandes de devis qualifiées et gérez votre business.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 bg-[#1E3A8A] text-white rounded-xl font-bold text-lg hover:bg-[#1E40AF] transition-all shadow-xl shadow-blue-900/20 flex items-center justify-center gap-2"
              >
                Accéder au Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/preview/demo"
                className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
              >
                Voir une démo
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200" />
                ))}
              </div>
              <div>+200 freelances nous font confiance</div>
            </div>
          </div>

          <div className="relative lg:h-[600px] w-full hidden lg:block">
            {/* Abstract Shapes */}
            <div className="absolute top-10 right-10 w-96 h-96 bg-[#10B981]/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#1E3A8A]/10 rounded-full blur-3xl" />

            {/* Mockup Container */}
            <div className="absolute inset-0 bg-gray-50 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700">
              {/* Mockup Header */}
              <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              {/* Mockup Content */}
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <div className="h-8 w-32 bg-gray-200 rounded-lg" />
                  <div className="h-8 w-24 bg-[#1E3A8A] rounded-lg" />
                </div>
                <div className="grid grid-cols-3 gap-6 mb-8">
                  <div className="h-24 bg-blue-50 rounded-xl border border-blue-100" />
                  <div className="h-24 bg-green-50 rounded-xl border border-green-100" />
                  <div className="h-24 bg-purple-50 rounded-xl border border-purple-100" />
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-white border border-gray-100 rounded-xl shadow-sm" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-[#1E3A8A] mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-lg text-gray-600">InnovaPort centralise tous vos outils pour vous permettre de vous concentrer sur ce que vous faites de mieux : créer.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: "Portfolio Builder", desc: "Créez un site vitrine professionnel en quelques minutes avec nos templates.", icon: <Layout className="text-[#10B981]" /> },
              { title: "Gestion de Devis", desc: "Recevez et traitez les demandes de devis directement depuis votre dashboard.", icon: <CreditCard className="text-[#1E3A8A]" /> },
              { title: "Personnalisation", desc: "Changez les couleurs, polices et layouts pour coller à votre image de marque.", icon: <Palette className="text-purple-500" /> },
              { title: "Automation", desc: "Réponses automatiques et notifications pour ne jamais rater un client.", icon: <RefreshCw className="text-amber-500" /> },
              { title: "Sécurisé", desc: "Vos données et celles de vos clients sont chiffrées et protégées.", icon: <ShieldCheck className="text-blue-500" /> },
            ].map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feat.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/innovaport-logo.png"
              alt="InnovaPort"
              width={120}
              height={40}
              className="h-10 w-auto object-contain"
            />
          </div>
          <p className="text-gray-500 text-sm">© 2024 InnovaPort. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
