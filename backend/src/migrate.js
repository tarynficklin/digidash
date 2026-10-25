// Creates the tables that are missing (db/schema.sql), without dropping or adding any data: what
// a deploy runs before each start. `bun run db:seed` is the one that re-creates everything with
// the demo user. Usage: bun run db:migrate   (Bun loads DATABASE_URL from .env)
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { describeError } from './db.js';

const sql = fs.readFileSync(path.join(import.meta.dirname, '..', 'db', 'schema.sql'), 'utf8');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  await client.query(sql); // no parameters -> simple protocol, multiple statements allowed
  const { rows } = await client.query(
    'SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM master)::int AS widgets',
  );
  console.log(
    `digidash schema is up to date: ${rows[0].users} user(s), ${rows[0].widgets} widget(s).`,
  );
} catch (err) {
  console.error(`db:migrate failed: ${describeError(err)}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
