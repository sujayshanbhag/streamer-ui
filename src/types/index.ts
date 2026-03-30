export interface VideoDto {
  videoId: string;
  title: string;
  description: string;
  userId: number;
  username: string;
  createdAt: string;
  status?: string;
  thumbnailKey?: string;
}

export interface CursorPage<T> {
  videos: T[];
  nextCursor: string | null;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
}

export interface UserPageDto {
  user: UserDto;
  videos: CursorPage<VideoDto>;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface StreamResponse {
  url360p: string;
  url720p: string;
  url1080p: string;
}
