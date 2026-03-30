import { api } from './axios';
import type { CursorPage, VideoDto, StreamResponse, UserPageDto } from '../types';

export const getLiveVideos = (cursor?: string, size = 10) =>
  api.get<CursorPage<VideoDto>>('/videos', {
    params: { cursor, size },
  });

export const getUserVideos = (userId: string | number, cursor?: string, size = 10) =>
  api.get<CursorPage<VideoDto>>(`/videos/user/${userId}`, {
    params: { cursor, size },
  });

export const getUserPage = (userId: string, cursor?: string, size = 10) =>
  api.get<UserPageDto>(`/user/${userId}/videos`, {
    params: { cursor, size },
  });

// This call sets CloudFront cookies on the response automatically
// withCredentials: true on the axios instance handles this
export const getStreamUrls = (id: string) =>
  api.get<StreamResponse>(`/videos/stream/${id}`);

export const getVideoById = (id: string) =>
  api.get<VideoDto>(`/videos/${id}/details`);
