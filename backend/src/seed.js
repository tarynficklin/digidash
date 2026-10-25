// Re-creates the schema and seed data from db/master_seed.sql.
// Usage: bun run db:seed   (Bun loads CONNECTION_STRING from .env)
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';
import { describeError } from './db.js';

if (!process.versions.bun) {
  try {
    process.loadEnvFile();
  } catch {
    /* no .env file; rely on the real environment */
  }
}

const sql = fs.readFileSync(path.join(import.meta.dirname, '..', 'db', 'master_seed.sql'), 'utf8');
const client = new pg.Client({ connectionString: process.env.CONNECTION_STRING });

try {
  await client.connect();
  await client.query(sql); // no parameters -> simple protocol, multiple statements allowed
  const { rows } = await client.query(
    'SELECT (SELECT count(*) FROM users)::int AS users, (SELECT count(*) FROM master)::int AS widgets',
  );
  console.log(`Seeded digidash: ${rows[0].users} user(s), ${rows[0].widgets} widget(s).`);
} catch (err) {
  console.error(`Seeding failed: ${describeError(err)}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
