import { json, error, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Guests from "../models/guests.js";
import * as Settings from "../models/settings.js";

const ALLOWED_RSVP = new Set(["yes", "no", "pending"]);
const MEAL_MAX = 200;
const LOOKUP_FAIL_DELAY_MS = 400;

// Constant-time string comparison — same running time regardless of where a
// mismatch occurs, so timing analysis can't leak information about the secret.
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

// POST /api/rsvp/lookup — public. Body: { name, secret }.
// Only reveals a token when both the shared secret and the guest name match.
// Returns the same generic error message for either mismatch, so an attacker
// can't enumerate valid names.
export async function lookup(env, request) {
  const body = await readJson(request);
  if (!body || typeof body !== "object") return error(400, "invalid json");

  const name = String(body.name || "").trim();
  const secret = String(body.secret || "");
  if (!name || !secret) return error(400, "name and secret word required");
  if (name.length > 100 || secret.length > 200) return error(400, "input too long");

  const stored = await Settings.get(env, "rsvp_secret");
  const storedValue = String(stored?.value ?? "");
  if (!storedValue) return error(503, "shared RSVP is not enabled yet");

  const secretOk = timingSafeEqual(secret.trim(), storedValue.trim());
  // Look up regardless of secret validity so timing doesn't leak whether the
  // secret matched — always do the DB read.
  const guest = await Guests.findByName(env, name);

  if (!secretOk || !guest) {
    // Small delay to slow down brute-force attempts against the secret.
    await delay(LOOKUP_FAIL_DELAY_MS);
    return error(401, "we couldn't find that combination — please check your invitation");
  }

  return json({ token: guest.rsvpToken });
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
