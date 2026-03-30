import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useInfiniteVideos } from "../hooks/useInfiniteVideos";
import { VideoCard } from "../components/VideoCard";

export const HomePage = () => {
  const { videos, loading, hasMore, loadMore } = useInfiniteVideos();
  const { ref, inView } = useInView({ threshold: 0.1 });

  // Load next page when sentinel enters viewport (initial load handled in hook)
  useEffect(() => {
    if (inView && !loading && hasMore) loadMore();
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((v) => (
          <VideoCard key={v.videoId} video={v} />
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={ref} className="h-12 flex items-center justify-center mt-4">
        {loading && (
          <span className="text-neutral-500 dark:text-neutral-400 text-sm">
            Loading...
          </span>
        )}
        {!hasMore && !loading && videos.length > 0 && (
          <span className="text-neutral-400 dark:text-neutral-500 text-sm">
            You've reached the end
          </span>
        )}
      </div>
    </div>
  );
};
