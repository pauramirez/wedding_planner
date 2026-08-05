import { all, one, run } from "../lib/db.js";

export async function listAll(env) {
  return all(env, `SELECT id, category, name, event, contact, price, status, notes FROM vendors ORDER BY id ASC`);
}

export async function getById(env, id) {
  return one(env, `SELECT id, category, name, event, contact, price, status, notes FROM vendors WHERE id = ?`, [id]);
}

export async function create(env, v) {
  const res = await run(
    env,
    `INSERT INTO vendors (category, name, event, contact, price, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [v.category, v.name, v.event || "Both", v.contact || null, v.price ?? null, v.status || "researching", v.notes || null]
  );
  return getById(env, res.lastRowId);
}

export async function update(env, id, patch) {
  const current = await getById(env, id);
  if (!current) return null;
  const next = {
    category: patch.category ?? current.category,
    name: patch.name ?? current.name,
    event: patch.event ?? current.event,
    contact: patch.contact ?? current.contact,
    price: patch.price ?? current.price,
    status: patch.status ?? current.status,
    notes: patch.notes ?? current.notes
  };
  await run(
    env,
    `UPDATE vendors SET category=?, name=?, event=?, contact=?, price=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [next.category, next.name, next.event, next.contact, next.price, next.status, next.notes, id]
  );
  return getById(env, id);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM vendors WHERE id = ?`, [id]);
  return before;
}
