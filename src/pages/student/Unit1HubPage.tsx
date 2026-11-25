import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Gamepad2,
  ImagePlus,
  Lock,
  Sparkles,
} from 'lucide-react';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import {
  ACTIVITY_UNLOCK_RULES,
  getActivityState,
  MAX_QUIZ_ATTEMPTS,
  UNIT1_SEQUENCE,
} from '../../lib/unitProgression';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../components/ui/Toast';
import { ClothingSvg } from '../../components/illustrations/ClothingSvg';
import type { ActivityKey } from '../../types/database';

interface ActivityVisualTheme {
  subtitle: string;
  icon: React.ReactNode;
  stepBadgeBg: string;
  availableBorder: string;
  availableButton: string;
}

const ACTIVITY_THEMES: Record<ActivityKey, ActivityVisualTheme> = {
  practica: {
    subtitle: 'Juega y repasa el vocabulario de ropa y colores en inglés.',
    icon: <Gamepad2 className="w-6 h-6" />,
    stepBadgeBg: 'bg-cyan-400 text-slate-950',
    availableBorder: 'border-cyan-400/70 shadow-cyan-500/15',
    availableButton: 'bg-cyan-400 hover:bg-cyan-300 border-cyan-600 text-slate-950',
  },
  teoria: {
    subtitle: 'Aprende colores, prendas, pronunciación, estructuras y videos de apoyo.',
    icon: <BookOpen className="w-6 h-6" />,
    stepBadgeBg: 'bg-amber-400 text-slate-950',
    availableBorder: 'border-amber-400/70 shadow-amber-500/15',
    availableButton: 'bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-950',
  },
  produccion: {
    subtitle: 'Comparte una foto y descríbela en inglés en el muro virtual de la clase.',
    icon: <ImagePlus className="w-6 h-6" />,
    stepBadgeBg: 'bg-fuchsia-500 text-white',
    availableBorder: 'border-fuchsia-400/70 shadow-fuchsia-500/15',
    availableButton: 'bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-700 text-white',
  },
  valoracion: {
    subtitle: 'Demuestra lo aprendido en el cuestionario final (máximo 2 intentos).',
    icon: <ClipboardCheck className="w-6 h-6" />,
    stepBadgeBg: 'bg-emerald-400 text-slate-950',
    availableBorder: 'border-emerald-400/70 shadow-emerald-500/15',
    availableButton: 'bg-emerald-400 hover:bg-emerald-300 border-emerald-600 text-slate-950',
  },
};

