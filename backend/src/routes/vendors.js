import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Vendors from "../models/vendors.js";

export async function list(env) {
  return json({ vendors: await Vendors.listAll(env) });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body || !body.name || !body.category) return error(400, "name and category required");
  const row = await Vendors.create(env, body);
  await record(env, user, "create", "vendor", row.id, null, row);
  return json({ vendor: row }, { status: 201 });
}

export async function update(env, request, user, id) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const before = await Vendors.getById(env, id);
  if (!before) return error(404, "not found");
  const row = await Vendors.update(env, id, body);
  await record(env, user, "update", "vendor", id, before, row);
  return json({ vendor: row });
}

export async function remove(env, request, user, id) {
  const before = await Vendors.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "vendor", id, before, null);
  return ok();
}
