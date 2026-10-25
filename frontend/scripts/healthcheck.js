// Healthcheck probe for the Vite preview server (`bun run start:frontend`): fetches / and
// exits 0 on a 2xx response, 1 otherwise. Uses only the built-in fetch.
//   bun run health:frontend (from the repo root; it runs here so Bun loads this folder's .env)
const port = process.env.PORT ?? '3101';
const url = `http://localhost:${port}/`;

try {
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  if (!res.ok) {
    console.error(`healthcheck: ${url} returned HTTP ${res.status}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`healthcheck: request failed (${err.message})`);
  process.exit(1);
}
