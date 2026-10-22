import type { AuthUser } from '../types/api';

interface StoredSession {
  token: string | null;
  user: AuthUser;
}

const KEY = 'bvm.session';

// "Remember me" keeps the session in localStorage (survives closing the browser);
// otherwise sessionStorage (cleared with the tab). Every access is wrapped — storage
// can throw in private mode or when site data is blocked.
function stores(): Storage[] {
  try {
    return [window.localStorage, window.sessionStorage];
  } catch {
    return [];
  }
}

export function loadSession(): StoredSession | null {
  for (const store of stores()) {
    try {
      const raw = store.getItem(KEY);
      if (raw) return JSON.parse(raw) as StoredSession;
    } catch {
      // Corrupt or inaccessible — treat as logged out.
    }
  }
  return null;
}

export function saveSession(session: StoredSession, remember: boolean): void {
  clearSession();
  try {
    (remember ? window.localStorage : window.sessionStorage).setItem(KEY, JSON.stringify(session));
  } catch {
    // Session just won't survive a reload.
  }
}

export function clearSession(): void {
  for (const store of stores()) {
    try {
      store.removeItem(KEY);
    } catch {
      // Nothing to clear.
    }
  }
}

export function getStoredToken(): string | null {
  return loadSession()?.token ?? null;
}
