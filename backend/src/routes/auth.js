import { json, ok, error, readJson } from "../lib/http.js";
import { hashPassword, verifyPassword } from "../lib/crypto.js";
import { createSession, destroySession, sessionCookie, currentUser } from "../middleware/auth.js";
import * as Users from "../models/users.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(env, request) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json body");
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const name = String(body.name || "").trim();
  if (!EMAIL_RE.test(email)) return error(400, "invalid email");
  if (password.length < 8) return error(400, "password must be at least 8 characters");
  if (!name) return error(400, "name required");
  const existing = await Users.findByEmail(env, email);
  if (existing) return error(409, "email already registered");
  const passwordHash = await hashPassword(password);
  const user = await Users.create(env, { email, passwordHash, name });
  const sid = await createSession(env, user.id);
  return json({ ok: true, user }, { headers: { "set-cookie": sessionCookie(sid) } });
}

export async function login(env, request) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json body");
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const row = await Users.findByEmail(env, email);
  if (!row) return error(401, "invalid email or password");
  const good = await verifyPassword(password, row.password_hash);
  if (!good) return error(401, "invalid email or password");
  const sid = await createSession(env, row.id);
  return json(
    { ok: true, user: { id: row.id, email: row.email, name: row.name } },
    { headers: { "set-cookie": sessionCookie(sid) } }
  );
}

export async function logout(env, request) {
  const user = await currentUser(env, request);
  if (user) await destroySession(env, user.sessionId);
  return json({ ok: true }, { headers: { "set-cookie": sessionCookie("", { clear: true }) } });
}

export async function me(env, request) {
  const user = await currentUser(env, request);
  if (!user) return json({ user: null });
  return json({ user: { id: user.id, email: user.email, name: user.name } });
}
