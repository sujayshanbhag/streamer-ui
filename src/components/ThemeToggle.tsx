import { useEffect, useState } from 'react';

export const ThemeToggle = () => {
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <button
      onClick={() => setDark((d) => !d)}
      className="text-lg"
      title="Toggle theme"
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
};
