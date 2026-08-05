import { json } from "../lib/http.js";
import { all } from "../lib/db.js";

export async function list(env, request, user, url) {
  const limit = Math.min(Number(url.searchParams.get("limit")) || 100, 500);
  const rows = await all(
    env,
    `SELECT id, user_email, action, resource_type, resource_id, created_at
       FROM activity_log ORDER BY id DESC LIMIT ?`,
    [limit]
  );
  return json({ activity: rows });
}
