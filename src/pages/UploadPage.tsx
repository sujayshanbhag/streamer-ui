import { useRef, useState } from "react";
import { config } from "../config/env";
import { useNavigate } from "react-router-dom";
import { getPresignedUrl, uploadToS3 } from "../api/upload.api";

export const UploadPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(
    "idle",
  );
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (file: File | null) => {
    setThumbnail(file);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
    setThumbnailPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleUpload = async () => {
    if (!videoFile || !title) return;
    setStatus("uploading");
    setVideoProgress(0);
    setThumbProgress(0);
    try {
      const { data } = await getPresignedUrl(
        title,
        description,
        videoFile.name,
        thumbnail?.name,
      );

      const bytesToMB = (b: number) => Math.round((b / (1024 * 1024)) * 100) / 100;
      if (!videoFile || !title) return;
      setErrorMsg(null);

      const maxMB = config.maxUploadMB;
      if (videoFile.size / (1024 * 1024) > maxMB) {
        setErrorMsg(`Selected video is too large (${bytesToMB(videoFile.size)} MB). Max is ${maxMB} MB.`);
        return;
      }
      await Promise.all([
        uploadToS3(data.videoSignedUrl, videoFile, setVideoProgress),
        thumbnail && data.thumbnailSignedUrl
          ? uploadToS3(data.thumbnailSignedUrl, thumbnail, setThumbProgress)
          : Promise.resolve(),
      ]);

      setStatus("done");
      setTimeout(() => navigate("/my-videos"), 1500);
    } catch {
      setStatus("error");
    }
  };

  const uploading = status === "uploading";

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">
        Upload Video
      </h1>

      <div className="flex flex-col gap-4">
        {/* Title */}
        <input
          type="text"
          placeholder="Title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* Description */}
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={6}
          className="px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-transparent dark:text-white text-sm resize-y min-h-30 focus:outline-none focus:ring-2 focus:ring-red-500"
        />

        {/* Thumbnail picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Thumbnail{" "}
            <span className="text-neutral-400 dark:text-neutral-500 font-normal">
              (optional)
            </span>
          </label>

          {thumbnailPreview ? (
            <div className="relative rounded-lg overflow-hidden border border-neutral-300 dark:border-neutral-700 aspect-video bg-neutral-100 dark:bg-neutral-800">
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleThumbnailChange(null)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center text-xs transition-colors"
                title="Remove thumbnail"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => thumbnailInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-neutral-300 dark:border-neutral-700 py-8 text-neutral-500 dark:text-neutral-400 hover:border-red-400 hover:text-red-500 dark:hover:border-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
              <span className="text-sm">Click to add a thumbnail</span>
              <span className="text-xs text-neutral-400">JPG / JPEG only</span>
            </button>
          )}
          <input
            ref={thumbnailInputRef}
            type="file"
            accept="image/jpeg,image/jpg"
            className="hidden"
            onChange={(e) => handleThumbnailChange(e.target.files?.[0] ?? null)}
          />
        </div>

        {/* Video file picker */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Video file *
          </label>
          <input
            type="file"
            accept="video/mp4"
            onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
            className="text-sm text-neutral-700 dark:text-neutral-300 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 dark:file:bg-neutral-800 file:text-neutral-700 dark:file:text-neutral-300 hover:file:bg-neutral-200 dark:hover:file:bg-neutral-700 cursor-pointer"
          />
        </div>

        {/* Progress bars */}
        {uploading && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs w-20 text-neutral-500 dark:text-neutral-400">
                Video
              </span>
              <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                <div
                  className="bg-red-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>
              <span className="text-xs w-8 text-right text-neutral-500 dark:text-neutral-400">
                {videoProgress}%
              </span>
            </div>
            {thumbnail && (
              <div className="flex items-center gap-2">
                <span className="text-xs w-20 text-neutral-500 dark:text-neutral-400">
                  Thumbnail
                </span>
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-1.5">
                  <div
                    className="bg-red-500 h-1.5 rounded-full transition-all"
                    style={{ width: `${thumbProgress}%` }}
                  />
                </div>
                <span className="text-xs w-8 text-right text-neutral-500 dark:text-neutral-400">
                  {thumbProgress}%
                </span>
              </div>
            )}
          </div>
        )}

        {status === "done" && (
          <p className="text-green-500 text-sm">
            ✅ Upload complete! Redirecting...
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500 text-sm">
            ❌ Upload failed. Please try again.
          </p>
        )}
        {errorMsg && (
          <p className="text-red-500 text-sm">{errorMsg}</p>
        )}

        <button
          onClick={handleUpload}
          disabled={!videoFile || !title || uploading}
          className="py-2.5 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
};
