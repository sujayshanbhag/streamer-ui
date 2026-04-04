import { useEffect, useState } from "react";

export const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light") return false;
    if (stored === "dark") return true;
    // default to dark if no stored preference
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="text-lg"
      title="Toggle theme"
    >
      {dark ? "☀️" : "🌙"}
    </button>
  );
};
