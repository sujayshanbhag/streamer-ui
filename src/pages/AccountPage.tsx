import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserVideos } from "../api/videos.api";
import { useAuthStore } from "../store/authStore";
import type { VideoDto } from "../types";

const STATUS_STYLES: Record<string, { dot: string; text: string; bg: string }> =
  {
    COMPLETED: {
      dot: "bg-green-500",
      text: "text-green-700 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    READY: {
      dot: "bg-green-500",
      text: "text-green-700 dark:text-green-400",
      bg: "bg-green-50 dark:bg-green-900/20",
    },
    PROCESSING: {
      dot: "bg-yellow-400",
      text: "text-yellow-700 dark:text-yellow-400",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
    },
    QUEUED: {
      dot: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    UPLOADED: {
      dot: "bg-blue-500",
      text: "text-blue-700 dark:text-blue-400",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    FAILED: {
      dot: "bg-red-500",
      text: "text-red-700 dark:text-red-400",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    RETRY: {
      dot: "bg-orange-400",
      text: "text-orange-700 dark:text-orange-400",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  };

const STATUS_LABELS: Record<string, string> = {
  RETRY: "Pending Retry",
};

const StatusBadge = ({ status }: { status?: string }) => {
  const key = (status ?? "UPLOADED").toUpperCase();
  const style = STATUS_STYLES[key] ?? STATUS_STYLES["UPLOADED"];
  const label = STATUS_LABELS[key] ?? key;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${style.text} ${style.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {label}
    </span>
  );
};

export const AccountPage = () => {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const { user: authUser } = useAuthStore();
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const userId = paramUserId || authUser?.id;

  const cursorRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const fetchVideos = (isReload = false) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    if (isReload) {
      setReloading(true);
      cursorRef.current = undefined;
      hasMoreRef.current = true;
      setCursor(undefined);
      setHasMore(true);
    } else setLoading(true);
    getUserVideos(userId, undefined)
      .then(({ data }) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any).videos)
            ? (data as any).videos
            : [];
        const next: string | null = (data as any).nextCursor ?? null;
        setVideos(list);
        cursorRef.current = next ?? undefined;
        hasMoreRef.current = !!next;
        setCursor(next ?? undefined);
        setHasMore(!!next);
      })
      .catch(() => setVideos([]))
      .finally(() => {
        setLoading(false);
        setReloading(false);
      });
  };

  const loadMore = useCallback(() => {
    if (!userId || !hasMoreRef.current || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    getUserVideos(userId, cursorRef.current)
      .then(({ data }) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray((data as any).videos)
            ? (data as any).videos
            : [];
        const next: string | null = (data as any).nextCursor ?? null;
        setVideos((prev) => {
          const seen = new Set(prev.map((v) => v.videoId));
          return [
            ...prev,
            ...list.filter((v: VideoDto) => !seen.has(v.videoId)),
          ];
        });
        cursorRef.current = next ?? undefined;
        hasMoreRef.current = !!next;
        setCursor(next ?? undefined);
        setHasMore(!!next);
      })
      .catch(() => {
        hasMoreRef.current = false;
        setHasMore(false);
      })
      .finally(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [userId]); // stable — cursor/hasMore/loadingMore accessed via refs

  useEffect(() => {
    fetchVideos();
  }, [userId]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
            My Videos
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {!loading &&
              `${videos.length} video${videos.length !== 1 ? "s" : ""} uploaded`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchVideos(true)}
            disabled={reloading}
            title="Refresh list"
            className="w-9 h-9 flex items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 ${reloading ? "animate-spin" : ""}`}
            >
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0114.36-3.36L23 10M1 14l5.13 4.36A9 9 0 0020.49 15" />
            </svg>
          </button>
          <button
            onClick={() => navigate("/upload")}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors"
          >
            + Upload
          </button>
        </div>
      </div>

      {/* Info text */}
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-3">
        Uploaded videos may take some time to appear.
      </p>

      {/* Table card */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900">
        {/* Table header */}
        <div className="hidden sm:grid grid-cols-[2fr_3fr_1.5fr_1fr] gap-4 px-5 py-3 bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-200 dark:border-neutral-700">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Title
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Uploaded
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Status
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-5 py-4 flex gap-4 animate-pulse">
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 hidden sm:block" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-20 hidden sm:block" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-16" />
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-12 h-12 mx-auto text-neutral-300 dark:text-neutral-600 mb-4"
            >
              <path d="M15 10l4.553-2.07A1 1 0 0121 8.82v6.36a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">
              No videos uploaded yet
            </p>
            <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-1">
              Upload your first video to get started
            </p>
            <button
              onClick={() => navigate("/upload")}
              className="mt-4 px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-semibold transition-colors"
            >
              Upload a video
            </button>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {videos.map((v) => (
              <div
                key={v.videoId}
                onClick={() => navigate(`/video/${v.videoId}`)}
                className="group cursor-pointer px-5 py-4 flex flex-col sm:grid sm:grid-cols-[2fr_3fr_1.5fr_1fr] gap-2 sm:gap-4 items-start sm:items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
              >
                {/* Title */}
                <span className="font-semibold text-sm text-neutral-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors line-clamp-1">
                  {v.title}
                </span>

                {/* Date */}
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  {new Date(v.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>

                {/* Status */}
                <div>
                  <StatusBadge status={v.status} />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Infinite scroll sentinel */}
        {!loading && videos.length > 0 && (
          <div ref={sentinelRef} className="py-3 flex justify-center">
            {loadingMore && (
              <svg
                className="w-5 h-5 animate-spin text-neutral-400"
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};
