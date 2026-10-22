/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL, e.g. "https://api.bvm.co.th/api" or "/api" (with the dev proxy). */
  readonly VITE_API_BASE_URL?: string;
  /** "mock" | "auto" | "live" — see src/api/config.ts. */
  readonly VITE_API_MODE?: string;
  /** Dev-server only: where Vite proxies "/api" requests to. */
  readonly VITE_API_PROXY_TARGET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
