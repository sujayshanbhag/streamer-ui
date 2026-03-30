import type { AuthResponse } from '../types';
import { api } from './axios';

export const loginWithGoogle = (token: string) =>
  api.post<AuthResponse>('/auth/login', { type: 'GOOGLE', token });

export const loginWithGithub = (authorizationCode: string) =>
  api.post<AuthResponse>('/auth/login', { type: 'GITHUB', authorizationCode });
