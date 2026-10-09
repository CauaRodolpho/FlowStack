import type { ZodType } from "zod";
let warned = false;
export function readStored<T>(key: string, schema: ZodType<T>, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : schema.parse(JSON.parse(raw));
  } catch {
    // Preserve malformed content for recovery before the demo fallback is saved.
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) localStorage.setItem(`${key}-recovery`, raw);
    } catch {
      /* Storage may be unavailable or full. */
    }
    if (!warned) {
      warned = true;
      queueMicrotask(() =>
        window.dispatchEvent(new Event("flowtask-storage-error")),
      );
    }
    return fallback;
  }
}
export function writeStored(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    window.dispatchEvent(new Event("flowtask-storage-error"));
    return false;
  }
}
