import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Notes from "../models/notes.js";

export async function list(env) {
  return json({ notes: await Notes.listAll(env) });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body || !body.content || !body.content.trim()) return error(400, "content required");
  const row = await Notes.create(env, { content: body.content.trim() });
  await record(env, user, "create", "note", row.id, null, row);
  return json({ note: row }, { status: 201 });
}

export async function update(env, request, user, id) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const before = await Notes.getById(env, id);
  if (!before) return error(404, "not found");
  const row = await Notes.update(env, id, body);
  await record(env, user, "update", "note", id, before, row);
  return json({ note: row });
}

export async function remove(env, request, user, id) {
  const before = await Notes.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "note", id, before, null);
  return ok();
}
