import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ImageLightboxProps {
  imageUrl: string | null;
  caption?: string;
  author?: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  imageUrl,
  caption,
  author,
  onClose,
}) => {
  useEffect(() => {
    if (!imageUrl) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [imageUrl, onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0D061A]/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada de imagen"
    >
      <div
        className="relative max-w-3xl w-full bg-[#24143D] border border-purple-400/30 rounded-3xl overflow-hidden shadow-2xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-black/70 hover:bg-rose-600 text-white p-2 rounded-full transition-colors cursor-pointer"
          aria-label="Cerrar imagen"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-[#120922] flex items-center justify-center max-h-[75vh]">
          <img
            src={imageUrl}
            alt={caption || 'Publicación del muro'}
            className="max-h-[75vh] w-auto object-contain"
          />
        </div>

        {(author || caption) && (
          <div className="p-4 sm:p-5 bg-[#24143D] border-t border-purple-400/20">
            {author ? (
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-300 mb-1">
                {author}
              </p>
            ) : null}
            {caption ? <p className="text-purple-50 text-sm sm:text-base">{caption}</p> : null}
          </div>
        )}
      </div>
    </div>
  );
};
