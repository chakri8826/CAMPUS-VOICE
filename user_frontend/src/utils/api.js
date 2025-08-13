export const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export const apiUrl = (path) => `${API_BASE}${path}`;

export const apiFetch = (path, options = {}) => fetch(apiUrl(path), options);
