import { useState, useEffect } from "react";
import { loginWithGoogle, registerWithGoogle } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export const AuthModal = () => {
  const authModalOpen = useAuthStore((s) => s.authModalOpen);
  const setTokens = useAuthStore((s) => s.setTokens);
  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [hint, setHint] = useState("");

  useEffect(() => {
    if (!authModalOpen) return;
    const storedHint = sessionStorage.getItem("auth-hint");
    const storedTab = sessionStorage.getItem("auth-tab") as
      | "signin"
      | "signup"
      | null;
    if (storedHint) {
      setHint(storedHint);
      sessionStorage.removeItem("auth-hint");
    }
    if (storedTab) {
      setTab(storedTab);
      sessionStorage.removeItem("auth-tab");
    }
  }, [authModalOpen]);

  if (!authModalOpen) return null;

  const isSignUp = tab === "signup";

  const handleGoogleSuccess = async (credential: string) => {
    try {
      const { data } = isSignUp
        ? await registerWithGoogle(credential)
        : await loginWithGoogle(credential);
      setTokens(data.accessToken, data.refreshToken);
    } catch (err: any) {
      if (!isSignUp && err?.response?.status === 401) {
        setTab("signup");
        setHint("No account found. Please sign up to continue.");
      } else {
        alert("Authentication failed. Please try again.");
      }
    }
  };

  const handleGoogleClick = () => {
    const g = (window as any).google;
    if (!g?.accounts?.id) return;
    g.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: ({ credential }: { credential: string }) => {
        handleGoogleSuccess(credential);
      },
      cancel_on_tap_outside: false,
    });
    g.accounts.id.prompt();
  };

  const handleGithub = () => {
    sessionStorage.setItem("github-auth-intent", tab);
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/oauth/github/callback`,
    );
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user:email`;
  };

  return (
    <div className="fixed inset-0 z-100 backdrop-blur-md bg-black/50 flex items-center justify-center">
      <div className="w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 pt-6 pb-2">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-red-500"
            fill="currentColor"
          >
            <rect x="2" y="6" width="20" height="14" rx="2" opacity="0.15" />
            <rect
              x="2"
              y="6"
              width="20"
              height="14"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <rect x="2" y="4" width="3" height="4" rx="0.5" />
            <rect x="7" y="4" width="3" height="4" rx="0.5" />
            <rect x="12" y="4" width="3" height="4" rx="0.5" />
            <rect x="17" y="4" width="3" height="4" rx="0.5" />
            <path d="M10 10l5 3-5 3V10z" />
          </svg>
          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
            Tiny<span className="text-red-500">Flix</span>
          </span>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 mt-2">
          <button
            onClick={() => {
              setTab("signin");
              setHint("");
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              !isSignUp
                ? "text-red-500 border-b-2 border-red-500 bg-red-50 dark:bg-red-950/30"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab("signup");
              setHint("");
            }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              isSignUp
                ? "text-red-500 border-b-2 border-red-500 bg-red-50 dark:bg-red-950/30"
                : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            }`}
          >
            Sign Up
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="text-center">
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              {isSignUp
                ? "Join TinyFlix using your Google or GitHub account"
                : "Sign in to continue watching"}
            </p>
            {hint && (
              <p className="text-xs text-amber-500 dark:text-amber-400 mt-2">
                {hint}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleGoogleClick}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4">
                <path
                  fill="#4285f4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34a853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#fbbc05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#ea4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {isSignUp ? "Sign up with Google" : "Sign in with Google"}
            </button>

            <button
              onClick={handleGithub}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 text-sm font-medium transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              {isSignUp ? "Sign up with GitHub" : "Sign in with GitHub"}
            </button>
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => setTab(isSignUp ? "signin" : "signup")}
              className="text-red-500 hover:underline font-medium"
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
