declare global {
  interface Window {
    __env__?: Record<string, string>;
  }
}

const get = (key: string): string =>
  // runtime-injected window.__env__ takes precedence, fall back to build-time import.meta.env
  (typeof window !== 'undefined' && window.__env__?.[key]) || (import.meta.env as any)[key] || "";

export const config = {
  apiUrl: get("VITE_API_BASE_URL"),
  cdnUrl: get("VITE_CDN_BASE_URL"),
  githubClientId: get("VITE_GITHUB_CLIENT_ID"),
  googleClientId: get("VITE_GOOGLE_CLIENT_ID"),
};

export {};
