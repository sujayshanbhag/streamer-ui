import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { AuthModal } from "../components/AuthModal";
import { LoggedOutModal } from "../components/LoggedOutModal";
import { HomePage } from "../pages/HomePage";
import { VideoPage } from "../pages/VideoPage";
import { UserPage } from "../pages/UserPage";
import { AccountPage } from "../pages/AccountPage";
import { UploadPage } from "../pages/UploadPage";
import { GithubCallbackPage } from "../pages/GithubCallbackPage";
import { AboutPage } from "../pages/AboutPage";
import type { JSX } from "react";

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = useAuthStore((s) => s.accessToken);
  const loggedOutModalOpen = useAuthStore((s) => s.loggedOutModalOpen);
  const openAuthModal = useAuthStore((s) => s.openAuthModal);

  useEffect(() => {
    // Only open the auth modal when genuinely unauthenticated —
    // not when the loggedOut modal is already handling the session expiry.
    if (!token && !loggedOutModalOpen) {
      openAuthModal();
    }
  }, [token, loggedOutModalOpen, openAuthModal]);

  if (!token) {
    // Render a blurred skeleton grid so the backdrop-blur on the modal
    // has something to blur rather than just the app shell.
    return (
      <div className="flex-1 pointer-events-none select-none p-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 animate-pulse"
              >
                <div className="aspect-video bg-neutral-300 dark:bg-neutral-700" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-neutral-300 dark:bg-neutral-700 rounded w-3/4" />
                  <div className="h-3 bg-neutral-300 dark:bg-neutral-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return children;
};

const UploadFab = () => {
  const token = useAuthStore((s) => s.accessToken);
  if (!token) return null;
  return (
    <Link
      to="/upload"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-xl text-white transition-all hover:scale-110 active:scale-95"
      aria-label="Upload video"
      title="Upload video"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
      </svg>
    </Link>
  );
};

export const AppRouter = () => (
  <BrowserRouter>
    <Navbar />

    <div className="flex pt-14 min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {/* Sidebar is fixed + has `peer` class — main uses peer-hover:ml-56 */}
      <Sidebar />

      <main className="flex-1 ml-14 md:ml-60 min-w-0">
        <Routes>
          {/* /login redirects to home — the auth modal handles unauthenticated access */}
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/video/:id"
            element={
              <PrivateRoute>
                <VideoPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-videos"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/:userId"
            element={
              <PrivateRoute>
                <UserPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/upload"
            element={
              <PrivateRoute>
                <UploadPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/oauth/github/callback"
            element={<GithubCallbackPage />}
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>

    <UploadFab />

    {/* Global modals — rendered outside main content so they appear above everything */}
    <AuthModal />
    <LoggedOutModal />
  </BrowserRouter>
);
