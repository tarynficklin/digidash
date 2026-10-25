// Tiny replacement for massive: loads every db/<folder>/<name>.sql file and
// exposes it as db.<folder>.<name>(params) -> Promise<rows[]>, so controllers
// keep the familiar massive-style calls (db.users.find_user([login])).
//
// Each .sql file must contain a single statement (node-postgres runs
// parameterized queries as prepared statements). Files directly in db/
// (like master_seed.sql) are not loaded.
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

// Connection failures can be AggregateErrors (one per address tried) with an empty message.
export function describeError(err) {
  const inner = Array.isArray(err?.errors)
    ? err.errors.map((e) => e.message || e.code).filter(Boolean)
    : [];
  return err?.message || inner.join('; ') || err?.code || String(err);
}

export function connect(connectionString, scriptsDir) {
  const pool = new pg.Pool({ connectionString });

  // An idle client losing its connection (e.g. Postgres restarting) emits an
  // error on the pool; without a listener that would crash the process.
  pool.on('error', (err) => console.error(`Postgres pool error: ${describeError(err)}`));

  const db = {
    pool,
    query: (text, params = []) => pool.query(text, params).then((r) => r.rows),
    ping: () => pool.query('SELECT 1'),
  };

  for (const dir of fs.readdirSync(scriptsDir, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const namespace = {};
    db[dir.name] = namespace;
    for (const file of fs.readdirSync(path.join(scriptsDir, dir.name))) {
      if (!file.endsWith('.sql')) continue;
      const sql = fs.readFileSync(path.join(scriptsDir, dir.name, file), 'utf8');
      namespace[path.basename(file, '.sql')] = (params = []) =>
        pool.query(sql, Array.isArray(params) ? params : [params]).then((r) => r.rows);
    }
  }

  return db;
}
