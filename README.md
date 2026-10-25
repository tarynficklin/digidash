# Digidash

A customizable dashboard of widgets (search, notes, clock, weather, dictionary, calculator, stocks, ...) on a draggable grid.
React 19 + Vite frontend, [Hono](https://hono.dev) API on Bun, PostgreSQL, as a Bun + Turborepo monorepo laid out like snowstack-lab:

| Workspace | Package | Path | Purpose |
| --- | --- | --- | --- |
| Frontend | `@digidash/frontend` | `frontend/` | The dashboard (React 19, Vite 8, Redux) |
| Backend | `@digidash/backend` | `backend/` | The API (Hono on Bun), with its SQL in `backend/db/` |

## Requirements

- [Bun](https://bun.sh) 1.4.4+: package manager, script runner, and the runtime for the API server (`Bun.serve`) and Vite
- Node 26.12.1 (pinned in `.node-version`; Bun does the work, Node is only for tooling that wants it)
- PostgreSQL with a `digidash` database

## Setup

```sh
bun install          # no native/compiled dependencies, no install scripts needed
bun run db:seed      # (re)creates the tables from backend/db/master_seed.sql. Wipes existing data!
```

`bunfig.toml` sets a supply-chain cooldown: `bun install`/`bun add` never pick package versions published in the last 7 days.

Configuration lives in `backend/.env`, plus an optional `frontend/.env` for the two browser keys below (Bun and Vite load them automatically; variables already set in your shell win):

| Variable | Used by |
| --- | --- |
| `CONNECTION_STRING` | API: Postgres connection URL |
| `SERVER_PORT` | API port (default 4040); the Vite proxy follows it |
| `SESSION_SECRET` | API: signs the session cookie (falls back to a fixed dev string) |
| `NODE_ENV` | `production` disables the dev back door (`bun run start:backend` sets it) |
| `UNSPLASH_KEY` | API: the background picker's Unsplash search (`GET /api/unsplash/search`), so the key stays on the server |
| `REACT_APP_ALPHAVANTAGE` | browser: Stocks widget |
| `REACT_APP_GOOGLE` | browser: Restaurants map (the Places script tag in `index.html` has its own key) |
| `REACT_APP_PLACES` | API: Restaurants widget (Google Places) |
| `DATA_PATH` | API (required): the app's data folder, e.g. `E:/Documents/Sites/legacy/digidash`. Uploaded images go to `<DATA_PATH>/uploads/backgrounds` |

`REACT_APP_*` names are kept from the Create React App days: Vite exposes them to the browser as `import.meta.env.REACT_APP_*` (`envPrefix` in `frontend/vite.config.js`).
No longer used: the Auth0 variables (`REACT_APP_DOMAIN`, `REACT_APP_CLIENT_ID`, `CLIENT_SECRET`), the Oxford Dictionaries keys
(`REACT_APP_DICTIONARY_ID`, `REACT_APP_DICTIONARY_KEY`), the Dark Sky key (`REACT_APP_WEATHERKEY`), and `REACT_APP_UNSPLASH` (now the API's `UNSPLASH_KEY`).

## Running

```sh
bun run dev             # API, then Vite once the API's /health answers (Turborepo)
bun run build           # production build into frontend/dist
bun run start:backend   # API that also serves frontend/dist, with NODE_ENV=production (no dev back door)
bun run start:frontend  # preview frontend/dist with Vite on port 3101
bun run test            # unit tests (bun:test)
bun run lint            # Biome (also the pre-commit hook)
```

In development, open http://localhost:3101 (digidash's fixed dev port, so the other legacy apps can run at the same time). Vite proxies `/api`, `/widget` and `/uploads` to the API on `SERVER_PORT`, read from `backend/.env`.
To move the API for a session, `SERVER_PORT=6104 bun run dev`; the proxy follows.

## Login

Auth0 is gone. Digidash has a simple local login: click **Login** in the header to log in or sign up with a username (or email) and password.
The session is a signed cookie (`digidash_session`, signed with `SESSION_SECRET` via `hono/cookie`) that holds the user id. Logging out deletes
the cookie, and sessions survive API restarts. Passwords are hashed with the built-in `node:crypto` scrypt.
**This is not secure and is only meant for local development.**

Seeded dev account (from `backend/db/master_seed.sql`): username `demo` (or email `demo@digidash.test`), password `demo`.

### Dev back door (no password)

While `NODE_ENV` is not `production`, **http://localhost:3101/api/dev/login** logs you in as `demo` and redirects to the dashboard.
It goes through the Vite proxy, so it works on the dev server's port. The route is not registered at all when `NODE_ENV=production`.

API: `POST /api/signup` `{ username, email?, password }`, `POST /api/login` `{ login, password }`, `GET|POST /api/logout`,
`GET /api/user-data`, and (dev only) `GET /api/dev/login`. User settings (`/api/update/:user_id`, `/api/purge/:user_id`, `/api/unsplash/:user_id`), the Unsplash search (`/api/unsplash/search?query=`) and all `/widget/*` routes
require a session and only touch the logged-in user's data.

## Database

`backend/db/master_seed.sql` is the schema plus seed data and is safe to re-run (it drops and recreates `users` and `master`).
Query files live in `backend/db/users/*.sql` and `backend/db/widgets/*.sql` and are exposed by `backend/src/db.js` (a small `pg` wrapper that replaced massive)
as `db.users.find_user([...])` and so on. One statement per file.

## Third-party APIs

The weather, dictionary and currency widgets now use free APIs that need no key. The API reshapes each response into the
format the widget was written against, so the widgets themselves are unchanged:

| Widget | Was | Now |
|---|---|---|
| Weather | Dark Sky (shut down) | [Open-Meteo](https://open-meteo.com), 7-day daily forecast in °F / mph |
| Dictionary | Oxford Dictionaries v2 (paid key) | [Free Dictionary API](https://dictionaryapi.dev) |
| Currency | `free.currencyconverterapi.com` v5 (retired) | [Frankfurter](https://frankfurter.dev) (European Central Bank rates) |

Still broken: Bitcoin (CoinDesk's `api.coindesk.com/v1/bpi` no longer resolves) and the key-based Stocks and Restaurants widgets
when their keys aren't set. The API returns `502` with a short message when an upstream call fails instead of crashing.

## Uploads (local file storage)

The S3 uploader experiment is replaced by local file storage. `POST /api/uploads` (multipart field `file`; JPEG, PNG, WebP,
GIF or AVIF up to 10 MB; requires a session) saves the image to `<DATA_PATH>/uploads/backgrounds/<user_id>/<uuid>.<ext>` and returns
`{ key, publicUrl }`; files are served at `/uploads/...`. The background picker's upload button uses it
(`frontend/src/components/common/LocalUploader.jsx`), so you can use your own image as the dashboard background.

## Tooling

- **Turborepo** runs the workspaces' `dev`, `build`, `test` and `db:seed` scripts from the root (`turbo.json`).
- **Biome** (pinned to `2.4.10`, like snowstack-lab) lints and formats everything. The config is the one shared by the legacy monorepos: snowstack-lab's, with a few old-code rules (hook dependencies, array-index keys, six accessibility rules) as warnings.
- **Husky** runs `bunx biome check .` before each commit. `.gitattributes` keeps every file LF, which Biome expects.
- `bun.lock` is committed, unlike snowstack-lab, so installs reproduce exactly and the cooldown applies to the versions it pins.
