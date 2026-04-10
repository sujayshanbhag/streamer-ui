import { api } from './axios';

// Fetch current authenticated user details (id, email, scopes, isGuest)
export const getMe = () => api.get('/user/me');

export default { getMe };

// Fetch user page (videos + user summary)
export const getUserPage = (userId: string, cursor?: string, size = 10) =>
	api.get(`/user/${userId}/videos`, { params: { cursor, size } });

export const userApi = { getMe, getUserPage };