export const Unit1HubPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { progressMap, completedCount, loading } = useUnitProgress('unit-1');
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [attemptsCount, setAttemptsCount] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const loadQuizSummary = async () => {
      const { data } = await supabase
        .from('quiz_attempts')
        .select('score')
        .eq('user_id', user.id)
        .eq('unit_id', 'unit-1');

      if (data && data.length > 0) {
        setAttemptsCount(data.length);
        setBestScore(Math.max(...data.map((d) => d.score)));
      }
    };
    void loadQuizSummary();
  }, [user]);

  const handleCardAction = (key: ActivityKey) => {
    const state = getActivityState(key, progressMap);
    const rule = ACTIVITY_UNLOCK_RULES[key];

    if (state === 'locked') {
      showToast(`${rule.lockedMessage} para entrar a ${rule.label}.`, 'warning');
      return;
    }

    navigate(rule.route);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-200 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a las unidades</span>
        </Link>
      </div>

      {/* Cabecera de la unidad */}
      <section className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-700 rounded-3xl text-white p-5 sm:p-8 shadow-xl border border-purple-300/25">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/25 border border-white/20 text-xs font-extrabold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              UNIT 1 • RUTA GUIADA
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold">Clothes and Colors</h1>
            <p className="text-purple-100 text-sm sm:text-base max-w-xl">
              Sigue el recorrido en orden estricto: cada etapa se desbloquea automáticamente al
              completar la anterior.
            </p>
          </div>

          <div className="flex items-center gap-2.5 bg-black/25 backdrop-blur-xs rounded-2xl p-3 border border-white/15 self-start md:self-center">
            <div className="bg-white rounded-xl p-1.5">
              <ClothingSvg garment="jacket" color="#22C55E" className="w-11 h-11 sm:w-12 sm:h-12" />
            </div>
            <div className="bg-white rounded-xl p-1.5">
              <ClothingSvg garment="dress" color="#FACC15" className="w-11 h-11 sm:w-12 sm:h-12" />
            </div>
            <div className="bg-white rounded-xl p-1.5">
              <ClothingSvg garment="hat" color="#9333EA" className="w-11 h-11 sm:w-12 sm:h-12" />
            </div>
          </div>
        </div>

        <div className="mt-6 bg-black/25 backdrop-blur-xs rounded-2xl p-4 border border-white/15">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold mb-2">
            <span>Progreso en tu mapa de aprendizaje</span>
            <span className="text-amber-300">
              {loading ? '...' : `${completedCount} de 4 etapas completadas`}
            </span>
          </div>
          <ProgressBar value={completedCount} max={4} colorClass="bg-emerald-400" />
        </div>
      </section>

      {/* Ruta secuencial de 4 etapas */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-extrabold text-white">
            Recorrido de la unidad
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completado
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Disponible ahora
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-400/20">
              <Lock className="w-3.5 h-3.5" /> Bloqueado
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {UNIT1_SEQUENCE.map((key) => {
            const rule = ACTIVITY_UNLOCK_RULES[key];
            const theme = ACTIVITY_THEMES[key];
            const visualState = getActivityState(key, progressMap);
            const isLocked = visualState === 'locked';
            const isCompleted = visualState === 'completed';

            return (
              <button
                key={key}
                type="button"
                aria-disabled={isLocked}
                onClick={() => handleCardAction(key)}
                className={`group text-left rounded-3xl p-5 sm:p-6 transition-all flex flex-col justify-between gap-5 ${
                  isLocked
                    ? 'bg-[#1A0F2E]/80 border-2 border-dashed border-purple-400/20 opacity-75 cursor-not-allowed'
                    : isCompleted
                      ? 'quizizz-card border-2 border-emerald-400/60 hover:border-emerald-300 cursor-pointer'
                      : `quizizz-card border-2 ${theme.availableBorder} shadow-lg hover:-translate-y-0.5 cursor-pointer`
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold shadow-sm ${
                          isLocked
                            ? 'bg-purple-950 text-purple-400 border border-purple-400/20'
                            : theme.stepBadgeBg
                        }`}
                      >
                        {isLocked ? <Lock className="w-5 h-5" /> : theme.icon}
                      </div>
                      <div>
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-300/80">
                          Etapa {rule.step} de 4
                        </span>
                        <h3
                          className={`text-xl font-extrabold ${
                            isLocked ? 'text-purple-200/70' : 'text-white'
                          }`}
                        >
                          {rule.label}
                        </h3>
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold shrink-0">
                        <Award className="w-4 h-4" />
                        Completado
                      </span>
                    ) : isLocked ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950 border border-purple-400/20 text-purple-300 text-xs font-bold shrink-0">
                        <Lock className="w-3.5 h-3.5 text-amber-300" />
                        Bloqueado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-xs font-extrabold shrink-0 animate-pulse">
                        <Sparkles className="w-3.5 h-3.5" />
                        Disponible ahora
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      isLocked ? 'text-purple-300/60' : 'text-purple-100/85'
                    }`}
                  >
                    {theme.subtitle}
                  </p>

                  {isLocked && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/25 text-xs font-bold text-amber-300">
                      <Lock className="w-3.5 h-3.5 shrink-0" />
                      <span>{rule.lockedMessage}</span>
                    </div>
                  )}

                  {key === 'valoracion' && !isLocked && attemptsCount > 0 && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-xs font-bold text-emerald-200">
                      <span>Mejor nota: {bestScore}/100</span>
                      <span>•</span>
                      <span>
                        Intentos: {attemptsCount}/{MAX_QUIZ_ATTEMPTS}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-950/80 border border-purple-400/20 text-purple-300/70 text-xs font-bold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Etapa bloqueada</span>
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold border-b-4 transition-all ${
                        isCompleted
                          ? 'bg-emerald-500 hover:bg-emerald-400 border-emerald-700 text-slate-950'
                          : theme.availableButton
                      }`}
                    >
                      <span>{isCompleted ? 'Revisar etapa' : 'Empezar ahora'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
