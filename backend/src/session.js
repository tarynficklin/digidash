// Sessions are a signed cookie (hono/cookie, HMAC-SHA256) that holds the user id.
// Stateless and deliberately simple: logging out deletes the cookie, but a copied
// cookie stays valid until it expires. Fine for local development, not for production.
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';

const COOKIE = 'digidash_session';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days
// The fixed fallback is for local development only: production needs SESSION_SECRET.
const secret = () => {
  const value = process.env.SESSION_SECRET;
  if (!value && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be set in production');
  }
  return value || 'digidash-dev-secret';
};

export async function getSessionUserId(c) {
  const value = await getSignedCookie(c, secret(), COOKIE);
  return typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : null;
}

export function startSession(c, userId) {
  return setSignedCookie(c, COOKIE, String(userId), secret(), {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: MAX_AGE,
  });
}

export function endSession(c) {
  deleteCookie(c, COOKIE, { path: '/' });
}
