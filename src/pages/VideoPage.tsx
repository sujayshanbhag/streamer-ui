import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HLSPlayer } from "../components/HLSPlayer";
import { getStreamUrls, getVideoById } from "../api/videos.api";
import Error404 from "./Error404";
import type { StreamResponse, VideoDto } from "../types";

type QualityKey = "url1080p" | "url720p" | "url360p";

const ShareModal = ({ url, onClose }: { url: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-2xl border border-neutral-200 dark:border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5 text-black dark:text-white"
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
              Share Video
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-3 py-2.5">
          <input
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="flex-1 min-w-0 text-sm text-neutral-600 dark:text-neutral-300 bg-transparent outline-none truncate select-all"
          />
          <button
            onClick={handleCopy}
            className="shrink-0 flex items-center gap-1.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-medium px-3 py-1.5 transition-colors"
          >
            {copied ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-3.5 h-3.5"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const VideoPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<VideoDto | null>(null);
  const [videoLoading, setVideoLoading] = useState(true);
  const [stream, setStream] = useState<StreamResponse | null>(null);
  const [quality, setQuality] = useState<QualityKey>("url1080p");
  const [streamError, setStreamError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

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

  const ShareButton = () => (
    <button
      onClick={() => setShareOpen(true)}
      className="ml-auto inline-flex items-center justify-center rounded-full p-2.5 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-red-500 dark:hover:text-red-400 transition-colors border border-neutral-700 dark:border-neutral-200"
      aria-label="Share video"
    >
      <svg viewBox="0 0 24 24" className="w-6 h-6 text-black dark:text-white">
        <g stroke="none" fill="none" fillRule="evenodd">
          <g fill="currentColor" fillRule="nonzero">
            <path d="M6.746704,4 L10.2109085,4 C10.625122,4 10.9609085,4.33578644 10.9609085,4.75 C10.9609085,5.12969577 10.6787546,5.44349096 10.312679,5.49315338 L10.2109085,5.5 L6.746704,5.5 C5.55584001,5.5 4.58105908,6.42516159 4.50189481,7.59595119 L4.496704,7.75 L4.496704,17.25 C4.496704,18.440864 5.42186559,19.4156449 6.59265519,19.4948092 L6.746704,19.5 L16.247437,19.5 C17.438301,19.5 18.4130819,18.5748384 18.4922462,17.4040488 L18.497437,17.25 L18.497437,16.752219 C18.497437,16.3380054 18.8332234,16.002219 19.247437,16.002219 C19.6271328,16.002219 19.940928,16.2843728 19.9905904,16.6504484 L19.997437,16.752219 L19.997437,17.25 C19.997437,19.2542592 18.4250759,20.8912737 16.4465956,20.994802 L16.247437,21 L6.746704,21 C4.74244483,21 3.10543026,19.4276389 3.00190201,17.4491586 L2.996704,17.25 L2.996704,7.75 C2.996704,5.74574083 4.56906505,4.10872626 6.54754543,4.00519801 L6.746704,4 L10.2109085,4 L6.746704,4 Z M14.5006976,6.51985416 L14.5006976,3.75 C14.5006976,3.12602964 15.20748,2.7899466 15.6876724,3.13980165 L15.7698701,3.20874226 L21.7644714,8.95874226 C22.0442311,9.22708681 22.0696965,9.65811353 21.8408438,9.95607385 L21.7645584,10.0411742 L15.7699571,15.7930263 C15.3196822,16.2250675 14.5877784,15.9476738 14.5078455,15.3589039 L14.5006976,15.2518521 L14.5006976,12.5265324 L14.1572053,12.5566444 C11.7575155,12.8069657 9.45747516,13.8878535 7.24265269,15.8173548 C6.72354372,16.2695904 5.9204142,15.8420034 6.00578894,15.1588473 C6.67057872,9.83929778 9.45245108,6.90729635 14.2013326,6.53950096 L14.5006976,6.51985416 L14.5006976,3.75 L14.5006976,6.51985416 Z M16.0006976,5.50864341 L16.0006976,7.25 C16.0006976,7.66421356 15.6649111,8 15.2506976,8 C11.3772927,8 8.97667396,9.67612932 7.93942891,13.1571821 L7.86037164,13.4357543 L8.21256044,13.1989337 C10.4490427,11.7371925 12.7984587,11 15.2506976,11 C15.6303934,11 15.9441885,11.2821539 15.993851,11.6482294 L16.0006976,11.75 L16.0006976,13.4928166 L20.1619348,9.50008715 L16.0006976,5.50864341 Z" />
          </g>
        </g>
      </svg>
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
      {shareOpen && (
        <ShareModal url={shareUrl} onClose={() => setShareOpen(false)} />
      )}
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
            <div className="flex items-center mb-4">
              <div
                className="flex items-center gap-3 cursor-pointer group w-fit"
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
              <ShareButton />
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
                <div className="flex items-center mb-4">
                  <div
                    className="flex items-center gap-3 cursor-pointer group w-fit"
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
                  <ShareButton />
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
