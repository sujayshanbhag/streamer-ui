import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const NavItem = ({
  icon,
  label,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
}) => {
  const { pathname } = useLocation();
  const active =
    pathname === to ||
    (to !== "/" && pathname.startsWith(to)) ||
    (to === "/my-videos" && pathname.startsWith("/user/"));

  return (
    <Link
      to={to}
      className={`group relative flex items-center gap-4 px-4 py-3 text-xl transition-colors ${
        active
          ? "font-extrabold text-neutral-900 dark:text-white"
          : "font-semibold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
      }`}
    >
      <span className="w-7 h-7 flex items-center justify-center shrink-0">
        {icon}
      </span>
      {/* label hidden on small screens; shown on md and up */}
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
};

export const Sidebar = () => {
  const { accessToken } = useAuthStore();

  return (
    // show a compact icon-only sidebar on small screens (w-14), full on md+
    <aside className="fixed left-0 top-14 bottom-0 z-40 flex flex-col py-4 bg-white dark:bg-neutral-950 border-r border-neutral-200 dark:border-neutral-800 w-14 md:w-60">
      <NavItem
        icon={
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        }
        label="Home"
        to="/"
      />

      {accessToken && (
        <NavItem
          icon={
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
          }
          label="My Videos"
          to="/my-videos"
        />
      )}

      <NavItem
        icon={
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-7 h-7"
          >
            <path d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h10a2 2 0 012 2v14a2 2 0 01-2 2z" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="13" y2="13" />
          </svg>
        }
        label="About"
        to="/about"
      />
    </aside>
  );
};
