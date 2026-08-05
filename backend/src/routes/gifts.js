import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Gifts from "../models/gifts.js";

export async function list(env) {
  return json({ gifts: await Gifts.listAll(env) });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body || !body.recipient) return error(400, "recipient required");
  const row = await Gifts.create(env, body);
  await record(env, user, "create", "gift", row.id, null, row);
  return json({ gift: row }, { status: 201 });
}

export async function update(env, request, user, id) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const before = await Gifts.getById(env, id);
  if (!before) return error(404, "not found");
  const row = await Gifts.update(env, id, body);
  await record(env, user, "update", "gift", id, before, row);
  return json({ gift: row });
}

export async function remove(env, request, user, id) {
  const before = await Gifts.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "gift", id, before, null);
  return ok();
}
