export const AboutPage = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Hero */}
      <div className="rounded-2xl bg-neutral-900 dark:bg-black px-8 py-10 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-4 mb-3">
          <svg
            viewBox="0 0 24 24"
            className="w-12 h-12 text-red-500 shrink-0"
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
          <h1 className="text-5xl font-black text-white tracking-tight">
            Tiny<span className="text-red-500">Flix</span>
          </h1>
        </div>
        <p className="relative text-sm text-neutral-400 font-medium tracking-wide uppercase">
          A video streaming platform
        </p>
      </div>

      {/* About the app */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">
          About TinyFlix
        </h2>
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <p>
            I built TinyFlix as a personal project to demonstrate my full-stack
            engineering skills through something real — not a todo app, but a{" "}
            <strong className="font-medium text-neutral-900 dark:text-white">
              production-grade video streaming platform
            </strong>
            .
          </p>
          <p>
            TinyFlix is designed for{" "}
            <strong className="font-medium text-red-500">
              short films and music videos
            </strong>{" "}
            — a focused space for creators who want to share meaningful,
            short-form work without the noise of mainstream platforms.
          </p>
          <p>
            When a video is uploaded, it is encoded into multiple resolutions —{" "}
            <strong className="font-medium text-neutral-900 dark:text-white">
              360p, 720p, and 1080p
            </strong>{" "}
            — and the resulting HLS streams are stored back in S3 and served
            through a{" "}
            <strong className="font-medium text-red-500">CloudFront CDN</strong>{" "}
            for low-latency global playback.
          </p>
          <p>
            This project covers a lot of ground — cloud infrastructure, async
            processing, multithreading, secure file handling, and more. It was a
            deliberate attempt to build something closer to the{" "}
            <strong className="font-medium text-neutral-900 dark:text-white">
              real world
            </strong>
            .
          </p>
        </div>

        {/* Coming Soon */}
        <div className="mt-8">
          <h3 className="text-xs font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            Coming Soon
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            Upcoming releases will include{" "}
            <strong className="font-semibold text-red-500">
              AI-generated captions
            </strong>{" "}
            — automatically transcribed and synced to video — making content
            accessible without any effort from creators.
          </p>
        </div>
      </section>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800 mb-10" />

      {/* About me */}
      <section className="mb-10">
        <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">
          About Me
        </h2>
        <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-3">
          <p>
            Hi, I'm{" "}
            <strong className="font-medium text-neutral-900 dark:text-white text-base">
              Sujay Shanbhag
            </strong>
            , a software engineer with 2 years of experience and a keen interest
            in full-stack development and{" "}
            <strong className="font-medium text-red-500">DevOps</strong>. I
            enjoy building real products over CRUD apps — things that involve
            actual infrastructure, concurrency, and system design decisions
            rather than just wiring a form to a database.
          </p>
          <p>
            TinyFlix is one of those projects — built entirely on my own, from
            system design to deployment, as a way to push beyond day-to-day work
            and explore what it takes to ship something production-grade end to
            end.
          </p>
        </div>
      </section>

      <div className="h-px bg-neutral-200 dark:bg-neutral-800 mb-10" />

      {/* Contact */}
      <section>
        <h2 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4">
          Contact
        </h2>
        <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-5 h-5 text-red-500"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">
                Portfolio
              </p>
              <a
                href="https://shanbhag.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-neutral-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                shanbhag.dev
              </a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="w-5 h-5 text-red-500"
              >
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">
                Email
              </p>
              <a
                href="mailto:sujayshanbhag7@gmail.com"
                className="text-sm font-medium text-neutral-900 dark:text-white hover:text-red-500 dark:hover:text-red-400 transition-colors"
              >
                sujay.shanbhag30@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
