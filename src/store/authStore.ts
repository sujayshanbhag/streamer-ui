import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
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
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      authModalOpen: false,
      loggedOutModalOpen: false,
      setTokens: (accessToken, refreshToken) => {
        const payload = decodeJwtPayload(accessToken);
        const user: User | null = payload
          ? {
              id: String(payload['sub'] ?? payload['id'] ?? ''),
              name: String(payload['name'] ?? payload['email'] ?? 'User'),
              email: String(payload['email'] ?? ''),
            }
          : null;
        set({ accessToken, refreshToken, user, authModalOpen: false, loggedOutModalOpen: false });
      },
      setUser: (user) => set({ user }),
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
      openAuthModal: () => set({ authModalOpen: true, loggedOutModalOpen: false }),
      closeAuthModal: () => set({ authModalOpen: false }),
      openLoggedOutModal: () => set({ loggedOutModalOpen: true, authModalOpen: false }),
      closeLoggedOutModal: () => set({ loggedOutModalOpen: false }),
    }),
    {
      name: 'auth-storage',
      // Only persist auth tokens — modal state always starts as false
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && !state.user?.id) {
          const payload = decodeJwtPayload(state.accessToken);
          if (payload) {
            state.user = {
              id: String(payload['sub'] ?? payload['id'] ?? ''),
              name: String(payload['name'] ?? payload['email'] ?? 'User'),
              email: String(payload['email'] ?? ''),
            };
          }
        }
      },
    }
  )
);
