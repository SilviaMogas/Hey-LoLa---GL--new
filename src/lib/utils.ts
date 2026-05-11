import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * URL-safe lowercase slug from arbitrary text. Strips diacritics, collapses
 * whitespace and non-alphanumeric characters into single dashes, trims
 * leading/trailing dashes. Used for /venue/:slug routes.
 */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Stable slug for a venue. Combines name + city so two cafes called "Lola"
 *  in different cities resolve to different URLs. */
export function venueSlug(name: string, city: string): string {
  return slugify(`${name}-${city}`);
}

/**
 * Resize an image data URL on the client so it fits comfortably inside the
 * 1MB Firestore document limit. Keeps aspect ratio, encodes to JPEG.
 */
export function compressDataUrl(dataUrl: string, maxSize = 512, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * ratio);
      const h = Math.round(img.height * ratio);
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2D context available'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      try {
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Could not encode image'));
      }
    };
    img.onerror = () => reject(new Error('Could not load image for compression'));
    img.src = dataUrl;
  });
}
