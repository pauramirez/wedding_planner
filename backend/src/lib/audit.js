import { run } from "./db.js";

// One entry per write. `before`/`after` are the row snapshots; null is fine.
export async function record(env, user, action, resourceType, resourceId, before, after) {
  await run(
    env,
    `INSERT INTO activity_log (user_id, user_email, action, resource_type, resource_id, before_json, after_json)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      user?.id ?? null,
      user?.email ?? null,
      action,
      resourceType,
      resourceId ?? null,
      before ? JSON.stringify(before) : null,
      after ? JSON.stringify(after) : null
    ]
  );
}
