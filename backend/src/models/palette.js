import { all, one, run } from "../lib/db.js";

export async function listAll(env) {
  return all(env, `SELECT id, hex, name FROM palette ORDER BY id ASC`);
}

export async function getById(env, id) {
  return one(env, `SELECT id, hex, name FROM palette WHERE id = ?`, [id]);
}

export async function create(env, { hex, name }) {
  const res = await run(env, `INSERT INTO palette (hex, name) VALUES (?, ?)`, [hex, name]);
  return getById(env, res.lastRowId);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM palette WHERE id = ?`, [id]);
  return before;
}
