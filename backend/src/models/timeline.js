import { all, one, run } from "../lib/db.js";

const DAYS = new Set(["van", "col"]);
export function validDay(day) { return DAYS.has(day); }

export async function listByDay(env, day) {
  return all(
    env,
    `SELECT id, day, time, activity, owner FROM timeline WHERE day = ? ORDER BY time ASC, id ASC`,
    [day]
  );
}

export async function listAll(env) {
  return all(env, `SELECT id, day, time, activity, owner FROM timeline ORDER BY day, time, id`);
}

export async function getById(env, id) {
  return one(env, `SELECT id, day, time, activity, owner FROM timeline WHERE id = ?`, [id]);
}

export async function create(env, { day, time, activity, owner }) {
  const res = await run(
    env,
    `INSERT INTO timeline (day, time, activity, owner) VALUES (?, ?, ?, ?)`,
    [day, time, activity, owner || "Both"]
  );
  return getById(env, res.lastRowId);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM timeline WHERE id = ?`, [id]);
  return before;
}
