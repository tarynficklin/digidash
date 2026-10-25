import { describe, expect, test } from 'bun:test';
import { Hono } from 'hono';
import cors, { allowedOrigins } from './cors.js';

const app = new Hono()
  .use('*', cors(['https://site.test', 'https://admin.site.test']))
  .get('/api/thing', (c) => c.json({ ok: true }));

describe('cors', () => {
  test('reads ALLOWED_ORIGINS as a comma-separated list', () => {
    expect(allowedOrigins(' https://site.test/, https://admin.site.test ,')).toEqual([
      'https://site.test',
      'https://admin.site.test',
    ]);
    expect(allowedOrigins('')).toEqual([]);
  });

  test('lets a listed origin call the API with its cookies', async () => {
    const res = await app.request('/api/thing', { headers: { origin: 'https://admin.site.test' } });
    expect(res.headers.get('access-control-allow-origin')).toBe('https://admin.site.test');
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
    expect(res.headers.get('vary')).toContain('Origin');
  });

  test('answers the preflight for a JSON PATCH', async () => {
    const res = await app.request('/api/thing', {
      method: 'OPTIONS',
      headers: {
        origin: 'https://site.test',
        'access-control-request-method': 'PATCH',
        'access-control-request-headers': 'content-type',
      },
    });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('https://site.test');
    expect(res.headers.get('access-control-allow-methods')).toContain('PATCH');
    expect(res.headers.get('access-control-allow-headers')).toContain('content-type');
  });

  test('gives other origins no CORS headers', async () => {
    const res = await app.request('/api/thing', { headers: { origin: 'https://elsewhere.test' } });
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});
