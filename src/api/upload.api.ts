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

export const uploadToS3 = (uploadUrl: string, file: File, onProgress?: (pct: number) => void) =>
  axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
    },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

