// Used by `bun run dev`: waits until the backend answers /health before Vite starts, so an
// open browser tab doesn't hit the proxy (and log "http proxy error") while the API boots.
// Turborepo starts both workspaces at once, so this is what orders them.
import { apiTarget } from './api-target.js';

const url = `${apiTarget()}/health`;
const deadline = Date.now() + 30_000;

while (true) {
  try {
    await fetch(url); // any HTTP response means it's up
    break;
  } catch {
    // not listening yet
  }
  if (Date.now() > deadline) {
    console.error(`backend isn't answering at ${url} after 30s; starting Vite anyway`);
    break;
  }
  await Bun.sleep(200);
}
