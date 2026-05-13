/** Build a fully qualified URL for a rescue passport. */
export function passportUrl(slug: string, origin?: string): string {
  const base = origin
    ?? (typeof window !== 'undefined' ? window.location.origin : 'https://heylola.co');
  return `${base}/foundation/dogs/${slug}`;
}

/** Free, no-signup QR code generator. Returns an <img>-ready URL. */
export function qrCodeUrl(target: string, size = 400): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(target)}`;
}

export function shareText(name: string, url: string): string {
  return `Meet ${name}, a rescue dog looking for a home through Hey Lola Foundation and Animal Haven: ${url}`;
}

export function whatsappShareUrl(name: string, url: string): string {
  return `https://wa.me/?text=${encodeURIComponent(shareText(name, url))}`;
}

export function emailShareUrl(name: string, url: string): string {
  const subject = `Meet ${name} — a rescue dog on Hey Lola`;
  const body = shareText(name, url);
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/** Best-effort native share; resolves to true if the share was sent. */
export async function tryNativeShare(name: string, url: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) return false;
  try {
    await navigator.share({
      title: `Meet ${name} — Hey Lola Foundation`,
      text: shareText(name, url),
      url,
    });
    return true;
  } catch {
    return false;
  }
}
