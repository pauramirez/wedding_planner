// Small HTTP helpers so route handlers stay tidy.

export function json(data, init = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json;charset=UTF-8",
      "cache-control": "no-store",
      ...(init.headers || {})
    }
  });
}

export function error(status, message, extra = {}) {
  return json({ ok: false, error: message, ...extra }, { status });
}

export function ok(data = { ok: true }) {
  return json(data);
}

export function corsHeaders(env, request) {
  const origin = request.headers.get("origin") || "";
  const allowed = env.FRONTEND_ORIGIN || "";
  const matches = origin && origin === allowed;
  return {
    "access-control-allow-origin": matches ? origin : allowed,
    "access-control-allow-credentials": "true",
    "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "access-control-allow-headers": "content-type,authorization",
    "vary": "origin"
  };
}

export function withCors(response, env, request) {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders(env, request))) headers.set(k, v);
  return new Response(response.body, { status: response.status, headers });
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
