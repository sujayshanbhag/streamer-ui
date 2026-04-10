import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect, useRef } from "react";
import SearchBar from "./SearchBar";

export const Navbar = () => {
  const { accessToken, user, logout, isGuest } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const initialQ = params.get("q") ?? "";
  const [, setSearch] = useState(initialQ);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setSearch(initialQ), [initialQ]);

  // Focus the search input when user types '/' anywhere (but not while typing in other inputs)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const active = document.activeElement as HTMLElement | null;
      if (!active) return;
      const tag = active.tagName;
      const isEditable = active.isContentEditable;
      if (tag === "INPUT" || tag === "TEXTAREA" || isEditable) return;
      e.preventDefault();
      inputRef.current?.focus();
      const el = inputRef.current as HTMLInputElement | null;
      if (el) {
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [profileOpen]);

  const appVersion =
    typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 z-50 flex items-center justify-between px-4 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800">
      {/* Left: logo (padded to clear the sidebar) */}
      <div className="flex items-center pl-0">
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
          <span className="ml-1 mt-1 hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium  text-white bg-red-500">
            v{appVersion}
          </span>
        </Link>
      </div>

      {/* Center: search */}
      <div className="flex-1 px-4">
        <div className="max-w-xl mx-auto">
          <SearchBar
            ref={inputRef}
            initialQuery={initialQ}
            placeholder="Search videos"
            onSearch={(q) => {
              setSearch(q);
              const trimmed = q.trim();
              if (trimmed) navigate(`/?q=${encodeURIComponent(trimmed)}`);
              else navigate(`/`);
            }}
          />
        </div>
      </div>

      {/* Right: theme + auth */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        {accessToken ? (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-neutral-600 dark:text-neutral-300 hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors"
              aria-label="My account"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                {!isGuest && (
                  <>
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate(`/user/${user?.id ?? ""}`);
                      }}
                      className="w-full text-left px-4 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Profile
                    </button>
                    <hr className="border-neutral-200 dark:border-neutral-700 my-1" />
                  </>
                )}
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 text-sm text-red-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
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
