import apiClient from './client';

export const fetchCurrentUser = () => apiClient.get('/auth/me').then(res => res.data.user);

export const login = (username, password) =>
    apiClient.post('/auth/login', { username, password }).then(res => res.data);

export const register = (username, email, phone, password, confirmPassword) =>
    apiClient.post('/auth/register', { username, email, phone, password, confirmPassword }).then(res => res.data);

export const logout = () => apiClient.post('/auth/logout').then(res => res.data);
