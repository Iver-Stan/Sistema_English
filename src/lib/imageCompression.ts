const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('No se pudo leer la imagen seleccionada.'));
    };
    img.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo procesar la imagen en el navegador.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Redimensiona y comprime una imagen en el navegador a JPEG (< 2 MB)
 * antes de subirla a Supabase Storage.
 */
export async function compressImageFile(
  file: File,
  maxDimension = 1200,
  maxBytes = 2 * 1024 * 1024
): Promise<Blob> {
  if (!file.type.startsWith('image/') && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error('Por favor selecciona un archivo de imagen válido (JPG, PNG o WebP).');
  }

  const img = await loadImageElement(file);
  let { width, height } = img;

  if (width > maxDimension || height > maxDimension) {
    if (width >= height) {
      height = Math.round((height * maxDimension) / width);
      width = maxDimension;
    } else {
      width = Math.round((width * maxDimension) / height);
      height = maxDimension;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, width);
  canvas.height = Math.max(1, height);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Tu navegador no soporta compresión de imágenes.');
  }

  // Fondo blanco para PNG transparentes al convertir a JPEG
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const qualities = [0.82, 0.68, 0.54, 0.4];
  for (const quality of qualities) {
    const blob = await canvasToBlob(canvas, quality);
    if (blob.size <= maxBytes) {
      return blob;
    }
  }

  throw new Error('La imagen sigue superando los 2 MB después de comprimirla. Prueba con otra foto más ligera.');
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
}
