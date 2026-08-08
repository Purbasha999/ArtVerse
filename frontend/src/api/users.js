import apiClient from './client';

export const getUserProfile = (id) => apiClient.get(`/users/${id}`).then(res => res.data);

export const updateUserProfile = (id, formData) =>
    apiClient.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

export const followUser = (id) => apiClient.post(`/users/${id}/follow`).then(res => res.data);

export const unfollowUser = (id) => apiClient.delete(`/users/${id}/follow`).then(res => res.data);

export const getFollowers = (id) => apiClient.get(`/users/${id}/followers`).then(res => res.data.users);

export const getFollowing = (id) => apiClient.get(`/users/${id}/following`).then(res => res.data.users);
