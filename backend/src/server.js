// Digidash API: Hono on Bun. Run with `bun run dev` at the repo root (Turborepo starts this
// and the frontend), or `bun run start` in backend/. Bun loads backend/.env; variables already
// set in the environment win over the file.
import path from 'node:path';
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { serveStatic } from 'hono/bun';
import { HTTPException } from 'hono/http-exception';
import apiController from './controllers/apiController.js';
//CONTROLLERS
import authController, { requireUser } from './controllers/authController.js';
import uploadController, { MAX_UPLOAD_BYTES, uploadDir } from './controllers/uploadController.js';
import widgetController from './controllers/widgetController.js';
import { connect, describeError } from './db.js';

//SERVER SETUP
const { SERVER_PORT, CONNECTION_STRING, NODE_ENV } = process.env;
const port = Number(SERVER_PORT) || 4040;
const isProduction = NODE_ENV === 'production';
const root = path.join(import.meta.dirname, '..');

const db = connect(CONNECTION_STRING, path.join(root, 'db'));
const uploadsDir = uploadDir();
const uploads = uploadController(uploadsDir);
const app = new Hono();

//MIDDLEWARE
app.use('*', async (c, next) => {
  c.set('db', db);
  await next();
});
const tooLarge = (c) => c.json({ error: 'Request body too large.' }, 413);
const limit = bodyLimit({ maxSize: 1024 * 1024, onError: tooLarge });
// Uploads get a bigger allowance (plus multipart overhead); everything else stays at 1 MB.
const uploadLimit = bodyLimit({ maxSize: MAX_UPLOAD_BYTES + 64 * 1024, onError: tooLarge });
app.use('/api/*', (c, next) =>
  c.req.path === '/api/uploads' ? uploadLimit(c, next) : limit(c, next),
);
app.use('/widget/*', limit);

//AUTH ENDPOINTS (local login; Auth0 is gone)
app.post('/api/signup', authController.signup);
app.post('/api/login', authController.login);
app.get('/api/logout', authController.logout);
app.post('/api/logout', authController.logout);
app.get('/api/user-data', authController.user);
app.put('/api/update/:user_id', requireUser, authController.update);
app.delete('/api/purge/:user_id', requireUser, authController.purge);

// DEV-ONLY BACK DOOR: GET /api/dev/login logs in as the seeded "demo" user with
// no password and redirects to /. Never registered when NODE_ENV=production.
if (!isProduction) {
  app.get('/api/dev/login', authController.devLogin);
}

//WIDGET ENDPOINTS (scoped to the logged-in user)
app.get('/widget/:user_id', requireUser, widgetController.read);
app.post('/widget/:user_id', requireUser, widgetController.create);
app.put('/widget/position/:master_id', requireUser, widgetController.position);
app.put('/widget/settings/:master_id', requireUser, widgetController.settings);
app.delete('/widget/:master_id', requireUser, widgetController.delete);

//API ENDPOINTS
app.post('/api/dictionary', apiController.dictionary);
app.post('/api/weather', apiController.weather);
// (/api/vibrant is gone: background palettes are computed in the browser, see src/lib/palette.js)
app.get('/api/unsplash/search', requireUser, apiController.unsplashSearch);
app.put('/api/unsplash/:user_id', requireUser, apiController.unsplash);
app.post('/api/getcurency', apiController.getcurency);
app.post('/api/getplaces', apiController.getplaces);

//UPLOADS (local file storage, see controllers/uploadController.js)
app.post('/api/uploads', requireUser, uploads.create);
app.use(
  '/uploads/*',
  serveStatic({ root: uploadsDir, rewriteRequestPath: (p) => p.replace(/^\/uploads/, '') }),
);

// for the healthcheck scripts and the frontend's `bun run dev`
app.get('/health', (c) => c.json({ status: 'ok' }));

app.all('/api/*', (c) => c.json({ error: 'Not found.' }, 404));

//PRODUCTION BUILD (frontend/dist, like the old express.static(build))
app.use('*', serveStatic({ root: path.join(root, '..', 'frontend', 'dist') }));

app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ error: err.message }, err.status);
  console.error(
    `${c.req.method} ${c.req.path} failed: ${err.code ? `[${err.code}] ` : ''}${describeError(err)}`,
  );
  return c.json({ error: 'Server error.' }, 500);
});

//RUN THE SERVER
const server = Bun.serve({ port, fetch: app.fetch, idleTimeout: 60 });
console.log(`server started on port ${server.port}`);
if (!isProduction)
  console.log(
    'dev back door enabled: GET /api/dev/login logs in as "demo" (NODE_ENV is not production)',
  );
db.ping()
  .then(() => console.log('connected to Postgres'))
  .catch((err) =>
    console.error(
      `could not connect to Postgres yet (requests will retry; check CONNECTION_STRING): ${describeError(err)}`,
    ),
  );
