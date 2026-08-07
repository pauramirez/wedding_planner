import { json, error, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Settings from "../models/settings.js";

const ALLOWED_KEYS = new Set(["wedding_date_van", "wedding_date_col", "rsvp_secret"]);

export async function list(env) {
  // Do not leak the RSVP secret in any read endpoint. Expose only whether
  // one is set so the admin UI knows what state the setting is in.
  const all = await Settings.getAll(env);
  const { rsvp_secret, ...safe } = all;
  return json({
    settings: safe,
    rsvp_secret_set: Boolean(rsvp_secret && String(rsvp_secret).trim())
  });
}

export async function update(env, request, user) {
  const body = await readJson(request);
  if (!body) return error(400, "invalid json");
  const changes = {};
  for (const [k, v] of Object.entries(body)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    const before = await Settings.get(env, k);
    await Settings.set(env, k, String(v ?? ""), user.id);
    changes[k] = String(v ?? "");
    await record(env, user, "update", "setting", null, before, { key: k, value: changes[k] });
  }
  return json({ settings: await Settings.getAll(env) });
}
