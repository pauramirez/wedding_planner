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
    // Audit: mask the RSVP secret value in the log — knowing it changed is
    // useful; storing the plaintext in a public-readable audit table is not.
    const auditAfter = k === "rsvp_secret" ? { key: k, value: "[redacted]" } : { key: k, value: changes[k] };
    const auditBefore = k === "rsvp_secret" && before?.value ? { ...before, value: "[redacted]" } : before;
    await record(env, user, "update", "setting", null, auditBefore, auditAfter);
  }
  // Reuse list() so the response filters rsvp_secret out of the visible settings.
  return list(env);
}
