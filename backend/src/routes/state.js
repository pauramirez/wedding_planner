// Compatibility layer: preserves the original /api/state contract.
// GET returns a full snapshot in the shape the original single-file app expected.
// POST accepts a JSON export from the old planner and merges it in.

import { json, error, readJson } from "../lib/http.js";
import { record } from "../lib/audit.js";
import * as Tasks from "../models/tasks.js";
import * as Guests from "../models/guests.js";
import * as Vendors from "../models/vendors.js";
import * as Gifts from "../models/gifts.js";
import * as Palette from "../models/palette.js";
import * as Timeline from "../models/timeline.js";
import * as Notes from "../models/notes.js";
import * as Settings from "../models/settings.js";

export async function snapshot(env) {
  const [tasks, guests, vendors, gifts, palette, tl, notes, settings] = await Promise.all([
    Tasks.listAll(env),
    Guests.listAll(env),
    Vendors.listAll(env),
    Gifts.listAll(env),
    Palette.listAll(env),
    Timeline.listAll(env),
    Notes.listAll(env),
    Settings.getAll(env)
  ]);
  return json({
    tasks,
    guests,
    vendors,
    gifts,
    palette,
    timelineVan: tl.filter((t) => t.day === "van"),
    timelineCol: tl.filter((t) => t.day === "col"),
    notes,
    weddingDates: {
      van: settings.wedding_date_van || "",
      col: settings.wedding_date_col || ""
    }
  });
}

export async function importSnapshot(env, request, user) {
  const data = await readJson(request);
  if (!data || typeof data !== "object") return error(400, "invalid json");

  for (const t of data.tasks || []) {
    if (!t?.title || !Tasks.validCat(t.cat)) continue;
    const row = await Tasks.create(env, t);
    await record(env, user, "create", "task", row.id, null, row);
  }
  for (const g of data.guests || []) {
    if (!g?.name) continue;
    const row = await Guests.create(env, g);
    await record(env, user, "create", "guest", row.id, null, row);
  }
  for (const v of data.vendors || []) {
    if (!v?.name || !v?.category) continue;
    const row = await Vendors.create(env, v);
    await record(env, user, "create", "vendor", row.id, null, row);
  }
  for (const gf of data.gifts || []) {
    if (!gf?.recipient) continue;
    const row = await Gifts.create(env, gf);
    await record(env, user, "create", "gift", row.id, null, row);
  }
  for (const c of data.palette || []) {
    if (!c?.hex || !c?.name) continue;
    const row = await Palette.create(env, c);
    await record(env, user, "create", "color", row.id, null, row);
  }
  for (const item of data.timelineVan || []) {
    if (!item?.time || !item?.activity) continue;
    const row = await Timeline.create(env, { ...item, day: "van" });
    await record(env, user, "create", "timeline", row.id, null, row);
  }
  for (const item of data.timelineCol || []) {
    if (!item?.time || !item?.activity) continue;
    const row = await Timeline.create(env, { ...item, day: "col" });
    await record(env, user, "create", "timeline", row.id, null, row);
  }
  for (const n of data.notes || []) {
    if (!n?.content || !n.content.trim()) continue;
    const row = await Notes.create(env, { content: n.content.trim() });
    await record(env, user, "create", "note", row.id, null, row);
  }
  if (data.weddingDates?.van !== undefined) {
    await Settings.set(env, "wedding_date_van", String(data.weddingDates.van || ""), user.id);
  }
  if (data.weddingDates?.col !== undefined) {
    await Settings.set(env, "wedding_date_col", String(data.weddingDates.col || ""), user.id);
  }
  return json({ ok: true });
}
