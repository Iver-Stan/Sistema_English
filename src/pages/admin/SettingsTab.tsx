import React, { useEffect, useState } from 'react';
import {
  ExternalLink,
  FileText,
  Gamepad2,
  Loader2,
  Plus,
  Save,
  Sparkles,
  Trash2,
  Youtube,
} from 'lucide-react';
import { useUnitSettings } from '../../hooks/useUnitSettings';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';
import type { YoutubeLink } from '../../types/database';

export const SettingsTab: React.FC = () => {
  const { settings, loading, refresh } = useUnitSettings('unit-1');
  const { showToast } = useToast();

  const [practiceWordwallUrl, setPracticeWordwallUrl] = useState('');
  const [practiceUrl, setPracticeUrl] = useState('');
  const [theoryPdfUrl, setTheoryPdfUrl] = useState('');
  const [youtubeLinks, setYoutubeLinks] = useState<YoutubeLink[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPracticeWordwallUrl(settings.practice_wordwall_url);
    setPracticeUrl(settings.practice_url);
    setTheoryPdfUrl(settings.theory_pdf_url || '');
    setYoutubeLinks(settings.youtube_links);
  }, [settings]);

  const handleYoutubeChange = (index: number, field: keyof YoutubeLink, value: string) => {
    setYoutubeLinks((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const handleAddYoutube = () => {
    setYoutubeLinks((prev) => [
      ...prev,
      { title: '', description: '', url: 'https://www.youtube.com/' },
    ]);
  };

  const handleRemoveYoutube = (index: number) => {
    setYoutubeLinks((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanWordwallUrl = practiceWordwallUrl.trim();
    const cleanPracticeUrl = practiceUrl.trim();

    if (!cleanWordwallUrl || !cleanPracticeUrl) {
      showToast('Los dos enlaces de juegos de Práctica son obligatorios.', 'warning');
      return;
    }

    const cleanPdfUrl = theoryPdfUrl.trim() || null;
    const cleanedLinks = youtubeLinks
      .map((l) => ({
        title: l.title.trim(),
        description: l.description.trim(),
        url: l.url.trim(),
      }))
      .filter((l) => l.title && l.url);

    setSaving(true);
    const { error } = await supabase.from('unit_settings').upsert(
      {
        unit_id: 'unit-1',
        practice_wordwall_url: cleanWordwallUrl,
        practice_url: cleanPracticeUrl,
        theory_pdf_url: cleanPdfUrl,
        youtube_links: cleanedLinks,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'unit_id' }
    );

    setSaving(false);
    if (error) {
      showToast(`Error al guardar configuración: ${error.message}`, 'error');
      return;
    }

    await refresh();
    showToast('¡Configuración guardada! Los estudiantes ya ven los enlaces actualizados.', 'success');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl border border-purple-200/80 p-12 flex flex-col items-center justify-center gap-2 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
        <span className="text-sm font-semibold">Cargando enlaces de UNIT 1...</span>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSave(e)} className="space-y-6">
      {/* Juegos de Práctica (Actividad 1 Wordwall + Actividad 2) */}
      <section className="bg-white rounded-3xl border border-purple-200/80 p-5 sm:p-7 shadow-xs space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              Enlaces de juegos en Práctica (UNIT 1)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Edita en cualquier momento los dos botones de juego que ven los estudiantes en la
              etapa de Práctica.
            </p>
          </div>
        </div>

        {/* Actividad 1: Wordwall */}
        <div className="space-y-1.5">
          <label
            htmlFor="wordwall-url"
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-amber-700"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Actividad 1: Empecemos a jugar (Wordwall)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="wordwall-url"
              type="url"
              value={practiceWordwallUrl}
              onChange={(e) => setPracticeWordwallUrl(e.target.value)}
              placeholder="https://wordwall.net/play/..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-purple-600 outline-none text-sm"
              required
            />
            {practiceWordwallUrl && (
              <a
                href={practiceWordwallUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-sm font-bold shrink-0"
              >
                <span>Probar enlace</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Actividad 2: Segundo juego */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label
            htmlFor="practice-url-2"
            className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-sky-700"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Actividad 2: Más práctica de vocabulario</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              id="practice-url-2"
              type="url"
              value={practiceUrl}
              onChange={(e) => setPracticeUrl(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-purple-600 outline-none text-sm"
              required
            />
            {practiceUrl && (
              <a
                href={practiceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-sm font-bold shrink-0"
              >
                <span>Probar enlace</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </section>

      {/* PDF de Teoría */}
      <section className="bg-white rounded-3xl border border-purple-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              PDF oficial de Teoría (Opcional)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Pega un enlace público (por ejemplo de Google Drive o Dropbox) o déjalo vacío si aún
              no quieres mostrar un PDF descargable.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="url"
            value={theoryPdfUrl}
            onChange={(e) => setTheoryPdfUrl(e.target.value)}
            placeholder="https://drive.google.com/... (opcional)"
            className="flex-1 px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-purple-600 outline-none text-sm"
          />
          {theoryPdfUrl && (
            <a
              href={theoryPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-sm font-bold shrink-0"
            >
              <span>Probar PDF</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </section>

      {/* Videos de YouTube */}
      <section className="bg-white rounded-3xl border border-purple-200/80 p-5 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">
                Botones de YouTube en Teoría
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Configura los títulos y enlaces externos a YouTube que aparecen al final de Teoría.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddYoutube}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs sm:text-sm font-bold cursor-pointer self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>Agregar video</span>
          </button>
        </div>

        <div className="space-y-4">
          {youtubeLinks.length === 0 ? (
            <p className="text-sm text-slate-500 bg-slate-50 rounded-2xl p-4 border border-slate-200">
              No hay enlaces de YouTube configurados. Usa &quot;Agregar video&quot; para añadir uno.
            </p>
          ) : (
            youtubeLinks.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-purple-200/70 bg-purple-50/30 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wide text-purple-800/70">
                    Enlace #{idx + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveYoutube(idx)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      Título del botón
                    </label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleYoutubeChange(idx, 'title', e.target.value)}
                      placeholder="Ej. Clothes Vocabulary in English"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-purple-600 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">
                      URL de YouTube
                    </label>
                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => handleYoutubeChange(idx, 'url', e.target.value)}
                      placeholder="https://www.youtube.com/..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-purple-600 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Descripción corta
                  </label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleYoutubeChange(idx, 'description', e.target.value)}
                    placeholder="Breve explicación para el estudiante..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:border-purple-600 outline-none text-sm"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-purple-700 hover:bg-purple-600 disabled:opacity-60 text-white font-bold text-sm sm:text-base border-b-4 border-purple-900 active:border-b-0 active:translate-y-1 transition-all cursor-pointer shadow-sm"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Guardando cambios...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              <span>Guardar configuración</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
