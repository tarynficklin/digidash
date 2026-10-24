// Local username/email + password login (replaces the old Auth0 flow).
// For local development only: no rate limiting, no CSRF protection, and the
// session is a signed cookie holding the user id (see ../session.js).
import { hashPassword, verifyPassword } from '../passwords.js';
import { endSession, getSessionUserId, startSession } from '../session.js';
import { readJson } from '../http.js';

// The account seeded by db/master_seed.sql; used by the dev-only back door.
export const DEV_USER = 'demo';

// Never send password_hash to the browser.
const publicUser = ({ password_hash, ...user }) => user;

const text = (value) => (typeof value === 'string' ? value.trim() : '');

// Route guard: requires a logged-in session and, for routes with a :user_id
// param, that the param is the logged-in user's id. Sets c.get('userId').
export async function requireUser(c, next) {
  const userId = await getSessionUserId(c);
  if (!userId) return c.json({ error: 'Not logged in.' }, 401);
  const paramId = c.req.param('user_id');
  if (paramId !== undefined && paramId !== String(userId)) {
    return c.json({ error: 'You can only access your own account.' }, 403);
  }
  c.set('userId', userId);
  await next();
}

export default {
  signup: async (c) => {
    const db = c.get('db');
    const body = await readJson(c);
    const username = text(body.username);
    const email = text(body.email) || null;
    const password = typeof body.password === 'string' ? body.password : '';

    if (!username || !password) return c.json({ error: 'Username and password are required.' }, 400);
    if (username.includes('@')) return c.json({ error: 'Usernames cannot contain "@".' }, 400);

    let user;
    try {
      [user] = await db.users.create_user([username, email, await hashPassword(password)]);
    } catch (err) {
      if (err.code === '23505') return c.json({ error: 'That username or email is already taken.' }, 409);
      throw err;
    }

    await startSession(c, user.user_id);
    return c.json(user, 201);
  },

  login: async (c) => {
    const db = c.get('db');
    const body = await readJson(c);
    const login = text(body.login ?? body.username ?? body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!login || !password) return c.json({ error: 'Enter your username (or email) and password.' }, 400);

    const [row] = await db.users.find_user([login]);
    if (!row || !(await verifyPassword(password, row.password_hash))) {
      return c.json({ error: 'Wrong username/email or password.' }, 401);
    }

    await startSession(c, row.user_id);
    return c.json(publicUser(row));
  },

  // DEV-ONLY back door (registered only when NODE_ENV !== 'production'):
  // logs in as the seeded dev user without a password and redirects to the app.
  devLogin: async (c) => {
    const db = c.get('db');
    const [row] = await db.users.find_user([DEV_USER]);
    if (!row) return c.json({ error: `Dev user "${DEV_USER}" not found. Run \`bun run db:seed\`.` }, 404);
    await startSession(c, row.user_id);
    return c.redirect('/', 302);
  },

  user: async (c) => {
    const db = c.get('db');
    const userId = await getSessionUserId(c);
    if (!userId) return c.json({ error: 'Not logged in.' }, 401);

    const [user] = await db.users.get_user([userId]);
    if (!user) {
      // The account no longer exists (deleted, or the DB was re-seeded).
      endSession(c);
      return c.json({ error: 'Not logged in.' }, 401);
    }
    return c.json(user);
  },

  logout: (c) => {
    endSession(c);
    return c.json({ loggedOut: true });
  },

  purge: async (c) => {
    const db = c.get('db');
    const deleted = await db.users.purge_user([c.get('userId')]);
    endSession(c);
    return c.json(deleted);
  },

  update: async (c) => {
    const db = c.get('db');
    const { user_bg, color, theme, flavor, compact, collision } = await readJson(c);
    const [user] = await db.users.update_user([user_bg, color, theme, flavor, compact, collision, c.get('userId')]);
    return c.json(user);
  },
};
