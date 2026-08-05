// Datadog logging helper. If DD_API_KEY isn't set (local dev, or before signup)
// this falls back to console.log — the app still runs.

export function logger(env, ctx = {}) {
  const base = {
    service: env.DD_SERVICE || "wedding-planner-api",
    env: env.DD_ENV || "dev",
    ...ctx
  };

  const emit = async (level, message, extra = {}) => {
    const payload = {
      ...base,
      ...extra,
      level,
      message,
      timestamp: new Date().toISOString()
    };
    // Local / no-key fallback — Workers streams stdout to `wrangler tail`.
    console.log(JSON.stringify(payload));
    if (!env.DD_API_KEY) return;
    try {
      await fetch(`https://http-intake.logs.${env.DD_SITE || "datadoghq.com"}/api/v2/logs`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "dd-api-key": env.DD_API_KEY
        },
        body: JSON.stringify(payload)
      });
    } catch {
      // never let observability break the response
    }
  };

  return {
    info: (msg, extra) => emit("info", msg, extra),
    warn: (msg, extra) => emit("warn", msg, extra),
    error: (msg, extra) => emit("error", msg, extra)
  };
}
