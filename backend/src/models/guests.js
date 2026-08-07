import { all, one, run } from "../lib/db.js";
import { randomHexToken } from "../lib/tokens.js";

const GUEST_COLUMNS = `id, name, side, event, plus_one AS plusOne, table_num AS "table", contact, rsvp, meal, rsvp_token AS rsvpToken`;

export async function listAll(env) {
  return all(env, `SELECT ${GUEST_COLUMNS} FROM guests ORDER BY id ASC`);
}

export async function getById(env, id) {
  return one(env, `SELECT ${GUEST_COLUMNS} FROM guests WHERE id = ?`, [id]);
}

export async function findByToken(env, token) {
  return one(env, `SELECT ${GUEST_COLUMNS} FROM guests WHERE rsvp_token = ?`, [token]);
}

// Case-insensitive, whitespace-tolerant name lookup for the shared-QR flow.
export async function findByName(env, name) {
  return one(
    env,
    `SELECT ${GUEST_COLUMNS} FROM guests WHERE LOWER(TRIM(name)) = LOWER(TRIM(?))`,
    [name]
  );
}

export async function create(env, g) {
  const token = randomHexToken();
  const res = await run(
    env,
    `INSERT INTO guests (name, side, event, plus_one, table_num, contact, rsvp, meal, rsvp_token)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      g.name,
      g.side || "Both",
      g.event || "Both",
      g.plusOne || "No",
      g.table || null,
      g.contact || null,
      g.rsvp || "pending",
      g.meal || null,
      token
    ]
  );
  return getById(env, res.lastRowId);
}

export async function update(env, id, patch) {
  const current = await getById(env, id);
  if (!current) return null;
  const next = {
    name: patch.name ?? current.name,
    side: patch.side ?? current.side,
    event: patch.event ?? current.event,
    plusOne: patch.plusOne ?? current.plusOne,
    table: patch.table ?? current.table,
    contact: patch.contact ?? current.contact,
    rsvp: patch.rsvp ?? current.rsvp,
    meal: patch.meal ?? current.meal
  };
  await run(
    env,
    `UPDATE guests SET name=?, side=?, event=?, plus_one=?, table_num=?, contact=?, rsvp=?, meal=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [next.name, next.side, next.event, next.plusOne, next.table, next.contact, next.rsvp, next.meal, id]
  );
  return getById(env, id);
}

export async function updateByToken(env, token, patch) {
  const current = await findByToken(env, token);
  if (!current) return null;
  const next = {
    rsvp: patch.rsvp ?? current.rsvp,
    meal: patch.meal ?? current.meal
  };
  await run(
    env,
    `UPDATE guests SET rsvp=?, meal=?, updated_at=CURRENT_TIMESTAMP WHERE rsvp_token=?`,
    [next.rsvp, next.meal, token]
  );
  return findByToken(env, token);
}

export async function remove(env, id) {
  const before = await getById(env, id);
  if (!before) return null;
  await run(env, `DELETE FROM guests WHERE id = ?`, [id]);
  return before;
}
