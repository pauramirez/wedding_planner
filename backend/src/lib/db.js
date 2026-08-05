// Thin wrapper over the D1 binding. Raw SQL only — no ORM.
// Every model calls these helpers with prepared statements.

export function db(env) {
  if (!env.DB) throw new Error("D1 binding 'DB' is not configured");
  return env.DB;
}

// Fetch one row or null.
export async function one(env, sql, params = []) {
  const stmt = db(env).prepare(sql).bind(...params);
  return stmt.first();
}

// Fetch many rows.
export async function all(env, sql, params = []) {
  const stmt = db(env).prepare(sql).bind(...params);
  const { results } = await stmt.all();
  return results ?? [];
}

// Run a mutation. Returns { changes, lastRowId }.
export async function run(env, sql, params = []) {
  const stmt = db(env).prepare(sql).bind(...params);
  const res = await stmt.run();
  return {
    changes: res.meta?.changes ?? 0,
    lastRowId: res.meta?.last_row_id ?? null
  };
}
