import { useState, useCallback, useRef, useEffect } from 'react';
import { getLiveVideos } from '../api/videos.api';
import type { VideoDto } from '../types';

// keyset pagination hook with optional keyword search.
// When `keyword` changes the list resets and a fresh load is performed.
export const useInfiniteVideos = (keyword?: string) => {
  const [videos, setVideos] = useState<VideoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const cursorRef = useRef<string | null>(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    try {
      const { data } = await getLiveVideos(keyword ?? undefined, cursorRef.current ?? undefined);

      const incoming = data.videos ?? [];

      setVideos((prev) => {
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
  }, [keyword]);

  // Reset + initial load when keyword changes
  useEffect(() => {
    cursorRef.current = null;
    hasMoreRef.current = true;
    setHasMore(true);
    setVideos([]);
    // kick off a fresh load
    loadMore();
  }, [keyword, loadMore]);

  return { videos, loading, hasMore, loadMore };
};
