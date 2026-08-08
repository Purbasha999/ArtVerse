import apiClient from './client';

export const listArtworks = () => apiClient.get('/artworks').then(res => res.data.artworks);

export const getArtwork = (id) => apiClient.get(`/artworks/${id}`).then(res => res.data.artwork);

export const createArtwork = (formData) =>
    apiClient.post('/artworks', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

export const updateArtwork = (id, formData) =>
    apiClient.put(`/artworks/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

export const deleteArtwork = (id) => apiClient.delete(`/artworks/${id}`).then(res => res.data);

export const createReview = (artworkId, body, rating) =>
    apiClient.post(`/artworks/${artworkId}/reviews`, { body, rating }).then(res => res.data);

export const deleteReview = (artworkId, reviewId) =>
    apiClient.delete(`/artworks/${artworkId}/reviews/${reviewId}`).then(res => res.data);
