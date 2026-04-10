import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HLSPlayer } from "../components/HLSPlayer";
import { getStreamUrls, getVideoById } from "../api/videos.api";
import Error404 from "./Error404";
import type { StreamResponse, VideoDto } from "../types";

type QualityKey = "url1080p" | "url720p" | "url360p";

export const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoDto | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [stream, setStream] = useState<StreamResponse | null>(null);
  const [quality, setQuality] = useState<QualityKey>("url1080p");
  const [streamError, setStreamError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setStream(null);
    setStreamError("");
    setVideoLoading(true);
    getVideoById(id)
      .then(({ data }) => {
        setVideo(data);
        const status = (data?.status ?? "").toUpperCase();
        if (status === "UPLOADED" || status === "PROCESSING") return;
        getStreamUrls(id)
          .then(({ data: streamData }) => setStream(streamData))
          .catch(() => setStreamError("Failed to load video."));
      })
      .catch((err: any) => {
        const st = err?.response?.status;
        if (st === 404) {
          console.log("video not found");
          setNotFound(true);
        } else {
          // for other errors, attempt to load stream as a fallback
          getStreamUrls(id)
            .then(({ data }) => setStream(data))
            .catch(() => setStreamError("Failed to load video."));
        }
      })
      .finally(() => setVideoLoading(false));
  }, [id]);

  const rawUrl = stream ? stream[quality] : "";
  const status = (video?.status ?? "").toUpperCase();
  const isProcessingVideo = status === "UPLOADED" || status === "PROCESSING";

  const qualityOptions = [
    { label: "1080p", value: "url1080p" as const },
    { label: "720p", value: "url720p" as const },
    { label: "360p", value: "url360p" as const },
  ];

  if (notFound) return <Error404 />;

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {isProcessingVideo && !videoLoading ? (
        <>
          <div className="aspect-video rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center px-6 text-center">
            <p className="text-sm sm:text-base text-neutral-600 dark:text-neutral-300">
              This video is still processing, please check back in some time.
            </p>
          </div>
          <div className="mt-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3 leading-tight">
              {video?.title ?? "Untitled"}
            </h1>
            <div
              className="flex items-center gap-3 mb-4 cursor-pointer group w-fit"
              onClick={() => video && navigate(`/user/${video.userId}`)}
            >
              <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center group-hover:ring-2 ring-red-500 transition-all shrink-0">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-neutral-500 dark:text-neutral-300"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-neutral-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                  {video?.username ?? "Unknown"}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {video?.createdAt
                    ? new Date(video.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : ""}
                </p>
              </div>
            </div>
            {video?.description && (
              <div className="w-full rounded-xl bg-neutral-100 dark:bg-neutral-800/60 px-4 py-3">
                <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </p>
              </div>
            )}
          </div>
        </>
      ) : streamError ? (
        <HLSPlayer
          src=""
          error={streamError}
          currentQualityLabel="1080p"
          onQualityChange={() => {}}
          availableQualities={[]}
        />
      ) : stream ? (
        <>
          <HLSPlayer
            key={rawUrl}
            src={rawUrl}
            error={streamError || undefined}
            currentQualityLabel={quality.replace("url", "")}
            onQualityChange={(label) => setQuality(`url${label}` as QualityKey)}
            availableQualities={qualityOptions.map((opt) => opt.label)}
          />
          <div className="mt-6">
            {videoLoading ? (
              <div className="space-y-3 animate-pulse">
                <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-2/3" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800" />
                  <div className="space-y-1.5">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-32" />
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-24" />
                  </div>
                </div>
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-full max-w-2xl" />
                <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-5/6 max-w-2xl" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-white mb-3 leading-tight">
                  {video?.title ?? "Untitled"}
                </h1>
                <div
                  className="flex items-center gap-3 mb-4 cursor-pointer group w-fit"
                  onClick={() => video && navigate(`/user/${video.userId}`)}
                >
                  <div className="w-10 h-10 bg-neutral-200 dark:bg-neutral-700 rounded-full flex items-center justify-center group-hover:ring-2 ring-red-500 transition-all shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 text-neutral-500 dark:text-neutral-300"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
                      {video?.username ?? "Unknown"}
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {video?.createdAt
                        ? new Date(video.createdAt).toLocaleDateString(
                            undefined,
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : ""}
                    </p>
                  </div>
                </div>
                {video?.description && (
                  <div className="w-full rounded-xl bg-neutral-100 dark:bg-neutral-800/60 px-4 py-3">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
                      {video.description}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : (
        <div className="animate-pulse aspect-video bg-neutral-800 rounded-xl" />
      )}
    </div>
  );
};
