import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { apiTarget } from './scripts/api-target.js';

export default defineConfig(({ mode }) => {
  // The proxy follows the backend's SERVER_PORT (default 4040), read from backend/.env or the
  // shell (see scripts/api-target.js).
  const target = apiTarget(mode);
  const proxy = {
    '/api': { target },
    '/widget': { target },
    '/uploads': { target },
  };

  return {
    plugins: [react()],
    // Keep the CRA-era REACT_APP_* names working via import.meta.env.REACT_APP_*.
    envPrefix: ['VITE_', 'REACT_APP_'],
    // Fixed per-app dev port so all the legacy apps can run side by side.
    server: { port: 3101, strictPort: true, proxy },
    preview: { port: 3101, strictPort: true, proxy },
    // The backend serves frontend/dist in production (`bun run start:backend`).
  };
});
