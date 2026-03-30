import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ThemeToggle } from "./ThemeToggle";

export const Navbar = () => {
  const { accessToken, user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      {/* Left: logo (padded to clear the sidebar) */}
      <div className="flex items-center pl-2">
        <Link to="/" className="flex items-center gap-1.5">
          <svg
            viewBox="0 0 24 24"
            className="w-9 h-9 text-red-500"
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
          <span className="text-xl font-bold text-neutral-900 dark:text-white leading-none">
            Tiny<span className="text-red-500">Flix</span>
          </span>
        </Link>
      </div>

      {/* Right: theme + auth */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {accessToken ? (
          <>
            <button
              onClick={() => navigate(`/user/${user?.id ?? ""}`)}
              className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              aria-label="My account"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </button>
            <button
              onClick={logout}
              className="hidden sm:block text-xs text-neutral-500 dark:text-neutral-400 hover:text-red-500 dark:hover:text-red-400 transition-colors font-medium"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
};
