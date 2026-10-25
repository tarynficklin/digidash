import { HTTPException } from 'hono/http-exception';

// Reads a JSON request body the way express.json() did for this app: non-JSON
// requests and empty bodies give {}, malformed JSON is a 400. Compressed bodies
// are refused (415); the browser never sends them.
export async function readJson(c) {
  const encoding = c.req.header('content-encoding');
  if (encoding && encoding.toLowerCase() !== 'identity') {
    throw new HTTPException(415, { message: 'Compressed request bodies are not supported.' });
  }
  if (!(c.req.header('content-type') ?? '').toLowerCase().includes('application/json')) return {};

  const text = await c.req.text();
  if (!text.trim()) return {};
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    throw new HTTPException(400, { message: 'Invalid JSON body.' });
  }
  return body !== null && typeof body === 'object' ? body : {};
}
