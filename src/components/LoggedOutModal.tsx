import { useAuthStore } from "../store/authStore";

export const LoggedOutModal = () => {
  const loggedOutModalOpen = useAuthStore((s) => s.loggedOutModalOpen);
  const closeLoggedOutModal = useAuthStore((s) => s.closeLoggedOutModal);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  if (!loggedOutModalOpen) return null;

  const handleSignIn = () => {
    closeLoggedOutModal();
    openAuthModal();
  };

  return (
    <div className="fixed inset-0 z-100 backdrop-blur-md bg-black/50 flex items-center justify-center">
      <div className="w-80 bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 flex flex-col items-center gap-5 text-center">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-7 h-7 text-amber-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            You've been logged out
          </h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
            Your session has expired. Please sign in again to continue.
          </p>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <button
            onClick={handleSignIn}
            className="w-full py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors"
          >
            Sign In Again
          </button>
          <button
            onClick={closeLoggedOutModal}
            className="w-full py-2.5 rounded-lg text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm transition-colors"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
};
