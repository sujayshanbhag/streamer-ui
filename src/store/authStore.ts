import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getMe } from "../api/user.api";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  scopes: string[];
  canUpload: boolean;
  isGuest: boolean;
  // Modal state — NOT persisted
  authModalOpen: boolean;
  loggedOutModalOpen: boolean;
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openLoggedOutModal: () => void;
  closeLoggedOutModal: () => void;
}

/** Safely decode a JWT payload into a plain object (no signature verification) */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function extractScopes(payload: Record<string, unknown> | null): string[] {
  if (!payload) return [];
  const raw =
    (payload["scope"] as unknown) !== undefined
      ? payload["scope"]
      : (payload["scopes"] as unknown);

  if (Array.isArray(raw)) {
    return raw.map((v) => String(v)).filter(Boolean);
  }

  if (typeof raw === "string") {
    return raw
      .split(/[\s,]+/)
      .map((v) => v.trim())
      .filter(Boolean);
  }

  return [];
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      scopes: [],
      canUpload: false,
      isGuest: true,
      authModalOpen: false,
      loggedOutModalOpen: false,
      setTokens: (accessToken, refreshToken) => {
        const payload = decodeJwtPayload(accessToken);
        const scopes = extractScopes(payload);
        const canUpload = scopes.some((s) => s.toUpperCase() === "UPLOADER");
        const user: User | null = payload
          ? {
              id: String(payload["sub"] ?? payload["id"] ?? ""),
              name: String(payload["name"] ?? payload["email"] ?? "User"),
              email: String(payload["email"] ?? ""),
            }
          : null;
        set({
          accessToken,
          refreshToken,
          user,
          scopes,
          canUpload,
          // keep isGuest true until /auth/me provides authoritative value
          authModalOpen: false,
          loggedOutModalOpen: false,
        });

        // Fetch authoritative user info from /auth/me and update store asynchronously
        (async () => {
          try {
            const res = await getMe();
            const data: any = res.data ?? res;
            const root = data ?? {};
            const id = root.id ?? "";
            const name = root.name ?? root.email ?? "User";
            const email = root.email ?? "";
            const meScopes: string[] =
              (root.permissions as string[] | undefined) ??
              (root.scopes as string[] | undefined) ??
              [];
            const meIsGuest: boolean =
              (root.isGuest as boolean | undefined) ??
              email === "guest@guest.invalid";
            const meCanUpload = (meScopes || []).some(
              (s) => String(s).toUpperCase() === "UPLOADER",
            );
            set({
              user: id
                ? { id: String(id), name: String(name), email: String(email) }
                : user,
              scopes: meScopes,
              canUpload: meCanUpload,
              isGuest: Boolean(meIsGuest),
            });
          } catch (e) {
            // ignore — keep best-effort values derived from JWT
          }
        })();
      },
      setUser: (user) => set({ user }),
      logout: () =>
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          scopes: [],
          canUpload: false,
          isGuest: false,
        }),
      openAuthModal: () =>
        set({ authModalOpen: true, loggedOutModalOpen: false }),
      closeAuthModal: () => set({ authModalOpen: false }),
      openLoggedOutModal: () =>
        set({ loggedOutModalOpen: true, authModalOpen: false }),
      closeLoggedOutModal: () => set({ loggedOutModalOpen: false }),
    }),
    {
      name: "auth-storage",
      // Only persist auth tokens — modal state always starts as false
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        scopes: state.scopes,
        canUpload: state.canUpload,
        isGuest: state.isGuest,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && !state.user?.id) {
          const payload = decodeJwtPayload(state.accessToken);
          if (payload) {
            state.user = {
              id: String(payload["sub"] ?? payload["id"] ?? ""),
              name: String(payload["name"] ?? payload["email"] ?? "User"),
              email: String(payload["email"] ?? ""),
            };
            const scopes = extractScopes(payload);
            const canUpload = scopes.some(
              (s) => s.toUpperCase() === "UPLOADER",
            );
            state.scopes = scopes;
            state.canUpload = canUpload;
            // do not derive isGuest from JWT; authoritative value will come from /auth/me
          }
        }
        if (state?.accessToken && state.scopes?.length === 0) {
          const payload = decodeJwtPayload(state.accessToken);
          const scopes = extractScopes(payload);
          const canUpload = scopes.some((s) => s.toUpperCase() === "UPLOADER");
          state.scopes = scopes;
          state.canUpload = canUpload;
          // do not derive isGuest from JWT on rehydrate; /auth/me will correct it
        }
        // After rehydration, try to fetch authoritative user info from /auth/me
        if (state?.accessToken) {
          (async () => {
            try {
              const res = await getMe();
              const data: any = res.data ?? res;
              const root = data ?? {};
              const id = root.id ?? "";
              const name = root.name ?? root.email ?? "User";
              const email = root.email ?? "";
              const meScopes: string[] =
                (root.permissions as string[] | undefined) ??
                (root.scopes as string[] | undefined) ??
                [];
              const meIsGuest: boolean =
                (root.isGuest as boolean | undefined) ??
                email === "guest@guest.invalid";
              const meCanUpload = (meScopes || []).some(
                (s) => String(s).toUpperCase() === "UPLOADER",
              );
              const store = (useAuthStore as any).setState ?? null;
              if (store) {
                (useAuthStore as any).setState({
                  user: id
                    ? {
                        id: String(id),
                        name: String(name),
                        email: String(email),
                      }
                    : state.user,
                  scopes: meScopes,
                  canUpload: meCanUpload,
                  isGuest: Boolean(meIsGuest),
                });
              }
            } catch (e) {
              // ignore — keep JWT-derived values
            }
          })();
        }
      },
    },
  ),
);
