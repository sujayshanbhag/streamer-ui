import { useState, useCallback, useRef, useEffect } from 'react';
import { getLiveVideos } from '../api/videos.api';
import type { VideoDto } from '../types';

export const useInfiniteVideos = () => {
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Use refs so loadMore never needs to be recreated (stable reference)
  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const initialisedRef = useRef(false);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const { data } = await getLiveVideos(cursorRef.current ?? undefined);

      const incoming = data.videos ?? [];

      setVideos((prev) => {
        // Deduplicate in case of concurrent calls
        const seen = new Set(prev.map((v) => v.videoId));
        const fresh = (incoming as VideoDto[]).filter((v) => !seen.has(v.videoId));
        return [...prev, ...fresh];
      });

      cursorRef.current = data.nextCursor ?? null;
      if (!data.nextCursor) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []); // stable — no deps needed; all state accessed via refs

  // Initial load — guarded by ref so React StrictMode double-invoke is safe
  useEffect(() => {
    if (initialisedRef.current) return;
    initialisedRef.current = true;
    loadMore();
  }, [loadMore]);

  return { videos, loading, hasMore, loadMore };
};
