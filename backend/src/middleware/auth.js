import { one, run } from "../lib/db.js";
import { randomToken } from "../lib/crypto.js";

const COOKIE_NAME = "wp_session";
const SESSION_TTL_DAYS = 30;

export function parseCookies(request) {
  const header = request.headers.get("cookie") || "";
  const out = {};
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (k) out[k] = decodeURIComponent(v.join("="));
  }
  return out;
}

export function sessionCookie(id, { clear = false } = {}) {
  // Same-origin (Worker serves both API + SPA), so Lax is safe and stricter
  // than None. HttpOnly stops XSS from reading it; Secure requires HTTPS.
  const attrs = [
    `${COOKIE_NAME}=${clear ? "" : id}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
    clear ? "Max-Age=0" : `Max-Age=${SESSION_TTL_DAYS * 24 * 60 * 60}`
  ];
  return attrs.join("; ");
}

export async function createSession(env, userId) {
  const id = randomToken(32);
  const expires = new Date(Date.now() + SESSION_TTL_DAYS * 86400 * 1000).toISOString();
  await run(env, `INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)`, [id, userId, expires]);
  return id;
}

export async function destroySession(env, id) {
  if (!id) return;
  await run(env, `DELETE FROM sessions WHERE id = ?`, [id]);
}

// Returns the authenticated user or null. Also lazily purges expired sessions.
export async function currentUser(env, request) {
  const cookies = parseCookies(request);
  const sid = cookies[COOKIE_NAME];
  if (!sid) return null;
  const row = await one(
    env,
    `SELECT u.id, u.email, u.name, s.expires_at
       FROM sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.id = ?`,
    [sid]
  );
  if (!row) return null;
  if (new Date(row.expires_at).getTime() < Date.now()) {
    await destroySession(env, sid);
    return null;
  }
  return { id: row.id, email: row.email, name: row.name, sessionId: sid };
}

export function requireAuth(user) {
  if (!user) {
    const err = new Error("unauthorized");
    err.status = 401;
    throw err;
  }
}
