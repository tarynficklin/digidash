import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Read .env the same way the API does, so the proxy follows SERVER_PORT.
  // A SERVER_PORT already set in the shell wins over the .env value.
  const env = loadEnv(mode, process.cwd(), '');
  const apiTarget = `http://localhost:${env.SERVER_PORT || 4040}`;
  const proxy = {
    '/api': { target: apiTarget },
    '/widget': { target: apiTarget },
  };

  return {
    plugins: [react()],
    // Keep the CRA-era REACT_APP_* names working via import.meta.env.REACT_APP_*.
    envPrefix: ['VITE_', 'REACT_APP_'],
    // Fixed per-app dev port so all the legacy apps can run side by side.
    server: { port: 3101, strictPort: true, proxy },
    preview: { port: 3101, strictPort: true, proxy },
    // The Express server serves ./build in production (`bun run start`).
    build: { outDir: 'build' },
  };
});
