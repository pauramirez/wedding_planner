import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, randomToken } from "./crypto.js";

test("hashPassword produces a pbkdf2 string with salt + hash", async () => {
  const h = await hashPassword("correct horse battery staple");
  assert.ok(h.startsWith("pbkdf2$"));
  const parts = h.split("$");
  assert.equal(parts.length, 4);
  assert.ok(Number(parts[1]) >= 100000, "iteration count should be strong");
  assert.ok(parts[2].length > 10, "salt should be non-trivial");
  assert.ok(parts[3].length > 10, "hash should be non-trivial");
});

test("hashPassword produces a different hash each time (unique salt)", async () => {
  const a = await hashPassword("same-password");
  const b = await hashPassword("same-password");
  assert.notEqual(a, b);
});

test("verifyPassword returns true for the correct password", async () => {
  const stored = await hashPassword("s3cret-passphrase!");
  assert.equal(await verifyPassword("s3cret-passphrase!", stored), true);
});

test("verifyPassword returns false for a wrong password", async () => {
  const stored = await hashPassword("real-one");
  assert.equal(await verifyPassword("wrong-one", stored), false);
});

test("verifyPassword returns false for malformed stored value", async () => {
  assert.equal(await verifyPassword("anything", ""), false);
  assert.equal(await verifyPassword("anything", "not-a-hash"), false);
  assert.equal(await verifyPassword("anything", null), false);
});

test("randomToken is URL-safe and long enough for a session id", () => {
  const t = randomToken(32);
  assert.ok(t.length >= 40);
  assert.match(t, /^[A-Za-z0-9_-]+$/);
});

test("randomToken is unique across calls", () => {
  const seen = new Set();
  for (let i = 0; i < 100; i++) seen.add(randomToken(16));
  assert.equal(seen.size, 100);
});
