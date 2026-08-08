import apiClient from './client';

export const getUserProfile = (id) => apiClient.get(`/users/${id}`).then(res => res.data);

export const updateUserProfile = (id, formData) =>
    apiClient.put(`/users/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);
