// Thin fetch wrapper. Same-origin in production; Vite proxies /api in dev.
// All requests carry cookies for auth.

const BASE = import.meta.env.VITE_API_BASE || "";

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "content-type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body),
  patch: (path, body) => request("PATCH", path, body),
  del: (path) => request("DELETE", path)
};

// ----- Auth -----
export const auth = {
  me: () => api.get("/api/auth/me"),
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  register: (email, password, name) => api.post("/api/auth/register", { email, password, name }),
  logout: () => api.post("/api/auth/logout")
};

// ----- State (full snapshot for load + JSON import) -----
export const state = {
  snapshot: () => api.get("/api/state"),
  importJson: (data) => api.post("/api/state", data)
};

// ----- Resources -----
export const tasks = {
  list: () => api.get("/api/tasks"),
  create: (t) => api.post("/api/tasks", t),
  update: (id, patch) => api.patch(`/api/tasks/${id}`, patch),
  remove: (id) => api.del(`/api/tasks/${id}`)
};
export const guests = {
  create: (g) => api.post("/api/guests", g),
  update: (id, patch) => api.patch(`/api/guests/${id}`, patch),
  remove: (id) => api.del(`/api/guests/${id}`)
};
export const vendors = {
  create: (v) => api.post("/api/vendors", v),
  update: (id, patch) => api.patch(`/api/vendors/${id}`, patch),
  remove: (id) => api.del(`/api/vendors/${id}`)
};
export const gifts = {
  create: (g) => api.post("/api/gifts", g),
  update: (id, patch) => api.patch(`/api/gifts/${id}`, patch),
  remove: (id) => api.del(`/api/gifts/${id}`)
};
export const palette = {
  create: (c) => api.post("/api/palette", c),
  remove: (id) => api.del(`/api/palette/${id}`)
};
export const timeline = {
  create: (t) => api.post("/api/timeline", t),
  remove: (id) => api.del(`/api/timeline/${id}`)
};
export const settings = {
  update: (patch) => api.patch("/api/settings", patch)
};
