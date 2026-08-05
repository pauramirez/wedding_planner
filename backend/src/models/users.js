import { one, run } from "../lib/db.js";

export async function findByEmail(env, email) {
  return one(env, `SELECT id, email, password_hash, name FROM users WHERE email = ?`, [email]);
}

export async function findById(env, id) {
  return one(env, `SELECT id, email, name FROM users WHERE id = ?`, [id]);
}

export async function create(env, { email, passwordHash, name }) {
  const res = await run(
    env,
    `INSERT INTO users (email, password_hash, name) VALUES (?, ?, ?)`,
    [email, passwordHash, name]
  );
  return findById(env, res.lastRowId);
}
