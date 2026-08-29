import { all, one, run } from "../lib/db.js";

export async function listAll(env) {
  return all(env, `SELECT id, content, created_at, updated_at FROM notes ORDER BY id DESC`);
}

export async function getById(env, id) {
  return one(env, `SELECT id, content, created_at, updated_at FROM notes WHERE id = ?`, [id]);
}

export async function create(env, n) {
  const res = await run(env, `INSERT INTO notes (content) VALUES (?)`, [n.content]);
  return getById(env, res.lastRowId);
}

export async function update(env, id, patch) {
  const current = await getById(env, id);
  if (!current) return null;
  const content = patch.content ?? current.content;
  await run(env, `UPDATE notes SET content=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`, [content, id]);
  return getById(env, id);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM notes WHERE id = ?`, [id]);
  return before;
}
