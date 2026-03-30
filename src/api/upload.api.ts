import { api } from './axios';
import axios from 'axios';

interface UploadResponseDto {
  videoId: string;
  videoSignedUrl: string;
  thumbnailSignedUrl: string;
}

export const getPresignedUrl = (
  title: string,
  description: string,
  fileName: string,
  thumbnail?: string,
) =>
  api.post<UploadResponseDto>('/upload', {
    title,
    description,
    fileName,
    thumbnail,
  });

// Route the PUT through Vite's /s3-put middleware (dev server → S3, no CORS preflight).
// The Content-Type MUST match what the backend used to sign the presigned URL.
export const uploadToS3 = (uploadUrl: string, file: File, onProgress?: (pct: number) => void) =>
  axios.put('/s3-put', file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'X-S3-Target': encodeURIComponent(uploadUrl),
    },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

