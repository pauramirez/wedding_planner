import { json, error, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Guests from "../models/guests.js";

const ALLOWED_RSVP = new Set(["yes", "no", "pending"]);
const MEAL_MAX = 200;

// GET /api/rsvp/:token — public, token-authenticated.
// Returns just enough info to render a personalized RSVP form.
export async function get(env, token) {
  const g = await Guests.findByToken(env, token);
  if (!g) return error(404, "invalid or expired RSVP link");
  return json({
    guest: {
      name: g.name,
      event: g.event,
      plusOne: g.plusOne,
      rsvp: g.rsvp,
      meal: g.meal
    }
  });
}

// POST /api/rsvp/:token — public, token-authenticated.
// Guests can only change their own rsvp and meal — no other fields.
export async function update(env, request, token) {
  const before = await Guests.findByToken(env, token);
  if (!before) return error(404, "invalid or expired RSVP link");
  const body = await readJson(request);
  if (!body || typeof body !== "object") return error(400, "invalid json");

  const rsvp = String(body.rsvp || "").toLowerCase();
  if (!ALLOWED_RSVP.has(rsvp)) return error(400, "rsvp must be yes, no, or pending");

  const meal = body.meal === undefined || body.meal === null
    ? before.meal
    : String(body.meal).slice(0, MEAL_MAX).trim();

  const after = await Guests.updateByToken(env, token, { rsvp, meal });

  // Audit as a guest self-service action, not an admin edit.
  await record(env, { id: null, email: `guest:${before.name}` }, "update", "guest", before.id, before, after);

  return json({
    ok: true,
    guest: { name: after.name, rsvp: after.rsvp, meal: after.meal }
  });
}
