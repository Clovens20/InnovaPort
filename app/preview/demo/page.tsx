'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Pause, RotateCcw, ChevronRight, Check, X, User, FileText, DollarSign, BarChart3, Sparkles, MousePointer2, ArrowLeft, Home, Clock } from 'lucide-react';
import { ExpertContactModal } from '@/app/_components/expert-contact-modal';

export default function InnovaPortDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const demoSteps = [
    {
      title: "Créez votre Portfolio en 30 secondes",
      description: "Choisissez un template, personnalisez vos couleurs, et vous êtes en ligne.",
      screen: "portfolio",
      duration: 6000,
      animations: [
        { time: 0, action: 'fadeIn' },
        { time: 1000, action: 'showContent' },
        { time: 3000, action: 'highlight' },
      ]
    },
    {
      title: "Ajoutez vos Projets facilement",
      description: "Drag & drop vos images, ajoutez descriptions et tags. Simple et rapide.",
      screen: "projects",
      duration: 6000,
      animations: [
        { time: 0, action: 'fadeIn' },
        { time: 800, action: 'showProjects' },
        { time: 2500, action: 'highlightButton' },
      ]
    },
    {
      title: "Recevez des Demandes de Devis",
      description: "Les prospects remplissent un formulaire directement sur votre portfolio.",
      screen: "quotes",
      duration: 6000,
      animations: [
        { time: 0, action: 'fadeIn' },
        { time: 1000, action: 'showNotification' },
        { time: 2000, action: 'showForm' },
      ]
    },
    {
      title: "Gérez tout depuis un Dashboard",
      description: "Suivez vos projets, devis et clients en temps réel. Tout centralisé.",
      screen: "dashboard",
      duration: 6000,
      animations: [
        { time: 0, action: 'fadeIn' },
        { time: 500, action: 'showStats' },
        { time: 2000, action: 'showActivity' },
      ]
    },
    {
      title: "Automatisez vos Réponses",
      description: "Notifications automatiques, rappels, et mises à jour de statut.",
      screen: "automation",
      duration: 6000,
      animations: [
        { time: 0, action: 'fadeIn' },
        { time: 800, action: 'showAutomations' },
        { time: 3000, action: 'showSavings' },
      ]
    }
  ];

  // Démarrer automatiquement la démo après 2 secondes
  useEffect(() => {
    console.log('🎬 Demo component mounted, will auto-start in 2 seconds');
    const autoStartTimer = setTimeout(() => {
      console.log('🚀 Auto-starting demo...');
      setHasStarted(true);
      setIsPlaying(true);
    }, 2000);
    return () => {
      console.log('🧹 Cleaning up auto-start timer');
      clearTimeout(autoStartTimer);
    };
  }, []); // Dépendances vides = s'exécute une seule fois au montage

  // Gérer la progression automatique - passe automatiquement d'une étape à l'autre
  useEffect(() => {
    if (isPlaying && hasStarted) {
      console.log(`▶️ Playing step ${currentStep + 1}/${demoSteps.length}, will advance in ${demoSteps[currentStep].duration}ms`);
      setIsTransitioning(true);
      const transitionTimer = setTimeout(() => {
        setIsTransitioning(false);
      }, 500);

      const timer = setTimeout(() => {
        if (currentStep < demoSteps.length - 1) {
          // Passer à l'étape suivante automatiquement
          console.log(`➡️ Advancing to step ${currentStep + 2}`);
          setCurrentStep(currentStep + 1);
        } else {
          // Quand on arrive à la fin, redémarrer depuis le début automatiquement
          console.log('🔄 Reached end, restarting in 2 seconds...');
          setTimeout(() => {
            setCurrentStep(0);
            // La démo continue automatiquement
          }, 2000); // Attendre 2 secondes avant de redémarrer
        }
      }, demoSteps[currentStep].duration);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(transitionTimer);
      };
    } else {
      console.log(`⏸️ Demo paused or not started: isPlaying=${isPlaying}, hasStarted=${hasStarted}`);
    }
  }, [isPlaying, currentStep, hasStarted]); // Retiré demoSteps des dépendances car c'est une constante

  // Animation du curseur plus réaliste
  useEffect(() => {
    if (isPlaying && showCursor && hasStarted) {
      // Animation de clic réaliste
      const moveCursor = () => {
        const steps = [
          { x: 20, y: 30 }, // Position initiale
          { x: 35, y: 45 }, // Mouvement
          { x: 50, y: 60 }, // Clic
          { x: 65, y: 50 }, // Après clic
          { x: 75, y: 40 }, // Fin
        ];
        
        let stepIndex = 0;
        const interval = setInterval(() => {
          if (stepIndex < steps.length) {
            setCursorPos(steps[stepIndex]);
            stepIndex++;
          } else {
            stepIndex = 0;
            // Nouvelle séquence après un délai
            setTimeout(() => {
              setCursorPos(steps[0]);
            }, 2000);
          }
        }, 800);
        
        return () => clearInterval(interval);
      };
      
      return moveCursor();
    }
  }, [isPlaying, showCursor, hasStarted, currentStep]);

  const handlePlayPause = () => {
    if (!hasStarted) {
      setHasStarted(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setHasStarted(false);
    // Redémarrer automatiquement après reset
    setTimeout(() => {
      setHasStarted(true);
      setIsPlaying(true);
    }, 1000);
  };

  // Empêcher l'interruption manuelle de la démo - tout passe automatiquement
  // Les boutons Pause/Play restent disponibles mais la progression continue automatiquement

  const renderScreen = () => {
    const step = demoSteps[currentStep];
    
    switch(step.screen) {
      case 'portfolio':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg relative overflow-hidden">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl mx-auto animate-fadeIn">
              {/* Hero Section avec animation */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="col-span-3 h-56 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="text-center relative z-10 animate-slideIn">
                    <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4 flex items-center justify-center backdrop-blur-sm">
                      <User className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-4xl font-bold mb-2">John Doe</h2>
                    <p className="text-xl text-blue-100">Développeur Web Freelance</p>
                    <div className="mt-4 flex gap-2 justify-center">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">React</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">Next.js</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">TypeScript</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Projets avec animation séquentielle */}
              <div className="grid grid-cols-3 gap-4">
                {[1,2,3].map((i) => (
                  <div 
                    key={i} 
                    className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl shadow-lg hover:shadow-xl transition-all duration-500 animate-fadeInUp"
                    style={{ animationDelay: `${i * 200}ms` }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">Projet {i}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Notification de succès */}
              {isPlaying && (
                <div className="absolute bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-bounceIn z-20">
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    Portfolio créé en 30 secondes !
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 p-8 rounded-lg">
            <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl mx-auto animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900">Mes Projets</h2>
                  <p className="text-slate-600 text-sm mt-1">Gérez tous vos projets en un seul endroit</p>
                </div>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg animate-pulse-slow">
                  + Nouveau Projet
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'Site E-commerce', client: 'BelleMode Inc.', status: 'En cours', amount: '8,500$', progress: 65 },
                  { name: 'Refonte Logo', client: 'TechStart', status: 'Devis envoyé', amount: '1,200$', progress: 0 },
                  { name: 'App Mobile', client: 'FitnessPro', status: 'Brouillon', amount: '12,000$', progress: 0 }
                ].map((project, i) => (
                  <div 
                    key={i} 
                    className="border-2 border-slate-200 rounded-xl p-5 hover:border-blue-500 transition-all cursor-pointer hover:shadow-lg bg-white animate-slideInRight"
                    style={{ animationDelay: `${i * 300}ms` }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center text-white font-bold">
                            {project.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-slate-900">{project.name}</h3>
                            <p className="text-slate-600 text-sm">Client: {project.client}</p>
                          </div>
                        </div>
                        {project.progress > 0 && (
                          <div className="mt-3">
                            <div className="flex justify-between text-xs text-slate-600 mb-1">
                              <span>Progression</span>
                              <span>{project.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                                style={{ width: `${project.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right ml-4">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                          project.status === 'En cours' ? 'bg-green-100 text-green-700' :
                          project.status === 'Devis envoyé' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {project.status}
                        </span>
                        <p className="text-2xl font-bold text-blue-600 mt-3">{project.amount}</p>
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
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-lg relative overflow-hidden">
            {/* Notification animée */}
            {isPlaying && (
              <div className="absolute top-6 right-6 bg-red-500 text-white w-12 h-12 rounded-full flex items-center justify-center font-bold shadow-2xl z-30 animate-bounceIn">
                <span className="text-lg">1</span>
                <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
              </div>
            )}
            
            <div className="bg-white rounded-lg shadow-2xl p-8 max-w-2xl mx-auto animate-slideInRight">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-4 shadow-lg animate-scaleIn">
                  <FileText className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Nouvelle Demande de Devis</h2>
                <div className="flex items-center justify-center gap-2 text-slate-600">
                  <User className="w-5 h-5" />
                  <p>Sophie Martin • sophie@startup.com</p>
                </div>
              </div>
              
              <div className="space-y-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-6 border-2 border-blue-100">
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 text-sm">Type de projet:</label>
                    <p className="text-slate-900 font-medium">Création de site web e-commerce</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 text-sm">Budget estimé:</label>
                    <p className="text-slate-900 font-medium text-lg">5,000$ - 10,000$</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <label className="font-semibold text-slate-700 text-sm">Délai souhaité:</label>
                    <p className="text-slate-900 font-medium">6-8 semaines</p>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm">
                  <label className="font-semibold text-slate-700 text-sm block mb-2">Description:</label>
                  <p className="text-slate-900 leading-relaxed">Nous cherchons à créer une boutique en ligne moderne pour nos produits artisanaux. Le site doit être responsive, avec un système de paiement intégré et une gestion des stocks.</p>
                </div>
              </div>
              
              <div className="flex gap-4 mt-6">
                <button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg">
                  <Check className="w-5 h-5" />
                  Créer le Devis
                </button>
                <button className="px-6 bg-slate-200 text-slate-700 py-4 rounded-xl font-semibold hover:bg-slate-300 transition-all">
                  Plus tard
                </button>
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
        <div className="bg-slate-800 rounded-2xl shadow-2xl overflow-hidden mb-8 border-4 border-slate-700">
          {/* Browser Chrome */}
          <div className="bg-slate-700 px-4 py-3 flex items-center gap-2">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="flex-1 mx-4 bg-slate-600 rounded px-4 py-1.5 text-sm text-slate-300">
              innovaport.dev/demo
            </div>
            <div className="text-slate-400 text-xs">
              {isPlaying ? '▶️ En cours...' : '⏸️ En pause'}
            </div>
          </div>
          
          <div className="relative aspect-video min-h-[500px] bg-gradient-to-br from-slate-900 to-slate-800">
            <div className={`transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              {renderScreen()}
            </div>
            
            {/* Animated Cursor avec effet de clic */}
            {showCursor && isPlaying && hasStarted && (
              <div 
                className="absolute w-6 h-6 transition-all duration-700 ease-out pointer-events-none z-50"
                style={{ 
                  left: `${cursorPos.x}%`, 
                  top: `${cursorPos.y}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <MousePointer2 className="w-6 h-6 text-yellow-400 drop-shadow-2xl animate-pulse" />
                {/* Effet de clic */}
                <div className="absolute inset-0 w-8 h-8 border-2 border-yellow-400 rounded-full animate-ping opacity-75" style={{ marginLeft: '-4px', marginTop: '-4px' }}></div>
              </div>
            )}
            
            {/* Overlay de chargement initial */}
            {!hasStarted && (
              <div className="absolute inset-0 bg-slate-900/90 flex items-center justify-center z-40">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                  <p className="text-white text-lg font-semibold">Démarrage de la démo...</p>
                  <p className="text-slate-400 text-sm mt-2">La démo va démarrer automatiquement dans quelques secondes</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800 rounded-xl p-4 sm:p-6 mb-8 border border-slate-700">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex gap-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all transform hover:scale-105 shadow-lg"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {!hasStarted ? 'Démarrer la Démo' : 'Reprendre'}
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

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cursor"
                  checked={showCursor}
                  onChange={(e) => setShowCursor(e.target.checked)}
                  className="w-5 h-5 rounded accent-blue-600"
                />
                <label htmlFor="cursor" className="text-white text-sm cursor-pointer">
                  Afficher le curseur
                </label>
              </div>
              {isPlaying && (
                <div className="flex items-center gap-2 text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Lecture automatique</span>
                </div>
              )}
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

        {/* Step Navigator - Indicateurs visuels uniquement (non-cliquables) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {demoSteps.map((step, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg transition-all text-left cursor-default ${
                index === currentStep
                  ? 'bg-blue-600 text-white shadow-lg scale-105 ring-2 ring-blue-400'
                  : index < currentStep
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold">{index + 1}</span>
                {index < currentStep && <Check className="w-5 h-5" />}
                {index === currentStep && (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </div>
              <p className="text-xs sm:text-sm font-semibold">
                {step.title.split(' ').slice(0, 3).join(' ')}...
              </p>
            </div>
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
