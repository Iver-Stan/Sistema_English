import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  History,
  Loader2,
  Lock,
  Play,
  RotateCcw,
  Trophy,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { supabase } from '../../lib/supabase';
import { MAX_QUIZ_ATTEMPTS } from '../../lib/unitProgression';
import { UNIT1_QUIZ_QUESTIONS } from '../../data/unit1Quiz';
import { ClothingSvg } from '../../components/illustrations/ClothingSvg';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { useToast } from '../../components/ui/Toast';
import { UnitActivityGuard } from '../../components/layout/UnitActivityGuard';
import type { QuizAttempt } from '../../types/database';

type QuizPhase = 'intro' | 'playing' | 'results';

const QUIZ_TILE_STYLES = [
  'bg-sky-500 hover:bg-sky-400 border-sky-700 text-white',
  'bg-teal-500 hover:bg-teal-400 border-teal-700 text-white',
  'bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-950',
  'bg-fuchsia-500 hover:bg-fuchsia-400 border-fuchsia-700 text-white',
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const ValoracionPage: React.FC = () => {
  const { user } = useAuth();
  const { markCompleted } = useUnitProgress('unit-1');
  const { showToast } = useToast();

  const [phase, setPhase] = useState<QuizPhase>('intro');
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [checkingLimit, setCheckingLimit] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastAttemptResult, setLastAttemptResult] = useState<{
    score: number;
    correct: number;
    total: number;
    seconds: number;
    attemptNumber: number;
  } | null>(null);
  const [savingAttempt, setSavingAttempt] = useState(false);

  const totalQuestions = UNIT1_QUIZ_QUESTIONS.length;
  const currentQuestion = UNIT1_QUIZ_QUESTIONS[currentIndex];

  const loadAttempts = useCallback(async () => {
    if (!user) return;
    setLoadingHistory(true);
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('unit_id', 'unit-1')
      .order('attempt_number', { ascending: false });

    if (!error && data) {
      setAttempts(data as QuizAttempt[]);
    }
    setLoadingHistory(false);
  }, [user]);

  useEffect(() => {
    void loadAttempts();
  }, [loadAttempts]);

  // Cronómetro en vivo mientras se juega
  useEffect(() => {
    if (phase !== 'playing') return;
    const interval = window.setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [phase]);

  const attemptsUsed = attempts.length;
  const attemptsRemaining = Math.max(0, MAX_QUIZ_ATTEMPTS - attemptsUsed);
  const limitReached = attemptsUsed >= MAX_QUIZ_ATTEMPTS;

  const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a) => a.score)) : null;
  const bestAttempt =
    attempts.length > 0
      ? attempts.reduce((best, curr) => {
          if (curr.score > best.score) return curr;
          if (curr.score === best.score && curr.duration_seconds < best.duration_seconds) {
            return curr;
          }
          return best;
        }, attempts[0])
      : null;

  const startQuiz = async () => {
    if (!user) return;
    setCheckingLimit(true);

    // Verificar directamente en Supabase para evitar reinicios al recargar
    const { data: latestAttempts, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', user.id)
      .eq('unit_id', 'unit-1')
      .order('attempt_number', { ascending: false });

    setCheckingLimit(false);

    if (error) {
      showToast('No se pudo verificar tus intentos disponibles. Inténtalo de nuevo.', 'error');
      return;
    }

    const serverAttempts = (latestAttempts as QuizAttempt[]) || [];
    setAttempts(serverAttempts);

    if (serverAttempts.length >= MAX_QUIZ_ATTEMPTS) {
      setPhase('intro');
      showToast('Ya completaste tus 2 intentos permitidos en esta valoración.', 'warning');
      return;
    }

    setCurrentIndex(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setElapsedSeconds(0);
    setLastAttemptResult(null);
    setPhase('playing');
  };

  const handleSelectOption = (optionIndex: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIndex);
    if (optionIndex === currentQuestion.correctIndex) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const finishQuiz = async (finalCorrectCount: number, finalSeconds: number) => {
    if (!user) return;

    const score = Math.round((finalCorrectCount / totalQuestions) * 100);
    setSavingAttempt(true);

    // Reconfirmar intentos actuales desde Supabase antes de insertar
    const { data: existingRows } = await supabase
      .from('quiz_attempts')
      .select('attempt_number')
      .eq('user_id', user.id)
      .eq('unit_id', 'unit-1');

    const currentRows = existingRows || [];
    if (currentRows.length >= MAX_QUIZ_ATTEMPTS) {
      setSavingAttempt(false);
      await loadAttempts();
      setPhase('intro');
      showToast('Ya habías completado el máximo de 2 intentos permitidos.', 'warning');
      return;
    }

    const nextAttemptNumber =
      currentRows.length > 0
        ? Math.max(...currentRows.map((a) => a.attempt_number)) + 1
        : 1;

    setLastAttemptResult({
      score,
      correct: finalCorrectCount,
      total: totalQuestions,
      seconds: finalSeconds,
      attemptNumber: nextAttemptNumber,
    });
    setPhase('results');

    const { error: attemptError } = await supabase.from('quiz_attempts').insert({
      user_id: user.id,
      unit_id: 'unit-1',
      attempt_number: nextAttemptNumber,
      correct_answers: finalCorrectCount,
      total_questions: totalQuestions,
      score,
      duration_seconds: finalSeconds,
    });

    if (attemptError) {
      showToast('No se pudo guardar el intento en el servidor.', 'error');
    } else {
      await markCompleted('valoracion');
      await loadAttempts();
    }

    setSavingAttempt(false);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    if (currentIndex + 1 < totalQuestions) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
    } else {
      void finishQuiz(correctCount, elapsedSeconds);
    }
  };

  return (
    <UnitActivityGuard activityKey="valoracion">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link
            to="/unit/1"
            className="inline-flex items-center gap-2 text-sm font-bold text-purple-200 hover:text-amber-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a UNIT 1</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-purple-400/25 text-purple-100 text-xs font-extrabold">
              Intentos: {attemptsUsed} de {MAX_QUIZ_ATTEMPTS}
            </span>
            {attempts.length > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4" />
                Completado
              </span>
            )}
          </div>
        </div>

        {/* PANTALLA INTRO */}
        {phase === 'intro' && (
          <div className="space-y-6">
            <section className="quizizz-card rounded-3xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-6 sm:p-8 text-slate-950">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-11 h-11 rounded-2xl bg-black/15 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-slate-900/80">
                      UNIT 1 • Etapa 4 de 4
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-extrabold">
                      Valoración Final (Cuestionario)
                    </h1>
                  </div>
                </div>
                <p className="text-slate-900/90 font-medium text-sm sm:text-base mt-2">
                  Responde {totalQuestions} preguntas sobre ropa y colores. Tienes un máximo de{' '}
                  <strong>2 intentos</strong> para demostrar lo aprendido y lograr tu mejor puntaje.
                </p>
              </div>

              <div className="p-5 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#160C28] border border-purple-400/20 p-4 text-center">
                    <p className="text-2xl font-extrabold text-white">{totalQuestions}</p>
                    <p className="text-xs font-semibold text-purple-200/80">Preguntas rápidas</p>
                  </div>
                  <div className="rounded-2xl bg-[#160C28] border border-purple-400/20 p-4 text-center">
                    <p className="text-2xl font-extrabold text-amber-300">
                      {attemptsUsed} / {MAX_QUIZ_ATTEMPTS}
                    </p>
                    <p className="text-xs font-semibold text-purple-200/80">
                      {limitReached
                        ? 'Intentos completados'
                        : `Te ${attemptsRemaining === 1 ? 'queda 1 intento' : 'quedan 2 intentos'}`}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-[#160C28] border border-purple-400/20 p-4 text-center">
                    <p className="text-2xl font-extrabold text-emerald-400">
                      {bestScore !== null ? `${bestScore}/100` : '--'}
                    </p>
                    <p className="text-xs font-semibold text-purple-200/80">Tu mejor nota</p>
                  </div>
                </div>

                {loadingHistory ? (
                  <div className="py-6 flex items-center justify-center gap-2 text-purple-200">
                    <Loader2 className="w-5 h-5 animate-spin text-amber-400" />
                    <span className="text-sm font-semibold">Consultando tus intentos...</span>
                  </div>
                ) : limitReached ? (
                  <div className="rounded-2xl bg-emerald-500/15 border border-emerald-400/35 p-5 text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-extrabold">
                      <Award className="w-4 h-4" />
                      <span>2 de 2 intentos completados</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-white">
                      ¡Ya completaste tus intentos permitidos!
                    </h2>
                    <p className="text-sm text-purple-100/85">
                      Tu mejor puntaje registrado fue{' '}
                      <strong className="text-emerald-300">{bestScore}/100</strong>
                      {bestAttempt ? ` en ${bestAttempt.duration_seconds} segundos` : ''}. Tu
                      profesor ya puede ver tus resultados.
                    </p>
                    <div className="pt-1">
                      <Link
                        to="/unit/1"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-purple-300/30 text-white font-bold text-sm transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Volver al mapa de UNIT 1</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs font-extrabold">
                      <span>
                        {attemptsUsed === 0
                          ? 'Intento 1 de 2 disponible'
                          : 'Te queda 1 intento disponible (Intento 2 de 2)'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={checkingLimit}
                      onClick={() => void startQuiz()}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-slate-950 font-extrabold text-lg border-b-4 border-emerald-600 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-lg"
                    >
                      {checkingLimit ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Verificando...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 fill-current" />
                          <span>
                            {attemptsUsed === 0
                              ? '¡Comenzar cuestionario!'
                              : 'Realizar mi 2.º y último intento'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </section>

            {/* Detalle de intentos realizados */}
            {!loadingHistory && attempts.length > 0 && (
              <section className="quizizz-card rounded-3xl p-5 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-amber-300" />
                  <h2 className="text-base sm:text-lg font-extrabold text-white">
                    Detalle de tus intentos ({attempts.length} de {MAX_QUIZ_ATTEMPTS})
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-purple-400/20 text-xs uppercase text-purple-300/80">
                        <th className="py-2 pr-4">Intento</th>
                        <th className="py-2 pr-4">Nota</th>
                        <th className="py-2 pr-4">Aciertos</th>
                        <th className="py-2 pr-4">Tiempo</th>
                        <th className="py-2">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-400/15">
                      {attempts.map((a) => (
                        <tr key={a.id} className="text-purple-100">
                          <td className="py-2.5 pr-4 font-bold">Intento {a.attempt_number}</td>
                          <td className="py-2.5 pr-4 font-extrabold text-emerald-300">
                            {a.score}/100
                          </td>
                          <td className="py-2.5 pr-4">
                            {a.correct_answers}/{a.total_questions}
                          </td>
                          <td className="py-2.5 pr-4">{a.duration_seconds}s</td>
                          <td className="py-2.5 text-xs text-purple-300/75">
                            {new Date(a.created_at).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}

        {/* PANTALLA JUGANDO */}
        {phase === 'playing' && currentQuestion && (
          <section className="quizizz-card rounded-3xl p-5 sm:p-8 space-y-6 animate-pop">
            {/* HUD superior */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-200 text-xs font-extrabold">
                  Pregunta {currentIndex + 1} de {totalQuestions}
                </span>
                <span className="px-2.5 py-1 rounded-xl bg-white/10 text-purple-200 text-xs font-bold">
                  Intento {attemptsUsed + 1} de {MAX_QUIZ_ATTEMPTS}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold">
                  <CheckCircle2 className="w-4 h-4" />
                  {correctCount} aciertos
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#160C28] border border-purple-400/25 text-amber-300 text-xs font-extrabold tabular-nums">
                  <Clock className="w-4 h-4" />
                  {formatDuration(elapsedSeconds)}
                </span>
              </div>
            </div>

            <ProgressBar
              value={currentIndex + (selectedOption !== null ? 1 : 0)}
              max={totalQuestions}
              colorClass="bg-amber-400"
              heightClass="h-3"
            />

            {/* Consigna en español + contenido en inglés */}
            <div className="bg-[#160C28] rounded-2xl border border-purple-400/25 p-5 sm:p-6 text-center space-y-4">
              <span className="inline-block px-3 py-1 rounded-full bg-purple-900/70 border border-purple-400/25 text-[11px] font-extrabold uppercase tracking-wide text-cyan-300">
                {currentQuestion.type === 'visual'
                  ? 'Identificación visual'
                  : currentQuestion.type === 'fill-blank'
                    ? 'Completa la oración'
                    : 'Opción múltiple'}
              </span>

              {currentQuestion.visual && (
                <div className="mx-auto w-36 h-36 bg-white rounded-3xl border-4 border-purple-300/40 shadow-lg flex items-center justify-center p-3">
                  <ClothingSvg
                    garment={currentQuestion.visual.garment}
                    color={currentQuestion.visual.color}
                    accentColor={currentQuestion.visual.accentColor}
                    className="w-28 h-28"
                  />
                </div>
              )}

              <p className="text-sm sm:text-base font-bold text-purple-200">
                {currentQuestion.instructionEs}
              </p>

              {currentQuestion.sentenceEn && (
                <h2 className="text-xl sm:text-2xl font-extrabold text-amber-300 bg-[#24143D] inline-block px-5 py-2.5 rounded-2xl border border-amber-400/30">
                  &quot;{currentQuestion.sentenceEn}&quot;
                </h2>
              )}
            </div>

            {/* 4 opciones estilo Quizizz */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentQuestion.options.map((option, idx) => {
                const isAnswered = selectedOption !== null;
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQuestion.correctIndex;

                let tileClass = QUIZ_TILE_STYLES[idx % QUIZ_TILE_STYLES.length];
                if (isAnswered) {
                  if (isCorrect) {
                    tileClass =
                      'bg-emerald-500 border-emerald-700 text-slate-950 ring-4 ring-emerald-300/50';
                  } else if (isSelected) {
                    tileClass = 'bg-rose-600 border-rose-800 text-white animate-shake';
                  } else {
                    tileClass =
                      'bg-[#160C28] border-purple-900 text-purple-300/40 opacity-60';
                  }
                }

                return (
                  <button
                    key={option}
                    type="button"
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-4 sm:p-5 rounded-2xl border-b-4 font-extrabold text-base sm:text-lg text-left flex items-center justify-between gap-3 transition-all ${
                      isAnswered
                        ? 'cursor-default'
                        : 'active:border-b-0 active:translate-y-1 cursor-pointer'
                    } ${tileClass}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-black/20 flex items-center justify-center text-xs font-extrabold shrink-0">
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="break-words">{option}</span>
                    </div>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && (
                      <XCircle className="w-6 h-6 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Retroalimentación inmediata en español */}
            {selectedOption !== null && (
              <div
                className={`rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-pop border ${
                  selectedOption === currentQuestion.correctIndex
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100'
                    : 'bg-rose-500/20 border-rose-400/50 text-rose-100'
                }`}
              >
                <div>
                  <p className="font-extrabold text-sm sm:text-base">
                    {selectedOption === currentQuestion.correctIndex
                      ? '¡Excelente! Respuesta correcta.'
                      : '¡Casi! Sigue intentando, revisa la explicación:'}
                  </p>
                  <p className="text-xs sm:text-sm mt-0.5 opacity-95">
                    {currentQuestion.explanationEs}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleNextQuestion}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm border-b-4 border-amber-600 shrink-0 cursor-pointer"
                >
                  <span>
                    {currentIndex + 1 < totalQuestions ? 'Siguiente pregunta' : 'Ver resultados'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </section>
        )}

        {/* PANTALLA RESULTADOS */}
        {phase === 'results' && lastAttemptResult && (
          <section className="quizizz-card rounded-3xl p-6 sm:p-8 text-center space-y-6 animate-pop">
            <div className="mx-auto w-20 h-20 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10" />
            </div>

            <div>
              <span className="inline-block px-3.5 py-1 rounded-full bg-fuchsia-500/20 border border-fuchsia-400/35 text-fuchsia-200 text-xs font-extrabold mb-2">
                Intento {lastAttemptResult.attemptNumber} de {MAX_QUIZ_ATTEMPTS} guardado
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                {lastAttemptResult.score >= 80
                  ? '¡Excelente trabajo!'
                  : lastAttemptResult.score >= 60
                    ? '¡Buen trabajo! Vas por buen camino'
                    : '¡Sigue intentando!'}
              </h1>
              <p className="text-sm text-purple-200/80 mt-1">
                {savingAttempt
                  ? 'Guardando tu resultado en el sistema...'
                  : lastAttemptResult.attemptNumber >= MAX_QUIZ_ATTEMPTS
                    ? 'Ya completaste tus 2 intentos permitidos. Este es tu resumen final.'
                    : 'Te queda 1 intento disponible por si deseas mejorar tu puntaje.'}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
              <div className="rounded-2xl bg-[#160C28] border border-purple-400/25 p-4">
                <p className="text-3xl font-extrabold text-amber-300">
                  {lastAttemptResult.score}/100
                </p>
                <p className="text-xs font-bold text-purple-200/80 mt-1">Nota de este intento</p>
              </div>
              <div className="rounded-2xl bg-[#160C28] border border-purple-400/25 p-4">
                <p className="text-3xl font-extrabold text-emerald-400">
                  {lastAttemptResult.correct}/{lastAttemptResult.total}
                </p>
                <p className="text-xs font-bold text-purple-200/80 mt-1">Respuestas correctas</p>
              </div>
              <div className="rounded-2xl bg-[#160C28] border border-purple-400/25 p-4">
                <p className="text-3xl font-extrabold text-cyan-300">
                  {lastAttemptResult.seconds}s
                </p>
                <p className="text-xs font-bold text-purple-200/80 mt-1">Tiempo total</p>
              </div>
            </div>

            {/* Si ya completó los 2 intentos, mostrar resumen de ambos y mejor puntaje */}
            {!savingAttempt && attempts.length >= MAX_QUIZ_ATTEMPTS && (
              <div className="bg-[#160C28] rounded-2xl border border-emerald-400/35 p-5 text-left space-y-3 max-w-xl mx-auto">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-sm font-extrabold text-emerald-300">
                    <Award className="w-4 h-4" />
                    Mejor puntaje obtenido: {bestScore}/100
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-300">
                    <Lock className="w-3.5 h-3.5" />2 de 2 intentos usados
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {attempts.map((a) => (
                    <div
                      key={a.id}
                      className="rounded-xl bg-[#24143D] border border-purple-400/20 p-3 text-xs flex items-center justify-between"
                    >
                      <span className="font-bold text-white">Intento {a.attempt_number}</span>
                      <span className="font-extrabold text-amber-300">{a.score}/100</span>
                      <span className="text-purple-200">{a.duration_seconds}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              {!savingAttempt && attempts.length < MAX_QUIZ_ATTEMPTS && (
                <button
                  type="button"
                  disabled={checkingLimit}
                  onClick={() => void startQuiz()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-sm sm:text-base border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Realizar 2.º intento (Te queda 1)</span>
                </button>
              )}

              <Link
                to="/unit/1"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-purple-400/30 text-white font-bold text-sm sm:text-base transition-all"
              >
                <span>Volver a UNIT 1</span>
              </Link>
            </div>
          </section>
        )}
      </div>
    </UnitActivityGuard>
  );
};
