import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Edit3,
  ImagePlus,
  Loader2,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useUnitProgress } from '../../hooks/useUnitProgress';
import { supabase } from '../../lib/supabase';
import { compressImageFile, formatBytes } from '../../lib/imageCompression';
import { useToast } from '../../components/ui/Toast';
import { ImageLightbox } from '../../components/ui/ImageLightbox';
import { UnitActivityGuard } from '../../components/layout/UnitActivityGuard';
import type { WallPost } from '../../types/database';

const SENTENCE_STARTERS = [
  'I am wearing a...',
  'My favorite outfit is...',
  'Look at my...',
];

export const ProduccionPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { progressMap, markCompleted } = useUnitProgress('unit-1');
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [posts, setPosts] = useState<WallPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const [description, setDescription] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [lightboxPost, setLightboxPost] = useState<WallPost | null>(null);

  const isCompleted = progressMap.produccion;

  const fetchPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data, error } = await supabase
      .from('wall_posts')
      .select('*')
      .eq('unit_id', 'unit-1')
      .order('created_at', { ascending: false });

    if (error) {
      showToast('No se pudo cargar el muro de la clase.', 'error');
    } else {
      setPosts((data as WallPost[]) || []);
    }
    setLoadingPosts(false);
  }, [showToast]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const blob = await compressImageFile(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setCompressedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la imagen.';
      showToast(msg, 'error');
      setCompressedBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setCompressing(false);
    }
  };

  const clearSelectedPhoto = () => {
    setCompressedBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    if (!compressedBlob) {
      showToast('Primero selecciona o toma una foto para tu publicación.', 'warning');
      return;
    }

    const cleanDescription = description.trim();
    if (!cleanDescription) {
      showToast('Escribe una breve descripción en inglés para acompañar tu foto.', 'warning');
      return;
    }

    setPublishing(true);
    const filePath = `${user.id}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from('wall-images')
      .upload(filePath, compressedBlob, {
        contentType: 'image/jpeg',
        upsert: false,
      });

    if (uploadError) {
      setPublishing(false);
      showToast(`No se pudo subir la imagen: ${uploadError.message}`, 'error');
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('wall-images')
      .getPublicUrl(filePath);

    const { data: insertedPost, error: insertError } = await supabase
      .from('wall_posts')
      .insert({
        user_id: user.id,
        unit_id: 'unit-1',
        author_name: profile.full_name,
        description: cleanDescription,
        image_url: publicUrlData.publicUrl,
        image_path: filePath,
      })
      .select()
      .single();

    if (insertError) {
      await supabase.storage.from('wall-images').remove([filePath]);
      setPublishing(false);
      showToast('No se pudo guardar tu publicación. Inténtalo nuevamente.', 'error');
      return;
    }

    await markCompleted('produccion');
    setPosts((prev) => [insertedPost as WallPost, ...prev]);
    setDescription('');
    clearSelectedPhoto();
    setPublishing(false);
    showToast('¡Publicación subida! Ya desbloqueaste la Etapa 4: Valoración.', 'success');
  };

  const startEdit = (post: WallPost) => {
    setEditingPostId(post.id);
    setEditingText(post.description);
  };

  const handleSaveEdit = async (postId: string) => {
    const clean = editingText.trim();
    if (!clean) {
      showToast('La descripción no puede quedar vacía.', 'warning');
      return;
    }

    setSavingEdit(true);
    const { data, error } = await supabase
      .from('wall_posts')
      .update({ description: clean })
      .eq('id', postId)
      .select()
      .single();

    setSavingEdit(false);
    if (error) {
      showToast('No se pudo actualizar tu publicación.', 'error');
      return;
    }

    setPosts((prev) => prev.map((p) => (p.id === postId ? (data as WallPost) : p)));
    setEditingPostId(null);
    showToast('Publicación actualizada.', 'success');
  };

  const handleDeletePost = async (post: WallPost) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar tu publicación del muro?');
    if (!confirmed) return;

    setDeletingPostId(post.id);
    const { error: dbError } = await supabase.from('wall_posts').delete().eq('id', post.id);

    if (dbError) {
      setDeletingPostId(null);
      showToast('No se pudo eliminar la publicación.', 'error');
      return;
    }

    if (post.image_path) {
      await supabase.storage.from('wall-images').remove([post.image_path]);
    }

    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    setDeletingPostId(null);
    showToast('Publicación eliminada.', 'info');
  };

  return (
    <UnitActivityGuard activityKey="produccion">
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold">
                <CheckCircle2 className="w-4 h-4" />
                Producción completada
              </span>
              <Link
                to="/unit/1/valoracion"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 text-slate-950 text-xs font-extrabold transition-colors"
              >
                <span>Ir a Valoración (Etapa 4)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>

        {/* Cabecera */}
        <section className="bg-gradient-to-r from-fuchsia-600 via-pink-600 to-rose-500 rounded-3xl text-white p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center shrink-0">
              <ImagePlus className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-pink-100">
                UNIT 1 • Etapa 3 de 4
              </p>
              <h1 className="text-2xl sm:text-3xl font-extrabold">
                Producción • Muro Virtual de la Clase
              </h1>
            </div>
          </div>
          <p className="text-pink-50 text-sm sm:text-base mt-2">
            Sube una foto de tu outfit favorito o de una prenda de vestir y escribe una frase corta
            en inglés describiendo su color. Al subir tu primer aporte, se desbloqueará la etapa
            final: <strong>Valoración</strong>.
          </p>
        </section>

        {/* Formulario para nueva publicación */}
        <section className="quizizz-card rounded-3xl p-5 sm:p-7">
          <h2 className="text-lg font-extrabold text-white mb-4">
            Crear nueva tarjeta en el muro
          </h2>

          <form
            onSubmit={(e) => void handlePublish(e)}
            className="grid grid-cols-1 lg:grid-cols-12 gap-5"
          >
            {/* Selector de foto */}
            <div className="lg:col-span-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => void handleFileChange(e)}
                className="hidden"
                id="wall-photo-input"
              />

              {previewUrl ? (
                <div className="relative rounded-2xl border-2 border-fuchsia-400/50 overflow-hidden bg-[#120922] h-56 flex items-center justify-center">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={clearSelectedPhoto}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/75 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                    aria-label="Quitar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {compressedBlob && (
                    <span className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/75 text-emerald-300 text-[11px] font-bold">
                      Optimizada: {formatBytes(compressedBlob.size)}
                    </span>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="wall-photo-input"
                  className="h-56 rounded-2xl border-2 border-dashed border-purple-400/35 hover:border-fuchsia-400 bg-[#160C28] hover:bg-fuchsia-500/10 flex flex-col items-center justify-center gap-2.5 p-4 text-center cursor-pointer transition-colors"
                >
                  {compressing ? (
                    <>
                      <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
                      <span className="text-sm font-bold text-purple-100">
                        Optimizando foto...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-fuchsia-500/20 border border-fuchsia-400/30 text-fuchsia-300 flex items-center justify-center">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-white">
                          Subir o tomar una foto
                        </p>
                        <p className="text-xs text-purple-300/75 mt-0.5">
                          Se ajusta automáticamente a menos de 2 MB
                        </p>
                      </div>
                    </>
                  )}
                </label>
              )}
            </div>

            {/* Descripción en inglés */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-4">
              <div>
                <label
                  htmlFor="wall-description"
                  className="block text-xs font-bold uppercase tracking-wide text-purple-200 mb-1.5"
                >
                  Tu descripción en inglés
                </label>
                <textarea
                  id="wall-description"
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder='Ejemplo: "I am wearing a blue jacket and white sneakers."'
                  className="w-full p-3.5 rounded-2xl border border-purple-400/30 bg-[#160C28] focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/25 outline-none text-sm font-medium text-white placeholder:text-purple-300/40 resize-none transition-all"
                />

                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] font-bold text-purple-300/70 mr-1">
                    Ideas rápidas:
                  </span>
                  {SENTENCE_STARTERS.map((starter) => (
                    <button
                      key={starter}
                      type="button"
                      onClick={() => setDescription(starter + ' ')}
                      className="px-2.5 py-1 rounded-lg bg-[#160C28] hover:bg-fuchsia-500/20 border border-purple-400/25 text-purple-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {starter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-purple-300/70">
                  {description.length}/500 caracteres
                </span>
                <button
                  type="submit"
                  disabled={publishing || compressing}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-fuchsia-500 hover:bg-fuchsia-400 disabled:opacity-60 text-white font-extrabold text-sm sm:text-base border-b-4 border-fuchsia-800 active:border-b-0 active:translate-y-1 transition-all cursor-pointer"
                >
                  {publishing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publicando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Publicar en el muro</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Tablero estilo Mini-Padlet */}
        <section className="corkboard-dark rounded-3xl border border-purple-400/25 p-5 sm:p-7">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-extrabold text-white">
                Muro compartido ({posts.length})
              </h2>
              <p className="text-xs sm:text-sm text-purple-200/75">
                Haz clic en cualquier foto para verla en tamaño completo.
              </p>
            </div>
          </div>

          {loadingPosts ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-purple-200">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
              <span className="text-sm font-semibold">Cargando publicaciones...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="quizizz-card rounded-2xl p-8 text-center text-purple-200">
              <p className="font-bold text-white">Aún no hay publicaciones en el muro.</p>
              <p className="text-sm mt-1 text-purple-200/80">
                ¡Sé el primero en compartir tu foto y descripción!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {posts.map((post) => {
                const isOwner = post.user_id === user?.id;
                const isEditing = editingPostId === post.id;

                return (
                  <article
                    key={post.id}
                    className="quizizz-card rounded-2xl overflow-hidden flex flex-col justify-between hover:border-fuchsia-400/45 transition-colors"
                  >
                    <div>
                      <button
                        type="button"
                        onClick={() => setLightboxPost(post)}
                        className="w-full h-52 bg-[#120922] overflow-hidden block cursor-zoom-in"
                      >
                        <img
                          src={post.image_url}
                          alt={`Foto de ${post.author_name}`}
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </button>

                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs font-extrabold text-amber-300 truncate">
                            {post.author_name}
                          </span>
                          <span className="text-[11px] text-purple-300/70 shrink-0">
                            {new Date(post.created_at).toLocaleString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              rows={3}
                              maxLength={500}
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full p-2.5 rounded-xl border border-fuchsia-400/50 bg-[#160C28] text-white text-sm outline-none focus:ring-2 focus:ring-fuchsia-400/25 resize-none"
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditingPostId(null)}
                                className="px-3 py-1.5 rounded-xl bg-white/10 text-purple-200 text-xs font-bold cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="button"
                                disabled={savingEdit}
                                onClick={() => void handleSaveEdit(post.id)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-extrabold cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Guardar</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-purple-50 leading-relaxed break-words">
                            {post.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {isOwner && !isEditing && (
                      <div className="px-4 py-2.5 bg-[#160C28]/80 border-t border-purple-400/15 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-200 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar</span>
                        </button>
                        <button
                          type="button"
                          disabled={deletingPostId === post.id}
                          onClick={() => void handleDeletePost(post)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors cursor-pointer"
                        >
                          {deletingPostId === post.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Eliminar</span>
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <ImageLightbox
          imageUrl={lightboxPost?.image_url ?? null}
          author={lightboxPost?.author_name}
          caption={lightboxPost?.description}
          onClose={() => setLightboxPost(null)}
        />
      </div>
    </UnitActivityGuard>
  );
};
