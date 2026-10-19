type Store = "local" | "session";

function backend(store: Store): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return store === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStore<T>(key: string, fallback: T, store: Store = "local"): T {
  try {
    const raw = backend(store)?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStore(key: string, value: unknown, store: Store = "local"): void {
  try {
    if (value === null || value === undefined) backend(store)?.removeItem(key);
    else backend(store)?.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable (private mode / quota) */
  }
}
