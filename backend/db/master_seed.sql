-- Digidash schema + seed data. Safe to re-run: it drops and recreates both tables
-- (all existing users and widgets are wiped).
--
--   bun run db:seed                    (uses DATABASE_URL from .env)
--   psql -h localhost -U admin -d digidash -f db/master_seed.sql
--
-- Dev login (local development only, NOT secure):
--   username: demo   (or email: demo@digidash.test)
--   password: demo
-- password_hash below is scrypt('demo') in the format written by server/passwords.js
-- (scrypt$<salt hex>$<key hex>, node:crypto scrypt with default parameters, 32-byte key).

DROP TABLE IF EXISTS master;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
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
CREATE UNIQUE INDEX users_user_name_key ON users (lower(user_name));
CREATE UNIQUE INDEX users_user_email_key ON users (lower(user_email));

CREATE TABLE master (
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

CREATE INDEX master_user_id_idx ON master (user_id);

INSERT INTO users (user_name, user_email, password_hash)
VALUES ('demo', 'demo@digidash.test', 'scrypt$1aef8e193ffddb6c8615f9981e0a0f60$267781e9288f40110ebf44ae3e388b91fcff4d0742f621f227a137175049dfee');

INSERT INTO master (user_id, widget_name, x, y, w, h, o1)
SELECT user_id, widget_name, x, y, w, h, o1
FROM users,
	(VALUES
		('Search',     5,  0, 18,  4, NULL),
		('Dictionary', 10, 4,  8, 20, NULL),
		('Weather',    5, 24, 13, 26, NULL),
		('Clock',      18, 4,  5, 20, 'true'),
		('Calculator', 18, 24, 5, 26, NULL),
		('Note',       5,  4,  5, 20, NULL)
	) AS widgets (widget_name, x, y, w, h, o1)
WHERE users.user_name = 'demo';
