import { json, error, ok, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Palette from "../models/palette.js";

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

export async function list(env) {
  return json({ palette: await Palette.listAll(env) });
}

export async function create(env, request, user) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const hex = String(body.hex || "").trim();
  const name = String(body.name || "").trim();
  if (!HEX_RE.test(hex)) return error(400, "hex must be #RRGGBB");
  if (!name) return error(400, "name required");
  const row = await Palette.create(env, { hex, name });
  await record(env, user, "create", "color", row.id, null, row);
  return json({ color: row }, { status: 201 });
}

export async function remove(env, request, user, id) {
  const before = await Palette.remove(env, id);
  if (!before) return error(404, "not found");
  await record(env, user, "delete", "color", id, before, null);
  return ok();
}
