'use client';

import { CheckCircle2, Clock, FileText, ArrowRight } from 'lucide-react';

export function DashboardPreview() {
  const projects = [
    {
      title: 'Site E-commerce',
      client: 'BelleMode Inc.',
      quote: '8,500$',
      status: 'En cours',
      statusColor: 'bg-green-500',
      progress: 65,
    },
    {
      title: 'Refonte Logo',
      client: 'TechStart',
      quote: '1,200$',
      status: 'Devis envoyé',
      statusColor: 'bg-sky-500',
      hasDetails: true,
    },
    {
      title: 'App Mobile',
      client: 'FitnessPro',
      status: 'Brouillon',
      statusColor: 'bg-gray-400',
    },
  ];

  return (
    <div className="absolute inset-0 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700">
      {/* Browser Header */}
      <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 gap-2">
        <div className="w-3 h-3 rounded-full bg-red-400" />
        <div className="w-3 h-3 rounded-full bg-amber-400" />
        <div className="w-3 h-3 rounded-full bg-green-400" />
        <div className="flex-1 mx-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-xs text-gray-500">
          innovaport.app/dashboard
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="p-6 bg-gray-50 h-full overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Mes Projets</h2>
            <p className="text-sm text-gray-500 mt-1">8 projets actifs</p>
          </div>
          <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-[#1E40AF] transition-colors">
            <span className="text-lg">+</span>
            Nouveau projet
          </button>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {projects.map((project, index) => (
            <div
              key={index}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Client: {project.client}
                    {project.quote && (
                      <span className="ml-2">
                        · Devis: <span className="font-semibold text-gray-900">{project.quote}</span>
                      </span>
                    )}
                  </p>
                  {project.progress !== undefined && (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`${project.statusColor} h-2 rounded-full transition-all`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 ml-4">
                  <span
                    className={`${project.statusColor} text-white text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap`}
                  >
                    {project.status}
                  </span>
                  {project.hasDetails && (
                    <a
                      href="#"
                      className="text-sky-500 text-sm font-medium hover:text-sky-600 flex items-center gap-1"
                    >
                      Voir détails
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

