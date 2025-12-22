'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Search, MessageCircle, Rocket, CreditCard, Shield, Users, Zap, ArrowLeft, X, Loader2, Check } from 'lucide-react';
import { useTranslation } from "@/lib/i18n/useTranslation";
import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { Footer } from "@/app/_components/footer";

const FAQSection = () => {
  const { t, language } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: language === 'fr' ? 'Toutes' : 'All', icon: null },
    { id: 'general', label: language === 'fr' ? 'Général' : 'General', icon: MessageCircle },
    { id: 'pricing', label: language === 'fr' ? 'Tarification' : 'Pricing', icon: CreditCard },
    { id: 'features', label: language === 'fr' ? 'Fonctionnalités' : 'Features', icon: Zap },
    { id: 'security', label: language === 'fr' ? 'Sécurité' : 'Security', icon: Shield },
    { id: 'getting-started', label: language === 'fr' ? 'Démarrage' : 'Getting Started', icon: Rocket },
  ];

  const faqs = [
    {
      category: 'general',
      question: language === 'fr' ? "Qu'est-ce qu'InnovaPort exactement ?" : "What exactly is InnovaPort?",
      answer: language === 'fr' 
        ? "InnovaPort est une plateforme tout-en-un conçue spécifiquement pour les freelances et petites agences. Elle combine un créateur de portfolio professionnel, un système de gestion de projets, un générateur de devis automatisé et un CRM client. Au lieu de jongler entre 5-7 outils différents, vous gérez tout votre business depuis une seule interface intuitive."
        : "InnovaPort is an all-in-one platform designed specifically for freelancers and small agencies. It combines a professional portfolio creator, project management system, automated quote generator, and client CRM. Instead of juggling 5-7 different tools, you manage your entire business from one intuitive interface."
    },
    {
      category: 'general',
      question: language === 'fr' ? "Pour qui est fait InnovaPort ?" : "Who is InnovaPort for?",
      answer: language === 'fr'
        ? "InnovaPort est parfait pour les développeurs web et tout freelance ou petite agence qui veut professionnaliser sa présence en ligne et automatiser sa gestion administrative. Que vous débutiez ou ayez 10 ans d'expérience, InnovaPort s'adapte à vos besoins."
        : "InnovaPort is perfect for web developers and any freelancer or small agency who wants to professionalize their online presence and automate their administrative management. Whether you're just starting out or have 10 years of experience, InnovaPort adapts to your needs."
    },
    {
      category: 'getting-started',
      question: language === 'fr' ? "Combien de temps faut-il pour mettre en place mon portfolio ?" : "How long does it take to set up my portfolio?",
      answer: language === 'fr'
        ? "Moins de 5 minutes ! Choisissez un template, ajoutez vos informations de base, importez quelques projets, et vous êtes en ligne. Contrairement à WordPress ou aux solutions custom qui prennent des jours ou semaines, InnovaPort est conçu pour un lancement ultra-rapide. Vous pouvez raffiner et personnaliser au fur et à mesure."
        : "Less than 5 minutes! Choose a template, add your basic information, import a few projects, and you're online. Unlike WordPress or custom solutions that take days or weeks, InnovaPort is designed for ultra-fast launch. You can refine and customize as you go."
    },
    {
      category: 'getting-started',
      question: language === 'fr' ? "Ai-je besoin de connaissances techniques pour utiliser InnovaPort ?" : "Do I need technical knowledge to use InnovaPort?",
      answer: language === 'fr'
        ? "Absolument pas ! InnovaPort est conçu pour être utilisé sans aucune connaissance en code. Notre interface drag-and-drop intuitive et nos templates pré-configurés vous permettent de créer un site professionnel en quelques clics. Si vous savez utiliser Gmail ou Facebook, vous saurez utiliser InnovaPort."
        : "Absolutely not! InnovaPort is designed to be used without any coding knowledge. Our intuitive drag-and-drop interface and pre-configured templates allow you to create a professional site in just a few clicks. If you know how to use Gmail or Facebook, you'll know how to use InnovaPort."
    },
    {
      category: 'pricing',
      question: language === 'fr' ? "Le plan gratuit est-il vraiment gratuit ? Y a-t-il des frais cachés ?" : "Is the free plan really free? Are there any hidden fees?",
      answer: language === 'fr'
        ? "Oui, notre plan gratuit est 100% gratuit, pour toujours, sans carte bancaire requise. Vous obtenez un portfolio fonctionnel, la gestion d'1 projet, et 3 devis par mois. Il n'y a aucun frais caché. Quand votre business grandit et que vous avez besoin de plus de fonctionnalités, vous pouvez upgrader au plan Pro (19$/mois) ou Premium (39$/mois)."
        : "Yes, our free plan is 100% free, forever, with no credit card required. You get a functional portfolio, management of 1 project, and 3 quotes per month. There are no hidden fees. When your business grows and you need more features, you can upgrade to the Pro plan ($19/month) or Premium ($39/month)."
    },
    {
      category: 'pricing',
      question: language === 'fr' ? "Puis-je changer de plan à tout moment ?" : "Can I change plans at any time?",
      answer: language === 'fr'
        ? "Absolument ! Vous pouvez upgrader ou downgrader votre plan à tout moment en un seul clic depuis votre dashboard. Si vous upgradez, vous ne payez que la différence au prorata. Si vous downgrader, le crédit restant est appliqué à votre prochaine facture. Aucun engagement, aucune pénalité."
        : "Absolutely! You can upgrade or downgrade your plan at any time with one click from your dashboard. If you upgrade, you only pay the prorated difference. If you downgrade, the remaining credit is applied to your next invoice. No commitment, no penalty."
    },
    {
      category: 'features',
      question: language === 'fr' ? "Puis-je utiliser mon propre nom de domaine ?" : "Can I use my own domain name?",
      answer: language === 'fr'
        ? "Non, cependant avec le plan Pro ou Premium, vous pouvez personnaliser votre lien de portfolio (ex: https://www.innovaport.dev/konektegroup, vous pouvez remplacer le nom user (konektegroup) par ce que vous voulez) en quelques clics."
        : "No, however with the Pro or Premium plan, you can customize your portfolio link (e.g., https://www.innovaport.dev/konektegroup, you can replace the user name (konektegroup) with whatever you want) in just a few clicks."
    },
    {
      category: 'features',
      question: language === 'fr' ? "Puis-je envoyer des factures avec InnovaPort ?" : "Can I send invoices with InnovaPort?",
      answer: language === 'fr'
        ? "Actuellement, InnovaPort se concentre sur les devis et la gestion de projets. Pour la facturation, nous travaillons sur un système de facturation qui sera disponible en 2026 avec le plan Premium."
        : "Currently, InnovaPort focuses on quotes and project management. For invoicing, we're working on an invoicing system that will be available in 2026 with the Premium plan."
    },
    {
      category: 'features',
      question: language === 'fr' ? "Y a-t-il des limites sur le nombre de projets ou clients ?" : "Are there limits on the number of projects or clients?",
      answer: language === 'fr'
        ? "Cela dépend de votre plan : Plan Gratuit = 1 projet actif et 3 devis/mois. Plan Pro = projets et devis illimités. Plan Premium = tout illimité + fonctionnalités avancées. Il n'y a aucune limite sur le nombre de clients que vous pouvez ajouter dans votre CRM, même sur le plan gratuit."
        : "It depends on your plan: Free Plan = 1 active project and 3 quotes/month. Pro Plan = unlimited projects and quotes. Premium Plan = everything unlimited + advanced features. There's no limit on the number of clients you can add to your CRM, even on the free plan."
    },
    {
      category: 'security',
      question: language === 'fr' ? "Mes données sont-elles sécurisées ?" : "Is my data secure?",
      answer: language === 'fr'
        ? "La sécurité est notre priorité absolue. Vos données sont chiffrées en transit (SSL/TLS) et au repos (AES-256). Nous utilisons des serveurs sécurisés avec des sauvegardes automatiques quotidiennes répliquées sur plusieurs data centers. Nous sommes conformes RGPD et ne vendons jamais vos données. Notre infrastructure est hébergée sur des serveurs cloud certifiés SOC 2."
        : "Security is our absolute priority. Your data is encrypted in transit (SSL/TLS) and at rest (AES-256). We use secure servers with automatic daily backups replicated across multiple data centers. We are GDPR compliant and never sell your data. Our infrastructure is hosted on SOC 2 certified cloud servers."
    },
    {
      category: 'security',
      question: language === 'fr' ? "Qui a accès à mes informations clients ?" : "Who has access to my client information?",
      answer: language === 'fr'
        ? "Seul vous avez accès à vos données clients. Notre équipe n'accède jamais à vos informations sauf si vous nous le demandez explicitement pour du support technique. Les données sont isolées par compte avec des permissions strictes. Sur le plan Premium, vous pouvez même ajouter des membres d'équipe avec des rôles et permissions granulaires."
        : "Only you have access to your client data. Our team never accesses your information unless you explicitly request it for technical support. Data is isolated by account with strict permissions. On the Premium plan, you can even add team members with granular roles and permissions."
    },
    {
      category: 'security',
      question: language === 'fr' ? "Que se passe-t-il si j'annule mon abonnement ?" : "What happens if I cancel my subscription?",
      answer: language === 'fr'
        ? "Vous pouvez exporter toutes vos données (projets, clients, devis) en un clic avant d'annuler. Après annulation, vous revenez au plan gratuit et conservez l'accès à votre compte et vos données de base. Vos données complètes sont conservées pendant 90 jours au cas où vous changeriez d'avis. Après 90 jours, seules les données du plan gratuit sont conservées."
        : "You can export all your data (projects, clients, quotes) with one click before canceling. After cancellation, you return to the free plan and retain access to your account and basic data. Your complete data is retained for 90 days in case you change your mind. After 90 days, only free plan data is retained."
    },
    {
      category: 'general',
      question: language === 'fr' ? "InnovaPort fonctionne-t-il sur mobile ?" : "Does InnovaPort work on mobile?",
      answer: language === 'fr'
        ? "Oui ! Votre portfolio est automatiquement responsive et s'adapte parfaitement aux mobiles et tablettes. Vous pouvez également gérer votre business depuis le dashboard mobile-friendly."
        : "Yes! Your portfolio is automatically responsive and adapts perfectly to mobile and tablets. You can also manage your business from the mobile-friendly dashboard."
    },
    {
      category: 'general',
      question: language === 'fr' ? "Proposez-vous du support client ?" : "Do you offer customer support?",
      answer: language === 'fr'
        ? "Absolument ! Plan Gratuit = support communautaire via notre forum. Plan Pro = support email prioritaire (réponse sous 24h). Plan Premium = support prioritaire + chat en direct."
        : "Absolutely! Free Plan = community support via our forum. Pro Plan = priority email support (response within 24h). Premium Plan = priority support + live chat."
    },
    {
      category: 'general',
      question: language === 'fr' ? "Puis-je collaborer avec d'autres freelances ou mon équipe ?" : "Can I collaborate with other freelancers or my team?",
      answer: language === 'fr'
        ? "Oui, avec le plan Premium ! Vous pouvez inviter des membres d'équipe avec des rôles différents (admin, éditeur, viewer). Chaque membre a son propre login et vous contrôlez leurs permissions. Idéal pour les agences ou les freelances qui travaillent avec des partenaires réguliers."
        : "Yes, with the Premium plan! You can invite team members with different roles (admin, editor, viewer). Each member has their own login and you control their permissions. Ideal for agencies or freelancers who work with regular partners."
    },
    {
      category: 'general',
      question: language === 'fr' ? "Comment InnovaPort se différencie des autres plateformes ?" : "How does InnovaPort differ from other platforms?",
      answer: language === 'fr'
        ? "InnovaPort est spécifiquement conçu pour les freelances créatifs et techniques, pas juste pour les mariages/événements. Nous offrons un portfolio builder intégré (pas juste CRM), des prix plus accessibles (19$/mois vs 40-50$/mois), une interface plus moderne et intuitive, et nous sommes fait par des freelances qui comprennent vos défis quotidiens. Plus de fonctionnalités, moins cher, plus simple."
        : "InnovaPort is specifically designed for creative and technical freelancers, not just for weddings/events. We offer an integrated portfolio builder (not just CRM), more affordable pricing ($19/month vs $40-50/month), a more modern and intuitive interface, and we're made by freelancers who understand your daily challenges. More features, cheaper, simpler."
    },
    {
      category: 'pricing',
      question: language === 'fr' ? "Y a-t-il des frais de transaction sur les devis ?" : "Are there transaction fees on quotes?",
      answer: language === 'fr'
        ? "Non ! Contrairement à certaines plateformes qui prennent un pourcentage, InnovaPort ne prend AUCUN frais de transaction. Vous payez votre abonnement mensuel fixe, c'est tout. 100% de vos revenus vous appartiennent."
        : "No! Unlike some platforms that take a percentage, InnovaPort takes NO transaction fees. You pay your fixed monthly subscription, that's it. 100% of your revenue belongs to you."
    },
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'envoi du message');
      }

      setSubmitSuccess(true);
      setContactForm({ name: '', email: '', subject: '', message: '' });
      
      // Fermer le modal après 3 secondes
      setTimeout(() => {
        setShowContactModal(false);
        setSubmitSuccess(false);
      }, 3000);
    } catch (error: any) {
      setSubmitError(error.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-700 hover:text-[#1E3A8A] transition-colors group"
              aria-label={t('legal.backToHome')}
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" aria-hidden="true" />
              <span className="text-sm font-medium hidden sm:inline">{t('legal.backToHome')}</span>
            </Link>
            <Link href="/" aria-label="Innovaport">
              <Image
                src="/innovaport-logo.png"
                alt="InnovaPort Logo"
                width={200}
                height={60}
                className="h-12 w-auto object-contain"
                priority
                sizes="200px"
              />
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      </nav>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              {language === 'fr' ? 'Questions Fréquentes' : 'Frequently Asked Questions'}
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              {language === 'fr' 
                ? <>Tout ce que vous devez savoir sur InnovaPort. Vous ne trouvez pas votre réponse ?{' '}
                    <a href="mailto:support@innovaport.dev" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Contactez-nous
                    </a>
                  </>
                : <>Everything you need to know about InnovaPort. Can't find your answer?{' '}
                    <a href="mailto:support@innovaport.dev" className="text-blue-600 hover:text-blue-700 font-semibold">
                      Contact us
                    </a>
                  </>
              }
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-10">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder={language === 'fr' ? "Rechercher une question... (ex: tarification, sécurité, domaine)" : "Search a question... (e.g., pricing, security, domain)"}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeCategory === cat.id
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-200'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* FAQ Results Count */}
          {searchTerm && (
            <div className="text-center mb-6 text-slate-600">
              {filteredFaqs.length} {language === 'fr' ? 'résultat' : 'result'}{filteredFaqs.length > 1 ? (language === 'fr' ? 's' : 's') : ''} {language === 'fr' ? 'trouvé' : 'found'}{filteredFaqs.length > 1 ? (language === 'fr' ? 's' : '') : ''}
            </div>
          )}

          {/* FAQ List */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border-2 border-slate-100 overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="font-semibold text-slate-900 text-lg pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform duration-300 ${
                      openIndex === index ? 'transform rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 py-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-slate-100">
                    <p className="text-slate-700 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-4">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {language === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </h3>
              <p className="text-slate-600 mb-6">
                {language === 'fr' 
                  ? "Essayez avec d'autres mots-clés ou explorez nos catégories"
                  : "Try with other keywords or explore our categories"
                }
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('all');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                {language === 'fr' ? 'Réinitialiser les filtres' : 'Reset filters'}
              </button>
            </div>
          )}

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-10 text-center shadow-2xl">
            <h2 className="text-3xl font-bold text-white mb-4">
              {language === 'fr' 
                ? "Vous ne trouvez pas ce que vous cherchez ?"
                : "Can't find what you're looking for?"
              }
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              {language === 'fr'
                ? "Notre équipe est là pour vous aider ! Posez votre question et nous vous répondrons rapidement."
                : "Our team is here to help! Ask your question and we'll respond quickly."
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5" />
                {language === 'fr' ? 'Envoyer un message' : 'Send a message'}
              </button>
              <button
                onClick={() => setShowContactModal(true)}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-400 transition-all border-2 border-white/20"
              >
                <Users className="w-5 h-5" />
                {language === 'fr' ? 'Nous contacter' : 'Contact us'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">24h</div>
              <div className="text-slate-600">{language === 'fr' ? 'Temps de réponse moyen' : 'Average response time'}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
              <div className="text-slate-600">{language === 'fr' ? 'Taux de satisfaction' : 'Satisfaction rate'}</div>
            </div>
            <div className="bg-white rounded-2xl p-6 text-center border-2 border-slate-100">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-slate-600">{language === 'fr' ? 'Documentation disponible' : 'Documentation available'}</div>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {language === 'fr' ? 'Nous contacter' : 'Contact Us'}
              </h2>
              <button
                onClick={() => {
                  setShowContactModal(false);
                  setSubmitSuccess(false);
                  setSubmitError(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleContactSubmit} className="p-6 space-y-6">
              {submitSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <Check className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-900 mb-2">
                    {language === 'fr' ? 'Message envoyé avec succès !' : 'Message sent successfully!'}
                  </h3>
                  <p className="text-green-700">
                    {language === 'fr' 
                      ? 'Nous avons bien reçu votre message. Vous recevrez un email de confirmation et nous vous répondrons dans les 24 heures.'
                      : 'We have received your message. You will receive a confirmation email and we will respond within 24 hours.'}
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'fr' ? 'Nom complet' : 'Full Name'} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'fr' ? 'Votre nom' : 'Your name'}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'fr' ? 'Email' : 'Email'} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'fr' ? 'votre@email.com' : 'your@email.com'}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'fr' ? 'Sujet' : 'Subject'} (optionnel)
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={language === 'fr' ? 'Sujet de votre message' : 'Message subject'}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'fr' ? 'Message' : 'Message'} *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={language === 'fr' ? 'Votre message...' : 'Your message...'}
                    />
                  </div>

                  {submitError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-red-700 text-sm">{submitError}</p>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowContactModal(false);
                        setSubmitError(null);
                      }}
                      className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      {language === 'fr' ? 'Annuler' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {language === 'fr' ? 'Envoi...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <MessageCircle className="w-5 h-5" />
                          {language === 'fr' ? 'Envoyer' : 'Send'}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQSection;

