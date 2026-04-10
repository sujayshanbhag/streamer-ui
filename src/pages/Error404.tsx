export const Error404 = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl sm:text-7xl font-extrabold text-neutral-900 dark:text-white">404</h1>
        <p className="mt-4 text-2xl font-semibold text-neutral-700 dark:text-neutral-300">Error 404</p>
        <p className="mt-2 text-neutral-500 dark:text-neutral-400">The page or resource you requested could not be found.</p>
      </div>
    </div>
  );
};

export default Error404;
