import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDashed,
  Download,
  HeartHandshake,
  Loader2,
  RefreshCw,
  Search,
  Users,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { exportStudentsCsv } from '../../lib/csvExport';
import { MAX_QUIZ_ATTEMPTS } from '../../lib/unitProgression';
import {
  REFLECTION_Q1,
  REFLECTION_Q2,
  REFLECTION_TITLE,
} from '../../data/unit1Reflection';
import { useToast } from '../../components/ui/Toast';
import type {
  ActivityKey,
  ActivityProgress,
  Profile,
  QuizAttempt,
  StudentSummary,
  UnitReflection,
} from '../../types/database';

const ACTIVITY_LABELS: { key: ActivityKey; short: string; full: string }[] = [
  { key: 'practica', short: 'Prác.', full: 'Práctica' },
  { key: 'teoria', short: 'Teor.', full: 'Teoría' },
  { key: 'produccion', short: 'Prod.', full: 'Producción' },
  { key: 'valoracion', short: 'Val.', full: 'Valoración' },
];

export const StudentTrackingTab: React.FC = () => {
  const { showToast } = useToast();
  const [rows, setRows] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

  const loadTrackingData = useCallback(async () => {
    setLoading(true);
    const [profilesRes, progressRes, attemptsRes, reflectionsRes] = await Promise.all([
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
      supabase.from('activity_progress').select('*').eq('unit_id', 'unit-1'),
      supabase
        .from('quiz_attempts')
        .select('*')
        .eq('unit_id', 'unit-1')
        .order('attempt_number', { ascending: false }),
      supabase.from('unit_reflections').select('*').eq('unit_id', 'unit-1'),
    ]);

    if (profilesRes.error || progressRes.error || attemptsRes.error) {
      showToast('Error al cargar los datos de seguimiento.', 'error');
      setLoading(false);
      return;
    }

    const students = (profilesRes.data as Profile[]) || [];
    const progressList = (progressRes.data as ActivityProgress[]) || [];
    const attemptsList = (attemptsRes.data as QuizAttempt[]) || [];
    const reflectionsList = (!reflectionsRes.error && reflectionsRes.data
      ? (reflectionsRes.data as UnitReflection[])
      : []) as UnitReflection[];

    const reflectionsByUser = new Map<string, UnitReflection>();
    for (const r of reflectionsList) {
      reflectionsByUser.set(r.user_id, r);
    }

    const summaryRows: StudentSummary[] = students.map((student) => {
      const progress: Record<ActivityKey, boolean> = {
        practica: false,
        teoria: false,
        produccion: false,
        valoracion: false,
      };

      for (const p of progressList) {
        if (p.user_id === student.id && p.completed && p.activity_key in progress) {
          progress[p.activity_key] = true;
        }
      }

      const studentAttempts = attemptsList
        .filter((a) => a.user_id === student.id)
        .sort((a, b) => b.attempt_number - a.attempt_number);

      let bestScore: number | null = null;
      let bestAttemptSeconds: number | null = null;
      let lastAttemptSeconds: number | null = null;

      if (studentAttempts.length > 0) {
        lastAttemptSeconds = studentAttempts[0].duration_seconds;
        const bestAttempt = studentAttempts.reduce((best, curr) => {
          if (curr.score > best.score) return curr;
          if (curr.score === best.score && curr.duration_seconds < best.duration_seconds) {
            return curr;
          }
          return best;
        }, studentAttempts[0]);
        bestScore = bestAttempt.score;
        bestAttemptSeconds = bestAttempt.duration_seconds;
      }

      const completedCount = Object.values(progress).filter(Boolean).length;

      return {
        profile: student,
        progress,
        completedCount,
        attemptsCount: studentAttempts.length,
        bestScore,
        bestAttemptSeconds,
        lastAttemptSeconds,
        attempts: studentAttempts,
        reflection: reflectionsByUser.get(student.id) ?? null,
      };
    });

    setRows(summaryRows);
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    void loadTrackingData();
  }, [loadTrackingData]);

  const filteredRows = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((r) => {
      const contact = (r.profile.email || r.profile.username || '').toLowerCase();
      return (
        r.profile.full_name.toLowerCase().includes(query) || contact.includes(query)
      );
    });
  }, [rows, searchTerm]);

  const stats = useMemo(() => {
    const totalStudents = rows.length;
    const completedAll = rows.filter((r) => r.completedCount === 4).length;
    const scoredStudents = rows.filter((r) => r.bestScore !== null);
    const avgScore =
      scoredStudents.length > 0
        ? Math.round(
            scoredStudents.reduce((acc, r) => acc + (r.bestScore ?? 0), 0) /
              scoredStudents.length
          )
        : null;
    return { totalStudents, completedAll, avgScore };
  }, [rows]);

  const toggleExpand = (userId: string) => {
    setExpandedUserId((prev) => (prev === userId ? null : userId));
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-purple-200/70 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Total estudiantes
            </p>
            <p className="text-2xl font-extrabold text-slate-900">{stats.totalStudents}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-200/70 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Completaron 4/4
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.completedAll}{' '}
              <span className="text-sm font-semibold text-slate-400">
                / {stats.totalStudents}
              </span>
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-purple-200/70 p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
              Promedio Valoración
            </p>
            <p className="text-2xl font-extrabold text-slate-900">
              {stats.avgScore !== null ? `${stats.avgScore}/100` : '--'}
            </p>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y acciones */}
      <div className="bg-white rounded-3xl border border-purple-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-purple-600 outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => void loadTrackingData()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>

            <button
              type="button"
              disabled={filteredRows.length === 0}
              onClick={() => exportStudentsCsv(filteredRows)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs sm:text-sm font-bold border-b-2 border-emerald-800 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar a CSV</span>
            </button>
          </div>
        </div>

        {/* Tabla responsiva */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
            <span className="text-sm font-semibold">Cargando progreso de estudiantes...</span>
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            <p className="font-bold text-slate-700">
              {rows.length === 0
                ? 'Todavía no hay estudiantes registrados.'
                : 'No se encontraron estudiantes con ese criterio de búsqueda.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-purple-50/70 border-b border-purple-100 text-[11px] font-extrabold uppercase tracking-wider text-purple-900/70">
                  <th className="py-3.5 px-4">Estudiante</th>
                  <th className="py-3.5 px-4">Etapas (UNIT 1)</th>
                  <th className="py-3.5 px-3 text-center">Progreso</th>
                  <th className="py-3.5 px-3 text-center">Mejor Nota</th>
                  <th className="py-3.5 px-3 text-center">Intentos</th>
                  <th className="py-3.5 px-3 text-center">Velocidad</th>
                  <th className="py-3.5 px-3 text-center">Reflexión</th>
                  <th className="py-3.5 px-4 text-right">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRows.map((row) => {
                  const isExpanded = expandedUserId === row.profile.id;
                  const displayEmail =
                    row.profile.email || row.profile.username || 'Sin correo';
                  const hasDetail = row.attempts.length > 0 || row.reflection !== null;

                  return (
                    <React.Fragment key={row.profile.id}>
                      <tr className="hover:bg-purple-50/40 transition-colors">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{row.profile.full_name}</p>
                          <p className="text-xs text-slate-500 break-all">{displayEmail}</p>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {ACTIVITY_LABELS.map((act) => {
                              const done = row.progress[act.key];
                              return (
                                <span
                                  key={act.key}
                                  title={`${act.full}: ${done ? 'Completado' : 'Pendiente'}`}
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold border ${
                                    done
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                      : 'bg-slate-50 border-slate-200 text-slate-400'
                                  }`}
                                >
                                  {done ? (
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  ) : (
                                    <CircleDashed className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                  <span>{act.short}</span>
                                </span>
                              );
                            })}
                          </div>
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-extrabold ${
                              row.completedCount === 4
                                ? 'bg-emerald-100 text-emerald-700'
                                : row.completedCount > 0
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {row.completedCount}/4
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-center font-extrabold text-slate-900">
                          {row.bestScore !== null ? (
                            <span className="text-purple-700">{row.bestScore}/100</span>
                          ) : (
                            <span className="text-slate-400 font-normal">--</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center font-bold text-slate-700">
                          {row.attemptsCount} / {MAX_QUIZ_ATTEMPTS}
                        </td>

                        <td className="py-3.5 px-3 text-center text-slate-700">
                          {row.bestAttemptSeconds !== null ? (
                            <span className="font-semibold">{row.bestAttemptSeconds}s</span>
                          ) : (
                            <span className="text-slate-400">--</span>
                          )}
                        </td>

                        <td className="py-3.5 px-3 text-center">
                          {row.reflection ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold whitespace-nowrap">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Reflexión ✓
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-bold">
                              Pendiente
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {hasDetail ? (
                            <button
                              type="button"
                              onClick={() => toggleExpand(row.profile.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <span>{isExpanded ? 'Ocultar' : 'Ver detalle'}</span>
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          ) : (
                            <span className="text-xs text-slate-400">Sin datos</span>
                          )}
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-purple-50/60">
                          <td colSpan={8} className="px-4 py-4">
                            <div className="space-y-4">
                              {/* Historial de intentos del quiz */}
                              <div className="bg-white rounded-2xl border border-purple-200 p-4">
                                <p className="text-xs font-extrabold uppercase tracking-wide text-purple-800 mb-3">
                                  Historial de intentos en Valoración — {row.profile.full_name}
                                </p>
                                {row.attempts.length === 0 ? (
                                  <p className="text-xs text-slate-500">
                                    Aún no tiene intentos registrados en el cuestionario.
                                  </p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                      <thead>
                                        <tr className="border-b border-slate-200 text-slate-500">
                                          <th className="py-1.5 pr-4">Intento</th>
                                          <th className="py-1.5 pr-4">Nota</th>
                                          <th className="py-1.5 pr-4">Aciertos</th>
                                          <th className="py-1.5 pr-4">Velocidad</th>
                                          <th className="py-1.5">Fecha y hora</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100">
                                        {row.attempts.map((attempt) => (
                                          <tr key={attempt.id}>
                                            <td className="py-2 pr-4 font-bold">
                                              Intento {attempt.attempt_number} de{' '}
                                              {MAX_QUIZ_ATTEMPTS}
                                            </td>
                                            <td className="py-2 pr-4 font-extrabold text-purple-700">
                                              {attempt.score}/100
                                            </td>
                                            <td className="py-2 pr-4">
                                              {attempt.correct_answers}/{attempt.total_questions}
                                            </td>
                                            <td className="py-2 pr-4">
                                              {attempt.duration_seconds}s
                                            </td>
                                            <td className="py-2 text-slate-500">
                                              {new Date(attempt.created_at).toLocaleString(
                                                'es-ES',
                                                {
                                                  dateStyle: 'short',
                                                  timeStyle: 'short',
                                                }
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>

                              {/* Respuestas de reflexión personal */}
                              <div className="bg-white rounded-2xl border border-purple-200 p-4 space-y-3">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <p className="text-xs font-extrabold uppercase tracking-wide text-fuchsia-700 flex items-center gap-1.5">
                                    <HeartHandshake className="w-4 h-4" />
                                    {REFLECTION_TITLE}
                                  </p>
                                  {row.reflection && (
                                    <span className="text-[11px] text-slate-400">
                                      Enviado:{' '}
                                      {new Date(row.reflection.updated_at).toLocaleString('es-ES', {
                                        dateStyle: 'short',
                                        timeStyle: 'short',
                                      })}
                                    </span>
                                  )}
                                </div>

                                {row.reflection ? (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3.5 space-y-1.5">
                                      <p className="text-xs font-bold text-slate-800">
                                        {REFLECTION_Q1}
                                      </p>
                                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {row.reflection.answer_1}
                                      </p>
                                    </div>
                                    <div className="rounded-xl bg-purple-50/60 border border-purple-100 p-3.5 space-y-1.5">
                                      <p className="text-xs font-bold text-slate-800">
                                        {REFLECTION_Q2}
                                      </p>
                                      <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                                        {row.reflection.answer_2}
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-xs text-slate-500">
                                    El estudiante aún no ha enviado sus respuestas de reflexión.
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
