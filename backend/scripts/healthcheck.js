// Healthcheck probe: hits the backend's /health and exits 0 when it reports ok, 1 otherwise.
// Uses only the built-in fetch.
//   bun backend/scripts/healthcheck.js
const port = process.env.SERVER_PORT ?? '4040';
const url = `http://localhost:${port}/health`;

try {
  const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
  const body = res.ok ? await res.json() : null;
  if (body?.status !== 'ok') {
    console.error(`healthcheck: ${url} returned HTTP ${res.status} ${JSON.stringify(body)}`);
    process.exit(1);
  }
} catch (err) {
  console.error(`healthcheck: request failed (${err.message})`);
  process.exit(1);
}
