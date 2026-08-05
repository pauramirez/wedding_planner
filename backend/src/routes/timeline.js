import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Timeline from "../models/timeline.js";

export async function list(env, request, user, url) {
  const day = url.searchParams.get("day");
  const rows = day ? await Timeline.listByDay(env, day) : await Timeline.listAll(env);
  return json({ timeline: rows });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  if (!Timeline.validDay(body.day)) return error(400, "day must be van|col");
  if (!body.time || !body.activity) return error(400, "time and activity required");
  const row = await Timeline.create(env, body);
  await record(env, user, "create", "timeline", row.id, null, row);
  return json({ item: row }, { status: 201 });
}

export async function remove(env, request, user, id) {
  const before = await Timeline.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "timeline", id, before, null);
  return ok();
}
