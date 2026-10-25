// CORS for frontends on other origins. Deployed, each frontend calls the API directly at
// https://api.<domain> from https://<domain>, so the API has to allow those origins.
// ALLOWED_ORIGINS lists them, comma-separated, e.g.
//   ALLOWED_ORIGINS=https://moonlitmansion.com,https://admin.moonlitmansion.com
// Credentials are allowed, so the session cookie goes along. Any other origin gets no CORS
// headers, and same-origin requests (through the Vite dev server's proxy, or the backend
// serving frontend/dist itself) don't need them.
import { cors } from 'hono/cors';

export const allowedOrigins = (value = process.env.ALLOWED_ORIGINS) =>
  (value ?? '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

export default (origins = allowedOrigins()) =>
  cors({
    origin: (origin) => (origins.includes(origin) ? origin : null),
    credentials: true,
    maxAge: 600,
  });
