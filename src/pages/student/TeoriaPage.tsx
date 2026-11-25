import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileDown,
  FileText,
  Loader2,
  Volume2,
  Youtube,
} from 'lucide-react';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import { useToast } from '../../components/ui/Toast';
import { ClothingSvg } from '../../components/illustrations/ClothingSvg';
import { UnitActivityGuard } from '../../components/layout/UnitActivityGuard';
import {
  CLOTHES_VOCAB,
  COLORS_VOCAB,
  GRAMMAR_EXAMPLES,
} from '../../data/unit1Theory';

export const TeoriaPage: React.FC = () => {
  const { progressMap, markCompleted } = useUnitProgress('unit-1');
  const { settings } = useUnitSettings('unit-1');
  const { showToast } = useToast();
  const [saving, setSaving] = useState(false);

  const isCompleted = progressMap.teoria;
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakWord = (text: string) => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    window.speechSynthesis.speak(utterance);
  };

  const handleMarkCompleted = async () => {
    setSaving(true);
    const { error } = await markCompleted('teoria');
    setSaving(false);

    if (error) {
      showToast(error, 'error');
      return;
    }
    showToast('¡Teoría completada! Ya desbloqueaste la Etapa 3: Producción.', 'success');
  };

  return (
    <UnitActivityGuard activityKey="teoria">
      <div className="space-y-6">
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
              Teoría completada
            </span>
          )}
        </div>

        {/* Cabecera */}
        <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl text-slate-950 p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900/80">
                UNIT 1 • Etapa 2 de 4
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold">Teoría visual de la unidad</h1>
            </div>
          </div>
          <p className="text-slate-900/90 font-medium text-sm sm:text-base mt-2">
            Repasa los colores, las prendas de vestir básicas y cómo combinarlas en frases reales en
            inglés.{' '}
            {speechSupported ? 'Pulsa el ícono de altavoz para escuchar la pronunciación.' : ''}
          </p>
        </section>

        {/* Tarjeta de PDF oficial del profesor */}
        <section className="quizizz-card rounded-3xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/30 text-amber-300 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-white">
                  Material oficial en PDF
                </h2>
                {settings.theory_pdf_url ? (
                  <p className="text-sm text-purple-100/85 mt-0.5">
                    Tu profesor compartió el documento PDF oficial de la clase para que puedas
                    descargarlo o imprimirlo.
                  </p>
                ) : (
                  <p className="text-sm text-purple-200/75 mt-0.5">
                    El material descargable en PDF se habilitará pronto desde el panel del profesor.
                    Mientras tanto, estudia la guía visual completa aquí abajo.
                  </p>
                )}
              </div>
            </div>

            {settings.theory_pdf_url ? (
              <a
                href={settings.theory_pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm border-b-4 border-amber-600 shrink-0 transition-colors"
              >
                <FileDown className="w-4 h-4" />
                <span>Abrir / Descargar PDF</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            ) : (
              <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-[#160C28] border border-purple-400/20 text-purple-300 text-xs font-bold shrink-0 self-start sm:self-center">
                Próximamente
              </span>
            )}
          </div>
        </section>

        {/* Sección 1: Colors */}
        <section className="quizizz-card rounded-3xl p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-white">1. Colors (Los colores)</h2>
            <p className="text-sm text-purple-200/80 mt-0.5">
              Observa cada color, su nombre en inglés y una guía sencilla de pronunciación.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {COLORS_VOCAB.map((item) => (
              <div
                key={item.english}
                className="rounded-2xl border border-purple-400/25 bg-[#160C28] p-3.5 flex flex-col gap-2.5 hover:border-amber-300/60 transition-colors"
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className="w-11 h-11 rounded-xl shadow-sm shrink-0"
                    style={{
                      backgroundColor: item.hex,
                      border: `2px solid ${item.borderHex || 'rgba(255,255,255,0.28)'}`,
                    }}
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={() => speakWord(item.english)}
                      className="p-2 rounded-xl bg-[#24143D] border border-purple-400/30 text-purple-100 hover:text-amber-300 hover:border-amber-300 transition-colors cursor-pointer"
                      aria-label={`Escuchar ${item.english}`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="font-extrabold text-white text-base">{item.english}</p>
                  <p className="text-xs font-semibold text-purple-200/90">{item.spanish}</p>
                  <p className="text-[11px] text-cyan-300 font-semibold mt-0.5">
                    /{item.pronunciation}/
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 2: Clothes */}
        <section className="quizizz-card rounded-3xl p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-white">
              2. Clothes (Prendas de vestir)
            </h2>
            <p className="text-sm text-purple-200/80 mt-0.5">
              Aprende el nombre de las prendas más usadas en inglés.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
            {CLOTHES_VOCAB.map((item) => (
              <div
                key={item.english}
                className="rounded-2xl border border-purple-400/25 bg-[#160C28] p-3.5 flex flex-col justify-between gap-2.5 hover:border-cyan-400/60 transition-colors"
              >
                <div className="relative bg-white rounded-xl p-2.5 flex items-center justify-center shadow-inner">
                  <ClothingSvg
                    garment={item.garment}
                    color={item.defaultColor}
                    accentColor={item.accentColor}
                    className="w-20 h-20"
                    title={item.english}
                  />
                  {speechSupported && (
                    <button
                      type="button"
                      onClick={() => speakWord(item.english)}
                      className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-indigo-100 hover:text-indigo-700 transition-colors cursor-pointer"
                      aria-label={`Escuchar ${item.english}`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div>
                  <p className="font-extrabold text-white text-base">{item.english}</p>
                  <p className="text-xs font-semibold text-purple-200/90">{item.spanish}</p>
                  <p className="text-[11px] text-amber-300 font-semibold mt-0.5">
                    /{item.pronunciation}/
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 3: Estructuras clave */}
        <section className="quizizz-card rounded-3xl p-5 sm:p-7">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-white">
              3. Key Structures (Estructuras clave)
            </h2>
            <p className="text-sm text-purple-200/80 mt-0.5">
              Cómo unir colores y ropa para hablar sobre lo que tú o alguien más lleva puesto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GRAMMAR_EXAMPLES.map((ex) => (
              <div
                key={ex.title}
                className="rounded-2xl border border-purple-400/25 bg-[#160C28] p-4 flex items-center gap-4"
              >
                <div className="bg-white rounded-2xl p-2 shrink-0 shadow-sm">
                  <ClothingSvg garment={ex.garment} color={ex.color} className="w-16 h-16" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-amber-300">
                    {ex.title}
                  </p>
                  <p className="text-[11px] font-mono text-cyan-300 mt-0.5">{ex.formula}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <p className="text-base font-extrabold text-white">&quot;{ex.sentence}&quot;</p>
                    {speechSupported && (
                      <button
                        type="button"
                        onClick={() => speakWord(ex.sentence)}
                        className="p-1.5 rounded-lg bg-[#24143D] border border-purple-400/30 text-purple-100 hover:text-amber-300 cursor-pointer shrink-0"
                        aria-label={`Escuchar ${ex.sentence}`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-purple-200/85 mt-1 leading-snug">{ex.translation}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Sección 4: Videos externos en YouTube (SIN embeds) */}
        <section className="quizizz-card rounded-3xl p-5 sm:p-7">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/30 text-rose-400 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Videos recomendados en YouTube</h2>
          </div>
          <p className="text-sm text-purple-200/80 mb-5">
            Estos botones te llevarán directamente a YouTube en una nueva pestaña para reforzar la
            pronunciación.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {settings.youtube_links.map((video, index) => (
              <a
                key={`${video.title}-${index}`}
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-2xl border border-purple-400/25 hover:border-rose-400/70 bg-[#160C28] p-4 flex flex-col justify-between gap-4 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-extrabold border border-rose-400/30">
                      <Youtube className="w-3.5 h-3.5" />
                      YouTube
                    </span>
                    <ExternalLink className="w-4 h-4 text-purple-300/60 group-hover:text-rose-400 transition-colors" />
                  </div>
                  <h3 className="font-extrabold text-white text-sm sm:text-base leading-snug">
                    {video.title}
                  </h3>
                  {video.description ? (
                    <p className="text-xs text-purple-200/80 mt-1.5 leading-relaxed">
                      {video.description}
                    </p>
                  ) : null}
                </div>

                <span className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-600 group-hover:bg-rose-500 text-white text-xs font-extrabold border-b-2 border-rose-800 transition-colors">
                  <span>Ver en YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Botón final de cumplimiento */}
        <section className="quizizz-card rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-white text-base">
              ¿Terminaste de revisar toda la teoría?
            </h3>
            <p className="text-sm text-purple-200/80">
              Marca esta etapa como completada para desbloquear el Muro Virtual (Producción).
            </p>
          </div>

          {isCompleted ? (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
              <div className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Teoría completada</span>
              </div>
              <Link
                to="/unit/1/produccion"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-extrabold text-sm border-b-4 border-fuchsia-700 transition-all"
              >
                <span>Ir a Producción (Etapa 3)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <button
              type="button"
              disabled={saving}
              onClick={() => void handleMarkCompleted()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm sm:text-base border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shrink-0"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Marcar teoría como completada</span>
                </>
              )}
            </button>
          )}
        </section>
      </div>
    </UnitActivityGuard>
  );
};
