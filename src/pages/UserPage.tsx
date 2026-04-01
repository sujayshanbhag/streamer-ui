import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useInView } from "react-intersection-observer";
import { VideoCard } from "../components/VideoCard";
import { getUserPage } from "../api/videos.api";
import type { UserDto, VideoDto } from "../types";

export const UserPage = () => {
  const { userId } = useParams<{ userId: string }>();

  const [user, setUser] = useState<UserDto | null>(null);
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | undefined>(undefined);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const initialisedRef = useRef(false);

  const { ref: sentinelRef, inView } = useInView({ threshold: 0 });

  const loadMore = useCallback(async () => {
    if (!userId || loadingRef.current || !hasMoreRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getUserPage(userId, cursorRef.current);
      // Populate user info from the first page only
      if (!cursorRef.current && data.user) setUser(data.user);

      const incoming = data.videos?.videos ?? [];
      const next = data.videos?.nextCursor ?? undefined;
      cursorRef.current = next;
      hasMoreRef.current = !!next;
      setHasMore(!!next);
      setVideos((prev) => {
        const existingIds = new Set(prev.map((v) => v.videoId));
        return [
          ...prev,
          ...incoming.filter((v) => !existingIds.has(v.videoId)),
        ];
      });
    } catch {
      setError("Failed to load videos. Please try again.");
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [userId]); // stable — hasMore accessed via ref

  // Initial load
  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    loadMore();
  }, [loadMore]);

  // Sentinel-driven pagination
  useEffect(() => {
    if (inView && !loading && hasMore) loadMore();
  }, [inView, loading, hasMore, loadMore]);

  const displayName = user?.name ?? (userId ? `User ${userId}` : "Channel");

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Channel header */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center shrink-0">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 sm:w-10 sm:h-10 text-neutral-500 dark:text-neutral-300"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div>
          {loading && !user ? (
            <>
              <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse mb-2" />
              <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </>
          ) : (
            <>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {displayName}
              </h1>
              {user?.email && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {user.email}
                </p>
              )}
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
                {videos.length} video{videos.length !== 1 ? "s" : ""}
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Video grid */}
      {!loading && !error && videos.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-neutral-500 dark:text-neutral-400 font-medium">
            No public videos yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.videoId} video={v} />
          ))}

          {/* Skeleton cards while loading next page */}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={`sk-${i}`}
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
      )}

      {/* Infinite scroll sentinel */}
      {hasMore && <div ref={sentinelRef} className="h-4" />}
    </div>
  );
};
