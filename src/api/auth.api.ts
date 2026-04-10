import type { AuthResponse } from '../types';
import { api } from './axios';

export const loginWithGoogle = (token: string) =>
  api.post<AuthResponse>('/auth/login', { type: 'GOOGLE', token });

export const loginWithGoogleCode = (code: string, redirectUri: string) =>
  api.post<AuthResponse>('/auth/login', { type: 'GOOGLE', code, redirectUri });

export const loginWithGithub = (authorizationCode: string) =>
  api.post<AuthResponse>('/auth/login', { type: 'GITHUB', authorizationCode });

export const registerWithGoogle = (token: string) =>
  api.post<AuthResponse>('/auth/register', { type: 'GOOGLE', token });

export const registerWithGoogleCode = (code: string, redirectUri: string) =>
  api.post<AuthResponse>('/auth/register', { type: 'GOOGLE', code, redirectUri });

export const registerWithGithub = (authorizationCode: string) =>
  api.post<AuthResponse>('/auth/register', { type: 'GITHUB', authorizationCode });
