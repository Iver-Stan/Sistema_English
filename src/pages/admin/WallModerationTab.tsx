import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, Trash2, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useToast } from '../../components/ui/Toast';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import type { Profile, WallPost } from '../../types/database';

export const WallModerationTab: React.FC = () => {
  const { showToast } = useToast();
  const [posts, setPosts] = useState<WallPost[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [lightboxPost, setLightboxPost] = useState<WallPost | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [postsRes, studentsRes] = await Promise.all([
      supabase
        .from('wall_posts')
        .select('*')
        .eq('unit_id', 'unit-1')
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name', { ascending: true }),
    ]);

    if (postsRes.error || studentsRes.error) {
      showToast('Error al cargar el muro de moderación.', 'error');
    } else {
      setPosts((postsRes.data as WallPost[]) || []);
      setStudents((studentsRes.data as Profile[]) || []);
    }
    setLoading(false);
  }, [showToast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const participation = useMemo(() => {
    const publishedUserIds = new Set(posts.map((p) => p.user_id));
    const publishedStudents = students.filter((s) => publishedUserIds.has(s.id));
    const pendingStudents = students.filter((s) => !publishedUserIds.has(s.id));
    return { publishedStudents, pendingStudents };
  }, [posts, students]);

  const handleModerateDelete = async (post: WallPost) => {
    const confirmed = window.confirm(
      `¿Eliminar la publicación de ${post.author_name}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setDeletingId(post.id);
    const { error } = await supabase.from('wall_posts').delete().eq('id', post.id);
    if (error) {
      setDeletingId(null);
      showToast('No se pudo eliminar la publicación.', 'error');
      return;
    }

    if (post.image_path) {
      await supabase.storage.from('wall-images').remove([post.image_path]);
    }

    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setDeletingId(null);
    showToast('Publicación eliminada por moderación.', 'info');
  };

  return (
    <div className="space-y-6">
      {/* Resumen de participación en el muro */}
      <div className="bg-white rounded-3xl border border-purple-200/80 p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-700" />
            <h2 className="text-lg font-extrabold text-slate-900">
              Participación en el Muro Virtual
            </h2>
          </div>
          <p className="text-sm text-slate-600">
            <strong>{participation.publishedStudents.length}</strong> de{' '}
            <strong>{students.length}</strong> estudiantes ya publicaron en el muro ({posts.length}{' '}
            tarjetas en total).
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-sm font-bold transition-colors cursor-pointer self-start lg:self-center"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar muro</span>
        </button>
      </div>

      {/* Lista rápida de quién publicó y quién falta */}
      {students.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-emerald-200 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-emerald-700 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              Ya publicaron ({participation.publishedStudents.length})
            </p>
            {participation.publishedStudents.length === 0 ? (
              <p className="text-xs text-slate-400">Ningún estudiante ha publicado aún.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {participation.publishedStudents.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold"
                  >
                    {s.full_name}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-purple-200/80 p-4">
            <p className="text-xs font-extrabold uppercase tracking-wide text-slate-500 mb-2">
              Faltan por publicar ({participation.pendingStudents.length})
            </p>
            {participation.pendingStudents.length === 0 ? (
              <p className="text-xs text-emerald-600 font-semibold">
                ¡Todos los estudiantes ya participaron!
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {participation.pendingStudents.map((s) => (
                  <span
                    key={s.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-semibold"
                  >
                    {s.full_name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Grilla de tarjetas para moderar */}
      <div className="bg-purple-100/50 rounded-3xl border border-purple-200/80 p-5 sm:p-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
            <span className="text-sm font-semibold">Cargando publicaciones...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500">
            No hay publicaciones en el muro virtual todavía.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-purple-200/70 shadow-sm overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => setLightboxPost(post)}
                    className="w-full h-52 bg-slate-100 overflow-hidden block cursor-zoom-in"
                  >
                    <img
                      src={post.image_url}
                      alt={`Aporte de ${post.author_name}`}
                      loading="lazy"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </button>

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-extrabold text-purple-700 truncate">
                        {post.author_name}
                      </span>
                      <span className="text-[11px] text-slate-400 shrink-0">
                        {new Date(post.created_at).toLocaleString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-800 leading-relaxed break-words">
                      {post.description}
                    </p>
                  </div>
                </div>

                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    disabled={deletingId === post.id}
                    onClick={() => void handleModerateDelete(post)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {deletingId === post.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    <span>Eliminar publicación</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <ImageLightbox
        imageUrl={lightboxPost?.image_url ?? null}
        author={lightboxPost?.author_name}
        caption={lightboxPost?.description}
        onClose={() => setLightboxPost(null)}
      />
    </div>
  );
};
