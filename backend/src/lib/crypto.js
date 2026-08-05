// PBKDF2 password hashing via the Web Crypto API — works in Workers with no deps.
// Format stored in DB: "pbkdf2$<iters>$<b64salt>$<b64hash>"

// Cloudflare Workers' Web Crypto caps PBKDF2 at 100k iterations. This is
// the maximum defense-in-depth we can get with the built-in API; going higher
// would require an Argon2 WASM build. 100k SHA-256 is still enough to make
// offline cracking meaningfully expensive per candidate.
const ITERATIONS = 100000;
const KEY_LEN_BITS = 256;

function b64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function derive(password, salt, iters = ITERATIONS) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: iters },
    key,
    KEY_LEN_BITS
  );
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derive(password, salt);
  return `pbkdf2$${ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(password, stored) {
  if (!stored?.startsWith("pbkdf2$")) return false;
  const [, itersStr, saltB64, hashB64] = stored.split("$");
  const iters = Number(itersStr) || ITERATIONS;
  const salt = fromB64(saltB64);
  const expected = fromB64(hashB64);
  const actual = await derive(password, salt, iters);
  if (actual.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) diff |= actual[i] ^ expected[i];
  return diff === 0;
}

export function randomToken(bytes = 32) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return b64(arr).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
}
