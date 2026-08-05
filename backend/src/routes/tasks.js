import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Tasks from "../models/tasks.js";

export async function list(env, request, user, url) {
  const cat = url.searchParams.get("cat");
  const rows = cat ? await Tasks.listByCat(env, cat) : await Tasks.listAll(env);
  return json({ tasks: rows });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  if (!body.title) return error(400, "title required");
  if (!Tasks.validCat(body.cat)) return error(400, "cat must be vancouver|colombia|shared");
  const row = await Tasks.create(env, body);
  await record(env, user, "create", "task", row.id, null, row);
  return json({ task: row }, { status: 201 });
}

export async function update(env, request, user, id) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const before = await Tasks.getById(env, id);
  if (!before) return error(404, "not found");
  const row = await Tasks.update(env, id, body);
  await record(env, user, "update", "task", id, before, row);
  return json({ task: row });
}

export async function remove(env, request, user, id) {
  const before = await Tasks.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "task", id, before, null);
  return ok();
}
