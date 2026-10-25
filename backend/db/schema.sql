-- The tables and indexes of master_seed.sql, created only when they're missing: nothing is dropped and
-- no rows are added. `bun run db:migrate` runs this before each deployed start; master_seed.sql is
-- the one that re-creates everything with the dev account. Keep the two in step.

CREATE TABLE IF NOT EXISTS users (
	user_id       SERIAL PRIMARY KEY,
	user_name     VARCHAR(100) NOT NULL,
	user_email    VARCHAR(100),
	password_hash TEXT NOT NULL,
	user_bg       TEXT DEFAULT 'https://images.unsplash.com/photo-1536130371825-ac75012d9b24?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=c1c97eb0f52f1174d7a8281dd8348828&auto=format&fit=crop&w=1050&q=80',
	color         TEXT DEFAULT '115, 164, 191',
	theme         TEXT DEFAULT 'dark',
	flavor        TEXT DEFAULT 'modern',
	compact       BOOLEAN DEFAULT true,
	collision     BOOLEAN DEFAULT false
);

-- Usernames and emails are unique, case-insensitively (login accepts either).
CREATE UNIQUE INDEX IF NOT EXISTS users_user_name_key ON users (lower(user_name));

CREATE UNIQUE INDEX IF NOT EXISTS users_user_email_key ON users (lower(user_email));

CREATE TABLE IF NOT EXISTS master (
	master_id   SERIAL PRIMARY KEY,
	user_id     INTEGER NOT NULL REFERENCES users (user_id) ON DELETE CASCADE,
	widget_name VARCHAR(100),
	x           INTEGER,
	y           INTEGER,
	w           INTEGER,
	h           INTEGER,
	o1          TEXT DEFAULT NULL,
	o2          TEXT DEFAULT NULL,
	o3          TEXT DEFAULT NULL,
	o4          TEXT DEFAULT NULL,
	o5          TEXT DEFAULT NULL,
	o6          TEXT DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS master_user_id_idx ON master (user_id);
