import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Lock, Sparkles, Trophy, Zap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { COURSE_UNITS } from '../../data/units';
import { ACTIVITY_UNLOCK_RULES, UNIT1_SEQUENCE } from '../../lib/unitProgression';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../components/ui/Toast';
import { ClothingSvg } from '../../components/illustrations/ClothingSvg';

export const StudentHomePage: React.FC = () => {
  const { profile } = useAuth();
  const { progressMap, completedCount, loading } = useUnitProgress('unit-1');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const firstName = profile?.full_name.trim().split(/\s+/)[0] || 'Student';

  const handleUnitClick = (unlocked: boolean, route: string) => {
    if (unlocked) {
      navigate(route);
      return;
    }
    showToast('Esta unidad estará disponible próximamente.', 'warning');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Banner de bienvenida + progreso */}
      <section className="quizizz-card rounded-3xl p-5 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-200 text-xs font-extrabold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>English Class Students</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-sm sm:text-base text-purple-200/85 max-w-xl">
              Avanza por cada etapa de la unidad para desbloquear los retos y ganar tu mejor
              puntaje.
            </p>
          </div>

          <div className="w-full lg:w-96 bg-[#160C28] rounded-2xl border border-purple-400/25 p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-xs font-extrabold uppercase tracking-wide text-purple-100">
                  Progreso UNIT 1
                </span>
              </div>
              <span className="text-sm font-extrabold text-emerald-400">
                {loading ? '...' : `${completedCount}/4 etapas`}
              </span>
            </div>

            <ProgressBar value={completedCount} max={4} colorClass="bg-emerald-400" />

            <div className="grid grid-cols-4 gap-1.5 mt-3 text-[11px] font-bold text-center">
              {UNIT1_SEQUENCE.map((key) => {
                const done = progressMap[key];
                const label =
                  key === 'practica'
                    ? 'Práctica'
                    : key === 'teoria'
                      ? 'Teoría'
                      : key === 'produccion'
                        ? 'Muro'
                        : 'Quiz';
                return (
                  <div
                    key={key}
                    title={ACTIVITY_UNLOCK_RULES[key].label}
                    className={`py-1.5 px-1 rounded-lg border truncate ${
                      done
                        ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                        : 'bg-[#24143D] border-purple-400/20 text-purple-300/60'
                    }`}
                  >
                    {label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Cuadrícula de Unidades */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <span>Unidades del curso</span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 text-purple-200 border border-purple-400/20">
            1 unidad activa • 3 próximas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {COURSE_UNITS.map((unit) => {
            if (unit.unlocked) {
              return (
                <button
                  key={unit.id}
                  type="button"
                  onClick={() => handleUnitClick(true, unit.route)}
                  className="group text-left quizizz-card rounded-3xl border-2 border-fuchsia-400/50 hover:border-amber-300 shadow-lg hover:shadow-fuchsia-500/20 transition-all overflow-hidden cursor-pointer flex flex-col justify-between"
                >
                  <div className={`bg-gradient-to-r ${unit.accentGradient} p-5 sm:p-6 text-white`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/25 border border-white/20 text-xs font-extrabold tracking-wide mb-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          {unit.code} • Activa
                        </span>
                        <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                          {unit.title}
                        </h3>
                      </div>

                      <div className="bg-white rounded-2xl p-2 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                        <ClothingSvg garment="tshirt" color="#EF4444" className="w-14 h-14" />
                      </div>
                    </div>
                  </div>

                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {completedCount === 4
                          ? '¡Unidad completada al 100%!'
                          : `Llevas ${completedCount} de 4 etapas completadas`}
                      </p>
                      <p className="text-xs text-purple-200/75 mt-0.5">
                        1. Práctica → 2. Teoría → 3. Producción → 4. Valoración
                      </p>
                    </div>

                    <span className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-2xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 text-sm font-extrabold border-b-4 border-emerald-700 shrink-0 transition-colors">
                      <span>Entrar</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </button>
              );
            }

            return (
              <button
                key={unit.id}
                type="button"
                aria-disabled="true"
                onClick={() => handleUnitClick(false, unit.route)}
                className="text-left bg-[#1C1030]/80 rounded-3xl border-2 border-dashed border-purple-400/20 opacity-75 hover:opacity-90 transition-opacity overflow-hidden cursor-not-allowed flex flex-col justify-between"
              >
                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 text-xs font-extrabold tracking-wide mb-2 border border-purple-400/20">
                        <Lock className="w-3.5 h-3.5 text-amber-300" />
                        {unit.code} • Bloqueada
                      </span>
                      <h3 className="text-2xl font-extrabold text-purple-200/80 leading-tight">
                        {unit.title}
                      </h3>
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-purple-950/90 border border-purple-400/20 text-purple-300 flex items-center justify-center shrink-0">
                      <Lock className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 sm:px-6 sm:pb-6 flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-300/70">
                    Disponible próximamente
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-400/20 text-purple-300 text-xs font-bold">
                    Bloqueado
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
