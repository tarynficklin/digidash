import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { loadEnv } from 'vite';

// Where the dev server (and preview) sends /api and the other proxied paths: VITE_API_URL from
// this frontend's .env (or the shell), else http://localhost:<PORT from backend/.env>, else the
// backend's default port, 4040. backend/.env is parsed here instead of with loadEnv because Bun
// has already put this frontend's own PORT into process.env, and loadEnv would prefer it.
const frontendDir = fileURLToPath(new URL('..', import.meta.url));
const backendEnv = fileURLToPath(new URL('../../backend/.env', import.meta.url));

const backendPort = () => {
  try {
    return readFileSync(backendEnv, 'utf8').match(/^\s*PORT\s*=\s*['"]?(\d+)/m)?.[1];
  } catch {
    return undefined; // no backend/.env
  }
};

export const apiTarget = (mode = 'development') => {
  const { VITE_API_URL } = loadEnv(mode, frontendDir, 'VITE_');
  return (VITE_API_URL || `http://localhost:${backendPort() || 4040}`).replace(/\/+$/, '');
};
