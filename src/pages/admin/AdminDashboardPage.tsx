import React, { useState } from 'react';
import { BarChart3, Image, Link2, ShieldCheck } from 'lucide-react';
import { StudentTrackingTab } from './StudentTrackingTab';
import { WallModerationTab } from './WallModerationTab';
import { SettingsTab } from './SettingsTab';

type AdminTab = 'tracking' | 'wall' | 'settings';

export const AdminDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('tracking');

  const tabs: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'tracking',
      label: 'Seguimiento de Estudiantes',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'wall',
      label: 'Muro Virtual Grupal',
      icon: <Image className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Configuración de Enlaces',
      icon: <Link2 className="w-4 h-4" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner Admin coherente con la identidad Quizizz pero sobrio y ordenado */}
      <section className="bg-gradient-to-r from-[#1F1135] via-[#2D1650] to-[#3B1D6B] rounded-3xl text-white p-6 sm:p-8 shadow-md border border-purple-400/25">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-purple-300/20 text-xs font-extrabold tracking-wide mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              Panel del Profesor (Admin)
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Control de Clase • UNIT 1: Clothes and Colors
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              Revisa avances y notas (máx. 2 intentos), modera el muro virtual y actualiza enlaces en
              tiempo real.
            </p>
          </div>
        </div>
      </section>

      {/* Navegación por pestañas */}
      <nav
        aria-label="Secciones del panel del profesor"
        className="flex flex-wrap gap-2 bg-white p-2 rounded-2xl border border-purple-200/80 shadow-xs"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[170px] inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Contenido activo */}
      {activeTab === 'tracking' && <StudentTrackingTab />}
      {activeTab === 'wall' && <WallModerationTab />}
      {activeTab === 'settings' && <SettingsTab />}
    </div>
  );
};
