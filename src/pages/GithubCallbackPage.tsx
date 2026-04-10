import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginWithGithub, registerWithGithub } from "../api/auth.api";
import { useAuthStore } from "../store/authStore";

export const GithubCallbackPage = () => {
  const navigate = useNavigate();
  const { setTokens } = useAuthStore();
  const calledRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const code = new URLSearchParams(window.location.search).get("code");
    if (!code) {
      setErrorMsg("No authorization code received from GitHub.");
      return;
    }

    const intent = sessionStorage.getItem("github-auth-intent") || "signin";
    sessionStorage.removeItem("github-auth-intent");

    const authFn = intent === "signup" ? registerWithGithub : loginWithGithub;

    // Backend handles code → access token exchange using its own client secret
    authFn(code)
      .then(({ data }) => {
        setTokens(data.accessToken, data.refreshToken);
        navigate("/", { replace: true });
      })
      .catch((err: any) => {
        const status = err?.response?.status;
        const data = err?.response?.data;
        const rawMessage =
          data?.message ??
          data?.error ??
          data?.errorMessage ??
          (typeof data === "string" ? data : "");
        const message = String(rawMessage || "").toLowerCase();
        const isAlreadyExists =
          message.includes("already exists") ||
          message.includes("already registered") ||
          (message.includes("email") && message.includes("exist"));

        if (intent === "signin" && status === 401) {
          sessionStorage.setItem(
            "auth-hint",
            "No account found. Please sign up to continue.",
          );
          sessionStorage.setItem("auth-tab", "signup");
          navigate("/", { replace: true });
        } else if (intent === "signup" && status === 401 && isAlreadyExists) {
          sessionStorage.setItem(
            "auth-hint",
            "Account already exists. Please sign in.",
          );
          sessionStorage.setItem("auth-tab", "signin");
          navigate("/", { replace: true });
        } else {
          const errMsg =
            err instanceof Error ? err.message : "GitHub sign-in failed";
          setErrorMsg(errMsg);
        }
      });
  }, []);

  if (errorMsg) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
        <div className="flex flex-col items-center gap-4 max-w-sm text-center p-6">
          <p className="text-red-500 font-semibold">GitHub sign-in failed</p>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm">
            {errorMsg}
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="mt-2 text-sm text-red-500 hover:underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <div className="flex flex-col items-center gap-4">
        <svg
          className="w-10 h-10 animate-spin text-red-500"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm font-medium">
          Signing in with GitHub...
        </p>
      </div>
    </div>
  );
};
