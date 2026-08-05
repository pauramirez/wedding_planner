import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Guests from "../models/guests.js";

export async function list(env) {
  return json({ guests: await Guests.listAll(env) });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body || !body.name) return error(400, "name required");
  const row = await Guests.create(env, body);
  await record(env, user, "create", "guest", row.id, null, row);
  return json({ guest: row }, { status: 201 });
}

export async function update(env, request, user, id) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const before = await Guests.getById(env, id);
  if (!before) return error(404, "not found");
  const row = await Guests.update(env, id, body);
  await record(env, user, "update", "guest", id, before, row);
  return json({ guest: row });
}

export async function remove(env, request, user, id) {
  const before = await Guests.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "guest", id, before, null);
  return ok();
}
