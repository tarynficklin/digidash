import axios from 'axios';

// Where the API is. A build calls it directly at VITE_API_URL (the API's own address when
// deployed, so the API has to list this site in its ALLOWED_ORIGINS). Under the Vite dev
// server it stays '' and Vite proxies /api, /widget and /uploads to the backend.
export const apiBase = import.meta.env.DEV
  ? ''
  : (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

// The app writes its API requests as paths (/api/..., /widget/...): those go to apiBase, with
// the session cookie. Full URLs (the widgets' other services) are left alone, without cookies.
axios.interceptors.request.use((config) => {
  if (config.url?.startsWith('/')) {
    config.baseURL = apiBase;
    config.withCredentials = true;
  }
  return config;
});

// Uploaded backgrounds are stored as /uploads/... paths and served by the API. fileUrl gives
// the URL the browser loads; filePath turns it back into the path, for saving.
const UPLOADS = '/uploads/';
export const fileUrl = (value) =>
  typeof value === 'string' && value.startsWith(UPLOADS) ? `${apiBase}${value}` : value;
export const filePath = (value) =>
  apiBase && typeof value === 'string' && value.startsWith(`${apiBase}${UPLOADS}`)
    ? value.slice(apiBase.length)
    : value;
