// Cloudflare Worker entry point. Node ESM, no TypeScript.
// Router pattern: match method+path, dispatch to a handler. No framework.

import { json, error, withCors, corsHeaders } from "./lib/http.js";
import { logger } from "./lib/dd.js";
import { currentUser, requireAuth } from "./middleware/auth.js";
import * as Auth from "./routes/auth.js";
import * as Tasks from "./routes/tasks.js";
import * as Guests from "./routes/guests.js";
import * as Vendors from "./routes/vendors.js";
import * as Gifts from "./routes/gifts.js";
import * as Palette from "./routes/palette.js";
import * as Timeline from "./routes/timeline.js";
import * as Settings from "./routes/settings.js";
import * as State from "./routes/state.js";
import * as Activity from "./routes/activity.js";

const PUBLIC = new Set(["POST /api/auth/register", "POST /api/auth/login", "GET /api/auth/me", "POST /api/auth/logout", "GET /api/health"]);

function idFromPath(path, prefix) {
  const rest = path.slice(prefix.length);
  const id = Number(rest);
  return Number.isFinite(id) && id > 0 ? id : null;
}

async function route(env, request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  const key = `${method} ${path}`;

  if (path === "/api/health") return json({ ok: true, ts: new Date().toISOString() });

  // Auth endpoints
  if (key === "POST /api/auth/register") return Auth.register(env, request);
  if (key === "POST /api/auth/login") return Auth.login(env, request);
  if (key === "POST /api/auth/logout") return Auth.logout(env, request);
  if (key === "GET /api/auth/me") return Auth.me(env, request);

  // Everything below requires a session.
  const user = await currentUser(env, request);
  if (!PUBLIC.has(key)) requireAuth(user);

  // Tasks
  if (key === "GET /api/tasks") return Tasks.list(env, request, user, url);
  if (key === "POST /api/tasks") return Tasks.create(env, request, user);
  if (method === "PATCH" && path.startsWith("/api/tasks/")) {
    const id = idFromPath(path, "/api/tasks/");
    return id ? Tasks.update(env, request, user, id) : error(400, "bad id");
  }
  if (method === "DELETE" && path.startsWith("/api/tasks/")) {
    const id = idFromPath(path, "/api/tasks/");
    return id ? Tasks.remove(env, request, user, id) : error(400, "bad id");
  }

  // Guests
  if (key === "GET /api/guests") return Guests.list(env);
  if (key === "POST /api/guests") return Guests.create(env, request, user);
  if (method === "PATCH" && path.startsWith("/api/guests/")) {
    const id = idFromPath(path, "/api/guests/");
    return id ? Guests.update(env, request, user, id) : error(400, "bad id");
  }
  if (method === "DELETE" && path.startsWith("/api/guests/")) {
    const id = idFromPath(path, "/api/guests/");
    return id ? Guests.remove(env, request, user, id) : error(400, "bad id");
  }

  // Vendors
  if (key === "GET /api/vendors") return Vendors.list(env);
  if (key === "POST /api/vendors") return Vendors.create(env, request, user);
  if (method === "PATCH" && path.startsWith("/api/vendors/")) {
    const id = idFromPath(path, "/api/vendors/");
    return id ? Vendors.update(env, request, user, id) : error(400, "bad id");
  }
  if (method === "DELETE" && path.startsWith("/api/vendors/")) {
    const id = idFromPath(path, "/api/vendors/");
    return id ? Vendors.remove(env, request, user, id) : error(400, "bad id");
  }

  // Gifts
  if (key === "GET /api/gifts") return Gifts.list(env);
  if (key === "POST /api/gifts") return Gifts.create(env, request, user);
  if (method === "PATCH" && path.startsWith("/api/gifts/")) {
    const id = idFromPath(path, "/api/gifts/");
    return id ? Gifts.update(env, request, user, id) : error(400, "bad id");
  }
  if (method === "DELETE" && path.startsWith("/api/gifts/")) {
    const id = idFromPath(path, "/api/gifts/");
    return id ? Gifts.remove(env, request, user, id) : error(400, "bad id");
  }

  // Palette
  if (key === "GET /api/palette") return Palette.list(env);
  if (key === "POST /api/palette") return Palette.create(env, request, user);
  if (method === "DELETE" && path.startsWith("/api/palette/")) {
    const id = idFromPath(path, "/api/palette/");
    return id ? Palette.remove(env, request, user, id) : error(400, "bad id");
  }

  // Timeline
  if (key === "GET /api/timeline") return Timeline.list(env, request, user, url);
  if (key === "POST /api/timeline") return Timeline.create(env, request, user);
  if (method === "DELETE" && path.startsWith("/api/timeline/")) {
    const id = idFromPath(path, "/api/timeline/");
    return id ? Timeline.remove(env, request, user, id) : error(400, "bad id");
  }

  // Settings
  if (key === "GET /api/settings") return Settings.list(env);
  if (key === "PATCH /api/settings") return Settings.update(env, request, user);

  // Full snapshot / import (compat with the original single-file app)
  if (key === "GET /api/state") return State.snapshot(env);
  if (key === "POST /api/state") return State.importSnapshot(env, request, user);

  // Activity log
  if (key === "GET /api/activity") return Activity.list(env, request, user, url);

  return error(404, "not found");
}

export default {
  async fetch(request, env, ctx) {
    const log = logger(env);
    const start = Date.now();
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env, request) });
    }

    let response;
    try {
      response = await route(env, request);
    } catch (err) {
      if (err.status === 401) {
        response = error(401, "unauthorized");
      } else {
        log.error("unhandled error", { path: url.pathname, err: String(err), stack: err.stack });
        response = error(500, "internal error");
      }
    }

    // Fire-and-forget access log (Datadog when key set, console otherwise).
    ctx.waitUntil(
      log.info("request", {
        method: request.method,
        path: url.pathname,
        status: response.status,
        duration_ms: Date.now() - start
      })
    );

    return withCors(response, env, request);
  }
};
