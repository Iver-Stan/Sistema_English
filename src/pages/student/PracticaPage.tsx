import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Gamepad2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import { useToast } from '../../components/ui/Toast';
import { ClothingSvg } from '../../components/illustrations/ClothingSvg';

export const PracticaPage: React.FC = () => {
  const { progressMap, markCompleted } = useUnitProgress('unit-1');
  const { settings, loading: settingsLoading } = useUnitSettings('unit-1');
  const { showToast } = useToast();

  const [clickedPlay, setClickedPlay] = useState(false);
  const [saving, setSaving] = useState(false);

  const isCompleted = progressMap.practica;

  const handleMarkCompleted = async () => {
    setSaving(true);
    const { error } = await markCompleted('practica');
    setSaving(false);

    if (error) {
      showToast(error, 'error');
      return;
    }
    showToast('¡Excelente! Ya desbloqueaste la Etapa 2: Teoría.', 'success');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          to="/unit/1"
          className="inline-flex items-center gap-2 text-sm font-bold text-purple-200 hover:text-amber-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a UNIT 1</span>
        </Link>

        {isCompleted && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold">
            <CheckCircle2 className="w-4 h-4" />
            Práctica completada
          </span>
        )}
      </div>

      <section className="quizizz-card rounded-3xl overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-600 p-6 sm:p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center shrink-0">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-cyan-100">
                UNIT 1 • Etapa 1 de 4
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Práctica interactiva</h1>
            </div>
          </div>
          <p className="text-cyan-50 text-sm sm:text-base mt-2">
            ¡Exploremos lo que ya sabes jugando! Abre los juegos en una nueva pestaña para descubrir
            y experimentar qué prendas y colores en inglés ya reconoces, y luego marca esta etapa
            para desbloquear Teoría.
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-6">
          <div className="bg-[#160C28] rounded-2xl border border-purple-400/20 p-5 flex flex-col sm:flex-row items-center gap-5">
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="bg-white rounded-2xl p-2 shadow-sm">
                <ClothingSvg garment="tshirt" color="#3B82F6" className="w-14 h-14" />
              </div>
              <div className="bg-white rounded-2xl p-2 shadow-sm">
                <ClothingSvg garment="sneakers" color="#22C55E" className="w-14 h-14" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="font-extrabold text-amber-300 text-base">Instrucciones rápidas:</h2>
              <ol className="text-sm text-purple-100/85 mt-1.5 space-y-1 list-decimal list-inside">
                <li>
                  Empieza con <strong className="text-white">Actividad 1 (Wordwall)</strong> y luego
                  continúa con <strong className="text-white">Actividad 2</strong> (ambas se abren
                  en una nueva pestaña).
                </li>
                <li>Juega una o más rondas identificando prendas y colores en inglés.</li>
                <li>Al terminar, regresa aquí y marca la actividad como completada.</li>
              </ol>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3.5 pt-2">
            {/* Botón 1 (Nuevo, arriba/primero): Wordwall */}
            <a
              href={settings.practice_wordwall_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setClickedPlay(true)}
              className={`w-full sm:w-[440px] inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-base sm:text-lg border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all shadow-lg ${
                settingsLoading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>Actividad 1: Empecemos a jugar (Wordwall)</span>
              <ExternalLink className="w-5 h-5 shrink-0" />
            </a>

            {/* Botón 2 (Existente, debajo/segundo): Juego de vocabulario */}
            <a
              href={settings.practice_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setClickedPlay(true)}
              className={`w-full sm:w-[440px] inline-flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold text-base sm:text-lg border-b-4 border-cyan-600 active:border-b-0 active:translate-y-1 transition-all shadow-lg ${
                settingsLoading ? 'pointer-events-none opacity-60' : ''
              }`}
            >
              <Gamepad2 className="w-5 h-5 shrink-0" />
              <span>Actividad 2: Más práctica de vocabulario</span>
              <ExternalLink className="w-5 h-5 shrink-0" />
            </a>

            <div className="w-full border-t border-purple-400/20 pt-5 mt-2 flex flex-col items-center text-center gap-3">
              <p className="text-xs sm:text-sm text-purple-200/80">
                {clickedPlay
                  ? '¡Genial! Cuando termines de jugar, guarda tu avance para desbloquear Teoría:'
                  : '¿Ya jugaste en las otras pestañas? Registra tu avance abajo:'}
              </p>

              {isCompleted ? (
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>¡Práctica completada!</span>
                  </div>
                  <Link
                    to="/unit/1/teoria"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm border-b-4 border-amber-600 transition-all"
                  >
                    <span>Ir a Teoría (Etapa 2)</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleMarkCompleted()}
                  className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-extrabold text-sm sm:text-base border-b-4 active:border-b-0 active:translate-y-1 transition-all cursor-pointer ${
                    clickedPlay
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 border-emerald-700 shadow-lg'
                      : 'bg-white/10 hover:bg-emerald-500 hover:text-slate-950 text-white border-purple-400/30 hover:border-emerald-700'
                  }`}
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Ya terminé de practicar (Marcar como completado)</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
