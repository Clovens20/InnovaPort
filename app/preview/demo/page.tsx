'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, ChevronRight, Check, X, User, FileText, DollarSign, BarChart3, Sparkles, MousePointer2, ArrowLeft, Home } from 'lucide-react';
import { ExpertContactModal } from '@/app/_components/expert-contact-modal';

export default function InnovaPortDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [showExpertModal, setShowExpertModal] = useState(false);

  const demoSteps = [
    {
      title: "Créez votre Portfolio en 30 secondes",
      description: "Choisissez un template, personnalisez vos couleurs, et vous êtes en ligne.",
      screen: "portfolio",
      duration: 3000
    },
    {
      title: "Ajoutez vos Projets facilement",
      description: "Drag & drop vos images, ajoutez descriptions et tags. Simple et rapide.",
      screen: "projects",
      duration: 3000
    },
    {
      title: "Recevez des Demandes de Devis",
      description: "Les prospects remplissent un formulaire directement sur votre portfolio.",
      screen: "quotes",
      duration: 3000
    },
    {
      title: "Gérez tout depuis un Dashboard",
      description: "Suivez vos projets, devis et clients en temps réel. Tout centralisé.",
      screen: "dashboard",
      duration: 3000
    },
    {
      title: "Automatisez vos Réponses",
      description: "Notifications automatiques, rappels, et mises à jour de statut.",
      screen: "automation",
      duration: 3000
    }
  ];

  useEffect(() => {
    if (isPlaying) {
      const timer = setTimeout(() => {
        if (currentStep < demoSteps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          setIsPlaying(false);
        }
      }, demoSteps[currentStep].duration);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, currentStep, demoSteps]);

  useEffect(() => {
    if (isPlaying && showCursor) {
      const interval = setInterval(() => {
        setCursorPos({
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [isPlaying, showCursor]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const renderScreen = () => {
    const step = demoSteps[currentStep];
    
    switch(step.screen) {
      case 'portfolio':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg relative">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
              <div className="flex gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-3 h-48 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-2">John Doe</h2>
                    <p className="text-xl">Développeur Web Freelance</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map((i) => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
            <div className="absolute bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full font-bold animate-bounce">
              ✓ Portfolio créé !
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Mes Projets</h2>
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105">
                  + Nouveau Projet
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Site E-commerce', client: 'BelleMode Inc.', status: 'En cours', amount: '8,500$' },
                  { name: 'Refonte Logo', client: 'TechStart', status: 'Devis envoyé', amount: '1,200$' },
                  { name: 'App Mobile', client: 'FitnessPro', status: 'Brouillon', amount: '12,000$' }
                ].map((project, i) => (
                  <div key={i} className="border-2 border-slate-200 rounded-lg p-4 hover:border-blue-500 transition-all cursor-pointer hover:shadow-md">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                        <p className="text-slate-600">Client: {project.client}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          project.status === 'En cours' ? 'bg-green-100 text-green-700' :
                          project.status === 'Devis envoyé' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                        <p className="text-xl font-bold text-blue-600 mt-2">{project.amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 'quotes':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg relative">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Nouvelle Demande de Devis</h2>
                <p className="text-slate-600">De: Sophie Martin (sophie@startup.com)</p>
              </div>
              
              <div className="space-y-4 bg-slate-50 rounded-lg p-6">
                <div>
                  <label className="font-semibold text-slate-700">Type de projet:</label>
                  <p className="text-slate-900">Création de site web e-commerce</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Budget estimé:</label>
                  <p className="text-slate-900">5,000$ - 10,000$</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Délai souhaité:</label>
                  <p className="text-slate-900">6-8 semaines</p>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Description:</label>
                  <p className="text-slate-900">Nous cherchons à créer une boutique en ligne moderne pour nos produits artisanaux...</p>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  Créer le Devis
                </button>
                <button className="px-6 bg-slate-200 text-slate-700 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-all">
                  Plus tard
                </button>
              </div>
              
              <div className="absolute top-4 right-4 bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold animate-ping">
                1
              </div>
            </div>
          </div>
        );
      
      case 'dashboard':
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg">
            <div className="bg-white rounded-lg shadow-xl p-6 max-w-6xl mx-auto">
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Dashboard</h2>
              
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <FileText className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">8</span>
                  </div>
                  <p className="text-blue-100">Projets actifs</p>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">5</span>
                  </div>
                  <p className="text-green-100">Devis en attente</p>
                </div>
                
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <User className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">23</span>
                  </div>
                  <p className="text-purple-100">Clients</p>
                </div>
                
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 opacity-80" />
                    <span className="text-2xl font-bold">47K$</span>
                  </div>
                  <p className="text-orange-100">Revenus 2025</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="border-2 border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Activité Récente</h3>
                  <div className="space-y-3">
                    {[
                      { icon: '📧', text: 'Nouveau devis reçu - Sophie M.', time: 'Il y a 5 min' },
                      { icon: '✅', text: 'Projet "Logo TechStart" complété', time: 'Il y a 2h' },
                      { icon: '💰', text: 'Paiement reçu - 8,500$', time: 'Hier' }
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded transition-colors">
                        <span className="text-2xl">{item.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{item.text}</p>
                          <p className="text-sm text-slate-500">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-2 border-slate-200 rounded-lg p-4">
                  <h3 className="font-bold text-lg mb-4">Tâches du jour</h3>
                  <div className="space-y-3">
                    {[
                      { text: 'Envoyer proposition à BelleMode', urgent: true },
                      { text: 'Appel client FitnessPro 14h', urgent: false },
                      { text: 'Finaliser mockups Logo', urgent: false }
                    ].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded transition-colors">
                        <input type="checkbox" className="w-5 h-5 rounded border-2 border-slate-300" />
                        <span className={`flex-1 ${task.urgent ? 'text-red-600 font-semibold' : 'text-slate-700'}`}>
                          {task.text}
                        </span>
                        {task.urgent && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Urgent</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'automation':
        return (
          <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-lg">
            <div className="bg-white rounded-lg shadow-xl p-8 max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Automatisations Actives</h2>
                <p className="text-slate-600">Gagnez 10-15 heures par semaine</p>
              </div>
              
              <div className="space-y-4">
                {[
                  {
                    title: 'Réponse automatique aux nouveaux devis',
                    description: 'Envoie un email de confirmation dans les 2 minutes',
                    status: 'Actif',
                    count: '127 envoyés ce mois'
                  },
                  {
                    title: 'Rappels de suivi client',
                    description: 'Notification 3 jours après envoi de devis',
                    status: 'Actif',
                    count: '45 rappels envoyés'
                  },
                  {
                    title: 'Mise à jour de statut projet',
                    description: 'Notifie le client à chaque changement',
                    status: 'Actif',
                    count: '89 notifications'
                  },
                  {
                    title: 'Facturation automatique',
                    description: 'Génère et envoie factures à la fin de projet',
                    status: 'Actif',
                    count: '23 factures ce mois'
                  }
                ].map((auto, i) => (
                  <div key={i} className="border-2 border-purple-200 rounded-lg p-5 hover:border-purple-400 transition-all hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-slate-900">{auto.title}</h3>
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                            {auto.status}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-2">{auto.description}</p>
                        <p className="text-sm text-purple-600 font-semibold">📊 {auto.count}</p>
                      </div>
                      <div className="ml-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center animate-pulse">
                          <Sparkles className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg p-6 text-center">
                <p className="text-2xl font-bold text-purple-900 mb-2">
                  ⏰ Temps économisé ce mois : 42 heures
                </p>
                <p className="text-purple-700">
                  Soit l'équivalent de 2,100$ de travail facturable !
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
    };

    return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-4 sm:p-8">
      {/* Bouton de retour */}
            <div className="fixed top-4 left-4 z-50">
                <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg hover:bg-white transition-all text-gray-700 hover:text-gray-900 font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Retour</span>
                    <Home className="w-4 h-4 sm:hidden" />
                </Link>
            </div>

      <div className="max-w-7xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Découvrez InnovaPort en Action
          </h1>
          <p className="text-lg sm:text-xl text-blue-200 mb-8 max-w-3xl mx-auto px-4">
            Voyez comment InnovaPort transforme votre activité de freelance en 2 minutes
          </p>
        </div>

        {/* Demo Screen */}
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-8">
          <div className="relative aspect-video min-h-[400px]">
            {renderScreen()}
            
            {/* Animated Cursor */}
            {showCursor && isPlaying && (
              <div 
                className="absolute w-6 h-6 transition-all duration-1000 ease-in-out pointer-events-none z-10"
                style={{ left: `${cursorPos.x}%`, top: `${cursorPos.y}%` }}
              >
                <MousePointer2 className="w-6 h-6 text-yellow-400 drop-shadow-lg" />
              </div>
            )}
          </div>
                </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex gap-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {currentStep === 0 ? 'Démarrer la Démo' : 'Reprendre'}
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                Recommencer
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="cursor"
                checked={showCursor}
                onChange={(e) => setShowCursor(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="cursor" className="text-white text-sm">
                Afficher le curseur
              </label>
            </div>
        </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-semibold">
                Étape {currentStep + 1} / {demoSteps.length}
              </span>
              <span className="text-blue-300 text-sm">
                {Math.round(((currentStep + 1) / demoSteps.length) * 100)}% complété
              </span>
                </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500 rounded-full"
                style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Current Step Info */}
          <div className="bg-slate-700 rounded-lg p-4">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
              {demoSteps[currentStep].title}
            </h3>
            <p className="text-blue-200 text-sm sm:text-base">
              {demoSteps[currentStep].description}
            </p>
          </div>
        </div>

        {/* Step Navigator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {demoSteps.map((step, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentStep(index);
                setIsPlaying(false);
              }}
              className={`p-4 rounded-lg transition-all text-left ${
                index === currentStep
                  ? 'bg-blue-600 text-white shadow-lg scale-105'
                  : index < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{index + 1}</span>
                {index < currentStep && <Check className="w-5 h-5" />}
              </div>
              <p className="text-xs sm:text-sm font-semibold">
                {step.title.split(' ').slice(0, 3).join(' ')}...
              </p>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 sm:p-10 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à transformer votre activité ?
          </h2>
          <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-2xl mx-auto px-4">
            Rejoignez les 50+ freelances qui ont déjà choisi InnovaPort pour gérer leur business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-bold text-base sm:text-lg hover:shadow-2xl transition-all transform hover:scale-105"
            >
              Commencer Gratuitement
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </Link>
            <button
              onClick={() => setShowExpertModal(true)}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-500 text-white rounded-xl font-bold text-base sm:text-lg hover:bg-blue-400 transition-all border-2 border-white/20"
            >
              Parler à un Expert
            </button>
          </div>
          <p className="text-blue-200 mt-6 text-sm sm:text-base">
            ✓ Aucune carte bancaire requise  •  ✓ Configuration en 5 minutes  •  ✓ Support en français
          </p>
        </div>
      </div>

      {/* Modal Parler à un Expert */}
      <ExpertContactModal 
        isOpen={showExpertModal} 
        onClose={() => setShowExpertModal(false)} 
      />
    </div>
  );
}
