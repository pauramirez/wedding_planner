import { all, one, run } from "../lib/db.js";

export async function getAll(env) {
  const rows = await all(env, `SELECT key, value FROM settings`);
  const out = {};
  for (const r of rows) out[r.key] = r.value ?? "";
  return out;
}

export async function get(env, key) {
  return one(env, `SELECT key, value FROM settings WHERE key = ?`, [key]);
}

export async function set(env, key, value, userId) {
  await run(
    env,
    `INSERT INTO settings (key, value, updated_at, updated_by) VALUES (?, ?, CURRENT_TIMESTAMP, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=CURRENT_TIMESTAMP, updated_by=excluded.updated_by`,
    [key, value ?? "", userId ?? null]
  );
  return { key, value: value ?? "" };
}
