import { all, one, run, db } from "../lib/db.js";

export async function listAll(env) {
  return all(env, `SELECT id, hex, name FROM palette ORDER BY sort_order ASC, id ASC`);
}

export async function getById(env, id) {
  return one(env, `SELECT id, hex, name FROM palette WHERE id = ?`, [id]);
}

export async function create(env, { hex, name }) {
  // New colors go to the end of the palette by default.
  const max = await one(env, `SELECT COALESCE(MAX(sort_order), 0) AS m FROM palette`);
  const nextSort = (max?.m ?? 0) + 1;
  const res = await run(env, `INSERT INTO palette (hex, name, sort_order) VALUES (?, ?, ?)`, [hex, name, nextSort]);
  return getById(env, res.lastRowId);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM palette WHERE id = ?`, [id]);
  return before;
}

// Reorder the palette by writing new sort_order values for the given ids.
// Missing ids are ignored; extra ids are silently dropped.
export async function reorder(env, orderedIds) {
  const existing = await all(env, `SELECT id FROM palette`);
  const valid = new Set(existing.map((r) => r.id));
  const stmts = orderedIds
    .filter((id) => valid.has(id))
    .map((id, idx) => db(env).prepare(`UPDATE palette SET sort_order = ? WHERE id = ?`).bind(idx, id));
  if (stmts.length === 0) return listAll(env);
  await db(env).batch(stmts);
  return listAll(env);
}
