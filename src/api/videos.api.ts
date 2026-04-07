import { api } from './axios';
import type { CursorPage, VideoDto, StreamResponse, UserPageDto, AccountPageDto } from '../types';

// keyword: optional search term (server supports it as first param)
export const getLiveVideos = (keyword?: string, cursor?: string, size = 10) =>
  api.get<CursorPage<VideoDto>>('/videos', {
    params: { keyword, cursor, size },
  });

export const getUserVideos = (keyword: string | undefined, userId: string | number, cursor?: string, size = 10) =>
  api.get<AccountPageDto>(`/videos/user/${userId}`, {
    params: { keyword, cursor, size },
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
