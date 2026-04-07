import { useNavigate } from "react-router-dom";
import logoSvg from "../assets/logo.svg";
import type { VideoDto } from "../types";
import { config } from "../config/env";

const CDN_BASE = config.cdnUrl;

export const VideoCard = ({ video }: { video: VideoDto }) => {
  const navigate = useNavigate();
  const thumbnailSrc = video.thumbnailKey
    ? `${CDN_BASE}/${video.thumbnailKey}`
    : logoSvg;

  return (
    <div
      onClick={() => navigate(`/video/${video.videoId}`)}
      className="group cursor-pointer rounded-xl overflow-hidden bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:shadow-xl transition-all duration-200 flex flex-col"
    >
      {/* Thumbnail — full width, 16/9 */}
      <div className="aspect-video relative overflow-hidden">
        <img
          src={thumbnailSrc}
          alt={video.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = logoSvg;
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity w-12 h-12 rounded-full bg-white/25 border border-white/40 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="white"
              className="w-6 h-6 translate-x-0.5"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Details below */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 text-neutral-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">
          {video.title}
        </h3>
        <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
          {video.username && (
            <span className="font-medium text-neutral-500 dark:text-neutral-400">
              {video.username} ·{" "}
            </span>
          )}
          {new Date(video.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};
