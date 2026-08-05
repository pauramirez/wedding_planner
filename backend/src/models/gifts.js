import { all, one, run } from "../lib/db.js";

export async function listAll(env) {
  return all(env, `SELECT id, recipient, role, idea, budget, status, notes FROM gifts ORDER BY id ASC`);
}

export async function getById(env, id) {
  return one(env, `SELECT id, recipient, role, idea, budget, status, notes FROM gifts WHERE id = ?`, [id]);
}

export async function create(env, g) {
  const res = await run(
    env,
    `INSERT INTO gifts (recipient, role, idea, budget, status, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [g.recipient, g.role || "Other", g.idea || null, g.budget ?? null, g.status || "idea", g.notes || null]
  );
  return getById(env, res.lastRowId);
}

export async function update(env, id, patch) {
  const current = await getById(env, id);
  if (!current) return null;
  const next = {
    recipient: patch.recipient ?? current.recipient,
    role: patch.role ?? current.role,
    idea: patch.idea ?? current.idea,
    budget: patch.budget ?? current.budget,
    status: patch.status ?? current.status,
    notes: patch.notes ?? current.notes
  };
  await run(
    env,
    `UPDATE gifts SET recipient=?, role=?, idea=?, budget=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [next.recipient, next.role, next.idea, next.budget, next.status, next.notes, id]
  );
  return getById(env, id);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM gifts WHERE id = ?`, [id]);
  return before;
}
