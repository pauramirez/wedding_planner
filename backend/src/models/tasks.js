import { all, one, run } from "../lib/db.js";

const CATS = new Set(["vancouver", "colombia", "shared"]);

export function validCat(cat) {
  return CATS.has(cat);
}

export async function listAll(env) {
  return all(env, `SELECT id, cat, title, owner, due, cost, status, notes FROM tasks ORDER BY id ASC`);
}

export async function listByCat(env, cat) {
  return all(
    env,
    `SELECT id, cat, title, owner, due, cost, status, notes
       FROM tasks WHERE cat = ? ORDER BY id ASC`,
    [cat]
  );
}

export async function getById(env, id) {
  return one(env, `SELECT * FROM tasks WHERE id = ?`, [id]);
}

export async function create(env, { cat, title, owner, due, cost, status, notes }) {
  const res = await run(
    env,
    `INSERT INTO tasks (cat, title, owner, due, cost, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [cat, title, owner || "Both", due || null, cost ?? null, status || "todo", notes || null]
  );
  return getById(env, res.lastRowId);
}

export async function update(env, id, patch) {
  const current = await getById(env, id);
  if (!current) return null;
  const next = {
    title: patch.title ?? current.title,
    owner: patch.owner ?? current.owner,
    due: patch.due ?? current.due,
    cost: patch.cost ?? current.cost,
    status: patch.status ?? current.status,
    notes: patch.notes ?? current.notes
  };
  await run(
    env,
    `UPDATE tasks SET title=?, owner=?, due=?, cost=?, status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [next.title, next.owner, next.due, next.cost, next.status, next.notes, id]
  );
  return getById(env, id);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM tasks WHERE id = ?`, [id]);
  return before;
}
